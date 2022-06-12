import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import SearchActivistModal from '../../common/SearchActivistModal';


class TopFirstSearch extends React.Component {

	constructor(props) {
		super(props);
		this.roleNameStyle = {
			position: 'relative',
			height: '0',
			bottom: '3px'
		}
	}

	componentWillMount() {
		this.setState({ showDisplayCaptainFiftyVoterSearchModal: false });
		this.setState({ filteredCities: [] });
		this.setState({ filteredAreasList: [] });
		this.setState({ clusters: [] });
		this.setState({ ballotBoxes: [] });
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.currentUser && nextProps.currentUserGeographicalFilteredLists.cities.length > 0 && nextProps.currentUserGeographicalFilteredLists.areas.length > 0) {
			if (!this.state.loadedAreasAndCities) {
				this.setState({ loadedAreasAndCities: true });
				this.setState({ filteredCities: nextProps.currentUserGeographicalFilteredLists.cities });
				this.setState({ filteredAreasList: nextProps.currentUserGeographicalFilteredLists.areas });
			}
		}

		if (nextProps.searchScreen && nextProps.searchScreen.clusters.length > 0) {
			this.setState({ clusters: nextProps.searchScreen.clusters });
		}
		else {
			if (this.state.searchScreen && this.state.searchScreen.clusters.length > 0) {
				this.setState({ clusters: [] });
			}
		}

		if (nextProps.searchScreen && nextProps.searchScreen.ballotBoxes.length > 0) {
			this.setState({ ballotBoxes: nextProps.searchScreen.ballotBoxes });
		}
		else {
			if (this.state.searchScreen && this.state.searchScreen.ballotBoxes.length > 0) {
				this.setState({ ballotBoxes: [] });
			}
		}
	}


	/*
	empty function that does nothing - to radio buttons onChange events
	*/
	doNOP(e) {


	}

	/*
	   Open modal window for searching captain of fifty voter :
	*/
	showSearchCaptainModalDialog(isMinisterOfFiftyModal) {

		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'showMinisterOfFiftySearchModal', fieldValue: isMinisterOfFiftyModal });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'showDisplayCaptainFiftyVoterSearchModal', fieldValue: true });

	}

	/*
	    Init dynamic variables and components for render function  
	*/
	initDynamicVariables() {
		this.isValidatedForm = true;
		for (let key in this.props.validatorsObject) {
			this.isValidatedForm = this.isValidatedForm && this.props.validatorsObject[key];
		}
	}

	/*
	Handles clicking radio buttons and switching between them
	*/
	setSelectedRadioButtonFilteredOption(isMinisterOfFiftySelected) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE,
			 fieldName: 'filterByMinisterOfFifty', fieldValue: isMinisterOfFiftySelected });
	}

	/*
	handle getting report data and displaying it :
	*/
	showReportsData(searchByCapFifty) { // otherwise search by clusters
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE,
			 fieldName: 'orderByCap50', fieldValue: searchByCapFifty });
		let regular_search_filters = {};
		let searchScreen = this.props.searchScreen;
		if (searchScreen.selectedArea.selectedItem) {
			regular_search_filters.area_key = searchScreen.selectedArea.selectedItem.key;
		}
		if (searchScreen.selectedCity.selectedItem) {
			regular_search_filters.city_key = searchScreen.selectedCity.selectedItem.key;
		}
		if (searchScreen.selectedNeighborhood.selectedItem) {
			regular_search_filters.neighborhood_key = searchScreen.selectedNeighborhood.selectedItem.key;
		}
		if (searchScreen.selectedCluster.selectedItem) {
			regular_search_filters.cluster_key = searchScreen.selectedCluster.selectedItem.key;
		}
		if (searchScreen.selectedBallotBox.selectedItem) {
			regular_search_filters.ballot_box = searchScreen.selectedBallotBox.selectedItem.id;
		}
		regular_search_filters.voters_vote_status = searchScreen.selectedIsVoted.selectedItem.id;
		regular_search_filters.voter_type = null;
		regular_search_filters.voter_personal_identity = null;
		if (this.props.searchScreen.filterByMinisterOfFifty) {
			if (searchScreen.ministerID != '') {
				regular_search_filters.voter_type = 1;
				regular_search_filters.voter_personal_identity = searchScreen.ministerID;
			}
		}
		else {
			if (searchScreen.clusterLeaderID != '') {
				regular_search_filters.voter_type = 0;
				regular_search_filters.voter_personal_identity = searchScreen.clusterLeaderID;
			}
		}
		regular_search_filters.order_by_captain_fifties = (searchByCapFifty ? '1' : '0');
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.RESET_PAGINATION_DATA});
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'regularFiltersSearchQuery', fieldValue: regular_search_filters });
		ElectionsActions.loadElectionDayWalkerReportResults(this.props.dispatch, regular_search_filters, 0);

	}
	cleanAllFileds() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CLEAN_ALL_FILEDS });
	}



	render() {

		this.initDynamicVariables();
		let filterByMinisterOfFiftyStyle = this.props.searchScreen.filterByMinisterOfFifty ? { color: '#2ab4c0' } : {};
		let notFilterByMinisterOfFiftyStyle = !this.props.searchScreen.filterByMinisterOfFifty ? { color: '#2ab4c0' } : {};
		return (
			<div className="containerTabs first-box-on-page" style={{ marginTop: '15px' }}>
				{this.props.searchScreen.showDisplayCaptainFiftyVoterSearchModal ? <SearchActivistModal windowTitle={this.props.searchScreen.showMinisterOfFiftySearchModal ? 'איתור שר מאה' : 'איתור ראש אשכול'} searchScreen={this.props.searchScreen} modalName='electionDay' setRowSelected={this.setRowSelected.bind(this)} closeSearchCaptainModalDialog={this.closeSearchCaptainModalDialog.bind(this)} searchActivistModalFieldComboValueChange={this.searchActivistModalFieldComboValueChange.bind(this)} searchActivistModalFieldTextValueChange={this.searchActivistModalFieldTextValueChange.bind(this)} searchActivistModalUnmount={this.searchActivistModalUnmount.bind(this)} doSearchActivist={this.doSearchActivist.bind(this)}
					setParentScreenActivistData={this.setParentScreenActivistData.bind(this)} /> : null}
				<ul className="nav nav-tabs tabsRow" role="tablist">
					<li className="active" role="presentation">
						<a title="נתונים למערכת הבחירות ברשויות" href="#Tab1" data-toggle="tab">
							צור דו"ח חדש
                            </a>
					</li>
				</ul>
				<div className="tab-content tabContnt">
					<div role="tabpanel" className="tab-pane active" id="Tab1">
						<div className="containerStrip">
							<table width="100%">
								<tbody>
									<tr>
										<td width="20%">
											<label className="control-label">אזור</label>
											<div className="row"><div className="col-md-11"><Combo items={this.state.filteredAreasList} placeholder="בחר אזור" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedArea.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedArea')} inputStyle={{ borderColor: (this.props.validatorsObject.validatedArea ? '#ccc' : '#ff0000') }} /></div></div>
										</td>
										<td width="20%">
											<label className="control-label">עיר</label>
											<div className="row"><div className="col-md-11"><Combo items={this.state.filteredCities} placeholder="בחר עיר" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedCity.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedCity')} inputStyle={{ borderColor: (this.props.validatorsObject.validatedCity && this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000') }} /></div></div>
										</td>
										<td width="20%">
											<label className="control-label">אזור מיוחד</label>
											<div className="row"><div className="col-md-11"><Combo items={this.props.searchScreen.neighborhoods} placeholder="בחר אזור מיוחד" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedNeighborhood.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedNeighborhood')} inputStyle={{ borderColor: (this.props.validatorsObject.validatedNeighborhood ? '#ccc' : '#ff0000') }} /></div></div>
										</td>
										<td width="20%">
											<label className="control-label">אשכול</label>
											<div className="row"><div className="col-md-11"><Combo items={this.state.filteredClusters || this.state.clusters} placeholder="בחר אשכול" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.searchScreen.selectedCluster.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedCluster')} inputStyle={{ borderColor: (this.props.validatorsObject.validatedCluster ? '#ccc' : '#ff0000') }} /></div></div>
										</td>
										<td width="20%">
											<label className="control-label">קלפי</label>
											<div className="row"><div className="col-md-12"><Combo items={this.state.filteredBallotBoxes || this.state.ballotBoxes} placeholder="בחר אשכול" maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='mi_id' value={this.props.searchScreen.selectedBallotBox.selectedValue} onChange={this.searchFieldComboValueChange.bind(this, 'selectedBallotBox')} inputStyle={{ borderColor: (this.props.validatorsObject.validatedBallotBox ? '#ccc' : '#ff0000') }} /></div></div>
										</td>
									</tr>
									<tr><td colSpan="5" style={{ height: '15px' }}></td></tr>
									<tr>

										<td width="20%">
											<label className="control-label">הצביע</label>
											<div className="row"><div className="col-md-11"><Combo items={[{ id: -1, name: 'הכל' }, { id: 1, name: 'כן' }, { id: 0, name: 'לא' }]} value={this.props.searchScreen.selectedIsVoted.selectedValue} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' onChange={this.searchFieldComboValueChange.bind(this, 'selectedIsVoted')} inputStyle={{ borderColor: (this.props.validatorsObject.validatedIsVoted ? '#ccc' : '#ff0000') }} /></div></div>
										</td>
										<td>
											<div className="col-md-12">
												<input type="radio" name="searchType"
													checked={this.props.searchScreen.filterByMinisterOfFifty}
													onChange={this.doNOP.bind(this)} onClick={this.setSelectedRadioButtonFilteredOption.bind(this, true)} />
												&nbsp;&nbsp;<label style={filterByMinisterOfFiftyStyle} className="control-label">שר מאה</label>
											</div>
											<div className="row">
												<div className="col-md-11" style={{ paddingLeft: '0px' }}>
													<input type="text" className="form-control" maxLength="9" onChange={this.searchFieldComboValueChange.bind(this, 'ministerID')}
													style={{width: '95%', borderColor: ( this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000') }}
													 value={this.props.searchScreen.ministerID} onKeyPress={this.handleKeyPress.bind(this, true)}   />
												</div>
												<div className="col-md-1 no-padding">
													<a className="search-icon blue" title="חפש" onClick={this.showSearchCaptainModalDialog.bind(this, true)} style={{ cursor: 'pointer', position: 'relative', left: '40px' }}> </a>
												</div>
												<div className="col-md-12 text-success" style={this.roleNameStyle}>
													{this.props.searchScreen.ministerFirstName + ' ' + this.props.searchScreen.ministerLastName}
												</div>
											</div>
										</td>
										<td>
										<div className="row">
												<div className="col-md-12">
													<input type="radio" name="searchType"
														checked={!this.props.searchScreen.filterByMinisterOfFifty}
														onChange={this.doNOP.bind(this)}
														onClick={this.setSelectedRadioButtonFilteredOption.bind(this, false)} />&nbsp;&nbsp;
												 <label style={notFilterByMinisterOfFiftyStyle} className="control-label">ראש אשכול</label>
												</div>
												<div className="col-md-11 no-padding" style={{ paddingLeft: '0px' }}>
													<input type="text" className="form-control" maxLength="9" onChange={this.searchFieldComboValueChange.bind(this, 'clusterLeaderID')}
													style={{width: '95%', borderColor: ( this.props.validatorsObject.validatedMinimumSearch ? '#ccc' : '#ff0000') }}
													 value={this.props.searchScreen.clusterLeaderID} onKeyPress={this.handleKeyPress.bind(this, false)} />
													
												</div>
												<div className="col-md-1 no-padding">
													<a className="search-icon blue" title="חפש" onClick={this.showSearchCaptainModalDialog.bind(this, false)} style={{ cursor: 'pointer', position: 'relative', left: '40px' }}> </a>
												</div>
												<div className="col-md-12 text-success" style={this.roleNameStyle}>
													{this.props.searchScreen.clusterLeaderFirstName + ' ' + this.props.searchScreen.clusterLeaderLastName}
												</div>
											</div>
										</td>

										<td colSpan="2">
											<div className="row" >
												<div className="col-md-2" style={{ top: '25px' }}>
													<a className="text-danger" onClick={this.cleanAllFileds.bind(this)} style={{ color: 'red', 'cursor': 'pointer' }}>נקה שדות</a>
												</div>
												<div className="col-md-5 text-center no-padding" style={{ paddingLeft: '5px', paddingTop: '15px' }}>
													<button title="הצג" type="submit" className="btn btn-primary srchBtn" style={{ padding: '6px 10px', 'width': '91%', borderColor: 'transparent' }} disabled={this.props.loadingSearchResults || !this.isValidatedForm || this.props.searchScreen.clustersButtonDisabled} onClick={this.showReportsData.bind(this, false)} >הצג לפי קלפיות</button>
												</div>
												<div className="col-md-5 text-center no-padding" style={{ paddingTop: '15px' }} >
													<button title="הצג" type="submit" className="btn btn-primary srchBtn" style={{ padding: '6px 10px', 'width': '91%', borderColor: 'transparent' }} disabled={this.props.loadingSearchResults || !this.isValidatedForm || this.props.searchScreen.caps50ButtonDisabled} onClick={this.showReportsData.bind(this, true)} >הצג לפי שרי מאה</button>
												</div>
											</div>
										</td>
									</tr>
								</tbody>
							</table>

						</div>
					</div>
				</div>
			</div>
		);
	}



	/*handle key press "enter" at personal identity field */
	handleKeyPress(isMinisterOfFiftyModal, event) {
		if (event.charCode == 13) { /*if user pressed enter*/
			if ((isMinisterOfFiftyModal && this.props.searchScreen.ministerID != '') || (!isMinisterOfFiftyModal && this.props.searchScreen.clusterLeaderID != '')) {
				ElectionsActions.searchByCap50OrClusterLeaderIdentityNumber(this.props.dispatch, (isMinisterOfFiftyModal ? this.props.searchScreen.ministerID : this.props.searchScreen.clusterLeaderID), isMinisterOfFiftyModal);
			}
		}
	}


	/*
           Handles change in one of comboes 
    */
	searchFieldComboValueChange(fieldName, e) {

		if (['selectedArea', 'selectedCity', 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox', 'selectedIsVoted'].indexOf(fieldName) >= 0) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName, fieldValue: { selectedValue: e.target.value, selectedItem: e.target.selectedItem } });
		}
		else {
			if (fieldName == 'ministerID' || fieldName == 'clusterLeaderID') {

				if (!new RegExp('^[0-9]*$').test(e.target.value)) { return; } // allow only numbers in the field
				let isMinisterOfFiftySelected = fieldName == 'ministerID' ? true : false
				this.setSelectedRadioButtonFilteredOption(isMinisterOfFiftySelected);
				this.updateRoleFullName(isMinisterOfFiftySelected);
			}
			this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName, fieldValue: e.target.value });
		}
		// this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS , show:false});//hide search results on any change
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'clustersButtonDisabled', fieldValue: false });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'caps50ButtonDisabled', fieldValue: false });
		let self = this;
		switch (fieldName) {
			case 'selectedArea':
				let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return !e.target.selectedItem || city.area_id == e.target.selectedItem.id });
				this.setState({ filteredCities: newFilteredCities });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedCity', fieldValue: { selectedValue: '', selectedItem: null } });

				break;
			case 'selectedCity':

				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedNeighborhood', fieldValue: { selectedValue: '', selectedItem: null } });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedCluster', fieldValue: { selectedValue: '', selectedItem: null } });
				if (e.target.selectedItem) {
					if (!this.props.searchScreen.selectedArea.selectedItem) {
						for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.areas.length; i++) {
							if (this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id) {
								this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedArea', fieldValue: this.props.currentUserGeographicalFilteredLists.areas[i].name, fieldItem: this.props.currentUserGeographicalFilteredLists.areas[i] });
								break;
							}
						}
					}


					ElectionsActions.getClustersNeighborhoodsBallotsByCity(this.props.dispatch, e.target.selectedItem.key, 'electionDayWalkerReport');


				}
				else {
					this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'clusters', fieldValue: [] });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'neighborhoods', fieldValue: [] });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'ballotBoxes', fieldValue: [] });
				}
				break;
			case 'selectedNeighborhood':
				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedCluster', fieldValue: { selectedValue: '', selectedItem: null } });
				if (e.target.selectedItem) {
					let filteredCluster = this.props.searchScreen.clusters.filter(function (cluster) {
						return cluster.neighborhood_id == e.target.selectedItem.id;
					});
					this.setState({ filteredClusters: filteredCluster });

					let filteredBallotBoxes = this.props.searchScreen.ballotBoxes.filter(function (ballotBox) {
						return ballotBox.neighborhood_id == e.target.selectedItem.id;
					});
					this.setState({ filteredBallotBoxes: filteredBallotBoxes });

				}
				else {
					this.setState({ filteredClusters: null });
					this.setState({ filteredBallotBoxes: null });
				}
				break;
			case 'selectedCluster':
				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedBallotBox', fieldValue: { selectedValue: '', selectedItem: null } });
				if (e.target.selectedItem) {

					let filteredBallotBoxes = this.props.searchScreen.ballotBoxes.filter(function (ballotBox) {
						return ballotBox.cluster_id == e.target.selectedItem.id;
					});
					this.setState({ filteredBallotBoxes: filteredBallotBoxes });

				}
				else {
					this.setState({ filteredClusters: null });
					this.setState({ filteredBallotBoxes: null });
				}
				break;

			default:
				break;
		}

	}


	///here come the functions inside search activist modal : ///////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/*
Find activist modal window -   set specific row in search-results as selected , and others unselected
*/
	setRowSelected(rowIndex) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.SET_VOTER_SEARCH_RESULT_ROW_SELECTED, rowIndex });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'clustersButtonDisabled', fieldValue: false });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'caps50ButtonDisabled', fieldValue: false });
	}

	/*
	 Find activist modal window -   Close modal window for searching captain of fifty voter :
	*/
	closeSearchCaptainModalDialog() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'showDisplayCaptainFiftyVoterSearchModal', fieldValue: false });
	}

	/*
	   Find activist modal window -  Handles changes in one of combo-fields
	*/
	searchActivistModalFieldComboValueChange(fieldName, e) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE, fieldName, fieldValue: { selectedValue: e.target.value, selectedItem: e.target.selectedItem } });
		if (fieldName == 'selectedCity') {
			if (e.target.selectedItem) {
				ElectionsActions.getClustersOnlyByCity(this.props.dispatch, e.target.selectedItem.key,'electionDay');
			}
			else {
				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE, fieldName: 'clusters', fieldValue: [] });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE, fieldName: 'selectedCluster', fieldValue: { selectedValue: '', selectedItem: null } });
			}
		}
	}

	/*
	Find activist modal window - Handles changing value in text fields
	*/
	searchActivistModalFieldTextValueChange(fieldName, e) {
		if (fieldName == 'ministerID') {
			if (!new RegExp('^[0-9]*$').test(e.target.value)) { return; } // allow only numbers in the field
		}
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE, fieldName, fieldValue: e.target.value });
	}

	searchActivistModalUnmount() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CLEAN_SEARCH_CAPTAIN50_VOTER_MODAL_FIELDS });
	}


	/*
	Find activist modal window -   Function that searches for voter by params
	*/
	doSearchActivist() {
		let params = {
		};
		if (this.props.searchCaptainFiftyVoterModal.selectedCity.selectedItem) {
			params.city_key = this.props.searchCaptainFiftyVoterModal.selectedCity.selectedItem.key;
		}
		if (this.props.searchCaptainFiftyVoterModal.selectedCluster.selectedItem) {
			params.cluster_key = this.props.searchCaptainFiftyVoterModal.selectedCluster.selectedItem.key;
		}
		if (this.props.searchCaptainFiftyVoterModal.ministerID != '') {
			params.personal_identity = this.props.searchCaptainFiftyVoterModal.ministerID;
		}
		if (this.props.searchCaptainFiftyVoterModal.ministerFirstName.trim() != '') {
			params.first_name = this.props.searchCaptainFiftyVoterModal.ministerFirstName;
		}
		if (this.props.searchCaptainFiftyVoterModal.ministerLastName.trim() != '') {
			params.last_name = this.props.searchCaptainFiftyVoterModal.ministerLastName;
		}
		params.search_type = (this.props.searchScreen.showMinisterOfFiftySearchModal ? '1' : '0');
		ElectionsActions.searchByCap50OrClusterLeaderByParams(this.props.dispatch, params);

	}

    /*
	Find activist modal window -  function that passes selected found voter captain of fifty into parent screen and closes this modal window
	*/
	setParentScreenActivistData(rowIndex) {
		let isMinisterOfFiftySelected = this.props.searchScreen.showMinisterOfFiftySearchModal ? true : false
		this.setSelectedRadioButtonFilteredOption(isMinisterOfFiftySelected);
		let selectedRoleData = this.props.searchCaptainFiftyVoterModal.foundVoters[rowIndex]
		this.updateRoleFullName(isMinisterOfFiftySelected, selectedRoleData)
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE,
			 fieldName: (this.props.searchScreen.showMinisterOfFiftySearchModal ? 'ministerID' : 'clusterLeaderID'), fieldValue: selectedRoleData.personal_identity });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE,
			 fieldName: 'showDisplayCaptainFiftyVoterSearchModal', fieldValue: false });
	}
	updateRoleFullName(isMinisterOfFiftySelected, selectedRoleData = null){
		let first_name = '';
		let last_name = '';
		if (selectedRoleData) {
			first_name = selectedRoleData.first_name;
			last_name = selectedRoleData.last_name;
		}
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE,
			fieldName: (isMinisterOfFiftySelected ? 'ministerFirstName' : 'clusterLeaderFirstName'), fieldValue: first_name
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE,
			fieldName: (isMinisterOfFiftySelected ? 'ministerLastName' : 'clusterLeaderLastName'), fieldValue: last_name
		});
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		searchScreen: state.elections.reportsScreen.electionDayWalkerReport.searchScreen,
		loadingSearchResults: state.elections.reportsScreen.electionDayWalkerReport.loadingSearchResults,
		searchCaptainFiftyVoterModal: state.elections.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal,
	}
}

export default connect(mapStateToProps)(withRouter(TopFirstSearch));