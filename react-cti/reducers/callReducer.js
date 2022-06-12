import * as types from '../actions/actionTypes';

const initialState = {
    list: [],

    activeCall: {
        callKey: null,

        voter: {
            id: null,
            key: null,

            first_name: '',
            last_name: '',
            personal_identity: '',

            birth_date: null,
            main_voter_phone_id: null,

            email: '',
            contact_via_email: null,
            gender: 0,

            support_status_tm: '',
            support_status_final: '',
            vote_status: '',

            transportation: {
                needs_transportation: false,

                isCrippled: false,

                fromHours: '',
                fromMinutes: '',

                toHours: '',
                toMinutes: '',

                passengers: []
            },

            address: {
                street: '',
                house: '',
                flat: '4',
                city: '',

                city_id: '',
                street_id: '',
                neighborhood: '',
                house_entry: '',
                zip: '',
                mark: '',
                distribution_code: '',

                mi_city: '',
                mi_city_id: '',
                mi_neighborhood: '',
                mi_street: '',
                mi_street_id: '',
                mi_house: '',
                mi_house_entry: '',
                mi_flat: '',
                mi_zip: '',
                mi_mark: '',
                mi_distribution_code: '',

                actual_address_correct: null
            },

            current_phone: {
                base_id: '',
                id: null,
                phone_number: '',
                iteration: ''
            },

            phones: [],

            details: {},

            household: [],

            voterMetaHash: [],

            loadedVoter: false
        },

        timer: {
            seconds: 0,

            // Indicates the call time
            // when the call ends.
            // The timer keeps counting
            // action call time
            callSeconds: null,

            // The total time the user is active
            // minus break time and time between
            // calls
            totalActivitySeconds: 0
        },

        showEndCallStatus: false,

        endCallStatusCode: null,

        endCallStatusSubItemValue: {},
        muted: false
    },
    newCallError: 0,
    finishedCalls: [],
    callStatus: null,

    inCallScreen: false,
    disabledNextCall: true,
    manual_voter_call_data: {
        phone_id : null,
        phone_number : null
    },
    fakeData: [
        {
            id: 1,
            key: 1,

            support_status_tm: 2,
            support_status_final: 2,
            vote_status: true,

            transportation: {
                needs_transportation: 1,

                isCrippled: false,

                fromHours: '',
                fromMinutes: '',

                toHours: '',
                toMinutes: '',

                passengers: []
            },

            first_name: 'ישראל',
            last_name: 'ישראלי',
            personal_identity: 123456789,

            email: 'israeli@zahav.net.il',
            contact_via_email: 1,
            gender: 1,

            address: {
                street: 'מונטיפיורי',
                house: '27',
                flat: '9',
                city: 'פתח תקווה',

                city_id: '50',
                street_id: '',
                neighborhood: '',
                house_entry: '',
                zip: '',
                mark: '',
                distribution_code: '',

                mi_street: 'מונטיפיורי',
                mi_city: 'פתח תקווה',
                mi_city_id: '7900',
                mi_city_key: '',
                mi_neighborhood: '',
                mi_street_id: '',
                mi_house: '27',
                mi_house_entry: '',
                mi_flat: '9',
                mi_zip: '',
                mi_mark: '',
                mi_distribution_code: '',

                actual_address_correct: null
            },

            current_phone: {
                base_id: 2,
                id: 2,
                phone_number: '054-5163442',
                iteration: 1
            },

            phones: [
                {
                    id: 1, key: 'razJBcYZvo', phone_type_id: 1, phone_number: '03-6475522', sms: 0, call_via_tm: 1, deleted: false,
                    valid: true
                },
                {
                    id: 2, key: 'F6xjihtsz3', phone_type_id: 2, phone_number: '054-5163442', sms: 1, call_via_tm: 0, deleted: false,
                    valid: true
                }
            ],

            household: [
                {
                    id: 11,
                    key: 'qtd5yu6pzv',

                    first_name: 'ישראלה',
                    last_name: 'ישראלי',
                    age: 52,

                    support_status_tm: 2,
                    vote_status: false,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'XuuS2zqPzq', phone_number: '03-5780390', sms: 0, deleted: false, valid: true },
                        { id: 2, key: 'ouGK8XZGJT', phone_number: '052-4146633', sms: 1, deleted: false, valid: true }
                    ]
                },
                {
                    id: 12,
                    key: '693und392b',

                    first_name: 'יוכבד',
                    last_name: 'ישראלי',
                    age: 21,

                    support_status_tm: null,
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'YtHFgufVDY', phone_number: '03-5780390', deleted: false, valid: true },
                        { id: 2, key: 'JeSvchAtKt', phone_number: '054-2126400', deleted: false, valid: true }
                    ]
                },
            ],

            voterMetaHash: [
                null,
                {
                    id: 122,
                    voter_meta_key_id: 1,
                    voter_meta_value_id: 2
                },
                null,
                {
                    id: 128,
                    voter_meta_key_id: 3,
                    voter_meta_value_id: 9
                }
            ]
        },
        {
            id: 2,
            key: 2,

            support_status_tm: 3,
            support_status_final: 3,
            vote_status: true,

            transportation: {
                needs_transportation: 0,

                isCrippled: false,

                fromHours: '',
                fromMinutes: '',

                toHours: '',
                toMinutes: '',

                passengers: []
            },

            first_name: 'אביאל',
            last_name: 'ירושלמי',
            personal_identity: 987654321,

            email: 'aviely@gmail.com',
            contact_via_email: 1,
            gender: 1,

            address: {
                street: 'יפו',
                house: '23',
                flat: '1',
                city: 'ירושלים',

                city_id: '',
                street_id: '',
                neighborhood: '',
                house_entry: '',
                zip: '',
                distribution_code: '',

                mi_city: 'ירושלים',
                mi_city_id: '',
                mi_city_key: '',
                mi_neighborhood: '',
                mi_street: 'יפו',
                mi_street_id: '',
                mi_house: '23',
                mi_house_entry: '',
                mi_flat: '1',
                mi_zip: '',
                mi_mark: '',
                mi_distribution_code: '',

                actual_address_correct: null
            },

            current_phone: {
                base_id: 2,
                id: 2,
                phone_number: '052-8163347',
                iteration: 1
            },

            phones: [
                { id: 1, key: 'bnbab0oao5', phone_type_id: 1, phone_number: '02-7913381', sms: 0, call_via_tm: 1, deleted: false, valid: true },
                { id: 2, key: '9m1gdj9v3t', phone_type_id: 2, phone_number: '052-8163347', sms: 1, call_via_tm: 0, deleted: false, valid: true }
            ],

            household: [
                {

                    id: 21,
                    key: 'qeb7saic0p',

                    first_name: 'אסתר',
                    last_name: 'ירושלמי',
                    age: 52,

                    support_status_tm: 3,
                    vote_status: false,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'PcHch4LRZs', phone_number: '08-6412677', deleted: false, valid: true },
                        { id: 2, key: 'HUmnlPKECE', phone_number: '053-6145522', deleted: false, valid: true }
                    ]
                },
                {
                    id: 22,
                    key: 'o5vzdp9l6s',

                    first_name: 'נח',
                    last_name: 'ירושלמי',
                    age: 21,

                    support_status_tm: 4,
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { phone_number: '08-6412677', deleted: false, valid: true },
                        { phone_number: '055-6165577', deleted: false, valid: true }
                    ]
                },
                {

                    id: 23,
                    key: 'zk8azgzlp5',

                    first_name: 'זרובבלה',
                    last_name: 'ירושלמי',
                    age: 21,

                    support_status_tm: 'יחד',
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: '37JqArD9Jx', phone_number: '08-6412677', deleted: false, valid: true },
                        { id: 2, key: '3bLSnZei6d', phone_number: '057-3145566', deleted: false, valid: true }
                    ]
                },
            ],

            voterMetaHash: [
                null,
                {
                    id: 122,
                    voter_meta_key_id: 1,
                    voter_meta_value_id: 1
                },
                {
                    id: 128,
                    voter_meta_key_id: 2,
                    voter_meta_value_id: 6
                },
                null
            ]
        },
        {
            id: 3,
            key: 3,

            support_status_tm: 3,
            support_status_final: 3,
            vote_status: true,

            transportation: {
                needs_transportation: 0,

                isCrippled: false,

                fromHours: '',
                fromMinutes: '',

                toHours: '',
                toMinutes: '',

                passengers: []
            },

            first_name: 'רפאל',
            last_name: 'שמעוני',
            personal_identity: 112233445,

            email: '',
            contact_via_email: null,
            gender: 1,

            address: {
                street: '',
                house: '',
                flat: '1',
                city: 'מושב בני לכיש',

                city_id: '',
                street_id: '',
                neighborhood: '',
                house_entry: '',
                zip: '',
                distribution_code: '',

                mi_city: 'מושב בני לכיש',
                mi_city_id: '',
                mi_city_key: '',
                mi_neighborhood: '',
                mi_street: '',
                mi_street_id: '',
                mi_house: '',
                mi_house_entry: '',
                mi_flat: '',
                mi_zip: '',
                mi_mark: '',
                mi_distribution_code: '',

                actual_address_correct: null
            },

            current_phone: {
                base_id: 1,
                id: 1,
                phone_number: '08-4159943',
                iteration: ''
            },

            phones: [
                { id: 1, key: 'f4jynws0g7', phone_type_id: 1, phone_number: '08-4159943', sms: 0, call_via_tm: 1, deleted: false, valid: true },
                { id: 2, key: '3p8xv79end', phone_type_id: 2, phone_number: '057-6163317', sms: 1, call_via_tm: 0, deleted: false, valid: true }
            ],

            household: [
                {
                    id: 31,
                    key: 'a9x70qfzgt',

                    first_name: 'דלית',
                    last_name: 'שמעוני',
                    age: 52,

                    support_status_tm: null,
                    vote_status: false,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'GJoflyI59A', phone_number: '09-6412677', deleted: false, valid: true },
                        { id: 2, key: 'eVaWg4oAoV', phone_number: '059-6145522', deleted: false, valid: true }
                    ]
                },
                {
                    id: 32,
                    key: 'g0xaha9ydn',

                    first_name: 'איילת',
                    last_name: 'שמעוני',
                    age: 21,

                    support_status_tm: null,
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'ptJ3rRL2Sd', phone_number: '09-6412677', deleted: false, valid: true },
                        { id: 2, key: 'OLNSzQJboJid', phone_number: '055-6165577', deleted: false, valid: true }
                    ]
                },
                {
                    id: 33,
                    key: 'nlkcebfxdg',

                    first_name: 'ליאור',
                    last_name: 'שמעוני',
                    age: 21,

                    support_status_tm: null,
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'KXIeZBi0aH', phone_number: '09-6412677', deleted: false, valid: true },
                        { id: 2, key: 'r5LOOJPpBx', phone_number: '057-3145566', deleted: false, valid: true }
                    ]
                },
            ],

            voterMetaHash: [
                null,
                null,
                {
                    id: 122,
                    voter_meta_key_id: 2,
                    voter_meta_value_id: 7
                },
                {
                    id: 128,
                    voter_meta_key_id: 3,
                    voter_meta_value_id: 10
                }
            ]
        },
        {
            id: 4,
            key: 4,

            support_status_tm: 3,
            support_status_final: 3,
            vote_status: true,

            transportation: {
                needs_transportation: 0,

                isCrippled: false,

                fromHours: '',
                fromMinutes: '',

                toHours: '',
                toMinutes: '',

                passengers: []
            },

            first_name: 'מאיר',
            last_name: 'הר זהב',
            personal_identity: 554433221,

            email: '',
            contact_via_email: null,
            gender: 1,

            address: {
                street: '',
                house: '',
                flat: '2',
                city: 'קרית גת',

                city_id: '',
                street_id: '',
                neighborhood: '',
                house_entry: '',
                zip: '',
                distribution_code: '',

                mi_city: 'קרית גת',
                mi_city_id: '',
                mi_city_key: '',
                mi_neighborhood: '',
                mi_street: '',
                mi_street_id: '',
                mi_house: '',
                mi_house_entry: '',
                mi_flat: '',
                mi_zip: '',
                mi_mark: '',
                mi_distribution_code: '',

                actual_address_correct: null
            },

            current_phone: {
                base_id: 1,
                id: 1,
                phone_number: '08-4159943',
                iteration: ''
            },

            phones: [
                { id: 1, key: 'pki5fwv2sz', phone_type_id: 1, phone_number: '08-3169452', sms: 0, call_via_tm: 1, deleted: false, valid: true },
                { id: 2, key: '6yz03vt2zw', phone_type_id: 2, phone_number: '054-8617734', sms: 1, call_via_tm: 0, deleted: false, valid: true }
            ],

            household: [
                {
                    id: 41,
                    key: 'WJhD9su3JG',

                    first_name: 'מסעודה',
                    last_name: 'הר זהב',
                    age: 52,

                    support_status_tm: 3,
                    vote_status: false,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'TlkjNQEiPz', phone_number: '09-6412677', deleted: false, valid: true },
                        { id: 2, key: '26t3gHllDL', phone_number: '059-6145522', deleted: false, valid: true }
                    ]
                },
                {
                    id: 42,
                    key: 'TwdD4W6hVz',

                    first_name: 'ציון',
                    last_name: 'הר זהב',
                    age: 21,

                    support_status_tm: 4,
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'i58M9fa6Rp', phone_number: '09-6412677', deleted: false, valid: true },
                        { id: 2, key: 'JPgsdh89Xg', phone_number: '055-6165577', deleted: false, valid: true }
                    ]
                },
                {
                    id: 43,
                    key: 'i03hvKfJrR',

                    first_name: 'מרגלית',
                    last_name: 'הר זהב',
                    age: 21,

                    support_status_tm: null,
                    vote_status: true,
                    needs_transportation: 0,

                    phones: [
                        { id: 1, key: 'CQwszaBitq', phone_number: '09-6412677', deleted: false, valid: true },
                        { id: 2, key: 'ImWDOFoOq1', phone_number: '057-3145566', deleted: false, valid: true }
                    ]
                },
            ],

            voterMetaHash: []
        }
    ],

    oldTansportationData: {
        needs_transportation: false,

        fromHours: '',
        fromMinutes: '',

        toHours: '',
        toMinutes: '',

        isCrippled: false,

        passengers: []
    },

    cityStreets: [],

    oldAddress: {
        street: '',
        house: '',
        flat: '',
        city: '',

        city_id: '',
        street_id: '',
        neighborhood: '',
        house_entry: '',
        zip: '',
        distribution_code: '',

        actual_address_correct: null
    },

    oldPhones: [],

    oldEmail: ''
};

export default function (state = initialState, action) {
    let newState;

    switch (action.type) {
        case types.UPDATE_CALL_STATUS:
            return Object.assign({}, state, { callStatus : action.callStatus });

        case types.ADD_NEW_CALL_SUCCESS:
            return Object.assign({}, state, {
                list: [...state.list, action.data],
                activeCall: action.data,
            });

        case types.GET_CALL_SUCCESS:
            return Object.assign({}, state, {
                activeCall: action.data
            });

        case types.FINISH_CALL_SUCCESS:
            return Object.assign({}, state, {
                finishedCalls: [...state.finishedCalls, {
                    id: state.activeCall.id,
                    data: action.data
                }],
                activeCall: { voter: {} },
            });

        case types.ENTER_CALL_SCREEN:
            newState = { ...state };

            newState.inCallScreen = true;

            return newState;

        case types.LEAVE_CALL_SCREEN:
            newState = { ...state };

            newState.inCallScreen = false;

            return newState;

        case types.LOAD_FAKE_DATA:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.oldAddress = { ...newState.oldAddress };
            newState.oldPhones = { ...newState.oldPhones };
            newState.oldTansportationData = { ...newState.oldTansportationData };
            let maxFakeIndex = initialState.fakeData.length;
            let randomFakeIndex = -1;

            randomFakeIndex = Math.floor(Math.random() * maxFakeIndex);

            newState.activeCall.voter = initialState.fakeData[randomFakeIndex];

            for (let oldTransportKey in newState.oldTansportationData) {
                newState.oldTansportationData[oldTransportKey] = newState.activeCall.voter.transportation[oldTransportKey];
            }

            for (let oldAddressKey in newState.oldAddress) {
                newState.oldAddress[oldAddressKey] = newState.activeCall.voter.address[oldAddressKey];
            }

            newState.oldPhones = newState.activeCall.voter.phones;

            newState.oldEmail = newState.activeCall.voter.email;

            return newState;

        case types.UPDATE_TIMER_TICKS:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.timer = { ...newState.activeCall.timer };

            let seconds = state.activeCall.timer.seconds;
            let totalActivitySeconds = state.activeCall.timer.totalActivitySeconds;

            seconds++;
            totalActivitySeconds++;

            newState.activeCall.timer.seconds = seconds;
            newState.activeCall.timer.totalActivitySeconds = totalActivitySeconds;

            return newState;

        case types.END_CALL:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.timer = { ...newState.activeCall.timer };

            newState.activeCall.timer.callSeconds = state.activeCall.timer.seconds;

            return newState;

        case types.DISABLE_NEXT_CALL_BUTTON:
            newState = { ...state };
            newState.disabledNextCall = true;
            return newState;

        case types.START_NEW_CALL:
        case types.RESET_CALL_TIMER:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.timer = { ...newState.activeCall.timer };

            newState.activeCall.timer.callSeconds = null;
            newState.activeCall.timer.seconds = 0;

            return newState;

        case types.RESET_ACTIVE_CALLER:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.oldTansportationData = { ...newState.oldTansportationData };
            newState.oldAddress = { ...newState.oldAddress };
            newState.oldPhones = { ...newState.oldPhones };
            newState.cityStreets = [...newState.cityStreets];

            newState.activeCall = initialState.activeCall;
            newState.oldTansportationData = initialState.oldTansportationData;
            newState.oldAddress = initialState.oldAddress;
            newState.oldPhones = initialState.oldPhones;
            newState.cityStreets = initialState.cityStreets;
            newState.callStatus = null;

            return newState;

        case types.GET_ACTIVE_CALL_VOTER_FROM_MANUAL_CALL:
        case types.GET_ACTIVE_CALL_VOTER_FROM_SOCKET:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter = action.voterData;
            newState.disabledNextCall = false;

            if (action.voterData.email == null) {
                newState.activeCall.voter.email = '';
            }
            newState.oldEmail = newState.activeCall.voter.email;
            newState.oldPhones = newState.activeCall.voter.phones;

            return newState;

        case types.SET_ACTIVE_CALL_KEY:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };

            newState.activeCall.callKey = action.callKey;

            return newState;

        case types.LOAD_ACTIVE_CALL_VOTER_HOUSEHOLD:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter.household = action.household;

            return newState;

        case types.LOAD_ACTIVE_CALL_VOTER_TRANSPORTATION:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.transportation = { ...newState.activeCall.voter.transportation };
            newState.oldTansportationData = { ...newState.oldTansportationData };

            if (action.voterData.details.needs_transportation == 1) {
                newState.activeCall.voter.transportation.needs_transportation = true;
            } else {
                newState.activeCall.voter.transportation.needs_transportation = false;
            }

            newState.activeCall.voter.transportation.isCrippled = action.voterData.details.cripple;

            if (action.voterData.details.from_time != 0) {
                let fromTimeArr = action.voterData.details.from_time.split(':');

                newState.activeCall.voter.transportation.fromHours = fromTimeArr[0];
                newState.activeCall.voter.transportation.fromMinutes = fromTimeArr[1];
            } else {
                newState.activeCall.voter.transportation.fromHours = '';
                newState.activeCall.voter.transportation.fromMinutes = '';

            }

            if (action.voterData.details.to_time != 0) {
                let toTimeArr = action.voterData.details.to_time.split(':');

                newState.activeCall.voter.transportation.toHours = toTimeArr[0];
                newState.activeCall.voter.transportation.toMinutes = toTimeArr[1];
            } else {
                newState.activeCall.voter.transportation.toHours = '';
                newState.activeCall.voter.transportation.toMinutes = '';

            }

            newState.activeCall.voter.transportation.passengers = [];
            for (let householdIndex = 0; householdIndex < action.voterData.household.length; householdIndex++) {
                if (action.voterData.household[householdIndex].needs_transportation == 1) {
                    newState.activeCall.voter.transportation.passengers.push(action.voterData.household[householdIndex].id);
                }
            }

            for (let oldTransportKey in newState.oldTansportationData) {
                newState.oldTansportationData[oldTransportKey] = newState.activeCall.voter.transportation[oldTransportKey];
            }

            return newState;

        case types.LOAD_ACTIVE_CALL_VOTER_ADDRESS:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.address = { ...newState.activeCall.voter.address };
            newState.oldAddress = { ...newState.oldAddress };

            let addressFields = [
                "city_id",
                "street_id",
                "house_entry",
                "neighborhood",
                "zip",
                "mark",
                "distribution_code",
                "actual_address_correct",
                "mi_city",
                "mi_city_id",
                "mi_city_name",
                "mi_city_key",
                "mi_neighborhood",
                "mi_street",
                "mi_street_id",
                "mi_street_name",
                "mi_house",
                "mi_house_entry",
                "mi_flat",
                "mi_zip",
                "mi_mark"
            ];

            for (let fieldIndex = 0; fieldIndex < addressFields.length; fieldIndex++) {
                let fieldName = addressFields[fieldIndex];

                if (fieldName != 'actual_address_correct' && action.details[fieldName] == null) {
                    newState.activeCall.voter.address[fieldName] = '';
                } else {
                    newState.activeCall.voter.address[fieldName] = action.details[fieldName];
                }
            }

            for (let oldAddressKey in newState.oldAddress) {
                newState.oldAddress[oldAddressKey] = newState.activeCall.voter.address[oldAddressKey];
            }
            return newState;

        case types.LOAD_ACTIVE_CALL_VOTER_META_DATA:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.voterMetaHash = {};

            for (let voterMetaIndex = 0; voterMetaIndex < action.voterMetaData.length; voterMetaIndex++) {
                let metaKeyId = action.voterMetaData[voterMetaIndex].voter_meta_key_id;

                newState.activeCall.voter.voterMetaHash[metaKeyId] = action.voterMetaData[voterMetaIndex];
            }

            return newState;

        case types.LOAD_ACTIVE_CALL_VOTER_SUPPORT_STATUS_FINAL:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter.support_status_final = action.supportStatusFinal

            return newState;

        case types.DELETE_VOTER_HOUSEHOLD_PHONE:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.household = [...newState.activeCall.voter.household];
            newState.activeCall.voter.household[action.householdIndex] = { ...newState.activeCall.voter.household[action.householdIndex] };
            newState.activeCall.voter.household[action.householdIndex].phones = [...newState.activeCall.voter.household[action.householdIndex].phones];
            newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex] = { ...newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex] };

            newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex].deleted = true;

            return newState;

        case types.ADD_VOTER_HOUSEHOLD_PHONE:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.household = [...newState.activeCall.voter.household];
            newState.activeCall.voter.household[action.householdIndex] = { ...newState.activeCall.voter.household[action.householdIndex] };
            newState.activeCall.voter.household[action.householdIndex].phones = [...newState.activeCall.voter.household[action.householdIndex].phones];

            newState.activeCall.voter.household[action.householdIndex].phones.push(
                {
                    voter_id: null,
                    id: null,
                    key: '',
                    phone_type_id: '',
                    phone_number: '',
                    deleted: false,
                    valid: false
                }
            );

            return newState;

        case types.VOTER_HOUSEHOLD_PHONE_NUMBER_INPUT_CHANGE:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.household = [...newState.activeCall.voter.household];
            newState.activeCall.voter.household[action.householdIndex] = { ...newState.activeCall.voter.household[action.householdIndex] };
            newState.activeCall.voter.household[action.householdIndex].phones = [...newState.activeCall.voter.household[action.householdIndex].phones];
            newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex] = { ...newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex] };

            newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex].phone_number = action.phoneNumber;
            newState.activeCall.voter.household[action.householdIndex].phones[action.phoneIndex].valid = action.validPhone;

            return newState;

        case types.SHOW_END_CALL_STATUS:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };

            newState.activeCall.showEndCallStatus = true;

            return newState;

        case types.HIDE_END_CALL_STATUS:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };

            newState.activeCall.showEndCallStatus = false;

            return newState;

        case types.CHANGE_END_CALL_STATUS_CODE:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.endCallStatusSubItemValue = { ...newState.activeCall.endCallStatusSubItemValue };

            newState.activeCall.endCallStatusCode = action.endCallStatusCode;
            newState.activeCall.endCallStatusSubItemValue = {};

            return newState;

        case types.RESET_END_CALL_STATUS:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };

            newState.activeCall.endCallStatusCode = null;
            newState.activeCall.showEndCallStatus = false;

            newState.activeCall.endCallStatusSubItemValue = {};

            return newState;

        case types.CHANGE_END_CALL_STATUS_SUB_MENU:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.endCallStatusSubItemValue = { ...newState.activeCall.endCallStatusSubItemValue };

            newState.activeCall.endCallStatusSubItemValue[action.subItemName] = action.subItemValue;
            return newState;

        case types.CHANGE_TRANSPORTATION_INPUT_FIELD:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.transportation = { ...newState.activeCall.voter.transportation };

            newState.activeCall.voter.transportation[action.fieldName] = action.fieldValue;

            return newState;

        case types.UPDATE_TRANSPORTATION_NEED:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.transportation = { ...newState.activeCall.voter.transportation };

            newState.activeCall.voter.transportation.needs_transportation = action.needsTransportation;

            return newState;

        case types.UNDO_TRANSPORT_DATA_CHANGE:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.transportation = { ...newState.activeCall.voter.transportation };

            newState.activeCall.voter.transportation.needs_transportation = newState.oldTansportationData.needs_transportation;

            newState.activeCall.voter.transportation.fromHours = newState.oldTansportationData.fromHours;
            newState.activeCall.voter.transportation.fromMinutes = newState.oldTansportationData.fromMinutes;

            newState.activeCall.voter.transportation.toHours = newState.oldTansportationData.toHours;
            newState.activeCall.voter.transportation.toMinutes = newState.oldTansportationData.toMinutes;

            newState.activeCall.voter.transportation.is_crippled = newState.oldTansportationData.is_crippled;

            newState.activeCall.voter.transportation.passengers = newState.oldTansportationData.passengers;

            return newState;

        case types.CHANGE_VOTER_ADDRESS_INPUT_FIELD:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.address = { ...newState.activeCall.voter.address };

            newState.activeCall.voter.address[action.fieldName] = action.fieldValue;

            return newState;

        case types.LOAD_CITY_STREETS:
            newState = { ...state };

            newState.cityStreets = action.cityStreets;

            return newState;

        case types.RESET_CITY_STREETS:
            newState = { ...state };

            newState.cityStreets = [];

            return newState;

        case types.UNDO_VOTER_ADDRESS_CHANGES:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.address = { ...newState.activeCall.voter.address };
            newState.cityStreets = [...newState.cityStreets];

            for (let oldAddressKey in newState.oldAddress) {
                newState.activeCall.voter.address[oldAddressKey] = newState.oldAddress[oldAddressKey];
            }

            return newState;

        case types.UPDATE_VOTER_ADDRSS_TO_MI_ADDRESS:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.address = { ...newState.activeCall.voter.address };

            if(newState.activeCall.voter.address){
                newState.activeCall.voter.address.street = newState.activeCall.voter.address.mi_street;
                newState.activeCall.voter.address.house = newState.activeCall.voter.address.mi_house;
                newState.activeCall.voter.address.flat = newState.activeCall.voter.address.mi_flat;
                newState.activeCall.voter.address.city = newState.activeCall.voter.address.mi_city;
    
                newState.activeCall.voter.address.city_id = newState.activeCall.voter.address.mi_city_id;
                newState.activeCall.voter.address.street_id = newState.activeCall.voter.address.mi_street_id;
                newState.activeCall.voter.address.neighborhood = newState.activeCall.voter.address.mi_neighborhood;
                newState.activeCall.voter.address.house_entry = newState.activeCall.voter.address.mi_house_entry;
                newState.activeCall.voter.address.zip = newState.activeCall.voter.address.mi_zip;
                newState.activeCall.voter.address.distribution_code = newState.activeCall.voter.address.mi_distribution_code;
            }

            return newState;

        case types.UPDATE_LOADED_VOTER:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter.loadedVoter = action.loadedVoter;

            return newState;

        case types.VOTER_ADDRESS_INIT_VOTER_STREET_ID:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.address = { ...newState.activeCall.voter.address };
            newState.oldAddress = { ...newState.oldAddress };

            let streetIndex = -1;

            if (newState.activeCall.voter.address.street_id == 0 && newState.activeCall.voter.address.street.length > 0) {
                streetIndex = action.cityStreets.findIndex(streetItem => streetItem.name == newState.activeCall.voter.address.street);

                if (streetIndex != -1) {
                    newState.activeCall.voter.address.street_id = action.cityStreets[streetIndex].id;
                }
            }

            if (action.updateOld) {
                newState.oldAddress.street_id = newState.activeCall.voter.address.street_id;
            }

            return newState;

        case types.SAVE_OLD_VOTER_CITY_ID:
            newState = { ...state };
            newState.oldAddress = { ...newState.oldAddress };

            newState.oldAddress.city_id = action.cityId;

            return newState;

        case types.MUTE_CALL:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };

            newState.activeCall.muted = true;

            return newState;

        case types.UNMUTE_CALL:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };

            newState.activeCall.muted = false;

            return newState;

        case types.ADD_PHONE_TO_VOTER:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            let voterPhones = [...newState.activeCall.voter.phones];
  
            voterPhones.push({
                    voter_id: null,
                    id: null,
                    key: null,
                    phone_type_id: action.phoneObj.phone_type_Id,
                    phone_number: action.phoneObj.phone_number,
                    sms: action.phoneObj.sms,
                    call_via_tm: action.phoneObj.call_via_tm,
                    deleted: false,
                    valid: true,
                });

            newState.activeCall.voter.phones = voterPhones;

            return newState;
        case types.UPDATE_VOTER_EMAIL:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter.email = action.email;

            return newState;

        case types.UPDATE_VOTER_CONTACT_VIA_EMAIL:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter.contact_via_email = action.contactViaEmail;

            return newState;

        case types.CHANGE_VOTER_PHONE_INPUT_FIELD:
        case types.DELETE_VOTER_PHONE:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.phones = [...newState.activeCall.voter.phones];
            newState.activeCall.voter.phones[action.phoneIndex] = { ...newState.activeCall.voter.phones[action.phoneIndex] };

            newState.activeCall.voter.phones[action.phoneIndex][action.fieldName] = action.fieldValue;

            return newState;

        case types.UNDO_VOTER_PHONE_CHANGES:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.phones = [...newState.activeCall.voter.phones];
            newState.activeCall.voter.phones[action.phoneIndex] = { ...newState.activeCall.voter.phones[action.phoneIndex] };

            newState.activeCall.voter.phones[action.phoneIndex].phone_number = newState.oldPhones[action.phoneIndex].phone_number;
            newState.activeCall.voter.phones[action.phoneIndex].sms = newState.oldPhones[action.phoneIndex].sms;
            newState.activeCall.voter.phones[action.phoneIndex].call_via_tm = newState.oldPhones[action.phoneIndex].call_via_tm;

            newState.activeCall.voter.phones[action.phoneIndex].deleted = false;
            newState.activeCall.voter.phones[action.phoneIndex].valid = true;

            return newState;

        case types.UPDATE_VOTER_SUPPORT_STATUS_TM:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };

            newState.activeCall.voter.support_status_tm = action.supportStatusTm;

            return newState;

        case types.UPDATE_VOTER_META_KEY_VALUE_ID:
            newState = { ...state };
            newState.activeCall = { ...newState.activeCall };
            newState.activeCall.voter = { ...newState.activeCall.voter };
            newState.activeCall.voter.voterMetaHash = [...newState.activeCall.voter.voterMetaHash];

            if (newState.activeCall.voter.voterMetaHash[action.metaKeyId] == null ||
                newState.activeCall.voter.voterMetaHash[action.metaKeyId] == undefined) {

                newState.activeCall.voter.voterMetaHash[action.metaKeyId] = {
                    id: null,
                    voter_meta_key_id: action.metaKeyId,
                    voter_meta_value_id: action.metValueId
                };
            } else {
                newState.activeCall.voter.voterMetaHash[action.metaKeyId] = { ...newState.activeCall.voter.voterMetaHash[action.metaKeyId] };
                newState.activeCall.voter.voterMetaHash[action.metaKeyId].voter_meta_value_id = action.metValueId;
            }

            return newState;
        case types.SET_MANUAL_VOTER_CALL_DATA:
            newState = { ...state };
            newState.manual_voter_call_data = action.manual_voter_call_data;

            return newState;

        case types.NEW_CALL_ERROR:
            newState = { ...state };
            newState.newCallError = action.errorCode;
            return newState;

        default:
            return state;

    }
}