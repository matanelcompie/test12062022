import React from 'react';
import PropTypes from 'prop-types';


const PortionListHeader = ({}) => {
    let columnLabels = {
        order: '#',
        name: 'שם מנה',
        creator_name: 'יוצר',
        created_at: 'תאריך יצירה',
        voters_count: "מס' בוחרים",
        unique_voters_count: "בוחרים יחודים",
		sent_to_dialer:"נשלחו לחייגן",
        processed_count: 'טופלו',
        processing_count: 'בטיפול',
		answered_percentage: 'אחוז מענה',
        actions: 'פעולות',
    };
    return (
        <div className="portion-list-header">
            {Object.keys(columnLabels).map(key =>
                <div key={key} className={"portion-list__cell portion-list__cell_col_"+key}>{columnLabels[key]}</div>
            )}
        </div>
    );
}

export default PortionListHeader;
