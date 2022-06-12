import React from 'react';
import { connect } from 'react-redux';

import constants from '../../../../libs/constants';
import { validateEmail, validatePersonalIdentity, checkPersonalIdentity, getDefaultSendActivistMessage, formatBallotMiId } from 'libs/globalFunctions';

import Combo from 'components/global/Combo';
import ModalWindow from 'components/global/ModalWindow';
import AddAllocationPhoneItem from './AddAllocationPhoneItem';
import AddAllocationNewPhone from './AddAllocationNewPhone';
import ModalCountShiftWarning from './ModalCountShiftWarning';

import * as ElectionsActions from '../../../../actions/ElectionsActions';
import { inArray } from '../../../../libs/globalFunctions';
import { getBallotsAvailableShifts } from '../../../../libs/services/models/ballotService';


class ModalAddAllocation extends React.Component {
    constructor(props) {
        super(props);
		this.sendDays = [
            {id: 1, name: 'ראשון'},
            {id: 2, name: 'שני'},
            {id: 3, name: 'שלישי'},
            {id: 4, name: 'רביעי'},
            {id: 5, name: 'חמישי'},
            {id: 6, name: 'שישי'}
        ];
		
		this.defaultNextDayIndex = getDefaultSendActivistMessage();
        this.emptySmsSendDay = {
            id: (this.defaultNextDayIndex + 1),
            name: this.sendDays[this.defaultNextDayIndex].name
        };
        this.initState = {
            initalLoading: true,

            addFields: {
                election_role_id: null,
                election_role_name: '',
                assigned_city_key: null,
                assigned_city_id: null,
                assigned_city_name: '',

                // cluster data
                cluster_name: '',
                cluster_key: '',
                cluster_ballots: [],

                // ballot data
                ballot_mi_id: '',
                ballot_key: '',

                // Shift data
                shift_system_name: null,
                shift_label: '',

                sum: '',
                comment: '',
                email: '',

                phones: [],
                rolePhoneNumber: '',
                new_phone_number: '',

                vehicle: {
                    type: {id: null, name: ''},
                    number: '',
                    seats: 4
                },

                send_sms: 1,
                day_sending_message: { ...this.emptySmsSendDay}
            },
            ballotAvailableShifts:[],
            shift_system_name: null,
            shift_label: '',
            roleSystemName: null,

            electionRolesCombo: [],
            buttons: [],
            // For search from city view:
            voter_personal_identity: '',
            showModalCountShiftWarning: false,
            modalCountShiftAllocatedRole: '',
            modalCountShiftToAllocateRole: '',
            showShiftError: false,
        };
        this.state ={...this.initState};
        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        let driverCarTypes = constants.activists.driverCarTypes;
        this.carTypesComboList = [
            { id: driverCarTypes.regular, name: 'רכב רגיל' },
            { id: driverCarTypes.crippled, name: 'רכב הסעות מונגש' },
        ];


        this.invalidColor = '#cc0000';

        this.texts = {
            nextWeek: 'הקרוב'
        };
        this.buttonsForAdd = [
            {
                class: 'btn btn-warning',
                text: 'בטל',
                action: this.hideModal.bind(this),
                disabled: false
            },
            {
                class: 'btn btn-primary',
                text: 'שמור וחזור לרשימת פעילים',
                action: this.addAllocation.bind(this, false),
                disabled: true
            },
            {
                class: 'btn btn-success',
                text: 'המשך לשיבוץ',
                action: this.addAllocation.bind(this, true),
                disabled: true
            }
        ];
        this.buttonsForAddInCityView = [
            {
                class: 'btn btn-warning',
                text: 'בטל',
                action: this.hideModal.bind(this),
                disabled: false
            },
            {
                class: 'btn btn-success',
                text: 'שמור וסגור',
                action: this.addAllocation.bind(this),
                disabled: true
            },
        ];
        this.buttonsForEdit = [
            {
                class: 'btn btn-warning',
                text: 'בטל',
                action: this.hideModal.bind(this),
                disabled: false
            },
            {
                class: 'btn btn-success',
                text: 'שמור וחזור לרשימת פעילים',
                action: this.addAllocation.bind(this),
                disabled: true
            }
        ];
        if (this.props.addAllocationFromCityViewMode) {
            this.state.buttons = this.buttonsForAddInCityView;
            this.state.electionRolesCombo = this.props.electionRoles;
        }

        //roles that need warning if used with observer
        this.warningRoles = [
            constants.electionRoleSytemNames.motivator,
            constants.electionRoleSytemNames.clusterLeader,
            constants.electionRoleSytemNames.driver
        ];
    }

    componentWillMount() {
        this.disabledElectionRoleCombo = false;
        let addFields = { ...this.state.addFields }

        if (this.props.addAllocationFromCityViewMode && this.props.entityAllocationData.election_role_system_name) {
            let election_system_name = this.props.entityAllocationData.election_role_system_name;
            let electionRoleData = this.props.electionRoles.find(roleItem => roleItem.system_name == election_system_name);
            this.disabledElectionRoleCombo = true;


            if (this.props.allocationCitiesList.length == 1) {
                let assignedCity = this.props.allocationCitiesList[0];
                addFields.assigned_city_id = assignedCity.id;
                addFields.assigned_city_key = assignedCity.key;
                addFields.assigned_city_name = assignedCity.name;
            }
            // Define system name

            this.electionRoleChange(addFields,electionRoleData, electionRoleData.name);

            this.validateVariablesForButtons(addFields);
            this.setState({ addFields });

            let shift_system_name = this.props.entityAllocationData.shift_name;
            if (shift_system_name) {
                let shift_label = this.getBallotShiftLabel(shift_system_name)
                this.setState({ shift_system_name, shift_label })
            }
        } else {
            // If modal has only single city to select
            if (this.props.allocationCitiesList.length == 1) {
                let assignedCity = this.props.allocationCitiesList[0];
                addFields.assigned_city_id = assignedCity.id;
                addFields.assigned_city_key = assignedCity.key;
                addFields.assigned_city_name = assignedCity.name;
                this.setState({addFields })
            }
        }
    }
    

    componentWillReceiveProps(nextProps) {
        let addFields = {...this.state.addFields};
        let currentViewButtons;

        if (!this.props.addAllocationFromCityViewMode) {  // Manage Activists screen:
            if (!this.props.showAddAllocationModal && nextProps.showAddAllocationModal && this.state.initalLoading) {
                this.setContactData(nextProps, addFields)

                if (nextProps.activistsRolesHash == undefined) {
                    // Activist doesn't have any role.
                    this.loadElectionRolesCombo(nextProps.electionRoles, nextProps.currentUser);
                    currentViewButtons = this.buttonsForAdd;
                } else {
                    // Activist has at least 1 role.
                    this.loadNonAllocatedElectionRolesCombo(nextProps.electionRoles,
                                                            nextProps.activistsRolesHash,
                                                            nextProps.activistItem.election_roles_by_voter,
                                                            nextProps.currentUser);
                    currentViewButtons = this.buttonsForEdit;
                }

                this.setState({ addFields, initalLoading: false, buttons: currentViewButtons });
            }

            if (!this.props.addedAllocationFlag && nextProps.addedAllocationFlag) {
                this.resetState();
            }
        } else { // Manage city view:
            if (this.props.activistItem.id != nextProps.activistItem.id) {
                let newState = {};
                this.setContactData(nextProps, addFields);
                if (nextProps.activistItem.id) newState = {...this.checkObserverCountShift(nextProps.activistItem)};
                this.validateVariablesForButtons(addFields, newState.showShiftError);
                newState.addFields = addFields;
                this.setState(newState);
            }
        }

    }

    /**
     * Check if activist has roles that collide with observer for count shift
     *
     * @param object activist
     * @return object
     */
    checkObserverCountShift(activist) {
        let electionRoleSystemName = this.state.roleSystemName;
        let electionRoleName = this.state.addFields.election_role_name;
        let shiftSystemName = this.props.entityAllocationData.shift_name;
        let newState = {
            showShiftError: false
        };
        //if selected election role is observer, check if activist has collide roles
        if (electionRoleSystemName == constants.electionRoleSytemNames.observer) {
            for (let i=0; i<activist.election_roles_by_voter.length; i++) {
                let currentRole = activist.election_roles_by_voter[i];
                if (this.warningRoles.includes(currentRole.election_role_system_name)) {
                    //if selected shift is count show warning
                    if (shiftSystemName == constants.activists.roleShiftsSytemNames.count) {
                        newState.showModalCountShiftWarning = true;
                        newState.modalCountShiftAllocatedRole = currentRole.election_role_name;
                        newState.modalCountShiftToAllocateRole = electionRoleName;
                    //if selected shift is not count don't allow to proceed
                    } else {
                        newState.showShiftError = true;
                    }
                    break;
                }
            }
        }
        return newState;
    }

    setContactData(nextProps, addFields){
        let email = nextProps.activistItem.email != null ? nextProps.activistItem.email : '';

        addFields.email = email;
        addFields.phones = nextProps.phones;
        if ( nextProps.activistItem.election_roles_by_voter && nextProps.activistItem.election_roles_by_voter.length > 0) {
            addFields.rolePhoneNumber = nextProps.activistItem.election_roles_by_voter[0].phone_number;
        }
        else if ( nextProps.phones.length > 0) {
            addFields.rolePhoneNumber = nextProps.phones[0].phone_number;
        }

    }
    /**
     * This function checks if the current user has a
     * permission to add a role.
     *
     * @param electionRoleSystemName
     * @param currentUser
     * @returns {boolean}
     */
    checkAddRolePermission(electionRoleSystemName, currentUser) {
        let addPermission = 'elections.activists.' + electionRoleSystemName + '.add';

        return (this.props.currentUser.admin) || (currentUser.permissions[addPermission] == true);
    }

    /**
     * This function builds the election
     * roles combo for an activist who doesn't
     * have a role allocated to him, and which
     * the current use has permissions to add
     * them.
     *
     */
    loadElectionRolesCombo(electionRoles, currentUser) {
        let electionRolesCombo = [];

        for ( let roleIndex = 0; roleIndex < electionRoles.length; roleIndex++ ) {
            let electionRoleSystemName = electionRoles[roleIndex].system_name;

            if ( this.checkAddRolePermission(electionRoleSystemName, currentUser) ) {
                electionRolesCombo.push(electionRoles[roleIndex]);
            }
        }

        this.setState({electionRolesCombo});
    }

    /**
     * This function builds the election roles
     * combo from roles which are not allocated to
     * the activist, and the current user has permissions
     * to add them.
     *
     * @param electionRoles
     * @param activistsRolesHash
     */
    loadNonAllocatedElectionRolesCombo(electionRoles,
                                        activistsRolesHash,
                                        activistRoles,
                                        currentUser) {

        let that = this;

        //find if activist is observer with count shift
        let canBeMoreThanCountObserver = true;
        for (let i = 0; i < activistRoles.length; i++) {
            let currentRole = activistRoles[i];
            if (currentRole.system_name == constants.electionRoleSytemNames.observer) {
                for (let j=0; j<currentRole.activists_allocations_assignments.length; j++) {
                    let geo = currentRole.activists_allocations_assignments[j];
                    if (geo.election_role_shift_system_name != constants.activists.roleShiftsSytemNames.count) {
                        canBeMoreThanCountObserver = false;
                        break;
                    }
                }
                if(!canBeMoreThanCountObserver){ break; }
            }
        }

        //create election roles list
        let multipleElectionRoles = constants.multipleElectionRoles;
        let muniElectionsRoles = constants.muniElectionsRoles;
        let availableRoles = {};
        electionRoles.forEach(electionRole => {
            if (canBeMoreThanCountObserver || !that.warningRoles.includes(electionRole.system_name)) {
                availableRoles[electionRole.system_name] = true;
            }
        });
        activistsRolesHash.forEach(roleData => {    
            if(muniElectionsRoles.includes(roleData.system_name) || roleData.system_name == constants.electionRoleSytemNames.quarterDirector) {return}

            let multipleRoles = multipleElectionRoles[roleData.system_name];
            for (let role in availableRoles) {
                if (!multipleRoles.hasOwnProperty(role)) delete availableRoles[role];
            }

        });
        muniElectionsRoles.forEach((role) =>{
            availableRoles[role] = true;
        })
        let electionRolesCombo = electionRoles.filter(electionRole => {
            return availableRoles.hasOwnProperty(electionRole.system_name) && 
                    that.checkAddRolePermission(electionRole.system_name, currentUser);
        });


        this.setState({electionRolesCombo});
    }
    setRolePhoneNumber(phoneIndex) {
        let addFields = { ...this.state.addFields };
        addFields.rolePhoneNumber = this.props.phones[phoneIndex].phone_number;

         this.validateVariablesForButtons(addFields);
        this.setState({ addFields});
    }

    resetState() {
       let newState = { ...this.initState}

        let newButtons = [...this.state.buttons];
        newButtons[1].disabled = true;
        if (newButtons.length > 2) {
            newButtons[2].disabled = true;
        }
        newState.buttons = newButtons
        this.setState(newState);
    }

    addNewPhone(phoneNumber) {
        let addFields =  { ...this.state.addFields };

        if ( addFields.phones.length == 0 ) {
            addFields.rolePhoneNumber = phoneNumber;
        }

        addFields.phones.push({id: null, key: null, phone_number: phoneNumber});
        this.validateVariablesForButtons(addFields);
        this.setState({ addFields});
    }

    addAllocation(continueAllocation = false) {

        if(!this.validInput){ return}

        let electionRoleIndex = this.state.electionRolesCombo.findIndex(roleItem => roleItem.id == this.state.addFields.election_role_id);
        let electionRoleSystemName = this.state.electionRolesCombo[electionRoleIndex].system_name;

        let electionRoleKey = this.state.electionRolesCombo[electionRoleIndex].key;

        let addFieldsObj = this.prepareAllocationsFields(electionRoleSystemName);
        let bindWithShift = false;

        let cluster_key = this.state.addFields.cluster_key;
        let isClusterSummaryScreen = this.checkParentScreen('cluster_summary', 'city_view')
        if(!isClusterSummaryScreen){
            //Add cluster for clusters roles:
            if(this.isClusterRole(electionRoleSystemName) && cluster_key){
                addFieldsObj.cluster_key = cluster_key; 
                bindWithShift = true;
            }
            let ballot_key = this.state.addFields.ballot_key;
            //Add ballot and shift for ballot roles:
            if(this.isBallotRole(electionRoleSystemName)){
                addFieldsObj.ballot_key = ballot_key; 
                addFieldsObj.shift_system_name = this.state.addFields.shift_system_name; 
                if(!addFieldsObj.shift_system_name) { return}
                bindWithShift = true;
            }
        }

		addFieldsObj.election_role_key = electionRoleKey;

        this.props.addAllocation(electionRoleKey, addFieldsObj, bindWithShift, continueAllocation);
        let self = this;
        setTimeout(() => { self.hideModal()}, 3000)
    }
    prepareAllocationsFields(electionRoleSystemName){
        let newPhones = [];

        for ( let phoneIndex = 0; phoneIndex < this.state.addFields.phones.length; phoneIndex++ ) { 
            if ( this.state.addFields.phones[phoneIndex].key == null ) {
                newPhones.push(this.state.addFields.phones[phoneIndex].phone_number);
            }
        }
        let addFieldsObj = {
            comment: (this.state.addFields.comment.length > 0) ? this.state.addFields.comment : null,
            sum: this.state.addFields.sum,
            phone_number: this.state.addFields.rolePhoneNumber,

            email: (this.state.addFields.email.length > 0) ? this.state.addFields.email : null,
            phones: (newPhones.length > 0) ? newPhones : null,

            car_number: null,
            car_type: null,
            car_seats: null,

            send_sms: this.state.addFields.send_sms,
            day_sending_message: this.state.addFields.day_sending_message.id,
            assigned_city_id: this.state.addFields.assigned_city_id,
            assigned_city_key: this.state.addFields.assigned_city_key
        };
        if ( electionRoleSystemName == this.electionRoleSytemNames.driver ) {
            addFieldsObj.car_number = this.state.addFields.vehicle.number;
            addFieldsObj.car_type = this.state.addFields.vehicle.type.id;
            addFieldsObj.car_seats = this.state.addFields.vehicle.seats;
        }
        if(this.props.addAllocationFromCityViewMode){
            addFieldsObj.shift_system_name = this.state.shift_system_name;
        }
        return addFieldsObj;
    }
    hideModal() {
        this.resetState();

        this.props.hideAddAllocationModal();
    }

    carTypeChange(event) {
        let addFields =  { ...this.state.addFields };
        let selectedItem = event.target.selectedItem;
        if ( !selectedItem ) {
            addFields.vehicle.type.name = event.target.value;
            addFields.vehicle.type.id = null;
        } else {
            addFields.vehicle.type.name = selectedItem.name;
            addFields.vehicle.type.id = selectedItem.id;
        }

        this.validateVariablesForButtons(addFields);
        this.setState({ addFields});
    }

    vehicleInputFieldChange(fieldName, event) {
        let addFields =  { ...this.state.addFields };

        addFields.vehicle[fieldName] = event.target.value;

        this.validateVariablesForButtons(addFields);
        this.setState({ addFields});
    }

    smsSendDayChange(event) {
        let selectedItem = event.target.selectedItem;
        let addFields =  { ...this.state.addFields };
        addFields.day_sending_message = selectedItem ? selectedItem : {...this.emptySmsSendDay, name: event.target.value};
        this.validateVariablesForButtons(addFields);
        this.setState({ addFields});
    }

    smsSendChange(newSendSms) {
        let addFields =  { ...this.state.addFields };
        addFields.send_sms = newSendSms;

        this.setState({addFields});
    }

    inputFieldChange(fieldName, event) {
        let addFields = { ...this.state.addFields };
        addFields[fieldName] = event.target.value;

        this.validateVariablesForButtons(addFields);
        this.setState({ addFields});
    }

    getElectionRoleBudget(electionRoleId, electionRoleSytemName) {
        let roleBudget = false;
        //!! City budget - not relevant now (28/01/2020 harel)
        /*
        if ( this.props.electionRolesCityBudget.length != 0 ) {
            roleBudget =  this.getElectionRoleBudgetBySystemName(electionRoleSytemName, this.props.electionRolesCityBudget);
        }
        if ( !roleBudget && this.props.electionRolesBudget.length != 0 ) {
            roleBudget =  this.getElectionRoleBudgetFromCityBudget( electionRoleId);
        }
        */
        if ( !roleBudget && this.props.electionRolesShiftsBudgets.length != 0 ) {
            roleBudget =  this.getElectionRoleBudgetBySystemName(electionRoleSytemName, this.props.electionRolesShiftsBudgets, 'election_role_system_name');
        } 
        return roleBudget ? roleBudget : '';
    }
    getElectionRoleBudgetFromCityBudget(electionRoleId){
        let budgetIndex = -1;

        budgetIndex = this.props.electionRolesBudget.findIndex(item => item.election_role_id == electionRoleId );

        if ( budgetIndex > -1 ) {
            return this.props.electionRolesBudget[budgetIndex].budget;
        } 

        return false;
        
    }
    getElectionRoleBudgetBySystemName(electionRoleSytemName, electionRolesBudgetArray ,prop_name = 'system_name'){
        let budgetIndex = -1;

        budgetIndex = electionRolesBudgetArray.findIndex(item => item[prop_name] == electionRoleSytemName);

        if ( budgetIndex > -1 ) {
            return electionRolesBudgetArray[budgetIndex].budget;
        } 

        return '';
        
    }
    onChangeAssignedCity(e){
        let addFields = { ...this.state.addFields }
        let assigned_city_name = e.target.value;
        let selectedItem = e.target.selectedItem;
        let assigned_city_id = selectedItem ? selectedItem.id : null;
        let assigned_city_key = selectedItem ? selectedItem.key : null;

        addFields.assigned_city_id = assigned_city_id;
        addFields.assigned_city_key = assigned_city_key;
        addFields.assigned_city_name = assigned_city_name;

        this.validateVariablesForButtons(addFields );
        if(selectedItem && addFields.election_role_id && this.isClusterRole()){
            ElectionsActions.loadCityClustersAvailableAllocations(this.props.dispatch, selectedItem.key, addFields.election_role_id);
        }
        if(selectedItem && addFields.election_role_id && this.isBallotRole()){
            ElectionsActions.loadCityBallotsAvailableAllocations(this.props.dispatch, selectedItem.key, addFields.election_role_id);
        }
        this.setState({addFields});
    }
    onChangeCluster(e){
        let addFields = { ...this.state.addFields }
        let selectedItem = e.target.selectedItem;
        addFields.cluster_name = e.target.value;
        addFields.cluster_key = selectedItem ? selectedItem.key : null;

        addFields.cluster_ballots = [];
        // Update selected cluster ballots
        if(selectedItem && this.isBallotRole()){
            addFields.cluster_ballots = selectedItem.ballot_boxes
        } 
        this.validateVariablesForButtons(addFields);
        this.setState({addFields});
    }
    onChangeBallot(e){
        let addFields = { ...this.state.addFields }
        let selectedItem = e.target.selectedItem;
        addFields.ballot_mi_id = e.target.value;
        addFields.ballot_key = selectedItem ? selectedItem.key : null;

        this.validateVariablesForButtons(addFields);
        let ballotAvailableShifts = [];
        if(selectedItem){
            ballotAvailableShifts = getBallotsAvailableShifts(this.props.electionRolesShifts, selectedItem, this.state.roleSystemName);
        }
        this.setState({addFields, ballotAvailableShifts});
    }

    onChangeElectionShift(e){
        let addFields = { ...this.state.addFields }
        let selectedItem = e.target.selectedItem;

        if(selectedItem){
            addFields.shift_system_name = selectedItem.system_name;
            addFields.shift_label = this.getBallotShiftLabel(selectedItem.system_name);
        }
        this.validateVariablesForButtons(addFields);

        this.setState({addFields});
    }

    electionRoleFieldChange(event) {
        let addFields = { ...this.state.addFields };

        let electionRoleSelected = event.target.selectedItem;
        let electionRoleName = event.target.value;

        //new state
        let newState = {};

        //check if selected observer and already have warning roles
        
        if (electionRoleSelected &&
            this.props.activistItem.election_roles_by_voter &&
            electionRoleSelected.system_name == constants.electionRoleSytemNames.observer) {

            for (let i=0; i<this.props.activistItem.election_roles_by_voter.length; i++) {
                let allocatedRole = this.props.activistItem.election_roles_by_voter[i];
                if (this.warningRoles.includes(allocatedRole.system_name)) {
                    newState.showModalCountShiftWarning = true;
                    newState.modalCountShiftAllocatedRole = allocatedRole.election_role_name;
                    newState.modalCountShiftToAllocateRole = electionRoleName;
                    break;
                }
            }
        }
        
        //check if selected warning roles and already have observer
        else if (electionRoleSelected &&
            this.props.activistItem.election_roles_by_voter &&
            this.warningRoles.includes(electionRoleSelected.system_name)) {
            for (let i=0; i<this.props.activistItem.election_roles_by_voter.length; i++) {
                let allocatedRole = this.props.activistItem.election_roles_by_voter[i];
                if (allocatedRole.system_name == constants.electionRoleSytemNames.observer) {
                    newState.showModalCountShiftWarning = true;
                    newState.modalCountShiftAllocatedRole = allocatedRole.election_role_name;
                    newState.modalCountShiftToAllocateRole = electionRoleName;
                    break;
                }
            }
        }

        this.electionRoleChange(addFields, electionRoleSelected, electionRoleName);

        this.validateVariablesForButtons(addFields);
        newState.addFields = addFields;
        this.setState(newState);
    }
    electionRoleChange(addFields, electionRoleSelected, inputValue) {
        let electionRoleId = null;
        let electionRoleSytemName = null;

        if ( electionRoleSelected ) {
            electionRoleId = electionRoleSelected.id;
            electionRoleSytemName = electionRoleSelected.system_name;

            addFields.sum = this.getElectionRoleBudget(electionRoleId, electionRoleSytemName);

        }

        addFields.election_role_name = inputValue;
        addFields.election_role_id = electionRoleId;
        if ( electionRoleSytemName != this.electionRoleSytemNames.driver ) {
            addFields.vehicle = {type: '', number: '', seats: 1};
        }
        if(electionRoleSelected && addFields.assigned_city_key && this.isClusterRole(electionRoleSytemName)){
            ElectionsActions.loadCityClustersAvailableAllocations(this.props.dispatch, addFields.assigned_city_key, electionRoleSelected.id);
        }
        if(electionRoleSelected && addFields.assigned_city_key && this.isBallotRole(electionRoleSytemName)){
            ElectionsActions.loadCityBallotsAvailableAllocations(this.props.dispatch, addFields.assigned_city_key, electionRoleSelected.id);
        }
        this.setState({roleSystemName: electionRoleSytemName});
    }

    renderPhones() {
        let that = this;

        if (Object.keys(this.props.activistItem).length == 0) {
            return;
        }

        let phones = (this.props.phones ? this.props.phones.map( function(phoneItem, index) {
            return <AddAllocationPhoneItem key={index} rolePhoneNumber={that.state.addFields.rolePhoneNumber} phoneIndex={index}
                                           item={phoneItem} setRolePhoneNumber={that.setRolePhoneNumber.bind(that)}/>
        }) : null);

        return phones;
    }

    validateCarSeats(carSeats) {
        if ( carSeats.length == 0 ) {
            return false;
        }

        let regExp1 = /^[1-9]$/;
        let regExp2 = /^[1-5][0-9]$/;

        return ( (regExp1.test(carSeats) || regExp2.test(carSeats)) && carSeats <= 50 );
    }

    validateCarNumber(carNumber) {
        if ( carNumber.length == 0 ) {
            return false;
        }

        let regExp = /^[0-9]{7,8}$/;

        return regExp.test(carNumber);
    }

    validateCarType(carType) {
        return carType != null;
    }

    validateSmsSendDay(sendDay) {
        return (sendDay.id != null);
    }

    validateRolePhoneNumber(phoneNumber) {
        return phoneNumber.length > 0;
    }

    validateSum(sum) {
        let reg = /[0-9]+/;
        let regLeadingZeros = /^0+/;

        if ( sum.length == 0 ) {
            return false;
        } else {
            return reg.test(sum) && !regLeadingZeros.test(sum);
        }
    }

    validateEmail(email) {
        if ( email.length == 0 ) {
            return true;
        } else {
            return validateEmail(email);
        }
    }

    validateRole(roleId) {
        return roleId != null;
    }

    getElectionRoleSytemName(electionRoleId) {
        let roleIndex = this.props.electionRoles.findIndex(roleItem => roleItem.id == electionRoleId);

        return this.props.electionRoles[roleIndex].system_name;
    }

    validateVariablesForButtons(fieldsObj, showShiftError = null) {
        let validInput = true;
        let electionRoleSystemName = null;

        if ( !this.validateRole(fieldsObj['election_role_id']) ) {
            validInput = false;
        } else {
            electionRoleSystemName = this.getElectionRoleSytemName(fieldsObj['election_role_id']);
        }

        if ( !this.validateEmail(fieldsObj['email']) ) {
            validInput = false;
        }
        if (!fieldsObj['assigned_city_id']) {
            validInput = false;
        }

        if ( !this.isRoleWithNoBudget(this.state.roleSystemName) && !this.validateSum(fieldsObj['sum']) ) {
            validInput = false;
        }

        if ( !this.validateRolePhoneNumber(fieldsObj['rolePhoneNumber']) ) {
            validInput = false;
        }

        if ( 0 == fieldsObj['send_sms'] && !this.validateSmsSendDay(fieldsObj['day_sending_message']) ) {
            validInput = false;
        }
        if ( !this.isValidClusterField(fieldsObj, electionRoleSystemName) ) {
            validInput = false;
        }
        if ( electionRoleSystemName == this.electionRoleSytemNames.driver ) {
            if ( !this.validateCarType(fieldsObj.vehicle.type.id) ) {
                validInput = false;
            }

            if ( !this.validateCarNumber(fieldsObj.vehicle.number) ) {
                validInput = false;
            }

            if ( !this.validateCarSeats(fieldsObj.vehicle.seats) ) {
                validInput = false;
            }
        }


        if (showShiftError || (showShiftError === null && this.state.showShiftError)) validInput = false;

        let newButtons = this.state.buttons;
        newButtons[1].disabled = !validInput;
        if (newButtons.length > 2) {
            newButtons[2].disabled = !validInput;
        }
        this.validInput  = validInput ;
        this.setState({ buttons: newButtons })
    }

    validateVariables() {
        if ( !this.validateRole(this.state.addFields.election_role_id) ) {
            this.roleInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateEmail(this.state.addFields.email) ) {
            this.emailInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.isRoleWithNoBudget(this.state.roleSystemName) && !this.validateSum(this.state.addFields.sum) ) {
            this.sumInputStyle = {borderColor: this.invalidColor};
        }
        if ( !this.state.addFields.assigned_city_id ) {
            this.assignedCityInputStyle = {borderColor: this.invalidColor};
        }

        if ( this.state.addFields.send_sms == 0 && !this.validateSmsSendDay(this.state.addFields.day_sending_message) ) {
            this.sendSmsDayInputStyle = {width: '100px', borderColor: this.invalidColor};
        }

        if ( this.state.roleSystemName == this.electionRoleSytemNames.driver ) {
            if ( !this.validateCarType(this.state.addFields.vehicle.type.id) ) {
                this.carTypeStyle = {borderColor: this.invalidColor};
            }

            if ( !this.validateCarNumber(this.state.addFields.vehicle.number) ) {
                this.carNumberStyle = {borderColor: this.invalidColor};
            }

            if ( !this.validateCarSeats(this.state.addFields.vehicle.seats) ) {
                this.carSeatsStyle = {borderColor: this.invalidColor};
            }
        }
        if ( !this.isValidClusterField(this.state.addFields, this.state.roleSystemName) ) {
            this.clusterInputStyle = {borderColor: this.invalidColor};
        }
        if ( !this.isValidBallotField(this.state.addFields, this.state.roleSystemName) ) {
            this.ballotInputStyle = {borderColor: this.invalidColor};
        }
        if ( !this.isValidBallotShiftField(this.state.addFields, this.state.roleSystemName) ) {
            this.ballotShiftInputStyle = {borderColor: this.invalidColor};
        }
    }
    checkParentScreen(screenName, screenName2 = null){
        if(!this.props.sourceScreen) { return false;}
        return (this.props.sourceScreen == screenName || this.props.sourceScreen == screenName2);
    }
    isValidBallotField(addFields, roleSystemName){
        let isClusterSummaryScreen = this.checkParentScreen('cluster_summary', 'city_view');  // Cluster already defined.

        let isBallotRole = this.isBallotRole(roleSystemName);
        return (isClusterSummaryScreen || !isBallotRole ||  addFields.ballot_key)
    }
    isValidBallotShiftField(addFields, roleSystemName){
        return (this.isValidBallotField(addFields, roleSystemName) &&  addFields.shift_system_name)
    }
    isValidClusterField(addFields, electionRoleSystemName){
        let isClusterSummaryScreen = this.checkParentScreen('cluster_summary' , 'city_view');  // Cluster already defined.
        let isClusterRequiredRole = this.isClusterRole(electionRoleSystemName) || this.isBallotRole();
        return (isClusterSummaryScreen || !isClusterRequiredRole ||  addFields.cluster_key)
    }
    isRoleWithNoBudget(system_name){
        return (system_name == this.electionRoleSytemNames.ballotMember || system_name == this.electionRoleSytemNames.observer);
    }
    // is cluster role
    isClusterRole(roleSystemName = null){
        let electionRoleSytemName = roleSystemName? roleSystemName :this.state.roleSystemName;
        let clusterActivists = [
                this.electionRoleSytemNames.clusterLeader,
                this.electionRoleSytemNames.ministerOfFifty,
                this.electionRoleSytemNames.motivator,
                this.electionRoleSytemNames.driver,
        ];
        if(inArray(clusterActivists, electionRoleSytemName)){ return true; }
        return false
    }
    // is ballot role:
    isBallotRole(roleSystemName = null){
        let electionRoleSytemName = roleSystemName? roleSystemName :this.state.roleSystemName;
        let clusterActivists = [
                this.electionRoleSytemNames.observer,
                this.electionRoleSytemNames.counter,
                this.electionRoleSytemNames.ballotMember,
        ];
        if(inArray(clusterActivists, electionRoleSytemName)){
            return true;
        }
        return false
    }
    initVariables() {
        this.roleInputStyle = {};
        this.emailInputStyle = {};
        this.sumInputStyle = {};
        this.assignedCityInputStyle = {};
        this.rolePhoneNumberStyle =  {border:'1px solid #ccc'};

        this.sendSmsDayInputStyle = {width: '100px'};

        this.carTypeStyle = {};
        this.carNumberStyle = {};
        this.carSeatsStyle = {};
        this.clusterInputStyle = {};
        this.ballotInputStyle = {};
        this.ballotShiftInputStyle = {};
    }

    getModalTitle() {
        let modalTitle = '';

        if ( Object.keys(this.props.activistItem).length > 0 ) {
            modalTitle = 'הוספת שיבוץ עבור הפעיל ';
            modalTitle += this.props.activistItem.first_name + ' ';
            modalTitle += this.props.activistItem.last_name;
        }

        return modalTitle;
    }

    getDriverBlockStyle() {
        let driverBlockStyle = {};

        if ( this.state.roleSystemName != this.electionRoleSytemNames.driver ) {
            driverBlockStyle = {display: 'none'};
        }

        return driverBlockStyle;
    }
    onChangeVoterPersonalIdentity(e){
        let personal_identity = e.target.value;
        if (!validatePersonalIdentity(personal_identity)) { return; }
        this.setState({ voter_personal_identity: personal_identity })
    }
    searchForVoter(validPersonalIdentity, e){
        let voter_personal_identity = this.state.voter_personal_identity
        if(validPersonalIdentity){
            this.props.searchForVoterActivist(voter_personal_identity);
        }
    }
    getBallotShiftLabel(shift_system_name) {
        let currentShift = this.props.electionRolesShifts.find(function (shift) {
            if (shift.system_name == shift_system_name) { return shift; }
        })
        return currentShift.name;
    }
    changeAllocationShift(e) {
        if (e.target.selectedItem) {
            let shift_system_name = e.target.selectedItem.system_name
            let shift_label = e.target.selectedItem.name
            this.setState({ shift_system_name, shift_label })
        }
    }
    onSearchVoterKeyPress(e){
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            let voter_personal_identity = this.state.voter_personal_identity
            let validPersonalIdentity = checkPersonalIdentity(voter_personal_identity);
            if (validPersonalIdentity) {
                this.searchForVoter(voter_personal_identity)
            }
        }
    }
    renderSearchForVoter(){
        let voter_personal_identity = this.state.voter_personal_identity
        let validPersonalIdentity = checkPersonalIdentity(voter_personal_identity);
        let linkTitle = 'חפש תושב';
        let buttonStyle = { cursor: 'pointer', position: 'relative', left: '30px' };
        let inputStyle = {};

        if (!validPersonalIdentity) { 
            linkTitle = 'תז לא תקינה!';
            buttonStyle.cursor = 'not-allowed';
            inputStyle = { border: '1px solid red' };
        }

        let showChooseShift = this.props.entityAllocationData.shift_name ? true : false;
        return (
            <div className="containerStrip">
                <div className="form-horizontal">
                    <div className="row form-group">
                        <div className="col-md-6 no-padding">
                            <label className="col-md-5 control-label">חפש פעיל</label>
                            <div className="col-md-7">
                                <div style={{ float: 'right' }}>
                                    <input type="text" className="form-control" value={voter_personal_identity} style={inputStyle}
                                      onKeyPress={this.onSearchVoterKeyPress.bind(this)}  onChange={this.onChangeVoterPersonalIdentity.bind(this)} />
                                </div>
                                <div style={{ float: 'left', width: '0px' }}>
                                    <a className="search-icon blue" title={linkTitle} onClick={this.searchForVoter.bind(this, validPersonalIdentity)}
                                        style={buttonStyle}> </a>
                                </div>
                            </div>
                        </div>
                        {showChooseShift && 
                        <div className="col-md-6 no-padding">
                            <label className="col-md-5 control-label">בחר משמרת</label>
                            <div className="col-md-7">
                                <div>
                                    <Combo items={this.props.electionRolesShifts}
                                        maxDisplayItems={3}
                                        itemIdProperty="system_name"
                                        itemDisplayProperty="name"
                                        className="form-combo-table"
                                        // inputStyle={this.sendSmsDayInputStyle}
                                        value={this.state.shift_label}
                                        disabled={true}
                                        onChange={this.changeAllocationShift.bind(this)}
                                    />
                                </div>
                            </div>
                        </div>}
                        {this.state.showShiftError && 
                        <div className="col-md-12 error-message">
                            אין אפשרות להוסיף משמרת לפעיל
                        </div>
                        }
                    </div>
                </div>
            </div>
        )
    }

    /**
     * Close modal count shift
     *
     * @return void
     */
    closeModalCountShift() {
        this.setState({
            showModalCountShiftWarning: false
        });
    }
    renderSelectAllocationCluster(){
        let isClusterRole = this.isClusterRole();
        let isBallotRole = this.isBallotRole();
        if(!isBallotRole && !isClusterRole || this.checkParentScreen('cluster_summary' , 'city_view')) {return null}
        let comboClusters = isClusterRole ? this.props.allocationModalClusters : this.props.allocationModalBallotsClusters
           return ( 
            <div className="col-lg-6">
               <div className="form-group election-activist-type">
                <label htmlFor="assignedCity" className="col-lg-5 control-label">בחר אשכול שיבוץ</label>
                <div className="col-lg-7">
                    <Combo items={comboClusters || [] }
                        id="assignedCity"
                        maxDisplayItems={10}
                        itemIdProperty="id"
                        itemDisplayProperty="name"
                        className="form-combo-table" 
                        inputStyle={this.clusterInputStyle} 
                        value={this.state.addFields.cluster_name}
                        // disabled={this.props.allocationCitiesList.length == 1}
                        onChange={this.onChangeCluster.bind(this)}
                    />
                </div>
            </div>
        </div>)
    }
    renderSelectAllocationBallot(){
        let isBallotRole = this.isBallotRole();
        let clusterBallots = this.state.addFields.cluster_ballots || [];
        if(!isBallotRole || this.checkParentScreen('cluster_summary' , 'city_view') || clusterBallots.length == 0) {return null}
           return ( 
            <div className="col-lg-6">
               <div className="form-group election-activist-type">
                <label htmlFor="assignedCity" className="col-lg-5 control-label">בחר קלפי שיבוץ</label>
                <div className="col-lg-7">
                    <Combo items={clusterBallots }
                        id="assignedCity"
                        maxDisplayItems={10}
                        itemIdProperty="id"
                        itemDisplayProperty="mi_id"
                        className="form-combo-table" 
                        inputStyle={this.ballotInputStyle} 
                        value={this.state.addFields.ballot_mi_id}
                        onChange={this.onChangeBallot.bind(this)}
                    />
                </div>
            </div>
        </div>)
    }
    renderSelectAllocationBallotShift(){
        let isBallotRole = this.isBallotRole();
        let ballotAvailableShifts = this.state.ballotAvailableShifts || [];
        if(!isBallotRole || this.checkParentScreen('cluster_summary', 'city_view') ) {return null}
           return ( 
            <div className="col-lg-6">
               <div className="form-group election-activist-type">
                <label htmlFor="assignedCity" className="col-lg-5 control-label">בחר משמרת</label>
                <div className="col-lg-7">
                    <Combo items={ballotAvailableShifts }
                        id="assignedCity"
                        maxDisplayItems={10}
                        itemIdProperty="id" 
                        itemDisplayProperty="name"
                        className="form-combo-table" 
                        inputStyle={this.ballotShiftInputStyle} 
                        value={this.state.addFields.shift_label}
                        // disabled={this.props.allocationCitiesList.length == 1}
                        onChange={this.onChangeElectionShift.bind(this)}
                    />
                </div>
            </div>
        </div>)
    }
    render() {
        this.initVariables();

        this.validateVariables();
        let isRoleWithNoBudget =  this.isRoleWithNoBudget(this.state.roleSystemName);
        return (
        <div className="modal-lg">
            <ModalWindow show={this.props.showAddAllocationModal} buttonX={this.hideModal.bind(this)}
                         title={this.getModalTitle()} style={{zIndex: '9001'}} buttons={this.state.buttons}>
                {this.props.addAllocationFromCityViewMode && this.renderSearchForVoter()}
                <div className="containerStrip">
                        <div className="row form-horizontal">
                            <div className="col-lg-6">
                                <div className="form-group election-activist-type">
                                    <label htmlFor="ModalActivistInput" className="col-lg-5 control-label">בחר סוג פעיל</label>
                                    <div className="col-lg-7">
                                        <Combo items={this.state.electionRolesCombo}
                                            id="ModalActivistInput"
                                            maxDisplayItems={10}
                                            itemIdProperty="id"
                                            itemDisplayProperty="name"
                                            className="form-combo-table"
                                            inputStyle={this.roleInputStyle}
                                            value={this.state.addFields.election_role_name}
                                            disabled={this.disabledElectionRoleCombo}
                                            onChange={this.electionRoleFieldChange.bind(this)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="form-group election-activist-type">
                                    <label htmlFor="assignedCity" className="col-lg-5 control-label">בחר עיר שיבוץ</label>
                                    <div className="col-lg-7">
                                        <Combo items={this.props.allocationCitiesList }
                                            id="assignedCity"
                                            maxDisplayItems={10}
                                            itemIdProperty="id"
                                            itemDisplayProperty="name"
                                            className="form-combo-table"
                                            inputStyle={this.assignedCityInputStyle}
                                            value={this.state.addFields.assigned_city_name}
                                            disabled={this.checkParentScreen('cluster_summary', 'city_view')}
                                            onChange={this.onChangeAssignedCity.bind(this)}
                                        />
                                    </div>
                                </div> 
                            </div>
                            {/* Select cluster for clusters roles: */}
                            {this.renderSelectAllocationCluster()}
                            {this.renderSelectAllocationBallot()}
                            {this.renderSelectAllocationBallotShift()}
                        </div>
                </div>

                <div className="containerStrip">
                    <div className="row">
                        <div className="col-lg-6">
                            <form className="form-horizontal">
                                <div className={"form-group" + (this.state.addFields.rolePhoneNumber.length?'':' has-error')}>
                                    <label htmlFor="inputModalMobile" className="col-lg-3 control-label no-padding" style={{ padding: '0px', color:'black' }}>טלפון נייד <br />לאימות ולדווח </label>
                                    <div className="col-lg-9">
                                        {this.state.addFields.rolePhoneNumber}
                                        <span id="helpBlock"
                                              className={"help-block" + (this.validateRolePhoneNumber(this.state.addFields.rolePhoneNumber) ? " hidden" : "")}>המס' חייב להיות מסוג שמקבל הודעות sms </span>
                                    </div>
                                    <div className="col-lg-12" style={{ overflow: 'auto', maxHeight: '150px' }}>
                                        {this.renderPhones()}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <AddAllocationNewPhone addNewPhone={this.addNewPhone.bind(this)}
                                                           rolePhoneNumber={this.state.addFields.rolePhoneNumber}
                                                           validateRolePhoneNumber={this.validateRolePhoneNumber.bind(this)}
                                                           phones={this.state.addFields.phones}/>
                                </div>

                                <div className="form-group">
                                    <input type="radio" id="input-send-sms-now" checked={this.state.addFields.send_sms == 1}
                                           onChange={this.smsSendChange.bind(this, 1)}/>
                                    <span style={this.state.addFields.send_sms == 1 ? {} : {color: '#ccc'}}>{'\u00A0'}שלח מיידית את הודעת האימות לפעיל</span>
                                </div>

                                <div className="form-group moadal-add-allocation-send-sms">
                                    <div className="col-lg-7"
                                         style={this.state.addFields.send_sms == 0 ? {paddingRight: '0'}: {paddingRight: '0', color: '#ccc'}}>
                                        <input type="radio" id="input-send-sms-later" checked={this.state.addFields.send_sms == 0}
                                               onChange={this.smsSendChange.bind(this, 0)}/>{'\u00A0'}שלח את הודעת האימות לפעיל ביום
                                    </div>

                                    <div className={"col-lg-4" + (this.state.addFields.send_sms == 1 ? ' hidden' : '')}
                                         style={{ bottom: '5px'}}>
                                        <Combo items={this.sendDays}
                                               id="send-sms-day"
                                               maxDisplayItems={10}
                                               itemIdProperty="id"
                                               itemDisplayProperty="name"
                                               className="form-combo-table"
                                               inputStyle={this.sendSmsDayInputStyle}
                                               value={this.state.addFields.day_sending_message.name}
                                               onChange={this.smsSendDayChange.bind(this)}
                                        />
                                    </div>

                                    <div className={"col-lg-1" + (this.state.addFields.send_sms == 1 ? ' hidden' : '')}>
                                        {this.texts.nextWeek}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col-lg-6">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="input-email" className="col-lg-3 control-label">אימייל</label>
                                    <div className="col-lg-9">
                                        <input type="email" id="input-email" className="form-control" style={this.emailInputStyle}
                                               value={this.state.addFields.email} onChange={this.inputFieldChange.bind(this, 'email')}/>
                                    </div>
                                </div>
                                { !isRoleWithNoBudget &&
                                    <div className="form-group">
                                        <label htmlFor="inputModalSum" className="col-lg-3 control-label">סכום</label>
                                        <div className="col-lg-9">
                                            <input type="text" className="form-control" style={this.sumInputStyle} id="inputModalSum"
                                                value={this.state.addFields.sum} onChange={this.inputFieldChange.bind(this, 'sum')}/>
                                        </div>
                                    </div>
                                }
                                <div className="form-group">
                                    <label htmlFor="inputModalComment" className="col-lg-3 control-label">הערה</label>
                                    <div className="col-lg-9">
                                        <textarea className="form-control" rows="3" id="inputModalComment"
                                                  value={this.state.addFields.comment}
                                                  onChange={this.inputFieldChange.bind(this, 'comment')}/>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="containerStrip" style={this.getDriverBlockStyle()}>
                    <div className="row">
                        <div className="col-lg-6">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="type-car" className="col-lg-3 control-label">סוג רכב</label>
                                    <div className="col-lg-9">
                                        <Combo items={this.carTypesComboList}
                                               id="type-car"
                                               maxDisplayItems={10}
                                               itemIdProperty="id"
                                               itemDisplayProperty="name"
                                               className="form-combo-table"
                                               inputStyle={this.carTypeStyle}
                                               value={this.state.addFields.vehicle.type.name}
                                               onChange={this.carTypeChange.bind(this)}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-lg-6">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="num-car" className="col-lg-3 control-label">מספר רכב</label>
                                    <div className="col-lg-9">
                                        <input type="text" className="form-control" id="num-car" style={this.carNumberStyle}
                                               value={this.state.addFields.vehicle.number}
                                               onChange={this.vehicleInputFieldChange.bind(this, 'number')}/>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-lg-6">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="seats" className="col-lg-3 control-label">מס' מושבים</label>
                                    <div className="col-lg-4">
                                        <input type="number" className="form-control" id="seats" style={this.carSeatsStyle}
                                               value={this.state.addFields.vehicle.seats}
                                               onChange={this.vehicleInputFieldChange.bind(this, 'seats')}/>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </ModalWindow>
            {this.state.showModalCountShiftWarning &&
                <ModalCountShiftWarning 
                        buttonOk={this.closeModalCountShift.bind(this)}
                        buttonCancel={this.hideModal.bind(this)}
                        modalCountShiftAllocatedRole={this.state.modalCountShiftAllocatedRole}
                        modalCountShiftToAllocateRole={this.state.modalCountShiftToAllocateRole}/>
            }
        </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        showAddAllocationModal:  state.elections.activistsScreen.showAddAllocationModal,
        electionRoles: state.elections.activistsScreen.electionRoles,
        electionRolesBudget: state.elections.activistsScreen.electionRolesBudget,
        electionRolesCityBudget: state.elections.activistsScreen.electionRolesCityBudget,
        addAllocationFields: state.elections.activistsScreen.addAllocationFields,
        addedAllocationFlag: state.elections.activistsScreen.addedAllocationFlag,
        allocationModalClusters: state.elections.activistsScreen.addAllocationModalAvailableClusters,
        allocationModalBallotsClusters: state.elections.activistsScreen.addAllocationModalAvailableBallots,
        electionRolesShiftsBudgets: state.elections.activistsScreen.electionRolesShiftsBudgets,
        electionRolesShifts:  state.elections.activistsScreen.electionRolesShifts

    };
}

export default connect(mapStateToProps) (ModalAddAllocation);