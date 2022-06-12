import React from 'react';
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import { Multiselect } from 'multiselect-react-dropdown';

const SearchControl = (props) => {

  const {
    setIsShowAll, 
    isShowAll, 
    multiselectRef, 
    options,
    setChildrensSelected,
    isCaptain100Mode,
    setIsCaptain100Mode
  } = props.data;
  
  const onSelect = (selectedList, selectedItem) => {
    setChildrensSelected([...selectedList]);
  }

  const onRemove = (selectedList, removedItem) => {
    setChildrensSelected([...selectedList]);
  }

  return (
    <>
    <div className="mode-text">{isCaptain100Mode ? "תצוגת שרי מאה" : "תצוגת אשכולות"}</div> 
    <div className="search-switch-wrp">
      <div className="control-item display-options">
        <RadioGroup 
          row 
          aria-label="position" 
          name="position" 
          defaultValue="all" 
          onChange={() => setIsShowAll(!isShowAll)}
        >
          <FormControlLabel
            value="all"
            control={<Radio color="primary" />}
            label="הצג הכל"
            labelPlacement="end"
            checked={isShowAll}
          />
          <FormControlLabel
            value="select"
            control={<Radio color="primary" />}
            label="הצג בחירה"
            labelPlacement="end"
            checked={!isShowAll}
          />
        </RadioGroup>
      </div>
      <div className="control-item select-wrp">
        <div className={isShowAll ? "hide-select" : ""}></div>
        <Multiselect
          ref={multiselectRef}
          options={options}
          onSelect={onSelect} // Function will trigger on select event
          onRemove={onRemove}
          displayValue="name"
          showCheckbox={true}
          closeOnSelect={false}
          hidePlaceholder={true}
          emptyRecordMsg="לא נמצאו רשומות"
          placeholder={isShowAll ? "" : "לחצו לפתיחת רשימה / הקלידו שם כאן"}
          closeIcon="close"
        />       
      </div>
      <>
        {/* switcher between cluster to captain100 */}
        <div className="control-item mode-switcher-wrapper" title="החלפה בין תצוגת שר מאה לתצוגת אשכולות">
          <div className="text">בחירת סוג תצוגה</div>
          <div className="chkbx-wrp header-dark-switch">
            <span className={`aprv-msg ${ isCaptain100Mode && "darkMode-text-white"}`}>
              {isCaptain100Mode ? "שרי מאה" : "אשכולות"}
            </span>
            <div className="checkbox">
              <label className="switch">
                <input 
                type="checkbox" 
                checked={isCaptain100Mode} 
                value={isCaptain100Mode}
                onChange={() => setIsCaptain100Mode(!isCaptain100Mode)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </>
    </div>
    </>      
  )
}

export default SearchControl;
