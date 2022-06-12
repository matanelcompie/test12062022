import React from 'react';
import { connect } from 'react-redux';

import MetaDataItem from './MetaDataItem';

import * as callActions from '../../../../../actions/callActions';
import { getCtiPermission } from '../../../../../libs/globalFunctions';


class AdditionalData extends React.Component {
    constructor(props) {
        super(props);

        this.initConstants();
    }

    initConstants() {
        this.sectionTitle = 'התנדבות';
    }

    voterMetaKeyValueChange(metaKeyId, metValueId = null) {
        callActions.updateVoterMetaKeyValueId(this.props.dispatch, metaKeyId, metValueId);
    }

    renderMetaDataItems() {
        let that = this;
        let editPermission = getCtiPermission(this.props.permissions, 'support_status_volunteer', true);

        let metaKeys = this.props.metaDataVolunteerKeys.map(function (metaKeyItem, index) {
            return (
                <MetaDataItem key={metaKeyItem.id} metaKeyIndex={index} item={metaKeyItem}
                    editPermission={editPermission}
                    metaValuesHashKey={that.props.metaValuesHashByKeyId[metaKeyItem.id]}
                    voterMetaHash={that.props.voterMetaHash}
                    voterMetaKeyValueChange={that.voterMetaKeyValueChange.bind(that)} />
            );
        });
        return metaKeys;
    }

    render() {
        let displayPermission = getCtiPermission(this.props.permissions, 'support_status_volunteer');
        let metaData = '';
        if (displayPermission) {
            metaData = <div className="action-content additional-data">
                <div className="additional-data__header">{this.sectionTitle}</div>
                <div className="additional-data__data-row">
                    {this.renderMetaDataItems()}
                </div>
            </div>;
        }
        return (
            <div>{metaData}</div>
        );
    }
}


function mapStateToProps(state) {
    return {
        metaDataVolunteerKeys: state.system.metaData.metaDataVolunteerKeys,
        metaDataValues: state.system.metaData.metaDataValues,
        metaValuesHashByKeyId: state.system.metaData.metaValuesHashByKeyId,
        voterMetaHash: state.call.activeCall.voter.voterMetaHash,
        permissions: state.campaign.permissions

    }
}

export default connect(mapStateToProps)(AdditionalData);