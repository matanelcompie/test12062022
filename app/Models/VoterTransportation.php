<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterTransportation extends Model {

    public static $lengthKey=5;
    public $primaryKey = 'id';
    protected $table = 'voter_transportations';
	
	public function scopeWithVoter ( $query ) {

        $query->join( 'voters', 'voter_transportations.voter_id', '=', 'voters.id' )
		->join('cities' , 'cities.id' , '=' , 'voters.city_id');
    }
	
	public function scopeWithDriverVoter ( $query ) {

        $query->join( 'voters', 'voter_transportations.voter_driver_id', '=', 'voters.id' )
		->join('cities' , 'cities.id' , '=' , 'voters.city_id');
    }
	
	public function scopeWithVoterInElectionCampaings ( $query ) {
        $query->join( 'voters_in_election_campaigns', 'voters_in_election_campaigns.voter_id', '=', 'voter_transportations.voter_id' )
		      ->join( 'ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id' )
			  ->join( 'clusters', 'clusters.id', '=', 'ballot_boxes.cluster_id' );
    }
}