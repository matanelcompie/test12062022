import React, {useContext, useState, useEffect} from 'react';

import { numberWithCommas, objectIsNotEmpty, joinEntities } from '../helpers/variousHelpers.js';
import { displayContext } from '../context/displayContext.jsx';

const chartsColors = {
  1:{color:{color: 'rgb(42, 180, 192)'}, order:1},
  2:{color:{color: 'rgb(243, 86, 86)'}, order:2},
  3:{color:{color: 'rgb(66, 157, 255)'}, order:3},
  4:{color:{color: 'rgb(41, 206, 79)'}, order:4},
  5:{color:{color: 'rgb(212, 5, 156)'}, order:5},
  6:{color:{color: 'rgb(255, 212, 82)'}, order:6},
  7:{color:{color: 'rgb(160, 142, 190)'}, order:7},
  8:{color:{color: 'rgb(44, 92, 144)'}, order:8},
  9:{color:{color: 'rgb(31, 134, 54)'}, order:9},
  10:{color:{color: 'rgb(144, 31, 113)'}, order:10},
  11:{color:{color: 'rgb(150, 126, 56)'}, order:11},
  12:{color:{color: 'rgb(171, 169, 169)'}, order:12},
};

const sortTempData = (tempData) => { 
  // pop out the shas item
  let shasItem = tempData.find(item => item.is_shas == 1);
  let newTempData = tempData.filter(item => item.is_shas == 0);
  
  // sort the rest by voters
  let sorted = sortByVoterCount(newTempData);
  // insert shas in the first place
  sorted.unshift(shasItem);
  // loop and add the new order
  let i = 1;
  sorted.forEach((item, index, array) => {
    array[index]['order'] = i;
    if (i > 9) {
      array[index]['color'] = chartsColors[12].color.color;
    } else {
      array[index]['color'] = chartsColors[i].color.color;
    }
    i++;
  });
  return sorted;
} 

const sortByVoterCount = (newTempData) => {
  let sortedArray =  newTempData.sort(function(a, b){
    let x = a.count_voted_party;
    let y = b.count_voted_party;
    if (x < y) {return 1;}
    if (x > y) {return -1;}
    return 0;
  });
  return sortedArray;
}

const tableHeader = (type, isComparison, place1 = null, place2 = null) => {
    if (isComparison) {
      return (
        <div className="table-item table-header">
          <div className="line-one-table">
            <div className="empty-compare"></div>
            <div className="first-compare">{place1}</div>
            <div className="second-compare">{place2}</div>
          </div>
          <div className="line-two-table">
            <div className="table-cell cell-name">שם המפלגה</div>
            <div className="table-cell">מצביעים</div>
            <div className="table-cell">אחוז מסה"כ</div>
            <div className="table-cell second-compare scnd-cmpr-right">מצביעים</div>
            <div className="table-cell second-compare">אחוז מסה"כ</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={`table-item table-header`} >
          <div className="table-cell cell-name">שם המפלגה</div>
          <div className="table-cell">כמות קולות</div>
          <div className="table-cell">אחוז מסך הכל</div>
          {(type === "MAIN") &&<div className="table-cell">הערכת מנדטים</div>}
        </div>
      );
    }
}

const checkIsComparison = (display, type) => {
  if ( type === "AREA") {
    if (display.isComparisonArea) {
      return true;
    }
    return false;
  } else if (type === "CITY") {
    if (display.isComparisonCity) {
      return true;
    }
    return false;
  }
}

const TableData = (props) => {

  const {type, data} = props;
  const [tableData, setTableData] = useState();
  const [showConflict, setShowConflict] = useState(false);
  const {display, setDisplay} = useContext(displayContext);
  let isComparison = checkIsComparison(display, type);

  useEffect(() => {
    console.log('in table data component. type is: ', type)
    if (data && objectIsNotEmpty(data)) {
      if(type === "MAIN"){
        setDisplay(prev => ({...prev, currentScreenDisplayed: {type:-1, id:[1]}, currentTab: type}));
        // data received on mount of TabsWrapper component:
        setTableData(sortTempData(data.entities_details[0].list_parties_details));
      } else {  
        // delete the old saved entity type from context:
        
        // data received after search in searchControl component:
        let newArray = joinEntities(data.entities_details, display.ballotList);
        setTableData(sortTempData(newArray));
      }
    } else {
      // there is no *data* to display yet.
      if (type !== "MAIN") {
        // delete the old saved entity type from context:
        // setDisplay(prev => ({...prev, currentScreenDisplayed: {type:null, id:[]}, currentTab: type}));
      }
    }
  }, [data]);

  useEffect(() => {
    setDisplay(prev => ({...prev, currentDataDisplayed: {regular:tableData}}));
  }, [tableData])

  return (
    <div>
      <div className={`table-content  ${(type === "MAIN") ? "is-main-tab" : "is-regular-tab"} ${isComparison ? "is-comparison-tab" : "not-comparison-tab" }`}>
        {/*  table header:  */}
        {tableHeader(type, isComparison, "צפת", "מבוא חורון")}
        {/*  table content:  */}
        {tableData && objectIsNotEmpty(tableData) && tableData.map((item, i) => {
          return (
          <div key={i} >
            <div 
              className={`table-item regular-item ${item.order === 1 ? "is-shas" : ""}`} 
              style={{
                backgroundColor: `${(display.isPartyHover === item.order) ? ((item.color).replace(/,/g,'').slice(0, -1) + " / 7%)") : ""}`,
              }}
              onMouseEnter={() => {
                setDisplay(prev => ({...prev, isPartyHover: item.order}));
              }}
              onMouseLeave={() => {
                setDisplay(prev => ({...prev, isPartyHover: null}));
              }}
            >
              <div 
                className={`table-cell cell-name`} 
                style={{ borderRight: `${(display.isPartyHover === item.order) ? "12" : "7"}px solid ${item.color}`,  }}
              >
                {item.name}
              </div>
              <div className="table-cell">{numberWithCommas(item.count_voted_party)}</div>
              <div className="table-cell conflict">
                {item.percent_votes_party} 
                {item.have_conflict && <span title={showConflict ? "סגירה" : "לחיצה לפירוט"} onClick={() => setShowConflict(!showConflict)} >{showConflict ? "x" : "!"}</span> }
                { 
                  (showConflict && item.conflicts_array && item.conflicts_array.length > 0) &&
                  // item.conflicts_array && item.conflicts_array.length > 0 &&
                  <div className="conflict-popup" >
                    {
                      item.conflicts_array.map((conflictItem) => {
                        return (
                          <div>
                            בקלפי 
                            &nbsp;
                            {conflictItem.ballot_name}
                            &nbsp;
                            המידע מוצג מ 
                            המידע מוצג מ 
                            {/* &nbsp; */}
                            {conflictItem.current_source_name}
                            &nbsp;
                            עם נתון:
                            &nbsp;
                            {conflictItem.current_source_count}
                            &nbsp;
                            קיים מידע סותר מ 
                            {/* &nbsp; */}
                            {conflictItem.other_source_name}
                            &nbsp;
                            עם נתון: 
                            &nbsp;
                            {conflictItem.other_source_count}
                            {/* &nbsp; */}
                          </div>
                        )
                      })
                    }
                  </div> 
                }
              </div>
              {
               isComparison &&
               <>
                <div className="table-cell second-compare scnd-cmpr-right">{numberWithCommas(item.count_voted_party)}</div>
                <div className="table-cell second-compare">{item.percent_votes_party} </div>
               </>
              }
              {(type === "MAIN") && <div className="table-cell">{item.mandates}</div>}
            </div>
            {(item.order === 1) && 
              <div className="shas-expect table-item regular-item is-shas">
                <div></div>
                <div className="shas-special-line">
                 קולות ש"ס מבחירות קודמות:
                  <span className="expect-number">{`   ${item.party_statistic}`}</span>
                  תומכים סופי:
                  <span className="expect-number">{`   ${data.sum_final_supporters_entity}`}</span>
                </div> 
              </div>
            }
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default TableData;
