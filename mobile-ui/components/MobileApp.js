import React from 'react';
import { connect } from 'react-redux';
import * as Actions from '../actions/Actions';
import LoginScreen from '../components/LoginScreen'
import SearchVoterScreen from '../components/SearchVoterScreen'
import ModalWindow from '../components/global/ModalWindow'

class MobileApp extends React.Component {
	constructor(props) {
		super(props);
	}
	login(loginDetails) {
		Actions.login(this.props.dispatch, loginDetails)
	}
	logout() {
		Actions.logout(this.props.dispatch)
	}
	renderMobileApp() {
		return (
			<div className="row">
				<div className="col-xs-12">
					{!this.props.currentUser && <LoginScreen login={this.login.bind(this)}
						loginErrorData={this.props.loginErrorData} cityPhone={window.Laravel.cityPhone} />}
					{this.props.currentUser && <SearchVoterScreen></SearchVoterScreen>}
				</div>
			</div>
		)
	}
	renderErrorText() {
		return (
			<div className="row" style={{ padding: '30px 0' }}>
				<div className="col-xs-2" style={{ marginTop: '22px' }}>
					<img className="img-responsive" style={{ cursor: 'pointer', height: '20px' }}
						src={window.Laravel.baseURL + 'Images/alert-mobile-icon.png'} />
				</div>
				<div className="col-xs-10">
					<h3 className="text-danger "> פעיל לא קיים במערכת </h3>
					<h4><span> פנה למוקד במס</span> <a href='tel::02-32216733'> 02-32216733 </a></h4>
				</div>
			</div>
		)
	}
	closeWarningModal() {
		this.props.dispatch({ type: Actions.ActionTypes.DISPLAY_WARNING_MODAL, show: false, message: '' })
	}
	render() {
		let imageStyle = { cursor: 'pointer', height: '27px' };
		const appPadding = '27px';
		let isValidReporter = window.Laravel.isValidReporter == '1';
		 
		let icon = <a><img className="img-responsive pull-right shas-logo" style={imageStyle} src={window.Laravel.baseURL + 'Images/logo-shas.png'} /></a>; //Not in use right now!
		return (
			<div>
				<div className="container" style={{ paddingRight: appPadding, paddingLeft: appPadding }}>
					<div className="row topNav" style={{ backgroundColor: '#323A6B', color: 'white', marginLeft: '-' + appPadding, marginRight: '-' + appPadding }}>
						<div className="col-xs-12">
							<h3 className='text-center' style={{ margin: '15px 0' }}>

								<span style={this.props.currentUser ? {} : {marginRight: '15px' }}>	דיווח מפעילי בחירות </span>

								{this.props.currentUser && <a onClick={this.logout.bind(this)}><img className="img-responsive pull-left" style={imageStyle}
									src={window.Laravel.baseURL + 'Images/back-icon-mobile.png'} /></a>}
							</h3>
						</div>
					</div>
					{isValidReporter && this.renderMobileApp()}
					{!isValidReporter && this.renderErrorText()}

					
				</div>
				<div id="warningModal">
					<ModalWindow
						show={this.props.displayWarningModal}
						title={this.props.warningMessage}
						buttonOk={this.closeWarningModal.bind(this)}
						buttonOkText='סגור'
						buttonX={this.closeWarningModal.bind(this)}
						hideModalBody={true}
					>
					</ModalWindow>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.currentUser,
		loginErrorData: state.loginErrorData,
		warningMessage: state.warningMessage,
		displayWarningModal: state.displayWarningModal,
	};
}

export default connect(mapStateToProps)(MobileApp);
