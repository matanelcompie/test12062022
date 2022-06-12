import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import StreetRow from './StreetRow';
import * as SystemActions from '../../../../actions/SystemActions';
import ModalWindow from '../../../global/ModalWindow';
import Combo from '../../../global/Combo';

class Street extends React.Component {

    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues = {
            listTitle: 'רחובות',
            addButtonTitle: 'הוספת רחוב',
            searchTitle: 'חיפוש',
            nameTitle: 'רחוב',
            miIdTitle: 'קוד רחוב',
            cityLabel: 'עיר',
            modalWindowTitle: 'מחיקת רחוב',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הרחוב הזה?',
            streetNameIsSmall: 'שם רחוב קצר מדי',
            saveTitle: 'שמירה',
            cancelTitle: 'ביטול',
            miIdIsmissing: 'חסר קוד רחוב',
            miIdIsAlreadyExist: 'קוד רחוב קיים',
        };
    }

    updateStreetSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_STREET_SEARCH_VALUE, value});
    }

    addNewStreet() {
        const event = 'add';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_STREET_MODE_UPDATED, event});
    }

    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_STREETS, orderColumn});
    }

    deleteStreetConfirm() {
        SystemActions.deleteStreet(this.props.dispatch, this.props.streetKeyInSelectMode, this.props.streetCityKey);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_STREET_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.streetRows = this.props.streets
                .map(function (item) {
                    if (item.name.indexOf(this.props.streetSearchValue) != -1) {
                        return <StreetRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isStreetsOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container) {
        if (false == this.props.dirty) {
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container});
        }else{
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY});
        }
    }

    comboChange(el) {
        if (el.target.selectedItem) {
            let item = el.target.selectedItem;
            SystemActions.loadStreets(this.props.dispatch, item.city_key);
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_STREETS, id: item.city_id, key: item.city_key});
        } else {
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.RESET_STREETS_LIST});
        }
    }

    updateRowText(key, e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.STREET_EDIT_VALUE_CHANGED, key, value});
        
        if(key=='mi_id'){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.STREET_MIID_VALUE_CHANGED});
        }
    }

    cancelAddMode() {
        const event = 'cancel';
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ADD_STREET_MODE_UPDATED, event});
    }

    saveEdit() {
        SystemActions.addStreet(this.props.dispatch, this.props.streetInEditMode, this.props.streetCityKey);
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    componentDidUpdate() {
        const container='street';
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
        return this.props.tableHasScrollbar.street? {width: this.props.scrollbarWidth + 'px', borderRight: 'none'} : {display: 'none'};
    }
    
    updateScrollPosition(){
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition=this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }

    render() {
        this.renderRows();
        this.setOrderDirection();

        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.streets']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'street')} aria-expanded={this.props.containerCollapseStatus.street}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.street}>
                        <div className="CollapseContent">
                            <div className="row form-group">
                                <label htmlFor="selectCity" className="col-md-1 control-label">{this.textValues.cityLabel}</label>
                                <div className="col-md-5">
                                    <Combo className="input-group" items={this.props.cities} maxDisplayItems={10} itemIdProperty="city_key" itemDisplayProperty='city_name'
                                        defaultValue='' onChange={this.comboChange.bind(this)} idForLabel="selectCity" />
                                </div>
                            </div>

                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="streetSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="streetSearch"
                                               value={this.props.streetSearchValue} onChange={this.updateStreetSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" onClick={this.addNewStreet.bind(this)}
                                            className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.streets.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.streetCityKey !=-1 && this.props.streetSearchValue.length >= 2) ? "" : "disabled")}>
                                            <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                            <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className={"well well-sm" + (this.props.isStreetInAddMode ? "" : " hidden")}>
                                <div className="row form-horizontal">
                                    <div className="col-md-1"></div>
                                    <div className="col-md-3">
                                        <div className='row'>
                                            <div className={"form-group" + (this.props.streetInEditMode.name.length >= 2 ? '' : ' has-error')}>
                                                <label htmlFor="streetName" className="col-md-4 control-label">{this.textValues.nameTitle}</label>
                                                <div className="col-md-8">
                                                    <input type="text" className="form-control" id="streetName"
                                                           value={this.props.streetInEditMode.name} onChange={this.updateRowText.bind(this,'name')}/>
                                                    <span className={"help-block" + (this.props.streetInEditMode.name.length >=2 ? ' not-visible' : '')}>
                                                            {this.textValues.streetNameIsSmall}
                                                        </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-1"></div>
                                    <div className="col-md-3">
                                        <div className='row'>
                                            <div className={"form-group"+ (!this.props.isStreetMiIDValid ? ' has-error' : '')}>
                                                <label htmlFor="streetMiId" className="col-md-4 control-label">{this.textValues.miIdTitle}</label>
                                                <div className="col-md-8">
                                                    <input type="text" className="form-control" id="streetMiId"
                                                           value={this.props.streetInEditMode.mi_id} onChange={this.updateRowText.bind(this,'mi_id')}/>
                                                    <span className={"help-block" + (!this.props.isStreetMiIDValid ? '' : ' not-visible')}>
                                                        {this.props.streetInEditMode.mi_id ? this.textValues.miIdIsAlreadyExist : this.textValues.miIdIsmissing}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <span className="edit-buttons">
                                            <button type="button" className="btn btn-success btn-xs" disabled={((this.props.isStreetMiIDValid && this.props.streetInEditMode.name.length >= 2) ? "" : "disabled")}
                                                    onClick={this.saveEdit.bind(this)} title={this.textValues.saveTitle}>
                                                <i className="fa fa-floppy-o"></i>
                                            </button>
                                            &nbsp;
                                            <button type="button" className="btn btn-danger btn-xs" onClick={this.cancelAddMode.bind(this)} title={this.textValues.cancelTitle}>
                                                    <i className="fa fa-times"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-5">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.streetOrderColumn === 'name' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={{borderLeft:'none'}}>
                                                    <span onClick={this.orderList.bind(this,'mi_id')} className="cursor-pointer">
                                                        {this.textValues.miIdTitle}&nbsp;
                                                        <i className={this.props.streetOrderColumn === 'mi_id' ? ('fa fa-1x fa-sort-' + this.orderDirection) : ''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th style={this.getScrollHeaderStyle()}></th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.streetRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showStreetModalDialog} buttonOk={this.deleteStreetConfirm.bind(this)} 
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
        cities: state.system.lists.cities,
        streets: state.system.lists.streets,
        isStreetInEditMode: state.system.listsScreen.generalTab.isStreetInEditMode,
        streetSearchValue: state.system.listsScreen.generalTab.streetSearchValue,
        isStreetsOrderedAsc: state.system.listsScreen.generalTab.isStreetsOrderedAsc,
        showStreetModalDialog: state.system.listsScreen.generalTab.showStreetModalDialog,
        streetKeyInSelectMode: state.system.listsScreen.generalTab.streetKeyInSelectMode,
        streetCityKey: state.system.listsScreen.generalTab.streetCityKey,
        streetInEditMode: state.system.listsScreen.generalTab.streetInEditMode,
        isStreetInAddMode: state.system.listsScreen.generalTab.isStreetInAddMode,
        streetOrderColumn: state.system.listsScreen.generalTab.streetOrderColumn,
        isStreetMiIDValid: state.system.listsScreen.generalTab.isStreetMiIDValid,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        tableHasScrollbar: state.system.listsScreen.tableHasScrollbar,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser,
        scrollbarWidth: state.system.scrollbarWidth,
    };
}
export default connect(mapStateToProps)(withRouter(Street));