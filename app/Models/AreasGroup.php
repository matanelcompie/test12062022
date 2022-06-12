<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property string  $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class AreasGroup extends Model {

    public $primaryKey = 'id';

    protected $table = 'areas_groups';

    public function areas() {
        return $this->hasMany('App\Models\Area');
    }
    public static function getAllAreas($areasGroupId){
        $areas = Area::select('id')->where('areas_group_id', $areasGroupId)->where('deleted', 0)->get();
        $areaIdList = [];
        if(!empty($areas)){
            foreach($areas as $area){
                $areaIdList[] = $area->id;
            }
        }

        return $areaIdList;
    }
}