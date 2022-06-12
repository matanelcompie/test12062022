<?php

namespace App\API\Ivr;

use Illuminate\Support\Facades\Facade;
use Auth;

/**
 * @see \Illuminate\Cache\CacheManager
 * @see \Illuminate\Cache\Repository
 */
class Ivr extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'ivr';
    }
}