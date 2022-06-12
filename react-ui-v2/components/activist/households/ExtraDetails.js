import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
import {validatePhoneNumber} from '../../../libs/globalFunctions';
 


import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';

class ExtraDetails extends React.Component {
 
    changeFieldValue(fieldName , e){
		 
	     this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.CHANGE_RECORD_BASIC_DATA , fieldName , fieldValue:e.target.value});
	}
	
	saveChanges()
	{
 
		if(!validatePhoneNumber(this.props.voterActivistHouseholdsScreen.phone_number) || isNaN(this.props.voterActivistHouseholdsScreen.sum) || this.props.voterActivistHouseholdsScreen.sum == undefined || this.props.voterActivistHouseholdsScreen.sum.trim() == ''  || parseInt(this.props.voterActivistHouseholdsScreen.sum) < 0){
			  this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_SEARCH_VOTER_ACTIVIST_ERROR_MESSAGE , errorTitle:'שגיאה' , errorContent:'יש למלא סכום וטלפון תקינים'});
			
		}
		else{
			 VoterActions.EditVoterActivistRoleData(this.props.dispatch , this.props.router.params.recordKey , this.props.voterActivistHouseholdsScreen.phone_number , this.props.voterActivistHouseholdsScreen.sum , this.props.voterActivistHouseholdsScreen.comment);
		}
	}
 
    render() 
	{

		if(this.props.display){
			let createdAtArray =this.props.voterActivistHouseholdsScreen.created_at.split(' '); 
            let createdAtArrayDate = createdAtArray[0].split('-');
			createdAtArrayDate = createdAtArrayDate[2] + '/'+createdAtArrayDate[1]+'/'+createdAtArrayDate[0];
			let createdAtArrayTime = createdAtArray[1].substr(0 , 5);
			return <div style={{marginTop:'25px' , marginRight:'30px'}}>
				        <div className='row'>
                             <div className='col-md-4'>
							       <div className='row'>
								       <div className='col-md-2'>
									       <span style={{fontWeight:'bold' , fontSize:'16px'}}>טלפון נייד</span>
									   </div>
									   <div className='col-md-9' style={{marginTop:'7px'}} >
									       <input type="text" className="form-control form-control-sm" value={this.props.voterActivistHouseholdsScreen.phone_number} style={{borderColor:(validatePhoneNumber(this.props.voterActivistHouseholdsScreen.phone_number) ? '#ccc' : '#ff0000')}} onChange={this.changeFieldValue.bind(this , 'phone_number')}  />
									   </div>
									   <div className='col-md-1'>
									   
									   </div>
								   </div>
								   <div className='row'>
								       <div className='col-md-2'>
									       
									   </div>
									   <div className='col-md-9' >
									       <span style={{color:'#737373' , fontSize:'16px'}}>
										       המס' חייב להיות מסוג שמקבל הודעות sms
										   </span>
									   </div>
									   <div className='col-md-1'>
									   
									   </div>
								   </div>
								   <div className='row' style={{paddingTop:'16px'}}>
								       <div className='col-md-2'>
									       <span style={{fontWeight:'bold' , fontSize:'16px'}}>סכום</span>
									   </div>
									   <div className='col-md-9' >
									       <input type="text" className="form-control form-control-sm" value={this.props.voterActivistHouseholdsScreen.sum} style={{borderColor:((parseInt(this.props.voterActivistHouseholdsScreen.sum) > 0 && !isNaN(this.props.voterActivistHouseholdsScreen.sum) )?'#ccc':'#ff0000')}}  onChange={this.changeFieldValue.bind(this , 'sum')}  />
									   </div>
									   <div className='col-md-1'>
									   
									   </div>
								   </div>
								   <div className='row' style={{paddingTop:'10px'}}>
								       <div className='col-md-2'>
									       <span style={{fontWeight:'bold' , fontSize:'16px'}}>הערה</span>
									   </div>
									   <div className='col-md-9' >
									       <textarea className="form-control form-control-sm" value={this.props.voterActivistHouseholdsScreen.comment == null ?'':this.props.voterActivistHouseholdsScreen.comment} onChange={this.changeFieldValue.bind(this , 'comment')}  ></textarea>
									   </div>
									   <div className='col-md-1'>
									   
									   </div>
								   </div>
							 </div>
							 <div className='col-md-8' style={{borderRight:'2px solid #C4D0D0' , height:'190px'}}>
							       <div className='row'>
								      <div className='col-md-1'>
									  
									  </div>
									  <div className='col-md-11'>
									      <strong>עובד מגדיר</strong> 
										  <br/>
										  {this.props.voterActivistHouseholdsScreen.creating_user}
										  <br/>
										  <strong>תאריך הגדרה</strong>
										  <br/>
										  <div className='row'>
										      <div className='col-md-1'>
											  {createdAtArrayDate}
									          </div>
											  <div className='col-md-1' >
									                  
									          </div>
											  <div className='col-md-1' style={{borderRight:'2px solid #DCDCDC'}}>
												  {createdAtArrayTime}
									          </div>
										  </div>
										  <br/><br/>
										   <button type='submit' className="btn btn-primary btn-sm" onClick={this.saveChanges.bind(this)}>שמור שינויים</button>
									  </div>
								   </div>
							 </div>
                        </div>
                         
                        <br/><br/>						
                   </div>;
		}
		else{
			return <div>
							
                   </div>;
		}
    }
 }

        function mapStateToProps(state) {
            return {
				   searchActivistScreen: state.voters.searchActivistScreen ,
				   voterActivistHouseholdsScreen: state.voters.voterActivistHouseholdsScreen ,
            };
        }

        export default connect(mapStateToProps)(withRouter(ExtraDetails));
