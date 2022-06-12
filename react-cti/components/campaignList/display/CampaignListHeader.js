import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {parseDateToPicker} from '../../../libs/globalFunctions';


const CampaignListHeader = ({userName}) => {
    let textValues = {
        hello: 'שלום, ',
        logout: 'התנתק',
    };

    let today = parseDateToPicker(new Date()); // Current data and time
    today = moment(today).format('DD/MM/YYYY HH:mm');

    return (
        <div className="campaign-list-header">
            <div className="campaign-list-header__upper header-upper">
                <div className="header-upper__user-info">
                    <span className="header-upper__user-icon"/>
                    <span className="header-upper__user-name">{userName}</span>
                    <span className="campaign-list-header__current-time">{today}</span>
                </div>
                <a href={window.Laravel.baseURL + "logout"} className="campaign-list-header__log-out" title={textValues.logout}>
                    <i className="fa fa-power-off" aria-hidden="true"/>
                </a>
            </div>
            <div className="campaign-list-header__main">
                <div className="campaign-list-header__welcome-greeting">
                    <span className="campaign-list-header__greeting-intro">{textValues.hello}</span>
                    <span className="campaign-list-header__greeting-name">{userName}</span>
                </div>
            </div>
        </div>
    );
};

CampaignListHeader.propTypes = {
    userName: PropTypes.string,
};

CampaignListHeader.defaultProps = {};

export default (CampaignListHeader);
