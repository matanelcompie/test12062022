import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import NeighborhoodRow from './NeighborhoodRow';
import NeighborhoodClusterRow from './NeighborhoodClusterRow';
import UpdateNeighborhoodClustersPrefixModal from './modals/UpdateNeighborhoodClustersPrefixModal';
import UpdateCityClustersPrefixModal from './modals/UpdateCityClustersPrefixModal';
import TransferClustersModal from './modals/TransferClustersModal';
import * as SystemActions from 'actions/SystemActions';
import store from 'store';
import ModalWindow from 'components/global/ModalWindow';
import Combo from 'components/global/Combo';

class Neighborhood extends React.Component {
    initState = {
        clusterToEditHash: {},
        clusterEditRowIndex: null,
        selectedCity: null,
        checkAllButton: false
    }
    constructor(props) {
        super(props);
        this.state = { ...this.initState }
        this.clusterSelectedKeyList = [];
        this.textIgniter();
    }
    textIgniter() {
        this.textValues = {
            listTitle: 'שכונות',
            addButtonTitle: 'הוספת שכונה',
            searchTitle: 'חיפוש',
            nameTitle: 'שכונה',
            cityLabel: 'עיר',
            clusterLabel: 'אשכול',
            clusterAddButtonTitle: 'שייך אשכול',
            modalWindowTitle: 'מחיקת שכונה',
            modalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את השכונה הזו?',
            clusterModalWindowTitle: 'מחיקת אשכול',
            clusterModalWindowBody: 'האם אתה בטוח שאתה רוצה למחוק את האשכול הזו?',
        };
        this.updateCityClustersOptions = [
            { name: 'עדכן תחילית לכל אשכולות העיר לפי שם השכונה', 'id': '1' }
        ];
        this.updateClustersOptions = [
            { name: 'עדכן תחילית לאשכולות הנבחרים', 'id': '1' },
            { name: 'העבר אשכולות הנבחרים מהשכונה', 'id': '2' }
        ];
        this.modalsTitles = {
            cityClusterModal: 'עדכן תחילית לכל אשכולות העיר לפי שם השכונה',
        }
        this.neighborhoodClustersModalTexts = {
            'updateAllClustersPrefixComment': 'התחילית תתוסף לשפם האשכול וביניהם יתווסף תו רווח אחד',
            'clearAllClustersPrefix': 'איפוס שמות כל האשכולות',
        }
    }
    componentWillReceiveProps(nextProps) {
        let newState = { ...this.state };
        if (this.props.neighborhoodKeyInSelectMode != nextProps.neighborhoodKeyInSelectMode) {
            newState.clusterToEditHash = {};
            newState.clusterEditRowIndex = null;
            newState.checkAllButton = false;
            this.clusterSelectedKeyList = [];
            
            // newState.updateClustersOptions = this.updateClustersOptionsDefault;
            this.setState(newState)
        }
    }
    updateNeighborhoodSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.UPDATE_NEIGHBORHOOD_SEARCH_VALUE, value });
    }

    updateNeighborhoodClusterSearchValue(e) {
        const value = e.target.value;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.UPDATE_NEIGHBORHOOD_CLUSTER_SEARCH_VALUE, value });
    }

    addNewNeighborhood() {
        SystemActions.addNeighborhood(store, this.props.neighborhoodInEditMode, this.props.neighborhoodCityKey);
    }

    addNewNeighborhoodCluster() {
        SystemActions.addNeighborhoodClusters(store, this.props.neighborhoodKeyInSelectMode, { clusterKey: this.props.neighborhoodClusterKeyInEditMode });
    }

    orderList() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.ORDER_NEIGHBORHOODS });
    }

    orderClustersList() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.ORDER_NEIGHBORHOOD_CLUSTERS,changeOrder:true });
    }

    deleteNeighborhoodConfirm() {
        SystemActions.deleteNeighborhood(store, this.props.neighborhoodKeyInSelectMode, this.props.neighborhoodCityKey);
        this.closeModalDialog();
    }

    deleteNeighborhoodClusterConfirm() {
        SystemActions.deleteNeighborhoodCluster(store, this.props.neighborhoodKeyInSelectMode, this.props.neighborhoodClusterKeyInEditMode);
        this.closeClusterModalDialog();
    }

    closeModalDialog() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_NEIGHBORHOOD_MODAL_DIALOG_DISPLAY });
    }

    closeClusterModalDialog() {
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DELETE_NEIGHBORHOOD_CLUSTER_MODAL_DIALOG_DISPLAY });
    }
    getAllClustersWithOutNeighborhood(){
        SystemActions.loadCityClusters(store.dispatch, this.props.neighborhoodCityKey);
        this.props.dispatch({type: SystemActions.ActionTypes.LISTS.LOAD_NEIGHBORHOOD_CLUSTERS, key:null});

    }
    renderRows() {

        if (!this.props.neighborhoodCityKey || this.props.neighborhoodCityKey == -1) {
            return;
        }

        
        this.neighborhoodRows = this.props.neighborhoods
            .map(function (item) {
                if (item.name.indexOf(this.props.neighborhoodSearchValue) != -1) {
                    if (this.props.isNeighborhoodInEditMode && item.key == this.props.neighborhoodKeyInSelectMode) {
                        /* EDIT MODE */
                        return <NeighborhoodRow key={item.key} item={item} isInEditMode={true} isNameExistInTheList={this.isNameExistInTheList.bind(this)}
                            className='edit-mode-tr' />
                    } else {
                        /* DISPLAY MODE */
                        return <NeighborhoodRow key={item.key} item={item} isInEditMode={false} updateScrollPosition={this.updateScrollPosition.bind(this)}
                            className={((this.props.isNeighborhoodsClustersDisplayed == true) && (item.key == this.props.neighborhoodKeyInSelectMode) ? 'lists-row success' : 'lists-row')} />
                    }
                }
            }, this);
            this.neighborhoodRows.unshift(<tr className='lists-row' key='no-neighborhood'><td onClick={this.getAllClustersWithOutNeighborhood.bind(this)}>ללא אזור</td></tr>)
        

        this.neighborhoodClustersRows = this.props.neighborhoodClusters
            .map(function (item, index) {
                if (item.name.indexOf(this.props.neighborhoodClusterSearchValue) != -1) {
                    return <NeighborhoodClusterRow key={item.key} item={item} index={index} neighborhoodKey={this.props.neighborhoodKeyInSelectMode} cityKey={this.props.neighborhoodCityKey}
                        clusterEditRowIndex={this.state.clusterEditRowIndex} isSelected={this.state.clusterToEditHash[index]} clusterSelected={this.clusterSelected.bind(this, index)}
                        editClusterRow={this.editClusterRow.bind(this)} updateScrollPosition={this.updateScrollPosition.bind(this)} currentUser={this.props.currentUser}
                        isNameExistInClusterList={this.isNameExistInClusterList.bind(this)}
                        />
                }
            }, this);
    }

    setOrderDirection() {
        this.orderDirection = this.props.isNeighborhoodsOrderedAsc ? 'asc' : 'desc';
        this.clusterOrderDirection = this.props.isNeighborhoodsClustersOrderedAsc ? 'asc' : 'desc';
    }

    updateCollapseStatus(container) {
        if (false == this.props.dirty) {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LIST_CONTAINER_COLLAPSE_CHANGED, container });
        } else {
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_EDIT_MODE_MODAL_DIALOG_DISPLAY });
        }
    }

    comboChange(el) {
        if (!el || !el.target.selectedItem) { return; }

        let item = el.target.selectedItem;
        this.setState({ selectedCity: item.city_key })
        SystemActions.loadNeighborhoods(store, item.city_key);
        SystemActions.loadClusters(this.props.dispatch, item.city_key);
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.LOAD_NEIGHBORHOODS, id: item.city_id, key: item.city_key });
    }
    modalActionSelected(modalName, el) {
        if (!el || !el.target.selectedItem) { return; }
        let value = el ? el.target.selectedItem.id : null;

        switch (modalName) {
            case 'cityClusters':
                if (value == 1) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DISPLAY_UPDATE_CLUSTERS_MODALS, modalName: modalName, displayModal: true });
                }
                break;
            case 'clusters':
                if (value == 1) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DISPLAY_UPDATE_CLUSTERS_MODALS, modalName: 'neighborhoodClusters', displayModal: true });
                } else if (value == 2) {
                    this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DISPLAY_UPDATE_CLUSTERS_MODALS, modalName: 'transferClusters', displayModal: true });
                }
                break;

        }
    }
    changeActionModalDialog(modalName, bool) {
        
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.TOGGLE_DISPLAY_UPDATE_CLUSTERS_MODALS, modalName: modalName, displayModal: bool });
    }
    submitUpdateClusterModal(modalName, action, data) {
        let requestData;
        switch (modalName) {
            case 'cityClusters':
                if (!this.state.selectedCity) { return; }
                requestData = { city_key: this.state.selectedCity, update_prefix_method: action };
                SystemActions.changeClustersPrefix(store, this.props.neighborhoodKeyInSelectMode,this.props.neighborhoodCityKey, requestData, modalName);
                break;
            case 'neighborhoodClusters':
                requestData = { cluster_key_list: this.clusterSelectedKeyList, new_prefix: data.newPrefix, update_prefix_method: 'cluster_key_list' };
                SystemActions.changeClustersPrefix(store, this.props.neighborhoodKeyInSelectMode,this.props.neighborhoodCityKey, requestData, modalName);
                break;
            case 'transferClusters':
                requestData = { cluster_key_list: this.clusterSelectedKeyList };
                if (action == 'transferClusters') {
                    SystemActions.transferNeighborhoodClusters(store, data.neighborhoodSelected, this.props.neighborhoodKeyInSelectMode, requestData, modalName,this.props.neighborhoodCityKey);
                } else if (action == 'removeClusters') {
                    SystemActions.deleteNeighborhoodClusterList(store, this.props.neighborhoodKeyInSelectMode, requestData, modalName);
                }
                break;
        }
        this.setState({ clusterToEditHash: {} });
    }

    selectCluster(el) {
        if (el.target.selectedItem) {
            let item = el.target.selectedItem;
            this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.NEIGHBORHOOD_CLUSTER_SELECTED, key: item.key });
        }
    }
    clusterSelected(index) {
        let clusterToEditHash = { ...this.state.clusterToEditHash };
        clusterToEditHash[index] = !clusterToEditHash[index];
        this.clusterSelectedKeyList = [];
        for (let index in clusterToEditHash) {
            if (clusterToEditHash[index]) {
                let clusterKey = this.props.neighborhoodClusters[index].key;
                this.clusterSelectedKeyList.push(clusterKey)
            }
        }
        this.setState({ ...this.state, clusterToEditHash: clusterToEditHash })
    }
    toggleChooseAll() {
        
        let clusterToEditHash = {};
        let clusterSelectedKeyList = [];
        if (!this.state.checkAllButton) {
            this.props.neighborhoodClusters.forEach(function (item, index) {
                let clusterKey = item.key;
                clusterSelectedKeyList.push(clusterKey)
                clusterToEditHash[index] = true;
            });
        }
        this.clusterSelectedKeyList = clusterSelectedKeyList;
        this.setState({ clusterToEditHash: clusterToEditHash, checkAllButton: !this.state.checkAllButton })
    }
    editClusterRow(clusterIndex) {
        this.setState({ clusterEditRowIndex: clusterIndex })
    }
    isNameExistInTheList(name) {
        var result = _.find(this.props.neighborhoods, ['name', name]);
        return (undefined == result) ? false : true;
    }
    isNameExistInClusterList(name) {
        var result = _.find(this.props.neighborhoodClusters, ['name', name]);
        return (undefined == result) ? false : true;
    }

    //ref of element for height claculation
    getRef(ref) {
        this.self = ref;
    }

    updateScrollPosition() {
        //save the scroll position when the item is edited, to scroll back to it after re-load the list
        const scrollPosition = this.self.scrollTop;
        this.props.dispatch({ type: SystemActions.ActionTypes.LISTS.UPDATED_CURRENT_TABLE_SCROLLER_POSITION, scrollPosition });
    }

    componentDidUpdate() {
        //after editing scroll back to the item position
        if (undefined != this.self && null != this.self && this.props.currentTableScrollerPosition > 0) {
            this.self.scrollTop = this.props.currentTableScrollerPosition;
        }
    }

    render() {
        this.renderRows();
        this.setOrderDirection();
        return (
            <div className={"ContainerCollapse" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.neighborhoods']) ? '' : ' hidden')}>
                <a onClick={this.updateCollapseStatus.bind(this, 'neighborhood')} aria-expanded={this.props.containerCollapseStatus.neighborhood}>
                    <div className="collapseArrow closed"></div>
                    <div className="collapseArrow open"></div>
                    <span className="collapseTitle">{this.textValues.listTitle}</span>
                </a>
                <Collapse isOpened={this.props.containerCollapseStatus.neighborhood}>
                    <div className="CollapseContent">
                        <div className="form-group row">
                            <label htmlFor="selectCity" className="col-md-1 control-label">{this.textValues.cityLabel}</label>
                            <div className="col-md-2">
                                <Combo className="input-group" items={this.props.cities} maxDisplayItems={10} itemIdProperty="city_key" itemDisplayProperty='city_name'
                                    defaultValue='' onChange={this.comboChange.bind(this)} idForLabel="selectCity" />
                            </div>
                            <div className="col-md-3">
                                <Combo items={this.updateCityClustersOptions} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name'
                                    defaultValue='' value='' onChange={this.modalActionSelected.bind(this, 'cityClusters')} placeholder="פעולות" />
                            </div>
                            <div className="col-md-1"></div>
                            <div className={( this.props.isNeighborhoodsClustersDisplayed && this.props.neighborhoodKeyInSelectMode ? '' : 'hidden')}>
                                <label htmlFor="selectCluster" className="col-md-1 control-label">{this.textValues.clusterLabel}</label>
                                <div className="col-md-2">
                                    <Combo className="input-group" items={this.props.clusters} maxDisplayItems={10} itemIdProperty="key" itemDisplayProperty='name'
                                        defaultValue='' onChange={this.selectCluster.bind(this)} idForLabel="selectCluster" />
                                </div>

                                <div className="col-md-2">
                                    <button type="button" onClick={this.addNewNeighborhoodCluster.bind(this)}
                                        className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.neighborhoods.edit']) ? '' : ' hidden')}
                                        disabled={(this.props.neighborhoodClusterKeyInEditMode == -1 ? "disabled" : "")}>
                                        <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                                <span>{this.textValues.clusterAddButtonTitle}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <form className="form-horizontal">
                            <div className="row form-group">
                                <label htmlFor="neighborhoodSearch" className="col-md-1 control-label">{this.textValues.searchTitle}</label>
                                <div className="col-md-2">
                                    <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="neighborhoodSearch"
                                        value={this.props.neighborhoodSearchValue} onChange={this.updateNeighborhoodSearchValue.bind(this)} />
                                </div>
                                <div className="col-md-2">
                                    <button type="button" onClick={this.addNewNeighborhood.bind(this)}
                                        className={"btn btn-primary btn-sm" + ((this.props.currentUser.admin) || (this.props.currentUser.permissions['system.lists.general.neighborhoods.add']) ? '' : ' hidden')}
                                        disabled={(((this.props.neighborhoodCityKey != -1) && (this.props.neighborhoodSearchValue.length >= 2) && (false == this.isNameExistInTheList(this.props.neighborhoodSearchValue))) ? "" : "disabled")}>
                                        <i className="fa fa-plus"></i>&nbsp;&nbsp;
                                            <span>{this.textValues.addButtonTitle}</span>
                                    </button>
                                </div>
                                <div className="col-md-2"></div>
                                <div className={(true == this.props.isNeighborhoodsClustersDisplayed ? '' : 'hidden')}>
                                    <label htmlFor="neighborhoodClusterSearch" className="col-md-1 control-label">{this.textValues.searchTitle}</label>
                                    <div className="col-md-2">
                                        <input type="text" className="form-control" placeholder={this.textValues.searchTitle} id="neighborhoodClusterSearch"
                                            value={this.props.neighborhoodClusterSearchValue} onChange={this.updateNeighborhoodClusterSearchValue.bind(this)} />
                                    </div>
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
                                                        <i className={'fa fa-1x fa-sort-' + this.orderDirection} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody ref={this.getRef.bind(this)}>
                                        {this.neighborhoodRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showNeighborhoodModalDialog} buttonOk={this.deleteNeighborhoodConfirm.bind(this)}
                                    buttonCancel={this.closeModalDialog.bind(this)} title={this.textValues.modalWindowTitle} buttonX={this.closeModalDialog.bind(this)}>
                                    <div>{this.textValues.modalWindowBody}</div>
                                </ModalWindow>
                            </div>
                            <div className="col-md-1"></div>
                            <div className={"col-md-5" + (this.props.isNeighborhoodsClustersDisplayed  ? '' : ' hidden')}>
                                <table className="table table-bordered table-striped table-hover lists-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <span onClick={this.orderClustersList.bind(this)} className="cursor-pointer">
                                                    {this.textValues.clusterLabel}&nbsp;
                                                        <i className={'fa fa-1x fa-sort-' + this.clusterOrderDirection} aria-hidden="true"></i>
                                                </span>
                                            </th>
                                            <th colSpan="3">
                                                <Combo items={this.updateClustersOptions} maxDisplayItems={3} itemIdProperty="id" itemDisplayProperty='name' defaultValue=''
                                                    value='' onChange={this.modalActionSelected.bind(this, 'clusters')} placeholder="פעולות"
                                                    disabled={this.clusterSelectedKeyList.length == 0}
                                                />
                                            </th>
                                            <th>
                                                <button className={'btn btn-sm ' + (this.state.checkAllButton ? "btn-warning" : "btn-primary")} type="button" onClick={this.toggleChooseAll.bind(this)}>
                                                {this.state.checkAllButton ? 'הסר הכל' : 'בחר הכל'}
                                            </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody ref={this.getRef.bind(this)}>
                                        {this.neighborhoodClustersRows}
                                    </tbody>
                                </table>
                                <ModalWindow show={this.props.showNeighborhoodClusterModalDialog} buttonOk={this.deleteNeighborhoodClusterConfirm.bind(this)}
                                    buttonCancel={this.closeClusterModalDialog.bind(this)} title={this.textValues.clusterModalWindowTitle} buttonX={this.closeClusterModalDialog.bind(this)}>
                                    <div>{this.textValues.clusterModalWindowBody}</div>
                                </ModalWindow>

                            </div>
                        </div>
                    </div>
                    <UpdateCityClustersPrefixModal
                        showModal={this.props.cityClustersDisplayModal}
                        onClose={this.changeActionModalDialog.bind(this, 'cityClusters', false)}
                        onSubmit={this.submitUpdateClusterModal.bind(this)}
                    ></UpdateCityClustersPrefixModal>
                    <UpdateNeighborhoodClustersPrefixModal
                        showModal={this.props.neighborhoodClustersDisplayModal}
                        onClose={this.changeActionModalDialog.bind(this, 'neighborhoodClusters', false)}
                        onSubmit={this.submitUpdateClusterModal.bind(this)}
                    ></UpdateNeighborhoodClustersPrefixModal>
                    <TransferClustersModal
                        showModal={this.props.transferClustersDisplayModal}
                        onClose={this.changeActionModalDialog.bind(this, 'transferClusters', false)}
                        onSubmit={this.submitUpdateClusterModal.bind(this)}
                        neighborhoodsList={this.props.neighborhoods}
                        selectedNeighborhoodKey={this.props.neighborhoodKeyInSelectMode}
                    ></TransferClustersModal>
                </Collapse>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        cities: state.system.lists.cities,
        neighborhoods: state.system.lists.neighborhoods,
        clusters: state.system.lists.clusters,
        neighborhoodClusters: state.system.lists.neighborhoodClusters,
        isNeighborhoodsClustersDisplayed: state.system.listsScreen.generalTab.isNeighborhoodsClustersDisplayed,
        isNeighborhoodsClustersOrderedAsc: state.system.listsScreen.generalTab.isNeighborhoodsClustersOrderedAsc,
        neighborhoodClusterSearchValue: state.system.listsScreen.generalTab.neighborhoodClusterSearchValue,
        neighborhoodClusterKeyInEditMode: state.system.listsScreen.generalTab.neighborhoodClusterKeyInEditMode,
        neighborhoodClustersDisplayModal: state.system.listsScreen.generalTab.neighborhoodClustersDisplayModal,
        showNeighborhoodClusterModalDialog: state.system.listsScreen.generalTab.showNeighborhoodClusterModalDialog,
        neighborhoodSearchValue: state.system.listsScreen.generalTab.neighborhoodSearchValue,
        isNeighborhoodsOrderedAsc: state.system.listsScreen.generalTab.isNeighborhoodsOrderedAsc,
        showNeighborhoodModalDialog: state.system.listsScreen.generalTab.showNeighborhoodModalDialog,
        neighborhoodKeyInSelectMode: state.system.listsScreen.generalTab.neighborhoodKeyInSelectMode,
        neighborhoodCityKey: state.system.listsScreen.generalTab.neighborhoodCityKey,
        neighborhoodInEditMode: state.system.listsScreen.generalTab.neighborhoodInEditMode,
        transferClustersDisplayModal: state.system.listsScreen.generalTab.transferClustersDisplayModal,
        neighborhoodClustersDisplayModal: state.system.listsScreen.generalTab.neighborhoodClustersDisplayModal,
        cityClustersDisplayModal: state.system.listsScreen.generalTab.cityClustersDisplayModal,
        containerCollapseStatus: state.system.listsScreen.containerCollapseStatus,
        dirty: state.system.listsScreen.dirty,
        isNeighborhoodInEditMode: state.system.listsScreen.generalTab.isNeighborhoodInEditMode,
        currentTableScrollerPosition: state.system.listsScreen.currentTableScrollerPosition,
        currentUser: state.system.currentUser,
    };
}
export default connect(mapStateToProps)(withRouter(Neighborhood));