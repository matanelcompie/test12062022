import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const Management = ({campaignKey,currentUser, activation_start_date, onCoverClick}) => {
    let textValues = {
        targetManagementTitle: "ניהול קבוצת יעד",
        questionnaireManagementTitle: "ניהול שאלון",
        employeesManagementTitle: "ניהול עובדים",
        exportVotersAnswers: "ייצוא תשובות תושבים"
    }
    let campaignHadStarted = false;
    let hasExportPermission = (currentUser.admin || currentUser.permissions['tm.campaign.questionnaire.export'] != true)

    if (hasExportPermission && activation_start_date) { //Check campaign start time
        let campaignStartTime = new Date(activation_start_date + ' 00:00').getTime();
        let currentTime = new Date().getTime();
        campaignHadStarted = campaignStartTime < currentTime ? true : false;
    }

    return (
        <div className="campaign-management">
            <div className="tm-popup__cover" onClick={onCoverClick}></div>
            <div className="campaign-management__row">
                <Link to={`telemarketing/campaigns/${campaignKey}/targetGroup`}>
                    {textValues.targetManagementTitle}
                </Link>
            </div>
            <div className="campaign-management__row">
                <Link to={`telemarketing/campaigns/${campaignKey}/questionnaire`}>
                   {textValues.questionnaireManagementTitle}
                </Link>
            </div>
            <div className="campaign-management__row">
                <Link to={`telemarketing/campaigns/${campaignKey}/employees`}>
                    {textValues.employeesManagementTitle}
                </Link>
            </div>
           {hasExportPermission && campaignHadStarted && <div className="campaign-management__row">
                <Link to={`api/tm/questionnaires/${campaignKey}/voters_answers/export`} target="_blank">
                    {textValues.exportVotersAnswers}
                </Link>
            </div>}
            {hasExportPermission && !campaignHadStarted && <div className="campaign-management__row">
                <a style={{ opacity: 0.6, cursor: 'not-allowed' }}>{textValues.exportVotersAnswers}</a>
            </div>}
        </div>   
    );
};

Management.propTypes = {
    campaignKey: PropTypes.string,
    onCoverClick: PropTypes.func
};

export default Management;
