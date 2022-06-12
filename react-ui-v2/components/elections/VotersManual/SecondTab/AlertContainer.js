import React from 'react';

const AlertContainer = ({alertMessage}) => {
    return (
        <div className="row alertContainer">
            <div className="alert alert-warning-red " role="alert"><strong>שים לב!</strong>
                {alertMessage}
            </div>
        </div>
    );
};

export default AlertContainer;