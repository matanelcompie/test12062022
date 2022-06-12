import * as GlobalActions from '../actions/GlobalActions';
import voterFilterReducer from './VoterFilterReducer';
import { types as voterFilterTypes } from 'actions/VoterFilterActions';

const initialState = {
	isPlayingAudio:false,
    messages_screen: {
        loaded_messages_of_entity: false,
        loading_messages_of_entity: false,
        messagesList: []
    },
    sectorialFiltersScreen: {
        filterNameHeader: '',
        editSetorialFilterID: -1,
        definitionGroups: [],
        definitionValues: [],
        valuesOfAllDefinitionGroups: [],
        isEditing: false,
        isAdding: false,
        modalMainTitle: '',
        role_by_user_id: -1,
        roleUserIndex: -1,
        editSectorialFilterRecordIndex: -1,
        editSectorialFilterDefinitionID: -1,
        editSectorialFilterDefinitionGroupID: -1,
        tempRoleSectorialFilters: [],
    },

    documents: {

        /*START request screen params*/
        documentDeleteIndex: -1,

        documentEditIndex: -1,

        editingDocumentRow: false,

        addingNewDocument: false,
        /*END request screen params*/

        // Variable that indicates
        // if editing procees occurs now
        savingDocument: false,

        // Variable that indicates
        // if deleting procees occurs now
        deletingDocument: false,

        // Variable that indicates
        // if adding procees occurs now
        addingDocument: false,

        // A boolen that indicates whther to
        // show the delete Modal Dialog
        showDeleteModalDialog: false,

        // The key of the document to be deleted
        deleteDocumentKey: '',

        // The name of the document to be deleted
        deleteDocumentName: '',

        // The document of voter's request
        // if it's related to a voter's request
        deleteDocumentRequestKey: '',

        // The delete's Modal header
        deleteModalHeader: '',

        // The delete Modal Dialog confirm text
        deleteConfirmText: 'האם את/ה בטוח/ה ?',

        // Boolean which determines whether
        // to show the adding document div
        showNewDocumentDiv: false,

        // Boolean which determines whether
        // to show the document name input
        showNewDocumentName: false,

        // Fields for adding a document
        newDocumentDetails: {
            document_name: '',
            file: null
        },

        // editing Key of a row
        // in the documents table
        editingKey: '',

        // Array of the allowed types of document
        documentTypes: [],

        // Array of the documents
        documents: []
    },

    actions: {
        // A boolean which indicates whether
        // to show the action Modal.
        showActionModal: false,

        // The header of the action Modal
        actionModalHeader: "",

        // Array which stores the
        // types according to the
        // chosen action type in
        // add new action
        entityActionTopicsList: [],

        // Object that stores the data
        // for adding a new action row
        actionData: {
            key: null,
            action_type: '',
            action_topic: '',
            action_status: '',
            action_direction: '',
            action_date: '',
            description: '',
            conversation_with_other: '',
            action_type_id: 0,
            action_topic_id: 0,
            action_status_id: 0,
            conversation_direction: ''
        },

        // The disabled status of the modal ok button
        modalDisabledOkStatus: false
    },
    voterFilter: {
        modules: {},
        geo_options: {},
        geoFilterGroupExpandedFlag: null,
        electionCampaigns: {
            list: [],
            current: {}
        },
		tmCampaigns: {
            list: [],
            current: {}
        },
        portion: { vf: { filter_items: [] }, old: { filter_items: [] } },
        general_report: { vf: { filter_items: [], geo_items: [] }, old: { filter_items: [], geo_items: [] } },
        captain50_walker_report: { vf: { filter_items: [], geo_items: [] }, old: { filter_items: [], geo_items: [] } },
        captain50_activist: { vf: { filter_items: [], geo_items: [] }, old: { filter_items: [], geo_items: [] } }
	},

    voterSourceModal: {
        streets: [],
        voters: [],
        totalVoters: 0,
        loadedVoters: false,
        loadingData: false
    },

    institueModal: {
        combos: {
            instituteGroups: [],
            instituteTypes: [],
            instituteNetworks: []
        },

        institutes: [],
        totalInstitutes: 0,
        loadedInstitutes: false,
        loadingInstitutes: false
    },

    voterGroupModal: {
        newGroup: null,
        combos: {
            voterGroups: []
        }
    },
    banksBranches:[]
};

function globalReducer(state = initialState, action) {
    if (voterFilterTypes[action.type] != undefined) {
        let newVoterFilterState = voterFilterReducer(state.voterFilter, action);
        if (state.voterFilter != newVoterFilterState)
            return Object.assign({}, state, { voterFilter: newVoterFilterState });
        else
            return state;
    }

    switch (action.type) {
		case GlobalActions.ActionTypes.SET_SMALL_AUDIO_PLAYING:
			var newState = { ...state };
			newState.isPlayingAudio = action.isPlayingAudio;
			return newState;
			break;
			
		case GlobalActions.ActionTypes.VOTER_FILTER.EXPAND_SHRINK_ALL_DEFINITION_GROUPS : 
			var newState = { ...state };
			//console.log("expand shrink " + action.isExpandAll + " " + action.moduleType);
			newState.voterFilter = { ...state.voterFilter };
			newState.voterFilter.modules = { ...state.voterFilter.modules };
			newState.voterFilter.modules[action.moduleType] = [ ...state.voterFilter.modules[action.moduleType] ];
			if(newState.voterFilter.modules[action.moduleType]){
				for(let i = 0 ; i < newState.voterFilter.modules[action.moduleType].length ; i++){
					 newState.voterFilter.modules[action.moduleType][i] = {...newState.voterFilter.modules[action.moduleType][i]};
					 newState.voterFilter.modules[action.moduleType][i].expanded = action.isExpandAll;
				}
			}
            return newState;
			break;
			
		case GlobalActions.ActionTypes.VOTER_FILTER.EXPAND_SHRINK_DEFINITION_GROUP_BY_INDEX:
			var newState = { ...state };
			//console.log("expand shrink " + action.isExpandAll + " " + action.moduleType);
			newState.voterFilter = { ...state.voterFilter };
			newState.voterFilter.modules = { ...state.voterFilter.modules };
			newState.voterFilter.modules[action.moduleType] = [ ...state.voterFilter.modules[action.moduleType] ];
			newState.voterFilter.modules[action.moduleType][action.index] = {...newState.voterFilter.modules[action.moduleType][action.index]};
			newState.voterFilter.modules[action.moduleType][action.index].expanded = action.isExpanded;
			return newState;
			break;

        case GlobalActions.ActionTypes.VOTER_FILTER.GEOGRAPHIC_FILTER.CHANGE_GROUP_EXPANDED_FLAG:
            var newState = { ...state };
            newState.voterFilter = { ...state.voterFilter };

            newState.voterFilter.geoFilterGroupExpandedFlag = action.flag;

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_FILTER.GEOGRAPHIC_FILTER.RESET_GROUP_EXPANDED_FLAG:
            var newState = { ...state };
            newState.voterFilter = { ...state.voterFilter };

            newState.voterFilter.geoFilterGroupExpandedFlag = null;

            return newState;
            break;

        case GlobalActions.ActionTypes.MESSAGES.LOADED_MESSAGES_BY_ENTITY_TYPE:
            var newState = { ...state };
            newState.messages_screen = { ...state.messages_screen };
            newState.messages_screen.messagesList = action.messagesList;

            return newState;
            break;

        case GlobalActions.ActionTypes.MESSAGES.OPEN_GLOBAL_DIALOG:
            var newState = { ...state };
            newState.showGlobalDialog = true;
            newState.globalHeaderText = action.header;
            newState.globalContentText = '<table><tbody><tr><th style="width:50px" valign="top">מאת : </th><td>מפלגת ש"ס</td></tr>' +
                '<tr><th valign="top">נושא :</th><td>' + (action.title?action.title:'<i> לא הוגדר עבור סוג הודעה זו</i>') + '</td></tr>' +
                '<tr><th valign="top">תאריך :</th><td>' + action.messageDateTime + '</td></tr>' +
                '<tr><th valign="top">תוכן : </th><td>' + action.content + '</td></tr></tbody></table>';

            return newState;
            break;

        case GlobalActions.ActionTypes.MESSAGES.CLOSE_GLOBAL_DIALOG:
            var newState = { ...state };
            newState.showGlobalDialog = false;
            newState.globalHeaderText = '';
            newState.globalContentText = '';
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.RESET_TEMP_SECTORIAL_FILTERS_ARRAY:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.tempRoleSectorialFilters = [];
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.DELETE_ROLE_SECORIAL_FILTER_FROM_TEMP_ARRAY:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.tempRoleSectorialFilters = [...state.sectorialFiltersScreen.tempRoleSectorialFilters];
            newState.sectorialFiltersScreen.tempRoleSectorialFilters.splice(action.data, 1);
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.ADD_TEMP_GEO_FILTER_TO_TEMP_ROLE_ARR:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups = [ ...state.sectorialFiltersScreen.valuesOfAllDefinitionGroups ];
            newState.sectorialFiltersScreen.tempRoleSectorialFilters = [...state.sectorialFiltersScreen.tempRoleSectorialFilters];
            newState.sectorialFiltersScreen.tempRoleSectorialFilters.push(newState.sectorialFiltersScreen.filterNameHeader + '~' + action.data);
            newState.sectorialFiltersScreen.isAdding = false;
            newState.sectorialFiltersScreen.isEditing = false;
            newState.sectorialFiltersScreen.modalMainTitle = '';

            newState.sectorialFiltersScreen.definitionValues = [];
            newState.sectorialFiltersScreen.editSectorialFilterRecordIndex = -1;
            newState.sectorialFiltersScreen.editSectorialFilterDefinitionID = -1;
            newState.sectorialFiltersScreen.editSectorialFilterDefinitionGroupID = -1;
            newState.sectorialFiltersScreen.filterNameHeader = '';

            for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                    newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value = '';
                    newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_values = [];
                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2 &&
                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].model_list_dependency_id != null) {
                        newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].values = [];
                    }
                }
            }

            for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                    newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value;
                    newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_values;
                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2 &&
                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].model_list_dependency_id != null) {
                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values = newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].values;
                    }
                }
            }
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.LOADED_DEFINITION_GROUPS:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups = [ ...state.sectorialFiltersScreen.valuesOfAllDefinitionGroups ];
            newState.sectorialFiltersScreen.definitionGroups = action.data;

            for (let i = 0; i < action.data.length; i++) {
                newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups.push([]);
                for (let j = 0; j < action.data[i].definitions.length; j++) {
                    newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i].push({ def_value: action.data[i].definitions[j].def_value, def_values: action.data[i].definitions[j].def_values });
                }
            }

            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.OPEN_ADD_NEW_GEO_FILTER_MODAL:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.isAdding = true;
            newState.sectorialFiltersScreen.isEditing = false;
            newState.sectorialFiltersScreen.modalMainTitle = action.data;
            newState.sectorialFiltersScreen.role_by_user_id = action.roleUserID;
            newState.sectorialFiltersScreen.roleUserIndex = action.roleUserIndex;

            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.ADD_NEW_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.isAdding = true;
            newState.sectorialFiltersScreen.isEditing = false;
            newState.sectorialFiltersScreen.modalMainTitle = action.data;
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.EDIT_SECTORIAL_FILTER_TO_TEMP_ROLE_ARRAY:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.isAdding = false;
            newState.sectorialFiltersScreen.isEditing = true;
            newState.sectorialFiltersScreen.modalMainTitle = action.data;
            newState.sectorialFiltersScreen.editSectorialFilterRecordIndex = action.tempRowIndex;
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.NEW_USER_OPEN_EDIT_EXISTING_GEO_FILTER_MODAL:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.isAdding = false;
            newState.sectorialFiltersScreen.isEditing = true;
            newState.sectorialFiltersScreen.modalMainTitle = action.data;
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.OPEN_EDIT_EXISTING_GEO_FILTER_MODAL:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.isAdding = false;
            newState.sectorialFiltersScreen.isEditing = true;
            newState.sectorialFiltersScreen.modalMainTitle = action.data;
            newState.sectorialFiltersScreen.role_by_user_id = action.roleUserID;
            newState.sectorialFiltersScreen.roleUserIndex = action.roleUserIndex;
            newState.sectorialFiltersScreen.filterNameHeader = action.filterName;
            newState.sectorialFiltersScreen.editSetorialFilterID = action.editSetorialFilterID;
            newState.sectorialFiltersScreen.editSectorialFilterRecordIndex = action.sectorialEditRowIndex;
            newState.sectorialFiltersScreen.editSectorialFilterDefinitionID = action.definitionID;
            newState.sectorialFiltersScreen.editSectorialFilterDefinitionGroupID = action.definitionGroupID;
            for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                for (let k = 0; k < action.definitionGroupID.length; k++) {
                    if (newState.sectorialFiltersScreen.definitionGroups[i].id == action.definitionGroupID[k]) {
                        newState.sectorialFiltersScreen.definitionGroups[i].is_opened = true;
                    }
                }
            }
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.LOADED_TEMP_DEFINITION_GROUPS_VALUE:
            var newState = { ...state };
            newState.sectorialFiltersScreen = {...state.sectorialFiltersScreen};
            newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups = [...state.sectorialFiltersScreen.valuesOfAllDefinitionGroups];
            // newState.sectorialFiltersScreen = {...state.sectorialFiltersScreen};
            //newState.sectorialFiltersScreen.definitionValues = action.data;
            if (action.rowIndex >= 0) {
                if (newState.sectorialFiltersScreen.tempRoleSectorialFilters[action.rowIndex].length > 0) {
                    let arrMain = newState.sectorialFiltersScreen.tempRoleSectorialFilters[action.rowIndex].split('~');
                    newState.sectorialFiltersScreen.filterNameHeader = arrMain[0];
                    let arrItems = arrMain[1].split(';');

                    for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {

                        for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                            for (let k = 0; k < arrItems.length; k++) {
                                let arrItemsParts = arrItems[k].split('|');
                                if (arrItemsParts[0] == newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].id) {
                                    newState.sectorialFiltersScreen.definitionGroups[i].is_opened = true;
                                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 0) {
                                        if (arrItemsParts[4] == 0) {
                                            newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = 'לא';
                                        } else if (arrItemsParts[4] == 1) {
                                            newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = 'כן';
                                        }
                                    } else if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 1 || newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2) {
                                        for (let s = 0; s < newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values.length; s++) {
                                            if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect == 1) {
                                                let tempArrOfDefVals = arrItemsParts[4].split(',');
                                                for (let t = 0; t < tempArrOfDefVals.length; t++) {
                                                    tempArrOfDefVals[t] = { id: t, value: tempArrOfDefVals[t] };
                                                }
                                                newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = tempArrOfDefVals;
                                            } else {
                                                if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values[s].id == arrItemsParts[4]) {
                                                    newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values[s].name == undefined ? newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values[s].value : newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values[s].name;

                                                }
                                            }
                                        }
                                    } else {
                                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = arrItemsParts[4];
                                    }
                                }
                                /*
                                 if(newState.sectorialFiltersScreen.definitionValues[k].values_list[s].definition_id == newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].id){
                                 //console.log(newState.sectorialFiltersScreen.definitionValues[k].values_list[s].definition_id);
                                 if(newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 1 || newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type ==2){
                                 if(newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect == 1){
                                 newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].values;
                                 }
                                 else{
                                 newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values;
                                 newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].value;
                                 }
                                 break;
                                 }
                                 
                                 }
                                 else{
                                 if(newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values != undefined){ 
                                 for(let t = 0;t<newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values.length ; t++){
                                 if(newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values[t].definition_id == newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].id){
                                 //console.log("ok");
                                 newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values =newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values[t].def_values;
                                 
                                 }
                                 }
                                 }
                                 }
                                 */
                            }
                        }

                    }
                }

                for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                    for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                        newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value = newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value;
                        newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_values = newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values;
                    }
                }


            }
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.EDIT_TEMP_SECTORIAL_FILTERS_OF_NEW_ROLE:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.tempRoleSectorialFilters = [...state.sectorialFiltersScreen.tempRoleSectorialFilters];
            let deleteArr = [], editArr = [], addArr = [];
            if (action.deleteString != '') {
                deleteArr = action.deleteString.split(',');
            }
            editArr = action.editString.split(';');
            addArr = action.addString.split(';');
            if (deleteArr.length > 0) {
                let newArray = '';
                let correspondingFilters = newState.sectorialFiltersScreen.tempRoleSectorialFilters[action.rowIndex];
                correspondingFilters = correspondingFilters.split('~');
                let filterName = correspondingFilters[0];
                correspondingFilters = correspondingFilters[1].split(';');

                for (let i = 0; i < correspondingFilters.length; i++) {
                    for (let j = 0; j < deleteArr.length; j++) {
                        let arrParts = correspondingFilters[i].split('|');

                        if (arrParts[0] == deleteArr[j]) {

                        } else {
                            newArray += correspondingFilters[i] + ';';
                        }
                    }
                }
                correspondingFilters = newArray;
                correspondingFilters = correspondingFilters.slice(0, -1);
                correspondingFilters = filterName + '~' + correspondingFilters;
                newState.sectorialFiltersScreen.tempRoleSectorialFilters[action.rowIndex] = correspondingFilters;

            }
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.LOADED_DEFINITION_GROUPS_VALUE:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups = [ ...state.sectorialFiltersScreen.valuesOfAllDefinitionGroups ];
            newState.sectorialFiltersScreen.definitionValues = action.data;
            if (action.templateHeader != undefined) {
                newState.sectorialFiltersScreen.filterNameHeader = action.templateHeader;
            }
            if (newState.sectorialFiltersScreen.definitionValues.length > 0) {

                for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                    for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                        for (let k = 0; k < newState.sectorialFiltersScreen.definitionValues.length; k++) {
                            for (let s = 0; s < newState.sectorialFiltersScreen.definitionValues[k].values_list.length; s++) {

                                if (newState.sectorialFiltersScreen.definitionValues[k].values_list[s].definition_id == newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].id) {
                                    //console.log(newState.sectorialFiltersScreen.definitionValues[k].values_list[s].definition_id);
                                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 1 || newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2) {
                                        if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].multiselect == 1) {
                                            newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].values;
                                            newState.sectorialFiltersScreen.definitionGroups[i].is_opened = 1;
                                        } else {
                                            newState.sectorialFiltersScreen.definitionGroups[i].is_opened = 1;
                                            newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values;
                                            newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].value;
                                        }
                                        break;
                                    }

                                } else {
                                    if (newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values != undefined) {
                                        for (let t = 0; t < newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values.length; t++) {
                                            if (newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values[t].definition_id == newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].id) {
                                                //console.log("ok");
                                                newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values = newState.sectorialFiltersScreen.definitionValues[k].values_list[s].def_values[t].def_values;
                                                newState.sectorialFiltersScreen.definitionGroups[i].is_opened = 1;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                    for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                        newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value = newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value;
                        newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_values = newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values;
                    }
                }

            }
            return newState;
            break;


        case GlobalActions.ActionTypes.GEO_FILTERS.CLOSE_ADD_EDIT_GEO_FILTER_MODAL:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups = [ ...state.sectorialFiltersScreen.valuesOfAllDefinitionGroups];
            newState.sectorialFiltersScreen.definitionGroups = [...state.sectorialFiltersScreen.definitionGroups];
            for (let i = 0, len = newState.sectorialFiltersScreen.definitionGroups.length; i < len; i++) {
                newState.sectorialFiltersScreen.definitionGroups[i].is_opened = 0;
            }

            newState.sectorialFiltersScreen.isAdding = false;
            newState.sectorialFiltersScreen.isEditing = false;
            newState.sectorialFiltersScreen.modalMainTitle = '';
            newState.sectorialFiltersScreen.definitionValues = [];
            newState.sectorialFiltersScreen.editSectorialFilterRecordIndex = -1;
            newState.sectorialFiltersScreen.editSectorialFilterDefinitionID = -1;
            newState.sectorialFiltersScreen.editSectorialFilterDefinitionGroupID = -1;
            newState.sectorialFiltersScreen.filterNameHeader = '';

            for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                    newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value = '';
                    newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_values = [];
                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2 &&
                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].model_list_dependency_id != null) {
                        newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].values = [];
                    }
                }
            }

            for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                    newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_value;
                    newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].def_values;
                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].type == 2 &&
                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].model_list_dependency_id != null) {
                        newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values = newState.sectorialFiltersScreen.valuesOfAllDefinitionGroups[i][j].values;
                    }
                }
            }



            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.UPDATE_COLLAPSE_STATUS_OF_DEF_GROUP:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.definitionGroups = [...state.sectorialFiltersScreen.definitionGroups];
            newState.sectorialFiltersScreen.definitionGroups[action.rowIndex].is_opened = (newState.sectorialFiltersScreen.definitionGroups[action.rowIndex].is_opened == 1 ? 0 : 1);
            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.FILTER_NAME_HEADER_CHANGE:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.filterNameHeader = action.data;
            return newState;


        case GlobalActions.ActionTypes.GEO_FILTERS.FILTER_ITEM_CHANGE:
            var newState = { ...state };
            //console.log(action.multiArray);
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.definitionGroups = [...state.sectorialFiltersScreen.definitionGroups];
            newState.sectorialFiltersScreen.definitionGroups[action.defGroupIndex].definitions[action.defIndex].def_value = action.newVal;
            if (newState.sectorialFiltersScreen.definitionGroups[action.defGroupIndex].definitions[action.defIndex].multiselect == 1 &&
                (newState.sectorialFiltersScreen.definitionGroups[action.defGroupIndex].definitions[action.defIndex].type == 1 || newState.sectorialFiltersScreen.definitionGroups[action.defGroupIndex].definitions[action.defIndex].type == 2)) {

                if (action.multiArray != undefined) {
                    newState.sectorialFiltersScreen.definitionGroups[action.defGroupIndex].definitions[action.defIndex].def_value = "";
                    newState.sectorialFiltersScreen.definitionGroups[action.defGroupIndex].definitions[action.defIndex].def_values = action.multiArray;
                }
            }

            return newState;
            break;

        case GlobalActions.ActionTypes.GEO_FILTERS.LOAD_DEPENDENCIED_LISTS:
            var newState = { ...state };
            newState.sectorialFiltersScreen = { ...state.sectorialFiltersScreen };
            newState.sectorialFiltersScreen.definitionGroups = [...state.sectorialFiltersScreen.definitionGroups];
            for (let i = 0; i < newState.sectorialFiltersScreen.definitionGroups.length; i++) {
                //newState.sectorialFiltersScreen.definitionGroups[i] = {...state.sectorialFiltersScreen.definitionGroups[i]};
                //newState.sectorialFiltersScreen.definitionGroups[i].definitions = [...state.sectorialFiltersScreen.definitionGroups[i].definitions];
                for (let j = 0; j < newState.sectorialFiltersScreen.definitionGroups[i].definitions.length; j++) {
                    //newState.sectorialFiltersScreen.definitionGroups[i].definitions[j] = {...state.sectorialFiltersScreen.definitionGroups[i].definitions[j]};			  
                    if (newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].model_list_dependency_id != null) {

                        for (let k = 0; k < action.data.length; k++) {

                            if (action.data[k].id == newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].id) {
                                newState.sectorialFiltersScreen.definitionGroups[i].definitions = [...state.sectorialFiltersScreen.definitionGroups[i].definitions];
                                newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_values = [];
                                newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].def_value = '';
                                newState.sectorialFiltersScreen.definitionGroups[i].definitions[j].values = action.data[k].values_list;
                                break;
                            }
                        }
                    }
                }
            }
            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DIV:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.showNewDocumentDiv = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_HIDE_DIV:
            var newState = { ...state };
            newState.documents = { ...newState.documents };
            newState.documents.newDocumentDetails = { ...newState.documents.newDocumentDetails };

            newState.documents.showNewDocumentDiv = false;

            newState.documents.newDocumentDetails.file = null;
            newState.documents.newDocumentDetails.document_name = '';

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_LOAD_ALL_DOCUMENTS:
            var newState = {...state};
            newState.documents = {...newState.documents};
            newState.documents.documents = [...newState.documents.documents];

            newState.documents.documents = action.documents;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_INPUT_NAME_CHANGE:
            var newState = { ...state };
            newState.documents = { ...newState.documents };
            newState.documents.documents = [...newState.documents.documents];
            newState.documents.documents[action.data.documentIndex] = { ...newState.documents.documents[action.data.documentIndex] };

            newState.documents.documents[action.data.documentIndex].name = action.data.newDocumentName;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.SAVING_DOCUMENT:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.savingDocument = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.SAVED_DOCUMENT:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.savingDocument = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DELETING_DOCUMENT:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.addingDocument = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.ADDED_DOCUMENT:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.addingDocument = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.ADDING_DOCUMENT:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.deletingDocument = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DELETED_DOCUMENT:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.deletingDocument = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_DELETE_HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            // A boolen that indicates whther to
            // show the delete Modal Dialog
            newState.documents.showDeleteModalDialog = false;

            // The key of the document to be deleted
            newState.documents.deleteDocumentKey = '';

            // The name of the document to be deleted
            newState.documents.deleteDocumentName = '';

            // The document of voter's request
            // if it's related to a voter's request
            newState.documents.deleteDocumentRequestKey = '';

            // The delete's Modal header
            newState.documents.deleteModalHeader = '';

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_DELETE_SHOW_MODAL_DIALOG:
            var modalDeleteText = 'מחיקת מסמך ';

            var newState = { ...state };
            newState.documents = { ...newState.documents };

            // A boolen that indicates whther to
            // show the delete Modal Dialog
            newState.documents.showDeleteModalDialog = true;

            // The key of the document to be deleted
            newState.documents.deleteModalHeader = modalDeleteText + action.deleteDocumentName;

            // The key of the document to be deleted
            newState.documents.deleteDocumentKey = action.deleteDocumentKey;

            // The document of voter's request
            // if it's related to a voter's request
            newState.documents.deleteDocumentRequestKey = action.deleteDocumentRequestKey;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_FILE_UPLOAD_CHANGE:
            var newState = { ...state };
            newState.documents = { ...newState.documents };
            newState.documents.newDocumentDetails = { ...newState.documents.newDocumentDetails };

            newState.documents.newDocumentDetails.file = action.file;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_DOCUMENT_NAME_CHANGE:
            var newState = { ...state };
            newState.documents = { ...newState.documents };
            newState.documents.newDocumentDetails = { ...newState.documents.newDocumentDetails };

            newState.documents.newDocumentDetails.document_name = action.document_name;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_SHOW_DOCUMENT_NAME:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.showNewDocumentName = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_ADD_HIDE_DOCUMENT_NAME:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.showNewDocumentName = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_EDIT_ENABLE_EDITING:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.editingKey = action.documentKey;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_EDIT_DISABLE_EDITING:
            var newState = { ...state };
            newState.documents = { ...newState.documents };

            newState.documents.editingKey = '';

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.SET_DOCUMENT_EDITING:
            var newState = { ...state };
            newState.documents = { ...state.documents };
            newState.documents.editingDocumentRow = action.newValue;
            newState.documents.documents = [...state.documents.documents];
            newState.documents.documents[action.theIndex].is_editing = action.newValue;
            newState.documents.documentEditIndex = action.theIndex;
            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.SHOW_ADD_DOCUMENT_TO_REQUEST_SCREEN:
            var newState = { ...state };
            newState.documents = { ...state.documents };

            newState.documents.addingNewDocument = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.HIDE_ADD_DOCUMENT_TO_REQUEST_SCREEN:
            var newState = { ...state };
            newState.documents = { ...state.documents };

            newState.documents.addingNewDocument = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_LOAD_DOCUMENT_TYPES:
            var newState = { ...state };
            newState.documents = { ...state.documents };
            newState.documents.documentTypes = [...state.documents.documentTypes];

            newState.documents.documentTypes = action.documentTypes;

            return newState;
            break;

        case GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_CLEAN_DATA:
            var newState = { ...state };
            newState.documents = { ...state.documents };

            /*START request screen params*/
            newState.documents.documentDeleteIndex = -1;

            newState.documents.documentEditIndex = -1;

            newState.documents.editingDocumentRow = false;

            newState.documents.addingNewDocument = false;
            /*END request screen params*/

            // Variable that indicates
            // if editing procees occurs now
            newState.documents.savingDocument = false;

            // Variable that indicates
            // if deleting procees occurs now
            newState.documents.deletingDocument = false;

            // Variable that indicates
            // if adding procees occurs now
            newState.documents.addingDocument = false;

            // A boolen that indicates whther to
            // show the delete Modal Dialog
            newState.documents.showDeleteModalDialog = false;

            // The key of the document to be deleted
            newState.documents.deleteDocumentKey = '';

            // The name of the document to be deleted
            newState.documents.deleteDocumentName = '';

            // The document of voter's request
            // if it's related to a voter's request
            newState.documents.deleteDocumentRequestKey = '';

            // The delete's Modal header
            newState.documents.deleteModalHeader = '';

            // The delete Modal Dialog confirm text
            newState.documents.deleteConfirmText = 'האם את/ה בטוח/ה ?';

            // Boolean which determines whether
            // to show the adding document div
            newState.documents.showNewDocumentDiv = false;

            // Boolean which determines whether
            // to show the document name input
            newState.documents.showNewDocumentName = false;

            // Fields for adding a document
            newState.documents.newDocumentDetails = {
                document_name: '',
                file: null
            };

            // editing Key of a row
            // in the documents table
            newState.documents.editingKey = '';

            // Array of the documents
            newState.documents.documents = [];

            return newState;
            break;

        case GlobalActions.ActionTypes.ACTION.ACTION_INPUT_CHANGE:
            var newState = { ...state };
            newState.actions = { ...newState.actions };
            newState.actions.actionData = { ...newState.actions.actionData };

            newState.actions.actionData[action.fieldName] = action.fieldNewValue;

            return newState;
            break;

        case GlobalActions.ActionTypes.ACTION.LOAD_TOPICS_BY_TYPE:
            var newState = { ...state };
            newState.actions = { ...newState.actions };
            newState.actions.entityActionTopicsList = [...newState.actions.actionData];

            newState.actions.entityActionTopicsList = action.newTopicsList;

            return newState;
            break;

        case GlobalActions.ActionTypes.ACTION.SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.actions = { ...newState.actions };
            newState.actions.actionData = { ...newState.actions.actionData };
            newState.actions.entityActionTopicsList = [...newState.actions.entityActionTopicsList];

            newState.actions.showActionModal = true;

            newState.actions.actionModalHeader = action.actionModalHeader;

            newState.actions.actionData = {
                key: action.actionData.key,
                action_type: action.actionData.action_type,
                action_topic: action.actionData.action_topic,
                action_status: action.actionData.action_status,
                action_direction: action.actionData.action_direction,
                action_date: action.actionData.action_date,
                description: action.actionData.description,
                conversation_with_other: action.actionData.conversation_with_other,
                action_type_id: action.actionData.action_type_id,
                action_topic_id: action.actionData.action_topic_id,
                action_status_id: action.actionData.action_status_id,
                conversation_direction: action.actionData.conversation_direction
            };

            newState.actions.entityActionTopicsList = action.entityActionTopicsList;

            // If it's a new action, then the fields
            // are not valid, so the modal save button
            // should be disabled
            if (null == action.actionData.key) {
                newState.actions.modalDisabledOkStatus = true;
            }

            return newState;
            break;

        case GlobalActions.ActionTypes.ACTION.HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.actions = { ...newState.actions };
            newState.actions.actionData = { ...newState.actions.actionData };
            newState.actions.entityActionTopicsList = [...newState.actions.entityActionTopicsList];

            newState.actions.showActionModal = false;

            newState.actions.actionModalHeader = "";

            newState.actions.actionData = {
                key: null,
                action_type: '',
                action_topic: '',
                action_status: '',
                action_direction: '',
                action_date: '',
                description: '',
                conversation_with_other: '',
                action_type_id: 0,
                action_topic_id: 0,
                action_status_id: 0,
                conversation_direction: ''
            };

            newState.actions.entityActionTopicsList = [];

            newState.actions.modalDisabledOkStatus = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.ACTION.ENABLE_MODAL_OK_BUTTON:
            var newState = { ...state };
            newState.actions = { ...newState.actions };

            newState.actions.modalDisabledOkStatus = false;

            return newState;
            break;

        case GlobalActions.ActionTypes.ACTION.DISABLE_MODAL_OK_BUTTON:
            var newState = { ...state };
            newState.actions = { ...newState.actions };

            newState.actions.modalDisabledOkStatus = true;

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.RESET_STREETS:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal.streets = [];

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.LOAD_STREETS:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal.streets = action.streets;

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.CLEAN_DATA:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal = initialState.voterSourceModal;

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.RESET_VOTERS:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal.totalVoters = 0;
            newState.voterSourceModal.voters = [];

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.LOAD_VOTERS:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal.totalVoters = action.totalVoters;
            newState.voterSourceModal.voters = action.voters;

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.LOAD_MORE_VOTERS:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};
            newState.voterSourceModal.voters = [...newState.voterSourceModal.voters];

            for ( let voterIndex = 0; voterIndex < action.voters.length; voterIndex++ ) {
                newState.voterSourceModal.voters.push(action.voters[voterIndex]);
            }

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADED_VOTERS_FLAG:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal.loadedVoters = action.loadedVoters;

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_SOURCE_MODAL.CHANGE_LOADING_VOTERS_FLAG:
            var newState = { ...state };
            newState.voterSourceModal = {...newState.voterSourceModal};

            newState.voterSourceModal.loadingData = action.loadingData;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.CLEAN_DATA:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};
            newState.institueModal.combos = {...newState.institueModal.combos};

            let groups = newState.institueModal.combos.instituteGroups;
            let types = newState.institueModal.combos.instituteTypes;
            let networks = newState.institueModal.combos.instituteNetworks;

            newState.institueModal = initialState.institueModal;

            if ( !action.deleteCombos ) {
                newState.institueModal.combos.instituteGroups = groups;
                newState.institueModal.combos.instituteTypes = types;
                newState.institueModal.combos.instituteNetworks = networks;
            }

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTE_GROUPS:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};
            newState.institueModal.combos = {...newState.institueModal.combos};

            newState.institueModal.combos.instituteGroups = action.instituteGroups;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTE_TYPES:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};
            newState.institueModal.combos = {...newState.institueModal.combos};

            newState.institueModal.combos.instituteTypes = action.instituteTypes;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTE_NETWORKS:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};
            newState.institueModal.combos = {...newState.institueModal.combos};

            newState.institueModal.combos.instituteNetworks = action.instituteNetworks;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.CHANGE_LOADED_INSTITUTES_FLAG:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};

            newState.institueModal.loadedInstitutes = action.loadedInstitutes;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.CHANGE_LOADING_INSTITUTES_FLAG:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};

            newState.institueModal.loadingInstitutes = action.loadingInstitutes;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.RESET_INSTITUTES:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};

            newState.institueModal.totalInstitutes = 0;
            newState.institueModal.institutes = [];

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.LOAD_INSTITUTES:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};

            newState.institueModal.totalInstitutes = action.totalInstitutes;
            newState.institueModal.institutes = action.institutes;

            return newState;
            break;

        case GlobalActions.ActionTypes.INSTITUTE_MODAL.LOAD_MORE_INSTITUTES:
            var newState = { ...state };
            newState.institueModal = {...newState.institueModal};
            newState.institueModal.institutes = [...newState.institueModal.institutes];

            for ( let institueIndex = 0; institueIndex < action.institutes.length; institueIndex++ ) {
                newState.institueModal.institutes.push(action.institutes[institueIndex]);
            }

            return newState;
            break;

        case GlobalActions.ActionTypes.VOTER_GROUP_MODAL.CLEAN_DATA:
            var newState = { ...state };
            newState.voterGroupModal = {...newState.voterGroupModal};
            newState.voterGroupModal.combos = {...newState.voterGroupModal.combos};

            let voterGroups = newState.voterGroupModal.combos.voterGroups;

            newState.voterGroupModal = initialState.voterGroupModal;

            if ( !action.deleteCombos ) {
                newState.voterGroupModal.combos.voterGroups = voterGroups;
            }

            return newState;

        case GlobalActions.ActionTypes.VOTER_GROUP_MODAL.ADDED_NEW_GROUP_DATA:
            var newState = { ...state };
            newState.voterGroupModal = { ...newState.voterGroupModal };
            newState.voterGroupModal.newGroup = action.newGroup;
            return newState;

        case GlobalActions.ActionTypes.VOTER_GROUP_MODAL.LOAD_VOTER_GROUPS:
            var newState = { ...state };
            newState.voterGroupModal = {...newState.voterGroupModal};
            newState.voterGroupModal.combos = {...newState.voterGroupModal.combos};
            newState.voterGroupModal.combos.voterGroups = action.voterGroups;

            return newState;
        case GlobalActions.ActionTypes.LOAD_BANKS_BRANCHES:
            var newState = { ...state };
            newState.banksBranches = action.banksBranches;

            return newState;

        default:
            return state;
    }
}

export default globalReducer;