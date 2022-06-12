import React from 'react';
import {Link} from 'react-router';

const Captain50ActivityActions = ({totalSummaryResults, recordsPerPage, recordsPerPageChange, loadNewPerPageRows, searchFields}) => {
    function getBlockStyle() {
        let style = {};

        if ( totalSummaryResults == 0 ) {
            style = {display: 'none'};
        }

        return style;
    }

    function rowsPerPageChange(event) {
        let rowsPerPage = event.target.value;

        recordsPerPageChange(rowsPerPage);
    }

    function convertToUrlKeys() {
        if ( totalSummaryResults == 0 ) {
            return '';
        }

        let searchKeys = Object.keys(searchFields);
        let urlKeys = [];

        for ( let searchIndex = 0; searchIndex < searchKeys.length; searchIndex++ ) {
            let searchKey = searchKeys[searchIndex];

            if ( searchFields[searchKey] != null  ) {
                urlKeys.push(searchKey + '=' + searchFields[searchKey]);
            }
        }

        if ( urlKeys.length > 0 ) {
            return urlKeys.join('&');
        } else {
            return '';
        }
    }

    let urlKeys = convertToUrlKeys();
    let exportLink = 'elections/reports/captain50-activity/export';
    let exportSummaryLink = 'elections/reports/captain50-activity-summary/export';
    let exportCaptainByBallotsLink = 'elections/reports/captain50-by-ballots/export';

    if ( totalSummaryResults > 0 ) {
        exportLink += '?' + urlKeys;
        exportSummaryLink += '?' + urlKeys;
        exportCaptainByBallotsLink += '?' + urlKeys;
    }

    return (
        <div className="row rsltsTitleRow" style={getBlockStyle()}>
            <div className="col-lg-6">
                <div id="go-top-list"></div>
                <h3 className="separation-item noBgTitle">נמצאו<span className="counter">{totalSummaryResults}</span>רשומות</h3>
                <span className="item-space">הצג</span>
                <input className="item-space input-simple" type="number" value={recordsPerPage} onChange={rowsPerPageChange.bind(this)}/>
                    <span className="item-space">תוצאות</span>
                    <button title="שנה" type="submit" className="btn btn-default btn-sm" onClick={loadNewPerPageRows.bind(this)} style={{backgroundColor:'#498BB6' }}>שנה</button>
            </div>
            <div className="col-lg-6 clearfix">
                <div className="link-box pull-left">
                    <Link title="ייצוא לפי קלפיות" to={exportCaptainByBallotsLink} className="icon-box excel" target="_blank"/>&nbsp;&nbsp;
                    <Link title="ייצוא ל CSV" to={exportSummaryLink} className="icon-box excel" target="_blank"/>&nbsp;&nbsp;
                    <Link title="הדפסה" to={exportLink + '&file_type=print'} className="icon-box print" target="_blank"/>&nbsp;&nbsp;
                    <Link title="יצוא ל-pdf" to={exportLink + '&file_type=pdf'} className="icon-box pdf" target="_blank"/>
                </div>
            </div>
        </div>
    );
};

export default Captain50ActivityActions;