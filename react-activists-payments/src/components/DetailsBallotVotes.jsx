import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import {setSummeryValidOrNotVotesForBallotBox } from '../hooks/reportVotesAction.jsx';
import { objectIsNotEmpty, numberWithCommas, formatNumberAfterPoint } from '../helpers/variousHelpers.js';
import Combo from './global/Combo';

const DetailsBallotVotes = (props) => {
  const {details,BallotBoxId} = props;
  const [summeryVotes, setSummeryVotes] = useState(true)


  useEffect(() => {
    setSummeryVotes(details);
  }, [details])


  const setFieldSummery=(nameField,val,e)=>{
    // debugger
    let detailsSummery={...summeryVotes};
    val=val?val:e.target.value;
    if(nameField!='error')
    detailsSummery['error']='';

    detailsSummery[nameField]=val
    setSummeryVotes(detailsSummery);

  }

  const saveSummeryVotes=()=>{
    // debugger
    setSummeryValidOrNotVotesForBallotBox(BallotBoxId,summeryVotes.count_voted_in_ballot,summeryVotes.valid_votes_count_activist,summeryVotes.not_valid_votes_count_activist)
    .then((response)=>{
    },(error)=>{
      // debugger
      setFieldSummery('error',error.response.data.message);
    })
  }

  return (
  <>  
  {BallotBoxId?
  
  (<div className="summery-con">
    <div style={{display:'flex',paddingTop:'7px'}}>
    <div className="conTitle"><label>סה"כ כמות מצביעים</label><input type="number" className="inp" onChange={setFieldSummery.bind(this,'count_voted_in_ballot',null)} value={summeryVotes.count_voted_in_ballot}></input></div>
      <div className="conTitle"><label>סה"כ כמות כשרים</label><input type="number" className="inp"  onChange={setFieldSummery.bind(this,'valid_votes_count_activist',null)} value={summeryVotes.valid_votes_count_activist}></input></div>
      <div className="conTitle"><label>סה"כ כמות פסולים</label><input type="number" className="inp"  onChange={setFieldSummery.bind(this,'not_valid_votes_count_activist',null)} value={summeryVotes.not_valid_votes_count_activist}></input></div>
    </div>
      <div className="conBtnSum"><button type="button" class="btn btn-secondary btn-sm" onClick={saveSummeryVotes.bind()}>עדכן נתונים</button></div>
       {summeryVotes.error && summeryVotes.error!=''?<div  className="errorSummery">* {summeryVotes.error} </div>:''}  
    </div>):''
    }
    
    </>
  )
}

export default DetailsBallotVotes;
