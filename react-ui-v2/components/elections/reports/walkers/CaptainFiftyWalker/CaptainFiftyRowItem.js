import React, { Component } from 'react';
const CaptainFiftyRowItem = ({firstCaptainVoter, captainData, totalVotersCount, resultsPerPage }) => {
    let totalPages=(captainData.voters_count == 0 || totalVotersCount == 0) ? 0 : Math.ceil(captainData.voters_count / resultsPerPage);
    let currentCapitanPage = Math.ceil((firstCaptainVoter.indexInCaptain) / resultsPerPage) ;
    // if(firstCaptainVoter.indexInCaptain > 1){ currentCapitanPage += 1 }
    let blueBorderStyle = { borderTop: '1px solid #498BB6', borderBottom: '1px solid #498BB6' };
    return <tr style={{ color: '#323A6B', fontSize: '18px', backgroundColor: '#CCDEEA' }}>
        <td style={blueBorderStyle}>עיר</td>
        <th style={blueBorderStyle}><strong>{firstCaptainVoter.captain_city_name}</strong></th>
        <td style={blueBorderStyle} className="text-center" colSpan="8">
            <span className="item-space">שר מאה</span>
            <strong>{firstCaptainVoter.captain_first_name + ' ' + firstCaptainVoter.captain_last_name}</strong>&nbsp;&nbsp;
            <strong>|</strong>&nbsp;&nbsp;
            <strong>ת.ז {firstCaptainVoter.captain_personal_identity}</strong>&nbsp;&nbsp;
            <strong>|</strong>&nbsp;&nbsp;
            <strong>נייד {firstCaptainVoter.captain_phone_number}</strong>
        </td>
        <td style={blueBorderStyle} className="text-center" colSpan="3">
            <span className="item-space">מס' תושבים</span>
            <strong>{captainData.voters_count}</strong>
        </td>
        <th style={{...blueBorderStyle , paddingLeft:'15px'}} className="text-left" colSpan="3"  >
            <span className="item-space">מס' בתי אב</span><strong>{captainData.households_count}</strong>
    &nbsp;&nbsp;  &nbsp;&nbsp;
            <span className="item-space">עמוד &nbsp;
            {currentCapitanPage}&nbsp;
            מתוך&nbsp;
            {totalPages}
            </span>
    
        </th>
    </tr> 
}
export default CaptainFiftyRowItem;
