import axios from "axios";
import { ActivistRolesPayments } from "../Models/ActivistRolesPayments";
import * as SystemActions from './SystemActions';

export function getPaymentByElectionRoleKey(electionRoleVoterKey) {
  return axios.get(
    window.Laravel.baseURL + `api/payment/role-voter/${electionRoleVoterKey}`
  );
}

/**
 * 
 * @param {ActivistRolesPayments} activistPaymentRole 
 */
export function updateActivistPaymentRole(dispatch,activistPaymentRole){
  dispatch({type: SystemActions.ActionTypes.SAVING_CHANGES});
  return axios.put(
    window.Laravel.baseURL + `api/payments/activist-role-payment/${activistPaymentRole.id}`,
    activistPaymentRole
  ).then(function (response) {
       if(response)
       dispatch({ type: SystemActions.ActionTypes.CHANGES_SAVED });
       return response.data.data;
   }, function (error) {
    SystemActions.displayErrorMessage(error, dispatch)
       dispatch({ type: SystemActions.ActionTypes.CHANGES_NOT_SAVED });
   });  
}
