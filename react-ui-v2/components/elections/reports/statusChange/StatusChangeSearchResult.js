import React from 'react';

import SupportStatusSortItem from './SupportStatusSortItem';
import StatusChangeResultItem from './StatusChangeResultItem';
import Pagination from '../../../global/Pagination';

const StatusChangeSearchResult = ({searchFields, supportStatuses, totalSummaryResults, sortSupportStatus, rowOfTotalSums,
                                   currentPageRows, displayItemsPerPage, currentPage, navigateToPage, buttonSearchClicked,
                                   }) => {
    const supportNoneKey = 'support_none';
    const sortDirections = require('../../../../libs/constants').statusesChangeReport.sortDirections;

    function getSupportStatusesHash() {
        var supportStausesHash = {};

        for ( let statusIndex = 0; statusIndex < supportStatuses.length; statusIndex++ ) {
            let hashKey = supportStatuses[statusIndex].key;

            supportStausesHash[hashKey] = supportStatuses[statusIndex];
        }

        return supportStausesHash;
    }

    function getBlockStyle() {
        let style = {};

        if ( totalSummaryResults == 0 ) {
            style = {display: 'none'};
        }

        return style;
    }

    function getDisplayFilter() {
        const summaryBy = require('../../../../libs/constants').statusesChangeReport.summaryBy;

        if ( searchFields.ballot_id != null ) {
            return summaryBy.byBallot;
        } else if ( searchFields.cluster_id != null ) {
            return summaryBy.byBallot;
        } else if ( searchFields.city_id != null ) {
            return summaryBy.byCluster;
        } else if ( searchFields.sub_area_id != null ) {
            return summaryBy.byCity;
        } else if ( searchFields.area_id != null ) {
            return summaryBy.byCity;
        }
    }

    function getGeoHeader() {
        const summaryBy = require('../../../../libs/constants').statusesChangeReport.summaryBy;

        switch (searchFields.summary_by_id) {
            case summaryBy.none:
                let filterBy = getDisplayFilter();

                switch (filterBy) {
                    case summaryBy.byCity:
                        return 'עיר';
                        break;

                    case summaryBy.byCluster:
                        return 'אשכול';
                        break;

                    case summaryBy.byBallot:
                        return 'קלפי';
                        break;
                }
                break;

            case summaryBy.byArea:
                return 'איזור';
                break;

            case summaryBy.byCity:
                return 'עיר';
                break;

            case summaryBy.byCluster:
                return 'אשכול';
                break;

            case summaryBy.byBallot:
                return 'קלפי';
                break;
        }
    }

    function renderSupportStatusesHeaders() {
        var supportStausesHash = getSupportStatusesHash();

        let selectedStatusesNames = searchFields.selected_statuses.map(function(item, index) {
            let supportStatusKey = item;

            if ( supportStatusKey != supportNoneKey ) {
                let supportStatusName = supportStausesHash[supportStatusKey].name;
                let supportStatusLevel = supportStausesHash[supportStatusKey].level;
                let className = "support-level" + supportStatusLevel + " white-space";

                return <th key={index} colSpan="2" className={className}>{supportStatusName}</th>;
            }
        });

        return selectedStatusesNames;
    }

    function renderSupportStatusSortItems() {
        var supportStausesHash = getSupportStatusesHash();

        const fieldDirections = require('../../../../libs/constants').statusesChangeReport.fieldDirections;
        let supportStatusesItems = [];

        let supportStatuses = searchFields.selected_statuses.map(function(item, index) {
            let supportStatusKey = item;

            if ( supportStatusKey != supportNoneKey ) {
                let supportStatusId = supportStausesHash[supportStatusKey].id;
                let supportStatusLevel = supportStausesHash[supportStatusKey].level;

                let countFieldUp = 'count_support_status' + supportStatusId + '_up';
                let currentKey = supportStatusId + '_up';
                supportStatusesItems.push(<SupportStatusSortItem key={currentKey} fieldName={countFieldUp}
                                                                 direction={fieldDirections.up}
                                                                 sortSupportStatus={sortSupportStatus.bind(this)}
                                                                 supportStatusLevel={supportStatusLevel} whiteSpace={false}/>);

                let countFieldDown = 'count_support_status' + supportStatusId + '_down';
                currentKey = supportStatusKey + '_down';
                supportStatusesItems.push(<SupportStatusSortItem key={currentKey} fieldName={countFieldDown}
                                                                 direction={fieldDirections.down}
                                                                 sortSupportStatus={sortSupportStatus.bind(this)}
                                                                 supportStatusLevel={supportStatusLevel} whiteSpace={true}/>);
            }
        });

        return supportStatusesItems;
    }

    function renderSummarySupportStatuses() {
        var supportStausesHash = getSupportStatusesHash();

        let supportStatusesItems = [];

        let supportStatuses = searchFields.selected_statuses.map(function(supportStatusKey, index) {
            if (supportStatusKey != supportNoneKey) {
                let supportStatusId = supportStausesHash[supportStatusKey].id;

                let sumFieldUp = 'sum_support_status' + supportStatusId + '_up';
                let currentKey = supportStatusId + '_up';
                let className = "support-level" + supportStausesHash[supportStatusKey].level;
                supportStatusesItems.push(<td key={currentKey} className={className}>{rowOfTotalSums[sumFieldUp]}</td>);

                let sumFieldDown = 'sum_support_status' + supportStatusId + '_down';
                currentKey = supportStatusId + '_down';
                className += " white-space";
                supportStatusesItems.push(<td key={currentKey} className={className}>{rowOfTotalSums[sumFieldDown]}</td>);
            }
        });

        return supportStatusesItems;
    }

    function renderResultRows() {
        let rows = currentPageRows.map( function(item, index) {
            return <StatusChangeResultItem key={index} item={item} searchFields={searchFields} supportStatuses={supportStatuses}/>
        });

        return rows;
    }

    function isNOSupportSelected() {
        let statusIndex = searchFields.selected_statuses.findIndex(statusKey => statusKey == supportNoneKey);

        return (statusIndex != -1);
    }
	

    return (
        <div className="container" style={getBlockStyle()}>
            <div className=" dtlsBox rsltsTitleRow srchRsltsBox clearfix">
                <div className="scroll-table">
                    <div className="tableList">
                        <table className="table table-status-change table-frame standard-frame table-striped tableNoMarginB householdLIst">
                            <thead>
                            <tr>
                                <th>{getGeoHeader()}</th>

                                { isNOSupportSelected() &&
                                    <th className="support-level0 white-space" colSpan="2">ללא סטטוס</th>
                                }

                                {renderSupportStatusesHeaders()}

                                <th className="text-center">סה”כ פעולות</th>
                                <th className="text-center">טופלו</th>
                                <th className="text-center">סה”כ תושבים</th>
                                <th className="text-center">טופל ב%</th>
                            </tr>
                            <tr>
                                <th width="10%">{'\u00A0'}</th>

                                { isNOSupportSelected() &&
                                <th className="support-level0">
                                    <span className="status-text">עלה</span>
                                    <a onClick={sortSupportStatus.bind(this, 'count_support_status_none_up', sortDirections.up)}
                                       className="arrow-up" style={{cursor: 'pointer'}}/>
                                    <a onClick={sortSupportStatus.bind(this, 'count_support_status_none_up', sortDirections.down)}
                                       className="arrow-down" style={{cursor: 'pointer'}}/>
                                </th>
                                }

                                { isNOSupportSelected() &&
                                <th className="support-level0 white-space">
                                    <span className="status-text">ירד</span>
                                    <a onClick={sortSupportStatus.bind(this, 'count_support_status_none_down', sortDirections.up)}
                                       className="arrow-up" style={{cursor: 'pointer'}}/>
                                    <a onClick={sortSupportStatus.bind(this, 'count_support_status_none_down', sortDirections.down)}
                                       className="arrow-down" style={{cursor: 'pointer'}}/>
                                </th>
                                }

                                {renderSupportStatusSortItems()}

                                <th className="text-center">
                                    <a onClick={sortSupportStatus.bind(this, 'count_total_cactivity', sortDirections.up)}
                                       className="arrow-up" style = {{cursor: 'pointer'}}/>
                                    <a onClick={sortSupportStatus.bind(this, 'count_total_cactivity', sortDirections.down)}
                                       className="arrow-down" style = {{cursor: 'pointer'}}/>
                                </th>
                                <th className="text-center">
                                    <a onClick={sortSupportStatus.bind(this, 'count_voters_handled', sortDirections.up)}
                                       className="arrow-up" style = {{cursor: 'pointer'}}/>
                                    <a onClick={sortSupportStatus.bind(this, 'count_voters_handled', sortDirections.down)}
                                       className="arrow-down" style = {{cursor: 'pointer'}}/>
                                </th>
                                <th className="text-center">
                                    <a onClick={sortSupportStatus.bind(this, 'voters_in_election_campaigns_count', sortDirections.up)}
                                       className="arrow-up" style = {{cursor: 'pointer'}}/>
                                    <a onClick={sortSupportStatus.bind(this, 'voters_in_election_campaigns_count', sortDirections.down)}
                                       className="arrow-down" style = {{cursor: 'pointer'}}/>
                                </th>
                                <th className="text-center">
                                    <a onClick={sortSupportStatus.bind(this, 'percent_voters_handled', sortDirections.up)}
                                       className="arrow-up" style = {{cursor: 'pointer'}}/>
                                    <a onClick={sortSupportStatus.bind(this, 'percent_voters_handled', sortDirections.down)}
                                       className="arrow-down" style = {{cursor: 'pointer'}}/>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            <tr className="sum-status">
                                <td>סה"כ</td>

                                { isNOSupportSelected() &&
                                    <td>{rowOfTotalSums.sum_support_status_none_up}</td>
                                }

                                { isNOSupportSelected() &&
                                    <td className="white-space">{rowOfTotalSums.sum_support_status_none_down}</td>
                                }

                                {renderSummarySupportStatuses()}

                                <td className="text-center">{rowOfTotalSums.sum_total_activity}</td>
                                <td className="text-center">{rowOfTotalSums.sum_voters_handled}</td>
                                <td className="text-center">{rowOfTotalSums.sum_total_voters}</td>
                                <td className="text-center">{rowOfTotalSums.percent_sum_voters_handled}%</td>
                            </tr>

                            {renderResultRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            { (totalSummaryResults > displayItemsPerPage) &&
            <Pagination resultsCount={totalSummaryResults}
                        displayItemsPerPage={displayItemsPerPage}
                        currentPage={currentPage}
                        navigateToPage={navigateToPage.bind(this)}/>
            }
        </div>
    );
};

export default StatusChangeSearchResult;