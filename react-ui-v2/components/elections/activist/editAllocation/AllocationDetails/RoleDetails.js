import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';
import { isMobilePhone, validateEmail } from 'libs/globalFunctions';

import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';
import PhoneItem from './PhoneItem';
import AddNewPhone from './AddNewPhone';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import { ActivistUpdateDto } from '../../../../../DTO/ActivistUpdateDto';
import { TransportationCarDto } from '../../../../../DTO/TransportationCarDto';


class RoleDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: null,
            key: null,

            election_role_id: null,
            assigned_city_id: null,
            assigned_city_name: '',
            system_name: null,

            sum: '',
            not_for_payment: null,

            bonus_key: null,
            bonus: '',
            bonus_user_lock_id: false,

            comment: '',
            instructed: false,

            phones: [],
            new_phone_number: '',
            rolePhoneNumber: '',
            displayWarningPhoneDeletionModal: false,
            deletePhoneIndex : -1,
            roleIndex: -1,

            vehicle: {
                type: {id: null, name: ''},
                number: '',
                seats: 1
            },

            hasGeoAllocations: false,
            mobileLink: null
        };
        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.driverCarTypes = constants.activists.driverCarTypes;

        this.carTypesCombo = [
            {id: this.driverCarTypes.regular, name: 'רכב רגיל'},
            {id: this.driverCarTypes.crippled, name: 'רכב הסעות מונגש'},
        ];

        this.invalidColor = '#cc0000';

        this.rolePhoneErrorText = "מספר הטלפון נדרש להיות זמין במהלך כל יום הבחירות ";
        this.componentDirtyName = 'role_details';
    }
    getCurrentElectionRoleByVoterKey(){
        let roleIndex = this.state.roleIndex;
        let electionRoleByVoterKey = null;
        if(!this.props.activistDetails.election_roles_by_voter[roleIndex]){
            roleIndex = 0;
        }
        electionRoleByVoterKey = this.props.activistDetails.election_roles_by_voter[roleIndex].key;
        return electionRoleByVoterKey;
    }

    editAllocation(event) {
        event.preventDefault();

        let roleIndex = this.state.roleIndex;
        let realSum = this.state.sum ;

        if(this.state.not_for_payment){realSum = 0;}
        let activistUpdate=new ActivistUpdateDto();
        activistUpdate.electionRoleByVoterKey=this.getCurrentElectionRoleByVoterKey();
        activistUpdate.email=this.state.email;
        activistUpdate.phoneNumber=this.state.rolePhoneNumber;
        activistUpdate.otherPhoneNumber=this.state.phones;
        activistUpdate.instructed=this.state.instructed;
        activistUpdate.assignedCityId=this.state.assigned_city_id;


        let editStateObj = {
            assigned_city_id: this.state.assigned_city_id,
            assigned_city_name: this.state.assigned_city_name,
            phone_number: this.state.rolePhoneNumber
        };

        if ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.driver ) {
            activistUpdate.transportationCars = new TransportationCarDto();
            activistUpdate.transportationCars.CarNumber = this.state.vehicle.number;
            activistUpdate.transportationCars.CarType = this.state.vehicle.type.id;
            activistUpdate.transportationCars.PassengerCount = this.state.vehicle.seats;

            editStateObj.transportation_car_type = this.state.vehicle.type.id;
            editStateObj.transportation_car_number = this.state.vehicle.number;
            editStateObj.passenger_count = this.state.vehicle.seats;
        }

        this.props.dispatch({type: ElectionsActions.ActionTypes.ACTIVIST.EDIT_ACTIVIST_ROLE_DETAILS, editStateObj, roleIndex,

        currentTabRoleSystemName: this.props.currentTabRoleSystemName});

        ElectionsActions.updateActivistDto(this.props.dispatch, activistUpdate).then((data) => { 
            this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: 'role_details' });
        });
    }

    getActivistPhones(nextProps = null) {
        let phoneIndex = -1;
        let voterPhones = (null == nextProps) ? this.props.voter_phones : nextProps.voter_phones;
        let phones = [];

        for ( phoneIndex = 0; phoneIndex < voterPhones.length; phoneIndex++ ) {
            let phoneToCheck = voterPhones[phoneIndex].phone_number.split('-').join('');

            if ( isMobilePhone(phoneToCheck) ) {
                phones.push(
                    {
                        id: voterPhones[phoneIndex].id,
                        key: voterPhones[phoneIndex].key,
                        phone_number: voterPhones[phoneIndex].phone_number
                    });
            }
        }

        return phones;
    }

    loadActivitDetails( nextProps = null ) {
        let activistItem = {};
        let currentTabRoleId = null;
        let phones = [];
        let roleIndex = -1;
        let currentTabRoleSystemName;
        if (!nextProps) {
            activistItem = this.props.activistDetails;
            currentTabRoleId = this.props.currentTabRoleId;
            currentTabRoleSystemName = this.props.currentTabRoleSystemName;
        } else {
            activistItem = nextProps.activistDetails;
            currentTabRoleId = nextProps.currentTabRoleId;
            currentTabRoleSystemName = nextProps.currentTabRoleSystemName;
        }
        phones = this.getActivistPhones(nextProps);

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == currentTabRoleId);

        let currentElectionRoleByVoter = activistItem.election_roles_by_voter[roleIndex];

        let newState = {
            id: activistItem.id,
            key: activistItem.key,
            roleIndex: roleIndex,
            rolePhoneNumber: currentElectionRoleByVoter.phone_number,
            sum: currentElectionRoleByVoter.sum || 0,
            not_for_payment: currentElectionRoleByVoter.not_for_payment || null,
            bonus_key: currentElectionRoleByVoter.bonus_key || null,
            bonus: currentElectionRoleByVoter.bonus || 0,
            bonus_user_lock_id: currentElectionRoleByVoter.bonus_user_lock_id,
            phones: phones,
            email: activistItem.email || '',
            comment: currentElectionRoleByVoter.comment || '',
            assigned_city_id: currentElectionRoleByVoter.assigned_city_id,
            assigned_city_name: currentElectionRoleByVoter.assigned_city_name || '',
            election_role_id: currentElectionRoleByVoter.election_role_id,
            mobileLink: currentElectionRoleByVoter.mobile_link,
            system_name: currentElectionRoleByVoter.system_name,
            instructed: currentElectionRoleByVoter.instructed == 1, //For ballot role
            user_lock_id:currentElectionRoleByVoter.user_lock_id
        };
        let hasGeoAllocations = false;
        switch(currentTabRoleSystemName){
            case this.electionRoleSytemNames.ministerOfFifty:
                 // Captain has households allocated
                if (currentElectionRoleByVoter.captain50_households.length > 0) {
                    hasGeoAllocations = true;
                }
                break;
            case this.electionRoleSytemNames.clusterLeader:
                // Cluster Leader has clusters allocated
                if (currentElectionRoleByVoter.activists_allocations_assignments.length > 0) {
                    hasGeoAllocations = true;
                }
                break;
            case this.electionRoleSytemNames.electionGeneralWorker:
                // General worker - not has geo allocations!
                break;
            default:
                // Activists has geo allocations
                let activists_allocations_assignments = currentElectionRoleByVoter.activists_allocations_assignments;
                if (activists_allocations_assignments && activists_allocations_assignments.length > 0) {
                    hasGeoAllocations = true;
                }
                break
        }
        newState.hasGeoAllocations = hasGeoAllocations;
        if ( currentTabRoleSystemName == this.electionRoleSytemNames.driver ) {
            let vehicle = {
                type: {
                    id: currentElectionRoleByVoter.transportation_car_type,
                    name: ''
                },

                number: (currentElectionRoleByVoter.transportation_car_number == null) ? '' : currentElectionRoleByVoter.transportation_car_number,
                seats: (currentElectionRoleByVoter.passenger_count == null) ? 1 : currentElectionRoleByVoter.passenger_count
            };

            switch (currentElectionRoleByVoter.transportation_car_type) {
                case this.driverCarTypes.regular:
                    vehicle.type.name = 'רכב רגיל';
                    break;

                case this.driverCarTypes.crippled:
                    vehicle.type.name = 'רכב הסעות מונגש';
                    break;

                default:
                    vehicle.type.name = '';
                    break;
            }

            newState.vehicle = vehicle;
        }
        this.setState(newState);
    }

    componentWillMount() {
        this.loadActivitDetails();
    }

    componentWillReceiveProps(nextProps) {
 
        let currentTabRoleId = this.props.currentTabRoleId;
        let nextCurrentTabRoleId = nextProps.currentTabRoleId;

        if ( nextCurrentTabRoleId != currentTabRoleId && nextCurrentTabRoleId != null ) {
            this.loadActivitDetails(nextProps);
        }

        if ( !this.props.savedRoleDetails && nextProps.savedRoleDetails ) {
            this.loadActivitDetails(nextProps);
        }
    }

    addNewPhone(phoneNumber) {
        this.setFormDirty();
        let phones = this.state.phones;

        phones.push({id: null, key: null, phone_number: phoneNumber});

        this.setState({phones});
    }

    setRolePhoneNumber(phoneIndex) {
        this.setState({rolePhoneNumber: this.state.phones[phoneIndex].phone_number});
        this.setFormDirty();
    }
    hideWarningPhoneDeletionModal(){
        this.warningPhoneDeletionModalHeader = '';
        this.setState({displayWarningPhoneDeletionModal: false});
    }
    showWarningPhoneDeletionModal(phoneIndex) {
        let phone = this.state.phones[phoneIndex];
        if (phone) {
            this.warningPhoneDeletionModalHeader = ' מחיקת טלפון ' + phone.phone_number;
            this.setState({ displayWarningPhoneDeletionModal: true, deletePhoneIndex: phoneIndex });
        }
    }
    deletePhoneFromState() {
        if (this.state.deletePhoneIndex > -1) {
            let phones = [...this.state.phones]
            let phoneDelete={...phones[this.state.deletePhoneIndex]}
            phoneDelete.isDelete=true;
            phones[this.state.deletePhoneIndex]=phoneDelete;
            this.setState({ phones })
            this.setFormDirty();
        }
        this.hideWarningPhoneDeletionModal();
    }

    renderPhones() {
        let that = this;

        if (this.props.activistIndexEdit == -1) {
            return;
        }

        let phones = (this.state.phones ? this.state.phones.map(function (phoneItem, index) {
            return !phoneItem.isDelete?<PhoneItem key={index} rolePhoneNumber={that.state.rolePhoneNumber} phoneIndex={index}
                item={phoneItem}
                setRolePhoneNumber={that.setRolePhoneNumber.bind(that)}
                showWarningPhoneDeletionModal={that.showWarningPhoneDeletionModal.bind(that)}
            />:null
        }) : null);

        return phones;
    }

    carTypeChange(event) {
        
        let vehicleFields = this.state.vehicle;
        let selectedItem = event.target.selectedItem;

        if ( null == selectedItem ) {
            vehicleFields.type.name = event.target.value;
            vehicleFields.type.id = null;
        } else {
            vehicleFields.type.name = selectedItem.name;
            vehicleFields.type.id = selectedItem.id;
        }
        this.setFormDirty();
        this.setState({vehicle: vehicleFields});
    }

    vehicleInputFieldChange(fieldName, event) {
        this.setFormDirty();

        let vehicle = this.state.vehicle;

        vehicle[fieldName] = event.target.value;

        this.setState({vehicle});
    }

    comboChange(fieldName, fieldIdName, event){
        this.setFormDirty();
        let newState = {... this.state};
        let fieldValue = event.target.value 
        
        let selectedItem = event.target.selectedItem
        // console.log(fieldName, fieldIdName, selectedItem, fieldValue)

        if(selectedItem){
            if(fieldIdName){ 
                newState[fieldIdName] = selectedItem.id; 
            }
        }else{
            newState[fieldIdName] = '';
        }
        newState[fieldName] = fieldValue;
        this.setState(newState);
    }
    inputFieldChange(fieldName, event) {
        this.setFormDirty();
        let fieldObj = {};
        fieldObj[fieldName] = event.target.value;
        this.setState(fieldObj);
    }

    assignCityChange(e){
        return; //!!  Can't change allocation city from here!
        // if (this.state.hasGeoAllocations) { return; }
        this.setFormDirty();
        let assigned_city_name = e.target.value;
        let assigned_city_id = e.target.selectedItem ? e.target.selectedItem.id : null;

        this.setState({assigned_city_name, assigned_city_id});
    }
    inputCheckboxChange(fieldName, event) {
        this.setFormDirty();
        let fieldObj = {};
        let isChecked = event.target.checked;
        fieldObj[fieldName] = isChecked ? 1 : 0;
        this.setState(fieldObj);
    }
    changeLockStatus() {
            let electionRoleByVoterKey = this.getCurrentElectionRoleByVoterKey();

            ElectionsActions.changeLockStatus(this.props.dispatch, this.state.bonus_key, this.props.currentUser, electionRoleByVoterKey).then(() => {
                this.loadActivitDetails();
            })
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

    validateVariables(isBallotRole) {
        let validInput = true;
        let isDriverRole = (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.driver);
        let isCaptainRole = (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ministerOfFifty);

        // if (!this.state.not_for_payment && !this.validateSum(this.state.sum) ) {
        //     validInput = false;
        //     this.sumInputStyle = {borderColor: this.invalidColor};
        // }
        // Is valid bonus:
        if ( isCaptainRole && this.state.bonus.length > 0 && !this.validateSum(this.state.bonus) ) {
            validInput = false;
            this.bonusInputStyle = {borderColor: this.invalidColor};
        }
        if ( !validateEmail(this.state.email) ) {
            validInput = false;
            this.emailInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateRolePhoneNumber(this.state.rolePhoneNumber) ) {
            validInput = false;
            this.rolePhoneNumberStyle = {borderColor: this.invalidColor};
        }
  

        if ( isDriverRole ) {
            if ( !this.validateCarType(this.state.vehicle.type.id) ) {
                validInput = false;
                this.carTypeStyle = {borderColor: this.invalidColor};
            }

            if ( !this.validateCarNumber(this.state.vehicle.number) ) {
                validInput = false;
                this.carNumberStyle = {borderColor: this.invalidColor};
            }

            if ( !this.validateCarSeats(this.state.vehicle.seats) ) {
                validInput = false;
                this.carSeatsStyle = {borderColor: this.invalidColor};
            }
        }
        
        return validInput;
    }

    initVariables() {
        this.sumInputStyle = {};
        this.bonusInputStyle = {};
        this.emailInputStyle = {};
        this.rolePhoneNumberStyle = {};

        this.carTypeStyle = {};
        this.carNumberStyle = {};
        this.carSeatsStyle = {};
    }
    setFormDirty(){
      this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.componentDirtyName });
    }
    renderBonusSection(){
        let hasEditBonusPermissions = this.props.currentUser.admin || this.props.currentUser.permissions["elections.activists.additional_payments"] ;
        let hasLockPermissions = this.props.currentUser.admin || this.props.currentUser.permissions["elections.activists.additional_payments.lock"] ;
        let isCaptainTab = this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ministerOfFifty;

        if( !isCaptainTab){ return null; }

        let isUserLock = this.state.bonus_user_lock_id ? true : false;
        let CanEdit = !isUserLock && hasEditBonusPermissions;
        let CanEditLock = this.state.bonus_key && hasLockPermissions;
        console.log('hasLockPermissions', hasLockPermissions, this.props.currentUser.permissions["elections.activists.additional_payments.lock"])
        return(
            <div className="form-group">
                <label htmlFor="inputModalSum-role-details" className="col-sm-3 control-label" style={this.bonusInputStyle}>בונוס</label>
                <div className="col-sm-9">
                    <input  type="text" className="form-control" id="inputModalSum-role-details" style={this.bonusInputStyle} disabled={!CanEdit}
                        value={this.state.bonus} onChange={CanEdit ? this.inputFieldChange.bind(this, 'bonus') : () => {}}
                        />
                </div>
                <label htmlFor="inputModalSum-role-details" className="col-sm-4 control-label" style={this.bonusInputStyle}>נעילת בונוס</label>
                <div className="col-sm-8">
                    <div className="checkbox locking">
                        <input type="checkbox" id="checkbox-locking-role-details" checked={isUserLock} disabled={!CanEditLock}
                                onChange={CanEditLock ? this.changeLockStatus.bind(this) : () => {} }
                        />
                        <label htmlFor="checkbox-locking-role-details">
                            <span className="icon-locking"></span>
                            <span className="text-label">
                                {isUserLock ? 'שחרר נעילת בונוס' : 'נעל בונוס'}
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        )
    }
    renderNotForPaySection(){
        let hasNotForPaymentPermissions = this.props.currentUser.admin || this.props.currentUser.permissions[`elections.activists.${this.props.currentTabRoleSystemName}.not_for_payment`] ;
        let canEdit = (!this.state.user_lock_id && hasNotForPaymentPermissions)
        return (
            <div className="form-group">
                <label htmlFor="checkboxNoForPay-role-details" className="col-sm-4 control-label" style={this.bonusInputStyle}>לא זכאי לתשלום</label>
                <div className="col-sm-8">
                    <div className="checkbox">
                        <input type="checkbox" id="checkboxNoForPay-role-details"  disabled={!canEdit} checked={this.state.not_for_payment}
                                onChange={canEdit ? this.inputCheckboxChange.bind(this, 'not_for_payment') : () => {} }
                        />
                    </div>
                </div>
            </div>
        )
    }
    render() {
        let isBallotRole = (this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ballotMember
            || this.props.currentTabRoleSystemName == this.electionRoleSytemNames.observer
            || this.props.currentTabRoleSystemName == this.electionRoleSytemNames.counter)
        this.initVariables();
        let isFormDirty = this.props.dirtyComponents.indexOf(this.componentDirtyName) != -1;
        let buttonDisabled = !isFormDirty || !this.validateVariables(isBallotRole) || this.props.savingChanges;

        let electionRoleByVoterKey = this.getCurrentElectionRoleByVoterKey();
        let baseUrl = window.Laravel.baseURL;
        
        let hasExportActivistsTotalPaymentPermissions = this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.export.total_payment_letter'] == true;

        let hasEdiSumPermissions = this.props.currentUser.admin || this.props.currentUser.permissions["elections.activists.search." + this.props.currentTabRoleSystemName + ".sum_edit"] == true;

        let firstRowClass = isBallotRole ? 'col-sm-7' : 'col-sm-11' ;

        return (
            <div id="roleDetails">
            <form className="form-horizontal">
                <div className="form-group">
                        <div className={firstRowClass}>
                            <label htmlFor="inputModalMobile-role-details" className="col-sm-4 control-label  no-padding">טלפון נייד <br />לאימות ולדווח </label>
                            <div className="col-sm-8 no-padding">
                                <input type="tel" id="inputModalMobile-role-details" className="form-control" style={this.rolePhoneNumberStyle}
                                    value={this.state.rolePhoneNumber}
                                    aria-describedby="helpBlock" readOnly />
                                <span id="helpBlock" className={"help-block" + (this.validateRolePhoneNumber(this.state.rolePhoneNumber) ? " hidden" : "")}>  {this.rolePhoneErrorText}</span>
                            </div>
   
                        </div>
       
                        {(isBallotRole ) && 
                            <div className="col-sm-3 no-padding">
                                <label htmlFor="inputInstructed-role-details" className="control-label" >עבר הדרכה</label>
                                <input type="checkbox" id="inputInstructed-role-details" className="checkbox-inline" style={{ marginRight: '10px' }}
                                    checked={this.state.instructed} onChange={this.inputCheckboxChange.bind(this, 'instructed')} />
                            </div>
                        }
                        <div className="col-sm-1 no-padding">
                            { hasExportActivistsTotalPaymentPermissions &&
                                <a href={baseUrl + 'api/elections/activists/' + electionRoleByVoterKey + '/export/total-payment' } 
                                  title="הדפסת טופס שכר פעיל" target="_blank" style={{cursor:'pointer'}}  ><img src={baseUrl + "Images/print.png"} /></a>
                                }
                         </div>
                </div>

                <div className="form-group">
                    {this.renderPhones()}
                </div>
                    <AddNewPhone
                        userLockId={this.state.user_lock_id}
                        phones={this.state.phones}
                        addNewPhone={this.addNewPhone.bind(this)}
                    />
                {(this.state.mobileLink) && <div className="form-group">
                    <label htmlFor="inputModalEmail-role-details" className="col-sm-3 control-label">לינק לדיווח הצבעות</label>
                    <div className="col-sm-9">
                        <input disabled={this.state.user_lock_id && this.state.user_lock_id!=''} type="text" className="form-control" readOnly id="inputModalEmail-role-details"
                               value={this.state.mobileLink}/>
                    </div>
                </div>}
                <div className="form-group">
                    <label htmlFor="inputModalEmail-role-details" className="col-sm-3 control-label" style={this.emailInputStyle}>אימייל</label>
                    <div className="col-sm-9">
                        <input disabled={this.state.user_lock_id && this.state.user_lock_id!=''} type="text" className="form-control" style={this.emailInputStyle} id="inputModalEmail-role-details"
                               value={this.state.email} onChange={this.inputFieldChange.bind(this, 'email')}/>
                    </div>
                </div>
                    <div className="form-group">
                        <label className="col-sm-3 control-label">עיר שיבוץ</label>
                        <div className="col-sm-9">
                            <label  className="col control-label">{this.state.assigned_city_name}</label>
                        </div>
                </div>
                {/* <div className="form-group">
                    <label htmlFor="inputModalSum-role-details" className="col-sm-3 control-label" style={this.sumInputStyle}>סכום</label>
                    <div className="col-sm-9">
                        <input disabled={(this.state.user_lock_id && this.state.user_lock_id!='') || !hasEdiSumPermissions || this.state.not_for_payment} 
                            type="text" className="form-control" style={this.sumInputStyle} id="inputModalSum-role-details"
                            value={this.state.sum} onChange={this.inputFieldChange.bind(this, 'sum')}
                            />
                    </div>
                </div> */}
                 
                 {/* {this.renderNotForPaySection()} */}
                 {/* {!this.state.not_for_payment && this.renderBonusSection()} */}

                {/* <div className="form-group">
                    <label htmlFor="inputModalComment-role-details" className="col-sm-3 control-label">הערה</label>
                    <div className="col-sm-9">
                        <textarea disabled={this.state.user_lock_id && this.state.user_lock_id!=''} className="form-control" rows="4" id="inputModalComment-role-details" value={this.state.comment}
                                  onChange={this.inputFieldChange.bind(this, 'comment')}/>
                    </div>
                </div> */}

                { ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.driver ) &&
                    <div className="form-group">
                        <label htmlFor="car-type-role-details" className="col-sm-3 control-label">סוג רכב</label>
                        <div className="col-sm-9">
                            <Combo items={this.carTypesCombo}
                                   id="car-type-role-details"
                                   maxDisplayItems={10}
                                   itemIdProperty="id"
                                   itemDisplayProperty="name"
                                   className="form-combo-table"
                                   inputStyle={this.carTypeStyle}
                                   value={this.state.vehicle.type.name}
                                   onChange={this.carTypeChange.bind(this)}
                            />
                        </div>
                    </div>
                }

                { ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.driver ) &&
                    <div className="form-group">
                        <label htmlFor="car-number-role-details" className="col-sm-3 control-label">מספר רכב</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control" id="car-number-role-details" style={this.carNumberStyle}
                                   value={this.state.vehicle.number}
                                   onChange={this.vehicleInputFieldChange.bind(this, 'number')}/>
                        </div>
                    </div>
                }

                {( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.driver ) &&
                    <div className="form-group">
                        <label htmlFor="seats-role-details" className="col-lg-3 control-label">מס' מושבים</label>
                        <div className="col-lg-4">
                            <input type="number" className="form-control" id="seats-role-details" style={this.carSeatsStyle}
                                   value={this.state.vehicle.seats}
                                   onChange={this.vehicleInputFieldChange.bind(this, 'seats')}/>
                        </div>
                    </div>
                }
                {(!this.state.user_lock_id || this.state.user_lock_id=='') &&
                <div className="btnRow">
                    <button title="שמור" type="submit" className="btn btn-success saveChanges" disabled={buttonDisabled}
                            onClick={this.editAllocation.bind(this)}>שמור</button>
                </div>
                }
            </form>
                <div className="modal-md">
                    <ModalWindow show={this.state.displayWarningPhoneDeletionModal}
                        buttonOk={this.deletePhoneFromState.bind(this)}
                        buttonCancel={this.hideWarningPhoneDeletionModal.bind(this)}
                        title={this.warningPhoneDeletionModalHeader}
                        style={{ zIndex: '9001' }}>
                        <div className="text-danger"> <span>מחיקת מספר תשפיע גם על כרטיס תושב</span> , <span>האם אתה בטוח/ה  ?</span></div>
                    </ModalWindow>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        activistDetails: state.elections.activistsScreen.activistDetails,
        voter_phones: state.elections.activistsScreen.activistDetails.voter_phones,
        electionRoles: state.elections.activistsScreen.electionRoles,
        savedRoleDetails: state.elections.activistsScreen.savedRoleDetails,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities
    }
}

export default connect(mapStateToProps) (RoleDetails);