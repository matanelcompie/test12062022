import React from 'react';
import {Link} from 'react-router';

const PollingSummaryActions = ({totalSummaryResults, recordsPerPage, recordsPerPageChange, loadNewPerPageRows, searchFields}) => {
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

			if(searchKey == 'selected_cities' || searchKey == 'selected_neighborhoods'  || searchKey == 'selected_clusters' || searchKey=='selected_ballots'){
				urlKeys.push(searchKey + '=' + JSON.stringify(searchFields[searchKey]));
			}
            else if ( searchFields[searchKey] != null && searchKey != 'selected_campaigns' ) {
                urlKeys.push(searchKey + '=' + searchFields[searchKey]);
            }
        }

        if ( urlKeys.length > 0 ) {
            for ( let campaignIndex = 0; campaignIndex < searchFields.selected_campaigns.length; campaignIndex++ ) {
                urlKeys.push('selected_campaigns[]=' + searchFields.selected_campaigns[campaignIndex]);
            }

            for ( let selectedStatusIndex = 0; selectedStatusIndex < searchFields.selected_statuses.length; selectedStatusIndex++ ) {
                urlKeys.push('selected_statuses[]=' + searchFields.selected_statuses[selectedStatusIndex]);
            }

            return urlKeys.join('&');
        } else {
            return '';
        }
    }

    let urlKeys = convertToUrlKeys();
    let exportLink = 'elections/reports/ballots-summary/export';

    if ( totalSummaryResults > 0 ) {
        exportLink += '?' + urlKeys;
    }

    return (
        <div className="container margin-bottom20" style={getBlockStyle()}>
            <div className="row">
                <div className="col-lg-6">
                    <div id="go-top-list"></div>
                    <h3 className="separation-item noBgTitle">נמצאו<span className="counter">{totalSummaryResults}</span>רשומות</h3>
                    <span className="item-space">הצג</span>
                    <input className="item-space input-simple" type="number" value={recordsPerPage}
                           onChange={rowsPerPageChange.bind(this)}/>
                    <span className="item-space">תוצאות</span>
                    <button title="שנה" type="submit" className="btn btn-primary btn-sm" onClick={loadNewPerPageRows.bind(this)}>שנה</button>
                </div>

                <div className="col-lg-6 clearfix">
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

export default PollingSummaryActions;