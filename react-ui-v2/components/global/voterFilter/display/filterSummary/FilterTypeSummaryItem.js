import React from 'react';
import PropTypes from 'prop-types';

const FilterTypeSummaryItem = ({filterDef, filterItem}) => {

	let boolOptions = {
		0: 'לא',
		1: 'כן'
	};

	let filterItemElem;
	let filterItemElemClassName = `filter-type-summary-item__value filter-type-summary-item__value_type_${filterDef.type}`;

	switch(filterDef.type) {
		case 'bool':
        	filterItemElem = <div className={filterItemElemClassName}>{boolOptions[filterItem.numeric_value]}</div>;
        	break;
		case 'list':
        	let optionLabels = {};
            filterDef.values.map(value => optionLabels[value.value] = value.label);

			if (filterDef.multiselect === 0) {
				filterItemElem = <div className={filterItemElemClassName}>{optionLabels[filterItem.numeric_value]}</div>
            } else {
                filterItemElem = filterItem.values.map(value =>
					<div key={value} className={filterItemElemClassName}>{optionLabels[value]}</div>
				)
			}

        	break;
        case 'number':
            filterItemElem = <div className={filterItemElemClassName}>{filterItem.numeric_value}</div>;
            break;
		case 'time':
            filterItemElem = <div className={filterItemElemClassName}>{filterItem.time_value}</div>;
            break;
		case 'date':
            filterItemElem = <div className={filterItemElemClassName}>{filterItem.date_value}</div>;
            break;
        case 'text':
        default:
        	filterItemElem = <div className={filterItemElemClassName}>{filterItem.string_value}</div>;
        	break;
	}

    return (
		<div className="filter-type-summary-item">
			<div className="filter-type-summary-item__header">
				<span className="filter-type-summary-header__expand-btn">
					<i className={"fa " + (true || isExpanded ? "fa-caret-down" : "fa-caret-left")} aria-hidden="true" />
				</span>
				<span className="filter-type-summary-header__filter-icon"><i className="fa fa-filter" aria-hidden="true" /></span>
				<span className="filter-type-summary-item__title">{filterDef.label}</span>
			</div>
			{filterItemElem}
		</div>
    );
};

FilterTypeSummaryItem.propTypes = {
    field: PropTypes.object,
    filterItems: PropTypes.object
};

FilterTypeSummaryItem.defaultProps = {
    //
};

export default FilterTypeSummaryItem;