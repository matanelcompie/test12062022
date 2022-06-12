import React from 'react';
import { connect } from 'react-redux';

import FilterField from './FilterField';
import TmCampaign from './TmCampaign';
import * as voterFilterActions from 'actions/VoterFilterActions';

class SubGroupWithTmCampaign extends React.Component {
    constructor(props) {
        super(props);
        this.addCampaignLabel = "הוסף קמפיין טלמרקטינג";
        this.dependencies = {};

        this.state = {
            selectedElectionCampaigns: [],
            subGroupItems: {},
            addNewCampaignEnabled: false
        };
        this.subGroupsDefIds = [];
        this.tempElectionCampaignId = null;
    }

    componentDidMount() {
		if(this.props.electionCampaignsList.length == 0){
			voterFilterActions.globalLoadSlimTmCampaigns(this.props.dispatch);
		}
	 
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

            if ((this.subGroupsDefIds.indexOf(item.voter_filter_definition_id) > -1) && (electionCampaigns.indexOf(item.tm_campaign_id) == -1)) {
				electionCampaigns.push(item.tm_campaign_id);
            }
        });
		
        if (electionCampaigns.length == 0) {
            //add current election campaign
            //electionCampaigns.push(this.props.currentElectionCampaign.id);
        }

        this.setState({ selectedElectionCampaigns: electionCampaigns.sort().reverse() });
    }

    mapItemsPerElectionCampaign() {
        let subGroupItems = {};
        this.props.filterItems.map(item => {
            if (this.subGroupsDefIds.indexOf(item.voter_filter_definition_id) > -1) {
 
                let electionCampaign = item.tm_campaign_id;
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
		if(this.state.selectedElectionCampaigns.length == 1 && !this.state.selectedElectionCampaigns[0]){return;}//didn't select campaign - won't add block
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

    deleteElectionCampaignSectionFromNone(index, items) {
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
            filterItems.push({ ...itemData, tm_campaign_id: campaignId });
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

    selectElectionCampaignFromNone(index, items, electionCampaignId) {
		 
        let campaignId = electionCampaignId ? electionCampaignId : this.tempElectionCampaignId;
		 
        let selectedElectionCampaigns = this.state.selectedElectionCampaigns;
		
        selectedElectionCampaigns[index] = campaignId;
		 
        let filterItems=[];
        let filterItemsToDelete = [];
		
		for(let i = 0 ; i < this.props.filterItems.length ; i++){
			let itemData = this.props.filterItems[i];
			if(itemData.tm_campaign_id == 0){
				filterItemsToDelete.push({ ...itemData, numeric_value: null, string_value: null, time_value: null, date_value: null, values: null });
			}
			else{
				filterItems.push({ ...itemData, tm_campaign_id: campaignId });
			}
		}
		 
      
		 
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
        let filterItems = this.props.filterItems;
		
		let filterExistsIndex = -1;
		for(let i = 0 ; i < filterItems.length ; i++){
			if(filterItems[i].tm_campaign_id == electionCampaign && filterItems[i].voter_filter_definition_id == definitionId){
				filterExistsIndex=i;
				break;
				
			}
		}
		if(filterExistsIndex == -1){
			filterItems.push({
				voter_filter_definition_id: Number(definitionId),
				is_or_id: isOrId,
				[definitionType]: value,
				tm_campaign_id: electionCampaign,
				combined_definitions: null
			});
		}
		else{
			filterItems[filterExistsIndex][definitionType] = value;
		}
        
		 
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
                <div key={"tm"+electionCampaign} className="filter-type-component__group">
                    <label className={"filter-type-component__group-name" + (index > 0 ? ' election_campaign' : '')}>{index > 0 ? '' : this.props.subGroup.label}</label>
                    <TmCampaign
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
                            />
                        })}
                    </div>
                </div>);
        });
		
		if(this.state.selectedElectionCampaigns.length == 0){
			let electionCampaign = 0;
			 let items = this.state.subGroupItems[electionCampaign] || [];
			 result.push(
                <div key={"tm0"} className="filter-type-component__group">
                    <label className={"filter-type-component__group-name"}> </label>
                    <TmCampaign
                        field={{ id: 0, options: this.props.electionCampaignsList, value: null }}
                        onChangeField={this.selectElectionCampaignFromNone.bind(this, 0, [])}
                        currentSelectedCampaigns={this.state.selectedElectionCampaigns}
                        deleteSection={this.deleteElectionCampaignSectionFromNone.bind(this, 0, [])}
                    />
                    <div className="filter-type-component__fields">
                        {this.props.subGroup.definitions.map(definition => {
                            /**
                             * check if there is dependency and there is item value selected 
                             * and there is no values/options for the list, SO load the values
                             */
							
                            if (definition.type == "list" && this.dependencies[definition.id]) {
                                let values =   definition.values;
								 
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
                                onChangeField={this.changeField.bind(this, 0)}
                                isOrId={this.props.subGroup.is_or ? subGroup.id : null}
                            />
                        })}
                    </div>
                </div>);
		}

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

SubGroupWithTmCampaign.defaultProps = {
    filterItems: [],
    subGroup: {}
};

function mapStateToProps(state,ownProps) {
    let electionCampaigns = state.global.voterFilter.tmCampaigns;
 
    return {
        electionCampaignsList: electionCampaigns['list'],
        currentElectionCampaign: electionCampaigns['current'] , 
		filterItems: state.global.voterFilter[ownProps.moduleType].vf.filter_items,
    };
}

export default connect(mapStateToProps)(SubGroupWithTmCampaign);
