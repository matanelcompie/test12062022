import React, { useContext, useEffect, useState } from 'react';
import Chart from "react-google-charts";
import { CircularProgress } from '@material-ui/core';

import { getPieData, calculateAvrg, getPieColor, numberWithCommas } from '../helpers/variousHelpers.js';
import { permissionContext } from '../context/permissionContext.jsx';
import boxHelper from '../helpers/boxHelper';
import Pie from './Pie.jsx';

const DashboardBox = (props) => {
  
  const {permissionLevel} = useContext(permissionContext);
  const {data, nav} = props;
  const {type, state, mainGoal, dashboardType} = data;
  const {changeScreenLevel, setUpdatingDashboard} = nav;
  const { classType, pieSizeWrp, pieSizeWrpSummary, isNavigate, navigateToText, navigateTo } = boxHelper(type, state, permissionLevel);
  const [isAnimateOut, setIsAnimateOut] = useState(false);
  
  // get average of scores:
  // let average = calculateAvrg(numSupport, numMobile, numAddress);
  let average = state.presentDestination;
  // create pie names
  let pieNames = getPieData(dashboardType, state, true);
  // create the score numbers:
  let pieCount = getPieData(dashboardType, state, false, average)

  let voters = state.count_voters;
  // pie back ground colors:
  let pieBackgroundColor = "grey";
  let pieBackgroundColorSummary = "#d2d2d2";
  let mainGoalVerified = dashboardType === "DETAILED" ? mainGoal : 100;

  useEffect(() => {
    setIsAnimateOut(false);
  }, [state])

  const navigateToLevel = (destinationType, destinationId) => {
    // setIsAnimateOut(true);
    setUpdatingDashboard(true);
    setTimeout(() => {
      changeScreenLevel(destinationType, destinationId);
    }, 500);
  }

  return (
    <>
        <div className={`dashboard-box ${classType} ${dashboardType === "MAIN" ? "MAIN-DASHBOARD" : ""} animate-in`}>
          <div className="name-wrapper">
            <div className="box-header">{state.name}</div>
          </div>

          <div 
            className="voters-num-wrapper"
            title={dashboardType === "MAIN" ? "כל הבוחרים המשויכים לשרי מאה" : "בוחרים משויכים בעלי סטטוס תמיכה: תומך, מהסס, לא ידוע"}
          >
            <div className="pie-number">{numberWithCommas(state.count_voters)}</div>
            <div className="pie-number-round"></div>
            <div 
              className="pie-description" 
            >בוחרים</div>
          </div>

          <div className="pie-main-wrapper">
            <Pie data={{
               classPie: "support-pie",
               pieSizeWrp,
               num: pieCount.first,
               voters, 
               dataText1: pieNames.first, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.first, mainGoalVerified),
               description: pieNames.first,  
            }}></Pie>

            <Pie data={{
               classPie: "phones-pie",
               pieSizeWrp,
               num: pieCount.second, 
               voters, 
               dataText1: pieNames.second, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.second, mainGoalVerified),
               description: pieNames.second,  
            }}></Pie>

            <Pie data={{
               classPie: "address-pie",
               pieSizeWrp,
               num: pieCount.third, 
               voters, 
               dataText1: pieNames.third, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.third, mainGoalVerified),
               description: pieNames.third,  
            }}></Pie>

            <Pie data={{
               classPie: "support-pie",
               pieSizeWrp,
               num: pieCount.fourth,
               voters,  
               dataText1: pieNames.fourth, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.fourth, mainGoalVerified),
               description: pieNames.fourth,  
            }}></Pie>
          </div>

          <div className={`summary-wrapper ${dashboardType === "MAIN" ? "MAIN-DASHBOARD" : ""}`}>
            <>
            <Pie data={{
                classPie: "summary-pie",
                pieSizeWrp: pieSizeWrpSummary,
                num: pieCount.fifth, 
                voters, 
                dataText1: pieNames.fifth, 
                dataText2: 'נותר', 
                pieHole: 0.65, 
                pieBackgroundColor: pieBackgroundColorSummary, 
                pieColor: getPieColor(dashboardType, pieCount.fifth, mainGoalVerified),
                description: pieNames.fifth,  
            }}></Pie>    
            {  dashboardType === "DETAILED" ?
            <div className="goal-chart">
              <div className="goal-title-wrp">
                <div className="goal-text">יעד ({mainGoalVerified})</div>
                <div className="goal-color" style={{backgroundColor:"#2AB4C0"}}></div>
                <div className="reached-text">הישג ({average})</div>
                <div className="reached-color" style={{backgroundColor:getPieColor(dashboardType, average, mainGoalVerified)}}></div>
              </div>
              <Chart
                width={'170px'} height={'80px'} chartType="BarChart"
                loader={<div>Loading Chart</div>}
                data={[
                  ['', 'יעד', 'הישג'], 
                  ['', mainGoalVerified, average],
                ]}
                options={{
                  title: '',
                  tooltip: { isHtml: true, trigger: "visible" },
                  chartArea: { width: '150' }, 
                  colors: ["#2AB4C0", getPieColor(dashboardType, average, mainGoalVerified)],
                  backgroundColor: "transparent"
                }}
              />
            </div>
            : 
            <>
              <div className="supporting-label">מתוך תומכים:</div>
              <Pie data={{
                classPie: "summary-pie",
                pieSizeWrp: pieSizeWrpSummary,
                num: pieCount.sixth, 
                voters, 
                dataText1: pieNames.sixth, 
                dataText2: 'נותר', 
                pieHole: 0.65, 
                pieBackgroundColor: pieBackgroundColorSummary, 
                pieColor: getPieColor(dashboardType, pieCount.sixth, mainGoalVerified),
                description: pieNames.sixth,  
              }}></Pie> 
            </>   
            }
            </>
            {
              isNavigate && 
              (
              <div className="navigate-to" onClick={() => navigateToLevel(navigateTo.type, navigateTo.id)}>
                <div className="navigate-icon-wrp"><i className={`fa fa-chevron-${type === "MAIN"? "up": "left"}`}></i></div>
                <div className="navigate-description">{navigateToText}</div>
              </div>
              )
            }
          </div>    
       </div>
    </>
  )
}

export default DashboardBox;
