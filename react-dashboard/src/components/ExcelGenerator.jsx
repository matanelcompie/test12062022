import React, {useContext, useEffect, useState } from 'react';
import { getExcelByPlace } from '../hooks/useCall.jsx';

const ExcelGenerator = (props) => {
  const {type, id} = props;
  const [text, setText] = useState("");

  const getExcel = () => {
    setText("שולח בקשה...");
    let url = getExcelByPlace(type, id);
    
    setTimeout(() => {
      let result = window.open(url, "", "width=700,height=500");
      if (result) {
        setText("הבקשה נשלחה. חלון נפתח להורדה.");
        setTimeout(() => {
          setText("");
        }, 5000);
      }
    }, 1500);
  };

 

  return (
   
    <div className="header-btns excel-wrp">
      {text && <span>{text}</span>}
      <button onClick={getExcel}> <i className="fa fa-file-excel-o"></i>ייצוא לאקסל</button>
    </div>
  )
}

export default ExcelGenerator
