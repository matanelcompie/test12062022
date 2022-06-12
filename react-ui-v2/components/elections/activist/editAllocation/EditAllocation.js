import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { bindActionCreators } from 'redux';

import constants from 'libs/constants';
import { isMobilePhone, arraySort,findElementByAttr } from 'libs/globalFunctions';

import RolesTabs from "./RolesTabs";
import AllocationTabs from './AllocationTabs';

// Tab components
import BankDetails from './BankDetails';
import AllocationDetails from './AllocationDetails/AllocationDetails';
import HouseholdAllocation from './HouseholdAllocation/HouseholdAllocation';
import AllocatedHouseholds from './AllocatedHouseholds/AllocatedHouseholds';
import ClusterAllocation from './ClusterAllocation/ClusterAllocation';
import BallotAllocation from './BallotAllocation/BallotAllocation';
import DriverClusterAllocation from './DriverClusterAllocation/DriverClusterAllocation';
import ActivistRolesPaymentDetails from './PaymentDetails/ActivistRolesPaymentDetails.jsx';


// import ModalAddAllocation from '../ModalAddAllocation/ModalAddAllocation';
import ModalUpdateAllocationError from '../ModalUpdateAllocationError';
import LoadingTable from '../../../global/LoadingTable/LoadingTable';
import store from 'store';

// Actions
import * as ElectionsActions from '../../../../actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import * as voterFilterActions from 'actions/VoterFilterActions';
import * as voterActions from 'actions/VoterActions';


class EditAllocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTabRoleId: null,
            currentTabRoleSystemName: null,

            // Hash array that contains
            // all the activist's roles
            activistsRolesHash: [],
            userFilteredCitiesHash: {},

            addAllocationPhones: [],

            allocationTabs: {},

            currentAllocationTab: null,

            roleAllocationTabs: {},

            roleClustersHash: {},

            roleShiftsHash: {},

            geoPermissionsByRoles: {},
            loadedActivistDetails: false,
            loadedUserFilteredCities: false,
            loadedGeoStats: false
        };

        this.renderCaptainComponent = this.renderCaptainComponent.bind(this);

        this.initConstants();
    }

    initConstants() {
        this.activistAllocationsTabs = constants.activists.allocationsTabs;
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;

        this.tabTitles = {
            allocationDetails: 'פרטי שיבוץ',
            householdAllocation: 'שיוך בתי אב',
            allocatedHouseholds: 'בתי אב משוייכים',
            paymentsDetails:'פירוט תשלומים'
        };
    }
    makeUserFilteredCitiesHash(userFilteredCities){
        let userFilteredCitiesHash = {};
		 
        userFilteredCities.forEach(function (city) {
            userFilteredCitiesHash[city.id] = city;
        });
        this.setState({
                userFilteredCitiesHash,
                loadedUserFilteredCities: true
            });
    }
    componentWillMount() {
        store.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.CLEAN_SCREEN});
        store.dispatch({type: SystemActions.ActionTypes.CLEAN_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS});

        SystemActions.loadUserGeographicFilteredLists(store, 'elections.activists');
        ElectionsActions.loadElectionRoles(store.dispatch);
        ElectionsActions.loadElectionRolesShifts(store.dispatch);
        ElectionsActions.loadBallotBoxRoles(store.dispatch);
        // ElectionsActions.loadCurrentElectionRolesCampaignBudget(store.dispatch);

        voterActions.getAllElectionCampaigns(store.dispatch);

        this.initAllocationTabs();

        this.setState({currentAllocationTab: this.activistAllocationsTabs.allocationDetails});

        if ( this.props.currentUser.first_name.length > 0 ) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists'] != true) {
                this.props.router.push('/unauthorized');
            } else {
                this.initRoleAllocationTabs(this.props.currentUser);
            }
        }
        let activistKey = this.props.router.params.activistKey;
        let roleKey = this.props.router.params.roleKey;
        
        if(activistKey !=undefined){
            this.getRoleDetailsActivist(activistKey,roleKey);
        }
        this.props.voterFilterActions.loadElectionCampaigns();
        this.props.voterFilterActions.loadCurrentElectionCampaign();
        this.props.voterFilterActions.getVoterFilterDefinitions('captain50_activist');
    }

 
    getRoleDetailsActivist(activistKey,roleKey){
        let that=this;
        let currentCampaignKey=this.props.currentCampaign.key;
        if(roleKey){
            ElectionsActions.getRoleVoterByKey(roleKey).then(function(roleVoter){
                currentCampaignKey=roleVoter.election_campaign_key;
                ElectionsActions.getVoterActivistRolesByElectionCampaign(store.dispatch, that.props.router,activistKey,currentCampaignKey);
            })  
        }
        else
        {
            ElectionsActions.getVoterActivistRolesByElectionCampaign(store.dispatch, this.props.router, activistKey,currentCampaignKey);
        }
    }



    componentWillReceiveProps(nextProps) {
		
        var activistKey = this.props.routeParams.activistKey;
        var nextActivistKey = nextProps.routeParams.activistKey;
        var roleKey = nextProps.routeParams.roleKey;

        if (activistKey != nextActivistKey && nextActivistKey != undefined) {
            
            this.getRoleDetailsActivist(nextActivistKey,roleKey);
            //ElectionsActions.getVoterActivistRoles(store.dispatch, this.props.router, nextActivistKey);
        }

        if ( 0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['elections.activists'] != true) {
                this.props.router.push('/unauthorized');
            } else {
                this.initRoleAllocationTabs(nextProps.currentUser);
            }
        }

        if (!this.props.loadedActivist && nextProps.loadedActivist  ) {
            this.initRolesHash(nextProps);
            this.setState({currentAllocationTab: this.activistAllocationsTabs.allocationDetails});

            let browserTitle = 'שיבוץ פעיל ';
            browserTitle += nextProps.activistDetails.first_name + ' ' + nextProps.activistDetails.last_name;
            browserTitle += ' ' + nextProps.activistDetails.personal_identity;

            store.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: browserTitle});
            store.dispatch({type: SystemActions.ActionTypes.UPDATE_BREADCRUMBS, title: browserTitle});
        }
        let nextElectionRolesByVoter = nextProps.activistDetails.election_roles_by_voter;
        let currentElectionRolesByVoter = this.props.activistDetails.election_roles_by_voter;
        if (nextElectionRolesByVoter && currentElectionRolesByVoter && (nextElectionRolesByVoter.length != currentElectionRolesByVoter.length) && nextElectionRolesByVoter[nextElectionRolesByVoter.length-1] && nextElectionRolesByVoter[nextElectionRolesByVoter.length-1].system_name) {
            let lastVoterDetails = nextElectionRolesByVoter[nextElectionRolesByVoter.length-1];
            this.state.currentTabRoleSystemName=lastVoterDetails.system_name;
            this.state.currentTabRoleId=lastVoterDetails.election_roles_by_voter;
            // this.setState({currentTabRoleSystemName: lastVoterDetails.system_name, currentTabRoleId : lastVoterDetails.election_roles_by_voter });
            this.initRolesHash(nextProps);
        }
        if (!this.props.editRoleFlag && nextProps.editRoleFlag) {
            this.initRolesHash(nextProps);
        }

        if (!this.props.editDriverClusterFlag && nextProps.editDriverClusterFlag) {
            this.initRolesHash(nextProps);
        }

        if (!this.props.editBallotFlag && nextProps.editBallotFlag) {
            this.initRolesHash(nextProps);
        }

        if ( !this.props.editCaptainHouseholdsFlag && nextProps.editCaptainHouseholdsFlag ) {
            let activistDetails = nextProps.activistDetails;
            let roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.electionRoleSytemNames.ministerOfFifty);

            this.updateHouseHoldsCount(activistDetails.election_roles_by_voter[roleIndex].captain50_households.length);
        }

        if ( !this.props.addedAllocationFlag && nextProps.addedAllocationFlag ) {
            this.hideAddAllocationModal();
        }
        if(nextProps.activistDetails.city_key && !this.props.activistDetails.city_key){
            let cityKey= nextProps.activistDetails.city_key;
            ElectionsActions.loadElectionRolesBudget(store.dispatch, cityKey);

            ElectionsActions.loadRoleCityDefalutBudget(store.dispatch, cityKey);
        }
        if (this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0) {
            this.makeUserFilteredCitiesHash(nextProps.userFilteredCities);
        }

        if (this.props.activistDetails != nextProps.activistDetails) {
            this.setState({
                loadedActivistDetails: true
            });
        }
    }

    initAllocationTabs() {
        let allocationTabs = {};

        allocationTabs[this.activistAllocationsTabs.allocationDetails] = {name: this.activistAllocationsTabs.allocationDetails,
                                                                          title: this.tabTitles.allocationDetails};

        allocationTabs[this.activistAllocationsTabs.householdAllocation] = {name: this.activistAllocationsTabs.householdAllocation,
                                                                            title: this.tabTitles.householdAllocation};

        allocationTabs[this.activistAllocationsTabs.allocatedHouseholds] = {name: this.activistAllocationsTabs.allocatedHouseholds,
                                                                            title: this.tabTitles.allocatedHouseholds};

        allocationTabs[this.activistAllocationsTabs.clusterAllocation] = {name: this.activistAllocationsTabs.clusterAllocation,
                                                                          title: 'שיבוץ אשכול'};

        allocationTabs[this.activistAllocationsTabs.ballotAllocation] = {name: this.activistAllocationsTabs.ballotAllocation,
                                                                         title: 'שיבוץ קלפי'};

        allocationTabs[this.activistAllocationsTabs.driverClusterAllocation] = {name: this.activistAllocationsTabs.driverClusterAllocation,
                                                                                title: 'שיבוץ אשכול'};
        allocationTabs[this.activistAllocationsTabs.paymentsDetails] = {name: this.activistAllocationsTabs.allocationDetails,
                                                                                title: 'פירוט תשלומים'};                                                                        

        this.setState({allocationTabs});
    }

    updateHouseHoldsCount(householdsNumber){
        let allocationTabs = this.state.allocationTabs;
        let householdAllocationTab = {...allocationTabs[this.activistAllocationsTabs.allocatedHouseholds]};

        if (householdsNumber > 0) {
            householdAllocationTab.title = <span>{this.tabTitles.allocatedHouseholds}&nbsp;<span dangerouslySetInnerHTML={{__html: householdsNumber}} className="badge"></span></span>;
        } else {
            householdAllocationTab.title = this.tabTitles.allocatedHouseholds;
        }

        allocationTabs[this.activistAllocationsTabs.allocatedHouseholds] = householdAllocationTab;
        this.setState({allocationTabs});
    }

    initRoleAllocationTabs(currentUser) {
        let roleAllocationTabs = {};

        if ( currentUser.admin || currentUser.permissions['elections.activists.captain_of_fifty'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.ministerOfFifty] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.householdAllocation,
                this.activistAllocationsTabs.allocatedHouseholds,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.cluster_leader'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.clusterLeader] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.clusterAllocation,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.motivator'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.motivator] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.clusterAllocation,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.driver'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.driver] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.driverClusterAllocation,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.ballot_member'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.ballotMember] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.ballotAllocation,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.observer'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.observer] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.ballotAllocation,
            ];
        }
        if ( currentUser.admin || currentUser.permissions['elections.activists.counter'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.counter] = [
                this.activistAllocationsTabs.allocationDetails,
                this.activistAllocationsTabs.ballotAllocation,
            ];
        }
        if ( currentUser.admin || currentUser.permissions['elections.activists.general_election_worker'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.electionGeneralWorker] = [
                this.activistAllocationsTabs.allocationDetails,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.general_election_worker'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.electionGeneralWorker] = [
                this.activistAllocationsTabs.allocationDetails,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.quarter_director'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.quarterDirector] = [
                this.activistAllocationsTabs.allocationDetails,
            ];
        }

        if ( currentUser.admin || currentUser.permissions['elections.activists.optimization_data_coordinator'] == true ) {
            roleAllocationTabs[this.electionRoleSytemNames.optimizerCoordinator] = [
                this.activistAllocationsTabs.allocationDetails,
            ];
        }
        if(currentUser.admin){
            for (const roleTab in roleAllocationTabs) {
                roleAllocationTabs[roleTab].push( this.activistAllocationsTabs.paymentsDetails) 
              }
        }

        this.setState({roleAllocationTabs});
    }

    loadRoleGeoClustersHash(roleItem) {
        let roleClustersHash = {};
        let clusterId = null;
        let hashKey = null;

        for ( let geoIndex = 0; geoIndex < roleItem.activists_allocations_assignments.length; geoIndex++ ) {
            clusterId = roleItem.activists_allocations_assignments[geoIndex].entity_id;

            hashKey = 'cluster_' + clusterId;

            roleClustersHash[hashKey] = 1;
        }

        this.setState({roleClustersHash});
    }

    loadClusterLeaderRolesHash(roleItem) {
        let roleClustersHash = {};
        let clusterId = null;
        let hashKey = null;

        for (let clusterIndex = 0; clusterIndex < roleItem.activists_allocations_assignments.length; clusterIndex++ ) {
            clusterId = roleItem.activists_allocations_assignments[clusterIndex].id;

            hashKey = 'cluster_' + clusterId;

            roleClustersHash[hashKey] = 1;
        }

        this.setState({roleClustersHash});
    }

    loadRoleClustersHash(roleSystemName, roleItem) {
        switch ( roleSystemName ) {
            case this.electionRoleSytemNames.motivator:
            case this.electionRoleSytemNames.driver:
                this.loadRoleGeoClustersHash(roleItem);
                break;

            case this.electionRoleSytemNames.clusterLeader:
                this.loadClusterLeaderRolesHash(roleItem);
                break;
        }
    }

    loadRoleShifts(roleItem) {
        let roleShiftsHash = this.state.roleShiftsHash;

        for ( let geoIndex = 0; geoIndex < roleItem.activists_allocations_assignments.length; geoIndex++ ) {
            let election_role_shift_system_name = roleItem.activists_allocations_assignments[geoIndex].election_role_shift_system_name;

            roleShiftsHash[election_role_shift_system_name] = {
                ballotBoxKey: roleItem.activists_allocations_assignments[geoIndex].ballot_box_key,
                ballotBoxMiId: roleItem.activists_allocations_assignments[geoIndex].mi_id,
                election_role_shift_name: roleItem.activists_allocations_assignments[geoIndex].election_role_shift_name
            };
        }

        if ( 0 == roleItem.activists_allocations_assignments.length ) {
            roleShiftsHash = {};
        }

        this.setState({roleShiftsHash});
    }

    initRolesHash(nextProps) {
        let newState = { ...this.state }
        let activistsRolesHash = [];

        let roleIndex = -1;
        let roleId = null;
        let roleSystemName = null;

        for ( roleIndex = 0; roleIndex < nextProps.activistDetails.election_roles_by_voter.length; roleIndex++ ) {
            roleId = nextProps.activistDetails.election_roles_by_voter[roleIndex].election_role_id;
            roleSystemName = nextProps.activistDetails.election_roles_by_voter[roleIndex].system_name;

            switch (roleSystemName) {
                case this.electionRoleSytemNames.motivator:
                case this.electionRoleSytemNames.clusterLeader:
                case  this.electionRoleSytemNames.driver:
                    this.loadRoleClustersHash(roleSystemName, nextProps.activistDetails.election_roles_by_voter[roleIndex]);
                    break;

                case this.electionRoleSytemNames.ballotMember:
                case this.electionRoleSytemNames.observer:
                case this.electionRoleSytemNames.counter:
                    this.loadRoleShifts(nextProps.activistDetails.election_roles_by_voter[roleIndex]);
                    break;
            }
			
            activistsRolesHash[roleId] = {
                election_role_id: roleId,
                election_role_name: nextProps.activistDetails.election_roles_by_voter[roleIndex].election_role_name,
                system_name: nextProps.activistDetails.election_roles_by_voter[roleIndex].system_name
            };
        }
		//activistsRolesHash = activistsRolesHash.filter(function (el) {return el != null;});
        newState.activistsRolesHash = activistsRolesHash;
        if (this.state.currentTabRoleId == null) {

            let roleKey = this.props.router.params.roleKey;

            let currentTabRoleId = nextProps.activistDetails.election_roles_by_voter[0].election_role_id;
            let currentTabRoleSystemName = nextProps.activistDetails.election_roles_by_voter[0].system_name;

            if (roleKey != undefined) {
                let currentElectionRole = nextProps.activistDetails.election_roles_by_voter.find(item => item.key == roleKey);
                if (currentElectionRole) {
                    currentTabRoleId = currentElectionRole.election_role_id;
                    currentTabRoleSystemName = currentElectionRole.system_name;
                }
            }
            newState.currentTabRoleId = currentTabRoleId;
            newState.currentTabRoleSystemName = currentTabRoleSystemName;
        }
		
        this.setState(newState);
    }

    /**
     * Set geo permissions according to election roles of activist
     *
     * @return void
     */
    setGeoPermissionsByRoles() {
        let geoPermissionsByRoles =  this.checkUserGeoPermissionForRoles(this.props.activistDetails.election_roles_by_voter);
        this.setState({
            geoPermissionsByRoles,
            loadedGeoStats:true
        });
    }

    checkUserGeoPermissionForRoles(election_roles_by_voter){
		 
        let geoPermissionsByRoles = {};
        let userFilteredCitiesHash = this.state.userFilteredCitiesHash;
        election_roles_by_voter.forEach(function (roleData) {
            let canEdit = userFilteredCitiesHash[roleData.assigned_city_id] ? true : false;
            geoPermissionsByRoles[roleData.system_name] = canEdit;
        });
	 
        return geoPermissionsByRoles;
    }

    showAddAllocationModal() {
        this.setVotersPhones();
        store.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.SHOW_ADD_ALLOCATION_MODAL});
    }
    setVotersPhones(){
        let addAllocationPhones = [];

        for ( let phoneIndex = 0; phoneIndex < this.props.activistDetails.voter_phones.length; phoneIndex++ ) {
            let phoneToCheck = this.props.activistDetails.voter_phones[phoneIndex].phone_number.split('-').join('');

            if ( isMobilePhone(phoneToCheck) ) {
                addAllocationPhones.push(
                    {
                        id: this.props.activistDetails.voter_phones[phoneIndex].id,
                        key: this.props.activistDetails.voter_phones[phoneIndex].key,
                        phone_number: this.props.activistDetails.voter_phones[phoneIndex].phone_number
                    });
            }
        }

        if ( addAllocationPhones.length > 1 ) {
            addAllocationPhones.sort(arraySort('desc','updated_at'));
        }

        this.setState({addAllocationPhones});
    }

    addAllocation(electionRoleKey, allocationObj, bindWithShift = false) {
        let voterKey = this.props.activistDetails.key;
        this.getRoleDetailsActivist(voterKey);

        // this.hideAddAllocationModal(false);
        // if(!bindWithShift){
        //     ElectionsActions.addAnotherRoleToActivist(store.dispatch, this.props.router, voterKey, electionRoleKey, allocationObj);
        // } else {
        //     const promise = ElectionsActions.bindRoleAndShiftToActivist(store.dispatch, voterKey, allocationObj, 'activists');
        //     promise.then(() => {
             //   this.getRoleDetailsActivist(voterKey);
               // ElectionsActions.getVoterActivistRoles(store.dispatch, this.props.router, voterKey);
        //     })
        // }
    }


    hideAddAllocationModal(reset = true) {
        if (reset) {
            this.setState({addAllocationPhones: []});
        }
        store.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.HIDE_ADD_ALLOCATION_MODAL});
    }

    setCurrentAllocationTab(allocationTabName) {

        this.setState({currentAllocationTab: allocationTabName});
    }

    setCurrentRoleTab(roleId) {
        let currentRole = this.props.electionRoles.find(item => item.id == roleId);
        let currentElectionRoleByVoter = this.props.activistDetails.election_roles_by_voter.find((role)=>{
            return role.system_name == currentRole.system_name;
        })
        let voterKey = this.props.activistDetails.key;
        this.props.router.push('elections/activists/' + voterKey + '/' + currentElectionRoleByVoter.key);

        this.setState({
            currentTabRoleId: roleId, currentTabRoleSystemName: currentRole.system_name,
            currentAllocationTab: this.activistAllocationsTabs.allocationDetails
        });
    }
    checkAllPermissions(permissionsList){
        let hasPermission = false;
        let currentUser = this.props.currentUser;

        if(currentUser.admin){ return true;}

        let geoPermissionsByRoles = this.state.geoPermissionsByRoles;
        permissionsList.forEach(function (permissionName) {
            let userPermission = currentUser.permissions['elections.activists.' + permissionName];
            let geoPermissions = geoPermissionsByRoles[permissionName];
            if (userPermission && geoPermissions) { hasPermission = true }
        });
        return hasPermission;
    }
    /**
     * This function checks if the activist
     * has captain of 50 role.
     * If so it mounts the component.
     *
     * @returns {boolean}
     */
    renderCaptainComponent() {
        let captain_of_fifty =  this.electionRoleSytemNames.ministerOfFifty
        if ( !this.checkAllPermissions([captain_of_fifty]) ) { return false; }

        let roleIndex = 0;

        for ( roleIndex = 0; roleIndex < this.state.activistsRolesHash.length; roleIndex++ ) {
            if ( this.state.activistsRolesHash[roleIndex] != undefined && this.state.activistsRolesHash[roleIndex] != null ) {
                if ( this.state.activistsRolesHash[roleIndex].system_name == captain_of_fifty ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * This function checks if the activist has 1 of these roles:
     * clusterLeader, motivator, driver.
     * If it does it mounts the cluster component.
     *
     * @returns {boolean}
     */
    renderClusterAllocation() {
        let motivator =  this.electionRoleSytemNames.motivator
        let cluster_leader =  this.electionRoleSytemNames.clusterLeader
        
        if ( !this.checkAllPermissions([cluster_leader, motivator]) ) { return false; }

        let roleIndex = 0;

        for ( roleIndex = 0; roleIndex < this.state.activistsRolesHash.length; roleIndex++ ) {
            if ( this.state.activistsRolesHash[roleIndex] != undefined && this.state.activistsRolesHash[roleIndex] != null ) {
                if ( this.state.activistsRolesHash[roleIndex].system_name == cluster_leader ||
                     this.state.activistsRolesHash[roleIndex].system_name == motivator
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * This function checks if the activist has
     * driver role.
     * If it does it mounts the driver cluster component.
     *
     * @returns {boolean}
     */
    renderBallotAllocation() {
        let ballot_member = this.electionRoleSytemNames.ballotMember
        let observer = this.electionRoleSytemNames.observer
        let counter = this.electionRoleSytemNames.counter
        if ( !this.checkAllPermissions([observer, ballot_member, counter]) ) { return false; }

        let roleIndex = 0;

        for ( roleIndex = 0; roleIndex < this.state.activistsRolesHash.length; roleIndex++ ) {
            if ( this.state.activistsRolesHash[roleIndex] != undefined && this.state.activistsRolesHash[roleIndex] != null ) {
                if ( this.state.activistsRolesHash[roleIndex].system_name == ballot_member ||
                    this.state.activistsRolesHash[roleIndex].system_name == observer ||
                    this.state.activistsRolesHash[roleIndex].system_name == counter 
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * This function checks if the activist has 1 of these roles:
     * ballotChairman, ballotMember.
     * If it does it mounts the ballot component.
     *
     * @returns {boolean}
     */
    renderDriverClusterAllocation() {
        if ( !this.checkAllPermissions(['driver']) ) { return false; }

        let roleIndex = 0;

        for ( roleIndex = 0; roleIndex < this.state.activistsRolesHash.length; roleIndex++ ) {
            if ( this.state.activistsRolesHash[roleIndex] != undefined && this.state.activistsRolesHash[roleIndex] != null ) {
                if ( this.state.activistsRolesHash[roleIndex].system_name == this.electionRoleSytemNames.driver ) {
                    return true;
                }
            }
        }

        return false;
    }

    initVariables() {
        let activistDetails = this.props.activistDetails;
        this.fullName = activistDetails.first_name + ' ';
        this.fullName +=  activistDetails.last_name;

        let houseName = (activistDetails.house) ? ' ' + activistDetails.house  : '';

        let streetName = '';
        if ( activistDetails.street_name != null ) {
            streetName = (activistDetails.street_name) ? activistDetails.street_name + houseName + ' ,' : '';
        } else if ( activistDetails.street != null ) {
            streetName = (activistDetails.street) ? activistDetails.street + houseName + ' ,' : '';
        }

        this.address = streetName + activistDetails.city_name;

        if ( activistDetails.election_roles_by_voter.length > 0 ) {
            this.phone_number = activistDetails.election_roles_by_voter[0].phone_number;
        }
        this.personal_identity = activistDetails.personal_identity;
        this.voter_key = activistDetails.key;
        this.email = activistDetails.email;
    }
	
	componentDidUpdate(prevProps, prevState) {

        if (this.state.loadedActivistDetails && this.state.loadedUserFilteredCities & !this.state.loadedGeoStats) {
            this.setGeoPermissionsByRoles();
        }
	}

    render() {
		
        this.initVariables();
        const electionRoleKey = this.props.router.params.roleKey;

        let hasCurrentRolePermission = this.props.currentUser.admin || this.state.geoPermissionsByRoles[this.state.currentTabRoleSystemName];
        let hasEditBankDetailsPermissions = this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.bank_details'];;

        let currentElectionRole = this.props.activistDetails.election_roles_by_voter.find((roleItem) => {
            return (roleItem.election_role_id == this.state.currentTabRoleId);
        })
        let displayAllocationRemovedMessage = false;


        if(currentElectionRole ){
            let isBallotRole =
            ( currentElectionRole.system_name == this.electionRoleSytemNames.ballotMember ||
              currentElectionRole.system_name == this.electionRoleSytemNames.observer ||
              currentElectionRole.system_name == this.electionRoleSytemNames.counter);

            if(isBallotRole && (currentElectionRole.activists_allocations_assignments.length == 0)){
                displayAllocationRemovedMessage = true;
            }
        }
		return (
           
            <div className="stripMain election-activist-edit">
                <div className="row pageHeading1">
                    <h1>שיבוץ פעיל</h1>
                </div>

                <div className="dtlsBox electorDtlsStrip clearfix">
                    <div className="row electorDtlsData assigning">
                        <div className="col-lg-3 col-md-3">
                            <div className="electorName">{this.fullName}</div>
                        </div>
                        <div className="col-lg-2 col-md-2">
                            <dl className="dl-horizontal">
                                <dt>ת"ז</dt>
                                <dd><a href={window.Laravel.baseURL + 'elections/voters/' + this.voter_key} target="_blank">{this.personal_identity}</a></dd>
                            </dl>
                        </div>
                        <div className="col-lg-3 col-md-3">
                            <dl className="dl-horizontal">
                                <dt>כתובת</dt>
                                <dd>{this.address}</dd>
                            </dl>
                        </div>
                        <div className="col-lg-2 col-md-2">
                            <dl className="dl-horizontal">
                                <dt>טלפון</dt>
                                <dd>{this.phone_number}</dd>
                            </dl>
                        </div>
                        <div className="col-lg-2 col-md-2">
                            <dl className="dl-horizontal">
                                <dt>אימייל</dt>
                                <dd>{( this.email &&  this.email != '') ? <a href={"mailto"+ this.email}>{ this.email}</a> : '-' }</dd>
                            </dl>
                        </div>
                    </div>
                    { hasEditBankDetailsPermissions && <BankDetails voterDetails={this.props.voterDetails} allCampaignsList={this.props.allCampaignsList} parent="activists"/>}
                </div>
                { !this.state.loadedActivistDetails?<div><LoadingTable></LoadingTable></div>:''}
                { this.state.loadedActivistDetails?<RolesTabs 
                    currentTabRoleId={this.state.currentTabRoleId} 
                    activistsRolesHash={this.state.activistsRolesHash}
                    geoPermissionsByRoles={this.state.geoPermissionsByRoles}
                    addAllocation={this.addAllocation.bind(this)}
                    // addedAllocationFlag={this.props.addedAllocationFlag}
                    setCurrentRoleTab={this.setCurrentRoleTab.bind(this)} currentUser={this.props.currentUser}
                    electionRoles={this.props.electionRoles} />
                 :''}

                <div className="tab-content main-tab-content">
                    <div role="tabpanel" className="tab-pane active">
                        <div className="containerTabs">
                            {( this.state.currentTabRoleSystemName != null ) &&
                                <AllocationTabs currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                currentAllocationTab={this.state.currentAllocationTab}
                                                allocationTabs={this.state.allocationTabs}
                                                roleAllocationTabs={this.state.roleAllocationTabs}
                                                displayAllocationRemovedMessage={displayAllocationRemovedMessage}
                                                setCurrentAllocationTab={this.setCurrentAllocationTab.bind(this)}/>
                            }

                            <div className="tab-content tabContnt">
                                    {( this.state.currentTabRoleSystemName != null && hasCurrentRolePermission  ) &&
                                    <AllocationDetails currentTabRoleId={this.state.currentTabRoleId}
                                                       currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                       activistsRolesHash={this.state.activistsRolesHash}
                                                       displayAllocationRemovedMessage={displayAllocationRemovedMessage}
                                                       display={this.state.currentAllocationTab == this.activistAllocationsTabs.allocationDetails}
                                                       renderCaptainComponent={this.renderCaptainComponent}/>
                                }

                                { ( this.renderCaptainComponent() ) &&
                                    <HouseholdAllocation currentTabRoleId={this.state.currentTabRoleId}
                                                         checkAllPermissions={this.checkAllPermissions}
                                                         currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                         currentAllocationTab={this.state.currentAllocationTab}
                                                         display={this.state.currentAllocationTab == this.activistAllocationsTabs.householdAllocation}/>
                                }

                                { ( this.renderCaptainComponent() ) &&
                                    <AllocatedHouseholds currentTabRoleId={this.state.currentTabRoleId}
                                                         checkAllPermissions={this.checkAllPermissions}
                                                         currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                         display={this.state.currentAllocationTab == this.activistAllocationsTabs.allocatedHouseholds}
                                                         updateHouseHoldsCount={this.updateHouseHoldsCount.bind(this)}/>
                                }

                                { ( this.renderClusterAllocation() ) &&
                                    <ClusterAllocation currentTabRoleId={this.state.currentTabRoleId}
                                                       checkAllPermissions={this.checkAllPermissions}
                                                       currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                       roleClustersHash={this.state.roleClustersHash}
                                                       currentUser={this.props.currentUser}
                                                       currentAllocationTab={this.state.currentAllocationTab}
                                                       electionRoleKey={electionRoleKey}
                                                       display={this.state.currentAllocationTab == this.activistAllocationsTabs.clusterAllocation}/>
                                }
                                { ( this.renderBallotAllocation() ) &&
                                    <BallotAllocation currentTabRoleId={this.state.currentTabRoleId}
                                                      checkAllPermissions={this.checkAllPermissions}
                                                      currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                      roleShiftsHash={this.state.roleShiftsHash} currentUser={this.props.currentUser}
                                                      currentAllocationTab={this.state.currentAllocationTab}
                                                      display={this.state.currentAllocationTab == this.activistAllocationsTabs.ballotAllocation}/>
                                }

                                { ( this.renderDriverClusterAllocation() ) &&
                                    <DriverClusterAllocation currentTabRoleId={this.state.currentTabRoleId}
                                                             checkAllPermissions={this.checkAllPermissions}
                                                             currentTabRoleSystemName={this.state.currentTabRoleSystemName}
                                                             roleClustersHash={this.state.roleClustersHash}
                                                             currentUser={this.props.currentUser}
                                                             currentAllocationTab={this.state.currentAllocationTab}
                                                             display={this.state.currentAllocationTab == this.activistAllocationsTabs.driverClusterAllocation}/>
                                }

                                 {( this.state.currentTabRoleSystemName != null && hasCurrentRolePermission  ) &&
                                 this.state.currentAllocationTab == this.activistAllocationsTabs.paymentsDetails && 
                                    <ActivistRolesPaymentDetails electionRoleVoter={currentElectionRole}
                                                       display={this.state.currentAllocationTab == this.activistAllocationsTabs.paymentsDetails}
                                                       />
                                }

                            </div>
                        </div>
                    </div>
                </div>

                {/* <ModalAddAllocation activistItem={this.props.activistDetails} 
                                    phones={this.state.addAllocationPhones}
                                    allocationCitiesList ={this.props.userFilteredCities}
                                    hideAddAllocationModal={this.hideAddAllocationModal.bind(this)}
                                    addAllocation={this.addAllocation.bind(this)}
                                    activistsRolesHash={this.state.activistsRolesHash}/> */}

                <ModalUpdateAllocationError/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        allCampaignsList : state.voters.activistScreen.campaigns ,
        currentUser: state.system.currentUser,
        currentCampaign:state.system.currentCampaign,
        dirtyComponents: state.system.dirtyComponents,
        electionRoles: state.elections.activistsScreen.electionRoles,
        activistDetails: state.elections.activistsScreen.activistDetails,
        loadedActivist: state.elections.activistsScreen.loadedActivist,
        editRoleFlag: state.elections.activistsScreen.editRoleFlag,
        editDriverClusterFlag: state.elections.activistsScreen.editDriverClusterFlag,
        editBallotFlag: state.elections.activistsScreen.editBallotFlag,
        selectedActivistsRoleId: state.elections.activistsScreen.selectedActivistsRoleId,
        editCaptainHouseholdsFlag: state.elections.activistsScreen.editCaptainHouseholdsFlag,
        addedAllocationFlag: state.elections.activistsScreen.addedAllocationFlag,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities, //For add allocation modal.
        voterDetails: state.elections.activistsScreen.activistDetails
        
    }
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps) (withRouter(EditAllocation));