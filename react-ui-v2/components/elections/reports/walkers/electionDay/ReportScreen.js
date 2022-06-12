import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';
import TopFirstSearch from './TopFirstSearch';
import ReportSearchResults from './ReportSearchResults';


class ReportScreen extends React.Component {

	constructor(props) {
		super(props);
		this.screenPermission = 'elections.reports.walkers.election_day';
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}

	componentWillMount() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'הליכון יום בחירות' });
		ElectionsActions.loadAllSupportStatusesForReport(this.props.dispatch);
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
	}
	/*
	   Handle closing global modal dialog
	*/
	closeGlobalModalWindow() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.SHOW_HIDE_GLOBAL_MODAL_DIALOG, show: false, modalHeader: '', modalContent: '' });
	}

	/*
	Performs field validations for render() method
	*/
	validateFields() {
		this.validatorsObject = {};
		let validatedArea = true;
		let validatedCity = true;
		let validatedNeighborhood = true;
		let validatedCluster = true;
		let validatedBallotBox = true;
		let validatedPersonalIdentity = true;
		let validatedMinimumSearch = true;
		let validatedIsVoted = true;

		let searchScreen = this.props.searchScreen;

		if (!searchScreen.selectedArea.selectedItem && searchScreen.selectedArea.selectedValue && searchScreen.selectedArea.selectedValue.split(' ').join('') != '') {
			validatedArea = false;
		}
		if (!searchScreen.selectedCity.selectedItem && searchScreen.selectedCity.selectedValue && searchScreen.selectedCity.selectedValue.split(' ').join('') != '') {
			validatedCity = false;
		}
		if (!searchScreen.selectedNeighborhood.selectedItem && searchScreen.selectedNeighborhood.selectedValue && searchScreen.selectedNeighborhood.selectedValue.split(' ').join('') != '') {
			selectedNeighborhood = false;
		}
		if (!searchScreen.selectedCluster.selectedItem && searchScreen.selectedCluster.selectedValue && searchScreen.selectedCluster.selectedValue.split(' ').join('') != '') {
			validatedCluster = false;
		}
		if (!searchScreen.selectedBallotBox.selectedItem && searchScreen.selectedBallotBox.selectedValue && searchScreen.selectedBallotBox.selectedValue.split(' ').join('') != '') {
			validatedBallotBox = false;
		}
	
		if (searchScreen.selectedCity.selectedItem) { //Check if city selectd
			validatedMinimumSearch = true;
		} else if (searchScreen.clusterLeaderID.length > 3 && !this.props.searchScreen.filterByMinisterOfFifty) {  //Check if cluster leader selected and valid cluster leader.
			validatedMinimumSearch = true;
		} else if (searchScreen.ministerID.length > 3 && this.props.searchScreen.filterByMinisterOfFifty) { //Check if captain50 selected and valid captain50.
			validatedMinimumSearch = true;
		} else { // Search not has minimal data
			validatedMinimumSearch = false;
		}
		if (!searchScreen.selectedIsVoted.selectedItem) {
			validatedIsVoted = false;
		}

		this.validatorsObject.validatedArea = validatedArea;
		this.validatorsObject.validatedCity = validatedCity;
		this.validatorsObject.validatedNeighborhood = validatedNeighborhood;
		this.validatorsObject.validatedCluster = validatedCluster;
		this.validatorsObject.validatedBallotBox = validatedBallotBox;
		this.validatorsObject.validatedPersonalIdentity = validatedPersonalIdentity;
		this.validatorsObject.validatedMinimumSearch = validatedMinimumSearch;
		this.validatorsObject.validatedIsVoted = validatedIsVoted;
	}


	render() {

		this.validateFields();
		return (
			<div className="container">
				<div className="row">
					<div className="col-md-6 text-right">
						<h1>הליכון יום בחירות</h1>
					</div>
				</div>
				<TopFirstSearch validatorsObject={this.validatorsObject} />
				<br />
				<div style={{ textAlign: 'center' }}>
					{this.props.electionDayWalkerReport.loadingSearchResults ? <div><i className="fa fa-spinner fa-spin"></i> טוען...</div> : null}
					{this.props.electionDayWalkerReport.reportSearchResults && !this.props.electionDayWalkerReport.loadingSearchResults ? <ReportSearchResults /> : ''}
				</div>
				<ModalWindow show={this.props.electionDayWalkerReport.showGlobalMessageModal} title={this.props.electionDayWalkerReport.globalModalMessageHeader} buttonOk={this.closeGlobalModalWindow.bind(this)} buttonX={this.closeGlobalModalWindow.bind(this)}>
					<div>{this.props.electionDayWalkerReport.globalModalMessageContent}</div>
				</ModalWindow>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		electionDayWalkerReport: state.elections.reportsScreen.electionDayWalkerReport,
		currentUser: state.system.currentUser,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		searchScreen: state.elections.reportsScreen.electionDayWalkerReport.searchScreen,
	}
}


export default connect(mapStateToProps)(withRouter(ReportScreen));