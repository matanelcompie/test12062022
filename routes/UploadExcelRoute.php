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

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            //Middleware for checking permission on API calls
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/system/imports/csv-document/themes', 'CsvDocumentController@getCsvDocumentThemeList')->name('allow');
                Route::get('/system/imports/csv-documents', 'CsvDocumentController@getAllCsvDocumentUploaded')->name('allow');
                Route::get('/system/imports/csv-document/{key}', 'CsvDocumentController@getCsvDocumentDetails')->name('allow');
                Route::post('/system/imports/csv-document/theme/{csv_document_theme_id}', 'CsvDocumentController@uploadExcelByCsvDocumentThemeId')->name('allow');
                Route::get('/system/imports/csv-document/{csv_document_id}/error-type/{csv_error_type}/{name_field?}', 'CsvDocumentController@downloadExcelErrorRowsByTypeErrorAndNameField')->name('allow');
                Route::post('/system/imports/csv-document/{csvDocumentId}/stop', 'CsvDocumentController@stopCsvDocumentUpload')->name('allow');
                Route::get('/system/imports/csv-document/{csvDocumentId}/download', 'CsvDocumentController@downloadById')->name('allow');


                // Route::get('/elections/cities/{city_key}/election-votes-report/{election_campaign_id}/upload/excel-columns', 'ElectionVotesReportController@getExcelColumnUploadElectionVotesReportByCity')->name('allow');
                // Route::post('/elections/cities/{city_key}/election-votes-report/{election_campaign_id}/upload/excel', 'ElectionVotesReportController@uploadExcelElectionVotesReportByCity')->name('allow');
            });
        });
    });
});
