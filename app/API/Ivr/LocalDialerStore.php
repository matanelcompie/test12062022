<?php

namespace App\API\Ivr;

use App\API\Ivr\Contracts\Store;
use Barryvdh\Debugbar\Facade as Debugbar;
use Illuminate\Support\Facades\Log;

use Carbon\Carbon;

class LocalDialerStore implements Store {
    const BASE_URL = 'http://10.192.138.16:3000/';
	/**
     * Config of sms
     *
     * @var array
     */
	protected $config;

    /**
     * Construct a new LocalIvrStore
     *
     * @param array $config
     */
	public function __construct($config) {

		$this->config = $config;
		$this->connection = 'default';
	}

    /**
     * Send a new message
     *
     * @param mixed $recipients
     * @param string $message
     * @param $type
	 *
	 * @return bool
     */	
	public function send($recipients, $message, $type, $data = null) {

        $phoneNumber = $this->getPhoneNumber($recipients);

		$config = $this->config; 
		$displayNumber = $config['numbers'][$type];

		$postFields = [
            "messageType" => $type,
			"sendDate" => Carbon::now()->format('Y-m-d H:i:s'),
            "displayNumber" => $displayNumber,
            "phoneNumber" => $phoneNumber,
            "message" => $message,
			"tryToSendCount" => 20,
			"intervalMinForRetry" => 6*60 //in seconds
		];
		if($data) {
			$postFields['data'] = $data;
		}
		$bodyJsonData = json_encode($postFields);
		// Log::info($bodyJsonData);
		Debugbar::addMessage($bodyJsonData, 'ivr-send');
		
		//set header array
		$myHeader = array(
		    "MIME-Version: 1.0",
			"Content-type: application/json",
			"charset=UTF-8",
			'Content-Length: ' . strlen($bodyJsonData)   
		);
		//creating and initiating curl
		$ch = curl_init();
		//setting curl/http headers
		curl_setopt($ch, CURLOPT_POST,1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

		curl_setopt($ch, CURLOPT_POSTFIELDS, $bodyJsonData);
		curl_setopt($ch, CURLOPT_URL, self::BASE_URL . 'activist/message/');
		$postResult = curl_exec($ch); 
		curl_close($ch);

		$resultJson = json_decode($postResult);
		// Log::info('$postResult');
		// Log::info($postResult);
		

		//check output
		if ($resultJson && $resultJson->status == 'OK') {
			Debugbar::addMessage($resultJson,'ivr-response-success');
			return true;
		} else {
			Debugbar::addMessage($resultJson,'ivr-response-error');
			return false;
		}
    }
    	/**
	 * Change connection
	 *
	 * $param string connection name
	 *
	 * @return void
	 */
	public function connection($connectionName) {
		$this->connection = $connectionName;
		return $this;
	}

   /**
    * get send number
    *
    * @param string $type
    * @return string
    */
	public function getSendNumber($type) {
		return $this->config['numbers'][$type];
	}

    /**
     * Reset ballot for activists
     *
     * @param string $recipients
     * @return bool
     */
    public function resetActivists($recipients) {
		return; // No need to reset in local dialer
		// $config = $this->config; 

        $phoneNumber = $this->getPhoneNumber($recipients);

        $postFields = [
            'phone_number' => $phoneNumber
		];
		$bodyJsonData = json_encode($postFields);
        //set header array
        $myHeader = array(
            "MIME-Version: 1.0",
			"Content-type: application/json",
			'Content-Length: ' . strlen($bodyJsonData)   
        );
        //creating and initiating curl
        $ch = curl_init();
        //setting curl/http headers
        curl_setopt($ch, CURLOPT_POST,1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

        curl_setopt($ch, CURLOPT_POSTFIELDS, $bodyJsonData);
        curl_setopt($ch, CURLOPT_URL, self::BASE_URL . 'activist/reset/');
        $postResult = curl_exec($ch); 
        curl_close($ch);

        //check output
        if ($postResult != "") {
            $resultJson = json_decode($postResult);
            if ((!$resultJson) || $resultJson->status != 69) {
                $returnStatus = false;
            }
        } else {
            $returnStatus = false;
        }
		

		return $returnStatus;

    }
    private function getPhoneNumber($recipients){
        $phoneNumber = null;
        if (is_array($recipients) && count($recipients) > 1) {
            $phoneNumber = $recipients[0];
        } else if(is_string($recipients)){
            $phoneNumber = $recipients;
        } else{
            Log::info('Phone number is not valid ivr: ' . json_encode($recipients));
            return;
        }
        return $phoneNumber;
    }

    //!! No using this function!
    /**
     * Send a new message
     *
     * @param mixed $recipients
     * @param string $message
     * @param string $type
	 *
	 * @return bool
     */	
	public function sendArray($recipients, $type) {
        return false;
    }
    /*

		$config = $this->config; 

		$userName = $config['username'];
		$password = $config['password'];
		$sendNumber = $config['numbers'][$type];

		$basePost = [
		    'UserName' => $userName,
		    'Password' => $password,
		    'RequestJSON'   => [],
		];

		$baseRequestJson = [
			"sendDate" => Carbon::now()->format('d/m/Y H:i:s'),
			"displayNumber" => $sendNumber,
			"sendType" => "VMS",
			"sendMessageslist" => []
		];

		//fill recipients
		$i=0;
		foreach($recipients as $recipient => $message) {
			$phoneList = [
				"phonesList" => [],
				"messageText" => $message
			];

			$phoneList["phonesList"][] = [
				"phoneNumber" => $recipient,
				"customerSendID" => $i
			];

			$baseRequestJson["sendMessageslist"][] = $phoneList;
			$i++;
		}
		
		$basePost["RequestJSON"] = json_encode($baseRequestJson);
		//generate post string
		$postvars = '';
		foreach($basePost as $key=>$value) {
			$postvars .= $key . "=" . $value . "&";
		}

		//set header array
		$myHeader = array(
		    "MIME-Version: 1.0",
		    "Content-type: application/x-www-form-urlencoded"
		);
		//creating and initiating curl
		$ch = curl_init();
		//setting curl/http headers
		curl_setopt($ch, CURLOPT_POST,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

		curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);
		curl_setopt($ch, CURLOPT_URL, 'http://api.progheart.co.il:84/SendMessage');
		$postResult = curl_exec($ch); 
		curl_close($ch);

		//check output
		if ($postResult != "") {
			$resultJson = json_decode($postResult);
			if (($resultJson) && $resultJson->status == 69) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}		
	}
*/

}
