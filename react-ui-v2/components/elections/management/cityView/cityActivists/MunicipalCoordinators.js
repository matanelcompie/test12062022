import React from 'react';
import * as ElectionsActions from 'actions/ElectionsActions';
import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';
import ModalWindow from '../../../../global/ModalWindow';
import { connect } from 'react-redux';
import UpdateCityActivistsRolesModal from './modals/UpdateCityActivistsRolesModal';
import AddActivistAllocationsModal from './modals/AddActivistAllocationsModal';
import { addActivistAssignment } from '../../../../../actions/AllocationAndAssignmentActions';
import ModalAddAssignment from '../../../activist/ModalAddAllocation/ModalAddAssignment';
import { GeographicAllocationDto } from '../../../../../DTO/GeographicAllocationDto';
import ModalUpdateActivistAssignment from '../../../activist/ModalAddAllocation/ModalUpdateActivistAssignment';

class MunicipalCoordinators extends React.Component {


  constructor(props){
    super(props)
    this.state = {
      showModelDeleteAssignment: false,
      showModelDeleteAllocation: false,
      showModelAddAssignment: false,
      showModelAddAllocation:false,
      showModalUpdateAssignment:false,
      geographicAllocation:new GeographicAllocationDto(this.props.geographicEntityType,this.props.geographicEntityValue)
    };
  }
  deleteAssignment() {
    this.showModelDeleteAssignment(false);
    AllocationAndAssignmentActions.deleteActivistAllocationAssignment(
      this.props.dispatch,
      this.state.showModelDeleteAssignment.activists_allocations_assignment_id,
      true
    ).then((res) => {
      this.props.loadActivistAllocationArr();
    });
  }

  deleteAllocation() {
    this.showModelDeleteAllocation(false);
    AllocationAndAssignmentActions.deleteAllocationById(
      this.props.dispatch,
      this.state.showModelDeleteAllocation.activists_allocation_id
    ).then(()=>{
      this.props.loadActivistAllocationArr();
    })
   
    
   
  }

  showModelDeleteAssignment(flag) {
    this.setState({ showModelDeleteAssignment: flag });
  }
  showModelDeleteAllocation(flag) {
    this.setState({ showModelDeleteAllocation: flag });
  }

  showModelAddAssignment(flag) {
    this.setState({ showModelAddAssignment: flag });
  }

  showModalUpdateAssignment(assignment){
    debugger
    this.setState({showModalUpdateAssignment:assignment})
  }

  successUpdateOrInsert=()=>{
    this.props.loadActivistAllocationArr();
    this.setState({showModalUpdateAssignment:false,showModelAddAssignment:false});
  }

  renderAllocationWithoutAssignment(allocationActivist){
    return <tr key={allocationActivist.activists_allocation_id}>
    <th>{allocationActivist.role_name}</th>
    <td>
     <i className='opacity'>לא הוגדר</i>
    </td>
    <td>
     <i className='opacity'>לא הוגדר</i>
    </td>
    <td>
     <i className='opacity'>לא הוגדר</i>
    </td>
    <td colSpan="2" style={{ width: "120px" }}>
        <div>
          <button
            onClick={() => {
              this.showModelDeleteAllocation(allocationActivist);
            }}
            className={"btn btn-border-color left  "+(this.props.currentUser.permissions['elections.activists.add_allocations']?'':'disabled')}
          >
            <span
               style={{marginLeft: "5px" }}
              className="mg-2"
            >
              מחק הקצאה
            </span>
            <img
              className="image-responsive"
              src={window.Laravel.baseAppURL + "Images/delete-icon.png"}
            />
          </button>
          <button
            onClick={() => {
              this.showModelAddAssignment(allocationActivist);
            }}
            style={{ marginLeft: "10px" }}
            className="btn btn-primary btn-sm left"
          >
            <span>+</span>
            <span>שבץ</span>
          </button>
        </div>
    </td>
  </tr>
  }

  renderAllocationWithAssignment(allocationActivist){
   return <tr key={allocationActivist.activists_allocation_id}>
    <th>{allocationActivist.role_name}</th>
    <td>
      {allocationActivist.first_name} {allocationActivist.last_name}
    </td>
    <td>{allocationActivist.personal_identity}</td>
    <td>{allocationActivist.phone_number}</td>
    <td colSpan="2" style={{ width: "120px" ,textAlign:'end'}}>
        <button
          onClick={() => {
            this.showModelDeleteAssignment(allocationActivist);
          }}
          type="button"
          className="btn-link"
        >
          <img
            className="image-responsive"
            src={window.Laravel.baseAppURL + "Images/delete-icon.png"}
          />
        </button>
        <button
          onClick={() => {
            this.showModalUpdateAssignment(allocationActivist);
          }}
          type="button"
          className="btn-link"
        >
          <img
            className="image-responsive"
            src={window.Laravel.baseAppURL + "Images/edit-icon.png"}
          />
        </button>
     
    </td>
  </tr>
  }

  renderAllocationCityRole() {
    return this.props.municipalCoordinators.map((allocationActivist) => {
       let tr= allocationActivist.activists_allocations_assignment_id?
          this.renderAllocationWithAssignment(allocationActivist):
          this.renderAllocationWithoutAssignment(allocationActivist)
          return tr
    });
  }

  

  render() {
    return (
      <div style={{display:'flex',flexDirection:'column'}}>
        <table className="table table-in-tr table-multi-line table-striped">
          <thead>
            <tr>
              <th>סוג פעיל</th>
              <th>שם</th>
              <th>תז</th>
              <th>טלפון</th>
              <td></td>
            </tr>
          </thead>
          <tbody>{this.renderAllocationCityRole()}</tbody>
        </table>

        <div className='border-top-divider' style={{margin:'15px'}}>
          <button onClick={()=>{this.setState({showModelAddAllocation:true})}} className={'btn btn-default srchBtn pull-left '+(this.props.currentUser.permissions['elections.activists.add_allocations']?'':'disabled')} >הוספת הקצאה</button>
        </div>

        <ModalWindow
          show={this.state.showModelDeleteAssignment}
          buttonOk={() => {
            this.deleteAssignment();
          }}
          buttonCancel={() => {
            this.showModelDeleteAssignment(false);
          }}
          title="מחיקת שיבוץ לפעיל עירוני"
        >
          <div>{"האם ברצונך למחוק שיבוץ לפעיל עירוני שנבחר?"}</div>
        </ModalWindow>
        <ModalWindow
          show={this.state.showModelDeleteAllocation}
          buttonOk={() => {
            this.deleteAllocation();
          }}
          buttonCancel={() => {
            this.showModelDeleteAllocation(false);
          }}
          title="מחיקת הקצאת תפקיד"
        >
          <div>{"האם ברצונך למחוק הקצאה  תפקיד שנבחר?"}</div>
        </ModalWindow>

        {this.state.showModelAddAssignment?
         <ModalAddAssignment  
          show={this.state.showModelAddAssignment}
          successAddAssignment={()=>{this.successUpdateOrInsert()}}
          hideModel={()=>{this.setState({showModelAddAssignment:false})}}
          geographicAllocation={this.state.geographicAllocation}
          electionRoleSystemName={this.state.showModelAddAssignment.system_name}>
          </ModalAddAssignment>:''}
          {
          this.state.showModalUpdateAssignment?
          <ModalUpdateActivistAssignment
          successUpdate={()=>{this.successUpdateOrInsert()}}
          hideModel={()=>{this.setState({showModalUpdateAssignment:false})}} 
          activistAllocationAssignmentId={this.state.showModalUpdateAssignment.activists_allocations_assignment_id} 
          show={this.state.showModalUpdateAssignment}>
          </ModalUpdateActivistAssignment>:''
        }

        <AddActivistAllocationsModal
        geographicEntityType={this.state.geographicAllocation.geographicType} 
        geographicEntityId={this.state.geographicAllocation.geographicValue} 
        hideModel={()=>{
          this.setState({ showModelAddAllocation: false });
        }}
        loadActivistAllocation={()=>{this.props.loadActivistAllocationArr()}}
        show={this.state.showModelAddAllocation}> 
        
        </AddActivistAllocationsModal>
      </div>
    );
  }
}

function mapStateToProps(state) {
	return {
    currentUser: state.system.currentUser,
	}
}

export default connect(mapStateToProps)(MunicipalCoordinators);
