import React from "react";
import { connect } from "react-redux";
import ModalWindow from "../../../global/ModalWindow";
import * as AllocationAndAssignmentActions from "actions/AllocationAndAssignmentActions";
import ActivistAllocationCreateDto from "../../../../DTO/ActivistAllocationCreateDto";
import constants from "../../../../libs/constants";
import { ActivistUpdateDto } from "../../../../DTO/ActivistUpdateDto";
import { ElectionRoleSystemName } from "../../../../Enums/ElectionRolesSystemName";
import { TransportationCarDto } from "../../../../DTO/TransportationCarDto";

class ModalUpdateActivistAssignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      carTypes: [
        { id: constants.activists.driverCarTypes.regular, name: "רכב רגיל" },
        {
          id: constants.activists.driverCarTypes.crippled,
          name: "רכב הסעות מונגש",
        },
      ],
      errors: {},
      activistAllocationAssignment: null,
    };

    this.loadAssignmentDetails(this.props.activistAllocationAssignmentId );

  }

  componentWillReceiveProps(nextProps){
    if (!this.props.activistAllocationAssignmentId || this.props.activistAllocationAssignmentId!=nextProps.activistAllocationAssignmentId){
      loadAssignmentDetails(nextProps.activistAllocationAssignmentId);
    }
  }

  loadAssignmentDetails(activistAllocationAssignmentId) {
    AllocationAndAssignmentActions.getActivistAssignmentDetailsById(
      this.props.dispatch,
      activistAllocationAssignmentId
    ).then((activistAllocationAssignment) => {
      this.setState({ activistAllocationAssignment });
    });
  }

  setDetailsActivist = (fieldName, event) => {
    let value = event.target.value;
    if (event.target.selectedItem) value = event.target.selectedItem.id;

    let activistAllocationAssignment = {
      ...this.state.activistAllocationAssignment,
    };
    activistAllocationAssignment[fieldName] = value;
    this.setState({ activistAllocationAssignment });
  };

  renderVoterDetails() {
    return (
      <div className="container-details-group border-button">
        <div className="col" className="form-group">
          <label>סוג פעיל</label>
          <div className="flexed">
            <span className="span-name-voter">
              {this.state.activistAllocationAssignment.election_role_name}
            </span>
          </div>
        </div>

        <div className="col" className="form-group">
          <label> פעיל</label>
          <div className="flexed">
            <span className="span-name-voter">
              {this.state.activistAllocationAssignment.voter_full_name}-{" "}
              {this.state.activistAllocationAssignment.personal_identity}
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderGeographicDetails() {
    return (
      <div className="container-details-group">
        <div className="col" className="form-group">
          <label>עיר</label>
          <div>
            <span className="span-name-voter">
              {this.state.activistAllocationAssignment.city_name}
            </span>
          </div>
        </div>
        <div
          className="col"
          className={
            "form-group " +
            (!this.state.activistAllocationAssignment.cluster_name
              ? "hidden"
              : "")
          }
        >
          <label>אשכול</label>
          <div className="flexed">
            <span className="span-name-voter">
              {this.state.activistAllocationAssignment.cluster_name}
            </span>
          </div>
        </div>
        <div
          className="col"
          className={
            "form-group " +
            (!this.state.activistAllocationAssignment.quarter_name
              ? "hidden"
              : "")
          }
        >
          <label>רובע</label>
          <div>
            <span className="span-name-voter">
              {this.state.activistAllocationAssignment.quarter_name}
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderBallotActivistDetails() {
    return (
      this.state.activistAllocationAssignment.ballot_mi_id && (
        <div className="row">
          <div className="container-details-group">
            <div className="col" className="form-group">
              <label>קלפי</label>
              <div>
                <span className="span-name-voter">
                  {this.state.activistAllocationAssignment.ballot_mi_id}
                </span>
              </div>
            </div>

            <div className="col" className="form-group">
              <label>משמרת</label>
              <div>
                <span className="span-name-voter">
                  {
                    this.state.activistAllocationAssignment
                      .election_shift_role_name
                  }
                </span>
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
                className="form-control"
                onChange={this.setDetailsActivist.bind(this, "car_number")}
              ></input>
            </div>
            <div className="col" className="form-group">
              <label>מספר מושבים</label>
              <input
                type="number"
                className="form-control"
                onChange={this.setDetailsActivist.bind(this, "car_seats")}
              ></input>
            </div>
          </div>
        </div>
      )
    );
  }



  renderActivistConcatDetails() {
    return (
        <div className="container-details-group">
          <div className="col" className="form-group">
            <label>טלפון פעיל</label>
            <input
              className="form-control"
              value={this.state.activistAllocationAssignment.phone_number}
              onChange={this.setDetailsActivist.bind(this, "phone_number")}
            ></input>
          </div>
          <div className="col" className="form-group">
            <label>מייל</label>
            <input
              className="form-control"
              type="email"
              value={this.state.activistAllocationAssignment.email}
              onChange={this.setDetailsActivist.bind(this, "email")}
            ></input>
          </div>
          <div className="col" className="form-group">
            <label>הערה</label>
            <input
              className="form-control"
              value={this.state.activistAllocationAssignment.comment}
              onChange={this.setDetailsActivist.bind(this, "comment")}
            ></input>
          </div>
        </div>
    );
  }

  validateRolePhoneNumber(phoneNumber) {
    return phoneNumber && phoneNumber.length > 0;
  }

  validation() {}

  updateActivist(){
    let ActivistUpdate=new ActivistUpdateDto();
    let that=this;
    if(this.state.activistAllocationAssignment.activists_allocations_assignment_id){
      ActivistUpdate.electionRoleByVoterId=this.state.activistAllocationAssignment.election_role_voter_id
      ActivistUpdate.activistAllocationAssignmentId=this.state.activistAllocationAssignment.activists_allocations_assignment_id;
      ActivistUpdate.phoneNumber=this.state.activistAllocationAssignment.phone_number;
      ActivistUpdate.email=this.state.activistAllocationAssignment.email;
      ActivistUpdate.comment=this.state.activistAllocationAssignment.comment;

      if(this.state.election_role_system_name==ElectionRoleSystemName.DRIVER){
        let transportationCars=new TransportationCarDto();
        transportationCars.CarType=this.state.activistAllocationAssignment.car_type;
        transportationCars.CarNumber=this.state.activistAllocationAssignment.car_number;
        transportationCars.PassengerCount=this.state.activistAllocationAssignment.passenger_count;
        ActivistUpdate.transportationCars=transportationCars;
      }

      AllocationAndAssignmentActions.updateActivistDto(this.props.dispatch,ActivistUpdate).then((res)=>{
        if(res){
          that.props.successUpdate();
        }
        
      })
    }
    
  }


  render() {
    return (
      <div className="modal-lg">
        <ModalWindow
          show={this.props.show}
          buttonX={() => {
            this.props.hideModel();
          }}
          title="עדכון פעיל"
          style={{ zIndex: "9001" }}
          buttonOk={()=>{this.updateActivist()}}
        >
          {this.state.activistAllocationAssignment ? (
            <div>
              {this.renderVoterDetails()}
              <div>
                {this.renderGeographicDetails()}
                {this.renderBallotActivistDetails()}
                {this.renderActivistConcatDetails()}
                {/* {this.renderDriverDetails()} */}
              </div>
            </div>
          ) : (
            <div>טוען...</div>
          )}
        </ModalWindow>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.system.currentUser,
  };
}

export default connect(mapStateToProps)(ModalUpdateActivistAssignment);
