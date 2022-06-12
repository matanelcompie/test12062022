import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import ModalWindow from '../global/ModalWindow';

import * as VoterActions from '../../actions/VoterActions';
import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';
import * as CrmActions from '../../actions/CrmActions';

import VoterMainBlock from './VoterMainBlock';
import VoterGeneal from './VoterGenealTab/VoterGeneal';
import VoterTmPolls from './VoterTmPolls/VoterTmPolls';
import VoterSupportElections from './VoterSupportElectionsTab/VoterSupportElections';
import VoterInfo from './VoterInfoTab/VoterInfo';
import VoterParty from './VoterPartyTab/VoterParty';
import VoterRequests from './VoterRequestsTab/VoterRequests';
import VoterActionsComponent from './VoterActionsTab/VoterActionsComponent';
import VoterPaternalHome from './VoterPaternalHomeTab/VoterPaternalHome';
import Documents from '../global/Documents';
import Messages from './VoterMessages';
import globalSaving from '../hoc/globalSaving'


class Voter extends React.Component {

    constructor(props) {
        super(props);
        this.initConstants();
    }
	
	componentWillUnmount(){
		this.props.dispatch({type:SystemActions.ActionTypes.RESET_BREADCRUMBS});
	}

    initConstants() {
        this.searchButtonText = "איתור תושב";
    }

    loadVoterInformation(voterKey) {
        VoterActions.getVoterElectionCampaigns(this.props.dispatch, voterKey);
        VoterActions.loadVoterSupportElections(this.props.dispatch, voterKey);
        VoterActions.loadElectionRolesByVoter(this.props.dispatch, voterKey);
        VoterActions.loadMinisterOfFiftyByVoter(this.props.dispatch, voterKey);
        //VoterActions.loadVoterDeath(this.props.dispatch, voterKey);
        VoterActions.getVoterCampaignsSupportStatuses(this.props.dispatch, voterKey);
        VoterActions.getVoterHousehold(this.props.dispatch, voterKey);
        VoterActions.getVoterSupportStatuses(this.props.dispatch, voterKey);
        VoterActions.getVoterActions(this.props.dispatch, voterKey);
        VoterActions.getVoterTMPolls(this.props.dispatch, voterKey);
        VoterActions.getVoterRequests(this.props.dispatch, voterKey);
        GlobalActions.getEntityDocuments(this.props.dispatch, 0, voterKey);
        VoterActions.getRepresentativeList(this.props.dispatch, voterKey);
        VoterActions.getVoterInGroups(this.props.dispatch, voterKey);
        GlobalActions.getEntityMessages(this.props.dispatch, this.props.router, 0, voterKey);
        VoterActions.loadVoterMetaDataKeysValues(this.props.dispatch, voterKey);
        VoterActions.getVoterInstitutes(this.props.dispatch, voterKey);
    }

    loadResources(currentUser) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_ALL_GROUPS});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_VOTER_GROUPS});

        VoterActions.getVoteSources(this.props.dispatch);

        VoterActions.getAllElectionCampaigns(this.props.dispatch);
        VoterActions.loadAllSupportStatuses(this.props.dispatch);

        VoterActions.loadVoterElectionRoles(this.props.dispatch);
        VoterActions.loadVoterElectionRoleShifts(this.props.dispatch);

        VoterActions.loadAllAreas(this.props.dispatch);

        VoterActions.getRepresentativeRoles(this.props.dispatch);
        VoterActions.getVoterGroups(this.props.dispatch);

        if ( currentUser.admin || currentUser.permissions['elections.voter.additional_data.meta'] == true ) {
            VoterActions.loadMetaDataKeys(this.props.dispatch);
        }

        if ( currentUser.admin || currentUser.permissions['elections.voter.support_and_elections.election_activity'] == true) {
            VoterActions.loadMetaDataKeysByNames(this.props.dispatch);
        }

        if ( currentUser.admin || currentUser.permissions['elections.voter.additional_data.meta'] == true ||
            currentUser.permissions['elections.voter.support_and_elections.election_activity'] == true) {
            VoterActions.loadMetaDataValues(this.props.dispatch);
        }

        VoterActions.getLastCampaign(this.props.dispatch);

        if ( currentUser.admin || currentUser.permissions['elections.voter.additional_data.details'] == true ) {
            SystemActions.loadVoterTitle(this.props.dispatch);
            SystemActions.loadVoterEnding(this.props.dispatch);
            SystemActions.loadEthnic(this.props.dispatch);
            SystemActions.loadReligiousGroups(this.props.dispatch);
            SystemActions.loadCountries(this.props.dispatch);
        }

        if ( currentUser.admin || currentUser.permissions['elections.voter.additional_data.contact_details.phone'] == true ) {
            SystemActions.loadPhoneTypes(this.props.dispatch);
        }

        if ( currentUser.admin || currentUser.permissions['elections.voter.political_party.shas_institutes'] == true ) {
            /***  Voter lists for institutes  **/
            VoterActions.getInstituteGroups(this.props.dispatch);
            VoterActions.getInstituteTypes(this.props.dispatch);
            VoterActions.getInstituteRoles(this.props.dispatch);
            VoterActions.getInstituteNetworks(this.props.dispatch);
            VoterActions.getAllInstitutes(this.props.dispatch);
        }

        GlobalActions.getDocumentsTypes(this.props.dispatch);
    }

    componentWillMount() {
        var voterKey = this.props.router.params.voterKey;

        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLEAN_CRM_INPUT_DATA});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_ALL_GROUPS});

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_VOTER_GROUPS});

        this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_CLEAN_DATA});

        // Making sure that current user has been loaded
        if ( this.props.currentUser.first_name.length > 0 ) {
            // Checking if user is permitted to use the resource
            if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.voter'] == true ) {
                this.loadResources(this.props.currentUser);
            } else {
                this.props.router.push('/unauthorized');
            }
        }

        if (voterKey != undefined) {
            VoterActions.getVoterByKey(this.props.dispatch, voterKey, false, false, this.props.router);
        }
    }

    componentWillReceiveProps(nextProps) {
        var voterKey = this.props.routeParams.voterKey;
        var nextVoterKey = nextProps.routeParams.voterKey;

        if ( 0 == nextProps.currentUser.first_name.length ) {
            return;
        }

        // Making sure that current user has been loaded
        if ( 0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            // Checking if user is permitted to use the resource
            if ( nextProps.currentUser.admin || nextProps.currentUser.permissions['elections.voter'] == true ) {
                this.loadResources(nextProps.currentUser);
            } else {
                this.props.router.push('/unauthorized');
            }
        }

        if (voterKey != nextVoterKey && nextVoterKey != undefined) {
            this.props.dispatch({type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_CLEAN_DATA});

            VoterActions.getVoterByKey(this.props.dispatch, nextVoterKey, false, false, this.props.router);
        }

        if (!this.props.loadedVoter && nextProps.loadedVoter) {
            this.loadVoterInformation(voterKey);

            if (nextProps.voterDetails.user_key != null) {
                if ( nextProps.currentUser.admin ||
                     nextProps.currentUser.permissions['elections.voter.additional_data.user'] == true ) {
                    VoterActions.getVoterSystemUser(this.props.dispatch, voterKey);
                }
            }

            VoterActions.loadVoterCityStreets(this.props.dispatch, nextProps.voterDetails.city_key, true);

            SystemActions.addLastViewedVoters(this.props.dispatch, voterKey);
        }

        if (voterKey != undefined && this.props.loadedVoter) {
            let systemTitle = this.props.voterDetails.personal_identity + ' ' + this.props.voterDetails.first_name.trim()
            systemTitle += ' ' + this.props.voterDetails.last_name.trim();

            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle});
        } else {
            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'כרטיס תושב'});
        }
    }

    /**
     * This function is triggered by event
     * of clicking tab in the top lists screen.
     *
     * @param string tabName - The clicked tab's name
     */
    tabClick(tabName) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE,
            voterTab: tabName
        });
    }

    /**
     *  This function determines which tab is active
     *  according to the field tab in object listsScreen
     *  and returns the active tab component.
     */
    setActiveTabComponent() {
        switch (this.props.voterTab) {
            case this.tabInfo.name:
                this.tabInfo.className = 'active';
                this.tabInfo.display = true;
                break;

            case this.tabSupportElections.name:
                this.tabSupportElections.className = 'active';
                this.tabSupportElections.display = true;
                break;

            case this.tabParty.name:
                this.tabParty.className = 'active';
                this.tabParty.display = true;
                break;

            case this.tabRequests.name:
                this.tabRequests.className = 'active';
                this.tabRequests.display = true;
                break;

            case this.tabActions.name:
                this.tabActions.className = 'active';
                this.tabActions.display = true;
                break;

            case this.tabPolls.name:
                this.tabPolls.className = 'active';
                this.tabPolls.display = true;
                break;

            case this.tabPaternalHome.name:
                this.tabPaternalHome.className = 'active';
                this.tabPaternalHome.display = true;
                break;

            case this.tabDocuments.name:
                this.tabDocuments.className = 'active';
                this.tabDocuments.display = true;
                break;

            case this.tabMessages.name:
                this.tabMessages.className = 'active';
                this.tabMessages.display = true;
                break;

            case this.tabGeneral.name:
            default:
                this.tabGeneral.className = 'active';
                this.tabGeneral.display = true;
                break;
        }
    }

    initVariables() {
        this.tabGeneral = {
            name: 'general',
            className: '',
            title: 'כללי',
            display: false
        };

        this.tabInfo = {
            name: 'info',
            className: '',
            title: 'מידע אישי',
            display: false
        };

        this.tabSupportElections = {
            name: 'supportElections',
            className: '',
            title: 'תמיכה ובחירות',
            display: false
        };

        this.tabParty = {
            name: 'party',
            className: '',
            title: 'מפלגתי',
            display: false
        };

        this.tabRequests = {
            name: 'requests',
            className: '',
            title: 'פניות',
            display: false
        };

        this.tabActions = {
            name: 'actions',
            className: '',
            title: 'פעולות',
            display: false
        };

        this.tabPolls = {
            name: 'polls',
            className: '',
            title: 'סקרים',
            display: false
        };

        this.tabPaternalHome = {
            name: 'paternal',
            className: '',
            title: 'בית אב',
            display: false
        };

        this.tabDocuments = {
            name: 'documents',
            className: '',
            title: 'מסמכים',
            display: false
        };

        this.tabMessages = {
            name: 'messages',
            className: '',
            title: 'הודעות',
            display: false
        };

        this.numberOfRequestsText = '';
        if (this.props.voterRequests.length > 0) {
            this.numberOfRequestsText = this.props.voterRequests.length;
        }

        this.numberOfActionsText = '';
        if (this.props.voterActions.length > 0) {
            this.numberOfActionsText = this.props.voterActions.length;
        }

        this.numberOfDocumentsText = '';
        if (this.props.documents.length > 0) {
            this.numberOfDocumentsText = this.props.documents.length;
        }

        this.numberOfMessagesText = '';
        if (this.props.messagesList.length > 0) {
            this.numberOfMessagesText = this.props.messagesList.length;
        }

        this.numberOfActionsText = '';
        if (this.props.voterActions.length > 0) {
            this.numberOfActionsText = this.props.voterActions.length;
        }

        this.generalTabStyle = {
            display: 'none'
        };

        this.infoTabStyle = {
            display: 'none'
        };

        this.supportTabStyle = {
            display: 'none'
        };

        this.partyTabStyle = {
            display: 'none'
        };

        this.requestsTabStyle = {
            display: 'none'
        };

        this.actionsTabStyle = {
            display: 'none'
        };

        this.pollsTabStyle = {
            display: 'none'
        };

        this.householdTabStyle = {
            display: 'none'
        };

        this.documentsTabStyle = {
            display: 'none'
        };

        this.messagesTabStyle = {
            display: 'none'
        };

        this.blockStyle = {
            display: 'none'
        };
    }

    checkPermissions() {
        if (this.props.currentUser.admin) {
            this.generalTabStyle = {};
            this.infoTabStyle = {};
            this.supportTabStyle = {};
            this.partyTabStyle = {};
            this.requestsTabStyle = {};
            this.actionsTabStyle = {};
            this.pollsTabStyle = {};
            this.householdTabStyle = {};
            this.documentsTabStyle = {};
            this.messagesTabStyle = {};

            this.blockStyle = {};

            return;
        }

        if (this.props.currentUser.permissions['elections.voter'] == true) {
            this.blockStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.general'] == true) {
            this.generalTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.additional_data'] == true) {
            this.infoTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections'] == true) {
            this.supportTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.political_party'] == true) {
            this.partyTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.requests'] == true) {
            this.requestsTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.actions'] == true) {
            this.actionsTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.polls'] == true) {
            this.pollsTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.household'] == true) {
            this.householdTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.documents'] == true) {
            this.documentsTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.messages'] == true) {
            this.messagesTabStyle = {};
        }
    }

    personalIdentityChange(e) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SEARCH_PERSONAL_IDENTITY_CHANGE,
            personalIdentity: e.target.value});
    }

    handleKeyPress(event) {
        if (this.props.personalIdentitySearchParam.length == 0) {
            return;
        }

        if (!this.validInputs) {
            return;
        }

        if (13 == event.charCode) { /*if user pressed enter*/
            VoterActions.getVoterBySearchIdentity(this.props.dispatch, this.props.router,
                                                  this.props.personalIdentitySearchParam);
        }
    }

    redirectToVoterSearch() {
        var personalIdentityObj = {personal_identity: this.props.personalIdentitySearchParam};

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS,
            searchForParams: personalIdentityObj});

        this.props.router.push('elections/voters/search');
    }

    ConfirmUserErrorModal() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ERROR_LOADING_VOTER_MODAL_HIDE});
    }

    renderExistingVoter() {

        this.initVariables();

        this.checkPermissions();

        this.setActiveTabComponent();

        return (
            <div>
                <VoterMainBlock/>

                <section style={this.blockStyle}>
                    <ul className="tabs">
                        <li className={this.tabGeneral.className}
                            style={this.generalTabStyle}
                            onClick={this.tabClick.bind(this, this.tabGeneral.name)}>
                            {this.tabGeneral.title}
                        </li>

                        <li className={this.tabInfo.className}
                            style={this.infoTabStyle}
                            onClick={this.tabClick.bind(this, this.tabInfo.name)}>
                            {this.tabInfo.title}
                        </li>

                        <li className={this.tabSupportElections.className}
                            style={this.supportTabStyle}
                            onClick={this.tabClick.bind(this, this.tabSupportElections.name)}>
                            {this.tabSupportElections.title}
                        </li>

                        <li className={this.tabParty.className}
                            style={this.partyTabStyle}
                            onClick={this.tabClick.bind(this, this.tabParty.name)}>
                            {this.tabParty.title}
                        </li>

                        <li className={this.tabRequests.className}
                            style={this.requestsTabStyle}
                            onClick={this.tabClick.bind(this, this.tabRequests.name)}>
                            {this.tabRequests.title} <span className="badge">{this.numberOfRequestsText}</span>
                        </li>

                        <li className={this.tabActions.className}
                            style={this.actionsTabStyle}
                            onClick={this.tabClick.bind(this, this.tabActions.name)}>
                            {this.tabActions.title} <span className="badge">{this.numberOfActionsText}</span>
                        </li>

                        <li className={this.tabPolls.className} 
							style={this.pollsTabStyle}
							onClick={this.tabClick.bind(this,this.tabPolls.name)}
						>
                            {this.tabPolls.title}
                        </li>

                        <li className={this.tabPaternalHome.className}
                            style={this.householdTabStyle}
                            onClick={this.tabClick.bind(this, this.tabPaternalHome.name)}>
                            {this.tabPaternalHome.title}
                        </li>

                        <li className={this.tabDocuments.className}
                            style={this.documentsTabStyle}
                            onClick={this.tabClick.bind(this, this.tabDocuments.name)}>
                            {this.tabDocuments.title} <span className="badge">{this.numberOfDocumentsText}</span>
                        </li>

                        <li className={this.tabMessages.className}
                            style={this.messagesTabStyle}
                            onClick={this.tabClick.bind(this, this.tabMessages.name)}>
                            {this.tabMessages.title} <span className="badge">{this.numberOfMessagesText}</span>
                        </li>
                    </ul>

                    <VoterGeneal display={this.tabGeneral.display}
                                 numOfRequests={this.props.voterRequests.length}
                                 numOfDocuments={this.props.documents.length}
                                 numOfMessages={this.props.messagesList.length}
                                 numOfActions ={this.props.voterActions.length}

                                 currentUser={this.props.currentUser}
                    />
                    <VoterInfo display={this.tabInfo.display}/>
                    <VoterSupportElections display={this.tabSupportElections.display}/>
                    <VoterParty display={this.tabParty.display}
                                representativesList={this.props.representativeList}
                                oldRepresentativesList={this.props.oldRepresentativesList}/>
                    <VoterRequests display={this.tabRequests.display}/>
                    <VoterActionsComponent display={this.tabActions.display}/>
					{this.tabPolls.display && <VoterTmPolls display={this.tabPolls.display} currentUser={this.props.currentUser}/>}
                    <VoterPaternalHome display={this.tabPaternalHome.display}/>
                    <Documents display={this.tabDocuments.display}
                               entity_key={this.props.router.params.voterKey}
                               entity_type={0}
                               documents={this.props.documents}/>
                    <Messages display={this.tabMessages.display} />
                </section>
            </div>
        );
    }

    validatePersonalIdentity() {
        var regPersonalIdentity = /^[0-9]{2,10}$/;
        this.validInputs = true;

        if (regPersonalIdentity.test(this.props.personalIdentitySearchParam)) {
            this.searchInputStyle = {};
        } else {
            this.validInputs = false;
            this.searchInputStyle = {
                borderColor: '#cc0000'
            };
        }
    }

    renderSearchVoter() {
        var modalTitle = "שגיאה בטעינת תושב";

        this.validatePersonalIdentity();

        return (
            <section className="main-section-block dtlsBox">
                <div className="col-md-2" style={{fontSize: "20px"}}>איתור תושב:</div>
                <div className="col-md-2">
                    <input type="text" className="form-control" style={this.searchInputStyle}
                           onChange={this.personalIdentityChange.bind(this)}
                           onKeyPress={this.handleKeyPress.bind(this)}
                           value={this.props.personalIdentitySearchParam}
                    />
                </div>
                <div className="col-md-2">
                    <button type="button" className="btn btn-primary btn-sm"
                            onClick={this.redirectToVoterSearch.bind(this)} style={this.searchInputStyle}>
                        {this.searchButtonText}
                    </button>
                </div>

                <ModalWindow show={this.props.showMissingVoterModal}
                             buttonOk={this.ConfirmUserErrorModal.bind(this)}
                             title={modalTitle} style={{zIndex: '9001'}}>
                    <div>{this.props.missingVoterModalContent}</div>
                </ModalWindow>
            </section>
        );
    }

    render() {
        var voterKey = this.props.router.params.voterKey;

        if (voterKey != undefined) {
            return this.renderExistingVoter();
        } else {
            return this.renderSearchVoter();
        }
    }
}


function mapStateToProps(state) {
    return {
        voterDetails: state.voters.voterDetails,
        oldVoterDetails: state.voters.oldVoterDetails,
        voterScreen: state.voters.voterScreen,
        savingVoterData: state.voters.voterScreen.savingVoterData,
        selectedVoter: state.voters.searchVoterScreen.selectedVoter,
        supportStatuses: state.voters.searchVoterScreen.supportStatuses,
        currentVoterSupportData: state.voters.searchVoterScreen.currentVoterSupportData,
        loadedVoter: state.voters.voterScreen.loadedVoter,
        loadingVoter: state.voters.voterScreen.loadingVoter,
        representativeList: state.voters.voterScreen.representatives,
        oldRepresentativesList: state.voters.voterScreen.oldRepresentatives,
        showModalWindow: state.voters.showModalWindow,
        modalHeaderText: state.voters.modalHeaderText,
        modalContentText: state.voters.modalContentText,
        voterGroups: state.voters.voterScreen.voterGroups,
        lastCampaignId: state.voters.voterScreen.lastCampaignId,
        voterTab: state.voters.voterScreen.voterTab,
        voterRequests: state.voters.voterScreen.requests,
        voterActions: state.voters.voterScreen.actions,
        documents: state.global.documents.documents,
        metaDataKeys: state.voters.voterScreen.metaDataKeys,
        metaDataValues: state.voters.voterScreen.metaDataValues,
        messagesList: state.global.messages_screen.messagesList,
        showMissingVoterModal: state.voters.voterScreen.showMissingVoterModal,
        missingVoterModalContent: state.voters.voterScreen.missingVoterModalContent,
        personalIdentitySearchParam: state.voters.voterScreen.personalIdentitySearchParam,
        displayDialWindow: state.voters.voterScreen.displayDialWindow,
        currentUser: state.system.currentUser
    }
}

export default globalSaving(connect(mapStateToProps)(withRouter(Voter)));