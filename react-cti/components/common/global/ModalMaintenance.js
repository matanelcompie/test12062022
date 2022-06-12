import React from 'react'
import ModalWindow from '../ModalWindow'

/**
 * Modal for maintenance message
 */
class ModalMaintenance extends React.Component {

	constructor(props) {
		super(props);
		let intervalId = setInterval(this.updateTimer.bind(this), 1000);
		this.state = {
			timer: 60,
			intervalId: intervalId
		};
		
	}

	/**
	 * Update the timer 
	 *
	 * @return void
	 */
	updateTimer() {
		if (this.state.timer > 1) {
			this.setState({
				timer: this.state.timer-1
			});
		} else {
			window.location = window.Laravel.baseURL + "logout";
			clearInterval(this.state.intervalId);
		}
	}

	render() {

		return (
			<ModalWindow 
			title="תחזוקה"
			disabledOkStatus={true}
			show={true}>
				<div>המערכת נמצאת בתחזוקה</div>
				<div>{"יציאה בעוד " + this.state.timer + " שניות"}</div>
			</ModalWindow>
		)
	}
}

export default ModalMaintenance