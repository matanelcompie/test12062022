import React from 'react';


class AllocationTabItem extends React.Component {
    setCurrentAllocationTab() {
        this.props.setCurrentAllocationTab(this.props.allocationTabName);
    }

    render() {
        let className = ( this.props.allocationTabName == this.props.currentAllocationTab ) ? "active" : "";
        if(this.props.displayAllocationRemovedMessage && this.props.allocationTabName == 'allocationDetails'){
            className += ' nav-item_invalid ' 
        }
        return <li className={className} onClick={this.setCurrentAllocationTab.bind(this)}>{this.props.allocationTabItem.title}</li>;
    }
}

export default AllocationTabItem;