import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import CountryRow from './CountryRow';
import * as SystemActions from '../../../../actions/SystemActions';
import store from '../../../../store'
import ModalWindow from '../../../global/ModalWindow';

class Country extends React.Component {
    
    constructor(props) {
        super(props);
        this.textIgniter();
    }

    textIgniter() {
        this.textValues={
            listTitle:'ארצות',
            addButtonTitle: 'הוספת מדינה',
            searchTitle: 'חיפוש',
            nameTitle : 'ארץ',
            modalWindowTitle:'מחיקת ארץ',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את הארץ הזו?'
        };
    }
    
    updateCountrySearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_COUNTRY_SEARCH_VALUE, value});
    }

    addNewCountry() {
        SystemActions.addCountry(store, this.props.countrySearchValue);
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_COUNTRIES});
    }
    
    deleteCountryConfirm(){
        SystemActions.deleteCountry(store,this.props.countryKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        if(false==this.props.isCountryInEditMode){
            this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_COUNTRY_MODAL_DIALOG_DISPLAY});
        }
    }
    
    renderRows(){
        this.countryRows=this.props.countries
                .map(function(item){
                    if(item.name.indexOf(this.props.countrySearchValue)!=-1){
                        return <CountryRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isCountriesOrderedAsc? 'asc':'desc';
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
        this.renderRows();
        this.setOrderDirection();
        
        return (
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.countries']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'country')} aria-expanded={this.props.containerCollapseStatus.country}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.country}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="countrySearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="countrySearch"
                                               value={this.props.countrySearchValue} onChange={this.updateCountrySearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.countries.add']) ? '' : ' hidden')} 
                                        disabled={(this.props.countrySearchValue.length >= 2 ? "" : "disabled")}
                                                onClick={this.addNewCountry.bind(this)}>
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
                                            {this.countryRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showCountryModalDialog} buttonOk={this.deleteCountryConfirm.bind(this)} 
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
        countries: state.system.lists.countries,
        countrySearchValue: state.system.listsScreen.generalTab.countrySearchValue,
        isCountriesOrderedAsc: state.system.listsScreen.generalTab.isCountriesOrderedAsc,
        showCountryModalDialog: state.system.listsScreen.generalTab.showCountryModalDialog,
        countryKeyInSelectMode: state.system.listsScreen.generalTab.countryKeyInSelectMode,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isCountryInEditMode: state.system.listsScreen.generalTab.isCountryInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(Country));