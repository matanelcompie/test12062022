<?php



Route::group(['prefix' => 'api'], function () {
Route::group(['middleware' => 'apiOutput'], function () {

    //Middleware for checking maintenance mode on API calls
    Route::group(['middleware' => 'CheckMaintenance'], function () {

        /* Routing login screen */
        Route::post('/votes/reporting/login', 'votes\VoteReportingController@login')->name('allow');
        Route::post('/votes/reporting/logout', 'votes\VoteReportingController@logout')->name('allow');
        
        Route::group(['middleware' => 'AuthMobileVoter'], function () {
                Route::get('/votes/reporting/search', 'votes\VoteReportingController@searchVoter')->name('allow');
                Route::get('/votes/reporting/history', 'votes\VoteReportingController@getVotingReportHistory')->name('allow');
                Route::put('/votes/reporting/voting/{voter_key}', 'votes\VoteReportingController@addVoteToVoter')->name('allow');
                Route::delete('/votes/reporting/voting/{voter_key}', 'votes\VoteReportingController@cancelVoteToVoter')->name('allow');
        });
    });
});
});

//Middleware for returning predefined JSON result
Route::get('/votes/reporting/{vote_reporting_key}', 'votes\VoteReportingController@index')->name('allow');

//tinyURL for vote reporting
Route::get('/{voter_key}', 'votes\VoteReportingController@tinyUrl')->where('voter_key', '\d{10}');


