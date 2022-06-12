import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';

import store from 'store';

import constants from 'libs/constants';
import { arraySort, isMobilePhone } from 'libs/globalFunctions';

import ActivistsSearchFields from './ActivistsSearchFields';
import ActivistsSearchResults from './ActivistsSearchResults';
import ModalAddAllocation from './ModalAddAllocation/ModalAddAllocation';
import ModalAddAssignment from './ModalAddAllocation/ModalAddAssignment';
// import ModalAddNotification from './ModalAddNotification';
import ModalUpdateAllocationError from './ModalUpdateAllocationError';

import * as SystemActions from 'actions/SystemActions';
import * as ElectionsActions from '../../../actions/ElectionsActions';

class Activists extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSearchStarted: false,
            showAddAssignmentDetails: false,
            userFilteredCitiesHash:{},
            addNotificationModal: {
                show: false,

                electionRoleKey: null,
                allocationObj: {}
            },
        };
        
        this.initConstants();
    }

    initConstants() {
        this.allId = -1;
        this.isFormValid = false;

        this.electionRoleSytemNames = constants.electionRoleSytemNames;

        this.exportBallotsText = 'קובץ שיבוץ קלפיות';
        this.exportClustersText = 'קובץ שיבוץ אשכולות';
        this.exportTotalPaymentLettersText = 'שכר פעילי עיר מרוכז';
        this.tashbetzText = 'קובץ תשבץ';
    }

    componentWillMount() {
  
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'רשימת פעילים' });
		
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.CLEAN_SCREEN });
        this.props.dispatch({ type: SystemActions.ActionTypes.CLEAN_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS });
       
        ElectionsActions.loadElectionCampaigns(this.props.dispatch,true);
        SystemActions.loadUserGeographicFilteredLists(store, 'elections.activists');
        ElectionsActions.loadElectionRoles(this.props.dispatch);
        ElectionsActions.loadElectionRolesShifts(this.props.dispatch);

        if (this.props.currentUser.first_name.length > 0) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists'] != true) {
                this.props.router.push('/unauthorized');
            }

            this.props.dispatch({
                type: ElectionsActions.ActionTypes.ACTIVIST.LOAD_CURRENT_USER_GEOGRAPHIC_FILTERS,
                geographicFilters: this.props.currentUser.geographicFilters
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if(!this.props.currentCampaign.key && nextProps.currentCampaign.key){
            ElectionsActions.loadElectionRolesCampaignBudget(this.props.dispatch,nextProps.currentCampaign.key);
        }
        if (0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['elections.activists'] != true) {
                this.props.router.push('/unauthorized');
            }

            this.props.dispatch({
                type: ElectionsActions.ActionTypes.ACTIVIST.LOAD_CURRENT_USER_GEOGRAPHIC_FILTERS,
                geographicFilters: nextProps.currentUser.geographicFilters
            });
        }

        if ( !this.props.addedAllocationFlag && nextProps.addedAllocationFlag ) {
            this.hideAddAllocationModal();
        }
        if (this.props.userFilteredCities.length == 0 && nextProps.userFilteredCities.length > 0) {
            this.makeUserFilteredCitiesHash(nextProps.userFilteredCities);
        }
    }
    makeUserFilteredCitiesHash(userFilteredCities){
        let userFilteredCitiesHash = {};
        userFilteredCities.forEach(function (city) {
            userFilteredCitiesHash[city.id] = city;
        });
        this.setState({ userFilteredCitiesHash });
    }
    /**
     * This function checks if the current
     * user can edit a specific role.
     *
     * @param electionRoleSystemName
     * @returns {boolean}
     */
    checkEditAllocationPermission(electionRoleSystemName) {
        let hasEditBankDetailsPermissions = this.props.currentUser.permissions['elections.activists.bank_details'];
        if (this.props.currentUser.admin || hasEditBankDetailsPermissions) {
            return true;
        }

        let editPermission = 'elections.activists.' + electionRoleSystemName + '.edit';

        return (this.props.currentUser.permissions[editPermission] == true);
    }

    checkAddAllocationPermissions() {
        let hasEditBankDetailsPermissions = this.props.currentUser.permissions['elections.activists.bank_details'];

        if (this.props.currentUser.admin || hasEditBankDetailsPermissions) {
            return true;
        }

        for (let roleSystemNameKey in this.electionRoleSytemNames) {
            let addPermission = 'elections.activists.' + this.electionRoleSytemNames[roleSystemNameKey] + '.add';

            if (this.props.currentUser.permissions[addPermission] == true) {
                return true;
            }
        }

        return false;
    }

    redirectToEditActivistPage(activistKey, roleId) {
        let electionRoleIndex = this.props.electionRoles.findIndex(item => item.id == roleId);

        if ( electionRoleIndex > -1 ) {
            this.props.router.push('elections/activists/' + activistKey + '/' + this.props.electionRoles[electionRoleIndex].key);
        } else {
            this.props.router.push('elections/activists/' + activistKey);
        }
    }

    showAddAssignmentModal(activistIndex) {
        let voterDetails={...this.props.activistsSearchResult[activistIndex]};
        let voterPhones=voterDetails.voter_phones;
        if(voterPhones){
                    //filter only mobile phone number
        voterPhones=voterPhones.filter(phone=>{
            phone.phone_number = phone.phone_number.split('-').join('');
            return isMobilePhone(phone.phone_number );
          })
          voterDetails.voter_phones = voterPhones;
        }

        this.setState({showAddAssignmentDetails:voterDetails});
    }


    showAddNotificationModalFromBind(electionRoleKey, allocationObj, continueAllocation = false){
        this.showAddNotificationModal(electionRoleKey, allocationObj, continueAllocation, true );
    }


 
    buildSearchObj() {
        let searchFields = [
            'areaId',
            'subAreaId',
            'cityId',
            'street',
            'personal_identity',
            'first_name',
            'last_name',
            'phone_number',
            'electionCampaignId',
            'assignmentStatus',
            'verifyStatus',
            'verifyBankStatus',
            'electionRoleId',
            'assigned_city_id',
            'activistLocked'
        ];

        let searchObj = {};
        for (let searchIndex = 0; searchIndex < searchFields.length; searchIndex++) {
            let fieldName = searchFields[searchIndex];
            switch (fieldName) {
                
                case 'personal_identity':
                case 'first_name':
                case 'last_name':
                case 'phone_number':
                    searchObj[fieldName] = this.props.searchFields[fieldName].length == 0 ? null : this.props.searchFields[fieldName];
                    break;
                case 'street':
                    if (this.props.searchFields.street.id != null) {
                        searchObj.street_id = this.props.searchFields.street.id;
                        searchObj.street_name = this.props.searchFields.street.name;
                    }
                    break;
                case 'electionCampaignId':
                    searchObj.electionCampaignId =this.props.searchFields.electionCampaignId;
                    break;

                case 'assignmentStatus':
                    searchObj.assignment_status = this.props.searchFields[fieldName] == this.allId ? null : this.props.searchFields[fieldName];
                    break;
                case 'verifyStatus':
                    searchObj.verify_status = this.props.searchFields[fieldName] == this.allId ? null : this.props.searchFields[fieldName];
                    break;
                case 'activistLocked':
                    searchObj.activistLocked = this.props.searchFields.activistLocked ;
                    break;
                case 'verifyBankStatus':
                    searchObj.verify_bank_status = this.props.searchFields[fieldName] ;
                    break;
                case 'electionRoleId':
                    searchObj.election_role_id = this.props.searchFields.electionRoleId;
                    break;
                case 'cityId':
                    searchObj.city_id = this.props.searchFields.cityId;
                    break;
                case 'areaId':
                    searchObj.assigned_area_id = this.props.searchFields.areaId;
                    break;
                case 'subAreaId': 
                    searchObj.assigned_subarea_id = this.props.searchFields.subAreaId;
                    break;
                default:
                    searchObj[fieldName] = this.props.searchFields[fieldName];
                    break;
            }
        }

        return searchObj;
    }

    searchElectionsActivists() {
        let searchObj = this.buildSearchObj();
        this.setState({ isSearchStarted: true });
        ElectionsActions.searchElectionsActivists(this.props.dispatch, searchObj);
    }

    getCampaignName() {
        if (this.props.currentCampaign.name != undefined) {
            return this.props.currentCampaign.name;
        } else {
            return '\u00A0';
        }
    }
    updateValidForm(isFormValid) {
        this.isFormValid = isFormValid;
    }

    successAddAssignment(){
        let searchObj=this.buildSearchObj();
        ElectionsActions.searchElectionsActivists(this.props.dispatch, searchObj);
        this.setState({showAddAssignmentDetails:null})
    }

    /**
     * Init render variables
     *
     * @return void
     */
    initVariables() {
        this.exportActivistsBallotLink = "elections/activist/export";
        this.exportActivistsClusterLink = "elections/activist/clusters/export";
        this.exportActivistsTotalPaymentLink = "";
        let assigned_city_key = this.props.searchFields.assigned_city_key;
        this.exportActivistsTotalPaymentStyle={opacity: '0.5'};

        if (assigned_city_key) {
            this.exportActivistsBallotLink += "?city_key=" + assigned_city_key;
            this.exportActivistsClusterLink += "?city_key=" + assigned_city_key;
            this.exportActivistsTotalPaymentLink = "api/elections/activists/city/" + assigned_city_key + "/export/total-payment?electionCampaignId="+this.props.searchFields.electionCampaignId;
            this.exportActivistsTotalPaymentStyle={};
        }
    }

    render() {
        this.initVariables();
        let hasExportActivistsTotalPaymentPermissions = this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.export.total_payment_letter'] == true;
        let hasExportActivistsAllDetailsPermissions = this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.export.all_details'] == true;

        return (
            <div className="stripMain election-activist-edit">
                <div className="container">
                    <div className="row pageHeading1">
                        <div className="col-md-8">
                            <h1>רשימת פעילים <span className="titleSlim">{/*this.getCampaignName()*/}</span></h1>
                        </div>
                        {hasExportActivistsAllDetailsPermissions &&
                            <div className={this.props.currentUser.admin?"col-md-10 pull-left" : "col-md-6 pull-left"}>
                                { hasExportActivistsTotalPaymentPermissions &&<div className={this.props.currentUser.admin?"col-md-2":"col-md-3"} style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                        {this.exportTotalPaymentLettersText}
                                </div> }
                                { hasExportActivistsTotalPaymentPermissions && <div className="col-md-1" style={{ padding: '0' }}>
                                    {<Link title="יצוא טפסי שכר פעילי עיר" to={this.exportActivistsTotalPaymentLink} className="icon-box print" target="_blank" style={this.exportActivistsTotalPaymentStyle}/>}
                                </div> }
								{this.props.currentUser.admin && <div className="col-md-2" style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                    {this.tashbetzText}
								</div> }
                                {this.props.currentUser.admin && <div className="col-md-1" style={{ padding: '0' }}>
                                    {<Link title="קובץ תשבץ" to="api/elections/activists/tashbetz" className="icon-box excel" target="_blank" />}
                                </div>}
								<div className={this.props.currentUser.admin?"col-md-2":"col-md-3"} style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                    {this.exportBallotsText}
                                </div>
                                <div className="col-md-1" style={{ padding: '0' }}>
                                    {<Link title="קובץ שיבוץ קלפיות" to={this.exportActivistsBallotLink} className="icon-box excel" target="_blank" />}
                                </div>
                                <div className={this.props.currentUser.admin?"col-md-2":"col-md-3"} style={{ textAlign: 'left', paddingLeft: '12px', paddingTop: '5px' }}>
                                    {this.exportClustersText}
                                </div>
                                <div className="col-md-1" style={{ padding: '0' }}>
                                    {<Link title="קובץ שיבוץ אשכולות" to={this.exportActivistsClusterLink} className="icon-box excel" target="_blank" />}
                                </div>

                            </div>
                        }
                    </div>

                    <div className="dtlsBox srchPanel clearfix">
                        <ActivistsSearchFields 
                            searchElectionsActivists={this.searchElectionsActivists.bind(this)} 
                            updateValidForm={this.updateValidForm.bind(this)} />
                    </div>

                    <ActivistsSearchResults activistsSearchResult={this.props.activistsSearchResult}
                        userFilteredCitiesHash={this.state.userFilteredCitiesHash}
                        totalSearchResults={this.props.totalSearchResults}
						electionRoles={this.props.electionRoles}
                        buildSearchObj={this.buildSearchObj.bind(this)}
                        redirectToEditActivistPage={this.redirectToEditActivistPage.bind(this)}
                        checkAddAllocationPermissions={this.checkAddAllocationPermissions.bind(this)}
                        checkEditAllocationPermission={this.checkEditAllocationPermission.bind(this)}
                        isLoadingResults={this.props.isLoadingResults}
                        isSearchStarted={this.state.isSearchStarted}
                        searchElectionCampaignId={this.props.searchFields.electionCampaignId}
                        showAddAllocationModal={this.showAddAssignmentModal.bind(this)}
                        currentUser={this.props.currentUser}
                        isFormValid={this.isFormValid}
                        />

                    {/* <ModalAddAllocation activistItem={this.state.addAllocationActivistItem}
                        allocationCitiesList={this.props.userFilteredCities}
                        phones={this.state.addAllocationPhones}
                        hideAddAllocationModal={this.hideAddAllocationModal.bind(this)}
                        addAllocation={this.showAddNotificationModal.bind(this)} 
                    /> */}
                    {
                        this.state.showAddAssignmentDetails?
                        <ModalAddAssignment 
                        hideModel={()=>{this.setState({showAddAssignmentDetails:false});}}
                        show={this.state.showAddAssignmentDetails} 
                        voterDetails={this.state.showAddAssignmentDetails} 
                        successAddAssignmentAndOpenActivistPage={true}
                        successAddAssignment={()=>{this.successAddAssignment()}} 
                         >
                        </ModalAddAssignment>:''
                    }

                    <ModalUpdateAllocationError/>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        currentCampaign: state.system.currentCampaign,
        searchFields: state.elections.activistsScreen.searchFields,
        activistsSearchResult: state.elections.activistsScreen.activistsSearchResult,
        totalSearchResults: state.elections.activistsScreen.totalSearchResults,
        addAllocationModal: state.elections.activistsScreen.addAllocationModal,
        isLoadingResults: state.elections.activistsScreen.isLoadingResults,
        electionRoles: state.elections.activistsScreen.electionRoles,
        addedAllocationFlag: state.elections.activistsScreen.addedAllocationFlag,
		userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities, //For add allocation modal.
    };
}

export default connect(mapStateToProps)(withRouter(Activists));