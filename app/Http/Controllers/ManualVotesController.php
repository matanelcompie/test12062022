<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Helper;
use App\Models\Area;
use App\Models\SubArea;
use App\Models\City;
use App\Models\Streets;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\Voters;
use App\Models\Votes;
use App\Models\VoteSources;
use App\Models\VoterPhone;
use App\Models\VoterSupportStatus;
use App\Models\VoterTransportation;
use App\Models\SupportStatus;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ActionHistory;
use App\Models\ActionHistoryTopic;
use Auth;
use Illuminate\Http\Request;
use App\Models\VoterFilter\VoterQuery;
use App\Models\VoterFilter\VoterFilterDefinition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;


class ManualVotesController extends Controller
{

    /*
     Delete vote of voter at current campaign - only if vote  exists for voter
	
	@params request
	@params voterKey
	*/
	public function deleteVoterVoteData($voterKey){
		$jsonOutput = app()->make("JsonOutput");
		
		if(!GlobalController::isActionPermitted('elections.votes.manual.delete')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$voter = Voters::select('voters.id' , 'voters.key' , 'voters.personal_identity' , 'voters.first_name' , 'voters.last_name' , 'voters.city')->where('voters.key', $voterKey)->first();
        if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			return;
		}
		$voteToDelete = Votes::where('election_campaign_id',$currentCampaign)->where('votes.voter_id',$voter->id)->first();
		if(!$voteToDelete){
			$jsonOutput->setErrorCode(config('errors.elections.VOTE_DOESNT_EXIST'));
			return;					  
		}
		$voteToDelete->forceDelete();
	 
		$voter->vote = null;
		$jsonOutput->setData($voter);
	}
		
	 
	/*
     Create vote for voter at current campaign - only if vote not exists
	
	@params request
	@params voterKey
	*/
	public function addVoterVoteData($voterKey){
		$jsonOutput = app()->make("JsonOutput");
		
	    if(!GlobalController::isActionPermitted('elections.votes.manual.add')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$voter = Voters::select('voters.id' , 'voters.key' , 'voters.personal_identity' , 'voters.first_name' , 'voters.last_name' , 'voters.city')->where('voters.key', $voterKey)->first();
        if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			return;
		}
		if(Votes::select('id')->where('election_campaign_id',$currentCampaign)->where('votes.voter_id',$voter->id)->first()){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_ALREADY_HAS_VOTE'));
			return;					  
		}
		$voteSourceManual = -1;
		$voteSourceObj = VoteSources::select('id')->where('system_name' , 'manual')->first();
		if($voteSourceObj){
			$voteSourceManual = $voteSourceObj->id;
		}

		Votes::insert(
			['vote_date'=>Carbon::now() ,
			'voter_id'=>$voter->id ,
			'key'=>Helper::getNewTableKey('votes', 10) ,
			'election_campaign_id'=>$currentCampaign ,
			'user_create_id'=>Auth::user()->id ,
			'vote_source_id'=>$voteSourceManual
			]);

		$ballotBox = BallotBox::select('ballot_boxes.id')
					->withVoterElectionCampaign()
					->where('voters_in_election_campaigns.election_campaign_id', $currentCampaign)
					->where('voters_in_election_campaigns.voter_id', $voter->id)
					->first();

		//add ballot box id to votes calculation in redis
		if ($ballotBox) Redis::hset('election_day:dashboard:ballot_boxes_counters_to_update', $ballotBox->id, $ballotBox->id);



		$fields = [
            'votes.id',
            'votes.election_campaign_id',
            'votes.voter_id',
            'vote_date',
            'vote_source_id',
            'votes.user_create_id',
            'voters.first_name',
            'voters.last_name'
        ];
		$vote = Votes::select($fields)
		                      ->leftJoin('users','users.id','=' , 'votes.user_create_id')
							  ->leftJoin('voters','voters.id','=','users.voter_id')
							  ->where('election_campaign_id',$currentCampaign)->where('votes.voter_id',$voter->id)->first();

        $votesFields = [
            'election_campaign_id',
            'voter_id',
            'vote_date',
            'vote_source_id'
        ];
        $changedValues = [];
        foreach ($votesFields as $fieldName ) {
            if ( $fieldName == 'vote_date' ) {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Votes.' . $fieldName),
                    'new_value' => $vote->{$fieldName}
                ];
            } else {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Votes.' . $fieldName),
                    'new_numeric_value' => !empty($vote->{$fieldName}) ? $vote->{$fieldName} : null
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.votes.manual.add',
            'models' => [
                [
                    'description' => 'הוספת הצבעה באופן ידני',
                    'referenced_model' => 'Votes',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $vote->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);
		$voter->vote = $vote;
		$jsonOutput->setData($voter);
	}
	
	/*
	Get voters vote data by voter key
	
	@params request
	@params voterKey
	*/
	public function getVoterVoteData($voterKey){
		$jsonOutput = app()->make("JsonOutput");
		if(!GlobalController::isActionPermitted('elections.votes.manual')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$voter = Voters::select('voters.id' , 'voters.key' , 'voters.personal_identity' , 'voters.first_name' , 'voters.last_name' , 'voters.city')
						->withVoterInElectionCampaigns()
						->where('voters.key', $voterKey)
						->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
						->first();
        if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			return;
		}
		$voter->vote = Votes::select('vote_date','votes.user_create_id' , 'voters.first_name' , 'voters.last_name')
		                      ->leftJoin('users','users.id','=' , 'votes.user_create_id')
							  ->leftJoin('voters','voters.id','=','users.voter_id')
							  ->where('election_campaign_id',$currentCampaign)->where('votes.voter_id',$voter->id)->first();
		$jsonOutput->setData($voter);
	}
	
 	/*
	Search voter by params
	
	@params personal_identity
	 
	*/
	public function searchVoterByParams(Request $request){
		$jsonOutput = app()->make("JsonOutput");
		if(!GlobalController::isActionPermitted('elections.votes.manual')){
			$jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
			return;
        }
		$currentCampaign = ElectionCampaigns::currentCampaign()['id'];
		$personal_identity = ltrim($request->input('personal_identity') , '0');
		$voter = Voters::select('voters.key')->withVoterInElectionCampaigns()
						->where('voters.personal_identity', $personal_identity)
						->where('voters_in_election_campaigns.election_campaign_id' , $currentCampaign)
						->first();
        if(!$voter){
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			return;
		}
		$jsonOutput->setData($voter);
	}
	
 
}
