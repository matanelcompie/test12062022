import React, { Component } from 'react';
import {withCommas} from 'libs/globalFunctions';

const MunicipalDataRow = ({index  , item , historicalElectionCampaignsVotesData   }) => {
   let totalVotersCount = <i className="fa fa-spinner fa-spin"></i>;
                   let votedCount = <i className="fa fa-spinner fa-spin"></i>;
                   let votedPercentage = <i className="fa fa-spinner fa-spin"></i>;
                   let totalShasVotersCount = <i className="fa fa-spinner fa-spin"></i>;
                   let shasVotedCount = <i className="fa fa-spinner fa-spin"></i>;
                   let shasVotedPercentage = <i className="fa fa-spinner fa-spin"></i>;
                    
                    totalVotersCount = 0;
                    votedCount = 0;
                    votedPercentage = 0;
                    totalShasVotersCount = 0;
                    shasVotedCount = 0;
                    shasVotedPercentage = 0;
                    for(let i =0 ;i<historicalElectionCampaignsVotesData.length;i++){
                          if(historicalElectionCampaignsVotesData[i].election_campaign_id == item.id){
                                 totalVotersCount += parseInt(historicalElectionCampaignsVotesData[i].total_voters);
                                 if(historicalElectionCampaignsVotesData[i].total_votes){
                                     votedCount += parseInt(historicalElectionCampaignsVotesData[i].total_votes);
                                 }
                                 if(historicalElectionCampaignsVotesData[i].shas == '1'){
                                      totalShasVotersCount += parseInt(historicalElectionCampaignsVotesData[i].total_voters);
                                      if(historicalElectionCampaignsVotesData[i].total_votes){
                                          shasVotedCount += parseInt(historicalElectionCampaignsVotesData[i].total_votes);
                                      }
                                 }
                          }
 
                    }
                    if(totalVotersCount > 0 && votedCount >0 ){
                        votedPercentage = (votedCount * 100) / totalVotersCount;
						votedPercentage = Math.round(votedPercentage*100)/100;
                    }
                    votedPercentage += ' %';

                    if(totalShasVotersCount > 0 && shasVotedCount >0 ){
                        shasVotedPercentage = (shasVotedCount * 100) / totalShasVotersCount;
						shasVotedPercentage = Math.round(shasVotedPercentage*100)/100;
                    }
                    shasVotedPercentage += ' %';

                    
                   
                   return (<div key={index}>
                               <h4 className="subHeaderInline">{item.name}</h4>
                                        <table className="table table-striped  tableNoMarginB tableTight">
                                            <thead>
                                                <tr>
                                                    <th>בז"ב</th>
                                                    <th>הצביעו</th>
                                                    <th>אחוז הצבעה</th>
                                                    <th>ש"ס</th>
                                                    <th>אחוז הצבעה</th>
                                                    <th>חברי מועצה</th>
                                                    <th>מנדטים</th>
                                                    <th>רשימה משותפת</th>
                                                    <th>תוקצבו</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{withCommas(totalVotersCount) || 0}</td>
                                                    <td>{withCommas(votedCount) || 0}</td>
                                                    <td>{votedPercentage}</td>
                                                    <td>{withCommas(shasVotedCount) || 0}</td>
                                                    <td>{shasVotedPercentage}</td>
                                                    <td>{withCommas(item.council_members_count) || 0}</td>
                                                    <td>{withCommas(item.mandats_count) || 0}</td>
                                                    <td>-</td>
                                                    <td>{item.has_budget == '1'?'כן':'לא'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                         </div>
                )
}
export default MunicipalDataRow ;