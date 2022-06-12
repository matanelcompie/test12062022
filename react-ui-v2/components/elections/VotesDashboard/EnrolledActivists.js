import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import TopCommonHeader from './TopCommonHeader';
import TopActivistsFilters from './TopActivistsFilters';
import Pagination from 'components/global/Pagination';
import constants from 'libs/constants';

class EnrolledActivists extends React.Component {

	constructor(props) {
		super(props);
		this.state={
			currentPage:1,
			currentLoadedIndex:1,
		};
		this.initConstants();
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.itemsPerPage=30;
		this.screenName = "רשימת פעילים משובצים";
		this.textRightStyle={textAlign:'right'};
		this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
	}

	componentWillMount() {
		let params={};
		if(this.props.entityType != null && this.props.entityKey != null){
			params.entity_type = this.props.entityType;
			params.entity_key = this.props.entityKey;
		}
		params.hot_ballots=this.props.hotBallots;
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.screenName });
		ElectionsActions.getVoterDashboardEnrolledActivists(this.props.dispatch , params);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions['elections.votes.dashboard'] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}
	
	/*
		Handles page navigation
	*/
	navigateToPage(pageIndex) {
		this.setState({ currentPage: pageIndex });
		/*
		if(this.props.enrolledData.activists_list.length < this.props.enrolledData.total_count ){
			if(!this.props.loadingMoreActivists){
				ElectionsActions.loadMoreEnrolledActivists(this.props.dispatch , {current_page:(this.state.currentLoadedIndex+1)});
				this.setState({currentLoadedIndex:(this.state.currentLoadedIndex+1)});
			}
		}
		*/
	}
	
	/*
		Retrun verified status name by status id
	*/
	getVerifiedStatusName(verifiedStatusID){
		switch(verifiedStatusID){
			case 0:
				return "טרם נשלחה הודעה";
				break;
			case 1:
				return "נשלחה הודעה";
				break;
			case 2:
				return "מאומת";
				break;
			case 3:
				return "מסרב";
				break;
			case 4:
				return "לבירור נוסף";
				break;
		}
		return "";
	}
 

	render() {
		this.filteredEnrolledData = this.props.enrolledData.activists_list;
		if(this.filteredEnrolledData){
			if(this.props.checkedBallotMemberRole && !this.props.checkedObserverRole){ // show ballot members only
				this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.election_role_system_name == constants.electionRoleSytemNames.ballotMember));
			}
			else if(!this.props.checkedBallotMemberRole && this.props.checkedObserverRole){ // show observer members only
				this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.election_role_system_name == constants.electionRoleSytemNames.observer));
			}	
			
			 
			if(this.props.enrolledActivistsFilterName != ''){
				switch(this.props.enrolledActivistsFilterName){
					case 'verified':
						this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.verified_status == constants.activists.verifyStatus.verified));
						break;
					case 'unverified':
						this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.verified_status != constants.activists.verifyStatus.verified));
						break;
					case 'arrived':
						this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.arrival_date != null));
						break;
					case 'unarrived':
						this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (!item.arrival_date ));
						break;
					case 'reporting':
						this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.correct_reporting == 1));
						break;
					case 'notreporting':
						this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> (item.not_reporting == 1));
						break;
				}
			}

			//filter on checked shifts
			let selectedShiftsSystemNames = {};
			if(this.props.checkedFirstShift == 1) {
				selectedShiftsSystemNames[this.roleShiftsSytemNames.first] = true;
			}
			if(this.props.checkedSecondShift == 1) {
				selectedShiftsSystemNames[this.roleShiftsSytemNames.second] = true;
				selectedShiftsSystemNames[this.roleShiftsSytemNames.secondAndCount] = true;
			}
			if(this.props.checkedAllShifts == 1) {
				selectedShiftsSystemNames[this.roleShiftsSytemNames.allDay] = true;
				selectedShiftsSystemNames[this.roleShiftsSytemNames.allDayAndCount] = true;
			}
			if(this.props.checkedCountShift == 1) {
				selectedShiftsSystemNames[this.roleShiftsSytemNames.count] = true;
			}

			this.filteredEnrolledData = this.filteredEnrolledData.filter(item=> ( selectedShiftsSystemNames.hasOwnProperty(item.role_shift_system_name) ));
		}
		
		let self = this;
		let baseURL = window.Laravel.baseURL;
		return (<div>
					<TopCommonHeader screenName={this.screenName} />
					<div className="row">
						<TopActivistsFilters />
					</div>
					<div style={{marginTop:'20px'}}></div>
					<div className="dtlsBox srchRsltsBox box-content margin-top20" style={{minHeight:'310px'}}>
						
						<table className="table line-around table-striped nomargin" >
                            <thead>
								<tr className="header-activists-table">
									<th width="9%" style={this.textRightStyle}>ת.ז.</th>
									<th width="9%" style={this.textRightStyle}>שם מלא</th>
									<th width="10%" style={this.textRightStyle}>תפקיד</th>
									<th width="9%" style={this.textRightStyle}>שם עיר</th>
									<th width="9%" style={this.textRightStyle}>מספר קלפי</th>
									<th width="9%"  style={this.textRightStyle}>משמרת</th>
									<th width="9%"  style={this.textRightStyle}>נייד</th>
									<th width="9%"  style={this.textRightStyle}>אימות</th>
									<th width="8%"  style={this.textRightStyle}>התייצבות</th>
									<th width="5%" style={this.textRightStyle}>מקור</th>
									<th width="5%" style={this.textRightStyle}>דיווחים</th>
									<th width="9%" style={this.textRightStyle}>דיווח אחרון</th>
								</tr>
                            </thead>
						</table>
						<div className="activists-short-table">
						<table className="table line-around table-striped nomargin" >
                            <tbody  >
							{
								(this.filteredEnrolledData)?
										this.filteredEnrolledData.map(function(item , index){
											if(index < ((self.state.currentPage-1)*self.itemsPerPage) || index >= (self.state.currentPage*self.itemsPerPage)){return;}
											 
												return (
													<tr key={index}>
														<td width="9%"><a className="cursor-pointer" target="_blank" href={baseURL + 'elections/activists/' + item.voter_key + '/' + item.election_role_key} >{item.personal_identity}</a></td>
														<td width="9%"><a className="cursor-pointer" target="_blank" href={baseURL + 'elections/voters/' + item.voter_key} >{item.first_name + ' ' + item.last_name}</a></td>
														<td width="10%">{item.election_role_name}</td>
														<td width="9%">{item.ballot_city_name}</td>
														<td width="9%">{(item.mi_id+'').substr(0 , (item.mi_id+'').length-1) + "." +(item.mi_id+'').substr(-1) }</td>
														<td width="9%">{item.role_shift_name}</td>
														<td width="9%">{item.phone_number}</td>
														<td width="9%">{self.getVerifiedStatusName(item.verified_status)}</td>
														<td width="8%">{item.arrival_date ? (item.arrival_date.split(' ')[1].substr(0,5)) : "-"}</td>
														<td width="5%">{item.vote_source_name ? item.vote_source_name : "-"}</td>
														<td width="4%">{item.reporting_votes_count}</td>
														<td width="8%">{item.last_reporting_vote > 0 ? (item.last_reporting_vote.created_at.split(' ')[1].substr(0,5)) : "-"}</td>
													</tr>
												)
										})
								:
								<tr><td colSpan="10" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>
							}
                            </tbody>
                        </table>
						</div>
					</div>
					<div style={{marginTop:'20px'}}></div>
					 {(this.filteredEnrolledData ) && 
						<Pagination resultsCount={this.filteredEnrolledData.length}
							displayItemsPerPage={this.itemsPerPage}
							currentPage={this.state.currentPage}
							navigateToPage={this.navigateToPage.bind(this)} />
					}
			 </div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		enrolledData: state.elections.votesDashboardScreen.enrolledData,
		loadingMoreActivists: state.elections.votesDashboardScreen.loadingMoreActivists,
		enrolledActivistsFilterName: state.elections.votesDashboardScreen.enrolledActivistsFilterName,
		checkedBallotMemberRole: state.elections.votesDashboardScreen.checkedBallotMemberRole,
		checkedObserverRole: state.elections.votesDashboardScreen.checkedObserverRole,
		checkedFirstShift: state.elections.votesDashboardScreen.checkedFirstShift,
		checkedSecondShift: state.elections.votesDashboardScreen.checkedSecondShift,
		checkedAllShifts: state.elections.votesDashboardScreen.checkedAllShifts,
		checkedCountShift: state.elections.votesDashboardScreen.checkedCountShift,
		entityType: state.elections.votesDashboardScreen.entityType,
		entityKey: state.elections.votesDashboardScreen.entityKey,
		hotBallots: state.elections.votesDashboardScreen.hotBallots,
	}
}
export default connect(mapStateToProps)(withRouter(EnrolledActivists));