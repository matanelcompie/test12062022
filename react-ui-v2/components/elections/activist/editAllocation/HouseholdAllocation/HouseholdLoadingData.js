import React from 'react';

const HouseholdLoadingData = ({divClass}) => {
    return (
        <div className={divClass}>
            <i className="fa fa-spinner fa-spin pull-right" style={{marginTop: 5}}/>
        </div>
    );
};

export default HouseholdLoadingData;