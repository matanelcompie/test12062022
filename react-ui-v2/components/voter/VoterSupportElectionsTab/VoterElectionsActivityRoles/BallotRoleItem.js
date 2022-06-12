import React from 'react';
import {formatBallotMiId} from '../../../../libs/globalFunctions'
const BallotRoleItem = ({item}) => {
    let election_roles_geographical = item.election_roles_geographical ? item.election_roles_geographical : [];
    function renderShifts() {
        let shifts = election_roles_geographical.map( function(geoItem, index ) {
            return <span key={geoItem.key} className="td-info">{geoItem.election_role_shift_name} </span> ;
        });

        return shifts;
    }


    // function renderBallotBoxexNames() {
    //     let ballotBoxesNames = election_roles_geographical.map( function(geoItem, index ) {
    //         return <span key={geoItem.key} className="td-info">{formatBallotMiId(geoItem.mi_id)}</span>;
    //     });

    //     return ballotBoxesNames;
    // }

    function renderBallotsAddresses() {
        let addresses = election_roles_geographical.map( function(geoItem, index ) {
            let address = geoItem.cluster_name;
            if ( geoItem.street != null ) { address += ' ,' + geoItem.street; }

            return <span key={geoItem.key} className="td-info">{address}. <label> קלפי {formatBallotMiId(geoItem.mi_id)}</label></span>;
        });

        return addresses;
    }
    function renderGeoSum() {
        let geoSumList = election_roles_geographical.map( function(geoItem, index ) {
            return <span key={geoItem.key} className="td-info">{geoItem.sum}</span>;
        });

        return geoSumList;
    }
    console.log(election_roles_geographical);
    return (
        <tr>
            <td>{item.CampaignName}</td>
            <td>{item.election_role_name}</td>
            <td>{item.assigned_city_name}</td>
            <td>{election_roles_geographical.length > 0 ? renderBallotsAddresses() : '-'}</td>
            <td>{election_roles_geographical.length > 0 ? renderShifts() : '-'}</td>
            <td>{election_roles_geographical.length > 0 ? renderGeoSum() : '-'}</td>
        </tr>
    );
};


export default BallotRoleItem;