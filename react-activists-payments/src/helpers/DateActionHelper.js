//function that help convert php date for use in react material date piker 
/*
example 
      <TextField style={{width:'203px'}}
                          id="datetime-local"
                          type="datetime-local"
                          onChange={onDatePickerChange.bind(this)}
                          value={transfer_date}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
*/
export function  myDateToDatePiker(dateDb){
    
    //2021-05-11T11:49
    var myDate=dateDb?new Date(dateDb):new Date();
    var dd = String(myDate.getDate()).padStart(2, '0');
    var mm = String(myDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = myDate.getFullYear();
    
    var hours = myDate.getHours();
    var hours=hours.length==1?'0'+hours:hours;
    // current minutes
    var minutes = myDate.getMinutes();
    var minutes=minutes.length==1?'0'+minutes:minutes;

    myDate = yyyy + '-' + mm + '-' + dd+'T'+hours+':'+minutes;
    return myDate;

  }

  export function displayDbDate(dateDb){
      if(dateDb && dateDb!=''){
        var myDate=new Date(dateDb);
        var dd = String(myDate.getDate()).padStart(2, '0');
        var mm = String(myDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = myDate.getFullYear();
        
        var hours = myDate.getHours();
        var hours=hours.length==1?'0'+hours:hours;
        // current minutes
        var minutes = myDate.getMinutes();
        var minutes=minutes.length==1?'0'+minutes:minutes;
        
        myDate = hours+':'+minutes +' ' +dd + '-' + mm + '-' + yyyy;
        return myDate
      }
      else 
      return '';
 
  }

  export function getTime(timeValue, leadingZero = false) {
    let timeElements = timeValue.split(':');
    let hour = timeElements[0];
    let minutes = timeElements[1];

    if ( !leadingZero && hour.indexOf("0") == 0 ) {
        hour = hour.slice(1);
    }

    return (hour + ':' + minutes);
}

