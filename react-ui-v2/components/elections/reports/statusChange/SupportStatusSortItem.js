import React from 'react';

const SupportStatusSortItem = ({fieldName, sortSupportStatus, direction, supportStatusLevel, whiteSpace}) => {
    const sortDirections = require('../../../../libs/constants').statusesChangeReport.sortDirections;
    const style = {cursor: 'pointer'};

    function getColumnClass() {
        let className = "support-level" + supportStatusLevel;

        if ( whiteSpace ) {
            className += " white-space";
        }

        return className;
    }

    return (
        <th className={getColumnClass()}>
            <span className="status-text">{direction}</span>
            <a onClick={sortSupportStatus.bind(this, fieldName, sortDirections.up)} className="arrow-up" style={style}/>
            <a onClick={sortSupportStatus.bind(this, fieldName, sortDirections.down)} className="arrow-down" style={style}/>
        </th>
    );
};

export default SupportStatusSortItem;