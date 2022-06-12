
import * as SystemActions from '../actions/SystemActions';

const initState ={
    displayErrorModalDialog: false,
    modalDialogErrorMessage: '',
    currentUser: {
        first_name: "",
        last_name: "",
        id: null,
        admin: false,
        permissions: {},
        geographicFilters: [] ,
        is_view_all_voters: false,
        isLoaded: false
    },
    header: {
        showSearch: false,
        lastViewedVoters: [],
        lastViewedVotersMenuOpen: false,
        searchInput: '',
        searchType: 'voter',
        searchResult: [],
        searching: false,
        favorites: [],
        isFavoritesMenuOpen: false,
        displayCurrentCampaignName: true,
    },
    breadcrumbs: [],
    systemTitle: '',
    menus: {
        menu: [],
        openedMenuItems: [],
        open: false,
        saveChangesModalShow: false,
        gotoLink: '',
        userMenuOpen: false
    },
    userScreen: {
        showHeaderChangePasswordModal: false,
        changePasswordModalOtherUser: null,
        modalHeaderText: '',
        password: '',
        oldPassword: '',
        confirmPassword: '',
        modalContentText: '',
        modalDialogErrorMessage: '',
    },
    currentUserGeographicalFilteredLists: {
        areas: [],
        sub_areas: [],
        cities: [],
    },
    currentCampaign: {},
    teams: [],
    roles: [],
    //Polls
    campaignsPhones: {
        ivr: [],
        sms: [],
    }
}


function systemReducer(state = { ...initState}, action) {
    const newState = {...state};
    const ActionTypes = SystemActions.ActionTypes;
    switch(action.type){
        //* Current user:
        case ActionTypes.LOADED_CURRENT_USER:
            newState.currentUser = action.user;
            break;
        //* Handles loading all user geographic filtered lists from api : */	
        case SystemActions.ActionTypes.LOADED_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS:
            newState.currentUserGeographicalFilteredLists = {...newState.currentUserGeographicalFilteredLists};
            newState.currentUserGeographicalFilteredLists.areas = action.data.areas;
            newState.currentUserGeographicalFilteredLists.sub_areas = action.data.sub_areas;
            newState.currentUserGeographicalFilteredLists.cities = action.data.cities;
            break;
        case ActionTypes.CHANGES_NOT_SAVED:
            newState.savingChanges = false;
            newState.changesNotSaved = true;
            break;
        //Ignore dirty state and clear it
        case ActionTypes.IGNORE_DIRTY:
            newState.ignoreDirty = true;
            break;
        //Set state to dirty - user changed something but has not saved it yet
        case ActionTypes.SET_DIRTY:
            newState.dirtyComponents = [...newState.dirtyComponents];
            if (newState.dirtyComponents.indexOf(action.target.toLowerCase()) == -1) {
                newState.dirtyComponents.push(action.target.toLowerCase());
            }
            newState.dirty = true;
            break;
        //Clear dirty state
        case ActionTypes.CLEAR_DIRTY:
            if (action.target.toLowerCase() == 'all') {
                newState.dirtyComponents = [];
            } else {
                newState.dirtyComponents = [...newState.dirtyComponents];
                let index = newState.dirtyComponents.indexOf(action.target.toLowerCase());
                if (index > -1) {
                    newState.dirtyComponents.splice(index, 1);
                }
            }
            if (newState.dirtyComponents.length == 0) {
                newState.ignoreDirty = false;
                newState.dirty = false;
            }
            break;
        //saving changes
        case ActionTypes.SAVING_CHANGES:
            newState.savingChanges = true;
            break;
        // Not saving changes
        case ActionTypes.UNSAVING_CHANGES:
            newState.savingChanges = false;
            break;
        //changes not saved
        case ActionTypes.CHANGES_NOT_SAVED:
            newState.savingChanges = false;
            newState.changesNotSaved = true;
            break;
        //changes saved
        case ActionTypes.CHANGES_SAVED:
            newState.savingChanges = false;
            newState.changesSaved = true;
            break;
        //clear changes saved
        case ActionTypes.CLEAR_CHANGES_SAVED:
            newState.changesSaved = false;
            break;
        //clear changes not saved
        case ActionTypes.CLEAR_CHANGES_NOT_SAVED:
            newState.changesNotSaved = false;
            break;
        case ActionTypes.LOADED_CURRENT_CAMPAIGN:
            newState.currentCampaign = action.campaign;
            break;
        //* Manage breadcrumbs:
        case ActionTypes.BREADCRUMBS.RESET:
            newState.breadcrumbs = [{ url: '/', title: 'דף הבית', elmentType: 'home' }];
            break;
        case ActionTypes.BREADCRUMBS.UPDATE:
            var breadcrumbs = [...newState.breadcrumbs];
            let lastBreadcrumbsIndex = breadcrumbs.length - 1;
            breadcrumbs[lastBreadcrumbsIndex] = {...breadcrumbs[lastBreadcrumbsIndex]};
            breadcrumbs[lastBreadcrumbsIndex].title = action.title;
            newState.breadcrumbs = breadcrumbs;
            break;
        case ActionTypes.BREADCRUMBS.ADD:
            newState.breadcrumbs = [...newState.breadcrumbs, action.newLocation];
            break;
        //* Manage menu:
        //set the system title
        case ActionTypes.SET_SYSTEM_TITLE:
            newState.systemTitle = action.systemTitle;
            break;
        //toggle show/hide header search
        case ActionTypes.MENU.TOGGLE_HEADER_SEARCH:
            newState.header = {...newState.header};
            newState.header.showSearch = !newState.header.showSearch;
            break;
        //toggle show/hide side menu
        case ActionTypes.MENU.TOGGLE_MENU:
            newState.menus = {...newState.menus};
            newState.menus.open = !(newState.menus.open);
            break;
        //menu search nav text input value changes	
        case ActionTypes.MENU.SEARCH_NAV_TEXT_CHANGE:
            newState.navSeatchText = action.data;
            break;
        case ActionTypes.MENU.SEARCH_IN_MENU:
            newState.menus = {...state.menus};
            newState.menus.menu = searchInMenu(newState.menus.openedMenuItems, newState.menus.menu, action.data);
            break;
        //toggle show/hide user menu
        case ActionTypes.MENU.TOGGLE_USER_MENU:
            newState.menus = {...newState.menus};
            newState.menus.userMenuOpen = !(newState.menus.userMenuOpen);
            break;

        //side menu loaded
        case ActionTypes.MENU.LOADED_MENU:
            newState.menus = {...newState.menus};
            newState.menus.menu = action.menu;
            break;
        //toggle show/hide sub menu item
        case ActionTypes.MENU.TOGGLE_MENU_ITEM:
            newState.menus = {...newState.menus};
            newState.menus.openedMenuItems = [...newState.menus.openedMenuItems];
            if (action.isOpen) {
                var index = newState.menus.openedMenuItems.indexOf(action.item);
                if (index > -1)
                    newState.menus.openedMenuItems.splice(index, 1);
            } else {
                newState.menus.openedMenuItems.push(action.item);
            }
            break;
                    //show save changes modal
        case ActionTypes.SAVE_CHANGES_MODAL_SHOW:
            newState.saveChangesModalShow = true;
            newState.ignoreDirty = false;
            newState.gotoUrl = action.gotoUrl;
            break;
        //hide save changes modal
        case ActionTypes.SAVE_CHANGES_MODAL_HIDE:
            newState.saveChangesModalShow = false;
            break;
        //********* USERS ACTIONS
        case ActionTypes.USERS.CLOSE_MODAL_DIALOG:
            newState.userScreen.showModalDialog = false;
            newState.userScreen.modalHeaderText = '';
            newState.userScreen.modalContentText = '';
            break;
        case ActionTypes.USERS.OPEN_RESET_PASSWORD_MODAL:
            newState.userScreen.showResetPasswordModal = true;
            break;
        case ActionTypes.USERS.CLOSE_RESET_PASSWORD_MODAL:
            newState.userScreen.showResetPasswordModal = false;
            newState.userScreen.showHeaderChangePasswordModal = false;
            newState.userScreen.changePasswordModalOtherUser = null;
            break;
        case ActionTypes.USERS.SHOW_RESET_PASSWORD_MODAL:
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.showResetPasswordModal = true;
            newState.userScreen.showHeaderChangePasswordModal = true;
            newState.userScreen.changePasswordModalOtherUser = null;
            newState.userScreen.oldPassword = '';
            newState.userScreen.password = '';
            newState.userScreen.confirmPassword = '';
            break;
        case ActionTypes.USERS.HIDE_RESET_PASSWORD_MODAL:
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.showResetPasswordModal = false;
            newState.userScreen.showHeaderChangePasswordModal = false;
            newState.userScreen.changePasswordModalOtherUser = null;
            newState.userScreen.oldPassword = '';
            newState.userScreen.password = '';
            newState.userScreen.confirmPassword = '';
            break;
        case ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_OLD_PASSWORD:
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.oldPassword = action.oldPassword;
            break;
        case ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_PASSWORD:
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.password = action.password;
            break;
        case ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_CONFIRM_PASSWORD:
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.confirmPassword = action.confirmPassword;
            break;
        //open modal header change user password
        case ActionTypes.HEADER.OPEN_CHANGE_PASSWORD_MODAL:
            newState.userScreen = {...state.userScreen};
            newState.userScreen.showHeaderChangePasswordModal = true;
            newState.userScreen.changePasswordModalOtherUser = action.selectedUserData;
            break;
        //close modal header change user password
        case ActionTypes.HEADER.CLOSE_CHANGE_PASSWORD_MODAL:
            newState.userScreen.showHeaderChangePasswordModal = false;
            newState.userScreen.changePasswordModalOtherUser = null;
            break;
        //Loaded last viewed voters -> to menu list
        case ActionTypes.HEADER.LOADED_LAST_VIEWED_VOTERS:
            newState.header = {...newState.header};
            newState.header.lastViewedVoters = action.lastViewedVoters;
            break;
        //toggle last viewed voter menu
        case ActionTypes.HEADER.TOGGLE_LAST_VIEWED_VOTERS_MENU:
            newState.header = {...newState.header};
            newState.header.lastViewedVotersMenuOpen = !newState.header.lastViewedVotersMenuOpen;
            break;
        //Header -> User Favorites
        case ActionTypes.HEADER.LOADED_FAVORITES:
            newState.header = {...newState.header};
            newState.header.favorites = action.favorites;
            break;
        case ActionTypes.HEADER.TOGGLE_FAVORITES_MENU:
            newState.header = {...newState.header};
            newState.header.isFavoritesMenuOpen = !newState.header.isFavoritesMenuOpen;
            break;
        case ActionTypes.HEADER.TOGGLE_CURRENT_CAMPAIGN_NAME:
            newState.header = {...newState.header};
            newState.header.displayCurrentCampaignName = action.display;
            break;
        case ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY:
            newState.displayErrorModalDialog = action.displayError;
            newState.modalDialogErrorMessage = action.errorMessage || '';
            break;
        //Change search type in header
        case ActionTypes.HEADER.SET_SEARCH_TYPE:
            newState.header = {...newState.header};
            newState.header.searchType = action.searchType;
            break;
        //change search input in header
        case ActionTypes.HEADER.SET_SEARCH_INPUT:
            newState.header = {...newState.header};
            newState.header.searchInput = action.searchInput;
            newState.header.searchResult = [];
            break;
        //set searching from header
        case ActionTypes.HEADER.SEARCHING:
            newState.header = {...newState.header};
            newState.header.searching = true;
            break;
        //finished searching from header
        case ActionTypes.HEADER.SEARCHED:
            newState.header = {...newState.header};
            newState.header.searchResult = action.searchResult;
            newState.header.searching = false;
            break;
        //clear search parameters and result for header search
        case ActionTypes.HEADER.CLEAR_SEARCH:
            newState.header = {...newState.header};
            newState.header.searchResult = [];
            newState.header.searchInput = '';
            break;
        //set all voters view in header on/off
        case ActionTypes.HEADER.UPDATE_ALL_VOTERS_MODE:
            newState.currentUser = {...newState.currentUser};
            newState.currentUser.is_view_all_voters = action.value;
            break;
        // System lists:
        case ActionTypes.LOADED_TEAMS:
            newState.teams = action.teams
            break;
        case ActionTypes.LOADED_ROLES:
            newState.roles = action.roles;
            break;
        case ActionTypes.POLLS.CAMPAIGNS_PHONES:
            newState.campaignsPhones = { ivr: [], sms: [] };
            console.log('action.campaignsPhonesArr', action)
            action.campaignsPhonesArr.forEach((item) => {
                if(item.type == 1){
                    newState.campaignsPhones.ivr.push(item);
                } else{
                    newState.campaignsPhones.sms.push(item);
                }
            });
            break;
    }
    return newState;
}

export default systemReducer

