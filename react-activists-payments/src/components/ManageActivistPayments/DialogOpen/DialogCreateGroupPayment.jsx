import React,{useState,useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Icon from '@material-ui/core/Icon';

import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Combo  from '../../global/Combo.js'
import LoadingTable  from '../../global/LoadingTable'
import Success  from '../../global/Success/Success'

// action
import * as globalList from '../../../actions/GlobalListAction.js'
import * as createPaymentAction  from '../../../actions/CreatePayments.js'
import ErrorTitle from '../../global/Errors/ErrorTitle.jsx';


//props.open 
//prop.type-
export default function DialogCreateGroupPayment(props) {

  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState('md');
  const [displayDetailsGroups, setDisplayDetailsGroups] = useState(false);
  const [paymentType, setPaymentType] = useState({id:null,name:null});
  const [shasBankDetailsId, setShasBankDetailsId] = useState({shas_bank_details_id:null,display_name:null});
  const [nameGroupPayments, setNameGroupPayments] = useState();
  const [openPaymentGroupSelect, setOpenPaymentGroupSelect] = useState({payment_group_id:null,display_details:null});

  const [optionCreatePayment,setOptionCreatePayment]=useState(1);//option new payment group=1 , for connect to different 2
  
  const [listShasBankDetails, setListShasBankDetails] = useState([]);//list of shas bank
  const [listPaymentType, setListPaymentType] = useState([]);//list of payment type for new group
  const [listPaymentGroupOpen, setListPaymentGroupOpen] = useState([]);//list for connect payment to open payment without reference_id
  const [isInvalidActivistPayment, setIsNewActivistPayment] = useState(props.isInvalidActivistPayment);

  //event on saving group component
  const [saving,setSaving]=useState(false);
  const [successEvent,setSuccess]=useState(false);
  const [errorEvent,setError]=useState(false);

  
  const closeDialogSuccess=()=>{
    closeDialog(true);
  }

  const closeDialog=(loadAgainTableNeePayment)=>{
    setDisplayDetailsGroups(false);
    debugger
    props.closeDialog(loadAgainTableNeePayment)
  }


  useEffect(() => {
    if(listShasBankDetails.length==0)
    globalList.shasBankDetails().then(a=>{setListShasBankDetails(a)});

    if(listPaymentType.length==0)
    globalList.paymentType().then(l=>{setListPaymentType(l)});
    
    if(listPaymentGroupOpen.length==0)//list payment open for add activist  payments for group
    createPaymentAction.getListOpenPaymentGroupForAddPayment().then(p=>{setListPaymentGroupOpen(p)})
  }, []);

  //func that create group payment for all record select with details
  const createGroupPaymentForRecordSelect=()=>{
    setSaving(true);

    if(optionCreatePayment==1)//option new group
    createPaymentGroup();
    else//option add for existing group in list
    addPaymentsToGroupPayment();
  }
const createPaymentGroup=()=>{
  createPaymentAction.createPaymentGroup(null,props.rowSelected,
    nameGroupPayments,
    paymentType.id,
    shasBankDetailsId.shas_bank_details_id,
    isInvalidActivistPayment
    ).then(function(){
       setSaving(false);
       setSuccess(true);
  }).catch(error=>{
    setError( createPaymentAction.displayErrorMessage(error))
    setSaving(false);
  })
    
}
  const addPaymentsToGroupPayment=()=>{
    createPaymentAction.addPaymentToExistingGroup(null,props.rowSelected,
      openPaymentGroupSelect.payment_group_id
        ).then(function(){
           setSaving(false);
           setSuccess(true);
      })
  }
  const comboChange=(list,idField,nameField,event)=>{

    let fieldValue = event.target.value;
    let itemCombo=list.findIndex(a=>a[nameField]==fieldValue)
    return list[itemCombo];
  }   

  const changePaymentType=(list,idField,nameField,event)=>{
    var val=comboChange(list,idField,nameField,event)
    if(val)
    setPaymentType(val)
  }

  const changeShasBank=(list,idField,nameField,event)=>{
    var val=comboChange(list,idField,nameField,event)
    if(val)
    setShasBankDetailsId(val)
  }

  const changeListPaymentOpen=(list,idField,nameField,event)=>{
    debugger
    var val=comboChange(list,idField,nameField,event)
    if(val)
    setOpenPaymentGroupSelect(val)
  }
  const changeInputNameGroup=(event)=>{
    let fieldValue = event.target.value;
    setNameGroupPayments(fieldValue);
  }

  return (
    <React.Fragment>
      <Dialog
        scroll='paper'
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        open={props.open}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle style={{fontWeight:'bold'}} id="max-width-dialog-title"><b>יצירת קבוצת תשלום</b>{displayDetailsGroups?' - פרטי תשלום':''}</DialogTitle>
        {!saving && !successEvent?<DialogContent dividers>
        { !displayDetailsGroups?
          <DialogContentText>
         האם ברצונך לייצר קבוצת תשלום עבור תשלומי 
         <b> {props.rowSelected[0].is_shas_payment==0?'ועדת בחירות':'מפלגה'} </b>
         בסכום של 
         <b> {props.sumAmount.toLocaleString(undefined, {maximumFractionDigits:2})} &#8362;</b> ?
          </DialogContentText>:
        

            <RadioGroup aria-label="gender" name="gender1" value={optionCreatePayment} onChange={setOptionCreatePayment.bind(this,optionCreatePayment==1?2:1)}>
                  <FormControlLabel value={1} control={<Radio color="primary"/>} label="קבוצה חדשה" />
                  {optionCreatePayment==1? <div className="option-div">
                  <div className="tit">
                שם קבוצת תשלום
              </div>
              <input required value={nameGroupPayments} style={{maxWidth:"350px"}} className="input-style" onChange={changeInputNameGroup.bind()}>
              </input>
            <div className="tit">
             סוג תשלום
           </div>
           <Combo  items={listPaymentType}
							
								id="member-type"
								multiSelect={false}
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="id"
								itemDisplayProperty="name"
								className="form-combo-table"
								value={paymentType.name}
								onChange={changePaymentType.bind(this,listPaymentType,'id','name')}
							/>
           <div className="tit">
             בנק ש"ס
           </div>
           <Combo  items={listShasBankDetails}
								id="member-type"
								multiSelect={false}
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="shas_bank_details_id"
								itemDisplayProperty="display_name"
								className="form-combo-table"
								value={shasBankDetailsId.display_name}
                onChange={changeShasBank.bind(this,listShasBankDetails,'shas_bank_details_id','display_name')}
							/>
                  </div>
                  :null}
                
                {!isInvalidActivistPayment? <FormControlLabel value={2} control={<Radio color="primary"/>} label="צרף לקבוצה פתוחה" />:''} 

                  {optionCreatePayment==2? 
                  <div  className="option-div">
                    <div className="tit">קבצי תשלום פתוחים</div>
                <Combo  items={listPaymentGroupOpen}
								id="member-type"
								multiSelect={false}
								maxDisplayItems={10}
								showFilteredList={false}
								itemIdProperty="payment_group_id"
								itemDisplayProperty="display_details"
								className="form-combo-table"
								value={openPaymentGroupSelect.display_details}
                onChange={changeListPaymentOpen.bind(this,listPaymentGroupOpen,'payment_group_id','display_details')}
							/>

                  </div>
                  :null
                  }
              
            </RadioGroup>


        
       
          }
        </DialogContent>:null}
        {saving?<LoadingTable title="מייצר קבוצת תשלום חדשה"></LoadingTable>:null}
        {successEvent?<Success  eventClose={closeDialogSuccess.bind()}></Success>:null}
        {errorEvent?<ErrorTitle  title={errorEvent}></ErrorTitle>:null}
        <DialogActions>
          <Button disabled={saving || successEvent} onClick={closeDialog.bind(false)} color="primary">
            ביטול
          </Button>

        { !displayDetailsGroups?
        <Button disabled={saving || successEvent} onClick={setDisplayDetailsGroups.bind()} variant="outlined" color="primary" href="#outlined-buttons">
          כן
        </Button>:

          <Button disabled={saving || successEvent} onClick={createGroupPaymentForRecordSelect.bind()}
          variant="contained"
          color="primary"
          endIcon={<AssignmentTurnedInIcon />}
        >
            {optionCreatePayment==1?<p>צור קבוצת תשלום</p>:<p>צרף לקבוצת תשלום קיימת</p>}
        </Button>
 
        }
        </DialogActions>
       
      </Dialog>
    </React.Fragment>
  );
}
