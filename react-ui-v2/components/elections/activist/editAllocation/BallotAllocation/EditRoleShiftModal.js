import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';


class EditRoleShiftsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            election_role_shift_id: 0,
            shifts: [],
            buttons: [
                {
                    class: 'btn btn-secondary not-padding',
                    text: 'ביטול',
                    action: this.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'אישור',
                    action: this.isAnotherActivistInBallot.bind(this),
                    disabled: false
                }
            ]
        };

        this.initConstants();
    }

    componentWillMount() {
        this.setAvailableShifts();
    }

    /**
     * Set the available shifts for the activist based on other activists in the same ballot
     * and based the activist's other allocated shifts
     *
     * @return void
     */
    setAvailableShifts() {
      
        let self = this;
        let shifts = [];
        let currentShiftId = null;
        //only calculate if all the lists exists
        if (this.props.electionRolesShifts && this.props.activistAllocatedShifts && this.props.geoItem.other_election_roles) {
            let otherRoles = this.props.geoItem.other_election_roles;
            let allocatedShifts = this.props.activistAllocatedShifts;
            let otherAvailableShifts = {};
            let allocatedAvailableShifts = {};
            //set first available shifts list according to other activists in the same ballot box
            switch (otherRoles.length) {
                //if there are 2 more activist on the ballot box
                case 2:
                    if (otherRoles[0].other_user_lock_id != null &&
                        otherRoles[1].other_user_lock_id != null) {
                            //disable OK button if all the other activists are locked
                            let buttons = { ...this.state.buttons };
                            buttons[1].disabled = true;
                            this.setState({buttons});
                            break;
                    }

                //if there are 1 more activist in the ballot box
                case 1:
                    let locked = false;
                    for (let i=0; i<otherRoles.length; i++) {
                        let otherRole = otherRoles[i];
                        if (otherRole.other_user_lock_id != null) {
                            locked = true;
                            if(otherRole.other_activist_shift_system_name == this.roleShiftsSytemNames.first) {
                                otherAvailableShifts[this.roleShiftsSytemNames.second] = true;
                                otherAvailableShifts[this.roleShiftsSytemNames.count] = true;
                                otherAvailableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
                            } else if (otherRole.other_activist_shift_system_name == this.roleShiftsSytemNames.second) {
                                otherAvailableShifts[this.roleShiftsSytemNames.first] = true;
                                otherAvailableShifts[this.roleShiftsSytemNames.count] = true;
                            } else if (otherRole.other_activist_shift_system_name == this.roleShiftsSytemNames.count) {
                                otherAvailableShifts[this.roleShiftsSytemNames.first] = true;
                                otherAvailableShifts[this.roleShiftsSytemNames.second] = true;
                            }
                        }
                    }
                    if (!locked) {
                        for (let systemName in this.roleShiftsSytemNames) {
                            otherAvailableShifts[this.roleShiftsSytemNames[systemName]] = true;
                        }
                    }
                    break;

                //if there are no other activists in the ballot box
                case 0:
                    for (let systemName in this.roleShiftsSytemNames) {
                         otherAvailableShifts[this.roleShiftsSytemNames[systemName]] = true;
                    }
                    break;
            }
            //create second available shifts list according to the activist's other shifts
            switch (Object.keys(allocatedShifts).length) {
                //the activist only has one shift: this one
                case 1:
                    allocatedAvailableShifts[this.roleShiftsSytemNames.first] = true;
                    allocatedAvailableShifts[this.roleShiftsSytemNames.second] = true;
                    allocatedAvailableShifts[this.roleShiftsSytemNames.count] = true;
                    allocatedAvailableShifts[this.roleShiftsSytemNames.allDay] = true;
                    allocatedAvailableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
                    allocatedAvailableShifts[this.roleShiftsSytemNames.allDayAndCount] = true;
                    break;
                
                //the activist has another shift
                case 2:
                    let current_shift_system_name = this.props.geoItem.election_role_shift_system_name;
                    allocatedAvailableShifts[current_shift_system_name] = true;
                    switch (current_shift_system_name) {
                        case this.roleShiftsSytemNames.first:

                            if (this.roleShiftsSytemNames.second in allocatedShifts) {
                                allocatedAvailableShifts[this.roleShiftsSytemNames.count] = true;
                            } else if (this.roleShiftsSytemNames.count in allocatedShifts) {
                                 allocatedAvailableShifts[this.roleShiftsSytemNames.second] = true;
                            }
                            break;
                        case this.roleShiftsSytemNames.second:
                            if (this.roleShiftsSytemNames.first in allocatedShifts) {
                                allocatedAvailableShifts[this.roleShiftsSytemNames.count] = true;
                                allocatedAvailableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
                            } else if (this.roleShiftsSytemNames.count in allocatedShifts) {
                                allocatedAvailableShifts[this.roleShiftsSytemNames.first] = true;
                                allocatedAvailableShifts[this.roleShiftsSytemNames.allDay] = true;
                            }
                            break;

                        case this.roleShiftsSytemNames.count:
                            if (this.roleShiftsSytemNames.first in allocatedShifts) {
                                allocatedAvailableShifts[this.roleShiftsSytemNames.second] = true;
                                allocatedAvailableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
                            } else if (this.roleShiftsSytemNames.second in allocatedShifts) {
                                allocatedAvailableShifts[this.roleShiftsSytemNames.first] = true;
                            } else if (this.roleShiftsSytemNames.allDay in allocatedShifts) {
                                allocatedAvailableShifts[this.roleShiftsSytemNames.first] = true;
                                allocatedAvailableShifts[this.roleShiftsSytemNames.second] = true;
                            }
                            break;
                    }
                    break;
            }

            //create final available shift list from combination of the two that were created
            let finalAvailableShifts = {};
            for (let key in otherAvailableShifts) {
                if (allocatedAvailableShifts.hasOwnProperty(key)) finalAvailableShifts[key] = true;
            }

            shifts = this.props.electionRolesShifts.filter(function(shift, index) {
                return true;
                // if (finalAvailableShifts.hasOwnProperty(shift.system_name) &&
                    // shift.id != self.props.geoItem.election_role_shift_id) return true;
            });
            currentShiftId = self.props.geoItem.election_role_shift_id;

            //set default shift for select element
            // if (shifts.length > 0) {
            //     currentShiftId = shifts[0].id;
            // }
        }
        this.setState({
            shifts,
            election_role_shift_id: currentShiftId,
            sum: this.props.geoItem.sum
        });
    }

    initConstants() {
        this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
        this.lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';
        this.titles = {
            locked: 'השיבוץ נעול'
        };
    }

    componentWillReceiveProps(nextProps) {
        let shiftIndex = -1;
        if ( !this.props.show && nextProps.show ) {
            let newState = { ...this.state }
            if ( nextProps.geoItem.election_role_shift_system_name != this.roleShiftsSytemNames.allDay ) {
                shiftIndex = nextProps.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.allDay);
                newState.election_role_shift_id = this.props.electionRolesShifts[shiftIndex].id
            } else {
                shiftIndex = nextProps.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.first);
                newState.election_role_shift_id = this.props.electionRolesShifts[shiftIndex].id
            }

            let buttons = this.state.buttons;
            if ( this.isActivistAllocatedAllDay(nextProps.geoItem) ) {
                buttons[1].disabled = true;
                newState.buttons = buttons;
            }
            newState.sum = nextProps.geoItem.sum;
            this.setState(newState)
        }     
    }

    /**
     * This function checks if it's possible
     * to change shift t acivist by checking if
     * 2 shifts are allocated to activist;
     */
    isActivistAllocatedAllDay(geoItem) {
        let allocatedShift = this.props.activistAllocatedShifts;
        let shiftCount = Object.keys(allocatedShift).length;

        switch (shiftCount) {
            case 2:
                if ((this.roleShiftsSytemNames.first in allocatedShift) && (this.roleShiftsSytemNames.secondAndCount in allocatedShift) ||
                    (this.roleShiftsSytemNames.allDay in allocatedShift) && (this.roleShiftsSytemNames.count in allocatedShift)) return true;
                break;
            case 3:
                return true;
                break;
        }
    }

    isAnotherActivistInBallot() {
        let updatedGeoSum = (this.state.sum != this.props.geoItem.sum) ? this.state.sum : null
        this.props.isAnotherActivistInBallot(this.state.election_role_shift_id, updatedGeoSum);
    }

    getBallotType() {
        if ( this.props.geoItem.special_access ) {
            return <div className="accessibility"/>;
        } else { return <div style={{ width: '17px' }}/>;}
    }

    hideModal() {
        let buttons = this.state.buttons;
        buttons[1].disabled = false;

        this.setState({election_role_shift_id: 0, buttons});
        
        this.props.hideEditRoleShiftsModal();
    }

    shiftChange(event) {
        this.setState({election_role_shift_id: event.target.value});
        let budget=this.props.electionRolesBudget;
        //set default budget on change shift
        if(budget){
            let assignment=this.props.geoItem;
            let defaultSum=  budget.find(a=>a.election_role_id==assignment.election_role_id && a.election_role_shift_id==event.target.value)
            if(defaultSum)
            this.setState({sum: defaultSum.budget});
        }
        
    }

    onFieldChange(fieldName, e){
        let newState = { ...this.state}
        let fieldValue = e.target.value;
        if(fieldName == 'sum'){
            if(parseInt(fieldValue) == NaN) fieldValue == 0;
        }
        newState[fieldName] = fieldValue;
        this.setState(newState)
    }
    renderShiftOptions() {

        let shifts = this.state.shifts.map( (item, index) => {
            return <option key={index} value={item.id}>{item.name}</option>;
        });

        return shifts;
    }

    renderShifts() {
        if (!this.props.geoItem.other_election_roles) return;
        let self = this;
        let shifts = [
                (this.state.shifts.length > 0)? 
                <div  key={0} className="td-info">
                    <div className="td-info">
                        <select className="select-lg form-control" value={this.state.election_role_shift_id} 
                              style={{width: 'auto'}}  onChange={this.shiftChange.bind(this)}>
                            {this.renderShiftOptions()}
                        </select>
                    </div>
                </div> :
                <div key={0} className="td-info">{this.props.geoItem.election_role_shift_name}</div>
            ];
        let moreShifts = this.props.geoItem.other_election_roles.map(function(otherGeoItem, index) {
            let lockIcon = (otherGeoItem.other_user_lock_id != null)? (
                <img data-toggle="tooltip" data-placement="left" title={self.titles.locked} src={self.lockIcon}
                         data-original-title={self.titles.locked}/>
                         ) : "";
            return (
            <div key={index + 1} className="td-info">{otherGeoItem.other_activist_shift_name}{lockIcon}</div>
            )
        });
        return shifts.concat(moreShifts);
    }

    renderActivistsDetails() {
        if (!this.props.geoItem.other_election_roles) return;
        let activistDetails = '';
        let otherActivistDetails = '';

        if(this.props.activistDetailsOut)
        var activistDetailsObj=this.props.activistDetailsOut;
        else
        var activistDetailsObj=this.props.activistDetails;

      

        activistDetails = activistDetailsObj.first_name + ' ' + activistDetailsObj.last_name + ' ';
        activistDetails += activistDetailsObj.personal_identity + ' | ';

        let activistBlocks = [
            <div key={0} className="td-info">
                <span className="d-block">{activistDetails}</span>
                <span className="d-block">{this.props.phone_number}</span>
            </div>
            ];
        let moreBlocks = this.props.geoItem.other_election_roles.map(function(otherGeoItem, index) {
            otherActivistDetails = otherGeoItem.other_activist_first_name + ' ' + otherGeoItem.other_activist_last_name + ' ';
            otherActivistDetails += otherGeoItem.other_activist_personal_identity + ' | ';
            return (
                <div key={index + 1} className="td-info">
                    <span className="d-block">{otherActivistDetails}</span>
                    <span className="d-block">{otherGeoItem.other_activist_phone_number}</span>
                </div>
            )
        });
        return activistBlocks.concat(moreBlocks);
    }

    getAllocationErrorMsg() {
        let errorMsg = 'לא ניתן להחליף שיבוץ. הפעיל משובץ במשמרת ';
        let otherShift = null;

        for (let key in this.props.activistAllocatedShifts) {
            if (!this.props.activistAllocatedShifts.hasOwnProperty(key)) continue;
            if (key != this.props.geoItem.election_role_shift_system_name) {
                otherShift = this.props.activistAllocatedShifts[key];
                break;
            }
        }

        errorMsg += otherShift.electionRoleShiftName;
        errorMsg += ' בקלפי ' + this.props.getBallotMiId(otherShift.ballotBoxMiId);
        errorMsg += ' בתפקיד ' + otherShift.electionRoleName;

        return errorMsg;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.geoItem != prevProps.geoItem) {
            this.setAvailableShifts();
        }

        if (this.props.electionRolesShifts != prevProps.electionRolesShifts) {
            this.setAvailableShifts();
        }   

        if (this.props.activistAllocatedShifts != prevProps.activistAllocatedShifts) {
            this.setAvailableShifts();
        } 
    }

    render() {

        return (
            <ModalWindow 
            show={this.props.show} 
            title={this.props.title} 
            buttons={this.state.buttons} 
            buttonX={this.hideModal.bind(this)}
            style={{zIndex: '9001'}}>
                <table className="table table-multi-line multiple-line-duplicated table-frame standard-frame">
                    <thead>
                    <tr>
                        <th>עיר</th>
                        <th>שם אשכול</th>
                        <th>כתובת</th>
                        <th>מספר קלפי</th>
                        <th>סוג קלפי</th>
                        <th>תפקיד</th>
                        <th>סכום</th>
                        <th style={{ minWidth: '80px' }}  className="right-separator-line">משמרת</th>
                        <th>פעיל משובץ</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td>{this.props.geoItem.city_name}</td>
                        <td>{this.props.geoItem.cluster_name}</td>
                        <td>{this.props.geoItem.street}</td>
                        <td>{(this.props.geoItem.mi_id)? this.props.getBallotMiId(this.props.geoItem.mi_id) : ''}</td>
                        <td>{this.getBallotType()}</td>
                        <td>{this.props.geoItem.ballot_box_role_name}</td>
                        <td>
                             <input type="text" className="form-control" value={this.state.sum || 0} onChange={this.onFieldChange.bind(this, 'sum')} disabled={!this.props.canEditSumPermissions}/>
                        </td>
                        <td className="right-separator-line nopaddingR nopaddingL">{this.renderShifts()}</td>
                        <td className="nopaddingR nopaddingL">{this.renderActivistsDetails()}</td>
                    </tr>
                    </tbody>
                </table>

                { ( this.isActivistAllocatedAllDay(this.props.geoItem) ) &&
                    <div style={{color: '#cc0000', fontWeight: 'bold'}}>{this.getAllocationErrorMsg()}</div>
                }
            </ModalWindow>
        );
    }
}

function mapStateToProps(state) {
    return {
        activistDetails: state.elections.activistsScreen.activistDetails,
        electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,
        electionRolesBudget: state.elections.activistsScreen.electionRolesBudget
    }
}

export default connect(mapStateToProps) (EditRoleShiftsModal);