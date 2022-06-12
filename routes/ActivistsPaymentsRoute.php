<?php

use Illuminate\Support\Facades\Route;



Route::group(['middleware' => 'auth.guest'], function () {
    Route::get('/activists-payments/{all?}', 'ActivistsPaymentsController@index')->where('all', '.*')->name('allow');
});

Route::group(['prefix' => 'api'], function () {
    Route::group(['middleware' => 'apiOutput'], function () {
        //Middleware for checking maintenance mode on API calls
        Route::group(['middleware' => 'CheckMaintenance'], function () {
            Route::group(['middleware' => 'apiPermissions'], function () {
                Route::get('/payment/role-voter/{roleVoterId}', "ActivistsPaymentsController\searchActivistPaymentController@getPaymentRoleVoterDetails")->name('allow');
                Route::get('/payments/search', "ActivistsPaymentsController\searchActivistPaymentController@getDetailsSummeryActivistPayment")->name('allow');
                Route::get('/payments/activist', "ActivistsPaymentsController\searchActivistPaymentController@getDetailsAllPaymentsActivist")->name('allow');
                Route::get('/payments/role-voters/need-payment', "ActivistsPaymentsController\searchActivistPaymentController@getAllRoleVoterWithoutPaymentId")->name('allow');

                //create payments
                Route::post('/payments/remove-payment', "ActivistsPaymentsController\CreatePaymentsController@removeRecordActivistPaymentInGroup")->name('allow');
                Route::post('/payments/create-payment', "ActivistsPaymentsController\CreatePaymentsController@createPaymentsGroup")->name('allow');
                Route::post('/payments/add-payment', "ActivistsPaymentsController\CreatePaymentsController@addPaymentToExistingGroup")->name('allow');
                Route::get('/payments/group-payments', "ActivistsPaymentsController\searchActivistPaymentController@getArrGroupPayments")->name('allow');
                Route::get('/payments/group-payments/download', "ActivistsPaymentsController\searchActivistPaymentController@downloadPaymentGroupFileMasav")->name('allow');
                Route::get('/payments/group-payments/download-excel/{paymentGroupId}', "ActivistsPaymentsController\PaymentGroupController@downloadExcelFile")->name('allow');
                Route::post('/payments/group-payments/reference', "ActivistsPaymentsController\searchActivistPaymentController@updateReferenceId")->name('allow');
                Route::get('/payments/group-payments/list-payments-group', "ActivistsPaymentsController\searchActivistPaymentController@getListPaymentByPaymentGroup")->name('allow');
                Route::post('/payments/group-payments/delete', "ActivistsPaymentsController\searchActivistPaymentController@removePaymentGroupByGroupId")->name('allow');
                Route::post('/payments/set-status', "ActivistsPaymentsController\CreatePaymentsController@updateActivistPaymentStatus")->name('allow');
                Route::get('/payments/group-payments/open', "ActivistsPaymentsController\CreatePaymentsController@getListPaymentGroupOpen")->name('allow');
                Route::get('/payments/role-payment/download-excel', "ActivistsPaymentsController\ActivistRolePaymentController@downloadExcelFileBySearch")->name('allow');
                Route::put('/payments/activist-payment/{activistPaymentId}', 'ActivistsPaymentsController\ActivistPaymentController@update')->name('allow');
                Route::get('/payments/activist-payment/invalid', 'ActivistsPaymentsController\ActivistPaymentController@getRecurringActivistPayments')->name('allow');

                Route::put('/payments/activist-role-payment/{activistRolePaymentId}', "ActivistsPaymentsController\ActivistRolePaymentController@update")->name('allow');
            });
        });
    });
});
