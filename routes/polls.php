<?php
 use Illuminate\Support\Facades\Route;

//Base route for system
Route::group(['middleware' => 'auth.guest'], function () {
    Route::get('/polls/{all?}', 'polls\PollsController@index')->where('all', '.*')->name('polls');
});

Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            Route::group(['middleware' => 'apiPermissions'], function () {
                
                //* Polls
                Route::get('/polls', 'polls\PollsController@searchPolls')->name('polls');
                Route::get('/polls/summary', 'polls\PollsController@getAllPollsSummary')->name('polls');
                Route::get('/polls/{key}', 'polls\PollsController@getPoll')->name('polls');
                Route::post('/polls', 'polls\PollsController@addPoll')->name('polls');
                Route::put('/polls/{key}', 'polls\PollsController@updatePoll')->name('polls');

                //* Polls actions
                Route::put('/polls/active/{key}', 'polls\PollsController@activatePoll')->name('polls'); 
                Route::put('/polls/stop/{key}', 'polls\PollsController@stopPoll')->name('polls'); 
                Route::put('/polls/archive/{key}', 'polls\PollsController@archivePoll')->name('polls'); 
                Route::put('/polls/delete/{key}', 'polls\PollsController@deletePoll')->name('polls'); 

                // * Polls campaigns phones
                Route::get('/polls/campaigns/phones', 'polls\PollsController@getPollsCampaignsPhone')->name('polls');

                // * Polls results
                Route::get('/polls/{key}/portions/results', 'polls\PollsController@getPollResultsSummary')->name('polls');

                // Poll General data:
                Route::get('/polls/{key}/general/summary', 'polls\PollsController@getPollCallsSummaryData')->name('polls'); 
                Route::get('/polls/{key}/general/voters-calls', 'polls\PollsController@getPollVotersCallsData')->name('polls'); 

                // * Polls permissions
                Route::get('/polls/permissions/user', 'polls\PollsController@getPollsPermissionsUser')->name('polls');

                //* Poll calls
                Route::post('/polls/{pollKey}/questions', 'polls\PollQuestionsController@addQuestion')->name('polls'); 
                Route::put('/polls/{pollKey}/questions/{id}', 'polls\PollQuestionsController@updateQuestion')->name('polls'); 
                Route::delete('/polls/{pollKey}/questions/{id}', 'polls\PollQuestionsController@deleteQuestion')->name('polls'); 

                // Polls sms:
                Route::get('/polls/sms/incoming', 'polls\PollsSmsController@incomingSms')->name('polls'); 
                
            });
        });
    });
});
