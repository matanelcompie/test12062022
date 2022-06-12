import React from 'react'
import ModalWindow from '../ModalWindow'

/**
 * Modal for audio input error
 */
class ModalAudio extends React.Component {

	render() {

		return (
			<ModalWindow
				title="שגיאת קלט קול"
				buttonOk={this.props.buttonOk}
				show={true}>
				<div>לא נמצא קלט קול (מיקרופון)</div>
				<div>אנא חבר ונסה שנית</div>
			</ModalWindow>
		)
	}
}

export default ModalAudio;