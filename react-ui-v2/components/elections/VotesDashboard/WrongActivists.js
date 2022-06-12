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

class WrongActivists extends React.Component {

	constructor(props) {
		super(props);
		this.state={
			showConfirmDeleteDlg:false,
			rowKeyToDelete:null,
		};
		this.initConstants();
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.screenName = "פעילים שדיווחו התייצבות שגויה";
		this.confirmModalTitle = "אישור מחיקה";
		this.confirmModalContent = "האם למחוק את השורה??";
		this.textRightStyle={textAlign:'right'};
	}

	componentWillMount() {
		let params={};
	 
		if(this.props.entityType != null && this.props.entityKey != null){
			params.entity_type = this.props.entityType;
			params.entity_key = this.props.entityKey;
		}
		params.hot_ballots=this.props.hotBallots;
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.screenName });
		 ElectionsActions.getVoterDashboardWrongActivists(this.props.dispatch , params);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions['elections.votes.dashboard'] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}
	
	/*
		This function redirects to enrolled activists lists with filter option - by verified/arrived/reporting
	*/
	gotoEnrolledActivists(filterName){
		this.props.router.push('elections/votes/dashboard/enrolled');
	}
	
	getPercentNumber(fromNumber , toNumber){
		if(!fromNumber || !toNumber){
			return 0;
		}
		let result =  (parseInt(fromNumber)*100)/parseInt(toNumber);
		return (Math.round(result*100)/100);
	}
	
	componentWillUnmount(){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'wrongActivistsFilterName' , fieldValue: ''});
	}
	
	/*
		Handles showing/hiding delete confirmation modal dialog - by params
	*/
	showHideConfirmDeleteDlg(rowKey , isShow){
		this.setState({showConfirmDeleteDlg:isShow , rowKeyToDelete:rowKey});
	}
	
	/*
		Handles real deleting of wrong cell phone row
	*/
	doDeleteAction(){
		let keyToDelete = this.state.rowKeyToDelete;
		let data = {};
		if(this.props.entityType != null && this.props.entityKey != null){
			data.entity_type = this.props.entityType;
			data.entity_key = this.props.entityKey;
		}
		ElectionsActions.deleteWrongRowByKey(this.props.dispatch , keyToDelete,data);
		this.showHideConfirmDeleteDlg(null,false);
	}
	
	/*
		Fix wrong row ballot box id
	*/
	doFixAction(keyToDelete){
		let data = {};
		if(this.props.entityType != null && this.props.entityKey != null){
			data.entity_type = this.props.entityType;
			data.entity_key = this.props.entityKey;
		}
		ElectionsActions.fixExistingWrongRowByKey(this.props.dispatch , keyToDelete,data);
	}
	
	formatMiID(mi_id){
		if(!mi_id){
			return '';
		}
		if(mi_id.length == 1){
			return mi_id;
		}
		return mi_id.substr(0 , mi_id.length-1)+"." + mi_id[mi_id.length-1];
	}

	
	

	render() {
		 
		let self = this;
		let baseURL = window.Laravel.baseURL;
		return (<div>
					<TopCommonHeader screenName={this.screenName} />
					<div style={{marginTop:'20px'}}></div>
					{this.state.showConfirmDeleteDlg && 
						<ModalWindow title={this.confirmModalTitle} show={this.state.showConfirmDeleteDlg} buttonOk={this.doDeleteAction.bind(this)} buttonCancel={this.showHideConfirmDeleteDlg.bind(this , null , false)} buttonX={this.showHideConfirmDeleteDlg.bind(this , null , false)}>
							<div>{this.confirmModalContent}</div>
						</ModalWindow>
					}
					{this.props.wrongActivistsFilterName != 'ballots' && <div className="dtlsBox srchRsltsBox box-content margin-top20" style={{minHeight:'275px'}}>
						<div className="blue-title nopadding">מספר נייד מדווח לא מתאים לשיבוץ</div>
							<table className="table line-around table-striped nomargin table-activists-not-verfied">
								<thead>
									<tr className="header-activists-table">
									<th width="12%">נייד</th>
									<th>התקבל בדיווח</th>
									<th className="text-center" width="15%"> אל תציג שוב דיווח זה</th>
								</tr>
								</thead>
							</table>
							<div className="activists-short-table">
								<table className="table line-around table-striped nomargin table-activists-not-verfied">
									<tbody>
										{
											this.props.wrongData.wrong_phones ? 
												this.props.wrongData.wrong_phones.map(function(item , index){
													return (<tr key={"wrongPhone"+index}>
																<td width="12%">{item.phone_number}</td>
																<td>{item.message}</td>
																<td className="text-center" width="10%"><a title="אל תציג שוב דיווח זה" className="cursor-pointer" onClick={self.showHideConfirmDeleteDlg.bind(self , item.key , true)}>
																	<span className="glyphicon glyphicon-trash green-icon" aria-hidden="true"></span>
																	</a>
																</td>
															</tr>)
												})
												:
												<tr><td colSpan="3" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>
										}
									</tbody>
								</table>
							</div>
						</div>
					}
						<div style={{marginTop:'20px'}}></div>
				
				{this.props.wrongActivistsFilterName != 'phones' && <div className="dtlsBox srchRsltsBox box-content margin-top40 margin-bottom40"  style={{minHeight:'275px'}}>
							<div className="blue-title nopadding">מספר קלפי התייצבות לא מתאים לשיבוץ</div>
							<table className="table line-around table-striped nomargin table-activists-not-verfied">
								<thead>
									<tr className="header-activists-table">
										<th width="10%" style={this.textRightStyle}>תאריך דיווח</th>
										<th width="14%" style={this.textRightStyle}>נייד</th>
										<th width="19%" style={this.textRightStyle}>התקבל בדיווח</th>
										<th width="18%" style={this.textRightStyle}>שם הפעיל</th>
										<th width="15%" style={this.textRightStyle}>עיר הקלפי</th>
										<th width="15%" width="8%"   style={this.textRightStyle}>קלפי נכונה </th>
										<th  className="text-center" width="15%" style={this.textRightStyle}>עדכן לקלפי הנכונה</th>
									</tr>
								</thead>
							</table>
							<div className="activists-short-table">
								<table className="table line-around table-striped nomargin table-activists-not-verfied">
									<tbody>
										{
											this.props.wrongData.wrong_ballots ? 
												this.props.wrongData.wrong_ballots.map(function(item , index){
													return (<tr key={"wrongBallots"+index}>
															    <td width="10%" style={self.textRightStyle}>{item.created_at.split(' ')[0].split("-").reverse().join("/")}</td>
																<td width="14%" style={self.textRightStyle}>{item.phone_number || "-"}</td>
																<td width="20%" style={self.textRightStyle}>{item.message}</td>
																<td width="18%" style={self.textRightStyle}>{item.activist_name}</td>
																<td width="16%" style={self.textRightStyle}>{item.ballot_box_city}</td>
																<td style={self.textRightStyle} width="8%">{self.formatMiID(item.mi_id+'')}</td>
																<td  width="15%" className="text-center" style={self.textRightStyle}>
																{item.ballot_box_id && 
																	<button  className="btn btn-primary" onClick={self.doFixAction.bind(self,item.key)}>מחק דיווח</button>
															 
																}
																</td>
															</tr>)
												})
												:
												<tr><td colSpan="4" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr>
										}
									</tbody>
								</table>
							</div>
						</div>
				}
			 </div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		wrongData: state.elections.votesDashboardScreen.wrongData,
		wrongActivistsFilterName: state.elections.votesDashboardScreen.wrongActivistsFilterName,
		entityType: state.elections.votesDashboardScreen.entityType,
		entityKey: state.elections.votesDashboardScreen.entityKey,
		hotBallots: state.elections.votesDashboardScreen.hotBallots,
	}
}
export default connect(mapStateToProps)(withRouter(WrongActivists));