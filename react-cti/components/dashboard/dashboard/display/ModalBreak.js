import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';

import {parseSecondsToTime} from '../../../../libs/globalFunctions';

import ModalWindow from '../../../common/ModalWindow';

import * as campaignActions from '../../../../actions/campaignActions';
import * as callActions from '../../../../actions/callActions';


class ModalBreak extends React.Component {
    constructor(props) {
        super(props);

        this.timer = setInterval(this.tick.bind(this), 1000);

        this.initConstants();
    }

    initConstants() {
        this.modalTexts = {
            title: '',
            buttonOkText: 'חזרה לעבודה',
            buttonCancelText: 'יציאה מהקמפיין',
            hello: 'שלום, אתה נמצא בהפסקה כרגע'
        };

        this.timeLabels = {
            totalActivity: 'סה"כ זמן פעילות',
            toatlBreak: 'זמן הפסקה כולל'
        };

        this.bellAndTimeIcon = window.Laravel.baseURL + 'Images/bell-and-time.svg';
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    tick() {
        if (this.props.showBreakModal) {
            campaignActions.countBreakTime(this.props.dispatch);
        }
    }

    exitCampaign() {
        if(!this.props.simulationMode){
            campaignActions.endBreak(this.props.dispatch, this.props.breakKey);
            //deactivate user in campaign -> stop user active time
            campaignActions.deactivateUserInCampaign(this.props.dispatch);
        }
        callActions.resetActiveCaller(this.props.dispatch);

        campaignActions.resetActiveCampaign(this.props.dispatch);
        campaignActions.resetSimulationMode(this.props.dispatch);

        this.props.history.push('/');
    }

    returnToCampaign() {
        
        if(!this.props.simulationMode){
            campaignActions.endBreak(this.props.dispatch, this.props.breakKey);
            campaignActions.createWaiting(this.props.dispatch, this.props.activeCampaignKey);
        }
        campaignActions.returnFromBreak(this.props.dispatch);
        campaignActions.showBetweenCallsModal(this.props.dispatch);
    }

    getCampignName() {
        let campaignIndex = -1;
        let campaignName = "";

        let simulationText = 'סימולציה';

        campaignIndex = this.props.campaigns.findIndex(campaignItem => campaignItem.key == this.props.activeCampaignKey);
        if ( campaignIndex > -1 ) {
            campaignName = this.props.campaigns[campaignIndex].name;
        }

        return campaignName;
    }

    render() {
        return (
            <ModalWindow show={this.props.showBreakModal}
                         buttonOk={this.returnToCampaign.bind(this)}
                         buttonOkText={this.modalTexts.buttonOkText}
                         buttonCancel={this.exitCampaign.bind(this)}
                         buttonCancelText={this.modalTexts.buttonCancelText}
                         title={this.modalTexts.title}
                         style={{zIndex: '9001'}}>
                <div className="modal-break__row-bell"><img src={this.bellAndTimeIcon}/></div>

                <div className="dashboard__modal-break">
                    <div className="modal-break__row-hello">{this.modalTexts.hello}</div>
                </div>

                <div className="modal-break__row-campaign">{this.getCampignName()}</div>

                <div className="modal-break__row-ticker-break">{parseSecondsToTime(this.props.modalSeconds)}</div>

                <div className="modal-break__row-total-tickers">
                    <div className="modal-break__column-total-break">
                        <div className="modal-break__column-total-break-header">{this.timeLabels.toatlBreak}</div>

                        <div className="modal-break__column-total-break-ticker">
                            {parseSecondsToTime(this.props.totalBreakSeconds)}
                        </div>
                    </div>

                    <div className="modal-break__column-total-activity">
                        <div className="modal-break__column-total-activity-header">{this.timeLabels.totalActivity}</div>

                        <div className="modal-break__column-total-activity-ticker">
                            {parseSecondsToTime(this.props.totalActivitySeconds)}
                        </div>
                    </div>
                </div>
            </ModalWindow>
        );
    }
}


function mapStateToProps(state) {
    return {
        showBreakModal: state.campaign.modalBreak.show,
        modalSeconds: state.campaign.modalBreak.seconds,
        totalBreakSeconds: state.campaign.modalBreak.totalSeconds,
        totalActivitySeconds: state.call.activeCall.timer.totalActivitySeconds,
        activeCampaignKey: state.campaign.activeCampaignKey,
        campaigns: state.campaign.list,
        simulationMode: state.campaign.simulationMode,
        breakKey: state.campaign.breakKey,
    }
}

export default connect(mapStateToProps)(withRouter(ModalBreak));