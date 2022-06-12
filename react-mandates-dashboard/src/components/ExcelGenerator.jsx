import React, {useContext, useEffect, useState } from 'react';
import { displayContext } from '../context/displayContext.jsx';
import { getExcelByPlace ,getCurrentUser} from '../hooks/useCall.jsx';

const ExcelGenerator = () => {
  const {display, setDisplay} = useContext(displayContext);
  const [text, setText] = useState("");
  const [currentUser, setUser] = useState(false);

  useEffect(() => {
    getCurrentUser().then((result)=>{
      var user = result.data.data;
        var permissions = {};
        user.permissions.forEach(function (permission) {
            permissions[permission.operation_name] = true;
        });
        user.permissions = permissions;
        setUser(user);
    })
  }, [])

  const getExcel = () => {
    setText("שולח בקשה...");
    if (display.currentScreenDisplayed.type === null) {
      setText("אין מידע על המסך הרצוי.");
      return;
    }
    let url = getExcelByPlace(display.currentScreenDisplayed.type, display.currentScreenDisplayed.id);
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

  const reportBallotVotes=()=>{

    setDisplay(prev => ({...prev, isReportVotes: true}));
    
  }

  const isPermissionValid=()=>{
    if (currentUser && (currentUser.admin || currentUser.permissions['dashboards.mandates.report'])) 
      return false;

      return true;
  }

  console.log('display.currentTab', display.currentTab)
  console.log('~~~~~~~~~~~display', display)

  return (

<div>
<div className="report-votes" >
      <button disabled={isPermissionValid()}  onClick={reportBallotVotes}> <i className="fa fa-thumbs-o-up"></i> דווח קולות</button>
</div>
{
    (display.currentScreenDisplayed.type !== null && display.currentTab !== "") ?
    <div className="excel-wrp">
      {text && <span>{text}</span>}
      <button onClick={getExcel}> <i className="fa fa-file-excel-o"></i>ייצוא לאקסל</button>
    </div>
    :
    <div className="excel-msg">
      {
        (display.currentTab === "MAIN") ? "מכין את כפתור ההורדה לאקסל"  : "יש לבצע חיפוש בכדי לאפשר הורדה לאקסל" 
      }
    </div>
    }
    </div>
  )
}

export default ExcelGenerator
