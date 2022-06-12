import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';
import store from '../../../../../store';

import VoterGroupList from './VoterGroupList';
import AddEditVoterGroupModal from './AddEditVoterGroupModal';
import TopHeaderSearch from './TopHeaderSearch';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';

class VoterGroup extends React.Component {

	constructor(props) {
        super(props);
        this.textIgniter();
		this.initConstants();
    }
	
	componentWillMount()
	{
		SystemActions.loadUserGeographicFilteredLists(store, this.screenPermission);
	}
	
	/*
		This function initializes title labels of icons
	*/
    textIgniter() {
        this.textValues = {
            listTitle: 'קבוצות ש"ס',
            addButtonTitle: 'הוספת קבוצה',
            searchTitle: 'חיפוש',
            nameTitle: 'שם קבוצה',
            modalWindowTitle: 'מחיקת קבוצה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הקבוצה',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול'
        };
    }
	
	/*
		This function inits constant variables
	*/
	initConstants(){
		this.state = {
			modalExtraParams:{}
		}
		this.initialRgbExpandColor = "#327DA4";
		this.initialRgbRowColor = "#A4C5DA";
		this.screenPermission = 'system.lists.elections.voter_groups';
	}
	
	/*
		Function that handles rendering all items
	*/
    renderItems() {
		let items = this.props.hieraticalVoterGroups ;
		if(this.props.showSearchMode){
			items = this.props.topSearchHierarchyResults;
		}
        return <VoterGroupList items={items} isEditMode={this.props.isVoterGroupInEditMode} 
                        ulStyle={{paddingRight: 0,margin:0}} itemInEditMode={this.props.voterGroupInEditMode} itemInAddMode={this.props.isVoterGroupInAddMode} 
                        keyInSelectMode={this.props.voterGroupKeyInSelectMode} 
                        openVoterGroups={this.props.openVoterGroups} currentUser={this.props.currentUser} 
                        GlobalDirty={this.props.GlobalDirty}
						rgbExpandColor={this.initialRgbExpandColor} rgbRowColor={this.initialRgbRowColor}
						showAddEditNewGroupWindow={this.showAddEditNewGroupWindow.bind(this)}
						/>
        }
		
		/*
			Handles expanding/shrinking group item by clicking +/-
		*/
        updateCollapseStatus(container) {
            if (false == this.props.dirty) {
                this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
            } else {
                this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
            }
        }

		/*
			This function do real delete of voter group via api and removes the confirm window dialog
		*/
        deleteModalDialogConfirm() {
            SystemActions.deleteVoterGroup(this.props.dispatch, this.props.voterGroupKeyInSelectMode);
            this.closeModalDialog();
        }

		/*
			This function closes confirm dialog
		*/
        closeModalDialog() {
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_GROUP_MODAL_DIALOG_DISPLAY});
        }
		
		/*
			Function that opend modal window of adding/editing voter group by sent param
		*/
		showAddEditNewGroupWindow(paramsArray){
			this.setState({modalExtraParams:paramsArray});
			this.props.dispatch({type:SystemActions.ActionTypes.LISTS.VOTER_GROUP_EDIT_VALUE_CHANGED,fieldName:'showAddEditModalWindow' , fieldValue:true});
		}
		
		/*
			Handles clicking 'expand all' or 'shrink all'
		*/
		expandOrShrinkAll(isExpand){
			this.props.dispatch({type:SystemActions.ActionTypes.LISTS.EXPAND_OR_SHRINK_ALL , isExpand});
		}
       
        render() {
            return (
                    <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions[this.screenPermission]) ? '' : ' hidden')}>
                        <a onClick={this.updateCollapseStatus.bind(this,'voterGroup')} aria-expanded={this.props.containerCollapseStatus.voterGroup}>
                            <div className="collapseArrow closed"></div>
                            <div className="collapseArrow open"></div>
                            <span className="collapseTitle">{this.textValues.listTitle}</span>
                        </a>
                        <Collapse isOpened={this.props.containerCollapseStatus.voterGroup}>
							{
							this.props.hieraticalVoterGroups.length ?
                            <div className="CollapseContent">
								<TopHeaderSearch/>
								<br/><br/>
								{(this.props.showSearchMode && this.props.topSearchAllResults.length == 0) ?
								<div>לא נמצאו תוצאות</div>
								:
								<div className="row rsltsTitleRow">
									<div className="col-lg-6 padding-top10">
										<div id="go-top-list"></div>
										<h3 className="separation-item ResultsTitle">מציג תוצאות 1-{(this.props.showSearchMode ? (this.props.topSearchAllResults.length- this.props.parentNotBelongingItemsCount) : this.props.voterGroups.length)}</h3>
										<span className="options-display separation-item"><a className="cursor-pointer" onClick={this.expandOrShrinkAll.bind(this  , true)} title="פתח הכל">פתח הכל</a> </span>
										<span className="options-display"><a className="cursor-pointer" onClick={this.expandOrShrinkAll.bind(this  , false)} title="פתח הכל">סגור הכל</a> </span>
									</div>
									<div className="col-lg-6 clearfix">
										<div className="link-box pull-left">
											<button type="submit" className="btn btn-primary btn-sm" onClick={this.showAddEditNewGroupWindow.bind(this , {parentID:0 , actionType:'add'})}>+ הוסף קבוצה חדשה</button>
										</div>
										<div className="legend-group full-group">קבוצה מלאה</div>
										<div className="legend-group empty-group">קבוצה ריקה</div>
									</div>
								</div>
								}
                                <div className="row">
											<div className="col-md-12">
											<div className="row">
												<div className="col-md-12" >
													<div style={{ backgroundColor: '#ddd',width:'100%'}} className="pull-left">
														<div className="pull-left" style={{padding:'5px 7px 10px 153px'}}>
															<div className="details-group">תאריך יצירה</div>
															<div className="details-group"> משתמש יוצר</div>
															<div className="details-group">הרשאה </div>
														</div>
													</div>
												</div>
												<div className="col-md-12">
													{this.renderItems()}
												</div>
											</div>
										</div>
										
                                </div>
                            </div>
							:
							<div><br/><i className="fa fa-spinner fa-spin"></i> טוען נתונים ...</div>
							}
							<ModalWindow show={this.props.showVoterGroupModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
							
                            	buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
							<div>{this.textValues.modalWindowBody + ' "' + this.props.voterGroupNameInSelectMode + '" מהמערכת?'}</div>
                            </ModalWindow>
							{this.props.showAddEditModalWindow && <AddEditVoterGroupModal modalExtraParams={this.state.modalExtraParams} />}
                        </Collapse>
                    </div>
                    );
        }
    }

    function mapStateToProps(state) {
        return {
            voterGroups: state.system.lists.voterGroups,
            hieraticalVoterGroups: state.system.lists.hieraticalVoterGroups,
            containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
            currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
            openVoterGroups: state.system.listsScreen.voterTab.openVoterGroups,
            voterGroupKeyInSelectMode: state.system.listsScreen.voterTab.voterGroupKeyInSelectMode,
            voterGroupNameInSelectMode: state.system.listsScreen.voterTab.voterGroupNameInSelectMode,
            showVoterGroupModalDialog: state.system.listsScreen.voterTab.showVoterGroupModalDialog,
            isVoterGroupInEditMode: state.system.listsScreen.voterTab.isVoterGroupInEditMode,
            voterGroupInEditMode: state.system.listsScreen.voterTab.voterGroupInEditMode,
            isVoterGroupInAddMode: state.system.listsScreen.voterTab.isVoterGroupInAddMode,
            dirty: state.system.listsScreen.dirty,
            currentUser: state.system.currentUser,
            GlobalDirty: state.system.dirty,
			showAddEditModalWindow: state.system.listsScreen.voterTab.showAddEditModalWindow,
			topSearchAllResults :state.system.listsScreen.voterTab.topSearchAllResults,
			topSearchHierarchyResults:state.system.listsScreen.voterTab.topSearchHierarchyResults,
			showSearchMode:state.system.listsScreen.voterTab.showSearchMode,
			parentNotBelongingItemsCount:state.system.listsScreen.voterTab.parentNotBelongingItemsCount,
        };
    }
    export default connect(mapStateToProps)(withRouter(VoterGroup));