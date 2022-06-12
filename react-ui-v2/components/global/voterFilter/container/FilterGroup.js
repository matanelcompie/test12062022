import React from 'react';
import { connect } from 'react-redux';

import FilterGroupHeader from '../display/FilterGroupHeader';
import FilterGroupBody from '../display/FilterGroupBody';

import * as voterFilterActions from 'actions/VoterFilterActions';
import * as portionActions from 'tm/actions/portionActions';
import * as GlobalActions from 'actions/GlobalActions';

class FilterGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isExpanded: false
        }
    }

    onChangeField(filterItems) {
        if (filterItems.length) {
            this.props.dispatch({ type: voterFilterActions.types.CHANGE_FILTER_ITEMS_BY_TYPE, filterItems, moduleType: this.props.moduleType });
            this.props.dispatch({ type: portionActions.types.SET_PORTION_CHANGE_STATUS, isEditedPortionChanged: true });
        }
    }

    onChangeFieldTm(filterItems) {
		//console.log(filterItems);
        if (filterItems.length) {
            this.props.dispatch({ type: voterFilterActions.types.CHANGE_FILTER_ITEMS_BY_TYPE, filterItems, moduleType: this.props.moduleType });
            this.props.dispatch({ type: portionActions.types.SET_PORTION_CHANGE_STATUS, isEditedPortionChanged: true });
        }
    }

    onExpandFilterClick() {
		let newIsExpanded = !this.state.isExpanded ;
        this.setState({ isExpanded: newIsExpanded });
		if(this.props.moduleType == 'general_report'){
			this.props.dispatch({type:GlobalActions.ActionTypes.VOTER_FILTER.EXPAND_SHRINK_DEFINITION_GROUP_BY_INDEX , moduleType:this.props.moduleType , index:this.props.index , isExpanded:newIsExpanded});
		}
    }

    onSaveClick() {
        if (this.isNeedToSave()) {
            let data = { groupKey: this.props.group.key, filterItems: this.props.filterItems };
            voterFilterActions.saveFilterItemsByType(this.props.dispatch, data, this.props.voterFilterKey, this.props.moduleType);
        }
    }

    onEraseClick(e) {
		e.stopPropagation();
        //send all ids from the this.props.filterItems with all value options as null
        let filterItems = [];
        this.props.filterItems.map(item =>
            {filterItems.push({ ...item, numeric_value: null, string_value: null, time_value: null, date_value: null, values: null })}
        );

        this.props.dispatch({ type: voterFilterActions.types.CHANGE_FILTER_ITEMS_BY_TYPE, filterItems, moduleType: this.props.moduleType });
        this.props.dispatch({ type: portionActions.types.SET_PORTION_CHANGE_STATUS, isEditedPortionChanged: true });
    }

    onResetClick() {
        //erase current filters, then send this.props.filterItemsOld
        this.onEraseClick();
        let filterItems = [...this.props.filterItemsOld];
        this.props.dispatch({ type: voterFilterActions.types.RESET_FILTER_ITEMS_BY_TYPE, filterItems, moduleType: this.props.moduleType });
        this.props.dispatch({ type: portionActions.types.SET_PORTION_CHANGE_STATUS, isEditedPortionChanged: false });
    }
	
	componentWillReceiveProps(nextProps){
		if(this.props.group.expanded != nextProps.group.expanded){
			this.setState({ isExpanded: nextProps.group.expanded });
		}
		if(nextProps.isExpanded != undefined && nextProps.isExpanded != null){
			if(this.props.isExpanded != nextProps.isExpanded){
				this.setState({ isExpanded: nextProps.isExpanded });
			}
		}
	}

    isNeedToSave() {
        if (_.isEmpty(this.props.filterItems) && _.isEmpty(this.props.filterItems))
            return false;
        if (_.isEmpty(this.props.filterItems) || _.isEmpty(this.props.filterItems))
            return true;

        return !_.isEqual(this.props.filterItems, this.props.filterItemsOld);
    }

    render() {
		 
        return (
            <div className={"filter-type" + (this.state.isExpanded ? ' filter-type_expanded' : '')}>
                <FilterGroupHeader
                    groupKey={this.props.group.id}
                    filterTitle={this.props.group.label}
                    onExpandFilterClick={this.onExpandFilterClick.bind(this)}
                    isExpanded={this.state.isExpanded}
                    onEraseClick={this.onEraseClick.bind(this)}
                    numItems={_.size(this.props.filterItems)}
                    onSaveClick={this.onSaveClick.bind(this)}
                    isSaveButton={!!this.props.voterFilterKey}
                    isNeedToSave={this.isNeedToSave()}
                    onResetClick={this.onResetClick.bind(this)}
                />
                {this.state.isExpanded &&
                    <FilterGroupBody
                        groupKey={this.props.group.id}
                        subGroups={this.props.group.sub_groups}
                        onChangeField={this.onChangeField.bind(this)}
                        onChangeFieldTm={this.onChangeFieldTm.bind(this)}
                        filterItems={this.props.filterItems}
                        moduleType={this.props.moduleType}
                    />
                }
            </div>
        );
    }
}

export default connect()(FilterGroup);