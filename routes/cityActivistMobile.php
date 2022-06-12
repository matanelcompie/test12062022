<?php

/*
|--------------------------------------------------------------------------
| City elections Activists routes:
|--------------------------------------------------------------------------
|
| This file is where we define all of the routes that are handled
| by the external city elections activists application.
| -> It has a different authentication system and routes prefix  
|
 */

/* Route all ajax calls */
//api prefix

use Illuminate\Support\Facades\Route;


Route::group(['prefix' => 'api'], function () {

        Route::group(['prefix' => 'mobile-app'], function () {

        //Middleware for returning predefined JSON result
        Route::group(['middleware' => 'apiOutput'], function () {

            //Middleware for checking maintenance mode on API calls
            Route::group(['middleware' => 'CheckMaintenance'], function () {

                //Middleware for checking permission on API calls
                Route::group(['middleware' => 'apiActivistsPermissions'], function () {
                    Route::get('/system/status', 'SettingsController@getSystemStatus')->name('allow');

                    Route::get('/system/errors', 'SettingsController@getErrorList')->name('allow');

                    Route::get('/system/users/current', 'UserController@getCurrentActivistUser')->name('allow');

                    Route::get('/elections/roles/shifts', 'ListsController@getAllElectionRoleShifts')->name('city-mobile-activists');

                    //list activist mobile
                    Route::get('/system/lists/cities', 'ListsController@getCities')->name('city-mobile-activists');
                    Route::get('/system/lists/ethnic', 'ListsController@getEthnic')->name('city-mobile-activists');
                    Route::get('/system/lists/cities/{key}/streets', 'ListsController@getCityStreets')->name('city-mobile-activists');
                    Route::get('/system/lists/religious_groups', 'ListsController@getReligiousGroups')->name('city-mobile-activists');
                    //voter Details
                    Route::get('/voters/{key?}','cityActivistMobile\cityActivistMobileController@getVoterDetailsByVoterKeyCaptain50')->name('city-mobile-activists');
                    Route::put('/voters','cityActivistMobile\cityActivistMobileController@setVoterDetails')->name('city-mobile-activists');
                    Route::post('/captain50/voter/update','cityActivistMobile\cityActivistMobileController@setVoterDetailsByCaptionFifty')->name('city-mobile-activists');
                    // Route::post('/voters','cityActivistMobile\cityActivistMobileController@setVoterDetails')->name('city-mobile-activists');
                    Route::post('/voter/search','cityActivistMobile\cityActivistMobileController@searchVoterByDetails')->name('city-mobile-activists');
                    //captain50
                    Route::post('/captain50/voters','cityActivistMobile\cityActivistMobileController@getAllVoterByUserCaptain')->name('city-mobile-activists');
                    Route::post('/captain50/voters/supports','cityActivistMobile\cityActivistMobileController@getAllFinalVoterSupportByUserCaptain')->name('city-mobile-activists');
                    Route::get('/captain50/voters','cityActivistMobile\cityActivistMobileController@getAllVoterByUserCaptain')->name('city-mobile-activists');
                    Route::get('/captain50/day-elections-dashboard','cityActivistMobile\cityActivistMobileController@getToDayDashboardCaptain50')->name('city-mobile-activists');
                    Route::get('/captain50/elections-dashboard','cityActivistMobile\cityActivistMobileController@getDashboardCaptain50')->name('city-mobile-activists');
                    Route::post('/captain50/voter/add','cityActivistMobile\cityActivistMobileController@addVoterWithCaptainFiftyByCaptain')->name('city-mobile-activists');
                    Route::post('/captain50/voter/election-update','cityActivistMobile\activistMobileElectionDayController@ElectionDay_updateVoterByCaptain')->name('city-mobile-activists');
                    
                    //cluster
                    Route::post('/cluster/voters','cityActivistMobile\cityActivistMobileController@getAllVoterByUserCluster')->name('city-mobile-activists');
                    Route::post('/cluster/voters/supports','cityActivistMobile\cityActivistMobileController@getAllFinalVoterSupportByUserCluster')->name('city-mobile-activists');
                    Route::post('/cluster/voter/add','cityActivistMobile\cityActivistMobileController@addVoterWithCaptainFiftyByCluster')->name('city-mobile-activists');
                    Route::post('/cluster/voter/update','cityActivistMobile\cityActivistMobileController@setVoterDetailsByCluster')->name('city-mobile-activists');
                    Route::get('/cluster/day-elections-dashboard','cityActivistMobile\cityActivistMobileController@getToDayDashboardCluster')->name('city-mobile-activists');
                    Route::get('/cluster/elections-dashboard','cityActivistMobile\cityActivistMobileController@getDashboardCluster')->name('city-mobile-activists');
                    Route::get('/cluster/roles','cityActivistMobile\cityActivistMobileController@getListActivistOfClusterByUserCluster')->name('city-mobile-activists');
                    Route::get('/cluster/captain50','cityActivistMobile\cityActivistMobileController@getListCaptainByUserCluster')->name('city-mobile-activists');
                    Route::get('/cluster/ballot','cityActivistMobile\cityActivistMobileController@detailsBallotBoxCluster')->name('city-mobile-activists');
                    Route::get('/cluster/list-clusters','cityActivistMobile\cityActivistMobileController@getListClusters')->name('city-mobile-activists');
                    Route::post('/cluster/voter/search','cityActivistMobile\cityActivistMobileController@searchVoterByClusterUser')->name('city-mobile-activists');

                    //cluster day election campaign
                    Route::post('/cluster/voter/vote','cityActivistMobile\activistMobileElectionDayController@ClusterVotedVoteByVoterKey')->name('city-mobile-activists');
                    Route::post('/cluster/voter/transport','cityActivistMobile\cityActivistMobileController@markNeedTransportation')->name('city-mobile-activists');
                    Route::get('/cluster/activity-ballot-member','cityActivistMobile\activistMobileElectionDayController@getBallotDetailsOfBallotMemberByClusterLeader')->name('city-mobile-activists');
                  
                    //-------------ballot leader----------
                   Route::post('/ballot-leader/voter/vote','cityActivistMobile\activistMobileElectionDayController@BallotMemberVotedVoteByVoterKey')->name('city-mobile-activists');
                   Route::post('/ballot-leader/voter','cityActivistMobile\cityActivistMobileController@getVoterDetailsByVoterNumberInBallotBox')->name('city-mobile-activists');
                  
                   Route::post('/ballot-leader/elections-dashboard','cityActivistMobile\activistMobileElectionDayController@getDashboardBallotMember')->name('city-mobile-activists');
                   Route::post('/ballot-leader/update-parties-total-votes','cityActivistMobile\activistMobileElectionDayController@setCountVotesForPartyByBallotBox')->name('city-mobile-activists');
                   Route::post('/ballot-leader/elections-result','cityActivistMobile\activistMobileElectionDayController@getElectionResultByBallotBox')->name('city-mobile-activists');
                  
                   Route::post('/ballot-leader/update-summery-votes','cityActivistMobile\activistMobileElectionDayController@setValidVotesAndNotValidVotesForballotBox')->name('city-mobile-activists');
                   Route::post('/ballot-leader/finish-shift','cityActivistMobile\activistMobileElectionDayController@finishedShift')->name('city-mobile-activists');
                   Route::post('/ballot-leader/upload-protocol','cityActivistMobile\activistMobileElectionDayController@uploadProtocolBallotBox')->name('city-mobile-activists');
                   Route::post('/ballot-leader/close-ballot','cityActivistMobile\activistMobileElectionDayController@closeBallotMox')->name('city-mobile-activists');
                   
                   Route::get('/download/appointment-letter/{ballot?}','cityActivistMobile\activistMobileElectionDayController@downloadAppointmentFile')->name('city-mobile-activists');
                });
                //logout
                Route::post('/logout','cityActivistMobile\cityActivistMobileController@logout')->name('allow');
                Route::get('/information','cityActivistMobile\cityActivistMobileController@getMobileInformation')->name('allow');

                
                
            });
        });
    });
});
