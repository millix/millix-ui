import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import * as format from '../helper/format';
import {boolLabel} from '../helper/format';
import API from '../api';
import * as text from '../helper/text';
import ResetTransactionValidationView from './utils/reset-transaction-validation-view';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            transaction_list          : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.updaterHandler = setInterval(() => this.reloadDatatable, 60000);
    }

    componentWillUnmount() {
        clearInterval(this.updaterHandler);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.getTransactionHistory(this.props.wallet.address_key_identifier).then(data => {
            const rows = data.map((transaction, idx) => ({
                idx         : data.length - idx,
                date        : format.date(transaction.transaction_date),
                amount      : transaction.amount,
                txid        : transaction.transaction_id,
                stable_date : format.date(transaction.stable_date),
                parent_date : format.date(transaction.parent_date),
                double_spend: boolLabel(transaction.is_double_spend),
                action      : <>
                    <DatatableActionButtonView
                        history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
                        history_state={[transaction]}
                        icon={'eye'}/>
                    <DatatableActionButtonView
                        icon={'rotate-left'}
                        title={'reset validation'}
                        callback={() => this.resetTransactionValidationRef.toggleConfirmationModal(transaction.transaction_id)}
                        callback_args={transaction.transaction_id}
                    />
                </>
            }));

            this.setState({
                transaction_list          : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
        const confirmationModalBodySingle = <>
            <div>continuing will force your node to revalidate transaction</div>
            <div>{this.state.reset_transaction_id}</div>
            {text.getConfirmationModalQuestion()}
        </>;

        return (
            <div>
                <ResetTransactionValidationView onRef={instance => this.resetTransactionValidationRef = instance}/>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>transactions</div>
                    <div className={'panel-body'}>
                        <Row id={'txhistory'}>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}

                                value={this.state.transaction_list}
                                sortField={'date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'date'
                                    },
                                    {
                                        field : 'amount',
                                        format: 'amount'
                                    },
                                    {
                                        field : 'txid',
                                        header: 'transaction id'
                                    },
                                    {
                                        field: 'stable_date'
                                    },
                                    {
                                        field: 'double_spend'
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(TransactionHistoryView));
