<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voters;
use App\Models\VoterMetas;
use App\Models\VoterMetaKeys;
use App\Models\VoterMetaValues;
use App\Libraries\Helper;

use Illuminate\Support\Facades\Validator;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\VoterElectionsController;


class VoterMetaDataContoller extends Controller {

    private $errorMessage;


	/*
		Function that returns all VoterMetaKey
	*/
    public function getMetaDataKeys(Request $request) {
        $keyNames = $request->input( 'key_names', null );

        $fields = ['id', 'key_type', 'key_name', 'max', 'key_system_name', 'per_campaign'];

        if ( $keyNames ) {
            $voterMetaKeys = VoterMetaKeys::select($fields)->where( 'deleted', 0 )
                                          ->whereIn('key_system_name', $keyNames)
                                          ->get();
        } else {
            $voterMetaKeys = VoterMetaKeys::where( [ 'deleted' => 0, 'protected' => 0 ] )
                                          ->select($fields)->get();
        }

        $jsonOutput = app()->make( "JsonOutput" );

        $jsonOutput->setData( $voterMetaKeys );
    }

	/*
		Function that returns MetaDataKeys hash array in order to reuse it
	*/
    public function getMetaDataKeysHash( $keyNames ) {
        $fields = ['id', 'key_type', 'key_name', 'max', 'key_system_name', 'per_campaign'];

        if ( $keyNames != null ) {
            $voterMetaKeys = VoterMetaKeys::where( 'deleted', 0 )
                                          ->whereIn('key_system_name', $keyNames)
                                          ->select($fields)->get();
        } else {
            $voterMetaKeys = VoterMetaKeys::where( [ 'deleted' => 0, 'protected' => 0 ] )
                                          ->select($fields)->get();
        }

        $voterMetaKeysHash = [];

        for ( $keyIndex = 0; $keyIndex < count($voterMetaKeys); $keyIndex++) {
            $metaKeyId = $voterMetaKeys[$keyIndex]->id;
            $voterMetaKeysHash[$metaKeyId] = [
                "id"           => $voterMetaKeys[$keyIndex]->id,
                "key_type"     => $voterMetaKeys[$keyIndex]->key_type,
                "key_name"     => $voterMetaKeys[$keyIndex]->key_name,
                "max"          => $voterMetaKeys[$keyIndex]->max,
                "per_campaign" => $voterMetaKeys[$keyIndex]->per_campaign
            ];
        }

        return $voterMetaKeysHash;
    }

	/*
		Function that returns all VoterMetaValues
	*/
    public function getMetaDataValues(Request $request) {
        $fields = ['id', 'voter_meta_key_id', 'value'];
        $voterMetaValues = VoterMetaValues::where( 'deleted', 0 )->select($fields)->get();

        $jsonOutput = app()->make( "JsonOutput" );

        $jsonOutput->setData( $voterMetaValues );
    }

	/*
		Function that returns metaDataKeyValues by voterKey and POST params
	*/
    public function getVoterMetaDataKeysValues(Request $request , $voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $voterId = $currentVoter->id;
		$electionCampaignId = VoterElectionsController::getLastCampaign();
        $voterMetas = VoterMetas::where('voter_id', $voterId)->where('election_campaign_id' , $electionCampaignId)->get();

        $jsonOutput->setData( $voterMetas );
    }

	/*
		Private helpful function that updates existing meta-value
		
		@param $metaKeyItem
		@param $voterNewMetaValueItem
	*/
    private function updateVoterMetaValue( $metaKeyItem, $voterNewMetaValueItem ) {
        $changedValue = false; // boolean that indicates if value has changed

        $voterMeta = VoterMetas::where('id', $voterNewMetaValueItem['id'])->first();

        // Array for history purpose
        $fieldsArray = [];

        if ( $metaKeyItem['key_type'] == config('constants.VOTER_META_KEY_TYPE_FREE_TEXT') ||
             $metaKeyItem['key_type'] == config('constants.VOTER_META_KEY_TYPE_NUMBER')
           ) {
            // For history purpose
            if ( $voterMeta->value != $voterNewMetaValueItem['value']  ) {
                $changedValue = true;
            } else {
                $changedValue = false;
            }

            $fieldsArray[] = [
                'field_name' => 'value',
                'display_field_name' => config('history.VoterMetas.value'),
                'old_value' => $voterMeta->value,
                'new_value' => $voterNewMetaValueItem['value']
            ];

            $voterMeta->value = $voterNewMetaValueItem['value'];
        } else {
            // For history purpose
            if ( $voterMeta->voter_meta_value_id != $voterNewMetaValueItem['voter_meta_value_id'] ) {
                $changedValue = true;
            } else {
                $changedValue = false;
            }

            $fieldsArray[] = [
                'field_name' => 'voter_meta_value_id',
                'display_field_name' => config('history.VoterMetas.voter_meta_value_id'),
                'old_numeric_value' => $voterMeta->voter_meta_value_id,
                'new_numeric_value' => $voterNewMetaValueItem['voter_meta_value_id']
            ];

            $voterMeta->voter_meta_value_id = $voterNewMetaValueItem['voter_meta_value_id'];
        }

        if ( $changedValue ) {
            $voterMeta->save();

            $modalUpdate = [
                'referenced_model' => 'VoterMetas',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterMeta->id,
                'valuesList' => $fieldsArray
            ];

            return $modalUpdate;
        } else {
            return [];
        }
    }

	/*
		Private helpful function that adds new meta-value
		
		@param $voterId
		@param $metaKeyItem
		@param $voterNewMetaValueItem
	*/
    private function addVoterMetaValue( $voterId, $metaKeyItem, $voterNewMetaValueItem ) {
        $voterMeta = new VoterMetas;

        $fieldsArray = [];

        $voterMeta->voter_id = $voterId;

        $voterMeta->voter_meta_key_id = $metaKeyItem['id'];

        $fieldsArray[] = [
            'field_name' => 'voter_meta_key_id',
            'display_field_name' => config('history.VoterMetas.voter_meta_key_id'),
            'new_numeric_value' => $metaKeyItem['id']
        ];

        if ( $metaKeyItem['key_type'] == config('constants.VOTER_META_KEY_TYPE_FREE_TEXT') ||
             $metaKeyItem['key_type'] == config('constants.VOTER_META_KEY_TYPE_NUMBER')
           ) {
            $fieldsArray[] = [
                'field_name' => 'value',
                'display_field_name' => config('history.VoterMetas.value'),
                'new_value' => $voterNewMetaValueItem['value']
            ];

            $voterMeta->value = $voterNewMetaValueItem['value'];
        } else {
            $fieldsArray[] = [
                'field_name' => 'voter_meta_value_id',
                'display_field_name' => config('history.VoterMetas.voter_meta_value_id'),
                'new_numeric_value' => $voterNewMetaValueItem['voter_meta_value_id']
            ];

            $voterMeta->voter_meta_value_id = $voterNewMetaValueItem['voter_meta_value_id'];
        }

        if ( $metaKeyItem['per_campaign'] == 1 ) {
            $electionCampaignId = VoterElectionsController::getLastCampaign();

            $fieldsArray[] = [
                'field_name' => 'election_campaign_id',
                'display_field_name' => config('history.VoterMetas.election_campaign_id'),
                'new_numeric_value' => $electionCampaignId
            ];

            $voterMeta->election_campaign_id = $electionCampaignId;
        }

        $voterMeta->save();

        $modalAdd = [
            'referenced_model' => 'VoterMetas',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $voterMeta->id
        ];

        return $modalAdd;
    }

	/*
		Private helpful function that validates voter meta-value id number
		
		@param $keyName
		@param $newMetaDataValuesItem
	*/
    private function validateMetaValueId($keyName, $newMetaDataValuesItem) {
		if($newMetaDataValuesItem['voter_meta_value_id'] == '0'){return true;}
        $rules = [
            'voter_meta_value_id' => 'integer|exists:voter_meta_values,id'
        ];

        $validator = Validator::make( ['voter_meta_value_id' => $newMetaDataValuesItem['voter_meta_value_id'] ],
                                      $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = "Key: " + $keyName + ' ' + $messages->first('voter_meta_value_id');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates voter metaValueType of type number
		
		@param $keyName
		@param $keyMaxSize
		@param $fieldValue
	*/
    private function validateVoterMetaValueTypeNumber( $keyName, $keyMaxValue, $fieldValue ) {
        $rules = [
            'value' => 'integer|max:' . $keyMaxValue
        ];

        $validator = Validator::make( ['value' => $fieldValue ], $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = "Key: " + $keyName + ' ' + $messages->first('value');

            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates voter metaValueType of type string
		
		@param $keyName
		@param $keyMaxSize
		@param $fieldValue
	*/
    private function validateVoterMetaValueTypeString( $keyName, $keyMaxSize, $fieldValue ) {
        $rules = [
            'value' => 'max:' . $keyMaxSize
        ];

        $validator = Validator::make( ['value' => $fieldValue ], $rules );
        if ( $validator->fails() ) {
            $messages = $validator->messages();
            $this->errorMessage = "Key: " + $keyName + ' ' + $messages->first('value');

            return false;
        } else {
            return true;
        }
    }

	/*
		Function that updates voter metadata values list by voterKey and POST params
	*/
    public function saveVoterMetaDataValues(Request $request , $voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id' , 'voters.household_id'] );
        if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }

        $voterId = $currentVoter->id;

        $keyNames = $request->input( 'key_names', null );

        $metaKeysHash = $this->getMetaDataKeysHash($keyNames);

        $newMetaDataValuesHash = [];
        $newMetaDataValues = $request->input( 'meta_data_values', null );
		
		
		
        for ( $newIndex = 0; $newIndex < count($newMetaDataValues); $newIndex++ ) {
            $metaKeyId = $newMetaDataValues[$newIndex]['voter_meta_key_id'];

            if ( !isset($metaKeysHash[$metaKeyId]) ) {
                $jsonOutput->setErrorCode( config('errors.elections.INVALID_META_KEY') );
                return;
            }
 
            if ( $metaKeysHash[$metaKeyId]['key_type'] == config('constants.VOTER_META_KEY_TYPE_WITH_VALUES') ) {
                if ( !$this->validateMetaValueId( $metaKeysHash[$metaKeyId]['key_name'],
                    $newMetaDataValues[$newIndex] ) ) {

                    $jsonOutput->setErrorCode( config('errors.elections.INVALID_META_VALUE') );
                    return;
                }
            }

            if ( $metaKeysHash[$metaKeyId]['key_type'] == config('constants.VOTER_META_KEY_TYPE_FREE_TEXT') ) {
                if ( !$this->validateVoterMetaValueTypeString( $metaKeysHash[$metaKeyId]['key_name'],
                    $metaKeysHash[$metaKeyId]['max'],
                    $newMetaDataValues[$newIndex]['value'] ) ) {

                    $jsonOutput->setErrorCode( config('errors.elections.INVALID_META_VALUE') );
                    return;
                }
            }

            if ( $metaKeysHash[$metaKeyId]['key_type'] == config('constants.VOTER_META_KEY_TYPE_NUMBER') ) {
                if ( !$this->validateVoterMetaValueTypeNumber( $metaKeysHash[$metaKeyId]['key_name'],
                    $metaKeysHash[$metaKeyId]['max'],
                    $newMetaDataValues[$newIndex]['value'] ) ) {

                    $jsonOutput->setErrorCode( config('errors.elections.INVALID_META_VALUE') );
                    return;
                }
            }

            $newMetaDataValuesHash[$metaKeyId] = [
                "id"                    => $newMetaDataValues[$newIndex]['id'],
                "voter_meta_key_id"     => $metaKeyId,
                "voter_meta_value_id"   => $newMetaDataValues[$newIndex]['voter_meta_value_id'],
                "value"                 => $newMetaDataValues[$newIndex]['value'],
                "election_campaign_id"  => $newMetaDataValues[$newIndex]['election_campaign_id']
            ];
        }

		$electionCampaignId = VoterElectionsController::getLastCampaign();
        $currentVoterMetas = VoterMetas::where('voter_id', $voterId)->where('election_campaign_id',$electionCampaignId)->get();

        $historyArgsArr = [
            'topicName' => 'elections.voter.additional_data.meta.edit',
            'models' => []
        ];

        for ( $currentIndex = 0; $currentIndex < count($currentVoterMetas); $currentIndex++ ) {
            $metaKeyId =  $currentVoterMetas[$currentIndex]->voter_meta_key_id;

            if ( !isset( $metaKeysHash[$metaKeyId] ) ) {
                continue;
            }

            if ( isset( $newMetaDataValuesHash[$metaKeyId] ) ) {
                $modalUpdate = $this->updateVoterMetaValue( $metaKeysHash[$metaKeyId], $newMetaDataValuesHash[$metaKeyId] );
                if ( count($modalUpdate) > 0 ) {
                    $historyArgsArr['models'][] = $modalUpdate;
                }

                unset($newMetaDataValuesHash[$metaKeyId]);
            } else {
                $where = ['voter_id' => $voterId, 'voter_meta_key_id' => $metaKeyId];
                if ( $metaKeysHash[$metaKeyId]['per_campaign'] == 1 ) {
                    $where['election_campaign_id'] = $currentVoterMetas[$currentIndex]['election_campaign_id'];
                }

                VoterMetas::where($where)->delete();

                $historyArgsArr['models'][] = [
                    'referenced_model' => 'VoterMetas',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $currentVoterMetas[$currentIndex]['id'],
                ];
            }
        }

        foreach ( $newMetaDataValuesHash as $metaKeyId => $value ) {
            $historyArgsArr['models'][] = $this->addVoterMetaValue( $voterId, $metaKeysHash[$metaKeyId], $newMetaDataValuesHash[$metaKeyId] );
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }

        $jsonOutput->setData( $newMetaDataValuesHash );
    }
}