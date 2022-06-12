<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesByVotersMessages;

use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\ActionController;

use App\API\Sms\Sms;
use App\API\Ivr\Ivr;
use App\API\Ivr\IvrManager as IvrConst;

use App\Libraries\Helper;
use App\Libraries\Services\ElectionRolesByVotersMessagesService;


/**
 * Class ActivistsSendMessage
 * @package App\Console\Commands
 *
 * This command sends messages to activists
 * who should get delayed messages in the
 * current day.
 */
class ActivistsSendMessage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activist:send';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send delayed messages to activists';

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
    public function handle() {
        $currentHour = date('G');

        // Sending delayed sms to activists is done in certain hour
        // If the current hour is not the system hour then leave the
        // command
        if ( $currentHour != config('settings.send_activist_sms_hour') ) {
            return;
        }

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        // Getting the current day of the week
        $currentDay = date('N') + 1;

        $fields = [
            'election_roles_by_voters.id',
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.verified_status',
            'election_roles_by_voters.user_create_id',

            'election_roles.system_name',
            'election_roles.name as role_name',

            'voters.first_name',
            'voters.last_name'
        ];

        $activists = ElectionRolesByVoters::select($fields)
            ->withElectionRole()
            ->withVoter()
            ->where(['election_campaign_id' => $last_campaign_id, 'day_sending_message' => $currentDay])
            ->get();

        $sms_message = config('constants.activists.verificationMessageText');
        $ivr_send_message = config('constants.activists.verificationMessageTextSendIvr');
        $ivr_message = config('constants.activists.verificationMessageTextIvr');

        for ( $activistIndex = 0; $activistIndex < count($activists); $activistIndex++ ) {

            if(Helper::isKosherPhone($activists[$activistIndex]->phone_number)) {
                //replace message placeholders
                $first_name = $activists[$activistIndex]->first_name;
                $last_name = $activists[$activistIndex]->last_name;
                $role_name = $activists[$activistIndex]->role_name;

                $activistMessage = str_replace(['[first_name]', '[last_name]', '[role_name]'],
                [$first_name, $last_name, $role_name], $ivr_message);

                // $ivr_send_message = str_replace(['[first_name]', '[last_name]', '[role_name]'],
                // [$first_name, $last_name, $role_name], $ivr_send_message);
                $ivrData = [
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'role_name' => $role_name,
                ];
                $sendCode = (Ivr::send($activists[$activistIndex]->phone_number, $activistMessage, IvrConst::TYPE_ACTIVIST_VERIFICATION , $ivrData)) ? 'OK' : 'Error';
            } else {
                //replace message placeholders
                $activistMessage = str_replace('[first_name]', $activists[$activistIndex]->first_name, $sms_message);
                $activistMessage = str_replace('[role_name]', $activists[$activistIndex]->role_name, $activistMessage);
                $sendCode = (Sms::connection('telemarketing')->send($activists[$activistIndex]->phone_number, $activistMessage)) ? 'OK' : 'Error';
            }
            if ( 'OK' == $sendCode ) {
                $messageArgs = [
                    'election_role_by_voter_id' => $activists[$activistIndex]->id,
                    'text' => $activistMessage,
                    'phone_number' => $activists[$activistIndex]->phone_number
                ];
                $electionRolesByVotersMessages = ElectionRolesByVotersMessagesService::sendMessageToActivist($messageArgs);
				$electionRolesByVotersMessagesId = $electionRolesByVotersMessages->id;
				

                $updateActivistFields = [
                    'verified_status' => config('constants.activists.verified_status.MESSAGE_SENT'),
                    'day_sending_message' => null,
                    'user_update_id' => $activists[$activistIndex]->user_create_id
                ];
                ElectionRolesByVoters::where('id', $activists[$activistIndex]->id)->update($updateActivistFields);

                $historyArgsArr = [
                    'topicName' => 'elections.activists.' . $activists[$activistIndex]->system_name  . '.edit',
                    'user_create_id' => $activists[$activistIndex]->user_create_id,
                    'models' => []
                ];

                $historyArgsArr['models'][] = [
                    'referenced_model' => 'ElectionRolesByVoters',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                    'referenced_id' => $activists[$activistIndex]->id,
                    'valuesList' => [
                        [
                            'field_name' => 'verified_status',
                            'display_field_name' => config('history.ElectionRolesByVoters.verified_status'),
                            'old_numeric_value' => $activists[$activistIndex]->verified_status,
                            'new_numeric_value' => config('constants.activists.verified_status.MESSAGE_SENT')
                        ],
                        [
                            'field_name' => 'day_sending_message',
                            'display_field_name' => config('history.ElectionRolesByVoters.day_sending_message'),
                            'old_numeric_value' => $currentDay
                        ],
                        [

                            'field_name' => 'user_update_id',
                            'display_field_name' => config('history.ElectionRolesByVoters.user_update_id'),
                            'new_numeric_value' => $activists[$activistIndex]->user_create_id
                        ]
                    ]
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
                    $actionInsertFields = [];

                    $actionInsertFields = [
                        'field_name' => $fieldName,
                        'display_field_name' => $display_field_name, // display field name
                    ];

                    switch($fieldName) {
                        case 'election_role_by_voter_id':
                            $actionInsertFields['new_numeric_value'] = $electionRolesByVotersMessages->election_role_by_voter_id;
                            break;

                        case 'text':
                        case 'phone_number':
                            $actionInsertFields['new_value'] = $electionRolesByVotersMessages->{$fieldName};
                            break;

                        case 'direction':
                            $actionInsertFields['new_value'] = 'יוצא';
                            $actionInsertFields['new_numeric_value'] = config('constants.activists.messageDirections.OUT');
                            break;

                        case 'verified_status':
                            $actionInsertFields['new_value'] = 'נשלחה הודעה';
                            $actionInsertFields['new_numeric_value'] = config('constants.activists.verified_status.MESSAGE_SENT');
                            break;
                    }

                    $actionHistoryFields[] = $actionInsertFields;
                }

                $historyArgsArr['models'][] = [
                    'description' => 'שליחת הודעה לפעיל',
                    'referenced_model' => 'ElectionRolesByVotersMessages',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $electionRolesByVotersMessagesId,
                    'valuesList' => $actionHistoryFields
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
        }
    }
}