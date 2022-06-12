import React from 'react'
import ModalWindow from './ModalWindow';

class ModalConfirm extends React.Component {

	render() {
		return (
		<ModalWindow 
        show={this.props.modalConfirmDto.show}
        title={this.props.modalConfirmDto.title}
        buttonX={()=>{this.props.modalConfirmDto.hideConfirmFunc()}}
        modalClass='modal-lg'
        buttonOk={()=>{this.props.modalConfirmDto.confirmFunc(this.props.modalConfirmDto.data)}}
        buttonCancel={()=>{this.props.modalConfirmDto.hideConfirmFunc()}}
        buttonPosition={'left'}>
            <div>{this.props.modalConfirmDto.confirmMessage}</div>
        </ModalWindow>
		)
	}
}

export default ModalConfirm