import React, { useState } from 'react'
import './Tooltip.css'

export default function Tooltip (props) {

      const [displayTooltipp, setDisplayTooltipp] = useState(false);
 
    
    const hideTooltipp = () => {
      setDisplayTooltipp(false)
    };
    const showTooltipp = () => {
      setDisplayTooltipp(true)
    };
  
      return (
        <span className='tooltipp'
            onMouseLeave={hideTooltipp}
          >
          {displayTooltipp &&
          <div className={`tooltipp-bubble tooltipp-${props.position}`}>
            <div className='tooltipp-message'>{props.children}</div>
          </div>
          }
          <span 
            className='tooltipp-trigger'
            onMouseOver={showTooltipp}
            >
            {props.message}
          </span>
        </span>
      )
  
  }

