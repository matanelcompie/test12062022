import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';


import EntityActivistsDetails from './EntityActivistsDetails';
import ClustersAndBallots from './ClustersAndBallots'
import CityBallots from './CityBallots'

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import MunicipalCoordinators from './MunicipalCoordinators';
import ScreenTabs from './ScreenTabs';
import CityQuarterActivistsDetails from './CityQuarterActivistsDetails';
import UpdateCityQuarterModal from './modals/UpdateCityQuarterModal';
import UpdateCityActivistsRolesModal from './modals/UpdateCityActivistsRolesModal';
import constants from '../../../../../libs/constants';
import GeographicEntityType from '../../../../../Enums/GeographicEntityType';

class CityActivistsView extends React.Component {

    constructor(props) { 
        super(props);
		this.state = {
			currentTab: 'clustersAndBallots',
			currentQuarterId: null,
			showUpdateQuarterModal: false,
			showUpdateQuarterDirectorModal: false,
			updateQuarterModalType: null,
		};
        this.initConstants();
    }

    initConstants() {
		this.screenPermission = 'elections.activists.city_summary';
    }

    
	componentWillUnmount(){
		  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}
	updateCurrentTab(name){
		this.setState({currentTab: name});
	}
	displayUpdateQuarterModal(show = false, modalType= null, quarterId = null){
		this.setState({updateQuarterModalType: modalType, currentQuarterId: quarterId, showUpdateQuarterModal : show})
	}



	saveCityQuarter(quarterData){
		this.displayUpdateQuarterModal( false, null, null)
		ElectionsActions.saveCityQuarter(this.props.dispatch, this.props.currentEntity.key, quarterData, this.state.currentQuarterId).then(() => {
			this.props.reloadEntityData();
		});
	}

	renderCityQuarters(currentCity){
		if(!this.props.currentEntitySummaryData.sub_entities_activists_summary) { return <div></div>}
		let items = this.props.currentEntitySummaryData.sub_entities_activists_summary.map((entityDataSummary, i) => {
			return (
				<CityQuarterActivistsDetails 
				    currentCity={currentCity}
					onSelectGeoEntity={this.props.onSelectGeoEntity.bind(this)} 
					successAddQuarterManager={()=>{this.props.reloadEntityData()}}
					displayUpdateQuarterModal={this.displayUpdateQuarterModal.bind(this)}
					key={i}
					parentEntity={this.props.currentEntityType} entityDataSummary={entityDataSummary}
				 />
            )
		})
		return (
			<div className="containerStrip">
				<div style={{textAlign: 'left', marginBottom: '20px'}}>
					<button className='btn btn-primary' onClick={this.displayUpdateQuarterModal.bind(this, true, 'add_new', null)}>+ הוספת רובע / שכונה</button>
				</div>
				{items}
			</div>
			
		)
	}
	renderMunicipalCoordinators(currentCity){
		return (
			<MunicipalCoordinators 
			    geographicEntityType={GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_CITY}
				geographicEntityValue={currentCity.id}
			    currentCity={currentCity}
				municipalCoordinators={this.props.municipalCoordinators}
				loadActivistAllocationArr={this.props.reloadCityMunicipalCoordinators.bind(this)} 
			/>
		);
	}
	renderClustersAndBallotsDetails(currentCity, entityId){
		return (
				<ClustersAndBallots 
				    loadActivistAllocationArr={this.props.loadClustersActivistsData.bind(this)}
					clustersActivistsSummary={this.props.cityClustersActivistsSummary}
					electionRolesShifts={this.props.electionRolesShifts} 
					currentCity={currentCity}
					parentEntityType={constants.geographicEntityTypes.city}
					parentEntityId={entityId}
					displayUpdateClusterActivistsModal={this.props.displayUpdateClusterActivistsModal.bind(this)}
				/>
		);
	}
	renderBallotsDetails(currentCity, entityId){

		return ( 
				<CityBallots 
				    loadActivistAllocationArr={this.props.loadClustersActivistsData.bind(this)}
					clustersActivistsSummary={this.props.cityClustersActivistsSummary}
					electionRolesShifts={this.props.electionRolesShifts} 
					currentCity={currentCity}
					parentEntityType={constants.geographicEntityTypes.city}
					parentEntityId={entityId}
					displayUpdateClusterActivistsModal={this.props.displayUpdateClusterActivistsModal.bind(this)}
				/>
		);
	}
    render() {

		// this.initDynamicVariables();
		let tabs = [
			{name: 'ניהול רובעים עירוניים', path: 'cityQuarters'},
			{name: 'תפקידים עירוניים', path: 'municipalCoordinators'},
			{name: 'אשכולות וקלפיות', path: 'clustersAndBallots'},
			{name: 'קלפיות', path: 'ballotsData'},
		];
		let entityDataSummary = this.props.currentEntitySummaryData.parent_entities_activists_summary
 
		let currentCity = {
			id: entityDataSummary.entity_id,
			key: entityDataSummary.entity_key,
		}
        return (
            <div  id="cityActivists">

			   {<EntityActivistsDetails 
			   		onSelectParentGeoEntity={this.props.onSelectParentGeoEntity.bind(this)} 
			   		entityType={this.props.currentEntityType} entityDataSummary={entityDataSummary}
				/>}

			  	<ScreenTabs tabs={tabs}  updateCurrentTab={this.updateCurrentTab.bind(this)}></ScreenTabs>
				  <div className="tab-pane">

					{this.state.currentTab == 'cityQuarters' && this.renderCityQuarters(currentCity)}
					{ (this.state.currentTab == 'municipalCoordinators') && this.renderMunicipalCoordinators(currentCity)}
					{ (this.state.currentTab == 'clustersAndBallots') && this.renderClustersAndBallotsDetails(currentCity, entityDataSummary.entity_id)}
					{ (this.state.currentTab == 'ballotsData') && this.renderBallotsDetails(currentCity, entityDataSummary.entity_id)}

				</div>
					 <UpdateCityQuarterModal
						show={this.state.showUpdateQuarterModal}
						modalType={this.state.updateQuarterModalType}
						currentQuarterId={this.state.currentQuarterId}
						cityClusters={this.props.cityClusters}
						hideModal={this.displayUpdateQuarterModal.bind(this, false, null, null)}
						saveData={this.saveCityQuarter.bind(this)}
					></UpdateCityQuarterModal>

					{this.props.children}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
         currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
         showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
		 electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,
		 municipalCoordinators: state.elections.managementCityViewScreen.municipalCoordinators,
		 cityClusters: state.elections.managementCityViewScreen.cityClusters,
		 activistVoterItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,
    }
}

export default connect(mapStateToProps)(withRouter(CityActivistsView));