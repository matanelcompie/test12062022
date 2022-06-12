import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';
import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';


class ClusterSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: null,

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

                assignment_status: 0,
                assignment_status_name: 'לא כולל שיבוץ'
            },

            combos: {
                subAreas: [],
                cities: [],
                clusters: []
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.activistAllocationsTabs = constants.activists.allocationsTabs;

        this.allId = -1;

        this.assignmentStatusArr = [
            {id: this.allId, name: 'הכל'},
            {id: 0, name: 'לא כולל שיבוץ'},
            {id: 1, name: 'כולל שיבוץ'}
        ];

        this.emptyNeighborhood = {id: null, name: ''};

        this.invalidColor = '#cc0000';
        this.currentElectionRole = null;
    }

    componentWillMount() {
        let combos = this.state.combos;

        combos.cities = this.props.userFilteredCities;
        this.setState({combos});
    }

    componentWillReceiveProps(nextProps) {
        let clusterAllocation = this.activistAllocationsTabs.clusterAllocation;
        if ( this.props.currentAllocationTab != clusterAllocation && nextProps.currentAllocationTab == clusterAllocation ) {

            let election_roles_by_voter = nextProps.activistDetails.election_roles_by_voter;
            let roleIndex = election_roles_by_voter.findIndex(roleItem => roleItem.system_name == nextProps.currentTabRoleSystemName);
            this.currentElectionRole = election_roles_by_voter[roleIndex];
            this.defineAssignCityInSearchForm();

            if (!this.currentElectionRole) { return; } 

            switch ( nextProps.currentTabRoleSystemName ) {
                case this.electionRoleSytemNames.clusterLeader:
                    if (  this.currentElectionRole.activists_allocations_assignments.length > 0 ) {
                        this.setState({collapsed: false});
                    } else {
                        this.setState({collapsed: true});
                    }
                    break;

                case this.electionRoleSytemNames.motivator:
                    if (  this.currentElectionRole.activists_allocations_assignments.length > 0 ) {
                        this.setState({collapsed: false});
                    } else {
                        this.setState({collapsed: true});
                    }
                    break;
            }
        }

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
    }
    defineAssignCityInSearchForm(){
        let city_id = this.currentElectionRole.assigned_city_id;
        let city_name = this.currentElectionRole.assigned_city_name;
        let assignedCity = this.props.userFilteredCities.find(function(city){
            return city.id == city_id;
        });
        this.changeCity(assignedCity, city_name);
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    searchClusters(event) {
        // Prevent page refresh
        event.preventDefault();

        if ( !this.validInput ) {
            return;
        }

        let assignmentStatus = (this.state.searchFields.assignment_status == this.allId) ? null : this.state.searchFields.assignment_status;

        let searchObj = {
            area_id: this.state.searchFields.area_id,
            sub_area_id: this.state.searchFields.sub_area_id,
            city_id: this.state.searchFields.city_id,
            neighborhood_id: this.state.searchFields.neighborhood.id,
            cluster_id: this.state.searchFields.cluster_id,
            assignment_status: assignmentStatus
        };
        if (!this.currentElectionRole) { return; }

        let electionRoleByVoterKey = this.currentElectionRole.key;
        console.log(this.currentElectionRole);

        ElectionsActions.clustersSearch(this.props.dispatch, electionRoleByVoterKey, searchObj);
    }

    getAssignmentStatus(assignmentStatusName) {
        let assignmentStatusIndex = this.assignmentStatusArr.findIndex(assignmentStatusItem => assignmentStatusItem.name == assignmentStatusName);

        if ( -1 == assignmentStatusIndex ) {
            return null;
        } else {
            return this.assignmentStatusArr[assignmentStatusIndex].id;
        }
    }

    assignmentStatusChange(event) {
        let assignmentStatusName = event.target.value;
        let assignmentStatus = this.getAssignmentStatus(assignmentStatusName);

        let searchFields = this.state.searchFields;

        searchFields.assignment_status = assignmentStatus;
        searchFields.assignment_status_name = assignmentStatusName;

        this.setState(searchFields);
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
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.cluster_id = null;
            searchFields.cluster_name = event.target.value;

            this.updateClusterNeighborhood(null);
        } else {
            searchFields.cluster_id = selectedItem.id;
            searchFields.cluster_name = selectedItem.name;

            this.updateClusterNeighborhood(selectedItem.neighborhood_id);
        }

        this.setState({searchFields});
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

            this.loadNeighborhoodClusters(selectedItem.id);
        }

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        this.setState({searchFields});
    }

    updateCityAreaAndSubArea(searchFields, citySelectedItem) {

        let areaId = citySelectedItem.area_id;
        searchFields.area_id = areaId;

        let subAreaId = citySelectedItem.sub_area_id;
        searchFields.sub_area_id = subAreaId;

        let areaIndex = this.props.userFilteredAreas.findIndex(item => item.id == areaId);
        searchFields.area_name = this.props.userFilteredAreas[areaIndex].name;
        searchFields.sub_area_name = '';

        if ( subAreaId != null && subAreaId != 0 ) {
            let subAreaIndex = this.props.userFilteredSubAreas.findIndex(item => item.id == subAreaId);
            if(subAreaIndex >0 ){
                searchFields.sub_area_name = this.props.userFilteredSubAreas[subAreaIndex].name;
            }
        } 
    }
    cityChange(event) {
        let selectedItem = event.target.selectedItem;
        let inputValue = event.target.value;
        this.changeCity(selectedItem, inputValue)
    }
    changeCity(selectedItem, inputValue) {
        let searchFields = {...this.state.searchFields};
        let cityId = null;
        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        if ( selectedItem != null ) {
            cityId = selectedItem.id;
            this.updateCityAreaAndSubArea(searchFields, selectedItem);

            ElectionsActions.loadActivistCityNeighborhoods(this.props.dispatch, selectedItem.key,
                                                           ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.LOAD_NEIGHBORHOODS);

            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_CLUSTERS});
            ElectionsActions.loadActivistCityClusters(this.props.dispatch, selectedItem.key,
                                                      ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.LOAD_CLUSTERS);
        } else {
            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_CLUSTERS});
            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_NEIGHBORHOODS});
        }
        searchFields.city_name = inputValue;
        searchFields.city_id = cityId;

        this.setState({searchFields});
    }

    loadSubAreaCities(subAreaId) {
        let cities = this.props.userFilteredCities.filter(cityItem => cityItem.sub_area_id == subAreaId);
        let combos = this.state.combos;

        combos.cities = cities;
        this.setState({combos});
    }

    subAreaChange(event) {
        let searchFields = this.state.searchFields;

        let selectedItem = event.target.selectedItem;
        let subAreaId = null;

        if ( null == selectedItem ) {
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

        this.setState(searchFields);

        if ( subAreaId != null ) {
            this.loadSubAreaCities(subAreaId);
        } else {
            let combos = this.state.combos;

            if ( this.state.searchFields.area_id != null ) {
                this.loadAreaCities(this.state.searchFields.area_id);
            } else {
                combos.cities = this.props.userFilteredCities;
            }

            combos.clusters = [];
            this.setState({combos});
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.DRIVER.RESET_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.DRIVER.RESET_NEIGHBORHOODS});
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
        let searchFields = this.state.searchFields;

        let areaId = null;

        if ( null == selectedItem ) {
            searchFields.area_id = null;
            searchFields.area_name = event.target.value;
        } else {
            areaId = selectedItem.id;

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

        this.setState({searchFields});

        if ( areaId != null ) {
            this.loadSubAreas(areaId);
            this.loadAreaCities(areaId);
        } else {
            let combos = this.state.combos;

            combos.subAreas = [];
            combos.cities = this.props.userFilteredCities;
            combos.clusters = [];
            this.setState({combos});
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_NEIGHBORHOODS});
    }

    validateAssignment() {
        return (this.state.searchFields.assignment_status != null);
    }

    validateCluster() {
        if (this.state.searchFields.cluster_name.length == 0) {
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
		return (this.state.searchFields.city_id != null);
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
            this.inputAreaStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateSubArea() ) {
            this.validInput = false;
            this.inputSubAreaStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCity() ) {
            this.validInput = false;
            this.inputCityStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateNeighborhood() ) {
            this.validInput = false;
            this.neighborhoodInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCluster() ) {
            this.validInput = false;
            this.inputClusterStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateAssignment() ) {
            this.validInput = false;
            this.inputAssignmentStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.inputAreaStyle = {};
        this.inputSubAreaStyle = {};
        this.inputCityStyle = {};
        this.neighborhoodInputStyle = {};
        this.inputClusterStyle = {};
        this.inputAssignmentStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="containerStrip" style={{borderBottom: 'none'}}>
                <a onClick={this.updateCollapseStatus.bind(this)}
                   aria-expanded={this.state.collapsed}>
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <div className="collapseTitle">חיפוש</div>
                    </div>
                </a>

                <div className={"clusters-search" + (this.state.collapsed ? "" : " hidden")}>
                    <div className="row panelContent srchPanelLabel">
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputArea2-cluster-search" className="control-label">אזור</label>
                                    <Combo items={this.props.userFilteredAreas}
                                           id="inputArea2-cluster-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputAreaStyle}
                                           value={this.state.searchFields.area_name}
                                           disabled={true}
                                           onChange={this.areaChange.bind(this)}/>
                                </div>
                        </div>
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputArea3-cluster-search" className="control-label">תת אזור</label>
                                    <Combo items={this.state.combos.subAreas}
                                           id="inputSubArea2-cluster-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputSubAreaStyle}
                                           value={this.state.searchFields.sub_area_name}
                                           disabled={true}
                                           onChange={this.subAreaChange.bind(this)}/>
                                </div>
                        </div>
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputCity2-cluster-search" className="control-label">עיר</label>
                                    <Combo items={this.state.combos.cities}
                                           id="inputCity2-cluster-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputCityStyle}
                                           value={this.state.searchFields.city_name}
                                           disabled={true}
                                           onChange={this.cityChange.bind(this)}/>
                                </div>
                        </div>
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputSpecificAreas2-cluster-search" className="control-label">אזור מיוחד</label>
                                    <Combo id="inputSpecificAreas2-cluster-search"
                                           items={this.props.neighborhoods}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.neighborhoodInputStyle}
                                           value={this.state.searchFields.neighborhood.name}
                                           className="form-combo-table"
                                           onChange={this.neighborhoodChange.bind(this)}/>
                                </div>
                        </div>

                    </div>
                    <div className="row panelContent srchPanelLabel">
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputBulk2-cluster-search" className="control-label">אשכול</label>
                                    <Combo items={this.state.combos.clusters}
                                           id="inputBulk2-cluster-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputClusterStyle}
                                           value={this.state.searchFields.cluster_name}
                                           onChange={this.clusterChange.bind(this)}/>
                                </div>
                        </div>
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputBulk3-cluster-search" className="control-label">סטטוס שיבוץ האשכול</label>
                                    <Combo items={this.assignmentStatusArr}
                                           id="inputBulk3-cluster-search"
                                           showFilteredList={false}
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputAssignmentStyle}
                                           value={this.state.searchFields.assignment_status_name}
                                           onChange={this.assignmentStatusChange.bind(this)}
                                    />
                                </div>
                        </div>
                        <div className="col-lg-3 col-lg-offset-3">
                            <div className="btnRow box-btn-row">
                                <button title="חפש" type="submit" className="btn new-btn-default saveChanges"
                                        disabled={!this.validInput} onClick={this.searchClusters.bind(this)}>חפש</button>
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

        clusters: state.elections.activistsScreen.clusterLeader.combos.clusters,
        neighborhoods: state.elections.activistsScreen.clusterLeader.combos.neighborhoods,

        activistDetails: state.elections.activistsScreen.activistDetails
    };
}

export default connect(mapStateToProps) (ClusterSearch);