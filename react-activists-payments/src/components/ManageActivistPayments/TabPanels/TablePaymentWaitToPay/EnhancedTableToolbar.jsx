import React ,{useEffect}from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import '../../../../../scss/scssComponents/TabsPayment.scss'


export  default function EnhancedTableToolbar(props) {
  const useToolbarStyles = makeStyles((theme) => ({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 100%',
      display:'flex'
    },
  }));
    const classes = useToolbarStyles();
    const { numSelected } = props;
    const { sumAmountSelected } = props;
    const { countRecord } = props;
    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          <b>נבחרו {numSelected} רשומות תקינות  מתוך {props.detailsPaymentRecordForPay.countValid} רשומות תקינות|</b> &nbsp;  <p>{props.detailsPaymentRecordForPay.countNotValidBank}</p> &nbsp; עם בנק לא תקין  
          </Typography>) :
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          <b>נבחרו {0} רשומות תקינות  מתוך {props.detailsPaymentRecordForPay.countValid} רשומות תקינות |</b> &nbsp;  <p>{props.detailsPaymentRecordForPay.countNotValidBank}</p> &nbsp; עם בנק לא תקין    
          </Typography>
         }
         <div className="summery-selected">
         {sumAmountSelected.toLocaleString(undefined, {maximumFractionDigits:2})} &#8362;
         </div>
      </Toolbar>
    );
  };
  
  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };