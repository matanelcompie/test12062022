import React from 'react';
import { connect } from 'react-redux';

import Pagination from 'components/global/Pagination';
import ModalWindow from 'components/global/ModalWindow';

import * as ElectionsActions from 'actions/ElectionsActions';
import {thousandsSeparatesForNumber}  from 'libs/globalFunctions';

import VoterTransportationRow from './VoterTransportationRow';
import EditCommentModal from './modals/EditCommentModal';
import EditDriverModal from './modals/EditDriverModal';


class ReportSearchResults extends React.Component {
    constructor(props) {
        super(props);
        this.initState = {
            currentPage: 1, //curent global page (for all ballotBoxes)
            numberPerPage: 30, //number of records per page
            numberPerPageValue: 30, // input value
            selectedRowsHash: {},
            commentRowData: {},
            rowForDriversModalsDetails: null,
            addVoterVoteModal: {
                display: false,
                data: {
                    index: null,
                    voterKey: null
                }
            },
            resultVotersList:[],
            householdsTransportHash: {}
        };
    }
    componentWillMount() {
        this.setState({...this.initState});
        this.getHouseholdTransportationsHash(this.props.votersTransportations)
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.isNewSearch && nextProps.isNewSearch && this.state.currentPage != 1) {
            this.setState({ currentPage: 1 });
        }
        if(this.props.rowsSelectedIndexList && this.props.rowsSelectedIndexList.length != 0 && nextProps.rowsSelectedIndexList.length == 0){
            this.setState({ selectedRowsHash: {} });
        }
        console.log('this.props.votersTransportations', this.props.votersTransportations,nextProps.votersTransportations)
        if( JSON.stringify(this.props.votersTransportations) != JSON.stringify(nextProps.votersTransportations)){
           this.getHouseholdTransportationsHash(nextProps.votersTransportations);
        }
    }
    getHouseholdTransportationsHash(votersTransportations){
        let householdsTransportHash = {};
        let resultVotersList = [];
        votersTransportations.forEach((voterRow, i) => {
            let currentRowKey = `${voterRow.street}_${voterRow.house}_${voterRow.last_name}_${voterRow.from_time}_${voterRow.to_time}`;
            if(!householdsTransportHash[currentRowKey]){
                householdsTransportHash[currentRowKey] = {cnt : 0, all_rows_names: null};
                voterRow.currentRowKey = currentRowKey;
                resultVotersList.push(voterRow);
            } else {
                if(!householdsTransportHash[currentRowKey].all_rows_names){ householdsTransportHash[currentRowKey].all_rows_names = [] }
                // let first_phone = voterRow.voter_phones.length > 0 ? voterRow.voter_phones[0].phone_number : '--';
                householdsTransportHash[currentRowKey].all_rows_names.push(voterRow.first_name );
            }
            householdsTransportHash[currentRowKey]['cnt'] ++;
        });
        let newState = {...this.state}
        newState.householdsTransportHash = householdsTransportHash;
        newState.resultVotersList = resultVotersList;
        this.setState(newState);
        console.log(newState);
    }
    /**
     * @method changeNumberPerPage
     * change the number of records per page
     * check if the input value between 0 to 100.
     * @param e - input event
     * @returns void
     */
    changeNumberPerPage(e) {
        let numberPerPageValue = Number(e.target.value);
        if (numberPerPageValue < 0) { numberPerPageValue = 0 }
        if (numberPerPageValue > 100) { numberPerPageValue = 100 }
        this.setState({ numberPerPageValue: numberPerPageValue});
    }
    updateResultsPerPage() {
        this.setState({ numberPerPage: this.state.numberPerPageValue, currentPage: 1});
        this.getMoreData(1);
    }
    /**
     * @method getBallotBoxVotersDataToDispaly
     * 1. display only the relevant voters transportations .
     * 2. set the voter and ballotBoxes pagination.
     *
     * -> Set the limits of the current page -> 'firstRow' and the 'lastRow'.
     * -> dispaly only voters that are between this page limits.
     * 
     * @returns (array) this.tableRows - row of table to dispaly in view. 
     */
    getDataToDispaly() {
        let self = this;
        let resultVotersList = this.state.resultVotersList;

        let lastRow = (this.state.currentPage * this.state.numberPerPage)  ;
        let firstRow = (lastRow - this.state.numberPerPage)
        this.tableRows = [];

        for (let i = firstRow; i < lastRow; i++) {
            let voterRow = resultVotersList[i];

            if (voterRow) {
                let voterRowBody = self.renderVoterRow(voterRow, i);
                this.tableRows.push(voterRowBody);
            }

        }
    }
    // getCurrentRowTransportationKey(voterRow){
    //     return`${voterRow.street}_${voterRow.house}_${voterRow.last_name}_${voterRow.from_time}_${voterRow.to_time}`;
    // }
    executeTransportation(executed, voterKey, transportationsKey, index) {
        let requestData = { is_executed: executed, voter_key: voterKey };
        ElectionsActions.updateTransportation(this.props.dispatch, requestData, transportationsKey, 'executed', index)
    }
    // Add Vote Modal methods:
    displayVoteConfirmModal(bool, newModalData = null){
        let modalData = { ...this.initState.addVoterVoteModal.data }
        if (bool) {
            modalData = newModalData;
        }
        let newState = { ...this.state }
        newState.addVoterVoteModal = { display: bool, data: modalData } ;
        this.setState(newState);
    }
    addVoteToVoter() {
        let modalData = this.state.addVoterVoteModal.data;
        ElectionsActions.addVoteToVoter(this.props.dispatch, modalData.voterKey, modalData.index)
        this.displayVoteConfirmModal(false);
    }

    //  Comment Modal methods:
    showCommentModal(commentText, voterKey, rowIndex){
        this.setState({ commentRowData: { voterKey: voterKey, rowIndex: rowIndex, commentText:commentText } })
        this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SHOW_HIDE_GLOBAL_MODAL_DIALOG, show: true, modalName: 'Comment' });
    }
    saveNewComment(nowComment){
        ElectionsActions.updateVoterComment(this.props.dispatch, this.state.commentRowData, nowComment)
        this.onCommentModalClose();
    }
    onCommentModalClose(){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SHOW_HIDE_GLOBAL_MODAL_DIALOG, show: false, modalName: 'Comment' });
    }
    //  Search driver Modal methods:
    showSearchDriverModal(cluster_id, voterKey, transportationsKey, rowIndex) {
        let rowForDriversModalsDetails = {cluster_id: cluster_id, transportationsKey: transportationsKey,voterKey: voterKey, rowIndex: rowIndex }
        this.setState({ rowForDriversModalsDetails: rowForDriversModalsDetails })
        this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SHOW_HIDE_GLOBAL_MODAL_DIALOG, show: true, modalName: 'Driver' });
    }
    onSearchDriverModalChange(selectedDriverData){
        let rowDetails = this.state.rowForDriversModalsDetails;
        let requestData = { transportations_key: rowDetails.transportationsKey, voter_key: rowDetails.voterKey, voter_driver_id: selectedDriverData.id };
        ElectionsActions.updateTransportationDriver(this.props.dispatch, requestData, this.props.cityKey, rowDetails, selectedDriverData)
    }
    onSearchDriverModalClose(){
		this.props.dispatch({ type: ElectionsActions.ActionTypes.TRANSPORTATIONS.SHOW_HIDE_GLOBAL_MODAL_DIALOG, show: false, modalName: 'Driver' });
    }
    // Transportation Rows methods:
    renderVoterRow(item, index) {
        let hasEditPermission = this.props.currentUser.permissions['elections.transportations.edit'] || this.props.currentUser.admin;

        return <VoterTransportationRow
            item={item}
            key={item.voter_key}
            index={index}
            householdsTransportData={this.state.householdsTransportHash[item.currentRowKey] || {}}
            displayVoteConfirmModal={this.displayVoteConfirmModal.bind(this)}
            executeTransportation={this.executeTransportation.bind(this)}
            showCommentModal={this.showCommentModal.bind(this)}
            selectTransportRow={this.selectTransportRow.bind(this)}
            showSearchDriverModal={this.showSearchDriverModal.bind(this)}
            isRowSelected={this.state.selectedRowsHash[index]}
            hasEditPermission={hasEditPermission}
        />
    }

    selectTransportRow(index){
        let selectedRowsHash = { ...this.state.selectedRowsHash };
        selectedRowsHash[index] = !selectedRowsHash[index];

        this.setState({ ...this.state, selectedRowsHash: selectedRowsHash });
        this.props.updateRowsSelectedList(selectedRowsHash);
    }
    /**
     * @method printResults
     * Export the result to pdf.
     * Or print the results.
     * @param {string} format - print / pdf file
     */
    printResults(format) {
        let requestData = this.props.getRequestData();
        let sqlQuery = 'city_key=' + requestData.city_key;
        sqlQuery += '&filters_object='+ JSON.stringify(requestData.filters_object);
        let url = window.Laravel.baseURL + 'api/elections/transportations/export?'
            + sqlQuery + "&format=" + format;
        window.open(url, '_blank');
    }
    /**
     * @method initViewData
     * 1. Set print/pdf buttons
     * 2. Set the pagination buttons
     */
    initViewData() {    //Change Permissions!!!
        this.printResultsItem = null;
        this.exportPDFResultsItem = null;
        if (this.props.currentUser.admin || this.props.currentUser.permissions['elections.transportations.print']) {
            this.printResultsItem = <a title="הדפסה" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'print')} className="icon-box print"></a>;
        }
        if (this.props.currentUser.admin || this.props.currentUser.permissions['elections.transportations.export']) {
            this.exportPDFResultsItem = <a title="שמירת קובץ" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'pdf')} className="icon-box pdf"></a>;
        }
        this.getDataToDispaly();

        this.pagesNumberItem = null;
        this.paginationItem = null;
        let totalTransportationsCount = this.props.transportationsScreen.transportationsCountByFilters;
        if ((totalTransportationsCount / this.state.numberPerPage) > 1) { // check that more then 1 page
            this.paginationItem = <div className="row">
                <nav aria-label="Page navigation paginationRow">
                    <div className="text-center">
                        <Pagination navigateToPage={this.navigateToPage.bind(this)} resultsCount={totalTransportationsCount} currentPage={this.state.currentPage} displayItemsPerPage={this.state.numberPerPage} />
                    </div>
                </nav>
            </div>;
        }
    }

   /**
    * @method navigateToPage
    * navigate to page handle function.
    * (this.getMoreData() -> get more data for navigation)
    * @param {int} index - page to navigate.
    * @returns void
    */
    navigateToPage(nexPage) {
        let limitRowsInServer = 100;
        let maxPage = Math.ceil((this.props.resultVotersList.length + limitRowsInServer) / this.state.numberPerPage)
        if (nexPage > maxPage) {
            nexPage = maxPage;
        }
        this.setState({
            currentPage: nexPage
        });
        this.getMoreData(nexPage);
        this.props.initSelectedRows();
    }
    /**
     * @method getMoreData
     * check if their is enough to display in the next page
     * -> if not - it will load more dat from api.
     * @prop (int) this.totalLoadedVotersCount - total voters that already loaded from api
     * ->calculate from votersTransportations array
     * @returns void
     */
    getMoreData(pageIndex) {
        let skipRows = this.totalLoadedVotersCount;
        let nextPageTotal = pageIndex  * this.state.numberPerPage;
        if (nextPageTotal >= skipRows) { //check if need to load more voters
            this.props.getMoreTransportationsData();
        } 

    }
    scrollToPageTop() {
        window.scrollTo(0, 0);
    }

    scrollToResultsTop() {
        if (this.self) {
            window.scrollTo(0, this.self.offsetTop)
        }
    }

    getRef(ref) {
        this.self = ref;
    }
    render() {

        this.totalLoadedVotersCount = this.state.resultVotersList.length
        this.initViewData();
        let totalVotersCount = thousandsSeparatesForNumber(this.props.transportationsScreen.transportationsCountByFilters);

        if (this.props.transportationsScreen.isLoading) {
            return (
                <div className="row text-center"><i className="fa fa-spinner fa-spin"></i> טוען...</div>
            )
        }
        return (
            <div ref={this.getRef.bind(this)}>
                <div style={{ paddingTop: '5px' }}>
                    <div className="row rsltsTitleRow">
                        <div className="col-lg-6 text-right">
                            <div id="go-top-list"></div>
                             { <h3 className="separation-item noBgTitle"> נמצאו <span className="counter">{totalVotersCount}</span> הסעות </h3>}
                            <span className="item-space">הצג</span>
                            <input className="item-space input-simple" type="number" value={this.state.numberPerPageValue} onChange={this.changeNumberPerPage.bind(this)} />
                            <span className="item-space">תוצאות</span>
                            <button title="שנה" type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#498BB6', borderColor: 'transparent' }}
                                onClick={this.updateResultsPerPage.bind(this)}>שנה</button>
                        </div>
                        <div className="col-lg-6 clearfix">
                            <div className="link-box pull-left">
                                {this.printResultsItem} &nbsp;
                                {this.exportPDFResultsItem}
                            </div>
                        </div>
                    </div>
                </div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th></th>
                            <th>ת.ז</th>
                            <th>שם מלא</th>
                            <th>כתובת מלאה</th>
                            <th>1 טלפון</th>
                            <th>2 טלפון</th>
                            <th>סוג הסעה</th>
                            <th>מספר נוסעים</th>
                            <th>משעה</th>
                            <th>עד שעה</th>
                            <th>הסעה בוצעה</th>
                            <th>הערה</th>
                            <th>משובץ לנהג</th>
                            <th>הצביע</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.tableRows}
                    </tbody>
                </table>

                <nav aria-label="Page navigation paginationRow">
                    <div className="text-center">
                        {this.paginationItem}
                    </div>
                </nav>
                <EditCommentModal
                    commentText={this.state.commentRowData.commentText}
                    showModal={this.props.transportationsScreen.displayCommentModal}
                    saveNewComment={this.saveNewComment.bind(this)}
                    onModalClose={this.onCommentModalClose.bind(this)}
                />
                <EditDriverModal
                    showModal={this.props.transportationsScreen.displayDriverModal}
                    onClickButtonOk={this.onSearchDriverModalChange.bind(this)}
                    onModalClose={this.onSearchDriverModalClose.bind(this)}
                    cities={this.props.cities}
                    citySelectedItem={this.props.citySelectedItem}
                    selectedRowDetails={this.state.rowForDriversModalsDetails}
                />
                <ModalWindow
                    show={this.state.addVoterVoteModal.display}
                    buttonOk={this.addVoteToVoter.bind(this)}
                    buttonCancel={this.displayVoteConfirmModal.bind(this, false)}
                    buttonX={this.displayVoteConfirmModal.bind(this, false)}
                    title={'הגדרת סטטוס בחירה לתושב'}
                >
                <div> האם אתה בטוח?</div>
                </ModalWindow>
            </div>
        )
    }

}
function mapStateToProps(state) {
    return {
        currentUser: state.system.currentUser,
        transportationsScreen: state.elections.transportationsScreen,
        isNewSearch : state.elections.transportationsScreen.isNewSearch ,
        votersTransportations: state.elections.transportationsScreen.votersTransportations,
    }
}

export default connect(mapStateToProps)(ReportSearchResults);