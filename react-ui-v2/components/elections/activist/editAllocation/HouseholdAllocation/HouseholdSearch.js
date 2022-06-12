import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import SearchFiftyMinisterModal from 'components/global/Captain50SearchModal/SearchFiftyMinisterModal';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';
import { inArray } from '../../../../../libs/globalFunctions';


class HouseholdSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchFields: {
                area_id: null,
                area_name: '',

                allocation_city_key: null,
                city_id: null,
                city_name: '',

                street_id: null,
                street_name: '',

                neighborhood: { id: null, name: '' },

                cluster_id: null,
                cluster_name: '',

                ballot_id: null,
                ballot_name: '',

                captain_id: null,
                captain_name: '',

                last_name: '',

                allocatedToCaptain50Id: 0,
                allocatedToCaptain50Name: 'לא'
            },

            citiesCombo: [],

            combos: {
                cities: [],
                clusters: []
            },

            searchFiftyMinisterModal: {
                show: false
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.allId = -1;

        this.belongsToMinisterOf50Arr = [
            { id: this.allId, name: 'הכל' },
            { id: 0, name: 'לא' },
            { id: 1, name: 'כן' }
        ];

        this.invalidColor = '#cc0000';

        this.searchIcon = {
            text: 'חפש שר 100'
        };

        this.emptyNeighborhood = { id: null, name: '' };

        this.activistAllocationsTabs = constants.activists.allocationsTabs;
    }

    componentWillMount() {
        
        let combos = this.state.combos;

        combos.cities = this.props.userFilteredCities;
        this.setState({ combos });
    }

    componentWillReceiveProps(nextProps) {
        let householdAllocation = this.activistAllocationsTabs.householdAllocation;

        if ( this.props.currentAllocationTab != householdAllocation && nextProps.currentAllocationTab == householdAllocation ) {
            
            let election_roles_by_voter = nextProps.activistDetails.election_roles_by_voter;
            let roleIndex = election_roles_by_voter.findIndex(roleItem => roleItem.system_name == nextProps.currentTabRoleSystemName);
            
            this.defineAssignCityInSearchForm(election_roles_by_voter[roleIndex]);
            
        }
        if (this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0) {
            let combos = this.state.combos;

            combos.cities = nextProps.userFilteredCities;
            this.setState({ combos });
        }

        if (this.props.clusters.length == 0 && nextProps.clusters.length > 0) {
            let combos = this.state.combos;

            combos.clusters = nextProps.clusters;
            this.setState({ combos });
        }

    }

    defineAssignCityInSearchForm(currentElectionRole){
        let city_id = currentElectionRole.assigned_city_id;
        let city_name = currentElectionRole.assigned_city_name;
        let assignedCity = this.props.userFilteredCities.find(function(city){
            return city.id == city_id;
        });
        let isGlobalHeadquarterArea = this.checkIfGlobalHeadquarterArea(assignedCity); 
        this.setState({isGlobalHeadquarterArea})
        this.changeCity(assignedCity, city_name);
    }
    checkIfGlobalHeadquarterArea(assignedCity){
        return inArray(constants.globalHeadquartersAreas, assignedCity.area_id);
    }
    cancelHouseholdSearch(event) {
        event.preventDefault();

        ElectionsActions.cancelHouseholdSearch(this.props.dispatch);
    }

    searchHouseholds(event) {
        // Prevent page refresh
        event.preventDefault();

        if (!this.validInput) {
            return;
        }

        let searchObj = {
            area_id: this.state.searchFields.area_id,
            city_id: this.state.searchFields.city_id,
            street_id: this.state.searchFields.street_id,
            street_name: (this.state.searchFields.street_id == null) ? null : this.state.searchFields.street_name,
            neighborhood_id: this.state.searchFields.neighborhood.id,
            neighborhood_name: (this.state.searchFields.neighborhood.id == null) ? null : this.state.searchFields.neighborhood.name,

            cluster_id: this.state.searchFields.cluster_id,
            ballot_id: this.state.searchFields.ballot_id,

            captain_id: this.state.searchFields.captain_id,

            last_name: this.state.searchFields.last_name.length == 0 ? null : this.state.searchFields.last_name,

            allocated_to_captain50: this.state.searchFields.allocatedToCaptain50Id == this.allId ? null : this.state.searchFields.allocatedToCaptain50Id
        };
        searchObj.with_no_households = this.props.getOnlyVoters;
        if ( this.props.filterItems.length > 0 ) {
            ElectionsActions.householdSearch(this.props.dispatch, searchObj, JSON.stringify(this.props.filterItems));
        } else {
            ElectionsActions.householdSearch(this.props.dispatch, searchObj);
        }
    }

    deleteCaptain50(event) {
        // Prevent page refresh
        event.preventDefault();

        if (!this.validInput) {
            return;
        }

        let searchFields = this.state.searchFields;

        searchFields.captain_id = null;
        searchFields.captain_name = '';

        this.setState({ searchFields });
    }

    saveMinisterOf50(captainId, captainName, captainKey) {
        let searchFields = this.state.searchFields;

        searchFields.captain_id = captainId;
        searchFields.captain_name = captainName;

        this.setState({ searchFields });

        this.hideSearchFiftyMinisterModal();
    }

    hideSearchFiftyMinisterModal() {
        let searchFiftyMinisterModal = this.state.searchFiftyMinisterModal;

        searchFiftyMinisterModal.show = false;
        this.setState(searchFiftyMinisterModal);
    }

    showSearchFiftyMinisterModal() {
        if (this.state.searchFields.allocatedToCaptain50Id != 1) {
            return;
        }

        let searchFiftyMinisterModal = this.state.searchFiftyMinisterModal;

        searchFiftyMinisterModal.show = true;
        this.setState({ searchFiftyMinisterModal });
    }

    lastNameChange(event) {
        let searchFields = this.state.searchFields;

        searchFields.last_name = event.target.value;
        this.setState({ searchFields });
    }

    getAllocatedToCaptainIndex(allocatedToCaptain50Name) {
        return this.belongsToMinisterOf50Arr.findIndex(item => item.name == allocatedToCaptain50Name);
    }

    allocatedToCaptain50Change(event) {
        let allocatedToCaptain50Name = event.target.value;
        let allocatedToCaptain50Index = this.getAllocatedToCaptainIndex(allocatedToCaptain50Name);
        let allocatedToCaptain50Id = (allocatedToCaptain50Index == -1) ? null : this.belongsToMinisterOf50Arr[allocatedToCaptain50Index].id;

        let searchFields = this.state.searchFields;

        searchFields.allocatedToCaptain50Id = allocatedToCaptain50Id;
        searchFields.allocatedToCaptain50Name = allocatedToCaptain50Name;
        this.setState({ searchFields });

        if (allocatedToCaptain50Id != 1) {
            this.deleteCaptain50(event);
        }
    }

    ballotChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        searchFields.neighborhood = this.emptyNeighborhood;

        if (null == selectedItem) {
            searchFields.ballot_id = null;
            searchFields.ballot_name = event.target.value;
        } else {
            searchFields.ballot_id = selectedItem.id;
            searchFields.ballot_name = selectedItem.name;
        }

        this.setState({ searchFields });
    }

    updateClusterNeighborhood(searchFields, neighborhoodId) {

        if (neighborhoodId != null) {
            let neighborhoodIndex = this.props.neighborhoods.findIndex(item => item.id == neighborhoodId);

            searchFields.neighborhood = {
                id: neighborhoodId,
                name: this.props.neighborhoods[neighborhoodIndex].name
            }
        } else {
            searchFields.neighborhood = this.emptyNeighborhood;
        }
    }

    clusterChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        let clusterKey = null;
        let neighborhood_id = null;
        if (null == selectedItem) {
            searchFields.cluster_id = null;
            searchFields.cluster_name = event.target.value;
            this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_BALLOTS });
            ElectionsActions.loadActivistCityBallots(this.props.dispatch, searchFields.allocation_city_key , ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_BALLOTS, true);

        } else {
            searchFields.cluster_id = selectedItem.id;
            searchFields.cluster_name = selectedItem.name;
            clusterKey = selectedItem.key;
            neighborhood_id = selectedItem.neighborhood_id;
            ElectionsActions.loadActivistClusterBallots(this.props.dispatch, clusterKey, ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_BALLOTS, true);
        }
        this.updateClusterNeighborhood(searchFields ,neighborhood_id);

        this.setState({ searchFields });
    }

    streetChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if (null == selectedItem) {
            searchFields.street_id = null;
            searchFields.street_name = event.target.value;
        } else {
            searchFields.street_id = selectedItem.id;
            searchFields.street_name = selectedItem.name;
        }

        this.setState({ searchFields });
    }

    loadNeighborhoodClusters(neighborhoodId) {
        let clusters = this.props.clusters.filter(clusterItem => clusterItem.neighborhood_id == neighborhoodId);
        let combos = this.state.combos;

        combos.clusters = clusters;
        this.setState({ combos });
    }

    neighborhoodChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let combos = this.state.combos;

        if (null == selectedItem) {
            searchFields.neighborhood = { ...this.emptyNeighborhood, name: event.target.value };

            combos.clusters = this.props.clusters;
            this.setState({ combos });
        } else {
            searchFields.neighborhood = {
                id: selectedItem.id,
                name: selectedItem.name
            };

            this.loadNeighborhoodClusters(selectedItem.id);
        }

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        this.setState({ searchFields });
    }


    updateCityArea(searchFields, citySelectedItem) {

        let areaId = citySelectedItem.area_id;
        searchFields.area_id = areaId;
 
        let areaIndex = this.props.userFilteredAreas.findIndex(item => item.id == areaId);
        searchFields.area_name = this.props.userFilteredAreas[areaIndex].name;
    }

    cityChange(event) {
        let selectedItem = event.target.selectedItem;
        let inputValue = event.target.value;
        this.changeCity(selectedItem, inputValue)
    }
    changeCity(selectedItem, inputValue){
        let searchFields = this.state.searchFields;

        searchFields.neighborhood = this.emptyNeighborhood;

        let cityId = null;

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.street_id = null;
        searchFields.street_name = '';

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';
        searchFields.ballot_name = '';
        searchFields.allocation_city_key = '';


        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_STREETS });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_NEIGHBORHOODS });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_CLUSTERS });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_BALLOTS });

        if (selectedItem != null) {
            cityId = selectedItem.id;
            searchFields.allocation_city_key = selectedItem.key;

            this.updateCityArea(searchFields, selectedItem);
            this.updateClusterNeighborhood(searchFields, selectedItem.neighborhood_id);

            ElectionsActions.loadActivistCityNeighborhoods(this.props.dispatch, selectedItem.key,
                ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_NEIGHBORHOODS);
            ElectionsActions.loadActivistCityStreets(this.props.dispatch, selectedItem.key,
                ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_STREETS);
            ElectionsActions.loadActivistCityClusters(this.props.dispatch, selectedItem.key,
                ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_CLUSTERS);

            ElectionsActions.loadActivistCityClusters(this.props.dispatch, selectedItem.key,
                ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_CLUSTERS);
            ElectionsActions.loadActivistCityBallots(this.props.dispatch, selectedItem.key , ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_BALLOTS, true);

        }
        searchFields.city_id = cityId;
        searchFields.city_name = inputValue;

        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOTS });
        this.setState({ searchFields });

    }

    loadAreaCities(areaId) {
        let combos = this.state.combos;

        combos.cities = this.props.userFilteredCities.filter(cityItem => cityItem.area_id == areaId);
        this.setState({ combos });
    }

    areaChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        let areaId = null;

        if (null == selectedItem) {
            searchFields.area_id = null;
            searchFields.area_name = event.target.value;
        } else {
            areaId = selectedItem.id;

            searchFields.area_id = areaId;
            searchFields.area_name = selectedItem.name;
        }

        searchFields.city_id = null;
        searchFields.city_name = '';

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.street_id = null;
        searchFields.street_name = '';

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({ searchFields });

        if (areaId != null) {
            this.loadAreaCities(areaId);
        } else {
            let combos = this.state.combos;

            combos.cities = this.props.userFilteredCities;
            this.setState({ combos });
        }

        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_STREETS });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_NEIGHBORHOODS });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_CLUSTERS });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_BALLOTS });
    }

    validateAllocated() {
        return (this.state.searchFields.allocatedToCaptain50Id != null);
    }

    validateBallot() {
        if (this.state.searchFields.ballot_name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.ballot_id != null);
        }
    }

    validateCluster() {
        if (this.state.searchFields.cluster_name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.cluster_id != null);
        }
    }

    validateStreet() {
        if (this.state.searchFields.street_name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.street_id != null);
        }
    }

    validateNeighborhood() {
        if (this.state.searchFields.neighborhood.name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.neighborhood.id != null);
        }
    }

    validateCity() {
        if (this.state.searchFields.city_name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.city_id != null);
        }
    }

    validateArea() {
        if (this.state.searchFields.area_name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.area_id != null);
        }
    }

    validateVariables() {
        this.validInput = true;
        let isAdmin = this.props.currentUser.admin;
        let isCityValid = (this.state.searchFields.city_id || (isAdmin && this.state.isGlobalHeadquarterArea))
        if (!isCityValid  && !this.state.searchFields.captain_id) {
            this.validInput = false;

            // this.captainInputStyle = { borderColor: this.invalidColor };
            this.inputCityStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateArea()) {
            this.validInput = false;
            this.inputAreaStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateCity()) {
            this.validInput = false;
            this.inputCityStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateStreet()) {
            this.validInput = false;
            this.inputStreetStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateNeighborhood()) {
            this.validInput = false;
            this.neighborhoodInputStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateCluster()) {
            this.validInput = false;
            this.inputClusterStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateBallot()) {
            this.validInput = false;
            this.inputBallotStyle = { borderColor: this.invalidColor };
        }

        if (!this.validateAllocated()) {
            this.validInput = false;
            this.inputAllocatedStyle = { borderColor: this.invalidColor };
        }
    }

    initVariables() {
        this.inputAreaStyle = {};
        this.inputCityStyle = {};
        this.neighborhoodInputStyle = {};
        this.inputStreetStyle = {};
        this.inputClusterStyle = {};
        this.inputBallotStyle = {};

        this.inputAllocatedStyle = {};

        this.captainInputStyle = {};
    }

    getSearchCaptain50Style() {
        if (this.state.searchFields.allocatedToCaptain50Id != 1) {
            return { cursor: 'not-allowed' };
        } else {
            return { cursor: 'pointer' }
        }
    }

    render() {
		
        this.initVariables();

        this.validateVariables();
        let isGlobalHeadquarterArea = this.state.isGlobalHeadquarterArea;

        return (
            <div className={"household-search" + (this.props.searchCollapse ? "" : " hidden")}>
                <div className="row panelContent srchPanelLabel">
                    <div className="col-lg-4 nopaddingR">
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputArea-household-search" className="col-sm-5 control-label">אזור</label>
                                <div className="col-sm-7">
                                    <Combo items={this.props.userFilteredAreas}
                                        id="inputArea-household-search"
                                        maxDisplayItems={10}
                                        itemIdProperty="id"
                                        itemDisplayProperty="name"
                                        className="form-combo-table"
                                        inputStyle={this.inputAreaStyle}
                                        value={this.state.searchFields.area_name}
                                        disabled={!isGlobalHeadquarterArea}
                                        onChange={this.areaChange.bind(this)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputStreet-household-search" className="col-sm-5 control-label">רחוב</label>
                                <div className="col-sm-7">
                                    <Combo id="inputStreet-household-search"
                                        items={this.props.streets}
                                        itemIdProperty="id"
                                        itemDisplayProperty="name"
                                        maxDisplayItems={10}
                                        inputStyle={this.inputStreetStyle}
                                        value={this.state.searchFields.street_name}
                                        className="form-combo-table"
                                        onChange={this.streetChange.bind(this)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputFamily-household-search" className="col-sm-5 control-label">שם משפחה</label>
                                <div className="col-sm-7">
                                    <input type="text" className="form-control" id="inputFamily-household-search"
                                        value={this.state.searchFields.last_name}
                                        onChange={this.lastNameChange.bind(this)} />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-4">
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputCity-household-search" className="col-sm-5 control-label">עיר</label>
                                <div className="col-sm-7">
                                    <Combo items={this.state.combos.cities}
                                        id="inputCity-household-search"
                                        maxDisplayItems={10}
                                        itemIdProperty="id"
                                        itemDisplayProperty="name"
                                        className="form-combo-table"
                                        inputStyle={this.inputCityStyle}
                                        value={this.state.searchFields.city_name}
                                        disabled={!isGlobalHeadquarterArea}
                                        onChange={this.cityChange.bind(this)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputBulk-household-search" className="col-sm-5 control-label">אשכול</label>
                                <div className="col-sm-7">
                                    <Combo items={this.state.combos.clusters}
                                        id="inputBulk-household-search"
                                        maxDisplayItems={10}
                                        itemIdProperty="id"
                                        itemDisplayProperty="name"
                                        className="form-combo-table"
                                        inputStyle={this.inputClusterStyle}
                                        value={this.state.searchFields.cluster_name}
                                        onChange={this.clusterChange.bind(this)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputCenturionAt-household-search" className="col-sm-5 control-label">משוייך לשר מאה</label>
                                <div className="col-sm-7">
                                    <Combo items={this.belongsToMinisterOf50Arr}
                                           id="inputCenturionAt-household-search"
                                           maxDisplayItems={3}
                                           showFilteredList={false}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputAllocatedStyle}
                                           value={this.state.searchFields.allocatedToCaptain50Name}
                                           onChange={this.allocatedToCaptain50Change.bind(this)} />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-4 nopaddingL">
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputSpecificAreas-household-search" className="col-sm-4 control-label">שכונה</label>
                                <div className="col-sm-7">
                                    <Combo id="inputSpecificAreas-household-search"
                                        items={this.props.neighborhoods}
                                        itemIdProperty="id"
                                        itemDisplayProperty="name"
                                        maxDisplayItems={10}
                                        inputStyle={this.neighborhoodInputStyle}
                                        value={this.state.searchFields.neighborhood.name}
                                        className="form-combo-table"
                                        onChange={this.neighborhoodChange.bind(this)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputBallot-household-search" className="col-sm-4 control-label">קלפי</label>
                                <div className="col-sm-7">
                                    <Combo items={this.props.ballots}
                                        id="inputBallot-household-search"
                                        maxDisplayItems={10}
                                        itemIdProperty="id"
                                        itemDisplayProperty="name"
                                        className="form-combo-table"
                                        inputStyle={this.inputBallotStyle}
                                        value={this.state.searchFields.ballot_name}
                                        onChange={this.ballotChange.bind(this)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputCenturion-household-search" className="col-sm-4 control-label">שם שר מאה</label>
                                <div className="col-sm-6">
                                    <input type="text" className="form-control" id="inputCenturion-household-search"
                                        style={this.captainInputStyle}
                                        value={this.state.searchFields.captain_name} disabled={true} />

                                </div>

                                <a className="search-icon blue" style={this.getSearchCaptain50Style()} title={this.searchIcon.text}
                                    data-toggle="modal" onClick={this.showSearchFiftyMinisterModal.bind(this)} />
                                <button className={"btn btn-danger btn-xs" + (this.state.searchFields.captain_id == null ? ' hidden' : '')}
                                    onClick={this.deleteCaptain50.bind(this)} style={{ marginTop: '-20px' }}>
                                    <i className="fa fa-trash-o" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12">
                        <div className="form-group">
                            <div className="btnRow">
                                <button type="submit" className="btn new-btn-default saveChanges"
                                    disabled={!this.validInput || this.props.loadingHouseholdsFlag}
                                    onClick={this.searchHouseholds.bind(this)}>
                                    {this.props.loadingHouseholdsFlag ? "טוען" : 'חפש'}
                                    <i className={"fa fa-spinner fa-spin pull-right" + (this.props.loadingHouseholdsFlag ? '' : ' hidden')}
                                        style={{ marginTop: 5 }} />
                                </button>

                                <button title="נקה הכל" type="submit" className="btn btn-danger pull-left" style={{marginLeft: '3px'}}
                                        onClick={this.cancelHouseholdSearch.bind(this)}>נקה הכל</button>
                            </div>
                        </div>
                    </div>
                </div>

                <SearchFiftyMinisterModal show={this.state.searchFiftyMinisterModal.show}
                                          screenPermission="elections.activists"
                                          hideSearchFiftyMinisterModal={this.hideSearchFiftyMinisterModal.bind(this)}
                                          saveMinisterOf50={this.saveMinisterOf50.bind(this)}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        activistDetails: state.elections.activistsScreen.activistDetails,

        userFilteredAreas: state.system.currentUserGeographicalFilteredLists.areas,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,

        neighborhoods: state.elections.activistsScreen.household.combos.neighborhoods,
        streets: state.elections.activistsScreen.household.combos.streets,
        clusters: state.elections.activistsScreen.household.combos.clusters,
        ballots: state.elections.activistsScreen.household.combos.ballots,

        filterItems: state.global.voterFilter.captain50_activist.vf.filter_items,

        loadingHouseholdsFlag: state.elections.activistsScreen.loadingHouseholdsFlag
    };
}

export default connect(mapStateToProps)(HouseholdSearch);