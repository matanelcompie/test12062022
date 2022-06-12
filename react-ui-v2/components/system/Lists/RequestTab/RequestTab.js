import React from 'react';
import { connect } from 'react-redux';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

import RequestTopics from './RequestTopic/RequestTopics';
import RequestAction from './RequestAction/RequestActionType';
import RequestStatus from './RequestStatus';
import RequestSource from './RequestSource';
import RequestClosureReason from './RequestClosureReason';

class RequestTab extends React.Component {
    constructor(props) {
        super(props);
        this.isPermissionsLoaded = false;
    }

    componentDidMount() {
        this.loadLists();
    }

    componentDidUpdate() {
        this.loadLists();
    }

    loadLists() {
        if (this.props.currentUser.first_name.length && !this.isPermissionsLoaded) {
            this.isPermissionsLoaded = true;
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests'])) {
                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.action_topics_and_types'])) {
                    SystemActions.loadRequestActionType(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status'])) {
                    SystemActions.loadRequestStatus(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.status'])) {
                    SystemActions.loadRequestStatusTypes(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.topics'])) {
                    SystemActions.loadRequestTopics(store.dispatch);
                    SystemActions.loadRequestModuleUsers(store.dispatch);
                    if(this.props.teams.length == 0){
                        SystemActions.loadTeams(store);
                      }	 
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.request_source'])) {
                    SystemActions.loadRequestSource(this.props.dispatch);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.requests.closure_reason'])) {
                    SystemActions.loadRequestClosureReason(this.props.dispatch);
                }
            }
        }
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            };
        } else {
            this.blockStyle = {};
        }
    }

    render() {
        this.initVariables();
        return (
            <div style={this.blockStyle} className="tabContnt">
                <RequestStatus />
                <RequestAction />
                <RequestTopics />
                <RequestSource />
                <RequestClosureReason />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        teams: state.system.teams,
        currentUser: state.system.currentUser,
    };
}

export default connect(mapStateToProps)(RequestTab);