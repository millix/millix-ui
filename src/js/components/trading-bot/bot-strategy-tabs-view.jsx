import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Badge, Button, Col, Row, Tab, Tabs} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import BotNewConstantStrategyModel from './bot-new-constant-strategy-model';
import BotNewPriceChangeStrategyModel from './bot-new-price-change-strategy-model';
import Api from '../../api';
import {millix, number} from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import * as text from '../../helper/text';


class BotStrategyTabsView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show_model                  : undefined,
            selectedStrategyType        : 'strategy-constant',
            lastUpdateTime              : Date.now(),
            selectedStrategy            : undefined,
            'strategy-constant-data'    : [],
            'strategy-price-change-data': []
        };

        this.updateTimeoutHandler = undefined;

    }

    componentDidMount() {
        this.update();
    }

    componentWillUnmount() {
        clearTimeout(this.updateTimeoutHandler);
    }

    update() {
        clearTimeout(this.updateTimeoutHandler);
        Api.listStrategies(this.state.selectedStrategyType)
           .then(data => {
               const strategyList = data.strategy_list;
               strategyList.forEach((strategy) => {
                   if (strategy.extra_config) {
                       const extraConfig                = JSON.parse(strategy.extra_config);
                       strategy.time_frequency          = extraConfig.frequency;
                       strategy.time_frame              = extraConfig.time_frame;
                       strategy.price_change_percentage = extraConfig.price_change_percentage;
                   }

                   strategy.action = <>
                       <DatatableActionButtonView
                           icon={`fa-solid ${strategy.status === 1 ? 'fa-pause' : 'fa-play'}`}
                           callback={() => Api.upsertStrategy(strategy.strategy_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, strategy.status === 1 ? 2 : 1).then(() => this.update())}
                           callback_args={[]}
                       />
                       <DatatableActionButtonView
                           icon={'fa-solid fa-pencil'}
                           callback={() => this.setState({
                               show_model      : strategy.strategy_type,
                               selectedStrategy: strategy
                           })}
                           callback_args={[]}
                       />
                       <DatatableActionButtonView
                           icon={'trash'}
                           callback={() => this.setState({
                               modalShowDeleteStrategy: true,
                               selectedStrategy       : strategy
                           })}
                           callback_args={[]}
                       />
                   </>;
               });

               this.setState({
                   lastUpdateTime                             : Date.now(),
                   [`${this.state.selectedStrategyType}-data`]: strategyList
               });
               this.updateTimeoutHandler = setTimeout(() => this.update(), 10000);
           })
           .catch(() => {
               this.updateTimeoutHandler = setTimeout(() => this.update(), 10000);
           });
    }

    getApiKeyMasked() {
        const apiKey = this.props.apiKey;
        return [
            apiKey.substring(0, 3),
            '*************************',
            apiKey.substring(apiKey.length - 4)
        ].join('');
    }

    render() {
        const commonFields = [
            {
                field : 'strategy_description',
                header: `description`
            },
            {
                field : 'order_type',
                header: `type`
            },
            {
                field : 'amount',
                header: `amount`,
                body  : (item) => millix(item.amount, false)
            },
            {
                field : 'price_min',
                header: `minimum price`,
                body  : (item) => item?.price_min?.toFixed(9)
            },
            {
                field : 'price_max',
                header: `maximum price`,
                body  : (item) => item?.price_max?.toFixed(9)
            },
            {
                field : 'amount_traded',
                header: `amount traded`,
                body  : (item) => millix(item.amount_traded, false)
            },
            {
                field : 'total_budget',
                header: `total budget`,
                body  : (item) => millix(item.total_budget, false)
            },
        ];
        return <>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    <Row>
                        <Col>
                            {`bot strategies`}
                        </Col>
                        <Col style={{textAlign: 'right'}}>
                            <Button variant="outline-primary"
                                    size={'sm'}
                                    onClick={() => this.props.onConfigureKey()}>
                                <small style={{fontSize: '14px'}}>api key: <Badge>{this.getApiKeyMasked()}</Badge></small>
                            </Button>
                        </Col>
                    </Row>
                </div>
                <div className={'panel-body'}>
                    <p>
                        {`configure and execute your bot strategies`}
                    </p>
                    <ModalView show={this.state.modalShowDeleteStrategy}
                               size={'lg'}
                               heading={`delete strategy`}
                               on_close={() => this.setState({
                                   modalShowDeleteStrategy: false,
                                   selectedStrategy       : undefined
                               })}
                               on_accept={() => {
                                   Api.upsertStrategy(this.state.selectedStrategy.strategy_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0)
                                      .then(() => {
                                          this.setState({
                                              modalShowDeleteStrategy: false,
                                              selectedStrategy       : undefined
                                          });
                                          this.update();
                                      });
                               }}
                               body={<div>
                                   <div>{`you are about to delete the strategy "${this.state.selectedStrategy?.strategy_description}"`}</div>
                                   {text.get_confirmation_modal_question()}
                               </div>}/>
                    <ModalView
                        show={!!this.state.show_model}
                        size={'lg'}
                        prevent_close_after_accept={true}
                        on_close={() => {
                            this.setState({
                                show_model      : false,
                                selectedStrategy: undefined
                            });
                        }}
                        on_accept={async() => {
                            let success = false;
                            if (this.state.show_model === 'strategy-constant') {
                                success = await this.constant_strategy_modal.save();
                            }
                            else {
                                success = await this.price_change_strategy_modal.save();
                            }
                            if (success) {
                                this.setState({
                                    show_model      : false,
                                    selectedStrategy: undefined
                                });
                                this.update();
                            }
                        }}
                        heading={`${this.state.show_model === 'strategy-constant' ? 'constant strategy' : 'price change strategy'}`}
                        body={
                            <>
                                {this.state.show_model === 'strategy-constant' &&
                                 <BotNewConstantStrategyModel strategyType="strategy-constant" strategyData={this.state.selectedStrategy}
                                                              ref={c => this.constant_strategy_modal = c}/>}
                                {this.state.show_model === 'strategy-price-change' &&
                                 <BotNewPriceChangeStrategyModel strategyType="strategy-price-change" strategyData={this.state.selectedStrategy}
                                                                 ref={c => this.price_change_strategy_modal = c}/>}
                            </>
                        }/>
                    <Tabs
                        defaultActiveKey="strategy-constant"
                        transition={false}
                        id="bot-tab-strategies"
                        className="mb-3"
                        onSelect={(strategy) => {
                            this.setState({selectedStrategyType: strategy}, () => this.update());
                        }}
                    >
                        <Tab eventKey="strategy-constant" title={'constant strategy'}>
                            <DatatableView
                                reload_datatable={() => this.update()}
                                loading={false}
                                datatable_reload_timestamp={this.state.lastUpdateTime}
                                action_button={{
                                    label   : `new strategy`,
                                    on_click: () => this.setState({show_model: 'strategy-constant'})
                                }}
                                value={this.state['strategy-constant-data']}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    ...commonFields,
                                    {
                                        field : 'time_frequency',
                                        header: `time frequency`,
                                        body  : (item) => number(item.time_frequency)
                                    },
                                    {
                                        field : 'status',
                                        header: `status`,
                                        body  : (item) => item.status === 1 ? 'running' : 'paused'
                                    }
                                ]}
                            />
                        </Tab>

                        <Tab eventKey="strategy-price-change" title={'price change strategy'}>
                            <DatatableView
                                reload_datatable={() => this.update()}
                                loading={false}
                                datatable_reload_timestamp={this.state.lastUpdateTime}
                                action_button={{
                                    label   : `new strategy`,
                                    on_click: () => this.setState({show_model: 'strategy-price-change'})
                                }}
                                value={this.state['strategy-price-change-data']}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    ...commonFields,
                                    {
                                        field : 'price_change_percentage',
                                        header: `change percentage`,
                                        body  : (item) => number(item.price_change_percentage)
                                    },
                                    {
                                        field : 'time_frame',
                                        header: `time frame`,
                                        body  : (item) => number(item.time_frame)
                                    },
                                    {
                                        field : 'status',
                                        header: `status`,
                                        body  : (item) => item.status === 1 ? 'running' : 'paused'
                                    }
                                ]}
                            />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </>;
    }
}


export default withRouter(BotStrategyTabsView);
