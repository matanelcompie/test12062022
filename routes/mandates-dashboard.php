<?php
 use Illuminate\Support\Facades\Route;



// todo: route for get all (list of parties and the summary data for the main table)
// todo: route for get one - detailed
// Route::get('/mandates-dashboards/lists', "MandatesDashboardController@someNameHere")->name('allow');
// Route::get('/mandates-dashboards/detailed/{tab}', "MandatesDashboardController@someOtherNameHere")->name('allow');
// Route::get('/mandates-dashboards/detailed/{miflaga-modal}/typeId', "MandatesDashboardController@someOtherNameHere")->name('allow');
// Route::get('/mandates-dashboards/detailed/{ezor-modal}/typeId', "MandatesDashboardController@someOtherNameHere")->name('allow');

Route::group(['middleware' => 'auth.guest'], function () {
    Route::get('/mandates-dashboards/{all?}', 'MandatesDashboardController@index')->where('all', '.*')->name('dashboards.mandates');
});

// Route::group(['prefix' => 'api'], function () {
//     Route::group(['middleware' => 'apiOutput'], function () {
//         //Middleware for checking maintenance mode on API calls
//         Route::group(['middleware' => 'CheckMaintenance'], function () {
//             Route::group(['middleware' => 'apiPermissions'], function () {
//                 Route::get('/quarters-dashboards/{type}/{id?}/{filter?}', "QuartersDashboardController@getPresentsDayByType")->name('allow');
//                 Route::get('/quarters-present', "QuartersDashboardController@getPresentsDay")->name('allow');
//             });
//         });
//     });
// });
