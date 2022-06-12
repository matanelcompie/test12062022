import React, {useContext, useState, useEffect} from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';
import { makeStyles,useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { useSelector,useDispatch,useStore} from 'react-redux'
import DefaultTxtEmptyTable  from '../../components/global/DefaultTxtEmptyTable'
import LoadingTable  from '../../components/global/LoadingTable'
import Button from '@material-ui/core/Button';
import * as ActivistPaymentRoleService from  '../../services/ActivistPaymentRoleService'

import '../../../scss/scssComponents/TabsPayment.scss'
import {getAllDetailsSummeryPaymentActivist,getDetailsSummeryPaymentGroupRole  } from '../../actions/searchActivistPaymentActions.js'
//--constant 
import constants from '../../libs/constants'



const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});


function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();
  const searchObject=useSelector(state=>state.SearchReducer.searchObject);

  const loadDetailsSummeryActivistPayment=()=>{
    if(!row.details && !open){
      setOpen(!open)
      getDetailsSummeryPaymentGroupRole(row.voter_key,searchObject.election_campaign_id,searchObject.election_role_id,searchObject.payment_type_additional).then((details)=>{
        props.setDetails(details,row.personal_identity);
      })
    }
    else
    {
      setOpen(!open)
    }
  }

  const openActivistPage=(row)=> {
    //console.log(window.Laravel.baseURL  + "elections/activists/" +row.voter_key);
    window.location.href = window.Laravel.baseURL  + "elections/activists/" +row.voter_key;
  }

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell align="right">
        <div className="nameActive" onClick={()=>{openActivistPage(row)}}>
         <b>{row.first_name+' '+row.last_name}</b>
        </div>
        </TableCell>
        <TableCell align="right">{row.personal_identity}</TableCell>
        <TableCell align="right">{row.phone_number}</TableCell>
        <TableCell align="right"><b>בנק- </b> {row.bank_id} <b>/ סניף- </b> {row.branch_number}<b>/ חשבון-</b>{row.bank_account_number}</TableCell>
        <TableCell align="right"><i className={+row.is_bank_verified==1?"fa fa-check":"fa fa-times-circle-o my_style"} aria-hidden="true"></i></TableCell>
        <TableCell align="right">&#8362;{row.SumAmountRole }</TableCell>
        <TableCell align="right">&#8362;{row.SumAmountWaitePay }</TableCell>
        <TableCell align="right">&#8362;{row.SumAmountPaid?row.SumAmountPaid:0}</TableCell>
        {/* <TableCell align="right">&#8362;{row.SumAmountWaiteConfirm?row.SumAmountWaiteConfirm:0}</TableCell> */}
        <TableCell align="right">{row.SumAmountIncorrect && +row.SumAmountIncorrect>0?<b style={{color:'red'}}>{row.SumAmountIncorrect} &#8362;</b>:<div>0 &#8362;</div>}</TableCell>
        
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => loadDetailsSummeryActivistPayment()}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {/* <TableCell component="th" scope="row">
          {row.name}
        </TableCell> */}

      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse className="con-details-summery-role" in={open} timeout="auto" unmountOnExit>
              {/* details */}
            {/* <Box margin={1}> */}
              <Typography className="tit-details-summery-role" align="right" variant="h6" gutterBottom component="div">
                פירוט תשלומים
              </Typography>
              <Table size="small"  aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell align="right"></TableCell>
                    <TableCell className="col-details-summery-role" align="right" >תפקיד</TableCell>
                    <TableCell className="col-details-summery-role"  align="right" >סוג תשלום</TableCell>
                    <TableCell className="col-details-summery-role"  align="right" >סכום שיבוץ</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">סטטוס תשלום</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">סיבת סטטוס</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">מספר מקור אסמכתא</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">אסמכתא אחרונה</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">שם קבוצה</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">תאריך העברה</TableCell>
                    <TableCell className="col-details-summery-role"  align="right">מבצע העברה</TableCell>
                  
                    <TableCell className="col-details-summery-role"  align="right">הערה</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details && row.details.map((roleDetails) => (
                    <TableRow key={roleDetails.election_roles_by_voter_id}>
                      {/* <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell> */}
                      <TableCell  align="right">
                        {!roleDetails.payment_status_system_name || roleDetails.payment_status_system_name==constants.payment_status_types.waite_for_pay? <i style={{color:'#aba5a5'}} className="fa fa-times" aria-hidden="true"></i>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.incorrect_payment? <i style={{color:'red'}} className="fa fa-exclamation-circle fa-in-table" aria-hidden="true"></i>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.waite_for_confirm_payment? <i style={{color:'#aba5a5'}} className="fa fa-check fa-in-table" aria-hidden="true"></i>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.payment_paid? <i style={{color:'rgb(54 222 98)'}} className="fa fa-check fa-in-table" aria-hidden="true"></i>:null}
                      </TableCell>
                      <TableCell align="right">{roleDetails.election_roles_name}</TableCell>
                      <TableCell align="right">{!roleDetails.payment_type_additional_name || roleDetails.payment_type_additional_name==''?'בסיס':roleDetails.payment_type_additional_name}</TableCell>
                      <TableCell align="right">&#8362;{roleDetails.sum?roleDetails.sum:0}</TableCell>
                      <TableCell  align="right">
                        {roleDetails.not_for_payment==1 ? <span style={{color:'red',fontWeight:'bold'}}>לא לתשלום</span>:null}
                        {roleDetails.not_for_payment!=1 && !roleDetails.payment_status_system_name ? <span>ממתין להכנת תשלום</span>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.waite_for_pay?<span>{roleDetails.payment_status_name}</span>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.incorrect_payment? <span style={{color:'red'}}>{roleDetails.payment_status_name}</span>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.waite_for_confirm_payment? <span>{roleDetails.payment_status_name}</span>:null}
                        {roleDetails.payment_status_system_name==constants.payment_status_types.payment_paid? <span style={{color:'rgb(54 222 98)',fontWeight:'bold'}}>{roleDetails.payment_status_name}</span>:null}
                      </TableCell>
                      <TableCell align="right">{roleDetails.reason_payment_status}</TableCell>
                       
                       {/* if not have first reference the first reference is the last */}
                      <TableCell align="right">{!roleDetails.first_reference_id?roleDetails.reference_id:roleDetails.first_reference_id}</TableCell>
                      <TableCell align="right">{roleDetails.reference_id}</TableCell>
                      <TableCell align="right">{roleDetails.payment_group_name}</TableCell>
                      <TableCell align="right">{roleDetails.transfer_date}</TableCell>
                      <TableCell align="right">{roleDetails.masav_user_create}</TableCell>
                 
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            {/* </Box> */}
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}




export default function SummeryDetailsPaymentTable(props) {


  const [allSummeryDetails, setAllSummeryDetails] = useState([]);
 
  const searchObject=useSelector(state=>state.SearchReducer.searchObject);
  const tabSelected=useSelector(state=>state.SearchReducer.tabSelected);
  
  const [loading,selLoading]= useState(false);
 


  const handleSearch=()=>{
    selLoading(true);
    getAllDetailsSummeryPaymentActivist(searchObject).then(function(data){
      setAllSummeryDetails(data);
      selLoading(false);
     });
 }

  useEffect(() => {
    if(searchObject && tabSelected==0)
    handleSearch()
  }, [searchObject,tabSelected]);

  //--pagination--
  const useStyles2 = makeStyles({
    table: {
      minWidth: 500,
    },
  });

  const classes = useStyles2();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, allSummeryDetails.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function TablePaginationActions(props) {
  const useStyles1 = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  title:{
    color:"#3f51b5"
  }
}));
    const classes = useStyles1();
    const theme = useTheme();
    const { count, page, rowsPerPage, onChangePage } = props;
  
    const handleFirstPageButtonClick = (event) => {
      onChangePage(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
      onChangePage(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
      onChangePage(event, page + 1);
    };
  
    const handleLastPageButtonClick = (event) => {
      onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
      <div className={classes.root} >
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }

  //-----

 
  const setDetails=(detailsSummery,personal_identity)=>{
    debugger
    var AllSummery=[...allSummeryDetails];
    var index=AllSummery.findIndex(a=>{return a.personal_identity==personal_identity});
    AllSummery[index].details=detailsSummery;
    setAllSummeryDetails(AllSummery);

  }

  const downloadExcelPayment=()=>{
    ActivistPaymentRoleService.downloadExcelRolePaymentByObjectSearch(searchObject);
  }
  
  return (
    <>
  {!searchObject && !loading && <DefaultTxtEmptyTable></DefaultTxtEmptyTable> }
  {loading && <LoadingTable></LoadingTable>}
  {searchObject && !loading && 
  <TableContainer component={Paper}>
        <Typography style={{padding:'7px',color:'#3f51b5'}} variant="h6" id="tableTitle" component="div">
         <b> נמצאו {allSummeryDetails.length} רשומות</b>
        </Typography>
      <Table  aria-label="custom pagination table">
        <TableHead>
          <TableRow>
            <TableCell align="right">שם פעיל</TableCell>
            <TableCell align="right">תעודת זהות</TableCell>
            <TableCell align="right">טלפון</TableCell>
            <TableCell align="right">פרטי חשבון</TableCell>
            <TableCell align="right">אימות חשבון</TableCell>
            <TableCell align="right">סכום לתשלום</TableCell>
            <TableCell align="right">יתרה לתשלום</TableCell>
            <TableCell align="right">שולם</TableCell>
            {/* <TableCell align="right">ממתין לאישור</TableCell> */}
            <TableCell align="right">סכום שגוי</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          
          {allSummeryDetails && 
          (rowsPerPage > 0
          ? allSummeryDetails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          : allSummeryDetails
          )
          .map((row,index) => (
            <Row setDetails={setDetails} key={+row.personal_identity}  row={row} />
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={allSummeryDetails.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
              }}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
             
          </TableRow>
        </TableFooter>

      </Table>
   
    </TableContainer>
     
    }
      {searchObject && !loading && <div style={{marginTop:'16px'}} className="con-btn-bottom ltr">
            <div className="btn-left">
            <Button onClick={downloadExcelPayment}  style={{maxWidth:'150px'}}  color="primary" variant="outlined">
            <i className="fa fa-file-excel-o"></i><div>&nbsp;</div> הורד אקסל</Button>
      </div>
      </div>
}
    </>
  );
}
