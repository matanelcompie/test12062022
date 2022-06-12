import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import Combo from 'components/global/Combo';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';
import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';


class BallotItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            election_role_shift_id: null,
            election_role_shift_name: '',

            ballot_role: { id: null, name: '', key: null, type: null },
            shiftList: []
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;

        this.buttonTexts = {
            allocate: 'שבץ',
            replace: 'החלף'
        };

        this.lockIcon = window.Laravel.baseAppURL + 'Images/lock.png';

        this.invalidColor = '#cc0000';
    }

    getBallotBoxRoleKey(ballotBoxRoleId) {
        let ballotBoxRoleIndex = this.props.ballotRoles.findIndex(item => item.id == ballotBoxRoleId);
        console.log('ballotBoxRoleIndex', ballotBoxRoleIndex)
        if(ballotBoxRoleIndex != -1){
            return this.props.ballotRoles[ballotBoxRoleIndex].key;
        }
    }

    componentWillMount() {
        let shiftIndex = null;
        let currentActivistShiftSystemName = null;
        let isCounterRole = false;
        if (this.props.item.ballot_box_role_id != null) {
            let ballot_role = {
                id: this.props.item.ballot_box_role_id,
                name: this.props.item.ballot_box_role_name,
                key: this.getBallotBoxRoleKey(this.props.item.ballot_box_role_id),
                type: this.props.item.role_type,
            };

            this.setState({ ballot_role });
            isCounterRole = (ballot_role && ballot_role.type == constants.activists.ballotRoleType.counter)
        }

            switch (this.props.item.all_assignment.length) {
                case 0:
                    if(isCounterRole) {
                        shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.count);
                    } else {
                        shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.allDayAndCount);
                    }
                    this.setState({ election_role_shift_id: this.props.electionRolesShifts[shiftIndex].id });
                    break;

                case 1:
                    currentActivistShiftSystemName = this.props.item.all_assignment[0].election_role_shift_system_name;

                    switch (currentActivistShiftSystemName) {
                        case this.roleShiftsSytemNames.first:
                            shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.second);

                            this.setState({ election_role_shift_id: this.props.electionRolesShifts[shiftIndex].id,
                                            election_role_shift_name: this.props.electionRolesShifts[shiftIndex].name});
                            break;

                        case this.roleShiftsSytemNames.second:
                        case this.roleShiftsSytemNames.count:
                        case this.roleShiftsSytemNames.secondAndCount:
                            shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.first);

                            this.setState({ election_role_shift_id: this.props.electionRolesShifts[shiftIndex].id,
                                            election_role_shift_name: this.props.electionRolesShifts[shiftIndex].name});
                            break;

                        case this.roleShiftsSytemNames.allDay:
                            shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.count);

                            this.setState({ election_role_shift_id: this.props.electionRolesShifts[shiftIndex].id,
                                            election_role_shift_name: this.props.electionRolesShifts[shiftIndex].name});
                            break;
                    }
                    break;

                case 2:
                    let electionRoles = this.props.item.all_assignment;
                    let shiftIndex = -1;
                    if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first && 
                        electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.second) {

                        shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.count); 

                    } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first && 
                                electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.count) {

                        shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.second); 

                    } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.second && 
                                electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.count) {

                        shiftIndex = this.props.electionRolesShifts.findIndex(item => item.system_name == this.roleShiftsSytemNames.first); 

                    }

                    if (shiftIndex != -1) {
                        this.setState({ election_role_shift_id: this.props.electionRolesShifts[shiftIndex].id,
                                        election_role_shift_name: this.props.electionRolesShifts[shiftIndex].name});
                    }
                    break;                
            }
        



        if (this.props.electionRolesShifts.length > 0) this.createShiftList(this.props.electionRolesShifts);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.electionRolesShifts.length != nextProps.electionRolesShifts.length) this.createShiftList(nextProps.electionRolesShifts);
    }

    /**
     * Create shift list according to already allocated shifts of the ballot
     *
     * @param array electionRolesShifts
     * @return void
     */
    createShiftList(electionRolesShifts) {

        //init variables
        let shiftList = null;
        let electionRoles = this.props.item.all_assignment;
        let availableShifts = [];

        //create available shifts list
        switch (electionRoles.length) {

            case 0:
                break;

            case 1:
                if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first) {
                    availableShifts = [
                        this.roleShiftsSytemNames.second,
                        this.roleShiftsSytemNames.secondAndCount,
                        this.roleShiftsSytemNames.count
                    ];
                } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.second) {
                    availableShifts = [
                        this.roleShiftsSytemNames.first,
                        this.roleShiftsSytemNames.count
                    ];                    
                } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.count) {
                    availableShifts = [
                        this.roleShiftsSytemNames.first,
                        this.roleShiftsSytemNames.second
                    ];                    
                } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.secondAndCount) {
                    availableShifts = [
                        this.roleShiftsSytemNames.first
                    ];                    
                } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.allDay) {
                    availableShifts = [
                        this.roleShiftsSytemNames.count
                    ];                    
                }
                break;

            case 2:
                if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first && 
                    electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.second) {
                    availableShifts = [
                        this.roleShiftsSytemNames.count
                    ];                    
                } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first && 
                            electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.count) {
                    availableShifts = [
                        this.roleShiftsSytemNames.second
                    ];                    
                } else if (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.second && 
                            electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.count) {
                    availableShifts = [
                        this.roleShiftsSytemNames.first
                    ];                   
                }
                break;
        }
        //create shift list from available list
        if (electionRoles.length == 0) shiftList = electionRolesShifts;
        else {
            if (availableShifts.length == 0) shiftList = [];
            else shiftList = electionRolesShifts.filter(function(item) {
                if (availableShifts.indexOf(item.system_name) != -1) return true;
            });
        }
        //set new shift list
        this.setState({
            shiftList: shiftList
        });
    }

    replaceShift(geoItem) {
        this.props.replaceShift(this.props.item, geoItem);
    }

    allocateShift() {
        let shiftIndex = this.props.electionRolesShifts.findIndex(item => item.id == this.state.election_role_shift_id);
        this.props.allocateShift(this.props.item.key, this.props.electionRolesShifts[shiftIndex].key);
    }

    ballotRoleChange(event) {
        let selectedItem = event.target.selectedItem;

        //Check if ballot as geo allocations:
        let activists_allocations_assignments = this.props.item.all_assignment;

        if(!selectedItem && activists_allocations_assignments && activists_allocations_assignments.length > 0 && activists_allocations_assignments[0].election_role_shift_id!=null){
		    this.props.dispatch({ type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: 'לא ניתן למחוק הקצאה לקלפי משובץ' });
            return;
        }

        let ballot_role = this.state.ballot_role;
        if (null == selectedItem) {
            ballot_role = { ...this.emptyBallotRole, name: event.target.value };
        } else {
            ballot_role = {
                id: selectedItem.id,
                key: selectedItem.key,
                name: selectedItem.name,
                type: selectedItem.type,
            };
        }

        this.setState({ ballot_role });
        let ballot_role_key = ballot_role.id ? ballot_role.key : null;
        if (ballot_role.id != null || event.target.value == '') { // ballot role had choosen not insert value
   
                if(!ballot_role_key ||ballot_role_key=='')
                AllocationAndAssignmentActions.deleteBallotAllocation(this.props.dispatch, this.props.item.key);
                else
                AllocationAndAssignmentActions.updateOrCreateBallotAllocation(this.props.dispatch, this.props.item.key, ballot_role_key);
        }
    }

    shiftChange(event) {
        this.setState({ election_role_shift_id: event.target.value });
    }

    getAddress() {
        return (this.props.item.street != null && this.props.item.street.length > 0) ? this.props.item.street : '\u00A0';
    }

    renderShiftActivistDetails(ballotItem) {
        let activistDetails = ballotItem.first_name + ' ' + ballotItem.last_name + ' ' + ballotItem.personal_identity + ' | ';

        return (
            [
                <span key={0}>{activistDetails}</span>,
                <span key={1}>{ballotItem.phone_number}</span>
            ]
        );
    }

    renderBallotType() {
        if (this.props.item.special_access) {
            return <div className="accessibility" />;
        } else {
            return <div style={{ width: '17px' }}/>;
        }
    }

    renderShifts() {
        let self = this;
        let shiftList = this.state.shiftList;
        let isCounterRole = (this.state.ballot_role && this.state.ballot_role.type == constants.activists.ballotRoleType.counter)

        if(isCounterRole) {
            shiftList = self.props.electionRolesShifts.filter(function(item) {
                if (self.roleShiftsSytemNames.count == item.system_name) return true;
            });
        }
        // console.log('shiftList', shiftList, isCounterRole, this.state.ballot_role)
        return shiftList.map(function (item, index) {
            return <option key={index} value={item.id}>{item.name}</option>;
        });
    }

    renderColumnShift() {
        switch (this.props.item.all_assignment.length) {
            case 0:
                return (
                    <div className="td-info">
                        <span className="flexed content-info" />
                    </div>
                );
                break;
            
            default:
                return (
                    this.props.item.all_assignment.map(function(shift, index) {
                        return (
                            <div key={index} className="td-info">
                            <span className="flexed content-info">
                                {shift.election_role_shift_name}
                            </span>
                        </div>
                        )
                    })
                )
                break;
        }
    }

    /**
     * This function check a locked
     * activist is allocated to the
     * ballot.
     *
     * @param geoItem
     * @returns {XML}
     */
    replaceOrDisplayLock(geoItem, allocateBtnDisabled) {
 
        const lockTitle = 'המשמרת משובצת לפעיל נעול';

        if (geoItem.user_lock_id) {
            return (
                <span title={lockTitle}>
                    <img data-toggle="tooltip" data-placement="left" title={lockTitle} src={this.lockIcon}
                        data-original-title={lockTitle} />
                </span>
            );
        } else {
            // return (
            //     <button title={this.buttonTexts.replace}
            //         className="btn btn-primary srch-btn-sm minimize-width btn-negative"
			// 		disabled={allocateBtnDisabled }
            //         onClick={this.replaceShift.bind(this, geoItem)}>
            //         {this.buttonTexts.replace}
            //     </button>
            // );
        }
    }

    /**
     * Return true if user can allocate third shift
     *
     * @return void
     */
    canAllocateThirdShift() {
        let electionRoles = this.props.item.all_assignment;
        if ((electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first && 
            electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.second) ||
            (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.first && 
            electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.count) ||
            (electionRoles[0].election_role_shift_system_name == this.roleShiftsSytemNames.second && 
            electionRoles[1].election_role_shift_system_name == this.roleShiftsSytemNames.count)) {
            return true;
        } else {
            return false;
        }
    }

    renderForms() {
        let allocateBtnDisabled = false;
        switch (this.props.currentTabRoleSystemName) {
          case this.electionRoleSytemNames.ballotMember:
            allocateBtnDisabled = this.props.item.role_type != 0;
            break;
          case this.electionRoleSytemNames.observer:
            allocateBtnDisabled = this.props.item.role_type != 1;
            break;
          case this.electionRoleSytemNames.counter:
            allocateBtnDisabled = this.props.item.role_type != 2;
            break;
        }
        switch (this.props.item.all_assignment.length) {
            case 0:
                return (
                    <div className="flexed align-items-center flexed-space-between">
                        <div>
                            <span className="item-space">שבץ למשמרת</span>
                            <select value={this.state.election_role_shift_id} className="ballot-shift-select"
                                onChange={this.shiftChange.bind(this)}>
                                {this.renderShifts()}
                            </select>
                        </div>
                        <div className="item-space">
                            <button title="שבץ" className="btn new-btn-primary srch-btn-sm minimize-width"
								disabled={allocateBtnDisabled }
                                onClick={this.allocateShift.bind(this)}>שבץ</button>
                        </div>
                    </div>
                );
                break;

            case 1:
                if ((this.props.item.all_assignment[0].election_role_shift_system_name == this.roleShiftsSytemNames.allDayAndCount)
                || this.props.item.all_assignment[0].election_role_shift_system_name==this.roleShiftsSytemNames.count 
                && this.props.item.all_assignment[0].election_role_system_name==this.electionRoleSytemNames.counter) {
                    return (
                        <div className="td-info">
                            <div className="flexed align-items-center flexed-space-between">
                                <div>{this.renderShiftActivistDetails(this.props.item.all_assignment[0])}</div>
                                <div className="item-space">
                                    {this.replaceOrDisplayLock(this.props.item.all_assignment[0], allocateBtnDisabled)}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        [
                            <div key={0} className="td-info">
                                <div className="flexed align-items-center flexed-space-between">
                                    <div>{this.renderShiftActivistDetails(this.props.item.all_assignment[0])}</div>
                                    <div className="item-space">
                                        {this.replaceOrDisplayLock(this.props.item.all_assignment[0], allocateBtnDisabled)}
                                    </div>
                                </div>
                            </div>,
                            <div key={1} className="td-info">
                                <div className="flexed align-items-center flexed-space-between">
                                    <div className="ballot-shift">
                                        <span className="item-space">שבץ למשמרת</span>
                                        <select value={this.state.election_role_shift_id} className="ballot-shift-select"
                                            onChange={this.shiftChange.bind(this)}>
                                            {this.renderShifts()}
                                        </select>
                                    </div>
                                    <div className="item-space">
                                        <button title={this.buttonTexts.allocate} disabled={allocateBtnDisabled } className="btn btn-primary srch-btn-sm minimize-width"
                                            onClick={this.allocateShift.bind(this)}>
                                            {this.buttonTexts.allocate}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ]
                    );
                }
                break;

            case 2:
                let shifts = [
                        <div key={0} className="td-info">
                            <div className="flexed align-items-center flexed-space-between">
                                <div>{this.renderShiftActivistDetails(this.props.item.all_assignment[0])}</div>
                                <div className="item-space">
                                    {this.replaceOrDisplayLock(this.props.item.all_assignment[0], allocateBtnDisabled)}
                                </div>
                            </div>
                        </div>,
                        <div key={1} className="td-info">
                            <div className="flexed align-items-center flexed-space-between">
                                <div>{this.renderShiftActivistDetails(this.props.item.all_assignment[1])}</div>
                                <div className="item-space">
                                    {this.replaceOrDisplayLock(this.props.item.all_assignment[1], allocateBtnDisabled)}
                                </div>
                            </div>
                        </div>
                    ]
                if (this.canAllocateThirdShift()) {
 

                  let thirdShift = (
                    <div key={2} className="td-info">
                      <div className="flexed align-items-center flexed-space-between">
                        <div className="ballot-shift">
                          <span className="item-space">שבץ למשמרת</span>
                          <select
                            value={this.state.election_role_shift_id}
                            className="ballot-shift-select"
                            onChange={this.shiftChange.bind(this)}>
                            {this.renderShifts()}
                          </select>
                        </div>
                        <div className="item-space">
                          <button
                            title={this.buttonTexts.allocate}
                            disabled={allocateBtnDisabled}
                            className="btn btn-primary srch-btn-sm minimize-width"
                            onClick={this.allocateShift.bind(this)}>
                            {this.buttonTexts.allocate}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                  shifts.push(thirdShift);
                }
                return shifts;
                break;

            case 3:
                let self = this;
                return this.props.item.all_assignment.map(function(item, index) {
                    return (
                        <div key={index} className="td-info">
                            <div className="flexed align-items-center flexed-space-between">
                                <div>{self.renderShiftActivistDetails(item)}</div>
                                <div className="item-space">
                                    {self.replaceOrDisplayLock(item, allocateBtnDisabled)}
                                </div>
                            </div>
                        </div>
                    )
                });
        }
    }

    renderBallotRole() {
        if (!this.checkPermission()) {
            return (null == this.props.item.ballot_box_role_id) ? '\u00A0' : this.props.item.ballot_box_role_name;
        } else {
            return <Combo items={this.props.ballotRoles}
                maxDisplayItems={10}
                itemIdProperty="id"
                itemDisplayProperty="name"
                className="form-combo-table"
                inputStyle={this.inputBallotRoleStyle}
                value={this.state.ballot_role.name}
                showFilteredList={false}
                onChange={this.ballotRoleChange.bind(this)} />;
        }
    }

    checkPermission() {
        let system_name = this.electionRoleSytemNames.ballotMember ? 'ballot_member' : 'observer';
        return this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.' + system_name + '.ballot_role_edit'] == true
    }
    validateBallotRole() {
        if (!this.checkPermission()) {
            return true;
        } else {
            return (this.state.ballot_role.id != null || this.state.ballot_role.name == '');
        }
    }

    validateVariables() {
        if (!this.validateBallotRole(this.state.ballot_role.id)) {
            this.inputBallotRoleStyle = { borderColor: this.invalidColor };
        }
    }

    initVariables() {
        this.inputBallotRoleStyle = {};
    }

    render() {
		 
        this.initVariables();

        this.validateVariables();

        return (
            <tr>
                <td style={{ width: '8%' }}>{this.props.item.city_name}</td>
                <td style={{ width: '12%' }}>{this.props.item.cluster_name}</td>
                <td style={{ width: '15%' }}>{this.getAddress()}</td>
                <td style={{ width: '7%' }}>{this.props.getBallotMiId(this.props.item.name)}</td>
                <td style={{ width: '7%' }}>{this.renderBallotType()}</td>
                <td style={{ width: '8%' }}>{this.renderBallotRole()}</td>
                <td style={{ width: '8%' }} className="right-separator-line nopaddingR nopaddingL" width="5%">
                    {this.renderColumnShift()}
                </td>
                <td style={{ width: '452px' }} className="nopaddingR nopaddingL">
                    {this.renderForms()}
                </td>
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        ballotRoles: state.elections.activistsScreen.ballotRoles,
        electionRolesShifts: state.elections.activistsScreen.electionRolesShifts
    }
}

export default connect(mapStateToProps)(BallotItem);