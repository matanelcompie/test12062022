import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';

import * as VoterActions from '../../../actions/VoterActions';

import VoterInstitutes from './VoterInstitutes';
import VoterGroups from './VoterGroups';
import VoterPartyRepresentative from './VoterPartyRepresentative';


class VoterParty extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.collapseTitles = {
            shasGroups: 'קבוצות ש"ס',
            shasRepresentative: 'נציג ש"ס',
            shasInstitutes: 'מוסדות ש"ס'
        };
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.partyBlockClass = "tab-content tabContnt hidden";

        this.instituteTabStyle = {
            display: "none"
        };

        this.groupTabStyle = {
            display: "none"
        };

        this.representativeTabStyle = {
            display: "none"
        };
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.partyBlockClass = "tab-content tabContnt";

            this.instituteTabStyle = {};
            this.groupTabStyle = {};
            this.representativeTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.political_party'] == true) {
            this.partyBlockClass = "tab-content tabContnt";
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_institutes'] == true) {
            this.instituteTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_groups'] == true) {
            this.groupTabStyle = {};
        }

        if (this.props.currentUser.permissions['elections.voter.political_party.shas_representative'] == true) {
            this.representativeTabStyle = {};
        }
    }

    updateCollapseStatus(container) {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_SCREEN_COLLAPSE_CHANGE,
                             container: container});
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        return (
            <div className={this.partyBlockClass} id="tabParty" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                    <div className="ContainerCollapse" style={this.instituteTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'partyInstitutes')}
                           aria-expanded={this.props.containerCollapseStatus.partyInstitutes}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">{this.collapseTitles.shasInstitutes}</div>
                            </div>
                        </a>

                        <VoterInstitutes/>
                    </div>

                    <div className="ContainerCollapse" style={this.groupTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'partyGroups')}
                           aria-expanded={this.props.containerCollapseStatus.partyGroups}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">{this.collapseTitles.shasGroups}</div>
                            </div>
                        </a>

                        <VoterGroups/>
                    </div>

                    <div className="ContainerCollapse" style={this.representativeTabStyle}>
                        <a onClick={this.updateCollapseStatus.bind(this, 'partyRepresentative')}
                           aria-expanded={this.props.containerCollapseStatus.partyRepresentative}>
                            <div className="row panelCollapse">
                                <div className="collapseArrow closed"></div>
                                <div className="collapseArrow open"></div>
                                <div className="collapseTitle">{this.collapseTitles.shasRepresentative}</div>
                            </div>
                        </a>

                        <VoterPartyRepresentative representativesList={this.props.representativesList}
                                                  oldRepresentativesList={this.props.oldRepresentativesList}/>
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

export default connect(mapStateToProps)(withRouter(VoterParty));