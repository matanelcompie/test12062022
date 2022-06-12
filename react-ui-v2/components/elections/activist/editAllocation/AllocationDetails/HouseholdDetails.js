import React from 'react';

import constants from 'libs/constants';

const HouseholdDetails = ({display, currentTabRoleSystemName, capatainItem, currentUser, deleteElectionActivistRole}) => {
    function getDate(dateTime) {
        if ( dateTime == null || dateTime.length == 0) {
            return '';
        }

        let dateElements = dateTime.split(' ');
        let dateItem = dateElements[0];

        return dateItem.split('-').reverse().join('/');
    }

    function getTime(dateTime) {
        if ( dateTime == null || dateTime.length == 0) {
            return '';
        }

        let dateElements = dateTime.split(' ');
        let timeArr = dateElements[1].split(':');

        return timeArr[0] + ':' + timeArr[1];
    }

    /**
     * This function checks if the current user
     * is allowed to delete a captain 50 role
     * allocation.
     *
     * @returns {boolean|*|string}
     */
    function isUserAllowedToDeleteAllocation() {
        const electionRoleSytemNames = constants.electionRoleSytemNames;

        if (currentTabRoleSystemName == electionRoleSytemNames.ministerOfFifty) {
            return ( currentUser.admin || currentUser.permissions['elections.activists.captain_of_fifty.delete'] == true );
        } else {
            return false;
        }
    }

    let blockStyle = {};

    if ( !display ) {
        blockStyle = {display: "none"};
    }

    let percents = (capatainItem.total_households  / 50) * 100;

    return (
        <div style={blockStyle}>
            <div className="row" >
                <div className="col-md-9">
                    <div className="row">
                        <div className="col-md-4 nopadding">
                            <span style={{ marginLeft: '10px' }}> מספר בתי אב </span>
                            <b className="householdCounterStatus">{capatainItem.total_households}/50</b>
                        </div>
                        <div className="col-md-8">
                            <div className="progressBarData">
                                <div className="progress householdCounter">
                                    <div className="progress-bar progress-bar-striped active" role="progressbar"
                                        aria-valuenow="6" aria-valuemin="0" aria-valuemax="50" style={{ width: percents + '%' }}> </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 nopadding">
                    <span> מספר תושבים </span>
                    <b> {capatainItem.total_voters} </b>
                </div>
            </div>
            {isUserAllowedToDeleteAllocation() &&
                <div className="col-md-12">
                    <div className="form-group btnRow">
                        <button title="מחק שיבוץ" type="submit" className="btn btn-primary dark"
                            onClick={deleteElectionActivistRole.bind(this)}>
                            <span className="icon-del"></span>
                            <span>מחק שיבוץ</span>
                        </button>
                    </div>
                </div>
            }
        </div>
    );
};

export default HouseholdDetails;