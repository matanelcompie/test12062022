import React from 'react';

const ScrollButton = (props) => {
  const {showScrollButton} = props;
  const goTop = () => {
    window.scrollTo(0, 0);
  }

  return (
    <div className={`scroll-top-wrp ${showScrollButton ? "" : "hide-smooth"}`}>
      <div className="scroll-top" onClick={goTop}>
        <div className="arrow">⇡</div>
        <div className="text">למעלה</div>
      </div>
    </div>
  )
}

export default ScrollButton
