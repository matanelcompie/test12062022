import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Pagination from 'components/global/Pagination';
import * as ElectionsActions from '../../../../../actions/ElectionsActions';
import * as AllocationAndAssignmentActions  from '../../../../../actions/AllocationAndAssignmentActions';
import * as SystemActions from '../../../../../actions/SystemActions';
import {thousandsSeparatesForInteger, isMobilePhone, arraySort } from 'libs/globalFunctions';

import ModalAddAllocation from 'components/elections/activist/ModalAddAllocation/ModalAddAllocation';
import CityBallotItem from '../CityBallotItem'
import ClusterActivistsDetails from './ClusterActivistsDetails';
import DeleteBallotRoleModal from '../DeleteBallotRoleModal';
import { ActivistUpdateDto } from '../../../../../DTO/ActivistUpdateDto';
import ModalAddAssignment from '../../../activist/ModalAddAllocation/ModalAddAssignment';
import { GeographicAllocationDto } from '../../../../../DTO/GeographicAllocationDto';

class ClustersAndBallots extends React.Component {
	constructor(props) {
		super(props);
		this.initConstants(); 
	}
	 
	/*
	Init constant variables once
	*/
	initConstants() {
		this.voterRoleMamritzType = 0;
		this.voterRoleDriverType = 0;
		this.cachedBallotBoxArray = [];
		this.checkPermissions();
		this.initState = {
			ballotShiftData: {},
			addAllocationPhones: [],
			ballotsDataToDisplay: 'all_ballots',
			displayDeleteRoleModal: false,
			showAddAssignmentModalDetails:null,
		}
		this.state = { ...this.initState }
	}

	changeRoleToBallotBox(ballotKey, ballotRoleKey,ballotBoxData) {
		let promise = AllocationAndAssignmentActions.updateOrCreateBallotAllocation(this.props.dispatch, ballotKey, ballotRoleKey)
		promise.then(() => {
			this.props.dispatch({
                type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.CHANGE_BALLOT_BOX_ROLE_TO_BALLOT_BOX,
                ballotBoxData: ballotBoxData, balloBoxtRole: response.data.data, parentEntityType, parentEntityId,
            });
		})
	}
	displayCantDeleteBallotRoleModal() {
		this.props.dispatch({ type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY, displayError: true, errorMessage: 'לא ניתן למחוק הקצאה לקלפי משובץ' });
	}
    checkPermissions(){
		let currentUser = this.props.currentUser;
		this.hasBallotEditRolePermission = currentUser.admin || currentUser.permissions['elections.activists.city_summary.ballot_role_edit']
		this.hasEditActivistPermission = currentUser.admin || currentUser.permissions['elections.activists.city_summary.edit'];
		this.hasAppointmentExportPermission = currentUser.admin || currentUser.permissions['elections.activists.city_summary.appointment_letter'];
	}

	updateClusterField(clusterIndex, fieldName ,fieldValue){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_ACTIVISTS_ROW_DETAILS,
			parentEntityType: this.props.parentEntityType, parentEntityId: this.props.parentEntityId,
			rowIndex: clusterIndex, fieldName, fieldValue});
	}

	// Load cluster - ballots activists data
	loadClustersBallotsExtendedData(clusterData, clusterIndex){
		let ballotBoxesIds = [];
		clusterData.ballot_boxes.forEach((item) =>{ ballotBoxesIds.push(item.id);})
		const promise = ElectionsActions.loadClustersBallotsExtendedData(this.props.dispatch, this.props.currentCity.key, ballotBoxesIds, clusterIndex, 'city_view')
		promise.then((response) => {
			this.updateClusterField(clusterIndex, 'extended_ballot_boxes', response.data.data);
		});
	}
	/*
	Show/hide detailed row
	*/
	showRowDetails(clusterData) {
		let clusterIndex =clusterData.realIndex;
		this.updateClusterField(clusterIndex, 'detailed', !clusterData.detailed);

		if (!clusterData.extended_ballot_boxes && !clusterData.loaded_extended_data) {
			this.updateClusterField(clusterIndex, 'loaded_extended_data', clusterIndex);

			this.loadClustersBallotsExtendedData(clusterData, clusterIndex);
		}

	}
	hideAllRowsDetails(show) {
		

		this.props.dispatch({ 
			type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.HIDE__ALL_TABLE_ROWS_DETAILS,
			parentEntityType: this.props.parentEntityType, parentEntityId: this.props.parentEntityId  
		});
	}

	/*
	for each cluster returns number of supporters
	*/
	getSupportVotesCountByClusterID(clusterID) {
		for (let i = 0; i < this.props.clusters_support_statuses.length; i++) {
			if (this.props.clusters_support_statuses[i].id == clusterID) {
				return thousandsSeparatesForInteger(this.props.clusters_support_statuses[i].support_votes_count) ;
			}

		}
		return 0;
	}

	getClusterRolesCountByType(clusterID, roleTypeID) {
		for (let i = 0; i < this.props.clusters_regular_roles.length; i++) {
			if (this.props.clusters_regular_roles[i].cluster_id == clusterID && this.props.clusters_regular_roles[i].election_role_id == roleTypeID) {
				return this.props.clusters_regular_roles[i].count;
				break;

			}

		}
		return 0;
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
				type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_BALLOT_ACTIVISTS_ROW_DETAILS,
				parentEntityType: this.props.parentEntityType, parentEntityId: this.props.parentEntityId,
				roleKey, editObj, clusterIndex , 'actionType': actionType
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
				type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.CHANGE_CLUSTER_BALLOT_ACTIVISTS_ROW_DETAILS,
				parentEntityType: this.props.parentEntityType, parentEntityId: this.props.parentEntityId,
				roleKey, editObj, clusterIndex , 'actionType': actionType
			});
		});
	}
	
	
	setBallotActiveState(name) {
		this.setState({ ballotsDataToDisplay: name })
	}
	// Delete activist roles:
	openDeleteRoleModal(bool, roleDeletedData = null, clusterIndex = null, clusterId =null ) {
		this.setState({ 
			displayDeleteRoleModal: bool,
			roleDeletedData: roleDeletedData,
			clusterIndex: clusterIndex,
			clusterId: clusterId,
		})
	}
	// Delete ballot role
	DeleteBallotRole(deleteType) {
		let roleDeletedData = this.state.roleDeletedData;
		let clusterId = this.state.clusterId;
		let clusterIndex = this.state.clusterIndex;
		// Delete election role Completely.
		let promise;
		if (deleteType == 'election_role') {
			promise = ElectionsActions.deleteElectionActivistRoleFromCityActivists(this.props.dispatch, roleDeletedData, true, 'city_view');
		} else {
			// Delete only role shift
			promise = ElectionsActions.deleteActivistRoleGeoFromCityActivists(this.props.dispatch, roleDeletedData, true, 'city_view');
		}
		promise.then(() => {
			let clusterData = this.props.clustersActivistsSummary.find((cluster) => { return cluster.entity_id == clusterId})
			this.loadClustersBallotsExtendedData(clusterData, clusterIndex);
		})
	}
	/** End Add allocation methods */
	initDynamicVariables() {
		let filteredClusters = this.props.clustersActivistsSummary.map((item, realIndex) => {
			return {...item , realIndex};
		});
		if(!filteredClusters) { return;}
		let self = this;
		if (this.props.searchScreen.selectedNeighborhood.selectedItem) {
			filteredClusters = filteredClusters.filter(function (cluster) {
				return cluster.neighborhood_id == self.props.searchScreen.selectedNeighborhood.selectedItem.id
			});
		}
		if (this.props.searchScreen.selectedCluster.selectedItem) {

			filteredClusters = filteredClusters.filter(function (cluster) {
				return cluster.entity_id == self.props.searchScreen.selectedCluster.selectedItem.id
			});
		}
		this.mainListRows = [];
		if (filteredClusters.length == 0) {
			if(this.props.isLoadingData){
				this.mainListRows = <tr><td colSpan="13" style={{ textAlign: 'center', fontSize: '20px' }}><i className="fa fa-spinner fa-spin"></i> <i>טוען נתונים ...</i></td></tr>;
			}
			else{
				this.mainListRows = <tr><td colSpan="13" style={{ textAlign: 'center', fontSize: '20px' }}>לא נמצאו נתונים</td></tr>;
			}
		} else {
 
			filteredClusters.forEach((clusterData, i)=> {
				if(clusterData.activated_ballots_count == 0 && this.state.ballotsDataToDisplay  == 'only_activated_ballots'){
					return null;
				}
			//	if (i >= (this.props.currentPage - 1) * this.props.displayItemsPerPage && i < this.props.currentPage * this.props.displayItemsPerPage) {
				this.mainListRows.push(
					<ClusterActivistsDetails 
						showRowDetails={this.showRowDetails.bind(this, clusterData)}
						clusterAllocatedActivists={this.props.clusterAllocatedActivists}
						displayUpdateClusterActivistsModal={this.props.displayUpdateClusterActivistsModal.bind(this)}
						showAddAssignmentModal={this.showAddAssignmentModal.bind(this)}
						key={i} entityType={this.props.subEntityType} clusterData={clusterData}
					/>

					)
					this.renderClusterBallotsSubTable(clusterData);

				//}
			}
		)}
		this.paginationItem = null;
		if (filteredClusters.length > this.props.displayItemsPerPage) {
			this.paginationItem = <div className="row">
				<nav aria-label="Page navigation paginationRow">
					<div className="text-center">
					{false && <Pagination navigateToPage={this.navigateToPage.bind(this)} resultsCount={filteredClusters.length} currentPage={this.props.currentPage} displayItemsPerPage={this.props.displayItemsPerPage} />}
					</div>
				</nav>
			</div>
		}

	}

	successAddAssignment(){
		this.props.loadActivistAllocationArr();
		this.setState({showAddAssignmentModalDetails:false});
	}
	// Add sub ballot rows when cluster is open
	renderClusterBallotsSubTable(clusterData){
		let clusterIndex = clusterData.realIndex;
		if (clusterData.detailed) { //cluster is open
			// Display all cluster ballots:
			this.mainListRows.push(<tr key={"rowSub" + (clusterIndex)}>
				<td colSpan="9"> 
					<table id="city-summary" className="table table-in-tr table-multi-line table-striped" style={{border: '2px solid #2AB4C0'}}>
						<thead>
							<tr>
								<th>מ"ס</th>
								<th>קלפי</th>
								<th>תפקיד</th>
								<th>נכים</th>
								<th>מספר תושבים</th>
								<th title={this.props.prev_last_campagin_name}> מס בוחרי ש"ס  <br/> במערכת קודמת </th>
								<th>תומכים</th>
								{/* <th>מס הצבעות</th> */}
								<th>דיווח אחרון</th>
								<th style={{ width: '470px' }}><span>שיבוץ</span>
								 <b className="pull-left"> <span>עבר הדרכה</span> | <span>כתב מינוי</span></b></th>
							</tr>
						</thead>
						<tbody>
							{this.renderBallotRows(clusterData, clusterIndex)}
						</tbody>
					</table>
				</td>
			</tr>)

		}
	}
	renderBallotRows(clusterData, clusterIndex){
		return clusterData.ballot_boxes.map((ballot, index) => {
			let ballotExtendedData = clusterData.extended_ballot_boxes ? clusterData.extended_ballot_boxes[index] : null;

			return (
				<CityBallotItem
				    showAddAssignmentModal={this.showAddAssignmentModal.bind(this)}
					changeRoleToBallotBox={this.changeRoleToBallotBox.bind(this)}
					displayCantDeleteBallotRoleModal ={this.displayCantDeleteBallotRoleModal.bind(this)}
					updateInstructed={this.updateInstructed.bind(this)}
					updateAppointmentLetter={this.updateAppointmentLetter.bind(this)}
					openDeleteRoleModal={this.openDeleteRoleModal.bind(this)}
					hasEditRolePermission={this.hasBallotEditRolePermission}
					hasEditActivistPermission={this.hasEditActivistPermission}
					hasAppointmentExportPermission={this.hasAppointmentExportPermission}
					getBallotBoxRoleNameById={this.getBallotBoxRoleNameById}
					ballotBoxRoles={this.props.ballotBoxRoles}
					ballotsDataToDisplay={this.state.ballotsDataToDisplay}
					ballotExtendedData={ballotExtendedData}
					ballotData={ballot}
					key={'subRow' + clusterIndex + index}
					index={index}
					clusterIndex={clusterIndex}
					clusterId={clusterData.entity_id}
					electionRolesShifts={this.props.electionRolesShifts}
				/>)
		});
	}
	navigateToPage(index) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.NAVIGATE_TO_PAGE_NUMBER, currentPage: index });
	}
	
	componentWillMount(){
		for(let i = 0 ; i < this.props.allElectionsRoles.length ; i++){
			if(this.props.allElectionsRoles[i].system_name == 'motivator'){
				this.voterRoleMamritzType = this.props.allElectionsRoles[i].id;
			}
			if(this.props.allElectionsRoles[i].system_name == 'driver'){
				this.voterRoleDriverType = this.props.allElectionsRoles[i].id;
			}
		}
	}
	renderOnlyHotBallots(){
		return (
			<div id="management-city-switch" className="radio-button-election-style radio-button-switch" style={{ margin: '0 auto 15px auto' }}>
				<input name="switch" id="one" className="one" type="radio" checked={this.state.ballotsDataToDisplay == 'all_ballots'} 
					onChange={this.setBallotActiveState.bind(this, 'all_ballots')} />
				<label htmlFor="one" className="label-one">
					<span className="on flexed" style={{width: '140px'}}>
						<span>כל הקלפיות</span>
					</span>
				</label>
				<input name="switch" id="three" className="three" type="radio" checked={this.state.ballotsDataToDisplay == 'only_activated_ballots'} 
				onChange={this.setBallotActiveState.bind(this, 'only_activated_ballots')}/>
				<label htmlFor="three" className="label-three">
					<span className="off flexed" style={{width: '140px'}}>
						<span>קלפיות לשיבוץ בלבד</span>
					</span>
				</label>
				<div></div>
				<i></i>
		</div>
		)
	}

	/**
	 * 
	 * @param {GeographicAllocationDto} geographicAllocationDto 
	 * @param {string} electionRoleSystemName 
	 * @param {string} electionRolesShiftSystemName
	 */
	showAddAssignmentModal(geographicAllocationDto=null,electionRoleSystemName=null,electionRolesShiftSystemName=null){
		let showAddAssignmentModalDetails={...this.state.showAddAssignmentModalDetails}
		showAddAssignmentModalDetails.geographicAllocationDto=geographicAllocationDto;
		showAddAssignmentModalDetails.electionRoleSystemName=electionRoleSystemName;
		showAddAssignmentModalDetails.electionRolesShiftSystemName=electionRolesShiftSystemName;
		this.setState({showAddAssignmentModalDetails});
	}

	render() {
		this.initDynamicVariables();
		// console.log(this.state.ballotsDataToDisplay);
		return (
			<div id="clusterAndActivists" className="dtlsBox rsltsTitleRow srchRsltsBox clearfix" >
				{/* {this.renderOnlyHotBallots()} */}
					<table className="table calculated-scroll table-city-results table-frame standard-frame table-striped tableNoMarginB householdLIst" >
						<thead>
							<tr>
								<th width="2%"></th>
								<th width="15%">שם האשכול</th>
								<th width="5%">מספר קלפיות</th>
								<th width="5%">מספר קלפיות לשיבוץ</th>
								<th width="5%">מספר תושבים</th>
								<th width="8%">ממריצים</th>
								<th width="8%">נהגים</th>
								<th width="8%">שרי 100</th>
								<th width="8%">ראשי אשכולות</th>
								{/* <th width="8%"></th> */}
							</tr>
						</thead>
				</table>
				<div style={{ maxHeight: '800px'  , overflowY: 'scroll' }}>
					<table className="table table-city-results table-frame standard-frame table-striped tableNoMarginB householdLIst">
						<tbody >
							{this.mainListRows}
						</tbody>
					</table>
				</div>
				{this.paginationItem}
				<div className='text-center'>
					<button className="btn btn-warning" onClick={this.hideAllRowsDetails.bind(this)}>הסתר כל הקלפיות</button>
				</div>
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
				<div className="deleteElectionRoleActivist" >
					<DeleteBallotRoleModal
					    deleteType='role_shift'
						showCancel={true}
						show={this.state.displayDeleteRoleModal}
						roleData={this.state.roleDeletedData}
						hideModal={this.openDeleteRoleModal.bind(this, false)}
						DeleteBallotRole={this.DeleteBallotRole.bind(this)}
						isBallotRole={this.state.isBallotRole}
					/>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		currentUser: state.system.currentUser,
		prev_last_campagin_name: state.elections.managementCityViewScreen.prev_last_campagin_name,
		searchScreen: state.elections.managementCityViewScreen.searchScreen,
		currentPage: state.elections.managementCityViewScreen.currentPage,
		displayItemsPerPage: state.elections.managementCityViewScreen.displayItemsPerPage,
		clusters_regular_roles: state.elections.managementCityViewScreen.clusters_regular_roles,
		clusters_support_statuses: state.elections.managementCityViewScreen.clusters_support_statuses,
		ballotBoxRoles: state.elections.managementCityViewScreen.ballotBoxRoles,
		allElectionsRoles: state.elections.managementCityViewScreen.allElectionsRoles,
		isLoadingData: state.elections.managementCityViewScreen.isLoadingData,
		addAllocationActivistItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,
        electionRolesShifts:  state.elections.activistsScreen.electionRolesShifts
	}
}

export default connect(mapStateToProps)(withRouter(ClustersAndBallots));