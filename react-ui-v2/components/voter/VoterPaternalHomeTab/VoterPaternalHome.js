import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux'

import * as VoterActions from '../../../actions/VoterActions';

import VoterHouseholdItem from './VoterHouseholdItem';
import ModalWindow from '../../global/ModalWindow';


/**
 * This class handles the patternal home lower tab.
 */
class VoterPaternalHome extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.panelTitle = "בית אב";
        this.tooltip = {
            editTitle: 'עריכה',
            deleteTitle: 'מחיקה'
        };
    }

    deleteElectionSupportStatus() {
        var voterKey = this.props.router.params.voterKey;
        var householdKey = this.props.deleteHouseholdKey;
        var voterSupportStatusKey = this.props.deleteSupportStatusKey;
        var lastCampaignId = this.props.lastCampaignId;

        this.hideDeleteModalDialog();

        VoterActions.deleteHouseholdStatus(this.props.dispatch, voterKey, householdKey, voterSupportStatusKey);
    }

    hideDeleteModalDialog() {
        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_PATTERNAL_HIDE_DELETE_STATUS_MODAL_DIALOG});
    }

    /*
     *  This function arranges the voter's
     *  household array in a table
     */
    renderHouseholdData() {
        var household = this.props.household;
        var oldHousehold = this.props.oldHousehold;
        var supportStatuses = this.props.supportStatuses;
        var voterKey = this.props.router.params.voterKey;
        var lastCampaignId = this.props.lastCampaignId;
        var editHouseholdKey = this.props.editHouseholdKey;
        var editingMode = false;
        var enableEditing = false;
        var currentUser = this.props.currentUser;
        var that = this;

        this.householdRows = household.map(function (householdItem, index) {
            let oldItem = oldHousehold[index];

            // Checking if the householdItem is to
            // be edited by comparing the current
            // householdItem's key to eeditHouseholdKey
            // which specifies the householdItem's
            // key to be edited
            if ( householdItem.key == editHouseholdKey ) {
                editingMode = true;
            } else { // householdItem is not to be edited
                editingMode = false;

                if ( editHouseholdKey ) {
                    // If another householdItem is
                    // being edited, then
                    // disable the editing
                    // of the current householdItem
                    enableEditing = false;
                } else {
                    // No householdItem is to be edited,
                    // then enable editing the current
                    // householdItem
                    enableEditing = true;
                }
            }

            return (
                <VoterHouseholdItem key={index} householdIndex={index}
                                    oldItem={oldItem} item={householdItem}
                                    supportStatuses={supportStatuses} voterKey={voterKey}
                                    editing_mode={editingMode} enable_editing={enableEditing}
                                    lastCampaignId={lastCampaignId} currentUser={currentUser}
                                    savingChanges={that.props.savingChanges} dirtyComponents={that.props.dirtyComponents}
                />
            )
        });

        return (
            <tbody>
                {this.householdRows}
            </tbody>
        );
    }

    initVariables() {
        if (!this.props.display) {
            this.blockStyle = {
                display: "none"
            }
        } else {
            this.blockStyle = {};
        }

        this.householdBlockClass = "tab-content tabContnt hidden";

        this.editStatusButtonClass = "btn btn-success btn-xs hidden";
        this.deleteStatusButtonClass = "btn btn-danger btn-xs hidden";
    }

    checkPermissions() {
        if ( this.props.currentUser.admin ) {
            this.householdBlockClass = "tab-content tabContnt";

            this.editAddressButtonClass = "btn btn-success btn-xs";
            this.editStatusButtonClass = "btn btn-success btn-xs";
            this.deleteStatusButtonClass = "btn btn-danger btn-xs";

            return;
        }

        if ( this.props.currentUser.permissions['elections.voter.household'] == true ) {
            this.householdBlockClass = "tab-content tabContnt";
        }

        if ( this.props.currentUser.permissions['elections.voter.household.address.edit'] == true ) {
            this.editAddressButtonClass = "btn btn-success btn-xs";
        }

        if (this.props.currentUser.permissions['elections.voter.household.support_status.edit'] == true) {
            this.editStatusButtonClass = "btn btn-success btn-xs";
            this.deleteStatusButtonClass = "btn btn-danger btn-xs";
        }
    }

    render() {

        this.initVariables();

        this.checkPermissions();

        return(
            <div className={this.householdBlockClass} id="tabActions" style={this.blockStyle}>
                <div className="tab-pane fade active in" role="tabpanel" id="home" aria-labelledby="more-info">
                    <div className="containerStrip">
                        <div className="row panelTitle">{this.panelTitle}</div>

                        <div className="row panelContent">
                            <table className="table table-bordered table-striped">
                                <thead>
                                <tr>
                                    <th>ת.ז</th>
                                    <th>שם משפחה</th>
                                    <th>שם פרטי</th>
                                    <th>שם האב</th>
                                    <th>ת.לידה</th>
                                    <th>גיל</th>
                                    <th>סטטוס סניף</th>
                                    <th>סטטוס TM</th>
                                    <th>{'\u00A0'}</th>
                                </tr>
                                </thead>

                                {this.renderHouseholdData()}
                            </table>
                        </div>

                        <div className="col-md-12 no-padding">
                            <ModalWindow show={this.props.showDeleteSupportStatusModal}
                                         buttonOk={this.deleteElectionSupportStatus.bind(this)}
                                         buttonCancel={this.hideDeleteModalDialog.bind(this)}
                                         title={this.props.deleteHouseholdModalHeader}
                                         style={{zIndex: '9001'}}>
                                <div>{this.props.deleteConfirmText}</div>
                            </ModalWindow>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        supportStatuses: state.voters.searchVoterScreen.supportStatuses,
        lastCampaignId: state.voters.voterScreen.lastCampaignId,
        household: state.voters.voterScreen.household,
        oldHousehold: state.voters.voterScreen.oldHousehold,
        editHouseholdKey: state.voters.voterScreen.editHouseholdKey,
        showUpdateHouseholdAddressModal: state.voters.voterScreen.showUpdateHouseholdAddressModal,
        updateHouseholdAll: state.voters.voterScreen.updateHouseholdAll,
        updateHouseholdIndex: state.voters.voterScreen.updateHouseholdIndex,
        updateHouseholdModalHeader: state.voters.voterScreen.updateHouseholdModalHeader,
        updateHouseholdModalContent: state.voters.voterScreen.updateHouseholdModalContent,
        showDeleteSupportStatusModal: state.voters.voterScreen.showDeleteSupportStatusModal,
        deleteHouseholdKey: state.voters.voterScreen.deleteHouseholdKey,
        deleteHouseholdModalHeader: state.voters.voterScreen.deleteHouseholdModalHeader,
        deleteSupportStatusKey: state.voters.voterScreen.deleteSupportStatusKey,
        deleteConfirmText: state.voters.voterScreen.deleteConfirmText,
        voterDetails: state.voters.voterDetails,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterPaternalHome));