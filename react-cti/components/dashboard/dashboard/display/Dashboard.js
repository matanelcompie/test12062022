import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import { isLandPhone, isMobilePhone } from '../../../../libs/globalFunctions';

import _ from 'lodash';

import constants from '../../../../libs/constants';

import HeaderComponent from 'components/dashboard/header/container/HeaderComponent';
import QuestionnaireComponent from 'components/dashboard/questionnaire/container/QuestionnaireComponent';
import ActionAreaComponent from 'components/dashboard/actionArea/actionArea/container/ActionAreaComponent';
import ModalBetweenCalls from './ModalBetweenCalls';
import ModalBreak from './ModalBreak';

import * as callActions from '../../../../actions/callActions';
import * as callAnswerActions from '../../../../actions/callAnswerActions';
import * as uiActions from '../../../../actions/uiActions';
import * as campaignActions from '../../../../actions/campaignActions';
import * as systemActions from '../../../../actions/systemActions';


class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.initConstants();
  }

  initConstants() {

    this.endCallStatus = constants.endCallStatus;

    this.phoneTypes = constants.phoneTypes;

    let languagesArr = this.props.languages.map(function (item, index) {
      return { value: item.id, label: item.name };
    });
    this.endCallStatusesList = [
      // { code: this.endCallStatus.success, name: 'success', label: 'בוצעה בהצלחה', subItems: [] },
      {
        code: this.endCallStatus.getBack, name: 'get_back', label: 'חזור אלי',
        subItems: [{ name: 'get_back_date', type: 'date' }, { name: 'get_back_time', type: 'time' }]
      },
      {
        code: this.endCallStatus.language, name: 'language', label: 'קושי שפה',
        subItems: [{ name: 'language_select', type: 'combo', items: languagesArr }]
      },
      { code: this.endCallStatus.answeringMachine, name: 'answer_machine', label: 'משיבון', subItems: [] },
      { code: this.endCallStatus.gotMarried, name: 'married', label: 'התחתן', subItems: [] },
      { code: this.endCallStatus.changedAddress, name: 'moved', label: 'עבר דירה', subItems: [] },
      { code: this.endCallStatus.faxTone, name: 'fax', label: 'צליל פקס', subItems: [] },
      { code: this.endCallStatus.hangedUp, name: 'hanged_up', label: 'שיחה נותקה', subItems: [] },
      { code: this.endCallStatus.wrongNumber, name: 'wrong_number', label: 'טעות במספר', subItems: [] },
      { code: this.endCallStatus.nonCooperative, name: 'non_cooperative', label: 'לא משת"פ', subItems: [] },
      { code: this.endCallStatus.busy, name: 'busy', label: 'עסוק', subItems: [] },
      { code: this.endCallStatus.disconnectedNumber, name: 'DISCONNECTED_NUMBER', label: 'מספר מנותק', subItems: [] },
      { code: this.endCallStatus.unanswerd, name: 'unanswerd', label: 'אין תשובה', subItems: [] }
    ];
  }

  loadFakeData() {
    callActions.loadFakeData(this.props.dispatch);

    uiActions.loadFakeDrivers(this.props.dispatch);

    callActions.updateLoadedVoter(this.props.dispatch, true);
  }

  componentWillMount() {
    if (this.props.activeCampaignKey == null) {
      this.props.history.push('/');
    } else {
      systemActions.loadMetaDataVolunteerKeys(this.props.dispatch);
      systemActions.loadMetaDataValues(this.props.dispatch);
      campaignActions.getCampaignFiles(this.props.dispatch, this.props.activeCampaignKey);
      campaignActions.getCampaignPermissions(this.props.dispatch, this.props.activeCampaignKey);
    }

    if (!this.props.inCallScreen) {
      this.loadFakeData();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.callKey != nextProps.callKey && nextProps.callKey != null) {
      callActions.getVoterData(this.props.dispatch, nextProps.callKey);
    }

    if (!this.props.simulationMode && (!this.props.isManualCampaign && nextProps.isManualCampaign)) {
      callActions.getNextVoterCall(this.props.dispatch, this.props.activeCampaignKey);
    }
    if (!this.props.loadedVoter && nextProps.loadedVoter && nextProps.cities.length > 0) {
      let cities = nextProps.cities;

      if (nextProps.mi_city_id == null || nextProps.mi_city_id == '') {
        let miCityIndex = -1;
        let miCityName = nextProps.mi_city;
        let miCityId = 0;

        miCityIndex = cities.findIndex(cityItem => cityItem.label == miCityName);

        if (miCityIndex > -1) {
          miCityId = cities[miCityIndex].value;

          callActions.changeVoterAddressInputField(this.props.dispatch, 'mi_city_id', miCityId);
        }
      }

      if (nextProps.city_id == null || nextProps.city_id == '') {
        let cityIndex = -1;
        let cityName = nextProps.city;
        let cityId = 0;
        let cityKey = null;

        cityIndex = cities.findIndex(cityItem => cityItem.label == cityName);

        if (cityIndex > -1) {
          cityId = cities[cityIndex].value;
          cityKey = cities[cityIndex].city_key;

          callActions.changeVoterAddressInputField(this.props.dispatch, 'city_id', cityId);
          callActions.saveOldVoterCityId(this.props.dispatch, cityId)

          callActions.loadVoterCityStreets(this.props.dispatch, cityKey, true, true);
        }
      }
    }
  }

  resetQuestionnaire() {
    let questionnaire = this.props.questionnaire;
    let firstQuestionId = null;

    if (questionnaire.questions != undefined) {
      firstQuestionId = questionnaire.questions.length ? questionnaire.questions[0].id : null;
    }


    // Reset questions
    uiActions.resetQuestionnaire(this.props.dispatch, firstQuestionId);
    this.props.dispatch(uiActions.setActiveQuestion(firstQuestionId));

    uiActions.resetUiCallData(this.props.dispatch);

    // Reset voter answers
    callAnswerActions.resetVoterAnswers(this.props.dispatch);
    callAnswerActions.resetCallNote(this.props.dispatch);
  }

  buildHouseholdForServer() {
    let householdIndex = -1;
    let phoneIndex = -1;
    let household = [];
    let householdKey = null;
    let householdPhones = [];
    let phoneKey = null;
    let phoneNumber = null;
    let supportStatusTm = null;
    let voteStatus = null;

    for (householdIndex = 0; householdIndex < this.props.activeCallVoter.household.length; householdIndex++) {
      householdPhones = [];
      householdKey = this.props.activeCallVoter.household[householdIndex].key;


      for (phoneIndex = 0; phoneIndex < this.props.activeCallVoter.household[householdIndex].phones.length; phoneIndex++) {
        phoneKey = this.props.activeCallVoter.household[householdIndex].phones[phoneIndex].key;
        phoneNumber = this.props.activeCallVoter.household[householdIndex].phones[phoneIndex].phone_number;

        if (!this.props.activeCallVoter.household[householdIndex].phones[phoneIndex].deleted) {
          if (phoneKey == '') {
            phoneKey = null;
          }

          if (!this.props.activeCallVoter.household[householdIndex].phones[phoneIndex].valid) {
            phoneNumber = null;
          }

          if (phoneNumber != null) {
            householdPhones.push({ key: phoneKey, phone_number: phoneNumber });
          }
        }
      }

      supportStatusTm = this.props.activeCallVoter.household[householdIndex].support_status_tm;
      voteStatus = this.props.activeCallVoter.household[householdIndex].vote_status;

      if (this.props.callNote.household[householdKey] != undefined) {
        if (this.props.callNote.household[householdKey].support_status_tm != undefined) {
          supportStatusTm = this.props.callNote.household[householdKey].support_status_tm;
        }

        if (this.props.callNote.household[householdKey].vote_status != undefined) {
          voteStatus = this.props.callNote.household[householdKey].vote_status;
        }
      }

      household.push(
        {
          key: householdKey,
          support_status_tm: supportStatusTm,
          vote_status: voteStatus,
          phones: householdPhones
        }
      );
    }

    return household;
  }

  leadingZeros(timeElement) {
    let time = parseInt(timeElement);
    if (Number.isNaN(time)) time = 0;
    if (time < 10) {
      return '0' + time;
    } else {
      return time
    }
  }

  buildTransportForServer() {
    let transportation = {};
    if (this.props.transportation) {
      transportation = {
        needs_transportation: this.props.transportation.needs_transportation,
        from_time: this.leadingZeros(this.props.transportation.fromHours) + ':' +
          this.leadingZeros(this.props.transportation.fromMinutes) + ':00',
        to_time: this.leadingZeros(this.props.transportation.toHours) + ':' +
          this.leadingZeros(this.props.transportation.toMinutes) + ':00',
        cripple: this.props.transportation.isCrippled,
        passengers: this.props.transportation.passengers
      };
    }

    return transportation;
  }

  buildAddress() {
    let address = {};

    let addressFields = [
      'city_id',
      'street_id',
      'neighborhood',
      'house',
      'house_entry',
      'flat',
      'zip',
      'distribution_code',
      'actual_address_correct'
    ];

    for (let fieldIndex = 0; fieldIndex < addressFields.length; fieldIndex++) {
      let fieldName = addressFields[fieldIndex];

      switch (fieldName) {
        case 'city_id':
        case 'actual_address_correct':
          address[fieldName] = this.props.address[fieldName];
          break;

        case 'street_id':
          if (0 == this.props.address.street_id) {
            address.street_id = null;
          } else {
            address.street_id = this.props.address.street_id;
          }
          break;

        case 'street':
          address.street = null;
          break;

        default:
          if ((!this.props.address[fieldName]) || (this.props.address[fieldName].length == 0)) {
            address[fieldName] = null;
          } else {
            address[fieldName] = this.props.address[fieldName];
          }
          break;
      }
    }

    return address;
  }

  buildVoterPhonesToServer() {
    let phoneIndex = 0;
    let voterPhones = this.props.activeCallVoter.phones;
    let voterPhonesData = [];
    let phoneTypeId = '';

    for (phoneIndex = 0; phoneIndex < voterPhones.length; phoneIndex++) {
      let phoneNumber = voterPhones[phoneIndex].phone_number.split('-').join('');
      if (!voterPhones[phoneIndex].deleted) {
        if (isLandPhone(phoneNumber)) {
          phoneTypeId = this.phoneTypes.home;
        } else if (isMobilePhone(phoneNumber)) {
          phoneTypeId = this.phoneTypes.mobile;
        }

        voterPhonesData.push(
          {
            id: voterPhones[phoneIndex].id,
            key: voterPhones[phoneIndex].key,
            phone_number: phoneNumber,
            call_via_tm: voterPhones[phoneIndex].call_via_tm,
            sms: voterPhones[phoneIndex].sms,
            phone_type_id: phoneTypeId
          }
        );
      }
    }

    return voterPhonesData;
  }

  buildVoterEmailToServer() {
    let email = this.props.activeCallVoter.email;
    let contactViaEmail = "";
    let voterEmail = {};

    if (this.props.activeCallVoter.email == "") {
      email = null;
    }

    if (email == null) {
      contactViaEmail = 0;
    } else {
      contactViaEmail = this.props.activeCallVoter.contact_via_email;
    }

    voterEmail = { email: email, contact_via_email: contactViaEmail };

    return voterEmail;
  }

  buildVoterMetaValuesToServer() {
    let metaDataKeys = this.props.metaDataVolunteerKeys;
    let voterMetaHash = this.props.voterMetaHash;
    let voterMetaValues = [];
    for (let metaKeyIndex = 0; metaKeyIndex < metaDataKeys.length; metaKeyIndex++) {
      let metaKeyId = metaDataKeys[metaKeyIndex] ? metaDataKeys[metaKeyIndex].id : null;
      if (metaKeyId && voterMetaHash && voterMetaHash[metaKeyId] != undefined && voterMetaHash[metaKeyId].voter_meta_value_id != null) {
        voterMetaValues.push(
          {
            id: voterMetaHash[metaKeyId].id,
            voter_meta_key_id: metaKeyId,
            voter_meta_value_id: voterMetaHash[metaKeyId].voter_meta_value_id
          }
        );
      }
    }

    return voterMetaValues;
  }

  saveCallData() {
    let voterAnswers = {};
    let questionIndex = -1;
    let questionId = 0;
    let callNote = "";
    let household = [];
    let endCallStatusItems = {};
    let transportation = {};
    let address = {};
    let voterPhones = [];
    let voterEmail = {};
    let metaDataValues = [];

    for (questionIndex = 0; questionIndex < this.props.viewedQuestions.length; questionIndex++) {
      questionId = this.props.viewedQuestions[questionIndex];

      if (this.props.voterAnswers[questionId] != undefined) {
        voterAnswers[questionId] = this.props.voterAnswers[questionId];
      } else {
        voterAnswers[questionId] = null
      }
    }

    callNote = this.props.callNote.note.trim();
    if (0 == callNote.length) {
      callNote = null;
    }

    household = this.buildHouseholdForServer();

    if (_.isEmpty(this.props.endCallStatusSubItemValue)) {
      endCallStatusItems = null;
    } else if (this.props.endCallStatusCode == this.endCallStatus.getBack) {
      endCallStatusItems = {
        datetime: this.props.endCallStatusSubItemValue.get_back_date + ' ' + this.props.endCallStatusSubItemValue.get_back_time
      };
    } else {
      endCallStatusItems = this.props.endCallStatusSubItemValue;
    }

    transportation = this.buildTransportForServer();

    address = this.buildAddress();

    voterPhones = this.buildVoterPhonesToServer();

    voterEmail = this.buildVoterEmailToServer();

    metaDataValues = this.buildVoterMetaValuesToServer();

    callAnswerActions.saveCallData(this.props.callKey, this.props.callSeconds, this.props.actionCallSeconds,
      voterAnswers, callNote, household, this.props.endCallStatusCode, endCallStatusItems,
      transportation, address, this.props.support_status_tm, voterPhones, voterEmail, metaDataValues);
  }

  resetCallData() {
    callActions.disableNextCall(this.props.dispatch);
    callActions.resetCallTimer(this.props.dispatch);
    callActions.resetEndcallStatus(this.props.dispatch);

    callActions.unMuteCall(this.props.dispatch);

    uiActions.resetUiData(this.props.dispatch);

    callActions.resetVoterCityStreets(this.props.dispatch);

    callActions.updateLoadedVoter(this.props.dispatch, false);
  }

  /**
   * This function ends the current call
   * and starts waiting for a new call     *
   */
  nextCall() {

    if (!this.nextCallEnabled) {
      return;
    }

    this.resetQuestionnaire();
    if (this.props.inCallScreen) {
      this.saveCallData();
    }
    this.resetCallData();

    if (this.props.askForBreak) { // Taking a break

      if (!this.props.simulationMode) {
        campaignActions.deleteExtensionFromCampaign(this.props.activeCampaignKey);
        campaignActions.createBreak(this.props.dispatch, this.props.activeCampaignKey);
      }

      campaignActions.takeBreak(this.props.dispatch);
      campaignActions.monitorCampaignMessageApi('next call -> ask for break', { campaignId: this.props.activeCampaignKey });
    } else {

      campaignActions.showBetweenCallsModal(this.props.dispatch);

      if (!this.props.simulationMode) {
        campaignActions.createWaiting(this.props.dispatch, this.props.activeCampaignKey);

        campaignActions.monitorCampaignMessageApi('next call -> create waiting', {
          campaignId: this.props.activeCampaignKey
        });

      }
      if (!this.props.simulationMode && this.props.isManualCampaign) {

        callActions.getNextVoterCall(this.props.dispatch, this.props.activeCampaignKey);

        campaignActions.monitorCampaignMessageApi('next call -> get next voter call', {
          campaignId: this.props.activeCampaignKey
        });
      }

    }
  }

  checkEndCallStatus() {
    let callEndStatusValid = true;
    let endCallStatusCode = this.props.endCallStatusCode;
    if (endCallStatusCode === null) { //If not selected end call code
      callEndStatusValid = true;
    } else { //If selected end call code
      let currentEndCallStatusObj = this.endCallStatusesList.find(function (item) {
        if (item.code == endCallStatusCode) { return item; }
      })
      let endCallStatusSubItemValue = this.props.endCallStatusSubItemValue;

      // If user selected status with "subItems" - must fill all sub items!
      if (currentEndCallStatusObj.subItems.length > Object.keys(endCallStatusSubItemValue).length) {
        callEndStatusValid = false;
      } else {
        for (let name in endCallStatusSubItemValue) {
          if (endCallStatusSubItemValue[name] == '' || endCallStatusSubItemValue[name] == 'Invalid date') {
            callEndStatusValid = false;
          }
        }
      }
    }
    return callEndStatusValid;
  }

  checkIfVoterDataIsValid() {
    let isValid = true;
    for (let tabName in this.props.validationVoterCallData) {
      if (!this.props.validationVoterCallData[tabName]) { isValid = false }
    }
    return isValid;
  }

  checkIfHasAtLeastSingleAnswer() {
    return Object.keys(this.props.voterAnswers).length > 0;
  }

  checkEndOfQuestionnare() {
    let reachToEnd = false;
    if (this.props.questionnaire && this.props.questionnaire.questions) {
      let currentQuestion = this.props.questionnaire.questions.find((q) => { return q.id == this.props.activeQuestionId });
      if (currentQuestion && currentQuestion.next_question_id == -1) {
        reachToEnd = true;
      }
    }
    return reachToEnd;
  }

  render() {
    if (!this.props.endCallStatusCode || this.props.endCallStatusCode == this.endCallStatus.success) { //If call end status is success!
      let hasAtLeastSingleAnswer = this.checkIfHasAtLeastSingleAnswer();
      let reachToQuestionnareEnd = this.checkEndOfQuestionnare();
      let voterDataIsValid = this.checkIfVoterDataIsValid();
      let disabledNextCall = this.props.disabledNextCall && !this.props.simulationMode;
      let questionnaireIsValid = reachToQuestionnareEnd && hasAtLeastSingleAnswer;
      this.nextCallEnabled = questionnaireIsValid && voterDataIsValid && !disabledNextCall;
    } else {
      let voterDataIsValid = this.checkIfVoterDataIsValid();
      let disabledNextCall = this.props.disabledNextCall && !this.props.simulationMode;
      let callEndStatusValid = this.checkEndCallStatus();
      this.nextCallEnabled = callEndStatusValid && voterDataIsValid && !disabledNextCall;
    }

    return (
      <div className="dashboard">
        <HeaderComponent nextCall={this.nextCall.bind(this)} canUserEndCall={this.nextCallEnabled} />
        <div className="dashboard__main">
          <QuestionnaireComponent nextCall={this.nextCall.bind(this)} canUserEndCall={this.nextCallEnabled} />
          <ActionAreaComponent nextCall={this.nextCall.bind(this)}
            endCallStatusesList={this.endCallStatusesList}
            canUserEndCall={this.nextCallEnabled}
          />
        </div>

        <div className="dashboard__modal-between-calls">
          <ModalBetweenCalls loadFakeData={this.loadFakeData.bind(this)} />
        </div>

        <div className="dashboard__modal-break">
          <ModalBreak />
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    disabledNextCall: state.call.disabledNextCall,
    validationVoterCallData: state.ui.validationVoterCallData,
    activeCampaignKey: state.campaign.activeCampaignKey,
    callKey: state.call.activeCall.callKey,
    questionnaire: state.campaign.questionnaire,
    isManualCampaign: state.campaign.campaignData.telephone_predictive_mode == 1,
    callSeconds: state.call.activeCall.timer.callSeconds,
    actionCallSeconds: state.call.activeCall.timer.seconds,
    inCallScreen: state.call.inCallScreen,
    askForBreak: state.campaign.askForBreak,
    voterAnswers: state.callAnswer.voterAnswers,
    viewedQuestions: state.ui.questionnaire.viewedQuestions,
    activeQuestionId: state.ui.questionnaire.activeQuestionId,
    showInBreakModal: state.campaign.modalBreak.show,
    showBetweenCallsModal: state.campaign.modalBetweenCalls.show,
    callNote: state.callAnswer.callNote,
    activeCallVoter: state.call.activeCall.voter,
    endCallStatusCode: state.call.activeCall.endCallStatusCode,
    endCallStatusSubItemValue: state.call.activeCall.endCallStatusSubItemValue,
    transportation: state.call.activeCall.voter.transportation,
    city: state.call.activeCall.voter.address.city,
    city_id: state.call.activeCall.voter.address.city_id,
    mi_city: state.call.activeCall.voter.address.mi_city,
    mi_city_id: state.call.activeCall.voter.address.mi_city_id,
    address: state.call.activeCall.voter.address,
    support_status_tm: state.call.activeCall.voter.support_status_tm,
    metaDataVolunteerKeys: state.system.metaData.metaDataVolunteerKeys,
    voterMetaHash: state.call.activeCall.voter.voterMetaHash,
    loadedVoter: state.call.activeCall.voter.loadedVoter,
    cities: state.system.lists.cities,
    simulationMode: state.campaign.simulationMode,
    languages: state.system.lists.languages
  }
}

export default connect(mapStateToProps)(withRouter(Dashboard));
