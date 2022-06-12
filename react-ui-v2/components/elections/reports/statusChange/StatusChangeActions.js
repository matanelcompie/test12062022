import React from 'react';
import {Link} from 'react-router';

const StatusChangeActions = ({totalSummaryResults, recordsPerPage, recordsPerPageChange, loadNewPerPageRows, searchFields,
                              sortByField, sortDirection, loadingData, buttonSearchClicked}) => {
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

            if ( searchFields[searchKey] != null && searchKey != 'selected_statuses' ) {
                urlKeys.push(searchKey + '=' + searchFields[searchKey]);
            }
        }

        if ( urlKeys.length > 0 ) {
            for ( let statusIndex = 0; statusIndex < searchFields.selected_statuses.length; statusIndex++ ) {
                urlKeys.push('selected_statuses[]=' + searchFields.selected_statuses[statusIndex]);
            }

            if ( sortByField != null ) {
                urlKeys.push('sort_by_field=' + sortByField);

                if ( sortDirection != null ) {
                    urlKeys.push('sort_direction=' + sortDirection);
                }
            }

            return urlKeys.join('&');
        } else {
            return '';
        }
    }

    let urlKeys = convertToUrlKeys();
    let exportLink = 'elections/reports/status-change/export';

    if ( totalSummaryResults > 0 ) {
        exportLink += '?' + urlKeys;
    }

    return (
        <div className="container margin-bottom20" style={loadingData || !buttonSearchClicked ? {display: 'none'} : {}}>
            <div className="row">
                <div className="col-lg-6">
                    <div id="go-top-list"></div>
                    <h3 className="separation-item noBgTitle">נמצאו<span className="counter">{totalSummaryResults}</span>רשומות</h3>
                    <span className="item-space">הצג</span>
                    <input className="item-space input-simple" type="number" value={recordsPerPage} onChange={rowsPerPageChange.bind(this)}/>
                        <span className="item-space">תוצאות</span>
                        <button title="שנה" type="submit" className="btn new-btn-default btn-sm"
                                onClick={loadNewPerPageRows.bind(this)} disabled={totalSummaryResults == 0}>שנה
                        </button>
                </div>
                <div className="col-lg-6 clearfix" style={getBlockStyle()}>
                    <div className="link-box pull-left">
                        <Link title="יצוא ל-pdf" to={exportLink + '&file_type=pdf'} className="icon-box pdf" target="_blank"/>
                        <Link title="יצוא ל-אקסל" to={exportLink + '&file_type=xls'} className="icon-box excel" target="_blank"/>
                        <Link title="הדפסה" to={exportLink + '&file_type=print'} className="icon-box print" target="_blank"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeActions;