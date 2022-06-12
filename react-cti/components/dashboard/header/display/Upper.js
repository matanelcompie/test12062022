import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';

import {parseTimerSecondsToTime} from '../../../../libs/globalFunctions';

import * as campaignActions from '../../../../actions/campaignActions';


class Upper extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.textValues = {
            actionTime: 'זמן פעולה לתושב: ',
            callTime: 'זמן שיחה: '
        };
    }

    initVariables() {
        this.actionSeconds = this.props.timer.seconds;

        if ( this.props.timer.callSeconds == null ) {
            this.callSeconds = this.props.timer.seconds;
        } else {
            this.callSeconds = this.props.timer.callSeconds;
        }
    }

    toggleUserBreakRequest() {
        campaignActions.toggleUserBreakRequest(this.props.dispatch);
    }

    getCampignName() {
        let campaignIndex = -1;
        let campaignName = "";

        let simulationText = 'סימולציה';

        campaignIndex = this.props.campaigns.findIndex(campaignItem => campaignItem.key == this.props.activeCampaignKey);
        if ( campaignIndex > -1 ) {
            campaignName = this.props.campaigns[campaignIndex].name;
        }

        if ( this.props.inCallScreen ) {
            return campaignName;
        } else {
            return (
                <span>{campaignName} - <font color='ffff00'><strong>{simulationText}</strong></font></span>
            );
        }
    }

    resetBreakText() {
        if(this.props.askForBreak){
            return;
        }
        campaignActions.updateBreakText(this.props.dispatch, '');
    }

    renderBreakHoverText() {
        let breakText = '';

        if ( this.props.askForBreak ) {
            breakText = 'ביקשתי הפסקה';
        } else {
            breakText = 'בקש הפסקה';
        }

        campaignActions.updateBreakText(this.props.dispatch, breakText);
    }

    render() {
        this.initVariables();

        return (
            <div className="header-upper">
                <div className="header-upper__user-info">
                    <span className="header-upper__user-icon"/>
                    <span className="header-upper__user-name">{this.props.userName}</span>
                    <span className="header-upper__user-ext">
                        {this.props.inCallScreen ? this.props.sipnumber : 120}
                    </span>
                    <span className="header-upper__break-request-btn" style={{paddingRight: '32px'}}
                          onMouseOver={this.renderBreakHoverText.bind(this)}
                          onMouseOut={this.resetBreakText.bind(this)}
                          onClick={this.toggleUserBreakRequest.bind(this)}>
                        {this.props.breakText}
                    </span>
                </div>
                <div className="header-upper__campaign">
                    {this.getCampignName()}
                </div>
                <div className="header-upper__call-info">
                    <div className="header-upper__timer">
                        <div className="header-upper__timer-label">{this.textValues.actionTime}</div>
                        <div className="header-upper__timer-value">
                            {parseTimerSecondsToTime(this.actionSeconds)}
                        </div>
                    </div>
                    <div className="header-upper__timer">
                        <div className="header-upper__timer-label">{this.textValues.callTime}</div>
                        <div className="header-upper__timer-value">
                            {parseTimerSecondsToTime(this.callSeconds)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};


function mapStateToProps(state) {
    return {
        timer: state.call.activeCall.timer,
        inCallScreen: state.call.inCallScreen,
        campaigns: state.campaign.list,
        activeCampaignKey: state.campaign.activeCampaignKey,
        askForBreak: state.campaign.askForBreak,
        breakText: state.campaign.breakText,
        sipnumber: state.system.webDialer.sipnumber
    }
}

export default connect(mapStateToProps) (withRouter(Upper));
