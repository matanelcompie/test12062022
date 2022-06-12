import Axios from "axios";
//class PaymentGroupService {
// url= window.Laravel.baseURL + "payments/payment-group/";
export const downloadExcelDetails = (paymentGroupId) => {
  const exportUrl =
    window.Laravel.baseURL + `api/payments/group-payments/download-excel/${paymentGroupId}`;
  window.open(exportUrl, "blank");
};
//}

//export default  PaymentGroupService;
