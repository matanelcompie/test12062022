import React, {useContext, useState, useEffect} from 'react';
import { CircularProgress } from '@material-ui/core';
import Chart from "react-google-charts";
import { displayContext } from '../context/displayContext.jsx';


const createChartData = (data) => {
  // this function prepare data for chart display.
  let chartDataLocal =  [[
    'מפלגה',
    'בוחרים',
    { role: 'style' },  
  ],];
  let i = 1;
  let collectVotes = 0;
  // only the first 9 parties gets a uniq color, 
  // the last (10) is all hte rest of parties, displayed in grey color.
  data.forEach((item) => {
    if (i > 9) {
      collectVotes += item.count_voted_party;
    } else {
      chartDataLocal.push([item.letters, item.count_voted_party, item.color]);
    }  
    i++;
  });
  if (data.length > 9) {
    chartDataLocal.push(["כל השאר", collectVotes, 'rgb(171, 169, 169)']);
  }
  return chartDataLocal;
}

const ChartBar = () => {
  const {display, setDisplay} = useContext(displayContext);
  const [chartData, setChartData] = useState();

  useEffect(() => {
    let current = display.currentDataDisplayed.regular;
    if (current && current.length > 0) {
      setChartData(createChartData(current));
    } 
  }, [display]);


  return (
    <div className="char-bar-wrp">
       {
        (chartData && chartData.length > 0) ?
          <Chart
            chartType="BarChart"
            loader={<div className="loader-wrapper"><CircularProgress/></div>}
            data={chartData}
            options={{
              tooltip: { isHtml: true, trigger: "visible" },
              width: 380,
              height: 650,
              bar: { groupWidth: '45%' },
              legend: { position: 'none' },
            }}
            // For tests
            rootProps={{ 'data-testid': '6' }}
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

export default ChartBar;
