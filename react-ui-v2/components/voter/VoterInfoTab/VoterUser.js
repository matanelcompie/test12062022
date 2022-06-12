import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import Collapse from 'react-collapse';

import * as SystemActions from '../../../actions/SystemActions';


import VoterSystemUserGeographicFilters from './VoterSystemUserGeographicFilters';
import VoterSystemUserSectorialFilters from './VoterSystemUserSectorialFilters';

import { dateTimeReversePrint } from '../../../libs/globalFunctions';


class VoterUser extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {

        this.labels = {
            systemUser: 'משתמש מערכת',
            addUser: 'יצירת משתמש',
            systemUserNo: 'מספר משתמש',
            passwordDate: 'תאריך סיסמא',
            systemRole: 'תפקיד',
            systemTeam: 'צוות'
        };

        this.saveButtonText = "שמירה";

        this.userDetailsStyle = {
            fontSize: '15px',
            padding: '6px 12px'
        };
    }

    initVariables() {
        this.activeText = '';
        if (this.props.voterSystemUser.active) {
            this.activeText = 'פעיל';
        } else {
            this.activeText = 'לא פעיל';
        }

        this.passwordDate = this.props.voterSystemUser.password_date;
        if (this.passwordDate.length > 0) {
            this.passwordDate = dateTimeReversePrint(this.passwordDate, true, true);
        }
    }
    addNewUser() {
            this.props.dispatch({ type: SystemActions.ActionTypes.USERS.CLEAN_ADDING_USER });
            SystemActions.loadUser('identity', this.props.dispatch, this.props.router, this.props.oldVoterDetails.personal_identity);
    }
    getUserKeyValue() {
        let userKey = this.props.voterSystemUser.key;

        let user_link_to = '/system/users/' + userKey;

        let isAdmin = this.props.currentUser.admin;
        let hasEditPermission = (isAdmin || this.props.currentUser.permissions['elections.voter.additional_data.user.goto_user'] == true);
        let hasAddPermission = (isAdmin || this.props.currentUser.permissions['elections.voter.additional_data.user.add'] == true);

        if (!userKey && hasAddPermission && this.props.oldVoterDetails.personal_identity) {
            this.userKeyValue = <a onClick={this.addNewUser.bind(this)} style={{cursor:'pointer'}}>{this.labels.addUser}</a>
            return;
        }
        if (hasEditPermission) {
            this.userKeyValue = <Link to={user_link_to}>{userKey}</Link>;
        } else {
            this.userKeyValue = userKey;
        }

    }

    render() {

        this.initVariables();

        this.getUserKeyValue();
        return (
            <Collapse isOpened={this.props.containerCollapseStatus.infoUser}>
                <div className="row CollapseContent">
                    <div className="col-md-4">
                        <form className="form-horizontal fieldGroup readonlyGroup">
                            <div className="form-group">
                                <label htmlFor="systemUser" className="col-sm-6 control-label">
                                    {this.labels.systemUser}
                                </label>
                                <div className="col-sm-6" style={this.userDetailsStyle}>
                                    {this.activeText}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="systemUserNo" className="col-sm-6 control-label">
                                    {this.labels.systemUserNo}
                                </label>
                                <div className="col-sm-6" style={this.userDetailsStyle}>
                                    {this.userKeyValue}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="passwordDate" className="col-sm-6 control-label">
                                    {this.labels.passwordDate}
                                </label>
                                <div className="col-sm-6" style={this.userDetailsStyle}>
                                    {this.passwordDate}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="systemRole" className="col-sm-6 control-label">
                                    {this.labels.systemRole}
                                </label>
                                <div className="col-sm-6" style={this.userDetailsStyle}>
                                    {this.props.voterSystemUser.role_name}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="systemTeam" className="col-sm-6 control-label">
                                    {this.labels.systemTeam}
                                </label>
                                <div className="col-sm-6" style={this.userDetailsStyle}>
                                    {this.props.voterSystemUser.team_name}
                                </div>
                            </div>
                        </form>
                    </div>

                    <VoterSystemUserGeographicFilters geographicFilters={this.props.voterSystemUserGeographicFilters} />

                    <VoterSystemUserSectorialFilters sectorialFilters={this.props.voterSystemUserSectorialFilters} />

                    <div className="col-lg-12 hidden">
                        <div className="form-group">
                            <div className="">
                                <button className="btn btn-primary saveChanges">{this.saveButtonText}</button>
                            </div>
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
        oldVoterDetails: state.voters.oldVoterDetails,
        voterSystemUser: state.voters.voterScreen.voterSystemUser,
        voterSystemUserGeographicFilters: state.voters.voterScreen.voterSystemUserGeographicFilters,
        voterSystemUserSectorialFilters: state.voters.voterScreen.voterSystemUserSectorialFilters,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterUser));