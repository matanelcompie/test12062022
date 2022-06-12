import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
import ModalWindow from '../../global/ModalWindow';
import TopHeaderSearch from './TopHeaderSearch';
import VotesLineGraph from './VotesLineGraph';
import store from '../../../store';
import {withCommas} from 'libs/globalFunctions';
import constants from 'libs/constants';

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

class VotesDashboard extends React.Component {

	constructor(props) {
		super(props);
		this.initConstants();
	}

	/*
	function that initializes constant variables 
	*/
	initConstants() {
		this.screenName = "בקרת פעילי יום בחירות";
		this.redSquareStyle = { }
		this.redSquareStyleAHref = {color:'#ff0000'};
		this.orangeSquareStyleAHref = {color:'#fd6a02'};
		this.greyColorFinalRow = {backgroundColor:'#888888' , fontWeight:'bold' , color:'yellow' , fontSize:'20px'};
		this.screenPermission = 'elections.votes.dashboard';
		this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
	}

	componentWillMount() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.screenName });
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
		// this.initialState = {
		// 	currentShift: 'allShifts'
		// }
		// this.setState(this.initialState);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && nextProps.currentUser.permissions[this.screenPermission] != true && this.props.currentUser.first_name.length > 1) {
			this.props.router.replace('/unauthorized');
		}
	}
	
	/*
		This function redirects to enrolled activists lists with filter option - by verified/arrived/reporting
	*/
	gotoEnrolledActivists(filterName  , roleShiftSystemName , election_role_system_name = null){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'enrolledActivistsFilterName' , fieldValue: filterName});
		switch(election_role_system_name){
			case constants.electionRoleSytemNames.ballotMember:
					this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedBallotMemberRole' , fieldValue: 1});
					this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedObserverRole' , fieldValue: 0});
				break;
			case constants.electionRoleSytemNames.observer:
					this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedObserverRole' , fieldValue: 1});
					this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedBallotMemberRole' , fieldValue: 0});
				break;
			default:
					this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedBallotMemberRole' , fieldValue: 1});
					this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedObserverRole' , fieldValue: 1});
				break;
		}
		switch(roleShiftSystemName){
			case this.roleShiftsSytemNames.first:
				this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedFirstShift' , fieldValue: 1});
				break;
			case this.roleShiftsSytemNames.second:
				this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedSecondShift' , fieldValue: 1});
				break;
			case this.roleShiftsSytemNames.allDay:
				this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedAllShifts' , fieldValue: 1});
				break;
			case this.roleShiftsSytemNames.count:
				this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedCountShift' , fieldValue: 1});
				break;
		}
		this.props.router.push('elections/votes/dashboard/enrolled');
	}
	
	/*
		This function redirects to missed activists lists with role shift option - first/second/all
	*/
	gotoMissedActivists(roleShiftName){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:roleShiftName , fieldValue: 1});
		this.props.router.push('elections/votes/dashboard/missed');
	}
	
	/*
		This function redirects to unverified activists lists with role shift option - first/second/all with verified status type - didn't answer or refused
	*/
	gotoUnverifiedActivists(roleShiftName , verifiedStatusName){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:roleShiftName , fieldValue: 1});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'unverifiedActivistsStatusName' , fieldValue: verifiedStatusName});
		this.props.router.push('elections/votes/dashboard/unverified');
	}
	
	/*
		This function redirects to wrong phones/ballots report page
	*/
	redirectToWrongActivists(wrongActivistsFilterName){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'wrongActivistsFilterName' , fieldValue: wrongActivistsFilterName});
		this.props.router.push('elections/votes/dashboard/wrong');
	}
	
	getPercentNumber(fromNumber , toNumber){
		if(!fromNumber || !toNumber){
			return 0;
		}
		let result =  (parseInt(fromNumber)*100)/parseInt(toNumber);
		return (Math.round(result*100)/100);
	}
	/*
	calculateTotalOfTotalsRow(){
		this.totalEnrolledCount = 0;
		this.totalVerifiedCount=0;
		this.totalArrivedCount = 0;
		this.totalReportingCount = 0;
		this.totalStoppedReportingCount = 0;
		for(let i = 0 ; i<this.props.mainScreenData.roles_summary.length ; i++){
			this.totalEnrolledCount += parseInt(this.props.mainScreenData.roles_summary[i].total_enrolled_count);
			this.totalVerifiedCount += parseInt(this.props.mainScreenData.roles_summary[i].total_enrolled_verified_count);
			this.totalArrivedCount += parseInt(this.props.mainScreenData.roles_summary[i].all_arrived_role_voters);
			this.totalReportingCount += parseInt(this.props.mainScreenData.roles_summary[i].all_reporting_role_voters);
			this.totalStoppedReportingCount += parseInt(this.props.mainScreenData.roles_summary[i].all_not_reporting_30mins_count);
			
		}
	}
	*/
	changeRoleShiftCheckBox(selectedShift){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'currentShift' , fieldValue: selectedShift});
	}
	renderRolesSummaryRows(rolesShiftsCountsHash, systemNamesHash){

		let rolesSummaryRows = [];
		for (let system_name in systemNamesHash){

			let innerItemTotalCounts = rolesShiftsCountsHash[system_name];
			rolesSummaryRows.push(
				<tr key={system_name}>
				<td>{systemNamesHash[system_name]}</td>
				<td>{innerItemTotalCounts.enrolled_count}</td>
				<td><a className="cursor-pointer" onClick={innerItemTotalCounts.verified_count ? this.gotoEnrolledActivists.bind(this,'verified'  , system_name ) : null}>{innerItemTotalCounts.verified_count}</a></td>
				<td>{this.getPercentNumber(innerItemTotalCounts.verified_count ,innerItemTotalCounts.enrolled_count)}%</td>
				<td width="5%" ><div style={this.redSquareStyle}><a className="cursor-pointer" style={this.redSquareStyleAHref} onClick={(parseInt(innerItemTotalCounts.enrolled_count) - parseInt(innerItemTotalCounts.verified_count) > 0 ) ? this.gotoEnrolledActivists.bind(this,'unverified'  , system_name ) : null}>{parseInt(innerItemTotalCounts.enrolled_count) - parseInt(innerItemTotalCounts.verified_count)}</a></div></td>
				
				<td><a className="cursor-pointer" onClick={innerItemTotalCounts.arrived_count ? this.gotoEnrolledActivists.bind(this,'arrived' , system_name ) : null}>{innerItemTotalCounts.arrived_count}</a></td>
				
				<td>{this.getPercentNumber(innerItemTotalCounts.arrived_count ,innerItemTotalCounts.enrolled_count)}%</td>
				<td>{innerItemTotalCounts.arrived_count_sms}</td>
				<td>{innerItemTotalCounts.arrived_count_mobile}</td>
				<td>{innerItemTotalCounts.arrived_count_ivr}</td>
				<td width="5%"><div style={this.redSquareStyle}><a className="cursor-pointer"  style={this.redSquareStyleAHref} onClick={( parseInt(innerItemTotalCounts.enrolled_count) - parseInt(innerItemTotalCounts.arrived_count) > 0 )? this.gotoEnrolledActivists.bind(this,'unarrived' , system_name ) : null}>{parseInt(innerItemTotalCounts.enrolled_count) - parseInt(innerItemTotalCounts.arrived_count)}</a></div></td>
				<td><a className="cursor-pointer" onClick={innerItemTotalCounts.reporting_count ? this.gotoEnrolledActivists.bind(this,'reporting' , system_name ) : null}>{innerItemTotalCounts.reporting_count}</a></td>
				<td>{this.getPercentNumber(innerItemTotalCounts.reporting_count ,innerItemTotalCounts.enrolled_count)}%</td>
				
				<td width="5%"><div style={this.redSquareStyle}><a className="cursor-pointer"  style={this.redSquareStyleAHref} onClick={(parseInt(innerItemTotalCounts.arrived_count) - parseInt(innerItemTotalCounts.reporting_count) > 0) ? this.gotoEnrolledActivists.bind(this,'notreporting' , system_name ) : null}>{parseInt(innerItemTotalCounts.arrived_count) - parseInt(innerItemTotalCounts.reporting_count)}</a></div></td>
				<td width="5%"><div style={this.orangeSquareStyleAHref }>{innerItemTotalCounts.not_reporting_30mins_count}</div></td>
			</tr>
			)
		}
		return rolesSummaryRows;
	}
	renderRolesSummary(){
		let systemNamesList = [];
		const roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
		switch(this.props.currentShift){
			case 'firstShift':
					systemNamesList =[roleShiftsSytemNames.first, roleShiftsSytemNames.allDay]
				break;
			case 'secondShift':
					systemNamesList =[roleShiftsSytemNames.second, roleShiftsSytemNames.allDay]
				break;
			case 'countShift':
					systemNamesList =[roleShiftsSytemNames.count, roleShiftsSytemNames.allDay]
				break;
			case 'allShifts':
			default:
				systemNamesList =[roleShiftsSytemNames.first, roleShiftsSytemNames.second, roleShiftsSytemNames.allDay, roleShiftsSytemNames.count]

		}
			let countsFields = [
				'enrolled_count', 'verified_count', 'arrived_count', 'arrived_count_sms',
				'arrived_count_mobile', 'arrived_count_ivr', 'reporting_count', 'not_reporting_30mins_count'
			]
			let systemNamesHash = {};

			let rolesShiftsCountsHash = {}
			let rolesShiftsTotalCountsHash = {}
			this.props.mainScreenData.roles_summary.forEach((item,index) => {
						item.role_shifts.forEach((innerItem) => {
							if(systemNamesList.indexOf(innerItem.system_name)!= -1){ // Check if need to display this shift
								systemNamesHash[innerItem.system_name] = innerItem.name;
								if(!rolesShiftsCountsHash[innerItem.system_name]) { rolesShiftsCountsHash[innerItem.system_name] = {}}
								countsFields.forEach((title) => {
									if(!rolesShiftsCountsHash[innerItem.system_name][title]) { rolesShiftsCountsHash[innerItem.system_name][title] = 0}
									if(!rolesShiftsTotalCountsHash[title]) { rolesShiftsTotalCountsHash[title] = 0}
	
									let cnt = innerItem[title] ? parseInt(innerItem[title]) : 0;
									rolesShiftsCountsHash[innerItem.system_name][title] += cnt
									rolesShiftsTotalCountsHash[title] += cnt
								})
							}

						})
			})
			return (
				<tbody>
					{this.renderRolesSummaryRows(rolesShiftsCountsHash, systemNamesHash)}
					<tr key="totalOfTotals">
						
						<th style={this.greyColorFinalRow}>סה"כ*</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.enrolled_count )}</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.verified_count )}</th>
						<th style={this.greyColorFinalRow}>{this.getPercentNumber(rolesShiftsTotalCountsHash.verified_count, rolesShiftsTotalCountsHash.enrolled_count)}%</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.enrolled_count - rolesShiftsTotalCountsHash.verified_count )}</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.arrived_count )}</th>
						
						<th style={this.greyColorFinalRow} colSpan="4">{this.getPercentNumber((rolesShiftsTotalCountsHash.arrived_count ),(rolesShiftsTotalCountsHash.enrolled_count  ) )}%</th>
						
						<th style={this.greyColorFinalRow}>{withCommas((rolesShiftsTotalCountsHash.enrolled_count )-(rolesShiftsTotalCountsHash.arrived_count))}</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.reporting_count)}</th>
						<th style={this.greyColorFinalRow}>{this.getPercentNumber((rolesShiftsTotalCountsHash.reporting_count),(rolesShiftsTotalCountsHash.enrolled_count ))}%</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.arrived_count -(rolesShiftsTotalCountsHash.reporting_count))}</th>
						<th style={this.greyColorFinalRow}>{withCommas(rolesShiftsTotalCountsHash.not_reporting_30mins_count )}</th>
					</tr>

				</tbody>

			) 

	}
	render() {
		// if(this.props.mainScreenData.roles_summary){
		// 	this.calculateTotalOfTotalsRow();
		// }
		if(!Object.size(this.props.mainScreenData) && !this.props.loadingMainScreenScreen){
			return <div>
					<div className="row">
						<div className="col-md-6 text-right">
							<h1>{this.screenName}</h1>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-12">
							<TopHeaderSearch   />
						</div>
					</div>
					</div>
		}
		let baseURL = window.Laravel.baseURL;
		let currentShift = this.props.currentShift
		return (<div>
					<div className="row">
						<div className="col-md-6 text-right">
							<h1>{this.screenName} </h1>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-12">
							<TopHeaderSearch  />
						</div>
					</div>
					<div className="contentContainer display-activists" style={{margin:'20px 0px 0px 0px', maxWidth:'700px'}}>
						<div className="row nomargin">
								<div className="col-md-1">הצג:</div>
								<div className="col-md-2">
									<input type="radio" title="כל היום " name="currentShift" onChange={this.changeRoleShiftCheckBox.bind(this , 'allShifts')}  checked={currentShift == 'allShifts'} />&nbsp;
									כל היום</div>
								<div className="col-md-3">
									<input type="radio" title="משמרת א' " name="currentShift" onChange={this.changeRoleShiftCheckBox.bind(this , 'firstShift')} checked={currentShift == 'firstShift'} />&nbsp;
									משמרת א'</div>
								<div className="col-md-3">
									<input type="radio" title="משמרת ב' " name="currentShift" onChange={this.changeRoleShiftCheckBox.bind(this , 'secondShift')} checked={currentShift == 'secondShift'} />&nbsp;
									משמרת ב'</div>
								<div className="col-md-3">
									<input type="radio" title="משמרת ספירה" name="currentShift" onChange={this.changeRoleShiftCheckBox.bind(this , 'countShift')} checked={currentShift == 'countShift'} />&nbsp;
									משמרת ספירה</div>
						</div>
					</div>
					<div className="row" style={{marginTop:'20px'}}></div>
					<div className="dtlsBox srchRsltsBox box-content" style={{minHeight:'300px'}}>
						<table className="table-summary-dashboard  table-activists">
							<thead>
								<tr>
									{/* <td> תפקיד</td> */}
									<td>משמרת </td>
									<td>משובצים</td>
									<td colSpan="2">אישרו שיבוץ</td>
									<td width="5%">לא אישרו</td>
									<td colSpan="2"> התייצבו </td>
									<td width="3%">S</td>
									<td width="3%">M</td>
									<td width="3%">I</td>
									<td width="5%">לא התייצבו</td>
									<td colSpan="2">מדווחים  </td>
									<td width="5%">לא מדווחים</td>
									<td  width="5%">חצי שעה</td>
								</tr>
							</thead>

				{ this.props.mainScreenData.roles_summary ? this.renderRolesSummary()
					:
					<tbody><tr><td colSpan="16" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</td></tr></tbody>
				}
							
		
                    </table>
					<div style={{color:'#ff0000' , textAlign:'right'}}>
					* 
					בשורת סה"כ כל פעיל נמנה פעם יחידה
					</div>
                </div>
				
				<div className="row">
                    <div className="col-md-3 nopadding">
                        <div className="contentContainer activists-bottom-reports">
                            <table className="table-activists-bottom reports-received">
                                <thead>
                                    <tr>
                                        <td colSpan="2"> דיווחי הצבעה</td>
                                    </tr>
                                </thead>
                                <tbody>
								<tr>
                                    <td width="70%">סה"כ הצבעות במערכת</td>
                                    <td className="numbers-activists-table">{(this.props.mainScreenData.all_votes_count_today ) ? withCommas(this.props.mainScreenData.all_votes_count_today) : (this.props.mainScreenData.all_votes_count_today == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</td>
                                </tr>
                                <tr>
                                    <td width="70%">מפעילי קלפיות</td>
                                    <td className="numbers-activists-table">{(this.props.mainScreenData.activists_reports_count_today ) ? withCommas(this.props.mainScreenData.activists_reports_count_today) : (this.props.mainScreenData.activists_reports_count_today == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</td>
                                </tr>
                                <tr>
                                    <td width="70%">בשעה האחרונה מפעילים</td>
                                    <td className="numbers-activists-table">{(this.props.mainScreenData.activists_reports_count_last_hour   ) ? withCommas(this.props.mainScreenData.activists_reports_count_last_hour) : (this.props.mainScreenData.activists_reports_count_last_hour == 0 ? "0" : <i className="fa fa-spinner fa-spin"></i>)}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
					
                    <div className="col-md-6">
                        <div className="contentContainer activists-bottom-reports">
                            <table className="table-activists-bottom activists-not-reported">
                                <thead>
                                <tr>
                                    <td width="55%"> פעילים לא מדווחים</td>
                                    <td className="time-activists"> א'</td>
                                    <td className="time-activists"> ב'</td>
                                    <td className="time-activists">כל היום</td>
                                    <td className="time-activists">ספירה</td>

                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>פעילים לא אישרו שיבוץ</td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.unverified_activists_first_shift ?  this.gotoUnverifiedActivists.bind(this,'checkedFirstShift' , 'unverified') : null}>{(this.props.mainScreenData.unverified_activists_first_shift ) ? withCommas(this.props.mainScreenData.unverified_activists_first_shift) : (this.props.mainScreenData.unverified_activists_first_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.unverified_activists_second_shift ? this.gotoUnverifiedActivists.bind(this,'checkedSecondShift' , 'unverified') : null}>{(this.props.mainScreenData.unverified_activists_second_shift ) ? withCommas(this.props.mainScreenData.unverified_activists_second_shift) : (this.props.mainScreenData.unverified_activists_second_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.unverified_activists_allday_shift ? this.gotoUnverifiedActivists.bind(this,'checkedAllShifts' , 'unverified') : null}>{(this.props.mainScreenData.unverified_activists_allday_shift ) ? withCommas(this.props.mainScreenData.unverified_activists_allday_shift) : (this.props.mainScreenData.unverified_activists_allday_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.unverified_activists_count_shift ? this.gotoUnverifiedActivists.bind(this,'checkedCountShift' , 'unverified') : null}>{(this.props.mainScreenData.unverified_activists_count_shift ) ? withCommas(this.props.mainScreenData.unverified_activists_count_shift) : (this.props.mainScreenData.unverified_activists_count_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                </tr>
                                <tr>
                                    <td>פעילים השיבו סירוב</td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.refused_activists_first_shift ? this.gotoUnverifiedActivists.bind(this,'checkedFirstShift' , 'refused') : null}>{(this.props.mainScreenData.refused_activists_first_shift ) ? withCommas(this.props.mainScreenData.refused_activists_first_shift) : (this.props.mainScreenData.refused_activists_first_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.refused_activists_second_shift ? this.gotoUnverifiedActivists.bind(this,'checkedSecondShift' , 'refused') :null}>{(this.props.mainScreenData.refused_activists_second_shift ) ? withCommas(this.props.mainScreenData.refused_activists_second_shift) : (this.props.mainScreenData.refused_activists_second_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.refused_activists_allday_shift ? this.gotoUnverifiedActivists.bind(this,'checkedAllShifts' , 'refused') : null}>{(this.props.mainScreenData.refused_activists_allday_shift ) ? withCommas(this.props.mainScreenData.refused_activists_allday_shift) : (this.props.mainScreenData.refused_activists_allday_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.refused_activists_count_shift ? this.gotoUnverifiedActivists.bind(this,'checkedCountShift' , 'refused') : null}>{(this.props.mainScreenData.refused_activists_count_shift ) ? withCommas(this.props.mainScreenData.refused_activists_count_shift) : (this.props.mainScreenData.refused_activists_count_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                </tr>
                                <tr>
                                    <td>פעילים לא דיווחו הגעה</td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.missed_activists_first_shift ? this.gotoMissedActivists.bind(this,'checkedFirstShift') : null}>{(this.props.mainScreenData.missed_activists_first_shift ) ? withCommas(this.props.mainScreenData.missed_activists_first_shift) : (this.props.mainScreenData.missed_activists_first_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.missed_activists_second_shift ? this.gotoMissedActivists.bind(this,'checkedSecondShift') : null}>{(this.props.mainScreenData.missed_activists_second_shift ) ? withCommas(this.props.mainScreenData.missed_activists_second_shift) : (this.props.mainScreenData.missed_activists_second_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.missed_activists_allday_shift ? this.gotoMissedActivists.bind(this,'checkedAllShifts') : null}>{(this.props.mainScreenData.missed_activists_allday_shift ) ? withCommas(this.props.mainScreenData.missed_activists_allday_shift) : (this.props.mainScreenData.missed_activists_allday_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.missed_activists_count_shift ? this.gotoMissedActivists.bind(this,'checkedCountShift') : null}>{(this.props.mainScreenData.missed_activists_count_shift ) ? withCommas(this.props.mainScreenData.missed_activists_count_shift) : (this.props.mainScreenData.missed_activists_count_shift == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-md-3 nopadding">
                        <div className="contentContainer activists-bottom-reports">
                            <table className="table-activists-bottom error-stabilization">
                                <thead>
                                <tr>
                                    <td colSpan="2"> התייצבות שגויה</td>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td width="93%">טלפון מדווח שגוי</td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.wrong_phones ? this.redirectToWrongActivists.bind(this,'phones' ) : null}>{(this.props.mainScreenData.wrong_phones ) ? withCommas(this.props.mainScreenData.wrong_phones) : (this.props.mainScreenData.wrong_phones == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                </tr>
                                <tr>
                                    <td>פעילים שדיווחו התייצבות שגויה</td>
                                    <td className="numbers-activists-table"><a className="cursor-pointer" onClick={this.props.mainScreenData.wrong_ballots ? this.redirectToWrongActivists.bind(this,'ballots' ) : null}>{(this.props.mainScreenData.wrong_ballots ) ? withCommas(this.props.mainScreenData.wrong_ballots) : (this.props.mainScreenData.wrong_ballots == 0 ?  "0" : <i className="fa fa-spinner fa-spin"></i>)}</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
					<div className="contentContainer vote-reports-graph">
						<div className="blue-title nopadding">קצב דיווחי הצבעה</div>
						<div className="col-md-12 nopadding margin-top20">
						    <div style={{width:'1340px' , height:'181px' , backgroundSize: "1340px 181px" , backgroundImage:'url("'+baseURL + "Images/reports-graph1.png"+'")'}}>
								{this.props.mainScreenData.agents_performance_hourly  ?
												<VotesLineGraph data={this.props.mainScreenData.agents_performance_hourly} />
														:
												<i className="fa fa-spinner fa-spin"></i>
								}
							</div>
						</div>
					</div>
                </div> 
			 </div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		mainScreenData: state.elections.votesDashboardScreen.mainScreenData,
		currentShift: state.elections.votesDashboardScreen.currentShift,
		loadingMainScreenScreen: state.elections.votesDashboardScreen.loadingMainScreenScreen,
	}
}
export default connect(mapStateToProps)(withRouter(VotesDashboard));