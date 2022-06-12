import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
 


import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';

class CurrentHouseholds extends React.Component {
 
    componentWillMount(){
		 this.thStyle={textAlign:'center'};
	}
	 
	SetConfirmDelete(theValue , rowIndex){
		  this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_CONFIRM_DELETE , data:theValue , rowIndex});
	}
	
	deleteHouseholdCaptainFiftyRecord(){
		let household_id = (this.props.voterActivistHouseholdsScreen.detailedHouseholds[this.props.voterActivistHouseholdsScreen.deleteRowIndex]).household_id;
		VoterActions.deleteHouseholdCaptainFiftyRecord(this.props.dispatch , this.props.router.params.recordKey , household_id);
		this.SetConfirmDelete(false);
	}
 
    render() 
	{
		
		if(this.props.display){
			let self = this;
			let rowsItem = this.props.voterActivistHouseholdsScreen.detailedHouseholds.map(function(request , i){
				return <tr id={i} key={i}>
								              <td width='2%'><input type='checkbox' style={{marginRight:'-5px'}} /></td>
                                              <td style={self.thStyle}>{i+1}</td>
                                              <td style={self.thStyle}>{request.house_holder_details.length > 0 ? request.house_holder_details[0].last_name:'-'}</td>
                                              <td style={self.thStyle}>{request.house_holder_details.length > 0 ? request.house_holder_details.length:0}</td>
                                              <td style={self.thStyle}>{request.house_holder_details.length > 0 ? request.house_holder_details[0].city + ' , ' + request.house_holder_details[0].street :'-'}</td>
											  <td style={self.thStyle}>{request.ballot_box_id != null && request.ballot_mi_id != null ? request.ballot_box_id+' - '+request.ballot_mi_id : '-'}</td>
											  <td width='5%'>
											      <span onClick={self.SetConfirmDelete.bind(self , true , i)} className="glyphicon glyphicon-trash" style={{color:'#2AB4C0'}}></span>
											  </td>
                                          </tr>;
			}); 
            return <div style={{marginTop:'25px' , marginRight:'30px' , marginLeft:'30px'}}>
                        <div className='row'>	
                             <div className='col-md-12'>
							     <div style={{paddingTop:'20px'  , paddingBottom:'20px' , fontSize:'16px'}}>
								  טקסט דינאמי של בתי אב משויכים
								 </div>
							 </div>
                        </div>
						<div className='row'  >
			                  <div className='col-md-9' style={{marginTop:'4px' , fontSize:'24px' , fontWeight:'600' , color:'#323A6B'}}>
			                    מציג
								 {' '+ this.props.voterActivistHouseholdsScreen.households.length + ' '} 
								בתי אב משויכים
			                  </div>
			                  <div className='col-md-2'>
			                      <Combo items={[{id:'1' , name:'1'} , {id:'2' , name:'2'}, {id:'3' , name:'3'}, {id:'4' , name:'4'}]}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' value={'בחר פעולה'} />
			                  </div>
			                  <div className='col-md-1' >
			                      <button type='submit' className="btn btn-primary btn-sm">בחר</button>
			                  </div>
			            </div>
						<div className='row'  >
						     <div className='col-md-12' style={{paddingTop:'15px' }}>
							      <table cellSpacing='0' cellPadding='0' className={"table table-striped  table-scrollable"}  style={{marginBottom: 0 ,border:'1px solid #cccccc' }}>
								      <thead>
                                          <tr>
								              <th width='2%'><input type='checkbox' style={{marginRight:'-5px'}} /></th>
                                              <th style={this.thStyle}>מספר סידורי</th>
                                              <th style={this.thStyle}>שם משפחה</th>
                                              <th style={this.thStyle}>מספר תושבים</th>
                                              <th style={this.thStyle}>כתובת בפועל</th>
											  <th style={this.thStyle}>קלפי</th>
											  <th width='5%'></th>
                                          </tr>
                                      </thead>
									  <tbody>
									  {rowsItem}
									  </tbody>
								  </table>
							 </div>
						</div>
                        <br/><br/>	
                        <ModalWindow show={this.props.voterActivistHouseholdsScreen.showConfirmDelete}
                            buttonOk={this.deleteHouseholdCaptainFiftyRecord.bind(this)}     buttonCancel={this.SetConfirmDelete.bind(this , false , -1)} buttonX={this.SetConfirmDelete.bind(this , false , -1)}
                                 title='מחיקה'>
                             <div>האם את/ה בטוח/ה?</div>
                       </ModalWindow>						
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

        export default connect(mapStateToProps)(withRouter(CurrentHouseholds));
