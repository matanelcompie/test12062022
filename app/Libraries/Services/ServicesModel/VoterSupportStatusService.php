<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\SupportStatus;
use App\Models\VotersInElectionCampaigns;
use App\Models\VoterSupportStatus;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class VoterSupportStatusService
{
   //delete double record voter support status by voter and the same status and type
   public static function deleteDoubleRecord(){
     $arrFields=[DB::raw('distinct voter_support_status.id'),
     'voter_support_status.key',
     'voter_support_status.election_campaign_id',
     'voter_support_status.voter_id',
     'voter_support_status.entity_type',
     'voter_support_status.support_status_id',
     'voter_support_status.create_user_id',
    ];

        $deleteRecord=VoterSupportStatus::select($arrFields)
        ->join('voter_support_status as statusDelete',function($deleteRecord){
            $deleteRecord->on('voter_support_status.election_campaign_id','statusDelete.election_campaign_id')
                         ->on('voter_support_status.voter_id','statusDelete.voter_id')
                         ->on('voter_support_status.entity_type','statusDelete.entity_type');
                        //  ->on('voter_support_status.support_status_id','statusDelete.support_status_id')
                        //  ->on('voter_support_status.deleted', DB::raw(0));
        })
        ->where('statusDelete.deleted', DB::raw(0))
        ->where('voter_support_status.deleted', DB::raw(0))
        ->where('voter_support_status.id','<',DB::raw('statusDelete.id'))
        ->orderBy('voter_support_status.id', 'asc')
        ->get();

        // Log::info(json_encode($deleteRecord));

      foreach ($deleteRecord as $key => $record){
        try {
         Log::info(json_encode($record));
         $values = $record->toArray();
         $exist = DB::table('voter_support_status_doubles')->where( $values);
         if(!$exist){
            DB::table('voter_support_status_doubles')->insert( $values);
         }
          VoterSupportStatus::where('id', $record->id)->update(['deleted'=> 1]);
        } catch (\Throwable $th) {
          Log::info($th);
          //throw $th;
        }
      }
       return $deleteRecord;
   } 
   public static function addVoterSupportStatuses($voterId, $newSupportStatusId,$currentCampaignId, $entityType, $userId = null) {
    $voterSupportStatus = new VoterSupportStatus;

    $userId = isset($userId) ? $userId : Auth::user()->id ;

    $voterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
    $voterSupportStatus->election_campaign_id = $currentCampaignId;
    $voterSupportStatus->entity_type = $entityType;
    $voterSupportStatus->support_status_id = $newSupportStatusId;
    $voterSupportStatus->voter_id = $voterId;
    $voterSupportStatus->create_user_id = $userId;
    $voterSupportStatus->update_user_id = $userId;
    $voterSupportStatus->save();

    // Array of display field names
    $historyFieldsNames = [
        'election_campaign_id' => config('history.VoterSupportStatus.election_campaign_id'),
        'entity_type'          => config('history.VoterSupportStatus.entity_type'),
        'support_status_id'    => config('history.VoterSupportStatus.support_status_id'),
        'voter_id'             => config('history.VoterSupportStatus.voter_id')
    ];

    $fieldsArray = [];
    foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
        $fieldsArray[] = [
            'field_name' => $fieldName,
            'display_field_name' => $display_field_name,
            'new_numeric_value' => $voterSupportStatus->{$fieldName}
        ];
    }

    $historyArgsArr = [
        'topicName' => 'elections.voter.support_and_elections.support_status.edit',
        'models' => [
            [
                'referenced_model' => 'VoterSupportStatus',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $voterSupportStatus->id,
                'valuesList' => $fieldsArray
            ]
        ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);
}
    // Get final voters support status count by array ids and entity type:
    public static function getEntityFinalSupporters($entityType, $arrValue, $electionCampaignID){
        $supportStatusId = SupportStatus::where('likes', 1)->where('election_campaign_id', $electionCampaignID)->first()->id;
        $query = VotersInElectionCampaigns::select(DB::raw('count(distinct voters_in_election_campaigns.voter_id) as count_supporters'))
        ->withSupportStatus(false)
        ->WithBallotBox()
        ->where('voter_support_status.support_status_id', $supportStatusId)
        ->where('voters_in_election_campaigns.election_campaign_id', $electionCampaignID);
        
        switch ($entityType) {
            // All country
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'):
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'):
                $query->whereIn('cities.area_id', $arrValue);
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'):
                $query->whereIn('cities.sub_area_id', $arrValue);
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'):
                $query->whereIn('cities.id', $arrValue);
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'):
                $query->whereIn('clusters.id', $arrValue);
                break;
            case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'):
                $query->whereIn('ballot_boxes.id', $arrValue);
                    break;
        }
        $cnt = $query->first();
        // dd($cnt , $supportStatusId);
        $count_supporters = $cnt ? $cnt->count_supporters : 0;
        return $count_supporters;
    }

}