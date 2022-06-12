import React from 'react';

const StatusChangeResultItem = ({item, searchFields, supportStatuses}) => {
    const supportNoneKey = 'support_none';

    function getSupportStatusesHash() {
        var supportStausesHash = {};

        for ( let statusIndex = 0; statusIndex < supportStatuses.length; statusIndex++ ) {
            let hashKey = supportStatuses[statusIndex].key;

            supportStausesHash[hashKey] = supportStatuses[statusIndex];
        }

        return supportStausesHash;
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

    function getGeoItem() {
        const summaryBy = require('../../../../libs/constants').statusesChangeReport.summaryBy;

        switch (searchFields.summary_by_id) {
            case summaryBy.none:
                let filterBy = getDisplayFilter();

                switch (filterBy) {
                    case summaryBy.byCity:
                        return item.city_name;
                        break;

                    case summaryBy.byCluster:
                        return item.cluster_name;
                        break;

                    case summaryBy.byBallot:
                        return item.ballot_box_name;
                        break;
                }
                break;

            case summaryBy.byArea:
                return item.area_name;
                break;

            case summaryBy.byCity:
                return item.city_name;
                break;

            case summaryBy.byCluster:
                return item.cluster_name;
                break;

            case summaryBy.byBallot:
                return item.ballot_box_name;
                break;
        }
    }

    function renderSupportStatuses() {
        var supportStausesHash = getSupportStatusesHash();

        let supportStatusesItems = [];

        let supportStatuses = searchFields.selected_statuses.map(function(supportStatusKey, index) {
            if (supportStatusKey != supportNoneKey) {
                let supportStatusId = supportStausesHash[supportStatusKey].id;
                let className = "support-level" + supportStausesHash[supportStatusKey].level;

                let countFieldUp = 'count_support_status' + supportStatusId + '_up';
                let currentKey = supportStatusId + '_up';
                supportStatusesItems.push(<td key={currentKey} className={className}>{item[countFieldUp]}</td>);

                className += " white-space";
                let countFieldDown = 'count_support_status' + supportStatusId + '_down';
                currentKey = supportStatusId + '_down';
                supportStatusesItems.push(<td key={currentKey} className={className}>{item[countFieldDown]}</td>);
            }
        });

        return supportStatusesItems;
    }

    function isNOSupportSelected() {
        let statusIndex = searchFields.selected_statuses.findIndex(statusKey => statusKey == supportNoneKey);

        return (statusIndex != -1);
    }

    return (
        <tr>
            <td>{getGeoItem()}</td>

            { isNOSupportSelected() &&
                <td className="support-level0">{item.count_support_status_none_up}</td>
            }

            { isNOSupportSelected() &&
                <td className="support-level0 white-space">{item.count_support_status_none_down}</td>
            }

            {renderSupportStatuses()}

            <td className="text-center">{item.count_total_activity}</td>
            <td className="text-center">{item.count_voters_handled}</td>
            <td className="text-center">{item.voters_in_election_campaigns_count}</td>
            <td className="text-center">{item.percent_voters_handled}%</td>
        </tr>
    );
};

export default StatusChangeResultItem;