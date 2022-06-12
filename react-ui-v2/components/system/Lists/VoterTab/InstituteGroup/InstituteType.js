import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import InstituteTypeRow from './InstituteTypeRow';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
import ModalWindow from '../../../../global/ModalWindow';

class InstituteType extends React.Component {

    textIgniter() {
        this.textValues={
            addButtonTitle: 'הוספת סוג מוסד',
            searchTitle: 'חיפוש',
            valueTitle : 'סוג',
            modalWindowTitle:'מחיקת סוג',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הסוג הזה?'
        };
    }

    updateInstituteTypeSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_TYPE_SEARCH_VALUE, value});
    }

    addNewInstituteType() {
        const key=this.props.instituteGroupInSelectMode;
        const item=this.props.instituteTypeInEditMode;
        SystemActions.addInstituteType(store, item, key);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_TYPE});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteInstituteType(store,this.props.instituteTypeKeyInSelectMode, this.props.instituteGroupInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_TYPE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.instituteTypeRows=this.props.instituteTypes
                .map(function(item){
                    if(item.name.indexOf(this.props.instituteTypeSearchValue)!=-1){
                        return <InstituteTypeRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isInstituteTypeOrderedAsc? 'asc':'desc';
    }
    
    displayActionTypeTopicsStatus(){
        return (((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.types'])) &&(this.props.isInstituteGroupValuesDisplayed==true && this.props.isInstituteGroupInEditMode!=true)?'':'hidden');
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
                <div className={this.displayActionTypeTopicsStatus()}>
                    <div>
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="instituteTypeSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-sm-5">
                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="instituteTypeSearch"
                                        value={this.props.instituteTypeSearchValue} onChange={this.updateInstituteTypeSearchValue.bind(this)}/>
                                </div>
                                <div className="col-sm-4">
                                    <button type="button" className="btn btn-primary btn-sm" disabled={(this.props.instituteTypeSearchValue.length >= 2 ? "" : "disabled")}
                                                onClick={this.addNewInstituteType.bind(this)}>
                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                            <span>{this.textValues.addButtonTitle}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="row">
                            <div className="col-md-11">
                                <table className="table table-bordered table-striped table-hover lists-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <span onClick={this.orderList.bind(this)} className="cursor-pointer">
                                                    {this.textValues.valueTitle}&nbsp;
                                                    <i className={'fa fa-1x fa-sort-'+this.orderDirection} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody ref={this.getRef.bind(this)}>
                                        {this.instituteTypeRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showInstituteTypeModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle}>
                                    <div>{this.textValues.modalWindowBody}</div>
                                </ModalWindow>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        instituteTypes: state.system.lists.instituteTypes,
        instituteTypeSearchValue: state.system.listsScreen.voterTab.instituteTypeSearchValue,
        showInstituteTypeModalDialog: state.system.listsScreen.voterTab.showInstituteTypeModalDialog,
        instituteTypeKeyInSelectMode: state.system.listsScreen.voterTab.instituteTypeKeyInSelectMode,
        isInstituteTypeOrderedAsc: state.system.listsScreen.voterTab.isInstituteTypeOrderedAsc,
        instituteTypeOrderColumn: state.system.listsScreen.voterTab.instituteTypeOrderColumn,
        isInstituteGroupValuesDisplayed: state.system.listsScreen.voterTab.isInstituteGroupValuesDisplayed,
        instituteTypeInEditMode: state.system.listsScreen.voterTab.instituteTypeInEditMode,
        instituteGroupInSelectMode: state.system.listsScreen.voterTab.instituteGroupInSelectMode,
        isInstituteGroupInEditMode: state.system.listsScreen.voterTab.isInstituteGroupInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteType));