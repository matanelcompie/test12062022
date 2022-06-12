import React, { Component } from 'react';
import {withCommas} from 'libs/globalFunctions';

const KnessetDataRow = ({index  , item   , historicalElectionCampaignsVotesData , greyBorderStyle ,   paddedContent}) => {
    let totalVotersCount = <i className="fa fa-spinner fa-spin"></i>;
    let notVotedVotersCount = <i className="fa fa-spinner fa-spin"></i>;
    let votedCount = <i className="fa fa-spinner fa-spin"></i>;
    let votedPercentage = <i className="fa fa-spinner fa-spin"></i>;
    let shasVotedCount = <i className="fa fa-spinner fa-spin"></i>;
    let shasVotedPercentage = <i className="fa fa-spinner fa-spin"></i>;

    function roundPercentages(itemPercent) {
        let percentage = parseFloat(itemPercent);
        percentage = percentage.toFixed(2);

        return percentage;
    }

    totalVotersCount = 0;
    votedCount = 0;
    votedPercentage = 0;
    shasVotedCount = 0;
    shasVotedPercentage = 0;
    
    for (let i = 0; i < historicalElectionCampaignsVotesData.length; i++) {
        let votesData = historicalElectionCampaignsVotesData[i];
        if (votesData.election_campaign_id == item.id) {
            totalVotersCount += parseInt(votesData.total_voters);
            if (votesData.total_votes) {
                votedCount += parseInt(votesData.total_votes);
            }
            if (votesData.shas == '1') {
                if (votesData.total_party_votes) {
                    shasVotedCount += parseInt(votesData.total_party_votes);
                }
            }
        }

    }
    if(totalVotersCount > 0 && votedCount >0 ){
        votedPercentage = (votedCount * 100) / totalVotersCount;
    }
    votedPercentage += ' %';

    if(totalVotersCount > 0){
        shasVotedPercentage = (shasVotedCount * 100) / totalVotersCount;
    }
    shasVotedPercentage += ' %';

    notVotedVotersCount = totalVotersCount-item.all_voted_support_statuses_of_type_supporting_count-item.all_voted_support_statuses_of_type_hesitating_count-item.all_voted_support_statuses_of_type_not_supporting_count-item.all_voted_support_statuses_of_type_potential_count;


    return (<div key={index}>
        <h4 className="subHeaderInline">{item.name}</h4>
        <table className="table table-striped  tableNoMarginB tableTight table-scroll">
            <tbody>
            <tr className="main-title">
                <th colSpan="5" style={{textAlign:'center' , borderLeft:'1px solid #cccccc'}}>סטטוס תמיכה סופי</th>
                <th colSpan="5" style={{textAlign:'center'}}>תוצאות הצבעה רשמיות</th>
            </tr>
            <tr>
                <th width="10%">ללא סטטוס</th>
                <th width="10%">תומך</th>
                <th width="10%">פוטנציאל</th>
                <th width="10%" style={greyBorderStyle}>לא תומך</th>
                <th width="10%" style={paddedContent}>בז"ב</th>
                <th width="10%">הצביעו</th>
                <th width="10%">אחוז הצבעה</th>
                <th width="10%">ש"ס</th>
                <th width="10%">אחוז מקולות כשרים</th>
            </tr>

            <tr>
                <td>{withCommas(notVotedVotersCount) || 0}</td>
                <td>{withCommas(item.all_voted_support_statuses_of_type_supporting_count) || 0}</td>
                <td>{withCommas(item.all_voted_support_statuses_of_type_potential_count) || 0}</td>
                <td style={greyBorderStyle}>{withCommas(item.all_voted_support_statuses_of_type_not_supporting_count) || 0}</td>
                <td style={paddedContent}>{withCommas(totalVotersCount) || 0}</td>
                <td>{withCommas(votedCount) || 0}</td>
                <td>{roundPercentages(votedPercentage)}</td>
                <td>{withCommas(shasVotedCount) || 0}</td>
                <td>{roundPercentages(shasVotedPercentage)}</td>
            </tr>
            </tbody>
        </table>
    </div>)
}
export default KnessetDataRow ;