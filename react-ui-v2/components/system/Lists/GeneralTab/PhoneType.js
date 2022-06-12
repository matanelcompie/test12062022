import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import PhoneTypeRow from './PhoneTypeRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class PhoneType extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'סוג טלפון',
            addButtonTitle: 'הוספת סוג',
            searchTitle: 'חיפוש',
            nameTitle : 'סוג',
            modalWindowTitle:'מחיקת סוג',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הסוג הזה?'
        };
    }

    updatePhoneTypeSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_PHONE_TYPE_SEARCH_VALUE, value});
    }

    addNewPhoneType() {
        SystemActions.addPhoneType(store, this.props.phoneTypeSearchValue);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_PHONE_TYPES});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deletePhoneType(store,this.props.phoneTypeKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_PHONE_TYPE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.phoneTypeRows=this.props.phoneTypes
                .map(function(item){
                    if(item.name.indexOf(this.props.phoneTypeSearchValue)!=-1){
                        if(this.props.isPhoneTypeInEditMode && item.key === this.props.phoneTypeKeyInSelectMode){
                            /* EDIT MODE */
                            return <PhoneTypeRow key={item.key} item={item} isInEditMode={true} isNameExistInTheList={this.isNameExistInTheList.bind(this)}/>
                        }else{
                            /* DISPLAY MODE */
                            return <PhoneTypeRow key={item.key} item={item} isInEditMode={false} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                        }
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isPhoneTypeOrderedAsc? 'asc':'desc';
    }
        
    updateCollapseStatus(container){
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }
    
    isNameExistInTheList(name){
        var result=_.find(this.props.phoneTypes, ['name', name]);
        return(undefined==result)?false:true;
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.phone_types']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'phoneType')} aria-expanded={this.props.containerCollapseStatus.phoneType}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.phoneType}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="phoneTypeSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="phoneTypeSearch"
                                            value={this.props.phoneTypeSearchValue} onChange={this.updatePhoneTypeSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm"+ ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.phone_types.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.phoneTypeSearchValue.length >= 2) && (false==this.isNameExistInTheList(this.props.phoneTypeSearchValue)) ? "" : "disabled")} 
                                            onClick={this.addNewPhoneType.bind(this)}>
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
                                            {this.phoneTypeRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showPhoneTypeModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        phoneTypes: state.system.lists.phoneTypes,
        isPhoneTypeInEditMode: state.system.listsScreen.generalTab.isPhoneTypeInEditMode,
        phoneTypeSearchValue: state.system.listsScreen.generalTab.phoneTypeSearchValue,
        showPhoneTypeModalDialog: state.system.listsScreen.generalTab.showPhoneTypeModalDialog,
        phoneTypeKeyInSelectMode: state.system.listsScreen.generalTab.phoneTypeKeyInSelectMode,
        isPhoneTypeOrderedAsc: state.system.listsScreen.generalTab.isPhoneTypeOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser
    };
}
export default connect(mapStateToProps)(withRouter(PhoneType));