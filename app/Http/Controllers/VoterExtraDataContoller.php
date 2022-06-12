<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voters;
use App\Models\VoterMetaKeys;
use App\Models\VoterMetas;
use App\Models\VoterMetaValues;
use App\Models\ElectionCampaigns;
use Auth;
use Illuminate\Support\Str;

class VoterExtraDataContoller extends Controller {
	/*
		Function that returns voter death data by voterKey
	*/
    public function getVoterDeathData ( $voterKey ) {

        $jsonOutput = app()->make( "JsonOutput" );
        $voter = Voters::select( [ 'deceased_date' ] )->withFilters()->where( 'voters.key', $voterKey )->first();
        $arrDate = explode( '-', $voter->deceased_date );
        if ( sizeof( $arrDate ) == 3 ) {
            $voter->deceased_date = $arrDate[2] . '/' . $arrDate[1] . '/' . $arrDate[0];
        } else {
            $voter->deceased_date = null;
        }
        $jsonOutput->setData( $voter );
    }

	/*
		Function that updates voter death data by voterKey and POST params
	*/
    public function saveVoterDeathData ( Request $request, $voterKey ) {

        $jsonOutput = app()->make( "JsonOutput" );
        $voter = Voters::select(['voters.deceased_date'])->withFilters()->where( 'voters.key', $voterKey )->first();
        if ( $voter ) {
            $voter->deceased_date = ( $request->input( 'death_date' ) == '' || $request->input( 'death_date' ) == null ) ? null : $request->input( 'death_date' );
            $voter->save();
        }
        $jsonOutput->setData( 'ok' );
    }

	/*
		Function that saves voter's existing meta key and its value  
		
		@param $request
		@param $voterKey
	*/
    public function updateExistingKeyValueData ( Request $request, $voterKey ) {

        $jsonOutput = app()->make( "JsonOutput" );
        $currentDate = date( config( 'constants.APP_DATE_DB_FORMAT' ), time() );
        $voter_id = -1;
        $camp_id = -1;
        $tempArray = ElectionCampaigns::select( [ 'id' ] )->where( 'end_date', '>=', $currentDate )->where( 'start_date', '<=', $currentDate )->orderBy( 'end_date', 'desc' )->first();
        if ( $tempArray ) {
            $camp_id = $tempArray->id;
        }
        $voter = Voters::where( 'voters.key', $voterKey )->first();
        if ( $voter ) {
            $voter_id = $voter->id;
        }

        $arrVoterMetas = explode( ';', $request->input( 'keys_array' ) );
        for ( $i = 0; $i < sizeof( $arrVoterMetas ) - 1; $i++ ) {
            $arrRecordData = explode( '~', $arrVoterMetas[$i] );
            $voterMetas = VoterMetas::where( 'voter_id', $voter_id )->where( 'voter_meta_key_id', $arrRecordData[1] )->where( 'election_campaign_id', $camp_id )->first();
            if ( $voterMetas ) {
                if ( $arrRecordData[0] == '0' ) { //from value list
                    $voterMetas->voter_meta_value_id = $arrRecordData[2];
                    $voterMetas->save();
                } elseif ( $arrRecordData[0] == '1' ) { //static text value
                    $voterMetas->value = $arrRecordData[3];
                    $voterMetas->save();
                }

            }
        }
    }

	/*
		Function that insert new voter's meta key and its value  
		
		@param $request
		@param $voterKey
	*/
    public function insertNewKeyValueData ( Request $request, $voterKey ) {

        $jsonOutput = app()->make( "JsonOutput" );
        $currentDate = date( config( 'constants.APP_DATE_DB_FORMAT' ), time() );
        $voter_id = -1;
        $camp_id = -1;
        $tempArray = ElectionCampaigns::select( [ 'id' ] )->where( 'end_date', '>=', $currentDate )->where( 'start_date', '<=', $currentDate )->orderBy( 'end_date', 'desc' )->first();
        if ( $tempArray ) {
            $camp_id = $tempArray->id;
        }

        $voter = Voters::where( 'voters.key', $voterKey )->first();
        if ( $voter ) {
            $voter_id = $voter->id;
        }
        $arrVoterMetas = explode( ';', $request->input( 'keys_array' ) );
        for ( $i = 0; $i < sizeof( $arrVoterMetas ) - 1; $i++ ) {

            $arrRecordData = explode( '~', $arrVoterMetas[$i] );
            $voterMetas = VoterMetas::where( 'voter_id', $voter_id )->where( 'voter_meta_key_id', $arrRecordData[1] )->where( 'election_campaign_id', $camp_id )->first();
            if ( $arrRecordData[0] == '0' ) { //from value list
                if ( !$voterMetas ) {
                    $voterMetas = new  VoterMetas;
                    $voterMetas->voter_id = $voter_id;
                    $voterMetas->voter_meta_key_id = $arrRecordData[1];
                    $voterMetas->voter_meta_value_id = $arrRecordData[2];
                    $voterMetas->election_campaign_id = $camp_id;
                    $voterMetas->value = null;
                    $voterMetas->save();
                } else {
                    $voterMetas->voter_meta_value_id = $arrRecordData[2];
                    $voterMetas->save();
                }

            } elseif ( $arrRecordData[0] == '1' ) { //static text value

                if ( !$voterMetas ) {
                    $voterMetas = new  VoterMetas;
                    $voterMetas->voter_id = $voter_id;
                    $voterMetas->voter_meta_key_id = $arrRecordData[1];
                    $voterMetas->voter_meta_value_id = null;
                    $voterMetas->election_campaign_id = $camp_id;
                    $voterMetas->value = $arrRecordData[3];
                    $voterMetas->save();
                } else {
                    $voterMetas->value = $arrRecordData[3];
                    $voterMetas->save();
                }

            }
        }
    }

	/*
		Function that returns all voter's meta keys and their values 
		
		@param $request
		@param $voterKey
	*/
    public function getAllKeysValuesData ( $voterKey ) {

        $currentDate = date( config( 'constants.APP_DATE_DB_FORMAT' ), time() );
        $jsonOutput = app()->make( "JsonOutput" );
        $tempArray = ElectionCampaigns::select( [ 'id' ] )->where( 'end_date', '>=', $currentDate )->where( 'start_date', '<=', $currentDate )->orderBy( 'end_date', 'desc' )->first();

        $voter = Voters::select( [ 'voters.id' ] )->withFilters()->where( 'voters.key', $voterKey )->first();
        if ( $voter && $tempArray ) {
            $allMetaKeys = VoterMetaKeys::select( [ 'id',
                                                    'key_type',
                                                    'key_name',
                                                    'per_campaign' ] )->where( 'deleted', 0 )->where( 'key_system_name', null )->orWhere( 'key_system_name', '' )->get();
            for ( $i = 0; $i < sizeof( $allMetaKeys ); $i++ ) {
                if ( $allMetaKeys[$i]->key_type == 0 ) { //list of values
                    $allMetaKeys[$i]->valuesList = VoterMetaValues::where( 'voter_meta_key_id', $allMetaKeys[$i]->id )->get();
                    $voterMetaKey = VoterMetas::where( 'voter_id', $voter->id )->where( 'voter_meta_key_id', $allMetaKeys[$i]->id )->where( 'election_campaign_id', $tempArray->id )->first();
                    if ( $voterMetaKey ) {
                        $valueOfKey = VoterMetaValues::where( 'id', $voterMetaKey->voter_meta_value_id )->first();
                        $allMetaKeys[$i]->row_exists = true;
                        $allMetaKeys[$i]->value = $valueOfKey->value;
                    } else {
                        $allMetaKeys[$i]->value = null;
                        $allMetaKeys[$i]->row_exists = false;
                    }
                } elseif ( $allMetaKeys[$i]->key_type == 1 ) { //1 fixed value
                    $voterMetaKey = VoterMetas::where( 'voter_id', $voter->id )->where( 'voter_meta_key_id', $allMetaKeys[$i]->id )->where( 'election_campaign_id', $tempArray->id )->first();
                    if ( $voterMetaKey ) {
                        $allMetaKeys[$i]->value = $voterMetaKey->value;
                        $allMetaKeys[$i]->row_exists = true;
                    } else {
                        $allMetaKeys[$i]->value = null;
                        $allMetaKeys[$i]->row_exists = false;
                    }
                }
            }
            $jsonOutput->setData( $allMetaKeys );
        } else {
            $jsonOutput->setData( array() );
        }

    }

}
