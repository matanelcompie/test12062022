<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/*
 * @property integer $id
 * @property string  $key
 * @property integer $voter_id
 * @property integer $city_id
 * @property integer $shas_representative_role_id
 * @property date $start_date
 * @property date $end_date
 * @property boolean $deleted
 * @property integer $created_at
 * @property integer $updated_at
 */

class ShasRepresentative extends Model {

    public $primaryKey = 'id';

    protected $table = 'shas_representatives';

    public function roles() {
        return $this->hasMany( 'App\Models\ShasRepresentativeRoles', 'shas_representative_role_id', 'id' );
    }

    public function voters() {
        return $this->belongsToMany( 'App\Models\Voters', 'voter_id');
    }

    public function scopeWithRoles( $query ) {
        $query->join( 'shas_representative_roles', 'shas_representative_roles.id', '=',
                      'shas_representatives.shas_representative_role_id' );
    }

    public function scopeWithCities( $query ) {
        $query->join( 'cities', 'cities.id', '=', 'shas_representatives.city_id' );
    }
}