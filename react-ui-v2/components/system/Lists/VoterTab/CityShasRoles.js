import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import CityShasRoleRow from './CityShasRoleRow';
import * as SystemActions from 'actions/SystemActions';
import store from 'store'
import ModalWindow from 'components/global/ModalWindow';

class CityShasRoles  extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'תפקידי שס בעיר',
            addButtonTitle: 'הוספת תפקיד',
            searchTitle: 'חיפוש',
            nameTitle : 'תפקיד',
            modalWindowTitle:'מחיקת תפקיד',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את התפקיד הזה?'
        };
    }

    updateCityShasSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CITY_SHAS_ROLES_SEARCH_VALUE, value}); 
    }

    addNewCityShas() { 
        SystemActions.addCityShasRole(store, this.props.cityShasSearchValue); 
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_CITY_SHAS_ROLES}); 
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteCityShasRole(store,this.props.cityShasKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CITY_SHAS_ROLES_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.cityShasRows = this.props.cityShasRoles
                .map(function(item){
                    if(item.name.indexOf(this.props.cityShasSearchValue)!=-1){
                        return <CityShasRoleRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isCityShasOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false == this.props.dirty){
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

    isNameExistInTheList(){
        var result=_.find(this.props.cityShasRoles, ['name', this.props.cityShasSearchValue]);
        return(undefined==result)?false:true;
    }
    
    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.city_shas_roles']) ? '' : ' hidden')}> 
                    <a onClick={this.updateCollapseStatus.bind(this,'CityShasRole')} aria-expanded={this.props.containerCollapseStatus.CityShasRole}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.CityShasRole}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="cityShasSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="cityShasSearch"
                                            value={this.props.cityShasSearchValue} onChange={this.updateCityShasSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.city_shas_roles.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.cityShasSearchValue.length >= 2 && !this.isNameExistInTheList()) ? "" : "disabled")} onClick={this.addNewCityShas.bind(this)}>
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
                                            {this.cityShasRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showCityShasModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        cityShasRoles: state.system.lists.cityShasRoles,
        cityShasSearchValue: state.system.listsScreen.voterTab.cityShasSearchValue,
        showCityShasModalDialog: state.system.listsScreen.voterTab.showCityShasModalDialog,
        cityShasKeyInSelectMode: state.system.listsScreen.voterTab.cityShasKeyInSelectMode,
        isCityShasOrderedAsc: state.system.listsScreen.voterTab.isCityShasOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isCityShasInEditMode: state.system.listsScreen.voterTab.isCityShasInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(CityShasRoles));