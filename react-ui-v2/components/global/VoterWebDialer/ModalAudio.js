import React from 'react'
import ModalWindow from 'components/global/ModalWindow'

/**
 * Modal for audio input error
 */
class ModalAudio extends React.Component {

	render() {

		return (
			<ModalWindow
				title="שגיאת קלט קול"
				buttonOk={this.props.buttonOk}
				buttonCancel={this.props.buttonCancel}
				buttonX={this.props.buttonCancel}
				show={true}>
				<div>לא נמצא קלט קול (מיקרופון)</div>
				<div>אנא חבר ונסה שנית</div>
			</ModalWindow>
		)
	}
}

export default ModalAudio;