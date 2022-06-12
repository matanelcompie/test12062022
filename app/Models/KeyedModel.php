<?php

namespace App\Models;


use App\Libraries\Helper;
use App\Traits\DynamicHiddenVisible;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class KeyedModel extends Model
{
    use DynamicHiddenVisible;
    
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model)
        {
            $keyLength = DB::connection()->getDoctrineColumn($model->table, 'key')->getLength();
            $model->attributes['key'] = Helper::getNewTableKey($model->table, $keyLength);
        });
    }

    public static function findByKey($key)
    {
        return static::where('key', $key)->first();
    }
}