import { getEntityNameEnglish } from './variousHelpers.js';

// this variable 'localData' contains the local data for dashboard.
// if data exist inside, we don't need to call the data from server.
const localData = {
  country:{},
  area: {},
  subArea: {},
  city:{}
}

// insert data into localData:
export const localDataPost = (type, id, receivedData) => {
  console.log('insert data into localData:', localData, 'type: ', type, 'id', id);
  // 
  id = parseInt(id);
  type = parseInt(type);
  let typeName = getEntityNameEnglish(type);
  let data = localData[typeName][id];
  let parent = receivedData.parent_entities_voter_summary;
  let childrens = receivedData.sub_entities_voter_summary;

  if (data && (typeName !== "city")) {
    // data exists & not type = city.
    console.log('data already exist in local!', data);
    return false;
  } else {
    // doesn't exist yet in local.
    // check if sub entities (childrens) array is empty:
    if (childrens.length < 1) {
      console.log('receivedData.sub_entities array is empty.', childrens.length)
    } else {
      // sub entities array is not empty.
      // special check for city situation (cluster/captain100 MODE):
      if (typeName === "city") {
        if (childrens[0].entity_type === 100) {
          if (data && data['dataChildrens']) {
            if (data['dataChildrens']['captain100']) {
              // specific data already exists:
              console.log('data already exist in local [dataChildrens][captain100]!', data['dataChildrens']['captain100']);
              return false;
            } else{
              // other (cluster) specific data exist, insert only captain100 data:
              localData[typeName][id]['dataChildrens']['captain100'] = [...childrens];
            }
          } else {
            // no existing data at all. insert all the new data:
            localData[typeName][id] = {['dataChildrens']: {['captain100']: [...childrens]}, ['dataParent']: {...parent}};
          }
        } else if (childrens[0].entity_type === 3){
          if (data && data['dataChildrens']) {
            if (data['dataChildrens']['cluster']) {
               // specific data already exists:
              console.log('data already exist in local [dataChildrens][cluster]!', data['dataChildrens']['cluster']);
              return false;
            } else{
              // other (captain100) specific data exist, insert only cluster data:
              localData[typeName][id]['dataChildrens']['cluster'] = [...childrens];
            }
          } else {
            // no existing data at all. insert all the new data:
            localData[typeName][id] = {['dataChildrens']: {['cluster']: [...childrens]}, ['dataParent']: {...parent}};
          }
        }       
      } else {
        // it's not city,
        // insert the children:
        localData[typeName][id] = {['dataChildrens']: [...childrens], ['dataParent']: {...parent}};
      } 
    }
  }
 return true;
}

// get data from localData:
export const localDataGet = (type, id, subType = null) => {
  console.log('get data from localData:', localData);
  // 
  id = parseInt(id);
  type = parseInt(type);
  let typeName = getEntityNameEnglish(type);
  let data = localData[typeName][id];

  if (typeName === "city") {
    // its city case, 
    // check if specific sub type (cluster/captain100) exist:
    if (subType === 1) {
      if (data && data.dataChildrens['captain100']) {
        console.log('captain100 -> specific sub type exist!', data)
        return {parent_entities_voter_summary: data.dataParent, sub_entities_voter_summary: data.dataChildrens['captain100']};
      } else {
        // specific sub type doesn't exist yet:
        console.log('captain100 -> specific sub type doesnt exist yet', data)
        return false;
      }
    } else if (subType === 0) {
      if (data && data.dataChildrens['cluster']) {
        console.log('cluster -> specific sub type exist!', data)
        return {parent_entities_voter_summary: data.dataParent, sub_entities_voter_summary: data.dataChildrens['cluster']};
      } else {
        // specific sub type doesn't exist yet:
        console.log('cluster -> specific sub type doesnt exist yet', data)
        return false;
      }
    }
  } else if(data) {
    // its not city case, & data exist:
    let newData = {parent_entities_voter_summary: data.dataParent, sub_entities_voter_summary: data.dataChildrens};
    console.log('its not city case, & data exist, return data', newData)
    return newData;
  }
  // data don't exist: 
  console.log('data dont exist:', data)
  return false;
}


// ! data structure:
//  const localData = {
  // country:{
  // idNum: {dataParent: {}, dataChildrens: {}}, 
  // },
  // area: {
    // idNum: {dataParent: {}, dataChildrens: {}}, 
    // idNum: {dataParent: {}, dataChildrens: {}}, 
    // idNum: {dataParent: {}, dataChildrens: {}},
    // ... 
  // },
  // subArea: {
     // idNum: {dataParent: {}, dataChildrens: {}}, 
    // idNum: {dataParent: {}, dataChildrens: {}}, 
    // idNum: {dataParent: {}, dataChildrens: {}},
    // ...  
  // },
  // city:{
    // idNum: {dataParent: {}, dataChildrens: {cluster: {}, captain100: {}} }, 
    // idNum: {dataParent: {}, dataChildrens: {cluster: {}, captain100: {}} }, 
    // idNum: {dataParent: {}, dataChildrens: {cluster: {}, captain100: {}} }, 
    // ... 
//   }
// }

