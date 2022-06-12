import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalWindow from '../../global/ModalWindow';
import store from '../../../store';

import RequestInput from './RequestInput';
import RequestDetails from './RequestDetails';
import VoterMainBlock from '../../voter/VoterMainBlock';
import TempVoterMainBlock from './TempVoterMainBlock';
import StaticTempVoterMainBlock from './StaticTempVoterMainBlock';
import constants from '../../../libs/constants';
import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';
import globalSaving from '../../hoc/globalSaving';

class Request extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
		this.state={updatedSavedRequest:{}}
    }
    
	setUpdatedSavedRequest(value){
	 
		let updatedSavedRequest = {};
		 
		updatedSavedRequest["topic_name"] = value["topic_name"];
		updatedSavedRequest["sub_topic_name"] = value["sub_topic_name"];
		updatedSavedRequest["status_name"] = value["status_name"];
		updatedSavedRequest["request_source_name"] = value["request_source_name"];
		updatedSavedRequest["request_source_fax"] = value["request_source_fax"];
		updatedSavedRequest["request_source_email"] = value["request_source_email"];
		updatedSavedRequest["request_source_phone"] = value["request_source_phone"];
		updatedSavedRequest["request_source_first_name"] = value["request_source_first_name"];
		updatedSavedRequest["request_source_last_name"] = value["request_source_last_name"];
		updatedSavedRequest["priority_name"] = value["priority_name"];
		updatedSavedRequest["target_close_date"] = value["target_close_date"];
		updatedSavedRequest["date"] = value["date"];
		updatedSavedRequest["first_desc"] = value["first_desc"];
 
		updatedSavedRequest["status_type_id"] = value["status_type_id"];
		this.setState({updatedSavedRequest})
	}
	
    componentWillUpdate() {
        this.parseRouteParams();
        const currentUrl = this.props.router.location.pathname.replace(/\/+$/, '');

        if (currentUrl == '/crm/requests') {
            if (this.cnt == undefined) {
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA});
                this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLEAN_DATA});
                this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLEAN_TEMP_VOTER_DATA});
                this.cnt = '1';
            }
        }

        if (['/crm/requests/new', '/crm/requests', '/crm/requests/new/unknown'].indexOf(currentUrl) > -1 || !this.props.router.params.reqKey) {
            this.props.dispatch({type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'יצירת פניה'});
        }
    }
    
    componentWillMount() {
        this.parseRouteParams();
        CrmActions.loadRoles(this.props.dispatch);
        SystemActions.loadMinimalUsersForTeam(this.props.dispatch);
        GlobalActions.getDocumentsTypes(this.props.dispatch);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA});
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLEAN_DATA});
        this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.CLEAN_TEMP_VOTER_DATA});
        VoterActions.initVoterPhones(this.props.dispatch, this.props.voterDetails);

        // Change fields personal_identity readOnly to false in component VoterDetails
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE,
            readOnlyField: 'personal_identity',
            readOnlyValue: false
        });

        // Change fields last_name readOnly to false in component VoterDetails
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE,
            readOnlyField: 'last_name',
            readOnlyValue: false
        });

        // Change fields first_name readOnly to false in component VoterDetails
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE,
            readOnlyField: 'first_name',
            readOnlyValue: false
        });

        if (this.props.router.location.pathname == '/crm/requests/new/unknown') {

        } else if (undefined == this.props.router.params.reqKey || 'new' == this.props.router.params.reqKey) {
        } else {
            if (this.props.dataRequest.reqKey != this.props.router.params.reqKey) {
                this.loadRequest();
            }
        }
    }

    componentDidMount() {
        SystemActions.loadMinimalTeams(this.props.dispatch, this.props.router, null, 1);
        window.scrollTo(0, 0);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.loadedVoter && nextProps.loadedVoter) {
            SystemActions.addLastViewedVoters(this.props.dispatch, this.props.voterDetails.key);
        }

        if (nextProps.params.reqKey != this.props.params.reqKey) {
            this.loadRequest();
        }
    }

    parseRouteParams(){
        if(this.props.voterDetails.key != ''){
            return;
        }

        var searchStr=(this.props.location.search).trim().replace(/^[?#&]/, '');
        var RouteParams={};

        if(searchStr.length>0){
            searchStr.split('&').forEach(function (param) {
                var parts = param.replace(/\+/g, ' ').split('=');
                var key = parts.shift();
                var val = parts.length > 0 ? parts.join('=') : null;

                RouteParams[key]= val;
            });
        }

        if(RouteParams['voter_key']){//?voter_key=bkzpqqe26m
            VoterActions.getVoterByKey(this.props.dispatch, RouteParams['voter_key'], false, false, this.props.router);
        }

        if(RouteParams['temp_voter_id']){//?temp_voter_id=146
            VoterActions.getTempVoterByID(this.props.dispatch, RouteParams['temp_voter_id']);
        }
    }

    loadRequest() {
        if (this.props.router.params.reqKey && this.props.router.params.reqKey != 'new' && this.props.router.params.reqKey != '') {
            CrmActions.getRequestByKey(this.props.dispatch, this.props.router, this.props.router.params.reqKey , this.setUpdatedSavedRequest.bind(this));
            CrmActions.getRequestActionByRequestKey(this.props.dispatch, this.props.router.params.reqKey);
            CrmActions.getRequestHistoryByRequestKey(this.props.dispatch, this.props.router.params.reqKey);
            CrmActions.getRequestCallBizByRequestKey(this.props.dispatch, this.props.router.params.reqKey);
            GlobalActions.getEntityDocuments(this.props.dispatch, 1, this.props.router.params.reqKey);
            GlobalActions.getEntityMessages(this.props.dispatch, this.props.router, 1, this.props.router.params.reqKey);
        }
    }

    textIgniter() {
        this.screenTitle = 'פניה';
    }

    searchVoterForRequest(e) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT});
        var returnUrl = 'crm/requests/new';

        var data = {
            returnUrl: returnUrl,
            returnButtonText: 'חזור למסך פניות'
        };

        // This dispatch changes the parameters in data object
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH, data: data});
        this.props.router.push('elections/voters/search');
    }

    makeSearchUserAction() {
        let correctId = this.props.personalIdentity;
        while (correctId.charAt(0) === '0') {
            correctId = correctId.slice(1);
        }
        if (correctId >= 2 && correctId != '') {
            VoterActions.getVoterByKey(this.props.dispatch, correctId, false, false, this.props.router, 'crm/requests/new');
        } else {
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.OPEN_MISSING_REQUEST_DETAILS, header: 'שגיאה', content: 'ת"ז לא חוקית'});
        }
    }

    handleKeyPress(event) {
        if (13 == event.charCode) { /*if user pressed enter*/
            this.makeSearchUserAction();
        }
    }

    changeIdentityNumber(e) {
        if (/^\d*$/.test(e.target.value)) {
            this.props.dispatch({type: CrmActions.ActionTypes.REQUEST.PERSONAL_ID_CHANGE,
                data: e.target.value
            });
        }
    }

    /*general function that closes all types of dialogues */
    closeModalDialog() {
        this.props.dispatch({
            type: CrmActions.ActionTypes.REQUEST.CLOSE_MODAL_DIALOG
        });
    }

    editPermissionsInit(){

        var request_status_type_closed = constants.request_status_type_closed;        
        var request_status_type_canceled = constants.request_status_type_canceled;
        this.statusNotForEdit = true;
        this.userHasEditRequestPermissions = false;
        this.hasRequestEditingPermissions = false;
        this.hasAdminEdit = false;
        
        if (this.props.dataRequest.status_type_id == request_status_type_closed ||
            this.props.dataRequest.status_type_id == request_status_type_canceled){
            this.statusNotForEdit = true;
        } else{
            this.statusNotForEdit = false; 
        }

        /*if (this.props.router.params.reqKey != 'new'){
            if (this.props.dataRequest.reqKey != '' && this.props.dataRequest.reqKey != undefined){
                if (this.props.currentUser.admin == true ||
                    this.props.dataRequest.team_leader_id == this.props.currentUser.id ||
                    this.props.dataRequest.user_handler_id == this.props.currentUser.id ){
                    this.userHasEditRequestPermissions = true;
                }else { 
                    this.userHasEditRequestPermissions = false;
                }
            } else{ 
                this.userHasEditRequestPermissions = true;
            }           
        } else{
            this.userHasEditRequestPermissions = true;
        }

        if ( this.statusNotForEdit == false && this.userHasEditRequestPermissions == true){
            this.hasRequestEditingPermissions = true;
        } else{
            this.hasRequestEditingPermissions = false;
        }

        if (!this.hasRequestEditingPermissions){
            this.noPermissionMessage = 'אין למשתמש הרשאה לעריכת הפניה';
        } else {
            this.noPermissionMessage = '';
        }

        if (this.props.currentUser.permissions['crm.requests.admin_edit'] || this.props.currentUser.admin == true){
            this.hasAdminEdit = true;
        } else{
            this.hasAdminEdit = false;
        }*/

        if (this.props.currentUser.admin == true ||
            this.props.dataRequest.team_leader_id == this.props.currentUser.id ||
            this.props.dataRequest.user_handler_id == this.props.currentUser.id ||
            this.props.currentUser.permissions['crm.requests.admin_edit'] == true ){
            this.hasAdminEdit = true;
        } else {
            this.hasAdminEdit = false;
        }

        if (this.props.router.params.reqKey != 'new') {
            if ( this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.edit'] == true ) {
                this.hasRequestEditingPermissions = true;
            } else {
                this.hasRequestEditingPermissions = false;
            }
        } else {
            if ( this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.add'] == true ) {
                this.hasRequestEditingPermissions = true;
            } else {
                this.hasRequestEditingPermissions = false;
            }
        }
    }

    render() {
 
        this.editPermissionsInit();
        let firstSection = '';
        let secondSection = '';
        let thirdSection = '';
        if (this.props.router.location.pathname == '/crm/requests/new/unknown' || this.props.router.location.pathname == 'crm/requests/new/unknown')
        {
            firstSection = <TempVoterMainBlock />;
        } else {

            if (this.props.router.params.reqKey != undefined && this.props.router.params.reqKey != 'new') {
                thirdSection = <section className="section-block" style={{minHeight: '500px'}}>
                                   <RequestDetails hasRequestEditingPermissions={this.hasRequestEditingPermissions}
                                                   statusNotForEdit={this.statusNotForEdit}
                                                   hasAdminEdit={this.hasAdminEdit}
                                   />
                               </section>;
                }
                if ((this.props.router.params.reqKey != undefined && this.props.router.params.reqKey != 'new') || (this.props.router.params.reqKey == 'new' && (this.props.voterDetails.personal_identity != '' || this.props.selectedVoterForRedirect.personalIdentity != undefined || this.props.addUnknownVoterScreen.key != ''))) {

                    secondSection = <section className="section-block">
										<RequestInput updatedSavedRequest={this.state.updatedSavedRequest} setUpdatedSavedRequest={this.setUpdatedSavedRequest.bind(this)} hasRequestEditingPermissions = {this.hasRequestEditingPermissions}
                                                                                     hasAdminEdit = {this.hasAdminEdit}
                                                                                     statusNotForEdit = {this.statusNotForEdit}
                                         />
									</section>;
                }
                if ((this.props.router.params.reqKey != undefined && this.props.router.params.reqKey != 'new') || (this.props.router.params.reqKey == 'new' && (this.props.addUnknownVoterScreen.key == undefined || this.props.addUnknownVoterScreen.key == '') && (this.props.voterDetails.personal_identity != '' || this.props.selectedVoterForRedirect.personalIdentity != undefined))) {

                    //request that connect to voter or new-not connect to voter and not to temp voter
                    if ((this.props.dataRequest.voter_key  && this.props.dataRequest.voter_key!='') || 
                       (this.props.dataRequest.unknown_voter_data == undefined && !this.props.dataRequest.voter_key)
                    ) {
                        firstSection = <VoterMainBlock/>;
                    } else {
                        if (this.props.isEditingUnknownVoter) {
                            firstSection = <TempVoterMainBlock/>;
                        } else {
                            firstSection = <StaticTempVoterMainBlock/>;
                        }
                    }
                } else {
                    //if(this.props.router.params.reqKey == 'new' && ( this.props.voterDetails.personal_identity != '' || this.props.selectedVoterForRedirect.voters_key != undefined)){
                    //this.props.router.push('/crm/requests');
                    //}
                    let gotoVoterItem = '';
                    if (this.props.currentUser.admin || this.props.currentUser.permissions['crm.requests.goto_voter_card']) {
                        gotoVoterItem = <div className='row'><div className='col-md-5'  ><button type='submit' className="btn btn-primary btn-sm" onClick={this.makeSearchUserAction.bind(this)} >הצג תושב</button></div><div className='col-md-3'><button type='submit' className="btn btn-primary btn-sm" onClick={this.searchVoterForRequest.bind(this)} >איתור תושב</button> </div></div>;
                    }
                    if (this.props.addUnknownVoterScreen.key == undefined || this.props.addUnknownVoterScreen.key == '') {
                        firstSection = <div className='row' style={{paddingRight: '40px', paddingTop: '35px'}}>
                            <div className='col-md-1'>
                                ת"ז תושב : 
                            </div>
                            <div className='col-md-2'>
                                <input type="text" value={this.props.personalIdentity} onChange={this.changeIdentityNumber.bind(this)} className="form-control form-control-sm" onKeyPress={this.handleKeyPress.bind(this)}    />
                            </div>
                            <div className='col-md-2'>
                                {gotoVoterItem}
                            </div>
                        </div>;
                        } else {
                            if (this.props.isEditingUnknownVoter) {
                                firstSection = <TempVoterMainBlock/>;
                            } else {
                                firstSection = <StaticTempVoterMainBlock/>;
                            }
                        }
                    }
                }
                return <div>
					<h1>
					{(!this.props.router.params.reqKey || this.props.router.params.reqKey=="new") ? "יצירת פניה" : "פרטי פניה"}
					</h1>
                    <section className="main-section-block" style={{border: 'none'}}>
                        {firstSection}
                    </section>
                    {secondSection}
                    {thirdSection}
                    <br/>
                    <ModalWindow show={this.props.showModalDialog} buttonX={this.closeModalDialog.bind(this)} buttonOk={this.closeModalDialog.bind(this)} title={this.props.modalHeaderText} style={{zIndex: '9001'}}>
                        <div>{this.props.modalContentText}</div>
                    </ModalWindow>
                
                </div>;
                    }
                }

                function mapStateToProps(state) {
                    return {
                        dataRequest: state.crm.searchRequestsScreen.dataRequest,
                        voterDetails: state.voters.voterDetails,
                        selectedVoterForRedirect: state.voters.searchVoterScreen.selectedVoterForRedirect,
                        selectedVoter: state.voters.searchVoterScreen.selectedVoter,
                        personalIdentity: state.crm.searchRequestsScreen.personalIdentity,
                        currentUser: state.system.currentUser,
                        showModalDialog: state.crm.searchRequestsScreen.showModalDialog,
                        showCreateEmailDialog: state.crm.searchRequestsScreen.showCreateEmailDialog,
                        modalHeaderText: state.crm.searchRequestsScreen.modalHeaderText,
                        modalContentText: state.crm.searchRequestsScreen.modalContentText,
                        loadedVoter: state.voters.voterScreen.loadedVoter,
                        addUnknownVoterScreen: state.crm.addUnknownVoterScreen,
                        isEditingUnknownVoter: state.crm.isEditingUnknownVoter,
                        oldVoterDetails: state.voters.oldVoterDetails,
                        originalDataRequest: state.crm.searchRequestsScreen.originalDataRequest,
                    };
                }

                export default globalSaving(connect(mapStateToProps)(withRouter(Request)));
