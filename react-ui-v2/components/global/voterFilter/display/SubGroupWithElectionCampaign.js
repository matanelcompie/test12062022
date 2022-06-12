import React from 'react';
import { connect } from 'react-redux';

import FilterField from './FilterField';
import ElectionCampaign from './ElectionCampaign';
import * as voterFilterActions from 'actions/VoterFilterActions';

class SubGroupWithElectionCampaign extends React.Component {
    constructor(props) {
        super(props);
        this.addCampaignLabel = "הוסף מערכת בחירות";
        this.dependencies = {};

        this.state = {
            selectedElectionCampaigns: [],
            subGroupItems: {},
            addNewCampaignEnabled: true
        };
        this.subGroupsDefIds = [];
        this.tempElectionCampaignId = null;
    }

    componentDidMount() {
        this.props.subGroup.definitions.map(definition =>
            this.subGroupsDefIds.push(definition.id)
        );

        this.setElectionCampaigns();
        this.addDependency();
        this.mapItemsPerElectionCampaign();
    }

    componentDidUpdate() {
        this.mapItemsPerElectionCampaign();
    }

    addDependency() {
        this.props.subGroup.definitions.map(definition => {
            let target = definition.model_list_dependency_id;
            let filterDependencies = target ? target.split(',') : [];

            if (filterDependencies.length > 0) {
                filterDependencies.map(definitionId => {
                    if (!this.dependencies[target]) {
                        this.dependencies[target] = [];
                    }
                    if (this.dependencies[target].indexOf(definition.id) == null) {
                        this.dependencies[target].push(definition.id);
                    }
                });
            }
        });
    }

    //set the election campaign sets options to display the subgroup duplications acording to these sets.
    setElectionCampaigns() {
        let electionCampaigns = [];
        this.props.filterItems.map(item => {
            //let electionCampaign=item.election_campaign_id==null?-1:item.election_campaign_id;
            if ((this.subGroupsDefIds.indexOf(item.voter_filter_definition_id) > -1) && (electionCampaigns.indexOf(item.election_campaign_id) == -1)) {
                electionCampaigns.push(item.election_campaign_id);
            }
        });

        if (electionCampaigns.length == 0) {
            //add current election campaign
            electionCampaigns.push(this.props.currentElectionCampaign.id);
            // electionCampaigns.push(this.tempElectionCampaignId);
        }

        this.setState({ selectedElectionCampaigns: electionCampaigns.sort().reverse() });
    }

    mapItemsPerElectionCampaign() {
        let subGroupItems = {};
        this.props.filterItems.map(item => {
            if (this.subGroupsDefIds.indexOf(item.voter_filter_definition_id) > -1) {
                // let electionCampaign=item.election_campaign_id==null?-1:item.election_campaign_id;
                let electionCampaign = item.election_campaign_id;
                if (!subGroupItems[electionCampaign]) {
                    subGroupItems[electionCampaign] = [];
                }
                subGroupItems[electionCampaign][item.voter_filter_definition_id] = item;
            }
        });

        if (!_.isEqual(this.state.subGroupItems, subGroupItems)) {
            this.setState({ subGroupItems });
        }
    }

    loadDependencyValues(electionCampaign, definitionId) {
        //if there is selected values for dependency filters, load the filter items
        let dependantIds = this.dependencies[definitionId];
        let items = this.state.subGroupItems[electionCampaign] || [];

        if (dependantIds.length && items.length) {
            dependantIds.map(dependantId => {
                let value = items[dependantId] ? items[dependantId].values : [];
                if (value.length > 0) {
                    let values = {};
                    values[dependantId] = value;
                    voterFilterActions.loadDefinitionValues(this.props.dispatch, this.props.moduleType, definitionId, values, electionCampaign);
                }
            });
        }
    }

    addElectionCampaignSection() {
        let selectedElectionCampaigns = this.state.selectedElectionCampaigns;

        if (selectedElectionCampaigns.indexOf(this.tempElectionCampaignId) == -1) {
            selectedElectionCampaigns.push(this.tempElectionCampaignId);
            this.setState({ selectedElectionCampaigns });
        }
        this.setState({ addNewCampaignEnabled: false });
    }

    deleteElectionCampaignSection(index, items) {
        let selectedElectionCampaigns = this.state.selectedElectionCampaigns;
        selectedElectionCampaigns.splice(index, 1)
        this.setState({ selectedElectionCampaigns });
        let filterItems = [];

        items.map(item =>
            filterItems.push({ ...item, numeric_value: null, string_value: null, time_value: null, date_value: null, values: null })
        );
        this.props.onChangeField(filterItems);
    }

    selectElectionCampaign(index, items, electionCampaignId) {
        let campaignId = electionCampaignId ? electionCampaignId : this.tempElectionCampaignId;
        let selectedElectionCampaigns = this.state.selectedElectionCampaigns;
        selectedElectionCampaigns[index] = campaignId;
        let filterItems = [];
        let filterItemsToDelete = [];

        items.map(item => {
            let itemData = { ...item };
            filterItemsToDelete.push({ ...itemData, numeric_value: null, string_value: null, time_value: null, date_value: null, values: null });
            filterItems.push({ ...itemData, election_campaign_id: campaignId });
        });

        let addNewCampaignEnabled = (selectedElectionCampaigns.indexOf(this.tempElectionCampaignId) > -1) ? false : true;
        this.setState({ selectedElectionCampaigns, addNewCampaignEnabled });

        this.props.onChangeField(filterItemsToDelete);
        this.props.onChangeField(filterItems);

        /**
         * check if there is filters dependent on other filters in this subGroup,
         * find the values of the dependent filters, then get the updated values for the affected filter using current election campaign.
         */
        this.props.subGroup.definitions.map(definition => {
            if (this.dependencies[definition.id]) {
                let dependencyIds = this.dependencies[definition.id] || [];
                dependencyIds.map(dependencyId => {
                    let value = items[dependencyId] ? items[dependencyId].values : [];

                    if (value.length) {
                        let values = {};
                        values[dependencyId] = value;
                        voterFilterActions.loadDefinitionValues(this.props.dispatch, this.props.moduleType, definition.id, values, campaignId);
                    }
                });
            }
        });
    }

    changeField(electionCampaign, definitionId, value, definitionType, isOrId, dependency) {
        let filterItems = [];
        filterItems.push({
            voter_filter_definition_id: Number(definitionId),
            is_or_id: isOrId,
            [definitionType]: value,
            election_campaign_id: electionCampaign,
            combined_definitions: null
        });

        let filterDependencies = dependency ? dependency.split(',') : [];

        if (filterDependencies.length > 0) {
            if (value) {
                filterDependencies.map(definitionId => {
                    let values = {};
                    values[definitionId] = value;
                    voterFilterActions.loadDefinitionValues(this.props.dispatch, this.props.moduleType, definitionId, values, electionCampaign);
                });
            } else {
                this.props.dispatch({ type: voterFilterActions.types.LOAD_DEFINITION_VALUES, moduleType: this.props.moduleType, definitionId, electionCampaign, [definitionType]: value });
            }
        }

        this.props.onChangeField(filterItems);
    }

    render() {
        let result = [];
        this.state.selectedElectionCampaigns.map((electionCampaign, index) => {
            let items = this.state.subGroupItems[electionCampaign] || [];
            result.push(
                <div key={electionCampaign} className="filter-type-component__group">
                    <label className={"filter-type-component__group-name" + (index > 0 ? ' election_campaign' : '')}>{index > 0 ? '' : this.props.subGroup.label}</label>
                    <ElectionCampaign
                        field={{ id: index, options: this.props.electionCampaignsList, value: electionCampaign }}
                        onChangeField={this.selectElectionCampaign.bind(this, index, items)}
                        currentSelectedCampaigns={this.state.selectedElectionCampaigns}
                        deleteSection={this.deleteElectionCampaignSection.bind(this, index, items)}
                    />
                    <div className="filter-type-component__fields">
                        {this.props.subGroup.definitions.map(definition => {
                            /**
                             * check if there is dependency and there is item value selected 
                             * and there is no values/options for the list, SO load the values
                             */
                            if (definition.type == "list" && this.dependencies[definition.id]) {
                                let values = definition.values[electionCampaign] || (electionCampaign ? [] : definition.values) || [];

                                if (values.length == 0) {
                                    this.loadDependencyValues(electionCampaign, definition.id);
                                }
                            }

                            /**
                             * in case of list filter type: get the relevent values acording to the electionCampaign.
                             * use (|| []) to make sure that we provide array and prevent cases in which the listOptions is undefined.
                             */
                            let listOptions = [];
                            if ((definition.type == "list") && this.dependencies[definition.id]) {
                                listOptions = definition.values[electionCampaign] || [];
                            } else {
                                listOptions = definition.values || [];
                            }

                            return <FilterField
                                key={definition.id}
                                field={definition}
                                filterItem={items[definition.id]}
                                listOptions={listOptions}
                                onChangeField={this.changeField.bind(this, electionCampaign)}
                                isOrId={this.props.subGroup.is_or ? subGroup.id : null}
                                electionCampaign={electionCampaign}
                            />
                        })}
                    </div>
                </div>);
        });

        return (
            <div>
                {result}
                <div onClick={this.addElectionCampaignSection.bind(this)} className={"add-campaign" + (this.state.addNewCampaignEnabled ? '' : ' disabled')}>
                    <i className="fa fa-plus-square" aria-hidden="true">&nbsp;&nbsp;{this.addCampaignLabel}</i>
                </div>
            </div>
        );
    }
};

SubGroupWithElectionCampaign.defaultProps = {
    filterItems: [],
    subGroup: {}
};

function mapStateToProps(state) {
    let electionCampaigns = state.global.voterFilter.electionCampaigns;
    return {
        electionCampaignsList: electionCampaigns['list'],
        currentElectionCampaign: electionCampaigns['current']
    };
}

export default connect(mapStateToProps)(SubGroupWithElectionCampaign);
