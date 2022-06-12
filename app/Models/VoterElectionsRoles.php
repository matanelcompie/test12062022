<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property integer $election_campaign_id
 * @property integer $voter_id
 * @property integer $election_role_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class VoterElectionsRoles extends Model {

    public $primaryKey = 'id';
    protected $table = 'election_roles_by_voters';

    /**
     * @var array
     */
    protected $fillable = [ 'election_campaign_id',
                            'voter_id',
                            'election_role_id',
                            'created_at',
                            'updated_at' ];

    public function scopeWithCampaign ( $query ) {

        return $query->join( 'election_campaigns', 'election_campaigns.id', '=',
                             'election_roles_by_voters.election_campaign_id' );
    }

    public function scopeWithRole ( $query, $clean = false ) {

        if ( false == $clean ) {
            $query->join( 'election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id' );
        } else {
            $query->join( 'election_roles', function ( $joinOn ) {

                $joinOn->on( 'election_roles.id', '=', 'election_roles_by_voters.election_role_id' )/*=*/
                       ->on( 'election_roles.deleted', '=', DB::raw( 0 ) );
            } );
        }
    }

    public function scopeWithVoter ( $query ) {

        return $query->join( 'voters', 'voters.id', '=', 'election_roles_by_voters.voter_id' );
    }

    public function electionRolesGeographical () {

        return $this->hasMany( 'App\Models\ElectionRolesGeographical', 'election_role_by_voter_id', 'id' );
    }
    
    public function activistsAllocations() {
        return $this->hasMany( 'App\Models\ActivistsAllocations', 'election_role_by_voter_id', 'id' );
    }

    public function scopeWithGeographic ( $query ) {

        $query->join( 'election_role_by_voter_geographic_areas', 'election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'election_roles_by_voters.id' );
    }
}
