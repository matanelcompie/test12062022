<?php

namespace App\API\Ivr;

use App\API\Ivr\Contracts\Repository as IvrRepository;

class Repository implements IvrRepository {

	/**
     * The ivr store implementation.
     *
     * @var \Illuminate\Contracts\Cache\Store
     */
	protected $store;

	/**
     * Create a new ivr repository instance.
     *
     * @param  \App\API\Ivr\Contracts\Store  $store
     * @return void
     */
	public function __construct($store) {
		$this->store = $store;
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
        return $this->store->sendArray($recipients, $type);
    }

	/**
     * Send a new message from the store
     *
     * @param mixed $recipients
     * @param string $message
     * @param string $type
	 *
	 * @return bool
     */	
	public function send($recipients, $message, $type, $data) {
		return $this->store->send($recipients, $message, $type, $data);
	}

    /**
     * get send number
     *
     * @param string $type
     * @return string
     */
    public function getSendNumber($type) {
        return $this->store->getSendNumber($type);
    }

    /**
     * Reset ballot for activists
     *
     * @param string $recipients
     * @return bool
     */
    public function resetActivists($recipients) {
        return $this->store->resetActivists($recipients);
    }
}
