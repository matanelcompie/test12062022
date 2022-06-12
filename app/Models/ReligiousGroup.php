<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReligiousGroup extends Model {

    public $primaryKey = 'id';
    protected $table = 'religious_groups';

    protected static $ModelList=null;
    protected static $HashModelList=null;

    public static function getHashList(){
        
        if(is_null(self::$HashModelList))
        {
            $ReligiousGroup=self::getList();
            $hash=array();
            foreach ($ReligiousGroup as $key => $re) {
                $hash[$re->id]=$re;
            }
            self::$HashModelList= $hash;
        }
      //  Log::info(json_encode(self::$HashModelList));
        return self::$HashModelList;

    }

    public static function getList(){
        if(is_null(self::$ModelList))
        self::$ModelList=ReligiousGroup::select()->get();

        return self::$ModelList;
    }
}
