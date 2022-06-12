import React from 'react';

import { isMobilePhone } from 'libs/globalFunctions';


class AddNewPhone extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            phoneNumber: ''
        };
    }

    addNewPhone() {
        let phoneNumber = this.state.phoneNumber;

        this.setState({phoneNumber: ''});

        this.props.addNewPhone(phoneNumber);
    }

    phoneNumberChange(event) {
        this.setState({phoneNumber: event.target.value});
    }

    validatePhone() {
        let phoneToCheck = '';

        if ( this.state.phoneNumber.length == 0 ) {
            return false;
        } else {
            phoneToCheck = this.state.phoneNumber.split('-').join('');

            return (isMobilePhone(phoneToCheck));
        }
    }
    checkIfPhoneAlreadyExist(){
        let phones = this.props.phones;
        let isPhoneExist = false;
        let newPhoneNumber = this.state.phoneNumber;
        if (phones && phones.length > 0) {
            let index = phones.findIndex(function (phone) {
                return phone.phone_number == newPhoneNumber;
            })
            if (index != -1) { isPhoneExist = true }
        }
        return isPhoneExist;
    }
    render() {
        let disabledButton = false;
        let isPhoneExist  = false;
        if (!this.validatePhone()) {
            disabledButton = true;
        } else {
            isPhoneExist = this.checkIfPhoneAlreadyExist();
            disabledButton = isPhoneExist;
        }
        return (
            <div className="form-group">
                <label htmlFor="add-num-allocated-details" className="col-lg-3 control-label">הוסף מספר</label>
                <div className="col-lg-9">
                    <input disabled={this.props.userLockId && this.props.userLockId!=''} type="tel" className="form-control" id="add-num-allocated-details"  value={this.state.phoneNumber}
                           onChange={this.phoneNumberChange.bind(this)} aria-describedby="helpBlock"/>
                </div>
                <div className="col-lg-3"></div>
                <div className="col-lg-9 row-spacing" style={{marginTop: '15px'}}>

                    {isPhoneExist &&<label className="text-danger pull-right"> מספר קיים לפעיל </label>}
                  {(!this.props.userLockId || this.props.userLockId=='') && <button title="הוסף מספר זה" type="button" className="btn btn-default srch-btn-mini pull-left"
                            onClick={this.addNewPhone.bind(this)} disabled={disabledButton}>הוסף מספר זה
                    </button>
                  }
                </div>
            </div>
        );
    }
}

export default AddNewPhone;