import React, { Component } from 'react';

const VoterRow = ({id , className , firstName , lastName , cityName,street , rowClickDelegate , rowDblClickDelegate, personalIdentity}) => {
  return <tr style={{wordWrap: 'break-word'}} className={className}  onClick={rowClickDelegate} onDoubleClick={rowDblClickDelegate}  >
                        <td>{personalIdentity}</td>
                        <td>{firstName}</td>
                        <td>{lastName}</td>
                        <td>{cityName}</td>
                        <td>{street}</td>
         </tr>
}
export default VoterRow ;