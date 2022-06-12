import Axios from "axios";

export const downloadExcelRolePaymentByObjectSearch = (searchObj) => {
  let exportUrl = window.Laravel.baseURL + "api/payments/role-payment/download-excel?";

  for (let name in searchObj) {
    let value = searchObj[name];
    if (value !== null && value !== "") {
      exportUrl += "&" + name + "=" + value;
    }
  }
  window.open(exportUrl, "blank");
};
