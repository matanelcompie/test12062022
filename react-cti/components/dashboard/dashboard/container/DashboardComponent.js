import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import * as campaignActions from 'actions/campaignActions';
import * as callActions from 'actions/callActions';

import Dashboard from '../display/Dashboard';


class DashboardComponent extends React.Component {

    componentWillMount() {
        //this.props.campaignActions.setActiveCampaign(this.props.match.params.key);

        momentLocalizer(moment);
    }

    componentWillReceiveProps(nextProps) {
        /*if (!nextProps.activeCampaignKey) {
            this.props.campaignActions.setActiveCampaign(this.props.match.params.key);
        }

        if (nextProps.activeCampaignKey && !nextProps.activeCall.key) {
            this.props.callActions.addNewCall();
        }*/
    }

    render() {
        return (
            <Dashboard />
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        activeCampaignKey: state.campaign.activeCampaignKey,
        activeCall: state.call.activeCall,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        campaignActions: bindActionCreators(campaignActions, dispatch),
        callActions: bindActionCreators(callActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardComponent);
