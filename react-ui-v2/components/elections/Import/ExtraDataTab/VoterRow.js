import React, { Component } from 'react';

const VoterRow = ({ id, className, instituteName, typeName, cityName, rowClickDelegate, rowDblClickDelegate }) => {
  return <tr style={{ wordWrap: 'break-word' }} className={className} onClick={rowClickDelegate} onDoubleClick={rowDblClickDelegate}  >
    <td>{id + 1}</td>
    <td>{instituteName}</td>
    <td>{typeName}</td>
    <td>{cityName}</td>
  </tr>
}
export default VoterRow;