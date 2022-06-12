import React, { useContext, useEffect, useState, useRef } from 'react';
import { useSelector,useDispatch,useStore} from 'react-redux'
import { CircularProgress } from '@material-ui/core';
import { displayContext } from '../context/displayContext.jsx';

import SummaryStrip from '../components/SummaryStrip.jsx';
import TabsWrapper from '../components/TabsWrapper.jsx';
import ChartsWrapper from '../components/ChartsWrapper.jsx';
import ExcelGenerator from '../components/ExcelGenerator.jsx';
import ReportBallotBoxVotes from '../components/ReportBallotBoxVotes.jsx';
import Combo from '../components/global/Combo';
import TabsPayments from '../components/ManageActivistPayments/TabsPayments.jsx';
import SearchActivistPayment  from '../components/ManageActivistPayments/SearchActivistPayment.jsx';
import * as SystemActions from '../actions/SystemActions.js';
// import * as ElectionsActions from '../actions/ElectionsActions.js';


const ManageActivistPayment = () => {
  const {display, setDisplay} = useContext(displayContext); 
  
  const [isReportVotes,setIsReportVotes] = useState(false);
  const [allListLoad,setAllListsLoad ]= useState(false);


  const loadListOnLoadComponent=()=>{
    
    // ElectionsActions.loadElectionRoles(dispatch);
    // ElectionsActions.loadElectionRolesShifts(dispatch);
    // ElectionsActions.loadElectionRolesBudget(dispatch);
    // ElectionsActions.loadCurrentElectionRolesCampaignBudget(dispatch);

    // if (store.currentUser.first_name.length > 0) {
    //     if (!store.currentUser.admin && store.currentUser.permissions['elections.activists'] != true) {
    //         store.router.push('/unauthorized');
    //     }

    //     store.dispatch({
    //         type: ElectionsActions.ActionTypes.ACTIVIST.LOAD_CURRENT_USER_GEOGRAPHIC_FILTERS,
    //         geographicFilters: store.currentUser.geographicFilters
    //     });
    // }

    }




  return (
    <div className="container main">
      <SearchActivistPayment ></SearchActivistPayment>

      <TabsPayments ></TabsPayments>
    </div>
  )
}

export default ManageActivistPayment


