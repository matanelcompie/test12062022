<?php

namespace App\Http\Controllers;

use App\Models\Voters;
use App\Models\ShasRepresentative;
use App\Models\ShasRepresentativeRoles;

use App\Libraries\Helper;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\ActionController;


class ShasRepresentativeController extends Controller {

    private $errorMessage;


	/*
		Private helpful function that gets as param the voterKey  and returns
		voter's shas representative details if they exist , or NULLs
	*/
    private function getVoterRepresentative($voterKey) {
        $representativeFields = [
            'shas_representative_roles.name as shas_representative_role_name',
            'cities.name as shas_representative_city_name'
        ];

        $representativeDetails = Voters::where('voters.key', $voterKey)->first(['voters.id'])
                                       ->getRepresentativeDetails()
                                       ->select($representativeFields)
                                       ->withRoles()->withCities()
                                       ->where(function($query) {
                                           $query->orWhere('shas_representatives.start_date', '<=', DB::raw('NOW()'))
                                                 ->orWhereNull('shas_representatives.start_date');
                                       })
                                       ->where(function($query) {
                                           $query->orWhere('shas_representatives.end_date', '>=', DB::raw('NOW()'))
                                                 ->orWhereNull('shas_representatives.end_date');
                                       })
                                       ->first();

        if (null == $representativeDetails) {
            $voterRepresentative['shas_representative_role_name'] = null;
            $voterRepresentative['shas_representative_city_name'] = null;
        } else {
            $voterRepresentative['shas_representative_role_name'] = $representativeDetails->shas_representative_role_name;
            $voterRepresentative['shas_representative_city_name'] = $representativeDetails->shas_representative_city_name;
        }

        return $voterRepresentative;
    }

	/*
		Function that checks if voter is shas representative , and returns his
		details , or null if don't exist
		
		@param voterKey
	*/
    public function getRepresentativeDetails($voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $representativeFields = [
            'shas_representatives.id',
            'shas_representatives.key',
            'shas_representatives.city_id',
            'shas_representatives.shas_representative_role_id as role_id',
            'shas_representatives.start_date',
            'shas_representatives.end_date',
            'shas_representative_roles.name as role_name',
            'cities.name as city_name'
        ];

        $voterExist = Voters::select('voters.id')->where('voters.key', $voterKey)->first();
        if (null == $voterExist) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voter = Voters::withFilters()->where('voters.key', $voterKey)->first(['voters.id']);
        if ($voter == null) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $allRepresentativeRoles = Voters::where('voters.key', $voterKey)->first( ['voters.id'] )
                                        ->getRepresentativeDetails()
                                        ->select($representativeFields)
                                        ->withRoles()->withCities()->get();

        $voterRepresentative = $this->getVoterRepresentative($voterKey);

        $representativeDetails = [
            'allRepresentativeRoles' => $allRepresentativeRoles,
            'shas_representative_role_name' => $voterRepresentative['shas_representative_role_name'],
            'shas_representative_city_name' => $voterRepresentative['shas_representative_city_name']
        ];

        $jsonOutput->setData( $representativeDetails );
    }

	/*
		Function that returns a list of all ShasRepresentativeRoles
	*/
    public function getRepresentativeRoles() {
        $representativeRoles = ShasRepresentativeRoles::where('deleted', 0)->get();
        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setData( $representativeRoles );
    }

	/*
		Private helpful function that insert voter's shas representative details
		into reusable hash
		
		@param $voterId
	*/
    private function getVoterCurrentRepresentativesHash($voterId) {
        $fields = ['id', 'key', 'city_id', 'shas_representative_role_id', 'start_date', 'end_date'];

        $voterCurrentRepresentatives = ShasRepresentative::select($fields)
                                                          ->where(['voter_id' => $voterId,
                                                                   'deleted' => 0
                                                                  ])
                                                          ->get();
        $voterCurrentRepresentativesHash = [];
        for ( $index = 0; $index < count($voterCurrentRepresentatives); $index++ ) {
            $key = $voterCurrentRepresentatives[$index]->key;

            $voterCurrentRepresentativesHash[$key] = [
                'id' => $voterCurrentRepresentatives[$index]->id,
                'key' => $voterCurrentRepresentatives[$index]->key,
                'city_id' => $voterCurrentRepresentatives[$index]->city_id,
                'shas_representative_role_id' => $voterCurrentRepresentatives[$index]->shas_representative_role_id,
                'start_date' => $voterCurrentRepresentatives[$index]->start_date,
                'end_date'   => $voterCurrentRepresentatives[$index]->end_date
            ];
        }

        return $voterCurrentRepresentativesHash;
    }

}