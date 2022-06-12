
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

export const getPieNumbers = (specific, allVoters) => {
  let resultSpecific = (specific * allVoters) / 100;
  let resultAllVoters = allVoters - resultSpecific;
  return {resultSpecific, resultAllVoters};
}

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
} 

export const formatNumberAfterPoint = (num, afterPointPlaces = 0) => {
  return Number.parseFloat(num).toFixed(afterPointPlaces);
}

export const convertArrayToObject = (array, nameFieldKey) => {
  let object;
  array.forEach(element => {
    object[element[nameFieldKey]] = element;
  });
  return array;
}

export const joinEntities = (entitiesDetails, ballotList = null) => {

  let firstEntity = entitiesDetails[0];
  let isBallotEntity = (Number(firstEntity.entity_type) === 4);
 
  // let reportSourceName = firstEntity.report_source_name;

  // get the first entity as a pattern to get the joined data:
  let newTempArray = firstEntity.list_parties_details;
  let partiesArray = [];

  newTempArray.forEach((item) =>{
    partiesArray.push({...item})
  })

  let currentElement;
  // loop through entitiesArray, for each entity:
  for (let entitiesIndex = 0; entitiesIndex < entitiesDetails.length; entitiesIndex++) {
    // for each entity (place) loop through the parties end get the correct data:
    partiesArray.forEach((item, index) => {
      // get the specific party data of the current entity:
      currentElement = entitiesDetails[entitiesIndex].list_parties_details.find(element => element.key === item.key);
      if (entitiesIndex === 0) {
        partiesArray[index].count_voted_party     = currentElement.count_voted_party;
        partiesArray[index].party_statistic       = currentElement.party_statistic;
        partiesArray[index].percent_votes_party   = currentElement.percent_votes_party;
      } else {
        // collect the data:
        partiesArray[index].count_voted_party     = item.count_voted_party + currentElement.count_voted_party;
        partiesArray[index].party_statistic       = item.party_statistic + currentElement.party_statistic;
        partiesArray[index].percent_votes_party   = item.percent_votes_party + currentElement.percent_votes_party;
      }

      if (isBallotEntity) {
        // when ballot, check if there is other result of counts:
        if (currentElement.another_report_source.length > 0) {
          currentElement.another_report_source.forEach((anotherSourceItem) => {
            if (anotherSourceItem.count_voted_party !== currentElement.count_voted_party) {
              // found a count that doesnt match the current count.
              partiesArray[index]['have_conflict'] = true;
              if ( ! partiesArray[index].hasOwnProperty('conflicts_array')) {
                // there is no such a property 'conflicts_array' yet, create it:
                partiesArray[index]['conflicts_array'] = [];
              }
              partiesArray[index]['conflicts_array'].push({
                ballot_name:          getBallotNameById(entitiesDetails[entitiesIndex].entity_values, ballotList),
                current_source_name:  entitiesDetails[entitiesIndex].report_source_name, 
                current_source_count: currentElement.count_voted_party,
                other_source_name:    anotherSourceItem.report_source_name,
                other_source_count:   anotherSourceItem.count_voted_party,
              });
            }
          })
        }
      }
    })
  }
  return partiesArray;
}

const getBallotNameById = (ballotId, ballotList) => {
  if (ballotList.length > 0) {
    let currentEntity = ballotList.find(element => element.id === ballotId);
    if (currentEntity && currentEntity.name) {
      return currentEntity.name;
    }
  } 
  return "לא נמצא שם קלפי"
}
