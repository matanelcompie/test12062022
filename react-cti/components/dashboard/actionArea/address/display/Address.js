import React from 'react';
import { connect } from 'react-redux';

import ComboSelect from '../../../../common/ComboSelect';
import ModalWindow from '../../../../common/ModalWindow';

import * as callActions from '../../../../../actions/callActions';
import * as uiActions from '../../../../../actions/uiActions';
import { getCtiPermission } from '../../../../../libs/globalFunctions';


class Address extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    componentWillMount() {
        if (this.props.city_id) {
            this.changeCity(this.props.city_id, this.props.city);
        }
    }

    componentDidUpdate(prevProps) {
        //validate address
        if (this.props.activeCallVoter != prevProps.activeCallVoter) {
            if (this.validateZip() && this.validateFlat() && this.validateDistributionCode()) {
                uiActions.setActionAreaValidationStatus(this.props.dispatch, 'Address', true);
            } else {
                 uiActions.setActionAreaValidationStatus(this.props.dispatch, 'Address', false);
            }
        }
    }

    /**
     * Update city
     *
     * @param integer cityId
     * @param string cityName
     * @return void
     */
    changeCity(cityId, cityName) {
        let cityKey = this.getCityKey(cityId);
        let cityItem = {
            value: cityId,
            label: cityName,
            city_key: cityKey
        }
        event = { target: { selectedItem: cityItem } };
        this.comboChange("city_id", event);
    }

    initConstants() {
        this.titles = {
            miAddress: 'כתובת משרד הפנים',
            actualAddress: 'כתובת בפועל'
        };

        this.texts = {
            updateToMi: 'העתק כתובת משרד הפנים ',
            verifiedAddress: 'כתובת מאומתת',
            unVerifiedAddress: 'כתובת לא מאומתת'
        };

        this.labels = {
            city: 'עיר',
            house: 'בית',
            neighborhood: 'שכונה',
            houseEntry: 'כניסה',
            street: 'רחוב',
            flat: 'דירה',
            zip: 'מיקוד',
            distributionCode: 'קוד חלוקה'
        };

        this.inputErrorStyle = {
            backgroundColor: '#f3e9ea',
            color: '#e76a7d',
            borderColor: '#e76a7d'
        };

        this.updateActualAddessCorrectModalTitle = "עדכון נכונות כתובת משרד הפנים";
        this.updateActualAddessCorrectModalContent = "האם כתובת משרד הפנים נכונה ?";
    }

    initVariables() {
        this.miStreet = '';
        this.miCity = '';

        this.cityNameStyle = {};
        this.streetNameStyle = {};
        this.flatStyle = {};
        this.zipStyle = {};
        this.distributionCodeStyle = {};


        if (this.props.activeCallVoter.address.mi_street != null && this.props.activeCallVoter.address.mi_street != '') {
            this.miStreet = this.props.activeCallVoter.address.mi_street;
        }

        if (this.props.activeCallVoter.address.mi_house != null && this.props.activeCallVoter.address.mi_house != '') {
            this.miStreet += ' ' + this.props.activeCallVoter.address.mi_house;
        }

        if (this.miStreet == null || this.miStreet == undefined) {
            this.miStreet = '\u00A0';
        }

        if (this.props.activeCallVoter.address.mi_zip != null && this.props.activeCallVoter.address.mi_zip != '') {
            this.miCity = this.props.activeCallVoter.address.mi_zip + ', ';
        }

        this.miCity += this.props.activeCallVoter.address.mi_city;
    }

    updateActualAddessCorrectViaModal(newActualAddressCorrect) {
        callActions.changeVoterAddressInputField(this.props.dispatch, 'actual_address_correct', newActualAddressCorrect);

        this.updateAddressToMi();

        uiActions.hideActualAddressCorrectModal(this.props.dispatch);
    }

    actualAddressCorrectChange(newActualAddressCorrect) {
        callActions.changeVoterAddressInputField(this.props.dispatch, 'actual_address_correct', newActualAddressCorrect);

        if (1 == newActualAddressCorrect) {
            callActions.changeVoterAddressInputField(this.props.dispatch, 'actual_address_correct', newActualAddressCorrect);
        } else {
            if (this.isIdentical()) {
                newActualAddressCorrect = 0;

                callActions.changeVoterAddressInputField(this.props.dispatch, 'actual_address_correct', newActualAddressCorrect);
            } else {
                uiActions.showActualAddressCorrectModal(this.props.dispatch);
            }
        }
    }

    inputChange(fieldName, event) {
        callActions.changeVoterAddressInputField(this.props.dispatch, fieldName, event.target.value);
    }

    comboChange(fieldName, event) {
        var fieldValue = '';
        var fieldLabel = '';

        switch (fieldName) {
            case 'city_id':
                if (event.target.selectedItem != undefined && event.target.selectedItem != null) {
                    fieldValue = event.target.selectedItem.value;
                    fieldLabel = event.target.selectedItem.label;

                    callActions.loadVoterCityStreets(this.props.dispatch, event.target.selectedItem.city_key);
                } else {
                    fieldValue = '';
                    fieldLabel = '';

                    callActions.resetVoterCityStreets(this.props.dispatch);
                }

                callActions.changeVoterAddressInputField(this.props.dispatch, 'city', fieldLabel);
                callActions.changeVoterAddressInputField(this.props.dispatch, 'street_id', '');
                break;

            case 'street_id':
                if (event.target.selectedItem != undefined && event.target.selectedItem != null) {
                    fieldValue = event.target.selectedItem.id;
                    fieldLabel = event.target.selectedItem.label;
                } else {
                    fieldValue = '';
                    fieldLabel = '';
                }

                callActions.changeVoterAddressInputField(this.props.dispatch, 'street', fieldLabel);
                break;
        }

        callActions.changeVoterAddressInputField(this.props.dispatch, fieldName, fieldValue);
    }

    getCityKey(cityId) {
        let cityIndex = -1;

        cityIndex = this.props.cities.findIndex(cityItem => cityItem.value == cityId);
        if (cityIndex > -1) {
            return this.props.cities[cityIndex].city_key;
        } else {
            return null;
        }
    }

    updateAddressToMi() {
        let cityKey = null;

        if (this.props.mi_city_id == null || this.props.mi_city_id == '') {
            callActions.resetVoterCityStreets(this.props.dispatch);
        } else {
            cityKey = this.getCityKey(this.props.mi_city_id);
            callActions.loadVoterCityStreets(this.props.dispatch, cityKey, true);
        }

        callActions.updateVoterAddressToMi(this.props.dispatch);
    }

    undoChanges() {
        let cityKey = null;

        callActions.undoVoterAddressChanges(this.props.dispatch);

        if (this.props.oldAddress.city_id == null || this.props.oldAddress.city_id == '') {
            callActions.resetVoterCityStreets(this.props.dispatch);
        } else {
            cityKey = this.getCityKey(this.props.oldAddress.city_id);
            callActions.loadVoterCityStreets(this.props.dispatch, cityKey, true);
        }
    }

    /*
     *  This function checks if the address
     *  is identical to the mp address
     */
    isIdentical() {
        if (this.props.city != this.props.mi_city) {
            return false;
        }

        if (this.props.street != this.props.mi_street) {
            return false;
        }

        if (this.props.house != this.props.mi_house) {
            return false;
        }

        if (this.props.flat != this.props.mi_flat) {
            return false;
        }

        return true;
    }

    validateFlat() {
        let flat = this.props.flat;
        if (!flat || flat.length == 0) {
            return true;
        }

        let regExp = /^\d+/;

        return regExp.test(flat);
    }

    validateZip() {
        let zip = this.props.zip;

        if (!zip || zip.length == 0) {
            return true;
        }

        let regExp1 = /^[0-9]{5}$/;
        let regExp2 = /^[0-9]{7}$/;

        if (regExp1.test(zip) || regExp2.test(zip)) {
            return true;
        } else {
            return false;
        }
    }

    validateDistributionCode() {
        var distributionCode = this.props.distribution_code;

        if (!distributionCode || distributionCode.length == 0) {
            return true;
        }

        let regExp = /^[0-9]{9}$/;

        return regExp.test(distributionCode);
    }

    /*
     *  This function validates the fields
     *  and displays the error style in
     *  each field which is not valid
     */
    validateVariables() {
        if (this.validateZip()) {
            this.zipStyle = {};
        } else {
            this.zipStyle = this.inputErrorStyle;
        }

        if (this.validateFlat()) {
            this.flatStyle = {};
        } else {
            this.flatStyle = this.inputErrorStyle;
        }

        if (this.validateDistributionCode()) {
            this.distributionCodeStyle = {};
        } else {
            this.distributionCodeStyle = this.inputErrorStyle;
        }
    }

    render() {
        this.initVariables();

        this.validateVariables();
        let permissions = this.props.permissions;
        let canEditAddress = getCtiPermission(permissions, 'address', true);
        return (
            <div className="address">
                <div className="action-content address-mi-address">
                    <div className="action-content__header">
                        <span className="action-content__title">{this.titles.miAddress}</span>
                    </div>

                    <div className="address-mi-address__data">
                        <div>{this.miStreet}</div>
                        <div>{this.miCity}</div>
                    </div>
                </div>

                <div className="action-content address-actual-address">
                    <div className="action-content__header address-actual-address__header">
                        <div className="action-content__title">{this.titles.actualAddress}</div>
                        <div className="address-actual-address__actions">
                            <span className="address-actual-address__undo">
                                <button onClick={this.undoChanges.bind(this)}>
                                    <i className="fa fa-undo fa-6" />
                                </button>
                            </span>

                            <span className="address-actual-address__update-to-mi">
                                <a title={this.updateToMi}
                                    onClick={this.updateAddressToMi.bind(this)}>
                                    {this.texts.updateToMi}
                                </a>
                            </span>
                        </div>
                    </div>

                    <div className="address-actual-address__data">
                        <div className="address-actual-address__column">
                            <div className="address-actual-address__verified-column address-actual-address__verified-address">
                                <input type="radio" checked={this.props.actual_address_correct == 1}
                                    disabled={!canEditAddress}
                                    onChange={this.actualAddressCorrectChange.bind(this, 1)} />

                                <span>
                                    <i className="fa fa-check" aria-hidden="true" />
                                    {'\u00A0'}
                                    {this.texts.verifiedAddress}
                                </span>
                            </div>

                            <div className="address-actual-address__label">{this.labels.city}</div>

                            <div className="address-actual-address__row-combo">
                                <ComboSelect
                                    options={this.props.cities}
                                    className="drawer-combo"
                                    inputStyle={this.cityNameStyle}
                                    name="city_id"
                                    value={this.props.city_id}
                                    defaultValue={this.props.city_id}
                                    itemDisplayProperty="label"
                                    itemIdProperty="value"
                                    multiSelect={false}
                                    disabled={!canEditAddress}
                                    onChange={this.comboChange.bind(this, "city_id")}
                                />
                            </div>

                            <div className="address-actual-address__label">{this.labels.neighborhood}</div>

                            <div className="address-actual-address__row-input">
                                <input type="text" className="form-control"
                                    value={this.props.neighborhood}
                                    disabled={!canEditAddress}
                                    onChange={this.inputChange.bind(this, 'neighborhood')}
                                />
                            </div>

                            <div className="address-actual-address__label">{this.labels.street}</div>

                            <div className="address-actual-address__row-combo">
                                <ComboSelect
                                    options={this.props.cityStreets}
                                    className="drawer-combo"
                                    inputStyle={this.streetNameStyle}
                                    name="street_id"
                                    value={this.props.street_id}
                                    defaultValue={this.props.street_id}
                                    itemDisplayProperty="name"
                                    itemIdProperty="id"
                                    multiSelect={false}
                                    disabled={!canEditAddress}
                                    onChange={this.comboChange.bind(this, "street_id")}
                                />
                            </div>

                            <div className="address-actual-address__label">{this.labels.zip}</div>

                            <div className="address-actual-address__row-input">
                                <input type="text" className="form-control" style={this.zipStyle}
                                    value={this.props.zip}
                                    onChange={this.inputChange.bind(this, 'zip')}
                                />
                            </div>
                        </div>

                        <div className="address-actual-address__column">
                            <div className="address-actual-address__verified-column address-actual-address__unverified-address">
                                <input type="radio" checked={!this.props.actual_address_correct}
                                    disabled={!canEditAddress}
                                    onChange={this.actualAddressCorrectChange.bind(this, 0)} />

                                <span>
                                    <i className="fa fa-times" aria-hidden="true" />
                                    {'\u00A0'}
                                    {this.texts.unVerifiedAddress}
                                </span>
                            </div>

                            <div className="address-actual-address__label">{this.labels.house}</div>

                            <div className="address-actual-address__row-input">
                                <input type="text" className="form-control"
                                    value={this.props.house}
                                    disabled={!canEditAddress}
                                    onChange={this.inputChange.bind(this, 'house')}
                                />
                            </div>

                            <div className="address-actual-address__label">{this.labels.houseEntry}</div>

                            <div className="address-actual-address__row-input">
                                <input type="text" className="form-control"
                                    value={this.props.house_entry}
                                    disabled={!canEditAddress}
                                    onChange={this.inputChange.bind(this, 'house_entry')}
                                />
                            </div>

                            <div className="address-actual-address__label">{this.labels.flat}</div>

                            <div className="address-actual-address__row-input">
                                <input type="text" className="form-control" style={this.flatStyle}
                                    value={this.props.flat}
                                    onChange={this.inputChange.bind(this, 'flat')}
                                />
                            </div>

                            <div className="address-actual-address__label">{this.labels.distributionCode}</div>

                            <div className="address-actual-address__row-input">
                                <input type="text" className="form-control" style={this.distributionCodeStyle}
                                    value={this.props.distribution_code}
                                    disabled={!canEditAddress}
                                    onChange={this.inputChange.bind(this, 'distribution_code')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <ModalWindow show={this.props.showActualAddressCorrectModal}
                    buttonOk={this.updateActualAddessCorrectViaModal.bind(this, 1)}
                    buttonCancel={this.updateActualAddessCorrectViaModal.bind(this, 0)}
                    title={this.updateActualAddessCorrectModalTitle}
                    style={{ zIndex: '9001' }}>
                    <div>{this.updateActualAddessCorrectModalContent}</div>
                </ModalWindow>
            </div>
        );
    }
};


function mapStateToProps(state) {
    return {
        activeCallVoter: state.call.activeCall.voter,
        cities: state.system.lists.cities,
        cityStreets: state.call.cityStreets,
        city: state.call.activeCall.voter.address.city || '',
        city_id: state.call.activeCall.voter.address.city_id || '',
        street: state.call.activeCall.voter.address.street || '',
        street_id: state.call.activeCall.voter.address.street_id || '',
        house: state.call.activeCall.voter.address.house || '',
        neighborhood: state.call.activeCall.voter.address.neighborhood || '',
        flat: state.call.activeCall.voter.address.flat || '',
        house_entry: state.call.activeCall.voter.address.house_entry || '',
        zip: state.call.activeCall.voter.address.zip || '',
        distribution_code: state.call.activeCall.voter.address.distribution_code || '',
        mi_city_id: state.call.activeCall.voter.address.mi_city_id || '',
        mi_city: state.call.activeCall.voter.address.mi_city || '',
        mi_street: state.call.activeCall.voter.address.mi_street || '',
        mi_house: state.call.activeCall.voter.address.mi_house || '',
        mi_flat: state.call.activeCall.voter.address.mi_flat || '',
        actual_address_correct: state.call.activeCall.voter.address.actual_address_correct || false,
        oldAddress: state.call.oldAddress,
        showActualAddressCorrectModal: state.ui.showActualAddressCorrectModal,
        permissions: state.campaign.permissions

    }
}

export default connect(mapStateToProps)(Address);