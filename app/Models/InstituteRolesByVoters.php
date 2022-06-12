<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstituteRolesByVoters extends Model {

    public $primaryKey = 'id';
    protected $table = 'institute_roles_by_voters';

    /**
     * @var array
     */
    protected $fillable = ['id', 'voter_id', 'institute_id', 'institute_role_id', 'created_at', 'updated_at'];

    public function scopeWithInstitutesRoles( $query ) {
        $query->join('institute_roles', 'institute_roles.id', '=', 'institute_roles_by_voters.institute_role_id');
    }

    public function scopeWithInstitutes ( $query ) {
        $query->join('institutes', 'institutes.id', '=', 'institute_roles_by_voters.institute_id')
              ->join('institute_types', 'institute_types.id', '=', 'institutes.institute_type_id')
              ->join('cities', 'cities.id', '=', 'institutes.city_id')
              ->join('institute_groups', 'institute_groups.id', '=', 'institute_types.institute_group_id');
    }
	
	public function scopeWithFullInstitutes ( $query ) {
        $query->join('institute_roles', 'institute_roles.id', '=', 'institute_roles_by_voters.institute_role_id')
		      ->leftJoin('institutes', 'institutes.id', '=', 'institute_roles_by_voters.institute_id')
              ->leftJoin('institute_types', 'institute_types.id', '=', 'institutes.institute_type_id')
              ->leftJoin('cities', 'cities.id', '=', 'institutes.city_id')
              ->leftJoin('institute_groups', 'institute_groups.id', '=', 'institute_types.institute_group_id')
			  ->leftJoin('institute_networks', 'institute_networks.id', '=', 'institutes.institute_network_id');
    }

    public function scopeWithInstitutesNetworks ( $query ) {
        $query->leftJoin('institute_networks', 'institute_networks.id', '=', 'institutes.institute_network_id');
    }
}
