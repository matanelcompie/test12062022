import { useEffect, useState } from 'react';
import axios from "axios";

//function get ballot box id and return details of votes in ballot box
export const getBallotBoxVotesDetails = (ballotBoxId) => {
   
    let baseUrl = window.location.origin + window.Laravel.baseURL;
    let specificPath = 'api/quarters-ballot-box-details/'+ballotBoxId;
    let url = baseUrl + specificPath; 
    let method = 'get';
  
    console.log('sent request type: ', method, '. to url: ', url);
  
    return axios.request({
        method: method,
        url: url
      });
  };

  //set votes of party by ballot box for election campaign
  export const setReportVotesOfPartyByBallotBox = (ballotBoxId,partyKey,votesCount) => {
 
    let baseUrl = window.location.origin + window.Laravel.baseURL;
    let specificPath = 'api/quarters-ballot-box-party-votes';
    let url = baseUrl + specificPath; 
    let method = 'post';
  
    console.log('sent request type: ', method, '. to url: ', url);
  
    return axios.request({
        method: method,
        url: url,
        data:{ballot_box_id:ballotBoxId,party_key:partyKey,votes_count:votesCount}
      });
  };

  export const setSummeryValidOrNotVotesForBallotBox = (ballotBoxId,count_voted_in_ballot,valid_votes_count_activist,not_valid_votes_count_activist) => {
 
    let baseUrl = window.location.origin + window.Laravel.baseURL;
    let specificPath = 'api/quarters-ballot-box-summery-votes';
    let url = baseUrl + specificPath; 
    let method = 'post';
  
    console.log('sent request type: ', method, '. to url: ', url);
  
    return axios.request({
        method: method,
        url: url,
        data:{
        'ballot_box_id':ballotBoxId,
        'count_voted_in_ballot':count_voted_in_ballot,
        'valid_votes_count_activist':valid_votes_count_activist,
        'not_valid_votes_count_activist':not_valid_votes_count_activist
    }
      });
  };



