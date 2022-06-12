import Axios from 'axios';

import { useEffect, useState } from 'react';
import axios from "axios";

export const getAllDetailsSummeryPaymentActivist = (paramsSearch) => {
  const baseUrl = window.location.origin + window.Laravel.baseURL;
  const MainDataUrl = "api/payments/search";
  let url = baseUrl + MainDataUrl;
  let method = 'get';

    let responseData;
   return axios.request({
        method: method,
        url: url,
        params:paramsSearch
      }).then((response) => {
         responseData = response.data.data;
        return responseData;
      }).catch(error => {
    });

};

//function get voter key and return all details payment group role
export const getDetailsSummeryPaymentGroupRole = (voter_key,election_campaign_id,election_role_arr=null,payment_type_additional_arr=null) => {
    
    const baseUrl = window.location.origin + window.Laravel.baseURL;
      const MainDataUrl = "/api/payments/activist";
      let url = baseUrl + MainDataUrl;
      let method = 'get';
        let responseData;
       return axios.request({
            method: method,
            url: url,
            params:{
                'voter_key':voter_key,
                'election_campaign_id':election_campaign_id,
                'election_role_id':election_role_arr,
                'payment_type_additional':payment_type_additional_arr
            }
          }).then((response) => {
             responseData = response.data.data;
            return responseData;
          }).catch(error => {
          
        });
    
    };

export function getAllRoleVoterNeedPayments(dispatch, params) {
    
  return  Axios({
        url: window.Laravel.baseURL + 'api/payments/role-voters/need-payment',
        method: 'get',
        params:params
    }).then(function (response) {
        
        let needPayments = response.data.data;
        return needPayments;
      
    }, function (error) {

    });
}



export function getAllArrGroupPaymentBySearch(dispatch, paramsSearch) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/payments/group-payments',
          method: 'get',
          params:paramsSearch
      }).then(function (response) {
          
          let arrGroupPayments = response.data.data;
          return arrGroupPayments;
        
      }, function (error) {
  
      });
  }


  export function downloadFilePaymentGroupMasav(dispatch, paymentGroupId) {
 
        var url=window.Laravel.baseURL + 'api/payments/group-payments/download?'+'paymentGroupId='+paymentGroupId;
        window.open(url, '_blank');

  }

  //function return list activist payment  for paymentGroup
  export function getAllActivistPaymentsByGroupId(dispatch, paymentGroupId) {
    
    return  Axios({
          url: window.Laravel.baseURL + 'api/payments/group-payments/list-payments-group',
          method: 'get',
          params: {
              'paymentGroupId':paymentGroupId
          }
      }).then(function (response) {
          
          let arrGroupPayments = response.data.data;
          return arrGroupPayments;
        
      }, function (error) {
  
      });
  }


  export  function getInvalidRecordToPay(){
    return  Axios({
      url: window.Laravel.baseURL + 'api/payments/activist-payment/invalid',
      method: 'get',
  }).then(function (response) {
      let arrActivistPaymentInvalid = response.data.data;
      return arrActivistPaymentInvalid;
    
  }, function (error) {

  });
  }


  

  


