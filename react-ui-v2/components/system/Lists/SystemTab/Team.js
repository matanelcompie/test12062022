import React from 'react';
import { connect } from 'react-redux';
import { withRouter, router } from 'react-router';
import Collapse from 'react-collapse';

import TeamRow from './TeamRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class Team extends React.Component {
    textIgniter() {
        this.textValues={
            listTitle: 'צוותים',
            addButtonTitle: 'הוספת צוות',
            searchTitle: 'חיפוש',
            nameTitle : 'שם צוות',
            leaderNameTitle : 'ראש צוות',
            modalWindowTitle:'מחיקת צוות',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הצוות הזו?'
        };
    }

    updateTeamSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_TEAM_SEARCH_VALUE, value});
    }

    addNewTeam() {
        this.props.router.push('/system/teams/');
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_TEAMS, orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteTeam(store,this.props.teamKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_TEAM_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.teamRows=this.props.teams
                .map(function(item){
                    if(item.name.indexOf(this.props.teamSearchValue)!=-1){
                        return <TeamRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isTeamOrderedAsc? 'asc':'desc';
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

    componentDidUpdate() {
        const container='team';
        let hasScrollbar=false;
        
        if (undefined!= this.self&& null !=this.self) {
            hasScrollbar=this.self.scrollHeight > this.self.clientHeight ?true:false;
        }
        
        if(hasScrollbar!=this.props.tableHasScrollbar[container]){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TABLE_CONTENT_UPDATED, container, hasScrollbar});
        }
        
        //after editing scroll back to the item position
        if (undefined!= this.self&& null !=this.self && this.props.currentTableScrollerPosition>0) {
            this.self.scrollTop=this.props.currentTableScrollerPosition;
        }
    }
    
    getScrollHeaderStyle(){
        return this.props.tableHasScrollbar.team? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.teams']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'team')} aria-expanded={this.props.containerCollapseStatus.team}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.team}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="teamSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="teamSearch"
                                            value={this.props.teamSearchValue} onChange={this.updateTeamSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.system.teams.add']) ? '' : ' hidden')} 
                                        onClick={this.addNewTeam.bind(this)} disabled={(this.props.teamSearchValue.length >= 2 ? "" : "disabled")}>
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
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.teamOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={{borderLeft:'none'}}>
                                                    <span onClick={this.orderList.bind(this,'leader_first_name')} className="cursor-pointer">
                                                        {this.textValues.leaderNameTitle}&nbsp;
                                                        <i className={this.props.teamOrderColumn==='leader_first_name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={this.getScrollHeaderStyle()}></th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.teamRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showTeamModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        teams: state.system.lists.teams,
        teamSearchValue: state.system.listsScreen.systemTab.teamSearchValue,
        showTeamModalDialog: state.system.listsScreen.systemTab.showTeamModalDialog,
        teamKeyInSelectMode: state.system.listsScreen.systemTab.teamKeyInSelectMode,
        isTeamOrderedAsc: state.system.listsScreen.systemTab.isTeamOrderedAsc,
        teamOrderColumn: state.system.listsScreen.systemTab.teamOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        scrollbarWidth: state.system.scrollbarWidth,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(Team));