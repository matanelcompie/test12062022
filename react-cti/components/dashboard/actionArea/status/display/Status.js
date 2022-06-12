import React from 'react';

import SupportStatus from './SupportStatus';
import AdditionalData from './AdditionalData';

const Status = (props) => {

    return (
        <div className="status">
            <SupportStatus permissions={props.permissions} />
            <AdditionalData />
        </div>
    );
};

export default Status;
