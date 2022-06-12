import React from 'react';
import PropTypes from 'prop-types';


const FilterSummaryHeader = ({onExpandFilterClick, isExpanded}) => {

    let textValues = {
        summary: 'סיכום'
    }

    return (
        <div className="filter-type-header">
            <span onClick={onExpandFilterClick} className="filter-type-header__btn filter-type-header__btn_type_expand">
                <i className={"fa " + (isExpanded ? "fa-minus-circle" : "fa-plus-circle")} aria-hidden="true" />
            </span>
            <span className="filter-type-header__title">{textValues.summary}</span>
        </div>
    );
};

FilterSummaryHeader.propTypes = {
    onExpandFilterClick: PropTypes.func,
    isExpanded: PropTypes.bool
};

export default FilterSummaryHeader;
