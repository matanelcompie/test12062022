import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterActionTypeRow from './VoterActionTypeRow';
import VoterActionTopics from './VoterActionTopic';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
        import ModalWindow from '../../../../global/ModalWindow';

class VoterActionType extends React.Component {

    textIgniter() {
        this.textValues = {
            listTitle: 'סוגי פעולות',
            subListTitle: 'נושא פעולות',
            addButtonTitle: 'הוספת סוג פעולה',
            searchTitle: 'חיפוש',
            nameTitle: 'סוגי פעולות',
            modalWindowTitle: 'מחיקת סוג פעולה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את סוג הפעולה הזה?'
        };
    }

    updateVoterActionTypeSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ACTION_TYPE_SEARCH_VALUE, value});
    }

    addNewVoterActionType() {
        SystemActions.addVoterActionType(store, this.props.voterActionTypeSearchValue);
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_VOTER_ACTION_TYPE});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteVoterActionType(store, this.props.voterActionTypeKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ACTION_TYPE_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.voterActionTypeRows = this.props.voterActionTypes
                .map(function (item) {
                    if (item.name.indexOf(this.props.voterActionTypeSearchValue) != -1) {
                        return <VoterActionTypeRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isVoterActionTypeOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }
    
    componentDidUpdate(){
        //after editing scroll back to the item position
        if (undefined!= this.self&& null !=this.self && this.props.currentTableScrollerPosition>0) {
            this.self.scrollTop=this.props.currentTableScrollerPosition;
        }
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();

        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_types']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-6">
                            <a onClick={this.updateCollapseStatus.bind(this,'voterActionType')} aria-expanded={this.props.containerCollapseStatus.voterActionType}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                        <div className={"col-md-6 collapseTitle"+(true == this.props.containerCollapseStatus.voterActionType && true == this.props.isVoterActionTypeTopicsDisplayed && false == this.props.isVoterActionTypeInEditMode?"":" hidden")}>
                            {this.textValues.subListTitle + ' - ' + this.props.voterActionTypeNameInSelectMode}
                        </div>
                    </div>   
                    <Collapse isOpened={this.props.containerCollapseStatus.voterActionType}>
                        <div className='row CollapseContent'>
                            <div className='col-md-6'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="voterActionTypeSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-sm-5">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="voterActionTypeSearch"
                                                        value={this.props.voterActionTypeSearchValue} onChange={this.updateVoterActionTypeSearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_types.add']) ? '' : ' hidden')} 
                                                        disabled={(this.props.voterActionTypeSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewVoterActionType.bind(this)}>
                                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                            <span>{this.textValues.addButtonTitle}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                        <table className="table table-bordered table-striped table-hover lists-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <span onClick={this.orderList.bind(this)} className={"cursor-pointer" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.action_types.edit']) ? '' : ' hidden')}>
                                                            {this.textValues.nameTitle}&nbsp;
                                                            <i className={'fa fa-1x fa-sort-'+this.orderDirection} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)}>
                                                {this.voterActionTypeRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showVoterActionTypeModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-6'>
                                <VoterActionTopics />
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        voterActionTypes: state.system.lists.voterActionTypes,
        voterActionTypeSearchValue: state.system.listsScreen.voterTab.voterActionTypeSearchValue,
        showVoterActionTypeModalDialog: state.system.listsScreen.voterTab.showVoterActionTypeModalDialog,
        voterActionTypeKeyInSelectMode: state.system.listsScreen.voterTab.voterActionTypeKeyInSelectMode,
        voterActionTypeNameInSelectMode: state.system.listsScreen.voterTab.voterActionTypeNameInSelectMode,
        isVoterActionTypeOrderedAsc: state.system.listsScreen.voterTab.isVoterActionTypeOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isVoterActionTypeInEditMode: state.system.listsScreen.voterTab.isVoterActionTypeInEditMode,
        isVoterActionTypeTopicsDisplayed: state.system.listsScreen.voterTab.isVoterActionTypeTopicsDisplayed,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(VoterActionType));