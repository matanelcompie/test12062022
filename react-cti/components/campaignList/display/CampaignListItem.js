import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import { parseSecondsToTime } from 'libs/globalFunctions';

import * as types from 'actions/actionTypes';
import * as campaignActions from '../../../actions/campaignActions';
import * as systemActions from '../../../actions/systemActions';
import * as callActions from '../../../actions/callActions';


class CampaignListItem extends React.Component {

  constructor(props) {
    super(props);

    this.initConstants();
  }

  initConstants() {
    this.textValues = {
      lastCallDate: 'שיחה אחרונה',
      noCalls: 'אין שיחות',
      averageCallTime: 'ממוצע זמן שיחה',
      averageCallActionTime: 'ממוצע זמן פעולה בתושב',
      totalTime: 'זמן עבודה על הקמפיין',
      startSimulation: 'הפעל הדגמה',
      startCall: 'התחל שיחה',
    };

    this.webDialerStatus = require('../../../libs/constants').webDialerStatus;
  }

  initVariables(disabledCampaign) {
    //this.lastCallDate = this.props.campaign.last_user_call_date != null ? moment(this.props.campaign.last_user_call_date).format('YYYY.MM.DD - HH:mm', {trim: false}) : "";
    if (this.props.campaign.last_user_call_date != null) {
      this.callLabel = this.textValues.lastCallDate + ":";
      this.lastCallDate = moment(this.props.campaign.last_user_call_date).format('DD/MM/YYYY - HH:mm', { trim: false });
    } else {
      this.callLabel = this.textValues.noCalls;
      this.lastCallDate = "";
    }

    this.enterCallStatusStyle = {};
    if (disabledCampaign) {
      this.enterCallStatusStyle = {
        opacity: 0.5,
        cursor: 'not-allowed'
      };
    }
  }
  onSelectCampaign() {
    //reload browser of user already selected campaign
    if (this.props.selectedCampaignKey && this.props.selectedCampaignKey != this.props.campaign.key) {
      location.reload();
      return;
    }
    let sipServerKey = this.props.campaign.sip_server_key;

    if (sipServerKey) {
      let telephone_predictive_mode = this.props.campaign.telephone_predictive_mode;
      this.props.dispatch({
        type: types.SET_SELECTED_CAMPAIGN_IN_LIST_PAGE,
        selectedCampaignKey: this.props.campaign.key,
        sipServerKey, telephone_predictive_mode
      });
    }
  }
  enterCallScreen(disabledCampaign, e) {
    if (disabledCampaign) { return; }
    campaignActions.setActiveCampaignKey(this.props.dispatch, this.props.campaign, false);
    campaignActions.monitorCampaignMessageApi('campaign list -> enter call screen', { campaignId: this.props.campaign.key, time: Date.now() })
    campaignActions.showBetweenCallsModal(this.props.dispatch);
    //activate user in campaign -> create user active time
    campaignActions.activateUserInCampaign(this.props.dispatch);
    //create waiting time
    campaignActions.createWaiting(this.props.dispatch, this.props.campaign.key);

    callActions.enterCallScreen(this.props.dispatch);

    this.props.history.push('/' + this.props.campaign.key);
  }

  goToSimulationScreen(campaignId) {
    //disable simulation if already selected campaign
    if (this.props.selectedCampaignKey && this.props.selectedCampaignKey != this.props.campaign.key) {
      return;
    }
    campaignActions.setActiveCampaignKey(this.props.dispatch, this.props.campaign, true);

    campaignActions.showBetweenCallsModal(this.props.dispatch);
    this.props.dispatch({ type: 'SET_SIMULATION_MODE', campaignId: campaignId })

    this.props.history.push('/' + this.props.campaign.key + '/simulation');
  }

  render() {
    let isCampaignSelected = this.props.selectedCampaignKey == this.props.campaign.key;
    let disabledCampaign = this.props.webDialer.status != this.webDialerStatus.connected || !isCampaignSelected;
    this.initVariables(disabledCampaign);
    let borderStyle = isCampaignSelected ? { border: '2px solid #64DD17' } : {};
    return (
      <div className="campaign-list-item" onClick={this.onSelectCampaign.bind(this)} style={borderStyle}>
        <div className="campaign-list-item__header">
          <div>
            <i className="fa fa-clock-o" aria-hidden="true" />
            <span className="campaign-list-item__last-login-label">{this.callLabel} </span>
            <span className="campaign-list-item__last-login-value">{this.lastCallDate}</span>
          </div>
        </div>
        <div className="campaign-list-item__body">
          <div className="campaign-list-item__quick-info">
            <div className="campaign-list-item__id">{this.props.campaign.id}</div>
            <div className={`campaign-list-item__icon campaign-list-item__icon_type_${(this.props.campaign.outbound_campaign === 0) ? 'inbound' : 'outbound' // phrased this way because outbound is default
              }`} />
          </div>
          <div className="campaign-list-item__content">
            <div className="campaign-list-item__name">{this.props.campaign.name}</div>
            <div className="campaign-list-item__description">{this.props.campaign.description}</div>
          </div>
          <div className="campaign-list-item__actions">
            <button className="cti-btn" onClick={this.goToSimulationScreen.bind(this, this.props.campaign.id)}>
              {this.textValues.startSimulation}
            </button>
            <button className="cti-btn cti-btn_type_primary" style={this.enterCallStatusStyle}
              disabled={disabledCampaign} onClick={this.enterCallScreen.bind(this, disabledCampaign)}>
              {this.textValues.startCall}
            </button>
          </div>
        </div>
        <div className="campaign-list-item__footer">
          <div className="campaign-list-item__timer">
            <span className="campaign-list-item__timer-label">{this.textValues.averageCallTime}</span>
            <span className="campaign-list-item__timer-value">
              {parseSecondsToTime(this.props.campaign.average_call_time)}
            </span>
          </div>
          <div className="campaign-list-item__timer">
            <span className="campaign-list-item__timer-label">{this.textValues.averageCallActionTime}</span>
            <span className="campaign-list-item__timer-value">
              {parseSecondsToTime(this.props.campaign.average_call_action_time)}
            </span>
          </div>
          <div className="campaign-list-item__timer">
            <span className="campaign-list-item__timer-label campaign-list-item__timer-label_dark">
              {this.textValues.totalTime}
            </span>
            <span className="campaign-list-item__timer-value">
              {parseSecondsToTime(this.props.campaign.sum_user_call_action_time)}
            </span>
          </div>
        </div>
      </div>
    );
  }
};
function mapStateToProps(state) {
  return {
    selectedCampaignKey: state.campaign.selectedCampaignKey
  }
}

export default connect(mapStateToProps)(withRouter(CampaignListItem));
