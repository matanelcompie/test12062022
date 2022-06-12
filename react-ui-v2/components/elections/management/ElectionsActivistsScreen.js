import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';


import SearchPanel from './cityView/SearchPanel'

import * as SystemActions from '../../../actions/SystemActions';
import * as ElectionsActions from '../../../actions/ElectionsActions';
import * as AllocationAndAssignmentActions from '../../../actions/AllocationAndAssignmentActions';

import store from '../../../store';
import constants from '../../../libs/constants';
import CityActivistsView from './cityView/cityActivists/CityActivistsView';
import QuarterActivistsView from './cityView/cityActivists/QuarterActivistsView';
import ClusterActivistsView from './cityView/cityActivists/ClusterActivistsView';
import AreaActivistsSummary from './cityView/cityActivists/AreaActivistsSummary';

import ClusterActivistModal from './cityView/cityActivists/modals/ClusterActivistModal'
import { getGeographicEntityTypeName } from '../../../libs/globalFunctions';
import { renderLoaderIcon } from '../../../libs/HelperFunctions';

class ElectionsActivistsScreen extends React.Component {

    constructor(props) {
        super(props);
		this.state = {
			isSearchOpen:false,
            currentEntityType: null,
            currentEntity: null,
            showUpdateClusterActivistsModal: false,
            loadingEntityDataSummary: false,
            currentClusterId: null // For edit cluster data.
		};
        this.initConstants();
         if(this.props.isMuniActivistsPage){
             this.currentRoleId = sessionStorage.getItem('currentRoleId');
             if(!this.currentRoleId){ window.location.href = window.Laravel.baseLoginURL; }
             ElectionsActions.loadMunicipalRoleActivistsSummary(this.props.dispatch, this.currentRoleId);
         }
    }

    initConstants() {
		this.systemTitle = "פעילי עיר";
		this.screenPermission = 'elections.activists.city_summary';
    }

    componentWillMount(){
    	this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: this.systemTitle });
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
		ElectionsActions.loadActivistsSummaryBallotBoxRoles(this.props.dispatch);
		ElectionsActions.loadElectRolesCitySummary(this.props.dispatch);
		ElectionsActions.loadElectionRoles(this.props.dispatch);
		ElectionsActions.loadCurrentElectionRolesCampaignBudget(this.props.dispatch);
		ElectionsActions.loadElectionRolesShifts(this.props.dispatch);
    }
   
    componentWillReceiveProps(nextProps) {

		if (this.props.currentUser.admin==false && nextProps.currentUser.permissions[this.screenPermission]!=true && this.props.currentUser.first_name.length>1){          	  
		  this.props.router.replace('/unauthorized');
        }  
        // If Geographical Filters loaded:
        let isGeoFiltersLoaded = (this.props.currentUserGeographicalFilteredLists.cities.length == 0 
            && nextProps.currentUserGeographicalFilteredLists.cities.length > 0)
		if(!this.props.isMuniActivistsPage && isGeoFiltersLoaded){
            let entityData = this.getUserGeoLevel(nextProps.currentUserGeographicalFilteredLists);
            ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , entityData.currentEntityType, entityData.currentEntity.id);
        }

        // Set init entity for external city activist:
        if(!this.props.cityActivistGeoData.entityType && nextProps.cityActivistGeoData.entityType){
            this.setState({'currentEntityType': nextProps.cityActivistGeoData.entityType, 'currentEntity': nextProps.cityActivistGeoData.currentEntity})
        } 
    }
    getUserGeoLevel(currentUserGeographicalFilteredLists){
        let currentEntityType = null
        let currentEntity = null
        if(currentUserGeographicalFilteredLists.areas.length > 1){
            currentEntityType = constants.geographicEntityTypes.areaGroup;
            currentEntity = {name: "כל הארץ", id: 1}
        }else if(currentUserGeographicalFilteredLists.sub_areas.length > 1){
            currentEntityType = constants.geographicEntityTypes.area;
            currentEntity = currentUserGeographicalFilteredLists.areas[0]
        }else if(currentUserGeographicalFilteredLists.cities.length > 1){
            currentEntityType = constants.geographicEntityTypes.subArea;
            currentEntity = currentUserGeographicalFilteredLists.sub_areas[0]
        }else {
            currentEntityType = constants.geographicEntityTypes.city;
            currentEntity = currentUserGeographicalFilteredLists.cities[0];
            currentEntity.entity_type = currentEntityType;
            this.getCityActivistsData(currentEntity.key, currentEntity); 
        }
        this.setState({currentEntityType, currentEntity})
        return {currentEntityType, currentEntity}
    }

	componentWillUnmount(){
		  this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA});
	}

    updateCollapseStatus(){
        this.setState({isSearchOpen: !this.state.isSearchOpen})
    }
    renderSearchPanel(){
        return (
            <div className="ContainerCollapse">
                <a  onClick={this.updateCollapseStatus.bind(this )}>
                <div className="row panelCollapse" aria-expanded={false}>
                    <div className="collapseArrow closed"></div>
                    <div className="collapseArrow open"></div>
                    <div className="collapseTitle">חיפוש</div>
                </div>
                </a>
            <Collapse  isOpened={this.state.isSearchOpen}>
                <div className='row'>
                    <div className="col-md-12">
                        <SearchPanel 
                            currentEntity={this.props.currentEntity} 
                            isMuniActivistsPage={this.props.isMuniActivistsPage} 
                            onSelectGeoEntity={this.onSelectGeoEntity.bind(this)}
                        /> 
                    </div>
                </div>
                
            </Collapse>
           </div>
        )
    }
    // When click on parent entity:
    onSelectParentGeoEntity(entityData, parentEntityKey = null){
        // let parentEntity
        // console.log('onSelectParentGeoEntity', entityData)
        let parentEntityType = entityData.parent_entity_type
        let parentEntityId = entityData.parent_entity_id
        if(!this.props.electionsActivistsSummary[parentEntityType] || !this.props.electionsActivistsSummary[parentEntityType][parentEntityId]){
            ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , parentEntityType, parentEntityId);
        }
        if(parentEntityType == constants.geographicEntityTypes.city){
            ElectionsActions.loadCityBallotsFullData(this.props.dispatch, parentEntityKey, parentEntityType);
            ElectionsActions.loadCityMunicipalCoordinators(this.props.dispatch, parentEntityKey)
            ElectionsActions.loadCityClustersByQuarters(this.props.dispatch , parentEntityKey);
            ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , parentEntityType, parentEntityId);
        } 
        this.setState({currentEntity: {id: entityData.parent_entity_id, name:'', key: null}, currentEntityType: parentEntityType})
    }
    // When click on geo entity or search for city:
    onSelectGeoEntity(entityData){
        let selectedEntity = {
			id: entityData.entity_id,
			key: entityData.entity_key,
			name: entityData.entity_name,
			entity_type: entityData.entity_type,
        }
        this.setState({currentEntity: selectedEntity, currentEntityType: selectedEntity.entity_type})

        if(!this.props.electionsActivistsSummary[selectedEntity.entity_type] || !this.props.electionsActivistsSummary[selectedEntity.entity_type][selectedEntity.id]){
            ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , selectedEntity.entity_type, selectedEntity.id);
        }

        if(selectedEntity.entity_type == constants.geographicEntityTypes.city){
            this.getCityActivistsData(entityData.entity_key, selectedEntity);
        } 
        if(selectedEntity.entity_type == constants.geographicEntityTypes.quarter){
            ElectionsActions.loadCityBallotsFullData(this.props.dispatch , selectedEntity.key, selectedEntity.entity_type);
        } 
    }

    getCityActivistsData(cityKey, selectedEntity){
        ElectionsActions.loadCityMunicipalCoordinators(this.props.dispatch, cityKey)
        ElectionsActions.loadClustersAndNeighborhoodsByCity(this.props.dispatch , cityKey, null, null, selectedEntity.id);
        ElectionsActions.loadCityClustersByQuarters(this.props.dispatch , cityKey);
        ElectionsActions.loadCityBallotsFullData(this.props.dispatch , cityKey, selectedEntity.entity_type);
        ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , selectedEntity.entity_type, selectedEntity.id, true);
    }


    deleteActivistAllocationAssignment(allocationAssignmentId){
        const promise = AllocationAndAssignmentActions.deleteActivistAllocationAssignment(this.props.dispatch, allocationAssignmentId,true);
        promise.then(() => {
            this.loadClustersActivistsData();
        })
    }

    // Reload entity data:
    reloadEntityData(){
        if(!this.state.loadingEntityDataSummary){
            const promise = ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , this.state.currentEntityType, this.state.currentEntity.id);
            promise.then(() => this.setState({loadingEntityDataSummary: false}))
        }
        this.setState({loadingEntityDataSummary: true});
    }
    
    reloadCityMunicipalCoordinators(){
        //if(!this.state.loadingEntityDataSummary){
            const promise = ElectionsActions.loadCityMunicipalCoordinators(this.props.dispatch , this.state.currentEntity.key);
            promise.then(() => this.setState({loadingEntityDataSummary: false}))
       // }
       // this.setState({loadingEntityDataSummary: true});
    }

    loadClustersActivistsData(){
        let getCityClusters = (this.state.currentEntity.entity_type == constants.geographicEntityTypes.city)
        ElectionsActions.loadEntityActivistsSummary(this.props.dispatch , this.state.currentEntityType, this.state.currentEntity.id, getCityClusters);
        ElectionsActions.loadClustersActivists(this.props.dispatch , this.state.currentClusterId);
    }
    displayUpdateClusterActivistsModal(clusterId = null, systemName = null, bool = false){
        // console.log('clusterId, bool, systemName', clusterId, bool, systemName)
        if(clusterId){
            ElectionsActions.loadClustersActivists(this.props.dispatch , clusterId);
        }
		this.setState({currentClusterId: clusterId, activistSystemName: systemName})
        this.displayModal('UpdateClusterActivists', bool)
        if(!bool){
            this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.ADD_ALLOCATION_MODAL.SET_ACTIVIST_ITEM, activistItem: {} });
        }

	}
	displayModal(modalName, bool){
		let obj = new Object();
		obj['show' + modalName + 'Modal'] = bool;
		this.setState(obj);
	}

    renderActivistsScreen(){
        let currentEntitySummaryData = null;
        if(this.state.currentEntityType != undefined && this.state.currentEntity ){
            currentEntitySummaryData = this.props.electionsActivistsSummary[this.state.currentEntityType][this.state.currentEntity.id] || null
        }
        if(!currentEntitySummaryData){ return renderLoaderIcon() }
        let parent_entity = currentEntitySummaryData.parent_entities_activists_summary;

        switch(this.state.currentEntityType){
            case constants.geographicEntityTypes.areaGroup:
            case constants.geographicEntityTypes.area:
            case constants.geographicEntityTypes.subArea:
                return (
                    <AreaActivistsSummary 
                        onSelectParentGeoEntity={this.onSelectParentGeoEntity.bind(this)}
                        onSelectGeoEntity={this.onSelectGeoEntity.bind(this)}
                        currentEntityType={this.state.currentEntityType} currentEntitySummaryData={currentEntitySummaryData}
                    ></AreaActivistsSummary>
                )
            case constants.geographicEntityTypes.city:
                let cityData = {id: parent_entity.entity_id, key : parent_entity.entity_key}
                // Get cluster of city:
                let cityClustersActivistsSummary = this.props.electionsActivistsClustersSummary[parent_entity.entity_type][parent_entity.entity_id] || []
                return (
                    <CityActivistsView 
                        loadClustersActivistsData={this.loadClustersActivistsData.bind(this)}
                        onSelectGeoEntity={this.onSelectGeoEntity.bind(this)}
                        onSelectParentGeoEntity={this.onSelectParentGeoEntity.bind(this)}
                        displayUpdateClusterActivistsModal={this.displayUpdateClusterActivistsModal.bind(this)}
                        reloadEntityData={this.reloadEntityData.bind(this)}
                        reloadCityMunicipalCoordinators={this.reloadCityMunicipalCoordinators.bind(this)}
                        cityClustersActivistsSummary={cityClustersActivistsSummary}
                        currentEntityType={this.state.currentEntityType} currentEntity={this.state.currentEntity} currentEntitySummaryData={currentEntitySummaryData}>
                        {currentEntitySummaryData && this.renderClusterActivistModal(cityClustersActivistsSummary, cityData)}
                    </CityActivistsView>
                )
            case constants.geographicEntityTypes.quarter:

                let quarterClustersActivistsSummary = [];
                // Get cluster of quarter:
                quarterClustersActivistsSummary = this.props.electionsActivistsClustersSummary[parent_entity.entity_type][parent_entity.entity_id] || []

                // Get city id:
                let cityId = currentEntitySummaryData.parent_entities_activists_summary.parent_entity_id;
                // Get Quarter parent city:
                let city = this.props.currentUserGeographicalFilteredLists.cities.find((item) => { return item.id == cityId})
                let parentCityData = city
                return (
                    <QuarterActivistsView
                        loadClustersActivistsData={this.loadClustersActivistsData.bind(this)}
                        quarter={currentEntitySummaryData.parent_entities_activists_summary}
                        currentCity={parentCityData}
                        onSelectGeoEntity={this.onSelectGeoEntity.bind(this)}
                        onSelectParentGeoEntity={this.onSelectParentGeoEntity.bind(this)}
                        displayUpdateClusterActivistsModal={this.displayUpdateClusterActivistsModal.bind(this)}
                        quarterClustersActivistsSummary={quarterClustersActivistsSummary}
                        currentEntityType={this.state.currentEntityType} 
                        currentEntitySummaryData={currentEntitySummaryData}>
                        {currentEntitySummaryData && this.renderClusterActivistModal(quarterClustersActivistsSummary, parentCityData)}
                    </QuarterActivistsView>
                )
            case constants.geographicEntityTypes.cluster:
                return (
                    <ClusterActivistsView currentEntityType={this.state.currentEntityType} currentEntitySummaryData={currentEntitySummaryData}></ClusterActivistsView>
                )

        }
    }
    renderClusterActivistModal(clustersActivistsSummary, cityData){
        return (<ClusterActivistModal
            show={this.state.showUpdateClusterActivistsModal}
            displayModal={this.displayUpdateClusterActivistsModal.bind(this)}
            deleteActivistAllocationAssignment={this.deleteActivistAllocationAssignment.bind(this)}
            clustersActivistsSummary={clustersActivistsSummary}
            clusterAllocatedActivists={this.props.clusterAllocatedActivists}
            activistVoterItem={this.props.activistVoterItem}
            currentCity={cityData}
            electionRoles={this.props.electionRoles}
            electionRolesShiftsBudgets={this.props.electionRolesShiftsBudgets}
            currentClusterId={this.state.currentClusterId}
            activistSystemName={this.state.activistSystemName}
        ></ClusterActivistModal>)
    }

    getTitle(){
		let entityName = getGeographicEntityTypeName(this.state.currentEntityType);
		let systemTitle = `פעילים - ${entityName}`;
		return systemTitle;
	}
    renderTitle(){
        let spanStyle = {position: 'relative', bottom: '3px', right: '11px'};
        let btnStyle ={fontSize:'17px', marginRight:'20px'}
        return (
            <div className="row">
                <div className="col-md-12 text-right">
                    <h1>
                        {this.getTitle()}
                        <button style={btnStyle} className="glyphicon glyphicon-refresh no-border-and-bg-btn blue-icon" onClick={this.reloadEntityData.bind(this)}>
                            <span style={spanStyle}>רענן</span>
                        </button>
                    </h1>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div id="cityActivists" >
                {this.renderSearchPanel()}
                {this.renderTitle()}
                {this.state.loadingEntityDataSummary && renderLoaderIcon()}
                {this.renderActivistsScreen()}

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
         currentUser: state.system.currentUser,
         currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
         electionsActivistsSummary: state.elections.managementCityViewScreen.electionsActivistsSummary,
         activistVoterItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,
         cityActivistGeoData: state.elections.managementCityViewScreen.cityActivistGeoData,
         showSearchResults:state.elections.managementCityViewScreen.showSearchResults,
		 currentPage :state.elections.managementCityViewScreen.currentPage,
		 displayItemsPerPage :state.elections.managementCityViewScreen.displayItemsPerPage,
		 searchScreen:state.elections.managementCityViewScreen.searchScreen,
        electionRoles: state.elections.activistsScreen.electionRoles,
        electionRolesShiftsBudgets: state.elections.activistsScreen.electionRolesShiftsBudgets,
        clusterAllocatedActivists:state.elections.managementCityViewScreen.clusterAllocatedActivists,
		electionsActivistsClustersSummary: state.elections.managementCityViewScreen.electionsActivistsClustersSummary,

    }
}

export default connect(mapStateToProps)(withRouter(ElectionsActivistsScreen));