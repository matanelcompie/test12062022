import { useEffect, useState } from 'react';
import axios from "axios";

export const useGetMainTable = () => {
  const [state, setState] = useState({dataMain: null, loadingMain: true});
  const baseUrl = window.location.origin + window.Laravel.baseURL;
  const MainDataUrl = "api/quarters-dashboard-votes/-1/[1]";
  let url = baseUrl + MainDataUrl;
  let method = 'get';
  
  useEffect(() => {
    console.log('sent request type: ', method, '. to url: ', url);
    setState(state => ({dataMain: state.dataMain, loadingMain: true}));
    let responseData;
    axios.request({
        method: method,
        url: url,
      }).then((response) => {
         responseData = response.data.data;
         setState({dataMain: responseData, loadingMain: false});
         console.log('response of GetMain request: ', responseData);
      }).catch(error => {
        setState(state => ({dataMain: state.dataMain, loadingMain: false}));
        console.log('response error of GetMain request: ', error);
    });
  }, []);
  return state;
};


export const useGetSummaryData = () => {
  const [state, setState] = useState({summaryData: null, loadingSummary: true});
  const baseUrl = window.location.origin + window.Laravel.baseURL;
  const summaryDataUrl = "api/quarters-mandates-dashboard/information";
  let url = baseUrl + summaryDataUrl;
  let method = 'get';

  useEffect(() => {
    console.log('sent request type: ', method, '. to url: ', url);
    setState(state => ({summaryData: state.summaryData, loadingSummary: true}));
    let responseData;
    axios.request({
        method: method,
        url: url,
      }).then((response) => {
         responseData = response.data.data;
         setState({summaryData: responseData, loadingSummary: false});
         console.log('response of summaryData request: ', responseData);
      }).catch(error => {
        console.log('response error of summaryData request: ', error);
    });
  }, []);
  return state;
};

// export const useGetGeoList = (placeType) => {
//   const [state, setState] = useState({dataGeoFirstList: null, loadingList: true});
//   const baseUrl = window.location.origin + window.Laravel.baseURL;
//   let url = '';
//   let method = 'get';
//   switch (placeType) { 
//     case 'getArea':   url = baseUrl + 'api/system/areas';   break;  
//     case 'getCity':   url = baseUrl + 'api/system/cities';  break;  
//     default: break;
//   }     
//   useEffect(() => {
//     console.log('sent request type: ', method, '. to url: ', url, '. placeType: ', placeType);
//     setState(state => ({dataGeoFirstList: state.dataGeoFirstList, loadingList: true}));
//     let responseData;
//     axios.request({
//         method: method,
//         url: url,
//       }).then((response) => {
//          responseData = response.data.data;
//          setState({dataGeoFirstList: responseData, loadingList: false});
//          console.log('response of dataGeoFirstList request: ', responseData);
//       }).catch(error => {
//         console.log('response error of dataGeoFirstList request: ', error);
//     });
//   }, [placeType]);
//   return state;
// };

export const getDashboardDataByPlace = (geoType, geoIdArray) => {
  let geoId = geoIdArray.toString();
  let baseUrl = window.location.origin + window.Laravel.baseURL;
  let specificPath = 'api/quarters-dashboard-votes/' + geoType +  '/[' + geoId + ']';
  let url = baseUrl + specificPath; 
  let method = 'get';

  console.log('sent request type: ', method, '. to url: ', url);

  return axios.request({
      method: method,
      url: url,
    });
};

export const getExcelByPlace = (geoType, geoIdArray) => {
  let geoId = geoIdArray.toString();
  let baseUrl = window.location.origin + window.Laravel.baseURL;
  let specificPath = 'api/quarters-excel-votes/' + geoType +  '/[' + geoId + ']';
  let url = baseUrl + specificPath; 
  let method = 'get';

  console.log('sent request type: getExcelByPlace', method, '. to url: ', url);
  return url;
};

export const getCurrentUser = () => {
  
  let baseUrl = window.location.origin + window.Laravel.baseURL;
  let url = baseUrl +'api/system/users/current?time=' + Date.now();
  let method = 'get';

  return axios.request({
      method: method,
      url: url,
    });
};


export const getListOfPlaces = (placeType, placeKey = null,secondPlace=null, checkPermissions = false) => {
    
  const baseUrl = window.location.origin + window.Laravel.baseURL;
  let url = '';
  let method = 'get';
  let params={};

  switch (placeType) { 
    case 'getArea':       url = baseUrl + 'api/system/areas';                             break;  
    case 'getSubArea':    url = baseUrl + 'api/system/sub-areas/' + placeKey;             break; 
    case 'getCityArea':    url = baseUrl + 'api/system/cities/' + placeKey;               break; 
    case 'getCitySubArea':    url = baseUrl + 'api/system/cities/' + placeKey;params={sub_area_key:secondPlace}; break; 
    case 'getCity':       url = baseUrl + 'api/system/cities';                            break;  
    case 'getCluster':    url = baseUrl + `api/system/cities/${placeKey}/clusters`;       break;  
    case 'getBallot':     url = baseUrl + `api/system/cities/${placeKey}/ballots`;        break;  
    case 'getBallotCluster':     url = baseUrl + `api/system/cluster-ballot/${placeKey}`;        break;
   
    default: break;
  }     
  if(checkPermissions) { 
    params.screen_permissions = 'dashboards.mandates.report';
    params.check_permissions = checkPermissions
  }
  // console.log('checkPermissions', params, checkPermissions)

  console.log('sent request type: ', method, '. to url: ', url);

  return axios.request({
      method: method,
      url: url,
      params:params
  });
};

