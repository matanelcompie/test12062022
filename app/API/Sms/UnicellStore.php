<?php

namespace App\API\Sms;

use App\API\Sms\Contracts\Store;
use Illuminate\Support\Facades\Log;
use Barryvdh\Debugbar\Facade as Debugbar;

class UnicellStore implements Store {

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
		$this->connection = $connection ? $connection : 'default';
		$this->baseXml = '<?xml version="1.0" encoding="UTF-8"?>
			<sms>
			<account>
			<id>{USER_NAME}</id>
			<password>{PASSWORD}</password>
			</account>
			<attributes>
			<replyPath>{REPLY_NUMBER}</replyPath>
			</attributes>
			<schedule>
			<relative>0</relative>
			</schedule>
			<targets>
			{TARGETS}
			</targets>
			<data>{MESSAGE}</data>
			</sms>';
	}

    /**
     * Send a new message
     *
     * @param mixed $recipients
     * @param string $message
	 *
	 * @return bool
     */	
	public function send($recipients, $message) {

		//set xml string
		$xmlString = $this->baseXml;

		if (!array_key_exists($this->connection, $this->config)) return false;

		$config = $this->config[$this->connection]; 

		//fill placeholders
		$xmlString = str_replace("{USER_NAME}", $config['username'] , $xmlString);
		$xmlString = str_replace("{PASSWORD}", $config['password'] , $xmlString);
		$xmlString = str_replace("{REPLY_NUMBER}", $config['send_number'] , $xmlString);
		$xmlString = str_replace("{MESSAGE}", $message , $xmlString);

		//Log::info("unicell- sms-request:". json_encode([ 'message' => $message, 'send_number'=> $recipients]));
	
		//fill recipients
		$recipientsArray = array();
		if (is_string($recipients)) array_push($recipientsArray, $recipients);
		else $recipientsArray = $recipients;
		$recepientString = "";
		foreach($recipientsArray as $recipient) {
			$number = "972".ltrim($recipient, "0");
			$recepientString .= '<cellphone>'.$number.'</cellphone>';
		}

		$xmlString = str_replace("{TARGETS}", $recepientString , $xmlString);

		//set header array
		$myHeader = array(
		    "MIME-Version: 1.0",
		    "Content-type: text/xml; charset=utf-8" // define content type JSON
		);
		Debugbar::addMessage(json_encode([ 'message' => $message, 'send_number'=> $recipients]), 'unicell-send');
		//creating and initiating curl
		$ch = curl_init();
		//setting curl/http headers
		curl_setopt($ch, CURLOPT_POST,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

		curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlString);
		curl_setopt($ch, CURLOPT_URL, 'http://api.soprano.co.il');
		$postResult = curl_exec($ch); 
		curl_close($ch);
		// Log::info("unicell sms-response: ". json_encode($recipients) .' -> '. $postResult);
		
		//check output
		if ($postResult != "") {
		    if (strpos($postResult, "<code>0</code>") !== FALSE) {
				Debugbar::addMessage(json_encode([ 'response' => $postResult, 'send_number'=> $recipients]), 'unicell-send-success');
		        return true;
		    } else {
				Debugbar::addMessage(json_encode([ 'response' => $postResult, 'send_number'=> $recipients]), 'unicell-send-error');
		        return false;
		    }
		} else {
			Debugbar::addMessage(json_encode([ 'response' => $postResult, 'send_number'=> $recipients]), 'unicell-send-error');
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