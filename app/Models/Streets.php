<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property integer $city_id
 * @property integer $old_id
 * @property integer $mi_id
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class Streets extends Model {

    public $primaryKey = 'id';
    protected $table = 'streets';
    protected static $ModelList=null;
    protected static $HashModelList=null;

    /**
     * @var array
     */
    protected $fillable = ['key', 'name', 'city_id', 'old_id', 'mi_id', 'deleted', 'created_at', 'updated_at'];

    public static function getHashList(){
        
        if(is_null(self::$HashModelList))
        {
            $Streets=self::getList();
            $hash=array();
            foreach ($Streets as $key => $Street) {
                $hash[$Street->id]=$Street;
            }
            self::$HashModelList= $hash;
        }
      //  Log::info(json_encode(self::$HashModelList));
        return self::$HashModelList;

    }

    public static function getList(){
        if(is_null(self::$ModelList))
        self::$ModelList=Streets::select()->get();

        return self::$ModelList;
    }

}
