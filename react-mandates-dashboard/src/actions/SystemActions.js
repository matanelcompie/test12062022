import Axios from 'axios';
import errors from '../libs/errors'

export const ActionTypes = {
    SAVING_CHANGES: "SAVING_CHANGES",
    CHANGES_SAVED: "CHANGES_SAVED",
    CHANGES_NOT_SAVED: "CHANGES_NOT_SAVED",
    SET_HEADER_TITLE: "SET_HEADER_TITLE",

    // Current User actions
    LOADING_CURRENT_USER: "LOADING_CURRENT_USER",
    LOADED_CURRENT_USER: "LOADED_CURRENT_USER",
    LOADED_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS: "LOADED_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS",
    LOADED_TEAMS: "LOADED_TEAMS",
    LOADED_ROLES: "LOADED_ROLES",
    
    TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY: 'TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY',
    LOADED_SYSTEM_SETTINGS: "LOADED_SYSTEM_SETTINGS",
    
    SET_DIRTY: "SET_DIRTY",
    CLEAR_DIRTY: "CLEAR_DIRTY",
    IGNORE_DIRTY: "IGNORE_DIRTY",
    LOADING_ERRORS: "LOADING_ERRORS",
    LOADED_ERRORS: "LOADED_ERRORS",

    SAVE_CHANGES_MODAL_SHOW: "SAVE_CHANGES_MODAL_SHOW",
    SAVE_CHANGES_MODAL_HIDE: "SAVE_CHANGES_MODAL_HIDE",
    MAINTENANCE_MODE: "MAINTENANCE_MODE",
    MAINTENANCE_DATE: "MAINTENANCE_DATE",
    
    //* breadcrumbs
    BREADCRUMBS:{
        RESET: 'BREADCRUMBS.RESET',
        UPDATE: '.BREADCRUMBS.UPDATE',
        ADD: 'BREADCRUMBS.ADD'
    },
    
    HEADER: {
        LOADING_LAST_VIEWED_VOTERS: "HEADER.LOADING_LAST_VIEWED_VOTERS",
        LOADED_LAST_VIEWED_VOTERS: "HEADER.LOADED_LAST_VIEWED_VOTERS",
        TOGGLE_LAST_VIEWED_VOTERS_MENU: "HEADER.TOGGLE_LAST_VIEWED_VOTERS_MENU",
        ADDING_LAST_VIEWED_VOTERS: "HEADER.ADDING_LAST_VIEWED_VOTERS",
        ADDED_LAST_VIEWED_VOTERS: "HEADER.ADDED_LAST_VIEWED_VOTERS",
        SET_SEARCH_TYPE: "HEADER.SET_SEARCH_TYPE",
        SET_SEARCH_INPUT: "HEADER.SET_SEARCH_INPUT",
        SEARCHING: "HEADER.SEARCHING",
        SEARCHED: "HEADER.SEARCHED",
        CLEAR_SEARCH: "HEADER.CLEAR_SEARCH",
        LOADED_FAVORITES: "HEADER.LOADED_FAVORITES",
        TOGGLE_FAVORITES_MENU: "HEADER.TOGGLE_FAVORITES_MENU",
        TOGGLE_CURRENT_CAMPAIGN_NAME: "HEADER.TOGGLE_CURRENT_CAMPAIGN_NAME",
        OPEN_CHANGE_PASSWORD_MODAL: "HEADER.OPEN_CHANGE_PASSWORD_MODAL",
        CLOSE_CHANGE_PASSWORD_MODAL: "HEADER.CLOSE_CHANGE_PASSWORD_MODAL",
        UPDATE_ALL_VOTERS_MODE: "HEADER.UPDATE_ALL_VOTERS_MODE",
    },

    MENU: {
        LOADING_MENU: "MENU.LOADING_MENU",
        LOADED_MENU: "MENU.LOADED_MENU",
        TOGGLE_MENU: "MENU.TOGGLE_MENU",
        TOGGLE_USER_MENU: "MENU.TOGGLE_USER_MENU",
        TOGGLE_MENU_ITEM: "MENU.TOGGLE_MENU_ITEM",
        SEARCH_NAV_TEXT_CHANGE: 'SEARCH_NAV_TEXT_CHANGE',
        SEARCH_IN_MENU: 'SEARCH_IN_MENU',
        TOGGLE_HEADER_SEARCH: 'TOGGLE_HEADER_SEARCH',
    },
    USERS: {
        USER_SCREEN_COLLAPSE_CHANGE: 'USERS.USER_SCREEN_COLLAPSE_CHANGE',
        LOADING_USER: "USERS.LOADING_USER",
        LOADED_USER: "USERS.LOADED_USER",
        RESET_LOADED_USER: "USERS.RESET_LOADED_USER",
        OPEN_MISSING_USER_MODAL: "USERS.OPEN_MISSING_USER_MODAL",
        CLOSE_MODAL_DIALOG: "USERS.CLOSE_MODAL_DIALOG",
        OPEN_GLOBAL_ERROR_MODAL: "USERS.OPEN_GLOBAL_ERROR_MODAL",
        OPEN_MISSING_USER_DETAILS: "USERS.OPEN_MISSING_USER_DETAILS",
        OPEN_MISSING_USER_PHONES: "USERS.OPEN_MISSING_USER_PHONES",
        OPEN_MISSING_MAIN_ROLE: "USERS.OPEN_MISSING_MAIN_ROLE",
        ADDING_USER: "USERS.ADDING_USER",
        CLEAN_ADDING_USER: "USERS.CLEAN_ADDING_USER",
        ADDING_USER_FAILED: "USERS.ADDING_USER_FAILED",
        ADDED_USER: "USERS.ADDED_USER",
        SAVING_USER: "USERS.SAVING_USER",
        SAVED_USER: "USERS.SAVED_USER",
        OPEN_RESET_PASSWORD_MODAL: "USERS.OPEN_RESET_PASSWORD_MODAL",
        OPEN_MISSING_PASSWORDS_MODAL: "USERS.OPEN_MISSING_PASSWORDS_MODAL",
        CLOSE_RESET_PASSWORD_MODAL: "USERS.CLOSE_RESET_PASSWORD_MODAL",
        USER_CHANGE_PASSWORD: "USERS.USER_CHANGE_PASSWORD",
        PASSWORD_CHANGED_SUCCESSFULLY: "USERS.PASSWORD_CHANGED_SUCCESSFULLY",
        PASSWORD_CHANGED_FAILED: "USERS.PASSWORD_CHANGED_FAILED",
        CHANGE_PASSWORD_ERROR_MESSAGE: "USERS.CHANGE_PASSWORD_ERROR_MESSAGE",
        RESET_CURRENT_USER: "USERS.RESET_CURRENT_USER",
        SHOW_RESET_PASSWORD_MODAL: 'USERS.SHOW_RESET_PASSWORD_MODAL',
        HIDE_RESET_PASSWORD_MODAL: 'USERS.HIDE_RESET_PASSWORD_MODAL',
        USER_RESET_PASSWORD_CHANGE_OLD_PASSWORD: 'USERS.USER_RESET_PASSWORD_CHANGE_OLD_PASSWORD',
        USER_RESET_PASSWORD_CHANGE_PASSWORD: 'USERS.USER_RESET_PASSWORD_CHANGE_PASSWORD',
        USER_RESET_PASSWORD_CHANGE_CONFIRM_PASSWORD: 'USERS.USER_RESET_PASSWORD_CHANGE_CONFIRM_PASSWORD',
    },
    POLLS:{
        CAMPAIGNS_PHONES: 'POLLS.CAMPAIGNS_PHONES'
    },
    LOADED_CURRENT_CAMPAIGN: 'LOADED_CURRENT_CAMPAIGN',
}
/**
 * Set interval for system status
 *
 * @param object store
 * @return void
 */
export function setSystemStatusInterval(store) {
    setInterval(function() {checkSystemStatus(store);}, 60*60*1000);
}

/**
 * Check system status
 * If maintenance date exists - show it
 * If not authenticated reload the page
 *
 * @param object store
 * @return void
 */
export function checkSystemStatus(store) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/status',
    }).then(function(result) {
        if (result.data.data.maintenance != undefined) {
            //!! Need to define maintenance mode
            // store.dispatch({ type: ActionTypes.MAINTENANCE_DATE, maintenanceDate: result.data.data.maintenance});
        }
        if (!result.data.data.authenticated) {
            // store.dispatch({ type: ActionTypes.CLEAR_DIRTY, target: 'all' });
            setTimeout(function () {
                location.reload();
            }, 1000);
        }
    });
}
/**
 * load errors and put them in errors module
 *
 * @param store
 */
export function loadErrors(store) {
    // store.dispatch({ type: ActionTypes.LOADING_ERRORS });
    Axios({
        url: window.Laravel.baseURL + 'api/system/errors',
        method: 'get'
    }).then(function (result) {
        var errorsArray = result.data.data;
        errorsArray.forEach(function (error) {
            errors[error.code] = error.message;
        });
        store.dispatch({ type: ActionTypes.LOADED_ERRORS });
    });
}

//************************ Main menu:

export function loadMenu(store) {
    store.dispatch({ type: ActionTypes.MENU.LOADING_MENU });
    Axios({
        url: window.Laravel.baseURL + 'api/system/side_menu',
        method: 'get'
    }).then(function (result) {
        //parse side menu from list to tree
        var sideMenuData = result.data.data;
        var menuHashMap = [];
        var menuArray = [];
        sideMenuData.forEach(function (sideMenu) {
            menuHashMap[sideMenu.id] = sideMenu;
            sideMenu.children = [];
            sideMenu.showSearch = true;

        });
        sideMenuData.forEach(function (sideMenu) {
            if (sideMenu.parent_id == 0) {
                menuArray.push(sideMenu);
            } else {
                var parentId = sideMenu.parent_id;
                menuHashMap[parentId].children.push(sideMenu);
            }
        });

        store.dispatch({ type: ActionTypes.MENU.LOADED_MENU, menu: menuArray });
    });
}
/**
 * Execute action from menu before redirect to url
 *
 * @param actionName
 * @param dispatch
 */
export function executeMenuAction(actionName, dispatch) {
    switch (actionName) {
        case 'clean_voter_details':
            dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA });
            dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
            dispatch({ type: CrmActions.ActionTypes.REQUEST.PERSONAL_ID_CHANGE, data: '' });
            dispatch({ type: CrmActions.ActionTypes.REQUEST.CLEAN_CRM_INPUT_DATA });
            dispatch({ type: GlobalActions.ActionTypes.DOCUMENT.DOCUMENT_CLEAN_DATA });
            break;
        case 'clean_voter_search_redirect':
            dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH, data: { returnUrl: '', returnButtonText: 'פתח פנייה' } });
            break;
        case 'clean_user_details':
            dispatch({ type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT });
            dispatch({
                type: VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_DATA
            });
            dispatch({
                type: ActionTypes.USERS.CLEAR_USERS_FORM
            });
            dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA });

            dispatch({ type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLEAN_DATA });
            break;
        default:
            break;
    }
}
//************************ user:

/**
 * load current user.
 *
 * @param store
 */
export function loadCurrentUser(store) {
    store.dispatch({ type: ActionTypes.LOADING_CURRENT_USER });
    Axios({
        //add timestamp: so the browser will not load the user from the cashe when user clicks back ...
        url: window.Laravel.baseURL + 'api/system/users/current?time=' + Date.now(),
        method: 'get'
    }).then(function (result) {
        var user = result.data.data;
        var permissions = {};
        user.permissions.forEach(function (permission) {
            permissions[permission.operation_name] = true;
        });
        user.permissions = permissions;

        store.dispatch({ type: ActionTypes.LOADED_CURRENT_USER, user: user });
    }, function (error) {
        store.dispatch({ type: ActionTypes.CHANGES_NOT_SAVED });
        let response = error.response || false;
        if (response.status == '401') {
            location.reload();
        }
    });
}

/**
 * change user password
 * @param dispatch
 * @param oldPassword
 * @param newPassword
 */
export function changeUserPassword(dispatch, oldPassword, newPassword, otherUserKey) {
    dispatch({ type: ActionTypes.SAVING_CHANGES });
    let dataObj = {
        old_password: oldPassword,
        new_password: newPassword,
        type: 1
    }
    let urlPath = 'current';
    if(otherUserKey){
        delete dataObj.old_password;
        dataObj.other_user_key = otherUserKey;
        urlPath = 'other/password';
    }
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/' + urlPath,
        method: 'put',
        data: dataObj 
    }).then(function (result) {
        dispatch({ type: ActionTypes.CHANGES_SAVED });
        dispatch({ type: ActionTypes.USERS.HIDE_RESET_PASSWORD_MODAL });
        dispatch({ type: ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE, errorMessage: '' });
    }).catch(function (error) {
        dispatch({ type: ActionTypes.CHANGES_NOT_SAVED });
        let response = error.response || false;
        if (response) {
            let data = response.data || false;
            if (data) {
                let errorCode = data.error_code || false;

                if (errorCode) {
                    dispatch({ type: ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE, errorMessage: errors[errorCode] });
                }
            }
        }
    });
}

/**
 * Save password of existing user.
 *
 * @param dispatch
 * @param router
 * @param userKey
 * @param newPassword
 */
export function savePassword(dispatch, router, userKey, newPassword) {
    dispatch({ type: ActionTypes.SAVING_CHANGES });
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/' + userKey,
        method: 'put',
        data: {
            existing_user_key: userKey,
            password: newPassword
        }
    }).then(function (result) {
        dispatch({ type: ActionTypes.USERS.PASSWORD_CHANGED_SUCCESSFULLY, data: newPassword });
        dispatch({ type: ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: ActionTypes.USERS.PASSWORD_CHANGED_FAILED });
        dispatch({ type: ActionTypes.CHANGES_NOT_SAVED });
    });
}



//***************************************** last viewed voters */
export function loadLastViewedVoters(dispatch) {
    dispatch({ type: ActionTypes.HEADER.LOADING_LAST_VIEWED_VOTERS });
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/last_viewed',
        method: "get"
    }).then(function (result) {
        var lastViewedVoters = result.data.data;
        dispatch({ type: ActionTypes.HEADER.LOADED_LAST_VIEWED_VOTERS, lastViewedVoters });
    });
}

export function addLastViewedVoters(dispatch, voterKey) {
    var _this = this;
    dispatch({ type: ActionTypes.HEADER.ADDING_LAST_VIEWED_VOTERS });
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/last_viewed',
        method: 'post',
        data: {
            voter_key: voterKey
        }
    }).then(function (result) {
        dispatch({ type: ActionTypes.HEADER.ADDED_LAST_VIEWED_VOTERS });
        _this.loadLastViewedVoters(dispatch);
    });
}

export function deleteLastViewedVoters(dispatch) {
    var _this = this;
    Axios({
        url: window.Laravel.baseURL + 'api/elections/voters/last_viewed',
        method: "delete"
    }).then(function () {
        _this.loadLastViewedVoters(dispatch);
    });
}

//************************ User Favorites */
export function loadUserFavorites(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/favorites',
        method: "get"
    }).then(function (result) {
        var favorites = result.data.data;
        dispatch({ type: ActionTypes.HEADER.LOADED_FAVORITES, favorites });
    });
}
export function addToFavorites(dispatch, url, title) {
    dispatch({ type: ActionTypes.SAVING_CHANGES });
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/favorites',
        method: 'post',
        data: {
            url, title
        }
    }).then(function () {
        loadUserFavorites(dispatch);
        dispatch({ type: ActionTypes.CHANGES_SAVED });
    }).catch(function (error) {
        dispatch({ type: ActionTypes.CHANGES_NOT_SAVED });
    });
}
export function removeFromFavorites(dispatch, key) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/favorites/' + key,
        method: "delete"
    }).then(function () {
        loadUserFavorites(dispatch);
    });
}
//** */

/*
updates whether an admin user can see all voters

*/
export function updateViewAllVoters(dispatch, isViewAllVoters) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current',
        method: "put",
        data: {
            is_view_all_voters: isViewAllVoters,
            type: 2
        }
    }).then(function (result) {
        dispatch({ type: ActionTypes.HEADER.UPDATE_ALL_VOTERS_MODE, value: isViewAllVoters });
    }).catch(function (error) {
        dispatch({ type: ActionTypes.CHANGES_NOT_SAVED });
    });
}

export function loadCurrentCampaign(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/current/campaign',
        method: 'get'
    }).then(function (result) {
        dispatch({ type: ActionTypes.LOADED_CURRENT_CAMPAIGN, campaign: result.data.data });
    });
}


export function headerSearch(dispatch, searchType, searchInput) {
    dispatch({ type: ActionTypes.HEADER.SEARCHING });
    Axios({
        url: window.Laravel.baseURL + 'api/system/search',
        method: 'get',
        params: {
            type: searchType,
            value: searchInput
        }
    }).then(function (result) {
        dispatch({ type: ActionTypes.HEADER.SEARCHED, searchResult: result.data.data });
    }).catch(function (error) {
        dispatch({ type: ActionTypes.HEADER.SEARCHED, searchResult: [] });
    });
}

/*********** System lists: */
/**
 * load teams.
 *
 * @param store
 */
export function loadTeams(dispatch ) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/teams',
        method: "get"
    }).then(function (result) {
        dispatch({ type: ActionTypes.LOADED_TEAMS, teams: result.data.data });
    })
}
/**
 * load teams.
 *
 * @param store
 */
export function loadRoles(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/system/allRoles',
        method: "get"
    }).then(function (result) {
        dispatch({ type: ActionTypes.LOADED_ROLES, roles: result.data.data });
    });
}

/*
Load user area , sub-areas and cities by user's geographic filters
*/
export function loadUserGeographicFilteredLists(dispatch, screenPermission, geoListRequsted = null, inCurrentElectionCampaign = false) {
    let defaultGeoList = { cities: true, areas: true, sub_areas: true }
    let data = geoListRequsted ? geoListRequsted : defaultGeoList;
    data.screen_permission = screenPermission;
    if (inCurrentElectionCampaign) { data.in_current_election_campaign = true; }
    Axios({
        url: window.Laravel.baseURL + 'api/system/users/current/geographic_lists',
        method: 'get',
        params: data
    }).then(function (response) {
 
        dispatch({ type: ActionTypes.LOADED_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS, data: response.data.data });
    }, function (error) {

    });
}

// Polls system actions:

/*
Load user area , sub-areas and cities by user's geographic filters
*/
export function loadPollsCampaignsPhones(dispatch) {
    Axios({
        url: window.Laravel.baseURL + 'api/polls/campaigns/phones',
        method: 'get',
    }).then(function (response) {
 
        dispatch({ type: ActionTypes.POLLS.CAMPAIGNS_PHONES, campaignsPhonesArr: response.data.data });
    }, function (error) {

    });
}