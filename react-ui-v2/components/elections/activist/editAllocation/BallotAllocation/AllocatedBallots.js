import React from "react";
import { connect } from "react-redux";
import Collapse from "react-collapse";

import constants from "libs/constants";

import AllocatedBallotItem from "./AllocatedBallotItem";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import EditRoleShiftsModal from "./EditRoleShiftModal";
import ChangeShiftAlertModal from "./ChangeShiftAlertModal";
import ModalWindow from "components/global/ModalWindow";
import * as ElectionsActions from "actions/ElectionsActions";
import * as AllocationAndAssignmentActions from "actions/AllocationAndAssignmentActions";

import { ActivistUpdateDto } from "../../../../../DTO/ActivistUpdateDto";

class AllocatedBallots extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: null,

      deleteGeoKey: null,

      editGeoKey: null,

      editRoleShiftsModal: {
        show: false,
        title: "",

        phone_number: "",
        newShiftId: null,

        geoItem: {},
      },

      changeShiftAlertModal: {
        show: false,
        otherRolesToChange: [],
      },
    };

    this.initConstants();
  }

  initConstants() {
    this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
    this.activistAllocationsTabs = constants.activists.allocationsTabs;

    this.modalActions = {
      edit: "edit",
      delete: "delete",
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.currentAllocationTab !=
        this.activistAllocationsTabs.ballotAllocation &&
      nextProps.currentAllocationTab ==
        this.activistAllocationsTabs.ballotAllocation
    ) {
      let roleIndex =
        nextProps.activistDetails.election_roles_by_voter.findIndex(
          (roleItem) =>
            roleItem.system_name == nextProps.currentTabRoleSystemName
        );

      if (
        nextProps.activistDetails.election_roles_by_voter[roleIndex]
          .activists_allocations_assignments.length > 0
      ) {
        this.setState({ collapsed: true });
      } else {
        this.setState({ collapsed: false });
      }
    }
  }

  updateCollapseStatus() {
    let collapsed = !this.state.collapsed;

    this.setState({ collapsed });
  }

  getModalTitle(assignmentId, action) {
    let roleIndex = -1;
    let geoIndex = -1;
    let modalTitle = "";
    let activistItem = this.props.activistDetails;

    switch (action) {
      case this.modalActions.delete:
        modalTitle = "מחיקת שיבוץ לקלפי: ";
        break;

      case this.modalActions.edit:
        modalTitle = "עריכת שיבוץ לקלפי: ";
        break;
    }

    roleIndex = activistItem.election_roles_by_voter.findIndex(
      (roleItem) => roleItem.election_role_id == this.props.currentTabRoleId
    );

    geoIndex = activistItem.election_roles_by_voter[
      roleIndex
    ].activists_allocations_assignments.findIndex(
      (geoItem) => geoItem.id == assignmentId
    );
    modalTitle += this.props.getBallotMiId(
      activistItem.election_roles_by_voter[roleIndex]
        .activists_allocations_assignments[geoIndex].mi_id
    );

    return modalTitle;
  }

  editRoleBallot(saveShiftId, saveSum) {
    debugger
    let assignment =
      this.state.editRoleShiftsModal.geoItem;
    let shiftIndex = this.props.electionRolesShifts.findIndex(
      (item) => item.id == saveShiftId
    );
    let that = this;
    let fieldUpdatedState = {};

    var updateActivistDto = new ActivistUpdateDto();
    if (saveShiftId) {
      updateActivistDto.activistAllocationAssignmentId = assignment.id;
      updateActivistDto.shiftRoleId = saveShiftId;

      fieldUpdatedState["election_role_shift_id"] =
        that.props.electionRolesShifts[shiftIndex].id;
      fieldUpdatedState["election_role_shift_name"] =
        that.props.electionRolesShifts[shiftIndex].name;
      fieldUpdatedState["shift_name"] =
        that.props.electionRolesShifts[shiftIndex].name;
    }

    if (saveSum) {
      updateActivistDto.activistRolesPaymentsId =
        this.state.editRoleShiftsModal.geoItem.activist_roles_payments_id;
      updateActivistDto.sum = saveSum;
      fieldUpdatedState["sum"] = saveSum;
    }

    if (
      this.state.changeShiftAlertModal &&
      this.state.changeShiftAlertModal.show
    ) {
      this.hideChangeShiftAlertModal();
    }

    ElectionsActions.updateActivistDto(
      this.props.dispatch,
      updateActivistDto
    ).then(function () {
      that.setState({ editGeoKey: null });
      that.hideEditRoleShiftsModal();
      that.props.dispatch({
        type: ElectionsActions.ActionTypes.ACTIVIST
          .EDIT_DETAILS_ACTIVIST_SHIFT_IN_BALLOT,
        assignmentId: assignment.id,
        role_voter_id:assignment.election_role_by_voter_id,
        editObj:fieldUpdatedState,
      });
    });
  }

  // editRoleBallot() {
  //     // debugger
  //     let editGeoKey = this.state.editGeoKey;
  //     let newShiftId = this.state.editRoleShiftsModal.newShiftId;

  //     let shiftIndex = this.props.electionRolesShifts.findIndex(item => item.id == newShiftId);

  //     let activistItem = this.props.activistDetails;

  //     if ( this.state.changeShiftAlertModal.show ) {
  //         this.hideChangeShiftAlertModal();
  //     }

  //     this.setState({editGeoKey: null});
  //     this.hideEditRoleShiftsModal();

  //     ElectionsActions.editBallotActivistShift(this.props.dispatch, editGeoKey, this.props.electionRolesShifts[shiftIndex].key,
  //                                              this.props.currentTabRoleId);
  // }

  hideEditModals() {
    this.hideChangeShiftAlertModal();
    this.hideEditRoleShiftsModal();
  }

  hideChangeShiftAlertModal() {
    let changeShiftAlertModal = this.state.changeShiftAlertModal;
    changeShiftAlertModal.show = false;

    this.setState({ changeShiftAlertModal });
  }

  showChangeShiftAlertModal(otherRolesToChange) {
    let changeShiftAlertModal = this.state.changeShiftAlertModal;
    changeShiftAlertModal.show = true;
    changeShiftAlertModal.otherRolesToChange = otherRolesToChange;

    this.setState({ changeShiftAlertModal });
  }

  hideEditRoleShiftsModal() {
    this.setState({ editGeoKey: null });
    let editRoleShiftsModal = {
      show: false,
      title: "",
      geoItem: {},
      phone_number: "",
      newShiftId: null,
    };

    this.setState({ editRoleShiftsModal });
  }

  /**
   * This function checks if another activist
   * has a shift in the edited ballot.
   * If there is another activist a modal dialog
   * will pop up with alert.
   * Else it will redirect to the function which
   * edits the ballot shift.
   *
   * @param newShiftId
   */
  isAnotherActivistInBallot(newShiftId, updatedGeoSum) {
    var saveSum = null;
    var saveShiftId = null;
    if (updatedGeoSum) {
      this.state.editRoleShiftsModal.sum = updatedGeoSum;
      saveSum = updatedGeoSum;
    }
    //remove edit role shift modal
    let editRoleShiftsModal = this.state.editRoleShiftsModal;
    editRoleShiftsModal.newShiftId = newShiftId;
    editRoleShiftsModal.show = false;
    this.setState({ editRoleShiftsModal });

    //calculate existing other shifts that will be removed
    let geoItem = this.state.editRoleShiftsModal.geoItem;
    if (+geoItem.election_role_shift_id != +newShiftId) {
      saveShiftId = newShiftId;
      if (
        geoItem.other_election_roles &&
        geoItem.other_election_roles.length > 0
      ) {
        let otherRolesToChange = [];
        let shiftIndex = this.props.electionRolesShifts.findIndex(
          (item) => item.id == newShiftId
        );
        let shiftSystemName =
          this.props.electionRolesShifts[shiftIndex].system_name;
        //loop on other shifts in the ballot box
        for (let i = 0; i < geoItem.other_election_roles.length; i++) {
          let showChangeShift = false;
          let otherShiftSystemName =
            geoItem.other_election_roles[i].other_activist_shift_system_name;
          //check selected shift and other shifts
          switch (shiftSystemName) {
            case this.roleShiftsSytemNames.first:
              if (
                otherShiftSystemName == this.roleShiftsSytemNames.first ||
                otherShiftSystemName == this.roleShiftsSytemNames.allDay
              )
                showChangeShift = true;
              break;

            case this.roleShiftsSytemNames.second:
              if (
                otherShiftSystemName == this.roleShiftsSytemNames.second ||
                otherShiftSystemName ==
                  this.roleShiftsSytemNames.secondAndCount ||
                otherShiftSystemName == this.roleShiftsSytemNames.allDay
              )
                showChangeShift = true;
              break;

            case this.roleShiftsSytemNames.count:
              if (
                otherShiftSystemName == this.roleShiftsSytemNames.count ||
                otherShiftSystemName == this.roleShiftsSytemNames.secondAndCount
              )
                showChangeShift = true;
              break;

            case this.roleShiftsSytemNames.allDay:
              if (
                otherShiftSystemName == this.roleShiftsSytemNames.first ||
                otherShiftSystemName == this.roleShiftsSytemNames.second ||
                otherShiftSystemName == this.roleShiftsSytemNames.allDay ||
                otherShiftSystemName == this.roleShiftsSytemNames.secondAndCount
              )
                showChangeShift = true;
              break;

            case this.roleShiftsSytemNames.secondAndCount:
              if (
                otherShiftSystemName == this.roleShiftsSytemNames.second ||
                otherShiftSystemName == this.roleShiftsSytemNames.count ||
                otherShiftSystemName == this.roleShiftsSytemNames.allDay ||
                otherShiftSystemName == this.roleShiftsSytemNames.secondAndCount
              )
                showChangeShift = true;
              break;
            case this.roleShiftsSytemNames.allDayAndCount:
              showChangeShift = true;
              break;
          }

          if (showChangeShift)
            otherRolesToChange.push(geoItem.other_election_roles[i]);
        }

        if (otherRolesToChange.length > 0) {
          saveShiftId = null;
          //found other shifts that will be removed
          this.showCanNotChange(
            otherRolesToChange,
            this.state.editRoleShiftsModal
          );
        }
      }
    }
    if (saveShiftId || saveSum) this.editRoleBallot(saveShiftId, saveSum);
  }

  showEditRoleShiftsModal(assignmentId) {
    debugger;
    let modalTitle = this.getModalTitle(assignmentId, this.modalActions.edit);
    let editRoleShiftsModal = {};

    let activistItem = this.props.activistDetails;
    let roleIndex = activistItem.election_roles_by_voter.findIndex(
      (roleItem) => roleItem.election_role_id == this.props.currentTabRoleId
    );

    let geoIndex = activistItem.election_roles_by_voter[
      roleIndex
    ].activists_allocations_assignments.findIndex(
      (item) => item.id == assignmentId
    );
    let geoItem =
      activistItem.election_roles_by_voter[roleIndex]
        .activists_allocations_assignments[geoIndex];

    ElectionsActions.getAssignmentDetailsByAllocationId(
        geoItem.activists_allocation_id
    ).then((allAssignmentAllocation) => {
        geoItem.other_election_roles =
        allAssignmentAllocation.filter((a) => {
          return (
            a.id !=  geoItem.id
          );
        });

      editRoleShiftsModal = {
        show: true,
        title: modalTitle,
        geoItem,
        phone_number:
          activistItem.election_roles_by_voter[roleIndex].phone_number,
      };
      this.setState({ editRoleShiftsModal });

      this.setState({ editGeoKey: assignmentId });
    });
  }

  hideConfirmDeleteModal() {
    this.setState({ deleteGeoKey: null });

    this.props.dispatch({
      type: ElectionsActions.ActionTypes.ACTIVIST.HIDE_CONFIRM_DELETE_MODAL,
    });
  }

  deleteRoleBallot() {
    let deleteGeoKey = this.state.deleteGeoKey;
    let electionRoleId=this.props.currentTabRoleId
    let roleIndex = -1;
    let geoIndex = -1;
    let that=this;
    let activistItem = this.props.activistDetails;
    let electionRoleByVoterGeographicAreasId = null;

    roleIndex = activistItem.election_roles_by_voter.findIndex(
      (roleItem) => roleItem.election_role_id == this.props.currentTabRoleId
    );

    geoIndex = activistItem.election_roles_by_voter[
      roleIndex
    ].activists_allocations_assignments.findIndex(
      (geoItem) => geoItem.id == deleteGeoKey
    );
    electionRoleByVoterGeographicAreasId =
      activistItem.election_roles_by_voter[roleIndex]
        .activists_allocations_assignments[geoIndex].id;
    
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_ROLE_FLAG });
        this.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.RESET_EDIT_ROLE_BALLOT_FLAG });
    AllocationAndAssignmentActions.deleteActivistAllocationAssignment(
      this.props.dispatch,
      electionRoleByVoterGeographicAreasId,
      false
    ).then(function(res){
      if(res){
        that.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.DELETE_ACTIVIST_ROLE_GEO, electionRoleByVoterGeographicAreasId, electionRoleId });
        that.hideConfirmDeleteModal();
      }
    });

   
  }

  showConfirmDeleteBallot(geoKey) {
    let modalTitle = this.getModalTitle(geoKey, this.modalActions.delete);

    this.props.dispatch({
      type: ElectionsActions.ActionTypes.ACTIVIST.SHOW_CONFIRM_DELETE_MODAL,
      modalTitle,
    });

    this.setState({ deleteGeoKey: geoKey });
  }

  editElectionRoleDetails(roleIndex, assignment, actionKey, fieldName, event) {
    let that = this;
    let fieldValue = event.target.checked ? 1 : 0;
    let ActivistUpdate = new ActivistUpdateDto();
    ActivistUpdate.activistAllocationAssignmentId = assignment.id;
    ActivistUpdate[actionKey] = fieldValue;
    assignment[fieldName] = fieldValue;
    let editObj = {};
    editObj[fieldName] = fieldValue;
    ElectionsActions.updateActivistDto(
      this.props.dispatch,
      ActivistUpdate
    ).then(function (result) {
      that.props.dispatch({
        type: ElectionsActions.ActionTypes.ACTIVIST
          .EDIT_DETAILS_ACTIVIST_SHIFT_IN_BALLOT,
        assignmentId: assignment.id,
        roleIndex,
        editObj,
      });
    });
  }

  renderAllocatedBallots() {
    let roleIndex = -1;
    let activistItem = this.props.activistDetails;
    let that = this;
    roleIndex = activistItem.election_roles_by_voter.findIndex(
      (roleItem) => roleItem.election_role_id == this.props.currentTabRoleId
    );
    let currentElectionRole = activistItem.election_roles_by_voter[roleIndex];
    let activistUserLockId = currentElectionRole.user_lock_id;

    let ballots = currentElectionRole.activists_allocations_assignments
      ? currentElectionRole.activists_allocations_assignments.map(function (
          ballotItem,
          index
        ) {
          let otherActivistUserLockId = ballotItem.other_user_lock_id;

          return (
            <AllocatedBallotItem
              key={index}
              item={ballotItem}
              isActivistLocked={activistUserLockId != null}
              electionRoleIndex={roleIndex}
              isOtherActivistLocked={otherActivistUserLockId != null}
              currentUser={that.props.currentUser}
              showConfirmDeleteBallot={that.showConfirmDeleteBallot.bind(that)}
              showEditRoleShiftsModal={that.showEditRoleShiftsModal.bind(that)}
              getBallotMiId={that.props.getBallotMiId.bind(that)}
              editElectionRoleDetails={that.editElectionRoleDetails.bind(
                that,
                roleIndex,
                ballotItem
              )}
              election_role_key={currentElectionRole.key}
              currentTabRoleSystemName={that.props.currentTabRoleSystemName}
            />
          );
        })
      : null;

    return <tbody>{ballots}</tbody>;
  }

  renderTitle() {
    let roleIndex = -1;
    let activistItem = this.props.activistDetails;
    let numOfAllocatedBallots = 0;

    roleIndex = activistItem.election_roles_by_voter.findIndex(
      (roleItem) => roleItem.election_role_id == this.props.currentTabRoleId
    );
    numOfAllocatedBallots =
      activistItem.election_roles_by_voter[roleIndex]
        .activists_allocations_assignments.length;

    if (numOfAllocatedBallots > 0) {
      return [
        <span key={0}>קלפיות משובצות</span>,
        <span key={1} className="badge">
          {numOfAllocatedBallots}
        </span>,
      ];
    } else {
      return <span>קלפיות משובצות</span>;
    }
  }

  showCanNotChange(otherRolesToChange, details) {
    // debugger
    let CanNotChange = {}; //this.state.changeShiftAlertModal;
    CanNotChange.show = true;
    CanNotChange.details = details;
    CanNotChange.otherRolesToChange = otherRolesToChange;

    this.setState({ CanNotChange });
  }

  closeCanNotChange() {
    let state = { ...this.state };
    let CanNotChange = false;

    state.CanNotChange = false;
    state.editRoleShiftsModal = {
      show: false,
      title: "",
      geoItem: {},
      phone_number: "",
      newShiftId: null,
    };

    this.setState(state);
  }

  render() {
    let permission =
      "elections.activists.search." +
      this.props.currentTabRoleSystemName +
      ".sum_edit";
    let canEditSumPermissions =
      this.props.currentUser.admin ||
      this.props.currentUser.permissions[permission] == true;

    return (
      <div className="containerStrip">
        <a
          onClick={this.updateCollapseStatus.bind(this)}
          aria-expanded={this.state.collapsed}
        >
          <div className="row panelCollapse">
            <div className="collapseArrow closed"></div>
            <div className="collapseArrow open"></div>
            <div className="collapseTitle">{this.renderTitle()}</div>
          </div>
        </a>

        <div
          className={
            "allocated-ballots" + (this.state.collapsed ? "" : " hidden")
          }
        >
          <table className="table table-frame standard-frame table-striped tableNoMarginB householdLIst">
            <thead>
              <tr>
                <th>עיר</th>
                <th>שם אשכול</th>
                <th>כתובת</th>
                <th>מספר קלפי</th>
                <th>סוג קלפי</th>
                <th>תפקיד</th>
                <th>סכום בסיס</th>
                <th>כתב מינוי</th>
                <th>משמרת</th>
                <th>ביטול אימות מיקום</th>
                <th>{"\u00A0"}</th>
              </tr>
            </thead>

            {this.renderAllocatedBallots()}
          </table>
        </div>

        <ConfirmDeleteModal
          show={this.props.confirmDeleteModal.show}
          title={this.props.confirmDeleteModal.title}
          buttonOk={this.deleteRoleBallot.bind(this)}
          buttonCancel={this.hideConfirmDeleteModal.bind(this)}
        />

        <EditRoleShiftsModal
          show={this.state.editRoleShiftsModal.show}
          title={this.state.editRoleShiftsModal.title}
          geoItem={this.state.editRoleShiftsModal.geoItem}
          phone_number={this.state.editRoleShiftsModal.phone_number}
          hideEditRoleShiftsModal={this.hideEditRoleShiftsModal.bind(this)}
          isAnotherActivistInBallot={this.isAnotherActivistInBallot.bind(this)}
          activistAllocatedShifts={this.props.activistAllocatedShifts}
          getBallotMiId={this.props.getBallotMiId.bind(this)}
          canEditSumPermissions={canEditSumPermissions}
        />

        <ChangeShiftAlertModal
          show={this.state.changeShiftAlertModal.show}
          activistDetails={this.props.activistDetails}
          geoItem={this.state.editRoleShiftsModal.geoItem}
          editRoleBallot={this.editRoleBallot.bind(this)}
          hideEditModals={this.hideEditModals.bind(this)}
          otherRolesToChange={
            this.state.changeShiftAlertModal.otherRolesToChange
          }
          getBallotMiId={this.props.getBallotMiId.bind(this)}
        />

        {this.state.CanNotChange && (
          <div className="modal-md">
            <ModalWindow
              show={true}
              buttonOk={this.closeCanNotChange.bind(this)}
              title="שגיאת שינוי משמרת "
              showCancel={true}
              buttonCancel={this.closeCanNotChange.bind(this)}
              buttonX={this.closeCanNotChange.bind(this)}
            >
              <div className="titAsk">
                {
                  <span style={{ fontWeight: "bold" }}>
                    אין אפשרות לשנות משמרת עבור{" "}
                  </span>
                }
                <span style={{ fontWeight: "bold" }}>
                  עבור {this.state.CanNotChange.details.title}
                </span>
              </div>
              <div className="titAsk">
                {<span>מאחר וקיים שיבוץ עבור </span>}
                <span>
                  {" "}
                  {
                    this.state.CanNotChange.otherRolesToChange[0]
                      .other_activist_first_name
                  }{" "}
                  למשמרת{" "}
                  {
                    this.state.CanNotChange.otherRolesToChange[0]
                      .other_activist_shift_name
                  }
                </span>
              </div>
            </ModalWindow>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.system.currentUser,
    activistDetails: state.elections.activistsScreen.activistDetails,
    ballotsSearchResult: state.elections.activistsScreen.ballotsSearchResult,
    confirmDeleteModal: state.elections.activistsScreen.confirmDeleteModal,
    electionRolesShifts: state.elections.activistsScreen.electionRolesShifts,
  };
}

export default connect(mapStateToProps)(AllocatedBallots);
