<?php

namespace App\API\Sms;

use App\API\Sms\Contracts\Store;

use Illuminate\Support\Facades\Log;
use Barryvdh\Debugbar\Facade as Debugbar;


class PaycallStore implements Store {

	/**
     * Config of sms
     *
     * @var array
     */
	protected $config;

	/**
     * connection of sms
     *
     * @var array
     */
	protected $connection;

	/**
     * Base XML string for sending
     *
     * @var string
     */
	protected $baseXml;

    /**
     * Construct a new UnicellStore
     *
     * @param array $config
     */
	public function __construct($config, $connection = null) {

		$this->config = $config;
		$this->connection = $connection ? $connection :'default';
	}

    /**
     * Send a new message
     *
     * @param mixed $recipients
     * @param string $message
	 *
	 * @return bool
     */	
	public function send($recipients, $message, $waitToResponse = true) {

		if (!array_key_exists($this->connection, $this->config)) return false;

		$config = $this->config[$this->connection]; 
		//fill placeholders
		$smsData = array();
		$smsData['user'] = $config['username'];
		$smsData['password'] = $config['password'];
		$smsData['from'] = $config['send_number'];
		$smsData['message'] = $message;

		if(!$waitToResponse){
			$smsData['type'] = 'fast';
		}

		//fill recipients

		if (is_string($recipients)) { $smsData['recipient'] = $recipients; }
		else { $smsData['recipient'] = implode(",", $recipients); }
		//set header array
		$myHeader = array(
		    "charset=UTF-8" // define content type UTF-8
		);
		//creating and initiating curl
		// Log::info("sms-request:". json_encode([ 'message' => $smsData['message'], 'recipient' => $smsData['recipient'], 'from' => $smsData['from'], 'is_fast' => !$waitToResponse]));
		Debugbar::addMessage(utf8_encode(json_encode(['message' => $smsData['message'], 'recipient' => $smsData['recipient'], 'from' => $smsData['from'], 'is_fast' => !$waitToResponse])), 'paycall-send');
		$ch = curl_init();
		//setting curl/http headers
		curl_setopt($ch, CURLOPT_POST,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

		curl_setopt($ch, CURLOPT_POSTFIELDS, $smsData);
		curl_setopt($ch, CURLOPT_URL, 'https://api.multisend.co.il/MultiSendAPI/sendRecipientArray');
		$postResult = curl_exec($ch);
		// Log::info("sms-response: " . $smsData['recipient'] . ' -> ' . $postResult);
		Debugbar::addMessage($smsData['recipient'] . ' -> ' . $postResult, 'paycall-send-response');
		curl_close($ch);
		//check output
		$postResultJson = json_decode($postResult);
		try {
			if (!empty($postResultJson) && is_array($postResultJson) && count($postResultJson) > 0 &&  $postResultJson[0]->success == "true") {
				return true;
			} else {
				return false;
			}
		} catch (\Throwable $th) {
			// Log::info("sms-error - $th");
			Debugbar::addMessage($th, 'paycall-send-error');
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
    * @return string
    */
	public function getSendNumber() {
		if (!array_key_exists($this->connection, $this->config)) return false;
		$config = $this->config[$this->connection]; 
		return $config['send_number'];
	}
}