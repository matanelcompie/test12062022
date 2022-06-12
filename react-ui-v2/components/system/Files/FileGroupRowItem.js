import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Combo from '../../global/Combo';
import FileRowItem from './FileRowItem';

import * as SystemActions from '../../../actions/SystemActions';

class FileGroupRowItem extends React.Component {

    constructor(props) {
        super(props);
    }
	
	/*
	Show edit existing file group screen modal window
	*/
	showEditFileGroupScreen(fileGroupID){
			let originalFileGroupArrayIndex = -1;
			for(let i = 0 ; i< this.props.filesScreen.filesInGroups.length ; i++){
				if(this.props.filesScreen.filesInGroups[i].id == fileGroupID){
					originalFileGroupArrayIndex = i;
					break;
				}
			}
			if(originalFileGroupArrayIndex!=-1){
				let screenValues = {};
				screenValues.show = true;
				screenValues.editItemIndex = originalFileGroupArrayIndex;
				screenValues.name = this.props.filesScreen.filesInGroups[originalFileGroupArrayIndex].name;
				screenValues.selectedModulesList = this.props.filesScreen.filesInGroups[originalFileGroupArrayIndex].modules;
				this.props.dispatch({type:SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE_GROUP , screenValues});
			}
	}
	
	/*
	Show edit existing FILE  screen modal window
	*/
	showEditFileScreen(fileGroupID , fileRowIndex){
		    let originalFileGroupArrayIndex = -1;
			for(let i = 0 ; i< this.props.filesScreen.filesInGroups.length ; i++){
				if(this.props.filesScreen.filesInGroups[i].id == fileGroupID){
					originalFileGroupArrayIndex = i;
					break;
				}
			}
			let screenValues = {};
		    screenValues.show = true;
			screenValues.fileGroupIndex = originalFileGroupArrayIndex;
			screenValues.editItemIndex = fileRowIndex;
			screenValues.name = this.props.filesScreen.filesInGroups[originalFileGroupArrayIndex].files[fileRowIndex].name;
			screenValues.file = this.props.filesScreen.filesInGroups[originalFileGroupArrayIndex].files[fileRowIndex].file_name;
		    this.props.dispatch({type:SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE , screenValues});
	}
	
	/*
	Display confirm delete file modal dialog 
	*/
	showConfirmDeleteFile(fileDeleteGroupID , fileDeleteIndex){
		this.props.dispatch({type:SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE , fieldName:'deleteFileGroupIndex' , fieldValue:fileDeleteGroupID });
		this.props.dispatch({type:SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE , fieldName:'deleteFileIndex' , fieldValue:fileDeleteIndex });
	}
	
	
	/*
	comvert file size from bytes to kb/mb
	*/
	formatFileSize(bytes){
		 var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	     if (bytes == 0) return '0 Byte';
		 var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		 return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];	
	}
	
	/*
	Display confirm delete file-group modal dialog 
	*/
	showConfirmDeleteFileGroup(deleteIndex){
		this.props.dispatch({type:SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE , fieldName:'deleteFileGroupIndex' , fieldValue:deleteIndex });
	}
	
	
	/*
	Show add new FILE  screen modal window
	*/
	showAddNewFileScreen(fileGroupID){
		    let originalFileGroupArrayIndex = -1;
			for(let i = 0 ; i< this.props.filesScreen.filesInGroups.length ; i++){
				if(this.props.filesScreen.filesInGroups[i].id == fileGroupID){
					originalFileGroupArrayIndex = i;
					break;
				}
			}
			let screenValues = {};
		    screenValues.show = true;
			screenValues.fileGroupIndex = originalFileGroupArrayIndex;
		    this.props.dispatch({type:SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE , screenValues});
	}

    render() {
		let item = this.props.item;
		let index = this.props.index;
		let self = this;
		 return <div><div className="containerStrip dtlsBox box-content">
                     <div className="row panel-collapse flexed-center flexed-space-between">
                        <div  className="col-lg-8">
						  <div className="row">
						  <div className="col-lg-4" style={{color:'#327DA4' , borderLeft:(this.props.currentUser.admin?'1px solid #327DA4':'')}}>
                            <a title={item.name}  style={{color:'#327DA4'}} data-toggle="collapse" href={"#collapse-"+index} aria-expanded="false" className="collapsed">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle text-title" >
                                    <span  style={{color:'#327DA4'}}>{item.name}</span>&nbsp;&nbsp;
                                    <span className="badge"  style={{backgroundColor:'#327DA4'}}>{item.files.length}</span>
                                </div>
                            </a>
							</div>
							<div className="col-lg-6" style={{paddingTop:'6px'}}>
							{this.props.currentUser.admin?
							<div>
								<a className="btn-edit" title="ערוך" data-toggle="modal" href="#add-edit-area">
									<span className="glyphicon glyphicon-pencil" onClick={this.showEditFileGroupScreen.bind(this , item.id)}></span>
								</a>&nbsp;&nbsp;&nbsp;&nbsp;
								<a title="הוספת קובץ חדש" onClick={this.showAddNewFileScreen.bind(this , item.id)} style={{cursor:'pointer'}}><img src={ window.Laravel.baseURL + "Images/upload-files-icon.jpg"} /></a>
                            </div> :null}
						  </div>
						  </div>
						</div>
						
                        <div className="col-lg-4">
						{this.props.currentUser.admin?
						  <div className="row">
						    <div className="col-md-4 text-left no-padding" style={{paddingLeft:'10px' , paddingTop:'3px'}}>
								<label className="control-label" style={{fontSize:'16px'}}>יוצג במודול/ים</label>
							</div>
							<div className="col-md-7 no-padding" style={{paddingLeft:'10px'}}>
								 <Combo items={this.props.allModules} selectedItems={item.modules} multiSelect={true}   className="form-combo-table" itemIdProperty="id" itemDisplayProperty='name' maxDisplayItems={5} />
							</div>
							<div className="col-md-1 text-right no-padding" style={{paddingTop:'6px'}}>
								<a title="מחק" data-toggle="modal" href="#delete-area" onClick={this.showConfirmDeleteFileGroup.bind(this,item.id)}>
									<span className="glyphicon glyphicon-trash green-icon"></span>
								</a>
							</div>
						
						  </div>
						  	:null }
                        </div>
					
                    </div>
                    <div id={"collapse-"+index} className="collapse" aria-expanded="false" style={{height: '0px'}}>
                        <div className="collapse-inner">
						<hr/>
						 
                            <table className="table table-responsive table-striped  tableTight tableNoMarginB  table-scroll">
                                <thead>
                                    <tr>
                                        <th>שם הקובץ</th>
                                        <th>פורמט</th>
                                        <th>גודל</th>
                                        {this.props.currentUser.admin?<th>משתמש יוצר</th>:null}
                                        {this.props.currentUser.admin?<th>מועד יצירה</th>:null}
                                        {this.props.currentUser.admin?<th className="status-data"></th>:null}
                                        {this.props.currentUser.admin?<th className="status-data"></th>:null}
                                    </tr>
                                </thead>
                                <tbody>
								{item.files.map(function(innerItem , fileIndex){
									return(<FileRowItem item={item} innerItem={innerItem} fileIndex={fileIndex}  key={"fileRow"+index+''+fileIndex} isAdmin={self.props.currentUser.admin}
                                                        formatFileSize={self.formatFileSize.bind(self)} showConfirmDeleteFile={self.showConfirmDeleteFile.bind(self)} showEditFileScreen={self.showEditFileScreen.bind(self)}
   									                    />)
								})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
				<br/>
				</div>
    }

 
}

function mapStateToProps(state) {
    return {
           filesScreen:state.system.filesScreen,
		   currentUser: state.system.currentUser,
		   allModules:state.system.filesScreen.addEditFileGroupScreen.allModules,
    };
}

export default connect(mapStateToProps)(withRouter(FileGroupRowItem));
