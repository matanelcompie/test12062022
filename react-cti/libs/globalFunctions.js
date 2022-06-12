import moment from 'moment';
import 'moment-duration-format';
/*
 *  This function validates zip.
 *  The zip should be string of
 *  numbers which it's length is
 *  5 or 7 characters
 *
 *  @param zip - The zip to validate
 */
export function validateZip(zip) {

    // Checking that zip is string of numbers
    // with length of 5 characters
    if (/^([1-9][0-9]{4})$/.test(zip)) {
        return true;
    }

    // Checking that zip is string of numbers
    // with length of 7 characters
    if (/^([1-9][0-9]{6})$/.test(zip)) {
        return true;
    }

    return false;
}
/*
 *   This function validates the house
 *   in address.
 *   The house should be string of numbers
 *   which doesn't start in 0.
 *
 *   @param house - The house to validate
 */
export function validateHouse(house) {
    if (/^([1-9][0-9]*)$/.test(house)) {
        return true;
    } else {
        return false;
    }
}
/*
 *   This function validates the flat
 *   in address.
 *   The flat should be string of numbers
 *   which doesn't start in 0.
 *
 *   @param flat - The flat to validate
 */
export function validateFlat(flat) {
    if (/^([1-9][0-9]*)$/.test(flat)) {
        return true;
    } else {
        return false;
    }
}
/*
 *  This function validates a phone.
 *  The phone can any kind of phone.
 *
 *  @param phoneNumber - The phone to validate
 *  @returns {boolean}
 */
export function validatePhoneNumber(phoneNumber) {
    // For land phones
    if (/^(0[23489](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber)) {
        return true;
    }

    // For land phones such as 072-6413399
    if (/^(07[2-9](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber)) {
        return true;
    }

    // For mobile phones
    if (/^(05[0-9](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber)) {
        return true;
    }

    return false;
}
/*
 *  This function validates an email.
 *
 *  @param email - The email to validate
 */
export function validateEmail(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true;
    }

    return false;
}
/**
 *
 * @param refObj
 * @param target
 * @param targetName
 */
export function inputRef(refObj, target, targetName) {

    let tmpStr = '';

    if (undefined != refObj) {
        tmpStr = refObj.value.toString().trim();
        if (tmpStr.length > 0) {
            target[targetName] = tmpStr;
        }
    }

}
/**
 * This function gets a string datetime from
 * the database and returns it as human readable
 * date time.
 *
 * Example - 11:10:24 2016-12-14 the function will
 *           return 14/12/2016 - if no time is printed or
 *                  11:10:24 14/12/2016 - if time is printed
 *
 * @param dateTime
 * @param printTime      - A boolean which tells the function
 *                         whether to print the time
 * @param noSeconds      - A boolean to NOT print the seconds in the
 *                         time part(11:10 only).
 * @param dateTimeSpacer - The string between date(14/12/2016) and
 *                         time(11:10:24)
 *
 * return - string of date time in human readable pattern.
 *
 * More calling examples:
 *         console.log('01====' + dateTimeReversePrint(this.props.item.target_close_date));
 *         console.log('02====' + dateTimeReversePrint(this.props.item.target_close_date, false));
 *         console.log('03====' + dateTimeReversePrint(this.props.item.target_close_date, true, false));
 *         console.log('04====' + dateTimeReversePrint(this.props.item.target_close_date, true, true, ' '));
 *         console.log('05====' + dateTimeReversePrint(this.props.item.target_close_date, true, false, 'xxx'));
 *         console.log('06====' + dateTimeReversePrint(this.props.item.target_close_date, true, true, 'yyy'));
 *
 */
export function dateTimeReversePrint(dateTime, printTime = true, noSeconds = false, dateTimeSpacer = ' ') {
    let strDateTime = '';

    if (0 == dateTime.length) {
        return '';
    }

    /**
     *  We'll split the datetime string in YYYY, MM, DD, hh, mm, ss. For
     *  this reason we need a 'reverse' for the date.
     */
    let arrOfDateTime = dateTime.split(dateTimeSpacer);
    let date = arrOfDateTime[0];
    let time = arrOfDateTime[1];
    let arrOfTime = [];

    strDateTime = date.split('-').reverse().join('/');
    if (printTime && arrOfDateTime.length > 1) {
        if (noSeconds) {
            arrOfTime = time.split(':');
            arrOfTime.splice(2, 1);

            strDateTime += ' ' + arrOfTime.join(':');
        } else {
            strDateTime += ' ' + time;
        }
    }

    return strDateTime;
}
/**
 * This function check personal Identity number against the Luhn algorithm
 * @param personalIdentity - the voter Personal Identity
 *
 * return - true if the identity is legit false otherwise
 */
export function checkPersonalIdentity(personalIdentity) {
    if (personalIdentity.toString().length < 2) { return false}

    var identity = personalIdentity;
    if ((typeof identity) == 'number')
        identity = personalIdentity.toString();
    while (identity.length < 9) {
        identity = '0' + identity;
    }

    var totalCount = 0;
    for (var i = 0; i < 9; i++) {
        var digit = parseInt(identity.substr(i, 1));
        if ((i % 2) > 0)
            digit = digit * 2;
        if (digit >= 10)
            digit = digit - 10 + 1;
        totalCount += digit;
    }
    if (totalCount % 10 > 0)
        return false;
    else
        return true;
}

export function currentDateInRegularFormat() {
    var currentdate = new Date();
    let day = currentdate.getDate();
    if (day < 10) {
        day = '0' + day;
    }
    let month = (currentdate.getMonth() + 1);
    if (month < 10) {
        month = '0' + month;
    }
    let hours = currentdate.getHours();
    if (hours < 10) {
        hours = '0' + hours;
    }
    let minutes = currentdate.getMinutes();
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    let seconds = currentdate.getSeconds();
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return day + '/'
        + month + '/'
        + currentdate.getFullYear() + ' '
        + hours + ':'
        + minutes + ':'
        + seconds;

}

export function currentDateInDbFormat(withTime = true) {
    var currentDate = new Date();
    var dateParts = currentDate.toLocaleDateString().split('/');
    var result = dateParts[2] + '-' + (dateParts[0] < 10 ? '0' + dateParts[0] : dateParts[0]) + '-' + (dateParts[1] < 10 ? '0' + dateParts[1] : dateParts[1]);

    if (withTime) {
        var time = currentDate.toLocaleTimeString().split(' '),
            fullTime = time[0];

        if (time[1] == 'PM') {
            var timeParts = fullTime.split(':');
            timeParts[0] = parseInt(timeParts[0]) + 12;
            fullTime = timeParts.join(':');
        }

        result += ' ' + fullTime;
    }
    return result;
}

/**
 *
 * @param dateTime
 * @returns {string}
 */
export function dateTimeToDb(dateTime, withTime = true) {
    var dateTimeToDb = '';
    var arrOfDateElements = dateTime.split(' ');

    dateTimeToDb = arrOfDateElements[0].split('/').reverse().join('-');
    if (withTime) {
        if (arrOfDateElements.length > 1) {
            dateTimeToDb += ' ' + arrOfDateElements[1];
        } else {
            dateTimeToDb += ' 00:00:00';
        }
    }

    return dateTimeToDb;
}
/**
 *
 * @param currentDate
 * @returns {string}
 */
export function getCurrentFormattedDateTime(currentDate, withSeconds = true) {
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let day = currentDate.getDate();
    if (day < 10)
        day = '0' + day;
    if (month < 10)
        month = '0' + month;
    var seconds = currentDate.getSeconds();
    var minutes = currentDate.getMinutes();
    var hour = currentDate.getHours();
    if (hour <= 9)
        hour = '0' + hour;
    if (minutes <= 9)
        minutes = '0' + minutes;
    if (seconds <= 9)
        seconds = '0' + seconds;

    if (withSeconds) {
        return day + '/' + month + '/' + year + ' ' + hour + ':' + minutes + ':' + seconds;
    } else {
        return day + '/' + month + '/' + year + ' ' + hour + ':' + minutes;
    }
}


export function getCurrentDateTimeFormatted(withTime = true) {
    let currentDate = new Date();

    var seconds = currentDate.getSeconds();
    var minutes = currentDate.getMinutes();
    var hour = currentDate.getHours();

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    let day = currentDate.getDate();

    if (day < 10) {
        day = '0' + day;
    }
    if (month < 10) {
        month = '0' + month;
    }

    if (hour <= 9)
        hour = '0' + hour;
    if (minutes <= 9)
        minutes = '0' + minutes;
    if (seconds <= 9)
        seconds = '0' + seconds;

    if (withTime) {
        return day + '/' + month + '/' + year + ' ' + hour + ':' + minutes + ':' + seconds;
    } else {
        return day + '/' + month + '/' + year;
    }
}


/**
 *
 * @param candidate
 * @returns {*}
 */
export function castToString(candidate) {
    return ('string' == typeof (candidate)) ? candidate.trim() : candidate.toString().trim();
}
/**
 * For the moment the time zone is not supported widely(by the browsers).
 *
 * @param date        - if null, we'll generate the current datetime
 * @param withTime    - if true, we'll add the time part
 * @param withWeekDay - if true, we'll add the week day
 * @param option      - this will override the 'defaultOption'
 *                      Be aware that we'll NOT validate the key(s) and the value(s)!
 * @returns {string}
 */
export function dateTimeWizard(date, withTime = true, withWeekDay = false, option = {}) {

    let result = '',
        defaultOption = {
            /*timeZone: 'Asia/Jerusalem', timeZoneName: 'long',*/
            weekday: 'short',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };

    if (null == date) {
        date = new Date();
    }

    if ('object' == typeof option) {
        for (let i in option) {
            defaultOption[i] = option[i];
        }
    }

    if (false == withWeekDay) {
        delete defaultOption['weekday'];
    }

    if (false == withTime) {
        delete defaultOption['hour'];
        delete defaultOption['minute'];
        delete defaultOption['second'];
    }

    result = date.toLocaleDateString('he-IL', defaultOption).replace(/\./g, '/');

    if (true == withTime) {
        result = result.replace(/,/g, '');
    }

    return result;
}

/*
 *  This function sort values asc/desc
 *
 *  use::
 *  array.sort(arraySort('asc','name')) : sort the array by the name property Asc.
 *
 *  @param orderProp: the parameter to sort by it
 *  @param direction: sort direction (asc/desc)
 *  @param a: first value
 *  @param b: second value
 */
export function arraySort(direction, orderProp) {
    if (direction.toLowerCase() === 'asc') {
        return function (a, b) {
            if (a[orderProp] < b[orderProp])
                return -1;
            if (a[orderProp] > b[orderProp])
                return 1;
            return 0;
        };
    } else {
        return function (a, b) {
            if (a[orderProp] > b[orderProp])
                return -1;
            if (a[orderProp] < b[orderProp])
                return 1;
            return 0;
        };
    }
}
/**
 * This is a little regex collection.
 */
export class regexRing {

    static isPositiveInteger(value) {
        let regEx = /^\d+$/;
        return regEx.test(value);
    }

    static isIntegerOrHyphen(value) {
        let regEx = /^(\d+-?)+\d+$/;
        return regEx.test(value);
    }

    /**
     * It's working even for mixed Hebrew-English words.
     * Now it's limited to max 5 words.
     *
     * @param value
     * @returns {boolean}
     */
    static isStringOrBlank(value) {
        let regEx = /^([a-zA-Z_\u0590-\u05FF]*[ ]?){1,5}$/;
        return regEx.test(value);
    }

    /**
     *
     * @param value
     * @returns {boolean}
     */
    static isAlphaNumericOrBlank(value) {
        let regEx = /^([a-zA-Z0-9_\u0590-\u05FF]*[ ]?){1,8}$/;
        return regEx.test(value);
    }

    /**
     *
     * @param value
     * @returns {boolean}
     */
    static isIsraelPhone(value) {
        let regEx = /^(0|972)(([57][0-9])|[23489]){1}([0-9]){7}$/;
        return regEx.test(value);
    }

    /**
     * This will be useful with SMS and TTS.
     *
     * @param value
     * @returns {boolean}
     */
    static isE164Phone(value) {
        let regEx = /^\+?[0-9]\d{1,14}$/;
        return regEx.test(value);
    }

    /**
     * Check if the number is an Israeli land phone( so called Bezeq phone).
     *
     * @param value
     * @returns {boolean}
     */
    static isIsraelLandPhone(value) {
        let regEx = /^\+?(972)?(\-)?0?[23489]{1}(\-)?[^0\D]{1}\d{6}$/;
        return regEx.test(value);
    }
}

/**
 * Return true of the phone number is Kosher, else false
 *
 */
export function checkKosherPhone(phoneNumber) {
    // Pelephone
    if (/^(05041[0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    // Cellcom
    if (/^(0527[1,6][0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    // Partner
    if (/^(0548[4-5][0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    // Hot Mobile
    if (/^(053[3-4]1[0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    // Golan Telecom
    if (/^(05832[0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    // Ramy Levy
    if (/^(05567[0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    // Bezeq
    if (/^(0[1-9]80[0-9]{5})$/.test(phoneNumber)) {
        return true;
    }

    return false;
}

/**
 * Classic XOR implementation.
 *
 * @param a
 * @param b
 * @returns {*|boolean}
 */
export function one1XOR(a, b) {
    return (a || b) && !(a && b);
}

/**
 * Send the message to the console under controlled circumstances.
 *
 * @param message
 */
export function logOnDev(message, onDev = false) {

    if ('string' != typeof (message) || false == onDev) {
        return;
    }
}

/**
 * Check if the number is an Israeli land phone( so called Bezeq phone).
 *
 * @param phoneNumber
 * @returns {boolean}
 */
export function isLandPhone(phoneNumber) {
    // For land phones
    if (/^(0[23489](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber)) {
        return true;
    }

    // For land phones such as 072-6413399
    if (/^(07[2-9](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber)) {
        return true;
    }

    return false;
}

/**
 * Check if the number is an Israeli mobile phone.
 *
 * @param phoneNumber
 * @returns {boolean}
 */
export function isMobilePhone(phoneNumber) {
    return /^(05[0-9](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber);
}


export function parseDateToPicker(value) {
    let date = moment(value, [
        'DD/MM/YYYY', 'YYYY/MM/DD',
        'DD-MM-YYYY', 'YYYY-MM-DD',
        'DD/MM/YYYY HH:mm', 'YYYY/MM/DD HH:mm',
        'DD-MM-YYYY HH:mm', 'YYYY-MM-DD HH:mm',
        'DD/MM/YYYY HH:mm:ss', 'YYYY/MM/DD HH:mm:ss',
        'DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss',
        'HH:mm', 'HH:mm:ss'
    ], true);

    return date.isValid() ? new Date(date.toString()) : null;
}

//export function parseDateFromPicker(callback, format = 'DD-MM-YYYY',params=null, value = '') {
export function parseDateFromPicker(params, value = '') {
    if ("function" != typeof params.callback) {
        console.log('params.callback is Missed or not a function');
        return;
    }

    const functionParams = params.functionParams || null;
    const format = params.format || 'DD-MM-YYYY';
    let date = moment(value);
    date = date.format(format);

    params.callback = params.callback.bind(this);
    params.callback(date, functionParams);
}


export function parseSecondsToTime(seconds) {
    if (seconds >= 0) {
        let time = moment.duration(seconds, "seconds").format('HH:mm:ss');
        return seconds < 60 ? "00:" + time : time;
    }
    else
        return "";
}


export function parseTimerSecondsToTime(seconds) {
    if (seconds >= 0) {
        let time = moment.duration(seconds, "seconds").format('mm:ss');
        return seconds < 60 ? "00:" + time : time;
    } else {
        return "";
    }
}

//set permissions names
let permissionNames = {
    //household
    contact: 'cti.activity_area.household.household_contacts',
    support: 'cti.activity_area.household.household_voter_status',
    vote: 'cti.activity_area.household.household_voting',
    //transportation
    drivers: 'cti.activity_area.transportation.drivers',
    transportation_details: 'cti.activity_area.transportation.details',
    phone_coordinate: 'cti.activity_area.transportation.phone_coordinate',
    // address
    address: 'cti.activity_area.address',
    user_contacts: 'cti.activity_area.contacts',
    //status
    support_status: 'cti.activity_area.support_status',
    support_status_elections: 'cti.activity_area.support_status.elections',
    support_status_tm: 'cti.activity_area.support_status.tm',
    support_status_volunteer: 'cti.activity_area.support_status.volunteer',
    //call actions
    sms: 'cti.activity_area.general.sms',
    email: 'cti.activity_area.general.email',
}
/**
 * @function getCtiPermission
 * Get pernission for cti dispaly page.
 * 
 * @param {object} permissions - all permissions.
 * @param {string} type - permission name.
 * @param {bool} canEdit - can edit permission
 * @returns {bool} if user has permission (show/edit)
 */
export function getCtiPermission(permissions, type, canEdit) {
    let hasPermission = false;
    let permissionObj = permissions[permissionNames[type]];
    if (permissionObj == undefined) {
        hasPermission = false;
    } else {
        let permissionMinValue = canEdit ? 2 : 1;
        hasPermission = (Number(permissionObj.value) >= permissionMinValue);
    }
    return hasPermission;
}
export function getCtiPermissionValue(permissions, type){
    let permissionObj = permissions[permissionNames[type]];

    return (permissionObj == undefined) ? null : Number(permissionObj.value);
}