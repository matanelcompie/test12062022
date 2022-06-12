import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import CaptainFiftyRowItem from './CaptainFiftyRowItem';
import CaptainFiftyCityRowItem from './CaptainFiftyCityRowItem';
import CaptainFiftyRelatedVoterRowItem from './CaptainFiftyRelatedVoterRowItem';
import BallotBoxRowItem from './BallotBoxRowItem';
import BallotBoxRelatedVoterRowItem from './BallotBoxRelatedVoterRowItem';
import Pagination from '../../../../../components/global/Pagination';


class ReportSearchResults extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}

	/*
	   Init constant variables
	*/
	initConstants() {
		this.borderBottomStyle = { borderBottom: '1px solid #498BB6' };
	}

	/*
	Handles number of results per page field is changing
	*/
	numberOfResultsFieldChanging(e) {
		if (e.target.value == '0' || !new RegExp('^[0-9]*$').test(e.target.value)) { return; } // allow only numbers in the field
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'tempNumberOfResultsPerPage', fieldValue: e.target.value });
	}

	/*
	Update real number of items per page
	*/
	updateResultsPerPage(newValue) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'currentPage', fieldValue: 1 });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'numberOfResultsPerPage', fieldValue: newValue });
		this.getMoreVotersData(1);
	}

	/*
	   Handles print button click
	   
	   @format - print/pdf
	*/
	printResults(format) {
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
		regular_search_filters.order_by_captain_fifties = (this.props.searchScreen.orderByCap50 ? '1' : '0');

		let url = (window.Laravel.baseURL + 'api/elections/reports/walkers/election_day/export?') + 'regular_search_filters=' + JSON.stringify(regular_search_filters) + "&format=" + format;
		window.open(url, '_blank');
	}

   /**
    * @method navigateToPage
    * navigate to page handle function.
    * (this.getMoreVotersData() -> get more data for navigation)
    * @param {int} index - page to navigate.
    * @returns void
    */
	navigateToPage(index) {
		let limitRowsInServer = 100;
		let maxPage = Math.ceil((this.props.reportSearchResults.length + limitRowsInServer) / this.props.electionDayWalkerReport.numberOfResultsPerPage)
		if (index > maxPage) { index = maxPage; }
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_GLOBAL_REPORT_FIELD_VALUE, fieldName: 'currentPage', fieldValue: index });
		this.getMoreVotersData(index);
	}
	getMoreVotersData(pageIndex) {
		let skipRows = this.props.reportSearchResults.length;
		let nextPageTotal = pageIndex  * this.props.electionDayWalkerReport.numberOfResultsPerPage;

		let regularFiltersSearchQuery = { ...this.props.electionDayWalkerReport.regularFiltersSearchQuery };
		if(nextPageTotal > skipRows && this.props.totalSearchResultsCount > skipRows  ){
			ElectionsActions.loadElectionDayWalkerReportResults(this.props.dispatch, regularFiltersSearchQuery, skipRows);
		}
	}
	scrollToPageTop() {
		window.scrollTo(0, 0);
	}

	scrollToResultsTop() {
		if (this.self) {
			window.scrollTo(0, this.self.offsetTop)
		}
	}


	getRef(ref) {
		this.self = ref;
	}


	/*
	   Display modal window with comment text
	   
	   @param comment
	*/
	showComment(comment) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.SHOW_HIDE_GLOBAL_MODAL_DIALOG, show: true, modalHeader: '', modalContent: comment });
	}


	/*
	Init dynamic variables for render() function
	*/
	initDynamicVariables() {


		this.printResultsItem = null;
		this.exportPDFResultsItem = null;
		if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.reports.walkers.election_day.print'] == true) {
			this.printResultsItem = <a title="הדפסה" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'print')} className="icon-box print"></a>;
		}
		if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.reports.walkers.election_day.export'] == true) {
			this.exportPDFResultsItem = <a title="שמירת קובץ" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'pdf')} className="icon-box pdf"></a>;
		}


		let dataObject = [...this.props.reportSearchResults]; // reacreate array from state

		this.rowsObject = []; //this object will hold all the rows of the table of results.
		let currentPage = this.props.electionDayWalkerReport.currentPage;
		let numberPerPage = this.props.electionDayWalkerReport.numberOfResultsPerPage;

        let lastRow = (currentPage * numberPerPage) - 1;
		let firstRow = (lastRow - numberPerPage) + 1

		if (this.props.searchScreen.orderByCap50) { // show by captains of fifty
			this.renderCaptainFiftyResult(dataObject, firstRow, lastRow)
		}
		else { // show by ballots
			this.renderBallotsResult(dataObject, firstRow, lastRow)
		}
		this.totalVotersCount = this.props.totalSearchResultsCount;
		this.pagesNumberItem = null;
		this.paginationItem = null;
		if ((this.totalVotersCount / this.props.electionDayWalkerReport.numberOfResultsPerPage) > 1) { // check that more then 1 page
			this.paginationItem = <div className="row">
				<nav aria-label="Page navigation paginationRow">
					<div className="text-center">
						<Pagination navigateToPage={this.navigateToPage.bind(this)} resultsCount={this.totalVotersCount} currentPage={this.props.electionDayWalkerReport.currentPage} displayItemsPerPage={this.props.electionDayWalkerReport.numberOfResultsPerPage} />
					</div>
				</nav>
			</div>;
			this.pagesNumberItem = <div>מציג תוצאות {this.props.electionDayWalkerReport.numberOfResultsPerPage * (this.props.electionDayWalkerReport.currentPage - 1) + 1}-{this.props.electionDayWalkerReport.numberOfResultsPerPage * (this.props.electionDayWalkerReport.currentPage)}</div>;
		}

	}
	/**
	 * @method renderCaptainFiftyResult.
	 * Render captain50 table result rows
	 * 1. Captain50 row.
	 * 2. voters city row.
	 * 3. voters rows inside city and captain50.
	 * @param {array} dataObject - voters full result data 
	 * @param {bool} firstRow - Current page first row
	 * @param {bool} lastRow - Current page last row
	 */
	renderCaptainFiftyResult(dataObject, firstRow, lastRow){
		let arrayCap50IDS = {}; // definition of the new ordered array

		// going over main array of captains of fifty : 
		let voterIndexInHousehold = 1;
		let currentHouseholdID = null;
		for (let i = firstRow; i <= lastRow; i++) {

			let currentVoter = dataObject[i];
			if (!currentVoter) { continue; }
			let captain_voter_id = currentVoter.captain_voter_id;
			let city_id = currentVoter.city_id;

			if (!arrayCap50IDS[captain_voter_id]) {
			// Add new city captain50 row
				let currentCap50 = arrayCap50IDS[captain_voter_id] = {
					captain_voter_id: currentVoter.captain_voter_id,
					city_name: currentVoter.captain_city_name,
					first_name: currentVoter.captain_first_name,
					last_name: currentVoter.captain_last_name,
					personal_identity: currentVoter.captain_personal_identity,
					phone: (currentVoter.captain_phone_number ? currentVoter.captain_phone_number : ''),
					households_count: this.props.captainsFullResultHash[captain_voter_id].household_count,
					voters_in_households_count: this.props.captainsFullResultHash[captain_voter_id].voter_count,
				};
				this.rowsObject.push(<CaptainFiftyRowItem item={currentCap50} key={'firstRow' + captain_voter_id}/>);
				arrayCap50IDS[captain_voter_id] = {captainCities:{}};
			}
			// Add new city row
			if (!arrayCap50IDS[captain_voter_id].captainCities[currentVoter.city_id]) {
				this.rowsObject.push(<CaptainFiftyCityRowItem city_name={currentVoter.city_name} key={'secondRow'+ captain_voter_id + city_id }
				city_name={currentVoter.city_name} />);
				arrayCap50IDS[captain_voter_id].captainCities[city_id] = city_id;
			}
			if (currentVoter.household_id == currentHouseholdID) { voterIndexInHousehold++ }
			else{voterIndexInHousehold = 1; currentHouseholdID = currentVoter.household_id}
			// Add new voter row
			this.rowsObject.push(<CaptainFiftyRelatedVoterRowItem key={'thirdRow' + city_id + i }
				showComment={this.showComment.bind(this)} index={i}
				currentVoter={currentVoter} voterIndexInHousehold={voterIndexInHousehold}
			/>);
		}
	}
	/**
	 * @method renderBallotsResult.
	 * Render ballotboxes table result rows
	 * 1. ballotbox row.
	 * 3. voters rows inside ballotbox.
	 * @param {array} dataObject - voters full result data 
	 * @param {bool} firstRow - Current page first row
	 * @param {bool} lastRow - Current page last row
	 */
	renderBallotsResult(dataObject, firstRow, lastRow ){
		let arrayBallotBoxesIDS = {}; // definition of the new ordered array
		// going over main array of voters : 
		let voterIndexInHousehold = 1;
		let currentHouseholdID = null;
		for (let i = firstRow; i <= lastRow; i++) {
			let currentVoter = dataObject[i];
			if (!currentVoter) { continue; }
			let ballot_box_id = currentVoter.ballot_box_id;
			if (!arrayBallotBoxesIDS[ballot_box_id]) {
				// Add new ballotbox row
				arrayBallotBoxesIDS[ballot_box_id] = ballot_box_id;
				let currentBallot = {
					ballot_box_id: ballot_box_id,
					cluster_city_name: currentVoter.cluster_city_name,
					cluster_name: currentVoter.cluster_name,
					mi_id: currentVoter.mi_id,
					cluster_address: currentVoter.cluster_street,
					voter_count: this.props.ballotsFullResultHash[ballot_box_id].voter_count,
					household_count: this.props.ballotsFullResultHash[ballot_box_id].household_count,
					voters_array: []
				};
				this.rowsObject.push(<BallotBoxRowItem item={currentBallot} key={'firstRow' + ballot_box_id} />);
			}
			if (currentVoter.household_id == currentHouseholdID) { voterIndexInHousehold++ }
			else{voterIndexInHousehold = 1; currentHouseholdID = currentVoter.household_id}
				// Add new voter row
			this.rowsObject.push(<BallotBoxRelatedVoterRowItem key={'secondRow'+ ballot_box_id + i}
			voterIndexInHousehold={voterIndexInHousehold} item={currentVoter} index={i} />);
		
		}
	}

	render() {

		this.initDynamicVariables();
		return (
			<div ref={this.getRef.bind(this)}>
				<div style={{ paddingTop: '5px' }}>
					<div className="row rsltsTitleRow">
						<div className="col-lg-6 text-right">
							<div id="go-top-list"></div>
							<h3 className="separation-item noBgTitle">נמצאו<span className="counter">{this.totalVotersCount}</span>תושבים</h3>
							<span className="item-space">הצג</span>
							<input className="item-space input-simple" type="number" min="0" max="100"
							 value={this.props.electionDayWalkerReport.tempNumberOfResultsPerPage} onChange={this.numberOfResultsFieldChanging.bind(this)} />
							<span className="item-space">תוצאות</span>
							<button title="שנה" type="submit" className="btn btn-primary btn-sm" 
								style={{ backgroundColor: '#498BB6', borderColor: 'transparent' }}
								disabled={this.props.electionDayWalkerReport.tempNumberOfResultsPerPage == '' ||
								this.props.electionDayWalkerReport.tempNumberOfResultsPerPage <= 0}
								onClick={this.updateResultsPerPage.bind(this, this.props.electionDayWalkerReport.tempNumberOfResultsPerPage)}>שנה</button>
						</div>
						<div className="col-lg-6 clearfix">
							<div className="link-box pull-left">
								{this.printResultsItem} &nbsp;
								{this.exportPDFResultsItem}
							</div>
						</div>
					</div>
				</div>

				<div style={{ paddingTop: '3px' }}>
					{this.rowsObject.length > 0 ?
						<div className="dtlsBox srchRsltsBox box-content">
							<div className="table-container">
								<table className="table table-hover tableNoMarginB tableTight " id="printableData" ref="printableData" >
									<thead>
										{this.props.searchScreen.orderByCap50 ?
											<tr>
												{/* <th style={this.borderBottomStyle}>מ"ס</th> */}
												<th style={this.borderBottomStyle}>מס' בבית אב</th>
												<th style={this.borderBottomStyle}>כתובת</th>
												<th style={this.borderBottomStyle}>שם משפחה</th>
												<th style={this.borderBottomStyle}>שם פרטי</th>
												<th style={this.borderBottomStyle}>קוד תושב</th>
												{/* <th style={this.borderBottomStyle}>גיל</th> */}
												<th style={this.borderBottomStyle}>טלפון</th>
												<th style={this.borderBottomStyle}>טלפון נוסף</th>
												<th style={this.borderBottomStyle}>סטטוס סופי</th>
												<th style={this.borderBottomStyle}>לא היה בבית</th>
												<th style={this.borderBottomStyle}>הסעה</th>
												<th style={this.borderBottomStyle}>הערה</th>
												<th style={this.borderBottomStyle}>כתובת קלפי</th>
												<th style={this.borderBottomStyle}>קלפי</th>
												<th style={this.borderBottomStyle}>מס' בוחר בקלפי</th>
												<th style={this.borderBottomStyle}>זמן הצבעה צפוי</th>
											</tr> :
											<tr>
												{/* <th style={this.borderBottomStyle}>מ"ס</th> */}
												<th style={this.borderBottomStyle}>מס' בבית אב</th>
												<th style={this.borderBottomStyle}>מס' בוחר בקלפי</th>
												<th style={this.borderBottomStyle}>קוד תושב</th>
												<th style={this.borderBottomStyle}>שם משפחה</th>
												<th style={this.borderBottomStyle}>שם פרטי</th>
												<th style={this.borderBottomStyle}>כתובת</th>
												{/* <th style={this.borderBottomStyle}>גיל</th> */}
												<th style={this.borderBottomStyle}>טלפון</th>
												<th style={this.borderBottomStyle}>טלפון נוסף</th>
												<th style={this.borderBottomStyle}>הסעה</th>
												<th style={this.borderBottomStyle}>סטטוס סופי</th>
												<th style={this.borderBottomStyle}>שר 100</th>
												<th style={this.borderBottomStyle}>זמן הצבעה צפוי</th>
											</tr>
										}

									</thead>
									<tbody>
										{this.rowsObject}
									</tbody>
								</table>
							</div>
							<div className="rsltsTitleRow">
								{this.pagesNumberItem}
							</div>
							<nav aria-label="Page navigation paginationRow">
								<div className="text-center">
									{this.paginationItem}
								</div>
							</nav>
						</div>
						: null}
				</div>

				<div className="row single-line box-content">
					<div className="col-lg-12">
						<a data-toggle="tooltip" onClick={this.scrollToPageTop.bind(this)} data-placement="left" className="go-top-page-btn item-space" style={{ cursor: 'pointer' }} title="לראש העמוד"></a>
						<a data-toggle="tooltip" onClick={this.scrollToResultsTop.bind(this)} data-placement="left" className="go-top-list-btn" style={{ cursor: 'pointer' }} title="לראש הרשימה"></a>
					</div>
				</div>
				<br />
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		electionDayWalkerReport: state.elections.reportsScreen.electionDayWalkerReport,
		currentUser: state.system.currentUser,
		totalSearchResultsCount: state.elections.reportsScreen.electionDayWalkerReport.totalSearchResultsCount,
		reportSearchResults: state.elections.reportsScreen.electionDayWalkerReport.reportSearchResults,
		ballotsFullResultHash: state.elections.reportsScreen.electionDayWalkerReport.ballotsFullResultHash,
		captainsFullResultHash: state.elections.reportsScreen.electionDayWalkerReport.captainsFullResultHash,
		loadingSearchResults: state.elections.reportsScreen.electionDayWalkerReport.loadingSearchResults,
		searchScreen: state.elections.reportsScreen.electionDayWalkerReport.searchScreen,
	}
}

export default connect(mapStateToProps)(withRouter(ReportSearchResults));