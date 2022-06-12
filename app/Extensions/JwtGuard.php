<?php

namespace App\Extensions;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\UserProvider;
use \Firebase\JWT\JWT;
use Carbon\Carbon;

class JwtGuard implements Guard {

	use GuardHelpers;
	/**
     * The request instance.
     *
     * @var \Illuminate\Http\Request
     */
    protected $request;

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
     * The secret key
     *
     * @var string
     */
    protected $secret;

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
        $this->inputKey = config('jwt.token');
        $this->secret = config('jwt.secret');
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
        // echo '$this->token';
        // echo $this->inputKey;
        // echo $this->token;

        if (! empty($this->token)) {
        	$userId = $this->getUserIdFromToken();
            $user = $this->provider->retrieveById($userId);
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
        $token = $this->request->header($this->inputKey);
        
        return $this->token = $token;
    }

    public function getUserIdFromToken() {
    	$decoded = JWT::decode($this->token, $this->secret, array('HS256'));
    	return $decoded->sub;
    }

    public function checkUserActivist($credentials) {
        $user = $this->provider->retrieveByCredentials($credentials);
    	return  $user;
    }
    public function attempt($credentials) {
        $user = $this->provider->retrieveByCredentials($credentials);

    	if ($user != null) {
    		$this->token = $this->generateToken($user);
    		return $user;
        }
    	return null;
    }

    public function generateToken($user) {
    	$secretKey = config('jwt.secret');
        $jwtParams = array(
            "iss" => "https://app.shass.co.il",
            "aud" => "https://app.shass.co.il",
            "iat" => Carbon::now()->timestamp,
            "exp" => Carbon::now()->timestamp + 60*60*10,
            "sub" => $user->id
        );
        $token = JWT::encode($jwtParams, $secretKey);
        return $token;
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

    public function logout(){
      //  $this->token = null;
        return true;
    }

}