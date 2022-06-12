import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../global/Combo';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';

class VotesTable extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}
	
	/*
		Function that inits constant variables
	*/
	initConstants() {
		this.styles = {
			marginTop: {
				marginTop: '15px'
			},
			menuStyle: {
				fontSize: '20px'
			},
		}
		this.numberOfColumnsInResultSet = 25; 
	}
	
	/*
		Function that returns reference to top-right textbox of voter number INSIDE RESULTS subscreen - NOT THE SEARCH SCREEN : 
	*/
    getRef(ref) {
		this.textBoxVoterRef = ref;
    }
	
	componentDidUpdate(){
		let result = this.getNewVotesCount();
		if(result == 0){
			this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'elections.form1000' });
		}
		else if(result == 1){
			this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: 'elections.form1000' });
		}
	}
	/*
	Functions that change voter's vote temporary status
	*/
	changeVoteStatus(voterIndex, isAllowed) {
		if (isAllowed) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.VOTER_RESULTS_VOTER_REVERT_VOTE_STATUS, voterIndex });
		}
	}

	/*
	   Renders buttom legend
	*/
	renderBottomLegendMenu() {
		return <div className="flexed-center flexed-space-between" style={this.styles.menuStyle}>
			<div className="large-title">
				<span className="key-values"><strong>מקרא</strong></span>
				<span className="pointed member status-current item-space">xx</span>
				<span>תומך שהצביע</span>
			</div>
			<div className="large-title">
				<span className="pointed status-current item-space">xx</span>
				<span>תושב שהצביע</span>
			</div>
			<div className="large-title">
				<span className="no-pointed status-current item-space">xx</span>
				<span>תושב שלא הצביע</span>
			</div>
			<div className="large-title">
				<span className="no-pointed member status-current item-space">xx</span>
				<span>תומך שלא הצביע</span>
			</div>
		</div>
	}

	/*
		Function that dynamicly generates table rows for returend-from-search result set : 
	*/
	generateTableRows() {
		let returnedRowsArray = [];
		let tempTableRow = [];
		let tempIndexer = 0;
		let self = this;
		this.props.searchResults.ballotbox_voters_array.map(function (item, index) {

			if (index != 0 && index % self.numberOfColumnsInResultSet == 0) {
				returnedRowsArray.push(<tr key={"tr" + index}>{tempTableRow}</tr>);
				tempTableRow = [];
			}
			let className = "";
			if (item.votes.length > 0) {
				className = "pointed";
				if (item.support_statuses_count == 1) {
					className += " member";
				}
			}
			else {
				className = "no-pointed";
				if (item.support_statuses_count == 1) {
					className += " member";
				}
			}
			let tooltipTitle = "שם מלא : " + (item.first_name + ' ' + item.last_name) + " \n " +
				'תעודת זהות : ' + (item.personal_identity) + " " +
				((item.votes.length > 0 && item.votes[0].vote_date ) ? (" \n " + " שעה: " + item.votes[0].vote_date.split(' ')[1] + " \n " +
					" מקור: " + item.votes[0].vote_source_name + " " +
					(item.votes[0].user_first_name ? (" \n " + " מעדכן: " + item.votes[0].user_first_name + " " + item.votes[0].user_last_name) : '')
				) : '')

			tempTableRow.push(
				<td key={"td" + index} className={className}
					data-tooltip={tooltipTitle}
					style={{
						cursor: (item.votes.length == 0 ? 'pointer' : 'not-allowed'),
						borderColor: (item.temporaryVoted == true ? (item.support_statuses_count == 1 ? '#000000' : '#000000') : ''),
						whiteSpace: 'pre-line'
					}}
					data-original-title={tooltipTitle}
					onClick={self.changeVoteStatus.bind(self, index, (item.votes.length == 0))}><span className="num">{item.voter_serial_number}</span></td>);

			if (index == self.props.searchResults.ballotbox_voters_array.length - 1) {
				returnedRowsArray.push(<tr key={"tr" + (index + 1)}>{tempTableRow}</tr>);
				tempTableRow = [];
			}
		});
		return returnedRowsArray;
	}

    /*
	   Handles change of voter serial number inside textbox
	*/
	changeTextBoxVoterSerialNumber(e) {

		if (e.target.value == '0' || parseInt(e.target.value) > 1000 || !new RegExp('^[0-9]*$').test(e.target.value)) { return; } // allow only numbers in the field
		this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_RESULTS_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'textBoxVoterSerialNumber', fieldValue: e.target.value });
	}

	/*
	Handles votting from textbox and not by clicking voter number :
	*/
	setTemporaryVoterVotedFormTextBox() {
		let voterAtIndex = { ...this.props.searchResults.ballotbox_voters_array[parseInt(this.props.searchResults.textBoxVoterSerialNumber) - 1] };
		if (voterAtIndex.votes.length > 0 || voterAtIndex.temporaryVoted == true) {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SET_ERROR_MODAL_WINDOW_PARAMS, displayErrorMessage: true, modalErrorTitle: 'שיגאה', modalErrorContent: 'לתושב כבר קיימת הצבעה' });
		}
		else {
			this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.SEARCH_RESULTS_SCREEN_ITEM_VALUE_CHANGE, fieldName: 'textBoxVoterSerialNumber', fieldValue: '' });
			this.props.dispatch({ type: ElectionsActions.ActionTypes.FORM1000.VOTER_RESULTS_VOTER_REVERT_VOTE_STATUS, voterIndex: (parseInt(this.props.searchResults.textBoxVoterSerialNumber) - 1) });
			this.textBoxVoterRef.focus();
		}
	}
	/*
	Get current selected temporary users count
	*/
	getNewVotesCount() {
		let result = 0;
		for (let i = 0; i < this.props.searchResults.ballotbox_voters_array.length; i++) {
			if (this.props.searchResults.ballotbox_voters_array[i].temporaryVoted == true) {
				result++;
			}
		}
		return result;
	}

	/*
	Do real save of votes via API to database
	*/
	saveChangesAPI() {
		let resultArray = [];
		for (let i = 0; i < this.props.searchResults.ballotbox_voters_array.length; i++) {
			if (this.props.searchResults.ballotbox_voters_array[i].temporaryVoted == true) {
				resultArray.push(this.props.searchResults.ballotbox_voters_array[i].voter_id);
			}
		}
		ElectionsActions.createNewVotesForBallotBox(this.props.dispatch, this.props.searchScreen.selectedBallotbox.selectedItem.key, resultArray);
	}

	/*
	Handles printing or exporting data to pdf by ballot key
	*/
	exportData(exportTypeName) {
		let url = (window.Laravel.baseURL + 'api/elections/form1000/' + this.props.searchScreen.selectedBallotbox.selectedItem.key + '/export?type=' + exportTypeName);
		window.open(url, '_blank');
	}

	/*handle key press "enter" at text field of voter serial number */
	handleVoteTextKeyPress(event) {
		if (event.charCode == 13) { /*if user pressed enter*/
			this.setTemporaryVoterVotedFormTextBox();
		}
	}

	render() {
		return (<div>
			<div className="dtlsBox srchPanel first-box-on-page clearfix" style={this.styles.marginTop}>
				<div>
					<div className="clearfix rsltsTitleRow title-table" >
						<div className="col-lg-3">
							{(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000'] == true) &&
								<div className="row">
									<div className="col-md-4 no-padding text-right" style={{ width: '22%', marginTop: '4px' }}>
										<span className="item-space">מס' בוחר</span>
									</div>
									<div className="col-md-4 no-padding text-right" >
										<input ref={this.getRef.bind(this)} className="form-control" type="text" value={this.props.searchResults.textBoxVoterSerialNumber}
											onChange={this.changeTextBoxVoterSerialNumber.bind(this)} onKeyPress={this.handleVoteTextKeyPress.bind(this)} />
									</div>
									<div className="col-md-4">
										<button type="submit" className="btn btn-primary btn-sm"
											disabled={this.props.searchResults.textBoxVoterSerialNumber == '' || (parseInt(this.props.searchResults.textBoxVoterSerialNumber) > this.props.searchResults.ballotbox_voters_array.length)}
											onClick={this.setTemporaryVoterVotedFormTextBox.bind(this)}  >עדכן הצבעה</button>
									</div>
								</div>
							}
						</div>
						<div className="col-lg-6 no-padding">
							<div className="row">
							</div>
						</div>
						<div className="col-lg-3 text-left" >
							<div className="row">
								<div className="col-md-12 text-left">
									<div className="row">
										<div className={(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000'] == true) ? "col-sm-4 text-left" : "col-sm-6 text-left"} ></div>
										<div className="col-sm-2 text-left">
											{(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000.export'] == true) && <a title="יצוא ל-pdf" style={{ cursor: 'pointer' }} className="icon-box pdf" onClick={this.exportData.bind(this, 'pdf')}></a>}
										</div>
										<div className="col-sm-2 text-left">
											{(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000.print'] == true) && <a title="הדפסה" style={{ cursor: 'pointer' }} className="icon-box print" onClick={this.exportData.bind(this, 'print')}></a>}
										</div>
										{(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000'] == true) && <div className="col-sm-2 text-left">
											<button type="submit" className="btn btn-primary btn-sm" disabled={this.getNewVotesCount() == 0 || this.props.isSavingData} onClick={this.saveChangesAPI.bind(this)}>{this.props.isSavingData ? "שומר שינויים ...." : "שמור שינויים"}</button>
										</div>}
									</div>
								</div>
							</div>
						</div>
					</div>

					<table className="form-1000-table" dir="ltr">
						<tbody>
							{this.generateTableRows()}
						</tbody>
					</table>
					<div className="pull-left">
						{(this.props.currentUser.admin || this.props.currentUser.permissions['elections.form1000'] == true) && <button type="submit" className="btn btn-primary btn-sm" disabled={this.getNewVotesCount() == 0} onClick={this.saveChangesAPI.bind(this)}>שמור שינויים</button>}
					</div>
				</div>
			</div>
			<div className="dtlsBox srchPanel first-box-on-page clearfix" style={this.styles.marginTop}>
				{this.renderBottomLegendMenu()}
			</div>
		</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		searchScreen: state.elections.form1000Screen.searchScreen,
		searchResults: state.elections.form1000Screen.searchResults,
		isSavingData: state.elections.form1000Screen.searchResults.isSavingData,
		currentUser: state.system.currentUser,

	}
}

export default connect(mapStateToProps)(withRouter(VotesTable));