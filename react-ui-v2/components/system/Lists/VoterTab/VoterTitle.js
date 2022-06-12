import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterTitleRow from './VoterTitleRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class VoterTitle extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'תואר',
            addButtonTitle: 'הוספת תואר',
            searchTitle: 'חיפוש',
            nameTitle : 'תואר',
            modalWindowTitle:'מחיקת תואר',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התואר הזה?'
        };
    }

    updateVoterTitleSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_VOTER_TITLE_SEARCH_VALUE, value});
    }

    addNewVoterTitle() {
        SystemActions.addVoterTitle(store, this.props.voterTitleSearchValue);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_VOTER_TITLE});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteVoterTitle(store,this.props.voterTitleKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_TITLE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.voterTitleRows=this.props.voterTitle
                .map(function(item){
                    if(item.name.indexOf(this.props.voterTitleSearchValue)!=-1){
                        return <VoterTitleRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isVoterTitleOrderedAsc? 'asc':'desc';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_titles']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'voterTitle')} aria-expanded={this.props.containerCollapseStatus.voterTitle}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.voterTitle}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="voterTitleSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="voterTitleSearch"
                                            value={this.props.voterTitleSearchValue} onChange={this.updateVoterTitleSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.voter_titles.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.voterTitleSearchValue.length >=2 ? "" : " disabled")} onClick={this.addNewVoterTitle.bind(this)}>
                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-5">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this)} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={'fa fa-1x fa-sort-'+this.orderDirection} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.voterTitleRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showVoterTitleModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                    buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                        <div>{this.textValues.modalWindowBody}</div>
                                    </ModalWindow>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        voterTitle: state.system.lists.voterTitle,
        voterTitleSearchValue: state.system.listsScreen.voterTab.voterTitleSearchValue,
        showVoterTitleModalDialog: state.system.listsScreen.voterTab.showVoterTitleModalDialog,
        voterTitleKeyInSelectMode: state.system.listsScreen.voterTab.voterTitleKeyInSelectMode,
        isVoterTitleOrderedAsc: state.system.listsScreen.voterTab.isVoterTitleOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isVoterTitleInEditMode: state.system.listsScreen.voterTab.isVoterTitleInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(VoterTitle));