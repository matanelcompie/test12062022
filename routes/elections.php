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
    
// Route::get('/elections/test3', 'Transfer\TransferController@insertPreviousShassVotesData')->name('allow') ;

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {

        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {

            //Middleware for checking permission on API calls
            Route::group(['middleware' => 'apiPermissions'], function () {

                /* CSV Import screens */
                Route::get('/elections/imports/search_voter/', 'ElectionsImportController@search')->name('elections.import.add');
                Route::get('/elections/imports/sources', 'ElectionsImportController@getCsvSourcesList')->name('elections.import');
                Route::get('/elections/imports/user_files', 'ElectionsImportController@getAllCsvFilesSummonDetails')->name('elections.import');
                Route::put('/elections/imports/user_files/{file_key}', 'ElectionsImportController@editCsvFileStatus')->name('elections.import.edit');
                Route::delete('/elections/imports/user_files/{file_key}', 'ElectionsImportController@deleteCsvFile')->name('elections.import.delete');
                Route::post('/elections/imports/{key}/parse', 'ElectionsImportController@parseCsvFile')->name('elections.import.execute');
                Route::post('/elections/imports/voter/groups', 'ElectionsImportController@addVoterGroup')->name('elections.import');

                Route::post('/elections/imports', 'ElectionsImportController@uploadCsvDocument')->name('elections.import.add');
                Route::put('/elections/imports/{key}', 'ElectionsImportController@saveCsvFileSettings')->name('elections.import.edit');
                Route::get('/elections/imports/{key}', 'ElectionsImportController@getCsvDataByKey')->name('elections.import');
                Route::get('/elections/imports/{key}/sample', 'ElectionsImportController@getCsvTopRowsDataByKey')->name('elections.import');
                Route::get('/elections/imports/{key}/progress', 'ElectionsImportController@getCsvProgressDataByKey')->name('elections.import');
                Route::get('/elections/imports/{file_key}/filter/{filter_key}', 'ElectionsImportController@filterCsvRowsDataByFileKey')->name('elections.import');
                Route::post('/elections/imports/{key}/fields', 'ElectionsImportController@addCsvDataFields')->name('elections.import.edit');

                /* Elections day screens : */
                Route::get('/elections/dashboard/elections_day/stats', 'ElectionDayDashboardController@getStatsByParams')->name('elections.dashboards.election_day');
                Route::get('/elections/dashboard/elections_day/print', 'ElectionDayDashboardController@printVotersDataToExcel')->name('elections.dashboards.election_day');
                
                /* Pre-elections day screens : */
                Route::get('/elections/dashboard/pre_elections_day/stats', 'PreElectionDayDashboardController@getBasicCountStatsByEntity')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/supportStatuses', 'PreElectionDayDashboardController@getSupportStatusesCounts')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/roles', 'PreElectionDayDashboardController@getRolesStats')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/transportations', 'PreElectionDayDashboardController@getTransportations')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/supporters_comparison', 'PreElectionDayDashboardController@getSupportStatusesComparison')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/areas_panel/global_stats', 'PreElectionDayDashboardController@getGlobalStats')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/areas_panel/cities_stats', 'PreElectionDayDashboardController@getCitiesPanelsStats')->name('elections.dashboards.pre_election_day');
                Route::get('/elections/dashboard/pre_elections_day/areas_panel/area_or_city_stats_only', 'PreElectionDayDashboardController@getAreaOrCityOnlyStats')->name('elections.dashboards.pre_election_day');
                /* End Pre-elections day screens : */

                Route::get('/elections/cities/{city_key}/election_historical_campaigns_data', 'ElectionsCitiesController@getHistoricalElectionCampaignsData')->name('elections.cities.vote_results.national, elections.cities.vote_results.municipal');
                Route::get('/elections/cities/{city_key}/election_historical_campaigns_data/votes', 'ElectionsCitiesController@getHistoricalCityElectionCampaignsVotes')->name('elections.cities.vote_results.national, elections.cities.vote_results.municipal');

                Route::get('/elections/cities/{city_key}/city_budget/{campaign_key}/activist_roles_summary', 'ElectionsCitiesController@getActivistsBudgetRolesSummary')->name('elections.cities.budget.expected_activists');
                Route::put('/elections/cities/{city_key}/city_budget/{campaign_key}/activist_expected_expenses/{row_key}', 'ElectionsCitiesController@updateCityBudgetActivistExpectedExpenses')->name('elections.cities.budget.expected_activists.edit');
                Route::get('/elections/cities/{city_key}/city_budget/{campaign_key}', 'ElectionsCitiesController@getCityBudgetByElectionCampaign')->name('elections.cities.budget');
                Route::get('/elections/cities/{city_key}/municipal_roles', 'ElectionsCitiesController@getAllMunicipalItemsData')->name('elections.cities.municipal_roles');
                Route::post('/elections/cities/{city_key}/municipal_roles/city_roles', 'ElectionsCitiesController@addNewCityMunicipalItem')->name('elections.cities.municipal_roles');
                Route::delete('/elections/cities/{city_key}/municipal_roles/city_roles/{item_key}', 'ElectionsCitiesController@deleteCityMunicipalItem')->name('elections.cities.municipal_roles');
                Route::put('/elections/cities/{city_key}/municipal_roles/city_roles/{role_key}', 'ElectionsCitiesController@editCityMunicipalItem')->name('elections.cities.municipal_roles');
                Route::post('/elections/cities/{city_key}/municipal_roles/council_members', 'ElectionsCitiesController@addNewCityMunicipalItem')->name('elections.cities.council_members');
                Route::delete('/elections/cities/{city_key}/municipal_roles/council_members/{item_key}', 'ElectionsCitiesController@deleteCityMunicipalItem')->name('elections.cities.council_members');
                Route::put('/elections/cities/{city_key}/municipal_roles/council_members/order', 'ElectionsCitiesController@saveCouncilMembersOrders');
                Route::put('/elections/cities/{city_key}/municipal_roles/council_members/{role_key}', 'ElectionsCitiesController@editCityMunicipalItem')->name('elections.cities.council_members');
                Route::post('/elections/cities/{city_key}/municipal_roles/religeous_shas_roles', 'ElectionsCitiesController@addNewReligeousOrShaseRoleItem')->name('elections.cities.roles.religious_council.add');
                Route::delete('/elections/cities/{city_key}/municipal_roles/religeous_shas_roles/{row_key}', 'ElectionsCitiesController@deleteReligeousOrShaseRoleItem')->name('elections.cities.roles.religious_council.delete');
                Route::put('/elections/cities/{city_key}/municipal_roles/religeous_shas_roles/{row_key}', 'ElectionsCitiesController@editReligeousOrShaseRoleItem')->name('elections.cities.roles.religious_council.edit');

                Route::put('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/candidates/orders', 'ElectionsCitiesController@saveCandidatesOrders')->name('elections.cities.parameters_candidates.candidates.council.edit,elections.cities.parameters_candidates.candidates.mayor.edit');
                Route::put('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/candidates/{candidate_key}', 'ElectionsCitiesController@saveCandidateByType')->name('elections.cities.parameters_candidates.candidates.council.edit,elections.cities.parameters_candidates.candidates.mayor.edit');
                Route::delete('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/candidates/{candidate_key}', 'ElectionsCitiesController@deleteCandidateByType')->name('elections.cities.parameters_candidates.candidates.mayor.delete,elections.cities.parameters_candidates.candidates.council.delete');
                Route::post('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/candidates', 'ElectionsCitiesController@addNewCandidateByType')->name('elections.cities.parameters_candidates.candidates.mayor.add,elections.cities.parameters_candidates.candidates.council.add');
                Route::get('/elections/cities/voter/search', 'ElectionsCitiesController@searchVoterByPersonalIdentity'); //TODO
                Route::post('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/parties', 'ElectionsCitiesController@addMunicipalElectionsCampaignParty')->name('elections.cities.parameters_candidates.council_parties.add');
                Route::delete('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/parties/{party_key}', 'ElectionsCitiesController@deleteMunicipalElectionsCampaignParty')->name('elections.cities.parameters_candidates.council_parties.delete');
                Route::put('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/parties/{party_key}', 'ElectionsCitiesController@editMunicipalElectionsCampaignParty')->name('elections.cities.parameters_candidates.council_parties.edit');

                Route::put('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}/cities', 'ElectionsCitiesController@updateMunicipalElectionsCityDetails')->name('elections.cities.parameters_candidates.parameters.edit');
                Route::get('/elections/cities/{city_key}/municipal_elections/campaigns/{campaign_key}', 'ElectionsCitiesController@loadMunicipalElectionsCampaignData')->name('elections.cities.parameters_candidates');
                Route::get('/elections/cities/municipal_elections/campaigns', 'CampaignController@getAllElectionCampaigns')->name('allow');

                Route::get('/elections/cities/teams', 'ElectionsCitiesController@getTeams')->name('admin');
                Route::get('/elections/cities/{key}', 'ElectionsCitiesController@getCityData')->name('elections.cities');
                Route::put('/elections/cities/{key}', 'ElectionsCitiesController@updateCityData')->name('elections.cities.parameters_candidates.parameters.edit');
                Route::put('/elections/cities/{key}/request-topics/{topic_key}', 'ElectionsCitiesController@updateCityRequestTopic')->name('elections.cities.parameters_candidates.parameters.edit');

                /* General report screen */
                Route::get('/elections/reports/walkers/election_day/export', 'ElectionDayWalkerReportController@exportReportByParamsAndType')->name('elections.reports.walkers.election_day');
                Route::get('/elections/reports/walkers/election_day/search_voter', 'ElectionDayWalkerReportController@searchVoterByParams')->name('elections.reports.walkers.election_day');
                Route::get('/elections/reports/walkers/election_day', 'ElectionDayWalkerReportController@getWalkerReportByParams')->name('elections.reports.walkers.election_day');
                Route::get('/elections/reports/captain_of_50_walker/print', 'Captain50WalkerReportController@printCap50WalkerReportByParams')->name('elections.reports.captain_of_fifty_walker.print');
                Route::get('/elections/reports/captain_of_50_walker/renovation/print', 'Captain50WalkerReportController@printRenovationCap50WalkerReportByParams')->name('elections.reports.captain_of_fifty_walker.print');
                Route::get('/elections/reports/captain_of_50_walker/print_by_captains_keys', 'Captain50WalkerReportController@printCap50WalkerReportByCaptainKeys')->name('elections.reports.captain_of_fifty_walker.print');
                Route::put('/elections/reports/captain_of_50_walker/{voter_key}', 'Captain50WalkerReportController@updateCap50WalkerReportVoterData')->name('elections.reports.captain_of_fifty_walker.edit');
                Route::put('/elections/reports/captain_of_50_walker_row/{voter_key}', 'Captain50WalkerReportController@updateCap50WalkerReportVoterRowData')->name('elections.reports.captain_of_fifty_walker.edit');
                Route::get('/elections/reports/walkers', 'Captain50WalkerReportController@getCap50WalkerReportByParams')->name('elections.reports.captain_of_fifty_walker,elections.reports.walkers.election_day');
                Route::get('/elections/reports/walkers/activist', 'Captain50WalkerReportController@searchCaptain50ByParams')->name('elections.reports.captain_of_fifty_walker,elections.reports.walkers.election_day');
                Route::get('/elections/reports/walkers/{city_key}/clusters', 'Captain50WalkerReportController@getClustersByCityKey')->name('elections.reports.captain_of_fifty_walker,elections.reports.walkers.election_day');
                Route::get('/elections/reports/walkers/cities/{city_key}', 'Captain50WalkerReportController@getClustersAndNeightborhoodsAndBallotBoxesByCityKey')
                ->name('elections.reports.captain_of_fifty_walker,elections.reports.walkers.election_day,elections.reports.walkers.general');
                
                Route::get('/elections/reports/walkers/general', 'GeneralWalkerReportController@getWalkerReport')->name('elections.reports.walkers.general');
                Route::get('/elections/reports/walkers/general/export', 'GeneralWalkerReportController@exportReportByParamsAndType') ->name('elections.reports.walkers.general.pdf,elections.reports.walkers.general.print');
                Route::get('/elections/reports/walkers/general/voter-count', 'GeneralWalkerReportController@setVoterCount')->name('allow'); //to delete in production!!!

                Route::get('/elections/reports/general/saved', 'ElectionReportsController@getAllSaveReportsTypes')->name('elections.reports.general');
                Route::get('/elections/reports/general/questionaires', 'ElectionReportsController@getAllQuestionaires')->name('elections.reports.general');
                Route::get('/elections/reports/general', 'ElectionReportsController@generalReport')->name('elections.reports.general');
                Route::get('/elections/reports/general/support_status', 'ElectionReportsController@getSupportStatus')->name('elections.reports.general');
                Route::get('/elections/reports/export', 'ElectionReportsController@exportReport')->name('elections.reports.general.excel,elections.reports.general.pdf,elections.reports.general.print');
                Route::get('/elections/reports/sms/count', 'ElectionReportsController@countSmsVoters')->name('elections.reports.general.sms');
                Route::get('/elections/reports/sms', 'ElectionReportsController@sendSms')->name('elections.reports.general.sms');

                /***   System Data ***/
                Route::get('/elections/roles', 'ListsController@getAllElectionRoles')
                    ->name('elections.voter.support_and_elections.election_activity, elections.activists, elections.cities.budget, elections.campaigns');
                Route::get('/elections/roles/shifts', 'ListsController@getAllElectionRoleShifts')
                    ->name('elections.voter.support_and_elections.election_activity, elections.activists');
                Route::get('/elections/roles/budget', 'ElectionRoleController@getAllElectionRoleBudget')
                    ->name('elections.voter.support_and_elections.election_activity, elections.activists');
                Route::get('/elections/roles/budget/city_expected_budget', 'ElectionRoleController@getCityElectionRoleBudget')
                    ->name('elections.activists');

                /**  Election Activists **/
                Route::get('/elections/activists/search', 'VoterActivistController@searchElectionActivists')->name('elections.activists.search');
                Route::get('/elections/activists/allocation/assignment/{allocation_id}', 'VoterActivistController@getAssignmentByAllocationId')->name('elections.activists.search');
                Route::get('/elections/activists/tashbetz', 'VoterActivistController@exportTashbetzCsv')->name('elections.activists.search');
                Route::get('/elections/activists/export', 'VoterActivistController@exportElectionActivists')->name('elections.activists.export');
            
                Route::delete('/elections/activists/geo/{geo_key}/{isDeleteRoleVoter}', 'VoterActivistController@deleteActivistAllocationAssignment')
                ->name('elections.activists.captain_of_fifty.edit, elections.activists.cluster_leader.edit, elections.activists.motivator.edit,
            elections.activists.driver.edit, elections.activists.ballot_member.edit, elections.activists.observer.edit
            ,elections.activists.election_general_worker.edit,elections.activists.counter.edit');
            
                Route::put('/elections/activists/update', 'VoterActivistController@updateActivistDto')
                ->name('elections.activists.captain_of_fifty.edit, elections.activists.cluster_leader.edit, elections.activists.motivator.edit,
                     elections.activists.driver.edit, elections.activists.ballot_member.edit, elections.activists.observer.edit
                     ,elections.activists.election_general_worker.edit,elections.activists.counter.edit');

                /** Captain of 50 **/
                Route::get('/elections/activists/captain50', 'CaptainOfFiftyController@captainsOfFifty')->name('elections.activists.captain_of_fifty');
                Route::post('/elections/activists/captain50/{captain_key}', 'HouseholdController@addHouseholdsToCaptain50')
                    ->name('elections.activists.captain_of_fifty.edit');
                Route::post('/elections/activists/captain50/{captain_key}/ballot/{ballot_key}', 'HouseholdController@addAllBallotBoxHouseholdsToCaptain50')
                    ->name('elections.activists.captain_of_fifty.edit');
                Route::delete('/elections/activists/captain50/{captain_key}', 'HouseholdController@deleteHouseholdsOfCaptain50')
                    ->name('elections.activists.captain_of_fifty.edit');

                /** Households  **/
                Route::get('/elections/activists/households', 'HouseholdController@household')->name('elections.activists.captain_of_fifty');

                /** Elections activists get, add, edit, delete **/

                Route::get('/elections/role_voter_activist/{election_roles_by_voter_key}', 'VoterActivistController@getRoleVoterDetailsByKey')
                    ->name('elections.activists');

                Route::put('/elections/activists/{election_roles_by_voter_key}', 'VoterActivistController@editElectionActivistRole')
                    ->name('elections.activists.captain_of_fifty.edit, elections.activists.cluster_leader.edit, elections.activists.motivator.edit,
                         elections.activists.driver.edit, elections.activists.ballot_member.edit, elections.activists.observer.edit
                         ,elections.activists.election_general_worker.edit,elections.activists.counter.edit');
                Route::put('/elections/activists/voters/bank-details/{voter_key}', 'VoterController@updateVoterBankDetails')
                    ->name('elections.activists.bank_details');

                Route::put('/elections/voters/bank-details/{voter_key}', 'VoterController@updateVoterBankDetails')
                    ->name('elections.voter.bank_details');
                    
                Route::put('/elections/activists/voters/bank-details/{voter_key}/valid-verification', 'VoterController@updateVoterBankDetailsVerification')
                    ->name('elections.activists.bank_details');

                Route::put('/elections/voters/bank-details/{voter_key}/valid-verification', 'VoterController@updateVoterBankDetailsVerification')
                    ->name('elections.voter.bank_details');


                Route::put('/elections/activists/{election_roles_by_voter_key}/details', 'VoterActivistController@editElectionActivistInstructed')
                    ->name('elections.activists.captain_of_fifty.edit, elections.activists.cluster_leader.edit, elections.activists.motivator.edit,
                         elections.activists.driver.edit, elections.activists.ballot_member.edit, elections.activists.observer.edit
                         ,elections.activists.election_general_worker.edit,elections.activists.counter.edit');

                Route::delete('/elections/activists/{election_roles_by_voter_key}', 'VoterActivistController@deleteElectionActivistRole')
                    ->name('elections.activists.captain_of_fifty.delete,elections.activists.cluster_leader.delete,
                         elections.activists.motivator.delete,elections.activists.driver.delete,elections.activists.ballot_member.delete,
                         ,elections.activists.election_general_worker.delete,elections.activists.counter.delete
                         elections.activists.observer.delete');

                //--update comments for election role
                Route::put('/elections/activists/{election_roles_by_voter_key}/comment', 'VoterActivistController@editRolePaymentComments')->name('allow'); 
                Route::put('/elections/activists/{election_roles_by_voter_key}/user_lock_id', 'VoterActivistController@changeLockStatus')->name('allow');               
                
                Route::put('/elections/activists/{election_roles_by_voter_key}/sum', 'VoterActivistController@editElectionActivistSum')
                    ->name('elections.activists.search.captain_of_fifty.sum_edit,
                        elections.activists.search.cluster_leader.sum_edit,
                        elections.activists.search.motivator.sum_edit,
                        elections.activists.search.driver.sum_edit,
                        elections.activists.search.ballot_member.sum_edit,
                        elections.activists.search.observer.sum_edit');                
                        
                Route::put('/elections/activists/{election_roles_by_voter_key}/{election_roles_by_voter_geo_key}/sum', 'VoterActivistController@editElectionActivistGeoSum')
                    ->name('elections.activists.search.captain_of_fifty.sum_edit,
                            elections.activists.search.cluster_leader.sum_edit,
                            elections.activists.search.motivator.sum_edit,
                            elections.activists.search.driver.sum_edit,
                            elections.activists.search.ballot_member.sum_edit,
                            elections.activists.search.observer.sum_edit');    

       
                // Upload Bank verify document
                Route::post('/elections/activists/{key}/documents', 'DocumentController@addDocument')
                     ->name('elections.activists.captain_of_fifty.edit,elections.activists.cluster_leader.edit,elections.activists.motivator.edit,
                elections.activists.driver.edit,elections.activists.ballot_member.edit,elections.activists.observer.edit
                ,elections.activists.election_general_worker.edit,elections.activists.counter.edit');

                Route::get('/elections/activists/{election_roles_by_voter_key}/export/total-payment', 'VoterActivistController@printElectionActivistTotalPaymentDoc')
                ->name('elections.activists.export.total_payment_letter');  

                Route::get('/elections/activists/city/{city_key}/export/total-payment', 'VoterActivistController@printCityActivistsTotalPaymentLetter')
                ->name('elections.activists.export.total_payment_letter'); 

                //Export appointment letters to print :
                Route::get('/elections/activists/appointment_letters/city/{city_key}/{role_type}/export',  'CityActivistsController@exportCityAppointmentLetters')
                ->name('elections.activists.city_summary.appointment_letter,elections.activists.cluster_summary.appointment_letter,
                    elections.activists.observer.appointment_letter,elections.activists.ballot_member.appointment_letter'); 

                //Export appointment letters to print from tashbetz:
                Route::get('/elections/activists/appointment_letters/city/{city_key}/{role_type}/export/from-tashbetz',  'CityActivistsController@exportCityAppointmentLettersFromTashbetz')
                ->name('elections.activists.city_summary.appointment_letter,elections.activists.cluster_summary.appointment_letter'); 
                   
                Route::get('/elections/activists/appointment_letters/observer/{election_role_key}/export',  'CityActivistsController@exportObserverLetterForBallotLeader')
                ->name('elections.activists.cluster_leader.appointment_letter,elections.activists.motivator.appointment_letter'); 


                Route::get('/elections/activists/appointment_letters/{election_role_key}/{ballot_role_id}/export',  'CityActivistsController@exportAppointmentLetter')
                ->name('elections.activists.city_summary.appointment_letter,elections.activists.cluster_summary.appointment_letter,
                    elections.activists.observer.appointment_letter,elections.activists.ballot_member.appointment_letter'); 


                /** Send message to activist  **/
                Route::post('/elections/activists/{election_roles_by_voter_key}/message', 'VoterActivistController@sendMessageToActivist')
                    ->name('elections.activists');

                /** Lock/Unlock activist allocation **/
                Route::put('/elections/activists/{election_roles_by_voter_key}/lock', 'VoterActivistController@changeLockStatus')
                    ->name('elections.activists.ballot_member.lock, elections.activists.observer.lock,elections.activists.additional_payments.lock');

                // Route::delete('/elections/activists/geo/{geo_key}/clusters/driver', 'VoterActivistController@deleteDriverCluster')
                //     ->name('elections.activists.driver.edit');

                Route::put('/elections/activists/geo/{geo_key}/shifts/{shift_key}', 'VoterActivistController@editBallotActivistShift')
                    ->name('elections.activists.ballot_member.edit, elections.activists.observer.edit,elections.activists.counter.edit');

                // Route::put('/elections/activists/geo/{geo_key}', 'VoterActivistController@editBallotActivistShiftDetails')
                //     ->name('electionelections.activists.ballot_member.edit, elections.activists.observer.edit,elections.activists.counter.edit');

                Route::put('/elections/activists/geo/check-location/{geo_key}', 'VoterActivistController@editNotCheckLocation')->name('elections.activists.cluster_summary.cancel-google-map');
                        

                /** Cluster Activist report **/
                Route::get('/elections/reports/cluster-activist', 'ClusterController@displayClusterActivistReport')->name('elections.reports.cluster_activists');
                Route::get('/elections/reports/cluster-activist/roles', 'ClusterController@getClusterElectionRoles')->name('elections.reports.cluster_activists');
                Route::get('/elections/reports/cluster-activist/find-leader', 'ClusterController@findClusterLeaders')->name('elections.reports.cluster_activists');
                Route::get('/elections/reports/cluster-activist/leaders', 'ClusterController@searchClusterLeaders')->name('elections.reports.cluster_activists');
                Route::get('/elections/reports/cluster-activist/cities/{city_key}/clusters', 'ClusterController@getCityClusters')->name('elections.reports.cluster_activists');

                /**  Captain50 Activity Report **/
                Route::get('/elections/reports/captain50-activity', 'CaptainOfFiftyController@captain50ActivityReport')->name('elections.reports.captain_of_fifty_activity');

                Route::get('/elections/reports/captain50-ballots/{captain50_key}', 'CaptainOfFiftyController@getCaptainsBallots')->name('elections.reports.captain_of_fifty_activity');

                /**  Status Change report  **/
                Route::get('/elections/reports/status-change', 'VoterSupportStatusController@displayStatusChangeReport')
                    ->name('elections.reports.support_status_changes');

                /**  Ballots Polling Summary **/
                Route::get('/elections/reports/ballots-summary/last-campaigns', 'CampaignController@getCampaignsForBallotPolling')
                    ->name('elections.reports.ballots_summary');
                Route::get('/elections/reports/ballots-summary', 'BallotBoxController@displayBallotsPollingSummary')
                    ->name('elections.reports.ballots_summary');

                /**  Management City View **/

                Route::get('/elections/management/city_view/clusters/{key}', 'CityActivistsController@getClusterDataByKeyOnly')->name('elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/ballot_box_roles', 'ListsController@getBallotBoxRoles')->name('elections.activists.city_summary,elections.activists.cluster_summary');
    			Route::get('/elections/management/city_view/all_elections_roles', 'ListsController@getAllElectionsRoles')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters', 'CityActivistsController@getCityNeighborhoodsAndClusters')->name('elections.activists.city_summary,elections.activists.cluster_summary');
				Route::get('/elections/management/city_view/{city_key}/export' , 'CityActivistsController@exportCityBallotsToFile')->name('elections.activists.city_summary,elections.activists.cluster_summary');
				
      
                Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/total_shas_voters_count', 'CityActivistsController@getTotalNumberOfShasElectorsCurrentCampaign')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/clusters_voters_supporters', 'CityActivistsController@getCityClustersVotersSupportsCount')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/extended_ballots_data', 'CityActivistsController@getExtendedDataForBallotBoxes')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/{city_key}/neighborhoods_and_clusters/{cluster_key}', 'CityActivistsController@getClusterActivistsDataByKey')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                //Get city ballots data:
                Route::get('/elections/management/city_view/{entity_type}/{entity_key}/ballots-data', 'CityActivistsController@getCityBallotsFullData')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                
                Route::get('/elections/management/city_view/activists/summary/{entity_type}/{entity_id}', 'CityActivistsController@getMunicipalEntitySummary')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/activists/election-role/summary/{election_role_key}', 'CityActivistsController@getMunicipalElectionRoleSummary')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/{city_key}/activists/municipal-coordinators', 'CityActivistsController@getCityActivistDetails')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/quarter/{quarter_id}/activists', 'CityActivistsController@getQuarterActivistDetails')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                // Route::get('/elections/management/city_view/{city_key}/quarters', 'CityActivistsController@getCityQuarters')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::get('/elections/management/city_view/{city_key}/clusters', 'CityActivistsController@getClusterDetailsIncludeCountBallotAndVotesByCity')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::post('/elections/management/city_view/{city_key}/quarters/{quarter_key?}', 'QuarterController@addCityQuarter')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::put('/elections/management/city_view/quarters/{quarter_key?}', 'QuarterController@updateCityQuarter')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                Route::delete('/elections/management/city_view/quarters/{quarter_id}', 'QuarterController@deleteCityQuarter')->name('elections.activists.city_summary,elections.activists.cluster_summary');
                /**  Management City Edit Activists**/

                // Route::put('/elections/management/city_view/activists/geo/{geo_key}', 'VoterActivistController@editBallotActivistShiftDetails')
                // ->name('elections.activists.cluster_summary.edit','elections.activists.city_summary.edit');

                Route::delete('/elections/management/city_view/activists/{election_roles_by_voter_key}', 'VoterActivistController@deleteElectionActivistRole')
                ->name('elections.activists.cluster_summary.delete','elections.activists.city_summary.delete');

                Route::delete('/elections/management/city_view/activists/geo/{geo_key}', 'VoterActivistController@deleteActivistAllocationAssignment')
                ->name('elections.activists.cluster_summary.delete','elections.activists.city_summary.delete');

                Route::put('/elections/management/city_view/activists/{election_roles_by_voter_key}', 'VoterActivistController@editElectionActivistInstructed')
                ->name('elections.activists.cluster_summary.edit','elections.activists.city_summary.edit');

                //TODO:remove
                Route::get('/elections/management/city_view/{city_key}/voter/search', 'CityActivistsController@searchForElectionVoterActivist')
                ->name('elections.activists.city_summary.search,elections.activists.cluster_summary.search');
                //TODO:remove
                Route::post('/elections/management/city_view/{city_key}/activists/{voter_key}/roles',  'CityActivistsController@addRoleAndShiftToActivist')
                ->name('elections.activists.city_summary.edit,elections.activists.cluster_summary.edit');
                
                // Route::post('/elections/management/city_view/{city_key}/municipal-activists/{voter_key}/roles',  'CityActivistsController@addCityMunicipalActivist')
                // ->name('elections.activists.city_summary.edit,elections.activists.cluster_summary.edit');
                
                Route::post('/elections/activists/city/{city_key}/{voter_key}/roles',  'CityActivistsController@addRoleAndShiftToActivist')
                ->name('elections.activists.search.captain_of_fifty.sum_edit,
                        elections.activists.search.cluster_leader.sum_edit,
                        elections.activists.search.motivator.sum_edit,
                        elections.activists.search.driver.sum_edit,
                        elections.activists.search.ballot_member.sum_edit,
                        elections.activists.search.observer.sum_edit'); 
                
                Route::get('/elections/management/city_view/clusters/activists/{cluster_id}',  'CityActivistsController@getClusterActivists')
                ->name('elections.activists.city_summary.edit');

                //Export appointment letters to PDF :
                Route::get('/elections/management/city_view/appointment_letters/{election_role_key}/{ballot_role_id}/export',  'CityActivistsController@exportAppointmentLetter')
                ->name('elections.activists.city_summary'); //Need permissions!


                /*Update support statuses for household screen*/
                Route::get('/elections/household_status_change/search', 'HouseholdStatusChangeController@searchVotersByParams')->name('elections.household_support_status_change');
                Route::get('/elections/household_status_change/excel/{key}', 'HouseholdStatusChangeController@getUpdateJobExcelFileDataByKey')->name('elections.household_support_status_change');
                Route::get('/elections/household_status_change/{key}', 'HouseholdStatusChangeController@getUpdateJobDataByKey')->name('elections.household_support_status_change');
                Route::get('/elections/household_status_change', 'HouseholdStatusChangeController@getUserJobsList')->name('elections.household_support_status_change');
                Route::post('/elections/household_status_change', 'HouseholdStatusChangeController@addSupportStatusChangeTask')->name('elections.household_support_status_change.add,elections.household_support_status_change.execute');

                /*form 1000*/
                Route::get('/elections/form1000/{ballotbox_key}/export', 'ElectionsForm1000Controller@exportBallotBoxVotesData')->name('elections.form1000.export,elections.form1000.print');
                Route::get('/elections/form1000/export', 'ElectionsForm1000Controller@exportAllCityOrClustersBallots')->name('elections.form1000.export,elections.form1000.print');
                Route::get('/elections/form1000/{ballotbox_key}', 'ElectionsForm1000Controller@loadBallotBoxVotesData')->name('elections.form1000');
                Route::post('/elections/form1000/{ballotbox_key}', 'ElectionsForm1000Controller@addBallotBoxVotesData')->name('elections.form1000.add');

    			/*Votes dashboard screens*/
    			Route::get('/elections/votes/dashboard', 'VotesDashboardController@getMainDashboardData')->name('elections.votes.dashboard');
    			Route::get('/elections/votes/dashboard/enrolled', 'VotesDashboardController@getEnrolledActivists')->name('elections.votes.dashboard');
    			Route::get('/elections/votes/dashboard/wrong', 'VotesDashboardController@getWrongActivists')->name('elections.votes.dashboard');
    			Route::delete('/elections/votes/dashboard/wrong/{key}', 'VotesDashboardController@removeWrongRow')->name('elections.votes.dashboard');
    			Route::put('/elections/votes/dashboard/wrong/{key}', 'VotesDashboardController@fixWrongRow')->name('elections.votes.dashboard');
    			Route::get('/elections/votes/dashboard/missed', 'VotesDashboardController@getMissedActivists')->name('elections.votes.dashboard');
    			Route::delete('/elections/votes/dashboard/missed/{role_shift_key}', 'VotesDashboardController@deleteMissedActivist')->name('elections.votes.dashboard');
    			Route::get('/elections/votes/dashboard/unverified', 'VotesDashboardController@getUnverifiedActivists')->name('elections.votes.dashboard');
    			Route::delete('/elections/votes/dashboard/unverified', 'VotesDashboardController@generalDeleteUnverifiedActivists')->name('elections.votes.dashboard');
    			Route::post('/elections/votes/dashboard/message', 'VotesDashboardController@sendMessageToActivist')->name('elections.votes.dashboard');
                Route::get('/elections/votes/dashboard/excel_entity/{entity_type}/{entity_id}', 'VotesDashboardController@downloadExcelFileByEntityGeo')->name('elections.votes.dashboard');
                Route::get('/elections/votes/dashboard/ballot_excel_entity/{entity_type}/{entity_id}', 'VotesDashboardController@downloadExcelFileByEntityGeoGroupBallot')->name('elections.votes.dashboard');
    			
                /*Manual votes screen*/
                Route::get('/elections/votes/manual/search_voter', 'ManualVotesController@searchVoterByParams')->name('elections.votes.manual');
                Route::get('/elections/votes/manual/{voter_key}', 'ManualVotesController@getVoterVoteData')->name('elections.votes.manual');
                Route::post('/elections/votes/manual/{voter_key}', 'ManualVotesController@addVoterVoteData')->name('elections.votes.manual.add');
                Route::delete('/elections/votes/manual/{voter_key}', 'ManualVotesController@deleteVoterVoteData')->name('elections.votes.manual.delete');

                /* Voter source screen */
                Route::get('/elections/voters-source/voters', 'VoterController@searchVoterSourceVoters')->name('allow');

                /*  Voters Manual Screen */
                Route::get('/elections/voters/manual/sources', 'ElectionsImportController@getCsvSourcesList')->name('elections.manual_update');
                Route::get('/elections/voters/manual/source/voter', 'VotersManualController@getVoterByIdentityOrKey')->name('elections.manual_update.voter');
                Route::get('/elections/voters/manual/voter/{voter_key}', 'VotersManualController@getVoterForManualUpdate')->name('elections.manual_update.voter');
                Route::put('/elections/voters/manual', 'VotersManualController@saveSelectedVoters')->name('elections.manual_update.voter.edit');

                /*  Voters Manual institutes */
                Route::get('/elections/voters/manual/institutes/roles', 'InstituteController@getInstituteRoles')
                     ->name('allow');

                Route::get('/elections/campaigns', 'ListsController@getAllElectionCampaigns')
                        ->name('allow');
                Route::get('/elections/campaigns/sources', 'VoterElectionsController@getVoteSources')
                        ->name('elections.voter.support_and_elections.ballot');

                /*             * *  Elections last campaign  ** */
                Route::get('/elections/campaigns/last', 'VoterElectionsController@getGeneralLastCampaign')
                        ->name('elections.voter');

                /**  Elections Campaigns **/
                Route::get('/elections/campaigns/all', 'CampaignController@getAllElectionCampaigns')
                    ->name('elections.campaigns');
                Route::get('/elections/campaigns/current', 'CampaignController@getCurrentCampaign')
                    ->name('elections.campaigns');
                Route::get('/elections/campaigns/{campaign_key}/support/statuses', 'SupportStatusController@getALLSupportStatuses')
                    ->name('elections.campaigns.support_status,elections.campaigns.support_status_update');
                Route::get('/elections/campaigns/{campaign_key}', 'CampaignController@getCampaignDetails')
                    ->name('elections.campaigns.edit');
                Route::put('/elections/campaigns/{campaign_key}', 'CampaignController@editElectionCampaign')
                    ->name('elections.campaigns.edit');

                /** Campaign Voter Books **/
                Route::get('/elections/campaigns/{campaign_key}/voter/books', 'CampaignController@getCampaignVoterBooks')
                    ->name('elections.campaigns.voters_book');
                Route::get('/elections/campaigns/{campaign_key}/voter/books/{voter_book_key}', 'CampaignController@getCampaignVoterBook')
                    ->name('elections.campaigns.voters_book');
                Route::post('/elections/campaigns/{campaign_key}/voter/books/upload', 'CampaignController@uploadVoterBook')
                    ->name('elections.campaigns.voters_book.add');
				Route::put('/elections/campaigns/{campaign_key}/voter/books/{voter_book_key}', 'CampaignController@editCampaignVoterBookUpdate')
                    ->name('elections.campaigns.voters_book.edit');

                /** Campaign Budget **/
                Route::get('/elections/campaigns/{campaign_key}/budgets/files', 'CampaignController@getCampaignBudgetFiles')
                    ->name('elections.campaigns.budget.files');
                Route::post('/elections/campaigns/{campaign_key}/budgets/files/upload', 'CampaignController@uploadBudgetFile')
                    ->name('elections.campaigns.budget.files.add');

                Route::get('/elections/campaigns/city/budgets/roles', 'ElectionRoleController@getAllElectionRoleBudget')
                ->name('allow');
                Route::get('/elections/campaigns/budgets/shift/roles', 'ElectionRoleController@getAllElectionRoleShiftsBudget')
                ->name('allow');    
                    
                Route::get('/elections/campaigns/{campaign_key}/budgets/roles', 'ElectionRoleController@getAllElectionRoleShiftsBudget')
                    ->name('elections.campaigns.budget.salary');

                Route::put('/elections/campaigns/{campaign_key}/budgets/roles/{role_shift_budget_key}', 'CampaignController@editCampaignElectionRoleBudget')
                    ->name('elections.campaigns.budget.salary.edit');

                /**  Vote Files **/
                Route::get('/elections/campaigns/{campaign_key}/vote/files', 'VotesController@getVoteFiles')
                    ->name('elections.campaigns.vote_results');
                Route::get('/elections/campaigns/{campaign_key}/vote/files/{vote_file_key}', 'VotesController@getCampaignVoteFile')
                    ->name('elections.campaigns.vote_results');
                Route::post('/elections/campaigns/{campaign_key}/vote/files/upload', 'VotesController@uploadVoteFile')
                    ->name('elections.campaigns.vote_results.add');
				Route::put('/elections/campaigns/{campaign_key}/vote/files/{vote_file_key}', 'VotesController@editCampaignVoteFile')
                    ->name('elections.campaigns.vote_results.edit');

                /** Percents **/
                Route::get('/elections/campaigns/{campaign_key}/percents', 'VotesController@getPredictedVotesPercentages')
                    ->name('elections.campaigns.vote_percentage');
                Route::post('/elections/campaigns/{campaign_key}/percents', 'VotesController@addCampaignVotePercentage')
                    ->name('elections.campaigns.vote_percentage.add');
                Route::put('/elections/campaigns/{campaign_key}/percents/{percent_key}', 'VotesController@editCampaignVotePercentage')
                    ->name('elections.campaigns.vote_percentage.edit');
                Route::delete('/elections/campaigns/{campaign_key}/percents/{percent_key}', 'VotesController@deleteCampaignVotePercentage')
                    ->name('elections.campaigns.vote_percentage.delete');

                /** Campaign Ballot Boxes **/
                Route::get('/elections/campaigns/{campaign_key}/ballots/files', 'CampaignController@getCampaignBallotBoxesFiles')
                    ->name('elections.campaigns.ballots.ballot_files');
                Route::get('/elections/campaigns/{campaign_key}/ballots/files/{ballot_file_key}', 'CampaignController@getCampaignBallotBoxFile')
                    ->name('ballots.ballot_files');
                Route::post('/elections/campaigns/{campaign_key}/ballots/files/upload', 'CampaignController@uploadBallotBoxFile')
                    ->name('elections.campaigns.ballots.ballot_files.add');
				Route::put('/elections/campaigns/{campaign_key}/ballots/files/{ballot_file_key}', 'CampaignController@editCampaignBallotBoxFile')
                    ->name('ballots.ballot_files.edit');

                /** Support Status updates **/
                Route::get('/elections/campaigns/{campaign_key}/support/status/updates', 'CampaignController@getCampaignSupportStatusUpdates')
                    ->name('elections.campaigns.support_status_update');
                Route::get('/elections/campaigns/{campaign_key}/support/status/updates/{update_key}', 'CampaignController@getCampaignSupportStatusUpdate')
                    ->name('elections.campaigns.support_status_update');
                Route::post('/elections/campaigns/{campaign_key}/support/status/updates', 'CampaignController@addCampaignSupportStatusUpdate')
                    ->name('elections.campaigns.support_status_update.add');
                Route::put('/elections/campaigns/{campaign_key}/support/status/updates/{update_key}', 'CampaignController@editCampaignSupportStatusUpdate')
                    ->name('elections.campaigns.support_status_update.edit');

                Route::post('elections/campaigns', 'CampaignController@addElectionCampaign')->name('elections.campaigns.add');
                Route::put('/elections/campaigns/{campaign_key}/support/statuses/{support_key}', 'SupportStatusController@updateSupportStatus')
                    ->name('elections.campaigns.support_status.edit');
                Route::delete('/elections/campaigns/{campaign_key}/support/statuses/{support_key}', 'SupportStatusController@deleteSupportStatus')
                    ->name('elections.campaigns.support_status.delete');
                Route::post('/elections/campaigns/{campaign_key}/support/statuses/', 'SupportStatusController@addSupportStatus')
                    ->name('elections.campaigns.support_status.add');
                     
                // Transportations 
                Route::get('/elections/transportations', 'TransportationsController@getTransportations')->name('elections.transportations');
                Route::get('/elections/transportations/drivers', 'TransportationsController@getDrivers')->name('elections.transportations');
                Route::get('/elections/transportations/city', 'TransportationsController@getCityData')->name('elections.transportations');
                Route::get('/elections/transportations/city/clusters', 'TransportationsController@getClustersData')->name('elections.transportations');
                Route::get('/elections/transportations/city/drivers', 'TransportationsController@getTransportationsCityDrivers')->name('elections.transportations');
                Route::get('/elections/transportations/export', 'TransportationsController@exportToFile')->name('elections.transportations.export,elections.transportations.print');
                Route::put('/elections/transportation/{voter_key}/vote', 'TransportationsController@addVoteToVoter')->name('elections.transportations.edit');
                Route::put('/elections/transportation/{voter_key}/comment', 'TransportationsController@updateVoterComment')->name('elections.transportations.edit');
                Route::put('/elections/transportations', 'TransportationsController@updateVoterTransportations')->name('elections.transportations.edit,elections.transportations.delete');
                Route::put('/elections/transportation/{key}', 'TransportationsController@updateVoterTransportation')->name('elections.transportations.edit');
                //TODO::remove
                Route::get('/elections/transportation/{city_key}/voter/search', 'CityActivistsController@searchForElectionVoterActivist')
                ->name('elections.transportations');

                Route::post('/elections/transportation/{city_key}/drivers/{driver_voter_key}', 'CityActivistsController@addRoleAndShiftToActivist')
                ->name('elections.transportations.edit');

                //Routing external votes 
                Route::get('/elections/votes', 'VotesController@getVotes')->name('elections.votes');

                //External pages
                Route::get('/elections/voter/ballot-address', 'ElectionDayDashboardController@getVoterBallotAddress')->name('allow') ;

                //For election only!!! export arraived activists by cities.

                Route::get('/elections/activists/arraived/export', 'Transfer\TransferController@exportAreasGeoArraiveData')->name('allow');
                Route::get('/elections/specials/current_votes', 'Transfer\TransferController@transferRealVotesStatsBallots')->name('allow');
                Route::get('/elections/specials/current_parties_votes', 'Transfer\TransferController@transferRealVotesPartyListsBallots')->name('allow');
                Route::get('/elections/specials/insert_previous_parties', 'Transfer\TransferController@insertPreviousPartiesList')->name('allow') ;
                Route::get('/elections/specials/insert_previous_parties_full_data', 'Transfer\TransferController@insertPreviousPartiesFullData')->name('allow') ;
               
            });
        });
    });
});

Route::group(['middleware' => 'auth.guest'], function () {
    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
        //Middleware for checking permission on API calls
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/elections/campaigns/{campaign_key}/voter/books/{book_key}/download', 'CampaignController@downloadVoterBook')
                    ->name('elections.campaigns.voters_book.download');
                Route::get('/elections/campaigns/{campaign_key}/budgets/files/{file_key}/download', 'CampaignController@downloadBudgetFile')
                    ->name('elections.campaigns.budget.files.download');
                Route::get('/elections/campaigns/{campaign_key}/vote/files/{file_key}/download', 'VotesController@downloadVoteFile')
                    ->name('elections.campaigns.vote_results.download');
                Route::get('/elections/campaigns/{campaign_key}/ballots/files/{file_key}/download', 'CampaignController@downloadBallotBoxFile')
                    ->name('elections.campaigns.ballots.ballot_files.download');
                    
                Route::get('/elections/activist/export', 'VoterActivistController@exportActivists')
                    ->name('elections.activists.export.all_details');
                Route::get('/elections/activist/clusters/export', 'VoterActivistController@exportClusterActivists')
                    ->name('elections.activists.export.all_details');

                    Route::get('/elections/activist/city_summary/export', 'VoterActivistController@exportActivists')
                    ->name('elections.activists.city_summary.export');
                Route::get('/elections/activist/city_summary/clusters/export', 'VoterActivistController@exportClusterActivists')
                    ->name('elections.activists.city_summary.export');

            });
        });
    });
});

