import React from "react";
import { connect } from "react-redux";

import constants from "../../../../libs/constants";
import {
  validateEmail,
  validatePersonalIdentity,
  checkPersonalIdentity,
  getDefaultSendActivistMessage,
  formatBallotMiId,
} from "libs/globalFunctions";
import Combo from "components/global/Combo";
import ModalWindow from "components/global/ModalWindow";
import AddAllocationPhoneItem from "./AddAllocationPhoneItem";
import AddAllocationNewPhone from "./AddAllocationNewPhone";
import * as ElectionsActions from "../../../../actions/ElectionsActions";
import * as AllocationAndAssignmentActions from "../../../../actions/AllocationAndAssignmentActions";
import { Voter } from "../../../../Models/Voter";
import { getBallotsAvailableShifts } from '../../../../libs/services/models/ballotService';
import { ActivistCreateDto } from "../../../../DTO/ActivistCreateDto";
import { ElectionRoleSystemName } from "../../../../Enums/ElectionRolesSystemName";
import { SearchActivistDto } from "../../../../DTO/SearchActivistDto";
import { getListDays } from "../../../../helper/DateActionHelper";
import { GeographicAllocationDto } from "../../../../DTO/GeographicAllocationDto";
import { withRouter } from "react-router";

class ModalAddAssignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      price: 0,
      loadingList:true,
      searchPersonalIdentity: null,
      voter: this.props.voterDetails ? this.props.voterDetails : new Voter(),
      activistCreate: new ActivistCreateDto(),
      carTypes: [
        { id: constants.activists.driverCarTypes.regular, name: "רכב רגיל" },
        {
          id: constants.activists.driverCarTypes.crippled,
          name: "רכב הסעות מונגש",
        },
      ],
      electionRoleSystemName: this.props.electionRoleSystemName,
      electionRoles: [],
      electionRolesShifts: [],
      electionRoleBudget: [],
      electionShiftRolesBudget: [],
      selectedElectionRole: null,
      selectedElectionRoleShift: null,
      //must be GeographicAllocationDto
      geographicAllocation: new GeographicAllocationDto(),
      cityClusters: [],
      cityBallots: [],
      cityQuarters: [],
      errors: {},
      cleanCombo: {
        city: false,
        cluster: false,
        quarter: false,
        ballot: false,
        shift: false,
      },
    };

  }

  componentDidMount(){
    this.button();
    this.loadModalLists();
  }

  loadModalLists() {
    let that = this;
    let electionRoles = ElectionsActions.loadElectionRoles(this.props.dispatch);
    let electionRoleDefaultPrice =
      ElectionsActions.loadCurrentElectionRolesCampaignBudget(
        this.props.dispatch
      );
    let loadPriceBudgetShiftRoles =
      ElectionsActions.loadCurrentElectionRolesCampaignBudget(
        this.props.dispatch
      );
    let electionRoleShift = ElectionsActions.loadElectionRolesShifts(
      this.props.dispatch
    );

    let arrayRequestList = [
      electionRoles,
      electionRoleDefaultPrice,
      loadPriceBudgetShiftRoles,
      electionRoleShift,
    ];

    if (this.props.geographicAllocation) {
      let geographicDetails =
        AllocationAndAssignmentActions.getGeographicDetailsByGeographicEntityValue(
          this.props.dispatch,
          this.props.geographicAllocation
        );
      arrayRequestList.push(geographicDetails);
    }
    Promise.all(arrayRequestList).then(function (lists) {
      that.displayAllList(lists);
    });
  }

  displayAllList(lists){
    
    let electionRoles = lists[0];
    electionRoles = this.filterElectionRoleByPermission(electionRoles);
    let electionRoleBudget = lists[1];
    let electionShiftRolesBudget = lists[2];
    let electionRolesShifts = lists[3];
    let geographicAllocation = this.props.geographicAllocation?lists[4]:null;
   
    this.setState({
      electionRoles,
      electionRoleBudget,
      electionShiftRolesBudget,
      electionRolesShifts,
      loadingList:false
    },()=>{
      this.setSelectedElectionRole();
      this.setSelectedElectionShiftRole();
      if(geographicAllocation)
      this.setDetailsGeographicAllocation(geographicAllocation);
    });
  }
  setDetailsActivist = (fieldName, event) => {
    let errors=this.state.errors;
    errors[fieldName] = false;

    let value = event.target.value;
    if (event.target.selectedItem) value = event.target.selectedItem.id;

    let activistCreate = { ...this.state.activistCreate };
    activistCreate[fieldName] = value;
    this.setState({ activistCreate , errors});
  };

  setTransportationDetails = (nameField, e) => {
    let transportationCarDetails = this.state.transportationCarDetails;
    transportationCarDetails[nameField] = e.target.value;
    this.setState({ transportationCarDetails });
  };

  checkAddRolePermission(electionRoleSystemName) {
    let addPermission =
      "elections.activists." + electionRoleSystemName + ".add";

    return (
      this.props.currentUser.admin ||
      this.props.currentUser.permissions[addPermission] == true
    );
  }

  filterElectionRoleByPermission = (allElectionRoles) => {
    return allElectionRoles.filter((role) => {
      return this.checkAddRolePermission(role.system_name);
    });
  };

  setSelectedElectionRole() {
    if (this.props.electionRoleSystemName) {
      let selectedElectionRole = this.state.electionRoles.find(
        (role) => role.system_name == this.props.electionRoleSystemName
      );
      this.setState({selectedElectionRole})
    }
  }
  setSelectedElectionShiftRole() {
    if (this.props.electionRolesShiftSystemName) {
      let selectedElectionRoleShift = this.state.electionRolesShifts.find(
        (role) => role.system_name == this.props.electionRolesShiftSystemName
      );
      this.setState({selectedElectionRoleShift})
    }
  }

  setDetailsGeographicAllocation(geographicAllocation) {
    let activistCreate = { ...activistCreate };
    geographicAllocation.geographicType =
      this.props.geographicAllocation.geographicType;
    geographicAllocation.geographicValue =
    this.props.geographicAllocation.geographicValue;
    activistCreate.city_id = geographicAllocation.city.id;
    if (geographicAllocation.cluster)
      activistCreate.cluster_id = geographicAllocation.cluster.id;
    if (geographicAllocation.quarter)
      activistCreate.quarter_id = geographicAllocation.quarter.id;
    if (geographicAllocation.ballotBox)
      activistCreate.ballot_id = geographicAllocation.ballotBox.id;

    this.setState({ geographicAllocation, activistCreate });
  }

  onChangeRole = (e) => {
    let errors={...this.state.errors};
    errors.election_role_id=false;
    let activistCreate = new ActivistCreateDto();
    let selectedElectionRole = e.target.selectedItem;
    let cleanCombo = {
      city: true,
      cluster: true,
      quarter: true,
      ballot: true,
      shift: true,
    };
    if (selectedElectionRole) {
      activistCreate.election_role_id = selectedElectionRole.id;
    }

    this.setState({ activistCreate, selectedElectionRole, cleanCombo,errors }, () => {
      let cleanCombo = {};
      this.setState({ cleanCombo });
      this.setPriceActivist();
      if (
        this.state.voter.personal_identity && this.state.selectedElectionRole && this.state.selectedElectionRole.id
      )
        this.checkIfVoterHasConflictRole(this.state.voter.personal_identity);
    });
  };

  setPriceActivist() {
    let selectedElectionRole = this.state.selectedElectionRole;
    let price = 0;
    if (selectedElectionRole) {
      //price of ballot activist by shift
      if (this.isBallotActivist())
        price = this.getPriceBallotActivistByShiftAndRole();
      else price = this.getPriceForActivistNotInBallot();
    }

    this.setState({ price });
  }
  getPriceForActivistNotInBallot() {
    let selectedElectionRole = this.state.selectedElectionRole;
    let price = selectedElectionRole.budget;
    let city_id = this.state.activistCreate.city_id;

    if (city_id) {
      let cityRoleBudget = this.state.electionRoleBudget.find(
        (role) =>
          role.city_id == city_id &&
          role.election_role_id == selectedElectionRole.id
      );
      if (cityRoleBudget) {
        price = cityRoleBudget.budget;
      }
    }

    return price;
  }

  getPriceBallotActivistByShiftAndRole() {
    debugger
    let shift_system_name = this.state.selectedElectionRoleShift
      ? this.state.selectedElectionRoleShift.system_name
      : null;
    let election_role_system_name = this.state.selectedElectionRole.system_name;
    let price = 0;

    let shiftBudget = this.state.electionShiftRolesBudget.find(
      (shift) =>
        shift.election_role_shift_system_name == shift_system_name &&
        shift.election_role_system_name == election_role_system_name
    );

    if (shiftBudget) {
      price = shiftBudget.budget;
    }

    return price;
  }

  onSearchVoterKeyPress(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode == 13 && !this.state.errors.personal_identity) {
      this.searchForVoter();
    }
  }

  onChangeVoterPersonalIdentity(e) {
    let searchPersonalIdentity = e.target.value;
    let errors = { ...this.state.errors };
    errors.personal_identity = !checkPersonalIdentity(+searchPersonalIdentity);
    this.setState({ errors, searchPersonalIdentity });
  }

  searchForVoter = () => {
    //on click for reset voter
    if (this.state.voter.personal_identity) {
      let voter = new Voter();
      this.setState({voter})
    } else if (!this.state.errors.personal_identity) {
      this.checkIfVoterHasConflictRole(this.state.searchPersonalIdentity);
    }
  };

  checkIfVoterHasConflictRole(personal_identity) {
    let searchActivist = new SearchActivistDto();
    let city_id = this.state.activistCreate.city_id;
    searchActivist.personal_identity = personal_identity;
    searchActivist.election_role_system_name = this.state.selectedElectionRole
      ? this.state.selectedElectionRole.system_name
      : null;
    searchActivist.city_id = city_id;
    AllocationAndAssignmentActions.searchVoterAndCheckIfNotHasConflictRole(
      this.props.dispatch,
      searchActivist
    ).then((voter) => {
      if (voter && !this.props.voterDetails) {
        let errors={...this.state.errors};
        errors.personal_identity=false;
        this.setState({ voter,errors });
        this.setDefaultActivistDetailsBySameAssignmentRole(voter);
      }
    });
  }

  setDefaultActivistDetailsBySameAssignmentRole(voterDetailsAndOtherRole) {
    let activistCreate = { ...this.state.activistCreate };
    activistCreate.email = voterDetailsAndOtherRole.email;
    let selectedElectionRole = this.state.selectedElectionRole;
    //other role of voter;
    if (
      voterDetailsAndOtherRole.election_roles_by_voter &&
      voterDetailsAndOtherRole.election_roles_by_voter.length > 0
    ) {
      //check if exist the same role and get details comment and other details in form
      let electionRoleVoter =
        voterDetailsAndOtherRole.election_roles_by_voter.find(
          (role) =>
            role.election_role_system_name == selectedElectionRole.system_name
        );
      if (electionRoleVoter) {
        activistCreate.comment = electionRoleVoter.comment;
        activistCreate.phone_number = electionRoleVoter.phone_number;
      }
    }
    this.setState({ activistCreate });
  }

  renderSearchForVoter() {
    let disabledSearchVoter =
      !this.state.selectedElectionRole || !this.state.selectedElectionRole.id;
    return (
      <div className="container-details-group border-button">
        <div className="col" className="form-group">
          <label>סוג פעיל</label>
          {this.props.electionRoleSystemName ? (
            <div className="flexed">
              <span className="span-name-voter">
                {this.state.selectedElectionRole &&
                  this.state.selectedElectionRole.name}
              </span>
            </div>
          ) : (
            <Combo
              error={this.state.errors.election_role_id}
              items={this.state.electionRoles}
              onChange={this.onChangeRole}
              id="ModalActivistInput"
              maxDisplayItems={10}
              itemIdProperty="id"
              itemDisplayProperty="name"
              className="form-combo-table"
            />
          )}
        </div>

        <div
          className="col"
          className={"form-group " + (disabledSearchVoter ? "disabled" : "")}
        >
          <label>פעיל</label>
          <div className="flexed">
            {this.state.voter.personal_identity ? (
              <span className="span-name-voter">
                {" "}
                {this.state.voter.first_name +
                  " " +
                  this.state.voter.last_name}{" "}
                - {this.state.voter.personal_identity}
              </span>
            ) : (
              <input
                type="text"
                className={
                  "form-control " +
                  (this.state.errors.personal_identity ? "error" : "")
                }
                value={this.state.voter.personal_identity}
                onKeyPress={this.onSearchVoterKeyPress.bind(this)}
                onChange={this.onChangeVoterPersonalIdentity.bind(this)}
              />
            )}

            {!this.props.voterDetails ? (
              <a
                className="search-icon blue"
                onClick={this.searchForVoter.bind(this)}
              >
                {" "}
              </a>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  }

  renderGeographicDetails() {
    let displayCluster = this.isBallotActivist() || this.isClusterActivist();
    let displayQuarter =
      this.isBallotActivist() ||
      this.isClusterActivist() ||
      this.isQuarterActivist();

    //display quarter only if the activist is cluster and
    displayCluster =
      displayCluster &&
      (!this.state.geographicAllocation.geographicType ||
        this.state.geographicAllocation.cluster);

    displayQuarter =
      displayQuarter &&
      (!this.state.geographicAllocation.geographicType ||
        this.state.geographicAllocation.quarter);

    return (
      <div className="container-details-group">
        <div className="col" className="form-group">
          <label>עיר</label>
          <div>
            {this.state.geographicAllocation.geographicType ? (
              <span className="span-name-voter">
                {this.state.geographicAllocation.city.name}
              </span>
            ) : (
              <Combo
                error={this.state.errors.city_id}
                onChange={this.onChangeAssignedCity}
                items={this.props.userFilteredCities}
                id="ModalActivistInput"
                maxDisplayItems={10}
                itemIdProperty="id"
                itemDisplayProperty="name"
                className="form-combo-table"
                cleanSelectedItems={this.state.cleanCombo.city}
              />
            )}
          </div>
        </div>
        <div
          className="col"
          className={"form-group " + (!displayCluster ? "hidden" : "")}
        >
          <label>אשכול</label>
          <div className="flexed">
            {this.state.geographicAllocation.geographicType &&
            this.state.geographicAllocation.cluster ? (
              <span className="span-name-voter">
                {this.state.geographicAllocation.cluster.name}
              </span>
            ) : (
              <Combo
                error={this.state.errors.cluster_id}
                items={this.state.cityClusters.filter((a) => {
                  return !a.NotDisplay;
                })}
                id="ModalActivistInput"
                maxDisplayItems={10}
                itemIdProperty="id"
                itemDisplayProperty="name"
                className="form-combo-table"
                onChange={this.onChangeCluster}
                cleanSelectedItems={this.state.cleanCombo.cluster}
              />
            )}
          </div>
        </div>
        <div
          className="col"
          className={"form-group " + (!displayQuarter ? "hidden" : "")}
        >
          <label>רובע</label>
          <div>
            {this.state.geographicAllocation.geographicType &&
            this.state.geographicAllocation.quarter ? (
              <span className="span-name-voter">
                {this.state.geographicAllocation.quarter.name}
              </span>
            ) : (
              <Combo
                items={this.state.cityQuarters}
                error={this.state.errors.quarter_id}
                id="ModalActivistInput"
                maxDisplayItems={10}
                itemIdProperty="id"
                itemDisplayProperty="name"
                className="form-combo-table"
                onChange={this.onChangeQuarter}
                cleanSelectedItems={this.state.cleanCombo.quarter}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  renderBallotActivistDetails() {
    let displayShift = this.state.activistCreate.ballot_id;
    return (
      this.isBallotActivist() && (
        <div className="row">
          <div className="container-details-group">
            <div className="col" className="form-group">
              <label>קלפי</label>
              <div className="flexed">
                {this.state.geographicAllocation.geographicType &&
                this.state.geographicAllocation.ballotBox ? (
                  <span className="span-name-voter">
                    {formatBallotMiId(
                      this.state.geographicAllocation.ballotBox.mi_id
                    )}
                  </span>
                ) : (
                  <Combo
                    error={this.state.errors.ballot_id}
                    items={this.state.cityBallots.filter((a) => {
                      return !a.NotDisplay;
                    })}
                    id="ModalActivistInput"
                    maxDisplayItems={10}
                    itemIdProperty="id"
                    itemDisplayProperty="name"
                    className="form-combo-table"
                    cleanSelectedItems={this.state.cleanCombo.ballot}
                    onChange={this.onChangeBallotBox.bind(this)}
                  />
                )}
              </div>
            </div>
            <div
              className="col"
              className={"form-group " + (displayShift ? "" : "disabled")}
            >
              <label>משמרת</label>
              <div className="flexed">
                {this.props.electionRolesShiftSystemName &&
                this.state.geographicAllocation.ballotBox ? (
                  <span className="span-name-voter">
                    {this.state.selectedElectionRoleShift.name}
                  </span>
                ) : (
                  <Combo
                    error={this.state.errors.shift_system_name}
                    items={this.state.electionRolesShifts.filter((a) => {
                      return !a.NotDisplay;
                    })}
                    id="ModalActivistInput"
                    maxDisplayItems={10}
                    itemIdProperty="id"
                    itemDisplayProperty="name"
                    className="form-combo-table"
                    cleanSelectedItems={this.state.cleanCombo.shift}
                    onChange={this.onChangeShift.bind(this)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  renderDriverDetails() {
    return (
      this.state.selectedElectionRole &&
      this.state.selectedElectionRole.system_name ==
        ElectionRoleSystemName.DRIVER && (
        <div className="row">
          <div className="container-details-group">
            <div className="col" className="form-group">
              <label>סוג רכב</label>
              <Combo
                error={this.state.errors.car_type}
                items={this.state.carTypes}
                id="ModalActivistInput"
                maxDisplayItems={10}
                itemIdProperty="id"
                itemDisplayProperty="name"
                className="form-combo-table"
                onChange={this.setDetailsActivist.bind(this, "car_type")}
              />
            </div>
            <div className="col" className="form-group">
              <label>מספר רכב</label>
              <input
                className={"form-control "+(this.state.errors.car_number?'has-error':'')}
                onChange={this.setDetailsActivist.bind(this, "car_number")}
              ></input>
            </div>
            <div className="col" className="form-group">
              <label>מספר מושבים</label>
              <input
                type="number"
                className={"form-control "+(this.state.errors.car_seats?'has-error':'')}
                onChange={this.setDetailsActivist.bind(this, "car_seats")}
              ></input>
            </div>
          </div>
        </div>
      )
    );
  }

  renderPhones() {
    let that = this;
    let phones = this.state.voter.voter_phones
      ? this.state.voter.voter_phones.map(function (phoneItem, index) {
          return (
            <AddAllocationPhoneItem
              key={index}
              rolePhoneNumber={that.state.activistCreate.phone_number}
              phoneIndex={index}
              item={phoneItem}
              deleteNewPhoneNumber={that.deleteNewPhoneNumber.bind(that)}
              setRolePhoneNumber={that.setActivistPhoneNumber.bind(that)}
            />
          );
        })
      : null;

    return phones;
  }

  renderActivistConcatDetails() {
    return (
      <div className={"container-details-group"}>
        <div className="row">
          <div className="col-lg-6">
            <form className="form-horizontal">
              <div
                className={
                  "form-group" +
                  (this.state.voter.voter_phones &&
                  this.state.voter.voter_phones.length
                    ? ""
                    : " has-error")
                }
              >
                <label
                  htmlFor="inputModalMobile"
                  className="col-lg-3 control-label no-padding"
                  style={{ padding: "0px", color: "black" }}
                >
                  טלפון נייד לאימות ולדווח{" "}
                </label>
                <div className="col-lg-9">
                  {this.state.activistCreate.phone_number}
                  <span
                    id="helpBlock"
                    className={
                      "help-block" +
                      (this.validateRolePhoneNumber(
                        this.state.activistCreate.phone_number
                      )
                        ? " hidden"
                        : "")
                    }
                  >
                    המס' חייב להיות מסוג שמקבל הודעות sms{" "}
                  </span>
                </div>
                <div
                  className="col-lg-12"
                  style={{ overflow: "auto", maxHeight: "150px" }}
                >
                  {this.renderPhones()}
                </div>
              </div>
              <div className="form-group">
                <AddAllocationNewPhone
                  error = {this.state.errors.phone_number}
                  addNewPhone={this.addNewPhone.bind(this)}
                  rolePhoneNumber={this.state.activistCreate.phone_number}
                  validateRolePhoneNumber={this.validateRolePhoneNumber.bind(
                    this
                  )}
                  phones={this.state.voter.voter_phones}
                />
              </div>
            </form>
          </div>

          <div className="col-lg-6">
            <form className="form-horizontal">
              <div className="form-group">
                <label htmlFor="input-email" className="col-lg-3 control-label">
                  אימייל
                </label>
                <div className="col-lg-9">
                  <input
                    type="email"
                    id="input-email"
                    className={"form-control " + (this.state.errors.email?'has-error':'')}
                    value={
                      this.state.activistCreate.email
                        ? this.state.activistCreate.email
                        : ""
                    }
                    onChange={this.setDetailsActivist.bind(this, "email")}
                  />
                  {this.state.errors.email?<div className="title-has-error">{this.state.errors.email}</div>:''}
                </div>
              </div>

              <div className="form-group">
                <label
                  htmlFor="inputModalComment"
                  className="col-lg-3 control-label"
                >
                  הערה
                </label>
                <div className="col-lg-9">
                  <textarea
                    className="form-control"
                    rows="3"
                    id="inputModalComment"
                    value={this.state.activistCreate.comment}
                    onChange={this.setDetailsActivist.bind(this, "comment")}
                  />
                </div>
              </div>
              <div className="form-group">
                <label
                  htmlFor="inputModalSum"
                  className="col-lg-7 control-label"
                >
                  סכום לתפקיד
                </label>
                <label className="col-lg-5" dir="ltr">
                  <span style={{ fontWeight: "bold" }}>
                    {this.state.price} &#8362;
                  </span>
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  renderSmsMessageDetails() {
    return (
      <div className="container-details-group col">
        <div className="form-group con-group-radio">
          <input
            name="sms"
            value={1}
            onChange={this.setDetailsActivist.bind(this, "send_sms")}
            type="radio"
            id="input-send-sms-now"
            checked={this.state.activistCreate.send_sms == 1}
          />
          {"\u00A0"}
          <span htmlFor="input-send-sms-now">
            שלח מיידית את הודעת האימות לפעיל
          </span>
        </div>

        <div className="form-group flexed con-group-radio">
          <input
            value={0}
            name="sms"
            onChange={this.setDetailsActivist.bind(this, "send_sms")}
            type="radio"
            id="input-send-sms-day"
            checked={this.state.activistCreate.send_sms == 0}
          />
          {"\u00A0"}
          <span htmlFor="input-send-sms-day">
            שלח את הודעת האימות לפעיל השבוע ביום
          </span>
          {"\u00A0"}
          <Combo
            onChange={this.setDetailsActivist.bind(this, "day_sending_message")}
            disabled={this.state.activistCreate.send_sms == 0 ? false : true}
            items={getListDays()}
            id="ModalActivistInput"
            maxDisplayItems={5}
            itemIdProperty="id"
            itemDisplayProperty="name"
            className="form-combo-table"
          />
        </div>
      </div>
    );
  }

  setActivistPhoneNumber(phoneIndex) {
    let errors={...this.state.errors};
    errors.phone_number=false;
    let activistCreate = { ...this.state.activistCreate };
    activistCreate.phone_number =
      this.state.voter.voter_phones[phoneIndex].phone_number;
    this.setState({ activistCreate , errors});
  }

  validateRolePhoneNumber(phoneNumber) {
    return phoneNumber && phoneNumber.length > 0;
  }

  addNewPhone(phoneNumber) {
    let errors={...this.state.errors};
    errors.phone_number=false;
    let activistCreate = { ...this.state.activistCreate };
    let voter = { ...this.state.voter };
    let voterPhone = [...voter.voter_phones];
    voterPhone.push({ phone_number: phoneNumber });
    voter.voter_phones = voterPhone;
    activistCreate.phone_number = phoneNumber;
    this.setState({ activistCreate, voter ,errors});
  }

  deleteNewPhoneNumber(indexPhone) {
    let phone = this.state.voter.voter_phones[indexPhone];
    if (!phone.key) {
      let voter = { ...this.state.voter };
      this.state.voter.voter_phones.splice(indexPhone, 1);
      voter.voter_phones = [...this.state.voter.voter_phones];
      let activistCreate = { ...this.state.activistCreate };
      if (activistCreate.phone_number == phone.phone_number) {
        activistCreate.phone_number = "";
      }
      this.setState({ voter, activistCreate });
    }
  }

  smsSendChange(newSendSms) {
    let activistCreate = { ...this.state.activistCreate };
    activistCreate.send_sms = newSendSms;

    this.setState({ activistCreate });
  }

  /*event change combo city */
  onChangeAssignedCity = (e) => {
    let errors={...this.state.errors};
    errors.city_id=false;
    let activistCreate = { ...this.state.activistCreate };
    activistCreate.city_id = null;
    let selectedItem = e.target.selectedItem;
    let cleanCombo = { ...this.state.cleanCombo };
    cleanCombo.ballot = true;
    cleanCombo.shift = true;
    cleanCombo.cluster = true;
    cleanCombo.quarter = true;

    if (selectedItem) {
      activistCreate.city_id = selectedItem.id;
    }
    this.setState({ activistCreate, cleanCombo,errors }, () => {
      let cleanCombo = {};
      this.setState({ cleanCombo });
      this.loadClusterAllocation();
      this.loadBallotAllocation();
      this.loadQuarterAllocation();
      this.setPriceActivist();
    });
  };

  onChangeCluster = (e) => {
    let errors={...this.state.errors};
    errors.cluster_id=false;
    let selectedItem = e.target.selectedItem;
    let activistCreate = { ...this.state.activistCreate };
    let cleanCombo = { ...this.state.cleanCombo };
    cleanCombo.ballot = true;
    cleanCombo.shift = true;
    activistCreate.cluster_id = null;
    if (selectedItem) {
      activistCreate.cluster_id = selectedItem.id;
    }
    if (this.state.cityBallots) {
      let cityBallot = this.state.cityBallots.map((ballot) => {
        ballot.NotDisplay =
          selectedItem && ballot.cluster_id != selectedItem.id ? true : false;
        return { ...ballot };
      });
      this.setState({ cityBallot });
    }

    this.setState({ activistCreate, cleanCombo,errors }, () => {
      let cleanCombo = {};
      this.setState({ cleanCombo });
    });
  };

  onChangeQuarter = (e) => {
    let selectedItem = e.target.selectedItem;
    let activistCreate = { ...this.state.activistCreate };
    activistCreate.quarter_id = null;
    if (selectedItem) {
      activistCreate.quarter_id = selectedItem.id;
    }

    if (this.state.cityClusters) {
      let cityClusters = this.state.cityClusters.map((cluster) => {
        cluster.NotDisplay =
          selectedItem && cluster.quarter_id != selectedItem.id ? true : false;
        return { ...cluster };
      });
      this.setState({ cityClusters });
    }
  };

  onChangeBallotBox(e) {
    let errors={...this.state.errors};
    errors.ballot_id=false;
    let selectedItem = e.target.selectedItem;
    let activistCreate = { ...this.state.activistCreate };
    let cleanCombo = { ...this.state.cleanCombo };
    cleanCombo.shift = true;
    let electionRolesShifts = [...this.state.electionRolesShifts];

    activistCreate.ballot_id = null;
    if (selectedItem) {
      activistCreate.ballot_id = selectedItem.id;
      let availableShifts = getBallotsAvailableShifts(
        electionRolesShifts,
        selectedItem,
        this.state.selectedElectionRole.system_name
      );
      electionRolesShifts = electionRolesShifts.map((shift) => {
        if (availableShifts.find((available) => available.id == shift.id)) {
          shift.NotDisplay = false;
        } else shift.NotDisplay = true;

        return shift;
      });
    }

    this.setState({ activistCreate, cleanCombo, electionRolesShifts,errors }, () => {
      let cleanCombo = {};
      this.setState({ cleanCombo });
    });
  }

  onChangeShift(e) {
    let errors={...this.state.errors};
    errors.shift_system_name=false;
    let selectedElectionRoleShift = e.target.selectedItem;
      this.setState({ selectedElectionRoleShift,errors }, () => {
        this.setPriceActivist();
      });
  }

  isClusterActivist = () => {
    let selectedElectionRole = this.state.selectedElectionRole;
    if (
      selectedElectionRole &&
      ElectionRoleSystemName.getClusterRolesSystemName().indexOf(
        selectedElectionRole.system_name
      ) != -1
    ) {
      return true;
    }

    return false;
  };

  isBallotActivist = () => {
    let selectedElectionRole = this.state.selectedElectionRole;
    if (
      selectedElectionRole &&
      ElectionRoleSystemName.getBallotRolesSystemName().indexOf(
        selectedElectionRole.system_name
      ) != -1
    ) {
      return true;
    }

    return false;
  };

  isQuarterActivist = () => {
    let selectedElectionRole = this.state.selectedElectionRole;
    if (
      selectedElectionRole &&
      ElectionRoleSystemName.getQuarterRolesSystemName().indexOf(
        selectedElectionRole.system_name
      ) != -1
    ) {
      return true;
    }

    return false;
  };

  loadClusterAllocation = () => {
    debugger;
    if (
      this.state.activistCreate.city_id &&
      (this.isBallotActivist() || this.isClusterActivist())
    ) {
      AllocationAndAssignmentActions.loadCityClustersAvailableAllocations(
        this.props.dispatch,
        this.state.activistCreate.city_id,
        this.state.selectedElectionRole.id
      ).then((cityClusters) => {
        this.setState({ cityClusters });
      });
    }
  };

  loadBallotAllocation = () => {
    if (
      this.state.activistCreate.city_id &&
      (this.isBallotActivist() || this.isClusterActivist())
    ) {
      AllocationAndAssignmentActions.loadCityBallotsAvailableAllocations(
        this.props.dispatch,
        this.state.activistCreate.city_id,
        this.state.selectedElectionRole.id
      ).then((cityBallots) => {
        this.setState({ cityBallots });
      });
    }
  };

  loadQuarterAllocation = () => {
    debugger;
    if (
      this.state.activistCreate.city_id &&
      (this.isBallotActivist() ||
        this.isClusterActivist() ||
        this.isQuarterActivist())
    ) {
      AllocationAndAssignmentActions.loadCityQuarterAvailableAllocations(
        this.props.dispatch,
        this.state.activistCreate.city_id,
        this.state.selectedElectionRole.id
      ).then((cityQuarters) => {
        this.setState({ cityQuarters });
      });
    }
  };


/**
 * 
 * @param {string} electionRoleSystemName 
 * @returns {boolean}
 */
  isRoleSystemNameRequireEmail(electionRoleSystemName){
    let arrRoleRequireEmail = [
      ElectionRoleSystemName.QUARTER_DIRECTOR
    ]
    return arrRoleRequireEmail.indexOf(electionRoleSystemName) > -1 ? true : false
  }

  validation() {
    let errors = {};

    if(this.state.activistCreate.email!='') {
      if(!validateEmail(this.state.activistCreate.email))
      errors.email = true;
      else
      errors.email = false;

    }
    if (!this.state.voter.personal_identity) errors.personal_identity = true;
    else errors.personal_identity = false;

    if (!this.state.selectedElectionRole || !this.state.selectedElectionRole.id)
      errors.election_role_id = true;
    else errors.election_role_id = false;

    if (
      !this.state.activistCreate.phone_number ||
      this.state.activistCreate.phone_number == ""
    )
      errors.phone_number = true;
    else errors.phone_number = false;

    if (
      !this.state.activistCreate.city_id ||
      this.state.activistCreate.city_id == ""
    )
      errors.city_id = true;
    else errors.city_id = false;

    if (this.isBallotActivist() && (!this.state.selectedElectionRoleShift || !this.state.selectedElectionRoleShift.id))
      errors.shift_system_name = true;
    else errors.shift_system_name = false;

    if (this.isBallotActivist() && !this.state.activistCreate.ballot_id)
      errors.ballot_id = true;
    else errors.ballot_id = false;

    if (this.state.selectedElectionRole && this.state.selectedElectionRole.system_name==ElectionRoleSystemName.DRIVER){
        if((!this.state.activistCreate.car_type && this.state.activistCreate.car_type !=0) || this.state.activistCreate.car_type==='')
        errors.car_type = true;
        else errors.car_type = false;

        if(!this.state.activistCreate.car_seats || this.state.activistCreate.car_seats==='')
        errors.car_seats = true;
        else errors.car_seats = false;

        if(!this.state.activistCreate.car_number || this.state.activistCreate.car_number==='')
        errors.car_number = true;
        else errors.car_number = false;
    
    }

    if(this.state.selectedElectionRole && this.isRoleSystemNameRequireEmail(this.state.selectedElectionRole.system_name)){
      if(!this.state.activistCreate.email || this.state.activistCreate.email == ''){
        errors.email = '* סוג תפקיד זה חייה להכיל כתובת מייל'
      }
    }

    this.setState({ errors });
    return errors;
  }

  saveActivist = (openActivistPage=false) => {
   
    let error = this.validation();

    if (!Object.values(error).find(error=>error!=false)) {
      let activistCreate = { ...this.state.activistCreate };
      activistCreate.voter_key = this.state.voter.key;

      if (this.isBallotActivist())
      activistCreate.shift_system_name = this.state.selectedElectionRoleShift.system_name;
      activistCreate.election_role_id = this.state.selectedElectionRole.id;

        AllocationAndAssignmentActions.addActivistAssignment(
          this.props.dispatch,
          activistCreate
        ).then((res) => {
          if (res) {
            if(openActivistPage==true)
            {
              this.props.router.push('elections/activists/' + this.state.voter.key);
            }
            else
            this.props.successAddAssignment();
          }
          
        });
      }
  };

  button() {
    let buttonList=[];
    let buttonSave = {}; 
    buttonSave.class = "btn btn-primary";
    buttonSave.action = this.saveActivist;
    buttonSave.text = "שמור פעיל";

    let buttonCancel = {}; 
    buttonCancel.class = "btn-border-color";
    buttonCancel.action = this.props.hideModel;
    buttonCancel.text = "בטל";

    buttonList = [buttonCancel,buttonSave];
    if(this.props.successAddAssignmentAndOpenActivistPage)
    {
      let buttonSaveAndOpenActivist = {}; 
      buttonSaveAndOpenActivist.class = "btn btn-warning";
      buttonSaveAndOpenActivist.action = ()=>{this.saveActivist(true)};
      buttonSaveAndOpenActivist.text = "שמור והמשך לדף פעיל";
      buttonList.push(buttonSaveAndOpenActivist)
    }

  this.setState({buttons:buttonList})
  }

  render() {
    return (
      <div className="modal-lg">
        <ModalWindow
          buttonPosition="left"
          show={this.props.show}
          buttonX={() => {
            this.props.hideModel();
          }}
          title="הוספת פעיל"
          style={{ zIndex: "9001" }}
          buttons={this.state.buttons}
        >
          {this.state.loadingList?<div><i className="fa fa-spinner fa-spin"></i></div>:''}
          {this.renderSearchForVoter()}
          <div className={this.state.voter.personal_identity ? "" : "disabled"}>
            {this.renderGeographicDetails()}
            {this.renderBallotActivistDetails()}
            {this.renderActivistConcatDetails()}
            {this.renderSmsMessageDetails()}
            {this.renderDriverDetails()}
          </div>
        </ModalWindow>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.system.currentUser,
    userFilteredCities: state.system.currentUserGeographicalFilteredLists.cities
  };
}

export default connect(mapStateToProps)(withRouter(ModalAddAssignment));
