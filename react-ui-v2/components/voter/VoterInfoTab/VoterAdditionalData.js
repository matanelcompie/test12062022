import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Collapse from 'react-collapse';

import VoterMetaDataItem from './VoterMetaDataItem';

import * as VoterActions from '../../../actions/VoterActions';
import * as SystemActions from '../../../actions/SystemActions';


class VoterAdditionalData extends React.Component {

    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.saveButtonText = "שמירה";

        this.tooltip = {
            undoChanges:'לבטל שינויים'
        };

        this.undoButtonStyle = {
            marginLeft: "10px"
        };

        this.setDirtyTarget = "elections.voter.additional_data.meta";
    }

    /**
     *  This function restores the values of
     *  voter meta data before the changes
     */
    undoMetaDataChanges(e) {
        // Prevent page refresh
        e.preventDefault();

        this.props.dispatch({type: VoterActions.ActionTypes.VOTER.VOTER_META_DATA_UNDO_CHANGES});

        this.props.dispatch({type: SystemActions.ActionTypes.CLEAR_DIRTY, target: this.setDirtyTarget});
    }

    saveVoterAnotherData(e) {
        // Prevent page refresh
        e.preventDefault();

        if ( !this.validInputs ) {
            return;
        }

        let voterKey = this.props.router.params.voterKey;
        let metaDataKeys = this.props.metaDataKeys;
        let voterMetaHash = this.props.voterMetaHash;
        let metaDataValues = []; // This array is sent to the server

        for ( let metaKeyIndex = 0; metaKeyIndex < metaDataKeys.length; metaKeyIndex++ ) {
            let metaKeyId = metaDataKeys[metaKeyIndex].id;
            let keyType = metaDataKeys[metaKeyIndex].key_type;

            if ( voterMetaHash[metaKeyId] != undefined ) {
                if ( voterMetaHash[metaKeyId].id == 0 ) {
                    voterMetaHash[metaKeyId].id = null;
                }

                if ( keyType == 0 ) { // meta key with values
                    if ( voterMetaHash[metaKeyId].voter_meta_value_id != null ) {
                        if ( voterMetaHash[metaKeyId].voter_meta_value_id > 0 ) {
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

        if ( metaDataValues.length > 0 ) {
            VoterActions.saveVoterMetaDataValues(this.props.dispatch, voterKey, metaDataValues, false);
        }
    }

    renderMetaDataItems() {
        var metaDataKeys = this.props.metaDataKeys;
        var voterMetaHash = this.props.voterMetaHash;
        var metaValuesHashByKeyId = this.props.metaValuesHashByKeyId;

        let metaDataRows = metaDataKeys.map(function(metaKeyItem, index) {
            let metaKeyId = metaKeyItem.id;

            let voterDataItem = voterMetaHash[metaKeyId];
            let metaValuesItems = [];

            switch ( metaKeyItem.key_type ) {
                case 0: // // List values of meta key
                    if ( metaValuesHashByKeyId[metaKeyId] != undefined ) {
                        metaValuesItems = metaValuesHashByKeyId[metaKeyId];
                    } else {
                        metaValuesItems = [];
                    }

                    if ( metaValuesHashByKeyId[metaKeyId] != undefined ) {
                        return (
                            <div className="col-lg-4" key={metaKeyId}>
                                <form className="form-horizontal">
                                    <VoterMetaDataItem key={metaKeyId} metaKeyId={metaKeyId}
                                                       metaKeyItem={metaKeyItem}
                                                       metaValuesItems={metaValuesItems}
                                                       voterDataItem={voterDataItem}/>
                                </form>
                            </div>
                        );
                    } else {
                        return (
                            <div className="col-lg-4" key={metaKeyId}>
                                {metaKeyItem.key_name}
                            </div>
                        );
                    }
                    break;

                case 1: // Free text meta value
                case 2: // Number meta value
                    metaValuesItems = [];

                    return (
                        <div className="col-lg-4" key={metaKeyId}>
                            <form className="form-horizontal">
                                <VoterMetaDataItem key={metaKeyId} metaKeyId={metaKeyId}
                                                   metaKeyItem={metaKeyItem}
                                                   metaValuesItems={metaValuesItems}
                                                   voterDataItem={voterDataItem}/>
                            </form>
                        </div>
                    );
                    break;
            }
        });

        return metaDataRows;
    }

    validateData() {
        var metaDataKeys = this.props.metaDataKeys;
        var voterMetaHash = this.props.voterMetaHash;

        for ( let index = 0; index < metaDataKeys.length; index++ ) {
            let metaKeyId = metaDataKeys[index].id;

            switch ( metaDataKeys[index].key_type ) {
                case 0: // Type with value of a list
                case 2: // Type with value of number
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
    }

    renderButton() {
        var displayButton = false;
        var undoClassButton = "";

        if ( this.props.currentUser.admin ||
             this.props.currentUser.permissions['elections.voter.additional_data.meta.edit'] == true ) {
            displayButton = true;
        }

        /* The save button will not be displayed in 1 of these cases:
         * The input is not valid
         * No input data has been changed
         * The data is being saved in the server
         */
        if ( displayButton ) {
            // Checking if any meta has changed
            // in order to decide whether to
            // display the undo changes button.
            if ( !this.metaHasChanged ) {
                undoClassButton = "btn btn-danger pull-left hidden";
            } else {
                undoClassButton = "btn btn-danger pull-left";
            }

            return (
                <div className="col-lg-12">
                    <div className="form-group">
                        <div className="">
                            <button className="btn btn-primary saveChanges"
                                    onClick={this.saveVoterAnotherData.bind(this)}
                                    disabled={!this.validInputs || !this.metaHasChanged || this.props.savingChanges}>
                                {this.saveButtonText}
                            </button>
                            <button className={undoClassButton}
                                    style={this.undoButtonStyle}
                                    title={this.tooltip.undoChanges}
                                    onClick={this.undoMetaDataChanges.bind(this)}
                                    disabled={this.props.savingChanges}>
                                <i className="fa fa-undo fa-6"/>
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
            this.metaHasChanged = false;
        } else {
            this.metaHasChanged = true;
        }
    }

    render() {

        this.validateVariables();

        this.checkAnyChanges();

        return (
            <Collapse isOpened={this.props.containerCollapseStatus.infoAdditionalData}>
                <div className="row CollapseContent">

                    {this.renderMetaDataItems()}

                    {this.renderButton()}
                </div>
            </Collapse>
        );
    }
}


function mapStateToProps(state) {
    return {
        containerCollapseStatus: state.voters.voterScreen.containerCollapseStatus,
        lastCampaignId: state.voters.voterScreen.lastCampaignId,
        metaDataKeys: state.voters.voterScreen.metaDataKeys,
        metaDataValues: state.voters.voterScreen.metaDataValues,
        voterMetaHash: state.voters.voterScreen.voterMetaHash,
        oldVoterMetaHash: state.voters.voterScreen.oldVoterMetaHash,
        metaValuesHashByKeyId: state.voters.voterScreen.metaValuesHashByKeyId,
        metaValuesHashByValueId: state.voters.voterScreen.metaValuesHashByValueId,
        savingChanges: state.system.savingChanges,
        dirtyComponents: state.system.dirtyComponents,
        currentUser: state.system.currentUser
    }
}

export default connect(mapStateToProps)(withRouter(VoterAdditionalData));