import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import { getListOfPlaces, useGetSummaryData } from '../hooks/useCall.jsx';
import { setReportVotesOfPartyByBallotBox } from '../hooks/reportVotesAction.jsx';
import { objectIsNotEmpty, numberWithCommas, formatNumberAfterPoint } from '../helpers/variousHelpers.js';
import Combo from '../components/global/Combo';

const ListPartyVotes = (props) => {
  const {listParty,ballotBoxId} = props;
  const { summaryData, loadingSummary } = useGetSummaryData(); 
  const [loadingSummaryDelayed, setLoadingSummaryDelayed] = useState(true)
  const [arrParties, setArrParties] = useState(true)


  useEffect(() => {
    setArrParties(listParty);
  }, [listParty])

  useEffect(() => {
    if (!loadingSummary) {
      setTimeout(() => {
        setLoadingSummaryDelayed(false);
      }, 1000);
    }
  }, [loadingSummary])

  const saveVotesParty=(partyIndex)=>{
    let party=arrParties[partyIndex];
    setReportVotesOfPartyByBallotBox(ballotBoxId,party.key,party.votes_count).then((response)=>{
      setSuccess(partyIndex,'נשמר בהצלחה');
    },(error)=>{
      setError(partyIndex,error.response.data.message);
    })
  }

  const changeCountVotes=(i,e)=>{
    let devParties=[...arrParties];
    let party={...devParties[i]}
    party.votes_count=e.target.value;
    party.error='';
    party.save='';
    devParties[i]=party;
    setArrParties(devParties);
  }
  const setError=(i,error,e)=>{
    let devParties=[...arrParties];
    let party={...devParties[i]}
    party.error=error;
    devParties[i]=party;
    setArrParties(devParties);
  }

  const setSuccess=(i,txt)=>{
    let devParties=[...arrParties];
    let party={...devParties[i]}
    party.save=txt;
    devParties[i]=party;
    setArrParties(devParties);
  }


  console.log(arrParties)
  return (

    <div style={{display:'flex',flexDirection:'column'}} className="con-report-ballot we">
        {
            arrParties && objectIsNotEmpty(arrParties) && arrParties.map((item, i) => {
          return (
            <div key={item.key} className="rowParty">
                <div className="linkImage" style={{backgroundImage:'url('+item.image_url+')'}} ></div>
                {/* image_url */}
                <div className="nameParty">{item.name}</div>
                {item.save && item.save!=''?<div className="partySuccess"> - {item.save}</div>:''}
                {item.error && item.error!=''?<div className="partyError">* {item.error}</div>:''}
                <div><input type="number" className="saveInput" onChange={changeCountVotes.bind(this,i)}  value={item.votes_count} ></input></div>
                <i className="fa fa-paper-plane saveBtn" title="שמירה"  onClick={saveVotesParty.bind(this,i)} ></i>
               {/* <button className="saveBtn">שמור</button> */}
              
            </div>
            
          )})
        }
    </div>
  
  )
}

export default ListPartyVotes;
