import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { campaignUserStatistics } from 'tm/reducers/campaignReducer';
import { get, isEmpty } from 'lodash';
// need to came from statistics -> textValues.dealtWithVoters, textValues.didntDealtWithVoter!
const CampaignExtraInfo = ({ campaignUserStatistics }) => {
  let textValues = {
    voters: 'תושבים בקמפיין',
    dealtWithVoters: 'תושבים שטופלו',
    didntDealtWithVoters: 'תושבים בטיפול',
    users: 'עובדים מוקצים',
    onlineUsers: 'עובדים אונליין',
  }
  const dataLoaded = !isEmpty(campaignUserStatistics);
  return (
    dataLoaded &&
    <div className="campaign-list-row__extra-info">
      <div className="campaign-list-row__extra-info-block">
        <div>{get(campaignUserStatistics, 'portions.unique_voters_count') || 0}</div>
        <div>{textValues.voters}</div>
      </div>
      <div className="campaign-list-row__extra-info-block">
        <div>{get(campaignUserStatistics, 'portions.processed_count') || 0}</div>
        <div>{textValues.dealtWithVoters}</div>
      </div>
      <div className="campaign-list-row__extra-info-block">
        <div>{get(campaignUserStatistics, 'portions.processing_count') || 0}</div>
        <div>{textValues.didntDealtWithVoters}</div>
      </div>
      <div className="campaign-list-row__extra-info-block">
        <div>{get(campaignUserStatistics, 'counts.user_count') || 0}</div>
        <div>{textValues.users}</div>
      </div>
      <div className="campaign-list-row__extra-info-block">
        <div>{get(campaignUserStatistics, 'counts.online_users_count') || 0}</div>
        <div>{textValues.onlineUsers}</div>
      </div>
    </div>

  );
}

CampaignExtraInfo.propTypes = {
  campaign: PropTypes.object
}
const mapStateToProps = (state, ownProps) => {
  return {
    campaignUserStatistics: campaignUserStatistics(ownProps.campaignId)(state)
  };
}

export default connect(mapStateToProps)(CampaignExtraInfo);
