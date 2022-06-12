import React, {useContext, useState, useEffect} from 'react';
import { CircularProgress } from '@material-ui/core';

import TablePaymentGroup from './TablePaymentGroup.jsx';
import { getAllArrGroupPaymentBySearch } from '../../../actions/searchActivistPaymentActions.js';
import { makeStyles } from '@material-ui/core/styles';
//--component
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import LoadingTable  from '../../global/LoadingTable';
import DefaultTxtEmptyTable  from '../../global/DefaultTxtEmptyTable';
//--redux
import { useSelector,useDispatch,useStore} from 'react-redux'




const TabPaymentGroup = (props) => {
//   const {display, setDisplay} = useContext(displayContext);
   const loadArrPaymentGroup =props.loadArrPaymentGroup;
   const [arrPaymentGroup, setArrPaymentGroup] = useState(false);

   const [loading, setLoading] = useState(false);

   //-----redux-----
   //search  object in store
   const searchObject=useSelector(state=>state.SearchReducer.searchObject);
   const tabSelected=useSelector(state=>state.SearchReducer.tabSelected);

   const changeSearch=()=>{
      setLoading(true);
      getAllArrGroupPaymentBySearch(null,searchObject).then(results=>{
        setArrPaymentGroup(results);
      setLoading(false);
    });
  }
 
  useEffect(() =>{
    if(tabSelected==2 && searchObject){
      changeSearch();
    }
      
 }, [searchObject,tabSelected]);
 


  const removeFromPaymentGroupList=(paymentGroupId)=>{
    var help=[...arrPaymentGroup];
    var index=help.map(a=>{return a.payment_group_id;}).indexOf(paymentGroupId);
    help.splice(index,1);
    setArrPaymentGroup(help);
  }

  return ( 
 
      <div>
        <div className="titSummeryPayment">רשימת קבוצות תשלום</div>
        { arrPaymentGroup && !loading &&<TablePaymentGroup removeFromPaymentGroupList={removeFromPaymentGroupList} arrPaymentGroup={arrPaymentGroup} ></TablePaymentGroup>}
        {loading && <LoadingTable></LoadingTable>}
        {!searchObject && !loading && <DefaultTxtEmptyTable></DefaultTxtEmptyTable>}
      </div>

  
    
  )
}

export default TabPaymentGroup;
