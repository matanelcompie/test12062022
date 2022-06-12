import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import DeleteBallotRoleModal from './DeleteBallotRoleModal'
import ModalAddAllocation from 'components/elections/activist/ModalAddAllocation/ModalAddAllocation';

import Combo from 'components/global/Combo';

import { isMobilePhone, arraySort } from 'libs/globalFunctions';


import * as ElectionsActions from 'actions/ElectionsActions';

import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';
import  constants  from 'libs/constants';

class SelectedClusterExtendedDetails extends React.Component {

    constructor(props) {
        super(props);
		this.initConstants();
    }
	formatDate(datetime){
		let arrParts =  datetime.split(' ') ;
		return (arrParts[0].split("-").reverse().join("/")) + " " +  arrParts[1];
	}
	
	/*
	Init constant variables
	*/
	initConstants(){
		this.cachedBallotBoxArray = [];
		this.blueTextColorStyle = { color: '#498bb6' };
		this.state = {
			displayDeleteRoleModal: false,
			showDeleteModal: false,
			isBallotRole: false,
			instructed: false,
			entityAllocationData: {},
			addAllocationPhones: [],
			electionRoleShifts: {}
		}
		this.rolesTitlesObj = {
			cluster_leader: { title: 'ראש אשכול', noneTitle: 'ראש אשכול' },
			motivator: { title: 'ממריץ', noneTitle: 'ממריצים' },
			captain_of_fifty: { title: 'שר מאה', noneTitle: 'שרי מאה' },
			driver: { title: 'נהג', noneTitle: 'נהגים' },
		}
		this.ballotRoleTypes = constants.activists.ballotRoleType;
		this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
	}
	componentWillReceiveProps(nextProps){
		let nextActivistItem = nextProps.addAllocationActivistItem;
		if(this.props.addAllocationActivistItem.id != nextActivistItem.id){
			if(nextActivistItem.voter_phones){
				this.setVotersPhones(nextActivistItem.voter_phones);
			}
		}
		let nextClusterItem = nextProps.searchScreen.selectedCluster.selectedItem;
		if (nextClusterItem && nextClusterItem != this.props.searchScreen.selectedCluster.selectedItem && nextClusterItem.extended_ballot_boxes) {
			this.clusterRealIndex = this.props.getRealRowIndex();

			//update electionRolesShifts for combo select for each ballot box in cluster
			let electionRoleShifts = {};
			nextClusterItem.extended_ballot_boxes.forEach(function(ballotBox) {
				electionRoleShifts[ballotBox.id] = {
					id: null,
					name: '',
					key: null,
					type: null
				}					
			});
			this.setState({
				electionRoleShifts
			});
		}
	}
	/*
	get ballot-box-role name by its id
	
	@param ballot_box_role_id
	*/
	getBallotBoxRoleNameById(roleID){
		if(this.cachedBallotBoxArray['role' + roleID + '']){
			return this.cachedBallotBoxArray['role' + roleID + ''];
		}
		else{
		let returnedResult = "";
		for(let i = 0 ; i<this.props.ballotBoxRoles.length ; i++){
			if(this.props.ballotBoxRoles[i].id == roleID){
				this.cachedBallotBoxArray['role' + this.props.ballotBoxRoles[i].id  + ''] =  this.props.ballotBoxRoles[i].name; 
				returnedResult = this.props.ballotBoxRoles[i].name;
				break;
			}
		}
		return returnedResult;
		}
	}
	
	/*
	Show/hide ballot_box detailed row
	*/
	showRowDetails(index){
		let realClusterRowIndex = -1;
		let show = false;
		for(let i = 0 ; i < this.props.clusters.length ; i++){
			if(this.props.clusters[i].key == this.props.searchScreen.selectedCluster.selectedItem.key){
				realClusterRowIndex = i;
				break;
			}
		}
		let ballotBoxes = [...this.props.clusters[realClusterRowIndex].ballot_boxes];
		ballotBoxes[index] = {...ballotBoxes[index]};
		if(this.props.clusters[realClusterRowIndex].ballot_boxes[index].detailed == true){
			show = false;
		}
		else{			
			show = true;
		}
		if(realClusterRowIndex >= 0 && index >= 0){
		   this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SHOW_HIDE_BALLOT_BOX_ROW_DETAILS , clusterRowIndex:realClusterRowIndex , ballotRowIndex:index , show});
	    }
	}
     
	 /*
	 Function that returns verified status of voter by id 
	 
	 @param id
	 */
	 getVerifiedStatusNameById(id){
		 let returnedStatus = '';
		 switch(id){
			 case 0:
			    returnedStatus = 'טרם נשלחה הודעה';
			    break;
			 case 1:
			    returnedStatus = 'נשלחה הודעה';
			    break;
			 case 2:
			    returnedStatus = 'מאומת';
			    break;
			 case 3:
			    returnedStatus = 'מסרב';
			    break;
			 case 4:
			    returnedStatus = 'לבירור נוסף';
			    break;
			 default: 
			    break;
		 }
		return returnedStatus;
	 }

    getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
	}
	// Delete activist roles:
	openDeleteRoleModal(bool, roleDeletedData = null, isBallotRole = false) {
		this.setState({ 
			displayDeleteRoleModal: bool,
			roleDeletedData: roleDeletedData,
			isBallotRole: isBallotRole
		})
	}
	
	DeleteBallotRole(deleteType) {
		let that =this
		let isBallotRole = this.state.isBallotRole;
		let system_name = this.state.roleDeletedData.election_role_system_name;
		let roleDeletedData=this.state.roleDeletedData
		if (deleteType == 'election_role') { 	// Delete election role Completely
			ElectionsActions.deleteElectionActivistRoleFromCityActivists(this.props.dispatch, this.state.roleDeletedData, isBallotRole);
		}else {
			// Delete only role shift
			switch (system_name) {
				case 'cluster_leader':
					debugger
					// Delete only role shift for cluster leader:
					AllocationAndAssignmentActions.deleteActivistAllocationAssignment(this.props.dispatch,this.state.roleDeletedData.activist_assignment_id,true)
					.then(function(){
						that.props.dispatch({ type: AllocationAndAssignmentActions.ActionTypes.DELETE_CLUSTER_ACTIVIST_ROLE, roleDeletedData, deleteType:  'cluster_leader' });
					})
										break;
					// Delete only role shift for captain100:
				case 'captain_of_fifty':
					return;
				default: // Delete others role shifts:
					ElectionsActions.deleteActivistRoleGeoFromCityActivists(this.props.dispatch, this.state.roleDeletedData, isBallotRole);
			}
		}
	}

	inputCheckboxChange(fieldName, actionKey, event){
		let fieldValue = event.target.checked ? 1 : 0;
		let editObj = {};
		editObj[fieldName] = fieldValue;
		if(fieldName == 'instructed'){
			ElectionsActions.editElectionRoleDetails(this.props.dispatch, actionKey, editObj);
		}else{
			ElectionsActions.editElectionRoleShiftDetails(this.props.dispatch, actionKey, editObj);
		}
	}

    /**
     * Change election role shift
     *
     * @param event e
     * @return void
     */
    changeRoleShift(ballotId, e) {
        let item = e.target.selectedItem;
        let electionRoleShifts = {...this.state.electionRoleShifts};
        if (item == null) {
        	electionRoleShifts[ballotId] = {
				        		id: null,
				                name: e.target.value,
				                key: null,
				                system_name: null}
        } else {
        	electionRoleShifts[ballotId] = item;
        }

        this.setState({
            electionRoleShifts
        });
    }

    /*
         Init dynamic variables for render function
    */
    initDynamicVariables(){
		this.clusterRows = [];
		if(this.props.searchScreen.selectedCluster.selectedItem.ballot_boxes.length > 0){
			let selectedBallot = this.props.searchScreen.selectedBallot.selectedItem;
			let self = this;
			let extendedBallotBoxes = self.props.searchScreen.selectedCluster.selectedItem.extended_ballot_boxes;
			
			
			for(let index = 0 ; index < this.props.searchScreen.selectedCluster.selectedItem.ballot_boxes.length ; index++){

				let item = this.props.searchScreen.selectedCluster.selectedItem.ballot_boxes[index];
				let isBallotCounterRole = (item.role_type  == this.ballotRoleTypes.counter) ? true : false;

				if(selectedBallot && selectedBallot.id != item.id){
					continue;
				}
				let roleShiftsRows = [];
				let expandItem = null;

				let availableShifts = {};
            	let ballotAllocation = null;

				let hasFirstShift = false;
				let hasSecondShift = false;
				let ballotHasExtendedData = extendedBallotBoxes && extendedBallotBoxes[index];

				if (ballotHasExtendedData && extendedBallotBoxes[index].activists_allocations_assignments && extendedBallotBoxes[index].activists_allocations_assignments.length > 0) {
					roleShiftsRows = extendedBallotBoxes[index].activists_allocations_assignments.map(function (innerItem, innerIndex) {
						let shift_system_name = innerItem.shift_system_name;
						if (shift_system_name == 'first') { hasFirstShift = true; }
						else if (shift_system_name == 'second') { hasSecondShift = true; }

						return (<div key={innerIndex}>
							<span><strong>{innerItem.shift_name}</strong> - </span>
							<span>{innerItem.first_name + ' ' + innerItem.last_name}</span>
							<span> | </span>
							<span>{innerItem.phone_number}</span>
						</div>)
					});

					expandItem = <a style={{ cursor: 'pointer' }} onClick={this.showRowDetails.bind(this, index)}><img src={window.Laravel.baseURL + (item.detailed ? "Images/collapse-circle-open.svg" : "Images/collapse-circle-close.svg")} /></a>;

	                //switch on allocated shifts for available shifts
	                switch (extendedBallotBoxes[index].activists_allocations_assignments.length) {
						
	                    case 1:
							if(isBallotCounterRole){
								break;
							}
	                        if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.first) {
	                            availableShifts[this.roleShiftsSytemNames.second] = true;
	                            availableShifts[this.roleShiftsSytemNames.count] = true;
	                            availableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
	                            ballotAllocation = this.renderBallotAlloctionMultiShifts(availableShifts, item);
	                            roleShiftsRows.push(ballotAllocation);
	                        } else if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.second) {
	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.first, item);
	                            roleShiftsRows.unshift(ballotAllocation);

	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.count, item);
	                            roleShiftsRows.push(ballotAllocation);                                                         
	                        } else if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.allDay) {
	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.count, item);
	                            roleShiftsRows.push(ballotAllocation);                            
	                        } else if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.count) {
	                            availableShifts[this.roleShiftsSytemNames.first] = true;
	                            availableShifts[this.roleShiftsSytemNames.second] = true;
	                            availableShifts[this.roleShiftsSytemNames.allDay] = true;
	                            ballotAllocation = this.renderBallotAlloctionMultiShifts(availableShifts, item);
	                            roleShiftsRows.unshift(ballotAllocation);
	                        } else if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.secondAndCount) {
	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.first, item);
	                            roleShiftsRows.unshift(ballotAllocation);                            
	                        }
	                        break;

	                    case 2:
	                        if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.second) {
	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.first, item);
	                            roleShiftsRows.unshift(ballotAllocation);
	                        } else if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.first &&
	                                    extendedBallotBoxes[index].activists_allocations_assignments[1].shift_system_name == this.roleShiftsSytemNames.count) {
	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.second, item);
	                            roleShiftsRows.splice(1, 0, ballotAllocation);
	                        } else if (extendedBallotBoxes[index].activists_allocations_assignments[0].shift_system_name == this.roleShiftsSytemNames.first &&
	                                    extendedBallotBoxes[index].activists_allocations_assignments[1].shift_system_name == this.roleShiftsSytemNames.second) {
	                            ballotAllocation = this.renderBallotAlloctionSingleShift(this.roleShiftsSytemNames.count, item);
	                            roleShiftsRows.push(ballotAllocation);                            
	                        }
	                        break;
	                }
				} else {	// Ballot not has any shift
					if(!isBallotCounterRole){
						availableShifts[this.roleShiftsSytemNames.first] = true;
						availableShifts[this.roleShiftsSytemNames.second] = true;
						availableShifts[this.roleShiftsSytemNames.allDay] = true;
						availableShifts[this.roleShiftsSytemNames.secondAndCount] = true;
						availableShifts[this.roleShiftsSytemNames.allDayAndCount] = true;               
					}
					availableShifts[this.roleShiftsSytemNames.count] = true;
	                ballotAllocation = this.renderBallotAlloctionMultiShifts(availableShifts, item);
	                roleShiftsRows.push(ballotAllocation);
				}

					if(extendedBallotBoxes){
						this.clusterRows.push(<tr key={"mainRow" + index}>
							<td></td>
							<td>{expandItem}</td>
							<td>{index + 1}</td>
							<td>{this.getBallotMiId(item.mi_id)}</td>
							<td>{item.role ? self.getBallotBoxRoleNameById(item.role) : ''}</td>
							<td><div style={{ width: '17px' }} className={item.special_access == 1 ? "accessibility" : ''}></div></td>
							<td>{item.voter_count}</td>
							<td>{ballotHasExtendedData ? extendedBallotBoxes[index].previous_shas_votes_count : '-'} </td>
							<td>{ballotHasExtendedData ? (extendedBallotBoxes[index].voter_supporters_count ? extendedBallotBoxes[index].voter_supporters_count : '-') : '-'}</td>
							<td>{item.votes_count}</td>
							<td>{ballotHasExtendedData ? (extendedBallotBoxes[index].last_vote_date ? self.formatDate(extendedBallotBoxes[index].last_vote_date.created_at) : '-') : '-'}</td>
							<td>{roleShiftsRows}</td></tr>);
					}
					let hasAppointmentExportPermission = this.props.currentUser.admin || this.props.currentUser.permissions['elections.activists.cluster_summary.appointment_letter'];			
					 if(item.detailed == true && extendedBallotBoxes[index].activists_allocations_assignments.length > 0){	
                          let roleShiftDetailedItems  =  extendedBallotBoxes[index].activists_allocations_assignments.map(function(innerItem , innerIndex){
						return( <tr key={"roleShiftExtended"+innerIndex}>
								<td>
									{innerItem.shift_name}
								</td>
								<td><a title={innerItem.first_name + ' ' + innerItem.last_name} className="cursor-pointer"
									onClick={self.redirectToActivist.bind(self, innerItem.voter_key, innerItem.election_role_key)}>
									{innerItem.first_name + ' ' + innerItem.last_name}</a></td>
								<td>{innerItem.phone_number}</td>
								<td>
									<span className="item-space">{self.getVerifiedStatusNameById(innerItem.verified_status)}</span>&nbsp;
									
								</td>
								<td>
									{innerItem.user_lock_id ? 'כן' : 'לא'}
								</td>
								<td>
									<input type="checkbox" id="inputInstructed-role-details" checked={innerItem.instructed || false}
									onChange={self.inputCheckboxChange.bind(self, 'instructed', innerItem.election_role_key)} />
								</td>
								<td>
									{hasAppointmentExportPermission ?
										<a href={window.Laravel.baseURL + 'api/elections/management/city_view/appointment_letters/' + innerItem.election_role_key +
											'/' + innerItem.ballot_box_id + '/export'} target="_blank" style={{ marginLeft: '10px', display: 'inline' }}>
											<label className="fa fa-wpforms" aria-hidden="true" style={{ cursor: 'pointer' }}></label>
										</a>
										: <label className="fa fa-wpforms" aria-hidden="true" style={{ marginLeft: '10px' }}></label>
									}
									<input type="checkbox" id="inputInstructed-role-details" checked={innerItem.appointment_letter || false}
									onChange={self.inputCheckboxChange.bind(self, 'appointment_letter', innerItem.activist_assignment_id)} />
								</td>
								<td>
									<img data-toggle="tooltip" data-placement="left" title="" src={window.Laravel.baseURL + "Images/ico-status-" + (innerItem.arrival_date ? "done" : "fail") + ".svg"} data-original-title="לא" />
								</td>
								<td>
									<button type="button" className="btn-link" onClick={self.openDeleteRoleModal.bind(self, true, innerItem, true)}>
										<img className="image-responsive" src={window.Laravel.baseAppURL + 'Images/delete-icon.png'}/>
									</button>
								</td>
							</tr>)
						  });						  
						 this.clusterRows.push(<tr key={"subRow" + index}>
							 <td colSpan="12">
								 <table className="table delete-lest-td middle-text table-frame standard-frame table-striped tableNoMarginB">
									 <thead>
										 <tr>
											 <th>משמרת</th>
											 <th>שם יו"ר קלפי</th>
											 <th>נייד</th>
											 <th>
												 <span>סטטוס אימות</span>
												 <span className="icon-help" data-toggle="tooltip" data-placement="left" data-original-title="תוכן טולטיפ"></span>
											 </th>
											 <th>שיבוץ נעול</th>
											 <th>הדרכה</th>
											 <th>כתב מינוי</th>
											 <th>סטטוס הגעה</th>
											 <th></th>
										 </tr>
									 </thead>
									 <tbody>
										 {roleShiftDetailedItems}
									 </tbody>
								 </table>
							 </td>
						 </tr>)
							 ;
					 }
									 
 			}	
			this.loadingItem = <tr><td colSpan="10" style={{textAlign:'center'}}><i className="fa fa-spinner fa-spin"></i></td></tr>;
			this.renderClusterLeaderRow();
			this.renderMinisterFiftyRow();
			this.renderDriverRow();
			this.renderMaramritzRow();

			if(this.props.cluster_activists_and_votes.driver_roles.length == 0 && this.props.cluster_activists_and_votes.mamritz_roles.length == 0 && this.props.cluster_activists_and_votes.cluster_leader_roles.length == 0 && this.props.cluster_activists_and_votes.captain_fifty.length == 0){
				this.loadingItem =  <tr><td colSpan="10" style={{textAlign:'center'}}>אין פעילים באשכול זה</td></tr>;
			}
		}
		
		
	}

	/**
     * Render shift info with Combo for multi select shifts
     *
     * @param object availableShifts
     * @param object ballotBox
     * @return void
     */
	renderBallotAlloctionMultiShifts(availableShifts, ballotBox) {
		let electionRoleShift = this.state.electionRoleShifts[ballotBox.id];
		if (!electionRoleShift) return '';
		let shiftItems = this.props.electionRolesShifts.filter(item => availableShifts.hasOwnProperty(item.system_name));

        let comboStyle = {width: '200px'};
        let inputStyle = {};
        if (!electionRoleShift.id && electionRoleShift.name.length > 0) {
            inputStyle.borderColor = 'red';
        }

		let entityAllocationData = null;
		if (ballotBox.role != null) {
			let election_role_system_name;
			switch (ballotBox.role_type){
				case this.ballotRoleTypes.observer:
					election_role_system_name =  this.electionRoleSytemNames.observer
					break;
				case this.ballotRoleTypes.counter:
					election_role_system_name =  this.electionRoleSytemNames.counter
					break;
				default:
					election_role_system_name =  this.electionRoleSytemNames.ballotMember
	
			}
			entityAllocationData = {
				shift_name: electionRoleShift.system_name,
				ballot_key: ballotBox.key,
				election_role_system_name: election_role_system_name
			}
		}
		 
        return (
            <div key={shiftItems[0].system_name}>
                <div className="col-md-8 no-padding">
		            <Combo className="inline"
                            items={shiftItems}
                            itemIdProperty="id"
                            itemDisplayProperty="name"
                            onChange={this.changeRoleShift.bind(this, ballotBox.id)}
                            style={comboStyle}
                            inputStyle={inputStyle}/>
                     <label> - ללא משמרת</label>  
		        </div>
                <div className="col-md-4 no-padding">
					<button type="button" 
						title="הוסף תפקיד" 
						className="btn btn-primary btn-xs left"
						disabled={!ballotBox.role || !electionRoleShift.id} 
						onClick={this.showAddAllocationModal.bind(this, entityAllocationData)}>
                        <span>+</span>
                        <span>הוסף תפקיד</span>
                    </button>
                </div>
            </div>
        )
	}

    /**
     * Render shift info single text line
     *
     * @param string shiftName
     * @param object ballotBox
     * @return void
     */
	renderBallotAlloctionSingleShift(shiftName, ballotBox) {
		let labelText = 'ללא משמרת';
		let shiftItem = this.props.electionRolesShifts.find(item => shiftName == item.system_name);
		let entityAllocationData = null;
		if (ballotBox.role != null) {

			entityAllocationData = {
				shift_name: shiftName,
				ballot_key: ballotBox.key,
				election_role_system_name: (ballotBox.role_type == this.ballotRoleTypes.observer) ? 
                                                    this.electionRoleSytemNames.observer :
                                                    this.electionRoleSytemNames.ballotMember
			}
	        if (shiftName != this.roleShiftsSytemNames.allDayAndCount) {
	            labelText = shiftItem.name + " - ללא משמרת";
	        }
		}
		
        let shiftLabel = <div className="col-md-8 no-padding">
            <label> {labelText} </label>
        </div>
        return (
            <div key={shiftName}>
                {shiftLabel}
                <div className="col-md-4 no-padding">
					<button type="button" title="הוסף תפקיד" className="btn btn-primary btn-xs left"
						disabled={!ballotBox.role} onClick={this.showAddAllocationModal.bind(this, entityAllocationData)}
					>
                        <span>+</span>
                        <span>הוסף תפקיד</span>
                    </button>
                </div>
            </div>
        )
	}

	renderAddClusterRole(roleCounts, role_name){
		let entityAllocationData = {
			cluster_key: this.props.searchScreen.selectedCluster.selectedItem.key,
			election_role_system_name: role_name
		}
		let btnText = roleCounts > 0 ?  'הוסף תפקיד נוסף' : 'הוסף תפקיד';
		return (
            <div key={role_name}> 
                <div>
                    <button title={btnText} className="btn btn-primary btn-xs left"
                        onClick={this.showAddAllocationModal.bind(this, entityAllocationData)}>
                        <span>+</span>
                        <span>{btnText}</span>
                    </button>
                </div>
            </div>
        )
	}
	/** Add allocation methods */

	hideAddAllocationModal() {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.HIDE_ADD_ALLOCATION_MODAL });
		this.setState({ entityAllocationData: {}, addAllocationPhones: [] })
	}
	showAddAllocationModal(entityAllocationData) {
		if (!entityAllocationData) { return; }
		this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.SHOW_ADD_ALLOCATION_MODAL });
		this.setState({ entityAllocationData })
	}
	searchForVoterActivist(voter_personal_identity) {
		this.props.dispatch({ type: ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.ADD_ALLOCATION_MODAL.SET_ACTIVIST_ITEM, activistItem: {} })
		let searchObj = this.state.entityAllocationData;
		searchObj.personal_identity = voter_personal_identity;
		let cityKey = this.props.searchScreen.selectedCity.selectedItem.key;
		ElectionsActions.searchForVoterActivist(this.props.dispatch, searchObj, cityKey, 'city_view');
	}
	addRoleAndShiftToActivist(electionRoleKey, allocationObj) {
		let voterKey = this.props.addAllocationActivistItem.key;
		let cityKey = this.props.searchScreen.selectedCity.selectedItem.key;
		let currentCluster = this.props.clusters[this.clusterRealIndex];
		allocationObj.election_role_key = electionRoleKey;
		allocationObj.ballot_key = this.state.entityAllocationData.ballot_key;
		allocationObj.cluster_key = currentCluster.key;
		
		let clusterData = {
			currentCluster: currentCluster,
			clusterIndex: this.clusterRealIndex,
			cityKey: cityKey
		}
		ElectionsActions.addRoleAndShiftToActivist(this.props.dispatch, voterKey, allocationObj, clusterData, 'cluster_view');
		this.hideAddAllocationModal();
	}
	setVotersPhones(voter_phones) {

		let addAllocationPhones = voter_phones.filter(function (currentPhone) {
			let phoneToCheck = currentPhone.phone_number.split('-').join('');
			return isMobilePhone(phoneToCheck)
		})

		if (addAllocationPhones.length > 1) {
			addAllocationPhones.sort(arraySort('desc', 'updated_at'));
		}

		this.setState({ addAllocationPhones });
	}

/** End Add allocation methods */
	/*
		Redirects to activist page by voter key and role key
	*/
	redirectToActivist(voterKey , election_role_key){
		this.props.router.push("elections/activists/" + voterKey + "/" + election_role_key);
	}
	
	/*
		Redirects to voter page by voterKey
	*/
	redirectToVoterByKey(voterKey){
		this.props.router.push("elections/voters/"+voterKey);
	}
	displayAllClusterBallots(){
		this.props.dispatch({type:ElectionsActions.ActionTypes.MANAGEMENT_CITY_VIEW.SEARCH_SCREEN.SEARCH_ITEM_VALUE_CHANGE , fieldName:'selectedBallot' , fieldValue:'' , fieldItem:null});
	}
	
	renderDriverRow() {
		let namesItems = [];
		let phonesItems = [];
		let sumItems = [];
		let lockingUserItems = []; 
		let statusItems = [];
		let deleteUserItems = [];
		let assignedCitiesNames = [];
		let votersCounts = [];
		let driver_roles = this.props.cluster_activists_and_votes.driver_roles;
		if(driver_roles.length > 0){
			this.loadingItem = null;
			for(let i = 0 ; i < driver_roles.length ; i++){
				namesItems.push(<li key={"driverName" + i}>
					<a title={driver_roles[i].first_name + ' ' + driver_roles[i].last_name} className="cursor-pointer"
						onClick={this.redirectToActivist.bind(this, driver_roles[i].voter_key, driver_roles[i].election_role_key)}>
						{driver_roles[i].first_name + ' ' + driver_roles[i].last_name}</a></li>);	
				phonesItems.push(<li key={"driverPhoneNumber" + i}>{driver_roles[i].phone_number}</li>);
				sumItems.push(<li key={"driverSum" + i}>{driver_roles[i].sum}</li>);
				statusItems.push(<li key={"driverStatus" + i}><span className="item-space">{this.getVerifiedStatusNameById(driver_roles[i].verified_status)}</span></li>);
				assignedCitiesNames.push(<li key={"driverAssignedCitiesNames" + i}>{driver_roles[i].assigned_city_name}</li>);
				votersCounts.push(<li key={"driverVotersCounts" + i}>{driver_roles[i].voters_count}</li>);

				if(driver_roles[i].user_lock_id){
					lockingUserItems.push(<li key={"driverLockUser" + i}><a onClick={this.redirectToVoterByKey.bind(this,driver_roles[i].voter_lock_key)} className="cursor-pointer"><input type="checkbox" disabled={true} checked={true} /> &nbsp; <img src={window.Laravel.baseURL + "Images/lock.png"} /> &nbsp; {driver_roles[i].voter_lock_first_name + ' ' + driver_roles[i].voter_lock_last_name}</a></li>);
				}else{
					deleteUserItems.push(
						<li key={"driverDelete" + i}>
							<button type="button" className="btn-link" onClick={this.openDeleteRoleModal.bind(this, true, driver_roles[i], false)}>
								<img className="image-responsive" src={window.Laravel.baseAppURL + 'Images/delete-icon.png'} />
							</button>
						</li>
					)
					lockingUserItems.push(<li key={"driverLockUser" + i}><input type="checkbox" disabled={true} /></li>);
				}
			}
		}
		this.driverItem = this.renderRoleRow(this.electionRoleSytemNames.driver, namesItems, phonesItems, sumItems, lockingUserItems, statusItems, deleteUserItems, assignedCitiesNames, votersCounts);
	}
	renderMinisterFiftyRow() {
		this.ministerFiftyItem  = null;
		let namesItems = [];
		let phonesItems = [];
		let sumItems = [];
		let statusItems = [];
		let lockingUserItems = [];
		let deleteUserItems = [];
		let assignedCitiesNames = [];
		let votersCounts = [];
		let captain_fifty= this.props.cluster_activists_and_votes.captain_fifty;
		if(captain_fifty.length > 0){
			this.loadingItem = null;

			for(let i = 0 ; i < captain_fifty.length ; i++){
				namesItems.push(<li key={"ministerFiftyName" + i}>
					<a title={captain_fifty[i].first_name + ' ' + captain_fifty[i].last_name} className="cursor-pointer"
						onClick={this.redirectToActivist.bind(this, captain_fifty[i].voter_key, captain_fifty[i].election_role_key)}>
						{captain_fifty[i].first_name + ' ' + captain_fifty[i].last_name}</a></li>);	
				phonesItems.push(<li key={"ministerFiftyPhoneNumber" + i}>{captain_fifty[i].phone_number}</li>);
				sumItems.push(<li key={"ministerFiftySum" + i}>{captain_fifty[i].sum}</li>);
				statusItems.push(<li key={"ministerFiftyStatus" + i}><span className="item-space">{this.getVerifiedStatusNameById(captain_fifty[i].verified_status)}</span></li>);
				assignedCitiesNames.push(<li key={"ministerAssignedCitiesNames" + i}>{captain_fifty[i].assigned_city_name}</li>);
				votersCounts.push(<li key={"ministerVotersCounts" + i}>{captain_fifty[i].voters_count}</li>);

				if(captain_fifty[i].user_lock_id){
					lockingUserItems.push(<li key={"driverLockUser" + i}><a onClick={this.redirectToVoterByKey.bind(this,captain_fifty[i].voter_lock_key)} className="cursor-pointer"><input type="checkbox" disabled={true} checked={true} /> &nbsp; <img src={window.Laravel.baseURL + "Images/lock.png"} /> &nbsp; {captain_fifty[i].voter_lock_first_name + ' ' + captain_fifty[i].voter_lock_last_name}</a></li>);
				}
				else{
					deleteUserItems.push(
						<li key={"ministerFiftyDelete" + i}>
							<button type="button" className="btn-link" onClick={this.openDeleteRoleModal.bind(this, true, captain_fifty[i], false)}>
								<img className="image-responsive" src={window.Laravel.baseAppURL + 'Images/delete-icon.png'} />
							</button>
						</li>
					)
					lockingUserItems.push(<li key={"driverLockUser" + i}><input type="checkbox" disabled={true} /></li>);
				}
			}
		}
		this.ministerFiftyItem = this.renderRoleRow(this.electionRoleSytemNames.ministerOfFifty, namesItems, phonesItems, sumItems, lockingUserItems, statusItems, deleteUserItems, assignedCitiesNames, votersCounts);
	}
	renderClusterLeaderRow() {
		let namesItems = [];
		let phonesItems = [];
		let sumItems = [];
		let statusItems = [];
		let lockingUserItems = [];
		let deleteUserItems = [];
		let assignedCitiesNames = [];
		let votersCounts = [];

		let cluster_leader_roles=this.props.cluster_activists_and_votes.cluster_leader_roles;
		if(cluster_leader_roles.length > 0){
			this.loadingItem = null;

			for(let i = 0 ; i < cluster_leader_roles.length ; i++){
				namesItems.push(<li key={"clusterLeaderName" + i}>
					<a title={cluster_leader_roles[i].first_name + ' ' + cluster_leader_roles[i].last_name} className="cursor-pointer"
						onClick={this.redirectToActivist.bind(this, cluster_leader_roles[i].voter_key, cluster_leader_roles[i].election_role_key)}>
						{cluster_leader_roles[i].first_name + ' ' + cluster_leader_roles[i].last_name}</a></li>);	
				
				phonesItems.push(<li key={"clusterLeaderPhoneNumber" + i}>{cluster_leader_roles[i].phone_number}</li>);
				sumItems.push(<li key={"clusterLeaderSum" + i}>{cluster_leader_roles[i].sum}</li>);
				statusItems.push(<li key={"clusterLeaderStatus" + i}><span className="item-space">{this.getVerifiedStatusNameById(cluster_leader_roles[i].verified_status)}</span></li>);
				assignedCitiesNames.push(<li key={"clusterLeaderAsignedCitiesNames" + i}>{cluster_leader_roles[i].assigned_city_name}</li>);
				votersCounts.push(<li key={"clusterLeaderVotersCounts" + i}>---</li>);

				if(cluster_leader_roles[i].user_lock_id){
					lockingUserItems.push(<li key={"driverLockUser" + i}><a onClick={this.redirectToVoterByKey.bind(this,cluster_leader_roles[i].voter_lock_key)} className="cursor-pointer"><input type="checkbox" disabled={true} checked={true} /> &nbsp; <img src={window.Laravel.baseURL + "Images/lock.png"} /> &nbsp; {cluster_leader_roles[i].voter_lock_first_name + ' ' + cluster_leader_roles[i].voter_lock_last_name}</a></li>);
				}
				else{
					deleteUserItems.push(
						<li key={"clusterLeaderDelete" + i}>
							<button type="button" className="btn-link" onClick={this.openDeleteRoleModal.bind(this, true, cluster_leader_roles[i], false)}>
								<img className="image-responsive" src={window.Laravel.baseAppURL + 'Images/delete-icon.png'} />
							</button>
						</li>
					)
					lockingUserItems.push(<li key={"driverLockUser" + i}><input type="checkbox" disabled={true} /></li>);
				}
			}
		}
		this.clusterLeaderItem = this.renderRoleRow(this.electionRoleSytemNames.clusterLeader, namesItems, phonesItems, sumItems, lockingUserItems, statusItems, deleteUserItems, assignedCitiesNames, votersCounts);

	}
	renderMaramritzRow() {
		let mamritz_roles = this.props.cluster_activists_and_votes.mamritz_roles;
		let namesItems = [];
		let phonesItems = [];
		let sumItems = [];
		let statusItems = [];
		let lockingUserItems = [];
		let deleteUserItems = [];
		let assignedCitiesNames = [];
		let votersCounts = [];
		if (mamritz_roles.length > 0) {
			this.loadingItem = null;
			for (let i = 0; i < mamritz_roles.length; i++) {
				namesItems.push(<li key={"mamritzName" + i}>
					<a title={mamritz_roles[i].first_name + ' ' + mamritz_roles[i].last_name} className="cursor-pointer"
						onClick={this.redirectToActivist.bind(this, mamritz_roles[i].voter_key, mamritz_roles[i].election_role_key)}>
						{mamritz_roles[i].first_name + ' ' + mamritz_roles[i].last_name}</a></li>);

				phonesItems.push(<li key={"mamritzPhoneNumber" + i}>{mamritz_roles[i].phone_number}</li>);
				assignedCitiesNames.push(<li key={"mamritz_assignedCitiesNames" + i}>{mamritz_roles[i].assigned_city_name}</li>);
				votersCounts.push(<li key={"mamritz_voters_counts" + i}>---</li>);

				sumItems.push(<li key={"mamritzSum" + i}>{mamritz_roles[i].sum}</li>);
				statusItems.push(<li key={"mamritzStatus" + i}><span className="item-space">{this.getVerifiedStatusNameById(mamritz_roles[i].verified_status)}</span></li>);

				if (mamritz_roles[i].user_lock_id) {
					lockingUserItems.push(<li key={"mamritzLockUser" + i}><a onClick={this.redirectToVoterByKey.bind(this,mamritz_roles[i].voter_lock_key)} className="cursor-pointer"><input type="checkbox" disabled={true} checked={true} /> &nbsp; <img src={window.Laravel.baseURL + "Images/lock.png"} /> &nbsp; {mamritz_roles[i].voter_lock_first_name + ' ' + mamritz_roles[i].voter_lock_last_name}</a></li>);
				}else {
					deleteUserItems.push(
						<li key={"mamritzDelete" + i}>
							<button type="button" className="btn-link" onClick={this.openDeleteRoleModal.bind(this, true, mamritz_roles[i], false)}>
								<img className="image-responsive" src={window.Laravel.baseAppURL + 'Images/delete-icon.png'} />
							</button>
						</li>
					)
					lockingUserItems.push(<li key={"mamritzLockUser" + i}><input type="checkbox" disabled={true} /></li>);
				}
			}
		}
		this.mamritzItem = this.renderRoleRow(this.electionRoleSytemNames.motivator, namesItems, phonesItems, sumItems, lockingUserItems, statusItems, deleteUserItems, assignedCitiesNames, votersCounts);
	}

	renderRoleRow(role_system_name, namesItems, phonesItems, sumItems, lockingUserItems, statusItems, deleteUserItems, assignedCitiesNames, votersCounts) {
		let roleTitles = this.rolesTitlesObj[role_system_name];
		let isCusterLeaderRole = (role_system_name == this.electionRoleSytemNames.clusterLeader)
		let hasAllocations = namesItems.length > 0;
		let addRoleButton =  (!isCusterLeaderRole || !hasAllocations) ? this.renderAddClusterRole(namesItems.length, role_system_name) : null;
		return <tr>
			<td><ul><strong>{roleTitles.title}</strong></ul></td>
			<td style={{paddingTop:'5px' , paddingBottom:'21px'}}>{namesItems.length > 0 ? <ul>{namesItems}</ul> : 'ללא '  + roleTitles.noneTitle}</td>
			<td>{assignedCitiesNames.length > 0 ? <ul>{assignedCitiesNames}</ul> : '---'}</td>
			<td>{votersCounts.length > 0 ? <ul>{votersCounts}</ul> : '---'}</td>
			<td>{phonesItems.length > 0 ? <ul>{phonesItems}</ul> : '---'}</td>
			<td>{sumItems.length > 0 ? <ul>{sumItems}</ul> : '---'}</td>
			<td>{lockingUserItems.length > 0 ? <ul>{lockingUserItems}</ul> : <input type="checkbox" disabled={true} />}</td>
			<td>{statusItems.length > 0 ? <ul>{statusItems}</ul> : '---'}</td>
			<td>{deleteUserItems.length > 0 ? <ul>{deleteUserItems}</ul> : null}</td>
			<td>{addRoleButton}</td>
		</tr>;
	}

    render() {
		if(!this.props.searchScreen.selectedCluster.selectedItem){return (<div></div>)}
		this.initDynamicVariables();
        return (
            <div>
              <div className="containerTabs">
                    <ul className="nav nav-tabs tabsRow" role="tablist">
                        <li className="active">
                            <a title="פעילי אשכול" href="#Tab1" data-toggle="tab">
                                פעילי אשכול
                            </a>
                        </li>
                        <li>
                            <a title="קלפיות באשכול" href="#Tab2" data-toggle="tab">
                                <span>קלפיות באשכול</span>
                                <span className="badge">{this.props.searchScreen.selectedCluster.selectedItem.ballot_boxes_count}</span>
                            </a>
                        </li>
                    </ul>
                    <div className="tab-content tabContnt">
                        <div role="tabpanel" className="tab-pane active" id="Tab1">
                            <div className="containerStrip">
                                <table className="table table-frame standard-frame table-striped">
                                    <thead>
                                        <tr>
                                            <th>סוג תפקיד</th>
                                            <th>שם</th>
                                            <th>עיר שיבוץ</th>
                                            <th>בוחרים משובצים</th>
                                            <th>נייד</th>
                                            <th>סכום</th>
                                            <th>
                                                <span>נעל שיבוץ</span>
                                                <span data-toggle="tooltip" data-placement="left" data-original-title="ע&quot;י סימון נעילת שיבוץ, יימנע ממשתמש וכו...." className="icon-help"></span>
                                            </th>
                                            <th>סטטוס אימות</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
									<tbody>
									{this.clusterLeaderItem}
									{this.ministerFiftyItem}
									{this.driverItem}
									{this.mamritzItem}
									{this.loadingItem}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div role="tabpanel" className="tab-pane" id="Tab2">
                            <div className="containerStrip">
                                <table className="table table-striped tableNoMarginB tableTight">
                                    <thead>
                                        <tr>
										    <th></th>
											<th></th>
                                            <th>מ"ס</th>
                                            <th>קלפי</th>
                                            <th>תפקיד</th>
                                            <th>נכים</th>
                                            <th>מספר תושבים</th>
                                            <th>מס בוחרי ש"ס בכנסת 2013</th>
                                            <th>תומכים</th>
                                            <th>מס הצבעות</th>
                                            <th>דיווח אחרון</th>
											<th>שיבוץ</th>
											<th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
									    {this.clusterRows}     
                                    </tbody>
								</table>

									{ this.props.searchScreen.selectedBallot.selectedItem && // If specific ballot from cluster had selected 
										<h3 className="text-success text-center" onClick={this.displayAllClusterBallots.bind(this)}
											style={{ cursor: 'pointer', marginBottom:'0', marginTop:'10px'}}> הצג את כל הקלפיות באשכול
										</h3>
									}
								</div>
                        </div>
                    </div>
				</div>
				<div className="deleteElectionRoleActivist" >

					<DeleteBallotRoleModal
					    deleteType='role_shift'
						showCancel={true}
						show={this.state.displayDeleteRoleModal}
						roleData={this.state.roleDeletedData}
						hideModal={this.openDeleteRoleModal.bind(this, false, false)}
						DeleteBallotRole={this.DeleteBallotRole.bind(this)}
						isBallotRole={this.state.isBallotRole}
					/>
				</div>
				{this.props.showAddAllocationModal && <ModalAddAllocation
					sourceScreen={'cluster_summary'}
					addAllocationFromCityViewMode={true}
					allocationCitiesList={[this.props.searchScreen.selectedCity.selectedItem]}
					activistItem={this.props.addAllocationActivistItem} phones={this.state.addAllocationPhones}
					entityAllocationData={this.state.entityAllocationData}
					hideAddAllocationModal={this.hideAddAllocationModal.bind(this)}
					searchForVoterActivist={this.searchForVoterActivist.bind(this)}
					addAllocation={this.addRoleAndShiftToActivist.bind(this)}
					electionRolesShifts={this.props.electionRolesShifts} />
				}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
		searchScreen: state.elections.managementCityViewScreen.searchScreen,
		selectedCluster: state.elections.managementCityViewScreen.searchScreen.selectedCluster,
		numOfShasVotersThisCampaign: state.elections.managementCityViewScreen.numOfShasVotersThisCampaign,
		clusters_activated_ballots_countings: state.elections.managementCityViewScreen.clusters_activated_ballots_countings,
		ballotBoxRoles: state.elections.managementCityViewScreen.ballotBoxRoles,
		clusters: state.elections.managementCityViewScreen.clusters,
		cluster_activists_and_votes: state.elections.managementCityViewScreen.cluster_activists_and_votes,
		clusters: state.elections.managementCityViewScreen.clusters,
		addAllocationActivistItem: state.elections.managementCityViewScreen.addAllocationModal.activistItem,
		showAddAllocationModal: state.elections.activistsScreen.showAddAllocationModal,
    }
}

export default connect(mapStateToProps)(withRouter(SelectedClusterExtendedDetails));