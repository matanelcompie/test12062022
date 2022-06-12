import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import VoterMetaValueRow from './VoterMetaValueRow';
import * as SystemActions from '../../../../../actions/SystemActions';
import store from '../../../../../store'
        import ModalWindow from '../../../../global/ModalWindow';

class VoterMetaValue extends React.Component {

    textIgniter() {
        this.textValues = {
            addButtonTitle: 'הוספת ערך',
            searchTitle: 'חיפוש',
            valueTitle: 'ערכים',
            modalWindowTitle: 'מחיקת ערך',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את הערך הזה?'
        };
    }

    updateVoterMetaValueSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATE_VOTER_META_VALUE_SEARCH_VALUE, value});
    }

    addNewVoterMetaValue() {
        const key = this.props.voterMetaKeyInSelectMode;
        const item = this.props.voterMetaValueInEditMode;
        SystemActions.addVoterMetaValue(store, item, key);
    }

    orderList() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.ORDER_VOTER_META_VALUES});
    }

    deleteModalDialogConfirm() {
        SystemActions.deleteVoterMetaValue(store, this.props.voterMetaValueKeyInSelectMode, this.props.voterMetaKeyInSelectMode);
        this.closeModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_VOTER_META_VALUE_MODAL_DIALOG_DISPLAY});
    }

    renderRows() {
        this.voterMetaValueRows = this.props.voterMetaValues
                .map(function (item) {
                    if (item.value.indexOf(this.props.voterMetaValueSearchValue) != -1) {
                        return <VoterMetaValueRow key={item.key} item={item} updateScrollPosition={this.updateScrollPosition.bind(this)} />
                    }
                }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isVoterMetaValueOrderedAsc ? 'asc' : 'desc';
    }

    displayActionTypeTopicsStatus() {
        return ((this.props.isVoterMetaKeyValuesDisplayed == true && this.props.isVoterMetaKeyInEditMode != true) ? '' : 'hidden');
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    updateScrollPosition() {
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition = this.self.scrollTop;
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition});
    }

    componentDidUpdate() {
        //after editing scroll back to the item position
        if (undefined != this.self && null != this.self && this.props.currentTableScrollerPosition > 0) {
            this.self.scrollTop = this.props.currentTableScrollerPosition;
        }
    }

    getKeyTextInputType() {
        return (this.props.voterMetaKeyTypeInSelectMode == 2 ? 'number' : 'text');
    }

    isValueValidToAdd() {
        if (this.props.voterMetaValueSearchValue.length >= 1 && this.props.voterMetaKeyTypeInSelectMode == 2) // number type
            return true;

        if (this.props.voterMetaValueSearchValue.length >= 2) // text type
            return true;

        return false;
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
                                <label htmlFor="voterMetaValueSearch" className="col-sm-2 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-sm-5">
                                    <input type={this.getKeyTextInputType()} className="form-control" placeholder={this.textValues.searchTitle} id="voterMetaValueSearch"
                                        value={this.props.voterMetaValueSearchValue} onChange={this.updateVoterMetaValueSearchValue.bind(this)}/>
                                </div>
                                <div className="col-sm-4">
                                    <button type="button" className="btn btn-primary btn-sm" disabled={(this.isValueValidToAdd() ? "" : "disabled")}
                                                onClick={this.addNewVoterMetaValue.bind(this)}>
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
                                        {this.voterMetaValueRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showVoterMetaValueModalDialog} buttonOk={this.deleteModalDialogConfirm.bind(this)} 
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
        voterMetaValues: state.system.lists.voterMetaValues,
        voterMetaValueSearchValue: state.system.listsScreen.voterTab.voterMetaValueSearchValue,
        showVoterMetaValueModalDialog: state.system.listsScreen.voterTab.showVoterMetaValueModalDialog,
        voterMetaValueKeyInSelectMode: state.system.listsScreen.voterTab.voterMetaValueKeyInSelectMode,
        isVoterMetaValueOrderedAsc: state.system.listsScreen.voterTab.isVoterMetaValueOrderedAsc,
        voterMetaValueOrderColumn: state.system.listsScreen.voterTab.voterMetaValueOrderColumn,
        isVoterMetaKeyValuesDisplayed: state.system.listsScreen.voterTab.isVoterMetaKeyValuesDisplayed,
        voterMetaValueInEditMode: state.system.listsScreen.voterTab.voterMetaValueInEditMode,
        voterMetaKeyInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyInSelectMode,
        isVoterMetaKeyInEditMode: state.system.listsScreen.voterTab.isVoterMetaKeyInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        voterMetaKeyTypeInSelectMode: state.system.listsScreen.voterTab.voterMetaKeyTypeInSelectMode,
    };
}
export default connect(mapStateToProps)(withRouter(VoterMetaValue));