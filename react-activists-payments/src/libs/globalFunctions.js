import moment from 'moment'

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

/*
	Add commas to a given number in correct thousands places
*/
export function withCommas(number){
	if(number){
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	else {
		return undefined;
	}
}

export function isMobilePhone(phoneNumber) {
    return /^(05[0-9](\-)?)[1-9]([0-9]){6}$/.test(phoneNumber);
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