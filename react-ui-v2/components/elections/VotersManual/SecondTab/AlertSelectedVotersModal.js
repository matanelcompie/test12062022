import React from 'react';

import ModalWindow from 'components/global/ModalWindow';


class AlertSelectedVotersModal extends React.Component {
    constructor(props) {
        super(props);

        this.modalTitle = 'מעבר להגדרת נתונים';
    }

    render() {
        return (
            <ModalWindow show={this.props.show} title={this.modalTitle} buttonOk={this.props.cleanSecondTabData.bind(this)}
                         buttonCancel={this.props.hideAlertSelectedModal.bind(this)} buttonX={this.props.hideAlertSelectedModal.bind(this)}>
                <div>האם אתה בטוח ?</div>
            </ModalWindow>
        );
    }
}

export default AlertSelectedVotersModal;