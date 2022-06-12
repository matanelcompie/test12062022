import React from 'react';

import ModalWindow from 'components/global/ModalWindow';

/**
 * Campaign message delete modal component
 */
class CampaignMessageDeleteModal extends React.Component {

	render() {
		return (
			<ModalWindow
				show={true}
				title="אישור מחיקה"
				buttonOk={this.props.buttonOk}
				buttonCancel={this.props.buttonCancel}
				buttonX={this.props.buttonX}>
				<div>האם אתה בטוח שברצונך למחוק את המסר:</div>
				<div>{this.props.message.name}</div>
			</ModalWindow>
		)
	}
}

export default CampaignMessageDeleteModal;