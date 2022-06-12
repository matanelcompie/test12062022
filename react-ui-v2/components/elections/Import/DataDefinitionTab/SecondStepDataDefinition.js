import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Combo from '../../../global/Combo';
import BottomButtons from '../BottomButtons';
import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import importCsvFieldsOptions from 'libs/importCsvFieldsOptions';
import constants from 'libs/constants';

class SecondStepDataDefinition extends React.Component {

	componentWillMount() {
		
		this.cleanAllStagesData();
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: "קובץ: " + this.props.fileData.fileName });
	}

	/*
	function that will clean all state data needed : 
	*/
	cleanAllStagesData() {
		if(!this.props.lastStepScreen.currentProcessedDataState.csvFileStatus){
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_THIRD_STAGE });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_FOURTH_STAGE });
		}
	}

	/*
	   function that handles change in value of one of comboes : 
	   @param comboIndex - the changed combo index
	   @param e - action event
	*/
	comboValueChange(comboIndex, e) {
		let selectedIndex = (e.target.selectedItem == null ? -1 : e.target.selectedItem.id);
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.COMBO_VALUE_CHANGE, comboIndex, comboValue: e.target.value, selectedIndex });
	}

	/*
	   function that inits header comboes in redner() function
	*/
	initComboes() {
		this.comboesList = [];
		let selectedOptions=[];
		this.props.dataDefinitionTab.comboValuesList.map(item=>{
			if(item.id > -1){
				selectedOptions.push(item.id);
			}
		});
 
		for (let i = 0; i < this.props.dataDefinitionTab.fileData.numberOfCols; i++) {
			let options=importCsvFieldsOptions.filter((option,index)=>{
				return ((selectedOptions.indexOf(option.id)==-1) || (option.id ==this.props.dataDefinitionTab.comboValuesList[i].id));
			});
			this.comboesList.push(<th id={i} key={i} width='150px'>
				<Combo items={options} className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name'
				disabled={(this.props.lastStepScreen.currentProcessedDataState.csvFileStatus > 0)}
				value={this.props.dataDefinitionTab.comboValuesList[i].name} onChange={this.comboValueChange.bind(this, i)} />
				</th>);
		}

	}

	/*
	  function that handles checkbox changes  : 
	  @param fieldName - checkbox name in state
	  @param e - event reference
	*/
	checkboxChanged(fieldName, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.IS_FILE_CHECKBOX_CHANGE, fieldName, fieldValue: (e.target.checked ? 1 : 0) });
	}

	/*
	   function that handles 'back' button and sets correct tab name , and therefore goes back :
	*/
	backToFirstStage() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB, tabName: 'loadData' });
		// this.props.router.push('elections/imports/new');
	}

	/*
	   function that handles 'countinue' button and sends data in this stage to Actions,
	   in final of that axious function it goes to next stage : 
	*/
	continueToThirdStage() {
				
		if(!this.props.lastStepScreen.currentProcessedDataState.csvFileStatus){ //process didn't start :
			let newArray = [];
			// construct correct array of choosed columns
			for (let i = 0; i < this.props.comboValuesList.length; i++) {
				if (this.props.comboValuesList[i].id >= 0) {
					newArray.push({ column_number: i, column_name_identifier: this.props.comboValuesList[i].id });
				}
			}

			ElectionsActions.setFileCsvFields(this.props.dispatch, this.props.fileData.fileKey, this.props.isHeader,
			                              this.props.dataDefinitionTab.isHousholdUpdate,
			                              this.props.dataDefinitionTab.isDuplicatePhoneDelete,
			                              JSON.stringify(newArray), this.props.fileData.fileKey);
 
		}
		else{
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB, tabName: 'extraData' });
 
		}
	}

    /*
	function that defines the first rows array , to render in render() function : 
	*/
	initRowsList() {
		this.rowsList = [];
		for (let i = 0; i < this.props.dataDefinitionTab.fileData.firstRows.length; i++) {
			let colsList = [];
			for (let j = 0; j < this.props.dataDefinitionTab.fileData.firstRows[i].length; j++) {
				colsList.push(<td id={j} key={j}>{this.props.dataDefinitionTab.fileData.firstRows[i][j]}</td>);
			}

			if (i == 0) {//firset row
				this.rowsList.push(<tr className={'break-word' + ((this.props.isHeader == 1) ? '' : '')} style={{backgroundColor:(this.props.isHeader == 1 ? '#72a942' :'') , fontWeight:(this.props.isHeader == 1 ? 'bold' :'') , fontSize:(this.props.isHeader == 1 ? '20px' :'') }} id={i} key={i}>{colsList}</tr>);
			} else {
				this.rowsList.push(<tr id={i} key={i}>{colsList}</tr>);
			}

		}
	}

    /*
	function that defines dynamicly the items that will be in render() function
	*/
	initItems() {
		//set bottom error text :
		this.errorText = "";
		if (!this.props.isKeyOrIDColumnSelected) {
			this.errorText = '* בכדי להמשיך לשלב הבא יש לבחור לפחות עמודה אחת עם ת"ז';
		}
		this.householdUpdateItem = '';
		this.deleteDuplicatePhoneItem = '';

		if (this.props.dataDefinitionTab.isHouseholdUpdateItem) {
			this.householdUpdateItem = <div className="checkbox">
				<label>
					<input type="checkbox" checked={this.props.dataDefinitionTab.isHousholdUpdate == 1} onChange={this.checkboxChanged.bind(this, 'isHousholdUpdate')} />
					העתקת כתובת התושב לכל בית האב
					                    </label>
			</div>;
		}
		if (this.props.dataDefinitionTab.isDuplicatePhoneDeleteItem) {
			this.deleteDuplicatePhoneItem = <div className="checkbox">
				<label>
					<input type="checkbox" checked={this.props.dataDefinitionTab.isDuplicatePhoneDelete == 1} onChange={this.checkboxChanged.bind(this, 'isDuplicatePhoneDelete')} />
					מחיקת טלפונים כפולים
					                     </label>
			</div>;
		}
	}

	render() {
		let editModeDisabled = false;
		if(this.props.lastStepScreen.currentProcessedDataState.csvFileStatus > 0 ){
			editModeDisabled = true;
		}
		this.initComboes();
		this.initRowsList();
		this.initItems();
		return (
			<div>
				<div className="row contentContainer">
					<div className="col-lg-12">
						<div className="wizardStepDscrp">תצוגה מקדימה של העמודות בקובץ</div>
						<div className="checkbox">
							<label>
								<input type="checkbox" disabled={editModeDisabled} checked={this.props.isHeader == 1} onChange={this.checkboxChanged.bind(this, 'isHeader')} />
								הקובץ מכיל שורת כותרת
					</label>
						</div>
						{this.householdUpdateItem}
						{this.deleteDuplicatePhoneItem}
						<div style={{ overflowY: 'auto' }}>
							<table className="table table-bordered table-striped table-scrollable table-responsive">
								<thead>
									<tr>
										{this.comboesList}
									</tr>
								</thead>
								<tbody>
									{this.rowsList}
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<BottomButtons errorText={this.errorText} isDisabled={!this.props.isKeyOrIDColumnSelected} btnClick={this.continueToThirdStage.bind(this)} backClick={this.backToFirstStage.bind(this)} backButtonDisabled={this.props.lastStepScreen.currentProcessedDataState.csvFileStatus >= constants.csvParserStatus.atWork } />
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		dataDefinitionTab: state.elections.importScreen.dataDefinition,
		isKeyOrIDColumnSelected: state.elections.importScreen.dataDefinition.isKeyOrIDColumnSelected,
		comboValuesList: state.elections.importScreen.dataDefinition.comboValuesList,
		fileData: state.elections.importScreen.dataDefinition.fileData,
		isHeader: state.elections.importScreen.dataDefinition.isHeader,
		lastStepScreen: state.elections.importScreen.lastStepScreen,
		extraData: state.elections.importScreen.extraData,
	}
}

export default connect(mapStateToProps)(withRouter(SecondStepDataDefinition));