<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;

use App\Http\Controllers\VoterActivistController;
use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\ActivistsMessagesService;
use App\Libraries\Services\ElectionRolesByVotersMessagesService;
use App\Models\ElectionRolesByVotersMessages;

// saveActivistMessage
class CheckActivistVerifiedStatus extends Command
{
    /**
     * The name and signature of the console command.
     *  their is several options:
     *  1. full update -> 'all' '{any}'
     *  2. only new update -> 'all' 'new'
     *  ->the total votes will update all the time!
     * @var string
     */
    protected $signature = 'activist:check-verified-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check activists verified status every 24 hours, if not verified, his geo allocation will be deleted';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $VoterActivistController = new VoterActivistController;
        $currentCampaignId =  ElectionCampaigns::currentCampaign()->id;
        $verifiedStatuses = config('constants.activists.verified_status');
        $messageSentStatus = $verifiedStatuses['MESSAGE_SENT'];
        $electionRoleMessageQuery = "SELECT TIMEDIFF(now(),created_at)  FROM election_role_by_voter_messages WHERE election_role_by_voter_id = election_roles_by_voters.id AND verified_status = $messageSentStatus ORDER BY created_at DESC LIMIT 1";
        $fields = [
            'voters.first_name',
            'election_roles_by_voters.id',
            'election_roles_by_voters.phone_number',
            'election_roles.system_name as election_role_name',
            DB::raw("($electionRoleMessageQuery) as message_sent_time")
        ];
        $ballotType = config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX');
        $allElectionRoles = ElectionRolesByVoters::select($fields)
        ->withVoter()
        ->withElectionRole(false)
        ->withActivistSentMessage()
        ->with(['ElectionRolesGeographical' => function($q) use($ballotType){
            $q->select([ 'election_role_by_voter_geographic_areas.id' ])
            ->where('election_role_by_voter_geographic_areas.entity_type', DB::raw($ballotType));
        }])
        ->whereHas('ElectionRolesGeographical', function($q) use ($ballotType){
            $q->where('election_role_by_voter_geographic_areas.entity_type', DB::raw($ballotType));
        })
        ->whereNotIn('election_roles_by_voters.verified_status', [ $verifiedStatuses['VERIFIED'], $verifiedStatuses['REFUSED']])
        ->where([ 'election_roles_by_voters.election_campaign_id'=> $currentCampaignId ])
        ->groupBy('election_roles_by_voters.id')
        ->get();

        $activistMessage = '';
        foreach($allElectionRoles as $electionRoleData){
            $hours = explode(':', $electionRoleData->message_sent_time)[0];

            // Log::info($electionRoleData->id);
            // Log::info($electionRoleData->message_sent_time);
            if($hours < 24){
                if(!empty($electionRoleData->phone_number)){
                    $sendCode = ActivistsMessagesService::sendSmsToActivist( $activistMessage, $electionRoleData->phone_number,
                            $electionRoleData->first_name, $electionRoleData->election_role_name , 'verificationRepeatMessageText');
                    if($sendCode == 'OK'){
                        $messageId = $this->saveSmsMessage($electionRoleData, $activistMessage);
                        $this->saveVerifiedStatusData($electionRoleData, $activistMessage, $messageId);
                    }
            // Log::info( 'send message to activist' . PHP_EOL);
                }
            } else {
                    if(!empty($electionRoleData->phone_number)){
                        $sendCode = ActivistsMessagesService::sendSmsToActivist( $activistMessage, $electionRoleData->phone_number,
                                $electionRoleData->first_name, $electionRoleData->election_role_name , 'deleteGeoRolesAfter24HoursMessageText');
                        if($sendCode == 'OK'){
                            $this->saveSmsMessage($electionRoleData, $activistMessage);
                        }
                    }

                    $this->deleteGeoRoles($electionRoleData);
                    // Log::info('send message and delete' . PHP_EOL);
            }
        }
    }
    private static function saveSmsMessage($electionRoleData, $activistMessage){
        $messageArgs = [
            'election_role_by_voter_id' => $electionRoleData->id,
            'text' => $activistMessage,
            'phone_number' => $electionRoleData->phone_number,
            'verified_status_name' => 'MORE_INFO',
        ];
        $message = self::sendMessageToActivist($messageArgs) ;
		$messageId = $message->id;
        return $messageId;
    }
    public static function sendMessageToActivist($messageArgs) {
        $verified_status_name = isset($messageArgs['verified_status_name']) ? $messageArgs['verified_status_name'] : 'MESSAGE_SENT';
        $electionRolesByVotersMessages = new ElectionRolesByVotersMessages();
        $electionRolesByVotersMessages->key = Helper::getNewTableKey('election_role_by_voter_messages', 10);
        $electionRolesByVotersMessages->election_role_by_voter_id = $messageArgs['election_role_by_voter_id'];
        $electionRolesByVotersMessages->direction = config('constants.activists.messageDirections.OUT');
        $electionRolesByVotersMessages->text = $messageArgs['text'];
        $electionRolesByVotersMessages->phone_number = $messageArgs['phone_number'];

        $electionRolesByVotersMessages->verified_status = config("constants.activists.verified_status.$verified_status_name" );
        $electionRolesByVotersMessages->save();

        return $electionRolesByVotersMessages;
    }
    private function deleteGeoRoles($electionRoleData){
        foreach($electionRoleData->electionRolesGeographical as $geoRole ){
            ElectionRolesGeographical::find($geoRole->id)->delete();
            $historyArgsArr = [
                'topicName' => "elections.activists.$electionRoleData->election_role_name.delete",
                'models' => [
                    [
                        'referenced_model' => 'ElectionRolesGeographical',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                        'referenced_id' => $geoRole->id,
                    ],
                ],
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

    }
    private function saveVerifiedStatusData($electionRoleData, $activistMessage, $messageId){

        ElectionRolesByVoters::where('id', $electionRoleData->id)
            ->update(['verified_status' =>config('constants.activists.verified_status.MORE_INFO')]);
        $historyArgsArr = [
            'topicName' =>  "elections.activists.$electionRoleData->election_role_name.edit", // Need to add history topic!
            'models' => [],
        ];
        $historyArgsArr['models'][] = [
            'referenced_model' => 'ElectionRolesByVoters',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
            'referenced_id' => $electionRoleData->id,
            'valuesList' => [
                [
                    'field_name' => 'verified_status',
                    'display_field_name' => config('history.ElectionRolesByVoters.verified_status'),
                    'new_numeric_value' => config('constants.activists.verified_status.MORE_INFO'),
                ],
            ],
        ];

        $actionHistoryFieldsNames = [
            'election_role_by_voter_id' => config('history.ElectionRolesByVotersMessages.election_role_by_voter_id'),
            'direction' => config('history.ElectionRolesByVotersMessages.direction'),
            'text' => config('history.ElectionRolesByVotersMessages.text'),
            'phone_number' => config('history.ElectionRolesByVotersMessages.phone_number'),
            'verified_status' => config('history.ElectionRolesByVotersMessages.verified_status'),
        ];

        $actionHistoryFields = [];
        foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
            $actionInsertFields = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name, // display field name
            ];

            switch ($fieldName) {
                case 'election_role_by_voter_id':
                    $actionInsertFields['new_numeric_value'] = $electionRoleData->id;
                    break;
                case 'text':
                    $actionInsertFields['new_value'] = $activistMessage;
                    break;
                case 'phone_number':
                    $actionInsertFields['new_value'] = $electionRoleData->phone_number;
                    break;
                case 'direction':
                    $actionInsertFields['new_value'] = 'יוצא';
                    $actionInsertFields['new_numeric_value'] = config('constants.activists.messageDirections.OUT');
                    break;
                case 'verified_status':
                    $actionInsertFields['new_value'] = 'נשלחה הודעה';
                    $actionInsertFields['new_numeric_value'] = config('constants.activists.verified_status.MORE_INFO');
                    break;
            }

            $actionHistoryFields[] = $actionInsertFields;
        }

        $historyArgsArr['models'][] = [
            'description' => 'שליחת הודעה לפעיל',
            'referenced_model' => 'ElectionRolesByVotersMessages',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
            'referenced_id' => $messageId,
            'valuesList' => $actionHistoryFields,
        ];
        ActionController::AddHistoryItem($historyArgsArr);
    }
    
}
