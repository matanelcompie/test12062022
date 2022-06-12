import React from 'react';


class RoleTabItem extends React.Component {
    setCurrentRoleTab() {
        this.props.setCurrentRoleTab(this.props.item.election_role_id);
    }

    render() {
        let hasGeoPermission = this.props.hasGeoPermission ;
        let className = (this.props.item.election_role_id == this.props.currentTabRoleId) ? "active" : "" ;

        return (
            <li className={className} style={{cursor: hasGeoPermission ? 'pointer' : 'not-allowed'}}
                 onClick={hasGeoPermission ? this.setCurrentRoleTab.bind(this) : ''}>
                {this.props.item.election_role_name}
            </li>
        );
   }
}

export default RoleTabItem;