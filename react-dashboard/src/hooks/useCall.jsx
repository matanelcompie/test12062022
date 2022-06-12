import { useEffect, useState } from 'react';
import axios from "axios";

export const useGetGeo = () => {

  const [state, setState] = useState({dataGeo: null, loading: true});
  const baseUrl = window.location.origin + window.Laravel.baseURL;
  const geographicListUrl = "api/system/users/current/geographic_lists?cities=true&areas=true&sub_areas=true&screen_permission=quarters.dashboard";
  let url = baseUrl + geographicListUrl;
  let method = 'get';
 
  useEffect(() => {
    setState(state => ({dataGeo: state.dataGeo, loading: true}));
    let responseData;
    axios.request({
        method: method,
        url: url,
      }).then((response) => {
         responseData = response.data.data;
         setState({dataGeo: responseData, loading: false});
         console.log('response of GetGeo request: ', responseData);
      }).catch(error => {
        console.log('response error of GetGeo request: ', error);
    });
  }, []);
  return state;
};


export const useGetMainGoal = () => {

  const [state, setState] = useState({mainGoal: null});
  const baseUrl = window.location.origin + window.Laravel.baseURL;
  const mainGoalUrl = "api/quarters-present";
  let url = baseUrl + mainGoalUrl;
  let method = 'get';
 
  useEffect(() => {
    setState(state => ({mainGoal: state.mainGoal}));
    let responseData;
    axios.request({
        method: method,
        url: url,
      }).then((response) => {
         responseData = response.data.data;
         setState({mainGoal: responseData});
         console.log('response of mainGoal request: ', responseData);
      }).catch(error => {
        console.log('response error of mainGoal request: ', error);
    });
  }, []);
  return state;
};

export const getDashboardData = (geoType, geoId, subType = null, main = null) => {

  let baseUrl = window.location.origin + window.Laravel.baseURL;
  let specificPath = 'api/quarters-dashboards' + (main === 'main' ? `-${main}` : "" ) + '/' + geoType +  '/' + geoId + (subType !== null ? `/${subType}` : "" );
  // let specificPath = 'api/quarters-dashboards' + '/' + '1' +  '/' + '146' + '/' + (subType ? `/${subType}` : "0" );
  let url = baseUrl + specificPath; 
  let method = 'get';

  return axios.request({
      method: method,
      url: url,
    });
};


export const getExcelByPlace = (geoType, geoId) => {
  let baseUrl = window.location.origin + window.Laravel.baseURL;
  let specificPath = 'api/quarters-dashboards-excel-captain/' + geoType +  '/' + geoId;
  
  let url = baseUrl + specificPath; 
  let method = 'get';

  console.log('sent request type: getExcelByPlace', method, '. to url: ', url);
  return url;
};