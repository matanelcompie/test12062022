<?php

namespace App\API\Sms;

use App\API\Sms\Contracts\Store;
use Illuminate\Support\Facades\Log;

class LogStore implements Store {

	/**
     * Config of sms
     *
     * @var array
     */
	protected $config;

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
	public function send($recipients, $message) {

		$recipientsArray = array();
		if (is_string($recipients)) array_push($recipientsArray, $recipients);
		else $recipientsArray = $recipients;
		foreach($recipientsArray as $recipient) {
			Log::info('Sending Sms message to: '.$recipient);
			Log::info($message);
		}

		return true;
	}

	/**
	 * Change connection
	 *
	 * $param string connection name
	 *
	 * @return void
	 */
	public function connection($connectionName) {
		return $this;
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