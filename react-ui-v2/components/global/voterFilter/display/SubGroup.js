import React from 'react';
import { connect } from 'react-redux';

import FilterField from './FilterField';
import ElectionCampaign from './ElectionCampaign';
import * as voterFilterActions from 'actions/VoterFilterActions';

class SubGroup extends React.Component {
    constructor(props) {
        super(props);
        this.addCombinedDefinitionsLabel = "הוסף";
        this.removeCombinedSetLabel = "הסר";
        this.dependencies = {};

        this.state = {
            combinedSets: [],
            subGroupItems: {},
            addNewCombinedSetEnabled: true
        };
        this.subGroupsDefIds = [];
        this.tempCombinedSetId = 0;
    }

    componentDidMount() {
        this.setSubGroupsDefinitionIds();
        this.setCombinedSets();
        this.addDependency();
        this.mapItemsPerCombinedSet();
    }

    componentDidUpdate() {
        this.mapItemsPerCombinedSet();
    }

    setSubGroupsDefinitionIds() {
        this.props.subGroup.definitions.map(definition =>
            this.subGroupsDefIds.push(definition.id)
        );
    }

    addDependency() {
        this.props.subGroup.definitions.map(definition => {
            let target = definition.model_list_dependency_id;
            let filterDependencies = target ? target.split(',') : [];

            if (filterDependencies.length > 0) {
                filterDependencies.map(definitionId => {
                    if (!this.dependencies[definitionId]) {
                        this.dependencies[definitionId] = [];
                    }
                    if (this.dependencies[definitionId].indexOf(definition.id) == -1) {
                        this.dependencies[definitionId].push(definition.id);
                    }
                });
            }
        });
    }

    //set the combined sets options to display the subgroup duplications acording to these sets.
    setCombinedSets() {
        let combinedSets = [];
        this.props.filterItems.map(item => {
            if ((this.subGroupsDefIds.indexOf(item.voter_filter_definition_id) > -1) && (combinedSets.indexOf(item.combined_definitions) == -1)) {
                combinedSets.push(item.combined_definitions);
            }
        });

        if (combinedSets.length == 0) {
            let tempCombinedSetId = this.props.subGroup.combined_definitions ? this.tempCombinedSetId : null;
            combinedSets.push(tempCombinedSetId);
            this.setState({ addNewCombinedSetEnabled: false });
        }

        combinedSets = combinedSets.sort();
        this.tempCombinedSetId = combinedSets[combinedSets.length - 1];
        this.setState({ combinedSets });
    }

    mapItemsPerCombinedSet() {
        let subGroupItems = {};
        this.props.filterItems.map(item => {
            if (this.subGroupsDefIds.indexOf(item.voter_filter_definition_id) > -1) {
                let combinedDefinition = item.combined_definitions;
                if (!subGroupItems[combinedDefinition]) {
                    subGroupItems[combinedDefinition] = [];
                }
                subGroupItems[combinedDefinition][item.voter_filter_definition_id] = item;
            }
        });

        if (!_.isEqual(this.state.subGroupItems, subGroupItems)) {
            this.setState({ subGroupItems });
        }
    }

    loadDependencyValues(combinedDefinition, definitionId) {
        //if there is selected values for dependency filters, load the filter items
        let dependantIds = this.dependencies[definitionId];
        let items = this.state.subGroupItems[combinedDefinition] || {};

        if (dependantIds.length && !_.isEmpty(items)) {
            dependantIds.map(dependantId => {
                let value = items[dependantId] ? items[dependantId].values : [];
                if (value && value.length > 0) {
                    let values = {};
                    values[dependantId] = value;
                    voterFilterActions.loadDefinitionValues(this.props.dispatch, this.props.moduleType, definitionId, values, false, combinedDefinition);
                }
            });
        }
    }

    addCombinedSetSection() {
        let combinedSets = this.state.combinedSets;
        let items = this.state.subGroupItems[combinedSets[combinedSets.length - 1]] || [];

        //if there is values selected in the last combined set, add new set ...
        if (items.length) {
            this.tempCombinedSetId++;
            combinedSets.push(this.tempCombinedSetId);
            this.setState({ combinedSets });
        }
        this.setState({ addNewCombinedSetEnabled: false });
    }

    deleteCombinedSetSection(index, items) {
        let combinedSets = this.state.combinedSets;
        combinedSets.splice(index, 1)
        this.setState({ combinedSets });
        let filterItems = [];

        items.map(item =>
            filterItems.push({ ...item, numeric_value: null, string_value: null, time_value: null, date_value: null, values: null })
        );
        this.props.onChangeField(filterItems);
    }

    changeField(combinedSet, definitionId, value, definitionType, isOrId, dependency) {
        let filterItems = [];
        filterItems.push({
            voter_filter_definition_id: Number(definitionId),
            is_or_id: isOrId,
            [definitionType]: value,
            election_campaign_id: null,
            combined_definitions: combinedSet
        });

        this.props.onChangeField(filterItems);
        let filterDependencies = dependency ? dependency.split(',') : [];

        if (filterDependencies.length > 0) {
            filterDependencies.map(defId => {
                let values = this.getFilterDependencyValues(defId);
                // console.log(values,value,defId);
                values[definitionId] = value || null;
                voterFilterActions.loadDefinitionValues(this.props.dispatch, this.props.moduleType, defId, values, false, combinedSet);
            });
        }

        let combinedSets = this.state.combinedSets;
        let items = this.state.subGroupItems[combinedSets[combinedSets.length - 1]] || [];
        if (items.length) {
            this.setState({ addNewCombinedSetEnabled: true });
        }
    }

    getFilterDependencyValues(definitionId) {
        let depandantIds = this.dependencies[definitionId] || [];
        let values = {};

        depandantIds.map(depandantId => {
            let item = this.findFilterItem(depandantId);
           let value= item.values ? [item.values] : item.numeric_value;
            if (!_.isEmpty(item)) {
                values[depandantId] = value;
            }
        });
        return values;
    }

    findFilterItem(filterItemId) {
        let filterItem = this.props.filterItems.find(function (item) {
            return (filterItemId == item.voter_filter_definition_id);
        });
        return filterItem || {};
    }

    render() {
        let result = [];
        this.state.combinedSets.map((combinedDefinition, index) => {
            let items = this.state.subGroupItems[combinedDefinition] || [];
            result.push(
                <div key={combinedDefinition} className="filter-type-component__group">
                    <label className={"filter-type-component__group-name" + (index > 0 ? ' election_campaign' : '')}>{index > 0 ? '' : this.props.subGroup.label}</label>
                    <div className="filter-type-component__fields">
                        {this.props.subGroup.definitions.map(definition => {
                            /**
                            ** check if the definition is list and there is dependency and there is no values/options for the list, SO load the values
                            */
                            if (definition.type == "list" && this.dependencies[definition.id] && !_.isEmpty(this.findFilterItem(definition.id))) {
                                let values = definition.values || [];

                                if (values.length == 0) {
                                    this.loadDependencyValues(combinedDefinition, definition.id);
                                }
                            }


                            let  listOptions = definition.values || [];

                            /**
                             * in case of list filter type: get the relevent values acording to the combined_definitions.
                             * use (|| []) to make sure that we provide array and prevent cases in which the listOptions is undefined.
                             */
                            // if ((definition.type == "list") && !!this.props.subGroup.combined_definitions) {

                            //     if (this.dependencies[definition.id] && definition.values[combinedDefinition]) {
                            //         listOptions = definition.values[combinedDefinition] || [];
                            //     } 

                            // } 
                            return <FilterField
                                key={definition.id}
                                field={definition}
                                filterItem={items[definition.id]}
                                listOptions={listOptions}
                                onChangeField={this.changeField.bind(this, combinedDefinition)}
                                isOrId={this.props.subGroup.is_or ? subGroup.id : null}
                            />
                        })}
                    </div>
                    {!!this.props.subGroup.combined_definitions && (index > 0) &&
                        <div className="row">
                            <div className="col-md-10"></div>
                            <div className="col-md-2">
                                <div className="remove-combined" onClick={this.deleteCombinedSetSection.bind(this, index, items)}>
                                    <i className="fa fa-minus-square" aria-hidden="true">&nbsp;&nbsp;{this.removeCombinedSetLabel}</i>
                                </div>
                            </div>
                        </div>
                    }
                </div>);
        });

        return (
            <div>
                {result}
                {!!this.props.subGroup.combined_definitions &&
                    <div onClick={this.addCombinedSetSection.bind(this)} className={"add-campaign" + (this.state.addNewCombinedSetEnabled ? '' : ' disabled')}>
                        <i className="fa fa-plus-square" aria-hidden="true">&nbsp;&nbsp;{this.addCombinedDefinitionsLabel}</i>
                    </div>
                }
            </div>
        );
    }
};

SubGroup.defaultProps = {
    filterItems: [],
    subGroup: {}
};

export default connect()(SubGroup);
