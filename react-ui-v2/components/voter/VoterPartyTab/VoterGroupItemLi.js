import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';
import Combo from '../../global/Combo';

class VoterGroupItemLi extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
        };
    }

    showEditModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_SHOW_ITEM_GROUP_MODAL_DIALOG,
            editGroupIndex: this.props.groupIndex
        });
    }

    showDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_DELETE_SHOW_MODAL_DIALOG,
            deleteGroupIndex: this.props.groupIndex
        });
    }

    getGroupId(groupName) {
        let groupList = this.props.currentGroups;
        let groupIndex = -1;
        let groupId = 0;

        groupIndex = groupList.findIndex(groupItem => groupItem.name == groupName);
        if (-1 == groupIndex) {
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
        var selectedGroupId = 0;

        // dispatch the new (group id, group name) to array newSelectedGroups
        // and change it's array length
        selectedGroupId = this.getGroupId(selectedGroupName);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_ADD_TO_NEW_SELECTED_GROUPS,
                             groupIndex: groupIndex, selectedGroupId: selectedGroupId, selectedGroupName: selectedGroupName});
    }

    /**
     * This function gets ancestors
     * of a group item seperated by
     * '->'
     *
     * @returns String - String with the group path of
     *                   a group with it's ancestors
     *                   seperated by '->'
     *
     */
    displayGroups() {
        var groupItem = this.props.item;
        var selectedGroups = [];

        selectedGroups = groupItem.selectedGroups.map(function (selectedGroupsItem, Index) {
            return selectedGroupsItem.name;
        });

        if (0 == selectedGroups.length) {
            return '';
        } else {
            let selectedGroupsNamesPath = selectedGroups.join('->');
            return selectedGroupsNamesPath;
        }
    }

    /**
     * This function renders the buttons
     * of edit & delete group.
     *
     * The user must have an edit permission
     * and delete permission for deleting a
     * group.
     *
     * @returns {XML}
     */
    renderNonEditingModeButtons() {
        if ( this.allowEditGroup ) {
            // User must have an edit group permission
            // for deleting a group.
            if ( this.allowDeleteGroup ) {
                return (
                    <span className="pull-left edit-buttons">
                    <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                            onClick={this.showEditModalDialog.bind(this)}>
                        <i className="fa fa-pencil-square-o"/>
                    </button>
                        {'\u00A0'}
                        <button type="button" className="btn btn-danger btn-xs" title={this.tooltip.deleteTitle}
                                onClick={this.showDeleteModalDialog.bind(this)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                </span>
                );
            } else {
                // The user doesn't have a delete permission and has
                // an edit group permission.
                return (
                    <button type="button" className="btn btn-success btn-xs" title={this.tooltip.editTitle}
                            onClick={this.showEditModalDialog.bind(this)}>
                        <i className="fa fa-pencil-square-o"/>
                    </button>
                );
            }
        } else {
            // the user doesn't have an edit permission
            return '\u00A0';
        }
    }

    /**
     * This function returns the row
     * which is not edited.
     *
     * @returns {XML}
     */
    renderNonEditingModeRow() {
        if (this.props.enable_editing) {
            return (
                <tr>
                    <td>{this.displayGroups()}</td>
                    <td>{this.renderNonEditingModeButtons()}</td>
                </tr>
            );
        } else {
            return (
                <tr>
                    <td>{this.displayGroups()}</td>
                    <td>{'\u00A0'}</td>
                </tr>
            );
        }
    }

    renderEditingModeRow() {
        return (
                <tr>
                    <td>{this.displayGroups()}</td>
                    <td>
                        <span className="pull-left edit-buttons">
                            <button type="button" className={this.editButtonClass} title={this.tooltip.editTitle}
                                    onClick={this.showEditModalDialog.bind(this)}>
                                <i className="fa fa-pencil-square-o"/>
                            </button>
                            {'\u00A0'}
                            <button type="button" className={this.deleteButtonClass} title={this.tooltip.deleteTitle}
                                    onClick={this.showDeleteModalDialog.bind(this)}>
                                <i className="fa fa-trash-o"/>
                            </button>
                        </span>
                    </td>
                </tr>
                )
    }

    initVariables() {
        this.allowEditGroup = false;
        this.allowDeleteGroup = false;
    }

    checkPermissions() {
        if (this.props.currentUser.admin) {
            this.allowEditGroup = true;
            this.allowDeleteGroup = true;

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_groups.edit'] == true) {
            this.allowEditGroup = true;
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_groups.delete'] == true) {
            this.allowDeleteGroup = true;
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        let editing_mode = this.props.editing_mode;

        if (editing_mode) {
            return this.renderEditingModeRow();
        } else {
            return this.renderNonEditingModeRow();
        }
    }
}


export default connect()(VoterGroupItemLi);