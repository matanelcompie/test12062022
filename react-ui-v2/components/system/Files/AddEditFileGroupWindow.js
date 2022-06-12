import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalWindow from '../../global/ModalWindow';
import Combo from '../../global/Combo';

import * as SystemActions from '../../../actions/SystemActions';

class AddEditFileGroupWindow extends React.Component {

    constructor(props) {
        super(props);
    }
	
	/*
	Handle change in screen field 
	*/
	changeFileGroupSingleField(fieldName , e){
		if(fieldName == 'selectedModulesList'){
			this.props.dispatch({type :SystemActions.ActionTypes.FILES.FILE_GROUP_SCREEN_FIELD_CHANGE , fieldName , fieldValue:e.target.selectedItems});
		}
		else{
			this.props.dispatch({type :SystemActions.ActionTypes.FILES.FILE_GROUP_SCREEN_FIELD_CHANGE , fieldName , fieldValue:e.target.value});
		}
	}
	
	/*
	handle cancel button click
	*/
	hideThisModal(){
			let screenValues = {};
		    screenValues.show = false;
		    screenValues.editItemIndex = -1;
		    screenValues.name = '';
		    screenValues.selectedModulesList = [];
		    this.props.dispatch({type:SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE_GROUP , screenValues});
	}
	
	/*
	handle add/edit action
	*/
	doAddOrEditAction(){
		if(this.props.addEditFileGroupScreen.name.split(' ').join('') == ''){return;} // must contain at least name
	    if(this.props.addEditFileGroupScreen.editItemIndex == -1){
			SystemActions.addNewFileGroup(this.props.dispatch , this.props.addEditFileGroupScreen.name , JSON.stringify(this.props.addEditFileGroupScreen.selectedModulesList));
		}
		else{
			let actualRow = this.props.filesScreen.filesInGroups[this.props.addEditFileGroupScreen.editItemIndex];
			SystemActions.updateFileGroup(this.props.dispatch , actualRow.key , this.props.addEditFileGroupScreen.editItemIndex , this.props.addEditFileGroupScreen.name , this.props.addEditFileGroupScreen.selectedModulesList);
		}
	}
	 

    render() {
		 
		 return (<ModalWindow show={true} className title={this.props.addEditFileGroupScreen.editItemIndex == -1 ? 'הוספת אזור' : 'עריכת אזור'} 
		           buttonOk={this.doAddOrEditAction.bind(this)}
                                 buttonCancel={this.hideThisModal.bind(this)} buttonX={this.hideThisModal.bind(this)}>
								<div className="row">
								    <div className="col-md-4">
									 שם : 
									</div>
									 <div className="col-md-8">
									 <input type="text" className="form-control" value={this.props.addEditFileGroupScreen.name} onChange={this.changeFileGroupSingleField.bind(this , 'name')} style={{borderColor:(this.props.addEditFileGroupScreen.name.split(' ').join('') == ''? '#ff0000':'#ccc')}} />
									</div>
								</div>
								<div className="row">
								    <div className="col-md-4">
									 יוצג במודול/ים : 
									</div>
									 <div className="col-md-8">
									 <Combo items={this.props.addEditFileGroupScreen.allModules} multiSelect={true} selectedItems={this.props.addEditFileGroupScreen.selectedModulesList} onChange={this.changeFileGroupSingleField.bind(this , 'selectedModulesList')}  className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} />
									</div>
								</div>
		         </ModalWindow>)
    }

 
}

function mapStateToProps(state) {
    return {
           filesScreen:state.system.filesScreen,
		   currentUser: state.system.currentUser,
		   addEditFileGroupScreen: state.system.filesScreen.addEditFileGroupScreen,
    };
}

export default connect(mapStateToProps)(withRouter(AddEditFileGroupWindow));
