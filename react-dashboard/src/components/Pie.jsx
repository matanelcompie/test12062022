import React from 'react';
import { CircularProgress } from '@material-ui/core';
import Chart from "react-google-charts";
import { getPieNumbers } from '../helpers/variousHelpers.js';

const Pie = (props) => {

  const {
    classPie,
    pieSizeWrp, 
    num,
    voters, 
    dataText1, 
    dataText2, 
    pieHole, 
    pieBackgroundColor, 
    pieColor, 
    description 
  } = props.data;

  const {resultSpecific, resultAllVoters} = getPieNumbers(num, voters);

  return (
    <>
   
      <div className={`pie-wrapper ${classPie}`}>
        <label className="pie-number">
          {num + "%"}
        </label>
        <Chart
          width={pieSizeWrp} height={pieSizeWrp} chartType="PieChart"
          loader={<div className="loader-wrapper"><CircularProgress/></div>}
          data={[["", ""],[dataText1, resultSpecific],[dataText2, resultAllVoters],]}
          options={{
            pieHole: pieHole,
            tooltip: { isHtml: true, trigger: "visible" },
            slices: [{color: pieColor },{color: pieBackgroundColor}],
          }}
        />
        <label className="pie-description">{description}</label>
      </div>       
    </>
  )
}

export default Pie;
