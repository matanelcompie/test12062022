import React from 'react';
import PropTypes from 'prop-types';


const GeographicHeader = ({onAddClick}) => {
    let textValues = {
        title: 'אזורים גיאוגרפיים',
        addRegion: 'הוסף אזור',
        showAll: 'הצג הכל',
        clearAll: 'נקה הכל',
    }
    return (
        <div className="voter-filter-section__header geographic-header">
            {/*<span className="voter-filter-section__expand-btn fa fa-chevron-circle-down fa-lg" aria-hidden="true"/>*/}
            <span className="voter-filter-section__title geographic-header__title">{textValues.title}</span>
            <div className="geographic-header__buttons">
                <div className="tm-btn geographic-header__btn geographic-header__btn_type_add" onClick={onAddClick}>
                    <i className="fa fa-plus" aria-hidden="true"/>
                    <span>{textValues.addRegion}</span>
                </div>
            </div>
        </div>
    );
};

GeographicHeader.propTypes = {
    onAddClick: PropTypes.func,
};

GeographicHeader.defaultProps = {
    //
};

export default GeographicHeader;
