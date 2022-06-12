<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property integer $area_id
 * @property integer $old_id
 * @property string $created_at
 * @property string $updated_at
 */
class SubArea extends Model {

    public $primaryKey = 'id';
    protected $table = 'sub_areas';

    /**
     * @var array
     */
    protected $fillable = ['key', 'name', 'area_id', 'old_id', 'created_at', 'updated_at'];

	public function subAreasListForSectorialFilter($area_id) {
    	 $query = $this->newQuery();
    	 return $query->select("id" , "key", "name")->where('area_id' , '=' , $area_id)->orderBy("name", "DESC")->get();
    }
    public function cities() {
        return $this->hasMany( 'App\Models\City' ,  'sub_area_id' , 'id');
    }
    public function scopeWithCities($query, $isLeftJoin = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('cities', 'cities.sub_area_id', '=', 'sub_areas.id');
    }
    public function scopeWithAreas($query, $isLeftJoin = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('areas', 'areas.id', '=', 'sub_areas.area_id');
    }

    public function scopeWithClusters($query, $isLeftJoin = false, $hot = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $tableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
        $query->$joinMethod($tableName, 'cities.id', '=', 'clusters.city_id');
    }
    public function scopeWithBallotBoxes($query, $isLeftJoin = false, $hot = false) {
        $joinMethod = $isLeftJoin ? 'leftJoin' : 'join';
        $tableName = ($hot)? "ballot_boxes_hot_counters as ballot_boxes" : "ballot_boxes";
        $query->$joinMethod($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
    }
}
