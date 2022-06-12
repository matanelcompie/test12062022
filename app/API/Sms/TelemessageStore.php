<?php

namespace App\API\Sms;

use App\API\Sms\Contracts\Store;

use grinfeld\phpjsonable\utils\streams\StringInputStream;
use grinfeld\phpjsonable\utils\streams\StringOutputStream;
use telemessage\web\services\AuthenticationDetails;
use telemessage\web\services\FileMessage;
use telemessage\web\services\Message;
use telemessage\web\services\Recipient;
use telemessage\web\TeleMessage;

class TelemessageStore implements Store {

	/**
     * Config of sms
     *
     * @var array
     */
	protected $config;

	/**
     * Authentication object
     *
     * @var telemessage\web\services\AuthenticationDetails
     */
	protected $auth;

    /**
     * Construct a new TelemessageStore
     *
     * @param array $config
     */
	public function __construct($config) {

		$this->config = $config;
		$this->connection = $connection ? $connection :'default';

		$this->setCredentials();
	}

    /**
     * Set credentials for Telemessage
     *
     */
	public function setCredentials() {

		$auth = new AuthenticationDetails();
		$auth->setUsername($this->config[$this->connection]['username']);
		$auth->setPassword($this->config[$this->connection]['password']);
		$this->auth = $auth;
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

		$m = new Message();
		$m->setTextmessage($message);

		$recipientsArray = array();
		if (is_string($recipients)) array_push($recipientsArray, $recipients);
		else $recipientsArray = $recipients;
		foreach($recipientsArray as $recipient) {
			$recp = new Recipient();
			$recp->setType("SMS");
			$recp->setValue($recipient);
			$m->addRecipient($recp);
		}

		$output = new StringOutputStream();
		TeleMessage::encode(array($this->auth, $m), $output);

		$myHeader = array(
		    "MIME-Version: 1.0",
		    "Content-type: text/json; charset=utf-8" // define content type JSON
		);
		//creating and initiating curl
		$ch = curl_init();
		//setting curl/http headers
		curl_setopt($ch, CURLOPT_POST,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $myHeader);

		curl_setopt($ch, CURLOPT_POSTFIELDS, $output->toString());
		curl_setopt($ch, CURLOPT_URL, TeleMessage::getSendURL());
		$postResult = curl_exec($ch); 
		curl_close($ch);

		if ($postResult != "") {
		    $res = TeleMessage::decode(new StringInputStream($postResult));
		    if ($res->getResultCode() == TeleMessage::SUCCESS_SEND) {
		        return true;
		    } else {
		        return false;
		    }
		} else {
			return false;
		}
	}

   /**
    * get send number
    *
    * @return string
    */
	public function getSendNumber() {
		return $this->config['send_number'];
	}
}