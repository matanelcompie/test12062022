import React from 'react';

import { isMobilePhone } from 'libs/globalFunctions';


class AddAllocationNewPhone extends React.Component {
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

    isDuplicatePhone() {
        let newPhoneToCheck = this.state.phoneNumber.split('-').join('');

        for ( let phoneIndex = 0; phoneIndex < this.props.phones.length; phoneIndex++ ) {
            let userPhoneToCheck = this.props.phones[phoneIndex].phone_number.split('-').join('');

            if ( userPhoneToCheck == newPhoneToCheck ) {
                return true;
            }
        }

        return false;
    }

    validatePhone() {
        let phoneToCheck = '';

        if ( this.state.phoneNumber.length == 0 ) {
            return false;
        } else {
            phoneToCheck = this.state.phoneNumber.split('-').join('');

            return (isMobilePhone(phoneToCheck) && !this.isDuplicatePhone());
        }
    }

    getPhoneStyle() {
        let style = {};
        // if ( !this.validatePhone() && !this.props.validateRolePhoneNumber(this.props.rolePhoneNumber) ) {
        //     style = {borderColor: '#cc0000'}
        // }

        return style;
    }

    render() {
        return (
            <div>
                <label htmlFor="add-num" className="col-lg-3 control-label">הוסף מספר</label>
                <div className="col-lg-9">
                    <input type="tel" className={"form-control "+(this.props.error?'has-error':'')} id="add-num" style={this.getPhoneStyle()}
                           value={this.state.phoneNumber} onChange={this.phoneNumberChange.bind(this)}
                           aria-describedby="helpBlock"/>
                </div>
                <div className="col-lg-12 row-spacing" style={{marginTop: '15px'}}>
                    <button title="הוסף מספר זה" type="button"
                            className="btn srch-btn-mini pull-left" onClick={this.addNewPhone.bind(this)}
                            disabled={!this.validatePhone()}>הוסף מספר זה
                    </button>
                </div>
            </div>
        );
    }
}

export default AddAllocationNewPhone;