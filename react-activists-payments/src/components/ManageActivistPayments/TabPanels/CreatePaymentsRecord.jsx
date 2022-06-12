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
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
// import Tooltip from '@material-ui/core/Tooltip';
import Tooltip from '../../global/Tooltip/Tooltip'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import DialogCreateGroupPayment from '../DialogOpen/DialogCreateGroupPayment.jsx';
import '../../../../scss/scssComponents/TabsPayment.scss'
import MAX_SUM_PAYMENT from '../../../actions/CreatePayments.js';
import Popover from '@material-ui/core/Popover';
import { useSelector,useDispatch,useStore} from 'react-redux'
import * as HelperAction from '../../../actions/HelperAction'


function descendingComparator(a, b, orderBy) {
  
  var headerItem=headCells.find(a=>a.id==orderBy);
  if(headerItem && headerItem.functionSort){
    var aValue=headerItem.functionSort(a);
    var bValue=headerItem.functionSort(b);
  }
  else
  {
    var aValue=a[orderBy];
    var bValue=b[orderBy];
  }
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
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

const sortArrRoleLock=(record)=>{
  return record.arrRoleLockPayment.length;
}

const sortCountRole=(record)=>{
  return record.arrRoleActivist.length; 
}

const sortBankValid=(record)=>{
  return record.bankDetails && +record.bankDetails.is_bank_valid==1
}

const headCells = [
  { id: 'activistFullName', numeric: true, disablePadding: true, label: 'שם פעיל' },
  { id: 'isShasPayment', numeric: true, disablePadding: true, label: 'סוג תשלום' },
  { id: 'personalIdentity', numeric: true, disablePadding: false, label: 'תעודת זהות' },
  { id: 'phoneNumber', numeric: true, disablePadding: false, label: 'טלפון' },
  { id: 'sortBankDetails',functionSort:sortBankValid, numeric: true, disablePadding: false, label: 'פרטי חשבון' },
  { id: 'sortBankValid',functionSort:sortBankValid, numeric: true, disablePadding: false, label: 'אימות חשבון'},
  { id: 'amount', numeric: true, disablePadding: false, label: 'סכום' },
  { id: 'countActivist',functionSort:sortCountRole, numeric: true, disablePadding: false, label: 'מספר תפקידים'},
  { id: 'lock',functionSort:sortArrRoleLock, numeric: true, disablePadding: false, label: 'מספר תפקידים נעולים'},
  { id: 'lockAmountForPaid', numeric: true, disablePadding: false, label: 'סכום תפקידים נעולים'}
];



function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort ,isAllSelect} = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
        {/* indeterminate={numSelected > 0 && numSelected < rowCount} */}
          <Checkbox
            checked={isAllSelect}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
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
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

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

const EnhancedTableToolbar = (props) => {
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
        <b>נבחרו {numSelected} רשומות תקינות  מתוך {props.detailsPaymentRecordForPay.countValidPaymentGroupItem} רשומות תקינות|</b> &nbsp;  <p>{props.detailsPaymentRecordForPay.countNotValidBank}</p> &nbsp; עם בנק לא תקין   &nbsp;,<p>{props.detailsPaymentRecordForPay.countNotLockAmountForPaid} </p> &nbsp; ללא סכום נעול 
        </Typography>) :
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        <b>נבחרו {0} רשומות תקינות  מתוך {props.detailsPaymentRecordForPay.countValidPaymentGroupItem} רשומות תקינות |</b> &nbsp;  <p>{props.detailsPaymentRecordForPay.countNotValidBank}</p> &nbsp; עם בנק לא תקין   &nbsp;,<p> {props.detailsPaymentRecordForPay.countNotLockAmountForPaid} </p> &nbsp; ללא סכום נעול  
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

const useStyles2 = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
}));

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

export default function EnhancedTable(props) {
  const classes = useStyles();
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
      var canSelected=props.arrNeedPaymentsRecord.arrPaymentGroupItem.filter((row) =>{return row.isValidForPaid});
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
    selected.forEach(a=>sum+=a.lockAmountForPaid);
    setSumAmountSelected(sum);
  }
  //event on select element check if can prepared payments
  const checkCreatePaymentRecord=()=>{
    var message=false
    if(selected.length){
      var includeShasPayments= selected.find(activist_payment=> +activist_payment.is_shas_payment==1);
      var includeNotShasPayments=selected.find(activist_payment=> +activist_payment.is_shas_payment==0);
  
      if(includeShasPayments && includeNotShasPayments)
      message='* אין אפשרות לייצא תשלומים עבור שני סוגי תשלום';
    }
    setErrorPreparedPayment(message);
 
  }

  const handleClick = (event, indexRow,row) => {
    const selectedIndex = selected.map(a=>a.indexRow).indexOf(indexRow);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (indexRow) => selected.map(a=>a.indexRow).indexOf(indexRow) !== -1;

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

  const downloadExcelFileBySearch=()=>{

  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
     
        <TableContainer>
        <Typography style={{padding:'7px',color:'#3f51b5'}} variant="h6" id="tableTitle" component="div">
         <b> נמצאו {props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0} רשומות</b>
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
              rowCount={props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0}
            />
            { props.arrNeedPaymentsRecord.arrPaymentGroupItem?<TableBody>
              {stableSort(props.arrNeedPaymentsRecord.arrPaymentGroupItem, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.indexRow);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                    //   onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={+row.indexRow}
                      selected={isItemSelected}
                    
                    >
                      <TableCell padding="checkbox">
                       {
                         row.globalAmountRole<=6000?  
                         <Checkbox disabled={!row.isValidForPaid || row.isValidForPaid==0}  onClick={(event) => handleClick(event, row.indexRow,row)}
                         checked={isItemSelected}
                         inputProps={{ 'aria-labelledby': labelId }}
                        />
                       :
                       <IconButton title={' סכום הכולל לפעיל הוא '+row.globalAmountRole+' חורג מסכום המקסימלי '+''+'6,000 ' }>
                       <div className="fa fa-exclamation-circle error_col"></div>
                       </IconButton>
                
                       }
                        
                      </TableCell>

                      {/* <TableCell align="right" component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell> */}
                      <TableCell align="right">{row.activistFullName}</TableCell>
                      <TableCell align="right">{+row.isShasPayment==1?'ש"ס':'ועדת בחירות'}</TableCell>
                      <TableCell align="right">{row.personalIdentity}</TableCell>
                      <TableCell align="right">{row.phoneNumber}</TableCell>
                      {row.bankDetails?<TableCell align="right"><b>בנק-</b>{row.bankDetails.bank_id}<b>/ סניף- </b>{row.bankDetails.branch_number}<b>/ חשבון-</b>{row.bankDetails.bank_account_number}</TableCell>
                      :<TableCell align="right"><i>לא הוגדר פרטי חשבון</i></TableCell>}
                      <TableCell align="right"><i className={row.bankDetails && +row.bankDetails.is_bank_valid==1?"fa fa-check":"fa fa-times-circle-o my_style"} aria-hidden="true"></i></TableCell>
                      <TableCell align="right">&#8362;{row.amount}</TableCell>
                   
                      <TableCell align="right">
                          <Tooltip position="left" message= {row.arrRoleActivist.length}>
                          <b><u>תפקידים</u></b>

                              {
                                row.arrRoleActivist.map((activistRole)=>{
                                  return <div>{activistRole.election_role_name}</div>
                                })
                              }
                            </Tooltip>
                        </TableCell>
                      <TableCell align="right">
                      <Tooltip position="left" message= {row.arrRoleLockPayment.length}>
                             <b><u>תפקידים נעולים</u></b>
                              {
                                row.arrRoleLockPayment.map((activistRoleLock)=>{
                                  return <div>{activistRoleLock.election_role_name}</div>
                                })
                              }
                            </Tooltip>
                        
                      </TableCell>
         
                      <TableCell style={{fontSize:'16px','fontWeight':'bold'}} align="right">&#8362;{row.lockAmountForPaid}</TableCell>
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
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25,{ label: 'All', value: -1 }]}
          component="div"
          count={props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />

          <EnhancedTableToolbar 
          detailsPaymentRecordForPay={props.arrNeedPaymentsRecord}
          countRecord={props.arrNeedPaymentsRecord?props.arrNeedPaymentsRecord.arrPaymentGroupItem.length:0} 
          sumAmountSelected={sumAmountSelected} 
          numSelected={selected.length} />
      </Paper>

      <div className="con-btn-bottom ltr">
            <div className="btn-left">

              { errorPreparedPayment? <div className="error-title">{errorPreparedPayment} </div>:null}
               
                  <Button onClick={createGroupPayments.bind()} disabled={errorPreparedPayment?true:false} style={{maxWidth:'150px'}} variant="contained" color="primary">
                      יצר רשומות לתשלום
                  </Button>
                  {selected.length>0? <DialogCreateGroupPayment  rowSelected={selected} sumAmount={sumAmountSelected} closeDialog={closeDialog} typePayment={1}  open={openDialogCreateGroup}></DialogCreateGroupPayment>:null}
            </div>
        </div>
      {/* <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      /> */}
    </div>
  );
}
