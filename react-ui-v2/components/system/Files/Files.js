import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import globalSaving from '../../hoc/globalSaving';
import ModalWindow from '../../global/ModalWindow';
import Combo from '../../global/Combo';
import AddEditFileGroupWindow from './AddEditFileGroupWindow';
import AddEditFileWindow from './AddEditFileWindow';
import FileGroupRowItem from './FileGroupRowItem';

import * as SystemActions from '../../../actions/SystemActions';

class Files extends React.Component {

	constructor(props) {
		super(props);
		this.state={
			initialScreen:false,
		}
	}

	/*
	   Handle click on search file groups filter button 
	*/
	filterFileGroups() {
		this.props.dispatch({ type: SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE, fieldName: 'selectedFilterIndex', fieldValue: this.props.filesScreen.selectedSearchGroupFilter.selectedItem.id });
		if (this.state.initialScreen) {
			this.setState({ initialScreen: false });
		}
	}

	componentWillMount() {
		this.props.dispatch({ type: SystemActions.ActionTypes.SET_SYSTEM_TITLE, systemTitle: 'קבצים להורדה' });
		//this.setState({ initialScreen: true }); //set state for page entry - in order that in admin it won't show all file groups - only after searching
		SystemActions.loadGlobalFileGroups(this.props.dispatch);
		SystemActions.loadModules(this.props.dispatch);
	}


	/*
	Show add new file group screen modal window
	*/
	showAddNewFileGroupScreen() {
		let screenValues = {};
		screenValues.show = true;
		this.props.dispatch({ type: SystemActions.ActionTypes.FILES.SHOW_HIDE_ADD_EDIT_FILE_GROUP, screenValues });
	}

    /*
	   For admin only - this will handle change in search filter combo option
	*/
	changeSearchFilterCombo(e) {
		this.props.dispatch({ type: SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE, fieldName: 'selectedSearchGroupFilter', fieldValue: { selectedValue: e.target.value, selectedItem: e.target.selectedItem } });
	}

	/*
	Handles confirm delete modal dialog
	*/
	closeConfirmDeleteDialog() {
		if (this.props.filesScreen.deleteFileGroupIndex != -1) {
			this.props.dispatch({ type: SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE, fieldName: 'deleteFileGroupIndex', fieldValue: -1 });
		}
		if (this.props.filesScreen.deleteFileIndex != -1) {
			this.props.dispatch({ type: SystemActions.ActionTypes.FILES.CHANGE_GLOBAL_WINDOW_VALUE, fieldName: 'deleteFileIndex', fieldValue: -1 });
		}
	}


	/*
	   Handles real deleting via api the file group with all its files
	*/
	doRealFileGroupDelete(deleteIndex) {
		let fileGroupKey = this.props.filesScreen.filesInGroups[deleteIndex].key;
		SystemActions.deleteWholeFileGroup(this.props.dispatch, fileGroupKey, deleteIndex);
	}

	/*
	   Handles real deleting via api the file 
	*/
	doRealFileDelete(fileGroupDeleteIndex, fileDeleteIndex) {
		let fileKey = this.props.filesScreen.filesInGroups[fileGroupDeleteIndex].files[fileDeleteIndex].key;
		SystemActions.deleteWholeFile(this.props.dispatch, fileKey, fileGroupDeleteIndex, fileDeleteIndex);
	}

    /*
	   Init dynamic variables for render() function :
	*/
	initDynamicVariables() {

		this.confirmDeleteItem = null;
		this.adminSearchItem = null;
		this.addEditFileGroupItem = null;
		if (this.props.currentUser.admin) {

			if (this.props.filesScreen.deleteFileIndex != -1 && this.props.filesScreen.deleteFileGroupIndex != -1) {
				let originalFileGroupArrayIndex = -1;
				for (let i = 0; i < this.props.filesScreen.filesInGroups.length; i++) {
					if (this.props.filesScreen.filesInGroups[i].id == this.props.filesScreen.deleteFileGroupIndex) {
						originalFileGroupArrayIndex = i;
						break;
					}
				}
				if (originalFileGroupArrayIndex != -1 && this.props.filesScreen.deleteFileIndex != -1) {
					this.confirmDeleteItem = <ModalWindow show={true} buttonCancel={this.closeConfirmDeleteDialog.bind(this)} buttonX={this.closeConfirmDeleteDialog.bind(this)} buttonOk={this.doRealFileDelete.bind(this, originalFileGroupArrayIndex, this.props.filesScreen.deleteFileIndex)}><div>למחוק את הקובץ?</div></ModalWindow>
				}
			}
			else if (this.props.filesScreen.deleteFileGroupIndex != -1) {
				let originalFileGroupArrayIndex = -1;
				for (let i = 0; i < this.props.filesScreen.filesInGroups.length; i++) {
					if (this.props.filesScreen.filesInGroups[i].id == this.props.filesScreen.deleteFileGroupIndex) {
						originalFileGroupArrayIndex = i;
						break;
					}
				}
				if (originalFileGroupArrayIndex != -1) {
					this.confirmDeleteItem = <ModalWindow show={true} buttonCancel={this.closeConfirmDeleteDialog.bind(this)} buttonX={this.closeConfirmDeleteDialog.bind(this)} buttonOk={this.doRealFileGroupDelete.bind(this, originalFileGroupArrayIndex)}><div>פעולת המחיקה תמחק גם את כל הקבצים המשויכים לקבוצה הזו . האם להמשיך ? </div></ModalWindow>
				}
			}


			this.adminSearchItem = <div>
				<div className="row containerStrip dtlsBox">
					<div className="col-lg-3 flexed">
						<label className="control-label standard-label" style={{ fontSize: '18px' }}>הצג</label>&nbsp;&nbsp;&nbsp;&nbsp;
												<Combo items={[{ id: -1, name: 'הכל' }, ...this.props.filesScreen.filesInGroups]} 
														value={this.props.filesScreen.selectedSearchGroupFilter.selectedValue} 
														onChange={this.changeSearchFilterCombo.bind(this)} 
														className="form-combo-table" 
														itemIdProperty="id" 
														itemDisplayProperty='name' 
														showFilteredList={false}
														maxDisplayItems={5} />
					</div>
					<div className="col-lg-9">
						<button title="הוסף אזור" style={{ backgroundColor: '#fff', border: '2px solid #2AB4C0', color: '#2AB4C0', padding: '5px 20px' }} className="btn btn-default srchBtn btn-negative pull-left" onClick={this.showAddNewFileGroupScreen.bind(this)}><span className="add-icon">+</span>הוסף אזור</button>
						<button title="הצג" type="submit" className="item-space btn btn-default srchBtn pull-left" disabled={!this.props.filesScreen.selectedSearchGroupFilter.selectedItem} onClick={this.filterFileGroups.bind(this)} >הצג</button>
					</div>
				</div>
				<br /><br />
			</div>;
			if (this.props.filesScreen.addEditFileGroupScreen.show) {
				this.addEditFileGroupItem = <AddEditFileGroupWindow />;
			}
			else if (this.props.filesScreen.addEditFileScreen.show) {
				this.addEditFileGroupItem = <AddEditFileWindow />;
			}
		}
		let self = this;
		this.fileGroups = null;
		if (!this.props.currentUser.admin || !this.state.initialScreen) {
			let filteredFileGroups = this.props.filesScreen.filesInGroups;
			if (this.props.currentUser.admin) {
				if (this.props.filesScreen.selectedFilterIndex != -1) {
					filteredFileGroups = filteredFileGroups.filter(function (item) {
						return item.id == self.props.filesScreen.selectedFilterIndex;
					});
				}
			}
			this.fileGroups = filteredFileGroups.map(function (item, index) {
				return (<FileGroupRowItem item={item} index={index} key={"fileGroup" + index} />)
			});
		}
	}

	render() {
		if (!this.props.currentUser.first_name) {
			return <div style={{ textAlign: 'center' }}>
				<i className="fa fa-spinner fa-spin"></i> טוען נתונים...
			       </div>
		}
		else {
			this.initDynamicVariables();
			return (
				<div>
					<h1>קבצים להורדה</h1>
					{this.adminSearchItem}
					{this.fileGroups}
					{this.addEditFileGroupItem}
					{this.confirmDeleteItem}
				</div>)
		}
	}


}

function mapStateToProps(state) {
	return {
		filesScreen: state.system.filesScreen,
		currentUser: state.system.currentUser,
		allModules: state.system.filesScreen.addEditFileGroupScreen.allModules,
	};
}

export default globalSaving(connect(mapStateToProps)(withRouter(Files)));
