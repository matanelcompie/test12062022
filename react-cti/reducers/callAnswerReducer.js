import * as types from '../actions/actionTypes';
import R from 'ramda';

const initialState = {
    voterAnswers: {},
    callNote: {
        household:{},
        note: ''
    },
    // call_note: {},
    // supportStatus: null,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.ON_VOTER_ANSWER_CHANGE: {
            let newState;
            if(R.isEmpty(action.answer))
                newState = R.dissocPath(['voterAnswers', `${action.questionId}`], state);
            else
                newState = R.assocPath(['voterAnswers', action.questionId], action.answer, state);
            return newState;
        }

        case types.ON_CALL_ANSWER_CHANGE:
            return R.assocPath(action.path, action.value, state);

        case types.FINISH_CALL_SUCCESS:
            return initialState;

        case types.ON_CALL_ANSWER_NOT_CHANGED:
            return R.dissocPath(action.path, state);

        // case types.STORE_CALL_NOTE:
        //     return Object.assign({}, state, {
        //         call_note: action.data
        //     });
        //
        // case types.STORE_SUPPORT_STATUS:
        //     return Object.assign({}, state, {
        //         supportStatus: action.data
        //     });

        case types.ON_UPDATE_PHONE_CLICK:
            let newState = state;
            R.forEachObjIndexed(((voter, key) => {
                let phones = voter.phones;

                // first we want to make sure the newly-clicked phone isn't deleted
                let phoneIdx = R.findIndex(R.propEq('key', action.phoneKey))(phones);
                if (phoneIdx > -1) {
                    phones = R.update(phoneIdx, R.merge(phones[phoneIdx], {is_deleted: false}), phones)
                }

                // then we want to filter out all new, empty phone numbers
                phones = R.reject((x => (x.key !== action.phoneKey) && x.is_new && R.isEmpty(x.phone_number)), phones);

                // lastly, we want to delete all old empty phone numbers
                phones = phones.map(phoneObj => (
                    (R.isEmpty(phoneObj.phone_number) && !phoneObj.is_new)
                        ? R.merge(phoneObj, { is_deleted: true })
                        : phoneObj
                    )
                );

                // apply the changes
                newState = R.assocPath(['callNote', 'household', key, 'phones'], phones, newState);
            }), state.callNote.household);
            return newState;

        case types.RESET_VOTER_ANSWERS:
            return Object.assign({}, state, {voterAnswers: initialState.voterAnswers});

        case types.RESET_CALL_NOTE:
            return Object.assign({}, state, {callNote: initialState.callNote});

        default:
            return state;
    }
}
