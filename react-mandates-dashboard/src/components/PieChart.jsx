import React, {useContext, useEffect, useState} from 'react';
import { CircularProgress } from '@material-ui/core';
import Chart from "react-google-charts";
import { displayContext } from '../context/displayContext.jsx';

const chartsColors = () => {
  const {display, setDisplay} = useContext(displayContext);
  // offset is the special pie effect when hover on party name in table (the slice moves out).
  let slices = [
    {offset: display.isPartyHover === 1 ? 0.15 : null, color: 'rgb(42, 180, 192)'}, // teal shas color
    {offset: display.isPartyHover === 2 ? 0.15 : null, color: 'rgb(243, 86, 86)'},
    {offset: display.isPartyHover === 3 ? 0.15 : null, color: 'rgb(66, 157, 255)'},
    {offset: display.isPartyHover === 4 ? 0.15 : null, color: 'rgb(41, 206, 79)'},
    {offset: display.isPartyHover === 5 ? 0.15 : null, color: 'rgb(212, 5, 156)'},
    {offset: display.isPartyHover === 6 ? 0.15 : null, color: 'rgb(255, 212, 82)'},
    {offset: display.isPartyHover === 7 ? 0.15 : null, color: 'rgb(160, 142, 190)'},
    {offset: display.isPartyHover === 8 ? 0.15 : null, color: 'rgb(44, 92, 144)'},
    {offset: display.isPartyHover === 9 ? 0.15 : null, color: 'rgb(31, 134, 54)'},
    {offset: display.isPartyHover === 10 ? 0.15 : null, color: 'rgb(171, 169, 169)'}, // grey
  ];
  return slices;
}

const createPieData = (data) => {
  let pieDataLocal = [['מפלגה', 'אחוז בוחרים'],];
  let i = 1;
  let collectVotes = 0;
  // only the first 9 parties gets a uniq color, 
  // the last (10) is all the rest of parties, displayed in grey color.
  data.forEach((item) => {
    if (i > 9) {
      collectVotes += item.percent_votes_party;
    } else {
      pieDataLocal.push([item.letters + " " + item.percent_votes_party + "%", item.percent_votes_party]);
    }  
    i++;
  });
  if (data.length > 9) {
    pieDataLocal.push(["כל השאר", collectVotes]);
  }
  return pieDataLocal;
}

const PieChart = () => { 
  const {display, setDisplay} = useContext(displayContext);
  const [pieData, setPieData] = useState();

  useEffect(() => {
    let current = display.currentDataDisplayed.regular;
    if (current && current.length > 0) {
      setPieData(createPieData(current));
    } 
  }, [display]);

  return (
    <div className="char-pie-wrp">
      {
        (pieData && pieData.length > 0) ?
      <Chart
        chartType="PieChart"
        loader={<div className="loader-wrapper"><CircularProgress/></div>}
        data={pieData}
        options={{
          // legend:"none",
          pieSliceText: 'label',
          width: 650,
          height: 400,
          is3D: true,
          slices: chartsColors(),
        }}
        rootProps={{ 'data-testid': '2' }}
      />
      :
      <div className="overall">
        <div className="circular-wrp">
          <div>אין נתונים להצגה כעת.</div>
        </div>
      </div>
      }
    </div>
  )
}

export default PieChart;
