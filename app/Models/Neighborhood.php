<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $mi_id
 * @property integer $area_id
 * @property integer $sub_area_id
 * @property integer $old_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class Neighborhood extends Model {

    public $primaryKey = 'id';

    protected $table = 'neighborhoods';
    
    public function scopeWithCitiesAndAreas($query) {
        $query->leftJoin('cities', function ( $joinOn ) {
                   $joinOn->on([['cities.id', '=', 'neighborhoods.city_id'], ['neighborhoods.deleted', '=', DB::raw(0)]]);
              })
              ->leftJoin('areas', function ( $joinOn ) {
                  $joinOn->on([['cities.area_id', '=', 'areas.id'], ['cities.deleted', '=', DB::raw(0)]]);
                })
              ->leftJoin('sub_areas', function ( $joinOn ) {
                  $joinOn->on([['cities.sub_area_id', '=', 'sub_areas.id'], ['cities.deleted', '=', DB::raw(0)]]);
                })
              ->leftJoin('sub_areas AS sub_area2', function ( $joinOn ) {
                  $joinOn->on([['cities.sub_area_id', '=', 'sub_area2.id'], ['cities.deleted', '=', DB::raw(0)]])
                         ->whereNull('cities.area_id');
                })
              ->leftJoin('areas AS area2', function ( $joinOn ) {
                  $joinOn->on([['sub_area2.area_id', '=', 'area2.id'], ['cities.deleted', '=', DB::raw(0)]])
                         ->whereNull('cities.area_id');
                })
              ->addSelect(
                  DB::raw('IF(neighborhoods.city_id IS NOT NULL,cities.id,cities.id) AS city_id'),
                  DB::raw('IF(neighborhoods.city_id IS NOT NULL,cities.name,cities.name) AS city_name'),
                  DB::raw('IF(cities.area_id IS NOT NULL,areas.id,area2.id) AS area_id'),
                  DB::raw('IF(cities.area_id IS NOT NULL,areas.name,area2.name) AS area_name'),
                  DB::raw('IF(cities.sub_area_id IS NOT NULL,sub_areas.id,sub_area2.id) AS sub_area_id'),
                  DB::raw('IF(cities.sub_area_id IS NOT NULL,sub_areas.name,sub_area2.name) AS sub_area_name'));
    }
	
	public function clusters() {
        return $this->hasMany('App\Models\Cluster', 'neighborhood_id', 'id')->orderBy('clusters.name');
    }

    public function scopeWithClusters($query, $isLeftJoin=false, $hot = false) {
        $tableName = ($hot)? "clusters_hot_counters as clusters" : "clusters";
        if($isLeftJoin){
            $query->leftJoin($tableName, 'clusters.neighborhood_id', '=', 'neighborhoods.id');
        }else{
            $query->join($tableName, 'clusters.neighborhood_id', '=', 'neighborhoods.id');
        }
    }
    
    public function scopeWithBallotBoxes($query, $isLeftJoin=false, $hot = false) {
        $tableName = ($hot)? "ballot_boxes_hot_counters as ballot_boxes" : "ballot_boxes";
        if($isLeftJoin){
            $query->leftJoin($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }else{
            $query->join($tableName, 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }
    }
}
