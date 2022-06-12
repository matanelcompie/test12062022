import React from 'react';
import { connect } from 'react-redux';

import { validateEmail } from '../../../../../libs/globalFunctions';

import * as callActions from '../../../../../actions/callActions';


class ContactEmail extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.contactinfoTitle = 'עדכון פרטי קשר לתושב';

        this.subTitles = {
            email: 'דוא"ל'
        };

        this.placeholders = {
            email: 'הכנס דוא"ל'
        };

        this.contactViaEmailTexts = {
            send: 'לשלוח דוא"ל',
            dontSend: 'לא לשלוח דוא"ל'
        };
    }

    contactViaEmailChange() {
        let newContactViaEmail = (this.props.contact_via_email == 1) ? 0 : 1;

        callActions.updateVoterContactViaEmail(this.props.dispatch, newContactViaEmail);
    }

    updateEmail(email, e = null) {
        callActions.updateVoterEmail(this.props.dispatch, email);
        let isEmailVaild = validateEmail(email);
        this.props.updateEmailValidStatus(email.length == 0 || isEmailVaild);

        if (email.length == 0 && isEmailVaild) {
            callActions.updateVoterContactViaEmail(this.props.dispatch, 0);
        } 
    }

    undoEmailChange() {
        this.updateEmail(this.props.oldEmail);
    }

    emailChange(event) {
        this.updateEmail(event.target.value);
    }

    setInputStyle() {
        this.inputStyle = {};
        if (this.props.email.length > 0 && !validateEmail(this.props.email)) this.inputStyle.borderColor = "red";
    }

    render() {
        let disabledCheckBox = (this.props.email.length == 0) ? true : !validateEmail(this.props.email);
        let disabledClass = !this.props.canEdit ? ' disabledClass' : '';
        this.setInputStyle();

        return (
            <div className="action-content contact-info-email">
                <div className="contact-info-email__sub-title">{this.subTitles.email}</div>

                <div className="contact-info-email__email-input">
                    <input type="text" placeholder={this.placeholders.email} value={this.props.email}
                        disabled={!this.props.canEdit}
                        onChange={this.emailChange.bind(this)} 
                        style={this.inputStyle}/>

                    <span className="contact-info-email__undo-email-change"
                        onClick={this.undoEmailChange.bind(this)}>
                        <i className={"fa fa-undo fa-6" + disabledClass} />
                    </span>
                    <span className="contact-info-email__undo-email-change"
                        onClick={this.updateEmail.bind(this, '')}>
                        <i className={"fa fa-trash fa-6" + disabledClass} />
                    </span>
                </div>

                <div className="contact-info-email__contact-via-mail">
                    <input type="checkbox" onChange={this.contactViaEmailChange.bind(this)}
                        checked={this.props.contact_via_email == 1} disabled={disabledCheckBox} />

                    <span className="contact-info-email__contact-via-mail-text">
                        {this.contactViaEmailTexts.send}
                    </span>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        email: state.call.activeCall.voter.email,
        contact_via_email: state.call.activeCall.voter.contact_via_email,
        oldEmail: state.call.oldEmail
    }
}

export default connect(mapStateToProps)(ContactEmail);