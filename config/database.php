<?php

use App\Libraries\Helper;

//list if DB hosts for reading
$dbHosts = [
    1 => env( 'DB_HOST', '10.192.138.2' ),
    2 => env( 'DB_SLAVE1_HOST', env( 'DB_HOST', '10.192.138.2' ) ),
    3 => env( 'DB_SLAVE2_HOST', env( 'DB_HOST', '10.192.138.2' ) )
];

//random with weights for DB host selection
$dbRand = [
    1 => env('DB_HOST_WEIGHT', 34),
    2 => env('DB_SLAVE1_HOST_WEIGHT', 33),
    3 => env('DB_SLAVE2_HOST_WEIGHT', 33)
];

return [

    /*
    |--------------------------------------------------------------------------
    | PDO Fetch Style
    |--------------------------------------------------------------------------
    |
    | By default, database results will be returned as instances of the PHP
    | stdClass object; however, you may desire to retrieve records in an
    | array format for simplicity. Here you can tweak the fetch style.
    |
    */

    'fetch' => PDO::FETCH_OBJ,

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for all database work. Of course
    | you may use many connections at once using the Database library.
    |
    */

    'default' => env( 'DB_CONNECTION', 'mysql' ),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the database connections setup for your application.
    | Of course, examples of configuring each database platform that is
    | supported by Laravel is shown below to make development simple.
    |
    |
    | All database work in Laravel is done through the PHP PDO facilities
    | so make sure you have the driver for your particular database of
    | choice installed on your machine before you begin development.
    |
    */

    'connections' => [

        'sqlite' => [ 'driver'   => 'sqlite',
                      'database' => env( 'DB_DATABASE', database_path( 'database.sqlite' ) ),
                      'prefix'   => '', ],

        'mysql' => [ 'driver'    => 'mysql',
                    'read' => [
                        'host' => $dbHosts[Helper::randWeight($dbRand)],
                    ],
                    'write' => [
                        'host' => env( 'DB_HOST', '10.192.138.2' ),
                    ],
                     'host'      => env( 'DB_HOST', '10.192.138.2' ),
                     'port'      => env( 'DB_PORT', '3306' ),
                     'database'  => env( 'DB_DATABASE', 'shas_elections_dev' ),
                     'username'  => env( 'DB_USERNAME', 'root' ),
                     'password'  => env( 'DB_PASSWORD', 'TrhVax1214^' ),
                     'charset'   => 'utf8',
                     'collation' => 'utf8_unicode_ci',
                     'prefix'    => '',
                     /*'strict'    => true,*/
                     'modes'     => [ /*'ONLY_FULL_GROUP_BY',*/
                                     'STRICT_TRANS_TABLES',
                                     'NO_ZERO_IN_DATE',
                                     'NO_ZERO_DATE',
                                     'ERROR_FOR_DIVISION_BY_ZERO',
                                     'NO_AUTO_CREATE_USER',
                                     'NO_ENGINE_SUBSTITUTION'
                                    ],
                     'engine'    => null,
        ],
        'master' => [ 'driver'    => 'mysql',
                     'host'      => env( 'DB_HOST', env( 'DB_HOST', '10.192.138.3' ) ),
                     'port'      => env( 'DB_PORT', '3306' ),
                     'database'  => env( 'DB_DATABASE', env( 'DB_DATABASE', 'shas_muni_2018_second' ) ),
                     'username'  => env( 'DB_USERNAME', 'root' ),
                     'password'  => env( 'DB_PASSWORD', 'TrhVax1214^' ),
                     'charset'   => 'utf8',
                     'collation' => 'utf8_unicode_ci',
                     'prefix'    => '',
                     /*'strict'    => true,*/
                     'modes'     => [ /*'ONLY_FULL_GROUP_BY',*/
                                     'STRICT_TRANS_TABLES',
                                     'NO_ZERO_IN_DATE',
                                     'NO_ZERO_DATE',
                                     'ERROR_FOR_DIVISION_BY_ZERO',
                                     'NO_AUTO_CREATE_USER',
                                     'NO_ENGINE_SUBSTITUTION'
                                    ],
                     'engine'    => null,
        ],
        'slave1' => [ 'driver'    => 'mysql',
                     'host'      => env( 'DB_SLAVE1_HOST', env( 'DB_HOST', '10.192.138.3' ) ),
                     'port'      => env( 'DB_PORT', '3306' ),
                     'database'  => env( 'DB_SLAVE1_DATABASE', env( 'DB_DATABASE', 'shas_muni_2018_second' ) ),
                     'username'  => env( 'DB_USERNAME', 'root' ),
                     'password'  => env( 'DB_PASSWORD', 'TrhVax1214^' ),
                     'charset'   => 'utf8',
                     'collation' => 'utf8_unicode_ci',
                     'prefix'    => '',
                     /*'strict'    => true,*/
                     'modes'     => [ /*'ONLY_FULL_GROUP_BY',*/
                                     'STRICT_TRANS_TABLES',
                                     'NO_ZERO_IN_DATE',
                                     'NO_ZERO_DATE',
                                     'ERROR_FOR_DIVISION_BY_ZERO',
                                     'NO_AUTO_CREATE_USER',
                                     'NO_ENGINE_SUBSTITUTION'
                                    ],
                     'engine'    => null,
        ],
        'slave2' => [ 'driver'    => 'mysql',
                     'host'      => env( 'DB_SLAVE2_HOST', env( 'DB_HOST', '10.192.138.3' ) ),
                     'port'      => env( 'DB_PORT', '3306' ),
                     'database'  => env( 'DB_SLAVE2_DATABASE', env( 'DB_DATABASE', 'shas_muni_2018_second' ) ),
                     'username'  => env( 'DB_USERNAME', 'root' ),
                     'password'  => env( 'DB_PASSWORD', 'TrhVax1214^' ),
                     'charset'   => 'utf8',
                     'collation' => 'utf8_unicode_ci',
                     'prefix'    => '',
                     /*'strict'    => true,*/
                     'modes'     => [ /*'ONLY_FULL_GROUP_BY',*/
                                     'STRICT_TRANS_TABLES',
                                     'NO_ZERO_IN_DATE',
                                     'NO_ZERO_DATE',
                                     'ERROR_FOR_DIVISION_BY_ZERO',
                                     'NO_AUTO_CREATE_USER',
                                     'NO_ENGINE_SUBSTITUTION'
                                    ],
                     'engine'    => null,
        ],        
    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run in the database.
    |
    */

    'migrations' => 'migrations',

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer set of commands than a typical key-value systems
    | such as APC or Memcached. Laravel makes it easy to dig right in.
    |
    */

    'redis' => [

        'cluster' => false,

        'default' => [ 'host'     => env( 'REDIS_HOST', 'localhost' ),
                       'password' => env( 'REDIS_PASSWORD', null ),
                       'port'     => env( 'REDIS_PORT', 6379 ),
                       'database' => env( 'REDIS_DATABASE', 0 ), ],
        //connection for redis session
        'session' => [ 'host'     => env( 'REDIS_HOST', 'localhost' ),
                       'password' => env( 'REDIS_PASSWORD', null ),
                       'port'     => env( 'REDIS_PORT', 6379 ),
                       'database' => env( 'REDIS_CACHE_DATABASE', 1 ), ],  
        'external_votes' => [ 'host'     => env( 'REDIS_VOTES_HOST', 'localhost' ),
                       'password' => env( 'REDIS_VOTES_PASSWORD', null ),
                       'port'     => env( 'REDIS_VOTES_PORT', 6379 ),
                       'database' => env( 'REDIS_VOTES_DATABASE', 1 ), ],  

    ],

];
