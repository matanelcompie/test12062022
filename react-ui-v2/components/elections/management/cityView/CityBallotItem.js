import React from 'react';

import Combo from 'components/global/Combo';

import constants from 'libs/constants';

import {dateTimeReversePrint} from 'libs/globalFunctions';
import { GeographicAllocationDto } from '../../../../DTO/GeographicAllocationDto';
import GeographicEntityType from '../../../../Enums/GeographicEntityType';

class CityBallotItem extends React.Component {
    constructor(props) {
		super(props);
        this.state = {
            ballot_role: {
                id: null,
                name: '',
                system_name: null,
                key: null,
                type: null,
            },
            electionRoleShift: {
                id: null,
                name: '',
                key: null,
                system_name: null}
            };

        this.initConstants();
    }

    /**
     * Init constants
     *
     * @return void
     */
    initConstants() {
        this.ballotRoleTypes = constants.activists.ballotRoleType;
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
        this.isBallotsTab = (this.props.parent == 'ballots_tab');
    }

    componentWillMount(){
        const roleID = this.props.ballotData.role;
        let roleData = this.getBallotBoxRoleData(roleID);
        if ( this.props.ballotData.role != null ) {
            let ballot_role = {
                id: roleID,
                name: roleData.name,
                system_name: roleData.system_name,
                key: roleData.key,
                type: roleData.type
            };

            this.setState({ballot_role});
        }
    }
    getBallotBoxRoleData(ballotBoxRoleId) {
        let ballotData = null;
        if(ballotBoxRoleId){
            let ballotBoxRoleIndex = this.props.ballotBoxRoles.findIndex(item => item.id == ballotBoxRoleId);
            ballotData = this.props.ballotBoxRoles[ballotBoxRoleIndex];
        }
        return ballotData;
    }
	renderBallotRole(roleID) {
        let roleData = this.getBallotBoxRoleData(roleID);
		if (!this.props.hasEditRolePermission) {
            return roleData ? roleData.name : '';
		} else {
			return <Combo items={this.props.ballotBoxRoles}
				maxDisplayItems={10}
				itemIdProperty="id"
				itemDisplayProperty="name"
				className="form-combo-table"
				inputStyle={{}}
                value={this.state.ballot_role.name}
				showFilteredList={false}
                disabled={!this.props.ballotExtendedData}
				onChange={this.ballotRoleChange.bind(this)} 
            />;
		}
	}
    ballotRoleChange(event) {
        let selectedItem = event.target.selectedItem;
        let needToDeleteRole = !selectedItem;
        // console.log('this.props.ballotExtendedData', this.props.ballotExtendedData, needToDeleteRole)
        if(this.props.ballotExtendedData.activists_allocations_assignments.length > 0 && needToDeleteRole){
         
            this.props.displayCantDeleteBallotRoleModal();
            return;
        }
        let ballot_role;

        if (needToDeleteRole) {
            ballot_role = {
                        id: null,
                        key: null,
                        system_name: null,
                        name: event.target.value,
                        type: null
            };
        } else {
            ballot_role = {
                id: selectedItem.id,
                key: selectedItem.key,
                name: selectedItem.name,
                system_name: selectedItem.system_name,
                type: selectedItem.type
            };
        }
        this.setState({ ballot_role });
        let ballot_role_key = ballot_role.id ? ballot_role.key : null;
        let ballotBoxData = {
            clusterIndex: this.props.clusterIndex,
            ballotIndex: this.props.index,
            ballotId: this.props.ballotData.id,
            ballotRoleId: ballot_role.id
        }
        this.props.changeRoleToBallotBox(this.props.ballotData.key, ballot_role_key, ballotBoxData);
    }

    /**
     * Change election role shift
     *
     * @param event e
     * @return void
     */
    changeRoleShift(e) {
        let item = e.target.selectedItem;
        if (item == null) {
            this.setState({
               electionRoleShift: {id: null,
                                name: e.target.value,
                                key: null,
                                system_name: null} 
            });
        } else {
            this.setState({
                electionRoleShift: item
            });
        }
    }

    getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

    updateInstructed(electionRoleVoterKey, event) {
        this.props.updateInstructed(electionRoleVoterKey,event);
    }

    updateAppointmentLetter(activistAssignmentId,event){
        this.props.updateAppointmentLetter(activistAssignmentId,event);
    }
  
    getRoleShiftItems(ballotExtendedData) {
        let self = this;
        let roleShiftsItem = null;
        let roleShiftsRows = [];
        let hasAppointmentExportPermission = this.props.hasAppointmentExportPermission;
        let isBallotCounterRole = this.state.ballot_role  && this.state.ballot_role.type == this.ballotRoleTypes.counter ? true : false;
        // console.log('this.state.ballot_role', this.state.ballot_role.type ,this.ballotRoleTypes.counter)
        if (ballotExtendedData && ballotExtendedData.activists_allocations_assignments) {
            let availableShifts = {};
            let ballotAllocation = null;
            if (ballotExtendedData.activists_allocations_assignments.length > 0) {

                roleShiftsRows = ballotExtendedData.activists_allocations_assignments.map(function (item, index) {
                    return (<tr key={index}>
                        <td colSpan="6">
                            <span><strong>{item.shift_name} </strong> - </span>
                            <span> {item.first_name + ' ' + item.last_name} </span>
                            <span>|</span>
                            <span> {item.phone_number}</span>
                        </td>
                        <td>
                            <button type="button" className="btn-link" onClick={self.props.openDeleteRoleModal.bind(self, true, item, self.props.clusterIndex, self.props.clusterId)}>
                                <img className="image-responsive" src={window.Laravel.baseAppURL + 'Images/delete-icon.png'}/>
                            </button>
                        </td>
                        <td title="הדרכת פעיל" style={{ width: '60px' }}>
                            <label htmlFor="inputInstructed" className="fa fa-briefcase" aria-hidden="true" style={{ marginLeft: '10px' }}></label>
                            <input type="checkbox" id="inputInstructed" checked={item.instructed || false}
                                onChange={self.updateInstructed.bind(self,item.election_role_key)} />
                        </td>
                        <td title="כתב מינוי" style={{ width: '60px' }}>
                            {hasAppointmentExportPermission ?
                                <a href={window.Laravel.baseURL + 'api/elections/management/city_view/appointment_letters/' + item.election_role_key +
                                    '/' + item.ballot_box_id + '/export'} target="_blank" style={{ marginLeft: '10px', display: 'inline' }}>
                                    <label className="fa fa-wpforms" aria-hidden="true" style={{ cursor: 'pointer' }}></label>
                                </a>
                                : <label className="fa fa-wpforms" aria-hidden="true" style={{ marginLeft: '10px' }}></label>
                            }
                            <input type="checkbox" id="inputAppointment_letter" checked={item.appointment_letter || false}
                                onChange={self.updateAppointmentLetter.bind(self,item.activist_assignment_id)} />
                        </td>

                    </tr>)
                });
                // console.log('isBallotCounterRole',isBallotCounterRole, ballotExtendedData.activists_allocations_assignments.length)
                //switch on allocated shifts for available shifts
                switch (ballotExtendedData.activists_allocations_assignments.length) {
                    case 1:
                        if(isBallotCounterRole){
                            break;
                        }
                        if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.first) {
                            availableShifts[this.roleShiftsSytemNames.second] = true;
                            availableShifts[this.roleShiftsSytemNames.count] = true;
                            availableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
                            ballotAllocation = this.renderBallotAlloctionMultiShifts(availableShifts);
                            roleShiftsRows.push(ballotAllocation);
                        } else if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.second) {
                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.first);
                            roleShiftsRows.unshift(ballotAllocation);

                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.count);
                            roleShiftsRows.push(ballotAllocation);                                                         
                        } else if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.allDay) {
                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.count);
                            roleShiftsRows.push(ballotAllocation);                            
                        } else if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.count) {
                            availableShifts[this.roleShiftsSytemNames.first] = true;
                            availableShifts[this.roleShiftsSytemNames.second] = true;
                            availableShifts[this.roleShiftsSytemNames.allDay] = true;
                            ballotAllocation = this.renderBallotAlloctionMultiShifts(availableShifts);
                            roleShiftsRows.unshift(ballotAllocation);
                        } else if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.secondAndCount) {
                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.first);
                            roleShiftsRows.unshift(ballotAllocation);                            
                        }
                        break;

                    case 2:
                        if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.second) {
                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.first);
                            roleShiftsRows.unshift(ballotAllocation);
                        } else if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.first &&
                                    ballotExtendedData.activists_allocations_assignments[1].shift_system_name == this.roleShiftsSytemNames.count) {
                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.second);
                            roleShiftsRows.splice(1, 0, ballotAllocation);
                        } else if (ballotExtendedData.activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.first &&
                                    ballotExtendedData.activists_allocations_assignments[1].shift_system_name == this.roleShiftsSytemNames.second) {
                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.count);
                            roleShiftsRows.push(ballotAllocation);                            
                        }
                        break;
                }

            } else { // Ballot does not have any shift
                if(!isBallotCounterRole){
                    availableShifts[this.roleShiftsSytemNames.first] = true;
                    availableShifts[this.roleShiftsSytemNames.second] = true;
                    availableShifts[this.roleShiftsSytemNames.allDay] = true;
                    availableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
                    availableShifts[this.roleShiftsSytemNames.allDayAndCount] = true; 
                }
                availableShifts[this.roleShiftsSytemNames.count] = true;
              
                ballotAllocation = this.renderBallotAlloctionMultiShifts(availableShifts);
                roleShiftsRows.push(ballotAllocation);
            } 
           
            roleShiftsItem = <table className="table table-in-tr no-border table-striped" style={{ margin: '0' }}>
                <tbody>{roleShiftsRows}</tbody>
            </table>
        }

        return roleShiftsItem;
    }
    

    showAddAssignmentModal(ballotShiftRole, shiftName, e){

        if (!ballotShiftRole || !ballotShiftRole.id) { return; }
        let electionRoleSystemName=null;
        switch (ballotShiftRole.type){
            case this.ballotRoleTypes.observer:
                electionRoleSystemName =  this.electionRoleSytemNames.observer
                break;
            case this.ballotRoleTypes.counter:
                electionRoleSystemName =  this.electionRoleSytemNames.counter
                break;
            default:
                electionRoleSystemName =  this.electionRoleSytemNames.ballotMember

        }
        let geographicAllocationDto=new GeographicAllocationDto(GeographicEntityType.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX,this.props.ballotData.id)
        this.props.showAddAssignmentModal(geographicAllocationDto,electionRoleSystemName,shiftName);
    }

    /**
     * Render shift info single text line
     *
     * @param string shiftName
     * @return void
     */
    renderBallotAlloctionSingleShift(shiftName) {
        let shiftItem = this.props.electionRolesShifts.find(item => shiftName == item.system_name);
        let ballotShiftRole = this.props.hasEditActivistPermission ? this.state.ballot_role : this.props.ballotData;
        let labelText = 'ללא משמרת';
        if (shiftName != this.roleShiftsSytemNames.allDayAndCount) {
            labelText = shiftItem.name + " - ללא משמרת";
        }
        return (
            <tr key={shiftName}>
                <td colSpan='6'>
                    <label> {labelText} </label>
                </td>
                <td colSpan="2" style={{ width: '120px' }}>
                    <button title="הוסף תפקיד" className="btn btn-primary left"
                        disabled ={!ballotShiftRole}
                        onClick={this.showAddAssignmentModal.bind(this, ballotShiftRole, shiftName)}>
                        <span>+</span>
                        <span>הוסף תפקיד</span>
                    </button>
                </td>
            </tr>
        )
    }

    /**
     * Render shift info with Combo for multi select shifts
     *
     * @param object availableShifts
     * @return void
     */
    renderBallotAlloctionMultiShifts(availableShifts) {
        let shiftItems = this.props.electionRolesShifts.filter(item => availableShifts.hasOwnProperty(item.system_name));
        let ballotShiftRole = this.props.hasEditActivistPermission ? this.state.ballot_role : this.props.ballotData;
        let comboStyle = {width: '200px'};
        let inputStyle = {};
        if (!this.state.electionRoleShift.id && this.state.electionRoleShift.name.length > 0) {
            inputStyle.borderColor = 'red';
        }
        return (
            <tr key={shiftItems[0].system_name}>
                <td colSpan='6'>
                    <Combo className="inline"
                            items={shiftItems}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            onChange={this.changeRoleShift.bind(this)}
                            style={comboStyle}
                            inputStyle={inputStyle}/>
                     <label> - ללא משמרת</label>  
                </td>
                <td colSpan="2" style={{ width: '120px' }}>
                    <button title="הוסף תפקיד" className="btn btn-primary left"
                        disabled ={!ballotShiftRole || !this.state.electionRoleShift.id}
                        onClick={this.showAddAssignmentModal.bind(this, ballotShiftRole, this.state.electionRoleShift.system_name)}>
                        <span>+</span>
                        <span>הוסף תפקיד</span>
                    </button>
                </td>
            </tr>
        )
    }

    render() {
        let isBallotsTab = this.isBallotsTab; // For ballot only tab
        const ballotData = this.props.ballotData;
        const ballotExtendedData = this.props.ballotExtendedData;
        let roleShiftsItem = this.getRoleShiftItems(ballotExtendedData);
        let voteTime = '-';
        let voteDate = '-';

        if(ballotExtendedData && ballotExtendedData.last_vote_date){
            voteTime = ballotExtendedData.last_vote_date.created_at.substring(11);
            voteDate = dateTimeReversePrint(ballotExtendedData.last_vote_date.created_at, false, false);
        }
        return (
            <tr>
                <td>{this.props.index + 1}</td>
                <td>{this.getBallotMiId(ballotData.mi_id)}</td>
                {isBallotsTab && <td>{ballotExtendedData.cluster_name}</td>}
                <td>{this.renderBallotRole(ballotData.role)}</td>
                {isBallotsTab && <td>{ ballotData.hot == 1 ? "כן" : '' }</td> }
                {!isBallotsTab && <td><div style={{ width: '17px' }} className={ballotData.special_access == 1 ? "accessibility" : ''}></div></td> }
                <td>{ballotData.voter_count}</td>
                <td>{ballotExtendedData ? ballotExtendedData.previous_shas_votes_count : <i className="fa fa-spinner fa-spin"></i>}</td>
                <td>{ballotExtendedData ? ballotExtendedData.voter_supporters_count : <i className="fa fa-spinner fa-spin"></i>}</td>
                {/* <td>{ballotData.votes_count ? ballotData.votes_count : '-'}</td> */}
                <td>{ballotExtendedData ? <span title={voteDate}>{voteTime}</span> : <i className="fa fa-spinner fa-spin"></i>}</td>
                <td style={{ padding: '0px' }}>
                    {roleShiftsItem}
                </td>
            </tr>
        )
    }
}
export default CityBallotItem;