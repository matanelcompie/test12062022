<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Ivr Store
    |--------------------------------------------------------------------------
    |
    | This option controls the default ivr connection that gets used while
    | using this ivr library. This connection is used when another is
    | not explicitly specified when executing a given sms function.
    |
    | Supported: "log", "progheart"
    |
    */
	'default' => env('IVR_DRIVER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Sms Stores
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the SMS "stores" for your application. 
    |
    */
	'stores' => [

		'log' => [
            'numbers' => [
                'default' => env('IVR_NUMBER_DEFAULT','0555555555'),
            ]
		],
		'progheart' => [
			'username' => env('IVR_USERNAME','username'),
			'password' => env('IVR_PASSWORD',''),
            'numbers' => [
                'default' => env('IVR_NUMBER_DEFAULT','0555555555'),
                'activist_verification' => env('IVR_NUMBER_ACTIVIST_VERIFICATION','0555555555'),
                'vote_reporting' => env('IVR_NUMBER_VOTE_REPORTING','0555555555'),

            ]
        ],
        'localDialer' => [
            'numbers' => [
                'default' => env('IVR_NUMBER_DEFAULT','0555555555'),
                'activist_verification' => env('IVR_NUMBER_ACTIVIST_VERIFICATION','0555555555'),
                'vote_reporting' => env('IVR_NUMBER_VOTE_REPORTING','0555555555'),
            ]
        ]
	]
];