import React from 'react';
import {Link} from 'react-router';

const Captain50ActivityResultItem= ({item, supportStatuses, currentUser, displayCaptainBallots}) => {
    function renderCaptainName() {
        let captainFullName = item.captain_first_name + ' ' + item.captain_last_name;

        if (currentUser.admin || currentUser.permissions['elections.activists'] == true) {
            return <Link to={'elections/activists/' + item.captain_key + '/' + item.election_role_key} target='_blank'>{captainFullName}</Link>;
        } else {
            return captainFullName;
        }
    }

    function renderCaptainPersonalIdentity() {
        if ( currentUser.admin || currentUser.permissions['elections.voter'] == true ) {
            return <Link to={'elections/voters/' + item.captain_key} target='_blank'>{item.captain_personal_identity}</Link>;
        } else {
            return item.captain_personal_identity;
        }
    }

    function renderSupportStatusesData() {
        let items = supportStatuses.map( function(supportStatusItem, index) {
            let countField =  'count_support_status' + supportStatusItem.id;

            return <td key={index} style={{backgroundColor:'rgb('+(153+10*index)+', '+(204+5*index)+', '+(229 + 3*index) + ')' , borderLeft:'2px solid #fff' , textAlign:'center'}}>{item[countField]}</td>
        });

        return items;
    }

    function sumOfStatusesActivity() {
        let sum = 0;

        for ( let statusIndex = 0; statusIndex < supportStatuses.length; statusIndex++ ) {
            let countField =  'count_support_status' + supportStatuses[statusIndex].id;

            sum += item[countField];
        }

        sum += item.count_support_status_none;

        return sum;
    }
    function displayBallots(){
        displayCaptainBallots(item.captain_key)
    }
    return (
        <tr>
            <td>{renderCaptainName()}</td>
            <td>{renderCaptainPersonalIdentity()}</td>

            <td><a onClick={displayBallots} style={{ cursor:'pointer'}}>{item.count_ballots}</a></td>

            <td>{item.count_households}</td>
            <td className="left-border">{item.count_voters}</td>

            <td>{item.count_as_religious_group}</td>
            <td>{item.count_as_ethnic_group}</td>

            {/* <td>{item.count_not_at_home}</td> */}
            <td>{item.count_verified_address}</td>
            <td className="left-border">{item.count_wrong_address}</td>

            {renderSupportStatusesData()}
            <td className="left-border" style={{backgroundColor:'rgb('+(153+10*supportStatuses.length)+', '+(204+5*supportStatuses.length)+', '+(229 + 3*supportStatuses.length) + ')' , textAlign:'center'}}>{item.count_support_status_none}</td>

            <td style={{textAlign:'center'}}>{sumOfStatusesActivity()}</td>
        </tr>
    );
};

export default Captain50ActivityResultItem;