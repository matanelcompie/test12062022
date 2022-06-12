<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/*
| routing api ajax  calls
| every response is passed through output middleware
*/
Route::group( [ 'middleware' => 'apiOutput' ], function () {

    Route::post( '/login', 'Auth\LoginController@testLogin' );
    Route::post( '/user/password', 'UserController@resetPassword' );
} );

/*unused example route */
Route::get( '/user', function ( Request $request ) {

    return $request->user();
} )->middleware( 'auth:api' );