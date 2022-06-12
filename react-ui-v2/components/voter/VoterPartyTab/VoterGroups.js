import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import ModalWindow from '../../global/ModalWindow';

import VoterGroupItemLi from './VoterGroupItemLi';
import VoterGroupNewRow from './VoterGroupNewRow';
import VoterGroupItemRow from './VoterGroupItemRow';


class VoterGroups extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.newGroupButtonText = "הוספה לקבוצה";
        this.saveButtonText = "שמירה";

        this.mainBtnStyle = {marginBottom:10};
        this.ulListStyle = { listStyleType: 'none', padding: '0' };

        this.setDirtyTarget = "elections.voter.political_party.shas_groups";
    }

    getGroupNameById(groupId) {
        var groupList = this.props.voterGroups;
        let groupIndex = -1;
        let groupName = '';

        groupIndex = groupList.findIndex(groupItem => groupItem.id == groupId);
        if ( -1 == groupIndex ) {
            return '';
        } else {
            groupName = groupList[groupIndex].name;
            return groupName;
        }
    }

    getGroupParentId(groupId) {
        var groupList = this.props.voterGroups;
        let groupIndex = -1;
        let groupParentId = -1;

        groupIndex = groupList.findIndex(groupItem => groupItem.id == groupId);
        if ( -1 == groupIndex ) {
            return -1;
        } else {
            groupParentId = groupList[groupIndex].parent_id;
            return groupParentId;
        }
    }

    editVoterGroupInState() {
        var itemSelectedGroups = this.props.editSelectedGroups;

        let newGroupId = itemSelectedGroups[itemSelectedGroups.length - 1].id;
        let newGroupName = this.getGroupNameById(newGroupId);
        let newGroupParentId = this.getGroupParentId(newGroupId);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_EDIT_GROUP_IN_STATE,
                             newGroupId: newGroupId, newGroupName: newGroupName,
                             newGroupParentId: newGroupParentId
                            });

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        // Hiding the edit Modal Dialog of a group
        this.hideItemGroupModalDialog();
    }

    /**
     * This function hides the editing modal dialog of an item
     */
    hideItemGroupModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_HIDE_ITEM_GROUP_MODAL_DIALOG});
    }

    deleteGroupFromState() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_DELETE_GROUP_FROM_STATE});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        this.hideDeleteModalDialog();
    }

    /**
     * This function hides the deleting modal dialog of an item
     */
    hideDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_DELETE_HIDE_MODAL_DIALOG});
    }

    addVoterGroupToState() {
        var newSelectedGroups = this.props.newSelectedGroups;

        let newGroupId = newSelectedGroups[newSelectedGroups.length - 1].id;
        let newGroupName = this.getGroupNameById(newGroupId);
        let newGroupParentId = this.getGroupParentId(newGroupId);

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_ADD_GROUP_TO_STATE,
                             newGroupId: newGroupId, newGroupName: newGroupName,
                             newGroupParentId: newGroupParentId});

        this.props.dispatch({type:SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget});

        this.hideNewGroupModalDialog();
    }

    saveVoterGroups(e) {
        // Prevent page refresh
        e.preventDefault();

        let voterInGroups = this.props.voterInGroups;
        let voterKey = this.props.router.params.voterKey;
        let groupsData = [];
        for (let groupIndex = 0; groupIndex < voterInGroups.length; groupIndex++) {
            groupsData.push({
                voter_group_new_id: voterInGroups[groupIndex].id,
                voter_in_group_id: voterInGroups[groupIndex].voters_in_groups_id || null
            });
        }

        VoterActions.saveVoterGroups(this.props.dispatch, voterKey, groupsData);
    }

    /**
     * This function shows the modal
     * dialog for adding a group to
     * a voter.
     */
    enableAddingGroups() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_SHOW_NEW_GROUP_MODAL_DIALOG});
    }

    /**
     * This function loads children
     * of a group.
     *
     * @param groupId - The group id
     * @returns Array - An object of a group
     */
    loadGroupChildren(groupId) {
        var voterGroups = this.props.voterGroups;

        return voterGroups.filter(voterGroupItem => voterGroupItem.parent_id == groupId);
    }

    /**
     * This function loads all the
     * group whose parent_id=0
     *
     * @returns array - Array of the groups whose parent_id=0
     */
    loadGroupsWithNoParent() {
        var voterGroups = this.props.voterGroups;

        var groupsWithNoParent = voterGroups.filter(voterGroupItem => voterGroupItem.parent_id == 0);

        return groupsWithNoParent;
    }

    /**
     * This function builds the Modal
     * for editing a row in the voter's
     * group table.
     *
     * @returns {XML}
     */
    selectItemGroups() {
        var itemSelectedGroups = this.props.editSelectedGroups;
        var voterGroups = this.props.voterGroups;
        var that = this;
        var lastGroupChildren = [];
        var groupsWithNoParent = this.loadGroupsWithNoParent();
        if ( 0 == itemSelectedGroups.length || (itemSelectedGroups[0] && itemSelectedGroups[0].id == -1)) {
            // If no new group has been selected
            // then render a component with group
            // who have no parent (whose parent_id=0)
            return (
                <ul style={this.ulListStyle}>
                    <VoterGroupItemRow itemSelectedGroups={itemSelectedGroups}
                                       selectedGroupIndex={0}
                                       currentGroups={groupsWithNoParent}
                                       voterGroups={this.props.voterGroups}
                    />
                </ul>
            )
        } else {
            let groupsRows = itemSelectedGroups.map( function(groupItem, Index) {
                let currentGroups = [];

                if ( 0 == Index ) {
                    currentGroups = that.loadGroupsWithNoParent();
                } else {
                    currentGroups = that.loadGroupChildren(itemSelectedGroups[Index - 1].id);
                }

                return (
                    <VoterGroupItemRow key={Index} itemSelectedGroups={itemSelectedGroups}
                                       selectedGroupIndex={Index}
                                       currentGroups={currentGroups}
                                       voterGroups={that.props.voterGroups}
                    />
                )
            });

            if ( itemSelectedGroups[ itemSelectedGroups.length - 1].id > 0) {
                lastGroupChildren = this.loadGroupChildren(itemSelectedGroups[ itemSelectedGroups.length - 1].id);
            }

            let nextSelectedGroupsIndex = itemSelectedGroups.length;

            if ( lastGroupChildren.length > 0 ) {
                // If the last group in the array of
                // newSelectedGroups has children,
                // then load component which contains
                // the last group's children
                return (
                    <ul style={this.ulListStyle}>
                        {groupsRows}
                        <VoterGroupItemRow key={nextSelectedGroupsIndex}
                                           itemSelectedGroups={itemSelectedGroups}
                                           selectedGroupIndex={nextSelectedGroupsIndex}
                                           currentGroups={lastGroupChildren}
                                           voterGroups={this.props.voterGroups}
                        />
                    </ul>
                )
            } else {
                // If we got here, then the
                // last group in the array of
                // newSelectedGroups has no children.
                return (
                    <ul style={this.ulListStyle}>
                        {groupsRows}
                    </ul>
                )
            }
        }
    }

    /**
     * This function builds the Modal
     * for adding a row to the voter's
     * group table.
     *
     * @returns {XML}
     */
    selectGroups() {
        var newSelectedGroups = this.props.newSelectedGroups;
        var voterGroups = this.props.voterGroups;
        var that = this;
        var lastGroupChildren = [];
        var groupsWithNoParent = this.loadGroupsWithNoParent();
        if (  newSelectedGroups.length == 0 || (newSelectedGroups[0]&& newSelectedGroups[0].id == -1)) {
            // If no new group has been selected
            // then render a component with group
            // who have no parent (whose parent_id=0)
            return (
                <ul style={this.ulListStyle}>
                    <VoterGroupNewRow newSelectedGroups={this.props.newSelectedGroups}
                        groupIndex={0} currentGroups={groupsWithNoParent}
                        voterGroups={this.props.voterGroups}
                    />
                </ul>
            )
        } else {
            let groupsRows = newSelectedGroups.map( function(groupItem, Index) {
                let currentGroups = [];

                if (Index==0 ) {
                    currentGroups = that.loadGroupsWithNoParent();
                } else {
                    currentGroups = that.loadGroupChildren(newSelectedGroups[Index - 1].id);
                }

                return (
                    <VoterGroupNewRow key={Index} newSelectedGroups={that.props.newSelectedGroups}
                                      groupIndex={Index} currentGroups={currentGroups}
                                      voterGroups={that.props.voterGroups}
                    />
                )
            });

            if ( newSelectedGroups[ newSelectedGroups.length - 1].id > 0) {
                lastGroupChildren = this.loadGroupChildren(newSelectedGroups[ newSelectedGroups.length - 1].id);
            }

            let nextSelectedGroupsIndex = newSelectedGroups.length;

            if ( lastGroupChildren.length > 0 ) {
                // If the last group in the array of
                // newSelectedGroups has children,
                // then load component which contains
                // the last group's children
                return (
                    <ul style={this.ulListStyle}>
                        {groupsRows}
                        <VoterGroupNewRow key={nextSelectedGroupsIndex}
                                          newSelectedGroups={this.props.newSelectedGroups}
                                          groupIndex={nextSelectedGroupsIndex}
                                          currentGroups={lastGroupChildren}
                                          voterGroups={this.props.voterGroups}
                        />
                    </ul>
                )
            } else {
                // If we got here, then the
                // last group in the array of
                // newSelectedGroups has no children.
                return (
                    <ul style={this.ulListStyle}>
                        {groupsRows}
                    </ul>
                )
            }
        }
    }

    /**
     * This function hides the adding modal dialog
     */
    hideNewGroupModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_GROUPS_HIDE_NEW_GROUP_MODAL_DIALOG});
    }

    renderGroupsData() {
        var editGroupIndex = this.props.editGroupIndex;
        var editingMode = false;
        var enableEditing = false;
        var voterGroups = this.props.voterGroups;
        var currentUser = this.props.currentUser;

        this.groupsRows = this.props.voterInGroups.map(function (groupItem, index) {
            // Checking if the group item is to
            // be edited by comparing the current
            // group item's index to editing group index
            // which specifies the group item's
            // index to be edited
            if (index == editGroupIndex) {
                editingMode = true;
            } else { // group item is not to be edited
                editingMode = false;

                if ( editGroupIndex > -1 ) {
                    // If another group item is
                    // being edited, then
                    // disable the editing
                    // of the current group item
                    enableEditing = false;
                } else {
                    // No group item is to be edited,
                    // then enable editing the current
                    // group item
                    enableEditing = true;
                }
            }

            return <VoterGroupItemLi key={index}
                                     groupIndex={index}
                                     item={groupItem}
                                     voterGroups={voterGroups}
                                     editing_mode={editingMode}
                                     enable_editing={enableEditing}
                                     currentUser={currentUser}
            />
        });

        return (
            <tbody>
                {this.groupsRows}
            </tbody>
        );
    }

    /**
     * This function renders the add button.
     *
     * @returns {XML}
     */
    renderAddButton() {
        var displayButton = false;

        // If the user has an edit + add group permissions,
        // then display the button
        if ( this.props.currentUser.admin ||
            (this.props.currentUser.permissions['elections.voter.political_party.shas_groups.add'] == true &&
             this.props.currentUser.permissions['elections.voter.political_party.shas_groups.edit'] == true) ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        <button className="btn btn-primary mainBtn pull-left" style={this.mainBtnStyle} 
                                onClick={this.enableAddingGroups.bind(this)}>
                            <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                            {this.newGroupButtonText}
                        </button>
                    </div>
                </div>
            );
        }
    }

    updateCollapseStatus(container) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_COLLAPSE_CHANGE,
            container: container});
    }

    renderSaveButton() {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.political_party.shas_groups.edit'] == true ) {
            displayButton = true;
        }

        if ( displayButton ) {
            return (
                <div className="col-sm-12">
                    <div className="form-group">
                        <div className="">
                            <button className="btn btn-primary saveChanges"
                                    onClick={this.saveVoterGroups.bind(this)}
                                    disabled={!this.groupHasChanged || this.props.savingChanges}>
                                {this.saveButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.groupHasChanged = false;
        } else {
            this.groupHasChanged = true;
        }
    }

    render() {

        this.checkAnyChanges();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.partyGroups}>
                <div className="row CollapseContent">
                    {this.renderAddButton()}
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        <table className="table table-striped table-bordered">
                            {this.renderGroupsData()}
                        </table>
                    </div>
                </div>
                    {this.renderSaveButton()}

                    <div className="col-md-12 no-padding">
                        <ModalWindow show={this.props.showNewGroupsModalDialog}
                                     buttonOk={this.addVoterGroupToState.bind(this)}
                                     buttonCancel={this.hideNewGroupModalDialog.bind(this)}
                                     disabledOkStatus={this.props.disabledGroupsModalButtonOk}
                                     title={this.props.newGroupsModalHeader} style={{zIndex: '9001'}}>
                            <div>{this.selectGroups()}</div>
                        </ModalWindow>
                    </div>

                    <div className="col-md-12 no-padding">
                        <ModalWindow show={this.props.showDeleteGroupModalDialog}
                                     buttonOk={this.deleteGroupFromState.bind(this)}
                                     buttonCancel={this.hideDeleteModalDialog.bind(this)}
                                     title={this.props.deleteModalGroupHeader} style={{zIndex: '9001'}}>
                            <div>{this.props.deleteConfirmText}</div>
                        </ModalWindow>
                    </div>

                    <div className="col-md-12 no-padding">
                        <ModalWindow show={this.props.showItemGroupsModalDialog}
                                     buttonOk={this.editVoterGroupInState.bind(this)}
                                     buttonCancel={this.hideItemGroupModalDialog.bind(this)}
                                     disabledOkStatus={this.props.disabledGroupsModalButtonOk}
                                     title={this.props.editGroupModalHeader} style={{zIndex: '9001'}}>
                            <div>{this.selectItemGroups()}</div>
                        </ModalWindow>
                    </div>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        voterGroups: state.voters.voterScreen.voterGroups,
        newSelectedGroups: state.voters.voterScreen.newSelectedGroups,
        disabledGroupsModalButtonOk: state.voters.voterScreen.disabledGroupsButtonOk,
        showNewGroupsModalDialog: state.voters.voterScreen.showNewGroupsModalDialog,
        newGroupsModalHeader: state.voters.voterScreen.newGroupsModalHeader,
        newGroupsModalContent: state.voters.voterScreen.newGroupsModalContent,
        voterInGroups: state.voters.voterScreen.voterInGroups,
        showDeleteGroupModalDialog: state.voters.voterScreen.showDeleteGroupModalDialog,
        deleteModalGroupHeader: state.voters.voterScreen.deleteModalGroupHeader,
        deleteConfirmText: state.voters.voterScreen.deleteConfirmText,
        deleteGroupIndex: state.voters.voterScreen.deleteGroupIndex,
        loadedVoterGroups: state.voters.voterScreen.loadedVoterGroups,
        loadedAllGroups: state.voters.voterScreen.loadedAllGroups,
        showItemGroupsModalDialog: state.voters.voterScreen.showItemGroupsModalDialog,
        editGroupModalHeader: state.voters.voterScreen.editGroupModalHeader,
        editGroupIndex: state.voters.voterScreen.editGroupIndex,
        editSelectedGroups: state.voters.voterScreen.editSelectedGroups,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterGroups));