import axios from "axios";

class GlobalListsService {
  shasBankDetails(dispatch) {
    return axios({
      url: window.Laravel.baseURL + "api/list/shas-banks",
      method: "get",
    }).then(
      function (response) {
        let list = response.data.data;
        return list;
      },
      function (error) {}
    );
  }

  getCities(dispatch) {
    return axios({
      url: window.Laravel.baseURL + "api/list/cities",
      method: "get",
    }).then(
      function (response) {
        let list = response.data.data;
        return list;
      },
      function (error) {}
    );
  }

  electionRoles(dispatch) {
    return axios({
      url: window.Laravel.baseURL + "api/list/election-roles",
      method: "get",
    }).then(
      function (response) {
        let list = response.data.data;
        return list;
      },
      function (error) {}
    );
  }

  electionCampaignList(dispatch) {
    return axios({
      url: window.Laravel.baseURL + "api/list/election-campaign",
      method: "get",
    }).then(
      function (response) {
        let list = response.data.data;
        return list;
      },
      function (error) {}
    );
  }
}

export default new GlobalListsService();
