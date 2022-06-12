import React from 'react';
import PropTypes from 'prop-types';
import ToggleCheckbox from 'tm/components/common/ToggleCheckbox';
import TextInput from 'tm/components/common/TextInput';
import RadioSet from 'tm/components/common/RadioSet';
import ComboSelect from 'tm/components/common/ComboSelect';
import LaddaButton from 'tm/components/common/LaddaButton';
import { validatePhoneNumber } from 'libs/globalFunctions';


const AdvancedSettingsTab = ({ campaignEdits, onChangeField, onSaveClick, telephonyModeOptions , dialerTypeOptions, actionCallNoAnswerOptions, returnCallNoAnswerOptions, isPending, allowEditing }) => {
    const textValues = {
        telephonyMode: 'מוד טלפוניה',
		phoneNumber:'מספר טלפון',
		dialerType:'שרת טלפוניה',
        dndStatus: 'סטטוס אין מענה',
        available: 'זמין',
        unavailable: 'לא זמין',
        dndCallsLabel: 'שיחה בסטטוס אין מענה',
        dndReturnCall: 'הגדרת תזמון שיחה בסטטוס אין מענה',
        dndUnscheduledLabel: 'שיחה בסטטוס אין מענה ללא תזמון נוסף',
        addDestRestrict: 'הגבלת הוספת יעדים',
        addEmployeeRestrict: 'הגבלת הוספת עובדים',
        dndCallsCallbackLabel: 'הגדרת שיחה חוזרת לתור',
        dndCallsCallbackAfter: 'בסטטוס אין מענה לאחר',
        minsHours: 'דקות',
        maxCallbackNum: "מספר חזרות ",
        saveButtonTitle: 'שמור',
		isSingleVoterPerHousehold:'תושב יחיד לבית האב',
		isSinglePhonePerVoter:'טלפון זהה אצל מספר תושבים ישויך ויחויג רק לאחד מהם',
		onlyUsersWithMobile:'שיחות לניידים בלבד',
    };

    let telephonyModeOptionsArr = _.keys(telephonyModeOptions).map(value => {
        return { value: Number(value), 'label': telephonyModeOptions[value] }
    });
 
    let returnCallNoAnswerOptionsArr = _.keys(returnCallNoAnswerOptions).map(value => {
        return { value: Number(value), 'label': returnCallNoAnswerOptions[value] }
    });

    let actionCallNoAnswerOptionsArr = _.keys(actionCallNoAnswerOptions).map(value => {
        return { value: Number(value), 'label': actionCallNoAnswerOptions[value] }
    });
	
	let yesNoAnswerOptionsArr=[{value:0 , label:'לא'},{value:1 , label:'כן'}];
	
    campaignEdits.action_call_no_answer = Number(campaignEdits.action_call_no_answer);
    let disabledRadio = campaignEdits.action_call_no_answer ? false : true;
    let disabledInput = campaignEdits.action_call_no_answer && Number(campaignEdits.scheduled_time_no_answer) ? false : true;

 
	
    function onChangeFieldTemp(event) {
        onChangeField(event.target.name, event.target.value)
    }

    /**
     * Save campaign parameters
     *
     * @param event e
     * @return void
     */
    function saveCampaign(e) {
        let parameters = {
            telephone_predictive_mode: campaignEdits.telephone_predictive_mode,
            action_call_no_answer: campaignEdits.action_call_no_answer,
            scheduled_time_no_answer: campaignEdits.scheduled_time_no_answer,
            return_call_after: campaignEdits.return_call_after,
            max_return_call: campaignEdits.max_return_call,
			phone_number: campaignEdits.phone_number,
			sip_server_id: campaignEdits.sip_server_id,
			single_voter_for_household: campaignEdits.single_voter_for_household,
			single_phone_occurrence: campaignEdits.single_phone_occurrence,
			only_users_with_mobile: campaignEdits.only_users_with_mobile,
        }
        onSaveClick(e, parameters);
    }
	 
    return (
        <div className="advanced-settings-tab tabContnt containerStrip">
            <div className="row panelContent">
                <div className="col-xs-4">
                    <div className="form-group">
                        <label htmlFor="telephone_predictive_mode">{textValues.telephonyMode}</label>
                        <ComboSelect
                            name="telephone_predictive_mode"
                            options={telephonyModeOptionsArr}
                            onChange={onChangeFieldTemp}
                            itemDisplayProperty="label"
                            itemIdProperty="value"
                            value={campaignEdits.telephone_predictive_mode}
                            multiSelect={false}
                        />
						<br/>
						<label htmlFor="telephone_predictive_mode">{textValues.phoneNumber}</label>
                        <TextInput type="text" name="phone_number" style={{borderColor:(campaignEdits.phone_number =='' || campaignEdits.phone_number==null  || validatePhoneNumber(campaignEdits.phone_number) ? '' : '#ff0000')}} value={campaignEdits.phone_number} onChange={onChangeFieldTemp} />
						<br/>
						<label htmlFor="telephone_predictive_mode">{textValues.dialerType}</label>
                        <ComboSelect
                            name="sip_server_id"
                            options={dialerTypeOptions}
                            onChange={onChangeFieldTemp}
                            itemDisplayProperty="label"
                            itemIdProperty="value"
                            value={campaignEdits.sip_server_id}
                            multiSelect={false}
							inputStyle={{borderColor:(campaignEdits.sip_server_id == null?'#ff0000':'')}}
                        />
                    </div>
                </div>
                <div className="col-xs-6 col-xs-offset-2">
                    <div className="form-group">
                        <label>{textValues.dndCallsLabel}</label>
                        <RadioSet
                            name="action_call_no_answer"
                            options={actionCallNoAnswerOptionsArr}
                            activeValue={campaignEdits.action_call_no_answer}
                            onChange={onChangeFieldTemp}
                            inline={true}
                        />
                    </div>
                    <div className="form-inline">
                        <div className="form-group">
                            <span>{textValues.maxCallbackNum} </span>
                            <TextInput
                                name="max_return_call"
                                type="text"
                                className="advanced-settings-tab__inline-input"
                                placeholder={textValues.maxCallbackNum}
                                value={campaignEdits.max_return_call}
                                onChange={onChangeFieldTemp}
                                disabled={disabledRadio}
                            />
                        </div>
                    </div>
                </div>
				 <div className="col-xs-6 col-xs-offset-2">
					<br/>
                    <div className="form-group">
                        <label>{textValues.isSingleVoterPerHousehold}</label>
                        <RadioSet
                            name="single_voter_for_household"
                            options={yesNoAnswerOptionsArr}
                            activeValue={campaignEdits.single_voter_for_household}
                            onChange={onChangeFieldTemp}
                            inline={true}
                        />
                    </div>
                </div> 
				<div className="col-xs-6 col-xs-offset-2">
                    <div className="form-group">
                        <label>{textValues.isSinglePhonePerVoter}</label>
                        <RadioSet
                            name="single_phone_occurrence"
                            options={yesNoAnswerOptionsArr}
                            activeValue={campaignEdits.single_phone_occurrence}
                            onChange={onChangeFieldTemp}
                            inline={true}
                        />
                    </div>
                </div>
				<div className="col-xs-6 col-xs-offset-2">
                    <div className="form-group">
                        <label>{textValues.onlyUsersWithMobile}</label>
                        <RadioSet
                            name="only_users_with_mobile"
                            options={yesNoAnswerOptionsArr}
                            activeValue={campaignEdits.only_users_with_mobile}
                            onChange={onChangeFieldTemp}
                            inline={true}
                        />
                    </div>
                </div>
                <div className="col-xs-6 col-xs-offset-6">
                    <div className={`form-group ${disabledRadio ? "form-group_disabled" : ""}`}>
                        <label>{textValues.dndReturnCall}</label>
                        <RadioSet
                            name="scheduled_time_no_answer"
                            label={textValues.dndUnscheduledLabel}
                            options={returnCallNoAnswerOptionsArr}
                            activeValue={campaignEdits.scheduled_time_no_answer}
                            onChange={onChangeFieldTemp}
                            inline={true}
                            disabled={disabledRadio}
                        />
                    </div>
                </div>
                <div className={`col-xs-6 col-xs-offset-6 ${disabledRadio ? "form-group_disabled" : ""}`}>
                    <label>{textValues.dndCallsCallbackLabel}</label>
                    <div className="form-inline" style={{ marginBottom: 5 }}>
                        <div className="form-group">
                            <span>{textValues.dndCallsCallbackAfter} </span>
                            <TextInput
                                name="return_call_after"
                                type="text"
                                className="advanced-settings-tab__inline-input"
                                placeholder={textValues.minsHours}
                                value={campaignEdits.return_call_after}
                                onChange={onChangeFieldTemp}
                                disabled={disabledInput}
                            />
                            <span> {textValues.minsHours}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12 text-left">
                    {allowEditing && <LaddaButton className={"btn btn-primary btn-sm"} onClick={saveCampaign} loading={isPending}
                     disabled={campaignEdits.sip_server_id == null || (!validatePhoneNumber(campaignEdits.phone_number) && campaignEdits.phone_number !='' && campaignEdits.phone_number!=null) }>
                        <i className="fa fa-floppy-o"></i>&nbsp;&nbsp;
                        <span>{textValues.saveButtonTitle}</span>
                    </LaddaButton>}
                </div>
            </div>
        </div>
    );
};

AdvancedSettingsTab.propTypes = {
    campaign: PropTypes.object,
    telephonyModeOptions: PropTypes.object,
    actionCallNoAnswerOptions: PropTypes.object,
    returnCallNoAnswerOptions: PropTypes.object,
    onChangeField: PropTypes.func,
    onSaveClick: PropTypes.func,
    isPending: PropTypes.bool
};

AdvancedSettingsTab.defaultProps = {
    campaign: {},
};

export default (AdvancedSettingsTab);
