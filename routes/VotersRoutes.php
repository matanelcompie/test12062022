<?php
/* Routing login screen */

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'api'], function () {
    //Middleware for returning predefined JSON result
    Route::group(['middleware' => ['apiOutput', 'CheckMaintenance', 'apiPermissions']], function () {
        //Middleware for checking maintenance mode on API calls
        Route::get('/banks/branches', 'VoterController@getBanksBranchesTree')->name('allow');
    });
});