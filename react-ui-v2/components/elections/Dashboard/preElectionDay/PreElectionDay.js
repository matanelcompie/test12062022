import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../../libs/globalFunctions';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import Combo from '../../../global/Combo';
import TopHeaderSearch from './TopHeaderSearch';
import SupportStatusesSpeedGraph from './SupportStatusesSpeedGraph';
import DriversAndTransportations from './DriversAndTransportations';
import SupportsComparison from './SupportsComparison';
import OfficialRoles from './OfficialRoles';
import VotersDistributionBySupportStatus from './VotersDistributionBySupportStatus';
import MesaureSupportStatus from './MesaureSupportStatus';
import store from '../../../../store';
 

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';


class PreElectionDay extends React.Component {
    constructor(props) {
		super(props);
		this.screenPermission = 'elections.dashboards.pre_election_day';
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.currentUser.admin==false && nextProps.currentUser.permissions[this.screenPermission]!=true && this.props.currentUser.permissions[this.screenPermission]!=true && this.props.currentUser.first_name.length>1){          
		   this.props.router.replace('/unauthorized');
        }
    }

    componentWillMount()
	{
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
		ElectionsActions.loadPreElectionsDayElectionCampaigns(this.props.dispatch);
		SystemActions.loadSupportStatus(store,false);
	}
	
	/*
		Function that load measurments statuses by params
	*/
	getMeasurementsStatuses(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'measureSupportScreen' ,  fieldName:'resultsArray' , fieldValue : null });
		let endDate = '';
		endDate = parseDateToPicker(new Date()); // Current data and time
		endDate = moment(endDate).format('YYYY-MM-DD');
		
		let today = new Date();
		let dayOnly = today.getDay();
		let startDate  = '';
		let nDaysAgo  = 0;
		 
		switch(this.props.measureSupportScreen.selectedTimePeriod.selectedItem.system_name){
				case 'from_this_week' :
					let startOfWeek = today.setDate(today.getDate() -dayOnly);
					startDate = parseDateToPicker(new Date(startOfWeek)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');

					break;
				case 'from_previous_week' :
					let startOfPreviousWeek = today.setDate(today.getDate() -dayOnly-7);
					startDate = parseDateToPicker(new Date(startOfPreviousWeek)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case 'from_this_month' :
					let startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
					startDate = parseDateToPicker(new Date(startOfThisMonth)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case 'from_previous_month' :
					let startOfPrevMonth = new Date((today.getMonth() == 1 ? today.getFullYear()-1 : today.getFullYear()), (today.getMonth() == 1 ? 12 :(today.getMonth()-1)), 1);
					startDate = parseDateToPicker(new Date(startOfPrevMonth)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case '10_days' :
					nDaysAgo = today.setDate(today.getDate() - 10);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case '21_days' :
					nDaysAgo = today.setDate(today.getDate() - 21);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case '30_days' :
					nDaysAgo = today.setDate(today.getDate() - 30);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case '60_days' :
					nDaysAgo = today.setDate(today.getDate() - 60);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case '90_days' :
					nDaysAgo = today.setDate(today.getDate() - 90);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
				case 'form_elections_init' :
					let campaignStartDate =  new Date(this.props.currentCampaignStartDate.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
					startDate = parseDateToPicker(new Date(campaignStartDate)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					break;
		}
		let supportStatusesKeys = [];
		for(let i = 0 ; i < this.props.supportStatus.length ; i++){
				supportStatusesKeys.push(this.props.supportStatus[i].key);
		}
 
		
		let searchObj = {
            area_id: null,
            sub_area_id: null,
            city_id: null,
            cluster_id: null,
            ballot_id: null,

            summary_by_id: 0,

            start_date: startDate,
            end_date: endDate,
			entity_type:this.props.measureSupportScreen.selectedSupportStatusType.selectedItem.id,
            selected_statuses: supportStatusesKeys
        };
		
		let entityType = -1;
		let entityKey = '';
		if(this.props.searchScreen.selectedArea.selectedItem){
			searchObj.area_id = this.props.searchScreen.selectedArea.selectedItem.id; 
		}
		if(this.props.searchScreen.selectedSubArea.selectedItem){
			searchObj.sub_area_id = this.props.searchScreen.selectedSubArea.selectedItem.id; 
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			searchObj.city_id = this.props.searchScreen.selectedCity.selectedItem.id;
		}
		if(this.props.searchScreen.selectedNeighborhood.selectedItem){
			searchObj.neighborhood_id = this.props.searchScreen.selectedNeighborhood.selectedItem.id;
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			searchObj.cluster_id = this.props.searchScreen.selectedCluster.selectedItem.id;
		}
		if(this.props.searchScreen.selectedBallotBox.selectedItem){
			searchObj.ballot_id = this.props.searchScreen.selectedBallotBox.selectedItem.id;
		}
		ElectionsActions.dashboardPreElectSupportsMeasurements(this.props.dispatch , searchObj);
	}
  
    render() {
		 
            return (<div id="pre-election-day">
						<div className="row">
							<div className="col-lg-12">
								<TopHeaderSearch getMeasurementsStatuses={this.getMeasurementsStatuses.bind(this)} />
							</div>
						</div>
					    {this.props.searchScreen.showAllSearchResults && <div className="row" style={{marginTop:'20px'}}>
						     <div className="col-lg-8 text-right">
							     <SupportStatusesSpeedGraph/>
								 <div className="row">
									<div className="col-lg-6">
										<MesaureSupportStatus getMeasurementsStatuses={this.getMeasurementsStatuses.bind(this)} />
										<VotersDistributionBySupportStatus />
									</div>
									<div className="col-lg-6">
										<OfficialRoles />
									</div>
								 </div>
							 </div>
							 <div className="col-lg-4 text-left">
							     <SupportsComparison/>
								 <DriversAndTransportations/>
							 </div>
						</div>
						}
						<br/><br/><br/>
			        </div>
					);
    }
}

function mapStateToProps(state) {
    return {
		searchScreen:state.elections.preElectionsDashboard.searchScreen,
		measureSupportScreen:state.elections.preElectionsDashboard.measureSupportScreen,
		currentUser: state.system.currentUser,
		supportStatus:state.system.lists.supportStatus,
    }
}

export default connect(mapStateToProps) (withRouter(PreElectionDay));