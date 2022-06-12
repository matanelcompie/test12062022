import React from 'react';

import AllocationTabItem from './AllocationTabItem';


class AllocationTabs extends React.Component {
    renderAllocationTabs() {
        let that = this;
 
		let roleAllocationTabs = null;
		if(this.props.roleAllocationTabs && this.props.currentTabRoleSystemName && this.props.roleAllocationTabs[this.props.currentTabRoleSystemName]){
			 roleAllocationTabs = this.props.roleAllocationTabs[this.props.currentTabRoleSystemName].map( function (allocationTabName, index) {
				let allocationTabItem = that.props.allocationTabs[allocationTabName];

				return (
          <AllocationTabItem
            key={index}
            allocationTabName={allocationTabName}
            currentAllocationTab={that.props.currentAllocationTab}
            allocationTabItem={allocationTabItem}
            setCurrentAllocationTab={that.props.setCurrentAllocationTab}
            displayAllocationRemovedMessage={that.props.displayAllocationRemovedMessage}
          />
        );
			});
		}

        return roleAllocationTabs;
    }

    render() {
        return (
            <ul className="nav nav-tabs tabsRow" role="tablist">
                {this.renderAllocationTabs()}
            </ul>
        );
    }
}

export default AllocationTabs;