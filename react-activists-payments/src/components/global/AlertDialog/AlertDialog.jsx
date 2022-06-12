import React,{useState,useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useDispatch, useSelector } from 'react-redux';
import * as SystemActions from '../../../actions/SystemActions'


export default function AlertDialog(props) {

  const [fullWidth, setFullWidth] = useState(true);
  const [maxWidth, setMaxWidth] = useState('sm');
  const dispatch = useDispatch()
  const open = useSelector(state=>state.system.displayErrorModalDialog);
  const message = useSelector(state=>state.system.modalDialogErrorMessage);

  const closeAlert=()=> {
    debugger
    dispatch({type: SystemActions.ActionTypes.TOGGLE_ERROR_MSG_MODAL_DIALOG_DISPLAY,displayError: false, errorMessage: ''})  
  }

  return (
    <React.Fragment>
      <Dialog
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        open={open}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle style={{fontWeight:'bold'}} id="max-width-dialog-title"><b>הודעה</b></DialogTitle>
        <DialogContent dividers>
            <DialogContentText>
            {message}
            </DialogContentText>
        </DialogContent>
        <DialogActions >
        <Button onClick={closeAlert}  color="primary" href="#outlined-buttons">
            אישור
        </Button>
        </DialogActions>
       
      </Dialog>
    </React.Fragment>
  );
}
