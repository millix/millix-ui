import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import * as validate from '../../helper/validate';
import * as format from '../../helper/format';
import API from '../../api';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import HelpIconView from '../utils/help-icon-view';
import * as helper_message from '../../helper/message';


class MessageView extends Component {
    constructor(props) {
        super(props);

        if (props?.location?.state?.dns) {
            this.state = {};
        }
        else {
            this.state = {
                dnsValidated: false,
                dns         : ''
            };
        }
    }

    componentDidMount() {
        if (this.props?.location?.state?.dns) {
            this.verifyDNS(this.props?.location?.state?.dns, this._getAddressKeyIdentifier(this.props.location.state.address_from));
        }
    }

    reply() {
        this.props.history.push('/message-compose/', this.props.location.state);
    }

    _getAddressKeyIdentifier(address) {
        if (!address) {
            return null;
        }
        if (address.startsWith('1')) {
            return address.split('0a0')[1];
        }
        else {
            return address.split('lal')[1];
        }
    }

    verifyDNS(dns, addressKeyIdentifier) {
        dns = validate.domainName('dns', dns, []);
        if (dns === null) {
            this.setState({
                dnsValidated: false,
                dns
            });
        }
        else {
            API.isDNSVerified(dns, addressKeyIdentifier)
               .then(data => {
                   this.setState({
                       dnsValidated: data.is_address_verified,
                       dns
                   });
               })
               .catch(() => {
                   this.setState({
                       dnsValidated: false,
                       dns
                   });
               });
        }
    }

    render() {
        const data = this.props.location.state;

        let senderVerified = '';
        if (this.state.dns) {
            let className = '';
            let icon      = '';
            if (this.state.dnsValidated) {
                className      = 'text-success';
                icon           = 'check-circle';
                senderVerified = <div className={className + ' labeled form-group'}>
                    <FontAwesomeIcon
                        icon={icon}
                        size="1x"/>
                    <span>{this.state.dns}</span><HelpIconView help_item_name={'verified_sender'}/>
                </div>;
            }
        }

        let messageSubject = helper_message.getSubjectHtml(data);

        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered d-flex'}>
                                {messageSubject}

                                <div className={'ms-auto message_subject_action_container'}>
                                    <div className={'text-end message_subject_date'}>
                                        {data.date} utc
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        className={'btn-xs icon_only labeled'}
                                        onClick={() => this.reply()}>
                                        <FontAwesomeIcon
                                            icon={'reply'}
                                            size="1x"/>
                                        reply
                                    </Button>
                                </div>
                            </div>
                            <div className={'panel-body'}>
                                <Row>
                                    <Form>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <Row>
                                                    <Col>
                                                        <table>
                                                            <tbody>
                                                            <tr>
                                                                <td className={'text-white'}>
                                                                    from:
                                                                </td>
                                                                <td>
                                                                    {data.address_from}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                </td>
                                                                <td>
                                                                    {senderVerified}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className={'text-white'}>
                                                                    to:
                                                                </td>
                                                                <td>
                                                                    {data.address_to}
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                    </Col>
                                                    <Col>
                                                        <div className={'text-end'}>
                                                            payment: {format.millix(data.amount)}
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Form.Group>
                                        </Col>
                                        <hr/>
                                        <Col>
                                            <pre className={'message_view_text'}>
                                                {data.message}
                                            </pre>
                                        </Col>
                                        <Col className={'d-flex justify-content-center mt-5'}>
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => this.reply()}>
                                                <FontAwesomeIcon
                                                    icon={'reply'}
                                                    size="1x"/>
                                                reply
                                            </Button>
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default withRouter(MessageView);
