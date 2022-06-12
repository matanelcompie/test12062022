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

  export function displayDbDate(dateDb,hour=true,tag=null){
    if(!tag)
    tag='-'
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
        myDate=dd + tag + mm + tag + yyyy;
        if(hour)
        myDate = hours+':'+minutes +' ' +myDate;
        return myDate
      }
      else 
      return '';
 
  }

  export function myStringDate(dateDb,withHour=true){
    var myDate=dateDb?new Date(dateDb):new Date();
    var dd = String(myDate.getDate()).padStart(2, '0');
    var mm = String(myDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = myDate.getFullYear();
    
    var hours = myDate.getHours();
    var hours=hours.length==1?'0'+hours:hours;
    // current minutes
    var minutes = myDate.getMinutes();
    var minutes=minutes.length==1?'0'+minutes:minutes;

    myDate = yyyy + '-' + mm + '-' + dd
    if(withHour)
    myDate+=' '+hours+':'+minutes;
    return myDate;
  }
  

  export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  export function convertDD_MM_YYYYTo_YYYY_MM_DD(dateString){
    var dateParts = dateString.split("/");
    return ""+dateParts[2]+"/"+ dateParts[1]+"/"+dateParts[0]+""
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

export function getListDays() {
  return [
    { id: 1, name: "ראשון" },
    { id: 2, name: "שני" },
    { id: 3, name: "שלישי" },
    { id: 4, name: "רביעי" },
    { id: 5, name: "חמישי" },
    { id: 6, name: "שישי" },
  ];
}