import * as VoterActions from '../actions/VoterActions';
import _ from 'lodash';
import moment from 'moment';

import { parseDateToPicker } from '../libs/globalFunctions';
import { arraySort } from '../libs/globalFunctions';

const initialState = {

    showModalWindow: false,
    modalHeaderText: '',
    modalContentText: '',
    searchVoterScreen: {
        /*
         * Call "parameters" for this component.
         */
        returnUrl: '',
        returnButtonText: 'פתח פנייה',
        cityStreets: [],
        searchVoterLevel: { 'base': true, 'advanced': false, 'ballot': false },
        advancedSearchParams: { house_number: '', age_min: '', age_max: '', father_first_name: '', birth_year: '' },
        searchForParams: {
            personal_identity: '',
            voter_key: '',
            phone: '',
            first_name: '',
            last_name: '',
            city: [],
            street: [],
            house_number: '',
            age_min: '',
            age_max: '',
            father_first_name: '',
            birth_year: '',
        },
        searchForErrorMsg: {
            personal_identity: '',
            voter_key: '',
            phone: '',
            first_name: '',
            last_name: '',
            city: '',
            street: '',
            house_number: '',
            age_min: '',
            age_max: '',
            father_first_name: '',
            birth_year: ''
        },
        searchCityInputValue: '',
        searchStreetInputValue: '',
        searchVoterResult: [],
        searchVoterDetails: {},
        showEmptyFilterPanel: false,
        disallowBirthYear: false,
        disallowAgeLimit: false,
        disableNewSearch: false,
        isMaximumExecutionTime: false,
        cleanMultiCombo: false,
        selectedVoterForRedirect: {},
        selectedVoter: [],
        supportStatuses: [],

        voterElectionCampaigns: [],
        currentVoterSupportData: [],

        /*
         * Infinite scroll stuff.
         */
        searchVoterLoading: false,
        searchVoterCurrentPage: 0,
        searchVoterHasMore: true,
        searchVoterCount: 0,
        searchVoterIsScroll: false,
    },

    searchActivistScreen: {
        personal_identity: '',
        first_name: '',
        last_name: '',
        city: '',
        phone_number: '',
        street: '',
        activist_type: '',
        results: { total_records: 0,isThereMoreData: false, data: [] },
        resultsPageIndex: 0,
        isSearching: false,
        showErrorModal: false,
        showErrorModalTitle: '',
        showErrorModalContent: '',
        showAddNewVoterActivistRole: false,
        showEditExistingVoterActivistRole: false,
        addNewActivistRoleScreen: {
            voter_key: '',
            role_row_index: -1,
            voterMobileNumber: '',
            role_name: '',
            phone_number: '',
            sum: '',
            comment: '',
        },
        showBottomError: false,
        tableHasScrollbar: false,
    },

    voterActivistHouseholdsScreen: {
        id: '',
        key: '',
        personal_identity: '',
        first_name: '',
        last_name: '',
        address: '',
        creating_user: '',
        created_at: '',
        comment: '',
        sum: '',
        phone_number: '',
        activistHouseholdTab: '',
        is_minister_of_fifty: true,
        households: [],
        detailedHouseholds: [],
        showConfirmDelete: false,
        deleteRowIndex: -1,
    },

    searchVoterResultHaveToScroll: false,

    voterScreen: {
        tabLeft: '',
        tabLowerFrame: '',

        // The voter selected tab
        voterTab: '',

        // The voter tab section redirected
        // from non voter screen
        voterTabSection: '',

        // A boolean which indicates
        // if there is redirection
        // from screen which is not
        // a voter's screen
        redirectToTabSection: false,

        // A boolean which indicates
        // if there is redirection
        // to new action
        redirectToNewAction: false,

        // A boolean which indicates
        // if there is redirection
        // to new document
        redirectToNewDocument: false,

        // Statuses for collapse
        containerCollapseStatus: {
            infoDetails: false,
            infoContact: false,
            infoAddress: false,
            infoUser: false,
            infoAdditionalData: false,

            partyInstitutes: false,
            partyGroups: false,
            partyRepresentative: false,

            supportElectionsSupport: false,
            supportElectionsActivity: false,
            supportElectionsBallot: false
        },

        // Describes the state of saving data
        savingVoterData: false,

        // A boolean which indicates whether
        // the voter details have been loaded
        loadedVoter: false,

        // A boolean which indicates whether
        // the voter details are being loaded
        loadingVoter: false,

        // A boolean which indicates whether
        // the voter elections campaigns is
        // being loaded
        loadedVoterElectionCampaigns: false,

        // A boolean which indicates whether
        // to show a Modal which contains
        // voters with the same phones as
        // the current voter
        showVoterCommonPhonesModal: false,

        // The content of the Modal which
        // contains voters with the same phones
        // as the current voter
        voterCommonPhonesModalHeader: '',

        // The array of the voters
        // who have same phones as
        // the current voter
        votersWithSamePhones: [],

        // A boolean that is triggered after
        // a phone deletion, warning the user
        // before deleting the phone
        showWarningPhoneDeletionModal: false,

        // The header of the phone
        // deletion warning Modal
        warningPhoneDeletionModalHeader: "",

        // The index of the phone
        // to be deleted
        deletePhoneIndex: -1,

        // A value of deleting checkbox
        // for deleting all phones in the Modal
        deleteAllPhonesModal: false,

        // Show modal for updating actual_address_correct field
        showActualAddressCorrectModal: false,

        // Show request's Modal dialog with documents
        showRequestModalDialog: false,

        // Request's Modal header
        requestModalHeader: '',

        // Request's Modal content
        requestModalContent: '',

        // Objects and arrays for lower tabs actions
        requests: [],
        actions: [],
		polls : [],
        // Array of Shas representative roles
        representatives: [],

        // Backup array of Shas representative roles
        oldRepresentatives: [],

        // state of showing adding action screen
        addingNewActionShowScreen: false,

        // State of adding new action
        addingNewAction: false,

        // The current edited action index
        // value of -1 means no action is
        // being edited
        editActionIndex: -1,

        // The index of the action
        // to be deleted
        deleteActionIndex: -1,

        // The delete action modal header
        deleteActionModalHeader: "",

        // Show modal for deleting action
        showDeleteActionModalDialog: false,

        // Streets of a voter's city
        cityStreets: [],

        // Arrays related to actions tables
        actionTypesList: [], // Action types
        actionStatusesList: [], // Action statuses
        actionTopicsList: [], // Action Topics,

        // Array which stores the
        // types according to the
        // chosen action type in
        // add new action
        voterActionTopicsList: [],

        // Object that stores the data
        // for adding a new action row
        newActionDetails: {
            action_type: '',
            action_topic: '',
            action_status: '',
            action_direction: '',
            target_date: '',
            details: '',
            conversationWith: '',
            action_type_id: 0,
            action_topic_id: 0,
            action_status_id: 0,
            conversation_direction: ''
        },

        // Backup for voter action
        // that is currently being edited
        oldEditedAction: {
            action_type: 0,
            action_type_name: '',
            action_status_id: 0,
            action_status_name: '',
            action_direction: '',
            conversation_direction: '',
            action_date: '',
            description: '',
            conversation_with_other: '',
            action_topic_id: 0,
            action_topic_name: '',
            topics_list: []
        },

        // Boolean of editing new representative
        addingNewRepresentative: false,

        // Boolean of showing row for
        // adding new Representative
        showNewRepresentativeRow: false,

        // Object that stores the data
        // for adding a new representative row
        newRepresentativeDetails: {
            city: '',
            role: '',
            city_id: 0,
            role_id: 0,
            start_date: '',
            end_date: ''
        },

        // Array of representative roles
        representativeRoles: [],

        // editing key of a row in
        // the representatives table
        editingRepresentativeKey: '',

        // editing index of a row in
        // the representatives table
        editingRepresentativeIndex: -1,

        // A boolen that indicates whether to
        // show the delete Modal Dialog
        showDeleteRepresentativeModalDialog: false,

        // The key of the representative to be deleted
        deleteModalRepresentativeHeader: '',

        // The key of the representative to be deleted
        deleteRepresentativeKey: '',

        // The index of the representative to be deleted
        deleteRepresentativeIndex: -1,

        // The delete Modal Dialog confirm text
        deleteConfirmText: 'האם את/ה בטוח/ה ?',

        // Array of all groups
        voterGroups: [],

        // Array of selected groups
        // in adding/editing
        newSelectedGroups: [],

        // boolean of showing Modal
        // for adding groups
        showNewGroupsModalDialog: false,

        // The new groups Modal header
        newGroupsModalHeader: '',

        // The groups which the voter belongs to
        voterInGroups: [],

        // The index of the group to be edited
        editingGroupIndex: -1,

        // A boolen that indicates whether to
        // show the delete Modal Dialog
        showDeleteGroupModalDialog: false,

        // The Modal header of the group to be deleted
        deleteModalGroupHeader: '',

        // The index of the group to be deleted
        deleteGroupIndex: -1,

        // Boolean which indicates
        // whether all groups had
        // been loaded
        loadedAllGroups: false,

        // Boolean which indicates
        // whether voter's groups had
        // been loaded
        loadedVoterGroups: false,

        // Boolean which indicates
        // whether to show the edit
        // Modal dialog for a group item
        showItemGroupsModalDialog: false,

        // The Modal header of the group to be edited
        editGroupModalHeader: '',

        // The index of the group to be deleted
        editGroupIndex: -1,

        // An accessory array for editing
        // an item of groups table
        editSelectedGroups: [],

        // The voter user's system user details
        voterSystemUser: {
            id: 0,
            key: '',
            active: 0,
            password_date: ''
        },

        // The voter user's geographic filters
        voterSystemUserGeographicFilters: [],

        // The voter user's sectorial filters
        voterSystemUserSectorialFilters: [],

        // The last campaign id
        lastCampaignId: null,
        lastCampaignName: '',

        // Array of household voters
        household: [],

        // Array of current voter
        // support status
        oldHousehold: [],

        // Boolean which indicates whether to
        // show the update address Modal
        showUpdateHouseholdAddressModal: false,

        // The update household Modal content
        updateHouseholdAddressModalContent: '',

        // Index of household for updating address
        updateHouseholdIndex: -1,

        // Boolean which indicates whether
        // to update all the household members
        // addresses
        updateHouseholdAll: false,

        // The update household Modal header
        updateHouseholdModalHeader: '',

        // The update household Modal content
        updateHouseholdModalContent: '',

        // Key of house hold to be edited
        editHouseholdKey: '',

        // A boolen that indicates whther to
        // show the delete Modal Dialog
        showDeleteSupportStatusModal: false,

        // The key of the document to be deleted
        deleteHouseholdKey: '',

        // The delete's Modal header
        deleteHouseholdModalHeader: '',

        // The voter support status key
        // in table voter_support_status
        deleteSupportStatusKey: '',

        // The metadata keys
        metaDataKeys: [],

        // meta data keys with values ['willing_volunteer', 'agree_sign', 'explanation_material']
        metaDataVolunteerKeys: [],

        // The metadata values
        metaDataValues: [],

        // Voter Meta Hash table
        voterMetaHash: [],

        // Voter Meta Hash backup table
        oldVoterMetaHash: [],

        // Meta values by key id
        metaValuesHashByKeyId: [],

        // Meta values by value id
        metaValuesHashByValueId: [],

        // Voter supporrt statuses
        supportStatuses: {
            // branch statuses
            voter_support_status_id0: 0,
            voter_support_status_key0: null,
            support_status_id0: 0,
            support_status_name0: '',
            branch_updated_at: '',
            branch_create_user_id: '',
            voter_branch_first_name: '',
            voter_branch_last_name: '',

            // TM statuses
            voter_support_status_id1: 0,
            voter_support_status_key1: null,
            support_status_id1: 0,
            support_status_name1: '',
            tm_updated_at: '',
            tm_create_user_id: '',
            voter_tm_first_name: '',
            voter_tm_last_name: ''
        },

        // Old Voter supporrt statuses
        oldSupportStatuses: {
            // branch statuses
            voter_support_status_id0: 0,
            voter_support_status_key0: null,
            support_status_id0: 0,
            support_status_name0: '',
            branch_updated_at: '',
            branch_create_user_id: '',
            voter_branch_first_name: '',
            voter_branch_last_name: '',

            // TM statuses
            voter_support_status_id1: 0,
            voter_support_status_key1: null,
            support_status_id1: 0,
            support_status_name1: '',
            tm_updated_at: '',
            tm_create_user_id: '',
            voter_tm_first_name: '',
            voter_tm_last_name: ''
        },
                // voter campaigns support statuses object
        supportStatusesObj: {},

        // vote sources
        electionVoteSources: [],

        // Voter election campaigns data
        voterElectionCampaigns: [],

        // Original voter election campaigns data
        oldVoterElectionCampaigns: [],

        // The index of edited coter election campaign
        editingVoterElectionCampaignsIndex: -1,

        // Modal for showing error in loading voter
        showMissingVoterModal: false,

        // Content of error in loading voter Modal
        missingVoterModalContent: "",

        displayDialWindow: false,

        // Input for seaching Voter by personal identity
        personalIdentitySearchParam: '',

        /* This object includes the edit
         * support statuses for editing
         * support status states in voter
         * main block
         * The states are:
         *    text - for showing the support status name.
         *           on mouse over it will move to the link state
         *    link - showing link that on clicking will move to
         *           the edit state. mouse out will
         *      edit - will show a combo for editing the support status
         */
        mainBlockSupportStatusState: "text",

        //Arrays related to institutes
        instituteGroups: [],
        instituteTypes: [],
        instituteRoles: [],
        instituteNetworks: [],
        institutes: [],

        // Array of voter institutes
        voterInstitutes: [],

        // Object for storing data when
        // adding a voter institute
        newInstituteData: {
            institute_group_id: 0,
            institute_group_name: '',
            institute_type_id: 0,
            institute_type_name: '',
            institute_network_id: 0,
            institute_network_name: '',
            institute_id: 0,
            institute_name: '',
            institute_role_id: 0,
            institute_role_name: '',
            city_id: 0,
            city_name: '',
            types_list: [],
            institutes_list: [],
            roles_list: []
        },

        // A boolean which indicates whether
        // to show a row for adding new institute
        showNewInstituteRow: false,

        // The index of the institute being edited
        editInstituteIndex: -1,

        // Object for backing up
        // institute row's data
        editInstituteBackup: {
            institute_group_id: 0,
            institute_group_name: '',
            institute_type_id: 0,
            institute_type_name: '',
            institute_network_id: 0,
            institute_network_name: '',
            institute_id: 0,
            institute_name: '',
            institute_role_id: 0,
            institute_role_name: '',
            city_id: 0,
            city_name: '',
            types_list: [],
            institutes_list: [],
            roles_list: []
        },

        // Boolean which indicates whether to
        // show the Modal Dialog for deleting
        // an institute row
        showDeleteInstituteModalDialog: false,

        // The index of the institute to be deleted
        deleteInstituteIndex: -1,

        // The institute delete's Modal header
        deleteInstituteModalHeader: ''
    },
    voterDialerWindowData: {
        voterDetails: null,
        existAudioInput: null,
        callBoxOpen: true, // call box state -> false = closed , true = open;
        webDialer: {
            "sipnumber": null,
            "password": null
        },
        callKey: null,
        inCall: false,
        isCallHolded: false
    },
    voterDetails: {
        key: '',
        personal_identity: '',
        birth_year: '',
        father_first_name: '',
        origin_country: '',
        first_name: '',
        last_name: '',
        prev_first_name: '',
        congregation: '',
        shas_representative: 0,
		deceased:0,
        deceased_date:'',
        deceased_month: null,
        deceased_year: null,
        city: '',
        city_id: 0,
        city_name: '',
        street: '',
        street_id: '',
        street_name: '',
        neighborhood: '',
        house: '',
        house_entry: '',
        flat: '',
        zip: '',
        distribution_code: '',

        mi_city: '',
        mi_city_id: '',
        mi_city_name: '',
        mi_street: '',
        mi_street_id: '',
        mi_street_name: '',
        mi_neighborhood: '',
        mi_house: '',
        mi_house_entry: '',
        mi_flat: '',
        mi_zip: '',

        actual_address_correct: null,

        email: '',
        contact_via_email: '',

        phone1: '',
        phone2: '',
        phone3: '',

        phones: [],
        main_voter_phone_id: 0,
        main_phone_index: -1,

        birth_date: '',
        birth_date_type: '',
        birth_date_type_name: '',
        can_vote: '',
        sephardi: '',
        sephardi_name: '',
        gender: '',
        gender_name: '',
        origin_country_id: '',
        origin_country_name: '',
        ethnic_group_id: '',
        ethnic_group_name: '',
        religious_group_id: '',
        religious_group_name: '',
        voter_title_id: '',
        voter_title_name: '',
        voter_ending_id: '',
        voter_ending_name: '',

        // This field indicates whether the fields
        // personal_identiy, first_name, last_name
        // should be readonly fields
        voterReadOnlyFields: {
            personal_identity: true,
            first_name: true,
            last_name: true
        },

        support_status_id0: 0,
        support_status_name0: '',
        support_status_likes0: ''
    },

    oldVoterDetails: {
        key: '',
        personal_identity: '',
        birth_year: '',
        father_first_name: '',
        origin_country: '',
        first_name: '',
        last_name: '',
        prev_first_name: '',
        congregation: '',
        shas_representative: 0,

        city: '',
        city_id: 0,
        city_name: '',
        street: '',
        neighborhood: '',
        house: '',
        house_entry: '',
        flat: '',
        zip: '',
        distribution_code: '',

        mi_city: '',
        mi_city_id: '',
        mi_city_name: '',
        mi_street: '',
        mi_neighborhood: '',
        mi_house: '',
        mi_house_entry: '',
        mi_flat: '',
        mi_zip: '',

        actual_address_correct: '',

        email: '',
        contact_via_email: '',

        phone1: '',
        phone2: '',
        phone3: '',

        phones: [],
        main_voter_phone_id: 0,
        main_phone_index: -1,

        birth_date: '',
        birth_date_type: '',
        birth_date_type_name: '',
        can_vote: '',
        sephardi: '',
        sephardi_name: '',
        gender: '',
        gender_name: '',
        origin_country_id: '',
        origin_country_name: '',
        ethnic_group_id: '',
        ethnic_group_name: '',
        religious_group_id: '',
        religious_group_name: '',
        voter_title_id: '',
        voter_title_name: '',
        voter_ending_id: '',
        voter_ending_name: '',

        // This field indicates whether the fields
        // personal_identiy, first_name, last_name
        // should be readonly fields
        voterReadOnlyFields: {
            personal_identity: true,
            first_name: true,
            last_name: true
        },

        support_status_id0: 0,
        support_status_name0: '',
        support_status_likes0: ''
    },

    extraDataScreen: {
        voterDeathData: [],
        voterKeysValuesData: [],
        originalVoterKeysValuesData: [],
    },

    activistScreen: {
        willingVolunteerValuesList: [],
        agreeSignValuesList: [],
        expMaterialValuesList: [],
        campaignMetadata: [],
        errorMessage: '',
        ministerFiftyVoterData: {
            first_name: '',
            last_name: '',
            mi_city: '',
            key: ''
        },
        ministerOfFifty: {},
        election_roles: [],
        election_role_shifts: [],
        campaigns: [],
        areas: [],
        cities: [],
        neighborhoods: [],
        clusters: [],
        ballots: [],
        voter_roles: [],
        old_voter_roles: [],
        showDeleteModalDialog: false,
        deleteModalHeader: '',
        deleteConfirmText: '',
        voterRoleDeleteIndex: -1,
        voterGeoEntityKey: '',
        addingNewRole: false,
        addingNewGeoRole: false,
        editingExistingGeoRole: false,
        addingNewFiftyMinister: false,
        editingFiftyMinister: false,
        editingExistingRole: false,
        editRoleRowIndex: -1,
        addEditActivistRoleHeader: '',
        addNewRoleData: {
            campaignName: '',
            roleName: '',
        }
        ,
        addNewGeoRecordData: {
            recordID: -1,
            campName: '',
            roleName: '',
            roleArea: '',
            roleCity: '',
            roleNeighborhood: '',
            roleCluster: '',
            roleBallot: '',
            roleShift: '',
            roleKey: '',
            roleIndex: '',
            geoIndex: ''
        }
    },
};

function voterReducer(state = initialState, action) {
    let tmp = null;
    switch (action.type) {
        case VoterActions.ActionTypes.VOTER_SEARCH.FOUND_TEMP_VOTER:

            var newState = { ...state };

            newState.voterDetails = action.tempVoterData;
            newState.voterDetails.voterReadOnlyFields = {
                personal_identity: true,
                first_name: true,
                last_name: true
            };
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_LEVEL:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterLevel = { ...newState.searchVoterScreen.searchVoterLevel };
            for(let key in  newState.searchVoterScreen.searchVoterLevel){
				if(key == action.searchLevel){
					 
					newState.searchVoterScreen.searchVoterLevel[key] = true;
				}
				else{
					newState.searchVoterScreen.searchVoterLevel[key] = false;
				}
			}

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.BEGIN:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };

            newState.searchVoterScreen.searchVoterResult = [];
            newState.searchVoterScreen.searchVoterCount = 0;
            newState.searchVoterScreen.searchVoterCurrentPage = 0;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.END:

            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterLoading = false;
            return newState;
            break;


        case VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchForParams = { ...newState.searchVoterScreen.searchForParams, ...action.searchForParams };
            newState.searchVoterScreen.isMaximumExecutionTime = false;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS_CITY_VALUE:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchCityInputValue = action.cityInputValue;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_SEARCH_PARAMS_STREET_VALUE:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchStreetInputValue = action.searchInputValue;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.FETCH_DATA_BEGIN:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterLoading = true;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.FETCH_DATA_END:
	 
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterLoading = false;
            newState.searchVoterScreen.searchVoterResult = [...newState.searchVoterScreen.searchVoterResult, ...action.searchVoterDataChunk]; 
		    newState.searchVoterScreen.searchVoterCurrentPage = newState.searchVoterScreen.searchVoterCurrentPage + 1;
            newState.searchVoterScreen.searchVoterDetails = newState.searchVoterScreen.searchVoterResult.length ? newState.searchVoterScreen.searchVoterResult[0] : {};
            newState.searchVoterScreen.searchVoterHasMore = (action.searchVoterDataChunk.length < 30) ? false : true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_DATA:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchForParams = { ...newState.searchVoterScreen.searchForParams };
            newState.searchVoterScreen.searchForErrorMsg = { ...newState.searchVoterScreen.searchForErrorMsg };
            newState.searchVoterLoading = false;
            for (let i in newState.searchVoterScreen.searchForParams) {
                if (i == 'city' || i == 'street')
                    newState.searchVoterScreen.searchForParams[i] = [];
                else
                    newState.searchVoterScreen.searchForParams[i] = '';
            }
            for (let i in newState.searchVoterScreen.searchForErrorMsg) {
                newState.searchVoterScreen.searchForErrorMsg[i] = '';
            }
            newState.searchVoterScreen.searchCityInputValue = '';
            newState.searchVoterScreen.searchVoterResult = [];
            newState.searchVoterScreen.searchVoterDetails = {};
            newState.searchVoterScreen.searchVoterCurrentPage = 0;
            newState.searchVoterScreen.searchVoterCount = 0;
            newState.searchVoterScreen.searchVoterHasMore = false;
            newState.searchVoterScreen.disallowBirthYear = false;
            newState.searchVoterScreen.disallowAgeLimit = false;
            newState.searchVoterScreen.disableNewSearch = false;
            newState.searchVoterScreen.isMaximumExecutionTime = false;
            newState.searchVoterScreen.showEmptyFilterPanel = false;
            newState.searchVoterScreen.searchVoterIsScroll = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_MULTI_COMBO:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.cleanMultiCombo = action.cleanMultiCombo;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.RESET_SEARCH_RESULT:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterResult = [];
            newState.searchVoterScreen.searchVoterDetails = {};
            newState.searchVoterScreen.searchVoterCurrentPage = 0;
            newState.searchVoterScreen.searchVoterCount = 0;
            newState.searchVoterScreen.searchVoterHasMore = false;
            newState.searchVoterScreen.searchVoterIsScroll = false;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.FILL_VOTER_DETAILS:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterDetails = action.searchVoterDetails;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.VOTER_SEARCH_SCROLLER:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };

            newState.searchVoterScreen.searchVoterIsScroll = action.searchVoterIsScroll;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_ROW_COUNT:
            var newState = { ...state };
            newState.searchVoterScreen.searchVoterCount = action.searchVoterCount;
            var searchVoterHasMore = (newState.searchVoterScreen.searchVoterResult.length >= action.searchVoterCount) ? false : true;
            newState.searchVoterScreen.searchVoterHasMore = searchVoterHasMore;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_SELECTED_VOTER_FOR_REDIRECT:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.voterDetails = { ...newState.voterDetails };
            newState.searchVoterScreen.selectedVoterForRedirect = newState.searchVoterScreen.searchVoterDetails;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.CLEAN_SELECTED_VOTER_FOR_REDIRECT:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.returnUrl = '';
            newState.searchVoterScreen.selectedVoterForRedirect = {};
            newState.searchVoterScreen.searchVoterDetails = {};
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_ROW_SELECTED:

            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchVoterResult = [...newState.searchVoterScreen.searchVoterResult];
            newState.searchVoterScreen.searchVoterResult[action.selectedRowIdx] = {...newState.searchVoterScreen.searchVoterResult[action.selectedRowIdx]};
            /**
             * Make first a barbarian cleaning.
             */
            for (let i in newState.searchVoterScreen.searchVoterResult) {
                newState.searchVoterScreen.searchVoterResult[i].isSelected = false;
            }
            /**
             * Set the right 'isSelected' one.
             */
            newState.searchVoterScreen.searchVoterResult[action.selectedRowIdx].isSelected = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_EMPTY_FILTER:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.showEmptyFilterPanel = action.showEmptyFilter;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.SET_FILTER_ERROR_MSG:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.searchForErrorMsg = { ...newState.searchVoterScreen.searchForErrorMsg, ...action.searchForErrorMsg };
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.TOGGLE_AGE_LIMIT:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.disallowBirthYear = action.disallowBirthYear;
            newState.searchVoterScreen.disallowAgeLimit = action.disallowAgeLimit;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.DISABLE_NEW_SEARCH:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.disableNewSearch = action.disableNewSearch;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.MAXIMUM_EXECUTION_TIME:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.isMaximumExecutionTime = action.isMaximumExecutionTime;
            newState.searchVoterScreen.searchVoterLoading = false;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.REDIRECT_TO_REQUEST_CREATOR_PAGE:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            return newState;
            break;

        // case VoterActions.ActionTypes.TEST_LOADING_VOTERS:
        //     var newState = {...state};
        //     newState.searchVoterLoading = true;
        //     return newState;
        //     break;
        //
        // case VoterActions.ActionTypes.TEST_LOADED_VOTERS:
        //     var newState = {...state};
        //     newState.searchVoterLoading = false;
        //     newState.searchVoterResult = [...newState.searchVoterResult, ...action.voters];
        //     newState.searchVoterCurrentPage = newState.searchVoterCurrentPage + 1;
        //     if (newState.searchVoterResult.length >= newState.searchVoterCount) {
        //         newState.searchVoterHasMore = false;
        //     }
        //     return newState;
        //     break;


        case VoterActions.ActionTypes.VOTER.VOTER_PERSONAL_IDENTITY_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.personal_identity = action.personalIdentity;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_FIRST_NAME_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.first_name = action.firstName;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_LAST_NAME_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.last_name = action.lastName;
            return newState;
            break;


        case VoterActions.ActionTypes.VOTER.VOTER_SET_DETAILS:
 
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.activistScreen = { ...newState.activistScreen };

            var redirectToTabSection = newState.voterScreen.redirectToTabSection;
            var redirectToNewAction = newState.voterScreen.redirectToNewAction;
            var redirectToNewDocument = newState.voterScreen.redirectToNewDocument;

            newState.voterDetails = action.voterDetails;
            newState.oldVoterDetails = action.oldVoterDetails;

            // Initialize tab on the left
            newState.voterScreen.tabLeft = 'address';

            // Initialize tab on lower frame
            newState.voterScreen.tabLowerFrame = 'addressing';

            newState.voterScreen.containerCollapseStatus = {
                infoDetails: false,
                infoContact: false,
                infoAddress: false,
                infoUser: false,
                infoAdditionalData: false,

                partyInstitutes: false,
                partyGroups: false,
                partyRepresentative: false,

                supportElectionsSupport: false,
                supportElectionsActivity: false,
                supportElectionsBallot: false
            };

            if (redirectToTabSection) {
                switch (newState.voterScreen.voterTab) {
                    case 'info':
                        newState.voterScreen.containerCollapseStatus.infoDetails = false;
                        break;

                    case 'party':
                        newState.voterScreen.containerCollapseStatus.partyGroups = false;
                        break;

                    case 'supportElections':
                        newState.voterScreen.containerCollapseStatus.supportElectionsSupport = false;
                        break;
                }

                newState.voterScreen.containerCollapseStatus[newState.voterScreen.voterTabSection] = true;

                newState.voterScreen.redirectToTabSection = false;
                newState.voterScreen.voterTabSection = '';
            } else {
                newState.voterScreen.voterTabSection = '';
                newState.voterScreen.redirectToTabSection = false;
            }

            if (redirectToNewAction) {
                newState.voterScreen.voterTab = "actions";
                newState.voterScreen.addingNewActionShowScreen = true;
                newState.voterScreen.redirectToNewAction = false;
            } else {
                // State of showing the voter add new action screen
                newState.voterScreen.addingNewActionShowScreen = false;

                newState.voterScreen.redirectToNewAction = false;
            }

            if (redirectToNewDocument) {
                newState.voterScreen.voterTab = "documents";
                newState.voterScreen.redirectToNewDocument = false;
            } else {
                newState.voterScreen.redirectToNewDocument = false;
            }

            if (!redirectToTabSection && !redirectToNewAction && !redirectToNewDocument) {
                newState.voterScreen.voterTab = '';
            }

            // Initialize state of saving data
            newState.voterScreen.savingVoterData = false;

            // Show request's Modal dialog with documents
            newState.voterScreen.showRequestModalDialog = false;

            // Request's Modal header
            newState.voterScreen.requestModalHeader = '';

            // request's Modal content
            newState.voterScreen.requestModalContent = '';

            // State of showing the voter add new action screen
            //newState.voterScreen.addingNewActionShowScreen = false;

            // State of adding new action
            newState.voterScreen.addingNewAction = false;

            // The current edited action index
            // value of -1 means no action is
            // being edited
            newState.voterScreen.editActionIndex = -1;

            // The index of the action to be deleted
            newState.voterScreen.deleteActionIndex = -1;

            // The delete action modal header
            newState.voterScreen.deleteActionModalHeader = "";

            // Show modal for deleting action
            newState.voterScreen.showDeleteActionModalDialog = false;

            // Array which stores the
            // types according to the
            // chosen action type in
            // add new voter action
            newState.voterScreen.voterActionTopicsList = [];

            // Input fields for adding new action
            newState.voterScreen.newActionDetails = {
                action_type: '',
                action_topic: '',
                action_status: '',
                action_direction: '',
                target_date: '',
                details: '',
                conversationWith: '',
                action_type_id: 0,
                action_topic_id: 0,
                action_status_id: 0,
                conversation_direction: ''
            };

            // Backup for voter action
            // that is currently being edited
            newState.voterScreen.oldEditedAction = {
                action_type: 0,
                action_type_name: '',
                action_status_id: 0,
                action_status_name: '',
                action_direction: '',
                conversation_direction: '',
                action_date: '',
                description: '',
                conversation_with_other: '',
                action_topic_id: 0,
                action_topic_name: '',
                topics_list: []
            };

            // Boolean of editing new representative
            newState.voterScreen.addingNewRepresentative = false;

            // Boolean of showing row for
            // adding new Representative
            newState.voterScreen.showNewRepresentativeRow = false;

            // Object that stores the data
            // for adding a new representative row
            newState.voterScreen.newRepresentativeDetails = {
                city: '',
                role: '',
                city_id: 0,
                role_id: 0,
                start_date: '',
                end_date: ''
            };

            // editing key of a row in
            // the representatives table
            newState.voterScreen.editingRepresentativeKey = '';

            // editing index of a row in
            // the representatives table
            newState.voterScreen.editingRepresentativeIndex = -1;

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteRepresentativeModalDialog = false;

            // The key of the representative to be deleted
            newState.voterScreen.deleteModalRepresentativeHeader = '';

            // The key of the representative to be deleted
            newState.voterScreen.deleteRepresentativeKey = '';

            // The index of the representative to be deleted
            newState.voterScreen.deleteRepresentativeIndex = -1;

            // The delete Modal Dialog confirm text
            newState.voterScreen.deleteConfirmText = 'האם את/ה בטוח/ה ?';

            // Array of selected groups
            // in adding/editing
            newState.voterScreen.newSelectedGroups = [];

            // boolean of showing Modal
            // for adding groups
            newState.voterScreen.showNewGroupsModalDialog = false;

            // The new groups Modal header
            newState.voterScreen.newGroupsModalHeader = '';

            // The index of the group to be edited
            newState.voterScreen.editingGroupIndex = -1;

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteGroupModalDialog = false;

            // The Modal header of the group to be deleted
            newState.voterScreen.deleteModalGroupHeader = '';

            // The index of the group to be deleted
            newState.voterScreen.deleteGroupIndex = -1;

            // Boolean which indicates
            // whether all groups had
            // been loaded
            newState.voterScreen.loadedAllGroups = false;

            // Boolean which indicates
            // whether voter's groups had
            // been loaded
            newState.voterScreen.loadedVoterGroups = false;

            // Boolean which indicates
            // whether to show the edit
            // Modal dialog for a group item
            newState.voterScreen.showItemGroupsModalDialog = false;

            // The Modal header of the group to be edited
            newState.voterScreen.editGroupModalHeader = '';

            // The index of the group to be deleted
            newState.voterScreen.editGroupIndex = -1;

            // An accessory array for editing an item of groups table
            newState.voterScreen.editSelectedGroups = [];

            // The voter's system user details
            newState.voterScreen.voterSystemUser = {
                id: 0,
                key: '',
                active: 0,
                password_date: '',
                voter_id: 0,
                role_name: '',
                team_name: ''
            };

            // Boolean which indicates whether to
            // show the update address Modal
            newState.voterScreen.showUpdateHouseholdAddressModal = false;

            // The update household Modal content
            newState.voterScreen.updateHouseholdAddressModalContent = '';

            // Index of household for updating address
            newState.voterScreen.updateHouseholdIndex = -1;

            // Boolean which indicates whether
            // to update all the household members
            // addresses
            newState.voterScreen.updateHouseholdAll = false;

            // The update household Modal header
            newState.voterScreen.updateHouseholdModalHeader = '';

            // The update household Modal content
            newState.voterScreen.updateHouseholdModalContent = '';

            // Key of house hold to be edited
            newState.voterScreen.editHouseholdKey = '';

            // A boolen that indicates whther to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteSupportStatusModal = false;

            // The key of the document to be deleted
            newState.voterScreen.deleteHouseholdKey = '';

            // The delete's Modal header
            newState.voterScreen.deleteHouseholdModalHeader = '';

            // The voter support status key
            // in table voter_support_status
            newState.voterScreen.deleteSupportStatusKey = '';

            // Voter Meta Hash table
            newState.voterScreen.voterMetaHash = [];

            // Voter Meta Hash backup table
            newState.voterScreen.oldVoterMetaHash = [];

            // Voter supporrt statuses
            newState.voterScreen.supportStatuses = {
                // branch statuses
                voter_support_status_id0: 0,
                voter_support_status_key0: null,
                support_status_id0: '',
                support_status_name0: '',
                branch_updated_at: '',
                branch_create_user_id: '',
                voter_branch_first_name: '',
                voter_branch_last_name: '',

                // TM statuses
                voter_support_status_id1: 0,
                voter_support_status_key1: null,
                support_status_id1: '',
                support_status_name1: '',
                tm_updated_at: '',
                tm_create_user_id: '',
                voter_tm_first_name: '',
                voter_tm_last_name: ''
            };

            // Old Voter supporrt statuses
            newState.voterScreen.oldSupportStatuses = {
                // branch statuses
                voter_support_status_id0: 0,
                voter_support_status_key0: null,
                support_status_id0: '',
                support_status_name0: '',
                branch_updated_at: '',
                branch_create_user_id: '',
                voter_branch_first_name: '',
                voter_branch_last_name: '',

                // TM statuses
                voter_support_status_id1: 0,
                voter_support_status_key1: null,
                support_status_id1: '',
                support_status_name1: '',
                tm_updated_at: '',
                tm_create_user_id: '',
                voter_tm_first_name: '',
                voter_tm_last_name: ''
            };

            // voter campaigns Tm support statuses
            newState.voterScreen.voterCampaignsTmSupportStatuses = [];

            // Voter election campaigns data
            newState.voterScreen.voterElectionCampaigns = [];

            // Original voter election campaigns data
            newState.voterScreen.oldVoterElectionCampaigns = [];

            //The index of edited coter election campaign
            newState.voterScreen.editingVoterElectionCampaignsIndex = -1;

            newState.activistScreen.voter_roles = [];
            newState.activistScreen.old_voter_roles = [];
            newState.activistScreen.ministerOfFifty = {};

            // Modal for showing error in loading voter
            newState.voterScreen.showMissingVoterModal = false;

            // Content of error in loading voter Modal
            newState.voterScreen.missingVoterModalContent = "";

            // Input for seaching Voter by personal identity
            newState.voterScreen.personalIdentitySearchParam = "";

            /* This object includes the edit
             * support statuses for editing
             * support status states in voter
             * main block
             * The states are:
             *    text - for showing the support status name.
             *           on mouse over it will move to the link state
             *    link - showing link that on clicking will move to
             *           the edit state. mouse out will
             *      edit - will show a combo for editing the support status
             */
            newState.voterScreen.mainBlockSupportStatusState = "text";

            // Object for storing data when
            // adding a voter institute
            newState.voterScreen.newInstituteData = {
                institute_group_id: 0,
                institute_group_name: '',
                institute_type_id: 0,
                institute_type_name: '',
                institute_network_id: 0,
                institute_network_name: '',
                institute_id: 0,
                institute_name: '',
                institute_role_id: 0,
                institute_role_name: '',
                city_id: 0,
                city_name: '',
                types_list: [],
                institutes_list: [],
                roles_list: []
            };

            // A boolean which indicates whether
            // to show a row for adding new institute
            newState.voterScreen.showNewInstituteRow = false;

            // The index of the institute being edited
            newState.voterScreen.editInstituteIndex = -1;

            // Object for backing up
            // institute row's data
            newState.voterScreen.editInstituteBackup = {
                institute_group_id: 0,
                institute_group_name: '',
                institute_type_id: 0,
                institute_type_name: '',
                institute_network_id: 0,
                institute_network_name: '',
                institute_id: 0,
                institute_name: '',
                institute_role_id: 0,
                institute_role_name: '',
                city_id: 0,
                city_name: '',
                types_list: [],
                institutes_list: [],
                roles_list: []
            };

            // Boolean which indicates whether to
            // show the Modal Dialog for deleting
            // an institute row
            newState.voterScreen.showDeleteInstituteModalDialog = false;

            // The index of the institute to be deleted
            newState.voterScreen.deleteInstituteIndex = -1;

            // The institute delete's Modal header
            newState.voterScreen.deleteInstituteModalHeader = '';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_CONTACT_UPDATE_PHONES:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };

            newState.voterDetails.phones = action.phones;
            newState.oldVoterDetails.phones = _.clone(newState.voterDetails.phones);
            newState.oldVoterDetails.oldPhones = _.clone(newState.voterDetails.phones);

            newState.voterDetails.main_voter_phone_id = action.mainVoterPhoneId;
            if (newState.voterDetails.main_voter_phone_id != null) {
                newState.voterDetails.main_phone_index = newState.voterDetails.phones.findIndex(phoneItem => phoneItem.id == newState.voterDetails.main_voter_phone_id);
            } else {
                newState.voterDetails.main_phone_index = -1;
            }

            newState.oldVoterDetails.main_voter_phone_id = newState.voterDetails.main_voter_phone_id;
            newState.oldVoterDetails.main_phone_index = newState.voterDetails.main_phone_index;

            return newState;
        case VoterActions.ActionTypes.VOTER.VOTER_CONTACT_UPDATE_EMAIL:
            var newState = { ...state };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };
            newState.oldVoterDetails.email = action.data;
            return newState;
        case VoterActions.ActionTypes.VOTER.VOTER_INIT_EMPTY_PHONES:
            var newState = { ...state };

            newState.voterDetails = action.voterDetails;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_INIT_LOWER_TABS_OBJECTS:
            var newState = { ...state };

            newState.voterDetails = action.voterDetails;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_INIT_CITY_ID:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.city_id = action.cityId;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_INIT_MI_CITY_ID:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.mi_city_id = action.miCityId;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_BIRTH_DATE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.birth_date = action.birth_date;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_BIRTH_DATE_TYPE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.birth_date_type = action.birth_date_type;
            newState.voterDetails.birth_date_type_name = action.birth_date_type_name;

            return newState;
            break;
			
		/*
			change voterDetails general field
			@param fieldName
			@param fieldValue
		*/	
		 case VoterActions.ActionTypes.VOTER.GENERAL_FIELD_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails[action.fieldName] = action.fieldValue;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_CITY_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.city_id = action.cityId;
            newState.voterDetails.city_name = action.cityName;
            newState.voterDetails.city_key = action.cityKey;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_STREET_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.street_id = action.streetId;
            newState.voterDetails.street_name = action.streetName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_HOUSE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.house = action.house;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ZIP_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.zip = action.zip;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_NEIGHBORHOOD_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.neighborhood = action.neighborhood;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_HOUSE_ENTRY_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.house_entry = action.house_entry;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_FLAT_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.flat = action.flat;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_DISTRIBUTION_CODE_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.distribution_code = action.distributionCode;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_NUMBER_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];
            newState.voterDetails.phones[action.data.phoneIndex] = { ...newState.voterDetails.phones[action.data.phoneIndex] };

            newState.voterDetails.phones[action.data.phoneIndex].phone_number = action.data.phoneNumber;
            newState.voterDetails.phones[action.data.phoneIndex].defined = action.data.defined;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_TM_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];
            newState.voterDetails.phones[action.data.phoneIndex] = { ...newState.voterDetails.phones[action.data.phoneIndex] };

            newState.voterDetails.phones[action.data.phoneIndex].call_via_tm = action.data.call_via_tm;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_SMS_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];
            newState.voterDetails.phones[action.data.phoneIndex] = { ...newState.voterDetails.phones[action.data.phoneIndex] };

            newState.voterDetails.phones[action.data.phoneIndex].sms = action.data.sms;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_WRONG_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];
            newState.voterDetails.phones[action.data.phoneIndex] = { ...newState.voterDetails.phones[action.data.phoneIndex] };

            newState.voterDetails.phones[action.data.phoneIndex].wrong = action.data.wrong;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_TYPE_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];
            newState.voterDetails.phones[action.phoneIndex] = { ...newState.voterDetails.phones[action.phoneIndex] };

            newState.voterDetails.phones[action.phoneIndex].phone_type_id = action.phoneTypeId;
            newState.voterDetails.phones[action.phoneIndex].phone_type_name = action.phoneTypeName;
            newState.voterDetails.phones[action.phoneIndex].defined = action.defined;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_MAIN_PHONE_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.main_phone_index = action.newMainPhoneIndex;
            if (action.newMainPhoneIndex == -1) {
                newState.voterDetails.main_voter_phone_id = null;
            } else {
                newState.voterDetails.main_voter_phone_id = newState.voterDetails.phones[action.newMainPhoneIndex].id;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_ADD_NEW_PHONE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];

            newState.voterDetails.phones.push({
                id: 0,
                key: null,
                phone_number: '',
                call_via_tm: 1,
                sms: 1,
                phone_type_id: 0,
                phone_type_name: '',
                defined: false,
                deleted: false
            });

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_DELETE_PHONE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];
            newState.voterDetails.phones[action.phoneIndex] = { ...newState.voterDetails.phones[action.phoneIndex] };

            newState.voterDetails.phones[action.phoneIndex].deleted = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_EMAIL_INPUT_CAHNGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.email = action.email;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_CONTACT_EMAIL_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.contact_via_email = action.contact_via_email;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SEPHARDI_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.sephardi = action.sephardi;
            newState.voterDetails.sephardi_name = action.sephardiName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GENDER_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.gender = action.genderId;
            newState.voterDetails.gender_name = action.genderName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_COUNTRY_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.origin_country_id = action.countryId;
            newState.voterDetails.origin_country_name = action.countryName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ETHNIC_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.ethnic_group_id = action.ethnicGroupId;
            newState.voterDetails.ethnic_group_name = action.ethnicGroupName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_RELIGIOUS_GROUP_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.religious_group_id = action.religiousGroupId;
            newState.voterDetails.religious_group_name = action.religiousGroupName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_TITLE_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.voter_title_id = action.titleId;
            newState.voterDetails.voter_title_name = action.titleName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ENDING_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.voter_ending_id = action.endingId;
            newState.voterDetails.voter_ending_name = action.endingName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SHAS_REPRESENTATIVE_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            if (1 == newState.voterDetails.shas_representative) {
                newState.voterDetails.shas_representative = 0;
            } else {
                newState.voterDetails.shas_representative = 1;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_DETAILS_UPDATE_OLD_VOTER_DETAILS:
            var newState = { ...state };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };

            let detailsFieldsToUpdate = [
                'birth_date',
                'birth_date_type',
                'birth_date_type_name',
                'origin_country_id',
                'origin_country_name',
                'voter_title_id',
                'voter_title_name',
                'voter_ending_id',
                'voter_ending_name',
                'gender',
                'gender_name',
                'ethnic_group_id',
                'ethnic_group_name',
                'religious_group_id',
                'religious_group_name',                
                'sephardi',
                'sephardi_name'
            ];
            for (let dataIndex = 0; dataIndex < detailsFieldsToUpdate.length; dataIndex++) {
                let fieldName = detailsFieldsToUpdate[dataIndex];

                newState.oldVoterDetails[fieldName] = newState.voterDetails[fieldName];
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_UPDATE_OLD_VOTER_ADDRESS:
            var newState = { ...state };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };

            newState.oldVoterDetails.city_id = newState.voterDetails.city_id;
            newState.oldVoterDetails.city_key = newState.voterDetails.city_key;
            newState.oldVoterDetails.city_name = newState.voterDetails.city_name;
            newState.oldVoterDetails.street_id = newState.voterDetails.street_id;
            newState.oldVoterDetails.street_name = newState.voterDetails.street_name;
            newState.oldVoterDetails.street = newState.voterDetails.street;
            newState.oldVoterDetails.neighborhood = newState.voterDetails.neighborhood;
            newState.oldVoterDetails.house = newState.voterDetails.house;
            newState.oldVoterDetails.house_entry = newState.voterDetails.house_entry;
            newState.oldVoterDetails.flat = newState.voterDetails.flat;
            newState.oldVoterDetails.zip = newState.voterDetails.zip;
            newState.oldVoterDetails.distribution_code = newState.voterDetails.distribution_code;
            newState.oldVoterDetails.actual_address_correct = newState.voterDetails.actual_address_correct;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_TAB_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.tabLeft = action.tabLeft;

            return newState;
            break;
		
		case VoterActions.ActionTypes.VOTER.CLEAN_ALL_VOTER_DATA:
            var newState = { ...state };
            newState.voterScreen =  {
					tabLeft: '',
					tabLowerFrame: '',
					voterTab: '',
					voterTabSection: '',
					redirectToTabSection: false,
					redirectToNewAction: false,
					redirectToNewDocument: false,
					containerCollapseStatus: {
						infoDetails: false,
						infoContact: false,
						infoAddress: false,
						infoUser: false,
						infoAdditionalData: false,
						partyInstitutes: false,
						partyGroups: false,
						partyRepresentative: false,
						supportElectionsSupport: false,
						supportElectionsActivity: false,
						supportElectionsBallot: false
					},
					savingVoterData: false,loadedVoter: false,loadingVoter: false,
					loadedVoterElectionCampaigns: false,showVoterCommonPhonesModal: false,
					voterCommonPhonesModalHeader: '',votersWithSamePhones: [],
					showWarningPhoneDeletionModal: false,
					warningPhoneDeletionModalHeader: "",
					deletePhoneIndex: -1,
					deleteAllPhonesModal: false,
					showActualAddressCorrectModal: false,
					showRequestModalDialog: false,
					requestModalHeader: '',
					requestModalContent: '',
					requests: [],
					actions: [],
					representatives: [],
					oldRepresentatives: [],
					addingNewActionShowScreen: false,
					addingNewAction: false,
					editActionIndex: -1,
					deleteActionIndex: -1,
					deleteActionModalHeader: "",
					showDeleteActionModalDialog: false,
					cityStreets: [],
					actionTypesList: [], // Action types
					actionStatusesList: [], // Action statuses
					actionTopicsList: [], // Action Topics,
					voterActionTopicsList: [],
					newActionDetails: {
						action_type: '',
						action_topic: '',
						action_status: '',
						action_direction: '',
						target_date: '',
						details: '',
						conversationWith: '',
						action_type_id: 0,
						action_topic_id: 0,
						action_status_id: 0,
						conversation_direction: ''
					},
					oldEditedAction: {
						action_type: 0,
						action_type_name: '',
						action_status_id: 0,
						action_status_name: '',
						action_direction: '',
						conversation_direction: '',
						action_date: '',
						description: '',
						conversation_with_other: '',
						action_topic_id: 0,
						action_topic_name: '',
						topics_list: []
					},
					addingNewRepresentative: false,
					showNewRepresentativeRow: false,
					newRepresentativeDetails: {
						city: '',
						role: '',
						city_id: 0,
						role_id: 0,
						start_date: '',
						end_date: ''
					},
				representativeRoles: [],
				editingRepresentativeKey: '',
				editingRepresentativeIndex: -1,
				showDeleteRepresentativeModalDialog: false,
				deleteModalRepresentativeHeader: '',
				deleteRepresentativeKey: '',
				deleteRepresentativeIndex: -1,
				deleteConfirmText: 'האם את/ה בטוח/ה ?',
				voterGroups: [],
				newSelectedGroups: [],
				showNewGroupsModalDialog: false,
				newGroupsModalHeader: '',
				voterInGroups: [],
				editingGroupIndex: -1,
				showDeleteGroupModalDialog: false,
				deleteModalGroupHeader: '',
				deleteGroupIndex: -1,
				loadedAllGroups: false,
				loadedVoterGroups: false,
				showItemGroupsModalDialog: false,
				editGroupModalHeader: '',
				editGroupIndex: -1,
				editSelectedGroups: [],
				voterSystemUser: {
					id: 0,
					key: '',
					active: 0,
					password_date: ''
				},
				voterSystemUserGeographicFilters: [],
				voterSystemUserSectorialFilters: [],
				lastCampaignId: null,
				lastCampaignName: '',
				household: [],
				oldHousehold: [],
				showUpdateHouseholdAddressModal: false,
				updateHouseholdAddressModalContent: '',
				updateHouseholdIndex: -1,
				updateHouseholdAll: false,
				updateHouseholdModalHeader: '',
				updateHouseholdModalContent: '',
				editHouseholdKey: '',
				showDeleteSupportStatusModal: false,
				deleteHouseholdKey: '',
				deleteHouseholdModalHeader: '',
				deleteSupportStatusKey: '',
				metaDataKeys: [],
				metaDataVolunteerKeys: [],
				metaDataValues: [],
				voterMetaHash: [],
				oldVoterMetaHash: [],
				metaValuesHashByKeyId: [],
				metaValuesHashByValueId: [],
				supportStatuses: {
					voter_support_status_id0: 0,
					voter_support_status_key0: null,
					support_status_id0: 0,
					support_status_name0: '',
					branch_updated_at: '',
					branch_create_user_id: '',
					voter_branch_first_name: '',
					voter_branch_last_name: '',
					voter_support_status_id1: 0,
					voter_support_status_key1: null,
					support_status_id1: 0,
					support_status_name1: '',
					tm_updated_at: '',
					tm_create_user_id: '',
					voter_tm_first_name: '',
					voter_tm_last_name: ''
				},
				oldSupportStatuses: {
					voter_support_status_id0: 0,
					voter_support_status_key0: null,
					support_status_id0: 0,
					support_status_name0: '',
					branch_updated_at: '',
					branch_create_user_id: '',
					voter_branch_first_name: '',
					voter_branch_last_name: '',
					voter_support_status_id1: 0,
					voter_support_status_key1: null,
					support_status_id1: 0,
					support_status_name1: '',
					tm_updated_at: '',
					tm_create_user_id: '',
					voter_tm_first_name: '',
					voter_tm_last_name: ''
				},
				voterCampaignsTmSupportStatuses: [],
				voterCampaignsElectionsSupportStatuses: [],
				voterCampaignsFinalSupportStatuses: [],
				electionVoteSources: [],
				voterElectionCampaigns: [],
				oldVoterElectionCampaigns: [],
				editingVoterElectionCampaignsIndex: -1,
				showMissingVoterModal: false,
				missingVoterModalContent: "",
				personalIdentitySearchParam: '',
				mainBlockSupportStatusState: "text",
				instituteGroups: [],
				instituteTypes: [],
				instituteRoles: [],
				instituteNetworks: [],
				institutes: [],
				voterInstitutes: [],
				newInstituteData: {
					institute_group_id: 0,
					institute_group_name: '',
					institute_type_id: 0,
					institute_type_name: '',
					institute_network_id: 0,
					institute_network_name: '',
					institute_id: 0,
					institute_name: '',
					institute_role_id: 0,
					institute_role_name: '',
					city_id: 0,
					city_name: '',
					types_list: [],
					institutes_list: [],
					roles_list: []
				},
				showNewInstituteRow: false,
				editInstituteIndex: -1,
				editInstituteBackup: {
					institute_group_id: 0,
					institute_group_name: '',
					institute_type_id: 0,
					institute_type_name: '',
					institute_network_id: 0,
					institute_network_name: '',
					institute_id: 0,
					institute_name: '',
					institute_role_id: 0,
					institute_role_name: '',
					city_id: 0,
					city_name: '',
					types_list: [],
					institutes_list: [],
					roles_list: []
				},
				showDeleteInstituteModalDialog: false,
				deleteInstituteIndex: -1,
				deleteInstituteModalHeader: ''
    };

    newState.voterDetails= {
        key: '',
        personal_identity: '',
        birth_year: '',
        father_first_name: '',
        origin_country: '',
        first_name: '',
        last_name: '',
        prev_first_name: '',
        congregation: '',
        shas_representative: 0,

        city: '',
        city_id: 0,
        city_name: '',
        street: '',
        street_id: '',
        street_name: '',
        neighborhood: '',
        house: '',
        house_entry: '',
        flat: '',
        zip: '',
        distribution_code: '',

        mi_city: '',
        mi_city_id: '',
        mi_city_name: '',
        mi_street: '',
        mi_street_id: '',
        mi_street_name: '',
        mi_neighborhood: '',
        mi_house: '',
        mi_house_entry: '',
        mi_flat: '',
        mi_zip: '',

        actual_address_correct: null,

        email: '',
        contact_via_email: '',

        phone1: '',
        phone2: '',
        phone3: '',

        phones: [],
        main_voter_phone_id: 0,
        main_phone_index: -1,

        birth_date: '',
        birth_date_type: '',
        birth_date_type_name: '',
        can_vote: '',
        sephardi: '',
        sephardi_name: '',
        gender: '',
        gender_name: '',
        origin_country_id: '',
        origin_country_name: '',
        ethnic_group_id: '',
        ethnic_group_name: '',
        religious_group_id: '',
        religious_group_name: '',
        voter_title_id: '',
        voter_title_name: '',
        voter_ending_id: '',
        voter_ending_name: '',

        // This field indicates whether the fields
        // personal_identiy, first_name, last_name
        // should be readonly fields
        voterReadOnlyFields: {
            personal_identity: true,
            first_name: true,
            last_name: true
        },

        support_status_id0: 0,
        support_status_name0: '',
        support_status_likes0: ''
    };

    newState.oldVoterDetails= {
        key: '',
        personal_identity: '',
        birth_year: '',
        father_first_name: '',
        origin_country: '',
        first_name: '',
        last_name: '',
        prev_first_name: '',
        congregation: '',
        shas_representative: 0,

        city: '',
        city_id: 0,
        city_name: '',
        street: '',
        neighborhood: '',
        house: '',
        house_entry: '',
        flat: '',
        zip: '',
        distribution_code: '',

        mi_city: '',
        mi_city_id: '',
        mi_city_name: '',
        mi_street: '',
        mi_neighborhood: '',
        mi_house: '',
        mi_house_entry: '',
        mi_flat: '',
        mi_zip: '',

        actual_address_correct: '',

        email: '',
        contact_via_email: '',

        phone1: '',
        phone2: '',
        phone3: '',

        phones: [],
        main_voter_phone_id: 0,
        main_phone_index: -1,

        birth_date: '',
        birth_date_type: '',
        birth_date_type_name: '',
        can_vote: '',
        sephardi: '',
        sephardi_name: '',
        gender: '',
        gender_name: '',
        origin_country_id: '',
        origin_country_name: '',
        ethnic_group_id: '',
        ethnic_group_name: '',
        religious_group_id: '',
        religious_group_name: '',
        voter_title_id: '',
        voter_title_name: '',
        voter_ending_id: '',
        voter_ending_name: '',

        // This field indicates whether the fields
        // personal_identiy, first_name, last_name
        // should be readonly fields
        voterReadOnlyFields: {
            personal_identity: true,
            first_name: true,
            last_name: true
        },

        support_status_id0: 0,
        support_status_name0: '',
        support_status_likes0: ''
    };

            newState.voterScreen.tabLeft = action.tabLeft;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_TAB_LOWER_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.tabLowerFrame = action.tabLowerFrame;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_TAB_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.voterTab = action.voterTab;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_COLLAPSE_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.containerCollapseStatus = { ...newState.voterScreen.containerCollapseStatus };

            newState.voterScreen.containerCollapseStatus[action.container] = !newState.voterScreen.containerCollapseStatus[action.container];

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_COLLAPSE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.containerCollapseStatus = { ...newState.voterScreen.containerCollapseStatus };

            newState.voterScreen.containerCollapseStatus[action.container] = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_COLLAPSE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.containerCollapseStatus = { ...newState.voterScreen.containerCollapseStatus };

            newState.voterScreen.containerCollapseStatus[action.container] = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_TAB_SECTION:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.containerCollapseStatus = { ...newState.voterScreen.containerCollapseStatus };

            newState.voterScreen.redirectToTabSection = true;
            newState.voterScreen.voterTabSection = action.container;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_ACTION:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.redirectToNewAction = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_REDIRECT_TO_NEW_DOCUMENT:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.redirectToNewDocument = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REDIRECT_TO_SEARCH:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };

            newState.searchVoterScreen.returnUrl = action.data.returnUrl;
            newState.searchVoterScreen.returnButtonText = action.data.returnButtonText;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_EMPTY_SELECTED_VOTER:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.searchVoterScreen.selectedVoter = [];

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_CLEAN_ADDRESS:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.city_id = 0;
            newState.voterDetails.city_name = "";
            newState.voterDetails.neighborhood = '';
            newState.voterDetails.street = '';
            newState.voterDetails.house = '';
            newState.voterDetails.house_entry = '';
            newState.voterDetails.flat = '';
            newState.voterDetails.zip = '';
            newState.voterDetails.distribution_code = '';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_UPDATE_ADDRESS_TO_MI_ADDRESS:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            streetIndex = -1;

            newState.voterDetails.city_id = newState.voterDetails.mi_city_id;
            newState.voterDetails.city_name = newState.voterDetails.mi_city_name;
            newState.voterDetails.neighborhood = newState.voterDetails.mi_neighborhood;
            newState.voterDetails.house = newState.voterDetails.mi_house;
            newState.voterDetails.house_entry = newState.voterDetails.mi_house_entry;
            newState.voterDetails.flat = newState.voterDetails.mi_flat;
            newState.voterDetails.zip = newState.voterDetails.mi_zip;

            if (newState.voterDetails.mi_street_id == 0) {
                newState.voterDetails.street_name = newState.voterDetails.mi_street_name;

                if (newState.voterDetails.street_name != null && newState.voterDetails.street_name.length > 0) {
                    streetIndex = newState.voterScreen.cityStreets.findIndex(streetItem => streetItem.name == newState.voterDetails.street_name);
                    if (streetIndex != -1) {
                        newState.voterDetails.street_id = newState.voterScreen.cityStreets[streetIndex].id;
                    } else {
                        newState.voterDetails.street_id = 0;
                    }
                } else {
                    newState.voterDetails.street_id = 0;
                }
            } else {
                newState.voterDetails.street_id = newState.voterDetails.mi_street_id;
                newState.voterDetails.street_name = newState.voterDetails.mi_street_name;
            }

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_FIELD_READONLY_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.voterReadOnlyFields[action.readOnlyField] = action.readOnlyValue;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_SAVING_VOTER_DATA:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.savingVoterData = true;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_SAVED_VOTER_DATA:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.savingVoterData = false;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_DETAILS_CLEAN_DATA:
            var newState = { ...state };

            newState.voterDetails = { ...newState.voterDetails };

            for (let i in newState.voterDetails) {
                newState.voterDetails[i] = '';
            }

            newState.voterDetails.phones = [];

            // This field indicates whether the fields
            // personal_identiy, first_name, last_name
            // should be readonly fields
            newState.voterDetails.voterReadOnlyFields = {
                personal_identity: true,
                first_name: true,
                last_name: true
            };

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLEAN_DATA:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // Initialize tab on the left
            newState.voterScreen.tabLeft = 'address';

            // Initialize tab on lower frame
            newState.voterScreen.tabLowerFrame = 'addressing';

            // Initialize voter tab in new system
            newState.voterScreen.voterTab = '';

            // The voter tab section redirected
            // from non voter screen
            newState.voterScreen.voterTabSection = '';

            // A boolean which indicates
            // if there is redirection
            // from screen which is not
            // a voter's screen
            newState.voterScreen.redirectToTabSection = false;

            // Statuses for collapse
            newState.voterScreen.containerCollapseStatus = {
                infoDetails: false,
                infoContact: false,
                infoAddress: false,
                infoUser: false,
                infoAdditionalData: false,

                partyInstitutes: false,
                partyGroups: false,
                partyRepresentative: false,

                supportElectionsSupport: false,
                supportElectionsActivity: false,
                supportElectionsBallot: false
            };

            // Initialize state of saving data
            newState.voterScreen.savingVoterData = false;

            // A boolean which indicates whether
            // the voter details have been loaded
            newState.voterScreen.loadedVoter = false;

            // A boolean which indicates whether
            // the voter details are being loaded
            newState.voterScreen.loadingVoter = false;

            // A boolean which indicates whether
            // the voter elections campaigns is
            // being loaded
            newState.voterScreen.loadedVoterElectionCampaigns = false;

            // A boolean which indicates whether
            // to show a Modal which contains
            // voters with the same phones as
            // the current voter
            newState.voterScreen.showVoterCommonPhonesModal = false;

            // The content of the Modal which
            // contains voters with the same phones
            // as the current voter
            newState.voterScreen.voterCommonPhonesModalHeader = '';

            // A boolean that is triggered after
            // a phone deletion, warning the user
            // before deleting the phone
            newState.voterScreen.showWarningPhoneDeletionModal = false;

            // The header of the phone
            // deletion warning Modal
            newState.voterScreen.warningPhoneDeletionModalHeader = "";

            // The index of the phone
            // to be deleted
            newState.voterScreen.deletePhoneIndex = -1;

            // The array of the voters
            // who have same phones as
            // the current voter
            newState.voterScreen.votersWithSamePhones = [];

            // A value of deleting checkbox
            // for deleting all phones in the Modal
            newState.voterScreen.deleteAllPhonesModal = false;

            // Show modal for updating actual_address_correct field
            newState.voterScreen.showActualAddressCorrectModal = false;

            // Show action's Modal dialog with documents
            newState.voterScreen.showRequestModalDialog = false;

            // Request's Modal header
            newState.voterScreen.requestModalHeader = '';

            // action's Modal content
            newState.voterScreen.requestModalContent = '';

            // State of showing the voter add new action screen
            newState.voterScreen.addingNewActionShowScreen = false;

            // State of adding new action
            newState.voterScreen.addingNewAction = false;

            // The current edited action index
            // value of -1 means no action is
            // being edited
            newState.voterScreen.editActionIndex = -1;

            // The index of the action to be deleted
            newState.voterScreen.deleteActionIndex = -1;

            // The delete action modal header
            newState.voterScreen.deleteActionModalHeader = "";

            // Show modal for deleting action
            newState.voterScreen.showDeleteActionModalDialog = false;

            // Streets of a voter's city
            newState.voterScreen.cityStreets = [];

            // Arrays related to actions tables
            newState.voterScreen.actionTypesList = []; // Action types
            newState.voterScreen.actionStatusesList = []; // Actions statuses
            newState.voterScreen.actionTopicsList = []; // Action Topics

            // Array which stores the
            // types according to the
            // chosen action type in
            // add new voter action
            newState.voterScreen.voterActionTopicsList = [];

            // Input fields for adding new action
            newState.voterScreen.newActionDetails = {
                action_type: '',
                action_topic: '',
                action_status: '',
                action_direction: '',
                target_date: '',
                details: '',
                conversationWith: '',
                action_type_id: 0,
                action_topic_id: 0,
                action_status_id: 0,
                conversation_direction: -1
            };

            // Backup for voter action
            // that is currently being edited
            newState.voterScreen.oldEditedAction = {
                action_type: 0,
                action_type_name: '',
                action_status_id: 0,
                action_status_name: '',
                action_direction: '',
                conversation_direction: '',
                action_date: '',
                description: '',
                conversation_with_other: '',
                action_topic_id: 0,
                action_topic_name: '',
                topics_list: []
            };

            // Initialization of lower tabs arrays
            newState.voterScreen.requests = [];
            newState.voterScreen.actions = [];

            // Initialization of left tabs arrays
            newState.voterScreen.representatives = [];

            // Initialization of left tabs arrays
            newState.voterScreen.oldRepresentatives = [];

            // Boolean of editing new representative
            newState.voterScreen.addingNewRepresentative = false;

            // Boolean of showing row for
            // adding new Representative
            newState.voterScreen.showNewRepresentativeRow = false;

            // Object that stores the data
            // for adding a new representative row
            newState.voterScreen.newRepresentativeDetails = {
                city: '',
                role: '',
                city_id: 0,
                role_id: 0,
                start_date: '',
                end_date: ''
            };

            // Array of representative roles
            newState.voterScreen.representativeRoles = [];

            // editing key of a row in
            // the representatives table
            newState.voterScreen.editingRepresentativeKey = '';

            // editing index of a row in
            // the representatives table
            newState.voterScreen.editingRepresentativeIndex = -1;

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteRepresentativeModalDialog = false;

            // The key of the representative to be deleted
            newState.voterScreen.deleteModalRepresentativeHeader = '';

            // The key of the document to be deleted
            newState.voterScreen.deleteRepresentativeKey = '';

            // The index of the representative to be deleted
            newState.voterScreen.deleteRepresentativeIndex = -1;

            // The array of all the voter groups
            newState.voterScreen.voterGroups = [];

            // Array of selected groups
            // in adding/editing
            newState.voterScreen.newSelectedGroups = [];

            // boolean of showing Modal
            // for adding groups
            newState.voterScreen.showNewGroupsModalDialog = false;

            // The new groups Modal header
            newState.voterScreen.newGroupsModalHeader = '';

            // The groups which the voter belongs to
            newState.voterScreen.voterInGroups = [];

            // The index of the group in the table to be edited
            newState.voterScreen.editingGroupIndex = -1;

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteGroupModalDialog = false;

            // The Modal header of the group to be deleted
            newState.voterScreen.deleteModalGroupHeader = '';

            // The index of the group to be deleted
            newState.voterScreen.deleteGroupIndex = -1;

            // Boolean which indicates
            // whether all groups had
            // been loaded
            newState.voterScreen.loadedAllGroups = false;

            // Boolean which indicates
            // whether voter's groups had
            // been loaded
            newState.voterScreen.loadedVoterGroups = false;

            // Boolean which indicates
            // whether to show the edit
            // Modal dialog for a group item
            newState.voterScreen.showItemGroupsModalDialog = false;

            // The Modal header of the group to be edited
            newState.voterScreen.editGroupModalHeader = '';

            // The index of the group to be deleted
            newState.voterScreen.editGroupIndex = -1;

            // An accessory array for editing an item of groups table
            newState.voterScreen.editSelectedGroups = [];

            // The voter's system user details
            newState.voterScreen.voterSystemUser = {
                id: 0,
                key: '',
                active: 0,
                password_date: '',
                voter_id: 0,
                role_name: '',
                team_name: ''
            };

            // The voter user's geographic filters
            newState.voterScreen.voterSystemUserGeographicFilters = [];

            // The voter user's geographic filters
            newState.voterScreen.voterSystemUserSectorialFilters = [];

            // The last campaign id
            newState.voterScreen.lastCampaignId = null;

            // Array of household voters
            newState.voterScreen.household = [];

            // Array of current voter
            // support status
            newState.voterScreen.oldHousehold = [];

            // Boolean which indicates whether to
            // show the update address Modal
            newState.voterScreen.showUpdateHouseholdAddressModal = false;

            // The update household Modal content
            newState.voterScreen.updateHouseholdAddressModalContent = '';

            // Index of household for updating address
            newState.voterScreen.updateHouseholdIndex = -1;

            // Boolean which indicates whether
            // to update all the household members
            // addresses
            newState.voterScreen.updateHouseholdAll = false;

            // The update household Modal header
            newState.voterScreen.updateHouseholdModalHeader = '';

            // The update household Modal content
            newState.voterScreen.updateHouseholdModalContent = '';

            // Key of house hold to be edited
            newState.voterScreen.editHouseholdKey = '';

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteSupportStatusModal = false;

            // The key of the household status to be deleted
            newState.voterScreen.deleteHouseholdKey = '';

            // The household delete's Modal header
            newState.voterScreen.deleteHouseholdModalHeader = '';

            // The household's support status key
            newState.voterScreen.deleteSupportStatusKey = '';

            // The metadata keys
            newState.voterScreen.metaDataKeys = [];

            // meta data keys with values ['willing_volunteer', 'agree_sign', 'explanation_material']
            newState.voterScreen.metaDataVolunteerKeys = [];

            // The metadata values
            newState.voterScreen.metaDataValues = [];

            // Voter Meta Hash table
            newState.voterScreen.voterMetaHash = [];

            // Voter Meta Hash backup table
            newState.voterScreen.oldVoterMetaHash = [];

            // Meta values by key id
            newState.voterScreen.metaValuesHashByKeyId = [];

            // Meta values by value id
            newState.voterScreen.metaValuesHashByValueId = [];

            // Voter supporrt statuses
            newState.voterScreen.supportStatuses = {
                // branch statuses
                voter_support_status_id0: 0,
                voter_support_status_key0: null,
                support_status_id0: '',
                support_status_name0: '',
                branch_updated_at: '',
                branch_create_user_id: '',
                voter_branch_first_name: '',
                voter_branch_last_name: '',

                // TM statuses
                voter_support_status_id1: 0,
                voter_support_status_key1: null,
                support_status_id1: '',
                support_status_name1: '',
                tm_updated_at: '',
                tm_create_user_id: '',
                voter_tm_first_name: '',
                voter_tm_last_name: ''
            };

            // Old Voter supporrt statuses
            newState.voterScreen.oldSupportStatuses = {
                // branch statuses
                voter_support_status_id0: 0,
                voter_support_status_key0: null,
                support_status_id0: '',
                support_status_name0: '',
                branch_updated_at: '',
                branch_create_user_id: '',
                voter_branch_first_name: '',
                voter_branch_last_name: '',

                // TM statuses
                voter_support_status_id1: 0,
                voter_support_status_key1: null,
                support_status_id1: '',
                support_status_name1: '',
                tm_updated_at: '',
                tm_create_user_id: '',
                voter_tm_first_name: '',
                voter_tm_last_name: ''
            };

            // voter campaigns Tm support statuses
            newState.voterScreen.voterCampaignsTmSupportStatuses = [];

            // voter campaigns Elections support statuses
            newState.voterScreen.voterCampaignsElectionsSupportStatuses = [];

            // voter campaigns Final support statuses
            newState.voterScreen.voterCampaignsFinalSupportStatuses = [];

            // vote sources
            newState.voterScreen.electionVoteSources = [];

            // Voter election campaigns data
            newState.voterScreen.voterElectionCampaigns = [];

            // Original voter election campaigns data
            newState.voterScreen.oldVoterElectionCampaigns = [];

            // The index of edited coter election campaign
            newState.voterScreen.editingVoterElectionCampaignsIndex = -1;

            // Modal for showing error in loading voter
            newState.voterScreen.showMissingVoterModal = false;

            // Content of error in loading voter Modal
            newState.voterScreen.missingVoterModalContent = "";

            // Input for seaching Voter by personal identity
            newState.voterScreen.personalIdentitySearchParam = "";

            /* This object includes the edit
             * support statuses for editing
             * support status states in voter
             * main block
             * The states are:
             *    text - for showing the support status name.
             *           on mouse over it will move to the link state
             *    link - showing link that on clicking will move to
             *           the edit state. mouse out will
             *      edit - will show a combo for editing the support status
             */
            newState.voterScreen.mainBlockSupportStatusState = "text";

            //Arrays related to institutes
            newState.voterScreen.instituteGroups = [];
            newState.voterScreen.instituteTypes = [];
            newState.voterScreen.instituteRoles = [];
            newState.voterScreen.instituteNetworks = [];
            newState.voterScreen.institutes = [];

            // Array of voter institutes
            newState.voterScreen.voterInstitutes = [];

            // Object for storing data when
            // adding a voter institute
            newState.voterScreen.newInstituteData = {
                institute_group_id: 0,
                institute_group_name: '',
                institute_type_id: 0,
                institute_type_name: '',
                institute_network_id: 0,
                institute_network_name: '',
                institute_id: 0,
                institute_name: '',
                institute_role_id: 0,
                institute_role_name: '',
                city_id: 0,
                city_name: '',
                types_list: [],
                institutes_list: [],
                roles_list: []
            };

            // A boolean which indicates whether
            // to show a row for adding new institute
            newState.voterScreen.showNewInstituteRow = false;

            // The index of the institute being edited
            newState.voterScreen.editInstituteIndex = -1;

            // Object for backing up
            // institute row's data
            newState.voterScreen.editInstituteBackup = {
                institute_group_id: 0,
                institute_group_name: '',
                institute_type_id: 0,
                institute_type_name: '',
                institute_network_id: 0,
                institute_network_name: '',
                institute_id: 0,
                institute_name: '',
                institute_role_id: 0,
                institute_role_name: '',
                city_id: 0,
                city_name: '',
                types_list: [],
                institutes_list: [],
                roles_list: []
            };

            // Boolean which indicates whether to
            // show the Modal Dialog for deleting
            // an institute row
            newState.voterScreen.showDeleteInstituteModalDialog = false;

            // The index of the institute to be deleted
            newState.voterScreen.deleteInstituteIndex = -1;

            // The institute delete's Modal header
            newState.voterScreen.deleteInstituteModalHeader = '';

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_OPEN_REQUEST_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showRequestModalDialog = true;

            newState.voterScreen.requestModalHeader = action.header;
            newState.voterScreen.requestModalContent = action.content;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_CLOSE_REQUEST_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showRequestModalDialog = false;

            newState.voterScreen.requestModalHeader = '';
            newState.voterScreen.requestModalContent = '';

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_TYPES_LOAD:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.actionTypesList = [...newState.voterScreen.actionTypesList];

            newState.voterScreen.actionTypesList = action.actionTypesList;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_STATUSES_LOAD:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.actionStatusesList = [...newState.voterScreen.actionStatusesList];

            newState.voterScreen.actionStatusesList = action.actionStatusesList;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_TOPICS_LOAD:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.actionTopicsList = [...newState.voterScreen.actionTopicsList];

            newState.voterScreen.actionTopicsList = action.actionTopicsList;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_NEW_ACTION_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen.newActionDetails = { ...newState.voterScreen.newActionDetails };

            newState.voterScreen.newActionDetails[action.fieldName] = action.fieldNewValue;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_EDIT_ACTION_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = {...newState.voterScreen};
            newState.voterScreen.actions = [...newState.voterScreen.actions];
            let editActionIndex = newState.voterScreen.editActionIndex;
            newState.voterScreen.actions[editActionIndex] = { ...newState.voterScreen.actions[editActionIndex] };

            newState.voterScreen.actions[editActionIndex][action.fieldName] = action.fieldNewValue;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_LOAD_TOPICS_BY_TYPE:
            var newState = { ...state };
            newState.voterScreen.voterActionTopicsList = { ...newState.voterScreen.voterActionTopicsList };

            newState.voterScreen.voterActionTopicsList = action.newTopicsList;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_ACTIONS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.actions = action.voterActions;
            return newState;
			
		case VoterActions.ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_TM_POLLS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.polls = action.voterPolls;
            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_REQUESTS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.requests = action.voterRequests;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_ADD_SHOW_SCREEN:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.addingNewActionShowScreen = true;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_ADD_HIDE_SCREEN:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // State of showing the voter add new action screen
            newState.voterScreen.addingNewActionShowScreen = false;

            // State of adding new action
            newState.voterScreen.addingNewAction = false;

            // Array which stores the
            // types according to the
            // chosen action type in
            // add new voter action
            newState.voterScreen.voterActionTopicsList = [];

            // Input fields for adding new action
            newState.voterScreen.newActionDetails = {
                action_type: '',
                action_topic: '',
                action_status: '',
                action_direction: '',
                target_date: '',
                details: '',
                conversationWith: '',
                action_type_id: 0,
                action_topic_id: 0,
                action_status_id: 0,
                conversation_direction: -1
            };

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_EDIT_ENABLE_EDITING:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.oldEditedAction = { ...newState.voterScreen.oldEditedAction };

            newState.voterScreen.editActionIndex = action.actionIndex;

            for (let voterActionField in newState.voterScreen.oldEditedAction) {
                newState.voterScreen.oldEditedAction[voterActionField] = newState.voterScreen.actions[action.actionIndex][voterActionField];
            }

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_EDIT_DISABLE_EDITING:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.oldEditedAction = { ...newState.voterScreen.oldEditedAction };
            newState.voterScreen.actions = { ...newState.voterScreen.actions };

            editActionIndex = newState.voterScreen.editActionIndex;

            for (let voterActionField in newState.voterScreen.oldEditedAction) {
                newState.voterScreen.actions[editActionIndex][voterActionField] = newState.voterScreen.oldEditedAction[voterActionField];
            }

            newState.voterScreen.editActionIndex = -1;

            newState.voterScreen.oldEditedAction = {
                action_type: 0,
                action_type_name: '',
                action_status_id: 0,
                action_status_name: '',
                action_direction: '',
                conversation_direction: '',
                action_date: '',
                description: '',
                conversation_with_other: '',
                action_topic_id: 0,
                action_topic_name: '',
                topics_list: []
            };

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.LOAD_VOTE_SOURCES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.electionVoteSources = action.data;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.LOADED_CAMPAIGNS_BY_VOTER:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            var voterElectionCampaigns = action.data;

            for (let campaignIndex = 0; campaignIndex < voterElectionCampaigns.length; campaignIndex++) {
                voterElectionCampaigns[campaignIndex].transport_name = "";

                switch (voterElectionCampaigns[campaignIndex].voter_transport_crippled) {
                    case 0:
                        voterElectionCampaigns[campaignIndex].transport_name = "כן";
                        break;

                    case 1:
                        voterElectionCampaigns[campaignIndex].transport_name = "נכה";
                        break;
                }
            }

            newState.voterScreen.voterElectionCampaigns = voterElectionCampaigns;
            newState.voterScreen.oldVoterElectionCampaigns = voterElectionCampaigns;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.ENABLE_ROW_EDITING:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterElectionCampaigns = [...newState.voterScreen.voterElectionCampaigns];
            newState.voterScreen.voterElectionCampaigns[action.rowIndex] = { ...newState.voterScreen.voterElectionCampaigns[action.rowIndex] };

            newState.voterScreen.editingVoterElectionCampaignsIndex = action.rowIndex;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.DISABLE_ROW_EDITING:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterElectionCampaigns = [...newState.voterScreen.voterElectionCampaigns];

            let rowIndex = newState.voterScreen.editingVoterElectionCampaignsIndex;
            newState.voterScreen.voterElectionCampaigns[rowIndex] = { ...newState.voterScreen.voterElectionCampaigns[rowIndex] };

            newState.voterScreen.voterElectionCampaigns[rowIndex] = newState.voterScreen.oldVoterElectionCampaigns[rowIndex];

            newState.voterScreen.editingVoterElectionCampaignsIndex = -1;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.SAVE_IN_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.oldVoterElectionCampaigns = [...newState.voterScreen.oldVoterElectionCampaigns];

            rowIndex = newState.voterScreen.editingVoterElectionCampaignsIndex;
            newState.voterScreen.oldVoterElectionCampaigns[rowIndex] = { ...newState.voterScreen.voterElectionCampaigns[rowIndex] };

            newState.voterScreen.editingVoterElectionCampaignsIndex = -1;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.TRANSPORT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterElectionCampaigns = [...newState.voterScreen.voterElectionCampaigns];

            rowIndex = newState.voterScreen.editingVoterElectionCampaignsIndex;
            newState.voterScreen.voterElectionCampaigns[rowIndex] = { ...newState.voterScreen.voterElectionCampaigns[rowIndex] };

            newState.voterScreen.voterElectionCampaigns[rowIndex].voter_transport_crippled = action.transportCrippled;
            newState.voterScreen.voterElectionCampaigns[rowIndex].transport_name = action.transportdName;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.TRANSPORT_DATE_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterElectionCampaigns = [...newState.voterScreen.voterElectionCampaigns];

            rowIndex = newState.voterScreen.editingVoterElectionCampaignsIndex;
            newState.voterScreen.voterElectionCampaigns[rowIndex] = { ...newState.voterScreen.voterElectionCampaigns[rowIndex] };
            newState.voterScreen.voterElectionCampaigns[rowIndex]['voter_transport_' + action.timeType] = action.timeValue;

            return newState;


        case VoterActions.ActionTypes.VOTER_ELECTION_CAMPAIGN.VOTER_DID_VOTE_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterElectionCampaigns = [...newState.voterScreen.voterElectionCampaigns];

            rowIndex = newState.voterScreen.editingVoterElectionCampaignsIndex;
            newState.voterScreen.voterElectionCampaigns[rowIndex] = { ...newState.voterScreen.voterElectionCampaigns[rowIndex] };

            newState.voterScreen.voterElectionCampaigns[rowIndex].did_vote = action.didVote;
            newState.voterScreen.voterElectionCampaigns[rowIndex].did_vote_name = action.didVoteName;

            return newState;


        case VoterActions.ActionTypes.VOTER_SUPPORT.SUPPORTS_STATUSES_LOADED:
            var newState = { ...state };
            newState.searchVoterScreen = { ...state.searchVoterScreen };
            newState.searchVoterScreen.supportStatuses = action.data;
            return newState;


        case VoterActions.ActionTypes.VOTER_SUPPORT.LOADED_VOTER_SUPPORT_DATA:
            var newState = { ...state };
            newState.searchVoterScreen = { ...state.searchVoterScreen };
            newState.searchVoterScreen.currentVoterSupportData = action.data;
            return newState;


        case VoterActions.ActionTypes.VOTER_SUPPORT.SUPPORT_STATUS_CHANGE:
            var newState = { ...state };
            newState.searchVoterScreen = { ...state.searchVoterScreen };
            newState.searchVoterScreen.currentVoterSupportData = { ...state.searchVoterScreen.currentVoterSupportData };
            newState.searchVoterScreen.currentVoterSupportData.firstTypeSupport = { ...state.searchVoterScreen.currentVoterSupportData.firstTypeSupport };
            newState.searchVoterScreen.currentVoterSupportData.firstTypeSupport.support_status_name = { ...state.searchVoterScreen.currentVoterSupportData.firstTypeSupport.support_status_name };
            newState.searchVoterScreen.currentVoterSupportData.firstTypeSupport.support_status_name.support_status_name = action.data;
            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_SHOW_NEW_ROW:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            let repStartDate = parseDateToPicker(new Date());

            newState.voterScreen.showNewRepresentativeRow = true;

            newState.voterScreen.newRepresentativeDetails.start_date = moment(repStartDate).format('YYYY-MM-DD');
            newState.voterScreen.newRepresentativeDetails.end_date = null;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_HIDE_NEW_ROW:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showNewRepresentativeRow = false;

            // Object that stores the data
            // for adding a new representative row
            newState.voterScreen.newRepresentativeDetails = {
                city: '',
                role: '',
                city_id: 0,
                role_id: 0,
                start_date: '',
                end_date: ''
            };

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_LOAD_ROLES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.representativeRoles = action.representativeRoles;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_CITY_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            newState.voterScreen.newRepresentativeDetails.city = action.city;

            return newState;


        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_CITY_ID_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            newState.voterScreen.newRepresentativeDetails.city_id = action.city_id;

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ROLE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            newState.voterScreen.newRepresentativeDetails.role = action.role;

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ROLE_ID_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            newState.voterScreen.newRepresentativeDetails.role_id = action.role_id;

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_START_DATE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            newState.voterScreen.newRepresentativeDetails.start_date = action.start_date;

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_END_DATE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newRepresentativeDetails = { ...newState.voterScreen.newRepresentativeDetails };

            newState.voterScreen.newRepresentativeDetails.end_date = action.end_date;

            return newState;

        case VoterActions.ActionTypes.ACTIVIST.FETCHED_MINIMAL_VOTER_DATA:
            var newState = { ...state };
            newState.voterActivistHouseholdsScreen = { ...newState.voterActivistHouseholdsScreen };
            newState.voterActivistHouseholdsScreen.id = action.data.id;
            newState.voterActivistHouseholdsScreen.key = action.data.key;
            newState.voterActivistHouseholdsScreen.personal_identity = action.data.personal_identity;
            newState.voterActivistHouseholdsScreen.first_name = action.data.first_name;
            newState.voterActivistHouseholdsScreen.last_name = action.data.last_name;
            newState.voterActivistHouseholdsScreen.address = action.data.city;
            newState.voterActivistHouseholdsScreen.sum = action.data.sum;
            newState.voterActivistHouseholdsScreen.phone_number = action.data.phone_number;
            newState.voterActivistHouseholdsScreen.comment = action.data.comment;
            newState.voterActivistHouseholdsScreen.created_at = action.data.created_at;
            newState.voterActivistHouseholdsScreen.creating_user = action.data.creating_user;
            newState.voterActivistHouseholdsScreen.is_minister_of_fifty = action.data.is_minister_of_fifty;
            newState.voterActivistHouseholdsScreen.households = action.data.households;
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.SET_CONFIRM_DELETE:
            var newState = { ...state };
            newState.voterActivistHouseholdsScreen = { ...newState.voterActivistHouseholdsScreen };
            newState.voterActivistHouseholdsScreen.showConfirmDelete = action.data;
            newState.voterActivistHouseholdsScreen.deleteRowIndex = action.rowIndex;
            return newState;


        case VoterActions.ActionTypes.ACTIVIST.FETCHED_VOTER_ACTIVIST_HOUSEHOLDS_DATA:
            var newState = { ...state };
            newState.voterActivistHouseholdsScreen = { ...newState.voterActivistHouseholdsScreen };
            newState.voterActivistHouseholdsScreen.detailedHouseholds = action.data;
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_HOUSEHOLDS_SCREEN_TAB_CHANGE:
            var newState = { ...state };
            newState.voterActivistHouseholdsScreen = { ...newState.voterActivistHouseholdsScreen };
            newState.voterActivistHouseholdsScreen.activistHouseholdTab = action.activistTab;
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.ADDED_VOTER_ACTIVIST_ROLE:
            var newState = { ...state };
            newState.searchActivistScreen = { ...newState.searchActivistScreen };
            newState.searchActivistScreen.results.data[action.roleIndex].election_roles_by_voter.push(action.data);
            newState.searchActivistScreen.showAddNewVoterActivistRole = false;
            newState.searchActivistScreen.addNewActivistRoleScreen = { ...newState.searchActivistScreen.addNewActivistRoleScreen };
            newState.searchActivistScreen.addNewActivistRoleScreen.voter_key = '';
            newState.searchActivistScreen.addNewActivistRoleScreen.role_row_index = -1;
            newState.searchActivistScreen.addNewActivistRoleScreen.role_name = '';
            newState.searchActivistScreen.addNewActivistRoleScreen.phone_number = '';
            newState.searchActivistScreen.addNewActivistRoleScreen.sum = '';
            newState.searchActivistScreen.addNewActivistRoleScreen.comment = ''
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.SET_BOTTOM_TOTAL_ERROR:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.showBottomError = (action.data == true);
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.SET_ADDING_NEW_VOTER_ACTIVIST_ROLE:
            var newState = { ...state };
            newState.searchActivistScreen = { ...newState.searchActivistScreen };
            newState.searchActivistScreen.showAddNewVoterActivistRole = (action.showModal == true);
            newState.searchActivistScreen.addNewActivistRoleScreen = { ...newState.searchActivistScreen.addNewActivistRoleScreen };
            newState.searchActivistScreen.addNewActivistRoleScreen.voter_key = action.voterKey;
            newState.searchActivistScreen.addNewActivistRoleScreen.role_row_index = action.rowIndex;
            newState.searchActivistScreen.addNewActivistRoleScreen.voterMobileNumber = action.voterMobileNumber;
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.TABLE_CONTENT_UPDATED:
            var newState = { ...state };
            var searchActivistScreen = { ...newState.searchActivistScreen };
            searchActivistScreen.tableHasScrollbar = action.hasScrollbar;
            newState.searchActivistScreen = searchActivistScreen;
            return newState;

            case VoterActions.ActionTypes.ACTIVIST.SET_EDITING_EXISTING_VOTER_ACTIVIST_ROLE:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.showEditExistingVoterActivistRole = (action.showModal == true);
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.CLEAR_ALL_SEARCH_FIELDS_AND_RESULTS:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.personal_identity = '';
            newState.searchActivistScreen.first_name = '';
            newState.searchActivistScreen.last_name = '';
            newState.searchActivistScreen.city = '';
            newState.searchActivistScreen.phone_number = '';
            newState.searchActivistScreen.street = '';
            newState.searchActivistScreen.activist_type = '';
            newState.searchActivistScreen.isSearching = false;
            newState.searchActivistScreen.showErrorModal = false;
            newState.searchActivistScreen.showErrorModalTitle = '';
            newState.searchActivistScreen.showErrorModalContent = '';
            newState.searchActivistScreen.showAddNewVoterActivistRole = false;
            newState.searchActivistScreen.showEditExistingVoterActivistRole = false;
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.RESET_RESULTS_DATA:
            var newState = { ...state };
            newState.searchActivistScreen.resultsPageIndex = 0;
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.results = { total_records: 0, isThereMoreData:false, data: [] };
            return newState;

        case VoterActions.ActionTypes.ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.showErrorModal = true;
            newState.searchActivistScreen.showErrorModalTitle = action.errorTitle;
            newState.searchActivistScreen.showErrorModalContent = action.errorContent;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CLEAR_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.showErrorModal = false;
            newState.searchActivistScreen.showErrorModalTitle = '';
            newState.searchActivistScreen.showErrorModalContent = '';
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.SET_SEARCHING_VOTER_ACTIVIST:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen.isSearching = (action.data == true);
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FOUND_SEARCH_ACTIVIST_RESULTS:
            var newState = { ...state };
            newState.searchActivistScreen.results = { ...newState.searchActivistScreen.results };
            newState.searchActivistScreen.results.data = _.union(newState.searchActivistScreen.results.data, action.searchResults.data);
            newState.searchActivistScreen.results.total_records = action.searchResults.total_records;
            newState.searchActivistScreen.results.isThereMoreData = action.searchResults.is_there_more_data;
            newState.searchActivistScreen.resultsPageIndex++;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_RECORD_BASIC_DATA:
            var newState = { ...state };
            newState.voterActivistHouseholdsScreen = { ...state.voterActivistHouseholdsScreen };
            newState.voterActivistHouseholdsScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE:
            var newState = { ...state };
            newState.searchActivistScreen.addNewActivistRoleScreen = { ...newState.searchActivistScreen.addNewActivistRoleScreen };
            newState.searchActivistScreen.addNewActivistRoleScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_FIELD_CHANGE:
            var newState = { ...state };
            newState.searchActivistScreen = { ...state.searchActivistScreen };
            newState.searchActivistScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ROLES_LOADED:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.election_roles = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ROLE_SHIFTS_LOADED:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.election_role_shifts = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.VOTER_ROLES_LOADED:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.voter_roles = action.data;
            newState.activistScreen.old_voter_roles = action.data;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_LOAD_ALL_VOTER_REPRESENTATIVES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterDetails = { ...newState.voterDetails };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };

            newState.voterScreen.representatives = action.representativeList;
            newState.voterScreen.oldRepresentatives = action.representativeList;

            newState.voterDetails.shas_representative_role_name = action.shas_representative_role_name;
            newState.voterDetails.shas_representative_city_name = action.shas_representative_city_name;

            newState.oldVoterDetails.shas_representative_role_name = action.shas_representative_role_name;
            newState.oldVoterDetails.shas_representative_city_name = action.shas_representative_city_name;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_DELETE_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.voterRoleDeleteIndex = action.voterRoleDeleteIndex;
            newState.activistScreen.showDeleteModalDialog = true;

            newState.activistScreen.deleteModalHeader = 'מחיקת תפקיד של פעיל בחירות';
            newState.activistScreen.deleteConfirmText = 'האם את/ה בטוח/?';

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_FIFTY_MINISTER_DELETE_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.showDeleteModalDialog = true;

            newState.activistScreen.deleteModalHeader = 'מחיקת שר מאה';
            newState.activistScreen.deleteConfirmText = 'האם את/ה בטוח/?';

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_DELETE_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voterGeoEntityKey = action.data;
            newState.activistScreen.showDeleteModalDialog = true;
            newState.activistScreen.deleteModalHeader = 'מחיקת יישות גיאוגרפית';
            newState.activistScreen.deleteConfirmText = 'האם את/ה בטוח/?';
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_DELETE_HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.voterRoleDeleteIndex = -1;
            newState.activistScreen.voterGeoEntityKey = '';

            newState.activistScreen.showDeleteModalDialog = false;

            newState.activistScreen.deleteModalHeader = '';
            newState.activistScreen.deleteConfirmText = '';

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.VOTER_ROLE_DELETE_FROM_STATE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.old_voter_roles = [...state.activistScreen.old_voter_roles];

            newState.activistScreen.voter_roles.splice(newState.activistScreen.voterRoleDeleteIndex, 1);
            newState.activistScreen.old_voter_roles.splice(newState.activistScreen.voterRoleDeleteIndex, 1);

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_SHOW_MODAL_DIALOG:
            var modalDeleteText = 'מחיקת נציג';

            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteRepresentativeModalDialog = true;

            // The key of the representative to be deleted
            newState.voterScreen.deleteModalRepresentativeHeader = modalDeleteText;

            // The key of the representative to be deleted
            newState.voterScreen.deleteRepresentativeKey = action.deleteRepresentativeKey;

            // The index of the representative to be deleted
            newState.voterScreen.deleteRepresentativeIndex = action.deleteRepresentativeIndex;

            // The delete Modal Dialog confirm text
            newState.voterScreen.deleteConfirmText = 'האם את/ה בטוח/ה ?';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // A boolen that indicates whther to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteRepresentativeModalDialog = false;

            // The index of the representative to be deleted
            newState.voterScreen.deleteRepresentativeIndex = -1;

            // The key of the representative to be deleted
            newState.voterScreen.deleteModalRepresentativeHeader = '';

            // The key of the representative to be deleted
            newState.voterScreen.deleteRepresentativeKey = '';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ENABLE_EDITING:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // The key of the representative to be edited
            newState.voterScreen.editingRepresentativeKey = action.editingRepresentativeKey;

            // The index of the representative to be edited
            newState.voterScreen.editingRepresentativeIndex = action.editingRepresentativeIndex;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DISABLE_EDITING:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // The key of the representative to be edited
            newState.voterScreen.editingRepresentativeKey = '';

            // The index of the representative to be edited
            newState.voterScreen.editingRepresentativeIndex = -1;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.representatives[action.representativeIndex] = { ...newState.voterScreen.representatives[action.representativeIndex] };

            newState.voterScreen.representatives[action.representativeIndex].city_name = action.city;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_CITY_ID_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.representatives[action.representativeIndex] = { ...newState.voterScreen.representatives[action.representativeIndex] };

            newState.voterScreen.representatives[action.representativeIndex].city_id = action.city_id;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.representatives[action.representativeIndex] = { ...newState.voterScreen.representatives[action.representativeIndex] };

            newState.voterScreen.representatives[action.representativeIndex].role_name = action.role;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_ROLE_ID_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.representatives[action.representativeIndex] = { ...newState.voterScreen.representatives[action.representativeIndex] };

            newState.voterScreen.representatives[action.representativeIndex].role_id = action.role_id;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_START_DATE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.representatives[action.representativeIndex] = { ...newState.voterScreen.representatives[action.representativeIndex] };

            newState.voterScreen.representatives[action.representativeIndex].start_date = action.start_date;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_END_DATE_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.representatives[action.representativeIndex] = { ...newState.voterScreen.representatives[action.representativeIndex] };

            newState.voterScreen.representatives[action.representativeIndex].end_date = action.end_date;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_DELETE_REPRESENTATIVE_FROM_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.oldRepresentatives = [...newState.voterScreen.oldRepresentatives];

            newState.voterScreen.representatives.splice(newState.voterScreen.deleteRepresentativeIndex, 1);
            newState.voterScreen.oldRepresentatives.splice(newState.voterScreen.deleteRepresentativeIndex, 1);

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_EDIT_REPRESENTATIVE_IN_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.oldRepresentatives = [...newState.voterScreen.oldRepresentatives];

            let editingRepresentativeIndex = newState.voterScreen.editingRepresentativeIndex;
            newState.voterScreen.representatives[editingRepresentativeIndex] = { ...newState.voterScreen.representatives[editingRepresentativeIndex] };
            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex] = { ...newState.voterScreen.oldRepresentatives[editingRepresentativeIndex] };

            newState.voterScreen.representatives[editingRepresentativeIndex].city_id = action.data.city_id;
            newState.voterScreen.representatives[editingRepresentativeIndex].city_name = action.data.city_name;
            newState.voterScreen.representatives[editingRepresentativeIndex].role_id = action.data.role_id;
            newState.voterScreen.representatives[editingRepresentativeIndex].role_name = action.data.role_name;
            newState.voterScreen.representatives[editingRepresentativeIndex].start_date = action.data.start_date;
            newState.voterScreen.representatives[editingRepresentativeIndex].end_date = action.data.end_date;

            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex].city_id = action.data.city_id;
            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex].city_name = action.data.city_name;
            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex].role_id = action.data.role_id;
            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex].role_name = action.data.role_name;
            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex].start_date = action.data.start_date;
            newState.voterScreen.oldRepresentatives[editingRepresentativeIndex].end_date = action.data.end_date;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_BACKUP_FROM_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];

            editingRepresentativeIndex = newState.voterScreen.editingRepresentativeIndex;
            newState.voterScreen.representatives[editingRepresentativeIndex] = { ...newState.voterScreen.representatives[editingRepresentativeIndex] };

            let representativesFields = ['city_id', 'city_name', 'role_id', 'role_name', 'start_date',
                'end_date'];

            for (let fieldIndex = 0; fieldIndex < representativesFields.length; fieldIndex++) {
                let fieldName = representativesFields[fieldIndex];

                newState.voterScreen.representatives[editingRepresentativeIndex][fieldName] = newState.voterScreen.oldRepresentatives[editingRepresentativeIndex][fieldName];
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_REPRESENTATIVE_ADD_REPRESENTATIVE_TO_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.representatives = [...newState.voterScreen.representatives];
            newState.voterScreen.oldRepresentatives = [...newState.voterScreen.oldRepresentatives];

            newState.voterScreen.representatives.push(action.data);
            newState.voterScreen.oldRepresentatives.push(action.data);

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_SHOW_ADD_ROLE_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            //newState.activistScreen.addNewRecordData = {...state.activistScreen.addNewRecordData};

            /*newState.activistScreen.editRoleRowIndex = -1;
             newState.activistScreen.addingNewRole = true;
             newState.activistScreen.editingExistingRole = false;*/
            newState.activistScreen.addingNewRole = true;
            newState.activistScreen.editRoleRowIndex = -1;

            newState.activistScreen.voter_roles.push({
                id: 0,
                election_campaign_id: 0,
                election_role_id: 0,
                CampaignName: "",
                RoleName: "",
                election_roles_geographical: []
            });

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_EDIT_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.editRoleRowIndex = action.rowIndex;

            newState.activistScreen.addingNewRole = false;
            newState.activistScreen.editingExistingRole = true;
            newState.activistScreen.addEditActivistRoleHeader = 'עדכון תפקיד קיים';
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.VOTER_CAMPAIGN_METADATA_LOADED:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.campaignMetadata = action.data;

            return newState;
            break;


        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ROW_CAMPAIGN:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.rowIndex].CampaignName = action.campName;

            return newState;
            break;


        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ROW_ROLE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.rowIndex] = { ...newState.activistScreen.voter_roles[action.rowIndex] };

            newState.activistScreen.voter_roles[action.rowIndex].RoleName = action.roleName;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ROW_ROLE_ID:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.rowIndex] = { ...newState.activistScreen.voter_roles[action.rowIndex] };

            newState.activistScreen.voter_roles[action.rowIndex].election_role_id = action.roleId;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_EDIT_ROW_CHANGE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.roleIndex] = { ...newState.activistScreen.voter_roles[action.roleIndex] };
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical = [...newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical];
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex] = { ...newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex] };

            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].entity_type = action.entityType;
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].entity_id = action.entityID;

            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].election_role_shift_id = action.roleShiftId;
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].role_shift_name = action.roleShiftName;

            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].area_name = action.geoData.area_name;
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].city_name = action.geoData.city_name;
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].neighborhood_name = action.geoData.neighborhood_name;
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].cluster_name = action.geoData.cluster_name;
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical[action.geoIndex].ballot_name = action.geoData.ballot_name;


            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_ADD_ROW_CHANGE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.roleIndex] = { ...newState.activistScreen.voter_roles[action.roleIndex] };
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical = [...newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical];

            let newRolegGographicalItem = {
                id: 0,
                geographic_key: "",
                entity_type: action.entityType,
                entity_id: action.entityID,
                election_role_shift_id: action.roleShiftId,
                role_shift_name: action.roleShiftName,
                area_name: action.geoData.area_name,
                city_name: action.geoData.city_name,
                neighborhood_name: action.geoData.neighborhood_name,
                cluster_name: action.geoData.cluster_name,
                ballot_name: action.geoData.ballot_name
            };

            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical.push(newRolegGographicalItem);

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.GEO_ENTITY_DELETE_ROW_CHANGE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.roleIndex] = { ...newState.activistScreen.voter_roles[action.roleIndex] };
            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical = [...newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical];

            newState.activistScreen.voter_roles[action.roleIndex].election_roles_geographical.splice(action.geoIndex, 1);

            return newState;
            break;


        case VoterActions.ActionTypes.ACTIVIST.INJECT_EXISTING_ROLE_DATA:
            var newState = { ...state };

            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addEditActivistRoleHeader = '';

            newState.activistScreen.addNewRecordData.campaignName = action.data.CampaignName;

            newState.activistScreen.addNewRecordData.activistRole = action.data.RoleName;

            newState.activistScreen.addNewRecordData.roleShift = action.data.ShiftName;
            newState.activistScreen.addNewRecordData.roleArea = action.data.area_name;

            newState.activistScreen.addNewRecordData.roleCity = action.data.city_name;

            newState.activistScreen.addNewRecordData.roleNeighborhood = action.data.neighborhood_name;

            newState.activistScreen.addNewRecordData.roleCluster = action.data.cluster_name;
            newState.activistScreen.addNewRecordData.roleBallot = action.data.ballot_name;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_HIDE_ADD_ROLE_DIALOG:
            var newState = { ...state };

            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewRoleData = { ...state.activistScreen.addNewRoleData };

            newState.activistScreen.editRoleRowIndex = -1;
            newState.activistScreen.addingNewRole = false;
            newState.activistScreen.editingExistingRole = false;

            newState.activistScreen.addNewRoleData.roleName = '';
            newState.activistScreen.addNewRoleData.campaignName = '';

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CAMP_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewRecordData = { ...state.activistScreen.addNewRecordData };
            newState.activistScreen.addNewRecordData.campaignName = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_ROLE_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewRecordData = { ...state.activistScreen.addNewRecordData };
            newState.activistScreen.addNewRecordData.activistRole = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_ROLE_SHIFT_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addNewGeoRecordData.roleShift = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ADDRESSES.LOADED_ALL_AREAS:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.areas = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_AREA_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addNewGeoRecordData.roleArea = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CITY_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addNewGeoRecordData.roleCity = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.SET_ROW_EDITING:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];

            newState.activistScreen.editingExistingRole = true;
            newState.activistScreen.editRoleRowIndex = action.rowIndex;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.UNSET_ROW_EDITING:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.voter_roles = [...state.activistScreen.voter_roles];
            newState.activistScreen.voter_roles[action.rowIndex] = { ...newState.activistScreen.voter_roles[action.rowIndex] };

            /*if (action.rowIndex != undefined && action.oldRoleName != undefined && action.oldCampaignName != undefined) {
             newState.activistScreen.voter_roles[action.rowIndex].is_editing = false;
             newState.activistScreen.voter_roles[action.rowIndex].CampaignName = action.oldCampaignName;
             newState.activistScreen.voter_roles[action.rowIndex].RoleName = action.oldRoleName;
             newState.activistScreen.voter_roles[action.rowIndex].election_role_id = action.oldRoleId;
             }*/

            if (newState.activistScreen.addingNewRole) {
                newState.activistScreen.voter_roles.splice(action.rowIndex, 1);
            } else {
                newState.activistScreen.voter_roles[action.rowIndex] = newState.activistScreen.old_voter_roles[action.rowIndex];
            }

            newState.activistScreen.editingExistingRole = false;
            newState.activistScreen.editRoleRowIndex = -1;
            newState.activistScreen.addingNewRole = false;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.VOTER_ROLE_SAVE_IN_STATE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.old_voter_roles = [...state.activistScreen.old_voter_roles];
            newState.activistScreen.old_voter_roles[action.roleIndex] = { ...newState.activistScreen.old_voter_roles[action.roleIndex] };

            newState.activistScreen.old_voter_roles[action.roleIndex] = newState.activistScreen.voter_roles[action.roleIndex];

            newState.activistScreen.editingExistingRole = false;
            newState.activistScreen.editRoleRowIndex = -1;
            newState.activistScreen.addingNewRole = false;

            return newState;
            break;


        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_NEIGHBORHOOD_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addNewGeoRecordData.roleNeighborhood = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_SHOW_ERROR_DLG:
            var newState = { ...state };
            newState.showModalWindow = true;
            newState.modalHeaderText = action.headerText;
            newState.modalContentText = action.contentText;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.VOTER_MINISTER_OF_FIFTY_LOADED:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ministerOfFifty = { ...state.activistScreen.ministerOfFifty };

            newState.activistScreen.ministerOfFifty = action.data;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ALLOACATE_VOTER_TO_CAPTAIN50:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ministerOfFifty = { ...state.activistScreen.ministerOfFifty };

            newState.activistScreen.ministerOfFifty = action.data;

            return newState;
            break;


        case VoterActions.ActionTypes.ACTIVIST.UNALLOACATE_VOTER_TO_CAPTAIN50:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ministerOfFifty = { ...state.activistScreen.ministerOfFifty };

            newState.activistScreen.ministerOfFifty = {};

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.VOTER_MINISTER_OF_FIFTY_UNSET:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ministerOfFifty = { ...state.activistScreen.ministerOfFifty };

            newState.activistScreen.ministerOfFifty.id = 0;
            newState.activistScreen.ministerOfFifty.first_name = "";
            newState.activistScreen.ministerOfFifty.last_name = "";
            newState.activistScreen.ministerOfFifty.city = "";
            newState.activistScreen.ministerOfFifty.changed = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.CLOSE_MODAL_DIALOG:
            var newState = { ...state };
            newState.showModalWindow = false;
            newState.modalHeaderText = '';
            newState.modalContentText = '';
            return newState;
            break;


        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_CLUSTER_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addNewGeoRecordData.roleCluster = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_ELECTION_BALLOT_NEW_ROW:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addNewGeoRecordData.roleBallot = action.data;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.LOAD_VOTER_META_WILLING_VOLUNTEERS:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.willingVolunteerValuesList = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.LOAD_VOTER_META_AGREE_SIGN:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.agreeSignValuesList = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.LOAD_VOTER_META_EXP_MATERIAL:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.expMaterialValuesList = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.CHANGE_VOTER_META_COMBO_VALUE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.campaignMetadata = [...state.activistScreen.campaignMetadata];
            newState.activistScreen.campaignMetadata[action.rowIndex].value = action.newValue;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.LOADED_ALL_CAMPAIGNS:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.campaigns = action.data;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.NEW_CAMP_NAME_CHANGE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewRoleData = { ...state.activistScreen.addNewRoleData };
            newState.activistScreen.addNewRoleData.campaignName = action.data
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.NEW_ROLE_NAME_CHANGE:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewRoleData = { ...state.activistScreen.addNewRoleData };
            newState.activistScreen.addNewRoleData.roleName = action.data
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FIFTY_MINISTER_HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.ministerFiftyVoterData = {
                first_name: '',
                last_name: '',
                mi_city: '',
                key: ''
            };

            newState.activistScreen.addingNewFiftyMinister = false;
            newState.activistScreen.editingFiftyMinister = false;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FIFTY_MINISTER_ADD_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.addingNewFiftyMinister = true;
            newState.activistScreen.editingFiftyMinister = false;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FIFTY_MINISTER_EDIT_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            newState.activistScreen.addingNewFiftyMinister = false;
            newState.activistScreen.editingFiftyMinister = true;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FIFTY_MINISTER_ADD_CAPTAIN_OF_FIFTY:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ministerOfFifty = { ...newState.activistScreen.ministerOfFifty };

            newState.activistScreen.ministerOfFifty = {
                c_key: '',
                captain_id: action.ministerOfFiftyData.captain_id,
                city: action.ministerOfFiftyData.city,
                first_name: action.ministerOfFiftyData.first_name,
                last_name: action.ministerOfFiftyData.last_name,
                changed: true
            };

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FIFTY_MINISTER_EDIT_CAPTAIN_OF_FIFTY:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ministerOfFifty = { ...newState.activistScreen.ministerOfFifty };

            newState.activistScreen.ministerOfFifty.captain_id = action.ministerOfFiftyData.captain_id;
            newState.activistScreen.ministerOfFifty.city = action.ministerOfFiftyData.city;
            newState.activistScreen.ministerOfFifty.first_name = action.ministerOfFiftyData.first_name;
            newState.activistScreen.ministerOfFifty.last_name = action.ministerOfFiftyData.last_name;
            newState.activistScreen.ministerOfFifty.changed = true;

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.LOADED_FIFTY_MINISTER_VOTER_BY_ID:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };

            if (action.data == null) {
                newState.activistScreen.ministerFiftyVoterData = {
                    first_name: '',
                    last_name: '',
                    mi_city: '',
                    key: ''
                };
            } else {
                newState.activistScreen.ministerFiftyVoterData = action.data;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.FIFTY_MINISTER_SHOW_ERROR_DLG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.errorMessage = action.headerText + action.contentText;
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.addNewGeoRecordData = { ...state.activistScreen.addNewGeoRecordData };
            newState.activistScreen.addingNewGeoRole = false;
            newState.activistScreen.editingExistingGeoRole = false;
            newState.activistScreen.addNewGeoRecordData.roleArea = '';
            newState.activistScreen.addNewGeoRecordData.roleCity = '';
            newState.activistScreen.addNewGeoRecordData.roleNeighborhood = '';
            newState.activistScreen.addNewGeoRecordData.roleCluster = '';
            newState.activistScreen.addNewGeoRecordData.roleBallot = '';
            newState.activistScreen.addNewGeoRecordData.roleShift = '';
            newState.activistScreen.addNewGeoRecordData.roleKey = '';
            return newState;
            break;

        case VoterActions.ActionTypes.ACTIVIST.ACTIVIST_ADD_SHOW_MODAL_DIALOG:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            if (action.addingNewGeoRole) {
                newState.activistScreen.addingNewGeoRole = true;
            }
            if (action.editingExistingGeoRole) {
                newState.activistScreen.editingExistingGeoRole = true;
            }
            newState.activistScreen.addNewGeoRecordData.campName = action.campName;
            newState.activistScreen.addNewGeoRecordData.roleName = action.roleName;
            newState.activistScreen.addNewGeoRecordData.recordID = action.recordID;
            newState.activistScreen.addNewGeoRecordData.roleIndex = action.roleIndex;
            newState.activistScreen.addNewGeoRecordData.geoIndex = action.geoIndex;

            if (action.roleShiftName != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleShift = action.roleShiftName;
            }

            if (action.roleArea != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleArea = action.roleArea;
            }
            if (action.roleCity != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleCity = action.roleCity;
            }
            if (action.roleNeighborhood != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleNeighborhood = action.roleNeighborhood;
            }
            if (action.roleCluster != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleCluster = action.roleCluster;
            }
            if (action.roleBallot != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleBallot = action.roleBallot;
            }
            if (action.roleKey != undefined) {
                newState.activistScreen.addNewGeoRecordData.roleKey = action.roleKey;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.ADDRESSES.LOADED_ALL_CITIES:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.cities = action.data
            return newState;
            break;

        case VoterActions.ActionTypes.ADDRESSES.LOADED_ALL_NEIGHBORHOODS:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.neighborhoods = action.data
            return newState;
            break;

        case VoterActions.ActionTypes.ADDRESSES.LOADED_ALL_CLUSTERS:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.clusters = action.data
            return newState;
            break;

        case VoterActions.ActionTypes.ADDRESSES.LOADED_ALL_BALLOTS:
            var newState = { ...state };
            newState.activistScreen = { ...state.activistScreen };
            newState.activistScreen.ballots = action.data
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_LOAD_ALL_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.voterGroups = action.voterGroups;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_ADD_TO_NEW_SELECTED_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newSelectedGroups = [...newState.voterScreen.newSelectedGroups];
            newState.voterScreen.newSelectedGroups[action.groupIndex] = { ...newState.voterScreen.newSelectedGroups[action.groupIndex] };
            // Quick and dirty remove the selected group and it's children
            newState.voterScreen.newSelectedGroups.length = action.groupIndex;
            newState.voterScreen.disabledGroupsButtonOk = false;
            // If no group is not valid, then
            // don't insert it to the newSelectedGroups array
            if (action.selectedGroupId > 0) {
                // Add the selected group to newSelectedGroups
                newState.voterScreen.newSelectedGroups.push({ id: action.selectedGroupId, name: action.selectedGroupName });
            } else if (action.selectedGroupName != '') {
                newState.voterScreen.newSelectedGroups.push({ id: -1, name: action.selectedGroupName });
                newState.voterScreen.disabledGroupsButtonOk = true;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_SHOW_NEW_GROUP_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showNewGroupsModalDialog = true;
            newState.voterScreen.newGroupsModalHeader = 'הוספה לקבוצה';

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_HIDE_NEW_GROUP_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newSelectedGroups = [...newState.voterScreen.newSelectedGroups];

            newState.voterScreen.showNewGroupsModalDialog = false;
            newState.voterScreen.newGroupsModalHeader = '';
            newState.voterScreen.newSelectedGroups = [];

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_LOAD_VOTER_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...action.voterInGroups];
            return newState;
        break
        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_LOAD_ITEM_SELECTED_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...newState.voterScreen.voterInGroups];

            let voterGroups = newState.voterScreen.voterGroups;
            let voterInGroups = newState.voterScreen.voterInGroups;

            for (let groupIndex = 0; groupIndex < voterInGroups.length; groupIndex++) {
                newState.voterScreen.voterInGroups[groupIndex] = { ...newState.voterScreen.voterInGroups[groupIndex] };

                let groupItem = voterInGroups[groupIndex];
                let parentId = groupItem.parent_id;
                let selectedGroups = [{ id: groupItem.id, name: groupItem.name }];

                while (parentId > 0) {
                    let parentIndex = voterGroups.findIndex(voterGroupItem => voterGroupItem.id == parentId);
                    if (parentIndex >= 0) {
                        let parentItem = voterGroups[parentIndex];

                        selectedGroups.push({ id: parentItem.id, name: parentItem.name });
                        parentId = parentItem.parent_id;
                    } else {
                        parentId = -1;
                    }
                }

                selectedGroups.reverse();

                newState.voterScreen.voterInGroups[groupIndex].selectedGroups = selectedGroups;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_DELETE_SHOW_MODAL_DIALOG:
            var modalHeaderText = 'מחיקת קבוצה ';

            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...newState.voterScreen.voterInGroups];
            newState.voterScreen.voterInGroups[action.deleteGroupIndex] = { ...newState.voterScreen.voterInGroups[action.deleteGroupIndex] };


            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteGroupModalDialog = true;

            // The index of the group to be deleted
            newState.voterScreen.deleteGroupIndex = action.deleteGroupIndex;

            // The Modal header of the group to be deleted
            newState.voterScreen.deleteModalGroupHeader = modalHeaderText;
            newState.voterScreen.deleteModalGroupHeader += newState.voterScreen.voterInGroups[action.deleteGroupIndex].name;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_DELETE_HIDE_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...newState.voterScreen.voterInGroups];
            newState.voterScreen.voterInGroups[action.deleteGroupIndex] = { ...newState.voterScreen.voterInGroups[action.deleteGroupIndex] };


            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteGroupModalDialog = false;

            // The Modal header of the group to be deleted
            newState.voterScreen.deleteModalGroupHeader = '';

            // The index of the group to be deleted
            newState.voterScreen.deleteGroupIndex = -1;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_SET_LOADED_VOTER_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadedVoterGroups = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_VOTER_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadedVoterGroups = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_SET_LOADED_ALL_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadedAllGroups = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_UNSET_LOADED_ALL_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadedAllGroups = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_SHOW_ITEM_GROUP_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.editSelectedGroups = [...newState.voterScreen.editSelectedGroups];

            // Boolean which indicates
            // whether to show the edit
            // Modal dialog for a group item
            newState.voterScreen.showItemGroupsModalDialog = true;

            // The Modal header of the group to be edited
            newState.voterScreen.editGroupModalHeader = 'עריכת קבוצה';

            // The index of the group to be deleted
            newState.voterScreen.editGroupIndex = action.editGroupIndex;

            // An accessory array for editing an item of groups table
            newState.voterScreen.editSelectedGroups = newState.voterScreen.voterInGroups[action.editGroupIndex].selectedGroups;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_HIDE_ITEM_GROUP_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.editSelectedGroups = [...newState.voterScreen.editSelectedGroups];

            // Boolean which indicates
            // whether to show the edit
            // Modal dialog for a group item
            newState.voterScreen.showItemGroupsModalDialog = false;

            // The Modal header of the group to be edited
            newState.voterScreen.editGroupModalHeader = '';

            // The index of the group to be deleted
            newState.voterScreen.editGroupIndex = -1;

            // An accessory array for editing an item of groups table
            newState.voterScreen.editSelectedGroups = [];

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_EDIT_ITEM_SELECTED_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.editSelectedGroups = [...newState.voterScreen.editSelectedGroups];
            newState.voterScreen.editSelectedGroups[action.selectedGroupIndex] = { ...newState.voterScreen.editSelectedGroups[action.selectedGroupIndex] };

            // Quick and dirty remove the selected group and it's children
            newState.voterScreen.editSelectedGroups.length = action.selectedGroupIndex;
            newState.voterScreen.disabledGroupsButtonOk = false;

            // If no group is not valid, then
            // don't insert it to the newSelectedGroups array
            if (action.selectedGroupId > 0) {
                // Add the selected group to editSelectedGroups
                newState.voterScreen.editSelectedGroups.push({ id: action.selectedGroupId, name: action.selectedGroupName });
            }else if (action.selectedGroupName != '') {
                newState.voterScreen.editSelectedGroups.push({ id: -1, name: action.selectedGroupName });
                newState.voterScreen.disabledGroupsButtonOk = true;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_DELETE_GROUP_FROM_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...newState.voterScreen.voterInGroups];

            newState.voterScreen.voterInGroups.splice(newState.voterScreen.deleteGroupIndex, 1);

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_EDIT_GROUP_IN_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...newState.voterScreen.voterInGroups];

            let editGroupIndex = newState.voterScreen.editGroupIndex;
            newState.voterScreen.voterInGroups[editGroupIndex] = { ...newState.voterScreen.voterInGroups[editGroupIndex] };
            newState.voterScreen.voterInGroups[editGroupIndex].selectedGroups = [...newState.voterScreen.voterInGroups[editGroupIndex].selectedGroups];

            newState.voterScreen.voterInGroups[editGroupIndex].id = action.newGroupId;
            newState.voterScreen.voterInGroups[editGroupIndex].name = action.newGroupName;
            newState.voterScreen.voterInGroups[editGroupIndex].parent_id = action.newGroupParentId;

            newState.voterScreen.voterInGroups[editGroupIndex].selectedGroups = newState.voterScreen.editSelectedGroups;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_GROUPS_ADD_GROUP_TO_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInGroups = [...newState.voterScreen.voterInGroups];

            newState.voterScreen.voterInGroups.push({
                id: action.newGroupId,
                name: action.newGroupName,
                parent_id: action.newGroupParentId,
                selectedGroups: newState.voterScreen.newSelectedGroups,
                voter_groups_id: null
            });

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_LOADED_VOTER:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // A boolean which indicates whether
            // the voter details have been loaded
            newState.voterScreen.loadedVoter = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // A boolean which indicates whether
            // the voter details have been loaded
            newState.voterScreen.loadedVoter = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_LOADING_VOTER:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadingVoter = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNLOADING_VOTER:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadingVoter = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SET_LOADED_VOTER_ELECTIONS_CAMPAIGNS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadedVoterElectionCampaigns = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UNSET_LOADED_VOTER_ELECTIONS_CAMPAIGNS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.loadedVoterElectionCampaigns = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_USER_LOAD_SYSTEM_USER_DETAILS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterSystemUser = { ...newState.voterScreen.voterSystemUser };
            newState.voterScreen.voterSystemUserGeographicFilters = [...newState.voterScreen.voterSystemUserGeographicFilters];
            newState.voterScreen.voterSystemUserSectorialFilters = [...newState.voterScreen.voterSystemUserSectorialFilters];

            newState.voterScreen.voterSystemUser = action.voterSystemUser;
            newState.voterScreen.voterSystemUserGeographicFilters = action.voterSystemUser.geographic_filters;
            newState.voterScreen.voterSystemUserSectorialFilters = action.voterSystemUser.sectorial_filters;

            return newState;
            break;

        case VoterActions.ActionTypes.EXTRA_DATA.LOADED_DEATH_DATA:
            var newState = { ...state };
            newState.extraDataScreen = { ...newState.extraDataScreen };
            newState.extraDataScreen.voterDeathData = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.EXTRA_DATA.LOADED_KEYS_VALUES_DATA:
            var newState = { ...state };
            newState.extraDataScreen = { ...newState.extraDataScreen };
            newState.extraDataScreen.voterKeysValuesData = action.data;
            newState.extraDataScreen.originalVoterKeysValuesData = JSON.parse(JSON.stringify(action.data));
            return newState;
            break;

        case VoterActions.ActionTypes.EXTRA_DATA.DEATH_STATUS_CHANGE:
            var newState = { ...state };

            newState.extraDataScreen = { ...newState.extraDataScreen };
            newState.extraDataScreen.voterDeathData = { ...newState.extraDataScreen.voterDeathData };
            newState.extraDataScreen.voterDeathData.deceased_date = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.EXTRA_DATA.DEATH_DATE_CHANGE:
            var newState = { ...state };

            newState.extraDataScreen = { ...newState.extraDataScreen };
            newState.extraDataScreen.voterDeathData = { ...newState.extraDataScreen.voterDeathData };
            newState.extraDataScreen.voterDeathData.deceased_date = action.data;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_USER_LOAD_SYSTEM_USER_GEOGRAPHIC_FILTERS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.voterSystemUserGeographicFilters = action.voterSystemUserGeographicFilters;

            return newState;
            break;

        case VoterActions.ActionTypes.EXTRA_DATA.FIELD_VALUE_CHANGED:
            var newState = { ...state };
            newState.extraDataScreen = { ...newState.extraDataScreen };
            newState.extraDataScreen.voterKeysValuesData = [...newState.extraDataScreen.voterKeysValuesData];
            newState.extraDataScreen.voterKeysValuesData[action.rowIndex].value = action.data;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_USER_LOAD_SYSTEM_USER_SECTORIAL_FILTERS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.voterSystemUserSectorialFilters = action.voterSystemUserSectorialFilters;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_UPDATE_LAST_CAMPAIGN_ID:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.lastCampaignId = action.lastCampaignId;
            newState.voterScreen.lastCampaignName = action.lastCampaignName;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_LOAD_HOUSEHOLD_VOTERS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.voterScreen.household = [...newState.voterScreen.household];
            newState.voterScreen.oldHousehold = [...newState.voterScreen.oldHousehold];

            var households = action.household;
            var supportStatuses = newState.searchVoterScreen.supportStatuses;

            for (let householdIndex = 0; householdIndex < households.length; householdIndex++) {
                let householdItem = households[householdIndex];
                let supportElectionIndex = -1;
                let supportTmIndex = -1;

                if (householdItem.voter_support_status_id0 == null) {
                    households[householdIndex].voter_support_status_id0 = 0;
                    households[householdIndex].voter_support_status_key0 = null;
                    households[householdIndex].support_status_id0 = 0;
                    households[householdIndex].support_status_name0 = '';
                } else {
                    let support_status_id0 = households[householdIndex].support_status_id0;

                    supportElectionIndex = supportStatuses.findIndex(statusItem => statusItem.id == support_status_id0);
					if(supportStatuses[supportElectionIndex]){
						households[householdIndex].support_status_name0 = supportStatuses[supportElectionIndex].name;
					}
					else{
						households[householdIndex].support_status_name0 = '';
					}
                }

                if (householdItem.voter_support_status_id1 == null) {
                    households[householdIndex].voter_support_status_id1 = 0;
                    households[householdIndex].voter_support_status_key1 = null;
                    households[householdIndex].support_status_id1 = 0;
                    households[householdIndex].support_status_name1 = '';
                } else {
                    let support_status_id1 = households[householdIndex].support_status_id1;

                    supportTmIndex = supportStatuses.findIndex(statusItem => statusItem.id == support_status_id1);

                    households[householdIndex].support_status_name1 = supportStatuses[supportTmIndex].name;
                }
            }

            newState.voterScreen.household = households;
            newState.voterScreen.oldHousehold = households;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_SHOW_UPDATE_HOUSEHOLD_ADDRESS_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showUpdateHouseholdAddressModal = true;
            newState.voterScreen.updateHouseholdAddressModalContent = action.modalContent;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_HIDE_UPDATE_HOUSEHOLD_ADDRESS_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showUpdateHouseholdAddressModal = false;
            newState.voterScreen.updateHouseholdAddressModalContent = "";

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_SHOW_ACTUAL_ADDRESS_CORRECT_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showActualAddressCorrectModal = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_HIDE_ACTUAL_ADDRESS_CORRECT_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showActualAddressCorrectModal = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_ACTUAL_ADDRESS_CORRECT_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.actual_address_correct = action.actualAddressCorrect;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_SHOW_MODAL_ALL_HOUSEHOLDS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showUpdateHouseholdAddressModal = true;

            newState.voterScreen.updateHouseholdAll = true;

            newState.voterScreen.updateHouseholdIndex = -1;

            newState.voterScreen.updateHouseholdModalHeader = 'עדכון כתובת כל חברי בית האב';

            newState.voterScreen.updateHouseholdModalContent = 'עדכון כתובת כל חברי בית האב. האם אתה בטוח/ה ?';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_SHOW_MODAL_HOUSEHOLD:
            var modalText = 'עדכון כתובת עבור ';

            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            var households = newState.voterScreen.household;

            newState.voterScreen.showUpdateHouseholdAddressModal = true;

            newState.voterScreen.updateHouseholdAll = false;

            newState.voterScreen.updateHouseholdIndex = action.householdIndex;

            newState.voterScreen.updateHouseholdModalHeader = modalText + ' ';
            newState.voterScreen.updateHouseholdModalHeader += households[action.householdIndex].first_name;
            newState.voterScreen.updateHouseholdModalHeader += ' ' + households[action.householdIndex].last_name;

            newState.voterScreen.updateHouseholdModalContent = modalText + ' ';
            newState.voterScreen.updateHouseholdModalContent += households[action.householdIndex].first_name + ' ';
            newState.voterScreen.updateHouseholdModalContent += ' ' + households[action.householdIndex].last_name;
            newState.voterScreen.updateHouseholdModalContent += ". האם אתה בטוח/ה ?";

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_HIDE_MODAL_ALL_HOUSEHOLDS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showUpdateHouseholdAddressModal = false;

            newState.voterScreen.updateHouseholdAll = false;

            newState.voterScreen.updateHouseholdIndex = -1;

            newState.voterScreen.updateHouseholdModalHeader = '';

            newState.voterScreen.updateHouseholdModalContent = '';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_CHANGE_ITEM_ELECTION_STATUS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.household = [...newState.voterScreen.household];
            newState.voterScreen.household[action.householdIndex] = { ...newState.voterScreen.household[action.householdIndex] };

            newState.voterScreen.household[action.householdIndex].support_status_id0 = action.supportStatusId;
            newState.voterScreen.household[action.householdIndex].support_status_name0 = action.supportStatusName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_ENABLE_EDIT_ITEM_STATUS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.editHouseholdKey = action.editHouseholdKey;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_DISABLE_EDIT_ITEM_STATUS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.household = [...newState.voterScreen.household];
            newState.voterScreen.household[action.householdIndex] = { ...newState.voterScreen.household[action.householdIndex] };

            newState.voterScreen.editHouseholdKey = '';

            newState.voterScreen.household[action.householdIndex].support_status_id0 = action.oldSupportStatusId;
            newState.voterScreen.household[action.householdIndex].support_status_name0 = action.oldSupportStatusName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_SHOW_DELETE_STATUS_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            var household = newState.voterScreen.household;

            let fullName = household[action.householdIndex].first_name + ' ';
            fullName += household[action.householdIndex].last_name;

            let modalHeader = 'מחיקת סטטוס עבור ';
            modalHeader += fullName;

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteSupportStatusModal = true;

            // The key of the household status to be deleted
            newState.voterScreen.deleteHouseholdKey = action.deleteHouseholdKey;

            // The household delete's Modal header
            newState.voterScreen.deleteHouseholdModalHeader = modalHeader;

            // The household's support status key
            newState.voterScreen.deleteSupportStatusKey = household[action.householdIndex].voter_support_status_key0;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_HIDE_DELETE_STATUS_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // A boolen that indicates whether to
            // show the delete Modal Dialog
            newState.voterScreen.showDeleteSupportStatusModal = false;

            // The key of the household status to be deleted
            newState.voterScreen.deleteHouseholdKey = '';

            // The household delete's Modal header
            newState.voterScreen.deleteHouseholdModalHeader = '';

            // The household's support status key
            newState.voterScreen.deleteSupportStatusKey = '';

            // The metadata keys
            newState.voterScreen.metaDataKeys = [];

            // meta data keys with values ['willing_volunteer', 'agree_sign', 'explanation_material']
            newState.voterScreen.metaDataVolunteerKeys = [];

            // The metadata values
            newState.voterScreen.metaDataValues = [];

            // Voter Meta Hash table
            newState.voterScreen.voterMetaHash = [];

            // Meta values by key id
            newState.voterScreen.metaValuesHashByKeyId = [];

            // Meta values by value id
            newState.voterScreen.metaValuesHashByValueId = [];

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDITIONAL_DATA_TEXT_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterMetaHash = [...newState.voterScreen.voterMetaHash];

            if (newState.voterScreen.voterMetaHash[action.metaKeyId] == null ||
                newState.voterScreen.voterMetaHash[action.metaKeyId] == undefined) {

                newState.voterScreen.voterMetaHash[action.metaKeyId] = {
                    id: 0,
                    voter_meta_key_id: action.metaKeyId,
                    voter_meta_value_id: null,
                    value: action.fieldValue,
                    election_campaign_id: null,
                    valid: true
                };
            } else {
                newState.voterScreen.voterMetaHash[action.metaKeyId] = { ...newState.voterScreen.voterMetaHash[action.metaKeyId] };

                newState.voterScreen.voterMetaHash[action.metaKeyId].value = action.fieldValue;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDITIONAL_DATA_NUMBER_INPUT_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterMetaHash = [...newState.voterScreen.voterMetaHash];

            if (newState.voterScreen.voterMetaHash[action.metaKeyId] == null ||
                newState.voterScreen.voterMetaHash[action.metaKeyId] == undefined) {

                newState.voterScreen.voterMetaHash[action.metaKeyId] = {
                    id: 0,
                    voter_meta_key_id: action.metaKeyId,
                    voter_meta_value_id: null,
                    value: action.fieldValue,
                    election_campaign_id: null,
                    valid: action.validField
                };
            } else {
                newState.voterScreen.voterMetaHash[action.metaKeyId] = { ...newState.voterScreen.voterMetaHash[action.metaKeyId] };

                newState.voterScreen.voterMetaHash[action.metaKeyId].value = action.fieldValue;
                newState.voterScreen.voterMetaHash[action.metaKeyId].valid = action.validField;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDITIONAL_DATA_COMBO_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterMetaHash = [...newState.voterScreen.voterMetaHash];

            if (!newState.voterScreen.voterMetaHash[action.metaKeyId] ) {
                newState.voterScreen.voterMetaHash[action.metaKeyId] = {
                    id: 0,
                    voter_meta_key_id: action.metaKeyId,
                    voter_meta_value_id: action.fieldId,
                    value: action.fieldValue,
                    election_campaign_id: null,
                    valid: action.validField
                };
            } else {
                newState.voterScreen.voterMetaHash[action.metaKeyId] = { ...newState.voterScreen.voterMetaHash[action.metaKeyId] };

                newState.voterScreen.voterMetaHash[action.metaKeyId].value = action.fieldValue;
                newState.voterScreen.voterMetaHash[action.metaKeyId].voter_meta_value_id = action.fieldId;
                newState.voterScreen.voterMetaHash[action.metaKeyId].valid = action.validField;
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_LOAD_META_DATA_KEYS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.metaDataKeys = action.metaDataKeys;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_LOAD_META_DATA_VOLUNTEER_KEYS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.metaDataVolunteerKeys = action.metaDataKeys;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_LOAD_ALL_META_DATA_VALUES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // Meta values by key id
            let metaValuesHashByKeyId = [];
            let metaValuesHashByValueId = [];
            let metaDataValues = action.metaDataValues;

            metaDataValues.forEach(function (metaValueItem) {
                if (metaValuesHashByKeyId[metaValueItem.voter_meta_key_id] == undefined) {
                    metaValuesHashByKeyId[metaValueItem.voter_meta_key_id] = [
                        { id: metaValueItem.id, value: metaValueItem.value }
                    ];
                } else {
                    let tempObj = { id: metaValueItem.id, value: metaValueItem.value };
                    metaValuesHashByKeyId[metaValueItem.voter_meta_key_id].push(tempObj);
                }

                metaValuesHashByValueId[metaValueItem.id] = metaValueItem;
            });

            newState.voterScreen.metaDataValues = action.metaDataValues;
            newState.voterScreen.metaValuesHashByKeyId = metaValuesHashByKeyId;
            newState.voterScreen.metaValuesHashByValueId = metaValuesHashByValueId;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SET_VOTER_HASH_META_TABLE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            let voterMetaDataValues = action.voterMetaDataValues;
            let voterMetaHash = [];

            voterMetaDataValues.forEach(function (voterMetaItem) {
                if (null == voterMetaItem.value) {
                    voterMetaItem.value = '';
                }

                voterMetaItem.valid = true;

                voterMetaHash[voterMetaItem.voter_meta_key_id] = voterMetaItem;
            });

            newState.voterScreen.voterMetaHash = voterMetaHash;

            newState.voterScreen.oldVoterMetaHash = voterMetaHash;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_LOAD_VOTER_SUPPORT_STATUSES:
            var newState = { ...state };
            var householdIndex = -1;
            newState.voterScreen = { ...newState.voterScreen };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            newState.voterScreen.supportStatuses = { ...newState.voterScreen.supportStatuses };
            newState.voterScreen.oldSupportStatuses = { ...newState.voterScreen.oldSupportStatuses };
            newState.voterScreen.household = [...newState.voterScreen.household];
            newState.voterDetails = { ...newState.voterDetails };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };

            var supportStatuses = newState.searchVoterScreen.supportStatuses;
            var supportElectionIndex = -1;
            var supportTmIndex = -1;

            for (let key in action.supportStatuses) {
                switch (key) {
                    case 'voter_support_status_key0':
                    case 'voter_support_status_key1':
                        newState.voterScreen.supportStatuses[key] = action.supportStatuses[key];
                        break;

                    case 'voter_support_status_id0':
                    case 'support_status_id0':
                    case 'voter_support_status_id1':
                    case 'support_status_id1':
                        if (action.supportStatuses[key] == null) {
                            newState.voterScreen.supportStatuses[key] = 0;
                        } else {
                            newState.voterScreen.supportStatuses[key] = action.supportStatuses[key];
                        }
                        break;

                    default:
                        if (action.supportStatuses[key] == null) {
                            newState.voterScreen.supportStatuses[key] = '';
                        } else {
                            newState.voterScreen.supportStatuses[key] = action.supportStatuses[key];
                        }
                        break;
                }
            }

            if (0 == newState.voterScreen.supportStatuses.voter_support_status_id0) {
                newState.voterScreen.supportStatuses.support_status_name0 = '';

                newState.voterDetails.voter_support_status_key0 = null;
                newState.voterDetails.support_status_id0 = 0;
                newState.voterDetails.support_status_name0 = '';
                newState.voterDetails.support_status_likes0 = '';

                newState.oldVoterDetails.voter_support_status_key0 = null;
                newState.oldVoterDetails.support_status_id0 = 0;
                newState.oldVoterDetails.support_status_name0 = '';
                newState.oldVoterDetails.support_status_likes0 = '';
            } else {
                let support_status_id0 = newState.voterScreen.supportStatuses.support_status_id0;

                supportElectionIndex = supportStatuses.findIndex(statusItem => statusItem.id == support_status_id0);

                newState.voterScreen.supportStatuses.support_status_name0 = supportStatuses[supportElectionIndex].name;

                newState.voterDetails.voter_support_status_key0 = newState.voterScreen.supportStatuses.voter_support_status_key0;
                newState.voterDetails.support_status_id0 = newState.voterScreen.supportStatuses.support_status_id0;
                newState.voterDetails.support_status_name0 = newState.voterScreen.supportStatuses.support_status_name0;
                newState.voterDetails.support_status_likes0 = supportStatuses[supportElectionIndex].likes;

                newState.oldVoterDetails.voter_support_status_key0 = newState.voterScreen.supportStatuses.voter_support_status_key0;
                newState.oldVoterDetails.support_status_id0 = newState.voterScreen.supportStatuses.support_status_id0;
                newState.oldVoterDetails.support_status_name0 = newState.voterScreen.supportStatuses.support_status_name0;
                newState.oldVoterDetails.support_status_likes0 = supportStatuses[supportElectionIndex].likes;
            }

            if (0 == newState.voterScreen.supportStatuses.voter_support_status_id1) {
                newState.voterScreen.supportStatuses.support_status_name1 = '';
            } else {
                let support_status_id1 = newState.voterScreen.supportStatuses.support_status_id1;

                supportTmIndex = supportStatuses.findIndex(statusItem => statusItem.id == support_status_id1);

                newState.voterScreen.supportStatuses.support_status_name1 = supportStatuses[supportTmIndex].name;
            }

            newState.voterScreen.oldSupportStatuses = _.clone(newState.voterScreen.supportStatuses);

            householdIndex = newState.voterScreen.household.findIndex(householdItem => householdItem.key == newState.voterDetails.key);

            newState.voterScreen.household[householdIndex] = { ...newState.voterScreen.household[householdIndex] };

            newState.voterScreen.household[householdIndex].support_status_id0 = newState.voterScreen.supportStatuses.support_status_id0;
            newState.voterScreen.household[householdIndex].support_status_name0 = newState.voterScreen.supportStatuses.support_status_name0;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_SEARCH.LOAD_CITY_STREETS:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            var searchVoterScreen = newState.searchVoterScreen;
            searchVoterScreen.searchStreetInputValue = '';
            searchVoterScreen.searchForParams.street = [];
            searchVoterScreen.cityStreets = [];
            newState.searchVoterScreen = searchVoterScreen;
            return newState;
            break;
        case VoterActions.ActionTypes.VOTER_SEARCH.LOADED_GENERAL_STREETS:
            var newState = { ...state };
            newState.searchVoterScreen = { ...newState.searchVoterScreen };
            var searchVoterScreen = newState.searchVoterScreen;
            searchVoterScreen.cityStreets = action.streets;
            newState.searchVoterScreen = searchVoterScreen;
            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_LOAD_VOTER_CAMPAIGNS_SUPPORT_STATUSES:
        var newState = { ...state };
        newState.voterScreen = { ...newState.voterScreen };

        let supportStatuses = action.supportStatuses;

        let supportStatusesObj = {};
        supportStatuses.forEach(function (supportStatus) {
            let entityType = supportStatus.entity_type;
            let election_campaign_id = supportStatus.election_campaign_id;
            if (!supportStatusesObj.hasOwnProperty(election_campaign_id)) {
                supportStatusesObj[election_campaign_id] = {};
            }
            supportStatusesObj[election_campaign_id][entityType] = supportStatus.support_status_name;
            supportStatusesObj[election_campaign_id]['name'] = supportStatus.election_campaigns_name;
        });
        newState.voterScreen.supportStatusesObj = supportStatusesObj;
        return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SUPPORT_STATUS_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.supportStatuses = { ...newState.voterScreen.supportStatuses };

            newState.voterScreen.supportStatuses.support_status_id0 = action.supportStatusId;
            newState.voterScreen.supportStatuses.support_status_name0 = action.supportStatusName;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ERROR_LOADING_VOTER_MODAL_SHOW:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showMissingVoterModal = true;
            newState.voterScreen.missingVoterModalContent = action.errorMessage;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ERROR_LOADING_VOTER_MODAL_HIDE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showMissingVoterModal = false;
            newState.voterScreen.missingVoterModalContent = "";

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_SEARCH_PERSONAL_IDENTITY_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.personalIdentitySearchParam = action.personalIdentity;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_CHANGE:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.support_status_id0 = action.supportStatusId;
            newState.voterDetails.support_status_name0 = action.supportStatusName;
            newState.voterDetails.support_status_likes0 = action.supportStatusLike;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_SHOW_DELETE_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.deleteActionIndex = action.actionIndex;

            newState.voterScreen.deleteActionModalHeader = "מחיקת פעולה ";
            newState.voterScreen.deleteActionModalHeader += action.actionKey;

            newState.voterScreen.showDeleteActionModalDialog = true;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ACTION_HIDE_DELETE_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.deleteActionIndex = -1;

            newState.voterScreen.deleteActionModalHeader = "";

            newState.voterScreen.showDeleteActionModalDialog = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_MAIN_BLOCK_SUPPORT_STATUS_EDIT_STATE_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.mainBlockSupportStatusState = action.editSupportStatusKey;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.ENABLE_ADDING_NEW_INSTITUTE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newInstituteData = { ...newState.voterScreen.newInstituteData };

            newState.voterScreen.showNewInstituteRow = true;

            newState.voterScreen.newInstituteData.types_list = newState.voterScreen.instituteTypes;
            newState.voterScreen.newInstituteData.institutes_list = newState.voterScreen.institutes;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.DISABLE_ADDING_NEW_INSTITUTE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newInstituteData = { ...newState.voterScreen.newInstituteData };

            newState.voterScreen.showNewInstituteRow = false;

            newState.voterScreen.newInstituteData = {
                institute_group_id: 0,
                institute_group_name: '',
                institute_type_id: 0,
                institute_type_name: '',
                institute_network_id: 0,
                institute_network_name: '',
                institute_id: 0,
                institute_name: '',
                institute_role_id: 0,
                institute_role_name: '',
                city_id: 0,
                city_name: '',
                types_list: [],
                institutes_list: [],
                roles_list: []
            };

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.NEW_INSTITUTE_FIELD_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newInstituteData = { ...newState.voterScreen.newInstituteData };

            newState.voterScreen.newInstituteData[action.fieldName] = action.fieldValue;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_GROUPS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.instituteGroups = action.instituteGroups;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_TYPES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newInstituteData = { ...newState.voterScreen.newInstituteData };
            newState.voterScreen.newInstituteData.types_list = [...newState.voterScreen.newInstituteData.types_list];

            let instituteTypes = action.instituteTypes;

            for (let instituteIndex = 0; instituteIndex < instituteTypes.length; instituteIndex++) {
                instituteTypes[instituteIndex].fullName = instituteTypes[instituteIndex].institute_group_name;
                instituteTypes[instituteIndex].fullName += '|' + instituteTypes[instituteIndex].name;
            }

            newState.voterScreen.instituteTypes = instituteTypes;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_ROLES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newInstituteData = { ...newState.voterScreen.newInstituteData };

            newState.voterScreen.instituteRoles = action.instituteRoles;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.LOAD_INSTITUTE_NETWORKS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.instituteNetworks = action.instituteNetworks;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.LOAD_ALL_INSTITUTES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.newInstituteData = { ...newState.voterScreen.newInstituteData };
            newState.voterScreen.newInstituteData.institutes_list = [...newState.voterScreen.newInstituteData.institutes_list];

            newState.voterScreen.institutes = action.institutes;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.LOAD_VOTER_INSTITUTES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.voterInstitutes = action.voterInstitutes;

            for (let instituteIndex = 0; instituteIndex < action.voterInstitutes.length; instituteIndex++) {
                if (null == newState.voterScreen.voterInstitutes[instituteIndex].institute_network_id) {
                    newState.voterScreen.voterInstitutes[instituteIndex].institute_network_id = 0;
                }

                if (null == newState.voterScreen.voterInstitutes[instituteIndex].institute_network_name) {
                    newState.voterScreen.voterInstitutes[instituteIndex].institute_network_name = '';
                }

                newState.voterScreen.voterInstitutes[instituteIndex].roles_list = [];
                newState.voterScreen.voterInstitutes[instituteIndex].types_list = [];
                newState.voterScreen.voterInstitutes[instituteIndex].institutes_list = [];
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.ADD_NEW_INSTITUTE_TO_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInstitutes = [...newState.voterScreen.voterInstitutes];

            newState.voterScreen.voterInstitutes.push(
                {
                    id: null,
                    institute_role_id: newState.voterScreen.newInstituteData.institute_role_id,
                    institute_role_name: newState.voterScreen.newInstituteData.institute_role_name,
                    institute_id: newState.voterScreen.newInstituteData.institute_id,
                    institute_name: newState.voterScreen.newInstituteData.institute_name,
                    institute_type_id: newState.voterScreen.newInstituteData.institute_type_id,
                    institute_type_name: newState.voterScreen.newInstituteData.institute_type_name,
                    city_id: newState.voterScreen.newInstituteData.city_id,
                    city_name: newState.voterScreen.newInstituteData.city_name,
                    institute_group_id: newState.voterScreen.newInstituteData.institute_group_id,
                    institute_group_name: newState.voterScreen.newInstituteData.institute_group_name,
                    institute_network_id: newState.voterScreen.newInstituteData.institute_network_id,
                    institute_network_name: newState.voterScreen.newInstituteData.institute_network_name,
                    types_list: newState.voterScreen.newInstituteData.types_list,
                    institutes_list: newState.voterScreen.newInstituteData.institutes_list,
                    roles_list: newState.voterScreen.newInstituteData.roles_list
                }
            );

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.SHOW_DELETE_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // Boolean which indicates whether to
            // show the Modal Dialog for deleting
            // an institute row
            newState.voterScreen.showDeleteInstituteModalDialog = true;

            // The index of the institute to be deleted
            newState.voterScreen.deleteInstituteIndex = action.instituteIndex;

            // The institute delete's Modal header
            newState.voterScreen.deleteInstituteModalHeader = action.instituteModalHeader;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.HIDE_DELETE_MODAL_DIALOG:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            // Boolean which indicates whether to
            // show the Modal Dialog for deleting
            // an institute row
            newState.voterScreen.showDeleteInstituteModalDialog = false;

            // The index of the institute to be deleted
            newState.voterScreen.deleteInstituteIndex = -1;

            // The institute delete's Modal header
            newState.voterScreen.deleteInstituteModalHeader = '';

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.DELETE_INSTITUTE_FROM_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInstitutes = [...newState.voterScreen.voterInstitutes];

            newState.voterScreen.voterInstitutes.splice(newState.voterScreen.deleteInstituteIndex, 1);

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.ENABLE_EDITING_INSTITUTE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.editInstituteBackup = { ...newState.voterScreen.editInstituteBackup };

            newState.voterScreen.editInstituteIndex = action.instituteIndex;

            for (let instituteField in newState.voterScreen.editInstituteBackup) {
                newState.voterScreen.editInstituteBackup[instituteField] = newState.voterScreen.voterInstitutes[action.instituteIndex][instituteField];
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.DISABLE_EDITING_INSTITUTE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.editInstituteBackup = { ...newState.voterScreen.editInstituteBackup };

            newState.voterScreen.editInstituteIndex = -1;

            newState.voterScreen.editInstituteBackup = {
                institute_group_id: 0,
                institute_group_name: '',
                institute_type_id: 0,
                institute_type_name: '',
                institute_network_id: 0,
                institute_network_name: '',
                institute_id: 0,
                institute_name: '',
                institute_role_id: 0,
                institute_role_name: '',
                city_id: 0,
                city_name: '',
                types_list: [],
                institutes_list: [],
                roles_list: []
            };

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.BACKUP_FROM_STATE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInstitutes = [...newState.voterScreen.voterInstitutes];

            let editInstituteIndex = newState.voterScreen.editInstituteIndex;
            newState.voterScreen.voterInstitutes[editInstituteIndex] = { ...newState.voterScreen.voterInstitutes[editInstituteIndex] };

            for (let instituteField in newState.voterScreen.editInstituteBackup) {
                newState.voterScreen.voterInstitutes[editInstituteIndex][instituteField] = newState.voterScreen.editInstituteBackup[instituteField];
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER_INSTITUTE.EDIT_INSTITUTE_FIELD_CHANGE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.voterInstitutes = [...newState.voterScreen.voterInstitutes];

            editInstituteIndex = newState.voterScreen.editInstituteIndex;
            newState.voterScreen.voterInstitutes[editInstituteIndex] = { ...newState.voterScreen.voterInstitutes[editInstituteIndex] };

            newState.voterScreen.voterInstitutes[editInstituteIndex][action.fieldName] = action.fieldValue;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_SHOW_ERROR_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showVoterCommonPhonesModal = true;

            newState.voterScreen.voterCommonPhonesModalHeader = action.errorHeader;

            newState.voterScreen.votersWithSamePhones = action.votersWithSamePhones;
            for (let voterPhoneIndex = 0; voterPhoneIndex < action.votersWithSamePhones.length; voterPhoneIndex++) {
                newState.voterScreen.votersWithSamePhones[voterPhoneIndex].toDelete = false;
            }

            newState.voterScreen.deleteAllPhonesModal = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_HIDE_ERROR_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showVoterCommonPhonesModal = false;

            newState.voterScreen.voterCommonPhonesModalHeader = '';

            newState.voterScreen.votersWithSamePhones = [];

            newState.voterScreen.deleteAllPhonesModal = false;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_CHECK_UPDATE_PHONE_TO_DELETE:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.votersWithSamePhones = [...newState.voterScreen.votersWithSamePhones];
            newState.voterScreen.votersWithSamePhones[action.phoneIndex] = { ...newState.voterScreen.votersWithSamePhones[action.phoneIndex] };

            newState.voterScreen.votersWithSamePhones[action.phoneIndex].toDelete = action.toDelete;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_UPDATE_DELETE_ALL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.deleteAllPhonesModal = action.deleteAllPhones;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_SHOW_WARNING_PHONE_DELETION_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showWarningPhoneDeletionModal = true;

            newState.voterScreen.deletePhoneIndex = action.deletePhoneIndex;

            newState.voterScreen.warningPhoneDeletionModalHeader = "מחיקת טלפון ";
            newState.voterScreen.warningPhoneDeletionModalHeader += action.phoneNumber;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_PHONE_HIDE_WARNING_PHONE_DELETION_MODAL:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.showWarningPhoneDeletionModal = false;

            newState.voterScreen.deletePhoneIndex = -1;

            newState.voterScreen.warningPhoneDeletionModalHeader = "";

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_CONTACT_UNDO_CHANGES:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.voterDetails.phones = [...newState.voterDetails.phones];

            newState.voterDetails.phones = newState.oldVoterDetails.phones;

            newState.voterDetails.main_voter_phone_id = newState.oldVoterDetails.main_voter_phone_id;
            newState.voterDetails.main_phone_index = newState.oldVoterDetails.main_phone_index;

            newState.voterDetails.email = newState.oldVoterDetails.email;
            newState.voterDetails.contact_via_email = newState.oldVoterDetails.contact_via_email;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_DETAILS_UNDO_CHANGES:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            let detailsFields = [
                'birth_date',
                'birth_date_type',
                'birth_date_type_name',
                'origin_country_id',
                'origin_country_name',
                'voter_title_id',
                'voter_title_name',
                'voter_ending_id',
                'voter_ending_name',
                'gender',
                'gender_name',
                'ethnic_group_id',
                'ethnic_group_name',
                'religious_group_id',
                'religious_group_name',                
                'sephardi',
                'sephardi_name',
				'deceased',
				'deceased_date',
                'deceased_month',
                'deceased_year',
				 
            ];
            for (let detailsIndex = 0; detailsIndex < detailsFields.length; detailsIndex++) {
                let fieldName = detailsFields[detailsIndex];
                newState.voterDetails[fieldName] = newState.oldVoterDetails[fieldName];
            }

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_UNDO_CHANGES:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };

            newState.voterDetails.city_id = newState.oldVoterDetails.city_id;
            newState.voterDetails.city_key = newState.oldVoterDetails.city_key;
            newState.voterDetails.city_name = newState.oldVoterDetails.city_name;
            newState.voterDetails.street_id = newState.oldVoterDetails.street_id;
            newState.voterDetails.street_name = newState.oldVoterDetails.street_name;
            newState.voterDetails.street = newState.oldVoterDetails.street;
            newState.voterDetails.neighborhood = newState.oldVoterDetails.neighborhood;
            newState.voterDetails.house = newState.oldVoterDetails.house;
            newState.voterDetails.house_entry = newState.oldVoterDetails.house_entry;
            newState.voterDetails.flat = newState.oldVoterDetails.flat;
            newState.voterDetails.zip = newState.oldVoterDetails.zip;
            newState.voterDetails.distribution_code = newState.oldVoterDetails.distribution_code;
            newState.voterDetails.actual_address_correct = newState.oldVoterDetails.actual_address_correct;

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_META_DATA_UNDO_CHANGES:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };

            newState.voterScreen.voterMetaHash = [...newState.voterScreen.oldVoterMetaHash ];

            return newState;
            break;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_LOAD_VOTER_CITY_STREETS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen };
            newState.voterScreen.cityStreets = [...newState.voterScreen.cityStreets];

            newState.voterScreen.cityStreets = action.cityStreets;

            return newState;

        case VoterActions.ActionTypes.VOTER.VOTER_ADDRESS_INIT_VOTER_STREET_ID:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails };
            newState.oldVoterDetails = { ...newState.oldVoterDetails };
            var streetIndex = -1;

            if (newState.voterDetails.street_id == 0 && newState.voterDetails.street_name.length > 0) {
                streetIndex = action.cityStreets.findIndex(streetItem => streetItem.name == newState.voterDetails.street_name);
                if (streetIndex != -1) {
                    newState.voterDetails.street_id = action.cityStreets[streetIndex].id;
                }
            }

            newState.oldVoterDetails.street_id = newState.voterDetails.street_id;
            return newState;
        /** Voter dialer window */
        case VoterActions.ActionTypes.VOTER_DIALER_WINDOW.DISPLAY_CALL_BOX:
            var newState = { ...state };
            newState.voterDialerWindowData = { ...newState.voterDialerWindowData }

            newState.voterScreen.displayDialWindow = action.display;
            newState.voterDialerWindowData.callBoxOpen = true;
            newState.voterDialerWindowData.voterDetails = action.voterDetails ;
            return newState;
        case VoterActions.ActionTypes.VOTER_DIALER_WINDOW.TOGGLE_CALL_BOX:
            var newState = { ...state };
            newState.voterDialerWindowData = { ...newState.voterDialerWindowData }
            newState.voterDialerWindowData.callBoxOpen = !newState.voterDialerWindowData.callBoxOpen;
            return newState;
        case VoterActions.ActionTypes.VOTER_DIALER_WINDOW.SET_WEB_DIALER:
            var newState = { ...state };
            newState.voterDialerWindowData = { ...newState.voterDialerWindowData }
            let webDialer = { ...newState.voterDialerWindowData.webDialer };
            webDialer.sipnumber = action.webDialer.dialer_user_id;
            webDialer.password = action.webDialer.password;

            newState.voterDialerWindowData.webDialer = webDialer;
            return newState;
        case VoterActions.ActionTypes.VOTER_DIALER_WINDOW.SET_CALL_DATA:
            var newState = { ...state };
            newState.voterDialerWindowData = { ...newState.voterDialerWindowData }
            newState.voterDialerWindowData.callKey = action.callKey
            return newState;
        case VoterActions.ActionTypes.VOTER_DIALER_WINDOW.SET_CALL_STATUS:
            var newState = { ...state };
            newState.voterScreen = { ...newState.voterScreen }
            newState.voterDialerWindowData = { ...newState.voterDialerWindowData }

            newState.voterDialerWindowData.inCall = action.inCall
            newState.voterDialerWindowData.isCallHolded = action.isCallHolded
            return newState;
            /* Change the bank details in voter screen, after response from server. */
        case VoterActions.ActionTypes.VOTER.VOTER_UPDATE_BANK_DETAILS:
            var newState = { ...state };
            newState.voterDetails = { ...newState.voterDetails }

            action.bankDetails.forEach((key) => {
                newState.voterDetails[key] = action.bankDetailsData[key];
            })

            return newState;
        default:
            return state;

    }
}

export default voterReducer;