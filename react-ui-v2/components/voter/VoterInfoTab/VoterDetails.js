import React from 'react';
import { Link, withRouter } from 'react-router';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import Combo from '../../global/Combo';

import { parseDateToPicker, parseDateFromPicker } from '../../../libs/globalFunctions';
import ModalWindow from '../../global/ModalWindow';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterDetails extends React.Component {

    constructor(props) {
        super(props);
		this.state={showConfirmRemoveDeceased:false};

        momentLocalizer(moment);
        this.initConstants();
    }

    initConstants() {
        this.birthDateCombo = [];

        this.placeholders = {
            personalIdentity: 'ת"ז',
            lastName: 'שם משפחה',
            firstName: 'שם פרטי',
            prevName: 'שם משפחה קודם',
            birthDate: 'תאריך לידה',
            originCountry: 'ארץ לידה',
            fatherName: 'שם האב',
            ethnic: 'עדה',
            religiousGroup: 'זרם',
            sefaradi: 'ספרדי',
            gender: 'מגדר',
			isDecease:'נפטר'
        };

        this.labels = {
            personalIdentity: 'ת"ז',
            lastName: 'שם משפחה',
            firstName: 'שם פרטי',
            prevName: 'שם משפחה קודם',
            birthDate: 'תאריך לידה',
            originCountry: 'ארץ לידה',
            fatherName: 'שם האב',
            ethnic: 'עדה',
            religiousGroup: 'זרם',
            sefaradi: 'ספרדי',
            title: 'תואר',
            ending: 'סיומת',
            gender: 'מגדר',
			isDecease:'נפטר'
        };

        this.sepharadiList = [{ id: 0, name: 'לא' }, { id: 1, name: 'כן' }];

        this.gender = require('../../../libs/constants').gender;

        this.genderList = [ { id: this.gender.male, name: 'זכר' }, { id: this.gender.female, name: 'נקבה' } ];

        this.saveButtonText = 'שמירה';

        this.tooltip = {
            undoChanges: 'לבטל שינויים'
        };

        this.undoButtonStyle = {
            marginLeft: "10px"
        };

        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.birth_date_types = require('../../../libs/constants').birth_date_types;

        this.birthDateCombo = [
            { id: this.birth_date_types.year, name: "שנה" },
            { id: this.birth_date_types.month, name: "חודש" },
            { id: this.birth_date_types.date, name: "תאריך מלא" }
        ];

        this.datePickerViews = require('../../../libs/constants').datePickerViews;

        this.setDirtyTarget = "elections.voter.additional_data.details";
    }

    initVariables() {
        this.birthDateDivClass = "form-group";
        this.sepharadiDivClass = "form-group";
        this.countryDivClass = "form-group";
        this.ethnicDivClass = "form-group";
        this.religiousGroupDivClass = "form-group";
        this.titleDivClass = "form-group";
        this.endingDivClass = "form-group";
        this.genderDivClass = "form-group";

        this.dateTypeStyle = {
            borderColor: this.borderColor.valid
        };

        switch (this.props.voterDetails.birth_date_type) {
            case this.birth_date_types.year:
                this.datePickerInitilaView = this.datePickerViews.decade;
                this.datePickerFinalView = this.datePickerViews.decade;
                break;

            case this.birth_date_types.month:
                this.datePickerInitilaView = this.datePickerViews.year;
                this.datePickerFinalView = this.datePickerViews.year;
                break;

            case this.birth_date_types.date:
                this.datePickerInitilaView = this.datePickerViews.month;
                this.datePickerFinalView = this.datePickerViews.month;
                break;
        }
		
	 
    }

    /**
     *  This function restores the values of
     *  voter details before the changes
     */
    undoDetailsChanges(e) {
        // Prevent page refresh
        e.preventDefault();

        this.props.dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_UNDO_CHANGES });

        this.props.dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget });
    }

    saveDetails(e) {
        // Prevent page refresh
        e.preventDefault();

        if (!this.validInputs) {
            return;
        }

        let voterData = [];
        let voterKey = this.props.router.params.voterKey;
        let sephardi = -1;

        if (null == this.props.voterDetails.birth_date) {
            this.props.dispatch({
                type: VoterActions.ActionTypes.VOTER.VOTER_BIRTH_DATE_TYPE_INPUT_CHANGE,
                birth_date_type: null, birth_date_type_name: ''
            });

            voterData.push({ key: 'birth_date', value: null });
            voterData.push({ key: 'birth_date_type', value: null });
        } else {
            voterData.push({ key: 'birth_date', value: this.props.voterDetails.birth_date });
            voterData.push({ key: 'birth_date_type', value: this.props.voterDetails.birth_date_type });
        }


        if (this.props.voterDetails.origin_country_id == 0) {
            voterData.push({ key: 'origin_country_id', value: null });
        } else {
            voterData.push({ key: 'origin_country_id', value: this.props.voterDetails.origin_country_id });
        }

        if (this.props.voterDetails.voter_title_id == 0) {
            voterData.push({ key: 'voter_title_id', value: null });
        } else {
            voterData.push({ key: 'voter_title_id', value: this.props.voterDetails.voter_title_id });
        }

        if (this.props.voterDetails.voter_ending_id == 0) {
            voterData.push({ key: 'voter_ending_id', value: null });
        } else {
            voterData.push({ key: 'voter_ending_id', value: this.props.voterDetails.voter_ending_id });
        }

        if (this.props.voterDetails.ethnic_group_id == 0) {
            voterData.push({ key: 'ethnic_group_id', value: null });
        } else {
            voterData.push({ key: 'ethnic_group_id', value: this.props.voterDetails.ethnic_group_id });
        }

        if (this.props.voterDetails.religious_group_id == 0) {
            voterData.push({ key: 'religious_group_id', value: null });
        } else {
            voterData.push({ key: 'religious_group_id', value: this.props.voterDetails.religious_group_id });
        }

        if (this.props.voterDetails.sephardi == -1) {
            sephardi = null;
        } else {
            sephardi = this.props.voterDetails.sephardi;
        }
        voterData.push({ key: 'sephardi', value: sephardi });

        voterData.push({ key: 'gender', value: this.props.voterDetails.gender });
		
		let isDecease = null;
		let deceasedDate = null;
		if(this.props.voterDetails.deceased == '1'){
			 voterData.push({ key: 'deceased', value: '1'});
			 deceasedDate = this.props.voterDetails.deceased_date ;

			   voterData.push({ key: 'deceased_date', value: deceasedDate});
		}
		else{
			voterData.push({ key: 'deceased', value: '0'});
			voterData.push({ key: 'deceased_date', value: null});
		}
 
        VoterActions.saveVoterDetails(this.props.dispatch, voterKey, voterData);
    }

    getEndingId(endingName) {
        let endingList = this.props.voterEnding;
        let endingIndex = -1;
        let endingId = 0;

        endingIndex = endingList.findIndex(endingItem => endingItem.name == endingName);
        if (-1 == endingIndex) {
            return 0;
        } else {
            endingId = endingList[endingIndex].id;
            return endingId;
        }
    }

    endingChange(e) {
        var endingName = e.target.value;
        var endingId = 0;

        endingId = this.getEndingId(endingName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_ENDING_CHANGE,
            endingId: endingId, endingName: endingName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getTitleId(titleName) {
        let titleList = this.props.voterTitle;
        let titleIndex = -1;
        let titleId = 0;

        titleIndex = titleList.findIndex(titleListItem => titleListItem.name == titleName);
        if (-1 == titleIndex) {
            return 0;
        } else {
            titleId = titleList[titleIndex].id;
            return titleId;
        }
    }

    titleChange(e) {
        var titleName = e.target.value;
        var titleId = 0;

        titleId = this.getTitleId(titleName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_TITLE_CHANGE,
            titleId: titleId, titleName: titleName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    religiousGroupChange(e) {
        let religiousGroupName = e.target.value;
        let religiousGroupId = 0;
        if (e.target.selectedItem != null) religiousGroupId = e.target.selectedItem.id;

        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_RELIGIOUS_GROUP_CHANGE,
            religiousGroupId: religiousGroupId, religiousGroupName: religiousGroupName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });        
    }

    getEthnicSephardi(ethnicGroupId) {
        let ethnicList = this.props.ethnicList;
        let ethnicGroupIdIndex = -1;
        let ethnicGroupSephardi = "";

        ethnicGroupIdIndex = ethnicList.findIndex(ethnicItem => ethnicItem.id == ethnicGroupId);
        if (-1 == ethnicGroupIdIndex) {
            return null;
        } else {
            ethnicGroupSephardi = ethnicList[ethnicGroupIdIndex].sephardi;
            return ethnicGroupSephardi;
        }
    }

    getEthnicId(ethnicGroupName) {
        let ethnicList = this.props.ethnicList;
        let ethnicGroupIdIndex = -1;
        let ethnicGroupId = 0;

        ethnicGroupIdIndex = ethnicList.findIndex(ethnicItem => ethnicItem.name == ethnicGroupName);
        if (-1 == ethnicGroupIdIndex) {
            return 0;
        } else {
            ethnicGroupId = ethnicList[ethnicGroupIdIndex].id;
            return ethnicGroupId;
        }
    }

    ethnicChange(e) {
        var ethnicGroupName = e.target.value;
        var ethnicGroupId = 0;
        var ethnicGroupSephardi = "";

        ethnicGroupId = this.getEthnicId(ethnicGroupName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_ETHNIC_CHANGE,
            ethnicGroupId: ethnicGroupId, ethnicGroupName: ethnicGroupName
        });

        if (ethnicGroupId > 0) {
            ethnicGroupSephardi = this.getEthnicSephardi(ethnicGroupId);

            if ( null == ethnicGroupSephardi ) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SEPHARDI_CHANGE, sephardi: -1,
                                     sephardiName: "" });
            } else {
                switch (ethnicGroupSephardi) {
                    case 0:
                        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SEPHARDI_CHANGE, sephardi: 0,
                                             sephardiName: "לא" });
                        break;

                    case 1:
                        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SEPHARDI_CHANGE, sephardi: 1,
                                             sephardiName: "כן" });
                        break;
                }
            }
        }

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getCountryId(countryName) {
        let countriesList = this.props.countries;
        let countryIndex = -1;
        let countryId = 0;

        countryIndex = countriesList.findIndex(countryItem => countryItem.name == countryName);
        if (-1 == countryIndex) {
            return 0;
        } else {
            countryId = countriesList[countryIndex].id;
            return countryId;
        }
    }
	
	deceaseDateChange(value , filter){

		this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.GENERAL_FIELD_CHANGE,
            fieldName:'deceased_date' , fieldValue:value});

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
	}

	
	 deceasedCheckboxChange(e) {
 
			if(this.props.voterDetails.deceased == '1' && !e.target.checked){
				this.showHideConfirmRemoveDeceased(true);
			}
			else{
			this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.GENERAL_FIELD_CHANGE,
            fieldName:'deceased' , fieldValue:'1'});
     
             this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
			}
    }

    countryChange(e) {
        var countryName = e.target.value;
        var countryId = 0;

        countryId = this.getCountryId(countryName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_COUNTRY_CHANGE,
            countryId: countryId, countryName: countryName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getGenderId(genderName) {
        let genderList = this.genderList;
        let genderIndex = -1;
        let genderId = 0;

        genderIndex = genderList.findIndex(genderItem => genderItem.name == genderName);
        if (-1 == genderIndex) {
            return null;
        } else {
            genderId = genderList[genderIndex].id;
            return genderId;
        }
    }

    genderChange(e) {
        var genderName = e.target.value;
        var genderId = null;

        genderId = this.getGenderId(genderName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_GENDER_CHANGE,
            genderId: genderId, genderName: genderName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getSephardiId(sephardiName) {
        let sepharadiList = this.sepharadiList;
        let sepharadiIndex = -1;
        let sepharadiId = 0;

        sepharadiIndex = sepharadiList.findIndex(sepharadiItem => sepharadiItem.name == sephardiName);
        if (-1 == sepharadiIndex) {
            return -1;
        } else {
            sepharadiId = sepharadiList[sepharadiIndex].id;
            return sepharadiId;
        }
    }

    sephardiChange(e) {
        var sephardiName = e.target.value;
        var sepharadiId = -1;

        sepharadiId = this.getSephardiId(sephardiName);
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SEPHARDI_CHANGE,
                             sephardi: sepharadiId, sephardiName: sephardiName});

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    getBirthDateTypeId(birthDateTypeName) {
        var typeIndex = -1;
        var birthDateTypeId = 0;

        typeIndex = this.birthDateCombo.findIndex(typeItem => typeItem.name == birthDateTypeName);
        if (-1 == typeIndex) {
            return null;
        } else {
            return this.birthDateCombo[typeIndex].id;
        }
    }

    birthDateTypeChange(e) {
        var birthDateTypeName = e.target.value;
        var birthDateTypeId = 0;

        birthDateTypeId = this.getBirthDateTypeId(birthDateTypeName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_BIRTH_DATE_TYPE_INPUT_CHANGE,
            birth_date_type: birthDateTypeId, birth_date_type_name: birthDateTypeName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    birthDateChange(value, format, filter) {
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_BIRTH_DATE_INPUT_CHANGE,
            birth_date: value
        });

        if (null == value) {
            this.props.dispatch({
                type: VoterActions.ActionTypes.VOTER.VOTER_BIRTH_DATE_TYPE_INPUT_CHANGE,
                birth_date_type: null, birth_date_type_name: ''
            });
        }

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }
	
	
    validateBirthDateType() {
        var birth_date = this.props.voterDetails.birth_date;
        var birth_date_type = this.props.voterDetails.birth_date_type;
        var birth_date_type_name = this.props.voterDetails.birth_date_type_name;

        if (null == birth_date_type) {
            if (0 == birth_date_type_name.length) {
                return true;
            } else {
                // If it's a jibrish or non existing birth date type name
                return false;
            }
        } else {
            return true;
        }
    }

    validateBirthDate() {
        if (null == this.props.voterDetails.birth_date) {
            return true;
        }

        return moment(this.props.voterDetails.birth_date, this.dateFormat, true).isValid();
    }

    validateGender() {
        var genderName = this.props.voterDetails.gender_name;
        var genderId = this.props.voterDetails.gender;

        if (0 == genderName.length) {
            return true;
        }

        if (null == genderId) {
            return false;
        } else {
            return true;
        }
    }

    validateSephardi() {
        var sephardiName = this.props.voterDetails.sephardi_name;
        var sephardiId = this.props.voterDetails.sephardi;

        if (0 == sephardiName.length) {
            return true;
        }

        if (-1 == sephardiId) {
            return false;
        } else {
            return true;
        }
    }

    validateEnding() {
        var endingName = this.props.voterDetails.voter_ending_name;
        var endingId = this.props.voterDetails.voter_ending_id;

        if (0 == endingName.length) {
            return true;
        }

        if (0 == endingId) {
            return false;
        } else {
            return true;
        }
    }

    validateTitle() {
        var titleName = this.props.voterDetails.voter_title_name;
        var titleId = this.props.voterDetails.voter_title_id;

        if (0 == titleName.length) {
            return true;
        }

        if (0 == titleId) {
            return false;
        } else {
            return true;
        }
    }

    validateEthnic() {
        var ethnicName = this.props.voterDetails.ethnic_group_name;
        var ethnicId = this.props.voterDetails.ethnic_group_id;

        if (0 == ethnicName.length) {
            return true;
        }

        if (0 == ethnicId) {
            return false;
        } else {
            return true;
        }
    }

    validateReligiousGroup() {
        var religiousGroupName = this.props.voterDetails.religious_group_name;
        var religiousGroupId = this.props.voterDetails.religious_group_id;

        if (0 == religiousGroupName.length) {
            return true;
        }

        if (0 == religiousGroupId) {
            return false;
        } else {
            return true;
        }
    }

    validateCountry() {
        var countryName = this.props.voterDetails.origin_country_name;
        var countryId = this.props.voterDetails.origin_country_id;

        if (0 == countryName.length) {
            return true;
        }

        if (0 == countryId) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        if (this.validateBirthDate()) {
            this.birthDateDivClass = "form-group";
            this.birthDateErrorText = "";
        } else {
            this.validInputs = false;
            this.birthDateDivClass = "form-group has-error";
            this.birthDateErrorText = 'תאריך לא תקני';
        }

        if (this.validateBirthDateType()) {
            this.dateTypeStyle.borderColor = this.borderColor.valid;
        } else {
            this.validInputs = false;
            this.dateTypeStyle.borderColor = this.borderColor.inValid;
        }

        if (this.validateSephardi()) {
            this.sepharadiDivClass = "form-group";
            this.sepharadiErrorText = "";
        } else {
            this.validInputs = false;
            this.sepharadiDivClass = "form-group has-error";
            this.sepharadiErrorText = "בחירה לא תקנית";
        }

        if (this.validateGender()) {
            this.genderDivClass = "form-group";
            this.genderErrorText = "";
        } else {
            this.validInputs = false;
            this.genderDivClass = "form-group has-error";
            this.genderErrorText = "בחירה לא תקנית";
        }

        if (this.validateCountry()) {
            this.countryDivClass = "form-group";
            this.countryErrorText = "";
        } else {
            this.validInputs = false;
            this.countryDivClass = "form-group has-error";
            this.countryErrorText = "בחירה לא תקנית";
        }

        if (this.validateEthnic()) {
            this.ethnicDivClass = "form-group";
            this.ethnicErrorText = "";
        } else {
            this.validInputs = false;
            this.ethnicDivClass = "form-group has-error";
            this.ethnicErrorText = "בחירה לא תקנית";
        }

        if (this.validateReligiousGroup()) {
            this.religiousGroupDivClass = "form-group";
            this.religiousGroupErrorText = "";
        } else {
            this.validInputs = false;
            this.religiousGroupDivClass = "form-group has-error";
            this.religiousGroupErrorText = "בחירה לא תקנית";
        }

        if (this.validateTitle()) {
            this.titleDivClass = "form-group";
            this.titleErrorText = "";
        } else {
            this.validInputs = false;
            this.titleDivClass = "form-group has-error";
            this.titleErrorText = "בחירה לא תקנית";
        }

        if (this.validateEnding()) {
            this.endingDivClass = "form-group";
            this.endingErrorText = "";
        } else {
            this.validInputs = false;
            this.endingDivClass = "form-group has-error";
            this.endingErrorText = "בחירה לא תקנית";
        }
		
		 
    }

    renderButton() {
        var displayButton = false;
        var undoClassButton = "";

        if (this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.additional_data.details.edit'] == true) {
            displayButton = true;
        }

        /* The save button will not be displayed in 1 of these cases:
         * The input is not valid
         * No input data has been changed
         * The data is being saved in the server
         */
        if (displayButton) {
            // Checking if any detail has changed
            // in order to decide whether to
            // display the undo changes button.
            if (!this.detailsHaveChanged) {
                undoClassButton = "btn btn-danger pull-left hidden";
            } else {
                undoClassButton = "btn btn-danger pull-left";
            }

            return (
                <div className="form-group">
                    <div className="">
                        <button className="btn btn-primary saveChanges"
                            onClick={this.saveDetails.bind(this)}
                            disabled={!this.validInputs || !this.detailsHaveChanged || this.props.savingChanges}>
                            {this.saveButtonText}
                        </button>
                        <button className={undoClassButton}
                            style={this.undoButtonStyle}
                            title={this.tooltip.undoChanges}
                            onClick={this.undoDetailsChanges.bind(this)}
                            disabled={this.props.savingChanges}>
                            <i className="fa fa-undo fa-6" />
                        </button>
                    </div>
                </div>
            );
        }
    }

    /*
     *  This function checks if any changes
     *  have been made in any details.
     *
     *  If no changes have been made to details
     *  the save button will be disabled
     */
    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.detailsHaveChanged = false;
        } else {
            this.detailsHaveChanged = true;
        }
    }

	/*
		Handles showing/hiding modal dialog if user cancels voter deceased status
	*/
	showHideConfirmRemoveDeceased(showModal){
		this.setState({showConfirmRemoveDeceased:showModal});
		
	}
	
	/*
		Handles clicking 'ok' on deceased question modal dialog
	*/
	removeDeceased(){
		this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.GENERAL_FIELD_CHANGE,
            fieldName:'deceased' , fieldValue:'0'});
         
		this.props.dispatch({
                type: VoterActions.ActionTypes.VOTER.GENERAL_FIELD_CHANGE,
               fieldName:'deceased_date' , fieldValue:''
             });
			 
         this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
		 this.setState({showConfirmRemoveDeceased:false});
	}
	
    render() {

        this.initVariables();
 
        this.validateVariables();

        // This function checks if any changes have been made in any input.
        // If no changes have been made to details, the save button will be disabled
        this.checkAnyChanges();
        return (
            <Collapse isOpened={this.props.containerCollapseStatus.infoDetails}>
                <div className="row CollapseContent">
                    <div className="col-lg-4">
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="idNumber" className="col-sm-4 control-label">
                                    {this.labels.personalIdentity}
                                </label>
                                <div className="col-sm-8">
                                    {this.props.voterDetails.personal_identity}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="inputFamily" className="col-sm-4 control-label">
                                    {this.labels.firstName}
                                </label>
                                <div className="col-sm-8">
                                    {this.props.voterDetails.first_name}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="inputPersonal" className="col-sm-4 control-label">
                                    {this.labels.lastName}
                                </label>
                                <div className="col-sm-8">
                                    {this.props.voterDetails.last_name}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="inputMaiden" className="col-sm-4 control-label">
                                    {this.labels.prevName}
                                </label>
                                <div className="col-sm-8">
                                    {this.props.voterDetails.previous_last_name}
                                </div>
                            </div>
							
							 <div className="form-group">
                                <label htmlFor="inputBirthPlace" className="col-sm-4 control-label">
                                    {this.labels.originCountry}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.props.countries}
                                        id="inputBirthPlace"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.origin_country_name}
                                        className="form-combo-table"
                                        onChange={this.countryChange.bind(this)} />
                                    <span id="helpBlockCountry" className="help-block">
                                        {this.countryErrorText}
                                    </span>
                                </div>
							 </div>
                        </form>
                    </div>

                    <div className="col-lg-4">
                        <form className="form-horizontal">
                            <div className={this.birthDateDivClass}>
                                <label htmlFor="inputDate" className="col-sm-4 control-label">
                                    {this.labels.birthDate}
                                </label>

                                <div className="col-sm-4">
                                    <Combo items={this.birthDateCombo}
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.birth_date_type_name}
                                        className="form-combo-table"
                                        inputStyle={this.dateTypeStyle}
                                        onChange={this.birthDateTypeChange.bind(this)} />
                                </div>

                                <div className="col-sm-4 no-padding picker-fixed-height">
                                    <ReactWidgets.DateTimePicker
                                        isRtl={true} time={false}
                                        value={parseDateToPicker(this.props.voterDetails.birth_date)}
                                        onChange={parseDateFromPicker.bind(this, {
                                            callback: this.birthDateChange,
                                            format: "YYYY-MM-DD",
                                            functionParams: 'dateTime'
                                        })
                                        }
                                        initialView={this.datePickerInitilaView}
                                        finalView={this.datePickerFinalView}
                                        format="DD/MM/YYYY"
                                    />
                                </div>
                            </div>

                            <div className={this.countryDivClass}>
                                <label htmlFor="inputBirthPlace" className="col-sm-4 control-label">
                                    {this.labels.isDecease}
                                </label>
                                <div className="col-sm-8">
								<div className="row">
								<div className="col-md-2">
									<input type="checkbox" checked={this.props.voterDetails.deceased == '1'}  className="form-control" onChange={this.deceasedCheckboxChange.bind(this)}/>
								</div>
								<div className="col-md-10 no-padding picker-fixed-height"> 
                                     <ReactWidgets.DateTimePicker
                                        isRtl={true} time={false}
                                        value={parseDateToPicker(this.props.voterDetails.deceased_date)}
                                        onChange={parseDateFromPicker.bind(this, {
                                            callback: this.deceaseDateChange,
                                            format: "YYYY-MM-DD",
                                            functionParams: 'dateTime'
                                        })
                                        }
										disabled={this.props.voterDetails.deceased != '1'}
                                
                                        format="DD/MM/YYYY"
                                    />
									 
										</div>
                                    <span id="helpBlockCountry" className="help-block">
                                        {this.countryErrorText}
                                    </span>
									</div>
                                </div>
                            </div>

                            <div className={this.titleDivClass}>
                                <label htmlFor="inputTitle" className="col-sm-4 control-label">
                                    {this.labels.title}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.props.voterTitle}
                                        id="inputTitle"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.voter_title_name}
                                        className="form-combo-table"
                                        onChange={this.titleChange.bind(this)} />
                                    <span id="helpBlockTitle" className="help-block">
                                        {this.titleErrorText}
                                    </span>
                                </div>
                            </div>

                            <div className={this.endingDivClass}>
                                <label htmlFor="inputSuffix" className="col-sm-4 control-label">
                                    {this.labels.ending}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.props.voterEnding}
                                        id="inputSuffix"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.voter_ending_name}
                                        className="form-combo-table"
                                        onChange={this.endingChange.bind(this)} />
                                    <span id="helpBlockEnding" className="help-block">
                                        {this.endingErrorText}
                                    </span>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="col-lg-4">
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputFather" className="col-sm-4 control-label">
                                    {this.labels.fatherName}
                                </label>
                                <div className="col-sm-8">
                                    {this.props.voterDetails.father_first_name}
                                </div>
                            </div>

                            <div className={this.genderDivClass}>
                                <label htmlFor="inputGender" className="col-sm-4 control-label">
                                    {this.labels.gender}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.genderList}
                                        id="inputGender"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.gender_name}
                                        className="form-combo-table"
                                        onChange={this.genderChange.bind(this)} />
                                     
                                </div>
                            </div>

                            <div className={this.ethnicDivClass}>
                                <label htmlFor="inputEthnic" className="col-sm-4 control-label">
                                    {this.labels.ethnic}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.props.ethnicList}
                                        id="inputEthnic"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.ethnic_group_name}
                                        className="form-combo-table"
                                        onChange={this.ethnicChange.bind(this)} />
                                     
                                </div>
                            </div>

                            <div className={this.religiousGroupDivClass}>
                                <label htmlFor="inputReligiousGroup" className="col-sm-4 control-label">
                                    {this.labels.religiousGroup}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.props.religiousGroups}
                                        id="inputReligiousGroup"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.religious_group_name}
                                        className="form-combo-table"
                                        onChange={this.religiousGroupChange.bind(this)} />
                                     
                                </div>
                            </div>

                            <div className={this.sepharadiDivClass}>
                                <label htmlFor="inputSefardi" className="col-sm-4 control-label">
                                    {this.labels.sefaradi}
                                </label>
                                <div className="col-sm-8">
                                    <Combo items={this.sepharadiList}
                                        id="inputSefardi"
                                        itemIdProperty="id"
                                        itemDisplayProperty='name'
                                        value={this.props.voterDetails.sephardi_name}
                                        className="form-combo-table"
                                        onChange={this.sephardiChange.bind(this)} />
                                   
                                </div>
                            </div>

                            {this.renderButton()}
                        </form>
                    </div>
                </div>
				<ModalWindow show={this.state.showConfirmRemoveDeceased}
                        buttonOk={this.removeDeceased.bind(this)}
                        buttonOkText={"כן"}
                        buttonCancel={this.showHideConfirmRemoveDeceased.bind(this , false)}
                        buttonX={this.showHideConfirmRemoveDeceased.bind(this , false)}
                        buttonCancelText={"לא"}
                        title={"אישור פעולה"}
                        style={{ zIndex: '9001' }}>
                        <div>ביטול סימון תושב כנפטר תמחק את תאריך הפטירה שלו. האם להמשיך בפעולה ? </div>
                    </ModalWindow>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        ethnicList: state.system.lists.ethnic,
        religiousGroups: state.system.lists.religiousGroups,
        countries: state.system.lists.countries,
        voterTitle: state.system.lists.voterTitle,
        voterEnding: state.system.lists.voterEnding,
        voterDetails: state.voters.voterDetails,
        oldVoterDetails: state.voters.oldVoterDetails,
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterDetails));