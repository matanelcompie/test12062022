import React, { Component } from 'react';
const CaptainFiftyCityRowItem = ({ city_name }) => {
return  <tr  className="city-details" style={{color:'#498BB6' , fontSize:'18px'}}>
            <td colSpan="15" style={{textAlign:'right'}}>
                <span className="item-space">עיר </span>
                <strong>{city_name}</strong>
            </td>
        </tr>
}
export default CaptainFiftyCityRowItem;