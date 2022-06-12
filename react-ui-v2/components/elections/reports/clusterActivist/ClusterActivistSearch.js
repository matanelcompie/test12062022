import React from 'react';
import { connect } from 'react-redux';

import Combo from '../../../global/Combo';
import ModalSearchClusterLeader from './modalSearch/ModalSearchClusterLeader';

import * as ElectionsActions from '../../../../actions/ElectionsActions';


class ClusterActivistSearch extends React.Component {
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

                cluster_id: null,
                cluster_name: '',

                neighborhood: {id: null, name: ''},

                selected_roles: [],

                cluster_leader: {
                    key: null,
                    first_name: '',
                    last_name: '',
                    personal_identity: ''
                },

                activistDisplayType: {
                    all: true,
                    selected: false
                }
            },

            combos: {
                subAreas: [],
                cities: [],
                clusters: [],
            },

            modalSearchLeader: {
                show: false
            }
        };

        this.initConstants(props);
    }


    initConstants(props) {
        this.texts = {
            selectedRoles: 'בחר תפקידים נבחרים בלבד',
            selectedRolesTitle: 'מלבד ראש אשכול'
        };

        this.initialNeigborhood = {id: null, name: ''};

        this.invalidColor = '#cc0000';
        if (props.userFilteredCities.length > 0) {
            this.state.combos.cities = props.userFilteredCities;
        }
    }

    componentWillReceiveProps(nextProps) {
        if ( this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0 ) {
            let combos = this.state.combos;

            combos.cities = nextProps.userFilteredCities;
            this.setState({combos});
        }

        if ( this.props.electionRoles.length == 0 && nextProps.electionRoles.length > 0 ) {
            let searchFields = this.state.searchFields;

            searchFields.selected_roles = nextProps.electionRoles;
            this.setState({searchFields});
        }

        if ( this.props.clusters.length == 0 && nextProps.clusters.length > 0 ) {
            let combos = this.state.combos;

            combos.clusters = nextProps.clusters;
            this.setState({combos});
        }

        if ( !this.props.loadeLeader && nextProps.loadeLeader ) {
            let searchFields = {...this.state.searchFields};
            searchFields.cluster_leader = { ...searchFields.cluster_leader };

            searchFields.cluster_leader.first_name = nextProps.searchFields.first_name || '';
            searchFields.cluster_leader.last_name = nextProps.searchFields.last_name || '';
            searchFields.cluster_leader.personal_identity = nextProps.searchFields.personal_identity;
            searchFields.cluster_leader.key = nextProps.searchFields.leader_key || null;

            this.setState({ searchFields })
        }
    }

    displayClusterActivistReport(event) {
        // Prevent page refresh
        event.preventDefault();

        if ( !this.validInput ) {
            return;
        }
        let searchFields = this.state.searchFields;
        let sub_area_id = searchFields.sub_area_id > 0 ? searchFields.sub_area_id : null;

        let searchFieldsObj = {
            area_id: searchFields.area_id,
            sub_area_id: sub_area_id,
            city_id: searchFields.city_id,
            cluster_id: searchFields.cluster_id,
            neighborhood_id: searchFields.neighborhood.id,

            first_name: (searchFields.cluster_leader.first_name.length > 0) ? searchFields.cluster_leader.first_name : null,
            last_name: (searchFields.cluster_leader.last_name.length > 0) ? searchFields.cluster_leader.last_name : null,
            personal_identity: (searchFields.cluster_leader.personal_identity.length > 0) ? searchFields.cluster_leader.personal_identity : null
        };

        searchFieldsObj.selected_roles = [];

        for ( let roleIndex = 0; roleIndex < searchFields.selected_roles.length; roleIndex++ ) {
            searchFieldsObj.selected_roles.push(searchFields.selected_roles[roleIndex].key);
        }

        ElectionsActions.displayClusterActivistReport(this.props.dispatch, searchFieldsObj);
    }

    activistDisplayTypeChange(radioName) {
        let searchFields = this.state.searchFields;

        if ( 'all' == radioName ) {
            searchFields.activistDisplayType.all = true;
            searchFields.activistDisplayType.selected = false;

            searchFields.selected_roles = this.props.electionRoles;
        } else {
            searchFields.activistDisplayType.all = false;
            searchFields.activistDisplayType.selected = true;
        }

        this.setState({searchFields});
    }

    /**
     * This function updates the cluster
     * leader fields according to the leader
     * found in Modal Search Leader.
     *
     * @param selectedLeader
     */
    editLeader(selectedLeader) {
        let searchFields = this.state.searchFields;
        let modalSearchLeader = this.state.modalSearchLeader;

        searchFields.cluster_leader = {
            key: selectedLeader.key,
            first_name: selectedLeader.first_name,
            last_name: selectedLeader.last_name,
            personal_identity: selectedLeader.personal_identity
        };

        modalSearchLeader.show = false;

        this.setState({searchFields, modalSearchLeader});
    }

    hideSearchModal() {
        let modalSearchLeader = this.state.modalSearchLeader;

        modalSearchLeader.show = false;
        this.setState({modalSearchLeader});
    }

    showSearchModal() {
        let modalSearchLeader = this.state.modalSearchLeader;

        modalSearchLeader.show = true;
        this.setState({modalSearchLeader});
    }

    leaderInputFieldChange(fieldName, event) {
        let searchFields = this.state.searchFields;

        searchFields.cluster_leader = { ...searchFields.cluster_leader};

        searchFields.cluster_leader[fieldName] = event.target.value;
        this.setState({searchFields});
    }

    /*Handle key press "enter" at leader identity field - to check leader identity */
    onLeaderKeyPress(event) {
        let personal_identity = this.state.searchFields.cluster_leader.personal_identity;

        if (event.charCode == 13 && personal_identity != '') { /*if user pressed enter*/
            ElectionsActions.searchLeadersForClusterActivity(this.props.dispatch, personal_identity);
        }
    }

    electionRolesChange(event) {
        let selectedItems = event.target.selectedItems;

        let searchFields = this.state.searchFields;

        searchFields.selected_roles = selectedItems;
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
            searchFields.neighborhood = this.initialNeigborhood;
        }

        this.setState({searchFields});
    }

    clusterChange(event) {
        let clusterName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        searchFields.cluster_name = clusterName;

        if ( null == selectedItem ) {
            searchFields.cluster_id = null;
        } else {
            searchFields.cluster_id = selectedItem.id;

            let clusterLeader = searchFields.cluster_leader;

            if ( selectedItem.leader_key != null ) {
                clusterLeader.key = selectedItem.leader_key;
                clusterLeader.first_name = selectedItem.leader_first_name;
                clusterLeader.last_name = selectedItem.leader_last_name;
                clusterLeader.personal_identity = selectedItem.leader_personal_identity;
            } else {
                clusterLeader.key = null;
                clusterLeader.first_name = '';
                clusterLeader.last_name = '';
                clusterLeader.personal_identity = '';
            }

            searchFields.cluster_leader = clusterLeader;

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
            searchFields.neighborhood = this.initialNeigborhood;

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

    loadCityAreaAndSubArea(citySelctedItem) {
        if (this.props.userFilteredAreas.length == 0) {return;}
        let searchFields = this.state.searchFields;

        let areaId = citySelctedItem.area_id;
        searchFields.area_id = areaId;
        searchFields.area_name = '';

        let subAreaId = citySelctedItem.sub_area_id;
        searchFields.sub_area_id = subAreaId;
        searchFields.sub_area_name = '';

        let areaIndex = this.props.userFilteredAreas.findIndex(item => item.id == areaId);
        if (areaIndex != -1) { searchFields.area_name = this.props.userFilteredAreas[areaIndex].name; }

        if ( subAreaId != null ) {
            let subAreaIndex = this.props.userFilteredSubAreas.findIndex(item => item.id == subAreaId);
            if(subAreaIndex != -1){
                searchFields.sub_area_name = this.props.userFilteredSubAreas[subAreaIndex].name;
            }
        } 

        this.setState({searchFields});
    }

    cityChange(event) {
        let cityName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;

        searchFields.city_name = cityName;

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.neighborhood = this.initialNeigborhood;

        if ( null == selectedItem ) {
            searchFields.city_id = null;

            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_CLUSTERS});
            this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_NEIGHBORHOODS});
        } else {
            searchFields.city_id = selectedItem.id;

            this.loadCityAreaAndSubArea(selectedItem);

            ElectionsActions.loadCityClustersForClusterActivity(this.props.dispatch, selectedItem.key);
            ElectionsActions.loadCityNeighborhoodsForClusterActivity(this.props.dispatch, selectedItem.key,false);
        }

        this.setState({searchFields});
    }

    loadSubAreaCities(subAreaId) {
        let cities = this.props.userFilteredCities.filter(cityItem => cityItem.sub_area_id == subAreaId);
        let combos = this.state.combos;

        combos.cities = cities;
        this.setState({combos});
    }

    subAreaChange(event) {
        let subAreaName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let subAreaId = null;

        searchFields.sub_area_name = subAreaName;

        if ( null == selectedItem ) {
            subAreaId = null;
            searchFields.sub_area_id = null;
        } else {
            subAreaId = selectedItem.id;
            searchFields.sub_area_id = selectedItem.id;
        }

        searchFields.city_id = null;
        searchFields.city_name = '';

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.neighborhood = this.initialNeigborhood;

        this.setState({searchFields});

        if ( null == subAreaId ) {
            let combos = this.state.combos;
            combos.cities = [];
            this.setState({combos});
        } else {
            this.loadSubAreaCities(subAreaId);
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_NEIGHBORHOODS});
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
        let areaName = event.target.value;
        let selectedItem = event.target.selectedItem;
        let searchFields = this.state.searchFields;
        let areaId = null;

        searchFields.area_name = areaName;

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

        searchFields.cluster_id = null;
        searchFields.cluster_name = '';

        searchFields.neighborhood = {...this.initialNeigborhood};

        this.setState({searchFields});

        if ( null == areaId ) {
            let combos = this.state.combos;
            combos.subAreas = [];
            this.setState({combos});

            this.loadAllCities();
        } else {
            this.loadSubAreas(areaId);
            this.loadAreaCities(areaId);
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_CLUSTERS});
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_NEIGHBORHOODS});
    }

    resetAllData(){
        this.props.dispatch({type: ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_ALL_DATA});

        let searchFields = {
            area_id: null,
            area_name: '',

            sub_area_id: null,
            sub_area_name: '',

            city_id: null,
            city_name: '',

            cluster_id: null,
            cluster_name: '',

            neighborhood: {id: null, name: ''},

            selected_roles: [],

            cluster_leader: {
                key: null,
                first_name: '',
                last_name: '',
                personal_identity: ''
            },

            activistDisplayType: {
                all: true,
                selected: false
            }
        };

        this.setState({searchFields});
    }

    validatePersonalIdentity() {
        var regPersonalIdentity = /^[0-9]{2,10}$/;

        if ( this.state.searchFields.cluster_leader.personal_identity.length == 0 ) {
            return true;
        } else {
            return regPersonalIdentity.test(this.state.searchFields.cluster_leader.personal_identity);
        }
    }

    validateElectionRole() {
        return ( this.state.searchFields.selected_roles.length > 0 );
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

        if ( !this.validateElectionRole() ) {
            this.validInput = false;
            this.electionRoleInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateCity() ) {
            this.validInput = false;
            this.cityInputStyle = {borderColor: this.invalidColor};
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

        if ( this.state.searchFields.city_id == null && this.state.searchFields.cluster_leader.key == null ) {
            this.validInput = false;
            this.cityInputStyle = {borderColor: this.invalidColor};
            this.personalIdentityInputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.areaInputStyle = {};
        this.subAreaInputStyle = {};
        this.cityInputStyle = {};
        this.neighborhoodInputStyle = {};
        this.clusterInputStyle = {};
        this.electionRoleInputStyle = {};
        this.personalIdentityInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return (
            <div className="bg-container">
                    <div className="row srchPanelLabel rsltsTitleRow">
                        <div className="col-md-5ths">
                            <div className="form-group">
                                <label htmlFor="cluster-activist-report-area" className="control-label">אזור</label>
                                <Combo id="cluster-activist-report-area"
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
                                <label htmlFor="cluster-activist-report-sub-area" className="control-label">תת אזור</label>
                                <Combo id="cluster-activist-report-sub-area"
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
                                <label htmlFor="cluster-activist-report-city" className="control-label">עיר</label>
                                <Combo id="cluster-activist-report-city"
                                       items={this.state.combos.cities}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       maxDisplayItems={10}
                                       inputStyle={this.cityInputStyle}
                                       value={this.state.searchFields.city_name}
                                       className="form-combo-table"
                                       onChange={this.cityChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-md-5ths">
                            <div className="form-group">
                                <label htmlFor="cluster-activist-report-neighborhood" className="control-label">איזורים מיוחדים</label>
                                <Combo id="cluster-activist-report-neighborhood"
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
                        <div className="col-md-5ths">
                            <div className="form-group">
                                <label htmlFor="cluster-activist-report-cluster" className="control-label">אשכול</label>
                                <Combo id="cluster-activist-report-cluster"
                                       items={this.state.combos.clusters}
                                       itemIdProperty="id"
                                       itemDisplayProperty="cluster_name"
                                       maxDisplayItems={10}
                                       inputStyle={this.clusterInputStyle}
                                       value={this.state.searchFields.cluster_name}
                                       className="form-combo-table"
                                       onChange={this.clusterChange.bind(this)}/>
                            </div>
                        </div>
                        <div className="col-md-5ths">
                            <div className="form-group">
                                <label htmlFor="cluster-activist-report-leader-first-name" className="control-label">שם פרטי ראש אשכול</label>
                                <input type="text" className="form-control" id="cluster-activist-report-leader-first-name"
                                       value={this.state.searchFields.cluster_leader.first_name}
                                       onChange={this.leaderInputFieldChange.bind(this, 'first_name')}/>
                            </div>
                        </div>
                        <div className="col-md-5ths">
                            <div className="form-group">
                                <label htmlFor="cluster-activist-report-leader-last-name" className="control-label">שם משפחה ראש אשכול</label>
                                <input type="text" className="form-control" id="cluster-activist-report-leader-last-name"
                                       value={this.state.searchFields.cluster_leader.last_name}
                                       onChange={this.leaderInputFieldChange.bind(this, 'last_name')}/>
                            </div>
                        </div>
                        <div className="col-md-5ths">
                            <div className="form-group">
                                <label htmlFor="cluster-activist-report-leader-personal-identity" className="control-label">ת.ז ראש אשכול</label>
                                <div className="input-search-box">
                                    <input id="cluster-activist-report-leader-personal-identity" type="text" className="form-control"
                                           style={this.personalIdentityInputStyle}
                                           value={this.state.searchFields.cluster_leader.personal_identity}
                                           onKeyPress={this.onLeaderKeyPress.bind(this)}
                                           onChange={this.leaderInputFieldChange.bind(this, 'personal_identity')}/>
                                        <a className="search-icon blue" title="חפש" href="#Search-fifty-minister2"
                                           data-toggle="modal" onClick={this.showSearchModal.bind(this)}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-40-percent" style={this.props.notFoundClusterLeader ? {marginTop:'30px'} : { display: 'none' }}>
                            <div className="form-group">
                                <span className="text-danger">לא קיים ראש אשכול במערכת הבחירות הנוכחית עם מס' ת.ז תואם  </span>
                            </div>
                        </div>
                    </div>
                    <div className="row srchPanelLabel">
                        <div className="col-40-percent">
                            <div className="flexed flexed-space-between">
                                <label className="control-label">סוגי פעילים להצגה</label>
                                <input type="radio" name="RadioOptions" id="Radio1" value="option1"
                                       checked={this.state.searchFields.activistDisplayType.all}
                                       onChange={this.activistDisplayTypeChange.bind(this, 'all')}/>הצג הכל
                                <input type="radio" name="RadioOptions" id="Radio2" value="option2"
                                       checked={this.state.searchFields.activistDisplayType.selected}
                                       onChange={this.activistDisplayTypeChange.bind(this, 'selected')}/>
                                       <span> {this.texts.selectedRoles} ({this.texts.selectedRolesTitle}) </span>
                            </div>
                        </div>
                        <div className="col-md-5ths">
                            <Combo id="cluster-activist-report-election-role"
                                   items={this.props.electionRoles}
                                   itemIdProperty="id"
                                   itemDisplayProperty="name"
                                   maxDisplayItems={10}
                                   inputStyle={this.electionRoleInputStyle}
                                   className="form-combo-table"
                                   multiSelect={true}
                                   disabled={this.state.searchFields.activistDisplayType.all}
                                   selectedItems={this.state.searchFields.selected_roles}
                                   onChange={this.electionRolesChange.bind(this)}/>
                        </div>
  
                        <div className="col-40-percent text-left">
                        <button type="button" className="btn btn-warning srchBtn"
                                onClick={this.resetAllData.bind(this)}>נקה הכל</button>

                        <button type="button" className="btn btn-default srchBtn"
                                style={{marginRight:'10px'}}
                                onClick={this.displayClusterActivistReport.bind(this)}
                                disabled={!this.validInput}>הצג</button>
                    </div>
                    </div>

                <ModalSearchClusterLeader show={this.state.modalSearchLeader.show} hideSearchModal={this.hideSearchModal.bind(this)}
                                          editLeader={this.editLeader.bind(this)}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFilteredAreas: state.system.currentUserGeographicalFilteredLists.areas,
        userFilteredSubAreas: state.system.currentUserGeographicalFilteredLists.sub_areas,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,

        electionRoles: state.elections.clustersScreen.combos.electionRoles,
        neighborhoods: state.elections.clustersScreen.combos.neighborhoods,
        clusters: state.elections.clustersScreen.combos.clusters,
        searchFields: state.elections.clustersScreen.searchFields,
        notFoundClusterLeader: state.elections.clustersScreen.notFoundClusterLeader,

        loadingData: state.elections.clustersScreen.loadingData,
        loadeLeader: state.elections.clustersScreen.loadeLeader
    }
}

export default connect(mapStateToProps) (ClusterActivistSearch);