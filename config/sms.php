<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Sms Store
    |--------------------------------------------------------------------------
    |
    | This option controls the default sms connection that gets used while
    | using this sms library. This connection is used when another is
    | not explicitly specified when executing a given sms function.
    |
    | Supported: "telemessage", "log", "unicell"
    |
    */
	'default' => env('SMS_DRIVER', 'log'),

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
            'default' => [
                'username' => '',
                'password' => '',
            ],
            'telemarketing' => [
                'username' => '',
                'password' => '',
            ]
		],
		'telemessage' => [
            'default' => [
                'username' => env('TELE_SMS_USERNAME',''),
                'password' => env('TELE_SMS_PASSWORD',''),
            ],
            'telemarketing' => [
                'username' => env('TM_TELE_SMS_USERNAME',''),
                'password' => env('TM_TELE_SMS_PASSWORD',''),
            ]
		],
        'unicell' => [
            'default' => [
                'username' => env('UNICELL_SMS_USERNAME',''),
                'password' => env('UNICELL_SMS_PASSWORD',''),
            ],
            'telemarketing' => [
                'username' => env('TM_UNICELL_SMS_USERNAME',''),
                'password' => env('TM_UNICELL_SMS_PASSWORD',''),
            ]
        ],
        'paycall' => [
            'default' => [
                'username' => env('PAYCALL_SMS_USERNAME',''),
                'password' => env('PAYCALL_SMS_PASSWORD',''),
            ],
            'telemarketing' => [
                'username' => env('TM_PAYCALL_SMS_USERNAME',''),
                'password' => env('TM_PAYCALL_SMS_PASSWORD',''),
            ]
        ]
	]
];