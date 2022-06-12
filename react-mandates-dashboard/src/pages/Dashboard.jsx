import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { displayContext } from '../context/displayContext.jsx';

import SummaryStrip from '../components/SummaryStrip.jsx';
import TabsWrapper from '../components/TabsWrapper.jsx';
import ChartsWrapper from '../components/ChartsWrapper.jsx';
import ExcelGenerator from '../components/ExcelGenerator.jsx';
import ReportBallotBoxVotes from '../components/ReportBallotBoxVotes.jsx';
import Combo from '../components/global/Combo';
import {ActionTypes as SystemActions} from '../actions/SystemActions'
import { useDispatch } from 'react-redux';
const Dashboard = () => {
  const {display, setDisplay} = useContext(displayContext); 
  
  const [isReportVotes,setIsReportVotes] = useState(false);
  const dispatch = useDispatch()
  useEffect(()=>{
      dispatch({ type: SystemActions.SET_HEADER_TITLE, headerTitle: 'דשבורד ספירת קולות' })
  },[])

  const returnToDashboard=()=> {
    setDisplay(prev => ({...prev, isReportVotes: false}));
  }

  return (
    <div className="container main">
      <div style={{display:'flex'}} className="main-header-text">
        <h3 style={{cursor:'pointer'}} onClick={returnToDashboard.bind()}>דשבורד ספירת קולות</h3>
       { (display.isReportVotes==true)?
         <h3> / דווח קולות לקלפי</h3>:''
        }
      </div>
      {
        display.isReportVotes==true ?
         <div>
        <ReportBallotBoxVotes></ReportBallotBoxVotes>
         </div>
         :
         <>
          <SummaryStrip/>
          <ExcelGenerator/>
          <div className="row-wrp">
              <div className="table-wrapper">
                  <TabsWrapper/>
              </div>
              <div className="charts-main-wrapper">
                <ChartsWrapper/>
              </div>
          </div>
         </>
       }
    </div>
  )
}

export default Dashboard


