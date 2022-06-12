import React from 'react';
import PropTypes from 'prop-types';


const FilterGroupHeader = ({filterTypeKey, filterTitle, onExpandFilterClick, isExpanded, onEraseClick,  numItems,
                            onSaveClick, isSaveButton, isNeedToSave, onResetClick}) => {
    return (
		<div className="filter-type-header" onClick={onExpandFilterClick}>
            <span className="filter-type-header__btn filter-type-header__btn_type_expand">
                <i className={"fa " + (isExpanded ? "fa-minus-circle" : "fa-plus-circle")} aria-hidden="true" />
            </span>
			<span className="filter-type-header__title">{filterTitle}</span>
            {isSaveButton && [
                <span key="reset" className="filter-type-header__btn filter-type-header__btn_type_reset" onClick={onResetClick}>
                    <i className="fa fa-repeat" aria-hidden="true" />
                </span>,
                <span key="save" className={'filter-type-header__btn filter-type-header__btn_type_save ' +
                        (isNeedToSave ? ' filter-type-header__btn_active' : '')}
                      onClick={onSaveClick}
                />
            ]}
            <span className="filter-type-header__btn filter-type-header__btn_type_clear" style={{cursor:'pointer'}} onClick={onEraseClick}/>
            <span className={"filter-type-header__item-count" + (numItems > 0 ? ' filter-type-header__item-count_has-items' : '')}>{numItems}</span>
    	</div>
    );
};

FilterGroupHeader.propTypes = {
    filterTypeKey: PropTypes.string,
    filterTitle: PropTypes.string,
    onExpandFilterClick: PropTypes.func,
	isExpanded: PropTypes.bool,
	onEraseClick: PropTypes.func,
	numItems: PropTypes.number,
	onSaveClick: PropTypes.func,
	isSaveButton: PropTypes.bool,
	isNeedToSave: PropTypes.bool,
    onResetClick: PropTypes.func
};

FilterGroupHeader.defaultProps = {
    //
};

export default FilterGroupHeader;
