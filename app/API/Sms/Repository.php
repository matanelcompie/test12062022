<?php

namespace App\API\Sms;

use App\API\Sms\Contracts\Repository as SmsRepository;

class Repository implements SmsRepository {

	/**
     * The sms store implementation.
     *
     * @var \Illuminate\Contracts\Cache\Store
     */
	protected $store;

	/**
     * Create a new sms repository instance.
     *
     * @param  \App\API\Sms\Contracts\Store  $store
     * @return void
     */
	public function __construct($store) {
		$this->store = $store;
	}

	/**
     * Send a new message from the store
     *
     * @param mixed $recipients
     * @param string $message
	 *
	 * @return bool
     */	
	public function send($recipients, $message, $waitToResponse = true) {
		return $this->store->send($recipients, $message, $waitToResponse);
	}

   /**
    * Change connection
    *
    * $param string connection name
    *
    * @return void
    */
   public function connection($connectionName) {
        return $this->store->connection($connectionName);
   }

   /**
    * get send number
    *
    * @return string
    */
   public function getSendNumber() {
    return $this->store->getSendNumber();
   }

}
