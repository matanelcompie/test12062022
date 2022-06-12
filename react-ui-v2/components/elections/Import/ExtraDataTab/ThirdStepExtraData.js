import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterGroups from '../../../global/voterGroup/VoterGroups';
import VoterGroupModal from 'components/global/voterGroupModal/VoterGroupModal';
import Combo from '../../../global/Combo';
import ModalWindow from '../../../global/ModalWindow';
import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import BottomButtons from '../BottomButtons';
import AddInstituteSource from './AddInstituteSource';


import importCsvFieldsOptions from 'libs/importCsvFieldsOptions';

class ThirdStepExtraData extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
				showChooseVoterGroupDlg: false, 
				voterGroupModal: {
					show: false
				},
				voterGroup: {
					id: null,
					key: null,
					name: null,
					fullPath:''
				}
		};
		this.initConstants();
	}

	componentWillMount() {
		//console.log(this.props.extraData.selectedGender);
 
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: "קובץ: " + this.props.fileData.fileName });
	}

	/*
	   function that handles 'back' button and sets correct tab name , and therefore goes back :
	*/
	backToSecondStage() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB, tabName: 'dataDefinition' });
	}

	/*
	   function that inits constants : 
	*/
	initConstants() {
		this.conflictTexts = {
			'ethnic_group_id': 'עדה',
			'gender': 'מגדר',
			'strictly_orthodox': 'חרדי',
			'religious_group_id': 'זרם',
			'support_status': 'סטטוס תמיכה סניף',
			'institute_id': 'מוסד',
			'institute_role_id': 'תפקיד במוסד',
		}
		this.classificationComboItems = [
			{ id: 0, name: "פתוח" },
			{ id: 1, name: "מוגבל" },
			{ id: 2, name: "מוגבל חלקית" },
		];

		this.defaultSupportStatusUpdateType = 2;//always update

		if (this.props.instituteRoles.length == 0) {
			ElectionsActions.getInstituteRoles(this.props.dispatch);
		}

		if (this.props.supportStatuses.length == 0) {
			ElectionsActions.loadAllSupportStatuses(this.props.dispatch);
		}
		if (this.props.extraData.ethnicGroups.length == 0) {
			ElectionsActions.getEthnicGroups(this.props.dispatch);
		}
		if (this.props.extraData.religiousGroups.length == 0) {
			ElectionsActions.getReligiousGroups(this.props.dispatch);
		}
	}


	/*
	   function that changes state of collapses by state values : 
	*/
	updateCollapseStatus(container) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_COLLAPSE_CHANGE, container });
	}

	/*
	  occures when user presses 'continue' button : 
	*/
	continueToLastStage() {
		if(!this.props.lastStepScreen.currentProcessedDataState.csvFileStatus){ //process didn't start :
			let paramsArray = {};
			if (this.props.extraData.selectedStatus.item != null) {
				paramsArray.support_status_key = this.props.extraData.selectedStatus.item.key;
			}
			if (this.props.extraData.updateStatusExists.item != null) {
				paramsArray.update_support_status_if_exists = this.props.extraData.updateStatusExists.item.id;
			}
			if (this.props.extraData.supportStatusUpdateType != null) {
				paramsArray.support_status_update_type_id = this.props.extraData.supportStatusUpdateType;
			}
			paramsArray.update_household_support_status = this.props.extraData.updateStatus4EachHousehold;

			if (this.props.extraData.selectedInstituteKey != '') {
				paramsArray.institute_key = this.props.extraData.selectedInstituteKey;
			}
			if (this.props.extraData.selectedRole.item != null) {
				paramsArray.institute_role_key = this.props.extraData.selectedRole.item.key;
			}

			if (this.props.extraData.classificationItem.item != null) {
				paramsArray.institute_categorization_key = this.props.extraData.classificationItem.item.id;
			}

			if (this.props.extraData.selectedEthnicGroup.item != null) {
				paramsArray.ethnic_group_key = this.props.extraData.selectedEthnicGroup.item.key;
			}	

			if (this.props.extraData.selectedReligiousGroup.item != null) {
				paramsArray.religious_group_key = this.props.extraData.selectedReligiousGroup.item.key;
			}

			if (this.props.extraData.selectedGender.item != null) {
				paramsArray.gender = this.props.extraData.selectedGender.item.id;
			}

			if (this.props.extraData.selectedOrthodox.item != null) {
				paramsArray.strictly_orthodox = this.props.extraData.selectedOrthodox.item.id == 1 ? '1' : '0';
			}

			if (this.state.voterGroup.key) {
				paramsArray.selected_voter_group_key = this.state.voterGroup.key;
				paramsArray.groupFullPath = this.state.voterGroup.fullPath;
			}
			//console.log(paramsArray);

			let allowExecuting = (this.props.currentUser.admin || this.props.currentUser.permissions['elections.import.execute']);

			ElectionsActions.saveThirdStepData(this.props.dispatch, this.props.fileData.fileKey, paramsArray, allowExecuting);
		 
		}
		else{
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB, tabName: 'lastStep' });
			 
		}
	}

	/*
	  general function that handles combo value change :  
	*/
	comboItemChange(comboName, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_COMBO_ITEM_CHANGE, comboName, comboValue: e.target.value, comboReference: e.target.selectedItem });
	}

	/*
	  general function that handles checkbox checked change :  
	*/
	checkboxChange(itemName, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName, itemValue: e.target.checked });
	}

	/*
	  general function that handles radio value change :  
	*/
	radioOptionChange(radioName, radioValue, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: radioName, itemValue: radioValue });
	}

	/*
	  function that shows choose-institute modal window : 
	*/
	showSearchInstituteModalWindow() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SHOW_INSTITUTE_SOURCE_MODAL_DIALOG });
	}

	/*
	function that constructs items for render function
	*/
	constructDynamicItems() {
		this.modalAddInstituteItem = '';
		if (this.props.extraData.showChooseInstituteModalDialog) {
			this.modalAddInstituteItem = <AddInstituteSource />;
		}

		let self = this;
		this.filteredRolesList = this.props.instituteRoles.filter(function (role) {
			return role.institute_type_id == self.props.extraData.selectedInstituteTypeID
		});

	}
	/**
	 * @method checkcomboListConflicts
	 * - check if their is conflicts between:
	 * -> the second step combo details - to the third step selected details
	 * 
	 * if their is conflict: display warning message for each conflict. 
	 * 
	 * @returns void
	 */
	checkComboListConflicts() {

		let comboConflicts = {
			support_status: false,
			ethnic_group_id: false,
			religious_group_id: false,
			gender: false,
			strictly_orthodox: false,
			institute_id: false,
			institute_role_id: false,
		};
		let idComboObj = {};
		this.props.comboValuesList.forEach(function (item) {
			if (item.id != -1) {
				idComboObj[item.id] = item;
			}
		});
		this.idComboObj = idComboObj;
		let extraData = this.props.extraData;
		if (extraData.selectedStatus.item) { //if status selected
			this.checkComboConflict(4, comboConflicts);
		}
		if (extraData.selectedEthnicGroup.item) { //if ethnic selected
			this.checkComboConflict(23, comboConflicts);
		}
		if (extraData.selectedReligiousGroup.item) { //if religious selected
			this.checkComboConflict(29, comboConflicts);
		}
		if (extraData.selectedGender.item) { //if gender selected
			this.checkComboConflict(24, comboConflicts);
		}
		if (extraData.selectedOrthodox.item && this.props.extraData.selectedOrthodox.item.id) { //if orthodox selected
			this.checkComboConflict(25, comboConflicts);
		}
		if (this.props.extraData.selectedRole && this.props.extraData.selectedRole.item) { //if role selected
			this.checkComboConflict(13, comboConflicts);
			this.checkComboConflict(14, comboConflicts);
		}
		this.comboConflicts = comboConflicts;

	}
	checkComboConflict(id, comboConflicts) {
		let hasConflict = false
		let conflictName;
		if (this.idComboObj.hasOwnProperty(id)) {
			let comboItem = this.getCsvFieldById(id);
			conflictName = comboItem.full_name;
			hasConflict = true;
		}
		if (hasConflict) {
			comboConflicts[conflictName] = hasConflict;
		}
	}
	renderConflictWarning(conflictsList) {
		let self = this;
		let conflictText = '';
		let comboConflicts = this.comboConflicts
		conflictsList.forEach(function (conflictName, i) {
			if (comboConflicts[conflictName]) {
				if (conflictText != '') {conflictText += ',';}
				conflictText += '"' + self.conflictTexts[conflictName] + '"';
			}
		})
		if (conflictText != '') {
			return <div className="row alert alert-warning" style={{ marginTop: '10px' }}><span>הפרטים הבאים: {conflictText}, שהוגדרו בשלב ה "עמודות" לא יושפעו !</span></div>
		}
	}
	/*
	Handles opening/closing voter group modal dialog
	*/
	showHideModalChooseGroupDlg(value) {
		if (!value) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'newVoterGroupName', itemValue: '' });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedVotersGroupsHierarchy', itemValue: [] });
		}
		this.setState({ showChooseVoterGroupDlg: value });
	}

    /*
	Handles changing combo value in voter group modal dialog
	*/
	selectAnotherValueInGroupsCombo(levelIndex, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'insertedNewGroupName', itemValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_VOTER_GROUP_COMBO_CHANGE, levelIndex, levelValue: e.target.value, levelItem: e.target.selectedItem });
	}

	/*
	Handles adding voter group to csv-input-file params
	*/
	setSelectedVoterGroup() {
		let selectedGroupKey = '';
		let selectedGroupFullPath = '';

		for (let i = 0; i < this.props.extraData.selectedVotersGroupsHierarchy.length; i++) {
			if (this.props.extraData.selectedVotersGroupsHierarchy[i].item) {
				selectedGroupFullPath += this.props.extraData.selectedVotersGroupsHierarchy[i].item.name + (i == this.props.extraData.selectedVotersGroupsHierarchy.length - 1 ? "" : " > ");
				if (this.props.extraData.insertedNewGroupName) {
					selectedGroupFullPath += " > " + this.props.extraData.insertedNewGroupName;
				}
			}
		}
		for (let i = this.props.extraData.selectedVotersGroupsHierarchy.length - 1; i >= 0; i--) {
			if (this.props.extraData.selectedVotersGroupsHierarchy[i].item) {
				selectedGroupKey = this.props.extraData.selectedVotersGroupsHierarchy[i].item.key;
				break;
			}
		}

		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedVoterGroupFullPathname', itemValue: selectedGroupFullPath });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedVoterGroupKey', itemValue: selectedGroupKey });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'newVoterGroupName', itemValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedVotersGroupsHierarchy', itemValue: [] });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'insertedNewGroupName', itemValue: '' });
		this.setState({ showChooseVoterGroupDlg: false });

	}

	/*
	Handles new group name text value field change in modal dialog
	*/
	newGroupNameChange(e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'newVoterGroupName', itemValue: e.target.value });
	}

	/*
	Handles adding new group name inside last selected hierarchy and adding it to lists + setting selected
	*/
	addNewGroupNameViaAPI(e) {
		let selectedGroupKey = '';
		for (let i = this.props.extraData.selectedVotersGroupsHierarchy.length - 1; i >= 0; i--) {
			if (this.props.extraData.selectedVotersGroupsHierarchy[i].item) {
				selectedGroupKey = this.props.extraData.selectedVotersGroupsHierarchy[i].item.key;
				break;
			}
		}
		let dataObj = {};
		dataObj.name = this.props.extraData.newVoterGroupName;
		if (selectedGroupKey != '') {
			dataObj.parentKey = selectedGroupKey;
		}
		ElectionsActions.addNewGroupName(this.props.dispatch, dataObj);
	}
	
 
	
	updateGroupDetails(voterGroupObj) {
        let voterGroup = {...voterGroupObj};
		voterGroup.fullPath = voterGroupObj.fullGroupPath;

        this.setState({voterGroup});
 
        this.hideVoterGroupModal();

        let dataObj = {
            voter_group_id: voterGroupObj.id
        };
       // this.props.updateMassUpdateData('voterGroupData', dataObj);
    }

	/*
	   delete current group selection
	*/
	deleteGroupSelection() {
		let voterGroup = {
					id: null,
					key: null,
					name: null,
					fullPath:''
				};
		this.setState({voterGroup});
	}

	checkIfEditAbleField(id) {
		let result = this.getCsvFieldById(id);
		return result ? result.canEdit : false;
	}
	getCsvFieldById(id) {
		return importCsvFieldsOptions.find(option => option.id == id);
	}
	/*
		Get count of selected columns list
	*/
	checkIfEditDetailsSelected() {
		let self = this;
		let count = 0;

		this.props.comboValuesList.forEach(function (item) {
			if (item.id != -1 && self.checkIfEditAbleField(item.id)) {
				count++;
			}
		});
		return count;
	}
	checkIfSelectedAnyParameterInThisStage() {
 
		let selected = false;
		if ((this.props.extraData.selectedOrthodox.item && this.props.extraData.selectedOrthodox.item.id)
			|| (this.props.extraData.selectedInstituteKey != '') && (this.props.extraData.selectedRole.value != '')
			|| this.props.extraData.selectedStatus.item
			|| this.state.voterGroup.key
			|| this.props.extraData.selectedRole.item
			|| this.props.extraData.selectedEthnicGroup.item
			|| this.props.extraData.selectedReligiousGroup.item
			|| this.props.extraData.selectedGender.item) {
			selected = true;
		}
		return selected;
	}
	/*
	   Handle clean selected institute
	*/
	cleanSelectedInstitute() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedInstituteKey', itemValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedInstituteTypeID', itemValue: -1 });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedInstituteSelectedDataTop', itemValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedInstituteSelectedDataBottom', itemValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'selectedRole', itemValue: '' });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE, itemName: 'instituteRoles', itemValue: [] });

	}
	
	hideVoterGroupModal() {
        let voterGroupModal = this.state.voterGroupModal;

        voterGroupModal.show = false;
        this.setState({voterGroupModal});
    }

    showVoterGroupModal() {
        let voterGroupModal = this.state.voterGroupModal;

        voterGroupModal.show = true;
        this.setState({voterGroupModal});
    }

	render() {
		//this.props.lastStepScreen.currentProcessedDataState.csvFileStatus
		let editModeDisabled = false;
		if(this.props.lastStepScreen.currentProcessedDataState.csvFileStatus > 0 ){
			editModeDisabled = true;
		}
		 
		this.checkComboListConflicts();
		this.constructDynamicItems();

		let isContinueBtnDisabled = (this.checkIfEditDetailsSelected() == 0 && !this.checkIfSelectedAnyParameterInThisStage());
		return (
			<div>
				{this.modalAddInstituteItem}
				<div className="row alertContainer">
					<div className="alert alert-warning" role="alert"><strong>שים לב!</strong> תצוגה מקדימה של העמודות בקובץ</div>
				</div>
				<div className="row contentContainer">
					<div className="col-lg-12">
						<div className="row wizardTabs">
							<div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
								{/* first collapse : */}
								{(this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.import.edit.support_status'] == true) ?

									<div className="ContainerCollapse">
										<a onClick={this.updateCollapseStatus.bind(this, 'firstCollapseOpened')} aria-expanded={this.props.extraData.firstCollapseOpened}>
											<div className="row panelCollapse">
												<div className="collapseArrow closed"></div>
												<div className="collapseArrow open"></div>
												<div className="collapseTitle">עדכון סטטוס</div>
											</div>
										</a>
										<Collapse isOpened={this.props.extraData.firstCollapseOpened}>
											<div className="row CollapseContent nomargin">
												<div className="col-lg-6">
													<div className="row form-group">
														<label htmlFor="inputChosenStatus" className="col-sm-4 control-label">סטטוס נבחר</label>
														<div className="col-sm-7">
															<Combo items={this.props.supportStatuses}
																disabled={editModeDisabled}
																maxDisplayItems={10} itemIdProperty="id"
																itemDisplayProperty='name' value={this.props.extraData.selectedStatus.value} onChange={this.comboItemChange.bind(this, 'selectedStatus')} />
														</div>
													</div>
													<div className="row form-group">
														<div className="radio">
															<label>
																<input type="radio" disabled={!this.props.extraData.selectedStatus.item || editModeDisabled} checked={this.props.extraData.supportStatusUpdateType == 0} onChange={this.radioOptionChange.bind(this, 'supportStatusUpdateType', 0)} />
																סטטוס סניף מקסימלי
                                                				<div className="subRadioInput">(אם הסטטוס הנבחר גבוה מהסטטוס הקיים, הסטטוס יעודכן לסטטוס הנבחר)</div>
															</label>
														</div>
														<div className="radio">
															<label>
																<input type="radio" disabled={!this.props.extraData.selectedStatus.item || editModeDisabled} checked={this.props.extraData.supportStatusUpdateType == 1} onChange={this.radioOptionChange.bind(this, 'supportStatusUpdateType', 1)} />
																סטטוס סניף מינימלי
                                                			<div className="subRadioInput">(אם הסטטוס הנבחר נמוך מהסטטוס הקיים, הסטטוס יעודכן לסטטוס הנבחר)</div>
															</label>
														</div>
														<div className="radio">
															<label>
																<input type="radio" disabled={!this.props.extraData.selectedStatus.item || editModeDisabled} checked={this.props.extraData.supportStatusUpdateType == 2} onChange={this.radioOptionChange.bind(this, 'supportStatusUpdateType', 2)} />
																עדכן תמיד
                                           					 </label>
														</div>
													</div>
												</div>
												<div className="col-lg-6">
													<div className="row form-group">
														<label htmlFor="inputNoStatus" className="col-sm-5 control-label">כאשר קיים סטטוס סניף לתושב</label>
														<div className="col-sm-7">
															<Combo items={this.props.extraData.updateStatusExistsList}
																disabled={!this.props.extraData.selectedStatus.item || editModeDisabled}
																maxDisplayItems={10} itemIdProperty="id"
																itemDisplayProperty='name' value={this.props.extraData.updateStatusExists.value}
																onChange={this.comboItemChange.bind(this, 'updateStatusExists')} />
														</div>
													</div>
													<div className="row form-group">
														<div className="checkbox">
															<label>
																<input type="checkbox" checked={this.props.extraData.updateStatus4EachHousehold} disabled={!this.props.extraData.selectedStatus.item || editModeDisabled} onChange={this.checkboxChange.bind(this, 'updateStatus4EachHousehold')} />
																עדכן את סטטוס הסניף לכל בית אב </label>
														</div>
													</div>
												</div>
											</div>
											{this.renderConflictWarning(['support_status'])}

										</Collapse>
									</div> : null}


								{/* second collapse : */}
								<div className="ContainerCollapse">
									<a onClick={this.updateCollapseStatus.bind(this, 'secondCollapseOpened')} aria-expanded={this.props.extraData.secondCollapseOpened}>
										<div className="row panelCollapse">
											<div className="collapseArrow closed"></div>
											<div className="collapseArrow open"></div>
											<div className="collapseTitle">עדכון מוסד</div>
										</div>
									</a>
									<Collapse isOpened={this.props.extraData.secondCollapseOpened}>
										<div className="row CollapseContent">
											<div className="col-lg-4">
												<div className="form-group">
													<label htmlFor="inputSupplyrID" className="col-sm-4 control-label">פרטי מוסד</label>
													{this.props.extraData.selectedInstituteSelectedDataTop ? <div className="col-sm-6">

														<span style={{ color: '#737373' }}>
															{this.props.extraData.selectedInstituteSelectedDataTop} <br />
															{this.props.extraData.selectedInstituteSelectedDataBottom}</span>
													</div> : null}
													<div className="col-sm-1 srchIcon" style={{ marginTop: '-1px' }}>
														{editModeDisabled ? null : <a title="חפש תושב" style={{ cursor: 'pointer' }} onClick={this.showSearchInstituteModalWindow.bind(this)}>
															<img src={window.Laravel.baseURL + "Images/ico-search-blue.svg"} />
														</a>}

													</div>
													{this.props.extraData.selectedInstituteKey != '' && <div className="col-sm-1">
														<button className="btn btn-primary" disabled={editModeDisabled} onClick={this.cleanSelectedInstitute.bind(this)}>נקה</button>
													</div>}
												</div>
											</div>
											<div className="col-lg-4">
												<div className="form-group">
													<label htmlFor="inputRole" className="col-sm-4 control-label">תפקיד במוסד</label>
													<div className="col-sm-8">
														<Combo items={this.filteredRolesList} disabled={editModeDisabled} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' inputStyle={{ borderColor: (this.filteredRolesList.length > 0 && !this.props.extraData.selectedRole.item ? '#ff0000' : '#ccc') }} value={this.props.extraData.selectedRole.value} onChange={this.comboItemChange.bind(this, 'selectedRole')} />
													</div>
												</div>
											</div>
											<div className="col-lg-4">
												<div className="form-group">
													<label htmlFor="inputClass" className="col-sm-3 control-label">סיווג</label>
													<div className="col-sm-8">
														<Combo items={this.classificationComboItems}
															disabled={editModeDisabled}
															maxDisplayItems={10} itemIdProperty="id"
															itemDisplayProperty='name' value={this.props.extraData.classificationItem.value} onChange={this.comboItemChange.bind(this, 'classificationItem')} />
													</div>
												</div>
											</div>
										</div>
										{this.renderConflictWarning(['institute_id', 'institute_role_id'])}

									</Collapse>
								</div>
								{/* end second collapse */}

								{/*start third collapse*/}
								<div className="ContainerCollapse">
									<a onClick={this.updateCollapseStatus.bind(this, 'thirdCollapseOpened')} aria-expanded={this.props.extraData.thirdCollapseOpened}>
										<div className="row panelCollapse">
											<div className="collapseArrow closed"></div>
											<div className="collapseArrow open"></div>
											<div className="collapseTitle">עדכון קבוצה</div>
										</div>
									</a>
									<Collapse isOpened={this.props.extraData.thirdCollapseOpened}>
										<div className="row CollapseContent nomargin">
											<div className="col-lg-12">
												<button className="btn btn-primary" disabled={editModeDisabled} onClick={this.showVoterGroupModal.bind(this)}>בחירת קבוצה לשיוך תושבים</button>

												{this.state.voterGroup.fullPath == '' ? <div style={{ fontWeight: '600' }}><br /> לא נבחרה קבוצה</div> : <div><br /><u>קבוצה שנבחרה :</u> {this.state.voterGroup.fullPath} &nbsp; <button className="btn btn-primary" onClick={this.deleteGroupSelection.bind(this)}>מחיקת קבוצה שנבחרה</button></div>}
											</div>

										</div>

									</Collapse>
									
									<VoterGroupModal show={this.state.voterGroupModal.show} hideModal={this.hideVoterGroupModal.bind(this)}
										updateGroupDetails={this.updateGroupDetails.bind(this)} allowAddNewGroup={true} />
										
								</div>

								{/*end third collapse*/}


								{/*start fourth collapse*/}
								<div className="ContainerCollapse">
									<a onClick={this.updateCollapseStatus.bind(this, 'fourthCollapseOpened')} aria-expanded={this.props.extraData.fourthCollapseOpened}>
										<div className="row panelCollapse">
											<div className="collapseArrow closed"></div>
											<div className="collapseArrow open"></div>
											<div className="collapseTitle">פרמטרים נוספים</div>
										</div>
									</a>
									<Collapse isOpened={this.props.extraData.fourthCollapseOpened}>
										<div className="row CollapseContent nomargin">
											<div className="col-lg-4">
												<div className="row form-group">
													<label htmlFor="inputChosenStatus" className="col-sm-2 control-label">עדה</label>
													<div className="col-sm-7">
														<Combo items={this.props.extraData.ethnicGroups}
															disabled={editModeDisabled}
															maxDisplayItems={10} itemIdProperty="id"
															itemDisplayProperty='name' value={this.props.extraData.selectedEthnicGroup.value} onChange={this.comboItemChange.bind(this, 'selectedEthnicGroup')} />
													</div>
												</div>
											</div>
											<div className="col-lg-4">
												<div className="row form-group">
													<label htmlFor="inputChosenStatus" className="col-sm-2 control-label">זרם</label>
													<div className="col-sm-7">
														<Combo items={this.props.extraData.religiousGroups}
															disabled={editModeDisabled}
															maxDisplayItems={10} itemIdProperty="id"
															itemDisplayProperty='name' value={this.props.extraData.selectedReligiousGroup.value} onChange={this.comboItemChange.bind(this, 'selectedReligiousGroup')} />
													</div>
												</div>
											</div>
											<div className="col-lg-4">
												<div className="row form-group">
													<label htmlFor="inputNoStatus" className="col-sm-2 control-label">מגדר</label>
													<div className="col-sm-7">
														<Combo items={[{ id: 1, name: 'זכר' }, { id: 2, name: 'נקבה' }]}
															disabled={editModeDisabled}
															maxDisplayItems={10} itemIdProperty="id"
															itemDisplayProperty='name' value={this.props.extraData.selectedGender.value} onChange={this.comboItemChange.bind(this, 'selectedGender')} />
													</div>
												</div>
											</div>
										</div>
										{this.renderConflictWarning(['ethnic_group_id', 'gender', 'religious_group_id'])}

									</Collapse>
								</div>

								{/*end fourth collapse*/}

							</div>
						</div>
					</div>
				</div>
				<BottomButtons errorText={''} isDisabled={isContinueBtnDisabled}
					btnClick={this.continueToLastStage.bind(this)} backClick={this.backToSecondStage.bind(this)} />

			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		comboValuesList: state.elections.importScreen.dataDefinition.comboValuesList,
		fileData: state.elections.importScreen.dataDefinition.fileData,
		extraData: state.elections.importScreen.extraData,
		supportStatuses: state.elections.importScreen.extraData.supportStatuses,
		instituteRoles: state.elections.importScreen.extraData.instituteRoles,
		currentUser: state.system.currentUser,
		lastStepScreen: state.elections.importScreen.lastStepScreen,
	}
}

export default connect(mapStateToProps)(withRouter(ThirdStepExtraData));