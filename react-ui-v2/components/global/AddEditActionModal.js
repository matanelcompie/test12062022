import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import ReactWidgets from 'react-widgets';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';

import ModalWindow from './ModalWindow';
import Combo from './Combo';

import {parseDateToPicker, parseDateFromPicker} from '../../libs/globalFunctions';

import * as GlobalActions from '../../actions/GlobalActions';
import * as CrmActions from '../../actions/CrmActions';
import * as VoterActions from '../../actions/VoterActions';
import ModelUpdateCloseDateRequest from '../crm/Requests/ModelUpdateCloseDateRequest';


/**
 * This component is used to add/edit actions of
 * the entity types: voter and request.
 *
 * The component receives the following parameters:
 *    entity_type - The entity type
 *                  0 - voter
 *                  1 - request
 *    action_entity_key - The entity key (request key or voter key)
 *    actionTypesList - The actions types of the entity
 *    actionStatusesList - The action statuses of the entity
 *    actionTopicsList - The action topics of the entity
 *
 *    Example:
 *            <AddEditActionModal entity_type={this.entityTypes.voter}
 *                                action_entity_key={this.props.router.params.voterKey}
 *                                actionTypesList={this.props.actionTypesList}
 *                                actionStatusesList={this.props.actionStatusesList}
 *                                actionTopicsList={this.props.actionTopicsList}/>
 *
 *  When showin this Modal component you should pass
 *  those parameters:
 *     actionModalHeader - The Modal header
 *     actionData - The action data with it's fields
 *     entityActionTopicsList - The entity topics associated to the entity action type
 *
 *     Example of editing an action:
 *     this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
 *                            actionData: actionData, entityActionTopicsList: this.props.item.topics_list});
 *
 *     Example of actionData parameter when editing an action:
 *     actionData = {
 *           key: this.props.item.key,
 *           action_type: this.props.item.action_type_name,
 *           action_topic: this.props.item.action_topic_name,
 *           action_status: this.props.item.action_status_name,
 *           action_direction: this.props.item.action_direction,
 *           action_date: this.props.item.action_date,
 *           description: this.props.item.description,
 *           conversation_with_other: this.props.item.conversation_with_other,
 *           action_type_id: this.props.item.action_type,
 *           action_topic_id: this.props.item.action_topic_id,
 *           action_status_id: this.props.item.action_status_id,
 *           conversation_direction: this.props.item.conversation_direction
        };
 *
 *    Example of adding an action:
 *    this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG, actionModalHeader: actionModalHeader,
 *                            actionData: actionData, entityActionTopicsList: []});
 *
 *    Example of actionData parameter when adding an action
 *    actionData = {
 *           key: null,
 *           action_type: '',
 *           action_topic: '',
 *           action_status: '',
 *           action_direction: '',
 *           action_date: '',
 *           description: '',
 *           conversation_with_other: '',
 *           action_type_id: 0,
 *           action_topic_id: 0,
 *           action_status_id: 0,
 *           conversation_direction: ''
 *    };
 */
class AddEditActionModal extends React.Component {
    constructor(props) {
        super(props);

        momentLocalizer(moment);
        this.initConstants();

        this.state= {
            'openModalUpdateEndDate':null
        }
    }

    initConstants() {
        this.labels = {
            type: "סוג",
            status: "מצב",
            topic: "נושא",
            direction: "כיוון הפנייה",
            conversationWith: "עם מי שוחחתי",
            details: "פירוט"
        };

        this.directions = [ {id: 0, name: "נכנסת"}, {id: 1, name: "יוצאת"} ];

        this.buttonOkText = "שמירה";
        this.buttonCancelText = "סגור";

        this.entityTypes = {
            voter: 0,
            request: 1
        };
    }

    saveEntityAction(e) {
        if ( !this.validInputs ) {
            return;
        }

        let actionDataFields = {
            action_type: this.props.actionData.action_type_id,
            action_topic_id: this.props.actionData.action_topic_id,
            conversation_direction: this.props.actionData.conversation_direction,
            conversation_with_other: this.props.actionData.conversation_with_other,
            action_date: this.props.actionData.action_date,
            description: this.props.actionData.description,
            action_status_id: this.props.actionData.action_status_id
        };

        switch ( this.props.entity_type ) {
            case this.entityTypes.voter:
                if ( null == this.props.actionData.key ) {
                    VoterActions.addNewAction(this.props.dispatch, this.props.action_entity_key, actionDataFields);
                } else {
                    VoterActions.editAction(this.props.dispatch, this.props.action_entity_key, this.props.actionData.key,
                                            actionDataFields);
                }
                break;

            case this.entityTypes.request:
                if ( null == this.props.actionData.key ) {
                    CrmActions.addNewAction(this.props.dispatch, this.props.action_entity_key, actionDataFields).then((res)=>{
                        if(res){
                            this.openAndCloseModelUpdateEndDateRequest(true);
                        }
                    });
                } else {
                    CrmActions.editAction(this.props.dispatch, this.props.action_entity_key, this.props.actionData.key,
                                          actionDataFields, this.props.actionIndex);
                }
                break;
        }

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.HIDE_MODAL_DIALOG});
    }

    actionDateChange(value, format, filter) {
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_date', fieldNewValue: value});

        if ( !this.validateFieldsB4Rendering('action_date', value) ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
        } else {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON});
        }
    }

    descriptionChange(e){
        let description = e.target.value;

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'description', fieldNewValue: description});

        if ( !this.validateFieldsB4Rendering('description', description) ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
        } else {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON});
        }
    }


    conversationWithChange(e){
        let conversationWith = e.target.value;

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'conversation_with_other', fieldNewValue: conversationWith});
    }

    getActionDirectionId(action_direction) {
        let directionsList = this.directions;
        let actionDirectionsIndex = -1;
        let actionDirectionsId = -1;

        actionDirectionsIndex = directionsList.findIndex(directionItem => directionItem.name == action_direction);
        if ( actionDirectionsIndex == -1) { // No type was found
            return null;
        } else {
            actionDirectionsId = directionsList[actionDirectionsIndex].id;
            return actionDirectionsId;
        }
    }

    actionDirectionChange(e){
        let action_direction = e.target.value;
        let conversation_direction = null;
 
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_direction', fieldNewValue: action_direction});

        if ( 0 ==  action_direction.length ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                                 fieldName: 'conversation_direction', fieldNewValue: null});

            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
			return;
        }

		
		
        conversation_direction = this.getActionDirectionId(action_direction);
		 
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'conversation_direction', fieldNewValue: conversation_direction});
		
	 
		if ( !this.validateFieldsB4Rendering('action_direction', action_direction, conversation_direction) ) {
			this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
        } else {
			console.log(conversation_direction);
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON});
        }

   }

    getActionTopicId(action_topic) {
        let entityActionTopicsList = this.props.entityActionTopicsList;
        let actionTopicsIndex = -1;
        let actionTopicsId = 0;

        actionTopicsIndex = entityActionTopicsList.findIndex(topicItem => topicItem.name == action_topic);
        if ( actionTopicsIndex == -1) { // No type was found
            return 0;
        } else {
            actionTopicsId = entityActionTopicsList[actionTopicsIndex].id;
            return actionTopicsId;
        }
    }

    actionTopicChange(e){
        let action_topic = e.target.value;
        let action_topic_id = 0;
        let entityActionTopicsList = this.props.entityActionTopicsList;

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_topic', fieldNewValue: action_topic});

        if ( 0 ==  action_topic.length || 0 == entityActionTopicsList.length) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                                 fieldName: 'action_topic_id', fieldNewValue: 0});
        } else {
            action_topic_id = this.getActionTopicId(action_topic);
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                                 fieldName: 'action_topic_id', fieldNewValue: action_topic_id});
        }

        if ( !this.validateFieldsB4Rendering('action_topic_id', action_topic, action_topic_id) ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
        } else {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON});
        }
    }

    getActionStatusId(action_status) {
        let actionStatusesList = this.props.actionStatusesList;
        let actionStatusesIndex = -1;
        let actionStatusesId = 0;

        actionStatusesIndex = actionStatusesList.findIndex(statusItem => statusItem.name == action_status);
        if ( actionStatusesIndex == -1) { // No type was found
            return 0;
        } else {
            actionStatusesId = actionStatusesList[actionStatusesIndex].id;
            return actionStatusesId;
        }
    }

    actionStatusChange(e){
        let action_status = e.target.value;
        let action_status_id = 0;

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_status', fieldNewValue: action_status});

        if ( 0 ==  action_status.length ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                                 fieldName: 'action_status_id', fieldNewValue: 0});
        } else {
            action_status_id = this.getActionStatusId(action_status);
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                                 fieldName: 'action_status_id', fieldNewValue: action_status_id});
        }

        if ( !this.validateFieldsB4Rendering('action_status_id', action_status, action_status_id) ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
        } else {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON});
        }
    }

    /**
     * This function loads the topics
     * related to the action type
     *
     * @param actionTypeId
     */
    loadVoterActionTopics(actionTypeId) {
        let actionTopicsList = this.props.actionTopicsList;
        let newTopicsList = [];

        newTopicsList = actionTopicsList.filter(topicItem => topicItem.action_type_id == actionTypeId);

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.LOAD_TOPICS_BY_TYPE,
                             newTopicsList: newTopicsList});
    }

    /**
     *  This function empties the topic
     *  list if no action topic is
     *  related to the action type
     */
    setEmptyActionTopic() {
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_type_id', fieldNewValue: 0});

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.LOAD_TOPICS_BY_TYPE,
                             newTopicsList: []});
    }

    /**
     * This function gets the action type id
     * according to the action type name
     *
     * @param action_type_name
     * @returns {number} - The action type id or 0 if no
     *                     action type name was found
     */
    getActionTypeId(action_type_name) {
        let actionTypesList = this.props.actionTypesList;
        let actionTypeIndex = -1;
        let actionTypeId = 0;

        actionTypeIndex = actionTypesList.findIndex(typeItem => typeItem.name == action_type_name);
        if ( actionTypeIndex == -1) { // No type was found
            return 0;
        } else {
            actionTypeId = actionTypesList[actionTypeIndex].id;
            return actionTypeId;
        }
    }

    /**
     * This function is triggered by event
     * of changing action type.
     *
     * This function loads the relevant
     * topics related to the selected
     * action type.
     *
     * @param e
     */
    actionTypeChange(e) {
        let action_type = e.target.value;
        
        let action_type_id = 0;

        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_type', fieldNewValue: action_type});

        // Choosing a type should change
        // the topic as well. since we
        // have to choose the topic related
        // to the type
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_topic', fieldNewValue: ''});

        // Choosing a type should change
        // the topic as well. since we
        // have to choose the topic related
        // to the type
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                             fieldName: 'action_topic_id', fieldNewValue: 0});

        if (action_type.length == 0) {
            this.setEmptyActionTopic();

            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
            return;
        }

        action_type_id = this.getActionTypeId(action_type);
        if ( 0 == action_type_id ) {
            this.setEmptyActionTopic();
        } else {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE,
                                 fieldName: 'action_type_id', fieldNewValue: action_type_id});

            // Loading the topics list related to the action type
            this.loadVoterActionTopics(action_type_id);
        }

        if ( !this.validateFieldsB4Rendering('action_type_id', action_type, action_type_id) ) {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON});
        } else {
            this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON});
        }
    }

    closeActionModalDialog() {
        this.props.dispatch({type: GlobalActions.ActionTypes.ACTION.HIDE_MODAL_DIALOG});
    }

    initVariables() {
        this.borderColor = {
            valid: '#ccc',
            inValid: '#cc0000'
        };

        this.actionTypeStyle = {
            borderColor: this.borderColor.valid
        };

        this.actionTopicStyle = {
            borderColor: this.borderColor.valid
        };
		
        this.actionDirectionStyle = {
            borderColor: this.borderColor.valid
        };

        this.actionTopicStatusStyle = {
            borderColor: this.borderColor.valid
        };

        this.actionDescriptionStyle = {
            borderColor: this.borderColor.valid
        };

        this.actionDateStyle = {
            color: 'red',
            borderColor: this.borderColor.valid
        };
    }

    validateActionDescription( actionDescription = null ) {
        var description = "";

        if ( null == actionDescription ) {
            description = this.props.actionData.description;
        } else {
            description = actionDescription;
        }

        if ( 0 == description.length ) {
            return false;
        } else {
            return true;
        }
    }

    validateActionStatus(actionStatusId = null, actionStatusName = null) {
        var action_status_name = "";
        var action_status_id = 0;

        if ( null == actionStatusName ) {
            action_status_name = this.props.actionData.action_status;
        } else {
            action_status_name = actionStatusName;
        }

        if ( null == actionStatusId ) {
            action_status_id = this.props.actionData.action_status_id;
        } else {
            action_status_id = actionStatusId;
        }

		 
        if ( 0 ==  action_status_name.length || 0 == action_status_id) {
            return false;
        } else {
            return true;
        }
    }
	
	validateDirectionTopic(actionDirectionId = null, actionDirectionName = null){
		 var action_direction_name = "";
        var action_direction_id = 0;

        if ( null == actionDirectionName ) {
            action_direction_name = this.props.actionData.action_direction;
        } else {
            action_direction_name = actionDirectionName;
        }
	 
 
        if ( null == actionDirectionId ) {
            action_direction_id = this.getActionDirectionId(this.props.actionData.action_direction);
        } else {
            action_direction_id = actionDirectionId;
        }

 
        if ( 0 ==  action_direction_name.length || action_direction_id == null) {
            return false;
        } else {
            return true;
        }
	}

    validateActionTopic(actionTopicId = null, actionTopicName = null) {
        var action_topic_name = "";
        var action_topic_id = 0;

        if ( null == actionTopicName ) {
            action_topic_name = this.props.actionData.action_topic;
        } else {
            action_topic_name = actionTopicName;
        }

        if ( null == actionTopicId ) {
            action_topic_id = this.props.actionData.action_topic_id;
        } else {
            action_topic_id = actionTopicId;
        }


        if ( 0 ==  action_topic_name.length || 0 == action_topic_id) {
            return false;
        } else {
            return true;
        }
    }

    validateActionType(actionTypeId = null, actionTypeName = null) {
        var action_type_name = "";
        var action_type_id = 0;

        if ( null == actionTypeName ) {
            action_type_name = this.props.actionData.action_type;
        } else {
            action_type_name = actionTypeName;
        }

        if ( null == actionTypeId ) {
            action_type_id = this.props.actionData.action_type_id;
        } else {
            action_type_id = actionTypeId;
        }
	 
		 

        if ( 0 ==  action_type_name.length ||  action_type_id == 0 ) {
            return false;
        } else {
            return true;
        }
    }

    validateActionDate(actionDate = null) {
        var action_date = "";

        if ( null == actionDate ) {
            action_date = this.props.actionData.action_date;
        } else {
            action_date = actionDate;
        }


        if ( 0 == action_date.length ) {
            return false;
        }

        return moment(action_date, 'YYYY-MM-DD HH:mm:ss', true).isValid();
    }

    validateFieldsB4Rendering( changedFieldName, fieldvalue, fieldId = null ) {
        switch (changedFieldName) {
            case 'action_date':
                if ( !this.validateActionDate( fieldvalue ) ) {
                    return false;
                }

                if ( !this.validateActionDescription() ) {
                    return false;
                }

                if ( !this.validateActionStatus() ) {
                    return false;
                }

                if ( !this.validateActionTopic() ) {
                    return false;
                }

                if ( !this.validateDirectionTopic() ) {
                    return false;
                }

                if ( !this.validateActionType() ) {
                    return false;
                }
                break;

            case 'description':
                if ( !this.validateActionDate() ) {
                    return false;
                }

                if ( !this.validateActionDescription(fieldvalue) ) {
                    return false;
                }

                if ( !this.validateActionStatus() ) {
                    return false;
                }

                if ( !this.validateActionTopic() ) {
                    return false;
                }

                if ( !this.validateDirectionTopic() ) {
                    return false;
                }

                if ( !this.validateActionType() ) {
                    return false;
                }
                break;

            case 'action_status_id':
                if ( !this.validateActionDate() ) {
                    return false;
                }

                if ( !this.validateActionDescription() ) {
                    return false;
                }

                if ( !this.validateActionStatus(fieldId, fieldvalue) ) {
                    return false;
                }

                if ( !this.validateActionTopic() ) {
                    return false;
                }

                if ( !this.validateDirectionTopic() ) {
                    return false;
                }

                if ( !this.validateActionType() ) {
                    return false;
                }
                break;

            case 'action_topic_id':
                if ( !this.validateActionDate() ) {
                    return false;
                }

                if ( !this.validateActionDescription() ) {
                    return false;
                }

                if ( !this.validateActionStatus() ) {
                    return false;
                }

                if ( !this.validateActionTopic(fieldId, fieldvalue) ) {
                    return false;
                }

                if ( !this.validateDirectionTopic() ) {
					console.log("false");
                    return false;
                }
				else{
					console.log("true");
				}

                if ( !this.validateActionType() ) {
                    return false;
                }
                break;

            case 'action_type_id':
				if ( !this.validateActionDate() ) {
                    return false;
                }

                if ( !this.validateActionDescription() ) {
                    return false;
                }

                if ( !this.validateActionStatus() ) {
                    return false;
                }

                if ( !this.validateActionTopic() ) {
                    return false;
                }

                if ( !this.validateDirectionTopic() ) {
				 
                    return false;
                }

                if ( !this.validateActionType(fieldId, fieldvalue) ) {
                    return false;
                }
                break;
            case 'action_direction':
				 
                if ( !this.validateActionDate() ) {
                    return false;
                }

                if ( !this.validateActionDescription() ) {
                    return false;
                }

                if ( !this.validateActionStatus() ) {
                    return false;
                }

                if ( !this.validateActionTopic() ) {
                    return false;
                }
			 

                if ( !this.validateDirectionTopic(fieldId, fieldvalue) ) {
                    return false;
                }

                if ( !this.validateActionType() ) {
                    return false;
                }
                break;
        }

        return true;
    }

    validateVariables() {
        this.validInputs = true;

        if ( !this.validateActionType() ) {
            this.actionTypeStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.actionTypeStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateActionTopic() ) {
            this.actionTopicStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.actionTopicStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateDirectionTopic() ) {
            this.actionDirectionStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.actionDirectionStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateActionStatus() ) {
            this.actionTopicStatusStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.actionTopicStatusStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateActionDescription() ) {
            this.actionDescriptionStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.actionDescriptionStyle.borderColor = this.borderColor.valid;
        }

        if ( !this.validateActionDate() ) {
            this.actionDateStyle.borderColor = this.borderColor.inValid;
            this.validInputs = false;
        } else {
            this.actionDateStyle.borderColor = this.borderColor.valid;
        }
    }

    openAndCloseModelUpdateEndDateRequest=(flag=true)=>{
        this.setState({openModalUpdateEndDate:flag})
     }

    render() {
		
        this.initVariables();

        this.validateVariables();

        return (
            <div>
            <ModalWindow show={this.props.showActionModal}
                         buttonOk={this.saveEntityAction.bind(this)} buttonOkText={this.buttonOkText}
                         buttonCancel={this.closeActionModalDialog.bind(this)} buttonCancelText={this.buttonCancelText}
                         buttonX={this.closeActionModalDialog.bind(this)} title={this.props.actionModalHeader}
                         disabledOkStatus={this.props.modalDisabledOkStatus}
                         style={{zIndex: '9001'}}>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-6">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="modalType1" className="col-sm-4 control-label">{this.labels.type}</label>
                                    
                                    <div className="col-sm-8">
                                        <Combo items={this.props.actionTypesList} maxDisplayItems={3} itemIdProperty="id"
                                               itemDisplayProperty='name'
                                               className="form-combo-table"
                                               value={this.props.actionData.action_type}
                                               onChange={this.actionTypeChange.bind(this)}
                                               inputStyle={this.actionTypeStyle} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modalSituation1" className="col-sm-4 control-label">{this.labels.status}</label>
                                    
                                    <div className="col-sm-8">
                                        <Combo items={this.props.actionStatusesList}
                                               maxDisplayItems={3} itemIdProperty="id"
                                               itemDisplayProperty='name'
                                               className="form-combo-table"
                                               value={this.props.actionData.action_status}
                                               onChange={this.actionStatusChange.bind(this)}
                                               inputStyle={this.actionTopicStatusStyle} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="inqryCloseDate" className="col-sm-4 control-label">{}</label>

                                    <div id="sandbox-container">
                                        <div className="col-sm-8 input-group date">
                                            <ReactWidgets.DateTimePicker
                                                isRtl={true} time={true}
                                                value={parseDateToPicker(this.props.actionData.action_date)}
                                                onChange={parseDateFromPicker.bind(this, {callback: this.actionDateChange,
                                                                                          format: "YYYY-MM-DD HH:mm:ss",
                                                                                          functionParams: 'dateTime'})
                                                         }
                                                format="DD/MM/YYYY HH:mm"
                                                style={this.actionDateStyle}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col-md-6">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="modalSubject1" className="col-sm-4 control-label">{this.labels.topic}</label>

                                    <div className="col-sm-8">
                                        <Combo items={this.props.entityActionTopicsList}
                                               maxDisplayItems={3} itemIdProperty="id"
                                               itemDisplayProperty='name'
                                               value={this.props.actionData.action_topic}
                                               onChange={this.actionTopicChange.bind(this)}
                                               inputStyle={this.actionTopicStyle} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modalDirection1" className="col-sm-4 control-label">
                                        {this.labels.direction}
                                    </label>

                                    <div className="col-sm-8">
                                        <Combo items={this.directions} maxDisplayItems={3} itemIdProperty="id"
                                               itemDisplayProperty='name'
                                               className="form-combo-table"
                                               value={this.props.actionData.action_direction}
                                               onChange={this.actionDirectionChange.bind(this)} 
											   inputStyle={this.actionDirectionStyle}  
											   />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modalSpokenTo" className="col-sm-4 control-label">
                                        {this.labels.conversationWith}
                                    </label>

                                    <div className="col-sm-8">
                                        <input type="text" className="form-control form-control-sm" maxLength="100"
                                               value={this.props.actionData.conversation_with_other}
                                               onChange={this.conversationWithChange.bind(this)} />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col-md-12">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="modalDescp1" className="col-sm-2 control-label">{this.labels.details}</label>

                                    <div className="col-sm-10">
                                        <textarea className="form-control" rows="3" id="modalDescp1"
                                                  placeholder={this.labels.details}
                                                  style={this.actionDescriptionStyle}
                                                  value={this.props.actionData.description}
                                                  onChange={this.descriptionChange.bind(this)}/>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </ModalWindow>
            <ModelUpdateCloseDateRequest dataRequest={this.props.dataRequest} open={this.state.openModalUpdateEndDate} openAndCloseModelUpdateEndDateRequest={this.openAndCloseModelUpdateEndDateRequest.bind(this)}></ModelUpdateCloseDateRequest>
         </div>
            

        );
    }
}


function mapStateToProps(state) {
    return {
        showActionModal: state.global.actions.showActionModal,
        actionModalHeader: state.global.actions.actionModalHeader,
        modalDisabledOkStatus: state.global.actions.modalDisabledOkStatus,
        actionData: state.global.actions.actionData,
        entityActionTopicsList: state.global.actions.entityActionTopicsList,
        dataRequest: state.crm.searchRequestsScreen.dataRequest,
    }
}

export default connect(mapStateToProps)(withRouter(AddEditActionModal));