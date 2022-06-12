<?php

namespace App\Extensions;

use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\UserProvider;
use \Firebase\JWT\JWT;
use Carbon\Carbon;

class externalUserGuard implements Guard {

	use GuardHelpers;
	/**
     * The request instance.
     *
     * @var \Illuminate\Http\Request
     */
    protected $request;

    /**
     * The name of the header key item from the request containing the API token.
     *
     * @var string
     */
    protected $headerKey;

    /**
     * The name of the query string item from the request containing the API token.
     *
     * @var string
     */
    protected $inputKey;

    /**
     * The api token
     *
     * @var string
     */
    protected $token;


    /**
     * Create a new authentication guard.
     *
     * @param  \Illuminate\Contracts\Auth\UserProvider  $provider
     * @param  \Illuminate\Http\Request  $request
     * @return void
     */
    public function __construct(UserProvider $provider, Request $request)
    {
        $this->request = $request;
        $this->provider = $provider;
        $this->headerKey = config('auth.header_token_key');
        $this->inputKey = config('auth.query_token_key');
        $this->token = null;
    }

    /**
     * Get the currently authenticated user.
     *
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function user()
    {
        // If we've already retrieved the user for the current request we can just
        // return it back immediately. We do not want to fetch the user data on
        // every call to this method because that would be tremendously slow.
        if (! is_null($this->user)) {
            return $this->user;
        }
        $user = null;

        if (is_null($this->token)) {
        	$this->getTokenForRequest();
        }


        if (! empty($this->token)) {
            $user = $this->provider->retrieveByCredentials(['token' => $this->token]);
        }

        return $this->user = $user;
    }

    /**
     * Get the token for the current request.
     *
     * @return string
     */
    public function getTokenForRequest()
    {
        $token = $this->request->header($this->headerKey);
        if ($token == null) $token = $this->request->get($this->inputKey);

        return $this->token = $token;
    }


    public function attempt($credentials) {
    	$user = $this->provider->retrieveByCredentials($credentials);
    	if ($user != null) {
    		return true;
    	}
    	return false;
    }


    /**
     * Validate a user's credentials.
     *
     * @param  array  $credentials
     * @return bool
     */
    public function validate(array $credentials = [])
    {
        if (count($credentials) == 0) {
            return false;
        }

        if ($this->provider->retrieveByCredentials($credentials)) {
            return true;
        }

        return false;
    }

    public function token() {
    	return $this->token;
    }
}