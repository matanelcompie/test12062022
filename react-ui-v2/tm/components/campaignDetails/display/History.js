import React from 'react';
import PropTypes from 'prop-types';

const History = ({title, text, date, status}) => {
    return (
        <div className={`sidebar-history sidebar-history_status_${status}`}>
            {status == 'ok' && <i className="fa fa-check" aria-hidden="true"></i>}
            <div className="sidebar-history__title">{title}</div>
            <div className="sidebar-history__text">{text}</div>
            <div className="sidebar-history__date">{date}</div>
        </div>
    );
}

History.propTypes = {
    //
}

export default History;
