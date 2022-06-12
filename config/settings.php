<?php

return [
	/* ----------------------------------------
	| Minimal days between requests
	| -----------------------------------------
	| if a new request is created less the the specified
	| a modal window appears to ask if the user is sure he wants to create another one
	*/
	'minimum_days_between_requests' => env( 'SETTINGS_MIN_DAYS_BETWEEN_REQUESTS', 4),

	/* ----------------------------------------
	| Show system errors
	| -----------------------------------------
	| show the errors created by laravel in a modal window
	*/	
	'show_system_errors' => env( 'SETTINGS_SHAS_SYSTEM_ERRORS', true),

	/* ----------------------------------------
	| Send new user email
	| -----------------------------------------
	| When creating a new user it send the user an email with his password
	*/		
	'send_new_user_email' => env( 'SETTINGS_SEND_NEW_USER_EMAIL', true),

	/* ----------------------------------------
	| Max file upload size
	| -----------------------------------------
	| The maximum file size that can be uploaded to the system, in MB
	*/		
	'max_upload_size' => env( 'MAX_UPLOAD_SIZE', "15MB"),

	/* ----------------------------------------
	| Send request email
	| -----------------------------------------
	| Send email details to the voter of a ne, transfered or closed request
	*/
	'send_request_email' => env('SETTINGS_SEND_REQUEST_EMAIL', false),

	/* ----------------------------------------
	| Settings returned to UI 
	| -----------------------------------------
	| A list of settings that are returned to the UI via /api/system/settings route
	*/
	'ui_settings' => [
		'minimum_days_between_requests',
		'show_system_errors',
		'max_upload_size',
	],

    /* ----------------------------------------
	| Send delayed sms to activist
	| -----------------------------------------
	| The hour of sending a delayed sms to acitivit.
	*/
    'send_activist_sms_hour' => 10,
];