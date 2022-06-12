import React from 'react';
import { connect } from 'react-redux';

import ModalWindow from '../../global/ModalWindow';


class ModalAddNotification extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buttons: [
                {
                    class: 'btn btn-secondary pull-right',
                    text: 'בטל',
                    action: this.props.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'המשך',
                    action: this.props.hideModal.bind(this),
                    disabled: false
                }
            ]
        }
    }

    render() {
        return (
            <ModalWindow show={this.props.show} buttonX={this.props.hideModal.bind(this)}
                         title="אישור בקשה" style={{zIndex: '9001'}} buttons={this.state.buttons}>
                <p>בקשת אישור תשלח לפעיל והוא יהפוך לפעיל מאושר לאחר שיאשר את הבקשה.</p>
            </ModalWindow>
        );
    }
}

export default connect() (ModalAddNotification);