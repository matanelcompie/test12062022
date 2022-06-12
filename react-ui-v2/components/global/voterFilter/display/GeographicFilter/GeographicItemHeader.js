import React from 'react';
import PropTypes from 'prop-types';


const GeographicItemHeader = ({ filterIndex, title, isNew, isActive, isExpanded, onExpandClick, onActiveClick, onDeleteClick, onSaveClick, onResetClick, isEdited }) => {
	const titles = {
        save: 'שמור',
        active: 'פעיל',
        clear: 'נקה ערכי סינון באזור הנוסף',
        delete: 'הסר מסנן גיאוגרפי נוסף',
    }
    let pointerStyle = { cursor: 'pointer' };
    let saveClasses = (isEdited ? ' filter-type-header__btn_active' : '') +
        ((title == '') ? ' filter-type-header__btn_disabled' : '');
    let deleteClass = filterIndex == 0 ? 'filter-type-header__btn_type_trash' : '';
    let deleteStyle = filterIndex == 0 ? { cursor: 'not-allowed' } : { ...pointerStyle };
    return (
        <div className="geographic-header filter-type-header">
            <span onClick={onExpandClick} className="filter-type-header__btn filter-type-header__btn_type_expand">
                <i className={"fa " + (isExpanded ? "fa-minus-circle" : "fa-plus-circle")} aria-hidden="true" />
            </span>
            <span onClick={onExpandClick} className="filter-type-header__title">{title}&nbsp;</span>
            <span title={titles.clear} className="filter-type-header__btn filter-type-header__btn_type_reset" style={pointerStyle} onClick={onResetClick} style={{ paddingTop: '5px' }}>
                <i className="filter-type-header__btn filter-type-header__btn_type_clear" aria-hidden="true" style={{cursor:'pointer'}} />
            </span>
            <span title={titles.active} className={"filter-type-header__btn filter-type-header__btn_type_save " + saveClasses} onClick={onSaveClick} >
            </span>
            <span title={titles.save}>
                <i className={"action-icon fa fa-eye" + (isActive ? '' : '-slash')} aria-hidden="true" onClick={onActiveClick} />
            </span>
            <span title={titles.delete} className={"filter-type-header__btn " + deleteClass} style={deleteStyle} onClick={onDeleteClick}>
                <i className={"fa " + (isNew ? "fa-times" : "fa-trash")} aria-hidden="true" />
            </span>
        </div>
    );
};

GeographicItemHeader.propTypes = {
    title: PropTypes.string,
    isExpanded: PropTypes.bool,
    onExpandClick: PropTypes.func,
    onActiveClick: PropTypes.func,
    onDeleteClick: PropTypes.func
};

GeographicItemHeader.defaultProps = {
    //
};

export default GeographicItemHeader;
