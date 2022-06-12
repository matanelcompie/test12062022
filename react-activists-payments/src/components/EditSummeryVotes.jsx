import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import { getListOfPlaces, useGetSummaryData } from '../hooks/useCall.jsx';
import { setReportVotesOfPartyByBallotBox } from '../hooks/reportVotesAction.jsx';
import { objectIsNotEmpty, numberWithCommas, formatNumberAfterPoint } from '../helpers/variousHelpers.js';
import Combo from '../components/global/Combo';

const EditSummeryVotes = (props) => {
  const {details} = props;
  const {countVotes}= useState(true);
  const {countNotValidVotes}= useState(true)



  useEffect(() => {
  
  }, [])

  useEffect(() => {
    if (!loadingSummary) {
      setTimeout(() => {
        setLoadingSummaryDelayed(false);
      }, 1000);
    }
  }, [loadingSummary])

  const saveVotesParty=(party)=>{
    // debugger
    setReportVotesOfPartyByBallotBox(ballotBoxId,party.key,party.votes_count).then((response)=>{
      alert('נשמר בהצלחה');
    },function(error){
        let response = error.response;
        console.log(response);
    })
  }

  const changeCountVotes=(i,e)=>{
    let devParties=[...listParty];
    let party={...devParties[i]}
    party.votes_count=e.target.value;
    devParties[i]=party;
    listParty=devParties;
  }

  return (
  
    <div style={{display:'flex',flexDirection:'column'}} className="con-report-ballot">
        {
            listParty && objectIsNotEmpty(listParty) && listParty.map((item, i) => {
          return (
            <div key={item.key} style={{display:'flex'}}>
                <div>{item.letters}</div>
                {/* image_url */}
                <div>{item.name}</div>
                <div><input onChange={changeCountVotes.bind(this,i)}  value={item.votes_count} ></input></div>
               <button onClick={saveVotesParty.bind(item)}>שמור</button>
            </div>
            
          )})
        }
    </div>
  
  )
}

export default EditSummeryVotes;
