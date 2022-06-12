import React from 'react';

import ComboSelect from 'components/common/ComboSelect';
import { getCtiPermission } from 'libs/globalFunctions';


class HouseholdGeneral extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.textValues = {
            household: 'בית אב',
            lastName: 'שם משפחה',
            supportStatus: 'סטטוס תמיכה',
            vottingStatus: 'סטטוס הצבעה',
            applyAll: 'החל על הכל',
        };
    }

    initVariables() {
        this.supportStatusConstOptionsArr = this.props.supportStatusConstOptions.map(value => {
            return { value: value.value, label: value.label };
        });

        this.supportStatus = this.props.householdSupportStatus;
        if (this.props.voter.support_status_tm && !this.supportStatus) {
            this.supportStatus = this.props.voter.support_status_tm;
        }

        this.vottingStatusArr = [
            { value: true, label: 'כן' },
            { value: false, label: 'לא' },
        ];

        this.voteStatus = this.props.householdVottingStatus;
        if (this.props.voter.vote_status && !this.voteStatus)
            this.voteStatus = this.props.voter.vote_status;
    }
    render() {
 
        this.initVariables();

        return (
            <div className="household-general">
                <div className="household-general__detail">
                    <div className="household-general__label">{this.textValues.lastName}</div>
                    <div className="household-general__value">{this.props.voter.last_name}</div>
                </div>
                {getCtiPermission(this.props.permissions, 'support', true) &&
                    <div className="household-general__detail">
                        <div className="household-general__label">{this.textValues.supportStatus}</div>
                        <div className="household-general__value">
                            <ComboSelect
                                value={this.supportStatus}
                                name="support_status_id"
                                options={this.supportStatusConstOptionsArr}
                                onChange={this.props.onHouseholdSupportStatusChange}
                                itemDisplayProperty="label"
                                itemIdProperty="value"
                                multiSelect={false}
                                className="household-general__select"
                            />
                            <div className="household-general__apply-all" onClick={() => this.props.onApplyAllHouseholdStatus(this.props.householdSupportStatus, 'support_status_tm')}>
                                {this.textValues.applyAll}
                            </div>
                        </div>
                    </div>
                }
                {getCtiPermission(this.props.permissions, 'vote', true) &&
                    <div className="household-general__detail">
                        <div className="household-general__label">{this.textValues.vottingStatus}</div>
                        <div className="household-general__value">
                            <ComboSelect
                                value={this.voteStatus}
                                name="vote_status"
                                options={this.vottingStatusArr}
                                onChange={this.props.onHouseholdVottingStatusChange}
                                itemDisplayProperty="label"
                                itemIdProperty="value"
                                multiSelect={false}
                                className="household-general__select"
                            />
                            <div className="household-general__apply-all" onClick={() => this.props.onApplyAllHouseholdStatus(this.props.householdVottingStatus, 'vote_status')}>
                                {this.textValues.applyAll}
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default HouseholdGeneral;