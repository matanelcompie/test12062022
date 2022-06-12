import React, { useState } from 'react';
import { getPieData, calculateAvrg, getPieColor } from '../helpers/variousHelpers.js';
import Pie from './Pie.jsx';

const DashboardBoxLast = (props) => {

  const {data} = props;
  const {state, mainGoal, dashboardType} = data;
  const [expandLastBox, setExpandLastBox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // get average of scores:
  // let average = calculateAvrg(numSupport, numMobile, numAddress);
  let average = state.presentDestination;
  // create pie names
  let pieNames = getPieData(dashboardType, state, true);
  // create the score numbers:
  let pieCount = getPieData(dashboardType, state, false, average)

  let voters = state.count_voters;
  let pieBackgroundColor = "grey";
  let mainGoalVerified = dashboardType === "DETAILED" ? mainGoal : 100;
  

  const delayEffect = () => {
    if (expandLastBox) {
      setExpandLastBox(false);
      setIsExpanded(false);
    } else {
      setExpandLastBox(true);
      setTimeout(() => {
        setIsExpanded(true);
      }, 300);
    }
  }

  return (
    <div key={state.entity_id} className={expandLastBox ? "is-last-expanded" : ""}>
      <div className="last-box-wrp">
        <div className="last-wrp name-wrapper">
          <div className="box-header">{state.name}</div>
        </div>

        <div className="last-wrp">
          <div className="">
            <div className="voters-number">{state.count_voters}</div>
            <div className="voters-number-description">בוחרים</div>
          </div>
        </div>
    
        <div className="last-wrp">
          <div className="num-average">
            <div className="num" style={{backgroundColor:getPieColor(dashboardType, pieCount.fifth, mainGoalVerified)}}>{pieCount.fifth}%</div>
            <div className="text">{(dashboardType === "DETAILED") ? "הישג" : pieNames.fifth}</div>
          </div>
          <div className="num-mainGoal">
            <div className="num" style={{backgroundColor:`${(dashboardType === "DETAILED") ? "#2ab4c0" : getPieColor(dashboardType, pieCount.sixth, mainGoalVerified)}`}}>{(dashboardType === "DETAILED") ? mainGoalVerified : pieCount.sixth}%</div>
            <div className="text">{(dashboardType === "DETAILED") ? "יעד" : pieNames.sixth}</div>
          </div>
        </div>

        <div className="last-wrp last-last" onClick={delayEffect}>
          <div className="navigate-wrp">
            <div className="navigate-icon-wrp"><i className={`fa fa-chevron-${expandLastBox ? "right" : "left"}`}></i></div>
            <div className="navigate-description">{expandLastBox ? "חזרה" : "להרחבה"}</div>
          </div>       
        </div>

        {
          isExpanded &&
          <div className="last-pie-wrapper">
            <Pie data={{
               classPie: "support-pie",
               pieSizeWrp: "130px",
               num: pieCount.first, 
               voters,
               dataText1: pieNames.first, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.first, mainGoalVerified),
               description:  pieNames.first,  
            }}></Pie>

            <Pie data={{
               classPie: "phones-pie",
               pieSizeWrp: "130px",
               num: pieCount.second, 
               voters,
               dataText1: pieNames.second, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.second, mainGoalVerified),
               description:  pieNames.second,  
            }}></Pie>

            <Pie data={{
               classPie: "address-pie",
               pieSizeWrp: "130px",
               num: pieCount.third, 
               voters,
               dataText1: pieNames.third, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.third, mainGoalVerified),
               description:  pieNames.third,  
            }}></Pie>

            <Pie data={{
               classPie: "address-pie",
               pieSizeWrp: "130px",
               num: pieCount.fourth, 
               voters,
               dataText1: pieNames.fourth, 
               dataText2: 'נותר', 
               pieHole: 0.7, 
               pieBackgroundColor: pieBackgroundColor, 
               pieColor: getPieColor(dashboardType, pieCount.fourth, mainGoalVerified),
               description:  pieNames.fourth,  
            }}></Pie>
          </div>
        }
      </div>
    </div>
  )
}

export default DashboardBoxLast;
