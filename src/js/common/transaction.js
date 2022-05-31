import API from '../api';
import * as text from '../helper/text';
import async from 'async';


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
                               message: 'valid address is required'
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

                resolve({
                    error_list  : [],
                    address_list: verifiedAddresses,
                    amount      : transactionParams.amount,
                    fee         : transactionParams.fee,
                    subject     : transactionParams.subject,
                    message     : transactionParams.message,
                    dns         : transactionParams.dns
                });
            });
        });
    }

    sendTransaction(transactionOutputPayload, withData = false) {
        return new Promise((resolve, reject) => {
            API.sendTransaction(transactionOutputPayload, withData).then(data => {
                if (data.api_status === 'fail') {
                    return Promise.reject(data);
                }
                return data;
            }).then(data => {
                resolve(this.handleSuccessResponse(data));
            }).catch((e) => {
                reject(this.handleErrorResponse(e));
            });
        });
    }

    getModalBodySuccessResult(transactionID) {
        return <div>
            <div>
                transaction id
            </div>
            <div>
                {transactionID}
            </div>
        </div>;
    }

    handleErrorResponse(e) {
        let sendTransactionErrorMessage;
        let errorList = [];
        if (e !== 'validation_error') {
            if (e && e.api_message) {
                sendTransactionErrorMessage = text.getUiError(e.api_message);
            }
            else {
                sendTransactionErrorMessage = `your transaction could not be sent: (${e?.api_message?.error.error || e?.api_message?.error || e?.message || e?.api_message || e || 'undefined behaviour'})`;
            }

            errorList.push({
                name   : 'sendTransactionError',
                message: sendTransactionErrorMessage
            });
        }

        return {
            error_list: errorList,
            sending   : false,
            canceling : false
        };
    }

    handleSuccessResponse(data) {
        const transaction = data.transaction.find(item => {
            return item.version.indexOf('0a') !== -1;
        });

        return {
            sending                 : false,
            fee_input_locked        : true,
            amount                  : '',
            subject                 : '',
            message                 : '',
            destination_address_list: [],
            address_verified_list   : [],
            modal_body_send_result  : this.getModalBodySuccessResult(transaction.transaction_id)
        };
    }
}


const _Transaction = new Transaction();
export default _Transaction;
