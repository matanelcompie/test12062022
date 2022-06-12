import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Collapse from 'react-collapse';
// import moment from 'moment';

import store from '../../../store';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';

// import SectorialFiltersModal from '../../global/SectorialFiltersModal';
import ModalWindow from '../../global/ModalWindow';
import Combo from '../../global/Combo';
import UserPhone from './UserPhone';
import SearchUser from './SearchUser';
import UserRoles from './UserRoles';
import globalSaving from '../../hoc/globalSaving';
import { validateEmail, validatePhoneNumber } from '../../../libs/globalFunctions';

class Users extends React.Component {

	constructor(props) {
		super(props);
		this.textIgniter();
		this.styleIgniter();
		this.isPermissionsLoaded = false;
	}

	componentDidMount() {
		window.scrollTo(0, 0);
	}

	componentWillMount() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'משתמשים' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.RESET_LOADED_USER});

		if (this.props.currentUser.first_name.length) {
			// console.log('componentWillMount load');
			this.isPermissionsLoaded = true;
			if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.users'])) {
				this.loadUserData();
				GlobalActions.loadGeoFilterDefinitionGroups(this.props.dispatch);
				SystemActions.loadModulesWithRoles(this.props.dispatch);
				SystemActions.loadTeams(store);
				SystemActions.loadAreas(this.props.dispatch);
				SystemActions.loadAreasGroups(this.props.dispatch);
				SystemActions.loadCitiesByArea(this.props.dispatch, -1); //load all cities //for initial comboes
				SystemActions.loadInitialCities(this.props.dispatch);
			} else {
				this.props.router.replace('/unauthorized');
			}
		}
	}

	componentWillUpdate(nextProps) {
		if (!this.props.selectedUserData.isUserLoaded && nextProps.selectedUserData.isUserLoaded) {//set title only once
			SystemActions.loadStreets(this.props.dispatch, this.getCityData(nextProps.selectedUserData.work_city_name).key);
			let systemTitle = "המשתמש " + nextProps.selectedUserData.first_name + ' ' + nextProps.selectedUserData.last_name;
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle });
		}

		if ((this.props.selectedUserData.key != this.props.router.params.userKey)
			&& (this.props.selectedUserData.key != nextProps.selectedUserData.key)
		) {
		}

	}

	componentDidUpdate() {
		this.checkPermissions();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.params.userKey != nextProps.params.userKey) {
			if (nextProps.params.userKey != 'new' && nextProps.params.userKey != undefined) SystemActions.loadUser('key', this.props.dispatch, this.props.router, nextProps.params.userKey);
		}
	}

	checkPermissions() {
		if ((this.props.currentUser.first_name.length && !this.isPermissionsLoaded)
			//|| (this.props.selectedUserData.key !=this.props.router.params.userKey && this.props.selectedUserData.key!='')
		) {
			this.isPermissionsLoaded = true;
			if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.users'])) {
				this.loadUserData();
				GlobalActions.loadGeoFilterDefinitionGroups(this.props.dispatch);
				SystemActions.loadModulesWithRoles(this.props.dispatch);
				SystemActions.loadTeams(store);
				SystemActions.loadAreas(this.props.dispatch);
				SystemActions.loadAreasGroups(this.props.dispatch);
				SystemActions.loadCitiesByArea(this.props.dispatch, -1); //load all cities //for initial comboes
				SystemActions.loadInitialCities(this.props.dispatch);
			} else {
				this.props.router.replace('/unauthorized');
			}
		}
	}

	textIgniter() {
		this.lables = {
			tz: 'ת"ז',
			name: 'שם',
			admin: 'אדמין',
			isActive: 'פעיל במערכת',
			twoStepAuth: 'אימות דו שלבי',
			userNumber: "משתמש מס'",
			creatorUser: 'משתמש יוצר',
			createDate: 'תאריך יצירה',
			workAddress: 'כתובת עבודה',
			city: 'עיר',
			neighborhood: 'שכונה',
			street: 'רחוב',
			house: 'בית',
			entry: 'כניסה',
			flat: 'דירה',
			email: 'דוא"ל',
			contactDetails: 'פרטי קשר עבודה',
			createUser: 'צור משתמש',
			save: 'שמירה',
			deleteConfirm: 'וידוא מחיקה',
			areYouSure: 'האם את/ה בטוח/ה?',
			copyInfo: 'העתקת נתוני תושב',
			voterInfo: 'להלן פרטי הקשר הפרטיים של התושב:',
			ifCopyInfo: 'האם להעתיק אותם לפרטי העבודה? אם לא, תצטרך להכניס אותם באופן ידני',
			cancelPayment:'מנהל תשלומי פעילים'
		}
	}

	styleIgniter() {
		this.mainContainerInfoStyle = { height: 120 };
		this.mainContainerCheckBoxStyle = { height: '150px',marginBottom:'10px',width:'fit-content' };
	}

	validatorStyleIgnitor() {
		this.invalidInputs = {};
		let work_street = this.props.selectedUserData.work_street;

		if (!this.props.selectedUserData.work_city_name || this.getCityData(this.props.selectedUserData.work_city_name).key == undefined) {
			this.invalidInputs.city = true;
		}
		if (!this.props.selectedUserData.work_house ) {
			this.invalidInputs.house = true;
		}
		if ( work_street == undefined || this.getStreetData(work_street.trim()).id == undefined) {
			this.invalidInputs.street = true;
		}

		if ((this.props.selectedUserData.email == undefined || this.props.selectedUserData.email == '' || !validateEmail(this.props.selectedUserData.email))) {
			this.invalidInputs.email = true;
		}

		//return;

		/***TODO:: check from here */
		// let phonesCount = 0;
		// if(this.props.selectedUserData != undefined){
		// if(this.props.selectedUserData.userPhones != undefined){
		// 	for ( let i = 0  , len = this.props.selectedUserData.userPhones.length ; i<len ; i++){
		// 		if(this.getPhoneTypeID(this.props.selectedUserData.userPhones[i].name) != -1 
		// 			&& validatePhoneNumber(this.props.selectedUserData.userPhones[i].phone_number)){
		// 			phonesCount++;
		// 		}
		//    }
		// }
		// }

		// *** NO USED ****
		//
		// this.noPhones = (phonesCount <= 0)?true:false;
		// let newRoleName = this.props.addNewUserRoleScreen.roleName;
		// let newModuleName = this.props.addNewUserRoleScreen.moduleName;
		// let newTeamName = this.props.addNewUserRoleScreen.teamName;
		// let newDepName = this.props.addNewUserRoleScreen.departmentName;
		// let newPhoneTypeName = this.props.addNewUserPhoneScreen.type_name;
		// let newPhoneNumber = this.props.addNewUserPhoneScreen.phone;
		// let newPhoneTypeID = this.getPhoneTypeID(newPhoneTypeName);
		// let phoneToValidate = "";

		// this.moduleID = -1;
		// for (let i = 0; i < this.props.modules.length; i++) { if (this.props.modules[i].name == newModuleName) { this.moduleID = this.props.modules[i].id; break; } }
		// this.roleID = this.getRoleIdByName(newRoleName);
		// this.teamID = this.getTeamDataByTeam(newTeamName).id;
		// this.depID = this.getDepIdByName(newDepName);

		// if (newPhoneTypeName.trim() == '' || newPhoneTypeID == -1) {
		//     this.invalidInputs.newPhoneTypeStyle = {borderColor: '#ff0000'};
		//     this.missingNewPhoneType = true;
		// }else {
		//     this.invalidInputs.newPhoneTypeStyle = {borderColor: '#cccccc'};
		//     this.missingNewPhoneType = false;
		// }

		// phoneToValidate = this.props.addNewUserPhoneScreen.phone.split('-').join('');
		// if ( newPhoneNumber.trim() == '' || !validatePhoneNumber(phoneToValidate) ){
		//     this.invalidInputs.newPhoneNumberStyle = {borderColor: '#ff0000'};
		//     this.missingNewPhoneNumber = true;
		// }else {
		//     this.invalidInputs.newPhoneNumberStyle = {borderColor: '#cccccc'};
		//     this.missingNewPhoneNumber = false;
		// }

		// if (newRoleName.trim() == '' || this.roleID == -1) { //NO USED
		//     this.invalidInputs.newRoleNameStyle = {borderColor: '#ff0000'};
		//     this.missingNewRoleName = true;
		// }
		// else {

		//     this.invalidInputs.newRoleNameStyle = {borderColor: '#cccccc'};
		//     this.missingNewRoleName = false;
		// }

		// if (newModuleName.trim() == '' || this.moduleID == -1) { //NO USED
		//         this.invalidInputs.newModuleNameStyle = {borderColor: '#ff0000'};
		//         this.missingNewModuleName = true;
		//     }else {

		//         this.invalidInputs.newModuleNameStyle = {borderColor: '#cccccc'};
		//         this.missingNewModuleName = false;
		//     }

		// if (newTeamName.trim() == '' || this.teamID == -1) { //NO USED
		//         this.invalidInputs.newTeamNameStyle = {borderColor: '#ff0000'};
		//         this.missingNewTeamName = true;
		//     }else {
		//         this.invalidInputs.newTeamNameStyle = {borderColor: '#cccccc'};
		//         this.missingNewTeamName = false;
		//     }

		// if (newDepName.trim() == '' || this.depID == -1) { //NO USED
		//         this.invalidInputs.newDepNameStyle = {borderColor: '#ff0000'};
		//         this.missingNewDepName = true;
		//     }else {
		//         this.invalidInputs.newDepNameStyle = {borderColor: '#cccccc'};
		//         this.missingNewDepName = false;
		//     }

		// *** NO USED END ****
	}

	/*function that loads user data by key or identity number , and doesnt load anything if it's a new user */
	loadUserData() {
		if (!this.props.selectedUserData.isUserLoaded && this.props.router.params.userKey != undefined) {
			if (this.props.location.pathname != 'system/users/new') {
				this.mountingFromUrl = true;
				SystemActions.loadUser('key', this.props.dispatch, this.props.router, this.props.router.params.userKey);
			} else {

				if (this.props.location.pathname == 'system/users/new') {
					if (this.props.searchVoterDetails == undefined || this.props.searchVoterDetails.id == null) {
						this.props.router.push('system/users/');
					} else {
						/* only if this is "new" tab - then it will check if user exists : */
						SystemActions.loadUser('metadata', this.props.dispatch, this.props.router, this.props.searchVoterDetails.id); // load user by personal metadata id
					}
				}
			}
		}
	}

	/* Change add user button to loader while loading */
	setAddingUserText() {
		if (this.props.addingUser) {
			return (<i className="fa fa-spinner fa-spin">**</i>)
		} else {
			return ((this.props.router.params.userKey == 'new') ? this.lables.createUser : this.lables.save);
		}
	}

	onClickSaveBtn(e) {
		let mainCount = 0;
		if (this.props.userRoles != undefined) {
			for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
				if (this.props.userRoles[i].main == 1) {
					mainCount++;
				}
			}
		}

		let phonesCount = 0;
		if (this.props.selectedUserData.userPhones != undefined) {
			for (let i = 0, len = this.props.selectedUserData.userPhones.length; i < len; i++) {
				if (this.getPhoneTypeID(this.props.selectedUserData.userPhones[i].name) != -1 && validatePhoneNumber(this.props.selectedUserData.userPhones[i].phone_number)) {
					phonesCount++;
				}
			}
		}

		//if there is invalid inputes
		if (Object.keys(this.invalidInputs).length) {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_DETAILS });
		}else if (phonesCount <= 0) {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_PHONES });
		}else if (this.props.userRoles == undefined || this.props.userRoles.length == 0) {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_ROLES });
		}else if (mainCount == 0) {
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.OPEN_MISSING_MAIN_ROLE });
		}else {
			let phonesArr = [];

			for (let i = 0, len = this.props.selectedUserData.userPhones.length; i < len; i++) {
				if (this.getPhoneTypeID(this.props.selectedUserData.userPhones[i].name) != -1 && validatePhoneNumber(this.props.selectedUserData.userPhones[i].phone_number)) {
					phonesArr.push({ key: this.props.selectedUserData.userPhones[i].key, phone_type: this.getPhoneTypeID(this.props.selectedUserData.userPhones[i].name), phone_number: this.props.selectedUserData.userPhones[i].phone_number });
				}
			}

			if (this.props.router.params.userKey == 'new') {
				let rolesArr = [];

				for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
					let fromDate = "";
					let toDate = "";
					let geoFilters = [];

					if (this.props.userRoles[i].from_date.length > 0) {
						fromDate = this.formatToDBDateOnlyString(this.props.userRoles[i].from_date);
					} else {
						fromDate = null;
					}

					if (this.props.userRoles[i].to_date.length > 0) {
						toDate = this.formatToDBDateOnlyString(this.props.userRoles[i].to_date);
					} else {
						toDate = null;
					}

					for (let j = 0; j < this.props.userRoles[i].geo_filters.length; j++) {

						if (this.props.userRoles[i].geo_filters[j].inherited == 1) {
							geoFilters.push(
								{
									name: this.props.userRoles[i].geo_filters[j].name,
									entity_type: this.props.userRoles[i].geo_filters[j].entity_type,
									entity_id: this.props.userRoles[i].geo_filters[j].entity_id,
									inherited_id: this.props.userRoles[i].geo_filters[j].inherited_id
								}
							);
						}
					}

					rolesArr.push(
						{
							user_role_id: this.getRoleIdByName(this.props.userRoles[i].name),
							team_id: this.getTeamDataByTeam(this.props.userRoles[i].team_name).id,
							team_department_id: this.getDepIdByName(this.props.userRoles[i].team_department_name),
							from_date: fromDate,
							to_date: toDate,
							main: this.props.userRoles[i].main,
							geoFilters: geoFilters
						}
					);
				}
				SystemActions.addEditUser('new', this.props.dispatch, this.props.router, this.props.selectedUserData.id,
					(this.props.newUserActive ? '1' : '0'),
					this.getCityID(this.props.selectedUserData.work_city_name),
					this.props.selectedUserData.work_neighborhood,
					this.getStreetData(this.props.selectedUserData.work_street).id,
					this.props.selectedUserData.work_house,
					this.props.selectedUserData.work_house_entry,
					this.props.selectedUserData.work_flat, null, this.props.selectedUserData.email,
					this.props.selectedUserData.userPhones.phone,
					this.props.selectedUserData.userPhones.cellPhone,
					this.props.selectedUserData.userPhones.extraPhone,
					this.props.randomUserPassword, (this.props.selectedUserData.shas_representative ? '1' : '0'),
					phonesArr,
					rolesArr,
					(this.props.currentUser.admin)? (this.props.newUserAdmin ? '1' : '0') : null,
					(this.props.currentUser.admin)? (this.props.selectedUserData.two_step_authentication ? '1' : '0') : '1',
					(this.props.currentUser.admin)? (this.props.selectedUserData.cancel_payment ? '1' : '0') : null);
			} else {
				SystemActions.addEditUser('update', this.props.dispatch, this.props.router, null,
					(this.props.selectedUserData.active ? '1' : '0'),
					this.getCityID(this.props.selectedUserData.work_city_name),
					this.props.selectedUserData.work_neighborhood,
					this.getStreetData(this.props.selectedUserData.work_street).id,
					this.props.selectedUserData.work_house,
					this.props.selectedUserData.work_house_entry,
					this.props.selectedUserData.work_flat,
					this.props.selectedUserData.key,
					this.props.selectedUserData.email,
					this.props.selectedUserData.userPhones.phone,
					this.props.selectedUserData.userPhones.cellPhone,
					this.props.selectedUserData.userPhones.extraPhone, null,
					(this.props.selectedUserData.shas_representative ? '1' : '0'),
					phonesArr,
					null,
					(this.props.currentUser.admin)? (this.props.selectedUserData.admin ? '1' : '0') : null,
					(this.props.currentUser.admin)? (this.props.selectedUserData.two_step_authentication ? '1' : '0') : null,
					(this.props.currentUser.admin)? (this.props.selectedUserData.cancel_payment ? '1' : '0') : null);
			}
		}

	}

	doRealDelete() {
		if (this.props.addingUserRole) {
			if (this.props.confirmDeleteRoleGeoFilterByUser) {// delete geo-filter of role
				this.props.dispatch({
					type: SystemActions.ActionTypes.USERS.DELETE_ROLE_GEO_FILTER_FROM_TEMP_ARRAY
					, data: this.props.confirmDeleteRoleGeoFilterByUserIndex
				});
			}
			else if (this.props.confirmDeleteRoleSectorialFilterByUser) { // delete sectorial-filter of role
				this.props.dispatch({
					type: GlobalActions.ActionTypes.GEO_FILTERS.DELETE_ROLE_SECORIAL_FILTER_FROM_TEMP_ARRAY
					, data: this.props.confirmDeleteRoleSectorialFilterByUserIndex
				});
				this.props.dispatch({ type: SystemActions.ActionTypes.USERS.HIDE_CONFIRM_DELETE_MODAL });

			}
		}
		else {

			if (this.props.router.params.userKey != 'new') { //existing user - save to database
				if (this.props.confirmDeleteRoleByUser) { //delete role-by-user
					SystemActions.deleteRoleByUser(this.props.dispatch, this.props.router.params.userKey, this.props.userRoles[this.props.confirmDeleteRoleByUserIndex].id);
				}
				else if (this.props.confirmDeleteRoleGeoFilterByUser) { // delete geo-filter of role
					SystemActions.deleteRoleGeoFilterByUser(this.props.dispatch, this.props.router.params.userKey
						, this.props.editingUserRoleIndex, this.props.confirmDeleteRoleGeoFilterByUserIndex
						, this.props.userRoles[this.props.editingUserRoleIndex].id,
						this.props.userRoles[this.props.editingUserRoleIndex].geo_filters[this.props.confirmDeleteRoleGeoFilterByUserIndex].id
					);
				}
				else if (this.props.confirmDeleteRoleSectorialFilterByUser) { // delete sectorial-filter of role
					SystemActions.deleteRoleSectorialFilterByUser(this.props.dispatch, this.props.router.params.userKey
						, this.props.editingUserRoleIndex, this.props.confirmDeleteRoleGeoFilterByUserIndex
						, this.props.userRoles[this.props.editingUserRoleIndex].id,
						this.props.userRoles[this.props.editingUserRoleIndex].sectorial_filters[this.props.confirmDeleteRoleSectorialFilterByUserIndex].id
					);

				}
			}
			else { // new user - save to array
				if (this.props.confirmDeleteRoleByUser) { //delete role-by-user
					this.props.dispatch({
						type: SystemActions.ActionTypes.USERS.DELETE_ROLE_FROM_TEMP_ARRAY
						, data: this.props.confirmDeleteRoleByUserIndex
					});

				}
				else if (this.props.confirmDeleteRoleGeoFilterByUser) { // delete geo-filter of role
					this.props.dispatch({
						type: SystemActions.ActionTypes.USERS.DELETE_GEO_FILTER_FROM_TEMP_ARRAY_OF_USER_ROLES
						, geoIndex: this.props.confirmDeleteRoleGeoFilterByUserIndex, roleIndex: this.props.editingUserRoleIndex
					});
				}
				else if (this.props.confirmDeleteRoleSectorialFilterByUser) { // delete sectorial-filter of role
					this.props.dispatch({
						type: SystemActions.ActionTypes.USERS.DELETE_SECTORIAL_FILTER_FROM_TEMP_ARRAY_OF_USER_ROLES
						, rowIndex: this.props.confirmDeleteRoleGeoFilterByUserIndex, roleIndex: this.props.editingUserRoleIndex
					});
				}
			}
		}
	}

	/**
	 * TODO::
	 * check, not used
	 */
	// addNewUserPhone() {
	// 	return;

	/*if(this.missingNewPhoneType || this.missingNewPhoneNumber){
		this.props.dispatch({type: SystemActions.ActionTypes.USERS.OPEN_GLOBAL_ERROR_MODAL , headerText:'שגיאה בהוספת טלפון' , contentText:'יש לבחור סוג טלפון ומספר טלפון תקינים'});
	}*/
	// let phoneTovalidate = this.props.addNewUserPhoneScreen.phone.split('-').join('');

	// if (this.props.router.params.userKey == 'new') {
	// 	if (validatePhoneNumber(phoneTovalidate) && this.getPhoneTypeID(this.props.addNewUserPhoneScreen.type_name) != -1) { // add new phone to new user - to temp array
	// 		this.props.dispatch({
	// 			type: SystemActions.ActionTypes.USERS.ADD_NEW_PHONE_TO_TEMP_ARRAY, type_name: this.props.addNewUserPhoneScreen.type_name, phone: this.props.addNewUserPhoneScreen.phone
	// 		});
	// 	}
	// }

	// else { // add phone to existing user
	// 	if (validatePhoneNumber(phoneTovalidate) && this.getPhoneTypeID(this.props.addNewUserPhoneScreen.type_name) != -1) { // add new phone to new user - to temp array
	// 		SystemActions.addNewUserPhone(this.props.dispatch, this.props.router.params.userKey, this.getPhoneTypeID(this.props.addNewUserPhoneScreen.type_name), this.props.addNewUserPhoneScreen.phone);
	// 	}
	// }
	// this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'system.users.phones' });
	// }

	updateCollapseStatus(container) {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_SCREEN_COLLAPSE_CHANGE, container });
	}

	renderAdminCheckBox() {
		if (this.props.currentUser.admin && this.props.selectedUserData.isUserLoaded) {
			return (<label><input type="checkbox" placeholder={this.lables.admin}
				disabled={this.props.selectedUserData.key == this.props.currentUser.key}
				checked={(this.props.selectedUserData.admin == '1' ? true : false)}
				onChange={this.adminChanged.bind(this)} />{this.lables.admin}</label>);
		}
	}

	renderActiveInTheSystem() {
		return (<label>
			<input type="checkbox" disabled={!this.props.selectedUserData && this.props.location.pathname != 'system/users/new'}
				placeholder={this.lables.isActive} checked={(this.props.selectedUserData.active == '1' ? true : false)} onChange={this.activeChanged.bind(this)} />
			&nbsp;{this.lables.isActive}</label>);
	}
	renderTwoStepAuthInSystem() {
		return (<label>
			<input type="checkbox" disabled={!this.props.currentUser.admin || !this.props.selectedUserData}
				placeholder={this.lables.twoStepAuth} checked={(this.props.selectedUserData.two_step_authentication == '1' ? true : false)} onChange={this.twoStepAuthChanged.bind(this)} />
			&nbsp;{this.lables.twoStepAuth}</label>);
	}

	renderCancelPayment() {
		return (<label >
			<input type="checkbox" disabled={!this.props.currentUser.admin || !this.props.selectedUserData}
				placeholder={this.lables.cancelPayment} checked={(this.props.selectedUserData.cancel_payment == '1' ? true : false)} onChange={this.cancelPaymentChanged.bind(this)} />
			&nbsp;{this.lables.cancelPayment}</label>);
	}


	renderMainBlock() {
		let userId = (this.props.router.params.userKey == 'new')? '' : this.props.selectedUserData.id;
		return (<section className="main-section-block" style={{ paddingTop: '15px', paddingRight: '20px' }}>
			<div className="row form-horizontal">
				<div className="col-md-1"></div>
				<div className="col-md-3 alert alert-info" style={this.mainContainerInfoStyle}>
					<h3>{this.lables.tz}:&nbsp;{this.props.selectedUserData.personal_identity}</h3>
					<h3>{this.lables.name}:&nbsp;{this.props.selectedUserData.first_name + ' ' + this.props.selectedUserData.last_name}</h3>
					<h3>{this.lables.userNumber}:&nbsp;{userId}</h3>
				</div>
				<div className="col-md-1"></div>
				<div className="col-md-3 alert alert-info" style={this.mainContainerInfoStyle}>
					<h3>{this.lables.creatorUser}:&nbsp;{this.props.selectedUserData.user_create_name}</h3>
					<h3>{this.lables.createDate}:&nbsp;{this.props.selectedUserData.user_created_at}</h3>
				</div>
				<div className="col-md-1"></div>
				<div className="col-md-2 alert alert-info checkbox" style={this.mainContainerCheckBoxStyle}>
					<h3 style={{lineHeight:'20px'}}>{this.renderAdminCheckBox()}</h3>
					<h3 style={{lineHeight:'20px'}}>{this.renderActiveInTheSystem()}</h3>
					<h3 style={{lineHeight:'20px'}}>{this.renderTwoStepAuthInSystem()}</h3>
					<h3 style={{lineHeight:'20px'}}>{this.renderCancelPayment()}</h3>
				</div>
			</div>
		</section>);
	}

	renderWorkAddressSection() {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="tab-pane fade active in" role="tabpanel">
						<div className="ContainerCollapse">
							<a onClick={this.updateCollapseStatus.bind(this, 'workAddress')} aria-expanded={this.props.containerCollapseStatus.workAddress}>
								<div className="row panelCollapse">
									<div className="collapseArrow closed"></div>
									<div className="collapseArrow open"></div>
									<div className="collapseTitle">{this.lables.workAddress}</div>
								</div>
							</a>
							<Collapse isOpened={this.props.containerCollapseStatus.workAddress}>
								<div className="row CollapseContent">
									<div className="row">
										<div className="col-md-1">{this.lables.city}</div>
										<div className={"col-md-3 form-group" + (this.invalidInputs.city ? ' has-error' : '')}>
											<Combo items={this.props.cities} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name'
												value={this.props.selectedUserData.work_city_name || ''} onChange={this.cityChange.bind(this)} />
										</div>
										<div className="col-md-1">{this.lables.neighborhood}</div>
										<div className="col-md-3 form-group">
											<input type="text" onChange={this.neighborhoodChange.bind(this)} className="form-control"
												placeholder={this.lables.neighborhood} value={this.props.selectedUserData.work_neighborhood || ''} />
										</div>
										<div className="col-md-1">{this.lables.street}</div>
										<div className={"col-md-3 form-group" + (this.invalidInputs.street ? ' has-error' : '')}>
											<Combo items={this.props.streets} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name'
												value={this.props.selectedUserData.work_street || ''} onChange={this.streetChange.bind(this)} />
										</div>
									</div>
									<div className="row">
										<div className="col-md-1">{this.lables.house}</div>
										<div className={"col-md-3 form-group" + (this.invalidInputs.house ? ' has-error' : '')}>
											<input type="text" className="form-control" placeholder={this.lables.house}
												value={this.props.selectedUserData.work_house || ''} onChange={this.houseNumberChange.bind(this)} />
										</div>
										<div className="col-md-1">{this.lables.entry}</div>
										<div className="col-md-3 form-group">
											<input type="text" onChange={this.houseEntryChange.bind(this)} className="form-control"
												placeholder={this.lables.entry} value={this.props.selectedUserData.work_house_entry || ''} />
										</div>
										<div className="col-md-1">{this.lables.flat}</div>
										<div className="col-md-3 form-group">
											<input type="text"
												onChange={this.flatChange.bind(this)} className="form-control" placeholder={this.lables.flat}
												value={this.props.selectedUserData.work_flat || ''} />
										</div>
									</div>
								</div>
							</Collapse>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderContactDetailsSection() {
		return (
			<div className="row">
				<div className="col-md-12">
					<div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
						<div className="ContainerCollapse" style={this.detailsTabStyle}>
							<a onClick={this.updateCollapseStatus.bind(this, 'contactDetails')}
								aria-expanded={this.props.containerCollapseStatus.contactDetails}>
								<div className="row panelCollapse">
									<div className="collapseArrow closed"></div>
									<div className="collapseArrow open"></div>
									<div className="collapseTitle">{this.lables.contactDetails}</div>
								</div>
							</a>
							<Collapse isOpened={this.props.containerCollapseStatus.contactDetails}>
								<div className="row">
									<div className="col-md-6">
										<UserPhone tableItems={this.props.selectedUserData.userPhones}></UserPhone>
									</div>
									<div className="col-md-6">
										<div className="row">
											<div className="col-md-2">{this.lables.email}</div>
											<div className={"col-md-6 form-group" + (this.invalidInputs.email ? ' has-error' : '')}>
												<input type="text" className="form-control" placeholder={this.lables.email}
													value={this.props.selectedUserData.email || ''} onChange={this.emailChange.bind(this)} />
											</div>
										</div>
									</div>
								</div>
							</Collapse>
						</div>
					</div>
				</div>
			</div>
		);
	}

	formatToDBDateOnlyString(strr) {
		if (strr == null) { return '' }
		else {
			if (strr != null && strr.length == 10) {
				let strArray = strr.split('/');
				if (strArray.length == 3) {
					return strArray[2] + '-' + strArray[1] + '-' + strArray[0];
				}
				else {
					return strr;
				}
			}
			else {
				return strr;
			}
		}
	}

	//START DIALOG OPENERS AND CLOSERS : 

	//??
	// showConfirmDeleteGeoFilter(roleIndex, geoFilterIndex, e) {
	// 	this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_GEO_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: geoFilterIndex });
	// }

	//??
	// showConfirmDeleteSectorialFilter(roleIndex, sectorialFilterIndex, e) {

	// 	if (this.props.addingUserRole) {
	// 		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: sectorialFilterIndex, addingNewRole: true });

	// 	}
	// 	else {

	// 		if (this.props.router.params.userKey == 'new') { //delete from roles temp array

	// 			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: sectorialFilterIndex });
	// 		}
	// 		else { //delete from database
	// 			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL, roleRowID: roleIndex, deleteRowIndex: sectorialFilterIndex });
	// 		}
	// 	}
	// }

	hideThisModal() {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.HIDE_CONFIRM_DELETE_MODAL });
	}

	/*general function that closes all types of dialogues */
	closeModalDialog() {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CLOSE_MODAL_DIALOG });

	}

	/*hide copy email and phones modal*/
	hideCopyModal() {
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.SHOW_HIDE_COPY_VOTER_DETAILS_DLG, data: false });
	}

	/*if user doesn't have email and phone - it can copy it from voter details*/
	copyNewVoterDetails() {
		if (this.props.searchVoterResult != undefined && this.props.searchVoterResult != null) {
			if (this.props.searchVoterResult.length > 0) {
				if (this.props.searchVoterResult[0].email != null && this.props.searchVoterResult[0].email != undefined && this.props.searchVoterResult[0].email.trim() != '') {
					this.props.dispatch({
						type: SystemActions.ActionTypes.USERS.USER_EMAIL_CHANGE,
						data: this.props.searchVoterResult[0].email

					});
				}
				if (this.props.searchVoterResult[0].phones.length > 0) {
					for (let i = 0, len = this.props.searchVoterResult[0].phones.length; i < len; i++) {

						this.props.dispatch({
							type: SystemActions.ActionTypes.USERS.ADD_NEW_PHONE_TO_TEMP_ARRAY, type_name: this.props.searchVoterResult[0].phones[i].phone_type_name, phone: this.props.searchVoterResult[0].phones[i].phone_number
						});
					}
				}
			}
		}
		this.hideCopyModal();
	}

	// showTempArrayAddEditGeoFilterDlg(isAdding) {
	// 	this.props.dispatch({
	// 		type: SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_TEMP_ROLE_ARRAY,
	// 		isAddingRole: isAdding, addingNewRoleToUser: this.props.addingUserRole
	// 	});
	// }

	// showTempArrayAddEditSectorialFilterDlg(isAdding) {
	// 	this.props.dispatch({
	// 		type: GlobalActions.ActionTypes.GEO_FILTERS.ADD_NEW_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY,
	// 		isAdding, addingNewRoleToUser: this.props.addingUserRole, data: 'הוספת מיקוד מגזרי לתפקיד חדש'
	// 	});
	// }

	//??
	// showEditSectorialFilterDialog(role_RowIndex, sectorial_RowIndex, definitionID, definitionGroupID, filterName, editSetorialFilterID, e) {
	// 	let selectedSectorialFilter = '', tempMainGeoFilter = '', labelName = '';
	// 	if (this.props.addingUserRole) { // editing sectorial-filter inside adding new role dialog
	// 		this.props.dispatch({
	// 			type: GlobalActions.ActionTypes.GEO_FILTERS.EDIT_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY,
	// 			isAdding: 0, addingNewRoleToUser: this.props.addingUserRole, data: 'עריכת מיקוד קיים לתפקיד חדש',
	// 			tempRowIndex: sectorial_RowIndex
	// 		});

	// 	}
	// 	else { // editing sectorial-filter inside adding existing role dialog

	// 		if (this.props.router.params.userKey == 'new') {
	// 			this.props.dispatch({
	// 				type: GlobalActions.ActionTypes.GEO_FILTERS.NEW_USER_OPEN_EDIT_EXISTING_GEO_FILTER_MODAL,
	// 				data: 'עריכת פילטר מגזרי קיים', roleUserID: this.props.userRoles[role_RowIndex].id, sectorialEditRowIndex: sectorial_RowIndex, roleUserIndex: role_RowIndex,
	// 				definitionID, definitionGroupID, filterName, editSetorialFilterID
	// 			});
	// 		}
	// 		else {
	// 			this.props.dispatch({
	// 				type: GlobalActions.ActionTypes.GEO_FILTERS.OPEN_EDIT_EXISTING_GEO_FILTER_MODAL,
	// 				data: 'עריכת פילטר מגזרי קיים', roleUserID: this.props.userRoles[role_RowIndex].id, sectorialEditRowIndex: sectorial_RowIndex, roleUserIndex: role_RowIndex,
	// 				definitionID, definitionGroupID, filterName, editSetorialFilterID
	// 			});
	// 		}
	// 	}
	// }

	//END DIALOG OPENERS AND CLOSERS : 
	///START ALL CHANGERS FUNCTIONS : 

	/*neighborhood name change */
	neighborhoodChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		let neighborhood = e.target.value;
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_NEIGHBORHOOD_CHANGE, data: neighborhood });

	}

	/*city combo change  */
	cityChange(e) {
		SystemActions.loadStreets(this.props.dispatch, this.getCityData(e.target.value).key);
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_STREET_CHANGE, data: '' });
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_CITY_CHANGE, data: e.target.value });

	}

	/*house number change */
	houseNumberChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_HOUSENUMBER_CHANGE, data: e.target.value });
	}

	/*house entry change */
	houseEntryChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_HOUSEENTRY_CHANGE, data: e.target.value });
	}

	/*street name change */
	streetChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_STREET_CHANGE, data: e.target.value });
	}

	/*flat number change */
	flatChange(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_FLAT_CHANGE, data: e.target.value });
	}

	/*user active checkbox change */
	activeChanged(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_ACTIVE_CHANGE, data: (e.target.value == 'on' ? '1' : '0') });
	}
	/*user two step auth checkbox change */
	twoStepAuthChanged(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_TWO_STEP_AUTH_CHANGE, data: (e.target.value == 'on' ? '1' : '0') });
	}

	cancelPaymentChanged(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
		this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_MANAGER_PAYMENT_CHANGE, data: (e.target.value == 'on' ? '1' : '0') });
	}


	/*user active checkbox change */
	adminChanged(e) {
		if (this.props.selectedUserData.key != this.props.currentUser.key) {
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_ADMIN_CHANGE, data: (e.target.value == 'on' ? '1' : '0') });
		}
	}

	/*email change */
	emailChange(e) {
		let email = e.target.value;
		if (/^[a-zA-Z0-9.@_\-]*$/.test(email)) {
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'system.users.general' });
			this.props.dispatch({ type: SystemActions.ActionTypes.USERS.USER_EMAIL_CHANGE, data: email });
		}
	}

	// ChangeNewPhoneType(e) {

	// 	this.props.dispatch({
	// 		type: SystemActions.ActionTypes.USERS.NEW_USER_PHONE_TYPE_CHANGE, data: e.target.value
	// 	});
	// }

	// ChangeNewPhoneNumber(e) {
	// 	this.props.dispatch({
	// 		type: SystemActions.ActionTypes.USERS.NEW_USER_PHONE_NUMBER_CHANGE, data: e.target.value
	// 	});
	// }


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
		let returnedValue = -1;
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

	getPhoneTypeID(phoneTypeName) {
		let returnedValue = -1;
		if (this.props.phoneTypes != undefined) {
			for (let i = 0, len = this.props.phoneTypes.length; i < len; i++) {
				if (this.props.phoneTypes[i].name == phoneTypeName) {
					returnedValue = this.props.phoneTypes[i].id;
					break;
				}
			}
		}
		return returnedValue;
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
		for (let field in this.invalidInputs) {
			if (this.invalidInputs[field] == true) {
				return true;
			}
		}
		if (isDuplicate) { return true; }
		if (this.props.dirtyComponents.length == 0 || this.props.savingChanges) { return true; }
		if (this.props.dirtyComponents.length == 0 && arrStr1 == arrStr2) { return true; }
		return false;

	}

	/**
	 * Switch current logged in user to the selected user
	 *
	 * @return void
	 */
	switchCurrentUser() {
		if(this.props.currentUser.admin != 0){
			SystemActions.switchCurrentUser(this.props.dispatch, this.props.router.params.userKey);
		}
	}
	/**
	 * @method unlockUserAccount
	 *  Unlock user account
	 *  - for multi Attempts sms reset password 
	 */
	unlockUserAccount(){
		if(this.props.currentUser.admin != 0){
			SystemActions.unlockOtherUser(this.props.dispatch, this.props.router.params.userKey);
		}
	}
	showResetUserPasswordModal(){
		let selectedUserData = {
			full_name: this.props.selectedUserData.last_name + ' ' + this.props.selectedUserData.first_name,
			id : this.props.selectedUserData.id,
			key : this.props.selectedUserData.key,
		}
		this.props.dispatch({
            type: SystemActions.ActionTypes.HEADER.OPEN_CHANGE_PASSWORD_MODAL, selectedUserData
        });
	}

	/**
	 * Render save and switch user buttons
	 *
	 * @return jsx
	 */	
	renderButtons() {
		let saveButton = '';
		let switchUserButton = '';
		let unlockUserAccount = '';
		let resetUserPassword = '';
		if (this.props.router.params.userKey != 'new') {		
			saveButton = (
				<button type="button" className="btn btn-success btn-md" onClick={this.onClickSaveBtn.bind(this)} disabled={this.isButtonDisabled() } >
					<span>{this.setAddingUserText()}</span>
				</button>
			)

			if ((this.props.currentUser.admin) && (Number(this.props.selectedUserData.active) == 1)) {
				let isUserLocked = this.props.selectedUserData.is_user_locked;
				switchUserButton = (
					<button type="button" 
							className="btn btn-primary btn-md" 
							style={{marginLeft: '5px'}}
							onClick={this.switchCurrentUser.bind(this)}>החלף למשתמש פעיל זה</button>
				)
				unlockUserAccount = (
					<button type="button" 
							className="btn btn-info btn-md" 
							style={{marginLeft: '5px'}}
							disabled={!isUserLocked}
							onClick={this.unlockUserAccount.bind(this)}>שחרר חשבון משתמש</button>
				)
				resetUserPassword = (
					<button type="button" 
							className="btn btn-warning btn-md" 
							style={{marginLeft: '5px'}}
							onClick={this.showResetUserPasswordModal.bind(this)}>אפס סיסמא למשתמש</button>
				)
			}
		}

		return (
			<div style={{ textAlign: 'left', paddingLeft: '40px' }}>
				{resetUserPassword}
				{unlockUserAccount}
				{switchUserButton}
				{saveButton}
			</div>
		)
	}

	//END ALL GETTER FUNCTIONS

	render() {
		
		if (this.props.router.params.userKey == undefined) {
			//search voter component
			return <div>
						<h1>משתמשים</h1>
			            <SearchUser />
						<ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)}
						title={this.props.modalHeaderText}><div>{this.props.modalContentText}</div>
					    </ModalWindow>
				   </div>;
		} else {
			this.validatorStyleIgnitor();

			let modalCopyItems = '';
			let modalCopyItemsEmail = '';
			if (this.props.searchVoterResult[0] != undefined && this.props.searchVoterResult[0].phones != undefined) {
				if (this.props.searchVoterResult[0].phones.length > 0 || (this.props.searchVoterResult[0].email != null && this.props.searchVoterResult[0].email != undefined && this.props.searchVoterResult[0].email.trim() != '')) {
					for (let i = 0; i < this.props.searchVoterResult[0].phones.length; i++) {
						modalCopyItems += this.props.searchVoterResult[0].phones[i].phone_type_name + ' : ' + this.props.searchVoterResult[0].phones[i].phone_number + ',';
					}
				}
				if (this.props.searchVoterResult[0].email != null && this.props.searchVoterResult[0].email != undefined && this.props.searchVoterResult[0].email.trim() != '') {
					modalCopyItemsEmail = 'אימייל : ' + this.props.searchVoterResult[0].email + ',';
				}
			}

			// if (this.props.currentUser.admin ||
			// 	(this.props.currentUser.permissions['system.users.add'] && this.props.router.params.userKey == 'new') ||
			// 	(this.props.currentUser.permissions['system.users.edit'] && (this.props.router.params.userKey != 'new'))
			// ) {
			// 	let mainCount = 0;
			// 	let missingRequiredData = false;
			// 	if (this.props.userRoles != undefined) {
			// 		for (let i = 0, len = this.props.userRoles.length; i < len; i++) {
			// 			if (this.props.userRoles[i].main == 1) {
			// 				mainCount++;
			// 			}
			// 		}
			// 	}

			// 	//if there is invalid inputes
			// 	if (Object.keys(this.invalidInputs).length) {
			// 		missingRequiredData = true;
			// 	}
			// 	else if (this.noPhones) {
			// 		missingRequiredData = true;
			// 	}
			// 	else if (this.props.userRoles == undefined || this.props.userRoles.length == 0) {
			// 		missingRequiredData = true;
			// 	}
			// 	else if (mainCount == 0) {
			// 		missingRequiredData = true;
			// 	}
			// }

			// ---------

			return (
				<div>
				    <h1>משתמשים</h1>
					{this.renderMainBlock()}
					<section className="section-block" style={{ padding: 15 }}>
						{this.renderWorkAddressSection()}
						{this.renderContactDetailsSection()}
						{this.renderButtons()}
					</section>
					{
						(this.props.currentUser.admin || this.props.currentUser.permissions['system.users.roles']) &&
						<UserRoles addNewUserRoleScreen={this.props.addNewUserRoleScreen}
							addingUserRole={this.props.addingUserRole}
							addingGeographicalFilter={this.props.addingGeographicalFilter}
							editingGeographicalFilter={this.props.editingGeographicalFilter}
							tempUserRoleGeoFilters={this.props.tempUserRoleGeoFilters}
							tempRoleSectorialFilters={this.props.tempRoleSectorialFilters}
							tempUserRoleTeamGeoFilters={this.props.tempUserRoleTeamGeoFilters}
							userScreen={this.props.userScreen}
							modules={this.props.modules}
							onClickSaveBtn={this.onClickSaveBtn.bind(this)} />
					}

					<ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)}
						title={this.props.modalHeaderText}><div>{this.props.modalContentText}</div>
					</ModalWindow>

					<ModalWindow show={this.props.confirmDeleteRoleByUser || this.props.confirmDeleteRoleGeoFilterByUser || this.props.confirmDeleteRoleSectorialFilterByUser}
						title={this.lables.deleteConfirm} buttonOk={this.doRealDelete.bind(this)} buttonCancel={this.hideThisModal.bind(this)}
						buttonX={this.hideThisModal.bind(this)}>
						{this.lables.areYouSure}
					</ModalWindow>

					<ModalWindow show={this.props.showCopyDialog && this.props.router.params.userKey == 'new'} title={this.lables.copyInfo}
						buttonOk={this.copyNewVoterDetails.bind(this)} buttonCancel={this.hideCopyModal.bind(this)} buttonX={this.hideCopyModal.bind(this)}>
						<div>
							{this.lables.voterInfo}
							{modalCopyItems}
							{modalCopyItemsEmail}
							{this.lables.ifCopyInfo}
						</div>
					</ModalWindow>
				</div>
			);
		}
	};

};

function mapStateToProps(state) {
	return {
		savingChanges: state.system.savingChanges,
		dirtyComponents: state.system.dirtyComponents,
		searchVoterDetails: state.voters.voterDetails,
		showModalDialog: state.system.userScreen.showModalDialog,
		selectedUserData: state.system.selectedUserData,
		originalUserPhones: state.system.originalUserPhones,
		addingUser: state.system.addingUser,
		addedUser: state.system.addedUser,
		cities: state.system.cities,
		randomUserPassword: state.system.userScreen.randomUserPassword,
		tempUserRoleGeoFilters: state.system.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters,
		tempUserRoleTeamGeoFilters: state.system.userScreen.tempUserRoleTeamGeoFilters,
		oldUserPassword: state.system.userScreen.oldUserPassword,
		// showChangePasswordModal: state.system.userScreen.showResetPasswordModal,
		modalHeaderText: state.system.userScreen.modalHeaderText,
		modalContentText: state.system.userScreen.modalContentText,
		newUserActive: state.system.userScreen.newUserActive,
		newUserAdmin: state.system.userScreen.newUserAdmin,
		// updateButtonClicked: state.system.userScreen.updateButtonClicked,
		// tabLowerFrame: state.system.userScreen.tabLowerFrame,
		userRoles: state.system.selectedUserData.roles_by_user,
		teams: state.system.teams,
		phoneTypes: state.system.phoneTypes,
		roleDepartments: state.system.userScreen.roleDepartments,
		roles: state.system.roles,
		modules: state.system.modules,
		addingUserRole: state.system.userScreen.addingUserRole,
		editingUserRoleIndex: state.system.userScreen.editingUserRoleIndex,
		addingGeographicalFilter: state.system.userScreen.addingGeographicalFilter,
		editingGeographicalFilter: state.system.userScreen.editingGeographicalFilter,
		modalGeographicalFilterRoleIndex: state.system.userScreen.modalGeographicalFilterRoleIndex,
		// geographicalModalHeader: state.system.userScreen.geographicalModalHeader,
		geoFilterModalScreen: state.system.userScreen.geoFilterModalScreen,
		// deleteUserRoleIndex: state.system.userScreen.deleteUserRoleIndex,
		addNewUserRoleScreen: state.system.userScreen.addNewUserRoleScreen,
		// addingNewUserPhone: state.system.userScreen.addingNewUserPhone,
		// isPhoneInEditMode: state.system.userScreen.isPhoneInEditMode,
		addNewUserPhoneScreen: state.system.userScreen.addNewUserPhoneScreen,
		confirmDeleteRoleByUser: state.system.userScreen.confirmDeleteRoleByUser,
		confirmDeleteRoleByUserIndex: state.system.userScreen.confirmDeleteRoleByUserIndex,
		confirmDeleteRoleGeoFilterByUser: state.system.userScreen.confirmDeleteRoleGeoFilterByUser,
		confirmDeleteRoleGeoFilterByUserIndex: state.system.userScreen.confirmDeleteRoleGeoFilterByUserIndex,
		confirmDeleteRoleSectorialFilterByUser: state.system.userScreen.confirmDeleteRoleSectorialFilterByUser,
		confirmDeleteRoleSectorialFilterByUserIndex: state.system.userScreen.confirmDeleteRoleSectorialFilterByUserIndex,
		tempRoleSectorialFilters: state.global.sectorialFiltersScreen.tempRoleSectorialFilters,
		currentUser: state.system.currentUser,
		showCopyDialog: state.system.userScreen.showCopyDialog,
		searchVoterResult: state.voters.searchVoterScreen.searchVoterResult,
		areas: state.system.lists.areas,
		streets: state.system.lists.streets,
		subAreas: state.system.lists.subAreas,
		userScreen: state.system.userScreen,
		containerCollapseStatus: state.system.userScreen.containerCollapseStatus,
	};
}

export default globalSaving(connect(mapStateToProps)(withRouter(Users)));
