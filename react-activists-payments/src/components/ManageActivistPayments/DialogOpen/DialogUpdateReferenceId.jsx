import React,{useState,useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import * as DateActionHelper from '../../../helpers/DateActionHelper.js'
import LoadingTable from '../../global/LoadingTable'
import Success from '../../global/Success/Success'

import DatePicker from "react-datepicker"; // https://github.com/Hacker0x01/react-datepicker
import "react-datepicker/dist/react-datepicker.css";
import TextField from '@material-ui/core/TextField';


//props.open 
//prop.type-
export default function DialogUpdateReferenceId(props) {

  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState('sm');


  const [reference_id, setReference_id] = useState(props.paymentGroup.reference_id);
  const [transfer_date, setTransfer_date] = useState(null);
  const [open, setOpen] = useState(props.open);
  // const [transfer_date, setTransfer_date] = useState(props.paymentGroup.transfer_date);

  useEffect(() => {
    
  if(transfer_date===null){
    debugger
    if(!props.paymentGroup.transfer_date)
    setTransfer_date(DateActionHelper.myDateToDatePiker());//default  today
    else
    setTransfer_date(DateActionHelper.myDateToDatePiker(props.paymentGroup.transfer_date));//date transfer to piker element
  }
  
  }, [transfer_date])

  const onDatePickerChange=(event)=>{
    setTransfer_date(event.target.value);
  }

  const closeDialog=()=>{
    setDisplayDetailsGroups(false);
    props.closeDialog(false)
  }

  const updateReferenceId=()=>{
    props.updateReferenceId(reference_id,transfer_date,props.paymentGroup)
  }

  const handleChange=(event)=> {
      setReference_id(event.target.value);
  }

  const d=(event)=> {
   
  }

  const isDisabled=()=>{
    return props.paymentGroup.reference_id && (!reference_id || reference_id=='')?true:false;
  }
  return (
    <React.Fragment>
      <Dialog
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        open={open}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle style={{fontWeight:'bold'}} id="max-width-dialog-title"><b>עדכון מספר אסמכתא</b></DialogTitle>
        {!props.successEvent && !props.savingEvent? <DialogContent dividers>
            <DialogContentText>
              <div>
              <div className="tit">
             קוד אסמכתא
           </div>
              <input value={reference_id} onChange={handleChange.bind()} type="number" className="form-control">
              </input>
              {
              
              !props.paymentGroup.reference_id ?<div className="tit-warn-reference">
                    <b>שים לב, </b>לאחר עדכון מספר אסמכתא לא יהיה ניתן לבטל רשומות לתשלום
                  </div>
                  :<div  style={{marginTop:'5px',fontSize:'14px',color:isDisabled()?'red':'black'}}>* שדה חובה</div>              }
     
                         <div className="tit">
                        תאריך העברה
                        </div>
                      <TextField style={{width:'203px'}}
                          id="datetime-local"
                          type="datetime-local"
                          onChange={onDatePickerChange.bind(this)}
                          value={transfer_date}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                 {/* {!isValidDate ?<div className="error-label">* תאריך שגוי</div>:null  }    */}
              </div>
            
            </DialogContentText>
        </DialogContent>
        :null
        }
        {props.savingEvent && !props.successEvent?<LoadingTable title="שומר נתונים"></LoadingTable>:null}
        {props.successEvent?<Success  eventClose={setOpen.bind(false)}></Success>:null}
        <DialogActions >
          <Button disabled={props.successEvent || props.savingEvent} onClick={props.closeDialog.bind(false)} color="primary">
            ביטול
          </Button>
              <Button disabled={props.successEvent || props.savingEvent} disabled={isDisabled()} onClick={updateReferenceId.bind()} variant="outlined" color="primary" href="#outlined-buttons">
            שמור
            </Button>
        </DialogActions>
       
      </Dialog>
    </React.Fragment>
  );
}
