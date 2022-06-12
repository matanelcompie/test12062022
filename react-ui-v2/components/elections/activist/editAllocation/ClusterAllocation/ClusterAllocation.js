import React from 'react';

import constants from 'libs/constants';

import AllocatedClusters from './AllocatedClusters';
import ClusterSearch from './ClusterSearch';
import ClusterSearchResult from './ClusterSearchResult';


class ClusterAllocation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: true,

            activistAllocatedClusters: {}
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
    }

    shouldComponentBeRendered() {
        if ( !this.props.currentUser.admin && this.props.currentUser.permissions['elections.activists.cluster_leader'] != true &&
             this.props.currentUser.permissions['elections.activists.motivator'] != true) {
            return false;
        }

        if ( this.props.currentTabRoleSystemName == this.electionRoleSytemNames.clusterLeader ||
            this.props.currentTabRoleSystemName == this.electionRoleSytemNames.motivator) {
            return true;
        } else {
            return false;
        }
    }

    render() {
        if ( this.shouldComponentBeRendered() ) {
            return (
                <div role="tabpanel" className={"tab-pane cluster-allocate" + (this.props.display ? " active" : "")}>
                    <div className="ContainerCollapse"><AllocatedClusters currentTabRoleId={this.props.currentTabRoleId}
                                                                          currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                                                          currentAllocationTab={this.props.currentAllocationTab}
                                                                          currentUser={this.props.currentUser}
                                                                          electionRoleKey={this.props.electionRoleKey}
                                                                          />
                    </div>

                    <div className="ContainerCollapse"><ClusterSearch currentTabRoleId={this.props.currentTabRoleId}
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

export default ClusterAllocation;