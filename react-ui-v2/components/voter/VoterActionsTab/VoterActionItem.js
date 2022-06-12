import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux'

import Combo from '../../global/Combo';

import {dateTimeReversePrint} from '../../../libs/globalFunctions';

import * as VoterActions from '../../../actions/VoterActions';
import * as GlobalActions from '../../../actions/GlobalActions';


class VoterActionItem  extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.directions = [ {id: 0, name: "נכנסת"}, {id: 1, name: "יוצאת"} ];

        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }

    editAction() {
        if ( !this.validInputs ) {
            return;
        }

        let voterKey = this.props.router.params.voterKey;
        let conversation_direction = "";

        if ( this.props.item.conversation_direction == -1 || this.props.item.conversation_direction == null || this.props.item.conversation_direction==undefined ||
            this.props.item.conversation_direction.length == 0) {
            conversation_direction = null;
        } else {
            conversation_direction = this.props.item.conversation_direction;
        }

        let editActionFields = {
            action_type: this.props.item.action_type,
            action_topic_id: this.props.item.action_topic_id,
            conversation_direction: conversation_direction,
            conversation_with_other: this.props.item.conversation_with_other,
            action_date: this.props.item.action_date,
            description: this.props.item.description,
            action_status_id: this.props.item.action_status_id
        };

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ACTION_EDIT_DISABLE_EDITING});

        VoterActions.editAction(this.props.dispatch, voterKey, this.props.item.key, editActionFields);
    }

    showDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_ACTION_SHOW_DELETE_MODAL_DIALOG,
                             actionIndex: this.props.actionIndex, actionKey: this.props.item.key});
    }


    showEditActionModalDialog() {
        var actionModalHeader = "עריכת פעולה עבור התושב ";
        var actionData = {};

        actionModalHeader += this.props.first_name + ' ' + this.props.last_name;

        actionData = {
            key: this.props.item.key,
            action_type: this.props.item.action_type_name,
            action_topic: this.props.item.action_topic_name,
            action_status: this.props.item.action_status_name,
            action_direction: this.props.item.action_direction,
            action_date: this.props.item.action_date,
            description: this.props.item.description,
            conversation_with_other: this.props.item.conversation_with_other,
            action_type_id: this.props.item.action_type,
            action_topic_id: this.props.item.action_topic_id,
            action_status_id: this.props.item.action_status_id,
            conversation_direction: this.props.item.conversation_direction
        };


        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
                             actionData: actionData, entityActionTopicsList: this.props.item.topics_list});
    }

    initVariables() {
        this.allowRequestShow = false;
        this.allowEditAction = false;
        this.allowDeleteAction = false;
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.allowRequestShow = true;

            this.allowEditAction = true;
            this.allowDeleteAction = true;

            return;
        }

        if (this.props.currentUser.permissions['elections.voter.requests.show'] == true) {
            this.allowRequestShow = true;
        }

        if (this.props.currentUser.permissions['elections.voter.actions.edit'] == true) {
            this.allowEditAction = true;
        }

        if (this.props.currentUser.permissions['elections.voter.actions.delete'] == true) {
            this.allowDeleteAction = true;
        }
    }

    /**
     * This function renders the buttons column
     * of a row that is not being edited.
     *
     * @returns {XML}
     */
    renderButtons() {
        if ( !this.props.hasEditableRow ) {
            return;
        }

        // Only the system user who created the action can edit it.
        if ( this.props.item.user_create_key != this.props.currentUser.key ) {
            return <td>{'\u00A0'}</td>;
        }

        // An action which belongs to request should
        // not be edited
        if ( this.props.item.request_key != "null" ) {
            return <td>{'\u00A0'}</td>;
        }


        if ( this.allowEditAction && this.allowDeleteAction ) {
            return (
                <td>
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-success btn-xs"
                                title={this.tooltip.editTitle}
                                onClick={this.showEditActionModalDialog.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                        {'\u00A0'}
                        <button type="button" className="btn btn-danger btn-xs"
                                title={this.tooltip.deleteTitle}
                                onClick={this.showDeleteModalDialog.bind(this)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                    </span>
                </td>
            );
        } else if ( this.allowEditAction ) {
            return (
                <td>
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-success btn-xs"
                                title={this.tooltip.editTitle}
                                onClick={this.showEditActionModalDialog.bind(this)}>
                            <i className="fa fa-pencil-square-o"/>
                        </button>
                    </span>
                </td>
            );
        } else if ( this.allowDeleteAction ) {
            return (
                <td>
                    <span className="pull-left edit-buttons">
                        <button type="button" className="btn btn-danger btn-xs"
                                title={this.tooltip.deleteTitle}
                                onClick={this.showDeleteModalDialog.bind(this)}>
                            <i className="fa fa-trash-o"/>
                        </button>
                    </span>
                </td>
            );
        } else {
            return <td>{'\u00A0'}</td>;
        }
    }

    /**
     * This function renders an action row
     *
     * @returns {XML}
     */
    renderAction() {
        let tdConversationWithOther = null;
        let td_userFullName = this.props.item.first_name + ' ' + this.props.item.last_name;
        let td_conversation_direction = '';
        let requestLinkTo = '/crm/requests/' + this.props.item.request_key;
        let td_request = "";

        if ( this.props.item.conversation_with_other ) {
            tdConversationWithOther = this.props.item.conversation_with_other;
        } else {
            tdConversationWithOther = '';
        }

        switch (this.props.item.conversation_direction) {
            case 0:
                td_conversation_direction = 'שיחה נכנסת';
                break;

            case 1:
                td_conversation_direction = 'שיחה יוצאת';
                break;

            default:
                td_conversation_direction = "";
                break;
        }

        if ( 'null' == this.props.item.request_key ) {
            td_request = '\u00A0';
        } else {
            if ( this.allowRequestShow ) {
                td_request = <Link to={requestLinkTo}>{this.props.item.request_key}</Link>
            } else {
                td_request = this.props.item.request_key;
            }
        }


        return(
            <tr key={this.props.key}>
                <td>{this.props.item.action_type_name}</td>
                <td>{td_request}</td>
                <td>{this.props.item.action_topic_name}</td>
                <td>{this.props.item.action_status_name}</td>
                <td>{td_conversation_direction}</td>
                <td>{dateTimeReversePrint(this.props.item.action_date, true, true)}</td>
                <td>{this.props.item.description}</td>
                <td>{tdConversationWithOther}</td>
                <td>{td_userFullName}</td>
                {this.renderButtons()}
            </tr>
        );
    }

    render() {
		
        this.initVariables();

        this.checkPermissions();

        return this.renderAction();
    }
}


function mapStateToProps(state) {
    return {
        first_name: state.voters.voterDetails.first_name,
        last_name: state.voters.voterDetails.last_name,
        actionTypesList: state.voters.voterScreen.actionTypesList,
        actionStatusesList: state.voters.voterScreen.actionStatusesList,
        actionTopicsList: state.voters.voterScreen.actionTopicsList,
        voterActionTopicsList: state.voters.voterScreen.voterActionTopicsList,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterActionItem));