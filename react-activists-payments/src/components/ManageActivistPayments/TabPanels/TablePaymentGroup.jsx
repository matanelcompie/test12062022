import React ,{useEffect}from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import DialogUpdateReferenceId from '../DialogOpen/DialogUpdateReferenceId.jsx';
import DialogListPaymentGroup from '../DialogOpen/DialogListPaymentGroup.jsx';

import '../../../../scss/scssComponents/TabsPayment.scss'

import AssignmentReturnedIcon from '@material-ui/icons/AssignmentReturned';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ListAltIcon from '@material-ui/icons/ListAlt';
import { downloadFilePaymentGroupMasav,getAllActivistPaymentsByGroupId } from '../../../actions/searchActivistPaymentActions.js';
import { updateReferenceOfGroupPayments } from '../../../actions/CreatePayments';
//--
import * as DateActionHelper from '../../../helpers/DateActionHelper'
import { useSelector } from 'react-redux';
import PaymentType from '../../../Enums/PaymentType.js';


function descendingComparator(a, b, orderBy) {
  debugger
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

const headCells = [
  { id: 'payment_group_name', numeric: true, disablePadding: true, label: 'שם הקובץ' },
  { id: 'payment_group_create_at', numeric: true, disablePadding: true, label: 'תאריך יצירה' },
  { id: 'payment_type_id', numeric: true, disablePadding: true, label: 'אופן העברה' },
  { id: 'create_by_full_name', numeric: true, disablePadding: false, label: 'מייצר הקובץ' },
  { id: 'location_file', numeric: true, disablePadding: false, label: 'קובץ מקור'},
  { id: 'reference_id', numeric: true, disablePadding: false, label: 'מספר אסמכתא' },
  { id: 'transfer_date', numeric: true, disablePadding: false, label: 'תאריך העברה' },
  { id: 'sumAmount', numeric: true, disablePadding: false, label: 'סכום כולל'  }
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort ,isAllSelect} = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead >
      <TableRow >
   
        {headCells.map((headCell,index) => (
          <TableCell
            key={index}
            align='right'
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
         <TableCell style={{maxWidth:'110px !important'}}> </TableCell>

        

      </TableRow>
    </TableHead>
  );
}



const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function TablePaymentGroup(props) {
  const classes = useStyles();

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [errorPreparedPayment, setErrorPreparedPayment] = React.useState(false);
  const [openDialogReferenceId, setOpenDialogReferenceId] = React.useState(false);
  const [sumAmountSelected, setSumAmountSelected] = React.useState(0);

  const [focusPaymentGroup,setFocusPaymentGroup]= React.useState(null);
  const [listPaymentGroupFocus,setListPaymentGroupFocus]= React.useState(null);

  const [savingReference,setSavingReference]= React.useState(false);
  const [successSavingEvent,setSuccessSavingEvent]= React.useState(false);

   

  

  
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const downloadFile=(paymentGroup)=>{
   
    downloadFilePaymentGroupMasav(null,paymentGroup.payment_group_id)
  }


  const openDialogUpdateReferenceId=(paymentGroup)=>{
    
    setSuccessSavingEvent(false);
    setSavingReference(false)
    setFocusPaymentGroup(paymentGroup);
    setOpenDialogReferenceId(true);

  }

  const closeDialog=()=>{
    setOpenDialogReferenceId(false); 
    setFocusPaymentGroup(null);
  }

  const updateReferenceId=(reference_id,transfer_date,paymentGroup)=>{
    setSavingReference(true)
    updateReferenceOfGroupPayments(null,paymentGroup.payment_group_id,reference_id,transfer_date).then(function(){

            paymentGroup.reference_id=reference_id;
            paymentGroup.transfer_date=transfer_date;
            var index=props.arrPaymentGroup.findIndex(a=>a.payment_group_id==paymentGroup.payment_group_id);
            props.arrPaymentGroup[index]={...paymentGroup};
            setSuccessSavingEvent(true);
            setSavingReference(false)
            setFocusPaymentGroup(null);
    })
    }

  const closeListPayments=()=>
  {
    setListPaymentGroupFocus(null);
  }

  const emptyRows = props.arrPaymentGroup?rowsPerPage - Math.min(rowsPerPage, props.arrPaymentGroup.length - page * rowsPerPage):0;

  const openListPaymentDetails=(paymentGroup)=>{
    debugger
    getAllActivistPaymentsByGroupId(null,paymentGroup.payment_group_id).then(function(result){
      paymentGroup.listPaymentGroup=result;
      setListPaymentGroupFocus(paymentGroup);
    })
  }

  //remove from list group payment
  const removeFromPaymentGroupList=(paymentGroupId)=>{
      setListPaymentGroupFocus(null);
      props.removeFromPaymentGroupList(paymentGroupId);
  }

  //render payment group that focus
  const renderDetailsPaymentGroup=(paymentGroup)=>{
    debugger
    var paymentGroupO=paymentGroup;
    setListPaymentGroupFocus({...paymentGroupO});

    var index=props.arrPaymentGroup.findIndex(a=>a.payment_group_id==paymentGroup.payment_group_id);
    var listPaymentGroup=props.arrPaymentGroup;
    listPaymentGroup[index]={...paymentGroupO};
    props.arrPaymentGroup=[...listPaymentGroup];
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
     
        <TableContainer>
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
              onRequestSort={handleRequestSort}
            
              rowCount={props.arrPaymentGroup?props.arrPaymentGroup.length:0}
            /> 
            { props.arrPaymentGroup?<TableBody>
              {stableSort(props.arrPaymentGroup, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
               
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={+row.payment_group_id}
                    >

                   <TableCell  align="right"   >{row.payment_group_name}</TableCell>
                   <TableCell  align="right"   >{row.payment_group_create_at}</TableCell>
                   <TableCell  align="right"   >{row.payment_type_name}</TableCell>

                   <TableCell  align="right"   >{row.create_by_full_name}</TableCell>
                   {row.payment_type_system_name==PaymentType.BANK_TRANSFER?
                   <TableCell  align="right"   >  <Button  endIcon={<AssignmentReturnedIcon />} color="primary" onClick={downloadFile.bind(this,row)}> הורד קובץ</Button></TableCell>
                   :<TableCell  align="right"   >---</TableCell>}
                   {/* <TableCell  align="right"   >{row.location_file}</TableCell> */}
                  {row.payment_type_system_name==PaymentType.BANK_TRANSFER? <TableCell  align="right"   >
                   { row.reference_id ? <div style={{fontSize:'16px !important',fontWeight:'bold'}}  onClick={openDialogUpdateReferenceId.bind(this,row)}>{row.reference_id}</div>:
                     <Button  endIcon={<DoneAllIcon />} color="primary" onClick={openDialogUpdateReferenceId.bind(this,row)}> עדכן אסמכתא</Button>
                    }
                    </TableCell>:  <TableCell  align="right"   >---</TableCell>
                    }
                    <TableCell  align="right"   > {DateActionHelper.displayDbDate(row.transfer_date)}</TableCell>
                    <TableCell  align="right"   >  &#8362;{row.sumAmount?row.sumAmount.toLocaleString(undefined, {maximumFractionDigits:2}):0}</TableCell>

                    <TableCell style={{maxWidth:'110px !important'}}  align="right">
             
                       <Button variant="outlined" size="small"  endIcon={<ListAltIcon />} color="primary" onClick={openListPaymentDetails.bind(this,row)}>רשימת תשלומים</Button>
                    
                    </TableCell>

                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>:'שגיאת מערכת'}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={props.arrPaymentGroup?props.arrPaymentGroup.length:0}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />

       
      </Paper>
     {/* dialog  list payment  of payment groups*/}
     {listPaymentGroupFocus?<DialogListPaymentGroup renderDetailsPaymentGroup={renderDetailsPaymentGroup.bind()} removeFromPaymentGroupList={removeFromPaymentGroupList} closeListPayments={closeListPayments} updateReferenceId={updateReferenceId} paymentGroup={listPaymentGroupFocus} openDialog={listPaymentGroupFocus?true:false}></DialogListPaymentGroup>:null}
     {/* dialog  update reference id of payment groups*/}
     {focusPaymentGroup?<DialogUpdateReferenceId savingEvent={savingReference} successEvent={successSavingEvent} closeDialog={closeDialog} updateReferenceId={updateReferenceId} paymentGroup={focusPaymentGroup}   open={openDialogReferenceId}></DialogUpdateReferenceId>:null}
 
    </div>
  );
}
