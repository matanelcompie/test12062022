import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import CsvSourceRow from './CsvSourceRow';
import * as SystemActions from 'actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';

class CsvSource extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'מקור הנתונים',
            addButtonTitle: 'הוספת מקור',
            searchTitle: 'חיפוש',
            nameTitle : 'מקור',
            modalWindowTitle:'מחיקת מקור',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את המקור הזה?'
        };
    }

    updateCsvSourceSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_CSV_SOURCE_SEARCH_VALUE, value});
    }

    addNewCsvSource() {
        SystemActions.addCsvSource(this.props.dispatch, this.props.csvSourceSearchValue);
    }
    
    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_CSV_SOURCE});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteCsvSource(this.props.dispatch,this.props.csvSourceKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_CSV_SOURCE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.csvSourceRows=this.props.csvSource
                .map(function(item){
                    if(item.name.indexOf(this.props.csvSourceSearchValue)!=-1){
                        return <CsvSourceRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isCsvSourceOrderedAsc? 'asc':'desc';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.csv_sources']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'csvSource')} aria-expanded={this.props.containerCollapseStatus.csvSource}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.csvSource}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="csvSourceSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="csvSourceSearch"
                                            value={this.props.csvSourceSearchValue} onChange={this.updateCsvSourceSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.csv_sources.add']) ? '' : ' hidden')} 
                                            disabled={(this.props.csvSourceSearchValue.length >= 2 ? "" : "disabled")} onClick={this.addNewCsvSource.bind(this)}>
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
                                            {this.csvSourceRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showCsvSourceModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        csvSource: state.system.lists.csvSource,
        csvSourceSearchValue: state.system.listsScreen.voterTab.csvSourceSearchValue,
        showCsvSourceModalDialog: state.system.listsScreen.voterTab.showCsvSourceModalDialog,
        csvSourceKeyInSelectMode: state.system.listsScreen.voterTab.csvSourceKeyInSelectMode,
        isCsvSourceOrderedAsc: state.system.listsScreen.voterTab.isCsvSourceOrderedAsc,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isCsvSourceInEditMode: state.system.listsScreen.voterTab.isCsvSourceInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(CsvSource));