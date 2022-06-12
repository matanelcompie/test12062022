<?php

/*
|----------------------------------
| Json Output for API
|----------------------------------
| this file declares the class that is responsible for the JSON object
| returned ad a response to an API request
| The response contains:
| 1. A status key that holds 'ok' or 'fail'
| 2. A data key that holds the data returned from the request
| 3. If the status is 'fail', a message key is returned with the error message
| This class also sets the HTTP response code according to the status:
| 200 - the status is 'ok'
| 400 area - the status fails
*/

namespace App\Libraries;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use PhpParser\Builder\FunctionLike;
use Barryvdh\Debugbar\Facade as Debugbar;


class JsonOutput {

    //variables to hold status, data and error message
    private $statusCode = null;
    private $isError = false;
    private $errorMessage = null;
    private $data;
    private $errorCode = null;
    private $errorData = null;
    private $bypass = false;
    private $logError = false;

    public function __construct () {
        
        $this->data = null;
        $this->status = 'ok';
        $this->logError = config('app.log_error');
    }

    //return the status code
    public function getStatus () {

        return $this->statusCode;
    }

    //set the response to error, set the error message and the status code
    public function setErrorMessage ( $message, $statusCode = 400 ) {

        $this->isError = true;
        $this->errorMessage = $message;
        if ((func_num_args() > 1)||($this->statusCode == null)) $this->statusCode = $statusCode;
    }

    //get the error message
    public function getErrorMessage () {

        return $this->errorMessage;
    }

    //set the error code
    
    public function setErrorCode($errorCode, $statusCode = 400 ,$e=null) {
        $this->isError = true;
        $this->errorCode =null;

        if($this->isExistErrorCode($errorCode))
        $this->errorCode = $errorCode;
        else if($e){
            throw $e;
        }
        

        if ((func_num_args() > 1)||($this->statusCode == null)) $this->statusCode = $statusCode;
    }
//     public function setErrorByException($e) {
//        if($e->getCode())
//         $this->isError = true;
//        $this->errorCode = $errorCode;
//        if ((func_num_args() > 1)||($this->statusCode == null)) $this->statusCode = $statusCode;
//    }

    //set additional data to be sent with the error response
    public function setErrorData($errorData) {
        Debugbar::addMessage($errorData,'json-error');
        $this->errorData = $errorData;
    }

    //set the response to success and set the reponse data
    public function setData ( $data ) {

        $this->isError = false;
        $this->data = $data;
        $this->statusCode = 200;
    }

    //set true to bypass json response
    public function setBypass($bypass) {
        $this->bypass = $bypass;
    }

    //get bypass setting
    public function bypass() {
        return $this->bypass;
    }

    //create the json output from the private variables
    public function returnJson () {

        $responseObject = new \stdClass;
        if ( $this->isError ) {
            $responseObject->status = "fail";
            if ($this->errorCode != null) {
                $responseObject->error_code = $this->errorCode;
                if ($this->errorMessage == null) {
                    \App::setLocale("he");
                    $this->errorMessage = trans('errors.'.$this->errorCode);
                }
            }
            $responseObject->message = $this->errorMessage;
            if ($this->errorData != null) $responseObject->data = $this->errorData;
            if ($this->logError) $this->logError();
        } else {
            $responseObject->status = "ok";
            $responseObject->data = $this->data;
        }

        return response()->json( $responseObject, $this->statusCode );
    }

    public static function getMessageErrorByErrorCode($error_code){
      $errorMessage = trans('errors.'.$error_code);

      return $errorMessage;
    }

    /**
     * Log error to logger as debug
     *
     * @return void
     */
    private function logError() {
        $userId = 0;
        $userType = "Internal";
        $user = Auth::user();
        if ($user) $userId = $user->id;
        if (($user != null) && ($user->name != null)) $userType = "External";
        Log::debug("User ID: ".$userId.", ".$userType.", Error Code: ".$this->errorCode.", Error: ".$this->errorMessage);
        Log::debug("Path: ".request()->path());
        Log::debug("params: ".json_encode(request()->all()));
    }

    //the function check if has error code kry like E1220...
    private function isExistErrorCode($errorCodeKey){

       $arrErrorKey= config('errors');
       foreach ($arrErrorKey as $key => $keyGroupError) {
          foreach ($keyGroupError as $key => $errorKey) 
             if(strcmp($errorKey,$errorCodeKey)==0)
             return true;
       }
       return false;
    }

}
