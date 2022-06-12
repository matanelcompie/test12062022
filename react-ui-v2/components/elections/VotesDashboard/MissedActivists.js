import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import ModalWindow from '../../global/ModalWindow';
import TopHeaderSearch from './TopHeaderSearch';
import store from '../../../store';
import {withCommas} from 'libs/globalFunctions';
import TopCommonHeader from './TopCommonHeader';
import TopActivistsFilters from './TopActivistsFilters';
import Pagination from 'components/global/Pagination';
import constants from 'libs/constants';

class MissedActivists extends React.Component {

	constructor(props) {
		super(props);
		this.state={
			currentPage:1,
			currentLoadedIndex:1,
			showConfirmDeleteDlg:false,
			rowKeyToDelete:null,
			checkAllChecked:false,
			smsText: constants.activists.verificationMessageText,
			showSuccessMessage:false,
		};
		this.initConstants();
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.itemsPerPage=30;
		this.screenName = "רשימת פעילים שלא דיווחו התייצבות";
		this.confirmModalTitle = "אישור מחיקה";
		this.confirmModalContent = "האם למחוק את השורה??";
		this.successModalTitle = "הודעה";
		this.successModalContent = "ההודעות הנבחרות נשלחו בהצלחה";
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
		 ElectionsActions.getVoterDashboardMissedActivists(this.props.dispatch , params);
		 
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
		if(this.props.missedData.activists_list.length < this.props.missedData.total_count ){
			if(!this.props.loadingMoreMissedActivists){
				ElectionsActions.loadMoreMissedActivists(this.props.dispatch , {current_page:(this.state.currentLoadedIndex+1)});
				this.setState({currentLoadedIndex:(this.state.currentLoadedIndex+1)});
			}
		}
		*/
	}
	
	/*
		Handles showing/hiding delete confirmation modal dialog - by params
	*/
	showHideConfirmDeleteDlg(rowKey , isShow){
		this.setState({showConfirmDeleteDlg:isShow , rowKeyToDelete:rowKey});
	}
	
	/*
		Handles real deleting of selected row
	*/
	doDeleteAction(){
		let data={};
		if(this.props.entityType != null && this.props.entityKey != null){
			data.entity_type = this.props.entityType;
			data.entity_key = this.props.entityKey;
		}
		let keyToDelete = this.state.rowKeyToDelete;
		ElectionsActions.deleteMissingActivistRowByKey(this.props.dispatch , keyToDelete , data);
		this.showHideConfirmDeleteDlg(null,false);
	}
	
	getRowIndexByIdNumber(idNumber){
		let returnedNumber = -1;
	    for(let i = 0 ; i < this.props.missedData.activists_list.length ; i++){
			if(this.props.missedData.activists_list[i].id == idNumber){
				returnedNumber= i;
				break;
			}
		}
		return returnedNumber;
	}
	
	/*
		Handles checking/unchecking single checkbox inside data table
	*/
	tableCheckboxChange(rowIdNumber , e){
		let rowIndex = this.getRowIndexByIdNumber(rowIdNumber);
		if(rowIndex != -1){
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.UPDATE_SUBSCREEN_ARRAY_VALUE_BY_INDEX , arrayName:'missedData' , arrayIndex:rowIndex , fieldName:'checkedSMS' , fieldValue:(e.target.checked?true:false)});
		}
	}
	
	/*
		Handles clicking check/uncheck all checkbox in table header row checkbox
	*/
	checkAllChange(e){
		this.setState({checkAllChecked:e.target.checked});
		for(let index = 0 ; index < this.filteredData.length ; index++){
			let rowIndex = this.getRowIndexByIdNumber(this.filteredData[index].id);
			if(index < ((this.state.currentPage-1)*this.itemsPerPage) || index >= (this.state.currentPage*this.itemsPerPage)){continue;}
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.UPDATE_SUBSCREEN_ARRAY_VALUE_BY_INDEX , arrayName:'missedData' , arrayIndex:rowIndex , fieldName:'checkedSMS' , fieldValue:(e.target.checked?true:false)});
		}
	}
	
	
		/*
		Handles sending SMS to all checked voters
	*/
	sendCollectiveSMS(){
		let arrayRoleShiftsKeys = [];
		for(let index = 0 ; index < this.filteredData.length ; index++){
			if(this.filteredData[index].checkedSMS){
				arrayRoleShiftsKeys.push(this.filteredData[index].role_shift_key);
			}
		}
		
		if(arrayRoleShiftsKeys.length > 0){
			this.setState({showSuccessMessage:true});
			this.setState({checkAllChecked:false});
			let data = {};
			data.list_type = "missed";
			data.election_role_geog_row_keys = JSON.stringify(arrayRoleShiftsKeys);
			ElectionsActions.sendSMSFromVotesDashboards(this.props.dispatch , data);
			 for(let index = 0 ; index < this.filteredData.length ; index++){
			 	this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.UPDATE_SUBSCREEN_ARRAY_VALUE_BY_INDEX , arrayName:'missedData' , arrayIndex:index , fieldName:'checkedSMS' , fieldValue:(false)});
			 }
		}	 
	}
	
	/*
		Handles hiding succes modal window dialog
	*/
	hideSuccessMessage(){
		this.setState({showSuccessMessage:false});
	}
	
 

	render() {
		let baseURL = window.Laravel.baseURL;
		this.filteredData = this.props.missedData.activists_list;
		if(this.filteredData){
			if(this.props.checkedBallotMemberRole && !this.props.checkedObserverRole){ // show ballot members only
				this.filteredData = this.filteredData.filter(item=> (item.election_role_system_name == constants.electionRoleSytemNames.ballotMember));
			}
			else if(!this.props.checkedBallotMemberRole && this.props.checkedObserverRole){ // show observer members only
				this.filteredData = this.filteredData.filter(item=> (item.election_role_system_name == constants.electionRoleSytemNames.observer));
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

			this.filteredData = this.filteredData.filter(item=> ( selectedShiftsSystemNames.hasOwnProperty(item.role_shift_system_name) ));
		}
		let self = this;
 
		return (<div>
					{this.state.showConfirmDeleteDlg && 
						<ModalWindow title={this.confirmModalTitle} show={this.state.showConfirmDeleteDlg} buttonOk={this.doDeleteAction.bind(this)} buttonCancel={this.showHideConfirmDeleteDlg.bind(this , null , false)} buttonX={this.showHideConfirmDeleteDlg.bind(this , null , false)}>
							<div>{this.confirmModalContent}</div>
						</ModalWindow>
					}
					{
						this.state.showSuccessMessage && 
							<ModalWindow title={this.successModalTitle} show={this.state.showSuccessMessage} buttonOk={this.hideSuccessMessage.bind(this)} buttonX={this.hideSuccessMessage.bind(this)}>
								<div>{this.successModalContent}</div>
							</ModalWindow>
					}
					<TopCommonHeader screenName={this.screenName} />
						<div className="row">
							<TopActivistsFilters />
							<div className="activists-btns2">
								<div><button title="שלח הודעה חוזרת לפעילים מסומנים" className="btn btn-primary select-city-btn select-country-btn btn-activists" onClick={this.sendCollectiveSMS.bind(this)}>שלח הודעה חוזרת לפעילים מסומנים </button></div>
							</div>
						</div> 
						<div style={{marginTop:'20px'}}></div>
						<div className="dtlsBox srchRsltsBox box-content margin-top20" style={{minHeight:'320px'}}>
							<table className="table line-around table-striped nomargin table-activists-not-verfied">
								<thead>
									<tr className="header-activists-table">
										<th width="7%">ת.ז.</th>
										<th width="8%">שם מלא</th>
										<th width="7%">תפקיד</th>
										<th width="10%">שם עיר</th>
									    <th width="8%">מספר קלפי</th>
										<th width="7%">משמרת</th>
										<th width="7%">נייד</th>
										<th width="12%">הודעה אחרונה נשלחה</th>
										<th width="11%">מס' הודעות נשלחו</th>
										<th width="9%">משתמש משבץ</th>
										<th width="11%">סמן להודעת SMS <input type="checkbox" title="סמן להודעת SMS" disabled={!this.filteredData} checked={this.state.checkAllChecked?true:false} onChange={this.checkAllChange.bind(this)} /></th>
										<th width="9%">בטל שיבוץ</th>
									</tr>
								</thead>
							</table>
						<div className="activists-short-table">
						<table className="table line-around table-striped nomargin table-activists-not-verfied" >
                            <tbody>
                            {
								(this.filteredData)?
										this.filteredData.map(function(item , index){
											// if(index < ((self.state.currentPage-1)*self.itemsPerPage) || index >= (self.state.currentPage*self.itemsPerPage)){return;}
											return (
													 <tr key={index}>
														<td width="7%"><a className="cursor-pointer" target="_blank" href={baseURL + 'elections/activists/' + item.voter_key + '/' + item.election_role_key} >{item.personal_identity}</a></td>
														<td width="8%"><a className="cursor-pointer" target="_blank" href={baseURL + 'elections/voters/' + item.voter_key} >{item.first_name + ' ' + item.last_name}</a></td>
														<td width="7%">{item.election_role_name}</td>
														<td width="10%">{item.ballot_city_name}</td>
														<td width="8%">{(item.mi_id+'').substr(0 , (item.mi_id+'').length-1) + "." +(item.mi_id+'').substr(-1) }</td>
														<td width="7%">{item.role_shift_name}</td>
														<td width="7%">{item.phone_number}</td>
														<td width="12%">{item.last_message ? (item.last_message.created_at.split(' ')[1].substr(0,5) + ' ' + item.last_message.created_at.split(' ')[0].split("-").reverse().join("/") ) : "-"}</td>
														<td width="11%">{item.messages_count}</td>
														<td width="9%">{item.creating_user_full_name}</td> 
														<td  width="11%" className="text-center"><input type="checkbox"   title="סמן להודעת SMS" checked={item.checkedSMS?true:false} onChange={self.tableCheckboxChange.bind(self , item.id)} /></td>
														<td  width="9%" className="text-center">
															<a title="בטל שיבוץ" className="cursor-pointer" onClick={self.showHideConfirmDeleteDlg.bind(self , item.role_shift_key , true   )}>
																<span className="glyphicon glyphicon-trash green-icon" aria-hidden="true"></span>
															</a>
														</td>
													</tr>
												)
										})
								:
								<tr><td colSpan="11" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>
							}
                            </tbody>
                        </table>
						</div>
                </div>
				<div style={{marginTop:'20px'}}></div>
				{
					/* {(this.filteredData ) && 
						<Pagination resultsCount={this.filteredData.length}
							displayItemsPerPage={this.itemsPerPage}
							currentPage={this.state.currentPage}
							navigateToPage={this.navigateToPage.bind(this)} />
					} */
				}
			 </div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		missedData: state.elections.votesDashboardScreen.missedData,
		loadingMoreMissedActivists: state.elections.votesDashboardScreen.loadingMoreMissedActivists,
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
export default connect(mapStateToProps)(withRouter(MissedActivists));