import React from 'react';
import { connect } from 'react-redux';

import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';

import UserRole from './UserRole/UserRole';
import Team from './Team';
import SmsProviders from './SmsProviders';
import UpdateActivistsAllocations from './UpdateActivistsAllocations';

class SystemTab extends React.Component {

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
            if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system'])) {
                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.user_roles'])) {
                    SystemActions.loadUserRoles(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.user_roles'])) {
                    SystemActions.loadSystemModules(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.teams'])) {
                    SystemActions.loadTeamsList(store);
                }

                if ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.sms_providers'])) {
                    SystemActions.loadSmsProviders(this.props.dispatch);
                }

            }
        }
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }
    }

    render() {
        this.initVariables();
        return (
            <div style={this.blockStyle} className="tabContnt">
                <UserRole />
                <Team />
                <SmsProviders /> 
                { this.props.currentUser.admin && <UpdateActivistsAllocations />}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
    }; 
}

export default connect(mapStateToProps)(SystemTab);