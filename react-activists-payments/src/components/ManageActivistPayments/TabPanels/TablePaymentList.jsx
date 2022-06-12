import React ,{useEffect,forwardRef,useState,useImperativeHandle }from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";

import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Button from '@material-ui/core/Button';
import constants from '../../../libs/constants'
import * as CreatePayments from '../../../actions/CreatePayments.js'
import * as GlobalListAction from '../../../actions/GlobalListAction.js'
import * as HelperAction from '../../../actions/HelperAction.js'
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DialogQuestion from '../../global/DialogQuestion.jsx'
import LoadingTable from '../../global/LoadingTable'
import Success from '../../global/Success/Success'
import DialogUpdateErrorPaymentRecord from "../DialogOpen/DialogUpdateErrorPaymentRecord.jsx";
import { set } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import PaymentType from "../../../Enums/PaymentType";




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
  return order === "desc"
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
  { id: "index_masav_row", numeric: true, disablePadding: false, label: "מיקום בקובץ" },
  { id: "full_name", numeric: true, disablePadding: false, label: "שם פעיל" },
  { id: "personal_identity", numeric: true, disablePadding: false, label: "תעודת זהות" },
  { id: "bank_id", numeric: true, disablePadding: false, label: "פרטי העברה",forCheckPaymentType:false },
  { id: "check_number", numeric: true, disablePadding: false, label: "מספר צק",forCheckPaymentType:true },
  { id: "amount", numeric: true, disablePadding: false, label: "סכום" },
  // { id: "protein", numeric: true, disablePadding: false, label: "פרטי שיבוצים" },
  { id: "status_id", numeric: true, disablePadding: false, label: "סטטוס רשומת תשלום" },
  { id: "reason_status_id", numeric: true, disablePadding: false, label: "סיבה" },
  { id: "comment", numeric: true, disablePadding: false, label: "הערה" }

];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    isAllSelected,
    paymentTypeSystemName
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const getHeadByPaymentTypeGroup=()=>{
    if(paymentTypeSystemName==PaymentType.BANK_TRANSFER){
      return headCells.filter((headItem)=>{return !headItem.forCheckPaymentType})
    }
    else
    return headCells.filter((headItem)=>{return headItem.forCheckPaymentType==undefined || headItem.forCheckPaymentType==true}) 
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          {/* <Checkbox
            color="primary"
            checked={isAllSelected}
            onChange={onSelectAllClick}
           
          /> */}
        </TableCell>
        {getHeadByPaymentTypeGroup().map((headCell) => (
        <TableCell
            key={headCell.id}
            align="right"
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
                   {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}

              {headCell.label}
           
            </TableSortLabel>
          </TableCell>
         
        ))}
          <TableCell></TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.primary.main,
          backgroundColor: lighten(theme.palette.primary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.primary.dark
        },
  title: {
    flex: "1 1 100%"
  }
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;
  const { numRecord } = props;

  return (
    <>
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0
      })}
    >
     
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected}  נבחרו  מתוך {numRecord} 
        </Typography>
      

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
      
    </Toolbar>
    
     </>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 750,
    height:500
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  }
}));

  const TablePaymentList=forwardRef((props,ref )=> {

  const classes = useStyles();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [paymentGroup,setPaymentGroup]=React.useState(props.paymentGroup);
  const [listPaymentStatus,setListPaymentStatus]=React.useState(null);
  const [isAllSelected, setIsAllSelected] = React.useState(false);
  const [QuestionDelete, setQuestionDelete] = React.useState(false);
  const [doingDelete, setDoingDelete] = React.useState(false);
  const [successDelete, setSuccessDelete] = React.useState(false);
  const [activistPaymentNotValid, setRecordPaymentNotValid] = useState(null);
  const currentUser = useSelector(state => state.system.currentUser);

   const dispatch = useDispatch();


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    var isAllSelectedValue=isAllSelected;
    setIsAllSelected(!isAllSelectedValue)
    if (event.target.checked) {
      var canSelected=paymentGroup.listPaymentGroup.filter((row) =>{return isRowValid(row)});
      setSelected(canSelected);
      return;
    }
    setSelected([]);
  };

  //function check if row is valid before select
  const isRowValid=(row)=>{
    debugger
    //if record is incorrect
      if(row.payment_status_system_name!=constants.payment_status_types.waite_for_confirm_payment)
        return false;
        return true;
  }

  useEffect(() => {
    if(!listPaymentStatus){
      GlobalListAction.paymentStatusType().then(function(listPaymentType){
        debugger
        setListPaymentStatus(HelperAction.arrayToHash(listPaymentType,'id'));
    })
    }
  
  });


  const handleClick = (event, row) => {
    const selectedIndex = selected.map(a=>a.id).indexOf(row.id);
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

  const isSelected = (activistPaymentId) => selected.map(a=>{return a.id}).indexOf(activistPaymentId) !== -1;


  const updateStatus=(arrActivistPayment,paymentStatusSystemName)=>{

    //foreach all record change for update the status in display table
    CreatePayments.updateStatusActivistPayment(dispatch,arrActivistPayment,paymentStatusSystemName).then(res=>{
     if(res){
                //update status record after save
    var AllPayment=[...paymentGroup.listPaymentGroup];
    //var AllPaymentMap=AllPayment.map(a=>{return a.id})
    //object of type payment
     var paymentStatus=Object.values(listPaymentStatus).find(d=> d.system_name==paymentStatusSystemName);

      arrActivistPayment.forEach(activistPaymentId=>{
         var index=AllPayment.findIndex(a=>a.id==activistPaymentId);
         var activistPayment=AllPayment[index];
         activistPayment.status_id=paymentStatus.id;
         activistPayment.payment_status_system_name=paymentStatus.system_name;
         activistPayment.payment_status_name=paymentStatus.name;
         AllPayment[index]={...activistPayment};
         paymentGroup.listPaymentGroup=[...AllPayment];
      })
      setPaymentGroup({...paymentGroup});
     }

    });
  }

  //function call in parent ref
  useImperativeHandle(ref, () => ({
    updateMultiRecordStatus(){
      var paymentStatusSystemName=constants.payment_status_types.payment_paid;
      var activistPaymentSelected=selected.map(a=>a.id);
      updateStatus(activistPaymentSelected,paymentStatusSystemName);
    }
}));

//----delete record activist payment---
  const deleteRecordActivistPaymentInGroup=()=>{
    var recordDelete=QuestionDelete;
    setQuestionDelete(false);
    setDoingDelete(true);
  
    CreatePayments.deleteRecordActivistPaymentInGroup(recordDelete.key).then(function(){
      setSuccessDelete(true);
      setDoingDelete(false);
      debugger
      var AllPayment=[...paymentGroup.listPaymentGroup];
      var activistPaymentIndex=AllPayment.findIndex(a=>a.key==recordDelete.key);
      debugger
      AllPayment.splice(activistPaymentIndex,1);
      var paymentGroupObj={...paymentGroup};
      paymentGroupObj.listPaymentGroup=AllPayment;
      var sumAmount=0;
      AllPayment.forEach(element => {
        sumAmount+=element.amount;
      });
      paymentGroupObj.sumAmount=sumAmount;
      setPaymentGroup({...paymentGroupObj});
      props.renderDetailsPaymentGroup(paymentGroupObj);
    });
  }

  const askDeleteActivistPayment=(row)=>{
    setQuestionDelete(row);
  }

  const closeModelUpdateOnValidRecord=(activistPaymentRecord)=>{
    debugger
    var AllPayment=[...paymentGroup.listPaymentGroup];
    var index=AllPayment.findIndex(a=>a.id==activistPaymentRecord.id);
    AllPayment[index]={...activistPaymentRecord};
    paymentGroup.listPaymentGroup=[...AllPayment];
    setPaymentGroup({...paymentGroup});
    setRecordPaymentNotValid(null);
  }
  //------

  return (
    <div className={classes.root}>
      <Paper  className={classes.paper}>
          <Table
           className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            aria-label="enhanced table"
            gridStyle={{
                direction: 'inherit',
              }}
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={paymentGroup?paymentGroup.listPaymentGroup.length:0}
              isAllSelect={isAllSelected}
              paymentTypeSystemName={paymentGroup?paymentGroup.payment_type_system_name:0}

            />
            <TableBody>
              {stableSort(paymentGroup.listPaymentGroup, getComparator(order, orderBy)).map(
                (row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow className="primaryRow"
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      color="primary"
                    >
                      <TableCell padding="checkbox">
                        {/* <Checkbox
                          inputProps={{ 'aria-label': 'primary checkbox' }}
                          color="primary"
                          disabled={!isRowValid(row)}
                          onClick={(event) => handleClick(event, row)}
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                        /> */}
                      {row.first_payment_id? <i class="fa fa-repeat" aria-hidden="true"></i>:''} 
                      </TableCell>
                    
                      
                      <TableCell align="right">{row.index_in_group}</TableCell>
                      <TableCell align="right">{row.full_name}</TableCell>
                      <TableCell align="right">{row.personal_identity}</TableCell>
                      {paymentGroup.payment_type_system_name==PaymentType.BANK_TRANSFER?
                       <TableCell align="right"><b>בנק- </b> {row.bank_id} <b>/ סניף- </b> {row.branch_number}<b>/ חשבון-</b>{row.bank_account_number}</TableCell>:
                       <TableCell align="right">{row.check_number}</TableCell>
                      }
                                      <TableCell align="right">&#8362; {row.amount.toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                      {/* <TableCell align="right">{'??'}</TableCell> */}
                     
                      <TableCell align="right">
                        {listPaymentStatus?listPaymentStatus[row.status_id].name:'loading...'}
                      </TableCell>
                      <TableCell align="right">{row.reason_status_name}</TableCell>
                      <TableCell align="right">{row.comment}</TableCell>
                       {/* icon if waite_for_pay */}
                       {row.payment_status_system_name==constants.payment_status_types.waite_for_pay?<TableCell align="left"> <Button  endIcon={<DeleteOutlineIcon />} onClick={askDeleteActivistPayment.bind(this,row)} color="primary">מחק רשומה</Button></TableCell>:null}
                       {/* icon if waite_for_confirm_payment */}
                         {row.payment_status_system_name==constants.payment_status_types.waite_for_confirm_payment?<TableCell align="left">
                         <Button style={{color:'gray'}} endIcon={<ThumbDownIcon />} onClick={()=>{debugger;setRecordPaymentNotValid(row)}} color="primary"> סמן כשגוי</Button> 
                         <Button style={{color:'gray'}} endIcon={<ThumbUpIcon />} onClick={updateStatus.bind(this,[row.id],constants.payment_status_types.payment_paid)} color="primary"> אמת תשלום</Button></TableCell>:null
                          }
                       {/* icon if payment_paid */}    
                         {row.payment_status_system_name==constants.payment_status_types.payment_paid?<TableCell align="left"> <Button style={{color:'#33b956'}} endIcon={<ThumbUpIcon />} onClick={updateStatus.bind(this,[row.id],constants.payment_status_types.waite_for_confirm_payment)} color="primary">בטל אימות תשלום</Button></TableCell>:null}
                       {/* icon if incorrect_payment */}    
                         {row.payment_status_system_name==constants.payment_status_types.incorrect_payment?
                            <TableCell align="left">{
                              currentUser.cancel_payment?
                              <Button style={{color:'red'}} endIcon={<HighlightOffIcon />} onClick={updateStatus.bind(this,[row.id],constants.payment_status_types.waite_for_confirm_payment)} color="primary">בטל שגיאת רשומה</Button>:
                              <div style={{color:'red',fontWeight:'bold'}} endIcon={<ThumbUpIcon />} color="primary">הרשומה שגויה</div>
                            }
                           
                            </TableCell>:null
                          }
                    </TableRow>
                  );
                }
              )}
           
            </TableBody>
          </Table>
          
        <EnhancedTableToolbar numRecord={paymentGroup?paymentGroup.listPaymentGroup.length:0}  numSelected={selected.length} />
      </Paper>
      <DialogUpdateErrorPaymentRecord activistPaymentNotValid={activistPaymentNotValid} open={activistPaymentNotValid?true:false} closeModel={closeModelUpdateOnValidRecord}></DialogUpdateErrorPaymentRecord>
     {QuestionDelete?<DialogQuestion title={"מחיקת רשומות תשלום בסכום: "+"₪"+QuestionDelete.amount.toLocaleString(undefined, {maximumFractionDigits:2})} open={QuestionDelete?true:false} yes={deleteRecordActivistPaymentInGroup.bind()} no={setQuestionDelete.bind(false)} question={'האם ברצונך למחוק רשומת תשלום עבור '+QuestionDelete.full_name+"?"}></DialogQuestion>:null}
     {doingDelete?<LoadingTable title="מבצע מחיקה"></LoadingTable>:null}
     {successDelete?<Success eventClose={setSuccessDelete.bind(false)} title="רשומה נמחקה בהצלחה"></Success>:null}

    </div>
  );
              })
export default TablePaymentList