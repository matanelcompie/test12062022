import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router';

import EditButtons from 'tm/components/common/EditButtons';
import TextInput from 'tm/components/common/TextInput';
import DateInput from 'tm/components/common/DateInput';
import SelectInput from 'tm/components/common/SelectInput';
import StatusHeader from './StatusHeader';


const CampaignDetailsHeader = ({ campaignEdits, isEditing, onEditClick, onSaveClick, onChangeField, onCancelClick,
    campaignElectionTypeOptions, currentUser, isPending,
    campaignStatusOptions, campaignStatusConstOptions, onOpenCampaignStatusModalClick }) => {

    let inputs = [
        { name: 'user_create_id', label: 'מנהל קמפיין', type: 'text', readonly: true },
        { name: 'scheduled_start_date', label: 'ת. התחלה מתוכנן', type: 'date' },
        { name: 'scheduled_end_date', label: 'ת. סיום מתוכנן', type: 'date' },
        { name: 'lengthPlanned', label: 'משך מתוכנן', type: 'text', readonly: true },
        { name: 'general_election', label: 'סוג קמפיין', type: 'select', required: true },
        { name: 'activation_start_date', label: 'ת. התחלה בפועל', type: 'date', readonly: true },
        { name: 'activation_end_date', label: 'ת. סיום בפועל', type: 'date', readonly: true },
        { name: 'lengthActual', label: 'משך בפועל', type: 'text', readonly: true }
    ];

    let campaignDetailsClass = 'campaign-details campaign-detail-form' + (isEditing ? ' campaign-detail-form_editable' : '');
    let valueData, valueId;
    let campaignElectionTypeOptionsArr = _.keys(campaignElectionTypeOptions).map(value => {
        return { value, label: campaignElectionTypeOptions[value] };
    });

    let invalidName = (campaignEdits['name'] == undefined) ? true : (campaignEdits['name'].trim().length > 3) ? false : true;

    //set variables for schedule dates validitiy
    let isoDateFormat = "YYYY-MM-DD";
    let scheduleStartDate = moment(campaignEdits.scheduled_start_date, isoDateFormat, true);
    let scheduleEndDate = moment(campaignEdits.scheduled_end_date, isoDateFormat, true);
    let validScheduleStartDate = scheduleStartDate.isValid();
    let validScheduleEndDate = scheduleEndDate.isValid();
    let validScheduleDates = (validScheduleStartDate && validScheduleEndDate && scheduleEndDate.isSameOrAfter(scheduleStartDate));
    
    let campaignHadStarted = false;
    let hasExportPermission = (currentUser.admin || currentUser.permissions['tm.campaign.questionnaire.export'] == true)
   
    let activation_start_date = campaignEdits.activation_start_date;
    if (hasExportPermission && activation_start_date) { //Check campaign start time
        let campaignStartTime = new Date(activation_start_date + ' 00:00').getTime();
        let currentTime = new Date().getTime();
        campaignHadStarted = campaignStartTime < currentTime ? true : false;
    }

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
            name: campaignEdits.name,
            general_election: campaignEdits.general_election,
            scheduled_start_date: campaignEdits.scheduled_start_date,
            scheduled_end_date: campaignEdits.scheduled_end_date,
        }
        onSaveClick(e, parameters);
    }

    /**
     * Show dashboard screen
     *
     * @return void
     */    
    function showDashboard() {
        let disabled = (campaignEdits.team_id == null)? true : false;
        if (currentUser.admin || currentUser.permissions['tm.dashboard'] == true) {
            return (
                <Link to={"telemarketing/dashboards/" + campaignEdits.key}>
                    <button className="btn btn-warning btn-sm" disabled={disabled} style={{margin: '0 5px'}}>מסך בקרה</button>
                </Link>
            )
        } else {
            return;
        }
    }
	
	function getFormattedTimeFromSeconds(seconds){
		seconds = parseInt(seconds);
		let formattedTime = "";
		let hours = parseInt(seconds/3600);
		let minutes = parseInt((seconds - hours*3600)/60) ;
		let secondsModuled =  (seconds - hours*3600 - minutes*60) ;
		formattedTime = hours + ":" + minutes + ":" + secondsModuled;
		return formattedTime;
	}
 
    return (
        <section className="dtlsBox main-section-block">
            <form onSubmit={saveCampaign}>
                <div className={"row " + campaignDetailsClass}>
                    <div className="col-lg-7 col-md-5">
                        <div className="campaign-details__title-row">#: {campaignEdits['id']}</div>
                        <div className="campaign-details__name campaign-details__field" onClick={onEditClick} style={{width:'100%'}}>
                            <TextInput
                                name={'name'}
                                value={campaignEdits['name']}
                                type='text'
                                onChange={onChangeFieldTemp}
                                disabled={!isEditing}
                                required={true}
                                className="campaign-details__input"
                                isInvalid={invalidName}
                            />
                            
                        </div>
                    </div>
                    <div className='col-lg-5 col-md-7 campaign-details__buttons'>
                    <Link to="telemarketing/campaigns/">
                        <button className="btn btn-warning btn-sm" style={{margin: '0 5px'}}>  כל הקמפיינים </button>
                    </Link>
                    {showDashboard()}
                        {(campaignEdits.status != undefined) &&
                            <StatusHeader
                                statusCampaign={campaignEdits.status}
                                campaignStatusOptions={campaignStatusOptions}
                                campaignStatusConstOptions={campaignStatusConstOptions}
                                onOpenCampaignStatusModalClick={onOpenCampaignStatusModalClick}
                            />
                        }
                        {(!currentUser.admin && currentUser.permissions['tm.campaign.edit'] != true) ? null :
                                <div className="campaign-sidebar__header">
                                    <EditButtons
                                        isEditing={isEditing}
                                        onCancelClick={onCancelClick}
                                        onEditClick={onEditClick}
                                        editLabel='ערוך קמפיין'
                                        isPending={isPending}
                                        disableSave={invalidName || !validScheduleDates}
                                    />
                                </div>
                        }
                        {hasExportPermission && campaignHadStarted && <div className="campaign-management__row">
                            <Link to={`api/tm/questionnaires/${campaignEdits.key}/voters_answers/export`}
                                className="icon-box excel" target="_blank" title="ייצוא קובץ תשובות תושבים לשאלון">
                            </Link>
                        </div>}
                        {hasExportPermission && !campaignHadStarted && <div className="campaign-management__row">
                            <a style={{ opacity: 0.6, cursor: 'not-allowed' }} className="icon-box excel"></a>
                        </div>}
                    </div>
                </div>
                <div className={"row " + campaignDetailsClass}>
                    {inputs.map((input, i) =>
                        <div key={input.name} className={"campaign-details-header__field" + (i % 4 === 3 ? ' campaign-details-header__field_sm' : '')}>
                            <dl className="dl-horizontal">
                                <dt>{input.label}:</dt>
                                {(() => {
                                    switch (input.name) {
                                        case "user_create_id":
                                            valueData = campaignEdits["creator_name"] || currentUser.first_name + ' ' + currentUser.last_name;
                                            break;
                                        case "lengthPlanned":
                                            valueData = campaignEdits["scheduled_end_date"] && campaignEdits["scheduled_start_date"]
                                                ? moment(campaignEdits["scheduled_end_date"]).diff(campaignEdits["scheduled_start_date"], 'days')
                                                : "";
                                            break;
                                        case "lengthActual":
                                            valueData = campaignEdits["total_active_time_seconds"]  
                                                ? getFormattedTimeFromSeconds(campaignEdits["total_active_time_seconds"])
                                                : "";
                                            break;
                                        default:
                                            valueData = campaignEdits[input.name];
                                    }
                                })()}
                                {(() => {
                                    switch (input.type) {
                                        case "select":
                                            return (
                                                <dd onClick={() => { !input.readonly && onEditClick() }} className={"campaign-details__field" + (input.readonly ? " campaign-details__field_readonly" : '')}>
                                                    <SelectInput
                                                        name={input.name}
                                                        options={campaignElectionTypeOptionsArr}
                                                        value={valueData}
                                                        onChange={onChangeFieldTemp}
                                                        disabled={!isEditing || input.readonly}
                                                        required={input.required}
                                                        requireDefault={true}
                                                        className={"campaign-details__input"}
                                                    />
                                                    <i className="fa fa-pencil"></i>
                                                </dd>
                                            );
                                        case "date":
                                            return (
                                                <dd onClick={() => { !input.readonly && onEditClick() }} className={"campaign-details__field" + (input.readonly ? " campaign-details__field_readonly" : '')}>
                                                    <DateInput
                                                        name={input.name}
                                                        value={valueData}
                                                        onChange={onChangeField}
                                                        format="DD/MM/YYYY"
                                                        savingFormat="YYYY-MM-DD"
                                                        readonly={!isEditing || input.readonly}
                                                        require={input.require}
                                                    />
                                                    <i className="fa fa-pencil"></i>
                                                </dd>
                                            );
                                        default:
                                            return (
                                                <dd onClick={() => { !input.readonly && onEditClick() }} className={"campaign-details__field" + (input.readonly ? " campaign-details__field_readonly" : '')}>
                                                    <TextInput
                                                        type={input.type}
                                                        className={"campaign-details__input"}
                                                        name={input.name}
                                                        value={valueData}
                                                        disabled={!isEditing || input.readonly}
                                                        onChange={onChangeFieldTemp}
                                                        require={input.require} />
                                                    <i className="fa fa-pencil"></i>
                                                </dd>
                                            );
                                    }
                                })()}
                            </dl>
                        </div>
                    )}
                </div>
            </form>
        </section>
    );
};

CampaignDetailsHeader.propTypes = {
    campaignEdits: PropTypes.object,
    isEditing: PropTypes.bool,
    onEditClick: PropTypes.func,
    onSaveClick: PropTypes.func,
    onCancelClick: PropTypes.func,
    onChangeField: PropTypes.func,
    campaignElectionType: PropTypes.object,
    currentUser: PropTypes.object,
    isPending: PropTypes.bool,
    campaignStatusOptions: PropTypes.array,
    campaignStatusConstOptions: PropTypes.array,
    onOpenCampaignStatusModalClick: PropTypes.func,
};

CampaignDetailsHeader.defaultProps = {
    campaignEdits: {},
    onEditClick: () => { }
};

export default CampaignDetailsHeader;
