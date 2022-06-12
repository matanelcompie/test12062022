module.exports = {
  email_max_length: 254,

  request_action_type_transfer: 1,
  request_action_type_close: 2,
  request_action_type_cancel: 3,
  // request status
  request_status_type_new: 1,
  request_status_type_process: 2,
  request_status_type_closed: 3,
  request_status_type_canceled: 4,

  birth_date_types: {
      year: 0,
      month: 1,
      date: 2
  },

groups_permission_types : {
  none : 0 , 
  geographic : 1 , 
  team : 2 , 
  user : 3
} ,

  // values for initialView and finalView
  // attributes of datePicker
  datePickerViews: {
      month: "month",
      year: "year",
      decade: "decade",
      century: "century"
  },

  gender: {
      male: 1,
      female: 2
  },
  generalReportTypes : {
      DETAILED: 'detailed',
      COMBINED: 'combined',
  SAVED: 'saved'
  },
  combineDisplayBy:{
      VOTERS:'voters',
      HOUSEHOLDS:'households'        
  },

  geographicEntityTypes: {
      areaGroup: -1,
      area: 0,
      city: 1,
      neighborhood: 2,
      cluster: 3,
      ballotBox: 4,
      subArea: 5,
      quarter: 6,
  },

  activists: {
      verifyStatus: {
          noMessageSent: 0,
          messageSent: 1,
          verified: 2,
          refused: 3,
          moreInfo: 4
      },
      verifyBankStatuses: {
        allDetailsCompleted: 0,
        notAllDetailsCompleted: 1,
        bankDetailsMissing: 2,
        VerifyDocumentMissing: 3,
        bankNotVerified: 4,
        bankNotUpdated: 5,
    },
      verifiedStatusTitle: {
          noMessageSent: 'טרם נשלחה הודעה',
          messageSent: 'נשלחה הודעה',
          verified: 'מאומת',
          refused: 'מסרב',
          moreInfo: 'לבירור נוסף'
      },

      electionRolesAdditions: {
          none: -1,
          all: 0 , 
          multi:-2,
          shas:-3,
          kneset:-4
      },

      allocationsTabs: {
          allocationDetails: 'allocationDetails',
          householdAllocation: 'householdAllocation',
          allocatedHouseholds: 'allocatedHouseholds',
          clusterAllocation: 'clusterAllocation',
          ballotAllocation: 'ballotAllocation',
          driverClusterAllocation: 'driverClusterAllocation'
      },

      roleShiftsSytemNames: {
          first: 'first',
          second: 'second',
          allDay: 'all_day',
          count: 'count',
          secondAndCount: 'second_and_count',
          allDayAndCount: 'all_day_and_count'
      },
      roleShiftsSystemIds: {
          first: 1,
          second: 2,
          allDay: 3,
          count: 4,
          secondAndCount: 5,
          allDayAndCount: 6
      },

      ballotRoleType: {
          ballotMember: 0,
          observer: 1,
          counter: 2
      },

      maxRecoredsFromDb: 100,

      ballotAssignmentStatus: {
    all:-1,
          noAssignment: 0,
          noOrPartialAssignment: 1,
          partialAssignment: 2,
          firstShiftAssignmet: 3,
          secondShiftAssignmet: 4,
          assignedWithoutCount: 5,
          fullAssignment: 6,
      },

      messageDirections: {
          out: 0,
          in: 1
      },

      driverCarTypes: {
          regular: 0,
          crippled: 1
      },

      verificationMessageText: 'שלום [first_name], שובצת לתפקיד [role_name] כפעיל בחירות. יש להשיב כן לאישור, או לא להסרה',
      verificationMessageTextIvr: 'שָׁלוֹם [first_name], שֻׁבַּצְתָּ לְתַּפְקִיד [role_name] כְּפָעִיל בְחִרוֹת. - יֵשׁ לְהָשִׁיב 1 לְאִשּׁוּר, אוֹ 2 לַהֲסָרָה',
  },

electionRolesIDS : {
    mashkif:3 , 
    kalfiMember:10,
},
electionRoleShiftsIDS : {
    A:1 , 
    B:2,
    ALL:3
  },
  muniElectionsRoles: [
      'municipal_director', 'municipal_secretary', 'optimization_data_coordinator',
      'drivers_coordinator', 'motivator_coordinator', 'allocation_coordinator',
  ],
  multipleElectionRoles: {
      ballot_member: {
          election_general_worker: true,
          captain_of_fifty: true,
          counter: true,
      },
      observer: {
          election_general_worker: true,
          captain_of_fifty: true,
          counter: true,
      },
      captain_of_fifty: {
          election_general_worker: true,
         ballot_member: true,
         observer: true,
         driver: true,
         counter: true,
         cluster_leader: true,
         motivator: true
      },
      driver: {
          election_general_worker: true,
          counter: true,
          captain_of_fifty: true,
      },
      cluster_leader: {
          election_general_worker: true,
          counter: true,
          captain_of_fifty: true,
      },
      motivator: {
          election_general_worker: true,
          counter: true,
          captain_of_fifty: true,
      },
      counter: {
          election_general_worker: true,
          captain_of_fifty: true,
          ballot_member: true,
          observer: true,
          driver: true,
          cluster_leader: true,
          motivator: true
      },
      election_general_worker: {
          municipal_director: true,
          ballot_member: true,
          observer: true,
          driver: true,
          counter: true,
          cluster_leader: true,
          motivator: true,
          captain_of_fifty: true
      }
  },
  electionRoleSytemNames: {
      electionGeneralWorker: 'election_general_worker',
      ministerOfFifty: 'captain_of_fifty',
      clusterLeader: 'cluster_leader',
      motivator: 'motivator',
      driver: 'driver',
      ballotMember: 'ballot_member',
      observer: 'observer',
      counter: 'counter',
      muniDirector: 'municipal_director', 
      muniSecretary: 'municipal_secretary', 
      quarterDirector: 'quarter_director', 
      optimizerCoordinator: 'optimization_data_coordinator', 
      driversCoordinator: 'drivers_coordinator', 
      motivatorCoordinator: 'motivator_coordinator', 
      allocationCoordinator: 'allocation_coordinator', 
  },

  statusesChangeReport: {
      summaryBy: {
          none: 0,
          byArea: 1,
          byCity: 2,
          byCluster: 3,
          byBallot: 4
      },

      sortDirections: {
          up: 'u',
          down: 'd'
      },

      fieldDirections: {
          up: 'עלה',
          down: 'ירד'
      }
  },

  ballotsPollingSummary: {
      summaryBy: {
          none: 0,
          byArea: 1,
          byCity: 2,
          byCluster: 3,
          byBallot: 4
      }
  },

  csvParserStatus: {
      didNotStart: 0,
      atWork: 1,
      success: 2,
      error: 3,
      waiting: 4,
      cancelled: 5,
      restarted: 6,
  },

  supportStatusUpdateType: {
      maximum: 0,
      minimum: 1,
      always: 2
  },

  massUpdateType: {
      manual: 0,
      immediate: 1
  },
  supportStatuses: {
      tm: 1,
      ballotBox: 0,
      final: 2
  },

  electionCampaignTypes : {
      knesset: 0,
      municipal: 1,
      intermediate: 2
  },

  voterBookParserStatus: {
      didNotStart: 0,
      atWork: 1,
      success: 2,
      error: 3,
      delayed: 4,
  cancelled:5,
  restarted: 6,
  },

  electionCampaigns: {
      budget: {
          electionRolesEditTypes: {
              updateForAllCities: 1,
              updateForCitiesWithEqualAmount: 2,
              updateForCitiesWithInEqualAmount: 3,
              updateWithoutCities: 4
          }
      },

      supportStatusUpdate: {
          Statuses: {
              didNotStart: 0,
              atWork: 1,
              success: 2,
              error: 3,
              delayed: 4,
              cancelled: 5,
              restarted: 6,
          },

          types: {
              election: 0,
              final: 1
          }
      }
  },

  voteFileParserStatus: {
      didNotStart: 0,
      atWork: 1,
      success: 2,
      error: 3,
      delayed: 4,
  cancelled: 5 ,
  restarted: 6,
  },

  ballotBoxFileParserStatus: {
      didNotStart: 0,
      atWork: 1,
      success: 2,
      error: 3,
      delayed: 4 ,
      cancelled: 5 ,
  restarted: 6,
  },

  voterSupportStatusEntityTypes: {
      election: 0,
      tm: 1,
      final: 2
  },

  voterMetaKeyTypes: {
      value: 0,
      freeText: 1,
      number: 2
  },
  phone_types: {
      landing: 1,
      mobile: 2,
  },
  sortDirections: {
      up: 'u',
      down: 'd'
  },
  webDialerConfig: {
      uri: 'dialer1.shass.co.il',
      wsServers: 'wss://dialer1.shass.co.il:7443/ws'
  },
  requests_system_name : {municipally : 'municipally'},
  globalHeadquartersAreas: [58],

  payment_status_types:{
        waite_for_confirm_payment:'waite_for_confirm_payment',
        waite_for_pay:'waite_for_pay',
        incorrect_payment:'incorrect_payment',
        payment_paid:'payment_paid'
    }
};
