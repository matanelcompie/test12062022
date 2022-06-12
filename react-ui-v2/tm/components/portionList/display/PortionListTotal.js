import React from 'react';
import PropTypes from 'prop-types';


const PortionListTotal = ({ portions }) => {
    let textValues = {
        total: 'סה"כ'
    }
    let calls_count = 0;
    let answered_calls_count = 0;
    
    let sums = {
        voters_count: 0,
        unique_voters_count: 0,
		sent_to_dialer:0,
        processed_count: 0,
        processing_count: 0,
		answered_percentage:0
    }

    const sumKeys = Object.keys(sums)
    portions.forEach(item => {
        calls_count += item.calls_count;
        answered_calls_count += item.answered_calls_count;
        sumKeys.forEach(key => sums[key] += (item[key] || 0))
    })

    if (calls_count > 0) {
        sums["answered_percentage"] = ((answered_calls_count / calls_count) * 100).toFixed(2);
    } else {
        sums["answered_percentage"] = 0;
    }
    let totalCols = sumKeys.map(key =>
        <div key={key} className={"portion-list__cell portion-list__cell_col_" + key}>{sums[key].toLocaleString()}</div>
    );
    return (
        <div className="portion-list__totals">
            <div className="portion-list__cell portion-list__cell_col_total-label">{textValues.total}</div>
            {totalCols}
            <div className="portion-list__cell">&nbsp;</div>
        </div>
    );
}

PortionListTotal.propTypes = {
}

export default PortionListTotal;
