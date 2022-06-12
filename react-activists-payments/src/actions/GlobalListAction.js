import Axios from 'axios';

export function paymentStatusType(dispatch) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/list/payment-status-type',
          method: 'get'
      }).then(function (response) {
          let list = response.data.data;
          return list;
        
      }, function (error) {
  
      });
  }

  export function paymentType(dispatch) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/list/payment-type',
          method: 'get'
      }).then(function (response) {
          let list = response.data.data;
          return list;
        
      }, function (error) {
  
      });
  }

  export function shasBankDetails(dispatch) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/list/shas-banks',
          method: 'get'
      }).then(function (response) {
          let list = response.data.data;
          return list;
        
      }, function (error) {
  
      });
  }

  export function electionRoles(dispatch) {
    
   return Axios({
        url: window.Laravel.baseURL + 'api/list/election-roles',
        method: 'get'
    }).then(function (response) {
        let list = response.data.data;
        return list;
    }, function (error) {
      
    });
}

export function electionCampaignList(dispatch) {
    
    return Axios({
         url: window.Laravel.baseURL + 'api/list/election-campaign',
         method: 'get'
     }).then(function (response) {
         let list = response.data.data;
         return list;
     }, function (error) {
       
     });
 }

 export function paymentTypeAdditionalList(dispatch) {
    
    return Axios({
         url: window.Laravel.baseURL + 'api/list/payment-type-additional',
         method: 'get'
     }).then(function (response) {
         let list = response.data.data;
         return list;
     }, function (error) {
       
     });
 }


 export function reasonPaymentStatus(dispatch,paymentStatusTypeId=null) {
    
    let url= window.Laravel.baseURL + 'api/list/reason-payment-status';
    return Axios({
         url:paymentStatusTypeId?url+'/'+paymentStatusTypeId:url,
         method: 'get'
     }).then(function (response) {
        debugger
         let list = response.data.data;
         return list;
     }, function (error) {
       
     });
 }





 