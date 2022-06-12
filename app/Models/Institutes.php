<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string $key
 * @property string $name
 * @property integer $institute_type_id
 * @property integer $institute_network_id
 * @property integer $city_id
 * @property boolean $deleted
 * @property string $created_at
 * @property string $updated_at
 */
class Institutes extends Model {

    public $primaryKey = 'id';
    protected $table = 'institutes';

    /**
     * @var array
     */
    protected $fillable = ['key', 'name', 'institute_type_id', 'institute_network_id', 'city_id', 'deleted', 'created_at', 'updated_at'];

    public function scopeWithType($query) {
        $query->join('institute_types', 'institutes.institute_type_id', '=', 'institute_types.id');
    }

    public function scopeWithTypeGroup($query) {
        $query->join('institute_types AS typeGroup', function ( $joinOn ) {
            $joinOn->on('institutes.institute_type_id', '=', 'typeGroup.id');
        })->join('institute_groups', function ( $joinOn ) {
            $joinOn->on('typeGroup.institute_group_id', '=', 'institute_groups.id');
        });
    }

	
    public function scopeWithNetwork($query) {
        $query->leftJoin('institute_networks', 'institutes.institute_network_id', '=', 'institute_networks.id');
    }
	
	//with regular join - without nulled data
	public function scopeWithStrictNetwork($query) {
        $query->join('institute_networks', 'institutes.institute_network_id', '=', 'institute_networks.id');
    }

    public function scopeWithCity($query) {
        $query->join('cities', 'institutes.city_id', '=', 'cities.id');
    }

}
