import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import EntityActivistsDetails from './EntityActivistsDetails';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import constants from '../../../../../libs/constants';
import MunicipalCoordinators from './MunicipalCoordinators';
import ScreenTabs from './ScreenTabs';
import QuarterClusterActivistsDetails from './ClusterActivistsDetails';
import ClustersAndBallots from './ClustersAndBallots';
import CityBallots from './CityBallots';
import GeographicEntityType from '../../../../../Enums/GeographicEntityType';

class QuarterActivistsView extends React.Component {

    constructor(props) { 
        super(props);
		this.state = {
			cleanedNewRouteScreen:false,
			isOnlyMuniRole: false,
			currentTab: 'clustersAndBallots',
			quartersActivists:[],
			quarterId:this.props.quarter.entity_id
		};
        this.initConstants();
		this.loadActivistQuarters();

    }

    initConstants() {
		this.screenPermission = 'elections.activists.city_summary';
    }

    componentWillReceiveProps(nextProps) {
		   if(this.props.quarter.entity_id !=nextProps.quarter.entity_id){
			let quarter= nextProps.quarter;
			if(quarter.entity_id)
			{
				this.setState({quarterId:quarter.entity_id})
				this.loadActivistQuarters();
			}
			
		   }
    }

	loadActivistQuarters(){
		let that = this;
		ElectionsActions.loadActivistQuarters(this.props.dispatch,this.state.quarterId).then((quartersActivists)=>{
			that.setState({quartersActivists});
		})
	}

	componentWillUnmount(){
		  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}
	updateCurrentTab(name){
		this.setState({currentTab: name});
	}

	renderClustersTable(entityDataSummary){

		return <ClustersAndBallots 
				clustersActivistsSummary={this.props.quarterClustersActivistsSummary}
				currentCity={this.props.currentCity}
				loadActivistAllocationArr={()=>{this.loadActivistQuarters()}} 
				parentEntityType={constants.geographicEntityTypes.quarter}
				parentEntityId={entityDataSummary.entity_id}
				displayUpdateClusterActivistsModal={this.props.displayUpdateClusterActivistsModal.bind(this)}
		       ></ClustersAndBallots>
	}
	renderBallotsTable(entityDataSummary){

		return (
				<CityBallots
				    loadActivistAllocationArr={()=>{this.loadActivistQuarters()}}  
					electionRolesShifts={this.props.electionRolesShifts} 
					currentCity={this.props.currentCity}
					parentEntityType={constants.geographicEntityTypes.quarter}
					parentEntityId={entityDataSummary.entity_id}
				/>
		);
	}
	renderMunicipalCoordinators(entityDataSummary ){
		return (
			<MunicipalCoordinators 
			geographicEntityType={GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_QUARTER}
			geographicEntityValue={entityDataSummary.entity_id}
			loadActivistAllocationArr={()=>{this.loadActivistQuarters()}} 
			currentCity={this.props.currentCity} 
			quarterId={entityDataSummary.entity_id}
			municipalCoordinators={this.state.quartersActivists}>
			</MunicipalCoordinators>
		);
	}

    render() {
		let tabs = [
			{name: 'אשכולות  וקלפיות ברובע', path: 'clustersAndBallots'},
			{name: 'קלפיות לרובע', path: 'ballotsData'},
		    {name: 'תפקידים לרובע', path: 'municipalCoordinators'},
		];
		let entityDataSummary = this.props.currentEntitySummaryData.parent_entities_activists_summary

        return (
            <div id="cityActivists" >
			   {<EntityActivistsDetails 
					onSelectParentGeoEntity={this.props.onSelectParentGeoEntity.bind(this, entityDataSummary, this.props.currentCity.key)} 
			   		entityType={this.props.currentEntityType} entityDataSummary={entityDataSummary}
			   />}

			  	<ScreenTabs tabs={tabs}  updateCurrentTab={this.updateCurrentTab.bind(this)}></ScreenTabs>
 
				<div className="grid-container">
						{this.state.currentTab == 'clustersAndBallots' && this.renderClustersTable(entityDataSummary)}
						{this.state.currentTab == 'ballotsData' && this.renderBallotsTable(entityDataSummary)}
						{ (this.state.currentTab == 'municipalCoordinators' ) && this.renderMunicipalCoordinators(entityDataSummary)}
						{this.props.children}
				</div>
				
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
         currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
    }
}

export default connect(mapStateToProps)(withRouter(QuarterActivistsView));