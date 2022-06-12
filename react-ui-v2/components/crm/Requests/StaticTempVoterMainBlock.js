import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import {dateTimeReversePrint, getCurrentFormattedDateTime} from '../../../libs/globalFunctions';

class StaticTempVoterMainBlock extends React.Component {

    constructor(props) {
        super(props);
    }
    setEditingUnknownVoter(isEditing) {
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.SET_TEMP_VOTER_EDITING, data: isEditing
        });
    }

    getPhoneNumberByType(phoneTypeName) {
        var phones = this.props.oldVoterDetails.phones;
        var phoneTypeIndex = -1;

        phoneTypeIndex = phones.findIndex(phoneItem => phoneItem.phone_type_name == phoneTypeName);
        if (phoneTypeIndex == -1) {
            return '';
        } else {
            return phones[phoneTypeIndex].phone_number
        }
    }

    constructAddress(city, neighborhood, street, house, house_entry, flat, zip) {
	 
        let returnedValue = '';

        if (street != undefined && street != null && street.trim() != '') {
            returnedValue += street + ' ';
        }
        if (house != undefined && house != null && house != '') {
            returnedValue += house + ' ';
            if (flat != undefined && flat != null && flat != '') {
                returnedValue += '/' + flat + ' ';
            }
            if (house_entry != undefined && house_entry != null && house_entry != '') {
                returnedValue +=  'כניסה ' + house_entry + ' ';
            }
        }

        if (neighborhood != undefined && neighborhood != null && neighborhood.trim() != '') {
            if (returnedValue != '') {
                returnedValue += ' , ';
            }
            returnedValue += neighborhood;
        }
        if (city != undefined && city != null && city.trim() != '') {
            if (returnedValue != '') {
                returnedValue += ' , ';
            }
            returnedValue += city;
        }
        if (zip != undefined && zip != null && zip.trim() != '') {
            if (returnedValue != '') {
                returnedValue += ' , ';
            }
            returnedValue += 'מיקוד  ' + zip;
        }
        return returnedValue;
    }

	
	
    renderButton() {
        var displayButton = false;

        if (this.props.currentUser.admin ||
            this.props.currentUser.permissions['crm.requests.unknown_voter.edit'] == true) {
            displayButton = true;
        }

        if (displayButton) {
            return (
                    <button className="btn btn-primary wideBtn" onClick={this.setEditingUnknownVoter.bind(this, true)}>
                        עדכון פרטים
                    </button>
                    );
        }
    }

    redirectToNewAction() {
//        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,voterTab: this.tabActions.name});
//        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ACTION_ADD_SHOW_SCREEN});
//
//        if ( !this.isVoterUrl()) {
//            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_ACTION});
//            this.props.router.push('elections/voters/' + this.props.voterDetails.key);
//        }
    }

    redirectToNewDocument() {
//        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,voterTab: this.tabDocuments.name});
//        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DIV});
//
//        if ( !this.isVoterUrl()) {
//            this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_DOCUMENT});
//            this.props.router.push('elections/voters/' + this.props.voterDetails.key);
//        }
    }

    redirectToNewRequest(e) {
        e.preventDefault();
        let currentFormattedDate = getCurrentFormattedDateTime(new Date());
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLEAR_REQUEST_FORM, currentFormattedDate});
        this.props.router.push(this.newRequestLink);
    }

    initConstants() {
        this.fastButtonsLinksTexts = {
            request: 'פניה חדשה',
            action: 'פעולה חדשה',
            document: 'צרף מסמך',
            call: 'חייג',
            mail: 'שלח דוא"ל',
            sms: 'שלח SMS',
            voterMainLinkTitle: "שייך לתושב קיים"
        };

        this.newRequestLink = '/crm/requests/new/unknown';
        this.toVoterScreenUrl = "#";
    }

    selectVoter(e) {
        e.preventDefault();
        let returnUrl = this.props.router.location.pathname,
                returnButtonText = 'שייך פניה לתושב';

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH,
            data: {returnUrl: returnUrl, returnButtonText: returnButtonText}});
        this.props.router.push('elections/voters/search');
    }

    componentWillMount() {
        //update voter of request after search
        if (!_.isEmpty(this.props.selectedVoterForRedirect)){
            let selectedVoterKey = this.props.selectedVoterForRedirect.voters_key;
            let requestKey = this.props.router.params.reqKey;
            CrmActions.updateRequestVoter(this.props.dispatch, this.props.router, requestKey, selectedVoterKey);
            this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT});
        }
    }

    render() {

        this.initConstants();
        return (
                <div className="dtlsBox electorDtlsStrip clearfix">
                    <div className="row electorDtlsData">
                        <div className="col-xs-12 col-sm-12 col-md-2 col-lg-2 firstCol">
                            <div className="electorTitle">{'\u00A0'}</div>
                            <div className="electorName">{this.props.addUnknownVoterScreen.first_name} {this.props.addUnknownVoterScreen.last_name}</div>
                            <div className="electorSuffix"></div>
                        </div>
                
                        <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4 secondCol">
                            <dl className="dl-horizontal">
                                <dt>ת"ז</dt>
                                <dd>{this.props.addUnknownVoterScreen.personal_identity}</dd>
                                <dt>גיל</dt>
                                <dd>{this.props.addUnknownVoterScreen.age}</dd>
                                <dt>מגדר</dt>
                                <dd>{this.props.addUnknownVoterScreen.gender}</dd>
								 <dt>דרכון</dt>
                                <dd>{this.props.addUnknownVoterScreen.passport}</dd>
                                <dt>כתובת</dt>
                                <dd>{this.constructAddress(this.props.addUnknownVoterScreen.city, this.props.addUnknownVoterScreen.neighborhood, this.props.addUnknownVoterScreen.street, this.props.addUnknownVoterScreen.house, this.props.addUnknownVoterScreen.house_entry, this.props.addUnknownVoterScreen.flat, this.props.addUnknownVoterScreen.zip)}
                                </dd>
                            </dl>
                        </div>
                
                        <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4 thirdCol">
                            <dl className="dl-horizontal">
                                <dt>מס' טלפון</dt>
                                <dd>{this.props.addUnknownVoterScreen.phone1}</dd>
                                <dt>מס' טלפון נייד</dt>
                                <dd>{this.props.addUnknownVoterScreen.phone2}</dd>
                                <dt>דוא"ל</dt>
                                <dd>{this.props.addUnknownVoterScreen.email}</dd>
                            </dl>
                        </div>
                        <div className="col-xs-12 col-sm-4 col-md-2 col-lg-2 lastCol">
                            {this.renderButton()}
                        </div>
                    </div>
                

                    <div className="row quickAccessContainer hidden-xs">
                        <div className="col-sm-2 col-md-3 col-lg-3">
                            <div className={"textLink goBack" +(this.props.router.params.reqKey=='new'?" hidden" : "")}>
                              { !this.props.addUnknownVoterScreen.voter_id || this.props.addUnknownVoterScreen.voter_id==''?
                                <a  onClick={this.selectVoter.bind(this)} title={this.fastButtonsLinksTexts.voterMainLinkTitle}>
                                    {this.fastButtonsLinksTexts.voterMainLinkTitle}
                                </a>
                                :<div>הפנייה משוייכת לתושב</div>}
                            </div>
                        </div>
                        <div className="col-sm-10 col-md-9 col-lg-9">
                            <div className="row quickAccess">
                                <a href={this.newRequestLink} onClick={this.redirectToNewRequest.bind(this)} title={this.fastButtonsLinksTexts.request}>
                                    <div className="col-sm-2 col-md-2 col-lg-2 newCaseBtn">
                                        {this.fastButtonsLinksTexts.request}
                                    </div>
                                </a>
                                <a href="#" onClick={this.redirectToNewAction.bind(this)}
                                   title={this.fastButtonsLinksTexts.action}>
                                    <div className="col-sm-2 col-md-2 col-lg-2 newActionBtn">
                                        {this.fastButtonsLinksTexts.action}
                                    </div>
                                </a>
                                <a href="#" title={this.fastButtonsLinksTexts.call}>
                                    <div className="col-sm-2 col-md-2 col-lg-2 callBtn">{this.fastButtonsLinksTexts.call}</div>
                                </a>
                                <a href="#" title={this.fastButtonsLinksTexts.mail} 
                                    className={(this.props.voterDetails.contact_via_email=='1' && this.props.voterDetails.email.length>3? "": "disabled")}>
                                    <div className="col-sm-2 col-md-2 col-lg-2 sendMailBtn">{this.fastButtonsLinksTexts.mail}</div>
                                </a>
                                <a href="#" title={this.fastButtonsLinksTexts.sms}>
                                    <div className="col-sm-2 col-md-2 col-lg-2 sendSmsBtn">{this.fastButtonsLinksTexts.sms}</div>
                                </a>
                                <a href="#" onClick={this.redirectToNewDocument.bind(this)}
                                   title={this.fastButtonsLinksTexts.document}>
                                    <div className="col-sm-2 col-md-2 col-lg-2 attachBtn">
                                        {this.fastButtonsLinksTexts.document}
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                
                    {/* for small screen */}
                    <div className="row quickAccessContainer hidden-sm hidden-md hidden-lg">
                        <div className="col-xs-2 AccessColRight">
                            <div className="textLink goBack">
                            { !this.props.addUnknownVoterScreen.voter_id || this.props.addUnknownVoterScreen.voter_id==''?
                                <a  onClick={this.selectVoter.bind(this)} title={this.fastButtonsLinksTexts.voterMainLinkTitle}>
                                    {this.fastButtonsLinksTexts.voterMainLinkTitle}
                                </a>
                                :
                                <div>הפניה משויכת לתושב</div>
                            }
                            </div>
                        </div>
                        <div className="col-xs-10 AccessColLeft">
                            <div className="row quickAccess clearfix">
                                <a href={this.newRequestLink} onClick={this.redirectToNewRequest.bind(this)} title={this.fastButtonsLinksTexts.request}>
                                    <div className="col-xs-6 accessBtn newCaseBtn">{this.fastButtonsLinksTexts.request}</div>
                                </a>
                                <a href="#" title={this.fastButtonsLinksTexts.action}>
                                    <div className="col-xs-6 accessBtn newActionBtn">{this.fastButtonsLinksTexts.action}</div>
                                </a>
                                <a href="#" title={this.fastButtonsLinksTexts.call}>
                                    <div className="col-xs-6 accessBtn callBtn">{this.fastButtonsLinksTexts.call}</div>
                                </a> 
                                <a href="#" title={this.fastButtonsLinksTexts.mail} 
                                    className={(this.props.voterDetails.contact_via_email=='1' && this.props.voterDetails.email.length>3? "": "disabled")}>
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
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
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
        currentUser: state.system.currentUser,
        addUnknownVoterScreen: state.crm.addUnknownVoterScreen,
        selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect
    }
}

export default connect(mapStateToProps)(withRouter(StaticTempVoterMainBlock));