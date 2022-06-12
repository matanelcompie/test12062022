import React from 'react';
import PropTypes from 'prop-types';


const Title = ({}) => {
    let textValues = {
        pageTitle: 'רשימת קמפיינים'
    };

    return (
        <div className="col-xs-8">
            <h1>{textValues.pageTitle}</h1>
        </div>
    );
}

Title.propTypes = {
    //
}

export default Title;
