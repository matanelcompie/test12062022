import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function DialogQuestion(props) {
  const [open, setOpen] = React.useState(props.open);

  const handleClickOk = () => {
   props.yes();
  };

  const handleClose = () => {
    props.no();
  };

  return (
    <div>
    
      <Dialog
      maxWidth="md"
        open={props.open}
        onClose={handleClose.bind()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="alert-dialog-description">
          {props.question}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickOk.bind()} color="primary">
            כן
          </Button>
          <Button onClick={handleClose.bind()} color="primary" autoFocus>
            לא
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
