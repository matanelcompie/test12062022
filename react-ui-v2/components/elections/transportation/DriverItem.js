import React from 'react';

import constants from 'libs/constants';

const DriverItem = ({item, isDriverSelected, toggleDriver}) => {
    function getCarType() {
        if ( item.car_type ) {
            return <div className="accessibility"/>;
        } else { return <div style={{ width: '17px' }}/>; }
    }

    function getVerifyStatus() {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        let statusImg = '';
        let statusTitle = '';

        switch (item.verified_status) {
            case verifyStatus.noMessageSent:
                statusImg = window.Laravel.baseURL + 'Images/Grey-clock.png';
                statusTitle = verifiedStatusTitle.noMessageSent;
                break;

            case verifyStatus.messageSent:
                statusImg = window.Laravel.baseURL + 'Images/ico-status-pending.svg';
                statusTitle = verifiedStatusTitle.messageSent;
                break;

            case verifyStatus.verified:
                statusImg = window.Laravel.baseURL + 'Images/ico-status-done.svg';
                statusTitle = verifiedStatusTitle.verified;
                break;

            case verifyStatus.refused:
                statusImg = window.Laravel.baseURL + 'Images/ico-status-fail.svg';
                statusTitle = verifiedStatusTitle.refused;
                break;

            case verifyStatus.moreInfo:
                statusImg = window.Laravel.baseURL + 'Images/Question.png';
                statusTitle = verifiedStatusTitle.moreInfo;
                break;
        }

        return [
            <span key={0} style={{paddingLeft: '5px'}}>{statusTitle}</span>,
            <img key={1} data-toggle="tooltip" data-placement="left" title={statusTitle} src={statusImg}
                    data-original-title={statusTitle}/>
        ];
    }

    return (
        <tr>
            <td><input type="checkbox" checked={isDriverSelected} disabled={true} onChange={toggleDriver.bind(this, item.key)}/></td>
            <td>{item.personal_identity}</td>
            <td>{item.first_name + ' ' + item.last_name}</td>
            <td>{getVerifyStatus()}</td>
            <td>{getCarType()}</td>
            <td>{item.passenger_count}</td>
            <td>{item.voters_transportations_count}</td>
            <td>{item.crippled_transportations_count}</td>
        </tr>
    );
};

export default DriverItem;