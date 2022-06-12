import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import HeaderBlock from './HeaderBlock';
import TabItem from './TabItem';
import LoadingVoters from './LoadingVoters/LoadingVoters';
import Ballots from './Ballots/Ballots';
import Support from './Support/Support';
import Votes from './Votes/Votes';
import Budget from './Budget/Budget';
import Percents from './Percents/Percents';
import SupportUpdate from './SupportUpdate/SupportUpdate';
import UploadFileModal from './UploadFileModal';

import * as ElectionsActions from 'actions/ElectionsActions';


class EditElectionCampaign extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTab: 'loadedVoters',

            tabs: {
                loadedVoters: {title: 'טעינת ספר בוחרים', display: true, permission: 'elections.campaigns.voters_book'},
                ballots: {title: 'קלפיות', display: false, permission: 'elections.campaigns.ballots'},
                support: {title: 'סטטוס תמיכה למערכת בחירות', display: false, permission: 'elections.campaigns.support_status'},
                votes: {title: 'תוצאות הצבעה', display: false, permission: 'elections.campaigns.vote_results'},
                budget: {title: 'תקציב', display: false, permission: 'elections.campaigns.budget'},
                percents: {title: 'אחוזי הצבעה לפי שעות', display: false, permission: 'elections.campaigns.vote_percentage'},
                supportUpdate: {title: 'עדכון סטטוס תמיכה', display: false, permission: 'elections.campaigns.support_status_update'}
            },

            uploadModal: {
                show: false,
                tabKey: null,
                fileType: 'zip'
            }
        };
    }

    componentWillMount() {
        if (this.props.currentUser.first_name.length > 0) {
            if (!this.props.currentUser.admin && this.props.currentUser.permissions['elections.campaigns.edit'] != true) {
                this.props.router.push('/unauthorized');
            } else {
                let firstTabKey = this.getFirstTab(this.props.currentUser);
                if ( firstTabKey != '' ) {
                    this.setCurrentTab(firstTabKey);
                }
            }
        }

        ElectionsActions.getCampaignDetails(this.props.dispatch, this.props.router.params.campaignKey);
    }

    componentWillReceiveProps(nextProps) {
        if (0 == this.props.currentUser.first_name.length && nextProps.currentUser.first_name.length > 0) {
            if (!nextProps.currentUser.admin && nextProps.currentUser.permissions['elections.campaigns.edit'] != true) {
                this.props.router.push('/unauthorized');
            } else {
                let firstTabKey = this.getFirstTab(nextProps.currentUser);
                if ( firstTabKey != '' ) {
                    this.setCurrentTab(firstTabKey);
                }
            }
        }
    }

    getFirstTab(currentUser) {
        for ( let tabKey in this.state.tabs ) {
            let tabPermission = this.state.tabs[tabKey].permission;

            if (currentUser.admin || currentUser.permissions[tabPermission] == true) {
                return tabKey;
            }
        }

        return '';
    }

    setCurrentTab(newTab) {
        let currentTab = this.state.currentTab;
        let tabs = this.state.tabs;

        tabs[currentTab].display = false;
        tabs[newTab].display = true;

        this.setState({currentTab: newTab, tabs});
    }

    uploadFileToServer(formFields) {
        switch ( this.state.uploadModal.tabKey ) {
            case 'loadedVoters':
                ElectionsActions.uploadCampaignVoterBook(this.props.dispatch, this.props.router.params.campaignKey, formFields);
                break;

            case 'budget':
                ElectionsActions.uploadCampaignBudgetFile(this.props.dispatch, this.props.router.params.campaignKey, formFields);
                break;

            case 'votes':
                ElectionsActions.uploadCampaignVoteFile(this.props.dispatch, this.props.router.params.campaignKey, formFields);
                break;

            case 'ballots':
                ElectionsActions.uploadCampaignBallotBoxFile(this.props.dispatch, this.props.router.params.campaignKey, formFields);
                break;
        }
    }

    hideUploadModal() {
        let uploadModal = this.state.uploadModal;

        uploadModal.show = false;
        uploadModal.tabKey = null;
        uploadModal.fileType = 'zip';
        this.setState({uploadModal});
    }


    showUploadModal(tabKey) {
        let uploadModal = this.state.uploadModal;

        uploadModal.show = true;
        uploadModal.tabKey = tabKey;

        switch ( tabKey ) {
            case 'votes':
            case 'ballots':
                uploadModal.fileType = 'csv';
                break;

            case 'loadedVoters':
            case 'budget':
                uploadModal.fileType = 'zip';
                break;
        }
        this.setState({uploadModal});
    }

    renderTabs() {
       let tabs = [];

        for ( let tabKey in this.state.tabs ) {
            if ( this.checkTabPermissions(tabKey) ) {
                tabs.push(
                    <TabItem key={tabKey} tabKey={tabKey} tabItem={this.state.tabs[tabKey]} currentTab={this.state.currentTab}
                             setCurrentTab={this.setCurrentTab.bind(this)} tabsLocked={this.props.tabsLocked} />
                );
            }
        }

        return <ul className="nav nav-tabs tabsRow" role="tablist">{tabs}</ul>;
    }

    checkTabPermissions(tabKey) {
        let tabPermission = this.state.tabs[tabKey].permission;

        return ( this.props.currentUser.admin || this.props.currentUser.permissions[tabPermission] == true );
    }
	
	goBackFunction(){
		this.props.router.push('elections/campaigns');
	}

	updateCampaignDetails(campaignKey, campaignFields) {
        campaignFields.vote_start_time = campaignFields.vote_start_time + ':00';
        campaignFields.vote_end_time = campaignFields.vote_end_time + ':00';
        ElectionsActions.editCampaignDetails(this.props.dispatch, campaignKey, campaignFields);
    }

    render() {
        return (
            <div className="stripMain elections-period-management-edit-campaign">
                <div className="container">
                    <HeaderBlock campaignDetails={this.props.campaignDetails}
                                 loadedCampaignDetailsFlag={this.props.loadedCampaignDetailsFlag}
                                 updateCampaignDetails={this.updateCampaignDetails.bind(this)}
                                 goBackFunction={this.goBackFunction.bind(this)}/>

                    <div className="containerTabs">
                        {this.renderTabs()}

                        <div className="tab-content tabContnt">
                            { this.checkTabPermissions('loadedVoters') &&
                                <LoadingVoters tabKey="loadedVoters" display={this.state.tabs.loadedVoters.display}
                                               campaignKey={this.props.router.params.campaignKey}
                                               showUploadModal={this.showUploadModal.bind(this)}/>
                            }
                            { this.checkTabPermissions('ballots') &&
                                <Ballots tabKey="ballots" display={this.state.tabs.ballots.display}
                                         campaignKey={this.props.router.params.campaignKey}
                                         showUploadModal={this.showUploadModal.bind(this)}/>
                            }
                            { this.checkTabPermissions('support') &&
                                <Support tabKey="support"
                                    campaignKey={this.props.router.params.campaignKey}
                                    display={this.state.tabs.support.display}/>
                            }
                            { this.checkTabPermissions('votes') &&
                                <Votes tabKey="votes" display={this.state.tabs.votes.display}
                                       campaignKey={this.props.router.params.campaignKey}
                                       showUploadModal={this.showUploadModal.bind(this)}/>
                            }
                            { this.checkTabPermissions('budget') &&
                                <Budget tabKey="budget" display={this.state.tabs.budget.display}
                                        campaignKey={this.props.router.params.campaignKey}
                                        showUploadModal={this.showUploadModal.bind(this)}/>
                            }
                            { this.checkTabPermissions('percents') &&
                                <Percents tabKey="percents" display={this.state.tabs.percents.display}
                                          campaignKey={this.props.router.params.campaignKey}
                                          campaignDetails={this.props.campaignDetails}/>
                            }
                            {this.checkTabPermissions('supportUpdate') &&
                                <SupportUpdate tabKey="supportUpdate" display={this.state.tabs.supportUpdate.display}
                                               campaignKey={this.props.router.params.campaignKey}/>
                            }
                        </div>
                    </div>
                </div>

                <UploadFileModal show={this.state.uploadModal.show} hideUploadModal={this.hideUploadModal.bind(this)}
                                 uploadFileToServer={this.uploadFileToServer.bind(this)}
                                 fileType={this.state.uploadModal.fileType}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        loadedCampaignDetailsFlag: state.elections.electionsCampaignsScreen.loadedCampaignDetailsFlag,
        campaignDetails: state.elections.electionsCampaignsScreen.campaignDetails,
        tabsLocked: state.elections.electionsCampaignsScreen.tabsLocked
    };
}

export default connect(mapStateToProps) (withRouter(EditElectionCampaign));