<?php

use Illuminate\Support\Facades\Route;


Route::group(['prefix' => 'api'], function () {

    // Route::get('/elections/test3', 'Transfer\TransferController@insertPreviousShassVotesData')->name('allow') ;

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {

        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {

            //Middleware for checking permission on API calls
            Route::group(['middleware' => 'apiPermissions'], function () {
                //---Allocation routs---
                Route::get('/elections/activists/voter/search/{city_id?}','Activist\ActivistAssignmentController@searchVoterAndCheckIfNotHasConflictRole');
                Route::get('/elections/activists/roles/{role_key}/ballots', 'Activist\ActivistAllocationController@getBallotArrayWithAssignmentBySearchDetails')->name('elections.activists.ballot_member, elections.activists.observer');
                Route::get('/elections/activists/{election_roles_by_voter_key}/clusters', 'Activist\ActivistAllocationController@getClustersWithAssignmentStatusForClusterActivist')
                    ->name('elections.activists');
                Route::put('/elections/allocation/ballot/{ballot_key}/roles/{ballot_role_key}', 'Activist\ActivistAllocationController@updateCreateOrDeleteBallotAllocation')->name('elections.activists.ballot_member, elections.activists.observer');
                Route::delete('/elections/allocation/ballot/{ballot_key}', 'Activist\ActivistAllocationController@deleteBallotAllocationByKey')->name('elections.activists.ballot_member, elections.activists.observer');
                Route::delete('/elections/allocation/{allocation_id}', 'Activist\ActivistAllocationController@deleteAllocationById')->name('elections.activists.ballot_member, elections.activists.observer');
                Route::get('/elections/allocation/roles/{geoEntityType}', 'Activist\ActivistAllocationController@getElectionRolesForAddAllocationByGeoEntityType')->name('elections.activists');
                Route::post('/elections/allocation/roles/{geoEntityType}', 'Activist\ActivistAllocationController@addAllocationNotForBallot')->name('elections.activists.ballot_member, elections.activists.observer');
                Route::get('/elections/allocation/geographic', 'Activist\ActivistAllocationController@getGeographicDetailsByGeographicEntityValue')->name('elections.activists');

                
                // City available clusters for allocation
                Route::get('/elections/activists/city/{city_key}/allocations/available-clusters', 'Activist\ActivistAllocationController@getCityClustersAllocations')
                ->name('elections.activists.city_summary,elections.activists.cluster_summary,elections.activists');
                Route::get('/elections/activists/city/{city_key}/allocations/available-ballots', 'Activist\ActivistAllocationController@getAllocationBallotBoxByCity')
                ->name('elections.activists.city_summary,elections.activists.cluster_summary,elections.activists');
                Route::get('/elections/activists/city/{city_key}/allocations/available-quarters', 'Activist\ActivistAllocationController@getCityQuarterAllocationByElectionRole')
                ->name('elections.activists.city_summary,elections.activists.cluster_summary,elections.activists');
            
                
                //Route::put('/elections/activists/city_summary/ballots/{ballot_key}/roles/{ballot_role_key}', 'ActivistAllocationController@updateCreateOrDeleteBallotAllocation')->name('elections.activists.city_summary.ballot_role_edit');

                //--Assignment--
                //add assignment for ballot activist
                Route::post('/elections/activists/{election_roles_by_voter_key}/ballots/{ballot_key}/shifts/{shift_key}', 'Activist\ActivistAssignmentController@addAssignmentForBallotActivist')
                    ->name('elections.activists.ballot_member.edit, elections.activists.observer.edit,elections.activists.counter.edit');
                //add assignment for cluster activist 
                Route::post('/elections/activists/{election_roles_by_voter_key}/clusters/{cluster_key}', 'Activist\ActivistAssignmentController@addClusterAssignmentToClusterActivist')
                ->name('elections.activists.motivator.edit');

                //details activist in activist page
                Route::get('/elections/activists/assignment/{assignment_id}', 'Activist\ActivistAssignmentController@getAssignmentDetails')
                    ->name('elections.activists');
                Route::get('/elections/activists/campaign/roles/{voter_key}/{election_campaign?}', 'VoterActivistController@getElectionActivistRoles')
                    ->name('elections.activists');
                Route::put('/elections/activists/clusters/{cluster_key?}/voters/{voter_key?}', "Activist\ActivistAssignmentController@addAssignmentForClusterLeaderActivist")
                    ->name('elections.activists.cluster_leader.edit');
                Route::put('/elections/activists/cluster/assignment/{assignment_id?}/voter/{voter_key?}', "Activist\ActivistAssignmentController@deleteAssignmentAndConnectAllocationToActivist")
                    ->name('elections.activists.cluster_leader.edit');
                Route::post('/elections/activists/{election_roles_by_voter_key}/driver', 'Activist\ActivistAssignmentController@addAssignmentForDriverActivist')
                    ->name('elections.activists.driver.edit');    
              
            });
        });
    });
});
