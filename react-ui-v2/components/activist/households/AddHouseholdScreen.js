import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Combo from '../../global/Combo';
import ModalWindow from '../../global/ModalWindow';
 


import * as VoterActions from '../../../actions/VoterActions';
import * as CrmActions from '../../../actions/CrmActions';
import * as GlobalActions from '../../../actions/GlobalActions';
import * as SystemActions from '../../../actions/SystemActions';

class AddHouseholdScreen extends React.Component {
 
     componentWillMount(){
		this.thStyle = {textAlign:'center'}; 
	 }
 
    render() 
	{
		if(this.props.display){
            return <div>
			<div style={{borderBottom:'2px solid #ECECEC'}}>
			
			<div style={{marginTop:'25px' , marginRight:'30px'}}>
				        <div className='row'>
                             <div className='col-md-12'>
							      <span style={{fontSize:'22px',fontWeight:'600' , color:'#327DA4'}}>חיפוש</span>
							 </div>
                        </div>
                        <div className='row'>	
                             <div className='col-md-12'>
							     <div style={{paddingTop:'20px' , fontSize:'16px'}}>
								  טקסט של חיפוש בתי אב
								 </div>
							 </div>
                        </div>
						<div className='row' style={{paddingTop:'30px'}}>
						     <div className='col-md-4'>
							     <div className='row'>
								     <div className='col-md-5'>
									     אזור
									 </div>
									 <div className='col-md-6'>
									     <Combo items={this.props.cities}  maxDisplayItems={5}  itemIdProperty="city_id" itemDisplayProperty='city_name' /* value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )}*/ />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     רחוב
									 </div>
									 <div className='col-md-6'>
									     <input type="text" className="form-control form-control-sm" />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     שם משפחה
									 </div>
									 <div className='col-md-6'>
									     <input type="text" className="form-control form-control-sm" />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     תושב חדש
									 </div>
									 <div className='col-md-6'>
									     <Combo items={[{id:'1' , name:'כן'} , {id:'2' , name:'לא'} ]}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
										 <Link to='' style={{cursor:'pointer'}}>חיפוש מתקדם</Link>
									 </div>
								 </div>
							 </div>
							 <div className='col-md-4'>
							     <div className='row'>
								     <div className='col-md-5'>
									     עיר
									 </div>
									 <div className='col-md-6'>
									     <Combo items={this.props.cities}  maxDisplayItems={5}  itemIdProperty="city_id" itemDisplayProperty='city_name' /* value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )}*/ />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     אשכול
									 </div>
									 <div className='col-md-6'>
									     <Combo items={this.props.cities}  maxDisplayItems={5}  itemIdProperty="city_id" itemDisplayProperty='city_name' /* value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )}*/ />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     משויך לשר מאה
									 </div>
									 <div className='col-md-6'>
									     <Combo items={[{id:'1' , name:'כן'} , {id:'2' , name:'לא'} ]}  maxDisplayItems={5} itemIdProperty="id" itemDisplayProperty='name' />
									 </div>
								 </div>
								  
							 </div>
							 <div className='col-md-4'>
							     <div className='row'>
								     <div className='col-md-5'>
									     אזורים מסוימים
									 </div>
									 <div className='col-md-6'>
									     <Combo items={this.props.cities}  maxDisplayItems={5}  itemIdProperty="city_id" itemDisplayProperty='city_name' /* value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )}*/ />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     קלפי
									 </div>
									 <div className='col-md-6'>
									     <Combo items={this.props.cities}  maxDisplayItems={5}  itemIdProperty="city_id" itemDisplayProperty='city_name' /* value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )}*/ />
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-12'>
									     <br/>
									 </div>
								 </div>
								 <div className='row'>
								     <div className='col-md-5'>
									     שר מאה
									 </div>
									 <div className='col-md-6'>
									     <Combo items={this.props.cities}  maxDisplayItems={5}  itemIdProperty="city_id" itemDisplayProperty='city_name' /* value={this.props.searchActivistScreen.city} onChange={this.searchParamChange.bind(this , 'city' )}*/ />
									 </div>
								 </div>
								  <div className='row'>
								     <div className='col-md-8'>
									     <br/><br/><br/>
									 </div>
									 <div className='col-md-4'>
									     <br/><br/><br/>
										 <button type='submit' className="btn btn-primary btn-sm">חפש</button>
									 </div>
								 </div>
							 </div>
						</div>
                        <br/><br/>	
                        							
                   </div>
				</div>
				 
				<div style={{marginTop:'25px' , marginRight:'30px' , marginLeft:'20px'}}>
				            <div className='row'>
                                <div className='col-md-12'>
							      <span style={{fontSize:'22px',fontWeight:'600' , color:'#327DA4'}}>תוצאות חיפוש</span>
							    </div>
                            </div>
							<div className='row'>
							   <div className='col-md-12'>
							     <br/>
							   </div>
							</div>
							<div className='row'>
			                  <div className='col-md-10' style={{marginTop:'4px' , fontSize:'24px' , fontWeight:'600' , color:'#323A6B'}}>
			                    נמצאו
								110
								בתי אב
			                  </div>
			                  <div className='col-md-2'>
			                      
			                      <button type='submit' className="btn btn-default srchBtn">הוסף</button>
			                  </div>
			                </div>
							<div className='row'>
							   <div className='col-md-12'>
							     <br/>
							   </div>
							</div>
							<div className='row'  >
						     <div className='col-md-12' style={{paddingTop:'15px' }}>
							      <table cellSpacing='0' cellPadding='0' className={"table table-striped  table-scrollable"}  style={{marginBottom: 0 ,border:'1px solid #cccccc' }}>
								      <thead>
                                          <tr>
								              <th width='2%'><input type='checkbox' style={{marginRight:'-5px'}} /></th>
                                              <th style={this.thStyle}>מספר</th>
                                              <th style={this.thStyle}>שם משפחה</th>
                                              <th style={this.thStyle}>מספר תושבים</th>
                                              <th width='15%' style={this.thStyle}>כתובת בפועל</th>
											  <th style={this.thStyle}>אשכול</th>
											  <th style={this.thStyle}>קלפי</th>
											  <th width='15%' style={this.thStyle}>משויך לשר מאה</th>
											   <th style={this.thStyle}>שר מאה</th>
                                          </tr>
                                      </thead>
									  <tbody>
									      <tr>
								              <td width='2%'><input type='checkbox' style={{marginRight:'-5px'}} /></td>
                                              <td style={this.thStyle}>1</td>
                                              <td style={this.thStyle}>לוי</td>
                                              <td style={this.thStyle}>6</td>
                                              <td width='15%' style={this.thStyle}>נחל אשכול, בית-שמש</td>
											  <td style={this.thStyle}>אשכול 1</td>
											  <td style={this.thStyle}>1-0</td>
											  <td width='15%' style={this.thStyle}>לא</td>
                                              <td style={this.thStyle}>-</td>											  
                                          </tr>
									  </tbody>
								  </table>
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
				   cities: state.system.lists.cities,
				   searchActivistScreen: state.voters.searchActivistScreen ,
            };
        }

        export default connect(mapStateToProps)(withRouter(AddHouseholdScreen));
