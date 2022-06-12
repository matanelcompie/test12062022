import Axios from 'axios';
import _ from 'lodash';
import errors from '../libs/errors';

import * as SystemActions from './SystemActions';
import * as CrmActions from './CrmActions';


/**
 * Voter component action types.
 */
export const ActionTypes = {

    VOTER_SEARCH: {
        SET_LEVEL: 'VOTER_SEARCH.SET_LEVEL',
        SET_SEARCH_PARAMS: 'VOTER_SEARCH.SET_SEARCH_PARAMS',
        SET_SEARCH_PARAMS_CITY_VALUE: 'VOTER_SEARCH.SET_SEARCH_PARAMS_CITY_VALUE',
        CLEAN_DATA: 'VOTER_SEARCH.CLEAN_DATA',
        CLEAN_MULTI_COMBO: 'VOTER_SEARCH.CLEAN_MULTI_COMBO',
        SET_EMPTY_FILTER: 'VOTER_SEARCH.SET_EMPTY_FILTER',
        SET_FILTER_ERROR_MSG: 'VOTER_SEARCH.SET_FILTER_ERROR_MSG',
        TOGGLE_AGE_LIMIT: 'VOTER_SEARCH.TOGGLE_AGE_LIMIT',
        DISABLE_NEW_SEARCH: 'VOTER_SEARCH.DISABLE_NEW_SEARCH',
        MAXIMUM_EXECUTION_TIME: 'VOTER_SEARCH.MAXIMUM_EXECUTION_TIME',
        FETCH_DATA_BEGIN: 'VOTER_SEARCH.FETCH_DATA_BEGIN',
        FETCH_DATA_END: 'VOTER_SEARCH.FETCH_DATA_END',
        SET_ROW_COUNT: 'VOTER_SEARCH.SET_ROW_COUNT',
        FILL_VOTER_DETAILS: 'VOTER_SEARCH.FILL_VOTER_DETAILS',
        REDIRECT_TO_REQUEST_CREATOR_PAGE: 'VOTER_SEARCH.REDIRECT_TO_REQUEST_CREATOR_PAGE',
        RESET_SEARCH_RESULT: 'VOTER_SEARCH.RESET_SEARCH_RESULT',
        SET_SELECTED_VOTER_FOR_REDIRECT: 'VOTER_SEARCH.SET_SELECTED_VOTER_FOR_REDIRECT',
        CLEAN_SELECTED_VOTER_FOR_REDIRECT: 'VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT',
        LOAD_CITY_STREETS: "VOTER_SEARCH.LOAD_CITY_STREETS",
        LOADED_GENERAL_STREETS: "VOTER_SEARCH.LOADED_GENERAL_STREETS",
        SET_SEARCH_PARAMS_STREET_VALUE: 'VOTER_SEARCH.SET_SEARCH_PARAMS_STREET_VALUE',
        END: 'VOTER_SEARCH.END',
        /*=*/
        // BEGIN: 'VOTER_SEARCH.BEGIN',
        SET_ROW_SELECTED: 'VOTER_SEARCH.SET_ROW_SELECTED',
        FOUND_TEMP_VOTER: 'VOTER_SEARCH.FOUND_TEMP_VOTER',
        VOTER_SEARCH_SCROLLER: 'VOTER_SEARCH.VOTER_SEARCH_SCROLLER',

    },
    VOTER: {
        CLEAN_ALL_VOTER_DATA: 'VOTER.CLEAN_ALL_VOTER_DATA',
        VOTER_SET_DETAILS: 'VOTER.VOTER_SET_DETAILS',
        VOTER_BIRTH_DATE_INPUT_CHANGE: 'VOTER.VOTER_BIRTH_DATE_INPUT_CHANGE',
        VOTER_BIRTH_DATE_TYPE_INPUT_CHANGE: 'VOTER.VOTER_BIRTH_DATE_TYPE_INPUT_CHANGE',
		GENERAL_FIELD_CHANGE: 'VOTER.GENERAL_FIELD_CHANGE',
        VOTER_CITY_INPUT_CHANGE: 'VOTER.VOTER_CITY_INPUT_CHANGE',
        VOTER_STREET_INPUT_CHANGE: 'VOTER.VOTER_STREET_INPUT_CHANGE',
        VOTER_HOUSE_INPUT_CHANGE: 'VOTER.VOTER_HOUSE_INPUT_CHANGE',
        VOTER_ZIP_INPUT_CHANGE: 'VOTER.VOTER_ZIP_INPUT_CHANGE',
        VOTER_NEIGHBORHOOD_INPUT_CHANGE: 'VOTER.VOTER_NEIGHBORHOOD_INPUT_CHANGE',
        VOTER_HOUSE_ENTRY_INPUT_CHANGE: 'VOTER.VOTER_HOUSE_ENTRY_INPUT_CHANGE',
        VOTER_FLAT_INPUT_CHANGE: 'VOTER.VOTER_FLAT_INPUT_CHANGE',
        VOTER_DISTRIBUTION_CODE_CHANGE: 'VOTER.VOTER_DISTRIBUTION_CODE_CHANGE',
        VOTER_SEPHARDI_CHANGE: 'VOTER.VOTER_SEPHARDI_CHANGE',
        VOTER_GENDER_CHANGE: 'VOTER.VOTER_GENDER_CHANGE',
        VOTER_COUNTRY_CHANGE: 'VOTER.VOTER_COUNTRY_CHANGE',
        VOTER_ETHNIC_CHANGE: 'VOTER.VOTER_ETHNIC_CHANGE',
        VOTER_RELIGIOUS_GROUP_CHANGE: 'VOTER.VOTER_RELIGIOUS_GROUP_CHANGE',
        VOTER_TITLE_CHANGE: 'VOTER.VOTER_TITLE_CHANGE',
        VOTER_ENDING_CHANGE: 'VOTER.VOTER_ENDING_CHANGE',
        VOTER_PHONE_NUMBER_INPUT_CHANGE: 'VOTER.VOTER_PHONE_NUMBER_INPUT_CHANGE',
        VOTER_PHONE_TM_CHANGE: 'VOTER.VOTER_PHONE_TM_CHANGE',
        VOTER_PHONE_SMS_CHANGE: 'VOTER.VOTER_PHONE_SMS_CHANGE',
        VOTER_PHONE_WRONG_CHANGE: 'VOTER.VOTER_PHONE_WRONG_CHANGE',
        VOTER_PHONE_TYPE_CHANGE: 'VOTER.VOTER_PHONE_TYPE_CHANGE',
        VOTER_MAIN_PHONE_CHANGE: 'VOTER.VOTER_MAIN_PHONE_CHANGE',
        VOTER_PHONE_ADD_NEW_PHONE: 'VOTER.VOTER_PHONE_ADD_NEW_PHONE',
        VOTER_PHONE_DELETE_PHONE: 'VOTER.VOTER_PHONE_DELETE_PHONE',
        VOTER_EMAIL_INPUT_CAHNGE: 'VOTER.VOTER_EMAIL_INPUT_CAHNGE',
        VOTER_CONTACT_EMAIL_CHANGE: 'VOTER.VOTER_CONTACT_EMAIL_CHANGE',
        VOTER_CONTACT_UPDATE_PHONES: 'VOTER.VOTER_CONTACT_UPDATE_PHONES',
        VOTER_TAB_CHANGE: 'VOTER.VOTER_TAB_CHANGE',
        VOTER_TAB_LOWER_CHANGE: 'VOTER.VOTER_TAB_LOWER_CHANGE',
        VOTER_REDIRECT_TO_SEARCH: 'VOTER.VOTER_REDIRECT_TO_SEARCH',
        VOTER_EMPTY_SELECTED_VOTER: 'VOTER.VOTER_EMPTY_SELECTED_VOTER',
        VOTER_INIT_EMPTY_PHONES: 'VOTER.VOTER_INIT_EMPTY_PHONES',
        VOTER_INIT_LOWER_TABS_OBJECTS: 'VOTER.VOTER_INIT_LOWER_TABS_OBJECTS',
        VOTER_INIT_CITY_ID: 'VOTER.VOTER_INIT_CITY_ID',
        VOTER_INIT_MI_CITY_ID: 'VOTER.VOTER_INIT_MI_CITY_ID',
        VOTER_CLEAN_ADDRESS: 'VOTER.VOTER_CLEAN_ADDRESS',
        VOTER_UPDATE_ADDRESS_TO_MI_ADDRESS: 'VOTER.VOTER_UPDATE_ADDRESS_TO_MI_ADDRESS',
        VOTER_SHAS_REPRESENTATIVE_CHANGE: 'VOTER.VOTER_SHAS_REPRESENTATIVE_CHANGE',
        VOTER_DETAILS_UPDATE_OLD_VOTER_DETAILS: 'VOTER.VOTER_DETAILS_UPDATE_OLD_VOTER_DETAILS',
        VOTER_SAVING_VOTER_DATA: 'VOTER.VOTER_SAVING_VOTER_DATA',
        VOTER_SAVED_VOTER_DATA: 'VOTER.VOTER_SAVED_VOTER_DATA',
        VOTER_PERSONAL_IDENTITY_CHANGE: 'VOTER.VOTER_PERSONAL_IDENTITY_CHANGE',
        VOTER_FIRST_NAME_CHANGE: 'VOTER.VOTER_FIRST_NAME_CHANGE',
        VOTER_LAST_NAME_CHANGE: 'VOTER.VOTER_LAST_NAME_CHANGE',
        VOTER_FIELD_READONLY_CHANGE: 'VOTER.VOTER_FIELD_READONLY_CHANGE',
        VOTER_DETAILS_CLEAN_DATA: 'VOTER.VOTER_DETAILS_CLEAN_DATA',
        VOTER_SCREEN_TAB_CHANGE: 'VOTER.VOTER_SCREEN_TAB_CHANGE',
        VOTER_SCREEN_CLEAN_DATA: 'VOTER.VOTER_SCREEN_CLEAN_DATA',
        VOTER_SCREEN_OPEN_REQUEST_MODAL_DIALOG: 'VOTER.VOTER_SCREEN_OPEN_REQUEST_MODAL_DIALOG',
        VOTER_SCREEN_CLOSE_REQUEST_MODAL_DIALOG: 'VOTER.VOTER_SCREEN_CLOSE_REQUEST_MODAL_DIALOG',
        VOTER_SCREEN_SET_LOADED_VOTER: 'VOTER.VOTER_SCREEN_SET_LOADED_VOTER',
        VOTER_SCREEN_UNSET_LOADED_VOTER: 'VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER',
        VOTER_SCREEN_LOADING_VOTER: 'VOTER.VOTER_SCREEN_LOADING_VOTER',
        VOTER_SCREEN_UNLOADING_VOTER: 'VOTER.VOTER_SCREEN_UNLOADING_VOTER',
        VOTER_SCREEN_SET_LOADED_VOTER_ELECTIONS_CAMPAIGNS: 'VOTER.VOTER_SCREEN_SET_LOADED_VOTER_ELECTIONS_CAMPAIGNS',
        VOTER_SCREEN_UNSET_LOADED_VOTER_ELECTIONS_CAMPAIGNS: 'VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER_ELECTIONS_CAMPAIGNS',
        VOTER_SCREEN_COLLAPSE_CHANGE: 'VOTER.VOTER_SCREEN_COLLAPSE_CHANGE',
        VOTER_SCREEN_SET_COLLAPSE: 'VOTER.VOTER_SCREEN_SET_COLLAPSE',
        VOTER_SCREEN_UNSET_COLLAPSE: 'VOTER.VOTER_SCREEN_UNSET_COLLAPSE',
        VOTER_SCREEN_UPDATE_TAB_SECTION: 'VOTER.VOTER_SCREEN_UPDATE_TAB_SECTION',
        VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_ACTION: 'VOTER.VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_ACTION',
        VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_DOCUMENT: 'VOTER.VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_DOCUMENT',
        VOTER_ACTION_ADD_SHOW_SCREEN: 'VOTER.VOTER_ACTION_ADD_SHOW_SCREEN',
        VOTER_ACTION_ADD_HIDE_SCREEN: 'VOTER.VOTER_ACTION_ADD_HIDE_SCREEN',
        VOTER_ACTION_ADD_EMPTY_DETAILS: 'VOTER.VOTER_ACTION_ADD_EMPTY_DETAILS',
        VOTER_ACTION_TYPES_LOAD: 'VOTER.VOTER_ACTION_TYPES_LOAD',
        VOTER_ACTION_EDIT_ENABLE_EDITING: 'VOTER.VOTER_ACTION_EDIT_ENABLE_EDITING',
        VOTER_ACTION_EDIT_DISABLE_EDITING: 'VOTER.VOTER_ACTION_EDIT_DISABLE_EDITING',
        VOTER_ACTION_STATUSES_LOAD: 'VOTER.VOTER_ACTION_STATUSES_LOAD',
        VOTER_ACTION_TOPICS_LOAD: 'VOTER.VOTER_ACTION_TOPICS_LOAD',
        VOTER_ACTION_LOAD_TOPICS_BY_TYPE: 'VOTER.VOTER_ACTION_LOAD_TOPICS_BY_TYPE',
        VOTER_NEW_ACTION_INPUT_CHANGE: 'VOTER.VOTER_NEW_ACTION_INPUT_CHANGE',
        VOTER_EDIT_ACTION_INPUT_CHANGE: 'VOTER.VOTER_EDIT_ACTION_INPUT_CHANGE',
        VOTER_LOAD_ALL_VOTER_ACTIONS: 'VOTER.VOTER_LOAD_ALL_VOTER_ACTIONS',
        VOTER_LOAD_ALL_VOTER_TM_POLLS: 'VOTER.VOTER_LOAD_ALL_VOTER_TM_POLLS',
        VOTER_LOAD_ALL_VOTER_REQUESTS: 'VOTER.VOTER_LOAD_ALL_VOTER_REQUESTS',
        VOTER_REPRESENTATIVE_SHOW_NEW_ROW: 'VOTER.VOTER_REPRESENTATIVE_SHOW_NEW_ROW',
        VOTER_REPRESENTATIVE_HIDE_NEW_ROW: 'VOTER.VOTER_REPRESENTATIVE_HIDE_NEW_ROW',
        VOTER_REPRESENTATIVE_LOAD_ROLES: 'VOTER.VOTER_REPRESENTATIVE_LOAD_ROLES',
        VOTER_REPRESENTATIVE_CITY_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_CITY_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_CITY_ID_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_CITY_ID_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_ROLE_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_ROLE_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_ROLE_ID_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_ROLE_ID_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_START_DATE_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_START_DATE_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_END_DATE_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_END_DATE_INPUT_CHANGE',
        VOTER_LOAD_ALL_VOTER_REPRESENTATIVES: 'VOTER.VOTER_LOAD_ALL_VOTER_REPRESENTATIVES',
        VOTER_REPRESENTATIVE_DELETE_SHOW_MODAL_DIALOG: 'VOTER.VOTER_REPRESENTATIVE_DELETE_SHOW_MODAL_DIALOG',
        VOTER_REPRESENTATIVE_DELETE_HIDE_MODAL_DIALOG: 'VOTER.VOTER_REPRESENTATIVE_DELETE_HIDE_MODAL_DIALOG',
        VOTER_REPRESENTATIVE_ENABLE_EDITING: 'VOTER.VOTER_REPRESENTATIVE_ENABLE_EDITING',
        VOTER_REPRESENTATIVE_DISABLE_EDITING: 'VOTER.VOTER_REPRESENTATIVE_DISABLE_EDITING',
        VOTER_REPRESENTATIVE_EDIT_CITY_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_EDIT_CITY_ID_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_ID_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_EDIT_ROLE_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_EDIT_ROLE_ID_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_ID_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_EDIT_START_DATE_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_START_DATE_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_EDIT_END_DATE_INPUT_CHANGE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_END_DATE_INPUT_CHANGE',
        VOTER_REPRESENTATIVE_DELETE_REPRESENTATIVE_FROM_STATE: 'VOTER.VOTER_REPRESENTATIVE_DELETE_REPRESENTATIVE_FROM_STATE',
        VOTER_REPRESENTATIVE_EDIT_REPRESENTATIVE_IN_STATE: 'VOTER.VOTER_REPRESENTATIVE_EDIT_REPRESENTATIVE_IN_STATE',
        VOTER_REPRESENTATIVE_BACKUP_FROM_STATE: 'VOTER.VOTER_REPRESENTATIVE_BACKUP_FROM_STATE',
        VOTER_REPRESENTATIVE_ADD_REPRESENTATIVE_TO_STATE: 'VOTER.VOTER_REPRESENTATIVE_ADD_REPRESENTATIVE_TO_STATE',
        CLOSE_MODAL_DIALOG: 'VOTER.CLOSE_MODAL_DIALOG',
        VOTER_GROUPS_LOAD_ALL_GROUPS: 'VOTER.VOTER_GROUPS_LOAD_ALL_GROUPS',
        VOTER_GROUPS_LOAD_VOTER_GROUPS: 'VOTER.VOTER_GROUPS_LOAD_VOTER_GROUPS',
        VOTER_GROUPS_ADD_TO_NEW_SELECTED_GROUPS: 'VOTER.VOTER_GROUPS_ADD_TO_NEW_SELECTED_GROUPS',
        VOTER_GROUPS_SHOW_NEW_GROUP_MODAL_DIALOG: 'VOTER.VOTER_GROUPS_SHOW_NEW_GROUP_MODAL_DIALOG',
        VOTER_GROUPS_HIDE_NEW_GROUP_MODAL_DIALOG: 'VOTER.VOTER_GROUPS_HIDE_NEW_GROUP_MODAL_DIALOG',
        VOTER_GROUPS_LOAD_ITEM_SELECTED_GROUPS: 'VOTER.VOTER_GROUPS_LOAD_ITEM_SELECTED_GROUPS',
        VOTER_GROUPS_DELETE_SHOW_MODAL_DIALOG: 'VOTER.VOTER_GROUPS_DELETE_SHOW_MODAL_DIALOG',
        VOTER_GROUPS_DELETE_HIDE_MODAL_DIALOG: 'VOTER.VOTER_GROUPS_DELETE_HIDE_MODAL_DIALOG',
        VOTER_GROUPS_SET_LOADED_VOTER_GROUPS: 'VOTER.VOTER_GROUPS_SET_LOADED_VOTER_GROUPS',
        VOTER_GROUPS_UNSET_LOADED_VOTER_GROUPS: 'VOTER.VOTER_GROUPS_UNSET_LOADED_VOTER_GROUPS',
        VOTER_GROUPS_SET_LOADED_ALL_GROUPS: 'VOTER.VOTER_GROUPS_SET_LOADED_ALL_GROUPS',
        VOTER_GROUPS_UNSET_LOADED_ALL_GROUPS: 'VOTER.VOTER_GROUPS_UNSET_LOADED_ALL_GROUPS',
        VOTER_GROUPS_SHOW_ITEM_GROUP_MODAL_DIALOG: 'VOTER.VOTER_GROUPS_SHOW_ITEM_GROUP_MODAL_DIALOG',
        VOTER_GROUPS_HIDE_ITEM_GROUP_MODAL_DIALOG: 'VOTER.VOTER_GROUPS_HIDE_ITEM_GROUP_MODAL_DIALOG',
        VOTER_GROUPS_EDIT_ITEM_SELECTED_GROUPS: 'VOTER.VOTER_GROUPS_EDIT_ITEM_SELECTED_GROUPS',
        VOTER_GROUPS_DELETE_GROUP_FROM_STATE: 'VOTER.VOTER_GROUPS_DELETE_GROUP_FROM_STATE',
        VOTER_GROUPS_EDIT_GROUP_IN_STATE: 'VOTER.VOTER_GROUPS_EDIT_GROUP_IN_STATE',
        VOTER_GROUPS_ADD_GROUP_TO_STATE: 'VOTER.VOTER_GROUPS_ADD_GROUP_TO_STATE',
        VOTER_USER_LOAD_SYSTEM_USER_DETAILS: 'VOTER.VOTER_USER_LOAD_SYSTEM_USER_DETAILS',
        VOTER_USER_LOAD_SYSTEM_USER_GEOGRAPHIC_FILTERS: 'VOTER.VOTER_USER_LOAD_SYSTEM_USER_GEOGRAPHIC_FILTERS',
        VOTER_USER_LOAD_SYSTEM_USER_SECTORIAL_FILTERS: 'VOTER.VOTER_USER_LOAD_SYSTEM_USER_SECTORIAL_FILTERS',
        VOTER_SCREEN_UPDATE_LAST_CAMPAIGN_ID: 'VOTER.VOTER_SCREEN_UPDATE_LAST_CAMPAIGN_ID',
        VOTER_SCREEN_LOAD_HOUSEHOLD_VOTERS: 'VOTER.VOTER_SCREEN_LOAD_HOUSEHOLD_VOTERS',
        VOTER_SCREEN_LOAD_VOTER_SUPPORT_STATUSES: 'VOTER.VOTER_SCREEN_LOAD_VOTER_SUPPORT_STATUSES',
        VOTER_SCREEN_LOAD_VOTER_CAMPAIGNS_SUPPORT_STATUSES: 'VOTER.VOTER_SCREEN_LOAD_VOTER_CAMPAIGNS_SUPPORT_STATUSES',
        VOTER_SCREEN_SUPPORT_STATUS_CHANGE: 'VOTER.VOTER_SCREEN_SUPPORT_STATUS_CHANGE',
        VOTER_PATTERNAL_SHOW_MODAL_ALL_HOUSEHOLDS: 'VOTER.VOTER_PATTERNAL_SHOW_MODAL_ALL_HOUSEHOLDS',
        VOTER_PATTERNAL_HIDE_MODAL_ALL_HOUSEHOLDS: 'VOTER.VOTER_PATTERNAL_HIDE_MODAL_ALL_HOUSEHOLDS',
        VOTER_PATTERNAL_SHOW_MODAL_HOUSEHOLD: 'VOTER.VOTER_PATTERNAL_SHOW_MODAL_HOUSEHOLD',
        VOTER_PATTERNAL_CHANGE_ITEM_ELECTION_STATUS: 'VOTER.VOTER_PATTERNAL_CHANGE_ITEM_ELECTION_STATUS',
        VOTER_PATTERNAL_ENABLE_EDIT_ITEM_STATUS: 'VOTER.VOTER_PATTERNAL_ENABLE_EDIT_ITEM_STATUS',
        VOTER_PATTERNAL_DISABLE_EDIT_ITEM_STATUS: 'VOTER.VOTER_PATTERNAL_DISABLE_EDIT_ITEM_STATUS',
        VOTER_PATTERNAL_SHOW_DELETE_STATUS_MODAL_DIALOG: 'VOTER.VOTER_PATTERNAL_SHOW_DELETE_STATUS_MODAL_DIALOG',
        VOTER_PATTERNAL_HIDE_DELETE_STATUS_MODAL_DIALOG: 'VOTER.VOTER_PATTERNAL_HIDE_DELETE_STATUS_MODAL_DIALOG',
        VOTER_ADDITIONAL_DATA_TEXT_INPUT_CHANGE: 'VOTER.VOTER_ADDITIONAL_DATA_TEXT_INPUT_CHANGE',
        VOTER_ADDITIONAL_DATA_NUMBER_INPUT_CHANGE: 'VOTER.VOTER_ADDITIONAL_DATA_NUMBER_INPUT_CHANGE',
        VOTER_ADDITIONAL_DATA_COMBO_CHANGE: 'VOTER.VOTER_ADDITIONAL_DATA_COMBO_CHANGE',
        VOTER_LOAD_META_DATA_KEYS: 'VOTER.VOTER_LOAD_META_DATA_KEYS',
        VOTER_LOAD_META_DATA_VOLUNTEER_KEYS: 'VOTER.VOTER_LOAD_META_DATA_VOLUNTEER_KEYS',
        VOTER_LOAD_ALL_META_DATA_VALUES: 'VOTER.VOTER_LOAD_ALL_META_DATA_VALUES',
        VOTER_SET_VOTER_HASH_META_TABLE: 'VOTER.VOTER_SET_VOTER_HASH_META_TABLE',
        VOTER_ERROR_LOADING_VOTER_MODAL_SHOW: 'VOTER.VOTER_ERROR_LOADING_VOTER_MODAL_SHOW',
        VOTER_ERROR_LOADING_VOTER_MODAL_HIDE: 'VOTER.VOTER_ERROR_LOADING_VOTER_MODAL_HIDE',
        VOTER_SEARCH_PERSONAL_IDENTITY_CHANGE: 'VOTER.VOTER_SEARCH_PERSONAL_IDENTITY_CHANGE',
        VOTER_ADDRESS_SHOW_UPDATE_HOUSEHOLD_ADDRESS_MODAL: 'VOTER.VOTER_ADDRESS_SHOW_UPDATE_HOUSEHOLD_ADDRESS_MODAL',
        VOTER_ADDRESS_HIDE_UPDATE_HOUSEHOLD_ADDRESS_MODAL: 'VOTER.VOTER_ADDRESS_HIDE_UPDATE_HOUSEHOLD_ADDRESS_MODAL',
        VOTER_ADDRESS_ACTUAL_ADDRESS_CORRECT_CHANGE: 'VOTER.VOTER_ADDRESS_ACTUAL_ADDRESS_CORRECT_CHANGE',
        VOTER_ADDRESS_SHOW_ACTUAL_ADDRESS_CORRECT_MODAL: 'VOTER.VOTER_ADDRESS_SHOW_ACTUAL_ADDRESS_CORRECT_MODAL',
        VOTER_ADDRESS_HIDE_ACTUAL_ADDRESS_CORRECT_MODAL: 'VOTER.VOTER_ADDRESS_HIDE_ACTUAL_ADDRESS_CORRECT_MODAL',
        VOTER_MAIN_BLOCK_SUPPORT_STATUS_CHANGE: 'VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_CHANGE',
        VOTER_CONTACT_UPDATE_EMAIL: 'VOTER.VOTER_CONTACT_UPDATE_EMAIL',
        VOTER_ACTION_SHOW_DELETE_MODAL_DIALOG: 'VOTER.VOTER_ACTION_SHOW_DELETE_MODAL_DIALOG',
        VOTER_ACTION_HIDE_DELETE_MODAL_DIALOG: 'VOTER.VOTER_ACTION_HIDE_DELETE_MODAL_DIALOG',
        VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE: 'VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE',
        VOTER_PHONE_SHOW_ERROR_MODAL: 'VOTER.VOTER_PHONE_SHOW_ERROR_MODAL',
        VOTER_PHONE_HIDE_ERROR_MODAL: 'VOTER.VOTER_PHONE_HIDE_ERROR_MODAL',
        VOTER_PHONE_CHECK_UPDATE_PHONE_TO_DELETE: 'VOTER.VOTER_PHONE_CHECK_UPDATE_PHONE_TO_DELETE',
        VOTER_PHONE_UPDATE_DELETE_ALL: 'VOTER.VOTER_PHONE_UPDATE_DELETE_ALL',
        VOTER_PHONE_SHOW_WARNING_PHONE_DELETION_MODAL: 'VOTER.VOTER_PHONE_SHOW_WARNING_PHONE_DELETION_MODAL',
        VOTER_PHONE_HIDE_WARNING_PHONE_DELETION_MODAL: 'VOTER.VOTER_PHONE_HIDE_WARNING_PHONE_DELETION_MODAL',
        VOTER_CONTACT_UNDO_CHANGES: 'VOTER.VOTER_CONTACT_UNDO_CHANGES',
        VOTER_ADDRESS_LOAD_VOTER_CITY_STREETS: 'VOTER.VOTER_ADDRESS_LOAD_VOTER_CITY_STREETS',
        VOTER_ADDRESS_INIT_VOTER_STREET_ID: 'VOTER.VOTER_ADDRESS_INIT_VOTER_STREET_ID',
        VOTER_ADDRESS_UPDATE_OLD_VOTER_ADDRESS: 'VOTER.VOTER_ADDRESS_UPDATE_OLD_VOTER_ADDRESS',
        VOTER_DETAILS_UNDO_CHANGES: 'VOTER.VOTER_DETAILS_UNDO_CHANGES',
        VOTER_ADDRESS_UNDO_CHANGES: 'VOTER.VOTER_ADDRESS_UNDO_CHANGES',
        VOTER_META_DATA_UNDO_CHANGES: 'VOTER.VOTER_META_DATA_UNDO_CHANGES',
        VOTER_UPDATE_BANK_DETAILS: 'VOTER.VOTER_UPDATE_BANK_DETAILS',
    },
    ACTIVIST: {
        ROLES_LOADED: 'ACTIVIST.ROLES_LOADED',
        ROLE_SHIFTS_LOADED: 'ACTIVIST.ROLE_SHIFTS_LOADED',
        VOTER_ROLES_LOADED: 'ACTIVIST.VOTER_ROLES_LOADED',
        ACTIVIST_DELETE_HIDE_MODAL_DIALOG: 'ACTIVIST.ACTIVIST_DELETE_HIDE_MODAL_DIALOG',
        ACTIVIST_DELETE_SHOW_MODAL_DIALOG: 'ACTIVIST.ACTIVIST_DELETE_SHOW_MODAL_DIALOG',
        ACTIVIST_SHOW_ADD_ROLE_DIALOG: 'ACTIVIST.ACTIVIST_SHOW_ADD_ROLE_DIALOG',
        ACTIVIST_HIDE_ADD_ROLE_DIALOG: 'ACTIVIST.ACTIVIST_HIDE_ADD_ROLE_DIALOG',
        ACTIVIST_ADD_SHOW_MODAL_DIALOG: 'ACTIVIST.ACTIVIST_ADD_SHOW_MODAL_DIALOG',
        ACTIVIST_ADD_HIDE_MODAL_DIALOG: 'ACTIVIST.ACTIVIST_ADD_HIDE_MODAL_DIALOG',
        CHANGE_ELECTION_CAMP_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_CAMP_NEW_ROW',
        CHANGE_ELECTION_ROLE_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_ROLE_NEW_ROW',
        CHANGE_ELECTION_ROLE_SHIFT_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_ROLE_SHIFT_NEW_ROW',
        CHANGE_ELECTION_AREA_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_AREA_NEW_ROW',
        CHANGE_ELECTION_CITY_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_CITY_NEW_ROW',
        CHANGE_ELECTION_NEIGHBORHOOD_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_NEIGHBORHOOD_NEW_ROW',
        CHANGE_ELECTION_CLUSTER_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_CLUSTER_NEW_ROW',
        CHANGE_ELECTION_BALLOT_NEW_ROW: 'ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW',
        ACTIVIST_EDIT_SHOW_MODAL_DIALOG: 'ACTIVIST.ACTIVIST_EDIT_SHOW_MODAL_DIALOG',
        INJECT_EXISTING_ROLE_DATA: 'ACTIVIST.INJECT_EXISTING_ROLE_DATA',
        LOADED_ALL_CAMPAIGNS: 'ACTIVIST.LOADED_ALL_CAMPAIGNS',
        NEW_CAMP_NAME_CHANGE: 'ACTIVIST.NEW_CAMP_NAME_CHANGE',
        NEW_ROLE_NAME_CHANGE: 'ACTIVIST.NEW_ROLE_NAME_CHANGE',
        ACTIVIST_SHOW_ERROR_DLG: 'ACTIVIST.ACTIVIST_SHOW_ERROR_DLG',
        SET_ROW_EDITING: 'ACTIVIST.SET_ROW_EDITING',
        UNSET_ROW_EDITING: 'ACTIVIST.UNSET_ROW_EDITING',
        CHANGE_ROW_CAMPAIGN: 'ACTIVIST.CHANGE_ROW_CAMPAIGN',
        CHANGE_ROW_ROLE: 'ACTIVIST.CHANGE_ROW_ROLE',
        CHANGE_ROW_ROLE_ID: 'ACTIVIST.CHANGE_ROW_ROLE_ID',
        GEO_ENTITY_DELETE_SHOW_MODAL_DIALOG: 'ACTIVIST.GEO_ENTITY_DELETE_SHOW_MODAL_DIALOG',
        GEO_ENTITY_EDIT_ROW_CHANGE: 'ACTIVIST.GEO_ENTITY_EDIT_ROW_CHANGE',
        GEO_ENTITY_ADD_ROW_CHANGE: 'ACTIVIST.GEO_ENTITY_ADD_ROW_CHANGE',
        GEO_ENTITY_DELETE_ROW_CHANGE: 'ACTIVIST.GEO_ENTITY_DELETE_ROW_CHANGE',
        VOTER_MINISTER_OF_FIFTY_LOADED: 'ACTIVIST.VOTER_MINISTER_OF_FIFTY_LOADED',
        ACTIVIST_FIFTY_MINISTER_DELETE_SHOW_MODAL_DIALOG: 'ACTIVIST.ACTIVIST_FIFTY_MINISTER_DELETE_SHOW_MODAL_DIALOG',
        FIFTY_MINISTER_HIDE_MODAL_DIALOG: 'ACTIVIST.FIFTY_MINISTER_HIDE_MODAL_DIALOG',
        FIFTY_MINISTER_ADD_SHOW_MODAL_DIALOG: 'ACTIVIST.FIFTY_MINISTER_ADD_SHOW_MODAL_DIALOG',
        FIFTY_MINISTER_EDIT_SHOW_MODAL_DIALOG: 'ACTIVIST.FIFTY_MINISTER_EDIT_SHOW_MODAL_DIALOG',
        FIFTY_MINISTER_ADD_CAPTAIN_OF_FIFTY: 'ACTIVIST.FIFTY_MINISTER_ADD_CAPTAIN_OF_FIFTY',
        FIFTY_MINISTER_EDIT_CAPTAIN_OF_FIFTY: 'ACTIVIST.FIFTY_MINISTER_EDIT_CAPTAIN_OF_FIFTY',
        LOADED_FIFTY_MINISTER_VOTER_BY_ID: 'ACTIVIST.LOADED_FIFTY_MINISTER_VOTER_BY_ID',
        FIFTY_MINISTER_SHOW_ERROR_DLG: 'ACTIVIST.FIFTY_MINISTER_SHOW_ERROR_DLG',
        VOTER_MINISTER_OF_FIFTY_UNSET: 'ACTIVIST.VOTER_MINISTER_OF_FIFTY_UNSET',
        VOTER_CAMPAIGN_METADATA_LOADED: 'ACTIVIST.VOTER_CAMPAIGN_METADATA_LOADED',
        LOAD_VOTER_META_WILLING_VOLUNTEERS: 'ACTIVIST.LOAD_VOTER_META_WILLING_VOLUNTEERS',
        LOAD_VOTER_META_AGREE_SIGN: 'ACTIVIST.LOAD_VOTER_META_AGREE_SIGN',
        LOAD_VOTER_META_EXP_MATERIAL: 'ACTIVIST.LOAD_VOTER_META_EXP_MATERIAL',
        CHANGE_VOTER_META_COMBO_VALUE: 'ACTIVIST.CHANGE_VOTER_META_COMBO_VALUE',
        VOTER_ROLE_SAVE_IN_STATE: 'ACTIVIST.VOTER_ROLE_SAVE_IN_STATE',
        VOTER_ROLE_DELETE_FROM_STATE: 'ACTIVIST.VOTER_ROLE_DELETE_FROM_STATE',
        SEARCH_ACTIVIST_FIELD_CHANGE: 'ACTIVIST:SEARCH_ACTIVIST_FIELD_CHANGE',
        FOUND_SEARCH_ACTIVIST_RESULTS: 'ACTIVIST.FOUND_SEARCH_ACTIVIST_RESULTS',
        SET_SEARCHING_VOTER_ACTIVIST: 'ACTIVIST.SET_SEARCHING_VOTER_ACTIVIST',
        SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE: 'ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE',
        CLEAR_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE: 'ACTIVIST.CLEAR_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE',
        SET_ADDING_NEW_VOTER_ACTIVIST_ROLE: 'ACTIVIST.SET_ADDING_NEW_VOTER_ACTIVIST_ROLE',
        SET_EDITING_EXISTING_VOTER_ACTIVIST_ROLE: 'ACTIVIST.SET_EDITING_EXISTING_VOTER_ACTIVIST_ROLE',
        CLEAR_ALL_SEARCH_FIELDS_AND_RESULTS: 'ACTIVIST.CLEAR_ALL_SEARCH_FIELDS_AND_RESULTS',
        SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE: 'ACTIVIST:SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE',
        SET_BOTTOM_TOTAL_ERROR: 'ACTIVIST.SET_BOTTOM_TOTAL_ERROR',
        ADDED_VOTER_ACTIVIST_ROLE: 'ACTIVIST.ADDED_VOTER_ACTIVIST_ROLE',
        FETCHED_MINIMAL_VOTER_DATA: 'ACTIVIST.FETCHED_MINIMAL_VOTER_DATA',
        ACTIVIST_HOUSEHOLDS_SCREEN_TAB_CHANGE: 'ACTIVIST.ACTIVIST_HOUSEHOLDS_SCREEN_TAB_CHANGE',
        FETCHED_VOTER_ACTIVIST_HOUSEHOLDS_DATA: 'ACTIVIST.FETCHED_VOTER_ACTIVIST_HOUSEHOLDS_DATA',
        SET_CONFIRM_DELETE: 'ACTIVIST.SET_CONFIRM_DELETE',
        CHANGE_RECORD_BASIC_DATA: 'ACTIVIST.CHANGE_RECORD_BASIC_DATA',
        TABLE_CONTENT_UPDATED: 'ACTIVIST.TABLE_CONTENT_UPDATED',
        RESET_RESULTS_DATA: 'ACTIVIST.RESET_RESULTS_DATA',

        ALLOACATE_VOTER_TO_CAPTAIN50: 'ACTIVIST.ALLOACATE_VOTER_TO_CAPTAIN50',
        UNALLOACATE_VOTER_TO_CAPTAIN50: 'ACTIVIST.UNALLOACATE_VOTER_TO_CAPTAIN50'
    },
    EXTRA_DATA: {
        LOADED_DEATH_DATA: 'EXTRA_DATA.LOADED_DEATH_DATA',
        LOADED_KEYS_VALUES_DATA: 'EXTRA_DATA.LOADED_KEYS_VALUES_DATA',
        DEATH_STATUS_CHANGE: 'EXTRA_DATA.DEATH_STATUS_CHANGE',
        DEATH_DATE_CHANGE: 'EXTRA_DATA.DEATH_DATE_CHANGE',
        FIELD_VALUE_CHANGED: 'EXTRA_DATA.FIELD_VALUE_CHANGED',
    },
    VOTER_SUPPORT: {
        SUPPORTS_STATUSES_LOADED: 'VOTER_SUPPORT.SUPPORTS_STATUSES_LOADED',
        LOADED_VOTER_SUPPORT_DATA: 'VOTER_SUPPORT.LOADED_VOTER_SUPPORT_DATA',
        SUPPORT_STATUS_CHANGE: 'VOTER_SUPPORT.SUPPORT_STATUS_CHANGE',
    },
    VOTER_INSTITUTE: {
        ENABLE_ADDING_NEW_INSTITUTE: 'VOTER_INSTITUTE.ENABLE_ADDING_NEW_INSTITUTE',
        DISABLE_ADDING_NEW_INSTITUTE: 'VOTER_INSTITUTE.DISABLE_ADDING_NEW_INSTITUTE',
        SHOW_DELETE_MODAL_DIALOG: 'VOTER_INSTITUTE.SHOW_DELETE_MODAL_DIALOG',
        HIDE_DELETE_MODAL_DIALOG: 'VOTER_INSTITUTE.HIDE_DELETE_MODAL_DIALOG',
        NEW_INSTITUTE_FIELD_CHANGE: 'VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE',
        ADD_NEW_INSTITUTE_TO_STATE: 'VOTER_INSTITUTE.ADD_NEW_INSTITUTE_TO_STATE',
        DELETE_INSTITUTE_FROM_STATE: 'VOTER_INSTITUTE.DELETE_INSTITUTE_FROM_STATE',
        LOAD_INSTITUTE_GROUPS: 'VOTER_INSTITUTE.LOAD_INSTITUTE_GROUPS',
        LOAD_INSTITUTE_TYPES: 'VOTER_INSTITUTE.LOAD_INSTITUTE_TYPES',
        LOAD_INSTITUTE_ROLES: 'VOTER_INSTITUTE.LOAD_INSTITUTE_ROLES',
        LOAD_INSTITUTE_NETWORKS: 'VOTER_INSTITUTE.LOAD_INSTITUTE_NETWORKS',
        LOAD_ALL_INSTITUTES: 'VOTER_INSTITUTE.LOAD_ALL_INSTITUTES',
        LOAD_VOTER_INSTITUTES: 'VOTER_INSTITUTE.LOAD_VOTER_INSTITUTES',
        ENABLE_EDITING_INSTITUTE: 'VOTER_INSTITUTE.ENABLE_EDITING_INSTITUTE',
        DISABLE_EDITING_INSTITUTE: 'VOTER_INSTITUTE.DISABLE_EDITING_INSTITUTE',
        BACKUP_FROM_STATE: 'VOTER_INSTITUTE.BACKUP_FROM_STATE',
        EDIT_INSTITUTE_FIELD_CHANGE: 'VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE'
    },

    VOTER_ELECTION_CAMPAIGN: {
        LOADED_CAMPAIGNS_BY_VOTER: 'VOTER_ELECTION_CAMPAIGN.LOADED_CAMPAIGNS_BY_VOTER',
        LOAD_VOTE_SOURCES: 'VOTER_ELECTION_CAMPAIGN.LOAD_VOTE_SOURCES',
        ENABLE_ROW_EDITING: 'VOTER_ELECTION_CAMPAIGN.ENABLE_ROW_EDITING',
        DISABLE_ROW_EDITING: 'VOTER_ELECTION_CAMPAIGN.DISABLE_ROW_EDITING',
        SAVE_IN_STATE: 'VOTER_ELECTION_CAMPAIGN.SAVE_IN_STATE',
        TRANSPORT_CHANGE: 'VOTER_ELECTION_CAMPAIGN.TRANSPORT_CHANGE',
        TRANSPORT_DATE_CHANGE: 'VOTER_ELECTION_CAMPAIGN.TRANSPORT_DATE_CHANGE',
        VOTER_DID_VOTE_CHANGE: 'VOTER_ELECTION_CAMPAIGN.VOTER_DID_VOTE_CHANGE'
    },
    ADDRESSES: {
        LOADED_ALL_AREAS: 'ADDRESSES.LOADED_ALL_AREAS',
        LOADED_ALL_CITIES: 'ADDRESSES.LOADED_ALL_CITIES',
        LOADED_ALL_NEIGHBORHOODS: 'ADDRESSES.LOADED_ALL_NEIGHBORHOODS',
        LOADED_ALL_CLUSTERS: 'ADDRESSES.LOADED_ALL_CLUSTERS',
        LOADED_ALL_BALLOTS: 'ADDRESSES.LOADED_ALL_BALLOTS',
    },
    VOTER_DIALER_WINDOW: {
        TOGGLE_CALL_BOX: 'VOTER_DIALER_WINDOW.TOGGLE_CALL_BOX',
        DISPLAY_CALL_BOX: 'VOTER_DIALER_WINDOW.DISPLAY_CALL_BOX',
        SET_WEB_DIALER: 'VOTER_DIALER_WINDOW.SET_WEB_DIALER',
        SET_CALL_DATA: 'VOTER_DIALER_WINDOW.SET_CALL_DATA',
        SET_CALL_STATUS: 'VOTER_DIALER_WINDOW.SET_CALL_STATUS'
    }
};

// export function loadTestVoters(dispatch, votersPage) {
//     dispatch({type: ActionTypes.TEST_LOADING_VOTERS});
//     Axios({
//         url: window.Laravel.baseURL + 'api/testGetVoters',
//         method: 'get',
//         params: {
//             page: votersPage
//         }
//     })
//         .then(function (result) {
//             dispatch({type: ActionTypes.TEST_LOADED_VOTERS, voters: result.data.data});
//         });
//
// }
export function getVoterByParamsCount(dispatch, tmpData) {

    let params = { ...tmpData, count: true };
    Axios({
        url: window.Laravel.baseURL + 'api/voters',
        method: 'get',
        params: params,
        cancelToken: source.token

    }).then(function (response) {
        let rowsCount = response.data.data;
        dispatch({ type: ActionTypes.VOTER_SEARCH.SET_ROW_COUNT, searchVoterCount: rowsCount['rowsCount'] });
    }).catch(function (error) {

    });
}

var CancelToken = Axios.CancelToken;
var source;
export function getVoterByParams(dispatch, searchParam, pageFor, isAdvancedSearch, max_number_of_rows) {
    source = CancelToken.source();
    dispatch({ type: ActionTypes.VOTER_SEARCH.FETCH_DATA_BEGIN });

    if (Object.keys(searchParam).length > 0) {

        var tmpData = {}, tmp;
        /**
         * Do data for the ajax request.
         */
        for (let idx in searchParam) {
            tmp = searchParam[idx];
            if (tmp.length > 0) {
                tmpData[idx] = tmp;
            }
        }

        tmpData['page'] = pageFor;
        if (isAdvancedSearch) {
            tmpData['isAdvancedSearch'] = isAdvancedSearch;
        }

        if (pageFor == 0) {
            getVoterByParamsCount(dispatch, tmpData);
        }
        if (max_number_of_rows) {
            tmpData['max_number_of_rows'] = max_number_of_rows;
        }

        Axios({
            url: window.Laravel.baseURL + 'api/voters',
            method: 'get',
            params: tmpData,
            cancelToken: source.token

        }).then(function (response) {
            /**
             * Check the response from DB.
             */
            let voterData = response.data.data;

            /**
             * In order to handle later the "selected row background color" issue.
             */
            if (!Array.isArray(voterData)) {
                voterData = [voterData];
            }

            for (let i in voterData) {
                voterData[i]['isSelected'] = false;
            }

            dispatch({ type: ActionTypes.VOTER_SEARCH.DISABLE_NEW_SEARCH, disableNewSearch: false });
            dispatch({ type: ActionTypes.VOTER_SEARCH.FETCH_DATA_END, searchVoterDataChunk: voterData });
        }).catch(function (error) {

            dispatch({ type: ActionTypes.VOTER_SEARCH.DISABLE_NEW_SEARCH, disableNewSearch: false });
            dispatch({ type: ActionTypes.VOTER_SEARCH.END });
            if (!Axios.isCancel(error)) {
                let response = error.response || false;
                if (response) {
                    let data = response.data || false;
                    if (data) {
                        let message = data.message || false;
                        if (message) {
                            if (message.toLowerCase().includes('maximum execution time')) {
                                dispatch({ type: ActionTypes.VOTER_SEARCH.MAXIMUM_EXECUTION_TIME, isMaximumExecutionTime: true });
                            }
                        }
                    }
                }
            }
        });
    }
}

export function cancelGetVoterByParams() {
    source.cancel('Operation canceled by the user, cancelGetVoterByParams.');
}

/**
 *
 * @param dispatch
 * @param router
 * @param deliveryPath
 */
export function deliverVoterDetails(dispatch, router, deliveryPath) {


    router.push(deliveryPath);
}
/**
 * Clean the previous 'selected' row and set the current selected one.
 *
 * @param dispatch
 * @param selectedRowIdx
 */
export function setItSelected(dispatch, selectedRowIdx) {
    dispatch({ type: ActionTypes.VOTER_SEARCH.SET_ROW_SELECTED, selectedRowIdx: selectedRowIdx });
}

export function getTempVoterByID(dispatch, tempVoterID) {
    Axios.get(window.Laravel.baseURL + "api/elections/voters/?useSecondVoter=true&temp_voter_id=" + tempVoterID)
        .then(function (result) {

            dispatch({ type: ActionTypes.VOTER_SEARCH.FOUND_TEMP_VOTER, tempVoterData: result.data.data });
        }).catch(function (error) {

        });
}


export function initVoterPhones(dispatch, voterDetails) {
    var newPhones = voterDetails.phones;
    var phoneIndex = 0;

    for (phoneIndex = 0; phoneIndex < newPhones.length; phoneIndex++) {
        newPhones[phoneIndex] = {
            phone_id: 0,
            phone_number: '',
            call_via_tm: 0,
            call_via_phone: 0,
            sms: 0,
            phone_type_id: 0,
            phone_type_name: "",
            defined: true,
            deleted: false
        }
    }

    voterDetails.phones = newPhones;

    dispatch({ type: ActionTypes.VOTER.VOTER_INIT_EMPTY_PHONES, voterDetails: voterDetails })
}

/*
 *   This function initializes objects or arrays
 *   used in lower tabs actions.
 *
 *   @param dispatch
 *   @param voterDetails
 */
export function initVoterLowerTabsObjects(dispatch, voterDetails) {
    voterDetails.voterRequests = [];
    voterDetails.voterDocuments = [];
    voterDetails.voterActions = [];

    dispatch({ type: ActionTypes.VOTER.VOTER_INIT_LOWER_TABS_OBJECTS, voterDetails: voterDetails })
}


export function loadAllSupportStatuses(dispatch) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/system/voter/support/statuses';

    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.VOTER_SUPPORT.SUPPORTS_STATUSES_LOADED,
                data: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}

export function deleteHouseholdCaptainFiftyRecord(dispatch, recordKey, householdID) {
    var therURL = window.Laravel.baseURL + 'api/elections/activists/' + recordKey + '/households/' + householdID;
    Axios({
        url: therURL,
        method: 'delete'
    })
        .then(function (response) {
            loadVoterDataByRecordKey(dispatch, recordKey);
            loadVoterActivistHouseholdsByKey(dispatch, recordKey);
        }).catch(function (error) {

        });
}

export function loadVoterActivistHouseholdsByKey(dispatch, recordKey) {
    var therURL = window.Laravel.baseURL + 'api/elections/activists/' + recordKey + '/households';
    Axios({
        url: therURL,
        method: 'get'
    })
        .then(function (response) {

            dispatch({
                type: ActionTypes.ACTIVIST.FETCHED_VOTER_ACTIVIST_HOUSEHOLDS_DATA,
                data: response.data.data
            });
        }).catch(function (error) {

        });
}

export function loadVoterDataByRecordKey(dispatch, recordKey) {
    var therURL = window.Laravel.baseURL + 'api/elections/activists/' + recordKey;
    Axios({
        url: therURL,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.ACTIVIST.FETCHED_MINIMAL_VOTER_DATA,
                data: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}

export function EditVoterActivistRoleData(dispatch, recordKey, thephone, thesum, thecomment) {
    var therURL = window.Laravel.baseURL + 'api/elections/activists/' + recordKey;
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    Axios({
        url: therURL,
        method: 'put',
        data: {
            sum: thesum,
            phone_number: thephone,
            comment: thecomment

        }
    })
        .then(function (response) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            dispatch({
                type: ActionTypes.ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE,
                errorTitle: 'הפעולה הצליחה', errorContent: 'פעולת השמירה עברה בהצלחה!'
            });
        }).catch(function (error) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        });
}

export function AddNewVoterActivistRole(dispatch, roleIndex, voterKey, selectedRole, newPhone, newSum, newComment) {
    var therURL = window.Laravel.baseURL + 'api/elections/activists/' + voterKey + '/roles/' + selectedRole.key;
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    Axios({
        url: therURL,
        method: 'post',
        data: {
            sum: newPhone,
            phone_number: newPhone,
            comment: newComment

        }
    })
        .then(function (response) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            dispatch({
                type: ActionTypes.ACTIVIST.ADDED_VOTER_ACTIVIST_ROLE,
                data: response.data.data, roleIndex
            });
        }).catch(function (error) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        });
}

export function loadVoterSupportElections(dispatch, voterKey) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/campaigns/last';

    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.VOTER_SUPPORT.LOADED_VOTER_SUPPORT_DATA,
                data: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}
/**
 *
 * @param dispatch
 * @param voterKey
 * @param searchByIdentityNumber
 * @param useSecondVoter
 */
export function getVoterByKey(dispatch, voterKey, searchByIdentityNumber = false, useSecondVoter = true,
    router = null, pushAddress = null) {

    if (voterKey == undefined || voterKey == null || voterKey.trim() == '') { return; }
    dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER });

    dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_LOADING_VOTER });

    dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER_ELECTIONS_CAMPAIGNS });

    return Axios.get(window.Laravel.baseURL + "api/elections/voters/" + voterKey + "?useSecondVoter=" +
        useSecondVoter + (searchByIdentityNumber == true ? '&identity=true' : '')
    ).then(function (result) {
        var voterDetails = result.data.data;
        var oldVoterDetails = {};
        var voterScreen = {};

        var newPhones = [];
        var numOfPhones = 0;
        var phoneIndex = 0;


        // Right actual address
        voterDetails.right_actual_address = 1;

        // field personal_identity field should be read only
        if (result.data.data.personal_identity == '') // this checks if identity NOT belongs to existing temp-voter
        {
            voterDetails.voterReadOnlyFields =
                {
                    personal_identity: false,
                    first_name: false,
                    last_name: false
                }

            voterDetails.personal_identity = voterKey;
        } else // else identity belongs to existing temp-voter
        {
            voterDetails.voterReadOnlyFields =
                {
                    personal_identity: true,
                    first_name: true,
                    last_name: true
                }
        }

        // Initialize the main phone index by
        // finding the element which it's phone_id
        // is equal to main_voter_phone_id
        if (voterDetails.main_voter_phone_id != null) {
            voterDetails.main_phone_index = voterDetails.phones.findIndex(phoneItem => phoneItem.id == voterDetails.main_voter_phone_id);
        } else {
            voterDetails.main_phone_index = -1;
        }

        switch (voterDetails.sephardi) {
            case 0:
                voterDetails.sephardi_name = 'לא';
                break;

            case 1:
                voterDetails.sephardi_name = 'כן';
                break;

            default:
                voterDetails.sephardi_name = '';
                voterDetails.sephardi = -1;
                break;
        }

        if (null == voterDetails.origin_country_id || "" == voterDetails.origin_country_id) {
            voterDetails.origin_country_id = 0;
        }

        if (null == voterDetails.origin_country_name) {
            voterDetails.origin_country_name = '';
        }

        if (null == voterDetails.ethnic_group_id) {
            voterDetails.ethnic_group_id = 0;
        }

        if (null == voterDetails.ethnic_group_name) {
            voterDetails.ethnic_group_name = '';
        }

        if (null == voterDetails.religious_group_id) {
            voterDetails.religious_group_id = 0;
        }

        if (null == voterDetails.religious_group_name) {
            voterDetails.religious_group_name = '';
        }

        if (null == voterDetails.voter_title_id) {
            voterDetails.voter_title_id = 0;
        }

        if (null == voterDetails.voter_title_name) {
            voterDetails.voter_title_name = '';
        }

        if (null == voterDetails.voter_ending_id) {
            voterDetails.voter_ending_id = 0;
        }

        if (null == voterDetails.voter_ending_name) {
            voterDetails.voter_ending_name = '';
        }

        if (null == voterDetails.city_name) {
            voterDetails.city_name = voterDetails.city;
        }

        if (null == voterDetails.mi_city_name) {
            voterDetails.mi_city_name = voterDetails.mi_city;
        }

        if (null == voterDetails.street_id) {
            voterDetails.street_id = 0;
        }

        if (null == voterDetails.street_name) {
            voterDetails.street_name = "";
        }

        if (null == voterDetails.mi_street_id) {
            voterDetails.mi_street_id = 0;
        }

        if (null == voterDetails.mi_street_name) {
            voterDetails.mi_street_name = "";
        }

        oldVoterDetails = _.clone(voterDetails);

        newPhones = voterDetails.phones;
        for (phoneIndex = 0; phoneIndex < newPhones.length; phoneIndex++) {
            newPhones[phoneIndex].deleted = false;
        }

        voterDetails.phones = newPhones;
        oldVoterDetails.phones = [];

        for (phoneIndex = 0; phoneIndex < newPhones.length; phoneIndex++) {
            oldVoterDetails.phones[phoneIndex] = _.clone(newPhones[phoneIndex]);
        }


        // Objects and arrays for lower tabs actions
        voterScreen.requests = [];
        voterScreen.actions = [];

        // Array of voter's shas representative roles
        voterScreen.representatives = [];

        // BackUp array of voter's shas representative roles
        voterScreen.oldRepresentatives = [];


        // The groups which the voter belongs to
        voterScreen.voterInGroups = [];

        // The voter user's geographic filters
        voterScreen.voterSystemUserGeographicFilters = [];

        // The voter user's sectorial filters
        voterScreen.voterSystemUserSectorialFilters = [];


        // Array of household voters
        voterScreen.household = [];
        // Array of current voter
        // support status
        voterScreen.oldHousehold = [];

        // Array of voter institutes
        voterScreen.voterInstitutes = [];

        dispatch({
            type: ActionTypes.VOTER.VOTER_SET_DETAILS, voterDetails: voterDetails, oldVoterDetails: oldVoterDetails,
            voterScreen: voterScreen
        });

        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_SET_LOADED_VOTER });

        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_UNLOADING_VOTER });
        if (pushAddress != null && pushAddress != undefined && router != null && router != undefined) {
            if (pushAddress.trim() != '') {
                router.push('/' + pushAddress);
            }
        }
    }).catch(function (error) {
        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER });
        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_UNLOADING_VOTER });

        let response = error.response || false;
        if (response) {
            let data = response.data || false;
            if (data) {
                let errorCode = data.error_code || false;

                if (errorCode) {
                    dispatch({
                        type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY,
                        displayError: true, errorMessage: errors[errorCode]
                    });

                    router.push('home');
                }
            }
        }
    });
}

export function getVoterBySearchIdentity(dispatch, router, personalIdentity) {
    Axios({
        url: window.Laravel.baseURL + 'api/voters',
        method: 'get',
        params: {
            personal_identity: personalIdentity,
            only_key: 1,
            first: 1
        }
    }).then(function (result) {
        var voterKey = result.data.data;
        router.push('elections/voters/' + voterKey);
    }).catch(function (error) {
        let response = error.response || false;
        let voterErrorMessage = "";
        if (response) {
            let data = response.data || false;
            if (data) {
                let message = data.message || false;
                if (message) {
                    if (message == "voter does not exist") {
                        voterErrorMessage = "תושב לא קיים";
                    } else if (message == "voter is not permitted") {
                        voterErrorMessage = "אין הרשאות לצפות בתושב";
                    } else if (message == "personal identity is not valid") {
                        voterErrorMessage = "תעודת זהות לא תקנית";
                    }

                    dispatch({
                        type: ActionTypes.VOTER.VOTER_ERROR_LOADING_VOTER_MODAL_SHOW,
                        errorMessage: voterErrorMessage
                    });

                    router.push('elections/voters');
                }
            }
        }
    });
}

export function getVoterByPersonalIdentity(dispatch, router, personalIdentity) {
    Axios({
        url: window.Laravel.baseURL + 'api/voters',
        method: 'get',
        params: {
            personal_identity: personalIdentity,
            is_personal_identity_search: 1
        }
    }).then(function (result) {
        var voter = result.data.data;
        var voterName = voter.first_name + " " + voter.last_name;
        dispatch({ type: CrmActions.ActionTypes.REQUEST.SET_UNKNOWN_VOTER_KEY, voterKey: voter.key, voterName });
    }).catch(function (error) {
        console.log(error);
    });
}


export function saveVoterDetails(dispatch, voterKey, voterData) {
    var data = {};
    var dataIndex = -1;

    for (dataIndex = 0; dataIndex < voterData.length; dataIndex++) {
        let fieldName = voterData[dataIndex].key;

        data[fieldName] = voterData[dataIndex].value;
    }

    //clear deceased date if not valid
    if (data['deceased_date'] == '') data['deceased_date'] = null;

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/details',
        method: 'put',
        data: data
    }).then(function (result) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.additional_data.details" });

        dispatch({ type: ActionTypes.VOTER.VOTER_DETAILS_UPDATE_OLD_VOTER_DETAILS });

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function searchVoterElectionActivist(dispatch, searchParams) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/activists',
        method: 'get',
        params: searchParams,

    }).then(function (response) {
        dispatch({
            type: ActionTypes.ACTIVIST.FOUND_SEARCH_ACTIVIST_RESULTS,
            searchResults: response.data.data
        });
        dispatch({ type: ActionTypes.ACTIVIST.SET_SEARCHING_VOTER_ACTIVIST, data: false });
    }).catch(function (error) {
        dispatch({ type: ActionTypes.ACTIVIST.SET_SEARCHING_VOTER_ACTIVIST, data: false });
        dispatch({ type: ActionTypes.ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE, errorTitle: 'שגיאת כללית', errorContent: 'הפעולה נכשלה' });
    });
}

export function loadVoterPhones(dispatch, voterKey, mainVoterPhoneId) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/phones',
        method: 'get'
    }).then(function (response) {
        let newPhones = response.data.data;
        for (let phoneIndex = 0; phoneIndex < newPhones.length; phoneIndex++) {
            newPhones[phoneIndex].deleted = false;
            newPhones[phoneIndex].defined = true;
        }

        dispatch({ type: ActionTypes.VOTER.VOTER_CONTACT_UPDATE_PHONES, phones: newPhones, mainVoterPhoneId: mainVoterPhoneId });
    });
}
export function saveVoterEmail(dispatch, voterKey, email) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/email',
        method: 'put',
        params: { email: email }
    }).then(function (result) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
        dispatch({ type: ActionTypes.VOTER.VOTER_CONTACT_UPDATE_EMAIL, data: email });

    }), function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });

    };
}
export function saveVoterContact(dispatch, voterKey, voterData, voterPhones, saveAnyWay, phonesToDelete) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/contact',
        method: 'put',
        data: {
            voter_data: voterData,
            voter_phones: voterPhones,
            save_any_way: saveAnyWay,
            phones_to_delete: phonesToDelete
        }
    }).then(function (result) {
        let voterUpdatedData = [];
        voterUpdatedData.push({ key: 'email', value: voterData.email });
        voterUpdatedData.push({ key: 'contact_via_email', value: voterData.contact_via_email });

        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.additional_data.contact_details" });

        loadVoterPhones(dispatch, voterKey, result.data.data.main_voter_phone_id);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        if (error.response.data.data != undefined && error.response.data.data.length > 0) {
            dispatch({ type: SystemActions.ActionTypes.UNSAVING_CHANGES });

            dispatch({
                type: ActionTypes.VOTER.VOTER_PHONE_SHOW_ERROR_MODAL,
                errorHeader: errors[error.response.data.error_code],
                votersWithSamePhones: error.response.data.data
            });
        } else {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        }
    });
}

export function saveVoterAddress(dispatch, voterKey, voterData, updateHouseholds) {
    var data = {};
    var dataIndex = -1;

    for (dataIndex = 0; dataIndex < voterData.length; dataIndex++) {
        let fieldName = voterData[dataIndex].key;

        data[fieldName] = voterData[dataIndex].value;
    }
    data.update_households = updateHouseholds;

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/address',
        method: 'put',
        data: data
    }).then(function (result) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.additional_data.address" });

        dispatch({ type: ActionTypes.VOTER.VOTER_ADDRESS_UPDATE_OLD_VOTER_ADDRESS });

        if (result.data.data.households.length > 0) {
            dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_LOAD_HOUSEHOLD_VOTERS, household: result.data.data.households });
        }

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function loadVoterElectionRoles(dispatch) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/roles';

   return Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.ACTIVIST.ROLES_LOADED,
                data: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}


export function getFiftyMinisterVoterByID(dispatch, personal_identity) {

    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/captainOfFifty/' + personal_identity;
    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {

            if (response.data.data == null) {
                dispatch({ type: ActionTypes.ACTIVIST.FIFTY_MINISTER_SHOW_ERROR_DLG, headerText: 'שגיאה : ', contentText: 'ת"ז לא נמצאה במערכת' });
                dispatch({
                    type: ActionTypes.ACTIVIST.LOADED_FIFTY_MINISTER_VOTER_BY_ID,
                    data: { first_name: '', last_name: '', mi_city: '' }
                });
            } else {
                dispatch({ type: ActionTypes.ACTIVIST.FIFTY_MINISTER_SHOW_ERROR_DLG, headerText: '', contentText: '' });
                dispatch({
                    type: ActionTypes.ACTIVIST.LOADED_FIFTY_MINISTER_VOTER_BY_ID,
                    data: response.data.data
                });
            }
        }).catch(function (error) {
            console.log(error);
        });
}

export function loadVoterElectionRoleShifts(dispatch) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/roles/shifts';
    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.ACTIVIST.ROLE_SHIFTS_LOADED,
                data: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}

export function loadMinisterOfFiftyByVoter(dispatch, voterKey) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty';

    Axios({
        url: actionTypesUrl,
        method: 'get'
    }).then(function (response) {
        let captainOfFifty = response.data.data ||{};
        dispatch({
            type: ActionTypes.ACTIVIST.VOTER_MINISTER_OF_FIFTY_LOADED,
            data: captainOfFifty
        });
    }, function (error) {
        console.log(error);
    });
}

export function allocateVoterToCaptain50(dispatch, voterKey, captainKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty/' + captainKey,
        method: 'post'
    }).then(function (response) {
        dispatch({
            type: ActionTypes.ACTIVIST.ALLOACATE_VOTER_TO_CAPTAIN50,
            data: response.data.data
        });

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }, function (error) {
        console.log(error);
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function unAllocateVoterToCaptain50(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty',
        method: 'delete'
    }).then(function (response) {
        dispatch({type: ActionTypes.ACTIVIST.UNALLOACATE_VOTER_TO_CAPTAIN50});

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }, function (error) {
        console.log(error);
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

/*
export function editCaptainOfFifty(dispatch, voterKey, captainID) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty';
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: actionTypesUrl,
        method: 'put',
        data: {
            captain_id: captainID
        }
    }).then(function (response) {

        dispatch({
            type: ActionTypes.ACTIVIST.VOTER_MINISTER_OF_FIFTY_LOADED,
            data: response.data.data
        });
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});

    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}
*/

/*
export function addCaptainOfFifty(dispatch, voterKey, captainID) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty';
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: actionTypesUrl,
        method: 'post',
        data: {
            captain_id: captainID
        }
    }).then(function (response) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        dispatch({
            type: ActionTypes.ACTIVIST.VOTER_MINISTER_OF_FIFTY_LOADED,
            data: response.data.data
        });


    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}
*/

/*
export function deleteCaptainOfFifty(dispatch, voterKey) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty';

    Axios({
        url: actionTypesUrl,
        method: 'delete'
    }).then(function (response) {
        dispatch({
            type: ActionTypes.ACTIVIST.VOTER_MINISTER_OF_FIFTY_LOADED,
            data: response.data.data
        });
    }).catch(function (error) {
        console.log(error);
    });
}
*/

/*
export function saveMinisterOfFifty(dispatch, voterKey, newCaptainID) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty/';
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: url,
        method: 'put',
        data: {
            new_captain_id: newCaptainID
        }
    }).then(function (response) {
        dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.ballot"});
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        loadMisiterOfFiftyByVoter(dispatch, voterKey);

        dispatch({type: ActionTypes.ACTIVIST.FIFTY_MINISTER_HIDE_MODAL_DIALOG});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}
*/

/*
export function saveMinisterOfFiftyWithKey(dispatch, voterKey, captainRowKey, newCaptainID) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/captainOfFifty/';
    url += captainRowKey;
    dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
    Axios({
        url: url,
        method: 'put',
        data: {
            new_captain_id: newCaptainID
        }
    }).then(function (response) {
        dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.ballot"});
        dispatch({type: SystemActions.ActionTypes.CHANGES_SAVED});
        loadMisiterOfFiftyByVoter(dispatch, voterKey);

        dispatch({type: ActionTypes.ACTIVIST.FIFTY_MINISTER_HIDE_MODAL_DIALOG});
    }).catch(function (error) {
        dispatch({type: SystemActions.ActionTypes.CHANGES_NOT_SAVED});
    });
}
*/



export function loadElectionRolesByVoter(dispatch, voterKey) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/roles';
    Axios({
        url: url,
        method: 'get'
    }).then(function (response) {
        dispatch({type: ActionTypes.ACTIVIST.VOTER_ROLES_LOADED, data: response.data.data});
    }, function (error) {
        console.log(error);
    });
}

export function saveVoterElectionRoles(dispatch, voterKey, roleData) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/roles';
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    Axios({
        url: url,
        method: 'put',
        data: {
            role_data: roleData
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.election_activity" });
        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
        loadElectionRolesByVoter(dispatch, voterKey);
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function loadVoterDeath(dispatch, voterKey) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/extraData/deathData';
    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.EXTRA_DATA.LOADED_DEATH_DATA,
                data: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}

export function loadVoterKeysValuesData(dispatch, voterKey) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/extraData/allKeysValues';
    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            let voterKeysValuesData = response.data.data;
            for (let dataIndex = 0; dataIndex < voterKeysValuesData.length; dataIndex++) {
                if (null == voterKeysValuesData[dataIndex].value) {
                    voterKeysValuesData[dataIndex].value = '';
                }

                if (0 == voterKeysValuesData[dataIndex].key_type) {
                    voterKeysValuesData[dataIndex].value_list_id = 0;
                }

                voterKeysValuesData[dataIndex].valid = true;
            }

            dispatch({
                type: ActionTypes.EXTRA_DATA.LOADED_KEYS_VALUES_DATA,
                data: voterKeysValuesData
            });
        }).catch(function (error) {
            console.log(error);
        });
}

export function getAllActionsTypes(dispatch) {
    var actionTypesUrl = window.Laravel.baseURL + 'api/elections/voters/action/types';

    Axios({
        url: actionTypesUrl,
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.VOTER.VOTER_ACTION_TYPES_LOAD,
                actionTypesList: response.data.data
            });
        }).catch(function (error) {
            console.log(error);
        });
}

export function getAllActionsStatuses(dispatch) {
    var actionStatusesUrl = window.Laravel.baseURL + 'api/elections/voters/statuses';

    Axios({
        url: actionStatusesUrl,
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_ACTION_STATUSES_LOAD,
            actionStatusesList: response.data.data
        });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getAllActionsTopics(dispatch) {
    var actionTopicsUrl = window.Laravel.baseURL + 'api/elections/voters/action/topics';

    Axios({
        url: actionTopicsUrl,
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_ACTION_TOPICS_LOAD,
            actionTopicsList: response.data.data
        });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getVoterActions(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/actions',
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_ACTIONS, voterActions: response.data.data });
    });
}

export function getVoterTMPolls(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/polls',
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_TM_POLLS, voterPolls: response.data.data });
    });
}

export function addNewAction(dispatch, voterKey, newActionFields, newCallAction = false) {
    let callExtUrl ='';
    if (!newCallAction) {
        dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    } else {  callExtUrl ='/calls';}

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + callExtUrl + '/actions',
        method: 'post',
        data: newActionFields
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.actions" });
        getVoterActions(dispatch, voterKey);
        if (newCallAction) {
            dispatch({ type: ActionTypes.VOTER_DIALER_WINDOW.SET_CALL_DATA, callKey: response.data.data.key })
        }
        if(!newCallAction){ dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });}
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function deleteAction(dispatch, voterKey, actionKey) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/actions/' + actionKey,
        method: 'delete'
    }).then(function (response) {
        getVoterActions(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function editAction(dispatch, voterKey, actionKey, editActionFields, newCallAction = false) {
    let callExtUrl = newCallAction ? '/calls' : '';
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + callExtUrl + '/actions/' + actionKey,
        method: 'put',
        data: editActionFields
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.actions" });

        getVoterActions(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function getVoteSources(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/campaigns/sources',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_ELECTION_CAMPAIGN.LOAD_VOTE_SOURCES, data: response.data.data });
    });
}

export function getVoterElectionCampaigns(dispatch, voterKey) {
    dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER_ELECTIONS_CAMPAIGNS });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/ballots',
        method: 'get'
    }).then(function (response) {
        let transportData = response.data.data;

        for (let index = 0; index < transportData.length; index++) {
            transportData[index].did_vote = 0;
            transportData[index].did_vote_name = 'לא';

            if (null == transportData[index].voter_transport_date) {
                transportData[index].voter_transport_date = "";
            }

            if (null == transportData[index].voter_transport_crippled) {
                transportData[index].voter_transport_crippled = "";
            }
        }

        dispatch({ type: ActionTypes.VOTER_ELECTION_CAMPAIGN.LOADED_CAMPAIGNS_BY_VOTER, data: transportData });

        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_SET_LOADED_VOTER_ELECTIONS_CAMPAIGNS });
    });

    dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_SET_LOADED_VOTER_ELECTIONS_CAMPAIGNS });
}

export function saveVoterBallot(dispatch, voterKey, electionData) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/ballots';

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: url,
        method: 'put',
        data: {
            election_data: electionData
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.ballot" });

        getVoterElectionCampaigns(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function saveVoterBallotWithTransportKey(dispatch, voterKey, electionData, transportKey) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/ballots/' + transportKey;

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: url,
        method: 'put',
        data: {
            election_data: electionData
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.ballot" });

        getVoterElectionCampaigns(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function getAllElectionCampaigns(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/campaigns',
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({

            type: ActionTypes.ACTIVIST.LOADED_ALL_CAMPAIGNS,
            data: response.data.data
        });
    });
}

export function getVoterRequests(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/requests',
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_REQUESTS,
            voterRequests: response.data.data
        });
    });
}

export function getRepresentativeRoles(dispatch) {
    var rolesUrl = window.Laravel.baseURL + 'api/elections/voters/representatives/roles';

    Axios({
        url: rolesUrl,
        method: 'get'
    })
        .then(function (response) {

            dispatch({
                type: ActionTypes.VOTER.VOTER_REPRESENTATIVE_LOAD_ROLES,
                representativeRoles: response.data.data
            });
        });
}

export function getRepresentativeList(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/representatives',
        method: 'get',
        params: {}
    }).then(function (response) {
        var representativeList = response.data.data.allRepresentativeRoles;

        dispatch({
            type: ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_REPRESENTATIVES, representativeList: representativeList,
            shas_representative_role_name: response.data.data.shas_representative_role_name,
            shas_representative_city_name: response.data.data.shas_representative_city_name
        });
    });
}

export function saveRepresentatives(dispatch, voterKey, shasRepresentative, voterRepresentatives) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/representatives',
        method: 'put',
        data: {
            shas_representative: shasRepresentative,
            voter_representatives: voterRepresentatives
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.political_party.shas_representative" });

        getRepresentativeList(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function loadAllAreas(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/areas',
        method: 'get',
        params: {}
    }).then(function (response) {
        dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_AREAS, data: response.data.data });
    });
}

export function loadCitiesByArea(dispatch, areaID) {
    if (areaID == -1) {
        dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_CITIES, data: [] });
    } else {
        Axios({
            url: window.Laravel.baseURL + 'api/system/cities/' + areaID,
            method: 'get',
            params: {}
        }).then(function (response) {
            dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_CITIES, data: response.data.data });
        });
    }
}

export function loadNeighborhoodsByCity(dispatch, cityID) {
    if (cityID == -1) {
        dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_NEIGHBORHOODS, data: [] });
    } else {
        Axios({
            url: window.Laravel.baseURL + 'api/system/neighborhoods/' + cityID,
            method: 'get',
            params: {}
        }).then(function (response) {
            dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_NEIGHBORHOODS, data: response.data.data });
        });
    }
}

export function loadClustersByNeighborhood(dispatch, neighborhoodID, cityID) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/clusters/' + neighborhoodID,
        method: 'get',
        params: {
            city_id: cityID
        }
    }).then(function (response) {
        dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_CLUSTERS, data: response.data.data });
    });
}

export function loadBallotsByCluster(dispatch, clusterID) {

    if (clusterID == -1) {
        dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_BALLOTS, data: [] });
    } else {
        Axios({
            url: window.Laravel.baseURL + 'api/system/ballots/' + clusterID,
            method: 'get',
            params: {}
        }).then(function (response) {
            dispatch({ type: ActionTypes.ADDRESSES.LOADED_ALL_BALLOTS, data: response.data.data });
        });
    }
}

export function getVoterGroups(dispatch) {
    dispatch({ type: ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_ALL_GROUPS });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/groups',
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.VOTER.VOTER_GROUPS_LOAD_ALL_GROUPS,
                voterGroups: response.data.data
            });

            dispatch({ type: ActionTypes.VOTER.VOTER_GROUPS_SET_LOADED_ALL_GROUPS });
        });
}

export function getVoterInGroups(dispatch, voterKey) {
    dispatch({ type: ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_VOTER_GROUPS });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/groups',
        method: 'get'
    })
        .then(function (response) {
            let voterInGroups = response.data.data;

            for (let index = 0; index < voterInGroups.length; index++) {
                voterInGroups[index].selectedGroups = [];
            }

            dispatch({
                type: ActionTypes.VOTER.VOTER_GROUPS_LOAD_VOTER_GROUPS,
                voterInGroups: voterInGroups
            });

            dispatch({ type: ActionTypes.VOTER.VOTER_GROUPS_LOAD_ITEM_SELECTED_GROUPS });

            dispatch({ type: ActionTypes.VOTER.VOTER_GROUPS_SET_LOADED_VOTER_GROUPS });
        });
}

export function saveVoterGroups(dispatch, voterKey, voterGroups) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/groups',
        method: 'put',
        data: {
            voter_groups: voterGroups
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.political_party.shas_groups" });

        getVoterInGroups(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function getVoterSystemUser(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/user',
        method: 'get'
    }).then(function (response) {
        let voterSystemUser = response.data.data;

        dispatch({ type: ActionTypes.VOTER.VOTER_USER_LOAD_SYSTEM_USER_DETAILS, voterSystemUser: voterSystemUser });
    }).catch(function (error) {
        console.log(error);
    });
}

export function setVoterDeathDate(dispatch, voterKey, deatDate) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/extraData/deathData',
        method: 'put',
        data: {
            death_date: deatDate
        }
    })
        .then(function (response) {
            let voterSystemUser = response.data.data;
            dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
            dispatch({
                type: ActionTypes.VOTER.VOTER_USER_LOAD_SYSTEM_USER_DETAILS,
                voterSystemUser: voterSystemUser
            });
        }).catch(function (error) {
            dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
        });
}

export function getLastCampaign(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/campaigns/last',
        method: 'get'
    })
        .then(function (response) {
            dispatch({
                type: ActionTypes.VOTER.VOTER_SCREEN_UPDATE_LAST_CAMPAIGN_ID,
                lastCampaignId: response.data.data.id,
                lastCampaignName: response.data.data.name
            });
        });
}

export function getVoterHousehold(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/household',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_LOAD_HOUSEHOLD_VOTERS, household: response.data.data });
    });
}

export function updateHouseholdsAddreses(dispatch, voterKey, householdIds) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/household',
        method: 'put',
        data: {
            householdIds: householdIds
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function addHouseholdStatus(dispatch, voterKey, householdKey, supportStatusId) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/household/' + householdKey,
        method: 'post',
        data: {
            entity_type: 0,
            support_status_id: supportStatusId
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.household" });

        getVoterHousehold(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function editHouseholdStatus(dispatch, voterKey, householdKey, voterSupportStatusKey, supportStatusId) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey;
    url += '/household/' + householdKey + '/status/' + voterSupportStatusKey;

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: url,
        method: 'put',
        data: {
            support_status_id: supportStatusId
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });

        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.household" });

        //getVoterHousehold(dispatch, voterKey);
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function deleteHouseholdStatus(dispatch, voterKey, householdKey, voterSupportStatusKey) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey;
    url += '/household/' + householdKey + '/status/' + voterSupportStatusKey;

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: url,
        method: 'delete'
    }).then(function (response) {
        getVoterHousehold(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function getVoterSupportStatuses(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/support/statuses',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER.VOTER_SCREEN_LOAD_VOTER_SUPPORT_STATUSES, supportStatuses: response.data.data });
    });
}

export function getVoterCampaignsSupportStatuses(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/support/statuses/all',
        method: 'get'
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_SCREEN_LOAD_VOTER_CAMPAIGNS_SUPPORT_STATUSES,
            supportStatuses: response.data.data
        });
    });
}

export function saveVoterSupportStatusWithKey(dispatch, voterKey, voterSupportStatusKey, supportId0) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey;
    url += '/support/statuses/' + voterSupportStatusKey;

    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: url,
        method: 'put',
        data: {
            support_status_id: supportId0
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.support_status" });

        getVoterSupportStatuses(dispatch, voterKey);
        getVoterCampaignsSupportStatuses(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function saveVoterSupportStatuses(dispatch, voterKey, supportId0, fromVoterMainBlock = false) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/support/statuses',
        method: 'put',
        data: {
            support_status_id: supportId0
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.support_and_elections.support_status" });
		getVoterCampaignsSupportStatuses(dispatch, voterKey);
        getVoterSupportStatuses(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function loadMetaDataKeys(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/metadata/keys',
        method: 'get'
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_LOAD_META_DATA_KEYS,
            metaDataKeys: response.data.data
        });
    });
}

export function loadMetaDataKeysByNames(dispatch) {
    var keyNames = [];

    keyNames[0] = 'willing_volunteer';
    keyNames[1] = 'agree_sign';
    keyNames[2] = 'explanation_material';

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/metadata/keys',
        method: 'get',
        params: {
            key_names: keyNames
        }
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_LOAD_META_DATA_VOLUNTEER_KEYS,
            metaDataKeys: response.data.data
        });
    });
}

export function loadMetaDataValues(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/metadata/values',
        method: 'get'
    }).then(function (response) {
        dispatch({
            type: ActionTypes.VOTER.VOTER_LOAD_ALL_META_DATA_VALUES,
            metaDataValues: response.data.data
        });
    });
}

export function loadVoterMetaDataKeysValues(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/metadata/all',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER.VOTER_SET_VOTER_HASH_META_TABLE, voterMetaDataValues: response.data.data });
    });
}

export function saveVoterMetaDataValues(dispatch, voterKey, metaDataValues, specialKeys ) {
    var url = window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/metadata/all';
    var data = {};

    var keyNames = [];

    keyNames[0] = 'willing_volunteer';
    keyNames[1] = 'agree_sign';
    keyNames[2] = 'explanation_material';

    if (specialKeys) {
        data = {
            meta_data_values: metaDataValues,
            key_names: keyNames
        };
    } else {
        data = { meta_data_values: metaDataValues };
    }

 
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: url,
        method: 'put',
        data: data
    }).then(function (response) {
        let target = "";

        if (specialKeys) {
            target = "elections.voter.support_and_elections.election_activity";
        } else {
            target = "elections.voter.additional_data.meta";
        }
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: target });

        loadVoterMetaDataKeysValues(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });

    }, function (error) {
        dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });
    });
}
/**
 *
 * @param dispatch
 * @param router
 * @param redirectPath
 * @param forWhom      - if true we'll redirect to the voter page;
 *                     - else we'll redirect to the temp voter page(where is that?)
 */
export function redirectToRequestCreatorPage(dispatch, router, redirectPath, forWhom) {

    let requestUrl = '';

    if (true == forWhom) {
        requestUrl = 'elections/voters/' + redirectPath;
    } else {
        requestUrl = 'elections/voters/' + redirectPath;
    }
    router.push(requestUrl);
    dispatch({ type: ActionTypes.VOTER_SEARCH.REDIRECT_TO_REQUEST_CREATOR_PAGE });
}

export function getInstituteGroups(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/institutes/groups',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_GROUPS, instituteGroups: response.data.data });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getInstituteTypes(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/institutes/types',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_TYPES, instituteTypes: response.data.data });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getInstituteRoles(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/institutes/roles',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_ROLES, instituteRoles: response.data.data });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getInstituteNetworks(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/institutes/networks',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_NETWORKS, instituteNetworks: response.data.data });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getAllInstitutes(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/institutes',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_INSTITUTE.LOAD_ALL_INSTITUTES, institutes: response.data.data });
    }).catch(function (error) {
        console.log(error);
    });
}

export function getVoterInstitutes(dispatch, voterKey) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/institutes',
        method: 'get'
    }).then(function (response) {
        dispatch({ type: ActionTypes.VOTER_INSTITUTE.LOAD_VOTER_INSTITUTES, voterInstitutes: response.data.data });
    });
}

export function addNewVoterInstitute(dispatch, voterKey , data , setDirtyTarget) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/institutes',
        method: 'post',
		data
    }).then(function (response) {
		 dispatch({type: ActionTypes.VOTER_INSTITUTE.ADD_NEW_INSTITUTE_TO_STATE});
		 dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target: setDirtyTarget});
         dispatch({type: ActionTypes.VOTER_INSTITUTE.DISABLE_ADDING_NEW_INSTITUTE});
    });
}

export function deleteVoterInstitute(dispatch, voterKey , rowID) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/institutes/'+rowID,
        method: 'delete',
    }).then(function (response) {
		 dispatch({type: ActionTypes.VOTER_INSTITUTE.DELETE_INSTITUTE_FROM_STATE});
		 //dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target: setDirtyTarget});
         dispatch({type: ActionTypes.VOTER_INSTITUTE.HIDE_DELETE_MODAL_DIALOG});
    });
}

export function updateExistingVoterInstitute(dispatch, voterKey , rowID , data , setDirtyTarget) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/institutes/'+rowID,
        method: 'put',
		data
    }).then(function (response) {
		 dispatch({type:SystemActions.ActionTypes.CLEAR_DIRTY, target: setDirtyTarget});
         dispatch({type: ActionTypes.VOTER_INSTITUTE.DISABLE_EDITING_INSTITUTE});
    });
}


export function saveVoterInstitutes(dispatch, voterKey, InstitutesData) {
    dispatch({ type: SystemActions.ActionTypes.SAVING_CHANGES });

    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/institutes',
        method: 'put',
        data: {
            institutes_data: InstitutesData
        }
    }).then(function (response) {
        dispatch({ type: SystemActions.ActionTypes.CLEAR_DIRTY, target: "elections.voter.political_party.shas_institutes" });

        getVoterInstitutes(dispatch, voterKey);

        dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function loadGeneralStreets(dispatch, key) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/cities/' + key + '/streets',
        method: "get"
    }).then(function (result) {
        dispatch({ type: ActionTypes.VOTER_SEARCH.LOADED_GENERAL_STREETS, streets: result.data.data });
    }).catch(function (error) {
        let response = error.response || false;
        if (response) {
            let data = response.data || false;
            if (data) {
                let errorCode = data.error_code || false;

                if (errorCode) {
                    dispatch({ type: ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: errors[errorCode] });
                }
            }
        }
    });
}

export function loadVoterCityStreets(dispatch, cityKey, initialLoading) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/cities/' + cityKey + '/streets',
        method: "get"
    }).then(function (result) {
        dispatch({ type: ActionTypes.VOTER.VOTER_ADDRESS_LOAD_VOTER_CITY_STREETS, cityStreets: result.data.data });

        if (initialLoading) {
            dispatch({ type: ActionTypes.VOTER.VOTER_ADDRESS_INIT_VOTER_STREET_ID, cityStreets: result.data.data });
        }
    });
}

export function sendRealSMSViaAPI(voterKey, phoneKey, messageText) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/' + voterKey + '/sendSMS',
        method: "post",
        data: {
            voter_phone_key: phoneKey,
            message_text: messageText
        }
    }).then(function (result) {

    });
}

/* Voter Dialer functions */
export function getWebDialer(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/web_dialer/details',
        method: "get",
    }).then(function (result) {
        let webDialer = result.data.data;
        dispatch({ type: ActionTypes.VOTER_DIALER_WINDOW.SET_WEB_DIALER, webDialer})
    });
}