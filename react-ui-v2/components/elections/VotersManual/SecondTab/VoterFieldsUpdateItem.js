import React from 'react';
import { connect } from 'react-redux';
import ReactWidgets from 'react-widgets';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import constants from 'libs/constants';
import {validatePhoneNumber, isLandPhone, isMobilePhone, validateEmail , parseDateToPicker, parseDateFromPicker} from 'libs/globalFunctions';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';


class VoterFieldsUpdateItem extends React.Component {
    constructor(props) {
        super(props);

        momentLocalizer(moment);

        this.state = {
            instituteRoles: []
        };

        this.initConstants();
    }

    initConstants() {
        this.emptyFieldObj = {id: null, name: ''};

        this.invalidColor = '#cc0000';

        this.driverCarTypes = constants.driverCarTypes;

        this.noTransport = -1;

        this.transportTypesArr = [
            {id: this.noTransport, name: 'ללא הסעה'},
            {id: constants.activists.driverCarTypes.regular, name: 'רגיל'},
            {id: constants.activists.driverCarTypes.crippled, name: 'מונגש'},
        ];

        this.labels = {
            city: 'עיר',
            street: 'רחוב',
            house: 'בית',
            entry: 'כניסה',
            flat: 'דירה',
            zip: 'מיקוד',

            transport: 'הסעה',
            fromTime: 'משעה',
            toTime: 'עד שעה',
            email: 'דוא"ל',
            mainPhone: 'מוביל',

            updateHouseholdStatus: 'שמור סטטוס לכל בית האב',
            updateHouseholdAddress: 'עדכן כתובת לכל בית האב',

            institute: 'מוסד',
            intituteRole: 'תפקיד במוסד'
        };
    }

    checkDuplicatePhone(dataFields) {

    }

    loadInstitutesRoles() {
        if ( this.props.item.newFieldsValues.institute.id == null ) {
            return;
        }

        let instituteIndex = this.props.institutes.findIndex(instituteItem => instituteItem.id == this.props.item.newFieldsValues.institute.id);
        if ( instituteIndex > -1 ) {
            this.loadInstituteRoles(this.props.institutes[instituteIndex].institute_type_id);
        }
    }

    renderPhone2(mobilePhones, landPhones) {
        if ( this.props.item.phones.length < 2 ) {
            return;
        }

        let dataFields = this.props.item.newFieldsValues;

        for ( let phoneIndex = 0; phoneIndex < mobilePhones.length; phoneIndex++ ) {
            if ( mobilePhones[phoneIndex].id != this.props.item.newFieldsValues.phone1.id ) {
                dataFields.phone2 = {
                    id: mobilePhones[phoneIndex].id,
                    key: mobilePhones[phoneIndex].key,
                    phone_number: mobilePhones[phoneIndex].phone_number,
                    voterPhoneIndex: mobilePhones[phoneIndex].voterPhoneIndex
                };

                this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
                return;
            }
        }

        for ( let phoneIndex = 0; phoneIndex < landPhones.length; phoneIndex++ ) {
            if ( landPhones[phoneIndex].id != this.props.item.newFieldsValues.phone1.id ) {
                dataFields.phone2 = {
                    id: landPhones[phoneIndex].id,
                    key: landPhones[phoneIndex].key,
                    phone_number: landPhones[phoneIndex].phone_number,
                    voterPhoneIndex: landPhones[phoneIndex].voterPhoneIndex
                };

                this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
                return;
            }
        }
    }

    renderPhone1(mobilePhones, landPhones) {
        let dataFields = this.props.item.newFieldsValues;

        switch (this.props.item.phones.length) {
            case 0:
                return;

            case 1:
                dataFields.phone1 = {
                    id: this.props.item.phones[0].id,
                    key: this.props.item.phones[0].key,
                    phone_number: this.props.item.phones[0].phone_number,
                    voterPhoneIndex: 0
                };

                dataFields.mainPhone = 1;
                break;

            default:
                let mainPhoneIndex = this.props.item.phones.findIndex(phoneItem => phoneItem.id == this.props.item.main_voter_phone_id);

                if ( mainPhoneIndex > -1 ) {
                    dataFields.phone1 = {
                        id: this.props.item.phones[mainPhoneIndex].id,
                        key: this.props.item.phones[mainPhoneIndex].key,
                        phone_number: this.props.item.phones[mainPhoneIndex].phone_number,
                        voterPhoneIndex: mainPhoneIndex
                    };

                    dataFields.mainPhone = 1;
                } else {
                    if ( mobilePhones.length > 0 ) {
                        dataFields.phone1 = {
                            id: mobilePhones[0].id,
                            key: mobilePhones[0].key,
                            phone_number: mobilePhones[0].phone_number,
                            voterPhoneIndex: mobilePhones[0].voterPhoneIndex
                        };

                        dataFields.mainPhone = 1;
                    } else {
                        dataFields.phone1 = {
                            id: landPhones[0].id,
                            key: landPhones[0].key,
                            phone_number: landPhones[0].phone_number,
                            voterPhoneIndex: landPhones[0].voterPhoneIndex
                        };

                        dataFields.mainPhone = 1;
                    }
                }
                break;
        }

        this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
    }

    buildPhoneArrays() {
        let landPhones = [];
        let mobilePhones = [];

        for ( let phoneIndex = 0; phoneIndex < this.props.item.phones.length; phoneIndex++ ) {
            if ( isLandPhone(this.props.item.phones[phoneIndex].phone_number) ) {
                landPhones.push(
                    {
                        id: this.props.item.phones[phoneIndex].id,
                        key: this.props.item.phones[phoneIndex].key,
                        phone_number: this.props.item.phones[phoneIndex].phone_number,
                        voterPhoneIndex: phoneIndex
                    }
                );
            } else if ( isMobilePhone(this.props.item.phones[phoneIndex].phone_number) ) {
                mobilePhones.push(
                    {
                        id: this.props.item.phones[phoneIndex].id,
                        key: this.props.item.phones[phoneIndex].key,
                        phone_number: this.props.item.phones[phoneIndex].phone_number,
                        voterPhoneIndex: phoneIndex
                    }
                );
            }
        }

        return {landPhones, mobilePhones};
    }

    componentWillMount() {
        let phoneObj = this.buildPhoneArrays();
        let mobilePhones = phoneObj.mobilePhones;
        let landPhones = phoneObj.landPhones;

        this.renderPhone1(mobilePhones, landPhones);
        this.renderPhone2(mobilePhones, landPhones);

        this.loadInstitutesRoles();
        this.loadStreets();
    }

    getCityKey(cityId) {
        let cityIndex = this.props.userFilteredCities.findIndex(cityItem => cityItem.id == cityId);

        return this.props.userFilteredCities[cityIndex].key;
    }

    loadStreets() {
        if ( this.props.item.newFieldsValues.city.id != null ) {
            ElectionsActions.loadCityStreetsForVotersManual(this.props.dispatch, this.getCityKey(this.props.item.newFieldsValues.city.id));
        }
    }

    updateSelectedVoterNewFieldsValues(dataFields) {
        dataFields.valid = this.validateFieldsB4UpdatingParent(dataFields);

        this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
    }

    checkboxChange(fieldName) {
        let dataFields = this.props.item.newFieldsValues;

        dataFields[fieldName] = !this.props.item.newFieldsValues[fieldName];
        this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
    }

    radioMainPhoneChange(fieldValue) {
        let dataFields = this.props.item.newFieldsValues;

        dataFields.mainPhone = fieldValue;
        this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
    }

    toTimeChange(value, filter) {
        let dataFields = this.props.item.newFieldsValues;
        dataFields.to_time = value;

        this.updateSelectedVoterNewFieldsValues(dataFields);
    }

    fromTimeChange(value, filter) {
        let dataFields = this.props.item.newFieldsValues;
        dataFields.from_time = value;

        this.updateSelectedVoterNewFieldsValues(dataFields);
    }

    actualAddressCorrectChange(fieldValue) {
        let dataFields = this.props.item.newFieldsValues;
        dataFields.actual_address_correct = fieldValue;

        this.props.updateSelectedVoterNewFieldsValues(this.props.voterIndex, dataFields);
    }

    deleteFieldInput(fieldName) {
        let dataFields = this.props.item.newFieldsValues;

        if ( 'phone1' == fieldName || 'phone2' == fieldName ) {
            dataFields[fieldName].phone_number = '';

            let mainNum = ('phone1' == fieldName) ? 1 : 2;

            if (  dataFields.mainPhone == mainNum ) {
                if (!this.validatePhone(fieldName, dataFields[fieldName].phone_number) || dataFields[fieldName].phone_number.length == 0) {
                    dataFields.mainPhone = null;
                }
            }
        } else {
            dataFields[fieldName] = '';
        }

        this.updateSelectedVoterNewFieldsValues(dataFields);
    }

    inputFieldChange(fieldName, event) {
        let dataFields = this.props.item.newFieldsValues;

            if ( 'phone1' == fieldName || 'phone2' == fieldName ) {
                dataFields[fieldName].phone_number = event.target.value;

                let mainNum = ('phone1' == fieldName) ? 1 : 2;

                if (  dataFields.mainPhone == mainNum ) {
                    if (!this.validatePhone(fieldName, dataFields[fieldName].phone_number) || dataFields[fieldName].phone_number.length == 0) {
                        dataFields.mainPhone = null;
                    }
                }
            } else{
                dataFields[fieldName] = event.target.value;
            }

        this.updateSelectedVoterNewFieldsValues(dataFields);
    }

    loadInstituteRoles(instituteTypeId) {
        let instituteRoles = this.props.instituteRoles.filter(instituteRoleItem => instituteRoleItem.institute_type_id == instituteTypeId);
        this.setState({instituteRoles});
    }

    comboValueChange(fieldName, event) {
        let selectedItem = event.target.selectedItem;
        let dataFields = this.props.item.newFieldsValues;

        if ( null == selectedItem ) {
            dataFields[fieldName] = {...this.emptyFieldObj, name: event.target.value};
        } else {
            dataFields[fieldName] = {
                id: selectedItem.id,
                name: selectedItem.name
            };
        }
        switch (fieldName) {
            case 'city':
                dataFields.street = {...this.emptyFieldObj};

                if (dataFields.city.id == null) {
                    this.props.dispatch({ type: ElectionsActions.ActionTypes.VOTERS_MANUAL.RESET_STREETS});
                } else {
                    ElectionsActions.loadCityStreetsForVotersManual(this.props.dispatch, selectedItem.key);
                }
                break;

            case 'institute':
                dataFields.institute_role = {...this.emptyFieldObj};

                if (dataFields.institute.id == null) {
                    this.setState({instituteRoles: []});
                } else {
                    this.loadInstituteRoles(selectedItem.institute_type_id);
                }
                break;
        }

        this.updateSelectedVoterNewFieldsValues(dataFields);
    }

    isDuplicatePhone( fieldName, phoneObj = null ) {
        let phoneNumber = (null == phoneObj) ? this.props.item.newFieldsValues[fieldName].phone_number : phoneObj.phone_number;
        let voterPhoneIndex = (null == phoneObj) ? this.props.item.newFieldsValues[fieldName].voterPhoneIndex : phoneObj.voterPhoneIndex;

        phoneNumber = phoneNumber.split('-').join('');

        for ( let phoneIndex = 0; phoneIndex < this.props.item.phones.length; phoneIndex++ ) {
            let phoneTOCompare = this.props.item.phones[phoneIndex].phone_number.split('-').join('');

            if ( voterPhoneIndex != phoneIndex && phoneTOCompare == phoneNumber ) {
                return true;
            }
        }

        return false;
    }

    validatePhone(fieldName, fieldValue = null) {
        let fieldPhone = (null == fieldValue) ? this.props.item.newFieldsValues[fieldName].phone_number : fieldValue;

        if ( fieldPhone.length == 0 ) {
            return true;
        } else {
            let phoneToCheck = fieldPhone.split('-').join('');

            return ( validatePhoneNumber(phoneToCheck) );
        }
    }

    validateEmail(fieldValue = null) {
        let email = (null == fieldValue) ? this.props.item.newFieldsValues.email : fieldValue;

        if ( 0 == email.length ) {
            return true;
        }

        return validateEmail(email);
    }

    validateTime(fieldName, fieldValue = null) {
        let fieldTime = (null == fieldValue) ? this.props.item.newFieldsValues[fieldName] : fieldValue;

        if (!fieldTime ||  fieldTime.length == 0  ) {
            return true;
        } else {
            return moment(fieldTime, 'HH:mm', true).isValid();
        }
    }

    validateZip(fieldValue = null) {
        var zip = (null == fieldValue) ? this.props.item.newFieldsValues.zip : fieldValue;

        if ( 0 == zip.length ) {
            return true;
        }

        let regExp1 = /^[0-9]{5}$/;
        let regExp2 = /^[0-9]{7}$/;

        if ( regExp1.test(zip) || regExp2.test(zip) ) {
            return true;
        } else {
            return false;
        }
    }

    validateFlat(fieldValue = null) {
        var flat = (null == fieldValue) ? this.props.item.newFieldsValues.flat : fieldValue;

        if ( 0 == flat.length ) {
            return true;
        }

        let regExp = /^\d+/;

        return regExp.test(flat);
    }

    validateComboField(fieldName, fieldObj = null) {
        let fieldId = (null == fieldObj) ? this.props.item.newFieldsValues[fieldName].id : fieldObj.id;
        let name = (null == fieldObj) ? this.props.item.newFieldsValues[fieldName].name : fieldObj.name;

        if ( name.length == 0 ) {
            return true;
        } else {
            return (fieldId != null);
        }
    }

    validateFieldsB4UpdatingParent(dataFields) {
        if ( !this.validateComboField('city', dataFields.city) ) {
            return false;
        }

        if ( !this.validateComboField('street', dataFields.street) ) {
            return false;
        }

        if ( !this.validateFlat(dataFields.flat) ) {
            return false;
        }

        if ( !this.validateTime('from_time', dataFields.from_time) ) {
            return false;
        }

        if ( !this.validateTime('to_time', dataFields.to_time) ) {
            return false;
        }

        if ( !this.validateEmail(dataFields.email) ) {
            return false;
        }

        if ( !this.validatePhone('phone1', dataFields.phone1.phone_number) ) {
            return false;
        } else if ( this.isDuplicatePhone('phone1', dataFields.phone1) ) {
            return false;
        }

        if ( !this.validatePhone('phone2', dataFields.phone2.phone_number) ) {
            return false;
        } else if ( this.isDuplicatePhone('phone2', dataFields.phone2) ) {
            return false;
        }

        if ( !this.validateComboField('institute', dataFields.institute) ) {
            return false;
        }

        if ( !this.validateComboField('institute_role', dataFields.institute_role) ) {
            return false;
        }

        if ( dataFields.cripple.id == null ) {
            if ( dataFields.from_time != null || dataFields.to_time != null ) {
                return false;
            }
        }

        if ( dataFields.from_time == null ) {
            if ( dataFields.cripple.id != null || dataFields.to_time != null ) {
                return false;
            }
        }

        if ( dataFields.to_time == null ) {
            if ( dataFields.cripple.id != null || dataFields.from_time != null ) {
                return false;
            }
        }

        if ( dataFields.institute.id != null && dataFields.institute_role.id == null ) {
            return false;
        }

        let phone1Number = dataFields.phone1.phone_number.split('-').join('');
        let phone2Number = dataFields.phone2.phone_number.split('-').join('');
        if ( phone1Number && phone2Number && phone1Number == phone2Number ) {
            this.phone1InputStyle = {borderColor: this.invalidColor};
            this.phone2InputStyle = {borderColor: this.invalidColor};
        }

        return true;
    }

    validateVariables() {
        if ( !this.validateComboField('city') ) {
            this.cityInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateComboField('street') ) {
            this.streetInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateFlat() ) {
            this.flatInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateZip() ) {
            this.zipInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateZip() ) {
            this.zipInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateTime('from_time') ) {
            this.fromTimeInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateTime('to_time') ) {
            this.toTimeInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateEmail() ) {
            this.emailInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validatePhone('phone1') ) {
            this.phone1InputStyle = {borderColor: this.invalidColor};
        } else if ( this.isDuplicatePhone('phone1') ) {
            this.phone1InputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validatePhone('phone2') ) {
            this.phone2InputStyle = {borderColor: this.invalidColor};
        } else if ( this.isDuplicatePhone('phone2') ) {
            this.phone2InputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateComboField('institute') ) {
            this.instituteInputStyle = {borderColor: this.invalidColor};
        }

        if ( !this.validateComboField('institute_role') ) {
            this.instituteRoleInputStyle = {borderColor: this.invalidColor};
        }

        if ( this.props.item.newFieldsValues.cripple.id == null ) {
            if ( this.props.item.newFieldsValues.from_time != null || this.props.item.newFieldsValues.to_time != null ) {
                this.transportInputStyle = {borderColor: this.invalidColor};
            }
        }

        if ( this.props.item.newFieldsValues.from_time == null ) {
            if ( this.props.item.newFieldsValues.cripple.id != null || this.props.item.newFieldsValues.to_time != null ) {
                this.fromTimeInputStyle = {borderColor: this.invalidColor};
            }
        }

        if ( this.props.item.newFieldsValues.to_time == null ) {
            if ( this.props.item.newFieldsValues.cripple.id != null || this.props.item.newFieldsValues.from_time != null ) {
                this.toTimeInputStyle = {borderColor: this.invalidColor};
            }
        }

        if ( this.props.item.newFieldsValues.institute.id != null && this.props.item.newFieldsValues.institute_role.id == null ) {
            this.instituteRoleInputStyle = {borderColor: this.invalidColor};
        }

        let phone1Number = this.props.item.newFieldsValues.phone1.phone_number.split('-').join('');
        let phone2Number = this.props.item.newFieldsValues.phone2.phone_number.split('-').join('');
        if ( phone1Number == phone2Number ) {
            this.phone1InputStyle = {borderColor: this.invalidColor};
            this.phone2InputStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.cityInputStyle = {};
        this.streetInputStyle = {};
        this.flatInputStyle = {};
        this.zipInputStyle = {};

        this.transportInputStyle = {};
        this.fromTimeInputStyle = {};
        this.toTimeInputStyle = {};

        this.phone1InputStyle = {};
        this.phone2InputStyle = {};

        this.emailInputStyle = {};

        this.instituteInputStyle = {};
        this.instituteRoleInputStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();
        let newFieldsValues = this.props.item.newFieldsValues;
        return (
            <tr className={"voters-manual-update-item" + (this.props.item.collapsed ? ' hidden' : '')}
                aria-expanded={!this.props.item.collapsed}>
                <td colSpan="12" className="voter-details-erea">
                    <div className="row voter-details-erea">
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-city"} className="control-label" style={{marginLeft: '118px'}}>
                                    {this.labels.city}
                                </label>
                                <Combo id={this.props.item.key + "-city"}
                                       items={this.props.userFilteredCities}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       maxDisplayItems={10}
                                       inputStyle={this.cityInputStyle}
                                       value={newFieldsValues.city.name}
                                       className="form-combo-table"
                                       onChange={this.comboValueChange.bind(this, 'city')}/>
                            </div>
                        </div>

                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-street"} className="control-label" style={{marginLeft: '103px'}}>
                                    {this.labels.street}
                                </label>
                                <Combo id={this.props.item.key + "-street"}
                                       items={this.props.streets}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       maxDisplayItems={10}
                                       inputStyle={this.streetInputStyle}
                                       value={newFieldsValues.street.name}
                                       className="form-combo-table"
                                       onChange={this.comboValueChange.bind(this, 'street')}/>
                            </div>
                        </div>

                        <div className="col-lg-1">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-house"} className="control-label" style={{marginLeft: '30px'}}>
                                    {this.labels.house}
                                </label>
                                <input type="text" className="form-control" id={this.props.item.key + "-house"}
                                       value={newFieldsValues.house}
                                       onChange={this.inputFieldChange.bind(this, 'house')} aria-describedby="house"/>
                            </div>
                        </div>                        
                        <div className="col-lg-1">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "entrance"} className="control-label" style={{marginLeft: '15px'}}>
                                    {this.labels.entry}
                                </label>
                                <input type="text" className="form-control" id={this.props.item.key + "entrance"}
                                       value={newFieldsValues.house_entry}
                                       onChange={this.inputFieldChange.bind(this, 'house_entry')} aria-describedby="entrance"/>
                            </div>
                        </div>

                        <div className="col-lg-1">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-apartment"} className="control-label" style={{marginLeft: '25px'}}>
                                    {this.labels.flat}
                                </label>
                                <input type="text" className="form-control" id={this.props.item.key + "-apartment"}
                                       style={this.flatInputStyle} value={newFieldsValues.flat}
                                       onChange={this.inputFieldChange.bind(this, 'flat')} aria-describedby="apartment"/>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-postal-code"} className="control-label" style={{marginLeft: '20px'}}>
                                    {this.labels.zip}
                                </label>
                                <input type="text" className="form-control" id={this.props.item.key + "-postal-code"}
                                       style={this.zipInputStyle} value={newFieldsValues.zip}
                                       onChange={this.inputFieldChange.bind(this, 'zip')} aria-describedby="postal-code"/>
                            </div>
                        </div>

                        <div className="col-lg-3">
                            <label style={{width: '100%', textAlign: 'right'}}>סטטוס כתובת</label>
                            <div className="radio-button-switch">
                                <input name="switch" id="two" className="two" type="radio"
                                       defaultChecked={newFieldsValues.actual_address_correct == null}/>
                                <label htmlFor="two" className="label-two">
                                    <span className="netrali">
                                        <span className="reset" onClick={this.actualAddressCorrectChange.bind(this, null)}>איפוס</span>
                                    </span>
                                </label>
                                <input name="switch" id="one" className="one" type="radio"
                                       defaultChecked={newFieldsValues.actual_address_correct == 1}/>
                                <label htmlFor="one" className="label-one">
                                    <span className="on flexed">
                                        <span onClick={this.actualAddressCorrectChange.bind(this, 1)}>מאומת</span>
                                        <span className="icon-ok" onClick={this.actualAddressCorrectChange.bind(this, 1)}/>
                                    </span>
                                </label>

                                <input name="switch" id="three" className="three" type="radio"
                                       defaultChecked={newFieldsValues.actual_address_correct == 0}/>
                                <label htmlFor="three" className="label-three">
                                    <span className="off flexed">
                                        <span className="icon-no" onClick={this.actualAddressCorrectChange.bind(this, 0)}/>
                                        <span onClick={this.actualAddressCorrectChange.bind(this, 0)}>שגוי</span>
                                    </span>
                                </label>
                                <div/>
                                <i/>
                            </div>
                            <span data-toggle="tooltip" data-placement="left" title="" className="tooltip-icon"
                                  data-original-title="כתובת משרד הפנים הועתקה לשדות כתובות בפועל במקום הכתובת השגויה"/>
                        </div>
                    </div>

                    <div className="row voter-details-erea">
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-transportation"} className="control-label"
                                       style={{marginLeft: '103px'}}>
                                    {this.labels.transport}
                                </label>
                                <Combo id={this.props.item.key + "-transportation"}
                                       items={this.transportTypesArr}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       maxDisplayItems={10}
                                       inputStyle={this.transportInputStyle}
                                       value={newFieldsValues.cripple.name}
                                       className="form-combo-table"
                                       onChange={this.comboValueChange.bind(this, 'cripple')}/>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-from-hour"} className="control-label" style={{marginLeft: '98px'}}>
                                    {this.labels.fromTime}
                                </label>
                                <ReactWidgets.DateTimePicker
                                    isRtl={true} time={true} calendar={false}
                                    value={parseDateToPicker(newFieldsValues.from_time)}
                                    onChange={parseDateFromPicker.bind(this, {callback: this.fromTimeChange,
                                                                              format: "HH:mm",
                                                                              functionParams: 'dateTime'})}
							        timeFormat="HH:mm"
                                    format="HH:mm"
                                    id={this.props.item.key + "-from-hour"}
                                    style={this.fromTimeInputStyle}
                                />
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-to-hour"} className="control-label" style={{marginLeft: '87px'}}>
                                    {this.labels.toTime}
                                </label>
                                <ReactWidgets.DateTimePicker
                                    isRtl={true} time={true} calendar={false}
                                    value={parseDateToPicker(newFieldsValues.to_time)}
                                    onChange={parseDateFromPicker.bind(this, {callback: this.toTimeChange,
                                                                              format: "HH:mm",
                                                                              functionParams: 'dateTime'})}
									timeFormat="HH:mm"
                                    format="HH:mm"
                                   
                                />
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <div className="form-group radios lead-radio">
                                    <label htmlFor={this.props.item.key + "optionsRadios1"} className="control-label radio"
                                           style={{marginTop: '0'}}>
                                        <input type="radio" name="optionsRadios" id={this.props.item.key + "optionsRadios1"}
                                               disabled={!this.validatePhone('phone1') || newFieldsValues.phone1.phone_number.length == 0}
                                               checked={newFieldsValues.mainPhone == 1}
                                               onChange={this.radioMainPhoneChange.bind(this, 1)}/>
                                        {this.labels.mainPhone}
                                    </label>
                                </div>
                                <label htmlFor={this.props.item.key + "phone1"} className="control-label" style={{marginLeft: '86px'}}>טלפון 1</label>
                                <input type="text" className="form-control" id={this.props.item.key + "phone1"} style={this.phone1InputStyle}
                                       value={newFieldsValues.phone1.phone_number}
                                       onChange={this.inputFieldChange.bind(this, 'phone1')} aria-describedby="phone1"/>
                                    <div className="delete-text-field" onClick={this.deleteFieldInput.bind(this, 'phone1')}/>
                            </div>
                        </div>

                        <div className="col-lg-2">
                            <div className="form-group">
                                <div className="form-group radios lead-radio">
                                    <label htmlFor={this.props.item.key + "optionsRadios2"} className="control-label radio" style={{marginTop: '0'}}>
                                        <input type="radio" name="optionsRadios" id={this.props.item.key + "optionsRadios2"}
                                               disabled={!this.validatePhone('phone2') ||
                                                         newFieldsValues.phone2.phone_number.length == 0
                                                        }
                                               checked={newFieldsValues.mainPhone == 2}
                                               onChange={this.radioMainPhoneChange.bind(this, 2)}/>
                                        {this.labels.mainPhone}
                                    </label>
                                </div>
                                <label htmlFor={this.props.item.key + "phone2"} className="control-label" style={{marginLeft: '86px'}}>טלפון 2</label>
                                <input type="text" className="form-control" id={this.props.item.key + "phone2"} style={this.phone2InputStyle}
                                       value={newFieldsValues.phone2.phone_number}
                                       onChange={this.inputFieldChange.bind(this, 'phone2')} aria-describedby="phone2"/>
                                    <div className="delete-text-field" onClick={this.deleteFieldInput.bind(this, 'phone2')}/>
                            </div>
                        </div>

                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key +"-email"} className="control-label" style={{marginLeft: '101px'}}>
                                    {this.labels.email}
                                </label>
                                <input type="text" className="form-control" id={this.props.item.key +"-email"}
                                       style={this.emailInputStyle} value={newFieldsValues.email}
                                       onChange={this.inputFieldChange.bind(this, 'email')} aria-describedby="email"/>
                                    <div className="delete-text-field" onClick={this.deleteFieldInput.bind(this, 'email')}/>
                            </div>
                        </div>
                    </div>
                    <div className="row voter-details-erea">
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">עדה</label>
                                <Combo items={this.props.ethnicGroups} maxDisplayItems={5} value={newFieldsValues.ethnic_group.name || ''} 
                                onChange={this.comboValueChange.bind(this, 'ethnic_group')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">זרם</label>
                                <Combo items={this.props.religiousGroups} maxDisplayItems={5} value={newFieldsValues.religious_group.name || '' } 
                                    onChange={this.comboValueChange.bind(this, 'religious_group')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">ספרדי</label>
                                <Combo items={[{ id: 0, name: 'לא' }, { id: 1, name: 'כן' }]} maxDisplayItems={5} value={newFieldsValues.sephardi.name || ''} 
                                onChange={this.comboValueChange.bind(this, 'sephardi')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                    </div>
                    <div className="row voter-details-erea">
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-institute"} className="control-label"
                                       style={{marginLeft: '104px'}}>
                                    {this.labels.institute}
                                </label>
                                <Combo id={this.props.item.key + "-institute"}
                                       items={this.props.institutes}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       maxDisplayItems={10}
                                       inputStyle={this.instituteInputStyle}
                                       value={newFieldsValues.institute.name}
                                       className="form-combo-table"
                                       disabled={this.props.massUpdate.instituteData.institute_id != null}
                                       onChange={this.comboValueChange.bind(this, 'institute')}/>
                            </div>
                        </div>

                        <div className="col-lg-2">
                            <div className="form-group">
                                <label htmlFor={this.props.item.key + "-intitute-role"} className="control-label"
                                       style={{marginLeft: '51px'}}>
                                    {this.labels.intituteRole}
                                </label>
                                <Combo id={this.props.item.key + "-intitute-role"}
                                       items={this.state.instituteRoles}
                                       itemIdProperty="id"
                                       itemDisplayProperty="name"
                                       maxDisplayItems={10}
                                       inputStyle={this.instituteRoleInputStyle}
                                       value={newFieldsValues.institute_role.name}
                                       className="form-combo-table"
                                       disabled={this.props.massUpdate.instituteData.institute_role_id != null}
                                       onChange={this.comboValueChange.bind(this, 'institute_role')}/>
                            </div>
                        </div>

                        <div className="col-lg-3 col-lg-push-2 margin-top30">
                            <label className="checkbox" style={{marginTop: '4px'}}>
                                <input type="checkbox" checked={newFieldsValues.updateHouseholdAddress}
                                       onChange={this.checkboxChange.bind(this, 'updateHouseholdAddress')}/>
                                {this.labels.updateHouseholdAddress}
                            </label>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
        userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities,
        streets: state.elections.votersManualScreen.combos.streets,

        institutes: state.elections.votersManualScreen.combos.institutes,
        instituteRoles: state.elections.votersManualScreen.combos.instituteRoles,

        ethnicGroups: state.elections.general.ethnicGroups,
        religiousGroups: state.elections.general.religiousGroups,
    };
}

export default connect(mapStateToProps) (VoterFieldsUpdateItem);