import React from 'react';
import PropTypes from 'prop-types';


const FilterTypeSummaryHeader = ({filterTitle, onExpandFilterClick, isExpanded}) => {

    return (
			<div className="filter-type-summary-header">
	            <span className="filter-type-summary-header__expand-btn" onClick={() => {onExpandFilterClick()}}>
                    <i className={"fa " + (isExpanded ? "fa-caret-down" : "fa-caret-left")} aria-hidden="true" />
	            </span>
                <span className="filter-type-summary-header__filter-icon"><i className="fa fa-filter" aria-hidden="true" /></span>
                <span className="filter-type-summary-header__title">{filterTitle}</span>
        	</div>
    );
};

FilterTypeSummaryHeader.propTypes = {
    filterTitle: PropTypes.string,
    onExpandFilterClick: PropTypes.func,
    isExpanded: PropTypes.bool
};

FilterTypeSummaryHeader.defaultProps = {
    //
};

export default FilterTypeSummaryHeader;