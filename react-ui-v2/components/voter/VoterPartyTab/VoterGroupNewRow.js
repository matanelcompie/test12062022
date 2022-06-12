import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';
import Combo from '../../global/Combo';

/**
 *  This component renders the groups
 *  in the new Modal Dialog for adding
 *  a group.
 */
class VoterGroupNewRow extends React.Component {

    getGroupId(groupName) {
        let groupList = this.props.currentGroups;
        let groupIndex = -1;
        let groupId = 0;

        groupIndex = groupList.findIndex(groupItem => groupItem.name == groupName);
        if (groupIndex == -1) {
            return 0;
        } else {
            groupId = groupList[groupIndex].id;
            return groupId;
        }
    }

    groupChange(e) {
        // Find group id
        var selectedGroupName = e.target.value;
        var groupIndex = this.props.groupIndex;

       let selectedGroupId = this.getGroupId(selectedGroupName);

        // dispatch the new (group id, group name) to array newSelectedGroups
        // and change it's array length
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_ADD_TO_NEW_SELECTED_GROUPS,
            groupIndex: groupIndex, selectedGroupId: selectedGroupId, selectedGroupName: selectedGroupName, 
        });
    }

    initVariables() {
        var groupIndex = this.props.groupIndex;
        var currentLength = groupIndex;
        var newSelectedGroups = this.props.newSelectedGroups;

        // The selected group's name
        this.groupName = '';
        this.redStyle = {}
        if (newSelectedGroups.length > currentLength) {
            // This group is in the array of new selected
            // groups. Show it's name in the combo box.
            this.groupName = newSelectedGroups[groupIndex].name;
            this.redStyle = newSelectedGroups[groupIndex].id == -1 ? { border: '1px solid red' } : {};
        }
    };

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


export default connect()(VoterGroupNewRow)