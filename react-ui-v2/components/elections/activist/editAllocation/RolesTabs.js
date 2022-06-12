import React from 'react';
import { connect } from 'react-redux';
import ModalAddAssignment from '../ModalAddAllocation/ModalAddAssignment';

import RoleTabItem from './RoleTabItem';


class RolesTabs extends React.Component {
    state={
        showAddAssignment:false,
    }

    successAddAssignment=()=>{
        this.setState({showAddAssignment:false})
        this.props.addAllocation();
    }

    renderRolesTabs() {
        let that = this;
        let geoPermissionsByRoles = this.props.geoPermissionsByRoles;
        let isAdmin = this.props.currentUser.admin;
		let roles = null;
		if(this.props.activistsRolesHash){
 
			roles = this.props.activistsRolesHash.map( function(tabItem, index) {
			let rolePermission = 'elections.activists.' + tabItem.system_name ;
			let hasGeoPermission = isAdmin || geoPermissionsByRoles[tabItem.system_name];
				if ( isAdmin || that.props.currentUser.permissions[rolePermission] == true ) {
					return <RoleTabItem key={index} item={tabItem} currentTabRoleId={that.props.currentTabRoleId}
                                    hasGeoPermission={hasGeoPermission}
                                    setCurrentRoleTab={that.props.setCurrentRoleTab}/>;
				}
			});
		}

        return roles;
    }

    showAddAllocationModal() {
        this.setState({showAddAssignment:true})
    }

    /**
     * This function checks if the current user has
     * permission to add a non allocated role to the
     * activist.
     *
     * @returns {boolean}
     */
    isUserAllowedToAddPermissions() {
        if ( this.props.currentUser.admin) {
            return true;
        }
        for ( let roleIndex = 0; roleIndex < this.props.electionRoles.length; roleIndex++ ) {
            let electionRoleId = this.props.electionRoles[roleIndex].id;
            let electionRoleSystemName = this.props.electionRoles[roleIndex].system_name;

            let addPermission = 'elections.activists.' + electionRoleSystemName + '.add';

            // Checking add permission of a role which is not allocated to the activist
            if ( this.props.activistsRolesHash[electionRoleId] == null ) {
                if ( this.props.currentUser.admin || this.props.currentUser.permissions[addPermission] == true ) {
                    return true;
                }
            }
        }

        return false;
    }

    render () {
        return (
           <div>
            <ul className="nav nav-tabs main-tabs" role="tablist">
                {this.renderRolesTabs()}

                { (this.isUserAllowedToAddPermissions() ) &&
                <li className="pull-left">
                    <button title="הוסף תפקיד" className="btn btn-primary srchBtn"
                            disabled={this.props.addedAllocationFlag}
                            onClick={this.showAddAllocationModal.bind(this)}>
                        <span>+</span>
                        <span>הוסף תפקיד</span>
                    </button>
                </li>
                }
            </ul>
         <ModalAddAssignment 
         show={this.state.showAddAssignment}
         successAddAssignment={this.successAddAssignment}
         hideModel={()=>{this.setState({showAddAssignment:false})}}
         voterDetails={this.props.voterDetails}
         >

         </ModalAddAssignment>
            </div>
            
        );
    }
}

function mapStateToProps(state) {
    return {
        voterDetails: state.elections.activistsScreen.activistDetails
    };
  }
  
export default connect(mapStateToProps)(RolesTabs);