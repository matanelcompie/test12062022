import React from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux'
import moment from 'moment';

import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
import AddEditActionModal from '../../global/AddEditActionModal';

import VoterActionItem from './VoterActionItem';

import {parseDateToPicker} from '../../../libs/globalFunctions';

import * as VoterActions from '../../../actions/VoterActions';
import * as GlobalActions from '../../../actions/GlobalActions';


/**
 * This class is a lower component which
 * is displayed on clicking lower tab
 * actions.
 * This component displays a table with
 * actions related to the voter.
 */
class VoterActionsComponent  extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.panelTitle = "פעולות";

        this.newActionButtonText = "פעולה חדשה";

        this.directions = [ {id: 0, name: "נכנסת"}, {id: 1, name: "יוצאת"} ];

        this.modalConfirmText = "האם אתה בטוח ?";

        this.tooltip = {
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };

        this.entityTypes = {
            voter: 0,
            request: 1
        };
    }

    componentWillMount() {
        VoterActions.getAllActionsTypes(this.props.dispatch);
        VoterActions.getAllActionsStatuses(this.props.dispatch);
        VoterActions.getAllActionsTopics(this.props.dispatch);
    }

    deleteAction() {
        var voterActions = this.props.voterActions;
        var deleteActionIndex = this.props.deleteActionIndex;
        var actionKey = '';
        var voterKey = this.props.router.params.voterKey;

        actionKey = voterActions[deleteActionIndex].key;

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ACTION_HIDE_DELETE_MODAL_DIALOG});

        VoterActions.deleteAction(this.props.dispatch, voterKey, actionKey);
    }

    /**
     * This function shows the AddEditAction Modal
     * for creating a new action for a voter.
     *
     */
    showNewActionModalDialog() {
        var actionModalHeader = "יצירת פעולה עבור התושב ";
        var actionDate = ""; // Default action date
        var actionData = {};

        actionDate = parseDateToPicker(new Date()); // Current data and time
        actionDate = moment(actionDate).format('YYYY-MM-DD HH:mm:ss');

        actionModalHeader += this.props.first_name + ' ' + this.props.last_name;

        actionData = {
            key: null,
            action_type: '',
            action_topic: '',
            action_status: '',
            action_direction: '',
            action_date: actionDate,
            description: '',
            conversation_with_other: '',
            action_type_id: 0,
            action_topic_id: 0,
            action_status_id: 0,
            conversation_direction: null
        };

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
                             actionData: actionData, entityActionTopicsList: []});
    }

    hideDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ACTION_HIDE_DELETE_MODAL_DIALOG});
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.actionsBlockClass = "tab-content tabContnt hidden";
        this.allowRequestShow = false;

        this.allowAddAction = false;
        this.allowEditAction = false;
        this.allowDeleteAction = false;
    }

    /**
     * This function checks if the user
     * can edit any row.
     *
     * @returns {boolean}
     */
    checkEditableRows() {
        var voterActions = this.props.voterActions;
        var actionIndex = -1;

        // If the user doesn't have permissions of
        // edit & delete, then he can't edit any row.
        if ( !this.allowEditAction && !this.allowDeleteAction ) {
            return false;
        }

        // Loops through the actions table.
        // If no action was created by the user, then he can't edit any row.
        // If there is 1 action that was created by the user, then he can edit
        // at least 1 of these rows.
        for ( actionIndex = 0; actionIndex < voterActions.length; actionIndex++ ) {
            if ( voterActions[actionIndex].user_create_key == this.props.currentUser.key ) {
                return true;
            }
        }

        return false;
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.actionsBlockClass = "tab-content tabContnt";

            this.allowAddAction = true;
            this.allowEditAction = true;
            this.allowDeleteAction = true;

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.actions'] == true) {
            this.actionsBlockClass = "tab-content tabContnt";
        }

        if (this.props.currentUser.permissions['elections.voter.actions.add'] == true) {
            this.allowAddAction = true;
        }

        if (this.props.currentUser.permissions['elections.voter.actions.edit'] == true) {
            this.allowEditAction = true;
        }

        if (this.props.currentUser.permissions['elections.voter.actions.delete'] == true) {
            this.allowDeleteAction = true;
        }
    }

    /**
     * This functions loads all the topice
     * related to action type.
     *
     * @param actionTypeId
     * @returns {Array}
     */
    getVoterActionItemTopics(actionTypeId) {
        let actionTopicsList = this.props.actionTopicsList;
        let itemTopicsList = [];

        itemTopicsList = actionTopicsList.filter(topicItem => topicItem.action_type_id == actionTypeId);

        return itemTopicsList;
    }

    /**
     *  This function renders the voter's
     *  actions array in a table.
     */
    renderActions() {
        var editActionIndex = this.props.editActionIndex;
        var editingMode = false;
        var enableEditing = false;
        var currentUserKey = this.props.currentUser.key;
        var that = this;

        this.actionsRows = this.props.voterActions.map(function (voterActionItem, index) {
            switch ( voterActionItem.conversation_direction ) {
                case 0:
                    voterActionItem.action_direction = "נכנסת";
                    break;

                case 1:
                    voterActionItem.action_direction = "יוצאת";
                    break;

                default:
                    voterActionItem.action_direction = "";
                    break;
            }

            voterActionItem.topics_list = that.getVoterActionItemTopics(voterActionItem.action_type);

            return <VoterActionItem key={voterActionItem.id} actionIndex={index} item={voterActionItem}
                                    hasEditableRow={that.hasEditableRow}/>
        });

        return (
            <tbody>
                {this.actionsRows}
            </tbody>
        );
    }

    /**
     * This function displays the button that
     * triggers the AddEditAction Modal for
     * creating a new action.
     *
     * @returns {XML}
     */
    renderNewActionButton() {
        if ( this.allowAddAction ) {
            return (
                <button className="btn btn-primary mainBtn pull-left"
                        onClick={this.showNewActionModalDialog.bind(this)}>
                    <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                    {this.newActionButtonText}
                </button>
            );
        }
    }

    /**
     * This function renders the AddEditAction Modal
     * only if the user has Add & Edit action permission.
     *
     * @returns {XML}
     */
    renderAddEditActionModal() {
        // Render the Modal only if the user has Add or Edit action permissions
        if ( this.allowAddAction || this.allowEditAction ) {
            return (
                <AddEditActionModal entity_type={this.entityTypes.voter}
                                    action_entity_key={this.props.router.params.voterKey}
                                    actionTypesList={this.props.actionTypesList}
                                    actionStatusesList={this.props.actionStatusesList}
                                    actionTopicsList={this.props.actionTopicsList}/>
            );
        }
    }

    /**
     * The function checks if the user
     * can edit any row.
     * If he can't, then the buttopns column
     * will not be displayed.
     *
     * @returns {XML}
     */
    renderLastHeaderColumn() {
        if ( this.hasEditableRow ) {
            return  <th>{'\u00A0'}</th>;
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        // This variable indicates if
        // there is a row in actions
        // table which is editable.
        // If not, a column in the table
        // will not be displayed
        this.hasEditableRow = this.checkEditableRows();

        return (
            <div className={this.actionsBlockClass} id="tabActions" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                    <div className="containerStrip">
                        <div className="row panelTitle">
                            {this.panelTitle}
                            {this.renderNewActionButton()}
                        </div>

                        <div className="row panelContent">
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>סוג</th>
                                    <th>פניה</th>
                                    <th>נושא שיחה</th>
                                    <th>מצב</th>
                                    <th>כיוון</th>
                                    <th>מועד</th>
                                    <th>פירוט</th>
                                    <th>עם מי</th>
                                    <th>משתמש</th>
                                    {this.renderLastHeaderColumn()}
                                </tr>
                                </thead>

                                {this.renderActions()}
                            </table>
                        </div>
                    </div>
                </div>

                <ModalWindow show={this.props.showDeleteActionModalDialog}
                             buttonOk={this.deleteAction.bind(this)}
                             buttonCancel={this.hideDeleteModalDialog.bind(this)}
                             buttonX={this.hideDeleteModalDialog.bind(this)}
                             title={this.props.deleteActionModalHeader} style={{zIndex: '9001'}}>
                    <div>{this.modalConfirmText}</div>
                </ModalWindow>

                {this.renderAddEditActionModal()}
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        first_name: state.voters.voterDetails.first_name,
        last_name: state.voters.voterDetails.last_name,
        voterActions: state.voters.voterScreen.actions,
        actionTypesList: state.voters.voterScreen.actionTypesList,
        actionStatusesList: state.voters.voterScreen.actionStatusesList,
        actionTopicsList: state.voters.voterScreen.actionTopicsList,
        voterActionTopicsList: state.voters.voterScreen.voterActionTopicsList,
        editActionIndex: state.voters.voterScreen.editActionIndex,
        savingVoterData: state.voters.voterScreen.savingVoterData,
        showDeleteActionModalDialog: state.voters.voterScreen.showDeleteActionModalDialog,
        deleteActionModalHeader: state.voters.voterScreen.deleteActionModalHeader,
        deleteActionIndex: state.voters.voterScreen.deleteActionIndex,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterActionsComponent));