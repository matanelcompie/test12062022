import React from "react";
import { Link } from "react-router";

import constants from "libs/constants";
import { isMobilePhone, inArray } from "../../../libs/globalFunctions";

class ActivistItem extends React.Component {
  constructor(props) {
    super(props);

    this.initConstants();
  }

  initConstants() {
    this.texts = {
      notAssigned: "לא משובץ",
      assigned: "משובץ",
    };

    this.styleButton = {
      cursor: "pointer",
      textDecoration: "none",
    };

    this.activistVerifiedStatus = constants.activists.verifyStatus;
    this.verifiedStatusTitle = constants.activists.verifiedStatusTitle;
    this.electionRoleSytemNames = constants.electionRoleSytemNames;
    this.noNeedAssignRoles = [
      "municipal_director",
      "municipal_secretary",
      "optimization_data_coordinator",
      "election_general_worker",
      "drivers_coordinator",
      "motivator_coordinator",
      "allocation_coordinator",
      "quarter_director",
    ];
  }

  renderMultiRoles() {
    return (
      <tr>
        <td>
          <input
            type="checkbox"
            checked={this.props.checked}
            onChange={this.props.onSelectActivst.bind(this)}
          />
        </td>
        <td>
          <Link to={"/elections/voters/" + this.props.activistItem.key}>
            {this.props.activistItem.personal_identity}
          </Link>
        </td>
        <td>
          {this.props.activistItem.last_name +
            " " +
            this.props.activistItem.first_name}
        </td>
        <td>{this.renderActivistPhone()}</td>
        {/* <td>{this.getVoterAddress()}</td> */}
        <td>
          {this.props.activistItem.bank_account_number ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>
        <td>
          {this.props.activistItem.validation_election_campaign_id ==
          this.props.currentCampaign.id ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>
        <td>
          {this.props.activistItem.verify_bank_document_key ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>
        <td>
          {this.props.activistItem.is_bank_verified ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>

        <td>{this.renderRolesInMultiRoles()}</td>
        <td>{this.renderAssignCityInMultiRoles()}</td>
        <td>{this.renderDetailsPlaceRole()}</td>
        <td>{this.renderSumsInMultiRoles()}</td>
        <td>{this.renderAssignmentsInMultiRoles()}</td>
        <td>{this.renderRoleLock()}</td>
        <td className="status-data">{this.renderVerifiedStatuses()}</td>
        <td>{this.renderRolesComments()}</td>
        <td style={{minWidth:'120px'}}>{this.renderActionsInMultiRoles()}</td>
      </tr>
    );
  }

  //-----------render function in table----------------
  /**
   * This function returns the phone
   * which is assigned to the activist
   *
   * @param roleIndex
   */
  renderActivistPhone(roleIndex = 0) {
    return this.props.activistItem.election_roles_by_voter[roleIndex]
      .phone_number;
  }

  renderRolesInMultiRoles() {
    let voterRoles = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        let HashPaymentPrint = {};
        if (roleItem.activist_roles_payments.length > 0) {
          let activist_roles_payments = roleItem.activist_roles_payments; // isBallotRole ? roleItem.activist_roles_payments : [roleItem.activist_roles_payments[0]];
          let namesRows = activist_roles_payments.map(
            (paymentRow, subIndex) => {
              if (!HashPaymentPrint[paymentRow.activist_roles_payments_id]) {
                let paymentTypeAdditionalName =
                  paymentRow.payment_type_additional_name
                    ? `(${paymentRow.payment_type_additional_name})`
                    : "";
                HashPaymentPrint[paymentRow.activist_roles_payments_id] = true;
                return (
                  <span key={roleIndex + subIndex} className="td-info">
                    {roleItem.election_role_name} {paymentTypeAdditionalName}
                  </span>
                );
              }
            }
          );
          return namesRows;
        }
      }
    );

    return voterRoles;
  }

  renderAssignCityInMultiRoles() {
    let HashPaymentPrint = {};
    let voterRoles = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        if (roleItem.activist_roles_payments.length > 0) {
          let rows = roleItem.activist_roles_payments.map(
            (payment, subIndex) => {
              if (!HashPaymentPrint[payment.activist_roles_payments_id]) {
                HashPaymentPrint[payment.activist_roles_payments_id] = true;
                return (
                  <span key={roleIndex + subIndex} className="td-info">
                    {roleItem.assigned_city_name}
                  </span>
                );
              }
            }
          );
          return rows;
        }
      }
    );

    return voterRoles;
  }

  renderDetailsPlaceRole() {
    let detailsPlace = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        let HashPaymentPrint = {};
        let isBallotRole = this.isBallotRole(roleItem);
        if (roleItem.activist_roles_payments.length > 0) {
         
          let namesRows = roleItem.activist_roles_payments.map(
            (paymentRow, subIndex) => {
              if (!HashPaymentPrint[paymentRow.activist_roles_payments_id]) {
                let placeDetails = this.getStringDetailsPlaceByRolePayment(
                  paymentRow.activist_roles_payments_id,
                  roleItem.activist_roles_payments,
                  isBallotRole
                );
                HashPaymentPrint[paymentRow.activist_roles_payments_id] = true;
                return (
                  <span key={roleIndex + subIndex} className="td-info">
                    {isBallotRole && (paymentRow.user_lock_id=='' || !paymentRow.user_lock_id) ?
                     <a onClick={this.showEditRoleShiftModal.bind(this,roleItem,paymentRow)}> {placeDetails}</a> 
                    :
                   placeDetails}
                  </span>
                );
              }
            }
          );
          return namesRows;
        }
      }
    );

    return detailsPlace;
 return (<span key={roleIndex} className="td-info">
                     
                           {isBallotRole && activist_roles_payments.length>0 && (!roleItem.user_lock_id || roleItem.user_lock_id=='') &&
                            <a onClick={this.showEditRoleShiftModal.bind(this,roleItem,ballotDetails)}> {stringDetailsPlace}</a> }
                             
                            {isBallotRole && activist_roles_payments.length>0 && (roleItem.user_lock_id  && roleItem.user_lock_id!='') &&
                            stringDetailsPlace}
     
                             {(!isBallotRole || stringDetailsPlace=='---')  && stringDetailsPlace}
                       </span>);
  }

  renderSumsInMultiRoles() {
    let HashPaymentPrint = {};
    let roleSums = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        let sumRows = null;
        if (roleItem.activist_roles_payments.length > 0) {
          sumRows = roleItem.activist_roles_payments.map(
            (rolePayment, subIndex) => {
              if (!HashPaymentPrint[rolePayment.activist_roles_payments_id]) {
                HashPaymentPrint[rolePayment.activist_roles_payments_id] = true;
                if (
                  this.hasSumEditPermission(rolePayment) &&
                  (!rolePayment.user_lock_id || rolePayment.user_lock_id == "")
                ) {
                  return (
                    <span key={roleIndex + subIndex} className="td-info">
                      <a
                        onClick={this.showChangeSumModal.bind(
                          this,
                          rolePayment
                        )}
                      >
                        {rolePayment.not_for_payment
                          ? "לא זכאי לתשלום"
                          : rolePayment.sum}
                      </a>
                    </span>
                  );
                } else {
                  return (
                    <span key={roleIndex + subIndex} className="td-info">
                      {rolePayment.not_for_payment
                        ? "לא זכאי לתשלום"
                        : rolePayment.sum}
                    </span>
                  );
                }
              }
            }
          );
        }

        return sumRows;
      }
    );

    return roleSums;
  }

  renderAssignmentsInMultiRoles() {
    let roleAssignments = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        let roleAssignment = this.getRoleAssignment(roleIndex);

        if (roleItem.activist_roles_payments.length > 0) {
          let assignmentsRows = this.getRoleAssignmentsShifts(
            roleItem.activist_roles_payments,
            roleIndex,
            roleAssignment
          );
          return assignmentsRows;
        }
      }
    );

    return roleAssignments;
  }

  getRoleAssignment(roleIndex = 0) {
    let roleSystemName =
      this.props.activistItem.election_roles_by_voter[roleIndex].system_name;
    if (inArray(this.noNeedAssignRoles, roleSystemName)) {
      return this.texts.assigned;
    }
    switch (roleSystemName) {
      case this.electionRoleSytemNames.ministerOfFifty:
        return (
          this.props.activistItem.election_roles_by_voter[roleIndex]
            .total_count_minister_of_fifty_count + " בתי אב"
        );

      case this.electionRoleSytemNames.clusterLeader:
        if (
          this.props.activistItem.election_roles_by_voter[roleIndex]
            .activists_allocations_assignments_count > 0
        ) {
          return this.texts.assigned;
        } else {
          return this.texts.notAssigned;
        }
      default:
        if (
          this.props.activistItem.election_roles_by_voter[roleIndex]
            .activists_allocations_assignments_count > 0
        ) {
          return this.texts.assigned;
        } else {
          return this.texts.notAssigned;
        }
    }
  }

  getRoleAssignmentsShifts(activist_roles_payments, roleIndex, roleAssignment) {
    let HashPaymentPrint = {};
    let assignmentsRows = activist_roles_payments.map(
      (rolePayment, subIndex) => {
        if (!HashPaymentPrint[rolePayment.activist_roles_payments_id]) {
          HashPaymentPrint[rolePayment.activist_roles_payments_id] = true;
          return (
            <span
              key={roleIndex + subIndex}
              className="td-info"
              style={{ minHeight: "30px",fontSize:"15px" }}
            >
              {" "}
              {roleAssignment} {rolePayment.shift_name}
            </span>
          );
        }
      }
    );
    return assignmentsRows;
  }

  renderRoleLock() {
      let HashPaymentPrint={};
    return  this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        let classNamePermission=this.isAllowedToLock(roleItem.system_name) ? "" : "noPermission";
        if (roleItem.activist_roles_payments.length > 0) {
            let column = roleItem.activist_roles_payments.map(
              (paymentRow, subIndex) => {
                if (!HashPaymentPrint[paymentRow.activist_roles_payments_id]) {
                    HashPaymentPrint[paymentRow.activist_roles_payments_id] = true;
                    if(paymentRow.user_lock_id && paymentRow.user_lock_id!='')
                    var icon=<i className={classNamePermission} style={{ cursor: "pointer", fontSize: "22px", color: "#1d68a9" }} className="fa fa-lock"aria-hidden="true"></i>
                    else
                    var icon=<i className={classNamePermission} style={{ cursor: "pointer", fontSize: "22px" }} className="fa fa-key"aria-hidden="true"></i>
                    var lockCol= <span
                     className={classNamePermission} key={roleIndex + subIndex} onClick={this.askLockRole.bind(this, paymentRow)} style={{ display: "block", minHeight: "30px" }}>
                    {icon}
                   </span>
                   return  lockCol;
           
                }
              }
            );
            return column;
          }
        });
  }

  renderVerifiedStatuses() {
    let HashPaymentPrint={};
    let roleVerifiedStatuses = this.props.activistItem.election_roles_by_voter.map(
        (roleItem, roleIndex) => {
          if (roleItem.activist_roles_payments.length > 0) {
            let statusesRows = roleItem.activist_roles_payments.map(
              (paymentRow, subIndex) => {
                if (!HashPaymentPrint[paymentRow.activist_roles_payments_id]) {
                   HashPaymentPrint[paymentRow.activist_roles_payments_id]=true;
                  return (
                    <span
                      key={roleIndex + subIndex}
                      className="status-icon"
                      style={{ display: "block", minHeight: "30px" }}
                    >
                     {this.getVerifiedStatus(roleIndex)}
                    </span>
                  );
                }
            
              }
            );
            return statusesRows;
          }
        }
      );

    return roleVerifiedStatuses;
  }

  renderRolesComments() {
    let HashPaymentPrint={};
    let roleComments = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        if (roleItem.activist_roles_payments.length > 0) {
          let commentsRows = roleItem.activist_roles_payments.map(
            (paymentRow, subIndex) => {
              if (!HashPaymentPrint[paymentRow.activist_roles_payments_id]) {
                HashPaymentPrint[paymentRow.activist_roles_payments_id]=true;
                //--image for display
                if (paymentRow.comment && paymentRow.comment.split(" ").join("") != "") {
                  var commentImageItem = (<img  src={window.Laravel.baseURL + "Images/yes-comment.png"} style={{ cursor: "pointer" }} title={paymentRow.comment} />);
                } else {
                  var commentImageItem = ( <img src={window.Laravel.baseURL + "Images/no-comment.png"} />);
                }

              return (
                <span
                  onClick={this.showChangeComments.bind(this,paymentRow)}
                  key={roleIndex + subIndex}
                  style={{ display: "block", minHeight: "30px" }}
                >
                  {commentImageItem}
                </span>
              );
                  }
            }
          );
          return commentsRows;
        }
      }
    );

    return roleComments;
  }

    /**
   * This function renders action for an
   * activist who has more that 1 role.
   *
   */
     renderActionsInMultiRoles() {
      let userFilteredCitiesHash = this.props.userFilteredCitiesHash;
      let isUserAdmin = this.props.isUserAdmin;
      let HashPaymentPrint = {};
      let that = this;
      let actions = this.props.activistItem.election_roles_by_voter.map(
        (roleItem, roleIndex) => {
          let linkTo = "elections/activists/" + this.props.activistItem.key + "/" +roleItem.key;
          let canEdit = that.props.displayEditActivist && (isUserAdmin || userFilteredCitiesHash[roleItem.assigned_city_id] )? true: false;

          if (canEdit && this.props.checkEditAllocationPermission(roleItem.system_name)){
           var link=(
              <div className="edit-item flexed flex-center" key={roleIndex}>
                <Link
                  to={linkTo}
                  target={"_blank"}
                  className="edit-item flexed flex-center"
                  style={this.styleButton}
                >
                  <span
                    className="glyphicon glyphicon-pencil"
                    aria-hidden="true"
                  ></span>
                  <span style={{ color: "#498bb6" }}>עריכת פעיל</span>
                </Link>
              </div>
            );
          } else {
            var link=(<div key={roleIndex} className="edit-item flexed flex-center">--</div>);
          }
  
          if (roleItem.activist_roles_payments.length) {
            let actLink = roleItem.activist_roles_payments.map((paymentRow) => {
              if (!HashPaymentPrint[paymentRow.activist_roles_payments_id]) {
                HashPaymentPrint[paymentRow.activist_roles_payments_id]=true;
                return (
                  <div className="flexed flex-center open-link" >{link}</div>
                );
              }
            });

            return actLink;
          }
        }
      );
  
      return actions;
    }

  //---------end render function---------------
  redirectToEditActivistPage(roleId) {
    this.props.redirectToEditActivistPage(this.props.activistItem.key, roleId);
  }

  showAddAllocationModal() {
    this.props.showAddAllocationModal(this.props.activistIndex);
  }

  getVoterAddress() {
    let address = "";
    let activistItem = this.props.activistItem;

    let houseName = activistItem.house ? " " + activistItem.house : "";

    let streetName = "";
    if (activistItem.street_name != null) {
      streetName = activistItem.street_name
        ? activistItem.street_name + houseName + " ,"
        : "";
    } else if (activistItem.street != null) {
      streetName = activistItem.street
        ? activistItem.street + houseName + " ,"
        : "";
    }
    address = streetName + activistItem.city_name;

    return address;
  }

  /**
   * Show change sum modal
   *
   * @param object electionRole
   * @return void
   */
  showChangeSumModal(activistPaymentItem, e) {
    if (activistPaymentItem.not_for_payment) {
      return;
    }
    this.props.showChangeSumModal(
      this.props.activistItem.last_name +
        " " +
        this.props.activistItem.first_name,
      activistPaymentItem
    );
  }
  showChangeComments(activistPaymentItem, e) {
    this.props.showChangeCommentsModal(
      this.props.activistItem.last_name +
        " " +
        this.props.activistItem.first_name,
      activistPaymentItem
    );
  }

  askLockRole(activistPaymentItem) {
    this.props.askLockRoleActivist(
      this.props.activistItem.last_name +
        " " +
        this.props.activistItem.first_name,
      activistPaymentItem
    );
  }

  getBallotMiId(ballotMiId) {
    if (ballotMiId == undefined) return "";
    var miIdStr = ballotMiId.toString();
    var lastDigit = miIdStr.charAt(miIdStr.length - 1);

    return miIdStr.substring(0, miIdStr.length - 1) + "." + lastDigit;
  }

  getStringDetailsPlaceByRolePayment(
    electionRolePaymentId,
    arrPaymentAssignment,
    isBallotBox
  ) {
    var recordsAssignmentPayment = arrPaymentAssignment.filter((a) => {
      return a.activist_roles_payments_id == electionRolePaymentId;
    });
    var stringDetailsPlace = "";

    recordsAssignmentPayment.forEach((assignment) => {
      if (!isBallotBox)
        stringDetailsPlace =
          stringDetailsPlace == ""
            ? assignment.cluster_name
            : `${stringDetailsPlace}','${assignment.cluster_name}`;
      else
        stringDetailsPlace =
          "קלפי :" +
          this.getBallotMiId(assignment["areas_ballot_boxes_mi_id"]) +
          " - " +
          assignment["cluster_name"];
    });

    return stringDetailsPlace;
  }

  showEditRoleShiftModal(electionRole, electionRoleGeo) {
    this.props.showEditRoleShiftModal(
      electionRole,
      electionRoleGeo,
      this.props.activistItem
    );
  }

  isAllowedToLock(roleSystemName) {
    let lockPermission = "elections.activists." + roleSystemName + ".lock";
    return (
      this.props.currentUser.admin ||
      this.props.currentUser.permissions[lockPermission] == true
    );
  }



  getRoleSumsShifts(roleItem, roleIndex) {
    let sumRows = roleItem.activist_roles_payments.map(
      (activistPaymentItem, subIndex) => {
        let userNotLocked =
          !activistPaymentItem.user_lock_id ||
          activistPaymentItem.user_lock_id == "";
        if (this.hasSumEditPermission(roleItem) && userNotLocked) {
          return (
            <span key={roleIndex + subIndex} className="td-info">
              <a
                onClick={this.showChangeSumModal.bind(
                  this,
                  activistPaymentItem
                )}
              >
                {activistPaymentItem.not_for_payment
                  ? "לא זכאי לתשלום"
                  : activistPaymentItem.sum}
              </a>
            </span>
          );
        } else {
          return (
            <span key={roleIndex + subIndex} className="td-info">
              {activistPaymentItem.not_for_payment
                ? "לא זכאי לתשלום"
                : activistPaymentItem.sum}
            </span>
          );
        }
      }
    );
    return sumRows;
  }
  getVerifiedStatus(roleIndex = 0) {
    let statusImg = "";
    let statusTitle = "";

    switch (
      this.props.activistItem.election_roles_by_voter[roleIndex].verified_status
    ) {
      case this.activistVerifiedStatus.noMessageSent:
        statusImg = window.Laravel.baseAppURL + "Images/Grey-clock.png";
        statusTitle = this.verifiedStatusTitle.noMessageSent;
        break;

      case this.activistVerifiedStatus.messageSent:
        statusImg = window.Laravel.baseAppURL + "Images/ico-status-pending.svg";
        statusTitle = this.verifiedStatusTitle.messageSent;
        break;

      case this.activistVerifiedStatus.verified:
        statusImg = window.Laravel.baseAppURL + "Images/ico-status-done.svg";
        statusTitle = this.verifiedStatusTitle.verified;
        break;

      case this.activistVerifiedStatus.refused:
        statusImg = window.Laravel.baseAppURL + "Images/ico-status-fail.svg";
        statusTitle = this.verifiedStatusTitle.refused;
        break;

      case this.activistVerifiedStatus.moreInfo:
        statusImg = window.Laravel.baseAppURL + "Images/Question.png";
        statusTitle = this.verifiedStatusTitle.moreInfo;
        break;
    }

    return (
      <img
        data-toggle="tooltip"
        data-placement="left"
        title={statusTitle}
        src={statusImg}
      />
    );
  }


  renderBankDetailsFieldMultiRoles(fieldName) {
    let accountsRoles = this.props.activistItem.election_roles_by_voter.map(
      (roleItem, roleIndex) => {
        return this.renderBankDetailsField(fieldName, roleItem, roleIndex);
      }
    );
    return accountsRoles;
  }
  renderBankDetailsField(fieldName, roleItem, roleIndex = 0) {
    let hasAccount = roleItem[fieldName] ? <span>כן</span> : <span>לא</span>;
    return (
      <span key={fieldName + " " + roleIndex} className="td-info">
        {hasAccount}
      </span>
    );
  }

  renderEditButton(roleIndex = 0) {
    let election_roles_by_voter =
      this.props.activistItem.election_roles_by_voter[roleIndex];
    let linkTo = "";

    if (
      this.props.checkEditAllocationPermission(
        election_roles_by_voter.system_name
      ) == true
    ) {
      if (roleIndex > -1) {
        linkTo =
          "elections/activists/" +
          this.props.activistItem.key +
          "/" +
          election_roles_by_voter.key;
      }
      return (
        <div className="edit-item flexed flex-center" style={this.styleButton}>
          <Link
            to={linkTo}
            target={"_blank"}
            className="edit-item flexed flex-center"
            style={this.styleButton}
          >
            <span
              className="glyphicon glyphicon-pencil"
              aria-hidden="true"
            ></span>
            <span style={{ color: "#498bb6" }}>עריכת פעיל</span>
          </Link>
        </div>
      );
    } else {
      return "--";
    }
  }

  /**
   * Check if user has sum edit permissions
   *
   * @param object electionRole
   * @return boolean
   */
  hasSumEditPermission(electionRole) {
    let permission =
      "elections.activists.search." + electionRole.system_name + ".sum_edit";
    if (
      this.props.currentUser.admin ||
      this.props.currentUser.permissions[permission] == true
    )
      return true;
    else return false;
  }

  /**
   * This function checks if the current user
   * can add any role and renders a button for
   * showing add allocation modal if he has any;
   * add role permission.
   *
   * @returns {*}
   */
  renderAddAllocationButton() {
    if (this.props.checkAddAllocationPermissions()) {
      return (
        <div
          className="edit-item flexed flex-center"
          style={this.styleButton}
          onClick={this.showAddAllocationModal.bind(this)}
        >
          <span className="glyphicon glyphicon-plus" aria-hidden="true" />
          <span style={{ color: "#498bb6" }}>שבץ תפקיד</span>
        </div>
      );
    } else {
      return <div className="edit-item flexed flex-center">--</div>;
    }
  }

  /**
   * This function displays phone for
   * a voter who doesn't have a role.
   *
   * @returns {string}
   */
  getVoterPhone() {
    let voterPhones = this.props.activistItem.voter_phones;

    for (let phoneIndex = 0; phoneIndex < voterPhones.length; phoneIndex++) {
      let phoneNumber = voterPhones[phoneIndex].phone_number;
      let phoneToCheck = phoneNumber.split("-").join("");

      if (isMobilePhone(phoneToCheck)) {
        return phoneNumber;
      }
    }

    return "--";
  }
  isBallotRole(electionRole) {
    let ballotRoles = [
      this.electionRoleSytemNames.ballotMember,
      this.electionRoleSytemNames.observer,
      this.electionRoleSytemNames.counter,
    ];
    return inArray(ballotRoles, electionRole.system_name);
  }

  getHashPaymentForRoleLine(electionRoleByVoter) {
    var hash = [];
    array.forEach((element) => {});
  }
  renderNoRole() {
    return (
      <tr>
        <td>
          <input
            type="checkbox"
            checked={this.props.checked}
            onChange={this.props.onSelectActivst.bind(this)}
          />
        </td>
        <td>
          <Link
            to={"/elections/voters/" + this.props.activistItem.key}
            target="_blank"
          >
            {this.props.activistItem.personal_identity}
          </Link>
        </td>
        <td>
          {this.props.activistItem.last_name +
            " " +
            this.props.activistItem.first_name}
        </td>
        <td>{this.getVoterPhone()}</td>
        {/* <td>{this.getVoterAddress()}</td> */}

        <td>
          {this.props.activistItem.bank_account_number ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>
        <td>
          {this.props.activistItem.validation_election_campaign_id ==
          this.props.currentCampaign.id ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>
        <td>
          {this.props.activistItem.verify_bank_document_key ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>
        <td>
          {this.props.activistItem.is_bank_verified ? (
            <span>כן</span>
          ) : (
            <span>לא</span>
          )}
        </td>

        <td>{this.texts.notAssigned}</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td className="status-data">--</td>
        <td>{this.renderAddAllocationButton()}</td>
      </tr>
    );
  }

  render() {
    if (this.props.activistItem.election_roles_by_voter != undefined) {
      switch (this.props.activistItem.election_roles_by_voter.length) {
        case 0:
          return this.renderNoRole();
          break;

        default:
          return this.renderMultiRoles();
          break;
      }
    } else {
      return this.renderNoRole();
    }
  }
}

export default ActivistItem;
