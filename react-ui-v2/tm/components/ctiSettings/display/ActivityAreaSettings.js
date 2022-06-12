import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RadioSet from 'tm/components/common/RadioSet';
import Constants from 'tm/constants/constants';

import * as campaignActions from 'tm/actions/campaignActions';

import * as globalFunctions from 'libs/globalFunctions';

import CampaignMessagesList from './CampaignMessagesList';
import CampaignMessageModal from './CampaignMessageModal';
import CampaignMessageDeleteModal from './CampaignMessageDeleteModal';

/**
 * Activity area settings component
 */
class ActivityAreaSettings extends React.Component {

	/**
	 * Class constructor
	 * 
	 * @return void
	 */
	constructor(props) {
		super(props);

		//initialize constants
		this.initConstants();
	}

	componentWillMount() {
		this.initState();
	}

	/**
	 * Initialize constants
	 *
	 * @return void
	 */
	initConstants() {
		//set permission options according to permission type
		this.permissionOption = {};
		this.permissionOption[Constants.TM.CTI.PERMISSION_TYPES.TRUE_FALSE] = [
			{ value: 0, label: "לא" },
			{ value: 1, label: "כן" }
		];

		let hideReadPermissions  = [
			{ value: 0, label: "הסתר" },
			{ value: 1, label: "קריאה בלבד" },
			{ value: 2, label: "עריכה" }
		];
		this.permissionOption[Constants.TM.CTI.PERMISSION_TYPES.HIDE_READ_EDIT] = [ ...hideReadPermissions ]
		this.permissionOption[Constants.TM.CTI.PERMISSION_TYPES.HIDE_READ_EDIT_DELETE] = [
			...hideReadPermissions,
			{ value: 3, label: "עריכה ללא מחיקה" }
		];

	}

	/**
	 * Initialize component state
	 *
	 * @return void
	 */
	initState() {
		this.setState({
			showCampaignMessageModal: false,
			showDeleteCampaignMessageModal: false,
			curreneMessage: {},
		});
	}

	/**
	 * Show campaign message modal
	 *
	 * @return void
	 */
	showCampaignMessageModal() {
		this.setState({
			showCampaignMessageModal: true
		});
	}

	/**
	 * Hide campaign message modal
	 *
	 * @return void
	 */
	hideCampaignMessageModal() {
		this.setState({
			showCampaignMessageModal: false
		});
	}

	/**
	 * Show campaign message modal for editing message
	 *
	 * @return void
	 */
	editCampaignMessage(message) {

		this.setState({
			currentMessage: message
		});
		this.showCampaignMessageModal();
	}

	/**
	 * Show campaign message modal for new message
	 *
	 * @return void
	 */
	newCampaignMessage() {
		this.setState({
			currentMessage: {}
		});
		this.showCampaignMessageModal();
	}

	/**
	 * Show campaign message delete modal
	 *
	 * @return void
	 */
	showDeleteCampaignMessageModal(message) {
		this.setState({
			showDeleteCampaignMessageModal: true,
			currentMessage: message
		});
	}

	/**
	 * Hide campaign message delete modal
	 *
	 * @return void
	 */
	hideDeleteCampaignMessageModal() {
		this.setState({
			showDeleteCampaignMessageModal: false,
			currentMessage: {}
		});
	}

	/**
	 * Delete campaign message delete and hide modal
	 *
	 * @return void
	 */
	deleteMessage() {
		this.props.campaignActions.deleteCampaignMessage(this.props.campaign, this.state.currentMessage);
		this.hideDeleteCampaignMessageModal();
	}

	/**
	 * Update campaign message
	 *
	 * @param object message
	 * @param array parameters
	 * @return void
	 */
	updateCampaignMessage(message, parameters) {
		this.props.campaignActions.updateCampaignMessage(this.props.campaign, message, parameters);
	}

	/**
	 * Update campaign message and close modal
	 *
	 * @param object message
	 * @param array parameters
	 * @return void
	 */
	updateCampaignMessageAndClose(message, parameters) {
		this.props.campaignActions.updateCampaignMessage(this.props.campaign, message, parameters);
		this.hideCampaignMessageModal();
	}

	/**
	 * Add campaign message
	 *
	 * @param array parameters
	 * @return void
	 */
	addCampaignMessage(parameters) {
		this.props.campaignActions.addCampaignMessage(this.props.campaign, parameters);
	}

	/**
	 * Add campaign message and close modal
	 *
	 * @param array parameters
	 * @return void
	 */
	addCampaignMessageAndClose(parameters) {
		this.addCampaignMessage(parameters);
		this.hideCampaignMessageModal();
	}

	/**
	 * Render permissions
	 *
	 * @return jsx
	 */
	renderPermissions(displayMessagesList) {
		let _this = this;

		//get first permission if exist
		let firstPermission = {};
		if (this.props.permissions.length > 0) {
			firstPermission = _this.props.permissions[0];
		}
		let editPermission = false;
		let parentPermission = _this.props.selectedPermissions[firstPermission.key];
		if (parentPermission == undefined || Number(parentPermission) == 1) {
			editPermission = true;
		}
		//set permission class
		let className = displayMessagesList.show ? "form-group col-sm-8" : 'form-group col-sm-12';

		//render filtered permissions
		let renderedPermissions = this.props.permissions.map(function (permission, i) {
			let disabledRadio = (i != 0 && !editPermission && permission.name != 'cti.activity_area.general.sms');
			// let defaultValue = permission.type == 0 ? 1 : 2;
			//get permission value
			let permissionValue = (_this.props.selectedPermissions[permission.key] != undefined) ? _this.props.selectedPermissions[permission.key] : 0;
			return (<div className={className} key={i}>
				<label>{permission.label}</label>
				<RadioSet
					name={permission.name}
					options={_this.permissionOption[permission.type]}
					activeValue={permissionValue}
					onChange={_this.permissionValueChange.bind(_this, permission.key)}
					inline={true}
					disabled={disabledRadio}
				/>
			</div>)
		});
		return renderedPermissions;
	}

	/**
	 * Update permission value
	 *
	 * @param string permissionKey
	 * @param event e
	 * @return void
	 */
	permissionValueChange(permissionKey, e) {
		// console.log(permissionKey, e.target.value);
		this.props.permissionValueChange(permissionKey, e.target.value);
	}

	/**
	 * Check if message list should be visible in messages activity area
	 *
	 * @return boolean
	 */
	showMessagesList() {
		if (this.props.mainPermission != "cti.activity_area.messages") return false;
		if (this.props.permissions.length == 0) return false;
		let firstPermission = this.props.permissions[0];
		let selectedPermissionValue = this.props.selectedPermissions[firstPermission.key];
		if ((selectedPermissionValue == undefined) || (Number(selectedPermissionValue) == 0)) return false;
		return true;
	}


	displayActivitySection(permissionValue) {
		let viewPermission = { show: false, edit: false };
		let dataPermission = this.props.permissions.filter(function (permission, i) {
			if (permission.name == permissionValue) return true;
			return false;
		});

		if (dataPermission.length > 0) {
			viewPermission.show = true;
			if (Number(this.props.selectedPermissions[dataPermission[0].key]) == 1) { viewPermission.edit = true; }
		}
		return viewPermission;
	}
	/**
	 * Campaign value change
	 *
	 * @param event e
	 * @return void
	 */
	campaignValueChange(e) {
		this.props.campaignValueChange(e.target.value, e.target.name);
	}

	/**
	 * Render text values
	 *
	 * @return void
	 */
	renderTextValues() {
		this.transportation_coordination_phone = (this.props.campaign.transportation_coordination_phone == undefined) ? '' : this.props.campaign.transportation_coordination_phone;
	}

	/**
	 * Set class for transporation phone validation
	 *
	 * @return void
	 */
	setTransportationPhoneClass() {
		this.transportationCoodrdinationPhoneClass = "form-group"
		let displayTransportationPhone = this.displayActivitySection('cti.activity_area.transportation.phone_coordinate');

		if (displayTransportationPhone.show) {
			let transportationCoordinationPhone = (this.props.campaign.transportation_coordination_phone != undefined) ? this.props.campaign.transportation_coordination_phone : '';
			let phoneToCheck = transportationCoordinationPhone.split('-').join('');

			if (!globalFunctions.validatePhoneNumber(phoneToCheck)) {
				this.transportationCoodrdinationPhoneClass += " has-error";
			}
		}
	}

	render() {
		this.renderTextValues();
		this.setTransportationPhoneClass();
		let displayEmailSection = this.displayActivitySection('cti.activity_area.general.email');
		let displaySmsSection = this.displayActivitySection('cti.activity_area.general.sms');
		let displayTransportationPhone = this.displayActivitySection('cti.activity_area.transportation.phone_coordinate');
		let displayMessagesList = this.displayActivitySection('cti.activity_area.messages');
		return (
			<div className="col-md-4 col-xs-12">
				<div className="cti-activity-area">
					<div className="row">
						<div className="col-sm-12">
							<div className="tab-title">
								<div className="tab-title__title">{this.props.label}</div>
							</div>
						</div>
					</div>
					<div className="row">
						{this.renderPermissions(displayMessagesList)}
						{displayMessagesList.show &&
							<div className="col-sm-4">
								<button className="btn btn-primary left"
									disabled={!displayMessagesList.edit}
									onClick={this.newCampaignMessage.bind(this)}>
									<i className="fa fa-plus" aria-hidden="true"></i>
									<span>הוסף מסר</span>

								</button>
							</div>
						}
					</div>
					{displayMessagesList.show &&
						<CampaignMessagesList
							messagesList={this.props.campaign.messages}
							updateCampaignMessage={this.updateCampaignMessage.bind(this)}
							editMessage={this.editCampaignMessage.bind(this)}
							deleteMessage={this.showDeleteCampaignMessageModal.bind(this)}
							disabledButtons={!displayMessagesList.edit}
						/>
					}
					{(this.state.showCampaignMessageModal) &&
						<CampaignMessageModal
							buttonCancel={this.hideCampaignMessageModal.bind(this)}
							buttonX={this.hideCampaignMessageModal.bind(this)}
							message={this.state.currentMessage}
							updateMessage={this.updateCampaignMessageAndClose.bind(this)}
							addMessage={this.addCampaignMessageAndClose.bind(this)} />
					}
					{(this.state.showDeleteCampaignMessageModal) &&
						<CampaignMessageDeleteModal
							buttonOk={this.deleteMessage.bind(this)}
							buttonCancel={this.hideDeleteCampaignMessageModal.bind(this)}
							buttonX={this.hideDeleteCampaignMessageModal.bind(this)}
							message={this.state.currentMessage} />
					}
					{displayTransportationPhone.show &&
						<div className={this.transportationCoodrdinationPhoneClass}>
							<label htmlFor="transportation-coordination-phone">מספר טלפון</label>
							<input className="form-control"
								type="text"
								id="transportation-coordination-phone"
								name="transportation_coordination_phone"
								placeholder="מספר טלפון לתיאום הסעות"
								onChange={this.campaignValueChange.bind(this)}
								value={this.transportation_coordination_phone || ''}
								disabled={!displayTransportationPhone.edit}
							/>
						</div>
					}
					{displaySmsSection.show &&
						<div className="form-group">
							<label htmlFor="sms-message">נוסח הודעת SMS</label>
							<input className="form-control"
								type="text"
								id="sms-message"
								name="sms_message"
								placeholder="הוסעת SMS"
								onChange={this.campaignValueChange.bind(this)}
								value={this.props.campaign.sms_message || ''}
								disabled={!displaySmsSection.edit}
							/>
						</div>
					}
					{displayEmailSection.show &&
						<div className="form-group">
							<label htmlFor="email-topic">כותרת אימייל</label>
							<input className="form-control"
								type="text"
								id="email-topic"
								name="email_topic"
								placeholder="כותרת אימייל"
								onChange={this.campaignValueChange.bind(this)}
								value={this.props.campaign.email_topic || ''}
								disabled={!displayEmailSection.edit}
							/>
							<label htmlFor="email-body">גוף הודעת אימייל</label>
							<textarea className="form-control"
								type="text"
								id="email-body"
								name="email_body"
								placeholder="גוף אימייל"
								onChange={this.campaignValueChange.bind(this)}
								value={this.props.campaign.email_body || ''}
								disabled={!displayEmailSection.edit}
							/>
						</div>
					}
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {

	}
};
function mapDispatchToProps(dispatch) {
	return {
		campaignActions: bindActionCreators(campaignActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivityAreaSettings);