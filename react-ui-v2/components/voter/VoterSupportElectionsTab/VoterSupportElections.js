import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import VoterSupport from './VoterSupport';
import VoterActivity from './VoterActivity';
import VoterBallot from './VoterBallot';


import * as VoterActions from '../../../actions/VoterActions';


class VoterSupportElections extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.collapseTitles = {
            suppprt: 'תמיכה',
            activity: 'פעילות בחירות',
            ballot: 'קלפי'
        };

        this.newGroupButtonText = "קבוצה חדשה";
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.supportBlockClass = "tab-content tabContnt hidden";

        this.supportTabStyle = {
            display: "none"
        };

        this.activityTabStyle = {
            display: "none"
        };

        this.ballotTabStyle = {
            display: "none"
        };
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.supportBlockClass = "tab-content tabContnt";

            this.supportTabStyle = {};
            this.activityTabStyle = {};
            this.ballotTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections'] == true) {
            this.supportBlockClass = "tab-content tabContnt";
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.support_status'] == true) {
            this.supportTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.election_activity'] == true) {
            this.activityTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.support_and_elections.ballot'] == true) {
            this.ballotTabStyle = {};
        }
    }

    updateCollapseStatus(container) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_COLLAPSE_CHANGE, container: container});
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        return (
            <div className={this.supportBlockClass} id="tabSupportElections" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                    <div className="ContainerCollapse" style={this.supportTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'supportElectionsSupport')}
                           aria-expanded={this.props.containerCollapseStatus.supportElectionsSupport}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">{this.collapseTitles.suppprt}</div>
                            </div>
                        </a>

                        <VoterSupport/>
                    </div>

                    <div className="ContainerCollapse" style={this.activityTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'supportElectionsActivity')}
                           aria-expanded={this.props.containerCollapseStatus.supportElectionsActivity}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">{this.collapseTitles.activity}</div>
                            </div>
                        </a>

                        <VoterActivity/>
                    </div>

                    <div className="ContainerCollapse" style={this.ballotTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'supportElectionsBallot')}
                           aria-expanded={this.props.containerCollapseStatus.supportElectionsBallot}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">{this.collapseTitles.ballot}</div>
                            </div>
                        </a>

                        <VoterBallot/>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterSupportElections));