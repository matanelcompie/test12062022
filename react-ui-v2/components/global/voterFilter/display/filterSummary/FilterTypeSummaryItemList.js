import React from 'react';
import PropTypes from 'prop-types';

import FilterTypeSummaryItem from './FilterTypeSummaryItem';

const FilterTypeSummaryItemList = ({filterDefinitions, filterItems}) => {
    return (
        <div className="filter-type-summary-item-list">
            {filterDefinitions.map(group =>
                (!_.isEmpty(group.definitions) || !_.isEmpty(group.sub_groups)) && // make sure we have a reason to show at all
                <div key={group.key} className="filter-type-summary-item-list__group">
                    <div className="filter-type-summary-item-list__group-header">
                        <span className="filter-type-summary-header__expand-btn">
                            <i className={"fa " + (true || isExpanded ? "fa-caret-down" : "fa-caret-left")} aria-hidden="true" />
                        </span>
                        <span className="filter-type-summary-header__filter-icon"><i className="fa fa-filter" aria-hidden="true" /></span>
                        <span className="filter-type-summary-item-list__group-title">{group.label}</span>
                    </div>
                    {group.definitions.map(definition => (
                        filterItems[definition.id] && // ensures that we actually have a filter item for this defId
                        <FilterTypeSummaryItem
                            key={definition.id}
                            filterDef={definition}
                            filterItem={filterItems[definition.id]}
                        />
                    ))}
                    {!_.isEmpty(group.sub_groups) &&
                        <FilterTypeSummaryItemList filterDefinitions={group.sub_groups} filterItems={filterItems}/>
                    }
                </div>
            )}
        </div>
    );
};

FilterTypeSummaryItemList.propTypes = {
    filterDefinitions: PropTypes.array,
    filterItems: PropTypes.object
};

FilterTypeSummaryItemList.defaultProps = {
    //
};

export default FilterTypeSummaryItemList;
