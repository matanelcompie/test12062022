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
    Route::group(['prefix' => 'activists'], function () {

        //Middleware for returning predefined JSON result
        Route::group(['middleware' => 'apiOutput'], function () {

            //Middleware for checking maintenance mode on API calls
            Route::group(['middleware' => 'CheckMaintenance'], function () {

                //Middleware for checking permission on API calls
                Route::group(['middleware' => 'apiActivistsPermissions'], function () {
                    Route::get('/system/status', 'SettingsController@getSystemStatus')->name('allow');

                    Route::get('/system/errors', 'SettingsController@getErrorList')->name('allow');

                    Route::get('/system/users/current', 'UserController@getCurrentActivistUser')->name('allow');

                    Route::get('/elections/roles/shifts', 'ListsController@getAllElectionRoleShifts')->name('elections.voter.support_and_elections.election_activity, elections.activists');

                    Route::get('/elections/roles/budget', 'ElectionRoleController@getAllElectionRoleBudget')->name('elections.voter.support_and_elections.election_activity, elections.activists');
                    Route::get('/elections/roles', 'ListsController@getAllElectionRoles')->name('elections.voter.support_and_elections.election_activity, elections.activists, elections.cities.budget, elections.campaigns');
                    Route::get('/system/users/current/geographic_lists', "UserController@getUserGeographicalLists")->name('allow');

                    /**  Management City View **/
                    Route::get('/elections/management/city_view/clusters/{key}', 'CityActivistsController@getClusterDataByKeyOnly')->name('elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/ballot_box_roles', 'ListsController@getBallotBoxRoles')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/all_elections_roles', 'ListsController@getAllElectionsRoles')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters', 'CityActivistsController@getCityNeighborhoodsAndClusters')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/{city_key}/export', 'CityActivistsController@exportCityBallotsToFile')->name('elections.activists.city_summary,elections.activists.cluster_summary');

                    /**  Management City Edit Activists**/

                    Route::put('/elections/management/city_view/activists/geo/{geo_key}', 'VoterActivistController@editBallotActivistShiftDetails')
                        ->name('elections.activists.cluster_summary.edit', 'elections.activists.city_summary.edit');

                    Route::delete('/elections/management/city_view/activists/{election_roles_by_voter_key}', 'VoterActivistController@deleteElectionActivistRole')
                        ->name('elections.activists.cluster_summary.delete', 'elections.activists.city_summary.delete');

                    Route::delete('/elections/management/city_view/activists/geo/{geo_key}', 'VoterActivistController@deleteActivistAllocationAssignment')
                        ->name('elections.activists.cluster_summary.delete', 'elections.activists.city_summary.delete');

                    Route::put('/elections/management/city_view/activists/{election_roles_by_voter_key}', 'VoterActivistController@editElectionActivistInstructed')
                        ->name('elections.activists.cluster_summary.edit', 'elections.activists.city_summary.edit');

                    //TODO:remove
                    Route::get('/elections/management/city_view/{city_key}/voter/search', 'CityActivistsController@searchForElectionVoterActivist')
                        ->name('elections.activists.city_summary.search,elections.activists.cluster_summary.search');

                    Route::post('/elections/management/city_view/{city_key}/activists/{voter_key}/roles',  'CityActivistsController@addRoleAndShiftToActivist')
                        ->name('elections.activists.city_summary.edit,elections.activists.cluster_summary.edit');

                    //Export appointment letters to PDF :
                    Route::get('/elections/management/city_view/appointment_letters/{election_role_key}/{ballot_role_id}/export',  'CityActivistsController@exportAppointmentLetters')
                    ->name('allow'); //Need permissions!

                    Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/total_shas_voters_count', 'CityActivistsController@getTotalNumberOfShasElectorsCurrentCampaign')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/clusters_voters_supporters', 'CityActivistsController@getCityClustersVotersSupportsCount')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/extended_ballots_data', 'CityActivistsController@getExtendedDataForBallotBoxes')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/{cluster_key}', 'CityActivistsController@getClusterActivistsDataByKey')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/activists/summary/{entity_type}/{entity_id}', 'CityActivistsController@getMunicipalEntitySummary')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/activists/election-role/summary/{election_role_key}', 'CityActivistsController@getMunicipalElectionRoleSummary')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::get('/elections/management/city_view/{city_key}/activists/municipal-coordinators', 'CityActivistsController@getCityActivistDetails')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    // Route::get('/elections/management/city_view/{city_key}/quarters', 'CityActivistsController@getCityQuarters')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    // Route::get('/elections/management/city_view/{city_key}/clusters', 'CityActivistsController@getCityClustersForQuarter')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::post('/elections/management/city_view/{city_key}/quarters/{quarter_key?}', 'CityActivistsController@addCityQuarter')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                    Route::put('/elections/management/city_view/{city_key}/quarters/{quarter_key?}', 'CityActivistsController@updateCityQuarter')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                });
            });
        });
    });
});
