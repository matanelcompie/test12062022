<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

use HouseHoldsService;

class HouseholdController extends Controller {

	/*
		Function that performs search of households , by POST params
	*/
    public function search(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $result = HouseHoldsService::search( $jsonOutput, $request);
        if($result){
            $jsonOutput->setData($result);
        }
    }

	/*
		Function that updates support statuses by POST params
	*/
    public function updateSupportStatus(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $result = HouseHoldsService::updateSupportStatus( $jsonOutput, $request);
        if($result){
            $jsonOutput->setData($result);
        }
    }


	/*
		Function that returns households list with data stats
	*/
    public function household(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $result = HouseHoldsService::household( $jsonOutput, $request);
        if($result){
            $jsonOutput->setData($result);
        }
    }

	/*
		Function that adds households to captain fifty
	*/
    public function addHouseholdsToCaptain50(Request $request, $captain_key) {
        $jsonOutput = app()->make("JsonOutput");

        $result = HouseHoldsService::addHouseholdsToCaptain50($jsonOutput, $request, $captain_key);
        if($result){
            $jsonOutput->setData($result);
        }
    }

	/*
		Function that deletes households from  captain fifty
	*/
    public function deleteHouseholdsOfCaptain50(Request $request, $captain_key) {
        $jsonOutput = app()->make("JsonOutput");

        $result = HouseHoldsService::deleteHouseholdsOfCaptain50($jsonOutput, $request, $captain_key);
        if($result){
            $jsonOutput->setData($result);
        }
    }
    /*
		Function that adds all ballot households to captain fifty
	*/
    public function addAllBallotBoxHouseholdsToCaptain50( $captain_key, $ballot_key = null) {
        $jsonOutput = app()->make("JsonOutput");

        $result = HouseHoldsService::addAllBallotBoxHouseholdsToCaptain50($jsonOutput, $captain_key, $ballot_key);
        if($result){
            $jsonOutput->setData($result);
        }
    }

}

