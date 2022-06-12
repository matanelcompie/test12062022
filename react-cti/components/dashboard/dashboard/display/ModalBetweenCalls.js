import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import { parseTimerSecondsToTime } from '../../../../libs/globalFunctions';

import ModalWindow from '../../../common/ModalWindow';

import * as campaignActions from '../../../../actions/campaignActions';
import * as callActions from '../../../../actions/callActions';
import * as Types from '../../../../actions/actionTypes';


class ModalBetweenCalls extends React.Component {
  constructor(props) {
    super(props);

    this.timer = setInterval(this.tick.bind(this), 1000);

    this.initConstants();
  }

  initConstants() {
    this.modalTexts = {
      buttonOkText: 'צא להפסקה'
    };

    this.texts = {
      waiting: 'ממתין לקבלת שיחה',
      unregistered: 'המערכת מחדשת תקשורת לחייגן, המתן לקבלת שיחה'
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.showBetweenCallsModal && !this.props.showBetweenCallsModal) {
      this.checkCampaignChangedData(nextProps);
    } else {
      // clearInterval(this.timer);//clearInterval not working!
    }


    if (nextProps.inCallScreen) { // In operation screen
      if (this.props.callKey != nextProps.callKey && nextProps.callKey != null) {
        campaignActions.hideBetweenCallsModal(this.props.dispatch);
        campaignActions.endWaiting(this.props.dispatch, this.props.waitingKey);

        callActions.startNewCall(this.props.dispatch);
      }
    } else { // In simulation screen
      if (nextProps.modalSeconds == 2) {
        campaignActions.hideBetweenCallsModal(this.props.dispatch);

        this.props.loadFakeData();
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    if (this.props.showBetweenCallsModal) {
      campaignActions.countTimeBetweenCalls(this.props.dispatch);
    }
  }

  takeBreak() {
    campaignActions.hideBetweenCallsModal(this.props.dispatch);
    if (!this.props.simulationMode) {
      campaignActions.deleteExtensionFromCampaign(this.props.activeCampaignKey);
      campaignActions.createBreak(this.props.dispatch, this.props.activeCampaignKey);
      campaignActions.endWaiting(this.props.dispatch, this.props.waitingKey);
    }
    campaignActions.takeBreak(this.props.dispatch);
  }

  checkCampaignChangedData(nextProps) {
    let dispatch = this.props.dispatch;
    let campaignChangedData = nextProps.campaignChangedData;
    let campaignKey = this.props.campaignKey;
    if (campaignChangedData.ctiPermissions) {
      campaignActions.getCampaignPermissions(dispatch, campaignKey);
      campaignActions.getCampaignFiles(dispatch, campaignKey);
    }
    if (campaignChangedData.questionnaire) {
      campaignActions.getCampaignQuestionnaireFull(dispatch, campaignKey);
    }
    dispatch({ type: Types.UNSET_CAMPAIGN_DATA_CHANGED })
  }

  /**
   * Render unregistered seconds error
   *
   * @return JSX
   */
  renderUnregisteredSeconds() {
    if (this.props.unregisteredSeconds >= 5) {
      return <div className="modal-between-calls__row-error">{this.texts.unregistered}</div>
    } else {
      return '';
    }
  }
  render() {
    return (
      <ModalWindow show={this.props.showBetweenCallsModal}
        buttonOk={this.takeBreak.bind(this)}
        buttonOkText={this.modalTexts.buttonOkText}
        title={this.modalTexts.title}
        style={{ zIndex: '9001' }}>
        <div className="modal-between-calls__row-spinner"><i className="fa fa-spinner fa-spin" aria-hidden="true" /></div>

        <div className="modal-between-calls__row-waiting">{this.texts.waiting}</div>

        <div className="modal-between-calls__row-ticker">{parseTimerSecondsToTime(this.props.modalSeconds)}</div>
        {this.renderUnregisteredSeconds()}
      </ModalWindow>
    );
  }
}


function mapStateToProps(state) {
  return {
    activeCampaignKey: state.campaign.activeCampaignKey,
    showBetweenCallsModal: state.campaign.modalBetweenCalls.show,
    modalSeconds: state.campaign.modalBetweenCalls.seconds,
    callKey: state.call.activeCall.callKey,
    inCallScreen: state.call.inCallScreen,
    campaignChangedData: state.campaign.campaignChangedData,
    simulationMode: state.campaign.simulationMode,
    campaignKey: state.campaign.activeCampaignKey,
    waitingKey: state.campaign.waitingKey,
    unregisteredSeconds: state.system.webDialer.unregisteredSeconds,
  }
}

export default connect(mapStateToProps)(withRouter(ModalBetweenCalls));
