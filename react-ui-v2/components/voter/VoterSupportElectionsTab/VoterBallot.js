import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import VoterBallotItem from './VoterBallotItem';

import * as VoterActions from '../../../actions/VoterActions';


class VoterBallot extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.saveButtonText = 'שמירה';

        this.setDirtyTarget = "elections.voter.support_and_elections.ballot";
    }

    saveVoterElectionCampaign(e) {
        // Prevent page refresh
        e.preventDefault();

        let voterElectionCampaigns = this.props.voterElectionCampaigns;
        let electionData = [];
        let votesData = [];
        let voterKey = this.props.router.params.voterKey;
        let transportKey = voterElectionCampaigns[0].voter_transportation_key;

        electionData = {
            did_vote: voterElectionCampaigns[0].did_vote,
            voter_transport_from_time: voterElectionCampaigns[0].voter_transport_from_time,
            voter_transport_to_time: voterElectionCampaigns[0].voter_transport_to_time
        };

        if ( 0 == voterElectionCampaigns[0].voter_transport_crippled.length ) {
            electionData.voter_transport_crippled = null;
        } else {
            electionData.voter_transport_crippled = voterElectionCampaigns[0].voter_transport_crippled;
        }

        if ( transportKey != null ) {
            VoterActions.saveVoterBallotWithTransportKey(this.props.dispatch, voterKey, electionData, transportKey);
        } else {
            VoterActions.saveVoterBallot(this.props.dispatch, voterKey, electionData);
        }
    }

    renderElectionCampaigns() {
        var editingMode = false;
        var enableEditing = false;
        var voterElectionCampaigns = this.props.voterElectionCampaigns;
        var editingVoterElectionCampaignsIndex = this.props.editingVoterElectionCampaignsIndex;

        let currentDate = new Date();

        var seconds = currentDate.getSeconds();
        var minutes = currentDate.getMinutes();
        var hour = currentDate.getHours();

        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1;
        let day = currentDate.getDate();

        let currentDateStr =  year + '-' + month + '-'  + day + ' ' + hour + ':' + minutes + ':' + seconds;

        let campaignsRows = voterElectionCampaigns.map(function (campaignItem, index) {

            if ( campaignItem.vote_key != null ) {
                enableEditing = false;
            } else {
                if ( null == campaignItem.election_campaign_end_date ) {
                    enableEditing = true;
                } else if ( currentDateStr > campaignItem.election_campaign_end_date ) {
                    enableEditing = false;
                } else {
                    enableEditing = true;
                }
            }

            if ( enableEditing ) {
                if ( index == editingVoterElectionCampaignsIndex ) {
                    editingMode = true;
                } else {
                    editingMode = false;
                }
            }

            return <VoterBallotItem key={index}
                                    voterCampaignIndex={index}
                                    item={campaignItem}
                                    editing_mode={editingMode}
                                    enable_editing={enableEditing}
            />
        });

        return (
            <tbody>
                {campaignsRows}
            </tbody>
        );
    }

    checkEditedVotes( ) {
        var voterElectionCampaigns = this.props.voterElectionCampaigns;

        if ( 0 == voterElectionCampaigns.length) {
            return false;
        }

        if (null == voterElectionCampaigns[0].vote_id) {
            return true;
        } else {
            return false;
        }
    }

    validateData() {
        var voterElectionCampaigns = this.props.voterElectionCampaigns;

        if ( 0 == voterElectionCampaigns.length ) {
            this.saveButtonDisabled = false;
            return;
        }

        this.validInputs = true;

        if ( -1 == voterElectionCampaigns[0].voter_transport_crippled ) {
            this.validInputs = false;
        }

        if ( -1 == voterElectionCampaigns[0].did_vote ) {
            this.validInputs = false;
        }
    }

    renderButton() {
        var displayButton = false;

        if ( this.props.currentUser.admin ||
             this.props.currentUser.permissions['elections.voter.support_and_elections.ballot.edit'] == true ) {
            displayButton = true;
        }

        if ( displayButton && this.checkEditedVotes() ) {
            return (
                <div className="col-lg-12">
                    <div className="form-group">
                        <div className="">
                            <button type="submit" className="btn btn-primary saveChanges"
                                    onClick={this.saveVoterElectionCampaign.bind(this)}
                                    disabled={this.props.editingVoterElectionCampaignsIndex != -1 || !this.validInputs
                                              || !this.ballotHasChanged || this.props.savingChanges}>
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
            this.ballotHasChanged = false;
        } else {
            this.ballotHasChanged = true;
        }
    }

    render() {

        this.validateData();

        this.checkAnyChanges();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.supportElectionsBallot}>
                <div className="row CollapseContent">
                    <table className="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>מערכת בחירות</th>
                            <th>אשכול</th>
                            <th>קלפי</th>
                            <th>מספר בוחר</th>
                            <th>הסעה</th>
                            <th>שעת התחלה</th>
                            <th>שעת סיום</th>
                            <th>קלפי מדווחת</th>
                            <th>הצביע</th>
                            <th>מועד עדכון</th>
                            <th style={{minWidth:'80px'}}>אופן עדכון</th>
                        </tr>
                        </thead>

                        {this.renderElectionCampaigns()}
                    </table>

                    {this.renderButton()}
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        voterElectionCampaigns: state.voters.voterScreen.voterElectionCampaigns,
        editingVoterElectionCampaignsIndex: state.voters.voterScreen.editingVoterElectionCampaignsIndex,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterBallot));
