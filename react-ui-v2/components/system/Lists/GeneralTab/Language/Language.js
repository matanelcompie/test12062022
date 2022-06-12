import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import LanguageRow from './LanguageRow';
import * as SystemActions from '../../../../../actions/SystemActions';
import ModalWindow from '../../../../global/ModalWindow';

class Language extends React.Component {

    textIgniter() {
        this.textValues={
            listTitle: 'שפות',
            addButtonTitle: 'הוספת שפה',
            searchTitle: 'חיפוש',
            nameTitle : 'שפה',
            mainTitle : 'ראישית',
            modalWindowTitle:'מחיקת שפה',
            modalWindowBody:'האם אתה בטוח שאתה רוצה למחוק את השפה הזה?'
        };
    }

    updateLanguageSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_LANGUAGE_SEARCH_VALUE, value});
    }

    addNewLanguage() {
        SystemActions.addLanguage(this.props.dispatch, this.props.languageSearchValue);
    }
    
    orderList(orderColumn) {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_LANGUAGES,orderColumn});
    }
    
    deleteModalDialogConfirm(){
        SystemActions.deleteLanguage(this.props.dispatch,this.props.languageKeyInSelectMode);
        this.closeModalDialog();
    }
    
    closeModalDialog(){
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_LANGUAGE_MODAL_DIALOG_DISPLAY});
    }
    
    renderRows(){
        this.languageRows=this.props.languages
                .map(function(item){
                    if(item.name.indexOf(this.props.languageSearchValue)!=-1){
                        let isInEditMode =(this.props.isLanguageInEditMode && item.key === this.props.languageKeyInSelectMode)?true:false;
                            return <LanguageRow key={item.key} item={item} isInEditMode={isInEditMode} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                },this);
    }
    
    setOrderDirection(){
        this.orderDirection=this.props.isLanguageOrderedAsc? 'asc':'desc';
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
                <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.languages']) ? '' : ' hidden')}>
                    <a onClick={this.updateCollapseStatus.bind(this,'language')} aria-expanded={this.props.containerCollapseStatus.language}>
                        <div className="collapseArrow closed"></div>
                        <div className="collapseArrow open"></div>
                        <span className="collapseTitle">{this.textValues.listTitle}</span>
                    </a>
                    <Collapse isOpened={this.props.containerCollapseStatus.language}>
                        <div className="CollapseContent">
                            <form className="form-horizontal">
                                <div className="form-group">
                                    <label htmlFor="languageSearch" className="col-sm-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-sm-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="languageSearch"
                                            value={this.props.languageSearchValue} onChange={this.updateLanguageSearchValue.bind(this)}/>
                                    </div>
                                    <div className="col-sm-1">
                                        <button type="button" className={"btn btn-primary btn-sm"+ ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.languages.add']) ? '' : ' hidden')} 
                                            disabled={((this.props.languageSearchValue.length >= 2)? "" : "disabled")} 
                                            onClick={this.addNewLanguage.bind(this)}>
                                                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.addButtonTitle}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="row">
                                <div className="col-md-1"></div>
                                <div className="col-md-7">
                                    <table className="table table-bordered table-striped table-hover lists-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'name')} className="cursor-pointer">
                                                        {this.textValues.nameTitle}&nbsp;
                                                        <i className={this.props.languageOrderColumn==='name'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                                <th>
                                                    <span onClick={this.orderList.bind(this,'main')} className="cursor-pointer">
                                                        {this.textValues.mainTitle}&nbsp;
                                                        <i className={this.props.languageOrderColumn==='main'?('fa fa-1x fa-sort-'+this.orderDirection):''} aria-hidden="true"></i>
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody ref={this.getRef.bind(this)}>
                                            {this.languageRows}
                                        </tbody>
                                    </table>
                                    <ModalWindow show={this.props.showLanguageModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        languages: state.system.lists.languages,
        isLanguageInEditMode: state.system.listsScreen.generalTab.isLanguageInEditMode,
        languageSearchValue: state.system.listsScreen.generalTab.languageSearchValue,
        showLanguageModalDialog: state.system.listsScreen.generalTab.showLanguageModalDialog,
        languageKeyInSelectMode: state.system.listsScreen.generalTab.languageKeyInSelectMode,
        isLanguageOrderedAsc: state.system.listsScreen.generalTab.isLanguageOrderedAsc,
        languageOrderColumn: state.system.listsScreen.generalTab.languageOrderColumn,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        dirty: state.system.listsScreen.dirty,
        currentUser: state.system.currentUser
    };
}
export default connect(mapStateToProps)(withRouter(Language));