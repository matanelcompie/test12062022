import React, { Component } from 'react';
import { withCommas} from 'libs/globalFunctions';
 
const MainTableRowItem = ({id , headerText , className , imageClassName , totalCount , dailyCount ,  hourlyCount ,callRowClick }) => {
		return (<tr key={"mainRow"+id} className={className +"cursor-pointer"} onClick={callRowClick.bind(this,id)}>
					<td><span className={"table-line " + imageClassName}></span> <span className="margin-right15">{headerText}</span></td>
					<td>{totalCount ? withCommas(totalCount):(totalCount == 0 ? "-" : <i className="fa fa-spinner fa-spin"></i>)}</td>
					<td>{parseInt(id) < 2  ? '' : (dailyCount ? withCommas(dailyCount):"-")}</td>
					<td>{parseInt(id) < 2  ? '' : (hourlyCount ? withCommas(hourlyCount):"-")}</td>
				</tr>
                )
}
export default MainTableRowItem ;