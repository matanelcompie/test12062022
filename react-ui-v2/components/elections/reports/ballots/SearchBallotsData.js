import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';
import Combo from 'components/global/Combo';
import ElectionCampainItem from './ElectionCampainItem';

import * as ElectionsActions from 'actions/ElectionsActions';


class SearchBallotsData extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            area_id: null,
                searchFields: {
                area_name: '',

                sub_area_id: null,
                sub_area_name: '',

                city_id: null,
                city_name: '',

                cluster_id: null,
                cluster_name: '',

                neighborhood: {id: null, name: ''},

                ballot_id: null,
                ballot_name: '',

                selected_statuses: [],
				selected_ballots:[],
				selected_clusters:[],
				selected_neighborhoods:[],
				selected_cities:[],
 

                summary_by_id: null,
                summary_by_name: '',

                selected_campaigns: {},

                is_district_city: false,
                is_ballot_strictly_orthodox: false,
                is_entity_in_current_election: false,

                display_num_of_votes: true,
                display_vote_statistics: true,
                display_statuses_statistics: true , 
                
                display_strictly_orthodox_percents: false , 
                display_sephardi_percents: false , 
                display_prev_votes_percents: false , 

				cityComboTextValue:'',
				cityNeighborhoodTextValue:'',
				cityClusterTextValue:'',
				cityBallotTextValue:'',
            },

            combos: {
                subAreas: [],
                cities: [],
                clusters: [],

                supportStatuses: []
            }
		};

        this.initConstants(props);
    }

    initConstants(props) {
        this.summaryBy = require('../../../../libs/constants').ballotsPollingSummary.summaryBy;
        this.supportNoneKey = 'support_none';

        this.labels = {
            district: 'רק ערי מחוז',
            orthodox: 'רק קלפיות חרדיות',
            current_election: ' הקיימות במערכת נוכחית ',

            numOfVoters: 'מספר תושבים כללי',
            votesStatistics: 'נתוני הצבעות',
            supportStatusesStatistics: 'נתוני סטטוסים',

            displayStatuses: 'סטטוסים להצגה',

            displayElectionCampaigns: 'הצג מערכת בחירות להשוואה',
            strictlyOrthodoxPercents: 'הצג אחוז חרדים',
            sephardiPercents: 'הצג אחוז ספרדים',
            prevElectionVotesPercents: 'הצג אחוזי בחירה ש"ס',
        };

        this.summaryByArr = [
            {id: this.summaryBy.none, name: 'ללא'},
            {id: this.summaryBy.byArea, name: 'איזור'},
            {id: this.summaryBy.byCity, name: 'עיר'},
            {id: this.summaryBy.byCluster, name: 'אשכול'},
            {id: this.summaryBy.byBallot, name: 'קלפי'}
        ];

        this.invalidColor = '#cc0000';

        this.emptyNeighborhood = {id: null, name: ''};

        this.electionCampaignsHash = {};
        if (props.userFilteredCities.length > 0) {
            this.state.combos.cities = props.userFilteredCities;
        }
    }

    componentWillReceiveProps(nextProps) {
        if ( this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0 ) {
            let combos = this.state.combos;

            combos.cities = nextProps.userFilteredCities;
			if(nextProps.userFilteredCities.length == 1){
				let tempCitiesList =  nextProps.userFilteredCities ;
				let constructedEvent = {target:{value:tempCitiesList[0].name , selectedItems:[tempCitiesList[0]]}};
				this.cityChange(constructedEvent,nextProps);
			}
            this.setState({combos});
        }
 
        if ( this.props.clusters.length == 0 && nextProps.clusters.length > 0 || (this.props.clusters !=  nextProps.clusters)) {
            let combos = this.state.combos;

            combos.clusters = nextProps.clusters;
			
            this.setState({combos});
        }
		if(nextProps.neighborhoods.length == 1  && nextProps.clusters.length > 0 && !this.loadedPrimaryNeighborhoods  ){
			 this.loadedPrimaryNeighborhoods = true;
			 let tempNeighborhoodsList =  nextProps.neighborhoods ;
			 let tempClustersList =  nextProps.clusters ;
			 let hasAlsoNoNeighborhood = false;
			 for(let k = 0 ; k < tempClustersList.length ; k++){
				 if(!tempClustersList[k].neighborhood_id){
					 hasAlsoNoNeighborhood = true;
					 break;
				 }
			 }
			 if(!hasAlsoNoNeighborhood ){
				let constructedEvent = {target:{value:tempNeighborhoodsList[0].name , selectedItems:[tempNeighborhoodsList[0]]}};
				this.neighborhoodChange(constructedEvent,nextProps);
			}
		}
	 
		if(nextProps.clusters.length == 1 && nextProps.neighborhoods.length > 0 && !this.loadedPrimaryNeighborhoodsCluster  ){
			    this.loadedPrimaryNeighborhoodsCluster   = true;
				let tempClustersList =  nextProps.clusters ;
				let constructedEvent = {target:{value:tempClustersList[0].name , selectedItems:[tempClustersList[0]]}};
				this.clusterChange(constructedEvent , nextProps);
		}
	    else if(nextProps.clusters.length == 1 && nextProps.neighborhoods.length == 0&& !this.loadedPrimaryCluster){
			this.loadedPrimaryCluster   = true;
				let tempClustersList =  nextProps.clusters ;
				let constructedEvent = {target:{value:tempClustersList[0].name , selectedItems:[tempClustersList[0]]}};
				this.clusterChange(constructedEvent , nextProps);
		}
		if(nextProps.ballots.length == 1 && !this.loadedPrimaryBallot){
			this.loadedPrimaryBallot=true;
			let tempBallotsList =  nextProps.ballots ;
			let constructedEvent = {target:{value:'' , selectedItems:[tempBallotsList[0]]}};
			this.ballotChange(constructedEvent);
		}

        if (this.props.electionCampaigns && this.props.electionCampaigns.length == 0 && nextProps.electionCampaigns && nextProps.electionCampaigns.length > 0 ) {
            this.buildElectionCampaignsHash(nextProps.electionCampaigns);
        }
        if ( this.props.supportStatuses.length == 0 && nextProps.supportStatuses.length > 0 ) {
            let suppotNoneArr = [{id: 0, key: this.supportNoneKey, name: 'ללא סטטוס'}];

            let combos = this.state.combos;
            combos.supportStatuses = suppotNoneArr.concat(nextProps.supportStatuses);
			 
			let searchFields = {...this.state.searchFields};
			searchFields.selected_statuses = combos.supportStatuses;
			this.setState({searchFields});
        }
    }

    cancelSearch() {
        ElectionsActions.cancelBallotsPollingSummary();

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.UNSET_LOADING_DATA_FLAG});
    }

    displayBallotsPollingSummary(event) {
        // Prevent page refresh
        event.preventDefault();

        if ( !this.validInput ) {
            return;
        }
        let searchObj = {
            area_id: this.state.searchFields.area_id,
            sub_area_id: this.state.searchFields.sub_area_id,
			
			/*
            city_id: this.state.searchFields.city_id,
            neighborhood_id: this.state.searchFields.neighborhood.id,
            cluster_id: this.state.searchFields.cluster_id,
            ballot_id: this.state.searchFields.ballot_id,
			*/

            support_status_id: this.state.searchFields.support_status_id,
            summary_by_id: this.state.searchFields.summary_by_id,

            is_district_city: (this.state.searchFields.is_district_city) ? 1 : 0,
            is_ballot_strictly_orthodox: (this.state.searchFields.is_ballot_strictly_orthodox) ? 1 : 0,
            is_entity_in_current_election: (this.state.searchFields.is_entity_in_current_election) ? 1 : 0,

            display_num_of_votes: (this.state.searchFields.display_num_of_votes) ? 1 : 0,
            display_vote_statistics: (this.state.searchFields.display_vote_statistics) ? 1 : 0,
            display_statuses_statistics: (this.state.searchFields.display_statuses_statistics) ? 1 : 0,
            display_sephardi_percents: (this.state.searchFields.display_sephardi_percents) ? 1 : 0,
            display_strictly_orthodox_percents: (this.state.searchFields.display_strictly_orthodox_percents) ? 1 : 0,
            display_prev_votes_percents: (this.state.searchFields.display_prev_votes_percents) ? 1 : 0,

            selected_campaigns: [],
            selected_statuses: [],
			
			selected_cities:[],
			selected_neighborhoods:[],
			selected_clusters:[],
			selected_ballots:[],
        };

        for ( let electionCampaignKey in this.state.searchFields.selected_campaigns) {
            // Since selected_campaigns is an object of electionCampaignKey => electionCampaignId
            searchObj.selected_campaigns.push(this.state.searchFields.selected_campaigns[electionCampaignKey]);
        }

        for ( let selectedStatusIndex = 0; selectedStatusIndex < this.state.searchFields.selected_statuses.length; selectedStatusIndex++ ) {
            searchObj.selected_statuses.push(this.state.searchFields.selected_statuses[selectedStatusIndex].key);
        }
		
		for(let i = 0 ; i < this.state.searchFields.selected_cities.length;i++){
			searchObj.selected_cities.push(this.state.searchFields.selected_cities[i].key);
		}
		searchObj.selected_cities = JSON.stringify(searchObj.selected_cities);
		
		for(let i = 0 ; i < this.state.searchFields.selected_neighborhoods.length;i++){
			searchObj.selected_neighborhoods.push(this.state.searchFields.selected_neighborhoods[i].key);
		}
		searchObj.selected_neighborhoods = JSON.stringify(searchObj.selected_neighborhoods);
		
		for(let i = 0 ; i < this.state.searchFields.selected_clusters.length;i++){
			searchObj.selected_clusters.push(this.state.searchFields.selected_clusters[i].key);
		}
		searchObj.selected_clusters = JSON.stringify(searchObj.selected_clusters);
		
		for(let i = 0 ; i < this.state.searchFields.selected_ballots.length;i++){
			searchObj.selected_ballots.push(this.state.searchFields.selected_ballots[i].key);
		}
		searchObj.selected_ballots = JSON.stringify(searchObj.selected_ballots);
		
        ElectionsActions.displayBallotsPollingSummary(this.props.dispatch, searchObj);
    }

    electionCampaignChange(electionCampaignKey, electionCampaignId) {
        let searchFields = {...this.state.searchFields};
        
        if ( searchFields.selected_campaigns[electionCampaignKey] == undefined ) {
            searchFields.selected_campaigns[electionCampaignKey] = electionCampaignId;
        } else {
            delete searchFields.selected_campaigns[electionCampaignKey];
        }

        this.setState({searchFields});
    }

    summaryByChange(event) {
        let searchFields = {...this.state.searchFields};

        let summaryByName = event.target.value;
        let summaryByIndex = this.summaryByArr.findIndex(item => item.name == summaryByName);
        let summaryById = ( summaryByIndex==-1) ? null : this.summaryByArr[summaryByIndex].id;

        searchFields.summary_by_id = summaryById;
        searchFields.summary_by_name = summaryByName;

        this.setState({searchFields});
    }

    changeAllStatuses() {
        let searchFields = {...this.state.searchFields};

        if ( this.state.searchFields.selected_statuses.length == this.state.combos.supportStatuses.length ) {
            searchFields.selected_statuses = [];
        } else {
            searchFields.selected_statuses = this.state.combos.supportStatuses;
        }

        this.setState({searchFields});
    }
	
	changeAllBallots() {
        let searchFields = {...this.state.searchFields};

        if ( this.state.searchFields.selected_ballots.length == this.props.ballots.length ) {
            searchFields.selected_ballots = [];
        } else {
            searchFields.selected_ballots = this.props.ballots;
        }

        this.setState({searchFields});
    }
	
	changeAllClusters() {
        let searchFields = {...this.state.searchFields};

        if ( this.state.searchFields.selected_clusters.length == this.props.clusters.length ) {
            searchFields.selected_clusters = [];
			searchFields.selected_ballots=[];
			this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
        } else {
			let selectedClustersKeysArr = [];
			for(let i = 0; i <  this.props.clusters.length ; i++){
					selectedClustersKeysArr.push(this.props.clusters[i].key);
			}
			ElectionsActions.loadClusterBallotBoxesForBallotsPolling(this.props.dispatch, 'all',JSON.stringify(selectedClustersKeysArr));
            searchFields.selected_clusters = this.props.clusters;
        }

        this.setState({searchFields});
    }
	
	changeAllNeighborhoods() {
        let searchFields = {...this.state.searchFields};

        if ( this.state.searchFields.selected_neighborhoods.length == this.props.neighborhoods.length ) {
            searchFields.selected_neighborhoods = [];
        } else {
            searchFields.selected_neighborhoods = this.props.neighborhoods;
        }

        this.setState({searchFields});
    }
	
	changeAllCities(){
		let searchFields = {...this.state.searchFields};

        if ( this.state.searchFields.selected_cities.length == this.state.combos.cities.length ) {
			 this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_NEIGHBORHOODS});
             this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_CLUSTERS});
			 searchFields.selected_neighborhoods = [];
			 searchFields.selected_clusters = [];
			 searchFields.selected_ballots = [];
			 searchFields.selected_cities = [];
        } else {
			let selectedItems = this.state.combos.cities;
            searchFields.selected_cities = this.state.combos.cities;
			let selectedCitiesKeysArr = [];
			for(let i = 0; i <  selectedItems.length ; i++){
				selectedCitiesKeysArr.push(selectedItems[i].key);
			}
			ElectionsActions.loadCityClustersForBallotsPolling(this.props.dispatch, 'all' ,JSON.stringify(selectedCitiesKeysArr));
			ElectionsActions.loadCityNeighborhoodsForBallotsPolling(this.props.dispatch , 'all', JSON.stringify(selectedCitiesKeysArr));
        }
        this.setState({searchFields});
		this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
	}

    supportStatusChange(event) {
        let selectedItems = event.target.selectedItems;
        let searchFields = {...this.state.searchFields};

        searchFields.selected_statuses = selectedItems;
        this.setState({searchFields});
    }

    checkBoxChange(fieldName){
        let searchFields = { ...this.state.searchFields };
        searchFields[fieldName] = !searchFields[fieldName];

        this.setState({ searchFields });
    }

    ballotChange(event) {
		let selectedItems = event.target.selectedItems;
        let searchFields = {...this.state.searchFields};
		
		if(JSON.stringify(this.state.searchFields.selected_ballots) == JSON.stringify(selectedItems)){
			searchFields.cityBallotTextValue = event.target.value;
		}
		else{
			searchFields.cityBallotTextValue = '';
		}

        searchFields.selected_ballots = selectedItems;
        this.setState({searchFields});
    }

    updateClusterNeighborhood(neighborhoodId , nextProps=null) {
		let currentProps = (nextProps ? nextProps : this.props);
        let searchFields = {...this.state.searchFields};
 
        if ( neighborhoodId != null  ) {
            let neighborhoodIndex = currentProps.neighborhoods.findIndex(item => item.id == neighborhoodId);
			if(currentProps.neighborhoods[neighborhoodIndex]){
				searchFields.neighborhood = {
					id: neighborhoodId,
					name: currentProps.neighborhoods[neighborhoodIndex].name
				}
			}
        } else {
            searchFields.neighborhood = this.emptyNeighborhood;
        }

        this.setState({searchFields});
    }

    clusterChange(event, nextProps=null) {
		let selectedItems = event.target.selectedItems;
        let searchFields = {...this.state.searchFields};
		
		if(JSON.stringify(this.state.searchFields.selected_clusters) == JSON.stringify(selectedItems)){
			searchFields.cityClusterTextValue = event.target.value;
		}
		else{
			searchFields.cityClusterTextValue = '';
		}

        searchFields.selected_clusters = selectedItems;
		if(selectedItems.length > 0){
			//this.updateClusterNeighborhood(selectedItem.neighborhood_id , nextProps);
			let selectedClustersKeysArr = [];
			for(let i = 0; i <  selectedItems.length ; i++){
					selectedClustersKeysArr.push(selectedItems[i].key);
			}
			ElectionsActions.loadClusterBallotBoxesForBallotsPolling(this.props.dispatch, 'all',JSON.stringify(selectedClustersKeysArr));
		}
		else{
			searchFields.selected_ballots=[];
			this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
		}
        this.setState({searchFields});
		
    }

    loadNeighborhoodClusters(selectedNeighborhoodsIDS, nextProps=null)  {
 
		let currentProps = (nextProps ? nextProps : this.props);
        let clusters = currentProps.clusters.filter(clusterItem => (selectedNeighborhoodsIDS.indexOf(clusterItem.neighborhood_id) != -1));
		
        let combos = this.state.combos;

        combos.clusters = clusters;
        this.setState({combos});
    }

    neighborhoodChange(event , nextProps=null) {
		let selectedItems = event.target.selectedItems;
        let searchFields = {...this.state.searchFields};

		if(JSON.stringify(this.state.searchFields.selected_neighborhoods) == JSON.stringify(selectedItems)){
			searchFields.cityNeighborhoodTextValue = event.target.value;
		}
		else{
			searchFields.cityNeighborhoodTextValue = '';
		}
		
        searchFields.selected_neighborhoods = selectedItems;
		let combos = this.state.combos;
	    if(selectedItems.length > 0){
			let selectedNeighborhoodsIDS = [];
			for(let i=0;i<selectedItems.length;i++){
				selectedNeighborhoodsIDS.push(selectedItems[i].id);
			}
			this.loadNeighborhoodClusters(selectedNeighborhoodsIDS,nextProps);
		}
		else{
			combos.clusters = this.props.clusters;
            this.setState({combos});
		}
		
        this.setState({searchFields});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
    }

    updateCityAreaAndSubArea(citySelectedItem,nextProps=null) {
        let searchFields = {...this.state.searchFields};

        let areaId = citySelectedItem.area_id;
        searchFields.area_id = areaId;

        let subAreaId = citySelectedItem.sub_area_id;
        searchFields.sub_area_id = subAreaId;

		let currentProps = (nextProps ? nextProps : this.props);
		
        let areaIndex = currentProps.userFilteredAreas.findIndex(item => item.id == areaId);
        searchFields.area_name = currentProps.userFilteredAreas[areaIndex].name;

        if ( subAreaId != null && subAreaId != 0 ) {
            let subAreaIndex = currentProps.userFilteredSubAreas.findIndex(item => item.id == subAreaId);
            searchFields.sub_area_name = currentProps.userFilteredSubAreas[subAreaIndex].name;
        } else {
            searchFields.sub_area_name = '';
        }

        this.setState({searchFields});
    }

    cityChange(event , nextProps=null) {
		let selectedItems = event.target.selectedItems;
        let searchFields = {...this.state.searchFields};

		if(JSON.stringify(this.state.searchFields.selected_cities) == JSON.stringify(selectedItems)){
			searchFields.cityComboTextValue = event.target.value;
		}
		else{
			searchFields.cityComboTextValue = '';
		}
		 
		if(selectedItems.length > 0){
		   if(selectedItems != this.state.searchFields.selected_cities){
				let selectedCitiesKeysArr = [];
				for(let i = 0; i <  selectedItems.length ; i++){
					selectedCitiesKeysArr.push(selectedItems[i].key);
				}
				ElectionsActions.loadCityClustersForBallotsPolling(this.props.dispatch, 'all' ,JSON.stringify(selectedCitiesKeysArr));
				ElectionsActions.loadCityNeighborhoodsForBallotsPolling(this.props.dispatch , 'all', JSON.stringify(selectedCitiesKeysArr));
			}
			searchFields.selected_cities = selectedItems;
		}
		else{
			 this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_NEIGHBORHOODS});
             this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_CLUSTERS});
			 searchFields.selected_neighborhoods = [];
			 searchFields.selected_clusters = [];
			 searchFields.selected_ballots = [];
			 searchFields.selected_cities = [];
		}
        this.setState({searchFields});
		this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
    }

    loadSubAreaCities(subAreaId) {
        let cities = this.props.userFilteredCities.filter(cityItem => cityItem.sub_area_id == subAreaId);
        let combos = this.state.combos;

        combos.cities = cities;
        this.setState({combos});
    }

    subAreaChange(event) {
        let searchFields = {...this.state.searchFields};

        let selectedItem = event.target.selectedItem;
        let subAreaId = null;

        if ( null == selectedItem ) {
            subAreaId = null;

            searchFields.sub_area_id = null;
            searchFields.sub_area_name = event.target.value;
        } else {
            subAreaId = selectedItem.id;

            searchFields.sub_area_id = selectedItem.id;
            searchFields.sub_area_name = selectedItem.name;
        }

        searchFields.city_id = null;
        searchFields.city_name = '';

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({searchFields});

        if ( null == subAreaId ) {
            this.loadAreaCities(this.state.searchFields.area_id);
        } else {
            this.loadSubAreaCities(subAreaId);
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_NEIGHBORHOODS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
    }

    buildElectionCampaignsHash(electionCampaigns) {
        for ( let electionCampaignIndex = 0; electionCampaignIndex < electionCampaigns.length; electionCampaignIndex++ ) {
            let electionCampaignKey = electionCampaigns[electionCampaignIndex].key;

            this.electionCampaignsHash[electionCampaignKey] = electionCampaigns[electionCampaignIndex];
        }
        let currentCampaign = this.props.currentCampaign;
        this.electionCampaignsHash[currentCampaign.key] = currentCampaign;
        
    }

    loadAreaCities(areaId) {
        let cities = this.props.userFilteredCities.filter(cityItem => cityItem.area_id == areaId);
        let combos = this.state.combos;

        combos.cities = cities;
        this.setState({combos});
    }

    loadSubAreas(areaId) {
        let subAreas = this.props.userFilteredSubAreas.filter(subAreaItem => subAreaItem.area_id == areaId);
        let combos = this.state.combos;

        combos.subAreas = subAreas;
        this.setState({combos});
    }

    areaChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = {...this.state.searchFields};
        let areaId = null;

        if ( null == selectedItem ) {
            searchFields.area_id = null;
            searchFields.area_name = event.target.value;
        } else {
            areaId = selectedItem.id

            searchFields.area_id = areaId;
            searchFields.area_name = selectedItem.name;
        }

        searchFields.sub_area_id = null;
        searchFields.sub_area_name = '';

        searchFields.city_id = null;
        searchFields.city_name = '';

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({searchFields});

        if ( null == areaId ) {
            let combos = this.state.combos;
            combos.subAreas = [];
            combos.cities = this.props.userFilteredCities;
            this.setState({combos});
        } else {
            this.loadSubAreas(areaId);
            this.loadAreaCities(areaId);
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_NEIGHBORHOODS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS});
    }

    validateSelectedCampaigns() {
        return ( Object.keys(this.state.searchFields.selected_campaigns).length > 0 );
    }

    validateSummaryBy() {
        return (this.state.searchFields.summary_by_id != null);
    }

    validateSupportStatus() {
        return (this.state.searchFields.selected_statuses.length > 0);
    }

    validateBallot() {
        if ( this.state.searchFields.ballot_name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.ballot_id != null);
        }
    }

    validateCluster() {
        if ( this.state.searchFields.cluster_name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.cluster_id != null);
        }
    }

    validateNeighborhood() {
        if ( this.state.searchFields.neighborhood.name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.neighborhood.id != null);
        }
    }

    validateCity() {
        return (this.state.searchFields.selected_cities.length > 0);
    }

    validateSubArea() {
        if ( this.state.searchFields.sub_area_name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.sub_area_id != null);
        }
    }

    validateArea() {
        if ( this.state.searchFields.area_name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.area_id != null);
        }
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateArea() ) {
            this.validInput = false;
            this.areaInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateSubArea() ) {
            this.validInput = false;
            this.subAreaInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCity() ) {
            this.validInput = false;
            this.cityInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateNeighborhood() ) {
            this.validInput = false;
            this.neighborhoodInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCluster() ) {
            this.validInput = false;
            this.clusterInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateBallot() ) {
            this.validInput = false;
            this.ballotInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateSupportStatus() ) {
            this.validInput = false;
            this.supportStatusInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateSummaryBy() ) {
            this.validInput = false;
            this.summaryByInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateSelectedCampaigns() ) {
            this.validInput = false;
            this.selectedCampaignsInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.areaInputStyle = {};
        this.subAreaInputStyle = {};
        this.cityInputStyle = {};
        this.neighborhoodInputStyle = {};
        this.clusterInputStyle = {};
        this.ballotInputStyle = {};

        this.supportStatusInputStyle = {};
        this.summaryByInputStyle = {};
        this.selectedCampaignsInputStyle = {};
    }

    renderElectionCampaigns() {
        let that = this;
        let campaigns = this.props.electionCampaigns.map( function (item, index) {
            return <ElectionCampainItem key={index} item={item}
                                        electionCampaignChecked={that.state.searchFields.selected_campaigns[item.key] != undefined}
                                        electionCampaignChange={that.electionCampaignChange.bind(that)}
                                        numOfCheckedCampaigns={Object.keys(that.state.searchFields.selected_campaigns).length}/>
        });

        return campaigns;
    }

    renderSelectedCampaigns() {
        let selectedCampaigns = [];
        let index = 0;
        let currentSelectedCampaigns = this.state.searchFields.selected_campaigns;
        let currentCampaign = this.props.currentCampaign;
        if (currentCampaign.id && this.props.electionCampaigns && this.props.electionCampaigns.length > 0) { 
            currentSelectedCampaigns[currentCampaign.key] = currentCampaign.id
        };
        for (let selectedCampaignKey in currentSelectedCampaigns) {
            if (this.electionCampaignsHash.hasOwnProperty(selectedCampaignKey)) {
                let selectedCampaignName = this.electionCampaignsHash[selectedCampaignKey].name;

                selectedCampaigns.push(
                    [
                        <div className={"blue-campaign" + index++} />,
                        <span className="text-side-blue">{selectedCampaignName}</span>
                    ]
                );
            }
        }

        return selectedCampaigns;
    }
	
	cleanAllData(){
		this.setState({searchFields: {
                area_id: null,
                area_name: '',

                sub_area_id: null,
                sub_area_name: '',

                city_id: null,
                city_name: '',

                cluster_id: null,
                cluster_name: '',

                neighborhood: {id: null, name: ''},

                ballot_id: null,
                ballot_name: '',

                selected_statuses: [],
                selected_ballots: [],
                selected_clusters: [],
                selected_neighborhoods: [],
                selected_cities: [],

                summary_by_id: null,
                summary_by_name: '',

                selected_campaigns: {},

                is_district_city: false,
                is_ballot_strictly_orthodox: false,
                is_entity_in_current_election: false,

                display_num_of_votes: true,
                display_vote_statistics: true,
                display_statuses_statistics: true,
                display_sephardi_percents: false,
                display_strictly_orthodox_percents : true,
                display_prev_votes_percents: true
            }
		}
	    );
		this.props.dispatch({type:ElectionsActions.ActionTypes.REPORTS.BALLOTS.CLEAN_ALL_DATA});
	}

    render() {
        this.initVariables();

        this.validateVariables();
        let summary_by_id = this.state.searchFields.summary_by_id ;
        return (
            <div className="container">
                <div className="dtlsBox srchPanel polling-search first-box-on-page clearfix"  style={{marginTop:'15px'}}>
                    <div className="row">
                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-summary-area" className="control-label">אזור</label>
                                    <Combo id="ballots-polling-summary-area"
                                           items={this.props.userFilteredAreas}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.areaInputStyle}
                                           value={this.state.searchFields.area_name}
                                           className="form-combo-table"
                                           onChange={this.areaChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-sub-area" className="control-label">תת אזור</label>
                                    <Combo id="ballots-polling-sub-area"
                                           items={this.state.combos.subAreas}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.subAreaInputStyle}
                                           value={this.state.searchFields.sub_area_name}
                                           className="form-combo-table"
                                           onChange={this.subAreaChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-city" className="control-label">
										עיר{'\u00A0'}
											{(this.state.combos.cities.length > 0) && <span style={{marginRight: '5px', color: '#1698f8', cursor: 'pointer'}}
                                              onClick={this.changeAllCities.bind(this)}>
                                            ({this.state.searchFields.selected_cities.length == this.state.combos.cities.length ? 'נקה' : 'סמן הכל'})
											</span>}
									</label>
                                    <Combo id="ballots-polling-city"
                                           items={this.state.combos.cities}
										   value={this.state.searchFields.cityComboTextValue}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.cityInputStyle}
										   multiSelect={true}
                                           selectedItems={this.state.searchFields.selected_cities}
                                           className="form-combo-table"
                                           onChange={this.cityChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-neighborhood" className="control-label">
										איזור מיוחד{'\u00A0'}
											{(this.props.neighborhoods.length > 0) && <span style={{marginRight: '5px', color: '#1698f8', cursor: 'pointer'}}
                                              onClick={this.changeAllNeighborhoods.bind(this)}>
                                            ({this.state.searchFields.selected_neighborhoods.length == this.props.neighborhoods.length ? 'נקה' : 'סמן הכל'})
											</span>}
									</label>
                                    <Combo id="ballots-polling-neighborhood"
                                           items={this.props.neighborhoods}
										   value={this.state.searchFields.cityNeighborhoodTextValue}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.neighborhoodInputStyle}
                                           selectedItems={this.state.searchFields.selected_neighborhoods}
										   multiSelect={true}
                                           className="form-combo-table"
                                           onChange={this.neighborhoodChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-cluster" className="control-label">
										אשכול{'\u00A0'}
											{(this.props.clusters.length > 0) && <span style={{marginRight: '5px', color: '#1698f8', cursor: 'pointer'}}
                                              onClick={this.changeAllClusters.bind(this)}>
                                            ({this.state.searchFields.selected_clusters.length == this.props.clusters.length ? 'נקה' : 'סמן הכל'})
											</span>}
									</label>
                                    <Combo id="ballots-polling-cluster"
                                           items={this.state.combos.clusters}
										   value={this.state.searchFields.cityClusterTextValue}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
										   selectedItems={this.state.searchFields.selected_clusters}
                                           inputStyle={this.clusterInputStyle}
                                           multiSelect={true}
                                           className="form-combo-table"
                                           onChange={this.clusterChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-ballot" className="control-label">
                                        קלפי{'\u00A0'}
											{(this.props.ballots.length > 0) && <span style={{marginRight: '5px', color: '#1698f8', cursor: 'pointer'}}
                                              onClick={this.changeAllBallots.bind(this)}>
                                            ({this.state.searchFields.selected_ballots.length == this.props.ballots.length ? 'נקה' : 'סמן הכל'})
											</span>}
                                    </label>
                                    <Combo id="ballots-polling-ballot"
                                           items={this.props.ballots}
										   value={this.state.searchFields.cityBallotTextValue}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
										   inputStyle={this.ballotInputStyle}
                                           selectedItems={this.state.searchFields.selected_ballots}
                                           className="form-combo-table"
										   multiSelect={true}
                                           onChange={this.ballotChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-6">
                            <div className="form-group">
                                <div className="checkbox pull-right">
                                    <label className="margin-top20">
                                        <input type="checkbox" checked={this.state.searchFields.is_district_city}
                                            onChange={this.checkBoxChange.bind(this, 'is_district_city')} />{this.labels.district}
                                    </label>
                                    <label className="margin-right20 margin-top20" style={(summary_by_id == this.summaryBy.byBallot || summary_by_id == this.summaryBy.byCluster) ? {} : { display: 'none' }}>
                                        <input type="checkbox" checked={this.state.searchFields.is_ballot_strictly_orthodox}
                                            onChange={this.checkBoxChange.bind(this, 'is_ballot_strictly_orthodox')} />{this.labels.orthodox}
                                    </label>
                                    <label className="margin-right20 margin-top20" style={(summary_by_id == this.summaryBy.byBallot || summary_by_id == this.summaryBy.byCluster) ? {} : { display: 'none' }}>
                                        <input type="checkbox" checked={this.state.searchFields.is_entity_in_current_election}
                                            onChange={this.checkBoxChange.bind(this, 'is_entity_in_current_election')} />{'רק ' + (summary_by_id == this.summaryBy.byBallot ? 'קלפיות' : 'אשכולות') + this.labels.current_election}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-sum-by" className="control-label">סכם לפי</label>
                                    <Combo id="ballots-polling-sum-by"
                                           items={this.summaryByArr}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.summaryByInputStyle}
                                           value={this.state.searchFields.summary_by_name || ''}
                                           className="form-combo-table"
                                           onChange={this.summaryByChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-5ths">
                                <div className="form-group">
                                    <label htmlFor="ballots-polling-status-to-show" className="control-label">
                                        {this.labels.displayStatuses}{'\u00A0'}
                                        <span style={{marginRight: '5px', color: '#1698f8', cursor: 'pointer'}}
                                              onClick={this.changeAllStatuses.bind(this)}>
                                            ({this.state.searchFields.selected_statuses.length == this.state.combos.supportStatuses.length ? 'נקה' : 'סמן הכל'})
                                        </span>
                                    </label>
                                    <Combo id="ballots-polling-status-to-show"
                                           items={this.state.combos.supportStatuses}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.supportStatusInputStyle}
                                           multiSelect={true}
                                           selectedItems={this.state.searchFields.selected_statuses}
                                           className="form-combo-table"
                                           onChange={this.supportStatusChange.bind(this)}/>
                                </div>
                        </div>

                        <div className="col-md-7">
                            <div className="form-group">
                                <label className="display-block">הצג</label>
                                <div className="checkbox pull-right clearfix">
                                    <label >
                                        <input type="checkbox" checked={this.state.searchFields.display_num_of_votes}
                                               onChange={this.checkBoxChange.bind(this, 'display_num_of_votes')}/>
                                        {this.labels.numOfVoters}
                                    </label>
                                    <label className="margin-right20">
                                        <input type="checkbox" checked={this.state.searchFields.display_vote_statistics}
                                               onChange={this.checkBoxChange.bind(this, 'display_vote_statistics')}/>
                                        {this.labels.votesStatistics}
                                    </label>
                                    <label className="margin-right20">
                                        <input type="checkbox" checked={this.state.searchFields.display_statuses_statistics}
                                               onChange={this.checkBoxChange.bind(this, 'display_statuses_statistics')}/>
                                        {this.labels.supportStatusesStatistics}
                                    </label>
                                    <label className="margin-right20">
                                        <input type="checkbox" checked={this.state.searchFields.display_strictly_orthodox_percents}
                                               onChange={this.checkBoxChange.bind(this, 'display_strictly_orthodox_percents')}/>
                                        {this.labels.strictlyOrthodoxPercents}
                                    </label>
                                    <label className="margin-right20">
                                        <input type="checkbox" checked={this.state.searchFields.display_sephardi_percents}
                                               onChange={this.checkBoxChange.bind(this, 'display_sephardi_percents')}/>
                                        {this.labels.sephardiPercents}
                                    </label>
                                    <label className="margin-right20">
                                        <input type="checkbox" checked={this.state.searchFields.display_prev_votes_percents}
                                               onChange={this.checkBoxChange.bind(this, 'display_prev_votes_percents')}/>
                                        {this.labels.prevElectionVotesPercents}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-5ths">
                                <label htmlFor="show-election" className="control-label display-block">
                                    {this.labels.displayElectionCampaigns}
                                </label>
                                <span className="multiselect-native-select">
                                    <div className="btn-group">
                                        <button type="button" className="multiselect dropdown-toggle btn btn-default btn-campaign-all"
                                                style={this.selectedCampaignsInputStyle}
                                                data-toggle="dropdown" title="בחר" aria-expanded="false">
                                                <span className="multiselect-selected-text">בחר</span> <b className="caret"></b>
                                        </button>
                                        <ul className="multiselect-container dropdown-menu">
                                            {this.renderElectionCampaigns()}
                                        </ul>
                                    </div>
                                </span>
                        </div>
                        <div>
							<button title="נקה" type="submit" className="btn btn-primary srchBtn pull-left" style={{marginRight: '10px'}}
                                    onClick={this.cleanAllData.bind(this)}
                                    disabled={ this.props.loadingData }>
                                 נקה
                            </button>
							
                            <button title="הצג" type="submit" className="btn btn-primary srchBtn pull-left"
                                    onClick={this.displayBallotsPollingSummary.bind(this)}
                                    disabled={!this.validInput || this.props.loadingData }>
                                {this.props.loadingData ? 'טוען' : 'הצג'}
                                <i className={"fa fa-spinner fa-spin pull-right" + (this.props.loadingData ? '' : ' hidden')}
                                   style={{marginTop: 5}}/>
                            </button>
							 
							
                        </div>
                        <div className="col-md-6">{this.renderSelectedCampaigns()}</div>
                    </div>
                </div>
				{this.props.loadingData && <span style={{marginRight: '700px'}}  title="בטל חיפוש" onClick={this.cancelSearch.bind(this)}>
						       <div className='text-center loading-report cursor-pointer' >
                                <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
								 </div>
						</span>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFilteredAreas: state.system.currentUserGeographicalFilteredLists.areas,
        userFilteredSubAreas: state.system.currentUserGeographicalFilteredLists.sub_areas,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,

        neighborhoods: state.elections.ballotsScreen.combos.neighborhoods,
        clusters: state.elections.ballotsScreen.combos.clusters,
        ballots: state.elections.ballotsScreen.combos.ballots,

        supportStatuses: state.elections.ballotsScreen.combos.supportStatuses,
        electionCampaigns: state.elections.ballotsScreen.combos.electionCampaigns,
        currentCampaign: state.system.currentCampaign,

        loadingData: state.elections.ballotsScreen.loadingData
    }
}

export default connect(mapStateToProps) (SearchBallotsData);