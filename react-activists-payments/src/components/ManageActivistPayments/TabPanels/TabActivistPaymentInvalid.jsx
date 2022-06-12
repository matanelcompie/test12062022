import React, {useContext, useState, useEffect} from 'react';

import { getInvalidRecordToPay  } from '../../../actions/searchActivistPaymentActions.js';
import { useSelector,useDispatch,useStore} from 'react-redux'

import LoadingTable  from '../../global/LoadingTable';
import DefaultTxtEmptyTable  from '../../global/DefaultTxtEmptyTable';
import TableInvalidActivistPayment from './TablePaymentWaitToPay/TableInvalidActivistPayment.jsx';


const TabActivistPaymentInvalid = (props) => {

   const loadArrPaymentNeed =props.loadArrPaymentNeed;
   const [arrNeedPaymentsRecord, setArrNeedPayments] = useState(false);
   const [loading, setLoading] = useState(false);
   const tabSelected=useSelector(state=>state.SearchReducer.tabSelected);

   //search  object in store
   const searchObject=useSelector(state=>state.SearchReducer.searchObject);

   const changeSearch=()=>{
      setLoading(true);
      getInvalidRecordToPay().then(results=>{
        console.log(results)
      setArrNeedPayments(results);
      setLoading(false);
    });
  }
 
  useEffect(() => {
    if(tabSelected==3)
    changeSearch();
 }, [searchObject,tabSelected]);


 const LodNeedPayment=()=>{
  changeSearch();
 }

  return ( 
 
      <div>
        {arrNeedPaymentsRecord && !loading &&<TableInvalidActivistPayment LodNeedPayment={LodNeedPayment.bind()} arrNeedPaymentsRecord={arrNeedPaymentsRecord} ></TableInvalidActivistPayment>}
        {/* {searchObject && !loading && <DefaultTxtEmptyTable></DefaultTxtEmptyTable>} */}
        {loading && <LoadingTable></LoadingTable>}
      </div>

    
  )
}

export default TabActivistPaymentInvalid;
