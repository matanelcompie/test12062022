import React from 'react';
import { connect } from 'react-redux';

import HouseholdPhoneItem from './HouseholdPhoneItem';

import * as callActions from '../../../../../actions/callActions';


class HouseholdRowPhones extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.text = {
            addPhoneNumber: 'הוסף מספר'
        }
    }

    addPhoneNumber() {
        callActions.addVoterHouseholdPhone(this.props.dispatch, this.props.householdIndex);
    }

    /**
     * Set contact permissions
     *
     * @return void
     */
    setPermissions() {
        let contactPermission = 'cti.activity_area.household.household_contacts';
        this.contactEditable = ((this.props.permissions[contactPermission] != undefined)&&(Number(this.props.permissions[contactPermission].value) == 2));
    }

    render() {
        this.setPermissions();
        let that = this;

        let phones = this.props.phones.map( function(item, index) {
            if ( !item.deleted ) {
                return <HouseholdPhoneItem 
                            key={index} 
                            phoneKey={that.props.phoneKey} 
                            householdIndex={that.props.householdIndex}
                            phoneIndex={index} 
                            householdKey={that.props.key} 
                            item={item}
                            permissions={that.props.permissions}
                            disabled={that.props.disabled}
                            />;
            }
        });

        return (
            <div className="household-details__cell household-details__cell_col_phone-num">
                {phones}
                { this.contactEditable &&
                    <div className="household-details-row__add-phone-btn" key="add-phone"
                         onClick={this.addPhoneNumber.bind(this)}>
                        {this.text.addPhoneNumber}
                    </div>
                }
            </div>
        );
    }

}


export default connect() (HouseholdRowPhones);