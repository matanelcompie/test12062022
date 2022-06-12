import React, { Component } from 'react';
 

const SubTableRowItem = ({id , headerText , itemsArray ,showDetailsFunction , totalLanguagesList , todayLanguagesList , lastHourLanguagesList , isLanguageRow}) => {
		let grayBorderFont = {border:'1px #E0E0E0 solid'};
		let headerFont = {fontSize:'18px' , fontWeight:'600'};
		return (<tr>
					<td style={grayBorderFont}><span className="margin-right15"  style={headerFont}>{headerText}</span></td>
					{
						
						itemsArray.map(function(item , index){
							 
							return <td key={id + " " + index} style={grayBorderFont}>
										{item}
										{(totalLanguagesList && Object.keys(totalLanguagesList).length > 0 && index==0 && isLanguageRow) && <div><button title="פירוט" type="button" className="btn btn-primary btn-xs"  onClick={(showDetailsFunction.bind(this , index , totalLanguagesList))}>פירוט</button></div>}
										{(todayLanguagesList && Object.keys(todayLanguagesList).length > 0 && index==1 && isLanguageRow) && <div><button title="פירוט" type="button" className="btn btn-primary btn-xs"  onClick={(showDetailsFunction.bind(this , index , todayLanguagesList))}>פירוט</button></div>}
										{(lastHourLanguagesList && Object.keys(lastHourLanguagesList).length > 0 && index==2 && isLanguageRow) && <div><button title="פירוט" type="button" className="btn btn-primary btn-xs"  onClick={(showDetailsFunction.bind(this , index , lastHourLanguagesList))}>פירוט</button></div>}
									</td>
						})
					}
				 
				</tr>
                )
}
export default SubTableRowItem ;