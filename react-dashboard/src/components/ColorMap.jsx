import React from 'react';

const ColorMap = (props) => {
  const {dashboardType} = props
  
  
  return (
    <>
    {
      (dashboardType === "DETAILED") ?
      <div className="color-map-modal">
        <div className="text">מקרא צבעים</div>
          <div className="color color-red">אדום: פער של יותר מ 30% מהיעד</div>
          <div className="color color-yellow">צהוב: פער שבין 10% ל 30% מהיעד </div>
          <div className="color color-green">ירוק: פער שבין 0% לבין 10% אחוז מהיעד</div>
          <div className="color color-blue">כחול: מעל היעד</div>
          <hr/>
          <div className="color color-grey">אפור: סה"כ הבוחרים המשויכים</div>
          <hr/>
          <div className="color color-teal">זהו הצבע המציין את היעד</div>
      </div>
      :
      <div className="color-map-modal">
        <div className="text">מקרא צבעים</div>
          <div className="color color-red">אדום: פער של יותר מ 70% מהיעד</div>
          <div className="color color-yellow">צהוב: פער שבין 40% ל 70% מהיעד </div>
          <div className="color color-green">ירוק: פער שבין 10% לבין 40% אחוז מהיעד</div>
          <div className="color color-blue">כחול: פער הקטן מ 10% מהיעד</div>
          <hr/>
          <div className="color color-grey">אפור: סה"כ הבוחרים המשויכים</div>
          <hr/>
          <div className="color color-teal">היעד במסך זה הוא 100%</div>
      </div>
    }
    </>
  )
}

export default ColorMap;

 // if gap is greater then 30 -> red.
  // if gap is between 11 to 30 -> yellow.
  // if gap is between 10 to 0 -> green.
  // if gap is smaller (-1...) then 0 -> blue.