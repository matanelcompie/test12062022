import React, {useContext, useEffect, useState, useRef } from 'react';
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import { Multiselect } from 'multiselect-react-dropdown';
import { displayContext } from '../context/displayContext.jsx';
import { getDashboardDataByPlace, getListOfPlaces } from '../hooks/useCall.jsx';

const selectedPlaces = {
  first:[],
  second:[],
  firstCompare:[],
  secondCompare:[]
}

const resetSelectedPlaces = () => {
    selectedPlaces.first = [];
    selectedPlaces.second = [];
    selectedPlaces.firstCompare = [];
    selectedPlaces.secondCompare = [];
}

const SearchControl = (props) => {

  const {type, setData, placeList, loadingDataList} = props;
  const multiselectRefFirst = useRef();
  const multiselectRefSecond = useRef();
  const {display, setDisplay} = useContext(displayContext);
  const [message, setMessage] = useState({classStyle:"", text:""});
  const [firstEntitySearch, setFirstEntitySearch] = useState();
  const [loadingFirstEntity, setLoadingFirstEntity] = useState(true);
  const [secondEntitySearch, setSecondEntitySearch] = useState([]);
  const [loadingSecondEntity, setLoadingSecondEntity] = useState(false);
  const [searchType, setSearchType] = useState("base");
  let comparisonType = type === "AREA" ? "isComparisonArea" : "isComparisonCity";
  let placeOptions = type === "AREA" ? {base:"אזור", second:"תת אזור"} : {base:"עיר", second:"אשכול", third: "קלפי"};
  // const [selectedPlacesString, setSelectedPlacesString] = useState("");

  useEffect(() => {
    setDisplay(prev => ({...prev, currentScreenDisplayed: {type:null, id:[]}, currentTab: type}));
    resetSelectedPlaces();
    setLoadingFirstEntity(true);
    if (type === "AREA" && !loadingDataList.AREA) {
      if (placeList && placeList.AREA) {
        setFirstEntitySearch(placeList.AREA);
        setLoadingFirstEntity(false);
      }
    }
    if (type === "CITY" && !loadingDataList.CITY) {
      if (placeList && placeList.CITY) {
        setFirstEntitySearch(placeList.CITY);
        setLoadingFirstEntity(false);
      }
    }
  }, [placeList, loadingDataList]);

  const resetMessage = () => {
    setMessage({
      classStyle: "",
      text: ""
    })
  }
  
  const setSearchTypeRadio = (value) => {
    // this function just reset/empty search fields when changing search type.
    // setSelectedPlacesString("");
    resetMessage();
    let newSearchType = value;
    resetSelectedPlaces();
    multiselectRefFirst.current.resetSelectedValues();
    let currentSearchType = searchType;
    if (currentSearchType !== "base") {
      multiselectRefSecond.current.resetSelectedValues();
      setSecondEntitySearch([]);
    }
    setSearchType(newSearchType);
  }

  const getPlaceList = (placeType, placeId = null) => { 
    // get place list from server due to change of place type/first place list.
    getListOfPlaces(placeType, placeId)
    .then((response) => {
      console.log('response of getListOfPlaces request: ', response.data.data);
      if (placeType === "getArea" || placeType === "getCity") {
        setFirstEntitySearch(response.data.data);
        setLoadingFirstEntity(false);
      } else {
        if (placeType === "getBallot") {
          // save ballot list in local context, for conflicts verifications:
          let newDisplay = {... display};
          newDisplay.ballotList = response.data.data;
          setDisplay(newDisplay);
        }
        setSecondEntitySearch(response.data.data);
        setLoadingSecondEntity(false);
      }
    }).catch(error => {
      console.log('response error of getListOfPlaces request: ', error);
    });
  }

  const getPlaceNameForRequest = (isGetType = null) => {
    // isGetType is for get *entity type* of place, instead of get name.
    if (type === "AREA") {
      if (searchType === "base") {
        return isGetType ? 0 : "getArea";
      } else {
        return isGetType ? 5 : "getSubArea";
      }
    } else if (type === "CITY") {
      if (searchType === "base") {
        return isGetType ? 1 : "getCity";
      } else if (searchType === "second") {
        return isGetType ? 3 : "getCluster";
      } else {
        return isGetType ? 4 : "getBallot";
      }
    }
  }

  const onSelectFirst = (selectedList, selectedItem) => {
    // this func runs when first *multiselect* changes.
    if (selectedList.length > 0) {
      if (searchType !== "base") {
        // get second search list:
        setLoadingSecondEntity(true);
        let placeName = getPlaceNameForRequest();
        getPlaceList(placeName, selectedItem.key);
      } 
      selectedPlaces.first = selectedList;
      // setSelectedPlacesString(`${placeOptions.base}: ${selectedItem.name}. `);
    }
  }

  const onSelectSecond = (selectedList, selectedItem) => {
    // this func runs when second *multiselect* changes.
    if (selectedList.length > 0) {
      selectedPlaces.second = selectedList;
      // setSelectedPlacesString(`${placeOptions.base}: ${selectedPlaces.first[0].name}.  ${(searchType === "second") ? placeOptions.second : placeOptions.third}: ${createSecondPlaceListString(selectedList, "name")}, `);
    }
  }

  const onRemoveFirst = (selectedList, removedItem) => {
    // this func runs when first *multiselect* removes item.
    if (searchType !== "base") {
      // empty second search list.
      multiselectRefSecond.current.resetSelectedValues();
      setSecondEntitySearch([]);
    }
    selectedPlaces.first = selectedList;
    // setSelectedPlacesString("");
  }

  // this func was deleted temporarily.
  // const createSecondPlaceListString = (list, type) => {
  //   let listString = "[";
  //   list.forEach((item, index, array) => {
  //     listString += item[type] + ",";
  //   });
  //   listString += "]";
  //   console.log('listString', listString);
  //   return listString;
  // }

  const createArrayOfPlaceId = (array) => {
    // creates an array of ids to send to server.
    let newArray = [];
    array.forEach((item) => {
      newArray.push(item.id);
    });
    return newArray;
  }

  const beforeRequest = () => {
    let geoTypeName = getPlaceNameForRequest();

    if (geoTypeName === "getArea" || geoTypeName === "getCity") {
      if (selectedPlaces.first.length < 1) {
        setMessage({  classStyle: "orange-msg", text: `יש לבחור ${placeOptions.base}` })
        return false;
      }
      console.log('selectedPlaces.first', selectedPlaces.first);
      return createArrayOfPlaceId(selectedPlaces.first);
    } else {
      if (selectedPlaces.second.length < 1) {
        setMessage({  classStyle: "orange-msg", text: `יש לבחור ${(searchType === "second") ? placeOptions.second : placeOptions.third}` })
        return false;
      }
      console.log('selectedPlaces.second', selectedPlaces.second);
      return createArrayOfPlaceId(selectedPlaces.second);
    }
  }

  const getVotingData = () => {
    // set message for user:
    setMessage({ classStyle: "grey-msg", text: "שולח את הבקשה..." })
    // get data from server, by search type/place.
    let geoType = getPlaceNameForRequest(true);
    let geoIdArray = beforeRequest(); // returns id-array or false, if there is no selected places.
    if (!geoIdArray) {
      return;
    }
    // save request type to context - for excel generator:
    setDisplay(prev => ({...prev, currentScreenDisplayed: {type:geoType, id:geoIdArray}, currentTab: type}));
    
    getDashboardDataByPlace(geoType, geoIdArray)
    .then((response) => {
      setMessage({ classStyle: "green-msg",  text: "הבקשה התקבלה בהצלחה!" });
      setTimeout(() => { resetMessage(); }, 3000);
      console.log('response of getVotingData request: ', response.data.data);
      setData(response.data.data);
    }).catch(error => {
      setMessage({ classStyle: "red-msg",  text: "היתה בעיה עם הבקשה, אם הבעיה נמשכת - פנו למנהל המערכת." })
      console.log('response error of getVotingData request: ', error);
    });
  }

  return (
  <>
    {/* <div className="mode-text">{display[comparisonType] ? "תצוגת שרי מאה" : "תצוגת אשכולות"}</div>  */}
    <div className="search-switch-wrp">
      <div className="control-item display-options">
        <RadioGroup 
          row 
          aria-label="position" 
          name="position" 
          defaultValue="all" 
        >
          <label className="search-label">חיפוש:</label>
          <FormControlLabel
            value="base"
            control={<Radio color="primary" />}
            label={placeOptions.base}
            labelPlacement="end"
            checked={searchType === "base"}
            onChange={(e) => setSearchTypeRadio(e.target.value)}
          />
          <FormControlLabel
            value="second"
            control={<Radio color="primary" />}
            label={placeOptions.second}
            labelPlacement="end"
            checked={searchType === "second"}
            onChange={(e) => setSearchTypeRadio(e.target.value)}
          />
          { // when type is city, display third search option:
          (type === "CITY") &&
          <FormControlLabel
            value="third"
            control={<Radio color="primary" />}
            label={placeOptions.third}
            labelPlacement="end"
            checked={searchType === "third"}
            onChange={(e) => setSearchTypeRadio(e.target.value)}
          />
          }
        </RadioGroup>
      </div>     
      {/* <div  className="control-item mode-switcher-wrapper" title="החלפה בין תצוגת שר מאה לתצוגת אשכולות">
        <div className="chkbx-wrp header-dark-switch">
          <span className={`aprv-msg ${ display[comparisonType] && "darkMode-text-white"}`}>
            {display[comparisonType] ? "לתצוגת השוואה" : "השוואה מאופשרת"}
          </span>
          <div className="checkbox">
            
            <label className="switch">
              <input 
              type="checkbox" 
              checked={!display[comparisonType]} 
              value={display[comparisonType]}
              onChange={() => {
                let newDisplay = {... display};
                newDisplay[comparisonType]  = !display[comparisonType];
                setDisplay(newDisplay);
              }}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div> */}
    </div>
    <div className={`select-wrp ${(searchType === "base") ? "is-base" : ""}`}>
        <div className="multiselect-text first-mltslct">בחירת {placeOptions.base}</div>
        <Multiselect
          ref={multiselectRefFirst}
          options={firstEntitySearch}
          onSelect={onSelectFirst} // Function will trigger on select event
          onRemove={onRemoveFirst}
          displayValue="name"
          style ={display[comparisonType] ?
            {searchBox: {mamHeight: '50px'},}
            :
            {searchBox: {minHeight: '70px'},}
          }
          selectionLimit={(display[comparisonType] || searchType !== "base") ? "1" : "5"}
          hidePlaceholder={true}
          emptyRecordMsg="לא נמצאו רשומות"
          placeholder={false ? "" : "לחיצה לפתיחת רשימה"}
          closeIcon="circle"
        />
       {
        loadingFirstEntity &&
        <div className="first-ovrl overall">
          <div className="circular-wrp">
            <div>טוען רשימות...</div>
          </div>
        </div>
       }
      
      { (searchType !== "base") &&
      <>
        {  !loadingSecondEntity ?
          <>
            <div className="multiselect-text second-mltslct">בחירת {(searchType === "second") ? placeOptions.second : placeOptions.third}</div>
            <Multiselect
              ref={multiselectRefSecond}
              options={secondEntitySearch}
              onSelect={onSelectSecond} // Function will trigger on select event
              // onRemove={onRemove}
              displayValue="name"
              style ={display[comparisonType] ?
                {searchBox: {mamHeight: '50px'},}
                :
                {searchBox: {minHeight: '70px'},}
              }
              selectionLimit={display[comparisonType] ? "1" : "10"}
              hidePlaceholder={true}
              emptyRecordMsg={`אין הצעות. יש לבחור תחילה ${placeOptions.base}`}
              placeholder={(searchType === "base") ? "" : "לחיצה לפתיחת רשימה"}
              closeIcon="circle"
              disable={searchType === "all"}
            />
          </> 
          :
          (searchType !== "base") &&
          <div className="second-ovrl overall">
            <div className="circular-wrp">
              <div>טוען רשימות...</div>
            </div>
          </div>
        } 
      </>
      }      
    </div>
    {
    display[comparisonType] &&
    <div className="select-wrp">
      {/* <div className={searchType ? "hide-select" : ""}></div> */}
      <Multiselect
      style ={display[comparisonType] ?
        {searchBox: {mamHeight: '50px'},}
        :
        {searchBox: {minHeight: '70px'},}
      }
        // ref={multiselectRef}
        options={[
          {category: 1, name: 'Srigar', id: 1},{category: 1, name: 'Sam', id: 2},{category: 2, name: 'Srigar1', id: 3},{category: 2, name: 'Sam2', id: 4},
          {category: 2, name: 'Srigar', id: 1},{category: 2, name: 'Sam', id: 2},{category: 3, name: 'Srigar1', id: 3},{category: 3, name: 'Sam2', id: 4},
        ]}
        // options={options}
        // onSelect={onSelect} // Function will trigger on select event
        // onRemove={onRemove}
        displayValue="name"
        // groupBy="category"
        selectionLimit={"1"}
        // showCheckbox={true}
        hidePlaceholder={true}
        emptyRecordMsg="לא נמצאו רשומות"
        placeholder={searchType ? "" : "לחצו לפתיחת רשימה / הקלידו שם כאן"}
        closeIcon="circle"
      />       
      <Multiselect
      style ={display[comparisonType] ?
        {searchBox: {mamHeight: '50px'},}
        :
        {searchBox: {minHeight: '70px'},}
      }
        // ref={multiselectRef}
        options={[
          {category: 1, name: 'Srigar', id: 1},{category: 1, name: 'Sam', id: 2}
        ]}
        // options={options}
        // onSelect={onSelect} // Function will trigger on select event
        // onRemove={onRemove}
        displayValue="name"
        // groupBy="category"
        selectionLimit={"1"}
        // showCheckbox={true}
        hidePlaceholder={true}
        emptyRecordMsg="לא נמצאו רשומות"
        placeholder={searchType ? "" : "לחצו לפתיחת רשימה / הקלידו שם כאן"}
        closeIcon="circle"
        disable={searchType === "all"}
      />       
    </div>
    }

    {/* <div className="search-title">{selectedPlacesString === "" ? "לא נבחר מקום עדין" : "המקומות שנבחרו הם:"}</div>
    <div className="search-title-second">{selectedPlacesString}</div> */}
    { (message.text !== "") && <div className={`${message.classStyle} search-msg`}>{message.text}</div>}
    <div className="search-btn-wrp"><button onClick={() => {getVotingData()}}>הצגת תוצאות <i className="fa fa-chevron-left"></i></button></div>
  </>      
  )
}

export default SearchControl;
