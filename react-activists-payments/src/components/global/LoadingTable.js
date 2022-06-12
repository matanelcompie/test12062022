import React from 'react';
;

import "../../../scss/elements/loading.css";

export default function LoadingTable(props) {
    const title='טוען נתונים';
  return (
    <div className="loading-con">
    <div className="loading-tit">{props.title?props.title:title}</div>
    <div>
    <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
    </div>
  );
}
