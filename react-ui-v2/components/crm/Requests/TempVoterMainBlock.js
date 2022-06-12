import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

import * as VoterActions from '../../../actions/VoterActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
import { validateEmail, validatePhoneNumber, validateZip, validateHouse, validateFlat, checkPersonalIdentity   } from '../../../libs/globalFunctions';


class TempVoterMainBlock extends React.Component {

    constructor(props) {
        super(props);
        this.buttonText = "שמירה";
    }

    componentWillMount() {
        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( !this.props.currentUser.admin &&
                 this.props.currentUser.permissions['crm.requests.unknown_voter.add'] != true ) {
                this.props.router.push('/unauthorized');
            }
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if ( 0 == nextProps.currentUser.first_name.length ) {
            return;
        }

        // Making sure that current user has been loaded
        if ( 0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            // Checking if user is permitted to use the resource
            if ( !nextProps.currentUser.admin &&
                 nextProps.currentUser.permissions['crm.requests.unknown_voter.add'] != true ) {
                this.props.router.push('/unauthorized');
            }
        }

        if (nextProps.addUnknownVoterScreen.existingVoterKey != '' && (this.props.addUnknownVoterScreen.existingVoterKey != nextProps.addUnknownVoterScreen.existingVoterKey)){           
            this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'crm.requests.general'});
            this.props.dispatch ({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_REDIRECT_TO_NEW_REQUEST, isShow: true});
        }
    }

    validateDay(day) {
        if (/^(0[1-9])$/.test(day)) {
            return true;
        }

        if (/^([1-9])$/.test(day)) {
            return true;
        }

        if (/^([1-2][0-9])$/.test(day)) {
            return true;
        }

        if (/^(3[0-1])$/.test(day)) {
            return true;
        }

        return false;
    }

    validateMonth(month) {
        if (/^(0[1-9])$/.test(month)) {
            return true;
        }

        if (/^([1-9])$/.test(month)) {
            return true;
        }

        if (/^(1[0-2])$/.test(month)) {
            return true;
        }

        return false;
    }

    validateYear(year) {
        if (1 == year.length) {
            return false;
        }

        if (/^([0-9]{2})$/.test(year)) {
            return true;
        }

        if (/^(19[0-9]{2})$/.test(year)) {
            return true;
        }

        if (/^(20[0-9]{2})$/.test(year)) {
            return true;
        }

        return false;
    }

    validateBirthDate(birthDate) {
        var day = 0;
        var month = 0;
        var year = 0;
        var isValidDate = false;

        if (0 == birthDate) {
            return true;
        }

        // Repacing characters '.' and '-/ in a date string to character '/'
        this.birthDate = birthDate.replace(/[.-]/, '/');

        var arrOfDate = this.birthDate.split('/');
        switch (arrOfDate.length) {
            case 1:
                year = this.birthDate;

                if (this.validateYear(year)) {
                    isValidDate = true;
                }

                this.birthDate = year;
                break;

            case 2:
                month = arrOfDate[0];
                year = arrOfDate[1];

                if (this.validateYear(year) && this.validateMonth(month)) {
                    isValidDate = true;
                }

                this.birthDate = month + '/' + year;
                break;

            case 3:
                day = arrOfDate[0];
                month = arrOfDate[1];
                year = arrOfDate[2];

                if (this.validateYear(year) && this.validateMonth(month) && this.validateDay(day)) {
                    isValidDate = true;
                }

                this.birthDate = day + '/' + month + '/' + year;
                break;
        }

        return isValidDate;
    }
    redirectToNewRequest(){
        if (this.props.addUnknownVoterScreen.existingVoterKey && this.props.dirtyComponent.length == 0){
            let newRequestLink = 'crm/requests/new?voter_key='+this.props.addUnknownVoterScreen.existingVoterKey;
            this.props.router.push(newRequestLink);
            this.props.dispatch ({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_REDIRECT_TO_NEW_REQUEST, isShow: false});
            this.props.dispatch ({type: CrmActions.ActionTypes.REQUEST.CLEAN_TEMP_VOTER_DATA});
        }else {
            this.props.dispatch ({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_REDIRECT_TO_NEW_REQUEST, isShow: false});
        }

    }
    cancelRedirect(){
        this.props.dispatch ({type: CrmActions.ActionTypes.REQUEST.SET_DISPLAY_REDIRECT_TO_NEW_REQUEST, isShow: false});
        this.props.dispatch ({type: CrmActions.ActionTypes.REQUEST.UNKNOWN_VOTER_PERSONAL_IDENTITY});
    }
    createUnknownVoter() {
		
        if (this.missingRequiredFirstName || (this.missingPhone1 && this.missingPhone2 && this.props.addUnknownVoterScreen.email.length == 0) ||
                this.invalidEmailFormat || this.invalidPhone1 || this.invalidPhone2 || this.invalidPersonalIdentity ||
                this.invalidBirthDate || this.invalidZipCode || this.invalidHouse || this.invalidFlat || this.invalidCity || this.invalidStreet
                ) {

        } else {
			this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'crm.requests.general'});
            let genderID = -1;
            if (this.props.addUnknownVoterScreen.gender == 'זכר') {
                genderID = 0;
            } else if (this.props.addUnknownVoterScreen.gender == 'נקבה') {
                genderID = 1;
            }
            let cityID = -1;
            for (let i = 0, len = this.props.cities.length; i < len; i++) {
                if (this.props.cities[i].name == this.props.addUnknownVoterScreen.city) {
                    cityID = this.props.cities[i].id;
                    break;
                }
            }
			
			let streetID = this.getStreetData(this.props.addUnknownVoterScreen.street).id;
			

            let day = 0;
            let month = 0;
            let year = 0;
            let finalBirthDate = '';
            let birthDateType = -1;
            let age = '';
            if (this.props.addUnknownVoterScreen.birth_date != undefined && this.props.addUnknownVoterScreen.birth_date.length >= 2) {
                let birthDate = this.props.addUnknownVoterScreen.birth_date.replace(/[.-]/g, '/');
                let arrOfDate = birthDate.split('/');
                let currentYear = new Date().getFullYear();
                let tempYear = 0;
                switch (arrOfDate.length) {
                    case 1:
                        year = arrOfDate[0];
                        if (year.length == 2 || year.length == 4) {
                            finalBirthDate = (year.length == 4 ? year : (year < 10 ? ('20' + year) : ('19' + year))) + '-01-01';
                            birthDateType = 1;
                            if (year.length == 4) {
                                tempYear = parseInt(year);
                                age = currentYear - tempYear;
                            } else {
                                tempYear = parseInt(year);
                                if (year < 10) {
                                    tempYear += 2000;
                                } else {
                                    tempYear += 1900;
                                }
                                age = currentYear - tempYear;
                            }

                        }
                        break;
                    case 2:
                        month = arrOfDate[0];
                        year = arrOfDate[1];
                        if ((year.length == 2 || year.length == 4) && (month.length == 1 || month.length == 2)) {
                            finalBirthDate = (year.length == 4 ? year : (year < 10 ? ('20' + year) : ('19' + year))) + '-' + (month.length == 2 ? month : (month < 10 ? ('0' + month) : month)) + '-01';
                            birthDateType = 2;
                        }
                        if (year.length == 4) {
                            tempYear = parseInt(year);
                            age = currentYear - tempYear;
                        } else {
                            tempYear = parseInt(year);
                            if (year < 10) {
                                tempYear += 2000;
                            } else {
                                tempYear += 1900;
                            }
                            age = currentYear - tempYear;
                        }
                        break;
                    case 3:
                        day = arrOfDate[0];
                        month = arrOfDate[1];
                        year = arrOfDate[2];
                        if ((year.length == 2 || year.length == 4) && (month.length == 1 || month.length == 2) && (day.length == 1 || day.length == 2)) {
                            finalBirthDate = (year.length == 4 ? year : (year < 10 ? ('20' + year) : ('19' + year))) + '-' + (month.length == 2 ? month : (month < 10 ? ('0' + month) : month)) + '-' + (day.length == 2 ? day : (day < 10 ? ('0' + day) : day));
                            birthDateType = 3;
                        }
                        if (year.length == 4) {
                            tempYear = parseInt(year);
                            age = currentYear - tempYear;
                        } else {
                            tempYear = parseInt(year);
                            if (year < 10) {
                                tempYear += 2000;
                            } else {
                                tempYear += 1900;
                            }
                            age = currentYear - tempYear;
                        }
                        break;
                }
            }

            if (this.props.isEditingUnknownVoter) {
                CrmActions.editTempVoter(this.props.dispatch, this.props.router, this.props.addUnknownVoterScreen, genderID, cityID , streetID , finalBirthDate, birthDateType, age);
            } else {
                CrmActions.addTempVoter(this.props.dispatch, this.props.router, this.props.addUnknownVoterScreen, genderID, cityID , streetID, finalBirthDate, birthDateType, age);
            }
        }

    }

    cancelEditUnknownVoter() {
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.SET_TEMP_VOTER_EDITING, data: false
        });
    }

    renderButton() {
        var displayButton = false;

        if (this.props.currentUser.admin) {
            displayButton = true;
        } else if (this.props.currentUser.permissions['elections.voter.additional_data.address'] == true) {
            displayButton = true;
        }


        if (displayButton) {
            if (this.props.isEditingUnknownVoter) {
                return (
                        <div>
                            <button className="btn btn-primary" 
                                    onClick={this.createUnknownVoter.bind(this)}>
                                {this.buttonText}
                            </button>
                            &nbsp;&nbsp;
                            <button className="btn btn-primary" 
                                    onClick={this.cancelEditUnknownVoter.bind(this)}>
                                ביטול
                            </button>
                        </div>
                        );
            } else {
                return (
                        <button className="btn btn-primary wideBtn" 
                                onClick={this.createUnknownVoter.bind(this)}>
                            {this.buttonText}
                        </button>
                        );
            }
        }
    }

    isNumeric(n) {
        return !isNaN(parseInt(n));
    }

    initValidatorsStyle() {
        this.validatorsStyle = {};

        this.validatorsStyle.requiredFirstName = {borderColor: '#cccccc'};
        this.missingRequiredFirstName = false;

        this.validatorsStyle.requiredPhone1 = {borderColor: '#cccccc'};
        this.validatorsStyle.requiredPhone2 = {borderColor: '#cccccc'};
        this.missingPhone1 = false;
        this.missingPhone2 = false;
        this.invalidPhone1 = false;
        this.invalidPhone2 = false;

        this.validatorsStyle.requiredEmail = {};
        this.invalidEmailFormat = false;

        this.validatorsStyle.personalIdentityStyle = {borderColor: '#cccccc'};
        this.invalidPersonalIdentity = false;

        this.validatorsStyle.birthDateStyle = {borderColor: '#cccccc'};
        this.invalidBirthDate = false;

        this.validatorsStyle.zipCodeStyle = {borderColor: '#cccccc'};
        this.invalidZipCode = false;

        this.validatorsStyle.flatStyle = {borderColor: '#cccccc'};
        this.invalidFlat = false;

        this.validatorsStyle.houseStyle = {borderColor: '#cccccc'};
        this.invalidHouse = false;
		
		this.validatorsStyle.cityStyle = {borderColor: '#cccccc'};
        this.invalidCity = false;
		
		this.validatorsStyle.streetStyle = {borderColor: '#cccccc'};
        this.invalidStreet = false;


        if (this.props.addUnknownVoterScreen.personal_identity != null && this.props.addUnknownVoterScreen.personal_identity != undefined && this.props.addUnknownVoterScreen.personal_identity.length > 0 && (!this.isNumeric(this.props.addUnknownVoterScreen.personal_identity) || !checkPersonalIdentity(this.props.addUnknownVoterScreen.personal_identity))) {
            this.validatorsStyle.personalIdentityStyle = {borderColor: '#ff0000'};
            this.invalidPersonalIdentity = true;
        }

        if (this.props.addUnknownVoterScreen.birth_date.length > 0 && !this.validateBirthDate(this.props.addUnknownVoterScreen.birth_date)) {
            this.validatorsStyle.birthDateStyle = {borderColor: '#ff0000'};
            this.invalidBirthDate = true;
        }

        if (this.props.addUnknownVoterScreen.zip != null && this.props.addUnknownVoterScreen.zip != undefined && this.props.addUnknownVoterScreen.zip.length > 0 && !validateZip(this.props.addUnknownVoterScreen.zip)) {
            this.validatorsStyle.zipCodeStyle = {borderColor: '#ff0000', width: '80px'};
            this.invalidZipCode = true;
        }

        if (this.props.addUnknownVoterScreen.flat != null && this.props.addUnknownVoterScreen.flat != null && this.props.addUnknownVoterScreen.flat.length > 0 && !validateFlat(this.props.addUnknownVoterScreen.flat)) {
            this.validatorsStyle.flatStyle = {borderColor: '#ff0000', width: '80px'};
            this.invalidFlat = true;
        }

        if (this.props.addUnknownVoterScreen.house != null && this.props.addUnknownVoterScreen.house != undefined && this.props.addUnknownVoterScreen.house.length > 0 && !validateHouse(this.props.addUnknownVoterScreen.house)) {
            this.validatorsStyle.houseStyle = {borderColor: '#ff0000', width: '80px'};
            this.invalidHouse = true;
        }


        if (this.props.addUnknownVoterScreen.first_name.length < 2) {
            this.validatorsStyle.requiredFirstName = {borderColor: '#ff0000'};
            this.missingRequiredFirstName = true;
        }
        if (this.props.addUnknownVoterScreen.phone1.length == 0 && this.props.addUnknownVoterScreen.phone2.length == 0 && this.props.addUnknownVoterScreen.email.length == 0) {
            this.validatorsStyle.requiredPhone1 = {borderColor: '#ff0000'};
            this.validatorsStyle.requiredPhone2 = {borderColor: '#ff0000'};
          
            this.missingPhone1 = true;
            this.missingPhone2 = true;
        }
        if (this.props.addUnknownVoterScreen.phone1.length > 0 && !validatePhoneNumber(this.props.addUnknownVoterScreen.phone1)) {
            this.validatorsStyle.requiredPhone1 = {borderColor: '#ff0000'};
            this.invalidPhone1 = true;
        }
        if (this.props.addUnknownVoterScreen.phone2.length > 0 && !validatePhoneNumber(this.props.addUnknownVoterScreen.phone2)) {
            this.validatorsStyle.requiredPhone2 = {borderColor: '#ff0000'};
            this.invalidPhone2 = true;
        }
        if (this.props.addUnknownVoterScreen.email.length > 0) {
            if (!validateEmail(this.props.addUnknownVoterScreen.email)) {
                this.validatorsStyle.requiredEmail = {borderColor: '#ff0000'};
                this.invalidEmailFormat = true;
            }
        }
		
		if(this.props.addUnknownVoterScreen.city.trim() != '' && this.getCityData(this.props.addUnknownVoterScreen.city).id == undefined){
			this.validatorsStyle.cityStyle = {borderColor: '#ff0000'};
            this.invalidCity = true;
		}
		
		 
		if(this.props.addUnknownVoterScreen.street.trim() != '' && this.getStreetData(this.props.addUnknownVoterScreen.street).id == undefined){
		     this.validatorsStyle.streetStyle = {borderColor: '#ff0000'};
             this.invalidStreet = true;
	    }


    }

    changeDataItemValue(objKey, e) {
		 
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'crm.requests.general'});
        this.props.dispatch({
            type: CrmActions.ActionTypes.UNKNOWN_VOTER.CHANGE_DATA_ITEM_VALUE,
            theKey: objKey, theValue: e.target.value
        });
		if(objKey == 'city'){
			SystemActions.loadStreetsWithoutPermission(this.props.dispatch,this.getCityData(e.target.value).key);
			this.props.dispatch({
            type: CrmActions.ActionTypes.UNKNOWN_VOTER.CHANGE_DATA_ITEM_VALUE,
            theKey: 'street', theValue: ''
            });
		}
    }
	
	getCityData(CityName){
		
		let returnedValue = {};
		for (let i = 0, len = this.props.cities.length; i < len; i++) {
            if (this.props.cities[i].name==CityName) {
                returnedValue = this.props.cities[i];
                break;
            }
        }
		return returnedValue;
	}
	
	getStreetData(StreetName){
		
		let returnedValue = {};
		let theCorrectArray = this.props.streets;
		if(this.props.addUnknownVoterScreen.streets.length > 0){
			theCorrectArray = this.props.addUnknownVoterScreen.streets;
		}
		for (let i = 0, len = theCorrectArray.length; i < len; i++) {
			 
            if (theCorrectArray[i].name==StreetName) {
                returnedValue = theCorrectArray[i];
                break;
            }
        }
		return returnedValue;
	}

    handleKeyPress(e) {

        if (this.props.addUnknownVoterScreen.personal_identity.length == 0) {
            return;
        }

        //if (13 == e.charCode || e.keyCode === 9) { /*if user pressed enter or tab*/
            VoterActions.getVoterByPersonalIdentity(this.props.dispatch, this.props.router,
                                                  this.props.addUnknownVoterScreen.personal_identity );

        //}        
    }

    render() {
        this.initValidatorsStyle();

        return (

            <div className="dtlsBox electorDtlsStrip clearfix">
                <ModalWindow title={'הודעה'} show={this.props.showRedirectToNewRequest && this.props.addUnknownVoterScreen.existingVoterKey} buttonCancel={this.cancelRedirect.bind(this)} buttonX={this.cancelRedirect.bind(this)} buttonOk={this.redirectToNewRequest.bind(this)}>
                    <div>
                       תעודת זהות קיימת במערכת עבור {this.props.addUnknownVoterScreen.existingVoterName}. <br/>
                       האם לעבור ליצירת פניה עבורו/ה?                        
                    </div>
                </ModalWindow>

                <div className="row electorDtlsData">
                    <div className="col-xs-12 col-sm-4 col-md-3 col-lg-3">
                        <div className="electorTitle">{'\u00A0'}</div>
                        <div >
						   <div className='row form-group'>
						     <div className='col-md-5'>
							    שם פרטי  
							 </div>
						     <div className='col-md-7'>
						      <input type="text"  className="form-control form-control-sm" style={this.validatorsStyle.requiredFirstName}  value={this.props.addUnknownVoterScreen.first_name} onChange={this.changeDataItemValue.bind(this , 'first_name')} />
						     </div>
						   </div>
						   <div className='row form-group'>
							 <div className='col-md-5'>
							    שם משפחה  
							 </div>
						     <div className='col-md-7'>
							  <input type="text"  className="form-control form-control-sm"  value={this.props.addUnknownVoterScreen.last_name} onChange={this.changeDataItemValue.bind(this , 'last_name')} />   
						     </div>
							 
						   </div>
						   
						    <div className='row form-group'>
                            <div className='col-md-5'>ת"ז</div>
                            <div className='col-md-7'><input type="text"  className="form-control form-control-sm" style={this.validatorsStyle.personalIdentityStyle} value={this.props.addUnknownVoterScreen.personal_identity} onBlur={this.handleKeyPress.bind(this)} /*onKeyDown={this.handleKeyPress.bind(this)} */onChange={this.changeDataItemValue.bind(this , 'personal_identity')} /></div>
						 
                          
			                  </div>
						  
						</div>
                        <div className="electorSuffix"> </div>
                        
                        <div className={this.canVoteClassName}> </div>
                    </div>

                    <div className="col-xs-12 col-sm-4 col-md-3 col-lg-3">
                       
						<div className='row form-group'>
						  <div className='col-md-5'>תאריך לידה</div>
                          <div className='col-md-7'>
							  <input type="text"  className="form-control form-control-sm" style={this.validatorsStyle.birthDateStyle} value={this.props.addUnknownVoterScreen.birth_date} onChange={this.changeDataItemValue.bind(this , 'birth_date')} />  
						  </div>  
						</div>
						<div className='row form-group'>
						    <div className='col-md-5'>מגדר</div>
                                                    <div className='col-md-7'>
							   <Combo items={[{id:0 , name:'זכר'} , {id:1 , name:'נקבה'}]}  maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' value={this.props.addUnknownVoterScreen.gender} onChange={this.changeDataItemValue.bind(this , 'gender')}    />
							</div>
						</div>
						 <div className='row form-group'>
                            <div className='col-md-5'>דרכון</div>
                            <div className='col-md-7'><input type="text"  className="form-control form-control-sm"  value={this.props.addUnknownVoterScreen.passport} onChange={this.changeDataItemValue.bind(this , 'passport')} /></div>
						 
                          
			                  </div>
						<div className='row form-group'>
						     <div className='col-md-5'>עיר</div>
                            <div className='col-md-7'>
							   <Combo items={this.props.cities}  maxDisplayItems={7} itemIdProperty="id" itemDisplayProperty='name'  value={this.props.addUnknownVoterScreen.city} onChange={this.changeDataItemValue.bind(this , 'city')} inputStyle={this.validatorsStyle.cityStyle}    />
							</div>
                            
						</div>
						<div className='row form-group'>
						   <div className='col-md-5'>שכונה</div>
                            <div className='col-md-7'><input type="text"  className="form-control form-control-sm" value={this.props.addUnknownVoterScreen.neighborhood} onChange={this.changeDataItemValue.bind(this , 'neighborhood')} /></div>
                            
						</div>
                    </div>

                    <div className="col-xs-12 col-sm-4 col-md-3 col-lg-3">
                    <div className="row form-group">
                           <div className="col-md-3">רחוב</div>
                            <div className="col-md-9">
							<Combo items={this.props.addUnknownVoterScreen.streets.length > 0 ? this.props.addUnknownVoterScreen.streets : this.props.streets} zIndex={0} maxDisplayItems={6} itemIdProperty="id" itemDisplayProperty='name' value={this.props.addUnknownVoterScreen.street} inputStyle={this.validatorsStyle.streetStyle} onChange={this.changeDataItemValue.bind(this , 'street')}/>
							</div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-3">בית</div>
                            <div className="col-md-9"><input type="text" className="form-control" style={this.validatorsStyle.houseStyle} value={this.props.addUnknownVoterScreen.house} onChange={this.changeDataItemValue.bind(this , 'house')} /></div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-3">כניסה</div>
                            <div className="col-md-9"><input type="text" className="form-control" value={this.props.addUnknownVoterScreen.house_entry} onChange={this.changeDataItemValue.bind(this , 'house_entry')} /></div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-3">דירה</div>
                            <div className="col-md-9"><input type="text" className="form-control" style={this.validatorsStyle.flatStyle} value={this.props.addUnknownVoterScreen.flat} onChange={this.changeDataItemValue.bind(this , 'flat')} /></div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-3">מיקוד</div>
                            <div className="col-md-9"><input type="text" className="form-control" style={this.validatorsStyle.zipCodeStyle} value={this.props.addUnknownVoterScreen.zip} onChange={this.changeDataItemValue.bind(this , 'zip')} /></div>
                            </div>
                    </div>

                    <div className="col-xs-12 col-sm-4 col-md-3 col-lg-3" >
                    <div className="row form-group">
                        <div className="col-md-4">טלפון</div>
                        <div className="col-md-8"><input type="text"  className="form-control" style={this.validatorsStyle.requiredPhone1} value={this.props.addUnknownVoterScreen.phone1} onChange={this.changeDataItemValue.bind(this , 'phone1')} /></div>
                    </div>
                    <div className="row form-group">
                            <div className="col-md-4">נייד</div>
                            <div className="col-md-8"><input type="text"  className="form-control" style={this.validatorsStyle.requiredPhone2} value={this.props.addUnknownVoterScreen.phone2} onChange={this.changeDataItemValue.bind(this , 'phone2')} /></div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-4">דוא"ל</div>
                            <div className="col-md-8"><input type="text"  className="form-control" style={this.validatorsStyle.requiredEmail} value={this.props.addUnknownVoterScreen.email} onChange={this.changeDataItemValue.bind(this , 'email')} /></div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-12">&nbsp;</div>
                            </div>
                            <div className="row form-group">
                            <div className="col-md-12">
                {this.renderButton()}
                </div>
                            </div>
                    </div>
                </div>

                <div className="row quickAccessContainer hidden-xs">
                    <div className="col-sm-12">
                        <div className={this.toVoterScreenClass}>
                           <span style={{color:'#ff0000' , fontWeight:'bold' , fontSize:'13px'}}>
                                        {this.missingRequiredFirstName?<div>* יש למלא שם פרטי<br/></div>:''}
                                        {(this.missingPhone1 && this.missingPhone2 && this.props.addUnknownVoterScreen.email.length == 0)?<div>* יש למלא את אחד הטלפונים או את הדוא"ל<br/></div>:''}
                                        {this.invalidEmailFormat?<div>* אימייל לא תקין<br/></div>:'' }
                                        {this.invalidPhone1 ? <div>* מספר טלפון לא חוקי<br/></div>: ''}
                                        {this.invalidPhone2 ? <div>* טלפון נייד לא חוקי<br/></div>: ''}
                                        {this.invalidPersonalIdentity ? <div>* ת"ז לא חוקית<br/></div>: ''}
                                        {this.invalidBirthDate?<div>* תאריך לידה לא חוקי<br/></div>:''}
										{this.invalidCity?<div>* עיר לא חוקית<br/></div>:''}
										{this.invalidStreet?<div>* רחוב לא חוקי<br/></div>:''}
                                        {this.invalidZipCode?<div>* מיקוד לא חוקי<br/></div>:''}
                                        {this.invalidHouse?<div>* מספר בית לא חוקי<br/></div>:''}
                                        {this.invalidFlat?<div>* מספר דירה לא חוקי<br/></div>:''}
										
						 </span>  
                        </div>
                    </div>
                     
                </div>

                <div className="row quickAccessContainer hidden-sm hidden-md hidden-lg">
                    <div className="col-xs-2 AccessColRight">
                        <div className={this.toVoterScreenClass}>
                            <Link to={this.toVoterScreenUrl} title={this.linkTitle}>
                                <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
                                {this.toVoterScreenText}
                            </Link>
                        </div>
                    </div>
                    <div className="col-xs-10 AccessColLeft">
                        <div className="row quickAccess clearfix"> <a href="#" title="פניה חדשה">
                            <div className="col-xs-6 accessBtn newCaseBtn">פניה חדשה</div>
                        </a> <a href="#" title="פעולה חדשה">
                            <div className="col-xs-6 accessBtn newActionBtn">פעולה חדשה</div>
                        </a> <a href="#" title="חייג">
                            <div className="col-xs-6 accessBtn callBtn">חייג</div>
                        </a> <a href="#" title="שלח דואל">
                            <div className="col-xs-6 accessBtn sendMailBtn">שלח דוא"ל</div>
                        </a> <a href="#" title="שלח SMS">
                            <div className="col-xs-6 accessBtn sendSmsBtn">שלח SMS</div>
                        </a> <a href="#" title="צרף מסמך">
                            <div className="col-xs-6 accessBtn attachBtn">צרף מסמך</div>
                        </a> </div>
                    </div>
                </div>

            </div>

                );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        cities: state.system.cities,
		streets:state.system.lists.streets,
        addUnknownVoterScreen: state.crm.addUnknownVoterScreen,
        isEditingUnknownVoter: state.crm.isEditingUnknownVoter,
        showRedirectToNewRequest: state.crm.searchRequestsScreen.showRedirectToNewRequest,
        dirtyComponent :state.system.dirtyComponents,
    }
}

export default connect(mapStateToProps)(withRouter(TempVoterMainBlock));