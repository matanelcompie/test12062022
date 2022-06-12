
import React from "react";

import ModalWindow from "../../../../../global/ModalWindow";
import constants from '../../../../../../libs/constants';
import {inArray, getDefaultSendActivistMessage} from '../../../../../../libs/globalFunctions';
import Combo from "../../../../../global/Combo";
import { withRouter } from 'react-router';

class ClusterActivistModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        selectedRole : {
            id: null,
            name: '',
        },
        currentClusterSummaryData : null
    }
  }
  componentDidUpdate(prevProps){
    //   console.log('currentEntitySummaryData', this.props.currentEntitySummaryData.parent_entities_activists_summary, this.props.currentClusterId)
      let clusterHadChanged = (this.props.currentClusterId && this.props.currentClusterId != prevProps.currentClusterId)
    if(clusterHadChanged){
        this.getClusterActivistsSummaryData(this.props.currentClusterId)
    }
  }
  // Get election role activists allocations summary data:
  getClusterActivistsSummaryData(currentClusterId){
    let clustersActivistsSummary = this.props.clustersActivistsSummary;

    let currentClusterSummaryData = clustersActivistsSummary.find((item) => {
        return item.entity_id == currentClusterId
    });
    let selectedRole = this.props.electionRoles.find((item) => {return item.system_name == this.props.activistSystemName});
    this.setState({currentClusterSummaryData, selectedRole})
    
  }

  // Select election role:
  onElectionRoleChange(e){
    let selectedItem = e.target.selectedItem
    if(selectedItem){
        this.setState({selectedRole: selectedItem})
    }
  }



    getElectionRoleDefaultBudget(){
        let budget = this.state.selectedRole.budget;
        let shiftBudget = this.props.electionRolesShiftsBudgets.find((item) => { return item.election_role_id == this.state.selectedRole.id})
        if(shiftBudget){
            budget = shiftBudget.budget;
        }
        return budget;
    }

    // Get cluster relevant election roles
    getElectionRolesOptions(){
        const activistsItems = [ 
            constants.electionRoleSytemNames.motivator,
            constants.electionRoleSytemNames.driver,
            constants.electionRoleSytemNames.ministerOfFifty,
            constants.electionRoleSytemNames.clusterLeader
        ];
        let relevantElectionRoles = this.props.electionRoles.filter((item) => {
            return inArray(activistsItems, item.system_name);
        })
        return relevantElectionRoles;
      }

    deleteActivistAllocationAssignment(activistItem) {
        this.props.deleteActivistAllocationAssignment(activistItem.activists_allocations_assignments_id);
    }
  // Render select election role for display
  renderSelectRole(availableRoleAllocations, currentRoleAllocated){
    let clusterHasAllocations = this.props.clusterAllocatedActivists.length > 0;
      return (
        <div className="container-details-group border-button">
            <div>
            
        <div className="col" className="form-group">
                        <label htmlFor="selectRole" className="control-label">תפקיד</label>
                        <div className="flexed flexed-center">
                            <Combo 
                                items={this.getElectionRolesOptions()} 
                                onChange={this.onElectionRoleChange.bind(this)}
                                inputStyle={{width:'260px'}}
                                value={this.state.selectedRole.name}
                                maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'
                            />

                        <div style={{ marginRight: '15px'}}>שובצו <span style={{fontWeight: 'bold', cursor: 'pointer'}}>{availableRoleAllocations} / {currentRoleAllocated}</span></div>
                    </div>
             
            </div>   
            <div>
            {(availableRoleAllocations > currentRoleAllocated) ? null: <label className="control-label">* לא קיימים אשכולות לשיבוץ</label>}
            </div>
            <div>
            {!clusterHasAllocations && <label className="control-label">* ללא פעילים משובצים</label>}
            </div>
            </div>

        </div>
      )
  }

    renderActivistsRows(){
        return this.props.clusterAllocatedActivists.map((item) => {
            if(item.system_name == this.state.selectedRole.system_name){
                return (
                    <tr key={item.key}>                                          
                        <td>{item.first_name} {item.last_name}</td>
                        <td>{item.personal_identity}</td>
                        <td>{item.phone_number}</td>
                        <td><button onClick={this.deleteActivistAllocationAssignment.bind(this, item)} className='btn-close no-border-and-bg-btn'></button></td>
                    </tr>
                )
            }
        })

    }
    renderActivistsTable(){
    return (
          
            <div className="table-responsive">
                <table className="table table-striped tableNoMarginB tableTight">
                    <thead>
                        <tr id='editClusterTableRow'>
                            <th>שם פעיל</th>
                            <th>תעודת זהות</th>
                            <th>נייד</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderActivistsRows()}
                    </tbody>
                </table>
        </div> 

     )
 }
 hideModal(){
    this.props.displayModal();
 }
  render() {
    let clusterHasAllocations = this.props.clusterAllocatedActivists.length > 0;
    let roleSystemName = this.state.selectedRole.system_name;
    let currentRoleAllocated = this.state.currentClusterSummaryData ? (parseInt(this.state.currentClusterSummaryData[`allocated_${roleSystemName}`] || 0)) : 0;
    let availableRoleAllocations = this.state.currentClusterSummaryData ? (parseInt(this.state.currentClusterSummaryData[roleSystemName] || 0)) : 0;
    return (
      <ModalWindow
        show={this.props.show}
        title={"פעילים לאשכול"}
        buttonX={this.hideModal.bind(this)}
        buttonOk={this.hideModal.bind(this)}
        buttonPosition="left"
        buttonOkText="סגור"
      >
          <div>
              {this.renderSelectRole(availableRoleAllocations, currentRoleAllocated)}
              {clusterHasAllocations && this.renderActivistsTable()}
          </div>
      </ModalWindow>
    );
  }
}

export default ClusterActivistModal;

