import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import ModalWindow from '../../../../global/ModalWindow';
import Combo from '../../../../global/Combo';
import store from '../../../../../store';
import { validatePhoneNumber, validateEmail, parseDateToPicker, parseDateFromPicker, isValidComboValue,findElementByAttr } from '../../../../../libs/globalFunctions';
import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

class CaptainFiftyRelatedVoterRowItemEdit extends React.Component {
    wrongAddressText = 'כתובת משרד הפנים הועתקה לשדות כתובות בפועל במקום הכתובת השגויה';
    constructor(props) {
        super(props);
        momentLocalizer(moment);
    }

	/*
	Handle change in time of calendars : 
	*/
    handleDateTime(currentValue, valueType, params) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE, rowIndex: this.props.index, fieldName: params.timeType, fieldValue: currentValue });
    }

	/*
	Handle clear phone number (x button icon) - first or second : 
	*/
    clearPhoneNumber(fieldName) {
        this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE,rowIndex: this.props.index, fieldName, fieldValue: '' });
    }

	/*
	Do real save of voter via api call :
	*/
    saveVoterData(rowIndex) {
        let editedRow = this.props.reportSearchResults[rowIndex];
        let data = {};
        // console.log(editedRow);
        data.sephardi = editedRow.sephardi;
        data.ethnic_group_id = editedRow.ethnic_group_id;
        data.religious_group_id = editedRow.religious_group_id;
        data.comment = editedRow.comment;
        data.not_at_home = editedRow.not_at_home;
        data.additional_care = editedRow.additional_care;
        data.street = editedRow.street;
        data.city_name = editedRow.city_name;
        data.support_status_name = editedRow.support_status_name;
        data.house = editedRow.house;
        data.house_entry = editedRow.house_entry;
        data.flat = editedRow.flat;
        data.zip = editedRow.zip;
        data.email = editedRow.email;
        data.actual_address_correct = editedRow.actual_address_correct;
        data.support_status_key = null;
        data.previous_support_status_key = null;
        if (editedRow.household_update_support_status == '1') {
            data.household_update_support_status = '1';
        }
        if (editedRow.household_update_additional_care == '1') {
            data.household_update_additional_care = '1';
        }
        if (editedRow.household_update_contact_info == '1') {
            data.household_update_contact_info = '1';
        }
        if (editedRow.household_update_actual_address == '1') {
            data.household_update_actual_address = '1';
        }
        if (editedRow.household_update_not_at_home == '1') {
            data.household_update_not_at_home = '1';
        }

        if (editedRow.first_phone == undefined) {
            if (editedRow.voter_phones.length >= 1) {
                data.first_phone = editedRow.voter_phones[0].phone_number;
            }
            else {

                data.first_phone = '';
            }
        }
        else {
            data.first_phone = editedRow.first_phone;
        }

        if (editedRow.second_phone == undefined) {
            if (editedRow.voter_phones.length >= 2) {
                data.second_phone = editedRow.voter_phones[1].phone_number;
            }
            else {

                data.second_phone = '';
            }
        }
        else {
            data.second_phone = editedRow.second_phone;
        }

        if (editedRow.voter_transportations_id) {
            if (editedRow.voter_transportations_id) {
                data.voter_transportations_id = editedRow.voter_transportations_id;
                data.from_time = editedRow.from_time;
                data.to_time = editedRow.to_time;
                data.crippled = editedRow.crippled;
            }
        }


        if (editedRow.mainPhoneID) {
            data.main_phone_id = editedRow.mainPhoneID;
        }
        //mainPhoneID
        for (let i = 0; i < this.props.supportStatuses.length; i++) {
            if (this.props.supportStatuses[i].name == editedRow.support_status_name) {
                data.support_status_key = this.props.supportStatuses[i].key;
            }
            if (this.props.supportStatuses[i].name == editedRow.previous_support_status_name) {
                data.previous_support_status_key = this.props.supportStatuses[i].key;
            }
        }
        let selectedCityName = editedRow.city_name;
        let newCityData = null;
        let newStreetData = null;
        for (let i = 0; i < this.props.cities.length; i++) {

            if (this.props.cities[i].name == selectedCityName) {
                newCityData = this.props.cities[i];
                break;
            }
        }
        if (newCityData) {
            data.city_key = newCityData.key;
            if (editedRow.street) {
                for (let i = 0; i < this.props.captain50WalkerReport.dynamicStreets.length; i++) {
                    if (this.props.captain50WalkerReport.dynamicStreets[i].name == editedRow.street) {
                        newStreetData = this.props.captain50WalkerReport.dynamicStreets[i];
                        break;
                    }
                }
            }

            if (newStreetData) {
                data.street_key = newStreetData.key;
            }
            else {
                data.street_key = null;
            }
        }
        ElectionsActions.updateVoterByKeyInCap50Report(this.props.dispatch, editedRow.voter_key, data, this.props.index);
        this.props.saveOldData(this.props.index);

    }

	/*
	init dynamic variable for render() function
	*/
    initDynamicVariables() {
        this.isValidatedRow = true;
        this.isValidCityName = isValidComboValue(this.props.cities, this.props.item.city_name, 'name');
        if (this.props.item.city_name) {
            this.isValidCityName = isValidComboValue(this.props.cities, this.props.item.city_name, 'name');
        }
        this.isValidatedRow = this.isValidatedRow && this.isValidCityName;
        this.isValidStreet = true;
        if (this.props.item.street) {
            this.isValidStreet = isValidComboValue(this.props.captain50WalkerReport.dynamicStreets, this.props.item.street, 'name', true);
        }

        this.isValidatedFirstPhone = !this.props.item.first_phone || validatePhoneNumber(this.props.item.first_phone);
        this.isValidatedSecondPhone = !this.props.item.second_phone || validatePhoneNumber(this.props.item.second_phone);
        this.isValidatedEmail = !this.props.item.email || validateEmail(this.props.item.email);
        this.isValidatedRow = this.isValidatedRow && this.isValidatedFirstPhone && this.isValidatedSecondPhone && this.isValidatedEmail;
        this.isValidSupportStatus = isValidComboValue(this.props.supportStatuses, this.props.item.support_status_name, 'name', true);
        this.isValidPreviousSupportStatus = isValidComboValue(this.props.supportStatuses, this.props.item.previous_support_status_name, 'name', true);
        this.isValidatedRow = this.isValidatedRow && this.isValidSupportStatus;

        if (this.props.item.voter_transportation_type_name == undefined || this.props.item.voter_transportation_type_name == null) {
            if (!this.props.item.voter_transportations_id) {
                this.props.item.voter_transportation_type_name = "ללא הסעה";
            }
            else {
                if (this.props.item.crippled == '1') {
                    this.props.item.voter_transportation_type_name = "הסעת נכה";
                }
                else {
                    this.props.item.voter_transportation_type_name = "הסעה רגילה";
                }
            }
        }
        this.globalHouseholdUpdatesCount = 0;
        if (this.props.item.household_update_support_status == '1') this.globalHouseholdUpdatesCount++;
        if (this.props.item.household_update_additional_care == '1') this.globalHouseholdUpdatesCount++;
        if (this.props.item.household_update_contact_info == '1') this.globalHouseholdUpdatesCount++;
        if (this.props.item.household_update_actual_address == '1') this.globalHouseholdUpdatesCount++;
        if (this.props.item.household_update_not_at_home == '1') this.globalHouseholdUpdatesCount++;

        this.previousSupportStatusItem = null;
        if (this.props.captain50WalkerReport.showPreviousSupportStatus) {
            this.previousSupportStatusItem = <div className="form-group">
                <label>סטטוס בחירות קודמות</label>
                <Combo items={this.props.supportStatuses} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={this.props.item.previous_support_status_name}
                    onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'previous_support_status_name')} disabled={true} />
                    {/* inputStyle={{ borderColor: (this.isValidPreviousSupportStatus ? '#ccc' : '#ff0000') }} disabled={true} /> */}
                     
            </div>;
        }
    }

    /*
	   Empty function on change event handlers that does nothing
	*/
    doNoOperation(e) {}
    changeAddressStatus(addressStatus,e){
        let self=this;
        this.props.editFieldValueChange(this.props.index, addressStatus, e);
        if (addressStatus == 'actual_address_correct0') {
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.RESTORE_TO_MI_ADDRESS, rowIndex: this.props.index })
            let voterRow = this.props.reportSearchResults[this.props.index];
            if (voterRow.mi_city_id && voterRow.city_id != voterRow.mi_city_id) {
                let city = findElementByAttr(this.props.cities, 'id', voterRow.mi_city_id)
                ElectionsActions.loadStreetsByCityKey(this.props.dispatch, city.key);
            }
            setTimeout(() => {
                self.props.editFieldValueChange(self.props.index, 'actual_address_correctNULL');
            }, 1000);
        }
    }
    render() {
        this.initDynamicVariables();
        let item = this.props.item;
        // console.log(this.props.item);
        let sephardi = item.sephardi != null ? (item.sephardi == 1? 'כן' : 'לא') : '';
        return (
            <tr style={{ textAlign: 'right' }}>
                <td colSpan="15" className="collapse-td">
                    <div className="row no-margin">
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-12">עיר</label>
                                <Combo items={this.props.cities} value={this.props.item.city_name} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'city_name')} inputStyle={{ borderColor: (this.isValidCityName ? '#ccc' : '#ff0000') }} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label>רחוב</label>
                                <Combo items={this.props.captain50WalkerReport.dynamicStreets} value={this.props.item.street} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'street')} inputStyle={{ borderColor: (this.isValidStreet ? '#ccc' : '#ff0000') }} maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="flexed flexed-space-between">
                                <div className="form-group width-45-percent">
                                    <label>בית</label>
                                    <input type="text" className="form-control" value={this.props.item.house ? this.props.item.house : ''} style={{ width: '90%' }} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'house')} />
                                </div>
                                <div className="form-group width-45-percent">
                                    <label>כניסה</label>
                                    <input type="text" className="form-control" value={this.props.item.house_entry ? this.props.item.house_entry : ''} style={{ width: '90%' }} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'house_entry')} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="flexed flexed-space-between">
                                <div className="form-group width-45-percent">
                                    <label>דירה</label>
                                    <input type="text" className="form-control" style={{ width: '90%' }} value={this.props.item.flat ? this.props.item.flat : ''} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'flat')} />
                                </div>
                                <div className="form-group width-45-percent">
                                    <label>מיקוד</label>
                                    <input type="text" className="form-control" value={this.props.item.zip ? this.props.item.zip : ''} style={{ width: '90%' }} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'zip')} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <label>סטטוס כתובת</label>
                            <div className="radio-button-switch">
                                <input name="switch" id="two" className="two" type="radio" checked={this.props.item.actual_address_correct == null} onChange={this.changeAddressStatus.bind(this,'actual_address_correctNULL')} />
                                <label htmlFor="two" className="label-two">
                                    <span className="netrali" onClick={this.changeAddressStatus.bind(this,'actual_address_correctNULL')}>
                                        <span className="reset">איפוס</span>
                                    </span>
                                </label>
                                <input name="switch" id="one" className="one" type="radio" checked={this.props.item.actual_address_correct == '1'} onChange={this.changeAddressStatus.bind(this,'actual_address_correct1')} />
                                <label htmlFor="one" className="label-one">
                                    <span className="on flexed">
                                        <span>מאומת</span>
                                        <span className="icon-ok"></span>
                                    </span>
                                </label>

                                <input name="switch" id="three" className="three" type="radio" checked={this.props.item.actual_address_correct == '0'} onChange={this.changeAddressStatus.bind(this,'actual_address_correct0')} />
                                <label htmlFor="three" className="label-three">
                                    <span className="off flexed">
                                        <span className="icon-no"></span>
                                        <span>שגוי</span>
                                    </span>
                                </label>
                                <div></div>
                                <i></i>
                            </div>
                            <span style={(this.props.item.actual_address_correct == '0' && !this.props.item.mi_city_id) ? {} : { display: 'none' }}
                             data-toggle="tooltip" data-placement="left" title={this.wrongAddressText} className="tooltip-icon" data-original-title={this.wrongAddressText}></span>
                        </div>
                    </div>

                    <div className="row no-margin">
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">הסעה</label>
                                <Combo items={[{ id: 0, name: 'ללא הסעה' }, { id: 1, name: 'הסעה רגילה' }, { id: 2, name: 'הסעת נכה' }]} maxDisplayItems={5} value={this.props.item.voter_transportation_type_name} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'voter_transportation_type_name')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="flexed flexed-space-between">
                                <div>
                                    <label>משעה</label>
                                    <ReactWidgets.DateTimePicker
                                        isRtl={true}
                                        value={parseDateToPicker(this.props.item.from_time)}
                                        onChange={parseDateFromPicker.bind(this, { callback: this.handleDateTime, format: "HH:mm", functionParams: { voterRow: this.props.item, timeType: 'from_time', valueType: 'time_value' } })}
                                        timeFormat="HH:mm"
                                        calendar={false}
                                        className="form-group"
                                        style={{ borderColor: ((this.props.item.voter_transportations_id && !this.props.item.from_time) ? '#ff0000' : '#ccc') }}
                                        disabled={!this.props.item.voter_transportations_id}
                                    />

                                </div>
                                <div>
                                    <label>עד שעה</label>
                                    <ReactWidgets.DateTimePicker
                                        isRtl={true}
                                        value={parseDateToPicker(this.props.item.to_time)}
                                        onChange={parseDateFromPicker.bind(this, { callback: this.handleDateTime, format: "HH:mm", functionParams: { voterRow: this.props.item, timeType: 'to_time', valueType: 'time_value' } })}
                                        timeFormat="HH:mm"
                                        calendar={false}
                                        className="form-group"
                                        style={{ borderColor: ((this.props.item.voter_transportations_id && !this.props.item.to_time) ? '#ff0000' : '#ccc') }}
                                        disabled={!this.props.item.voter_transportations_id}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <div className="flexed flexed-space-between">
                                    <label>טלפון 1</label>
                                    <label className="radio-inline"><input type="radio" name="phoneRadios" checked={(this.props.item.mainPhoneID == 1)
                                        || (this.props.item.voter_phones.length >= 1 ? (this.props.item.mainPhoneID != 2 &&
                                            this.props.item.voter_phones[0].phone_id == this.props.item.main_voter_phone_id) : false)}
                                        onClick={this.props.editFieldValueChange.bind(this, this.props.index, 'mainPhoneID1')}
                                        onChange={this.doNoOperation.bind(this)} maxLength="10" /><span>מוביל</span></label>
                                </div>
                                <div className="input-group-box">
                                    <input type="text" className="form-control" value={this.props.item.first_phone} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'first_phone')} style={{ borderColor: (this.isValidatedFirstPhone ? '#ccc' : '#ff0000') }} />
                                    <span className="icon-close-x" onClick={this.clearPhoneNumber.bind(this, 'first_phone')}></span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <div className="flexed flexed-space-between">
                                    <label>טלפון 2</label>
                                    <label className="radio-inline"><input type="radio" name="phoneRadios" checked={(this.props.item.mainPhoneID == 2)
                                        || (this.props.item.voter_phones.length >= 2 ? (this.props.item.mainPhoneID != 1 &&
                                            this.props.item.voter_phones[1].phone_id == this.props.item.main_voter_phone_id) : false)}
                                        onClick={this.props.editFieldValueChange.bind(this, this.props.index, 'mainPhoneID2')}
                                        onChange={this.doNoOperation.bind(this)} maxLength="10" /><span>מוביל</span></label>
                                </div>
                                <div className="input-group-box">
                                    <input type="text" className="form-control" value={this.props.item.second_phone} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'second_phone')} style={{ borderColor: (this.isValidatedSecondPhone ? '#ccc' : '#ff0000') }} />
                                    <span className="icon-close-x" onClick={this.clearPhoneNumber.bind(this, 'second_phone')}></span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="form-group">
                                <label>דוא"ל</label>
                                <div className="input-group-box">
                                    <input type="text" className="form-control" value={this.props.item.email ? this.props.item.email : ''} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'email')} style={{ borderColor: (this.isValidatedEmail ? '#ccc' : '#ff0000') }} />
                                    <span className="icon-close-x" onClick={this.clearPhoneNumber.bind(this, 'email')}></span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            {this.previousSupportStatusItem}
                        </div>
                    </div>
                    <div className="row no-margin">
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">זרם</label>
                                <Combo items={this.props.religiousGroups} maxDisplayItems={5} value={this.props.item.religious_group_name || '' } 
                                    onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'religious_group')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">עדה</label>
                                <Combo items={this.props.ethnicGroups} maxDisplayItems={5} value={this.props.item.ethnic_group_name || ''} 
                                onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'ethnic_group')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="form-group">
                                <label className="text-right" htmlFor="t-18">ספרדי</label>
                                <Combo items={[{ id: 0, name: 'לא' }, { id: 1, name: 'כן' }]} maxDisplayItems={5} value={sephardi} 
                                onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'sephardi')} itemIdProperty="id" itemDisplayProperty='name' />
                            </div>
                        </div>
                    </div>
                    <div className="row flexed no-margin">
                        <div className="col-lg-8">
                            <textarea className="form-control" rows="3" placeholder="כאן תבוא הערה...."
                                value={this.props.item.comment ? this.props.item.comment : ''} style={{ width: '90%' }} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'comment')}
                                maxLength={1990}></textarea>
                        </div>
                        <div className="col-lg-4">
                            <div className="flexed flexed-space-between box-btn" style={{ paddingTop: '20px' }}>
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox" checked={(this.props.item.additional_care == '1')} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'additional_care')} />
                                        <span>דרוש טיפול נוסף</span>
                                    </label>
                                </div>
                                <div className="flexed content-btn-group">
                                    <button title="ביטול" type="button" className="btn btn-primary" style={{ color: '#498BB6', borderColor: '#498BB6', backgroundColor: '#ffffff', height: '35px', padding: '6px 12px', border: 'solid 1px rgb(73, 139, 182)', margin: '0 5px' }} onClick={this.props.expandShrinkVoterRow.bind(this, this.props.index, false)}>ביטול</button>
                                    <div className="dropdown">
                                        <button className="btn btn-primary btn-secondary btn-sm dropdown-toggle" style={{ backgroundColor: 'transparent', border: '1px solid #498BB6', color: '#498BB6', padding: '6px 12px', height: '35px' }} type="button" id="menu1" data-toggle="dropdown">
                                            <span className="caret"></span>
                                            <span className="icon-home"><img src={window.Laravel.baseURL + "Images/icon-home.png"} /></span>
                                            <div><span className="badge badge-basic" style={{ backgroundColor: 'transparent', color: '#498BB6', border: '1px solid #498BB6', padding: '0 3px', fontSize: '10px' }}>{this.globalHouseholdUpdatesCount}</span></div>
                                        </button>
                                        <div className="dropdown-menu" aria-labelledby="menu1">
                                            <p className="title">החל על כל בית האב</p>
                                            <div className="flexed">
                                                <div className="checkbox-content">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked={this.props.item.household_update_support_status == '1'} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'household_update_support_status')} />
                                                            <span>סטטוס סניף</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked={this.props.item.household_update_additional_care == '1'} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'household_update_additional_care')} />
                                                            <span>דרוש טיפול נוסף</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked={this.props.item.household_update_contact_info == '1'} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'household_update_contact_info')} />
                                                            <span>פרטי קשר</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="checkbox-content">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked={this.props.item.household_update_actual_address == '1'} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'household_update_actual_address')} />
                                                            <span>כתובת בפועל</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked={this.props.item.household_update_not_at_home == '1'} onChange={this.props.editFieldValueChange.bind(this, this.props.index, 'household_update_not_at_home')} />
                                                            <span>לא היו בבית</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="arrow"></div>
                                        </div>
                                    </div>
                                    <button title="שמור" type="button" className="btn btn-primary" style={{ backgroundColor: '#498BB6', color: '#ffffff', height: '35px', padding: '6px 12px', borderColor: 'transparent', margin: '0 5px' }} onClick={this.saveVoterData.bind(this, this.props.index)} disabled={!this.isValidatedRow}>שמור</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </td>
            </tr>
        );
    }

}


function mapStateToProps(state) {
    return {
        ethnicGroups: state.elections.general.ethnicGroups,
        religiousGroups: state.elections.general.religiousGroups,
        filterItems: state.global.voterFilter.captain50_walker_report.vf.filter_items,
        supportStatuses: state.elections.reportsScreen.captain50WalkerReport.supportStatuses,
        cities: state.system.cities,
        isEditingVoter: state.elections.reportsScreen.captain50WalkerReport.isEditingVoter,
        modules: state.global.voterFilter.modules,
        captain50WalkerReport: state.elections.reportsScreen.captain50WalkerReport,
        voterFilter: state.global.voterFilter.general_report.vf,
        currentUser: state.system.currentUser,
        reportSearchResults: state.elections.reportsScreen.captain50WalkerReport.reportSearchResults,
        loadingSearchResults: state.elections.reportsScreen.captain50WalkerReport.loadingSearchResults,
    }
}

export default connect(mapStateToProps)(withRouter(CaptainFiftyRelatedVoterRowItemEdit));