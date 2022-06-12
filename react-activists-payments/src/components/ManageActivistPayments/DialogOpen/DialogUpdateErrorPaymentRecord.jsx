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
import Combo from '../../global/Combo.js';
import * as GlobalListAction from '../../../actions/GlobalListAction'
import constants from '../../../libs/constants';
import ActivistPaymentService from '../../../services/ActivistPaymentService.js';

//props.open 
//prop.type-
export default function DialogUpdateErrorPaymentRecord(props) {

  const [fullWidth, setFullWidth] = useState(true);
  const [activistPaymentDetails, setActivistPaymentDetails] = useState(props.activistPaymentNotValid?props.activistPaymentNotValid:null);
  const [open, setOpen] = useState(props.open);
  const [reasonPaymentStatusList, setReasonPaymentStatusList] = useState([]);
  const [listPaymentStatus,setListPaymentStatus]=React.useState(null);
  const [successEvent,setSuccessEvent]=React.useState(false);
  const [savingEvent,setSavingEvent]=React.useState(false);

  useEffect(()=>{
    GlobalListAction.reasonPaymentStatus().then((reasonPaymentStatusList)=>{
        if(reasonPaymentStatusList){
            setReasonPaymentStatusList(reasonPaymentStatusList);
        }
    })
        GlobalListAction.paymentStatusType().then(function(listPaymentType){
          setListPaymentStatus(listPaymentType);
      })
},[])

useEffect(()=>{
    setOpen(props.open)
},[props.open]);

useEffect(()=>{
  setActivistPaymentDetails(props.activistPaymentNotValid)
},[props.activistPaymentNotValid]);


  const closeDialog=()=>{
    setDisplayDetailsGroups(false);
    props.closeDialog(false)
  }

  const handleChange=(event)=> {
    setActivistPaymentDetails({
        ...activistPaymentDetails,
        [event.target.name]:event.target.value
    });
  }

  const handleComboChange=(list,idField,nameField,event)=>{

    let fieldValue = event.target.value;
    let value=null
    let index=list.findIndex(a=>a[nameField]==fieldValue)
    if(index>-1)
    value=list[index][idField];

    setActivistPaymentDetails({
        ...activistPaymentDetails,
        'reason_status_id':value
    });
  }   


  const updateActivistPaymentStatus=()=>{

    const index=listPaymentStatus.findIndex(a=>{return a.system_name==constants.payment_status_types.incorrect_payment});
    const activistPaymentDetailsSave=activistPaymentDetails;
    activistPaymentDetailsSave.status_id=listPaymentStatus[index].id;
    activistPaymentDetailsSave.reason_status_name=listPaymentStatus[index].name;
    activistPaymentDetailsSave.payment_status_system_name=constants.payment_status_types.incorrect_payment;

      ActivistPaymentService.update(activistPaymentDetailsSave).then(()=>{
        props.closeModel(activistPaymentDetailsSave);
      })
  }


  return (
    <React.Fragment>
    {activistPaymentDetails?  <Dialog
        fullWidth={fullWidth}
        maxWidth="sm"
        open={open}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle style={{fontWeight:'bold'}} id="max-width-dialog-title"><b>עדכון רשומת תשלום שגויה</b></DialogTitle>
        {!props.successEvent && !props.savingEvent? <DialogContent dividers>
            <DialogContentText>
            <div className="tit">
            סיבת רשומה שגויה
           </div>
           <Combo name="reason_status_id" onChange={(event)=>{handleComboChange(reasonPaymentStatusList,'id','name',event)}} style={{maxWidth:'203px'}} className="form-control"  
                                items={reasonPaymentStatusList}
								id="member-type"
								multiSelect={false}
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								value={activistPaymentDetails.reason_status_id}
							/>
                         
            <div style={{marginTop:'7px'}} className="tit">
           הערה
           </div>
           <input onChange={handleChange} name="comment" style={{width:'100%'}} className="form-control"/>
           <br/>
           <div>* שים לב, לאחר עדכון רשומה כשגויה המערכת תייצר רשומת תשלום נוספת להעברה</div>
            </DialogContentText>
        </DialogContent>
        :null
        }
        {props.savingEvent && !props.successEvent?<LoadingTable title="שומר נתונים"></LoadingTable>:null}
        {props.successEvent?<Success  eventClose={setOpen.bind(false)}></Success>:null}
        <DialogActions >
          <Button onClick={props.closeModel}  color="primary">
            ביטול
          </Button>
              <Button onClick={updateActivistPaymentStatus}  variant="outlined" color="primary" >
            עדכן
            </Button>
        </DialogActions>
       
      </Dialog>:''}
    </React.Fragment>
    
  );
}
