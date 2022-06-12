import React from 'react';
import { connect } from 'react-redux';

import ModalAddAllocation from 'components/elections/activist/ModalAddAllocation/ModalAddAllocation';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import * as AllocationAndAssignmentActions from '../../../../../actions/AllocationAndAssignmentActions';


import {isMobilePhone, arraySort } from 'libs/globalFunctions';
import {renderLoaderIcon } from '../../../../../libs/HelperFunctions';
import {checkIfBallotHasFreeAllocation } from '../../../../../libs/services/models/ballotService';

import DeleteBallotRoleModal from '../DeleteBallotRoleModal';
import CityBallotItem from '../CityBallotItem';
import { ActivistUpdateDto } from '../../../../../DTO/ActivistUpdateDto';
import ModalAddAssignment from '../../../activist/ModalAddAllocation/ModalAddAssignment';
import { GeographicAllocationDto } from '../../../../../DTO/GeographicAllocationDto';

class CityBallots extends React.Component {
	constructor(props) {
		super(props);
		this.initState = {
			ballotsDataToDisplay: 'all_ballots',
			displayDeleteRoleModal: false,
			displayOnlyNotAllocated: false,
			showAddAssignmentModalDetails:false
		}
		this.state = { ...this.initState }
		this.checkPermissions();
	}

	componentWillMount(){

	}

    checkPermissions(){
		let currentUser = this.props.currentUser;
		this.hasBallotEditRolePermission = currentUser.admin || currentUser.permissions['elections.activists.city_summary.ballot_role_edit']
		this.hasEditActivistPermission = currentUser.admin || currentUser.permissions['elections.activists.city_summary.edit'];
		this.hasAppointmentExportPermission = currentUser.admin || currentUser.permissions['elections.activists.city_summary.appointment_letter'];
	}

	setBallotActiveState(name) {
		this.setState({ ballotsDataToDisplay: name })
	}
	editElectionRoleDetails(fieldName, roleKey, event, clusterIndex = null, ballotId = null){
		let fieldValue = event.target.checked ? 1 : 0;
		let editObj = {};
		editObj[fieldName] = fieldValue;
		let promise;
		let actionType;
		if(fieldName == 'instructed'){
			actionType = 'editRole';
			promise = ElectionsActions.editElectionRoleDetails(this.props.dispatch, roleKey, editObj, clusterIndex, 'city_view' );
		}else{
			actionType = 'editShift';
			promise = ElectionsActions.editElectionRoleShiftDetails(this.props.dispatch, roleKey, editObj, clusterIndex, 'city_view');
		}
		promise.then(() => {
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_BALLOT_ACTIVISTS_ROW_DETAILS,
				roleKey, editObj , actionType, ballotId
			});
		});
	}

	
	updateInstructed(electionRoleVoterKey,event){
		let fieldValue = event.target.checked ? 1 : 0;
		//--details for redux
        let editObj = {};
		let roleKey=electionRoleVoterKey;
		editObj.instructed= fieldValue;
		let actionType = 'editRole';
		//--

        let activistUpdate = new ActivistUpdateDto();
		activistUpdate.electionRoleByVoterKey=electionRoleVoterKey;
		activistUpdate.instructed=fieldValue;
		promise = ElectionsActions.updateActivistDto(this.props.dispatch, activistUpdate);

			promise.then(() => {
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_BALLOT_ACTIVISTS_ROW_DETAILS,
				roleKey, editObj , actionType
			});
		});
	}

	updateAppointmentLetter(activistAllocationAssignmentId,event){
		
		let fieldValue = event.target.checked ? 1 : 0;
		//--details for redux
        let editObj = {};
		let roleKey=activistAllocationAssignmentId;
		editObj.appointment_letter= fieldValue;
		let actionType = 'editShift';
		//--

        let activistUpdate = new ActivistUpdateDto();
		activistUpdate.activistAllocationAssignmentId=roleKey;
		activistUpdate.appointmentLetter=fieldValue;
		promise = ElectionsActions.updateActivistDto(this.props.dispatch, activistUpdate);
		promise.then(() => {
			this.props.dispatch({
				type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_BALLOT_ACTIVISTS_ROW_DETAILS,
				roleKey, editObj , actionType
			});
		});
	}

	displayCantDeleteBallotRoleModal() {
		this.props.dispatch({ type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: 'לא ניתן למחוק הקצאה לקלפי משובץ' });
	}
	changeRoleToBallotBox(ballotKey, ballotRoleKey, ballotBoxData) {
		const promise = AllocationAndAssignmentActions.updateOrCreateBallotAllocation(this.props.dispatch, ballotKey, ballotRoleKey);
		promise.then((response) => {
			this.props.dispatch({
                type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.CHANGE_BALLOT_BOX_ROLE,
                ballotBoxData: ballotBoxData, balloBoxtRole: response.data.data,
            });
		})
	}

	// Delete activist roles:
	openDeleteRoleModal(bool, roleDeletedData = null, clusterIndex = null, clusterId =null ) {
		this.setState({ 
			displayDeleteRoleModal: bool,
			roleDeletedData: roleDeletedData,
			// clusterId: clusterId,
		})
	}
	// Delete ballot role
	DeleteBallotRole(deleteType) {
		let roleDeletedData = this.state.roleDeletedData;
		// Delete election role Completely.
		let promise;
		if (deleteType == 'election_role') {
			promise = ElectionsActions.deleteElectionActivistRoleFromCityActivists(this.props.dispatch, roleDeletedData, true, 'city_view');
		} else {
			// Delete only role shift
			promise = ElectionsActions.deleteActivistRoleGeoFromCityActivists(this.props.dispatch, roleDeletedData, true, 'city_view');
		}
		let cityKey = this.props.currentCity.key;

		promise.then(() => {
			ElectionsActions.loadCityBallotsFullData(this.props.dispatch , cityKey, this.props.parentEntityType); 
		})
	}
	onCheckBoxChange(fieldName, e){
		let obj = new Object();
		obj[fieldName] = e.target.checked;
		this.setState(obj);
	}
	renderBallotRows(){
	
		let ballotsFullData = this.props.ballotsFullData;
		if(this.state.displayOnlyNotAllocated){
			debugger
			ballotsFullData = ballotsFullData.filter((item) => {
				// Check partly geo allocations
				return checkIfBallotHasFreeAllocation(item.activists_allocations_assignments, item.ballot_role_system_name);
				// item.election_roles_geographical.length == 0; // Check partly geo allocations
			})
		}
		return ballotsFullData.map((ballot, index) => {

			return (
				<CityBallotItem
					key ={index}
					parent={'ballots_tab'}
					changeRoleToBallotBox={this.changeRoleToBallotBox.bind(this)}
					displayCantDeleteBallotRoleModal ={this.displayCantDeleteBallotRoleModal.bind(this)}
					editElectionRoleDetails={this.editElectionRoleDetails.bind(this)}
					updateInstructed={this.updateInstructed.bind(this)}
					updateAppointmentLetter={this.updateAppointmentLetter.bind(this)}
					showAddAssignmentModal={this.showAddAssignmentModal.bind(this)}
					openDeleteRoleModal={this.openDeleteRoleModal.bind(this)}
					hasEditRolePermission={this.hasBallotEditRolePermission}
					hasEditActivistPermission={this.hasEditActivistPermission}
					hasAppointmentExportPermission={this.hasAppointmentExportPermission}
					ballotExtendedData={ballot}
					ballotBoxRoles={this.props.ballotBoxRoles}
					ballotData={ballot}
					index={index}
					electionRolesShifts={this.props.electionRolesShifts}
				/>)
		});
	}
	
	/**
	 * 
	 * @param {GeographicAllocationDto} geographicAllocationDto 
	 * @param {string} electionRoleSystemName 
	 * @param {string} electionRolesShiftSystemName
	 */
		 showAddAssignmentModal(geographicAllocationDto,electionRoleSystemName,electionRolesShiftSystemName=null){
			let showAddAssignmentModalDetails={...this.state.showAddAssignmentModalDetails}
			showAddAssignmentModalDetails.geographicAllocationDto=geographicAllocationDto;
			showAddAssignmentModalDetails.electionRoleSystemName=electionRoleSystemName;
			showAddAssignmentModalDetails.electionRolesShiftSystemName=electionRolesShiftSystemName;
			this.setState({showAddAssignmentModalDetails});
		}

		successAddAssignment(){
			this.props.loadActivistAllocationArr();
			this.setState({showAddAssignmentModalDetails:false});
		}

	render() {
		if(!this.props.ballotsFullData){
			return renderLoaderIcon()
		}
		return (
			<div id="clusterAndActivists" className="dtlsBox rsltsTitleRow srchRsltsBox clearfix" >
				<div className="text-center" style={{margin: '10px 0'}}>
					<b>כל הקלפיות</b>
					<label className="switch" style={{margin: '-3px 10px'}}>
						<input type="checkbox" checked={this.state.displayOnlyNotAllocated} onClick={this.onCheckBoxChange.bind(this, 'displayOnlyNotAllocated')}/>
						<span className="slider round"></span>
					</label>
					<b>קלפיות לשיבוץ בלבד</b>
				</div>
				{/* {this.renderOnlyHotBallots()} */}
					<table className="table calculated-scroll table-city-results table-frame standard-frame table-striped tableNoMarginB householdLIst" style={{ maxHeight: '800px'  , overflowY: 'scroll' }} >
						<thead>
							<tr>
								<th>מ"ס</th>
								<th>קלפי</th>
								<th>אשכול</th>
								<th>תפקיד</th>
								<th>חמה</th>
								{/* <th>נכים</th> */}
								<th>מספר תושבים</th>
								<th title={this.props.prev_last_campagin_name}> מס בוחרי ש"ס  <br/> במערכת קודמת </th>
								<th>תומכים</th>
								{/* <th>מס הצבעות</th> */}
								<th>דיווח אחרון</th>
								<th style={{ width: '470px' }}><span>שיבוץ</span>
								 <b className="pull-left"> <span>עבר הדרכה</span> | <span>כתב מינוי</span></b></th>
							</tr>
						</thead>
						<tbody >
							{this.renderBallotRows()}
						</tbody>
				</table>
	
				{this.state.showAddAssignmentModalDetails?
				<ModalAddAssignment 
				show={this.state.showAddAssignmentModalDetails}
				electionRoleSystemName={this.state.showAddAssignmentModalDetails.electionRoleSystemName}
				electionRolesShiftSystemName={this.state.showAddAssignmentModalDetails.electionRolesShiftSystemName}
				geographicAllocation={this.state.showAddAssignmentModalDetails.geographicAllocationDto}
				hideModel={()=>{this.setState({showAddAssignmentModalDetails:false})}}
				successAddAssignment={()=>{this.successAddAssignment()}}
				>
				</ModalAddAssignment>:''}
				{ <div className="deleteElectionRoleActivist" >
					<DeleteBallotRoleModal
						showCancel={true}
						show={this.state.displayDeleteRoleModal}
						roleData={this.state.roleDeletedData}
						hideModal={this.openDeleteRoleModal.bind(this, false)}
						DeleteBallotRole={this.DeleteBallotRole.bind(this)}
						isBallotRole={this.state.isBallotRole}
					/>
				</div> }
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		ballotsFullData: state.elections.managementCityViewScreen.ballotsFullData,
		ballotBoxRoles: state.elections.managementCityViewScreen.ballotBoxRoles,
		allElectionsRoles: state.elections.managementCityViewScreen.allElectionsRoles,
        electionRolesShifts:  state.elections.activistsScreen.electionRolesShifts,
		addAllocationActivistItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,
        electionRolesShifts:  state.elections.activistsScreen.electionRolesShifts
	}
}

export default connect(mapStateToProps)(CityBallots);