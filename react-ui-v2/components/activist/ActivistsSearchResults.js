import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import Combo from '../global/Combo';
import ModalWindow from '../global/ModalWindow';
import AddNewActivistRoleScreen from './AddNewActivistRoleScreen';


import * as VoterActions from '../../actions/VoterActions';
import * as CrmActions from '../../actions/CrmActions';
import * as GlobalActions from '../../actions/GlobalActions';
import * as SystemActions from '../../actions/SystemActions';

class ActivistsSearchResults extends React.Component {

 
    assemblySearchVoterResultTHEAD() 
    {

                    return this.searchVoterResultTHEAD =
                            <thead >
                                <tr>
								    <th width='2%'><input type='checkbox' style={{marginRight:'-5px'}} /></th>
                                    <th width='9%' style={this.thStyle}>ת"ז</th>
                                    <th width='9%' style={this.thStyle}>שם משפחה</th>
                                    <th width='7%' style={this.thStyle}>שם פרטי</th>
                                    <th width='10%' style={this.thStyle}>מס' טלפון</th>
                                    <th width='10%' style={this.thStyle} >עיר</th>
                                    <th width='8%' style={this.thStyle}>רחוב</th>
									<th width='10%' style={this.thStyle}>סוג פעיל</th>
									<th width='15%'  style={this.thStyle}>מס' פריטים מוקצה</th>
									<th width='5%' style={this.thStyle}>סטטוס</th>
									<th width='15%'></th>
                                </tr>
                            </thead>;
            
    }
	
	addNewVoterActivistRole(voterKey , rowIndex){
		this.props.dispatch({type: VoterActions.ActionTypes.ACTIVIST.SET_ADDING_NEW_VOTER_ACTIVIST_ROLE , showModal:true  , voterKey , rowIndex });
		
	}
	
	
	editExistingVoterActivistRole(voterRecord , roleRecord){
		if(roleRecord.system_name == 'minister_of_fifty'){
			 
			this.props.router.push('elections/activists/' + roleRecord.rec_key  + '/households');
		}
	}
	
	assemblySearchVoterResultTBODY() {
		let self = this;
		this.searchVoterResultTBODY = null;
		if(this.props.searchActivistScreen.results_obj.data != undefined){
		this.scrollTRlist = this.props.searchActivistScreen.results_obj.data.map(function (record, i) {
		   if(record.election_roles_by_voter != undefined && record.election_roles_by_voter.length > 0){
		   
		   let allRows = record.election_roles_by_voter.map(function (role, j) {		  
			  return <tr id={j} key={j}>
			                <td width='2%'><input type='checkbox' style={{marginRight:'-9px' , position:'relative' , left:'-4px'}} /></td>
							<td width='9%' style={self.thStyle}><Link to={'elections/voters/'+record.key}>{record.personal_identity}</Link></td>
			                <td width='9%' style={self.thStyle}>{record.last_name}</td>
                            <td width='7%' style={self.thStyle}>{record.first_name}</td>
                            <td width='10%' style={self.thStyle}>{role.phone_number}</td>
                            <td width='10%' style={self.thStyle} >{record.city}</td>
                            <td width='8%' style={self.thStyle}>{record.street}</td>
							<td width='10%' style={self.tdStyleBlue}>{role.name}</td>
							<td   width='15%'  style={{textAlign:'center'}}>{role.system_name == 'minister_of_fifty' ? role.total_count_minister_of_fifty_count : (role.system_name == 'cluster_leader' ? role.total_count_cluster_leaders_count : (role.system_name == 'driver' ? 0 : 0))}</td>
							<td width='5%' style={{textAlign:'center'}}><img src='../Images/ico-status-done.svg' /></td>
							<td  width='15%'>
							           <span className={"glyphicon glyphicon-"+(role.system_name == 'minister_of_fifty' ? 'pencil' : '')} style={{paddingLeft: '3px',color: '#2AB4C0',cursor: 'pointer',fontSize: '16px'  }} onClick={(role.system_name == 'minister_of_fifty' ? self.editExistingVoterActivistRole.bind(self , record , role) : '')} >
                                          <span style={{color:'#466d87' , fontFamily:'assistant',paddingRight:'5px'}}>
									        {role.system_name == 'minister_of_fifty' ? 'עריכת פעיל' : ''}
									      </span>
									   </span>
							</td>
					  </tr>;
					  
		   });
		   return <tr id={i} key={i} style={{ padding:'0' , margin:'0' }}><td colSpan='11' width='100%' style={{padding:'0' , margin:'0'}} ><table className={"table   table-striped  table-hover"} style={{paddingBottom:'0px' , marginBottom:'0px' , borderBottom:'0'}}   width='100%' cellSpacing='0' cellPadding='0' >
				 <tbody>{allRows}</tbody>
			  </table></td></tr>;
		   }
		   else{
			  return <tr id={i} key={i}>
                                     <td width='2%'><input type='checkbox' style={{marginRight:'-5px'}} /></td>
                                    <td width='9%' style={self.thStyle}><Link to={'elections/voters/'+record.key}>{record.personal_identity}</Link></td>
                                    <td width='9%' style={self.thStyle}>{record.last_name}</td>
                                    <td width='7%' style={self.thStyle}>{record.first_name}</td>
                                    <td width='10%' style={self.thStyle}>{record.phone_number}</td>
                                    <td width='10%' style={self.thStyle} >{record.city}</td>
                                    <td width='8%' style={self.thStyle}>{record.street}</td>
									<td width='10%' style={self.tdStyleBlue}>ללא שיבוץ</td>
									<td width='15%'  style={{textAlign:'center'}}>0</td>
									<td width='5%' style={{textAlign:'center'}}><img src='../Images/ico-status-pending.svg' /></td>
									<td width='15%' ><span className="glyphicon glyphicon-plus" style={{paddingLeft: '3px',color: '#2AB4C0',cursor: 'pointer',fontSize: '16px'  }} onClick={self.addNewVoterActivistRole.bind(self , record.key , i)} >
                                       <span style={{color:'#466d87' , fontFamily:'assistant',paddingRight:'5px'}}>
									   הוסף הקצאה
									   </span>
									   </span></td>
                                </tr>; 
			   
		   }
		});
		this.searchVoterResultTBODY =
                                <tbody style={{height: '450px'}}>{this.scrollTRlist}</tbody>;
		}
    }



    render() {
		 
		this.thStyle={textAlign:'right'};
		this.tdStyleBlue={textAlign:'right' , color:'#498bb6'};
		
	    this.assemblySearchVoterResultTHEAD();
        this.assemblySearchVoterResultTBODY();
	 
        return <div style={{marginRight:'30px' , paddingTop:'37px' }}>
		                   <div  style={{paddingLeft:'20px' , minHeight:'525px'}}>
                                <div id="scrollContainer" className="table-responsive">
                                    <table cellSpacing='0' cellPadding='0' className={"table table-striped  table-scrollable"}  style={{marginBottom: 0, height: '450px' ,border:'1px solid #cccccc'}}>
                                        {this.searchVoterResultTHEAD}
									    {this.searchVoterResultTBODY}
                                    </table>
                                </div>
                            </div>
							<AddNewActivistRoleScreen />
							
        </div>;
            }
        }

        function mapStateToProps(state) {
            return {
				   searchActivistScreen: state.voters.searchActivistScreen ,
            };
        }

        export default connect(mapStateToProps)(withRouter(ActivistsSearchResults));
