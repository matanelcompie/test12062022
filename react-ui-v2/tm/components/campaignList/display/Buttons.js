import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';


const Buttons = ({}) => {
    let textValues = {
        addButtonTitle: 'הגדרת קמפיין חדש'
    };

    return (
        <div className="col-xs-3 col-xs-offset-1">
            <Link to="telemarketing/campaigns/new" className="btn btn-success btn-block">
                <i className="fa fa-plus"></i>&nbsp;&nbsp;
                <span>{textValues.addButtonTitle}</span>
            </Link>
        </div>
    );
}

Buttons.propTypes = {
    //
}

export default Buttons;
