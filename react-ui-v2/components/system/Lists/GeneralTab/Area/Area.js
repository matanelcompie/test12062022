import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import AreaRow from './AreaRow';
import SubAreas from './SubArea';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store';
import ModalWindow from '../../../../global/ModalWindow';

class Area extends React.Component {

    textIgniter() {
        this.textValues = {
            subAreaListTitle: 'תת אזור',
            listTitle: 'אזורים',
            addButtonTitle: 'הוספת אזור',
            searchTitle: 'חיפוש',
            nameTitle: 'אזור',
            modalWindowTitle: 'מחיקת אזור',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את האזור הזה?'
        };
    }

    updateAreaSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_AREA_SEARCH_VALUE, value});
    }

    addNewArea() {
        SystemActions.addArea(store, this.props.areaSearchValue);
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_AREAS});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteArea(store, this.props.areaKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_AREA_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.areaRows = this.props.areas
                .map(function (item) {
                    if (item.name.indexOf(this.props.areaSearchValue) != -1) {
                        return <AreaRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
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

    setOrderDirection() {
        this.orderDirection = this.props.isAreaOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container) {
        if(false==this.props.dirty){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }

    render() {
        this.textIgniter();
        this.renderRows();
        this.setOrderDirection();

        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas']) ? '' : ' hidden')}>
                            <div className="row">
                        <div className="col-md-6">
                            <a onClick={this.updateCollapseStatus.bind(this,'area')} aria-expanded={this.props.containerCollapseStatus.area}>
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <span className="collapseTitle">{this.textValues.listTitle}</span>
                            </a>
                        </div>
                        <div className={"col-md-6 collapseTitle"+(true == this.props.containerCollapseStatus.area && true == this.props.isSubAreasDisplayed && false==this.props.isAreaInEditMode?"":" hidden")}>
                            {this.textValues.subAreaListTitle + ' - '+ this.props.areaNameInSelectMode}
                        </div>
                    </div>            
                    <Collapse isOpened={this.props.containerCollapseStatus.area}>
                        <div className='row CollapseContent'>
                            <div className='col-md-6'>
                                <div className="row">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-11">
                                        <form className="form-horizontal">
                                            <div className="form-group">
                                                <label htmlFor="areaSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                                <div className="col-sm-5">
                                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="areaSearch"
                                                        value={this.props.areaSearchValue} onChange={this.updateAreaSearchValue.bind(this)}/>
                                                </div>
                                                <div className="col-sm-4">
                                                    <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.add']) ? '' : ' hidden')} 
                                                    disabled={(this.props.areaSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewArea.bind(this)}>
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
                                                        <span onClick={this.orderList.bind(this)} className="cursor-pointer">
                                                            {this.textValues.nameTitle}&nbsp;
                                                            <i className={'fa fa-1x fa-sort-'+this.orderDirection} aria-hidden="true"></i>
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody ref={this.getRef.bind(this)}>
                                                {this.areaRows}
                                            </tbody>
                                        </table>
                                        <ModalWindow show={this.props.showAreaModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} buttonX={this.closeModalDialog.bind(this)} 
                                        buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle}>
                                            <div>{this.textValues.modalWindowBody}</div>
                                        </ModalWindow>
                                    </div>
                                </div>
                            </div>
                            <div className={'col-md-6' + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.areas.sub_areas']) ? '' : ' hidden')}>
                                <SubAreas />
                            </div>
                        </div>
                    </Collapse>
                </div>
                );
    }
}

function mapStateToProps(state) {
    return {
        isAreaInEditMode: state.system.listsScreen.generalTab.isAreaInEditMode,
        areas: state.system.lists.areas,
        areaSearchValue: state.system.listsScreen.generalTab.areaSearchValue,
        showAreaModalDialog: state.system.listsScreen.generalTab.showAreaModalDialog,
        areaKeyInSelectMode: state.system.listsScreen.generalTab.areaKeyInSelectMode,
        areaNameInSelectMode: state.system.listsScreen.generalTab.areaNameInSelectMode,
        isAreaOrderedAsc: state.system.listsScreen.generalTab.isAreaOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        isSubAreasDisplayed: state.system.listsScreen.generalTab.isSubAreasDisplayed,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(Area));