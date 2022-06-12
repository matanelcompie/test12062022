
export const getPieColor = (dashboardType, reached, goal) => {
  let gap = goal - reached;

  if (dashboardType === "DETAILED") {
    // if gap is greater then 30 -> red.
    // if gap is between 11 to 30 -> yellow.
    // if gap is between 10 to 0 -> green.
    // if gap is smaller (-1...) then 0 -> blue.
    switch (true) {
      case gap>30:            return "#f35656";  // (red)
      case gap>10 && gap<31:   return "#ffd452";   // (yellow)
      case gap>-1 && gap<11:   return "#29ce4f";   // (green)
      case gap<0:             return "#429dff";   // (blue)
      default:                return "#2AB4C0";   // (default is some turquoise)
    }
  } else {
    switch (true) {
      case gap>70:            return "#f35656";  // (red)
      case gap>40 && gap<71:   return "#ffd452";   // (yellow)
      case gap>10 && gap<41:   return "#29ce4f";   // (green)
      case gap<11:             return "#429dff";   // (blue)
      default:                return "#2AB4C0";   // (default is some turquoise)
    }
  }
 
}

export const getEntityName = (entityType) => {
  entityType = parseInt(entityType);
  switch (entityType) {
    case -1:
      return "ארצי";
    case 0:
      return "אזור";
    case 5:
      return "תת אזור";
    case 1:
      return "עיר";
    case 3:
      return "אשכול";
    case 100:
      return "שר מאה";
    default:
      return null;
  }
}

export const getEntityNameEnglish = (entityType) => {
  entityType = parseInt(entityType);
  switch (entityType) {
    case -1:
      return "country";
    case 0:
      return "area";
    case 5:
      return "subArea";
    case 1:
      return "city";
    case 3:
      return "cluster";
    case 100:
      return "captain100";
    default:
      return null;
  }
}

export const objectIsNotEmpty = (currentObject) => {
   if(Object.keys(currentObject).length === 0){
      //  oops, object is empty :(
     return false;
    }else{
      // object is not empty!
      return true;
    }
}

export const calculateAvrg = (num1, num2, num3) => {
  // calculate average: 
  let sum = + num1 + num2 + num3;
  let divide = sum / 3;
  let result = parseInt(Number.parseFloat(divide).toFixed(0));
  return result;
}
export const sumNums = (numArray) => {
  let result = 0;
  numArray.forEach(element => {
    result += parseInt(element);
  });
  return result;
}

export const getPieNumbers = (specific, allVoters) => {
  let resultSpecific = (specific * allVoters) / 100;
  let resultAllVoters = allVoters - resultSpecific;

  return {resultSpecific, resultAllVoters};
}

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
} 

export const getPieData = (dashboardType, state, isName, average = null) => {

  if (isName) {
    // create pie names
    let pieNames = {
      first:  dashboardType === "DETAILED" ? "תומכים" : "טופלו", 
      second: dashboardType === "DETAILED" ? "ניידים" : "תומכים",
      third:  dashboardType === "DETAILED" ? "כתובות" : "מהססים",
      fourth: dashboardType === "DETAILED" ? "נוספים" : "לא תומכים",
      fifth:  dashboardType === "DETAILED" ? "סיכום" : "ניידים ",
      sixth:  dashboardType === "DETAILED" ? "" : "כתובות ",
    };
    return pieNames;
  } else {
    // get the score numbers:
    let pieCount = {
      first:  dashboardType === "DETAILED" ? state.present_support_voter : state.present_don_voter ,
      second: dashboardType === "DETAILED" ? state.presents_mobile_phone_verified : state.present_support_voter ,
      third:  dashboardType === "DETAILED" ? state.present_actual_address : state.present_undecided_voter ,
      fourth: dashboardType === "DETAILED" ? state.presents_voter_present_other_details : state.present_opposed_voter ,
      fifth:  dashboardType === "DETAILED" ? average : state.presents_mobile_phone_verified ,
      sixth:  dashboardType === "DETAILED" ? null : state.present_actual_address ,
    }
    return pieCount;
  }
  
}
