import React from 'react';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';

const ChangeShiftAlertModal = ({show, activistDetails, geoItem, editRoleBallot, hideEditModals, otherRolesToChange, getBallotMiId}) => {
    function getVerifyStatusTitle(other) {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        switch ( other.other_activist_verified_status ) {
            case verifyStatus.noMessageSent:
                return verifiedStatusTitle.noMessageSent;
                break;

            case verifyStatus.messageSent:
                return verifiedStatusTitle.messageSent;
                break;

            case verifyStatus.verified:
                return verifiedStatusTitle.verified;
                break;

            case verifyStatus.refused:
                return verifiedStatusTitle.refused;
                break;

            case verifyStatus.moreInfo:
                return verifiedStatusTitle.moreInfo;
                break;
        }
    }

    function getVerifyStatusIcon(other) {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        let statusImg = '';
        let statusTitle = '';

        switch (other.other_activist_verified_status) {
            case verifyStatus.noMessageSent:
                statusImg = window.Laravel.baseAppURL + 'Images/Grey-clock.png';
                statusTitle = verifiedStatusTitle.noMessageSent;
                break;

            case verifyStatus.messageSent:
                statusImg = window.Laravel.baseAppURL + 'Images/ico-status-pending.svg';
                statusTitle = verifiedStatusTitle.messageSent;
                break;

            case verifyStatus.verified:
                statusImg = window.Laravel.baseAppURL + 'Images/ico-status-done.svg';
                statusTitle = verifiedStatusTitle.verified;
                break;

            case verifyStatus.refused:
                statusImg = window.Laravel.baseAppURL + 'Images/ico-status-fail.svg';
                statusTitle = verifiedStatusTitle.refused;
                break;

            case verifyStatus.moreInfo:
                statusImg = window.Laravel.baseAppURL + 'Images/Question.png';
                statusTitle = verifiedStatusTitle.moreInfo;
                break;
        }

        return <img data-toggle="tooltip" data-placement="left" title={statusTitle} src={statusImg}
                    data-original-title={statusTitle}/>
    }

    /**
     * Get other activists details
     *
     * @return JSX
     */
    function getOtherActivists() {
        return otherRolesToChange.map(function(other, index) {
            
            let ballotDetails = 'בקלפי ';
            let shiftText = '';
            let otherActivistInfo = 'ל';
            ballotDetails += getBallotMiId(geoItem.mi_id)  + ' בכתובת: ';
            if ( geoItem.street != null ) {
                ballotDetails += geoItem.street;
            }
            ballotDetails +=geoItem.city_name? ", " + geoItem.city_name:'';

            shiftText += 'משובצת למשמרת: ' + other.other_activist_shift_name;

            otherActivistInfo += other.other_activist_first_name + ' ' + other.other_activist_last_name;
            otherActivistInfo += ' ת.ז ' + other.other_activist_personal_identity;

            return (
                <div key={index} className="TitleRow">
                    <p>{ballotDetails}</p>
                    <p>{shiftText}</p>
                    <p>
                        <strong className="item-space">{otherActivistInfo}</strong>
                        <strong className="item-space"> | </strong>
                        <strong className="item-space"> סטטוס אימות: </strong>
                        <span className="item-space">{getVerifyStatusTitle(other)}</span>
                        <span className="status-icon"> {getVerifyStatusIcon(other)}</span>
                    </p>
                </div>
            )
        });
    }

    let currentActivistInfo = 'ל';

    currentActivistInfo += activistDetails.first_name + ' ' + activistDetails.last_name;
    currentActivistInfo += ' ת.ז ' + activistDetails.personal_identity;

    return (
        <ModalWindow show={show} title="החלפת שיבוץ"  buttonOk={editRoleBallot.bind(this)} buttonCancel={hideEditModals.bind(this)}
                     buttonX={hideEditModals.bind(this)} style={{zIndex: '9001'}}>
            {getOtherActivists()}
            <div className="TitleRow">
                <p>האם ברצונך להחליף את השיבוץ ?</p>
                <p>
                    <strong className="item-space">{currentActivistInfo}</strong>
                </p>
            </div>
        </ModalWindow>
    );
};

export default ChangeShiftAlertModal;