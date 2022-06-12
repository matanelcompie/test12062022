import React, { useContext, useEffect, useState, useRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import { useGetGeo, getDashboardData, useGetMainGoal } from '../hooks/useCall.jsx';
import DashboardBox from '../components/DashboardBox.jsx';
import DashboardBoxLast from '../components/DashboardBoxLast.jsx';
import ColorMap from '../components/ColorMap.jsx';
import checkGeoPermissions from '../helpers/checkGeoPermissions.js';
import { objectIsNotEmpty } from '../helpers/variousHelpers.js';
import { localDataPost, localDataGet } from '../helpers/dataHelper.js';
import { permissionContext } from '../context/permissionContext.jsx';
import SearchControl from '../components/SearchControl.jsx';
import ColorMapButton from '../components/ColorMapButton.jsx';

const DashboardDetailed = () => {
  const history = useHistory();
  const { dataGeo, loading } = useGetGeo(); 
  const { mainGoal } = useGetMainGoal(); 
  const { permissionLevel, setPermissionLevel } = useContext(permissionContext);
  const [fetchedData, setFetchedData] = useState(null);
  const [dataDisplay, setDataDisplay] = useState(null);
  const [childrensSelected, setChildrensSelected] = useState([]);
  const [updatingDashboard, setUpdatingDashboard] = useState(false);
  const [showColorMapModal, setShowColorMapModal] = useState(false);
  const [isShowAll, setIsShowAll] = useState(true);
  const [isCaptain100Mode, setIsCaptain100Mode] = useState(true);
  const [message, setMessage] = useState(null);
  const multiselectRef = useRef();

  const goBack = () => {
    history.push(`/dashboard`);
  }

  useEffect(() => {
    if (!loading) {
      // dataGeo changed + finished to load:
      if (dataGeo && objectIsNotEmpty(dataGeo)) {
        // permissionLevel is set only once, at mount:
        setPermissionLevel(checkGeoPermissions(dataGeo));
      } else {
        console.log('dataGeo is empty or null.');
      }
    }
  }, [dataGeo]);

  useEffect(() => {
    if (permissionLevel && objectIsNotEmpty(permissionLevel)) {
      // permissionLevel changed + not null + not empty:
      setUpdatingDashboard(true);
      let subType = null;
      if (permissionLevel.currentEntityType === 1) {
        if (isCaptain100Mode) {
          subType = 1;
        } else {
          subType = 0;
        }
      }
      setTimeout(() => {
        updateDashboard(permissionLevel.currentEntityType, permissionLevel.currentEntity.id, subType);
      }, 500);
    }
  }, [permissionLevel]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsShowAll(true);
  }, [updatingDashboard])

  useEffect(() => {
    if (fetchedData && objectIsNotEmpty(fetchedData)) {
      // fetchedData changed + not null + not empty:
      setDataDisplay(fetchedData);
    }
  }, [fetchedData]);

  useEffect(() => {
   if (dataDisplay && objectIsNotEmpty(dataDisplay)) {
    if ( (dataDisplay.parent_entities_voter_summary.entity_type === 1) ) {
       // when city mode (show all / show by list) changes, reset the list:
       setChildrensSelected([]);
       multiselectRef.current.resetSelectedValues();
    }
   }
  }, [isShowAll]);

  useEffect(() => {
    if (!loading && dataDisplay) {
      // run only when mode changes,
      // but not on page first load & only when dataDisplay is not null. 
      setUpdatingDashboard(true);
      let entity_type = dataDisplay.parent_entities_voter_summary.entity_type;
      let entity_id = dataDisplay.parent_entities_voter_summary.entity_id;
      // get the right screen:
      changeScreenLevel(entity_type, entity_id);
      // when city mode (isCaptain100Mode) changes, reset the selected list:
      // reset the children display array:
      if (dataDisplay && objectIsNotEmpty(dataDisplay)) {
        if ( (dataDisplay.parent_entities_voter_summary.entity_type === 1) ) {
           // when city mode (show all / show by list) changes, reset the list:
           setChildrensSelected([]);
           multiselectRef.current.resetSelectedValues();
        }
       }
    }
  }, [isCaptain100Mode]);

  const updateDashboard = (geoType, geoId, subType = null) => {
    // get response from server:
    getDashboardData(geoType, geoId, subType)
    .then((response) => {
        setFetchedData(response.data.data);
        console.log('response of updateDashboard request: ', response.data.data);
        // delay the end of updating sign:
        setTimeout(() => { setUpdatingDashboard(false); }, 500);
        // insert fetched data to local data:
        let localResponse = localDataPost(geoType, geoId, response.data.data);
        if (localResponse) {
          console.log('localResponse received new data', localResponse);
        } else {
          console.log('localResponse didnt received the new data', localResponse);
        }
    }).catch(error => {
      setMessage("היתה בעיה בשליפת הנתונים. יש לרענן את העמוד. אם הבעיה נמשכת - פנו למנהל המערכת");
      // after 8 sc' clear message:
      setTimeout(() => { 
        setMessage(null);
      }, 8000);
      console.log('response error of getDashboardData request: ', error);
      setUpdatingDashboard(false);
    });
  }
  
  const changeScreenLevel = (geoType, geoId) => {
    // if its a CITY call, check if captain100 / clusters needed:
    let subType = null;
    if (geoType === 1) {
      if (isCaptain100Mode) {
        subType = 1;
      } else {
        subType = 0;
      }
    }
    // check if the data already exists in client:
    let localResponse = localDataGet(geoType, geoId, subType);
    if (localResponse) {
      // data exist locally, insert to the display:
      setDataDisplay(localResponse);
      setTimeout(() => {
        setUpdatingDashboard(false);
      }, 500);
    } else {
      // data doesnt exist locally, bring it from server:
      updateDashboard(geoType, geoId, subType);
    }
  }

  return (
    <div className="container main">
      { updatingDashboard &&
        <div className="overall">
          <div className="circular-wrp">
            <div>מכין נתונים...</div>
            <CircularProgress/>
          </div>
        </div>
      }
      { message && <div className="center message-orange">{message}</div> }
      <h2 className="main-header">פילוח התקדמות מפורט (תומכים, מהססים, לא ידועים)</h2>
      <div className="redirect" onClick={() => {goBack()}}><h2> <i class="fa fa-chevron-circle-left"></i> לחזרה ללוח בקרה ראשי - מעקב פעילי שטח</h2></div>
      <ColorMapButton setShowColorMapModal={setShowColorMapModal}/>
      { showColorMapModal && <ColorMap dashboardType = "DETAILED" /> }
  
      {
        (dataDisplay && objectIsNotEmpty(dataDisplay)) ? 
        <>
          <DashboardBox data={{type: 'MAIN', state:dataDisplay.parent_entities_voter_summary, mainGoal, dashboardType:"DETAILED"}} nav={{changeScreenLevel, setUpdatingDashboard}}/>
          <>
          { 
          (dataDisplay.parent_entities_voter_summary.entity_type === 1) 
          ? 
          (
          <>
            <SearchControl 
              data={{
                setIsShowAll, 
                isShowAll, 
                multiselectRef, 
                options: dataDisplay.sub_entities_voter_summary,
                setChildrensSelected,
                isCaptain100Mode,
                setIsCaptain100Mode
              }}
            />
            <div className="dashboard-sub-box-wrp">
              {
                isShowAll 
                ?              
                  dataDisplay.sub_entities_voter_summary.map(
                    (subEntity) => {
                      return(
                              <DashboardBoxLast 
                                data={{type: 'LAST', state:subEntity, mainGoal, dashboardType:"DETAILED"}} 
                              />
                            )
                  })
                :
                  (
                    childrensSelected.length > 0
                    ?
                    (
                      childrensSelected.map(
                        (subEntity) => {
                          return(<>
                                  <DashboardBoxLast 
                                    data={{type: 'LAST', state:subEntity, mainGoal, dashboardType:"DETAILED"}} 
                                  />
                                </>
                                )
                      })
                    )
                    :
                    (<div className="no-list-yet">יש לבחור מהרשימה לעיל</div> )
                  )
              }
            </div>
          </>
          )
          : 
          (
            dataDisplay.sub_entities_voter_summary.map(
              (subEntity) => {
                return(
                  // ! חיים ארבל ביקש ממני יומיים לפני הבחירות להעלים את מטה אבות ובנים
                  // ! מזהה אבות ובנים הוא 1305 יש לבטל את ההגבלה לאחר הבחירות
                  // todo: להחזיר את מטה אבות ובנים
                  (subEntity.entity_type === 1) && (subEntity.entity_id === 1305) ?
                  ""
                  :
                  <div key={subEntity.entity_id}><DashboardBox data={{type: 'SUB', state:subEntity, mainGoal, dashboardType:"DETAILED"}} nav={{changeScreenLevel, setUpdatingDashboard}}/></div>
                )
              })
          )
          }
          </>
        </>
        :
        <div className="center message-grey">{}
         בודק את ההרשאות שלך...
        </div>
      }
    </div>
  )
}

export default DashboardDetailed;


