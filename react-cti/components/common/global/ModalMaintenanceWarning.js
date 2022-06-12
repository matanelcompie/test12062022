import React from 'react'
import ModalWindow from '../ModalWindow'
import { connect } from 'react-redux'

/**
 * Modal for maintenance warning message
 */
class ModalMaintenanceWarning extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			show: true
		};
	}

	hideModal() {
		this.setState({
			show: false
		});
	}

	render() {

		return (
			<ModalWindow 
			title="תחזוקה"
			show={this.state.show}
			buttonOk={this.hideModal.bind(this)}>
				<div>המערכת תיכנס לתחזוקה בתאריך</div>
				<div>{this.props.maintenanceDate}</div>
			</ModalWindow>
		)
	}
}

function mapStateToProps(state) {
	return {
		maintenanceDate: state.system.maintenanceDate
	}
}

export default connect(mapStateToProps)(ModalMaintenanceWarning)