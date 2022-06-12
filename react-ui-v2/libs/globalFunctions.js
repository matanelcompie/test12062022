import moment from 'moment';
import validate from 'validate.js'
import constants from './constants';
import tmConstants from 'tm/constants/constants';

/*
	Telemarketing - function that returns by call_end_status_id its name
*/
export function getTmCallEndStatusName(id){
		switch(id){
			case tmConstants.TM.AGENT.CALL_END_STATUS.SUCCESS_WITH_SUPPORT_STATUS :
				return "בוצעה שיחה ונקבע סטטוס";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.SUCCESS_WITHOUT_SUPPORT_STATUS :
				return "בוצעה שיחה ללא סטטוס";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.SUCCESS :
				return "בוצעה בהצלחה";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.GET_BACK :
				return "חזור אלי";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.LANGUAGE :
				return "קושי בשפה";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.ANSWERING_MACHINE :
				return "משיבון";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.GOT_MARRIED :
				return "התחתן";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.CHANGED_ADDRESS :
				return "עבר דירה";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.FAX_TONE :
				return "צליל פקס";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.HANGED_UP :
				return "שיחה נותקה";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.WRONG_NUMBER :
				return "טעות במספר";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.NON_COOPERATIVE :
				return 'לא משת"פ';
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.BUSY :
				return "עסוק";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.DISCONNECTED_NUMBER :
				return "מספר מנותק";
				break;
			case tmConstants.TM.AGENT.CALL_END_STATUS.UNANSWERED :
				return "אין תשובה";
				break;
		    case tmConstants.TM.AGENT.CALL_END_STATUS.ABANDONED :
				return "חסום";
				break;	
		}
}

/*
	For gaugue graph - Get ratio between 2 values and potentials - AS ARRAY
*/
export function getCurrentArcArray(percentNumber , color){
		let greyArcBG = "#eceeef";
		let value = 0;
		let returnedArray = [];
		percentNumber = Math.round(percentNumber*100);
		if( percentNumber > 100){
			percentNumber = 100;
		}
		for(let i = 0 ; i < percentNumber ; i++ ){
			returnedArray.push(color);
		}
		for(let i = percentNumber ; i < 100 ; i++ ){
			returnedArray.push(greyArcBG);
		}
		return returnedArray;
}

/*
	Function from telemarketing that gets as parameter the number of seconds , and returns it formatted like hh:mm
*/
export function getFormattedTimeFromSeconds(seconds , isInHoursAndMinutes = true , isWithSeconds = false){
		if(isInHoursAndMinutes){ // return in hours and minutes
			let returnedValueInHours = "--" ;
			let returnedValueInMinutes = "--" ;
			let returnedValueInSeconds = "--" ;
			if(seconds){
				seconds = parseInt(seconds);
				returnedValueInHours = Math.floor(seconds/3600);
				returnedValueInMinutes =  Math.floor((seconds - returnedValueInHours*(3600))/60);  
				if(returnedValueInHours < 10){
					returnedValueInHours = "0"+returnedValueInHours;
				}
				if(returnedValueInMinutes < 10){
					returnedValueInMinutes = "0"+returnedValueInMinutes;
				}
			}
			let returnedValue = returnedValueInHours + ":" + returnedValueInMinutes;
			if(isWithSeconds){
				returnedValueInSeconds =  seconds%60;
				returnedValue = returnedValue + ":" + returnedValueInSeconds;
			}
			return returnedValue;
		}
		else{ //return in minutes and seconds
			let returnedValueInHours = "--" ;
			let returnedValueInMinutes = "--" ;
			let returnedValueInSeconds = "--" ;
			if(seconds){
				seconds = parseInt(seconds);
				returnedValueInMinutes = Math.floor(seconds/60);
				returnedValueInSeconds =  Math.floor(seconds - returnedValueInMinutes*60);  
				returnedValueInHours = parseInt(returnedValueInMinutes/60);
				returnedValueInMinutes -=  returnedValueInHours*60;
				if(returnedValueInHours < 10){
					returnedValueInHours = "0"+returnedValueInHours;
				}
				if(returnedValueInMinutes < 10){
					returnedValueInMinutes = "0"+returnedValueInMinutes;
				}
				if(returnedValueInSeconds < 10){
					returnedValueInSeconds = "0"+returnedValueInSeconds;
				}
				  
			}
			let returnedValue = returnedValueInHours + ":" + returnedValueInMinutes + ":" + returnedValueInSeconds;
			return returnedValue;
		}
}

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
	returns correct percentage calculation : 
*/
export function getFormattedPercentage(fromNumber , relativeToNumber){
		let result  = 0;
		if(!fromNumber   || !relativeToNumber  ){return 0;}
		else{
			result = ((fromNumber * 100)/relativeToNumber);
			result = Math.round(result * 100) / 100;
			return result;
		}
	}

/*
	Add commas to a given number in correct thousands places
*/
export function withCommas(number){
	if(number){
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	else{
		return undefined;
	}
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
export function validatePersonalIdentity(value){
    let valid = true;
    if (!new RegExp('^[0-9]*$').test(value)) { valid = false; } // allow only numbers in the field
    return valid;
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
    if ( null == email || email == undefined || email == '') {
        return true;
    }

    var email_max_length = tmConstants.email_max_length;

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if ( email.length > email_max_length ) {
        return false;
    }

    return re.test(email);
    // if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    //     return true;
    // }

    // return false;
}

/**
 * Validate URL
 * 
 * @param string url
 * @return boolean
 */
export function validateURL(url) {
    let errors = validate(
        { website: url },
        {
            website: {
                url: true
            }
        }
    );
    if (errors != undefined) return false;
    else return true;
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

    if ( null == dateTime || 0 == dateTime.length ) {
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
            if (a[orderProp] < b[orderProp] || !a[orderProp])
                return -1;
            if (a[orderProp] > b[orderProp] || !b[orderProp])
                return 1;
            return 0;
        };
    } else {
        return function (a, b) {
            if (a[orderProp] > b[orderProp] || !b[orderProp])
                return -1;
            if (a[orderProp] < b[orderProp] || !a[orderProp])
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
        let regEx = /^(\d+-?)+(\d+)?$/;
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
        let regEx = /^([a-zA-Z_\u0590-\u05FF]*[ '"-]?){1,5}$/;
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
    console.log(message);
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
        'DD/MM/YYYY', 'YYYY/MM/DD', 'HH:mm',
        'DD-MM-YYYY', 'YYYY-MM-DD', 'HH:mm:ss',
        'DD/MM/YYYY HH:mm:ss', 'YYYY/MM/DD HH:mm:ss',
        'DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss'
    ], true);
 
    return date.isValid() ? new Date(date.toString()) : null;
}

export function parseDateFromPicker(params, value = '') {
    if ("function" != typeof params.callback) {
        console.log('params.callback is Missed or not a function');
        return;
    }

    if (value == '') {
        return '';
    }
    const functionParams = params.functionParams;
    const format = params.format || 'DD-MM-YYYY';
    let date = moment(value);
    date = date.isValid() ? date.format(format) : null;
	
    params.callback = params.callback.bind(this, date, format, functionParams);
    params.callback(date, format, functionParams);
}

/**
 * Converts size in string with size letter to byte integer
 *
 * @param string size
 * @return integer
 */
export function sizeToBytes(size) {
    size = size.toLowerCase();
    let realSize = 0;
    if (size.endsWith('mb')) {
        realSize = parseInt(size.replace('mb', ''));
        realSize = realSize*1024*1024;
    }
    return realSize;
}

/*
	   this function checks if selected combo value is valid by field name to verifyFieldName
	   
	   @param comboList
	   @param comboValueName
	   @param verifyFieldName
*/
export function isValidComboValue(comboList , comboValueName , verifyFieldName , allowEmptyValue = false){
	let result = false;
	if(allowEmptyValue && (comboValueName == null || comboValueName == undefined || comboValueName.split(' ').join('') == '')){
		return true;
	}
	for(let i =0;i<comboList.length ; i++){
		if(comboList[i][verifyFieldName] == comboValueName){
			result = true;
			break;
		}
   }
   return result;
}

    /**
     * @function findElementByAttr
     * - find element in list , by object attribute value.
     * @param {array} list -list of items
     * @param {string} attr = object prop to search 
     * @param {*} value = value of the prop to search
     */
    export function findElementByAttr(list, attr, value, getByIndex = false) {
        let el = null;
        let elIndex = null;
        if (list.length == 0) { return null; }

        list.forEach(function (item, index) {
            if (item[attr] == value) {
                el = item; elIndex = index
            }
        });

        return !getByIndex ? el : elIndex;
    }
    /**
     * @function thousandsSeparatesForNumber
     * @param (float) float
     * add "," for Separates to big numbers (up to 10,000,000)
     * Takes into consideration also:
     * 1. Float.
     * 2. Negative numbers.
     * @returns (string) - the original float with "," separates.
     */
    export function thousandsSeparatesForNumber(float) {
        if(!float){return 0;}
        let minusStr = (float < 0) ? '-' : '';

        let floatStr = float.toString().replace('-', '');
        let floatArr = floatStr.split('.');
        let Integer = floatArr[0];
        let decimalStr = floatArr[1] ? '.' + floatArr[1] : '';

        let finalNumber = thousandsSeparatesForInteger(Integer)

        return minusStr + finalNumber + decimalStr;
    }
    /**
     * @function thousandsSeparatesForInteger
     * - only for integer!
     * add "," for Separates to big numbers (up to 10,000,000)
     * @param (integer) integer
     * 
     * @returns (string) - the original Integer with "," separates.
     */
    export function thousandsSeparatesForInteger(integer) {
        if(!integer){return 0;}
        integer = integer.toString()
        let len = integer.length;
        let finalNumber = integer;

        if (len < 4 || len > 7) {
            return finalNumber;
        } else if (len >= 4 && len <= 6) {
            let x = len - 3;
            finalNumber = integer.substring(0, x) + ',' + integer.substring(x);
        } else if (len == 7) {
            finalNumber = (integer.substring(0, 1) + ',' + integer.substring(1, 4) + ',' + integer.substring(4));
        }
        return finalNumber;
}
export function numberWithCommas(number) {
    if (number != null && number != undefined) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return 0;
    }
}
export function isEmptyOrNotObject(obj){
    let isEmptyObj = true
    if (obj) {
        isEmptyObj = Object.keys(obj).length == 0
    }
    return isEmptyObj
}
export function formatBallotMiId(mi_id){
    if(mi_id){
        return (mi_id).toString().substr(0, (mi_id + '').length - 1) + "." + (mi_id + '').substr(-1);
    }else{
        return mi_id;
    }
}

export function formatPhone(phoneNumber){
	if(phoneNumber.startsWith("05") || phoneNumber.startsWith("07")){
		return phoneNumber.substr(0,3) + "-" + phoneNumber.substr(3 ,phoneNumber.length - 3 );
	}
	else{
		return phoneNumber.substr(0,2) + "-" + phoneNumber.substr(2 ,phoneNumber.length - 2 );
	}
}
export function inArray(array, item){
    return (array.indexOf(item) != -1)
}
// Get Default next day for send message to activist:
export function getDefaultSendActivistMessage(){
    let defaultNextDayIndex = new Date().getDay() % 6 + 1;
    if (defaultNextDayIndex == 6) defaultNextDayIndex = 0;
    return defaultNextDayIndex;
}

// Get Area entity text By Type
export function getGeographicEntityTypeName(entityType){
    const geoAreasNames = {
        [constants.geographicEntityTypes.areaGroup]: 'ארצי',
        [constants.geographicEntityTypes.area]: 'איזור', 
        [constants.geographicEntityTypes.subArea]: 'תת איזור',
        [constants.geographicEntityTypes.city]: 'עיר',
        [constants.geographicEntityTypes.quarter]: 'רובע',
    }
    return geoAreasNames[entityType] || '';
} 
