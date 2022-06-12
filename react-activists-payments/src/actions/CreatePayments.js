import Axios from 'axios';
const MAX_SUM_PAYMENT=6000;
import * as SystemAction from  './SystemActions'





export function createPaymentGroup(dispatch,arrSelectedRecordPayments,nameGroup,paymentTypeId,shasBankId,isRecurringActivistPayment) {
  return  Axios({
        url: window.Laravel.baseURL + 'api/payments/create-payment',
        method: 'post',
        data:{
            'arrSelectedRecord':JSON.stringify(arrSelectedRecordPayments),
            'paymentGroupName':nameGroup,
            'paymentTypeId':paymentTypeId,
            'shasBankId':shasBankId,
            'isRecurringActivistPayment':isRecurringActivistPayment?1:0
        }
    }).then(function (response) {
        let needPayments = response.data.data;
        return needPayments;
    })
}

//function get arr payment details record and payment group id
//function create activist payment and add them to exist payment group
//function create new masav file after insert another activist payment

export function addPaymentToExistingGroup(dispatch,arrSelectedRecordPayments,payment_group_id) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/payments/add-payment',
          method: 'post',
          data:{
              'arrSelectedRecord':JSON.stringify(arrSelectedRecordPayments),
              'payment_group_id':payment_group_id
             
          }
      }).then(function (response) {
          let needPayments = response.data.data;
          return needPayments;
        
      }, function (error) {
        SystemAction.displayErrorMessage(error,dispatch);
      });
  }

  //remove activist payment record from group

  export function deleteRecordActivistPaymentInGroup(activist_payment_key) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/payments/remove-payment',
          method: 'post',
          data:{
             'activist_payment_key':activist_payment_key
          }
      }).then(function (response) {
         
      }, function (error) {
        SystemAction.displayErrorMessage(error,dispatch);
      });
  }
  


export function updateReferenceOfGroupPayments(dispatch,payment_group_id,reference_id,transfer_date) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/payments/group-payments/reference',
          method: 'post',
          data:{
              'payment_group_id':payment_group_id,
              'reference_id':reference_id,
              'transfer_date':transfer_date
                }
      }).then(function (response) {
          let needPayments = response.data.data;
          return needPayments;
        
      }, function (error) {
        SystemAction.displayErrorMessage(error,dispatch);
      });
  }

  export function deletePaymentGroupById(dispatch,payment_group_id) {
   
    return  Axios({
          url: window.Laravel.baseURL + 'api/payments/group-payments/delete',
          method: 'post',
          data:{
              'paymentGroupId':payment_group_id
                }
      }).then(function (response) {
          let needPayments = response.data.data;
          return needPayments;
        
      }, function (error) {
        SystemAction.displayErrorMessage(error,dispatch);
      });
  }


  export function updateStatusActivistPayment(dispatch,arrActivistPaymentStatus,paymentStatusSystemName) {
    
     return  Axios({
           url: window.Laravel.baseURL + 'api/payments/set-status',
           method: 'post',
           data:{
               'paymentStatusSystemName':paymentStatusSystemName,
               'arrActivistPaymentId':arrActivistPaymentStatus
                 }
       }).then(function (response) {
           return response;
       }, function (error) {
        SystemAction.displayErrorMessage(error,dispatch);
       });
   }

   //function that return list of payment group open without reference id
   export function getListOpenPaymentGroupForAddPayment(dispatch,arrActivistPaymentStatus,paymentStatusSystemName) {
    
     return  Axios({
           url: window.Laravel.baseURL + 'api/payments/group-payments/open',
           method: 'get'
         
       }).then(function (response) {
        let listPaymentGroup = response.data.data;
        return listPaymentGroup;
           
       }, function (error) {
        alert('error')
       });
   }

  export function displayErrorMessage(error) {
     let response = error.response || false;
     if (response) {
       let data = response.data || false;
       if (data) {
         return data.message;
       }
     }
   }