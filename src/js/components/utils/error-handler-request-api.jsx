import React, {Component} from 'react';
import ModalView from './modal-view';
import {Subject} from 'rxjs';
import Translation from '../../common/translation';

const modalState = new Subject();

export function showErrorModalRequestApi(error) {
    modalState.next(error);
}


class ErrorModalRequestApi extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showIntervalSecond: 10,
            showAfterDate     : new Date(),
            modalShow         : false,
            message           : ''
        };
    }

    componentWillMount() {
        modalState.subscribe(error => {
            this.show(error);
        });
    }

    show(error) {
        if (!this.state.modalShow && this.state.showAfterDate < new Date()) {
            if (error?.message) {
                let message = error.message;

                if (error?.message === 'Failed to fetch') {
                    message = Translation.getPhrase('2cf433bce');
                }

                this.showModal(message);
            }
            else {
                try {
                    const environment = require('../../../environment');
                    if (environment.SHOW_API_ERROR_IN_MODAL) {
                        error.json().then(data => {
                            this.showModal(data?.api_message);
                        });
                    }
                }
                catch (ex) {
                }
            }
        }
    }

    showModal(message) {
        this.setState({
            modalShow: true,
            message  : message
        });
    }

    close() {
        const timeAfter = new Date();
        timeAfter.setSeconds(timeAfter.getSeconds() + this.state.showIntervalSecond);

        this.setState({
            modalShow    : false,
            showAfterDate: timeAfter
        });
    }

    render() {
        return (
            <>
                <ModalView show={this.state.modalShow}
                           size={'lg'}
                           on_close={() => this.close()}
                           heading={Translation.getPhrase('097302530')}
                           body={this.state.message}/>
            </>
        );
    }
}


export default ErrorModalRequestApi;
