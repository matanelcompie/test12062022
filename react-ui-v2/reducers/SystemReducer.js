/* global requestTopic */

import * as SystemActions from '../actions/SystemActions';
import {arraySort} from '../libs/globalFunctions';
import _ from 'lodash';
import constants from '../libs/constants';
function foundInChildren(openedMItems, menu, txt) {
    let countFound = 0;
    let index = -1;
    for (let i = 0, len = menu.length; i < len; i++) {
        if (menu[i].children.length == 0) {
            if (menu[i].name.indexOf(txt) >= 0) {
                countFound++;
            }
        } else {
            let isFound = foundInChildren(openedMItems, menu[i].children, txt);
            if (menu[i].name.indexOf(txt) >= 0 || isFound) {
                if (isFound) {
                    index = openedMItems.indexOf(menu[i]);
                    if (index == -1) {
                        openedMItems.push(menu[i]);
                    }
                } else {
                    index = openedMItems.indexOf(menu[i]);
                    if (index > -1) {
                        openedMItems.splice(index, 1);
                    }
                }
                countFound++;
            } else {
                index = openedMItems.indexOf(menu[i]);
                if (index > -1) {
                    openedMItems.splice(index, 1);
                }
            }
        }
    }
    return countFound > 0;
}

function searchInMenu(openedMItems, menu, txt) {
    if (txt.trim() == '') {
        for (let i = openedMItems.length - 1; i >= 0; i--) {
            openedMItems.pop();
        }
        for (let i = 0, len = menu.length; i < len; i++) {
            menu[i].showSearch = true;
        }
    } else {
        let index = -1;
        for (let i = 0, len = menu.length; i < len; i++) {

            if (menu[i].children.length == 0) {
                if (menu[i].name.indexOf(txt) >= 0) {
                    menu[i].showSearch = true;
                } else {
                    menu[i].showSearch = false;
                }
            } else {

                let isFound = foundInChildren(openedMItems, menu[i].children, txt);
                if (menu[i].name.indexOf(txt) >= 0 || isFound) {
                    menu[i].showSearch = true;
                    if (isFound) {

                        index = openedMItems.indexOf(menu[i]);
                        if (index == -1) {
                            openedMItems.push(menu[i]);
                        }


                    } else {
                        index = openedMItems.indexOf(menu[i]);
                        if (index > -1) {
                            openedMItems.splice(index, 1)
                        }
                    }
                } else {
                    menu[i].showSearch = false;
                    index = openedMItems.indexOf(menu[i]);
                    if (index > -1) {
                        openedMItems.splice(index, 1)
                    }
                }
            }
        }
    }
    return menu;
}

function getTodaysDate() {
    let nowDate = new Date();
    let days = nowDate.getDate();
    let month = nowDate.getMonth() + 1;
    let year = nowDate.getFullYear();
    return (days < 10 ? '0' + days + '/' : days + '/') + (month < 10 ? '0' + month + '/' : month + '/') + year;
}

const initialState = {
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
    menus: {
        menu: [],
        openedMenuItems: [],
        open: false,
        saveChangesModalShow: false,
        gotoLink: '',
        userMenuOpen: false
    },
    lists: {
        //general tab 
        countries: [],
        cities: [],
        areasGroups: [],
        areas: [],
        subAreas: [],
        neighborhoods: [],
        ballotBoxes: [],
        streets: [],
        phoneTypes: [],
        clusters: [],
        neighborhoodClusters: [],
        languages: [],
        cityDepartment: [],
        //voter tab
        ethnic: [],
        religiousGroups: [],
        voterTitle: [],
        voterEnding: [],
        csvSource: [],
        supportStatus: [],
        voterActionTypes: [],
        voterActionTopics: [],
        voterMetaKeys: [],
        voterMetaValues: [],
        voterElectionRoles: [],
        shasRepresentativeRoles: [],
        religiousCouncilRoles: [],
        cityShasRoles: [],
        institutes: [],
        instituteGroups: [],
        instituteTypes: [],
        instituteNetworks: [],
        instituteRoles: [],
        allInstituteTypes: [],
        voterGroups: [],
        hieraticalVoterGroups: [],
        mainParentsVoterGroups: [],
        partyLists: [],
        //request tab
        topics: [],
        subTopics: [],
        allTopicsHash:{},
        mainTopicsHash:{},
        requestActionTypes: [],
        requestActionTopics: [],
        requestStatus: [],
        requestStatusType: [],
        requestSource: [],
        requestClosureReason: [],
        //system tab
        userRoles: [],
        permissionGroups: [],
        modules: [],
        teams: [],
        sms_providers: [],
    },
	filesScreen : {
		deleteFileGroupIndex : -1,
		deleteFileIndex : -1 ,
        filesInGroups : [],		
		selectedSearchGroupFilter : {selectedValue:'הכל' , selectedItem : {id:-1 , name:'הכל'}},
		selectedFilterIndex : - 1,
		addEditFileGroupScreen : {
			show : false ,
			editItemIndex : -1,
			name : '',
			selectedModulesList:[],
			allModules : [],
		} , 
		addEditFileScreen : {
			show : false ,
			editItemIndex : -1,
			fileGroupIndex: -1,
			name : '',
			file : '',
		} , 
		
	},
    teamsScreen: {
        tab: 'team_members',
        editTeamName: '',
        viewable: false,
        crm_center: false,
        teamLeaderId: null,
        editTeamLeaderFullName: '',
        editTeamLeaderID: -1,
        minimalUsers: [],
        staticUsers: [],
        minimalTeams: [],
        teamMembers: [],
        minimalTeamMembers: [],
        teamDepartments: [],
        teamLeadersHistory: [],
        isAddingNewDepartment: false,
        newDepartmentName: '',
        isDeletingDepartment: false,
        deleteDepartmentIndex: -1,
        isEditingDep: false,
        editDepRowIndex: -1,
        geoFilterOpened: false,
        sectorialFilterOpened: false,
        geoTemplates: [],
        sectorialTemplates: [],
        isDeletingGeoTemplate: false,
        deleteGeoTemplateIndex: -1,
        isDeletingSectorialTemplate: false,
        deleteSectorialTemplateIndex: -1,
        addingTeamGeoTemplate: false,
        addingTeamSectorialTemplate: false,
        editingTeamGeoTemplate: false,
        editingTeamSectorialTemplate: false,
        editingTeamGeoTemplateIndex: -1,
        editingTeamSectorialTemplateIndex: -1,
        geographicalModalHeader: '',
        sectorialModalHeader: '',
        geoFilterModalScreen: {
            labelName: '',
            areaName: '',
        },
        tableHasScrollbar: false,
        requestsTopics: {
            municipally: [],
            all: [],
        }
    },
    listsScreen: {

        // The tab name in the lists tab
        tab: '',
        currentTableScrollerPosition: 0,
        showItemInEditModeModalDialog: false,
        dirty: false,
        containerCollapseStatus: {//is collapse opened
            //general tab            
            country: false,
            city: false,
            area: false,
            neighborhood: false,
            street: false,
            phoneType: false,
            language: false,
            cityDepartment: false,
            //voter tab
            ethnic: false,
            religiousGroups: false,
            voterTitle: false,
            voterEnding: false,
            csvSource: false,
            supportStatus: false,
            voterActionType: false,
            voterMetaKey: false,
            voterElectionRole: false,
            shasRepresentativeRole: false,
            religeousCouncilRole: false,
            CityShasRole: false,
            institute: false,
            instituteGroup: false,
            instituteNetwork: false,
            instituteRole: false,
            voterGroup: false,
            partyList: false,
            //request tab
            requestTopic: false,
            requestActionType: false,
            requestStatus: false,
            requestSource: false,
            requestClosureReason: false,
            //system tab
            userRole: false,
            team: false,
            smsProviders: false,
            ActivistsAllocations: false,
        },
        tableHasScrollbar: {
            //general tab            
            city: false,
            street: false,
            //voter tab
            ethnic: false,
            religiousGroups: false,
            voterActionTopic: false,
            voterMetaKey: false,
            partyList: false,
            //request tab
            requestTopic: false,
            requestSubTopic: false,
            requestActionTopic: false,
            requestStatus: false,
            //system tab
            userRole: false,
            team: false,
            SmsProviders: false,
        },
        generalTab: {
            /* Country */
            showCountryModalDialog: false,
            isCountriesOrderedAsc: false,
            countrySearchValue: '',
            countryKeyInSelectMode: null,
            isCountryInEditMode: false,
            countryTextBeingEdited: '',
            /* City */
            showCityModalDialog: false,
            isCitiesOrderedAsc: false,
            citySearchValue: '',
            cityKeyInSelectMode: null,
            isCityInEditMode: false,
            isCityMiIDValid: false,
            isCityInAddMode: false,
            neighborhoodClustersDisplayModal:false,
            transferClustersDisplayModal:false,
            cityClustersDisplayModal:false,
            cityInEditMode: {
                cityName: '',
                miId: '',
                areaKey: null,
                areaName: '',
                subAreaKey: null,
                subAreaName: '',
            },
            cityOrderColumn: 'city_name',
            currentDisplayedCities: [],
            currentDisplayedCitiesCount: 30,
            IsThereMoreCitiesToDisplay: true,
            /* Area */
            showAreaModalDialog: false,
            areaSearchValue: '',
            areaKeyInSelectMode: null,
            areaNameInSelectMode: null,
            isAreaInEditMode: false,
            areaTextBeingEdited: '',
            isAreaOrderedAsc: false,
            isSubAreasDisplayed: false,
            /* SubArea */
            showSubAreaModalDialog: false,
            subAreaSearchValue: '',
            subAreaKeyInSelectMode: null,
            isSubAreaInEditMode: false,
            isSubAreaOrderedAsc: false,
            subAreaInEditMode: { area_id: -1, name: '' },
            /* Neighborhood */
            showNeighborhoodModalDialog: false,
            isNeighborhoodsOrderedAsc: false,
            neighborhoodSearchValue: '',
            neighborhoodKeyInSelectMode: -1,
            neighborhoodCityKey: -1,
            isNeighborhoodInEditMode: false,
            neighborhoodInEditMode: { name: '', city_id: -1 },
            /* Neighborhood Clusters */
            isNeighborhoodsClustersOrderedAsc: false,
            neighborhoodClusterSearchValue: '',
            isNeighborhoodsClustersDisplayed: false,
            neighborhoodClusterKeyInEditMode: -1,
            showNeighborhoodClusterModalDialog: false,
            /* Street */
            showStreetModalDialog: false,
            isStreetsOrderedAsc: false,
            streetOrderColumn: 'name',
            streetSearchValue: '',
            streetKeyInSelectMode: null,
            streetCityKey: -1,
            isStreetInEditMode: false,
            isStreetMiIDValid: false,
            streetInEditMode: {name: '', city_id: -1, mi_id: ''},
            isStreetInAddMode: false,
            /* Phone Types */
            showPhoneTypeModalDialog: false,
            phoneTypeSearchValue: '',
            phoneTypeKeyInSelectMode: null,
            isPhoneTypeInEditMode: false,
            phoneTypeTextBeingEdited: '',
            isPhoneTypeOrderedAsc: false,
            /* Language */
            showLanguageModalDialog: false,
            languageSearchValue: '',
            languageKeyInSelectMode: null,
            isLanguageInEditMode: false,
            languageInEditMode: { name: '', main: false },
            isLanguageOrderedAsc: false,
            languageOrderColumn: 'name',
            /* CityDepartment */
            showCityDepartmentModalDialog: false,
            cityDepartmentSearchValue: '',
            cityDepartmentKeyInSelectMode: null,
            isCityDepartmentInEditMode: false,
            cityDepartmentInEditMode: { name: ''},
            isCityDepartmentOrderedAsc: false,
            cityDepartmentOrderColumn: 'name',
        },
        voterTab: {
            /* Voter Ethnic */
            ethnicSearchValue: '',
            ethnicKeyInSelectMode: null,
            isEthnicInEditMode: false,
            ethnicTextBeingEdited: '',
            ethnicSephardiValueInEdited: '',
            isEthnicOrderedAsc: false,
            ethnicOrderColumn: 'name',
            showEthnicModalDialog: false,
            /* Voter Religious Groups */
            religiousGroupsSearchValue: '',
            religiousGroupKeyInSelectMode: null,
            isReligiousGroupInEditMode: false,
            religiousGroupTextBeingEdited: '',
            isReligiousGroupsOrderedAsc: false,
            religiousGroupsOrderColumn: 'name',
            showReligiousGroupsModalDialog: false,
            /* Voter Titles */
            showVoterTitleModalDialog: false,
            voterTitleSearchValue: '',
            voterTitleKeyInSelectMode: null,
            isVoterTitleInEditMode: false,
            voterTitleTextBeingEdited: '',
            isVoterTitleOrderedAsc: false,
            /* Voter Endings */
            showVoterEndingModalDialog: false,
            voterEndingSearchValue: '',
            voterEndingKeyInSelectMode: null,
            isVoterEndingInEditMode: false,
            voterEndingTextBeingEdited: '',
            isVoterEndingOrderedAsc: false,
            /* Csv Sources */
            showCsvSourceModalDialog: false,
            csvSourceSearchValue: '',
            csvSourceKeyInSelectMode: null,
            isCsvSourceInEditMode: false,
            csvSourceTextBeingEdited: '',
            isCsvSourceOrderedAsc: false,
            /* Support Status */
            showSupportStatusModalDialog: false,
            supportStatusSearchValue: '',
            supportStatusKeyInSelectMode: null,
            isSupportStatusInEditMode: false,
            supportStatusTextBeingEdited: '',
            isSupportStatusOrderedAsc: false,
            issupportStatusInDnDSort: false,
			topSearchAllResults : [],
			topSearchHierarchyResults:[],
			showSearchMode:false,
			parentNotBelongingItemsCount:0,
            dndSortTemp: {
                supportStatus: [],
                voterGroups: [],
                lastVoterGroupsSource: null,
                lastVoterGroupsTarget: null,
            },
			showAddEditModalWindow:false,
            /* Voter Action Types */
            showVoterActionTypeModalDialog: false,
            voterActionTypeSearchValue: '',
            voterActionTypeKeyInSelectMode: null,
            voterActionTypeNameInSelectMode: '',
            isVoterActionTypeInEditMode: false,
            voterActionTypeTextBeingEdited: '',
            isVoterActionTypeOrderedAsc: false,
            isVoterActionTypeTopicsDisplayed: false,
            /* Voter Action Topics */
            showVoterActionTopicModalDialog: false,
            voterActionTopicOrderColumn: 'name',
            voterActionTopicSearchValue: '',
            voterActionTopicKeyInSelectMode: null,
            isVoterActionTopicInEditMode: false,
            isVoterActionTopicOrderedAsc: false,
            voterActionTopicInEditMode: {
                name: '',
                active: 1,
                actionTypeId: -1
            },
            /* Voter Meta Keys */
            showVoterMetaKeyModalDialog: false,
            voterMetaKeySearchValue: '',
            voterMetaKeyInSelectMode: null,
            voterMetaKeyNameInSelectMode: '',
            voterMetaKeyTypeInSelectMode: null,
            isVoterMetaKeyInEditMode: false,
            voterMetaKeyOrderColumn: 'key_name',
            isVoterMetaKeyOrderedAsc: false,
            isVoterMetaKeyValuesDisplayed: false,
            voterMetaKeyInEditMode: {
                key_name: '',
                key_type: 0,
                per_campaign: 0,
            },
            /* Voter Meta Values */
            showVoterMetaValueModalDialog: false,
            voterMetaValueSearchValue: '',
            voterMetaValueKeyInSelectMode: null,
            isVoterMetaValueInEditMode: false,
            isVoterMetaValueOrderedAsc: false,
            voterMetaValueInEditMode: {
                value: '',
                voterMetaKeyId: -1
            },
            /* institute  */
            showInstituteModalDialog: false,
            instituteSearchValue: '',
            instituteInSelectMode: null,
            instituteNameInSelectMode: '',
            isInstituteInEditMode: false,
            instituteOrderColumn: 'name',
            isInstituteOrderedAsc: false,
            isInstituteInAddMode: false,
            instituteInEditMode: { name: '', group_key: '', type_key: '', network_key: '', city_key: '', 
                                            group:'', type: '', network: '', city: ''},
            /* institute Groups */
            showInstituteGroupModalDialog: false,
            instituteGroupSearchValue: '',
            instituteGroupInSelectMode: null,
            instituteGroupNameInSelectMode: '',
            isInstituteGroupInEditMode: false,
            instituteGroupOrderColumn: 'key_name',
            isInstituteGroupOrderedAsc: false,
            isInstituteGroupValuesDisplayed: false,
            instituteGroupInEditMode: '',
            /* institute Types */
            showInstituteTypeModalDialog: false,
            instituteTypeSearchValue: '',
            instituteTypeKeyInSelectMode: null,
            isInstituteTypeInEditMode: false,
            isInstituteTypeOrderedAsc: false,
            instituteTypeInEditMode: {
                name: '',
                instituteGroupId: -1
            },
            /* institute Networks */
            showInstituteNetworkModalDialog: false,
            instituteNetworkSearchValue: '',
            instituteNetworkInSelectMode: null,
            isInstituteNetworkInEditMode: false,
            instituteNetworkOrderColumn: 'key_name',
            isInstituteNetworkOrderedAsc: false,
            isInstituteNetworkValuesDisplayed: false,
            instituteNetworkInEditMode: '',
            /* Voter Election Roles*/
            showVoterElectionRolesModalDialog: false,
            voterElectionRolesSearchValue: '',
            voterElectionRolesKeyInSelectMode: null,
            isVoterElectionRolesInEditMode: false,
            voterElectionRolesTextBeingEdited: '',
            isVoterElectionRolesOrderedAsc: false,
            /* InstituteRole */
            showInstituteRoleModalDialog: false,
            isInstituteRolesOrderedAsc: false,
            instituteRoleSearchValue: '',
            instituteRoleKeyInSelectMode: null,
            instituteRoleTypeKey: -1,
            isInstituteRoleInEditMode: false,
            instituteRoleInEditMode: { name: '', instituteTypeId: -1 },
            /* voterGroup */
            openVoterGroups: {},
            voterGroupKeyInSelectMode: null,
            voterGroupNameInSelectMode: null,
            showVoterGroupModalDialog: false,
            isVoterGroupInEditMode: false,
            voterGroupInEditMode: { name: '', parentId: -1 },
            isVoterGroupInDnDSort: false,
            isVoterGroupInAddMode: false,
            /* Shas Representative Roles*/
            showShasRepresentativeRolesModalDialog: false,
            shasRepresentativeRolesSearchValue: '',
            shasRepresentativeRolesKeyInSelectMode: null,
            isShasRepresentativeRolesInEditMode: false,
            shasRepresentativeRolesTextBeingEdited: '',
            isShasRepresentativeRolesOrderedAsc: false,
            /* Religeous Council Roles*/
            showReligiousCouncilModalDialog: false,
            religiousCouncilSearchValue: '',
            religiousCouncilKeyInSelectMode: null,
            isReligiousCouncilInEditMode: false,
            religiousCouncilTextBeingEdited: '',
            isReligiousCouncilOrderedAsc: false,
            /* Shas City Roles*/
            showCityShasModalDialog: false,
            cityShasSearchValue: '',
            cityShasKeyInSelectMode: null,
            isCityShasInEditMode: false,
            cityShasTextBeingEdited: '',
            isCityShasOrderedAsc: false,
            /* PartyList */
            showPartyListModalDialog: false,
            isPartyListsOrderedAsc: false,
            partyListOrderColumn: 'name',
            partyListSearchValue: '',
            partyListKeyInSelectMode: null,
            partyListCityKey: -1,
            isPartyListInEditMode: false,
            partyListInEditMode: { name: '', letters: '', shas: 0 },
            isPartyListInAddMode: false,
        },
        requestTab: {
            /* Request Topics */
            showRequestTopicModalDialog: false,
            requestTopicSearchValue: '',
            requestSubTopicSearchValue: '',
            requestTopicsKeyInSelectMode: null,
            requestTopicNameInSelectMode: '',
            isRequestTopicInEditMode: false,
            isRequestTopicOrderedAsc: false,
            isRequestSubTopicOrderedAsc: false,
            requestTopicOrderColumn: 'name',
            requestSubTopicOrderColumn: 'name',
            isSubTopicsDisplayed: false,
            isRequestStatusInDnDSort: false,
            dndSortTemp: {
                requestStatus: [],
            },
            requestTopicInEditedMode: {
                name: '',
                active: 1,
                parent_id: 0,
                target_close_days: null,
                default_request_status_id: null,
            },
            subTopicsParentKey: null,
            isSubTopicInAddMode: true,
            isTopicsInDnDSort: false,
            isSubTopicsInDnDSort: false,
            dndSortTemp: {
                topics: [],
                subTopics: [],
            },
            /* Request Action Types */
            showRequestActionTypeModalDialog: false,
            requestActionTypeSearchValue: '',
            requestActionTypeKeyInSelectMode: null,
            requestActionTypeNameInSelectMode: '',
            isRequestActionTypeInEditMode: false,
            requestActionTypeTextBeingEdited: '',
            isRequestActionTypeOrderedAsc: false,
            isRequestActionTypeTopicsDisplayed: false,
            /* Request Action Topics */
            showRequestActionTopicModalDialog: false,
            requestActionTopicOrderColumn: 'name',
            requestActionTopicSearchValue: '',
            requestActionTopicKeyInSelectMode: null,
            isRequestActionTopicInEditMode: false,
            isRequestActionTopicOrderedAsc: false,
            requestActionTopicInEditMode: {
                name: '',
                active: 1,
                actionTypeId: -1
            },
            /* RequestStatus */
            showRequestStatusModalDialog: false,
            isCountriesOrderedAsc: false,
            requestStatusOrderColumn: 'name',
            requestStatusSearchValue: '',
            requestStatusKeyInSelectMode: null,
            isRequestStatusInEditMode: false,
            isRequestStatusInAddMode: false,
            requestStatusInEditMode: { name: '', type_id: -1 },

            /* Request Source */
            showRequestSourceModalDialog: false,
            requestSourceSearchValue: '',
            requestSourceKeyInSelectMode: null,
            isRequestSourceInEditMode: false,
            requestSourceTextBeingEdited: '',
            isRequestSourceOrderedAsc: false,

            /* Request Closure Reason */
            showRequestClosureReasonModalDialog: false,
            requestClosureReasonSearchValue: '',
            requestClosureReasonKeyInSelectMode: null,
            isRequestClosureReasonInEditMode: false,
            requestClosureReasonTextBeingEdited: '',
            isRequestClosureReasonOrderedAsc: false,
        },
        systemTab: {
            /* User Roles */
            showUserRoleModalDialog: false,
            userRoleSearchValue: '',
            userRoleKeyInSelectMode: null,
            isUserRoleInEditMode: false,
            isUserRoleInAddMode: false,
            userRoleInEditMode: { module_id: -1, role_name: '', team_leader: 0, permission_group_id: -1, module_name: '' },
            isUserRoleOrderedAsc: false,
            userRoleOrderColumn: 'module_name',
            /* Teams */
            showTeamModalDialog: false,
            teamSearchValue: '',
            teamKeyInSelectMode: null,
            isTeamOrderedAsc: false,
            teamOrderColumn: 'name',
            sms_providers_options: []
        },
    },
    requestModuleUsers:[],
    users: [],
    teams: [],
    roles: [],
    phoneTypes: [],
    selectedUserData: { personal_identity: '', isUserLoaded: false, key: '' },
    originalUserPhones: [],
    loadedUsers: false,
    loadedUsersData: false,
    modules: [],
    userScreen: {
        containerCollapseStatus: {
            workAddress: true,
            contactDetails: true,
            userRoles: true,
        },
        showCopyDialog: false,
        addingGeographicalFilter: false,
        editingGeographicalFilter: false,
        modalGeographicalFilterRoleIndex: -1,
        geographicalModalHeader: '',
        geoFilterModalScreen: {
            areaGroupName: '',
            areaName: '',
            subAreaName: '',
            labelName: '',
            mainFilterName: '',
            entityType: -1,
            entityID: -1,
            subAreas: [],
            cities: [],
            initialCities: [],
            neighborhoods: [],
            clusters: [],
            ballots: [],
            cityName: '',
            neighborhoodName: '',
            clusterName: '',
            ballotName: '',
            tempUserRoleGeoFilters: [],
            tempUserRoleTeamGeoFilters: [],
        },
        newUserMetadata: false,
        updateUser: false,
        showDeleteUserModal: false,
        showModalDialog: false,
        randomUserPassword: '',
        oldUserPassword: '',
        showResetPasswordModal: false,
        showHeaderChangePasswordModal: false,
        changePasswordModalOtherUser: null,
        modalHeaderText: '',
        modalContentText: '',
        newUserActive: true,
        newUserTwoStepAuth: true,
        newUserAdmin: false,
        teamDepartments: false,
        roleDepartments: [],
        updateButtonClicked: false,
        tabLowerFrame: '',
        oldPassword: '',
        password: '',
        confirmPassword: '',
        addingUserRole: false,
        editingUserRole: false,
        editingUserRoleIndex: -1,
        deleteUserRoleIndex: -1,
        addNewUserRoleScreen: {
            moduleName: '',
            roleName: '',
            teamName: '',
            departmentName: '',
            fromDate: getTodaysDate(),
            toDate: '',
        },
        addingNewUserPhone: false,
        addNewUserPhoneScreen: {
            phone: '',
            type_name: '',
        },
        confirmDeleteRoleByUser: false,
        confirmDeleteRoleByUserIndex: -1,
        confirmDeleteRoleGeoFilterByUser: false,
        confirmDeleteRoleGeoFilterByUserIndex: -1,
        isPhoneInEditMode: false,
        phoneIdInSelectMode: false,
        phoneNumberBeingEdited: '',
        phoneNumberTypeBeingEdited: -1,
        showPhoneDeleteModalDialog: false,
        confirmDeleteRoleSectorialFilterByUser: false,
        confirmDeleteRoleSectorialFilterByUserIndex: -1,
        userRequestTopics: []
    },
    addingUser: false,
    addedUser: false,
    cities: [],
	areas:[],
    crmHomeScreen: {
        summaryData: [],
        summaryDisplayTarget: 'new',
        averageHandleTime: 0,
        unreadRequestsCount: 0,
        openRequests: {},
        isOrderedAsc: false,
        orderColumn: 'target_close_date',
        summaryCount: {
            open: 0,
            new: 0,
            passedToMe: 0,
            closed: 0,
            inTherapy: 0,
            IPassedOver: 0,
            exceedCloseDate: 0
        }
    },
    examples: {
        dndSortScreen: {
            items: [],
            originalItems: []
        }
    },
    savingChanges: false,
    changesSaved: false,
    changesNotSaved: false,
    currentUser: {
        first_name: "",
        last_name: "",
        id: "",
        admin: false,
        permissions: {},
        geographicFilters: [] ,
        is_view_all_voters: false    
    },
    currentUserGeographicalFilteredLists : { 
             areas : [] , 
             sub_areas : [] , 
             cities : [],
    },
	
    currentCampaign: {},
    navSeatchText: '',
    systemSettings: {
        minimum_days_between_requests: 0,
		show_system_errors: true,
        max_upload_size: "2MB",
        show_system_errors: true,
        max_upload_size: "2MB",
    },
    permissionGroupsScreen: {
        selectedUserRole: {
            key: null,
            name: null,
            permissions: []
        },
        currentUrlKey: undefined,
        groupInputValue: '',
        inputChanged: false,
        permissions: [],
        selectedPermissions: {},
        openPermissions: [],
        showDeleteModal: false,
        showCantDeleteModal: false,
        showMissingGroupModal: false,
        isPermissionGroupInEditMode: false,
        displayErrorModalDialog: false,
        modalDialogErrorMessage: ''
    },
    scrollbarWidth: 0,
    lastAPICall: null,
    baseSystemTitle: 'ניהול קשרי תושבים',
    systemTitle: '',
    breadcrumbs: [{ url: './', title: 'דף הבית', elmentType: 'home' }],
    saveChangesModalShow: false,
    gotoUrl: '',
    dirty: false,
    dirtyComponents: [],
    ignoreDirty: false,
    displayErrorModalDialog: false,
    modalDialogErrorMessage: '',
    maintenanceMode: false,
    maintenanceDate: null,
    existAudioInput: null,
};
function systemReducer(state = initialState, action) {

    let tempStru = null;
    switch (action.type) {
        //Set scrollbar width
        case SystemActions.ActionTypes.SET_SCROLLBAR_WIDTH:
            var newState = {...state};
            newState.scrollbarWidth = action.scrollbarWidth;
            return newState;
            break;
        //set the system title
        case SystemActions.ActionTypes.SET_SYSTEM_TITLE:
            var newState = {...state};
            newState.systemTitle = action.systemTitle;
            return newState;
            break;
        //toggle show/hide header search
        case SystemActions.ActionTypes.TOGGLE_HEADER_SEARCH:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.showSearch = !newState.header.showSearch;
            return newState;
            break;
        //toggle show/hide side menu
        case SystemActions.ActionTypes.MENU.TOGGLE_MENU:
            var newState = {...state};
            newState.menus = {...newState.menus};
            newState.menus.open = !(newState.menus.open);
            return newState;
            break;
        //menu search nav text input value changes	
        case SystemActions.ActionTypes.MENU.SEARCH_NAV_TEXT_CHANGE:
            var newState = {...state};
            newState.navSeatchText = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.MENU.SEARCH_IN_MENU:
            var newState = {...state};
            newState.menus = {...state.menus};
            newState.menus.menu = searchInMenu(newState.menus.openedMenuItems, newState.menus.menu, action.data);
            return newState;
            break;
        //toggle show/hide user menu
        case SystemActions.ActionTypes.MENU.TOGGLE_USER_MENU:
            var newState = {...state};
            newState.menus = {...newState.menus};
            newState.menus.userMenuOpen = !(newState.menus.userMenuOpen);
            return newState;
            break;
        //side menu loaded
        case SystemActions.ActionTypes.MENU.LOADED_MENU:
            var newState = {...state};
            newState.menus = {...newState.menus};
            newState.menus.menu = action.menu;
            return newState;
            break;
        //toggle show/hide sub menu item
        case SystemActions.ActionTypes.MENU.TOGGLE_MENU_ITEM:
            var newState = {...state};
            newState.menus = {...newState.menus};
            newState.menus.openedMenuItems = [...newState.menus.openedMenuItems];
            if (action.isOpen) {
                var index = newState.menus.openedMenuItems.indexOf(action.item);
                if (index > -1)
                    newState.menus.openedMenuItems.splice(index, 1);
            } else {
                newState.menus.openedMenuItems.push(action.item);
            }
            return newState;
            break;
        //show save changes modal
        case SystemActions.ActionTypes.SAVE_CHANGES_MODAL_SHOW:
            var newState = {...state};
            newState.saveChangesModalShow = true;
            newState.ignoreDirty = false;
            newState.gotoUrl = action.gotoUrl;
            return newState;
            break;
        //hide save changes modal
        case SystemActions.ActionTypes.SAVE_CHANGES_MODAL_HIDE:
            var newState = {...state};
            newState.saveChangesModalShow = false;
            return newState;
            break;
        //open modal header change user password
        case SystemActions.ActionTypes.HEADER.OPEN_CHANGE_PASSWORD_MODAL:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.showHeaderChangePasswordModal = true;
            newState.userScreen.changePasswordModalOtherUser = action.selectedUserData;
            return newState;
            break;
        //close modal header change user password
        case SystemActions.ActionTypes.HEADER.CLOSE_CHANGE_PASSWORD_MODAL:
            var newState = {...state};
            newState.userScreen.showHeaderChangePasswordModal = false;
            newState.userScreen.changePasswordModalOtherUser = null;
            return newState;
            break;
        //Loaded last viewed voters -> to menu list
        case SystemActions.ActionTypes.HEADER.LOADED_LAST_VIEWED_VOTERS:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.lastViewedVoters = action.lastViewedVoters;
            return newState;
            break;
        //toggle last viewed voter menu
        case SystemActions.ActionTypes.HEADER.TOGGLE_LAST_VIEWED_VOTERS_MENU:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.lastViewedVotersMenuOpen = !newState.header.lastViewedVotersMenuOpen;
            return newState;
            break;
        //Header -> User Favorites
        case SystemActions.ActionTypes.HEADER.LOADED_FAVORITES:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.favorites = action.favorites;
            return newState;
            break;
        case SystemActions.ActionTypes.HEADER.TOGGLE_FAVORITES_MENU:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.isFavoritesMenuOpen = !newState.header.isFavoritesMenuOpen;
            return newState;
            break;
        case SystemActions.ActionTypes.HEADER.TOGGLE_CURRENT_CAMPAIGN_NAME:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.displayCurrentCampaignName = action.display;
            return newState;
            break;
        case SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.displayErrorModalDialog = action.displayError;
            newState.modalDialogErrorMessage = action.errorMessage || '';
            return newState;
            break;
        //Change search type in header
        case SystemActions.ActionTypes.HEADER.SET_SEARCH_TYPE:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.searchType = action.searchType;
            return newState;
            break;
        //change search input in header
        case SystemActions.ActionTypes.HEADER.SET_SEARCH_INPUT:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.searchInput = action.searchInput;
            newState.header.searchResult = [];
            return newState;
            break;
        //set searching from header
        case SystemActions.ActionTypes.HEADER.SEARCHING:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.searching = true;
            return newState;
            break;
        //finished searching from header
        case SystemActions.ActionTypes.HEADER.SEARCHED:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.searchResult = action.searchResult;
            newState.header.searching = false;
            return newState;
            break;
        //clear search parameters and result for header search
        case SystemActions.ActionTypes.HEADER.CLEAR_SEARCH:
            var newState = {...state};
            newState.header = {...newState.header};
            newState.header.searchResult = [];
            newState.header.searchInput = '';
            return newState;
            break;
        //set all voters view in header on/off
        case SystemActions.ActionTypes.HEADER.UPDATE_ALL_VOTERS_MODE:
            var newState = {...state};
            newState.currentUser = {...newState.currentUser};
            newState.currentUser.is_view_all_voters = action.value;
            return newState;
            break;
        //Set state to dirty - user changed something but has not saved it yet
        case SystemActions.ActionTypes.SET_DIRTY:
            var newState = {...state};
            newState.dirtyComponents = [...newState.dirtyComponents];
            if (newState.dirtyComponents.indexOf(action.target.toLowerCase()) == -1) {
                newState.dirtyComponents.push(action.target.toLowerCase());
            }
            newState.dirty = true;
            return newState;
            break;
        //Clear dirty state
        case SystemActions.ActionTypes.CLEAR_DIRTY:
            var newState = {...state};
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
            return newState;
            break;
        //Ignore dirty state and clear it
        case SystemActions.ActionTypes.IGNORE_DIRTY:
            var newState = {...state};
            newState.ignoreDirty = true;
            return newState;
            break;
        //saving changes
        case SystemActions.ActionTypes.SAVING_CHANGES:
            var newState = {...state};
            newState.savingChanges = true;
            return newState;
            break;
        // Not saving changes
        case SystemActions.ActionTypes.UNSAVING_CHANGES:
            var newState = {...state};
            newState.savingChanges = false;
            return newState;
            break;
        //changes not saved
        case SystemActions.ActionTypes.CHANGES_NOT_SAVED:
            var newState = {...state};
            newState.savingChanges = false;
            newState.changesNotSaved = true;
            return newState;
            break;
        //changes saved
        case SystemActions.ActionTypes.CHANGES_SAVED:
            var newState = {...state};
            newState.savingChanges = false;
            newState.changesSaved = true;
            return newState;
            break;
        //clear changes saved
        case SystemActions.ActionTypes.CLEAR_CHANGES_SAVED:
            var newState = {...state};
            newState.changesSaved = false;
            return newState;
            break;
        //clear changes not saved
        case SystemActions.ActionTypes.CLEAR_CHANGES_NOT_SAVED:
            var newState = {...state};
            newState.changesNotSaved = false;
            return newState;
            break;
        case SystemActions.ActionTypes.LAST_API_CALL:
            var newState = {...state};
            newState.lastAPICall = Date.now() / 1000 | 0;
            return newState;
            break;
        case SystemActions.ActionTypes.LOADED_CURRENT_USER:
            var newState = {...state};
            newState.currentUser = action.user;
            return newState;
            break;

        case SystemActions.ActionTypes.CLEAN_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS:
            var newState = {...state};
            newState.currentUser = {...state.currentUser};
            
            newState.currentUserGeographicalFilteredLists = {...initialState.currentUserGeographicalFilteredLists};

            return newState;
            break;

        case SystemActions.ActionTypes.LOADED_SYSTEM_SETTINGS:
            var newState = {...state};
            newState.systemSettings = {...state.systemSettings};

            newState.systemSettings.minimum_days_between_requests = action.data.minimum_days_between_requests;
            newState.systemSettings.document_max_file_size = action.data.document_max_file_size;
            newState.systemSettings.show_system_errors = (action.data.show_system_errors) ? true : false;
            newState.systemSettings.max_upload_size = action.data.max_upload_size;

            return newState;
            break;

        case SystemActions.ActionTypes.PERMISSIONS.LOADED_PERMISSION_GROUP:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.selectedUserRole = action.selectedUserRole;
            newState.permissionGroupsScreen.groupInputValue = action.selectedUserRole.name;
            newState.permissionGroupsScreen.selectedPermissions = action.selectedPermissions;
            return newState;
            break;

        case SystemActions.ActionTypes.PERMISSIONS.LOADED_PERMISSIONS:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.permissions = action.permissions;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.TOGGLE_OPEN_PERMISSION_CHILDREN:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.openPermissions = [...newState.permissionGroupsScreen.openPermissions];
            if ((newState.permissionGroupsScreen.openPermissions[action.id] == undefined) || (newState.permissionGroupsScreen.openPermissions[action.id] == false))
                newState.permissionGroupsScreen.openPermissions[action.id] = true;
            else
                newState.permissionGroupsScreen.openPermissions[action.id] = false;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.TOGGLE_SELECT_PERMISSION:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.selectedPermissions = {...newState.permissionGroupsScreen.selectedPermissions};
            newState.permissionGroupsScreen.selectedPermissions[action.key] = action.checked;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.CHANGE_CURRENT_URL_KEY:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.currentUrlKey = action.key;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.CHANGE_GROUP_INPUT:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.groupInputValue = action.groupInput;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.CHANGED_INPUT:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.inputChanged = action.inputChanged;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.SAVED_PERMISSION_NEW_GROUP:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.permissionGroups = [...newState.lists.permissionGroups];
            newState.lists.permissionGroups.push(action.newGroup);
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.GROUP_PERMISSION_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.isPermissionGroupInEditMode = action.isPermissionGroupInEditMode;
            return newState;
            break;

        /*     case SystemActions.ActionTypes.PERMISSIONS.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY:
         var newState = {...state};
         newState.permissionGroupsScreen.displayErrorModalDialog = action.displayError;
         newState.permissionGroupsScreen.modalDialogErrorMessage = action.errorMessage || '';
         return newState;
         break;    */


        case SystemActions.ActionTypes.PERMISSIONS.SHOW_DELETE_MODAL:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.showDeleteModal = true;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.HIDE_DELETE_MODAL:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.showDeleteModal = false;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.SHOW_CANT_DELETE_MODAL:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.showCantDeleteModal = true;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.HIDE_CANT_DELETE_MODAL:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.showCantDeleteModal = false;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.DELETED_PERMISSION_GROUP:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.groupInputValue = '';
            newState.permissionGroupsScreen.selectedUserRole = {};
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.SHOW_MISSING_GROUP_MODAL:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.showMissingGroupModal = true;
            return newState;
            break;
        case SystemActions.ActionTypes.PERMISSIONS.HIDE_MISSING_GROUP_MODAL:
            var newState = {...state};
            newState.permissionGroupsScreen = {...newState.permissionGroupsScreen};
            newState.permissionGroupsScreen.showMissingGroupModal = false;
            return newState;
            break;
        /* LISTS :: COUNTRY */
        case SystemActions.ActionTypes.LISTS.LOADED_COUNTRIES:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists.countries = action.countries;
            newState.listsScreen.generalTab.countryKeyInSelectMode = null;
            newState.listsScreen.generalTab.isCountryInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showCountryModalDialog = false;
            newState.listsScreen.generalTab.countryTextBeingEdited = '';
            newState.listsScreen.generalTab.countrySearchValue = '';
            newState.listsScreen.generalTab.isCountriesOrderedAsc = !newState.listsScreen.generalTab.isCountriesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_COUNTRIES:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var countries = [...newState.lists.countries];
            var sortDirection = newState.listsScreen.generalTab.isCountriesOrderedAsc ? 'asc' : 'desc';
            countries.sort(arraySort(sortDirection, 'name'));
            newState.lists.countries = countries;
            newState.listsScreen.generalTab.isCountriesOrderedAsc = !newState.listsScreen.generalTab.isCountriesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_COUNTRY_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.countrySearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_COUNTRY_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showCountryModalDialog = !newState.listsScreen.generalTab.showCountryModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.COUNTRY_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.countryKeyInSelectMode = action.countrykey;
            return newState;
        case SystemActions.ActionTypes.LISTS.COUNTRY_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.countryKeyInSelectMode = action.countrykey || null;
            newState.listsScreen.generalTab.isCountryInEditMode = (undefined != action.countrykey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.countrykey) ? true : false;
            newState.listsScreen.generalTab.countryTextBeingEdited = action.countryName || '';
            return newState;
        case SystemActions.ActionTypes.LISTS.COUNTRY_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.countryTextBeingEdited = action.countryName;
            return newState;
        /* LISTS :: ETHNIC */
        case SystemActions.ActionTypes.LISTS.LOADED_ETHNIC:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists.ethnic = action.ethnic;
            newState.listsScreen.voterTab.ethnicKeyInSelectMode = null;
            newState.listsScreen.voterTab.isEthnicInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showEthnicModalDialog = false;
            newState.listsScreen.voterTab.ethnicTextBeingEdited = '';
            newState.listsScreen.voterTab.ethnicSearchValue = '';
            newState.listsScreen.voterTab.isEthnicOrderedAsc = !newState.listsScreen.voterTab.isEthnicOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_ETHNIC_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showEthnicModalDialog = !newState.listsScreen.voterTab.showEthnicModalDialog;
            return newState;
        case SystemActions.ActionTypes.LISTS.ORDER_ETHNIC:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var ethnic = [...newState.lists.ethnic];
            newState.listsScreen.voterTab.ethnicOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isEthnicOrderedAsc ? 'asc' : 'desc';
            ethnic.sort(arraySort(sortDirection, newState.listsScreen.voterTab.ethnicOrderColumn));
            newState.lists.ethnic = ethnic;
            newState.listsScreen.voterTab.isEthnicOrderedAsc = !newState.listsScreen.voterTab.isEthnicOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.UPDATE_ETHNIC_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.ethnicSearchValue = action.value;
            return newState;
        case SystemActions.ActionTypes.LISTS.ETHNIC_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.ethnicKeyInSelectMode = action.ethnickey;
            return newState;
        case SystemActions.ActionTypes.LISTS.ETHNIC_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.ethnicKeyInSelectMode = action.ethnickey || null;
            newState.listsScreen.voterTab.isEthnicInEditMode = (undefined != action.ethnickey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.ethnickey) ? true : false;
            newState.listsScreen.voterTab.ethnicTextBeingEdited = action.ethnicName || '';
            newState.listsScreen.voterTab.ethnicSephardiValueInEdited = action.ethnicSephardi || '';
            return newState;
        case SystemActions.ActionTypes.LISTS.ETHNIC_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.ethnicTextBeingEdited = action.ethnicName;
            return newState;
        case SystemActions.ActionTypes.LISTS.ETHNIC_SEPHARDI_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.ethnicSephardiValueInEdited = action.ethnicSephardi;
            return newState;
        /* LISTS :: RELIGIOUS GROUPS */
        case SystemActions.ActionTypes.LISTS.LOADED_RELIGIOUS_GROUPS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists.religiousGroups = action.religiousGroups;
            newState.listsScreen.voterTab.religiousGroupKeyInSelectMode = null;
            newState.listsScreen.voterTab.isReligiousGroupInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showReligiousGroupsModalDialog = false;
            newState.listsScreen.voterTab.religiousGroupTextBeingEdited = '';
            newState.listsScreen.voterTab.religiousGroupsSearchValue = '';
            newState.listsScreen.voterTab.isReligiousGroupsOrderedAsc = !newState.listsScreen.voterTab.isReligiousGroupsOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_RELIGIOUS_GROUP_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showReligiousGroupsModalDialog = !newState.listsScreen.voterTab.showReligiousGroupsModalDialog;
            return newState;
        case SystemActions.ActionTypes.LISTS.ORDER_RELIGIOUS_GROUPS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var religiousGroups = [...newState.lists.religiousGroups];
            newState.listsScreen.voterTab.religiousGroupsOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isReligiousGroupsOrderedAsc ? 'asc' : 'desc';
            religiousGroups.sort(arraySort(sortDirection, newState.listsScreen.voterTab.religiousGroupsOrderColumn));
            newState.lists.religiousGroups = religiousGroups;
            newState.listsScreen.voterTab.isReligiousGroupsOrderedAsc = !newState.listsScreen.voterTab.isReligiousGroupsOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.UPDATE_RELIGIOUS_GROUPS_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.religiousGroupsSearchValue = action.value;
            return newState;
        case SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.religiousGroupKeyInSelectMode = action.religiousGroupKey;
            return newState;
        case SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.religiousGroupKeyInSelectMode = action.religiousGroupKey || null;
            newState.listsScreen.voterTab.isReligiousGroupInEditMode = (undefined != action.religiousGroupKey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.religiousGroupKey) ? true : false;
            newState.listsScreen.voterTab.religiousGroupTextBeingEdited = action.religiousGroupName || '';
            return newState;
        case SystemActions.ActionTypes.LISTS.RELIGIOUS_GROUPS_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.religiousGroupTextBeingEdited = action.religiousGroupName;
            return newState;
        /* LISTS :: CITIES */
        case SystemActions.ActionTypes.LISTS.CITIES_LOADED:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists.cities = action.cities;
            newState.listsScreen.generalTab.cityKeyInSelectMode = null;
            newState.listsScreen.generalTab.isCityInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showCityModalDialog = false;
            newState.listsScreen.generalTab.isCityInAddMode = false;
            newState.listsScreen.generalTab.cityInEditMode = {
                cityName: '',
                miId: '',
                areaKey: null,
                areaName: '',
                subAreaKey: null,
                subAreaName: '',
           };
            newState.listsScreen.generalTab.citySearchValue = '';
            newState.listsScreen.generalTab.isCitiesOrderedAsc = !newState.listsScreen.generalTab.isCitiesOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showCityModalDialog = !newState.listsScreen.generalTab.showCityModalDialog;
            return newState;
        case SystemActions.ActionTypes.LISTS.ORDER_CITIES:
            var newState = {...state};
            newState.lists = {...newState.lists};
            var cities = [...newState.lists.cities];
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.cityOrderColumn = action.orderColumn || 'city_name';
            var sortDirection = newState.listsScreen.generalTab.isCitiesOrderedAsc ? 'asc' : 'desc';
            cities.sort(arraySort(sortDirection, newState.listsScreen.generalTab.cityOrderColumn));
            newState.lists.cities = cities;
            newState.listsScreen.generalTab.isCitiesOrderedAsc = !newState.listsScreen.generalTab.isCitiesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_CITY_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.citySearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.cityKeyInSelectMode = action.citykey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_CURRENT_DISPLAYED_CITIES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var citiesToDisplay = newState.lists.cities.filter(function (item) {
                if (item.city_name.indexOf(newState.listsScreen.generalTab.citySearchValue) !== -1) {
                    return item;
                }
            }).slice(0, state.listsScreen.generalTab.currentDisplayedCitiesCount);
            newState.listsScreen.generalTab.currentDisplayedCities = citiesToDisplay;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOAD_MORE_CITIES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.currentDisplayedCitiesCount += 30;
            var isThereMoreCities = newState.lists.cities.length > newState.listsScreen.generalTab.currentDisplayedCitiesCount ? true : false;
            newState.listsScreen.generalTab.IsThereMoreCitiesToDisplay = isThereMoreCities;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.cityKeyInSelectMode = action.city ? action.city.city_key : null;
            newState.listsScreen.generalTab.isCityInEditMode = (undefined != action.city) ? true : false;
            newState.listsScreen.dirty = (undefined != action.city) ? true : false;
            let isValid = (undefined != action.city) ? (action.city.mi_id > 0 ? true : false) : false;
            newState.listsScreen.generalTab.isCityMiIDValid = isValid;
            let editedCity = {
                cityName: (undefined != action.city) ? action.city.city_name : '',
                miId: (undefined != action.city) ? 1 * action.city.mi_id : '',
                areaKey: (undefined != action.city) ? action.city.area_key : null,
                areaName: (undefined != action.city) ? action.city.area_name : '',
                subAreaKey: (undefined != action.city) ? action.city.sub_area_key : null,
                subAreaName: (undefined != action.city) ? action.city.sub_area_name : '',
           };
            newState.listsScreen.generalTab.cityInEditMode = editedCity;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var cityInEditMode = {...newState.listsScreen.generalTab.cityInEditMode};
            cityInEditMode[action.key] = action.value;
            newState.listsScreen.generalTab.cityInEditMode = cityInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_MIID_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var generalTab = {...newState.listsScreen.generalTab};
            var isValid = generalTab.cityInEditMode.miId ? true : false;
            newState.lists.cities.map(function (city) {
                if ((city.city_key !== generalTab.cityKeyInSelectMode)
                    && (city.mi_id === parseInt(generalTab.cityInEditMode.miId))) {
                    isValid = false;
                    return;
                }
            });
            newState.listsScreen.generalTab.isCityMiIDValid = isValid;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ADD_CITY_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.subAreas = [];
            var cityInEditMode = {...newState.listsScreen.generalTab.cityInEditMode};
            if (action.event === 'add') {
                newState.listsScreen.generalTab.isCityInAddMode = true;
                newState.listsScreen.dirty = true;
                cityInEditMode.cityName = newState.listsScreen.generalTab.citySearchValue;
            } else {
                newState.listsScreen.generalTab.isCityInAddMode = false;
                newState.listsScreen.dirty = false;
                newState.listsScreen.generalTab.citySearchValue = '';
                cityInEditMode = {
                    cityName: '',
                    miId: '',
                    areaKey: null,
                    areaName: '',
                    subAreaKey: null,
                    subAreaName: '',
               };
            }
            newState.listsScreen.generalTab.cityInEditMode = {...newState.listsScreen.generalTab.cityInEditMode};
            newState.listsScreen.generalTab.cityInEditMode = cityInEditMode;
            return newState;
            break;
        /* LISTS :: AREAS GROUPS */

        case SystemActions.ActionTypes.LISTS.LOADED_AREAS_GROUPS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.areasGroups = action.areasGroups;
            return newState;
            break;
        /* LISTS :: AREAS */

        case SystemActions.ActionTypes.LISTS.LOADED_AREAS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.areas = action.areas;
            newState.listsScreen.generalTab.areaKeyInSelectMode = null;
            newState.listsScreen.generalTab.isAreaInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showAreaModalDialog = false;
            newState.listsScreen.generalTab.isSubAreasDisplayed = false;
            newState.listsScreen.generalTab.areaTextBeingEdited = '';
            newState.listsScreen.generalTab.areaSearchValue = '';
            newState.listsScreen.generalTab.isAreaOrderedAsc = !newState.listsScreen.generalTab.isAreaOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_AREAS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var area = [...newState.lists.areas];
            var sortDirection = newState.listsScreen.generalTab.isAreaOrderedAsc ? 'asc' : 'desc';
            area.sort(arraySort(sortDirection, 'name'));
            newState.lists.areas = area;
            newState.listsScreen.generalTab.isAreaOrderedAsc = !newState.listsScreen.generalTab.isAreaOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_AREA_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.areaSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_AREA_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showAreaModalDialog = !newState.listsScreen.generalTab.showAreaModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.AREA_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.areaKeyInSelectMode = action.areakey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.AREA_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.areaKeyInSelectMode = action.areakey || null;
            newState.listsScreen.generalTab.isAreaInEditMode = undefined != action.areakey ? true : false;
            newState.listsScreen.dirty = undefined != action.areakey ? true : false;
            newState.listsScreen.generalTab.areaTextBeingEdited = action.areaName || '';
            newState.listsScreen.generalTab.isSubAreasDisplayed = false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.AREA_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.areaTextBeingEdited = action.areaName;
            return newState;
            break;
        /* LISTS :: COLLAPSE STATUS */
        case SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.containerCollapseStatus = {...newState.listsScreen.containerCollapseStatus};
            
            for (var key in newState.listsScreen.containerCollapseStatus) {
                if (key == action.container) {
                    newState.listsScreen.containerCollapseStatus[key] = !newState.listsScreen.containerCollapseStatus[key];
                } else {
                    newState.listsScreen.containerCollapseStatus[key] = false;
                }
            }
            newState.listsScreen.currentTableScrollerPosition = 0;
            return newState;
            break;
        /* LISTS :: TABLE CONTENT UPDATED */
        case SystemActions.ActionTypes.LISTS.TABLE_CONTENT_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.tableHasScrollbar = {...newState.listsScreen.tableHasScrollbar};
            newState.listsScreen.tableHasScrollbar[action.container] = action.hasScrollbar;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.currentTableScrollerPosition = {...newState.listsScreen.currentTableScrollerPosition};
            newState.listsScreen.currentTableScrollerPosition = action.scrollPosition;
            return newState;
            break;
        /* LISTS :: SUBAREAS */
        case SystemActions.ActionTypes.LISTS.LOADED_SUBAREAS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists.subAreas = action.subAreas;
            newState.listsScreen.generalTab.subAreaKeyInSelectMode = null;
            newState.listsScreen.generalTab.isSubAreaInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showSubAreaModalDialog = false;
            newState.listsScreen.generalTab.subAreaSearchValue = '';
            newState.listsScreen.generalTab.isSubAreaOrderedAsc = !newState.listsScreen.generalTab.isSubAreaOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOAD_SUBAREAS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var subAreaInEditMode = {...newState.listsScreen.generalTab.subAreaInEditMode};
            subAreaInEditMode.area_id = action.id;
            newState.listsScreen.generalTab.subAreaInEditMode = subAreaInEditMode;
            newState.listsScreen.generalTab.areaKeyInSelectMode = action.key;
            newState.listsScreen.generalTab.isSubAreasDisplayed = true;
            newState.listsScreen.generalTab.areaNameInSelectMode = action.areaName;
            newState.listsScreen.generalTab.subAreaSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_SUBAREAS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var subArea = [...newState.lists.subAreas];
            var sortDirection = newState.listsScreen.generalTab.isSubAreaOrderedAsc ? 'asc' : 'desc';
            subArea.sort(arraySort(sortDirection, 'name'));
            newState.lists.subAreas = subArea;
            newState.listsScreen.generalTab.isSubAreaOrderedAsc = !newState.listsScreen.generalTab.isSubAreaOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_SUBAREA_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var subAreaInEditMode = {...newState.listsScreen.generalTab.subAreaInEditMode};
            subAreaInEditMode.name = action.value;
            newState.listsScreen.generalTab.subAreaInEditMode = subAreaInEditMode;
            newState.listsScreen.generalTab.subAreaSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SUBAREA_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showSubAreaModalDialog = !newState.listsScreen.generalTab.showSubAreaModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.SUBAREA_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.subAreaKeyInSelectMode = action.subAreakey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.SUBAREA_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.subAreaKeyInSelectMode = (undefined != action.item ? action.item.key : null);
            newState.listsScreen.generalTab.isSubAreaInEditMode = (undefined != action.item ? true : false);
            newState.listsScreen.dirty = (undefined != action.item ? true : false);
            let emptySubAreaInEditMode = {
                name: '',
                area_id: -1
           };
            let subAreaInEditMode = (undefined != action.item) ? action.item : emptySubAreaInEditMode;
            newState.listsScreen.generalTab.subAreaInEditMode = subAreaInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.SUBAREA_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var subAreaInEditMode = {...newState.listsScreen.generalTab.subAreaInEditMode};
            subAreaInEditMode[action.key] = action.value;
            newState.listsScreen.generalTab.subAreaInEditMode = subAreaInEditMode;
            return newState;
            break;
        /* GENERAL TAB :: NEIGHBORHOOD */
        case SystemActions.ActionTypes.LISTS.LOAD_NEIGHBORHOODS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var neighborhoodInEditMode = {...newState.listsScreen.generalTab.neighborhoodInEditMode};
            neighborhoodInEditMode.city_id = action.id;
            newState.listsScreen.generalTab.neighborhoodInEditMode = neighborhoodInEditMode;
            newState.listsScreen.generalTab.neighborhoodSearchValue = '';
            newState.listsScreen.generalTab.neighborhoodCityKey = action.key;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOODS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.neighborhoods = action.neighborhoods;
            newState.listsScreen.generalTab.neighborhoodKeyInSelectMode = null;
            newState.listsScreen.generalTab.isNeighborhoodInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showNeighborhoodModalDialog = false;
            newState.listsScreen.generalTab.neighborhoodSearchValue = '';
            newState.listsScreen.generalTab.isNeighborhoodsOrderedAsc = !newState.listsScreen.generalTab.isNeighborhoodsOrderedAsc;
            newState.listsScreen.generalTab.isNeighborhoodsClustersDisplayed = false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_NEIGHBORHOODS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var neighborhoods = [...newState.lists.neighborhoods];
            var sortDirection = newState.listsScreen.generalTab.isNeighborhoodsOrderedAsc ? 'asc' : 'desc';
            neighborhoods.sort(arraySort(sortDirection, 'name'));
            newState.lists.neighborhoods = neighborhoods;
            newState.listsScreen.generalTab.isNeighborhoodsOrderedAsc = !newState.listsScreen.generalTab.isNeighborhoodsOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_NEIGHBORHOOD_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var neighborhoodInEditMode = {...newState.listsScreen.generalTab.neighborhoodInEditMode};
            neighborhoodInEditMode.name = action.value;
            newState.listsScreen.generalTab.neighborhoodInEditMode = neighborhoodInEditMode;
            newState.listsScreen.generalTab.neighborhoodSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_NEIGHBORHOOD_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showNeighborhoodModalDialog = !newState.listsScreen.generalTab.showNeighborhoodModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.neighborhoodKeyInSelectMode = action.neighborhoodkey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var neighborhoodInEditMode = {...newState.listsScreen.generalTab.neighborhoodInEditMode};
            var emptyNeighborhood = { name: '', city_id: -1};
            newState.listsScreen.generalTab.neighborhoodInEditMode = (undefined != action.neighborhood) ? action.neighborhood : emptyNeighborhood;
            newState.listsScreen.generalTab.neighborhoodKeyInSelectMode = (undefined != action.neighborhood) ? action.neighborhood.key : null;
            newState.listsScreen.generalTab.isNeighborhoodInEditMode = (undefined != action.neighborhood) ? true : false;
            newState.listsScreen.dirty = (undefined != action.neighborhood) ? true : false;
            newState.listsScreen.generalTab.isNeighborhoodsClustersDisplayed = false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var neighborhoodInEditMode = {...newState.listsScreen.generalTab.neighborhoodInEditMode};
            neighborhoodInEditMode.name = action.name;
            newState.listsScreen.generalTab.neighborhoodInEditMode = neighborhoodInEditMode;
            return newState;
            break;
        /* GENERAL TAB :: CLUSTERS */
        case SystemActions.ActionTypes.LISTS.LOADED_CLUSTERS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.clusters = action.clusters;
            return newState;
        case SystemActions.ActionTypes.LISTS.LOADED_BULLOTS_BOXES:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.ballotBoxes = action.ballotBoxes;
            return newState;
        case SystemActions.ActionTypes.LISTS.LOADED_NEIGHBORHOOD_CLUSTERS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.neighborhoodClusters = action.clusters;
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.isNeighborhoodsClustersDisplayed = true;
            newState.listsScreen.generalTab.neighborhoodClusterSearchValue = '';
            newState.listsScreen.generalTab.neighborhoodClusterKeyInEditMode = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_NEIGHBORHOOD_CLUSTERS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var neighborhoodClusters = [...newState.lists.neighborhoodClusters];
            var sortDirection = newState.listsScreen.generalTab.isNeighborhoodsClustersOrderedAsc ? 'asc' : 'desc';
            neighborhoodClusters.sort(arraySort(sortDirection, 'name'));
            newState.lists.neighborhoodClusters = neighborhoodClusters;
            if(action.changeOrder){
                newState.listsScreen.generalTab.isNeighborhoodsClustersOrderedAsc = !newState.listsScreen.generalTab.isNeighborhoodsClustersOrderedAsc;
            }
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOAD_NEIGHBORHOOD_CLUSTERS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.neighborhoodKeyInSelectMode = action.key;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_NEIGHBORHOOD_CLUSTER_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.neighborhoodClusterSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_CLUSTER_SELECTED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.neighborhoodClusterKeyInEditMode = action.key;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_CLUSTER_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.neighborhoodClusterKeyInEditMode = action.clusterKey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_NEIGHBORHOOD_CLUSTER_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showNeighborhoodClusterModalDialog = !newState.listsScreen.generalTab.showNeighborhoodClusterModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DISPLAY_UPDATE_CLUSTERS_MODALS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = { ...newState.listsScreen.generalTab };
            newState.listsScreen.generalTab[action.modalName + 'DisplayModal'] = action.displayModal;
            return newState;
            break;
        /* GENERAL TAB :: STREET */
        case SystemActions.ActionTypes.LISTS.LOAD_STREETS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var streetInEditMode = {...newState.listsScreen.generalTab.streetInEditMode};
            streetInEditMode.city_id = action.id;
            newState.listsScreen.generalTab.streetInEditMode = streetInEditMode;
            newState.listsScreen.generalTab.streetSearchValue = '';
            newState.listsScreen.generalTab.streetCityKey = action.key;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_STREETS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.streets = action.streets;
            newState.listsScreen.generalTab.streetKeyInSelectMode = null;
            newState.listsScreen.generalTab.isStreetInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.isStreetInAddMode = false;
            newState.listsScreen.generalTab.showStreetModalDialog = false;
            newState.listsScreen.generalTab.streetSearchValue = '';
            newState.listsScreen.generalTab.isStreetsOrderedAsc = !newState.listsScreen.generalTab.isStreetsOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_STREETS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var streets = [...newState.lists.streets];
            newState.listsScreen.generalTab.streetOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.generalTab.isStreetsOrderedAsc ? 'asc' : 'desc';
            streets.sort(arraySort(sortDirection, newState.listsScreen.generalTab.streetOrderColumn));
            newState.lists.streets = streets;
            newState.listsScreen.generalTab.isStreetsOrderedAsc = !newState.listsScreen.generalTab.isStreetsOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_STREET_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var streetInEditMode = {...newState.listsScreen.generalTab.streetInEditMode};
            streetInEditMode.name = action.value;
            newState.listsScreen.generalTab.streetInEditMode = streetInEditMode;
            newState.listsScreen.generalTab.streetSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_STREET_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showStreetModalDialog = !newState.listsScreen.generalTab.showStreetModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.STREET_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.streetKeyInSelectMode = action.streetkey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ADD_STREET_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.isStreetInAddMode = ('add' == action.event) ? true : false;
            newState.listsScreen.dirty = ('add' == action.event) ? true : false;
            if ('add' == action.event) {
                newState.listsScreen.generalTab.streetSearchValue = '';
            } else {
                newState.listsScreen.generalTab.streetInEditMode = { name: '', city_id: -1, mi_id: ''};
            }
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.STREET_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var streetInEditMode = {...newState.listsScreen.generalTab.streetInEditMode};
            var emptyStreet = { name: '', city_id: -1, mi_id: ''};
            var streetInEditMode = (undefined != action.street) ? action.street : emptyStreet;
            streetInEditMode.mi_id = (null != streetInEditMode.mi_id) ? streetInEditMode.mi_id : '';
            newState.listsScreen.generalTab.streetInEditMode = streetInEditMode;
            newState.listsScreen.generalTab.streetKeyInSelectMode = (undefined != action.street) ? action.street.key : null;
            newState.listsScreen.generalTab.isStreetInEditMode = (undefined != action.street) ? true : false;
            newState.listsScreen.dirty = (undefined != action.street) ? true : false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.STREET_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var streetInEditMode = {...newState.listsScreen.generalTab.streetInEditMode};
            streetInEditMode[action.key] = action.value;
            newState.listsScreen.generalTab.streetInEditMode = streetInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.STREET_MIID_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var generalTab = {...newState.listsScreen.generalTab};
            var isValid = generalTab.streetInEditMode.mi_id ? true : false;
            newState.lists.streets.map(function (street) {
                if ((street.key !== generalTab.streetKeyInSelectMode)
                    && (street.mi_id === parseInt(generalTab.streetInEditMode.mi_id))) {
                    isValid = false;
                    return;
                }
            });
            newState.listsScreen.generalTab.isStreetMiIDValid = isValid;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.RESET_STREETS_LIST:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.streets = [];
            newState.listsScreen.generalTab.streetKeyInSelectMode = null;
            newState.listsScreen.generalTab.isStreetInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showStreetModalDialog = false;
            newState.listsScreen.generalTab.streetSearchValue = '';
            return newState;
            break;
        /* LISTS :: PHONE TYPES */
        case SystemActions.ActionTypes.LISTS.LOADED_PHONE_TYPES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists.phoneTypes = action.types;
            newState.listsScreen.generalTab.phoneTypeKeyInSelectMode = null;
            newState.listsScreen.generalTab.isPhoneTypeInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showPhoneTypeModalDialog = false;
            newState.listsScreen.generalTab.phoneTypeTextBeingEdited = '';
            newState.listsScreen.generalTab.phoneTypeSearchValue = '';
            newState.listsScreen.generalTab.isPhoneTypeOrderedAsc = !newState.listsScreen.generalTab.isPhoneTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_PHONE_TYPES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var phoneType = [...newState.lists.phoneTypes];
            var sortDirection = newState.listsScreen.generalTab.isPhoneTypeOrderedAsc ? 'asc' : 'desc';
            phoneType.sort(arraySort(sortDirection, 'name'));
            newState.lists.phoneTypes = phoneType;
            newState.listsScreen.generalTab.isPhoneTypeOrderedAsc = !newState.listsScreen.generalTab.isPhoneTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_PHONE_TYPE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.phoneTypeSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_PHONE_TYPE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showPhoneTypeModalDialog = !newState.listsScreen.generalTab.showPhoneTypeModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.PHONE_TYPE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.phoneTypeKeyInSelectMode = action.phoneTypekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.PHONE_TYPE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.phoneTypeKeyInSelectMode = action.phoneTypekey || null;
            newState.listsScreen.generalTab.isPhoneTypeInEditMode = (undefined != action.phoneTypekey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.phoneTypekey) ? true : false;
            newState.listsScreen.generalTab.phoneTypeTextBeingEdited = action.phoneTypeName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.PHONE_TYPE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.phoneTypeTextBeingEdited = action.phoneTypeName;
            return newState;
            break;
        /* LISTS :: VOTER TITLES */
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_TITLE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.voterTitle = action.titles;
            newState.listsScreen.voterTab.voterTitleKeyInSelectMode = null;
            newState.listsScreen.voterTab.isVoterTitleInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterTitleModalDialog = false;
            newState.listsScreen.voterTab.voterTitleTextBeingEdited = '';
            newState.listsScreen.voterTab.voterTitleSearchValue = '';
            newState.listsScreen.voterTab.isVoterTitleOrderedAsc = !newState.listsScreen.voterTab.isVoterTitleOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_TITLE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterTitle = [...newState.lists.voterTitle];
            var sortDirection = newState.listsScreen.voterTab.isVoterTitleOrderedAsc ? 'asc' : 'desc';
            voterTitle.sort(arraySort(sortDirection, 'name'));
            newState.lists.voterTitle = voterTitle;
            newState.listsScreen.voterTab.isVoterTitleOrderedAsc = !newState.listsScreen.voterTab.isVoterTitleOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_TITLE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterTitleSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_TITLE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterTitleModalDialog = !newState.listsScreen.voterTab.showVoterTitleModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_TITLE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterTitleKeyInSelectMode = action.voterTitlekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_TITLE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterTitleKeyInSelectMode = action.voterTitlekey || null;
            newState.listsScreen.voterTab.isVoterTitleInEditMode = (undefined != action.voterTitlekey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.voterTitlekey) ? true : false;
            newState.listsScreen.voterTab.voterTitleTextBeingEdited = action.voterTitleName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_TITLE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterTitleTextBeingEdited = action.voterTitleName;
            return newState;
            break;
        /* LISTS :: VOTER ENDINGS */
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_ENDING:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists.voterEnding = action.endings;
            newState.listsScreen.voterTab.voterEndingKeyInSelectMode = null;
            newState.listsScreen.voterTab.isVoterEndingInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterEndingModalDialog = false;
            newState.listsScreen.voterTab.voterEndingTextBeingEdited = '';
            newState.listsScreen.voterTab.voterEndingSearchValue = '';
            newState.listsScreen.voterTab.isVoterEndingOrderedAsc = !newState.listsScreen.voterTab.isVoterEndingOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_ENDING:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterEnding = [...newState.lists.voterEnding];
            var sortDirection = newState.listsScreen.voterTab.isVoterEndingOrderedAsc ? 'asc' : 'desc';
            voterEnding.sort(arraySort(sortDirection, 'name'));
            newState.lists.voterEnding = voterEnding;
            newState.listsScreen.voterTab.isVoterEndingOrderedAsc = !newState.listsScreen.voterTab.isVoterEndingOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ENDING_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterEndingSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ENDING_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterEndingModalDialog = !newState.listsScreen.voterTab.showVoterEndingModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ENDING_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterEndingKeyInSelectMode = action.voterEndingkey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ENDING_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterEndingKeyInSelectMode = action.voterEndingkey || null;
            newState.listsScreen.voterTab.isVoterEndingInEditMode = (undefined != action.voterEndingkey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.voterEndingkey) ? true : false;
            newState.listsScreen.voterTab.voterEndingTextBeingEdited = action.voterEndingName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ENDING_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterEndingTextBeingEdited = action.voterEndingName;
            return newState;
            break;
            /* LISTS :: CSV_SOURCES */
        case SystemActions.ActionTypes.LISTS.LOADED_CSV_SOURCE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists.csvSource = action.sources;
            newState.listsScreen.voterTab.csvSourceKeyInSelectMode = null;
            newState.listsScreen.voterTab.isCsvSourceInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showCsvSourceModalDialog = false;
            newState.listsScreen.voterTab.csvSourceTextBeingEdited = '';
            newState.listsScreen.voterTab.csvSourceSearchValue = '';
            newState.listsScreen.voterTab.isCsvSourceOrderedAsc = !newState.listsScreen.voterTab.isCsvSourceOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_CSV_SOURCE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var csvSource = [...newState.lists.csvSource];
            var sortDirection = newState.listsScreen.voterTab.isCsvSourceOrderedAsc ? 'asc' : 'desc';
            csvSource.sort(arraySort(sortDirection, 'name'));
            newState.lists.csvSource = csvSource;
            newState.listsScreen.voterTab.isCsvSourceOrderedAsc = !newState.listsScreen.voterTab.isCsvSourceOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_CSV_SOURCE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.csvSourceSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CSV_SOURCE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showCsvSourceModalDialog = !newState.listsScreen.voterTab.showCsvSourceModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CSV_SOURCE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.csvSourceKeyInSelectMode = action.csvSourcekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CSV_SOURCE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.csvSourceKeyInSelectMode = action.csvSourcekey || null;
            newState.listsScreen.voterTab.isCsvSourceInEditMode = (undefined != action.csvSourcekey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.csvSourcekey) ? true : false;
            newState.listsScreen.voterTab.csvSourceTextBeingEdited = action.csvSourceName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CSV_SOURCE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.csvSourceTextBeingEdited = action.csvSourceName;
            return newState;
            break;
        /* VOTER TAB :: SUPPORT STATUS */
        case SystemActions.ActionTypes.LISTS.LOADED_SUPPORT_STATUS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            action.endings.sort(arraySort('asc', 'level'));
            newState.lists.supportStatus = action.endings;
            newState.listsScreen.voterTab.supportStatusKeyInSelectMode = null;
            newState.listsScreen.voterTab.isSupportStatusInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showSupportStatusModalDialog = false;
            newState.listsScreen.voterTab.issupportStatusInDnDSort = false;
            newState.listsScreen.voterTab.supportStatusTextBeingEdited = '';
            newState.listsScreen.voterTab.supportStatusSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_SUPPORT_STATUS_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.supportStatusSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SUPPORT_STATUS_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showSupportStatusModalDialog = !newState.listsScreen.voterTab.showSupportStatusModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.supportStatusKeyInSelectMode = action.supportStatuskey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.supportStatusKeyInSelectMode = action.supportStatuskey || null;
            newState.listsScreen.voterTab.isSupportStatusInEditMode = (undefined != action.supportStatuskey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.supportStatuskey) ? true : false;
            newState.listsScreen.voterTab.supportStatusTextBeingEdited = action.supportStatusName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.SUPPORT_STATUS_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.supportStatusTextBeingEdited = action.supportStatusName;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS_MODE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.dndSortTemp = {...newState.listsScreen.voterTab.dndSortTemp};
            newState.listsScreen.voterTab.issupportStatusInDnDSort = true;
            newState.listsScreen.voterTab.dndSortTemp.supportStatus = newState.lists.supportStatus;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            var statusList = [...newState.lists.supportStatus];
            var extractedItem = null;
            for (var i = 0; i < statusList.length; i++) {
                if (statusList[i].key == action.fromItem.key) {
                    extractedItem = (statusList.splice(i, 1))[0];
                    break;
                }
            }

            for (i = 0; i < statusList.length; i++) {
                if (statusList[i].key == action.toItem.key) {
                    if (action.before)
                        statusList.splice(i, 0, extractedItem);
                    else
                        statusList.splice(i + 1, 0, extractedItem);
                    break;
                }
            }
            newState.lists.supportStatus = statusList;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.DND_SORT_SUPPORT_STATUS_DROP:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var statusList = [...newState.lists.supportStatus];
            for (i = 0; i < statusList.length; i++) {
                statusList[i].level = i + 1;
            }
            newState.lists.supportStatus = statusList;
            newState.listsScreen.voterTab.dndSortTemp.supportStatus = statusList;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.DND_SUPPORT_STATUS_REVERT_TO_ORIGINAL:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};

            if (newState.listsScreen.voterTab.dndSortTemp.supportStatus.length > 0) {
                newState.lists.supportStatus = newState.listsScreen.voterTab.dndSortTemp.supportStatus;
            }

            return newState;
            break;
        /* LISTS :: VOTER ACTION TYPES */
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_ACTION_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.voterActionTypes = action.types;
            newState.listsScreen.voterTab.voterActionTypeKeyInSelectMode = null;
            newState.listsScreen.voterTab.isVoterActionTypeInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterActionTypeModalDialog = false;
            newState.listsScreen.voterTab.isVoterActionTypeTopicsDisplayed = false;
            newState.listsScreen.voterTab.voterActionTypeTextBeingEdited = '';
            newState.listsScreen.voterTab.voterActionTypeSearchValue = '';
            newState.listsScreen.voterTab.isVoterActionTypeOrderedAsc = !newState.listsScreen.voterTab.isVoterActionTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_ACTION_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterActionType = [...newState.lists.voterActionTypes];
            var sortDirection = newState.listsScreen.voterTab.isVoterActionTypeOrderedAsc ? 'asc' : 'desc';
            voterActionType.sort(arraySort(sortDirection, 'name'));
            newState.lists.voterActionTypes = voterActionType;
            newState.listsScreen.voterTab.isVoterActionTypeOrderedAsc = !newState.listsScreen.voterTab.isVoterActionTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ACTION_TYPE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterActionTypeSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ACTION_TYPE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterActionTypeModalDialog = !newState.listsScreen.voterTab.showVoterActionTypeModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterActionTypeKeyInSelectMode = action.voterActionTypekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterActionTypeKeyInSelectMode = action.voterActionTypekey || null;
            newState.listsScreen.voterTab.isVoterActionTypeInEditMode = undefined != action.voterActionTypekey ? true : false;
            newState.listsScreen.dirty = undefined != action.voterActionTypekey ? true : false;
            newState.listsScreen.voterTab.voterActionTypeTextBeingEdited = action.voterActionTypeName || '';
            newState.listsScreen.voterTab.isVoterActionTypeTopicsDisplayed = false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ACTION_TYPE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterActionTypeTextBeingEdited = action.voterActionTypeName;
            return newState;
            break;
        /* LISTS :: VOTER ACTION TOPICS */
        case SystemActions.ActionTypes.LISTS.LOAD_VOTER_ACTION_TYPE_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var typeTopicInEditedMode = {...newState.listsScreen.voterTab.voterActionTopicInEditMode};
            typeTopicInEditedMode.actionTypeId = action.id;
            newState.listsScreen.voterTab.voterActionTopicInEditMode = typeTopicInEditedMode;
            newState.listsScreen.voterTab.voterActionTypeKeyInSelectMode = action.key;
            newState.listsScreen.voterTab.voterActionTypeNameInSelectMode = action.name;
            newState.listsScreen.voterTab.isVoterActionTypeTopicsDisplayed = true;
            newState.listsScreen.voterTab.voterActionTopicSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_ACTION_TOPIC:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.voterActionTopics = action.topics;
            newState.listsScreen.voterTab.voterActionTopicKeyInSelectMode = null;
            newState.listsScreen.voterTab.isVoterActionTopicInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterActionTopicModalDialog = false;
            newState.listsScreen.voterTab.voterActionTopicSearchValue = '';
            newState.listsScreen.voterTab.isVoterActionTopicOrderedAsc = !newState.listsScreen.voterTab.isVoterActionTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_ACTION_TOPIC:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterActionTopic = [...newState.lists.voterActionTopics];
            newState.listsScreen.voterTab.voterActionTopicOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isVoterActionTopicOrderedAsc ? 'asc' : 'desc';
            voterActionTopic.sort(arraySort(sortDirection, newState.listsScreen.voterTab.voterActionTopicOrderColumn));
            newState.lists.voterActionTopics = voterActionTopic;
            newState.listsScreen.voterTab.isVoterActionTopicOrderedAsc = !newState.listsScreen.voterTab.isVoterActionTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ACTION_TOPIC_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var typeTopicInEditedMode = {...newState.listsScreen.voterTab.voterActionTopicInEditMode};
            typeTopicInEditedMode.name = action.value;
            newState.listsScreen.voterTab.voterActionTopicInEditMode = typeTopicInEditedMode;
            newState.listsScreen.voterTab.voterActionTopicSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ACTION_TOPIC_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterActionTopicModalDialog = !newState.listsScreen.voterTab.showVoterActionTopicModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterActionTopicKeyInSelectMode = action.voterActionTopickey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterActionTopicKeyInSelectMode = (undefined != action.item ? action.item.key : null);
            newState.listsScreen.voterTab.isVoterActionTopicInEditMode = (undefined != action.item ? true : false);
            newState.listsScreen.dirty = (undefined != action.item ? true : false);
            let emptyVoterActionTopicInEditMode = {
                name: '',
                active: 1,
                actionTypeId: -1
           };
            let voterActionTopicInEditMode = (undefined != action.item) ? action.item : emptyVoterActionTopicInEditMode;
            newState.listsScreen.voterTab.voterActionTopicInEditMode={...newState.listsScreen.voterTab.voterActionTopicInEditMode}; 
            newState.listsScreen.voterTab.voterActionTopicInEditMode = voterActionTopicInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ACTION_TOPIC_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var voterActionTopicInEditMode = {...newState.listsScreen.voterTab.voterActionTopicInEditMode};
            voterActionTopicInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.voterActionTopicInEditMode = voterActionTopicInEditMode;
            return newState;
            break;
        /* LISTS :: VOTER META KEYS */
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_META_KEY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.listsScreen.voterTab.voterMetaKeyInEditMode = {...newState.listsScreen.voterTab.voterMetaKeyInEditMode};
            newState.lists.voterMetaKeys = action.keys;
            newState.listsScreen.voterTab.voterMetaKeyInSelectMode = null;
            newState.listsScreen.voterTab.voterMetaKeyTypeInSelectMode = null;
            newState.listsScreen.voterTab.isVoterMetaKeyInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterMetaKeyModalDialog = false;
            newState.listsScreen.voterTab.isVoterMetaKeyValuesDisplayed = false;
            newState.listsScreen.voterTab.voterMetaKeyInEditMode = {
                key_name: '',
                key_type: 0,
                per_campaign: 0,
           };
            newState.listsScreen.voterTab.voterMetaKeySearchValue = '';
            newState.listsScreen.voterTab.isVoterMetaKeyOrderedAsc = !newState.listsScreen.voterTab.isVoterMetaKeyOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_META_KEY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterMetaKey = [...newState.lists.voterMetaKeys];
            newState.listsScreen.voterTab.voterMetaKeyOrderColumn = action.orderColumn || 'key_name';
            var sortDirection = newState.listsScreen.voterTab.isVoterMetaKeyOrderedAsc ? 'asc' : 'desc';
            voterMetaKey.sort(arraySort(sortDirection, newState.listsScreen.voterTab.voterMetaKeyOrderColumn));
            newState.lists.voterMetaKeys = voterMetaKey;
            newState.listsScreen.voterTab.isVoterMetaKeyOrderedAsc = !newState.listsScreen.voterTab.isVoterMetaKeyOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_META_KEY_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterMetaKeySearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_META_KEY_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterMetaKeyModalDialog = !newState.listsScreen.voterTab.showVoterMetaKeyModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_META_KEY_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterMetaKeyInSelectMode = action.voterMetaKey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_META_KEY_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterMetaKeyInSelectMode = undefined != action.item ? action.item.key : null;
            newState.listsScreen.voterTab.isVoterMetaKeyInEditMode = undefined != action.item ? true : false;
            newState.listsScreen.dirty = undefined != action.item ? true : false;
            newState.listsScreen.voterTab.isVoterMetaKeyValuesDisplayed = false;
            let emptyVoterMetaKeyInEditMode = {
                key_name: '',
                key_type: 0,
                per_campaign: 0,
           };
            let voterMetaKeyInEditMode = (undefined != action.item) ? action.item : emptyVoterMetaKeyInEditMode;
            newState.listsScreen.voterTab.voterMetaKeyInEditMode = voterMetaKeyInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_META_KEY_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var voterMetaKeyInEditMode = {...newState.listsScreen.voterTab.voterMetaKeyInEditMode};
            voterMetaKeyInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.voterMetaKeyInEditMode = voterMetaKeyInEditMode;
            return newState;
            break;
        /* LISTS :: VOTER ACTION VALUES */
        case SystemActions.ActionTypes.LISTS.LOAD_VOTER_META_KEY_VALUES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var item = { value: '', voterMetaKeyId: action.id};
            newState.listsScreen.voterTab.voterMetaValueInEditMode = item;
            newState.listsScreen.voterTab.voterMetaKeyInSelectMode = action.key;
            newState.listsScreen.voterTab.voterMetaKeyNameInSelectMode = action.name;
            newState.listsScreen.voterTab.voterMetaKeyTypeInSelectMode = action.keyType;
            newState.listsScreen.voterTab.isVoterMetaKeyValuesDisplayed = true;
            newState.listsScreen.voterTab.voterMetaValueSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_META_VALUES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists.voterMetaValues = action.values;
            newState.listsScreen.voterTab.voterMetaValueKeyInSelectMode = null;
            newState.listsScreen.voterTab.isVoterMetaValueInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterMetaValueModalDialog = false;
            newState.listsScreen.voterTab.voterMetaValueSearchValue = '';
            newState.listsScreen.voterTab.isVoterMetaValueOrderedAsc = !newState.listsScreen.voterTab.isVoterMetaValueOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_META_VALUES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterMetaValue = [...newState.lists.voterMetaValues];
            var sortDirection = newState.listsScreen.voterTab.isVoterMetaValueOrderedAsc ? 'asc' : 'desc';
            voterMetaValue.sort(arraySort(sortDirection, 'value'));
            newState.lists.voterMetaValues = voterMetaValue;
            newState.listsScreen.voterTab.isVoterMetaValueOrderedAsc = !newState.listsScreen.voterTab.isVoterMetaValueOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_META_VALUE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterMetaValueSearchValue = action.value;
            newState.listsScreen.voterTab.voterMetaValueInEditMode.value = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_META_VALUE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterMetaValueModalDialog = !newState.listsScreen.voterTab.showVoterMetaValueModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterMetaValueKeyInSelectMode = action.voterMetaValuekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.isVoterMetaValueInEditMode = (undefined != action.item ? true : false);
            newState.listsScreen.dirty = (undefined != action.item ? true : false);
            newState.listsScreen.voterTab.voterMetaValueKeyInSelectMode = (undefined != action.item ? action.item.key : null);
            var emptyVoterMetaValueInEditMode = { value: '', voterMetaKeyId: -1};
            newState.listsScreen.voterTab.voterMetaValueInEditMode = {...newState.listsScreen.voterTab.voterMetaValueInEditMode};
            newState.listsScreen.voterTab.voterMetaValueInEditMode = (undefined != action.item) ? action.item : emptyVoterMetaValueInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_META_VALUE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var voterMetaValueInEditMode = {...newState.listsScreen.voterTab.voterMetaValueInEditMode};
            voterMetaValueInEditMode.value = action.value;
            newState.listsScreen.voterTab.voterMetaValueInEditMode = voterMetaValueInEditMode;
            return newState;
            break;
        /* LISTS :: INSTITUTE  */
        case SystemActions.ActionTypes.LISTS.LOADED_INSTITUTE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.institutes = action.data;
            newState.listsScreen.voterTab.instituteInSelectMode = null;
            newState.listsScreen.voterTab.isInstituteInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showInstituteModalDialog = false;
            //            newState.listsScreen.voterTab.instituteInEditMode = {name: '', group: '', type: '', network: '', city: ''};
            newState.listsScreen.voterTab.instituteSearchValue = '';
            newState.listsScreen.voterTab.isInstituteOrderedAsc = !newState.listsScreen.voterTab.isInstituteOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var institutes = [...newState.lists.institutes];
            newState.listsScreen.voterTab.instituteOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isInstituteOrderedAsc ? 'asc' : 'desc';
            institutes.sort(arraySort(sortDirection, newState.listsScreen.voterTab.instituteOrderColumn));
            newState.lists.institutes = institutes;
            newState.listsScreen.voterTab.isInstituteOrderedAsc = !newState.listsScreen.voterTab.isInstituteOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showInstituteModalDialog = !newState.listsScreen.voterTab.showInstituteModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteInSelectMode = action.institute;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteInSelectMode = undefined != action.item ? action.item.key : null;
            newState.listsScreen.voterTab.isInstituteInEditMode = undefined != action.item ? true : false;
            newState.listsScreen.dirty = undefined != action.item ? true : false;
            let instituteInEditMode = (undefined != action.item) ? action.item : { name: '', group: '', type: '', network: '', city: '',
                                                                                    group_key: '', type_key: '', network_key: '', city_key: ''};
            newState.listsScreen.voterTab.instituteInEditMode={...newState.listsScreen.voterTab.instituteInEditMode};
            newState.listsScreen.voterTab.instituteInEditMode = instituteInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteInEditMode = {...newState.listsScreen.voterTab.instituteInEditMode};
            instituteInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.instituteInEditMode = instituteInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_ADD_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteInEditMode = {...newState.listsScreen.voterTab.instituteInEditMode};
            var instituteInEditMode = {...newState.listsScreen.voterTab.instituteInEditMode};
            newState.listsScreen.voterTab.isInstituteInAddMode = ('add' == action.event) ? true : false;
            newState.listsScreen.dirty = ('add' == action.event) ? true : false;
            if ('add' == action.event) {
                instituteInEditMode = {
                    name: newState.listsScreen.voterTab.instituteSearchValue,
                    group: '',
                    type: '',
                    city: '',
                    network: ''
                };
                newState.listsScreen.voterTab.instituteSearchValue = '';
            } else {
                instituteInEditMode = { name: '', group: '', type: '', network: '', city: ''};
            }

            newState.listsScreen.voterTab.instituteInEditMode = instituteInEditMode;
            return newState;
            break;
        /* LISTS :: INSTITUTE GROUP */
        case SystemActions.ActionTypes.LISTS.LOADED_INSTITUTE_GROUP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.instituteGroups = action.keys;
            newState.listsScreen.voterTab.instituteGroupInSelectMode = null;
            newState.listsScreen.voterTab.isInstituteGroupInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showInstituteGroupModalDialog = false;
            newState.listsScreen.voterTab.isInstituteGroupValuesDisplayed = false;
            newState.listsScreen.voterTab.instituteGroupInEditMode = '';
            newState.listsScreen.voterTab.instituteGroupSearchValue = '';
            newState.listsScreen.voterTab.isInstituteGroupOrderedAsc = !newState.listsScreen.voterTab.isInstituteGroupOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_GROUP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var instituteGroup = [...newState.lists.instituteGroups];
            newState.listsScreen.voterTab.instituteGroupOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isInstituteGroupOrderedAsc ? 'asc' : 'desc';
            instituteGroup.sort(arraySort(sortDirection, newState.listsScreen.voterTab.instituteGroupOrderColumn));
            newState.lists.instituteGroups = instituteGroup;
            newState.listsScreen.voterTab.isInstituteGroupOrderedAsc = !newState.listsScreen.voterTab.isInstituteGroupOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_GROUP_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteGroupSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_GROUP_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showInstituteGroupModalDialog = !newState.listsScreen.voterTab.showInstituteGroupModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteGroupInSelectMode = action.instituteGroup;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteGroupInSelectMode = undefined != action.item ? action.item.key : null;
            newState.listsScreen.voterTab.isInstituteGroupInEditMode = undefined != action.item ? true : false;
            newState.listsScreen.dirty = undefined != action.item ? true : false;
            newState.listsScreen.voterTab.isInstituteGroupValuesDisplayed = false;
            let instituteGroupInEditMode = (undefined != action.item) ? action.item : '';
            newState.listsScreen.voterTab.instituteGroupInEditMode = instituteGroupInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_GROUP_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteGroupInEditMode = {...newState.listsScreen.voterTab.instituteGroupInEditMode};
            instituteGroupInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.instituteGroupInEditMode = instituteGroupInEditMode;
            return newState;
            break;
        /* LISTS :: INSTITUTE TYPE */
        case SystemActions.ActionTypes.LISTS.LOAD_INSTITUTE_GROUP_VALUES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteTypeInEditMode = {...newState.listsScreen.voterTab.instituteTypeInEditMode};
            var item = { name: '', instituteGroupId: action.id};
            newState.listsScreen.voterTab.instituteTypeInEditMode = item;
            newState.listsScreen.voterTab.instituteGroupInSelectMode = action.key;
            newState.listsScreen.voterTab.instituteGroupNameInSelectMode = action.name;
            newState.listsScreen.voterTab.isInstituteGroupValuesDisplayed = true;
            newState.listsScreen.voterTab.instituteTypeSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_ALL_INSTITUTE_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.allInstituteTypes = action.values;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_INSTITUTE_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.instituteTypes = action.values;
            newState.listsScreen.voterTab.instituteTypeKeyInSelectMode = null;
            newState.listsScreen.voterTab.isInstituteTypeInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showInstituteTypeModalDialog = false;
            newState.listsScreen.voterTab.instituteTypeSearchValue = '';
            newState.listsScreen.voterTab.isInstituteTypeOrderedAsc = !newState.listsScreen.voterTab.isInstituteTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var instituteType = [...newState.lists.instituteTypes];
            var sortDirection = newState.listsScreen.voterTab.isInstituteTypeOrderedAsc ? 'asc' : 'desc';
            instituteType.sort(arraySort(sortDirection, 'name'));
            newState.lists.instituteTypes = instituteType;
            newState.listsScreen.voterTab.isInstituteTypeOrderedAsc = !newState.listsScreen.voterTab.isInstituteTypeOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_TYPE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteTypeSearchValue = action.value;
            newState.listsScreen.voterTab.instituteTypeInEditMode.name = action.value;
            return newState;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_TYPE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showInstituteTypeModalDialog = !newState.listsScreen.voterTab.showInstituteTypeModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_TYPE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteTypeKeyInSelectMode = action.instituteTypekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_TYPE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteTypeInEditMode = {...newState.listsScreen.voterTab.instituteTypeInEditMode};
            newState.listsScreen.voterTab.isInstituteTypeInEditMode = (undefined != action.item ? true : false);
            newState.listsScreen.dirty = (undefined != action.item ? true : false);
            newState.listsScreen.voterTab.instituteTypeKeyInSelectMode = (undefined != action.item ? action.item.key : null);
            var emptyInstituteTypeInEditMode = { name: '', instituteGroupId: -1};
            newState.listsScreen.voterTab.instituteTypeInEditMode = (undefined != action.item) ? action.item : emptyInstituteTypeInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_TYPE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteTypeInEditMode = {...newState.listsScreen.voterTab.instituteTypeInEditMode};
            instituteTypeInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.instituteTypeInEditMode = instituteTypeInEditMode;
            return newState;
            break;
        /* LISTS :: INSTITUTE NETWORK */
        case SystemActions.ActionTypes.LISTS.LOADED_INSTITUTE_NETWORK:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.instituteNetworks = action.keys;
            newState.listsScreen.voterTab.instituteNetworkInSelectMode = null;
            newState.listsScreen.voterTab.isInstituteNetworkInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showInstituteNetworkModalDialog = false;
            newState.listsScreen.voterTab.isInstituteNetworkValuesDisplayed = false;
            newState.listsScreen.voterTab.instituteNetworkInEditMode = '';
            newState.listsScreen.voterTab.instituteNetworkSearchValue = '';
            newState.listsScreen.voterTab.isInstituteNetworkOrderedAsc = !newState.listsScreen.voterTab.isInstituteNetworkOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_NETWORK:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var instituteNetwork = [...newState.lists.instituteNetworks];
            newState.listsScreen.voterTab.instituteNetworkOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isInstituteNetworkOrderedAsc ? 'asc' : 'desc';
            instituteNetwork.sort(arraySort(sortDirection, newState.listsScreen.voterTab.instituteNetworkOrderColumn));
            newState.lists.instituteNetworks = instituteNetwork;
            newState.listsScreen.voterTab.isInstituteNetworkOrderedAsc = !newState.listsScreen.voterTab.isInstituteNetworkOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_NETWORK_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteNetworkSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_NETWORK_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showInstituteNetworkModalDialog = !newState.listsScreen.voterTab.showInstituteNetworkModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteNetworkInSelectMode = action.instituteNetwork;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteNetworkInSelectMode = undefined != action.item ? action.item.key : null;
            newState.listsScreen.voterTab.isInstituteNetworkInEditMode = undefined != action.item ? true : false;
            newState.listsScreen.dirty = undefined != action.item ? true : false;
            newState.listsScreen.voterTab.isInstituteNetworkValuesDisplayed = false;
            let instituteNetworkInEditMode = (undefined != action.item) ? action.item : '';
            newState.listsScreen.voterTab.instituteNetworkInEditMode = instituteNetworkInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_NETWORK_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteNetworkInEditMode = {...newState.listsScreen.voterTab.instituteNetworkInEditMode};
            instituteNetworkInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.instituteNetworkInEditMode = instituteNetworkInEditMode;
            return newState;
            break;
        /* VOTER TAB :: INSTITUTE_ROLE */
        case SystemActions.ActionTypes.LISTS.LOAD_INSTITUTE_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteRoleInEditMode = {...newState.listsScreen.voterTab.instituteRoleInEditMode};
            instituteRoleInEditMode.instituteTypeId = action.id;
            newState.listsScreen.voterTab.instituteRoleInEditMode = instituteRoleInEditMode;
            newState.listsScreen.voterTab.instituteRoleSearchValue = '';
            newState.listsScreen.voterTab.instituteRoleTypeKey = action.key;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LOADED_INSTITUTE_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.instituteRoles = action.list;
            newState.listsScreen.voterTab.instituteRoleKeyInSelectMode = null;
            newState.listsScreen.voterTab.isInstituteRoleInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showInstituteRoleModalDialog = false;
            newState.listsScreen.voterTab.instituteRoleSearchValue = '';
            newState.listsScreen.voterTab.isInstituteRolesOrderedAsc = !newState.listsScreen.voterTab.isInstituteRolesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var instituteRoles = [...newState.lists.instituteRoles];
            var sortDirection = newState.listsScreen.voterTab.isInstituteRolesOrderedAsc ? 'asc' : 'desc';
            instituteRoles.sort(arraySort(sortDirection, 'name'));
            newState.lists.instituteRoles = instituteRoles;
            newState.listsScreen.voterTab.isInstituteRolesOrderedAsc = !newState.listsScreen.voterTab.isInstituteRolesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_ROLE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteRoleInEditMode = {...newState.listsScreen.voterTab.instituteRoleInEditMode};
            instituteRoleInEditMode.name = action.value;
            newState.listsScreen.voterTab.instituteRoleInEditMode = instituteRoleInEditMode;
            newState.listsScreen.voterTab.instituteRoleSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_ROLE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showInstituteRoleModalDialog = !newState.listsScreen.voterTab.showInstituteRoleModalDialog;
            return newState;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.instituteRoleKeyInSelectMode = action.instituteRolekey;
            return newState;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteRoleInEditMode = {...newState.listsScreen.voterTab.instituteRoleInEditMode};
            var emptyInstituteRole = { name: '', instituteTypeId: -1};
            newState.listsScreen.voterTab.instituteRoleInEditMode = (undefined != action.instituteRole) ? action.instituteRole : emptyInstituteRole;
            newState.listsScreen.voterTab.instituteRoleKeyInSelectMode = (undefined != action.instituteRole) ? action.instituteRole.key : null;
            newState.listsScreen.voterTab.isInstituteRoleInEditMode = (undefined != action.instituteRole) ? true : false;
            newState.listsScreen.dirty = (undefined != action.instituteRole) ? true : false;
            return newState;
        case SystemActions.ActionTypes.LISTS.INSTITUTE_ROLE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var instituteRoleInEditMode = {...newState.listsScreen.voterTab.instituteRoleInEditMode};
            instituteRoleInEditMode.name = action.name;
            newState.listsScreen.voterTab.instituteRoleInEditMode = instituteRoleInEditMode;
            return newState;
        /* VOTER TAB :: VOTER_GROUP */
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_GROUP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.listsScreen.voterTab.voterGroupInEditMode = {...newState.listsScreen.voterTab.voterGroupInEditMode};
            newState.lists.voterGroups = action.groups;
            newState.lists.hieraticalVoterGroups = [];
            newState.listsScreen.voterTab.showVoterGroupModalDialog = false;
            newState.listsScreen.voterTab.isVoterGroupInEditMode = false;
            newState.listsScreen.voterTab.isVoterGroupInDnDSort = false;
            newState.listsScreen.voterTab.isVoterGroupInAddMode = false;
            newState.listsScreen.voterTab.voterGroupKeyInSelectMode = null;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.voterGroupInEditMode = { name: '', parentId: -1};
            return newState;
			 
        case SystemActions.ActionTypes.LISTS.GENERATE_HIERATICAL_VOTER_GROUP:
            var newState = {...state};
            // return newState;
            // break;
            newState.lists = {...newState.lists};
            var groups = _.cloneDeep(action.groups);
	 
            var mainParents = [...newState.lists.mainParentsVoterGroups];
            var groupsHashMap = [];
            var groupsArray = [];
            mainParents = [];
            groups.forEach(function (group) {
                if (group) {
                    groupsHashMap[group.id] =group;
                    group.children = [];
                }
            });
			 
            groups.forEach(function (group) {
                if (group) {
                    if (group.parent_id == 0) {
                        groupsArray.push(group);
                        group.parent = 0;
                        mainParents.push(group);
                        mainParents.sort(arraySort('asc', 'group_order'));
                        groupsArray.sort(arraySort('asc', 'group_order'));
                    } else {
                        var parentId = group.parent_id;

						if(groupsHashMap[parentId]){
							groupsHashMap[parentId].children.push(group);
							group.parent = groupsHashMap[parentId];
							groupsHashMap[parentId].children.sort(arraySort('asc', 'group_order'));
						}
                    }
                }
            });
			 
            newState.lists.mainParentsVoterGroups = mainParents;
            newState.lists.hieraticalVoterGroups = groupsArray;
            newState.lists.voterGroups = groupsHashMap;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_VOTER_GROUP_OPEN_STSTUS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var openVoterGroups = {...newState.listsScreen.voterTab.openVoterGroups};
            if ((openVoterGroups[action.id] == undefined) || (openVoterGroups[action.id] == false))
                openVoterGroups[action.id] = true;
            else
                openVoterGroups[action.id] = false;
            newState.listsScreen.voterTab.openVoterGroups = openVoterGroups;
            return newState;
			
		case SystemActions.ActionTypes.LISTS.EXPAND_OR_SHRINK_ALL:
			var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var openVoterGroups = {...newState.listsScreen.voterTab.openVoterGroups};
			newState.lists = {...newState.lists};
			newState.lists.voterGroups = [...newState.lists.voterGroups];
			for(let i = 0 ; i < newState.lists.voterGroups.length ; i++){
				 if(newState.lists.voterGroups[i]){
					openVoterGroups[newState.lists.voterGroups[i].id] = action.isExpand;
				 }
			}
			newState.listsScreen.voterTab.openVoterGroups = openVoterGroups;
			return newState;
			break;
        case SystemActions.ActionTypes.LISTS.VOTER_GROUP_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterGroupKeyInSelectMode = action.key;
            newState.listsScreen.voterTab.voterGroupNameInSelectMode = action.name;
            return newState;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_GROUP_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterGroupModalDialog = !newState.listsScreen.voterTab.showVoterGroupModalDialog;
            return newState;
        case SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var voterGroup = { name: ((undefined != action.name) ? action.name : ''), parentId: -1};
            newState.listsScreen.voterTab.voterGroupInEditMode = voterGroup;
            newState.listsScreen.voterTab.voterGroupKeyInSelectMode = (undefined != action.key) ? action.key : null;
            newState.listsScreen.voterTab.isVoterGroupInEditMode = (undefined != action.key) ? true : false;
            newState.listsScreen.dirty = (undefined != action.key) ? true : false;
            return newState;
        case SystemActions.ActionTypes.LISTS.VOTER_GROUP_ADD_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var voterGroupInEditMode = {...newState.listsScreen.voterTab.voterGroupInEditMode};
            voterGroupInEditMode.name = '';
            newState.listsScreen.voterTab.voterGroupInEditMode = voterGroupInEditMode;
            newState.listsScreen.voterTab.voterGroupKeyInSelectMode = (undefined != action.key) ? action.key : null;
            newState.listsScreen.voterTab.isVoterGroupInAddMode = (action.show == undefined) ? false : action.show;
            newState.listsScreen.dirty = (undefined != action.key) ? true : false;
            return newState;
        case SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab[action.fieldName] = action.fieldValue;
            return newState;
		case SystemActions.ActionTypes.LISTS.VOTER_GROUP_SET_VARIABLE_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var voterGroupInEditMode = {...newState.listsScreen.voterTab.voterGroupInEditMode};
            voterGroupInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.voterGroupInEditMode = voterGroupInEditMode;
            return newState;
        /* VOTER_GROUP :: DnD functions */
        case SystemActions.ActionTypes.LISTS.DND_SORT_VOTER_GROUP_MODE_STARTED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.dndSortTemp = {...newState.listsScreen.voterTab.dndSortTemp};
            newState.lists = {...newState.lists};
            var voterGroupsList = [...newState.lists.voterGroups];
            newState.listsScreen.voterTab.dndSortTemp.voterGroups = _.cloneDeep([...voterGroupsList]);
            newState.listsScreen.voterTab.isVoterGroupInDnDSort = true;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsSource = null;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsTarget = null;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsPosition = null;
            newState.listsScreen.dirty = true;
            return newState;
        case SystemActions.ActionTypes.LISTS.DND_SORT_VOTER_GROUP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.openVoterGroups = {...newState.listsScreen.voterTab.openVoterGroups};
            newState.listsScreen.voterTab.dndSortTemp = {...newState.listsScreen.voterTab.dndSortTemp};
            newState.lists = {...newState.lists};
            var voterGroups = [...newState.lists.voterGroups];
            if (action.position == 'inside') {
                voterGroups[action.fromItem.id].parent_id = action.toItem.id;
                var groupOrder = 1;
                action.toItem.children.forEach(function (group) {
                    groupOrder = group.group_order;
                });
                voterGroups[action.fromItem.id].group_order = groupOrder;
                var openVoterGroups = {...newState.listsScreen.voterTab.openVoterGroups};
                if ((openVoterGroups[action.toItem.id] == undefined) || (openVoterGroups[action.toItem.id] == false))
                    openVoterGroups[action.toItem.id] = true;
                newState.listsScreen.voterTab.openVoterGroups = openVoterGroups;
            } else {
                var i = 0;
                var children = (action.toItem.parent_id == 0) ? newState.lists.mainParentsVoterGroups : action.toItem.parent.children;
                voterGroups[action.fromItem.id].parent_id = action.toItem.parent_id;
                children.forEach(function (group) {
                    if (group.id == action.toItem.id) {
                        i = group.group_order;
                        if (action.position == 'after') {
                            voterGroups[action.fromItem.id].group_order = ++i;
                        } else {
                            voterGroups[action.fromItem.id].group_order = i;
                        }
                    }

                    //after find the relevant target that we want to move before/after it, update the order of all the items after it.
                    //this will net afect the order of the items that before the source item, only the items after the change efect.
                    //don't update the target item order when we want to move after it.
                    if ((i > 0) && !(group.id == action.toItem.id && action.position == 'after')) {
                        voterGroups[group.id].group_order = ++i;
                    }
                });
            }
            newState.lists.voterGroups = voterGroups;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsSource = action.fromItem.key;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsTarget = action.toItem.key;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsPosition = action.position;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.DND_SORT_VOTER_GROUP_DROP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.dndSortTemp = {...newState.listsScreen.voterTab.dndSortTemp};
            newState.lists = {...newState.lists};
            var voterGroupsList = [...newState.lists.voterGroups];
            newState.listsScreen.voterTab.dndSortTemp.voterGroups = _.cloneDeep([...voterGroupsList]);
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsSource = null;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsTarget = null;
            newState.listsScreen.voterTab.dndSortTemp.lastVoterGroupsPosition = null;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.DND_VOTER_GROUP_REVERT_TO_ORIGINAL:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.listsScreen.voterTab.dndSortTemp = {...newState.listsScreen.voterTab.dndSortTemp};
            if (newState.listsScreen.voterTab.dndSortTemp.voterGroups.length > 0) {
                newState.lists.voterGroups = _.cloneDeep([...newState.listsScreen.voterTab.dndSortTemp.voterGroups]);
            }

            return newState;
            break;
        /* LISTS :: VOTER ELECTION_ROLES */
        case SystemActions.ActionTypes.LISTS.LOADED_VOTER_ELECTION_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.voterElectionRoles = action.roles;
            newState.listsScreen.voterTab.voterElectionRolesKeyInSelectMode = null;
            newState.listsScreen.voterTab.isVoterElectionRolesInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showVoterElectionRolesModalDialog = false;
            newState.listsScreen.voterTab.voterElectionRolesTextBeingEdited = '';
            newState.listsScreen.voterTab.voterElectionRolesSearchValue = '';
            newState.listsScreen.voterTab.isVoterElectionRolesOrderedAsc = !newState.listsScreen.voterTab.isVoterElectionRolesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_VOTER_ELECTION_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var voterElectionRoles = [...newState.lists.voterElectionRoles];
            var sortDirection = newState.listsScreen.voterTab.isVoterElectionRolesOrderedAsc ? 'asc' : 'desc';
            voterElectionRoles.sort(arraySort(sortDirection, 'name'));
            newState.lists.voterElectionRoles = voterElectionRoles;
            newState.listsScreen.voterTab.isVoterElectionRolesOrderedAsc = !newState.listsScreen.voterTab.isVoterElectionRolesOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ELECTION_ROLES_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterElectionRolesSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ELECTION_ROLES_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showVoterElectionRolesModalDialog = !newState.listsScreen.voterTab.showVoterElectionRolesModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterElectionRolesKeyInSelectMode = action.voterElectionRoleskey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterElectionRolesKeyInSelectMode = action.voterElectionRoleskey || null;
            newState.listsScreen.voterTab.isVoterElectionRolesInEditMode = (undefined != action.voterElectionRoleskey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.voterElectionRoleskey) ? true : false;
            newState.listsScreen.voterTab.voterElectionRolesTextBeingEdited = action.voterElectionRolesName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.VOTER_ELECTION_ROLES_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.voterElectionRolesTextBeingEdited = action.voterElectionRolesName;
            return newState;
        /* LISTS :: SHAS REPRESENTATIVE ROLES */
        case SystemActions.ActionTypes.LISTS.LOADED_SHAS_REPRESENTATIVE_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.shasRepresentativeRoles = action.roles;
            newState.listsScreen.voterTab.shasRepresentativeRolesKeyInSelectMode = null;
            newState.listsScreen.voterTab.isShasRepresentativeRolesInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showShasRepresentativeRolesModalDialog = false;
            newState.listsScreen.voterTab.shasRepresentativeRolesTextBeingEdited = '';
            newState.listsScreen.voterTab.shasRepresentativeRolesSearchValue = '';
            newState.listsScreen.voterTab.isShasRepresentativeRolesOrderedAsc = !newState.listsScreen.voterTab.isShasRepresentativeRolesOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.ORDER_SHAS_REPRESENTATIVE_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var shasRepresentativeRoles = [...newState.lists.shasRepresentativeRoles];
            var sortDirection = newState.listsScreen.voterTab.isShasRepresentativeRolesOrderedAsc ? 'asc' : 'desc';
            shasRepresentativeRoles.sort(arraySort(sortDirection, 'name'));
            newState.lists.shasRepresentativeRoles = shasRepresentativeRoles;
            newState.listsScreen.voterTab.isShasRepresentativeRolesOrderedAsc = !newState.listsScreen.voterTab.isShasRepresentativeRolesOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.UPDATE_SHAS_REPRESENTATIVE_ROLES_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.shasRepresentativeRolesSearchValue = action.value;
            return newState;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_SHAS_REPRESENTATIVE_ROLES_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showShasRepresentativeRolesModalDialog = !newState.listsScreen.voterTab.showShasRepresentativeRolesModalDialog;
            return newState;
        case SystemActions.ActionTypes.LISTS.SHAS_REPRESENTATIVE_ROLES_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.shasRepresentativeRolesKeyInSelectMode = action.shasRepresentativeRoleskey;
            return newState;
        case SystemActions.ActionTypes.LISTS.SHAS_REPRESENTATIVE_ROLES_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.shasRepresentativeRolesKeyInSelectMode = action.shasRepresentativeRoleskey || null;
            newState.listsScreen.voterTab.isShasRepresentativeRolesInEditMode = (undefined != action.shasRepresentativeRoleskey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.shasRepresentativeRoleskey) ? true : false;
            newState.listsScreen.voterTab.shasRepresentativeRolesTextBeingEdited = action.shasRepresentativeRolesName || '';
            return newState;
        case SystemActions.ActionTypes.LISTS.SHAS_REPRESENTATIVE_ROLES_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.shasRepresentativeRolesTextBeingEdited = action.shasRepresentativeRolesName;
            return newState;
        /* LISTS :: Religeous Council ROLES */
        case SystemActions.ActionTypes.LISTS.LOADED_RELIGIOUS_COUNCIL_ROLES:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.lists = {...newState.lists};
        newState.lists.religiousCouncilRoles = action.roles;
        newState.listsScreen.voterTab.religiousCouncilKeyInSelectMode = null;
        newState.listsScreen.voterTab.isReligiousCouncilInEditMode = false;
        newState.listsScreen.dirty = false;
        newState.listsScreen.voterTab.showReligiousCouncilModalDialog = false;
        newState.listsScreen.voterTab.religiousCouncilTextBeingEdited = '';
        newState.listsScreen.voterTab.religiousCouncilSearchValue = '';
        newState.listsScreen.voterTab.isReligiousCouncilOrderedAsc = !newState.listsScreen.voterTab.isReligiousCouncilOrderedAsc;
        return newState;
    case SystemActions.ActionTypes.LISTS.ORDER_RELIGIOUS_COUNCIL_ROLES:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.lists = {...newState.lists};
        var religiousCouncil = [...newState.lists.religiousCouncilRoles];
        var sortDirection = newState.listsScreen.voterTab.isReligiousCouncilOrderedAsc ? 'asc' : 'desc';
        religiousCouncil.sort(arraySort(sortDirection, 'name'));
        newState.lists.religiousCouncilRoles = religiousCouncil;
        newState.listsScreen.voterTab.isReligiousCouncilOrderedAsc = !newState.listsScreen.voterTab.isReligiousCouncilOrderedAsc;
        return newState;
    case SystemActions.ActionTypes.LISTS.UPDATE_RELIGIOUS_COUNCIL_ROLES_SEARCH_VALUE:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.religiousCouncilSearchValue = action.value;
        return newState;
    case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_RELIGIOUS_COUNCIL_ROLES_MODAL_DIALOG_DISPLAY:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.showReligiousCouncilModalDialog = !newState.listsScreen.voterTab.showReligiousCouncilModalDialog;
        return newState;
    case SystemActions.ActionTypes.LISTS.RELIGIOUS_COUNCIL_ROLES_DELETE_MODE_UPDATED:
        var newState = {...state};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.religiousCouncilKeyInSelectMode = action.key;
        return newState;
    case SystemActions.ActionTypes.LISTS.RELIGIOUS_COUNCIL_ROLES_EDIT_MODE_UPDATED:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.religiousCouncilKeyInSelectMode = action.key || null;
        newState.listsScreen.voterTab.isReligiousCouncilInEditMode = (undefined != action.key) ? true : false;
        newState.listsScreen.dirty = (undefined != action.key) ? true : false;
        newState.listsScreen.voterTab.religiousCouncilTextBeingEdited = action.name || '';
        return newState;
    case SystemActions.ActionTypes.LISTS.RELIGIOUS_COUNCIL_ROLES_EDIT_VALUE_CHANGED:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.religiousCouncilTextBeingEdited = action.name;
        return newState;
/* LISTS :: City Shas ROLES */
        case SystemActions.ActionTypes.LISTS.LOADED_CITY_SHAS_ROLES:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.lists = {...newState.lists};
        newState.lists.cityShasRoles = action.roles;
        newState.listsScreen.voterTab.cityShasKeyInSelectMode = null;
        newState.listsScreen.voterTab.isCityShasInEditMode = false;
        newState.listsScreen.dirty = false;
        newState.listsScreen.voterTab.showCityShasModalDialog = false;
        newState.listsScreen.voterTab.cityShasTextBeingEdited = '';
        newState.listsScreen.voterTab.cityShasSearchValue = '';
        newState.listsScreen.voterTab.isCityShasOrderedAsc = !newState.listsScreen.voterTab.isCityShasOrderedAsc;
        return newState;
    case SystemActions.ActionTypes.LISTS.ORDER_CITY_SHAS_ROLES:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.lists = {...newState.lists};
        var cityShas = [...newState.lists.cityShasRoles];
        var sortDirection = newState.listsScreen.voterTab.isCityShasOrderedAsc ? 'asc' : 'desc';
        cityShas.sort(arraySort(sortDirection, 'name'));
        newState.lists.cityShasRoles = cityShas;
        newState.listsScreen.voterTab.isCityShasOrderedAsc = !newState.listsScreen.voterTab.isCityShasOrderedAsc;
        return newState;
    case SystemActions.ActionTypes.LISTS.UPDATE_CITY_SHAS_ROLES_SEARCH_VALUE:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.cityShasSearchValue = action.value;
        return newState;
    case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_SHAS_ROLES_MODAL_DIALOG_DISPLAY:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.showCityShasModalDialog = !newState.listsScreen.voterTab.showCityShasModalDialog;
        return newState;
    case SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_DELETE_MODE_UPDATED:
        var newState = {...state};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.cityShasKeyInSelectMode = action.key;
        return newState;
    case SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_EDIT_MODE_UPDATED:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.cityShasKeyInSelectMode = action.key || null;
        newState.listsScreen.voterTab.isCityShasInEditMode = (undefined != action.key) ? true : false;
        newState.listsScreen.dirty = (undefined != action.key) ? true : false;
        newState.listsScreen.voterTab.cityShasTextBeingEdited = action.name || '';
        return newState;
    case SystemActions.ActionTypes.LISTS.CITY_SHAS_ROLES_EDIT_VALUE_CHANGED:
        var newState = {...state};
        newState.listsScreen = {...newState.listsScreen};
        newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
        newState.listsScreen.voterTab.cityShasTextBeingEdited = action.name;
        return newState;
        /* VOTER TAB :: PARTY_LIST */
        case SystemActions.ActionTypes.LISTS.LOADED_PARTY_LISTS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.partyLists = action.result;
            newState.listsScreen.voterTab.partyListKeyInSelectMode = null;
            newState.listsScreen.voterTab.isPartyListInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.isPartyListInAddMode = false;
            newState.listsScreen.voterTab.showPartyListModalDialog = false;
            newState.listsScreen.voterTab.partyListSearchValue = '';
            newState.listsScreen.voterTab.isPartyListsOrderedAsc = !newState.listsScreen.voterTab.isPartyListsOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_PARTY_LISTS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            var partyLists = [...newState.lists.partyLists];
            newState.listsScreen.voterTab.partyListOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.voterTab.isPartyListsOrderedAsc ? 'asc' : 'desc';
            partyLists.sort(arraySort(sortDirection, newState.listsScreen.voterTab.partyListOrderColumn));
            newState.lists.partyLists = partyLists;
            newState.listsScreen.voterTab.isPartyListsOrderedAsc = !newState.listsScreen.voterTab.isPartyListsOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_PARTY_LIST_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var partyListInEditMode = {...newState.listsScreen.voterTab.partyListInEditMode};
            partyListInEditMode.name = action.value;
            newState.listsScreen.voterTab.partyListInEditMode = partyListInEditMode;
            newState.listsScreen.voterTab.partyListSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_PARTY_LIST_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.showPartyListModalDialog = !newState.listsScreen.voterTab.showPartyListModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.PARTY_LIST_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.partyListKeyInSelectMode = action.partyListkey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ADD_PARTY_LIST_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.isPartyListInAddMode = ('add' == action.event) ? true : false;
            newState.listsScreen.dirty = ('add' == action.event) ? true : false;
            if ('add' == action.event) {
                newState.listsScreen.voterTab.partyListSearchValue = '';
            } else {
                newState.listsScreen.voterTab.partyListInEditMode = { name: '', letters: '', shas: 0};
            }
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.listsScreen.voterTab.partyListInEditMode = {...newState.listsScreen.voterTab.partyListInEditMode};
            var partyListInEditMode = {...newState.listsScreen.voterTab.partyListInEditMode};
            var emptyPartyList = { name: '', letters: '', shas: 0};
            var partyListInEditMode = (undefined != action.partyList) ? action.partyList : emptyPartyList;
            newState.listsScreen.voterTab.partyListInEditMode = partyListInEditMode;
            newState.listsScreen.voterTab.partyListKeyInSelectMode = (undefined != action.partyList) ? action.partyList.key : null;
            newState.listsScreen.voterTab.isPartyListInEditMode = (undefined != action.partyList) ? true : false;
            newState.listsScreen.dirty = (undefined != action.partyList) ? true : false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.PARTY_LIST_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            var partyListInEditMode = {...newState.listsScreen.voterTab.partyListInEditMode};
            partyListInEditMode[action.key] = action.value;
            newState.listsScreen.voterTab.partyListInEditMode = partyListInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.RESET_PARTY_LISTS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.voterTab = {...newState.listsScreen.voterTab};
            newState.lists = {...newState.lists};
            newState.lists.partyLists = [];
            newState.listsScreen.voterTab.partyListKeyInSelectMode = null;
            newState.listsScreen.voterTab.isPartyListInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.voterTab.showPartyListModalDialog = false;
            newState.listsScreen.voterTab.partyListSearchValue = '';
            return newState;
            break;
        /* REQUEST TOPICS */
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            newState.lists.topics = action.topics;
            newState.listsScreen.requestTab.requestTopicKeyInSelectMode = null;
            newState.listsScreen.requestTab.isRequestTopicInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.showRequestTopicModalDialog = false;
            newState.listsScreen.requestTab.isTopicsInDnDSort = false;
            newState.listsScreen.requestTab.requestTopicSearchValue = '';
            newState.listsScreen.requestTab.isRequestTopicOrderedAsc = !newState.listsScreen.requestTab.isRequestTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_SUB_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            newState.lists.subTopics = action.topics;
            newState.listsScreen.requestTab.isRequestTopicInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.isSubTopicsInDnDSort = false;
            newState.listsScreen.requestTab.isSubTopicInAddMode = false;
            newState.listsScreen.requestTab.requestSubTopicSearchValue = '';
            newState.listsScreen.requestTab.isRequestSubTopicOrderedAsc = !newState.listsScreen.requestTab.isRequestSubTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestTopic = [...newState.lists.topics];
            let sortDirection = newState.listsScreen.requestTab.isRequestTopicOrderedAsc ? 'asc' : 'desc';
            newState.listsScreen.requestTab.requestTopicOrderColumn = action.orderColumn || 'name';
            requestTopic.sort(arraySort(sortDirection, newState.listsScreen.requestTab.requestTopicOrderColumn));
            newState.lists.topics = requestTopic;
            newState.listsScreen.requestTab.isRequestTopicOrderedAsc = !newState.listsScreen.requestTab.isRequestTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_SUB_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestSubTopic = [...newState.lists.subTopics];
            var sortDirection = newState.listsScreen.requestTab.isRequestSubTopicOrderedAsc ? 'asc' : 'desc';
            newState.listsScreen.requestTab.requestSubTopicOrderColumn = action.orderColumn || 'name';
            requestSubTopic.sort(arraySort(sortDirection, newState.listsScreen.requestTab.requestSubTopicOrderColumn));
            newState.lists.subTopics = requestSubTopic;
            newState.listsScreen.requestTab.isRequestSubTopicOrderedAsc = !newState.listsScreen.requestTab.isRequestSubTopicOrderedAsc;
            return newState;
        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_TOPIC_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            var requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            requestTopicInEditedMode.name = action.value;
            newState.listsScreen.requestTab.requestTopicInEditedMode = requestTopicInEditedMode;
            newState.listsScreen.requestTab.requestTopicSearchValue = action.value;
            var requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            requestTopicInEditedMode.parent_id = 0;
            newState.listsScreen.requestTab.requestTopicInEditedMode = requestTopicInEditedMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOAD_SUB_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            requestTopicInEditedMode.parent_id = action.id;
            newState.listsScreen.requestTab.requestTopicInEditedMode = requestTopicInEditedMode;
            newState.listsScreen.requestTab.requestSubTopicSearchValue = '';
            newState.listsScreen.requestTab.isSubTopicsDisplayed = true;
            newState.listsScreen.requestTab.isSubTopicInAddMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.subTopicsParentKey = action.key;
            newState.listsScreen.requestTab.requestTopicNameInSelectMode = action.name;
            newState.lists.subTopics = [];
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.SUB_TOPIC_ADD_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            newState.listsScreen.requestTab.isSubTopicInAddMode = ('add' == action.event) ? true : false;
            newState.listsScreen.dirty = ('add' == action.event) ? true : false;
            if ('add' == action.event) {
                newState.listsScreen.requestTab.requestSubTopicSearchValue = '';
            } else {
                newState.listsScreen.requestTab.requestTopicInEditedMode = {
                    name: '', active: 1,
                    parent_id: 0, target_close_days: null, default_request_status_id: null
               };
            }
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_SUB_TOPIC_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            var requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            requestTopicInEditedMode.name = action.value;
            newState.listsScreen.requestTab.requestTopicInEditedMode = requestTopicInEditedMode;
            newState.listsScreen.requestTab.requestSubTopicSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_TOPIC_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.showRequestTopicModalDialog = !newState.listsScreen.requestTab.showRequestTopicModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestTopicKeyInSelectMode = action.requestTopickey;
            newState.listsScreen.requestTab.subTopicsParentKey = action.subTopicsParentKey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            newState.listsScreen.requestTab.requestTopicKeyInSelectMode = action.requestTopickey || null;
            newState.listsScreen.requestTab.isRequestTopicInEditMode = (undefined != action.requestTopic) ? true : false;
            newState.listsScreen.dirty = (undefined != action.requestTopic) ? true : false;
            let emptyRequestTopic = {
                name: '',
                active: 1,
                parent_id: 0,
                target_close_days: null,
                default_request_status_id: null
           };
            var requestTopic = emptyRequestTopic;
            if (undefined != action.requestTopic) {
                newState.listsScreen.requestTab.isSubTopicsDisplayed = (action.requestTopic.parent_id == '0') ? false : true;
                requestTopic = action.requestTopic;
            }

            newState.listsScreen.requestTab.requestTopicInEditedMode = requestTopic;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOPIC_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            var requestTopicInEditedMode = {...newState.listsScreen.requestTab.requestTopicInEditedMode};
            requestTopicInEditedMode[action.key] = action.value;
            newState.listsScreen.requestTab.requestTopicInEditedMode = requestTopicInEditedMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS_MODE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.dndSortTemp = {...newState.listsScreen.requestTab.dndSortTemp};
            newState.lists = {...newState.lists};
            newState.listsScreen.requestTab.isSubTopicsInDnDSort = false;
            newState.listsScreen.requestTab.isTopicsInDnDSort = true;
            newState.listsScreen.requestTab.isRequestTopicOrderedAsc = true;
            newState.listsScreen.requestTab.isSubTopicsDisplayed = false;
            newState.lists.subTopics = [];
            newState.listsScreen.dirty = true;
            newState.listsScreen.requestTab.dndSortTemp.topics = newState.lists.topics;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS_MODE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.dndSortTemp = {...newState.listsScreen.requestTab.dndSortTemp};
            newState.listsScreen.requestTab.isTopicsInDnDSort = false;
            newState.listsScreen.requestTab.isSubTopicsInDnDSort = true;
            newState.listsScreen.requestTab.isRequestSubTopicOrderedAsc = true;
            newState.listsScreen.dirty = true;
            newState.listsScreen.requestTab.dndSortTemp.subTopics = newState.lists.subTopics;
            return newState;
        case SystemActions.ActionTypes.LISTS.REQUESTS.MODULE_USERS:
            var newState = {...state};
            newState.requestModuleUsers = action.requestModuleUsers;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.LOADED_REQUESTS_TOPICS:
            var newState = {...state};
            newState.userScreen = { ...newState.userScreen };
            newState.userScreen.userRequestTopics = action.userRequestTopics;
            return newState;
            break;
        /* LISTS :: REQUEST_STATUS */
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_LOADED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestStatusInEditMode = {...newState.listsScreen.requestTab.requestStatusInEditMode};
            newState.lists = {...newState.lists};
            newState.lists.requestStatus = action.list;
            newState.listsScreen.requestTab.requestStatusKeyInSelectMode = null;
            newState.listsScreen.requestTab.isRequestStatusInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.isRequestStatusInAddMode = false;
            newState.listsScreen.requestTab.isRequestStatusInDnDSort = false;
            newState.listsScreen.requestTab.showRequestStatusModalDialog = false;
            newState.listsScreen.requestTab.requestStatusInEditMode = { name: '', type_id: -1};
            newState.listsScreen.requestTab.requestStatusSearchValue = '';
            newState.listsScreen.requestTab.isRequestStatusOrderedAsc = !newState.listsScreen.requestTab.isRequestStatusOrderedAsc;
            return newState;
            break;
        /*   case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_STATUS:
         var newState = {...state};
         var requestStatus = [...newState.lists.requestStatus];
         var sortDirection = newState.listsScreen.requestTab.isRequestStatusOrderedAsc ? 'asc' : 'desc';
         newState.listsScreen.requestTab.requestStatusOrderColumn = action.orderColumn || 'name';
         requestStatus.sort(arraySort(sortDirection, newState.listsScreen.requestTab.requestStatusOrderColumn));
         newState.lists.requestStatus = requestStatus;
         newState.listsScreen.requestTab.isRequestStatusOrderedAsc = !newState.listsScreen.requestTab.isRequestStatusOrderedAsc;
         return newState;
         break;*/

        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_STATUS_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            var requestStatusInEditMode = {...newState.listsScreen.requestTab.requestStatusInEditMode};
            requestStatusInEditMode.name = action.value;
            newState.listsScreen.requestTab.requestStatusInEditMode = requestStatusInEditMode;
            newState.listsScreen.requestTab.requestStatusSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_STATUS_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.showRequestStatusModalDialog = !newState.listsScreen.requestTab.showRequestStatusModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestStatusKeyInSelectMode = action.requestStatuskey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestStatusInEditMode = {...newState.listsScreen.requestTab.requestStatusInEditMode};
            newState.listsScreen.requestTab.requestStatusKeyInSelectMode = (undefined != action.item) ? action.item.key : null;
            newState.listsScreen.requestTab.isRequestStatusInEditMode = (undefined != action.item) ? true : false;
            newState.listsScreen.dirty = (undefined != action.item) ? true : false;
            const emptyRequestStatus = { name: '', type_id: -1};
            newState.listsScreen.requestTab.requestStatusInEditMode = (undefined != action.item) ? action.item : emptyRequestStatus;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_STATUS_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestStatusInEditMode = {...newState.listsScreen.requestTab.requestStatusInEditMode};
            const requestStatusInEditMode = {...newState.listsScreen.requestTab.requestStatusInEditMode};
            requestStatusInEditMode[action.key] = action.value;
            newState.listsScreen.requestTab.requestStatusInEditMode = requestStatusInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ADD_REQUEST_STATUS_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestStatusInEditMode = {...newState.listsScreen.requestTab.requestStatusInEditMode};
            newState.listsScreen.requestTab.isRequestStatusInAddMode = ('add' == action.event) ? true : false;
            newState.listsScreen.dirty = ('add' == action.event) ? true : false;
            if ('add' == action.event) {
                newState.listsScreen.requestTab.requestStatusSearchValue = '';
            } else {
                newState.listsScreen.requestTab.requestStatusInEditMode = { name: '', type_id: -1};
            }
            return newState;
            break;
        //REQUEST STATUS DRAG AND DROP
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS_MODE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.dndSortTemp = {...newState.listsScreen.requestTab.dndSortTemp};
            newState.listsScreen.requestTab.dndSortTemp.requestStatus = {...newState.listsScreen.requestTab.dndSortTemp.requestStatus};
            newState.listsScreen.requestTab.isRequestStatusInDnDSort = true;
            newState.listsScreen.requestTab.dndSortTemp.requestStatus = newState.lists.requestStatus;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestStatusList = [...newState.lists.requestStatus];
            var extractedItem = null;
            for (var i = 0; i < requestStatusList.length; i++) {
                if (requestStatusList[i].key == action.fromItem.key) {
                    extractedItem = (requestStatusList.splice(i, 1))[0];
                    break;
                }
            }

            for (i = 0; i < requestStatusList.length; i++) {
                if (requestStatusList[i].key == action.toItem.key) {
                    if (action.before)
                        requestStatusList.splice(i, 0, extractedItem);
                    else
                        requestStatusList.splice(i + 1, 0, extractedItem);
                    break;
                }
            }
            newState.lists.requestStatus = requestStatusList;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_REQUEST_STATUS_DROP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.dndSortTemp = {...newState.listsScreen.requestTab.dndSortTemp};
            newState.listsScreen.requestTab.dndSortTemp.requestStatus = {...newState.listsScreen.requestTab.dndSortTemp.requestStatus};
            newState.lists = {...newState.lists};
            var requestStatusList = [...newState.lists.requestStatus];
            for (i = 0; i < requestStatusList.length; i++) {
                requestStatusList[i].order = i + 1;
            }
            newState.lists.requestStatus = requestStatusList;
            newState.listsScreen.requestTab.dndSortTemp.requestStatus = requestStatusList;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_REQUEST_STATUS_REVERT_TO_ORIGINAL:
            var newState = {...state};
            newState.lists = {...newState.lists};
            if (newState.listsScreen.requestTab.dndSortTemp.requestStatus.length > 0) {
                newState.lists.requestStatus = newState.listsScreen.requestTab.dndSortTemp.requestStatus;
            }

            return newState;
            break;
        /* LISTS :: REQUEST_STATUS_TYPES */
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_STATUS_TYPES:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.requestStatusType = action.list;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            var requestTopics = [...newState.lists.topics];
            var extractedItem = null;
            for (var i = 0; i < requestTopics.length; i++) {
                if (requestTopics[i].key == action.fromItem.key) {
                    extractedItem = (requestTopics.splice(i, 1))[0];
                    break;
                }
            }

            for (i = 0; i < requestTopics.length; i++) {
                if (requestTopics[i].key == action.toItem.key) {
                    if (action.before)
                        requestTopics.splice(i, 0, extractedItem);
                    else
                        requestTopics.splice(i + 1, 0, extractedItem);
                    break;
                }
            }
            newState.lists.topics = requestTopics;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            var requestTopics = [...newState.lists.subTopics];
            var extractedItem = null;
            for (var i = 0; i < requestTopics.length; i++) {
                if (requestTopics[i].key == action.fromItem.key) {
                    extractedItem = (requestTopics.splice(i, 1))[0];
                    break;
                }
            }

            for (i = 0; i < requestTopics.length; i++) {
                if (requestTopics[i].key == action.toItem.key) {
                    if (action.before)
                        requestTopics.splice(i, 0, extractedItem);
                    else
                        requestTopics.splice(i + 1, 0, extractedItem);
                    break;
                }
            }
            newState.lists.subTopics = requestTopics;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_TOPICS_DROP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.dndSortTemp = {...newState.listsScreen.requestTab.dndSortTemp};
            newState.lists = {...newState.lists};
            var requestTopics = [...newState.lists.topics];
            for (i = 0; i < requestTopics.length; i++) {
                requestTopics[i].topic_order = i + 1;
            }
            newState.lists.topics = requestTopics;
            newState.listsScreen.requestTab.dndSortTemp.topics = requestTopics;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SORT_SUB_TOPICS_DROP:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestTopics = [...newState.lists.subTopics];
            for (i = 0; i < requestTopics.length; i++) {
                requestTopics[i].topic_order = i + 1;
            }
            newState.lists.subTopics = requestTopics;
            newState.listsScreen.requestTab.dndSortTemp.subTopics = requestTopics;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_TOPICS_REVERT_TO_ORIGINAL:
            var newState = {...state};
            newState.lists = {...newState.lists};

            if (newState.listsScreen.requestTab.dndSortTemp.topics.length > 0) {
                newState.lists.topics = newState.listsScreen.requestTab.dndSortTemp.topics;
            }

            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.DND_SUB_TOPICS_REVERT_TO_ORIGINAL:
            var newState = {...state};
            newState.lists = {...newState.lists};

            if (newState.listsScreen.requestTab.dndSortTemp.subTopics.length > 0) {
                newState.lists.subTopics = newState.listsScreen.requestTab.dndSortTemp.subTopics;
            }

            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_ALL_REQUESTS_TOPICS:
            var newState = {...state};
            newState.lists = {...newState.lists};
            let allTopicsHash = {};
            let mainTopicsHash = {};
            action.topics.forEach( item => {
                if(!allTopicsHash.hasOwnProperty(item.parent_id)){ allTopicsHash[item.parent_id] = []}
                allTopicsHash[item.parent_id].push(item)
            })
            allTopicsHash[0].forEach(topic => {
                mainTopicsHash[topic.id] = topic;
            });
            newState.lists.allTopicsHash = allTopicsHash;
            newState.lists.mainTopicsHash = mainTopicsHash;
            return newState;
            break;
        /* LISTS :: REQUEST ACTION TYPES */
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_ACTION_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists.requestActionTypes = action.types;
            newState.listsScreen.requestTab.requestActionTypeKeyInSelectMode = null;
            newState.listsScreen.requestTab.isRequestActionTypeInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.showRequestActionTypeModalDialog = false;
            newState.listsScreen.requestTab.isRequestActionTypeTopicsDisplayed = false;
            newState.listsScreen.requestTab.requestActionTypeTextBeingEdited = '';
            newState.listsScreen.requestTab.requestActionTypeSearchValue = '';
            newState.listsScreen.requestTab.isRequestActionTypeOrderedAsc = !newState.listsScreen.requestTab.isRequestActionTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_ACTION_TYPE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestActionType = [...newState.lists.requestActionTypes];
            var sortDirection = newState.listsScreen.requestTab.isRequestActionTypeOrderedAsc ? 'asc' : 'desc';
            requestActionType.sort(arraySort(sortDirection, 'name'));
            newState.lists.requestActionTypes = requestActionType;
            newState.listsScreen.requestTab.isRequestActionTypeOrderedAsc = !newState.listsScreen.requestTab.isRequestActionTypeOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_ACTION_TYPE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestActionTypeSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_ACTION_TYPE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.showRequestActionTypeModalDialog = !newState.listsScreen.requestTab.showRequestActionTypeModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestActionTypeKeyInSelectMode = action.requestActionTypekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestActionTypeKeyInSelectMode = action.requestActionTypekey || null;
            newState.listsScreen.requestTab.isRequestActionTypeInEditMode = undefined != action.requestActionTypekey ? true : false;
            newState.listsScreen.dirty = undefined != action.requestActionTypekey ? true : false;
            newState.listsScreen.requestTab.requestActionTypeTextBeingEdited = action.requestActionTypeName || '';
            newState.listsScreen.requestTab.isRequestActionTypeTopicsDisplayed = false;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TYPE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestActionTypeTextBeingEdited = action.requestActionTypeName;
            return newState;
            break;
        /* LISTS :: REQUEST ACTION TOPICS */
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOAD_REQUEST_ACTION_TYPE_TOPICS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            var typeTopicInEditedMode = {...newState.listsScreen.requestTab.requestActionTopicInEditMode};
            typeTopicInEditedMode.actionTypeId = action.id;
            newState.listsScreen.requestTab.requestActionTopicInEditMode = typeTopicInEditedMode;
            newState.listsScreen.requestTab.requestActionTypeKeyInSelectMode = action.key;
            newState.listsScreen.requestTab.requestActionTypeNameInSelectMode = action.name;
            newState.listsScreen.requestTab.isRequestActionTypeTopicsDisplayed = true;
            newState.listsScreen.requestTab.requestActionTopicSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_ACTION_TOPIC:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            newState.lists.requestActionTopics = action.topics;
            newState.listsScreen.requestTab.requestActionTopicKeyInSelectMode = null;
            newState.listsScreen.requestTab.isRequestActionTopicInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.showRequestActionTopicModalDialog = false;
            newState.listsScreen.requestTab.requestActionTopicSearchValue = '';
            newState.listsScreen.requestTab.isRequestActionTopicOrderedAsc = !newState.listsScreen.requestTab.isRequestActionTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_ACTION_TOPIC:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestActionTopic = [...newState.lists.requestActionTopics];
            newState.listsScreen.requestTab.requestActionTopicOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.requestTab.isRequestActionTopicOrderedAsc ? 'asc' : 'desc';
            requestActionTopic.sort(arraySort(sortDirection, newState.listsScreen.requestTab.requestActionTopicOrderColumn));
            newState.lists.requestActionTopics = requestActionTopic;
            newState.listsScreen.requestTab.isRequestActionTopicOrderedAsc = !newState.listsScreen.requestTab.isRequestActionTopicOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_ACTION_TOPIC_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            var typeTopicInEditedMode = {...newState.listsScreen.requestTab.requestActionTopicInEditMode};
            typeTopicInEditedMode.name = action.value;
            newState.listsScreen.requestTab.requestActionTopicInEditMode = typeTopicInEditedMode;
            newState.listsScreen.requestTab.requestActionTopicSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_ACTION_TOPIC_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.showRequestActionTopicModalDialog = !newState.listsScreen.requestTab.showRequestActionTopicModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestActionTopicKeyInSelectMode = action.requestActionTopickey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestActionTopicInEditMode = {...newState.listsScreen.requestTab.requestActionTopicInEditMode};
            newState.listsScreen.requestTab.requestActionTopicKeyInSelectMode = (undefined != action.item ? action.item.key : null);
            newState.listsScreen.requestTab.isRequestActionTopicInEditMode = (undefined != action.item ? true : false);
            newState.listsScreen.dirty = (undefined != action.item ? true : false);
            let emptyRequestActionTopicInEditMode = {
                name: '',
                active: 1,
                actionTypeId: -1
           };
            let requestActionTopicInEditMode = (undefined != action.item) ? action.item : emptyRequestActionTopicInEditMode;
            newState.listsScreen.requestTab.requestActionTopicInEditMode = requestActionTopicInEditMode;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_ACTION_TOPIC_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            var requestActionTopicInEditMode = {...newState.listsScreen.requestTab.requestActionTopicInEditMode};
            requestActionTopicInEditMode[action.key] = action.value;
            newState.listsScreen.requestTab.requestActionTopicInEditMode = requestActionTopicInEditMode;
            return newState;
            break;
        /* LISTS :: REQUEST SOURCE */
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_SOURCE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            newState.lists.requestSource = action.data;
            newState.listsScreen.requestTab.requestSourceKeyInSelectMode = null;
            newState.listsScreen.requestTab.isRequestSourceInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.showRequestSourceModalDialog = false;
            newState.listsScreen.requestTab.requestSourceTextBeingEdited = '';
            newState.listsScreen.requestTab.requestSourceSearchValue = '';
            newState.listsScreen.requestTab.isRequestSourceOrderedAsc = !newState.listsScreen.requestTab.isRequestSourceOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_SOURCE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestSource = [...newState.lists.requestSource];
            var sortDirection = newState.listsScreen.requestTab.isRequestSourceOrderedAsc ? 'asc' : 'desc';
            requestSource.sort(arraySort(sortDirection, 'name'));
            newState.lists.requestSource = requestSource;
            newState.listsScreen.requestTab.isRequestSourceOrderedAsc = !newState.listsScreen.requestTab.isRequestSourceOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_SOURCE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestSourceSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_SOURCE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.showRequestSourceModalDialog = !newState.listsScreen.requestTab.showRequestSourceModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestSourceKeyInSelectMode = action.requestSourcekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestSourceKeyInSelectMode = action.requestSourcekey || null;
            newState.listsScreen.requestTab.isRequestSourceInEditMode = (undefined != action.requestSourcekey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.requestSourcekey) ? true : false;
            newState.listsScreen.requestTab.requestSourceTextBeingEdited = action.requestSourceName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_SOURCE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestSourceTextBeingEdited = action.requestSourceName;
            return newState;
            break;

        /* LISTS :: REQUEST _CLOSURE REASON */
        case SystemActions.ActionTypes.LISTS.REQUESTS.LOADED_REQUEST_CLOSURE_REASON:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            newState.lists.requestClosureReason = action.data;
            newState.listsScreen.requestTab.requestClosureReasonKeyInSelectMode = null;
            newState.listsScreen.requestTab.isRequestClosureReasonInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.requestTab.showRequestClosureReasonModalDialog = false;
            newState.listsScreen.requestTab.requestClosureReasonTextBeingEdited = '';
            newState.listsScreen.requestTab.requestClosureReasonSearchValue = '';
            newState.listsScreen.requestTab.isRequestClosureReasonOrderedAsc = !newState.listsScreen.requestTab.isRequestClosureReasonOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.ORDER_REQUEST_CLOSURE_REASON:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.lists = {...newState.lists};
            var requestClosureReason = [...newState.lists.requestClosureReason];
            var sortDirection = newState.listsScreen.requestTab.isRequestClosureReasonOrderedAsc ? 'asc' : 'desc';
            requestClosureReason.sort(arraySort(sortDirection, 'name'));
            newState.lists.requestClosureReason = requestClosureReason;
            newState.listsScreen.requestTab.isRequestClosureReasonOrderedAsc = !newState.listsScreen.requestTab.isRequestClosureReasonOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.UPDATE_REQUEST_CLOSURE_REASON_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestClosureReasonSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.TOGGLE_DELETE_REQUEST_CLOSURE_REASON_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.showRequestClosureReasonModalDialog = !newState.listsScreen.requestTab.showRequestClosureReasonModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_CLOSURE_REASON_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestClosureReasonKeyInSelectMode = action.requestClosureReasonkey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_CLOSURE_REASON_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestClosureReasonKeyInSelectMode = action.requestClosureReasonkey || null;
            newState.listsScreen.requestTab.isRequestClosureReasonInEditMode = (undefined != action.requestClosureReasonkey) ? true : false;
            newState.listsScreen.dirty = (undefined != action.requestClosureReasonkey) ? true : false;
            newState.listsScreen.requestTab.requestClosureReasonTextBeingEdited = action.requestClosureReasonName || '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.REQUESTS.REQUEST_CLOSURE_REASON_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.requestTab = {...newState.listsScreen.requestTab};
            newState.listsScreen.requestTab.requestClosureReasonTextBeingEdited = action.requestClosureReasonName;
            return newState;
            break;

        /** System Tab
         *  USER_ROLES **/
        case SystemActions.ActionTypes.LISTS.USER_ROLES_LOADED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.lists = {...newState.lists};
            newState.lists.userRoles = action.roles;
            newState.listsScreen.systemTab.userRoleKeyInSelectMode = null;
            newState.listsScreen.systemTab.isUserRoleInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.systemTab.showUserRoleModalDialog = false;
            newState.listsScreen.systemTab.userRoleInEditMode = { module_id: -1, role_name: '', team_leader: 0, permission_group_id: -1, module_name: '',};
            newState.listsScreen.systemTab.userRoleSearchValue = '';
            newState.listsScreen.systemTab.isUserRoleOrderedAsc = !newState.listsScreen.systemTab.isUserRoleOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_USER_ROLE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.showUserRoleModalDialog = !newState.listsScreen.systemTab.showUserRoleModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_USER_ROLES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.lists = {...newState.lists};
            var userRoles = [...newState.lists.userRoles];
            newState.listsScreen.systemTab.userRoleOrderColumn = action.orderColumn || 'module_name';
            var sortDirection = newState.listsScreen.systemTab.isUserRoleOrderedAsc ? 'asc' : 'desc';
            userRoles.sort(arraySort(sortDirection, newState.listsScreen.systemTab.userRoleOrderColumn));
            newState.lists.userRoles = userRoles;
            newState.listsScreen.systemTab.isUserRoleOrderedAsc = !newState.listsScreen.systemTab.isUserRoleOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_USER_ROLE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            var userRoleInEditMode = {...newState.listsScreen.systemTab.userRoleInEditMode};
            userRoleInEditMode.role_name = action.value;
            newState.listsScreen.systemTab.userRoleInEditMode = userRoleInEditMode;
            newState.listsScreen.systemTab.userRoleSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.USER_ROLE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.userRoleKeyInSelectMode = action.userRolekey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.USER_ROLE_ADD_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.isUserRoleInAddMode = ('add' == action.event) ? true : false;
            newState.listsScreen.dirty = ('add' == action.event) ? true : false;
            newState.listsScreen.systemTab.userRoleSearchValue = '';
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.userRoleInEditMode = {...newState.listsScreen.systemTab.userRoleInEditMode};
            const emptyUserRole = { module_id: -1, role_name: '', team_leader: 0, permission_group_id: -1, module_name: ''};
            newState.listsScreen.systemTab.userRoleKeyInSelectMode = (undefined != action.item) ? action.item.key : null;
            newState.listsScreen.systemTab.isUserRoleInEditMode = (undefined != action.item) ? true : false;
            newState.listsScreen.dirty = (undefined != action.item) ? true : false;
            newState.listsScreen.systemTab.userRoleInEditMode = (undefined != action.item) ? action.item : emptyUserRole;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.USER_ROLE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            var userRoleInEditMode = {...newState.listsScreen.systemTab.userRoleInEditMode};
            userRoleInEditMode[action.key] = action.value;
            newState.listsScreen.systemTab.userRoleInEditMode = userRoleInEditMode;
            return newState;
            break;
        /* LISTS :: LANGUAGES */
        case SystemActions.ActionTypes.LISTS.LOADED_LANGUAGES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.languages = action.result;
            newState.listsScreen.generalTab.languageKeyInSelectMode = null;
            newState.listsScreen.generalTab.isLanguageInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showLanguageModalDialog = false;
            newState.listsScreen.generalTab.languageInEditMode = { name: '', main: false};
            newState.listsScreen.generalTab.languageSearchValue = '';
            newState.listsScreen.generalTab.isLanguageOrderedAsc = !newState.listsScreen.generalTab.isLanguageOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_LANGUAGES:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var language = [...newState.lists.languages];
            newState.listsScreen.generalTab.languageOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.generalTab.isLanguageOrderedAsc ? 'asc' : 'desc';
            language.sort(arraySort(sortDirection, newState.listsScreen.generalTab.languageOrderColumn));
            newState.lists.languages = language;
            newState.listsScreen.generalTab.isLanguageOrderedAsc = !newState.listsScreen.generalTab.isLanguageOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_LANGUAGE_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.languageSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_LANGUAGE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showLanguageModalDialog = !newState.listsScreen.generalTab.showLanguageModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LANGUAGE_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.languageKeyInSelectMode = action.languageKey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LANGUAGE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.languageKeyInSelectMode = (undefined != action.item) ? action.item.key : null;
            newState.listsScreen.generalTab.isLanguageInEditMode = (undefined != action.item) ? true : false;
            newState.listsScreen.dirty = (undefined != action.item) ? true : false;
            newState.listsScreen.generalTab.languageInEditMode = action.item || { name: '', main: false};
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LANGUAGE_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var languageInEditMode = {...newState.listsScreen.generalTab.languageInEditMode};
            languageInEditMode[action.key] = action.value;
            newState.listsScreen.generalTab.languageInEditMode = languageInEditMode;
            return newState;
            break;
        /* LISTS :: CITY_DEPARTMENT */
        case SystemActions.ActionTypes.LISTS.LOADED_CITY_DEPARTMENT:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            newState.lists.cityDepartment = action.result;
            newState.listsScreen.generalTab.cityDepartmentKeyInSelectMode = null;
            newState.listsScreen.generalTab.isCityDepartmentInEditMode = false;
            newState.listsScreen.dirty = false;
            newState.listsScreen.generalTab.showCityDepartmentModalDialog = false;
            newState.listsScreen.generalTab.cityDepartmentInEditMode = { name: '', main: false};
            newState.listsScreen.generalTab.cityDepartmentSearchValue = '';
            newState.listsScreen.generalTab.isCityDepartmentOrderedAsc = !newState.listsScreen.generalTab.isCityDepartmentOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_CITY_DEPARTMENT:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.lists = {...newState.lists};
            var cityDepartment = [...newState.lists.cityDepartment];
            newState.listsScreen.generalTab.cityDepartmentOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.generalTab.isCityDepartmentOrderedAsc ? 'asc' : 'desc';
            cityDepartment.sort(arraySort(sortDirection, newState.listsScreen.generalTab.cityDepartmentOrderColumn));
            newState.lists.cityDepartment = cityDepartment;
            newState.listsScreen.generalTab.isCityDepartmentOrderedAsc = !newState.listsScreen.generalTab.isCityDepartmentOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_CITY_DEPARTMENT_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.cityDepartmentSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_DEPARTMENT_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.showCityDepartmentModalDialog = !newState.listsScreen.generalTab.showCityDepartmentModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.cityDepartmentKeyInSelectMode = action.cityDepartmentKey;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            newState.listsScreen.generalTab.cityDepartmentInEditMode = {...newState.listsScreen.generalTab.cityDepartmentInEditMode};
            newState.listsScreen.generalTab.cityDepartmentKeyInSelectMode = (undefined != action.item) ? action.item.key : null;
            newState.listsScreen.generalTab.isCityDepartmentInEditMode = (undefined != action.item) ? true : false;
            newState.listsScreen.dirty = (undefined != action.item) ? true : false;
            newState.listsScreen.generalTab.cityDepartmentInEditMode = action.item || { name: '', main: false};
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.CITY_DEPARTMENT_EDIT_VALUE_CHANGED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.generalTab = {...newState.listsScreen.generalTab};
            var cityDepartmentInEditMode = {...newState.listsScreen.generalTab.cityDepartmentInEditMode};
            cityDepartmentInEditMode[action.key] = action.value;
            newState.listsScreen.generalTab.cityDepartmentInEditMode = cityDepartmentInEditMode;
            return newState;
            break;

        /* TEAMS */
        case SystemActions.ActionTypes.LISTS.TEAMS_LOADED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.lists = {...newState.lists};
            newState.lists.teams = action.teams;
            newState.listsScreen.systemTab.teamKeyInSelectMode = null;
            newState.listsScreen.systemTab.showTeamModalDialog = false;
            newState.listsScreen.systemTab.teamSearchValue = '';
            newState.listsScreen.systemTab.isTeamOrderedAsc = !newState.listsScreen.systemTab.isTeamOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_TEAM_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.showTeamModalDialog = !newState.listsScreen.systemTab.showTeamModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.ORDER_TEAMS:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.lists = {...newState.lists};
            var teams = [...newState.lists.teams];
            newState.listsScreen.systemTab.teamOrderColumn = action.orderColumn || 'name';
            var sortDirection = newState.listsScreen.systemTab.isTeamOrderedAsc ? 'asc' : 'desc';
            teams.sort(arraySort(sortDirection, newState.listsScreen.systemTab.teamOrderColumn));
            newState.lists.teams = teams;
            newState.listsScreen.systemTab.isTeamOrderedAsc = !newState.listsScreen.systemTab.isTeamOrderedAsc;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.UPDATE_TEAM_SEARCH_VALUE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.teamSearchValue = action.value;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TEAM_DELETE_MODE_UPDATED:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};
            newState.listsScreen.systemTab.teamKeyInSelectMode = action.teamkey;
            return newState;
            break;
        /* SMS PROVIDERS */
        case SystemActions.ActionTypes.LISTS.SMS_PROVIDERS_LOADED:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.systemTab = {...newState.listsScreen.systemTab};

            newState.lists.sms_providers = action.sms_providers;
            newState.listsScreen.systemTab.sms_providers_options = action.sms_providers_options;
            return newState;
        case SystemActions.ActionTypes.LISTS.UPDATE_PROVIDER:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.listsScreen = { ...newState.listsScreen };
            let sms_providers = [...newState.lists.sms_providers];
            let index = sms_providers.findIndex((providerData) => {
                return providerData.key == action.key;
            });
            if (index != -1) {
                sms_providers[index] = action.providerData;
            }
            newState.lists.sms_providers = sms_providers;
            return newState;
        /* PERMISSION_GROUPS */
        case SystemActions.ActionTypes.LISTS.PERMISSION_GROUPS_LOADED:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.permissionGroups = action.permissions;
            return newState;
            break;
        /* MODULES */
        case SystemActions.ActionTypes.LISTS.SYSTEM_MODULES_LOADED:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.lists.modules = action.modules;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.LIST_TAB_CHANGE:
            var newState = {...state};
            newState.listsScreen = {...newState.listsScreen};
            newState.listsScreen.tab = action.tabName;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.TABLE_CONTENT_HAS_UPDATED:
            var newState = {...state};
            newState.teamsScreen.tableHasScrollbar = action.hasScrollbar;
            return newState;
            break;
        case SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.listsScreen.showItemInEditModeModalDialog = !newState.listsScreen.showItemInEditModeModalDialog;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_SCREEN_COLLAPSE_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.containerCollapseStatus = {...state.userScreen.containerCollapseStatus};
            newState.userScreen.containerCollapseStatus[action.container] = !newState.userScreen.containerCollapseStatus[action.container];
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.CLEAR_TEAMS_DATA:
            var newState = {...state};
            newState.teamsScreen = {
                tab: 'team_members',
                editTeamName: '',
                teamLeaderId: null,
                editTeamLeaderFullName: '',
                editTeamLeaderID: -1,
                minimalUsers: [],
                staticUsers: [],
                minimalTeams: [],
                minimalTeamMembers: [],
                teamMembers: [],
                teamDepartments: [],
                teamLeadersHistory: [],
                isAddingNewDepartment: false,
                newDepartmentName: '',
                isDeletingDepartment: false,
                deleteDepartmentIndex: -1,
                isEditingDep: false,
                editDepRowIndex: -1,
                geoFilterOpened: false,
                sectorialFilterOpened: false,
                geoTemplates: [],
                sectorialTemplates: [],
                isDeletingGeoTemplate: false,
                deleteGeoTemplateIndex: -1,
                isDeletingSectorialTemplate: false,
                deleteSectorialTemplateIndex: -1,
                addingTeamGeoTemplate: false,
                addingTeamSectorialTemplate: false,
                editingTeamGeoTemplate: false,
                editingTeamSectorialTemplate: false,
                editingTeamGeoTemplateIndex: -1,
                editingTeamSectorialTemplateIndex: -1,
                geographicalModalHeader: '',
                sectorialModalHeader: '',
                geoFilterModalScreen: {
                    labelName: '',
                    areaName: '',
                    areaGroupName: '',
                },
           };
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.TEAM_TAB_CHANGE:
            var newState = {...state};
            //newState.teamsScreen = {...newState.teamsScreen};

            newState.teamsScreen.tab = action.tabName;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.CHANGE_TEAM_NAME_IN_TEAMS_LIST_ONLY:
            var newState = {...state};
            newState.teams = [...state.teams];
            for (let i = 0, len = newState.teams.length; i < len; i++) {
                if (newState.teams[i].key == action.teamKey) {
                    newState.teams[i].name = action.teamName;
                    break;
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_CONFIRM_DELETE_GEO_TEMPLATE:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.isDeletingGeoTemplate = true;
            newState.teamsScreen.deleteGeoTemplateIndex = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_CONFIRM_DELETE_SECTORIAL_TEMPLATE:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.isDeletingSectorialTemplate = true;
            newState.teamsScreen.deleteSectorialTemplateIndex = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_CONFIRM_DELETE_DEPARTMENT:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.isDeletingDepartment = true;
            newState.teamsScreen.deleteDepartmentIndex = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.HIDE_CONFIRM_DELETE_DELETES:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.isDeletingDepartment = false;
            newState.teamsScreen.deleteDepartmentIndex = -1;
            newState.teamsScreen.isDeletingGeoTemplate = false;
            newState.teamsScreen.deleteGeoTemplateIndex = -1;
            newState.teamsScreen.isDeletingSectorialTemplate = false;
            newState.teamsScreen.deleteSectorialTemplateIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SET_ADDING_DEPARTMENT:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.isAddingNewDepartment = action.data;
            if (!action.data) {
                newState.teamsScreen.newDepartmentName = '';
            }
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_DEP_NAME_CHANGE:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.newDepartmentName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SET_DEPARTMENT_ROW_EDITING:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.teamDepartments[action.data].is_editing = 1;
            newState.teamsScreen.isEditingDep = true;
            newState.teamsScreen.editDepRowIndex = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.UNSET_DEPARTMENT_ROW_EDITING:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.teamDepartments = [...newState.teamsScreen.teamDepartments];
            newState.teamsScreen.teamDepartments[action.data].is_editing = 0;
            newState.teamsScreen.teamDepartments[action.data].name = action.oldValue;
            newState.teamsScreen.isEditingDep = false;
            newState.teamsScreen.editDepRowIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.EDITED_DEP_ROW_SUCCESFULLY:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.teamDepartments = [...newState.teamsScreen.teamDepartments];
            newState.teamsScreen.teamDepartments[action.data].name = action.newName;
            newState.teamsScreen.teamDepartments[action.data].is_editing = 0;
            newState.teamsScreen.isEditingDep = false;
            newState.teamsScreen.editDepRowIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.EDIT_DEP_NAME_CHANGE:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.teamDepartments[action.rowIndex].name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.UPDATE_EXISTING_DEPARTMENTS:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.teamDepartments = action.data;
            newState.teamsScreen.newDepartmentName = '';
            newState.teamsScreen.isAddingNewDepartment = false;
            newState.teamsScreen.deleteDepartmentIndex = -1;
            newState.teamsScreen.isDeletingDepartment = false;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.REQUESTS_TOPICS:
            var newState = {...state};
            newState.teamsScreen = {...newState.teamsScreen};
            newState.teamsScreen.requestsTopics = action.requestsTopicsData;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.RESET_LOADED_USER:
            var newState = {...state};
            newState.selectedUserData.isUserLoaded = false;
            return newState;
            break;

        //Load specific user
        case SystemActions.ActionTypes.USERS.LOADING_USER:
            var newState = {...state};
            newState.selectedUserData.isUserLoaded = false;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_ADDED:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = action.data;
            return newState;
            break;
        //End load specific user
        case SystemActions.ActionTypes.USERS.LOADED_USER:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.selectedUserData = action.selectedUserData;
            newState.selectedUserData.isUserLoaded = true;

            newState.originalUserPhones = [...state.originalUserPhones];
            for (let i = 0, len = newState.selectedUserData.userPhones.length; i < len; i++) {

                newState.originalUserPhones.push({ name: newState.selectedUserData.userPhones[i].name, phone_number: newState.selectedUserData.userPhones[i].phone_number });
            }

            newState.selectedUserData.work_city_name = action.selectedUserData.work_city_name;
            newState.selectedUserData.cancel_payment = action.selectedUserData.cancel_payment;
            newState.userScreen.randomUserPassword = action.selectedUserData.personal_identity.slice(-4);
            newState.userScreen.oldUserPassword = action.selectedUserData.personal_identity.slice(-4);
            if (newState.selectedUserData.roles_by_user == undefined){ newState.selectedUserData.roles_by_user = []};
            if (newState.selectedUserData.active == undefined) {newState.selectedUserData.active = '1'};
            if (newState.selectedUserData.two_step_authentication == undefined ) {newState.selectedUserData.two_step_authentication = '1'};
            return newState;
            break;
        //Adding new user data from voter
        case SystemActions.ActionTypes.USERS.FIRST_VALIDATION_FAILED:
            var newState = {...state};
            newState.userScreen.updateButtonClicked = true;
            return newState;
            break;
        //Adding new user data from voter
        case SystemActions.ActionTypes.USERS.ADDING_USER:
            var newState = {...state};
            newState.addingUser = true;
            return newState;
            break;
        //Adding new user data from new voter - clean last user added flag
        case SystemActions.ActionTypes.USERS.CLEAN_ADDING_USER:
            var newState = {...state};
            newState.addedUser = false;
            return newState;
            break;
        //Adding new user data from voter-failed
        case SystemActions.ActionTypes.USERS.ADDING_USER_FAILED:
            var newState = {...state};
            newState.addingUser = false;
            return newState;
            break;
        //Finished and Added the new user data from voter
        case SystemActions.ActionTypes.USERS.ADDED_USER:
            var newState = {...state};
            newState.addingUser = false;
            newState.addedUser = true;
            newState.userScreen.updateButtonClicked = false;
            newState.selectedUserData = { personal_identity: '', isUserLoaded: false};
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADDED_GEO_FILTER_TO_EXISTING_USER_EXISTING_ROLE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.lists = {...newState.lists};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters = action.data;
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addingGeographicalFilter = false;
            newState.userScreen.editingGeographicalFilter = false;
            newState.userScreen.geographicalModalHeader = '';
            newState.userScreen.modalGeographicalFilterRoleIndex = -1;
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.mainFilterName = '';
            newState.userScreen.geoFilterModalScreen.entityType = -1;
            newState.userScreen.geoFilterModalScreen.entityID = -1;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        //Saving user data
        case SystemActions.ActionTypes.USERS.SAVING_USER:
            var newState = {...state};
            newState.userScreen.addingUser = true;
            return newState;
            break;
        //Finished and saved user data
        case SystemActions.ActionTypes.USERS.SAVED_USER:
            var newState = {...state};
            newState.addingUser = false;
            return newState;
            break;
        /*Open  missing user modal*/
        case SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_MODAL:
            var newState = {...state};
            newState.userScreen.modalHeaderText = 'שגיאה';
            newState.userScreen.modalContentText = 'תושב לא קיים';
            newState.userScreen.showModalDialog = true;
            return newState;
            break;
        /*Open  missing user details error for saving/ or adding user*/
        case SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_DETAILS:
            var newState = {...state};
            newState.userScreen.modalHeaderText = 'שגיאה';
            newState.userScreen.modalContentText = 'חסרים פרטי משתמש';
            newState.userScreen.showModalDialog = true;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.OPEN_GLOBAL_ERROR_MODAL:
            var newState = {...state};
            newState.userScreen.modalHeaderText = action.headerText;
            newState.userScreen.modalContentText = action.contentText;
            newState.userScreen.showModalDialog = true;
            return newState;
            break;
        /*Open  missing user phones error for saving/ or adding user*/
        case SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_PHONES:
            var newState = {...state};
            newState.userScreen.modalHeaderText = 'שגיאה';
            newState.userScreen.modalContentText = 'יש להזין לפחות טלפון אחד';
            newState.userScreen.showModalDialog = true;
            return newState;
            break;
        /*Open  missing user phones error for saving/ or adding user*/
        case SystemActions.ActionTypes.USERS.OPEN_MISSING_MAIN_ROLE:
            var newState = {...state};
            newState.userScreen.modalHeaderText = 'שגיאה';
            newState.userScreen.modalContentText = 'לפחות תפקיד אחד חייב להיות עיקרי';
            newState.userScreen.showModalDialog = true;
            return newState;
            break;
        /*Password changed succesfully - close the password dialog and alert a message*/
        case SystemActions.ActionTypes.USERS.PASSWORD_CHANGED_SUCCESSFULLY:
            var newState = {...state};
            newState.userScreen.randomUserPassword = action.data;
            newState.userScreen.modalHeaderText = 'הודעה';
            newState.userScreen.modalContentText = 'עדכון הסיסמא הצליח';
            newState.userScreen.showModalDialog = true;
            newState.userScreen.showResetPasswordModal = false;
            return newState;
            break;
        /*Password change failed - close the password dialog and alert a message*/
        case SystemActions.ActionTypes.USERS.PASSWORD_CHANGED_FAILED:
            var newState = {...state};
            newState.userScreen.modalHeaderText = 'שגיאה';
            newState.userScreen.modalContentText = 'עדכון הסיסמא נכשל';
            newState.userScreen.showModalDialog = true;
            newState.userScreen.showResetPasswordModal = false;
            return newState;
            break;
        /*error in saving new password for user*/
        case SystemActions.ActionTypes.USERS.CHANGE_PASSWORD_ERROR_MESSAGE:
            var newState = {...state};
            newState.modalDialogErrorMessage = action.errorMessage || '';
            return newState;
            break;
        /*Close  missing user modal*/
        case SystemActions.ActionTypes.USERS.CLOSE_MODAL_DIALOG:
            var newState = {...state};
            newState.userScreen.showModalDialog = false;
            newState.userScreen.modalHeaderText = '';
            newState.userScreen.modalContentText = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.OPEN_RESET_PASSWORD_MODAL:
            var newState = {...state};
            newState.userScreen.showResetPasswordModal = true;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.CLOSE_RESET_PASSWORD_MODAL:
            var newState = {...state};
            newState.userScreen.showResetPasswordModal = false;
            newState.userScreen.showHeaderChangePasswordModal = false;
            newState.userScreen.changePasswordModalOtherUser = null;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SHOW_RESET_PASSWORD_MODAL:
            var newState = {...state};
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.showResetPasswordModal = true;
            newState.userScreen.showHeaderChangePasswordModal = true;
            newState.userScreen.changePasswordModalOtherUser = null;
            newState.userScreen.oldPassword = '';
            newState.userScreen.password = '';
            newState.userScreen.confirmPassword = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.HIDE_RESET_PASSWORD_MODAL:
            var newState = {...state};
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.showResetPasswordModal = false;
            newState.userScreen.showHeaderChangePasswordModal = false;
            newState.userScreen.changePasswordModalOtherUser = null;
            newState.userScreen.oldPassword = '';
            newState.userScreen.password = '';
            newState.userScreen.confirmPassword = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_OLD_PASSWORD:
            var newState = {...state};
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.oldPassword = action.oldPassword;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_PASSWORD:
            var newState = {...state};
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.password = action.password;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_RESET_PASSWORD_CHANGE_CONFIRM_PASSWORD:
            var newState = {...state};
            newState.userScreen = {...newState.userScreen};
            newState.userScreen.confirmPassword = action.confirmPassword;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_NEIGHBORHOOD_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.work_neighborhood = action.data;
            return newState;
            break

        case SystemActions.ActionTypes.USERS.USER_T_Z_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.personal_identity = action.personal_identity.trim();
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_CITY_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.work_city_name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_TEAM_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.team_name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_TEAM_DEPARTMENT_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.team_department_name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.RESET_CURRENT_USER:
            var newState = {...state};
            newState.selectedUserData = { personal_identity: '', isUserLoaded: false, key: ''};
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_HOUSENUMBER_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.work_house = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_HOUSEENTRY_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.work_house_entry = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_STREET_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.work_street = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_FLAT_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.work_flat = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_ACTIVE_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.active = !newState.selectedUserData.active;
            newState.userScreen.newUserActive = !newState.userScreen.newUserActive;
            return newState;
            break;
            case SystemActions.ActionTypes.USERS.USER_MANAGER_PAYMENT_CHANGE:
                
                var newState = {...state};
                newState.selectedUserData = {...newState.selectedUserData};
                newState.selectedUserData.cancel_payment = !newState.selectedUserData.cancel_payment;
                newState.userScreen.newUserActive = !newState.userScreen.newUserActive;
                return newState;
                break;    
        case SystemActions.ActionTypes.USERS.USER_TWO_STEP_AUTH_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.two_step_authentication = !newState.selectedUserData.two_step_authentication;
            newState.userScreen.newUserTwoStepAuth = !newState.userScreen.newUserTwoStepAuth;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_ADMIN_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.admin = !newState.selectedUserData.admin;
            newState.userScreen.newUserAdmin = !newState.userScreen.newUserAdmin
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_IS_SHAS_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.shas_representative = !newState.selectedUserData.shas_representative;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_EMAIL_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...newState.selectedUserData};
            newState.selectedUserData.email = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_CHANGE_PASSWORD:
            var newState = {...state};
            newState.userScreen.randomUserPassword = action.randomUserPassword;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.CLEAR_USERS_FORM:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.selectedUserData = {...state.selectedUserData};
            newState.userScreen.addNewUserRoleScreen.moduleName = '';
            newState.userScreen.addNewUserRoleScreen.roleName = '';
            newState.userScreen.addNewUserRoleScreen.teamName = '';
            newState.userScreen.addNewUserRoleScreen.departmentName = '';
            newState.userScreen.addNewUserRoleScreen.toDate = '';
            newState.userScreen.addingUserRole = false;
            newState.userScreen.editingUserRole = false;
            newState.userScreen.editingUserRoleIndex = -1;
            newState.userScreen.deleteUserRoleIndex = -1;
            newState.selectedUserData.roles_by_user = [];
            newState.selectedUserData = { personal_identity: '', isUserLoaded: false, key: ''};
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_TAB_LOWER_CHANGE:
            var newState = {...state};
            newState.userScreen.tabLowerFrame = action.tabLowerFrame;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SHOW_ADD_USER_ROLE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addingUserRole = true;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.HIDE_ADD_USER_ROLE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addingUserRole = false;
            newState.userScreen.addNewUserRoleScreen.moduleName = '';
            newState.userScreen.addNewUserRoleScreen.roleName = '';
            newState.userScreen.addNewUserRoleScreen.teamName = '';
            newState.userScreen.addNewUserRoleScreen.departmentName = '';
            newState.userScreen.addNewUserRoleScreen.fromDate = getTodaysDate();
            newState.userScreen.addNewUserRoleScreen.toDate = '';
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_USER_ROLE_NAME_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addNewUserRoleScreen.roleName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_USER_TEAM_NAME_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addNewUserRoleScreen.teamName = action.data;
            newState.userScreen.roleDepartments = action.departments;
            newState.userScreen.addNewUserRoleScreen.departmentName = '';
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters = [];
            newState.userScreen.tempUserRoleTeamGeoFilters = action.teamGeoFilters;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETE_ROLE_GEO_FILTER_FROM_TEMP_ARRAY:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            if (action.data > -1) {
                newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters.splice(action.data);
                newState.userScreen.confirmDeleteRoleGeoFilterByUser = false;
                newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
                newState.userScreen.editingUserRoleIndex = -1;
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_GEO_FILTER_TO_TEMP_USER_ROLES_ARR:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters = [...state.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters];
            newState.lists = {...newState.lists};
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters[action.geoRowIndex].entity_type = action.entity_type;
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters[action.geoRowIndex].entity_id = action.entity_id;
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters[action.geoRowIndex].name = action.name;
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters[action.geoRowIndex].full_path_name = action.full_path_name;
            newState.userScreen.addingGeographicalFilter = false;
            newState.userScreen.editingGeographicalFilter = false;
            newState.userScreen.geographicalModalHeader = '';
            newState.userScreen.modalGeographicalFilterRoleIndex = -1;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = '';
            newState.userScreen.geoFilterModalScreen.mainFilterName = '';
            newState.userScreen.geoFilterModalScreen.entityType = -1;
            newState.userScreen.geoFilterModalScreen.entityID = -1;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_GEO_FILTER_TO_NEW_USER_ROLES_TEMP_ARR:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = {...state.selectedUserData.roles_by_user};
            newState.selectedUserData.roles_by_user[action.userRoleIndex] = {...state.selectedUserData.roles_by_user[action.userRoleIndex]};
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters = {...state.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters};
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters[action.geoRowIndex] = {...state.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters[action.geoRowIndex]};
            newState.lists = {...newState.lists};
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters[action.geoRowIndex].name = action.name;
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters[action.geoRowIndex].entity_type = action.entity_type;
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters[action.geoRowIndex].entity_id = action.entity_id;
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters[action.geoRowIndex].full_path_name = action.full_path_name;
            newState.userScreen.addingGeographicalFilter = false;
            newState.userScreen.editingGeographicalFilter = false;
            newState.userScreen.geographicalModalHeader = '';
            newState.userScreen.modalGeographicalFilterRoleIndex = -1;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = '';
            newState.userScreen.geoFilterModalScreen.mainFilterName = '';
            newState.userScreen.geoFilterModalScreen.entityType = -1;
            newState.userScreen.geoFilterModalScreen.entityID = -1;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADD_GEO_FILTER_TO_TEMP_USER_ROLES_ARR:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters = [...state.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters];
            newState.userScreen.geoFilterModalScreen.tempUserRoleGeoFilters.push(action.data);
            newState.userScreen.addingGeographicalFilter = false;
            newState.userScreen.editingGeographicalFilter = false;
            newState.userScreen.geographicalModalHeader = '';
            newState.userScreen.modalGeographicalFilterRoleIndex = -1;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.geoFilterModalScreen.labelName = '';
            newState.userScreen.geoFilterModalScreen.mainFilterName = '';
            newState.userScreen.geoFilterModalScreen.entityType = -1;
            newState.userScreen.geoFilterModalScreen.entityID = -1;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADD_GEO_FILTER_TO_TEMP_ARRAY_OF_USER_ROLES:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.roleUserIndex].geo_filters.push(action.data);
            newState.userScreen.addingGeographicalFilter = false;
            newState.userScreen.editingGeographicalFilter = false;
            newState.userScreen.geographicalModalHeader = '';
            newState.userScreen.modalGeographicalFilterRoleIndex = -1;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = '';
            newState.userScreen.geoFilterModalScreen.mainFilterName = '';
            newState.userScreen.geoFilterModalScreen.entityType = -1;
            newState.userScreen.geoFilterModalScreen.entityID = -1;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_USER_DEP_NAME_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addNewUserRoleScreen.departmentName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_USER_FROM_DATE_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addNewUserRoleScreen.fromDate = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_USER_TO_DATE_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addNewUserRoleScreen.toDate = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_MODAL:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleByUser = true;
            newState.userScreen.confirmDeleteRoleByUserIndex = action.deleteRowIndex;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_GEO_FILTER_MODAL:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleGeoFilterByUser = true;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = action.deleteRowIndex;
            newState.userScreen.editingUserRoleIndex = action.roleRowID;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SHOW_CONFIRM_DELETE_SECTORIAL_FILTER_MODAL:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleSectorialFilterByUser = true;
            newState.userScreen.confirmDeleteRoleSectorialFilterByUserIndex = action.deleteRowIndex;
            newState.userScreen.editingUserRoleIndex = action.roleRowID;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.HIDE_CONFIRM_DELETE_MODAL:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleByUser = false;
            newState.userScreen.confirmDeleteRoleByUserIndex = -1;
            newState.userScreen.confirmDeleteRoleGeoFilterByUser = false;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.confirmDeleteRoleSectorialFilterByUser = false;
            newState.userScreen.confirmDeleteRoleSectorialFilterByUserIndex = -1;
            newState.userScreen.editingUserRoleIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETED_GEO_FILTER_TO_EXISTING_USER_EXISTING_ROLE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleGeoFilterByUser = false;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.editingUserRoleIndex = -1;
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.userRoleIndex].geo_filters = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETED_ROLE_BY_ID:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = action.data;
            newState.userScreen.confirmDeleteRoleByUser = false;
            newState.userScreen.confirmDeleteRoleByUserIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.TOGGLE_PHONE_DELETE_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.showPhoneDeleteModalDialog = !newState.userScreen.showPhoneDeleteModalDialog;
            newState.userScreen.phoneIdInSelectMode = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SET_ROLE_USER_ROW_EDITING:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].is_editing = action.isEditing;
            newState.userScreen.editingUserRole = action.isEditing;
            if (action.isEditing) {
                newState.userScreen.editingUserRoleIndex = action.editRowIndex;
            } else {
                newState.selectedUserData.roles_by_user[action.editRowIndex].module_name = action.moduleName;
                newState.selectedUserData.roles_by_user[action.editRowIndex].name = action.roleName;
                newState.selectedUserData.roles_by_user[action.editRowIndex].team_name = action.teamName;
                newState.selectedUserData.roles_by_user[action.editRowIndex].team_department_name = action.departmentName;
                newState.selectedUserData.roles_by_user[action.editRowIndex].from_date = action.fromDate;
                newState.selectedUserData.roles_by_user[action.editRowIndex].to_date = action.toDate;
                newState.selectedUserData.roles_by_user[action.editRowIndex].main = action.main;
                newState.userScreen.editingUserRoleIndex = -1;
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ROLE_USER_FINISH_EDITING:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = action.data;
            newState.userScreen.editingUserRoleIndex = -1;
            newState.selectedUserData.roles_by_user[action.editRowIndex].is_editing = false;
            newState.userScreen.editingUserRole = false;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_ROLE_MODULE_NAME_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addNewUserRoleScreen.moduleName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_MODULE_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].name = '';
            newState.selectedUserData.roles_by_user[action.editRowIndex].module_name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_ROLE_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_TEAM_NAME_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].team_name = action.data;
            newState.selectedUserData.roles_by_user[action.editRowIndex].team_department_name = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_DEPARTMENT_NAME_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].team_department_name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_FROM_DATE_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].from_date = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADD_NEW_PHONE_TO_TEMP_ARRAY:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones = [...state.selectedUserData.userPhones];
            newState.selectedUserData.userPhones.push({ id: newState.selectedUserData.userPhones.length + 1, name: action.type_name, phone_number: action.phone, key: '' });
            newState.userScreen.addNewUserPhoneScreen = {...state.userScreen.addNewUserPhoneScreen};
            newState.userScreen.addingNewUserPhone = false;
            newState.userScreen.addNewUserPhoneScreen.key = '';
            newState.userScreen.addNewUserPhoneScreen.phone = '';
            newState.userScreen.addNewUserPhoneScreen.type_name = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADD_NEW_ROLE_TO_TEMP_ARRAY:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            //newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            if (newState.selectedUserData.roles_by_user == undefined) {
                newState.selectedUserData.roles_by_user = [];
            }
            let sectorialFilters = [];
            for (let i = 0; i < action.sectorialFilters.length; i++) {
                let filterObjArr = action.sectorialFilters[i].split('~');
                let arrParts = filterObjArr[1].split(';');
                sectorialFilters.push({ id: (i + 1), name: filterObjArr[0], inherited: 0, itemsArr: arrParts })
            }
            let extra_array = action.geoFilters.concat(action.extra_filters);
            newState.selectedUserData.roles_by_user.push({
                id: newState.selectedUserData.roles_by_user.length + 1
                , module_name: action.moduleName
                , name: action.roleName
                , team_name: action.teamName
                , team_department_name: action.depName
                , from_date: action.fromDate
                , to_date: action.toDate
                , geo_filters: extra_array
                , team_geo_filters: action.geoFilters.slice()
                , main: action.isMain
                , sectorial_filters: sectorialFilters

            });
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserRoleScreen = {...state.userScreen.addNewUserRoleScreen};
            newState.userScreen.addingUserRole = false;
            newState.userScreen.addNewUserRoleScreen.roleName = '';
            newState.userScreen.addNewUserRoleScreen.teamName = '';
            newState.userScreen.addNewUserRoleScreen.departmentName = '';
            newState.userScreen.addNewUserRoleScreen.fromDate = getTodaysDate();
            newState.userScreen.addNewUserRoleScreen.toDate = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETE_PHONE_FROM_TEMP_ARRAY:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones = [...state.selectedUserData.userPhones];
            newState.selectedUserData.userPhones.splice(action.data, 1);
            let arrStr1 = '';
            let arrStr2 = '';
            if (newState.originalUserPhones != undefined && newState.selectedUserData.userPhones != undefined) {


                for (let i = 0, len = newState.originalUserPhones.length; i < len; i++) {
                    arrStr1 += newState.originalUserPhones[i].name + newState.originalUserPhones[i].phone_number;
                }
                for (let i = 0, len = newState.selectedUserData.userPhones.length; i < len; i++) {
                    if (newState.selectedUserData.userPhones[i].phone_number.split('-').join('') != '') {
                        arrStr2 += newState.selectedUserData.userPhones[i].name + newState.selectedUserData.userPhones[i].phone_number;
                    }
                }

            }
            if (arrStr1 != arrStr2) {

                newState.dirtyComponents = [...newState.dirtyComponents];
                if (newState.dirtyComponents.indexOf('system.users.phones') == -1) {
                    newState.dirtyComponents.push('system.users.phones');
                }
                newState.dirty = true;
            }

            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETE_ROLE_FROM_TEMP_ARRAY:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user.splice(action.data, 1);
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleByUser = false;
            newState.userScreen.confirmDeleteRoleByUserIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETE_GEO_FILTER_FROM_TEMP_ARRAY_OF_USER_ROLES:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.roleIndex].geo_filters.splice(action.geoIndex, 1);
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleGeoFilterByUser = false;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.editingUserRoleIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETE_SECTORIAL_FILTER_FROM_TEMP_ARRAY_OF_USER_ROLES:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.roleIndex].sectorial_filters.splice(action.rowIndex, 1);
            newState.userScreen = {...state.userScreen};
            newState.userScreen.confirmDeleteRoleSectorialFilterByUser = false;
            newState.userScreen.confirmDeleteRoleSectorialFilterByUserIndex = -1;
            newState.userScreen.editingUserRoleIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_PHONE_FROM_TEMP_ARRAY:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones = [...state.selectedUserData.userPhones];
            for (let i = 0, len = newState.selectedUserData.userPhones.length; i < len; i++) {
                if (newState.selectedUserData.userPhones[i].id == action.row_id) {
                    newState.selectedUserData.userPhones[i].name = action.phone_type;
                    newState.selectedUserData.userPhones[i].phone_number = action.phone_number;
                    newState.userScreen.phoneIdInSelectedMode = action.userPhoneID || null;
                    newState.userScreen.isPhoneInEditMode = false;
                    newState.userScreen.phoneNumberTypeBeingEdited = action.phoneTypeName || '';
                    newState.userScreen.phoneNumberBeingEdited = action.phoneNumber || '';
                    break;
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SAVE_USER_ROLE_TO_TEMP_ARRAY:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            for (let i = 0, len = newState.selectedUserData.roles_by_user.length; i < len; i++) {
                if (newState.selectedUserData.roles_by_user[i].id == action.row_id) {
                    newState.selectedUserData.roles_by_user[i].module_name = action.moduleName;
                    newState.selectedUserData.roles_by_user[i].name = action.roleName;
                    newState.selectedUserData.roles_by_user[i].main = action.isMain;
                    newState.selectedUserData.roles_by_user[i].team_name = action.teamName;
                    newState.selectedUserData.roles_by_user[i].team_department_name = action.depName;
                    newState.selectedUserData.roles_by_user[i].geo_filters = action.geoFilters;
                    newState.selectedUserData.roles_by_user[i].from_date = action.fromDate;
                    newState.selectedUserData.roles_by_user[i].to_date = action.toDate;
                    break;
                }
            }
            newState.userScreen.editingUserRoleIndex = -1;
            newState.selectedUserData.roles_by_user[action.editRowIndex].is_editing = false;
            newState.userScreen.editingUserRole = false;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_TO_DATE_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].to_date = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EXISTING_USER_PHONE_NUMBER_CHANGED:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones[action.rowIndex].phone_number = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EXISTING_USER_PHONE_NUMBER_TYPE_CHANGED:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones[action.rowIndex].name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.LOADED_PHONE_TYPES:
            var newState = {...state};
            newState.phoneTypes = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.EDIT_IS_MAIN_CHANGE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.editRowIndex].main = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.LOADED_CURRENT_CAMPAIGN:
            var newState = {...state};
            newState.currentCampaign = action.campaign;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SET_ADDING_NEW_PHONE:
            var newState = {...state};
            //newState.userScreen = {...state.userScreen};
            newState.selectedUserData = {...state.selectedUserData};
            let phoneType = newState.phoneTypes.find((item) => { return item.id == constants.phone_types.mobile })
            newState.selectedUserData.userPhones.push({ id: (-10000 + newState.selectedUserData.userPhones.length), name: phoneType.name, phone_number: '', phone_type_id: phoneType.id, key: '' });
            // newState.userScreen.addingNewUserPhone = true;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_USER_PHONE_TYPE_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserPhoneScreen = {...state.userScreen.addNewUserPhoneScreen};
            newState.userScreen.addNewUserPhoneScreen.type_name = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.NEW_USER_PHONE_NUMBER_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserPhoneScreen = {...state.userScreen.addNewUserPhoneScreen};
            newState.userScreen.addNewUserPhoneScreen.phone = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.CLOSE_ADDING_NEW_PHONE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserPhoneScreen = {...state.userScreen.addNewUserPhoneScreen};
            newState.userScreen.addingNewUserPhone = false;
            newState.userScreen.addNewUserPhoneScreen.phone = '';
            newState.userScreen.addNewUserPhoneScreen.type_name = '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADDED_NEW_PHONE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addNewUserPhoneScreen = {...state.userScreen.addNewUserPhoneScreen};
            newState.userScreen.addingNewUserPhone = false;
            newState.userScreen.addNewUserPhoneScreen.phone = '';
            newState.userScreen.addNewUserPhoneScreen.type_name = '';
            newState.selectedUserData.userPhones = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.OPEN_MISSING_USER_ROLES:
            var newState = {...state};
            newState.userScreen.modalHeaderText = 'שגיאה';
            newState.userScreen.modalContentText = 'יש לבחור לפחות תפקיד אחד למשתמש';
            newState.userScreen.showModalDialog = true;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.DELETED_USER_PHONE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.UPDATED_USER_PHONE:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.userPhones = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_PHONE_EDIT_MODE_UPDATED:
            var newState = {...state};
            newState.userScreen.phoneIdInSelectedMode = action.userPhoneID || null;
            newState.userScreen.isPhoneInEditMode = (undefined != action.userPhoneID) ? true : false;
            newState.dirty = (undefined != action.userPhoneID) ? true : false;
            newState.userScreen.phoneNumberTypeBeingEdited = action.phoneTypeName || '';
            newState.userScreen.phoneNumberBeingEdited = action.phoneNumber || '';
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.USER_ROLE_ADDED_SECTORIAL_FILTER:
            var newState = {...state};
            newState.selectedUserData = {...state.selectedUserData};
            newState.selectedUserData.roles_by_user = [...state.selectedUserData.roles_by_user];
            newState.selectedUserData.roles_by_user[action.roleUserIndex].sectorial_filters = action.data;
            return newState;
            break;
        /*End load cities array*/
        case SystemActions.ActionTypes.LOADED_GENERAL_CITIES:
            var newState = {...state};
            newState.cities = action.cities;
            return newState;
            break;
		/*End load areas array*/
        case SystemActions.ActionTypes.LOADED_GENERAL_AREAS:
            var newState = {...state};
            newState.areas = action.areas;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_ROLE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            if (action.isAddingRole == 1) { //add new geo-filter
                newState.userScreen.addingGeographicalFilter = true;
                newState.userScreen.editingGeographicalFilter = false;
                newState.userScreen.geographicalModalHeader = 'הוספת פילטר גיאוגרפי חדש';
                newState.userScreen.modalGeographicalFilterRoleIndex = action.roleUserIndex;
                newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
                newState.userScreen.geoFilterModalScreen.labelName = '';
            } else { // edit existing geo-filter
                newState.userScreen.addingGeographicalFilter = false;
                newState.userScreen.editingGeographicalFilter = true;
                newState.userScreen.geographicalModalHeader = 'עריכת פילטר גיאוגרפי קיים';
                newState.userScreen.modalGeographicalFilterRoleIndex = action.roleUserIndex;
                newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = action.geoRowIndex;
                newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
                newState.userScreen.geoFilterModalScreen.labelName = action.labelName;
                newState.userScreen.geoFilterModalScreen.mainFilterName = action.selectedGeoFilter;
                newState.userScreen.geoFilterModalScreen.entityType = action.entityType;
                newState.userScreen.geoFilterModalScreen.entityID = action.entityID
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.ADD_NEW_GEO_FILTER_TO_TEMP_ROLE_ARRAY:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            if (action.isAddingRole == 1) { //add new geo-filter
                newState.userScreen.addingGeographicalFilter = true;
                newState.userScreen.editingGeographicalFilter = false;
                newState.userScreen.geographicalModalHeader = 'הוספת פילטר גיאוגרפי חדש';
                newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
                newState.userScreen.geoFilterModalScreen.labelName = '';
                //newState.userScreen.modalGeographicalFilterRoleIndex = action.roleUserIndex;
            } else { // edit existing geo-filter
                newState.userScreen.addingGeographicalFilter = false;
                newState.userScreen.editingGeographicalFilter = true;
                newState.userScreen.geographicalModalHeader = 'עריכת פילטר גיאוגרפי קיים';
                newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = action.geoRowIndex;
                newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
                newState.userScreen.geoFilterModalScreen.labelName = action.labelName;
                newState.userScreen.geoFilterModalScreen.mainFilterName = action.selectedGeoFilter;
                newState.userScreen.geoFilterModalScreen.entityType = action.entityType;
                newState.userScreen.geoFilterModalScreen.entityID = action.entityID

            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CHANGED:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.mainFilterName = action.data;
            newState.userScreen.geoFilterModalScreen.entityType = action.entity_type;
            newState.userScreen.geoFilterModalScreen.entityID = action.entity_id;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CITY_NAME_CHANGED:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.cityName = action.data;
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_NEIGHBORHOOD_NAME_CHANGED:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.neighborhoodName = action.data;
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_CLUSTER_NAME_CHANGED:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.clusterName = action.data;
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_BALLOT_NAME_CHANGED:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.ballotName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.SHOW_HIDE_COPY_VOTER_DETAILS_DLG:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.showCopyDialog = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.MAIN_MODAL_GEO_FILTER_LABEL_NAME_CHANGED:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_CITIES_BY_AREA_AND_SUB_AREA:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.cities = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_CITIES_BY_AREA:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.cities = action.data;
            if (action.originalEntityID != undefined) {
                for (let i = 0; i < newState.userScreen.geoFilterModalScreen.cities.length; i++) {
                    if (newState.userScreen.geoFilterModalScreen.cities[i].id == action.originalEntityID) {
                        newState.userScreen.geoFilterModalScreen.cityName = newState.userScreen.geoFilterModalScreen.cities[i].name;
                        break;
                    }
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_INITIAL_CITIES:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.initialCities = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_NEIGHBORHOODS_BY_CITY:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            if (action.data.length > 0) {
                newState.userScreen.geoFilterModalScreen.neighborhoods = action.data;
            } else {
                newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            }
            if (action.originalEntityID != undefined) {
                for (let i = 0; i < newState.userScreen.geoFilterModalScreen.neighborhoods.length; i++) {
                    if (newState.userScreen.geoFilterModalScreen.neighborhoods[i].id == action.originalEntityID) {
                        newState.userScreen.geoFilterModalScreen.neighborhoodName = newState.userScreen.geoFilterModalScreen.neighborhoods[i].name;
                        break;
                    }
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_CLUSTERS_BY_NEIGHBORHOOD:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            if (action.data.length > 0) {
                newState.userScreen.geoFilterModalScreen.clusters = action.data;
            } else {
                newState.userScreen.geoFilterModalScreen.clusters = [];
            }
            if (action.originalEntityID != undefined) {
                for (let i = 0; i < newState.userScreen.geoFilterModalScreen.clusters.length; i++) {
                    if (newState.userScreen.geoFilterModalScreen.clusters[i].id == action.originalEntityID) {
                        newState.userScreen.geoFilterModalScreen.clusterName = newState.userScreen.geoFilterModalScreen.clusters[i].name;
                        break;
                    }
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_BALLOTS_BY_CLUSTER:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            if (action.data.length > 0) {
                newState.userScreen.geoFilterModalScreen.ballots = action.data;
            } else {
                newState.userScreen.geoFilterModalScreen.ballots = [];
            }
            if (action.originalEntityID != undefined && action.setClusterName) {
                for (let i = 0; i < newState.userScreen.geoFilterModalScreen.ballots.length; i++) {
                    if (newState.userScreen.geoFilterModalScreen.ballots[i].id == action.originalEntityID) {
                        newState.userScreen.geoFilterModalScreen.ballotName = newState.userScreen.geoFilterModalScreen.ballots[i].name;
                        break;
                    }
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.GEO_FILTER_LOADED_CLUSTERS_BY_CITY:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            if (action.data != undefined && action.data.length > 0) {
                newState.userScreen.geoFilterModalScreen.clusters = action.data;
            } else {
                newState.userScreen.geoFilterModalScreen.clusters = [];
            }
            if (action.originalEntityID != undefined && action.setClusterName) {
                for (let i = 0; i < newState.userScreen.geoFilterModalScreen.clusters.length; i++) {
                    if (newState.userScreen.geoFilterModalScreen.clusters[i].id == action.originalEntityID) {
                        newState.userScreen.geoFilterModalScreen.clusterName = newState.userScreen.geoFilterModalScreen.clusters[i].name;
                        break;
                    }
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.CLOSE_GEO_FILTER_DIALOG:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.addingGeographicalFilter = false;
            newState.userScreen.editingGeographicalFilter = false;
            newState.userScreen.geographicalModalHeader = '';
            newState.userScreen.modalGeographicalFilterRoleIndex = -1;
            newState.userScreen.confirmDeleteRoleGeoFilterByUserIndex = -1;
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = '';
            newState.userScreen.geoFilterModalScreen.areaName = '';
            newState.userScreen.geoFilterModalScreen.subAreaName = '';
            newState.userScreen.geoFilterModalScreen.mainFilterName = '';
            newState.userScreen.geoFilterModalScreen.entityType = -1;
            newState.userScreen.geoFilterModalScreen.entityID = -1;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.USERS.UNLOCK_USER:
            var newState = {...state};

            newState.selectedUserData = {...newState.selectedUserData}
            newState.selectedUserData.is_user_locked = false;
            return newState;
        case SystemActions.ActionTypes.RESET_TEAM_HANDLERS:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.minimalTeams = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.LOADED_TEAMS:
            var newState = {...state};
            newState.teams = action.teams;
            return newState;
            break;
        case SystemActions.ActionTypes.RESET_USER_HANDLERS:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.minimalUsers = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.LOADED_MINIMAL_TEAMS:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.minimalTeams = action.teams;
            if (action.setStaticTeams) {
                newState.teamsScreen.staticTeams = action.teams.slice(0);
            }
            return newState;
            break;
        case SystemActions.ActionTypes.LOADED_ROLES:
            var newState = {...state};
            newState.roles = action.roles;
            return newState;
            break;
        /*
         * User home page dispatch stuff.
         */
        case SystemActions.ActionTypes.USER_HOME.LOADED_SUMMARY:
            var newState = {...state};
            var crmHomeScreen = {...newState.crmHomeScreen};
            var summaryCount = {...newState.crmHomeScreen.summaryCount};
            let closedBeforeTargetDate = 0;
            summaryCount.new = 0;
            summaryCount.inTherapy = 0;
            summaryCount.open = 0;
            summaryCount.closed = 0;
            summaryCount.passedToMe = 0;
            summaryCount.exceedCloseDate = 0;
            summaryCount.IPassedOver = 0;

            _.forEach(action.result, function (req) {//requests user created and passed over to others
                if (req.displayGroups.indexOf('IPassedOver') > -1) {
                    summaryCount.IPassedOver += 1;
                } else {//requests user handle
                    summaryCount.new += (req.displayGroups.indexOf('new') > -1 ? 1 : 0);
                    summaryCount.inTherapy += (req.displayGroups.indexOf('inTherapy') > -1 ? 1 : 0);
                    summaryCount.open += (req.displayGroups.indexOf('open') > -1 ? 1 : 0);
                    summaryCount.closed += (req.displayGroups.indexOf('closed') > -1 ? 1 : 0);
                    summaryCount.passedToMe += (req.displayGroups.indexOf('passedToMe') > -1 ? 1 : 0);
                    summaryCount.exceedCloseDate += (req.displayGroups.indexOf('exceedCloseDate') > -1 ? 1 : 0);

                    closedBeforeTargetDate += (req.displayGroups.indexOf('closed') > -1 && req.closedBeforeTargetDate) ? 1 : 0;
                }
            });

            crmHomeScreen.averageHandleTime = summaryCount.closed >= 5 ? ((1 - closedBeforeTargetDate / summaryCount.closed) * 100) : 0;
            newState.crmHomeScreen = crmHomeScreen;
            newState.crmHomeScreen.summaryCount = summaryCount;
            newState.crmHomeScreen.summaryData = action.result;
            return newState;
            break;

        case SystemActions.ActionTypes.USER_HOME.ORDER_RESULTS:
            var newState = {...state};
            var crmHomeScreen = {...newState.crmHomeScreen};
            var summaryData = [...crmHomeScreen.summaryData];

            crmHomeScreen.orderColumn = action.orderColumn || crmHomeScreen.orderColumn;
            var sortDirection = crmHomeScreen.isOrderedAsc ? 'asc' : 'desc';
            summaryData.sort(arraySort(sortDirection, crmHomeScreen.orderColumn));

            crmHomeScreen.summaryData = summaryData;
            crmHomeScreen.isOrderedAsc = !crmHomeScreen.isOrderedAsc;

            newState.crmHomeScreen = crmHomeScreen;
            return newState;
            break;

        case SystemActions.ActionTypes.USER_HOME.UPDATE_UNREAD_REQUESTS_COUNT:
            var newState = {...state};
            var crmHomeScreen = {...newState.crmHomeScreen};
            crmHomeScreen.unreadRequestsCount = action.unreadRequestsCount;
            newState.crmHomeScreen = crmHomeScreen;
            return newState;
            break;

        case SystemActions.ActionTypes.USER_HOME.CHANGE_DISPLAYED_RESULTS:
            var newState = {...state};
            var crmHomeScreen = {...newState.crmHomeScreen};
            crmHomeScreen.summaryDisplayTarget = action.displayTarget;
            crmHomeScreen.openRequests = {};
            newState.crmHomeScreen = crmHomeScreen;
            return newState;
            break;

        case SystemActions.ActionTypes.USER_HOME.OPEN_REQUEST:
            var newState = {...state};
            var openRequests = {...newState.crmHomeScreen.openRequests};

            if (openRequests[action.requestKey]) {
                delete openRequests[action.requestKey];
            } else {
                openRequests[action.requestKey] = true;
            }
            newState.crmHomeScreen.openRequests = openRequests;
            return newState;
            break;

        case SystemActions.ActionTypes.LOADED_MODULES:
            var newState = {...state};
            newState.modules = action.modules;
            return newState;
            break;
        case SystemActions.ActionTypes.EXAMPLES.LOAD_DND_SORT_ITEMS:
            var newState = {...state};
            newState.examples = {...newState.examples};
            newState.examples.dndSortScreen = {...newState.examples.dndSortScreen};
            newState.examples.dndSortScreen.items = action.cities.slice(10, 20);
            return newState;
            break;
        case SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS:
            var newState = {...state};
            newState.examples = {...newState.examples};
            newState.examples.dndSortScreen = {...newState.examples.dndSortScreen};
            newState.examples.dndSortScreen.items = [...newState.examples.dndSortScreen.items];
            var items = newState.examples.dndSortScreen.items;
            if (newState.examples.dndSortScreen.originalItems.length == 0)
                newState.examples.dndSortScreen.originalItems = [...items];
            var extractedItem = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].city_key == action.fromItem.city_key) {
                    extractedItem = (items.splice(i, 1))[0];
                    break;
                }
            }
            for (var i = 0; i < items.length; i++) {
                if (items[i].city_key == action.toItem.city_key) {
                    if (action.before)
                        items.splice(i, 0, extractedItem);
                    else
                        items.splice(i + 1, 0, extractedItem);
                    break;
                }
            }
            return newState;
            break;
        case SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS_REVERT_TO_ORIGINAL:
            var newState = {...state};
            newState.examples = {...newState.examples};
            newState.examples.dndSortScreen = {...newState.examples.dndSortScreen};
            if (newState.examples.dndSortScreen.originalItems.length > 0) {
                newState.examples.dndSortScreen.items = [...newState.examples.dndSortScreen.originalItems];
                newState.examples.dndSortScreen.originalItems = [];
            }
            return newState;
            break;
        case SystemActions.ActionTypes.EXAMPLES.SORT_ITEMS_DROP:
            var newState = {...state};
            newState.examples = {...newState.examples};
            newState.examples.dndSortScreen = {...newState.examples.dndSortScreen};
            newState.examples.dndSortScreen.originalItems = [];
            return newState;
            break;

        case SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_NAME:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};

            if (typeof action.data === 'object') {
                if ((action.data.leader_id != null) && (action.data.leader_id > 0)) newState.teamsScreen.teamLeaderId = action.data.leader_id;
                else newState.teamsScreen.teamLeaderId = null;
                newState.teamsScreen.editTeamName = action.data.name;
                newState.teamsScreen.viewable = action.data.viewable;
                newState.teamsScreen.crm_center = action.data.crm_center;
                newState.teamsScreen.signature = action.data.signature;
                newState.teamsScreen.phone_number = action.data.phone_number;
                newState.teamsScreen.title = action.data.title;
                newState.teamsScreen.editTeamLeaderFullName = (action.data.leader_name != undefined) ? action.data.leader_name : '';
                newState.teamsScreen.editTeamLeaderID = action.data.leader_id;
                newState.teamsScreen.teamLeadersHistory = action.data.leaders_history;
                newState.teamsScreen.teamDepartments = action.data.team_departments;
                newState.teamsScreen.teamMembers = action.data.total_roles;
                newState.teamsScreen.minimalTeamMembers = [];
                if (newState.teamsScreen.teamMembers != undefined && newState.teamsScreen.teamMembers != null) {
                    for (let i = 0, len = newState.teamsScreen.teamMembers.length; i < len; i++) {
                        let foundCounter = 0;
                        for (let j = 0; j < newState.teamsScreen.minimalTeamMembers.length; j++) {
                            if (newState.teamsScreen.teamMembers[i].personal_identity == newState.teamsScreen.minimalTeamMembers[j].personal_identity) {
                                foundCounter++;
                                break;
                            }
                        }
                        if (foundCounter == 0) {
                            newState.teamsScreen.teamMembers[i].name = newState.teamsScreen.teamMembers[i].first_name + ' ' + newState.teamsScreen.teamMembers[i].last_name;
                            newState.teamsScreen.minimalTeamMembers.push(newState.teamsScreen.teamMembers[i]);
                        }
                    }
                }

                newState.teamsScreen.geoTemplates = action.data.geographic_templates;
                newState.teamsScreen.sectorialTemplates = action.data.sectorial_templates;

            } else {
                newState.teamsScreen.editTeamName = action.data;
            }
            return newState;
            break;

        case SystemActions.ActionTypes.TEAMS.INIT_TEAM_SCREEN:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.tab = 'team_members';

            newState.teamsScreen.editTeamName = '';
            newState.teamsScreen.teamLeaderId = null;
            newState.teamsScreen.editTeamLeaderFullName = '';
            newState.teamsScreen.editTeamLeaderID = -1;
            newState.teamsScreen.teamLeadersHistory = [];
            newState.teamsScreen.teamDepartments = [];
            newState.teamsScreen.teamMembers = [];
            newState.teamsScreen.geoTemplates = [];
            newState.teamsScreen.sectorialTemplates = [];
            newState.teamsScreen.minimalTeamMembers = [];

            return newState;
            break;

        case SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_TEXT_NAME:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.editTeamName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.CHANGE_TEAM_FIELD:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};

            newState.teamsScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.LOADED_MINIMAL_DATA:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            if (action.setStaticData == true) {
                newState.teamsScreen.staticUsers = action.data.slice(0);
            } else {
                newState.teamsScreen.minimalUsers = action.data;
            }

            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.CHANGE_CHOOSE_TEAM_USER_LEADER:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.editTeamLeaderFullName = (action.value != undefined) ? action.value : '';
            newState.teamsScreen.teamLeaderId = (action.selectedItem != undefined) ? action.selectedItem.user_id : null;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.GEO_FILTER_COLLAPSE_CHANGE:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.geoFilterOpened = !newState.teamsScreen.geoFilterOpened;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SECTORIAL_FILTER_COLLAPSE_CHANGE:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.sectorialFilterOpened = !newState.teamsScreen.sectorialFilterOpened;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_ADD_NEW_GEO_TPL_MODAL:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.geographicalModalHeader = 'הוספת תבנית גיאוגרפית חדשה';
            newState.teamsScreen.addingTeamGeoTemplate = true;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_ADD_NEW_SECTORIAL_TPL_MODAL:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.sectorialModalHeader = 'הוספת תבנית מגזרית חדשה';
            newState.teamsScreen.addingTeamSectorialTemplate = true;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_EDIT_GEO_TPL_MODAL:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.geographicalModalHeader = 'עריכת תבנית גיאוגרפית קיימת';
            newState.teamsScreen.editingTeamGeoTemplate = true;
            newState.teamsScreen.editingTeamGeoTemplateIndex = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.SHOW_EDIT_SECTORIAL_TPL_MODAL:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.sectorialModalHeader = 'עריכת תבנית מגזרית קיימת';
            newState.teamsScreen.editingTeamSectorialTemplate = true;
            newState.teamsScreen.editingTeamSectorialTemplateIndex = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.HIDE_ADD_NEW_GEO_TPL_MODAL:
            var newState = {...state};
            newState.lists = {...newState.lists};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.geographicalModalHeader = '';
            newState.teamsScreen.addingTeamGeoTemplate = false;
            newState.teamsScreen.editingTeamGeoTemplate = false;
            newState.teamsScreen.editingTeamGeoTemplateIndex = -1;
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = '';
            newState.userScreen.geoFilterModalScreen.areaName = '';
            newState.userScreen.geoFilterModalScreen.subAreaName = '';
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            newState.lists.subAreas = [];
            newState.userScreen.geoFilterModalScreen.cities = [...newState.userScreen.geoFilterModalScreen.initialCities];
            newState.userScreen.geoFilterModalScreen.neighborhoods = [];
            newState.userScreen.geoFilterModalScreen.clusters = [];
            newState.userScreen.geoFilterModalScreen.ballots = [];
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.HIDE_ADD_NEW_SECTORIAL_TPL_MODAL:
            var newState = {...state};
            newState.teamsScreen = {...state.teamsScreen};
            newState.teamsScreen.filterNameHeader = '';
            newState.teamsScreen.addingTeamSectorialTemplate = false;
            newState.teamsScreen.editingTeamSectorialTemplate = false;
            //newState.teamsScreen.editingTeamGeoTemplateIndex = -1;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_LABEL_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.labelName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_SUB_AREA_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.subAreaName = action.data;
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.areaName = action.data;
            if (action.resetSubAreas != '0') {
                newState.userScreen.geoFilterModalScreen.subAreaName = '';
            }
            newState.userScreen.geoFilterModalScreen.cityName = '';
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_AREA_GROUP_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.areaGroupName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CITY_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.cityName = action.data;
            newState.userScreen.geoFilterModalScreen.neighborhoodName = '';
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_NEIGHBORHOOD_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.neighborhoodName = action.data;
            newState.userScreen.geoFilterModalScreen.clusterName = '';
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_CLUSTER_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.clusterName = action.data;
            newState.userScreen.geoFilterModalScreen.ballotName = '';
            return newState;
            break;
        case SystemActions.ActionTypes.TEAMS.NEW_GEO_TPL_BALLOT_CHANGE:
            var newState = {...state};
            newState.userScreen = {...state.userScreen};
            newState.userScreen.geoFilterModalScreen = {...state.userScreen.geoFilterModalScreen};
            newState.userScreen.geoFilterModalScreen.ballotName = action.data;
            return newState;
            break;
        case SystemActions.ActionTypes.RESET_BREADCRUMBS:
            var newState = {...state};
            newState.breadcrumbs = [{ url: './', title: 'דף הבית', elmentType: 'home' }];
            return newState;
            break;
        case SystemActions.ActionTypes.UPDATE_BREADCRUMBS:
            var newState = {...state};
            var breadcrumbs = [...newState.breadcrumbs];
            let lastBreadcrumbsIndex = breadcrumbs.length - 1;
            breadcrumbs[lastBreadcrumbsIndex] = {...breadcrumbs[lastBreadcrumbsIndex]};
            breadcrumbs[lastBreadcrumbsIndex].title = action.title;
            newState.breadcrumbs = breadcrumbs;
            return newState;
            break;
        case SystemActions.ActionTypes.ADD_BREADCRUMBS:
            var newState = {...state};
            newState.breadcrumbs = [...newState.breadcrumbs, action.newLocation];
            return newState;
            break;
			
		/*
		   Handles loading all user geographic filtered lists from api :
		*/	
		 case SystemActions.ActionTypes.LOADED_CURRENT_USER_GEOGRAPHIC_FILTERED_LISTS:
            var newState = {...state};
            newState.currentUserGeographicalFilteredLists = {...newState.currentUserGeographicalFilteredLists};
            newState.currentUserGeographicalFilteredLists.areas = action.data.areas;
            newState.currentUserGeographicalFilteredLists.sub_areas = action.data.sub_areas;
            newState.currentUserGeographicalFilteredLists.cities = action.data.cities;
            return newState;
            break;

		/*
		   Handles loading all file groups and files inside them :
		*/	
		 case SystemActions.ActionTypes.FILES.LOADED_FILES_AND_GROUPS_DATA:
			var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.filesInGroups = [...state.filesScreen.filesInGroups];
            newState.filesScreen.filesInGroups = action.data;
            return newState;
            break;
		
		/*
		   Handles changing global field in the system/files screen 
		   
		   @param fieldName
		   @param fieldValue
		*/	
		 case SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;
			
		/*
		   Shows/hides screen of adding/editing file group by params 
		   
		   @param screenValues
		*/	
		 case SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE_GROUP:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.addEditFileGroupScreen = {...state.filesScreen.addEditFileGroupScreen};
			for (key in action.screenValues){
			    newState.filesScreen.addEditFileGroupScreen[key] = action.screenValues[key];
			}
            return newState;
            break;
		 case SystemActions.ActionTypes.FILES.NEW_FILE_GROUP_ADD:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.addEditFileGroupScreen = {...state.filesScreen.addEditFileGroupScreen};
			for (key in action.screenValues){
			    newState.filesScreen.addEditFileGroupScreen[key] = action.screenValues[key];
			}
            return newState;
            break;
			
		
			/*
		   Handles changing  field in add/edit file-group screen
		   
		   @param fieldName
		   @param fieldValue
		*/	
		 case SystemActions.ActionTypes.FILES.FILE_GROUP_SCREEN_FIELD_CHANGE:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.addEditFileGroupScreen = {...state.filesScreen.addEditFileGroupScreen};
			newState.filesScreen.addEditFileGroupScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;
			
		/*
		   Handles adding/deleting/editing file group row
		   
		   @param actionName
		   @param data
		*/	
		 case SystemActions.ActionTypes.FILES.MODIFY_FILE_GROUPS_ARRAY:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.filesInGroups = [...state.filesScreen.filesInGroups];
			if(action.actionName == 'add'){
				newState.filesScreen.filesInGroups.push(action.data);
			}
			else if(action.actionName == 'delete'){
				newState.filesScreen.filesInGroups.splice(action.data , 1);
			}
			else if(action.actionName == 'edit'){
				newState.filesScreen.filesInGroups[action.updateArrayIndex] = {...newState.filesScreen.filesInGroups[action.updateArrayIndex]};
				newState.filesScreen.filesInGroups[action.updateArrayIndex].name = action.data.name;
				newState.filesScreen.filesInGroups[action.updateArrayIndex].modules = action.data.module_items;
			}
            return newState;
            break;
			
		/*
		   Shows/hides screen of adding/editing FILE by params 
		   
		   @param screenValues
		*/	
		 case SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
            newState.filesScreen.addEditFileScreen = {...state.filesScreen.addEditFileScreen};
            if(action.screenValues.fileGroupIndex === null){
                action.screenValues.fileGroupIndex = newState.filesScreen.filesInGroups.length - 1;
            }
			for (key in action.screenValues){
			    newState.filesScreen.addEditFileScreen[key] = action.screenValues[key];
			}
            return newState;
            break;
			
		/*
		   Handles changing  field in add/edit FILE screen
		   
		   @param fieldName
		   @param fieldValue
		*/	
		 case SystemActions.ActionTypes.FILES.FILE_SCREEN_FIELD_CHANGE:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.addEditFileScreen = {...state.filesScreen.addEditFileScreen};
			newState.filesScreen.addEditFileScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;
			
			
			/*
		   Handles adding/deleting/editing FILE row
		   
		   @param actionName
		   @param data
		*/	
		 case SystemActions.ActionTypes.FILES.MODIFY_FILES_ARRAY:
		    var newState = {...state};
            newState.filesScreen = {...state.filesScreen};
			newState.filesScreen.filesInGroups = [...state.filesScreen.filesInGroups];
			newState.filesScreen.filesInGroups[action.fileGroupIndex] = {...newState.filesScreen.filesInGroups[action.fileGroupIndex]};
			newState.filesScreen.filesInGroups[action.fileGroupIndex].files = [...newState.filesScreen.filesInGroups[action.fileGroupIndex].files];
			if(action.actionName == 'add'){
				newState.filesScreen.filesInGroups[action.fileGroupIndex].files.push(action.data);
			}
			else if(action.actionName == 'delete'){
				newState.filesScreen.filesInGroups[action.fileGroupIndex].files.splice(action.fileDeleteIndex , 1);
			}
			else if(action.actionName == 'edit'){
				newState.filesScreen.filesInGroups[action.fileGroupIndex].files[action.updateArrayIndex] = {...newState.filesScreen.filesInGroups[action.fileGroupIndex].files[action.updateArrayIndex]};
                if(action.name){
					newState.filesScreen.filesInGroups[action.fileGroupIndex].files[action.updateArrayIndex].name = action.name;
				}
				if(action.file_type){
					newState.filesScreen.filesInGroups[action.fileGroupIndex].files[action.updateArrayIndex].type = action.file_type;
				}
				if(action.file_size){
					newState.filesScreen.filesInGroups[action.fileGroupIndex].files[action.updateArrayIndex].size = action.file_size;
				}
				if(action.file_name){
					newState.filesScreen.filesInGroups[action.fileGroupIndex].files[action.updateArrayIndex].file_name = action.file_name;
				}
				 
			}
            return newState;
            break;

        case SystemActions.ActionTypes.MAINTENANCE_MODE:
            var newState = {...state};
            newState.maintenanceMode = true;
            return newState;
            break;	

        case SystemActions.ActionTypes.MAINTENANCE_DATE:
            var newState = {...state};
            newState.maintenanceDate = action.maintenanceDate;
            return newState;
            break;          
        case SystemActions.ActionTypes.SET_AUDIO_STATE:
            var newState = { ...state };
            newState.existAudioInput = action.existAudioInput;
            return newState;	
        default:
            return state;
            break;
    }
}

export default systemReducer
