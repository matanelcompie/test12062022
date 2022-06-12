import React from 'react';
import { connect } from 'react-redux';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as SystemActions from '../../../actions/SystemActions';
 

class TopActivistsFilters extends React.Component {
	
	componentWillUnmount(){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedBallotMemberRole' , fieldValue: 0});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedObserverRole' , fieldValue: 0});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedFirstShift' , fieldValue: 0});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedSecondShift' , fieldValue: 0});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedAllShifts' , fieldValue: 0});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedCountShift' , fieldValue: 0});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'enrolledActivistsFilterName' , fieldValue: ''});
	}
	
	/*
		Empty function that does nothing for event handlers
	*/
	doNop(e){}
	
	/*
		Handles clicking on "role type" checkboxes
	*/
	clickRoleTypeFilterCheckbox(index , e){
		if(index == 0){
			this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedBallotMemberRole' , fieldValue: (e.target.checked?1:0)});
		}
		else if(index == 1){
			this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'checkedObserverRole' , fieldValue: (e.target.checked?1:0)});
		}
	}
	
	/*
		Handles clicking on one of role shifts 3 checkboxes
	*/
	changeRoleShiftCombo(checkboxName , e){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:checkboxName , fieldValue: (e.target.checked?1:0)});
	}
	
	/*
		Handle changes in designed radio button of unverified activists to unverified/refused
	*/
	setUnverifiedStatus(statusName){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'unverifiedActivistsStatusName' , fieldValue: statusName});
	}

	render() {
		let baseURL = window.Laravel.baseURL;
		return ( <div className="col-md-6 nopadding">
                        <div className="contentContainer display-activists">
						{this.props.showDidntAnswer && 
							<div className="row display-activists-line nomargin">
                                    <div className="radio-button-switch col-md-12">

                                        <input name="switch" id="not-return" className="one" type="radio" checked={this.props.unverifiedActivistsStatusName == 'unverified'} onChange={this.doNop.bind(this)} onClick={this.setUnverifiedStatus.bind(this , 'unverified')} />
                                        <label htmlFor="not-return" className="label-one">
                                                        <span className="on flexed">
                                                            <span>לא החזירו מענה לאימות</span>

                                                        </span>
                                        </label>

                                        <input name="switch" id="refused" className="three" type="radio" checked={this.props.unverifiedActivistsStatusName == 'refused'} onChange={this.doNop.bind(this)} onClick={this.setUnverifiedStatus.bind(this , 'refused')} />
                                        <label htmlFor="refused" className="label-three">
                                                        <span className="off flexed">
                                                            <span className="icon-no"></span>
                                                            <span>השיבו סירוב</span>
                                                        </span>
                                        </label>
                                        <div></div>
                                        <i></i>
                                    </div>
                                 
                            </div>
							}
                            <div className="row nomargin display-activists-line">
                            <div className="col-md-1">הצג:</div>
                            <div className="col-md-3">
                                <input type="checkbox" title="חברי קלפיות" checked={this.props.checkedBallotMemberRole == 1} onClick={this.clickRoleTypeFilterCheckbox.bind(this,0)} onChange={this.doNop.bind(this)} />&nbsp;
                                חברי קלפיות</div>
                            <div className="col-md-3">
                                <input type="checkbox" title="משקיפים " checked={this.props.checkedObserverRole == 1} onClick={this.clickRoleTypeFilterCheckbox.bind(this,1)} onChange={this.doNop.bind(this)}  />&nbsp;
                                 משקיפים</div>
                            <div className="col-md-2"></div>
                            <div className="col-md-3"></div>
                        </div>

                            <div className="row nomargin ">
                                <div className="col-md-1">הצג:</div>
                                <div className="col-md-3">
                                    <input type="checkbox" title="משמרת א' " onChange={this.changeRoleShiftCombo.bind(this , 'checkedFirstShift')} checked={this.props.checkedFirstShift == 1} />&nbsp;
                                    משמרת א'</div>
                                <div className="col-md-3">
                                    <input type="checkbox" title="משמרת ב' " onChange={this.changeRoleShiftCombo.bind(this , 'checkedSecondShift')} checked={this.props.checkedSecondShift == 1} />&nbsp;
                                    משמרת ב'</div>
                                <div className="col-md-2">
                                    <input type="checkbox" title="כל היום " onChange={this.changeRoleShiftCombo.bind(this , 'checkedAllShifts')} checked={this.props.checkedAllShifts == 1} />&nbsp;
                                    כל היום</div>
                                <div className="col-md-3">
                                    <input type="checkbox" title="משמרת ספירה" onChange={this.changeRoleShiftCombo.bind(this , 'checkedCountShift')} checked={this.props.checkedCountShift == 1} />&nbsp;
                                    משמרת ספירה</div>
                            </div>
                        </div>
						</div>
		);
	}
	
	
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		checkedBallotMemberRole: state.elections.votesDashboardScreen.checkedBallotMemberRole,
		checkedObserverRole: state.elections.votesDashboardScreen.checkedObserverRole,
		checkedFirstShift: state.elections.votesDashboardScreen.checkedFirstShift,
		checkedSecondShift: state.elections.votesDashboardScreen.checkedSecondShift,
		checkedAllShifts: state.elections.votesDashboardScreen.checkedAllShifts,
		checkedCountShift: state.elections.votesDashboardScreen.checkedCountShift,
		enrolledActivistsFilterName: state.elections.votesDashboardScreen.enrolledActivistsFilterName,
		unverifiedActivistsStatusName: state.elections.votesDashboardScreen.unverifiedActivistsStatusName,
	}
}
export default connect(mapStateToProps)(TopActivistsFilters);