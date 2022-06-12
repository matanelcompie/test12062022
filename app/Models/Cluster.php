<?php

namespace App\Models;

use App\Enums\ElectionRoleSystemName;
use App\Repositories\ElectionRolesRepository;
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

class Cluster extends Model {
    public $primaryKey = 'id';
    protected $table = 'clusters';

    /**
     * getClusterFullNameQuery
     * Get select query for cluster full name (with prefix)
     * @param string $varName - alias name for select column alias
     * @param boolean $withConcat - Whether to include the "CONCAT"
     * -> need to be false if you want to had more details to "CONCAT".
     * @param string $table - cluster table 
     * ->This parameter can alias name for clusters table.
     * @return string - the select query for - cluster full name.
     */
    public static function getClusterFullNameQuery($varName = 'cluster_name', $withConcat = true, $table = 'clusters') {
        $query = " IFNULL($table.prefix,'') ,IF((IsNull($table.prefix) OR $table.prefix = '') ,'',' - '), $table.name "; 
        // Select query for get full cluster name (with prefix) in the format : prefix - name 
        if($withConcat){
         $query = "CONCAT($query) ";
            if(!empty($varName)){$query.=" AS $varName";}
        }
        return $query;
    }
    public function clustersListForSectorialFilter($city_id) {
        $query = $this->newQuery();
        return $query->select("id", "key", "name")->where('city_id', '=', $city_id)->orderBy("name", "DESC")->get();
    }

    public function scopeWithCity($query) {
        $query->join('cities', 'cities.id', '=', 'clusters.city_id');
    }
    public function scopeWithStreet($query) {
        $query->leftJoin('streets', 'streets.id', '=', 'clusters.street_id');
    }

    public function scopeWithLastCluster($query, $last_campaign_id) {
        $query->leftJoin('clusters as current_cluster', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['current_cluster.mi_id', '=', 'clusters.mi_id'],
                ['current_cluster.city_id', '=', 'clusters.city_id'],
                ['current_cluster.election_campaign_id', '=', DB::raw($last_campaign_id)]]);
        });
    }
    public function scopeWithNeighborhood($query, $isLeftJoin=false) {
        if($isLeftJoin){
            $query->leftJoin('neighborhoods', 'clusters.neighborhood_id', '=', 'neighborhoods.id');
        }else{
            $query->join('neighborhoods', 'clusters.neighborhood_id', '=', 'neighborhoods.id');
        }
    }
    public function scopeWithLeader($query, $leftJoin = true)
    {
        $clusterRole = ElectionRolesRepository::getBySystemName(ElectionRoleSystemName::CLUSTER_LEADER);
        $this->scopeWithActivistsAllocations($query, $leftJoin);
        $this->scopeWithActivistsAllocationsAssignment($query, $leftJoin);
        $this->scopeWithElectionsRolesByVoters($query, $leftJoin);
        if ($leftJoin) {
            $query->leftJoin('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
            ->addSelect(['personal_identity as leader_personal_identity', 'first_name as leader_first_name', 'last_name as leader_last_name']);
        } else {
            $query->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id');
        }
        $query->where(
            function ($query) use ($clusterRole) {
                $query->whereNull('activists_allocations.election_role_id')
                ->orWhere('activists_allocations.election_role_id', '=', DB::raw($clusterRole->id));
            }
        );
    }

    public function scopeWithMotivator($query, $leftJoin = true)
    {
        $motivatorRole = ElectionRolesRepository::getBySystemName(ElectionRoleSystemName::MOTIVATOR);
        $this->scopeWithActivistsAllocations($query, $leftJoin);
        $this->scopeWithActivistsAllocationsAssignment($query, $leftJoin);
        $this->scopeWithElectionsRolesByVoters($query, $leftJoin);

        $query->where(
            function ($query) use ($motivatorRole) {
                $query->whereNull('activists_allocations.election_role_id')
                ->orWhere('activists_allocations.election_role_id', '=', DB::raw($motivatorRole->id));
            }
        );
    }

    public function scopeWithDriver($query, $leftJoin = true)
    {
        $driverRole = ElectionRolesRepository::getBySystemName(ElectionRoleSystemName::DRIVER);
        $this->scopeWithActivistsAllocations($query, $leftJoin);
        $this->scopeWithActivistsAllocationsAssignment($query, $leftJoin);
        $this->scopeWithElectionsRolesByVoters($query, $leftJoin);

        $query->where(
            function ($query) use ($driverRole) {
                $query->whereNull('activists_allocations.election_role_id')
                ->orWhere('activists_allocations.election_role_id', '=', DB::raw($driverRole->id));
            }
        )
        ->leftJoin('voter_transportations', 'voter_transportations.voter_driver_id', '=', 'election_roles_by_voters.voter_id')
        ->leftJoin('voter_transportations as voter_transportations_crippled', function ( $joinOn ) {
            $joinOn->on([
                ['voter_transportations_crippled.voter_driver_id', '=', 'election_roles_by_voters.voter_id'],
                ['voter_transportations_crippled.cripple', '=', DB::raw(1)]
            ]);
        });
    }

    public function scopeWithLeaderCity($query, $leftJoin = false) {
        if ($leftJoin) {
            $query->leftJoin('cities as leader_cities', 'leader_cities.id', '=', 'voters.city_id');
        } else {
            $query->join('cities as leader_cities', 'leader_cities.id', '=', 'voters.city_id');
        }
    }

    public function scopeWithArea($query, $leftJoin = false) {
        if ($leftJoin) {
            $query->leftJoin('areas', 'areas.id', '=', 'cities.area_id');
        } else {
            $query->join('areas', 'areas.id', '=', 'cities.area_id');
        }
    }
    public function scopeWithBallotBoxesAndListPartyVotes($query) {
        $query->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
              ->join('election_campaign_party_list_votes', 'election_campaign_party_list_votes.ballot_box_id', '=', 'ballot_boxes.id')
              ->join('election_campaign_party_lists', 'election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id')
         ;
    }

    public function ballotBoxes(){
        return $this->hasMany( 'App\Models\BallotBox' ,  'cluster_id' , 'id');
    }

    //TODO::remove after finish arrange
    public function scopeWithDriversGeographicAreas($query, $last_campaign_id) {
        $query->leftJoin('election_role_by_voter_geographic_areas', function ( $joinOn ) {
            $joinOn->on([
                ['clusters.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
                ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'))]
            ]);
        })
        ->leftJoin('election_roles_by_voters', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id'],
                ['election_roles_by_voters.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->leftJoin('election_roles', function ( $joinOn ) {
            $joinOn->on([
                ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
                ['election_roles.system_name', '=', DB::raw('"' . config('constants.activists.election_role_system_names.driver') . '"')]
            ]);
        })
        ->leftJoin('voter_transportations', 'voter_transportations.voter_driver_id', '=', 'election_roles_by_voters.voter_id')
        ->leftJoin('voter_transportations as voter_transportations_crippled', function ( $joinOn ) {
            $joinOn->on([
                ['voter_transportations_crippled.voter_driver_id', '=', 'election_roles_by_voters.voter_id'],
                ['voter_transportations_crippled.cripple', '=', DB::raw(1)]
            ]);
        });
    }

    public function scopeWithTransportation($query, $last_campaign_id, $voter_driver_id) {
        $query->leftJoin('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id')
              ->leftJoin('voters_in_election_campaigns', function ( $joinOn ) use ($last_campaign_id) {
                  $joinOn->on([
                      ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                      ['voters_in_election_campaigns.election_campaign_id', '=', DB::raw($last_campaign_id)]
                  ]);
              })
              ->leftJoin('voter_transportations', function ( $joinOn ) use ($voter_driver_id) {
                   $joinOn->on([
                      ['voter_transportations.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                      ['voter_transportations.voter_driver_id', '=', DB::raw($voter_driver_id)]
                   ]);
              });
    }

    public function scopeWithBallotBoxVoterElectionCampaignVotersSupportStatuses($query) {
        $query->join( 'ballot_boxes' ,  'ballot_boxes.cluster_id' ,'=', 'clusters.id')
              ->join('voters_in_election_campaigns', 'voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id')
              ->join('voter_support_status', function($query2) {
                $query2->on('voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id')
                        ->on('voter_support_status.election_campaign_id', '=', 'clusters.election_campaign_id');
                })
              ->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        ;
    }

    public function scopeWithBallotBoxes($query){
        $query->join( 'ballot_boxes' ,  'ballot_boxes.cluster_id' ,'=', 'clusters.id');
    }
    public function scopeWithQuarter($query){
        $query->leftJoin( 'quarters' ,  'quarters.id' ,'=', 'clusters.quarter_id');
    }

    public function scopeWithSupportStatusChange($query) {
        $query->join('voters_in_election_campaigns', function ( $joinOn ) {
            $joinOn->on([
                ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
            ]);
        })
            ->join('voter_support_status', function ( $joinOn ) {
                $joinOn->on([
                    ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                    ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id']
                ]);
            })
            ->join('action_history', function ( $joinOn ) {
                $referencedModel = 'VoterSupportStatus';

                $joinOn->on([
                    ['action_history.referenced_id', '=', 'voter_support_status.id'],
                    ['action_history.referenced_model', '=',  DB::raw('"'. $referencedModel . '"')]
                ]);
            })
            ->join('action_history_details', function ( $joinOn ) {
                $fieldName = 'support_status_id';

                $joinOn->on([
                    ['action_history_details.action_history_id', '=', 'action_history.id'],
                    ['action_history_details.field_name', '=',  DB::raw('"'. $fieldName . '"')]
                ]);
            });
    }

    public function scopeWithShasVotes($query, $is_ballot_strictly_orthodox) {
        if (1 == $is_ballot_strictly_orthodox ) {
            $query ->join('ballot_boxes', function ( $joinOn ) use ($is_ballot_strictly_orthodox) {
                $joinOn->on([
                    ['ballot_boxes.cluster_id', '=', 'clusters.id'],
                    ['ballot_boxes.strictly_orthodox', '=', DB::raw(1)]
                ]);
            });
        } else {
            $query->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }
        $query->join('election_campaign_party_list_votes', 'election_campaign_party_list_votes.ballot_box_id', '=', 'ballot_boxes.id')
            ->join('election_campaign_party_lists', function ( $joinOn ) {
                $joinOn->on([
                    ['election_campaign_party_lists.id', '=', 'election_campaign_party_list_votes.election_campaign_party_list_id'],
                    ['election_campaign_party_lists.shas', '=',  DB::raw(1)],
                    ['election_campaign_party_lists.deleted', '=', DB::raw(0)]
                ]);
            });
    }

    /**
     * This function gets the support status
     * of type final of voters in clusters.
     *
     * @param $query
     * @param $is_ballot_strictly_orthodox
     */
    public function scopeWithSupportStatus($query, $is_ballot_strictly_orthodox) {
        if (1 == $is_ballot_strictly_orthodox ) {
            $query ->leftJoin('ballot_boxes', function ( $joinOn ) use ($is_ballot_strictly_orthodox) {
                $joinOn->on([
                    ['ballot_boxes.cluster_id', '=', 'clusters.id'],
                    ['ballot_boxes.strictly_orthodox', '=', DB::raw(1)]
                ]);
            });
        } else {
            $query->leftJoin('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }

        $query->leftJoin('voters_in_election_campaigns', function ( $joinOn ) {
            $joinOn->on([
                ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id'],
            ]);
        })
            ->leftJoin('voter_support_status', function ( $joinOn ) {
                $joinOn->on([
                    ['voter_support_status.voter_id', '=', 'voters_in_election_campaigns.voter_id'],
                    ['voter_support_status.election_campaign_id', '=', 'voters_in_election_campaigns.election_campaign_id'],
                    ['voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))]
                ]);
            });
    }

    public function scopeWithCurrentElectionVotes($query, $is_ballot_strictly_orthodox, $last_campaign_id) {
        if (1 == $is_ballot_strictly_orthodox ) {
            $query ->join('ballot_boxes as ballot_boxes', function ( $joinOn ) use ($is_ballot_strictly_orthodox) {
                $joinOn->on([
                    ['ballot_boxes.cluster_id', '=', 'clusters.id'],
                    ['ballot_boxes.strictly_orthodox', '=', DB::raw(1)]
                ]);
            });
        } else {
            $query->join('ballot_boxes', 'ballot_boxes.cluster_id', '=', 'clusters.id');
        }

        $query->leftJoin('voters_in_election_campaigns as voters_in_election_campaigns_current' , function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['voters_in_election_campaigns_current.ballot_box_id', '=', 'ballot_boxes.id'],
                ['voters_in_election_campaigns_current.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        })
        ->leftJoin('votes', function ( $joinOn ) use ($last_campaign_id) {
            $joinOn->on([
                ['votes.voter_id', '=', 'voters_in_election_campaigns_current.voter_id'],
                ['votes.election_campaign_id', '=', DB::raw($last_campaign_id)]
            ]);
        });
    }

    public function scopeWithElectionsRolesByVoters($query, $leftJoin = false) {
        if ( $leftJoin ) {
            $query->leftJoin('election_roles_by_voters', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id'],
                    ['election_roles_by_voters.election_campaign_id', '=', 'clusters.election_campaign_id'],
                ]);
            });
        } else {
            $query->join('election_roles_by_voters', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles_by_voters.id', '=', 'activists_allocations_assignments.election_role_by_voter_id'],
                    ['election_roles_by_voters.election_campaign_id', '=', 'clusters.election_campaign_id'],
                ]);
            });
        }
    }

    public function scopeWithElectionRoles($query, $leftfJoin = false) {
        if ( !$leftfJoin ) {
            $query->join('election_roles', 'election_roles.id', '=', 'election_roles_by_voters.election_role_id');
        } else {
            $query->leftJoin('election_roles', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
                    ['election_roles.system_name', '=', DB::raw('"'. config('constants.activists.election_role_system_names.clusterLeader') . '"')],
                    ['election_roles.deleted', '=', DB::raw(0)]
                ]);
            });
        }
    }

    public function scopeWithHouseholds($query) {
        $query->leftJoin('voters_in_election_campaigns', function ( $joinOn ) {
                $joinOn->on([
                    ['voters_in_election_campaigns.ballot_box_id', '=', 'ballot_boxes.id'],
                    ['voters_in_election_campaigns.election_campaign_id', '=', 'clusters.election_campaign_id']
                ]);
            })
            ->leftJoin('voters as cluster_voters', 'cluster_voters.id', '=', 'voters_in_election_campaigns.voter_id');
    }
	
	public function previous_shas_votes(){
		return $this->hasMany('App\Models\BallotBox', 'cluster_id', 'id');
	}
	
	public function total_captains(){
		return $this->hasMany('App\Models\BallotBox', 'cluster_id', 'id');
	}
	
	public function total_voters() {
        return $this->hasMany('App\Models\BallotBox', 'cluster_id', 'id');
    }

	public function activated_ballots() {
        return $this->hasMany('App\Models\BallotBox' , 'cluster_id','id');
    }
	public function allocated_ballots() {
        return $this->hasMany('App\Models\BallotBox' , 'cluster_id','id');
    }
	
    public function driverGeo() {
        return $this->hasMany( 'App\Models\ActivistsAllocations' ,  'cluster_id' , 'id');
    }

    public function motivatorGeo() {
        return $this->hasMany('App\Models\ActivistsAllocations',  'cluster_id', 'id');
    }

    public function observerBallotBoxes(){
        return $this->hasMany( 'App\Models\BallotBox' ,  'cluster_id' , 'id');
    }

    public function captain50BallotBoxes(){
        return $this->hasMany( 'App\Models\BallotBox' ,  'cluster_id' , 'id');
    }
   
    //TODO:remove after finish arrange
    public function scopeWithGeographicAreas($query, $leftJoin = false) {
        if(!$leftJoin){
            $query->join('election_role_by_voter_geographic_areas', function ( $joinOn ) {
                $joinOn->on([
                    ['election_role_by_voter_geographic_areas.entity_id', '=', 'clusters.id'],
                    ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'))]
                ]);
            })
            ->join('election_roles_by_voters', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id'],
                    ['election_roles_by_voters.election_campaign_id', '=', 'clusters.election_campaign_id']
                ]);
            })
            ->join('election_roles', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
                ]);
            });
        }else{
            $query->leftJoin('election_role_by_voter_geographic_areas', function ( $joinOn ) {
                $joinOn->on([
                    ['election_role_by_voter_geographic_areas.entity_id', '=', 'clusters.id'],
                    ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'))]
                ]);
            })
            ->join('election_roles_by_voters', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles_by_voters.voter_id', '=', 'clusters.leader_id'],
                    ['election_roles_by_voters.election_campaign_id', '=', 'clusters.election_campaign_id']
                ]);
            })
            ->leftJoin('election_roles', function ( $joinOn ) {
                $joinOn->on([
                    ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
                ]);
            });
        }

    }

    //TODO:remove after finish arrange
    // public function scopeWithMotivatorsGeographicAreas($query, $last_campaign_id,$leftJoin=true) {
    //     $query->leftJoin('election_role_by_voter_geographic_areas', function ( $joinOn ) {
    //         $joinOn->on([
    //             ['election_role_by_voter_geographic_areas.entity_id', '=', 'clusters.id'],
    //             ['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'))]
    //         ]);
    //     })
    //         ->leftJoin('election_roles_by_voters', function ( $joinOn ) use ($last_campaign_id) {
    //             $joinOn->on([
    //                 ['election_roles_by_voters.id', '=', 'election_role_by_voter_geographic_areas.election_role_by_voter_id'],
    //                 ['election_roles_by_voters.election_campaign_id', '=', 'clusters.election_campaign_id']
    //             ]);
    //         })
    //         ->leftJoin('election_roles', function ( $joinOn ) {
    //             $joinOn->on([
    //                 ['election_roles.id', '=', 'election_roles_by_voters.election_role_id'],
    //                 ['election_roles.system_name', '=', DB::raw('"' . config('constants.activists.election_role_system_names.motivator') . '"')]
    //             ]);
    //         });
    // }


    public function scopeWithActivistsAllocations($query, $leftJoin = true){
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';

        $query->$joinMethod('activists_allocations', function ( $joinOn ) {
            $joinOn->on([
                ['activists_allocations.cluster_id', '=', 'clusters.id'],
                ['activists_allocations.election_campaign_id', '=', 'clusters.election_campaign_id']
            ])->whereNull('activists_allocations.ballot_box_id');
        });
    }
    public function scopeWithActivistsAllocationsAssignment($query, $leftJoin = true){
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';

        $query->$joinMethod('activists_allocations_assignments', function ( $joinOn ) {
            $joinOn->on([
                ['activists_allocations.id', '=', 'activists_allocations_assignments.activist_allocation_id'],
            ]);
        });
    }
}