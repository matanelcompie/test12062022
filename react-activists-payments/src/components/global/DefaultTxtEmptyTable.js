import React from 'react';
import SearchIcon from '@material-ui/icons/Search';

export default function DefaultTxtEmptyTable(props) {
    const title='לא הוגדרו שדות חיפוש';
  return (
      <div style={{textAlign:'center','color':'#bbb9b9'}}>{props.title?props.title:title} <SearchIcon></SearchIcon></div>
  );
}
