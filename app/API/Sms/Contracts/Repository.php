<?php

namespace App\API\Sms\Contracts;

interface Repository {

	 /**
     * Send sms to recipients
     *
     * @param  array  $recipients
     * @param  string  $recipients
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