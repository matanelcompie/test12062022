import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import ModalWindow from '../../global/ModalWindow';
import SearchHeader from './SearchHeader';
import VotesUpdatesHistory from './VotesUpdatesHistory';
import store from '../../../store';

class VotesManual extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.displayButtonStyle = { marginTop: '20px' };
		this.mainPanelStyle = { minHeight: '143px', paddingTop: '20px' };
		this.mainWrapperStyle = { paddingTop: '20px' };
		this.screenName = "עדכון הצבעה ידני";
		this.screenPermission = 'elections.votes.manual';
	}

	componentWillMount() {
		if (this.props.router.params.voterKey) {
			ElectionsActions.loadManualVotesScreenVoter(this.props.dispatch, this.props.router, this.props.router.params.voterKey);
		}
		//this.props.dispatch({type:ElectionsActions.ActionTypes.CITIES.CLEAN_ALL_CITIES_AND_SEARCH_SCREENS});
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.screenName });
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}


    /*
	   general function that closes all types of dialogues 
	 */
	closeModalDialog() {
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA, visible: false, headerText: '', modalText: ''
		});
	}

	/*
	Function that handles adding manual vote to voter via API
	*/
	addVoterVote() {
		ElectionsActions.addManualVoteToVoter(this.props.dispatch, this.props.router.params.voterKey);
	}

	/*
	Function that handles cleaning all temp votes list items
	*/
	cleanTempVotesList() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.MANUAL_VOTES.GLOBAL_SCREEN_SET_PARAM_VALUE, fieldName: 'lastUpdatesList', fieldValue: [] });
	}

	/*
	Function that handles to delete specific vote that was created now
	*/
	deleteExistingVote(tempVotesArrayIndex) {
		ElectionsActions.deleteManualVoteToVoter(this.props.dispatch, this.props.router.params.voterKey, tempVotesArrayIndex);
	}

	render() {
		let isVoteStyle = {};
		if (this.props.manualVotesScreen.foundVoterData) {
			isVoteStyle = this.props.manualVotesScreen.foundVoterData.vote ? { 'border': 'solid red 3px' } : { 'border': 'solid greenyellow 3px' };
		}
		return (
			<div className={this.mainWrapperStyle}>
				<div>
					<div className="row">
						<div className="col-md-6 text-right">
							<h1>{this.screenName}</h1>
						</div>
					</div>
					<SearchHeader />
					<br />
					{this.props.manualVotesScreen.loadingResults && <div style={{ textAlign: 'center', fontSize: '38px' }}><i className="fa fa-spinner fa-spin"></i></div>}
					{this.props.manualVotesScreen.foundVoterData && this.props.router.params.voterKey && <div>
						<div className="row" >
							<div className="col-lg-12 no-padding" >
								<div className="dtlsBox srchRsltsBox clearfix" style={{...isVoteStyle, minHeight: '70px' }} >
									<div className="row">
										<div className="tit-text col-md-4" style={{ fontSize: '20px', color: '#333' }}>
											<span>{this.props.manualVotesScreen.foundVoterData.first_name + ' ' + this.props.manualVotesScreen.foundVoterData.last_name} - ת.ז {this.props.manualVotesScreen.foundVoterData.personal_identity}</span>, <span className="place">{this.props.manualVotesScreen.foundVoterData.city}</span>
										</div>
										{!this.props.manualVotesScreen.foundVoterData.vote &&
											<div className="col-md-2">
												{(this.props.currentUser.admin || this.props.currentUser.permissions['elections.votes.manual.add'] == true) && <button title="עדכן הצבעה" type="button" className="btn btn-primary btn-xs" style={{ backgroundColor: '#498bb6' }} onClick={this.addVoterVote.bind(this)}>עדכן הצבעה</button>}
											</div>
										}
										{this.props.manualVotesScreen.foundVoterData.vote && <span className="col-md-2" style={{ fontSize: '20px', color: '#498BB6', fontWeight: 'bold' }}>הצביע כבר</span>}

										<div className="col-md-4" style={{ paddingRight: '25px', paddingTop: '4px' }}>
											{this.props.manualVotesScreen.foundVoterData.vote &&
												<span>
													<span className="topic">עודכן ע"י : </span>&nbsp;&nbsp;
													<a title={this.props.manualVotesScreen.foundVoterData.vote.first_name + ' ' + this.props.manualVotesScreen.foundVoterData.vote.last_name} style={{ cursor: 'pointer' }}>{this.props.manualVotesScreen.foundVoterData.vote.user_create_id ? (this.props.manualVotesScreen.foundVoterData.vote.first_name + ' ' + this.props.manualVotesScreen.foundVoterData.vote.last_name) : '-'}</a>
													&nbsp;
													<span className="topic" style={{ paddingRight: '35px' }}>בשעה :</span>&nbsp;&nbsp;
													<span>{this.props.manualVotesScreen.foundVoterData.vote.vote_date ? this.props.manualVotesScreen.foundVoterData.vote.vote_date.split(' ')[1].substr(0, 5) : "-"}</span>
												</span>
											}
										</div>
									</div>
								</div>

							</div>
						</div>
						<br />
						<VotesUpdatesHistory items={this.props.manualVotesScreen.lastUpdatesList} tableCellStyle={{textAlign:'right'}} onCleanList={this.cleanTempVotesList.bind(this)} onDeleteVote={this.deleteExistingVote.bind(this)} showDelete={(this.props.currentUser.admin || this.props.currentUser.permissions['elections.votes.manual.delete'] == true)} />
					</div>}
					<ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{ zIndex: '9001' }}>
						<div>{this.props.modalContentText}</div>
					</ModalWindow>
				</div>
			</div>
		);
	}
}


function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		showModalDialog: state.elections.showModalDialog,
		modalHeaderText: state.elections.modalHeaderText,
		modalContentText: state.elections.modalContentText,
		manualVotesScreen: state.elections.manualVotesScreen,
	}
}

export default connect(mapStateToProps)(withRouter(VotesManual));