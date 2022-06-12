import React from 'react';
import { connect } from 'react-redux';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import {dateTimeReversePrint, parseDateToPicker, parseDateFromPicker} from '../../../../libs/globalFunctions';

import Combo from '../../../global/Combo';
import SupportStatusItem from './SupportStatusItem';

import * as ElectionsActions from '../../../../actions/ElectionsActions';


class StatusChangeSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchFields: {
                area_id: null,
                area_name: '',

                sub_area_id: null,
                sub_area_name: '',

                city_id: null,
                city_name: '',

                neighborhood: {id: null, name: ''},

                cluster_id: null,
                cluster_name: '',

                ballot_id: null,
                ballot_name: '',

                summary_by_id: null,
                summary_by_name: '',

                selected_statuses: {},
                selectAllStatuses: false,

                start_date: null,
                end_date: null
            },

            combos: {
                subAreas: [],
                cities: [],
                clusters: []
            }
        };

        momentLocalizer(moment);
        this.initConstants(props);
    }

    initConstants(props) {
        this.summaryBy = require('../../../../libs/constants').statusesChangeReport.summaryBy;

        this.supportNoneKey = 'support_none';

        this.summaryByNames = {
            none: 'ללא',
            area: 'איזור',
            city: 'עיר',
            cluster: 'אשכול',
            ballot: 'קלפי'
        };

        this.summaryByArr = [
            {id: this.summaryBy.none, name: this.summaryByNames.none},
            {id: this.summaryBy.byArea, name: this.summaryByNames.area},
            {id: this.summaryBy.byCity, name: this.summaryByNames.city},
            {id: this.summaryBy.byCluster, name: this.summaryByNames.cluster},
            {id: this.summaryBy.byBallot, name: this.summaryByNames.ballot}
        ];

        this.emptyNeighborhood = {id: null, name: ''};

        this.invalidColor = '#cc0000';
        if (props.userFilteredCities.length > 0) {
            this.state.combos.cities = props.userFilteredCities;
        }
    }

    componentWillMount() {
        let searchFields = this.state.searchFields;

        let endDate = parseDateToPicker(new Date()); // Current data and time
        endDate = moment(endDate).format('YYYY-MM-DD');
        searchFields.end_date = endDate;

        let currentYear = new Date().getFullYear();
        searchFields.start_date = currentYear + '-01-01';

        this.setState({searchFields}); 
    }
	
	/*
		Cleans search field and search result
	*/
	resetSearchFields(){
		this.props.buttonSearchClickedChange(false);
		let endDate = parseDateToPicker(new Date()); // Current data and time
        endDate = moment(endDate).format('YYYY-MM-DD');
        let currentYear = new Date().getFullYear();
        let startDate = currentYear + '-01-01';
		
		let searchFields =  {
                area_id: null,
                area_name: '',

                sub_area_id: null,
                sub_area_name: '',

                city_id: null,
                city_name: '',

                neighborhood: {id: null, name: ''},

                cluster_id: null,
                cluster_name: '',

                ballot_id: null,
                ballot_name: '',

                summary_by_id: null,
                summary_by_name: '',

                selected_statuses: {},
                selectAllStatuses: false,

                start_date: startDate,
                end_date: endDate
            };
		this.props.dispatch({
            type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_SUMMARY_RESULT
        });
		
		if(this.props.loadingData){
			this.cancelSearch();
		}
		this.setState({searchFields});
	}

    componentWillReceiveProps(nextProps) {
        if ( this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0 ) {
            let combos = this.state.combos;

            combos.cities = nextProps.userFilteredCities;
            this.setState({combos});
        }

        if ( this.props.clusters.length == 0 && nextProps.clusters.length > 0 ) {
            let combos = this.state.combos;

            combos.clusters = nextProps.clusters;
            this.setState({combos});
        }
		if(this.props.isClickedGotoSupportStatusChangeReport && !this.state.loadedFromPreviousScreen){
			let searchFields = this.state.searchFields;
			if(this.props.preElectionsDashboardSearchScreen.selectedArea.selectedItem){
				searchFields.area_id = this.props.preElectionsDashboardSearchScreen.selectedArea.selectedItem.id;
				searchFields.area_name = this.props.preElectionsDashboardSearchScreen.selectedArea.selectedItem.name;
			}
			if(this.props.preElectionsDashboardSearchScreen.selectedSubArea.selectedItem){
				searchFields.sub_area_id = this.props.preElectionsDashboardSearchScreen.selectedSubArea.selectedItem.id;
				searchFields.sub_area_name = this.props.preElectionsDashboardSearchScreen.selectedSubArea.selectedItem.name;
			}
			if(this.props.preElectionsDashboardSearchScreen.selectedCity.selectedItem){
				searchFields.city_id = this.props.preElectionsDashboardSearchScreen.selectedCity.selectedItem.id;
				searchFields.city_name = this.props.preElectionsDashboardSearchScreen.selectedCity.selectedItem.name;
				this.cityChange({target:{value:this.props.preElectionsDashboardSearchScreen.selectedCity.selectedItem.name , selectedItem:this.props.preElectionsDashboardSearchScreen.selectedCity.selectedItem}});
			}
			if(this.props.preElectionsDashboardSearchScreen.selectedNeighborhood.selectedItem){
				searchFields.neighborhood.id = this.props.preElectionsDashboardSearchScreen.selectedNeighborhood.selectedItem.id;
				searchFields.neighborhood.name = this.props.preElectionsDashboardSearchScreen.selectedNeighborhood.selectedItem.name;
				this.neighborhoodChange({target:{value:this.props.preElectionsDashboardSearchScreen.selectedNeighborhood.selectedItem.name , selectedItem:this.props.preElectionsDashboardSearchScreen.selectedNeighborhood.selectedItem}});
			}
			if(this.props.preElectionsDashboardSearchScreen.selectedCluster.selectedItem){
				searchFields.cluster_id = this.props.preElectionsDashboardSearchScreen.selectedCluster.selectedItem.id;
				searchFields.cluster_name = this.props.preElectionsDashboardSearchScreen.selectedCluster.selectedItem.name;
				this.clusterChange({target:{value:this.props.preElectionsDashboardSearchScreen.selectedCluster.selectedItem.name , selectedItem:this.props.preElectionsDashboardSearchScreen.selectedCluster.selectedItem}});
			}
			if(this.props.preElectionsDashboardSearchScreen.selectedBallotBox.selectedItem){
				searchFields.ballot_id = this.props.preElectionsDashboardSearchScreen.selectedBallotBox.selectedItem.id;
				searchFields.ballot_name = this.props.preElectionsDashboardSearchScreen.selectedBallotBox.selectedItem.id;
			}
			let today = new Date();
			let dayOnly = today.getDay();
			let startDate  = '';
			let endDate = '';
			endDate = parseDateToPicker(new Date()); // Current data and time
			endDate = moment(endDate).format('YYYY-MM-DD');
			searchFields.end_date = endDate;
			let nDaysAgo  = 0;
		 
			switch(this.props.selectedTimePeriod.selectedItem.system_name){
				case 'from_this_week' :
					let startOfWeek = today.setDate(today.getDate() -dayOnly);
					
					startDate = parseDateToPicker(new Date(startOfWeek)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case 'from_previous_week' :
					let startOfPreviousWeek = today.setDate(today.getDate() -dayOnly-7);
					startDate = parseDateToPicker(new Date(startOfPreviousWeek)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case 'from_this_month' :
					let startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
					startDate = parseDateToPicker(new Date(startOfThisMonth)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case 'from_previous_month' :
					let startOfPrevMonth = new Date((today.getMonth() == 1 ? today.getFullYear()-1 : today.getFullYear()), (today.getMonth() == 1 ? 12 :(today.getMonth()-1)), 1);
					startDate = parseDateToPicker(new Date(startOfPrevMonth)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case '10_days' :
					nDaysAgo = today.setDate(today.getDate() - 10);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case '21_days' :
					nDaysAgo = today.setDate(today.getDate() - 21);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case '30_days' :
					nDaysAgo = today.setDate(today.getDate() - 30);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case '60_days' :
					nDaysAgo = today.setDate(today.getDate() - 60);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case '90_days' :
					nDaysAgo = today.setDate(today.getDate() - 90);
					startDate = parseDateToPicker(new Date(nDaysAgo)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
				case 'form_elections_init' :
					let campaignStartDate =  new Date(this.props.currentCampaignStartDate.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
					startDate = parseDateToPicker(new Date(campaignStartDate)); // Current data and time
					startDate = moment(startDate).format('YYYY-MM-DD');
					searchFields.start_date = startDate;
					break;
			}
			this.setState({searchFields});
			this.setState({loadedFromPreviousScreen:true});
			this.props.dispatch({type:ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME, screenName:'measureSupportScreen' ,  fieldName:'isClickedGotoSupportStatusChangeReport' , fieldValue : false });
		}
    }

    cancelSearch() {
        ElectionsActions.cancelStatusChangeReport();

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.UNSET_LOADING_DATA_FLAG});
    }

    displayStatusChangeReport(event) {
        // Prevent page refresh
        event.preventDefault();

        this.props.buttonSearchClickedChange();

        if ( !this.validInput ) {
            return;
        }

        let searchObj = {
            area_id: this.state.searchFields.area_id,
            sub_area_id: this.state.searchFields.sub_area_id,
            city_id: this.state.searchFields.city_id,
            cluster_id: this.state.searchFields.cluster_id,
            ballot_id: this.state.searchFields.ballot_id,

            summary_by_id: this.state.searchFields.summary_by_id,

            start_date: this.state.searchFields.start_date,
            end_date: this.state.searchFields.end_date,

            selected_statuses: []
        };

        for ( let supportStatusKey in this.state.searchFields.selected_statuses) {
            // Since selected_campaigns is an object of electionCampaignKey => electionCampaignId
            searchObj.selected_statuses.push(supportStatusKey);
        }

        this.props.resetSortDetails();

        ElectionsActions.displayStatusChangeReport(this.props.dispatch, searchObj);
    }

    endDateChange(value, filter) {
        let searchFields = this.state.searchFields;
        searchFields.end_date = value;

        this.setState({searchFields});
    }

    startDateChange(value, filter) {
        let searchFields = this.state.searchFields;
        searchFields.start_date = value;

        this.setState({searchFields});
    }

    selectAllSupportStatuse() {
        let searchFields = this.state.searchFields;
        searchFields.selectAllStatuses = !searchFields.selectAllStatuses;

        let supportStatusKey = this.supportNoneKey;

        if ( !searchFields.selectAllStatuses ) {
            if ( searchFields.selected_statuses[supportStatusKey] != undefined ) {
                delete searchFields.selected_statuses[supportStatusKey];
            }
        } else {
            if ( searchFields.selected_statuses[supportStatusKey] == undefined ) {
                searchFields.selected_statuses[supportStatusKey] = 0;
            }
        }

        for ( let statusIndex = 0; statusIndex < this.props.supportStatuses.length; statusIndex++ ) {
            supportStatusKey = this.props.supportStatuses[statusIndex].key;

            if ( !searchFields.selectAllStatuses ) {
                if ( searchFields.selected_statuses[supportStatusKey] != undefined ) {
                    delete searchFields.selected_statuses[supportStatusKey];
                }
            } else {
                if ( searchFields.selected_statuses[supportStatusKey] == undefined ) {
                    searchFields.selected_statuses[supportStatusKey] = this.props.supportStatuses[statusIndex].id;
                }
            }
        }

        this.setState({searchFields});
    }

    supportStatusNoneChange() {
        let searchFields = this.state.searchFields;
        let supportStatusKey = this.supportNoneKey;

        if ( searchFields.selected_statuses[supportStatusKey] == undefined ) {
            searchFields.selected_statuses[supportStatusKey] = 0;

            if ( Object.keys(searchFields.selected_statuses).length == (this.props.supportStatuses.length + 1) ) {
                searchFields.selectAllStatuses = true;
            }
        } else {
            delete searchFields.selected_statuses[supportStatusKey];
            searchFields.selectAllStatuses = false;
        }

        this.setState({searchFields});
    }

    supportStatusChange(supportStatusKey, supportStatusId) {
        let searchFields = this.state.searchFields;

        if ( searchFields.selected_statuses[supportStatusKey] == undefined ) {
            searchFields.selected_statuses[supportStatusKey] = supportStatusId;

            if ( Object.keys(searchFields.selected_statuses).length == (this.props.supportStatuses.length + 1) ) {
                searchFields.selectAllStatuses = true;
            }
        } else {
            delete searchFields.selected_statuses[supportStatusKey];
            searchFields.selectAllStatuses = false;
        }

        this.setState({searchFields});
    }

    summaryByChange(event) {
        let summaryByName = event.target.value;
        let searchFields = this.state.searchFields;
        let selectedItem = event.target.selectedItem;

        let summaryById = null;

        if ( null == selectedItem ) {
            summaryById = null;
            searchFields.summary_by_id = null;
        } else {
            summaryById = selectedItem.id;
            searchFields.summary_by_id = selectedItem.id;
        }

        searchFields.summary_by_name = summaryByName;

        this.setState({searchFields});
    }

    ballotChange(event) {
        let newBallotName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let ballotId = null;

        searchFields.ballot_name = newBallotName;

        if ( null == selectedItem ) {
            ballotId = null;
            searchFields.ballot_id = null;
        } else {
            ballotId = selectedItem.id;
            searchFields.ballot_id = selectedItem.id;

            searchFields.summary_by_name = this.summaryByNames.ballot;
            searchFields.summary_by_id = this.summaryBy.byBallot;
        }

        this.setState({searchFields});
    }

    updateClusterNeighborhood(neighborhoodId) {
        let searchFields = this.state.searchFields;

        if ( neighborhoodId != null ) {
            let neighborhoodIndex = this.props.neighborhoods.findIndex(item => item.id == neighborhoodId);

            searchFields.neighborhood = {
                id: neighborhoodId,
                name: this.props.neighborhoods[neighborhoodIndex].name
            }
        } else {
            searchFields.neighborhood = this.emptyNeighborhood;
        }

        this.setState({searchFields});
    }

    clusterChange(event) {
        let newClusterName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let clusterId = null;

        searchFields.cluster_name = newClusterName;

        if ( null == selectedItem ) {
            clusterId = null;
            searchFields.cluster_id = null;
        } else {
            clusterId = selectedItem.id;
            searchFields.cluster_id = selectedItem.id;

            this.updateClusterNeighborhood(selectedItem.neighborhood_id);

            searchFields.summary_by_name = this.summaryByNames.ballot;
            searchFields.summary_by_id = this.summaryBy.byBallot;
        }

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({searchFields});

        if ( null == clusterId ) {
            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CLUSTER_BALLOTS});
        } else {
            ElectionsActions.loadClusterBallotBoxesForStatusReport(this.props.dispatch, selectedItem.key);
        }
    }

    loadNeighborhoodClusters(neighborhoodId)  {
        let clusters = this.props.clusters.filter(clusterItem => clusterItem.neighborhood_id == neighborhoodId);
        let combos = this.state.combos;

        combos.clusters = clusters;
        this.setState({combos});
    }

    neighborhoodChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let combos = this.state.combos;

        if ( null == selectedItem ) {
            searchFields.neighborhood = {...this.emptyNeighborhood, name: event.target.value};

            combos.clusters = this.props.clusters;
            this.setState({combos});
        } else {
            searchFields.neighborhood = {
                id: selectedItem.id,
                name: selectedItem.name
            };

            searchFields.summary_by_name = this.summaryByNames.cluster;
            searchFields.summary_by_id = this.summaryBy.byCluster;

            this.loadNeighborhoodClusters(selectedItem.id);
        }

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        this.setState({searchFields});
    }

    updateCityAreaAndSubArea(citySelctedItem) {
        let searchFields = this.state.searchFields;

        let areaId = citySelctedItem.area_id;
        searchFields.area_id = areaId;

        let subAreaId = citySelctedItem.sub_area_id;
        searchFields.sub_area_id = subAreaId;

        let areaIndex = this.props.userFilteredAreas.findIndex(item => item.id == areaId);
        searchFields.area_name = this.props.userFilteredAreas[areaIndex].name;

        if ( subAreaId != null ) {
            let subAreaIndex = this.props.userFilteredSubAreas.findIndex(item => item.id == subAreaId);
            if (subAreaIndex > 0) {
                searchFields.sub_area_name = this.props.userFilteredSubAreas[subAreaIndex] ? this.props.userFilteredSubAreas[subAreaIndex].name : '';
            }
        } else {
            searchFields.sub_area_name = '';
        }

        this.setState({searchFields});
    }

    cityChange(event) {
        let newCityName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let cityId = null;

        searchFields.city_name = newCityName;

        if ( null == selectedItem ) {
            cityId = null;
            searchFields.city_id = null;
        } else {
            cityId = selectedItem.id;
            searchFields.city_id = selectedItem.id;

            this.updateCityAreaAndSubArea(selectedItem);
        }

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({searchFields});

        if ( null == cityId ) {
            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_CLUSTERS});
            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_NEIGHBORHOODS});
        } else {
            searchFields.summary_by_name = this.summaryByNames.cluster;
            searchFields.summary_by_id = this.summaryBy.byCluster;

            ElectionsActions.loadCityNeighborhoodsForStatusReport(this.props.dispatch, selectedItem.key);

            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_CLUSTERS});
            ElectionsActions.loadCityClustersForStatusReport(this.props.dispatch, selectedItem.key);
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CLUSTER_BALLOTS});
    }

    loadSubAreaCities(subAreaId) {
        let cities = this.props.userFilteredCities.filter(cityItem => cityItem.sub_area_id == subAreaId);
        let combos = this.state.combos;

        combos.cities = cities;
        this.setState({combos});
    }

    subAreaChange(event) {
        let newSubAreaName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let subAreaId = null;

        searchFields.sub_area_name = newSubAreaName;

        if ( null == selectedItem ) {
            subAreaId = null;
            searchFields.sub_area_id = null;
        } else {
            subAreaId = selectedItem.id;
            searchFields.sub_area_id = selectedItem.id;
        }

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.city_id = null;
        searchFields.city_name = '';

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({searchFields});

        if ( null == subAreaId ) {
            if ( null == this.state.searchFields.area_id ) {
                this.loadAllCities();
            } else {
                this.loadAreaCities(this.state.searchFields.area_id);
            }
        } else {
            this.loadSubAreaCities(subAreaId);

            searchFields.summary_by_name = this.summaryByNames.city;
            searchFields.summary_by_id = this.summaryBy.byCity;
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_NEIGHBORHOODS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CLUSTER_BALLOTS});
    }

    loadAllCities() {
        let cities = this.props.userFilteredCities;
        let combos = this.state.combos;

        combos.cities = cities;
        this.setState({combos});
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
        let newAreaName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let areaId = null;

        searchFields.area_name = newAreaName;

        if ( null == selectedItem ) {
            areaId = null;
            searchFields.area_id = null;
        } else {
            areaId = selectedItem.id
            searchFields.area_id = areaId;
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
            this.setState({combos});

            this.loadAllCities();
        } else {
            this.loadSubAreas(areaId);
            this.loadAreaCities(areaId);

            searchFields.summary_by_name = this.summaryByNames.city;
            searchFields.summary_by_id = this.summaryBy.byCity;
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_NEIGHBORHOODS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CLUSTER_BALLOTS});
    }

    validateEndDate() {
        let startDate = this.state.searchFields.start_date;
        let endDate = this.state.searchFields.end_date;

        if ( null == endDate ) {
            return true;
        } else if ( moment(endDate, 'YYYY-MM-DD', true).isValid() ) {
            if ( startDate != null ) {
                return (endDate >= startDate);
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    validateStartDate() {
        let startDate = this.state.searchFields.start_date;

        if ( null == startDate ) {
            return false;
        } else {
            return moment(startDate, 'YYYY-MM-DD', true).isValid();
        }
    }

    validateSummaryBy() {
        return (this.state.searchFields.summary_by_id != null);
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
        if ( this.state.searchFields.city_name.length == 0 ) {
            return true;
        } else {
            return (this.state.searchFields.city_id != null);
        }
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
        } else  {
            return (this.state.searchFields.area_id != null);
        }
    }

    validateVariables() {
        this.validInput = true;

        if (null == this.state.searchFields.city_id) {
            this.validInput = false;

           // this.areaInputStyle = {borderColor: this.invalidColor};
            this.cityInputStyle = {borderColor: this.invalidColor};
        } else {
            if ( !this.validateArea() ) {
                this.validInput = false;
                this.areaInputStyle = {borderColor: this.invalidColor};
            }

            if ( !this.validateCity() ) {
                this.validInput = false;
                this.cityInputStyle = {borderColor: this.invalidColor};
            }
        }

        if ( !this.validateSubArea() ) {
            this.validInput = false;
            this.subAreaInputStyle = {borderColor: this.invalidColor};
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

        if ( !this.validateSummaryBy() ) {
            this.validInput = false;
            this.summaryByInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateStartDate() ) {
            this.validInput = false;
            this.startDateInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateEndDate() ) {
            this.validInput = false;
            this.endDateInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.areaInputStyle = {};
        this.subAreaInputStyle = {};
        this.cityInputStyle = {};
        this.neighborhoodInputStyle = {};
        this.clusterInputStyle = {};
        this.ballotInputStyle = {};
        this.summaryByInputStyle = {};
        this.startDateInputStyle = {};
        this.endDateInputStyle = {};
    }

    renderSupportStatuses() {
        let that = this;

        let statuses = this.props.supportStatuses.map( function(item, index) {
            return <SupportStatusItem key={index} item={item} itemSelected={that.state.searchFields.selected_statuses[item.key] != undefined}
                                      supportStatusChange={that.supportStatusChange.bind(that)}/>
        });

        return statuses;
    }

    render() {
		
        this.initVariables();

        this.validateVariables();

        return (
            <div className="container">
                <div className="dtlsBox srchPanel clearfix" style={{margin:'30px 0'}}>
                    <div className="row">
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses-area" className="control-label">אזור</label>
                                    <Combo id="reports-statuses-area"
                                           items={this.props.userFilteredAreas}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.areaInputStyle}
                                           value={this.state.searchFields.area_name}
                                           className="form-combo-table"
                                           onChange={this.areaChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses-sub-area" className="control-label">תת אזור</label>
                                    <Combo id="reports-statuses-sub-area"
                                           items={this.state.combos.subAreas}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.subAreaInputStyle}
                                           value={this.state.searchFields.sub_area_name}
                                           className="form-combo-table"
                                           onChange={this.subAreaChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses-searchByCity" className="control-label">עיר</label>
                                    <Combo id="ballots-polling-searchByCity"
                                           items={this.state.combos.cities}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.cityInputStyle}
                                           value={this.state.searchFields.city_name}
                                           className="form-combo-table"
                                           onChange={this.cityChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses-neighborhoods" className="control-label">איזורים מיוחדים</label>
                                    <Combo id="reports-statuses-neighborhoods"
                                           items={this.props.neighborhoods}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.neighborhoodInputStyle}
                                           value={this.state.searchFields.neighborhood.name}
                                           className="form-combo-table"
                                           onChange={this.neighborhoodChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses-cluster" className="control-label">אשכול</label>
                                    <Combo id="reports-statuses-cluster"
                                           items={this.state.combos.clusters}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.clusterInputStyle}
                                           value={this.state.searchFields.cluster_name}
                                           className="form-combo-table"
                                           onChange={this.clusterChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses-ballot" className="control-label">קלפי</label>
                                    <Combo id="reports-statuses-ballot"
                                           items={this.props.ballots}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.ballotInputStyle}
                                           value={this.state.searchFields.ballot_name}
                                           className="form-combo-table"
                                           onChange={this.ballotChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="FromDateStatus" className="control-label">מתאריך</label>
                                    <div className="datepicker-container">
                                        <div className="input-group date">
                                            <ReactWidgets.DateTimePicker
                                                isRtl={true} time={false}
                                                value={parseDateToPicker(this.state.searchFields.start_date)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.startDateChange,
                                                    format: "YYYY-MM-DD",
                                                    functionParams: 'dateTime'})
                                                }
                                                format="DD/MM/YYYY"
                                                style={this.startDateInputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="UntilDateStatus" className="control-label">עד תאריך</label>
                                    <div className="datepicker-container">
                                        <div className="input-group date">
                                            <ReactWidgets.DateTimePicker
                                                isRtl={true} time={false}
                                                value={parseDateToPicker(this.state.searchFields.end_date)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.endDateChange,
                                                    format: "YYYY-MM-DD",
                                                    functionParams: 'dateTime'})
                                                }
                                                format="DD/MM/YYYY"
                                                style={this.endDateInputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-5ths">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="reports-statuses--sum-by" className="control-label">סכם לפי</label>
                                    <Combo id="reports-statuses--sum-by"
                                           items={this.summaryByArr}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.summaryByInputStyle}
                                           value={this.state.searchFields.summary_by_name}
                                           className="form-combo-table"
                                           onChange={this.summaryByChange.bind(this)}/>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div>פירוט אודות הסטטוסים הבאים <span className="remove-all" style={{cursor: 'pointer'}}> &nbsp;&nbsp;&nbsp;<a onClick={this.selectAllSupportStatuse.bind(this)} style={{textDecoration:'underline'}}>{(this.state.searchFields.selectAllStatuses) ? 'הסר הכל' : 'בחר הכל'}</a></span></div>
                    
                        <div className="form-group">
                            <div className="checkbox pull-right">

                                {this.renderSupportStatuses()}
                            </div>
                            <div>
								
								<div className="box-button-single">
								<button title="נקה הכל" type="submit" className="btn btn-danger pull-left"
								style={{ marginTop: 22   }} onClick={this.resetSearchFields.bind(this)}>נקה הכל</button>
								</div>
								<div className="box-button-single">
                                <button title="הצג" type="submit" className="btn btn-primary srchBtn pull-left"
                                        onClick={this.displayStatusChangeReport.bind(this)}
                                        disabled={!this.validInput || this.props.loadingData}>הצג</button>
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
        userFilteredAreas: state.system.currentUserGeographicalFilteredLists.areas,
        userFilteredSubAreas: state.system.currentUserGeographicalFilteredLists.sub_areas,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,

        clusters: state.elections.statusesScreen.combos.clusters,
        ballots: state.elections.statusesScreen.combos.ballots,
        neighborhoods: state.elections.statusesScreen.combos.neighborhoods,

        supportStatuses: state.elections.statusesScreen.combos.supportStatuses,

        loadingData: state.elections.statusesScreen.loadingData , 
		
		preElectionsDashboardSearchScreen:state.elections.preElectionsDashboard.searchScreen,
		isClickedGotoSupportStatusChangeReport:state.elections.preElectionsDashboard.measureSupportScreen.isClickedGotoSupportStatusChangeReport,
		selectedTimePeriod:state.elections.preElectionsDashboard.measureSupportScreen.selectedTimePeriod,
		currentCampaignStartDate:state.elections.preElectionsDashboard.measureSupportScreen.current_campaign_start_date,
    }
}

export default connect(mapStateToProps) (StatusChangeSearch);