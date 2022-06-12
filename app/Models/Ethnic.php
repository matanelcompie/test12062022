<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ethnic extends Model {

    public $primaryKey = 'id';
    protected $table = 'ethnic_groups';

    protected static $ModelList=null;
    protected static $HashModelList=null;

    public static function getHashList(){
        
        if(is_null(self::$HashModelList))
        {
            $Ethnics=self::getList();
            $hash=array();
            foreach ($Ethnics as $key => $Ethnic) {
                $hash[$Ethnic->id]=$Ethnic;
            }
            self::$HashModelList= $hash;
        }
      //  Log::info(json_encode(self::$HashModelList));
        return self::$HashModelList;

    }

    public static function getList(){
        if(is_null(self::$ModelList))
        self::$ModelList=Ethnic::select()->get();

        return self::$ModelList;
    }



}
