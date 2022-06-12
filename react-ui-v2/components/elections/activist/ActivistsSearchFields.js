import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import constants from '../../../libs/constants';
import { arraySort, isLandPhone, isMobilePhone } from 'libs/globalFunctions';

import Combo from 'components/global/Combo';
import * as ElectionsActions from 'actions/ElectionsActions';


class ActivistsSearchFields extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			electionRolesCombo: [],

			geoReadOnly: false,

			combos: {
				subAreas: [],
				cities: []
			}
		};

		this.allId = -1;
		this.emptyStreet = { id: null, name: '', key: '' };

		this.initConstants(props);
	}

	initConstants(props) {
		const verifyStatus = constants.activists.verifyStatus;
		const verifyBankStatuses = constants.activists.verifyBankStatuses;
		this.electionRolesAdditions = constants.activists.electionRolesAdditions;
		this.geographicEntityTypes = constants.geographicEntityTypes;
		this.default=false;
		this.assignmentStatusArr = [
			{ id: this.allId, name: 'הכל' },
			{ id: 0, name: 'לא כולל הקצאה' },
			{ id: 1, name: 'כולל הקצאה' }
		];

		this.verifyStatusArr = [
			{ id: this.allId, name: 'הכל' },
			{ id: verifyStatus.noMessageSent, name: 'טרם נשלחה הודעה' },
			{ id: verifyStatus.messageSent, name: 'נשלחה הודעה' },
			{ id: verifyStatus.verified, name: 'מאומת' },
			{ id: verifyStatus.refused, name: 'מסרב' },
			{ id: verifyStatus.moreInfo, name: 'לבירור נוסף' },
		];
		
		this.bankVerifyStatusArr = [
			{ id: this.allId, name: 'הכל' },
			{ id: verifyBankStatuses.allDetailsCompleted, name: 'תקין' },
			{ id: verifyBankStatuses.notAllDetailsCompleted, name: 'חסר' },
			{ id: verifyBankStatuses.bankDetailsMissing, name: 'לא קיימים פרטי חשבון' },
			{ id: verifyBankStatuses.VerifyDocumentMissing, name: 'לא קיים מסמך אימות' },
			{ id: verifyBankStatuses.bankNotVerified, name: 'חשבון לא אומת' },
			{ id: verifyBankStatuses.bankNotUpdated, name: 'חשבון לא עדכני' },
		];

		this.closeActivistRoleArr = [
			{ id: 0, name: 'הכל' },
			{ id: 2, name: 'נעול' },
			{ id: 1, name: 'לא נעול' }
		];

		this.initialElectionRoles = [
			{ id: this.electionRolesAdditions.none, key: null, name: 'ללא תפקיד' },
			{ id: this.electionRolesAdditions.all, key: null, name: 'כל תפקיד' }
		];

		this.invalidColor = '#cc0000';
		if (props.userFilteredCities.length > 0) {
            this.state.combos.cities = props.userFilteredCities;
        }

	}

	componentWillReceiveProps(nextProps) {
		if (this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0) {
			let combos = this.state.combos;

			combos.cities = nextProps.userFilteredCities;
			this.setState({ combos });
		}
		
		if (this.props.electionRoles.length > 0 && this.state.electionRolesCombo.length == 0) {
			this.setState({ electionRolesCombo: this.initialElectionRoles.concat(this.props.electionRoles).concat([{ id: this.electionRolesAdditions.multi, key: null, name: 'כפל תפקידים' }]) });
		}

		if (!this.default && nextProps.currentCampaign && nextProps.currentCampaign.id ){
			this.setDefaultActivistSearch(nextProps.currentCampaign);
		}
	}

	setDefaultActivistSearch(currentCampaign){

	//default search activist details
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'electionCampaignId',
			fieldValue: currentCampaign.id
		});

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'electionCampaigns',
			fieldValue: currentCampaign.name
		});

		this.default=true;
	}

	searchElectionsActivists(event) {
		// Prevent page refresh
		event.preventDefault();

		this.props.searchElectionsActivists();
	}

	resetSearchFields(event) {
		event.preventDefault();

		if (this.props.isLoadingResults) {
			ElectionsActions.cancelSearchElectionsActivists(this.props.dispatch);
		}

		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_ACTIVISTS_SEARCH_FIELDS });
	}

	loadCityAreaAndSubArea(citySelectedItem) {
		let areaId = citySelectedItem.area_id;
		let areaIndex = this.props.userFilteredAreas.findIndex(item => item.id == areaId);

		if (areaId) {
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'areaId',
				fieldValue: areaId
			});
		}
		if (areaIndex && this.props.userFilteredAreas.hasOwnProperty(areaIndex)) {
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'areaName',
				fieldValue: this.props.userFilteredAreas[areaIndex].name
			});
		}


		let subAreaId = citySelectedItem.sub_area_id;
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaId', fieldValue: subAreaId });

        let subAreaIndex = this.props.userFilteredSubAreas.findIndex(item => item.id == subAreaId);
        if (subAreaIndex!=-1) {
            this.props.dispatch({
                type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaName',
                fieldValue: this.props.userFilteredSubAreas[subAreaIndex].name
            });
        }else{
            this.props.dispatch({
                type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaName',
                fieldValue: null
            });
        }
	}

	cityAssignChange( event) {
		let selectedItem = event.target.selectedItem;
		let cityId =  null;
		let cityKey = null;
		let cityName =  event.target.value;

		if (selectedItem) { 
			cityId = selectedItem.id;
			cityKey = selectedItem.key;
		}

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'assigned_city_name', fieldValue: cityName
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'assigned_city_id', fieldValue: cityId
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'assigned_city_key', fieldValue: cityKey
		});
	}
	cityChange( event) {
		let selectedItem = event.target.selectedItem;

		let cityId =  null;
		let cityName =  event.target.value;

		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_STREETS });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'street', fieldValue: this.emptyStreet });

		if (selectedItem) {
			cityId = selectedItem.id;
			this.loadCityAreaAndSubArea(selectedItem);
			ElectionsActions.loadCityStreets(this.props.dispatch, selectedItem.key);
		}

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'cityName', fieldValue: cityName
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'cityId', fieldValue: cityId
		});
	}

	getComboIdByFieldName(fieldValue, fieldName) {
		let itemsList = [];

		switch(fieldName){
			case 'verifyStatusName': 
				itemsList = this.verifyStatusArr;
				break;
			case 'verifyBankStatusName': 
				itemsList = this.bankVerifyStatusArr;
				break;
			case 'electionRoleName': 
				itemsList = this.state.electionRolesCombo;
				break;
			case 'assignmentStatusName': 
				itemsList = this.assignmentStatusArr;
				break;
			case 'activistClosedName': 
				itemsList = this.closeActivistRoleArr;
				break;
				case 'electionCampaigns': 
				itemsList = this.props.electionCampaigns;
				break;
		}
		let index = itemsList.findIndex(item => item.name == fieldValue);

		if (-1 == index) {
			return null;
		} else {
			return itemsList[index].id;
		}
	}

	comboChanged(fieldName, fieldIdName, event) {
		let fieldValue = event.target.value;
		let fieldId = this.getComboIdByFieldName(fieldValue, fieldName);

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: fieldName,
			fieldValue: fieldValue
		});

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: fieldIdName,
			fieldValue: fieldId
		});
	}

	comboMultiChange(fieldName, fieldIdName,nameFieldItem,nameIdItem, event){
		
		let arrSelected=event.target.selectedItems;
		let stringValue='';
		let arrValueIdSelect=arrSelected.map(item=>{return item[nameIdItem]})
		//string of value element select
		arrSelected.forEach(element => {
			stringValue=stringValue==''?element[nameFieldItem]:stringValue+', '+element[nameFieldItem];
		});

		//dispatch string value select
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: fieldName,
			fieldValue: stringValue
		});

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: fieldIdName,
			fieldValue: arrValueIdSelect
		});
		
	}

	loadSubAreaCities(subAreaId) {
		let cities = this.props.userFilteredCities.filter(cityItem => cityItem.sub_area_id == subAreaId);
		let combos = this.state.combos;

		combos.cities = cities;
		this.setState({ combos });
	}

	subAreaChange(e) {
		let selectedItem = e.target.selectedItem;
		let combos = this.state.combos;

		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_STREETS });

		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_STREETS });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'cityName', fieldValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'cityId', fieldValue: null });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'street', fieldValue: this.emptyStreet });

		if (selectedItem) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaName', fieldValue: selectedItem['name'] });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaId', fieldValue: selectedItem['id'] });

			this.loadSubAreaCities(selectedItem['id']);
		} else {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaName', fieldValue: '' });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'subAreaId', fieldValue: null });

			combos.cities = [];
			this.setState({ combos });
		}
	}

	loadAreaCities(areaId) {
		let cities = this.props.userFilteredCities.filter(cityItem => cityItem.area_id == areaId);
		let combos = this.state.combos;

		combos.cities = cities;
		this.setState({ combos });
	}

	loadSubAreas(areaId) {
		let subAreas = this.props.userFilteredSubAreas.filter(subAreaItem => subAreaItem.area_id == areaId);
		let combos = this.state.combos;

		combos.subAreas = subAreas;
		this.setState({ combos });
	}

	getAreaIndex(areaName) {
		return this.props.userFilteredAreas.findIndex(areaItem => areaItem.name == areaName);
	}

	areaChange(event) {
		let areaName = event.target.value;
		let areaIndex = this.getAreaIndex(areaName);
		let areaId = (areaIndex == -1) ? null : this.props.userFilteredAreas[areaIndex].id;

		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_STREETS });

		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'areaName',
			fieldValue: areaName
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'areaId',
			fieldValue: areaId
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'cityName',
			fieldValue: ''
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'cityId',
			fieldValue: null
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'street',
			fieldValue: this.emptyStreet
		});

		let combos = this.state.combos;

		if (null == areaId) {
			combos.subAreas = [];
			combos.cities = this.props.userFilteredCities;
			this.setState({ combos });
		} else {
			this.loadSubAreas(areaId);
			this.loadAreaCities(areaId);
		}
	}

	searchInputFieldChange(fieldName, event) {
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName,
			fieldValue: event.target.value
		});
	}

    /**
	 * This function makes sure that
	 * the user chose area or election
	 * role to search
	 *
     * @returns {boolean}
     */
	checkRequiredData() {
		if (this.props.searchFields.areaId != null || this.props.searchFields.cityId != null) {
			return true;
		}

		if (this.props.searchFields.electionRoleId != this.electionRolesAdditions.none && this.props.searchFields.electionRoleId != null) {
			return true;
		}

		return false;
	}

	streetChange(e) {
		let selectedItem = e.target.selectedItem;
		let fieldValue = selectedItem ? selectedItem : { ...this.emptyStreet, name: e.target.value };

		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE, fieldName: 'street', fieldValue });
	}

	validateVerifyStatus() {
		return (this.props.searchFields.verifyStatus != null);
	}

	validateAssignmentStatus() {
		return (this.props.searchFields.assignmentStatus != null);
	}

	validateElectionRole() {
		return (this.props.searchFields.electionRoleId != null);
	}

	validatePhoneNumber() {
		let phoneToCheck = '';

		if (!this.props.searchFields.phone_number ||this.props.searchFields.phone_number.length == 0) {
			return true;
		} else {
			phoneToCheck = this.props.searchFields.phone_number.split('-').join('');

			return (isMobilePhone(phoneToCheck) || isLandPhone(phoneToCheck));
		}
	}

	validatePersonalIdentity() {
		var regPersonalIdentity = /^[0-9]{2,10}$/;

		if (!this.props.searchFields.personal_identity || this.props.searchFields.personal_identity.length == 0) {
			return true;
		} else {
            let personalIdentityToCheck = this.props.searchFields.personal_identity;

			if (personalIdentityToCheck.charAt(0) == '0') {
				personalIdentityToCheck = personalIdentityToCheck.substr(1);
			}

			return regPersonalIdentity.test(personalIdentityToCheck);
		}
	}

	validateStreet() {
		if (!this.props.searchFields.street.name ||this.props.searchFields.street.name.length == 0) {
			return true;
		} else {
			return (this.props.searchFields.street.id != null);
		}
	}

	validateCity() {
		if (!this.props.searchFields.cityName || this.props.searchFields.cityName.length == 0) {
			return true;
		} else {
			return (this.props.searchFields.cityId != null);
		}
	}
	validateRoleCity() {
		if (!this.props.searchFields.assigned_city_id && this.props.searchFields.assigned_city_name.length > 0) {
			return false;
		} 
		return true;
	}

	validateSubArea() {
		if (!this.props.searchFields.subAreaName || this.props.searchFields.subAreaName.length == 0) {
			return true;
		} else {
			return (this.props.searchFields.subAreaId != null);
		}
	}

	validateArea() {
		if (!this.props.searchFields.areaName ||this.props.searchFields.areaName.length == 0) {
			return true;
		} else {
			return (this.props.searchFields.areaId != null);
		}
	}

	validateVariables() {
		this.validInput = true;

		if (!this.validateArea()) {
			this.validInput = false;
			this.areaInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validateSubArea()) {
			this.validInput = false;
			this.subAreaInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validateCity()) {
			this.validInput = false;
			this.cityInputStyle = { borderColor: this.invalidColor };
		}
		if (!this.validateRoleCity()) {
			this.validInput = false;
			this.cityAssignInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validateStreet()) {
			this.validInput = false;
			this.streetInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validatePersonalIdentity()) {
			this.validInput = false;
			this.personalIdentityInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validatePhoneNumber()) {
			this.validInput = false;
			this.phoneNumberInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validateElectionRole()) {
			this.validInput = false;
			this.electionRoleInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validateAssignmentStatus()) {
			this.validInput = false;
			this.assignmentStatusInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.validateVerifyStatus()) {
			this.validInput = false;
			this.verifyStatusInputStyle = { borderColor: this.invalidColor };
		}

		if (!this.props.searchFields.electionCampaignId || this.props.searchFields.electionCampaignId=='') {
			this.validInput = false;
			this.electionCampaignInputStyle = { borderColor: this.invalidColor };
		}
		this.props.updateValidForm(this.validInput);

		if (!this.validInput) {
			return;
		}
		this.checkSearchDetails();

	}
	/**
	 * @method checkSearchDetails
	 * Check if the search has a good limit
	 * to limit the number of the search result
	 */
	checkSearchDetails() {
		let searchFields = this.props.searchFields;
		// We can search by phone number or by personal identity
		if (searchFields.personal_identity.length > 0 || searchFields.phone_number.length > 0) {
			return;
		}
		// We can search by full name

		if (searchFields.first_name.length > 0 && searchFields.last_name.length > 0) {  //Search by full name
			return;
		}

		if (searchFields.electionRoleId == this.electionRolesAdditions.none) {
			// Choosing activists with no role

			// We can search by first/last name and city
			if (searchFields.cityId && (searchFields.first_name.length > 0 || searchFields.last_name.length > 0)) {
				return;
			}
			this.firstNameInputStyle = { borderColor: this.invalidColor };
			this.lastNameInputStyle = { borderColor: this.invalidColor };
			this.phoneNumberInputStyle = { borderColor: this.invalidColor };
			this.personalIdentityInputStyle = { borderColor: this.invalidColor };
			this.validInput = false;
		} else if (!this.props.currentUser.admin && !searchFields.cityId  && !searchFields.assigned_city_id  && !searchFields.areaId  && !searchFields.subAreaId) {
			// Choosing activists with role, so choose will be good enough.
			this.validInput = false;
			this.cityInputStyle = { borderColor: this.invalidColor };
			this.cityAssignInputStyle = { borderColor: this.invalidColor };
		}
		if(!this.validInput){
			this.props.updateValidForm(this.validInput);
		}
	}
	initVariables() {
		this.areaInputStyle = {};
		this.subAreaInputStyle = {};
		this.cityInputStyle = {};
		this.cityAssignInputStyle = {};
		this.streetInputStyle = {};

		this.personalIdentityInputStyle = {};
		this.firstNameInputStyle = {};
		this.lastNameInputStyle = {};
		this.phoneNumberInputStyle = {};

		this.electionRoleInputStyle = {};
		this.assignmentStatusInputStyle = {};
		this.verifyStatusInputStyle = {};
		this.electionCampaignInputStyle = {};
		
	}

	renderActivistsSearch() {
		this.initVariables();
		this.validateVariables();
		return (
		(this.props.currentCampaign && this.props.currentCampaign.id && this.props.electionCampaigns.length>0) &&
			<form>
			<div className="row">
			<div className="col-lg-3 col-md-3">
				<div className="form-group">
					<label htmlFor="electionCampaignInPUT" className="control-label">מערכת בחירות</label>
					 <Combo items={this.props.electionCampaigns}
						id="electionCampaignInPUT"
						maxDisplayItems={10}
						showFilteredList={false}
						itemIdProperty="id"
						itemDisplayProperty="name"
						className="form-combo-table"
						inputStyle={this.electionCampaignInputStyle}
						value={this.props.searchFields.electionCampaigns}
						onChange={this.comboChanged.bind(this, 'electionCampaigns', 'electionCampaignId')}
					/>
				</div>
			</div>

				<div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label htmlFor="staff" className="control-label">אזור שיבוץ</label>
							<Combo items={this.props.userFilteredAreas}
								id="staff"
								maxDisplayItems={10}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.areaInputStyle}
								value={this.props.searchFields.areaName}
								onChange={this.areaChange.bind(this)}
								readOnly={this.state.geoReadOnly}
								// disabled={true}
							/>
						</div>
					</div>
					<div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label htmlFor="sub-staff" className="control-label">תת אזור שיבוץ</label>
							<Combo items={this.state.combos.subAreas}
								id="sub-staff"
								maxDisplayItems={10}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.subAreaInputStyle}
								value={this.props.searchFields.subAreaName}
								onChange={this.subAreaChange.bind(this)}
								// disabled={true}
							/>
						</div>
					</div>
					{/* <div className="col-lg-3 col-md-3">

						<div className="form-group">
							<label htmlFor="searchByCity" className="control-label">עיר מגורים</label>
							<Combo items={[]}
							//TEMPORARY REMOVED this.state.combos.cities
								id="searchByCity"
								maxDisplayItems={10}
								autoFocus={true}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.cityInputStyle}
							    value={""}
								//TEMPORARY REMOVED this.props.searchFields.cityName
								onChange={this.cityChange.bind(this)}
								readOnly={this.state.geoReadOnly}
								disabled={true}
							/>
						</div>
					</div> */}
					<div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label htmlFor="searchByRoleCity" className="control-label">עיר שיבוץ</label>
							<Combo items={this.state.combos.cities}
								id="searchByRoleCity"
								maxDisplayItems={10}
								autoFocus={false}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.cityAssignInputStyle}
								value={this.props.searchFields.assigned_city_name}
								onChange={this.cityAssignChange.bind(this)}
								readOnly={this.state.geoReadOnly}
							/>
						</div>
					</div>
					{/* <div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label className="control-label">רחוב מגורים</label>
							<Combo items={this.props.streets}
								maxDisplayItems={10}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.streetInputStyle}
								value={this.props.searchFields.street.name}
								onChange={this.streetChange.bind(this)}
							/>
						</div>

					</div> */}
				</div>
				<div className="row">
						<div className="col-lg-3 col-md-3">
							<div className="form-group">
								<label htmlFor="searchByID" className="control-label">ת"ז</label>
								<input type="text" className="form-control" style={this.personalIdentityInputStyle} id="searchByID"
									value={this.props.searchFields.personal_identity}
									onChange={this.searchInputFieldChange.bind(this, 'personal_identity')} />
							</div>
						</div>
						<div className="col-lg-3 col-md-3">

							<div className="form-group">
								<label htmlFor="first-name" className="control-label">שם פרטי</label>
								<input type="text" className="form-control" id="first-name" style={this.firstNameInputStyle}
									value={this.props.searchFields.first_name}
									onChange={this.searchInputFieldChange.bind(this, 'first_name')} />
							</div>
						</div>
						<div className="col-lg-3 col-md-3">
							<div className="form-group">
								<label htmlFor="family" className="control-label">שם משפחה</label>
								<input type="text" className="form-control" id="family" style={this.lastNameInputStyle}
									value={this.props.searchFields.last_name}
									onChange={this.searchInputFieldChange.bind(this, 'last_name')} />
							</div>
						</div>
						<div className="col-lg-3 col-md-3">
							<div className="form-group">
								<label htmlFor="searchByPhone" className="control-label">מס' טלפון</label>
								<input type="text" className="form-control" id="searchByPhone" style={this.phoneNumberInputStyle}
									value={this.props.searchFields.phone_number}
									onChange={this.searchInputFieldChange.bind(this, 'phone_number')} />
							</div>
						</div>
					</div>
				<div className="row">

					<div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label htmlFor="member-type" className="control-label">סוג פעיל</label>
							<Combo items={this.state.electionRolesCombo}
								arrItemForReset={[-1,0,-2]}
								id="member-type"
								multiSelect={true}
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.electionRoleInputStyle}
								value={this.props.searchFields.electionRoleName}
								onChange={this.comboMultiChange.bind(this, 'electionRoleName' ,'electionRoleId','name','id')}
							/>
						</div>
					</div>
				

					<div className="col-lg-3 col-md-3">

						<div className="form-group">
							<label htmlFor="verification-status" className="control-label">סטטוס אימות</label>
							<Combo items={this.verifyStatusArr}
								id="verification-status"
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.verifyStatusInputStyle}
								value={this.props.searchFields.verifyStatusName}
								onChange={this.comboChanged.bind(this, 'verifyStatusName', 'verifyStatus')}
							/>
						</div>
					</div>
					
					<div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label htmlFor="bank-verification-status" className="control-label">סטטוס אימות חשבון</label>
							<Combo items={this.bankVerifyStatusArr}
								arrItemForReset={[-1,0,1]}
								id="bank-verification-status"
								maxDisplayItems={10}
								showFilteredList={false} 
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								multiSelect={true}
								inputStyle={this.verifyStatusInputStyle} 
								value={this.props.searchFields.verifyBankStatusName}
								onChange={this.comboMultiChange.bind(this, 'verifyBankStatusName', 'verifyBankStatus' ,'name','id')}
							/>
						</div>
					</div>	
					<div className="col-lg-3 col-md-3">
						<div className="form-group">
							<label htmlFor="bank-verification-status" className="control-label">נעילת תשלום</label>
							<Combo items={this.closeActivistRoleArr}
								id="bank-verification-status"
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								inputStyle={this.verifyStatusInputStyle} //!!!!!!!!!!!!!!!!!!!!!!
								value={this.props.searchFields.activistClosedName}
								onChange={this.comboChanged.bind(this, 'activistClosedName', 'activistLocked')}
							/>
						</div>
					</div>	
				</div>

				<div className="row">

					<div className="col-md-3 col-md-offset-9">
						<div className="box-button-single">
							<button title="חפש" type="submit" className="btn btn-primary srchBtn pull-right"
								onClick={this.searchElectionsActivists.bind(this)} disabled={!this.validInput}>חפש</button>
						</div>
						<div className="box-button-single">
							<button title="נקה הכל" type="submit" className="btn btn-danger pull-left"
								style={{ marginTop: 22 }} onClick={this.resetSearchFields.bind(this)}>נקה הכל</button>
						</div>
					</div>
				</div>
		
			</form>

		);
	}

	render() {
		if (this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.search'] == true) {
			return this.renderActivistsSearch();
		} else {
			return <div className="row">{'\u00A0'}</div>;
		}
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		currentCampaign: state.system.currentCampaign,
		userFilteredAreas: state.system.currentUserGeographicalFilteredLists.areas,
		userFilteredSubAreas: state.system.currentUserGeographicalFilteredLists.sub_areas,
		userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,
		streets: state.elections.activistsScreen.streets,
		electionRoles: state.elections.activistsScreen.electionRoles,
		searchFields: state.elections.activistsScreen.searchFields,
		electionCampaigns:state.elections.activistsScreen.electionCampaigns,
		loadedActivistsData: state.elections.activistsScreen.loadedActivistsData,
		isLoadingResults: state.elections.activistsScreen.isLoadingResults
	};
}

export default connect(mapStateToProps)(withRouter(ActivistsSearchFields));