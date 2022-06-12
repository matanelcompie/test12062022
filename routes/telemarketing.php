<?php

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'api'], function () {

  //Middleware for returning predefined JSON result
  Route::group(['middleware' => 'apiOutput'], function () {
    //Middleware for checking maintenance mode on API calls
    Route::group(['middleware' => 'CheckMaintenance'], function () {
      Route::post('tm/monitor/new-call', 'Tm\CampaignController@monitorNewCall')->name('tm.campaign.monitor.new-call');

      //Middleware for checking permission on API calls
      Route::group(['middleware' => 'apiPermissions'], function () {
        /* campaign */
        Route::get('/tm/campaigns/employees/{key?}', 'UserController@getUsers')->name('tm.campaign.employees');
        Route::get('/tm/campaigns', 'Tm\CampaignController@getCampaigns')->name('tm.campaigns,elections.reports.general');
        Route::get('/tm/campaigns/portions', 'Tm\CampaignController@getCampaignsPortions')->name('tm.campaigns');
        Route::get('/tm/campaigns/{campaignKey}', 'Tm\CampaignController@getCampaign')->name('tm.campaign');
        //Route::delete('/tm/campaigns/{campaignKey}', 'Tm\CampaignController@deleteCampaign')->name('allow');
        Route::put('/tm/campaigns/{campaignKey}', 'Tm\CampaignController@updateCampaign')->name('tm.campaign.edit');
        Route::post('/tm/campaigns', 'Tm\CampaignController@addCampaign')->name('tm.campaigns.add');
        Route::get('/tm/campaigns/{campaignKey}/questionnaire', 'Tm\CampaignController@getQuestionnaire')->name('tm.campaign.questionnaire');
        Route::get('/tm/campaigns/{campaignKey}/inactive_questionnaires', 'Tm\CampaignController@getInactiveQuestionnaires')->name('tm.campaign.questionnaire');
        Route::get('/tm/campaigns/{campaignKey}/other_questionnaires', 'Tm\CampaignController@getOtherQuestionnaires')->name('tm.campaign.questionnaire');
        Route::post('/tm/campaigns/{campaignKey}/questionnaire', 'Tm\CampaignController@addQuestionnaire')->name('tm.campaign.questionnaire.add');
        Route::get('/tm/campaigns/{campaignKey}/questionnaire_full', 'Tm\CampaignController@getQuestionnaireFull')->name('tm.campaign.questionnaire,cti');
        Route::get('/tm/campaigns/{campaignKey}/portions', 'Tm\CampaignController@getPortions')->name('tm.campaign.portions');
        Route::put('/tm/campaigns/{campaignKey}/portions', 'Tm\CampaignController@updatePortions')->name('tm.campaign.portions.edit');
        Route::post('/tm/campaigns/{campaignKey}/portions', 'Tm\CampaignController@copyPortions')->name('tm.campaign.portions.add');

        Route::get('/tm/campaigns/{campaignId}/portions-progress', 'Tm\CampaignController@getPortionsProgress')->name('tm.campaign.portions.progress');
        Route::get('/tm/campaigns/{campaignId}/users-count', 'Tm\CampaignController@getCampaignUserCount')->name('tm.campaign.campaign.users.count');

        Route::post('/tm/campaigns/{campaignKey}/addQuestionnaire', 'Tm\CampaignController@addQuestionnaire')->name('tm.campaign.questionnaire.add');
        Route::post('/tm/campaigns/{campaignKey}/copy_questionnaire/{questionnaireKey}', 'Tm\CampaignController@copyQuestionnaire')->name('tm.campaign.questionnaire.add');
        Route::get('/tm/campaigns/{campaignKey}/statistics', 'Tm\CampaignController@getStatistics')->name('tm.campaigns');


        /* campaign messages */
        Route::post('/tm/campaigns/{campaignKey}/messages/', 'Tm\CampaignController@addMessage')->name('tm.campaign.cti_settings.edit');
        Route::put('/tm/campaigns/{campaignKey}/messages/{messageKey}', 'Tm\CampaignController@updateMessage')->name('tm.campaign.cti_settings.edit');
        Route::delete('/tm/campaigns/{campaignKey}/messages/{messageKey}', 'Tm\CampaignController@deleteMessage')->name('tm.campaign.cti_settings.edit');

        /* dashboards */
        Route::get('/tm/dashboards/{campaignKey}', 'Tm\DashboardCampaignsController@getBasicCampaignDashboardStats')->name('tm.dashboard');
        Route::get('/tm/dashboards/{campaignKey}/agents_performance', 'Tm\DashboardCampaignsController@getAgentsPerformance')->name('tm.dashboard');
        Route::get('/tm/dashboards/{campaignKey}/agents_performance/{userKey}', 'Tm\DashboardCampaignsController@getSpecificAgentCallingVoterData')->name('tm.dashboard');
        Route::get('/tm/dashboards/{campaignKey}/calls_performance', 'Tm\DashboardCampaignsController@getCallsPerformance')->name('tm.dashboard');
        Route::get('/tm/dashboards/{campaignKey}/agents_work', 'Tm\DashboardCampaignsController@getAgentsWork')->name('tm.dashboard');
        //  Route::get('/tm/dashboards/{campaignKey}/agents_work_summary/export', 'Tm\DashboardCampaignsController@getAgentsWorkSummary')->name('tm.dashboard'); !!permissions!!!
        Route::get('/tm/dashboards/{campaignKey}/agents_work_summary/export', 'Tm\DashboardCampaignsController@getAgentsWorkSummary')->name('allow');
        Route::get('/tm/dashboards/{campaignKey}/agent_calls/{agentUserKey}', 'Tm\DashboardCampaignsController@getAgentCalls')->name('tm.dashboard');
        Route::get('/tm/dashboards/{campaignKey}/agent_calls/{agentUserKey}/calls/{callKey}', 'Tm\DashboardCampaignsController@getCallDetails')->name('tm.dashboard');
        Route::get('/tm/dashboards/{campaignKey}/extension/', 'Tm\CtiController@getExtension')->name('tm.dashboard');

        /* questionnaire */
        Route::get('/tm/questionnaires', 'Tm\QuestionnaireController@getQuestionnaires')->name('tm.campaign.questionnaire');
        Route::get('/tm/questionnaires/{key}', 'Tm\QuestionnaireController@getQuestionnaire')->name('tm.campaign.questionnaire');
        Route::get('/tm/questionnaires/{key}/full', 'Tm\QuestionnaireController@getQuestionnaireFull')->name('tm.campaign.questionnaire');
        Route::delete('/tm/questionnaires/{key}', 'Tm\QuestionnaireController@deleteQuestionnaire')->name('tm.campaign.questionnaire.delete');
        Route::put('/tm/questionnaires/{key}', 'Tm\QuestionnaireController@updateQuestionnaire')->name('tm.campaign.questionnaire.edit');
        Route::post('/tm/questionnaires', 'Tm\QuestionnaireController@addQuestionnaire')->name('tm.campaign.questionnaire.add');
        Route::put('/tm/questionnaires/{key}/upsert_question/{questionId}', 'Tm\QuestionnaireController@upsertQuestion')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');
        Route::post('/tm/questionnaires/{questionnaireKey}/add_question', 'Tm\QuestionnaireController@addQuestion')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');
        Route::get('/tm/questionnaires/{campaignKey}/voters_answers/export', 'Tm\QuestionnaireController@exportQuestionnaireVotersAnswersToCsv')->name('tm.campaign.questionnaire.export');

        /* question */
        Route::get('/tm/questions', 'Tm\QuestionController@getQuestions')->name('tm.campaign.questionnaire');
        Route::delete('/tm/questions/{key}', 'Tm\QuestionnaireController@deleteQuestion')->name('tm.campaign.questionnaire.delete');
        Route::put('/tm/questions/{key}', 'Tm\QuestionController@updateQuestion')->name('tm.campaign.questionnaire.edit,tm.campaign.questionnaire.add');
        Route::post('/tm/questions', 'Tm\QuestionController@addQuestion')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');

        /* possible_answer */
        Route::get('/tm/possible_answers', 'Tm\PossibleAnswerController@getPossibleAnswers')->name('tm.campaign.questionnaire');
        Route::delete('/tm/possible_answers/{key}', 'Tm\PossibleAnswerController@deletePossibleAnswer')->name('tm.campaign.questionnaire.delete');
        Route::put('/tm/possible_answers/{key}', 'Tm\PossibleAnswerController@updatePossibleAnswer')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');
        Route::post('/tm/possible_answers', 'Tm\PossibleAnswerController@addPossibleAnswer')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');

        /* voters_answer */
        Route::get('/tm/voters_answers', 'Tm\VotersAnswerController@getVotersAnswers')->name('tm.campaign.questionnaire');
        Route::delete('/tm/voters_answers/{key}', 'Tm\VotersAnswerController@deleteVotersAnswer')->name('tm.campaign.questionnaire.delete');
        Route::put('/tm/voters_answers/{key}', 'Tm\VotersAnswerController@updateVotersAnswer')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');
        Route::post('/tm/voters_answers', 'Tm\VotersAnswerController@addVotersAnswer')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');
        Route::post('/tm/voters_answers/bulk', 'Tm\VotersAnswerController@addVotersAnswersBulk')->name('tm.campaign.questionnaire.add,tm.campaign.questionnaire.edit');

        /* call */
        // Route::get('/tm/calls', 'Tm\CallController@getCalls')->name('allow');
        // Route::get('/tm/calls/{key}', 'Tm\CallController@getCallDetails')->name('allow');
        // Route::delete('/tm/calls/{key}', 'Tm\CallController@deleteCall')->name('allow');
        // Route::put('/tm/calls/{key}', 'Tm\CallController@updateCall')->name('allow');
        // Route::post('/tm/calls/{key}/finish', 'Tm\CallController@finishCall')->name('allow');
        // Route::post('/tm/calls', 'Tm\CallController@addCall')->name('allow');

        /* call_note */
        // Route::get('/tm/call_notes', 'Tm\CallNoteController@getCallNotes')->name('allow');
        // Route::delete('/tm/call_notes/{key}', 'Tm\CallNoteController@deleteCallNote')->name('allow');
        // Route::put('/tm/call_notes/{key}', 'Tm\CallNoteController@updateCallNote')->name('allow');
        // Route::post('/tm/call_notes', 'Tm\CallNoteController@addCallNote')->name('allow');

        /* system */
        Route::get('tm/option_labels', 'Tm\TmController@getOptionLabels')->name('tm.campaigns');
        Route::get('/tm/lists', 'Tm\TmController@getLists')->name('allow'); //OK
        Route::get('/tm/lists/cti_permissions', 'Tm\TmController@getCtiPermissionsLists')->name('tm.campaign.cti_settings');

        /* Dialer API */
        Route::get('/tm/campaigns/{campaignKey}/voter_phones', 'Tm\CampaignController@getVoterPhones')->name('tm.calls');
        Route::post('/tm/campaigns/{campaignKey}/calls', 'Tm\CampaignController@addNewCall')->name('cti,tm.calls.add');
        Route::post('/tm/campaigns/{campaignKey}/recordings', 'Tm\CampaignController@addNewRecording')->name('tm.calls.recording.add');

        /* Calls API */
        Route::get('/download-call-file/{campaign_id}/{call_file_name}', 'Tm\CallController@downloadCallFile')->name('allow');

        /* Employees */
        Route::get('/tm/campaigns/{campaignKey}/employees', 'Tm\CampaignController@getEmployees')->name('tm.campaign.employees');
        Route::put('/tm/campaigns/{campaign_key}/employees/{userKey}', 'Tm\CampaignController@saveEmployee')->name('tm.campaign.employees.edit');
        Route::delete('/tm/campaigns/{campaign_key}/employees/{userKey?}', 'Tm\CampaignController@deleteEmployee')->name('tm.campaign.employees.delete');
        Route::post('/tm/campaigns/{campaignKey}/employees/', 'Tm\CampaignController@addEmployee')->name('tm.campaign.employees.add');
        Route::post('/tm/monitor/{campaignKey}', 'Tm\CampaignController@monitor')->name('tm.campaign.monitor');
      });
    });
  });
});
