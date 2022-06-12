import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import ModalWindow from '../../global/ModalWindow';

import * as SystemActions from '../../../actions/SystemActions';

class AddEditFileWindow extends React.Component {

    constructor(props) {
        super(props);
    }
	
	/*
	comvert file size from  kb/mb and string suffix 'kb'mb' to size in bytes " 
	*/
	formatFileToBytes(sizeMixedStr){
		
	     let cleanNumber = sizeMixedStr.replace("MB" , "").replace("KB" , "");
		 if(sizeMixedStr.indexOf('MB') !=-1){
			 return parseInt(cleanNumber)*1024*1024;
		 }
		 else if(sizeMixedStr.indexOf('KB') !=-1){
			 return parseInt(cleanNumber)*1024;
		 }
		 else return 0;
	}
	
	/*
	Handle change in screen field 
	*/
	changeFileGroupSingleField(fieldName , e){
			this.props.dispatch({type :SystemActions.ActionTypes.FILES.FILE_SCREEN_FIELD_CHANGE , fieldName , fieldValue:e.target.value});
	}
	
	/*
	handle cancel button click
	*/
	hideThisModal(){
			let screenValues = {};
		    screenValues.show = false;
		    screenValues.editItemIndex = -1;
		    screenValues.fileGroupIndex = -1;
			screenValues.name = '';
		    screenValues.file = '';
		    this.props.dispatch({type:SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE , screenValues});
	}
	
	/*
	handle add/edit action
	*/
	doAddOrEditAction(){
		if(this.state && this.state.file && (this.state.file.size >= this.props.systemSettings.max_upload_size)){return;} // if file is big - don't do action
	    if(this.props.addEditFileScreen.editItemIndex == -1){
			if(!this.props.addEditFileScreen.name || !this.state ||  !this.state.file){return;} // must contain both name and file
			SystemActions.addUploadNewFile(this.props.dispatch , this.props.filesScreen.filesInGroups[this.props.addEditFileScreen.fileGroupIndex].key , this.props.addEditFileScreen.name, this.state.file , this.props.addEditFileScreen.fileGroupIndex , this.props.addEditFileScreen.editItemIndex );
		}
		else{
			if(!this.props.addEditFileScreen.name){return;} // must contain at least name or file in order to update
			if(this.props.filesScreen.filesInGroups[this.props.addEditFileScreen.fileGroupIndex].files[this.props.addEditFileScreen.editItemIndex].name == this.props.addEditFileScreen.name && (!this.state || !this.state.file)){
				this.hideThisModal();
			}
			else{
				SystemActions.updateFile(this.props.dispatch , this.props.filesScreen.filesInGroups[this.props.addEditFileScreen.fileGroupIndex].files[this.props.addEditFileScreen.editItemIndex].key  , this.props.addEditFileScreen.name , (this.state ? this.state.file:undefined)  , this.props.addEditFileScreen.fileGroupIndex,  this.props.addEditFileScreen.editItemIndex );
			}
			
		}
	}
	 
	/*
	   Function that handles selecting file from input-file :
	*/
	fileWasSelected(e) {
		var file = null;
 
		if (e.target.files) {
			file = e.target.files[0];
			delete file.lastModifiedDate;
		}
		this.setState({file});
	}

    render() {
		 return (<ModalWindow show={true} className title={this.props.addEditFileScreen.editItemIndex == -1 ? 'הוספת קובץ' : 'עריכת קובץ'} 
		           buttonOk={this.doAddOrEditAction.bind(this)}
                                 buttonCancel={this.hideThisModal.bind(this)} buttonX={this.hideThisModal.bind(this)}>
								 <div style={{width:'500px'}}>
								<div className="row" >
								    <div className="col-md-4">
									 שם : 
									</div>
									 <div className="col-md-8">
									 <input type="text" className="form-control" value={this.props.addEditFileScreen.name} onChange={this.changeFileGroupSingleField.bind(this , 'name')} style={{borderColor:(this.props.addEditFileScreen.name.split(' ').join('') == ''? '#ff0000':'#ccc')}} />
									</div>
								</div>
								<div className="row" style={{paddingTop:'10px'}}>
								    <div className="col-md-4">
									 צרף קובץ : 
									</div>
									 <div className="col-md-8">
									    <input type="file"  id="uploadFile"  onChange={this.fileWasSelected.bind(this)} />
										{this.props.addEditFileScreen.file}
									</div>
								</div>
								{((this.props.addEditFileScreen.editItemIndex == -1)&&(!this.props.addEditFileScreen.name || !this.state || !this.state.file))?
								<div className="row" style={{paddingTop:'10px'}}>
								    <div className="col-md-12">
									   <span style={{color:'#ff0000' , fontSize:'14px'}}>* שם ובחירת קובץ חובה !</span>
									</div>
								</div>:null}
								{ (this.state && this.state.file && (this.state.file.size >= this.formatFileToBytes(this.props.systemSettings.max_upload_size)))?
								<div className="row" style={{paddingTop:'10px'}}>
								    <div className="col-md-12">
									   <span style={{color:'#ff0000' , fontSize:'14px'}}>קובץ גדול מדיי!</span>
									</div>
								</div>:null}
								</div>
		         </ModalWindow>)
    }

 
}

function mapStateToProps(state) {
    return {
           filesScreen:state.system.filesScreen,
		   currentUser: state.system.currentUser,
		   addEditFileScreen: state.system.filesScreen.addEditFileScreen,
		   systemSettings:state.system.systemSettings,
    };
}

export default connect(mapStateToProps)(withRouter(AddEditFileWindow));
