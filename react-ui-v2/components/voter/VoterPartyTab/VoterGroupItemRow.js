import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';
import Combo from '../../global/Combo';

/**
 *  This component renders the groups
 *  in the editing Modal Dialog for editing
 *  a group.
 */
class VoterGroupItemRow extends React.Component {

    getGroupId(groupName) {
        let groupList = this.props.currentGroups;
        let selectedGroupIndex = -1;
        let groupId = 0;

        selectedGroupIndex = groupList.findIndex(groupItem => groupItem.name == groupName);
        if (  selectedGroupIndex == -1 ) {
            return 0;
        } else {
            groupId = groupList[selectedGroupIndex].id;
            return groupId;
        }
    }

    groupChange(e) {
        // Find group id
        var selectedGroupName = e.target.value;
        var selectedGroupIndex = this.props.selectedGroupIndex;
        var selectedGroupId = 0;

        selectedGroupId = this.getGroupId(selectedGroupName);

        // dispatch the new (group id, group name) to array newSelectedGroups
        // and change it's array length
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_EDIT_ITEM_SELECTED_GROUPS,
                             selectedGroupIndex: selectedGroupIndex, selectedGroupId: selectedGroupId,
                             selectedGroupName: selectedGroupName});
    }

    initVariables() {
        var groupIndex = this.props.selectedGroupIndex;
        var currentLength = groupIndex;
        var itemSelectedGroups = this.props.itemSelectedGroups;

        this.groupName = '';
        this.redStyle = {}

        if ( itemSelectedGroups.length > currentLength ) {
            // This group is in the array of new selected
            // groups. Show it's name in the combo box.
            this.groupName = itemSelectedGroups[groupIndex].name;
            this.redStyle = itemSelectedGroups[groupIndex].id == -1 ? { border: '1px solid red' } : {};

        }
    }

    render() {

        this.initVariables();

        return(
            <li>
                <Combo items={this.props.currentGroups} itemIdProperty="id" itemDisplayProperty='name'
                       maxDisplayItems={10} value={this.groupName}
                       className="form-combo-table" style={this.redStyle}
                       onChange={this.groupChange.bind(this)}/>
            </li>
        )
    }
}


export default connect()(VoterGroupItemRow)