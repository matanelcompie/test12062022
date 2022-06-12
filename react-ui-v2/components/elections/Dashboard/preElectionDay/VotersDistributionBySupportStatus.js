import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import {numberWithCommas} from 'libs/globalFunctions';

class VotersDistributionBySupportStatus extends React.Component {
    constructor(props) {
        super(props);
    }
	
	/*
	    Redirect to areas panel screen table : 
	*/
	redirectToAreasPanel(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'selectedAreaID' , fieldValue : this.props.searchScreen.selectedArea.selectedItem.id });
		if(this.props.searchScreen.selectedSubArea.selectedItem){
			this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'selectedSubAreaID' , fieldValue : this.props.searchScreen.selectedSubArea.selectedItem.id});
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'selectedCityID' , fieldValue : this.props.searchScreen.selectedCity.selectedItem.id });
		}
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'areasPanel' ,  fieldName:'currentPage' , fieldValue : 1 });
		
		this.props.router.push('elections/dashboards/pre_elections_day/areas_panel');
	}
	
	/*
		Calculate total number of voters that have no status of entity type
	*/
	calculateWithoutSupportStatus(entity_prefix_name){
		let results = this.props.votersDistributionBySupportStatusScreen.resultDataObject ;
		let result = parseInt(results.total_voters_per_geo_filter);
		result -= (parseInt(results[entity_prefix_name+'_supporters_count']) + parseInt(results[entity_prefix_name+'_potential_count']) + parseInt(results[entity_prefix_name+'_not_supporters_count']));
		return result;
	}
	
	/*
		Calculate total number of voters of spicific status - of all entity types
	*/
	calculateBySupportStatusName(support_status_name){
		let results = this.props.votersDistributionBySupportStatusScreen.resultDataObject ;
		let result = 0;
		result += (parseInt(results['elections_'+support_status_name]) + parseInt(results['tm_'+support_status_name]) + parseInt(results['final_'+support_status_name]));
		return result;
	}
  
    render() {
			let results = this.props.votersDistributionBySupportStatusScreen.resultDataObject ;
            return (<div>
						 <div className="dtlsBox-vote-dashboard status-box">
                                <div className="top-panel-vote-dashboard row">
                                    <div className="panelTitle col-lg-9 no-padding">התפלגות תושבים לפי סטטוס תמיכה</div>
                                    <div className="status-box-left panelTitle col-lg-3 no-padding"><a style={{cursor:'pointer'}} onClick={this.redirectToAreasPanel.bind(this)} title="פאנל איזורים"> פאנל איזורים </a> </div>
                                </div>

                                <div className="status-support-panel">
                                    <table className="table-status-update">
                                        <thead>
                                        <tr>
                                            <th></th>
                                            <th>תומכים</th>
                                            <th>פוטנציאליים</th>
                                            <th>לא תומכים</th>
                                            <th>ללא סטטוס</th>

                                        </tr>
                                        </thead>
										{!results? <tbody><tr><td colSpan="5" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></td></tr></tbody> : 
										
                                        <tbody>
                                        <tr>
                                            <td className="orange-numbers orange-bg">סופי</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.final_supporters_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.final_potential_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.final_not_supporters_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(this.calculateWithoutSupportStatus('final'))}</td>

                                        </tr>
                                        <tr>
                                            <td>סה"כ</td>
                                            <td className="orange-numbers">{numberWithCommas(results.total_supporters_count)}</td>
                                            <td className="orange-numbers">{numberWithCommas(results.total_potential_count)}</td>
                                            <td className="orange-numbers">{numberWithCommas(results.total_not_supporters_count)}</td>
                                            <td className="orange-numbers">{numberWithCommas(results.total_voters_without_status)}</td>
                                        </tr>
                                        <tr>
                                            <td>סניף</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.elections_supporters_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.elections_potential_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.elections_not_supporters_count)}</td>
                                            <td>{numberWithCommas(this.calculateWithoutSupportStatus('elections'))}</td>
                                        </tr>
                                        <tr>
                                            <td>TM</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.tm_supporters_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.tm_potential_count)}</td>
                                            <td className="orange-numbers orange-bg">{numberWithCommas(results.tm_not_supporters_count)}</td>
                                            <td>{numberWithCommas(this.calculateWithoutSupportStatus('tm'))}</td>
                                        </tr>
                                        </tbody>
										}
                                    </table>
                                </div>

                                </div>
			        </div>
					);
         
    }
}

function mapStateToProps(state) {
    return {
		votersDistributionBySupportStatusScreen:state.elections.preElectionsDashboard.votersDistributionBySupportStatusScreen,
		searchScreen:state.elections.preElectionsDashboard.searchScreen,
    }
}

export default connect(mapStateToProps) (withRouter(VotersDistributionBySupportStatus));