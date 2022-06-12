import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as voterFilterActions from 'actions/VoterFilterActions';


// import FilterType from './FilterType';
import FilterGroup from './FilterGroup';


class AdditionalFilters extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    componentWillMount() {
        if (_.isEmpty(this.props.filterDefinitions)) {
            this.props.voterFilterActions.getVoterFilterDefinitions(this.props.moduleType);
        }
    }
    partitionFilterDefs() {
        let odd = [];
        let even = [];
        this.props.filterGroups.map((filterGroup, i) => {
            let filterItems = this.getGroupItems(this.props.filterItems, filterGroup.sub_groups);
            let filterItemsOld = this.getGroupItems(this.props.filterItemsOld, filterGroup.sub_groups);

            let elem = <FilterGroup
                key={i}
				index={i}
                moduleType={this.props.moduleType}
                voterFilterKey={this.props.voterFilterKey}
                group={filterGroup}
                filterItems={filterItems}
                filterItemsOld={filterItemsOld}
            />;
            if (i % 2 === 0) {
                even = [...even, elem];
            } else {
                odd = [...odd, elem];
            }
        }, this);
        return [even, odd];
    }

    //get the relevant items for the group
    getGroupItems(filterItems, subGroups) {
        const groupDefinitionIds = [];
        subGroups.map(function (group) {
            group.definitions.map(function (definition) {
                groupDefinitionIds.push(definition.id);
            });
        });

        let groupItems = filterItems.filter(function (item) {
            return (groupDefinitionIds.indexOf(item.voter_filter_definition_id) > -1);
        });
        return groupItems;
    }
	
	

    render() {
        return (
            <div className="voter-filter-section additional-filters">
                <div className="voter-filter-section__header additional-filters__header">
                    {/*<span className="voter-filter-section__expand-btn fa fa-chevron-circle-down fa-lg" aria-hidden="true"/>*/}
                    <span className="voter-filter-section__title additional-filters__title">מסננים נוספים</span>

                </div>
                <div className="voter-filter-section__filters additional-filters__filters">
                    {this.partitionFilterDefs().map((array, i) =>
                        <div className="additional-filters__filter-column" key={i}>{array}</div>
                    )}
                </div>
            </div>
        );
    }
}

AdditionalFilters.propTypes = {
    moduleType: PropTypes.string.isRequired,
    filterDefinitions: PropTypes.object,
    voterFilterKey: PropTypes.string,
    filterItems: PropTypes.array,
};

AdditionalFilters.defaultProps = {
    filterDefinitions: {},
    filterItems: [],
    filterItemsOld: [],
    filterGroups: []
};

function mapStateToProps(state, ownProps) {
    let voterFilter = state.global.voterFilter;
    return {
        filterGroups: voterFilter.modules[ownProps.moduleType],
        filterItems: voterFilter[ownProps.moduleType].vf.filter_items,
        filterItemsOld: voterFilter[ownProps.moduleType].old.filter_items,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        voterFilterActions: bindActionCreators(voterFilterActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdditionalFilters);
