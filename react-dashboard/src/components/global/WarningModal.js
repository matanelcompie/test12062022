import ModalWindow from "./ModalWindow";
import React from 'react';
const WarningModal = (props) => {
    function renderModalDeleteButtons(){
        return ([{
            class: 'base-btn outline-button',
            text: 'סגור',
            action: props.closeModal.bind(this),
            disabled: false
        },
        {
            class: 'base-btn delete-item',
            text: 'אישור',
            action: props.onDeleteClick.bind(this), 
            disabled: false
        }])
    }
    return (
             <ModalWindow
                show={props.show ? true : false}
                modalId="removeParagraphModal"
                modalClass="modal-remove"
                title={props.title}
                style={{ zIndex: "9001" }}
                buttonX={props.closeModal.bind(this)}
                buttons={renderModalDeleteButtons()}
                buttonOkText="אישור"
                buttoncancelText="ביטול"
            > 
                <img src={window.Laravel.baseURL + "Images/polls/warning.svg"} alt="" aria-hidden="true"/>
                <div class="modal-content-remove">
                    <p>{props.mainText}</p>
                    <p>{props.message}</p>
                </div>

            </ModalWindow>
    )
}

export default WarningModal;