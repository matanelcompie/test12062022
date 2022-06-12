import React from 'react';

const InstitutesLoadingData = ({cancelSearch}) => {
    return (
        <div className='text-center loading-report cursor-pointer' onClick={cancelSearch.bind(this)}>
            <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            <p className="loading-report-cancel">לחץ לביטול יצירת הדוח</p>
        </div>
    );
};

export default InstitutesLoadingData;