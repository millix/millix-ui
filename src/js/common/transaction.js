import API from '../api';
import async from 'async';
import UserInterfaceError from '../components/utils/user-interface-error';
import Translation from './translation';


class Transaction {

    verifyAddress(transactionParams) {
        return new Promise((resolve, reject) => {
            const verifiedAddresses = [];
            async.eachSeries(transactionParams.addresses, (address, callback) => {
                API.verifyAddress(address)
                   .then(data => {
                       if (!data.is_valid) {
                           callback({
                               name   : 'address_invalid',
                               message: Translation.getPhrase('d1cb37b00')
                           });
                       }
                       else {
                           verifiedAddresses.push(data);
                           callback();
                       }
                   });
            }, (err) => {
                if (err) {
                    return reject(err);
                }

                const data = {
                    ...transactionParams,
                    error_list  : [],
                    address_list: verifiedAddresses
                };
                delete data['addresses'];
                resolve(data);
            });
        });
    }

    sendTransaction(transactionOutputPayload, withData = false, isBinary = false) {
        return new Promise((resolve, reject) => {
            API.sendTransaction(transactionOutputPayload, withData, isBinary).then(data => {
                if (data.api_status === 'fail') {
                    return Promise.reject(data);
                }
                return data;
            }).then(data => {
                resolve(this.handleSuccessResponse(data, transactionOutputPayload.transaction_output_list[0].address_base.startsWith('1')));
            }).catch((e) => {
                reject(this.handleErrorResponse(e));
            });
        });
    }

    getModalBodySuccessResult(transaction_id) {
        return <div>
            <div>
                {Translation.getPhrase('5f1b2091b')}
            </div>
            <div>
                {transaction_id}
            </div>
        </div>;
    }

    handleErrorResponse(e) {
        let sendTransactionErrorMessage;
        let error_list = [];
        if (e !== 'validation_error') {
            if (e && e.api_message) {
                sendTransactionErrorMessage = <UserInterfaceError api_message={e.api_message}/>;
            }
            else {
                sendTransactionErrorMessage = `${Translation.getPhrase('49f49cb18')}: (${e?.api_message?.error.error || e?.api_message?.error || e?.message || e?.api_message || e || Translation.getPhrase('b4067b95d')})`;
            }

            error_list.push({
                name   : 'sendTransactionError',
                message: sendTransactionErrorMessage
            });
        }

        return {
            error_list: error_list,
            sending   : false,
            canceling : false
        };
    }

    handleSuccessResponse(data, isMainNet = true) {
        const transaction = data.transaction.find(item => {
            return item.version.indexOf(isMainNet ? '0a' : 'la') !== -1;
        });

        return {
            sending                 : false,
            fee_input_locked        : true,
            amount                  : '',
            subject                 : '',
            message                 : '',
            image                   : null,
            destination_address_list: [],
            address_verified_list   : [],
            modal_body_send_result  : this.getModalBodySuccessResult(transaction.transaction_id)
        };
    }
}


const _Transaction = new Transaction();
export default _Transaction;
