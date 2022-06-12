import React, {useEffect, useState, useRef, useContext } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { CircularProgress } from '@material-ui/core';

import SearchControl from './SearchControl.jsx';
import TableData from './TableData.jsx';
import { useGetMainTable, getListOfPlaces } from '../hooks/useCall.jsx';
import { objectIsNotEmpty } from '../helpers/variousHelpers.js';
import { displayContext } from '../context/displayContext.jsx';

const TabsWrapper = () => {
  const { dataMain, loadingMain } = useGetMainTable();
  const [dataList, setDataList] = useState({AREA:[], CITY:[]});
  const [loadingDataList, setLoadingDataList] = useState({AREA:true, CITY:true});
  const [searchResultArea, setSearchResultArea] = useState(null);
  const [searchResultCity, setSearchResultCity] = useState(null);
  // changes on searchControl component, displayed in tableData component:
  const {display, setDisplay} = useContext(displayContext); 

  useEffect(() => {
    console.log('TabsWrapper is running')
    setDisplay(prev => ({...prev, currentScreenDisplayed: {type:-1, id:[1]}, currentTab: "MAIN"}));
    setLoadingDataList({AREA:true, CITY:true});
    getFirstPlaceList("getArea");
    getFirstPlaceList("getCity");
  }, [])

  const getFirstPlaceList = (placeType) => { 
    // get list of places (city/area) from server, to display in search component:
    getListOfPlaces(placeType)
    .then((response) => {
      console.log('response of getListOfPlaces (getFirstPlaceList) request: ', placeType, response.data.data);
      if (placeType === "getArea") {
        setDataList(state => ({AREA: response.data.data, CITY: state.CITY}));
        setTimeout(() => { setLoadingDataList(state =>({AREA:false, CITY:state.CITY})) }, 1000);
      } else if (placeType === "getCity") {
        setDataList(state => ({AREA: state.AREA, CITY: response.data.data}));
        setTimeout(() => { setLoadingDataList(state =>({AREA:state.AREA, CITY:false})) }, 1000);
      }
    }).catch(error => {
      console.log('response error of getListOfPlaces (getFirstPlaceList) request: ', error);
    });
  }


  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>ארצי</Tab>
          <Tab>אזור / תת אזור</Tab>
          <Tab>עיר / אשכול / קלפי</Tab>
        </TabList>

        <TabPanel>
          <div className="tab-content">
             {/* {false ? */}
              {!loadingMain ?
               <>
               { (dataMain && objectIsNotEmpty(dataMain)) 
                ? 
                  <TableData type="MAIN" data={dataMain}/>
                :
                  <div className="overall">
                    <div className="circular-wrp">
                      <div>נראה שהיתה בעיה בטעינת הנתונים. יש לרענן את הדף.</div>
                      <div>אם הבעיה נמשכת - פנה למנהל המערכת.</div>
                    </div>
                  </div>
                }
              </> 
              :
              <div className="overall linearProgress">
                <div className="circular-wrp linearProgress">
                  <div>מכין נתונים...</div>
                  <CircularProgress/>
                </div>
              </div>
            }
          </div>
        </TabPanel>
        <TabPanel>
          <div className="tab-content">
            <SearchControl type="AREA" setData={setSearchResultArea} placeList={dataList} loadingDataList={loadingDataList}  />
            <TableData type="AREA" data={searchResultArea}/>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="tab-content">
            <SearchControl type="CITY" setData={setSearchResultCity} placeList={dataList} loadingDataList={loadingDataList}  />
            <TableData type="CITY"  data={searchResultCity}/>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}

export default TabsWrapper;
