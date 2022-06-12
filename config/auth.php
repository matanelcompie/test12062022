<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | This option controls the default authentication "guard" and password
    | reset options for your application. You may change these defaults
    | as required, but they're a perfect start for most applications.
    |
    */

    'defaults' => [ 'guard'     => 'web',
                    'passwords' => 'users', ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Next, you may define every authentication guard for your application.
    | Of course, a great default configuration has been defined for you
    | here which uses session storage and the Eloquent user provider.
    |
    | All authentication drivers have a user provider. This defines how the
    | users are actually retrieved out of your database or other storage
    | mechanisms used by this application to persist your user's data.
    |
    | Supported: "session", "token"
    |
    */

    'guards' => [ 
                    'web' => [ 'driver'   => 'session',
                             'provider' => 'users', 
                            ],

                    'api' => [ 'driver'   => 'shas_token',
                             'provider' => 'external_users', 
                            ], 
                    'activists_api' => [ 'driver'   => 'activist_token',
                             'provider' => 'activist_users', 
                            ], 
                ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | All authentication drivers have a user provider. This defines how the
    | users are actually retrieved out of your database or other storage
    | mechanisms used by this application to persist your user's data.
    |
    | If you have multiple user tables or models you may configure multiple
    | sources which represent each model / table. These sources may then
    | be assigned to any extra authentication guards you have defined.
    |
    | Supported: "database", "eloquent"
    |
    */

    'providers' => [ 'users' => [ 'driver' => 'shas_provider',
                                  'model'  => App\Models\User::class, ],
                     'external_users' => [ 'driver' => 'external_provider',
                                  'model'  => App\Models\ExternalUser::class, ],
                     'activist_users' => [ 'driver' => 'activist_provider',
                                  'model'  => App\Models\User::class, ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | You may specify multiple password reset configurations if you have more
    | than one user table or model in the application and you want to have
    | separate password reset settings based on the specific user types.
    |
    | The expire time is the number of minutes that the reset token should be
    | considered valid. This security feature keeps tokens short-lived so
    | they have less time to be guessed. You may change this as needed.
    |
    */

    'passwords' => [ 'users' => [ 'provider' => 'users',
                                  'table'    => 'password_resets',
                                  'expire'   => 60, ], ],

     /*
    |--------------------------------------------------------------------------
    | Expiration dates
    |--------------------------------------------------------------------------
    |
    | Here you may define the password expiration in days 
    | and sms code expiration in minutes
    |
    */                                 
    'password_expiration_days' =>  env( 'PASSWORD_EXPIRATION_DAYS', 120 ),
    'sms_code_expiration_minutes' => env( 'SMS_CODE_EXPIRATION_MINUTES', 10 ),

    //header paramter to store/retrieve the token
    'header_token_key' => 'Auth-token',
    //query string key to retrieve the token
    'query_token_key' => 'token',
];
