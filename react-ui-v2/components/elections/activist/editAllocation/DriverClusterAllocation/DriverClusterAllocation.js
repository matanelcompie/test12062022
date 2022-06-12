import React from 'react';

import constants from 'libs/constants';

import AllocatedClusters from './AllocatedClusters';
import ClusterSearch from './ClusterSearch';
import ClusterSearchResult from './ClusterSearchResult';


class DriverClusterAllocation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
    }

    shouldComponentBeRendered() {
        if ( !this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists.driver'] != true ) {
            return false;
        }

        if ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.driver ) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        if ( this.shouldComponentBeRendered() ) {
            return (
                <div role="tabpanel" className={(this.props.display) ? "tab-pane active" : "tab-pane"}>
                    <div className="ContainerCollapse">
                        <AllocatedClusters currentTabRoleId={this.props.currentTabRoleId}
                                           currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                           currentAllocationTab={this.props.currentAllocationTab}/>
                    </div>

                    <div className="ContainerCollapse">
                        <ClusterSearch currentTabRoleId={this.props.currentTabRoleId}
                                       currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                       currentAllocationTab={this.props.currentAllocationTab}/>
                    </div>

                    <ClusterSearchResult currentTabRoleId={this.props.currentTabRoleId}
                                         currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                         roleClustersHash={this.props.roleClustersHash} currentUser={this.props.currentUser}/>
                </div>
            );
        } else {
            return <div>{'\u00A0'}</div>;
        }
    }
}

export default DriverClusterAllocation;