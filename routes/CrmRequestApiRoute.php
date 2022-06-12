<?php

/*
|--------------------------------------------------------------------------
| Elections Routes
|--------------------------------------------------------------------------
|
| This file is where we define all of the routes that are handled
| by the application for election.
|
 */

/* Route all ajax calls */
//api prefix

use Illuminate\Support\Facades\Route;


Route::group(['prefix' => 'api'], function () {
  //Middleware for returning predefined JSON result
  Route::group(['middleware' => 'apiOutput'], function () {
    //Middleware for checking maintenance mode on API calls
    Route::group(['middleware' => 'CheckMaintenance'], function () {

      Route::post('/request/login', 'Auth\LoginController@loginUserRequestApp');
      Route::post('/request/login/code', 'Auth\LoginController@checkUserRequestApp');

      //Middleware for checking permission on API calls
      Route::group(['middleware' => 'apiActivistsPermissions'], function () {
        Route::get('/request/voter/{personal_identity}', 'CrmRequestController@getVoterDetailsOrm')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/user/sort', 'CrmRequestController@getRequestUserSortType')->name('crm.requests.add, crm.requests.edit');
        Route::post('/request/user/requests', 'CrmRequestController@addCrmRequestFromApplication')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/user/filter', 'CrmRequestController@getRequestUserFilterType')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/user/summary', 'CrmRequestController@getSummaryRequestByPriority')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/user/requests', 'CrmRequestController@getRequestListByUser')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/user/requests/{request_key}', 'CrmRequestController@getRequestDetailsOrmByKey')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/topics', 'CrmRequestController@getAllRequestTopics')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/topic/{topic_id}/team-handler/{city_id?}', 'CrmRequestController@getSubTopicDefaultTeamAndUserHandler')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/team/{team_id}/users', 'CrmRequestController@getUsersHandlerRequestByTeamId')->name('crm.requests.add, crm.requests.edit');
        Route::post('/request/{request_key}/file', 'CrmRequestController@addCrmRequestFiles')->name('crm.requests.add, crm.requests.edit');
        Route::delete('/request/{request_key}/file/{document_key}', 'CrmRequestController@deleteRequestFile')->name('crm.requests.add, crm.requests.edit');
        Route::get('/request/{request_key}/file/{document_key}', 'CrmRequestController@downloadRequestFile')->name('crm.requests.add, crm.requests.edit');
      });
    });
  });
});
