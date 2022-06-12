import React from 'react';
import PropTypes from 'prop-types';
import R from 'ramda';

function getAget(birthDate) {
    if ( null == birthDate ) {
        return '';
    }

    let arrOfDateElements = birthDate.split('-');
    let birthYear = arrOfDateElements[0];

    let date = new Date();
    let currentYear = date.getFullYear();

    return currentYear - birthYear;
}

const VoterInfo = ({voter, oldAddress, supportStatusConstOptions}) => {

    let address = "";

    //if(voter.address)
    //    address = voter.address.street + " " + voter.address.house + (voter.address.flat? "/" + voter.address.flat : "") + (voter.address.city? ", "+voter.address.city : "");
    if ( oldAddress.street ) {
        address += oldAddress.street;

        if (oldAddress.house) {
            address += ' ' + oldAddress.house;

            address += (oldAddress.flat? "/" + oldAddress.flat : "");
        }
    }

    if (address) {
        address += ', ' + oldAddress.city;
    } else {
        address = oldAddress.city;
    }

    //set current phone & other phone numbers
    let currentPhone = voter.current_phone.phone_number;
    let otherPhone = "";
    for(let i=0; i<voter.phones.length; i++) {
        let phone = voter.phones[i];
        if (phone.id != voter.current_phone.id) {
            otherPhone = phone.phone_number;
            break;
        }
    }

    const supportStatus = id => R.propOr('', 'label')(R.find(R.propEq('value', id))(supportStatusConstOptions));

    let otherPhoneClassName = "voter-info__detail voter-info__detail_type_phone";
    if ( null == currentPhone || currentPhone.length == 0 ) {
        otherPhoneClassName += "voter-info__detail_type_current-phone";
    }

    return (
        <div className="voter-info">
            <div className="voter-info__header">
                <span className="voter-info__first-name">{voter.first_name || ''}</span>
                <span className="voter-info__last-name">{voter.last_name || ''}</span>
                {voter.support_status_tm && <span className={`voter-info__support-status voter-info__support-status_type_${voter.support_status_tm}`}>
                    {supportStatus(voter.support_status_tm)}
                </span>}
            </div>
            <div className="voter-info__details">
                <div className="voter-info__detail voter-info__detail_type_person">
                    {['','זכר','נקבה'][+voter.gender]}
                </div>
                <div className="voter-info__detail voter-info__detail_type_person">
                    {getAget(voter.birth_date)}
                </div>
                <div className="voter-info__detail voter-info__detail_type_address">{address}</div>
                <div className="voter-info__detail voter-info__detail_type_address">{voter.email}</div>
                <div className="voter-info__detail voter-info__detail_type_phone voter-info__detail_type_current-phone">
                    {currentPhone}
                </div>
                <div className={otherPhoneClassName}>{otherPhone}</div>
            </div>
        </div>
    );
};

VoterInfo.propTypes = {
    voter: PropTypes.object,
    supportStatusConstOptions: PropTypes.array,
};

VoterInfo.defaultProps = {
    voter: {},
    supportStatusConstOptions: [],
};

export default (VoterInfo);
