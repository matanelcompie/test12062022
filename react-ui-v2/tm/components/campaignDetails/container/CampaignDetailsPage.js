import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'store';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import * as campaignActions from 'tm/actions/campaignActions';
import * as systemActions from 'tm/actions/systemActions';
import * as questionnaireActions from 'tm/actions/questionnaireActions';
import * as portionActions from 'tm/actions/portionActions';
import * as voterFilterActions from 'actions/VoterFilterActions';
import * as employeeActions from 'tm/actions/employeeActions';

import CampaignDetailsHeader from '../display/CampaignDetailsHeader';
import NavItem from '../display/NavItem';
import SideBar from '../display/SideBar';
import CampaignStatusModal from './CampaignStatusModal';

import GeneralTab from '../display/tabs/generalTab';
import TargetGroupTab from 'tm/components/targetGroup/container/TargetGroupTab';
import PortionsTab from 'tm/components/portionList/container/PortionListTab';
import QuestionnaireTab from 'tm/components/questionnaire/container/QuestionnaireTab';
import EmployeesTab from 'tm/components/employees/container/EmployeesTab';
import AdvancedSettingsTab from '../display/tabs/advancedSettingsTab';
import CtiSettingsTab from 'tm/components/ctiSettings/container/CtiSettingsTab';
import { validatePhoneNumber } from 'libs/globalFunctions';


class CampaignDetailsPage extends React.Component {
    constructor(props, context) {
        super(props, context);

        momentLocalizer(moment);

        this.state = {
            isEditing: false,
            campaignEdits: Object.assign({}, props.campaign),
        };
		 
        this.onSaveClick = this.onSaveClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onChangeField = this.onChangeField.bind(this);
        this.onOpenCampaignStatusModalClick = this.onOpenCampaignStatusModalClick.bind(this);
        this.campaignHadLoaded = false;
    }

    componentWillMount() {
        if (this.props.currentUser.first_name.length > 0) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['tm.campaign'] != true) {
                this.props.router.push('/unauthorized');
            } else {
                this.loadCampaignDetails();
                // this.campaignHadLoaded = this.props.campaign.name ? true :false;
                // this.updateBreadcrumbs(this.props.campaign);
            }
        }
    }

    loadCampaignDetails(nextPropsUser=null) {
	 
        let currentCampaignKey = this.props.params.key;
        let currentUser = (nextPropsUser ? nextPropsUser : this.props.currentUser);
        this.props.campaignActions.getCampaign(currentCampaignKey);
        this.props.campaignActions.setCurrentCampaignKey(currentCampaignKey);
        this.props.campaignActions.getCampaignStatistics(currentCampaignKey);

        if (currentUser.admin || currentUser.permissions['tm.campaign.cti_settings']) {
            this.props.systemActions.getCtiPermissionsList();
        }
        if (currentUser.admin || currentUser.permissions['tm.campaign.questionnaire']) {
            this.props.questionnaireActions.getCampaignQuestionnaireFull(currentCampaignKey);
        }
        if (currentUser.admin || currentUser.permissions['tm.campaign.portions']) {
            this.props.voterFilterActions.getVoterFilterDefinitions('portion');
            this.props.portionActions.getAllPortions(currentCampaignKey);
        }
        if (currentUser.admin || currentUser.permissions['tm.campaign.employees']) {
            this.props.employeeActions.getEmployeeList(currentCampaignKey, true);
        }
        //this.props.portionActions.getTargetGroup(currentCampaignKey);       
    }
	
	componentWillUnmount()
	{
		store.dispatch({type:campaignActions.types.UPDATE_CAMPAIGN_VALUE , name:'name' , value:''});
	}

    componentWillReceiveProps(nextProps) {
        if (this.props.params.key != nextProps.params.key) {
            this.props.campaignActions.getCampaign(nextProps.params.key)
            this.campaignHadLoaded = false;
        };
        let c1 = JSON.stringify(this.props.campaign);
        let c2 = JSON.stringify(nextProps.campaign);
        if (c1 !== c2) {
            let campaignEdits = Object.assign({}, nextProps.campaign);
            this.setState({ campaignEdits, isEditing: false });
        }
		//console.log(this.props.campaign);
        if(this.props.campaign.name != nextProps.campaign.name && !this.campaignHadLoaded){
		 
            this.campaignHadLoaded = true;
            this.updateBreadcrumbs(nextProps.campaign);
        }
		 
        if ((this.props.currentUser.first_name.length == 0) && (nextProps.currentUser.first_name.length > 0)) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['tm.campaign'] != true) {
                this.props.router.push('/unauthorized');
            } else {
                this.loadCampaignDetails(nextProps.currentUser);
            }
        }
    }
    updateBreadcrumbs(currentCampaign){
        if(!currentCampaign.name){return;}

        setTimeout(function(){
            store.dispatch({
                type: systemActions.types.ADD_BREADCRUMBS,
                newLocation: {
                    url: 'telemarketing/campaigns/' + currentCampaign.key,
                    title: ' קמפיין ' + currentCampaign.name,
                    elmentType: 'CampaignDetailsPage',
                }
            });
            let systemTitle = ' קמפיין ' + currentCampaign.name;
            store.dispatch({type: systemActions.types.SET_SYSTEM_TITLE, systemTitle: systemTitle});
        })
    }
    initVariables() {
		 
        this.tabs = [
            (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.general'] == true) && {
                key: 'general', label: 'כללי', permission: 'tm.campaign.general', content: <GeneralTab
                    campaignEdits={this.state.campaignEdits}
                    isEditing={this.state.isEditing}
                    onEditClick={this.onEditClick}
                    onSaveClick={this.onSaveClick}
                    onChangeField={this.onChangeField}
                    onCancelClick={this.onCancelClick}
                    isPending={this.props.isPending}
                    statistics={this.props.campaignStatistics}
                />
            },
            (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.questionnaire'] == true) && { key: 'questionnaire', label: 'שאלון', permission: 'tm.campaign.questionnaire', content: <QuestionnaireTab /> },
            /*{key: 'target_group', label: 'קבוצת יעד', content: <TargetGroupTab/>},*/
            (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.portions'] == true) && { key: 'portions', label: 'מנות', permission: 'tm.campaign.portions', content: <PortionsTab /> },
            (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.employees'] == true) && {
                key: 'employees', label: 'עובדים', permission: 'tm.campaign.employees', content: <EmployeesTab
                    teamId={this.props.campaign.team_id}
                    teamDepartmentId={this.props.campaign.team_department_id}
                    campaignKey={this.props.params.key}
                />
            },
            (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.advanced_settings'] == true) && {
                key: 'advanced_settings', label: 'הגדרות מתקדמות', permission: 'tm.campaign.advanced_settings', content: <AdvancedSettingsTab
                    campaignEdits={this.state.campaignEdits}
                    onChangeField={this.onChangeField}
                    onSaveClick={this.onSaveClick}
                    telephonyModeOptions={this.props.telephonyModeOptions}
                    dialerTypeOptions={this.props.dialerTypeOptions}
                    returnCallNoAnswerOptions={this.props.returnCallNoAnswerOptions}
                    actionCallNoAnswerOptions={this.props.actionCallNoAnswerOptions}
                    isPending={this.props.isPending}
                    allowEditing={(this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.advanced_settings.edit'] == true) }
                />
            },
            (this.props.currentUser.admin || this.props.currentUser.permissions['tm.campaign.cti_settings'] == true) && { key: 'cti_settings', label: 'הגדרות CTI', permission: 'tm.campaign.cti_settings', content: <CtiSettingsTab /> },
        ];
        let _this = this;
        this.tabs = this.tabs.filter(function (tab) {
            if ((_this.props.currentUser.admin) || (_this.props.currentUser.permissions[tab.permission])) return tab;
        })
    }

    onSaveClick(event, parameters) {
        event.preventDefault();
        this.props.campaignActions.updateCampaign(this.state.campaignEdits, parameters);
    }

    onEditClick() {
        this.setState({ isEditing: true });
    }

    onCancelClick() {
        let campaignEdits = Object.assign({}, this.props.campaign);
        this.setState({ isEditing: false, campaignEdits });
    }

    onChangeField(name, value) {
        let campaignEdits = Object.assign({}, this.state.campaignEdits);
        campaignEdits[name] = value;
        this.setState({ campaignEdits });
    }


    renderTab() {
        const activeTabKey = this.props.params.activeTab || 'general';
        const tab = _.find(this.tabs, { 'key': activeTabKey });
        if (tab) {
            return React.cloneElement(tab.content, {
                campaign: this.props.campaign
            });
        } else {
            return null;
        }
    }

    onOpenCampaignStatusModalClick() {
        this.props.campaignActions.onOpenCampaignStatusModalClick();
    }

    render() {
        this.initVariables();
        let activeTab = this.props.params.activeTab || 'general';

        return (
            <div>
                <CampaignDetailsHeader
                    campaignEdits={this.state.campaignEdits}
                    isEditing={this.state.isEditing}
                    onEditClick={this.onEditClick}
                    onSaveClick={this.onSaveClick}
                    onChangeField={this.onChangeField}
                    onCancelClick={this.onCancelClick}
                    campaignElectionTypeOptions={this.props.campaignElectionTypeOptions}
                    currentUser={this.props.currentUser}
                    isPending={this.props.isPending}
                    campaignStatusOptions={this.props.campaignStatusOptions}
                    campaignStatusConstOptions={this.props.campaignStatusConstOptions}
                    onOpenCampaignStatusModalClick={this.onOpenCampaignStatusModalClick}
                />
                <section className="campaign-details__tab-section">
                    <ul className="tabs">
                        {this.tabs.map(tab =>
                            <NavItem
                                key={tab.key}
                                tabKey={tab.key}
                                label={tab.label}
                                to={`telemarketing/campaigns/${this.props.params.key}/${tab.key}`}
                                isActive={tab.key == activeTab}
                                isValidTab={this.props.isValidTab[tab.key]}
                            >
                            </NavItem>
                        )}
                    </ul>
                    <div className="campaign-details__tab-content">
                        {this.renderTab()}
                    </div>
                </section>
                {this.props.openCampaignStatusModal && <CampaignStatusModal />}
                {/*<SideBar campaignEdits={this.state.campaignEdits} campaignStatusOptions={this.props.campaignStatusOptions}/>*/}
            </div>
        );
    }
}

CampaignDetailsPage.propTypes = {
    campaign: PropTypes.object,
    children: PropTypes.object,
    isPending: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    /*let campaign = Object.assign({}, state.tm.campaign.list.find(item => {
        return item.key == ownProps.params.key;
    }));*/
    let campaign = state.tm.campaign.campaignScreen.currentCampaign;

	
    let isValidTab = {
        questionnaire: state.tm.questionnaire.isValidQuestionnaire,
        portions: (state.tm.portion.list.length > 0) ? true : false , 
		advanced_settings:((campaign.sip_server_id != null && (validatePhoneNumber(campaign.phone_number) || campaign.phone_number == '' || campaign.phone_number == null ) ) ? true : false)
    };
    let campaignStatusOptions = state.tm.system.lists.campaignStatus || [];
    let campaignStatusConstOptions = state.tm.system.lists.campaignStatusConst || [];
    let campaignElectionTypeOptions = state.tm.system.lists.campaignElectionType || {};
    let telephonyModeOptions = state.tm.system.lists.telephonyMode || {};
    let dialerTypeOptions = state.tm.system.lists.dialerType || [];
    let returnCallNoAnswerOptions = state.tm.system.lists.returnCallNoAnswer || {};
    let actionCallNoAnswerOptions = state.tm.system.lists.actionCallNoAnswer || {};

    return {
        campaign,
        campaignStatistics: state.tm.campaign.campaignScreen.statistics,
        campaignLoaded: state.tm.campaign.campaignLoaded,
        campaignStatusOptions,
        campaignStatusConstOptions,
        campaignElectionTypeOptions,
        telephonyModeOptions,
		dialerTypeOptions,
        returnCallNoAnswerOptions,
        actionCallNoAnswerOptions,
        currentUser: state.system.currentUser,
        isPending: state.tm.campaign.pending ? true : false,
        isValidTab,
        openCampaignStatusModal: state.tm.campaign.openCampaignStatusModal,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        systemActions: bindActionCreators(systemActions, dispatch),
        campaignActions: bindActionCreators(campaignActions, dispatch),
        questionnaireActions: bindActionCreators(questionnaireActions, dispatch),
        portionActions: bindActionCreators(portionActions, dispatch),
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch),
        employeeActions: bindActionCreators(employeeActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignDetailsPage);
