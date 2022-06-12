import React from 'react';

import constants from 'libs/constants';
import {withCommas} from 'libs/globalFunctions';

Array.prototype.sum = function (prop) {
    var total = 0
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
		if(this[i][prop] && !isNaN(this[i][prop])){
			total += this[i][prop];
		}
    }
    return total;
}

const PollingSummaryResultItem = ({item, searchFields, supportStatuses}) => {
    const supportNoneKey = 'support_none';
	const summaryBy = constants.ballotsPollingSummary.summaryBy;
	
    function getSupportStatusesHash() {
        let supportStatusesHash = {};

        for ( let supportStatusIndex = 0; supportStatusIndex < supportStatuses.length; supportStatusIndex++ ) {
            let supportStatusKey = supportStatuses[supportStatusIndex].key;

            supportStatusesHash[supportStatusKey] = supportStatuses[supportStatusIndex];
        }

        return supportStatusesHash;
    }

    function getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

    function getDisplayFilter() {
        const summaryBy = constants.ballotsPollingSummary.summaryBy;
 
        if ( searchFields.selected_ballots != null && searchFields.selected_ballots.length > 0 ) {	 
            return summaryBy.byBallot;
        } else if ( searchFields.selected_clusters != null  && searchFields.selected_clusters.length > 0) {
            return summaryBy.byBallot;
        } else if ( searchFields.selected_cities != null  && searchFields.selected_cities.length > 0) {
            return summaryBy.byCluster;
        } else if ( searchFields.sub_area_id != null ) {
            return summaryBy.byCity;
        } else if ( searchFields.area_id != null ) {
            return summaryBy.byCity;
        }
    }

    function renderGeoItems() {
        const summaryBy = constants.ballotsPollingSummary.summaryBy;
        let className = (0 == searchFields.display_vote_statistic) ? 'border-left' : '';
        let notExistInCampaign = (item.count_total_voters == undefined || item.count_total_voters == 0 ) ;
        let titleText = (searchFields.summary_by_id == summaryBy.byCluster) ? 'אשכול' : 'קלפי';
        
		let notExistInCampaignItem = <i className="fa fa-exclamation-triangle" aria-hidden="true" style={{ color: 'red' }} title={titleText + ' לא קיים במערכת בחירות הנוכחית '}></i>
        
		switch (searchFields.summary_by_id) {
            case summaryBy.none:
                let filterBy = getDisplayFilter();

                switch (filterBy) {
                    case summaryBy.byCity:
                        return (
                            [
                                <td key={0}>{item.clusters_count}</td>,
                                <td key={1} className={className}>{item.count_ballot_boxes}</td>
                            ]
                        );
                    case summaryBy.byCluster:
                        return (
                            [
                                <td key={0}>{item.cluster_name} {notExistInCampaign ? notExistInCampaignItem :''} </td>,
                                <td key={1} className={className}>{item.ballot_boxes_count}</td>
                            ]
                        );
                    case summaryBy.byBallot:
                        return (
                            [
                                <td key={0}>{item.cluster_name}</td>,
                                <td key={1} className={className}>{getBallotMiId(item.ballot_box_name)} {notExistInCampaign ? notExistInCampaignItem :''}</td>
                            ]
                        );
                }
                break;
            case summaryBy.byArea:
				return (
                    [
                        <td key={0}>{item.clusters_count}</td>,
                        <td key={1} className={className}>{item.count_ballot_boxes}</td>
                    ]
                );
				break;
            case summaryBy.byCity:
                return (
                    [
                        <td key={0}>{item.clusters_count}</td>,
                        <td key={1} className={className}>{item.count_ballot_boxes}</td>
                    ]
                );
                break;

            case summaryBy.byCluster:

                return (
                    [
                        <td key={0}>{item.cluster_name} {notExistInCampaign ? notExistInCampaignItem :''} </td>,
                        <td key={1} className={className}>{item.ballot_boxes_count}</td>
                    ]
                );
                break;

            case summaryBy.byBallot:
                return (
                    [
                        <td key={0}>{item.cluster_name}</td>,
                        <td key={1} className={className}>{getBallotMiId(item.ballot_box_name)} {notExistInCampaign ? notExistInCampaignItem :''}</td>
                    ]
                );
                break;
        }
    }

    function renderNumOfVotes() {
        let countTotalVoters = 0;
        let votePercents = 0;
		let countElectionsVotes = 0;

        if (item.count_total_voters && item.count_total_voters > 0) {
            countTotalVoters = item.count_total_voters;
			countElectionsVotes = item.count_elections_votes;
        }
		else{
			if(item.cities && item.cities.length > 0){
				 countTotalVoters = item.cities.sum('count_total_voters');
				 countElectionsVotes = item.cities.sum('count_elections_votes');
			}
		}

        if (countTotalVoters > 0 && countElectionsVotes > 0) {
            votePercents = Math.round((countElectionsVotes * 100) / countTotalVoters) + '%';
        }
		else{
			votePercents = votePercents + '%';
		}
		
        countTotalVoters = countTotalVoters > 0 ? withCommas(countTotalVoters)  : countTotalVoters;
        return (
            [
                <td key={0}>{countTotalVoters}</td>,
                <td key={1} className="border-left">{votePercents}</td>
            ]
        );
    }
 
    function renderBallotDetails(){
        let selected_campaigns = searchFields.selected_campaigns;
        let ballot_details = item.ballot_details;
        // console.log('ballot_details',ballot_details, selected_campaigns);
        let displayRows = [];
        let itemRows = {
          prev_votes: [], prev_shas_votes: [] , strictly_orthodox: [], sephardi: [],
        };

        for ( let campaignIndex = 0; campaignIndex < selected_campaigns.length; campaignIndex++ ) {

            let campaignId = selected_campaigns[campaignIndex];
            let campaignTdClass = "campaign" + campaignIndex;

            let itemHasBallotDetails = (ballot_details && ballot_details[campaignId])


            if (searchFields.display_prev_votes_percents) {
                let total_votes_percents = itemHasBallotDetails ? ballot_details[campaignId].total_votes_percents : '0'
                let shas_votes_percents = itemHasBallotDetails ? ballot_details[campaignId].shas_votes_percents : '0'
    
              itemRows["prev_votes"].push(
                <td
                  key={"total_votes_percents" + campaignId} className={campaignTdClass}>
                  {total_votes_percents + '%'}
                </td>,
              );
              itemRows["prev_shas_votes"].push(
                <td
                  key={"shas_votes_percents" + campaignId} className={campaignTdClass}>
                  {shas_votes_percents + '%'}
                </td>,
              );
            }


            if (searchFields.display_sephardi_percents) {
                let strictly_orthodox_percents = itemHasBallotDetails ? ballot_details[campaignId].strictly_orthodox_percents : '0';
              itemRows["strictly_orthodox"].push(
                <td
                  key={"strictly_orthodox_percents" + campaignId} className={campaignTdClass}>
                  {strictly_orthodox_percents + '%'}
                </td>,
              );
            }
            if (searchFields.display_strictly_orthodox_percents) {
                let sephardi_percents = itemHasBallotDetails ? ballot_details[campaignId].sephardi_percents : '0'
              itemRows["sephardi"].push(
                <td
                  key={"sephardi_percents" + campaignId} className={campaignTdClass}>
                  {sephardi_percents + '%'}
                </td>,
              );
            }


        }
        for (let i in itemRows){
            displayRows = displayRows.concat(itemRows[i]);  
        }
        return displayRows;
    }

    function getShasVoteByClusterOrCity(campaignId) {
        if (  item.shas_votes == undefined ) {
            return '0';
        }

        if (!item.shas_votes[campaignId] ) {
            return '0';
        } else {
            return withCommas(item.shas_votes[campaignId].shas_votes) || '0';;
        }
    }
	
	function getShasVoteByArea(campaignId) 
	{

        if (item.shas_votes && item.shas_votes[campaignId] && !isNaN(item.shas_votes[campaignId].shas_votes)) {
            return withCommas(item.shas_votes[campaignId].shas_votes);
        } else {
            return '0';
        }
    }

    function getShasVoteByBallot(campaignId) {
        if (  item.shas_votes == undefined ) {
            return '0';
        }

        if ( item.shas_votes[campaignId] == undefined ) {
            return '0';
        } else {
            return withCommas(item.shas_votes[campaignId].shas_votes) || '0';;
        }
    }

    function renderShasVotes() {
        const summaryBy = constants.ballotsPollingSummary.summaryBy;
        var numOfSelectedCampaigns = searchFields.selected_campaigns.length;

        let selectedCampaigns = searchFields.selected_campaigns.map( function(campaignId, index) {
            let className = "";
            if ( index == (numOfSelectedCampaigns - 1) ) {
                className = "table-border-left";
            }

            switch (searchFields.summary_by_id) {
                case summaryBy.none:
                    let filterBy = getDisplayFilter();

                    switch (filterBy) {
                        case summaryBy.byBallot:
                            return <td key={index} className={className}>{getShasVoteByBallot(campaignId)}</td>;
                            break;

                        case summaryBy.byCluster:
                        case summaryBy.byCity:
                            return <td key={index} className={className}>{getShasVoteByClusterOrCity(campaignId)}</td>;
                            break;

                    }
                    break;

                case summaryBy.byBallot:
                    return <td key={index} className={className}>{getShasVoteByBallot(campaignId)}</td>;
                    break;

                case summaryBy.byCluster:
                case summaryBy.byCity:
                    return <td key={index} className={className}>{getShasVoteByClusterOrCity(campaignId)}</td>;
                    break;
                case summaryBy.byArea:
                    return <td key={index} className={className}>{getShasVoteByArea(campaignId)}</td>;
                    break;
            }
        });

        return selectedCampaigns;
    }

    function getSupportStatusByClusterOrCity(campaignId, supportStatusId) {
        if ( item.support_statuses == undefined ) {
            return '0';
        }
		
        if ( item.support_statuses[campaignId] == undefined ) {
            return '0';
        } else {
            if ( null == supportStatusId ) {
                let notExistInCampaign = (item.count_total_voters == undefined) ;
                if (notExistInCampaign) { return 0; }
                return withCommas(item.support_statuses[campaignId].count_voter_support_status_none) || '0';;
            } else {
                let countField = 'count_voters_support_status' + supportStatusId;

                return withCommas(item.support_statuses[campaignId][countField]) || '0';;
            }
        }
    }
	
	function getSupportStatusByClusterOrCityFromArea(campaignId, supportStatusId) {
		let statusCount = 0;
			
			if ( item.support_statuses == undefined || item.support_statuses[campaignId] == undefined ) {
				return '0';
			} else {
				if ( null == supportStatusId ) {
					statusCount =  item.support_statuses[campaignId].count_voter_support_status_none ;
				} else {
					let countField = 'count_voters_support_status' + supportStatusId;
					statusCount = item.support_statuses[campaignId][countField] ;
				}
			}
		return withCommas(statusCount) || '0';
    }

    function getSupportStatusByBallot(campaignId, supportStatusId) {
        
        if ( item.support_statuses == undefined ) {
            return '0';
        } else if ( item.support_statuses[campaignId] == undefined ) {
            return '0';
        }
        if ( null == supportStatusId ) {
            return withCommas(item.support_statuses[campaignId].count_voter_support_status_none) || '0';
        } else {
            let countField = 'count_voters_support_status' + supportStatusId;
            return withCommas(item.support_statuses[campaignId][countField]) || '0';
        }
    }
     
    function renderSelectedSupportStatuses() {
        let supportStatusesHash = getSupportStatusesHash();
        let selectedStatuses = [];
        let selected_campaigns = searchFields.selected_campaigns;
        for ( let supportStatusIndex = 0; supportStatusIndex < searchFields.selected_statuses.length; supportStatusIndex++ ) {
            let supportStatusKey = searchFields.selected_statuses[supportStatusIndex];
            let supportStatusId = null;

            if ( supportStatusKey == supportNoneKey ) {
                supportStatusId = null;
            } else {
                supportStatusId = supportStatusesHash[supportStatusKey].id;
            }

            for ( let campaignIndex = 0; campaignIndex < selected_campaigns.length; campaignIndex++ ) {
                let campaignId = selected_campaigns[campaignIndex];
                let currentKey = supportStatusId + '_' + campaignId;
                let statusTdClass = "campaign" + campaignIndex;
                let lastCampaignIndex = selected_campaigns.length - 2;

                if ( campaignIndex == lastCampaignIndex ) {
                    statusTdClass += " support-status";
                }

                switch (searchFields.summary_by_id) {
                    case summaryBy.none:
                        let filterBy = getDisplayFilter();

                        switch (filterBy) {
                            case summaryBy.byBallot:
                                selectedStatuses.push(
                                    <td key={currentKey} className={statusTdClass}>
                                        {getSupportStatusByBallot(campaignId, supportStatusId)}
                                    </td>);
                                break;

                            case summaryBy.byCluster:
                            case summaryBy.byCity:
                                selectedStatuses.push(
                                    <td key={currentKey} className={statusTdClass}>
                                        {getSupportStatusByClusterOrCity(campaignId, supportStatusId)}
                                    </td>);
                                break;

                        }
                        break;

                    case summaryBy.byBallot:
                        selectedStatuses.push(
                            <td key={currentKey} className={statusTdClass}>
                                {getSupportStatusByBallot(campaignId, supportStatusId)}
                            </td>);
                        break;

                    case summaryBy.byCluster:
                    case summaryBy.byCity:
						selectedStatuses.push(
                            <td key={currentKey} className={statusTdClass}>
                                {getSupportStatusByClusterOrCity(campaignId, supportStatusId)}
                            </td>);
                        break;
                    case summaryBy.byArea:
                        selectedStatuses.push(
                            <td key={currentKey} className={statusTdClass}>
                                {getSupportStatusByClusterOrCityFromArea(campaignId, supportStatusId)}
                            </td>);
                        break;
                }
            }
        }

        return selectedStatuses;
    }
  
    return (
        <tr>
            <td>{item.city_mi_id}</td>
            <td className="nowrap">{(searchFields.summary_by_id==summaryBy.byArea ? item.area_name:item.city_name)}</td>
            {renderGeoItems()}

            { (1 == searchFields.display_num_of_votes) &&
                renderNumOfVotes()
            }


            { (1 == searchFields.display_vote_statistics) &&
                renderShasVotes()
            }

            { (1 == searchFields.display_statuses_statistics) &&
                renderSelectedSupportStatuses()
            }
            { (searchFields.display_prev_votes_percents ||searchFields.display_strictly_orthodox_percents || searchFields.display_sephardi_percents) &&
                renderBallotDetails()
            }
        </tr>
    );
};

export default PollingSummaryResultItem;