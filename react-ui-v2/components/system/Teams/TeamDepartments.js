import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import * as SystemActions from '../../../actions/SystemActions';
import Combo from '../../global/Combo';

class TeamDepartments extends React.Component {

	componentWillMount() {
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.TABLE_CONTENT_HAS_UPDATED, hasScrollbar:false});
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

	
	setAddingNewDepartment(){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SET_ADDING_DEPARTMENT , 
		data:true
        });
	}
	
	closeAddingNewDepartment(){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SET_ADDING_DEPARTMENT , 
		data:false
        });
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'system.teams.departments'});
	}
	
	newDepNameChange(e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.departments'});
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.NEW_DEP_NAME_CHANGE , 
		data:e.target.value
        });
	}
	
	addNewTeamDepartment(){
		if(this.props.teamsScreen.newDepartmentName.length > 3){
			SystemActions.addNewTeamDepartment(this.props.dispatch , this.props.router.params.teamKey , this.props.teamsScreen.newDepartmentName);
		}
	}
	
	showConfirmDelete(deleteIndex){
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SHOW_CONFIRM_DELETE_DEPARTMENT , 
		data:deleteIndex
        });
	}
	
	editRow(editIndex){
		this.oldValue = this.props.teamsScreen.teamDepartments[editIndex].name;
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.SET_DEPARTMENT_ROW_EDITING , 
		data:editIndex
        });
	}
	
	closeEditRowFormat(editIndex){
		this.props.dispatch ({type : SystemActions.ActionTypes.CLEAR_DIRTY , target:'system.teams.departments'});
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.UNSET_DEPARTMENT_ROW_EDITING , 
		data:editIndex , oldValue:this.oldValue
        });
	}
	
	changeDepName(editIndex , e){
		this.props.dispatch ({type : SystemActions.ActionTypes.SET_DIRTY , target:'system.teams.departments'});
		this.props.dispatch({type: SystemActions.ActionTypes.TEAMS.EDIT_DEP_NAME_CHANGE , 
		rowIndex:editIndex , data:e.target.value
        });
	}
	
	saveChangesToDepRow(editIndex){
		if(this.props.teamsScreen.teamDepartments[editIndex].name.length <= 3){
			//console.log("wrong");
		}
		else{
			 SystemActions.editExistingDepartmentName(this.props.dispatch , this.props.router.params.teamKey , 
			 this.props.teamsScreen.teamDepartments[editIndex].id , this.props.teamsScreen.teamDepartments[editIndex].name , 
			 editIndex
			 );
		}
	}
	
    render() {
		
		if(this.props.display){
			this.rows = '';
			if(this.props.teamDepartments != undefined){
			let self = this;
			this.rows=this.props.teamDepartments
                .map(function(item , i){
					let editItemOption = '';
					let deleteItem = '';
					let editItem = '';
					if (self.props.currentUser.admin || self.props.currentUser.permissions['system.teams.departments.edit']){
						editItem = <button type="button" className="btn btn-success btn-xs" onClick={self.editRow.bind(self , i)} ><i className="fa fa-pencil-square-o"></i></button>;
					}
					if(item.is_deletable && (self.props.currentUser.admin || self.props.currentUser.permissions['system.teams.departments.delete'])){
						deleteItem = <button type="button" className="btn btn-danger btn-xs" onClick={self.showConfirmDelete.bind(self , i)}><i className="fa fa-trash-o"></i></button>;
					}
					if(!self.props.teamsScreen.isEditingDep){
						editItemOption=<div>
						{editItem} &nbsp;
							{deleteItem}
						</div>;
					}
					
					if(item.is_editing == 0){
						return <tr id={i} key={i}>
					   <td>{i+1}</td>
					   <td>{item.name}</td><td>
						   {editItemOption}
					   </td>
					  </tr>;
					}
					else{
                    return <tr id={i} key={i}>
					   <td>{i+1}</td>
					   <td><input type="text" className="form-control" value={item.name} onChange={self.changeDepName.bind(self , i)} style={{borderColor:(item.name.length <= 3?'#ff0000':'#ccc')}} /></td><td>
					      <span className="glyphicon glyphicon-ok" style={{paddingLeft: '3px', color:'green' , fontSize:'20px' , cursor:'pointer'}}    onClick={self.saveChangesToDepRow.bind(self , i)}     />
				             <span className="glyphicon glyphicon-remove" style={{paddingLeft: '3px' , color:'red' , fontSize:'20px' , cursor:'pointer'}}    onClick={self.closeEditRowFormat.bind(self , i)}   />	
					   </td>
					</tr>;
					}
            });
			}
			let addNewDepartmentItem = '';
			if(this.props.teamsScreen.isAddingNewDepartment){
			addNewDepartmentItem = <div style={{fontSize:'19px' , paddingBottom:'10px' , paddingRight:'20px'}}>
					  <table>
					   <tbody>
					   <tr>
					   <td>
					    שם מחלקה : </td>
						
						<td style={{paddingRight:'5px'}}>
						<input type="text" className="form-control" value={this.props.teamsScreen.newDepartmentName} onChange={this.newDepNameChange.bind(this)}  style={{borderColor:(  this.props.teamsScreen.newDepartmentName.length <=3?'#ff0000' : '#ccc')}}  />
					    </td>
						<td style={{marginRight:'10px'}}>
				             &nbsp;<span className="glyphicon glyphicon-ok" style={{paddingLeft: '3px', color:'green' , fontSize:'20px' , cursor:'pointer'}}   onClick={this.addNewTeamDepartment.bind(this)}    />
				             <span className="glyphicon glyphicon-remove" style={{paddingLeft: '3px' , color:'red' , fontSize:'20px' , cursor:'pointer'}}   onClick={this.closeAddingNewDepartment.bind(this)}  />					
						</td>
					 </tr>
					 </tbody>
					 </table>
					 </div>;
					 
			}
			else{
				if(this.props.currentUser.admin || this.props.currentUser.permissions['system.teams.departments.add']){
				addNewDepartmentItem = <div style={{ paddingBottom:'10px' , paddingRight:'20px' , visibility : (this.props.teamsScreen.isEditingDep?'hidden':'')}}><button type="button" className="btn btn-primary btn-md" onClick={this.setAddingNewDepartment.bind(this)}  >
					      <span>+ הוספת מחלקה</span>
					 </button>
					 </div>
				}
			}
			
	        return  <div>
			    <table className="table table-bordered table-striped table-hover lists-table">
				    <thead>
					   <tr>
					       <th>#</th>
						   <th>שם מחלקה</th>
						   <th style={{ borderLeft:'none' }}>פעולות</th>
						   <th style={this.getScrollHeaderStyle()}></th>						   
					   </tr>
					</thead>
					<tbody ref={this.getRef.bind(this)} style={{height:'328px'}}>
					{this.rows}
					</tbody>
				</table>
				{addNewDepartmentItem}
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
		teamDepartments : state.system.teamsScreen.teamDepartments ,
		teamsScreen : state.system.teamsScreen,
		currentUser:state.system.currentUser,
		tableHasScrollbar: state.system.teamsScreen.tableHasScrollbar,
		scrollbarWidth : state.system.scrollbarWidth,
    };
}

export default connect(mapStateToProps)(withRouter(TeamDepartments));
