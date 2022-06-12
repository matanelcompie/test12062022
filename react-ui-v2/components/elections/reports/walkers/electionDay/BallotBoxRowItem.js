import React, { Component } from 'react';
const BallotBoxRowItem = ({ item  }) => {
    let blueBorderStyle={ borderTop:'1px solid #498BB6' , borderBottom:'1px solid #498BB6'};

    function getBallotMiId(ballotMiId) {
        var miIdStr = ballotMiId.toString();
        var lastDigit = miIdStr.charAt(miIdStr.length - 1);

        return (miIdStr.substring(0, miIdStr.length - 1) + '.' + lastDigit);
    }

  return  <tr key={'firstRow'+item.mi_id} style={{color:'#323A6B' , fontSize:'18px', backgroundColor:'#CCDEEA' }}>
            <td style={blueBorderStyle}>עיר</td>
            <th style={blueBorderStyle}  colSpan="1"><strong>{item.cluster_city_name}</strong></th> 
            <td style={blueBorderStyle} className="text-center" colSpan="4">
                <span className="item-space">אשכול</span>
                <strong>{item.cluster_name }</strong>&nbsp;&nbsp;

            </td>
            <td style={blueBorderStyle} className="text-center">
                <span className="item-space">מספר קלפי</span>
                <strong>{getBallotMiId(item.mi_id)}</strong>&nbsp;&nbsp;
            </td>
            <td style={blueBorderStyle} className="text-center" colSpan="3">
                <span className="item-space">כתובת קלפי</span>
                <strong>{item.cluster_address }</strong>&nbsp;&nbsp;
            </td>
            <td style={blueBorderStyle} className="text-center" >
                <span className="item-space">מס' בתי אב</span>
                <strong>{item.household_count }</strong>&nbsp;&nbsp;
            </td>
            <td style={{...blueBorderStyle , paddingLeft:'15px'}} className="text-left"  >
                <span className="item-space">מס' תושבים</span>
                <strong>{item.voter_count}</strong>
            </td>
        </tr>	
}
export default BallotBoxRowItem;