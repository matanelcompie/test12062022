<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $election_campaign_id
 * @property integer $voter_id
 * @property boolean $entity_type
 * @property integer $support_status_id
 * @property integer $create_user_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class VoterSupportStatus extends Model
{

    public static $lengthKey=10;
    public $primaryKey = 'id';

    protected $table = 'voter_support_status';

    /**
     * @var array
     */
    protected $fillable = ['key',
        'election_campaign_id',
        'voter_id',
        'entity_type',
        'support_status_id',
        'create_user_id',
        'update_user_id',
        'created_at',
        'updated_at'];

    /**
     * This query gets the user handler of the voter support status
     *
     * @param $query
     */
    public function scopeWithUser($query)
    {

        $query->join('users', 'users.id', '=', 'voter_support_status.create_user_id')->join('voters', 'voters.id', '=', 'users.voter_id');
    }

    public function scopeWithElectionCampaigns($query, $withEndDate = false)
    {

        if (false == $withEndDate) {
            $query->join('election_campaigns', 'election_campaigns.id', '=', 'voter_support_status.election_campaign_id');
        } else {
            $query->join('election_campaigns', function ($joinOn) {

                $joinOn->on('election_campaigns.id', '=', 'voter_support_status.election_campaign_id') /*=*/
                    ->on(function ($query) {

                        $query->on('election_campaigns.end_date', '>=', DB::raw('NOW()')) /*=*/
                            ->orOn(DB::raw('election_campaigns.end_date IS NULL'), '=', DB::raw('TRUE'));
                    });
            });
        }
    }

    public function scopeWithSupportStatus($query, $clean = false)
    {
        if (false == $clean) {
            $query->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id');
        } else {
            $query->join('support_status', function ($joinOn) {

                $joinOn->on('support_status.id', '=', 'voter_support_status.support_status_id') /*=*/
                    ->on('support_status.deleted', '=', DB::raw(0));
            });
        }
    }
	
	public function scopeWithVoterInElectionCampaign($query , $withVoters = true){
		 $query->join('voters_in_election_campaigns' , function($joinOn){
			 $joinOn->on('voters_in_election_campaigns.election_campaign_id' , '=' , 'voter_support_status.election_campaign_id')
			        ->on('voters_in_election_campaigns.voter_id' , '=' , 'voter_support_status.voter_id');
			 
		 });
		 if($withVoters){
			$query->join('voters' , 'voters.id' , '=' , 'voter_support_status.voter_id');
		 }
	 
	}

}
