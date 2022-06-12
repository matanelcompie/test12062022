import React from 'react';
import { connect } from 'react-redux';

import HouseholdGeneral from './HouseholdGeneral';
import HouseholdDetails from './HouseholdDetails';

import * as callActions from '../../../../../actions/callActions';
import * as uiActions from '../../../../../actions/uiActions';


class Household extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.textValues = {
            household: 'בית אב',
        };
    }

    componentWillReceiveProps(nextProps) {
        //set Household validation
        if (this.props.voter.household != nextProps.voter.household) {
            let valid = true;
            for(let i=0; i<nextProps.voter.household.length; i++) {
                let household = nextProps.voter.household[i];
                for (let j=0; j<household.phones.length; j++) {
                    let phone = household.phones[j];
                    if (!phone.deleted && !phone.valid) {
                        valid = false;
                        break;
                    }
                }
                if (valid == false) break;        
            }
            uiActions.setActionAreaValidationStatus(this.props.dispatch, 'Household', valid);
        }
    }

    /**
     * Set household display style
     *
     * @return void
     */
    setHouseholdDisplayStyle() {
        let householdPermossion = 'cti.activity_area.household';
        if ((this.props.permissions[householdPermossion] != undefined)&&(Number(this.props.permissions[householdPermossion].value) > 0)) {
            this.householdStyle = {};
        } else {
            this.householdStyle = {
                display: "none"
            }
        };
    }

    render() {
        this.setHouseholdDisplayStyle();
        return (
            <div className="household action-content" style={this.householdStyle}>
                <div className="action-content__header">
                    <span className="action-content__title">{this.textValues.household}</span>
                    <span className="action-content__count-flag">{this.props.voter.household.length}</span>
                </div>

                <HouseholdGeneral
                    voter={this.props.voter}
                    supportStatusConstOptions={this.props.supportStatusConstOptions}
                    householdSupportStatus={this.props.householdSupportStatus}
                    householdVottingStatus={this.props.householdVottingStatus}
                    onHouseholdSupportStatusChange={this.props.onHouseholdSupportStatusChange}
                    onHouseholdVottingStatusChange={this.props.onHouseholdVottingStatusChange}
                    onApplyAllHouseholdStatus={this.props.onApplyAllHouseholdStatus}
                    permissions={this.props.permissions}
                />
                <HouseholdDetails
                    household={this.props.voter.household}
                    supportStatusConstOptions={this.props.supportStatusConstOptions}
                    onHouseholdVoterDetailsChange={this.props.onHouseholdVoterDetailsChange}
                    callNote={this.props.callNote}
                    onUpdatePhoneClick={this.props.onUpdatePhoneClick}
                    phoneKey={this.props.phoneKey}
                    onUpdatePhoneNumber={this.props.onUpdatePhoneNumber}
                    onAddPhoneNumber={this.props.onAddPhoneNumber}
                    permissions={this.props.permissions}
                />
            </div>
        );
    }
}

export default connect() (Household);