import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import TopHeaderSearch from './TopHeaderSearch';
import VotingPanelTab from './VotingPanelTab';
import HourlyVoting from './HourlyVoting';
import store from '../../../../store';
 
import {geographicEntityTypes} from 'libs/constants'
import {isEmptyOrNotObject} from 'libs/globalFunctions'

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';


class ElectionDay extends React.Component {
    constructor(props) {
        super(props);
		this.initConstants();
		this.initState = {
			ballotsDataToDisplay: 'all_ballots',
			hot: false,
		}
	
		this.state = { ...this.initState };
		this.screenPermission = 'elections.dashboards.election_day';

		this.changeHotBallotSelection = this.changeHotBallotSelection.bind(this);
		this.setVotesReportingState = this.setVotesReportingState.bind(this);
	}

	/*
		Function that initializes constants : 
	*/
	initConstants(){
		this.baseBreadcrumbsURL = 'elections/dashboards/elections_day';
		this.areaArrayKeys = [];
		this.InitLoadingStatsData = {
			all: false,
			areas: {},
			subAreas: {},
			cities: {},
			neighborhoods: {},
			clusters: {},
			ballotBoxes: {},
		};
		this.InitLoadingPredictionsData = {
			all: false,
			areas: {},
			subAreas: {},
			cities: {},
			neighborhoods: {},
			clusters: {},
			ballotBoxes: {},
		};
		this.entityTypesHash = {
			0: 'areas',
			5: 'subAreas',
			1: 'cities',
			2: 'neighborhoods',
			3: 'clusters',
			4: 'ballotBoxes',
		};
		this.initLoadedSubEntities = {}
		
		this.loadingStatsData = { ...this.InitLoadingStatsData }
		this.loadingPredictionsData = { ...this.InitLoadingPredictionsData }
		this.loadedSubEntities = { ...this.initLoadedSubEntities }
	}
	
    componentWillReceiveProps(nextProps) {
		if (this.props.currentUser.admin == false && this.props.currentUser.first_name.length > 1 &&
			nextProps.currentUser.permissions[this.screenPermission] != true
			&& this.props.currentUser.permissions[this.screenPermission] != true) {
			this.props.router.replace('/unauthorized');
		}
    }

    componentWillMount()
	{
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission, null, true);
		ElectionsActions.loadElectionDayAllCountryBasicStats(this.props.dispatch, this.state.hot);
	}

	/**
	 * Change ballot selection from all to hot and vice-versa
	 * @param event e 
	 */
	changeHotBallotSelection(e) {
		let hot = false;
		if (e.target.value == "true") hot = true;

		this.setState({hot});
	}
	
	/*
		Shortens too long text
	*/
	truncateText(txt, maxLength) {
		if (!txt) { return '' }
		if (txt.length > maxLength) {
			return txt.substr(0, maxLength) + "...";
		}
		return txt;
	}
	
	/*
		Helpful function that reset basic breadcrumbs
	*/
	resetBreadcrumbsToBase(){
		this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'כל הארץ'});
		this.props.dispatch({ type: SystemActions.ActionTypes.RESET_BREADCRUMBS });
	    this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/elections_day', title:'כל הארץ', elmentType:'electionsDashboard' , onClick:this.CleanSearchResults.bind(this) } });
	}
	
	/*
		In case of top comboes search - this function will update correct indexes of arrays 
	*/
	getGeoDataBySearchComboes(){
		
		const areaId = this.props.areaId;
		const cityId = this.props.cityId;

		// In case of search by area combo :
		if (areaId == -1 && this.props.searchScreen.selectedArea.selectedItem) { //   if it comes from top search by area :
			this.props.dispatch({
				 type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME,
				 fieldName: 'areaId', fieldValue: this.props.searchScreen.selectedArea.selectedItem.id });	 // update to correct areaId
		}
		// In case of search by city combo :
		if (areaId != -1 && this.props.searchScreen.selectedSubArea.selectedItem) { //   if it comes from top search by city :
			let subAreaId = this.props.searchScreen.selectedSubArea.selectedItem.id;

			this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'subAreaId', fieldValue: subAreaId });	 // update to correct areaId
		}
		// In case of search by city combo :
		if (areaId != -1 && this.props.searchScreen.selectedCity.selectedItem) { //   if it comes from top search by city :
			let cityId = this.props.searchScreen.selectedCity.selectedItem.id;

			this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'cityId', fieldValue: cityId });	 // update to correct areaId
		}

		// In case of search by neighborhood combo :
		if (areaId != -1 && cityId != -1 && this.props.searchScreen.selectedNeighborhood.selectedItem) {
			let currentNeighborhoodId = this.props.searchScreen.selectedNeighborhood.selectedItem.id

			this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'neighborhoodId', fieldValue: currentNeighborhoodId });	 // update to correct areaId
		}

		// In case of search by cluster combo :
		if(areaId != -1 &&  cityId != -1  && this.props.searchScreen.selectedCluster.selectedItem){
			let currentClusterId = this.props.searchScreen.selectedCluster.selectedItem.id
			this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'clusterId', fieldValue: currentClusterId });	 // update to correct areaId
		}

	
	}

	componentDidUpdate(prevProps, prevState, snapshot){
		this.setUpdatedBreadcrumbs();
		this.getGeoDataBySearchComboes();
		const currentEnitityItem = this.getParentArrayByEntityType();
		switch(this.props.searchEntityType){
			case -1: //case selected all country
				if (this.areaArrayKeys.length == 0) {
					for (let id in this.props.generalAreasHashTable.areas) {
						this.areaArrayKeys.push(this.props.generalAreasHashTable.areas[id].key)
					}
				}
				break;
			case geographicEntityTypes.area: // case selected specific area

				if (currentEnitityItem && !this.props.searchScreen.selectedArea.selectedItem) {
					this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'screenHeader', fieldValue: currentEnitityItem.name });
				}

				break;
			case geographicEntityTypes.subArea: // case selected specific area

				if (currentEnitityItem && !this.props.searchScreen.selectedSubArea.selectedItem) {
					this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'screenHeader', fieldValue: currentEnitityItem.name });
				}

				break;
			case geographicEntityTypes.city: //case selected specific city
				let cityKey = currentEnitityItem.key;
				if(currentEnitityItem){
					this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'screenHeader', fieldValue: currentEnitityItem.name });
				}
				if (currentEnitityItem && cityKey && !this.loadedSubEntities[cityKey]) {
					ElectionsActions.loadElectionDayCityNeighborhoodsClustersBallotsTree(this.props.dispatch, cityKey, currentEnitityItem.id, this.state.hot); // load sub entities of city - neighborhoods , cluster and ballots
					this.loadedSubEntities[cityKey] = true;
				}
				break;
			case geographicEntityTypes.neighborhood:

				if (currentEnitityItem && !this.props.searchScreen.selectedNeighborhood.selectedItem) {
					this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'screenHeader', fieldValue: currentEnitityItem.name });
				}
				if (isEmptyOrNotObject(currentEnitityItem)) {
					this.loadParentEntityData()
				}
				break;
			case geographicEntityTypes.cluster:
				if (currentEnitityItem && !this.props.searchScreen.selectedCluster.selectedItem) {
					this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'screenHeader' , fieldValue : currentEnitityItem.name});
				}
				if (isEmptyOrNotObject(currentEnitityItem)) {
					this.loadParentEntityData()
				}
				break;
			case  geographicEntityTypes.ballotBox: //case selected specific ballot box - not in use!
				if(currentEnitityItem && !this.props.searchScreen.selectedBallotBox.selectedItem){
					this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'screenHeader' , fieldValue : ('קלפי ' + currentEnitityItem.name)});
				}
				break;
		}
		this.loadSubEntitiesData(currentEnitityItem) // load sub entities of city - neighborhoods , cluster and ballots

		//refresh all search result if there are changes in ballot hotness
		if (prevState.hot != this.state.hot) {
			this.refreshAllSearchResults();
		}
	}
	loadParentEntityData(){
		if (this.props.cityId && !isEmptyOrNotObject(this.props.generalAreasHashTable.areas)) { // If global data not loded yet!
			let cityId = this.props.cityId;
			let city = this.props.currentUserCitiesList.find(function (element) { return element.id == cityId; });
			if (city && city.key && !this.loadedSubEntities[city.key]) {
				ElectionsActions.loadElectionDayCityNeighborhoodsClustersBallotsTree(this.props.dispatch, city.key, cityId, this.state.hot);
				this.loadedSubEntities[city.key] = true;
			}
		}

	}
	loadSubEntitiesData(currentEnitityItem){
		if(isEmptyOrNotObject(this.props.generalAreasHashTable.areas)){ return;} // If global data not loded yet!
		let self = this;
		let searchEntityType = this.props.searchEntityType;
		let LoadedData = true;
		let LoadedDataHoursData = true;
		let childrenArrayKeys;
		var allAreasLevel = (searchEntityType == -1) ? true : false;

		let entityId = currentEnitityItem.id;
		let entityKey = currentEnitityItem.key;

		let entityName = null;
		if (!allAreasLevel && !isEmptyOrNotObject(currentEnitityItem) ) {
			entityName = this.entityTypesHash[searchEntityType];

			LoadedData = this.loadingStatsData[entityName][entityKey] ? true : false;
			LoadedDataHoursData = this.loadingPredictionsData[entityName][entityKey] ? true : false;
			childrenArrayKeys = currentEnitityItem.childrensKeys;

		} else {
			LoadedData = this.loadingStatsData['all'] ? true : false;
			LoadedDataHoursData = this.loadingPredictionsData['all'] ? true : false;
			childrenArrayKeys = this.areaArrayKeys;
		}
		let subEntityType;
		if (searchEntityType == geographicEntityTypes.area || searchEntityType == geographicEntityTypes.subArea) {
			subEntityType = (searchEntityType == geographicEntityTypes.area) ? geographicEntityTypes.subArea : geographicEntityTypes.city;
		} else { subEntityType = searchEntityType + 1 }
		// console.log(currentEnitityItem, childrenArrayKeys , LoadedDataHoursData,this.loadingPredictionsData[entityName] ,allAreasLevel , entityKey);
		if (!LoadedData && childrenArrayKeys.length > 0) {
			if (!allAreasLevel && entityKey) {
				ElectionsActions.loadElectionDayEntityStatsByTypeAndKey(this.props.dispatch, searchEntityType, [entityKey], entityId, this.state.hot); // load stats data entity parent 
			}

			ElectionsActions.loadElectionDayEntityStatsByTypeAndKey(this.props.dispatch, subEntityType, childrenArrayKeys, entityId, this.state.hot); // load stats data of all childrens
			if (allAreasLevel) {
				this.loadingStatsData['all'] = true;
			} else if (entityName) {
				this.loadingStatsData[entityName][entityKey] = true;
			}
		}
		if (this.props.currentTabNumber != 1 && !LoadedDataHoursData && childrenArrayKeys.length > 0) { // if item doesn't have vote stats and doen't loading now the stats
			// entityId = entityId !=0 ? entityId: this.props.cityId;
			if (!allAreasLevel && entityKey) {
				ElectionsActions.loadElectionDayEntityVotesPredictionsByTypeAndKey(self.props.dispatch, searchEntityType, [entityKey], entityId, this.state.hot); // load hours votes data entity parent 
			}
			ElectionsActions.loadElectionDayEntityVotesPredictionsByTypeAndKey(self.props.dispatch, subEntityType, childrenArrayKeys, entityId, this.state.hot); // load hours votes data of all childrens 

			if (allAreasLevel) {
				this.loadingPredictionsData['all'] = true;
			} else if(entityName){
				this.loadingPredictionsData[entityName][entityKey] = true;
			}
		}
	}
	/*
		returns correct percentage calculation : 
	*/
	getFormattedPercentage(fromNumber , relativeToNumber){
		let result  = 0;
		if (!fromNumber || !relativeToNumber || relativeToNumber == 0) { return 0; }
		else{
			result = ((fromNumber * 100)/relativeToNumber).toFixed(1);
			return  parseFloat(result);
		}
	}
	
		/*
		Function that updates current breadcrumbs 
	*/
	setUpdatedBreadcrumbs(){
		let currentTitle = "כל הארץ";
		this.resetBreadcrumbsToBase();
		if(this.props.searchScreen.selectedArea.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'electionsDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
		      currentTitle += (">>"+this.props.searchScreen.selectedArea.selectedItem.name); 
		}
		if(this.props.searchScreen.selectedSubArea.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedSubArea.selectedItem.name, elmentType:'electionsDashboard' , entityType:5 , key:this.props.searchScreen.selectedSubArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
		      currentTitle += (">>"+this.props.searchScreen.selectedSubArea.selectedItem.name); 
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'electionsDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
			   currentTitle += (">>"+this.props.searchScreen.selectedCity.selectedItem.name); 
		}
		if(this.props.searchScreen.selectedNeighborhood.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'electionsDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
			  currentTitle += (">>"+this.props.searchScreen.selectedNeighborhood.selectedItem.name); 
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedCluster.selectedItem.name, elmentType:'electionsDashboard' , entityType:3 , key:this.props.searchScreen.selectedCluster.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
			  currentTitle += (">>"+this.props.searchScreen.selectedCluster.selectedItem.name); 
		}
		if(this.props.searchScreen.selectedBallotBox.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:('קלפי ' + this.props.searchScreen.selectedBallotBox.selectedItem.name ), elmentType:'electionsDashboard' , entityType:4  , key:this.props.searchScreen.selectedBallotBox.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
			  currentTitle += (">> קלפי "+this.props.searchScreen.selectedBallotBox.selectedItem.name); 
		}
		this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: currentTitle});
	}
	
	/*
		Helpful function to other function that returns global array by entity type
    */
	getParentArrayByEntityType(withChildrens = false) {
		let entityData = {};
		const generalAreasHashTable = this.props.generalAreasHashTable
		let areaId = this.props.areaId;
		let subAreaId = this.props.subAreaId;
		let cityId = this.props.cityId;
		let neighborhoodId = this.props.neighborhoodId;
		let clusterId = this.props.clusterId;
		let ballotBoxId = this.props.ballotBoxId;
		switch (this.props.searchEntityType) {

			case geographicEntityTypes.area:
				if (areaId != -1 && generalAreasHashTable.areas[areaId]) {
					entityData = generalAreasHashTable.areas[areaId];
					if (withChildrens) { entityData.childrensData = this.getChildrensData(entityData, 'subAreas') }
				}
				break;
			case geographicEntityTypes.subArea:
				if (subAreaId != -1){
					let subAreas = generalAreasHashTable.subAreas; 
					entityData = subAreas[subAreaId] ? subAreas[subAreaId] : subAreas[subAreaId + '_0'];
					if (entityData && withChildrens) { entityData.childrensData = this.getChildrensData(entityData, 'cities') }
				}
				break;
			case geographicEntityTypes.city:
				if (cityId != -1 && generalAreasHashTable.cities[cityId]) {
					entityData = generalAreasHashTable.cities[cityId];
					if (withChildrens) { entityData.childrensData = this.getChildrensData(entityData, 'neighborhoods') }
				}
				break;
			case geographicEntityTypes.neighborhood:
				if (neighborhoodId != -1 && generalAreasHashTable.neighborhoods[neighborhoodId]) {
					entityData = generalAreasHashTable.neighborhoods[neighborhoodId];
					if (withChildrens) { entityData.childrensData = this.getChildrensData(entityData, 'clusters') }
				}
				break;
			case geographicEntityTypes.cluster:
				if (clusterId != -1 && generalAreasHashTable.clusters[clusterId]) {
					entityData = generalAreasHashTable.clusters[clusterId];
					if (withChildrens) { entityData.childrensData = this.getChildrensData(entityData, 'ballotBoxes') }
				}

				break;
			case geographicEntityTypes.ballotBox:
				if (ballotBoxId != -1 && generalAreasHashTable.ballotBoxes[ballotBoxId]) {
					entityData = generalAreasHashTable.ballotBoxes[ballotBoxId];
				}
				break;
			default:
				entityData = {}
				break;
		}
		if (entityData == undefined) { entityData = {} }
		return entityData ;
	}
	getChildrensData(entityData, childrensType){
		let childrensData = [];
		let globalSubEntitiesData = this.props.generalAreasHashTable[childrensType];
		entityData.childrens.forEach(function(id){
			if(globalSubEntitiesData[id]){
				childrensData.push(globalSubEntitiesData[id]);
			}
		})
		return childrensData;
	}
	/*
		Function that handles click on breadcrumb : 
	*/
	ClickBreadcrumbLink(entityType , entityKey){
	 
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityType' , fieldValue : entityType});	   
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityKey' , fieldValue : entityKey});	
		let selectedAreaItem = this.props.searchScreen.selectedArea.selectedItem ? this.props.searchScreen.selectedArea.selectedItem : {name: ''};
		let selectedSubAreaItem = this.props.searchScreen.selectedSubArea.selectedItem ? this.props.searchScreen.selectedSubArea.selectedItem : {name: ''};
		let selectedCityItem = this.props.searchScreen.selectedCity.selectedItem ? this.props.searchScreen.selectedCity.selectedItem : {name: ''};
		switch(entityType){
			case geographicEntityTypes.area:
				this.cleanGeoEntitiesComboes([1,2,3,4,5]);
				this.resetBreadcrumbsToBase();
				if(selectedAreaItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedAreaItem.name, elmentType:'electionsDashboard' , entityType:0 , key:selectedAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				break;
			case geographicEntityTypes.subArea:
				this.cleanGeoEntitiesComboes([1,2,3,4]);
				this.resetBreadcrumbsToBase();
				if(selectedSubAreaItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedAreaItem.name, elmentType:'electionsDashboard' , entityType:0 , key:selectedAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedSubAreaItem.name, elmentType:'electionsDashboard' , entityType:5 , key:selectedSubAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				break;
			case geographicEntityTypes.city:
				this.cleanGeoEntitiesComboes([2,3,4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedAreaItem.name, elmentType:'electionsDashboard' , entityType:0 , key:selectedAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedSubAreaItem.name, elmentType:'electionsDashboard' , entityType:5 , key:selectedSubAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(selectedCityItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedCityItem.name, elmentType:'electionsDashboard' , entityType:1 , key:selectedCityItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				break;
			case geographicEntityTypes.neighborhood:
				this.cleanGeoEntitiesComboes([3,4]);
				this.resetBreadcrumbsToBase();
				
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedAreaItem.name, elmentType:'electionsDashboard' , entityType:0 , key:selectedAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedSubAreaItem.name, elmentType:'electionsDashboard' , entityType:5 , key:selectedSubAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedCityItem.name, elmentType:'electionsDashboard' , entityType:1 , key:selectedCityItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'electionsDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				break;
			case geographicEntityTypes.cluster:
				this.cleanGeoEntitiesComboes([4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedAreaItem.name, elmentType:'electionsDashboard' , entityType:0 , key:selectedAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedSubAreaItem.name, elmentType:'electionsDashboard' , entityType:5 , key:selectedSubAreaItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:selectedCityItem.name, elmentType:'electionsDashboard' , entityType:1 , key:selectedCityItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'electionsDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				if(this.props.searchScreen.selectedCluster.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:this.baseBreadcrumbsURL, title:this.props.searchScreen.selectedCluster.selectedItem.name, elmentType:'electionsDashboard' , entityType:3 , key:this.props.searchScreen.selectedCluster.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
				}
				break;
		}
		if(entityType  ==  4){ // if this is ballot box breadcrumb click - this will not do search action
		   // this.props.getMeasurementsStatuses();
		    this.doManualSearch(entityType , entityKey);
		}
	}
	
	/*
		Helpful function that performs all search actions
	*/
	doManualSearch(entityType , entityKey){
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.RESET_FOUND_VALUES});
	}
	
	/*
		General function thaton clicking geo-entity link name  performs search by entity type and entity key
	*/
	doSearchAction(entityType , entityKey , innerEntityID){
		// console.log(entityType , entityKey , innerEntityID);
				this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'currentPage' , fieldValue : 1});	  
				this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'displayAllCountry' , fieldValue : false});	 
				this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityType' , fieldValue : entityType});	   
				this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityKey' , fieldValue : entityKey});	
			
				switch(entityType){
					case  geographicEntityTypes.area:
						this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'areaId' , fieldValue : innerEntityID});	
						break;
					case  geographicEntityTypes.subArea:
						this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'subAreaId' , fieldValue : innerEntityID});	
						break;
					case  geographicEntityTypes.city:
						this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'cityId' , fieldValue : innerEntityID});	
						if (entityKey && this.props.searchScreen.selectedCity.selectedItem) {
							// ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch, 'city', entityKey, 'electionsDashboard');
							SystemActions.loadClusters(this.props.dispatch, entityKey, false, {get_only_hot_ballots: true});
							SystemActions.loadNeighborhoods(store, entityKey, false, {get_only_hot_ballots: true});
						}
						break;
					case  geographicEntityTypes.neighborhood:
						this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'neighborhoodId' , fieldValue : innerEntityID});	
						break;
					case geographicEntityTypes.cluster:
						this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'clusterId' , fieldValue : innerEntityID});	
						break;
					case geographicEntityTypes.ballotBox: //No search for ballotBox!
				        // this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'ballotId' , fieldValue : innerEntityID});	
						break;
				}	
			this.UpdateTopHeaderSearchByIndex(entityType, entityKey, innerEntityID);
	}
	/**
	 * @method UpdateTopHeaderSearchByIndex
	 * update selected geo item in the header
	 * @param {int} entityType - the selected item entity type
	 * @param {int} innerEntityID - inner entity id
	 */
	UpdateTopHeaderSearchByIndex(entityType, entityKey, innerEntityID) {
		 let selectedItem;let selectedValue ;

		const generalAreasHashTable = this.props.generalAreasHashTable
		switch (entityType) {
			case geographicEntityTypes.area:
				selectedItem = generalAreasHashTable.areas[innerEntityID] || null;
				selectedValue = selectedItem.name || ''
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'selectedArea', fieldValue: { selectedItem: selectedItem , selectedValue: selectedValue }});
				break;
			case geographicEntityTypes.subArea:
				selectedItem = generalAreasHashTable.subAreas[innerEntityID] || generalAreasHashTable.subAreas[innerEntityID + '_0'] || null;
				selectedValue = selectedItem.name || ''
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'selectedSubArea', fieldValue: { selectedItem: selectedItem , selectedValue: selectedValue }});
				break;
			case geographicEntityTypes.city:
				selectedItem = generalAreasHashTable.cities[innerEntityID] || null;
				selectedValue = selectedItem.name || ''
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'selectedCity', fieldValue: { selectedItem: selectedItem , selectedValue: selectedValue }});
				break;
			case geographicEntityTypes.neighborhood:
				selectedItem = generalAreasHashTable.neighborhoods[innerEntityID] || null;
				selectedValue = selectedItem.name || '';
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'selectedNeighborhood', fieldValue: { selectedItem: selectedItem, selectedValue: selectedValue } });
				break;
			case geographicEntityTypes.cluster:
				selectedItem = generalAreasHashTable.clusters[innerEntityID] || null;
				selectedValue = selectedItem.name || '';
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'selectedCluster', fieldValue: { selectedItem: selectedItem, selectedValue: selectedValue } });
				break;
		}
		this.ClickBreadcrumbLink(entityType, entityKey);
		// console.log(selectedItem, selectedValue);
	}
	initLoadingDataObjects() {
		let self = this;
		let entities = ['areas', 'subAreas', 'cities', 'neighborhoods', 'clusters', 'ballotBoxes']
		this.loadingStatsData = {}
		this.loadingPredictionsData = {}
		this.areaArrayKeys = [];
		entities.forEach(function (entityName) {
			self.loadingStatsData[entityName] = {}
			self.loadingPredictionsData[entityName] = {}
		});
		this.loadedSubEntities = { ...this.initLoadedSubEntities }
	}
	resetAllSearchResults(){
		this.initLoadingDataObjects();
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.RESET_ALL_DATA });
		ElectionsActions.loadElectionDayAllCountryBasicStats(this.props.dispatch, this.state.hot);
	}
	refreshAllSearchResults(){
		this.initLoadingDataObjects();
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.REFRESH_ALL_DATA });
		ElectionsActions.loadElectionDayAllCountryBasicStats(this.props.dispatch, this.state.hot);
	}
	cleanAllResultIds(){
		let self = this;
		let resetValueList = ['areaId','subAreaId', 'cityId', 'neighborhoodId', 'clusterId', 'ballotId'];
		resetValueList.forEach(function (name) {
			self.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: name, fieldValue: -1 });
		});
	}
		/*
		Helpful function that cleans geo entities comboes by array of entity types
	*/
	cleanGeoEntitiesComboes(entityTypesArray){
		for(let i = 0 ; i < entityTypesArray.length ; i++){
			if(entityTypesArray[i] == 0){this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			else if(entityTypesArray[i] == 1){this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			else if(entityTypesArray[i] == 2){this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			else if(entityTypesArray[i] == 3){this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCluster' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			else if(entityTypesArray[i] == 4){this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedBallotBox' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			else if(entityTypesArray[i] == 5){this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedSubArea' , fieldValue:{selectedValue:'' , selectedItem:null}});}
		}
   }
   
   /*
	  Function that cleans all lists on main link breadcrumbs click ('כל הארץ')
   */
   CleanSearchResults(){ 
	   this.resetBreadcrumbsToBase();
	   this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : false });
	   this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.RESET_FOUND_VALUES});
	   this.cleanGeoEntitiesComboes([0,1,2,3,4,5]);
	   this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityType' , fieldValue : null});	   
	   this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityKey' , fieldValue : null});
	   this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'displayAllCountry' , fieldValue : true});	  
   }
   
	/*
		Function that handles clicking on tab
	*/
	changeTabPanelNumber(currentTabNumber){
		if(currentTabNumber != 1){ // clicking on 'by hours' tab
			if(!this.isLoadingInterCountryStatsByHours){
				this.isLoadingInterCountryStatsByHours = true;
				ElectionsActions.loadElectionDayAllVotesPredictions(this.props.dispatch, this.state.hot);
			}
		}
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'currentTabNumber' , fieldValue : currentTabNumber});
	}
	setVotesReportingState(name) {
		this.setState({ ballotsDataToDisplay: name })

	}
	getDisplayCountObjName(searchEntityType = null){
		return (this.state.ballotsDataToDisplay == 'all_ballots' || searchEntityType == geographicEntityTypes.ballotBox) 
		? 'ballots_count_data' : 'ballots_reporting_count_data';

	}
	renderVotingTable() {
		let votingUpdatedDateStyle={backgroundColor: 'transparent',marginRight: '35px',border: 'none',top: '6px', fontSize:'16px'}
		return (
			<div className="row" style={{ marginTop: '20px' }}>
				<div className="col-lg-12text-right">
					<div className="container">

						<div className="row dtlsBox-vote-dashboard election-panel-top" style={{ marginTop: '10px' }}>
							<div className="display-election pull-right">הצג</div>
							<div className="pull-right">
								<ul className="nav nav-tabs" role="tablist">
									<li className="vote-panel active">
										<a title="פאנל הצבעה" href="#vote-panel" role="tab" data-toggle="tab" aria-expanded="true" onClick={this.props.currentTabNumber == 1 ? null : this.changeTabPanelNumber.bind(this, 1)}>פאנל הצבעה</a>
									</li>
									<li className="by-hours">
										<a title="לפי שעות" href="#by-hours" role="tab" data-toggle="tab" aria-expanded="false" onClick={this.props.currentTabNumber == 2 ? null : this.changeTabPanelNumber.bind(this, 2)}>לפי שעות</a>
									</li>
									<li style={votingUpdatedDateStyle}>
										<label>עדכון נתונים אחרון</label> <b className="text-success">{this.props.votingUpdatedDate}</b>
									</li>
									<li>
										<div style={{margin:'0 20px', zIndex: 1000}}>
											<label className="radio-inline">
													<input type="radio" name="ballots" value={false} checked={this.state.ballotsDataToDisplay == 'all_ballots'} onChange={() => this.setVotesReportingState('all_ballots')}/> כל הקלפיות
											</label>
											<label className="radio-inline">
													<input type="radio" name="ballots" value={false} checked={this.state.ballotsDataToDisplay == 'reporing_ballots'} onChange={() => this.setVotesReportingState('reporing_ballots')}/> קלפיות מדווחות
											</label>
											{/* <input name="switch" id="one" className="one" type="radio" checked={this.state.ballotsDataToDisplay == 'all_ballots'} onChange={this.setVotesReportingState.bind(this, 'all_ballots')} />
											<label htmlFor="one" className="label-one">
												<span className="on flexed">
													<span>כל הקלפיות</span>
												</span>
											</label>
											<input name="switch" id="three" className="three" type="radio" checked={this.state.ballotsDataToDisplay == 'reporing_ballots'} onChange={this.setVotesReportingState.bind(this, 'reporing_ballots')} />
											<label htmlFor="three" className="label-three">
												<span className="off flexed">
													<span>קלפיות מדווחות</span>
												</span>
											</label> */}
										</div>
										<div style={{margin:'0 20px', zIndex: 1000}}>
											<label className="radio-inline">
													<input type="radio" name="hotBallots" value={false} checked={!this.state.hot} onChange={this.changeHotBallotSelection}/> חמות + קרות
											</label>
											<label className="radio-inline">
												<input type="radio" name="hotBallots" value={true} checked={this.state.hot} onChange={this.changeHotBallotSelection}/> רק חמות
											</label>
										</div>
									</li>
								</ul>
							</div>
						</div>
						<div className="tab-content margin-bottom30">
						<VotingPanelTab
								setUpdatedBreadcrumbs={this.setUpdatedBreadcrumbs.bind(this)}
								resetBreadcrumbsToBase={this.resetBreadcrumbsToBase.bind(this)}
								cleanGeoEntitiesComboes={this.cleanGeoEntitiesComboes.bind(this)}
								doManualSearch={this.doManualSearch.bind(this)}
								ClickBreadcrumbLink={this.ClickBreadcrumbLink.bind(this)}
								CleanSearchResults={this.CleanSearchResults.bind(this)}
								truncateText={this.truncateText.bind(this)}
								getFormattedPercentage={this.getFormattedPercentage.bind(this)}
								doSearchAction={this.doSearchAction.bind(this)}
								getParentArrayByEntityType={this.getParentArrayByEntityType.bind(this)}
								getDisplayCountObjName={this.getDisplayCountObjName.bind(this)}
								ballotsDataToDisplay={this.state.ballotsDataToDisplay}
							/>
							<HourlyVoting getFormattedPercentage={this.getFormattedPercentage.bind(this)}
								truncateText={this.truncateText.bind(this)}
								doSearchAction={this.doSearchAction.bind(this)}
								getParentArrayByEntityType={this.getParentArrayByEntityType.bind(this)}
								getDisplayCountObjName={this.getDisplayCountObjName.bind(this)}
								ballotsDataToDisplay={this.state.ballotsDataToDisplay}
								currentTabNumber={this.props.currentTabNumber}
							/>
						</div>

					</div>
				</div>
			</div>
		)
	}
    render() {
		const dataHasLoaded = Object.keys(this.props.generalAreasHashTable).length == 0;
		const loaderIcon=<div style={{textAlign:'center' , fontSize:'35px'}}><i className="fa fa-spinner fa-spin"></i></div>;
            return (<div>
						<div className="row">
							<div className="col-lg-12">
								<TopHeaderSearch setUpdatedBreadcrumbs={this.setUpdatedBreadcrumbs.bind(this)}  
												 resetBreadcrumbsToBase={this.resetBreadcrumbsToBase.bind(this)}
												 cleanGeoEntitiesComboes={this.cleanGeoEntitiesComboes.bind(this)}
												 doManualSearch={this.doManualSearch.bind(this)}
												 ClickBreadcrumbLink={this.ClickBreadcrumbLink.bind(this)}
												 CleanSearchResults={this.CleanSearchResults.bind(this)}
												 truncateText={this.truncateText.bind(this)}
												 getParentArrayByEntityType = {this.getParentArrayByEntityType.bind(this)}
												 doSearchAction={this.doSearchAction.bind(this)}
												 cleanAllResultIds={this.cleanAllResultIds.bind(this)}
												 resetAllSearchResults={this.resetAllSearchResults.bind(this)}
												 refreshAllSearchResults ={this.refreshAllSearchResults .bind(this)}
												 getDisplayCountObjName={this.getDisplayCountObjName.bind(this)}
												 ballotsDataToDisplay={this.state.ballotsDataToDisplay}
												 />
							</div>
						</div>
						{ dataHasLoaded ? loaderIcon : (this.props.searchEntityType != null) && this.renderVotingTable()}
					</div>
					);
    }
}

function mapStateToProps(state) {
    return {
		currentUser: state.system.currentUser,
		generalAreasHashTable:state.elections.electionsDashboard.generalAreasHashTable,
		searchEntityType:state.elections.electionsDashboard.searchEntityType,
		searchEntityKey:state.elections.electionsDashboard.searchEntityKey,
		votingUpdatedDate:state.elections.electionsDashboard.votingUpdatedDate,
		currentPage:state.elections.electionsDashboard.currentPage,
		searchScreen:state.elections.electionsDashboard.searchScreen,
		numberOfContryStatesAreasNumber:state.elections.electionsDashboard.numberOfContryStatesAreasNumber,
		geoEntitySupportersVotersPercents:state.elections.electionsDashboard.geoEntitySupportersVotersPercents,
		geoEntityAllVotersPercents:state.elections.electionsDashboard.geoEntityAllVotersPercents,
		areaId:state.elections.electionsDashboard.areaId,
		subAreaId:state.elections.electionsDashboard.subAreaId,
		cityId:state.elections.electionsDashboard.cityId,
		neighborhoodId:state.elections.electionsDashboard.neighborhoodId,
		clusterId:state.elections.electionsDashboard.clusterId,
		ballotId:state.elections.electionsDashboard.ballotId,
		currentTabNumber:state.elections.electionsDashboard.currentTabNumber,
		allCountryDataLoaded:state.elections.electionsDashboard.allCountryDataLoaded,
		currentUserCitiesList: state.system.currentUserGeographicalFilteredLists.cities,

    }
}

export default connect(mapStateToProps) (withRouter(ElectionDay));