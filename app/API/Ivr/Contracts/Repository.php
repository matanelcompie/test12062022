<?php

namespace App\API\Ivr\Contracts;

interface Repository {

    /**
     * Send a new message
     *
     * @param mixed $recipients
     * @param string $message
     * @param string $type
     *
     * @return bool
     */ 
    public function sendArray($recipients, $type);

	 /**
     * Send ivr to recipients
     *
     * @param  array  $recipients
     * @param  string  $message
     * @param  string  $type
     * @return bool
     */

	public function send($recipients, $message, $type, $data);

   /**
    * get send number
    *
    * @param  string  $type
    * @return string
    */
	public function getSendNumber($type);

    /**
     * Reset ballot for activists
     *
     * @param string $recipients
     * @return bool
     */
    public function resetActivists($recipients);
}