import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as campaignActions from 'actions/campaignActions';
import * as callActions from 'actions/callActions';
import * as callAnswerActions from 'actions/callAnswerActions';

import Questionnaire from 'components/dashboard/questionnaire/container/Questionnaire';
import VoterInfo from 'components/dashboard/header/display/VoterInfo';
import CallNotes from 'components/dashboard/questionnaire/container/CallNotes';

class Dashboard extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
        };
    }

    /*componentWillReceiveProps(nextProps) {
        if (this.props.campaignList.length > 0 && !nextProps.campaign.key) {
            this.props.campaignActions.setActiveCampaign(this.props.match.params.key);
        }
        if (!!nextProps.campaign.key && !nextProps.activeCall.key) {
            this.props.callActions.addNewCall();
        }
    }*/

    render() {
        return (
            <div className="dashboard" style={{direction: 'ltr'}}>
                <div className="cti-header">
                    <div className="cti-header__campaign-name">{this.props.campaign.name}</div>
                    <div className="cti-header__questionnaire-id">{'שאלון מספר ' + this.props.questionnaire.id}</div>
                </div>
                <VoterInfo voter={this.props.activeCall.voter}/>
                <div><button onClick={this.props.callActions.addNewCall}>Add New Call</button></div>
                <div><button onClick={this.props.callActions.finishCall}>Finish Call</button></div>
                <Questionnaire onFinish={this.addNewCall}/>
                <CallNotes />
            </div>
        );
    }
}

Dashboard.propTypes = {
    campaign: PropTypes.object,
    questionnaire: PropTypes.object,
    activeCall: PropTypes.object,
    campaignList: PropTypes.array,
    callAnswers: PropTypes.object,
};

Dashboard.defaultProps = {
    campaign: {},
    questionnaire: {},
    activeCall: {},
    campaignList: [],
    callAnswers: {},
};

function mapStateToProps(state, ownProps) {
    let campaign = state.campaign.activeCampaign;
    let questionnaire = state.campaign.questionnaire;
    let activeCall = state.call.activeCall;
    let campaignList = state.campaign.list;
    let callAnswers = state.callAnswer;

    return {
        campaign,
        questionnaire,
        activeCall,
        campaignList,
        callAnswers,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        campaignActions: bindActionCreators(campaignActions, dispatch),
        callActions: bindActionCreators(callActions, dispatch),
        callAnswerActions: bindActionCreators(callAnswerActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
