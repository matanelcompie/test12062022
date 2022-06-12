<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class GeographicFilters extends Model {

    public $primaryKey = 'id';

    protected $table = 'geographic_filters';

    public function scopeWithRoles($query) {
        $query->join('roles_by_users', 'roles_by_users.id', '=', 'geographic_filters.role_by_user_id');
    }

    public function scopeWithBallotBoxes($query) {
        $query->leftJoin('ballot_boxes', function ( $joinOn ) {
            $joinOn->on([
                         ['ballot_boxes.id', '=', 'geographic_filters.entity_id'],
                         ['geographic_filters.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))]
                       ]);
        });
    }

    public function scopeWithClusters($query) {
        $sql = "CASE 
                WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')) .
               " THEN geographic_filters.entity_id
                WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')) .
               " THEN ballot_boxes.cluster_id
                END";
        $query->leftJoin('clusters', 'clusters.id', '=', DB::raw($sql));
    }

    public function scopeWithNeighborhoods($query) {
        $query->leftJoin('neighborhoods', function ( $joinOn ) {
            $joinOn->on([
                ['neighborhoods.id', '=', 'geographic_filters.entity_id'],
                ['geographic_filters.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'))]
            ]);
        });
    }

    public function scopeWithCities($query) {
        $sql = "CASE
                 WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA')) .
               " THEN cities.sub_area_id
                 WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY')) .
               " THEN geographic_filters.entity_id
                 WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD')) .
               " THEN neighborhoods.city_id
                 WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER')) .
               " OR geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX')) .
               " THEN clusters.city_id
                END";
        $query->leftJoin('cities', 'cities.id', '=', DB::raw($sql));
    }

    public function scopeWithSubAreas($query) {

        $sql = "CASE 
          WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA')) .
        " THEN geographic_filters.entity_id
          ELSE cities.sub_area_id
        END";
      $query->leftJoin('sub_areas', 'sub_areas.id', '=', DB::raw($sql));
    }

    public function scopeWithAreas($query) {
        $sql = "CASE 
                 WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA')) .
               " THEN geographic_filters.entity_id
                 WHEN geographic_filters.entity_type = " . DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA')) .
               " THEN sub_areas.area_id
                 ELSE (
                   CASE
                     WHEN cities.sub_area_id IS NOT NULL
                     THEN sub_areas.area_id
                     ELSE cities.area_id
                   END
                 )
                END";
        $query->leftJoin('areas', 'areas.id', '=', DB::raw($sql));
    }
}