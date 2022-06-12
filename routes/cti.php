<?php

//Base route for system
Route::group(['middleware' => 'auth.guest'], function () {
    Route::get('/cti/{all?}', 'Tm\CtiController@index')->where('all', '.*')->name('cti');
});

Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/cti/lists', 'Tm\CtiController@getLists')->name('cti');
                Route::get('/cti/campaigns', 'Tm\CtiController@getCampaigns')->name('cti');
                Route::get('/cti/voters/{key}', 'Tm\CtiController@getVoter')->name('cti');

                /** Campaign extensions **/
                Route::get('/cti/campaigns/{campaignKey}/extension', 'Tm\CtiController@getExtension')->name('cti');
                Route::put('/cti/campaigns/{campaignKey}/extension', 'Tm\CtiController@assignExtensionToCampaign')->name('cti');
                Route::delete('/cti/campaigns/{campaignKey}/extension', 'Tm\CtiController@deleteExtensionFromCampaign')->name('cti');

                /** Campaign breaks **/
                Route::post('/cti/campaigns/{campaignKey}/breaks', 'Tm\CtiController@addCampaignBreak')->name('cti');
                Route::put('/cti/campaigns/breaks/{breakKey?}', 'Tm\CtiController@updateCampaignBreak')->name('cti');

                /** Campaign waitings **/
                Route::post('/cti/campaigns/{campaignKey}/waitings', 'Tm\CtiController@addCampaignWaiting')->name('cti');
                Route::put('/cti/campaigns/waitings/{waitingKey?}', 'Tm\CtiController@updateCampaignWaiting')->name('cti');

                /*** Campaign Messages  ***/
                Route::get('/cti/campaigns/{campaignKey}/files', 'Tm\CampaignController@getCampaignFiles')->name('cti');

                /*** Campaign manual set next  ***/
                Route::post('/cti/campaigns/{campaignKey}/calls/manual', 'Tm\CampaignController@addManualNextVoterCall')->name('cti');

                /** Campaign permissions **/
                Route::get('/cti/campaigns/{campaignKey}/permissions', 'Tm\CampaignController@getCampaignPermissions')->name('cti');

                Route::put('/cti/calls/{key}', 'Tm\CallController@saveCallData')->name('cti');
                Route::get('/cti/calls/{key}/voter', 'Tm\CallController@getVoter')->name('cti');
                Route::post('/cti/calls/{key}/sms', 'Tm\CallController@sendSms')->name('cti');
                Route::post('/cti/calls/{key}/email', 'Tm\CallController@sendEmail')->name('cti');

                /***  Meta Keys ***/
                Route::get('/cti/metadata/keys', 'VoterMetaDataContoller@getMetaDataKeys')->name('cti');
                Route::get('/cti/metadata/values', 'VoterMetaDataContoller@getMetaDataValues')->name('cti');

                /*** UI errors ***/
                Route::post('/cti/system/errors', 'ErrorsController@addError')->name('cti');
            });
        });
    });
});

//Base route for system
Route::group(['middleware' => 'auth.guest'], function () {

    //Middleware for returning predefined JSON result
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            //Middleware for checking permission on API calls
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/campaigns/files/{key}', 'Tm\CampaignController@downloadFile')->name('cti');
                Route::get('/campaigns/files/{key}/download', 'Tm\CampaignController@downloadFile')->name('cti');
            });
        });
    });
});

Route::get('/files/{key}', 'Tm\CampaignController@downloadSharedFile');