import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../../libs/globalFunctions';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

class TopHeaderSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state={filteredCities : [],filteredAreasList : [] , filteredSubAreasList : [] , filteredNeighborhoodsList:[] , showSearch:true};
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
		
	}

    componentWillReceiveProps(nextProps) {
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
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.RESET_FOUND_VALUES});
		this.getDataAndHeaders();
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : true });
		this.setUpdatedBreadcrumbs();
		this.setState({showSearch:false});
	}
	
	/*
		Helpful function that cleans geo entities comboes by array of entity types
	*/
	cleanGeoEntitiesComboes(entityTypesArray){
		 for(let i = 0 ; i < entityTypesArray.length ; i++){
			 if(entityTypesArray[i] == 0){this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 1){this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCity' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 2){this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedNeighborhood' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 3){this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCluster' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 4){this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedBallotBox' , fieldValue:{selectedValue:'' , selectedItem:null}});}
			 else if(entityTypesArray[i] == 5){this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedSubArea' , fieldValue:{selectedValue:'' , selectedItem:null}});}
		 }
	}
	
	/*
	   Function that cleans all lists on main link breadcrumbs click ('כל הארץ')
	*/
	CleanSearchResults(){ 
		this.resetBreadcrumbsToBase();
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : false });
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.RESET_FOUND_VALUES});
		this.cleanGeoEntitiesComboes([0,1,2,3,4,5]);
	}
	/*
		Function that handles click on breadcrumb : 
	*/
	ClickBreadcrumbLink(entityType , entityKey){
		switch(entityType){
			case 0:
				this.cleanGeoEntitiesComboes([1,2,3,4,5]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				break;
			case 1:
				this.cleanGeoEntitiesComboes([2,3,4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				break;
			case 2:
				this.cleanGeoEntitiesComboes([3,4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				break;
			case 3:
				this.cleanGeoEntitiesComboes([4]);
				this.resetBreadcrumbsToBase();
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
				if(this.props.searchScreen.selectedNeighborhood.selectedItem){
					this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
				}
				this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedCluster.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:3 , key:this.props.searchScreen.selectedCluster.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
				break;
			case 4:
				 
				break;
		}
		if(entityType < 4){ // if this is ballot box breadcrumb click - this will not do search action
		    this.props.getMeasurementsStatuses();
		    this.doManualSearch(entityType , entityKey);
		}
	}
	
	/*
		Helpful function that performs all search actions
	*/
	doManualSearch(entityType , entityKey){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.RESET_FOUND_VALUES});
		ElectionsActions.loadDashboardGeographicSumsStatistics(this.props.dispatch , entityType , entityKey);
		ElectionsActions.loadDashboardSupportStatusesCount(this.props.dispatch , entityType , entityKey);
		ElectionsActions.loadDashboardSupportOfficialRoles(this.props.dispatch , entityType , entityKey , null);
		ElectionsActions.loadDashboardTransportation(this.props.dispatch , entityType , entityKey);
		ElectionsActions.loadSupportStatusesComparison(this.props.dispatch , entityType , entityKey , null);
	}
	selectAllCountry(){
		this.CleanSearchResults();
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : true });
		this.doManualSearch(null , null);
	}
	/*
		Handles clicking city inside top left corner - static cities : 
	*/
	setComboesAndSearchByCityKey(cityName){
		let entityKey = '',  areaKey='' , areaName='';
		let areaID = -1 , cityID = -1;
		for(let i = 0 ; i < this.state.filteredCities.length ; i++){
			 
			if(this.state.filteredCities[i].name == cityName){
				entityKey = this.state.filteredCities[i].key; 
				areaID = this.state.filteredCities[i].area_id; 
				cityID = this.state.filteredCities[i].id; 
				this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedCity' , fieldValue:{selectedValue:this.state.filteredCities[i].name , selectedItem:this.state.filteredCities[i]}});
				break;
			}
		}
		for(let i = 0 ; i < this.state.filteredAreasList.length ; i++){
			if(this.state.filteredAreasList[i].id == areaID){
				this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.state.filteredAreasList[i].name , selectedItem:this.state.filteredAreasList[i]}});
				areaKey = this.state.filteredAreasList[i].key;
				areaName = this.state.filteredAreasList[i].name;
				break;
			}
		}
		this.dataHeader  = cityName;
		let entityType = 1;
		if(entityKey != ''){
			let supportStatusesKeys = [];
			for(let i = 0 ; i < this.props.supportStatus.length ; i++){
					supportStatusesKeys.push(this.props.supportStatus[i].key);
			}
			this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'showAllSearchResults' , fieldValue : true });
			let today = new Date() , dayOnly = today.getDay(), nDaysAgo = today.setDate(today.getDate() - 30) , endDate = '';
			let startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
			startDate = moment(startDate).format('YYYY-MM-DD');
			endDate = parseDateToPicker(new Date()); // Current data and time
			endDate = moment(endDate).format('YYYY-MM-DD');
			let searchObj = {
				area_id: areaID,
				sub_area_id: cityID,
				city_id: null,
				cluster_id: null,
				ballot_id: null,
				summary_by_id: 0,
				start_date: startDate,
				end_date: endDate,
				entity_type:this.props.measureSupportScreen.selectedSupportStatusType.selectedItem.id,
				selected_statuses: supportStatusesKeys
			};
			ElectionsActions.dashboardPreElectSupportsMeasurements(this.props.dispatch , searchObj);
			this.doManualSearch(entityType , entityKey);
			this.resetBreadcrumbsToBase();
			this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:areaName, elmentType:'preElectionsDashboard' , entityType:0 , key:areaKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
			this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:cityName, elmentType:'preElectionsDashboard' , entityType:1 , key:entityKey , onClick:this.ClickBreadcrumbLink.bind(this)} });
		 }
	}
	
	/*
		Helpful function that reset basic breadcrumbs
	*/
	resetBreadcrumbsToBase(){
		this.props.dispatch({ type: SystemActions.ActionTypes.RESET_BREADCRUMBS });
	    this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:'דשבורד - כל הארץ', elmentType:'preElectionsDashboard' , onClick:this.selectAllCountry.bind(this) } });
	}
	
	/*
		Function that updates current breadcrumbs 
	*/
	setUpdatedBreadcrumbs(){
		this.resetBreadcrumbsToBase();
		if(this.props.searchScreen.selectedArea.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedArea.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:0 , key:this.props.searchScreen.selectedArea.selectedItem.key , onClick:this.ClickBreadcrumbLink.bind(this)} });
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedCity.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:1 , key:this.props.searchScreen.selectedCity.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
		}
		if(this.props.searchScreen.selectedNeighborhood.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedNeighborhood.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:2 , key:this.props.searchScreen.selectedNeighborhood.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this)} });
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:this.props.searchScreen.selectedCluster.selectedItem.name, elmentType:'preElectionsDashboard' , entityType:3 , key:this.props.searchScreen.selectedCluster.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
		}
		if(this.props.searchScreen.selectedBallotBox.selectedItem){
			  this.props.dispatch({ type: SystemActions.ActionTypes.ADD_BREADCRUMBS, newLocation: { url:'elections/dashboards/pre_elections_day', title:('קלפי ' + this.props.searchScreen.selectedBallotBox.selectedItem.id ), elmentType:'preElectionsDashboard' , entityType:4  , key:this.props.searchScreen.selectedBallotBox.selectedItem.key, onClick:this.ClickBreadcrumbLink.bind(this) } });
		}
	}
	
	/*
	    create geo-entity header from selected combo boxes
	*/
	getDataAndHeaders(){
		let entityType = -1 ,  entityKey = '';
		if(this.props.searchScreen.selectedArea.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedArea.selectedItem.name;
			entityType = 0;
			entityKey = this.props.searchScreen.selectedArea.selectedItem.key;
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
		this.props.getMeasurementsStatuses();
		ElectionsActions.loadDashboardGeographicSumsStatistics(this.props.dispatch , entityType , entityKey);
		ElectionsActions.loadDashboardSupportStatusesCount(this.props.dispatch , entityType , entityKey);
		ElectionsActions.loadDashboardSupportOfficialRoles(this.props.dispatch , entityType , entityKey , null);
		ElectionsActions.loadDashboardTransportation(this.props.dispatch , entityType , entityKey);
		ElectionsActions.loadSupportStatusesComparison(this.props.dispatch , entityType , entityKey , null);
	}

	/*
	Handles 'clean all' button
	*/
	cleanAllSearchValues(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'all' , withComboes:true});
	    this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities});
		this.setState({filteredAreasList : this.props.currentUserGeographicalFilteredLists.areas});	
		this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas});	
	}
	/*
		Function that cleans combo by its name : 
	*/
	cleanCombo(filterName){
		this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:filterName, withComboes:true });
	}
	/*
           Handles change in one of comboes 
    */
    searchFieldComboValueChange(fieldName , e){
             this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName , fieldValue:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
	         let self = this;
			 switch (fieldName){
                  case 'selectedArea' :
				     let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || city.area_id == e.target.selectedItem.id});
					 this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function(subArea){return !e.target.selectedItem || subArea.area_id == e.target.selectedItem.id})});
                     this.setState({filteredCities : newFilteredCities});
					 this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'area' , withComboes:false});
					 break;
                  case 'selectedSubArea' :
				  this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'subarea' , withComboes:false});
                     if(this.props.searchScreen.selectedArea.selectedItem){
						this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id)})});
						this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'subarea' , withComboes:false});
                     }
                     else{
                        this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities.filter(function(city){return !e.target.selectedItem || (city.sub_area_id == e.target.selectedItem.id)})});
                        if(e.target.selectedItem){
							for(let i = 0 ;i < this.props.currentUserGeographicalFilteredLists.areas.length;i++){
                                 if(this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id){
									   this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , selectedItem:this.props.currentUserGeographicalFilteredLists.areas[i]}});
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
								this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.state.filteredAreasList[i].name , selectedItem:this.state.filteredAreasList[i]}});
								break;
							}
						}
					}
				    this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'city' , withComboes:false});
				    if(e.target.selectedItem){
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , e.target.selectedItem.key);
                        SystemActions.loadClusters(this.props.dispatch , e.target.selectedItem.key,false);
                        SystemActions.loadNeighborhoods(store , e.target.selectedItem.key,false);
                     }
                     else{
							this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters:[] });
							this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: [] });
							this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
	                  }
                     break;
				  case 'selectedNeighborhood' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'neighborhood' , withComboes:false});
					if(e.target.selectedItem){
						SystemActions.loadDashboardNeighborhoodClusters(store , e.target.selectedItem.key);
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'neighborhood' , e.target.selectedItem.key);
					}
					else{
						 if(this.props.searchScreen.selectedCity.selectedItem){
							 SystemActions.loadClusters(this.props.dispatch , this.props.searchScreen.selectedCity.selectedItem.key);
							 ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , this.props.searchScreen.selectedCity.selectedItem.key);
						 }
						 else{
							this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters:[] });
							this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
						 }
					}
					break;
				  case 'selectedCluster' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'cluster' , withComboes:false});
				    if(e.target.selectedItem){
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'cluster' , e.target.selectedItem.key);
					}
					else{
						if(this.props.searchScreen.selectedCity.selectedItem){
							ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , this.props.searchScreen.selectedCity.selectedItem.key);
						}
						else{
							this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
						}
					}
					break;
                  default:
                     break;
				}      
    }
	
	/*
		Handles showing/collapsing geo-search panel
	*/
	showHideSearchBar(){
		this.setState({showSearch:!this.state.showSearch});
	}
  
    render() {
            this.initDynamicVariables();
            return (<div>
						<div className="row pageHeading1 ">
						    <div className="row">
								<div className="col-lg-12" style={{height:'0px'}}>
								{this.props.searchScreen.showAllSearchResults && <div><div className="pull-right"><h1>{this.dataHeader} | </h1></div>
									<div className="vote-right">
										{this.props.searchScreen.totalVoters == -1 ? <i className="fa fa-spinner fa-spin"></i> : this.props.searchScreen.totalVoters.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} &nbsp;
											בעלי זכות בחירה</div>
									<div className="houses">
										{this.props.searchScreen.totalHouseholds == -1 ? <i className="fa fa-spinner fa-spin"></i> : this.props.searchScreen.totalHouseholds.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} &nbsp;
											בתי אב</div>
								</div>}
								<div className="select-city-erea pull-left" >
									<div className="btnRow">
										<a  onClick={this.setComboesAndSearchByCityKey.bind(this , 'ירושלים')}><button title="ירושלים" className="btn btn-default select-city-btn">ירושלים</button></a>
										<a  onClick={this.setComboesAndSearchByCityKey.bind(this , 'בני ברק')}><button title="בני ברק" className="btn btn-default select-city-btn">בני ברק</button></a>
										<a onClick={this.setComboesAndSearchByCityKey.bind(this , 'אשדוד')}><button title="אשדוד" className="btn btn-default select-city-btn">אשדוד</button></a>
										<a onClick={this.setComboesAndSearchByCityKey.bind(this , 'חיפה')}><button title="חיפה" className="btn btn-default select-city-btn"> חיפה</button></a>
										<a onClick={this.selectAllCountry.bind(this , 'כל הארץ')}><button title="כל הארץ" className="btn btn-default select-city-btn"> כל הארץ</button></a>
										<button title="בחר איזור" className="btn btn-default select-erea-btn" data-toggle="collapse" data-target="#erea-fields" aria-expanded="true" onClick={this.showHideSearchBar.bind(this)}>בחר איזור  </button>
									</div>
								</div>
							</div>
						</div>
						{this.state.showSearch && <div id="erea-fields" className={"row erea-fields-box  collapse in"  } aria-expanded={this.state.showSearch}>
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
										<div><a style={this.handCursor} onClick={this.cleanAllSearchValues.bind(this)} title="נקה הכל">נקה הכל</a> </div>
									</div>
								</div>
							</div>
						</div>}
						</div>
				</div>
			); 
    }
}
function mapStateToProps(state) {
    return {
           searchScreen:state.elections.preElectionsDashboard.searchScreen,
           measureSupportScreen:state.elections.preElectionsDashboard.measureSupportScreen,
		   currentUser: state.system.currentUser,
		   currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		   clusters:state.system.lists.clusters,
		   neighborhoods:state.system.lists.neighborhoods,
		   supportStatus:state.system.lists.supportStatus,
    }
}
export default connect(mapStateToProps) (withRouter(TopHeaderSearch));