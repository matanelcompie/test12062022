import React, { Component } from 'react';

const DashboardFileRow = ({ rowIndex, updateName, updateDateTime , updateKey, updaterName, numberHouseholdsSelected , numberHouseholdsProcessed , className , rowClickDelegate , rowDetailsOnClick}) => {
  let arrayDateTime = updateDateTime.split(' ');
  
  return <tr style={{wordWrap: 'break-word' , textAlign:'right'}} className={className} onClick={rowClickDelegate}  >
                    <td>{rowIndex}</td>
					<td><a onClick={rowDetailsOnClick} style={{textDecoration:'underline'}}>{updateName}</a></td>
                    <td>{arrayDateTime[1] +  ' ' + arrayDateTime[0].split('-').reverse().join('/')}</td>
                    <td>{updaterName}</td>
					<td>{numberHouseholdsSelected}</td>
                    <td>{numberHouseholdsProcessed}</td>
                    <td style={{textAlign:'center'}}><a style={{cursor:'pointer'}} href={window.Laravel.baseURL + "api/elections/household_status_change/excel/" + updateKey} target="_blank"><img src={window.Laravel.baseURL + "Images/excel-icon.png"} /></a></td>
                  </tr>
}
export default DashboardFileRow;