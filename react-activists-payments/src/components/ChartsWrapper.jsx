import React from 'react';
import ChartBar from './ChartBar.jsx';
import PieChart from './PieChart.jsx';

const ChartsWrapper = () => {
  return (
    <div>
      <div className="charts-wrapper">
        <PieChart/>
      </div>
      <div className="charts-wrapper mt-5 chart-bar-wrapper">
        <ChartBar/>
      </div>
    </div>
  )
}

export default ChartsWrapper;


