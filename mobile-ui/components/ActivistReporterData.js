import React from 'react';
import {formatBallotMiId} from '../libs/globalFunctions';

function ActivistReporterData({ currentUser }) {

    return (
        <div className="row section">
            <div className="col-md-12">
                <h3 className="text-primary" style={{ fontSize: '22px' }}>{currentUser.first_name + ' ' + currentUser.last_name} | {currentUser.phone_number}</h3>
                <p>קלפי : {formatBallotMiId(currentUser.ballot_mi_id)}</p>
                <p> {currentUser.cluster_name}, {currentUser.cluster_street}
                    {currentUser.cluster_house}, {currentUser.cluster_city_name}</p>
            </div>
        </div>
    );
}

export default ActivistReporterData;