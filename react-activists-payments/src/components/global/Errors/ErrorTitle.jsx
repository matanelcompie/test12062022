import React,{useState,useEffect} from 'react';
;

import "./ErrorTitle.scss";

/*
eventClose=function to call after prop time second
timeClose
*/
export default function ErrorTitle(props) {
 const [eventCall, setEventCall] = useState(false);
 const [timeClose, setTime] = useState( props.timeClose? props.timeClose:1000);

  useEffect(() => {
    if(!eventCall)
        setTimeout(() => {
            props.eventClose();
            setEventCall(true);
          },timeClose);

  }, [eventCall])
  return (
    <div className="text">
      <i className="fa fa-times" aria-hidden="true"></i>
      {props.title?props.title:'שגיאה'}  
    </div>
  );
}
