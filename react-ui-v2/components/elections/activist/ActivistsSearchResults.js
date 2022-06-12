import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';
import ModalWindow from 'components/global/ModalWindow'
import Combo from 'components/global/Combo';
import Pagination from '../../global/Pagination';
import ActivistItem from './ActivistItem';
import ChangeSumModal from './ChangeSumModal'
import EditRoleShiftsModal from '../activist/editAllocation/BallotAllocation/EditRoleShiftModal';
import ChangeShiftAlertModal from '../activist/editAllocation/BallotAllocation/ChangeShiftAlertModal';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as PaymentAction from 'actions/PaymentAction';
import * as SystemActions from 'actions/SystemActions';
import { ActivistUpdateDto } from '../../../DTO/ActivistUpdateDto';
import { ActivistRolesPayments } from '../../../Models/ActivistRolesPayments';


class ActivistsSearchResults extends React.Component {
  constructor(props) {
    super(props);

    this.initState = {
      currentPage: 1,
      currentPageActivists: [],
      activistAction: "בחר פעולה",
      selectAllActivsts: false,
      selectActivstsHash: {},
      showChangeSumModal: false,
      changeSumActivistFullName: false,
      activistElectionRole: false,
      loadingMoreActivists: false,
    };
    this.state = { ...this.initState };
    this.initConstants();
    SystemActions.loadCurrentCampaign(this.props.dispatch);
  }

  initConstants() {
    this.roleShiftsSytemNames = constants.activists.roleShiftsSytemNames;
    this.activistAllocationsTabs = constants.activists.allocationsTabs;
    this.maxRecoredsFromDb = constants.activists.maxRecoredsFromDb;

    this.activistsPerPage = 30;
    this.activistsActions = [
      { id: -1, action: null, name: "בחר פעולה" },
      { id: 1, action: "export_captain50", name: "הפק דוח הליכון שרי 100" },
    ];
  }

  componentWillReceiveProps(nextProps) {
    let loadedPage = false;
    if (
      (this.subMount == true && this.props.activistsSearchResult.length > 0) ||
      (this.props.activistsSearchResult.length == 0 &&
        nextProps.activistsSearchResult.length > 0)
    ) {
      this.subMount = undefined;
      loadedPage = true;
      this.setState({ currentPage: 1 });
      this.loadPageActivists(1, nextProps);
    }

    if (
      !loadedPage &&
      this.props.activistsSearchResult != nextProps.activistsSearchResult
    ) {
      this.setState({
        loadingMoreActivists: false,
      });
      this.loadPageActivists(this.state.currentPage, nextProps);
    }

    if (nextProps.activistsSearchResult.length == 0) {
      this.setState({ currentPageActivists: [], currentPage: 1 });
    }
    if (!this.props.isLoadingResults && nextProps.isLoadingResults) {
      let newState = { ...this.initState };
      newState.selectActivstsHash = {};
      newState.currentPageActivists = [];
      this.setState(newState);
    }
  }

  componentWillMount() {
    this.subMount = true;
  }
  onActionChange(e) {
    let value = e.target.value;
    let selectedItem = e.target.selectedItem;
    if (selectedItem) {
      value = selectedItem.name;
      if (selectedItem.action) {
        this.activeAction(selectedItem.action);
      }
    }
    this.setState({ activistAction: value });
  }
  EventChangeComments(e) {
    let value = e.target.value;
    let electionRole = { ...this.state.activistElectionRole };
    electionRole.comment = value;
    this.setState({ activistElectionRole: electionRole });
  }
  activeAction(action) {
    switch (action) {
      case "export_captain50":
        this.exportCaptain50();
        break;
    }
  }
  exportCaptain50() {
    let captain50KeyList = [];
    for (let key in this.state.selectActivstsHash) {
      let currentActivist = this.state.selectActivstsHash[key];
      currentActivist.election_roles_by_voter.forEach(function (electionRole) {
        if (electionRole.system_name == "captain_of_fifty") {
          captain50KeyList.push(key);
        }
      });
    }
    if (captain50KeyList.length == 0) {
      return;
    }
    captain50KeyList.forEach(function (key) {});
    let url =
      window.Laravel.baseURL +
      "api/elections/reports/captain_of_50_walker/print_by_captains_keys?captain50_key_list=" +
      captain50KeyList;
    window.open(url, "_blank");
  }
  exportToExcel(path) {
    let searchObj = this.props.buildSearchObj();
    let exportUrl =
      window.Laravel.baseURL + "api/elections/activists/export" + path + "?";
    for (let name in searchObj) {
      let value = searchObj[name];
      if (value !== null && value !== "") {
        exportUrl += "&" + name + "=" + value;
      }
    }
    window.open(exportUrl, "blank");
  }

  getBallotMiId(ballotMiId) {
    if (ballotMiId == undefined) return "";
    var miIdStr = ballotMiId.toString();
    var lastDigit = miIdStr.charAt(miIdStr.length - 1);

    return miIdStr.substring(0, miIdStr.length - 1) + "." + lastDigit;
  }

  loadMoreActivists(nextPage) {
    // total number of pages
    let totalPages = Math.ceil(
      this.props.totalSearchResults / this.activistsPerPage
    );

    // number of activists in pages 1 - nextPage
    let nextPageNumOfActivists = nextPage * this.activistsPerPage;

    // Checking if we are in the last page
    if (nextPage > totalPages) {
      this.setState({
        loadingMoreActivists: false,
      });
      return;
    }

    // If activistsSearchResult contains all the search result,
    // then there is nothing to load
    if (
      this.props.activistsSearchResult.length == this.props.totalSearchResults
    ) {
      this.setState({
        loadingMoreActivists: false,
      });
      return;
    }

    // If number of activists in pages from 1 till next page
    // are less than activistsSearchResult activists, then there
    // is nothing to load
    if (nextPageNumOfActivists <= this.props.activistsSearchResult.length) {
      this.setState({
        loadingMoreActivists: false,
      });
      return;
    }

    let searchObj = this.props.buildSearchObj();
    let currentDbPage =
      Math.floor((nextPage * this.activistsPerPage) / this.maxRecoredsFromDb) +
      1;
    ElectionsActions.loadMoreActivists(
      this.props.dispatch,
      searchObj,
      currentDbPage
    );
  }

  loadPageActivists(currentPage, nextProps = null) {
    let activistsSearchResult =
      null == nextProps
        ? this.props.activistsSearchResult
        : nextProps.activistsSearchResult;
    let totalSearchResults =
      null == nextProps
        ? this.props.totalSearchResults
        : nextProps.totalSearchResults;
    let currentPageActivists = [];

    let bottomIndex = (currentPage - 1) * this.activistsPerPage;
    let topIndex = currentPage * this.activistsPerPage - 1;
    let maxIndex = activistsSearchResult.length;

    if (topIndex > totalSearchResults - 1) {
      topIndex = totalSearchResults - 1;
    }
    if (maxIndex < bottomIndex) {
      let maxPage = Math.floor(maxIndex / this.activistsPerPage);
      this.setState({ currentPage: maxPage });
    }
    for (
      let activistIndex = bottomIndex;
      activistIndex <= topIndex;
      activistIndex++
    ) {
      currentPageActivists.push(activistsSearchResult[activistIndex]);
    }

    this.setState({ currentPageActivists });
  }

  navigateToPage(pageIndex) {
    this.setState({ currentPage: pageIndex, selectAllActivsts: false });

    this.loadPageActivists(pageIndex);

    if (
      (pageIndex + 1) * this.activistsPerPage >
        this.props.activistsSearchResult.length &&
      !this.state.loadingMoreActivists
    ) {
      this.setState({
        loadingMoreActivists: true,
      });
      this.loadMoreActivists(pageIndex + 1);
    }
  }

  onSelectAllActivst(e) {
    let selectActivstsHash = {};
    let setAllChecked = !this.state.selectAllActivsts;
    this.state.currentPageActivists.forEach(function (activistItem) {
      if (setAllChecked) {
        selectActivstsHash[activistItem.key] = activistItem;
      } else if (selectActivstsHash[activistItem.key]) {
        delete selectActivstsHash[activistItem.key];
      }
    });
    this.setState({
      selectActivstsHash: selectActivstsHash,
      selectAllActivsts: setAllChecked,
    });
  }
  onSelectActivst(activistItem) {
    let selectActivstsHash = { ...this.state.selectActivstsHash };
    let isChecked = selectActivstsHash[activistItem.key] ? true : false;
    if (!isChecked) {
      selectActivstsHash[activistItem.key] = activistItem;
    } else {
      delete selectActivstsHash[activistItem.key];
    }
    this.setState({ selectActivstsHash: selectActivstsHash });
  }

  displayEditActivistBtn(){
    if(this.props.currentCampaign)
    return this.props.searchElectionCampaignId==this.props.currentCampaign.id;

    return false;
  }

  renderActivists() {
    let that = this;
    let isUserAdmin = this.props.currentUser.admin;
    let activistsRows = this.state.currentPageActivists.map(function (
      activistItem,
      activistIndex
    ) {
      if (activistItem) {
        let isChecked = that.state.selectActivstsHash[activistItem.key]
          ? true
          : false;
        return (
          <ActivistItem
            displayEditActivist={that.displayEditActivistBtn()}
            key={activistIndex}
            checked={isChecked}
            isUserAdmin={isUserAdmin}
            userFilteredCitiesHash={that.props.userFilteredCitiesHash}
            activistItem={activistItem}
            activistIndex={activistIndex}
            onSelectActivst={that.onSelectActivst.bind(that, activistItem)}
            showAddAllocationModal={that.props.showAddAllocationModal}
            electionRoles={that.props.electionRoles}
            redirectToEditActivistPage={that.props.redirectToEditActivistPage.bind(
              that
            )}
            checkAddAllocationPermissions={that.props.checkAddAllocationPermissions.bind(
              that
            )}
            checkEditAllocationPermission={that.props.checkEditAllocationPermission.bind(
              that
            )}
            showChangeSumModal={that.showChangeSumModal.bind(that)}
            showChangeCommentsModal={that.showChangeCommentsModal.bind(that)}
            askLockRoleActivist={that.askLockRoleActivist.bind(that)}
            showEditRoleShiftModal={that.showEditRoleShiftModal.bind(that)}
            currentUser={that.props.currentUser}
            currentCampaign={that.props.currentCampaign}
          />
        );
      }
    });

    return (
      <table
        id="Activist-search-table"
        className="table table-multi-line table-frame table-striped tableNoMarginB"
      >
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={this.state.selectAllActivsts}
                onChange={this.onSelectAllActivst.bind(this)}
              />
            </th>
            <th>ת"ז</th>
            <th>שם מלא</th>
            <th>מס' טלפון</th>
            {/* <th>כתובת מלאה</th> */}

            <th>חשבון</th>
            <th>עדכני</th>
            <th>מסמך</th>
            <th>נבדק</th>

            <th>סוג פעיל</th>
            <th>עיר שיבוץ</th>
            <th>מיקום שיבוץ</th>
            <th>סכום</th>
            <th>סטטוס שיבוץ</th>
            <th>נעילת תשלום</th>
            <th>סטטוס אימות</th>
            <th>הערה</th>
            <th>{"\u00A0"}</th>
          </tr>
        </thead>

        <tbody>{activistsRows}</tbody>
      </table>
    );
  }

  getCounterTitle() {
    let counterTitle = "מציג תוצאות ";
    let bottomIndex = (this.state.currentPage - 1) * this.activistsPerPage + 1;
    let topIndex = this.state.currentPage * this.activistsPerPage;

    if (this.props.totalSearchResults == 0) {
      return counterTitle;
    }

    if (topIndex > this.props.totalSearchResults) {
      topIndex = this.props.totalSearchResults;
    }

    counterTitle += bottomIndex + "-" + topIndex;

    return counterTitle;
  }

  /**
   * Show change sum modal
   *
   * @param string fullName
   * @param object electionRole
   * @return void
   */
  showChangeSumModal(fullName, activistPaymentItem) {
    this.setState({
      showChangeSumModal: true,
      changeSumActivistFullName: fullName,
      activistElectionRole: activistPaymentItem,
    });
  }

  showChangeCommentsModal(fullName, activistPaymentItem) {
    this.setState({
      showChangeCommentsModal: true,
      changeSumActivistFullName: fullName,
      activistElectionRole: activistPaymentItem,
    });
  }

  askLockRoleActivist(fullName, activistPaymentItem) {
    this.setState({
      showDialogAsk: true,
      fullNameActivist: fullName,
      activistElectionRole: activistPaymentItem,
    });
  }

  /**
   * Close change sum modal
   *
   * @return void
   */
  closeChangeSumModal() {
    this.setState({
      showChangeSumModal: false,
    });
  }

  closeChangeCommentsModal() {
    this.setState({
      showChangeCommentsModal: false,
    });
  }

  /**
   * Update election activist sum
   *
   * @param string electionRoleKey
   * @param integer sum
   * @return void
   */
  updateElectionRoleSum(sum) {
    this.updateActivistPaymentRole('sum',sum);

  }

  updateCommentsRole() {
    this.closeChangeCommentsModal();
    this.updateActivistPaymentRole('comment',this.state.activistElectionRole.comment);

  }

  updateLockRole() {
    debugger
    let value=this.state.activistElectionRole.user_lock_id?0:1;
    this.closeDialogLock();
    this.updateActivistPaymentRole('user_lock_id',value);

  }

  updateActivistPaymentRole(nameField,value){
    let that = this;
    let  activistElectionRole={...this.state.activistElectionRole};
    let activistRolesPayments = new ActivistRolesPayments
    activistRolesPayments.id = activistElectionRole.activist_roles_payments_id;
    activistRolesPayments[nameField] = value;
    activistElectionRole[nameField] = value;

    PaymentAction.updateActivistPaymentRole(
      this.props.dispatch,
      activistRolesPayments,
    )
    .then((res)=>{
      if(res)
      {
        that.props.dispatch({ type: ElectionsActions.ActionTypes.ACTIVIST.UPDATE_ACTIVIST_ROLE_PAYMENTS_FIELD, activistPaymentItem:that.state.activistElectionRole, nameFields:nameField,valueField:value});
        that.setState({activistElectionRole:activistElectionRole})
      }
    });
  }

  closeDialogLock() {
    this.setState({
      showDialogAsk: false,
    });
  }

  //--------------------------------------------------------------------------------------------------
  hideEditRoleShiftsModal() {
    // this.setState({editGeoKey: null});
    let state = { ...this.state };
    state.showBallotDetails = false;
    this.setState(state);
  }

  showEditRoleShiftModal(electionRole, paymentAndAssignment, details) {
    var activistAllocatedShifts = {};
    ElectionsActions.getAssignmentDetailsByAllocationId(
      paymentAndAssignment.activists_allocations_id
    ).then((allAssignmentAllocation) => {
      paymentAndAssignment.other_election_roles =
        allAssignmentAllocation.filter((a) => {
          return (
            a.id != paymentAndAssignment.activists_allocations_assignment_id
          );
        });
      paymentAndAssignment.mi_id =
        paymentAndAssignment.areas_ballot_boxes_mi_id;
      paymentAndAssignment.street = paymentAndAssignment.cluster_address;

      var activistDetails = {
        last_name: details.last_name,
        first_name: details.first_name,
        personal_identity: details.personal_identity,
      };
      activistAllocatedShifts[paymentAndAssignment.shift_system_name] = {
        ballotBoxMiId: paymentAndAssignment.areas_ballot_boxes_mi_id,
        cluster_name: paymentAndAssignment.cluster_name,
        electionRoleName: electionRole.election_role_name,
        electionRoleShiftName: paymentAndAssignment.shift_name,
      };

      let editRoleShiftsModal = {
        activistAllocatedShifts: activistAllocatedShifts,
        electionRole: electionRole,
        show: true,
        title:
          activistDetails.last_name +
          " " +
          activistDetails.first_name +
          " - קלפי :" +
          this.getBallotMiId(paymentAndAssignment.mi_id),
        geoItem: paymentAndAssignment,
        phone_number: electionRole.phone_number,
        activistDetails: activistDetails,
        details: details,
        newShiftId: null,
      };
      this.setState({
        editRoleShiftsModal: editRoleShiftsModal,
        showBallotDetails: true,
      });
    });
  }
  showChangeShiftAlertModal(otherRolesToChange) {
    let changeShiftAlertModal = {}; //this.state.changeShiftAlertModal;
    changeShiftAlertModal.show = true;
    changeShiftAlertModal.otherRolesToChange = otherRolesToChange;

    this.setState({ changeShiftAlertModal });
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
    let CanNotChange = false;

    this.setState({ CanNotChange });
  }

  hideEditModals() {
    this.hideChangeShiftAlertModal();
    this.hideEditRoleShiftsModal();
  }

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

  editRoleBallot(saveShiftId, saveSum) {
    let editGeoKey =
      this.state.editRoleShiftsModal.geoItem
        .activists_allocations_assignment_id;
    let shiftIndex = this.props.electionRolesShifts.findIndex(
      (item) => item.id == saveShiftId
    );
    let that = this;
    let fieldUpdatedState = {};

    var updateActivistDto = new ActivistUpdateDto();
    if (saveShiftId) {
      updateActivistDto.activistAllocationAssignmentId = editGeoKey;
      updateActivistDto.shiftRoleId = saveShiftId;

      fieldUpdatedState["election_role_shift_id"] =
        that.props.electionRolesShifts[shiftIndex].id;
      fieldUpdatedState["election_role_shift_system_name"] =
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

    this.setState({ editGeoKey: null });
    this.hideEditRoleShiftsModal();

    ElectionsActions.updateActivistDto(
      this.props.dispatch,
      updateActivistDto
    ).then(function () {
      that.props.dispatch({
        type: "UPDATE_FIELD_ACTIVIST_IN_SEARCH_LIST",
        voterId: that.state.editRoleShiftsModal.details.id,
        activistPaymentItem: that.state.editRoleShiftsModal.geoItem,
        fieldsUpdated: fieldUpdatedState,
      });
    });
  }

  hideChangeShiftAlertModal() {
    let changeShiftAlertModal = this.state.changeShiftAlertModal;
    changeShiftAlertModal.show = false;

    this.setState({ changeShiftAlertModal });
  }

  isHavePermission(system_name) {
    let permission = "elections.activists.search." + system_name + ".sum_edit";
    let canEditSumPermissions =
      this.props.currentUser.admin ||
      this.props.currentUser.permissions[permission] == true;
    return canEditSumPermissions;
  }

  //-----------------------------------------------------------------
  render() {
    if (this.props.isLoadingResults) {
      return (
        <div className="col-sm-4 rsltsTitle">
          <h3 className="noBgTitle">
            <i className="fa fa-spinner fa-pulse fa-fw"></i>&nbsp;מחפש
          </h3>
        </div>
      );
    } else if (!this.props.isSearchStarted) {
      return <div></div>;
    }
    return (
      <div className="resultsArea">
        <div className="row rsltsTitleRow">
          <div className="col-sm-7 rsltsTitle">
            <h3 className="noBgTitle">
              נמצאו{" "}
              <span className="rsltsCounter">
                {this.props.totalSearchResults}
              </span>{" "}
              רשומות
            </h3>
            <div className="showingCounter">
              {this.getCounterTitle()
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </div>

          <div className="col-sm-3 no-padding">
            <label htmlFor="actions" className="control-label col-sm-3">
              פעולות
            </label>
            <div className="col-sm-9">
              <Combo
                items={this.activistsActions}
                id="actions"
                maxDisplayItems={10}
                showFilteredList={false}
                itemIdProperty="id"
                itemDisplayProperty="name"
                className="form-combo-table"
                value={this.state.activistAction}
                onChange={this.onActionChange.bind(this)}
              />
            </div>
          </div>

          <div className="col-md-2">
            {(this.props.currentUser.admin ||
              this.props.currentUser.permissions[
                "elections.activists.export.all_details"
              ] == true) && (
              <div
                className="pull-left"
                style={{ padding: "0", marginRight: "15px" }}
              >
                <button
                  title="יצוא ל-אקסל"
                  className="icon-box excel"
                  style={{ border: "none", backgroundColor: "transparent" }}
                  disabled={!this.props.isFormValid}
                  onClick={this.exportToExcel.bind(this, "")}
                />
              </div>
            )}
          </div>
        </div>

        <div className="row nopaddingR nopaddingL">
          <div className="col-sm-12">
            <div className="dtlsBox srchRsltsBox">
              <div className="table-responsive">{this.renderActivists()}</div>
            </div>
          </div>
          {this.state.showChangeSumModal && (
            <ChangeSumModal
              fullName={this.state.changeSumActivistFullName}
              electionRole={this.state.activistElectionRole}
              updateSum={this.updateElectionRoleSum.bind(this)}
              closeChangeSumModal={this.closeChangeSumModal.bind(this)}
            />
          )}

          {this.state.showChangeCommentsModal && (
            <div className="modal-md">
              <ModalWindow
                disabledOkStatus={
                  this.state.activistElectionRole.user_lock_id &&
                  this.state.activistElectionRole.user_lock_id != ""
                }
                show={true}
                title={this.state.changeSumActivistFullName}
                buttonOk={this.updateCommentsRole.bind(this)}
                showCancel={true}
                buttonCancel={this.closeChangeCommentsModal.bind(this)}
                buttonX={this.closeChangeCommentsModal.bind(this)}
              >
                <div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label
                          htmlFor="input-change-sum"
                          className="col-lg-2 control-label"
                        >
                          הערה
                        </label>
                        <div className="col-lg-10">
                          <input
                            type="text"
                            className="form-control"
                            id="input-change-sum"
                            value={this.state.activistElectionRole.comment}
                            onChange={this.EventChangeComments.bind(this)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.state.activistElectionRole.user_lock_id &&
                  this.state.activistElectionRole.user_lock_id != "" ? (
                    <div className="row">
                      {" "}
                      <div className="errorEditField">
                        פעיל נעול , אין אפשרות לערוך
                      </div>
                    </div>
                  ) : null}
                </div>
              </ModalWindow>{" "}
            </div>
          )}

          {this.state.showDialogAsk && (
            <div className="modal-md">
              <ModalWindow
                show={true}
                buttonOk={this.updateLockRole.bind(this)}
                title={"ביטול נעילה עבור " + this.state.fullNameActivist}
                showCancel={true}
                buttonCancel={this.closeDialogLock.bind(this)}
                buttonX={this.closeDialogLock.bind(this)}
              >
                <div className="titAsk">
                  {this.state.activistElectionRole.user_lock_id &&
                  this.state.activistElectionRole.user_lock_id != "" ? (
                    <span>
                      האם ברצונך <b>לבטל </b>נעילת שיבוץ{" "}
                    </span>
                  ) : null}
                  {!this.state.activistElectionRole.user_lock_id ||
                  this.state.activistElectionRole.user_lock_id == "" ? (
                    <span>האם ברצונך לנעול שיבוץ </span>
                  ) : null}
                  <span>עבור {this.state.fullNameActivist}?</span>
                </div>
              </ModalWindow>
            </div>
          )}

          {this.state.showBallotDetails && (
            <EditRoleShiftsModal
              show={this.state.editRoleShiftsModal.show}
              title={this.state.editRoleShiftsModal.title}
              geoItem={this.state.editRoleShiftsModal.geoItem}
              phone_number={this.state.editRoleShiftsModal.phone_number}
              hideEditRoleShiftsModal={this.hideEditRoleShiftsModal.bind(this)}
              isAnotherActivistInBallot={this.isAnotherActivistInBallot.bind(
                this
              )}
              activistAllocatedShifts={
                this.state.editRoleShiftsModal.activistAllocatedShifts
              }
              getBallotMiId={this.getBallotMiId.bind(this)}
              activistDetailsOut={
                this.state.editRoleShiftsModal.activistDetails
              }
              canEditSumPermissions={this.isHavePermission(
                this.state.editRoleShiftsModal.electionRole.system_name
              )}
            />
          )}
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
          {/* {this.state.changeShiftAlertModal &&  <ChangeShiftAlertModal show={this.state.changeShiftAlertModal.show} activistDetails={this.state.editRoleShiftsModal.activistDetails}
                                       geoItem={this.state.editRoleShiftsModal.geoItem}
                                       editRoleBallot={this.editRoleBallot.bind(this)} hideEditModals={this.hideEditModals.bind(this)}
                                       otherRolesToChange={this.state.changeShiftAlertModal.otherRolesToChange}
                                       getBallotMiId={this.getBallotMiId.bind(this)}/>
									} */}
        </div>

        {this.props.totalSearchResults > this.activistsPerPage && (
          <div className="row">
            <Pagination
              resultsCount={this.props.totalSearchResults}
              displayItemsPerPage={this.activistsPerPage}
              currentPage={this.state.currentPage}
              navigateToPage={this.navigateToPage.bind(this)}
            />
          </div>
        )}
      </div>
    );
  }
}


function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        currentCampaign: state.system.currentCampaign,
        electionRolesShifts: state.elections.activistsScreen.electionRolesShifts
    }
}


export default connect(mapStateToProps)(ActivistsSearchResults);