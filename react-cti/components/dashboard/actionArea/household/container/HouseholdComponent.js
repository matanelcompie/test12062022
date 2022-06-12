import {connect} from 'react-redux';
import R from 'ramda';

import Household from '../display/Household';
import * as uiActions from 'actions/uiActions';
import * as callAnswerActions from 'actions/callAnswerActions';

function mapStateToProps(state, ownProps) {
    let household = state.call.activeCall.voter.household || [];
    let hhChanges = state.callAnswer.callNote.household;

    const updateHh = (hhVoterChanges, key) => {
        let hhVoterIdx = R.findIndex(R.propEq('key', key))(household);
        let updatedHh = R.mergeDeepWith(
            ((oldVal, newVal) => { // this is the function to determine the merge
                if (R.all(R.is(Array))([oldVal, newVal])){  // if they are both arrays, we need to merge the individual items
                    let result = [];    // start with an empty array
                    oldVal.forEach(oldItem =>
                        result.push(
                            // we want the new object pushed to the result array
                            // to be the old item (found by key),
                            // but with all the new attributes in the changes
                            R.merge(oldItem, R.find(R.propEq('key', oldItem.key))(newVal))
                        )
                    );
                    // lastly, we add in all the completely new items
                    return R.unionWith(R.eqBy(R.prop('key')), result, newVal);
                } else {
                    // in the case they're not both arrays, just prefer the new value
                    return newVal;
                }
            }),
            household[hhVoterIdx],
            hhVoterChanges
        );
        household = R.update(hhVoterIdx, updatedHh, household);
    };

    R.forEachObjIndexed(updateHh, hhChanges);

    return {
        household,
    	voter: state.call.activeCall.voter || {},
    	supportStatusConstOptions: state.system.lists.support_statuses || [],
    	householdVottingStatus: state.ui.householdVottingStatus,
    	householdSupportStatus: state.ui.householdSupportStatus,
    	callNote: state.callAnswer.callNote.household || {},
        phoneKey: state.ui.updatePhoneKey,
        inCallScreen: state.call.inCallScreen,
        permissions: state.campaign.permissions
    };
}

function mapDispatchToProps(dispatch) {
    return {
    	onHouseholdSupportStatusChange: (event) => dispatch(uiActions.onHouseholdSupportStatusChange(event.target.value)),
    	onHouseholdVottingStatusChange: (event) => dispatch(uiActions.onHouseholdVottingStatusChange(event.target.value)),
    	onHouseholdVoterDetailsChange: (pathArr, value, name, voterKey) => dispatch(callAnswerActions.onHouseholdVoterDetailsChange(pathArr, value, name, voterKey)),
        onApplyAllHouseholdStatus: (statusValue, fieldName) => dispatch(callAnswerActions.onApplyAllHouseholdStatus(statusValue, fieldName)),
        onUpdatePhoneClick: (phoneKey) => dispatch(uiActions.onUpdatePhoneClick(phoneKey)),
        onUpdatePhoneNumber: (voter, phoneKey , phoneNum) => dispatch(callAnswerActions.onUpdatePhoneNumber(voter, phoneKey, phoneNum)),
        onAddPhoneNumber: (voter) => dispatch(callAnswerActions.onAddPhoneNumber(voter)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Household);
