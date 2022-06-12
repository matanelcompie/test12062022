import * as ElectionsActions from '../actions/ElectionsActions';
import * as AllocationAndAssignmentActions from '../actions/AllocationAndAssignmentActions';
import constants from '../libs/constants';
import importCsvFieldsOptions from 'libs/importCsvFieldsOptions';
import * as globalFunctions from '../libs/globalFunctions';
import { constant } from 'lodash';
import * as CityActivistsService  from '../libs/services/CityActivistsService';
import * as DateActionHelper from '../helper/DateActionHelper'

function findCsvFieldByName(fieldName) {
	let result = importCsvFieldsOptions.find(field => field.full_name == fieldName);
	return result ? result : false;
}

let nowDate = formatDate(new Date());

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

const initial_panelScreen = {
	general :{
		ethnicGroups :[],
		religiousGroups :[],
	},
	currentGlobalTabNumber: 1,
	addingNewMunicipalElectionsCampaignScreen: {
		name: '',
		letters: '',
		isShas: false,
	},
	dndSortScreenFirstTabMunicipalCandidates: {
		items: [],
		originalItems: []
	},
	dndSortScreenSecondTabCouncilMembers: {
		items: [],
		originalItems: []
	},
	addingNewMunicipalElectionsCampaign: false,
	cityMunicipalElectionsCampaignsData: {
		municipal_election_city: [],
		municipal_election_parties: [],
		mayor_candidates: [],
		council_candidates: [],

	},
	selectedCampaign: { selectedValue: '', selectedItem: null },
	selectedPartyForCity: { selectedValue: '', selectedItem: null },
	editCityPartyScreen: {
		name: '',
		letters: '',
		isShas: false,
	},
	firstCollapseExpanded: true,
	campaignsList: [],
	mainTabsActiveTabNumber: 1,
	subTabsActiveTabNumber: 1,
	showConfirmDeleteMunicipalElectionPartyDialog: false,
	confirmDeleteMunicipalElectionPartyHeader: '',
	confirmDeleteMunicipalElectionPartyContent: '',
	confirmDeleteMunicipalElectionPartyDeleteIndex: -1,
	teamsList: [],
	municipalSubTopicsList: [],
	topScreen: {
		cityName: '',
		cityCode: '-',
		areaName: '-',
		subAreaName: '-',
		// City team:
		teamName: '-',
		teamKey: '',
		teamLeaderName: '-',
		teamLeaderPhone: '-',
		// City requests team:

		crmTeamName: '-',
		crmTeamKey: '',

		district: 0,
		displayChooseTeamModal: false,
		selectedTeam: { selectedValue: '', selectedItem: null }
	},
	isAddingMayorCandidate: false,
	isAddingCouncilCandidate: false,
	foundVoter: {},
	deleteMayorCandidateIndex: - 1,
	deleteCouncilCandidateIndex: - 1,
	newMayorCandidateScreen: {
		personalIdentity: '',
		selectedParty: { selectedValue: '', selectedItem: null },
		selectedPhone: { selectedValue: '', selectedItem: null },
		shas: 0,
		favorite: 0,

	},
	tempDndList: [],
	isCouncilCandidateRowInDnDSort: false,

	newCouncilCandidateScreen: {
		personalIdentity: '',
		selectedParty: { selectedValue: '', selectedItem: null },
		selectedPhone: { selectedValue: '', selectedItem: null },
		shas: 0,
		order: -1,

	},
	firstGeneralTabScreen: {
		activeTabIndex: 0
	},
	secondGeneralTabScreen: {
		activeTabIndex: 0,
		cityRolesMayors: [],
		cityRolesDeputyMayors: [],
		cityCouncilMembers: [],
		religiousCouncilMembers: [],
		cityShasRolesByVoters: [],
		allCityDepartments: [],
		allCityParties: [],
		religiousCouncilRoles: [],
		cityShasRoles: [],
		headquarters_phone_number: null,

		newMayorRoleScreen: {
			visible: false,
			foundVoter: [],
			personalIdentity: '',
			fullVoterName: '',
			departmentItem: { selectedValue: '', selectedItem: null },
			campaignItem: { selectedValue: '', selectedItem: null },
			partyItem: { selectedValue: '', selectedItem: null },
			selectedPhone: { selectedValue: '', selectedItem: null },
			shas: 0,
			councilNumber: '',
			termOfOffice: '',
			fromDate: nowDate,
			toDate: '',

		},
		newDeputyMayorRoleScreen: {
			visible: false,
			foundVoter: [],
			personalIdentity: '',
			fullVoterName: '',
			departmentItem: { selectedValue: '', selectedItem: null },
			campaignItem: { selectedValue: '', selectedItem: null },
			partyItem: { selectedValue: '', selectedItem: null },
			selectedPhone: { selectedValue: '', selectedItem: null },
			shas: 0,
			councilNumber: '',
			termOfOffice: '',
			fromDate: nowDate,
			toDate: '',
		},

		newCouncilMebmerScreen: {
			visible: false,
			foundVoter: [],
			personalIdentity: '',
			fullVoterName: '',
			departmentItem: { selectedValue: '', selectedItem: null },
			campaignItem: { selectedValue: '', selectedItem: null },
			partyItem: { selectedValue: '', selectedItem: null },
			selectedPhone: { selectedValue: '', selectedItem: null },
			shas: 0,
			councilNumber: '',
			termOfOffice: '',
			fromDate: nowDate,
			toDate: '',
		},

		newCouncilReligeousRole: {
			visible: false,
			visibleHistory: false,
			foundVoter: [],
			personalIdentity: '',
			fullVoterName: '',
			selectedRole: { selectedValue: '', selectedItem: null },
			selectedPhone: { selectedValue: '', selectedItem: null },
			shas: 0,
			fromDate: nowDate,
			toDate: '',
		},

		newCouncilCityShasRole: {
			visible: false,
			visibleHistory: false,
			foundVoter: [],
			personalIdentity: '',
			fullVoterName: '',
			selectedRole: { selectedValue: '', selectedItem: null },
			selectedPhone: { selectedValue: '', selectedItem: null },
			councilNumber: '',
			fromDate: nowDate,
			toDate: '',
		},

		cityRolesMayorsDeleteIndex: -1,
		cityRolesDeputyMayorsDeleteIndex: -1,
		cityCouncilMembersDeleteIndex: -1,
		religiousCouncilMembersHistoryDeleteIndex: -1,
		cityShasRolesByVotersHistoryDeleteIndex: -1,
		religiousCouncilMembersDeleteIndex: -1,
		cityShasRolesByVotersDeleteIndex: -1,
		isCityConcilMemberRowInDnDSort: false,
	},

	historicalElectionCampaigns: [],
	historicalElectionCampaignsVotesData: [],

	fourthGeneralTabScreen: {
		selectedCampaign: { selectedValue: '', selectedItem: null },
		cityBudgets: [],
		actionHistoryOuterIndex: -1,
		actionHistoryInnerIndex: -1,
		electionsRoleData: [],
	}
}

const initial_electionDayWalkerReport = {
	isEditingVoter: false,
	loadingSearchResults: false,
	reportSearchResults: undefined,
	ballotsFullResultHash: {},
	captainsFullResultHash: {},
	totalSearchResultsCount: 0,
	tempNumberOfResultsPerPage: 30,
	numberOfResultsPerPage: 30,
	currentPage: 1,
	displayWithEditOption: false,
	regularFiltersSearchQuery: {},
	showCurrentSupportStatus: true,
	showPreviousSupportStatus: true,
	globalModalMessageHeader: '',
	globalModalMessageContent: '',
	showGlobalMessageModal: false,
	supportStatuses: [],
	dynamicStreets: [],
	searchScreen: {
		clustersButtonDisabled: false,
		caps50ButtonDisabled: false,
		showDisplayCaptainFiftyVoterSearchModal: false,
		clusters: [],
		neighborhoods: [],
		ballotBoxes: [],
		selectedArea: { selectedValue: '', selectedItem: null },
		selectedCity: { selectedValue: '', selectedItem: null },
		selectedNeighborhood: { selectedValue: '', selectedItem: null },
		selectedCluster: { selectedValue: '', selectedItem: null },
		selectedBallotBox: { selectedValue: '', selectedItem: null },
		selectedIsVoted: { selectedValue: 'הכל', selectedItem: { id: -1, name: 'הכל' } },
		filterByMinisterOfFifty: true,
		showMinisterOfFiftySearchModal: true,
		orderByCap50: true,
		ministerFirstName: '',
		ministerLastName: '',
		ministerID: '',
		clusterLeaderFirstName: '',
		clusterLeaderLastName: '',
		clusterLeaderID: '',
		searchCaptainFiftyVoterModal: {
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedCluster: { selectedValue: '', selectedItem: null },
			ministerFirstName: '',
			ministerLastName: '',
			ministerID: '',
			clusters: [],
			foundVoters: [],
			selectedRowIndex: -1,
		}
	}
}
const initialState = {

	showModalDialog: false,
	modalHeaderText: '',
	modalContentText: '',
	dashboardScreen: {
		allDataRows: [],
		totalDataRows: 0,
		fileSrc: '',
		currentPage: 1,
		displayItemsPerPage: 20,
		loadedDataFlag: false
	},
	votesDashboardScreen:{
		loadingMainScreenScreen:false,
		mainScreenData : {},
		enrolledData : {} ,
		wrongData : {} ,
		missedData : {} ,
		unverifiedData : {} ,
		hotBallots:0,
		notColdBallots:0,
		loadingMoreActivists:false,
		loadingMoreMissedActivists:false,
		loadingMoreUnverifiedActivists:false,
		checkedRoleTypeIndex : -1 , 
		checkedBallotMemberRole:0,
		checkedObserverRole:0,
		checkedFirstShift:0,
		checkedSecondShift:0,
		checkedAllShifts:0,
		checkedCountShift: 0,
		enrolledActivistsFilterName:'',
		wrongActivistsFilterName:'',
		unverifiedActivistsStatusName:'unverified', //or 'refused'
		currentShift : 'allShifts',
		searchScreen: {
			showAllSearchResults: false,
			search_source : '',
			source_city_name : '',
			stillLoadingResults: false,
			selectedTeam: { selectedValue: '', selectedItem: null },
			selectedArea: { selectedValue: '', selectedItem: null },
			selectedSubArea: { selectedValue: '', selectedItem: null },
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedNeighborhood: { selectedValue: '', selectedItem: null },
			selectedCluster: { selectedValue: '', selectedItem: null },
			selectedBallotBox: { selectedValue: '', selectedItem: null },
			cities: [],
			ballotBoxes: [],
		},
		entityType:null , 
		entityKey : null,
	},
	form1000Screen: {
		errorModalScreen: {
			displayErrorMessage: false,
			modalErrorTitle: '',
			modalErrorContent: '',
		},
		searchScreen: {
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedCluster: { selectedValue: '', selectedItem: null },
			selectedBallotbox: { selectedValue: '', selectedItem: null },
			clusters: [],
			ballotBoxes: [],
			showSearchResults: false,
			isLoadingSearchResults: false,
		},
		searchResults: {
			city_name: '',
			cluster_name: '',
			cluster_address: '',
			textBoxVoterSerialNumber: '',
			role_shifts: [],
			last_vote_date: '',
			last_vote_voter: '',
			ballotbox_voters_array: [],
			voted_support_status_percentage: 0,
			isSavingData:false,
		},

	},
	manualVotesScreen: {
		searchScreen: {
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedBallotBox: { selectedValue: '', selectedItem: null },
			ballotBoxes: [],
			selectedVoterNumber: '',
			possibleVoters: [],
			selectedVoterIdentityNumber: '',
		},
		foundVoterData: null,
		loadingResults: false,
		lastUpdatesList: [],
	},
	electionsDashboard : {
		all_voters_count:0,
		all_supporters_count:0,
		global_votes_count:0,
		allCountryDataLoaded : false,
		displayAllCountry : false,
		numberOfContryStatesAreasNumber:7,
		currentPage:1,
		generalAreasHashTable: {
			areas: {},
			subAreas: {},
			cities: {},
			neighborhoods: {},
			clusters: {},
			ballotBoxes: {},
		},
		generalPredictedVotesPercents:[],
		geoEntitySupportersVotersPercents:null,
		geoEntityAllVotersPercents:null,
		totalVotersCountData:null,
		ballots_count_data:{},
		ballots_reporting_count_data:{},
		votingUpdatedDate : null ,
		VoteElectionsHours : null ,
		searchEntityType : null,
		searchEntityKey : null,
		areaId: -1,
		subAreaId: -1,
		cityId: -1,
		neighborhoodId: -1,
		clusterId: -1,
		ballotId: -1,
		currentTabNumber:1, // 1 is load voting panel , 2 is load by hours
		screenHeader:'',
		searchScreen : {
			showAllSearchResults : false,
			stillLoadingResults : false,
			selectedTeam : {selectedValue:'' , selectedItem:null},
			selectedArea : {selectedValue:'' , selectedItem:null},
			selectedSubArea : {selectedValue:'' , selectedItem:null},
			selectedCity : {selectedValue:'' , selectedItem:null},
			selectedNeighborhood : {selectedValue:'' , selectedItem:null},
			selectedCluster : {selectedValue:'' , selectedItem:null},
			selectedBallotBox : {selectedValue:'' , selectedItem:null},
			totalVoters:-1 , 
			totalHouseholds : -1 ,
			cities : [], //Not in use!
			ballotBoxes : [],
		},
	},
	preElectionsDashboard: {
		searchScreen: {
			showAllSearchResults: false,
			stillLoadingResults: false,
			selectedTeam: { selectedValue: '', selectedItem: null },
			selectedArea: { selectedValue: '', selectedItem: null },
			selectedSubArea: { selectedValue: '', selectedItem: null },
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedNeighborhood: { selectedValue: '', selectedItem: null },
			selectedCluster: { selectedValue: '', selectedItem: null },
			selectedBallotBox: { selectedValue: '', selectedItem: null },
			totalVoters: -1,
			totalHouseholds: -1,
			cities: [],
			ballotBoxes: [],
			selectedVoterNumber: '',
			possibleVoters: [],
			selectedVoterIdentityNumber: '',
		},
		foundVoterData: null,
		loadingResults: false,
		lastUpdatesList: [],

		speedometerScreen: {
			isLoading: false,

			totalSupporters: -1,
			totalPotential: - 1,
			previousVotesCount: -1,
			previousSupportersCount: -1,
		},
		measureSupportScreen: {
			isLoading: false,
			timePeriods: [
				{ id: '1', name: 'מתחילת השבוע', system_name: 'from_this_week' },
				{ id: '2', name: 'מתחילת שבוע קודם', system_name: 'from_previous_week' },
				{ id: '3', name: 'מתחילת החודש', system_name: 'from_this_month' },
				{ id: '4', name: 'מתחילת חודש קודם', system_name: 'from_previous_month' },
				{ id: '5', name: '10 ימים', system_name: '10_days' },
				{ id: '6', name: '21 ימים', system_name: '21_days' },
				{ id: '7', name: '30 ימים', system_name: '30_days' },
				{ id: '8', name: '60 ימים', system_name: '60_days' },
				{ id: '9', name: '90 ימים', system_name: '90_days' },
				{ id: '10', name: 'מתחילת מערכת הבחירות', system_name: 'form_elections_init' },
			],
			supportStatuses: [
				{ id: '0', name: 'סטטוס סניף' },
				{ id: '1', name: 'סטטוס TM' },
				{ id: '2', name: 'סטטוס סופי' },
			],
			selectedTimePeriod: { selectedValue: '30 ימים', selectedItem: { id: '7', name: '30 ימים', system_name: '30_days' } },
			selectedSupportStatusType: { selectedValue: 'סטטוס סניף', selectedItem: { id: '0', name: 'סטטוס סניף' } },
			isClickedGotoSupportStatusChangeReport: false,
			resultsArray: null,
			current_campaign_start_date: '',

		},
		votersDistributionBySupportStatusScreen: {
			resultDataObject: null,
		},
		officialsRolesScreen: {
			selectedCampaign: { selectedValue: '', selectedItem: null },
			resultDataObject: null,
		},
		supportsComparisonScreen: {
			selectedCampaign: { selectedValue: '', selectedItem: null },
			resultDataObject: null,
		},

		generalLists: {
			electionCampaigns: [],
		},

		areasPanel: {
			globalCountryStats: null,
			areasCitiesStats: null,
			isLoadingResults: false,
			currentPage: 1,
			citiesAndAreasPerPage: 4,
			selectedAreaID: -1,
			selectedSubAreaID: -1,
			selectedCityID: -1,
		},

	},
	managementCityViewScreen: {
		isLoadingData:false,
		ballotBoxRoles: [],
		ballotsFullData: [], // Need to get by city/quarter!!!
		allElectionsRoles:[],
		showSearchResults: false,
		neighborhoods: [],
		clusters: [],
		cityCachedDataList: {},
		cityShasVotesCachedDataList: {},
		citySupportStatusesCachedDataList: {},
		clusterBallotBoxCachedDataList: {},
		electionsActivistsSummary: {
			[constants.geographicEntityTypes.areaGroup]: {},
			[constants.geographicEntityTypes.area]: {},
			[constants.geographicEntityTypes.subArea]: {},
			[constants.geographicEntityTypes.city]: {},
			[constants.geographicEntityTypes.quarter]: {},
		},
		cityActivistGeoData:{
			entityType: null,
			currentEntity: null,
		},
		municipalCoordinators: [],
		clusterAllocatedActivists: [],
		electionsActivistsClustersSummary: {
			[constants.geographicEntityTypes.city]: {},
			[constants.geographicEntityTypes.quarter]: {},
		},
		cityQuarters: [],
		prev_last_campagin_name:'',
		searchScreen: {
			selectedArea: { selectedValue: '', selectedItem: null },
			selectedSubArea: { selectedValue: '', selectedItem: null },
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedNeighborhood: { selectedValue: '', selectedItem: null },
			selectedCluster: { selectedValue: '', selectedItem: null },
			selectedBallot: { selectedValue: '', selectedItem: null },
		},
		currentPage: 1,
		displayItemsPerPage: 10,
		numOfShasVotersThisCampaign: 0,
		clusters_regular_roles: [],
		clusters_activated_ballots_countings: [],
		clusters_support_statuses: [],
		cluster_activists_and_votes: {
			captain_fifty: [],
			cluster_leader_roles: [],
			driver_roles: [],
			mamritz_roles: [],
			shas_votes_count: 0,
			loadedClusterDataFromAPI: false,
			motivator_role_key:'',
			captain_of_fifty_role_key:'',
			cluster_leader_role_key:'',
			driver_role_key:'',
		},
		//Add allocation modal
		addAllocationModal: {
			activistItem: {}
		}
	},
	importScreen: {
		personalIdentityColIndex: 0, // const
		phoneNumberColIndex: 2, // const
		cityColIndex: 6, // const
		zipColIndex: 13, // const
		voterKeyColIndex: 30, // const
		// The update step tab
		importTab: 'loadData',
		loadData: {
			csvSources: [],
			csvFile: null, // The csv file to import from
			dataSource: '',
			selectedDataSource: null,
			voterId: '',

			selectedVoterKey: '',
			selectedVoterIdentity: '',
			selectedVoterSmallData: '',
		},
		searchVoterScreen: {
			firstName: '',
			lastName: '',
			city: '',
			street: '',
			bottomErrorText: '',
			searchVoterLoading: false,
			searchVoterResult: [],
			selectedCity: null,
			selectedStreet: null,
			selectedVoterIndex: -1,
		},

		dataDefinition: {
			fileData: '',
			comboValuesList: [],
			isKeyOrIDColumnSelected: false,
			isHeader: 0,
			isHousholdUpdate: 1,
			isDuplicatePhoneDelete: 1,
			isHouseholdUpdateItem: false,
			isDuplicatePhoneDeleteItem: false,
		},

		extraData: {
			firstCollapseOpened: true,
			secondCollapseOpened: true,
			thirdCollapseOpened: true,
			fourthCollapseOpened: true,
			selectedStatus: { value: '', item: null },
			updateStatusExistsList:[{ id: 1, name: 'עדכן את סטטוס הסניף לסטטוס הנבחר' }, { id: 0, name: 'אל תבצע עדכון' }],
			updateStatusExists: { value: 'עדכן את סטטוס הסניף לסטטוס הנבחר', item: { id: 1, name: 'עדכן את סטטוס הסניף לסטטוס הנבחר' } },
			supportStatusUpdateType: 2,
			updateStatus4EachHousehold: false,
			classificationItem: { value: '', item: null },
			showChooseInstituteModalDialog: false,
			selectedInstituteKey: '',
			selectedInstituteTypeID: -1,
			selectedInstituteSelectedDataTop: '',
			selectedInstituteSelectedDataBottom: '',
			searchInstituteScreen: {
				selectedGroup: { value: '', item: null },
				selectedType: { value: '', item: null },
				selectedNetwork: { value: '', item: null },
				instituteNameText: '',
				searchInstitutesLoading: false,
				bottomErrorText: '',
			},
			institutesSearchResults: [],
			selectedInstituteIndex: -1,
			selectedRole: { value: '', item: null },
			instituteRoles: [],
			supportStatuses: [],
			ethnicGroups: [],
			religiousGroups: [],
			voterGroups: [],
			selectedVotersGroupsHierarchy: [],
			selectedVoterGroupKey: '',
			selectedVoterGroupFullPathname: '',
			initialVoterGroupParentID: 0,
			newVoterGroupName: '',
			insertedNewGroupName: '',
			selectedEthnicGroup: { value: '', item: null },
			selectedReligiousGroup: { value: '', item: null },
			selectedGender: { value: '', item: null },
			selectedOrthodox: { value: '', item: null },
		},

		lastStepScreen: {
			currentProcessedDataState: {},
			csvFileDataArray: [],
			csvFileDataFilterName: '',
			isDownloadingFile: false,
			fileSrc: '',

			firstCollapseOpened: true,
			secondCollapseOpened: true,
			thirdCollapseOpened: true,
			fourthCollapseOpened: false,
			fifthCollapseOpened: false,
			sixthCollapseOpened: false,
			seventhCollapseOpened: false,
			eightsCollapseOpened: false,
			ninthCollapseOpened: false,
		},
		// An array of voters to select
		// the voter source of the csv file
		votersSources: [],

		// A boolean that indicates whether
		// to show the select voter source
		// Modal Dialog
		showVoterSourceModalDialog: false
	},
	reportsScreen: {
		electionCampaigns: [],
		generalReport: {
			activeTab: 'new',
			currentDisplaiedReportType: constants.generalReportTypes.DETAILED,
			selectedDetailColumns: {},
			isFiltersExpanded: true,
			combineOptions: {
				combineBy: '',
				combineColumns: '',
				combineRowSelectedValue: '',
				selectedColumn: '',
				combineDisplayBy: constants.combineDisplayBy.VOTERS,
				sums : undefined,
			},
			results: {
				resultsPerLoad: 100,
				maxResultsCount: '',
				isLoadingResults: false,
				isDownloadingReport: false,
				isCanceledLoadingResults:false,
				combineRowDetailesTitle: '',
				resultsCount: {
					[constants.generalReportTypes.DETAILED]: 0,
					[constants.generalReportTypes.COMBINED]: 0,
					[constants.generalReportTypes.SAVED]: 0,
					defaultValue: 0
				},
				currentDisplayPaginationIndex: {
					[constants.generalReportTypes.DETAILED]: 1,
					[constants.generalReportTypes.COMBINED]: 1,
					[constants.generalReportTypes.SAVED]: 1,
					defaultValue: 1
				},
				displayItemsPerPage: {
					[constants.generalReportTypes.DETAILED]: 30,
					[constants.generalReportTypes.COMBINED]: 30,
					[constants.generalReportTypes.SAVED]: 30,
					defaultValue: 30
				},
				currentLoadIndex: {
					[constants.generalReportTypes.DETAILED]: 0,
					[constants.generalReportTypes.COMBINED]: 0,
					[constants.generalReportTypes.SAVED]: 0,
					defaultValue: 0
				},
				data: {
					[constants.generalReportTypes.DETAILED]: [],
					[constants.generalReportTypes.COMBINED]: [],
					[constants.generalReportTypes.SAVED]: [],
					defaultValue: []
				},
			},
			savedReports: {
				definitionComboes: [],
				questionairesList: [],
				searchResults: [],
				totalResultsCount: 0,
				searchResultsColumns: [],
				selectedSavedReport: { value: '', item: null },
				detectValidPhoneInsideHousehold: false,
				phonesUniqueNumberPerVoter: false,
				phonesPreferePhoneType: { value: '', item: null },
				smsUniqueNumberPerVoter: false,
				smsShowBlockedSMSPhones: false,
				questionaireID: { value: '', item: null },
				phoneTypes: [],
			},
			sendSms: {
				showModal: false,
				votersCounter: null,
			},
			supportStatus: [],
		},
		generalWalkerReport: {
			/* Rquest data */
			loadingSearchResults: false,
			isNewSearch: false,
			requestData: {},
			/* Result data */
			totalVotersCount: 0,  //total voters in all search.
			resultVotersList: [],
			ballotBoxesHash: {},
			/* Search data */
			cityName: '',
			clusters: [],
			ballotBoxes: [],
		},
		electionDayWalkerReport: {...initial_electionDayWalkerReport},
		captain50WalkerReport: {
			isEditingVoter: false,
			additionalFiltersExpanded: {
				supportStatus: false,
				votingStatus: false,
				groupsInShas: false,
				reportsData: false,
				voterGroups:false,
			},
			loadingSearchResults: false,
			totalVotersCount: 0,
			reportSearchResults: undefined,
			reportSearchResultsCaptainHash:{},
			reportSearchResultsHouseholdHash:{},
			tempNumberOfResultsPerPage: 30,
			numberOfResultsPerPage: 30,
			currentPage: 1,
			displayWithEditOption: false,
			regularFiltersSearchQuery: {},
			showCurrentSupportStatus: true,
			showPreviousSupportStatus: true,
			globalModalMessageHeader: '',
			globalModalMessageContent: '',
			showGlobalMessageModal: false,
			supportStatuses: [],
			dynamicStreets: [],
			searchScreen: {
				showDisplayCaptainFiftyVoterSearchModal: false,
				clusters: [],
				neighborhoods: [],
				ballotBoxes: [],
				selectedArea: { selectedValue: '', selectedItem: null },
				selectedSubArea: { selectedValue: '', selectedItem: null },
				// selectedCity: { selectedValue: 'רמת הכובש', selectedItem: {id: 292, name: "רמת הכובש", key: "1yhdchyi8o", area_id: 15, sub_area_id: 4} },
				selectedCity: { selectedValue: '', selectedItem: null},
				selectedNeighborhood: { selectedValue: '', selectedItem: null },
				selectedCluster: { selectedValue: '', selectedItem: null },
				selectedBallotBox: { selectedValue: '', selectedItem: null },
				ministerFirstName: '',
				ministerLastName: '',

				ministerID: '',
				searchCaptainFiftyVoterModal: {
					selectedCity: { selectedValue: '', selectedItem: null },
					selectedCluster: { selectedValue: '', selectedItem: null },
					ministerFirstName: '',
					ministerLastName: '',
					ministerID: '',
					clusters: [],
					foundVoters: [],
					selectedRowIndex: -1,
				}
			},

		},
		houseHouseholdStatusChangeScreen: {
			searchScreen: {
				clusters: [],
				neighborhoods: [],
				ballotBoxes: [],
				selectedArea: { selectedValue: '', selectedItem: null },
				selectedSubArea: { selectedValue: '', selectedItem: null },
				selectedCity: { selectedValue: '', selectedItem: null },
				selectedNeighborhood: { selectedValue: '', selectedItem: null },
				selectedCluster: { selectedValue: '', selectedItem: null },
				selectedBallotBox: { selectedValue: '', selectedItem: null },
				supportStatuses: [],
				currentStageNumber: 1,
				updateName: '',
				selectedDefinitionHouseholdsWhereCondition: { selectedValue: 'מעל  (גדול שווה)', selectedItem: { id: 1, name: 'מעל  (גדול שווה)', key: 'at_least' } },
				selectedDefinitionHouseholdsNumHouseholds: 1,
				selectedDefinitionEntityType: { selectedValue: 'סניף', selectedItem: { id: 0, name: 'סניף', key: 'branch' } },
				definedVoterSupportStatuses: [false],
				actualVoterSupportStatuses: [false],
				selectedFinalSupportStatus: { selectedValue: '', selectedItem: null },

				total_voters_count_in_geo_entity: -1,
				total_households_count_in_geo_entity: -1,
				selected_voters_count: -1,
				total_households_count: -1,
				usersJobsList: [],
				displayItemsPerPage: 10,
				currentPage: 1,
			},
		}
		,
	},
	citiesScreen: {

		searchCityScreen: {
			rightCitiesListItem: { selectedValue: '', selectedItem: null },
			areasListItem: { selectedValue: '', selectedItem: null },
			subAreasListItem: { selectedValue: '', selectedItem: null },
			leftCitiesListItem: { selectedValue: '', selectedItem: null },

		},

		cityPanelScreen:{...initial_panelScreen} 
	},

	statusesScreen: {
		combos: {
			clusters: [],
			ballots: [],
			neighborhoods: [],

			supportStatuses: []
		},

		loadingData: false,

		result: {
			totalSummaryResults: 0,

			summaryResult: [],

			rowOfTotalSums: {}
		},

		searchFields: {
			area_id: null,
			sub_area_id: null,
			city_id: null,
			cluster_id: null,
			ballot_id: null,

			summary_by_id: null,

			selected_statuses: [],

			start_date: '',
			end_date: ''
		}
	},

	activistsScreen: {
		searchFields: {
			areaId: null,
			areaName: '',

			subAreaId: null,
			subAreaName: '',

			cityId: null,
			cityName: '',

			assigned_city_id: null,
			assigned_city_name: '',

			street: { id: null, name: '', key: '' },

			personal_identity: '',
			first_name: '',
			last_name: '',
			phone_number: '',

			assignmentStatus: null,
			assignmentStatusName: '',

			verifyStatus: null,
			verifyStatusName: '',

			verifyBankStatus: [],
			verifyBankStatusName: '',

			electionRoleId: null,
			electionRoleName: ''
		},
		isLoadingResults: false,
		electionCampaigns:[],
		electionRoles: [],
		electionRolesBudget: [],
		electionRolesCityBudget: [],
		electionRolesShiftsBudgets: [],
		electionRolesShifts: [],

		neighborhoods: [],
		streets: [],
		clusters: [],
		ballots: [],

		ballotRoles: [],

		userGeographicFilters: [],

		searchFilteredAreasHash: [],

		searchFilteredCitiesHash: [],

		loadedActivistsData: false,

		activistsSearchResult: [],
		selectedActivistsRoleId: null,
		totalSearchResults: 0,

		showAddAllocationModal: false,
		addAllocationModalAvailableClusters: [],
		addedAllocationFlag: false,

		activistDetails: {
			id: null,
			key: '',

			first_name: '',
			last_name: '',
			personal_identity: '',
			email: '',

			street: '',
			city_id: '',
			city_key: '',
			city_name: '',

			voter_phones: [],
			election_roles_by_voter: []
		},

		loadedActivist: false,

		savedRoleDetails: false,

		loadingClustersFlag: false,
		loadedClustersFlag: false,
		clustersSearchResult: [],
		totalClustersSearchResult: 0,
		clustersSearchFields: {
			area_id: null,
			sub_area_id: null,
			city_id: null,
			cluster_id: null,

			assignment_status: null
		},

		loadingDriverClustersFlag: false,
		loadedDriverClustersFlag: false,
		driversClustersSearchResult: [],
		totalDriverClustersSearchResult: 0,
		driverClustersSearchFields: {
			area_id: null,
			sub_area_id: null,
			city_id: null,
			cluster_id: null,

			assignment_status: null
		},

		editRoleFlag: false,
		editDriverClusterFlag: false,

		showDeleteDriverClusterErrorModal: false,

		deleteDriverClusterErrorModalTitle: '',

		editedBalotBoxRoleFlag: false,
		ballotsSearchResult: {
			observer: [],
			observerTotalBallots: 0,

			ballotMember: [],
			ballotMemberTotalBallots: 0,

			counter: [],
			counterTotalBallots: 0
		},

		balotSearchFields: {
			observer: {
				area_id: null,
				sub_area_id: null,
				city_id: null,
				neighborhood_id: null,
				cluster_id: null,
				ballot_id: null,

				ballot_role_id: null,

				assignment_status: null
			},

			ballotMember: {
				area_id: null,
				sub_area_id: null,
				city_id: null,
				neighborhood_id: null,
				cluster_id: null,
				ballot_id: null,

				ballot_role_id: null,

				assignment_status: null
			}
		},

		confirmDeleteModal: {
			show: false,
			title: ''
		},

		editBallotFlag: false,

		minister50SearchResult: [],
		totalCaptains50SearchResult: 0,

		searchCaptain50Arrays: {
			clusters: []
		},

		loadingMoreHouseholdsFlag: false,
		loadedMoreHouseholdsFlag: false,
		loadingHouseholdsFlag: false,
        loadedHouseholdsFlag: false,

		householdSearchFields: {
			area_id: null,
			city_id: null,
			street_name: '',

			cluster_id: null,
			ballot_id: null,

			captain_id: null,

			last_name: '',

			allocated_to_captain50: null
		},

		householdsSearchResult: [],
		totalHouseholdsSearchResult: 0,

		// Flag for finishing edit
		// household for captain 50
		editCaptainHouseholdsFlag: false,

		// Flag of editing household flag
		editingCaptainHouseholdsFlag: false,

		clusterLeader: {
			combos: {
				clusters: [],
				neighborhoods: []
			}
		},

		driver: {
			combos: {
				clusters: [],
				neighborhoods: []
			}
		},

		household: {
			combos: {
				clusters: [],
				neighborhoods: [],
				streets: [],
				ballots: []
			}
		},

        modalUpdateAllocationError: {
            displayError: false,
            errorMessage: ''
        }
	},

	ballotsScreen: {
		combos: {
			neighborhoods: [],
			clusters: [],
			ballots: [],

			supportStatuses: [],
			electionCampaigns: [],

			electionsCampaignsHash: {}
		},

		loadingData: false,
		loadingMoreData: false,

		result: {
			totalSummaryResults: 0,

			summaryResult: [],

			rowOfTotalSums: {}
		},

		searchFields: {
			area_id: null,
			sub_area_id: null,
			city_id: null,
			neighborhood_id: null,
			cluster_id: null,
			ballot_id: null,

			support_status_id: null,

			summary_by_id: null,

			selected_statuses: [],
		    selected_ballots:[],
		    selected_clusters:[],
			selected_neighborhoods:[],
			selected_cities:[],
			
			selected_campaigns: [],

			is_district_city: 0,
			is_ballot_strictly_orthodox: 0,

			display_num_of_votes: 0,
			display_vote_statistics: 0,
			display_statuses_statistics: 0,

			display_strictly_orthodox_percents: 1 , 
			display_sephardi_percents: 1 , 
			display_prev_votes_percents: 1 , 
		}
	},

	captainScreen: {
		captain_ballots: [],
		supportStatuses: [],
		loadedFirstSearchResults: false,
		loadingData: false,

		result: {
			totalSummaryResults: 0,

			summaryResult: []
		},

		searchScreen: {
			neighborhoods: [],
			selectedArea: { selectedValue: '', selectedItem: null },
			selectedSubArea: { selectedValue: '', selectedItem: null },
			selectedCity: { selectedValue: '', selectedItem: null },
			selectedNeighborhood: { selectedValue: '', selectedItem: null },
		},
	},

	clustersScreen: {
		combos: {
			clusters: [],
			neighborhoods: [],
			electionRoles: []
		},
		notFoundClusterLeader: false,

		searchFields: {
			area_id: null,
			sub_area_id: null,
			city_id: null,
			cluster_id: null,
			neighborhood_id: null,

			first_name: '',
			last_name: '',
			personal_identity: '',
			leader_key: null,

			selected_roles: []
		},
		loadingData: false,
		loadeLeader: false,

		result: {
			totalSummaryResults: 0,
			summaryResult: []
		},

		modalSearchLeader: {
			clusters: [],

			searchFields: {
				city_id: null,
				cluster_id: null,

				first_name: '',
				last_name: '',
				personal_identity: ''
			},

			result: {
				totalSummaryResults: 0,
				summaryResult: []
			},

			loadingLeaders: false
		}
	},

	votersManualScreen: {
		combos: {
			csvSources: [],
			supportStatuses: [],
            institutes: [],
			instituteRoles: [],
			ethnicGroups: [],
			religiousGroups: [],
			streets: []
		},
		showSuccessMessageWindow:false,

		data_source: {
			loadedVoter: false,
			voter: {}
        },

		secondTab: {
			voter: {},
			loadedVoter: false,

			selectedVoter: {},
			loadedSelectedVoter: false
		},

		savedSelectedVotersFlag: false
	},

    electionsCampaignsScreen: {
		tabsLocked:false,
        combos: {
            electionsCampaigns: [],
			supportStatuses: []
        },

        supportStatus: {
        	previousSupportStatus: [],
        },

		currentCampaign: {},

		editCampaignDetailsFlag: false,
		loadedCampaignDetailsFlag: false,
		campaignDetails: {
            id: null,
            key: null,
            name: null,
            type: null,
            start_date: null,
            end_date: null,
            election_date: null,
            vote_start_time: null,
            vote_end_time: null
		},

		progressBar: {
        	loading: false,
        	percents: 0,
			loaded: false
		},

		voterBooks: [],

		budget: {
        	files: [],
            electionRoles: [], //!! to delete?
            electionRolesShiftsHash: {},

			editedRoleFlag: false
		},

		voteFiles: [],

		percents: {
        	loadedPercentsFlag: false,
            campaignVotesPercents: []
		},

		ballots: {
        	ballotBoxesFiles: []
		},

		supportStatusUpdates: {
            supportStatusUpdates: [],
			totalVoters: null,
			supportStatus: {}
		}
    },
	transportationsScreen: {
		votersTransportations: [],
		totalVotersCount:0,
		transportationsCountByFilters:0,
		isLoading: false,
		isNewSearch: false,
		cityData: {
            isLoaded: false,
			clusters: [],
			drivers: [],
			searchCityKey: null,
			city_name: '',
			clusters_count: 0,
			drivers_count: 0,
			transportations_count: {
					cripple_count: 0,
					not_cripple_count: 0,
					has_driver_count: 0,
					not_has_driver_count: 0
				},
		},
		clustersData: {
			isLoading: false,
            isLoaded: false,
            searchClusterKey: null,
			clusters: []
		},
        driversData: {
            isLoading: false,
            isLoaded: false,
            searchClusterKey: null,
            drivers: []
        },
		displayCommentModal: false,
		displayDriverModal: false,
		driversModal: {
			clusters: [],
			drivers: [] ,
			loadingResults:null,
		}
	},
    captain50Search: {
        minister50SearchResult: [],
        totalCaptains50SearchResult: 0,

		flags: {
			loadingCaptain50s: false,
			loadedCaptain50s: false
		},

		clusters: [],
    }
};

function electionsReducer(state = initialState, action) {
	const geographicEntityTypes = require('../libs/constants').geographicEntityTypes;
	const electionRolesAdditions = require('../libs/constants').activists.electionRolesAdditions;
	const electionRolesSystemNames = require('../libs/constants').electionRoleSytemNames;
	const activistVerifyStatus = require('../libs/constants').activists.verifyStatus;

	let activistIndex = -1;
	let roleIndex = -1;
	let clusterIndex = -1;
	let geoIndex = -1;
	let ballotIndex = -1;
	let householdIndex = -1;
	let supportStatusUpdateIndex = -1;

	switch (action.type) {
		case  ElectionsActions.ActionTypes.GENERAL.iTEM_CHANGE :
			var newState = { ...state };
			newState.general = { ...newState.general }
			
			newState.general[action.itemName] = action.itemValue
		return newState;

		/*
		  change the tab in elections-import screen 
		*/
		case ElectionsActions.ActionTypes.IMPORT.SET_IMPORT_TAB:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };

			newState.importScreen.importTab = action.tabName;
			if (action.tabName == 'dataDefinition') {
				if (action.fileData != undefined) {
					newState.importScreen.dataDefinition = { ...newState.importScreen.dataDefinition };
					newState.importScreen.dataDefinition.comboValuesList = [...newState.importScreen.dataDefinition.comboValuesList];
					newState.importScreen.dataDefinition.fileData = action.fileData;

					for (let i = 0; i < action.fileData.numberOfCols; i++) {
						newState.importScreen.dataDefinition.comboValuesList.push({ id: -1, name: '' });
					}
				}
			}

			return newState;
			break;

		/*
		set/unset modal popap with wanted header and content text : 
		*/
		case ElectionsActions.ActionTypes.SET_MODAL_DIALOG_DATA:
			var newState = { ...state };
			newState.showModalDialog = action.visible;
			newState.modalHeaderText = action.headerText
			newState.modalContentText = action.modalText;
			return newState;
			break;
		/*
		  when existing csv file is loaded by key - it injects returned data to state
		*/
		case ElectionsActions.ActionTypes.IMPORT.CSV_EXISTING_FILE_INJECT_STATE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.loadData = { ...newState.importScreen.loadData };
			newState.importScreen.dataDefinition = { ...newState.importScreen.dataDefinition };
			newState.importScreen.dataDefinition.comboValuesList = [...newState.importScreen.dataDefinition.comboValuesList];
			newState.importScreen.importTab = action.data.loadData;
			let fields = {};
			action.data.fields.map(field => {
				let result = findCsvFieldByName(field['field_name']);
				if (result) {
					fields[field['column_number']] = result;
				}
			});		
			for (let i = 0; i < action.data.dataDefinition.fileData.numberOfCols; i++) {

				if (i in fields) {
				let field = fields[i];
					newState.importScreen.dataDefinition.comboValuesList.push({ id:field.id, name:field.name});
					if (field.full_name == 'personal_identity' || field.full_name == 'key') {
						//combo index 0 is ID and 1 is voter_key - required column to select
						newState.importScreen.dataDefinition.isKeyOrIDColumnSelected = true;
					}
				} else {
					newState.importScreen.dataDefinition.comboValuesList.push({ id: -1, name: '' });
				}
			}

			newState.importScreen.extraData = { ...newState.importScreen.extraData };

			newState.importScreen.extraData.selectedStatus = {...initialState.importScreen.extraData.selectedStatus}
			if (action.data.selectedStatus) {

				newState.importScreen.extraData.selectedStatus = { ...newState.importScreen.extraData.selectedStatus };
				newState.importScreen.extraData.selectedStatus.item = action.data.selectedStatus;
				newState.importScreen.extraData.selectedStatus.value = action.data.selectedStatus.value;
				newState.importScreen.extraData.updateStatus4EachHousehold = action.data.update_household_support_status;
				newState.importScreen.extraData.supportStatusUpdateType = action.data.support_status_update_type;
				for(let i=0; i<initialState.importScreen.extraData.updateStatusExistsList.length; i++) {
					let currentItem = initialState.importScreen.extraData.updateStatusExistsList[i];
					if (currentItem.id == action.data.update_support_status_if_exists) {
						newState.importScreen.extraData.updateStatusExists = {
							value: currentItem.name,
							item: currentItem
						}
					}
				}
			}
			newState.importScreen.extraData.selectedEthnicGroup = {...initialState.importScreen.extraData.selectedEthnicGroup}
			if (action.data.selectedEthnicGroup) {
				newState.importScreen.extraData.selectedEthnicGroup = { ...newState.importScreen.extraData.selectedEthnicGroup };
				newState.importScreen.extraData.selectedEthnicGroup.item = action.data.selectedEthnicGroup;
				newState.importScreen.extraData.selectedEthnicGroup.value = action.data.selectedEthnicGroup.value;
			}
			newState.importScreen.extraData.selectedReligiousGroup = {...initialState.importScreen.extraData.selectedReligiousGroup}
			if (action.data.selectedReligiousGroup) {
				newState.importScreen.extraData.selectedReligiousGroup = { ...newState.importScreen.extraData.selectedReligiousGroup };
				newState.importScreen.extraData.selectedReligiousGroup.item = action.data.selectedReligiousGroup;
				newState.importScreen.extraData.selectedReligiousGroup.value = action.data.selectedReligiousGroup.value;
			}
			newState.importScreen.extraData.selectedGender = {...initialState.importScreen.extraData.selectedGender}

			if (action.data.selectedGender) {

				newState.importScreen.extraData.selectedGender = { ...newState.importScreen.extraData.selectedGender };
				newState.importScreen.extraData.selectedGender.item = action.data.selectedGender;
				newState.importScreen.extraData.selectedGender.value = action.data.selectedGender.value;
			}
			newState.importScreen.extraData.selectedOrthodox = {...initialState.importScreen.extraData.selectedOrthodox}

			if (action.data.selectedOrthodox) {

				newState.importScreen.extraData.selectedOrthodox = { ...newState.importScreen.extraData.selectedOrthodox };
				newState.importScreen.extraData.selectedOrthodox.item = action.data.selectedOrthodox;
				newState.importScreen.extraData.selectedOrthodox.value = action.data.selectedOrthodox.value;
			}

			newState.importScreen.extraData.selectedVoterGroupFullPathname = action.data.selectedVoterGroupFullPathname;

			newState.importScreen.dataDefinition.fileData = action.data.dataDefinition.fileData;
			newState.importScreen.dataDefinition.isHeader = action.data.dataDefinition.fileData.isHeader;
			newState.importScreen.loadData.dataSource = action.data.dataSource;
			newState.importScreen.loadData.selectedVoterKey = action.data.voterKey;
 
			newState.importScreen.loadData.selectedVoterIdentity = action.data.voterIdentity;
			newState.importScreen.loadData.selectedVoterSmallData = action.data.first_name + ' ' + action.data.last_name;

			return newState;
			break;

		/***
		   ACTIONS OF FIRST STEP IN IMPORT SCREEN  : 
		**/

		/*
		clean all state data in first stage : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.CLEAN_FIRST_STAGE:
 
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.loadData = { ...newState.importScreen.loadData };
			newState.importScreen.loadData.csvFile = null;
			newState.importScreen.loadData.dataSource = '';
			newState.importScreen.loadData.selectedDataSource = null;
			newState.importScreen.loadData.voterId = '';
			newState.importScreen.loadData.selectedVoterKey = '';
			newState.importScreen.loadData.selectedVoterIdentity = '';
			newState.importScreen.loadData.selectedVoterSmallData = '';
			return newState;
			break;

		/*
		  Display "select voter source" modal dialog in first step
		*/
		case ElectionsActions.ActionTypes.IMPORT.SHOW_VOTER_SOURCE_MODAL_DIALOG:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.showVoterSourceModalDialog = true;

			return newState;
			break;

		/*
		   Hide and clean "select voter source" modal dialog in first step
		*/
		case ElectionsActions.ActionTypes.IMPORT.HIDE_VOTER_SOURCE_MODAL_DIALOG:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.showVoterSourceModalDialog = false;
			return newState;
			break;

		/*
		Import screen - handle identity number text-field change
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_IDENTITY_NUMBER_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.loadData = { ...newState.importScreen.loadData };
			newState.importScreen.loadData.selectedVoterIdentity = action.newValue;
			return newState;
			break;

		/*
		  handle when specific row is selected and clicked "ok" button : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.SET_VOTER_ROW_SELECTED:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.loadData = { ...newState.importScreen.loadData };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };

			//initialize selected voter data :
			let selectedVoter = action.selectedVoter;
			newState.importScreen.loadData.selectedVoterKey = selectedVoter.voters_key;
			newState.importScreen.loadData.selectedVoterIdentity = selectedVoter.personalIdentity;
			newState.importScreen.loadData.selectedVoterSmallData = selectedVoter.firstName + ' ' + selectedVoter.lastName + ' - ' + selectedVoter.cityName;
			newState.importScreen.showVoterSourceModalDialog = false;
			return newState;
			break;
		/* 
		   clean select-voter modal search fields :
		 */
		case ElectionsActions.ActionTypes.IMPORT.CLEAN_SEARCH_VOTER_STATE_FIELDS:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen.firstName = '';
			newState.importScreen.searchVoterScreen.lastName = '';
			newState.importScreen.searchVoterScreen.street = '';
			newState.importScreen.searchVoterScreen.city = '';
			newState.importScreen.searchVoterScreen.bottomErrorText = '';

			return newState;
			break;

		/*
		  set error at bottom of "select voter source" modal dialog - 
		  where no row is selected.
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_SET_BOTTOM_ERROR:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen.bottomErrorText = action.newText;
			return newState;
			break;

		/*
		   Dynamic function that takes filed name and field value , 
		   and changes it appropriately in "select voter source" modal dialog - 
		   in any of its fields.
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_FIELD_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
			This function is called when in first step main screen voter is
			searched by identity only in the field , and there is a result , so
			the firstName , lastName and city of the screen must be changed
			according to value returned from API , so this function gets fieldName
			and fieldValue , and changes it accordingly.
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_IMPORT_LOAD_FIELD_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.loadData = { ...newState.importScreen.loadData };
			newState.importScreen.loadData[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		   set "loading" message on voter search :
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_FETCH_DATA_BEGIN:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen.searchVoterLoading = true;
			return newState;
			break;


		/*
		  After searching for voter in import-screen , it sets the correct
		  state with found data , and removes "loading" message : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_FETCH_DATA_END:
	 
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen.searchVoterLoading = false;
			newState.importScreen.searchVoterScreen.searchVoterResult = action.searchVoterDataChunk;
			if (action.constructSmallVoterData) {
				newState.importScreen.loadData = { ...newState.importScreen.loadData };
				if (newState.importScreen.searchVoterScreen.searchVoterResult.length > 0) {
					let resultObj = (newState.importScreen.searchVoterScreen.searchVoterResult)[0];
					newState.importScreen.loadData.selectedVoterKey = resultObj.voters_key;
					newState.importScreen.loadData.selectedVoterSmallData = resultObj.firstName + ' ' + resultObj.lastName + ' - ' + resultObj.cityName;
				}
				else {
	 
					newState.importScreen.loadData.selectedVoterKey = '';
					newState.importScreen.loadData.selectedVoterSmallData = '';
				}
			}
			return newState;
			break;

		/*
		  function that gets specific row from found voters result set , 
		  and selects/unselects it : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_SET_ROW_SELECTED:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen.searchVoterResult = [...newState.importScreen.searchVoterScreen.searchVoterResult];
			for (let i in newState.importScreen.searchVoterScreen.searchVoterResult) {
				newState.importScreen.searchVoterScreen.searchVoterResult[i].isSelected = false; // first , unselect all rows
			}
			newState.importScreen.searchVoterScreen.searchVoterResult[action.selectedRowIdx].isSelected = true; // then select the correct row
			newState.importScreen.searchVoterScreen.selectedVoterIndex = action.selectedRowIdx;
			return newState;
			break;

		/*
		   function that cleans search results array and set index to -1 : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.VOTER_SEARCH_CLEAN_DATA:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.searchVoterScreen = { ...newState.importScreen.searchVoterScreen };
			newState.importScreen.searchVoterScreen.searchVoterResult = [];
			newState.importScreen.searchVoterScreen.selectedVoterIndex = -1;
			return newState;
			break;

		/***
		   ACTIONS OF SECOND STEP IN IMPORT SCREEN  : 
		**/

		/*
		clean all state data in second stage : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.CLEAN_SECOND_STAGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.dataDefinition = { ...newState.importScreen.dataDefinition };
			newState.importScreen.dataDefinition.fileData = '';
			newState.importScreen.dataDefinition.comboValuesList = [];
			newState.importScreen.dataDefinition.isKeyOrIDColumnSelected = false;
			newState.importScreen.dataDefinition.isHeader = 0;
			newState.importScreen.dataDefinition.isHousholdUpdate = 1;
			newState.importScreen.dataDefinition.isDuplicatePhoneDelete = 1;
			newState.importScreen.dataDefinition.isHouseholdUpdateItem = false;
			newState.importScreen.dataDefinition.isDuplicatePhoneDeleteItem = false;

			return newState;
			break;

		/*
		   gets combo index and combo value ,and changed the appropriate 
		   combo value :
		*/
		case ElectionsActions.ActionTypes.IMPORT.COMBO_VALUE_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.dataDefinition = { ...newState.importScreen.dataDefinition };
			newState.importScreen.dataDefinition.comboValuesList = [...newState.importScreen.dataDefinition.comboValuesList];
			newState.importScreen.dataDefinition.comboValuesList[action.comboIndex] = { id: action.selectedIndex, name: action.comboValue };
			let comboValuesList = newState.importScreen.dataDefinition.comboValuesList; 

			let voterKeyColIndex = state.importScreen.voterKeyColIndex;
			let personalIdentityColIndex = state.importScreen.personalIdentityColIndex;
			let phoneNumberColIndex = state.importScreen.phoneNumberColIndex;
			let cityColIndex = state.importScreen.houseColIndex;
			let zipColIndex = state.importScreen.zipColIndex;

			if (action.selectedIndex == personalIdentityColIndex || action.selectedIndex == voterKeyColIndex) {
				// required columns had selected
				newState.importScreen.dataDefinition.isKeyOrIDColumnSelected = true;
			} else {
				/*
				  else if some column being unselected - checked
				  if exist at least one identity number selected : 
				*/
				newState.importScreen.dataDefinition.isKeyOrIDColumnSelected = false;
				for (let i = 0, len = comboValuesList.length; i < len; i++) {
					if (comboValuesList[i].id == personalIdentityColIndex || comboValuesList[i].id == voterKeyColIndex) {
						newState.importScreen.dataDefinition.isKeyOrIDColumnSelected = true;
						break;
					}
				}

				let addressFieldCount = 0;
				let phoneFieldCount = 0;
				for (let i = 0, len = comboValuesList.length; i < len; i++) {
					if (comboValuesList[i].id >= cityColIndex && comboValuesList[i].id <= zipColIndex) {
						addressFieldCount++;
					}
					if (comboValuesList[i].id == phoneNumberColIndex) {
						phoneFieldCount++;
					}
				}
				if (addressFieldCount == 0) {
					newState.importScreen.dataDefinition.isHouseholdUpdateItem = false;
					newState.importScreen.dataDefinition.isHousholdUpdate = 0;
				}
				else {
					newState.importScreen.dataDefinition.isHouseholdUpdateItem = true;
					newState.importScreen.dataDefinition.isHousholdUpdate = 1;
				}

				if (phoneFieldCount == 0) {
					newState.importScreen.dataDefinition.isDuplicatePhoneDelete = 0;
					newState.importScreen.dataDefinition.isDuplicatePhoneDeleteItem = false;
				}
				else {
					newState.importScreen.dataDefinition.isDuplicatePhoneDelete = 1;
					newState.importScreen.dataDefinition.isDuplicatePhoneDeleteItem = true;
				}

			}
			return newState;
			break;

		/*
		   changes checkbox that determines if csv file has header : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.IS_FILE_CHECKBOX_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.dataDefinition = { ...newState.importScreen.dataDefinition };
			newState.importScreen.dataDefinition[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/***
		   ACTIONS OF THIRD STEP IN IMPORT SCREEN  : 
		**/

		/*
		  get all support statuses : 
		  */
		case ElectionsActions.ActionTypes.IMPORT.SUPPORT_STATUS_FETCH_DATA_END:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.supportStatuses = action.supportStatuses;
			return newState;
			break;
		/*
		get all institute roles array : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.INSTITUTE_SEARCH_FETCH_DATA_END:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.instituteRoles = action.instituteRoles;
			return newState;
			break;

		/*
		clean all state data in third stage : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.CLEAN_THIRD_STAGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };

			newState.importScreen.extraData = {...initialState.importScreen.extraData};

			return newState;
			break;

		/*
		  function that gets as param the collapse name , and inverts its collapse status : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_COLLAPSE_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData[action.container] = !newState.importScreen.extraData[action.container];
			return newState;
			break;


		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_VOTER_GROUP_COMBO_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.selectedVotersGroupsHierarchy = [...newState.importScreen.extraData.selectedVotersGroupsHierarchy];
			if (!newState.importScreen.extraData.selectedVotersGroupsHierarchy[action.levelIndex]) {
				newState.importScreen.extraData.selectedVotersGroupsHierarchy.push({ value: '', item: null });
			}
			newState.importScreen.extraData.selectedVotersGroupsHierarchy[action.levelIndex] = { ...newState.importScreen.extraData.selectedVotersGroupsHierarchy[action.levelIndex] };
			newState.importScreen.extraData.selectedVotersGroupsHierarchy[action.levelIndex].value = action.levelValue;
			newState.importScreen.extraData.selectedVotersGroupsHierarchy[action.levelIndex].item = action.levelItem;

			if (!action.levelItem) {

				for (let i = newState.importScreen.extraData.selectedVotersGroupsHierarchy.length - 1; i >= action.levelIndex; i--) {
					newState.importScreen.extraData.selectedVotersGroupsHierarchy.splice(i, 1);
				}
			}
			else {
				for (let i = newState.importScreen.extraData.selectedVotersGroupsHierarchy.length - 1; i > action.levelIndex; i--) {

					newState.importScreen.extraData.selectedVotersGroupsHierarchy.splice(i, 1);

				}
			}
			return newState;
			break;

		/*
		  generic function that get combo-state value and combo reference , and
		  changes state value + combo value : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_COMBO_ITEM_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData[action.comboName] = { ...newState.importScreen.extraData[action.comboName] };
			newState.importScreen.extraData[action.comboName].value = action.comboValue;
			newState.importScreen.extraData[action.comboName].item = action.comboReference;
			return newState;
			break;

		/*
		  generic function that get non-combo field name and changes its state value : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_REGULAR_ITEM_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData[action.itemName] = action.itemValue;
			return newState;
			break;

		/*
		  After adding new voter group it will refresh the voter groups in state : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_APPEND_TO_VOTER_GROUPS:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.voterGroups = [...newState.importScreen.extraData.voterGroups];
			newState.importScreen.extraData.voterGroups.push(action.data);
			newState.importScreen.extraData.selectedVotersGroupsHierarchy = [...newState.importScreen.extraData.selectedVotersGroupsHierarchy];
			newState.importScreen.extraData.insertedNewGroupName = action.data.name;
			newState.importScreen.extraData.selectedVoterGroupKey = action.data.key;
			//newState.importScreen.extraData.selectedVotersGroupsHierarchy = {value:action.data.name , item:action.data};
			newState.importScreen.extraData.newVoterGroupName = '';
			return newState;
			break;


		/*
		  Display "select institute source" modal dialog in third step
		*/
		case ElectionsActions.ActionTypes.IMPORT.SHOW_INSTITUTE_SOURCE_MODAL_DIALOG:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.showChooseInstituteModalDialog = true;
			return newState;
			break;

		/*
		   Hide and clean "select institute source" modal dialog in third step
		*/
		case ElectionsActions.ActionTypes.IMPORT.HIDE_INSTITUTE_SOURCE_MODAL_DIALOG:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.showChooseInstituteModalDialog = false;
			return newState;
			break;

		/*
		 THIRD STEP - SEARCH INSTITUTE WINDOW : generic function that get COMBO-state value and combo reference , and
		 changes state value + combo value : 
	   */
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.searchInstituteScreen = { ...newState.importScreen.extraData.searchInstituteScreen };
			newState.importScreen.extraData.searchInstituteScreen[action.comboName] = { ...newState.importScreen.extraData.searchInstituteScreen[action.comboName] };
			newState.importScreen.extraData.searchInstituteScreen[action.comboName].value = action.comboValue;
			newState.importScreen.extraData.searchInstituteScreen[action.comboName].item = action.comboReference;
			return newState;
			break;


		/*
		  THIRD STEP - SEARCH INSTITUTE WINDOW : generic function that get regular item (NON COMBO)-state value  :  
		*/
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_SEARCH_INSTITUTE_FIELD_ITEM_CHANGE:
		case ElectionsActions.ActionTypes.IMPORT.THIRD_STEP_SEARCH_INSTITUTE_COMBO_ITEM_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.searchInstituteScreen = { ...newState.importScreen.extraData.searchInstituteScreen };
			newState.importScreen.extraData.searchInstituteScreen[action.itemName] = { ...newState.importScreen.extraData.searchInstituteScreen[action.itemName] };
			newState.importScreen.extraData.searchInstituteScreen[action.itemName] = action.itemValue;
			return newState;
			break;

		/*
		  function that gets specific row from found institutes result set , 
		  and selects/unselects it : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.INSTITUTE_SEARCH_SET_ROW_SELECTED:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.institutesSearchResults = [...newState.importScreen.extraData.institutesSearchResults];
			for (let i in newState.importScreen.extraData.institutesSearchResults) {
				newState.importScreen.extraData.institutesSearchResults[i] = { ...newState.importScreen.extraData.institutesSearchResults[i] };
				newState.importScreen.extraData.institutesSearchResults[i].isSelected = false; // first , unselect all rows
			}
			newState.importScreen.extraData.institutesSearchResults[action.selectedRowIdx] = { ...newState.importScreen.extraData.institutesSearchResults[action.selectedRowIdx] };
			newState.importScreen.extraData.institutesSearchResults[action.selectedRowIdx].isSelected = true; // then select the correct row
			newState.importScreen.extraData.selectedInstituteIndex = action.selectedRowIdx;
			return newState;
			break;

		/*
		  handle when specific institute row is selected and clicked "ok" button : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.CHOOSED_INSTITUTE_ROW:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.institutesSearchResults = [...newState.importScreen.extraData.institutesSearchResults];
			//initialize selected institute :
			let selectedInstitute = action.selectedInstitute;
			newState.importScreen.extraData.selectedInstituteKey = selectedInstitute.key;
			newState.importScreen.extraData.selectedInstituteTypeID = selectedInstitute.type_id;
			newState.importScreen.extraData.selectedInstituteSelectedDataTop = selectedInstitute.name + ',';
			newState.importScreen.extraData.selectedInstituteSelectedDataBottom = selectedInstitute.type_name + ',' + selectedInstitute.city_name;
			newState.importScreen.extraData.showChooseInstituteModalDialog = false;
			return newState;
			break;

		/*
		   clean institute search results and search fields(state) in search institutes modal window : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.INSTITUTES_SEARCH_CLEAN_DATA:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.extraData = { ...newState.importScreen.extraData };
			newState.importScreen.extraData.institutesSearchResults = [];
			newState.importScreen.extraData.selectedInstituteIndex = -1;

			//clean all search-screen fields : 
			newState.importScreen.extraData.searchInstituteScreen = { ...newState.importScreen.extraData.searchInstituteScreen };
			newState.importScreen.extraData.searchInstituteScreen.selectedGroup = { ...newState.importScreen.extraData.searchInstituteScreen.selectedGroup };
			newState.importScreen.extraData.searchInstituteScreen.selectedGroup.value = '';
			newState.importScreen.extraData.searchInstituteScreen.selectedGroup.item = null;

			newState.importScreen.extraData.searchInstituteScreen.selectedType.value = '';
			newState.importScreen.extraData.searchInstituteScreen.selectedType.item = null;

			newState.importScreen.extraData.searchInstituteScreen.selectedNetwork.value = '';
			newState.importScreen.extraData.searchInstituteScreen.selectedNetwork.item = null;

			newState.importScreen.extraData.searchInstituteScreen.instituteNameText = '';
			newState.importScreen.extraData.searchInstituteScreen.searchInstitutesLoading = false;
			newState.importScreen.extraData.searchInstituteScreen.bottomErrorText = '';

			return newState;
			break;
		/***
		   ACTIONS OF FINAL STEP IN IMPORT SCREEN  : 
		**/

		/*
		clean all state data in fourth stage : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.CLEAN_FOURTH_STAGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.lastStepScreen = { ...newState.importScreen.lastStepScreen };
			newState.importScreen.lastStepScreen.currentProcessedDataState = {};
			newState.importScreen.lastStepScreen.csvFileDataArray = [];
			newState.importScreen.lastStepScreen.csvFileDataFilterName = '';
			newState.importScreen.lastStepScreen.isDownloadingFile = false;
			newState.importScreen.lastStepScreen.firstCollapseOpened = true;
			newState.importScreen.lastStepScreen.secondCollapseOpened = true;
			newState.importScreen.lastStepScreen.thirdCollapseOpened = true;
			newState.importScreen.lastStepScreen.fourthCollapseOpened = false;
			newState.importScreen.lastStepScreen.fifthCollapseOpened = false;
			newState.importScreen.lastStepScreen.sixthCollapseOpened = false;
			newState.importScreen.lastStepScreen.seventhCollapseOpened = false;


			return newState;
			break;

		/*
		  function that gets as param the collapse name , and inverts its collapse status : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.FINAL_STEP_COLLAPSE_CHANGE:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.lastStepScreen = { ...newState.importScreen.lastStepScreen };
			newState.importScreen.lastStepScreen[action.container] = !newState.importScreen.lastStepScreen[action.container];
			return newState;
			break;

		/*
		 each time that function of processed rows status will be called - 
		 it will return number of currently processed rows and csv file status : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.UPDATE_CURRENT_JOB_ROWS_STATUS:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.lastStepScreen = { ...newState.importScreen.lastStepScreen };
			newState.importScreen.lastStepScreen.currentProcessedDataState = action.data;

            newState.importScreen.extraData = { ...newState.importScreen.extraData };
            newState.importScreen.extraData.selectedInstituteSelectedDataTop = action.data.instituteName;
            newState.importScreen.extraData.selectedRole = {item:{id:(action.data.instituteRole ? action.data.instituteRole : null)} , value:(action.data.instituteRole ? action.data.instituteRole.name : '')};

			return newState;
			break;

		/*
		 call to function that will filter csv-file rows according to
		 parameter criteria supplied : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.SET_CSV_FILE_DATA_TO_DOWNLOAD:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.lastStepScreen = { ...newState.importScreen.lastStepScreen };
			newState.importScreen.lastStepScreen.csvFileDataArray = action.data;
			newState.importScreen.lastStepScreen.csvFileDataFilterName = action.fileActionName;
			newState.importScreen.lastStepScreen.isDownloadingFile = true; //set file true in order to download
			return newState;
			break;

		/*
		mark 'isDownloadingFile' state field as false in order 
		to avoid repeative file downloads after download : 
		*/
		case ElectionsActions.ActionTypes.IMPORT.FILE_FINISHED_DOWNLOADING:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.lastStepScreen = { ...newState.importScreen.lastStepScreen };
			newState.importScreen.lastStepScreen.isDownloadingFile = false; //set file false in order to avoid multiple downloading
			return newState;
			break;

		/*
	   change iframe src to download the wanted filtered csv file in 4-th satage:
	   */
		case ElectionsActions.ActionTypes.IMPORT.SET_IFRAME_CSV_FILE_SRC:
			var newState = { ...state };
			newState.importScreen = { ...newState.importScreen };
			newState.importScreen.lastStepScreen = { ...newState.importScreen.lastStepScreen };
			newState.importScreen.lastStepScreen.fileSrc = action.srcName;
			return newState;
			break;

		/*
		add new vote to user's temporary votes array in  manual-votes screen
		
		@param voteData
		*/
		case ElectionsActions.ActionTypes.MANUAL_VOTES.ADD_TEMP_USER_UPDATE:
			var newState = { ...state };
			newState.manualVotesScreen = { ...newState.manualVotesScreen };
			newState.manualVotesScreen.lastUpdatesList = [...newState.manualVotesScreen.lastUpdatesList];
			newState.manualVotesScreen.lastUpdatesList.push(action.voteData);
			return newState;
			break;
		/*
	  remove from user's temporary votes array in  manual-votes screen by index
  	
	  @param tempVotesArrayIndex
	  */
		case ElectionsActions.ActionTypes.MANUAL_VOTES.REMOVE_TEMP_USER_UPDATE:
			var newState = { ...state };
			newState.manualVotesScreen = { ...newState.manualVotesScreen };
			newState.manualVotesScreen.lastUpdatesList = [...newState.manualVotesScreen.lastUpdatesList];
			newState.manualVotesScreen.lastUpdatesList.splice(action.tempVotesArrayIndex, 1);
			return newState;
			break;
		/*
	  change field in all manual-votes screen
  	
	  @param fieldName
	  @param fieldValue
	  */
		case ElectionsActions.ActionTypes.MANUAL_VOTES.GLOBAL_SCREEN_SET_PARAM_VALUE:
			var newState = { ...state };
			newState.manualVotesScreen = { ...newState.manualVotesScreen };
			newState.manualVotesScreen.searchScreen = { ...newState.manualVotesScreen.searchScreen };
			newState.manualVotesScreen[action.fieldName] = action.fieldValue;
			if (action.fieldName == 'foundVoterData') {
				newState.manualVotesScreen.searchScreen.selectedVoterNumber = '';
				newState.manualVotesScreen.searchScreen.selectedVoterIdentityNumber = '';
			}
			return newState;
			break;

	    /*
		clean manual-votes screen - search + results
		*/
		case ElectionsActions.ActionTypes.MANUAL_VOTES.CLEAN_SCREEN:
			var newState = { ...state };
			newState.manualVotesScreen = { ...newState.manualVotesScreen };
			newState.manualVotesScreen.searchScreen = { ...newState.manualVotesScreen.searchScreen };

			/** Clean also city and ballotBoxes - now not in use */
			// newState.manualVotesScreen.searchScreen.selectedCity = {selectedValue : '' , selectedItem:null};
			// newState.manualVotesScreen.searchScreen.selectedBallotBox = {selectedValue : '' , selectedItem:null};
			// newState.manualVotesScreen.searchScreen.ballotBoxes =[];
			// newState.manualVotesScreen.searchScreen.possibleVoters=[];
			// newState.manualVotesScreen.lastUpdatesList = [];
			/** End Clean also city and ballotBoxes */

			newState.manualVotesScreen.searchScreen.selectedVoterNumber = '';
			newState.manualVotesScreen.searchScreen.selectedVoterIdentityNumber = '';

			newState.manualVotesScreen.foundVoterData = null;
			newState.manualVotesScreen.loadingResults = false;

			return newState;
	    /*
		clean manual-votes search screen only  
		*/
		case ElectionsActions.ActionTypes.MANUAL_VOTES.CLEAN_SEARCH_SCREEN:
			var newState = { ...state };
			newState.manualVotesScreen = { ...newState.manualVotesScreen };
			newState.manualVotesScreen.searchScreen = { ...newState.manualVotesScreen.searchScreen };
			newState.manualVotesScreen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
			newState.manualVotesScreen.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
			newState.manualVotesScreen.searchScreen.ballotBoxes = [];
			newState.manualVotesScreen.searchScreen.selectedVoterIdentityNumber = '';
			newState.manualVotesScreen.searchScreen.selectedVoterNumber = '';
			newState.manualVotesScreen.searchScreen.possibleVoters = [];
			return newState;
			break;
	    /*
		change field in search subcreen of manual-votes screen
		
		@param fieldName
		@param fieldValue
		*/
		case ElectionsActions.ActionTypes.MANUAL_VOTES.SEARCH_SCREEN_SET_PARAM_VALUE:
			var newState = { ...state };
			newState.manualVotesScreen = { ...newState.manualVotesScreen };
			newState.manualVotesScreen.searchScreen = { ...newState.manualVotesScreen.searchScreen };
			newState.manualVotesScreen.searchScreen[action.fieldName] = action.fieldValue;

			return newState;
			break;


		/*
		dashboard screen - got all the csv files - put it into state 
		*/
		case ElectionsActions.ActionTypes.DASHBOARD.LOADED_DATA:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };

			newState.dashboardScreen.allDataRows = action.rows;
			newState.dashboardScreen.totalDataRows = action.totalRows;

			return newState;
			break;
			
		case ElectionsActions.ActionTypes.DASHBOARD.UPDATE_CSV_FILE_STATUS:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };
			newState.dashboardScreen.allDataRows = [ ...newState.dashboardScreen.allDataRows ];
			
			let csvfIndex = newState.dashboardScreen.allDataRows.findIndex(item => item.key == action.itemKey);
            if ( csvfIndex > -1 ) {
                newState.electionsCampaignsScreen.voteFiles[csvfIndex] = {... newState.electionsCampaignsScreen.voteFiles[csvfIndex]};
                newState.electionsCampaignsScreen.voteFiles[csvfIndex].status = constants.csvParserStatus.cancelled;
			}
		 
			return newState;
			break;

		case ElectionsActions.ActionTypes.DASHBOARD.LOAD_MORE_DATA:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };
			newState.dashboardScreen.allDataRows = [...newState.dashboardScreen.allDataRows];

			for (let rowIndex = 0; rowIndex < action.rows.length; rowIndex++) {
				newState.dashboardScreen.allDataRows.push(action.rows[rowIndex]);
			}

			return newState;
			break;

		case ElectionsActions.ActionTypes.DASHBOARD.REFRESH_DATA:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };
			newState.dashboardScreen.allDataRows = [...newState.dashboardScreen.allDataRows];

			let allDataIndex = (action.currentPage - 1) * action.numOfRowsToLoad;

			for (let rowIndex = 0; rowIndex < action.numOfRowsToLoad; rowIndex++ , allDataIndex++) {
				newState.dashboardScreen.allDataRows[allDataIndex] = { ...newState.dashboardScreen.allDataRows[allDataIndex] };

				newState.dashboardScreen.allDataRows[allDataIndex] = action.rows[rowIndex];
			}

			return newState;
			break;
		/*
		 dashboard screen - handles change in page
		 */
		case ElectionsActions.ActionTypes.DASHBOARD.CHANGE_CURRENT_PAGE:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };
			newState.dashboardScreen.currentPage = action.currentPage;
			return newState;
			break;

		case ElectionsActions.ActionTypes.DASHBOARD.CHANGE_LOADED_DATA_FLAG:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };

			newState.dashboardScreen.loadedDataFlag = action.flag;

			return newState;
			break;

		case ElectionsActions.ActionTypes.DASHBOARD.RESET_ALL_DATA:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };

			newState.dashboardScreen.allDataRows = [];
			newState.dashboardScreen.totalDataRows = 0;

			return newState;
			break;
		/*
	 dashboard screen -change iframe src to download the csv file:
	 */
		case ElectionsActions.ActionTypes.DASHBOARD.DASHBOARD_SET_IFRAME_CSV_FILE_SRC:
			var newState = { ...state };
			newState.dashboardScreen = { ...newState.dashboardScreen };
			newState.dashboardScreen.fileSrc = action.srcName;
			return newState;
			break;





		/*********************************************************************** START General Report **/
		case ElectionsActions.ActionTypes.REPORTS.SET_GENERAL_REPORT_RESULTS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.data = { ...newState.reportsScreen.generalReport.results.data };
			newState.reportsScreen.generalReport.results.data[action.reportType] = [...newState.reportsScreen.generalReport.results.data[action.reportType], ...action.data.data];
			newState.reportsScreen.generalReport.results.resultsCount = { ...newState.reportsScreen.generalReport.results.resultsCount };
			newState.reportsScreen.generalReport.results.resultsCount[action.reportType] = action.data.count || newState.reportsScreen.generalReport.results.resultsCount[action.reportType];
			newState.reportsScreen.generalReport.results.currentLoadIndex = { ...newState.reportsScreen.generalReport.results.currentLoadIndex };
			newState.reportsScreen.generalReport.results.currentLoadIndex[action.reportType]++;
			newState.reportsScreen.generalReport.combineOptions = { ...newState.reportsScreen.generalReport.combineOptions };
			if(action.reportType == constants.generalReportTypes.COMBINED){
				if(action.data.sums){
					newState.reportsScreen.generalReport.combineOptions.sums = action.data.sums;
				}
			}
			else{
				// newState.reportsScreen.generalReport.combineOptions.sums=[];
			}
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.SET_GENERAL_REPORT_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport[action.fieldName] = action.fieldValue;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.GENERAL.LOAD_SUPPORT_STATUS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.supportStatus = action.supportStatus;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.RESET_REPORT_RESULTS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.data = { ...newState.reportsScreen.generalReport.results.data };
			newState.reportsScreen.generalReport.results.data[action.reportType] = newState.reportsScreen.generalReport.results.data.defaultValue;

			newState.reportsScreen.generalReport.results.resultsCount = { ...newState.reportsScreen.generalReport.results.resultsCount };
			newState.reportsScreen.generalReport.results.resultsCount[action.reportType] = newState.reportsScreen.generalReport.results.resultsCount.defaultValue;

			newState.reportsScreen.generalReport.results.currentLoadIndex = { ...newState.reportsScreen.generalReport.results.currentLoadIndex };
			newState.reportsScreen.generalReport.results.currentLoadIndex[action.reportType] = newState.reportsScreen.generalReport.results.currentLoadIndex.defaultValue;

			newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex = { ...newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex };
			newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex[action.reportType] = newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex.defaultValue;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.UPDATE_RESULTS_DISPLAY_COUNT_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.displayItemsPerPage = { ...newState.reportsScreen.generalReport.results.displayItemsPerPage };
			newState.reportsScreen.generalReport.results.displayItemsPerPage[newState.reportsScreen.generalReport.currentDisplaiedReportType] = action.value;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CHANGE_CURRENT_DISPLAIED_REPORT_TYPE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.currentDisplaiedReportType = action.reportType;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.NAVIGATE_TO_RESULTS_PAGE_INDEX:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex = { ...newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex };
			newState.reportsScreen.generalReport.results.currentDisplayPaginationIndex[action.reportType] = action.pageIndex;
			return newState;
		case ElectionsActions.ActionTypes.REPORTS.CHANGE_COMBINE_OPTIONS_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.combineOptions = { ...newState.reportsScreen.generalReport.combineOptions };
			newState.reportsScreen.generalReport.combineOptions[action.key] = action.value;
			return newState;
		case ElectionsActions.ActionTypes.REPORTS.LOADING_REPORT_RESULTS_STATUS_CHANGED:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.isLoadingResults = action.isLoadingResults;
			return newState;
			break;
			
		case ElectionsActions.ActionTypes.REPORTS.IS_CANCELED_LOADING_RESULTS_CHANGED:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.isCanceledLoadingResults = action.isCanceledLoadingResults;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.DOWNLOADING_REPORT_STATUS_CHANGED:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.isDownloadingReport = action.isDownloading;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CHANGE_MAX_RESULTS_COUNT:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.maxResultsCount = action.value;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.SET_SELECTED_COMBINE_ROW_DETAILES:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.results = { ...newState.reportsScreen.generalReport.results };
			newState.reportsScreen.generalReport.results.combineRowDetailesTitle = action.detailesTitle;
			newState.reportsScreen.generalReport.combineOptions = { ...newState.reportsScreen.generalReport.combineOptions };
			newState.reportsScreen.generalReport.combineOptions.combineRowSelectedValue = action.selectedValue.toString();
			newState.reportsScreen.generalReport.combineOptions.selectedColumn = action.selectedColumn;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.SET_DEFAULT_SELECTED_DETAILED_COLUMNS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.selectedDetailColumns = action.detailColumns;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.selectedDetailColumns = { ...newState.reportsScreen.generalReport.selectedDetailColumns };

			let optionName = action.optionName;
			let operation = action.operation;
			switch (operation) {
				case 'add':
					newState.reportsScreen.generalReport.selectedDetailColumns[optionName] = action.optionData;
					break;
				case 'delete':
					delete newState.reportsScreen.generalReport.selectedDetailColumns[optionName];
					break;
				case 'edit':
					newState.reportsScreen.generalReport.selectedDetailColumns[optionName] = { ...newState.reportsScreen.generalReport.selectedDetailColumns[optionName] };
					newState.reportsScreen.generalReport.selectedDetailColumns[optionName] = action.optionData;
					break;
			}
			return newState;
			break;

        case ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_WITH_ELECTION_CAMPAIGN:
            var newState = { ...state };
            newState.reportsScreen = { ...newState.reportsScreen };
            newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
            newState.reportsScreen.generalReport.selectedDetailColumns = { ...newState.reportsScreen.generalReport.selectedDetailColumns };

            var optionName = action.optionName;
            var operation = action.operation;
            switch (operation) {
                case 'add':
                	let currentName = optionName + '_' + action.optionData.electionCampaign.id;
                    newState.reportsScreen.generalReport.selectedDetailColumns[currentName]= {};
                    newState.reportsScreen.generalReport.selectedDetailColumns[currentName] = action.optionData;
                    newState.reportsScreen.generalReport.selectedDetailColumns[currentName].name = currentName;
                    break;

                case 'delete':
                    let currentName2 = optionName + '_' + action.optionData.electionCampaign.id;

                    delete newState.reportsScreen.generalReport.selectedDetailColumns[currentName2];
                    break;
            }

            return newState;
            break;

		case ElectionsActions.ActionTypes.REPORTS.UPDATE_SELECTED_DETAILED_COLUMNS_ORDER:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.selectedDetailColumns = { ...newState.reportsScreen.generalReport.selectedDetailColumns };
			action.optionsNewOrder.map(option => {
				newState.reportsScreen.generalReport.selectedDetailColumns[option.optionName] = { ...newState.reportsScreen.generalReport.selectedDetailColumns[option.optionName] };
				newState.reportsScreen.generalReport.selectedDetailColumns[option.optionName]['displayOrder'] = option.newDisplayOrder;
			});
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.LOAD_ELECTION_CAMPAIGNS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionCampaigns = _.sortBy(action.data, 'id').reverse();
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.TOGGLE_FILTERS_COLLAPSE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.isFiltersExpanded = !newState.reportsScreen.generalReport.isFiltersExpanded;
			return newState;
			break;

		/*
		   saved reports subscreen - change value inside by field name
		   
		   @param fieldName
		   @param fieldValue
		*/
		case ElectionsActions.ActionTypes.REPORTS.CHANGE_SAVED_REPORT_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.savedReports = { ...newState.reportsScreen.generalReport.savedReports };
			newState.reportsScreen.generalReport.savedReports[action.fieldName] = action.fieldValue;
			return newState;
			break;
		case ElectionsActions.ActionTypes.REPORTS.SEND_SMS.SHOW_SMS_MODAL:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.sendSms = { ...newState.reportsScreen.generalReport.sendSms };
			newState.reportsScreen.generalReport.sendSms.showModal = action.show;
			return newState;
		case ElectionsActions.ActionTypes.REPORTS.SEND_SMS.VOTERS_COUNTER:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalReport = { ...newState.reportsScreen.generalReport };
			newState.reportsScreen.generalReport.sendSms = { ...newState.reportsScreen.generalReport.sendSms };
			newState.reportsScreen.generalReport.sendSms.votersCounter = action.votersCounter;
			return newState;
		/*********************************************************************** END General Report **/

		/*
		changes combo value and item by combo name in state
		
		@param fieldName - the name of combo in state
		@param selectedValue - the text value of combo in state
		@param selectedItem - the name of combo in state
		*/
		case ElectionsActions.ActionTypes.CITIES.COMBO_LIST_ITEM_CHANGED:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.searchCityScreen = { ...newState.citiesScreen.searchCityScreen };
			newState.citiesScreen.searchCityScreen[action.fieldName] = { ...newState.citiesScreen.searchCityScreen[action.fieldName] };
			newState.citiesScreen.searchCityScreen[action.fieldName].selectedValue = action.selectedValue;
			newState.citiesScreen.searchCityScreen[action.fieldName].selectedItem = action.selectedItem;
			return newState;
			break;

		/*
		populates city data in state after successfull city loading : 
		*/
		case ElectionsActions.ActionTypes.CITIES.INJECT_CITY_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.topScreen = { ...newState.citiesScreen.cityPanelScreen.topScreen };

			newState.citiesScreen.cityPanelScreen.topScreen.cityName = action.data.city_name;
			newState.citiesScreen.cityPanelScreen.topScreen.cityCode = action.data.city_mi_id;
			newState.citiesScreen.cityPanelScreen.topScreen.areaName = action.data.area_name;

			newState.citiesScreen.cityPanelScreen.topScreen.crmTeamName = action.data.crm_team_name || '';
			newState.citiesScreen.cityPanelScreen.topScreen.crmTeamKey = action.data.crm_team_key || '';
			
			newState.citiesScreen.cityPanelScreen.topScreen.teamName = action.data.team_name  || '';
			newState.citiesScreen.cityPanelScreen.topScreen.teamKey = action.data.team_key  || '';
			newState.citiesScreen.cityPanelScreen.topScreen.teamLeaderName = action.data.first_name ? (action.data.first_name + ' ' + action.data.last_name) : '';
			newState.citiesScreen.cityPanelScreen.topScreen.teamLeaderPhone =  action.data.phone_number  || '';

			newState.citiesScreen.cityPanelScreen.topScreen.assignLeaderPhoneNumber = action.data.assign_leader_phone_number;
			newState.citiesScreen.cityPanelScreen.topScreen.assign_leader_email = action.data.assign_leader_email;
			newState.citiesScreen.cityPanelScreen.topScreen.district = action.data.district;
			return newState;
			break;

		/*
		  shows/hide modal of choosing team in city-data screen
	
		  @param show : true/false		  
		*/
		case ElectionsActions.ActionTypes.CITIES.SHOW_HIDE_CHOOSE_TEAM_MODAL_DIALOG:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.topScreen = { ...newState.citiesScreen.cityPanelScreen.topScreen };
			newState.citiesScreen.cityPanelScreen.topScreen.displayChooseTeamModal = action.show;
			return newState;
			break;

		/*
		  changes state item value by name - in topCityData screen only
	
		  @param fieldName	
		  @param fieldValue		  
		*/
		case ElectionsActions.ActionTypes.CITIES.CHANGE_ITEM_TOP_CITY_DATA_SCREEN:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.topScreen = { ...newState.citiesScreen.cityPanelScreen.topScreen };
			newState.citiesScreen.cityPanelScreen.topScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		handle getting all teams from api - put it into teamsList state-variable
		*/
		case ElectionsActions.ActionTypes.CITIES.INJECT_TEAMS_LIST:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.teamsList = action.data;
			return newState;
			break;

		case ElectionsActions.ActionTypes.CITIES.UPDATE_CITY_ASSIGN_FIELD:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.topScreen = { ...newState.citiesScreen.cityPanelScreen.topScreen };
			let requestData = action.requestData;

			if(requestData.is_assign_leader_phone_number){
				newState.citiesScreen.cityPanelScreen.topScreen.assignLeaderPhoneNumber = (requestData.assign_leader_phone_number || '' ) ;
			}else if(requestData.is_assign_leader_email){
				newState.citiesScreen.cityPanelScreen.topScreen.assign_leader_email = (requestData.assign_leader_email || '' ) ;
			}
			return newState;
			break;
			
			
		/*
		handles choosing and saving team to city : 
		*/
		case ElectionsActions.ActionTypes.CITIES.UPDATE_CITY_TEAM_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.topScreen = { ...newState.citiesScreen.cityPanelScreen.topScreen };
			if(action.changeCrmTeam){
				newState.citiesScreen.cityPanelScreen.topScreen.crmTeamName = action.teamName;
				newState.citiesScreen.cityPanelScreen.topScreen.crmTeamKey = action.teamKey;
			} else {
				newState.citiesScreen.cityPanelScreen.topScreen.teamName = action.teamName;
				newState.citiesScreen.cityPanelScreen.topScreen.teamKey = action.teamKey;
				newState.citiesScreen.cityPanelScreen.topScreen.teamLeaderName = action.teamLeaderName;
				newState.citiesScreen.cityPanelScreen.topScreen.teamLeaderPhone =  action.teamLeaderPhone;
			}
			newState.citiesScreen.cityPanelScreen.topScreen.displayChooseTeamModal = false;
			newState.citiesScreen.cityPanelScreen.topScreen.selectedTeam = { selectedValue: '', selectedItem: null };
			return newState;
			break;
		/*
		handles choosing and saving team to city : 
		*/
		case ElectionsActions.ActionTypes.CITIES.LOADED_REQUEST_MUNICIPAL_SUB_TOPICS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.municipalSubTopicsList = action.subTopics;

			return newState;
			break;

		/*
		handles click on one of the main tabs :
		*/
		case ElectionsActions.ActionTypes.CITIES.CHANGE_MAIN_TAB_NUMBER:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.mainTabsActiveTabNumber = action.mainTabNumber;
			return newState;
			break;

		/*
		handles getting municipal campaigns list from api :
		*/
		case ElectionsActions.ActionTypes.CITIES.MUNICIAL_CAMPAIGNS_FETCH_DATA_END:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.campaignsList = action.data.campaigns_list;
			newState.citiesScreen.cityPanelScreen.selectedCampaign = { selectedValue: action.data.latest_campaign.name, selectedItem: action.data.latest_campaign };
			return newState;
			break;

		/*
		 handles change of election-campaign combo value :
		*/
		case ElectionsActions.ActionTypes.CITIES.MUNICIAL_CAMPAIGN_COMBO_VALUE_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.selectedCampaign = { selectedValue: action.fieldValue, selectedItem: action.fieldItem };
			return newState;
			break;


		/*
		 handles recieving data about municipal election campaing in city :
		*/
		case ElectionsActions.ActionTypes.CITIES.MUNICIAL_CAMPAIGNS_CITY_PARTIES_FETCH_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			for (let i = 0; i < action.data.municipal_election_parties.length; i++) {
				newState.citiesScreen.cityPanelScreen[i] = { ...newState.citiesScreen.cityPanelScreen[i] };
				action.data.municipal_election_parties[i].editing = false;
			}
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = action.data;
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates.length; i++) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates];
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates[i] };
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates[i].editing = false;
			}
			for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates.length; i++) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates];
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates[i] };
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates[i].editing = false;
			}

			return newState;
			break;

		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.CHANGE_SUB_TAB:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.firstGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.firstGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.firstGeneralTabScreen.activeTabIndex = action.activeTabIndex;

			return newState;
			break;

		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_SUB_TAB:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.activeTabIndex = action.activeTabIndex;

			return newState;
			break;
		/*
		handles showing/hiding row that adds new city municipal campaign party : 
		
		@param show
		
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_ADDING_MUNICIPAL_CAMPAIGN:

			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaign = action.show;
			if (!action.show) {
				newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen = { ...newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen };
				newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.name = '';
				newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.letters = '';
				newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.isShas = false;
			}
			return newState;
			break;

		/*
		handles changing item fieldValue by fieldName in adding new municipal campaign party screen (third sub tab) : 
		
		@param fieldName
		$param fieldValue
		
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.NEW_MUNICIPAL_CAMPAIGN_PARTY_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen = { ...newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen };
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		handles successfull adding of municipal election party  : 
		
		@param data - returned new row : 
		
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADDED_NEW_MUNICIAL_ELECTION_PARTY:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };

			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties];
				if (action.isShas == 1) {
					for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.length; i++) {
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] };
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i].shas = 0;

					}
				}

				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.push(action.data);
			}
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaign = false;
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen = { ...newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen };
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.name = '';
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.letters = '';
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.isShas = false;

			return newState;
			break;

		/*
		show/hide confirm delete municipal campaign party dialog window 
	    
		@param show-true/false
		@header 
		$title
		$deleteIndex
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SHOW_HIDE_CONFIRM_DELETE_MUNICIPAL_ELECTION_PARTY_DIALOG:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.showConfirmDeleteMunicipalElectionPartyDialog = action.show;
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyHeader = action.header;
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyContent = action.title;
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyDeleteIndex = action.deleteIndex;
			return newState;
			break;

		/*
		  updates state after a specific municipal-election-party row was deleted : 
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DELETED_MUNICIAL_ELECTION_PARTY:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			//newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = {...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData};

			if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties];
				for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.length; i++) {
					if (newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyDeleteIndex == i) {
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.splice(i, 1);
						break;
					}
				}
			}
			newState.citiesScreen.cityPanelScreen.showConfirmDeleteMunicipalElectionPartyDialog = false;
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyHeader = '';
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyContent = '';

			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyDeleteIndex = -1;
			return newState;
			break;

		/*
		  set municipal-election-party row editing to true/false
		  
		  @param isEditing
		  @param rowIndex
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_MUNICIAL_ELECTION_PARTY_ROW_EDITING:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };

			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };

			if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {

				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties];
				for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.length; i++) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] };
					if (action.rowIndex == i) {
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i].editing = action.isEditing;
					}
					else {
						if (action.isShas == 1) {

							newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i].shas = 0;
						}

					}
				}
			}

			return newState;
			break;

		/*
		  handle municipal-election-party row item value change
		  
		  @param rowIndex
		  @param fieldName
		  @param fieldValue
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ELECTION_PARTY_ROW_EDITING_ROW_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties];

				for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.length; i++) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] };
					if (action.rowIndex == i) {
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] };
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i][action.fieldName] = action.fieldValue;
						break;
					}
				}
			}

			return newState;
			break;

		/*
		  first tab - handle change in combo of city-parties
		  
		  @param selectedValue
		  @param selectedItem
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.CHANGE_SELECTED_PARTY_FOR_CITY:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.selectedPartyForCity = { ...newState.citiesScreen.cityPanelScreen.selectedPartyForCity };
			newState.citiesScreen.cityPanelScreen.selectedPartyForCity.selectedValue = action.selectedValue;
			newState.citiesScreen.cityPanelScreen.selectedPartyForCity.selectedItem = action.selectedItem;
			return newState;
			break;

		/*
		  first tab - change party values only in case of adding new main party to city  : 
		  
		  @param fieldName
		  @param fieldValue
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MAIN_CITY_PARTY_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.editCityPartyScreen = { ...newState.citiesScreen.cityPanelScreen.editCityPartyScreen };
			newState.citiesScreen.cityPanelScreen.editCityPartyScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		  primary tab first subtab - change municipal campaign city data  : 
		  
		  @param fieldName
		  @param fieldValue
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.MUNICIPAL_CAMPAIGN_CITY_DATA_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		  primary tab first subtab - successfully saved changes : 
		  
		  
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SAVED_MUNICIPAL_ELECTION_CITY_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			if (action.data) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city };
				if (!action.data.municipal_election_party_id) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties];
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.push(action.data);
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city.municipal_election_party_id = action.data.id;
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData = action.data;
					if (action.data.shas == 1) {
						for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties.length; i++) {
							newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i] };

							if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i].id != action.data.id) {
								newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties[i].shas = 0;
							}

						}
					}
				}
				else {

					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city.municipal_election_party_id = action.data.municipal_election_party_id;
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city.partyData = action.data.party_data;
				}
			}
			newState.citiesScreen.cityPanelScreen.firstCollapseExpanded = true;
			return newState;
			break;

		/*
			 changes first collapse 'isOpened' to param  value - in first sub tab in primary tab
	 
			 @param isViewMode   
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.FIRST_TAB_FIRST_COLLAPSE_STATUS_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.firstCollapseExpanded = action.isViewMode;
			return newState;
			break;

		/*
		  set adding new mayor-candidate adding to true/false
	
		  @param show
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_ADDING_NEW_MAYOR_CANDIDATE_ROW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.isAddingMayorCandidate = action.show;
			return newState;
			break;

		/*
		  set adding new council-candidate adding to true/false
	
		  @param show
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_ADDING_NEW_COUNCIL_CANDIDATE_ROW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.isAddingCouncilCandidate = action.show;
			return newState;
			break;

		/*
			  change in one of state fields of add-new-mayor-candidate screen
	
			  @param fieldName
			  @param fieldValue
		    
		 */
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_MAYOR_CANDIDATE_SCREEN_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen = { ...newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen };
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen[action.fieldName] = action.fieldValue;

			return newState;
			break;

		/*
			  change in one of state fields of add-new-council-candidate screen
	
			  @param fieldName
			  @param fieldValue
		    
		 */
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.ADD_NEW_COUNCIL_CANDIDATE_SCREEN_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen = { ...newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen };
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		   sets found-voter to received data , or to empty object :
	
		   @param : data
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_FOUND_VOTER_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			if (!action.screenName) {
				newState.citiesScreen.cityPanelScreen.foundVoter = action.data;
			}
			else {
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].foundVoter = action.data;
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].fullVoterName = action.data.first_name + ' ' + action.data.last_name;
			}
			return newState;
			break;

		/*
		   handles successfull adding of candidate
		   
		   @param : candidateType
		   @param : data
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SUCCESSFULLY_ADDED_CANDIDATE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			if (action.candidateType == 'mayor') {
				newState.citiesScreen.cityPanelScreen.isAddingMayorCandidate = false;
				if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates];
					if (action.isFavorite == 1) {
						for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates.length; i++) {
							newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates[i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates[i] };
							newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates[i].favorite = 0;

						}
					}
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates.push(action.data);
				}
				newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen = { ...newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen };
				newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.personalIdentity = '';
				newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.shas = 0;
				newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.favorite = 0;
				newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.selectedParty = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.selectedPhone = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.foundVoter = {};

			}
			else if (action.candidateType == 'council') {
				newState.citiesScreen.cityPanelScreen.isAddingCouncilCandidate = false;

				if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
					newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };
					newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items = [...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items];
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates];
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates.push(action.data);
					newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items.push(action.data);//ADDED .....
				}
				newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen = { ...newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen };
				newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.personalIdentity = '';
				newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.shas = 0;
				newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.favorite = 0;
				newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.selectedParty = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.selectedPhone = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.foundVoter = {};

			}
			return newState;
			break;

		/*
			  set confirm delete to true/false - by changing index to rowNumber(show) or -1(hide) by table name = mayor/council candidate
	
			  @param rowFieldName 
			  @param rowIndex
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_CANDIDATE_ROW_CONFIRM_DELETE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen[action.rowFieldName] = action.rowIndex;
			return newState;
			break;


		/*
			  handle successfull delete of candidate row 
	
			  @param candidateType - mayor/council
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SUCCESSFULLY_DELETED_CANDIDATE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			if (action.candidateType == 'mayor') {
				if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates];
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates.splice(newState.citiesScreen.cityPanelScreen.deleteMayorCandidateIndex, 1);
				}
				newState.citiesScreen.cityPanelScreen.deleteMayorCandidateIndex = -1;


			}
			else if (action.candidateType == 'council') {
				if (newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData) {
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates];
					newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };
					newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items = [...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items];

					newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates.splice(newState.citiesScreen.cityPanelScreen.deleteCouncilCandidateIndex, 1);
					newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items.splice(newState.citiesScreen.cityPanelScreen.deleteCouncilCandidateIndex, 1);
				}
				newState.citiesScreen.cityPanelScreen.deleteCouncilCandidateIndex = -1;

			}
			return newState;
			break;

		/*
		   set row of mayor/council candidate as editing : 
		
		   @param candidateTypeArray
		   @param rowIndex
		   @param isEditing
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_CANDIDATE_ROW_EDITING:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray] = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray]];
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][action.rowIndex] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][action.rowIndex] };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][action.rowIndex].editing = action.isEditing;
			if (action.isFavorite == '1') {
				for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray].length; i++) {
					if (i != action.rowIndex) {
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][i] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][i] };
						newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][i].favorite = 0;
					}
				}
			}
			return newState;
			break;


		/*
		   Change mayor/council candidate row editin-item value  : 
		
		   @param candidateTypeArray
		   @param rowIndex
		   @param fieldName
		   @param fieldValue
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.EDITING_CANDIDATE_ROW_ITEM_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray] = [...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray]];
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][action.rowIndex] = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][action.rowIndex] };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData[action.candidateTypeArray][action.rowIndex][action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		   Set council candidate table as sorting
		
		   @param isSorting
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.SET_COUNCIL_CANDIDATE_TABLE_SORTING:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			newState.citiesScreen.cityPanelScreen.isCouncilCandidateRowInDnDSort = action.isSorting;

			return newState;
			break;

		/*
			 Make copy of rows for DND sorting for municipal candidates
		 */
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.LOAD_COUNCIL_CANDIDATES_DND_SORT_ITEMS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items = action.data;
			return newState;
			break;

		/*
			 Make copy of rows for DND sorting for council members
		 */
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.LOAD_COUNCIL_MEMBERS_DND_SORT_ITEMS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items = action.data;

			return newState;
			break;

		/*
		   handles dragging council-candidate row without dropping : 
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_SORT_CANDIDATE_ROW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items = [...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items];

			var items = newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items;
			if (newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.originalItems.length == 0)
				newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.originalItems = [...items];
			var extractedItem = null;
			for (var i = 0; i < items.length; i++) {
				if (items[i].key == action.fromItem.key) {
					extractedItem = (items.splice(i, 1))[0];
					break;
				}
			}
			for (var i = 0; i < items.length; i++) {
				if (items[i].key == action.toItem.key) {
					if (action.before)
						items.splice(i, 0, extractedItem);
					else
						items.splice(i + 1, 0, extractedItem);
					break;
				}
			}
			return newState;
			break;

		/*
	   handles dragging council-candidate row without dropping : 
	*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items = [...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items];

			var items = newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items;
			if (newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.originalItems.length == 0)
				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.originalItems = [...items];
			var extractedItem = null;
			for (var i = 0; i < items.length; i++) {
				if (items[i].key == action.fromItem.key) {
					extractedItem = (items.splice(i, 1))[0];
					break;
				}
			}
			for (var i = 0; i < items.length; i++) {
				if (items[i].key == action.toItem.key) {
					if (action.before)
						items.splice(i, 0, extractedItem);
					else
						items.splice(i + 1, 0, extractedItem);
					break;
				}
			}
			return newState;
			break;

		/*
		 handles 'drop' action in council-candidate row after the row draggings : 
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_SORT_CANDIDATE_ROW_DROP:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.originalItems = [];
			return newState;
			break;

		/*
		 handles 'drop' action after the row draggings of council-member row  : 
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_SORT_COUNCIL_MEMBER_ROW_DROP:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.originalItems = [];
			return newState;
			break;

		/*
		 cancels any changes in order rows of council-candidate - it returns them to original : 
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.DND_CANDIDATE_ROW_REVERT_TO_ORIGINAL:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates };

			if (newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.originalItems.length > 0) {
				newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items = [...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.originalItems];
				newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.originalItems = [];
			}
			return newState;
			break;

		/*
		 cancels any changes in order rows of council members - it returns them to original : 
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DND_COUNCIL_MEMBER_ROW_REVERT_TO_ORIGINAL:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers };

			if (newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.originalItems.length > 0) {
				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items = [...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.originalItems];
				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.originalItems = [];
			}
			return newState;
			break;

		/*
		Handles successfull update of council-candidates orders : 
		*/
		case ElectionsActions.ActionTypes.CITIES.FIRST_TAB.COUNCIL_CANDIDATES_SUCCESSFULLY_UPADES_ORDERS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates = [...newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates.items];
			newState.citiesScreen.cityPanelScreen.isCouncilCandidateRowInDnDSort = false;
			for (let i = 0; i < newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates.length; i++) {
				newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates[i].order = (i + 1);
			}
			return newState;
			break;

		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.LOADED_ALL_CITY_ROLES_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityRolesMayors = action.data.city_roles_mayors;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityRolesDeputyMayors = action.data.city_roles_deputy_mayors;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers = action.data.city_council_members;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.religiousCouncilMembers = action.data.religious_council_members;

			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers };
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items = [...action.data.city_council_members];


			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityShasRolesByVoters = action.data.city_shas_roles_by_voters;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityDepartments = action.data.all_city_departments;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityParties = action.data.all_city_parties;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.religiousCouncilRoles = action.data.religious_council_roles;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityShasRoles = action.data.city_shas_roles;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.headquarters_phone_number = action.data.headquarters_phone_number;
			return newState;
			break;

		/*
		Handles change in item of add-new-role screen - mayor or depute mayor role
		
		@param screenName
		@param itemName
		@param itemValue
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_ADD_NEW_ROLE_SCREEN_ITEM_VALUE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };

			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] };

			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName][action.itemName] = action.itemValue;
			return newState;
			break;

		/*
		General second tab function - set one of its items to value
		
		@param itemName
		$param itemValue
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.SET_SECOND_TAB_ITEM_VALUE_BY_NAME:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.itemName] = action.itemValue;
			return newState;
			break;

		/*
		 Clean new screen data of city role after adding/canceling 
		 
		 @param screenName
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CLEAN_NEW_CITY_ROLE_SCREEN_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].visible = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].personalIdentity = '';

			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].toDate = '';


			if (action.screenName == 'newCouncilReligeousRole' || action.screenName == 'newCouncilCityShasRole') {
				if (action.screenName == 'newCouncilCityShasRole') {
					newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].council_number = ''
				}
				else {
					newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].shas = 0;
				}
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].selectedRole = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].selectedPhone = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].visibleHistory = false;
			}
			else {
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].shas = 0;
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].departmentItem = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].campaignItem = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].partyItem = { selectedValue: '', selectedItem: null };
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].councilNumber = '';
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].termOfOffice = '';
			}
			return newState;
			break;

		/*
		 after successfull adding - update city roles array by type 
		 
		 @param data
		 @param role_type
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.ADDED_CITY_ROLE_FOR_VOTER:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			let collectionScreenName = '';

			switch (action.role_type) {
				case 0:
					collectionScreenName = 'cityRolesMayors';
					break;
				case 1:
					collectionScreenName = 'cityRolesDeputyMayors'
					break;
				case 2:
					collectionScreenName = 'cityCouncilMembers'
					break;
				case 3:
					collectionScreenName = 'religiousCouncilMembers'
					break;
				case 4:
					collectionScreenName = 'cityShasRolesByVoters'
					break;
			}
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenName] = [...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenName]];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenName].push(action.data);
			if (collectionScreenName == 'cityCouncilMembers') {

				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers };
				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items.push(action.data);
			}
			return newState;
			break;

		/*
		  after successfull deleting - update the needed array and hide confirm dialog
		  
		  @param role_type
		 */
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.DELETED_CITY_ROLE_ROW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			let collectionScreenNameToDelete = '';
			switch (action.roleType) {
				case 0:
					collectionScreenNameToDelete = 'cityRolesMayors';
					break;
				case 1:
					collectionScreenNameToDelete = 'cityRolesDeputyMayors'
					break;
				case 2:
					collectionScreenNameToDelete = 'cityCouncilMembers'
					break;
				case 3:
					collectionScreenNameToDelete = 'religiousCouncilMembers'
					break;
				case 4:
					collectionScreenNameToDelete = 'cityShasRolesByVoters'
					break;
			}
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete] = [...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete]];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete].splice(newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete + 'DeleteIndex'], 1);
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete + 'DeleteIndex'] = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete + 'HistoryDeleteIndex'] = -1;
			if (collectionScreenNameToDelete == 'cityCouncilMembers') {
				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = { ...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers };
				newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items.splice(newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[collectionScreenNameToDelete + 'DeleteIndex'], 1);
			}

			return newState;
			break;

		/*
		 Handles change in roles array item by role-type , field name and field value
		  
		 @param collectionName 
		 @param rowIndex
		 @param fieldName
		 @param fieldValue
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CHANGE_ROLES_COLLECTION_ITEM_VALUE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.collectionName] = [...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.collectionName]];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.collectionName][action.rowIndex] = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.collectionName][action.rowIndex] };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.collectionName][action.rowIndex][action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		Handles successfull update of council-members orders : 
		*/
		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.COUNCIL_MEMBERS_SUCCESSFULLY_UPADES_ORDERS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			//newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers = [...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers]; 			
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers = [...newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers.items];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.isCityConcilMemberRowInDnDSort = false;
			for (let i = 0; i < newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers.length; i++) {
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers[i].order = (i + 1);
			}
			return newState;
			break;

		case ElectionsActions.ActionTypes.CITIES.SECOND_TAB.CLEAN_NEW_RELIGEOUS_OR_SHAS_ROLE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName] };
			if (action.isHistoryItem) {
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].visibleHistory = false;
			}
			else {
				newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].visible = false;
			}
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].selectedRole = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].selectedPhone = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].shas = 0;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen[action.screenName].toDate = '';

			return newState;
			break;

		/*
		   Handles getting historical election campaigns from api : 
		 */
		case ElectionsActions.ActionTypes.CITIES.THIRD_TAB.LOADED_HISTORICAL_ELECTION_CAMPAIGNS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			if (action.loadType == 'first') {
				newState.citiesScreen.cityPanelScreen.historicalElectionCampaigns = action.data;
			}
			else if (action.loadType == 'second') {
				newState.citiesScreen.cityPanelScreen.historicalElectionCampaignsVotesData = action.data;
			}
			return newState;
			break;
		/*
		   Handles change in election campaign in fourth tab :
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.CHANGE_SELECTED_CAMPAIGN:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.selectedCampaign = action.item;
			return newState;
			break;

		/*
		   Handles getting city budget of specific campaign :
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.LOADED_CITY_BUDGET:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			let cityBudgets = action.data;
			cityBudgets.forEach(function(budget,i){
				cityBudgets[i].budget_expected_expenses = [budget.budget_expected_expenses];
			})
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets = cityBudgets;
			return newState;
			break;

		/*
		   Set specific row of budgets collections to closed=true/false 
	
		   @param rowIndex
		   @param isOpened
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_BUDGET_ROW_OPENED:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets = [...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets];
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[action.rowIndex].opened = action.isOpened;
			return newState;
			break;

		/*
			Set all budget rows of the same type to opened/closed
	
			@param budgetType
			@param isOpened
	
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_BUDGET_ROWS_OF_SAME_TYPE_OPENED:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets = [...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets];
			for (let i = 0; i < newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets.length; i++) {
				if (newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[i].budget_type == action.budgetType) {
					newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[i].opened = action.isOpened;
				}
			}
			return newState;
			break;

		/*
			Set inner activist budget row editing to true/false
	
			@param budgetOuterRowIndex
			@param budgetInnerRowIndex
			@param isEditing
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SET_ACTIVIST_BUDGET_INNER_ROW_EDITING:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets = [...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets];
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[action.budgetOuterRowIndex]['budget_expected_expenses'][action.budgetInnerRowIndex].editing = action.isEditing;
			return newState;
			break;

		/*
			Handles change in value of one of textboxes inside activist budget row
	
			@param budgetOuterRowIndex
			@param budgetInnerRowIndex
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.ACTIVIST_BUDGET_ROW_ITEM_VALUE_CHANGE:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets = [...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets];
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[action.budgetOuterRowIndex]['budget_expected_expenses'][action.budgetInnerRowIndex][action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
			Handles successfull activist budget row update
	
			@param budgetOuterRowIndex
			@param budgetInnerRowIndex
			@param data - history data
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.UPDATED_ACTIVISTS_EXPENSES_ROW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets = [...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets];
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[action.budgetOuterRowIndex]['budget_expected_expenses'][action.budgetInnerRowIndex].editing = false;
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.cityBudgets[action.budgetOuterRowIndex]['budget_expected_expenses'][action.budgetInnerRowIndex]['action_history'] = action.data;
			return newState;
			break;

		/*
			Set parameters to show/hide modal window of activist budget expenses actions history
	
			@param budgetOuterRowIndex
			@param budgetInnerRowIndex
		    
		*/
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.SHOW_ACTIONS_HISTORY_MODAL_WINDOW:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.actionHistoryOuterIndex = action.budgetOuterRowIndex;
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.actionHistoryInnerIndex = action.budgetInnerRowIndex;
			return newState;
			break;

		/*
		   Handles successfull recieving of elections roles counting 
	
		   @param data
		 */
		case ElectionsActions.ActionTypes.CITIES.FOURTH_TAB.LOADED_CITY_ELECTION_ROLES_COUNTINGS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.electionsRoleData = action.data;
			return newState;
			break;

		/*
			Clean city search and city management all screen data
		*/
		case ElectionsActions.ActionTypes.CITIES.CLEAN_ALL_CITIES_AND_SEARCH_SCREENS:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.searchCityScreen = { ...newState.citiesScreen.searchCityScreen };
			newState.citiesScreen.searchCityScreen.rightCitiesListItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.searchCityScreen.areasListItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.searchCityScreen.subAreasListItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.searchCityScreen.leftCitiesListItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen = { ...newState.citiesScreen.cityPanelScreen };
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen = { ...newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen };
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.name = '';
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.letters = '';
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaignScreen.isShas = false;
			newState.citiesScreen.cityPanelScreen.addingNewMunicipalElectionsCampaign = false;
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData = { ...newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData };
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_city = [];
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.municipal_election_parties = [];
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.mayor_candidates = [];
			newState.citiesScreen.cityPanelScreen.cityMunicipalElectionsCampaignsData.council_candidates = [];
			newState.citiesScreen.cityPanelScreen.selectedCampaign = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.selectedPartyForCity = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.editCityPartyScreen = { ...newState.citiesScreen.cityPanelScreen.editCityPartyScreen };
			newState.citiesScreen.cityPanelScreen.editCityPartyScreen.name = '';
			newState.citiesScreen.cityPanelScreen.editCityPartyScreen.letters = '';
			newState.citiesScreen.cityPanelScreen.editCityPartyScreen.isShas = false;
			newState.citiesScreen.cityPanelScreen.firstCollapseExpanded = true;
			newState.citiesScreen.cityPanelScreen.campaignsList = [];
			newState.citiesScreen.cityPanelScreen.mainTabsActiveTabNumber = 1;
			newState.citiesScreen.cityPanelScreen.subTabsActiveTabNumber = 1;
			newState.citiesScreen.cityPanelScreen.showConfirmDeleteMunicipalElectionPartyDialog = false;
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyHeader = '';
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyContent = '';
			newState.citiesScreen.cityPanelScreen.confirmDeleteMunicipalElectionPartyDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.teamsList = [];
			newState.citiesScreen.cityPanelScreen.topScreen = { ...newState.citiesScreen.cityPanelScreen.topScreen };
			newState.citiesScreen.cityPanelScreen.topScreen.cityName = '';
			newState.citiesScreen.cityPanelScreen.topScreen.cityCode = '-';
			newState.citiesScreen.cityPanelScreen.topScreen.areaName = '-';
			newState.citiesScreen.cityPanelScreen.topScreen.subAreaName = '-';
			newState.citiesScreen.cityPanelScreen.topScreen.teamName = '-';
			newState.citiesScreen.cityPanelScreen.topScreen.teamKey = '';
			newState.citiesScreen.cityPanelScreen.topScreen.teamLeaderName = '-';
			newState.citiesScreen.cityPanelScreen.topScreen.teamLeaderPhone = '-';
			newState.citiesScreen.cityPanelScreen.topScreen.district = 0;
			newState.citiesScreen.cityPanelScreen.topScreen.displayChooseTeamModal = false;
			newState.citiesScreen.cityPanelScreen.topScreen.selectedTeam = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.isAddingMayorCandidate = false;
			newState.citiesScreen.cityPanelScreen.isAddingCouncilCandidate = false;
			newState.citiesScreen.cityPanelScreen.foundVoter = {};
			newState.citiesScreen.cityPanelScreen.deleteMayorCandidateIndex = -1;
			newState.citiesScreen.cityPanelScreen.deleteCouncilCandidateIndex = -1;
			newState.citiesScreen.cityPanelScreen.tempDndList = [];
			newState.citiesScreen.cityPanelScreen.isCouncilCandidateRowInDnDSort = false;
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen = { ...newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen };
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.selectedParty = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.selectedPhone = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.shas = 0;
			newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen.favorite = 0;
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen = { ...newState.citiesScreen.cityPanelScreen.newMayorCandidateScreen };
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.selectedParty = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.selectedPhone = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.shas = 0;
			newState.citiesScreen.cityPanelScreen.newCouncilCandidateScreen.order = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityRolesMayors = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreencityRolesDeputyMayors = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembers = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.religiousCouncilMembers = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityShasRolesByVoters = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityDepartments = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.allCityParties = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.religiousCouncilRoles = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityShasRoles = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.headquarters_phone_number = null;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.visible = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.departmentItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.campaignItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.partyItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.shas = 0;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.councilNumber = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.termOfOffice = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newMayorRoleScreen.toDate = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.visible = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.departmentItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.campaignItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.partyItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.shas = 0;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.councilNumber = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.termOfOffice = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newDeputyMayorRoleScreen.toDate = '';

			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.visible = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.departmentItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.campaignItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.partyItem = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.shas = 0;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.councilNumber = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.termOfOffice = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilMebmerScreen.toDate = '';

			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.visible = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.visibleHistory = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.selectedPhone = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.selectedRole = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.shas = 0;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilReligeousRole.toDate = '';

			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole = { ...newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.visible = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.visibleHistory = false;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.foundVoter = [];
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.personalIdentity = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.fullVoterName = '';
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.selectedPhone = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.selectedRole = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.councilNumber = 0;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.fromDate = nowDate;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.newCouncilCityShasRole.toDate = '';


			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityRolesMayorsDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityRolesDeputyMayorsDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityCouncilMembersDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.religiousCouncilMembersHistoryDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityShasRolesByVotersHistoryDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.religiousCouncilMembersDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.cityShasRolesByVotersDeleteIndex = -1;
			newState.citiesScreen.cityPanelScreen.secondGeneralTabScreen.isCityConcilMemberRowInDnDSort = false;

			newState.citiesScreen.cityPanelScreen.historicalElectionCampaigns = [];
			newState.citiesScreen.cityPanelScreen.historicalElectionCampaignsVotesData = [];

			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen = { ...newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.selectedCampaign = { selectedValue: '', selectedItem: null };
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreencityBudgets = [];
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.actionHistoryOuterIndex = -1;
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.actionHistoryInnerIndex = -1;
			newState.citiesScreen.cityPanelScreen.fourthGeneralTabScreen.electionsRoleData = [];

			newState.citiesScreen.cityPanelScreen.dndSortScreenFirstTabMunicipalCandidates = [];
			newState.citiesScreen.cityPanelScreen.dndSortScreenSecondTabCouncilMembers = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CLEAN_SCREEN:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen = {...initialState.activistsScreen};

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.SEARCH_INPUT_FIELD_CHANGE:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.searchFields = { ...newState.activistsScreen.searchFields };
			newState.activistsScreen.searchFields[action.fieldName] = action.fieldValue;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_ACTIVISTS_SEARCH_FIELDS:			
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.searchFields = { ...newState.activistsScreen.searchFields };
			newState.activistsScreen.searchFields.areaId = null;
			newState.activistsScreen.searchFields.areaName = '';
			newState.activistsScreen.searchFields.subAreaId = null;
			newState.activistsScreen.searchFields.subAreaName = '';
			newState.activistsScreen.searchFields.cityId = null;
			newState.activistsScreen.searchFields.cityName = '';
			newState.activistsScreen.searchFields.street = { id: null, name: '', key: '' };

			newState.activistsScreen.searchFields.personal_identity = '';
			newState.activistsScreen.searchFields.first_name = '';
			newState.activistsScreen.searchFields.last_name = '';
			newState.activistsScreen.searchFields.phone_number = '';


			newState.activistsScreen.searchFields.assignmentStatus = -1;
			newState.activistsScreen.searchFields.assignmentStatusName = 'הכל';

			newState.activistsScreen.searchFields.verifyStatus = -1;
			newState.activistsScreen.searchFields.verifyStatusName = 'הכל';

			newState.activistsScreen.searchFields.verifyBankStatus = [-1];
			newState.activistsScreen.searchFields.verifyBankStatusName = 'הכל';

			newState.activistsScreen.searchFields.electionRoleId = [electionRolesAdditions.none];
			newState.activistsScreen.searchFields.electionRoleName = 'ללא תפקיד';

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOADING_REPORT_RESULTS_STATUS_CHANGED:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.isLoadingResults = action.isLoadingResults;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_CURRENT_USER_GEOGRAPHIC_FILTERS:
			
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.searchFields = { ...newState.activistsScreen.searchFields };
			newState.activistsScreen.searchFilteredCitiesHash = { ...newState.activistsScreen.searchFilteredCitiesHash };
			newState.activistsScreen.searchFilteredAreasHash = { ...newState.activistsScreen.searchFilteredAreasHash };

			newState.activistsScreen.userGeographicFilters = action.geographicFilters;

			for (let geoIndex = 0; geoIndex < action.geographicFilters.length; geoIndex++) {
				let geoAreaId = action.geographicFilters[geoIndex].area_id;
				let geoCityId = action.geographicFilters[geoIndex].city_id;
				let geoEntityType = action.geographicFilters[geoIndex].entity_type;

				if (newState.activistsScreen.searchFilteredAreasHash[geoAreaId] == null ||
					newState.activistsScreen.searchFilteredAreasHash[geoAreaId] == undefined) {
					newState.activistsScreen.searchFilteredAreasHash[geoAreaId] = {
						id: geoAreaId,
						name: action.geographicFilters[geoIndex].area_name,
						city_id: geoCityId,
						city_name: action.geographicFilters[geoIndex].city_name,
						sub_area_id: action.geographicFilters[geoIndex].sub_area_id,
						sub_area_name: action.geographicFilters[geoIndex].sub_area_name,
						area_id: action.geographicFilters[geoIndex].area_id,
						area_name: action.geographicFilters[geoIndex].area_name,
						entity_type: geoEntityType
					};
				} else if (geoEntityType != geographicEntityTypes.area) {
					newState.activistsScreen.searchFilteredAreasHash[geoAreaId] = { ...newState.activistsScreen.searchFilteredAreasHash[geoAreaId] };
					newState.activistsScreen.searchFilteredAreasHash[geoAreaId].entity_type = geoEntityType;
				}

				if (geoCityId != null) {
					newState.activistsScreen.searchFilteredCitiesHash[geoCityId] = { ...newState.activistsScreen.searchFilteredCitiesHash[geoCityId] };
					newState.activistsScreen.searchFilteredCitiesHash[geoCityId] = {
						id: geoCityId,
						name: action.geographicFilters[geoIndex].city_name,
						city_id: geoCityId,
						city_name: action.geographicFilters[geoIndex].city_name,
						sub_area_id: action.geographicFilters[geoIndex].sub_area_id,
						sub_area_name: action.geographicFilters[geoIndex].sub_area_name,
						area_id: action.geographicFilters[geoIndex].area_id,
						area_name: action.geographicFilters[geoIndex].area_name,
						entity_type: geoEntityType
					};
				}
			}

			newState.activistsScreen.searchFields.assignmentStatus = -1;
			newState.activistsScreen.searchFields.assignmentStatusName = 'הכל';

			newState.activistsScreen.searchFields.verifyStatus = -1;
			newState.activistsScreen.searchFields.verifyStatusName = 'הכל';

			newState.activistsScreen.searchFields.verifyBankStatus = [-1];
			newState.activistsScreen.searchFields.verifyBankStatusName = 'הכל';

			newState.activistsScreen.searchFields.electionRoleId = [electionRolesAdditions.none];
			newState.activistsScreen.searchFields.electionRoleName = 'ללא תפקיד';

			newState.activistsScreen.loadedActivistsData = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_ACTIVISTS_SEARCH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.activistsSearchResult = [];
			newState.activistsScreen.selectedActivistsRoleId = null;

			newState.activistsScreen.totalSearchResults = 0;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_ACTIVISTS_SEARCH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistsSearchResult = action.activists;
			newState.activistsScreen.totalSearchResults = action.totalRecords;

			return newState;
			break;
			case ElectionsActions.ActionTypes.ACTIVIST.RESET_NEIGHBORHOODS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			
			newState.activistsScreen.neighborhoods = [];
			
			return newState;
			break;
			
			case ElectionsActions.ActionTypes.ACTIVIST.LOAD_NEIGHBORHOODS:  
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			
			newState.activistsScreen.neighborhoods = action.neighborhoods;
			
			return newState;
			break;
			
			
			case ElectionsActions.ActionTypes.ACTIVIST.DRIVER.RESET_CLUSTERS: 
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.driver = { ...newState.activistsScreen.driver };
			newState.activistsScreen.driver.combos = { ...newState.activistsScreen.driver.combos };
			
			newState.activistsScreen.driver.combos.clusters = [];
			
			return newState;
			break;
			
			case ElectionsActions.ActionTypes.ACTIVIST.DRIVER.LOAD_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.driver = { ...newState.activistsScreen.driver };
			newState.activistsScreen.driver.combos = { ...newState.activistsScreen.driver.combos };
			
			newState.activistsScreen.driver.combos.clusters = action.clusters;
			
			return newState;
			break;
			
			case ElectionsActions.ActionTypes.ACTIVIST.DRIVER.RESET_NEIGHBORHOODS: 
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.driver = { ...newState.activistsScreen.driver };
			newState.activistsScreen.driver.combos = { ...newState.activistsScreen.driver.combos };
			
			newState.activistsScreen.driver.combos.neighborhoods = [];
			
			return newState;
			break;
			
			case ElectionsActions.ActionTypes.ACTIVIST.DRIVER.LOAD_NEIGHBORHOODS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.driver = { ...newState.activistsScreen.driver };
			newState.activistsScreen.driver.combos = { ...newState.activistsScreen.driver.combos };
			
			newState.activistsScreen.driver.combos.neighborhoods = action.neighborhoods;
			
			return newState;
			break;
			
		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_MORE_ACTIVISTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistsSearchResult = [...newState.activistsScreen.activistsSearchResult];

			for (activistIndex = 0; activistIndex < action.activists.length; activistIndex++) {
				newState.activistsScreen.activistsSearchResult.push(action.activists[activistIndex]);
			}

			return newState;
			break;

		//update election role by voter sum in election roles by voter results
		//TODO:remove after finish arrange
		// case ElectionsActions.ActionTypes.ACTIVIST.UPDATE_ACTIVIST_SUM:
		// 	var newState = { ...state };
		// 	newState.activistsScreen = { ...newState.activistsScreen };
			
		// 	let activistsResult = [...newState.activistsScreen.activistsSearchResult];
		// 	let foundElectionRole = false;
		// 	for (activistIndex = 0; activistIndex < activistsResult.length; activistIndex++) {
		// 		let currentActivist = activistsResult[activistIndex];
		// 		for (roleIndex = 0; roleIndex < currentActivist.election_roles_by_voter.length; roleIndex++) {
		// 			if (currentActivist.election_roles_by_voter[roleIndex].key == action.electionRoleKey) {
		// 				currentActivist = {...currentActivist};
		// 				currentActivist.election_roles_by_voter = [...currentActivist.election_roles_by_voter];
		// 				currentActivist.election_roles_by_voter[roleIndex] = {...currentActivist.election_roles_by_voter[roleIndex]};
		// 				if(!action.electionRoleGeoKey){
		// 					currentActivist.election_roles_by_voter[roleIndex].sum = action.sum;
		// 				} else { // Update specific geo item sum:
		// 					let election_roles_geographical = [...currentActivist.election_roles_by_voter[roleIndex].activists_allocations_assignments];

		// 					election_roles_geographical.forEach((geoItem, i) => {
		// 						if(geoItem.key == action.electionRoleGeoKey){
		// 							election_roles_geographical[i].sum = action.sum;
		// 						}
		// 					})
		// 					currentActivist.election_roles_by_voter[roleIndex].activists_allocations_assignments = election_roles_geographical;
		// 				}

		// 				activistsResult[activistIndex] = currentActivist;
		// 				foundElectionRole = true;
		// 				break;
		// 			}
		// 		}
		// 		if (foundElectionRole) break;
		// 	}

		// 	newState.activistsScreen.activistsSearchResult = activistsResult;
		// 	return newState;
		// case ElectionsActions.ActionTypes.ACTIVIST.UPDATE_ACTIVIST_GEO_SUM:
		// 	var newState = { ...state };
		// 	newState.activistsScreen = { ...newState.activistsScreen };
		// 	newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
		// 	newState.activistsScreen.activistDetails.election_roles_by_voter = [ ...newState.activistsScreen.activistDetails.election_roles_by_voter ];
		// 	newState.activistsScreen.activistDetails.election_roles_by_voter.forEach((roleItem, roleIndex) => {

		// 		if(roleItem.key == action.electionRoleKey){
		// 			roleItem.election_roles_geographical.forEach((roleGeoItem, roleGeoIndex) => {
		// 				if(roleGeoItem.key == action.electionRoleGeoKey){
		// 					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[roleGeoIndex].sum = action.sum;
		// 				}
		// 			})
		// 		}
		// 	})

		
			case ElectionsActions.ActionTypes.ACTIVIST.UPDATE_FIELD_ACTIVIST_IN_SEARCH_LIST:
			let voterId=action.voterId;
			let assignmentDetails=action.activistPaymentItem;
			let fieldsUpdated=action.fieldsUpdated;
					var newState = { ...state };
					newState.activistsScreen = { ...newState.activistsScreen };
					var listac = [...newState.activistsScreen.activistsSearchResult];
					
					var indexActivist=listac.findIndex(activist=>activist.id==voterId);
					if(indexActivist!=-1){
						let currentActivist={...(listac[indexActivist])};
						console.log(currentActivist);
						let indexRoleActivist=currentActivist.election_roles_by_voter.findIndex(roleActivist=>roleActivist.id==assignmentDetails.election_role_by_voter_id);						

						if(indexRoleActivist!=-1){
							let roleActivist={...currentActivist.election_roles_by_voter[indexRoleActivist]}
							let activsitRolePayments=[...roleActivist.activist_roles_payments];
							activsitRolePayments.forEach(activistRolePayment => {
								for (const [field, value] of Object.entries(fieldsUpdated)) {
									activistRolePayment[field]=value;
								  }
							});
							roleActivist.activist_roles_payments=activsitRolePayments;
							currentActivist.election_roles_by_voter[indexRoleActivist]=roleActivist;
						}

						listac[indexActivist]=currentActivist;
					}

					newState.activistsScreen.activistsSearchResult = listac;

			return newState;
			
				case ElectionsActions.ActionTypes.ACTIVIST.UPDATE_ACTIVIST_ROLE_PAYMENTS_FIELD:
			
					var newState = { ...state };
					newState.activistsScreen = { ...newState.activistsScreen };
					var allActivist = [...newState.activistsScreen.activistsSearchResult];
					for (let index = 0; index < allActivist.length; index++) {
						let activist = {...allActivist[index]};
						for (let index2 = 0; index2 < activist.election_roles_by_voter.length; index2++) {
							let curentRole={...activist.election_roles_by_voter[index2]};
							if(curentRole.id==action.activistPaymentItem.election_role_by_voter_id)
							{

								curentRole.activist_roles_payments.forEach((payment,i) =>{
									let paymentRole={...payment}
									if(paymentRole.activist_roles_payments_id==action.activistPaymentItem.activist_roles_payments_id)
									{
										
										paymentRole[action.nameFields]=action.valueField;
										curentRole.activist_roles_payments[i]=paymentRole;
									}
								});
								curentRole.activist_roles_payments=[...curentRole.activist_roles_payments];
								activist.election_roles_by_voter[index2]=curentRole;
							}	
							
						}
					}
					newState.activistsScreen.activistsSearchResult = allActivist;
					return newState;
		
				
		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_ELECTION_ROLES:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.electionRoles = action.electionRoles;

			return newState;
			case ElectionsActions.ActionTypes.ACTIVIST.LOAD_ELECTION_CAMPAIGNS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.electionCampaigns = action.data;

			return newState;		
			
		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_ELECTION_ROLES_BUDGET:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.electionRolesBudget = action.electionRolesBudget || [];

			return newState;
		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_CITY_ELECTION_ROLES_BUDGET:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.electionRolesCityBudget = action.electionRolesCityBudget || [];

			return newState;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_ELECTION_ROLES_SHIFTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.electionRolesShifts = action.electionRolesShifts;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.SHOW_ADD_ALLOCATION_MODAL:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.addAllocationModal = { ...newState.activistsScreen.addAllocationModal };

			newState.activistsScreen.showAddAllocationModal = true;

			return newState;
		case ElectionsActions.ActionTypes.ACTIVIST.MODAL_UPDATE_ALLOCATION.LOADED_AVAILABLE_CLUSTERS_ALLOCATIONS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.addAllocationModalAvailableClusters = action.data;

			return newState;
		case ElectionsActions.ActionTypes.ACTIVIST.MODAL_UPDATE_ALLOCATION.LOADED_AVAILABLE_BALLOTS_ALLOCATIONS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.addAllocationModalAvailableBallots = action.data;

			return newState;

		case ElectionsActions.ActionTypes.ACTIVIST.HIDE_ADD_ALLOCATION_MODAL:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.showAddAllocationModal = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_ADDED_ALLOCATION_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.addedAllocationFlag = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.EDIT_ACTIVIST_ROLE_DETAILS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			let election_roles_by_voter1 = [...newState.activistsScreen.activistDetails.election_roles_by_voter];
			let currentElectionRole = { ...election_roles_by_voter1[action.roleIndex] };

			currentElectionRole.comment = action.editStateObj.comment;
			currentElectionRole.sum = action.editStateObj.sum;
			currentElectionRole.bonus = action.editStateObj.bonus;
			currentElectionRole.phone_number = action.editStateObj.phone_number;
			currentElectionRole.assigned_city_id = action.editStateObj.assigned_city_id;
			currentElectionRole.assigned_city_name = action.editStateObj.assigned_city_name;
			currentElectionRole.bank_number = action.editStateObj.bank_number;
			currentElectionRole.bank_branch_number = action.editStateObj.bank_branch_number;
			currentElectionRole.bank_branch_name = action.editStateObj.bank_branch_name;
			currentElectionRole.bank_account_number = action.editStateObj.bank_account_number;
			currentElectionRole.bank_owner_name = action.editStateObj.bank_owner_name;
			currentElectionRole.is_activist_bank_owner = action.editStateObj.is_activist_bank_owner;

			if (action.currentTabRoleSystemName == electionRolesSystemNames.driver) {
				currentElectionRole.transportation_car_type = action.editStateObj.transportation_car_type;
				currentElectionRole.transportation_car_number = action.editStateObj.transportation_car_number;
				currentElectionRole.passenger_count = action.editStateObj.passenger_count;
			}
			election_roles_by_voter1[action.roleIndex] = currentElectionRole;
			newState.activistsScreen.activistDetails.election_roles_by_voter = election_roles_by_voter1;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_CITY_CLUSTERS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_CITY_NEIGHBORHOODS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.neighborhoods = action.neighborhoods;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.EDIT_ACTIVIST_PHONES:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };

			newState.activistsScreen.activistDetails.voter_phones = action.voterPhones;

			newState.activistsScreen.activistDetails.email = action.email;

			return newState;
			break;
		case ElectionsActions.ActionTypes.ACTIVIST.EDIT_BANK_VERIFY_DOCUMENT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };

			let election_roles_by_voter4 = [...newState.activistsScreen.activistDetails.election_roles_by_voter ];
			election_roles_by_voter4.forEach((item, index) => {
				if(item.key == action.electionRoleByVoterKey){
					election_roles_by_voter4[index].verify_bank_document_key = action.verify_bank_document_key; 
				}
			})
			newState.activistsScreen.activistDetails.election_roles_by_voter = election_roles_by_voter4;
			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_SAVED_ROLE_DETAILS_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.savedRoleDetails = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_ACTIVIST_DETAILS_AND_ROLES:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };

			newState.activistsScreen.activistDetails = action.activistDetails;

			newState.activistsScreen.loadedActivist = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_LOADED_ACTIVIST:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.loadedActivist = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.DELETE_ACTIVIST_ROLE:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			let election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			roleIndex = election_roles_by_voter.findIndex(roleItem => roleItem.key == action.electionRoleByVoterKey);
			election_roles_by_voter.splice(roleIndex, 1);
			newState.activistsScreen.activistDetails.election_roles_by_voter = election_roles_by_voter;
			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.clusterLeader = { ...newState.activistsScreen.clusterLeader };
			newState.activistsScreen.clusterLeader.combos = { ...newState.activistsScreen.clusterLeader.combos };

			newState.activistsScreen.clusterLeader.combos.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.LOAD_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.clusterLeader = { ...newState.activistsScreen.clusterLeader };
			newState.activistsScreen.clusterLeader.combos = { ...newState.activistsScreen.clusterLeader.combos };

			newState.activistsScreen.clusterLeader.combos.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.RESET_NEIGHBORHOODS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.clusterLeader = { ...newState.activistsScreen.clusterLeader };
			newState.activistsScreen.clusterLeader.combos = { ...newState.activistsScreen.clusterLeader.combos };

			newState.activistsScreen.clusterLeader.combos.neighborhoods = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CLUSTER_LEADER.LOAD_NEIGHBORHOODS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.clusterLeader = { ...newState.activistsScreen.clusterLeader };
			newState.activistsScreen.clusterLeader.combos = { ...newState.activistsScreen.clusterLeader.combos };

			newState.activistsScreen.clusterLeader.combos.neighborhoods = action.neighborhoods;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_NEIGHBORHOODS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.neighborhoods = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_NEIGHBORHOODS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.neighborhoods = action.neighborhoods;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_STREETS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.streets = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_STREETS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.streets = action.streets;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.RESET_BALLOTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.ballots = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HOUSEHOLD.LOAD_BALLOTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.household = { ...newState.activistsScreen.household };
			newState.activistsScreen.household.combos = { ...newState.activistsScreen.household.combos };

			newState.activistsScreen.household.combos.ballots = action.ballots;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_STREETS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.streets = action.streets;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_STREETS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.streets = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_CLUSTERS_SERACH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.clustersSearchFields = { ...newState.activistsScreen.clustersSearchFields };

			newState.activistsScreen.clustersSearchFields.area_id = action.clustersSearchFields.area_id;
			newState.activistsScreen.clustersSearchFields.sub_area_id = action.clustersSearchFields.sub_area_id;
			newState.activistsScreen.clustersSearchFields.city_id = action.clustersSearchFields.city_id;
			newState.activistsScreen.clustersSearchFields.neighborhood_id = action.clustersSearchFields.neighborhood_id;
			newState.activistsScreen.clustersSearchFields.cluster_id = action.clustersSearchFields.cluster_id;
			newState.activistsScreen.clustersSearchFields.assignment_status = action.clustersSearchFields.assignment_status;

			newState.activistsScreen.totalClustersSearchResult = action.totalClusters;
			newState.activistsScreen.clustersSearchResult = action.clustersSearchResult;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_CLUSTER_SEARCH:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.clustersSearchFields = { ...newState.activistsScreen.clustersSearchFields };

			newState.activistsScreen.clustersSearchResult = [];
			newState.activistsScreen.totalClustersSearchResult = 0;
			newState.activistsScreen.clustersSearchFields = {...initialState.activistsScreen.clustersSearchFields};

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADING_CLUSTERS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadingClustersFlag = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADED_CLUSTERS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadedClustersFlag = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.MAKE_ACTIVIST_A_CLUSTER_LEADER:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == electionRolesSystemNames.clusterLeader);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];
				
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.push(
					{	
						id:action.clusterDetails.id,//assignment id
						cluster_id: action.clusterDetails.cluster_id,
						cluster_key: action.clusterDetails.cluster_key,
						cluster_name: action.clusterDetails.cluster_name,
						street: action.clusterDetails.street,
						city_name: action.clusterDetails.city_name,
						countBallotBox: action.clusterDetails.countBallotBox,
						cluster_mi_id:action.clusterDetails.cluster_mi_id,
						election_role_by_voter_id:action.clusterDetails.election_role_by_voter_id
					}
				);
			}

			newState.activistsScreen.editRoleFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_CLUSTERS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CITY_NEIGHBORHOODS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.neighborhoods = [];

			return newState;
			break;

		case AllocationAndAssignmentActions.ActionTypes.DELETE_CLUSTER_ASSIGNMENT:
			
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			let activistDetails = newState.activistsScreen.activistDetails;
			
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.id == action.electionRoleByVoterId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

				clusterIndex = activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(clusterItem => clusterItem.cluster_id == action.clusterId);
				if (clusterIndex > -1) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.splice(clusterIndex, 1);
				}
			}

			newState.activistsScreen.editRoleFlag = true;
			

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.ADD_GEO_CLUSTER_TO_ACTIVIST_ROLE:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.push(
					{
						id: action.geoDetails.id,
						key: action.geoDetails.key,
						election_role_by_voter_id: action.geoDetails.election_role_by_voter_id,
						cluster_id: action.geoDetails.cluster_id,
						cluster_name: action.geoDetails.cluster_name,
						cluster_key: action.geoDetails.cluster_key,
						street: action.geoDetails.street,
						city_id: action.geoDetails.city_id,
						city_name: action.geoDetails.city_name,
                        countBallotBox: action.geoDetails.countBallotBox,
						cluster_mi_id:action.geoDetails.cluster_mi_id,
						election_role_by_voter_id:action.geoDetails.election_role_by_voter_id
					}
					
				);
			}

			newState.activistsScreen.editRoleFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.DELETE_ACTIVIST_ROLE_GEO:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

				geoIndex = activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.id == action.electionRoleByVoterGeographicAreasId);
				if (geoIndex > -1) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.splice(geoIndex, 1);
				}
			}

			newState.activistsScreen.editRoleFlag = true;
			newState.activistsScreen.editBallotFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADED_DRIVERS_CLUSTERS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadedDriverClustersFlag = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADING_DRIVERS_CLUSTERS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadingDriverClustersFlag = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_DRIVERS_CLUSTERS_SERACH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.driverClustersSearchFields = { ...newState.activistsScreen.driverClustersSearchFields };

			newState.activistsScreen.driverClustersSearchFields.area_id = action.clustersSearchFields.area_id;
			newState.activistsScreen.driverClustersSearchFields.sub_area_id = action.clustersSearchFields.sub_area_id;
			newState.activistsScreen.driverClustersSearchFields.city_id = action.clustersSearchFields.city_id;
			newState.activistsScreen.driverClustersSearchFields.cluster_id = action.clustersSearchFields.cluster_id;
			newState.activistsScreen.driverClustersSearchFields.assignment_status = action.clustersSearchFields.assignment_status;

			newState.activistsScreen.totalDriverClustersSearchResult = action.totalClusters;
			newState.activistsScreen.driversClustersSearchResult = action.clustersSearchResult;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_CLUSTER_BALLOTS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.ballots = action.ballots;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_DRIVERS_CLUSTER_SEARCH:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.driverClustersSearchFields = { ...newState.activistsScreen.driverClustersSearchFields };

			newState.activistsScreen.driversClustersSearchResult = [];
			newState.activistsScreen.totalDriverClustersSearchResult = 0;
			newState.activistsScreen.driverClustersSearchFields = {...initialState.activistsScreen.driverClustersSearchFields};

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_CLUSTER_BALLOTS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.ballots = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_ROLE_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.editRoleFlag = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_SUPPORT_STATUSES:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };

			newState.ballotsScreen.combos.supportStatuses = action.supportStatuses;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_DRIVER_CLUSTER_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.editDriverClusterFlag = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.ADD_CLUSTERS_TO_DRIVER:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
            if (roleIndex > -1) {
                newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
                newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

                for (geoIndex = 0; geoIndex < action.geoClusters.length; geoIndex++) {
                    newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.push(
                        {
                            id: action.geoClusters[geoIndex].id,
                            election_role_by_voter_id: action.geoClusters[geoIndex].election_role_by_voter_id,

                            cluster_id: action.geoClusters[geoIndex].cluster_id,
							cluster_mi_id: action.geoClusters[geoIndex].cluster_mi_id,
                            cluster_name: action.geoClusters[geoIndex].cluster_name,
                            cluster_key: action.geoClusters[geoIndex].cluster_key,
                            street: action.geoClusters[geoIndex].street,
                            city_id: action.geoClusters[geoIndex].city_id,
                            city_name: action.geoClusters[geoIndex].city_name,
                            countBallotBox: action.geoClusters[geoIndex].countBallotBox
                        }
                    );
                }
            }

            newState.activistsScreen.editDriverClusterFlag = true;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.DELETE_DRIVER_CLUSTER:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

				geoIndex = activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.key == action.electionRoleByVoterGeographicAreasKey);
				if (geoIndex > -1) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.splice(geoIndex, 1);
				}
			}

			newState.activistsScreen.editDriverClusterFlag = true;

			return newState;
			break;

        case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADING_BALLOTS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };
            newState.activistsScreen.ballotsSearchResult = { ...newState.activistsScreen.ballotsSearchResult };

			let electionRoleSystemName1 = '';
			switch(action.electionRoleSystemName1){
				case  electionRolesSystemNames.ballotMember :
						electionRoleSystemName1 = 'BallotMember';
						break;
				case  electionRolesSystemNames.observer :
						electionRoleSystemName1 = 'Observer';
						break;
				case  electionRolesSystemNames.counter :
						electionRoleSystemName1 = 'Counter';
						break;
			}
			newState.activistsScreen.ballotsSearchResult['loading' + electionRoleSystemName1 + 'Ballots'] = action.loadedBallots;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.SHOW_DELETE_DRIVER_CLUSTER_ERROR_MODAL:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.showDeleteDriverClusterErrorModal = true;

			activistDetails = newState.activistsScreen.activistDetails;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
			if (roleIndex > -1) {
				geoIndex = activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.key == action.electionRoleByVoterGeographicAreasKey);
				if (geoIndex > -1) {
					newState.activistsScreen.deleteDriverClusterErrorModalTitle = 'מחיקת שיבוץ לאשכול: ';
					newState.activistsScreen.deleteDriverClusterErrorModalTitle += activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].cluster_name;
				}
			}

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HIDE_DELETE_DRIVER_CLUSTER_ERROR_MODAL:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.showDeleteDriverClusterErrorModal = false;
			newState.activistsScreen.deleteDriverClusterErrorModalTitle = '';

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADED_BALLOTS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.ballotsSearchResult = { ...newState.activistsScreen.ballotsSearchResult };
			
			let electionRoleSystemName2 = '';
			switch(action.electionRoleSystemName){
				case  electionRolesSystemNames.ballotMember :
						electionRoleSystemName2 = 'BallotMember';
						break;
				case  electionRolesSystemNames.observer :
						electionRoleSystemName2 = 'Observer';
						break;
				case  electionRolesSystemNames.counter :
						electionRoleSystemName2 = 'Counter';
						break;
			}
			newState.activistsScreen.ballotsSearchResult['loaded' + electionRoleSystemName2 + 'Ballots'] = action.loadedBallots;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ACTIVIST.LOAD_BALLOTS_SERACH_RESULT:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };
            newState.activistsScreen.ballotsSearchResult = { ...newState.activistsScreen.ballotsSearchResult };
            newState.activistsScreen.balotSearchFields = { ...newState.activistsScreen.balotSearchFields };

			let electionRoleSystemName3 = (action.electionRoleSystemName == electionRolesSystemNames.ballotMember) ? 'ballotMember' : action.electionRoleSystemName;
			newState.activistsScreen.balotSearchFields[electionRoleSystemName3] = { ...newState.activistsScreen.ballotsSearchResult[electionRoleSystemName3] };
				
			newState.activistsScreen.ballotsSearchResult[electionRoleSystemName3] = action.ballots;
			newState.activistsScreen.ballotsSearchResult[electionRoleSystemName3 + 'TotalBallots'] = action.totalBallots;

			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].area_id = action.ballotsSearchFields.area_id;
			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].sub_area_id = action.ballotsSearchFields.sub_area_id;
			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].city_id = action.ballotsSearchFields.city_id;
			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].neighborhood_id = action.ballotsSearchFields.neighborhood_id;
			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].cluster_id = action.ballotsSearchFields.cluster_id;
			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].ballot_id = action.ballotsSearchFields.ballot_id;

			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].ballot_role_id = action.ballotsSearchFields.ballot_role_id;

			newState.activistsScreen.balotSearchFields[electionRoleSystemName3].assignment_status = action.ballotsSearchFields.assignment_status;

            return newState;
            break;

		case AllocationAndAssignmentActions.ActionTypes.CHANGE_EDIT_BALLOT_BOX_ROLE_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.editedBalotBoxRoleFlag = action.flag;

            return newState;
            break;

		case AllocationAndAssignmentActions.ActionTypes.ADD_BALLOT_BOX_ROLE_TO_BALLOT_BOX:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };
            newState.activistsScreen.ballotsSearchResult = { ...newState.activistsScreen.ballotsSearchResult };
            newState.activistsScreen.ballotsSearchResult.ballotMember = [...newState.activistsScreen.ballotsSearchResult.ballotMember];
            newState.activistsScreen.activistDetails = {...newState.activistsScreen.activistDetails};
            newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

            let ballotIndex = newState.activistsScreen.ballotsSearchResult.ballotMember.findIndex(ballotItem => ballotItem.key == action.ballotBoxKey);

            if ( ballotIndex > -1 ) {
                newState.activistsScreen.ballotsSearchResult.ballotMember[ballotIndex] = {...newState.activistsScreen.ballotsSearchResult.ballotMember[ballotIndex]};

                newState.activistsScreen.ballotsSearchResult.ballotMember[ballotIndex].ballot_box_role_id = action.balloBoxtRole.id;
                newState.activistsScreen.ballotsSearchResult.ballotMember[ballotIndex].ballot_box_role_name = action.balloBoxtRole.name;
			}

            ballotIndex = newState.activistsScreen.activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == electionRolesSystemNames.ballotMember);
            if ( ballotIndex > -1 ) {
                newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex] = {...newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex]};
                newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments];

                let geoIndex = newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.ballot_box_key == action.ballotBoxKey);
                if ( geoIndex > -1 ) {
                    newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments[geoIndex] = {...newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments[geoIndex]};

                    newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments[geoIndex].ballot_box_role_id = action.balloBoxtRole.id;
                    newState.activistsScreen.activistDetails.election_roles_by_voter[ballotIndex].activists_allocations_assignments[geoIndex].ballot_box_role_name = action.balloBoxtRole.name;
				}
			}

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOT_SEARCH:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.ballotsSearchResult = { ...newState.activistsScreen.ballotsSearchResult };
			newState.activistsScreen.balotSearchFields = { ...newState.activistsScreen.balotSearchFields };

			let electionRoleSystemName4 = (action.electionRoleSystemName == electionRolesSystemNames.ballotMember) ? 'ballotMember' : action.electionRoleSystemName;

			newState.activistsScreen.ballotsSearchResult[ electionRoleSystemName4 ] = [];
			newState.activistsScreen.ballotsSearchResult[ electionRoleSystemName4 + 'TotalBallots'] = 0;

			newState.activistsScreen.balotSearchFields[electionRoleSystemName4] = {...initialState.activistsScreen.balotSearchFields[electionRoleSystemName4]};

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_MORE_BALLOTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.ballotsSearchResult = { ...newState.activistsScreen.ballotsSearchResult };

			let electionRoleSystemName5 = (action.electionRoleSystemName == electionRolesSystemNames.ballotMember) ? 'ballotMember' : action.electionRoleSystemName;


			newState.activistsScreen.ballotsSearchResult[electionRoleSystemName5] = [...newState.activistsScreen.ballotsSearchResult[electionRoleSystemName5]];

			for (ballotIndex = 0; ballotIndex < action.ballots.length; ballotIndex++) {
				newState.activistsScreen.ballotsSearchResult[electionRoleSystemName5].push(action.ballots[ballotIndex]);
			}


			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_ROLE_BALLOT_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.editBallotFlag = false;

			return newState;
			break;


        case ElectionsActions.ActionTypes.ACTIVIST.ADD_GEO_BALLOT_TO_ACTIVIST_ROLE:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };
            newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
            newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

            activistDetails = newState.activistsScreen.activistDetails;

            roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
            if (roleIndex > -1) {
                newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
                newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

                newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.push(
					action.assignmentDetails
                );
            }

            newState.activistsScreen.editBallotFlag = true;

            return newState;
            break;


		case ElectionsActions.ActionTypes.ACTIVIST.SHOW_CONFIRM_DELETE_MODAL:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.confirmDeleteModal = { ...newState.activistsScreen.confirmDeleteModal };

			newState.activistsScreen.confirmDeleteModal.show = true;
			newState.activistsScreen.confirmDeleteModal.title = action.modalTitle;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.HIDE_CONFIRM_DELETE_MODAL:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.confirmDeleteModal = { ...newState.activistsScreen.confirmDeleteModal };

			newState.activistsScreen.confirmDeleteModal.show = false;
			newState.activistsScreen.confirmDeleteModal.title = '';

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_BALLOT_ROLES:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.ballotRoles = action.ballotRoles;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_BALLOTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.ballots = action.ballots;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_BALLOTS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.ballots = [];

			return newState;
			break;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.push(
					{
						id: action.geoDetails.id,
						key: action.geoDetails.key,
						election_role_by_voter_id: action.geoDetails.election_role_by_voter_id,
						entity_type: action.geoDetails.entity_type,
						entity_id: action.geoDetails.entity_id,

						election_role_shift_id: action.geoDetails.election_role_shift_id,
						election_role_shift_name: action.geoDetails.election_role_shift_name,
						election_role_shift_key: action.geoDetails.election_role_shift_key,
						election_role_shift_system_name: action.geoDetails.election_role_shift_system_name,

						cluster_name: action.geoDetails.cluster_name,
						street: action.geoDetails.street,
						city_id: action.geoDetails.city_id,
						city_name: action.geoDetails.city_name,

						ballot_box_id: action.geoDetails.ballot_box_id,
						ballot_box_key: action.geoDetails.ballot_box_key,
						mi_id: action.geoDetails.mi_id,
						special_access: action.geoDetails.special_access,

						ballot_box_role_id: action.geoDetails.ballot_box_role_id,
						ballot_box_role_name: action.geoDetails.ballot_box_role_name,

						other_geo_id: action.geoDetails.other_geo_id,
						other_geo_key: action.geoDetails.other_geo_key,

						other_activist_role_id: action.geoDetails.other_activist_role_id,
						other_activist_role_key: action.geoDetails.other_activist_role_key,
						other_activist_role_system_name: action.geoDetails.other_activist_role_system_name,

						other_activist_shift_id: action.geoDetails.other_activist_shift_id,
						other_activist_shift_key: action.geoDetails.other_activist_shift_key,
						other_activist_shift_name: action.geoDetails.other_activist_shift_name,

						other_activist_phone_number: action.geoDetails.other_activist_phone_number,
						other_activist_verified_status: action.geoDetails.other_activist_verified_status,

						other_activist_first_name: action.geoDetails.other_activist_first_name,
						other_activist_last_name: action.geoDetails.other_activist_last_name,
						other_activist_personal_identity: action.geoDetails.other_activist_personal_identity
					}
				);
			}

			newState.activistsScreen.editBallotFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.EDIT_ACTIVIST_SHIFT_IN_BALLOT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;

			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.election_role_id == action.electionRoleId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments];

				geoIndex = activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments.findIndex(geoItem => geoItem.key == action.electionRoleByVoterGeographicAreasKey);
				if (geoIndex > -1) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex] };

					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_geo_id = action.geoDetails.other_geo_id;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_geo_key = action.geoDetails.other_geo_key;

					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_role_id = action.geoDetails.other_activist_role_id;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_role_key = action.geoDetails.other_activist_role_key;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_role_system_name = action.geoDetails.other_activist_role_system_name;

					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_shift_id = action.geoDetails.other_activist_shift_id;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_shift_key = action.geoDetails.other_activist_shift_key;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_shift_name = action.geoDetails.other_activist_shift_name;

					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_phone_number = action.geoDetails.other_activist_phone_number;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_verified_status = action.geoDetails.other_activist_verified_status;

					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_first_name = action.geoDetails.other_activist_first_name;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_last_name = action.geoDetails.other_activist_last_name;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].other_activist_personal_identity = action.geoDetails.other_activist_personal_identity;

					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].election_role_shift_id = action.geoDetails.election_role_shift_id;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].election_role_shift_name = action.geoDetails.election_role_shift_name;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].election_role_shift_key = action.geoDetails.election_role_shift_key;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].activists_allocations_assignments[geoIndex].election_role_shift_system_name = action.geoDetails.election_role_shift_system_name;
				}
			}

			newState.activistsScreen.editBallotFlag = true;

			return newState;
			break;
		case ElectionsActions.ActionTypes.ACTIVIST.EDIT_DETAILS_ACTIVIST_SHIFT_IN_BALLOT:	
		var newState = { ...state };
		let currentRole={};
		let roleIndex=-1;
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];
			if(action.roleIndex!=undefined && action.roleIndex!=null){
				roleIndex=action.roleIndex;
				currentRole = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[action.roleIndex] };
			}
			else{
			roleIndex=newState.activistsScreen.activistDetails.election_roles_by_voter.findIndex(a=>a.id==action.role_voter_id)
			currentRole={...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex]};
			}
			let assignemtList= currentRole.activists_allocations_assignments;
			currentRole.activists_allocations_assignments = [...assignemtList];
			currentRole.activists_allocations_assignments.forEach(function (assignment, index) {
				if (assignment.id == action.assignmentId) {
					assignment = { ...currentRole.activists_allocations_assignments[index]}
					for (const [field, value] of Object.entries(action.editObj)) {
						assignment[field]=value;
					  }

					currentRole.activists_allocations_assignments[index] = assignment;
				}
			});
			newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] =currentRole
			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_MINISTER50_SEARCH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.minister50SearchResult = action.captainsOf50;
			newState.activistsScreen.totalCaptains50SearchResult = action.totalCaptains50;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_MINISTER50_SEARCH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.minister50SearchResult = [];
			newState.activistsScreen.totalCaptains50SearchResult = 0;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_MINISTER50_SEARCH_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.searchCaptain50Arrays = { ...newState.activistsScreen.searchCaptain50Arrays };

			newState.activistsScreen.searchCaptain50Arrays.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_MINISTER50_SEARCH_CLUSTERS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.searchCaptain50Arrays = { ...newState.activistsScreen.searchCaptain50Arrays };

			newState.activistsScreen.searchCaptain50Arrays.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.CHANGE_LOADING_CAPTAIN50S_FLAG:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };
            newState.captain50Search.flags = { ...newState.captain50Search.flags };

            newState.captain50Search.flags.loadingCaptain50s = action.flag;

            return newState;
			break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.CHANGE_LOADED_CAPTAIN50S_FLAG:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };
            newState.captain50Search.flags = { ...newState.captain50Search.flags };

            newState.captain50Search.flags.loadedCaptain50s = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.LOAD_MINISTER50_SEARCH_RESULT:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };

            newState.captain50Search.minister50SearchResult = action.captainsOf50;
            newState.captain50Search.totalCaptains50SearchResult = action.totalCaptains50;

            return newState;
            break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.RESET_MINISTER50_SEARCH_RESULT:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };

            newState.captain50Search.minister50SearchResult = [];
            newState.captain50Search.totalCaptains50SearchResult = 0;

            return newState;
            break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.LOAD_MINISTER50_SEARCH_CLUSTERS:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };

            newState.captain50Search.clusters = action.clusters;

            return newState;
            break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.RESET_MINISTER50_SEARCH_CLUSTERS:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };

            newState.captain50Search.clusters = [];

            return newState;
            break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.RESET_CAPTAIN50_SEARCH_VARIABLES:
            var newState = { ...state };
            newState.captain50Search = { ...newState.captain50Search };

            newState.captain50Search = initialState.captain50Search;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOADING_HOUSEHOLD_SEARCH_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.loadingHouseholdsFlag = action.flag;

			return newState;
			break;

        case ElectionsActions.ActionTypes.CAPTAIN50_SEARCH.LOADING_HOUSEHOLD_SEARCH_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadingHouseholdsFlag = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADING_MORE_HOUSEHOLDS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadingMoreHouseholdsFlag = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADED_MORE_HOUSEHOLDS_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadedMoreHouseholdsFlag = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_LOADED_HOUSEHOLD_FLAG:
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };

            newState.activistsScreen.loadedHouseholdsFlag = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_HOUSEHOLD_SEARCH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.householdSearchFields = { ...newState.activistsScreen.householdSearchFields };

			newState.activistsScreen.householdsSearchResult = action.households;
			newState.activistsScreen.totalHouseholdsSearchResult = action.totalHouseholds;

			newState.activistsScreen.householdSearchFields.area_id = action.searchObj.area_id;
			newState.activistsScreen.householdSearchFields.city_id = action.searchObj.city_id;
			newState.activistsScreen.householdSearchFields.street_name = action.searchObj.street_name;
			newState.activistsScreen.householdSearchFields.neighborhood_id = action.searchObj.neighborhood_id;

			newState.activistsScreen.householdSearchFields.cluster_id = action.searchObj.cluster_id;
			newState.activistsScreen.householdSearchFields.ballot_id = action.searchObj.ballot_id;

			newState.activistsScreen.householdSearchFields.captain_id = action.searchObj.captain_id;

			newState.activistsScreen.householdSearchFields.last_name = action.searchObj.last_name;

			newState.activistsScreen.householdSearchFields.allocated_to_captain50 = action.searchObj.allocated_to_captain50;

			newState.activistsScreen.loadingHouseholdsFlag = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_HOUSEHOLD_SEARCH_RESULT:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.householdsSearchResult = [];
			newState.activistsScreen.totalHouseholdsSearchResult = 0;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.LOAD_MORE_HOUSEHOLDS:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.householdsSearchResult = [...newState.activistsScreen.householdsSearchResult];

			for (householdIndex = 0; householdIndex < action.households.length; householdIndex++) {
				if (action.households[householdIndex]) {
					newState.activistsScreen.householdsSearchResult.push(action.households[householdIndex]);
				}
			}

			newState.activistsScreen.loadingHouseholdsFlag = false;
			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.UPDATE_EDITING_CAPTAIN50_HOUSEHOLDS_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.editingCaptainHouseholdsFlag = action.editingCaptainHouseholdsFlag;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_CAPTAIN50_HOUSEHOLDS_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.editCaptainHouseholdsFlag = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.ADD_HOUSEHOLDS_TO_CAPTAIN_50:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == electionRolesSystemNames.ministerOfFifty);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households];

				for (householdIndex = 0; householdIndex < action.households.length; householdIndex++) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households.push(action.households[householdIndex]);
				}
			}

			newState.activistsScreen.editCaptainHouseholdsFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_CAPTAIN50_HOUSEHOLDS_FLAG:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };

			newState.activistsScreen.editCaptainHouseholdsFlag = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.ADD_HOUSEHOLDS_TO_CAPTAIN_50:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == electionRolesSystemNames.ministerOfFifty);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households];

				for (householdIndex = 0; householdIndex < action.households.length; householdIndex++) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households.push(action.households[householdIndex]);
				}
			}

			newState.activistsScreen.editCaptainHouseholdsFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.DELETE_HOUSEHOLDS_OF_CAPTAIN50:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == electionRolesSystemNames.ministerOfFifty);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households];

				let topIndex = newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households.length - 1;

				for (householdIndex = topIndex; householdIndex >= 0; householdIndex--) {
					let householdId = newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households[householdIndex].household_id;
					let householdKey = 'household_' + householdId;

					if (action.householdsdHash[householdKey] == 1) {
						newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].captain50_households.splice(householdIndex, 1);
					}
				}
			}

			newState.activistsScreen.editCaptainHouseholdsFlag = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.ADD_MESSAGE_TO_ACTIVIST:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.key == action.electionRoleByVoterKey);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].messages = [...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].messages];

				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].messages.push(
					{
						id: action.message.id,
						key: action.message.key,
						election_role_by_voter_id: action.message.election_role_by_voter_id,
						direction: action.message.direction,
						text: action.message.text,
						phone_number: action.message.phone_number,
						verified_status: action.message.verified_status,
						created_at: action.message.created_at
					}
				);
			}

			newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].verified_status = activistVerifyStatus.messageSent;

			newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_update_id = action.currentUser.id;
			newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_update_first_name = action.currentUser.first_name;
			newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_update_last_name = action.currentUser.last_name;
			newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].updated_at = action.updated_at;

			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_ACTIVIST_ALLOCATION_LOCK:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.id == action.electionRoleByVoterId);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };

				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_update_id = action.currentUser.id;
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_update_first_name = action.currentUser.first_name;
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_update_last_name = action.currentUser.last_name;
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].updated_at = action.updated_at;

				if (action.isLock && action.isLock!=0) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_lock_id = action.currentUser.id;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_lock_first_name = action.currentUser.first_name;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_lock_last_name = action.currentUser.last_name;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].lock_date = action.updated_at;
				} else {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_lock_id = null;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_lock_first_name = null;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].user_lock_last_name = null;
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].lock_date = null;
				}
			}

			return newState;
			break;
		case ElectionsActions.ActionTypes.ACTIVIST.CHANGE_ACTIVIST_ALLOCATION_BONUS_LOCK:
			var newState = { ...state };
			newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.activistDetails = { ...newState.activistsScreen.activistDetails };
			newState.activistsScreen.activistDetails.election_roles_by_voter = [...newState.activistsScreen.activistDetails.election_roles_by_voter];

			activistDetails = newState.activistsScreen.activistDetails;
			roleIndex = activistDetails.election_roles_by_voter.findIndex(roleItem => roleItem.key == action.parentKey);
			if (roleIndex > -1) {
				newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] = { ...newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex] };
				if (newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].bonus_user_lock_id == null) {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].bonus_user_lock_id = action.currentUser.id;
				} else {
					newState.activistsScreen.activistDetails.election_roles_by_voter[roleIndex].bonus_user_lock_id = null;
				}
			}
			return newState;
			break;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_CITY_DATA:
			var newState = { ...state };
			newState.citiesScreen = { ...newState.citiesScreen };
			newState.citiesScreen.cityPanelScreen = {...initial_panelScreen} ;
			return newState;
		/*
			 Handles changes in management-city-view change is one of search comboes
	
			 @param fieldName
			 @param fieldValue
			 @param fieldItem
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.searchScreen = { ...newState.managementCityViewScreen.searchScreen };
			newState.managementCityViewScreen.searchScreen[action.fieldName] = { ...newState.managementCityViewScreen.searchScreen[action.fieldName] }
			newState.managementCityViewScreen.searchScreen[action.fieldName].selectedValue = action.fieldValue;
			newState.managementCityViewScreen.searchScreen[action.fieldName].selectedItem = action.fieldItem;
			return newState;
			break;
			
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.GENERAL_ITEM_VALUE_CHANGE:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

        /* 
           change neighborhoods and clusters collections value

           @param neighborhoods
           @param clusters
        */
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NEIGHBORHOODS_AND_CLUSTERS_ITEMS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.neighborhoods = action.neighborhoods;
			newState.managementCityViewScreen.clusters = action.clusters;
			newState.managementCityViewScreen.prev_last_campagin_name = action.prev_last_campagin_name;

			let ballots = []

			if (action.cityKey) {
				//Get city ballots by clusters:
				action.clusters.forEach(function(clusterData){
					ballots = ballots.concat(clusterData.ballot_boxes);
				})
				newState.managementCityViewScreen.cityCachedDataList = { ...newState.managementCityViewScreen.cityCachedDataList };
				newState.managementCityViewScreen.cityCachedDataList[action.cityKey] = {};
				newState.managementCityViewScreen.cityCachedDataList[action.cityKey].neighborhoods = action.neighborhoods;
				newState.managementCityViewScreen.cityCachedDataList[action.cityKey].clusters = action.clusters;
				newState.managementCityViewScreen.cityCachedDataList[action.cityKey].ballots = ballots;
				newState.managementCityViewScreen.cityCachedDataList[action.cityKey].prev_last_campagin_name = action.prev_last_campagin_name;

				
			}else {
				ballots = action.ballots;
			}
			newState.managementCityViewScreen.ballots = ballots;
			return newState;
			break;

        /*
          Show/hide search results (button click = show / any change in combo = hide

          @param show
         */
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_SHOW_SEARCH_RESULTS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.showSearchResults = action.show;
			return newState;
			break;

	    /*
		Set number of shas votes of current election campaign :
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_NUMBER_ELECTION_CAMP_CITY_SHAS_VOTERS_COUNT:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.numOfShasVotersThisCampaign = action.data.current_shas_votes_sum;
			newState.managementCityViewScreen.clusters_regular_roles = action.data.clusters_regular_roles;
			newState.managementCityViewScreen.clusters_activated_ballots_countings = action.data.clusters_activated_ballots_countings;
			if (action.cityKey) {
				newState.managementCityViewScreen.cityShasVotesCachedDataList = { ...newState.managementCityViewScreen.cityShasVotesCachedDataList };
				newState.managementCityViewScreen.cityShasVotesCachedDataList[action.cityKey] = {};
				newState.managementCityViewScreen.cityShasVotesCachedDataList[action.cityKey].numOfShasVotersThisCampaign = action.data.current_shas_votes_sum;
				newState.managementCityViewScreen.cityShasVotesCachedDataList[action.cityKey].clusters_regular_roles = action.data.clusters_regular_roles
				newState.managementCityViewScreen.cityShasVotesCachedDataList[action.cityKey].clusters_activated_ballots_countings = action.data.clusters_activated_ballots_countings;
			}
			return newState;
			break;

		/*
		Handles change in page number in bottom pagination :
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.NAVIGATE_TO_PAGE_NUMBER:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.currentPage = action.currentPage;
			return newState;
			break;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.CHANGE_BALLOT_BOX_ROLE_TO_BALLOT_BOX:
			var newState = { ...state };
			CityActivistsService.updateClusterBallotField(newState, action );
			return newState;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.CHANGE_BALLOT_BOX_ROLE:
			var newState = { ...state };
			CityActivistsService.updateBallotField(newState, action );
			return newState;

		/*
			General function to change field in captain fifty walker report SEARCH screen :
			
			@param fieldName
			@param fieldValue
        */
		case ElectionsActions.ActionTypes.REPORTS.CHANGE_SEARCH_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			if (!action.screenName) {
				newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
				newState.reportsScreen.captain50WalkerReport.searchScreen = { ...newState.reportsScreen.captain50WalkerReport.searchScreen };
				newState.reportsScreen.captain50WalkerReport.searchScreen[action.fieldName] = action.fieldValue;
			}
			else {
				newState.reportsScreen[action.screenName] = { ...newState.reportsScreen[action.screenName] };
				newState.reportsScreen[action.screenName].searchScreen = { ...newState.reportsScreen[action.screenName].searchScreen };
				newState.reportsScreen[action.screenName].searchScreen[action.fieldName] = action.fieldValue;
			}
			return newState;
			break;

		/*
			General function to change field in modal of finding captain of fifty voter IN  captain fifty walker report SEARCH screen :
			
			@param fieldName
			@param fieldValue
        */
		case ElectionsActions.ActionTypes.REPORTS.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			newState.reportsScreen.captain50WalkerReport.searchScreen = { ...newState.reportsScreen.captain50WalkerReport.searchScreen };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal = { ...newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal[action.fieldName] = action.fieldValue;
			return newState;
			break;

        /*
		Show/hide row details by row index : 
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SHOW_HIDE_ROW_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.clusters = [...newState.managementCityViewScreen.clusters];
			newState.managementCityViewScreen.clusters[action.rowIndex] = { ...newState.managementCityViewScreen.clusters[action.rowIndex] };
			newState.managementCityViewScreen.clusters[action.rowIndex].detailed = action.show;
			return newState;
		/** Hide all the clusters details */
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.HIDE__ALL_TABLE_ROWS_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			let electionsActivistsClusters2 = {...newState.managementCityViewScreen.electionsActivistsClustersSummary};

			electionsActivistsClusters2[action.parentEntityType] = { ...electionsActivistsClusters2[action.parentEntityType] };
			let entityClusters3 = [...electionsActivistsClusters2[action.parentEntityType][action.parentEntityId] ];

			if(entityClusters3 ){
				let newEntityClusters = entityClusters3.map(item => {  // Hide all clusters 
					item.detailed = false;
					return item;
				}) 
				electionsActivistsClusters2[action.parentEntityType][action.parentEntityId] = newEntityClusters;
			}
			newState.managementCityViewScreen.electionsActivistsClustersSummary = electionsActivistsClusters2;
			return newState;
		/*
		   show/hide cluster detailed ballot boxes
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SET_CLUSTER_SUPPORT_VOTER_STATUSES:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.clusters_support_statuses = action.data;
			if (action.cityKey) {
				newState.managementCityViewScreen.citySupportStatusesCachedDataList = { ...newState.managementCityViewScreen.citySupportStatusesCachedDataList };
				newState.managementCityViewScreen.citySupportStatusesCachedDataList[action.cityKey] = {};
				newState.managementCityViewScreen.citySupportStatusesCachedDataList[action.cityKey].clusters_support_statuses = action.data;

			}
			return newState;
			break;

		/*
		Handles getting all ballot-box-roles array
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_BALLOT_BOXES_ROLES:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.ballotBoxRoles = action.data;
			return newState;
			break;
		/*
			Handles delete election role and geo shift
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.DELETE_ACTIVIST_ROLE:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.searchScreen.selectedCluster = { ...newState.managementCityViewScreen.searchScreen.selectedCluster };
			newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem = { ...newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem };
			let extended_ballot_boxes = [...newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes];

			let roleDeletedData = action.roleDeletedData;
			extended_ballot_boxes.forEach(function (balloBoxData) {
				if(balloBoxData.activists_allocations_assignments)
				balloBoxData.activists_allocations_assignments.forEach(function (roleShift, innerIndex) {
					if (action.deleteType == 'role_shift' && roleDeletedData.activist_assignment_id == roleShift.activist_assignment_id) {
						balloBoxData.activists_allocations_assignments.splice(innerIndex, 1)
					}else if (action.deleteType == 'election_role' && roleDeletedData.election_role_key == roleShift.election_role_key) {
						balloBoxData.activists_allocations_assignments.splice(innerIndex, 1)
					}
				});

			});
			newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes = extended_ballot_boxes;

			return newState;
			break;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.EDIT_ACTIVIST_ROLE_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };

			let extended_ballot_boxes2;
			let clusterIndex = action.clusterIndex;
			if (clusterIndex != null) {//From city-summary screen:
				newState.managementCityViewScreen.clusters = [...newState.managementCityViewScreen.clusters];
				newState.managementCityViewScreen.clusters[clusterIndex] = { ...newState.managementCityViewScreen.clusters[clusterIndex] };
				extended_ballot_boxes2 = [...newState.managementCityViewScreen.clusters[clusterIndex].extended_ballot_boxes];
			} else {  //From cluster-summary screen:
				newState.managementCityViewScreen.searchScreen.selectedCluster = { ...newState.managementCityViewScreen.searchScreen.selectedCluster };
				newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem = { ...newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem };
				extended_ballot_boxes2 = [...newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes];
			} 
			let isEditType = action.actionType == 'editShift';
			let editObj = action.editObj;
			extended_ballot_boxes2.forEach(function (balloBoxData) {
				balloBoxData.activists_allocations_assignments = [...balloBoxData.activists_allocations_assignments];
				balloBoxData.activists_allocations_assignments.forEach(function (roleShift, i) {

					// If election role was edited
					if (!isEditType && action.roleKey == roleShift.election_role_key) {
						for(let fieldName in editObj){
							roleShift[fieldName] = editObj[fieldName];
						}
						balloBoxData.activists_allocations_assignments[i] = { ...roleShift }
						
					// If election role geographic was edited
					} else if (isEditType && action.shiftKey == roleShift.activist_assignment_id) {
						for(let fieldName in editObj){
							roleShift[fieldName] = editObj[fieldName];
						}
						balloBoxData.activists_allocations_assignments[i] = { ...roleShift }
					}
				});

			});
			if (clusterIndex != null) {
				newState.managementCityViewScreen.clusters[clusterIndex].extended_ballot_boxes = extended_ballot_boxes2;
			} else {
				newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes = extended_ballot_boxes2;
			}

			return newState;

		case AllocationAndAssignmentActions.ActionTypes.DELETE_CLUSTER_ACTIVIST_ROLE:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			let cluster_activists_and_votes = newState.managementCityViewScreen.cluster_activists_and_votes = { ...newState.managementCityViewScreen.cluster_activists_and_votes };
			let clusterRoleDeletedData = action.roleDeletedData;

			// Get current activists array
			let activistsDataHash = {
				'motivator': 'mamritz_roles',
				'captain_of_fifty': 'captain_fifty',
				'cluster_leader': 'cluster_leader_roles',
				'driver': 'driver_roles',
			}
			let system_name = clusterRoleDeletedData.election_role_system_name;
			let electionRolesData = [];
			if (activistsDataHash.hasOwnProperty(system_name)) {
				electionRolesData = [...cluster_activists_and_votes[activistsDataHash[system_name]]]
				electionRolesData.forEach(function (roleData, innerIndex) {
					if (action.deleteType == 'role_shift' && roleData.activist_assignment_id == clusterRoleDeletedData.activist_assignment_id) {
						electionRolesData.splice(innerIndex, 1)
					}
					else if (action.deleteType == 'election_role' && roleData.election_role_key == clusterRoleDeletedData.election_role_key) {
						electionRolesData.splice(innerIndex, 1)
					} else if (action.deleteType == 'cluster_leader' && roleData.cluster_key == clusterRoleDeletedData.cluster_key) {
						electionRolesData.splice(innerIndex, 1)
					}
				})
				cluster_activists_and_votes[activistsDataHash[system_name]] = electionRolesData;
			}
			return newState;
		/*
		Handles getting all elections roles array
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_ALL_ELECTION_ROLES:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.allElectionsRoles = action.data;
			return newState;
			break;

		/*
		Change row data of cluster row
		
		@param rowIndex
		@param fieldName
		@param fieldValue
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_ROW_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.clusters = [...newState.managementCityViewScreen.clusters];
			newState.managementCityViewScreen.clusters[action.rowIndex] = { ...newState.managementCityViewScreen.clusters[action.rowIndex] };
			newState.managementCityViewScreen.clusters[action.rowIndex][action.fieldName] = action.fieldValue;
			 
			if (action.fieldName == 'extended_ballot_boxes') {
				newState.managementCityViewScreen.searchScreen = { ...newState.managementCityViewScreen.searchScreen };
				newState.managementCityViewScreen.searchScreen.selectedCluster = { ...newState.managementCityViewScreen.searchScreen.selectedCluster };
				if (newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem) {
					newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem = { ...newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem };
					newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes = action.fieldValue;
				}
			}
			return newState;
			break;
		/*
			Change row data of cluster row
			For electionsActivistsClustersSummary hash:
			@param rowIndex
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_ACTIVISTS_ROW_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			let electionsActivistsClusters = {...newState.managementCityViewScreen.electionsActivistsClustersSummary};

			electionsActivistsClusters[action.parentEntityType] = { ...electionsActivistsClusters[action.parentEntityType] };
			let entityClusters = [...electionsActivistsClusters[action.parentEntityType][action.parentEntityId] ];
			if(entityClusters && entityClusters[action.rowIndex]){ // Update single cluster field by index
				entityClusters[action.rowIndex][action.fieldName] = action.fieldValue;
				electionsActivistsClusters[action.parentEntityType][action.parentEntityId] = entityClusters;
			}
			newState.managementCityViewScreen.electionsActivistsClustersSummary = electionsActivistsClusters;
			 
			return newState;
		/*
			Change ballot field of cluster row
			For electionsActivistsClustersSummary hash:
			@param rowIndex
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_BALLOT_ACTIVISTS_ROW_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			electionsActivistsClustersSummary = {...newState.managementCityViewScreen.electionsActivistsClustersSummary};

			electionsActivistsClustersSummary[action.parentEntityType] = { ...electionsActivistsClustersSummary[action.parentEntityType] };
			let entityClusters2 = [...electionsActivistsClustersSummary[action.parentEntityType][action.parentEntityId] ];

			if(entityClusters2 && entityClusters2[action.clusterIndex]){ // Update single cluster field by index
				let editObj = action.editObj;
				let extended_ballot_boxes = [ ...entityClusters2[action.clusterIndex].extended_ballot_boxes];
				// Go throw all cluster ballots
				extended_ballot_boxes.forEach((ballotBox, i) => {
					// Go throw all ballot shifts
					ballotBox.activists_allocations_assignments.forEach(function (activistRoleShift, j) {
						// If election role was edited
						let paramToCompare = (action.actionType == 'editShift') ? 'activist_assignment_id' : 'election_role_key';
						if ( action.roleKey == activistRoleShift[paramToCompare] ) {
							for(let fieldName in editObj){
								activistRoleShift[fieldName] = editObj[fieldName];
							}
							ballotBox.activists_allocations_assignments[j] = { ...activistRoleShift }
						}
					})
					extended_ballot_boxes[i] = ballotBox;
				})

				entityClusters2[action.clusterIndex].extended_ballot_boxes = extended_ballot_boxes;
				electionsActivistsClustersSummary[action.parentEntityType][action.parentEntityId] = entityClusters2;
			}
			newState.managementCityViewScreen.electionsActivistsClustersSummary = electionsActivistsClustersSummary;
			 
			return newState;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_BALLOT_ACTIVISTS_ROW_DETAILS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			let ballotsFullData = [...newState.managementCityViewScreen.ballotsFullData ];
			let ballotCityIndex = ballotsFullData.findIndex((item) => {
				return item.id == action.ballotId
			});  // Current ballot changed
			if(ballotsFullData[ballotCityIndex]){
				let editObj = action.editObj;

				let ballot = {...ballotsFullData[ballotCityIndex] }; 
				ballot.activists_allocations_assignments = [ ...ballot.activists_allocations_assignments ]
				ballot.activists_allocations_assignments.forEach(function (item, j) {
					// If election role was edited
					let paramToCompare = (action.actionType == 'editShift') ? 'activist_assignment_id' : 'election_role_key';
					if ( action.roleKey == item[paramToCompare] ) {
						for(let fieldName in editObj){
							item[fieldName] = editObj[fieldName];
						}
						ballot.activists_allocations_assignments[j] = { ...item }
					}
				})
				ballotsFullData[ballotCityIndex] = ballot;
			}
			newState.managementCityViewScreen.ballotsFullData = ballotsFullData;
			return newState;

	    /*
		Handles cleaning search captain50-voter fields on closing of search modal dialog :
		*/
		case ElectionsActions.ActionTypes.REPORTS.CLEAN_SEARCH_CAPTAIN50_VOTER_MODAL_FIELDS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			newState.reportsScreen.captain50WalkerReport.searchScreen = { ...newState.reportsScreen.captain50WalkerReport.searchScreen };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal = { ...newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedCity = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedCluster = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.ministerFirstName = '';
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.ministerLastName = '';
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.ministerID = '';
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.clusters = [];
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters = [];
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedRowIndex = -1;
			return newState;
			break;

		/*
			In search results of captain-50-voter - selecting specific row , and unselecting other rows :
		
		    @param rowIndex
		*/
		case ElectionsActions.ActionTypes.REPORTS.SET_VOTER_SEARCH_RESULT_ROW_SELECTED:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			newState.reportsScreen.captain50WalkerReport.searchScreen = { ...newState.reportsScreen.captain50WalkerReport.searchScreen };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal = { ...newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal };
			newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters = [...newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters];
			for (let i = 0; i < newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters.length; i++) {
				newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i] = { ...newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i] };
				if (i == action.rowIndex) {
					newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedRowIndex = action.rowIndex;
					newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i].isSelected = true;
				}
				else {
					newState.reportsScreen.captain50WalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i].isSelected = false;
				}
			}
			return newState;
			break;

		/*
			Handles showing/hiding global modal window dialog
			
			@param show - true/false
			@param modalHeader
			@param modalContent
		*/
		case ElectionsActions.ActionTypes.REPORTS.SHOW_HIDE_GLOBAL_MODAL_DIALOG:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			newState.reportsScreen.captain50WalkerReport.globalModalMessageHeader = action.modalHeader;
			newState.reportsScreen.captain50WalkerReport.globalModalMessageContent = action.modalContent;
			newState.reportsScreen.captain50WalkerReport.showGlobalMessageModal = action.show;
			return newState;
			break;

		/*
			Handles getting search results of captain-50-walker report from API
			
			@param data
		*/
		case ElectionsActions.ActionTypes.REPORTS.LOADED_CAP50_WALKER_SEARCH_RESULTS: //split between first load data to load more data.
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };

			let resultsVoterList = action.data.voterList;
			let resultsCaptainHash = action.data.captainHash;

			let reportSearchResults = [];
			let captainFullHash = {};
			let householdFullHash = {};

			if (!action.isNewSearch) {
				captainFullHash = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResultsCaptainHash }
				householdFullHash = {...newState.reportsScreen.captain50WalkerReport.reportSearchResultsHouseholdHash};
				reportSearchResults = [...newState.reportsScreen.captain50WalkerReport.reportSearchResults];
			}
			for(let captain_personal_identity in resultsCaptainHash){
				if (!captainFullHash.hasOwnProperty(captain_personal_identity)) {
					captainFullHash[captain_personal_identity] = resultsCaptainHash[captain_personal_identity];
					captainFullHash[captain_personal_identity].lastRowIndex = 0;
				}
			}
			resultsVoterList.forEach(function(voterRow,i){
				captainFullHash[voterRow.captain_personal_identity].lastRowIndex++;
				voterRow.indexInCaptain = captainFullHash[voterRow.captain_personal_identity].lastRowIndex;
				if (!householdFullHash.hasOwnProperty(voterRow.household_id)) {
					householdFullHash[voterRow.household_id] = [];
				}
				let lastResultIndex = reportSearchResults.length;
				householdFullHash[voterRow.household_id].push(lastResultIndex + i);
				let voter_phones=voterRow.voter_phones;
				voterRow.first_phone = voter_phones.hasOwnProperty(0) ? voter_phones[0].phone_number : ''
				voterRow.second_phone = voter_phones.hasOwnProperty(1) ? voter_phones[1].phone_number : ''
			});

			newState.reportsScreen.captain50WalkerReport.reportSearchResults = reportSearchResults.concat(resultsVoterList)
			newState.reportsScreen.captain50WalkerReport.reportSearchResultsCaptainHash = captainFullHash;
			newState.reportsScreen.captain50WalkerReport.reportSearchResultsHouseholdHash = householdFullHash;
			newState.reportsScreen.captain50WalkerReport.totalVotersCount = action.data.totalVotersCount;
			return newState;

		/*
		expand/shrink all filters by param value
		@param expand
		*/
		case ElectionsActions.ActionTypes.REPORTS.EXPAND_SHRINK_ALL_ADDITIONAL_FILTERS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			newState.reportsScreen.captain50WalkerReport.additionalFiltersExpanded = { ...newState.reportsScreen.captain50WalkerReport.additionalFiltersExpanded };
			newState.reportsScreen.captain50WalkerReport.additionalFiltersExpanded.supportStatus = action.expand;
			newState.reportsScreen.captain50WalkerReport.additionalFiltersExpanded.votingStatus = action.expand;
			newState.reportsScreen.captain50WalkerReport.additionalFiltersExpanded.groupsInShas = action.expand;
			newState.reportsScreen.captain50WalkerReport.additionalFiltersExpanded.reportsData = action.expand;
			return newState;
			break;

		/*
			 General function to change field in captain fifty walker report screen :
		 	
			 @param fieldName
			 @param fieldValue
		 */
		case ElectionsActions.ActionTypes.REPORTS.CHANGE_GLOBAL_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			if (newState.reportsScreen.captain50WalkerReport.reportSearchResults != undefined) {
				newState.reportsScreen.captain50WalkerReport.reportSearchResults = [...newState.reportsScreen.captain50WalkerReport.reportSearchResults];
			}
			newState.reportsScreen.captain50WalkerReport[action.fieldName] = action.fieldValue;
			if (action.fieldName == 'loadingSearchResults' && newState.reportsScreen.captain50WalkerReport.reportSearchResults) {
				newState.reportsScreen.captain50WalkerReport.reportSearchResults.forEach(function(voterData){
					voterData.expanded=undefined;
				})
			}
			return newState;
			break;

		/** 
		expand/shrink specific voter row in expanded mode
		@param rowIndex - index of row in voters list
		*/
		case ElectionsActions.ActionTypes.REPORTS.EXPAND_REPORT_VOTER_ROW:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			if (newState.reportsScreen.captain50WalkerReport.reportSearchResults) {
				newState.reportsScreen.captain50WalkerReport.reportSearchResults = [...newState.reportsScreen.captain50WalkerReport.reportSearchResults];
				newState.reportsScreen.captain50WalkerReport.isEditingVoter = action.willExpand;
				newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] };
				newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex].expanded = action.willExpand;
			}
			return newState;
			break;

		/*
		Show/hide ballot box row details in cluster_summary screen
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SHOW_HIDE_BALLOT_BOX_ROW_DETAILS:
			var newState = { ...state };

			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.clusters = [...newState.managementCityViewScreen.clusters];
			newState.managementCityViewScreen.clusters[action.clusterRowIndex] = { ...newState.managementCityViewScreen.clusters[action.clusterRowIndex] };

			newState.managementCityViewScreen.clusters[action.clusterRowIndex].ballot_boxes = [...newState.managementCityViewScreen.clusters[action.clusterRowIndex].ballot_boxes];
			newState.managementCityViewScreen.clusters[action.clusterRowIndex].ballot_boxes[action.ballotRowIndex] = { ...newState.managementCityViewScreen.clusters[action.clusterRowIndex].ballot_boxes[action.ballotRowIndex] };
			newState.managementCityViewScreen.clusters[action.clusterRowIndex].ballot_boxes[action.ballotRowIndex].detailed = action.show;
			newState.managementCityViewScreen.searchScreen = { ...newState.managementCityViewScreen.searchScreen };
			newState.managementCityViewScreen.searchScreen.selectedCluster = { ...newState.managementCityViewScreen.searchScreen.selectedCluster };
			newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem = { ...newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem };
			newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.ballot_boxes = newState.managementCityViewScreen.clusters[action.clusterRowIndex].ballot_boxes;
			return newState;
			break;

        /*
		Handle loading clusters activists roles , votes and supporters count
		*/
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_CLUSTER_ACTIVISTS_AND_VOTES_DATA:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.cluster_activists_and_votes = { ...newState.managementCityViewScreen.cluster_activists_and_votes };
			newState.managementCityViewScreen.cluster_activists_and_votes.captain_fifty = action.data.captain_fifty;
			newState.managementCityViewScreen.cluster_activists_and_votes.cluster_leader_roles = action.data.cluster_leader_roles;
			newState.managementCityViewScreen.cluster_activists_and_votes.driver_roles = action.data.driver_roles;
			newState.managementCityViewScreen.cluster_activists_and_votes.mamritz_roles = action.data.mamritz_roles;
			newState.managementCityViewScreen.cluster_activists_and_votes.shas_votes_count = action.data.shas_votes_count;
			newState.managementCityViewScreen.cluster_activists_and_votes.motivator_role_key = action.data.motivator_role_key;
			newState.managementCityViewScreen.cluster_activists_and_votes.captain_of_fifty_role_key = action.data.captain_of_fifty_role_key;
			newState.managementCityViewScreen.cluster_activists_and_votes.cluster_leader_role_key = action.data.cluster_leader_role_key;
			newState.managementCityViewScreen.cluster_activists_and_votes.driver_role_key = action.data.driver_role_key;
			newState.managementCityViewScreen.cluster_activists_and_votes.cancel_google_map = action.data.cancel_google_map;

			return newState;
			break;
		case ElectionsActions.ActionTypes.ACTIVIST.UPDATE_CLUSTER_GOOGLE_MAP:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.cluster_activists_and_votes = { ...newState.managementCityViewScreen.cluster_activists_and_votes };

			newState.managementCityViewScreen.searchScreen.selectedCluster.selectedItem.cancel_google_map = action.cancel_google_map;
			

			return newState;
			break;
        /*
		Handles cleaning all data in management screen - cluster/city
		*/

		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CLEAN_ALL_DATA:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.showSearchResults = false;
			newState.managementCityViewScreen.neighborhoods = [];
			newState.managementCityViewScreen.clusters = [];
			newState.managementCityViewScreen.cityCachedDataList = {};
			newState.managementCityViewScreen.cityShasVotesCachedDataList = {};
			newState.managementCityViewScreen.citySupportStatusesCachedDataList = {};
			newState.managementCityViewScreen.clusterBallotBoxCachedDataList = {};
			newState.managementCityViewScreen.searchScreen = { ...newState.managementCityViewScreen.searchScreen };
			newState.managementCityViewScreen.searchScreen.selectedArea = { selectedValue: '', selectedItem: null };
			newState.managementCityViewScreen.searchScreen.selectedSubArea = { selectedValue: '', selectedItem: null };
			newState.managementCityViewScreen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
			newState.managementCityViewScreen.searchScreen.selectedNeighborhood = { selectedValue: '', selectedItem: null };
			newState.managementCityViewScreen.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
			newState.managementCityViewScreen.currentPage = 1;
			newState.managementCityViewScreen.numOfShasVotersThisCampaign = 0;
			newState.managementCityViewScreen.clusters_regular_roles = [];
			newState.managementCityViewScreen.clusters_activated_ballots_countings = [];
			newState.managementCityViewScreen.clusters_support_statuses = [];
			newState.managementCityViewScreen.cluster_activists_and_votes = { ...newState.managementCityViewScreen.cluster_activists_and_votes };
			newState.managementCityViewScreen.cluster_activists_and_votes.captain_fifty = [];
			newState.managementCityViewScreen.cluster_activists_and_votes.cluster_leader_roles = [];
			newState.managementCityViewScreen.cluster_activists_and_votes.driver_roles = [];
			newState.managementCityViewScreen.cluster_activists_and_votes.mamritz_roles = [];
			newState.managementCityViewScreen.cluster_activists_and_votes.shas_votes_count = 0;
			newState.managementCityViewScreen.cluster_activists_and_votes.motivator_role_key = '';
			newState.managementCityViewScreen.cluster_activists_and_votes.captain_of_fifty_role_key = '';
			newState.managementCityViewScreen.cluster_activists_and_votes.cluster_leader_role_key = '';
			newState.managementCityViewScreen.cluster_activists_and_votes.driver_role_key = '';
			newState.managementCityViewScreen.cluster_activists_and_votes.loadedClusterDataFromAPI = false;
			return newState;

		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.ADD_ALLOCATION_MODAL.SET_ACTIVIST_ITEM:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.addAllocationModal = { ...newState.managementCityViewScreen.addAllocationModal };
			newState.managementCityViewScreen.addAllocationModal.activistItem = action.activistItem;
			return newState;
			// Set entity data summary - for all geo entities:
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_ENTITY_ACTIVISTS_SUMMARY:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			let electionsActivistsSummary = { ...newState.managementCityViewScreen.electionsActivistsSummary };
			
			electionsActivistsSummary[action.entityType][action.entityId] = action.data;
			newState.managementCityViewScreen.electionsActivistsSummary = electionsActivistsSummary;
			return newState;

		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_ENTITY_CLUSTERS_ACTIVISTS_SUMMARY:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			let electionsActivistsClustersSummary = { ...newState.managementCityViewScreen.electionsActivistsClustersSummary };

			electionsActivistsClustersSummary[action.entityType][action.entityId] = action.data.sub_entities_activists_summary;

			newState.managementCityViewScreen.electionsActivistsClustersSummary = electionsActivistsClustersSummary;
			return newState;

		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_CITY_ACTIVISTS_CLUSTERS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.cityClusters = action.data;

			return newState;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SET_CITY_ELECTION_ROLE_ACTIVIST_GEO_DATA:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.cityActivistGeoData = {
				entityType: action.entityType,
				currentEntity: action.currentEntity,
			};

			return newState;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_MUNICIPAL_ACTIVISTS_COORDINATORS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.municipalCoordinators = action.data;
			return newState;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_CITY_QUARTERS:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.cityQuarters = action.data;
			return newState;
		case ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.LOADED_CLUSTER_ACTIVIST:
			var newState = { ...state };
			newState.managementCityViewScreen = { ...newState.managementCityViewScreen };
			newState.managementCityViewScreen.clusterAllocatedActivists = action.data;
			return newState;
		/*
		get all support statuses from captain-50-walker report : 
		*/
		case ElectionsActions.ActionTypes.REPORTS.REPORTS_SUPPORT_STATUS_FETCH_DATA_END:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			newState.reportsScreen.captain50WalkerReport.supportStatuses = action.supportStatuses;
			return newState;
			break;


		/*
		  change in one of editing fields values in captain of fifty walker report 
		  
		  @param mainArrayIndex
		  @param subArrayIndex
		  @param fieldName
		  @param fieldValue
				  
		*/
		case ElectionsActions.ActionTypes.REPORTS.REPORT_EDIT_FIELD_VALUE_CHANGE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			if (newState.reportsScreen.captain50WalkerReport.reportSearchResults) {
				newState.reportsScreen.captain50WalkerReport.reportSearchResults = [...newState.reportsScreen.captain50WalkerReport.reportSearchResults];
				let editVoterRow = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] }
				editVoterRow[action.fieldName] = action.fieldValue;
				newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] = editVoterRow;
			}
			return newState;
		/**
		 * 
		 */
		case ElectionsActions.ActionTypes.REPORTS.RESTORE_TO_MI_ADDRESS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			let voterRow = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] };
			let miAddressDetails=['city_id','street','street_id','house_id','house','house_entry','flat'];
			miAddressDetails.forEach(function(detail){
				voterRow[detail] = voterRow['mi_' + detail] || '';
			});
			voterRow.city_name = voterRow.mi_city || '';
			newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] = voterRow;
		return newState;
		/** 
		  restore old value of edited row
		  @param rowIndex - voter row index
		  @param updateObject - object with values to update
		*/
		case ElectionsActions.ActionTypes.REPORTS.REPORT_RESTORE_OLD_VALUES:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			if (newState.reportsScreen.captain50WalkerReport.reportSearchResults) {
				newState.reportsScreen.captain50WalkerReport.reportSearchResults = [...newState.reportsScreen.captain50WalkerReport.reportSearchResults];
				newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] };
				for (let key in action.updateObject) {
					newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex][key] = action.updateObject[key];
				}
			}
			return newState;
			break;

		/*
		  collective update of voters fields in household :
		  
		  @param mainArrayIndex
		  @param subArrayIndex
		  @param specialUpdateObject - object with values to update
				  
		*/
		case ElectionsActions.ActionTypes.REPORTS.COLLECTIVE_HOUSEHOLD_UPDATES: //Check how to update HOUSEHOLD_UPDATES!
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.captain50WalkerReport = { ...newState.reportsScreen.captain50WalkerReport };
			let household_id = -1;
			if (newState.reportsScreen.captain50WalkerReport.reportSearchResults) {
				newState.reportsScreen.captain50WalkerReport.reportSearchResults = [...newState.reportsScreen.captain50WalkerReport.reportSearchResults];

				let currentVoter = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResults[action.rowIndex] };

				household_id = currentVoter.household_id;
				if (household_id && household_id != -1) {
				let householdIndexList = newState.reportsScreen.captain50WalkerReport.reportSearchResultsHouseholdHash[household_id];
					for (let i = 0; i < householdIndexList.length; i++) {
						let householdVoter = { ...newState.reportsScreen.captain50WalkerReport.reportSearchResults[i] };
							if (householdVoter.household_id == household_id) {
								for (let key in action.specialUpdateObject) {
									householdVoter[key] = action.specialUpdateObject[key];
								}
							}
							newState.reportsScreen.captain50WalkerReport.reportSearchResults[i] = householdVoter;
					}
				}
			}
			return newState;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.LOAD_SUPPORT_STATUSES:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.supportStatuses = action.supportStatuses;

			return newState;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.LOAD_CLUSTER_ELECTION_ROLES:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.combos = { ...newState.clustersScreen.combos };

			newState.clustersScreen.combos.electionRoles = action.election_roles;

			return newState;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.LOAD_CITY_NEIGHBORHOODS:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.neighborhoods = action.neighborhoods;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.LOAD_CITY_CLUSTERS:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.clusters = action.clusters;

			return newState;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_CLUSTERS:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.combos = { ...newState.clustersScreen.combos };

			newState.clustersScreen.combos.clusters = [];

			return newState;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_ELECTION_CAMPAIGNS:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };
			newState.ballotsScreen.combos.electionsCampaignsHash = { ...newState.ballotsScreen.combos.electionsCampaignsHash };

			var electionCampaignKeyHash = '';

			newState.ballotsScreen.combos.electionCampaigns = action.electionCampaigns;

			for (let electionCampaignIndex = 0; electionCampaignIndex < action.electionCampaigns.length; electionCampaignIndex++) {
				electionCampaignKeyHash = 'election_' + action.electionCampaigns[electionCampaignIndex].id;

				newState.ballotsScreen.combos.electionsCampaignsHash[electionCampaignKeyHash] = action.electionCampaigns[electionCampaignIndex];
			}
			return newState;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.LOAD_CITY_CLUSTERS:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.combos = { ...newState.clustersScreen.combos };

			newState.clustersScreen.combos.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_NEIGHBORHOODS:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.neighborhoods = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CITY_CLUSTERS:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_CITY_NEIGHBORHOODS:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.combos = { ...newState.clustersScreen.combos };

			newState.clustersScreen.combos.neighborhoods = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.LOAD_CLUSTER_BALLOTS:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.ballots = action.ballots;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.DISPLAY_CAPTAIN50_BALLOTS:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.captain_ballots = action.captain_ballots;
			return newState;
		break;
		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.LOAD_SUPPORT_STATUSES:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.combos = { ...newState.captainScreen.combos };

			newState.captainScreen.supportStatuses = action.supportStatuses;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CHANGE_SEARCH_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.searchScreen = { ...newState.captainScreen.searchScreen };
			newState.captainScreen.searchScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.CLEAN_SCREEN:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.loadedFirstSearchResults = false;
			newState.captainScreen.loadingData = false;
			newState.captainScreen.result = { ...newState.captainScreen.result };
			newState.captainScreen.result.totalSummaryResults = 0;
			newState.captainScreen.result.summaryResult = [];
			newState.captainScreen.searchScreen = { ...newState.captainScreen.searchScreen };
			newState.captainScreen.searchScreen.neighborhoods = [];
			newState.captainScreen.searchScreen.selectedArea = { selectedValue: '', selectedItem: null };
			newState.captainScreen.searchScreen.selectedSubArea = { selectedValue: '', selectedItem: null };
			newState.captainScreen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
			newState.captainScreen.searchScreen.selectedNeighborhood = { selectedValue: '', selectedItem: null };
			return newState;
			break;
		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.SET_LOADED_FIRST_RESULT:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.combos = { ...newState.captainScreen.combos };

			newState.captainScreen.loadedFirstSearchResults = action.data;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.LOAD_CITY_NEIGHBORHOODS:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.combos = { ...newState.clustersScreen.combos };

			newState.clustersScreen.combos.neighborhoods = action.neighborhoods;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_CLUSTER_BALLOTS:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.combos = { ...newState.statusesScreen.combos };

			newState.statusesScreen.combos.ballots = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_MODAL_SEARCH_LEADER_CLUSTERS:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.modalSearchLeader = { ...newState.clustersScreen.modalSearchLeader };

			newState.clustersScreen.modalSearchLeader.clusters = [];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.SET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };

			newState.captainScreen.loadingData = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.LOAD_MODAL_SEARCH_LEADER_CLUSTERS:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.modalSearchLeader = { ...newState.clustersScreen.modalSearchLeader };

			newState.clustersScreen.modalSearchLeader.clusters = action.clusters;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.SET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };

			newState.statusesScreen.loadingData = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.MODAL_SEARCH_SET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.modalSearchLeader = { ...newState.clustersScreen.modalSearchLeader };

			newState.clustersScreen.modalSearchLeader.loadingLeaders = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.UNSET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };

			newState.captainScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.MODAL_SEARCH_UNSET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.modalSearchLeader = { ...newState.clustersScreen.modalSearchLeader };

			newState.clustersScreen.modalSearchLeader.loadingLeaders = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.RESET_SUMMARY_RESULT:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.result = { ...newState.ballotsScreen.result };
			newState.ballotsScreen.result.summaryResult = [];
			newState.ballotsScreen.result.totalSummaryResults = [];
			newState.ballotsScreen.result.rowOfTotalSums = [];
			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.MODAL_SEARCH_RESET_SUMMARY_RESULT:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.modalSearchLeader = { ...newState.clustersScreen.modalSearchLeader };

			newState.clustersScreen.modalSearchLeader.result = {...initialState.clustersScreen.modalSearchLeader.result};

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_SUMMARY_RESULT:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.result = { ...newState.ballotsScreen.result };
			newState.ballotsScreen.searchFields = { ...newState.ballotsScreen.searchFields };

			newState.ballotsScreen.result.summaryResult = action.records;
			newState.ballotsScreen.result.totalSummaryResults = action.total_records;
			newState.ballotsScreen.result.rowOfTotalSums = action.row_total_sums;

			newState.ballotsScreen.searchFields.area_id = action.searchObj.area_id;
			newState.ballotsScreen.searchFields.sub_area_id = action.searchObj.sub_area_id;
			newState.ballotsScreen.searchFields.city_id = action.searchObj.city_id;
			newState.ballotsScreen.searchFields.neighborhood_id = action.searchObj.neighborhood_id;
			newState.ballotsScreen.searchFields.cluster_id = action.searchObj.cluster_id;
			newState.ballotsScreen.searchFields.ballot_id = action.searchObj.ballot_id;
			
			newState.ballotsScreen.searchFields.selected_statuses = action.searchObj.selected_statuses;
			newState.ballotsScreen.searchFields.selected_ballots = JSON.parse(action.searchObj.selected_ballots);
			newState.ballotsScreen.searchFields.selected_clusters = JSON.parse(action.searchObj.selected_clusters);
			newState.ballotsScreen.searchFields.selected_neighborhoods = JSON.parse(action.searchObj.selected_neighborhoods);
			newState.ballotsScreen.searchFields.selected_cities = JSON.parse(action.searchObj.selected_cities);

			newState.ballotsScreen.searchFields.selected_statuses = action.searchObj.selected_statuses;

			newState.ballotsScreen.searchFields.summary_by_id = action.searchObj.summary_by_id;

			newState.ballotsScreen.searchFields.selected_campaigns = action.searchObj.selected_campaigns;

			newState.ballotsScreen.searchFields.is_district_city = action.searchObj.is_district_city;
			newState.ballotsScreen.searchFields.is_ballot_strictly_orthodox = action.searchObj.is_ballot_strictly_orthodox;
			newState.ballotsScreen.searchFields.is_entity_in_current_election = action.searchObj.is_entity_in_current_election;

			newState.ballotsScreen.searchFields.display_num_of_votes = action.searchObj.display_num_of_votes;
			newState.ballotsScreen.searchFields.display_vote_statistics = action.searchObj.display_vote_statistics;
			newState.ballotsScreen.searchFields.display_statuses_statistics = action.searchObj.display_statuses_statistics;

			newState.ballotsScreen.searchFields.display_prev_votes_percents = action.searchObj.display_prev_votes_percents;
			newState.ballotsScreen.searchFields.display_strictly_orthodox_percents = action.searchObj.display_strictly_orthodox_percents;
			newState.ballotsScreen.searchFields.display_sephardi_percents = action.searchObj.display_sephardi_percents;
			newState.ballotsScreen.loadingMoreData = false;

			newState.ballotsScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.MODAL_SEARCH_LOAD_SUMMARY_RESULT:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.modalSearchLeader = { ...newState.clustersScreen.modalSearchLeader };
			newState.clustersScreen.modalSearchLeader.result = { ...newState.clustersScreen.modalSearchLeader.result };
			newState.clustersScreen.modalSearchLeader.searchFields = { ...newState.clustersScreen.modalSearchLeader.searchFields };

			newState.clustersScreen.modalSearchLeader.result.summaryResult = action.records;
			newState.clustersScreen.modalSearchLeader.result.totalSummaryResults = action.total_records;

			newState.clustersScreen.modalSearchLeader.searchFields.city_id = action.searchObj.city_id;
			newState.clustersScreen.modalSearchLeader.searchFields.cluster_id = action.searchObj.cluster_id;
			newState.clustersScreen.modalSearchLeader.searchFields.first_name = action.searchObj.first_name;
			newState.clustersScreen.modalSearchLeader.searchFields.last_name = action.searchObj.last_name;
			newState.clustersScreen.modalSearchLeader.searchFields.personal_identity = action.searchObj.personal_identity;

			newState.clustersScreen.modalSearchLeader.loadingLeaders = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.LOAD_SUMMARY_RESULT:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.result = { ...newState.captainScreen.result };
			newState.captainScreen.searchFields = { ...newState.captainScreen.searchFields };

			newState.captainScreen.result.summaryResult = action.records;
			newState.captainScreen.result.totalSummaryResults = action.total_records;

			newState.captainScreen.searchFields.area_id = action.searchObj.area_id;
			newState.captainScreen.searchFields.sub_area_id = action.searchObj.sub_area_id;
			newState.captainScreen.searchFields.city_id = action.searchObj.city_id;

			newState.captainScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.MODAL_SEARCH_RESET_ALL_DATA:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };

			newState.clustersScreen.modalSearchLeader = {...initialState.clustersScreen.modalSearchLeader};

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.UNSET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };

			newState.statusesScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.SET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };

			newState.clustersScreen.loadingData = true;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.LOAD_SUMMARY_RESULT:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.result = { ...newState.statusesScreen.result };
			newState.statusesScreen.searchFields = { ...newState.statusesScreen.searchFields };

			newState.statusesScreen.result.summaryResult = action.records;
			newState.statusesScreen.result.totalSummaryResults = action.total_records;
			newState.statusesScreen.result.rowOfTotalSums = action.row_total_sums;

			newState.statusesScreen.searchFields.area_id = action.searchObj.area_id;
			newState.statusesScreen.searchFields.sub_area_id = action.searchObj.sub_area_id;
			newState.statusesScreen.searchFields.city_id = action.searchObj.city_id;
			newState.statusesScreen.searchFields.cluster_id = action.searchObj.cluster_id;
			newState.statusesScreen.searchFields.ballot_id = action.searchObj.ballot_id;

			newState.statusesScreen.searchFields.summary_by_id = action.searchObj.summary_by_id;

			newState.statusesScreen.searchFields.start_date = action.searchObj.start_date;
			newState.statusesScreen.searchFields.end_date = action.searchObj.end_date;

			newState.statusesScreen.searchFields.selected_statuses = action.searchObj.selected_statuses;

			newState.statusesScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.UNSET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };

			newState.clustersScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOAD_MORE_SUMMARY_RESULT:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.result = { ...newState.ballotsScreen.result };
			newState.ballotsScreen.result.summaryResult = [...newState.ballotsScreen.result.summaryResult];

			for (let rowIndex = 0; rowIndex < action.records.length; rowIndex++) {
				newState.ballotsScreen.result.summaryResult.push(action.records[rowIndex]);
			}
			newState.ballotsScreen.loadingMoreData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_ALL_DATA:
			var newState = { ...state };
			// let selected_roles ={...state.clustersScreen.combos.electionRoles}
			newState.clustersScreen = {...initialState.clustersScreen};
			newState.clustersScreen.searchFields = {...initialState.clustersScreen.searchFields};

			newState.clustersScreen.combos = {...initialState.clustersScreen.combos};
			newState.clustersScreen.combos.electionRoles = [...state.clustersScreen.combos.electionRoles];

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.RESET_SUMMARY_RESULT:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };

			newState.clustersScreen.result = {...initialState.clustersScreen.result};

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.STATUSES.LOAD_MORE_SUMMARY_RESULT:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.result = { ...newState.statusesScreen.result };
			newState.statusesScreen.result.summaryResult = [...newState.statusesScreen.result.summaryResult];

			for (let rowIndex = 0; rowIndex < action.records.length; rowIndex++) {
				newState.statusesScreen.result.summaryResult.push(action.records[rowIndex]);
			}

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.LOAD_MORE_SUMMARY_RESULT:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.result = { ...newState.captainScreen.result };
			newState.captainScreen.result.summaryResult = [...newState.captainScreen.result.summaryResult];

			for (let rowIndex = 0; rowIndex < action.records.length; rowIndex++) {
				newState.captainScreen.result.summaryResult.push(action.records[rowIndex]);
			}

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.SET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };

			newState.ballotsScreen.loadingData = true;

			return newState;
			case ElectionsActions.ActionTypes.REPORTS.BALLOTS.LOADING_MORE_DATA_FLAG:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.loadingMoreData = true;
			return newState;
	
		case ElectionsActions.ActionTypes.REPORTS.STATUSES.RESET_SUMMARY_RESULT:
			var newState = { ...state };
			newState.statusesScreen = { ...newState.statusesScreen };
			newState.statusesScreen.result = { ...newState.statusesScreen.result };

			newState.statusesScreen.result = {...initialState.statusesScreen.result};

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.FIND_CLUSTER_LEADER_RESULT:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };

			let searchFields = { ...newState.clustersScreen.searchFields };
			let leaderData = action.leaderData;

			searchFields.first_name = '';
			searchFields.last_name = '';
			searchFields.personal_identity = '';
			newState.clustersScreen.notFoundClusterLeader = true;

			if (leaderData) {
				newState.clustersScreen.notFoundClusterLeader = false;
				searchFields.first_name = leaderData.leader_first_name;
				searchFields.last_name = leaderData.leader_last_name;
				searchFields.personal_identity = leaderData.leader_personal_identity;
                searchFields.leader_key = leaderData.leader_key;
			}
			newState.clustersScreen.searchFields = searchFields;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.CHANGE_LOADED_LEADER_FLAG:
            var newState = { ...state };
            newState.clustersScreen = { ...newState.clustersScreen };

            newState.clustersScreen.loadeLeader = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.CLUSTER_LEADER_SELECTED:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.notFoundClusterLeader = false;

			return newState;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.LOAD_SUMMARY_RESULT:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.searchFields = { ...newState.clustersScreen.searchFields };
			newState.clustersScreen.result = { ...newState.clustersScreen.result };

			let summaryResult = [];
			let resultArray = action.records;
			let index = 0;
			for (let id in resultArray) {
				resultArray[id].index = index;
				summaryResult.push(resultArray[id]);
				index++;
			}
			newState.clustersScreen.result.summaryResult = summaryResult;

			newState.clustersScreen.result.totalSummaryResults = action.total_records;

			newState.clustersScreen.searchFields.area_id = action.searchObj.area_id;
			newState.clustersScreen.searchFields.sub_area_id = action.searchObj.sub_area_id;
			newState.clustersScreen.searchFields.city_id = action.searchObj.city_id;
			newState.clustersScreen.searchFields.cluster_id = action.searchObj.cluster_id;
			newState.clustersScreen.searchFields.neighborhood_id = action.searchObj.neighborhood_id;

			newState.clustersScreen.searchFields.first_name = (action.searchObj.first_name == null) ? '' : action.searchObj.first_name;
			newState.clustersScreen.searchFields.last_name = (action.searchObj.last_name == null) ? '' : action.searchObj.last_name;
			newState.clustersScreen.searchFields.personal_identity = (action.searchObj.personal_identity == null) ? '' : action.searchObj.personal_identity;

			newState.clustersScreen.searchFields.selected_roles = action.searchObj.selected_roles;

			newState.clustersScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.UNSET_LOADING_DATA_FLAG:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };

			newState.ballotsScreen.loadingData = false;

			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.BALLOTS.CLEAN_ALL_DATA:
			var newState = { ...state };
			newState.ballotsScreen = { ...newState.ballotsScreen };
			newState.ballotsScreen.searchFields = { ...newState.ballotsScreen.searchFields };
			newState.ballotsScreen.searchFields.area_id = null;
			newState.ballotsScreen.searchFields.sub_area_id = null;
			newState.ballotsScreen.searchFields.city_id = null;
			newState.ballotsScreen.searchFields.neighborhood_id = null;
			newState.ballotsScreen.searchFields.cluster_id = null;
			newState.ballotsScreen.searchFields.ballot_id = null;
			newState.ballotsScreen.searchFields.support_status_id = null;
			newState.ballotsScreen.searchFields.summary_by_id = null;
			newState.ballotsScreen.searchFields.selected_campaigns = [];
			newState.ballotsScreen.searchFields.is_district_city = 0;
			newState.ballotsScreen.searchFields.is_ballot_strictly_orthodox = 0;
			newState.ballotsScreen.searchFields.display_num_of_votes = 0;
			newState.ballotsScreen.searchFields.display_vote_statistics = 0;
			newState.ballotsScreen.searchFields.display_statuses_statistics = 0;

			newState.ballotsScreen.searchFields.display_prev_votes_percents = 0;
			newState.ballotsScreen.searchFields.display_strictly_orthodox_percents = 0;
			newState.ballotsScreen.searchFields.display_sephardi_percents = 0;

			newState.ballotsScreen.result = { ...newState.ballotsScreen.result };
			newState.ballotsScreen.result.totalSummaryResults = 0;
			newState.ballotsScreen.resultsummaryResult = [];
			newState.ballotsScreen.resultrowOfTotalSums = {};

			newState.ballotsScreen.combos = { ...newState.ballotsScreen.combos };
			newState.ballotsScreen.combos.neighborhoods = [];
			newState.ballotsScreen.combos.clusters = [];
			newState.ballotsScreen.combos.ballots = [];
			newState.ballotsScreen.combos.supportStatuses = [];
			newState.ballotsScreen.combos.electionsCampaignsHash = {};
			newState.ballotsScreen.loadingMoreData = false;


			return newState;
			break;

		case ElectionsActions.ActionTypes.REPORTS.CLUSTERS.LOAD_MORE_SUMMARY_RESULT:
			var newState = { ...state };
			newState.clustersScreen = { ...newState.clustersScreen };
			newState.clustersScreen.result = { ...newState.clustersScreen.result };
			newState.clustersScreen.result.summaryResult = [...newState.clustersScreen.result.summaryResult];

			let lastIndex = newState.clustersScreen.result.summaryResult.length;
			let resultsArray = action.records;

			let rowIndex = 0;

			for (let id in resultsArray) {
				action.records[id].index = lastIndex + rowIndex;
				newState.clustersScreen.result.summaryResult.push(action.records[id]);
				rowIndex++;
			}

			return newState;

		case ElectionsActions.ActionTypes.REPORTS.CAPTAIN.RESET_SUMMARY_RESULT:
			var newState = { ...state };
			newState.captainScreen = { ...newState.captainScreen };
			newState.captainScreen.result = { ...newState.captainScreen.result };
			newState.captainScreen.result = {...initialState.captainScreen.result};
			return newState;
		/*
			General function to change field in   election daily walker report SEARCH screen :
			@param fieldName
			@param fieldValue
        */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };
			newState.reportsScreen.electionDayWalkerReport.searchScreen = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen };
			newState.reportsScreen.electionDayWalkerReport.searchScreen[action.fieldName] = action.fieldValue;

			return newState;
			break;
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.RESET_PAGINATION_DATA:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };
			let paginationList = ['tempNumberOfResultsPerPage', 'numberOfResultsPerPage', 'currentPage', 'reportSearchResults'];
			paginationList.forEach(function (key) {
				newState.reportsScreen.electionDayWalkerReport[key] = initial_electionDayWalkerReport[key];
			})
			return newState;

		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CLEAN_ALL_FILEDS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = initial_electionDayWalkerReport;
			let oldDetailsToSave = ['globalModalMessageHeader', 'globalModalMessageContent', 'showGlobalMessageModal', 'supportStatuses', 'dynamicStreets'];
			for (let key in oldDetailsToSave) {
				newState.reportsScreen.electionDayWalkerReport[key] = state.reportsScreen.electionDayWalkerReport[key];
			}

			return newState;

		/*
	Election daily report screen - handles showing/hiding global modal window dialog
	
	@param show - true/false
	@param modalHeader
	@param modalContent
*/
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.GENERAL_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalWalkerReport = { ...newState.reportsScreen.generalWalkerReport };
			newState.reportsScreen.generalWalkerReport[action.fieldName] = action.fieldValue;
			return newState;
		/**
		 * get result for the search screen
		 * -> over throw all the new ballotBox data:
		 * 1. add new ballotBox (by id) to the "ballotBoxesHash" table ( is not exist ).
		 * 2. append the voters to the "resultVotersList" array
		 * 
		 * @param action.data.ballotBoxsVotersData - new voters data from api
		 * -> only partly data (limit to 100 voters).
		 * @param action.isNewSearch - new search or not (if it new ,reset the old search data).
		 * @param  action.data.totalVotersCount - total ballotBox voters form api.
		 * 
		 * @return newState
		 * {
		 * 	ballotBoxesHash: (object) hash table of the ballotBox data, by the ballotBox id.
		 * 	resultVotersList:(array) all ballotBoxes voters in array.
		 * 	totalVotersCount: (int) total voters in all ballotBox.
		 * }
		 */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.GENERAL_REPORT.GET_SEARCH_RESULT:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			let generalWalkerReport = { ...newState.reportsScreen.generalWalkerReport };
			let data = action.data;
			let totalVotersCount = 0;
			let ballotBoxsVotersData = data.ballotbox_voters_data.sort(globalFunctions.arraySort('asc', 'id'));
			let ballotBoxesHash = {};
			let resultVotersList = [];

			if (!action.isNewSearch) { //if not a new search, take the current ballotBoxes and voters data.
				ballotBoxesHash = generalWalkerReport.ballotBoxesHash;
				resultVotersList = generalWalkerReport.resultVotersList;
			}
			for (let i = 0; i < ballotBoxsVotersData.length; i++) {
				let item = ballotBoxsVotersData[i];
				let id = item.id;
				if (!ballotBoxesHash.hasOwnProperty(id)) {
					let firstRowIndex = 0;
					for (let id in ballotBoxesHash) {
						firstRowIndex += ballotBoxesHash[id].voter_count;
					}
					item.firstBallotIndex = firstRowIndex;
					ballotBoxesHash[id] = item;
				} else {
					ballotBoxesHash[id].ballot_box_voters = ballotBoxesHash[id].ballot_box_voters.concat(item.ballot_box_voters); //for debug!!!
				}
				resultVotersList = resultVotersList.concat(item.ballot_box_voters)
			}
			generalWalkerReport.isNewSearch = action.isNewSearch;
			generalWalkerReport.totalVotersCount = data.total_voters_count;

			generalWalkerReport.ballotBoxesHash = ballotBoxesHash;
			generalWalkerReport.resultVotersList = resultVotersList;

			newState.reportsScreen.generalWalkerReport = generalWalkerReport;
			return newState;
		/**
		 * @param requestData
		 * search request data
		 * -> used to sent to api every time we need to load more voters.
		 */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.GENERAL_REPORT.SET_REQEST_DATA:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.generalWalkerReport = { ...newState.reportsScreen.generalWalkerReport };
			newState.reportsScreen.generalWalkerReport.cityName = action.cityName;
			newState.reportsScreen.generalWalkerReport.requestData = action.requestData;
			return newState;
		/*
  Election daily report screen - handles showing/hiding global modal window dialog
  	
  @param show - true/false
  @param modalHeader
  @param modalContent
  */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.SHOW_HIDE_GLOBAL_MODAL_DIALOG:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };
			newState.reportsScreen.electionDayWalkerReport.globalModalMessageHeader = action.modalHeader;
			newState.reportsScreen.electionDayWalkerReport.globalModalMessageContent = action.modalContent;
			newState.reportsScreen.electionDayWalkerReport.showGlobalMessageModal = action.show;
			return newState;
			break;

		/*
			Election daily report screen -General function to change field in modal of finding captain of fifty or cluster leader voter IN  captain fifty walker report SEARCH screen :
			
			@param fieldName
			@param fieldValue
        */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_MODAL_SEARCH_VOTER_IN_SEARCH_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };
			newState.reportsScreen.electionDayWalkerReport.searchScreen = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal[action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		 Election daily report screen -Handles cleaning search captain50-voter fields on closing of search modal dialog :
		*/
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CLEAN_SEARCH_CAPTAIN50_VOTER_MODAL_FIELDS:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };
			newState.reportsScreen.electionDayWalkerReport.searchScreen = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedCity = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedCluster = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.ministerFirstName = '';
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.ministerLastName = '';
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.clustersButtonDisabled = false;
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.caps50ButtonDisabled = false;
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.ministerID = '';
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.clusterLeaderFirstName = '';
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.clusterLeaderLastName = '';
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.clusterLeaderID = '';
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.clusters = [];
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters = [];
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedRowIndex = -1;
			return newState;
			break;

	    /*
            General function to change field in captain fifty walker report SEARCH screen :
			
			@param fieldName
			@param fieldValue
        */
		case ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CHANGE_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;


		/*
		 Support status combo box changes in one of 2 sets 
	  	
		  @param comboArrayName  - definedVoterSupportStatuses/actualVoterSupportStatuses
		  @param arrayIndex
		  @param arrayValue
	  */
		case ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.SUPPORT_STATUS_CHECKBOX_CHANGE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName] = [...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName]];
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName][action.arrayIndex] = action.arrayValue;
			return newState;
			break;

		/*
		   ALL Support statuses combo boxes changes in one of 2 sets 
			
			@param comboArrayName  - definedVoterSupportStatuses/actualVoterSupportStatuses
			@param allValue
        */
		case ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.SUPPORT_STATUS_CHECKBOXES_CHANGE_ALL:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName] = [...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName]];
			for (let key in newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName]) {
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen[action.comboArrayName][key] = action.allValue;
			}
			return newState;
			break;

		/*
          Update stats data counts in final stage screen
        */
		case ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.FINAL_STAGE_UPDATE_STATS_DATA:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.total_households_count_in_geo_entity = action.data.geographic_households_count;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.total_voters_count_in_geo_entity = action.data.geographic_voters_count;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selected_voters_count = action.data.selected_voters_count;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.total_households_count = action.data.selected_households_count;
			if (action.isExistingUpdate == true) {
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.updateName = action.data.name;

				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedFinalSupportStatus = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedFinalSupportStatus };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedFinalSupportStatus.selectedValue = action.data.final_support_status_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses };
				let returnedDefinedSupportStatuses = action.data.household_voters_inclusion_support_status_ids.split(',');
				for (let i = 0; i < returnedDefinedSupportStatuses.length - 1; i++) {
					if (parseInt(returnedDefinedSupportStatuses[i]) == -1) {
						newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses[newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses.length - 1] = true;
					}
					else {
						newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses[parseInt(returnedDefinedSupportStatuses[i]) - 1] = true;
					}
				}

				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses };
				let returnedActualSupportStatuses = action.data.voters_inclusion_support_status_ids.split(',');
				for (let i = 0; i < returnedActualSupportStatuses.length - 1; i++) {
					if (parseInt(returnedActualSupportStatuses[i]) == -1) {
						newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses[newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses.length - 1] = true;
					}
					else {
						newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses[parseInt(returnedActualSupportStatuses[i]) - 1] = true;
					}
				}

				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionEntityType = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedFinalSupportStatus };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionEntityType.selectedValue = action.data.support_status_type_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionEntityType.selectedItem = null;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionHouseholdsNumHouseholds = action.data.household_voters_inclusion_limit;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionHouseholdsWhereCondition = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionHouseholdsWhereCondition };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionHouseholdsWhereCondition.selectedValue = (parseInt(action.data.household_voters_inclusion_type) == 1 ? 'מעל' : 'עד');

				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedArea = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedArea };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedSubArea = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedSubArea };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCity = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCity };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedNeighborhood = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedNeighborhood };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCluster = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCluster };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedBallotBox = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedBallotBox };

				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedArea.selectedValue = action.data.area_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedSubArea.selectedValue = action.data.sub_area_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCity.selectedValue = action.data.city_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedNeighborhood.selectedValue = action.data.neighborhood_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCluster.selectedValue = action.data.cluster_name;
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedBallotBox.selectedValue = action.data.ballotbox_name;

			}
			return newState;
			break;


		/*
		  function that gets specific row from updates list t , 
		  and selects/unselects it : 
		*/
		case ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.SUPPORT_STATUS_UPDATE_ROW_SELECTED:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList = [...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList];
			for (let i in newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList) {
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList[i] = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList[i] };
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList[i].isSelected = false; // first , unselect all rows
			}
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.usersJobsList[action.selectedRowIdx].isSelected = true; // then select the correct row
			return newState;
			break;

		/*
		  clean all stages data
		*/
		case ElectionsActions.ActionTypes.HOUSE_STATUS_CHANGE_SERVICE.CLEAN_STAGES_DATA:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen = { ...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.clusters = [];
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.neighborhoods = [];
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.ballotBoxes = [];
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedArea = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedSubArea = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedNeighborhood = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.updateName = '';
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionHouseholdsWhereCondition = { selectedValue: 'מעל  (גדול שווה)', selectedItem: { id: 1, name: 'מעל  (גדול שווה)', key: 'at_least' } };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionHouseholdsNumHouseholds = 1;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedDefinitionEntityType = { selectedValue: 'סניף', selectedItem: { id: 0, name: 'סניף', key: 'branch' } };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses = [...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses];
			for (let i = 0; i < newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses.length; i++) {
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.definedVoterSupportStatuses[i] = false;
			}

			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses = [...newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses];
			for (let i = 0; i < newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses.length; i++) {
				newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.actualVoterSupportStatuses[i] = false;
			}
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selectedFinalSupportStatus = { selectedValue: '', selectedItem: null };
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.total_voters_count_in_geo_entity = -1;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.total_households_count_in_geo_entity = -1;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.selected_voters_count = -1;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.total_households_count = -1;
			newState.reportsScreen.houseHouseholdStatusChangeScreen.searchScreen.currentStageNumber = 1;
			return newState;
			break;
		/*
			  Election daily report screen -In search results of captain-50-voter or cluster leader voter - selecting specific row , and unselecting other rows :
	 	
			 @param rowIndex
		 */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.SET_VOTER_SEARCH_RESULT_ROW_SELECTED:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };
			newState.reportsScreen.electionDayWalkerReport.searchScreen = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal };
			newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters = [...newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters];
			for (let i = 0; i < newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters.length; i++) {
				newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i] = { ...newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i] };
				if (i == action.rowIndex) {
					newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.selectedRowIndex = action.rowIndex;
					newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i].isSelected = true;
				}
				else {
					newState.reportsScreen.electionDayWalkerReport.searchScreen.searchCaptainFiftyVoterModal.foundVoters[i].isSelected = false;
				}
			}
			return newState;
			break;

		/*
			General function to change general field in election day walker report screen :
			
			@param fieldName
			@param fieldValue
        */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.CHANGE_GLOBAL_REPORT_FIELD_VALUE:
			var newState = { ...state };
			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };

			newState.reportsScreen.electionDayWalkerReport[action.fieldName] = action.fieldValue;

			return newState;
			break;
		/**
		 *  Handles search results of election-day-walker -> for Captian50.
		 *  @param voters_list -> voters array to display in view
		 *  @param items_hash -> ballotboxes hash table
		 *  - counters for ballotboxes voters and households.
		 * 	@param isNewSearch -> If is new search - reset will reset current search data
		 * 
		 */
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.LOADED_ELECTION_DAY_WALKER_SEARCH_RESULTS.CAPTAIN_VOTERS: //split between first load data to load more data.
			var newState = { ...state };

			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };

			let voterCaptainList = action.voters_list;
			let captainsHash = action.items_hash;

			let searchcaptainFullResults = [];
			let captainsFullResultHash = {};
			if (action.isNewSearch) {
				newState.reportsScreen.electionDayWalkerReport.totalSearchResultsCount = action.total_voters_count;
			} else {
				if (newState.reportsScreen.electionDayWalkerReport.reportSearchResults != undefined) {
					searchcaptainFullResults = [...newState.reportsScreen.electionDayWalkerReport.reportSearchResults];
				}
				captainsFullResultHash = { ...newState.reportsScreen.electionDayWalkerReport.captainsFullResultHash };
			}
			for (let id in captainsHash) {
				if (!captainsFullResultHash.hasOwnProperty(id)) { captainsFullResultHash[id] = captainsHash[id]; }
			}
			newState.reportsScreen.electionDayWalkerReport.reportSearchResults = searchcaptainFullResults.concat(voterCaptainList);
			newState.reportsScreen.electionDayWalkerReport.captainsFullResultHash = captainsFullResultHash;
			return newState;

		/**
		 *	Handles search results of election-day-walker -> for ballotboxes.
		 *  @param voters_list -> voters array to display in view
		 *  @param items_hash -> ballotboxes hash table
		 *  - counters for ballotboxes voters and households.
		 * 	@param isNewSearch -> If is new search - reset will reset current search data
		 * 
		 */
			
		case ElectionsActions.ActionTypes.REPORTS.WALKERS.ELECTION_DAILY_REPORT.LOADED_ELECTION_DAY_WALKER_SEARCH_RESULTS.BALLOTS: //split between first load data to load more data.
			var newState = { ...state };

			newState.reportsScreen = { ...newState.reportsScreen };
			newState.reportsScreen.electionDayWalkerReport = { ...newState.reportsScreen.electionDayWalkerReport };

			let voterList = action.voters_list;
			let ballotsHash = action.items_hash;

			let searchFullResults = [];
			let ballotsFullResultHash = {};
			if (action.isNewSearch) {
				newState.reportsScreen.electionDayWalkerReport.totalSearchResultsCount = action.total_voters_count;
			} else {
				if (newState.reportsScreen.electionDayWalkerReport.reportSearchResults != undefined) {
					searchFullResults = [...newState.reportsScreen.electionDayWalkerReport.reportSearchResults];
				}
				ballotsFullResultHash = { ...newState.reportsScreen.electionDayWalkerReport.ballotsFullResultHash };
			}

			for (let id in ballotsHash) {
				if (!ballotsFullResultHash.hasOwnProperty(id)) { ballotsFullResultHash[id] = ballotsHash[id]; }
			}
			newState.reportsScreen.electionDayWalkerReport.reportSearchResults = searchFullResults.concat(voterList);
			newState.reportsScreen.electionDayWalkerReport.ballotsFullResultHash = ballotsFullResultHash;
			return newState;
		/*
		Module : Form1000 search-screen
		Function : change any param-value inside searchscreen by param-name
		Params : fieldName , fieldValue
		Author : Pnina Alon
		*/
		case ElectionsActions.ActionTypes.FORM1000.SEARCH_SCREEN_ITEM_VALUE_CHANGE:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchScreen = { ...newState.form1000Screen.searchScreen };
			newState.form1000Screen.searchScreen[action.fieldName] = action.fieldValue;
			return newState;
		case ElectionsActions.ActionTypes.FORM1000.UPDATE_BALLOTS_LIST:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchScreen = { ...newState.form1000Screen.searchScreen };
			newState.form1000Screen.searchScreen.ballotBoxes = action.ballots;
			return newState;
		case ElectionsActions.ActionTypes.FORM1000.UPDATE_CLUSTERS_LIST:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchScreen = { ...newState.form1000Screen.searchScreen };
			newState.form1000Screen.searchScreen.clusters = action.clusters;
			return newState;
		/*
		Module : Form1000 search-results-screen
		Function : change any param-value inside search-results screen by param-name
		Params : fieldName , fieldValue
		Author : Pnina Alon
		*/
		case ElectionsActions.ActionTypes.FORM1000.SEARCH_RESULTS_SCREEN_ITEM_VALUE_CHANGE:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchResults = { ...newState.form1000Screen.searchResults };
			newState.form1000Screen.searchResults[action.fieldName] = action.fieldValue;
			return newState;
			break;


		/*
		 Module : Form1000 search-results-screen
		 Function : revert voter's vote status into true/false (by default they false)
		 Params : voterIndex
		 Author : Pnina Alon
		 */
		case ElectionsActions.ActionTypes.FORM1000.VOTER_RESULTS_VOTER_REVERT_VOTE_STATUS:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchResults = { ...newState.form1000Screen.searchResults };
			newState.form1000Screen.searchResults.ballotbox_voters_array = [...newState.form1000Screen.searchResults.ballotbox_voters_array];
			newState.form1000Screen.searchResults.ballotbox_voters_array[action.voterIndex] = { ...newState.form1000Screen.searchResults.ballotbox_voters_array[action.voterIndex] }
			if (newState.form1000Screen.searchResults.ballotbox_voters_array[action.voterIndex].temporaryVoted == true) {
				newState.form1000Screen.searchResults.ballotbox_voters_array[action.voterIndex].temporaryVoted = false;
			}
			else {
				newState.form1000Screen.searchResults.ballotbox_voters_array[action.voterIndex].temporaryVoted = true;
			}
			return newState;
			break;

		/*
		Module : Form1000 global error message modal window
		Function : set error message to show/hide + title + content
		Params : displayErrorMessage,modalErrorTitle,modalErrorContent
		Author : Pnina Alon
		*/
		case ElectionsActions.ActionTypes.FORM1000.SET_ERROR_MODAL_WINDOW_PARAMS:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.errorModalScreen = { ...newState.form1000Screen.errorModalScreen };
			newState.form1000Screen.errorModalScreen.displayErrorMessage = action.displayErrorMessage;
			newState.form1000Screen.errorModalScreen.displayErrorMessage = action.displayErrorMessage;
			newState.form1000Screen.errorModalScreen.modalErrorTitle = action.modalErrorTitle;
			newState.form1000Screen.errorModalScreen.modalErrorContent = action.modalErrorContent;
			return newState;
			break;

		/*
		Module : Form1000 search screen
		Function : set default params of cleaned search sceen
		Params : -
		Author : Pnina Alon
		*/
		case ElectionsActions.ActionTypes.FORM1000.CLEAN_SEARCH_SCREEN:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchScreen = { ...newState.form1000Screen.searchScreen };
			newState.form1000Screen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
			newState.form1000Screen.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
			newState.form1000Screen.searchScreen.selectedBallotbox = { selectedValue: '', selectedItem: null };
			newState.form1000Screen.searchScreen.clusters = [];
			newState.form1000Screen.searchScreen.ballotBoxes = [];
			newState.form1000Screen.searchScreen.showSearchResults = false;
			newState.form1000Screen.searchScreen.isLoadingSearchResults = false;
			return newState;
			break;

		/*
		Module : Form1000 results screen
		Function : set default params of cleaned results sceen
		Params : -
		Author : Pnina Alon
		*/
		case ElectionsActions.ActionTypes.FORM1000.CLEAN_RESULTS_SCREEN:
			var newState = { ...state };
			newState.form1000Screen = { ...newState.form1000Screen };
			newState.form1000Screen.searchResults = { ...newState.form1000Screen.searchResults };
			newState.form1000Screen.searchResults.city_name = '';
			newState.form1000Screen.searchResults.cluster_name = '';
			newState.form1000Screen.searchResults.cluster_address = '';
			newState.form1000Screen.searchResults.textBoxVoterSerialNumber = '';
			newState.form1000Screen.searchResults.role_shifts = [];
			newState.form1000Screen.searchResults.last_vote_date = '';
			newState.form1000Screen.searchResults.last_vote_voter = '';
			newState.form1000Screen.searchResults.isSavingData = false;
			newState.form1000Screen.searchResults.ballotbox_voters_array = [];
			newState.form1000Screen.searchResults.voted_support_status_percentage = 0;

			return newState;
			break;

		/*
			Pre-elections-day dashboard screen  - update value of item inside specific screen
			@param screenName
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME:
			var newState = { ...state };
			newState.preElectionsDashboard = { ...newState.preElectionsDashboard };
			newState.preElectionsDashboard[action.screenName] = { ...newState.preElectionsDashboard[action.screenName] };
			newState.preElectionsDashboard[action.screenName][action.fieldName] = action.fieldValue;
			return newState;
			break;

		/*
		Elections-day dashboard screen  - update value of item inside specific screen
		@param screenName
		@param fieldName
		@param fieldValue
	*/
		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME:
			var newState = { ...state };
			newState.electionsDashboard = { ...newState.electionsDashboard };
			newState.electionsDashboard[action.screenName] = { ...newState.electionsDashboard[action.screenName] };
			newState.electionsDashboard[action.screenName][action.fieldName] = action.fieldValue;
			return newState;
			break;
		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.RESET_ALL_DATA:
			var newState = { ...state };
			newState.electionsDashboard = { ...initialState.electionsDashboard };
			newState.electionsDashboard.generalPredictedVotesPercents = state.electionsDashboard.generalPredictedVotesPercents;
			newState.electionsDashboard.VoteElectionsHours = state.electionsDashboard.VoteElectionsHours;

			return newState;
		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.REFRESH_ALL_DATA:
			var newState = { ...state };
			newState.electionsDashboard = { ...initialState.electionsDashboard };
			newState.electionsDashboard.generalPredictedVotesPercents = state.electionsDashboard.generalPredictedVotesPercents;
			newState.electionsDashboard.VoteElectionsHours = state.electionsDashboard.VoteElectionsHours;
			newState.electionsDashboard.searchScreen = { ...state.electionsDashboard.searchScreen };

			newState.electionsDashboard.searchEntityType = state.electionsDashboard.searchEntityType;
			newState.electionsDashboard.searchEntityKey = state.electionsDashboard.searchEntityKey;
			newState.electionsDashboard.currentTabNumber = state.electionsDashboard.currentTabNumber;
			newState.electionsDashboard.displayAllCountry = state.electionsDashboard.displayAllCountry;

			newState.electionsDashboard.areaId = state.electionsDashboard.areaId;
			newState.electionsDashboard.cityId = state.electionsDashboard.cityId;
			newState.electionsDashboard.neighborhoodId = state.electionsDashboard.neighborhoodId;
			newState.electionsDashboard.clusterId = state.electionsDashboard.clusterId;

			return newState;
		/*
			Elections-day dashboard screen - global screen (not subscreens)  - update inner geo array by entity type , entity key , fieldName , fieldValue
			 
		*/
	   /*
			Elections-day dashboard screen - global screen (not subscreens)  - update value of item inside specific screen
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GLOBAL_VALUE_BY_NAME:
			var newState = { ...state };
			newState.electionsDashboard = {...newState.electionsDashboard};
			newState.electionsDashboard[action.fieldName] = action.fieldValue;
			return newState;

		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CREATE_AREA_CITIES_HASH_TABLE:
			var newState = { ...state };
			newState.electionsDashboard = { ...newState.electionsDashboard };

			const newGeneralAreasHashTable = { ...newState.electionsDashboard.generalAreasHashTable };
			newGeneralAreasHashTable.areas = { ...newState.electionsDashboard.generalAreasHashTable.areas };
			newGeneralAreasHashTable.subAreas = { ...newState.electionsDashboard.generalAreasHashTable.subAreas };
			newGeneralAreasHashTable.cities = { ...newState.electionsDashboard.generalAreasHashTable.cities };
			

			action.generalCountryAreasStats.forEach(function (areaData) {
				let areaSubAreasKeys = [];
				let areaSubAreasIds = [];
				newGeneralAreasHashTable.areas[areaData.id] = {
					id: areaData.id,
					key: areaData.key,
					name: areaData.name,
					entity_type: geographicEntityTypes.area,
					citiesCount: areaData.cities.length,
					childrens: [],
					childrensKeys: []
				}
				//Set no sub area cities:
				if(areaData.name != 'ערים ש"ס'){  //!! Todo need to fix this sub area 
					let noParentId = areaData.id + '_0';
					let noSubAreaCitiesObj = {
						id: noParentId,
						key: noParentId,
						cities: areaData.cities,
						name: 'ללא אזור',
						parent_id: areaData.id,
						parent_key: areaData.key,
					};
					areaData.sub_area.push(noSubAreaCitiesObj);
				}


				areaData.sub_area.forEach(function (subAreaData) {
					areaSubAreasKeys.push(subAreaData.key);
					areaSubAreasIds.push(subAreaData.id);

					let subareaCitiesKeys = [];
					let subareaCitiesIds = [];
					newGeneralAreasHashTable.subAreas[subAreaData.id] = {
						id: subAreaData.id,
						key: subAreaData.key,
						name: subAreaData.name,
						entity_type: geographicEntityTypes.subArea,
						parent_id: areaData.id,
						parent_key: areaData.key,
						noClusters: false,
						childrens: [],
						childrensKeys: []
					};
					subAreaData.cities.forEach(function (cityData) {
						subareaCitiesKeys.push(cityData.key);
						subareaCitiesIds.push(cityData.id);
						newGeneralAreasHashTable.cities[cityData.id] = {
							id: cityData.id,
							key: cityData.key,
							name: cityData.name,
							entity_type: geographicEntityTypes.city,
							parent_id: subAreaData.id,
							parent_key: subAreaData.key,
							noClusters: false,
							childrens: [],
							childrensKeys: []
						};
					});
					newGeneralAreasHashTable.subAreas[subAreaData.id].childrens = subareaCitiesIds;
					newGeneralAreasHashTable.subAreas[subAreaData.id].childrensKeys = subareaCitiesKeys;
				});
				newGeneralAreasHashTable.areas[areaData.id].childrens = areaSubAreasIds;
				newGeneralAreasHashTable.areas[areaData.id].childrensKeys = areaSubAreasKeys;
				
			});
			newState.electionsDashboard.generalAreasHashTable = newGeneralAreasHashTable;
			newState.electionsDashboard.allCountryDataLoaded = true;
			return newState;
			break;

		/*
			Elections-day dashboard screen - global screen (not subscreens)  - update inner geo array by entity type , entity key , fieldName , fieldValue
			 
		*/

		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_CITY_SUB_ENTITIES:
			var newState = { ...state };
			newState.electionsDashboard = { ...newState.electionsDashboard };
			const currentGeneralAreasHashTable = { ...newState.electionsDashboard.generalAreasHashTable }
			currentGeneralAreasHashTable.cities = { ...newState.electionsDashboard.generalAreasHashTable.cities };
			currentGeneralAreasHashTable.neighborhoods = { ...newState.electionsDashboard.generalAreasHashTable.neighborhoods };
			currentGeneralAreasHashTable.clusters = { ...newState.electionsDashboard.generalAreasHashTable.clusters };
			currentGeneralAreasHashTable.ballotBoxes = { ...newState.electionsDashboard.generalAreasHashTable.ballotBoxes };

			let actionCityId = action.cityId;

			let cityNeighborhoodsKeys = [];
			let cityNeighborhoodsIds = [];

			if (currentGeneralAreasHashTable.cities[actionCityId]) {
				if(action.subEntities.length == 0 ){
					currentGeneralAreasHashTable.cities[actionCityId].noClusters = true;
					return;
				}
				let cityKey = currentGeneralAreasHashTable.cities[actionCityId].key;
				//Add city neighborhoods to hash:
				action.subEntities.forEach(function (neighborhoodData) {
					let neighborhoodId = neighborhoodData.id;
					cityNeighborhoodsKeys.push(neighborhoodData.key);
					cityNeighborhoodsIds.push(neighborhoodId);
					let neighborhoodsClustersKeys = [];
					let neighborhoodsClustersIds = [];

					//Add neighborhood clusters hash:

					neighborhoodData.clusters.forEach(function (clusterData) {
						let clusterId = clusterData.id;
						let clusterKey = clusterData.key;

						neighborhoodsClustersKeys.push(clusterKey);
						neighborhoodsClustersIds.push(clusterId);

						let clusterBallotsKeys = [];
						let clusterBallotsIds = [];

						//Add cluster ballotBoxes to hash:
						clusterData.ballot_boxes.forEach(function (ballotData) {
							clusterBallotsIds.push(ballotData.id)
							clusterBallotsKeys.push(ballotData.key)
							currentGeneralAreasHashTable.ballotBoxes[ballotData.id] = {
								id: ballotData.id,
								key: ballotData.key,
								name: ballotData.name,
								entity_type: geographicEntityTypes.ballotBox,
								parent_id: ballotData.cluster_id,
								parent_key: clusterKey,
							};
						});
						
						currentGeneralAreasHashTable.clusters[clusterId] = {
							id: clusterId,
							key: clusterKey,
							name: clusterData.name,
							entity_type:geographicEntityTypes.cluster,
							parent_id: neighborhoodId,
							parent_key: neighborhoodData.key,
							childrensKeys : clusterBallotsKeys,
							childrens : clusterBallotsIds
						};
					});

					currentGeneralAreasHashTable.neighborhoods[neighborhoodId] = {
						id: neighborhoodId,
						key: neighborhoodData.key,
						name: neighborhoodData.name,
						entity_type: geographicEntityTypes.neighborhood,
						parent_id: actionCityId,
						parent_key: cityKey,
						childrens: neighborhoodsClustersIds,
						childrensKeys: neighborhoodsClustersKeys
					}
				});
				currentGeneralAreasHashTable.cities[actionCityId] = { ...currentGeneralAreasHashTable.cities[actionCityId] }
				currentGeneralAreasHashTable.cities[actionCityId].childrens = cityNeighborhoodsIds
				currentGeneralAreasHashTable.cities[actionCityId].childrensKeys = cityNeighborhoodsKeys
			}
			newState.electionsDashboard.generalAreasHashTable = currentGeneralAreasHashTable;
			return newState;
			break;

		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.SET_GEO_ENTITY_FIELD_VALUE:
			var newState = { ...state };
			let entityType = action.entityType;
			let entityId = action.entityId;
	
			newState.electionsDashboard = { ...newState.electionsDashboard };
			const generalAreasHashTable = { ...newState.electionsDashboard.generalAreasHashTable };

			if (Object.keys(generalAreasHashTable.areas).length == 0) { return newState; } //After reset all results

			switch (entityType) {
				case geographicEntityTypes.area:
					if (entityId != undefined && generalAreasHashTable.areas[entityId]) {
						generalAreasHashTable.areas[entityId] = { ...generalAreasHashTable.areas[entityId] };
						generalAreasHashTable.areas[entityId][action.fieldName] = action.fieldValue;
					}
					break;
				case geographicEntityTypes.subArea:
					if (entityId != undefined && generalAreasHashTable.subAreas[entityId]) {
						generalAreasHashTable.subAreas[entityId] = { ...generalAreasHashTable.subAreas[entityId] };
						generalAreasHashTable.subAreas[entityId][action.fieldName] = action.fieldValue;
					}
					break;
				case geographicEntityTypes.city:
					if (entityId != undefined && generalAreasHashTable.cities[entityId] ) {
						generalAreasHashTable.cities[entityId] = { ...generalAreasHashTable.cities[entityId] };
						generalAreasHashTable.cities[entityId][action.fieldName] = action.fieldValue;
					}
					break;
				case geographicEntityTypes.neighborhood:
					if (entityId != undefined && generalAreasHashTable.neighborhoods[entityId] ) {
						generalAreasHashTable.neighborhoods[entityId] = { ...generalAreasHashTable.neighborhoods[entityId] };

						generalAreasHashTable.neighborhoods[entityId][action.fieldName] = action.fieldValue;
					}
				case geographicEntityTypes.cluster:
					if (entityId != undefined && generalAreasHashTable.clusters[entityId] ) {
						generalAreasHashTable.clusters[entityId] = { ...generalAreasHashTable.clusters[entityId] };
						generalAreasHashTable.clusters[entityId][action.fieldName] = action.fieldValue;
					}
					break;
				case geographicEntityTypes.ballotBox:
					if (entityId != undefined && generalAreasHashTable.ballotBoxes[entityId] ) {
						generalAreasHashTable.ballotBoxes[entityId] = { ...generalAreasHashTable.ballotBoxes[entityId] };
						generalAreasHashTable.ballotBoxes[entityId][action.fieldName] = action.fieldValue;
					}
					break;
			}
			newState.electionsDashboard.generalAreasHashTable = generalAreasHashTable;
			return newState;
			break;


		/*
		reset found results for new search operation
		*/
		case ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.RESET_FOUND_VALUES:
			var newState = { ...state };
			newState.preElectionsDashboard = { ...newState.preElectionsDashboard };
			newState.preElectionsDashboard.searchScreen = { ...newState.preElectionsDashboard.searchScreen };
			newState.preElectionsDashboard.searchScreen.totalVoters = -1;
			newState.preElectionsDashboard.searchScreen.totalHouseholds = -1;

			newState.preElectionsDashboard.speedometerScreen = { ...newState.preElectionsDashboard.speedometerScreen };
			newState.preElectionsDashboard.speedometerScreen.totalSupporters = -1;
			newState.preElectionsDashboard.speedometerScreen.totalPotential = -1;
			newState.preElectionsDashboard.speedometerScreen.previousVotesCount = -1;
			newState.preElectionsDashboard.speedometerScreen.previousSupportersCount = -1;

			newState.preElectionsDashboard.measureSupportScreen = { ...newState.preElectionsDashboard.measureSupportScreen };
			newState.preElectionsDashboard.measureSupportScreen.selectedSupportStatusType = { selectedValue: 'סטטוס סניף', selectedItem: { id: '0', name: 'סטטוס סניף' } };
			newState.preElectionsDashboard.measureSupportScreen.selectedTimePeriod = { selectedValue: '30 ימים', selectedItem: { id: '7', name: '30 ימים', system_name: '30_days' } };
			newState.preElectionsDashboard.measureSupportScreen.resultsArray = null;

			newState.preElectionsDashboard.votersDistributionBySupportStatusScreen = { ...newState.preElectionsDashboard.votersDistributionBySupportStatusScreen };
			newState.preElectionsDashboard.votersDistributionBySupportStatusScreen.resultDataObject = null;

			newState.preElectionsDashboard.officialsRolesScreen = { ...newState.preElectionsDashboard.officialsRolesScreen };
			newState.preElectionsDashboard.officialsRolesScreen.resultDataObject = null;

			newState.preElectionsDashboard.transportationsScreenScreen = { ...newState.preElectionsDashboard.transportationsScreenScreen };
			newState.preElectionsDashboard.transportationsScreenScreen.resultDataObject = null;


			newState.preElectionsDashboard.supportsComparisonScreen = { ...newState.preElectionsDashboard.supportsComparisonScreen };
			newState.preElectionsDashboard.supportsComparisonScreen.resultDataObject = null;


			return newState;
			break;

		/*
			Pre-elections-day dashboard screen  - clean by param type
			@param cleanFromFilter
			@param withComboes
		*/
		case ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE:
			var newState = { ...state };
			newState.preElectionsDashboard = { ...newState.preElectionsDashboard };
			newState.preElectionsDashboard.searchScreen = { ...newState.preElectionsDashboard.searchScreen };
			if (action.cleanFromFilter == 'all') {
				newState.preElectionsDashboard.searchScreen.selectedArea = { selectedValue: '', selectedItem: null };
			}
			if (action.cleanFromFilter == 'all' || action.cleanFromFilter == 'area' || action.cleanFromFilter == 'subarea' || action.cleanFromFilter == 'city') {
				newState.preElectionsDashboard.searchScreen.selectedNeighborhood = { selectedValue: '', selectedItem: null };
				newState.preElectionsDashboard.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
				newState.preElectionsDashboard.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
				if (action.withComboes == true) {
					newState.preElectionsDashboard.searchScreen.ballotBoxes = [];
				}
			}
			switch (action.cleanFromFilter) {
				case 'area':
				case 'all':
					newState.preElectionsDashboard.searchScreen.selectedSubArea = { selectedValue: '', selectedItem: null };
					newState.preElectionsDashboard.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
					break;
				case 'subarea':
					newState.preElectionsDashboard.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
					break;
				case 'neighborhood':

					newState.preElectionsDashboard.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
					newState.preElectionsDashboard.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
					break;
				case 'cluster':
					newState.preElectionsDashboard.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
					break;

			}
			return newState;
			break;


		/*
			Elections-day dashboard screen  - clean by param type
			@param cleanFromFilter
			@param withComboes
		*/
		case ElectionsActions.ActionTypes.ELECTIONS_DASHBOARD.CLEAN_FROM_FILTER_TYPE:
			var newState = { ...state };
			newState.electionsDashboard = { ...newState.electionsDashboard };
			newState.electionsDashboard.searchScreen = { ...newState.electionsDashboard.searchScreen };

			let detailsToReset = [];
			if (action.cleanFromFilter != 'ballot' && action.withComboes == true) {
				newState.electionsDashboard.searchScreen.ballotBoxes = [];
			}
			switch (action.cleanFromFilter) {
				case 'all':
					newState.electionsDashboard.searchScreen = { ...initialState.electionsDashboard.searchScreen };
					break;
				case 'area':
					detailsToReset = ['selectedArea', 'selectedSubArea', 'selectedCity', 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox'];
					break;
				case 'subarea':
					detailsToReset = ['selectedSubArea', 'selectedCity', 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox'];
					break;
				case 'city':
					detailsToReset = ['selectedCity', 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox'];
					break;
				case 'neighborhood':
					detailsToReset = [ 'selectedNeighborhood', 'selectedCluster', 'selectedBallotBox'];
					break;
				case 'cluster':
					detailsToReset = ['selectedCluster', 'selectedBallotBox'];
					break;
				case 'ballot':
					detailsToReset = ['selectedBallotBox'];
					break;

			}
			detailsToReset.forEach(function(itemName){
				newState.electionsDashboard.searchScreen[itemName] = { ...initialState.electionsDashboard.searchScreen[itemName] }
			});
			return newState;
			break;


		/*
			Pre-elections-day areas panel screen ::: change param of area by its index , paramName and paramValue
			@param areaIndex
			@param paramName
			@param paramValue
		*/
		case ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.AREAS_PANEL_SET_AREA_PARAM:
			var newState = { ...state };
			newState.preElectionsDashboard = { ...newState.preElectionsDashboard };
			newState.preElectionsDashboard.areasPanel = { ...newState.preElectionsDashboard.areasPanel };

			if (newState.preElectionsDashboard.areasPanel.areasCitiesStats) {

				newState.preElectionsDashboard.areasPanel.areasCitiesStats = [...newState.preElectionsDashboard.areasPanel.areasCitiesStats];
				newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex] = { ...newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex] };
				newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex][action.paramName] = action.paramValue;
			}
			return newState;
			break;

		case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_CSV_SOURCES:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
    		newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.csvSources = action.csvSources;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_SUPPORT_STATUSES:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.supportStatuses = action.supportStatuses;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_INSTITUTES:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.institutes = action.institutes;

            return newState;
            break;

		case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_INSTITUTE_ROLES:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.instituteRoles = action.instituteRoles;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_ETHNIC_GROUPS:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.ethnicGroups = action.ethnicGroups;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_RELIGIOUS_GROUPS:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.religiousGroups = action.religiousGroups;

            return newState;
            break;
			
		case ElectionsActions.ActionTypes.VOTERS_MANUAL.CHANGE_FILED_VALUE_BY_NAME:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.RESET_STREETS:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.streets = [];

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.LOAD_STREETS:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.combos = {...newState.votersManualScreen.combos};

            newState.votersManualScreen.combos.streets = action.streets;

            return newState;
            break;

		case ElectionsActions.ActionTypes.VOTERS_MANUAL.DATA_SOURCE.CHANGE_LOADED_VOTER_FLAG:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.data_source = {...newState.votersManualScreen.data_source};

            newState.votersManualScreen.data_source.loadedVoter = action.loadedVoter;

            return newState;
            break;

		case ElectionsActions.ActionTypes.VOTERS_MANUAL.DATA_SOURCE.RESET_VOTER:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.data_source = {...newState.votersManualScreen.data_source};
            newState.votersManualScreen.data_source.voter = {...newState.votersManualScreen.data_source.voter};

            newState.votersManualScreen.data_source.voter = {};

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.DATA_SOURCE.LOAD_VOTER:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.data_source = {...newState.votersManualScreen.data_source};
            newState.votersManualScreen.data_source.voter = {...newState.votersManualScreen.data_source.voter};

            newState.votersManualScreen.data_source.voter = {
                id: action.voter.id,
                key: action.voter.key,
                persoanl_identity: action.voter.persoanl_identity,
                first_name: action.voter.first_name,
                last_name: action.voter.last_name
			};

            return newState;
            break;

		case ElectionsActions.ActionTypes.VOTERS_MANUAL.DATA_SOURCE.CLEAN_DATA_SOURCE:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.data_source = {...newState.votersManualScreen.data_source};

            newState.votersManualScreen.data_source = {...initialState.voterSourceModal.dataSource};

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.CHANGE_LOADED_VOTER_FLAG:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.secondTab = {...newState.votersManualScreen.secondTab};

            newState.votersManualScreen.secondTab.loadedVoter = action.loadedVoter;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.RESET_VOTER:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.secondTab = {...newState.votersManualScreen.secondTab};
            newState.votersManualScreen.secondTab.voter = {...newState.votersManualScreen.secondTab.voter};

            newState.votersManualScreen.secondTab.voter = {};

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.LOAD_VOTER:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.secondTab = {...newState.votersManualScreen.secondTab};
            newState.votersManualScreen.secondTab.voter = {...newState.votersManualScreen.secondTab.voter};

            newState.votersManualScreen.secondTab.voter = action.voter;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.CLEAN_DATA_SOURCE:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.secondTab = {...newState.votersManualScreen.secondTab};

            newState.votersManualScreen.secondTab = {...initialState.voterSourceModal.secondTab};

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.CHANGE_LOADED_SELECTED_VOTER_FLAG:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.secondTab = {...newState.votersManualScreen.secondTab};

            newState.votersManualScreen.secondTab.loadedSelectedVoter = action.loadedSelectedVoter;

            return newState;
            break;

        case ElectionsActions.ActionTypes.VOTERS_MANUAL.SECOND_TAB.LOAD_SELECTED_VOTER:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};
            newState.votersManualScreen.secondTab = {...newState.votersManualScreen.secondTab};
            let newSelectedVoter = {...newState.votersManualScreen.secondTab.selectedVoter};
		  
            newSelectedVoter = action.voter;
		
            newSelectedVoter.collapsed = true;
            newSelectedVoter.valid = true;

            if ( newSelectedVoter.support_status_name == null) {
                newSelectedVoter.support_status_name = '';
			}
 
            let crippleId = null;
            let crippleName = '';
            if ( newSelectedVoter.cripple == null  ) {
                crippleId = -1;
                crippleName = 'ללא הסעה';
            } else {
                crippleId = newSelectedVoter.cripple;
                crippleName = newSelectedVoter.cripple == 0 ? 'הסעה רגילה' : 'הסעת נכה';
            }
				
            newSelectedVoter.newFieldsValues = {
                valid: true,
                city: {id: newSelectedVoter.city_id,
                    name: newSelectedVoter.city_name},
                actual_address_correct: newSelectedVoter.actual_address_correct,

                cripple: {id: crippleId, name: crippleName} , 
				institute:{id:(action.voter.institute ? action.voter.institute.id : null) , name:(action.voter.institute ? action.voter.institute.name : "")},
				institute_role:{id:(action.voter.institute_role ? action.voter.institute_role.id : null) , name:(action.voter.institute_role? action.voter.institute_role.name : "")},
				religious_group : { id : action.voter.religious_group_id, name :action.voter.religious_group_name || '' },
				ethnic_group : { id : action.voter.ethnic_group_id, name :action.voter.ethnic_group_name|| ''},
				sephardi :  { id : action.voter.sephardi, name :action.voter.sephardi == 1 ? 'כן' : 'לא' }
			};
			if(action.voter.sephardi == null){
				newSelectedVoter.newFieldsValues.sephardi.name = '';	
			}
			let textFields = [
				'email',
				'main_voter_phone_id',

                'house',
				'house_entry',
				'flat',
				'zip'
			];

            for ( let textFieldIndex = 0; textFieldIndex < textFields.length; textFieldIndex++ ) {
            	let fieldName = textFields[textFieldIndex];

                if (newSelectedVoter[fieldName] == null) {
                    newSelectedVoter.newFieldsValues[fieldName] = '';
				} else {
                    newSelectedVoter.newFieldsValues[fieldName] = newSelectedVoter[fieldName];
				}
			};
		
            if (newSelectedVoter.from_time == null) {
                newSelectedVoter.newFieldsValues.from_time = '';
			} else {
                newSelectedVoter.newFieldsValues.from_time = newSelectedVoter.from_time.substr(0, 5);
			}

            if (newSelectedVoter.to_time == null) {
                newSelectedVoter.newFieldsValues.to_time = '';
            } else {
                newSelectedVoter.newFieldsValues.to_time = newSelectedVoter.to_time.substr(0, 5);
            }
			
			
            newSelectedVoter.newFieldsValues.street = {
				id: newSelectedVoter.street_id,
				name: (newSelectedVoter.street_name != null ? newSelectedVoter.street_name : '')
			};
		 
            newSelectedVoter.newFieldsValues.phone1 = {
            	id: null,
				key: null,
				phone_number: '',
				voterPhoneIndex: null
			};
			 
			
            newSelectedVoter.newFieldsValues.phone2 = {
                id: null,
                key: null,
                phone_number: '',
                voterPhoneIndex: null
            };
	 
            newSelectedVoter.newFieldsValues.mainPhone = null;
			newState.votersManualScreen.secondTab.selectedVoter  = newSelectedVoter;

            return newState;
            break;

		case ElectionsActions.ActionTypes.VOTERS_MANUAL.CHANGE_SAVED_SELECTED_VOTER_FLAG:
            var newState = { ...state };
            newState.votersManualScreen = {...newState.votersManualScreen};

            newState.votersManualScreen.savedSelectedVotersFlag = action.savedSelectedVotersFlag;

            return newState;
            break;
			
		/*
			Pre-elections-day areas panel screen ::: change param of city by its index , paramName and paramValue
			@param areaIndex
			@param cityIndex
			@param paramName
			@param paramValue
		*/
		case ElectionsActions.ActionTypes.PRE_ELECTIONS_DASHBOARD.AREAS_PANEL_SET_CITY_PARAM:
			var newState = { ...state };
			newState.preElectionsDashboard = { ...newState.preElectionsDashboard };
			newState.preElectionsDashboard.areasPanel = { ...newState.preElectionsDashboard.areasPanel };

			if (newState.preElectionsDashboard.areasPanel.areasCitiesStats) {

				newState.preElectionsDashboard.areasPanel.areasCitiesStats = [...newState.preElectionsDashboard.areasPanel.areasCitiesStats];
				newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex] = { ...newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex] };
				newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex].cities = [...newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex].cities];
				newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex].cities[action.cityIndex] = { ...newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex].cities[action.cityIndex] };

				newState.preElectionsDashboard.areasPanel.areasCitiesStats[action.areaIndex].cities[action.cityIndex][action.paramName] = action.paramValue;

			}
			return newState;
			break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.LOAD_ELECTIONS_CAMPAIGNS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.combos = { ...newState.electionsCampaignsScreen.combos };

            newState.electionsCampaignsScreen.combos.electionsCampaigns = action.campaigns;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.LOAD_CURRENT_CAMPAIGN:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };

            newState.electionsCampaignsScreen.currentCampaign = action.currentCampaign;

            return newState;
			break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.LOAD_SUPPORT_STATUSES:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.combos = { ...newState.electionsCampaignsScreen.combos };

            newState.electionsCampaignsScreen.combos.supportStatuses = action.supportStatuses;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.SUPPORT_STATUS.LOAD_PREVIOUS_SUPPORT_STATUS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.supportStatus = { ...newState.electionsCampaignsScreen.supportStatus };

            newState.electionsCampaignsScreen.supportStatus.previousSupportStatus = action.supportStatus;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.EDIT_SUPPORT_STATUS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.combos = { ...newState.electionsCampaignsScreen.combos };
            newState.electionsCampaignsScreen.combos.supportStatuses = [...newState.electionsCampaignsScreen.combos.supportStatuses];

            let supportStatusIndex = newState.electionsCampaignsScreen.combos.supportStatuses.findIndex(item => item.key == action.supportStatusKey);
            if ( supportStatusIndex > -1 ) {
                newState.electionsCampaignsScreen.combos.supportStatuses[supportStatusIndex] = {...newState.electionsCampaignsScreen.combos.supportStatuses[supportStatusIndex]};
                newState.electionsCampaignsScreen.combos.supportStatuses[supportStatusIndex].active = action.active;
			}

            return newState;
            break;
			
		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.CHANGE_FIELD_VALUE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen[action.fieldName] = action.fieldValue;
            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.CHANGE_LOADED_CAMPAIGN_FLAG:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };

            newState.electionsCampaignsScreen.loadedCampaignDetailsFlag = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.LOAD_ELECTION_CAMPAIGN_DETAILS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.campaignDetails = {...newState.electionsCampaignsScreen.campaignDetails};

            newState.electionsCampaignsScreen.campaignDetails.id = action.campaign.id;
			newState.electionsCampaignsScreen.campaignDetails.key = action.campaign.key;
            newState.electionsCampaignsScreen.campaignDetails.name =  action.campaign.name;
            newState.electionsCampaignsScreen.campaignDetails.type =  action.campaign.type;
            newState.electionsCampaignsScreen.campaignDetails.start_date = action.campaign.start_date;
            newState.electionsCampaignsScreen.campaignDetails.end_date = action.campaign.end_date;
            newState.electionsCampaignsScreen.campaignDetails.election_date = action.campaign.election_date;
            newState.electionsCampaignsScreen.campaignDetails.vote_start_time = action.campaign.vote_start_time;
            newState.electionsCampaignsScreen.campaignDetails.vote_end_time = action.campaign.vote_end_time;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.EDIT_ELECTION_CAMPAIGN_DETAILS:
			debugger
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.campaignDetails = {...newState.electionsCampaignsScreen.campaignDetails};

            newState.electionsCampaignsScreen.campaignDetails.election_date = action.campaign.election_date;
            newState.electionsCampaignsScreen.campaignDetails.vote_start_time = DateActionHelper.getTime(action.campaign.vote_start_time,true);
            newState.electionsCampaignsScreen.campaignDetails.vote_end_time = DateActionHelper.getTime(action.campaign.vote_end_time,true);
			newState.electionsCampaignsScreen.campaignDetails.start_date = action.campaign.start_date;
			newState.electionsCampaignsScreen.campaignDetails.end_date = action.campaign.end_date;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PROGRESS_BAR.CHANGE_LOADING_FLAG:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.progressBar = {...newState.electionsCampaignsScreen.progressBar};

            newState.electionsCampaignsScreen.progressBar.loading = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PROGRESS_BAR.UPDATE_PERCENTS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.progressBar = {...newState.electionsCampaignsScreen.progressBar};

            newState.electionsCampaignsScreen.progressBar.percents = action.percents;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PROGRESS_BAR.CHANGE_LOADED_FLAG:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.progressBar = {...newState.electionsCampaignsScreen.progressBar};

            newState.electionsCampaignsScreen.progressBar.loaded = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PROGRESS_BAR.RESET_PROGRESS_BAR:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.progressBar = {...newState.electionsCampaignsScreen.progressBar};

            newState.electionsCampaignsScreen.progressBar = initialState.electionsCampaignsScreen.progressBar;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.VOTER_BOOKS.LOAD_VOTER_BOOKS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };

            newState.electionsCampaignsScreen.voterBooks = action.voterBooks;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.VOTER_BOOKS.LOAD_VOTER_BOOK:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.voterBooks = [...newState.electionsCampaignsScreen.voterBooks];

            let voterBookIndex = newState.electionsCampaignsScreen.voterBooks.findIndex(item => item.id == action.voterBook.id);
            if (voterBookIndex > -1) {
                newState.electionsCampaignsScreen.voterBooks[voterBookIndex] = {...newState.electionsCampaignsScreen.voterBooks[voterBookIndex]};

                newState.electionsCampaignsScreen.voterBooks[voterBookIndex].row_count = action.voterBook.row_count;
                newState.electionsCampaignsScreen.voterBooks[voterBookIndex].current_row = action.voterBook.current_row;
                newState.electionsCampaignsScreen.voterBooks[voterBookIndex].voter_count = action.voterBook.voter_count;
                newState.electionsCampaignsScreen.voterBooks[voterBookIndex].new_voter_count = action.voterBook.new_voter_count;
                newState.electionsCampaignsScreen.voterBooks[voterBookIndex].status = action.voterBook.status;
			}

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_BUDGET_FILES:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.budget = { ...newState.electionsCampaignsScreen.budget };

            newState.electionsCampaignsScreen.budget.files = action.budgetFiles;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_ELECTION_ROLES: //!! to delete?
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.budget = { ...newState.electionsCampaignsScreen.budget };

            newState.electionsCampaignsScreen.budget.electionRoles = action.electionRoles;

            return newState;
            break;
		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_ELECTION_ROLES_SHIFTS: 
			var newState = { ...state };
			newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
			newState.electionsCampaignsScreen.budget = { ...newState.electionsCampaignsScreen.budget };

			let electionRolesShiftsBudgets = action.electionRolesShiftsBudgets;
			let electionRolesShiftsHash = {};
			electionRolesShiftsBudgets.forEach((roleShiftBudget) => {
				let electionRoleId = roleShiftBudget.election_role_id;
				if(!electionRolesShiftsHash[electionRoleId]){
					electionRolesShiftsHash[electionRoleId] = []
				}
				electionRolesShiftsHash[electionRoleId].push(roleShiftBudget);
			})
			newState.electionsCampaignsScreen.budget.electionRolesShiftsHash = electionRolesShiftsHash;
		return newState;
        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.LOAD_CURRENT_ELECTION_ROLES_SHIFTS: 
            var newState = { ...state };
            newState.activistsScreen = { ...newState.activistsScreen };
			newState.activistsScreen.electionRolesShiftsBudgets = action.electionRolesShiftsBudgets;

            return newState;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.CHANGE_EDITED_ROLE_FLAG:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.budget = { ...newState.electionsCampaignsScreen.budget };

            newState.electionsCampaignsScreen.budget.editedRoleFlag = action.flag;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BUDGET.EDIT_ROLE_BUDGET:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.budget = { ...newState.electionsCampaignsScreen.budget };
            let currentElectionRolesShiftsHash = {...newState.electionsCampaignsScreen.budget.electionRolesShiftsHash};
			let subRolesShiftsArray = currentElectionRolesShiftsHash[action.electionRoleId]
			if(subRolesShiftsArray){
				let electionRoleIndex = subRolesShiftsArray.findIndex(item => item.key == action.roleShiftKey);
				if ( electionRoleIndex > -1 ) {
					subRolesShiftsArray[electionRoleIndex] = { ...subRolesShiftsArray[electionRoleIndex]};
					subRolesShiftsArray[electionRoleIndex].budget = action.budget;
				}
				newState.electionsCampaignsScreen.budget.electionRolesShiftsHash[action.electionRoleId] = subRolesShiftsArray
			}

            return newState;
            break;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.VOTE_FILES.LOAD_VOTE_FILES:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };

            newState.electionsCampaignsScreen.voteFiles = action.voteFiles;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.VOTE_FILES.LOAD_VOTE_FILE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.voteFiles = [...newState.electionsCampaignsScreen.voteFiles];

            let voteFileIndex = newState.electionsCampaignsScreen.voteFiles.findIndex(item => item.id == action.voteFile.id);
            if (voteFileIndex > -1) {
                newState.electionsCampaignsScreen.voteFiles[voteFileIndex] = {...newState.electionsCampaignsScreen.voteFiles[voteFileIndex]};

                newState.electionsCampaignsScreen.voteFiles[voteFileIndex].row_count = action.voteFile.row_count;
                newState.electionsCampaignsScreen.voteFiles[voteFileIndex].current_row = action.voteFile.current_row;
                newState.electionsCampaignsScreen.voteFiles[voteFileIndex].status = action.voteFile.status;
            }

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PERCENTS.LOAD_PREDICTED_PERCENTS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.percents = {...newState.electionsCampaignsScreen.percents};

            newState.electionsCampaignsScreen.percents.campaignVotesPercents = action.campaignVotesPercents;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.PERCENTS.CHANGE_LOADED_PERCENTS_FLAG:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.percents = {...newState.electionsCampaignsScreen.percents};

            newState.electionsCampaignsScreen.percents.loadedPercentsFlag = action.flag;

            return newState;
            break;

        case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BALLOT_BOXES.FILES.LOAD_BALLOT_BOXES_FILES:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.ballots = {...newState.electionsCampaignsScreen.ballots};

            newState.electionsCampaignsScreen.ballots.ballotBoxesFiles = action.ballotBoxesFiles;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BALLOT_BOXES.FILES.LOAD_BALLOT_BOX_FILE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.ballots = {...newState.electionsCampaignsScreen.ballots};
            newState.electionsCampaignsScreen.ballots.ballotBoxesFiles = [...newState.electionsCampaignsScreen.ballots.ballotBoxesFiles];

            let ballotBoxFileIndex = newState.electionsCampaignsScreen.ballots.ballotBoxesFiles.findIndex(item => item.id == action.ballotBoxFile.id);
            if (ballotBoxFileIndex > -1) {
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex] = {...newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex]};

                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex].row_count = action.ballotBoxFile.row_count;
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex].current_row = action.ballotBoxFile.current_row;
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex].status = action.ballotBoxFile.status;
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex].ballot_boxes_count = action.ballotBoxFile.ballot_boxes_count;
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex].new_clusters_count = action.ballotBoxFile.new_clusters_count;
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[ballotBoxFileIndex].clusters_update_count = action.ballotBoxFile.clusters_update_count;
            }

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.SUPPORT_STATUS_UPDATE.LOAD_SUPPORT_STATUS_UPDATES:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.supportStatusUpdates = {...newState.electionsCampaignsScreen.supportStatusUpdates};

            newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates = action.supportStatusUpdates;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.SUPPORT_STATUS_UPDATE.EDIT_SUPPORT_STATUS_UPDATE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.supportStatusUpdates = {...newState.electionsCampaignsScreen.supportStatusUpdates};
            newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates = [...newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates];

            supportStatusUpdateIndex = newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates.findIndex(item => item.key == action.updateKey);
            if ( supportStatusUpdateIndex > -1 ) {
                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex] = {... newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex]};
                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex].status = constants.electionCampaigns.supportStatusUpdate.Statuses.cancelled;
			}

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.SUPPORT_STATUS_UPDATE.LOAD_SUPPORT_STATUS:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.supportStatusUpdates = {...newState.electionsCampaignsScreen.supportStatusUpdates};

            newState.electionsCampaignsScreen.supportStatusUpdates.supportStatus = {...newState.electionsCampaignsScreen.supportStatusUpdates.supportStatus};
            newState.electionsCampaignsScreen.supportStatusUpdates.supportStatus[action.campaignKey] = action.supportStatus;

            return newState;
            break;

		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.VOTER_BOOKS.EDIT_SUPPORT_STATUS_UPDATE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.voterBooks = [...newState.electionsCampaignsScreen.voterBooks];
            

            let voterBookUpdateIndex = newState.electionsCampaignsScreen.voterBooks.findIndex(item => item.key == action.updateKey);
            if ( voterBookUpdateIndex > -1 ) {
                newState.electionsCampaignsScreen.voterBooks[voterBookUpdateIndex] = {... newState.electionsCampaignsScreen.voterBooks[voterBookUpdateIndex]};
                newState.electionsCampaignsScreen.voterBooks[voterBookUpdateIndex].status = constants.voterBookParserStatus.cancelled;
			}

            return newState;
            break;
			
		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.VOTE_FILES.EDIT_VOTE_FILE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.voteFiles = [...newState.electionsCampaignsScreen.voteFiles];
            

            let voteFileIndexEdit = newState.electionsCampaignsScreen.voteFiles.findIndex(item => item.key == action.updateKey);
            if ( voteFileIndexEdit > -1 ) {
                newState.electionsCampaignsScreen.voteFiles[voteFileIndexEdit] = {... newState.electionsCampaignsScreen.voteFiles[voteFileIndexEdit]};
                newState.electionsCampaignsScreen.voteFiles[voteFileIndexEdit].status = constants.voteFileParserStatus.cancelled;
			}

            return newState;
            break;
			
		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.BALLOT_BOXES.FILES.EDIT_BALLOT_BOX_FILE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.ballots = {...newState.electionsCampaignsScreen.ballots};
            newState.electionsCampaignsScreen.ballots.ballotBoxesFiles = [...newState.electionsCampaignsScreen.ballots.ballotBoxesFiles];
            

            let itemIndex = newState.electionsCampaignsScreen.ballots.ballotBoxesFiles.findIndex(item => item.key == action.itemKey);
            if ( itemIndex > -1 ) {
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[itemIndex] = {...newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[itemIndex]};
                newState.electionsCampaignsScreen.ballots.ballotBoxesFiles[itemIndex].status = constants.ballotBoxFileParserStatus.cancelled;
			}

            return newState;
            break;
			
		case ElectionsActions.ActionTypes.ELECTIONS_CAMPAIGNS.SUPPORT_STATUS_UPDATE.GET_SUPPORT_STATUS_UPDATE:
            var newState = { ...state };
            newState.electionsCampaignsScreen = { ...newState.electionsCampaignsScreen };
            newState.electionsCampaignsScreen.supportStatusUpdates = {...newState.electionsCampaignsScreen.supportStatusUpdates};
            newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates = [...newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates];

            supportStatusUpdateIndex = newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates.findIndex(item => item.key == action.supportStatusUpdate.key);
            if ( supportStatusUpdateIndex > -1 ) {
                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex] = {... newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex]};

                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex].status = action.supportStatusUpdate.status;
                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex].total_voters_count = action.supportStatusUpdate.total_voters_count;
                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex].total_voters_processed = action.supportStatusUpdate.total_voters_processed;
                newState.electionsCampaignsScreen.supportStatusUpdates.supportStatusUpdates[supportStatusUpdateIndex].updated_voters_count = action.supportStatusUpdate.updated_voters_count;
			}

            return newState;
            break;

		/* TRANSPORTATIONS ACTIONS */
	case ElectionsActions.ActionTypes.TRANSPORTATIONS.SET_LOADING_DATA_FLAG:
	var newState = { ...state };
	newState.transportationsScreen = { ...newState.transportationsScreen };
	newState.transportationsScreen.isLoading = action.bool;
	return newState;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.GET_SEARCH_RESULT:
		var newState = { ...state };
		newState.transportationsScreen = { ...newState.transportationsScreen };
		let votersTransportations = [];
		if (action.isNewSearch) {
			newState.transportationsScreen.transportationsCountByFilters = action.data.transportations_count;
		}else{
			votersTransportations = newState.transportationsScreen.votersTransportations;
		}
		
		votersTransportations = votersTransportations.concat(action.data.transportations)
		newState.transportationsScreen.votersTransportations = votersTransportations;
		newState.transportationsScreen.isNewSearch = action.isNewSearch;
		newState.transportationsScreen.isLoading = false;
		return newState;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.CITY_DATA:
		var newState = { ...state };
		newState.transportationsScreen = { ...newState.transportationsScreen };
		let cityData = action.data;
		cityData.searchCityKey = action.cityKey;
		newState.transportationsScreen.totalVotersCount = cityData.transportations_count.not_has_driver_count + cityData.transportations_count.has_driver_count;
		cityData.drivers.forEach(function (driver, i) {
			cityData.drivers[i].name = driver.first_name + ' ' + driver.last_name;
		});
		newState.transportationsScreen.cityData = cityData;
		return newState;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.CLUSTERS_DATA.CHANGE_LOADED_FLAG:
		var newState = { ...state };
		newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.clustersData = { ...newState.transportationsScreen.clustersData };

        newState.transportationsScreen.clustersData.isLoaded = action.flag;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.CLUSTERS_DATA.CHANGE_LOADING_FLAG:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.clustersData = { ...newState.transportationsScreen.clustersData };

        newState.transportationsScreen.clustersData.isLoading = action.flag;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.CLUSTERS_DATA.RESET_CLUSTERS_DATA:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.clustersData = { ...newState.transportationsScreen.clustersData };

        newState.transportationsScreen.clustersData.clusters = [];
        newState.transportationsScreen.clustersData.searchClusterKey = null;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.CLUSTERS_DATA.LOAD_CLUSTERS_DATA:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.clustersData = { ...newState.transportationsScreen.clustersData };

        newState.transportationsScreen.clustersData.searchClusterKey = action.requestData.cluster_key;
        newState.transportationsScreen.clustersData.clusters = action.clusters;
        newState.transportationsScreen.clustersData.isLoaded = true;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.DRIVERS_DATA.CHANGE_LOADED_FLAG:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.driversData = { ...newState.transportationsScreen.driversData };

        newState.transportationsScreen.driversData.isLoaded = action.flag;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.DRIVERS_DATA.CHANGE_LOADING_FLAG:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.driversData = { ...newState.transportationsScreen.driversData };

        newState.transportationsScreen.driversData.isLoading = action.flag;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.DRIVERS_DATA.RESET_DRIVERS_DATA:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.driversData = { ...newState.transportationsScreen.driversData };

        newState.transportationsScreen.driversData.drivers = [];
        newState.transportationsScreen.driversData.searchClusterKey = null;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.DRIVERS_DATA.LOAD_DRIVERS_DATA:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        newState.transportationsScreen.driversData = { ...newState.transportationsScreen.driversData };

        newState.transportationsScreen.driversData.searchClusterKey = action.requestData.cluster_key;
        newState.transportationsScreen.driversData.drivers = action.drivers;
        newState.transportationsScreen.driversData.isLoaded = true;

        return newState;
        break;

	case ElectionsActions.ActionTypes.TRANSPORTATIONS.UPDATE_ROWS_DATA:
        var newState = { ...state };
        newState.transportationsScreen = { ...newState.transportationsScreen };
        votersTransportations = [ ...newState.transportationsScreen.votersTransportations ];

        switch(action.action){
            case 'delete_transport':
                action.rowsSelectedIndexList.forEach(function (rowIndex) {
                    votersTransportations.splice(rowIndex, 1);
                });
                break;
            case 'unbind_driver':
                action.rowsSelectedIndexList.forEach(function (rowIndex) {
                    votersTransportations[rowIndex].voter_driver_id = null;
                    votersTransportations[rowIndex].driver_first_name = null;
                    votersTransportations[rowIndex].driver_last_name = null;
                    votersTransportations[rowIndex].driver_phone_number = null;
                });
                break;
            case 'mark_as_executed':
                action.rowsSelectedIndexList.forEach(function (rowIndex) {
                    votersTransportations[rowIndex].executed = true;
                });
                break;
        }
        newState.transportationsScreen.votersTransportations = votersTransportations;
        return newState;

		case ElectionsActions.ActionTypes.TRANSPORTATIONS.UPDATE_ROW_DATA:
			var newState = { ...state }; 
			newState.transportationsScreen = { ...newState.transportationsScreen };
			votersTransportations = [...newState.transportationsScreen.votersTransportations ];
			let rowData = { ...votersTransportations[action.index] };
			if (!action.dataObjectToUpdate) {
				rowData[action.param] = action.value;
			} else {
				for(let param in action.dataObjectToUpdate){
					rowData[param]=	action.dataObjectToUpdate[param];
				}
			}
			newState.transportationsScreen.votersTransportations[action.index] = rowData;
			return newState;
		case ElectionsActions.ActionTypes.TRANSPORTATIONS.SHOW_HIDE_GLOBAL_MODAL_DIALOG:
			var newState = { ...state };
			newState.transportationsScreen = { ...newState.transportationsScreen };
			newState.transportationsScreen['display' + action.modalName + 'Modal'] = action.show;
			return newState;
		case ElectionsActions.ActionTypes.TRANSPORTATIONS.LOAD_MODAL_CLUSTERS:
			var newState = { ...state };
			newState.transportationsScreen = { ...newState.transportationsScreen };
			newState.transportationsScreen.driversModal = { ...newState.transportationsScreen.driversModal };
			newState.transportationsScreen.driversModal.clusters = action.clusters;
			return newState;
		case ElectionsActions.ActionTypes.TRANSPORTATIONS.SEARCH_DRIVERS_RESULTS:
			var newState = { ...state };
			newState.transportationsScreen = { ...newState.transportationsScreen };
			newState.transportationsScreen.driversModal = { ...newState.transportationsScreen.driversModal };
			newState.transportationsScreen.driversModal.drivers = action.drivers;
			return newState;
			break;
	   case ElectionsActions.ActionTypes.TRANSPORTATIONS.SET_DRIVERS_LOADING_SEARCH_RESULT:
			var newState = { ...state };
			newState.transportationsScreen = { ...newState.transportationsScreen };
			newState.transportationsScreen.driversModal = { ...newState.transportationsScreen.driversModal };
			newState.transportationsScreen.driversModal.loadingResults = action.data;
			return newState;
			break;
			
		/*
			In voters dashboard screen this will chane field value by field name
		*/	
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_VALUE_BY_NAME:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen[action.fieldName] = action.fieldValue;
			return newState;
			break;

					
		/*
			In enrolled voters screen on paging - it will load more data to array
		*/	
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.LOAD_MORE_ENROLLED_ACTIVISTS:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen.enrolledData = { ...newState.votesDashboardScreen.enrolledData };
			newState.votesDashboardScreen.enrolledData.activists_list = [ ...newState.votesDashboardScreen.enrolledData.activists_list ];
			for (let i = 0; i < action.data.length; i++) {
				newState.votesDashboardScreen.enrolledData.activists_list.push(action.data[i]);
			}
			return newState;
			break;
			
			
		/*
			In missed voters screen on paging - it will load more data to array
		*/	
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.LOAD_MORE_MISSED_ACTIVISTS:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen.missedData = { ...newState.votesDashboardScreen.missedData };
			newState.votesDashboardScreen.missedData.activists_list = [ ...newState.votesDashboardScreen.missedData.activists_list ];
			for (let i = 0; i < action.data.length; i++) {
				newState.votesDashboardScreen.missedData.activists_list.push(action.data[i]);
			}
			return newState;
			break;
			
		/*
			In unverified voters screen on paging - it will load more data to array
		*/	
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.LOAD_MORE_UNVERIFIED_ACTIVISTS:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen.unverifiedData = { ...newState.votesDashboardScreen.unverifiedData };
			newState.votesDashboardScreen.unverifiedData.activists_list = [ ...newState.votesDashboardScreen.unverifiedData.activists_list ];
			for (let i = 0; i < action.data.length; i++) {
				newState.votesDashboardScreen.unverifiedData.activists_list.push(action.data[i]);
			}
			return newState;
			break;
			
		/*
			Votes dashboard screen  - update value of item inside specific screen
			@param screenName
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.SET_SUBSCREEN_VALUE_BY_NAME:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen[action.screenName] = { ...newState.votesDashboardScreen[action.screenName] };
			newState.votesDashboardScreen[action.screenName][action.fieldName] = action.fieldValue;
			return newState;
			break;
			
		/*
			Votes dashboard screen  - reset found results for new search operation
		*/
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.RESET_FOUND_VALUES:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen.mainScreenData = {};
			newState.votesDashboardScreen.enrolledData = {} ;
			newState.votesDashboardScreen.wrongData = {} ;
			newState.votesDashboardScreen.missedData = {} ;
			newState.votesDashboardScreen.unverifiedData = {} ;
			newState.votesDashboardScreen.loadingMoreActivists=false;
			newState.votesDashboardScreen.loadingMoreMissedActivists=false;
			newState.votesDashboardScreen.loadingMoreUnverifiedActivists=false;
			newState.votesDashboardScreen.checkedRoleTypeIndex = -1 ; 
			newState.votesDashboardScreen.checkedFirstShift=0;
			newState.votesDashboardScreen.checkedSecondShift=0;
			newState.votesDashboardScreen.checkedAllShifts=0;
			newState.votesDashboardScreen.checkedCountShift=0;
			newState.votesDashboardScreen.enrolledActivistsFilterName='';
			newState.votesDashboardScreen.wrongActivistsFilterName='';
			if(action.cleanSearchScreen == true){
				newState.votesDashboardScreen.entityType=null;
				newState.votesDashboardScreen.entityKey=null;
			
				newState.votesDashboardScreen.searchScreen= {
					showAllSearchResults: false,
					stillLoadingResults: false,
					selectedTeam: { selectedValue: '', selectedItem: null },
					selectedArea: { selectedValue: '', selectedItem: null },
					selectedSubArea: { selectedValue: '', selectedItem: null },
					selectedCity: { selectedValue: '', selectedItem: null },
					selectedNeighborhood: { selectedValue: '', selectedItem: null },
					selectedCluster: { selectedValue: '', selectedItem: null },
					selectedBallotBox: { selectedValue: '', selectedItem: null },
					cities: [],
					ballotBoxes: [],
				};
			}
			return newState;
			break;
			
			
		/*
			Votes dashboard screen    - clean by param type
			@param cleanFromFilter
			@param withComboes
		*/
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.CLEAN_FROM_FILTER_TYPE:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen.searchScreen = { ...newState.votesDashboardScreen.searchScreen };
			if (action.cleanFromFilter == 'all') {
				newState.votesDashboardScreen.searchScreen.selectedArea = { selectedValue: '', selectedItem: null };
			}
			if (action.cleanFromFilter == 'all' || action.cleanFromFilter == 'area' || action.cleanFromFilter == 'subarea' || action.cleanFromFilter == 'city') {
				newState.votesDashboardScreen.searchScreen.selectedNeighborhood = { selectedValue: '', selectedItem: null };
				newState.votesDashboardScreen.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
				newState.votesDashboardScreen.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
				if (action.withComboes == true) {
					newState.votesDashboardScreen.searchScreen.ballotBoxes = [];
				}
			}
			switch (action.cleanFromFilter) {
				case 'area':
				case 'all':
					newState.votesDashboardScreen.searchScreen.selectedSubArea = { selectedValue: '', selectedItem: null };
					newState.votesDashboardScreen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
					break;
				case 'subarea':
					newState.votesDashboardScreen.searchScreen.selectedCity = { selectedValue: '', selectedItem: null };
					break;
				case 'neighborhood':

					newState.votesDashboardScreen.searchScreen.selectedCluster = { selectedValue: '', selectedItem: null };
					newState.votesDashboardScreen.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
					break;
				case 'cluster':
					newState.votesDashboardScreen.searchScreen.selectedBallotBox = { selectedValue: '', selectedItem: null };
					break;

			}
			return newState;
			break;

		/*
			Votes dashboard screen  - update value of item inside specific array by index and fieldName
			@param arrayName
			@param arrayIndex
			@param fieldName
			@param fieldValue
		*/
		case ElectionsActions.ActionTypes.VOTES_DASHBOARD.UPDATE_SUBSCREEN_ARRAY_VALUE_BY_INDEX:
			var newState = { ...state };
			newState.votesDashboardScreen = { ...newState.votesDashboardScreen };
			newState.votesDashboardScreen[action.arrayName] = { ...newState.votesDashboardScreen[action.arrayName] };
			newState.votesDashboardScreen[action.arrayName].activists_list = [...newState.votesDashboardScreen[action.arrayName].activists_list ];
			newState.votesDashboardScreen[action.arrayName].activists_list[action.arrayIndex] = {...newState.votesDashboardScreen[action.arrayName].activists_list[action.arrayIndex]};
			newState.votesDashboardScreen[action.arrayName].activists_list[action.arrayIndex][action.fieldName] = action.fieldValue;
			return newState;
			break;

		case ElectionsActions.ActionTypes.ACTIVIST.MODAL_UPDATE_ALLOCATION.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY:
            var newState = {...state};
            newState.activistsScreen = {...newState.activistsScreen};
            newState.activistsScreen.modalUpdateAllocationError = {...newState.activistsScreen.modalUpdateAllocationError};

            newState.activistsScreen.modalUpdateAllocationError.displayError = action.displayError;
            newState.activistsScreen.modalUpdateAllocationError.errorMessage = action.errorMessage || '';

            return newState;
            break;

		default:
			return state;

	}
}


export default electionsReducer;