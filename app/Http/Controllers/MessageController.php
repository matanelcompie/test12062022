<?php

namespace App\Http\Controllers;

use App\Enums\MessageEntityType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CrmRequest;
use App\Models\Message;
use App\Models\Voters;
use App\Models\UnknownVoters;
use Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\GeneralEmail;
use App\Http\Controllers\ActionController;
use Illuminate\Support\Facades\DB;
use App\Libraries\Helper;
use App\Repositories\MessageRepository;
use App\Repositories\VotersRepository;
use Log;

class MessageController extends Controller {

    /*
		Function that returns all messages of voter by voterKey
	*/
    public function getAllMessagesOfVoter($voterKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        try {
            $voterData = VotersRepository::getVoterByKeyWithFilter($voterKey);
            $voterCrmMessages = MessageRepository::getMessageByVoterIdAndMessageEntityType($voterData->id, MessageEntityType::ENTITY_TYPE_REQUEST);
            $voterVoterMessages = MessageRepository::getMessageByVoterIdAndMessageEntityType($voterData->id, MessageEntityType::ENTITY_TYPE_VOTER);

            $totalArray = array();
            for ($i = 0; $i < sizeof($voterCrmMessages); $i++) {
                array_push($totalArray, $voterCrmMessages[$i]);
            }
            for ($i = 0; $i < sizeof($voterVoterMessages); $i++) {
                array_push($totalArray, $voterVoterMessages[$i]);
            }
            $jsonOutput->setData(($totalArray));
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

	/*
		Function that returns all messages by route path - it selectes the correct function
	*/
    public function getMessages($key) {
        $jsonOutput = app()->make("JsonOutput");
        $routeName = Route::currentRouteName();
        switch ($routeName) {
            case 'elections.voter.messages':
                $entity_type = config('constants.ENTITY_TYPE_VOTER');
                $this->getMessagesFromEntity($key, $entity_type);
                break;

            case 'crm.requests.messages':
                $entity_type = config('constants.ENTITY_TYPE_REQUEST');
                $this->getMessagesFromEntity($key, $entity_type);
                break;
                default:
                    $jsonOutput->setErrorCode(config('errors.global.INCORRECT_PERMISSION'));
                    break;
        }
    }

    /*
		Function that returns all messages of request/voter - by key and entity_type
	*/
    public function getMessagesFromEntity($key, $entityType)
    {
        $entityMessages = MessageRepository::getMessageByEntityTypeAndKeyEntity($entityType, $key);
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData($entityMessages);
    }

	/*
		Function that send email of crmRequest , by requestKey and POST params
	*/
    public function sendEmailFromRequest(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        $requestKey = trim($key);
        $requestVoter = CrmRequest::select('id', 'voter_id', 'unknown_voter_id')->where('key', $requestKey)->first();
        $voterEmail = FALSE;

        if ($requestVoter) {
            if ($requestVoter['voter_id']) {
                $voterData = Voters::select('email', 'contact_via_email')->withFilters()->where('voters.id', $requestVoter['voter_id'])->first();

                if ($voterData) {
                    $voterEmail = ($voterData['contact_via_email'] == 1 && $voterData['email']) ? $voterData['email'] : FALSE;
                }
            } else {
                $unknownVoterData = UnknownVoters::select('email')->where('id', $requestVoter['unknown_voter_id'])->first();

                if ($unknownVoterData) {
                    $voterEmail = $unknownVoterData['email'] ? $unknownVoterData['email'] : FALSE;
                }
            }
        }

        if ($voterEmail) {
            $title = trim($request->input('emailTitle'));
            $body = trim($request->input('emailBody'));
            $this->sendEmail($voterEmail, $title, $body);
            $this->saveTransaction(config('constants.ENTITY_TYPE_REQUEST'), $requestVoter['id'], $title, $body);
        }
        $jsonOutput->setData('ok');
    }

	/*
		Function that send email of Voter , by voterKey and POST params
	*/
    public function sendEmailFromVoter(Request $request, $key) {
        $voterKey = trim($key);
        $voterEmail = FALSE;
        $entityId = NULL;

        $voterData = Voters::select('voters.id', 'email', 'contact_via_email')->withFilters()->where('voters.key', $voterKey)->first();
        if ($voterData) {
            $voterEmail = ($voterData['contact_via_email'] == 1 && $voterData['email']) ? $voterData['email'] : FALSE;
            $entityId = $voterData['id'];
        } else {
            $unknownVoterData = UnknownVoters::select('id', 'email')->where('key', $voterKey)->first();

            if ($unknownVoterData) {
                $voterEmail = $unknownVoterData['email'] ? $unknownVoterData['email'] : FALSE;
                $entityId = $unknownVoterData['id'];
            }
        }

        if ($voterEmail) {
            $title = trim($request->input('emailTitle'));
            $body = trim($request->input('emailBody'));
            $this->sendEmail($voterEmail, $title, $body);
            $this->saveTransaction(config('constants.ENTITY_TYPE_VOTER'), $entityId, $title, $body);
        }
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData('ok');
    }

	/*
		Private helpful function that performs sending email action
	*/
    private function sendEmail($to, $title, $body) {
        Mail::to($to)->send(new GeneralEmail($title, $body));
    }

	/*
		Private helpful function that adds new message to DB by params
	*/
    private function saveTransaction($entityType, $entityId, $subject, $body) {
        $key = Helper::getNewTableKey('messages', 10);
        $row = new Message;
        $row->key = $key;
        $row->entity_type = $entityType;
        $row->entity_id = $entityId;
        $row->type = config('constants.MESSAGE_TYPE_EMAIL');
        $row->date = DB::raw('NOW()');
        $row->direction = config('constants.MESSAGE_DIRECTION_OUT');
        $row->subject = $subject;
        $row->body = nl2br($body);
        $row->save();

        $routeName = Route::currentRouteName();

        $messageFields = [
            ['name' => 'entity_type', 'type' => 'numeric', 'value' => $entityType],
            ['name' => 'entity_id', 'type' => 'numeric', 'value' => $entityId],
            ['name' => 'subject', 'type' => 'char', 'value' => $subject],
            ['name' => 'body', 'type' => 'char', 'value' => $body]
        ];

        $historyArgsArr = [
            'topicName' => $routeName,
            'models' => [
                [
                    'referenced_model' => 'Message',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $row->id,
                    'valuesList' => []
                ]
            ]
        ];

        for ( $fieldIndex = 0; $fieldIndex < count($messageFields); $fieldIndex++ ) {
            $fieldName = $messageFields[$fieldIndex]['name'];

            $insertField = [
                'field_name' => $fieldName,
                'display_field_name' => config('history.Message.' . $fieldName)
            ];

            if ( 'numeric' == $messageFields[$fieldIndex]['type'] ) {
                $insertField['new_numeric_value'] = $messageFields[$fieldIndex]['value'];
            } else {
                $insertField['new_value'] = $messageFields[$fieldIndex]['value'];
            }

            $historyArgsArr['models'][0]['valuesList'][] = $insertField;
        }

        $historyArgsArr['models'][0]['valuesList'][] = [
            'field_name' => 'type',
            'display_field_name' => config('history.Message.type'),
            'new_value' => 'אימייל',
            'new_numeric_value' => config('constants.MESSAGE_TYPE_EMAIL')
        ];

        $historyArgsArr['models'][0]['valuesList'][] = [
            'field_name' => 'direction',
            'display_field_name' => config('history.Message.direction'),
            'new_value' => 'יוצאת',
            'new_numeric_value' => config('constants.MESSAGE_DIRECTION_OUT')
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }
}
