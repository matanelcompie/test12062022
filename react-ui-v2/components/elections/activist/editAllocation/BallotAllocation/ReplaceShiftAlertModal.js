import React from 'react';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';

class ReplaceShiftAlertModal extends React.Component {
    constructor(props) {
        super(props);
        this.initState = {
            sentMsgToPrevActivist: false,
            sentMsgToNextActivist: false,
        }
        this.state = { ...this.initState };
    }
    addGeoBallotToActivistRole() {
        //REMOVED
        // let activistMessagesData = {
        //     msg_to_prev_activist: this.state.sentMsgToPrevActivist,
        //     msg_to_next_activist: this.state.sentMsgToNextActivist,
        // }
        this.props.addGeoBallotToActivistRole(this.props.ballotItem.key, this.props.geoItem.election_role_shift_key);
        this.setState({ ...this.initState })
    }
    hideReplaceShiftModal(){
        this.props.hideReplaceShiftModal();
        this.setState({ ...this.initState })
    }
    getVerifyStatusTitle() {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        switch ( this.props.geoItem.verified_status ) {
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

    getVerifyStatusIcon() {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        let statusImg = '';
        let statusTitle = '';

        switch (this.props.geoItem.verified_status) {
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

    getBallotDetails() {
        let ballotDetails = 'בקלפי ';
        ballotDetails += this.props.ballotItem.name  + ' בכתובת: ';

        if ( this.props.ballotItem.street != null ) {
            ballotDetails += this.props.ballotItem.street;
        }
        ballotDetails += this.props.ballotItem.city_name;

        return ballotDetails;
    }

    getShiftName() {
        return ('משובצת למשמרת: ' + this.props.geoItem.election_role_shift_name);
    }

    getOtherActivistInfo() {
        let otherActivistInfo = 'ל' + this.props.geoItem.first_name + ' ' + this.props.geoItem.last_name;
        otherActivistInfo += ' ת.ז ' + this.props.geoItem.personal_identity;

        return otherActivistInfo;
    }

    getCurrentActivistInfo() {
        let currentActivistInfo = 'ל' + this.props.activistDetails.first_name + ' ' + this.props.activistDetails.last_name;
        currentActivistInfo += ' ת.ז ' + this.props.activistDetails.personal_identity;

        return currentActivistInfo;
    }
    onChangeInput(fieldName){
        let newState = { ...this.state };
        newState['sentMsgTo' + fieldName] = !newState['sentMsgTo' + fieldName];
        this.setState(newState)
    }
    render() {
        return (
            <ModalWindow show={this.props.show} title="החלפת שיבוץ" 
                         buttonOk={this.addGeoBallotToActivistRole.bind(this)}
                         buttonCancel={this.hideReplaceShiftModal.bind(this)}
                         buttonX={this.hideReplaceShiftModal.bind(this)} style={{zIndex: '9001'}}>
                <div className="TitleRow">
                    <p>{this.getBallotDetails()}</p>
                    <p>{this.getShiftName()}</p>
                    <p>
                        <strong className="item-space">{this.getOtherActivistInfo()}</strong>
                        <strong className="item-space"> | </strong>
                        <strong className="item-space"> סטטוס אימות: </strong>
                        <span className="item-space">{this.getVerifyStatusTitle()}</span>
                        <span className="status-icon"> {this.getVerifyStatusIcon()}</span>
                    </p>
                </div>
                <div className="TitleRow">
                    <p>האם ברצונך להחליף את השיבוץ ?</p>
                    <p>
                        <strong className="item-space">{this.getCurrentActivistInfo()}</strong>
                    </p>
                </div>
                {/*<div>
                    <div className="checkbox">
                        <label>
                            <input checked={this.state.sentMsgNextActivist} onClick={this.onChangeInput.bind(this,'NextActivist')}
                             type="checkbox"/>שלח הודעה לפעיל המחליף על השיבוץ החדש
                        </label>
                    </div>
                </div>
                <div>
                    <div className="checkbox">
                        <label>
                            <input checked={this.state.sentMsgToPrevActivist} onClick={this.onChangeInput.bind(this,'PrevActivist')}
                             type="checkbox"/>שלח הודעה לפעיל המוחלף על השיבוץ המבוטל
                        </label>
                    </div>
                </div>*/}
            </ModalWindow>
        );
    }
}

export default ReplaceShiftAlertModal;