import React, { Component } from 'react';

const BottomButtons = ({isDisabled , continueClick , backClick, continueText}) => {
    return (
        <div className="row prevNextRow">
            <div className="col-lg-6">
                <img src={window.Laravel.baseURL + "Images/ico-arrows.svg"} title="חזרה"
                     style={{cursor: 'pointer'}} onClick={backClick.bind(this)}/>
            </div>
            <div className="col-lg-6 nopadding">
                <button className="btn btn-primary pull-left" disabled={isDisabled}
                        onClick={continueClick.bind(this)}>
                    {continueText}
                </button>
            </div>
        </div>
    );
};

export default BottomButtons ;