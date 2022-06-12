import React, {useContext, useState, useEffect} from 'react';
import { CircularProgress } from '@material-ui/core';

import CreatePaymentsRecord from './CreatePaymentsRecord.jsx';
import { getAllRoleVoterNeedPayments } from '../../../actions/searchActivistPaymentActions.js';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { useSelector,useDispatch,useStore} from 'react-redux'

import LoadingTable  from '../../global/LoadingTable';
import DefaultTxtEmptyTable  from '../../global/DefaultTxtEmptyTable';


const TabCreateRecordPayments = (props) => {
//   const {display, setDisplay} = useContext(displayContext);
   const loadArrPaymentNeed =props.loadArrPaymentNeed;
   const [arrNeedPaymentsRecord, setArrNeedPayments] = useState(false);
   const [loading, setLoading] = useState(false);
   const tabSelected=useSelector(state=>state.SearchReducer.tabSelected);

   //search  object in store
   const searchObject=useSelector(state=>state.SearchReducer.searchObject);

   const changeSearch=()=>{
      setLoading(true);
      getAllRoleVoterNeedPayments(null,searchObject).then(results=>{
      setArrNeedPayments(results);
      setLoading(false);
    });
  }
 
  useEffect(() => {
  
    if(searchObject && tabSelected==1)
    changeSearch();
 }, [searchObject,tabSelected]);


 const LodNeedPayment=()=>{
  changeSearch();
 }

  return ( 
 
      <div>
        { searchObject && !loading &&<CreatePaymentsRecord LodNeedPayment={LodNeedPayment.bind()} arrNeedPaymentsRecord={arrNeedPaymentsRecord} ></CreatePaymentsRecord>}
        {!searchObject && !loading && <DefaultTxtEmptyTable></DefaultTxtEmptyTable>}
        {loading && <LoadingTable></LoadingTable>}
      </div>

    
  )
}

export default TabCreateRecordPayments;
