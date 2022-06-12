<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Settings;

use Auth;

class SettingsController extends Controller {

	/*
		Function that returns a list of all system setting
	*/
	public function getSystemSettings(){
		 $jsonOutput = app()->make( "JsonOutput" );
		 $resultArray = config('settings');

		 //get the ui settings list and remove everything not in it
		 $uiSettings = $resultArray['ui_settings'];
		 unset($resultArray['ui_settings']);
		 
		 foreach($resultArray as $key=>$value) {
		 	if (!in_array($key, $uiSettings)) unset($resultArray[$key]);
		 }

		 //return the result
		 $jsonOutput->setData($resultArray);
	}

	//get list of errors with error code and hebrew text
	public function getErrorList() {
		$jsonOutput = app()->make( "JsonOutput" );
		$errorModules = config('errors');
		\App::setLocale("he");
		$errorArray = array();
		foreach($errorModules as $errorModule) {
			foreach($errorModule as $error) {
				$errorObject = new \stdclass;
				$errorObject->code = $error;
				$errorObject->message = trans('errors.'.$error);
				array_push($errorArray, $errorObject);
			}
		}
		$jsonOutput->setData($errorArray);
	}

	/*
		Function that returns the system status data
	*/
	public function getSystemStatus(Request $request) {
		$jsonOutput = app()->make( "JsonOutput" );
		$maintenanceDate = config('app.maintenance_date');
		$message = [
			'server' => "ok",
			'authenticated' => (Auth::user() != null)? true : false
		];
		if (!is_null($maintenanceDate)) $message['maintenance'] = $maintenanceDate;
		$jsonOutput->setData($message);
	}
}