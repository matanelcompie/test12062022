import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Combo from '../../../global/Combo';
import AddVoterSource from './AddVoterSource';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as VoterActions from 'actions/VoterActions';

class ImportLoad extends React.Component {
	constructor(props) {
		super(props);
		this.initConstants();
		this.state = { csvFile: null };
	}

	componentWillMount() {
		if (this.props.router.params.csvFileKey == 'new') {
			this.cleanAllStagesData();
		} else {
			let fieldValue = this.props.csvSources.find(source => source.name == this.props.loadData.dataSource);
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_IMPORT_LOAD_FIELD_CHANGE, fieldName: 'selectedDataSource', fieldValue });
			this.searchForVoterByIdentity();

			if (this.props.importScreen.dataDefinition.fileData) {
				var csvFile = {};
				csvFile['name'] = this.props.importScreen.dataDefinition.fileData.fileName;
				csvFile['size'] = this.props.importScreen.dataDefinition.fileData.fileSize;
				this.setState({ csvFile });
			}
		}
	}

	/*
	function that cleans all stages state data : 
	*/
	cleanAllStagesData() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_FIRST_STAGE });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_SECOND_STAGE });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_THIRD_STAGE });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_FOURTH_STAGE });
	}

	/*
	   Init constant fields : 
	*/
	initConstants() {
		this.identityDigitsNum = 9;
		this.labels = {
			dataSource: "מקור הנתונים",
			voterSource: "ת.ז. מביא הנתונים"
		};

		this.searchIconImg = window.Laravel.baseURL + 'Images/ico-search-blue.svg';
		this.searchIconTitle = "חפש תושב";

		 
		ElectionsActions.getCsvSources(this.props.dispatch);
		 
		this.document_max_file_size_in_MB = 20; //Maximum 20 MB of csv file upload size
	}

	/*
	   Function that handles change in combo of data-source : 
	*/
	dataSourceChange(e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_IMPORT_LOAD_FIELD_CHANGE, fieldName: 'dataSource', fieldValue: e.target.value });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_IMPORT_LOAD_FIELD_CHANGE, fieldName: 'selectedDataSource', fieldValue: e.target.selectedItem });
	}

	/*
	   Function that handles selecting csv-file from input-file :
	*/
	fileWasSelected(e) {
		var file = null;

		if (e.target.files != undefined) {
			file = e.target.files[0];
			delete file.lastModifiedDate;
		}
		this.setState({ csvFile: file });
		// this.props.dispatch({type: ElectionsActions.ActionTypes.IMPORT.VOTER_IMPORT_LOAD_FIELD_CHANGE , fieldName:'csvFile' , fieldValue : file});
	}

	/*
	   Function that handles pressing "enter" in identity of voter field
	*/
	handleKeyPress(event) {
		if (event.charCode == 13) { /*if user pressed enter*/
			this.searchForVoterByIdentity(); //performing search of voter by identity
		}
	}

	/*
	   Function that searches voter by identity that is in identity text-box :
	*/
	searchForVoterByIdentity() {
		if (this.props.loadData.selectedVoterIdentity.split(' ').join('') != '') {
			let formattedIdentityNumber = this.convertIdentityTo9Digits(this.props.loadData.selectedVoterIdentity);
			let searchParams = {};
			searchParams.personal_identity = formattedIdentityNumber;
			searchParams.is_personal_identity_search = '1';
			searchParams.clean = '1'; //get partial results
			searchParams.other_fields = '1';
			ElectionsActions.getVoterByParams(this.props.dispatch, searchParams, 0, 0);
		}
	}

	/*
	   Function that converts short identity number to 9-digits identity with using zeros:
	*/
	convertIdentityTo9Digits(theIdentityNumber) {
		if (theIdentityNumber.length == this.identityDigitsNum) { return theIdentityNumber }
		else { //else - add correct number of zeros to complete to 9 digits.
			let currentStringLength = theIdentityNumber.length;
			let zeroString = '';
			for (let i = 0; i < this.identityDigitsNum - currentStringLength; i++) {
				zeroString += '0';
			}
			return (zeroString + theIdentityNumber);
		}

	}

	/*
	   Function that displays search-voter modal dialog : 
	*/
	showVoterSourceModal() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SHOW_VOTER_SOURCE_MODAL_DIALOG });
	}

	/*
	   Function that handles identity number changing in text-box : 
	*/
	changeIdentityNumber(e) {
		if (isNaN(e.target.value) || e.target.value == " ") { //numbers only , and not more than 9 digits
			this.props.dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_DATA });
			return;
		}
		else if (e.target.value.charAt(e.target.value.length - 1) == " ") {
			// if spacebar is pressed after number - do nothing and return.
			return;
		}
		else {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_IDENTITY_NUMBER_CHANGE, newValue: e.target.value });
		}
	}

	/*
	   Function that calls from action the function 
	   that uploads the file to server and saves it to database : 
	*/
	uploadFileToServer() {
		if (this.props.router.params.csvFileKey == 'new') {
			ElectionsActions.addCsvDocument(this.props.dispatch, this.props.router, this.state.csvFile, this.state.csvFile.name, this.props.loadData.selectedVoterKey, this.props.loadData.selectedDataSource.key);
		} else {
			ElectionsActions.updateCsvDocument(this.props.dispatch,this.props.router.params.csvFileKey, this.props.router, this.state.csvFile, this.state.csvFile.name, this.props.loadData.selectedVoterKey, this.props.loadData.selectedDataSource.key);
		}
	}

	/*
	   Function that validates all 3 inputes before the user can proceed; 
	*/
	validateInputs() {
		if (this.validateFields()) {
			this.validateFile();
		}
	}

	/*
	   Function that validates all only text field of identity 
	   and selected data source - without file validation :
	*/
	validateFields() {
		this.validatedDataSource = true;
		this.validatedIdentityNumber = true;
		this.validatedFile = true;
		if (this.props.loadData.selectedDataSource == null || this.props.loadData.selectedDataSource == undefined) {
			this.validatedDataSource  = false;
			//this.bottomErrorText = '* יש לבחור מקור נתונים';
		//	return false;
		}
		if (this.props.loadData.selectedVoterKey == '') {
			this.validatedIdentityNumber = false;
			//this.bottomErrorText = '* יש לבחור את ת.ז. מביא הנתונים';
		//	return false;
		}
		if (this.state.csvFile == null) {
			this.validatedFile = false;
			//this.bottomErrorText = '* יש לבחור קובץ';
			//return false;
		}
		else {
			//this.bottomErrorText = '';
			//return true;
		}
        return (this.validatedDataSource && this.validatedIdentityNumber && this.validatedFile );
	}

	/*
	   Function that only validates the file - format , size , etc. :
	*/
	validateFile() {
		if (null == this.state.csvFile || undefined == this.state.csvFile) {
			return false;
		}

		let documentTypes = [{ name: 'csv' }, { name: 'csvx' }];
		let fileName = this.state.csvFile.name;
		let fileSize = this.state.csvFile.size;
		let fileExtension = "";
		let arrOfFileElements = [];
		let extensionIndex = -1;
		//let document_max_file_size = this.props.document_max_file_size;

		arrOfFileElements = fileName.split('.');
		fileExtension = arrOfFileElements[1];

		// Checking if file size does not exceed
		// the maximum document file size

		if (fileSize > this.document_max_file_size_in_MB * 1000000) {
			this.bottomErrorText = "גודל קובץ חורג מהמקסימום" + "(" + this.document_max_file_size_in_MB + "MB)";
			return false;
		}


		// Checking if the file extension is an allowed document type
		extensionIndex = documentTypes.findIndex(typeItem => typeItem.name == fileExtension);
		if (-1 == extensionIndex) {
			this.bottomErrorText = "* סוג קובץ לא חוקי";
			return false;
		}
		else if (fileSize <= 0) {
			this.bottomErrorText = "* הקובץ לא יכול להיות ריק";
			return false;
		}
		else {
			this.bottomErrorText = "";
			return true;
		}
	}

	/*
	   This function will create dynamicly components according to state : 
	*/
	generateDynamicComponents() {
		if (this.props.showVoterSourceModalDialog) {
			this.addVoterSourceItem = <AddVoterSource />;
		}
		else {
			this.addVoterSourceItem = '';
		}
	}

	render() {
 
		this.validateInputs();
		this.generateDynamicComponents();

		return (
			<div className="row contentContainer">
				<div className="col-lg-7">
					<div className="wizardStepDscrp">נתוני בסיס לטעינת הקובץ</div>
				</div>

				<div className="col-lg-6">
					<form className="form-horizontal padding30">
						<div className="form-group">
							<label htmlFor="inputDataSource" className="col-sm-5 control-label">
								{this.labels.dataSource}
							</label>
							<div className="col-sm-6">
								<Combo items={this.props.csvSources}
									maxDisplayItems={10} itemIdProperty="id"
									itemDisplayProperty='name' value={this.props.loadData.dataSource} onChange={this.dataSourceChange.bind(this)} inputStyle={{borderColor:(this.validatedDataSource ? '#ccc':'#ff0000')}} />
							</div>
						</div>

						<div className="form-group" >
							<label htmlFor="inputSupplyrID" className="col-sm-5 control-label">
								{this.labels.voterSource}
							</label>
							<div className="col-sm-6">
								<input type="text" className="form-control"   value={this.props.loadData.selectedVoterIdentity} onChange={this.changeIdentityNumber.bind(this)} maxLength={this.identityDigitsNum} onKeyPress={this.handleKeyPress.bind(this)} style={{borderColor:(this.validatedIdentityNumber ? '#ccc':'#ff0000')}} />
								<span id="helpBlock" className="help-block supplyrName" style={{ fontSize: '16px', color: '#737373' }}>{this.props.loadData.selectedVoterSmallData}</span>
							</div>
							<div className="col-sm-1 srchIcon">
								<a title={this.searchIconTitle} onClick={this.showVoterSourceModal.bind(this)} style={{ cursor: 'pointer' }}>
									<img src={this.searchIconImg} />
								</a>
							</div>
						</div>

						<div className="form-group">
							<label className="col-sm-5">צרף קובץ</label>
							<div className="col-sm-5"><input className="form-control" type="text" style={{borderColor:(this.validatedFile ? '#ccc':'#ff0000')}} placeholder={this.state.csvFile ? this.state.csvFile.name : ''} disabled /></div>
							<label className="col-sm-1 upload-file-label cursor-pointer" htmlFor="uploadFile">עיון</label>
							<input className="hidden" type="file" id="uploadFile" accept=".csv" onChange={this.fileWasSelected.bind(this)} />
						</div>

					</form>
					<span style={{ color: '#ff0000', fontWeight: 'bold' }}><i>{this.bottomErrorText}</i></span>
					<button type="submit" className="btn btn-primary pull-left" disabled={this.bottomErrorText != ""}
						style={{ fontSize: '18px', backgroundColor: '#498BB6', paddingRight: '40px', paddingLeft: '40px' }}
						onClick={this.uploadFileToServer.bind(this)}>המשך</button>
				</div>

				{this.addVoterSourceItem}
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		csvSources: state.elections.importScreen.loadData.csvSources,
		showVoterSourceModalDialog: state.elections.importScreen.showVoterSourceModalDialog,
		importTab: state.elections.importScreen.importTab,
		loadData: state.elections.importScreen.loadData,
		searchVoterResult: state.elections.importScreen.searchVoterScreen.searchVoterResult,
		importScreen: state.elections.importScreen,
	}
}

export default connect(mapStateToProps)(withRouter(ImportLoad));