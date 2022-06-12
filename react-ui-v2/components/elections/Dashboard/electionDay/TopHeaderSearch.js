import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../../global/Combo';
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

import {geographicEntityTypes} from 'libs/constants'
import { isEmptyOrNotObject } from '../../../../libs/globalFunctions';

class TopHeaderSearch extends React.Component {
    constructor(props) {
		super(props);
		this.initstate = { filteredCities: [], filteredAreasList: [], filteredSubAreasList: [], filteredNeighborhoodsList: [] };
		this.state = { ...this.initstate };
		this.initConstants();
	}
	
	/*
		Function that init constant variables : 
	*/
    initConstants() {
       this.handCursor = {cursor:'pointer'};
	   this.initDataHeader = 'אחוז הצבעה ארצי';
	   this.searchButtonDisable = true;
    }
	
	/*
		Init dynamic variables on render function
	*/
	initDynamicVariables(){

		const nameOfCountObj = this.props.getDisplayCountObjName(this.props.searchEntityType);

		this.totalHouseholdsCount = this.props[nameOfCountObj].total_households_count;
		this.totalVotersCount = this.props[nameOfCountObj].total_voters_count;
		this.dataHeader = this.initDataHeader;
		if (this.props.searchEntityType != -1 && this.props.searchEntityType != null){
			this.totalHouseholdsCount = null;
			this.totalVotersCount = null;
			this.dataHeader = this.props.screenHeader;
			let currentGeoEntityObject = this.props.getParentArrayByEntityType();
			if (currentGeoEntityObject.name) {
				this.dataHeader = currentGeoEntityObject.name;
			}
			if (currentGeoEntityObject.voteStats) {
				if (currentGeoEntityObject.voteStats[nameOfCountObj]) {
					this.totalVotersCount = currentGeoEntityObject.voteStats[nameOfCountObj].total_voters_count;
					this.totalHouseholdsCount = currentGeoEntityObject.voteStats[nameOfCountObj].total_households_count;
				} else if (currentGeoEntityObject.voteStats.empty) {
					this.totalVotersCount = 0;
					this.totalHouseholdsCount = 0;
				}
			}


			 
		}
	}

    componentWillReceiveProps(nextProps) {
		const newState = { ...this.state }
		let needToUpdateState = false;

		if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.cities.length > 0 && nextProps.currentUserGeographicalFilteredLists.areas.length > 0)
		{     
			if(!this.state.loadedAreasAndCities){	
				newState.loadedAreasAndCities = true;			   
				newState.filteredCities=nextProps.currentUserGeographicalFilteredLists.cities;
				newState.filteredAreasList=nextProps.currentUserGeographicalFilteredLists.areas;
				needToUpdateState = true;		   
			}
		}
		if(nextProps.currentUser &&  nextProps.currentUserGeographicalFilteredLists.sub_areas.length > 0)
	    {   
			if(!this.state.loadedSubAreas){
				newState.loadedSubAreas=true;	
				newState.filteredSubAreasList=nextProps.currentUserGeographicalFilteredLists.sub_areas;		
				needToUpdateState = true;		   
			}
		}
		if (nextProps.searchScreen.selectedArea.selectedItem && !this.props.searchScreen.selectedArea.selectedItem) {
			let e = nextProps.searchScreen.selectedArea;
			let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return !e.selectedItem || city.area_id == e.selectedItem.id });
			newState.filteredSubAreasList = this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function (subArea) { return !e.selectedItem || subArea.area_id == e.selectedItem.id });
			newState.filteredCities = newFilteredCities;
			this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE, cleanFromFilter: 'neighborhood', withComboes: false });
			needToUpdateState = true;		   
		} 
		this.checkValidValues(newState, nextProps);
		if(needToUpdateState){
			this.setState(newState)
		}
    }
	
	/*
		handles left search button - geographic search
	*/
	doGeographicSearch(){	
		this.getDataAndHeaders();
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'displayAllCountry' , fieldValue : false});
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'currentPage' , fieldValue : 1});
		this.props.cleanAllResultIds();
	}
	/*
		Handles clicking city inside top left corner - static cities : 
	*/
	setComboesAndSearchByCityKey(cityName){
		this.props.CleanSearchResults();
		let areaID = -1 , cityID = -1;
		let currentGeoCity = this.findCityByName(cityName);
		if(!currentGeoCity){ // If city not exist in election campaign.
			return;
		}
		areaID = currentGeoCity.area_id;
		cityID = currentGeoCity.id;
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME,
			fieldName: 'displayAllCountry', fieldValue: false
		});
		this.props.dispatch({
			type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME,
			screenName: 'searchScreen', fieldName: 'selectedCity',
			fieldValue: {
				selectedValue: currentGeoCity.name,
				selectedItem: currentGeoCity
			}
		});

		for(let i = 0 ; i < this.props.currentUserGeographicalFilteredLists.areas.length ; i++){
			if(this.props.currentUserGeographicalFilteredLists.areas[i].id == areaID){
				this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,
				  fieldName:'selectedArea' , fieldValue:{selectedValue:this.props.currentUserGeographicalFilteredLists.areas[i].name , selectedItem:this.props.currentUserGeographicalFilteredLists.areas[i]}});
				break;
			}
		}
		let currentCity = this.props.generalAreasHashTable.cities[cityID];
		if ( cityID == -1 || !currentCity) { return; }
		 
		 let requestCityEntitiesData = {get_only_hot_ballots: true};
		 ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , currentCity.key ,'electionsDashboard', requestCityEntitiesData);
         SystemActions.loadClusters(this.props.dispatch , currentCity.key, false, requestCityEntitiesData);
		 SystemActions.loadNeighborhoods(store , currentCity.key, false, requestCityEntitiesData);
		
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'searchEntityType', fieldValue: 1 });
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'searchEntityKey', fieldValue: currentCity.key });
	
	}

	/*
	    create geo-entity header from selected combo boxes
	*/
	getDataAndHeaders(){
		let entityType = null ,  entityKey = '';
		if(this.props.searchScreen.selectedArea.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedArea.selectedItem.name;
			entityType = geographicEntityTypes.area;
			entityKey = this.props.searchScreen.selectedArea.selectedItem.key;
		}
		if(this.props.searchScreen.selectedSubArea.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedSubArea.selectedItem.name;
			entityType = 5;
			entityKey = this.props.searchScreen.selectedSubArea.selectedItem.key;
		}
		if(this.props.searchScreen.selectedCity.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedCity.selectedItem.name;
			entityType = geographicEntityTypes.city;
			entityKey = this.props.searchScreen.selectedCity.selectedItem.key;
		}
		if(this.props.searchScreen.selectedNeighborhood.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedNeighborhood.selectedItem.name;
			entityType = geographicEntityTypes.neighborhood;
			entityKey = this.props.searchScreen.selectedNeighborhood.selectedItem.key;
		}
		if(this.props.searchScreen.selectedCluster.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedCluster.selectedItem.name;
			entityType = geographicEntityTypes.cluster;
			entityKey = this.props.searchScreen.selectedCluster.selectedItem.key;
		}
		if(this.props.searchScreen.selectedBallotBox.selectedItem){
			this.dataHeader = this.props.searchScreen.selectedBallotBox.selectedItem.id;
			entityType = geographicEntityTypes.ballotBox;
			entityKey = this.props.searchScreen.selectedBallotBox.selectedItem.key;
		}
		// console.log(entityType, entityKey);
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityType' , fieldValue : entityType});
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityKey' , fieldValue : entityKey}); 
	}
	displayAllCountries(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'displayAllCountry' , fieldValue : true});
		this.cleanAllSearchValues(true);
	}
	/*
	Handles 'clean all' button
	*/
	resetAllSearchResults(){
		this.props.resetAllSearchResults();
	}
	refreshAllSearchResults(){
		this.props.refreshAllSearchResults();
	}
	cleanAllSearchValues(getAllCountry){
		let searchEntityType = getAllCountry ? -1 : null;
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'searchEntityType' , fieldValue : searchEntityType});
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'all' , withComboes:true});
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'currentPage' , fieldValue : 1});

	    this.setState({filteredCities : this.props.currentUserGeographicalFilteredLists.cities});
		this.setState({filteredAreasList : this.props.currentUserGeographicalFilteredLists.areas});	
		this.setState({filteredSubAreasList : this.props.currentUserGeographicalFilteredLists.sub_areas});	
		this.props.cleanAllResultIds();
		 this.resetSystemValues('area');
	}

	/*
		Function that cleans combo by its name : 
	*/
	cleanCombo(filterName){
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:filterName, withComboes:true });
		this.resetSystemValues(filterName);
	}
	resetSystemValues(filterName){
		let requestCityEntitiesData = {get_only_hot_ballots: true};
		switch (filterName) {
			case 'area':
				this.setState({ filteredCities: this.props.currentUserGeographicalFilteredLists.cities, filteredSubAreasList: [] });
				this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters: [] });
				this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: [] });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'ballotBoxes', fieldValue: [] });
				break;
			case 'subarea':
				this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters: [] });
				this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: [] });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'ballotBoxes', fieldValue: [] });
				break;
			case 'city':
				this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters: [] });
				this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS, neighborhoods: [] });
				this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'ballotBoxes', fieldValue: [] });
				break;
			case 'neighborhood':
				if (this.props.searchScreen.selectedCity.selectedItem) {
					SystemActions.loadClusters(this.props.dispatch, this.props.searchScreen.selectedCity.selectedItem.key, false, requestCityEntitiesData);
					ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch, 'city', this.props.searchScreen.selectedCity.selectedItem.key, 'electionsDashboard', requestCityEntitiesData);
				}
				else {
					this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS, clusters: [] });
					this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'ballotBoxes', fieldValue: [] });
				}
				break;
			case 'cluster':
					this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'ballotBoxes' , fieldValue : [] });
				break;
		}

	}
	/**
	 * @method checkValidValues
	 * Check if search combo values is valid
	 * Include validation style for combo inputs
	 * @param {obj} newState 
	 * @param {obj} nextProps 
	 */
	checkValidValues(newState, nextProps) {
		let self = this;

		if (isEmptyOrNotObject(this.props.generalAreasHashTable)) {
			this.searchButtonDisable = true;
			return;
		}
		//Check if some value had changed
		let valueHadChanged = false;

		const fieldNames = ['selectedArea', 'selectedCity', 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox']
		fieldNames.forEach(function (fieldName) {
			if (nextProps.searchScreen[fieldName] != self.props.searchScreen[fieldName]) {
				valueHadChanged = true
			}
		})
		if (!valueHadChanged) { return; }
		//End Check if some value had changed
		
		let searchButtonDisable = false;
		let searchValuesExist = false;

		fieldNames.forEach(function (fieldName) {
			let validField = self.checkValidField(nextProps, fieldName)
			let styleName = fieldName + 'Style';
			if (validField) {
				searchValuesExist = true;
				newState[styleName] = {}
			} else {
				searchButtonDisable = true;
				newState[styleName] = { border: '1px solid red' }
			}
		});
		this.searchButtonDisable = searchButtonDisable  || !searchValuesExist;

	}
	/**
	 * @method checkValidField
	 * - Check validation of single combo field
	 * @param {*} nextProps 
	 * @param {*} fieldName 
	 */
	checkValidField(nextProps, fieldName) {
		let validField = true;
		let currentItem = nextProps.searchScreen[fieldName];
		if (currentItem.selectedItem) {
			validField = true;
		} else if (currentItem.selectedValue.trim() != '') {
			validField = false;
		}
		return validField;
	}
	/*
           Handles change in one of comboes
    */
    searchFieldComboValueChange(fieldName , e){
             this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName , fieldValue:{selectedValue:e.target.value , selectedItem:e.target.selectedItem}});
			 let self = this;
			 let requestCityEntitiesData = {get_only_hot_ballots: true};
			 switch (fieldName){
					case 'selectedArea' :
					  this.cleanCombo('subarea');
					 if (e.target.selectedItem) {
						 let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return city.area_id == e.target.selectedItem.id });
						let filteredSubAreasList = this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function (subArea) { return subArea.area_id == e.target.selectedItem.id });
						 this.setState({ filteredCities: newFilteredCities, filteredSubAreasList: filteredSubAreasList });
					 }
					 break;
				  case 'selectedSubArea' :
				  	this.cleanCombo('city');

					 if (e.target.selectedItem) {
						 if (this.props.searchScreen.selectedArea.selectedItem) {

							 this.setState({ filteredCities: this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return (city.area_id == self.props.searchScreen.selectedArea.selectedItem.id && city.sub_area_id == e.target.selectedItem.id) }) });
						 }
						 else {
							 this.setState({ filteredCities: this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return (city.sub_area_id == e.target.selectedItem.id) }) });
							 for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.areas.length; i++) {
								 if (this.props.currentUserGeographicalFilteredLists.areas[i].id == e.target.selectedItem.area_id) {
									 this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName: 'searchScreen', fieldName: 'selectedArea', fieldValue: { selectedValue: this.props.currentUserGeographicalFilteredLists.areas[i].name, selectedItem: this.props.currentUserGeographicalFilteredLists.areas[i] } });
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
								this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' , fieldValue:{selectedValue:this.state.filteredAreasList[i].name , selectedItem:this.state.filteredAreasList[i]}});
								break;
							}
						}
					}
				    this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'neighborhood' , withComboes:false});
				    if(e.target.selectedItem){
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , e.target.selectedItem.key ,'electionsDashboard', requestCityEntitiesData);
                        SystemActions.loadClusters(this.props.dispatch , e.target.selectedItem.key, false, requestCityEntitiesData);
						SystemActions.loadNeighborhoods(store , e.target.selectedItem.key, false, requestCityEntitiesData);
                     }
					else { this.resetSystemValues('city'); }
                     break;
				  case 'selectedNeighborhood' :
				    this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'cluster' , withComboes:false});
					if(e.target.selectedItem){
						SystemActions.loadDashboardNeighborhoodClusters(store , e.target.selectedItem.key, requestCityEntitiesData);
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'neighborhood' , e.target.selectedItem.key , 'electionsDashboard', requestCityEntitiesData);
					}
					else { this.resetSystemValues('neighborhood'); }
					break;
				  case 'selectedCluster' :
				
				    this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE , cleanFromFilter:'ballot' , withComboes:false});
				    if(e.target.selectedItem){
						   
						ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'cluster' , e.target.selectedItem.key , 'electionsDashboard', requestCityEntitiesData);
					}
					else{
						if(this.props.searchScreen.selectedCity.selectedItem){
							ElectionsActions.loadDashboardBallotBoxesByParams(this.props.dispatch , 'city' , this.props.searchScreen.selectedCity.selectedItem.key, requestCityEntitiesData);
						}else{this.resetSystemValues('cluster'); }
					}
					break;
				}      
		}
		/**
		 * @method findCityByName
		 * find city in geo lists by city name
		 * @param {string} cityName 
		 */
	findCityByName(cityName) {
		let currentCity = null;
		for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.cities.length; i++) {
			if(this.props.currentUserGeographicalFilteredLists.cities[i].name == cityName){
				currentCity = this.props.currentUserGeographicalFilteredLists.cities[i];
				break;
			}
		}
		return currentCity;
	}
	findAreaByName(areaName) {
		let currentArea = null;
		for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.areas.length; i++) {
			if(this.props.currentUserGeographicalFilteredLists.areas[i].name == areaName){
				currentArea = this.props.currentUserGeographicalFilteredLists.areas[i];
				break;
			}
		}
		return currentArea;
	}
/**
* @method findCityByName
* find all main cities that are exist in user geo lists.
	-> Remove also cities that not exist in election campaign.
*/
	citiesExistInGeoLists(mainCityList){
		let mainCityListTemp = [...mainCityList];

		let existCitiesNames = [];
		for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.cities.length; i++) {
			let tempCity = this.props.currentUserGeographicalFilteredLists.cities[i];
			let cityIndex = mainCityListTemp.indexOf(tempCity.name)
			if(  cityIndex != -1 ){
				existCitiesNames.push(tempCity.name);
				mainCityListTemp.splice(cityIndex, 1)
				if(mainCityListTemp.length == 0){ break;	} //If all cities exist in lists.
			}
		}
		return existCitiesNames;
	}
	areaExistInGeoLists(mainAreasList){
		let mainAreasListTemp = [...mainAreasList];
		let existAreasNames = [];
		for (let i = 0; i < this.props.currentUserGeographicalFilteredLists.areas.length; i++) {
			let tempArea = this.props.currentUserGeographicalFilteredLists.areas[i];
			let areaIndex = mainAreasListTemp.indexOf(tempArea.name)
			if(  areaIndex != -1 ){
				existAreasNames.push(tempArea.name);
				mainAreasListTemp.splice(areaIndex, 1)
				if(mainAreasListTemp.length == 0){ break;	} //If all cities exist in lists.
			}
		}
		return existAreasNames;
	}
	renderCitiesButtons(countryAreasStatsEmpty) {
		let self = this;
		let mainCityList = ['ירושלים', 'בני ברק', 'אשדוד'];

		let existCitiesNames = this.citiesExistInGeoLists(mainCityList);
		let citiesHtml = mainCityList.map( (cityName, index) => {
		let isCityExistInCampaign = (existCitiesNames.indexOf(cityName) != -1);
			return (<a key={index} onClick={this.setComboesAndSearchByCityKey.bind(this, cityName)}>
				<button disabled={countryAreasStatsEmpty || !isCityExistInCampaign} title={cityName} className="btn btn-primary select-city-btn">{cityName}</button></a>)
		});
		return citiesHtml;
	}
	renderAreasButtons(countryAreasStatsEmpty){
		let mainAreasList = ['ערים ש"ס'];

		let existAreasNames = this.areaExistInGeoLists(mainAreasList);
		let areasHtml = mainAreasList.map( (areaName, index) => {
		let isAreaExistInCampaign = (existAreasNames.indexOf(areaName) != -1);
			return (<a key={index} onClick={this.selectAreaByName.bind(this, areaName)}>
				<button disabled={countryAreasStatsEmpty || !isAreaExistInCampaign} title={areaName} className="btn btn-primary select-city-btn">{areaName}</button></a>)
		});
		return areasHtml;
	}
	selectAreaByName(areaName){
		this.props.CleanSearchResults();
		let currentGeoArea= this.findAreaByName(areaName);
		if(!currentGeoArea){ // If city not exist in election campaign.
			return;
		}
		let newFilteredCities = this.props.currentUserGeographicalFilteredLists.cities.filter(function (city) { return city.area_id == currentGeoArea.id });
		let filteredSubAreasList = this.props.currentUserGeographicalFilteredLists.sub_areas.filter(function (subArea) { return subArea.area_id == currentGeoArea.id });
		 this.setState({ filteredCities: newFilteredCities, filteredSubAreasList: filteredSubAreasList });

		 this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'searchScreen' ,  fieldName:'selectedArea' ,
		  fieldValue:{selectedValue:currentGeoArea.name , selectedItem: currentGeoArea}});

		  this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'searchEntityType', fieldValue: 0 });
		  this.props.dispatch({ type: ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME, fieldName: 'searchEntityKey', fieldValue: currentGeoArea.key });
		this.props.dispatch({type:ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME ,  fieldName:'displayAllCountry' , fieldValue : false});


	}
    render() {
		this.initDynamicVariables();
		let countryAreasStatsEmpty = Object.keys(this.props.generalAreasHashTable).length == 0;
		return (<div>
						<div className="row pageHeading1 ">
						    <div className="row">
								<div className="col-lg-12" style={{height:'0px'}}>
								<div><div className="pull-right"><h1>{this.props.truncateText(this.dataHeader,16)} | </h1></div>
									<div className="vote-right">
										{(!this.totalVotersCount && this.totalVotersCount != '0') ? <i className="fa fa-spinner fa-spin"></i> : this.totalVotersCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} &nbsp;
											בעלי זכות בחירה</div>
									<div className="houses">
										{(!this.totalHouseholdsCount && this.totalHouseholdsCount != '0') ? <i className="fa fa-spinner fa-spin"></i> : this.totalHouseholdsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} &nbsp;
											בתי אב</div>
								</div> 
								<div className="select-city-erea pull-left" >
									<div className="btnRow">
										{this.renderCitiesButtons(countryAreasStatsEmpty)}
										{this.renderAreasButtons(countryAreasStatsEmpty)}
										{this.props.currentUser.admin && <a onClick={this.displayAllCountries.bind(this)}><button disabled={countryAreasStatsEmpty}  title="הכל" className="btn btn-success select-city-btn">הכל</button></a>}
										<button disabled={countryAreasStatsEmpty} title="בחר אזור" className="btn btn-default select-erea-btn" data-toggle="collapse" data-target="#erea-fields" aria-expanded="true">בחר אזור  </button>
									</div>
								</div>
							</div>
						</div>
						<div id="erea-fields" className="row erea-fields-box" aria-expanded="false">
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
									<div className="dtlsBox-in  col-lg-3" >
										<div>
											<label htmlFor="erea-search" className="erea-search-fields-top">איזור</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'area')} title="נקה">נקה</a> </span>
										</div>
										<div>
										<Combo items={this.state.filteredAreasList} placeholder="בחר אזור"
											value={this.props.searchScreen.selectedArea.selectedValue}
											inputStyle={this.state.selectedAreaStyle}
											maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
											onChange={this.searchFieldComboValueChange.bind(this, 'selectedArea')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="sub-erea-search" className="erea-search-fields-top">תת איזור</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'subarea')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.state.filteredSubAreasList} placeholder="בחר תת אזור"  value={this.props.searchScreen.selectedSubArea.selectedValue}
 										       maxDisplayItems={5}  itemIdProperty="id" itemDisplayProperty='name'  onChange={this.searchFieldComboValueChange.bind(this , 'selectedSubArea')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-3">
										<div>
											<label htmlFor="city-search" className="erea-search-fields-top">עיר</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'city')} title="נקה">נקה</a> </span>
										</div>
										<div>
										<Combo items={this.state.filteredCities } placeholder="בחר עיר" maxDisplayItems={5}
											value={this.props.searchScreen.selectedCity.selectedValue }
											inputStyle={this.state.selectedCityStyle}
											itemIdProperty="id" itemDisplayProperty='name'
											onChange={this.searchFieldComboValueChange.bind(this, 'selectedCity')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="special-erea-search" className="erea-search-fields-top">איזור מיוחד</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'neighborhood')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.props.neighborhoods} placeholder="בחר אזור מיוחד" maxDisplayItems={5}
												value={this.props.searchScreen.selectedNeighborhood.selectedValue}
												inputStyle={this.state.selectedNeighborhoodStyle}
												itemIdProperty="id" itemDisplayProperty='name'
												onChange={this.searchFieldComboValueChange.bind(this, 'selectedNeighborhood')} />
										</div>
									</div>
									<div className="dtlsBox-in  col-lg-2">
										<div>
											<label htmlFor="eshcol-search" className="erea-search-fields-top">אשכול</label>
											<span className="pull-left erea-search-fields-top"><a style={this.handCursor} onClick={this.cleanCombo.bind(this,'cluster')} title="נקה">נקה</a> </span>
										</div>
										<div>
											<Combo items={this.props.clusters} placeholder="בחר אשכול" maxDisplayItems={5}
												value={this.props.searchScreen.selectedCluster.selectedValue}
												inputStyle={this.state.selectedClusterStyle}
												itemIdProperty="id" itemDisplayProperty='name'
												onChange={this.searchFieldComboValueChange.bind(this, 'selectedCluster')} />
									    </div>
									</div>
									{/*
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
									*/}
									<div className="box-buttons-search">
									<div className="pull-left">
										<button title="בטל" type="submit" className="btn btn-primary cancel-btn" data-toggle="collapse" data-target="#erea-fields" aria-expanded="true">בטל</button>
										<button title="בחר" type="submit" className="btn btn-primary select-btn" disabled={this.searchButtonDisable} onClick={this.doGeographicSearch.bind(this)}>בחר</button>
									</div>

									<div><a style={{ ...this.handCursor, marginTop: '5px' }} onClick={this.cleanAllSearchValues.bind(this, false)} title="נקה הכל">נקה הכל</a> </div>
									<div className="pull-right" style={{ paddingRight: '20px' }}>
										<button className="btn btn-danger" style={{ padding: '3px 12px' }} onClick={this.resetAllSearchResults.bind(this)} title="אפס נתונים">אפס נתונים</button>
									</div>
									<div className="pull-right" style={{ paddingRight: '20px' }}>
										<button className="btn btn-warning" style={{ padding: '3px 12px' }} onClick={this.refreshAllSearchResults.bind(this)} title="רענן נתונים">רענן נתונים</button>
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
		generalAreasHashTable: state.elections.electionsDashboard.generalAreasHashTable,
		ballots_count_data: state.elections.electionsDashboard.ballots_count_data,
		ballots_reporting_count_data: state.elections.electionsDashboard.ballots_reporting_count_data,
		searchScreen: state.elections.electionsDashboard.searchScreen,
		currentUser: state.system.currentUser,
		currentUserGeographicalFilteredLists: state.system.currentUserGeographicalFilteredLists,
		clusters: state.system.lists.clusters,
		neighborhoods: state.system.lists.neighborhoods,
		supportStatus: state.system.lists.supportStatus,
		displayAllCountry: state.elections.electionsDashboard.displayAllCountry,
		screenHeader: state.elections.electionsDashboard.screenHeader,
		searchEntityType: state.elections.electionsDashboard.searchEntityType,
		searchEntityKey: state.elections.electionsDashboard.searchEntityKey,
	}
}
export default connect(mapStateToProps) (withRouter(TopHeaderSearch));