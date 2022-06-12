import React ,{useState,useRef} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DataGrid } from '@material-ui/data-grid';
import TablePaymentList from '../TabPanels/TablePaymentList.jsx'
import DeleteIcon from '@material-ui/icons/Delete';
import { deletePaymentGroupById } from '../../../actions/CreatePayments.js';
import DialogQuestion from '../../global/DialogQuestion.jsx'
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import * as PaymentGroupService from '../../../services/PaymentGroupService.js';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));

export default function DialogListPaymentGroup(props) {
  const classes = useStyles();
  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState('xl');
  const [questionDeleteGroup, setQuestionDeleteGroup] = useState(false);
  const tableReference=useRef();


  
    const deletePaymentGroup=(paymentGroup)=>{

          deletePaymentGroupById(null,props.paymentGroup.payment_group_id).then(function(){
            setQuestionDeleteGroup(false);
            //update the parent component 
            props.removeFromPaymentGroupList(props.paymentGroup.payment_group_id);
         })
    }

    const renderDetailsPaymentGroup=(paymentGroup)=>{
      props.renderDetailsPaymentGroup(paymentGroup);
    }

    const downloadExcel=()=>{
      PaymentGroupService.downloadExcelDetails(props.paymentGroup.payment_group_id);
    }

  return (
    <React.Fragment>
    
      <Dialog
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        open={props.openDialog}
        onClose={props.closeListPayments.bind(true)}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title">
          <b>רשומות תשלום עבור קובץ :</b>{props.paymentGroup.payment_group_name}
          <div style={{display:'flex',direction:'ltr'}}>
          <button  onClick={downloadExcel} className="btn btn-success"><i className="fa fa-file-excel-o"></i> | הורד אקסל</button>
          </div>
          </DialogTitle>
         
        <DialogContent>
          <DialogContentText>
           <TablePaymentList renderDetailsPaymentGroup={renderDetailsPaymentGroup.bind()} ref={tableReference} paymentGroup={props.paymentGroup} ></TablePaymentList>
          </DialogContentText>
          {/* <form className={classes.form} noValidate>

          </form> */}
        </DialogContent>
        <DialogActions style={{borderTop:'1px solid #8080803d'}}>
          <div className="sumAmount">
          סה"כ תשלום  {props.paymentGroup.sumAmount?(props.paymentGroup.sumAmount).toLocaleString(undefined, {maximumFractionDigits:2}):0 } &#8362;
          </div>
          <Button onClick={props.closeListPayments.bind(true)} color="primary">
            סגור
          </Button>
          {!props.paymentGroup.reference_id? <Button onClick={ setQuestionDeleteGroup.bind(this,true)} variant="outlined" color="primary"  endIcon={<DeleteIcon />}>
           מחק קבוצת תשלום
           </Button>
           :
           ''
          //  <Button   onClick={() => tableReference.current.updateMultiRecordStatus()} variant="contained" color="primary"  endIcon={<ThumbUpIcon />}>
          //    סמן אימות לרשומות שנבחרו 
          //  </Button>
           }
        </DialogActions>
        <DialogQuestion open={questionDeleteGroup} question="האם ברצונך למחוק קבוצת תשלומים זו?" title="מחיקת קבוצת תשלום" no={setQuestionDeleteGroup.bind(this,false)} yes={deletePaymentGroup}></DialogQuestion>
      </Dialog>
    </React.Fragment>
  );
}
