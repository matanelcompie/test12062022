import React ,{useEffect}from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';

import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import Button from '@material-ui/core/Button';
import DialogCreateGroupPayment from '../../DialogOpen/DialogCreateGroupPayment.jsx';
import '../../../../../scss/scssComponents/TabsPayment.scss'

import { useSelector,useDispatch,useStore} from 'react-redux'
import EnhancedTableToolbar from './EnhancedTableToolbar.jsx';
import EnhancedTableHead from './EnhancedTableHead.jsx';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
export default function TableInvalidActivistPayment(props){

    const useStyles2 = makeStyles((theme) => ({
        popover: {
          pointerEvents: 'none',
        },
        paper: {
          padding: theme.spacing(1),
        },
      }));
    const classes = useStyles2();
    const classes2=useStyles2();
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [isAllSelected, setIsAllSelected] = React.useState(false);
    const [errorPreparedPayment, setErrorPreparedPayment] = React.useState(false);
    const [openDialogCreateGroup, setOpenDialogCreateGroup] = React.useState(false);
    const [sumAmountSelected, setSumAmountSelected] = React.useState(0);
    const [anchorEl, setAnchorEl] = React.useState(null);
  
  
    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handlePopoverClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
  
    
    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };
  
    const handleSelectAllClick = (event) => {
      var isAllSelectedValue=isAllSelected;
      setIsAllSelected(!isAllSelectedValue)
      if (event.target.checked) {
        var canSelected=props.arrNeedPaymentsRecord.arrPaymentGroupItem.filter((row) =>{return row.voter_default_bank_details.is_bank_valid});
        setSelected(canSelected);
        return;
      }
      setSelected([]);
    };
  
  
    useEffect(() => {
      checkCreatePaymentRecord();
      summeryAmountSelected();
      
    }, [selected]);
  
    const summeryAmountSelected=()=>{
      var sum=0;
      selected.forEach(a=>sum+=a.amount);
      setSumAmountSelected(sum);
    }
    //event on select element check if can prepared payments
    const checkCreatePaymentRecord=()=>{
      var message=false
      if(selected.length){
        debugger
        var includeShasPayments= selected.find(activist_payment=> +activist_payment.is_shas_payment==1);
        var includeNotShasPayments=selected.find(activist_payment=> +activist_payment.is_shas_payment==0);
    
        if(includeShasPayments && includeNotShasPayments)
        message='* אין אפשרות לייצא תשלומים עבור שני סוגי תשלום';
      }
      setErrorPreparedPayment(message);
   
    }
  
    const handleClick = (event, indexRow,row) => {
      const selectedIndex = selected.findIndex(a=>a.id==row.id)
      let newSelected = [];
  
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, row);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
  
      setSelected(newSelected);
    };
  
  
    const isSelected = (row) => selected.findIndex(a=>a.id==row.id) !== -1;
  
    const emptyRows = props.arrNeedPaymentsRecord?rowsPerPage - Math.min(rowsPerPage, props.arrNeedPaymentsRecord.arrPaymentGroupItem.length - page * rowsPerPage):0;
  
    const createGroupPayments=()=>{
      setOpenDialogCreateGroup(true);
    }
  
    const closeDialog=(loadNeedPaymentArr)=>{
      setOpenDialogCreateGroup(false);
      if(loadNeedPaymentArr)
      //function to load again record need Pay
      props.LodNeedPayment();
    }

    const headCells = [
      { id: 'voter_name', numeric: false, disablePadding: true, label: 'שם פעיל' },
      { id: 'is_shas_payment', numeric: true, disablePadding: true, label: 'סוג תשלום' },
      { id: 'personal_identity', numeric: true, disablePadding: false, label: 'תעודת זהות' },
      { id: 'dd', numeric: true, disablePadding: false, label: 'פרטי חשבון' },
      { id: 'is_bank_valid', numeric: true, disablePadding: false, label: 'בנק תקין'},
      { id: 'amount', numeric: true, disablePadding: false, label: 'סכום' },
      { id: 'amount', numeric: true, disablePadding: false, label: 'אסמכתא אב' },
      { id: 'amount', numeric: true, disablePadding: false, label: 'אסמכתא מקור' },
      { id: 'payment_status_name', numeric: true, disablePadding: false, label: 'סיבת שגיאה' },
      { id: 'payment_status_name', numeric: true, disablePadding: false, label: 'הערות שגיאה' },
      { id: 'amount', numeric: true, disablePadding: false, label: 'תאריך העברה קודמת' }
    ];

    const openActivistPage=(row)=> {
      //console.log(window.Laravel.baseURL  + "elections/activists/" +row.voter_key);
      window.location.href = window.Laravel.baseURL  + "elections/activists/" +row.voter_key;
    }

    return (
        <div className={classes.root}>
          <Paper className={classes.paper}>
            <TableContainer>
            <Typography style={{padding:'7px',color:'#3f51b5'}} variant="h6" id="tableTitle" component="div">
             <b> נמצאו {props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0} רשומות הממתינות לטיפולך</b>
            </Typography>
    
              <Table
                className={classes.table}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
                aria-label="enhanced table"
              >
                <EnhancedTableHead
                  classes={classes}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  isAllSelect={isAllSelected}
                  headCells={headCells}
                  rowCount={props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0}
                />
                { props.arrNeedPaymentsRecord.arrPaymentGroupItem?
                <TableBody>
                  {stableSort(props.arrNeedPaymentsRecord.arrPaymentGroupItem, getComparator(order, orderBy))
                    .map((row, index) => {
                      const isItemSelected = isSelected(row);
                      const labelId = `enhanced-table-checkbox-${index}`;
    
                      return (
                        <TableRow
                          hover
                        //   onClick={(event) => handleClick(event, row.name)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={+row.id}
                          selected={isItemSelected}
                        
                        >
                          <TableCell padding="checkbox">
                  
                   
                             <Checkbox disabled={!row.voter_default_bank_details.is_bank_valid || row.voter_default_bank_details.is_bank_valid==0}  onClick={(event) => handleClick(event, index,row)}
                             checked={isItemSelected}
                             inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </TableCell>
                           
                          <TableCell align="right">
                          <div className="nameActive" onClick={()=>{openActivistPage(row)}}>
                            <b>{row.voter_name}</b>
                            </div>
                          </TableCell>
                          <TableCell align="right">{+row.is_shas_payment==1?'ש"ס':'ועדת בחירות'}</TableCell>
                          <TableCell align="right">{row.personal_identity}</TableCell>
                          {row.voter_default_bank_details?<TableCell align="right"><b>בנק-</b>{row.voter_default_bank_details.bank_id}<b>/ סניף- </b>{row.voter_default_bank_details.branch_number}<b>/ חשבון-</b>{row.voter_default_bank_details.bank_account_number}</TableCell>
                          :<TableCell align="right"><i>לא הוגדר פרטי חשבון</i></TableCell>}
                          <TableCell align="right"><i className={row.voter_default_bank_details && +row.voter_default_bank_details.is_bank_valid==1?"fa fa-check":"fa fa-times-circle-o my_style"} aria-hidden="true"></i></TableCell>
                          <TableCell align="right">&#8362;{row.amount}</TableCell>
                          <TableCell align="right">{row.parent_activist_payment.reference_id}</TableCell>
                          <TableCell align="right">{row.first_activist_payment.reference_id}</TableCell>
                          <TableCell align="right">{row.parent_activist_payment.reason_payment_status_name}</TableCell>
                          <TableCell align="right">{row.parent_activist_payment.comment}</TableCell>
                          <TableCell align="right">{row.parent_activist_payment.transfer_date}</TableCell>
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>:'שגיאה פנה למנהל מערכת'}
              </Table>
            </TableContainer>
    
              <EnhancedTableToolbar
              detailsPaymentRecordForPay={props.arrNeedPaymentsRecord}
              countRecord={props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0} 
              sumAmountSelected={sumAmountSelected} 
              numSelected={selected.length} />
          </Paper>
    <br/>
          <div className="con-btn-bottom ltr">
                <div className="btn-left">
    
                  { errorPreparedPayment? <div className="error-title">{errorPreparedPayment} </div>:null}
                   
                      <Button onClick={createGroupPayments.bind()} disabled={errorPreparedPayment?true:false} style={{maxWidth:'150px'}} variant="contained" color="primary">
                          יצר רשומות לתשלום
                      </Button>
                      {selected.length>0? <DialogCreateGroupPayment isInvalidActivistPayment={true}  rowSelected={selected} sumAmount={sumAmountSelected} closeDialog={closeDialog} typePayment={1}  open={openDialogCreateGroup}></DialogCreateGroupPayment>:null}
                </div>
            </div>
        </div>
      );
}