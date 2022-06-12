import React,{useState,useEffect} from 'react';
;

import "./Success.scss";

/*
eventClose=function to call after prop time second
timeClose
*/
export default function Success(props) {
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
    <div className="Success">
      <i className="fa fa-check" aria-hidden="true"></i>
      {props.title?props.title:'הנתונים נשמרו בהצלחה'}  
    </div>
  );
}
