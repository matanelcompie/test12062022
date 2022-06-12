<?php


return [

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Secret
    |--------------------------------------------------------------------------
    |
    | Don't forget to set this, as it will be used to sign your tokens.
    |
    */

    'secret' => env('JWT_SECRET', 'my secret'),

    //header paramter to store/retrieve the token
    'header' => 'Auth-token',
    'token' => 'activist-auth-token',

];