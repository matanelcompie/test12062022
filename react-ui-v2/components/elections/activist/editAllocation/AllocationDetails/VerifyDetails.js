import React from 'react';
import { connect } from 'react-redux';

import constants from 'libs/constants';

import MessageItem from './MessageItem';
import ModalSendSms from '../ModalSendSms';
import HouseholdDetails from './HouseholdDetails';

import * as ElectionsActions from '../../../../../actions/ElectionsActions';


class VerifyDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sendSmsModal: {
                show: false,

                phone_number: ''
            }
        };

        this.initConstants();
    }

    initConstants() {
        this.electionRoleSytemNames = constants.electionRoleSytemNames;
        this.verifyStatus = constants.activists.verifyStatus;
        this.verifiedStatusTitle = constants.activists.verifiedStatusTitle;

        this.texts = {
           button: 'שלח הודעת אימות'
        };
    }

    changeLockStatus(event) {
        let isLock=event.target.checked;
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
        if ( roleIndex > -1 ) {
            ElectionsActions.changeLockStatus(this.props.dispatch, activistItem.election_roles_by_voter[roleIndex].id,isLock,
                                              this.props.currentUser);
        }
    }

    sendSms() {
        this.hideSmsModal();

        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
      
 
        ElectionsActions.sendMessageToActivist(this.props.dispatch, activistItem.election_roles_by_voter[roleIndex].key, this.props.currentUser);
    }

    hideSmsModal() {
        let sendSmsModal = this.state.sendSmsModal;

        sendSmsModal.show = false;
        sendSmsModal.phone_number = '';

        this.setState({sendSmsModal});
    }

    showSmsModal() {
        let sendSmsModal = this.state.sendSmsModal;
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        //if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty) {
            roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
       // }

        sendSmsModal.show = true;

        if ( roleIndex > -1 ) {
            sendSmsModal.phone_number = activistItem.election_roles_by_voter[roleIndex].phone_number;
        }

        this.setState({sendSmsModal});
    }

    getVerifyStatusIcon() {
        let statusImg = '';
        let statusTitle = '';

        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

       // if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty) {
            roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
       // }

        if ( -1 == roleIndex ) {
            return '\u00A0';
        }

        switch (activistItem.election_roles_by_voter[roleIndex].verified_status) {
            case this.verifyStatus.noMessageSent:
                statusImg = window.Laravel.baseAppURL + 'Images/Grey-clock.png';
                statusTitle = this.verifiedStatusTitle.noMessageSent;
                break;

            case this.verifyStatus.messageSent:
                statusImg = window.Laravel.baseAppURL + 'Images/ico-status-pending.svg';
                statusTitle = this.verifiedStatusTitle.messageSent;
                break;

            case this.verifyStatus.verified:
                statusImg = window.Laravel.baseAppURL + 'Images/ico-status-done.svg';
                statusTitle = this.verifiedStatusTitle.verified;
                break;

            case this.verifyStatus.refused:
                statusImg = window.Laravel.baseAppURL + 'Images/ico-status-fail.svg';
                statusTitle = this.verifiedStatusTitle.refused;
                break;

            case this.verifyStatus.moreInfo:
                statusImg = window.Laravel.baseAppURL + 'Images/Question.png';
                statusTitle = this.verifiedStatusTitle.moreInfo;
                break;
        }

        return <img data-toggle="tooltip" data-placement="left" title={statusTitle} src={statusImg}
                    data-original-title={statusTitle}/>
    }

    getVerifyStatusTitle() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

       // if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty) {
            roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
      //  }

        if ( -1 == roleIndex ) {
            return '\u00A0';
        }

        switch ( activistItem.election_roles_by_voter[roleIndex].verified_status ) {
            case this.verifyStatus.noMessageSent:
                return this.verifiedStatusTitle.noMessageSent;

            case this.verifyStatus.messageSent:
                return this.verifiedStatusTitle.messageSent;

            case this.verifyStatus.verified:
                return this.verifiedStatusTitle.verified;

            case this.verifyStatus.refused:
                return this.verifiedStatusTitle.refused;

            case this.verifyStatus.moreInfo:
                return this.verifiedStatusTitle.moreInfo;
        }
    }

    isVerified() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);

        if ( -1 == roleIndex ) {
            return false;
        }

        return (activistItem.election_roles_by_voter[roleIndex].verified_status == this.verifyStatus.verified)? true : false;
    }

    getDate(dateTime) {
		if(!dateTime){return '';}
        let dateElements = dateTime.split(' ');
        let dateItem = dateElements[0];

        return dateItem.split('-').reverse().join('/');
    }

    getTime(dateTime) {
		if(!dateTime){return '';}
        let dateElements = dateTime.split(' ');
        let timeArr = dateElements[1].split(':');

        return timeArr[0] + ':' + timeArr[1];
    }

    initVariables() {
        this.blockStyle = {};

        if ( !this.props.display ) {
            this.blockStyle = {display: "none"};
        }

        this.userCreateName = '\u00A0';
        this.userCreateDate = '\u00A0';
        this.userCreateTime = '\u00A0';

        this.userUpdateName = '\u00A0';
        this.userUpdateDate = '\u00A0';
        this.userUpdateTime = '\u00A0';

        this.userLockName = '\u00A0';
        this.userLockDate = '\u00A0';
        this.userLockTime = '\u00A0';

        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

    //    if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty) {
            roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
      //  }

        if ( roleIndex > -1 ) {
			if(!activistItem.election_roles_by_voter[roleIndex].user_create_first_name){
				this.userCreateName = '-';
			}
			else{
				this.userCreateName = activistItem.election_roles_by_voter[roleIndex].user_create_first_name + ' ';
				this.userCreateName += activistItem.election_roles_by_voter[roleIndex].user_create_last_name;
			}
            this.userCreateDate = this.getDate(activistItem.election_roles_by_voter[roleIndex].created_at);
            this.userCreateTime = this.getTime(activistItem.election_roles_by_voter[roleIndex].created_at);

			if(!activistItem.election_roles_by_voter[roleIndex].user_update_first_name){
				this.userUpdateName = '-';
			}
			else{
				this.userUpdateName = activistItem.election_roles_by_voter[roleIndex].user_update_first_name + ' ';
				this.userUpdateName += activistItem.election_roles_by_voter[roleIndex].user_update_last_name;
			}
			
            this.userUpdateDate = this.getDate(activistItem.election_roles_by_voter[roleIndex].updated_at);
            this.userUpdateTime = this.getTime(activistItem.election_roles_by_voter[roleIndex].updated_at);

            if ( activistItem.election_roles_by_voter[roleIndex].user_lock_id != null ) {
                this.userLockName = activistItem.election_roles_by_voter[roleIndex].user_lock_first_name + ' ';
                this.userLockName += activistItem.election_roles_by_voter[roleIndex].user_lock_last_name;

                this.userLockDate = this.getDate(activistItem.election_roles_by_voter[roleIndex].lock_date);
                this.userLockTime = this.getTime(activistItem.election_roles_by_voter[roleIndex].lock_date);
            }
        }
    }

    renderMessages() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        let that = this;

       // if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty) {
            roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
      //  }

        if ( -1 == roleIndex ) {
            return;
        }

        let messages = (activistItem.election_roles_by_voter[roleIndex].messages ? activistItem.election_roles_by_voter[roleIndex].messages.map( function(item, index) {
            return <MessageItem key={index} item={item} getDate={that.getDate.bind(that)} getTime={that.getTime.bind(that)}/>
        }) : null);

        return <tbody>{messages}</tbody>;
    }

    /**
     * This function checks if the allocation
     * is for ballot member or observer.
     * If the allocation is for ballot, then
     * it check if the current user has permission.
     * to lock the allocation
     *
     * @returns {boolean}
     */
    isAllowedToLock() {
        let lockPermission = 'elections.activists.' + this.props.currentTabRoleSystemName + '.lock';
        return (this.props.currentUser.admin || this.props.currentUser.permissions[lockPermission] == true);
    }

    /**
     * This function checks if the current user
     * is allowed to delete allocation for a role
     * which is not captain50 .
     *
     * @returns {boolean|*|string}
     */
    isUserAllowedToDeleteAllocation() {
        let deletePermission = 'elections.activists.' + this.props.currentTabRoleSystemName + '.delete';
        return ( this.props.currentUser.admin || this.props.currentUser.permissions[deletePermission] == true );
    }

    /**
     * This function checks if the
     * allocation is locked.
     *
     * @returns {boolean}
     */
    isAllocationLocked() {
        let roleIndex = -1;
        let activistItem = this.props.activistDetails;

        roleIndex = activistItem.election_roles_by_voter.findIndex(roleItem => roleItem.system_name == this.props.currentTabRoleSystemName);
        if (roleIndex > -1) {
            return (activistItem.election_roles_by_voter[roleIndex].user_lock_id != null);
        } else {
            return false;
        }
    }

    renderVerifyDetails() {
        this.initVariables();

        return (
            <div className="dtlsSubBox2 attrbtrDtls borderR"  >
                <div className="row margin-bottom-normal">
                    <div className="col-lg-6 flexed left-separator-line">
                        <dl className="item-space">
                            <dt>עובד מגדיר</dt>
                            <dd>{this.userCreateName}</dd>
                        </dl>
                        <dl>
                            <dt>מועד הגדרה</dt>
                            <dd>
                                <span className="time">{this.userCreateTime}</span>
                                <span className="date">{this.userCreateDate}</span>
                            </dd>
                        </dl>
                    </div>
                    <div className="col-lg-6 flex-end">
                        <dl className="item-space">
                            <dt>עובד מעדכן</dt>
                            <dd>{this.userUpdateName}</dd>
                        </dl>
                        <dl>
                            <dt>מועד עידכון</dt>
                            <dd>
                                <span className="time">{this.userUpdateTime}</span>
                                <span className="date">{this.userUpdateDate}</span>
                            </dd>
                        </dl>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="rsltsTitleRow flexed flexed-space-between">
                            <div className="bg-item-grey">
                                <span className="item-space"><label>סטטוס אימות נוכחי</label></span>
                                <span className="item-space">{this.getVerifyStatusTitle()}</span>
                                {this.getVerifyStatusIcon()}
                            </div>
                            <button title="שלח הודעת אימות" type="submit" className="btn new-btn-default saveChanges"
                                    onClick={this.showSmsModal.bind(this)}
                                    disabled={this.isVerified()}>
                                {this.texts.button}
                            </button>
                        </div>
                    </div>
                </div>
                { ( this.props.renderCaptainComponent() ) &&
                    <HouseholdDetails display={this.props.currentTabRoleSystemName == this.electionRoleSytemNames.ministerOfFifty}
                                      currentTabRoleSystemName={this.props.currentTabRoleSystemName}
                                      capatainItem={this.props.capatainItem} currentUser={this.props.currentUser}
                                      deleteElectionActivistRole={this.props.deleteElectionActivistRole.bind(this)}/>
                    }

                <div className="row">
                    <div className="col-lg-12" style={{height: '650px', overflowY: 'auto'}}>
                        <table className="table table-frame standard-frame table-multi-line table-striped">
                            <thead>
                            <tr>
                                <th>מועד</th>
                                <th>כיוון</th>
                                <th>טקסט</th>
                                <th>מס' נייד</th>
                                <th>סטטוס אימות</th>
                            </tr>
                            </thead>

                            {this.renderMessages()}
                        </table>
                    </div>
                </div>

                { ( this.isAllowedToLock() ) &&
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="checkbox locking">
                                <input type="checkbox" id="checkbox-locking-role-details" checked={this.isAllocationLocked()}
                                       onChange={this.changeLockStatus.bind(this)}/>
                                <label htmlFor="checkbox-locking-role-details">
                                    <span className="icon-locking"></span>
                                    <span className="text-label">
                                        {this.isAllocationLocked() ? 'שחרר נעילת שיבוץ' : 'נעל שיבוץ'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                }

                { ( this.isAllocationLocked() ) &&
                <div className="row margin-bottom-normal">
                    <div className="col-lg-6 flexed">
                        <dl className="item-space">
                            <dt>משתמש נועל</dt>
                            <dd>{this.userLockName}</dd>
                        </dl>
                        <dl>
                            <dt>מועד נעילה</dt>
                            <dd>
                                <span className="time">{this.userLockTime}</span>
                                <span className="date">{this.userLockDate}</span>
                            </dd>
                        </dl>
                    </div>
                </div>
                }

                { ( this.isUserAllowedToDeleteAllocation() && !this.isAllocationLocked() ) &&
                <div className="btnRow">
                    <button title="מחק שיבוץ" type="submit" className="btn btn-primary dark"
                            onClick={this.props.deleteElectionActivistRole.bind(this)}>
                        <span className="icon-del"></span>
                        <span>מחק שיבוץ</span>
                    </button>
                </div>
                }

                <ModalSendSms show={this.state.sendSmsModal.show}
                             phone_number={this.state.sendSmsModal.phone_number}
                             hideSmsModal={this.hideSmsModal.bind(this)}
                             sendSms={this.sendSms.bind(this)}
                             activistDetails={this.props.activistDetails}
                             currentTabRoleSystemName={this.props.currentTabRoleSystemName}/>
            </div>
        );
    }

    shouldComponentBeRendered() {
        if ( this.props.currentTabRoleSystemName != this.electionRoleSytemNames.ministerOfFifty ) {
            return true;
        } else {
            return false;
        }
    }

    render() {
   
            return this.renderVerifyDetails();
        
    }
}

function mapStateToProps(state) {
    return {
        activistDetails: state.elections.activistsScreen.activistDetails,
        currentUser: state.system.currentUser,
    }
}

export default connect(mapStateToProps) (VerifyDetails);