import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Collapse from 'react-collapse';
import ReactWidgets from 'react-widgets';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import moment from 'moment';

import * as SystemActions from '../../../actions/SystemActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import store from '../../../store';
import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
import SectorialFiltersModal from '../../global/SectorialFiltersModal';
import { validateEmail, parseDateToPicker, parseDateFromPicker, validatePhoneNumber } from '../../../libs/globalFunctions';
import UserRequestTopicsModal from './UserRequestTopicsModal';

class UserRoles extends React.Component {

	constructor(props) {
		super(props);
		this.textIgniter();
		this.styleIgniter();
		momentLocalizer(moment);
		this.validatorsStyle = {};
		this.arrayOfTheRoles = [];
		this.editDepartmentsArray = [];
	}

	componentWillMount() {
		SystemActions.loadRoles(this.props.dispatch);
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.CLEAR_TEAMS_DATA });
		this.state = {
			showUserTopicsModal : false,
		}
		SystemActions.loadUserRequestsTopics(this.props.dispatch, this.props.router.params.userKey);
	}
	componentDidUpdate(nextProps){
		if(this.props.router.params.userKey != nextProps.router.params.userKey){
			SystemActions.loadUserRequestsTopics(this.props.dispatch, nextProps.router.params.userKey);
		}
	}
	textIgniter() {
		this.lables = {
			roles: 'תפקידים',
			role: 'תפקיד',
			newRole: '+ תפקיד חדש',
			oneMainRoleErrorMsg: '* למשתמש חייב להיות תפקיד אחד עיקרי',
			startDate: 'תאריך התחלה',
			ballot: 'קלפי',
			neighborhood: 'שכונה',
			cluster: 'אשכול',
			subArea: 'תת אזור',
			area: 'אזור',
			city: 'עיר',
			error: 'שגיאה',
			fillAllFields: 'יש למלא את כל שדות החובה',
			model: 'מודול',
			main: 'עיקרי',
			createUser: 'צור משתמש',
			save: 'שמירה',
		}
	}

	styleIgniter() {

	}

	editFromDateChange(value, format, filterParams, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_FROM_DATE_CHANGE,
			                  editRowIndex: filterParams, data: value });
	}

	editToDateChange(value, format, filterParams, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_TO_DATE_CHANGE,
			                  editRowIndex: filterParams, data: value });
	}

	updateCollapseStatus(container) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_SCREEN_COLLAPSE_CHANGE, container });
	}

	showAddNewUserRole() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.roles' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_ADD_USER_ROLE });
	}

	newRoleModuleNameChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.NEW_ROLE_MODULE_NAME_CHANGE, data: e.target.value });
	}

	newRoleUserRoleNameChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.NEW_ROLE_USER_ROLE_NAME_CHANGE, data: e.target.value });
	}

	changeEditModuleName(index, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_MODULE_CHANGE, data: e.target.value, editRowIndex: index });
	}

	changeEditRoleName(index, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_ROLE_CHANGE, data: e.target.value, editRowIndex: index });
	}

	changeEditTeamName(index, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_TEAM_NAME_CHANGE, data: e.target.value, editRowIndex: index });
	}

	changeEditDepartmentName(index, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_DEPARTMENT_NAME_CHANGE, data: e.target.value, editRowIndex: index });
	}

	newFromDateChange(value, format, filterName) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.NEW_ROLE_USER_FROM_DATE_CHANGE, data: value });
	}

	newToDateChange(value, format, filterName) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.NEW_ROLE_USER_TO_DATE_CHANGE, data: value });
	}

	newGeoTemplateBallotChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_BALLOT_CHANGE, data: e.target.value });
	}

	newRoleUserDepNameChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.NEW_ROLE_USER_DEP_NAME_CHANGE, data: e.target.value });
	}

	newGeoTemplateClusterChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE, data: e.target.value });
		let clusterID = this.getClusterID(e.target.value);
		SystemActions.loadBallotsByCluster(this.props.dispatch, clusterID, -1);
	}

	newMainGeoFilterLabelNameChange(e) {//?? double function
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_LABEL_NAME_CHANGED, data: e.target.value });
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_LABEL_CHANGE, data: e.target.value });
	}

	newMainGeoFilterSubAreaNameChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: e.target.value });

		let areaID = this.getAreaID(this.props.geoFilterModalScreen.mainFilterName);
		let subAreaKey = this.getSubAreaID(e.target.value);
		if(subAreaKey != -1){
			SystemActions.loadCitiesByAreaAndSubArea(this.props.dispatch, areaID, subAreaKey);
		}

	}

	newMainGeoFilterCityNameChange(e) {
		let cityID = this.getGeoFilterCityID(e.target.value);
		if (cityID > 0) {
			SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, cityID);
		}
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED, data: e.target.value });
	}

	newMainGeoFilterNeighborhoodNameChange(e) {
		let cityID = -1;
		if (this.props.geoFilterModalScreen.entityType == 1) {
			cityID = this.props.geoFilterModalScreen.entityID;
		} else {
			cityID = this.getGeoFilterCityID(this.props.geoFilterModalScreen.cityName);
		}

		let NeighborhoodID = this.getGeoFilterNeighborhoodID(e.target.value);
		SystemActions.loadOnlyClustersByCityAndNeighborhood(this.props.dispatch, cityID, NeighborhoodID);
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED, data: e.target.value });
	}

	newMainGeoFilterClusterNameChange(e) {
		let cityID = -1, neighborhoodID = -1;
		if (this.props.geoFilterModalScreen.entityType == 1) {
			cityID = this.props.geoFilterModalScreen.entityID;
		}
		else if (this.props.geoFilterModalScreen.entityType == 2) {
			neighborhoodID = this.props.geoFilterModalScreen.entityID;
		}

		let ClusterID = this.getGeoFilterClusterID(e.target.value);
		if (ClusterID > 0) {
			SystemActions.loadBallotsByCluster(this.props.dispatch, ClusterID);
		}

		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED, data: e.target.value });
	}

	newMainGeoFilterBallotNameChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED, data: e.target.value });
	}

	editIsMainChange(index, e) {
		if (this.props.userRoles != undefined && this.props.userRoles.length >= 1) {
			let isMainCounter = 0;
			for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
				if (this.props.userRoles[i].main) {
					isMainCounter++
				}
			}

			if (isMainCounter > 1) {
				this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_IS_MAIN_CHANGE, editRowIndex: index, data: (e.target.checked ? '1' : '0') });
			} else {
				this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_IS_MAIN_CHANGE, editRowIndex: index, data: '1' });
			}
		} else {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.EDIT_IS_MAIN_CHANGE, editRowIndex: index, data: '1' });
		}

	}

	getGeoFilterCityID(cityName) {
		let cityID = -1;
		for (let i = 0, len = this.props.geoFilterModalScreen.cities.length; i < len; i++) {
			if (this.props.geoFilterModalScreen.cities[i].name == cityName) {
				cityID = this.props.geoFilterModalScreen.cities[i].id;
				break;
			}
		}
		return cityID;
	}

	getGeoFilterClusterID(cluserName) {
		let returnedValue = -1;
		for (let i = 0, len = this.props.geoFilterModalScreen.clusters.length; i < len; i++) {
			if (this.props.geoFilterModalScreen.clusters[i].name == cluserName) {
				returnedValue = this.props.geoFilterModalScreen.clusters[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getGeoFilterBallotID(ballotName) {
		let returnedValue = -1;
		for (let i = 0, len = this.props.geoFilterModalScreen.ballots.length; i < len; i++) {
			if (this.props.geoFilterModalScreen.ballots[i].name == ballotName) {
				returnedValue = this.props.geoFilterModalScreen.ballots[i].id;
				break;
			}
		}
		return returnedValue;
	}

	/* This function returns city id by city name */
	getCityID(CityName) {
		let returnedValue = '';
		for (let i = 0, len = this.props.cities.length; i < len; i++) {
			if (this.props.cities[i].name == CityName) {
				returnedValue = this.props.cities[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getCityData(CityName) {
		let returnedValue = {};
		for (let i = 0, len = this.props.cities.length; i < len; i++) {
			if (this.props.cities[i].name == CityName) {
				returnedValue = this.props.cities[i];
				break;
			}
		}
		return returnedValue;
	}

	getStreetData(StreetName) {
		let returnedValue = {};
		for (let i = 0, len = this.props.streets.length; i < len; i++) {

			if (this.props.streets[i].name == StreetName) {
				returnedValue = this.props.streets[i];
				break;
			}
		}
		return returnedValue;
	}

	showTempArrayAddEditGeoFilterDlg(isAdding) {
		this.props.dispatch({
			type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_TEMP_ROLE_ARRAY,
			isAddingRole: isAdding, addingNewRoleToUser: this.props.addingUserRole
		});
	}

	showTempArrayAddEditSectorialFilterDlg(isAdding) {
		this.props.dispatch({
			type: GlobalActions.ActionTypes.GEO_FILTERS.ADD_NEW_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY,
			isAdding, addingNewRoleToUser: this.props.addingUserRole, data: 'הוספת מיקוד מגזרי לתפקיד חדש'
		});
	}

	constructFiltersForGeoFilterModal(entityType, entityID) {
		let returnedValue = '';
		let citiesItem = '', neighborhoodsItem = '', clustersItem = '', ballotsItem = '';
		let clusterID = this.getGeoFilterClusterID(this.props.geoFilterModalScreen.clusterName);

		if (clusterID != -1) {
			ballotsItem = <div>{this.lables.ballot}:&nbsp;<Combo value={this.props.geoFilterModalScreen.ballotName}
				onChange={this.newMainGeoFilterBallotNameChange.bind(this)} items={this.props.geoFilterModalScreen.ballots}
				className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>;
		}

		switch (entityType) {
			case 0:
				if (this.getGeoFilterCityID(this.props.geoFilterModalScreen.cityName) != -1) {
					neighborhoodsItem = <div>{this.lables.neighborhood}:&nbsp;<Combo value={this.props.geoFilterModalScreen.neighborhoodName}
						onChange={this.newMainGeoFilterNeighborhoodNameChange.bind(this)} items={this.props.geoFilterModalScreen.neighborhoods}
						className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>

					clustersItem = <div>{this.lables.cluster}:&nbsp;<Combo value={this.props.geoFilterModalScreen.clusterName}
						onChange={this.newMainGeoFilterClusterNameChange.bind(this)} items={this.props.geoFilterModalScreen.clusters}
						className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>;
				}
				if (this.props.editingGeographicalFilter && !this.loadOnce) {
					let areaKeyStr = '';
					this.loadOnce = true;
					for (let i = 0; i < this.props.areas.length; i++) {
						if (this.props.areas[i].name == this.props.geoFilterModalScreen.mainFilterName) {
							areaKeyStr = this.props.areas[i].key;
							break;
						}

					}
					SystemActions.loadSubAreas(store, areaKeyStr);
				}

				returnedValue = <div>{this.lables.subArea}:&nbsp;<Combo value={this.props.geoFilterModalScreen.subAreaName}
					onChange={this.newMainGeoFilterSubAreaNameChange.bind(this)} items={this.props.subAreas} className="form-combo-table"
					maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />

					{this.lables.city}:&nbsp;<Combo value={this.props.geoFilterModalScreen.cityName} inputStyle={this.invalidInputs.secondGeoFilterStyle}
						onChange={this.newMainGeoFilterCityNameChange.bind(this)} items={this.props.geoFilterModalScreen.cities}
						className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />

					{neighborhoodsItem}
					{clustersItem}
					{ballotsItem}
				</div>;
				break;
			case 1:
				returnedValue = <div>
					{this.lables.neighborhood}:&nbsp;<Combo inputStyle={this.invalidInputs.secondGeoFilterStyle} value={this.props.geoFilterModalScreen.neighborhoodName}
						onChange={this.newMainGeoFilterNeighborhoodNameChange.bind(this)} items={this.props.geoFilterModalScreen.neighborhoods}
						className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />

					{this.lables.cluster}:&nbsp;<Combo inputStyle={this.invalidInputs.secondGeoFilterStyle} value={this.props.geoFilterModalScreen.clusterName}
						onChange={this.newMainGeoFilterClusterNameChange.bind(this)} items={this.props.geoFilterModalScreen.clusters}
						className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />

					{this.lables.ballot}:&nbsp;<Combo value={this.props.geoFilterModalScreen.ballotName} onChange={this.newMainGeoFilterBallotNameChange.bind(this)}
						items={this.props.geoFilterModalScreen.ballots} className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />
				</div>;
				break;
			case 2:
				returnedValue = <div>
					{this.lables.cluster}:&nbsp;<Combo inputStyle={this.invalidInputs.secondGeoFilterStyle} value={this.props.geoFilterModalScreen.clusterName}
						onChange={this.newMainGeoFilterClusterNameChange.bind(this)} items={this.props.geoFilterModalScreen.clusters}
						className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />
					{ballotsItem}
				</div>;
				break;
			case 3:
				returnedValue = <div>
					{this.lables.ballot}:&nbsp;<Combo inputStyle={this.invalidInputs.secondGeoFilterStyle} value={this.props.geoFilterModalScreen.ballotName}
						onChange={this.newMainGeoFilterBallotNameChange.bind(this)} items={this.props.geoFilterModalScreen.ballots} className="form-combo-table"
						maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />
				</div>;
				break;
			default:
				break;
		}

		return returnedValue;
	}

	newMainGeoFilterChange(e) {
		let teamFilterData = this.getMainTeamFilterData(e.target.value);
		if (teamFilterData != undefined) {
			switch (teamFilterData.entity_type) {
				case 0:
					SystemActions.loadCitiesByArea(this.props.dispatch, teamFilterData.entity_id);
					let areaKey = '-1';
					for (let i = 0, len = this.props.areas.length; i < len; i++) {
						if (this.props.areas[i].id == teamFilterData.entity_id) {
							areaKey = this.props.areas[i].key;
							break;
						}
					}
					SystemActions.loadSubAreas(store, areaKey);
					break;
				case 1:
					SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, teamFilterData.entity_id);
					break;
				case 2:
					SystemActions.loadClustersByNeighborhood(this.props.dispatch, teamFilterData.entity_id);
					break;
				case 3:
					SystemActions.loadBallotsByCluster(this.props.dispatch, teamFilterData.entity_id);
					break;
			}
		}
		this.props.dispatch({
			type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CHANGED, data: e.target.value,
			entity_type: teamFilterData == undefined ? '' : teamFilterData.entity_type,
			entity_id: teamFilterData == undefined ? '' : teamFilterData.entity_id,
		});
	}

	newGeoTemplateAreaChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: e.target.value });
		let areaID = this.getAreaID(e.target.value);

		SystemActions.loadCitiesByArea(this.props.dispatch, areaID, -1);
		let areaKey = '-1';
		for (let i = 0, len = this.props.areas.length; i < len; i++) {
			if (this.props.areas[i].name == e.target.value) {
				areaKey = this.props.areas[i].key;
				break;
			}
		}
		SystemActions.loadSubAreas(store, areaKey);
	}
	newGeoTemplateAreaGroupChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_GROUP_CHANGE, data: e.target.value });
	}

	newGeoTemplateCityChange(e) {
		let cityData = this.getCityData(e.target.value);
		let cityID = cityData.id;
		let areaKey = '';
		for (let i = 0, len = this.props.areas.length; i < len; i++) {
			if (this.props.areas[i].name == cityData.area_name) {
				areaKey = this.props.areas[i].key;
				this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: this.props.areas[i].name, resetSubAreas: '0' });
				break;
			}
		}

		SystemActions.loadSubAreas(store, areaKey);
		if (cityData.sub_area_name != '') {
			this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: cityData.sub_area_name });
		}
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE, data: e.target.value });
		SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, cityID, -1);
	}

	newGeoTemplateNeighborhoodChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE, data: e.target.value });
		let neighborhoodID = this.getNeighborhoodID(e.target.value);
		SystemActions.loadClustersByNeighborhood(this.props.dispatch, neighborhoodID, -1);
	}

	getNeighborhoodID(neighborhoodName) {
		let returnedValue = -1;
		for (let i = 0; i < this.props.userScreen.geoFilterModalScreen.neighborhoods.length; i++) {
			if (this.props.userScreen.geoFilterModalScreen.neighborhoods[i].name == neighborhoodName) {

				returnedValue = this.props.userScreen.geoFilterModalScreen.neighborhoods[i].id;
				break;
			}
		}
		return returnedValue;
	}

	newGeoTemplateSubAreaChange(e) {
		this.props.dispatch({
			type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: e.target.value
		});
		let areaID = this.getAreaID(this.props.geoFilterModalScreen.areaName);
		let subAreaKey = this.getSubAreaID(e.target.value);
		SystemActions.loadCitiesByAreaAndSubArea(this.props.dispatch, areaID, subAreaKey);
	}

	getSubAreaID(subAreaName , fieldName = 'key') {
		let returnedValue = -1;
		for (let i = 0, len = this.props.subAreas.length; i < len; i++) {
			if (this.props.subAreas[i].name == subAreaName) {
				returnedValue = this.props.subAreas[i][fieldName];
				break;
			}
		}
		return returnedValue;
	}

	getBallotID(ballotName) {
		let returnedValue = -1;
		for (let i = 0; i < this.props.userScreen.geoFilterModalScreen.ballots.length; i++) {

			if (this.props.userScreen.geoFilterModalScreen.ballots[i].name == ballotName) {
				returnedValue = this.props.userScreen.geoFilterModalScreen.ballots[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getCityData(CityName) {
		let returnedValue = {};
		for (let i = 0, len = this.props.cities.length; i < len; i++) {
			if (this.props.cities[i].name == CityName) {
				returnedValue = this.props.cities[i];
				break;
			}
		}
		return returnedValue;
	}

	isButtonDisabled() {

		if (this.props.addingUser) return true;

		let arrStr1 = '';
		let arrStr2 = '';
		let isDuplicate = false;

		if (this.props.originalUserPhones != undefined && this.props.selectedUserData.userPhones != undefined) {
			for (let i = 0, len = this.props.originalUserPhones.length; i < len; i++) {
				arrStr1 += this.props.originalUserPhones[i].name + this.props.originalUserPhones[i].phone_number;
			}

			for (let i = 0, len = this.props.selectedUserData.userPhones.length; i < len; i++) {
				let currentItem = this.props.selectedUserData.userPhones[i];

				if (validatePhoneNumber(currentItem.phone_number.split('-').join('')) && this.getPhoneTypeID(currentItem.name) != -1) {
					arrStr2 += currentItem.name + currentItem.phone_number;
				}

				for (let k = 0; k < len; k++) {
					if ((currentItem.phone_number.replace(/\D/g, '') == this.props.selectedUserData.userPhones[k].phone_number.replace(/\D/g, '')) && (i != k)) {
						isDuplicate = true;
					}
				}
			}
		}

		if (isDuplicate) { return true; }
		if (this.props.dirtyComponents.length == 0 || this.props.savingChanges) { return true; }
		if (this.props.dirtyComponents.length == 0 && arrStr1 == arrStr2) { return true; }
		return false;

	}

	getDepIdByName(depName) {
		let returnedValue = null;
		for (let i = 0, len = this.props.roleDepartments.length; i < len; i++) {
			if (this.props.roleDepartments[i].name == depName) {
				returnedValue = this.props.roleDepartments[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getTeamDataByTeam(teamName) {
		let returnedValue = { id: -1, key: '', name: '', departments: [] };
		for (let i = 0, len = this.props.teams.length; i < len; i++) {
			if (this.props.teams[i].name == teamName) {
				returnedValue = this.props.teams[i];
				break;
			}
		}
		return returnedValue;
	}


	getRoleIdByName(roleName) {
		let returnedValue = -1;
		let arrayOfTheRoles = [];
		if (this.props.addNewUserRoleScreen.moduleName != undefined && this.props.addNewUserRoleScreen.moduleName != '') {
			for (let k = 0, len = this.props.modules.length; k < len; k++) {

				if (this.props.modules[k].name == this.props.addNewUserRoleScreen.moduleName) {
					arrayOfTheRoles = this.props.modules[k].roles;
					break;
				}
			}
		}

		for (let i = 0, len = arrayOfTheRoles.length; i < len; i++) {
			if (arrayOfTheRoles[i].name == roleName) {
				returnedValue = arrayOfTheRoles[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getCityID(CityName) {
		let returnedValue = -1;
		for (let i = 0, len = this.props.cities.length; i < len; i++) {
			if (this.props.cities[i].name == CityName) {
				returnedValue = this.props.cities[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getAreaID(areaName) {
		let areaID = -1;
		for (let i = 0; i < this.props.areas.length; i++) {

			if (this.props.areas[i].name == areaName) {
				areaID = this.props.areas[i].id;
				break;
			}
		}
		return areaID;
	}
	getAreaGroupID(areaGroupName) {
		let areaGroupID = -1;
		for (let i = 0; i < this.props.areasGroups.length; i++) {

			if (this.props.areasGroups[i].name == areaGroupName) {
				areaGroupID = this.props.areasGroups[i].id;
				break;
			}
		}
		return areaGroupID;
	}

	getMainTeamFilterData(teamFilterName) {
		if (this.props.modalGeographicalFilterRoleIndex == -1) {
			if (this.props.addingUserRole) {
				for (let i = 0, len = this.props.tempUserRoleTeamGeoFilters.length; i < len; i++) {
					if (this.props.tempUserRoleTeamGeoFilters[i].full_path_name == teamFilterName) {
						return this.props.tempUserRoleTeamGeoFilters[i];
						break;
					}
				}
			}
			else {
				return [];
			}
		}
		else {
			for (let i = 0, len = this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length; i < len; i++) {
				if (this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters[i].full_path_name == teamFilterName) {
					return this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters[i];
					break;
				}
			}
		}
	}

	getGeoFilterBallotID(ballotName) {
		let returnedValue = -1;
		for (let i = 0, len = this.props.geoFilterModalScreen.ballots.length; i < len; i++) {
			if (this.props.geoFilterModalScreen.ballots[i].name == ballotName) {
				returnedValue = this.props.geoFilterModalScreen.ballots[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getGeoFilterClusterID(cluserName) {
		let returnedValue = -1;
		for (let i = 0, len = this.props.geoFilterModalScreen.clusters.length; i < len; i++) {
			if (this.props.geoFilterModalScreen.clusters[i].name == cluserName) {
				returnedValue = this.props.geoFilterModalScreen.clusters[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getGeoFilterNeighborhoodID(neighborhoodName) {
		let returnedValue = -1;
		for (let i = 0, len = this.props.geoFilterModalScreen.neighborhoods.length; i < len; i++) {
			if (this.props.geoFilterModalScreen.neighborhoods[i].name == neighborhoodName) {
				returnedValue = this.props.geoFilterModalScreen.neighborhoods[i].id;
				break;
			}
		}
		return returnedValue;
	}

	getClusterID(clusterName) {
		let returnedValue = -1;
		for (let i = 0; i < this.props.userScreen.geoFilterModalScreen.clusters.length; i++) {
			if (this.props.userScreen.geoFilterModalScreen.clusters[i].name == clusterName) {

				returnedValue = this.props.userScreen.geoFilterModalScreen.clusters[i].id;
				break;
			}
		}
		return returnedValue;
	}

	showEditSectorialFilterDialog(role_RowIndex, sectorial_RowIndex, definitionID, definitionGroupID, filterName, editSetorialFilterID, e) {
		let selectedSectorialFilter = '', tempMainGeoFilter = '', labelName = '';
		if (this.props.addingUserRole) { // editing sectorial-filter inside adding new role dialog
			this.props.dispatch({
				type: GlobalActions.ActionTypes.GEO_FILTERS.EDIT_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY,
				isAdding: 0, addingNewRoleToUser: this.props.addingUserRole, data: 'עריכת מיקוד קיים לתפקיד חדש',
				tempRowIndex: sectorial_RowIndex
			});

		}
		else { // editing sectorial-filter inside adding existing role dialog

			if (this.props.router.params.userKey == 'new') {
				this.props.dispatch({
					type: GlobalActions.ActionTypes.GEO_FILTERS.NEW_USER_OPEN_EDIT_EXISTING_GEO_FILTER_MODAL,
					data: 'עריכת פילטר מגזרי קיים', roleUserID: this.props.userRoles[role_RowIndex].id, sectorialEditRowIndex: sectorial_RowIndex, roleUserIndex: role_RowIndex,
					definitionID, definitionGroupID, filterName, editSetorialFilterID
				});
			}
			else {
				this.props.dispatch({
					type: GlobalActions.ActionTypes.GEO_FILTERS.OPEN_EDIT_EXISTING_GEO_FILTER_MODAL,
					data: 'עריכת פילטר מגזרי קיים', roleUserID: this.props.userRoles[role_RowIndex].id, sectorialEditRowIndex: sectorial_RowIndex, roleUserIndex: role_RowIndex,
					definitionID, definitionGroupID, filterName, editSetorialFilterID
				});
			}
		}
	}

	showConfirmDeleteSectorialFilter(roleIndex, sectorialFilterIndex, e) {
		if (this.props.addingUserRole) {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: sectorialFilterIndex, addingNewRole: true });

		}
		else {
			if (this.props.router.params.userKey == 'new') { //delete from roles temp array
				this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: sectorialFilterIndex });
			}
			else { //delete from database
				this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: sectorialFilterIndex });
			}
		}
	}

	formatDateOnlyString(strr) {
		if (strr == null) {
			return '';
		} else {
			if (strr.length == 10) {
				let strArray = strr.split('-');

				if (strArray.length == 3) {
					return strArray[2] + '/' + strArray[1] + '/' + strArray[0];
				}
			}
			return strr;
		}
	}

	changeNewIsMain(e) {
		if (this.props.userRoles != undefined && this.props.userRoles.length >= 1) {
			let isMainCounter = 0;
			for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
				if (this.props.userRoles[i].main) {
					isMainCounter++
				}
			}
			if (isMainCounter == 0) {
				this.refs.isMain.checked = true;
			}
		}
		else {
			this.refs.isMain.checked = true;
		}
	}

	getTeamDataByTeam(teamName) {
		let returnedValue = { id: -1, key: '', name: '', departments: [] };
		for (let i = 0, len = this.props.teams.length; i < len; i++) {
			if (this.props.teams[i].name == teamName) {
				returnedValue = this.props.teams[i];
				break;
			}
		}
		return returnedValue;
	}

	newRoleUserTeamNameChange(e) {
		let currentTeamRow = this.getTeamDataByTeam(e.target.value);
		this.props.dispatch({
			type: SystemActions.ActionTypes.USERS.NEW_ROLE_USER_TEAM_NAME_CHANGE, data: e.target.value,
			departments: currentTeamRow.departments, teamGeoFilters: (currentTeamRow == undefined ? [] : currentTeamRow.geoTemplates)
		});
	}

	showConfirmDelete(index, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_MODAL, deleteRowIndex: index });
	}

	setRowEditing(index, isEditing, e) {
		if (isEditing) {
			this.originalModuleName = this.props.userRoles[index].module_name;
			this.originalRoleName = this.props.userRoles[index].name;
			this.originalTeamName = this.props.userRoles[index].team_name;
			this.originalDepartmentName = this.props.userRoles[index].team_department_name;
			this.originalFromDate = this.props.userRoles[index].from_date;
			this.originalToDate = this.props.userRoles[index].to_date;
			this.originalMain = this.props.userRoles[index].main;
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SET_ROLE_USER_ROW_EDITING, editRowIndex: index, isEditing: isEditing });
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.roles' });
		}
		else {
			this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'system.users.roles' });
			this.props.dispatch({
				type: SystemActions.ActionTypes.USERS.SET_ROLE_USER_ROW_EDITING, editRowIndex: index, isEditing: isEditing
				, moduleName: this.originalModuleName
				, roleName: this.originalRoleName
				, teamName: this.originalTeamName
				, departmentName: this.originalDepartmentName
				, fromDate: this.originalFromDate
				, toDate: this.originalToDate
				, main: this.originalMain
			});
		}
	}

	saveEditedChanges(index, e) {
		if (this.editModuleNameMissing || this.editRoleNameMissing || this.editTeamID == -1 || this.editFromDate == '') {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.OPEN_GLOBAL_ERROR_MODAL, headerText: this.lables.error, contentText: this.lables.fillAllFields });
		}
		else {
			if (this.props.router.params.userKey == 'new') {
				let geoTemplates = this.getTeamDataByTeam(this.props.userRoles[index].team_name).geoTemplates;
				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.SAVE_USER_ROLE_TO_TEMP_ARRAY,
					editRowIndex: index,
					row_id: this.props.userRoles[index].id,
					moduleName: this.props.userRoles[index].module_name,
					roleName: this.props.userRoles[index].name,
					isMain: this.props.userRoles[index].main,
					teamName: this.props.userRoles[index].team_name,
					depName: this.props.userRoles[index].team_department_name,
					geoFilters: geoTemplates,
					fromDate: this.props.userRoles[index].from_date,
					toDate: this.props.userRoles[index].to_date,

				});
			} else {
				SystemActions.SaveExistingRoleByUser(this.props.dispatch, this.props.router.params.userKey, index,
					                                 this.props.userRoles[index].id, this.editRoleID,
					                                 this.editTeamID, this.editDepartmentID,
					                                 this.props.userRoles[index].from_date,
					                                 this.props.userRoles[index].to_date,
					                                 this.props.userRoles[index].main);
			}
			this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'system.users.roles' });
		}
	}

	doGeoFilterAction(isValidFilter) {
		let teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
		let geoTemplates = teamData.geoTemplates;
		let addToInheritedFilters = true;
		if (this.props.addingUserRole) {
			if (geoTemplates == undefined || geoTemplates.length == 0) {
				addToInheritedFilters = false;
			}
		} else {
			if (this.props.modalGeographicalFilterRoleIndex == -1 || this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length == 0) {
				addToInheritedFilters = false;
			}
		}

		if (addToInheritedFilters == false) {
			if (!isValidFilter || this.props.userScreen.geoFilterModalScreen.labelName.length <= 3) {

			} else {
				this.loadOnce = false;
				let entityType = -1;

				let entityID = this.getAreaGroupID(this.props.userScreen.geoFilterModalScreen.areaGroupName);

				let areaID = this.getAreaID(this.props.userScreen.geoFilterModalScreen.areaName);
				let subAreaID = this.getSubAreaID(this.props.userScreen.geoFilterModalScreen.subAreaName , 'id');
				let cityID = this.getCityID(this.props.userScreen.geoFilterModalScreen.cityName);

				if(areaID != -1){

					entityType = 0;
					entityID = areaID;

					if (cityID != -1) {
						entityType = 1;
						entityID = cityID;

						let neighborhoodID = this.getNeighborhoodID(this.props.userScreen.geoFilterModalScreen.neighborhoodName);
						if (neighborhoodID != -1) {
							entityType = 2;
							entityID = neighborhoodID;
						}

						let clusterID = this.getClusterID(this.props.userScreen.geoFilterModalScreen.clusterName);
						if (clusterID != -1) {
							entityType = 3;
							entityID = clusterID;

							let ballotID = this.getBallotID(this.props.userScreen.geoFilterModalScreen.ballotName);
							if (ballotID != -1) {
								entityType = 4;
								entityID = ballotID;
							}
						}
					} else if(subAreaID != -1){
							entityType = 5;
							entityID = subAreaID;
					}
				}
				if (this.props.addingUserRole) {
					if (this.props.router.params.userKey != 'new') {
						if (this.props.addingGeographicalFilter) {
							let newTempObject = {
								entity_id: entityID,
								original_entity_id: this.props.geoFilterModalScreen.entityID,
								area_id: this.getAreaID(this.props.geoFilterModalScreen.areaName),
								area_name: this.props.geoFilterModalScreen.areaName,
								sub_area_id: subAreaID,
								area_name: this.props.geoFilterModalScreen.subAreaName,
								city_id: this.getCityID(this.props.geoFilterModalScreen.cityName),
								city_name: this.props.geoFilterModalScreen.cityName,
								neighborhood_id: this.getNeighborhoodID(this.props.geoFilterModalScreen.neighborhoodName),
								neighborhood_name: this.props.geoFilterModalScreen.neighborhoodName,
								cluster_id: this.getClusterID(this.props.geoFilterModalScreen.clusterName),
								cluster_name: this.props.geoFilterModalScreen.clusterName,
								ballot_id: this.getBallotID(this.props.geoFilterModalScreen.ballotName),
								ballot_name: this.props.geoFilterModalScreen.ballotName,
								entity_type: entityType,
								name: this.props.geoFilterModalScreen.labelName,
								full_path_name: this.props.geoFilterModalScreen.mainFilterName,
								team_id: teamData.id,
								inherited: 1,
								inherited_id: 0
							};

							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.ADD_GEO_FILTER_TO_TEMP_USER_ROLES_ARR
								, data: newTempObject
							});
						} else if (this.props.editingGeographicalFilter) {

							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.EDIT_GEO_FILTER_TO_TEMP_USER_ROLES_ARR
								, geoRowIndex: this.props.confirmDeleteRoleGeoFilterByUserIndex,
								entity_type: entityType,
								entity_id: entityID,
								name: this.props.geoFilterModalScreen.labelName,
								full_path_name: this.props.geoFilterModalScreen.mainFilterName,
							});
						}

					}
				} else {

					if (this.props.router.params.userKey != 'new') {
						let roleRowIndex = this.props.modalGeographicalFilterRoleIndex;
						let roleUserID = this.props.userRoles[roleRowIndex].id;

						if (this.props.addingGeographicalFilter) {//add new geographical filter
							SystemActions.addNewGeographicFilterToRoleUser(this.props.dispatch,
								this.props.router.params.userKey, entityType, entityID, this.props.userScreen.geoFilterModalScreen.labelName, roleUserID, roleRowIndex, 0);
						} else if (this.props.editingGeographicalFilter) { //edit existing geographical filter
							let geoFilterID = this.props.userRoles[roleRowIndex].geo_filters[this.props.confirmDeleteRoleGeoFilterByUserIndex].id;
							SystemActions.editExistingGeographicFilterToRoleUser(this.props.dispatch,
								this.props.router.params.userKey, geoFilterID, entityType, entityID, this.props.userScreen.geoFilterModalScreen.labelName, roleUserID, roleRowIndex, 0);
						}
					}
				}
			}
		} else {

			if (!this.missingMainGeoFilter && !this.missingSecondGeoFilter && !this.missingMainGeoFilterLabel) {
				this.loadOnce = false;
				let entityType = this.props.geoFilterModalScreen.entityType;
				let entityID = this.props.geoFilterModalScreen.entityID;
				let fullNamePath = this.props.geoFilterModalScreen.labelName;
				switch (entityType) {
					case 0:
						let cityID = this.getCityID(this.props.geoFilterModalScreen.cityName);
						if (cityID != -1) {
							entityType = 1;
							entityID = cityID;

							let neighborhoodID = this.getGeoFilterNeighborhoodID(this.props.geoFilterModalScreen.neighborhoodName);
							let clusterID = this.getGeoFilterClusterID(this.props.geoFilterModalScreen.clusterName);
							if (neighborhoodID != -1 && clusterID == -1) {
								entityType = 2;
								entityID = neighborhoodID;

							} else if ((neighborhoodID == -1 && clusterID != -1)) {
								entityType = 3;
								entityID = clusterID;

							} else if ((neighborhoodID != -1 && clusterID != -1)) {
								entityType = 3;
								entityID = clusterID;
							}
							if (entityType != 1) {
								let ballotID = this.getGeoFilterBallotID(this.props.geoFilterModalScreen.ballotName);
								if (ballotID != -1) {
									entityType = 4;
									entityID = ballotID;
								}
							}
						} else {
							let subAreaID = this.getSubAreaID(this.props.userScreen.geoFilterModalScreen.subAreaName, 'id');
							entityType = 5;
							entityID = subAreaID;
						}
						break;
					case 1:

						let neighborhoodID = this.getGeoFilterNeighborhoodID(this.props.geoFilterModalScreen.neighborhoodName);
						let clusterID = this.getGeoFilterClusterID(this.props.geoFilterModalScreen.clusterName);

						entityType = 2;
						entityID = neighborhoodID;
						if (neighborhoodID != -1 && clusterID == -1) {
							entityType = 2;
							entityID = neighborhoodID;
						} else if ((neighborhoodID == -1 && clusterID != -1)) {
							entityType = 3;
							entityID = clusterID;
						} else if ((neighborhoodID != -1 && clusterID != -1)) {
							entityType = 3;
							entityID = clusterID;
						}
						let ballotID = this.getGeoFilterBallotID(this.props.geoFilterModalScreen.ballotName);

						if (ballotID != -1) {
							entityType = 4;
							entityID = ballotID;
						}
						break;
					case 2:

						clusterID = this.getGeoFilterClusterID(this.props.geoFilterModalScreen.clusterName);
						if (clusterID != -1) {
							entityType = 3;
							entityID = clusterID;

							let ballotID = this.getGeoFilterBallotID(this.props.geoFilterModalScreen.ballotName);
							if (ballotID != -1) {
								entityType = 4;
								entityID = ballotID;

							}
						}
						break;
					case 3:
						entityType = 4;

						ballotID = this.getGeoFilterBallotID(this.props.geoFilterModalScreen.ballotName);
						if (ballotID != -1) {
							entityType = 4;
							entityID = ballotID;

						}
						break;
				}
				let inheritedID = null;
				if (this.props.addingUserRole) {
					if (this.props.addingGeographicalFilter) {
						if (this.props.tempUserRoleTeamGeoFilters != undefined) {
							for (let i = 0; i < this.props.tempUserRoleTeamGeoFilters.length; i++) {
								if (this.props.tempUserRoleTeamGeoFilters[i].full_path_name == this.props.geoFilterModalScreen.mainFilterName) {
									inheritedID = this.props.tempUserRoleTeamGeoFilters[i].id;
									break;
								}
							}

						}

						let newTempObject = {
							entity_id: entityID,
							original_entity_id: this.props.geoFilterModalScreen.entityID,
							area_id: this.getAreaID(this.props.geoFilterModalScreen.areaName),
							area_name: this.props.geoFilterModalScreen.areaName,
							city_id: this.getCityID(this.props.geoFilterModalScreen.cityName),
							city_name: this.props.geoFilterModalScreen.cityName,
							neighborhood_id: this.getNeighborhoodID(this.props.geoFilterModalScreen.neighborhoodName),
							neighborhood_name: this.props.geoFilterModalScreen.neighborhoodName,
							cluster_id: this.getClusterID(this.props.geoFilterModalScreen.clusterName),
							cluster_name: this.props.geoFilterModalScreen.clusterName,
							ballot_id: this.getBallotID(this.props.geoFilterModalScreen.ballotName),
							ballot_name: this.props.geoFilterModalScreen.ballotName,
							entity_type: entityType,
							name: this.props.geoFilterModalScreen.labelName,
							full_path_name: this.props.geoFilterModalScreen.mainFilterName,
							team_id: this.props.tempUserRoleTeamGeoFilters[0].team_id,
							inherited: 1,
							inherited_id: inheritedID
						};

						this.props.dispatch({ type: SystemActions.ActionTypes.USERS.ADD_GEO_FILTER_TO_TEMP_USER_ROLES_ARR, data: newTempObject });
					} else if (this.props.editingGeographicalFilter) {

						this.props.dispatch({
							type: SystemActions.ActionTypes.USERS.EDIT_GEO_FILTER_TO_TEMP_USER_ROLES_ARR
							, geoRowIndex: this.props.confirmDeleteRoleGeoFilterByUserIndex,
							entity_type: entityType,
							entity_id: entityID,
							name: this.props.geoFilterModalScreen.labelName,
							full_path_name: this.props.geoFilterModalScreen.mainFilterName,
						});
					}
				} else {

					if (this.props.router.params.userKey == 'new') {
						if (this.props.addingGeographicalFilter) {

							let newTempObject = {
								entity_id: entityID,
								entity_type: entityType,
								name: this.props.geoFilterModalScreen.labelName,
								full_path_name: this.props.geoFilterModalScreen.mainFilterName,
								team_id: this.props.tempUserRoleTeamGeoFilters[0].team_id,
								inherited: 1,
								inherited_id: inheritedID
							};

							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.ADD_GEO_FILTER_TO_TEMP_ARRAY_OF_USER_ROLES
								, data: newTempObject, roleUserIndex: this.props.modalGeographicalFilterRoleIndex
							});
						}
						else if (this.props.editingGeographicalFilter) {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.EDIT_GEO_FILTER_TO_NEW_USER_ROLES_TEMP_ARR
								, userRoleIndex: this.props.modalGeographicalFilterRoleIndex
								, geoRowIndex: this.props.confirmDeleteRoleGeoFilterByUserIndex,
								entity_type: entityType,
								entity_id: entityID,
								name: this.props.geoFilterModalScreen.labelName,
								full_path_name: this.props.geoFilterModalScreen.mainFilterName,
							});
						}
					} else { //existing user
						if (this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters != undefined) {
							for (let i = 0; i < this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length; i++) {
								if (this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters[i].full_path_name == this.props.geoFilterModalScreen.mainFilterName) {
									inheritedID = this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters[i].id;
									break;
								}
							}

						}

						let roleRowIndex = this.props.modalGeographicalFilterRoleIndex;
						let roleUserID = this.props.userRoles[roleRowIndex].id;

						if (this.props.addingGeographicalFilter) {//add new geographical filter

							SystemActions.addNewGeographicFilterToRoleUser(this.props.dispatch,
								this.props.router.params.userKey, entityType, entityID, fullNamePath, roleUserID, roleRowIndex, inheritedID);
						} else if (this.props.editingGeographicalFilter) { //edit existing geographical filter
							let geoFilterID = this.props.userRoles[roleRowIndex].geo_filters[this.props.confirmDeleteRoleGeoFilterByUserIndex].id;
							SystemActions.editExistingGeographicFilterToRoleUser(this.props.dispatch,
								this.props.router.params.userKey, geoFilterID, entityType, entityID, fullNamePath, roleUserID, roleRowIndex, inheritedID);
						}
					}
				}
			}
		}
		this.hideGeoFilterModal();
	}

	hideGeoFilterModal() {
		this.loadOnce = false;
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CLOSE_GEO_FILTER_DIALOG });
	}

	parseDate(value, format = 'DD/MM/YYYY') {
		let date = moment(value, [
			'DD/MM/YYYY', 'YYYY/MM/DD',
			'DD-MM-YYYY', 'YYYY-MM-DD',
			'DD/MM/YYYY HH:mm:ss', 'YYYY/MM/DD HH:mm:ss',
			'DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss'
		], true);

		return (date.isValid() ? date.format(format) : null);
	}

	addNewCallRoleOfUser() {
		let isMain = (this.refs.isMain.checked) ? 1 : 0;
		if (this.missingNewTeamName || this.missingNewFromDate || this.missingNewToDate) {
			//missing required fields
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.OPEN_GLOBAL_ERROR_MODAL, headerText: this.lables.error, contentText: this.lables.fillAllFields });
		} else {
			let fromDate = this.parseDate(this.props.addNewUserRoleScreen.fromDate, 'YYYY-MM-DD');
			let toDate = this.parseDate(this.props.addNewUserRoleScreen.toDate, 'YYYY-MM-DD');

			if (this.props.router.params.userKey == 'new') {
				let tempModuleID = -1;
				let tempModuleName = '';
				for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
					if (this.props.userRoles[i].name == this.props.addNewUserRoleScreen.roleName) {
						tempModuleID = this.props.userRoles[i].module_id;
					}
				}
				if (tempModuleID != -1) {
					for (let i = 0, len = this.props.modules.length; i < len; i++) {
						if (this.props.modules[i].id == tempModuleID) {
							tempModuleName = this.props.modules[i].name;
						}
					}
				}

				let geoTemplates = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName).geoTemplates;
				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.ADD_NEW_ROLE_TO_TEMP_ARRAY,
					moduleName: tempModuleName,
					roleName: this.props.addNewUserRoleScreen.roleName,
					teamName: this.props.addNewUserRoleScreen.teamName,
					depName: this.props.addNewUserRoleScreen.departmentName,
					fromDate: this.props.addNewUserRoleScreen.fromDate,
					toDate: this.props.addNewUserRoleScreen.toDate,
					isMain: this.refs.isMain.checked ? '1' : '0',
					geoFilters: geoTemplates,
					extra_filters: this.props.tempUserRoleGeoFilters,
					sectorialFilters: this.props.tempRoleSectorialFilters,
				});

				this.refs.isMain.checked = false;
			} else {
				let formattedStr = '';
				for (let i = 0, len = this.props.tempUserRoleGeoFilters.length; i < len; i++) {
					formattedStr += this.props.tempUserRoleGeoFilters[i].name + '~' +
						this.props.tempUserRoleGeoFilters[i].entity_type + '~' +
						this.props.tempUserRoleGeoFilters[i].entity_id + '~' + this.props.tempUserRoleGeoFilters[i].original_entity_id + ';';
				}
				formattedStr = formattedStr.slice(0, -1);

				this.roleID = this.getRoleIdByName(this.props.addNewUserRoleScreen.roleName);
				this.teamID = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName).id;
				this.depID = this.getDepIdByName(this.props.addNewUserRoleScreen.departmentName);

				SystemActions.AddNewUserRole(this.props.dispatch, this.props.router.params.userKey, this.roleID, this.teamID, this.depID, fromDate, toDate, isMain, formattedStr, this.props.tempRoleSectorialFilters);
			}
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.roles' });
		}
	}

	closeAddNewUserRole() {
		this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'system.users.roles' });
		this.refs.isMain.checked = false;
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.HIDE_ADD_USER_ROLE });
		this.props.dispatch({ type: GlobalActions.ActionTypes.GEO_FILTERS.RESET_TEMP_SECTORIAL_FILTERS_ARRAY });
	}

	/* Change add user button to loader while loading */
	setAddingUserText() {
		if (this.props.addingUser) {
			return (<i className="fa fa-spinner fa-spin"></i>)
		} else {
			return ((this.props.router.params.userKey == 'new') ? this.lables.createUser : this.lables.save);
		}
	}

	showAddEditGeoFilterDlg(index, isAdding, e) {
		this.props.dispatch({
			type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_ROLE,
			isAddingRole: isAdding, roleUserID: this.props.userRoles[index].id,
			roleUserIndex: index
		});
	}

	showAddSectorialFilterDlg(index, e) {
		this.props.dispatch({
			type: GlobalActions.ActionTypes.GEO_FILTERS.OPEN_ADD_NEW_GEO_FILTER_MODAL,
			data: 'הוספת פילטר מגזרי חדש', roleUserID: this.props.userRoles[index].id, roleUserIndex: index
		});
	}

	showConfirmDeleteGeoFilter(roleIndex, geoFilterIndex, e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_GEO_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: geoFilterIndex });
	}

	showEditGeoFilterDialog(role_RowIndex, geo_RowIndex, e) {
		let selectedGeoFilter = '', tempMainGeoFilter = '', labelName = '';
		let entityType = -1, entityID = -1, originalEntityType = -1, originalEntityID = -1, rowIndex = -1;
		let areas = [], cities = [], neighborhoods = [], clusters = [], ballots = [];
		let teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
		let geoTemplates = teamData.geoTemplates;

		let addToInheritedFilters = true;
		if (this.props.addingUserRole) {
			if (geoTemplates == undefined || geoTemplates.length == 0) {
				addToInheritedFilters = false;
			}
		} else {
			if (this.props.userRoles[role_RowIndex].team_geo_filters.length == 0) {
				addToInheritedFilters = false;
			}
		}
		if (addToInheritedFilters == false) {
			if (this.props.addingUserRole) {

				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_TEMP_ROLE_ARRAY,
					isAddingRole: 0, geoRowIndex: geo_RowIndex,
					selectedGeoFilter, labelName: this.props.tempUserRoleGeoFilters[geo_RowIndex].name, entityType: this.props.tempUserRoleGeoFilters[geo_RowIndex].entity_type, entityID: this.props.tempUserRoleGeoFilters[geo_RowIndex].entity_id

				});

			} else {
				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_ROLE,
					isAddingRole: 0, roleUserIndex: role_RowIndex, geoRowIndex: geo_RowIndex,
					selectedGeoFilter, labelName, entityType, entityID

				});
				let theFilter = (this.props.userRoles[role_RowIndex].geo_filters[geo_RowIndex]);

				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_LABEL_NAME_CHANGED,
					data: theFilter.name
				});
				let areaGroupID=-1, areaID = -1, subAreaID = -1, subAreaName = '', areaName = '', cityName = '', cityID = -1, neighborhoodName = '', neighborhoodID = -1;
				let clusterID = -1, clusterName = '', ballotID = -1, ballotName = '';
				let areaKey = '';
				if(theFilter.area_name){
					for (let i = 0, len = this.props.areas.length; i < len; i++) {
						if (this.props.areas[i].name == theFilter.area_name) {
							areaKey = this.props.areas[i].key;
							break;
						}
					}
				}

				switch (theFilter.entity_type) {
					case -1:
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_GROUP_CHANGE, data: theFilter.area_group_name });
						areaGroupID = theFilter.area_group_id;
						break
					case 0:
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: theFilter.area_name });
						areaID = theFilter.area_id;
						SystemActions.loadSubAreas(store, areaKey);

						SystemActions.loadCitiesByArea(this.props.dispatch, areaID, -1);
						break
					case 5:
						areaID = theFilter.area_id;
						areaName = theFilter.area_name;
						let subAreaKey = this.getSubAreaID(theFilter.sub_area_name , 'key')
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: areaName });
						SystemActions.loadCitiesByAreaAndSubArea(this.props.dispatch, areaID, subAreaKey);
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: theFilter.sub_area_name });
						break;
					case 1:
						areaID = theFilter.area_id;
						areaName = theFilter.area_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: areaName });
						SystemActions.loadCitiesByArea(this.props.dispatch, areaID, -1);
						cityName = theFilter.city_name;
						SystemActions.loadSubAreas(store, areaKey);

						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: theFilter.sub_area_name });
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE, data: cityName });

						SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, theFilter.city_id);
						break;
					case 2:
						areaID = theFilter.area_id;
						areaName = theFilter.area_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: areaName });
						SystemActions.loadCitiesByArea(this.props.dispatch, areaID, -1);
						cityName = theFilter.city_name;
						SystemActions.loadSubAreas(store, areaKey);

						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: theFilter.sub_area_name });
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE, data: cityName });
						SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, theFilter.city_id);
						neighborhoodName = theFilter.neighborhood_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE, data: neighborhoodName });
						SystemActions.loadClustersByNeighborhood(this.props.dispatch, theFilter.neighborhood_id);
						break;
					case 3:
						areaID = theFilter.area_id;
						areaName = theFilter.area_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: areaName });
						SystemActions.loadCitiesByArea(this.props.dispatch, areaID, -1);
						cityName = theFilter.city_name;
						SystemActions.loadSubAreas(store, areaKey);

						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: theFilter.sub_area_name });
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE, data: cityName });
						SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, theFilter.city_id);
						if (theFilter.neighborhood_id == -1) {

						} else {
							neighborhoodName = theFilter.neighborhood_name;
							this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE, data: neighborhoodName });
							SystemActions.loadClustersByNeighborhood(this.props.dispatch, theFilter.neighborhood_id);
						}
						clusterName = theFilter.cluster_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE, data: clusterName });
						SystemActions.loadBallotsByCluster(this.props.dispatch, theFilter.cluster_id);
						break;
					case 4:
						areaID = theFilter.area_id;
						areaName = theFilter.area_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE, data: areaName });
						SystemActions.loadCitiesByArea(this.props.dispatch, areaID, -1);
						cityName = theFilter.city_name;
						SystemActions.loadSubAreas(store, areaKey);

						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE, data: theFilter.sub_area_name });
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE, data: cityName });
						SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, theFilter.city_id);
						if (theFilter.neighborhood_id == -1) {

						} else {
							neighborhoodName = theFilter.neighborhood_name;
							this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE, data: neighborhoodName });
							SystemActions.loadClustersByNeighborhood(this.props.dispatch, theFilter.neighborhood_id);
						}
						clusterName = theFilter.cluster_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE, data: clusterName });
						SystemActions.loadBallotsByCluster(this.props.dispatch, theFilter.cluster_id);
						ballotName = theFilter.ballot_name;
						this.props.dispatch({ type: SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_BALLOT_CHANGE, data: ballotName });
						break;


				}

			}
		} else {

			if (this.props.addingUserRole) {
				for (let i = 0, len = this.props.tempUserRoleGeoFilters.length; i < len; i++) {
					if (this.props.tempUserRoleGeoFilters[geo_RowIndex].name == this.props.tempUserRoleGeoFilters[i].name) {
						labelName = this.props.tempUserRoleGeoFilters[i].name;
						tempMainGeoFilter = this.props.tempUserRoleGeoFilters[i].full_path_name;
						originalEntityType = this.props.tempUserRoleGeoFilters[i].entity_type;
						originalEntityID = this.props.tempUserRoleGeoFilters[i].entity_id;

						for (let j = 0; j < this.props.tempUserRoleTeamGeoFilters.length; j++) {

							if (tempMainGeoFilter.indexOf(this.props.tempUserRoleTeamGeoFilters[j].full_path_name) >= 0) {
								selectedGeoFilter = this.props.tempUserRoleTeamGeoFilters[j].full_path_name;
								entityType = this.props.tempUserRoleTeamGeoFilters[j].entity_type;
								entityID = this.props.tempUserRoleTeamGeoFilters[j].entity_id;
							}
						}
					}
				}
			} else {
				for (let i = 0, len = this.props.userRoles[role_RowIndex].geo_filters.length; i < len; i++) {
					if (this.props.userRoles[role_RowIndex].geo_filters[geo_RowIndex].name == this.props.userRoles[role_RowIndex].geo_filters[i].name) {
						labelName = this.props.userRoles[role_RowIndex].geo_filters[i].name;
						tempMainGeoFilter = this.props.userRoles[role_RowIndex].geo_filters[i].full_path_name;
						originalEntityType = this.props.userRoles[role_RowIndex].geo_filters[i].entity_type;
						originalEntityID = this.props.userRoles[role_RowIndex].geo_filters[i].entity_id;
						rowIndex = i;

						for (let j = 0; j < this.props.userRoles[role_RowIndex].team_geo_filters.length; j++) {

							if (tempMainGeoFilter.indexOf(this.props.userRoles[role_RowIndex].team_geo_filters[j].full_path_name) >= 0) {
								selectedGeoFilter = this.props.userRoles[role_RowIndex].team_geo_filters[j].full_path_name;
								entityType = this.props.userRoles[role_RowIndex].team_geo_filters[j].entity_type;
								entityID = this.props.userRoles[role_RowIndex].team_geo_filters[j].entity_id;
							}
						}
					}
				}
			}

			let arrPath = [];
			let teamData = '', geoTemplates = '';

			switch (entityType) {
				case 0:
					if (this.props.addingUserRole) {
						teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
						geoTemplates = teamData.geoTemplates;
						if (geoTemplates != undefined) {
							geoTemplates = geoTemplates.concat(this.props.tempUserRoleGeoFilters);
						}
						arrPath = geoTemplates[role_RowIndex].full_path_name.split(' >> ');
					}

					if (originalEntityType == 1) {
						SystemActions.loadCitiesByArea(this.props.dispatch, entityID, originalEntityID);
						if (this.props.addingUserRole) {
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, geoTemplates[role_RowIndex].city_id, -1);
						} else {
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_id, -1, false);
						}
					}
					else if (originalEntityType == 2) {
						if (this.props.addingUserRole) {
							SystemActions.loadCitiesByArea(this.props.dispatch, entityID, originalEntityID);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].city_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, geoTemplates[role_RowIndex].city_id, -1);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});
						}
						else {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_name
							});

							SystemActions.loadCitiesByArea(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].area_id, originalEntityID);
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_id, originalEntityID, false);
						}
					} else if (originalEntityType == 3) {
						if (this.props.addingUserRole) {
							SystemActions.loadCitiesByArea(this.props.dispatch, entityID, originalEntityID);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].city_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, geoTemplates[role_RowIndex].city_id, originalEntityID);
							SystemActions.loadBallotsByCluster(this.props.dispatch, geoTemplates[role_RowIndex].cluster_id);
						} else {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_name
							});
							SystemActions.loadCitiesByArea(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].area_id, originalEntityID);
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_id, originalEntityID);
							SystemActions.loadBallotsByCluster(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
						}
					} else if (originalEntityType == 4) {
						if (this.props.addingUserRole) {
							SystemActions.loadCitiesByArea(this.props.dispatch, entityID, originalEntityID);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].city_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});

							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, geoTemplates[role_RowIndex].city_id, geoTemplates[role_RowIndex].cluster_id);
							SystemActions.loadBallotsByCluster(this.props.dispatch, geoTemplates[role_RowIndex].cluster_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].ballot_name
							});
						} else {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_name
							});

							SystemActions.loadCitiesByArea(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].area_id, originalEntityID);
							SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_id, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_name
							});
							SystemActions.loadBallotsByCluster(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].ballot_name
							});
						}
					}
					break;
				case 1:
					if (this.props.addingUserRole) {
						teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
						geoTemplates = teamData.geoTemplates;
						if (geoTemplates != undefined) {
							geoTemplates = geoTemplates.concat(this.props.tempUserRoleGeoFilters);
						}
						SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, geoTemplates[role_RowIndex].original_entity_id);
						arrPath = geoTemplates[role_RowIndex].full_path_name.split(' >> ');
					} else {
						SystemActions.loadNeiborhoodsAndClustersByCity(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].city_id);
					}

					if (originalEntityType == 2) {

						if (this.props.addingUserRole) {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});
						} else {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_name
							});
						}
					} else if (originalEntityType == 3) {
						if (this.props.addingUserRole) {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].cluster_name
							});
						} else {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_name
							});
						}
					} else if (originalEntityType == 4) {
						if (this.props.addingUserRole) {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].neighborhood_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].cluster_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].ballot_name
							});
							SystemActions.loadBallotsByCluster(this.props.dispatch, this.getClusterID(geoTemplates[role_RowIndex].cluster_name));
						} else {
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_name
							});
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].ballot_name
							});

							SystemActions.loadBallotsByCluster(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
						}
					}
					break;
				case 2:
					if (this.props.addingUserRole) {
						teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
						geoTemplates = teamData.geoTemplates;
						if (geoTemplates != undefined) {
							geoTemplates = geoTemplates.concat(this.props.tempUserRoleGeoFilters);
						}
						arrPath = geoTemplates[role_RowIndex].full_path_name.split(' >> ');
					}

					if (originalEntityType == 3) {
						if (this.props.addingUserRole) {
							SystemActions.loadClustersByNeighborhood(this.props.dispatch, geoTemplates[role_RowIndex].neighborhood_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].cluster_name
							});
							SystemActions.loadBallotsByCluster(this.props.dispatch, entityID);
						} else {
							SystemActions.loadClustersByNeighborhood(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_name
							});
							SystemActions.loadBallotsByCluster(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
						}
					} else if (originalEntityType == 4) {
						if (this.props.addingUserRole) {
							SystemActions.loadClustersByNeighborhood(this.props.dispatch, geoTemplates[role_RowIndex].neighborhood_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].cluster_name
							});
							SystemActions.loadBallotsByCluster(this.props.dispatch, entityID);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
								data: geoTemplates[role_RowIndex].ballot_name
							});
						} else {
							SystemActions.loadClustersByNeighborhood(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].neighborhood_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_name
							});
							SystemActions.loadBallotsByCluster(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
							this.props.dispatch({
								type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
								data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].ballot_name
							});
						}
					}

					break;
				case 3:
					if (this.props.addingUserRole) {
						teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
						geoTemplates = teamData.geoTemplates;
						if (geoTemplates != undefined) {
							geoTemplates = geoTemplates.concat(this.props.tempUserRoleGeoFilters);
						}
						arrPath = geoTemplates[role_RowIndex].full_path_name.split(' >> ');

						SystemActions.loadBallotsByCluster(this.props.dispatch, entityID);
						this.props.dispatch({
							type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
							data: geoTemplates[role_RowIndex].ballot_name
						});
					} else {
						this.props.dispatch({
							type: SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED,
							data: this.props.userRoles[role_RowIndex].geo_filters[rowIndex].ballot_name
						});
						SystemActions.loadBallotsByCluster(this.props.dispatch, this.props.userRoles[role_RowIndex].geo_filters[rowIndex].cluster_id);
					}
					break;
			}

			if (this.props.addingUserRole) {
				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_TEMP_ROLE_ARRAY,
					isAddingRole: 0, geoRowIndex: geo_RowIndex,
					selectedGeoFilter, labelName, entityType, entityID

				});
			} else {
				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_ROLE,
					isAddingRole: 0, roleUserIndex: role_RowIndex, geoRowIndex: geo_RowIndex,
					selectedGeoFilter, labelName, entityType, entityID

				});
			}
		}
	}

	validatorStyleIgnitor() {
		this.invalidInputs = {};
		let mainFilterID = -1;

		if (this.props.addingUserRole) {
			if (this.props.tempUserRoleTeamGeoFilters != undefined) {
				for (let i = 0, len = this.props.tempUserRoleTeamGeoFilters.length; i < len; i++) {
					if (this.props.tempUserRoleTeamGeoFilters[i].full_path_name == this.props.geoFilterModalScreen.mainFilterName) {
						mainFilterID = this.props.tempUserRoleTeamGeoFilters[i].id;
						break;
					}
				}
			}
		} else {
			if (this.props.modalGeographicalFilterRoleIndex != -1) {

				for (let i = 0, len = this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length; i < len; i++) {
					if (this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters[i].full_path_name == this.props.geoFilterModalScreen.mainFilterName) {
						mainFilterID = this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters[i].id;
						break;
					}
				}
			}
		}

		this.missingMainGeoFilterLabel = (this.props.geoFilterModalScreen.labelName.trim() == '') ? true : false;

		if (this.props.geoFilterModalScreen.mainFilterName == '' || this.props.geoFilterModalScreen.entityID == -1 || mainFilterID == -1) {
			this.missingMainGeoFilter = true;
			this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ff0000' };
			this.missingSecondGeoFilter = true;
		} else {
			this.missingMainGeoFilter = false;

			switch (this.props.geoFilterModalScreen.entityType) {
				case 0:
					if (this.getGeoFilterCityID(this.props.geoFilterModalScreen.cityName) == -1) {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ff0000' };
						this.missingSecondGeoFilter = true;
					} else {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ccc' };
						this.missingSecondGeoFilter = false;
					}
					break;
				case 1:
					if (this.getGeoFilterNeighborhoodID(this.props.geoFilterModalScreen.neighborhoodName) == -1 && this.getGeoFilterClusterID(this.props.geoFilterModalScreen.clusterName) == -1) {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ff0000' };
						this.missingSecondGeoFilter = true;
					} else {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ccc' };
						this.missingSecondGeoFilter = false;
					}
					break;
				case 2:
					if (this.getGeoFilterClusterID(this.props.geoFilterModalScreen.clusterName) == -1) {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ff0000' };
						this.missingSecondGeoFilter = true;
					} else {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ccc' };
						this.missingSecondGeoFilter = false;
					}
					break;
				case 3:

					if (this.getGeoFilterBallotID(this.props.geoFilterModalScreen.ballotName) == -1) {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ff0000' };
						this.missingSecondGeoFilter = true;
					} else {
						this.invalidInputs.secondGeoFilterStyle = { borderColor: '#ccc' };
						this.missingSecondGeoFilter = false;
					}
					break;
			}
		}

		if (!this.inputValidated(this.props.addNewUserRoleScreen.moduleName, this.props.modules, 'name')) {
			this.validatorsStyle.newModuleNameStyle = {
				borderColor: '#ff0000'
			};
		} else {
			this.validatorsStyle.newModuleNameStyle = {};
		}

		if (!this.inputValidated(this.props.addNewUserRoleScreen.roleName, this.arrayOfTheRoles, 'name')) {
			this.validatorsStyle.newRoleNameStyle = {
				borderColor: '#ff0000'
			};
		} else {
			this.validatorsStyle.newRoleNameStyle = {};
		}

		if (!this.inputValidated(this.props.addNewUserRoleScreen.teamName, this.props.teams, 'name')) {
			this.validatorsStyle.newTeamNameStyle = {
				borderColor: '#ff0000'
			};
		} else {
			this.validatorsStyle.newTeamNameStyle = {};
		}
	}
	displayUserTopicsModal(bool){
		this.setState({showUserTopicsModal: bool})
	}
	renderDisplayTopicModalButton(moduleName, otherRowInEditMode){
		let currentModule = this.props.modules.find((item) => { return item.name == moduleName})
		if( !otherRowInEditMode && currentModule && currentModule.system_name == 'requests'){
			return (<button onClick={this.displayUserTopicsModal.bind(this ,true)} type="button" className="btn btn-info btn-md" title='תצוגת נושאים המשוייכים למשתמש'>
				<i className="glyphicon glyphicon-th-list"></i>
			</button> )
		} else {
			return null;
		}

	}
	renderRoleItems() {
		this.roleItems = '';
		let editRoleItem = '';
		let deleteRoleItem = '';

		let self = this;
		if (Array.isArray(this.props.userRoles)) {
			let rowInEditMode = null;
			this.props.userRoles.forEach((item) => {
				if(item.is_editing) { rowInEditMode = item.id}
			})
			this.roleItems = this.props.userRoles.map(function (request, i) {
				let otherRowInEditMode = (rowInEditMode && rowInEditMode != request.id);
				let GeoFilterTemplateInnerItem = '';
				if (request.geo_filters != undefined && request.geo_filters.length > 0) {
					GeoFilterTemplateInnerItem = request.geo_filters.map(function (reqElement, j) {
						let geoEditItem = '';
						let geoDeleteItem = '';

						if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.geographic_filter.edit']) {
							geoEditItem = <span className="glyphicon glyphicon-pencil pull-left" style={{ paddingLeft: '3px', cursor: 'pointer' }} onClick={self.showEditGeoFilterDialog.bind(self, i, j)} />;
						}
						if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.geographic_filter.delete']) {
							geoDeleteItem = <span className="glyphicon glyphicon-remove pull-left" onClick={self.showConfirmDeleteGeoFilter.bind(self, i, j)} style={{ paddingLeft: '3px', cursor: 'pointer' }} />;
						}

						// if (reqElement.inherited == 0 && self.props.editingUserRole == false && self.props.addingUserRole == false) {
							
						if (reqElement.inherited == 0 || otherRowInEditMode || self.props.addingUserRole) {
							return <li id={j} key={j}>
								{reqElement.name} 
								<p>{reqElement.full_path_name}</p>
							</li>
						} else {
							return <li id={j} key={j}>
								{reqElement.name}
								<span>
									{geoDeleteItem}
									{geoEditItem}
								</span>
								<p>{reqElement.full_path_name}</p>

							</li>
						}
					});
					GeoFilterTemplateInnerItem = <ul>{GeoFilterTemplateInnerItem}</ul>;
				}

				let SectorialFilterInnerItem = '';
				if (request.sectorial_filters != undefined && request.sectorial_filters.length > 0) {
					SectorialFilterInnerItem = request.sectorial_filters.map(function (reqElement, j) {

						let geoEditItem = '';
						let sectorialEditItem = '';
						let sectorialDeleteItem = '';

						if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.sectorial_filter.edit']) {
							sectorialEditItem = <span className="glyphicon glyphicon-pencil pull-left" style={{ paddingLeft: '3px', cursor: 'pointer' }} onClick={self.showEditSectorialFilterDialog.bind(self, i, j, reqElement.definition_id, reqElement.definition_group_ids, reqElement.name, reqElement.id)} />;
						}

						if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.sectorial_filter.delete']) {
							sectorialDeleteItem = <span className="glyphicon glyphicon-remove pull-left" onClick={self.showConfirmDeleteSectorialFilter.bind(self, i, j)} style={{ paddingLeft: '3px', cursor: 'pointer' }} />;
						}

						if (reqElement.inherited == 0 && self.props.editingUserRole == false && self.props.addingUserRole == false) {
							return <li id={j} key={j}>
								{reqElement.name}
								<span>
									{sectorialDeleteItem}
									{sectorialEditItem}
								</span>
								<p>{reqElement.full_path_name}</p>

							</li>
						} else {
							return <li id={j} key={j}>
								{reqElement.name}
								<p>{reqElement.full_path_name}</p>
							</li>
						}
					});
					SectorialFilterInnerItem = <ul>{SectorialFilterInnerItem}</ul>;
				}


				if (self.props.editingUserRole == false && self.props.addingUserRole == false) {
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.roles.edit']) {
						editRoleItem = <button type="button" className="btn btn-success btn-md" onClick={self.setRowEditing.bind(self, i, true)}  >
							<i className="fa fa-pencil-square-o"></i>
						</button>;
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.roles.delete']) {
						deleteRoleItem = <button onClick={self.showConfirmDelete.bind(self, i)} type="button" className="btn btn-danger btn-md"  >
							<i className="fa fa-trash-o"></i>
						</button>;
					}
				}

				if (request.is_editing) {

					let moduleRowIndex = -1;
					if (request.module_name != undefined && request.module_name != '') {
						for (let k = 0, len = self.props.modules.length; k < len; k++) {

							if (self.props.modules[k].name == request.module_name) {
								moduleRowIndex = k;
								break;
							}
						}
					}

					let teamRowIndex = -1;
					self.editTeamID = -1;
					
					if (request.team_name != undefined && request.team_name != '') {
						for (let k = 0, len = self.props.teams.length; k < len; k++) {

							if (self.props.teams[k].name == request.team_name) {
								teamRowIndex = k;
								self.editTeamID = self.props.teams[k].id;
								
								if (self.props.teams[k].geoTemplates != undefined && self.props.teams[k].geoTemplates.length > 0) {
									GeoFilterTemplateInnerItem = self.props.teams[k].geoTemplates.map(function (reqElement, j) {
										return <li id={j} key={j}>{reqElement.name}</li>
									});
									GeoFilterTemplateInnerItem = <ul>{GeoFilterTemplateInnerItem}</ul>;
								}
								break;
							}
						}
					} 

					self.rolesArray = [];

					if (moduleRowIndex >= 0) {
						self.rolesArray = self.props.modules[moduleRowIndex].roles;
					}

					if (teamRowIndex >= 0) {
						self.editDepartmentsArray = self.props.teams[teamRowIndex].departments;
					}

					self.editDepartmentID = null;
					if (request.team_department_name != undefined && request.team_department_name != '') {
						for (let k = 0, len = self.editDepartmentsArray.length; k < len; k++) {
							if (self.editDepartmentsArray[k].name == request.team_department_name) {
								self.editDepartmentID = self.editDepartmentsArray[k].id;
								break;
							}
						}
					}

					/*let fromDate = self.formatDateOnlyString(request.from_date);
					let toDate = self.formatDateOnlyString(request.to_date);
					let missingFromDate = false;
					let fromDateParts = (fromDate == null ? null : fromDate.split('/'));
					if (fromDate != null && (fromDateParts.length == 2 || fromDateParts.length == 3)) {
						if (fromDateParts.length == 2) { //month and year only
							if ((fromDateParts[0].length == 1 || fromDateParts[0].length == 2) && (fromDateParts[1].length == 2 || fromDateParts[1].length == 4)) {
								if (parseInt(fromDateParts[0]) >= 1 && parseInt(fromDateParts[0]) <= 12) {
									missingFromDate = false;
									self.editFromDate = '01/' + (fromDateParts[0].length == 1 ? '0' + fromDateParts[0] + '/' : fromDateParts[0] + '/') + (fromDateParts[1].length == 2 ? '20' + fromDateParts[1] : fromDateParts[1]);
								} else {
									missingFromDate = true;
									self.editFromDate = '';
								}
							} else {
								missingFromDate = true;
								self.editFromDate = '';
							}
						} else if (fromDateParts.length == 3) { //day/month/year
							if ((fromDateParts[0].length == 1 || fromDateParts[0].length == 2) && (fromDateParts[1].length == 1 || fromDateParts[1].length == 2) && (fromDateParts[2].length == 2 || fromDateParts[2].length == 4)) {
								if (parseInt(fromDateParts[0]) >= 1 && parseInt(fromDateParts[0]) <= 31 && parseInt(fromDateParts[1]) >= 1 && parseInt(fromDateParts[1]) <= 12) {
									missingFromDate = false;
									self.editFromDate = (fromDateParts[0].length == 1 ? '0' + fromDateParts[0] + '/' : fromDateParts[0] + '/') + (fromDateParts[1].length == 1 ? '0' + fromDateParts[1] + '/' : fromDateParts[1] + '/') + (fromDateParts[2].length == 2 ? '20' + fromDateParts[2] : fromDateParts[2]);

								} else {
									missingFromDate = true;
									self.editFromDate = '';
								}
							} else {
								missingFromDate = true;
								self.editFromDate = '';
							}
						}

					} else {
						missingFromDate = true;
						self.editFromDate = '';
					}

					let toDateParts = (toDate == null ? null : toDate.split('/'));
					if (toDate != null && (toDateParts.length == 2 || toDateParts.length == 3)) {
						if (toDateParts.length == 2) { //month and year only
							if ((toDateParts[0].length == 1 || toDateParts[0].length == 2) && (toDateParts[1].length == 2 || toDateParts[1].length == 4)) {
								if (parseInt(toDateParts[0]) >= 1 && parseInt(toDateParts[0]) <= 12) {
									self.editToDate = '01/' + (toDateParts[0].length == 1 ? '0' + toDateParts[0] + '/' : toDateParts[0] + '/') + (toDateParts[1].length == 2 ? '20' + toDateParts[1] : toDateParts[1]);
								} else {
									self.editToDate = '';
								}
							} else {
								self.editToDate = '';
							}
						}
						else if (toDateParts.length == 3) { //day/month/year
							if ((toDateParts[0].length == 1 || toDateParts[0].length == 2) && (toDateParts[1].length == 1 || toDateParts[1].length == 2) && (toDateParts[2].length == 2 || toDateParts[2].length == 4)) {
								if (parseInt(toDateParts[0]) >= 1 && parseInt(toDateParts[0]) <= 31 && parseInt(toDateParts[1]) >= 1 && parseInt(toDateParts[1]) <= 12) {
									self.editToDate = (toDateParts[0].length == 1 ? '0' + toDateParts[0] + '/' : toDateParts[0] + '/') + (toDateParts[1].length == 1 ? '0' + toDateParts[1] + '/' : toDateParts[1] + '/') + (toDateParts[2].length == 2 ? '20' + toDateParts[2] : toDateParts[2]);
								} else {
									self.editToDate = '';
								}
							} else {
								self.editToDate = '';
							}
						}

					} else {
						self.editToDate = '';
					}*/
					self.editRoleID = -1;
					self.editModuleNameMissing = true;
					self.editModuleNameIndex = -1;
					self.editRoleNameMissing = true;
					self.editRoleNameIndex = -1;

					for (let k = 0, len = self.rolesArray.length; k < len; k++) {
						if (self.rolesArray[k].name == request.name) {

							self.editRoleNameMissing = false;
							self.editRoleNameIndex = k;
							self.editRoleID = self.rolesArray[k].id;
							break;
						}
					}

					for (let k = 0, len = self.props.modules.length; k < len; k++) {
						if (self.props.modules[k].name == request.module_name) {

							self.editModuleNameMissing = false;
							self.editModuleNameIndex = k;
							break;
						}
					}

					return <div id={i} key={i} className="row" style={{ paddingTop: '20px' }}>
						<div className="col-md-12">
							<div style={{ border: '2px solid #bfcdce', width: '97%' }}>
								<table cellSpacing="0" cellPadding="0">
									<tbody>
										<tr>
											<td style={{ backgroundColor: '#2ab4c0', width: '10px' }}>&nbsp;</td>
											<td style={{ width: '100%' }}>
												<table cellSpacing="0" cellPadding="0" width='100%' >
													<tbody>
														<tr>
															<td style={{ height: '50px', backgroundColor: '#f4f7f9', paddingRight: '20px' }}>
																<div className="row">
																	<div className="col-md-5">
																		<div className="row">
																			<div className="col-md-3">{self.lables.model}:&nbsp;</div>
																			<div className="col-md-5"> <Combo items={self.props.modules} inputStyle={{ borderColor: (self.editModuleNameMissing ? '#ff0000' : '#ccc') }} value={request.module_name} onChange={self.changeEditModuleName.bind(self, i)} className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>
																		</div>
																	</div>
																	<div className="col-md-5">
																		<div className="row">
																			<div className="col-md-3">{self.lables.role}:&nbsp;</div>
																			<div className="col-md-5"> <Combo items={self.rolesArray} inputStyle={{ borderColor: (self.editRoleNameMissing ? '#ff0000' : '#ccc') }} value={request.name} onChange={self.changeEditRoleName.bind(self, i)} className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>
																		</div>
																	</div>
																	<div className="col-md-2" style={{ fontSize: '25px' }}>
																		{self.lables.main}:&nbsp;<input type="checkbox" checked={request.main == '1' ? true : false} onChange={self.editIsMainChange.bind(self, i)} />
																	</div>
																</div>
															</td>
														</tr>
														<tr>
															<td style={{ paddingTop: '10px', paddingRight: '20px', paddingBottom: '20px' }}>
																<div className="row">
																	<div className="col-md-5"  >
																		<div className="row">
																			<div className="col-md-3">צוות : </div>
																			<div className="col-md-5"><Combo items={self.props.teams} inputStyle={{ borderColor: (self.editTeamID == -1 ? '#ff0000' : '#ccc') }} onChange={self.changeEditTeamName.bind(self, i)} value={request.team_name} className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>
																		</div>
																	</div>
																	<div className="col-md-5">
																		<div className="row">
																			<div className="col-md-5">תאריך התחלה : </div>
																			<div className="col-md-7">
																				<ReactWidgets.DateTimePicker
																					isRtl={true}
																					time={false}
																					value={parseDateToPicker(request.from_date)}
																					onChange={parseDateFromPicker.bind(self, { callback: self.editFromDateChange, format: "YYYY-MM-DD", functionParams: i })}
																					format="DD/MM/YYYY"
																				/></div>
																		</div>
																	</div>
																</div>
																<div className="row" style={{ paddingTop: '10px' }}>
																	<div className="col-md-5">
																		<div className="row">
																			<div className="col-md-3">מחלקה : </div>
																			<div className="col-md-5"><Combo items={self.editDepartmentsArray} onChange={self.changeEditDepartmentName.bind(self, i)} value={request.team_department_name} className="form-combo-table" maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>
																		</div>
																	</div>
																	<div className="col-md-5">
																		<div className="row">
																			<div className="col-md-5">תאריך סיום : </div>
																			<div className="col-md-7"><ReactWidgets.DateTimePicker
																				isRtl={true}
																				time={false}
																				value={parseDateToPicker(request.to_date)}
																				onChange={parseDateFromPicker.bind(self, { callback: self.editToDateChange, format: "YYYY-MM-DD", functionParams: i })}
																				format="DD/MM/YYYY"
																			/></div>
																		</div>
																	</div>
																</div>
																<div className="row" style={{ paddingTop: '10px' }}>
																	<div className="col-md-6" style={{ fontSize: '20px' }}>
																		<div className="row">
																			<div className="col-md-4"> מיקוד גיאוגרפי :</div>
																			<div className="col-md-8">{GeoFilterTemplateInnerItem}</div>
																		</div>
																	</div>
																	<div className="col-md-6 hidden" style={{ fontSize: '20px' }}>
																		<div className="row">
																			<div className="col-md-4"> מיקוד מגזרי :</div>
																			<div className="col-md-8">{SectorialFilterInnerItem}</div>
																		</div>

																	</div>
																</div>
																<div className="row" style={{ paddingTop: '10px' }}>
																	<div className="col-md-10" style={{ fontSize: '25px' }}>
																	</div>
																	<div className="col-md-2 text-center">
																		{self.renderDisplayTopicModalButton(request.module_name, otherRowInEditMode)}
																		&nbsp;
																		<button type="button" className="btn btn-success btn-md" onClick={self.saveEditedChanges.bind(self, i)}  >
																			<i className="fa fa-floppy-o"></i>
																		</button> 
																		&nbsp;
																 		<button onClick={self.setRowEditing.bind(self, i, false)} type="button" className="btn btn-danger btn-md"  >
																			<i className="fa fa-times"></i>
																		</button>
																	</div>
																</div>
															</td>
														</tr>
													</tbody>
												</table>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>;
				}
				else {
					let geoTplsItem = '';
					let sectorialTplsItem = '';
					let sectorialAddItem = '';
					let geoAddItem = '';

					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.geographic_filter.add']) {
						geoAddItem = <button type="button" disabled={self.props.addingUserRole} onClick={self.showAddEditGeoFilterDlg.bind(self, i, 1)} className="btn btn-primary btn-md">+ הוספה</button>;
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.sectorial_filter.add']) {
						sectorialAddItem = <button type="button" disabled={self.props.addingUserRole} onClick={self.showAddSectorialFilterDlg.bind(self, i)} className="btn btn-primary btn-md">+ הוספה</button>;
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.geographic_filter']) {
						geoTplsItem = <div className="row">
							<div className="col-md-4"> מיקוד גיאוגרפי :</div>
							<div className="col-md-8">
								{GeoFilterTemplateInnerItem}
								{geoAddItem}
							</div>
						</div>;
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.sectorial_filter']) {
						sectorialTplsItem = <div className="col-md-6 hidden">
							<div className="row">
								<div className="col-md-4">מיקוד מגזרי : </div>
								<div className="col-md-7">{SectorialFilterInnerItem}</div>
							</div>
							<div className="row">
								<div className="col-md-4"> </div>
								<div className="col-md-8">
									{sectorialAddItem}
								</div>
							</div>
						</div>;
					}

					return <div key={i} className="row" style={{ paddingTop: '20px' }}>
						<div className="col-md-12">
							<div style={{ border: '2px solid #bfcdce', width: '97%' }}>
								<table cellSpacing="0" cellPadding="0">
									<tbody>
										<tr>
											<td style={{ backgroundColor: '#2ab4c0', width: '10px' }}>&nbsp;</td>
											<td style={{ width: '100%' }}>
												<table cellSpacing="0" cellPadding="0" width='100%' >
													<tbody>
														<tr>
															<td style={{ height: '50px', backgroundColor: '#f4f7f9', paddingRight: '20px' }}>
																<div className="row">
																	<div className="col-md-5">
																		מודול : {request.module_name || self.props.addNewUserRoleScreen.moduleName}
																	</div>
																	<div className="col-md-5"  >
																		תפקיד : {request.name}
																	</div>
																	<div className="col-md-2"  >
																		עיקרי : <input type="checkbox" checked={request.main == '1' ? true : false} disabled={true} />
																	</div>
																</div>
															</td>
														</tr>
														<tr>
															<td style={{ paddingTop: '10px', paddingRight: '20px', paddingBottom: '20px' }}>
																<div className="row">
																	<div className="col-md-7">
																		צוות : <Link to={"/system/teams/" + request.team_key}>{request.team_name}</Link>
																	</div>
																	<div className="col-md-5">
																		{self.lables.startDate} : {((!request.from_date || request.from_date == '') ? '------' : self.formatDateOnlyString(request.from_date))}
																	</div>
																</div>
																<div className="row" style={{ paddingTop: '10px' }}>
																	<div className="col-md-7"  >
																		מחלקה : {request.team_department_name}
																	</div>
																	<div className="col-md-5"  >
																		תאריך סיום : {((!request.to_date || request.to_date == '') ? '------' : self.formatDateOnlyString(request.to_date))}
																	</div>
																</div>
																<div className="row" style={{ paddingTop: '10px' }}>
																	<div className="col-md-6"  >
																		{geoTplsItem}
																	</div>
																	{sectorialTplsItem}
																</div>
																<div className="row">
																	<div className="col-md-10">
																	</div>
																	<div className="col-md-2 text-center">
																		{self.renderDisplayTopicModalButton(request.module_name, otherRowInEditMode)}
																		&nbsp; {editRoleItem} &nbsp;{deleteRoleItem}
																	</div>
																</div>
															</td>
														</tr>
													</tbody>
												</table>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>;
				}
			});
		}
	}

	renderAddNewRole(geoTempTplsItem, sectorialTempTplsItem){
		if(this.props.editingUserRole == false && this.props.addingUserRole == true){
			return(
			<div className="row" style={{ paddingTop: '20px' }}>
				<div className="col-md-12">
					<div style={{ border: '2px solid #bfcdce', width: '97%' }}>
						<table cellSpacing="0" cellPadding="0">
							<tbody>
								<tr>
									<td style={{ backgroundColor: '#2ab4c0', width: '10px' }}>&nbsp;</td>
									<td style={{ width: '100%' }}>
										<table cellSpacing="0" cellPadding="0" width='100%' >
											<tbody>
												<tr>
													<td style={{ height: '50px', backgroundColor: '#f4f7f9', paddingRight: '20px' }}>
														<div className="row">
															<div className="col-md-5">
																<div className="row">
																	<div className="col-md-3">מודול : </div>
																	<div className="col-md-5"> <Combo items={this.props.modules} value={this.props.addNewUserRoleScreen.moduleName} onChange={this.newRoleModuleNameChange.bind(this)} inputStyle={this.validatorsStyle.newModuleNameStyle} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>
																</div>
															</div>
															<div className="col-md-5">
																<div className="row">
																	<div className="col-md-3">תפקיד : </div>
																	<div className="col-md-5"> <Combo items={this.arrayOfTheRoles} value={this.props.addNewUserRoleScreen.roleName} onChange={this.newRoleUserRoleNameChange.bind(this)} inputStyle={this.validatorsStyle.newRoleNameStyle} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' /></div>
																</div>
															</div>
															<div className="col-md-2" style={{ fontSize: '25px' }}>
																עיקרי : <input type="checkbox" ref="isMain" defaultChecked={this.props.userRoles == undefined || this.props.userRoles.length == 0 ? true : false} onChange={this.changeNewIsMain.bind(this)} />
															</div>
														</div>
													</td>
												</tr>
												<tr>
													<td style={{ paddingTop: '10px', paddingRight: '20px', paddingBottom: '20px' }}>
														<div className="row">
															<div className="col-md-5">
																<div className="row">
																	<div className="col-md-3">צוות : </div>
																	<div className="col-md-5 form-group">
																		<Combo items={this.props.teams} value={this.props.addNewUserRoleScreen.teamName} onChange={this.newRoleUserTeamNameChange.bind(this)} inputStyle={this.validatorsStyle.newTeamNameStyle} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />		</div>
																</div>
															</div>
															<div className="col-md-5">
																<div className="row">
																	<div className="col-md-5">תאריך התחלה : </div>
																	<div className="col-md-7 form-group">
																		<ReactWidgets.DateTimePicker
																			isRtl={true}
																			time={false}
																			value={parseDateToPicker(this.props.addNewUserRoleScreen.fromDate)}
																			onChange={parseDateFromPicker.bind(this, { callback: this.newFromDateChange, format: "YYYY-MM-DD", functionParams: 'newRoleStartDate' })}
																			format="DD/MM/YYYY"
																		/>
																	</div>
																</div>
															</div>
														</div>
														<div className="row">
															<div className="col-md-5">
																<div className="row">
																	<div className="col-md-3">מחלקה : </div>
																	<div className="col-md-5 form-group"><Combo items={this.props.roleDepartments} value={this.props.addNewUserRoleScreen.departmentName} onChange={this.newRoleUserDepNameChange.bind(this)} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' />	</div>
																</div>
															</div>
															<div className="col-md-5">
																<div className="row">
																	<div className="col-md-5">תאריך סיום : </div>
																	<div className="col-md-7 form-group">
																		<ReactWidgets.DateTimePicker
																			isRtl={true}
																			time={false}
																			value={parseDateToPicker(this.props.addNewUserRoleScreen.toDate)}
																			onChange={parseDateFromPicker.bind(this, { callback: this.newToDateChange, format: "YYYY-MM-DD", functionParams: 'newRoleEndDate' })}
																			format="DD/MM/YYYY"
																		/>
																	</div>
																</div>
															</div>
														</div>
														<div className="row">
															<div className="col-md-6">
																{geoTempTplsItem}
															</div>
															{sectorialTempTplsItem}
														</div>
														<div className="row">
															<div className="col-md-10" style={{ fontSize: '25px' }}>
															</div>
															<div className="col-md-2 text-center">
																<button onClick={this.addNewCallRoleOfUser.bind(this)} type="button" className="btn btn-success btn-md" disabled={!this.canAddRole()}>
																	<i className="glyphicon glyphicon-plus"></i>
																</button> &nbsp;
																<button onClick={this.closeAddNewUserRole.bind(this)} type="button" className="btn btn-danger btn-md">
																	<i className="fa fa-times"></i>
																</button>
															</div>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>)
		}
	}

	inputValidated(input, list, listDisplayProperty) {
		if ((list == undefined)||(list.constructor !== Array)) return false;
		let found = false;
		list.forEach(function(item) {
			if (item[listDisplayProperty] == input) {
				found = true;
			}
		});
		return found;
	}

	canAddRole() {
		if ((this.inputValidated(this.props.addNewUserRoleScreen.moduleName, this.props.modules, 'name')) &&
			(this.inputValidated(this.props.addNewUserRoleScreen.roleName, this.arrayOfTheRoles, 'name')) &&
			(this.inputValidated(this.props.addNewUserRoleScreen.teamName, this.props.teams, 'name'))
		) return true;
		return false;
	}

	removeTopicFormUser(rowId){
		SystemActions.deleteUserRequestsTopic(this.props.dispatch, this.props.router.params.userKey ,rowId)
	}
	render() {

		this.renderRoleItems();
		this.validatorStyleIgnitor();

		this.mainCount = 0;
		if (this.props.userRoles != undefined) {
			for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
				if (this.props.userRoles[i].main == 1) {
					this.mainCount++;
				}
			}
		}

		//-------------------------------------------
		let extendTeamFilter = false;
		let geoFilterHeader = 'פילטר ראשי : ';
		let teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
		let geoTemplates = teamData.geoTemplates;

		if ((this.props.modalGeographicalFilterRoleIndex != -1)&&(this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length > 0)) {
			extendTeamFilter = true;
		}

		if (this.props.addingUserRole) {
			if ((this.props.tempUserRoleTeamGeoFilters != undefined)&&(this.props.tempUserRoleTeamGeoFilters.length > 0)) extendTeamFilter = true;
			if (geoTemplates == undefined || geoTemplates.length == 0) {
				geoFilterHeader = 'אזור : ';
			}
		}
		else {
			if (this.props.modalGeographicalFilterRoleIndex != -1) {
				teamData = this.getTeamDataByTeam(this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_name);
				geoTemplates = teamData.geoTemplates;
				if (this.props.modalGeographicalFilterRoleIndex == -1 || this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length == 0) {
					geoFilterHeader = 'אזור : ';
				}
			}
		}

		//-------------------------------------------3

		let self = this;
		let GeoFilterTemplateItem = '';
		let SectorialFilterTemplateItem = '';
		let sectorialTempTplsItem = '';
		let geoTempTplsItem = '';
		if (this.props.selectedUserData.id != undefined) {
			let addNewUserPhoneItem = '';
			let phoneToValidate = this.props.addNewUserPhoneScreen.phone.split('-').join('');
			let firstPwd = '';
			if (this.props.router.params.userKey == 'new') {
				if (this.props.oldUserPassword == this.props.randomUserPassword) {
					firstPwd = <span> סיסמא ראשונית - 4 ספרות אחרונות של ת"ז &nbsp; </span>;
				}
			}
			let teamData = this.getTeamDataByTeam(this.props.addNewUserRoleScreen.teamName);
			let geoTemplates = teamData.geoTemplates;
			let sectorialTemplates = teamData.sectorialTemplates;
			let inheritedTemplatesOnly = (geoTemplates == undefined ? [] : geoTemplates.slice());


			if (geoTemplates != undefined) {
				geoTemplates = geoTemplates.concat(this.props.tempUserRoleGeoFilters);

				GeoFilterTemplateItem = geoTemplates.map(function (request, i) {
					let geoTempEditItem = '';
					let geoTempDeleteItem = '';


					let editTempGeoFilterElement = '';
					if (request.inherited == 1) {
						let rowIndex = i - inheritedTemplatesOnly.length;
						if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.geographic_filter.edit']) {
							geoTempEditItem = <span className="glyphicon glyphicon-pencil pull-left" style={{ paddingLeft: '3px', cursor: 'pointer' }} onClick={self.showEditGeoFilterDialog.bind(self, i, rowIndex)} />;
						}
						if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.geographic_filter.delete']) {
							geoTempDeleteItem = <span className="glyphicon glyphicon-remove pull-left" onClick={self.showConfirmDeleteGeoFilter.bind(self, -1, rowIndex)} style={{ paddingLeft: '3px', cursor: 'pointer' }} />;
						}
						editTempGeoFilterElement = <span>
							{geoTempDeleteItem}
							{geoTempEditItem}
						</span>;
					}


					return <li id={i} key={i}>{request.name}
						{editTempGeoFilterElement}
						<p>{request.full_path_name}</p>
					</li>
				});

				let geoTempAddItem = '';
				if (this.props.currentUser.admin || this.props.currentUser.permissions['system.users.geographic_filter.add']) {
					geoTempAddItem = <button type="button" onClick={this.showTempArrayAddEditGeoFilterDlg.bind(this, 1)} className="btn btn-primary btn-md">+ הוספה</button>;
				}
				GeoFilterTemplateItem = <div><ul>{GeoFilterTemplateItem}</ul>
					{geoTempAddItem}</div>;
			}


			if (sectorialTemplates != undefined) {
				SectorialFilterTemplateItem = sectorialTemplates.map(function (request, i) {
					let editTempSectorialFilterElement = '';
					return <li id={i} key={i}>{request.name}</li>
				});
				let TempSectorialFilterTemplateItem = this.props.tempRoleSectorialFilters.map(function (request, i) {

					let sectorialTempEditItem = '';
					let sectorialTempDeleteItem = '';
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.sectorial_filter.edit']) {
						sectorialTempEditItem = <span className="glyphicon glyphicon-pencil pull-left" style={{ paddingLeft: '3px', cursor: 'pointer' }} onClick={self.showEditSectorialFilterDialog.bind(self, -1, i)} />;
					}
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.users.sectorial_filter.delete']) {
						sectorialTempDeleteItem = <span className="glyphicon glyphicon-remove pull-left" onClick={self.showConfirmDeleteSectorialFilter.bind(self, -1, i)} style={{ paddingLeft: '3px', cursor: 'pointer' }} />;
					}

					return <li id={i} key={i}>{request.split('~')[0]}
						<span>
							{sectorialTempDeleteItem}
							{sectorialTempEditItem}
						</span>
						<p>{request.full_path_name}</p>
					</li>
				});
				let sectorialTempAddItem = '';
				if (this.props.currentUser.admin || this.props.currentUser.permissions['system.users.sectorial_filter.add']) {
					sectorialTempAddItem = <button type="button" onClick={this.showTempArrayAddEditSectorialFilterDlg.bind(this, 1)} className="btn btn-primary btn-md">+ הוספה</button>;
				}
				SectorialFilterTemplateItem = <div><ul>{SectorialFilterTemplateItem}{TempSectorialFilterTemplateItem}</ul>
					{sectorialTempAddItem}</div>;
			}
		}

		//-------------------------------------------
		if (this.props.editingUserRole == false && this.props.addingUserRole == true) {
			let moduleRowIndex = -1
			let arrayOfTheRoles = [];
			if (this.props.addNewUserRoleScreen.moduleName != undefined && this.props.addNewUserRoleScreen.moduleName != '') {
				for (let k = 0, len = this.props.modules.length; k < len; k++) {

					if (this.props.modules[k].name == this.props.addNewUserRoleScreen.moduleName) {
						moduleRowIndex = k;
						arrayOfTheRoles = this.props.modules[k].roles;
						break;
					}
				}

				this.arrayOfTheRoles = arrayOfTheRoles;
			}

			if (this.props.currentUser.admin || this.props.currentUser.permissions['system.users.geographic_filter']) {
				geoTempTplsItem = <div className="row">
					<div className="col-md-4"> מיקוד גיאוגרפי :</div>
					<div className="col-md-8">
						{GeoFilterTemplateItem}
					</div>
				</div>;
			}
			if (this.props.currentUser.admin || this.props.currentUser.permissions['system.users.sectorial_filter']) {
				sectorialTempTplsItem = <div className="col-md-6 hidden" style={{ fontSize: '25px' }}>
					<div className="row">
						<div className="col-md-5">
							מיקוד מגזרי :
															 </div>
						<div className="col-md-7">
							{SectorialFilterTemplateItem}
						</div>
					</div>
				</div>;
			}
		}
		//-------------------------------------------
		let geoFilterModalScreen = this.props.userScreen.geoFilterModalScreen;
		let areaName = geoFilterModalScreen.areaName ?  geoFilterModalScreen.areaName : '';
		let areaGroupName = geoFilterModalScreen.areaGroupName ?  geoFilterModalScreen.areaGroupName : '';
		let cityName = geoFilterModalScreen.cityName;
		let subAreaName = geoFilterModalScreen.subAreaName ;
		let neighborhoodName = geoFilterModalScreen.neighborhoodName ;
		let clusterName = geoFilterModalScreen.clusterName;
		let ballotName = geoFilterModalScreen.ballotName;

		let isAreaGroupValid = areaGroupName.length > 3 || this.getAreaGroupID(areaGroupName) != -1;
		let isAreaValid = areaName.length > 3 || this.getAreaID(areaName) != -1;
		let isValidFilter = isAreaValid || isAreaGroupValid;
		let notValidFilterStyle = (isValidFilter) ? {}  : {borderColor: '#ff0000'};
		return (
		<section className="section-block" style={{ paddingTop: '15px', paddingBottom: '20px', paddingRight: '20px' }}>
			<div className="row">
				<div className='col-md-12'>
					<div className="ContainerCollapse">
						<div className="row">
							<a onClick={this.updateCollapseStatus.bind(this, 'userRoles')}
								aria-expanded={this.props.containerCollapseStatus.userRoles}>
								<div className='col-md-10 panelCollapse'>
									<div className="collapseArrow closed"></div>
									<div className="collapseArrow open"></div>
									<div className="collapseTitle">{this.lables.roles}</div>
								</div>
							</a>
							<div className='col-md-2'>
								{(!this.props.addingUserRole && !this.props.editingUserRole &&
									(this.props.currentUser.admin || this.props.currentUser.permissions['system.users.roles.add'])) &&
									<button type="button" className="btn btn-primary btn-md" onClick={this.showAddNewUserRole.bind(this)}>
										<span>{this.lables.newRole}</span>
									</button>}
							</div>
						</div>
						<Collapse isOpened={this.props.containerCollapseStatus.userRoles}>
							<div className="row CollapseContent">
								<div className='col-md-12'>
									{this.renderAddNewRole(geoTempTplsItem, sectorialTempTplsItem)}
									{this.roleItems}
									<SectorialFiltersModal />
									{((this.mainCount == 0)) && <span style={{ color: '#ff0000' }}>{this.lables.oneMainRoleErrorMsg}</span>}
									{(this.props.router.params.userKey == 'new') 
									&& <button 
										type="button" 
										className="btn btn-primary btn-md" 
										onClick={this.props.onClickSaveBtn.bind(this)}
										disabled={this.isButtonDisabled() || (this.wrongStreet || this.props.router.params.userKey == 'new' && this.props.addedUser == true ? true : false)} 
										style={{float: 'left'}}>
										<span>{this.setAddingUserText()}</span>
									</button>}
								</div>
							</div>
						</Collapse>
					</div>
				</div>
			</div>
			<ModalWindow show={this.props.addingGeographicalFilter || this.props.editingGeographicalFilter} title={this.props.geographicalModalHeader}
				buttonOk={this.doGeoFilterAction.bind(this ,isValidFilter)} buttonCancel={this.hideGeoFilterModal.bind(this)} buttonX={this.hideGeoFilterModal.bind(this)} >
				<div>
					{(extendTeamFilter) && <div className='row'>
						<div className="col-md-12">
							שם פילטר:
								<input type="text" className="form-control" value={this.props.geoFilterModalScreen.labelName} onChange={this.newMainGeoFilterLabelNameChange.bind(this)} />
							{geoFilterHeader}

							<Combo
								items={this.props.modalGeographicalFilterRoleIndex == -1 ? ((this.props.addingUserRole && this.props.tempUserRoleTeamGeoFilters != undefined && this.props.tempUserRoleGeoFilters != undefined) ? this.props.tempUserRoleTeamGeoFilters : this.props.areas) : (this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length == 0 ? this.props.areas : this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters)}
								value={this.props.geoFilterModalScreen.mainFilterName} maxDisplayItems={6} itemIdProperty="id"
								itemDisplayProperty={this.props.modalGeographicalFilterRoleIndex == -1 ? ((this.props.addingUserRole && this.props.tempUserRoleTeamGeoFilters != undefined
								 && this.props.tempUserRoleGeoFilters != undefined) ? 'full_path_name' : 'name') : (this.props.userRoles[this.props.modalGeographicalFilterRoleIndex].team_geo_filters.length == 0
								  ? 'name' : 'full_path_name')} onChange={this.newMainGeoFilterChange.bind(this)} />
							{(this.props.geoFilterModalScreen.entityType != -1 && this.props.geoFilterModalScreen.entityID > 0) &&
								this.constructFiltersForGeoFilterModal(this.props.geoFilterModalScreen.entityType, this.props.geoFilterModalScreen.entityID)
							}
							<div style={{ height: '100px' }}></div>
						</div>
					</div>}
					{(!extendTeamFilter) &&
						<div className='row'>
							<div className="col-md-12">שם פילטר:
									<input type="text" className="form-control" style={{ borderColor: (geoFilterModalScreen.labelName.length <= 3 ? '#ff0000' : '#ccc') }}
									value={geoFilterModalScreen.labelName} onChange={this.newMainGeoFilterLabelNameChange.bind(this)} />
											קבוצות אזורים  :
									<Combo inputStyle={notValidFilterStyle} items={this.props.areasGroups} className="form-combo-table" 
											value={areaGroupName} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateAreaGroupChange.bind(this)} />
												אזור :
									<Combo inputStyle={notValidFilterStyle} items={this.props.areas} className="form-combo-table" 
											value={areaName} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateAreaChange.bind(this)} />
												תת אזור :
									<Combo items={this.props.subAreas} className="form-combo-table" value={subAreaName} 
											maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateSubAreaChange.bind(this)} />
												עיר :
									<Combo items={geoFilterModalScreen.cities} className="form-combo-table" value={cityName}
											maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateCityChange.bind(this)} />
												שכונה :
									<Combo items={geoFilterModalScreen.neighborhoods} className="form-combo-table" value={neighborhoodName}
											maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateNeighborhoodChange.bind(this)} />
												אשכול :
									<Combo items={geoFilterModalScreen.clusters} className="form-combo-table" value={clusterName}
											maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateClusterChange.bind(this)} />
												קלפי :
									<Combo items={geoFilterModalScreen.ballots} className="form-combo-table" value={ballotName}
											maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' onChange={this.newGeoTemplateBallotChange.bind(this)} />
							</div>
						</div>
					}

				</div>
			</ModalWindow>
			<UserRequestTopicsModal
				showUserTopicsModal={this.state.showUserTopicsModal}
				userRequestTopics={this.props.userRequestTopics}
				removeTopicFormUser={this.removeTopicFormUser.bind(this)}
				displayUserTopicsModal={this.displayUserTopicsModal.bind(this)}
			></UserRequestTopicsModal>

		</section>);
	}
}

function mapStateToProps(state) {
	return {
		dirtyComponents: state.system.dirtyComponents,
		modalGeographicalFilterRoleIndex: state.system.userScreen.modalGeographicalFilterRoleIndex,
		containerCollapseStatus: state.system.userScreen.containerCollapseStatus,
		addNewUserRoleScreen: state.system.userScreen.addNewUserRoleScreen,
		currentUser: state.system.currentUser,
		modules: state.system.modules,
		roleDepartments: state.system.userScreen.roleDepartments,
		userScreen: state.system.userScreen,
		addingGeographicalFilter: state.system.userScreen.addingGeographicalFilter,
		userRoles: state.system.selectedUserData.roles_by_user,
		geoFilterModalScreen: state.system.userScreen.geoFilterModalScreen,
		teams: state.system.teams,
		areasGroups: state.system.lists.areasGroups,
		areas: state.system.lists.areas,
		subAreas: state.system.lists.subAreas,
		cities: state.system.cities,
		streets: state.system.lists.streets,
		addingUserRole: state.system.userScreen.addingUserRole,
		editingUserRole: state.system.userScreen.editingUserRole,
		selectedUserData: state.system.selectedUserData,
		addNewUserPhoneScreen: state.system.userScreen.addNewUserPhoneScreen,
		confirmDeleteRoleGeoFilterByUserIndex: state.system.userScreen.confirmDeleteRoleGeoFilterByUserIndex,
		geographicalModalHeader: state.system.userScreen.geographicalModalHeader,
		addingUser: state.system.addingUser,
		userRequestTopics: state.system.userScreen.userRequestTopics,
	}
}

export default connect(mapStateToProps)(withRouter(UserRoles));