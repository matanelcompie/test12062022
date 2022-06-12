import React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router';
import Collapse from 'react-collapse';
import _ from 'lodash';
/**/
import Combo from '../../../components/global/Combo';
import * as VoterActions from '../../../actions/VoterActions';
import {regexRing, checkPersonalIdentity, dateTimeWizard} from '../../../libs/globalFunctions';

class SearchVoterFilterPanel extends React.Component {

    constructor(props) {
        super(props);
        this.styleIgniter();
        this.textIgniter();
        this.activeLevel = _.findKey(this.props.searchVoterLevel, function (item) {
            return true === item;
        });
    }

    componentWillReceiveProps(nextProps) {
        this.activeLevel = _.findKey(nextProps.searchVoterLevel, function (item) {
            return true === item;
        });
    }

    componentDidUpdate(prevProps, prevState) {
        this.setAgeBirthDayRelation();
    }

    styleIgniter() {
        this.filterAlertStyle = {position: 'relative', top: '8px', fontSize: '1em', color: '#cc0000'};
        this.filterErrorStyle = {position: 'absolute', left: '20px', top: '30px'};
    }

    textIgniter() {

        this.baseLevel = 'חיפוש רגיל';
        this.advancedLevel = 'חיפוש מתקדם';
        this.ballotLevel = '';
        this.showEmptyFilterPanelMessage = 'יש לבחור מאפייני חיתוך לשאילתה';
        this.maximumExecutionTimeMessage = 'יש לצמצם מאפייני החיפוש';
        this.defaultStageName = 'Hannibal Lecter';

        this.personalIdentityField = 'ת\'\'ז';
        this.voterKeyField = 'קוד תושב';
        this.phoneField = 'מס\' טלפון';
        this.lastNameField = 'שם משפחה';
        this.firstNameField = 'שם פרטי';
        this.cityField = 'עיר';
        this.streetField = 'רחוב';
        this.birthYearField = 'שנת לידה';
        this.fatherFirstNameField = 'שם האב';
        this.minAgeField = 'מגיל';
        this.maxAgeField = 'עד גיל';
        this.houseNumberField = 'מס\' בית';
        /*=*/
        this.personalIdentityErrorMsg = 'זהות אישית שגויה';
        this.voterKeyErrorMsg = 'מספר בוחר שגוי';
        this.phoneErrorMsg = 'מספר הטלפון שגוי';
        this.lastNameErrorMsg = 'שם המשפחה שגוי';
        this.firstNameErrorMsg = 'שם פרטי שגוי';
        this.cityErrorMsg = 'שם עיר מוזרה';
        this.streetErrorMsg = 'שם רחוב שגוי';
        this.birthYearErrorMsg = 'שנת לידה שגויה';
        this.fatherFirstNameErrorMsg = 'שם פרטי האב שגוי';
        this.invalidAgeValue = 'גיל שגוי';
        this.missingAgeValue = 'חסר גיל';
        this.houseNumberErrorMsg = 'מספר בית שגוי';
        /*=*/
    }

    /**
     *
     * @param searchLevel
     * @param e
     */
    toggleSearchVoterLevel(searchLevel, e) {
        e.preventDefault();
        if (undefined != this.props.searchVoterLevel[searchLevel] && true == this.props.searchVoterLevel[searchLevel] && false == this.props.disableNewSearch) {
            /**
             * For the moment we have 2 levels only; so the function this.revolveLevel() wi'll be hammered in the future.
             */
            if ('base' == searchLevel) {
                searchLevel = 'advanced';
            } else {
                searchLevel = 'base';
            }
 
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_LEVEL, searchLevel: searchLevel});
        }
    }

    cleanSearchVoterResult(e) {
        e.preventDefault();
        if (!this.props.disableNewSearch) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_DATA});
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_MULTI_COMBO, cleanMultiCombo: true});
        }
    }

    searchVoterResult() {
        let searchParams = {};

        if (true == this.deepValidation()) {
            for (let i in this.props.searchForParams) {
                if (this.props.searchForParams[i].length < 1) {
                    continue;
                }
                let value = this.props.searchForParams[i];

                if (i == 'city') {
                    let list = this.props.searchForParams[i].map(function (city) {
                        return {'id': city.id};
                    });
                    value = JSON.stringify(list);
                }

                if (i == 'street') {
                    let list = this.props.searchForParams[i].map(function (item) {
                        return {'key': item.key, 'name': item.name};
                    });
                    value = JSON.stringify(list);
                }
                searchParams[i] = value.trim();
            }

            //if there is no street item selected and there is free text in searchStreetValue -> add the text to the searchParams
            if (!searchParams['street'] && this.props.searchStreetInputValue.length > 1) {
                searchParams['street_text'] = this.props.searchStreetInputValue;
            }

            let isAdvancedSearch = this.props.searchVoterLevel.advanced ? 1 : 0;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.RESET_SEARCH_RESULT});
            VoterActions.getVoterByParams(this.props.dispatch, searchParams, 0, isAdvancedSearch);
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.DISABLE_NEW_SEARCH, disableNewSearch: true});
        }
    }

    cancelGetVoterByParams() {
        VoterActions.cancelGetVoterByParams();
    }

    enterInterceptor(paramName, e) {
        if (false == this.props.disableNewSearch && 13 == e.charCode) { //Search when hit Enter
            e.preventDefault();
            this.searchVoterResult();
        }
    }

    onChangeSearchParams(paramName, e) {
        let tmp = {}, validResponse;
        validResponse = this.roughtValidation(paramName, e.target.value);

        if (true == validResponse) {
            if ('city' == paramName) {

                //if item selected from the combo -> clear the searchInputValue
                //otherwise (free text input from the keyboard)-> set the free text
                let cityInputValue = (this.props.searchForParams.city.length != e.target.selectedItems.length) ? '' : e.target.value;
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS_CITY_VALUE, cityInputValue});

                //clear streets list when the city was changed
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.LOAD_CITY_STREETS});

                //if only one city selected -> load it's streets (don't load streets if there is no city selected or many cities selected ...)
                if (e.target.selectedItems.length == 1) {
                    VoterActions.loadGeneralStreets(this.props.dispatch, e.target.selectedItems[0].key);
                }
            }
            if ('street' == paramName) {
                //if item selected from the combo -> clear the searchInputValue
                //otherwise (free text input from the keyboard)-> set the free text
                let searchInputValue = (this.props.searchForParams.street.length != e.target.selectedItems.length) ? '' : e.target.value;
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS_STREET_VALUE, searchInputValue});
                tmp['house_number']='';
            }

            let value = ('city' == paramName || 'street' == paramName) ? e.target.selectedItems : e.target.value;
            tmp[paramName] = value;
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS, searchForParams: tmp});
        }
    }

    /**
     * Here we do a primary input validation! There are two goals:
     *   - accept right chars only
     *   - don't ask for states evaluation on garbage values
     *
     * For example we don't allow non-integer values
     * on the phone input.
     *
     * @param fieldName
     * @param value
     * @returns {boolean}
     */
    roughtValidation(fieldName, value) {

        let regChars = /[-'"]/;

        let result = false;

        switch (fieldName) {

            case 'personal_identity':
                result = value.length <= 10 && (regexRing.isPositiveInteger(value) || (value == ''));
                break;
            case 'voter_key':
                result = value.length <= 10 && (regexRing.isPositiveInteger(value) || (value == ''));
                break;
            case 'phone':
                result = value.length <= 20 && (regexRing.isIntegerOrHyphen(value) || (value == ''));
                break;

            case 'first_name':
                result = value.length <= 20 && (regexRing.isStringOrBlank(value));
                break;

            case 'last_name':
                result = value.length <= 20 && (regexRing.isStringOrBlank(value));
                break;

            case 'city':
//                result = true;
                result = value.length <= 40;
                break;

            case 'street':
//                result = true;
                result = value.length <= 40;
                break;

            case 'house_number':
                result = value.length <= 5 && (regexRing.isPositiveInteger(value)|| (value == ''));
                break;

            case 'age_min':
                result = value.length <= 3 && (regexRing.isPositiveInteger(value) || (value == ''));
                break;

            case 'age_max':
                result = value.length <= 3 && (regexRing.isPositiveInteger(value) || (value == ''));
                break;

            case 'father_first_name':
                result = value.length <= 20 && regexRing.isStringOrBlank(value);
                break;

            case 'birth_year':
                result = value.length <= 5 && (regexRing.isPositiveInteger(value) || (value == ''));
                break;
        }

        return result;
    }

    /**
     * This is the serious :-) validation.
     *
     * @returns {boolean}
     */
    deepValidation() {
        let searchForErrorMsg;
        if (this.isEmptyFilter(this.props.searchForParams)) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_EMPTY_FILTER, showEmptyFilter: true});
            return false;
        }
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_EMPTY_FILTER, showEmptyFilter: false});

        //searchForParams = this.cloneFlatStructure(this.props.searchForParams);
        searchForErrorMsg = this.cloneFlatStructure(this.props.searchForErrorMsg);

        /**
         * Let's check the filter fields.tmp
         */
        if (!_.isEmpty(this.props.searchForParams.personal_identity)) {
            /* No Luhn check for the moment.
             if (true == checkPersonalIdentity(this.props.searchForParams.personal_identity)) {*/
            let length = this.props.searchForParams.personal_identity.trim().length;
            searchForErrorMsg.personal_identity = (!_.isNaN(length) && 2 <= length && length <= 10) ? '' : this.personalIdentityErrorMsg;
        }
        let voter_key = this.props.searchForParams.voter_key;
        if (!_.isEmpty(voter_key)) {

            let length = voter_key.trim().length;
            searchForErrorMsg.voter_key = (!_.isNaN(length) || (voter_key.toString().substr(1,1) != 0 && length == 10)) ? '' : this.voterKeyErrorMsg;
        }

        if (!_.isEmpty(this.props.searchForParams.first_name)) {
            searchForErrorMsg.first_name = (this.props.searchForParams.first_name.length > 1 && this.props.searchForParams.first_name.length <= 20) ? '' : this.firstNameErrorMsg;
        }

        if (!_.isEmpty(this.props.searchForParams.last_name)) {
            searchForErrorMsg.last_name = (this.props.searchForParams.last_name.length > 1 && this.props.searchForParams.last_name.length <= 20) ? '' : this.lastNameErrorMsg;
        }

        if (!_.isEmpty(this.props.searchForParams.city)) {
            /**
             * Here we expect hacking surprises only, due to the combo usage...
             */
            searchForErrorMsg.city = (this.props.searchForParams.city.length > 0) ? '' : this.cityErrorMsg;
        }

        if (!_.isEmpty(this.props.searchForParams.street)) {
            searchForErrorMsg.street = (this.props.searchForParams.street.length > 0) ? '' : this.streetErrorMsg;
        }

        /**
         * From here we have the extra fields for 'advanced search'
         */
        if (this.props.searchVoterLevel.advanced) {

            if (!_.isEmpty(this.props.searchForParams.birth_year)) {
                searchForErrorMsg.birth_year = (this.isValidVoterBirthYear(this.props.searchForParams.birth_year)) ? '' : this.birthYearErrorMsg;
            }

            if (!_.isEmpty(this.props.searchForParams.father_first_name)) {
                searchForErrorMsg.father_first_name = (this.props.searchForParams.father_first_name.length > 1 && this.props.searchForParams.father_first_name.length <= 20) ? '' : this.fatherFirstNameErrorMsg;
            }

            if (!_.isEmpty(this.props.searchForParams.age_min)) {
                searchForErrorMsg.age_min = (this.isValidVoterAge(this.props.searchForParams.age_min)) ? '' : this.invalidAgeValue;
            } else {
                searchForErrorMsg.age_min = (_.isEmpty(this.props.searchForParams.age_max)) ? '' : this.missingAgeValue;
            }

            if (!_.isEmpty(this.props.searchForParams.age_max)) {
                searchForErrorMsg.age_max = (this.isValidVoterAge(this.props.searchForParams.age_max)) ? '' : this.invalidAgeValue;
            } else {
                searchForErrorMsg.age_max = (_.isEmpty(this.props.searchForParams.age_min)) ? '' : this.missingAgeValue;
            }

            if (!_.isEmpty(this.props.searchForParams.house_number)) {
                searchForErrorMsg.house_number = (this.props.searchForParams.house_number.length >= 1 && this.props.searchForParams.house_number.length <= 5) ? '' : this.houseNumberErrorMsg;
            }
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_FILTER_ERROR_MSG, searchForErrorMsg: searchForErrorMsg});
        return (this.isEmptyFilter(searchForErrorMsg)) ? true : false;//return result
    }

    /**
     *
     * @returns {string}
     */
    showEmptyFilterPanelAlert() {
        let result = '';

        if (false == this.props.showEmptyFilterPanel && false == this.props.isMaximumExecutionTime) {
            result = '';
        } else {
            result = <span style={this.filterAlertStyle}>{this.props.isMaximumExecutionTime ? this.maximumExecutionTimeMessage : this.showEmptyFilterPanelMessage}</span>;
        }

        return result;
    }

    /**
     *
     * @param fieldName
     * @returns {string}
     */
    showFilterFieldAlert(fieldName) {

        let result = '', t;

        t = this.props.searchForErrorMsg[fieldName];

        if (undefined != t && false == _.isEmpty(t)) {
            result = <span className="help-block" style={this.filterErrorStyle}>{t}</span>;
        } else {
            result = '';
        }

        return result;
    }

    /**
     * Age limit and birth year are mutually exclusive for voters search.
     */
    setAgeBirthDayRelation() {
        let disallowAgeLimit = (undefined != this.props.searchForParams.birth_year && false == _.isEmpty(this.props.searchForParams.birth_year)) ? true : false;
        let disallowBirthYear = ((undefined != this.props.searchForParams.age_min && false == _.isEmpty(this.props.searchForParams.age_min))
                || (undefined != this.props.searchForParams.age_max && false == _.isEmpty(this.props.searchForParams.age_max))) ? true : false;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.TOGGLE_AGE_LIMIT, disallowBirthYear, disallowAgeLimit});
    }

    /**
     * Seem to be the safest method to get right the selected data from the Combo component.
     *
     * @param e
     * @returns {string}
     */
    comboValuesHandler(e) {

        let result = '', foundEmptyItem = false;

        if (undefined == e.target.selectedItems) {
            /*
             * Okay, we have a single select Combo
             */
            if (false == _.isEmpty(e.target.selectedItem)) {
                result = JSON.stringify([e.target.selectedItem]);
            }
        } else {
            /*
             * Okay, we have a multi select Combo
             */
            for (let i in e.target.selectedItems) {
                if (true == _.isEmpty(e.target.selectedItems[i])) {
                    foundEmptyItem = true;
                    break;
                }
            }
            if (false == foundEmptyItem) {
                result = JSON.stringify(e.target.selectedItems);
            }
        }

        return result;
    }

    /**
     * Return TRUE if we try to search for an empty filter.
     *
     * @param obj
     * @returns {boolean}
     */
    isEmptyFilter(obj) {

        if (false == _.isPlainObject(obj)) {
            return true;
        }

        let t, len = 0;

        for (let i in obj) {
            t = obj[i];
            if (true == _.isString(t)) {
                len = len + t.trim().length;
            } else {
                len = len + t.length;
            }
        }

        return (len > 0) ? false : true;
    }

    /**
     * We're talking about voter birth year, so let's be reasonable.
     * Something between 1850 and current year - 18 will be okay.
     * There are reasons to search even for ages < 18, so we'll
     * change the 'formula'
     *
     * @param birthYear
     * @returns {boolean}
     */
    isValidVoterBirthYear(birthYear) {

        let result = false, currentDate = dateTimeWizard(null, false, false);

        currentDate = 1 * currentDate.substring(6);
        birthYear = 1 * birthYear;

        /*if (1850 <= birthYear && birthYear <= (currentDate - 18)) {*/
        if (1850 <= birthYear && birthYear <= (currentDate)) {
            result = true;
        }
        return result;
    }

    /**
     * We're talking about voter age, so let's be reasonable too.
     * Something between 18 and 180 will be okay.
     * There are reasons to search even for ages < 18, so we'll
     * change the 'formula'
     *
     * @param voterAge
     * @returns {boolean}
     */
    isValidVoterAge(voterAge) {

        let result = false;

        voterAge = 1 * voterAge;

        /*if (18 <= voterAge && voterAge <= 180) {*/
        if (1 <= voterAge && voterAge <= 180) {
            result = true;
        }
        return result;
    }

    /**
     * Clone an object and initialize the properties with ''.
     *
     * @param obj
     * @returns {*}
     */
    cloneFlatStructure(obj) {
        let result;

        if (false == _.isPlainObject(obj)) {
            result = false;
        } else {
            result = {...obj};
            for (let i in result) {
                result[i] = '';
            }
        }

        return result;
    }

    /**
     * In the v2 we a "reunion" like HTML.
     *
     *     base level = base HTML
     * advanced level = base HTML & advanced HTML
     * So we don't need this.assemblySearchPanel()...
     */
    render() {
        return (
                <div id="searchVoterFilterPanel" className="dtlsBox srchPanel clearfix">
                    <div className="row">
                
                        <div className="col-xs-12 col-md-4">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="searchByID" className="col-sm-4 control-label">
                                        {this.personalIdentityField}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                               maxLength="10"
                                               tabIndex="1"
                                               value={this.props.searchForParams.personal_identity}
                                               onChange={this.onChangeSearchParams.bind(this, 'personal_identity')}
                                               onKeyPress={this.enterInterceptor.bind(this, 'personal_identity')}
                                               id="searchByID"/>
                                        {this.showFilterFieldAlert('personal_identity')}
                                    </div>
                                </div>
                                <div className="form-group">
                                        <label htmlFor="searchByVoterKey" className="col-sm-4 control-label">
                                            {this.voterKeyField}
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control"
                                                maxLength="10"
                                                tabIndex="1"
                                                value={this.props.searchForParams.voter_key}
                                                onChange={this.onChangeSearchParams.bind(this, 'voter_key')}
                                                onKeyPress={this.enterInterceptor.bind(this, 'voter_key')}
                                                id="searchByVoterKey"/>
                                            {this.showFilterFieldAlert('voter_key')}
                                        </div>
                                </div>
                             
                            </form>
                        </div>
                        <div className="col-xs-12 col-md-4">
                            <form className="form-horizontal">
                                <div className="form-group">
                                        <label htmlFor="searchByFirstName" className="col-sm-4 control-label">
                                            {this.firstNameField}
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control"
                                                tabIndex="3"
                                                maxLength="20"
                                                value={this.props.searchForParams.first_name}
                                                onChange={this.onChangeSearchParams.bind(this, 'first_name')}
                                                onKeyPress={this.enterInterceptor.bind(this, 'first_name')}
                                                id="searchByFirstName"/>
                                            {this.showFilterFieldAlert('first_name')}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="searchByCity" className="col-sm-4 control-label">
                                            {this.cityField}
                                        </label>
                                        <div className="col-sm-8">
                                            <Combo items={this.props.cities}
                                                tabIndex="5"
                                                value={this.props.searchCityInputValue}
                                                selectedItems={this.props.searchForParams.city}
                                                maxDisplayItems={12} itemIdProperty='id'
                                                itemDisplayProperty='name'
                                                maxLength="20"
                                                onChange={this.onChangeSearchParams.bind(this, 'city')}
                                                onKeyPress={this.enterInterceptor.bind(this, 'city')}
                                                id='searchByCity' multiSelect={true}
                                                inputStyle={{borderColor:(this.props.searchCityInputValue.trim() == '' ? "#cccccc":"#ff0000")}}
                                                />
                                                
                                            {this.showFilterFieldAlert('city')}
                                        </div>
                                    </div>
                            </form>
                        </div>
                        <div className="col-xs-12 col-md-4">
                            <form className="form-horizontal">
                            <div className="form-group">
                                    <label htmlFor="searchByLastName" className="col-sm-4 control-label">
                                        {this.lastNameField}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                               tabIndex="2"
                                               maxLength="20"
                                               value={this.props.searchForParams.last_name}
                                               onChange={this.onChangeSearchParams.bind(this, 'last_name')}
                                               onKeyPress={this.enterInterceptor.bind(this, 'last_name')}
                                               id="searchByLastName"/>
                                        {this.showFilterFieldAlert('last_name')}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="searchByPhone" className="col-sm-4 control-label">
                                        {this.phoneField}
                                    </label>
                                    <div className="col-sm-8">
                                        <input type="text" className="form-control"
                                               tabIndex="4"
                                               maxLength="20"
                                               value={this.props.searchForParams.phone}
                                               onChange={this.onChangeSearchParams.bind(this, 'phone')}
                                               onKeyPress={this.enterInterceptor.bind(this, 'phone')}
                                               id="searchByPhone"/>
                                        {this.showFilterFieldAlert('phone')}
                                    </div>
                                </div>
                            </form>
                        </div>
                        {  this.props.searchVoterLevel.advanced == true && <div >

                            <div className="col-xs-12 col-md-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label htmlFor="searchByStreet" className="col-sm-4 control-label">
                                            {this.streetField}
                                        </label>
                                        <div className="col-sm-8">
                                            <Combo items={this.props.cityStreets}
                                                tabIndex="6"
                                                value={this.props.searchStreetInputValue}
                                                selectedItems={this.props.searchForParams.street}
                                                maxDisplayItems={12} itemIdProperty='key'
                                                itemDisplayProperty='name'
                                                maxLength="20"
                                                onChange={this.onChangeSearchParams.bind(this, 'street')}
                                                onKeyPress={this.enterInterceptor.bind(this, 'street')}
                                                id='searchByStreet' multiSelect={true}
                                                inputStyle={{borderColor:(this.props.searchStreetInputValue.trim() == '' ? "#cccccc":"#ff0000")}}
                                                />
                    
                                            {this.showFilterFieldAlert('street')}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="birthYear" className={"col-sm-4 control-label" + (this.props.disallowBirthYear ? ' not-visible' : '')}>
                                            {this.birthYearField}
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control"
                                                   tabIndex="7"
                                                   maxLength="5"
                                                   value={this.props.searchForParams.birth_year}
                                                   onChange={this.onChangeSearchParams.bind(this, 'birth_year')}
                                                   onKeyPress={this.enterInterceptor.bind(this, 'birth_year')}
                                                   id="birthYear" readOnly={this.props.disallowBirthYear}/>
                                            {this.showFilterFieldAlert('birth_year')}
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-xs-12 col-md-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                        <label htmlFor="fatherFirstName" className="col-sm-4 control-label">
                                            {this.fatherFirstNameField}
                                        </label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control"
                                                   tabIndex="10"
                                                   maxLength="20"
                                                   value={this.props.searchForParams.father_first_name}
                                                   onChange={this.onChangeSearchParams.bind(this, 'father_first_name')}
                                                   onKeyPress={this.enterInterceptor.bind(this, 'father_first_name')}
                                                   id="fatherFirstName"/>
                                            {this.showFilterFieldAlert('father_first_name')}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ageMin" className={"col-sm-4 control-label" + (this.props.disallowAgeLimit ? ' not-visible' : '')}>{this.minAgeField}</label>
                                        <div className="col-sm-8">
                                            <input type="text" className="form-control"
                                                   tabIndex="8"
                                                   maxLength="3"
                                                   value={this.props.searchForParams.age_min}
                                                   onChange={this.onChangeSearchParams.bind(this, 'age_min')}
                                                   id="ageMin" onKeyPress={this.enterInterceptor.bind(this, 'age_min')}
                                                   readOnly={this.props.disallowAgeLimit}/>
                                            {this.showFilterFieldAlert('age_min')}
                                        </div>
                                    </div>

                                </form>
                            </div>
                            <div className="col-xs-12 col-md-4">
                                <form className="form-horizontal">
                                    <div className="form-group">
                                            <label htmlFor="houseNumber" className="col-sm-4 control-label">
                                                {this.houseNumberField}
                                            </label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control"
                                                    tabIndex="11"
                                                    maxLength="5"
                                                    disabled={(this.props.searchForParams.street.length || this.props.searchStreetInputValue.length>2?'':'disabled')}
                                                    value={this.props.searchForParams.house_number}
                                                    onChange={this.onChangeSearchParams.bind(this, 'house_number')}
                                                    onKeyPress={this.enterInterceptor.bind(this, 'house_number')}
                                                    id="houseNumber"/>
                                                {this.showFilterFieldAlert('house_number')}
                                            </div>
                                    </div>
                                    <div className="form-group">
                                            <label htmlFor="ageMax" className={"col-sm-4 control-label" + (this.props.disallowAgeLimit ? ' not-visible' : '')}>
                                                {this.maxAgeField}
                                            </label>
                                            <div className="col-sm-8">
                                                <input type="text" className="form-control"
                                                    tabIndex="9"
                                                    maxLength="3"
                                                    value={this.props.searchForParams.age_max}
                                                    onChange={this.onChangeSearchParams.bind(this, 'age_max')} id="ageMax"
                                                    onKeyPress={this.enterInterceptor.bind(this, 'age_max')}
                                                    readOnly={this.props.disallowAgeLimit}/>
                                                {this.showFilterFieldAlert('age_max')}
                                            </div>
                                    </div>
                                    <div className="form-group">
                                        <div className="col-sm-12">
                                            <span style={{lineHeight: '34px'}}>
                                                &nbsp;</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                        </div>}
                        <div className="row">
                            <div className="col-xs-4 col-sm-4 srchPanelBottom">
                                <a title="חיפוש מתקדם" className={"textLink Medium" + (this.props.disableNewSearch ? ' disabled' : '')} 
                                   onClick={this.toggleSearchVoterLevel.bind(this, this.activeLevel)} >
                                    {(false == this.props.searchVoterLevel.advanced) ? this.advancedLevel : this.baseLevel}
                                </a>
                                <a title="נקה שדות" className={"textLink Medium clearField" + (this.props.disableNewSearch ? ' disabled' : '')}  
                                   onClick={this.cleanSearchVoterResult.bind(this)}>נקה שדות
                                </a>
                            </div>
                            <div className="col-xs-4 col-sm-6"><span>{this.showEmptyFilterPanelAlert()}</span></div>
                            <div className="col-xs-2 col-sm-2">
                                <button className={"btn btn-danger" + (this.props.disableNewSearch ? '' : ' hidden')} title="בטל חיפוש" 
                                        onClick={this.cancelGetVoterByParams.bind(this)}>
                                    <i className="fa fa-chain-broken"></i>
                                </button>
                                <button className="btn btn-primary pull-left srchBtn voterSrchBtn" onClick={this.searchVoterResult.bind(this)} disabled={this.props.disableNewSearch || (this.props.searchCityInputValue.trim() != '' || this.props.searchStreetInputValue.trim() != '')}>
                                    {this.props.searchVoterLoading ? 'טוען' : 'חפש'}
                                    <i className={"fa fa-spinner fa-spin pull-right" + (this.props.searchVoterLoading ? '' : ' hidden')} style={{marginTop: 5}}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                        )
            }
        }

        function mapStateToProps(state) {

            return {
                searchVoterLevel: state.voters.searchVoterScreen.searchVoterLevel,
                searchForParams: state.voters.searchVoterScreen.searchForParams,
                showEmptyFilterPanel: state.voters.searchVoterScreen.showEmptyFilterPanel,
                searchForErrorMsg: state.voters.searchVoterScreen.searchForErrorMsg,
                disallowBirthYear: state.voters.searchVoterScreen.disallowBirthYear,
                disallowAgeLimit: state.voters.searchVoterScreen.disallowAgeLimit,
                disableNewSearch: state.voters.searchVoterScreen.disableNewSearch,
                isMaximumExecutionTime: state.voters.searchVoterScreen.isMaximumExecutionTime,
                cleanMultiCombo: state.voters.searchVoterScreen.cleanMultiCombo,
                searchVoterResult: state.voters.searchVoterScreen.searchVoterResult,
                searchVoterDetails: state.voters.searchVoterScreen.searchVoterDetails,
                searchVoterLoading: state.voters.searchVoterScreen.searchVoterLoading,
                searchVoterCurrentPage: state.voters.searchVoterScreen.searchVoterCurrentPage,
                searchVoterHasMore: state.voters.searchVoterScreen.searchVoterHasMore,
                searchVoterCount: state.voters.searchVoterScreen.searchVoterCount,
                searchCityInputValue: state.voters.searchVoterScreen.searchCityInputValue,
                searchStreetInputValue: state.voters.searchVoterScreen.searchStreetInputValue,
                cityStreets: state.voters.searchVoterScreen.cityStreets,
                cities: state.system.cities,
                currentUser: state.system.currentUser,
            }
        }

        export default connect(mapStateToProps)(withRouter(SearchVoterFilterPanel));
