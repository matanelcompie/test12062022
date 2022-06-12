<?php

namespace App\API\Sms\Contracts;

interface Store {

    /**
     * Send a new message
     *
     * @param mixed $recipients
     * @param string $message
	 *
	 * @return bool
     */	
	public function send($recipients, $message);

	/**
	 * Change connection
	 *
	 * $param string connection name
	 *
	 * @return Store
	 */
	public function connection($connectionName);

   /**
    * get send number
    *
    * @return string
    */
	public function getSendNumber();
}

