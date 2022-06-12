import React from 'react';
import { connect } from 'react-redux';

import Combo from 'components/global/Combo';

import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';

/**
 * This component enables to admin only to
 * allocate a ballot role to a ballot with
 * no role.
 */
class BallotAdminItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ballot_role: {id: null, name: '', key: null}
        };

        this.initConstants();
    }

    initConstants() {
        this.emptyBallotRole = {id: null, name: '', key: null};

        this.invalidColor = '#cc0000';
    }

    getBallotBoxRoleKey(ballotBoxRoleId) {
        let ballotBoxRoleIndex = this.props.ballotRoles.findIndex(item => item.id == ballotBoxRoleId);

        return this.props.ballotRoles[ballotBoxRoleIndex].key;
    }

    componentWillMount() {
        if ( this.props.item.ballot_box_role_id != null ) {
            let ballot_role = {
                id: this.props.item.ballot_box_role_id,
                name: this.props.item.ballot_box_role_name,
                key: this.getBallotBoxRoleKey(this.props.item.ballot_box_role_id)
            };

            this.setState({ballot_role});
        }
    }

    ballotRoleChange(event) {
        let selectedItem = event.target.selectedItem;
        let ballot_role = this.state.ballot_role;

        if ( null == selectedItem ) {
            ballot_role = {...this.emptyBallotRole, name: event.target.value};
        } else {
            ballot_role = {
                id: selectedItem.id,
                key: selectedItem.key,
                name: selectedItem.name
            };
        }

        this.setState({ballot_role});

        if ( ballot_role.id != null ) {
            if(!ballot_role.key || ballot_role.key=='')
            AllocationAndAssignmentActions.deleteBallotAllocation(this.props.dispatch, this.props.item.key);
            else
            AllocationAndAssignmentActions.updateOrCreateBallotAllocation(this.props.dispatch, this.props.item.key, ballot_role.key);
        }
    }

    getBallotType() {
        if ( this.props.item.special_access ) {
            return <div className="accessibility"/>;
        } else { return <div style={{ width: '17px' }}/>; }
    }

    getActivistDetails(activists_allocations_assignments) {
        let details = '';

        details = activists_allocations_assignments.first_name + ' ' + activists_allocations_assignments.last_name + ' ';
        details += activists_allocations_assignments.personal_identity + ' | ' + activists_allocations_assignments.phone_number;

        return details;
    }

    renderActivists() {
        switch ( this.props.item.all_assignment.length ) {
            case 0:
                return '\u00A0';
                break;

            case 1:
                return this.getActivistDetails(this.props.item.all_assignment[0]);
                break;

            default:
            let self = this;
                return (
                    this.props.item.all_assignment.map(function(item, index) {
                        return (
                            <div key={index} className="td-info">
                                <div className="flexed align-items-center flexed-space-between">
                                    {self.getActivistDetails(item)}
                                </div>
                            </div>
                        )
                    })
                );
                break;
        }
    }

    renderShifts() {
        switch ( this.props.item.all_assignment.length ) {
            case 0:
                return '\u00A0';
                break;

            case 1:
                return this.props.item.all_assignment[0].election_role_shift_name;
                break;

            default:
                return (
                    this.props.item.all_assignment.map(function(item, index) {
                        return (
                            <div key={index} className="td-info">
                            <span className="flexed align-items-center flexed-space-between">
                                {item.election_role_shift_name}
                            </span>
                        </div>
                        )   
                    })
                );
                break;
        }
    }

    validateBallotRole(ballotRoleId) {
        return (ballotRoleId != null);
    }

    validateVariables() {
        this.validInput = true;

        if ( !this.validateBallotRole(this.state.ballot_role.id) ) {
            this.validInput = false;
            this.inputBallotRoleStyle = {borderColor: this.invalidColor};
        }
    }

    initVariables() {
        this.inputBallotRoleStyle = {};
    }

    render() {
        this.initVariables();

        this.validateVariables();

        return(
            <tr>
                <td style={{ width: '8%' }}>{this.props.item.city_name}</td>
                <td style={{ width: '12%' }}>{this.props.item.cluster_name}</td>
                <td style={{ width: '15%' }}>{(this.props.item.street != null && this.props.item.street.length > 0) ? this.props.item.street : '\u00A0'}</td>
                <td style={{ width: '7%' }}>{this.props.getBallotMiId(this.props.item.name)}</td>
                <td style={{ width: '7%' }}>{this.getBallotType()}</td>
                <td style={{ width: '8%' }}>
                    <Combo items={this.props.ballotRoles}
                           maxDisplayItems={10}
                           itemIdProperty="id"
                           itemDisplayProperty="name"
                           className="form-combo-table"
                           inputStyle={this.inputBallotRoleStyle}
                           value={this.state.ballot_role.name}
                           onChange={this.ballotRoleChange.bind(this)}/>
                </td>
                <td style={{ width: '8%' }} className="right-separator-line nopaddingR nopaddingL">{this.renderShifts()}</td>
                <td style={{ width: '452px' }} className="nopaddingR nopaddingL">{this.renderActivists()}</td>
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
        ballotRoles: state.elections.activistsScreen.ballotRoles
    }
}

export default connect(mapStateToProps) (BallotAdminItem);