import React from 'react';

import constants from 'libs/constants';

import ModalWindow from 'components/global/ModalWindow';

class AlertUpdateLeaderModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buttons: [
                {
                    class: 'btn btn-default btn-secondary pull-right',
                    text: 'סגור',
                    action: this.props.hideModal.bind(this),
                    disabled: false
                },
                {
                    class: 'btn btn-primary',
                    text: 'אישור',
                    action: this.replaceAssignmetClusterLeaderToCurrentActivist.bind(this),
                    disabled: false
                }
            ]
        };
    }

    replaceAssignmetClusterLeaderToCurrentActivist() {
        this.props.replaceAssignmetClusterLeaderToCurrentActivist(this.props.clusterLeader);
    }

    getVerifyStatusTitle() {
        const verifyStatus = constants.activists.verifyStatus;
        const verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        switch ( this.props.clusterLeader.verified_status ) {
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

        switch (this.props.clusterLeader.verified_status) {
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

    getActivistDetails() {
        let activistDetails = 'ל';

        activistDetails += this.props.activistDetails.first_name + ' ' + this.props.activistDetails.last_name;
        activistDetails += ' ת.ז ' + this.props.activistDetails.personal_identity;

        return activistDetails;
    }

    getCurrentLeaderDetails() {
        let leaderDetails = 'ל';

        leaderDetails += this.props.clusterLeader.first_name + ' ' + this.props.clusterLeader.last_name;
        leaderDetails += ' ת.ז ' + this.props.clusterLeader.personal_identity;

        return leaderDetails;
    }

    getClusterDetails() {
        let clusterDetails = 'אשכול ';
        clusterDetails += this.props.clusterName + ' משובץ';

        return clusterDetails;
    }

    render() {
        return (
            <ModalWindow show={this.props.show} buttonX={this.props.hideModal.bind(this)}
                         title="החלפת שיבוץ" style={{zIndex: '9001'}} buttons={this.state.buttons}>
                <div className="TitleRow">
                    <p>{this.getClusterDetails()}</p>
                    <p>
                        <strong className="item-space">{this.getCurrentLeaderDetails()}</strong>
                        <strong className="item-space"> | </strong>
                        <strong className="item-space"> סטטוס אימות: </strong>
                        <span className="item-space">{this.getVerifyStatusTitle()}</span>
                        <span className="status-icon"> {this.getVerifyStatusIcon()}</span>
                    </p>
                </div>

                <div className="TitleRow">
                    <p>האם ברצונך להחליף את השיבוץ ?</p>
                    <p>
                        <strong className="item-space">{this.getActivistDetails()}</strong>
                    </p>
                </div>

                {/* <div>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox"/>שלח הודעה לפעיל המחליף על השיבוץ החדש
                        </label>
                    </div>
                </div>
                <div>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox"/>שלח הודעה לפעיל המוחלף על השיבוץ המבוטל
                        </label>
                    </div>
                </div> */}
            </ModalWindow>
        );
    }
}

export default AlertUpdateLeaderModal;