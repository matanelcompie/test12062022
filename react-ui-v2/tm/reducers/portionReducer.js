import { types } from 'tm/actions/portionActions';
import { types as voterFilterTypes } from 'actions/VoterFilterActions';

const initialState = {
  list: [],
  loadedPortions: false,
  targetGroup: {},
  isEditPortionsOrderMode: false,
  editedPortions: [],
  openPortionModalKey: null,
  isOpenNewPortionModal: false,
  isValidPortions: false,
  isEditedPortionChanged: false,
  isCalculatingCount: false,
  portionsListForCaculation: [],
  portionGampaignList: [], //for select portion modal
  portionsInCalculatingMode: {},
}

export default function (state = initialState, action) {
  switch (action.type) {
    case types.GET_ALL_PORTIONS_SUCCESS:
      return { ...state, list: action.data };

    case types.GET_TARGET_GROUP_SUCCESS:
      return { ...state, targetGroup: action.data };

    case types.SAVE_BASIC_PORTION_SUCCESS: {
      let portions = [...state.list].map(portion => {
        return portion.key == action.data.key ? action.data : portion;
      });
      return { ...state, list: portions };
    }

    case types.DELETE_PORTION_SUCCESS: {
      let portions = state.list.filter(portion => {
        return portion.key != action.portionKey;
      });
      return { ...state, list: portions };
    }

    case types.ON_EDIT_PORTIONS_ORDER_CLICK:
      return {
        ...state,
        isEditPortionsOrderMode: true,
        editedPortions: state.list,
      };

    case types.ON_EDIT_PORTIONS_ORDER_CANCEL:
      return {
        ...state,
        isEditPortionsOrderMode: false,
        editedPortions: [],
      };
    case types.SAVE_PORTION_LIST_SUCCESS:
      return {
        ...state,
        isEditPortionsOrderMode: false,
        list: action.data,
      };

    case types.ON_PORTIONS_REORDER:
      return { ...state, editedPortions: action.data };

    case types.ON_OPEN_PORTION_MODAL_CLICK:
      let portionKey = action.portionKey ? action.portionKey : null;
      return { ...state, openPortionModalKey: portionKey, isOpenNewPortionModal: action.isNew };

    case types.ON_CLOSE_PORTION_MODAL_CLICK:
      return { ...state, openPortionModalKey: null, isOpenNewPortionModal: false };

    case types.SET_CAMPAIGN_PORTIONS_LIST:
      var newState = { ...state };
      let portionList = action.data;
      newState.portionGampaignList = portionList;
      return newState;
    case types.SET_CAMPAIGN_PORTIONS_FIELD:
      var newState = { ...state };
      newState[action.fieldName] = [action.fieldValue];
      return newState;
    case voterFilterTypes.UPDATE_FILTER_ITEMS_BY_TYPE:
      if (action.moduleType == 'target_group') {
        let filter_items = { ...state.targetGroup.filter_items, ...action.filterItemsByType };
        let targetGroup = { ...state.targetGroup, filter_items };
        return { ...state, targetGroup };
      }
      else if (action.moduleType == 'portion') {
        let portions = [...state.list].map(portion => {
          if (portion.key == action.voterFilterKey) {
            let filter_items = { ...portion.filter_items, ...action.filterItemsByType };
            portion = { ...portion, filter_items };
          }
          return portion;
        });
        return { ...state, list: portions };
      }
      else {
        return state;
      }

    case voterFilterTypes.SAVE_VOTER_FILTER_SUCCESS: {
      if (action.moduleType == 'target_group') {
        return { ...state, targetGroup: { ...action.voterFilter, countVoters: state.targetGroup.countVoters } };
      }
      else if (action.moduleType == 'portion') {
        let newState = { ...state };
        let portions = [...state.list];
        if (action.isNew) {
          portions.push(action.voterFilter);
          newState.openPortionModalKey = action.voterFilter.key;
          newState.isOpenNewPortionModal = false;
        }
        else {
          portions = portions.map(portion => {
            return portion.key == action.voterFilter.key ? {
              ...action.voterFilter,
              countVoters: portion.countVoters
            } : portion;
          });
        }
        newState.list = portions
        return newState;
      }
      else {
        return state;
      }
    }

    case voterFilterTypes.GET_COUNT_VOTERS_BY_VOTER_FILTER: {
      if (action.moduleType == 'target_group') {
        let targetGroup = { ...state.targetGroup, countVoters: action.countVoters };
        return { ...state, targetGroup };
      } else if (action.moduleType == 'portion') {
        let portions = [...state.list].map(portion => {
          return portion.key == action.voterFilterKey ? {
            ...portion,
            countVoters: action.countVoters
          } : portion;
        });
        return { ...state, list: portions };
      } else {
        return state;
      }
    }

    case voterFilterTypes.UPDATE_GEO_ITEM:
      if (action.moduleType == 'target_group') {
        let geo_items = _.sortBy(_.unionBy([action.geoItem], state.targetGroup.geo_items, 'key'), ['created_at', 'id']);
        let targetGroup = { ...state.targetGroup, geo_items };
        return { ...state, targetGroup };
      }
      else if (action.moduleType == 'portion') {
        let portions = [...state.list].map(portion => {
          if (portion.key == action.voterFilterKey) {
            let geo_items = _.sortBy(_.unionBy([action.geoItem], portion.geo_items, 'key'), ['created_at', 'id']);
            portion = { ...portion, geo_items };
          }
          return portion;
        });
        return { ...state, list: portions };
      }
      else {
        return state;
      }

    case voterFilterTypes.ADD_GEO_ITEM:
      if (action.moduleType == 'target_group') {
        let geo_items = state.targetGroup.geo_items || [];
        geo_items = [...geo_items, action.geoItem];
        let targetGroup = { ...state.targetGroup, geo_items };
        return { ...state, targetGroup };
      }
      else if (action.moduleType == 'portion') {
        let portions = [...state.list].map(portion => {
          if (portion.key == action.voterFilterKey) {
            let geo_items = portion.geo_items || [];
            geo_items = [...geo_items, action.geoItem];
            portion = { ...portion, geo_items };
          }
          return portion;
        });
        return { ...state, list: portions };
      }
      else {
        return state;
      }

    case voterFilterTypes.DELETE_GEO_ITEM:
      if (action.moduleType == 'target_group') {
        let geo_items = _.reject(state.targetGroup.geo_items, ['key', action.geoItemKey]);
        let targetGroup = { ...state.targetGroup, geo_items };
        return { ...state, targetGroup };
      }
      else if (action.moduleType == 'portion') {
        let portions = [...state.list].map(portion => {
          if (portion.key == action.voterFilterKey) {
            let geo_items = _.reject(portion.geo_items, ['key', action.geoItemKey]);
            portion = { ...portion, geo_items };
          }
          return portion;
        });
        return { ...state, list: portions };
      }
      else {
        return state;
      }
    case types.SET_PORTION_CHANGE_STATUS: {
      var newState = { ...state };
      newState.isEditedPortionChanged = action.isEditedPortionChanged;
      return newState;
    }
    case types.SET_CACULATE_VOTERS_COUNT_STATUS: {
      var newState = { ...state };
      newState.isCalculatingCount = action.isCalculatingCount;
      return newState;
    }
    case types.SET_PORTION_VOTERS_ACTIVE: {
      var newState = { ...state };
      newState.list = [...newState.list];
      for (let i = 0; i < newState.list.length; i++) {
        if (newState.list[i].key == action.voterFilterKey) {
          newState.list[i] = { ...newState.list[i] }
          newState.list[i].active = action.active;
          break;
        }
      };
      return newState;
    }
    case types.SET_PORTION_VOTERS_COUNT: {
      console.log('set portion voters count');
      var newState = { ...state };
      let portionList1 = [...newState.list];
      portionList1.map(function (filter, i) {
        if (filter.key == action.voterFilterKey) {
          let newFilter = { ...filter };
          if (action.unique) {
            newFilter.unique_voters_count = action.votersCount;
          } else {
            newFilter.voters_count = action.votersCount;
          }
          portionList1[i] = newFilter;
        }
      });
      newState.list = portionList1;
      newState.portionsInCalculatingMode = { ...newState.portionsInCalculatingMode };
      if (newState.portionsInCalculatingMode[action.voterFilterKey]) {
        let prop = action.unique ? 'unique_voters_count' : 'voters_count';
        newState.portionsInCalculatingMode[action.voterFilterKey][prop] = false;
        newState.portionsInCalculatingMode[action.voterFilterKey][prop] = false;
      }
      return newState;
    }

    case types.UPDATE_PORTIONS_LIST_FOR_CALCULATION: {
      var newState = { ...state };
      let portionsListForCaculation = [...newState.portionsListForCaculation]
      action.affectedPortions.forEach(function (portion) {
        let toAddAffectedPortion = true;
        for (let i = 0; i < portionsListForCaculation.length; i++) {
          if (portionsListForCaculation[i].voterFilterKey == portion.voterFilterKey
            && portionsListForCaculation[i].unique == portion.unique) {
            toAddAffectedPortion = false; break;
          }
        }
        if (toAddAffectedPortion) { portionsListForCaculation.push(portion) }
      });
      let portionsInCalculatingMode = { ...newState.portionsInCalculatingMode };

      portionsListForCaculation.forEach(function (portion) {
        let voterFilterKey = portion.voterFilterKey;
        if (!portionsInCalculatingMode[voterFilterKey]) { portionsInCalculatingMode[voterFilterKey] = {}; }
        let prop = portion.unique ? 'unique_voters_count' : 'voters_count';
        portionsInCalculatingMode[voterFilterKey][prop] = true;
      });
      newState.portionsInCalculatingMode = portionsInCalculatingMode;

      newState.portionsListForCaculation = portionsListForCaculation;

      return newState;
    }

    case types.REMOVE_PORTION_FROM_CALCULATION_LIST: {
      var newState = { ...state };

      let newList = [...newState.portionsListForCaculation].filter(
        portion => { return (portion.voterFilterKey == action.voterFilterKey && portion.unique == action.unique) ? false : true; }
      );
      newState.portionsListForCaculation = [...newList];
      return newState;
    }

    case types.RESET_PORTION_CALCULATION_LIST: {
      var newState = { ...state };
      newState.portionsListForCaculation = [];
      newState.portionsInCalculatingMode = {};
      return newState;
    }

    default:
      return state;
  }
}
