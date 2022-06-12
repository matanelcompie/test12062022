import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import SupportUpdateItem from './SupportUpdateItem';
import AddSupportStatusUpdateModal from './AddSupportStatusUpdateModal';

import * as ElectionsActions from 'actions/ElectionsActions';


class SupportUpdate extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addStatusUpdateModal: {
                show: false
            },
			intervalId: null,
            previousCampaignKey: null,
            currentCampaignName: '',
            previousCampaignName: ''
        };

        this.initConstants();
    }

    initConstants() {
        this.newUpdateButtonText = "עדכון חדש";
    }

    componentWillMount() {
		var millisecondsToWait = 1000 * 5;
		let self = this;
		let intervalId = setInterval(function () {
			//console.log("refresh 5");
			ElectionsActions.loadCampaignSupportStatusUpdates(self.props.dispatch, self.props.campaignKey);
		}, millisecondsToWait);
		this.setState({intervalId});
        //load campaign list if got here from url
        if (this.props.electionCampaigns.length == 0) ElectionsActions.loadElectionCampaignsForManagement(this.props.dispatch);

        //load current and previous election campaigns' support status list
        ElectionsActions.loadSupportStatusesForSupportStatusUpdate(this.props.dispatch, this.props.campaignKey);
        this.loadPreviousSupportStatus(this.props);


    }

    /**
     * Load previous election campaigns' support status list
     *
     * @param object props
     * @return void
     */
    loadPreviousSupportStatus(props) {
        let self = this;
        let currentCampaignKeyIndex = null;
        props.electionCampaigns.forEach(function(campaign,index) {
            if (campaign.key == props.campaignKey) {
                currentCampaignKeyIndex = index;
                self.setState({
                    currentCampaignName: campaign.name
                });
            }
            if (currentCampaignKeyIndex != null && index == currentCampaignKeyIndex + 1) {
                ElectionsActions.loadSupportStatusesForSupportStatusUpdate(props.dispatch, campaign.key);
                self.setState({
                    previousCampaignKey: campaign.key,
                    previousCampaignName: campaign.name
                });
            }
        });        
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.electionCampaigns.length == 0)&&(nextProps.electionCampaigns.length > 0)) {
            this.loadPreviousSupportStatus(nextProps);
        }
    }
	
	componentWillUnmount() {
        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.setState({
                intervalId: null
            })
        }
    }

    addSupportStatusUpdate(updateType, selectedSupportStatus, supportStatusType) {
        this.hideAddStatusUpdateModal();

        ElectionsActions.addCampaignSupportStatusUpdate(this.props.dispatch,
                                                        this.props.campaignKey,
                                                        updateType,
                                                        selectedSupportStatus,
                                                        supportStatusType);
    }

    hideAddStatusUpdateModal() {
        let addStatusUpdateModal = this.state.addStatusUpdateModal;

        addStatusUpdateModal.show = false;
        this.setState(addStatusUpdateModal);
    }

    showAddStatusUpdateModal() {
        let addStatusUpdateModal = this.state.addStatusUpdateModal;

        addStatusUpdateModal.show = true;
        this.setState(addStatusUpdateModal);
    }

    cancelStatusUpdate(supportStatusUpdateKey) {
        ElectionsActions.editCampaignSupportStatusUpdate(this.props.dispatch, this.props.campaignKey, supportStatusUpdateKey);
    }
	
	restartCurrentProcess(supportStatusUpdateKey){
		ElectionsActions.editCampaignSupportStatusUpdate(this.props.dispatch, this.props.campaignKey, supportStatusUpdateKey, {edit_type:'reload'}) ;
	}

    getCampaignSupportStatusUpdate(supportStatusUpdateKey) {
        ElectionsActions.getCampaignSupportStatusUpdate(this.props.dispatch, this.props.campaignKey, supportStatusUpdateKey);
    }

    renderSupportUpdates() {
        let that = this;
        const supportStatusUpdateStatuses = constants.electionCampaigns.supportStatusUpdate.Statuses;
        let allowedToEdit = ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.support_status_update.edit'] == true );

        let supportStatusUpdates = this.props.supportStatusUpdates.map(  function (item, index) {
              return <SupportUpdateItem key={item.key} item={item} itemIndex={index} allowedToEdit={allowedToEdit}
                                      cancelStatusUpdate={that.cancelStatusUpdate.bind(that)}
									  restartCurrentProcess={((item.status==supportStatusUpdateStatuses.cancelled || item.status==supportStatusUpdateStatuses.error) ? that.restartCurrentProcess.bind(that , item.key) : null)}
									  />
        });

        return <tbody>{supportStatusUpdates}</tbody>;
    }

    renderAddButton() {
        if ( this.props.currentUser.admin || this.props.currentUser.permissions['elections.campaigns.support_status_update.add'] == true ) {
            return (
                <button className="btn new-btn-default" data-target="#upload-file" data-toggle="modal"
                        onClick={this.showAddStatusUpdateModal.bind(this)}>
                    {this.newUpdateButtonText}
                </button>
            );
        } else {
            return '\u00A0';
        }
    }

    render() {
        return (
            <div role="tabpanel" className={"support-update tab-pane" + (this.props.display ? " active" : "")}
                 id={"Tab-" + this.props.tabKey}>
                <div className="container-tab">
                    <div className="row">
                        <div className="col-md-8 pull-right text-right blue-title ">עדכון סטטוס תמיכה</div>
                        <div className="col-md-3 pull-left text-left ">{this.renderAddButton()}</div>
                    </div>

                    <div className="table-elections-low">
                        <div className="table-responsive">
                            <table className="table table-frame2 table-striped">
                                <thead>
                                <tr>
                                    <th>מס"ד</th>
                                    <th>מועד ביצוע</th>
                                    <th>משתמש מבצע</th>
                                    <th>סטטוס לעדכון</th>
                                    <th>תושבים שעודכנו</th>
                                    <th>מצב</th>
                                </tr>
                                </thead>

                                {this.renderSupportUpdates()}
                            </table>
                        </div>
                    </div>
                </div>
                <AddSupportStatusUpdateModal show={this.state.addStatusUpdateModal.show}
                                            hideAddStatusUpdateModal={this.hideAddStatusUpdateModal.bind(this)}
                                            addSupportStatusUpdate={this.addSupportStatusUpdate.bind(this)}
                                            supportStatus={this.props.supportStatus}
                                            currentCampaignKey={this.props.campaignKey}
                                            currentCampaignName={this.state.currentCampaignName}
                                            previousCampaignKey={this.state.previousCampaignKey}
                                            previousCampaignName={this.state.previousCampaignName}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        supportStatusUpdates: state.elections.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates,
        electionCampaigns: state.elections.electionsCampaignsScreen.combos.electionsCampaigns,
        supportStatus: state.elections.electionsCampaignsScreen.supportStatusUpdates.supportStatus
    };
}

export default connect(mapStateToProps) (SupportUpdate);