import React, { useEffect, useState } from "react";
import ScrollButton from "./ScrollButton.jsx";

function Footer() {

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleScroll = () => {
    
    if (window.scrollY >= 300) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }

  return (
    <footer>
      <div className="full-width-footer">
        <div className="row no-gutters align-items-center first-row">
          <div className="col">
            <p>© כל הזכויות שמורות</p>
          </div>
          <div className="col d-flex justify-content-end">
            <address>
               תמיכה טכנית: 
              <a href="tel:+232216733"> 02-32216733 </a>
              <a href="mailto:support@shas.org.il">support@shas.org.il</a>
            </address>
          </div>
        </div>
      </div>
      <ScrollButton showScrollButton={showScrollButton}/> 
    </footer>
  );
}

export default Footer;
