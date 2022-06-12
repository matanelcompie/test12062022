import React from 'react';

import constants from 'libs/constants';

import PollingSummaryResultItem from './PollingSummaryResultItem';
import Pagination from '../../../global/Pagination';

const PollingSummaryResult = ({searchFields, supportStatuses, electionsCampaignsHash, currentPageRows, totalSummaryResults,
                               displayItemsPerPage, currentPage, loadingMoreData, navigateToPage, rowOfTotalSums , currentDataLength}) => {
    const supportNoneKey = 'support_none';
	
	let disableFromPage = null;
	if(displayItemsPerPage > 0){
		disableFromPage = Math.ceil(currentDataLength/displayItemsPerPage) + 1;
	} 
	 ;
	
    function getSupportStatusesHash() {
        let supportStatusesHash = {};

        for ( let supportStatusIndex = 0; supportStatusIndex < supportStatuses.length; supportStatusIndex++ ) {
            let supportStatusKey = supportStatuses[supportStatusIndex].key;

            supportStatusesHash[supportStatusKey] = supportStatuses[supportStatusIndex];
        }

        return supportStatusesHash;
    }

    function getDisplayFilter() {
        const summaryBy = constants.ballotsPollingSummary.summaryBy;

        if ( searchFields.ballot_id != null ) {
            return summaryBy.byBallot;
        } else if ( searchFields.cluster_id != null ) {
            return summaryBy.byBallot;
        } else if ( searchFields.selected_cities != null && searchFields.selected_cities.length > 0) {
            return summaryBy.byCluster;
        } else if ( searchFields.sub_area_id != null ) {
            return summaryBy.byCity;
        } else if ( searchFields.area_id != null ) {
            return summaryBy.byCity;
        }
    }

    function getCurrentCampaignColSpan() {
        if ( 1 == searchFields.display_num_of_votes ) {
            return 6;
        } else {
            return 4;
        }
    }

    function renderShasVotesHeader() {
        var numOfCampaigns = searchFields.selected_campaigns.length;

        if ( 1 == numOfCampaigns ) {
            return <th className="text-center">הצבעות ש”ס</th>;
        } else {
            return <th colSpan={numOfCampaigns} className="text-center">הצבעות ש”ס</th>
        }
    }

    function renderShasStatusesHeader() {
        var numOfSystemStatuses = supportStatuses.length;
        var numOfCampaigns = searchFields.selected_campaigns.length;
        var numOfColSpans = 0;

        if ( null == searchFields.support_status_id ) {
            numOfColSpans = (numOfSystemStatuses + 1) * numOfCampaigns;
        } else {
            numOfColSpans = numOfCampaigns;
        }

        if ( 1 == numOfColSpans ) {
            return <th className="text-center">סטטוסים</th>;
        } else {
            return  <th colSpan={numOfColSpans} className="text-center">סטטוסים</th>;
        }
    }
    function renderPrevShasVotesHeader(){
        var numOfCampaigns = searchFields.selected_campaigns.length;
        let totalCols = numOfCampaigns * 2
        return (
            <th colSpan={totalCols} style={{textAlign:'center'}}>אחוז הצבעה ש"ס</th>
        )
    }

    function renderGeoHeaders() {
        const summaryBy = require('../../../../libs/constants').ballotsPollingSummary.summaryBy;

        switch (searchFields.summary_by_id) {
            case summaryBy.none:
 
                let filterBy = getDisplayFilter();

                switch (filterBy) {
                    case summaryBy.byCity:
                        return (
                            [
                                <th key={0}>אשכול</th>,
                                <th key={1}>מספר קלפיות</th>
                            ]
                        );
                        break;

                    case summaryBy.byCluster:
                        return (
                            [
                                <th key={0}>אשכול</th>,
                                <th key={1}>מספר קלפיות</th>
                            ]
                        );
                        break;

                    case summaryBy.byBallot:
                        return (
                            [
                                <th key={0}>אשכול</th>,
                                <th key={1}>קלפי</th>
                            ]
                        );
                        break;
                }
                break;

            case summaryBy.byArea:
            case summaryBy.byCity:
                return (
                    [
                        <th key={0}>מספר אשכולות</th>,
                        <th key={1}>מספר קלפיות</th>
                    ]
                );
                break;

            case summaryBy.byCluster:
                return (
                    [
                        <th key={0}>אשכול</th>,
                        <th key={1}>מספר קלפיות</th>
                    ]
                );
                break;

            case summaryBy.byBallot:
                return (
                    [
                        <th key={0}>אשכול</th>,
                        <th key={1}>קלפי</th>
                    ]
                );
                break;
        }
    }

    function renderNumOfVotesHeaders() {
        return (
            [
                <th key={0}>מספר תושבים</th>,
                <th key={1} className="table-border-left" >אחוזי הצבעה</th>
            ]
        );
    }

    function renderSelectedCampaignsNames() {
        var numOfSelectedCampaigns = searchFields.selected_campaigns.length;

        let selectedCampaigns = searchFields.selected_campaigns.map( function(campaignId, index) {
            let electionCampaignKeyHash = 'election_' + campaignId;
            let electionCampaignName = electionsCampaignsHash[electionCampaignKeyHash].name;

            let className = "";
            if ( index == (numOfSelectedCampaigns - 1) ) {
                className = "table-border-left";
            }

            return <th key={index} className={className}>{electionCampaignName}</th>;
        });

        return selectedCampaigns;
    }

    function renderSelectedSupportStatuses() {
        var numOfCampaigns = searchFields.selected_campaigns.length;
        let supportStatusesHash = getSupportStatusesHash();

        let supportStatusNames = searchFields.selected_statuses.map( function(supportStatusKey, index) {
            let supportStatusName = '';

            if ( supportStatusKey == supportNoneKey ) {
                supportStatusName = 'ללא סטטוס';
            } else {
                supportStatusName = supportStatusesHash[supportStatusKey].name;
            }

            if ( 1 == numOfCampaigns ) {
                return <th key={index} className="text-center">{supportStatusName}</th>;
            } else {
                return <th key={index} colSpan={numOfCampaigns} className="text-center">{supportStatusName}</th>;
            }
        });

        return supportStatusNames;
    }

    function renderRowSumsShasVotes() {
        var numOfSelectedCampaigns = searchFields.selected_campaigns.length;

        let selectedCampaigns = searchFields.selected_campaigns.map( function(campaignId, index) {
            let shasVotes = 0;

            let className = "";
            if ( index == (numOfSelectedCampaigns - 1) ) {
                className = "table-border-left";
            }

            if ( !rowOfTotalSums.shas_votes || !rowOfTotalSums.shas_votes.election_campaigns || !rowOfTotalSums.shas_votes.election_campaigns[campaignId] ) {
            } else {
                shasVotes = rowOfTotalSums.shas_votes.election_campaigns[campaignId].sum_shas_votes;
            }

            return <td key={index} className={className}>{shasVotes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>;
        });

        return selectedCampaigns;
    }

    function renderRowSumsSelectedSupportStatuses() {

        let selectedStatuses = [];
        let supportStatusesHash = getSupportStatusesHash();

        for ( let supportStatusIndex = 0; supportStatusIndex < searchFields.selected_statuses.length; supportStatusIndex++ ) {
            let supportStatusKey = searchFields.selected_statuses[supportStatusIndex];
            let supportStatusId = 0;
            let sumField = '';

            if ( supportStatusKey == supportNoneKey ) {
                supportStatusId = 0;
                sumField = 'sum_voter_support_status_none';
            } else {
                supportStatusId = supportStatusesHash[supportStatusKey].id;
                sumField = 'sum_voters_support_status' + supportStatusId;
            }

            for ( let campiaignIndex = 0; campiaignIndex < searchFields.selected_campaigns.length; campiaignIndex++ ) {
                let campaignId = searchFields.selected_campaigns[campiaignIndex];
                let currentKey = supportStatusId + '_' + campaignId;

                let sumOfCurrentStatus = 0;

                if (!rowOfTotalSums.statuses || !rowOfTotalSums.statuses.election_campaigns || !rowOfTotalSums.statuses.election_campaigns[campaignId]) {
                } else {
                    sumOfCurrentStatus = rowOfTotalSums.statuses.election_campaigns[campaignId][sumField];
                }

                selectedStatuses.push(<td key={currentKey}>{sumOfCurrentStatus.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>);
            }
        }

        return selectedStatuses;
    }

    function renderResultRows() {
		
        let rows = currentPageRows.map( function(item, index) {
			return <PollingSummaryResultItem key={index} item={item} searchFields={searchFields} supportStatuses={supportStatuses}/>
        });

        return rows;
    }
    let numOfColSpans = searchFields.selected_campaigns.length
    return (
        <div className="container">
            <div className="dtlsBox rsltsTitleRow srchRsltsBox clearfix" style={{ overflow: 'auto' }}>
                <div className="polling-table">
                    <div className="tableList">
                        <table className="table table-polling-stations table-frame standard-frame table-striped tableNoMarginB householdLIst">
                            <thead>
                            <tr className="light-gray">
                                <th colSpan={getCurrentCampaignColSpan()} className="text-center">מערכת בחירות נוכחית</th>

                                { (1 == searchFields.display_vote_statistics) &&
                                    renderShasVotesHeader()
                                }
                                { (1 == searchFields.display_statuses_statistics) &&
                                    renderShasStatusesHeader()
                                }

                                { (1 == searchFields.display_prev_votes_percents) &&
                                    renderPrevShasVotesHeader()
                                }
                                { (1 == searchFields.display_sephardi_percents) &&
                                    <th colSpan={numOfColSpans} className="text-center">אחוז חרדי</th>
                                }
                                { (1 == searchFields.display_strictly_orthodox_percents) &&
                                    <th colSpan={numOfColSpans} className="text-center">אחוז ספרדי</th>
                                }
                            </tr>

                            <tr className="title-polling-sub1">
                                <th>קוד עיר</th>
                                <th >{(searchFields.summary_by_id == constants.ballotsPollingSummary.summaryBy.byArea)? "אזור":"עיר"}</th>

                                {renderGeoHeaders()}

                                { (1 == searchFields.display_num_of_votes) &&
                                      renderNumOfVotesHeaders()
                                }

                                { (1 == searchFields.display_vote_statistics) &&
                                    renderSelectedCampaignsNames()
                                }
                                { (1 == searchFields.display_statuses_statistics) &&
                                    renderSelectedSupportStatuses()
                                }
                                { (1 == searchFields.display_prev_votes_percents) &&
                                    <th colSpan={numOfColSpans} className="text-center">אחוז הצבעה כללי</th>
                                }
                                { (1 == searchFields.display_prev_votes_percents) &&
                                    <th colSpan={numOfColSpans} className="text-center">אחוז הצבעה ש"ס </th> 
                                }
                                { (1 == searchFields.display_sephardi_percents) &&
                                    <th colSpan={numOfColSpans} className="text-center">אחוז חרדי</th>
                                }
                                { (1 == searchFields.display_strictly_orthodox_percents) &&
                                    <th colSpan={numOfColSpans} className="text-center">אחוז ספרדי</th>
                                }

                            </tr>
                            </thead>

                            <tbody>
                            <tr className="sum-status">
                                <td colSpan={getCurrentCampaignColSpan()} className="text-center total-polling table-border-left">סה"כ</td>

                                { (1 == searchFields.display_vote_statistics) &&
                                    renderRowSumsShasVotes()
                                }

                                { (1 == searchFields.display_statuses_statistics) &&
                                    renderRowSumsSelectedSupportStatuses()
                                }
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
                            navigateToPage={navigateToPage.bind(this)} disableFromPage={disableFromPage} />
            }
            <i className={"fa fa-spinner fa-pulse fa-3x fa-fw" + (loadingMoreData ? '' : ' hidden')} style={{ fontSize: '20px', margin: '0 auto', 'marginBottom': '10px', marginTop: '-10px', display: 'block' }} />

        </div>
    );
};

export default PollingSummaryResult;