<?php
 use Illuminate\Support\Facades\Route;
//Base route for system
Route::group(['middleware' => 'auth.guest'], function () {
    Route::get('/quarters-dashboards/{all?}', 'QuartersDashboardController@index')->where('all', '.*')->name('dashboards.quarters');
});

Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/quarters-dashboards-excel-captain/{type}/{id?}', "QuartersDashboardController@downLoadExcelActivistCaptainDetails")->name('allow');
                Route::get('/quarters-dashboards/{type}/{id?}/{filter?}', "QuartersDashboardController@getPresentsDayByType")->name('allow');
                Route::get('/quarters-dashboards-main/{type}/{id?}/{filter?}', "QuartersDashboardController@getPresentVoterStatusSupportByGeo")->name('allow');
                Route::get('/quarters-present', "QuartersDashboardController@getPresentsDay")->name('allow');
                Route::get('/quarters-dashboard-votes/{type}/{values?}', "QuartersDashboardController@getDetailsReportVoteByGeo")->name('allow');
                Route::get('/quarters-mandates-dashboard/information', "QuartersDashboardController@getGlobalSummeryVotesInformation")->name('allow');
                Route::get('/quarters-excel-votes/{type}/{values?}', "QuartersDashboardController@downLoadExcelReportVotes")->name('allow');
                

                
               
                Route::get('/quarters-ballot-box-details/{ballot}', "QuartersDashboardController@getDetailsEndVotesByBallotBox")->name('dashboards.mandates.report');//'ballot_box_report_votes'
                Route::post('/quarters-ballot-box-party-votes', "QuartersDashboardController@setCountVotesForPartyByBallotBox")->name('dashboards.mandates.report');
                Route::post('/quarters-ballot-box-summery-votes', "QuartersDashboardController@setValidVotesAndNotValidVotesForballotBox")->name('dashboards.mandates.report');
                
            });
        });
    });
});
