import axios from "axios";

class UploadExcelFileService {
  getCsvDocumentThemeList() {
    return axios({
      url: window.Laravel.baseURL + `api/system/imports/csv-document/themes`,
      method: "get",
    }).then(function (result) {
      return result.data.data;
    });
  }
  getExcelColumnUploadElectionPartyVotesByCity(cityId, electionCampaignId) {
    return axios({
      url:
        window.Laravel.baseURL +
        `api/system/cities/${cityId}/election-votes-report/${electionCampaignId}/upload/excel-columns`,
      method: "get",
    }).then(function (result) {
      return result.data.data;
    });
  }

  uploadExcelFile(file, csvDocumentThemeId) {
    return axios({
      url:
        window.Laravel.baseURL +
        `api/system/imports/csv-document/theme/${csvDocumentThemeId}`,
      method: "post",
      data: file,
    }).then(function (result) {
      return result.data.data;
    });
  }

  getCsvDocumentDetailsByKey(excelFileKey) {
    return axios({
      url:
        window.Laravel.baseURL +
        `api/system/imports/csv-document/${excelFileKey}`,
      method: "get",
    }).then(function (result) {
      return result.data.data;
    });
  }

  downloadExcelErrorRowsByTypeErrorAndNameField(
    csvDocumentId,
    ErrorType,
    nameField = null
  ) {
    let exportUrl =
      window.Laravel.baseURL +
      `api/system/imports/csv-document/${csvDocumentId}/error-type/${ErrorType}`;

    if (nameField) exportUrl = exportUrl + `/${nameField}`;

    window.open(exportUrl, "blank");
  }

  stopUploadExcelFile(csvDocumentId) {
    return axios({
      url:
        window.Laravel.baseURL +
        `api/system/imports/csv-document/${csvDocumentId}/stop`,
      method: "post",
    }).then(function (result) {
      return result.data.data;
    });
  }

  downloadCsvByDocumentId(csvDocumentId) {
    let exportUrl =
      window.Laravel.baseURL +
      `api/system/imports/csv-document/${csvDocumentId}/download`;
    window.open(exportUrl, "blank");
  }

  getAllCsvUploadedDetails() {
    return axios({
      url: window.Laravel.baseURL + `api/system/imports/csv-documents`,
      method: "get",
    }).then(function (result) {
      return result.data.data;
    });
  }
}

export default new UploadExcelFileService();
