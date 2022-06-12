import { types } from 'actions/VoterFilterActions';
// import _ from 'lodash';


export default function (state, action) {
    switch (action.type) {
        case types.LOAD_ELECTION_CAMPAIGNS: {
            let electionCampaigns = { ...state.electionCampaigns };
            electionCampaigns['list'] = _.sortBy(action.data, 'id').reverse();
            return { ...state, electionCampaigns };
        }

		 case types.LOAD_TM_CAMPAIGNS: {
            let tmCampaigns = { ...state.tmCampaigns };
            tmCampaigns['list'] = _.sortBy(action.data, 'id').reverse();
            return { ...state, tmCampaigns };
        }
		
        case types.LOAD_CURRENT_ELECTION_CAMPAIGN: {
            let electionCampaigns = { ...state.electionCampaigns };
            electionCampaigns['current'] = action.data;
            return { ...state, electionCampaigns };
        }

        case types.LOAD_VOTER_FILTER:
        case types.SAVE_VOTER_FILTER_SUCCESS: {
            let voterFilter = action.voterFilter;
            let vfList = { vf: voterFilter, old: voterFilter };
            return { ...state, [action.moduleType]: vfList };
        }

        case types.RESET_FILTER_ITEMS_BY_TYPE: {
            let vf = { ...state[action.moduleType].vf };
            let filterItems = [...vf.filter_items].concat([...action.filterItems]);
            vf = { ...vf, filter_items: filterItems };
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }
        case types.CHANGE_FILTER_ITEMS_BY_TYPE:
        case types.UPDATE_FILTER_ITEMS_BY_TYPE: {
            let vf = { ...state[action.moduleType].vf };
            let actionFilterItems = [...action.filterItems];
            let definitionIds = {};
            //check if the filter is per election campain or per combined definition
            let isFilterPerElectionCampaign = (actionFilterItems.length > 0) ? (actionFilterItems[0].combined_definitions == null) : false;
            
            actionFilterItems.map(function (definition) {
                definitionIds[definition.voter_filter_definition_id] = definitionIds[definition.voter_filter_definition_id] || [];
                definitionIds[definition.voter_filter_definition_id].push(isFilterPerElectionCampaign ? definition.election_campaign_id : definition.combined_definitions);
            });
            var relevantItems = [];

            let filterItems = [...vf.filter_items].filter(function (item) {
                //filter the items to check if the item already exists (there is change for the filter), 
                //so copy it and delete it from the original filters list (to make the change)
                let defId = item.voter_filter_definition_id;
                if (
                    (isFilterPerElectionCampaign && definitionIds.hasOwnProperty(defId) && (definitionIds[defId].indexOf(item.election_campaign_id) > -1)) ||
                    (!isFilterPerElectionCampaign && definitionIds.hasOwnProperty(defId) && (definitionIds[defId].indexOf(item.combined_definitions) > -1))
                ) {
                    relevantItems[defId] = item;
                    return false;
                }
                return true;
            });

            actionFilterItems.map(function (definition) {
                if ((definition.numeric_value != undefined) || definition.string_value || definition.time_value || definition.date_value || definition.values) {
                    filterItems.push({
                        ...relevantItems[definition.voter_filter_definition_id] || {},
                        ...definition
                    });
                }
            });

            vf = { ...vf, filter_items: filterItems };
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }

        case types.GET_VOTER_FILTER_DEFINITIONS: {
            if (!action.data || _.isEmpty(action.data)) {
                return state;
            }
            let modules = { ...state.modules, [action.moduleType]: action.data };
            if (action.moduleType == 'portion')
                modules['target_group'] = action.data;
            return { ...state, modules };
        }

        case types.EXPAND_FILTER_TYPE: {
            let vfList = [...state[action.moduleType]].map(vf => {
                if (vf.vf.key != action.voterFilterKey)
                    return vf;
                let expandedFilterTypes = vf.expandedFilterTypes ? [...vf.expandedFilterTypes] : [];
                if (action.isExpanded)
                    expandedFilterTypes.push(action.filterTypeKey);
                else
                    expandedFilterTypes = expandedFilterTypes.filter(type => { return type != action.filterTypeKey });
                return { ...vf, expandedFilterTypes };
            });
            return { ...state, [action.moduleType]: vfList };
        }

        case types.CHANGE_VOTER_FILTER_NAME: {
            let name = action.voterFilterName;
            let vf = { ...state[action.moduleType].vf };
            vf = { ...vf, name };
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }

        case types.GET_COUNT_VOTERS_BY_VOTER_FILTER: {
            let voters_count = action.countVoters;
            let vf = { ...state[action.moduleType].vf };

            if (vf && vf.key == action.voterFilterKey) {
                vf = { ...vf, voters_count };
            }
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }

        case types.GET_GEO_OPTIONS_INIT:
            return { ...state, geo_options: action.data };

        case types.GET_GEO_OPTIONS:
            let geo_options = { ...state.geo_options };
            _.forEach(action.data, function (value, key) {
                geo_options[key] = value;//_.sortBy(_.unionBy(state.geo_options[key], value, 'id'), ['name']);
            });
            return { ...state, geo_options };

        case types.CHANGE_GEO_ITEM:
        case types.UPDATE_GEO_ITEM: {
            let vf = { ...state[action.moduleType].vf };
			
            let geo_items = _.sortBy(_.unionBy([action.geoItem], vf.geo_items, 'key'), ['created_at', 'id']);
            vf = { ...vf, geo_items };
			 
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }
        case types.ADD_GEO_ITEM: {
            let vf = { ...state[action.moduleType].vf };
            let geo_items = vf.geo_items || [];
            geo_items = [...geo_items, action.geoItem];
            vf = { ...vf, geo_items };
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }

        case types.DELETE_GEO_ITEM: {
            let vf = { ...state[action.moduleType].vf };
            let geo_items = [...vf.geo_items].filter(item => item.key != action.geoItemKey);
            vf = { ...vf, geo_items };
            let moduleType = { ...state[action.moduleType], vf };
            return { ...state, [action.moduleType]: moduleType }
        }

        case types.LOAD_DEFINITION_VALUES: {
            let modules = { ...state.modules };
            let groups = [...modules[action.moduleType]];

            groups = groups.map(group => {
                let newGroup = { ...group };
                newGroup.sub_groups = group.sub_groups.map(subGroup => {
                    let newSubGroup = { ...subGroup };

                    newSubGroup.definitions = subGroup.definitions.map(definition => {
                        let def = { ...definition };
                        let actionValues = action.values || [];
                        if (def.id == action.definitionId ) {
                            if (subGroup.per_election_campaign) {
                                let values = _.isEmpty(def.values) ? {} : { ...def.values };
                                values[action.electionCampaign] = actionValues;
                                def = { ...def, values: values  };
                            } else{
                            //  if (subGroup.combined_definitions) {
                            //     let values = _.isEmpty(def.values) ? {} : { ...def.values };
                            //     values[action.combinedDefinition] = actionValues;
                            //     def = { ...def, values };
                            // } else {
                                def = { ...def, values: actionValues };
                            }
                        }
                        return def;
                    });
                    return newSubGroup;
                });
                return newGroup;
            });

            modules = { ...modules, [action.moduleType]: groups };
            return { ...state, modules };
        }

        case types.RESET_CITY_GEO_ENTITY_TYPES:
            geo_options = { ...state.geo_options };

            geo_options.neighborhood = [];
            geo_options.cluster = [];
            geo_options.ballot_box = [];

            return { ...state, geo_options };

        default:
            return state;
    }
}
