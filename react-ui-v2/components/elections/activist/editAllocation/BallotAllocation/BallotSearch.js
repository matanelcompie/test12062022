import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';


class BallotSearch extends React.Component {
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

                ballot_id: null,
                ballot_name: '',

                ballot_role_id: null,
                ballot_role_name: '',

                assignment_status: null,
                assignment_status_name: ''
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
        this.ballotAssignmentStatus = constants.activists.ballotAssignmentStatus;
        this.activistAllocationsTabs = constants.activists.allocationsTabs;

        this.assignmentStatusArr = [
            {id: this.ballotAssignmentStatus.all, name: 'הכל'},
            {id: this.ballotAssignmentStatus.noAssignment, name: 'ללא שיבוץ בכלל'},
            {id: this.ballotAssignmentStatus.noOrPartialAssignment, name: 'ללא שיבוץ או שיבוץ חלקי'},
            {id: this.ballotAssignmentStatus.partialAssignment, name: 'משובצות חלקית'},
            {id: this.ballotAssignmentStatus.firstShiftAssignmet, name: "משובצות רק משמרת א'"},
            {id: this.ballotAssignmentStatus.secondShiftAssignmet, name: "משובצות רק משמרת ב'"},
            {id: this.ballotAssignmentStatus.assignedWithoutCount, name: 'משובצות ללא ספירה'},
            {id: this.ballotAssignmentStatus.fullAssignment, name: 'משובצות מלא'}
        ];

        this.emptyNeighborhood = {id: null, name: ''};

        this.invalidColor = '#cc0000';
    }

    componentWillMount() {
        let combos = this.state.combos;
        combos.cities = this.props.userFilteredCities;

        let searchFields = this.state.searchFields;
        searchFields.assignment_status = this.ballotAssignmentStatus.noOrPartialAssignment;
        searchFields.assignment_status_name = 'ללא שיבוץ או שיבוץ חלקי';

        this.setState({combos, searchFields});
    }

    componentWillReceiveProps(nextProps) {
        let ballotAllocation = this.activistAllocationsTabs.ballotAllocation;

        if ( this.props.currentAllocationTab != ballotAllocation && nextProps.currentAllocationTab == ballotAllocation ) {

            let election_roles_by_voter = nextProps.activistDetails.election_roles_by_voter;
            let roleIndex = election_roles_by_voter.findIndex(roleItem => roleItem.system_name == nextProps.currentTabRoleSystemName);
            let currentElectionRole = election_roles_by_voter[roleIndex];

            this.defineAssignCityInSearchForm(currentElectionRole);


            if (  currentElectionRole.activists_allocations_assignments.length > 0 ) {
                this.setState({collapsed: false});
            } else {
                this.setState({collapsed: true});
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
    defineAssignCityInSearchForm(currentElectionRole){
        let city_id = currentElectionRole.assigned_city_id;
        let city_name = currentElectionRole.assigned_city_name;
        let assignedCity = this.props.userFilteredCities.find(function(city){
            return city.id == city_id;
        });
        this.changeCity(assignedCity, city_name);
    }
    searchBallots(event) {
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
            ballot_id: this.state.searchFields.ballot_id,
            ballot_role_id: this.state.searchFields.ballot_role_id,

            assignment_status: assignmentStatus
        };
        this.props.searchBallots(searchObj);
    }

    updateCollapseStatus() {
        let collapsed = !this.state.collapsed;

        this.setState({collapsed});
    }

    assignmentStatusChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.assignment_status = null;
            searchFields.assignment_status_name = event.target.value;
        } else {
            searchFields.assignment_status = selectedItem.id;
            searchFields.assignment_status_name = selectedItem.name;
        }

        this.setState({searchFields});
    }

    ballotRoleChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.ballot_role_id = null;
            searchFields.ballot_role_name = event.target.value;
        } else {
            searchFields.ballot_role_id = selectedItem.id;
            searchFields.ballot_role_name = selectedItem.name;
        }

        this.setState({searchFields});
    }

    ballotChange(event) {
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.ballot_id = null;
            searchFields.ballot_name = event.target.value;
        } else {
            searchFields.ballot_id = selectedItem.id;
            searchFields.ballot_name = selectedItem.name;
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
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        if ( null == selectedItem ) {
            searchFields.cluster_id = null;
            searchFields.cluster_name = event.target.value;

            this.updateClusterNeighborhood(null);

            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOTS});
        } else {
            searchFields.cluster_id = selectedItem.id;
            searchFields.cluster_name = selectedItem.name;

            this.updateClusterNeighborhood(selectedItem.neighborhood_id);

            ElectionsActions.loadClusterBallots(this.props.dispatch, selectedItem.key);
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

        if ( subAreaId != null && subAreaId != 0 ) {
            let subAreaIndex = this.props.userFilteredSubAreas.findIndex(item => item.id == subAreaId);
            if(subAreaIndex > 0){
                searchFields.sub_area_name = this.props.userFilteredSubAreas[subAreaIndex].name;
            }
        } else {
            searchFields.sub_area_name = '';
        }
    }

    cityChange(event) {
        let selectedItem = event.target.selectedItem;
        let inputValue = event.target.value;
        this.changeCity(selectedItem, inputValue)
    }
    changeCity(selectedItem, inputValue){
        let searchFields = { ...this.state.searchFields };

        let cityId = null;

        searchFields.neighborhood = this.emptyNeighborhood;

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        if ( selectedItem != null ) {
            cityId = selectedItem.id;

            this.updateCityAreaAndSubArea(searchFields, selectedItem);

            ElectionsActions.loadCityNeighborhoods(this.props.dispatch, selectedItem.key);

            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_CLUSTERS});
            ElectionsActions.loadCityClusters(this.props.dispatch, selectedItem.key);
            ElectionsActions.loadActivistCityBallots(this.props.dispatch, selectedItem.key, ElectionsActions.ActionTypes.ACTIVIST.LOAD_BALLOTS);
        } else {
            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_NEIGHBORHOODS});
            this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_CLUSTERS});
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOTS});
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

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

        this.setState({searchFields});

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

        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_NEIGHBORHOODS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOTS});
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

        searchFields.ballot_id = null;
        searchFields.ballot_name = '';

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

        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_NEIGHBORHOODS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOTS});
    }

    validateAssignment() {
        return (this.state.searchFields.assignment_status != null);
    }

    validateBallotRole() {
        if (this.state.searchFields.ballot_role_name.length == 0) {
            return true;
        } else {
            return (this.state.searchFields.ballot_role_id != null);
        }
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
            this.inputNeighborhoodStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCluster() ) {
            this.validInput = false;
            this.inputClusterStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateBallot() ) {
            this.validInput = false;
            this.inputBallotStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateBallotRole() ) {
            this.validInput = false;
            this.inputBallotRoleStyle = {borderColor: this.invalidColor};
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
        this.inputNeighborhoodStyle = {};
        this.inputClusterStyle = {};
        this.inputBallotStyle = {};
        this.inputBallotRoleStyle = {};
        this.inputAssignmentStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="containerStrip">
                <a onClick={this.updateCollapseStatus.bind(this)}
                   aria-expanded={this.state.collapsed}>
                    <div className="row panelCollapse">
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <div className="collapseTitle">חיפוש</div>
                    </div>
                </a>

                <div className={"ballots-search" + (this.state.collapsed ? "" : " hidden")}>
                    <div className="row panelContent srchPanelLabel">
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputArea2-ballot-search" className="control-label">אזור</label>
                                    <Combo items={this.props.userFilteredAreas}
                                           id="inputArea2-ballot-search"
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
                                    <label htmlFor="inputArea3-ballot-search" className="control-label">תת אזור</label>
                                    <Combo items={this.state.combos.subAreas}
                                           id="inputArea3-ballot-search"
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
                                    <label htmlFor="inputCity2-ballot-search" className="control-label">עיר</label>
                                    <Combo items={this.state.combos.cities}
                                           id="inputCity2-ballot-search"
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
                                    <label htmlFor="inputSpecificAreas2-ballot-search" className="control-label">אזור מיוחד</label>
                                    <Combo id="inputSpecificAreas2-ballot-search"
                                           items={this.props.neighborhoods}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           maxDisplayItems={10}
                                           inputStyle={this.inputNeighborhoodStyle}
                                           value={this.state.searchFields.neighborhood.name}
                                           className="form-combo-table"
                                           onChange={this.neighborhoodChange.bind(this)}/>
                                </div>
                        </div>
                    </div>

                    <div className="row panelContent srchPanelLabel">
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputBulk2-ballot-search" className="control-label">אשכול</label>
                                    <Combo items={this.state.combos.clusters}
                                           id="inputBulk2-ballot-search"
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
                                    <label htmlFor="ballot-box-ballot-search" className="control-label">קלפי</label>
                                    <Combo items={this.props.ballots}
                                           id="ballot-box-ballot-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputBallotStyle}
                                           value={this.state.searchFields.ballot_name}
                                           onChange={this.ballotChange.bind(this)}/>
                                </div>
                        </div>
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="ballot-box2-ballot-search" className="control-label">תפקיד קלפי</label>
                                    <Combo items={this.props.ballotRoles}
                                           id="ballot-box2-ballot-search"
                                           maxDisplayItems={10}
                                           itemIdProperty="id"
                                           itemDisplayProperty="name"
                                           className="form-combo-table"
                                           inputStyle={this.inputBallotRoleStyle}
                                           value={this.state.searchFields.ballot_role_name}
                                           onChange={this.ballotRoleChange.bind(this)}/>
                                </div>
                        </div>
                        <div className="col-lg-3">
                                <div className="form-group">
                                    <label htmlFor="inputBulk3-ballot-search" className="control-label">סטטוס שיבוץ הקלפי</label>
                                    <Combo items={this.assignmentStatusArr}
                                           id="inputBulk3-ballot-search"
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
                        <div className="col-lg-12">
                            <div className="btnRow box-btn-row">
                                <button title="חפש" type="submit"
                                        className="btn new-btn-default saveChanges" disabled={!this.validInput}
                                        onClick={this.searchBallots.bind(this)}>חפש
                                </button>
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
        activistDetails: state.elections.activistsScreen.activistDetails,

        areas: state.system.lists.areas,
        cities: state.system.lists.cities,

        userFilteredAreas: state.system.currentUserGeographicalFilteredLists.areas,
        userFilteredSubAreas: state.system.currentUserGeographicalFilteredLists.sub_areas,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,

        neighborhoods: state.elections.activistsScreen.neighborhoods,
        clusters: state.elections.activistsScreen.clusters,
        ballots: state.elections.activistsScreen.ballots,

        ballotRoles: state.elections.activistsScreen.ballotRoles,
    };
}

export default connect(mapStateToProps) (BallotSearch);