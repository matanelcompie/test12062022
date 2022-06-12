import React from 'react';
import PropTypes from 'prop-types';
import ComboSelect from 'components/common/ComboSelect';
import CheckboxInput from 'components/common/CheckboxInput';
import R from 'ramda';
import { regexRing, getCtiPermission } from 'libs/globalFunctions';

import HouseholdRowPhones from './HouseholdRowPhones';


const HouseholdDetailsRow = ({ household, supportStatusConstOptions, onHouseholdVoterDetailsChange, callNote,
    onUpdatePhoneClick, phoneKey, onUpdatePhoneNumber, onAddPhoneNumber, householdIndex, permissions }) => {
    let supportStatusConstOptionsArr = supportStatusConstOptions.map(value => {
        return { value: value.value, label: value.label };
    });

    let supportStatus = callNote.support_status_tm != undefined ? callNote.support_status_tm
        :
        household.support_status_tm ? household.support_status_tm : "";

    let voteStatus = callNote.vote_status != undefined ? callNote.vote_status : household.vote_status;


    function onSupportStatusChange(event) {
        onHouseholdVoterDetailsChange(['callNote', 'household', household.key, 'support_status_tm'], event.target.value, event.target.name, household.key)
    }

    function onVoteStatusChange(event) {
        onHouseholdVoterDetailsChange(['callNote', 'household', household.key, 'vote_status'], event.target.checked, event.target.name, household.key)
    }

    function updatePhoneNumber(event, phoneObj) {
        onUpdatePhoneNumber(household, R.merge(phoneObj, { 'phone_number': event.target.value, is_updated: true }));
    }
    function addPhoneNumber() {
        onAddPhoneNumber(household);
    }
    function deletePhoneNumber(phoneObj) {
        onUpdatePhoneNumber(household, R.merge(phoneObj, { is_deleted: true }));
    }
    return (
        <div className="household-details-row household-details__row">
            <div className="household-details__cell household-details__cell_col_first-name">{household.first_name}</div>
            <div className="household-details__cell household-details__cell_col_age">{household.age}</div>
            {getCtiPermission(permissions, 'contact') &&
                <HouseholdRowPhones
                    householdIndex={householdIndex}
                    phoneKey={phoneKey}
                    phones={household.phones}
                    permissions={permissions}
                    disabled={!getCtiPermission(permissions, 'contact', true)}
                />

            }
            {getCtiPermission(permissions, 'support') &&
                <div className="household-details__cell household-details__cell_col_support-status">
                    <ComboSelect
                        value={supportStatus}
                        defaultValue={supportStatus}
                        name="support_status_tm"
                        options={supportStatusConstOptionsArr}
                        onChange={onSupportStatusChange}
                        itemDisplayProperty="label"
                        itemIdProperty="value"
                        multiSelect={false}
                        className="household-details-row__support-status"
                        disabled={!getCtiPermission(permissions, 'support', true)}
                    />
                </div>
            }
            {getCtiPermission(permissions, 'vote') &&
                <div className="household-details__cell household-details__cell_col_vote-status">
                    <CheckboxInput
                        name="vote_status"
                        checked={voteStatus}
                        onChange={onVoteStatusChange}
                        className="stylish-checkbox"
                        disabled={!getCtiPermission(permissions, 'vote', true)}
                    />
                </div>
            }
        </div>
    );
};

HouseholdDetailsRow.propTypes = {
    household: PropTypes.object,
    supportStatusConstOptions: PropTypes.array,
    onHouseholdVoterDetailsChange: PropTypes.func,
    onUpdatePhoneClick: PropTypes.func,
    onAddPhoneNumber: PropTypes.func,
    phonekey: PropTypes.string,
};

HouseholdDetailsRow.defaultProps = {
    household: {},
    supportStatusConstOptions: [],
}

export default HouseholdDetailsRow;
