import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';

import VoterInfo from './VoterInfo';
import Upper from './Upper';
import CallAction from './CallAction';

import {parseTimerSecondsToTime} from '../../../../libs/globalFunctions';

import * as callActions from '../../../../actions/callActions';
import * as uiActions from '../../../../actions/uiActions';
import * as callAnswerActions from '../../../../actions/callAnswerActions';


class Header extends React.Component  {
    constructor(props) {
        super(props);

        this.timer = setInterval(this.tick.bind(this), 1000);
        this.initConstants();
    }

    initConstants() {
        this.textValues = {
            activeCall: 'שיחה פעילה',
            finishedcall: 'שיחה הסתיימה',
            waitingCall: 'ממתין לשיחה',
            inBreak: 'בהפסקה'
        };

        this.outboundPhone = {
            image: window.Laravel.baseURL + 'Images/outbound-phone.svg',
            alt: 'שיחה פעילה'
        };
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    tick() {
        if ( !this.props.showBetweenCallsModal && !this.props.showBreakModal) {
            callActions.updateTimer(this.props.dispatch);
        }
    }

    renderCallStatus() {
        // Waiting for a call
        if ( this.props.showBetweenCallsModal ) {
            return (
                <div className="header__call header__call_status_finished">
                    {this.textValues.waitingCall + ': ' + parseTimerSecondsToTime(this.props.timer.seconds)}
                </div>
            );
        }

        // In a break
        if ( this.props.showBreakModal ) {
            return (
                <div className="header__call header__call_status_finished">
                    {this.textValues.inBreak + ': ' + parseTimerSecondsToTime(this.props.timer.seconds)}
                </div>
            );
        }

        // User working on a call
        if ( this.props.timer.callSeconds == null ) { // Call is active
            return (
                <div className="header__call header__call_status_active">
                    <img src={this.outboundPhone.image} alt={this.outboundPhone.alt}/>
                    <span style={{marginRight: '10px'}}>
                        {this.textValues.activeCall + ': ' + parseTimerSecondsToTime(this.props.timer.seconds)}
                    </span>
                </div>
            );
        } else { // Call ended and the user still working on the user
            return (
                <div className="header__call header__call_status_finished">
                    <i className="fa fa-phone" style={{transform: 'rotate(135deg)'}} aria-hidden="true"/>
                    <span style={{marginRight: '10px'}}>
                        {this.textValues.finishedcall + ': ' + parseTimerSecondsToTime(this.props.timer.callSeconds)}
                    </span>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="header">
                <Upper questionnaireName={this.props.questionnaireName} userName={this.props.userName} />
                {this.renderCallStatus()}
                <div className="header__main-content">
                    <VoterInfo voter={this.props.voter} oldAddress={this.props.oldAddress}
                               supportStatusConstOptions={this.props.supportStatusConstOptions} />
                    <CallAction nextCall={this.props.nextCall} canUserEndCall={this.props.canUserEndCall}/>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        timer: state.call.activeCall.timer,
        showBetweenCallsModal: state.campaign.modalBetweenCalls.show,
        showBreakModal: state.campaign.modalBreak.show,
        questionnaire: state.campaign.questionnaire,
        oldAddress: state.call.oldAddress
    }
}

export default connect(mapStateToProps) (withRouter(Header));