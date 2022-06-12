import React from "react";
import { connect } from "react-redux";
import GeographicEntityType from "../../../../../../Enums/GeographicEntityType";
import ModalWindow from "../../../../../global/ModalWindow";
import * as AllocationAndAssignmentActions from 'actions/AllocationAndAssignmentActions';
import ActivistAllocationCreateDto from "../../../../../../DTO/ActivistAllocationCreateDto";


 class AddActivistAllocationsModal extends React.Component {
   constructor(props) {
     super(props);
     let geographicEntityType = this.props.geographicEntityType;
     let geographicEntityId = this.props.geographicEntityId;
     let nameGeoType =
       GeographicEntityType.getTitleByGeographicEntityType(
         geographicEntityType
       );
     this.state = {
       geographicEntityType,
       geographicEntityId,
       title: "הוספת הקצאת פעיל ל" + nameGeoType,
       electionRoles: [],
       electionRoleSelect: null,
     };
   }

   componentDidMount() {
     AllocationAndAssignmentActions.getElectionRolesByGeoEntityTypeAllocation(
       this.props.dispatch,
       this.state.geographicEntityType
     ).then((electionRoles) => {
       this.setState({ electionRoles });
     });
   }

   componentWillReceiveProps(nextProps){
      if(this.state.geographicEntityId!=nextProps.geographicEntityId)
      this.setState({ 'geographicEntityId': nextProps.geographicEntityId});
   }

   eventSelectedRole(event) {
     let electionRoleSelect = event.currentTarget.value;
     this.setState({ electionRoleSelect });
   }

   saveNewActivistAllocation() {
    let activistAllocationCreate = new ActivistAllocationCreateDto()  
    activistAllocationCreate.GeographicEntityType=this.state.geographicEntityType;
    activistAllocationCreate.GeographicEntityValue=this.state.geographicEntityId;
    activistAllocationCreate.ElectionRoleId=this.state.electionRoleSelect;
    AllocationAndAssignmentActions.addAllocationNotBallotRole(this.props.dispatch,activistAllocationCreate).then(()=>{
      this.props.loadActivistAllocation();
      this.props.hideModel();
    })
    
   }

   render() {
     return (
       <ModalWindow
         show={this.props.show}
         title={this.state.title}
         buttonX={() => {
           this.props.hideModel();
         }}
         buttonOk={() => {
           this.saveNewActivistAllocation();
         }}
         disabledOkStatus={this.state.electionRoleSelect ? false : true}
       >
         <div className="form-group">
           <label>סוג תפקיד</label>
           <select
             onChange={this.eventSelectedRole.bind(this)}
             className="form-control"
           >
             {this.state.electionRoles.map((role) => {
               return (
                 <option key={role.id} value={role.id}>
                   {role.name}
                 </option>
               );
             })}
           </select>
         </div>
       </ModalWindow>
     );
   }
 }


function mapStateToProps(state) {
  return {
      
  };
}

export default connect(mapStateToProps)(AddActivistAllocationsModal);