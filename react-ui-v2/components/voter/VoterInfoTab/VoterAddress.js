import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import { validateZip, validateFlat, validateHouse } from '../../../libs/globalFunctions';


class VoterAddress extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.loadedVoter && nextProps.loadedVoter && nextProps.cities.length > 0) {
            let cities = this.props.cities;

            if (this.props.voterDetails.city_id == null) {
                let cityIndex = -1;
                let cityName = 'this.props.city';
                let cityId = 0;

                cityIndex = cities.findIndex(cityItem => cityItem.name == cityName);

                if (cityIndex > -1) {
                    cityId = cities[cityIndex].id;

                    this.props.dispatch({
                        type: VoterActions.ActionTypes.VOTER.VOTER_INIT_CITY_ID,
                        cityId: cityId
                    });
                }
            }

            if (this.props.voterDetails.mi_city_id == null) {
                let miCityIndex = -1;
                let miCityName = 'this.props.mi_city';
                let miCityId = 0;

                miCityIndex = cities.findIndex(cityItem => cityItem.name == miCityName);

                if (miCityIndex > -1) {
                    miCityId = cities[miCityIndex].id;

                    this.props.dispatch({
                        type: VoterActions.ActionTypes.VOTER.VOTER_INIT_MI_CITY_ID,
                        miCityId: miCityId
                    });
                }
            }
        }
    }

    /**
     *  This function restores the values of
     *  voter details before the changes
     */
    undoAddressChanges(e) {
        // Prevent page refresh
        e.preventDefault();

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_UNDO_CHANGES });

        this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget });
    }

    /**
     *
     * @param updateHouseholds - Boolean which indicates whether to
     *                           update the households members address
     */
    editVoterAddress(updateHouseholds) {
        let voterData = [];
        let voterKey = this.props.router.params.voterKey;
        let voterDetails = this.props.voterDetails;

        var addressFields = [
            'city_id',
            'street_id',
            'neighborhood',
            'house',
            'house_entry',
            'flat',
            'zip',
            'distribution_code',
            'actual_address_correct'
        ];
        addressFields.forEach(function (fieldName) {
            let val = voterDetails[fieldName];
            if (val) {
                let str = val.toString();
                let fieldValue = (str.length > 0) ? str : null;
                voterData.push({ key: fieldName, value: fieldValue });
            }

        });
        VoterActions.saveVoterAddress(this.props.dispatch, voterKey, voterData, updateHouseholds);
    }

    saveVoterAddressWithHouseholds() {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_HIDE_UPDATE_HOUSEHOLD_ADDRESS_MODAL });

        this.editVoterAddress(1);
    }

    getAge(birthDate) {
        var currentYear = new Date().getFullYear();

        if (birthDate == "" || birthDate == null) {
            return '\u00A0';
        }



        let arrOfDateElement = birthDate.split('-');
        let birthYear = arrOfDateElement[0];

        var age = currentYear - birthYear;

        return age;
    }

    showHouseholdUpdateModal() {
        if (!this.validInputs) {
            return;
        }

        let modalRows = '';
        let modalContent = '';
        let that = this;
        let voterKey = this.props.router.params.voterKey;
        let updateQuestion = "האם לעדכן כתובת לכל בית האב ?";

        modalRows = this.props.household.map(function (householdItem, index) {
            if (householdItem.key != voterKey) {
                return (
                    <tr key={index}>
                        <td>{householdItem.personal_identity}</td>
                        <td>{householdItem.first_name}</td>
                        <td>{householdItem.last_name}</td>
                        <td>{that.getAge(householdItem.birth_date)}</td>
                    </tr>
                );
            }
        });

        modalContent =
            <div>
                <div><strong>{updateQuestion}</strong></div>

                <table className="table table-bordered table-striped">
                    <thead style={{ backgroundColor: '#eeeeee' }}>
                        <tr>
                            <td>ת.ז</td>
                            <td>שם פרטי</td>
                            <td>שם משפחה</td>
                            <td>גיל</td>
                        </tr>
                    </thead>

                    <tbody>
                        {modalRows}

                        <tr key={this.props.household.length}>
                            <td colSpan="4"><strong>{this.updateHouseholdModalDisclaimer}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_SHOW_UPDATE_HOUSEHOLD_ADDRESS_MODAL,
            modalContent: modalContent
        });
    }

    saveVoterAddressOnly() {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_HIDE_UPDATE_HOUSEHOLD_ADDRESS_MODAL });

        this.editVoterAddress(0);
    }

    /**
     *
     * @param e
     */
    saveVoterAddress(e) {
        // Prevent page refresh
        e.preventDefault();

        if (!this.validInputs) {
            return;
        }

        this.editVoterAddress(0);
    }

    /*
     *  This function is triggered by the event of clicking
     *  the upadte to mp address button.
     *
     *  It dispatches a function which updates the actual address
     *  to the MI address.
     */
    updateAddressToMi() {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_UPDATE_ADDRESS_TO_MI_ADDRESS });

        VoterActions.loadVoterCityStreets(this.props.dispatch, this.props.voterDetails.mi_city_key, true);

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    /*
     *  This function checks if the address
     *  is identical to the mp address
     */
    isIdentical() {
        if (this.props.voterDetails.city_name != this.props.voterDetails.mi_city_name) {
            return false;
        }

        if (this.props.voterDetails.street_name != this.props.voterDetails.mi_street_name) {
            return false;
        }

        if (this.props.voterDetails.house != this.props.voterDetails.mi_house) {
            return false;
        }

        if (this.props.voterDetails.flat != this.props.voterDetails.mi_flat) {
            return false;
        }

        return true;
    }

    /*
     *  This function updates the variable which
     *  indicates whether the address is identical
     *  to the MP address
     */
    updateIdentical() {
        const strIdentical = "(זהה)";

        if (this.isIdentical()) {
            this.identical = strIdentical;
            this.identicalClass = "col-xs-4 col-md-4 pull-left";
        } else {
            this.identical = "";
            this.identicalClass = "col-xs-4 col-md-4 pull-left hidden";
        }
    }

    updateActualAddessCorrectViaModal(newActualAddressCorrect) {

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_ACTUAL_ADDRESS_CORRECT_CHANGE,
            actualAddressCorrect: newActualAddressCorrect
        });

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_UPDATE_ADDRESS_TO_MI_ADDRESS });
        if (this.props.voterDetails.hasOwnProperty('mi_city_key')) {
            VoterActions.loadVoterCityStreets(this.props.dispatch, this.props.voterDetails.mi_city_key, true);

        }

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_HIDE_ACTUAL_ADDRESS_CORRECT_MODAL });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    actualAddressCorrectChange(newActualAddressCorrect) {
        if (newActualAddressCorrect == 1) {
            this.props.dispatch({
                type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_ACTUAL_ADDRESS_CORRECT_CHANGE,
                actualAddressCorrect: newActualAddressCorrect
            });

            this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
        } else {
            if (this.isIdentical()) {
                newActualAddressCorrect = 0;

                this.props.dispatch({
                    type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_ACTUAL_ADDRESS_CORRECT_CHANGE,
                    actualAddressCorrect: newActualAddressCorrect
                });

                this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
            } else {
                this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_SHOW_ACTUAL_ADDRESS_CORRECT_MODAL });
            }
        }
    }

    /*
     * This function is triggered by the
     * event of click button of cleaning
     * the actual address fields.
     *
     * It dispatches a function which cleans
     * the actual address.
     */
    cleanAddress() {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_CLEAN_ADDRESS });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getCityKey(cityId) {
        let citiesList = this.props.cities;
        let cityIndex = -1;
        let cityKey = 0;

        cityIndex = citiesList.findIndex(cityItem => cityItem.id == cityId);
        if (-1 == cityIndex) {
            return 0;
        } else {
            cityKey = citiesList[cityIndex].key;
            return cityKey;
        }
    }

    getCityId(cityName) {
        let citiesList = this.props.cities;
        let cityIndex = -1;
        let cityId = 0;

        cityIndex = citiesList.findIndex(cityItem => cityItem.name == cityName);
        if (-1 == cityIndex) {
            return 0;
        } else {
            cityId = citiesList[cityIndex].id;
            return cityId;
        }
    }

    /*
     *   This function triggered by event of
     *   a change in the city field
     *
     *   @params e - event object
     */
    cityChange(e) {
        var cityName = e.target.value;
        var cityId = 0;
        var cityKey = "";

        cityId = this.getCityId(cityName);

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_STREET_INPUT_CHANGE,
            streetId: 0, streetName: ""
        });

        if (cityId > 0) {
            cityKey = this.getCityKey(cityId);

            VoterActions.loadVoterCityStreets(this.props.dispatch, cityKey, false);
        } else {
            cityKey = null;
            this.props.dispatch({
                type: VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_LOAD_VOTER_CITY_STREETS,
                cityStreets: []
            });
        }

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_CITY_INPUT_CHANGE,
            cityId: cityId, cityName: cityName, cityKey: cityKey
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getStreetIndex(fieldName, fieldValue) {
        var streetsList = this.props.cityStreets;
        var streetIndex = -1;

        streetIndex = streetsList.findIndex(streetItem => streetItem[fieldName] == fieldValue);

        return streetIndex;
    }

    /*
     *   This function triggered by event of
     *   a change in the street field
     *
     *   @params e - event object
     */
    streetChange(e) {
        var streetName = e.target.value;
        var streetIndex = -1;
        var streetId = 0;
        var streetsList = this.props.cityStreets;

        streetIndex = this.getStreetIndex("name", streetName);
        if (streetIndex == -1) {
            streetId = 0;
        } else {
            streetId = streetsList[streetIndex].id;
        }

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_STREET_INPUT_CHANGE,
            streetId: streetId, streetName: streetName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }


    /*
     *   This function triggered by event of
     *   a change in the house field
     *
     *   @params e - event object
     */
    houseChange(e) {
        var house = e.target.value;

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_HOUSE_INPUT_CHANGE, house: house });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }


    /*
     *   This function triggered by event of
     *   a change in the zip field
     *
     *   @params e - event object
     */
    zipChange(e) {
        var zip = e.target.value;

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_ZIP_INPUT_CHANGE, zip: zip });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }


    /*
     *   This function triggered by event of
     *   a change in the neighborhood field
     *
     *   @params e - event object
     */
    neighborhoodChange(e) {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_NEIGHBORHOOD_INPUT_CHANGE, neighborhood: e.target.value });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }


    /*
     *   This function triggered by event of
     *   a change in the houseEntry field
     *
     *   @params e - event object
     */
    houseEntryChange(e) {
        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_HOUSE_ENTRY_INPUT_CHANGE, house_entry: e.target.value });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }


    /*
     *   This function triggered by event of
     *   a change in the houseEntry field
     *
     *   @params e - event object
     */
    flatChange(e) {
        var flat = e.target.value;

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_FLAT_INPUT_CHANGE, flat: flat });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    distributionCodeChange(e) {
        var distributionCode = e.target.value;

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_DISTRIBUTION_CODE_CHANGE,
            distributionCode: distributionCode
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    initConstants() {
        this.placeholders = {
            city: 'שם העיר',
            neighborhood: 'שם השכונה',
            street: 'שם הרחוב',
            house: 'מספר הבית',
            houseEntry: 'מספר כניסה',
            flat: 'מספר הדירה',
            zip: "מיקוד",
            distributionCode: 'קוד חלוקה'
        };

        this.labels = {
            city: 'עיר',
            neighborhood: "שכונה",
            street: "רחוב",
            house: "בית",
            houseEntry: "כניסה",
            flat: "דירה",
            zip: "מיקוד",
            distributionCode: 'קוד חלוקה',
            checkboxLabelWrongAddress: 'סמן כשגוי',
            checkboxLabelVerifiedAddress: 'סמן לאימות הכתובת'
        };

        this.addressVerificationTexts = {
            verified: "כתובת מאומתת",
            unVerified: "כתובת שגויה"
        };

        this.verifiedAddressText = "כתובת בפועל";
        this.miAddressText = "כתובת משרד הפנים";
        this.cleanFieldsText = "נקה שדות";
        this.updateToMiText = "עדכן לפי כתובת משרד הפנים";

        this.updateHouseholdModalTitle = "עדכון כתובת לכל בית האב";
        this.updateHouseholdModalDisclaimer = "לעדכון כל כתובת בית האב לחץ על כן, לעדכון כתובת התושב בלבד לחץ על לא";

        this.updateActualAddessCorrectModalTitle = "עדכון נכונות כתובת משרד הפנים";
        this.updateActualAddessCorrectModalContent = "האם כתובת משרד הפנים נכונה ?";

        this.saveButtonText = "שמירה";

        this.tooltip = {
            undoChanges: 'לבטל שינויים'
        };

        this.undoButtonStyle = {
            marginLeft: "10px"
        };

        this.setDirtyTarget = "elections.voter.additional_data.address";
    }

    validateZip() {
        let zip = this.props.voterDetails.zip ? this.props.voterDetails.zip : '';

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

    validateFlat() {
        var flat = this.props.voterDetails.flat;

        if (!flat || flat.length == 0) {
            return true;
        }

        let regExp = /^\d+/;

        return regExp.test(flat);
    }

    validateStreet() {
        var streetName = this.props.voterDetails.street_name;
        var streetId = this.props.voterDetails.street_id;

        if (!streetName || streetName.length == 0) {
            return true;
        }

        if (!streetId) {
            return false;
        }
        return true;

    }

    validateCity() {
        var cityName = this.props.voterDetails.city_name;
        var cityId = this.props.voterDetails.city_id;

        if (!cityName || cityName.length == 0) {
            return false;
        }

        if (!cityId) {
            return false;
        }

        return true;

    }

    validateDistributionCode() {
        var distributionCode = this.props.voterDetails.distribution_code;

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
        var house = this.props.voterDetails.house;

        this.validInputs = true;

        if (this.validateZip()) {
            this.zipDivClass = "form-group";
            this.zipErrorText = "";
        } else {
            this.validInputs = false;
            this.zipDivClass = "form-group has-error";
            this.zipErrorText = "מיקוד לא תקני";
        }

        if (this.validateFlat()) {
            this.flatDivClass = "form-group";
            this.flatErrorText = "";
        } else {
            this.validInputs = false;
            this.flatDivClass = "form-group has-error";
            this.flatErrorText = "מס' דירה לא תקני";
        }

        if (this.validateCity()) {
            this.cityDivClass = "form-group";
            this.cityErrorText = "";
        } else {
            this.validInputs = false;
            this.cityDivClass = "form-group has-error";
            this.cityErrorText = "עיר לא קיימת";
        }

        if (!this.validateStreet()) {
            this.validInputs = false;
            this.streetDivClass = "form-group has-error";
            this.streetErrorText = "רחוב לא קיים";
        } else {
            this.streetDivClass = "form-group";
            this.streetErrorText = "";
        }

        if (this.validateDistributionCode()) {
            this.distributionCodeDivClass = "form-group";
            this.distributionCodeErrorText = "";
        } else {
            this.validInputs = false;
            this.distributionCodeDivClass = "form-group has-error";
            this.distributionCodeErrorText = "קוד חלוקה לא תקני";
        }
    }

    initVariables() {
        this.zipDivClass = "form-group";
        this.flatDivClass = "form-group";
        this.houseDivClass = "form-group";
        this.cityDivClass = "form-group";
        this.streetDivClass = "form-group";
        this.distributionCodeDivClass = "form-group";

        this.identical = '';
        this.identicalStyle = {
            fontWeight: 'bold',
            color: '#3FFF33'
        };
    }

    renderSaveButton() {
        var displayAddressButton = false;
        var allowHouseholdUpdate = false;
        var undoClassButton = "";

        if (this.props.currentUser.admin) {
            displayAddressButton = true;
            allowHouseholdUpdate = true;
        } else {
            if (this.props.currentUser.permissions['elections.voter.additional_data.address.edit'] == true) {
                displayAddressButton = true;

                if (this.props.currentUser.permissions['elections.voter.additional_data.address.household.edit'] == true) {
                    allowHouseholdUpdate = true;
                }
            }
        }

        // The current voter is the only member
        // in his household, so there is no need
        // to show household Modal.
        if (this.props.household.length == 1) {
            allowHouseholdUpdate = false;
        }

        /* The save button will not be displayed in 1 of these cases:
         * The input is not valid
         * No input data has been changed
         * The data is being saved in the server
         */
        if (displayAddressButton) {
            // Checking if any detail has changed
            // in order to decide whether to
            // display the undo changes button.
            if (!this.addresHasChanged) {
                undoClassButton = "btn btn-danger pull-left hidden";
            } else {
                undoClassButton = "btn btn-danger pull-left";
            }

            /*
             *  There is permission to update
             *  the voter's Modal household
             */
            if (allowHouseholdUpdate) {
                return (
                    <div className="col-xs-12">
                        <div className="form-group">
                            <div className="">
                                <button className="btn btn-primary saveChanges"
                                    onClick={this.showHouseholdUpdateModal.bind(this)}
                                    disabled={!this.validInputs || !this.addresHasChanged ||
                                        this.props.savingChanges}>
                                    {this.saveButtonText}
                                </button>
                                <button className={undoClassButton}
                                    style={this.undoButtonStyle}
                                    title={this.tooltip.undoChanges}
                                    onClick={this.undoAddressChanges.bind(this)}
                                    disabled={this.props.savingChanges}>
                                    <i className="fa fa-undo fa-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="col-xs-12">
                        <div className="form-group">
                            <div className="">
                                <button className="btn btn-primary saveChanges"
                                    onClick={this.saveVoterAddress.bind(this)}
                                    disabled={!this.validInputs || !this.addresHasChanged ||
                                        this.props.savingChanges}>
                                    {this.saveButtonText}
                                </button>
                                <button className={undoClassButton}
                                    style={this.undoButtonStyle}
                                    title={this.tooltip.undoChanges}
                                    onClick={this.undoAddressChanges.bind(this)}
                                    disabled={this.props.savingChanges}>
                                    <i className="fa fa-undo fa-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }

    /*
     *  This function checks if any changes
     *  have been made in address.
     *
     *  If no changes have been made to address
     *  the save button will be disabled
     */
    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.addresHasChanged = false;
        } else {
            this.addresHasChanged = true;
        }
    }

    render() {
        var buttonOkText = "כן";
        var buttonCancelText = "לא";

        this.initVariables();

        this.validateVariables();

        this.checkAnyChanges();

        this.updateIdentical();
        return (
            <Collapse isOpened={this.props.containerCollapseStatus.infoAddress}>
                <div className="row CollapseContent">
                    <div className="col-sm-8 fieldGroup">
                        <div className="row">
                            <div className="col-sm-4">
                                <h4>{this.verifiedAddressText}</h4>
                            </div>

                            <div className="col-sm-8">{'\u00A0'}</div>
                        </div>

                        <div className="row">
                            <div className="col-sm-3">
                                <div className="textLink">
                                    <a title={this.updateToMiText}
                                        onClick={this.updateAddressToMi.bind(this)}>
                                        {this.updateToMiText}
                                    </a>
                                </div>
                            </div>

                            <div className="col-sm-3">
                                <div className="textLink">
                                    <a title={this.cleanFieldsText}
                                        onClick={this.cleanAddress.bind(this)}>
                                        {this.cleanFieldsText}
                                    </a>
                                </div>
                            </div>

                            <div className="col-sm-6">{'\u00A0'}</div>
                        </div>

                        <div className="col-md-6">
                            <form className="form-horizontal">
                                <div className={this.cityDivClass}>
                                    <label htmlFor="voter-address-city" className="col-sm-4 control-label">
                                        {this.labels.city}
                                    </label>
                                    <div className="col-sm-8">
                                        <Combo id="voter-address-city" items={this.props.cities}
                                            itemIdProperty="id" itemDisplayProperty='name'
                                            maxDisplayItems={10}
                                            value={this.props.voterDetails.city_name || ''}
                                            onChange={this.cityChange.bind(this)} />
                                        <span className="help-block">
                                            {this.cityErrorText}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="voter-address-neighborhood‬‏"
                                        className="col-sm-4 control-label">
                                        {this.labels.neighborhood}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                            id="voter-address-neighborhood‬‏"
                                            placeholder={this.placeholders.neighborhood}
                                            value={this.props.voterDetails.neighborhood || ''}
                                            onChange={this.neighborhoodChange.bind(this)}
                                        />
                                    </div>
                                </div>
                                <div className={this.streetDivClass}>
                                    <label htmlFor="voter-address-street" className="col-sm-4 control-label">
                                        {this.labels.street}
                                    </label>
                                    <div className="col-sm-8">
                                        <Combo id="voter-address-street" items={this.props.cityStreets}
                                            itemIdProperty="id" itemDisplayProperty='name'
                                            maxDisplayItems={10}
                                            value={this.props.voterDetails.street_name || ''}
                                            onChange={this.streetChange.bind(this)} />
                                        <span className="help-block">
                                            {this.streetErrorText}
                                        </span>
                                    </div>
                                </div>
                                <div className={this.zipDivClass}>
                                    <label htmlFor="voter-address-zip" className="col-sm-4 control-label">
                                        {this.labels.zip}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                            id="voter-address-zip"
                                            placeholder={this.placeholders.zip}
                                            value={this.props.voterDetails.zip || ''}
                                            onChange={this.zipChange.bind(this)}
                                        />

                                        <span className="help-block">
                                            {this.zipErrorText}
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col-md-6">
                            <form className="form-horizontal">
                                <div className={this.houseDivClass}>
                                    <label htmlFor="voter-address-house" className="col-sm-4 control-label">
                                        {this.labels.house}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control" id="voter-address-house"
                                            placeholder={this.placeholders.house}
                                            value={this.props.voterDetails.house || ''}
                                            onChange={this.houseChange.bind(this)}
                                        />

                                        <span className="help-block">
                                            {this.houseErrorText}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="voter-address-house-entry" className="col-sm-4 control-label">
                                        {this.labels.houseEntry}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                            id="voter-address-house-entry"
                                            placeholder={this.placeholders.houseEntry}
                                            value={this.props.voterDetails.house_entry || ''}
                                            onChange={this.houseEntryChange.bind(this)} />
                                    </div>
                                </div>
                                <div className={this.flatDivClass}>
                                    <label htmlFor="voter-address-flat" className="col-sm-4 control-label">
                                        {this.labels.flat}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                            id="voter-address-flat"
                                            placeholder={this.placeholders.flat}
                                            value={this.props.voterDetails.flat || ''}
                                            onChange={this.flatChange.bind(this)}
                                        />

                                        <span className="help-block">
                                            {this.flatErrorText}
                                        </span>
                                    </div>
                                </div>
                                <div className={this.distributionCodeDivClass}>
                                    <label htmlFor="voter-address-distribution-code" className="col-sm-4 control-label">
                                        {this.labels.distributionCode}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                            id="voter-address-distribution-code"
                                            placeholder={this.placeholders.distributionCode}
                                            value={this.props.voterDetails.distribution_code || ''}
                                            onChange={this.distributionCodeChange.bind(this)}
                                        />

                                        <span className="help-block">
                                            {this.distributionCodeErrorText}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="col-sm-6">
                                        <input type="radio" value="1"
                                            checked={this.props.voterDetails.actual_address_correct == 1}
                                            onChange={this.actualAddressCorrectChange.bind(this, 1)}
                                            disabled={!this.validInputs}
                                        />
                                        {'\u00A0'}
                                        {this.addressVerificationTexts.verified}
                                    </div>

                                    <div className="col-sm-6">
                                        <input type="radio" value="0"
                                            checked={this.props.voterDetails.actual_address_correct == 0}
                                            onChange={this.actualAddressCorrectChange.bind(this, 0)}
                                            disabled={!this.validInputs}
                                        />
                                        {'\u00A0'}
                                        {this.addressVerificationTexts.unVerified}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-sm-1">{'\u00A0'}</div>

                    <div className="col-sm-3 fieldGroup">
                        <div className="row"><h4>{this.miAddressText}</h4></div>

                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputCity-ver" className="col-sm-4 control-label">
                                    {this.labels.city}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="inputCity-ver"
                                        value={this.props.voterDetails.mi_city_name || ''}
                                        readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="voter-address-mi-neighborhood‬‏"
                                    className="col-sm-4 control-label">
                                    {this.labels.neighborhood}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control"
                                        id="voter-address-mi-neighborhood"
                                        value={this.props.voterDetails.mi_neighborhood || ''}
                                        readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="voter-address-mi-street-name" className="col-sm-4 control-label">
                                    {this.labels.street}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control"
                                        id="voter-address-mi-street-name"
                                        value={this.props.voterDetails.mi_street_name || ''} readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="voter-address-mi-house" className="col-sm-4 control-label">
                                    {this.labels.house}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="voter-address-mi-house"
                                        value={this.props.voterDetails.mi_house || ''} readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="voter-address-mi-house-entry" className="col-sm-4 control-label">
                                    {this.labels.houseEntry}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="voter-address-mi-house-entry"
                                        value={this.props.voterDetails.mi_house_entry || ''}
                                        readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="voter-address-mi-flat" className="col-sm-4 control-label">
                                    {this.labels.flat}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control"
                                        id="voter-address-mi-flat"
                                        value={this.props.voterDetails.mi_flat || ''} readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="voter-address-mi-zip" className="col-sm-4 control-label">
                                    {this.labels.zip}
                                </label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="voter-address-mi-zip"
                                        value={this.props.voterDetails.mi_zip || ''} readOnly />
                                </div>
                            </div>
                        </form>
                    </div>

                    {this.renderSaveButton()}

                    <ModalWindow show={this.props.showUpdateHouseholdAddressModal}
                        buttonOk={this.saveVoterAddressWithHouseholds.bind(this)}
                        buttonOkText={buttonOkText}
                        buttonCancel={this.saveVoterAddressOnly.bind(this)}
                        buttonCancelText={buttonCancelText}
                        title={this.updateHouseholdModalTitle}
                        style={{ zIndex: '9001' }}>
                        <div>{this.props.updateHouseholdAddressModalContent}</div>
                    </ModalWindow>

                    <ModalWindow show={this.props.showActualAddressCorrectModal}
                        buttonOk={this.updateActualAddessCorrectViaModal.bind(this, 1)}
                        buttonCancel={this.updateActualAddessCorrectViaModal.bind(this, 0)}
                        buttonOkText={buttonOkText}
                        buttonCancelText={buttonCancelText}
                        title={this.updateActualAddessCorrectModalTitle}
                        style={{ zIndex: '9001' }}>
                        <div>{this.updateActualAddessCorrectModalContent}</div>
                    </ModalWindow>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        voterDetails: state.voters.voterDetails,
        oldVoterDetails: state.voters.oldVoterDetails,
        cities: state.system.cities,
        cityStreets: state.voters.voterScreen.cityStreets,
        showUpdateHouseholdAddressModal: state.voters.voterScreen.showUpdateHouseholdAddressModal,
        updateHouseholdAddressModalContent: state.voters.voterScreen.updateHouseholdAddressModalContent,
        household: state.voters.voterScreen.household,
        showActualAddressCorrectModal: state.voters.voterScreen.showActualAddressCorrectModal,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterAddress));