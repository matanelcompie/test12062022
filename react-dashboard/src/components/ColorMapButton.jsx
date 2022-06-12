import React from 'react';

const ColorMapButton = (props) => {

  const {setShowColorMapModal} = props;
  
  return (
    <div 
      className="header-btns color-map" 
      onMouseEnter={() => {setShowColorMapModal(true)}} 
      onMouseLeave={() => {setShowColorMapModal(false)}}
      >
         <button> <i className="fa fa-bar-chart"></i>מקרא צבעים</button>

        {/* <div><b>למסך זה</b></div>
        <div className="color color-blue"></div>
        <div className="color color-yellow"></div>
        <div className="color color-green"></div>
        <div className="color color-red"></div> */}
    </div>
  )
}

export default ColorMapButton;
