import { arraySort, isLandPhone, isMobilePhone } from '../libs/globalFunctions';

export function validatePhoneNumber(phone_number) {
    let phoneToCheck = '';

    if (!phone_number || phone_number.length == 0) {
        return true;
    } else {
        phoneToCheck = phone_number.split('-').join('');

        return (isMobilePhone(phoneToCheck) || isLandPhone(phoneToCheck));
    }
}

export function  validatePersonalIdentity(personal_identity) {
    var regPersonalIdentity = /^[0-9]{2,10}$/;

    if (!personal_identity || personal_identity.length == 0) {
        return true;
    } else {
        let personalIdentityToCheck = personal_identity;

        if (personalIdentityToCheck.charAt(0) == '0') {
            personalIdentityToCheck = personalIdentityToCheck.substr(1);
        }

        return regPersonalIdentity.test(personalIdentityToCheck);
    }
}