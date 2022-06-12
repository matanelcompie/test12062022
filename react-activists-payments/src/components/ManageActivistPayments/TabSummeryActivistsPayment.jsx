import React, {useContext, useState, useEffect} from 'react';
import { CircularProgress } from '@material-ui/core';
 import SummeryDetailsPaymentTable from './SummeryDetailsPaymentTable.jsx';
// import CreatePaymentsRecord from './TabPanels/CreatePaymentsRecord.jsx';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';


const TabSummeryActivistsPayment = () => {

  return ( 
    <div>
      <SummeryDetailsPaymentTable> </SummeryDetailsPaymentTable>
    </div>
  )
}

export default TabSummeryActivistsPayment;
