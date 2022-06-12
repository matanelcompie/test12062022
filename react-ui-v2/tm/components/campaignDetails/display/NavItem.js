import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router';


const NavItem = ({tabKey, label, to, isActive, isValidTab}) => {
    return (
        <li className={'nav-item' +
            (isActive ? ' active' : '') +
            (isValidTab != undefined && !isValidTab ? ' nav-item_invalid' : "")
        }>
            <Link to={to}>{label}</Link>
        </li>
    )
};

NavItem.propTypes = {
    label: PropTypes.string,
    to: PropTypes.string,
    isActive: PropTypes.bool,
    isValidTab: PropTypes.bool,
};

export default NavItem;
