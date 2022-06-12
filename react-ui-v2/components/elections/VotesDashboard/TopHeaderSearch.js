import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from 'components/global/Combo';
import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import store from 'store';

class TopHeaderSearch extends React.Component {
    constructor(props) {
        super(props);
		this.timerLimit = 300;//300 seconds = 5 minutes
        this.state={filteredCities : [],filteredAreasList : [] , filteredSubAreasList : [] , filteredNeighborhoodsList:[] , timeleft:300 };
        this.initConstants();
    }
	
	/*
		Function that init constant variables : 
	*/
    initConstants() {
       this.handCursor = {cursor:'pointer'};
	   this.dataHeader = '';
    }
	
	/*
		Init dynamic variables on render function
	*/
	initDynamicVariables(){
		this.searchButtonDisable = (!this.props.searchScreen.selectedArea.selectedItem && !this.props.searchScreen.selectedCity.selectedItem && !this.props.searchScreen.selectedNeighborhood.selectedItem && !this.props.searchScreen.selectedCluster.selectedItem && !this.props.searchScreen.selectedBallotBox.selectedItem);
		this.disableButtonExcelCity= !this.props.searchScreen.selectedBallotBox.selectedItem?false:true;
	}
	
	componentWillMount(){
		
		if(Object.size(this.props.mainScreenData) > 0 || this.props.searchScreen.search_source != ''){
			let self = this;
			this.downloadTimer = setInterval(function () {
						self.setState({ timeleft: (self.state.timeleft - 1) });
						if (self.state.timeleft <= 0) {
								self.reloadData();
						}
					}, 1000);
		}
	}
	
	componentWillUnmount(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'source_city_name' , fieldValue : '' });
		clearInterval(this.downloadTimer);
	}

    componentWillReceiveProps(nextProps) {
			if(this.props.searchScreen.search_source != '' && nextProps.searchScreen.search_source == ''){
				this.setState({timeleft:this.timerLimit});
				//console.log("clean interval");
				clearInterval(this.downloadTimer);
				//console.log("clean search type name");
			}
			else{
				if(this.props.searchScreen.search_source !=   nextProps.searchScreen.search_source  ){
					this.setState({timeleft:this.timerLimit});
					//console.log("clean interval and set new");
					clearInterval(this.downloadTimer);
					let self = this;
					this.downloadTimer = setInterval(function () {
						self.setState({ timeleft: (self.state.timeleft - 1) });
						if (self.state.timeleft <= 0) {
								self.reloadData();
						}
					}, 1000);
					//console.log("change search type name from : " + this.props.searchScreen.search_source + " to type " + nextProps.searchScreen.search_source);
				}
		}
	 
		if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.cities.length > 0 && nextProps.currentUserGeographicalFilteredLists.areas.length > 0)
		{     
                if(!this.state.loadedAreasAndCities){	
                    this.setState({loadedAreasAndCities:true});			   
					this.setState({filteredCities : nextProps.currentUserGeographicalFilteredLists.cities});
					this.setState({filteredAreasList : nextProps.currentUserGeographicalFilteredLists.areas});		   
                }
		}
		if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.sub_areas.length > 0)
	    {   
          		if(!this.state.loadedSubAreas){
					this.setState({loadedSubAreas:true});	
					this.setState({filteredSubAreasList : nextProps.currentUserGeographicalFilteredLists.sub_areas});			   
				}
		}
    }
	
	/*
		handles left search button - geographic search
	*/
	doGeographicSearch(){
		this.setState({timeleft:this.timerLimit});
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'search_source' , fieldValue : 'geo_entity' });
		if(this.props.searchScreen.source_city_name !=''){
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'source_city_name' , fieldValue : '' });
		} 
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES});
		this.getDataAndHeaders();
		this.setUpdatedBreadcrumbs();
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : true });
	}

	downloadExcelBySearch(){
		
		let objectEntity=this.getObjectEntityBySelectedItem();
		ElectionsActions.downloadExcelDashboardArrivalDate(this.props.dispatch,objectEntity.entityType,objectEntity.entityKey);
	}

	downloadExcelBySearchGroupBallotBox(){
		
		let objectEntity=this.getObjectEntityBySelectedItem();
		ElectionsActions.downloadExcelDashboardArrivalDateGroupBallotBox(this.props.dispatch,objectEntity.entityType,objectEntity.entityKey);
	}

	
	
	/*
		Helpful function that cleans geo entities comboes by array of entity types
	*/
	cleanGeoEntitiesComboes(entityTypesArray){
		 for(let i = 0 ; i < entityTypesArray.length ; i++){
			 if(entityTypesArray[i] == 0){this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 1){this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 2){this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 3){this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCluster' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 4){this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedBallotBox' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 5){this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedSubArea' , fieldValue:{selectedValue:'' , selectedItem:null}});}
		 }
	}
	
	/*
		Function that handles click on breadcrumb : 
	*/
	ClickBreadcrumbLink(entityType , entityKey){
		this.setState({timeleft:this.timerLimit});
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'search_source' , fieldValue : 'bread' });
		if(this.props.searchScreen.source_city_name !=''){
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'source_city_name' , fieldValue : '' });
		} 
		switch(entityType){
			case 0:
				this.cleanGeoEntitiesComboes([1,2,3,4,5]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'votesDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				break;
			case 1:
				this.cleanGeoEntitiesComboes([2,3,4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'votesDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'votesDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				break;
			case 2:
				this.cleanGeoEntitiesComboes([3,4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'votesDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'votesDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'votesDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				break;
			case 3:
				this.cleanGeoEntitiesComboes([4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'votesDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'votesDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'votesDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedCluster.selectedItem.name, elmentType:'votesDashboard' , entityType:3 , key:this.props.searchScreen.selectedCluster.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
				break;
			case 4:
				 
				break;
		}
		if(entityType < 4){ // if this is ballot box breadcrumb click - this will not do search action
		    this.doManualSearch(entityType , entityKey);
		}
	}
	
	/*
		Function that updates current breadcrumbs 
	*/
	setUpdatedBreadcrumbs(){
		this.resetBreadcrumbsToBase();
		if(this.props.searchScreen.selectedArea.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'votesDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'votesDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
		}
		if(this.props.searchScreen.selectedNeighborhood.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'votesDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:this.props.searchScreen.selectedCluster.selectedItem.name, elmentType:'votesDashboard' , entityType:3 , key:this.props.searchScreen.selectedCluster.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
		}
		if(this.props.searchScreen.selectedBallotBox.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:('קלפי ' + this.props.searchScreen.selectedBallotBox.selectedItem.id ), elmentType:'votesDashboard' , entityType:4  , key:this.props.searchScreen.selectedBallotBox.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
		}
	}
	
	
	/*
	   Function that cleans all lists on main link breadcrumbs click ('כל הארץ')
	*/
	CleanSearchResults(){ 
		this.resetBreadcrumbsToBase();
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : false });
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES});
		this.cleanGeoEntitiesComboes([0,1,2,3,4 , 5]);
	}
	
		/*
		Helpful function that reset basic breadcrumbs
	*/
	resetBreadcrumbsToBase(){
		this.props.dispatch({ type: SystemActions.ActionTypes.RESET_BREADCRUMBS });
	    this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:'בקרת פעילי יום בחירות', elmentType:'votesDashboard' , onClick:this.CleanSearchResults.bind(this) } });
	}
	
	 
	/*
		Helpful function that performs all search actions
	*/
	doManualSearch(entityType , entityKey){
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES});
		//this.getDataAndHeaders();
	}
	
	/*
		Handles clicking city inside top left corner - static cities : 
	*/
	setComboesAndSearchByCityKey(cityName , resetValue = true){
		this.setState({timeleft:this.timerLimit});
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'search_source' , fieldValue : 'city' });
		let entityKey = '',  areaKey='' , areaName='';
		let areaID = -1 , cityID = -1;
		for(let i = 0 ; i < this.state.filteredCities.length ; i++){
			 
			if(this.state.filteredCities[i].name == cityName){
				entityKey = this.state.filteredCities[i].key; 
				areaID = this.state.filteredCities[i].area_id; 
				cityID = this.state.filteredCities[i].id; 
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCity' , fieldValue:{selectedValue:this.state.filteredCities[i].name , selectedItem:this.state.filteredCities[i]}});
				break;
			}
		}
 
		for(let i = 0 ; i < this.state.filteredAreasList.length ; i++){
			if(this.state.filteredAreasList[i].id == areaID){
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.state.filteredAreasList[i].name , selectedItem:this.state.filteredAreasList[i]}});
				areaKey = this.state.filteredAreasList[i].key;
				areaName = this.state.filteredAreasList[i].name;
				break;
			}
		}
 
		let entityType = 1;
		if(entityKey != ''){
			if(resetValue){
				//console.log("reset");
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES});
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:areaName, elmentType:'votesDashboard' , entityType:0 , key:areaKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:cityName, elmentType:'votesDashboard' , entityType:1 , key:entityKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'source_city_name' , fieldValue : cityName });
				this.cleanGeoEntitiesComboes([2,3,4]);
				ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , entityKey , 'votesDashboard');
                SystemActions.loadClusters(this.props.dispatch , entityKey , false);
                SystemActions.loadNeighborhoods(store , entityKey , false);
			}
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : true });
			ElectionsActions.getVoterDashboardMainScreen(this.props.dispatch , {entity_type:entityType , entity_key:entityKey , hot_ballots:this.props.hotBallots});
			
		 }
	}

	/*
		Handles clicking area inside top left corner - static areas : 
	*/
	setComboesAndSearchByAreaKey(areaName , resetValue = true){
		this.setState({timeleft:this.timerLimit});
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'search_source' , fieldValue : 'area' });
		let areaKey='';
		let areaId = -1;
 
		for(let i = 0 ; i < this.state.filteredAreasList.length ; i++){
			if(this.state.filteredAreasList[i].name == areaName){
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.state.filteredAreasList[i].name , selectedItem:this.state.filteredAreasList[i]}});
				areaId = this.state.filteredAreasList[i].id;
				areaKey = this.state.filteredAreasList[i].key;
				areaName = this.state.filteredAreasList[i].name;
				break;
			}
		}
 
		let entityType = 0;
		if(areaKey != ''){
			if(resetValue){
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES});
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:areaName, elmentType:'votesDashboard' , entityType:0 , key:areaKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'source_area_name' , fieldValue : areaName });
				this.cleanGeoEntitiesComboes([1,2,3,4,5]);
				let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return city.area_id == areaId});
				this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function(subArea){return subArea.area_id == areaId})});
				this.setState({filteredCities : newFilteredCities});
			}
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : true });
			ElectionsActions.getVoterDashboardMainScreen(this.props.dispatch , {entity_type:entityType , entity_key:areaKey , hot_ballots:this.props.hotBallots});
			
		 }
	}


	getObjectEntityBySelectedItem(){
		let entityType = -1 ,  entityKey = '';
		if(this.props.searchScreen.selectedArea.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedArea.selectedItem.name;
			entityType = 0;
			entityKey = this.props.searchScreen.selectedArea.selectedItem.key;
		}
		if(this.props.searchScreen.selectedSubArea.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedSubArea.selectedItem.id;
			entityType = 5;
			entityKey = this.props.searchScreen.selectedSubArea.selectedItem.key;
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedCity.selectedItem.name;
			entityType = 1;
			entityKey = this.props.searchScreen.selectedCity.selectedItem.key;
		}
		if(this.props.searchScreen.selectedNeighborhood.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedNeighborhood.selectedItem.name;
			entityType = 2;
			entityKey = this.props.searchScreen.selectedNeighborhood.selectedItem.key;
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedCluster.selectedItem.name;
			entityType = 3;
			entityKey = this.props.searchScreen.selectedCluster.selectedItem.key;
		}
		if(this.props.searchScreen.selectedBallotBox.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedBallotBox.selectedItem.id;
			entityType = 4;
			entityKey = this.props.searchScreen.selectedBallotBox.selectedItem.key;
		}

		return {'entityKey':entityKey,'entityType':entityType};
	}
	
	/*
	    create geo-entity header from selected combo boxes
	*/
	getDataAndHeaders(){
	
		let objectEntity=this.getObjectEntityBySelectedItem();
		let entityType=objectEntity.entityType;
		let entityKey=objectEntity.entityKey;
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'entityType' , fieldValue: entityType});
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName:'entityKey' , fieldValue: entityKey});
	
		ElectionsActions.getVoterDashboardMainScreen(this.props.dispatch , {entity_type:entityType , entity_key:entityKey , hot_ballots:this.props.hotBallots , hot_ballots:this.props.hotBallots});
		
		
		this.resetBreadcrumbsToBase();
		//this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:areaName, elmentType:'votesDashboard' , entityType:0 , key:areaKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
		//this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/votes/dashboard', title:cityName, elmentType:'votesDashboard' , entityType:1 , key:entityKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
		
	}
	
	doCleanTimer(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'search_source' , fieldValue : '' });
	}

	/*
	Handles 'clean all' button
	*/
	cleanAllSearchValues(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'all' , withComboes:true});
	    this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities});
		this.setState({filteredAreasList : this.props.currentUserGeographicalFilteredLists.areas});	
		this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas});
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES});
		this.resetBreadcrumbsToBase();
		this.doCleanTimer();
	}
	/*
		Function that cleans combo by its name : 
	*/
	cleanCombo(filterName){
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:filterName, withComboes:true });
	}
	/*
           Handles change in one of comboes 
    */
    searchFieldComboValueChange(fieldName , e){
             this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName , fieldValue:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
	         let self = this;
			 switch (fieldName){
                  case 'selectedArea' :
				     let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || city.area_id == e.target.selectedItem.id});
					 this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function(subArea){return !e.target.selectedItem || subArea.area_id == e.target.selectedItem.id})});
                     this.setState({filteredCities : newFilteredCities});
					 this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'area' , withComboes:false});
					 break;
                  case 'selectedSubArea' :
				  this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'subarea' , withComboes:false});
                     if(this.props.searchScreen.selectedArea.selectedItem){
						this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'subarea' , withComboes:false});
                     }
                     else{
                        this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.sub_area_id == e.target.selectedItem.id)})});
                        if(e.target.selectedItem){
							for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
									   this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , selectedItem:this.props.currentUserGeographicalFilteredLists.areas[i]}});
                                       break;
                                 }
							}
                        }
                     }
                     break;
                  case 'selectedCity' :
					if(!this.props.searchScreen.selectedArea.selectedItem && e.target.selectedItem){
						for(let i = 0 ; i < this.state.filteredAreasList.length ; i++){
							if(this.state.filteredAreasList[i].id == e.target.selectedItem.area_id){
								this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.state.filteredAreasList[i].name , selectedItem:this.state.filteredAreasList[i]}});
								break;
							}
						}
					}
				    this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'city' , withComboes:false});
				    if(e.target.selectedItem){
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , e.target.selectedItem.key , 'votesDashboard');
                        SystemActions.loadClusters(this.props.dispatch , e.target.selectedItem.key , false);
                        SystemActions.loadNeighborhoods(store , e.target.selectedItem.key , false);
                     }
                     else{
							this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters:[] });
							this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: [] });
							this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
	                  }
                     break;
				  case 'selectedNeighborhood' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'neighborhood' , withComboes:false});
					if(e.target.selectedItem){
						SystemActions.loadDashboardNeighborhoodClusters(store , e.target.selectedItem.key);
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'neighborhood' , e.target.selectedItem.key , 'votesDashboard');
					}
					else{
						 if(this.props.searchScreen.selectedCity.selectedItem){
							 SystemActions.loadClusters(this.props.dispatch , this.props.searchScreen.selectedCity.selectedItem.key , false);
							 ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , this.props.searchScreen.selectedCity.selectedItem.key , 'votesDashboard');
						 }
						 else{
							this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters:[] });
							this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
						 }
					}
					break;
				  case 'selectedCluster' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'cluster' , withComboes:false});
				    if(e.target.selectedItem){
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'cluster' , e.target.selectedItem.key , 'votesDashboard');
					}
					else{
						if(this.props.searchScreen.selectedCity.selectedItem){
							ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , this.props.searchScreen.selectedCity.selectedItem.key , 'votesDashboard');
						}
						else{
							this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
						}
					}
					break;
                  default:
                     break;
				}      
    }
	
	/*
		Handle clicking "all country" button that shows stats for all areas
	*/
	showAllStats(){
		this.setState({timeleft:300});
		ElectionsActions.getVoterDashboardMainScreen(this.props.dispatch , {hot_ballots:this.props.hotBallots} );
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES , cleanSearchScreen:true});
		this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'search_source' , fieldValue : 'all' });
		if(this.props.searchScreen.source_city_name !=''){
			this.props.dispatch({type:ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'source_city_name' , fieldValue : '' });
		} 
	}
	
	reloadData(){
		switch(this.props.searchScreen.search_source){
			case 'all':
				this.setState({timeleft:300});
				ElectionsActions.getVoterDashboardMainScreen(this.props.dispatch , {hot_ballots:this.props.hotBallots} );
				//console.log("all");
				break;
			case 'city':
				this.setComboesAndSearchByCityKey(this.props.searchScreen.source_city_name , false);
				//console.log("city");
				break;
			case 'geo_entity':
				this.doGeographicSearch();
				//console.log("geo_entity");
				break;
			case 'bread':
				this.doGeographicSearch();
				//console.log("bread");
				break;
		}
		//console.log("reload data - " + this.props.searchScreen.search_source);
	}
	
	changeHotBallotSelection(value, fieldName){
		this.props.dispatch({type: ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME, fieldName , fieldValue: value});
	}
	
	doNop(){
		
	}
  
	getFormattedTimeLeft(timeleft){
		let minutes = parseInt(timeleft/60);
		let seconds = parseInt(timeleft) - 60*minutes;
		
		return ((minutes < 10 ? ("0"+minutes) : minutes ) + ":" + (seconds < 10 ? ("0"+seconds) : seconds ));
	}

	renderSwitchButton(){
		return (
			<div style={{margin:'0 20px'}}>
				<label className="radio-inline">
						<input type="radio" name="hotBallots" id="inlineRadio11" value="option11"  checked={this.props.hotBallots == 0} onChange={this.doNop.bind(this)} onClick={this.changeHotBallotSelection.bind(this , 0, 'hotBallots')}/> כל הקלפיות
				</label>
				&nbsp;&nbsp;
				&nbsp;&nbsp;
				<label className="radio-inline">
					<input type="radio" name="hotBallots" id="inlineRadio1" value="option1" checked={this.props.hotBallots == 1} onChange={this.doNop.bind(this)} onClick={this.changeHotBallotSelection.bind(this , 1, 'hotBallots')}/> חמות + קרות
				</label>
					&nbsp;&nbsp;
					&nbsp;&nbsp;
				<label className="radio-inline">
					<input type="radio" name="hotBallots" id="inlineRadio2" value="option2" checked={this.props.hotBallots == 2} onChange={this.doNop.bind(this)} onClick={this.changeHotBallotSelection.bind(this, 2, 'hotBallots')}/> חמות בלבד
				</label>
			</div>
		)
	}

    render() {
			 
			let baseURL = window.Laravel.baseURL;
            this.initDynamicVariables();
            return (<div style={{marginTop:'-40px'}}>
						<div className="row pageHeading1 ">
						    <div className="row">
								<div className="col-lg-12" style={{height:'0px'}}>
								<div className="select-city-erea pull-left" >
									<div className="btnRow">
										<a  onClick={this.setComboesAndSearchByCityKey.bind(this , 'ירושלים')}><button title="ירושלים" className="btn btn-default select-city-btn">ירושלים</button></a>
										<a  onClick={this.setComboesAndSearchByCityKey.bind(this , 'בני ברק')}><button title="בני ברק" className="btn btn-default select-city-btn">בני ברק</button></a>
										<a onClick={this.setComboesAndSearchByCityKey.bind(this , 'אשדוד')}><button title="אשדוד" className="btn btn-default select-city-btn">אשדוד</button></a>
										<a onClick={this.setComboesAndSearchByAreaKey.bind(this , 'ערים ש"ס')}><button title='ערים ש"ס' className="btn btn-default select-city-btn"> ערים ש"ס</button></a>
										<button title="בחר איזור" className="btn btn-default select-erea-btn" data-toggle="collapse" data-target="#erea-fields" aria-expanded="false">בחר איזור  </button>
										
										{this.props.currentUser.admin && <button title="כל הארץ" className="btn btn-default select-city-btn select-country-btn" onClick={this.showAllStats.bind(this)}>כל הארץ</button>}
									
									</div>
								</div>
							</div>
						</div>
						<div id="erea-fields" className="row erea-fields-box collapse-in" aria-expanded="true">
							<div className="row erea-search-fields nomargin">
								<div className=" col-lg-2 mate-box" style={{minHeight:'135px'}}>
									<div className="dtlsBox clearfix" >
										<div>
											
											<label htmlFor="mate-search" className="erea-search-fields-top">מטה</label>
											<span className="pull-left erea-search-fields-top"><a href="#" title="נקה">נקה</a> </span>
										</div>
										<div>
											<select className="form-control" id="mate-search" disabled={true}>
												<option>הכל</option>
											</select>
										</div>
										<div className="box-button-single">
											<button title="בטל" type="submit" className="btn btn-primary cancel-btn" data-toggle="collapse"  disabled={true} data-target="#erea-fields" aria-expanded="true">בטל</button>
											<button title="הצג" type="submit" className="btn btn-primary select-btn"  disabled={true}>הצג</button>
										</div>
									</div>
								</div>
								<div className="col-lg-10 dtlsBox-group"  style={{minHeight:'135px'}} >
									<div className="dtlsBox-in  col-lg-2" >
										<div>
											<label htmlFor="erea-search" className="erea-search-fields-top">איזור</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'all')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo  items={this.state.filteredAreasList} placeholder="בחר אזור"  value={this.props.searchScreen.selectedArea.selectedValue} 
               								   maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name' onChange={this.searchFieldComboValueChange.bind(this , 'selectedArea')}   /> 
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2"   >
										<div>
											<label htmlFor="sub-erea-search" className="erea-search-fields-top">תת איזור</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'area')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.state.filteredSubAreasList} placeholder="בחר תת אזור"  value={this.props.searchScreen.selectedSubArea.selectedValue}
 										       maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  onChange={this.searchFieldComboValueChange.bind(this , 'selectedSubArea')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="city-search" className="erea-search-fields-top">עיר</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'subarea')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.state.filteredCities} placeholder="בחר עיר"  maxDisplayItems={5}   value={this.props.searchScreen.selectedCity.selectedValue}
										       itemIdProperty="id" itemDisplayProperty='name'   onChange={this.searchFieldComboValueChange.bind(this , 'selectedCity')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="special-erea-search" className="erea-search-fields-top">איזור מיוחד</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'neighborhood')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.props.neighborhoods} placeholder="בחר אזור מיוחד"  maxDisplayItems={5}  value={this.props.searchScreen.selectedNeighborhood.selectedValue}  
												itemIdProperty="id" itemDisplayProperty='name'   onChange={this.searchFieldComboValueChange.bind(this , 'selectedNeighborhood')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="eshcol-search" className="erea-search-fields-top">אשכול</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'cluster')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.props.clusters} placeholder="בחר אשכול"  maxDisplayItems={5}  value={this.props.searchScreen.selectedCluster.selectedValue}  
										itemIdProperty="id" itemDisplayProperty='name' onChange={this.searchFieldComboValueChange.bind(this , 'selectedCluster')}  />
									    </div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="poll-search" className="erea-search-fields-top">קלפי</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'ballot')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.props.searchScreen.ballotBoxes} placeholder="בחר קלפי"  maxDisplayItems={5}   value={this.props.searchScreen.selectedBallotBox.selectedValue}  
												itemIdProperty="id" itemDisplayProperty='name'  onChange={this.searchFieldComboValueChange.bind(this , 'selectedBallotBox')}  />
										</div>
									</div>
									<div className="box-buttons-search">
										<div className="pull-left">
											<button title="בטל" type="submit" className="btn btn-primary cancel-btn"  data-toggle="collapse" data-target="#erea-fields" aria-expanded="true">בטל</button>
											<button title="בחר" type="submit" className="btn btn-primary select-btn" disabled={this.searchButtonDisable} onClick={this.doGeographicSearch.bind(this)}>בחר</button>
										</div>
										<div>
											<a style={this.handCursor} onClick={this.cleanAllSearchValues.bind(this)} title="נקה הכל">נקה הכל</a> </div>
										</div>
										{(Object.size(this.props.mainScreenData) > 0 || this.props.searchScreen.search_source != '') && <div className="pull-left" style={{paddingLeft:'30px' , marginTop:'5px'}}>
											{this.getFormattedTimeLeft(this.state.timeleft)}	<a className="cursor-pointer" title="ריענון" onClick={this.reloadData.bind(this)}> <img src={baseURL + "Images/sand-clock-refresh-icon.png"} alt="ריענון"/></a>
										</div>}
										
										<div style={{marginRight:'20px',position:'absolute',display:'flex',height:'32px'}}>
										<div className="conBtn" disabled={this.searchButtonDisable || this.disableButtonExcelCity}>
											<button  title="יצא דוח אקסל" type="submit" className="btn btn-primary select-btn" disabled={this.searchButtonDisable || this.disableButtonExcelCity} onClick={this.downloadExcelBySearch.bind(this)}><i style={{marginLeft:'7px'}} className="fa fa-file-excel-o"></i>פירוט עיר</button>
										</div>
										<div style={{paddingLeft:'10px',borderLeft:'1px solid #bcbdbc'}} className="conBtn" disabled={this.searchButtonDisable}>
										<button style={{marginRight:'10px'}} title="יצא דוח אקסל" type="submit" className="btn btn-primary select-btn" disabled={this.searchButtonDisable} onClick={this.downloadExcelBySearchGroupBallotBox.bind(this)}><i style={{marginLeft:'7px'}} className="fa fa-file-excel-o"></i> פירוט קלפיות</button>
										</div>
												<div style={{padding:'10px', display:'flex'}}>
														{this.renderSwitchButton()}
														{/* {this.renderColdSwitchButton()} */}
												</div>
										</div>
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
		   detailsSearch:state.elections.votesDashboardScreen,
           searchScreen:state.elections.votesDashboardScreen.searchScreen,
		   currentUser: state.system.currentUser,
		   currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		   clusters:state.system.lists.clusters,
		   neighborhoods:state.system.lists.neighborhoods,
		   mainScreenData: state.elections.votesDashboardScreen.mainScreenData,
		   hotBallots: state.elections.votesDashboardScreen.hotBallots,
		   notColdBallots: state.elections.votesDashboardScreen.notColdBallots,
    }
}
export default connect(mapStateToProps) (withRouter(TopHeaderSearch));