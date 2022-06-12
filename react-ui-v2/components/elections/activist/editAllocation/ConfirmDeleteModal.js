import React from 'react';

import ModalWindow from 'components/global/ModalWindow';


const ConfirmDeleteModal = ({show, title, buttonOk, buttonCancel}) => {
    return (
        <ModalWindow show={show} title={title} style={{zIndex: '9001'}}
                     buttonOk={buttonOk.bind(this)} buttonCancel={buttonCancel.bind(this)} buttonX={buttonCancel.bind(this)}>
            <div>האם אתה בטוח ?</div>
        </ModalWindow>
    );
};

export default ConfirmDeleteModal;