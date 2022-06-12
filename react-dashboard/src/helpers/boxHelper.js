import { getEntityName } from './variousHelpers.js';

// this function is only to reduce line of code and mess.
// it makes all the necessary preparation/checks and return useful properties:
const boxHelper = (type, state, permissionLevel) => {

  let entity_type = state.entity_type;
  let entity_id = state.entity_id;
  let parent_entity_type = state.parent_entity_type;
  let parent_entity_id = state.parent_entity_id;
  let classType, pieSizeWrp, pieSizeWrpSummary, isNavigate, navigateToText, navigateTo;

  // console.log('type, entity_type,permissionLevel.currentEntityType', type, entity_type, permissionLevel.currentEntityType);

  // create another type, named LAST:
  if (getEntityName(entity_type) == "אשכול" || getEntityName(entity_type) == "שר מאה" ) {
    type = "LAST";
  } 
  
  switch (type) {
    case "MAIN":
      pieSizeWrp = "140px";
      pieSizeWrpSummary = "150px";
      navigateToText = "למעלה ל" + getEntityName(state.parent_entity_type);
      classType = "CLASS-TYPE-MAIN";
      // check if can go up in the tree:
      if (entity_type == permissionLevel.currentEntityType || getEntityName(entity_type) == "ארצי") {
        // the current level of MAIN is already 'ארצי', 
        // or we reached the top of permission level in tree:
        isNavigate = false;
      } else {
        isNavigate = true;
      }
      if (isNavigate) {
        navigateTo = {type: parent_entity_type, id: parent_entity_id};
      }
      // console.log('in MAIN boxHelper ->', navigateTo, isNavigate );
      break;
    case "SUB":
      pieSizeWrp = "130px";
      pieSizeWrpSummary = "140px";
      navigateToText = "כניסה לפירוט";
      classType = "CLASS-TYPE-SUB";
      // if is SUB always can navigate:
      isNavigate = true;
      navigateTo = {type: entity_type, id: entity_id};
      break;
    case "LAST":
      pieSizeWrp = "100px";
      pieSizeWrpSummary = "105px";
      navigateToText = null;
      navigateTo = null;
      classType = "CLASS-TYPE-LAST";
      // if is LAST always can't navigate:
      isNavigate = false;
      navigateTo = null;
      break; 
    default:break;
  }
  // {console.log('classType, pieSizeWrp, isNavigate, navigateToText, navigateTo', classType, pieSizeWrp, isNavigate, navigateToText, navigateTo)}
  return {classType, pieSizeWrp, pieSizeWrpSummary, navigateToText, isNavigate, navigateTo};
}

export default boxHelper;
