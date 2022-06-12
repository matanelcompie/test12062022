<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ElectionCampaignPartyLists extends Model {

    public $primaryKey = 'id';

    protected $table = 'election_campaign_party_lists';

    public function scopeWithVotesAndBallots($query,$leftJoin=false,$ballot_box_id=null){
        $join=$leftJoin?'leftJoin':'join';
        $query->$join('election_campaign_party_list_votes',function($query)use($ballot_box_id){
            $query->on('election_campaign_party_list_votes.election_campaign_party_list_id', '=', 'election_campaign_party_lists.id');
            if($ballot_box_id)
            $query->on('election_campaign_party_list_votes.ballot_box_id','=',DB::raw($ballot_box_id));
        });
       
    }
    
}
