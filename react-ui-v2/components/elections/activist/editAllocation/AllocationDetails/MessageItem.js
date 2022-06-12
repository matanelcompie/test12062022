import React from 'react';

import constants from 'libs/constants';

const MessageItem = ({item, getDate, getTime}) => {
    const messageDirections = constants.activists.messageDirections;

    function getVerifyStatusTitle() {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        switch ( item.verified_status ) {
            case verifyStatus.noMessageSent:
                return verifiedStatusTitle.noMessageSent;

            case verifyStatus.messageSent:
                return verifiedStatusTitle.messageSent;

            case verifyStatus.verified:
                return verifiedStatusTitle.verified;

            case verifyStatus.refused:
                return verifiedStatusTitle.refused;

            case verifyStatus.moreInfo:
                return verifiedStatusTitle.moreInfo;
        }
    }

    return (
        <tr>
            <td>
                <span className="time">{getTime(item.created_at)}</span>
                <span className="date">{getDate(item.created_at)}</span>
            </td>
            <td>{item.direction == messageDirections.out ?  'יוצא' : 'נכנס'}</td>
            <td>{item.text}</td>
            <td>{item.phone_number}</td>
            <td>{getVerifyStatusTitle()}</td>
        </tr>
    );
};

export default MessageItem;