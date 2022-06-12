import React from 'react';
import { Link, withRouter } from 'react-router';
import { connect } from 'react-redux';

import Combo from '../../../global/Combo';
import ModalWindow from '../../../global/ModalWindow';
import VoterRow from './VoterRow';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';

class AddVoterSource extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}

	componentWillMount() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_CLEAN_DATA }); //clean previous search results
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.CLEAN_SEARCH_VOTER_STATE_FIELDS }); //clean search fields		 
	}

	/*
	 Init all labels and constant headers : 
	*/
	initConstants() {
		this.modalHeader = "חפש תושב";
		this.tableHeaders = {
			family: "משפחה"
		};
		this.renderListTitle();
	}

    /*
	 Close search voter modal window: 
	*/
	closeModalDialog() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.HIDE_VOTER_SOURCE_MODAL_DIALOG });
	}

	/*
	  selection of specific voter row - by double click or single click+pressing button "continue"  
	*/
	selectVoterSource() {
		let selectedRow = this.props.searchVoterScreen.selectedVoterIndex;
		if (selectedRow == -1) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_SET_BOTTOM_ERROR, newText: 'יש לבחור תושב אחד מהרשימה' });
		}
		else {
			if (this.props.bottomErrorText != '') {
				this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_SET_BOTTOM_ERROR, newText: '' });
			}
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.SET_VOTER_ROW_SELECTED, selectedVoter: this.props.searchVoterResult[selectedRow] });
		}
	}

	/*
	   handel "enter" keypress inside textbox as clicking search button
	*/
	handleKeyPress(event) { //handel "enter" keypress as clicking search button
		if (event.charCode == 13) { /*if user pressed enter*/
			this.doSearchAction();
		}
	}

	/*
	The core function that performs the really search voter action : 
	*/
	doSearchAction() {
		if (this.props.searchVoterScreen.firstName.split(' ').join('').length >= 2 && this.props.searchVoterScreen.lastName.split(' ').join('').length >= 2) { //check that minimum 2 characters for search
			let max_number_of_rows = 20;
			let searchParams = {};
			searchParams.first_name = this.props.searchVoterScreen.firstName;
			searchParams.last_name = this.props.searchVoterScreen.lastName;
			searchParams.clean = '1'; //get partial results
			if (this.props.searchVoterScreen.selectedCity) {
				let cityList = [{ 'id': this.props.searchVoterScreen.selectedCity.id }];
				cityList = JSON.stringify(cityList);
				searchParams.city = cityList;
			}

			if (this.props.searchVoterScreen.selectedStreet) {
				searchParams.street = JSON.stringify({ 'key': this.props.searchVoterScreen.selectedStreet.key, 'name': this.props.searchVoterScreen.selectedStreet.name });
			}
			searchParams['max_number_of_rows'] = max_number_of_rows;
			ElectionsActions.getVoterByParams(this.props.dispatch, searchParams);
		}
	}

	/*
	function that handles search button click
	*/
	searchButtonClick() {
		this.doSearchAction();
	}

	/*
	   function that get field name in search screen , and changes the state , so the correct textfield will update
	*/
	searchFieldValueChange(fieldName, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_FIELD_CHANGE, fieldName, fieldValue: e.target.value });

		// load streets for cities : 
		if (fieldName == 'city') {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_FIELD_CHANGE, fieldName: 'selectedCity', fieldValue: e.target.selectedItem });
			if (e.target.selectedItem) { //check if valid city choosed
				SystemActions.loadStreets(this.props.dispatch, e.target.selectedItem.key);
			}
			else { //else set city list empty

				SystemActions.loadStreets(this.props.dispatch);
			}
		}
		else if (fieldName = 'street') {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_FIELD_CHANGE, fieldName: 'selectedStreet', fieldValue: e.target.selectedItem });
		}
	}

    /*
	 function that renders search result header : 
	*/
	renderListTitle() {
		return this.searchVoterResultHeader =
			<thead >
				<tr>
					<th>מספר</th>
					<th>שם משפחה</th>
					<th>שם פרטי</th>
					<th>עיר</th>
					<th>רחוב</th>
				</tr>
			</thead>;
	}

	/*
	function that on single voter-row click set it selected
	*/
	setRowSelected(index, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_SET_ROW_SELECTED, selectedRowIdx: index });
	}

	/*
	function that on render dynamicly renders rows of search results
	*/
	renderListRows() {
		this.scrollTRlist = this.props.searchVoterResult.map((voter, i) => {
			let className = voter.isSelected ? "success request-select-row" : "";

			return <VoterRow id={i} key={i} className={className}
				personalIdentity={voter.personalIdentity}
				firstName={voter.firstName}
				lastName={voter.lastName}
				cityName={voter.cityName}
				street={voter.street}
				rowClickDelegate={this.setRowSelected.bind(this, i)}
				rowDblClickDelegate={this.selectVoterSource.bind(this)}
			/>
		});

		return this.searchVoterResultRows =
			<tbody style={{ height: '100px' }}>{this.scrollTRlist}
				<tr style={{ display: (this.props.searchVoterLoading) ? '' : 'none' }}>
					<td colSpan="5" style={{ textAlign: 'center' }}>
						<div className={"fa fa-spinner fa-spin pull-right" + (this.props.searchVoterLoading ? '' : ' hidden')}>
						</div>     טוען  ...
					</td>
				</tr>
			</tbody>;
	}

	/*
	   This function will create dynamicly components according to state : 
	*/
	generateDynamicItems() {
		this.searchButtonDisabled = this.props.searchVoterScreen.firstName.split(' ').join('').length < 2 || this.props.searchVoterScreen.lastName.split(' ').join('').length < 2 /*both first name and last name must have minimum 2 chars*/
	}

	render() {
		this.generateDynamicItems();
		this.renderListRows();
		return (
			<ModalWindow show={this.props.showVoterSourceModalDialog}
				buttonOk={this.selectVoterSource.bind(this)}
				buttonCancel={this.closeModalDialog.bind(this)}
				buttonX={this.closeModalDialog.bind(this)}
				overlayClick={this.closeModalDialog.bind(this)}
				title={this.modalHeader} style={{ zIndex: '9001' }}>

				<div className="row containerStrip">
					<div className="col-lg-5">
						<div className="row form-group">
							<label htmlFor="inputModalFamily" className="col-lg-3 control-label">משפחה</label>
							<div className="col-sm-9">
								<input type="text" className="form-control" id="inputModalFamily" value={this.props.searchVoterScreen.lastName} onChange={this.searchFieldValueChange.bind(this, 'lastName')} onKeyPress={this.handleKeyPress.bind(this)} />
							</div>
						</div>
						<div className="row form-group">
							<label htmlFor="inputModalName" className="col-lg-3 control-label">שם פרטי</label>
							<div className="col-sm-9">
								<input type="text" className="form-control" id="inputModalName" value={this.props.searchVoterScreen.firstName} onChange={this.searchFieldValueChange.bind(this, 'firstName')} onKeyPress={this.handleKeyPress.bind(this)} />
							</div>

						</div>
						<div>
							<span style={{ color: '#ff0000' }}><i>יש לחפש לפחות לפי שם ושם משפחה</i></span>
						</div>
					</div>
					<div className="col-lg-5">
						<div className="row form-group">
							<label htmlFor="inputModalCity" className="col-lg-3 control-label">עיר</label>
							<div className="col-sm-9">
								<Combo items={this.props.cities} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchVoterScreen.city} onChange={this.searchFieldValueChange.bind(this, 'city')} />
							</div>
						</div>
						<div className="row form-group">
							<label htmlFor="inputModalStreet" className="col-lg-3 control-label">רחוב</label>
							<div className="col-sm-9">
								<Combo items={this.props.streets} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.street} onChange={this.searchFieldValueChange.bind(this, 'street')} />
							</div>
						</div>
					</div>
					<div className="col-lg-2">
						<button type="button" className="btn btn-primary pull-right" onClick={this.searchButtonClick.bind(this)} disabled={this.searchButtonDisabled}>חפש</button>
					</div>
				</div>
				<div className="row containerStrip">
					<div className="col-sm-12 rsltsTitle">
						<h3 className="noBgTitle">נמצאו <span className="rsltsCounter">{this.props.searchVoterResult.length}</span> רשומות</h3>
					</div>
				</div>
				<div className="row">
					<div className="col-sm-12">
						<div id="scrollContainer" className="table-responsive">

							<table className="table table-striped tableNoMarginB table-hover tableTight csvTable table-scrollable" style={{ height: '100px' }} >
								{this.searchVoterResultHeader}
								{this.searchVoterResultRows}
							</table>
							<span style={{ color: '#ff0000' }}>{this.props.bottomErrorText}</span>
						</div>
					</div>
				</div>
			</ModalWindow>
		);
	}
}

function mapStateToProps(state) {
	return {
		searchVoterScreen: state.elections.importScreen.searchVoterScreen,
		cities: state.system.cities,
		streets: state.system.lists.streets,
		votersSources: state.elections.importScreen.votersSources,
		showVoterSourceModalDialog: state.elections.importScreen.showVoterSourceModalDialog,
		searchVoterResult: state.elections.importScreen.searchVoterScreen.searchVoterResult,
		searchVoterLoading: state.elections.importScreen.searchVoterScreen.searchVoterLoading,
		bottomErrorText: state.elections.importScreen.searchVoterScreen.bottomErrorText,
	}
}

export default connect(mapStateToProps)(withRouter(AddVoterSource));