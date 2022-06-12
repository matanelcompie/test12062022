import React from 'react';
import { connect } from 'react-redux';
import {Link, withRouter } from 'react-router';

import * as SystemActions from '../../../actions/SystemActions';
import * as CrmActions from '../../../actions/CrmActions';
import Combo from '../../global/Combo';

class TeamMembers extends React.Component {

	constructor(props) {
		super(props);
		this.styleIgniter();
	}

	componentWillMount() {
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.TABLE_CONTENT_HAS_UPDATED, hasScrollbar:false});
	}

	styleIgniter() {
        this.tableListStyle = { height:'322px'};
    }
	
	formatDateOnlyString(strr){
		 if(strr == null){return ''}
		 else{
		 if(strr != null && strr.length == 10){
			 let strArray = strr.split('-');
			 if(strArray.length == 3){
				 return strArray[2] + '/' + strArray[1] + '/' + strArray[0];
			 }
			 else{
				 return strr;
			 }
		 }
		 else{
			 return strr;
		 }
		 }
	 }
	 
	 addNewTeamMember(){
		 this.props.dispatch({type:SystemActions.ActionTypes.USERS.CLEAR_USERS_FORM});
		this.props.router.push('/system/users'); 
		 
	 }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    getScrollHeaderStyle() {
        return this.props.tableHasScrollbar ? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }

    componentDidUpdate() {
    	if (!this.props.display) return;
        let hasScrollbar = false;

        if (undefined != this.self && null != this.self) {
            hasScrollbar = this.self.scrollHeight > this.self.clientHeight ? true : false;
        }

        if (hasScrollbar != this.props.tableHasScrollbar) {
            this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.TABLE_CONTENT_HAS_UPDATED, hasScrollbar});
        }
    }

	
    render() {
		if(this.props.display){
			this.rows = '';
			if(this.props.teamMembers != undefined){
			let self = this;
			this.rows=this.props.teamMembers
                .map(function(item , i){
                    return <tr id={i} key={i}>
					   <td><Link to={"/system/users/" + item.user_key}>{item.personal_identity}</Link></td>
					   <td>{item.first_name + ' ' + item.last_name}</td>
					   <td>{item.role_name}</td>
					   <td>
					 
					      <input type='checkbox' checked={item.user_id == self.props.editTeamLeaderID} disabled={true} />
					   </td>
					   <td>
					       <input type='checkbox' checked={item.main == 1} disabled={true} />
					   </td>
					   <td>{item.dep_name}</td>
					   <td>{self.formatDateOnlyString(item.from_date)}</td>
					   <td>{self.formatDateOnlyString(item.to_date)}</td>
					</tr>;
            });
			}
			 return  <div>
			 <div style={{ paddingBottom:'20px',paddingTop:'20px'  , paddingRight:'20px'}}>
				     <button type="button" className="btn btn-primary btn-md"  onClick={this.addNewTeamMember.bind(this)}  >
					      <span>+ הוספת חבר צוות</span>
					 </button>
			  </div>
			  
			    <table className="table table-bordered table-striped table-hover lists-table" >
				    <thead>
					   <tr>
					       <th>ת.ז.</th>
						   <th>שם מלא</th>
						   <th>תפקיד משתמש</th>
						   <th>ראש צוות</th>
						   <th>תפקיד עיקרי</th>
						   <th>מחלקה</th>
						   <th>מתאריך</th>
						   <th style={{ borderLeft:'none' }}>עד תאריך</th>
						   <th style={this.getScrollHeaderStyle()}></th>
					   </tr>
					</thead>
					<tbody style={this.tableListStyle} ref={this.getRef.bind(this)}>
					{this.rows}
					</tbody>
				</table>
				
			 </div>;
		}
		else{
	       return  <div></div>;
		}
    }
}
;

function mapStateToProps(state) {
    return {
		teamMembers : state.system.teamsScreen.teamMembers ,  
		editTeamLeaderID : state.system.teamsScreen.editTeamLeaderID ,
		tableHasScrollbar: state.system.teamsScreen.tableHasScrollbar,
		scrollbarWidth : state.system.scrollbarWidth,
    };
}

export default connect(mapStateToProps)(withRouter(TeamMembers));
