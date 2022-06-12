import React from 'react';
import { connect } from 'react-redux';

import TextInput from 'components/common/TextInput';
import { regexRing } from 'libs/globalFunctions';

import * as uiActions from '../../../../../actions/uiActions';
import * as callActions from '../../../../../actions/callActions';


class HouseholdPhoneItem extends React.Component {
    validatePhone(phoneNumber) {
        if (phoneNumber.trim().length == 0) {
            return false;
        }

        let phoneToCheck = phoneNumber.split('-').join('');

        return regexRing.isIsraelPhone(phoneToCheck)
    }

    phoneNumberChange(e) {
        let phoneNumber = e.target.value;
        let validPhone = false;

        validPhone = this.validatePhone(phoneNumber);
        callActions.voterHouseholdPhoneChange(this.props.dispatch, this.props.householdIndex, this.props.phoneIndex,
            phoneNumber, validPhone);
    }

    updateActivePhone() {
        uiActions.updateActiveHouseholdPhone(this.props.dispatch, this.props.householdIndex, this.props.phoneIndex);
    }

    resetActivePhone() {
        uiActions.updateActiveHouseholdPhone(this.props.dispatch, null, null);
    }

    showDeletePhoneModal() {
        uiActions.showDeleteHouseholdPhoneModal(this.props.dispatch, this.props.householdIndex, this.props.phoneIndex);
    }

    /**
     * Set contact permissions
     *
     * @return void
     */
    setPermissions() {
        let contactPermission = 'cti.activity_area.household.household_contacts';
        this.contactEditable = ((this.props.permissions[contactPermission] != undefined) && (Number(this.props.permissions[contactPermission].value) == 2));
    }

    /**
     *
     * @returns {*}
     */
    renderPhoneRow() {
        let style = {};

        if (this.props.item.valid) {
            style = {};
        } else {
            style = {
                borderColor: '#cc0000'
            };
        }

        if (this.props.updateHouseholdIndex == this.props.householdIndex && this.props.updatePhoneIndex == this.props.phoneIndex) {
            return (
                <TextInput
                    autoFocus
                    className="household-details-row__phone-num"
                    style={style}
                    name={this.props.item.key}
                    value={this.props.item.phone_number}
                    onChange={this.phoneNumberChange.bind(this)}
                    disabled={this.props.disabled}
                />
            );
        } else {

            let editIconStyle = (this.contactEditable) ? {} : { display: 'none' };
            return (
                [
                    <span key="num" className="household-details-row__phone-num" style={style}
                        onClick={this.updateActivePhone.bind(this)}>
                        {this.props.item.phone_number}
                    </span>,
                    //{ (this.contactEditable) &&
                    <i key="warn" className="household-details-row__phone-warn" aria-hidden="true" />,
                    <i key="edit" className="household-details-row__phone-edit"
                        onClick={this.updateActivePhone.bind(this)}
                        aria-hidden="true"
                        style={editIconStyle} />,
                    //}
                ]
            );
        }
    }

    /**
     * Set delete icon style according to permission
     *
     * @return void
     */
    setDeleteStyle() {
        this.deleteIconStyle = (this.contactEditable) ? {} : { display: 'none' };
    }

    render() {
        this.setPermissions();
        this.setDeleteStyle();
        return (
            <div className={"household-details-row__phone" +
                (this.props.item.is_deleted ? ' household-details-row__phone_deleted' : '') +
                (this.props.item.is_updated ? ' household-details-row__phone_updated' : '') +
                (this.validatePhone(this.props.item.phone_number) ? '' : ' household-details-row__phone_error')}
                key={this.props.item.key} onBlur={this.resetActivePhone.bind(this)}>
                {this.renderPhoneRow()}
                <i className="household-details-row__phone-delete"
                    onClick={this.showDeletePhoneModal.bind(this)}
                    aria-hidden="true"
                    style={this.deleteIconStyle} />
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        updateHouseholdIndex: state.ui.updateHouseholdIndex,
        updatePhoneIndex: state.ui.updatePhoneIndex
    }
}

export default connect(mapStateToProps)(HouseholdPhoneItem);