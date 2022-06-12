import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import { validatePhoneNumber } from 'libs/globalFunctions';

import * as campaignActions from 'tm/actions/campaignActions';
import LaddaButton from 'tm/components/common/LaddaButton';

import ActivityAreaSettings from '../display/ActivityAreaSettings';

/**
 * Cti settings tab component
 */

class CtiSettingsTab extends React.Component {

	constructor(props) {
		super(props);

		//initialize constants
		this.initConstants();
		this.hack = 0;
	}

	/**
	 * Initialize constants
	 * @return void
	 */
	initConstants() {
		this.activityAreas = [
			{ key: 'household', label: 'אזור פעילות בית אב', permissionPrefix: "cti.activity_area.household" },
			{ key: 'transportation', label: 'אזור פעילות הסעה', permissionPrefix: "cti.activity_area.transportation" },
			{ key: 'address', label: 'אזור פעילות כתובת', permissionPrefix: "cti.activity_area.address" },
			{ key: 'contacts', label: 'אזור פעילות פרטי קשר', permissionPrefix: "cti.activity_area.contacts" },
			{ key: 'support_status', label: 'אזור פעילות סטטוס', permissionPrefix: "cti.activity_area.support_status" },
			{ key: 'messages', label: 'אזור פעילות מסרים', permissionPrefix: "cti.activity_area.messages" },
			{ key: 'general', label: 'כללי', permissionPrefix: "cti.activity_area.general" },
		];

		this.textValues = {
			saveButtonTitle: 'שמור',
		};

		this.permissionValueChange = this.permissionValueChange.bind(this);
		this.campaignValueChange = this.campaignValueChange.bind(this);
	}

	/**
	 * Update permission value
	 *
	 * @param string permissionKey
	 * @param string|integer value
	 * @return void
	 */
	permissionValueChange(permissionKey, value) {
		this.props.campaignActions.updateCampaignCtiPermission(permissionKey, value);
	}

	/**
	 * Update campaign value
	 *
	 * @param string value
	 * @param string name
	 * @return void
	 */
	campaignValueChange(value, name) {
		this.props.campaignActions.campaignValueChange(value, name);
	}

	/**
	 * Render activity areas list
	 *
	 * @return void
	 */
	renderActivityAreas() {
		var _this = this;

		//loop on activity area lsit and generate 'ActivityAreaSettings' components
		this.areas = this.activityAreas.map(function (activityArea) {
			return <ActivityAreaSettings
				key={activityArea.key}
				label={activityArea.label}
				mainPermission={activityArea.permissionPrefix}
				permissions={_this.getCtiPermissionsFromPrefix(activityArea.permissionPrefix)}
				selectedPermissions={_this.props.campaign.cti_permissions}
				permissionValueChange={_this.permissionValueChange}
				campaignValueChange={_this.campaignValueChange}
				campaign={_this.props.campaign} />
		});
	}

	/**
	 * Get permissions from cti permissions list according to prefix of name
	 *
	 * @param string prefix
	 * @return array 
	 */
	getCtiPermissionsFromPrefix(prefix) {
		let permissions = this.props.ctiPermissions.filter(function (permission) {
			return permission.name.startsWith(prefix);
		});
		return permissions;
	}

	/**
	 * Save campaign cti settings
	 *
	 * @return void
	 */
	onSaveClick() {
		this.props.campaignActions.saveCtiSettings(this.props.campaign, this.props.ctiPermissions);
	}

	/**
	 * Check if to disable the save button
	 *
	 * @return boolean
	 */
	isSaveButtonDisabled() {

		//check transportation phone validation
		let transportationPhonePermission = undefined;
		this.props.ctiPermissions.forEach(function (permission) {
			if (permission.name == 'cti.activity_area.transportation.phone_coordinate') transportationPhonePermission = permission;
		});

		if ((transportationPhonePermission != undefined) && (Number(this.props.campaign.cti_permissions[transportationPhonePermission.key]) == 1)) {
			let phoneNumber = (this.props.campaign.transportation_coordination_phone == undefined) ? '' : this.props.campaign.transportation_coordination_phone;
			phoneNumber = phoneNumber.split('-').join('');
			if (!validatePhoneNumber(phoneNumber)) return true;
		}
		return false;
	}

	/**
	 * Render component
	 *
	 * @return jsx
	 */
	render() {
		this.renderActivityAreas();
		return (
			<div className="cti-settings-tab tabContnt containerStrip">
				<div>{this.areas}</div>
				<div className="row">
					<div className="col-xs-12 text-left">
						{(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.cti_settings.edit'] == true) && <LaddaButton className={"btn btn-primary btn-sm"}
							onClick={this.onSaveClick.bind(this)}
							loading={this.props.isPending}
							disabled={this.isSaveButtonDisabled()}>
							<i className="fa fa-floppy-o"></i>&nbsp;&nbsp;
	                        <span>{this.textValues.saveButtonTitle}</span>
						</LaddaButton>}
					</div>
				</div>
			</div>
		);
	}
}

/**
 * Map state to props of component
 *
 * @param object state
 * @return object
 */
function mapStateToProps(state) {
	return {
		ctiPermissions: state.tm.system.lists.cti_permissions,
		isPending: state.tm.campaign.pending ? true : false,
		currentUser: state.system.currentUser,
	}
}

/**
 * Map dispatch to props
 *
 * @param function dispatch
 * @return object
 */
function mapDispatchToProps(dispatch) {
	return {
		campaignActions: bindActionCreators(campaignActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CtiSettingsTab)