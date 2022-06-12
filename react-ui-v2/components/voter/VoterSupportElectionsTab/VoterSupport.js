import React from 'react';
import { Link, withRouter } from 'react-router';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';

import Combo from '../../../components/global/Combo';
import { dateTimeReversePrint } from 'libs/globalFunctions';
import  * as constants from 'libs/constants';


class VoterSupport extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.paneltitles = {
            support: 'תמיכה'
        };

        this.labels = {
            statusBranch: "סטטוס סניף",
            statusTm: "סטטוס TM"
        };

        this.placeholders = {
            statusBranch: "סטטוס סניף",
            statusTm: "סטטוס TM"
        };

        this.titles = {
            time: 'תקופה',
            tm: 'טלמרקטינג',
            ballotBox: 'סניף',
            final: 'סופי'
        };

        this.updatedByText = 'עודכן ע"י';
        this.saveButtonText = "שמירה";

        this.statusStyle = {
            border: '1px solid #dce2e0',
            paddingRight: '5px'
        };

        this.subHeaders = {
            current: 'נוכחי',
            history: 'היסטוריה'
        };

        this.setDirtyTarget = "elections.voter.support_and_elections.support_status";
    }

    saveVoterSupport(e) {
        // Prevent page refresh
        e.preventDefault();

        if (!this.validInputs) {
            return;
        }

        let voterSupportStatuses = this.props.voterSupportStatuses;
        let voterKey = this.props.router.params.voterKey;
        let supportStatusId0 = '';

        // if the user does'nt have a support status and he
        // hasn't chosen a value, then there is no need to bother
        // the server
        if (0 == voterSupportStatuses.support_status_id0 &&
            null == voterSupportStatuses.voter_support_status_key0) {
            return;
        }

        if (0 == voterSupportStatuses.support_status_id0) {
            supportStatusId0 = null;
        } else {
            supportStatusId0 = voterSupportStatuses.support_status_id0;
        }

        if (null == voterSupportStatuses.voter_support_status_key0) {
            VoterActions.saveVoterSupportStatuses(this.props.dispatch, voterKey,
                voterSupportStatuses.support_status_id0);
        } else {
            VoterActions.saveVoterSupportStatusWithKey(this.props.dispatch, voterKey,
                voterSupportStatuses.voter_support_status_key0,
                voterSupportStatuses.support_status_id0);
        }
    }

    /**
     * This function returns the city id
     * by the city name.
     *
     * @param supportStatusName
     * @returns {number}
     */
    getSupportStatusId(supportStatusName) {
        let supportStatuses = this.props.supportStatuses;
        let supportStatusIndex = -1;
        let supportStatusId = 0;

        supportStatusIndex = supportStatuses.findIndex(statusItem => statusItem.name == supportStatusName);
        if (-1 == supportStatusIndex) {
            return 0;
        } else {
            supportStatusId = supportStatuses[supportStatusIndex].id;
            return supportStatusId;
        }
    }

    supportStatusChange(e) {
        var supportStatusName = e.target.value;
        var supportStatusId = 0;

        supportStatusId = this.getSupportStatusId(supportStatusName);
        this.props.dispatch({
            type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_SUPPORT_STATUS_CHANGE,
            supportStatusId: supportStatusId, supportStatusName: supportStatusName
        });

        this.props.dispatch({ type: SystemActions.ActionTypes.SET_DIRTY, target: this.setDirtyTarget });
    }

    initVariables() {
        this.statusDivClass = "form-group";
 
        if (this.props.voterSupportStatuses.branch_create_user_id == null ||
            this.props.voterSupportStatuses.branch_create_user_id == '') {
            this.userBranchUpdate = this.updatedByText + ' מערכת';
        } else {
            this.userBranchUpdate = this.updatedByText + ' ';
            this.userBranchUpdate += this.props.voterSupportStatuses.voter_branch_first_name;
            this.userBranchUpdate += ' ' + this.props.voterSupportStatuses.voter_branch_last_name;
        }

        if (this.branch_updated_at != null || this.branch_updated_at != '') {
            this.branch_updated_at = dateTimeReversePrint(this.props.voterSupportStatuses.branch_updated_at,
                true, true);
        } else {
            this.branch_updated_at = '';
        }

        if (this.props.voterSupportStatuses.tm_create_user_id == null ||
            this.props.voterSupportStatuses.tm_create_user_id == '') {
            this.userTmUpdate = this.updatedByText + ' מערכת';
        } else {
            this.userTmUpdate = this.updatedByText + ' ';
            this.userTmUpdate += this.props.voterSupportStatuses.voter_tm_first_name;
            this.userTmUpdate += ' ' + this.props.voterSupportStatuses.voter_tm_last_name;
        }

        if (this.tm_updated_at != null || this.tm_updated_at != '') {
            this.tm_updated_at = dateTimeReversePrint(this.props.voterSupportStatuses.tm_updated_at,
                true, true);
        } else {
            this.tm_updated_at = '';
        }

        if (this.props.voterSupportStatuses.support_status_name1 == '') {
            this.userTmUpdate = '';
            this.tm_updated_at = '';
        }
    }

    /**
     * This function validates the
     * voter support status.
     *
     * @returns {boolean}
     */
    validateStatus() {
        var statusName = this.props.voterSupportStatuses.support_status_name0;
        var statusId = this.props.voterSupportStatuses.support_status_id0;

        if (0 == statusName.length) {
            return true;
        }

        if (0 == statusId) {
            return false;
        } else {
            return true;
        }
    }

    validateVariables() {
        this.validInputs = true;

        if (this.validateStatus()) {
            this.statusDivClass = "form-group";
        } else {
            this.validInputs = false;
            this.statusDivClass = "form-group has-error";
        }
    }

    renderSupportStatuses() {
        let supportStatusesObj = this.props.supportStatusesObj;
        let supportStatuses = constants.supportStatuses;
        let supportRows = [];
        for (let id in supportStatusesObj) {
            let obj = supportStatusesObj[id];
            let row = <tr key={id}>
                <td>{obj.name}</td>
                <td>{obj.hasOwnProperty(supportStatuses.tm) ? obj[supportStatuses.tm] : ''}</td>
                <td>{obj.hasOwnProperty(supportStatuses.ballotBox) ? obj[supportStatuses.ballotBox] : ''}</td>
                <td>{obj.hasOwnProperty(supportStatuses.final) ? obj[supportStatuses.final] : ''}</td>
            </tr>;
            supportRows.push(row);
        }
        return supportRows;
    }

    renderButton() {
        var displayButton = false;

        if (this.props.currentUser.admin ||
            this.props.currentUser.permissions['elections.voter.support_and_elections.support_status.edit'] == true) {
            displayButton = true;
        }

        if (displayButton) {
            return (
                <div className="col-sm-12">
                    <div className="form-group">
                        <div className="">
                            <button className="btn btn-primary saveChanges"
                                onClick={this.saveVoterSupport.bind(this)}
                                disabled={!this.validInputs || !this.statusHasChanged || this.props.savingChanges}>
                                {this.saveButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.statusHasChanged = false;
        } else {
            this.statusHasChanged = true;
        }
    }

    render() {

        this.initVariables();

        this.validateVariables();

        this.checkAnyChanges();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.supportElectionsSupport}>
                <div className="row CollapseContent">
                    <div className="row panelContent">
                        <div className="col-md-6 subHeader">
                            <h4>{this.subHeaders.current}</h4>

                            <div className="row">
                                <div className="col-md-11 no-padding">
                                    <div className="panel panel-default">
                                        <div className="panel-body">
                                            <div>
                                                <form className="form-horizontal">
                                                    <div className={this.statusDivClass}>
                                                        <label htmlFor="branchStatus"
                                                            className="col-sm-3 control-label">
                                                            {this.labels.statusBranch}
                                                        </label>
                                                        <div className="col-sm-4">
                                                            <Combo id="branchStatus"
                                                                items={this.props.supportStatuses}
                                                                maxDisplayItems={10} itemIdProperty="id"
                                                                itemDisplayProperty='name'
                                                                className="form-combo-table"
                                                                value={this.props.voterSupportStatuses.support_status_name0}
                                                                onChange={this.supportStatusChange.bind(this)} />
                                                        </div>
                                                        <div className="col-sm-5 help-block hlpBlck"
                                                            id="statusUpdator1">
                                                            {this.userBranchUpdate}
                                                            {'\u00A0'}
                                                            <span className="updateDtls">
                                                                {this.branch_updated_at}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="branchStatusTM"
                                                            className="col-sm-3 control-label">
                                                            {this.labels.statusTm}
                                                        </label>
                                                        <div className="col-sm-4">
                                                            <input type="text" className="form-control"
                                                                id="branchStatusTM"
                                                                defaultValue={this.props.voterSupportStatuses.support_status_name1}
                                                                readOnly />
                                                        </div>
                                                        <div className="col-sm-5 help-block hlpBlck"
                                                            id="statusUpdator1">
                                                            {this.userTmUpdate} <span className="updateDtls"> {this.tm_updated_at}</span>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="col-md-6 subHeader no-padding">
                            <h4>{this.subHeaders.history}</h4>
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                    <th>{this.titles.time}</th>
                                        <th>{this.titles.tm}</th>
                                        <th>{this.titles.ballotBox}</th>
                                        <th>{this.titles.final}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderSupportStatuses()}
                                </tbody>
                            </table>

                            {this.renderButton()}
                        </div>
                    </div>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {

    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        supportStatuses: state.voters.searchVoterScreen.supportStatuses,
        lastCampaignId: state.voters.voterScreen.lastCampaignId,
        voterSupportStatuses: state.voters.voterScreen.supportStatuses,
        supportStatusesObj: state.voters.voterScreen.supportStatusesObj,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterSupport));