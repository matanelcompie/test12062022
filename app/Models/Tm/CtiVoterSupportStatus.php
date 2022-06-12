<?php

namespace App\Models\Tm;


use App\Libraries\Helper;
use App\Models\VoterSupportStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CtiVoterSupportStatus extends VoterSupportStatus
{
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model)
        {
            $keyLength = DB::connection()->getDoctrineColumn($model->table, 'key')->getLength();
            $model->attributes['key'] = Helper::getNewTableKey($model->table, $keyLength);
            $model->create_user_id = Auth::user()->id;
        });
    }
    public static function findByKey($key)
    {
        return static::where('key', $key)->firstOrFail();
    }

}