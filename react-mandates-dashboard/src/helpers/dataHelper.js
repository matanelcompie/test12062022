
// this variable 'localData' contains the local data for dashboard.
// if data exist inside, we don't need to call the data from server.


// insert fetched data into localData:
export const insertToLocalData = (type, id, receivedData, localData) => {
  type = type + ""; id = id + "";
  console.log('insert to local data:', ' type: ', type, '. id: ', id);
  // first, check if the key 'type' exists:
  if (localData.hasOwnProperty(type)) {
    let typeName = Object.keys(dataKeyNames).find(key => dataKeyNames[key] === type);
    console.log('type name: ', typeName,)
  } else {
    console.log("WRONG: no such a type (name of place) in localData object.")
    return false;
  }
  // check if data already exists:
  let data = localData[type][id];
  if (data) {
    // data exists.
    console.log('data with this type + id already exist in local!', data[type]);
    return false;
  } else {
    // insert the data:
    localData[type][id] = receivedData;
  }
  return true;
}

// get data from localData:
export const getFromLocalData = (type, id, localData) => {
  type = type + ""; id = id + "";
  console.log('get from local data:', ' type: ', type, '. id: ', id);
  // first, check if the key 'type' exists:
  if (localData.hasOwnProperty(type)) {
    let typeName = Object.keys(dataKeyNames).find(key => dataKeyNames[key] === type);
    console.log('type name: ', typeName,)
  } else {
    console.log("WRONG: no such a type (name of place) in localData object.")
    return false;
  }
  // check if data exists:
  let data = localData[type][id];
  if (data) {
    return localData[type][id];
  } else {
    // data don't exist: 
    console.log('data dont exist:', data)
    return false;
  }
}



// ! data structure:

const dataKeyNames = {
  country:    "-1",
  area:       "0",
  subArea:    "5",
  city:       "1",
  cluster:    "3",
  ballot:     "4",
}

const localData = {
  "-1": {},
  "0":  {},
  "5":  {},
  "1":  {},
  "3":  {},
  "4":  {},
}

//  const localData = {
  // country:{
  // idNum: {list_parties_details:[]}, 
  // },
  // area: {
    // idNum: {list_parties_details:[]}, 
    // idNum: {list_parties_details:[]}, 
    // idNum: {list_parties_details:[]},
    // ... 
  // },
  // subArea: {
     // idNum: {list_parties_details:[]}, 
    // idNum: {list_parties_details:[]}, 
    // idNum: {list_parties_details:[]},
    // ...  
  // },
  // city:{
    // idNum: {list_parties_details:[]}, 
    // idNum: {list_parties_details:[]}, 
    // idNum: {list_parties_details:[]}, 
    // ... 
//   }
// }

