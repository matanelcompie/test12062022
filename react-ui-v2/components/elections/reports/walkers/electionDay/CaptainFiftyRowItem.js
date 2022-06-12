import React, { Component } from 'react';
const CaptainFiftyRowItem = ({ item }) => {
    let blueBorderStyle = { borderTop: '1px solid #498BB6', borderBottom: '1px solid #498BB6' };
    return <tr style={{ color: '#323A6B', fontSize: '18px', backgroundColor: '#CCDEEA' }}>
        <td style={blueBorderStyle}>עיר</td>
        <th style={blueBorderStyle}><strong>{item.city_name}</strong></th>
        <td style={blueBorderStyle} className="text-center" colSpan="8"> 
            <span className="item-space">שר מאה</span>
            <strong>{item.first_name + ' ' + item.last_name}</strong>&nbsp;&nbsp;
            <strong>|</strong>&nbsp;&nbsp;
            <strong>ת.ז {item.personal_identity}</strong>&nbsp;&nbsp;
            <strong>|</strong>&nbsp;&nbsp;
            <strong>{item.phone != '' ? (item.phone_type == 2 ? 'נייד' : 'טלפון') : ''} {item.phone}</strong>
        </td>
        <td style={blueBorderStyle} className="text-center" colSpan="3">
            <span className="item-space">מס' תושבים</span>
            <strong>{item.voters_in_households_count}</strong>
        </td>
        <th style={{ ...blueBorderStyle, paddingLeft: '15px' }} className="text-left" colSpan="4">
            <span className="item-space">מס' בתי אב</span>
            <strong>{item.households_count}</strong>
        </th>
    </tr>
}
export default CaptainFiftyRowItem;