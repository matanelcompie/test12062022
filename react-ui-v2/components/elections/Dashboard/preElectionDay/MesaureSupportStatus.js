import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import {numberWithCommas} from 'libs/globalFunctions';

class MesaureSupportStatus extends React.Component {
    constructor(props) {
        super(props);
        this.initConstants();
    }

    initConstants() {
       this.lineStyle={borderBottom:'#CCCCCC solid 1px' ,   padding:'0 10px' , margin:'0 -20px'};
    }

	/*
		Handles change of combo item value
	*/
	changeComboItemValue(comboName , e){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'measureSupportScreen' ,  fieldName:comboName , fieldValue : {selectedValue:e.target.value , selectedItem:e.target.selectedItem} });
	}
	
	/*
		Handles clicking on "support statuses change report link"
	*/
	gotoSupportStatusChangeReport(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'measureSupportScreen' ,  fieldName:'isClickedGotoSupportStatusChangeReport' , fieldValue : true });
		this.props.router.push('elections/reports/support_status_change');
	}

	/*
		function that sums support statuses count by its fileds names
	*/
	summarizeSupportStatuses(theArray,firstSupportStatusName , secondSupportStatusName){
		let result = 0 ;
		if(theArray[firstSupportStatusName] && theArray[secondSupportStatusName]){
			result = parseInt(theArray[firstSupportStatusName]) +  parseInt(theArray[secondSupportStatusName]) ;
		}
		return numberWithCommas(result);
	}
  
    render() {
        const disabledChangePeriod = (!this.props.measureSupportScreen.selectedTimePeriod.selectedItem ||
            !this.props.measureSupportScreen.selectedSupportStatusType.selectedItem ||
            this.props.measureSupportScreen.resultsArray == null);

            return (<div>
						 <div className="dtlsBox-vote-dashboard madad-box">
                                <div className="row" style={this.lineStyle}>
                                    <div className="col-md-6 panelTitle text-right no-padding" >מדד עדכון תמיכה</div>
                                    <div className="left-panet-title col-md-6 text-left no-padding">
						 
											<label  htmlFor="period">תקופה</label>
											<div   style={{paddingRight:'4px'}}>
												<Combo className="select-medium" items={this.props.measureSupportScreen.timePeriods}  onChange={this.changeComboItemValue.bind(this , 'selectedTimePeriod')}  
														value={this.props.measureSupportScreen.selectedTimePeriod.selectedValue}  itemIdProperty="id" itemDisplayProperty='name'   />
											</div>
											<div>
												<button title="הצג" type="button" className="btn btn-primary btn-xs" disabled={disabledChangePeriod} onClick={this.props.getMeasurementsStatuses.bind(this)}>הצג</button>
											</div>
                                    </div>
                                </div>
                                <div className="status-change-panel">
								{(this.props.measureSupportScreen.selectedTimePeriod.selectedItem && this.props.measureSupportScreen.resultsArray != null) && <div className="panelTitle"><a style={{cursor:'pointer'}} onClick={this.gotoSupportStatusChangeReport.bind(this)}  title="דוח שינוי סטטוסים">דוח שינוי סטטוסים</a> </div>}
                                    <div className="left-panet-title">

											<label htmlFor="status-tupe"  >סוג סטטוס</label>
											<div style={{  paddingRight:'2px'}}> 
												<Combo className="select-medium" items={this.props.measureSupportScreen.supportStatuses}  onChange={this.changeComboItemValue.bind(this , 'selectedSupportStatusType')}  
														value={this.props.measureSupportScreen.selectedSupportStatusType.selectedValue}  itemIdProperty="id" itemDisplayProperty='name'   />
											</div>
											<div>
												<button title="הצג" type="button" className="btn btn-primary btn-xs" disabled={disabledChangePeriod} onClick={this.props.getMeasurementsStatuses.bind(this)}>הצג</button>
											</div>
                                    </div>
                                    {this.props.measureSupportScreen.resultsArray == null ? <i className="fa fa-spinner fa-spin"></i>  : <div className="col-lg-12 nopadding">
                                        <table className="table-support-update">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>לא תומך</th>
                                                    <th>פוטנציאל</th>
                                                    <th>תומך</th>
                                                    <th>טופלו</th>
                                                    <th>סך פעולות</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td><img src={window.Laravel.baseURL+"Images/uodate-up-icon.png"} alt="עלייה" /></td>
                                                <td className="green-numbers pink-bg">{this.summarizeSupportStatuses(this.props.measureSupportScreen.resultsArray.summary , 'sum_support_status1_up' , 'sum_support_status2_up')}</td>
                                                <td className="green-numbers gray-bg">{this.summarizeSupportStatuses(this.props.measureSupportScreen.resultsArray.summary , 'sum_support_status3_up' , 'sum_support_status4_up')}</td>
                                                <td className="green-numbers light-blue-bg">{this.summarizeSupportStatuses(this.props.measureSupportScreen.resultsArray.summary , 'sum_support_status5_up' , 'sum_support_status6_up')}</td>
                                                <td rowSpan="2">{this.props.measureSupportScreen.resultsArray.summary.sum_voters_handled ? numberWithCommas(this.props.measureSupportScreen.resultsArray.summary.sum_voters_handled) : 0}</td>
                                                <td rowSpan="2">{this.props.measureSupportScreen.resultsArray.summary.sum_total_activity? numberWithCommas(this.props.measureSupportScreen.resultsArray.summary.sum_total_activity) : 0}</td>
                                            </tr>
                                            <tr>
                                                <td><img src={window.Laravel.baseURL+"Images/uodate-down-icon.png"} alt="ירידה" /></td>
                                                <td className="red-numbers  pink-bg">{this.summarizeSupportStatuses(this.props.measureSupportScreen.resultsArray.summary , 'sum_support_status1_down' , 'sum_support_status2_down')}</td>
                                                <td className="red-numbers gray-bg">{this.summarizeSupportStatuses(this.props.measureSupportScreen.resultsArray.summary , 'sum_support_status3_down' , 'sum_support_status4_down')}</td>
                                                <td className="red-numbers light-blue-bg">{this.summarizeSupportStatuses(this.props.measureSupportScreen.resultsArray.summary , 'sum_support_status5_down' , 'sum_support_status6_down')}</td>

                                            </tr>
                                            </tbody>
                                        </table>
									
                                    </div>
									}
                                </div>
                            </div>
			        </div>
					);
    }
}

function mapStateToProps(state) {
    return {
		 measureSupportScreen:state.elections.preElectionsDashboard.measureSupportScreen,
    }
}

export default connect(mapStateToProps) (withRouter(MesaureSupportStatus));