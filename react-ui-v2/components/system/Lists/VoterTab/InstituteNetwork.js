import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import InstituteNetworkRow from './InstituteNetworkRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store';
import ModalWindow from '../../../global/ModalWindow';

class InstituteNetwork extends React.Component {

    textIgniter() {
        this.textValues = {
            listTitle: 'רשת מוסד',
            addButtonTitle: 'הוספת רשת',
            searchTitle: 'חיפוש',
            metaName: 'שם רשת',
            modalWindowTitle: 'מחיקת רשת',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הרשת הזו?'
        };
    }

    updateInstituteNetworkSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_INSTITUTE_NETWORK_SEARCH_VALUE, value});
    }

    addNewInstituteNetwork() {
        SystemActions.addInstituteNetwork(store, this.props.instituteNetworkSearchValue);
    }

    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_INSTITUTE_NETWORK,orderColumn});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteInstituteNetwork(store, this.props.instituteNetworkInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_INSTITUTE_NETWORK_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.instituteNetworkRows = this.props.instituteNetworks
                .map(function (item) {
                    if (item.name.indexOf(this.props.instituteNetworkSearchValue) != -1) {
                        return <InstituteNetworkRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isInstituteNetworkOrderedAsc ? 'asc' : 'desc';
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
        const container='instituteNetwork';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.networks']) ? '' : ' hidden')}>
                    <div className="row">
                        <div className="col-md-6">
                            <a onClick={this.updateCollapseStatus.bind(this,'instituteNetwork')} aria-expanded={this.props.containerCollapseStatus.instituteNetwork}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                    </div>     
                    <Collapse isOpened={this.props.containerCollapseStatus.instituteNetwork}>
                        <div className='row CollapseContent'>
                            <div className='col-md-8'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="instituteNetworkSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-sm-5">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="instituteNetworkSearch"
                                                        value={this.props.instituteNetworkSearchValue} onChange={this.updateInstituteNetworkSearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.elections.institute.networks.add']) ? '' : ' hidden')} 
                                                        disabled={(this.props.instituteNetworkSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewInstituteNetwork.bind(this)}>
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
                                                        <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                            {this.textValues.metaName}&nbsp;
                                                            <i className={this.props.instituteNetworkOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)}>
                                                {this.instituteNetworkRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showInstituteNetworkModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
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
        instituteNetworks: state.system.lists.instituteNetworks,
        instituteNetworkSearchValue: state.system.listsScreen.voterTab.instituteNetworkSearchValue,
        showInstituteNetworkModalDialog: state.system.listsScreen.voterTab.showInstituteNetworkModalDialog,
        instituteNetworkInSelectMode: state.system.listsScreen.voterTab.instituteNetworkInSelectMode,
        isInstituteNetworkOrderedAsc: state.system.listsScreen.voterTab.isInstituteNetworkOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        instituteNetworkOrderColumn: state.system.listsScreen.voterTab.instituteNetworkOrderColumn,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(InstituteNetwork));