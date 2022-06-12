import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterElectionRolesRow from './VoterElectionRolesRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class VoterElectionRoles extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'תפקיד יום בחירות',
            addButtonTitle: 'הוספת תפקיד',
            searchTitle: 'חיפוש',
            nameTitle : 'תפקיד',
            modalWindowTitle:'מחיקת תפקיד',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התפקיד הזה?'
        };
    }

    updateVoterElectionRolesSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_VOTER_ELECTION_ROLES_SEARCH_VALUE, value});
    }

    addNewVoterElectionRoles() {
        SystemActions.addVoterElectionRoles(store, this.props.voterElectionRolesSearchValue);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_VOTER_ELECTION_ROLES});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteVoterElectionRoles(store,this.props.voterElectionRolesKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_ELECTION_ROLES_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.voterElectionRolesRows=this.props.voterElectionRoles
                .map(function(item){
                    if(item.name.indexOf(this.props.voterElectionRolesSearchValue)!=-1){
                        return <VoterElectionRolesRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isVoterElectionRolesOrderedAsc? 'asc':'desc';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.roles']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'voterElectionRole')} aria-expanded={this.props.containerCollapseStatus.voterElectionRole}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.voterElectionRole}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="voterElectionRolesSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="voterElectionRolesSearch"
                                            value={this.props.voterElectionRolesSearchValue} onChange={this.updateVoterElectionRolesSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1 hidden">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.roles.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.voterElectionRolesSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewVoterElectionRoles.bind(this)}>
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
                                            {this.voterElectionRolesRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showVoterElectionRolesModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        voterElectionRoles: state.system.lists.voterElectionRoles,
        voterElectionRolesSearchValue: state.system.listsScreen.voterTab.voterElectionRolesSearchValue,
        showVoterElectionRolesModalDialog: state.system.listsScreen.voterTab.showVoterElectionRolesModalDialog,
        voterElectionRolesKeyInSelectMode: state.system.listsScreen.voterTab.voterElectionRolesKeyInSelectMode,
        isVoterElectionRolesOrderedAsc: state.system.listsScreen.voterTab.isVoterElectionRolesOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isVoterElectionRolesInEditMode: state.system.listsScreen.voterTab.isVoterElectionRolesInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(VoterElectionRoles));