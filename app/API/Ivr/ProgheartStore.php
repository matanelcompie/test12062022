<?php

namespace App\API\Ivr;

use App\API\Ivr\Contracts\Store;

use Carbon\Carbon;

class ProgheartStore implements Store {

	/**
     * Config of sms
     *
     * @var array
     */
	protected $config;

    /**
     * Construct a new ProgheartStore
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
	public function send($recipients, $message, $type ,$data =null) {
		return true; //!! ProgheartStore not working!!!!!!!!!!!!!!!!!

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
			"sendMessageslist" => [],
			"vmsTryToSendCount" => 20,
			"vmsIntervalMinForRetry" => 6*60 //in seconds
		];

		$phoneList = [
			"phonesList" => [],
			"messageText" => $message
		];

		//fill recipients
		$recipientsArray = array();
		if (is_string($recipients)) array_push($recipientsArray, $recipients);
		else $recipientsArray = $recipients;
		$recepientString = "";
		$i=0;
		foreach($recipientsArray as $recipient) {
			$phoneList["phonesList"][] = [
				"phoneNumber" => $recipient,
				"customerSendID" => $i
			];
			$i++;
		}

		$baseRequestJson["sendMessageslist"][] = $phoneList;

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
		$config = $this->config; 

		$userName = $config['username'];
		$password = $config['password'];

		$basePost = [
		    'UserName' => $userName,
		    'Password' => $password,
		    'RequestJSON'   => [],
		];

		$returnStatus = true;

		//fill recipients
		$recipientsArray = array();
		if (is_string($recipients)) array_push($recipientsArray, $recipients);

		foreach($recipientsArray as $recipient) {

			$post = $basePost;
			$post['RequestJSON'] = ltrim($recipient, "0");

			//generate post string
			$postvars = '';
			foreach($post as $key=>$value) {
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
			curl_setopt($ch, CURLOPT_URL, 'http://api.progheart.co.il:84/resetPhone');
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
		}

		return $returnStatus;

    }
}