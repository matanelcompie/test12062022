import React from 'react';
import {Link, withRouter} from 'react-router';
import { connect } from 'react-redux';
import Collapse from 'react-collapse';

import constants from 'libs/constants';

import VoterElectionsActivity from './VoterElectionsActivity';
import VoterAdditionalData from './VoterAdditionalData';
import BankDetails from 'components/elections/activist/editAllocation/BankDetails';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterActivity extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            captainKey: null,
            captainName:null,
        };

        this.initConstants();
    }

    initConstants() {
        this.paneltitle = "פעילות בחירות";

        this.saveButtonText = 'שמירה';

        this.voterMetaKeyTypes = constants.voterMetaKeyTypes;

        this.setDirtyTarget = "elections.voter.support_and_elections.election_activity";
    }

    initVariables() {
        this.saveButtonClass = "col-lg-12 hidden";
    }

    checkPermissions() {
        if (this.props.currentUser.admin || this.props.currentUser.permissions['elections.voter.support_and_elections.election_activity.edit'] == true ||
             this.props.currentUser.permissions['elections.voter.support_and_elections.election_activity.additional_data.edit'] == true
           ) {this.saveButtonClass = "col-lg-12";}
    }

    checkAnyChanges() {
        // Checking if any input has changed
        if (this.props.dirtyComponents.indexOf(this.setDirtyTarget) == -1) {
            this.activityHasChanged = false;
        } else {
            this.activityHasChanged = true;
        }
    }

    saveVoterMetaKeys() {
        let voterKey = this.props.router.params.voterKey;
        let metaDataKeys = this.props.metaDataVolunteerKeys;
        let voterMetaHash = this.props.voterMetaHash;
        let metaDataValues = []; // This array is sent to the server
        for ( let metaKeyIndex = 0; metaKeyIndex < metaDataKeys.length; metaKeyIndex++ ) {
            let metaKeyId = metaDataKeys[metaKeyIndex].id;
            let keyType = metaDataKeys[metaKeyIndex].key_type;

            if ( voterMetaHash[metaKeyId] != undefined ) {
                if ( voterMetaHash[metaKeyId].id == 0 ) {
                    voterMetaHash[metaKeyId].id = null;
                }
			 
                if ( keyType == this.voterMetaKeyTypes.value ) { // meta key with values
                    if ( voterMetaHash[metaKeyId].voter_meta_value_id != null) {

                        if ( voterMetaHash[metaKeyId].voter_meta_value_id >= 0 ) {
                            metaDataValues.push(
                                {
                                    id: voterMetaHash[metaKeyId].id,
                                    voter_meta_key_id: metaKeyId,
                                    voter_meta_value_id: voterMetaHash[metaKeyId].voter_meta_value_id,
                                    value: voterMetaHash[metaKeyId].value,
                                    election_campaign_id: voterMetaHash[metaKeyId].election_campaign_id
                                }
                            );
                        }
                    }
                } else { // free text and number for meta value
                    if ( voterMetaHash[metaKeyId].value != null ) {
                        if ( voterMetaHash[metaKeyId].value.length > 0  ) {
                            metaDataValues.push(
                                {
                                    id: voterMetaHash[metaKeyId].id,
                                    voter_meta_key_id: metaKeyId,
                                    voter_meta_value_id: voterMetaHash[metaKeyId].voter_meta_value_id,
                                    value: voterMetaHash[metaKeyId].value,
                                    election_campaign_id: voterMetaHash[metaKeyId].election_campaign_id
                                }
                            );
                        }
                    }
                }
            }
        }

        if ( metaDataValues.length > 0) {
            VoterActions.saveVoterMetaDataValues(this.props.dispatch, voterKey, metaDataValues, true );
        }
    }

    unAllocateVoterToCaptain50() {
            this.setState({ captainKey: null, captainName:null});
            VoterActions.unAllocateVoterToCaptain50(this.props.dispatch, this.props.router.params.voterKey);
    }


    allocateVoterToCaptain50(captainKey) {
        if ( captainKey ) {
            this.setState({captainKey: null, captainName:null});

            VoterActions.allocateVoterToCaptain50(this.props.dispatch, this.props.router.params.voterKey, captainKey);
        }
    }

    saveVoterActivity(e) {
        // Prevent page refresh
        e.preventDefault();
        if ( !this.validInputs ) {
            return;
        }
        this.saveVoterMetaKeys();
    }

    validateData() {
        var metaDataKeys = this.props.metaDataVolunteerKeys;
        var voterMetaHash = this.props.voterMetaHash;

        for ( let index = 0; index < metaDataKeys.length; index++ ) {
            let metaKeyId = metaDataKeys[index].id;

            switch ( metaDataKeys[index].key_type ) {
                case this.voterMetaKeyTypes.value: // Type with value of a list
                case this.voterMetaKeyTypes.number: // Type with value of number
                    if ( voterMetaHash[metaKeyId] != undefined && false == voterMetaHash[metaKeyId].valid ) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    validateVariables() {
        this.validInputs = this.validateData();
        this.saveButtonDisabled = false;

        if ( !this.validInputs ) {
            this.saveButtonDisabled = true;
        }
    }

    render() {
        this.initVariables();

        this.checkPermissions();

        this.validateVariables();

        this.checkAnyChanges();
        let hasEditBankDetailsPermissions = this.props.currentUser.admin || this.props.currentUser.permissions['elections.voter.bank_details'];;
        
        return (
            <Collapse isOpened={this.props.containerCollapseStatus.supportElectionsActivity}>
                <div className="row CollapseContent">
				  <div className="row">
                        <VoterAdditionalData 
                            allocateVoterToCaptain50={this.allocateVoterToCaptain50.bind(this)}
                            unAllocateVoterToCaptain50={this.unAllocateVoterToCaptain50.bind(this)}
                            />
                    </div>
				  <div className={this.saveButtonClass}>
                        <div className="form-group">
                            <div className="">
                                <button type="submit" className="btn btn-primary saveChanges"
                                        onClick={this.saveVoterActivity.bind(this)}
                                        disabled={this.saveButtonDisabled || !this.activityHasChanged ||
                                                  this.props.savingChanges}>
                                    {this.saveButtonText}
                                </button>
                            </div>
                        </div>
                    </div>
				  <div className="row">
                    <VoterElectionsActivity allCampaignsList={this.props.allCampaignsList}/>
                   { hasEditBankDetailsPermissions && <BankDetails voterDetails={this.props.voterDetails} allCampaignsList={this.props.allCampaignsList} parent="voter"/>}
				  </div>
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        allCampaignsList : state.voters.activistScreen.campaigns ,
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        metaDataVolunteerKeys: state.voters.voterScreen.metaDataVolunteerKeys,
        voterMetaHash: state.voters.voterScreen.voterMetaHash,
        editRoleRowIndex: state.voters.activistScreen.editRoleRowIndex,
        addingNewRole :state.voters.activistScreen.addingNewRole,
        voterRoles: state.voters.activistScreen.voter_roles,
        ministerOfFifty : state.voters.activistScreen.ministerOfFifty,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser,
        voterDetails: state.voters.voterDetails
    }
}

export default connect(mapStateToProps)(withRouter(VoterActivity));