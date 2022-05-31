import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../../redux/actions';


class HelpIconView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    getHelpItem(helpItemName) {
        const props      = this.props;
        const resultHelp = {
            'pending_balance'             : {
                'title': 'pending balance',
                'body' : <ul>
                    <li>
                        transactions appear as pending and included in pending
                        balance until they are validated by your node. you can
                        find a list of your pending transactions on this <a
                        className={''}
                        onClick={() => this.props.history.push('/unspent-transaction-output-list/pending')}>page</a>
                    </li>
                    <li>
                        it should not take more than 10-15 minutes to validate
                        transaction. if you observe pending balance for a longer
                        period of time it is recommended to restart your
                        node/browser
                    </li>
                    <li>
                        if step above didn't help it may help to perform reset
                        validation on this <a className={''}
                                              onClick={() => this.props.history.push('/actions')}>page</a>
                    </li>
                </ul>
            },
            'network_state'               : {
                'title': 'network state',
                'body' : <ul>
                    <li>
                        if your node is public it is more likely that you will
                        receive transaction fees
                    </li>
                    <li>
                        if your node is private you can still send and receive
                        transactions
                    </li>
                    <li>
                        if your node is private you will still receive payments
                        from advertisers
                    </li>
                    <li>
                        if you node is private you can use port forwarding on
                        your router to make your node public. you can edit your
                        node's network configuration <a className={''}
                                                        onClick={() => this.props.history.push('/config/network')}>here</a>
                    </li>
                </ul>
            },
            'transaction_max_input_number': {
                'title': 'transaction maximum input number',
                'body' : <ul>
                    <li>
                        the millix protocol limits each transaction to be funded by a maximum of 128 inputs
                    </li>
                    <li>
                        you can resolve this situation by aggregating your unspents manually before you send a large amount
                    </li>
                    <li>
                        you can aggregate your unspents manually by sending transactions to yourself
                    </li>
                    <li>
                        you can aggregate your unspents on this <a className={''} onClick={() => this.props.history.push('/actions')}>page</a>
                    </li>
                </ul>
            },
            'primary_address'             : {
                'title': 'primary address',
                'body' : <ul>
                    <li>
                        is the first address created by a new wallet
                    </li>
                    <li>
                        is the address announced by your node to the network
                    </li>
                    <li>
                        is the address where you receive transaction fees when
                        selected as a proxy
                    </li>
                    <li>
                        is the address where you receive advertisement payments
                    </li>
                    <li>
                        click <a
                        className={''}
                        onClick={() => this.props.history.push('/address-list')}>here</a> to
                        create new addresses and view existing addresses
                    </li>
                </ul>
            },
            'transaction_output'          : {
                'title': 'transaction output',
                'body' : <ul>
                    <li>
                        transaction outputs indicate an amount and an address
                        that millix was sent to
                    </li>
                    <li>
                        outputs in position -1 are the transaction fee that the
                        sender paid
                    </li>
                    <li>
                        there can be multiple outputs sent to multiple
                        recipients in a transaction
                    </li>
                    <li>
                        this can cause the total transaction amount to be larger
                        than the payment received by a specific address
                    </li>
                    <li>
                        when the sum of the inputs exceeds the fee and the
                        amount the sender is paying to recipients, an additional
                        output is created to send change back to the sender's
                        address
                    </li>
                </ul>
            },
            'transaction_input'           : {
                'title': 'transaction input',
                'body' : <ul>
                    <li>
                        transaction inputs are what the sender uses to fund a
                        transaction
                    </li>
                    <li>
                        there can be multiple inputs used to fund a transaction
                    </li>
                    <li>
                        inputs are related to transactions previously received
                        by the sender
                    </li>
                </ul>
            },
            'transaction_status'          : {
                'title': 'transaction status',
                'body' : <ul>
                    <li>
                        pending hibernation - this transaction was received less
                        than 10 minutes ago and may change.
                    </li>
                    <li>
                        hibernated - this transaction is hibernating and will
                        not change. before it can be used to fund a new
                        transaction it will be used to fund a refresh
                        transaction which will be validated by the network
                    </li>
                    <li>
                        invalid - there is something wrong with this
                        transaction. it could be improperly formatted
                    </li>
                </ul>
            },
            'key_identifier'              : {
                'title': 'key identifier',
                'body' : <ul>
                    <li>
                        key identifier is contained within each address available to the wallet
                    </li>
                    <li>
                        it identifies the wallet
                    </li>
                    <li>
                        wallet and all the addresses are associated with the key identifier
                    </li>
                </ul>
            },
            'full_node'                   : {
                'title': 'full node',
                'body' : <ul>
                    <li>
                        it is not required to send and receive transactions or receive payments from advertisers
                    </li>
                    <li>
                        it is recommended for devices with good bandwidth availability as it strengthens the millix network
                    </li>
                    <li>
                        it increases your ability and efficiency to earn fees from the millix network
                    </li>
                </ul>
            },
            'full_storage'                : {
                'title': 'full storage',
                'body' : <ul>
                    <li>
                        it defines whether your node save files related to every transaction or related only to your transactions
                    </li>
                    <li>
                        it is not required to send and receive transactions or receive payments
                    </li>
                </ul>
            },
            'transaction_fee_default'     : {
                'title': 'default fee',
                'body' : <ul>
                    <li>
                        default fee you are willing to pay to send transaction
                    </li>
                </ul>
            },
            'transaction_fee_proxy'       : {
                'title': 'minimum proxy fee',
                'body' : <ul>
                    <li>
                        minimum fee your node will accept to verify transaction if it is chosen as proxy
                    </li>
                </ul>
            },
            'buy_and_sell'                : {
                'title': 'buy & sell millix',
                'body' : <ul>
                    <li>
                        go to <a href="" onClick={() => window.open('https://millix.com', '_blank').focus()}>millix.com</a> and trade millix for
                        bitcoin with zero fees
                    </li>
                </ul>
            },
            'node_ip'                     : {
                'title': 'node ip',
                'body' : <ul>
                    <li>
                        ip your node is listening to receive connections from other peers in the network
                    </li>
                </ul>
            },
            'api_port'                    : {
                'title': 'api port',
                'body' : <ul>
                    <li>
                        port your node is listening to receive API requests
                    </li>
                    <li>
                        API can be used for integration with external applications
                    </li>
                </ul>
            },
            'max_connections_in'          : {
                'title': 'max connections in',
                'body' : <ul>
                    <li>
                        maximum number of connections your node accepts from other (public or private) peers in the network
                    </li>
                </ul>
            },
            'max_connections_out'         : {
                'title': 'max connections out',
                'body' : <ul>
                    <li>
                        maximum number of connections your node will try to establish with public nodes in the network
                    </li>
                </ul>
            },
            'initial_peer_list'           : {
                'title': 'initial peer list',
                'body' : <ul>
                    <li>
                        it is list of peers to which your node will connect first
                    </li>
                    <li>
                        peer list is not limited to initial peer list
                    </li>
                </ul>
            },
            'verified_sender'             : {
                'title': 'verified sender',
                'body' : <ul>
                    <li>
                        anyone with a domain name can send a verified message on the tangled network
                    </li>
                    <li>
                        this allows the recipient of your message to trust your identity
                    </li>
                    <li>
                        to become verified modify the DNS for your domain name with a TXT entry
                    </li>
                    <li>
                        name the TXT entry @
                    </li>
                    <li>
                        place the following in the TXT value: tangled={props.wallet.address_key_identifier}
                    </li>
                    <li>
                        DNS changes can take some time to take effect
                    </li>
                    <li>
                        to compose a message as a verified sender type your domain name (yourdomain.com) in the verified sender field
                    </li>
                </ul>
            },
            'message_payment'             : {
                'title': 'message payment',
                'body' : <ul>
                    <li>
                        tangled messages are like other millix transactions and contain the message as associated data
                    </li>
                    <li>
                        like a normal transaction, each message requires a payment
                    </li>
                    <li>
                        recipients are able to filter messages based on the amount sent with the message
                    </li>
                </ul>
            }
        };
        let helpItem     = false;
        if (Object.keys(resultHelp).includes(helpItemName)) {
            helpItem = resultHelp[helpItemName];
        }

        return helpItem;
    }

    render() {
        const helpItem = this.getHelpItem(this.props.help_item_name);
        if (!helpItem) {
            return '';
        }

        const popoverFocus = (
            <Popover id="popover-basic">
                <Popover.Header>
                    <div className={'page_subtitle'}>
                        {helpItem.title}
                    </div>
                </Popover.Header>
                <Popover.Body>{helpItem.body}</Popover.Body>
            </Popover>
        );

        return (
            <>
                <OverlayTrigger
                    trigger={['click']}
                    placement="auto"
                    overlay={popoverFocus}
                >
                    <span className={'help_icon'}>
                    <FontAwesomeIcon
                        icon="chevron-down"
                        size="1x"/>
                        </span>
                </OverlayTrigger>
            </>
        );
    }
}


HelpIconView.propTypes = {
    help_item_name: PropTypes.any
};

export default connect(
    state => ({
        wallet: state.wallet
    }), {
        updateNetworkState
    })(withRouter(HelpIconView));
