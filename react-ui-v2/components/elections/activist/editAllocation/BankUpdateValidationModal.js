import React from 'react';
import ModalWindow from '../../../../components/global/ModalWindow';

class BankUpdateValidationModal extends React.Component {
    render(){
        return( 
        <ModalWindow
            title="האם ברצונך לאשר את חשבון הבנק?"
            show={this.props.show}
            buttonOk={this.props.verifyBankValidation.bind(this)}
            buttonOkText="תקין"
            buttonCancelText="שגוי"
            buttonCancel={this.props.cancelBankValidation.bind(this)}
            buttonX={this.props.closeModal.bind(this)}
        >
            <h1>אישור חשבון בנק לפעיל</h1>
        </ModalWindow>)
    }
}
export default BankUpdateValidationModal;