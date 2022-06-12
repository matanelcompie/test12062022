import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Combo from '../global/Combo';
import ModalWindow from '../global/ModalWindow';
import {validatePhoneNumber} from '../../libs/globalFunctions';
 


import * as VoterActions from '../../actions/VoterActions';
import * as CrmActions from '../../actions/CrmActions';
import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';

class AddNewActivistRoleScreen extends React.Component {


    getVoterRoleDataByName(name){
		let returnedValue = null;
		for(let i=0,len=this.props.electionRoles.length;i<len;i++){
			if(this.props.electionRoles[i].name == name){
				returnedValue = this.props.electionRoles[i];
				break;
			}
		}
		return returnedValue;
	}

    hide(){
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:'voter_key' , fieldValue:'' });
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:'role_row_index' , fieldValue:-1 });
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:'new_role_name' , fieldValue:'' });
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:'new_phone_number' , fieldValue:''  });
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:'new_sum' , fieldValue:''  });
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:'new_comment' , fieldValue:''  });
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_ADDING_NEW_VOTER_ACTIVIST_ROLE , showModal:false  });	
	}
	
	addNewRecord(){
		let currentSelectedRole = this.getVoterRoleDataByName(this.props.searchActivistScreen.addNewActivistRoleScreen.new_role_name);
        
		if(currentSelectedRole == null || !validatePhoneNumber(this.props.searchActivistScreen.addNewActivistRoleScreen.new_phone_number) || this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum == undefined || this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum.trim() == '' || isNaN(parseInt(this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum)) || parseInt(this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum) < 0){
			 this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_BOTTOM_TOTAL_ERROR , data:true  });
		}
		else{
			this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_BOTTOM_TOTAL_ERROR , data:false  });
			VoterActions.AddNewVoterActivistRole(this.props.dispatch , this.props.searchActivistScreen.addNewActivistRoleScreen.role_row_index , this.props.searchActivistScreen.addNewActivistRoleScreen.voter_key , currentSelectedRole ,  this.props.searchActivistScreen.addNewActivistRoleScreen.new_phone_number , this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum , this.props.searchActivistScreen.addNewActivistRoleScreen.new_comment);
		}
	}
	
	newAddParamChange(paramName , e){
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SEARCH_ACTIVIST_ADD_NEW_ROLE_FIELD_CHANGE , fieldName:paramName , fieldValue:e.target.value  });
	}
   
    render() {
        let currentSelectedRole = this.getVoterRoleDataByName(this.props.searchActivistScreen.addNewActivistRoleScreen.new_role_name);
        
		let errorItem = '';
		
		if(this.props.searchActivistScreen.showBottomError){
			errorItem = <div className="row">
									   <div className='col-md-12'>
										      <br/>
									          <span style={{color:'#ff0000' , fontSize:'14px' , fontWeight:'bold'}}>* יש למלות את כל שדות החובה בצורה תקינה</span>
										</div>   
									 </div>;
		}
 
		return <ModalWindow  show={this.props.searchActivistScreen.showAddNewVoterActivistRole}  title={'סוג פעיל'} buttonOk={this.addNewRecord.bind(this)} buttonX={this.hide.bind(this)} buttonCancel={this.hide.bind(this)}>
							     <div style={{width:'500px'}}>
								 <br/>
								     <div className='row'>
									    <div className='col-md-3'>בחר סוג פעיל</div>
										<div className='col-md-6'>
										    <Combo items={this.props.electionRoles} inputStyle={{borderColor:(currentSelectedRole == null ? '#ff0000' : '#ccc')}}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name'  value={this.props.searchActivistScreen.addNewActivistRoleScreen.new_role_name} onChange={this.newAddParamChange.bind(this , 'new_role_name' )} />
										</div>
									 </div>
									 <div className='row'>
									    <div className='col-md-12'>
										    <br/>
										    <hr />
										 
										    <span style={{fontSize:'20px' , color:'#14575C' , fontWeight:'bold'}}>פרטי תקציב</span>
										    <br/><br/>
										</div>
									 </div>
									 <div className='row'>
									       <div className='col-md-3'>טלפון נייד</div>
										   <div className='col-md-6'>
										      <input type="text" className="form-control form-control-sm" style={{borderColor:(validatePhoneNumber(this.props.searchActivistScreen.addNewActivistRoleScreen.new_phone_number) ? '#ccc' : '#ff0000')}} value={this.props.searchActivistScreen.addNewActivistRoleScreen.new_phone_number} onChange={this.newAddParamChange.bind(this , 'new_phone_number' )} />
											  <div style={{fontSize:'15px' , color:'#666666'}}>
											     המס' חייב להיות מסוג שמקבל הודעות
												  sms
											  </div>
											   
										   </div>
										   <div className='col-md-3'>
											     <Link to="" style={{cursor:'pointer' , fontSize:'15px'}}>
												    השתמש במספר המוגדר במערכת
												 </Link>
										   </div>
									 </div>
									 <div className='row'>
									       <div className='col-md-3'>
										      <br/>
											  סכום
										   </div>
										   <div className='col-md-6'>
										      <br/><input type="text" className="form-control form-control-sm" style={{borderColor:((parseInt(this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum) >= 0)?'#ccc':'#ff0000')}} value={this.props.searchActivistScreen.addNewActivistRoleScreen.new_sum} onChange={this.newAddParamChange.bind(this , 'new_sum' )} />
										   </div>
									 </div>
									 <div className='row'>
									       <div className='col-md-3'>
										      <br/>
											  הערה
										   </div>
										   <div className='col-md-6'>
										     <br/><textarea className="form-control form-control-sm" value={this.props.searchActivistScreen.addNewActivistRoleScreen.new_comment} onChange={this.newAddParamChange.bind(this , 'new_comment' )} ></textarea>
										   </div>
									 </div>
									 {errorItem}
									 <div className='row'> 
									       <div className='col-md-12' style={{height:'30px'}}>
										      <br/>
											</div>
									 </div>
									  
								 </div>
							</ModalWindow>;
            }
        }

        function mapStateToProps(state) {
            return {
                   electionRoles : state.voters.activistScreen.election_roles,
				   searchActivistScreen: state.voters.searchActivistScreen ,
				   
            };
        }

        export default connect(mapStateToProps)(withRouter(AddNewActivistRoleScreen));
