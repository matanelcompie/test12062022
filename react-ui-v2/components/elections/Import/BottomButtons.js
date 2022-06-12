import React, { Component } from 'react';

const BottomButtons = ({errorText , isDisabled , btnClick , backClick , backButtonDisabled}) => {
  return        <div>
		              <i><span style={{color:'#ff0000' ,fontWeight:'bold'}}>{errorText}</span></i>
                      <div className="row prevNextRow">
                                            <div className="col-lg-6"> <a alt="חזרה" title="חזרה" style={{cursor:(backButtonDisabled ?'not-allowed' :'pointer') , opacity:(backButtonDisabled ? '0.4':'')}} onClick={(backButtonDisabled ? null:backClick)}><img src={ window.Laravel.baseURL + "Images/ico-arrows.svg"} /></a> </div>
                                            <div className="col-lg-6">
                                                  <button type="submit" className="btn btn-primary pull-left" disabled={isDisabled} style={{fontSize:'18px' , paddingRight:'40px' , paddingLeft:'40px'}} onClick={btnClick}>המשך</button>
                                            </div>
                      </div>
		         </div>
}
export default BottomButtons ;