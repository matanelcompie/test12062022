<?php

/*
  |--------------------------------------------------------------------------
  | Web Routes
  |--------------------------------------------------------------------------
  |
  | This file is where you may define all of the routes that are handled
  | by your application. Just tell Laravel the URIs it should respond
  | to using a Closure or controller method. Build something great!
  |
 */

/* Routing login screen */
 use Illuminate\Support\Facades\Route;

 
 Route::get('/_debugbar/assets/stylesheets', [
        'as' => 'debugbar-css',
        'uses' => '\Barryvdh\Debugbar\Controllers\AssetController@css'
])->name('allow');

Route::get('/_debugbar/assets/javascript', [
        'as' => 'debugbar-js',
        'uses' => '\Barryvdh\Debugbar\Controllers\AssetController@js'
])->name('allow');

Route::get('_debugbar/open', [
        'as' => 'debugbar.openhandler',
        'uses' => '\Barryvdh\Debugbar\Controllers\OpenHandlerController@handle',
])->name('allow');
// Route temporary for captain50 beta app (mobile) 
// Route::group(['middleware' => 'auth.guest'], function () {
        Route::get('/captain50-mobile', 'Captain50MobileController@index')->name('allow');
// });

Route::get('/_debugbar/assets/stylesheets', [
  'as' => 'debugbar-css',
  'uses' => '\Barryvdh\Debugbar\Controllers\AssetController@css'
])->name('allow');

Route::get('/_debugbar/assets/javascript', [
  'as' => 'debugbar-js',
  'uses' => '\Barryvdh\Debugbar\Controllers\AssetController@js'
])->name('allow');

Route::get('_debugbar/open', [
  'as' => 'debugbar.openhandler',
  'uses' => '\Barryvdh\Debugbar\Controllers\OpenHandlerController@handle',
])->name('allow');
    




Route::group(['middleware' => 'auth.user'], function () {

    Route::get('/login', 'Auth\LoginController@index')->name('login');
});

/* Logout */
Route::get('/logout', 'Auth\LoginController@logout')->name('logout');
//getting uesr information according to given token - for reset password
Route::get('/login/reset_password/{token}', 'Auth\LoginController@getUserResetPassword');

/* Routing user information screen */
Route::get('/user/info', 'UserController@info');

/* Route all ajax calls */
//api prefix
Route::group(['prefix' => 'api'], function () {

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {

        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            Route::get( '/health-check', 'SystemController@healthCheckSystem' );
            Route::get( '/health-check-server', 'SystemController@webServerApiCheck');
            // Need Check server activists ip by local ip' save in .env
            Route::post('/activists/login', 'Auth\LoginController@loginActivist');
            Route::post('/activists/login/code', 'Auth\LoginController@checkActivistCode');
            
            Route::post('/login', 'Auth\LoginController@loginUser');
            //forgot password - send mail to user with reset password token        
            Route::post('/login/reset_password', 'Auth\LoginController@resetUserPassword');
            Route::post('/login/reset-password-sms', 'Auth\LoginController@resetPasswordViaSms');
            Route::post('/login/resend-sms-code', 'Auth\LoginController@resendSmsCode');
            // resetting password for user
            Route::put('/login/reset_password/{token}', 'Auth\LoginController@resetingUserPassword');
           
            //Middleware for checking permission on API calls

            Route::group(['middleware' => 'apiPermissions'], function () {

                //routing external SMS
                Route::post('/system/sms', 'SmsController@addSms')->name('system.sms.add');

                //routing external IVR
                Route::post('/system/ivr/activists/roles', 'IvrController@getActivistIvrRoleVerification')->name('system.ivr.add');
                Route::post('/system/ivr/activists/ballots', 'IvrController@getActivistIvrBallotVerification')->name('system.ivr.add');
                Route::post('/system/ivr/activists/votes', 'IvrController@getActivistIvrVotesReporitng')->name('system.ivr.add');

                Route::get('/elections/clusters/{cluster_key}/drivers', 'VoterElectionsController@getElectionRoleByVoterGeographical');
                Route::delete('/elections/clusters/{cluster_key}/drivers/{election_role_by_voter_key}', 'VoterElectionsController@deleteElectionRoleByVoterGeographical')->name('elections.transportations.drivers.delete');
                Route::put('/elections/clusters/{cluster_key}/drivers/{election_role_by_voter_key}', 'VoterElectionsController@editElectionRoleByVoterGeographical')->name('elections.transportations.drivers.edit');
                Route::post('/elections/clusters/{cluster_key}/drivers', 'VoterElectionsController@addElectionRoleByVoterGeographical')->name('elections.clusters.drivers.add');
                Route::get('/elections/clusters', 'VoterElectionsController@searchClustersByParams')->name('elections.clusters');
    /*
                Route::get('/elections/transportations', 'VoterElectionsController@searchTransportations')->name('elections.transportations.drivers');
                Route::get('/elections/transportations/drivers/{key}', 'VoterElectionsController@getTransportationsByDriver')->name('elections.transportations.drivers');
                Route::put('/elections/transportations/drivers/{key}', 'VoterElectionsController@setTransportationDrivers')->name('elections.transportations.drivers.edit');
    */
                //Reports: Activists duplicates
                /*
                Route::get('/elections/activists/duplicates', 'ActivistsController@findDuplicates')->name('allow');

                /*             * * header search ** */
                Route::get('/system/search', 'MenuController@headerSearch')->name('allow');

                /*             * system errors* */
                Route::get('/system/errors', 'SettingsController@getErrorList')->name('allow');

                /*             * * last viewed ** */
                Route::get('/elections/voters/last_viewed', 'VoterController@getLastViewed')->name('allow');
                Route::post('/elections/voters/last_viewed', 'VoterController@updateLastViewed')->name('allow');
                Route::delete('/elections/voters/last_viewed', 'VoterController@deleteLastViewed')->name('allow');

                /*             * * User Favorites ** */
                Route::get('/system/users/current/favorites', 'UserController@getFavorites')->name('allow');
                Route::post('/system/users/current/favorites', 'UserController@addToFavorites')->name('allow');
                Route::delete('/system/users/current/favorites/{key}', 'UserController@removeFromFavorites')->name('allow');

                /*             * * Current Campaign ** */
                Route::get('/system/current/campaign', 'CampaignController@getCurrentCampaign')->name('allow');

                /*             * *  Accessorry lists for actions  ** */
                Route::get('/elections/voters/action/types', 'ActionController@getActionTypes')
                        ->name('elections.voter.actions');
                Route::get('/elections/voters/statuses', 'ActionController@getActionStatuses')
                        ->name('elections.voter.actions');
                Route::get('/elections/voters/action/topics', 'ActionController@getAllActionTopics')
                        ->name('elections.voter.actions');

                /*             * * Voter Info User Data ** */
                Route::get('/elections/voters/{key}/user', 'VoterController@getVoterUser')
                     ->name('elections.voter.additional_data.user');

                /*             * * Accessory lists of voter institutes  ** */
                Route::get('/elections/voters/institutes', 'InstituteController@getAllInstitutes')
                     ->name('elections.voter.political_party.shas_institutes,elections.import');
    			Route::get('/elections/voters/institutes/search', 'InstituteController@searchInstitutes')
                     ->name('elections.voter.political_party.shas_institutes,elections.import');
                Route::get('/elections/voters/institutes/groups', 'InstituteController@getInstituteGroups')
                     ->name('elections.voter.political_party.shas_institutes,elections.import');
                Route::get('/elections/voters/institutes/types', 'InstituteController@getInstituteTypes')
                     ->name('elections.voter.political_party.shas_institutes,elections.import');
                Route::get('/elections/voters/institutes/roles', 'InstituteController@getInstituteRoles')
                     ->name('elections.voter.political_party.shas_institutes,elections.import');
                Route::get('/elections/voters/institutes/networks', 'InstituteController@getInstituteNetworks')
                     ->name('elections.voter.political_party.shas_institutes,elections.import');

                /*             * *  Voter Institutes  ** */
                Route::get('/elections/voters/{key}/institutes', 'InstituteController@getVoterInstitutes')
                     ->name('allow');
				Route::put('/elections/voters/{key}/institutes/{institute_role_by_voter_id}', 'InstituteController@saveVoterInstituteByRowID')
                     ->name('allow');
			    Route::delete('/elections/voters/{key}/institutes/{institute_role_by_voter_id}', 'InstituteController@deleteVoterInstituteByRowID')
                     ->name('allow');
				Route::post('/elections/voters/{key}/institutes', 'InstituteController@addNewVoterInstituteRole')
                     ->name('allow');
			    /*
                Route::put('/elections/voters/{key}/institutes', 'InstituteController@saveVoterInstitutes')
                     ->name('allow');
				*/
    				  /*             * *  Voter Send Sms  ** */
    		     Route::post('/elections/voters/{key}/sendSMS', 'VoterSmsController@sendVerifiedSMS')
                     ->name('elections.voter.fast_buttons.new_sms');

                /*  Accessory list of voter groups  */
                Route::get('/elections/voters/groups', 'ShasVoterGroupsController@getVoterGroups')
                    ->name('elections.voter.political_party.shas_groups');

                /*             * *   Voter Groups  ** */
                Route::get('/elections/voters/{key}/groups', 'ShasVoterGroupsController@getVoterInGroups')
                        ->name('elections.voter.political_party.shas_groups');
                Route::put('/elections/voters/{key}/groups', 'ShasVoterGroupsController@saveVoterGroups')
                        ->name('elections.voter.political_party.shas_groups.edit');

                /*             * * Voter Household ** */
                Route::get('/elections/voters/{key}/household', 'VoterController@getVoterHousehold')
                        ->name('elections.voter.household');
                Route::post('/elections/voters/{voter_key}/household/{household_key}', 'VoterSupportStatusController@addHouseholdStatus')
                        ->name('elections.voter.household.support_status.edit');
                Route::put('/elections/voters/{voter_key}/household/{household_key}/status/{status_key}', 'VoterSupportStatusController@editHouseholdStatus')->name('elections.voter.household.support_status.edit');
                Route::delete('/elections/voters/{voter_key}/household/{household_key}/status/{status_key}', 'VoterSupportStatusController@deleteHouseholdStatus')
                        ->name('elections.voter.household.support_status.edit');

                // Using this one in the near future
                Route::get('/elections/voters/{key}/extraData/deathData', 'VoterExtraDataContoller@getVoterDeathData');
                // Using this one in the near future
                Route::put('/elections/voters/{key}/extraData/deathData', 'VoterExtraDataContoller@saveVoterDeathData');

                /** Meta Data */
                Route::get('/elections/voters/metadata/keys', 'VoterMetaDataContoller@getMetaDataKeys')
                     ->name('elections.voter.additional_data.meta,elections.voter.support_and_elections.election_activity');
                Route::get('/elections/voters/metadata/values', 'VoterMetaDataContoller@getMetaDataValues')
                     ->name('elections.voter.additional_data.meta,elections.voter.support_and_elections.election_activity');

                /*             * * Voter Meta Data ** */
                Route::get('/elections/voters/{key}/metadata/all', 'VoterMetaDataContoller@getVoterMetaDataKeysValues')
                     ->name('elections.voter.additional_data.meta,
                                elections.voter.support_and_elections.election_activity.additional_data');
                Route::put('/elections/voters/{key}/metadata/all', 'VoterMetaDataContoller@saveVoterMetaDataValues')
                     ->name('elections.voter.additional_data.meta.edit,
                             elections.voter.support_and_elections.election_activity.additional_data.edit');

                /*             * *  Voter's Requests ** */
                Route::get('/elections/voters/{key}/requests', 'VoterController@getVoterRequests')
                        ->name('elections.voter.requests');

                /*             * *   Voter's actions  ** */
                Route::get('/elections/voters/{key}/actions', 'ActionController@getActions')
                        ->name('elections.voter.actions');
                Route::post('/elections/voters/{key}/actions', 'ActionController@addAction')
                        ->name('elections.voter.actions.add');
                Route::put('/elections/voters/{voter_key}/actions/{action_key}', 'ActionController@editAction')
                        ->name('elections.voter.actions.edit');
                Route::delete('/elections/voters/{voter_key}/actions/{action_key}', 'ActionController@deleteAction')
                        ->name('elections.voter.actions.delete');

                /*             * *   Voter's dialer call actions  ** */
                Route::post('/elections/voters/{key}/calls/actions', 'ActionController@addAction')
                        ->name('elections.voter.fast_buttons.dial');
                Route::put('/elections/voters/{voter_key}/calls/actions/{action_key}', 'ActionController@editAction')
                        ->name('elections.voter.fast_buttons.dial');

                // ??? Check if this one is necessary
                Route::get('/elections/voters/{key}/campaigns/last', 'VoterElectionsController@getLastCurrentCampaign')
                        ->name('elections.voter');

				/* Voter TM polls tab : */	
				
				Route::get('/elections/voters/{key}/polls', 'VoterTMPollsController@getAllVoterPolls')
                        ->name('elections.voter.polls');
						
                /*             * * Voter's captain of 50 ** */
                Route::get('/elections/voters/{key}/captainOfFifty', 'VoterActivistController@getCaptainOfFifty')
                        ->name('elections.voter.support_and_elections.election_activity');
                Route::delete('/elections/voters/{voter_key}/captainOfFifty', 'VoterActivistController@unAllocateVoterToCaptain50')
                    ->name('elections.voter.support_and_elections.election_activity');
                Route::post('/elections/voters/{voter_key}/captainOfFifty/{captain_key}', 'VoterActivistController@allocateVoterToCaptain50')
                    ->name('elections.voter.support_and_elections.election_activity');
                /*Route::delete('/elections/voters/{key}/captainOfFifty', 'VoterActivistController@deleteVoterHouseholdCaptainOfFifty')
                        ->name('elections.voter.support_and_elections.election_activity');
                Route::post('/elections/voters/{key}/captainOfFifty', 'VoterActivistController@addVoterHouseholdCaptainOfFifty')
                        ->name('elections.voter.support_and_elections.election_activity');
                Route::put('/elections/voters/{key}/captainOfFifty', 'VoterActivistController@editVoterHouseholdCaptainOfFifty')
                        ->name('elections.voter.support_and_elections.election_activity');*/
                /* Route::put( '/elections/voters/{key}/captainOfFifty', 'VoterActivistController@saveMinisterOfFifty' )
                  ->name('elections.voter.support_and_elections.election_activity.additional_data.edit'); */
                /*Route::put('/elections/voters/{key}/captainOfFifty/{captain_key}', 'VoterActivistController@saveMinisterOfFiftyWithKey')
                        ->name('elections.voter.support_and_elections.election_activity.additional_data.edit');
                Route::get('/elections/voters/captainOfFifty/{personal_identity}', 'VoterActivistController@getVoterMinisterOfFifty')
                        ->name('elections.voter.support_and_elections.election_activity.additional_data.edit');*/

                /*             * *  Voter Messages ** */
                Route::get('/elections/voters/{key}/messages', 'MessageController@getAllMessagesOfVoter')
                        ->name('elections.voter.messages');

                /**  System Document Types    **/
                Route::get('/system/documents/types', 'DocumentController@getDocumentTypes')->name('allow');

                /*             * *  Voter Documents  ** */
                Route::get('/elections/voters/{key}/documents', 'DocumentController@getDocuments')
                     ->name('elections.voter.documents');
                Route::post('/elections/voters/{key}/documents', 'DocumentController@addDocument')
                     ->name('elections.voter.documents.add');
                Route::put('/elections/voters/{voter_key}/documents/{document_key}', 'DocumentController@editDocument')
                     ->name('elections.voter.documents.edit');
                Route::delete('/elections/voters/{voter_key}/documents/{document_key}', 'DocumentController@deleteDocument')
                     ->name('elections.voter.documents.delete');

                /*             * *  Voter's phones ** */
                Route::get('/elections/voters/{key}/phones', 'VoterController@getVoterPhones')
                        ->name('elections.voter.additional_data.contact_details.phone');

                /*             * *  Voter in Election campaigns  ** */
                Route::get('/elections/voters/{key}/ballots', 'VoterController@getVoterInElectionCampaigns')
                        ->name('elections.voter.support_and_elections.ballot');
                Route::put('/elections/voters/{key}/ballots', 'VoterElectionsController@saveVoterBallot')
                        ->name('elections.voter.support_and_elections.ballot.edit');
                Route::put('/elections/voters/{key}/ballots/{transport_key}', 'VoterElectionsController@saveVoterBallotWithTransportKey')
                        ->name('elections.voter.support_and_elections.ballot.edit');

                /*             * *  Accessory list for Shas Representatives  ** */
                Route::get('/elections/voters/representatives/roles', 'ShasRepresentativeController@getRepresentativeRoles')
                        ->name('elections.voter.political_party.shas_representative');

                /*             * * Voter Representatives ** */
                Route::get('/elections/voters/{key}/representatives', 'ShasRepresentativeController@getRepresentativeDetails')
                        ->name('voter.representatives.list,elections.voter.political_party.shas_representative');
                /*Route::put('/elections/voters/{voter_key}/representatives', 'ShasRepresentativeController@saveRepresentatives')
                        ->name('elections.voter.political_party.shas_representative.role.edit');*/

                /*             * * Voter's Details ** */
                Route::get('/elections/voters/{key?}', 'VoterController@getVoterDetails')
                     ->name('elections.voter,crm.requests');

                /*             * *  Voter Search ** */
                Route::get('/voters/', 'VoterController@search')->name('elections.voter.search.apply');

                /*             * *  Voter Elections roles ** */
                Route::get('/elections/voters/{key}/roles', 'VoterActivistController@getAllHistoryElectionActivistRoles')
                        ->name('elections.voter.support_and_elections.election_activity');
                /*Route::put('/elections/voters/{key}/roles', 'VoterActivistController@saveVoterElectionRoles')
                        ->name('elections.voter.support_and_elections.election_activity.edit');*/

                /*             * *  Voter Info ** */
                Route::put('/elections/voters/{key}/details', 'VoterController@updateVoterDetails')
                      ->name('elections.voter.additional_data.details.edit');
                Route::put('/elections/voters/{key}/contact', 'VoterController@updateVoterContact')
                     ->name('elections.voter.additional_data.contact_details.phone.edit');
                Route::put('/elections/voters/{key}/email', 'VoterController@updateVoterEmail')
                     ->name('elections.voter.additional_data.contact_details.phone.edit');
                Route::put('/elections/voters/{key}/address', 'VoterController@validateVoterAddressFields')
                     ->name('elections.voter.additional_data.address.edit');

                /*             * * Accessory list for support statuses  ** */
                Route::get('/system/voter/support/statuses', 'VoterElectionsController@getAllSupportStatus')
                     ->name('elections.voter.support_and_elections.support_status,elections.voter.household,elections.import');

                /** Voter Support elections status  * */
                Route::get('/elections/voters/{key}/support/statuses', 'VoterController@getVoterSupportStatuses')
                     ->name('elections.voter.support_and_elections.support_status');
                Route::put('/elections/voters/{voter_key}/support/statuses', 'VoterSupportStatusController@saveVoterSupportStatuses')
                     ->name('elections.voter.support_and_elections.support_status.edit');
                Route::put('/elections/voters/{voter_key}/support/statuses/{status_key}', 'VoterSupportStatusController@saveVoterSupportStatusWithKey')
                     ->name('elections.voter.support_and_elections.support_status.edit');

                /**  Voter support status history **/
                Route::get('/elections/voters/{key}/support/statuses/all', 'VoterSupportStatusController@getAllVoterSupportStatuses')
                ->name('elections.voter.support_and_elections.support_status');
                
                /** Voter dialer **/
                Route::get('/elections/voters/web_dialer/details', 'VoterController@getUserCallDetails')
                        ->name('elections.voter.support_and_elections.support_status');
                Route::put('/elections/voters/{voter_key}/call/details', 'VoterController@saveCallData');
                
                /** system **/ 
                Route::get('/system/menu', 'MenuController@index')
                        ->name('allow');
                Route::get('/system/side_menu', 'MenuController@getSideMenu')
                        ->name('allow');
                Route::get('/system/permissions', "PermissionController@getPermission")
                        ->name('system.permission_groups');
                Route::get('/system/phoneTypes', "UserController@getPhoneTypes")
                     ->name('elections.voter.additional_data.contact_details.phone,system.users,elections.reports.general');
                /*
                !!Not in use!!
                Route::post('/system/permission_groups', "PermissionController@newGroup")
                        ->name('system.permission_groups.add');
                Route::get('/system/permission_groups/{key?}', "PermissionController@getGroup")
                        ->name('system.permission_groups');
                Route::put('/system/permission_groups/{key}', "PermissionController@updateGroup")
                        ->name('system.permission_groups.edit');
                Route::delete('/system/permission_groups/{key}', "PermissionController@deleteGroup")
                        ->name('system.permission_groups.delete');
                */
                /**/
                Route::post('/crm/requests/{key}/sendSMS', 'VoterSmsController@sendVerifiedSMS')
                    ->name('crm.requests.fast_buttons.new_sms');
                Route::post('/crm/requests/{key}/send_email', 'MessageController@sendEmailFromRequest')->name('crm.requests.fast_buttons.new_email');
                Route::post('/elections/voters/{key}/send_email', 'MessageController@sendEmailFromVoter')->name('elections.voter.fast_buttons.new_email');
                Route::put('/crm/requests/voters/{key}/new_email', 'CrmRequestController@updateVoterByTypeEmail')
                        ->name('crm.requests.add, crm.requests.edit');
                Route::post('/crm/requests/voters/unknown', 'CrmRequestController@addTempVoter');
                Route::put('/crm/requests/voters/unknown/{key}', 'CrmRequestController@editTempVoter');
                Route::put('/crm/requests/{key}/voters', 'CrmRequestController@updateRequestVoter')->name('crm.requests.edit');
                Route::post('/crm/requests/voters/unknown', 'CrmRequestController@addTempVoter')
                        ->name('crm.requests.unknown_voter.add');
                Route::put('/crm/requests/voters/unknown/{key}', 'CrmRequestController@editTempVoter')
                        ->name('crm.requests.unknown_voter.edit');
                Route::get('/crm/requests/search/print', 'CrmRequestController@printSearchResult');
                Route::get('/crm/requests/search/print_excel', 'CrmRequestController@printExcelSearchResult');
                
                        //     ->name('crm.requests.print'); required permission!
                Route::get('/crm/requests/search/{key?}', 'CrmRequestController@searchV2')->name('crm.requests.search');
                Route::get('/crm/requests/{key}/actions', 'ActionController@getActions')->name('crm.requests.actions');
                Route::get('/crm/requests/{key}/callbiz', 'CrmRequestController@getCallBiz')->name('crm.requests.callbiz');
                Route::get('/crm/requests/{key}/messages', 'MessageController@getMessages')->name('crm.requests.messages');
                Route::delete('/crm/requests/{key}/callbiz', 'CrmRequestController@deleteCallBiz')->name('crm.requests.callbiz.delete');
                Route::post('/crm/requests/{key}/callbiz', 'CrmRequestController@addCallBiz')->name('crm.requests.callbiz.add');
                Route::put('/crm/requests/{key}/callbiz', 'CrmRequestController@editCallBiz')->name('crm.requests.callbiz.edit');
                Route::get('/crm/requests/{key}/history', 'CrmRequestController@getHistory')->name('crm.requests.history');
                Route::get('/crm/requests/{key}/documents', 'DocumentController@getDocuments')->name('crm.requests.documents');
                Route::delete('/crm/requests/{req_key}/documents/{document_key}', 'DocumentController@deleteDocument')->name('crm.requests.documents.delete');
                Route::put('/crm/requests/{req_key}/documents/{document_key}', 'DocumentController@editDocument')->name('crm.requests.documents.edit');
                Route::post('/crm/requests/{req_key}/documents', 'DocumentController@addDocument')->name('crm.requests.documents.add');
                Route::get('/crm/requests/minmax/', 'CrmRequestController@getRequestMinMax');
                Route::get('/crm/requests/user/crm_summary/', 'HomeController@crmSummary')->name('home');
                Route::get('/crm/requests/{key}', 'CrmRequestController@getRequest')->name('crm.requests');
                Route::put('/crm/requests/{key}', 'CrmRequestController@editRequest')->name('crm.requests.edit');
                // using when editing a request and adding a file
                Route::post('/crm/requests/{key}', 'CrmRequestController@editRequest')->name('crm.requests.edit'); 
                Route::post('/crm/requests', 'CrmRequestController@addRequest')->name('crm.requests.add');

                /**/
                Route::get('/system/request/topics', 'CrmRequestController@getTopic')->name('crm.requests');
                Route::get('/system/request/action/topics/{key?}', 'ActionController@getRequestActionTopicsByActionType')->name('crm.requests');
                Route::get('/system/request/action/status', 'ActionController@getActionStatuses')->name('crm.requests.actions');
                Route::get('/system/request/action/types', 'ActionController@getRequestActionTypesByEntityType')->name('crm.requests');
                Route::post('/system/request/action/{key}', 'ActionController@addAction')->name('crm.requests.actions.add');
                Route::put('/crm/requests/{req_key}/actions/{action_key}', 'ActionController@editActionRequest')
                     ->name('crm.requests.actions.edit');
                Route::delete('/crm/requests/{req_key}/actions/{action_key}', 'ActionController@deleteAction')
                     ->name('crm.requests.actions.delete');
                Route::get('/system/request/status', 'CrmRequestController@getStatus')->name('crm.requests');
                Route::get('/system/request/status/{key}/types', 'CrmRequestController@getStatus')->name('crm.requests');
                Route::get('/system/request/priority', 'CrmRequestController@getPriority')->name('crm.requests');
                Route::get('/system/request/source', 'CrmRequestController@getSource')->name('crm.requests');
                Route::get('/system/request/closure_reason', 'CrmRequestController@getClosureReason')->name('crm.requests');
                Route::get('/system/request/satisfaction', 'CrmRequestController@getSatisfaction')->name('crm.requests');
                Route::get('/system/request/status/types/{key?}', 'CrmRequestController@getStatusByType')->name('crm.requests');
                /** */
                Route::get('/system/request/users/{team_key?}', 'CrmRequestController@getUsersWithRequestModuleRole')->name('crm.requests');
                /**/
                Route::get('/system/neighborhoods/{neighborhood_key}/ballots', 'GeographicController@getNeighborhoodsBallots')
                     ->name('allow');
                Route::get('/system/neighborhoods/{neighborhood_key}/clusters', 'GeographicController@getNeighborhoodClusters')
                     ->name('allow');
                Route::get('/system/cities/{key?}', "GeographicController@getCities")
                        ->name('allow');
                Route::get('/system/sub-city/{key?}', "GeographicController@getCities")
                        ->name('allow');
                Route::get('/system/cities/{key?}/ballots', "GeographicController@getCityBallots")
                     ->name('allow');
                Route::get('/system/cities/{key}/streets', 'GeographicController@getCityStreets')
                     ->name('allow');
                     Route::get('/system/cities/{key}/quarters', 'GeographicController@getCityQuarters')
                     ->name('allow');
                     
                Route::get('/system/cities/{city_key}/clusters', 'GeographicController@getCityClusters')
                     ->name('allow');
                Route::get('/system/cities/{city_key}/neighborhoods', 'GeographicController@getCityNeighborhoods')
                     ->name('allow');
                Route::get('/system/neighborhoods/{key?}', "GeographicController@getNeighborhoods")
                     ->name('allow');
                Route::get('/system/support/status', "SupportStatusController@getSupportStatuses")
                     ->name('allow');
    			Route::get('/system/ballots/{ballot_key}/electors', 'GeographicController@getBallotElectors')
                     ->name('allow');
                Route::get('/system/clusters/{key?}/ballots', "GeographicController@getClusterBallots")
                     ->name('allow');

                Route::get('/system/cluster-ballot/{key?}', "GeographicController@getListBallotBoxByClusterId")
                     ->name('allow');
                Route::get('/system/clusters', "GeographicController@clustersSearch")
                     ->name('elections.voter.support_and_elections.election_activity');
                Route::get('/system/clusters/{key?}', "GeographicController@getClusters")
                     ->name('elections.voter.support_and_elections.election_activity');
                Route::put('/system/clusters/update-cancel-google-map', "GeographicController@setClusterGoogleMap")
                     ->name('elections.voter.support_and_elections.election_activity');     

                Route::get('/system/ballots/roles', "GeographicController@getBallotBoxRoles")
                     ->name('elections.voter.support_and_elections.election_activity, elections.activists');

                Route::get('/system/ballots/{key?}', "GeographicController@getBallots")
                     ->name('elections.voter.support_and_elections.election_activity'); 

                Route::get('/system/areas/', "GeographicController@getAreas")->name('allow');
                Route::get('/system/sub-areas/{area_key?}', "GeographicController@getSubAreasData")->name('allow');
                Route::get('/system/users/current/geographic_lists', "UserController@getUserGeographicalLists")->name('allow');
                Route::get('/system/users/current', "UserController@getCurrentUser")->name('allow');
                Route::put('/system/users/current', "UserController@updateCurrentUser")->name('allow');
                Route::put('/system/users/other/password', "UserController@updateOtherUserPassword")->name('allow');
                Route::put('/system/users/other/unlock', "UserController@unlockOtherUser")->name('allow');
                Route::get('/system/users/{key?}', "UserController@getUsers")->name('system.users');
                Route::post('/system/users', "UserController@addUser")->name('system.users.add');
                Route::put('/system/users/{key}', "UserController@saveUser")->name('system.users.edit');
                Route::get('/system/users/current/teams', 'UserController@getCurrentUserTeams')
                        ->name('crm.requests.search, crm.requests.add, crm.requests.edit');
                Route::get('/system/users/current/team_mates', 'UserController@getCurrentUserTeamMates')
                        ->name('crm.requests.search, crm.requests.add, crm.requests.edit');
                Route::get('/system/users/current/roles', 'UserController@getCurrentUserRoles')
                        ->name('crm.requests');

                /**/
    			
                Route::get('/system/files/groups', 'GlobalFilesController@getGroupsWithFiles')->name('allow');
                Route::get('/system/files/groups/modules', 'GlobalFilesController@getAllModules')->name('allow');
                Route::get('/system/files/{file_key}' , 'GlobalFilesController@downloadFile')->name('allow');
                Route::post('/system/files/groups', 'GlobalFilesController@addNewFileGroup')->name('admin');
                Route::delete('/system/files/groups/{key}', 'GlobalFilesController@deleteFileGroup')->name('admin');
                Route::put('/system/files/groups/{key}', 'GlobalFilesController@editFileGroup')->name('admin');
                Route::post('/system/files/{file_group_key}', 'GlobalFilesController@addNewFile')->name('admin');
                Route::delete('/system/files/{file_key}', 'GlobalFilesController@deleteExistingFile')->name('admin');
                Route::post('/system/files/{file_key}/edit', 'GlobalFilesController@editExistingFile')->name('admin');
    			
                Route::get('/system/allRoles', 'UserController@getUserRoles')->name('system.users.roles');
                Route::get('/system/user/role/{role_key}/permissions', 'UserController@getUserRolePermissions')->name('system.users.roles');
                Route::put('/system/user/role/{role_key}/permissions', 'UserController@updateUserRolePermissions')->name('system.users.roles');
                Route::get('/system/modules', 'UserController@getModulesWithRoles')
                        ->name('system.users');
                Route::post('/system/users/{key}/phones', 'UserController@addNewUserPhone')->name('system.users.edit');
                Route::delete('/system/users/{key}/phones/{record_key}', 'UserController@deleteUserPhone')->name('system.users.edit');
                Route::put('/system/users/{key}/phones/{record_key}', 'UserController@updateUserPhone')->name('system.users.edit');
                Route::post('/system/users/{key}/userRoleFilters', 'UserController@addNewUserRoleFilter')->name('system.users.geographic_filter.add');
                Route::delete('/system/users/{key}/userRoleFilters/{record_key}', 'UserController@deleteExistingUserRoleFilter')->name('system.users.geographic_filter.delete');
                Route::put('/system/users/{key}/userRoleFilters/{record_key}', 'UserController@editExistingUserRoleFilter')->name('system.users.geographic_filter.edit');
                Route::post('/system/users/{key}/userRoles', 'UserController@addNewUserRole')->name('system.users.roles.add');
                Route::delete('/system/users/{key}/userRoles/{record_id}', 'UserController@deleteExistingUserRole')->name('system.users.roles.delete');
                Route::put('/system/users/{key}/userRoles/{record_id}', 'UserController@saveExistingUserRole')->name('system.users.roles.edit');
                //Route::get('/system/teams/minimal/{user_key?}', 'TeamController@getMinimalTeamsData')->name('system.teams');
                Route::get('/system/users/{user_key}/teams', 'UserController@getCurrentUserTeams')->name('system.teams, crm.requests.add, crm.requests.edit');
                Route::get('/system/teams', 'TeamController@getTeams')->name('system.teams');
                Route::post('/system/teams', 'TeamController@addNewTeam')->name('system.teams.add');
                Route::get('/system/teams/users', 'UserController@getCurrentUserTeamMates')->name('system.teams,crm.requests.add, crm.requests.edit');
                Route::get('/system/teams/{team_key?}/users', 'UserController@getCurrentUserTeamMates')->name('system.teams, crm.requests.add, crm.requests.edit');
                Route::post('/system/teams/{key}/departments', 'TeamController@addNewTeamDepartment')->name('system.teams.departments.add');
                Route::get('/system/teams/{key}/sectorialFilterTpls/definitionGroupsValues/{tplKey}', 'TeamController@getSectorialTPLDefenitionGroupValues')->name('system.teams.filters.sectorial_filter_templates');
                Route::delete('/system/team/{key}/department/{id}', 'TeamController@deleteTeamDepartment')->name('system.teams.departments.delete');
                Route::delete('/system/teams/{key}/geoTemplates/{id}', 'TeamController@deleteTeamGeoTemplate')->name('system.teams.filters.geographic_filter_templates.delete');
                Route::delete('/system/teams/{key}/sectorialTemplates/{sectorialKey}', 'TeamController@deleteTeamSectorialTemplate')->name('system.teams.filters.sectorial_filter_templates.delete');
                Route::post('/system/teams/{key}/sectorialTemplates', 'TeamController@addNewSectorialTemplate')->name('system.teams.filters.sectorial_filter_templates.add');
                Route::put('/system/teams/{key}/sectorialTemplates/{sectorialKey}', 'TeamController@updateExistingSectorialTemplate')->name('system.teams.filters.sectorial_filter_templates.edit');
                Route::post('/system/teams/{key}/geoTemplates', 'TeamController@addTeamGeoTemplate')->name('system.teams.filters.geographic_filter_templates.add');
                Route::put('/system/teams/{key}/geoTemplates/{geoKey}', 'TeamController@editExistingGeoTemplate')->name('system.teams.filters.geographic_filter_templates.edit');
                Route::put('/system/team/{key}/department/{id}', 'TeamController@editTeamDepartment')->name('system.teams.departments.edit');
                Route::put('/system/teams/{key}', 'TeamController@editExistingTeam')->name('system.teams.edit');
                Route::get('/system/teams/{id?}', 'TeamController@getTeams')->name('system.teams');
                
                Route::get('/system/team/{key}', 'TeamController@getTeamDataByKey')->name('system.teams');
                Route::put('/system/team/request/{key}', 'TeamController@updateTeamRequestField')->name('system.teams');
                
                // Team requests topics:
                Route::get('/system/team/{key}/requests-topics', 'TeamController@getTeamRequestsTopics')->name('system.teams');
                Route::put('/system/teams/{teamKey}/request-topics/{topicKey}', 'TeamController@updateTeamRequestTopic')->name('system.teams.requests');

                Route::get('/system/users/{userKey}/request-topics', 'UserController@getUserRequestsTopics')->name('system.users.requests');
                Route::delete('/system/users/{userKey}/request-topics/{request_topic_user_key}', 'UserController@removeTopicFromUser')->name('system.users.requests');

                Route::delete('/system/users/{key}/roles/{role_id}/sectorialFilters/{filter_id}', 'SectorialFiltersController@deleteExistingSectorialFilter')->name('system.users.sectorial_filter.delete');
                Route::post('/system/users/{key}/roles/{role_id}/sectorialFilters', 'SectorialFiltersController@addNewSectorialFilter')->name('system.users.sectorial_filter.add');
                Route::put('/system/users/{key}/roles/{role_id}/sectorialFilters', 'SectorialFiltersController@addEditDeleteSectorialFilter')->name('system.users.sectorial_filter.edit');
                Route::get('/system/user/sectorialFilters/definitionGroups', 'SectorialFiltersController@getSectorialFilterDefenitionGroups')->name('system.users.sectorial_filter');
                Route::get('/system/user/sectorialFilters/definitionGroupsValues', 'SectorialFiltersController@getSectorialFilterDefenitionGroupValues')->name('system.users.sectorial_filter');
                Route::get('/system/user/sectorialFilters/dependencyList', 'SectorialFiltersController@getSubListByDependencyID')->name('system.users.sectorial_filter');

                /* System Institutes */
                Route::get('/system/institutes', 'InstituteController@getAllInstitutes')
                    ->name('allow');
                Route::get('/system/institutes/groups', 'InstituteController@getInstituteGroups')
                     ->name('allow');
                Route::get('/system/institutes/types', 'InstituteController@getInstituteTypes')
                     ->name('allow');
                Route::get('/system/institutes/networks', 'InstituteController@getInstituteNetworks')
                     ->name('allow');
                Route::get('/system/institutes/search', 'InstituteController@searchInstitutes')
                    ->name('allow');

                /*  System voter groups */
                Route::get('/system/voters/groups', 'ShasVoterGroupsController@getVoterGroups')
                     ->name('allow');
                Route::post('/system/voters/groups', 'ShasVoterGroupsController@addNewGroup')
                     ->name('allow');

                /* LISTS */
                Route::get('/system/lists/countries', 'ListsController@getCountries')
                        ->name('system.lists.general.countries,elections.voter.additional_data.details');
                Route::delete('/system/lists/countries/{key}', 'ListsController@deleteCountry')->name('system.lists.general.countries.delete');
                Route::put('/system/lists/countries/{key}', 'ListsController@updateCountry')->name('system.lists.general.countries.edit');
                Route::post('/system/lists/countries', 'ListsController@addCountry')->name('system.lists.general.countries.add');

                /* ethnic */
                Route::get('/system/lists/ethnic', 'ListsController@getEthnic')
                        ->name('system.lists.elections.ethnic_groups,elections.voter.additional_data.details,elections.import,elections.manual_update');
                Route::delete('/system/lists/ethnic/{key}', 'ListsController@deleteEthnic')->name('system.lists.elections.ethnic_groups.delete');
                Route::put('/system/lists/ethnic/{key}', 'ListsController@updateEthnic')->name('system.lists.elections.ethnic_groups.edit');
                Route::post('/system/lists/ethnic', 'ListsController@addEthnic')->name('system.lists.elections.ethnic_groups.add');

                /* Religious groups */
                Route::get('/system/lists/religious_groups', 'ListsController@getReligiousGroups')
                        ->name('system.lists.elections.religious_groups,elections.voter.additional_data.details,elections.import,elections.manual_update');
                Route::delete('/system/lists/religious_groups/{key}', 'ListsController@deleteReligiousGroup')->name('system.lists.elections.religious_groups.delete');
                Route::put('/system/lists/religious_groups/{key}', 'ListsController@updateReligiousGroup')->name('system.lists.elections.religious_groups.edit');
                Route::post('/system/lists/religious_groups', 'ListsController@addReligiousGroup')->name('system.lists.elections.religious_groups.add');

                /* cities */
                Route::get('/system/lists/cities', 'ListsController@getCities')
                        ->name('system.lists.general.cities,crm.requests.search,system.lists.general.neighborhoods
                            ,elections.voter.additional_data.address,elections.voter.political_party.shas_representative');
                Route::delete('/system/lists/cities/{key}', 'ListsController@deleteCity')->name('system.lists.general.cities.delete');
                Route::put('/system/lists/cities/{key}', 'ListsController@updateCity')->name('system.lists.general.cities.edit');
                Route::post('/system/lists/cities', 'ListsController@addCity')->name('system.lists.general.cities.add');
                Route::get('/system/lists/cities/{key}/neighborhoods', 'ListsController@getCityNeighborhoods')
                        ->name('system.lists.general.neighborhoods');
                Route::get('/system/lists/cities/{key}/streets', 'ListsController@getCityStreets')
                        ->name('system.lists.general.streets');

                /* areas groups */
                Route::get('/system/lists/areas-groups', 'ListsController@getAreasGroups')->name('system.lists.general.areas,system.lists.general.cities');

                /* areas */
                Route::get('/system/lists/areas', 'ListsController@getAreas')->name('system.lists.general.areas,system.lists.general.cities');
                Route::delete('/system/lists/areas/{key}', 'ListsController@deleteArea')->name('system.lists.general.areas.delete');
                Route::put('/system/lists/areas/{key}', 'ListsController@updateArea')->name('system.lists.general.areas.edit');
                Route::post('/system/lists/areas', 'ListsController@addArea')->name('system.lists.general.areas.add');

                /* subAreas */
                Route::get('/system/lists/sub_areas/{key?}', 'ListsController@getSubAreas')->name('system.lists.general.areas.sub_areas,system.lists.general.cities');
                Route::delete('/system/lists/sub_areas/{key}', 'ListsController@deleteSubArea')->name('system.lists.general.areas.sub_areas.delete');
                Route::put('/system/lists/sub_areas/{key}', 'ListsController@updateSubArea')->name('system.lists.general.areas.sub_areas.edit');
                Route::post('/system/lists/sub_areas', 'ListsController@addSubArea')->name('system.lists.general.areas.sub_areas.add');

                /* neighborhoods */
                Route::get('/system/lists/neighborhoods/{key?}', 'ListsController@getNeighborhoods')->name('system.lists.general.neighborhoods');
                Route::delete('/system/lists/neighborhoods/{key}', 'ListsController@deleteNeighborhood')->name('system.lists.general.neighborhoods.delete');
                Route::put('/system/lists/neighborhoods/{key}', 'ListsController@updateNeighborhood')->name('system.lists.general.neighborhoods.edit');
                Route::post('/system/lists/neighborhoods', 'ListsController@addNeighborhood')->name('system.lists.general.neighborhoods.add');
               
                //neighborhoods clusters
            //     Route::get('/system/lists/clusters', 'ListsController@getClusters')->name('system.lists.general.neighborhoods');
                Route::get('/system/lists/cities/{key}/clusters', 'ListsController@getCityClusters')->name('system.lists.general.neighborhoods');
                Route::get('/system/lists/neighborhoods/{key}/clusters', 'ListsController@getNeighborhoodClusters')->name('allow'); //Need to check this permissions!!!
                Route::delete('/system/lists/neighborhoods/{key}/clusters/{clusterKey}', 'ListsController@deleteNeighborhoodCluster')->name('system.lists.general.neighborhoods.delete');
                Route::delete('/system/lists/neighborhoods/{key}/clusters', 'ListsController@deleteNeighborhoodClusterList')->name('system.lists.general.neighborhoods.delete');
                Route::post('/system/lists/neighborhoods/{key}/clusters', 'ListsController@updateNeighborhoodCluster')->name('system.lists.general.neighborhoods.edit');
                Route::put('/system/lists/neighborhoods/{key}/clusters', 'ListsController@updateNeighborhoodClusterList')->name('system.lists.general.neighborhoods.edit');
                Route::put('/system/lists/neighborhoods/{key}/clusters/prefix', 'ListsController@updatePrefixClusterList')->name('system.lists.general.neighborhoods.edit');
                Route::put('/system/lists/neighborhoods/{key}/cluster/{clusterKey}', 'ListsController@updateCluster')->name('system.lists.general.neighborhoods.edit');

                /* phone_type */
                Route::get('/system/lists/phone_type', 'ListsController@getPhoneTypes')
                        ->name('system.lists.general.phone_types,elections.voter.additional_data.contact_details.phone');
                Route::delete('/system/lists/phone_type/{key}', 'ListsController@deletePhoneType')->name('system.lists.general.phone_types.delete');
                Route::put('/system/lists/phone_type/{key}', 'ListsController@updatePhoneType')->name('system.lists.general.phone_types.edit');
                Route::post('/system/lists/phone_type', 'ListsController@addPhoneType')->name('system.lists.general.phone_types.add');

                /* streets */
                Route::get('/system/lists/streets/{key?}', 'ListsController@getStreets')->name('system.lists.general.streets');
                Route::delete('/system/lists/streets/{key}', 'ListsController@deleteStreet')->name('system.lists.general.streets.delete');
                Route::put('/system/lists/streets/{key}', 'ListsController@updateStreet')->name('system.lists.general.streets.edit');
                Route::post('/system/lists/streets', 'ListsController@addStreet')->name('system.lists.general.streets.add');

                /* voter titles */
                Route::get('/system/lists/voter/titles', 'ListsController@getVoterTitles')
                     ->name('system.lists.elections.voter_titles,elections.voter.additional_data.details');
                Route::delete('/system/lists/voter/titles/{key}', 'ListsController@deleteVoterTitle')->name('system.lists.elections.voter_titles.delete');
                Route::put('/system/lists/voter/titles/{key}', 'ListsController@updateVoterTitle')->name('system.lists.elections.voter_titles.edit');
                Route::post('/system/lists/voter/titles', 'ListsController@addVoterTitle')->name('system.lists.elections.voter_titles.add');

                /* voter endings */
                Route::get('/system/lists/voter/endings', 'ListsController@getVoterEndings')
                        ->name('system.lists.elections.voter_endings,elections.voter.additional_data.details');
                Route::delete('/system/lists/voter/endings/{key}', 'ListsController@deleteVoterEnding')->name('system.lists.elections.voter_endings.delete');
                Route::put('/system/lists/voter/endings/{key}', 'ListsController@updateVoterEnding')->name('system.lists.elections.voter_endings.edit');
                Route::post('/system/lists/voter/endings', 'ListsController@addVoterEnding')->name('system.lists.elections.voter_endings.add');

                /* voter suport status */
                Route::get('/system/lists/support/status', 'ListsController@getSupportStatus')->name('system.lists.elections.support_status');
                Route::delete('/system/lists/support/status/{key}', 'ListsController@deleteSupportStatus')->name('system.lists.elections.support_status.delete');
                Route::put('/system/lists/support/status/{key}', 'ListsController@updateSupportStatus')->name('system.lists.elections.support_status.edit');
                Route::post('/system/lists/support/status', 'ListsController@addSupportStatus')->name('system.lists.elections.support_status.add');
                Route::put('/system/lists/support/status', 'ListsController@updateSupportStatusOrder')->name('system.lists.elections.support_status.edit');

                /* request topics */
                Route::get('/system/lists/requests/topics/all', 'ListsController@getAllTopics')->name('crm.requests.search');
                Route::get('/system/lists/requests/topics/{key?}', 'ListsController@getTopics')->name('system.lists.requests.topics');
                Route::delete('/system/lists/requests/topics/{key}', 'ListsController@deleteTopic')->name('system.lists.requests.topics.delete');
                Route::put('/system/lists/requests/topics/{key}', 'ListsController@updateTopic')->name('system.lists.requests.topics.edit');
                Route::post('/system/lists/requests/topics', 'ListsController@addTopic')->name('system.lists.requests.topics.add');
                Route::put('/system/lists/requests/topics', 'ListsController@updateTopicsOrder')->name('system.lists.requests.topics.edit');

                /* voter action types */
                Route::get('/system/lists/voter/action/types', 'ListsController@getActionTypes')->name('system.lists.elections.action_types');
                Route::delete('/system/lists/voter/action/types/{key}', 'ListsController@deleteActionType')->name('system.lists.elections.action_types.delete');
                Route::put('/system/lists/voter/action/types/{key}', 'ListsController@updateActionType')->name('system.lists.elections.action_types.edit');
                Route::post('/system/lists/voter/action/types', 'ListsController@addActionType')->name('system.lists.elections.action_types.add');

                /* voter action topics */
                Route::get('/system/lists/voter/action/topics/{key?}', 'ListsController@getActionTopics')->name('system.lists.elections.action_topics');
                Route::delete('/system/lists/voter/action/topics/{key}', 'ListsController@deleteActionTopic')->name('system.lists.elections.action_topics.delete');
                Route::put('/system/lists/voter/action/topics/{key}', 'ListsController@updateActionTopic')->name('system.lists.elections.action_topics.edit');
                Route::post('/system/lists/voter/action/topics', 'ListsController@addActionTopic')->name('system.lists.elections.action_topics.add');

                /* request action types */
                Route::get('/system/lists/request/action/types', 'ListsController@getActionTypes')->name('system.lists.requests.action_types');
                Route::delete('/system/lists/request/action/types/{key}', 'ListsController@deleteActionType')->name('system.lists.requests.action_types.delete');
                Route::put('/system/lists/request/action/types/{key}', 'ListsController@updateActionType')->name('system.lists.requests.action_types.edit');
                Route::post('/system/lists/request/action/types', 'ListsController@addActionType')->name('system.lists.requests.action_types.add');

                /* request action topics */
                Route::get('/system/lists/request/action/topics/{key?}', 'ListsController@getActionTopics')->name('system.lists.requests.action_topics');
                Route::delete('/system/lists/request/action/topics/{key}', 'ListsController@deleteActionTopic')->name('system.lists.requests.action_topics.delete');
                Route::put('/system/lists/request/action/topics/{key}', 'ListsController@updateActionTopic')->name('system.lists.requests.action_topics.edit');
                Route::post('/system/lists/request/action/topics', 'ListsController@addActionTopic')->name('system.lists.requests.action_topics.add');

                /* voter meta keys */
                Route::get('/system/lists/voter/meta/keys/{key?}', 'ListsController@getVoterMetaKeys')->name('system.lists.elections.metas');
                Route::delete('/system/lists/voter/meta/keys/{key}', 'ListsController@deleteVoterMetaKey')->name('system.lists.elections.metas.delete');
                Route::put('/system/lists/voter/meta/keys/{key}', 'ListsController@updateVoterMetaKey')->name('system.lists.elections.metas.edit');
                Route::post('/system/lists/voter/meta/keys', 'ListsController@addVoterMetaKey')->name('system.lists.elections.metas.add');

                /* voter meta values */
                Route::get('/system/lists/voter/meta/values/{key?}', 'ListsController@getVoterMetaValues')->name('system.lists.elections.metas');
                Route::delete('/system/lists/voter/meta/values/{key}', 'ListsController@deleteVoterMetaValue')->name('system.lists.elections.metas.delete');
                Route::put('/system/lists/voter/meta/values/{key}', 'ListsController@updateVoterMetaValue')->name('system.lists.elections.metas.edit');
                Route::post('/system/lists/voter/meta/values', 'ListsController@addVoterMetaValue')->name('system.lists.elections.metas.add');

                /* voter election roles */
                Route::get('/system/lists/voter/elections/roles/{key?}', 'ListsController@getVoterElectionRoles')->name('system.lists.elections.roles');
                /*
                Route::delete('/system/lists/voter/elections/roles/{key}', 'ListsController@deleteVoterElectionRole')->name('system.lists.elections.roles.delete');
                Route::put('/system/lists/voter/elections/roles/{key}', 'ListsController@updateVoterElectionRole')->name('system.lists.elections.roles.edit');
                Route::post('/system/lists/voter/elections/roles', 'ListsController@addVoterElectionRole')->name('system.lists.elections.roles.add');
                */

                /* user_roles */
                Route::get('/system/lists/user_roles', 'ListsController@getUserRoles')->name('system.lists.system.user_roles');
                Route::delete('/system/lists/user_roles/{key}', 'ListsController@deleteUserRole')->name('system.lists.system.user_roles.delete');
                Route::put('/system/lists/user_roles/{key}', 'ListsController@updateUserRole')->name('system.lists.system.user_roles.edit');
                Route::post('/system/lists/user_roles', 'ListsController@addUserRole')->name('system.lists.system.user_roles.add');

                /* modules */
                Route::get('/system/lists/modules', 'ListsController@getModules')->name('allow');

                /* permission_groups */
                Route::get('/system/lists/permission_groups', 'ListsController@getPermissionGroups')->name('system.lists.system.user_roles');

                /* teams */
                Route::get('/system/lists/teams', 'ListsController@getTeams')->name('system.lists.system.teams');
                Route::delete('/system/lists/teams/{key}', 'ListsController@deleteTeam')->name('system.lists.system.teams.delete');
                /* teams */
                // TODO - permissions!!!
                Route::get('/system/lists/sms_providers', 'ListsController@getSmsProviders')->name('system.lists.system.sms_providers');
                Route::put('/system/lists/sms_providers/{key}', 'ListsController@updateSmsProvider')->name('system.lists.system.sms_providers.edit');

                /* request status */
                Route::get('/system/lists/request/status', 'ListsController@getRequestStatus')->name('system.lists.requests.status,crm.requests.search');
                Route::delete('/system/lists/request/status/{key}', 'ListsController@deleteRequestStatus')->name('system.lists.requests.status.delete');
                Route::put('/system/lists/request/status/{key}', 'ListsController@updateRequestStatus')->name('system.lists.requests.status.edit');
                Route::post('/system/lists/request/status', 'ListsController@addRequestStatus')->name('system.lists.requests.status.add');
                Route::put('/system/lists/request/status', 'ListsController@updateRequestStatusOrder')->name('system.lists.requests.status.edit');

                Route::get('/system/lists/request/status/types', 'ListsController@getRequestStatusTypes')->name('system.lists.requests.status,crm.requests.search');

                /* request_source FOR NOW: THERE IS NO NEED TO EDIT THE LIST, ONLY DISPLAY*/
                Route::get('/system/lists/request_source', 'ListsController@getRequestSource')->name('system.lists.requests.request_source');
    //            Route::delete('/system/lists/request_source/{key}', 'ListsController@deleteRequestSource')->name('system.lists.requests.request_source.delete');
    //            Route::put('/system/lists/request_source/{key}', 'ListsController@updateRequestSource')->name('system.lists.requests.request_source.edit');
    //            Route::post('/system/lists/request_source', 'ListsController@addRequestSource')->name('system.lists.requests.request_source.add');

                /* closure_reason*/
                Route::get('/system/lists/request/closure_reason', 'ListsController@getRequestClosureReason')->name('system.lists.requests.closure_reason');
               Route::delete('/system/lists/request/closure_reason/{key}', 'ListsController@deleteRequestClosureReason')->name('system.lists.requests.closure_reason.delete');
               Route::put('/system/lists/request/closure_reason/{key}', 'ListsController@updateRequestClosureReason')->name('system.lists.requests.closure_reason.edit');
               Route::post('/system/lists/request/closure_reason', 'ListsController@addRequestClosureReason')->name('system.lists.requests.closure_reason.add');

                /* voter shas representative roles */
                Route::get('/system/lists/elections/representative/roles', 'ListsController@getShasRepresentativeRoles')->name('system.lists.elections.shas_representative_role');
                Route::delete('/system/lists/elections/representative/roles/{key}', 'ListsController@deleteShasRepresentativeRole')->name('system.lists.elections.shas_representative_role.delete');
                Route::put('/system/lists/elections/representative/roles/{key}', 'ListsController@updateShasRepresentativeRole')->name('system.lists.elections.shas_representative_role.edit');
                Route::post('/system/lists/elections/representative/roles', 'ListsController@addShasRepresentativeRole')->name('system.lists.elections.shas_representative_role.add');
                
                /* voter religious Council roles */
                Route::get('/system/lists/elections/religious-council/roles', 'ListsController@getReligiousCouncilRoles')->name('system.lists.elections.religious_council_roles'); 
                Route::delete('/system/lists/elections/religious-council/roles/{key}', 'ListsController@deleteReligiousCouncilRole')->name('system.lists.elections.religious_council_roles.delete');
                Route::put('/system/lists/elections/religious-council/roles/{key}', 'ListsController@updateReligiousCouncilRole')->name('system.lists.elections.religious_council_roles.edit');
                Route::post('/system/lists/elections/religious-council/roles', 'ListsController@addReligiousCouncilRole')->name('system.lists.elections.religious_council_roles.add');
                /* voter religious Council roles */
                Route::get('/system/lists/elections/city-shas/roles', 'ListsController@getCityShasRoles')->name('system.lists.elections.city_shas_roles');
                Route::delete('/system/lists/elections/city-shas/roles/{key}', 'ListsController@deleteCityShasRole')->name('system.lists.elections.city_shas_roles.delete');
                Route::put('/system/lists/elections/city-shas/roles/{key}', 'ListsController@updateCityShasRole')->name('system.lists.elections.city_shas_roles.edit');
                Route::post('/system/lists/elections/city-shas/roles', 'ListsController@addCityShasRole')->name('system.lists.elections.city_shas_roles.add');

                /* institutes */
                Route::get('/system/lists/institutes/', 'ListsController@getInstitutes')->name('system.lists.elections.institute');
                Route::delete('/system/lists/institutes/{key}', 'ListsController@deleteInstitute')->name('system.lists.elections.institute.delete');
                Route::put('/system/lists/institutes/{key}', 'ListsController@updateInstitute')->name('system.lists.elections.institute.edit');
                Route::post('/system/lists/institutes', 'ListsController@addInstitute')->name('system.lists.elections.institute.add');

                /* institute groups */
                Route::get('/system/lists/institute/groups/', 'ListsController@getInstituteGroups')->name('system.lists.elections.institute.groups');
                Route::delete('/system/lists/institute/groups/{key}', 'ListsController@deleteInstituteGroup')->name('system.lists.elections.institute.groups.delete');
                Route::put('/system/lists/institute/groups/{key}', 'ListsController@updateInstituteGroup')->name('system.lists.elections.institute.groups.edit');
                Route::post('/system/lists/institute/groups', 'ListsController@addInstituteGroup')->name('system.lists.elections.institute.groups.add');

                /* institute types */
                Route::get('/system/lists/institute/groups/{key}/types', 'ListsController@getInstituteTypes')->name('system.lists.elections.institute.types');
                Route::get('/system/lists/institute/types', 'ListsController@getInstituteTypes')->name('system.lists.elections.institute.types');
                Route::delete('/system/lists/institute/types/{key}', 'ListsController@deleteInstituteType')->name('system.lists.elections.institute.types.delete');
                Route::put('/system/lists/institute/types/{key}', 'ListsController@updateInstituteType')->name('system.lists.elections.institute.types.edit');
                Route::post('/system/lists/institute/types', 'ListsController@addInstituteType')->name('system.lists.elections.institute.types.add');

                /* institute networks */
                Route::get('/system/lists/institute/networks/', 'ListsController@getInstituteNetworks')->name('system.lists.elections.institute.networks');
                Route::delete('/system/lists/institute/networks/{key}', 'ListsController@deleteInstituteNetwork')->name('system.lists.elections.institute.networks.delete');
                Route::put('/system/lists/institute/networks/{key}', 'ListsController@updateInstituteNetwork')->name('system.lists.elections.institute.networks.edit');
                Route::post('/system/lists/institute/networks', 'ListsController@addInstituteNetwork')->name('system.lists.elections.institute.networks.add');

                /* institute roles */
                Route::get('/system/lists/institute/types/{key}/roles', 'ListsController@getInstituteRoles')->name('system.lists.elections.institute.roles');
                Route::get('/system/lists/institute/roles', 'ListsController@getInstituteRoles')->name('system.lists.elections.institute.roles');
                Route::delete('/system/lists/institute/roles/{key}', 'ListsController@deleteInstituteRole')->name('system.lists.elections.institute.roles.delete');
                Route::put('/system/lists/institute/roles/{key}', 'ListsController@updateInstituteRole')->name('system.lists.elections.institute.roles.edit');
                Route::post('/system/lists/institute/roles', 'ListsController@addInstituteRole')->name('system.lists.elections.institute.roles.add');

                /* institute groups */
                Route::get('/system/lists/elections/voter/groups', 'ListsController@getVoterGroups')->name('system.lists.elections.voter_groups,elections.import');
                Route::delete('/system/lists/elections/voter/groups/{key}', 'ListsController@deleteVoterGroup')->name('system.lists.elections.voter_groups.delete');
                Route::put('/system/lists/elections/voter/groups/{key}', 'ListsController@updateVoterGroup')->name('system.lists.elections.voter_groups.edit');
                Route::post('/system/lists/elections/voter/groups', 'ListsController@addVoterGroup')->name('system.lists.elections.voter_groups.add');
                Route::put('/system/lists/elections/voter/groups', 'ListsController@updateVoterGroupOrder')->name('system.lists.elections.voter_groups.edit');

                /* party list */
                Route::get('/system/lists/elections/party_lists', 'ListsController@getPartyLists')->name('system.lists.elections.party_lists');
                Route::delete('/system/lists/elections/party_lists/{key}', 'ListsController@deletePartyList')->name('system.lists.elections.party_lists.delete');
                Route::put('/system/lists/elections/party_lists/{key}', 'ListsController@updatePartyList')->name('system.lists.elections.party_lists.edit');
                Route::post('/system/lists/elections/party_lists', 'ListsController@addPartyList')->name('system.lists.elections.party_lists.add');

                /* phone_type */
                Route::get('/system/lists/languages', 'ListsController@getLanguages')->name('system.lists.general.languages');
                Route::delete('/system/lists/languages/{key}', 'ListsController@deleteLanguage')->name('system.lists.general.languages.delete');
                Route::put('/system/lists/languages/{key}', 'ListsController@updateLanguage')->name('system.lists.general.languages.edit');
                Route::post('/system/lists/languages', 'ListsController@addLanguage')->name('system.lists.general.languages.add');

                /* city_departments */
                Route::get('/system/lists/city_department', 'ListsController@getCityDepartment')->name('system.lists.general.city_departments');
                Route::delete('/system/lists/city_department/{key}', 'ListsController@deleteCityDepartment')->name('system.lists.general.city_departments.delete');
                Route::put('/system/lists/city_department/{key}', 'ListsController@updateCityDepartment')->name('system.lists.general.city_departments.edit');
                Route::post('/system/lists/city_department', 'ListsController@addCityDepartment')->name('system.lists.general.city_departments.add');

                /* csv sources */
                Route::get('/system/lists/elections/csv_source', 'ListsController@getCsvSource')->name('system.lists.elections.csv_sources');
                Route::delete('/system/lists/elections/csv_source/{key}', 'ListsController@deleteCsvSource')->name('system.lists.elections.csv_sources.delete');
                Route::put('/system/lists/elections/csv_source/{key}', 'ListsController@updateCsvSource')->name('system.lists.elections.csv_sources.edit');
                Route::post('/system/lists/elections/csv_source', 'ListsController@addCsvSource')->name('system.lists.elections.csv_sources.add');

                /* Manage Activists allocation */
                Route::post('/system/activists/allocations/file', 'VoterActivistController@uploadActivistsAllocationsFile')->name('system.lists.elections.csv_sources.add');

                /* * * Reports ** */
                //Household search
                Route::get('/elections/households/', 'HouseholdController@search')->name('allow');
                Route::post('/elections/households/', 'HouseholdController@updateSupportStatus')->name('allow');

                //Ballots results summary
                Route::get('/elections/ballots_results_summary', 'BallotBoxController@ballotsResultsSummary')->name('allow');

                //Ballots search - Not in use!!!
                Route::get('/elections/ballot_box', 'BallotBoxController@ballotBox')->name('allow');

                //Ballots Activists - Not in use!!!
                Route::get('/elections/ballot_box/{key}', 'BallotBoxController@getBallotBox')->name('allow');
                //Route::post('/elections/ballot_box/{key}/activists', 'BallotBoxController@addActivisitToBallotBox')->name('allow');
                //Route::put('/elections/ballot_box/{ballot_box_key}/activists/{activist_key}', 'BallotBoxController@updateActivisitInBallotBox')->name('allow');
                //Route::delete('/elections/ballot_box/{ballot_box_key}/activists/{activist_key}', 'BallotBoxController@removeActivistFromBallotBox')->name('allow');
                //Ballot box roles
                //
                //Route::put('/elections/ballot_box/{key}', 'BallotBoxController@updateElectionRoleInBallotBox')->name('allow');

                //Captains of fifty
                Route::get('/elections/captains_of_fifty', 'CaptainOfFiftyController@captainsOfFifty')->name('allow');

                /* Infinite Scroll Example */
                Route::get('/testGetVoters', "VoterController@testGetVoters");

                Route::get('/system/settings', 'SettingsController@getSystemSettings')->name('allow');
                Route::get('/elections/management/{city_key}/clusters/summary', 'ElectionsManagementController@getCityClustersSummary');
                Route::get('/elections/management/{city_key}/clusters/details', 'ElectionsManagementController@getCityClustersDetails');
                // Route::get('/banks-branches-israel', 'Transfer\TransferController@defineBankBranches')->name('allow');
                // Route::get('/update-ballot-roles', 'Transfer\TransferController@updateBallotsRoles')->name('allow');
                // Route::get('/update-regional-election-committees', 'Transfer\TransferController@updateRegionalElectionCommitteesByCities')->name('allow');
                // Route::get('/update-captain50-actions-from-history', 'Transfer\TransferController@updateCaptain50ActionsFromHistory')->name('allow');
                // Route::get('/update-cities-of-voters', 'Transfer\TransferController@updateCitiesForVoters')->name('allow');
                // Route::get('/transfer-bank-details-to-voters', 'Transfer\TransferController@transferBankDetailsToVoters')->name('allow');
                // Route::get('/prepare-csv-File', 'VoterController@prepareSupportersPhonesCsvFile')->name('allow');
                Route::get('/set-permissions-by-user-roles', 'Transfer\TransferController@setPermissionsByUserRoles')->name('allow');
                Route::get('/update-activists-last-phone-number', 'Transfer\TransferController@updateActivistPhoneNumbers')->name('allow');
                Route::get('/update-login-server-election-roles', 'Transfer\TransferController@updateLoginServerElectionsRoles')->name('allow');
                Route::get('/update-login-server-activists-election-roles', 'Transfer\TransferController@updateAllActivistsUsersElectionsRoles')->name('allow');
                Route::get('/muni-entity-summary', 'Transfer\TransferController@getMunicipalEntitySummary')->name('allow');
                Route::get('/add-allocation-from-file', 'Transfer\TransferController@uploadActivistsAllocationsFile')->name('allow');
                Route::get('/load-ballots-file', 'Transfer\TransferController@loadBallotsFile')->name('allow');
                // Route::get('/get-db-name', 'Transfer\TransferController@getDatabaseName')->name('allow');
                Route::get('/ballots-iron-numbers', 'Transfer\TransferController@defineBallotsIronNumbers')->name('allow');
                Route::get('/start-households/{id}', 'Transfer\TransferController@startHouseholdJob')->name('allow');
                Route::get('/update-support-statuses', 'Transfer\TransferController@updateVoterSupportStatusesFromFile')->name('allow');
                Route::get('/update-protocol-files', 'Transfer\TransferController@updateProtocolsFilesNames')->name('allow');
    
            });
        });
    });
});

    
//Base route for system
Route::group(['middleware' => 'auth.guest'], function () {

    Route::get("/js/index.js", "Auth\LoginController@getUi")->name('allow');
    Route::get("/js/index.js.map", "Auth\LoginController@getUi")->name('allow');
    Route::get("/js/cti.js", "Auth\LoginController@getUi")->name('allow');
    Route::get("/js/cti.js.map", "Auth\LoginController@getUi")->name('allow');


    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {

        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {

            //Middleware for checking permission on API calls
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/elections/voters/documents/{document_key}', 'DocumentController@downloadDocument')
                     ->name('elections.voter.documents.download');

                Route::get('/elections/voters/documents/{document_key}/download', 'DocumentController@downloadDocument')
                     ->name('elections.voter.documents.download');

                Route::get('/crm/requests/documents/{document_key}', 'DocumentController@downloadDocument')
                     ->name('crm.requests.documents.download');

                Route::get('/crm/requests/documents/{document_key}/download', 'DocumentController@downloadDocument')
                     ->name('crm.requests.documents.download');
                Route::get('/elections/activists/documents/{document_key}', 'DocumentController@downloadDocument')
                     ->name('elections.activists.captain_of_fifty,elections.activists.cluster_leader,elections.activists.motivator,
                     elections.activists.driver,elections.activists.ballot_member,elections.activists.observer');
                Route::get('/elections/reports/status-change/export', 'VoterSupportStatusController@exportStatusChangeReport')
                    ->name('elections.reports.support_status_changes');

                Route::get('/elections/reports/ballots-summary/export', 'BallotBoxController@exportBallotsPollingSummaryData')
                    ->name('elections.reports.ballots_summary');
                Route::get('/elections/reports/captain50-activity/export', 'CaptainOfFiftyController@exportCaptain50ActivityReport')
                    ->name('elections.reports.captain_of_fifty_activity');
                Route::get('/elections/reports/captain50-activity-summary/export', 'CaptainOfFiftyController@exportCaptain50ActivityReportSummary')
                    ->name('elections.reports.captain_of_fifty_activity');
                Route::get('/elections/reports/captain50-by-ballots/export', 'CaptainOfFiftyController@exportCaptain50ByBallots')
                    ->name('elections.reports.captain_of_fifty_activity');
                /** Cluster Activist report **/
                Route::get('/elections/reports/cluster-activist/export', 'ClusterController@exportClusterActivistReport')
                     ->name('elections.reports.cluster_activists.export, elections.reports.cluster_activists.print');
            });
        });




    });

    Route::get('/{all?}', 'HomeController@index')->where('all', '.*')->name('home');

});
