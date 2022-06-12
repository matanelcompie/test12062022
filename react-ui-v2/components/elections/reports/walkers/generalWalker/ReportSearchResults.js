import React from 'react';
import { connect } from 'react-redux';

import Pagination from 'components/global/Pagination';

import * as ElectionsActions from 'actions/ElectionsActions';
import * as SystemActions from 'actions/SystemActions';

import VoterRow from './VoterRow';
import BallotBoxRow from './BallotBoxRow';
import {thousandsSeparatesForNumber} from 'libs/globalFunctions';


class ReportSearchResults extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        
        this.setState({
            currentPage: 1, //curent global page (for all ballotBoxes)
            numberPerPage: 30, //number of records per page
            numberPerPageValue: 30, // input value
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.walkerReportData.isNewSearch && this.state.currentPage != 1) {
            this.setState({ currentPage: 1 });
        }
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
        this.setState({ numberPerPageValue: numberPerPageValue });
    }
    updateResultsPerPage() {
        this.setState({ numberPerPage: this.state.numberPerPageValue, currentPage: 1 });
        this.getMoreBallotBoxVotersData(1);
    }
    /**
     * @method getBallotBoxVotersDataToDispaly
     * 1. display only the relevant ballotboxes and users.
     * 2. set the voter and ballotBoxes pagination.
     *
     * -> Set the limits of the current page -> 'firstRow' and the 'lastRow'.
     * -> Print the ballotBox table row .
     * -> dispaly only voters that are between this page limits.
     * 
     * @returns (array) this.tableRows - row of table to dispaly in view. 
     */
    getBallotBoxVotersDataToDispaly() {
        let self = this;
        let resultVotersList = this.props.walkerReportData.resultVotersList;

        let lastRow = (this.state.currentPage * this.state.numberPerPage) - 1;
        let firstRow = (lastRow - this.state.numberPerPage) + 1

        this.tableRows = [];
        this.displayBallotBoxObj = {};
        for (let i = firstRow; i <= lastRow; i++) {
            let voterRow = resultVotersList[i];
            if (voterRow) {
                let ballotBoxId = voterRow.ballot_box_id;
                let BallotBoxData = this.getBallotBox(ballotBoxId);
                let rowIndex = i - BallotBoxData.firstBallotIndex;
                let voterRowBody = self.renderVoterRow(voterRow, rowIndex, BallotBoxData.mi_id);
                this.tableRows.push(voterRowBody);
            }

        }
    }
    /**
     * @method getBallotBox
     *  Get the user ballotBox from "ballotBoxesHash" table by id.
     *  - enter the ballot box to the display object. 
     *  If this is the first row from the current ballotBox (int the current page)
     *  -> print the ballotBox row on the top.
     * @param {*} ballotBoxId 
     */
    getBallotBox(ballotBoxId) {
        let ballotBoxesHash = this.props.walkerReportData.ballotBoxesHash;

        if (!this.displayBallotBoxObj.hasOwnProperty(ballotBoxId)) {
            let BallotBoxData = ballotBoxesHash[ballotBoxId];
            this.displayBallotBoxObj[ballotBoxId] = BallotBoxData;

            let ballotBoxRow = this.renderBallotBoxRow(BallotBoxData);
            this.tableRows.push(ballotBoxRow);

            let headerRow = this.renderHeaderRow(ballotBoxId);
            this.tableRows.push(headerRow);
        }
        return this.displayBallotBoxObj[ballotBoxId];
    }

    renderHeaderRow(ballotBoxId){
        return(
            <tr key={'header-' + ballotBoxId}>
                <th>מס"ד</th>
                <th>מס' קלפי</th>
                <th>מס' בוחר</th>
                <th>תז</th>
                <th>שם מלא</th>
                <th>רחוב</th>
                <th>מספר</th>
                <th>טלפון</th>
                <th>טלפון נוסף</th>
                <th>סטטוס סופי</th>
            </tr>
        )
    }
    renderBallotBoxRow(BallotBoxData) {
        return <BallotBoxRow
            key={'ballotBox' + BallotBoxData.mi_id}
            item={BallotBoxData}
            cityName={this.props.cityName}
            clusterName={BallotBoxData.cluster_name}
            numberPerPage={this.state.numberPerPage}
            currentPage={this.state.currentPage}
        />
    }
    renderVoterRow(item, index, ballotBox_mi_id) {
	 
        return <VoterRow
            item={item}
            key={item.voter_id}
            index={index}
            ballotBox_mi_id={ballotBox_mi_id}
        />
    }
    /**
     * @method printResults
     * Export the result to pdf.
     * Or print the results.
     * @param {string} format - print / pdf file
     */
    printResults(format) {
        let sqlQuery = '';
        let requestData = this.props.walkerReportData.requestData;

        requestData.skipRows = 0;
        for (let key in requestData) {
            let val = requestData[key];

            if ( key == "cluster_keys" ) {
                for ( let clusterIndex = 0; clusterIndex < requestData.cluster_keys.length; clusterIndex++ ) {
                    sqlQuery += '&cluster_keys[]=' + requestData.cluster_keys[clusterIndex];
                }
            } else if (val) {
                sqlQuery += '&' + key + '=' + val;
            }
        }
        let url = window.Laravel.baseURL + 'api/elections/reports/walkers/general/export?';
        url += "format=" + format + sqlQuery;
        window.open(url, '_blank');
    }
    /**
     * @method initViewData
     * 1. Set print/pdf buttons
     * 2. Set the pagination buttons
     * 
     */
    initViewData() {
        this.printResultsItem = null;
        this.exportPDFResultsItem = null;
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.reports.walkers.general.print'] == true) {
            this.printResultsItem = <a title="הדפסה" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'print')} className="icon-box print"></a>;
        }
        if (this.props.currentUser.admin == true || this.props.currentUser.permissions['elections.reports.walkers.general.export'] == true) {
            this.exportPDFResultsItem = <a title="שמירת קובץ" style={{ cursor: 'pointer' }} onClick={this.printResults.bind(this, 'pdf')} className="icon-box pdf"></a>;
        }
        this.getBallotBoxVotersDataToDispaly();

        this.pagesNumberItem = null;
        this.paginationItem = null;
        // console.log('totalLoadedVotersCount', this.state.numberPerPage);
        if ((this.props.walkerReportData.totalVotersCount / this.state.numberPerPage) > 1) { // check that more then 1 page
            this.paginationItem = <div className="row">
                <nav aria-label="Page navigation paginationRow">
                    <div className="text-center">
                        <Pagination navigateToPage={this.navigateToPage.bind(this)} resultsCount={this.props.walkerReportData.totalVotersCount} currentPage={this.state.currentPage} displayItemsPerPage={this.state.numberPerPage} />
                    </div>
                </nav>
            </div>;
        }
    }

   /**
    * @method navigateToPage
    * navigate to page handle function.
    * (this.getMoreBallotBoxVotersData() -> get more data for navigation)
    * @param {int} index - page to navigate.
    * @returns void
    */
    navigateToPage(index) {
        let limitRowsInServer = 100;
        let maxPage = Math.ceil((this.props.walkerReportData.resultVotersList.length + limitRowsInServer) / this.state.numberPerPage)
        if (index > maxPage) {
            index = maxPage;
        }
        this.setState({
            currentPage: index
        });
        this.getMoreBallotBoxVotersData(index);
    }
        /**
     * @method getMoreBallotBoxVotersData
     * check if their is enough to display in the next page
     * -> if not - it will load more dat from api.
     * @prop (int) walkerReportData.totalLoadedVotersCount - total voters that already loaded from api
     * @returns void
     */
    getMoreBallotBoxVotersData(pageIndex) {
        let skipRows = this.totalLoadedVotersCount;
        let nextPageTotal = pageIndex  * this.state.numberPerPage;
        if (nextPageTotal >= skipRows) { //check if need to load more voters
            ElectionsActions.getVotersByBallotBoxes(this.props.dispatch, this.props.walkerReportData.requestData, false, skipRows);
        } else {
            //Change only the "isNewSearch" to false
            this.props.dispatch({ type: ElectionsActions.ActionTypes.REPORTS.WALKERS.GENERAL_REPORT.CHANGE_SEARCH_REPORT_FIELD_VALUE, fieldName: 'isNewSearch', fieldValue: false });
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
        this.totalLoadedVotersCount = this.props.walkerReportData.resultVotersList.length
        this.initViewData();
        let totalVotersCount = thousandsSeparatesForNumber(this.props.walkerReportData.totalVotersCount);

        // console.log(this.props.walkerReportData);
        let displayResult = this.totalLoadedVotersCount > 0 ? true : false;
        if (this.props.walkerReportData.loadingSearchResults) {
            return (
                <div className="row text-center"><i className="fa fa-spinner fa-spin"></i> טוען...</div>
            )
        }
        return (
            <div ref={this.getRef.bind(this)} className={!displayResult ? 'hide' : ''}>
                <div style={{ paddingTop: '5px' }}>
                    <div className="row rsltsTitleRow">
                        <div className="col-lg-6 text-right">
                            <div id="go-top-list"></div>
                            <h3 className="separation-item noBgTitle">נמצאו<span className="counter">{totalVotersCount}</span>תושבים</h3>
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
                <table className="table table-striped table-bordered">
                    <tbody>
                        {this.tableRows}
                    </tbody>
                </table>

                <nav aria-label="Page navigation paginationRow">
                    <div className="text-center">
                        {this.paginationItem}
                    </div>
                </nav>
                <div className="row single-line box-content">
                    <div className="col-lg-12">
                        <a data-toggle="tooltip" onClick={this.scrollToPageTop.bind(this)} data-placement="left" className="go-top-page-btn item-space" style={{ cursor: 'pointer' }} title="לראש העמוד"></a>
                        <a data-toggle="tooltip" onClick={this.scrollToResultsTop.bind(this)} data-placement="left" className="go-top-list-btn" style={{ cursor: 'pointer' }} title="לראש הרשימה"></a>
                    </div>
                </div>
            </div>
        )
    }

}
function mapStateToProps(state) {

    return {
        currentUser: state.system.currentUser,
        walkerReportData: state.elections.reportsScreen.generalWalkerReport,
        cityName: state.elections.reportsScreen.generalWalkerReport.cityName,
    }
}

export default connect(mapStateToProps)(ReportSearchResults);