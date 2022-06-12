<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\API\Sms\Sms;

use App\Models\IncomingSms;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistsSmsService;
use App\Libraries\Services\IncomingMessageService;
use App\Libraries\Services\polls\PollsSmsService;
use App\Models\polls\PollsIncomingSms as PollsIncomingSms;
use App\Models\SmsProvider;
use  Carbon\Carbon;


/**
 * Sms controller
 */
class SmsController extends Controller {

    /**
     * gets an incoming message (from external service), 
     * checks if it message belongs to polls module or to general system module,
     * inserts the message data into corresponding table.  
     *
     * @param Request $request
     * @return void
     */
    public function addSms(Request $request) {

        $jsonOutput = app()->make("JsonOutput");
		
        //get input params
        $msgId = $request->input('msgId', null);
        if ($msgId) { //PayCall API
            $source = $request->input('sender', null);			
            $destination = $request->input('recipient', null);
            $message = $request->input('content', null);  
            $reference = '';
            $mobileOperator = '';
        } else { // Unicell API
            $source = $request->input('source', null);
            $destination = $request->input('destination', null);
            $reference = $request->input('reference', null);
            $mobileOperator = $request->input('home-network-id', null);
            $message = $request->input('message', null);          
        }

        // clean the text from containing icons / wrong chars:
        $message = Helper::cleanSmsMessage($message);
 
        // check if message missing important data:
        if (!$source || !$destination || (!$message && $message != 0)) {
            Log::info("הודעה לא תקינה. -- src: $source -- dest: $destination -- msg: $message");
            return;
        }

        // fit number to convention, before inserting to dB:
        $realSource = str_replace('-', '', $source);
        $countryPrefix = '972';
        if (substr($source, 0, strlen($countryPrefix)) == $countryPrefix) {
            $realSource = substr($source, strlen($countryPrefix));
            $realSource = '0'.$realSource;
        }

        // decide to which table insert the message data - activists or polls:
        $isSmsProvider = SmsProvider::select('id')->where('phone_number', $destination)->first();
        $isActivistsMessage =!empty($isSmsProvider);
        if($isActivistsMessage){ 
            $incomingSmsTable = new IncomingSms;
        } else {
            return;
            // $incomingSmsTable = new PollsIncomingSms();
        }

        //save SMS message
        // $incomingSmsTable->key = Helper::getNewTableKey('incoming_sms', 6);
        $incomingSmsTable->source = $source;
        $incomingSmsTable->destination = $destination;
        $incomingSmsTable->reference = $reference;
        $incomingSmsTable->mobile_operator = $mobileOperator;
        $incomingSmsTable->message = $message;
        $incomingSmsTable->save();

        // !! To remove after polls update:
        if($isActivistsMessage){
            IncomingMessageService::activistsIncomingSms($message, $realSource, $incomingSmsTable);
        }

        $jsonOutput->setData("ok");
    }

}
