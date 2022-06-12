import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

import {getCurrentFormattedDateTime, isLandPhone, isMobilePhone,checkKosherPhone} from '../../libs/globalFunctions';
import ModalWindow from '../global/ModalWindow';
import Combo from '../global/Combo';

import * as CrmActions from '../../actions/CrmActions';
import * as VoterActions from '../../actions/VoterActions';
import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';

class VoterMainBlock extends React.Component {

    constructor(props) {
        super(props);
		this.state={
			sendSmsModalVisible:false,
			selectedSmsPhone : {value:'' ,item:null},
			selectedSmsText : '',
		}
		
        this.initConstants();
    }

    initConstants() {
        this.tabInfo = {
            name: 'info'
        };

        this.tabSupportElections = {
            name: 'supportElections'
        };

        this.tabActions = {
            name: 'actions'
        };

        this.tabDocuments = {
            name: 'documents'
        };
        
        this.buttonText = "עדכון פרטים";
        this.linkTitle = "חזרה לכרטיס התושב";
        this.fieldLinkAltText = "קישור לשדה הרלוונטי";
        this.fieldLinkTitleText = "למידע נוסף";
        this.toVoterScreenText = 'לכרטיס התושב';
        this.fastButtonsLinksTexts = {
            request: 'פניה חדשה',
            action: 'פעולה חדשה',
            dial: 'חייג',
            email: 'שלח דוא"ל',
            sms: 'שלח SMS',
            document: 'צרף מסמך'
        };

        this.mobilePhoneTitle = "מס' טלפון נייד";
        this.emailTitle = 'דוא"ל';
        this.addressTitle = "כתובת";
        this.unVerifiedAddressText = "כתובת לא מאומתת";

        this.attentionStyle = {
            color: '#cc0000',
            fontWeight: 'bold'
        };

        this.attentionTextStyle = {
            color: '#cc0000',
            fontWeight: 'bold',
            fontSize: '14px'
        };

        this.saveButtonText = "שמירה";

        this.setDirtyTarget = "elections.voter.support_and_elections.support_status";
        this.callBtnStyle = {
            float: 'right',
            margin: '5px 22px',
            height: '20px',
            width: '20px',
            fontSize: '10px'
        }
    }

    /**
     * This function checks if teh url
     * is a voter url
     *
     * @returns {boolean}
     */
    isVoterUrl() {
        var regVoterUrlExp = /elections\/voters/;
        return regVoterUrlExp.test(this.currentUrl);
    }

    /**
     * This function checks if the
     * url is a crm url
     *
     * @returns {boolean}
     */
    isCrmUrl() {
        var regCrmUrlExp = /crm\/requests/;
        return regCrmUrlExp.test(this.currentUrl);
    }

    /**
     * This function checks if the url
     * is a url for new request
     *
     * @returns {boolean}
     */
    isNewCrmRequestUrl() {
        var regCrmUrlExp = /crm\/requests\/new/;
        return regCrmUrlExp.test(this.currentUrl);
    }

    /**
     * This function redirects to the
     * voter Contact section in Info tab.
     */
    redirectUpdatePhone() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoDetails'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoAddress'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoUser'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoAdditionalData'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_COLLAPSE,container: 'infoContact'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,voterTab: this.tabInfo.name});

        if ( !this.isVoterUrl()) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_TAB_SECTION,container: 'infoContact'});
            this.props.router.push('elections/voters/' + this.props.voterDetails.key);
        }
    }

    /**
     * This function redirects to the
     * voter Address section in Info tab
     */
    redirectUpdateAddress() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoDetails'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoContact'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoUser'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'infoAdditionalData'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_COLLAPSE,container: 'infoAddress'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,voterTab: this.tabInfo.name});

        if ( !this.isVoterUrl()) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_TAB_SECTION,container: 'infoAddress'});
            this.props.router.push('elections/voters/' + this.props.voterDetails.key);
        }
    }

    /**
     * This function redirects to the
     * voter Support section at supportElections tab
     */
    redirectUpdateStatus() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'supportElectionsActivity'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'supportElectionsBallot'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_COLLAPSE,container: 'supportElectionsSupport'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,voterTab: this.tabSupportElections.name});

        if ( !this.isVoterUrl()) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_TAB_SECTION,container: 'supportElectionsSupport'});
            this.props.router.push('elections/voters/' + this.props.voterDetails.key);
        }
    }

    /**
     * This function redirects to the
     * voter Ballot section at supportElections tab
     */
    redirectBallot() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'supportElectionsActivity'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE,container: 'supportElectionsSupport'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_COLLAPSE,container: 'supportElectionsBallot'});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,voterTab: this.tabSupportElections.name});

        if ( !this.isVoterUrl()) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_TAB_SECTION,container: 'supportElectionsBallot'});
            this.props.router.push('elections/voters/' + this.props.voterDetails.key);
        }
    }

    /**
     *  This function redirects to new action
     *  according to the url.
     *
     *  If it's a voter screen, the redirection
     *  is to voter action screen with new action row.
     *
     *  If it's a crm url, the redirection
     *  is to crm action screen with new action row.
     */
    redirectToNewAction() {
        //scroll to bottom page for display document
        this.handleScroll();
        if ( this.isVoterUrl() ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE, voterTab: this.tabActions.name});

            if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.voter.actions.add'] == true ) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ACTION_ADD_SHOW_SCREEN});
            }
        } else if ( this.isCrmUrl() ) {
            CrmActions.setActiveDetailTabPanel(this.props.dispatch, 'operation');

            if ( this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.actions.add'] == true ) {
                this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.SHOW_ADD_ACTION_TO_REQUEST_SCREEN});
            }
        }
    }
    openDialWindow(fastSelectPhoneNumber = null, e) {
        if (this.voterEnabledPhones.length > 0) {
            let voterDetails = {
                key: this.props.voterDetails.key,
                first_name: this.props.voterDetails.first_name,
                last_name: this.props.voterDetails.last_name,
                voterEnabledPhones: this.voterEnabledPhones,
                fastSelectPhoneNumber: fastSelectPhoneNumber
            }
            this.props.dispatch({
                type: VoterActions.ActionTypes.VOTER_DIALER_WINDOW.DISPLAY_CALL_BOX,
                 display:true , voterDetails :voterDetails});
        }
    }
    /**
     * This function redirects to
     * new crm request
     *
     * @param e
     */
    redirectToNewRequest(e) {
        e.preventDefault();
        if(!this.isNewCrmRequestUrl()){
            let currentFormattedDate = getCurrentFormattedDateTime(new Date());
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLEAR_REQUEST_FORM, currentFormattedDate});
            this.props.router.push(this.newRequestLink);
        }
    }

    redirectToSendEmail(e){
        e.preventDefault();
    
        if(this.props.voterDetails.email.length > 3){
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.TOGGLE_SEND_EMAIL_MODAL_DIALOG_DISPLAY, showModal:true});
        }
    }

    sendEmailModalDialogConfirm() {
        if(this.props.router.location.pathname.indexOf('elections/voters')>-1){
            CrmActions.sendEmailFromVoter(this.props.dispatch,this.props.voterDetails.key,this.props.emailContent.title,this.props.emailContent.body);
        }else{
            CrmActions.sendEmailFromRequest(this.props.dispatch,this.props.router.params.reqKey,this.props.emailContent.title,this.props.emailContent.body);
        }
        this.closeEmailModalDialog();
    }

    closeEmailModalDialog() {
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.TOGGLE_SEND_EMAIL_MODAL_DIALOG_DISPLAY, showModal:false});
    }

    updateMailContent(mailContentType,e){
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.UPDATE_EMAIL_CONTENT, key:mailContentType,value:e.target.value});
    }
     handleScroll() {
        window.scrollTo({
            top:document.body.scrollHeight,
            behavior: 'smooth'
          });
      }
    /**
     *  This function redirects to new document
     *  according to the url.
     *
     *  If it's a voter screen, the redirection
     *  is to voter documents screen with new document row.
     *
     *  If it's a crm url, the redirection
     *  is to crm documents screen with new document row.
     */
    redirectToNewDocument(e) {
        e.preventDefault();
        e.stopPropagation();
        //scroll to bottom page for display document
        this.handleScroll();
        if ( this.isVoterUrl() ) {
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,
                                 voterTab: this.tabDocuments.name});

            if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.voter.documents.add'] == true ) {
                this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DIV});
            }
        } else if ( this.isCrmUrl() ) {
            CrmActions.setActiveDetailTabPanel(this.props.dispatch, 'document');

            if ( this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.documents.add'] == true ) {
                this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DIV});
            }
        }
    }

    getAge() {
        var birthDate = this.props.oldVoterDetails.birth_date;
		if(!birthDate){return '';}
        var date = new Date();
        var currentYear = date.getFullYear();
        var birthYear = "";
        var arrOfDatElements = [];

        arrOfDatElements = birthDate.split('-');
        birthYear = arrOfDatElements[0];

        if ( null == birthDate ) {
            return '\u00A0';
        } else {
            return currentYear - birthYear;
        }
    }

    printUnverifiedAddress() {
        if ( null == this.props.oldVoterDetails.actual_address_correct ) {
            return (
                <dd style={{marginTop: '-12px'}}>
                    <span style={this.attentionTextStyle}>{this.unVerifiedAddressText}</span>
                </dd>
            );
        } else {
            return (
                <dd>{'\u00A0'}</dd>
            );
        }
    }

    getAddressTitle() {
        if ( null == this.props.oldVoterDetails.actual_address_correct ) {
            return (
                <dt>
                    <span style={this.attentionStyle}>*</span>{'\u00A0'}{this.addressTitle}
                </dt>
            );
        } else {
            return (
                <dt>{this.addressTitle}</dt>
            );
        }
    }

    getEmailTitle() {
        if ( this.props.oldVoterDetails.email == '' ) {
            return(
                <dt>
                    <span style={this.attentionStyle}>*</span>{'\u00A0'}{this.emailTitle}
                </dt>
            );
        } else {
            return <dt>{this.emailTitle}</dt>;
        }
    }

    /**
     * This function renders the additional
     * phone number.
     *
     * If there are more than 1 phone, it chooses
     * the phone
     *
     * If there is more than 1 phone and theres is a
     * main phone, it prints the first mobile phone
     * or the first land phone.
     * If there is no main phone it chooses the second mobile phone
     * or the first land phone or the second land phone.
     *
     * @returns {XML}
     */
    renderAdditionalPhoneNumber() {
        var phones = this.props.oldVoterDetails.phones;
        var additionalPhone = "";
        var displayLink = false;

        if ( phones.length < 2 ) {
            return <dd>{'\u00A0'}</dd>;
        }

        if ( this.mainPhoneNumber.length > 0 ) {
            if ( this.mobilePhones.length > 0 ) {
                additionalPhone = this.mobilePhones[0];
            } else if ( this.landPhones.length > 0 ) {
                additionalPhone = this.landPhones[0];
            } else {
                // If we are here it means there is a bug
                return <dd>{'\u00A0'}</dd>;
            }
        } else {
            switch ( this.mobilePhones.length ) {
                case 0:
                    if ( this.landPhones.length > 1 ) {
                        additionalPhone = this.landPhones[1];
                    } else {
                        // If we are here it means there is a bug
                        return <dd>{'\u00A0'}</dd>;
                    }
                    break;

                case 1:
                    if ( this.landPhones.length > 0 ) {
                        additionalPhone = this.landPhones[0];
                    } else {
                        // If we are here it means there is a bug
                        return <dd>{'\u00A0'}</dd>;
                    }
                    break;

                default:
                    if ( this.mobilePhones.length > 1 ) {
                        additionalPhone = this.mobilePhones[1];
                    } else {
                        // If we are here it means there is a bug
                        return <dd>{'\u00A0'}</dd>;
                    }
                    break;
            }
        }

        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.additional_data.contact_details'] == true ) {
            displayLink = true;
        }

        if ( displayLink ) {
            let call_via_tm = this.checkIfCallViaPhone(additionalPhone)
            let dialButtonStyle = { cursor: call_via_tm ? 'pointer' : 'not-allowed' };
            return (
                <dd>
                    <span style={{ float: 'right' }}>{additionalPhone}</span>
                    <span className={this.linkToBallotClass} style={{ float: 'right' }}>
                        <a href="#" onClick={this.redirectUpdatePhone.bind(this)}
                            title={this.fieldLinkTitleText} className="directLink">
                            <img src={this.imageIcoDirectLink} alt={this.fieldLinkAltText} />
                        </a>
                    </span>
                    <span className="call-actions__btn" style={{ ...this.callBtnStyle, ...dialButtonStyle }}
                        onClick={call_via_tm ? this.openDialWindow.bind(this, additionalPhone) : null}>
                        <i className="fa fa-phone" aria-hidden="true"></i>
                    </span>
                </dd>
            );
        } else {
            return <dd>{additionalPhone}</dd>
        }
    }

    getAdditionalPhoneTitle() {
        var phones = this.props.oldVoterDetails.phones;

        if (phones.length > 1) {
            return "מספר נוסף";
        } else {
            return '\u00A0';
        }
    }

    /**
     * This function prints the phone in the top.
     * If the voter has a main phone, it should be
     * printed.
     * If the voter has no main phone, the first mobile
     * phone should be print.
     * If the voter doesn't have a mobile phone, then
     * the first land phone should be printed.
     *
     * @returns {*}
     */
    renderMainPhoneNumber() {
        var phones = this.props.oldVoterDetails.phones;
        var mainPhone = "";
        var displayLink = false;

        switch ( phones.length ) {
            case 0:
                return <dd>{'\u00A0'}</dd>
            case 1:
                mainPhone = phones[0].phone_number;
                break;
            default:
                if ( this.mainPhoneNumber.length > 0 ) {
                    mainPhone = this.mainPhoneNumber;
                } else {
                    if ( this.mobilePhones.length > 0 ) {
                        mainPhone = this.mobilePhones[0];
                    } else if ( this.landPhones.length > 0 ) {
                        mainPhone = this.landPhones[0];
                    } else {
                        // If we are here it means there is a bug
                        return <dd>{'\u00A0'}</dd>;
                    }
                }
        }

        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.additional_data.contact_details'] == true ) {
            displayLink = true;
        }
        if ( displayLink ) {
            let call_via_tm = this.checkIfCallViaPhone( mainPhone)
            let dialButtonStyle = { cursor: call_via_tm ? 'pointer' : 'not-allowed' };

            return (
                <dd> 
                    <span style={{ float: 'right' }}>{mainPhone}</span>
                    <span className={this.linkToBallotClass} style={{ float: 'right' }}>
                        <a href="#" onClick={this.redirectUpdatePhone.bind(this)}
                            title={this.fieldLinkTitleText} className="directLink">
                            <img src={this.imageIcoDirectLink} alt={this.fieldLinkAltText} />
                        </a>
                    </span>
                    <span className="call-actions__btn" style={{ ...this.callBtnStyle, ...dialButtonStyle }}
                        onClick={call_via_tm ? this.openDialWindow.bind(this, mainPhone) : null}>
                        <i className="fa fa-phone" aria-hidden="true"></i>
                    </span>
                </dd>
            );
        } else {
            return <dd>{mainPhone}</dd>;
        }
    }
    checkIfCallViaPhone(phone_number){
        let phoneIsEnabled = this.voterEnabledPhones.find(function (phone) {
            if (phone.phone_number == phone_number) {  return phone; }
        });
        if (phoneIsEnabled) { return true; }
        return false;
    }
    /**
     * This function builds the phone arrays:
     * landPhones for land phones,
     * mobilePhones for mobile phones.
     *
     * The main phone is in a different variable
     *
     */
    buildPhoneArrays() {
        var phones = this.props.oldVoterDetails.phones;
        var main_voter_phone_id = this.props.oldVoterDetails.main_voter_phone_id;
        var phoneIndex = -1;

        for ( phoneIndex = 0; phoneIndex < phones.length; phoneIndex++ ) {
            let phoneId = phones[phoneIndex].id;

            if ( phoneId == main_voter_phone_id ) {
                this.mainPhoneNumber = phones[phoneIndex].phone_number;
            } else {
                if (!phones[phoneIndex].wrong && isLandPhone(phones[phoneIndex].phone_number) ) {
                    this.landPhones.push(phones[phoneIndex].phone_number);
                } else if (!phones[phoneIndex].wrong && isMobilePhone(phones[phoneIndex].phone_number) ) {
                    this.mobilePhones.push(phones[phoneIndex].phone_number);
                }
            }
        }
    }

    saveVoterSupport(e) {
        // Prevent page refresh
        e.preventDefault();

        if ( !this.validInputs ) {
            return;
        }

        let voterKey = this.props.router.params.voterKey;
        let supportStatusId0 = '';

        // if the user does'nt have a support status and he
        // hasn't chosen a value, then there is no need to bother
        // the server
        if ( 0 == this.props.voterDetails.support_status_id0 &&
            null == this.props.voterDetails.voter_support_status_key0 ) {
            return;
        }

        if ( 0 == this.props.voterDetails.support_status_id0 ) {
            supportStatusId0 = null;
        } else {
            supportStatusId0 = this.props.voterDetails.support_status_id0;
        }

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE,
                             editSupportStatusKey: 'text'});

        if ( null == this.props.voterDetails.voter_support_status_key0 ) {
            VoterActions.saveVoterSupportStatuses(this.props.dispatch, voterKey,
                                                  this.props.voterDetails.support_status_id0);
        } else {
            VoterActions.saveVoterSupportStatusWithKey(this.props.dispatch, voterKey,
                                                       this.props.voterDetails.voter_support_status_key0,
                                                       this.props.voterDetails.support_status_id0);
        }
    }

    /**
     * This function returns the supports status type id
     * according to support status id.
     *
     * @param requestStatusId
     * @returns {*}
     */
    getRequestStatusTypeId(requestStatusId) {
        var statusList = this.props.statusList;
        var statusIndex = -1;

        statusIndex = statusList.findIndex(statusItem => statusItem.id == requestStatusId );
        if ( -1 == statusIndex ) {
            return 0;
        } else {
            return statusList[statusIndex].status_type_id;
        }
    }

    /**
     * This function checks if the screen is
     * a request screen which it's status is
     * cancelled or closed.
     *
     * @returns {boolean}
     */
    isRequestClosedOrCancelled() {
        var request_status_type_closed = require('../../libs/constants').request_status_type_closed;
        var request_status_type_canceled = require('../../libs/constants').request_status_type_canceled;

        let statusTypeId = this.getRequestStatusTypeId(this.props.dataRequest.status_id);

        if ( statusTypeId == request_status_type_closed || statusTypeId == request_status_type_canceled ) {
            return true;
        } else {
            return false;
        }
    }

    initVariables() {
        var arrOfAddressElements = [];
        this.newRequestLink = 'crm/requests/new'+(this.props.voterDetails.key? '?voter_key='+this.props.voterDetails.key:'');
        this.currentUrl = this.props.router.location.pathname;

        this.imageSupportStatus = window.Laravel.baseURL + 'Images/support-status-1.svg';
        this.imageIcoDirectLink = window.Laravel.baseURL + 'Images/ico-direct-link.svg';

        this.fullName = this.props.oldVoterDetails.first_name + ' ' + this.props.oldVoterDetails.last_name;

        if ( this.props.oldVoterDetails.street_name != null ) {
            arrOfAddressElements.push(this.props.oldVoterDetails.street_name);
        }

        if ( this.props.oldVoterDetails.house != null ) {
            arrOfAddressElements.push(this.props.oldVoterDetails.house);
        }

        arrOfAddressElements.push(this.props.oldVoterDetails.city_name);

        this.voterAddress = arrOfAddressElements.join(' ');

        this.mobilePhones = [];
        this.landPhones = [];
        this.mainPhoneNumber = "";

        this.buildPhoneArrays();

        this.shas_representative = '';
        if ( this.props.oldVoterDetails.shas_representative ) {
            this.shas_representative = 'כן';
        } else {
            this.shas_representative = 'לא';
        }

        this.roleName = '';
        if ( this.props.voterSystemUser.role_name ) {
            this.roleName = this.props.voterSystemUser.role_name;
        } else {
            this.roleName = '-';
        }

        this.userActive = '';
        if ( this.props.voterSystemUser.active ) {
            this.userActive = 'כן';
        } else {
            this.userActive = '-';
        }

        this.age = this.getAge();

        if ( this.props.oldVoterDetails.gender == null ) {
            this.genderName = "מגדר לא ידוע";
        } else {
            this.genderName = this.props.oldVoterDetails.gender_name;
        }

        this.toVoterScreenUrl = "#";
        this.toVoterScreenClass = "textLink goBack hidden";
        if ( this.isVoterUrl() ) {
            this.toVoterScreenClass = "textLink goBack hidden";
        } else {
            this.toVoterScreenClass = "textLink goBack";
            this.toVoterScreenUrl = "elections/voters/" + this.props.voterDetails.key;
        }

        this.allowEditSupportStatus = false;
        this.allowViewSupportStatusScreen = false;

        this.mainBlockClass = "dtlsBox electorDtlsStrip clearfix hidden";
        this.linkToBallotClass = "hidden";
        this.fastButtonsRow1Class = "row quickAccessContainer hidden";
        this.fastButtonsRow2Class = "row quickAccessContainer hidden";
        this.col2GridClass = "col-sm-2 col-md-2 col-lg-2 ";
        this.newRequestClass  = this.col2GridClass + "newCaseBtn hidden";
        this.newActionClass   = this.col2GridClass + "newActionBtn hidden";
        this.dialClass        = this.col2GridClass + "callBtn hidden";
        this.newEmailClass    = this.col2GridClass + "sendMailBtn hidden";
        this.newSmsClass      = this.col2GridClass + "sendSmsBtn hidden";
        this.newDocumentClass = this.col2GridClass + "attachBtn hidden";
        this.sendEmailModalTitle = 'שלח דוא"ל ל' + this.props.voterDetails.first_name + ' ' + this.props.voterDetails.last_name;

        this.newActionHrefStyle = {};
        this.attachDocumentHrefStyle = {};
        if ( this.isNewCrmRequestUrl() ) {
            // If the screen is a new request screen,
            // then attch document and new action
            // fast buttons should be disabled.

            this.newActionHrefStyle = {
                pointerEvents: 'none'
            };

            this.attachDocumentHrefStyle = {
                pointerEvents: 'none'
            };
        } else if ( this.isCrmUrl() && this.isRequestClosedOrCancelled() ) {
            // If the screen is a request screen which it's status
            // is closed or cancellled, then attch document and new action
            // fast buttons should be disabled.

            this.newActionHrefStyle = {
                pointerEvents: 'none'
            };

            this.attachDocumentHrefStyle = {
                pointerEvents: 'none'
            };
        } else {
            this.newActionHrefStyle = {};
            this.attachDocumentHrefStyle = {};
        }
    }

    checkVoterPermissions() {
        if ( this.props.currentUser.permissions['elections.voter.fast_buttons'] == true ) {
            this.fastButtonsRow1Class = "row quickAccessContainer hidden-xs";
            this.fastButtonsRow2Class = "row quickAccessContainer hidden-sm hidden-md hidden-lg";
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.new_request'] == true ) {
            this.newRequestClass  = this.col2GridClass + "newCaseBtn";
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.new_action'] == true ) {
            this.newActionClass   = this.col2GridClass + "newActionBtn";
            this.newActionHrefStyle = {cursor: 'pointer'};
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.dial'] == true ) {
            this.dialClass = this.col2GridClass + "callBtn";
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.new_email'] == true ) {
            this.newEmailClass = this.col2GridClass + "sendMailBtn";
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.new_sms'] == true ) {
            this.newSmsClass = this.col2GridClass + "sendSmsBtn";
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.new_document'] == true ) {
            this.newDocumentClass = this.col2GridClass + "attachBtn";
            this.attachDocumentHrefStyle = {cursor: 'pointer'};
        }
    }
 
    checkCrmPermissions() {
        
        if ( this.props.currentUser.permissions['crm.requests.fast_buttons'] == true ) {
            this.fastButtonsRow1Class = "row quickAccessContainer hidden-xs";
            this.fastButtonsRow2Class = "row quickAccessContainer hidden-sm hidden-md hidden-lg";
        }

        if ( this.props.currentUser.permissions['crm.requests.fast_buttons.new_request'] == true ) {
            this.newRequestClass  = this.col2GridClass + "newCaseBtn";
        }

        if ( this.props.currentUser.permissions['crm.requests.fast_buttons.new_action'] == true ) {
            this.newActionClass   = this.col2GridClass + "newActionBtn";
        }

        if ( this.props.currentUser.permissions['crm.requests.fast_buttons.dial'] == true ) {
            this.dialClass = this.col2GridClass + "callBtn";
        }

        if ( this.props.currentUser.permissions['crm.requests.fast_buttons.new_email'] == true ) {
            this.newEmailClass = this.col2GridClass + "sendMailBtn";
        }

        if ( this.props.currentUser.permissions['crm.requests.fast_buttons.new_sms'] == true ) {
            this.newSmsClass = this.col2GridClass + "sendSmsBtn";
        }

        if ( this.props.currentUser.permissions['crm.requests.fast_buttons.new_document'] == true ) {
            this.newDocumentClass = this.col2GridClass + "attachBtn";
        }
    }
 
    checkPermissions() {

        if ( this.props.currentUser.admin ) {
            this.allowDialToVoter = true;
            this.allowEditSupportStatus = true;
            this.allowViewSupportStatusScreen = true;

            this.linkToBallotClass = "";
            this.mainBlockClass = "dtlsBox electorDtlsStrip clearfix";
            this.fastButtonsRow1Class = "row quickAccessContainer hidden-xs";
            this.fastButtonsRow2Class = "row quickAccessContainer hidden-sm hidden-md hidden-lg";
            this.newRequestClass  = this.col2GridClass + "newCaseBtn";
            this.newActionClass   = this.col2GridClass + "newActionBtn";
            this.dialClass        = this.col2GridClass + "callBtn";
            this.newEmailClass    = this.col2GridClass + "sendMailBtn";
            this.newSmsClass      = this.col2GridClass + "sendSmsBtn";
            this.dialClass = this.col2GridClass + "callBtn";
            this.newEmailClass = this.col2GridClass + "sendMailBtn";
            this.newSmsClass = this.col2GridClass + "sendSmsBtn";
            this.newDocumentClass = this.col2GridClass + "attachBtn";
            return;
        }

        if ( this.props.currentUser.permissions['elections.voter'] == true ||
             this.props.currentUser.permissions['crm.requests'] ) {
            this.mainBlockClass = "dtlsBox electorDtlsStrip clearfix";
        }

        if ( this.props.currentUser.permissions['elections.voter.fast_buttons.dial'] == true ) {
            this.allowDialToVoter = true;
        }
        if ( this.props.currentUser.permissions['elections.voter.support_and_elections.support_status.edit'] == true ) {
            this.allowEditSupportStatus = true;
        }

        if ( this.props.currentUser.permissions['elections.voter.support_and_elections.support_status'] == true ) {
            this.allowViewSupportStatusScreen = true;
        }

        if ( this.props.currentUser.permissions['elections.voter.support_and_elections.ballot.edit'] == true ) {
            this.linkToBallotClass = "";
        }

        if ( this.isVoterUrl() ) {
            this.checkVoterPermissions();
            return;
        }

        if ( this.isCrmUrl() ) {
            this.checkCrmPermissions();
            return;
        }
    }
    
    /**
     *  This function moves to "support status
     *  "text" mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus.
     *
     */
    disableSupportEditing() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_CHANGE,
                             supportStatusId: this.props.oldVoterDetails.support_status_id0,
                             supportStatusName: this.props.oldVoterDetails.support_status_name0,
                             supportStatusLike: this.props.oldVoterDetails.support_status_likes0});

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE,
                             editSupportStatusKey: 'text'});
    }

    /**
     *  This function moves from support status
     *  "link" mode to "support status "text"
     *  mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus.
     *
     */
    enableSupportEditing(e) {
        // Prevent page refresh
        e.preventDefault();

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE,
                             editSupportStatusKey: 'edit'});
    }

    /**
     *  This function moves from support status
     *  "link" mode to "support status "text"
     *  mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus.
     *
     */
    disableSupportStatusLinkState() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE,
                             editSupportStatusKey: 'text'});
    }

    /**
     *  This function moves from support status
     *  "text" mode to "support status "link"
     *  mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus.
     *
     */
    enableSupportStatusLinkState() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE,
                             editSupportStatusKey: 'link'});
    }

    getSupportStatusLike(supportStatusName) {
        let supportStatuses = this.props.supportStatuses;
        let supportStatusIndex = -1;
        let supportStatusLike = '';

        supportStatusIndex = supportStatuses.findIndex(statusItem => statusItem.name == supportStatusName);
        if ( -1 == supportStatusIndex ) {
            return '';
        } else {
            supportStatusLike = supportStatuses[supportStatusIndex].likes;
            return supportStatusLike;
        }
    }

    /**
     * This function returns the city id
     * by the city name.
     *
     * @param supportStatusName
     * @returns {number}
     */
    getSupportStatusId(supportStatusName) {
        let supportStatuses = this.props.supportStatuses;
        let supportStatusIndex = -1;
        let supportStatusId = 0;

        supportStatusIndex = supportStatuses.findIndex(statusItem => statusItem.name == supportStatusName);
        if ( -1 == supportStatusIndex ) {
            return 0;
        } else {
            supportStatusId = supportStatuses[supportStatusIndex].id;
            return supportStatusId;
        }
    }

    supportStatusChange(e) {
        var supportStatusName = e.target.value;
        var supportStatusId = 0;
        var supportStatusLike = '';
        var supportStatusKey = '';

        supportStatusId = this.getSupportStatusId(supportStatusName);
        supportStatusLike = this.getSupportStatusLike(supportStatusName);

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_CHANGE,
                             supportStatusId: supportStatusId, supportStatusName: supportStatusName,
                             supportStatusLike: supportStatusLike});
    }

    renderSaveSupportButtons() {
        // Save button will be displayed only if there
        // has been a valid change in support status
        if ( this.validInputs &&
            this.props.voterDetails.support_status_id0 != this.props.oldVoterDetails.support_status_id0 ) {
            return (
                <div className="col-sm-4">
                    <button className="btn btn-success btn-xs"
                            onClick={this.saveVoterSupport.bind(this)}
                            disabled={!this.validInputs}>
                        <i className="fa fa-floppy-o"/>
                    </button>
                    {'\u00A0'}
                    <button className="btn btn-danger btn-xs"
                            onClick={this.disableSupportEditing.bind(this)}>
                        <i className="fa fa-times"/>
                    </button>
                </div>
            );
        } else {
            return (
                <button className="btn btn-danger btn-xs"
                        onClick={this.disableSupportEditing.bind(this)}>
                    <i className="fa fa-times"/>
                </button>
            );
        }
    }

    /**
     *  This function returns Combo for editing
     *  support status.
     *  This function prints the support status
     *  according to "edit" mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus
     *
     * @returns {XML}
     */
    renderEditSupport() {
        var support_status_name0 = this.props.voterDetails.support_status_name0;
        var supportStatusClassName = "";

        if ( this.validInputs ) {
            supportStatusClassName = "row supportStatus";
        } else {
            supportStatusClassName = "row supportStatus has-error";
        }
		let activeStatuses = this.props.supportStatuses.filter(item => item.active==1);
 
        return (
            <div className={supportStatusClassName}>
                <div className="col-sm-8">
                    <Combo items={activeStatuses}
                            maxDisplayItems={10} itemIdProperty="id"
                            itemDisplayProperty='name'
                            value={this.props.voterDetails.support_status_name0}
                            onChange={this.supportStatusChange.bind(this)}/>
                </div>

                {this.renderSaveSupportButtons()}
            </div>
        );
    }

    /**
     *  This function returns the support
     *  status name with link to "edit" mode.
     *  This function prints the support status
     *  according to "link" mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus
     *
     * @returns {XML}
     */
    renderSupportStatusLinkState() {
        var support_status_name0 = "";
        var support_status_likes0 = this.props.voterDetails.support_status_likes0;

        if (this.props.voterDetails.support_status_name0 != null &&
            0 == this.props.voterDetails.support_status_name0.length ) {
            support_status_name0 = "ללא סטטוס";
        } else {
            support_status_name0 = this.props.voterDetails.support_status_name0;
        }

        return (
            <div className="supportStatus">
                <span>
                    <a href="#" onClick={this.enableSupportEditing.bind(this)}
                       style={{textDecoration:'underline'}}
                       onMouseOut={this.disableSupportStatusLinkState.bind(this)}>
                        {support_status_name0}
                    </a>
                </span>

                {this.renderSupportStatusLike(support_status_likes0, support_status_name0)}

                <a href="#" onClick={this.redirectUpdateStatus.bind(this)}
                   title={this.fieldLinkTitleText} className="directLink">
                    <img src={this.imageIcoDirectLink} alt={this.fieldLinkAltText}/>
                </a>
            </div>
        );
    }

    /**
     * This function prints the redirect icon
     * to voter supoort status screen, only if
     * the user is permitted to view the screen.
     *
     * @returns {XML}
     */
    renderSupportStatusTextRedirectIcon() {
        if ( this.allowViewSupportStatusScreen ) {
            return (
                <a href="#" onClick={this.redirectUpdateStatus.bind(this)}
                   title={this.fieldLinkTitleText} className="directLink">
                    <img src={this.imageIcoDirectLink} alt={this.fieldLinkAltText}/>
                </a>
            );
        }
    }

    /**
     * This function prints the like icon
     * if the supoort status like is 1.
     *
     * @param support_status_likes0
     * @param support_status_name0
     * @returns {XML}
     */
    renderSupportStatusLike(support_status_likes0, support_status_name0) {
        if ( 1 == support_status_likes0 ) {
            return (
                <span className="supporStatusIndctr">
                    <img src={this.imageSupportStatus} alt={support_status_name0}/>
                </span>
            );
        }
    }

    /**
     * This function prints the support status name
     * according to the edit support status permission.
     *
     * @param support_status_name0
     * @returns {*}
     */
    renderSupportStatusTextName(support_status_name0) {
        if ( this.allowEditSupportStatus ) {
            return (
                <span onMouseOver={this.enableSupportStatusLinkState.bind(this)}>
                    {support_status_name0}
                </span>
            );
        } else {
            return support_status_name0;
        }
    }

    /**
     *  This function returns the support
     *  status name text.
     *  This function prints the support status
     *  according to "text" mode.
     *
     *  For explanation about the supoort status
     *  modes see documentation of function
     *  renderSupportStatus
     *
     * @returns {XML}
     */
    renderSupportStatusTextState() {
        var support_status_name0 = "";
        var support_status_likes0 = this.props.voterDetails.support_status_likes0;

        if ( this.props.voterDetails.support_status_name0 == null ||
             0 == this.props.voterDetails.support_status_name0.length ) {
            support_status_name0 = "ללא סטטוס";
        } else {
            support_status_name0 = this.props.voterDetails.support_status_name0;
        }

        return (
            <div className="supportStatus">
                {this.renderSupportStatusTextName(support_status_name0)}

                {this.renderSupportStatusLike(support_status_likes0, support_status_name0)}

                {this.renderSupportStatusTextRedirectIcon()}
            </div>
        );
    }

    /**
     * This function handles the support status flow.
     * the idea is a states machine with th following modes:
     *   "text" - The support status is displayed
     *   "link" - The support status is linked
     *            to moving to edit mode
     *   "edit" - The support status is being edited
     *
     *   Move from "text" mode to "link" mode by mouseover
     *   Move from "link" mode to "text" mode by mouseout
     *
     *   Move from "link" mode" to "edit" mode by clicking
     *   the support status name
     *
     *   Move from "text" mode to "text" mode by changing
     *   the support status name or undo the changes by
     *   clicking the disable button
     *
     * @returns {*}
     */
    renderSupportStatus() {
        var support_status_id0 = this.props.voterDetails.support_status_id0;

        if ( !this.allowEditSupportStatus ) {
            return this.renderSupportStatusTextState();
        } else {
            switch (this.props.mainBlockSupportStatusState) {
                // link mode - see the documentation above
                case 'link':
                    return this.renderSupportStatusLinkState();
                    break;

                // edit mode - see the documentation above
                case 'edit':
                    return this.renderEditSupport();
                    break;

                // text mode - see the documentation above
                case 'text':
                default:
                    return this.renderSupportStatusTextState();
                    break;
            }
        }
    }

    renderCanVote() {
        var voters_in_election_campaigns_id = this.props.oldVoterDetails.voters_in_election_campaigns_id;

        this.canVoteClassName = '';
        this.canVoteText = '';

        // Only admin can view this data.
        if ( this.props.currentUser.admin ){
			   this.canVoteText  = this.props.oldVoterDetails.voter_voting_text;
			   if(this.props.oldVoterDetails.eligible == '1'){
				     this.canVoteClassName = 'electorStatus Eligable';
					 return (
						<div className={this.canVoteClassName}>
							{this.canVoteText}
							<span className={this.linkToBallotClass}>
								<a href="#" onClick={this.redirectBallot.bind(this)}
								title={this.fieldLinkTitleText} className="directLink">
									<img src={this.imageIcoDirectLink} alt={this.fieldLinkAltText}/>
								</a>
							</span>
						</div>
                );
			   }else{
				     this.canVoteClassName = 'electorStatus notEligable';
					  return (
							<div className={this.canVoteClassName}>
							{this.canVoteText}
							</div>
						);
			   }
        }
    }

    /**
     * If the user deosn't have permissions
     * to watch address, then don't display
     * the button
     *
     * @returns {XML}
     */
    renderVoterAddress() {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.additional_data.address'] == true ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <dd>
                    {this.voterAddress}

                    <span className={this.linkToBallotClass}>
                        <a href="#" onClick={this.redirectUpdateAddress.bind(this)}
                           title={this.fieldLinkTitleText} className="directLink">
                            <img src={this.imageIcoDirectLink} alt={this.fieldLinkAltText}/>
                        </a>
                    </span>
                </dd>
            );
        } else {
            return <dd>{this.voterAddress}</dd>;
        }
    }

    /**
     * This function renders the voter's final status.
     *
     * @returns {XML}
     */
    renderVoterSupportStatusFinal() {
        var voterSupportStatuses = this.props.voterSupportStatuses;
        var supportstatusId = voterSupportStatuses.support_status_id2;
        var supportStatusIndex = -1;
        var supportStatusName = "";
        var supportStatusLike = "";
        var supportStatuses = this.props.supportStatuses;

        if ( null == supportstatusId ) {
            return <dd>{'\u00A0'}</dd>;
        }
        supportStatusIndex = supportStatuses.findIndex(statusItem => statusItem.id == supportstatusId);
        if ( -1 == supportStatusIndex ) {
            return <dd>{'\u00A0'}</dd>;
        }

        supportStatusName = supportStatuses[supportStatusIndex].name;
        supportStatusLike = supportStatuses[supportStatusIndex].likes;

        return (
            <dd>
                {supportStatusName}

                {this.renderSupportStatusLike(supportStatusLike, supportStatusName)}
            </dd>
        );
    }

    getEndingName() {
        if ( this.props.oldVoterDetails.voter_ending_name == '' ) {
            return '\u00A0';
        } else {
            return this.props.oldVoterDetails.voter_ending_name;
        }
    }

    getTitleName() {
        if ( this.props.oldVoterDetails.voter_title_name == '' ) {
            return '\u00A0';
        } else {
            return this.props.oldVoterDetails.voter_title_name;
        }
    }

    getEmail() {
        if ( this.props.oldVoterDetails.email == '' ) {
            return '\u00A0';
        } else {
            return this.props.oldVoterDetails.email;
        }
    }

    getShasRepresentative() {
        var shas_representative_role_name = this.props.oldVoterDetails.shas_representative_role_name;
        var shas_representative_city_name = this.props.oldVoterDetails.shas_representative_city_name;
        var displayRepresentative = '';

        if ( null == shas_representative_role_name ) {
            return '\u00A0';
        } else {
            displayRepresentative = shas_representative_role_name + ', ' + shas_representative_city_name;
            return displayRepresentative;
        }
    }

    /**
     * This function validates the
     * voter support status.
     *
     * @returns {boolean}
     */
    validateStatus() {
        var statusName = this.props.voterDetails.support_status_name0;
        var statusId = this.props.voterDetails.support_status_id0;

        if (statusName != null &&  0 ==  statusName.length ) {
            return true;
        }

        if ( 0 == statusId) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateStatus() ) {
            this.validInputs = false;
        }
    }
	
	/*
	function that sets a list of mobile not-kosher phones of current voter that can receive SMS
	*/
	initSMSPhonesList(){
		this.filteredMobilePhones = [];
		for(let i = 0 ; i <this.props.voterPhones.length ;i++){
			if(!this.props.voterPhones[i].wrong &&
                this.props.voterPhones[i].sms == 1 &&
                isMobilePhone(this.props.voterPhones[i].phone_number) && 
                !checkKosherPhone(this.props.voterPhones[i].phone_number) ){
				this.filteredMobilePhones.push(this.props.voterPhones[i]);
			}
		}
	}

	setSMSModalVisible(isVisible){
        if(this.sendSmsButtonEnabled){
            this.setState({sendSmsModalVisible:isVisible});
            if(!isVisible){
                this.setState({
                    selectedSmsText:'',
                    selectedSmsPhone : {value:'' ,item:null},
                });
            }
        }
	}
	
	smsModalItemChange(fieldName , e){
		if(fieldName=='selectedSmsPhone'){
			this.setState({selectedSmsPhone:{value:e.target.value , item:e.target.selectedItem}});
		}
		else if(fieldName=='selectedSmsText'){
			this.setState({selectedSmsText:e.target.value})
			
		}
	}
	
	sendSMS() {
		if(this.state.selectedSmsText.length >= 4 && this.state.selectedSmsPhone.item){ //check validation to send sms
            if ( this.isVoterUrl() ) {
                VoterActions.sendRealSMSViaAPI(this.props.router.params.voterKey , this.state.selectedSmsPhone.item.key ,
                    this.state.selectedSmsText);
            } else if ( this.isCrmUrl() ) {
                CrmActions.sendRealSMSViaAPI(this.props.router.params.reqKey, this.state.selectedSmsPhone.item.key ,
                                             this.state.selectedSmsText);
            }

            this.setState({
                sendSmsModalVisible:false,
                selectedSmsText:'',
                selectedSmsPhone : {value:'' ,item:null},
            });
		}
	}
    getVoterEnabledPhones(){
        let voterPhones = this.props.voterDetails.phones;
        let voterEnabledPhones = []
        if (voterPhones && voterPhones.length > 0) {
            voterPhones.forEach(function (phone) {
                if (!phone.wrong && phone.call_via_tm) { voterEnabledPhones.push(phone) }
            })
        }
        return voterEnabledPhones;
    }
    render() {
		if(this.props.router.location.pathname.indexOf("elections/voters") >= 0){
			this.smsSource = "voters";
		}
		else if(this.props.router.location.pathname.indexOf("crm/requests") >= 0){
			this.smsSource = "crmRequests";
		}
		this.sendSmsButtonEnabled=true;
		if ( this.smsSource == "voters" && !this.props.currentUser.admin &&  this.props.currentUser.permissions['elections.voter.fast_buttons.new_sms'] != true ) {
			this.sendSmsButtonEnabled=false;
		}
		else if ( this.smsSource == "crmRequests" && !this.props.currentUser.admin &&  this.props.currentUser.permissions['crm.requests.fast_buttons.new_sms'] != true ) {
			this.sendSmsButtonEnabled=false;
		}
        this.initVariables();
		this.initSMSPhonesList();
        this.checkPermissions();
        this.validateVariables();
        this.voterEnabledPhones = [];
        if(this.allowDialToVoter && !this.props.inCall)  {  this.voterEnabledPhones = this.getVoterEnabledPhones()  }    
        let dialButtonStyle = { cursor: this.voterEnabledPhones.length > 0 ? 'pointer' : 'not-allowed' };
        return (
            <div className={this.mainBlockClass}>
                <div className="row electorDtlsData">
                    <div className="col-xs-12 col-sm-12 col-md-2 col-lg-2 firstCol">
                        <div className="electorTitle">{this.getTitleName()}</div>
                        <div className="electorName">{this.fullName}</div>
                        <div className="electorSuffix">{this.getEndingName()}</div>
                        {this.renderSupportStatus()}
                        {this.renderCanVote()}
                    </div>

                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4 secondCol">
                        <dl className="dl-horizontal">
                            <dt>ת"ז</dt>
                            <dd>{this.props.oldVoterDetails.personal_identity}</dd>
                            <dt>גיל</dt>
                            <dd>{this.age}</dd>
                            <dt>מגדר</dt>
                            <dd>{this.genderName}</dd>
                            {this.getAddressTitle()}
                            {this.renderVoterAddress()}
                            <dt>{'\u00A0'}</dt>
                            {this.printUnverifiedAddress()}
                        </dl>
                    </div>

                    <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4 thirdCol">
                        <dl className="dl-horizontal">
                            <dt>מספר טלפון</dt>
                            {this.renderMainPhoneNumber()}
                            <dt>{this.getAdditionalPhoneTitle()}</dt>
                            {this.renderAdditionalPhoneNumber()}
                            {this.getEmailTitle()}
                            <dd>{this.getEmail()}</dd>
                            <dt>תפקיד</dt>
                            <dd>{this.getShasRepresentative()}</dd>
                        </dl>
                    </div>

                    <div className="col-xs-12 col-sm-4 col-md-2 col-lg-2 lastCol">
                        <dl className="dl-horizontal">
                            <dt>סטטוס סופי</dt>
                            {this.renderVoterSupportStatusFinal()}
                            <dt>נציג ש"ס</dt>
                            <dd>{this.shas_representative}</dd>
                            <dt>פעיל במערכת</dt>
                            <dd>{this.userActive}</dd>
                        </dl>
                    </div>
                </div>

                <div className={this.fastButtonsRow1Class}>
                    <div className="col-sm-2 col-md-3 col-lg-3">
                        <div className={this.toVoterScreenClass}>
                            <Link to={this.toVoterScreenUrl} title={this.linkTitle}>
                                <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
                                {this.toVoterScreenText}
                            </Link>
                        </div>
                    </div>
                    <div className="col-sm-10 col-md-9 col-lg-9">
                        <div className="row quickAccess">
                            <a href={this.props.router.location.basename +this.newRequestLink}
                               className={this.isNewCrmRequestUrl()?'disabled':''}
                               onClick={this.redirectToNewRequest.bind(this)}
                               title={this.fastButtonsLinksTexts.request}>
                                <div className={this.newRequestClass}>
                                    {this.fastButtonsLinksTexts.request}
                                </div>
                            </a>
                            <a style={ this.newActionHrefStyle}
                               onClick={this.redirectToNewAction.bind(this)}
                               title={this.fastButtonsLinksTexts.action}>
                                <div className={this.newActionClass}>
                                    {this.fastButtonsLinksTexts.action}
                                </div>
                            </a>
                            <a style={dialButtonStyle} title={this.fastButtonsLinksTexts.dial}
                                onClick={this.openDialWindow.bind(this, null)}>
                                <div className={this.dialClass}>
                                    {this.fastButtonsLinksTexts.dial}
                                </div>
                            </a>
                            <a style={{cursor:'pointer'}} title={this.fastButtonsLinksTexts.email}
                               onClick={this.redirectToSendEmail.bind(this)}
                               className={(this.props.voterDetails.contact_via_email == '1' &&
                                           this.props.voterDetails.email.length > 3 ? "": "disabled")}>
                                <div className={this.newEmailClass}>
                                    {this.fastButtonsLinksTexts.email}
                                </div>
                            </a>
                            <a style={{cursor:(this.sendSmsButtonEnabled?'pointer':'not-allowed') , opacity:(this.sendSmsButtonEnabled?'':'0.5')}}
                               title={this.fastButtonsLinksTexts.sms} onClick={this.setSMSModalVisible.bind(this , true)}>
                                <div className={this.newSmsClass}>
                                    {this.fastButtonsLinksTexts.sms}
                                </div>
                            </a>
                            <a style={this.attachDocumentHrefStyle}
                               onClick={this.redirectToNewDocument.bind(this)}
                               title={this.fastButtonsLinksTexts.document}>
                                    <div className={this.newDocumentClass}>
                                        {this.fastButtonsLinksTexts.document}
                                    </div>
                            </a>
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
                        <div className="row quickAccess clearfix">
                            <a href={this.props.router.location.basename +this.newRequestLink} className={this.isNewCrmRequestUrl()?'disabled':''}
                            onClick={this.redirectToNewRequest.bind(this)} title={this.fastButtonsLinksTexts.request}>
                                <div className="col-xs-6 accessBtn newCaseBtn">{this.fastButtonsLinksTexts.request}</div>
                            </a>
                            <a href="#" title={this.fastButtonsLinksTexts.action}>
                                <div className="col-xs-6 accessBtn newActionBtn">{this.fastButtonsLinksTexts.action}</div>
                            </a>
                            <a href="#" title={this.fastButtonsLinksTexts.call}>
                                <div className="col-xs-6 accessBtn callBtn">{this.fastButtonsLinksTexts.call}</div>
                            </a>
                            <a href="#" title={this.fastButtonsLinksTexts.mail}
                               className={(this.props.voterDetails.contact_via_email == '1' && this.props.voterDetails.email.length > 3? "": "disabled")}>
                                <div className="col-xs-6 accessBtn sendMailBtn">{this.fastButtonsLinksTexts.mail}</div>
                            </a>
                            <a href="#" title={this.fastButtonsLinksTexts.sms}>
                                <div className="col-xs-6 accessBtn sendSmsBtn">{this.fastButtonsLinksTexts.sms}</div>
                            </a>
                            <a href="#" title={this.fastButtonsLinksTexts.document}>
                                <div className="col-xs-6 accessBtn attachBtn">{this.fastButtonsLinksTexts.document}</div>
                            </a>
                        </div>
                    </div>
                </div>

                <ModalWindow show={this.props.showSendEmailModalDialog}
                             buttonOk={this.sendEmailModalDialogConfirm.bind(this)}
                             buttonCancel={this.closeEmailModalDialog.bind(this)}
                             title={this.sendEmailModalTitle}
                             buttonX={this.closeEmailModalDialog.bind(this)}>
                    <div className="form-horizontal" style={{width: '600px', margin:'10px'}}>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="emailTitle" className="col-md-1 control-label">כותרת</label>
                                <div className="col-sm-11">
                                    <input type="text" className="form-control" id="emailTitle"
                                           onChange={this.updateMailContent.bind(this,'title')}
                                           value={this.props.emailContent.title}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="emailMessage" className="col-md-1 control-label">תוכן</label>
                                <div className="col-sm-11">
                                    <textarea className="form-control" rows="10" id="emailMessage"
                                              onChange={this.updateMailContent.bind(this,'body')}
                                              value={this.props.emailContent.body}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalWindow>
				
				 <ModalWindow show={this.state.sendSmsModalVisible}
                             buttonOk={this.sendSMS.bind(this)}
                             buttonCancel={this.setSMSModalVisible.bind(this ,false)}
                             title="שליחת SMS"
                             buttonX={this.setSMSModalVisible.bind(this , false)}>
                    <div className="form-horizontal" style={{width: '600px', margin:'10px'}}>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="emailTitle" className="col-md-1 control-label">נייד</label>
                                <div className="col-sm-11">
                                    <Combo items={this.filteredMobilePhones}
                                         maxDisplayItems={5} itemIdProperty="id"
                                         itemDisplayProperty='phone_number'
                                         value={this.state.selectedSmsPhone.value}
                                         onChange={this.smsModalItemChange.bind(this,'selectedSmsPhone')}
										 inputStyle={{borderColor:(this.state.selectedSmsPhone.item  ? '#ccc' :'#ff0000')}}/>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="form-group">
                                <label htmlFor="emailMessage" className="col-md-1 control-label">תוכן</label>
                                <div className="col-sm-11">
                                    <textarea className="form-control" rows="5"  
                                              onChange={this.smsModalItemChange.bind(this,'selectedSmsText')}
                                              value={this.state.selectedSmsText} style={{borderColor:(this.state.selectedSmsText.length < 4 ? '#ff0000' :'#ccc')}}/>
                               
							   {(this.state.selectedSmsText.length < 4 || !this.state.selectedSmsPhone.item)?
	                           <div style={{color:'#ff0000' , paddingTop:'15px' , fontWeight:'bold' , fontStyle:'italic'}}>
								 
								 * חובה לבחור טלפון נייד ולרשום טקסט של לפחות 4 תווים 
								</div>  :null}
							   </div>
							 
							
                            </div>
                        </div>
                    </div>
                </ModalWindow>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
		voterPhones: state.voters.voterDetails.phones,
        voterDetails: state.voters.voterDetails,
        oldVoterDetails: state.voters.oldVoterDetails,
        voterScreen: state.voters.voterScreen,
        loadingVoter: state.voters.voterScreen.loadingVoter,
        loadedVoter: state.voters.voterScreen.loadedVoter,
        loadedVoterElectionCampaigns: state.voters.voterScreen.loadedVoterElectionCampaigns,
        savingVoterData: state.voters.voterScreen.savingVoterData,
        selectedVoter: state.voters.searchVoterScreen.selectedVoter,
        voterSystemUser: state.voters.voterScreen.voterSystemUser,
        supportStatuses: state.voters.searchVoterScreen.supportStatuses,
        voterSupportStatuses: state.voters.voterScreen.supportStatuses,
        oldVoterSupportStatuses: state.voters.voterScreen.oldSupportStatuses,
        voterElectionCampaigns: state.voters.voterScreen.voterElectionCampaigns,
        showSendEmailModalDialog: state.crm.showSendEmailModalDialog,
        emailContent: state.crm.emailContent,
        mainBlockSupportStatusState: state.voters.voterScreen.mainBlockSupportStatusState,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
        statusList: state.crm.searchRequestsScreen.statusList,
        currentUser: state.system.currentUser,
        inCall: state.voters.voterDialerWindowData.inCall,
    }
}

export default connect(mapStateToProps)(withRouter(VoterMainBlock));
