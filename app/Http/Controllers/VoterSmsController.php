<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\GlobalController;
 
use Illuminate\Support\Facades\Validator;

use Illuminate\Http\Request;

use Auth;
use App\Models\Voters;
use App\Models\CrmRequest;
use App\Models\VoterPhone;
use App\Models\Message;

use App\Libraries\Helper;
use App\Libraries\Services\ExportService;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Carbon\Carbon;
use App\API\Sms\Sms;


class VoterSmsController extends Controller {
    
	/*
		Private helpful function that creates new Message 

		@param $messageArgs
	*/
    private function saveMessage($messageArgs) {
        $newMessage = new Message;
        $newMessage->key = Helper::getNewTableKey('messages', 10);
        $newMessage->entity_type = $messageArgs['entity_type'];
        $newMessage->entity_id = $messageArgs['entity_id'];
        $newMessage->type = config('constants.MESSAGE_TYPE_SMS');
        $newMessage->date = DB::raw('NOW()');
        $newMessage->direction = config('constants.MESSAGE_DIRECTION_OUT');
        $newMessage->body = nl2br($messageArgs['body']);
        $newMessage->save();

        $messageFields = [
            ['name' => 'entity_type', 'type' => 'numeric', 'value' => $messageArgs['entity_type']],
            ['name' => 'entity_id', 'type' => 'numeric', 'value' => $messageArgs['entity_id']],
            ['name' => 'body', 'type' => 'char', 'value' => $messageArgs['body']]
        ];

        $historyArgsArr = [
            'topicName' => $messageArgs['permissions'],
            'models' => [
                [
                    'referenced_model' => 'Message',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newMessage->id,
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
            'new_value' => 'sms',
            'new_numeric_value' => config('constants.MESSAGE_TYPE_SMS')
        ];

        $historyArgsArr['models'][0]['valuesList'][] = [
            'field_name' => 'direction',
            'display_field_name' => config('history.Message.direction'),
            'new_value' => 'יוצאת',
            'new_numeric_value' => config('constants.REQUEST_OPERATION_DIRECTION_OUT')
        ];

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Function that send SMS message to phone that is corresponding
		to voter of that CrmRequest

		@param $request
		@param $requestKey - of crm_requests
	*/
    public function sendSmsForRequest(Request $request, $requestKey) {
        $jsonOutput = app()->make("JsonOutput");

        if( is_null($requestKey) || trim($requestKey) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_REQUEST_KEY'));
            return;
        }

        if($request->input('voter_phone_key') == null || trim($request->input('voter_phone_key')) == ''){
            $jsonOutput->setErrorCode(config('errors.elections.PHONE_KEY_IS_NOT_VALID'));
            return;
        }

        if($request->input('message_text') == null || strlen(trim($request->input('message_text')))<4){
            $jsonOutput->setErrorCode(config('errors.elections.SMS_MESSAGE_TEXT_MISSING'));
            return;
        }

        $crmRequest = CrmRequest::select(['id', 'voter_id'])
            ->where('key', $requestKey)
            ->first();
        if(!$crmRequest){
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_REQUEST_KEY'));
            return;
        }

        $voterPhone = VoterPhone::select('phone_number')->where('voter_phones.key' , $request->input('voter_phone_key') )
            ->where('voter_id' , $crmRequest->voter_id)
            ->join('phone_types' , 'phone_types.id' , '=' , 'voter_phones.phone_type_id' )
            ->where('phone_types.system_name' , '=' , 'mobile')
            ->where('phone_types.deleted' , '=' , '0')
            ->first();
        if(!$voterPhone){
            $jsonOutput->setErrorCode(config('errors.elections.PHONE_KEY_IS_NOT_VALID'));
            return;
        }

        $code =  (Sms::connection('telemarketing')->send($voterPhone->phone_number, $request->input('message_text')) ? 1 : 0);
        if ( $code ) {
            $messageArgs = [
                'entity_type' => config('constants.ENTITY_TYPE_REQUEST'),
                'entity_id' => $crmRequest->id,
                'permissions' => 'crm.requests.fast_buttons.new_sms',
                'body' => $request->input('message_text')
            ];

            $this->saveMessage($messageArgs);
        }

        $jsonOutput->setData($code);
    }

	/*
		Function that send SMS message to phone that is corresponding
		to voter by voterKey

		@param $request
		@param $voterKey 
	*/
    public function sendSmsForVoter(Request $request, $voterKey) {
        $jsonOutput = app()->make("JsonOutput");

        if( is_null($voterKey) || trim($voterKey) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        if($request->input('voter_phone_key') == null || trim($request->input('voter_phone_key')) == ''){
            $jsonOutput->setErrorCode(config('errors.elections.PHONE_KEY_IS_NOT_VALID'));
            return;
        }

        if($request->input('message_text') == null || strlen(trim($request->input('message_text')))<4){
            $jsonOutput->setErrorCode(config('errors.elections.SMS_MESSAGE_TEXT_MISSING'));
            return;
        }

        $voter = Voters::select('id')->where('key',$voterKey)->first();
        if(!$voter){
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voterPhone = VoterPhone::select('phone_number')->where('voter_phones.key' , $request->input('voter_phone_key') )
            ->where('voter_id' , $voter->id)
            ->join('phone_types' , 'phone_types.id' , '=' , 'voter_phones.phone_type_id' )
            ->where('phone_types.system_name' , '=' , 'mobile')
            ->where('phone_types.deleted' , '=' , '0')
            ->first();
        if(!$voterPhone){
            $jsonOutput->setErrorCode(config('errors.elections.PHONE_KEY_IS_NOT_VALID'));
            return;
        }

        $code =  (Sms::connection('telemarketing')->send($voterPhone->phone_number, $request->input('message_text')) ? 1 : 0);
        if ( $code ) {
            $messageArgs = [
                'entity_type' => config('constants.ENTITY_TYPE_VOTER'),
                'entity_id' => $voter->id,
                'permissions' => 'elections.voter.fast_buttons.new_sms',
                'body' => $request->input('message_text')
            ];

            $this->saveMessage($messageArgs);
        }

        $jsonOutput->setData($code);
    }

	/*
		Function that checkes the route path of calling , and calls the right
		function that send SMS - by voter or crmRequest
		
		@param $request
		@param $entityKey 
	*/
    public function sendVerifiedSMS(Request $request, $entityKey) {
        $routePermissions = array_map('trim', explode(',', Route::currentRouteName()));

        if ( in_array('elections.voter.fast_buttons.new_sms', $routePermissions) ) {
            $this->sendSmsForVoter($request, $entityKey);
            return;
        } else if ( in_array('crm.requests.fast_buttons.new_sms', $routePermissions) ) {
            $this->sendSmsForRequest($request, $entityKey);
            return;
        }
    }
}