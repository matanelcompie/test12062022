import React from "react";
import constants from "../../../../../../libs/constants";
import { connect } from 'react-redux';

import ModalWindow from "../../../../../global/ModalWindow";
import * as AllocationAndAssignmentActions from '../../../../../../actions/AllocationAndAssignmentActions';
import SearchActivistVoter from "../SearchActivistVoter";
import {ActivistCreateDto} from '../../../../../../DTO/ActivistCreateDto';
import { ActivistUpdateDto } from "../../../../../../DTO/ActivistUpdateDto";
class UpdateCityActivistsRolesModal extends React.Component {
  constructor(props) {
    super(props);

    let currentElectionRole = this.props.allElectionsRoles.find((item) => {
      return item.system_name == this.props.electionRoleSystemName;
    });
    this.state = {
      activistDetails: this.props.activistDetails,
      currentElectionRole: currentElectionRole,
    };
  }

  componentWillReceiveProps(nextProps) {
    
    if (!this.state.currentElectionRole || nextProps.electionRoleSystemName !== this.state.currentElectionRole.system_name) {
      this.setCurrentRole(nextProps.electionRoleSystemName);
    }

    if (this.state.activistDetails && nextProps.activistDetails !== this.state.activistDetails.system_name) {
      this.setState({activistDetails:nextProps.activistDetails})
    }

  }

  setCurrentRole(electionRoleSystemName) {
    let currentElectionRole = this.props.allElectionsRoles.find((item) => {
      return item.system_name == electionRoleSystemName;
    });
    this.setState({ currentElectionRole });
  }

  buildActivistCreateDto(phone_number, voterKey) {
    if (!phone_number) {
      return;
    }
    this.setState({ phone_number: phone_number });
    let createActivist = new ActivistCreateDto(
      voterKey,
      this.props.currentCity.key,
      this.state.currentElectionRole.key
    );
    createActivist.phone_number = phone_number;
    createActivist.send_sms = 1;

    if (this.props.quarterId) createActivist.quarter_id = this.props.quarterId;

    if (this.state.activistDetails && this.state.activistDetails.activists_allocation_id)
      createActivist.activists_allocation_id = this.state.activistDetails.activists_allocation_id;
        
    
    this.setState({...this.state,activistDetails:createActivist});    

    if(!this.props.editPermission)    
    this.addActivist(createActivist);
  }

  addActivist(createActivist) {
    let that = this;
    AllocationAndAssignmentActions.addActivistAssignment(
      this.props.dispatch,
      createActivist,
      createActivist.assigned_city_key,
      createActivist.voterKey
    ).then((res) => {
      if (res) {
        that.props.successUpdateOrInsert();
        that.closeModal();
      }
    });
  }

  closeModal(){
    this.setState({});
    this.props.hideModal();
  }
  renderPermissions() {
    return this.props.editPermission ? (
      <div
        style={{ marginTop: "10px" }}
        className={
          "row edit-manger-coordinator no-border" +
          (this.state.activistDetails ? "" : " opacity-event-none")
        }
      >
        <div className="col-sm-12">
          <h3>הרשאות</h3>
          <div className="cb-wrapper">
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">מינוי ראשי אשכולות</label>
            </div>
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">מינוי שרי מאה</label>
            </div>
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">מינוי נהגים </label>
            </div>
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">רכז הסעות</label>
            </div>
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">מינוי ממריצים</label>
            </div>
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">מינוי חברי וועדה</label>
            </div>
            <div className="cb-item">
              <input type="checkbox" />
              <label htmlFor="">מינוי משקיפים </label>
            </div>
          </div>
        </div>
      </div>
    ) : (
      ""
    );
  }

  onPhoneChange=(e)=> {
    debugger
  let activistDetails={...this.state.activistDetails};
  activistDetails.phone_number=e.target.value;
  this.setState({activistDetails})
  }

  updateActivist(){
    let ActivistUpdate=new ActivistUpdateDto();
    let that=this;
    if(this.state.activistDetails.activists_allocations_assignment_id){
      ActivistUpdate.electionRoleByVoterId=this.state.activistDetails.election_role_voter_id
      ActivistUpdate.activistAllocationAssignmentId=this.state.activistDetails.activists_allocations_assignment_id;
      ActivistUpdate.phoneNumber=this.state.activistDetails.phone_number;
      AllocationAndAssignmentActions.updateActivistDto(this.props.dispatch,ActivistUpdate).then((res)=>{
        if(res){
          that.props.successUpdateOrInsert();
          that.closeModal();
        }
        
      })
    }
    
  }

  saveActivistDetails(){
    if(this.props.isNewActivist){
      this.addActivist(this.state.activistDetails);
    }
    else{
      this.updateActivist();
    }
  }

  renderActivistDetails(){
    return (
      <div className="flexed-column" style={{ marginBottom: "10px" }}>
        <div className="flexed flexed-center">
          <div className="search-results show">
            <dl className="flexed flexed-center">
              <div className="dl-item flexed">
                <dt>שם פעיל</dt>
                <dd>
                  {this.state.activistDetails.first_name}{" "}
                  {this.state.activistDetails.last_name}
                </dd>
              </div>
              <div className="dl-item flexed">
                <dt style={{lineHeight:'34px'}}>נייד</dt>
                <dd>
                  <input
                    className="form-control"
                    onChange={(event)=>{this.onPhoneChange(event)}}
                    value={this.state.activistDetails.phone_number}
                  ></input>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
    }
  render() {
    let action=this.props.isNewActivist?"הוספת ":" עריכת ";
    let modalTitle = this.state.currentElectionRole
      ? action + this.state.currentElectionRole.name
      : "";
    return this.state.currentElectionRole ? (
      <ModalWindow
        show={this.props.show}
        title={modalTitle}
        buttonX={()=>{this.closeModal()}}
        disabledOkStatus={!this.state.activistDetails || !this.props.editPermission}
        buttonOk={()=>{this.saveActivistDetails()}}
      >
        {
          !this.props.isNewActivist?
          this.renderActivistDetails():
          <SearchActivistVoter
            electionRoleSystemName={this.state.currentElectionRole.system_name}
            currentCity={this.props.currentCity}
            onAddActivist={this.buildActivistCreateDto.bind(this)}
          />
          
        }
        {this.renderPermissions()}
      </ModalWindow>
    ) : (
      <div></div>
    );
  }
}
function mapStateToProps(state) {
	return {
    allElectionsRoles: state.elections.managementCityViewScreen.allElectionsRoles,
	}
}
export default connect(mapStateToProps)(UpdateCityActivistsRolesModal);
