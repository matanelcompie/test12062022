<?php

namespace App\API\Ivr;

use App\API\Ivr\Contracts\Store;
use Illuminate\Support\Facades\Log;

class LogStore implements Store {

	/**
     * Config of ivr
     *
     * @var array
     */
	protected $config;

    /**
     * Construct a new LogStore
     *
     * @param array $config
     */
	public function __construct($config) {

		$this->config = $config;
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
	public function send($recipients, $message, $type) {

		$recipientsArray = array();
		if (is_string($recipients)) array_push($recipientsArray, $recipients);
		else $recipientsArray = $recipients;
		foreach($recipientsArray as $recipient) {
			Log::info('Sending Ivr message to: '.$recipient);
			Log::info($message);
		}

		return true;
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
        return true;
    }

   /**
    * get send number
    *
    * @param string $type
    * @return string
    */
	public function getSendNumber($type) {
		return $this->config['numbers']['default'];
	}

    /**
     * Reset ballot for activists
     *
     * @param string $recipients
     * @return bool
     */
    public function resetActivists($recipients) {

        $recipientsArray = array();
        if (is_string($recipients)) array_push($recipientsArray, $recipients);
        else $recipientsArray = $recipients;
        foreach($recipientsArray as $recipient) {
            Log::info('Activist ballot reset to: '.$recipient);
        }

        return true;        
    }

}