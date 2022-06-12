<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use Auth;
use App\Libraries\Helper;
use App\Libraries\Address;

use App\Models\Voters;
use App\Models\VoterPhone;
use App\Models\VoterTransportation;
use App\Models\VotersInGroups;
use App\Models\InstituteRolesByVoters;
use App\Models\PhoneTypes;
use App\Models\ManualVoterUpdates;
use App\Models\SupportStatus;
use App\Models\VoterSupportStatus;

use App\Http\Controllers\VoterElectionsController;
use App\Http\Controllers\ActionController;


class VotersManualController extends Controller {

    /*
		Private helpful function that validates personalIdentity number
	*/
    private function validatePersonalIdentity($personalIdentity) {
        $pattern = '/^[0-9]{2,10}$/';

        return preg_match($pattern, $personalIdentity);
    }

	/*
		Function that returns voter info by personal_identity
	*/
    public function getVoterByIdentityOrKey(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $personalIdentity = $request->input('personal_identity', null);
        $voterKey = $request->input('voter_key', null);

        $fields = [
            'id',
            'key',
            'personal_identity',
            'first_name',
            'last_name'
        ];
        if (!$this->validatePersonalIdentity($personalIdentity) && !$this->validatePersonalIdentity($voterKey)) {
            $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
            return;
        }
        // dd('$voterKey', $voterKey);

        $voterFilters = null;
        $voterFilters = Voters::withFilters()->select('voters.id');
        
        if($personalIdentity){
            $personalIdentity = ltrim( $personalIdentity,"0");
            $voterFilters->where('personal_identity', $personalIdentity);
        } else {
            $voterFilters->where('key', $voterKey);
        }
        $voterFilters = $voterFilters->first();

        if ( is_null($voterFilters) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
            return;
        }

        $voter = Voters::select($fields)
			->whereHas('votersInElectionCampaigns');

        if($personalIdentity){
            $voter->where('personal_identity', $personalIdentity);
        } else {
            $voter->where('key', $voterKey);
        }

        $voter = $voter->first();

        $jsonOutput->setData($voter);
    }

	/*
		Private helpful function that returns voter details by voterKey
	*/
    private function getVoterDetails($voterKey, $currentElectionCampignId)  {

        $voterFields = [
            'voters.id',
            'voters.key',
            'voters.first_name',
            'voters.last_name',
            'voters.personal_identity',
            'voters.actual_address_correct',
            'voters.verified_address',
            'voters.household_id',

            'voters.city_id',
            'c.name as city_name',

            'voters.neighborhood',

            'voters.street_id',
            'streets.name as street_name',
            'voters.street',

            'voters.house',
            'voters.house_entry',
            'voters.flat',
            'voters.zip',

            'voters.email',
            'voters.main_voter_phone_id',

            'voters.strictly_orthodox',
            'voters.gender',

            'voters.sephardi',
            'voters.religious_group_id',
            'voters.ethnic_group_id',
            'ethnic_groups.name as ethnic_group_name',
            'religious_groups.name as religious_group_name',
            
            'vs0.id as voter_support_status_id0',
            'vs0.support_status_id',
            'support_status.key as support_status_key',
            'support_status.name as support_status_name',
            'support_status.level as support_status_level',

            'voter_transportations.id as voter_transportation_id',
            'voter_transportations.cripple',
            'voter_transportations.from_time',
            'voter_transportations.to_time'  
			
        ];

        $voterObj = Voters::select($voterFields)
            ->withCity()
            ->withStreet(true)
            ->withSupportStatus0($currentElectionCampignId)
            ->withTransportation($currentElectionCampignId)
            ->withEthnic()
			->withReligiousGroup()
            ->with(['electionRolesByVoter' => function($qr) use ($currentElectionCampignId) {
                $fields = [
                    'election_roles_by_voters.id',
                    'election_roles_by_voters.voter_id',
                    'election_roles.name as election_role_name'
                ];

                $qr->addSelect($fields)
                    ->withElectionRole()
                    ->where('election_roles_by_voters.election_campaign_id', $currentElectionCampignId);
            }])
            ->with(['voterPhones' => function($innerQuery){$innerQuery->where('wrong', 0);}
        ])
        ->where('voters.key', $voterKey)
        ->first();
        $voter = $voterObj;
        $voter->phones = $voterObj->voterPhones;
 
		$voter->institute = InstituteRolesByVoters::select("institutes.id" , "institutes.name")
													->join('institutes', 'institutes.id', '=', 'institute_roles_by_voters.institute_id')
													->where('institute_roles_by_voters.voter_id' ,$voter->id)
													->where('institutes.deleted',0)
													->first()
													;
		$voter->institute_role = InstituteRolesByVoters::select("institute_roles.id" , "institute_roles.name")
													->join('institute_roles', 'institute_roles.id', '=', 'institute_roles_by_voters.institute_role_id')
													->where('institute_roles_by_voters.voter_id' ,$voter->id)
													->where('institute_roles.deleted',0)
													->first()
													;
        return $voter;
    }

	/*
		Function that returns voter info formatted for manual-update usage in UI
	*/
    public function getVoterForManualUpdate($voterKey) {
        $jsonOutput = app()->make("JsonOutput");

        $currentElectionCampignId = VoterElectionsController::getLastCampaign();
        $voter = $this->getVoterDetails($voterKey, $currentElectionCampignId);

        $jsonOutput->setData($voter);
    }

	/*
		Private helpful function that saves VoterTransport of specific voter 
		
		@param $voterId
		@param $selectedVoterData
	*/
    private function saveVoterTransport($voterData, $selectedVoterData) {
        if ( is_null($voterData->voter_transportation_id) && is_null($selectedVoterData['newFieldsValues']['cripple']['id']) ) {
            return [];
        }

        $model = [];
        $changedValues = [];

        if ( is_null($voterData->voter_transportation_id) ) {
            $voterTransportation = new VoterTransportation;
            $voterTransportation->key =  Helper::getNewTableKey('voter_transportations', 5);
            $voterTransportation->election_campaign_id = VoterElectionsController::getLastCampaign();
            $voterTransportation->voter_id = $voterData->id;
            $voterTransportation->cripple = $selectedVoterData['newFieldsValues']['cripple']['id'];
            $voterTransportation->from_time = $selectedVoterData['newFieldsValues']['from_time'];
            $voterTransportation->to_time = $selectedVoterData['newFieldsValues']['to_time'];
            $voterTransportation->save();

            $fields = [
                'election_campaign_id',
                'voter_id',
                'cripple',
                'from_time',
                'to_time'
            ];

            for ( $fileldIndex = 0; $fileldIndex < count($fields); $fileldIndex++ ) {
                $fieldName = $fields[$fileldIndex];

                if ( 'from_time' == $fieldName || 'to_time' == $fieldName ) {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.VoterTransportation.' . $fieldName),
                        'new_value' => $voterTransportation->{$fieldName}
                    ];
                } else {
                    $changedValues[] = [
                        'field_name' => $fieldName,
                        'display_field_name' => config('history.VoterTransportation.' . $fieldName),
                        'new_numeric_value' => $voterTransportation->{$fieldName}
                    ];
                }

                $model = [
                    'description' => 'הוספת הסעה לתושב מטופס קליטה',
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $voterTransportation->id,
                    'valuesList' => $changedValues
                ];
            }
        } else {
            $voterTransportation = VoterTransportation::select(['id', 'cripple', 'from_time', 'to_time'])
                ->where('id', $voterData->voter_transportation_id)
                ->first();

            if ( !is_null($selectedVoterData['newFieldsValues']['cripple']['id']) ) {
                if ($selectedVoterData['newFieldsValues']['cripple']['id'] != $voterTransportation->cripple) {
                    $changedValues[] = [
                        'field_name' => 'cripple',
                        'display_field_name' => config('history.VoterTransportation.cripple'),
                        'old_numeric_value' => $voterTransportation->cripple,
                        'new_numeric_value' => $selectedVoterData['newFieldsValues']['cripple']['id']
                    ];

                    $voterTransportation->cripple = $selectedVoterData['newFieldsValues']['cripple']['id'];
                }

                if ($selectedVoterData['newFieldsValues']['from_time'] != $voterTransportation->from_time) {
                    $changedValues[] = [
                        'field_name' => 'from_time',
                        'display_field_name' => config('history.VoterTransportation.from_time'),
                        'old_value' => $voterTransportation->from_time,
                        'new_value' => $selectedVoterData['newFieldsValues']['from_time']
                    ];

                    $voterTransportation->from_time = $selectedVoterData['newFieldsValues']['from_time'];
                }

                if ($selectedVoterData['newFieldsValues']['to_time'] != $voterTransportation->to_time) {
                    $changedValues[] = [
                        'field_name' => 'to_time',
                        'display_field_name' => config('history.VoterTransportation.to_time'),
                        'old_value' => $voterTransportation->to_time,
                        'new_value' => $selectedVoterData['newFieldsValues']['to_time']
                    ];

                    $voterTransportation->to_time = $selectedVoterData['newFieldsValues']['to_time'];
                }

                if ( count($changedValues) > 0 ) {
                    $model = [
                        'description' => 'עדכון הסעה לתושב מטופס קליטה',
                        'referenced_model' => 'VoterTransportation',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $voterTransportation->id,
                        'valuesList' => $changedValues
                    ];

                    $voterTransportation->save();
                }
            } else {
                $model = [
                    'description' => 'ביטול הסעה לתושב מטופס קליטה',
                    'referenced_model' => 'VoterTransportation',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $voterTransportation->id
                ];

                $voterTransportation->delete();
            }
        }

        return $model;
    }

	/*
		Private helpful function that saves VoterInstitute of specific voter 
		
		@param $voterId
		@param $selectedVoterData
		@param $generalFieldsValues
	*/
    private function saveVoterInstitute($voterId, $selectedVoterData, $generalFieldsValues) {
        $model = [];

        $insertFields = [
            'institute_id' => null,
            'institute_role_id' => null
        ];

        if ( !is_null($selectedVoterData['newFieldsValues']['institute']['id']) ) {
            $insertFields['institute_id'] = $selectedVoterData['newFieldsValues']['institute']['id'];
        } else {
            $insertFields['institute_id'] = $generalFieldsValues['institute_id'];
        }

        if ( !is_null($selectedVoterData['newFieldsValues']['institute_role']['id']) ) {
            $insertFields['institute_role_id'] = $selectedVoterData['newFieldsValues']['institute_role']['id'];
        } else {
            $insertFields['institute_role_id'] = $generalFieldsValues['institute_role_id'];
        }

        $instituteRolesByVoters = InstituteRolesByVoters::select('id')
            ->where(['voter_id' => $voterId,
                     'institute_id' => $insertFields['institute_id'],
                     'institute_role_id' => $insertFields['institute_role_id']
                    ])
            ->first();

        if ( is_null($instituteRolesByVoters) ) {
            $instituteRolesByVoters = new InstituteRolesByVoters;
            $instituteRolesByVoters->voter_id = $voterId;
            $instituteRolesByVoters->institute_id = $insertFields['institute_id'];
            $instituteRolesByVoters->institute_role_id = $insertFields['institute_role_id'];
            $instituteRolesByVoters->save();

            $model = [
                'description' => 'הוספת תפקיד במוסד לתושב מטופס קליטה',
                'referenced_model' => 'InstituteRolesByVoters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $instituteRolesByVoters->id,
                'valuesList' => [
                    [
                        'field_name' => 'voter_id',
                        'display_field_name' => config('history.InstituteRolesByVoters.voter_id'),
                        'new_numeric_value' => $instituteRolesByVoters->voter_id
                    ],
                    [
                        'field_name' => 'institute_id',
                        'display_field_name' => config('history.InstituteRolesByVoters.institute_id'),
                        'new_numeric_value' => $instituteRolesByVoters->institute_id
                    ],
                    [
                        'field_name' => 'institute_role_id',
                        'display_field_name' => config('history.InstituteRolesByVoters.institute_role_id'),
                        'new_numeric_value' => $instituteRolesByVoters->institute_role_id
                    ]
                ]
            ];
        }

        return $model;
    }

	/*
		Private helpful function that saves VoterGruop of specific voter 
		
		@param $voterId
		@param $newVoterGroupId
	*/
    private function saveVoterGroup($voterId, $newVoterGroupId) {
        $votersInGroups = VotersInGroups::select('id')
            ->where(['voter_id' => $voterId, 'voter_group_id' => $newVoterGroupId])
            ->first();

        $model = [];

        // If the user is not in the group
        // then add him to the group
        if ( is_null($votersInGroups) ) {
            $votersInGroups = new VotersInGroups;
            $votersInGroups->voter_id = $voterId;
            $votersInGroups->voter_group_id = $newVoterGroupId;
            $votersInGroups->save();

            $model = [
                'description' => 'הוספת קבוצה לתושב מטופס קליטה',
                'referenced_model' => 'VotersInGroups',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $votersInGroups->id,
                'valuesList' => [
                    [
                        'field_name' => 'voter_id',
                        'display_field_name' => config('history.VotersInGroups.voter_id'),
                        'new_numeric_value' => $votersInGroups->voter_id
                    ],
                    [
                        'field_name' => 'voter_group_id',
                        'display_field_name' => config('history.VotersInGroups.voter_group_id'),
                        'new_numeric_value' => $votersInGroups->voter_group_id
                    ]
                ]
            ];
        }

        return $model;
    }

	/*
		Private helpful function that saves details of specific voter 
		
		@param $voterData
		@param $selectedVoterData
		@param $newFieldValues
	*/
    private function saveVoterDetails($voterData, $selectedVoterData, $newFieldValues , $request) {
        $religiousGroupId = $request->input('religious_group_id', null);
        $ethnicGroupId = $request->input('ethnic_group_id', null);

        $newFieldsValues = $selectedVoterData['newFieldsValues'];

        $model = [];
        $changedValues = [];
        $updateFields = [];

        $newReligiousGroupId = $religiousGroupId;
        if(!is_null($newFieldsValues['religious_group']['id'])){
            $newReligiousGroupId = $newFieldsValues['religious_group']['id'];
        } 

        $newEthnicGroupId = $ethnicGroupId;
        if(!is_null($newFieldsValues['ethnic_group']['id'])){
            $newEthnicGroupId = $newFieldsValues['ethnic_group']['id'];
        } 

        $newSephardiValue = $newFieldsValues['sephardi']['id'];
        if( $newReligiousGroupId !== $voterData->religious_group_id){
            $changedValues[] = [
                'field_name' => 'religious_group_id',
                'display_field_name' => config('history.Voters.religious_group_id'),
                'old_value' => $voterData->religious_group_id,
                'new_value' => $newReligiousGroupId
            ];
            $updateFields['religious_group_id'] = $newReligiousGroupId;
        }
        // dump($newFieldsValues['ethnic_group'], $newEthnicGroupId , $voterData->ethnic_group_id);
        if( $newEthnicGroupId != $voterData->ethnic_group_id){
            $changedValues[] = [
                'field_name' => 'ethnic_group_id',
                'display_field_name' => config('history.Voters.ethnic_group_id'),
                'old_value' => $voterData->ethnic_group_id,
                'new_value' => $newEthnicGroupId
            ];
            $updateFields['ethnic_group_id'] = $newEthnicGroupId;
        }

        if( $newSephardiValue !== $voterData->sephardi){
            $changedValues[] = [
                'field_name' => 'sephardi',
                'display_field_name' => config('history.Voters.sephardi'),
                'old_value' => $voterData->sephardi,
                'new_value' => $newSephardiValue
            ];
            $updateFields['sephardi'] = $newSephardiValue;
        }
        if ( $selectedVoterData['newFieldsValues']['email'] != $voterData->email ) {
            $changedValues[] = [
                'field_name' => 'email',
                'display_field_name' => config('history.Voters.email'),
                'old_value' => $voterData->email,
                'new_value' => $selectedVoterData['newFieldsValues']['email']
            ];

            $updateFields['email'] = $selectedVoterData['newFieldsValues']['email'];
        }

        foreach ($newFieldValues as $fieldName => $newValue) {
            if ($newValue != $voterData->{$fieldName}) {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.Voters.' . $fieldName),
                    'old_numeric_value' => $voterData->{$fieldName},
                    'new_numeric_value' => $newValue
                ];

                $updateFields[$fieldName] = $newValue;
            }
        }

        if ( count($changedValues) > 0 ) {
            $model = [
                'description' => 'עדכון פרטי תושב מטופס קליטה',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterData->id,
                'valuesList' => $changedValues
            ];
        }
        Voters::where('id', $voterData->id)->update($updateFields);

        return $model;
    }

	/*
		Private helpful function that adds new VoterPhone for specific voter
		
		@param $voterData
		@param $currentPhone
		@param $isMainPhone
		@param $phoneTypesHash
	*/
    private function addVoterPhone($voterData, $phoneNumber, $isMainPhone, $phoneTypesHash) {
        $models = [];

        $voterPhone = new VoterPhone;
        $voterPhone->key = Helper::getNewTableKey('voter_phones', 10);
        $voterPhone->phone_number = $phoneNumber;
        $voterPhone->voter_id = $voterData->id;

        if ( Helper::isIsraelLandPhone($phoneNumber) ) {
            $voterPhone->sms = 0;
            $voterPhone->phone_type_id = $phoneTypesHash['home']->id;
        } else {
            $voterPhone->phone_type_id = $phoneTypesHash['mobile']->id;
        }
        $voterPhone->save();

        $models[] = [
            'description' => 'הוספת טלפון לתושב מטופס קליטה',
            'referenced_model' => 'VoterPhone',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $voterPhone->id,
            'valuesList' => [
                [
                    'field_name' => 'phone_type_id',
                    'display_field_name' => config('history.VoterPhone.phone_type_id'),
                    'new_numeric_value' => $voterPhone->phone_type_id
                ],
                [
                    'field_name' => 'voter_id',
                    'display_field_name' => config('history.VoterPhone.voter_id'),
                    'new_numeric_value' => $voterPhone->voter_id
                ],
                [
                    'field_name' => 'phone_number',
                    'display_field_name' => config('history.VoterPhone.phone_number'),
                    'new_value' => $voterPhone->phone_number
                ]
            ]
        ];

        if ( $isMainPhone ) {
            Voters::where('id', $voterData->id)->update(['main_voter_phone_id' => $voterPhone->id]);

            $models[] = [
                'description' => 'עדכון טלפון ראשי לתושב מטופס קליטה',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterData->id,
                'valuesList' => [
                    [
                        'field_name' => 'main_voter_phone_id',
                        'display_field_name' => config('history.Voters.main_voter_phone_id'),
                        'old_numeric_value' => $voterData->main_voter_phone_id,
                        'new_numeric_value' => $voterPhone->id
                    ]
                ]
            ];
        }

        return $models;
    }

	/*
		Private helpful function that edits VoterPhone for specific voter
		
		@param $voterData
		@param $currentPhone
		@param $newPhone
		@param $isMainPhone
		@param $phoneTypesHash
	*/
    private function editVoterPhone($voterData, $currentPhone, $newPhone, $isMainPhone, $phoneTypesHash) {
        // dd($currentPhone->toArray(), $newPhone);
        $models = [];
        $changedValues = [];
        $updateFields = [];

        if($currentPhone->wrong == 1){
            $updateFields['wrong'] = 0;

            $changedValues[] = [
                'field_name' => 'phone_type_id',
                'display_field_name' => config('history.VoterPhone.wrong'),
                'old_numeric_value' => 1,
                'new_numeric_value' => 0
            ];
        }
        if ( Helper::isIsraelLandPhone($newPhone['phone_number']) ) {
            $updateFields['sms'] = 0;
            $updateFields['phone_type_id'] = $phoneTypesHash['home']->id;
        } else {
            $updateFields['phone_type_id'] = $phoneTypesHash['mobile']->id;
        }

        if ( $updateFields['phone_type_id'] != $currentPhone->phone_type_id) {
            $changedValues[] = [
                'field_name' => 'phone_type_id',
                'display_field_name' => config('history.VoterPhone.phone_type_id'),
                'old_numeric_value' => $currentPhone->phone_type_id,
                'new_numeric_value' => $updateFields['phone_type_id']
            ];
        }

        $newPhoneNumber = str_replace('-', '', $newPhone['phone_number']);
        if ( $newPhoneNumber != $currentPhone->phone_number ) {
            $changedValues[] = [
                'field_name' => 'phone_number',
                'display_field_name' => config('history.VoterPhone.phone_number'),
                'old_value' => $currentPhone->phone_number,
                'new_value' => $newPhoneNumber
            ];

            $updateFields['phone_number'] = $newPhoneNumber;
        }

        if ( count($changedValues) > 0 ) {
            $models[] = [
                'description' => 'עדכון טלפון לתושב מטופס קליטה',
                'referenced_model' => 'VoterPhone',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $currentPhone->id,
                'valuesList' => $changedValues
            ];

            VoterPhone::where('id', $currentPhone->id)->update($updateFields);
        }

        if ( $isMainPhone && $voterData->main_voter_phone_id != $currentPhone->id ) {
            Voters::where('id', $voterData->id)->update(['main_voter_phone_id' => $currentPhone->id]);

            $models[] = [
                'description' => 'עדכון טלפון ראשי לתושב מטופס קליטה',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterData->id,
                'valuesList' => [
                    [
                        'field_name' => 'main_voter_phone_id',
                        'display_field_name' => config('history.Voters.main_voter_phone_id'),
                        'old_numeric_value' => $voterData->main_voter_phone_id,
                        'new_numeric_value' => $currentPhone->id
                    ]
                ]
            ];
        }

        return $models;
    }

	/*
		Private helpful function that deletes VoterPhone for specific voter
		
		@param $voterData
		@param $currentPhone
		@param $isMainPhone
	*/
    private function deleteVoterPhone($voterData, $currentPhone, $isMainPhone) {
        $models = [];

        VoterPhone::where('id', $currentPhone->id)->delete();

        $models[] = [
            'description' => 'מחיקת טלפון לתושב מטופס קליטה',
            'referenced_model' => 'VoterPhone',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
            'referenced_id' => $currentPhone->id
        ];

        if ( $isMainPhone ) {
            Voters::where('id', $voterData->id)->update(['main_voter_phone_id' => null]);

            $models[] = [
                'description' => 'עדכון טלפון ראשי לתושב מטופס קליטה',
                'referenced_model' => 'Voters',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterData->id,
                'valuesList' => [
                    [
                        'field_name' => 'main_voter_phone_id',
                        'display_field_name' => config('history.Voters.main_voter_phone_id'),
                        'old_numeric_value' => $voterData->main_voter_phone_id,
                        'new_numeric_value' => $currentPhone->id
                    ]
                ]
            ];
        }

        return $models;
    }

	/*
		Private helpful function that saves phones list for specific voter
		
		@param $voterData
		@param $selectedVoterData
	*/
    private function saveVoterPhones($voterData, $selectedVoterData) {
        $phoneTypes = PhoneTypes::select(['id', 'system_name'])
            ->where('deleted', 0)
            ->whereIn('system_name', ['home', 'mobile'])
            ->get();

        $phoneTypesHash = [];
        for ( $phoneTypeIndex = 0; $phoneTypeIndex < count($phoneTypes); $phoneTypeIndex++ ) {
            $systemName = $phoneTypes[$phoneTypeIndex]->system_name;

            $phoneTypesHash[$systemName] = $phoneTypes[$phoneTypeIndex];
        }

        $currentVoterPhones = VoterPhone::select(['id', 'key', 'phone_type_id', 'phone_number' ,'wrong'])
             ->where('voter_id', $voterData->id)
            ->get();
        $currentVoterPhonesHash = [];
        for ( $phoneIndex = 0; $phoneIndex < count($currentVoterPhones); $phoneIndex++ ) {
            $phoneKey = $currentVoterPhones[$phoneIndex]->key;

            $currentVoterPhonesHash[$phoneKey] = $currentVoterPhones[$phoneIndex];
        }

        $mainPhone = $selectedVoterData['newFieldsValues']['mainPhone'];

        $phoneModels = [];

        $newVoterPhones = [];
        $newVoterPhones[] =  $selectedVoterData['newFieldsValues']['phone1'];
        $newVoterPhones[] =  $selectedVoterData['newFieldsValues']['phone2'];
        // dd($currentVoterPhones->toArray(), $selectedVoterData['newFieldsValues'], $currentVoterPhonesHash);

        for ( $phoneIndex = 0; $phoneIndex < count($newVoterPhones); $phoneIndex++ ) {
            $newPhoneKey = $newVoterPhones[$phoneIndex]['key'];
            // dump($newVoterPhones[$phoneIndex]);

            $isMainPhone = ( $mainPhone == ($phoneIndex + 1) );

            if ( is_null($newPhoneKey) ) {
                if ( !is_null($newVoterPhones[$phoneIndex]['phone_number']) ) {
                    $newPhoneNumber = str_replace('-', '', $newVoterPhones[$phoneIndex]['phone_number']);
                    $models = $this->addVoterPhone($voterData, $newPhoneNumber, $isMainPhone, $phoneTypesHash);
                    if ( count($models) > 0 ) {
                        $phoneModels = array_merge($phoneModels, $models);
                    }
                }
            } else {
                if ( !is_null($newVoterPhones[$phoneIndex]['phone_number']) ) {
                    $phoneModels = $this->editVoterPhone($voterData, $currentVoterPhonesHash[$newPhoneKey], $newVoterPhones[$phoneIndex],
                                                         $isMainPhone, $phoneTypesHash);
                } else {
                    $phoneModels = $this->deleteVoterPhone($voterData, $currentVoterPhonesHash[$newPhoneKey], $isMainPhone);
                }
            }
        }

        return $phoneModels;
    }

	/*
		Private helpful function that deletes existing VoterSupportStatus by voterData
	*/
    private function deleteVoterSupportStatus($voterData) {
        $model = [
            'description' => 'מחיקת סטטוס תמיכה לתושב מטופס קליטה',
            'referenced_model' => 'VoterSupportStatus',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
            'referenced_id' => $voterData->voter_support_status_id0,
            'valuesList' => [
                [
                    'field_name' => 'support_status_id',
                    'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                    'old_numeric_value' => $voterData->support_status_id
                ]
            ]
        ];

        VoterSupportStatus::where('id', $voterData->voter_support_status_id0)
            ->update(['deleted' => 1 , 'update_user_id' => Auth::user()->id]);

        return $model;
    }

	/*
		Private helpful function that edits existing support status for specific voter
		
		@param $voterData
		@param $newSupportStatusId
	*/
    private function editVoterSupportStatus($voterData, $newSupportStatusId) {
        $model = [];
        $changedValues = [];

        if ($newSupportStatusId != $voterData->support_status_id) {
            $changedValues[] = [
                'field_name' => 'support_status_id',
                'display_field_name' => config('history.VoterSupportStatus.support_status_id'),
                'old_numeric_value' => $voterData->support_status_id,
                'new_numeric_value' => $newSupportStatusId
            ];
        }

        if ( count($changedValues) > 0 ) {
            $model = [
                'description' => 'עדכון סטטוס תמיכה לתושב מטופס קליטה',
                'referenced_model' => 'VoterSupportStatus',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $voterData->voter_support_status_id0,
                'valuesList' => $changedValues
            ];

            VoterSupportStatus::where('id', $voterData->voter_support_status_id0)
                ->update([
                    'support_status_id' => $newSupportStatusId,
                    'update_user_id'    => Auth::user()->id
                    ]);
        }

        return $model;
    }

	/*
		Private helpful function that adds new support status for specific voter
		
		@param $voterData
		@param $newSupportStatusId
	*/
    private function addVoterSupportStatus($voterData, $newSupportStatusId, $currentElectionCampignId) {
        $changedValues = [];

        $voterSupportStatus = new VoterSupportStatus;
		$voterSupportStatus->key = Helper::getNewTableKey('voter_support_status', 10);
        $voterSupportStatus->election_campaign_id = $currentElectionCampignId;
        $voterSupportStatus->voter_id = $voterData->id;
        $voterSupportStatus->entity_type = config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');
        $voterSupportStatus->support_status_id = $newSupportStatusId;
        $voterSupportStatus->create_user_id = Auth::user()->id;
        $voterSupportStatus->update_user_id = Auth::user()->id;
        $voterSupportStatus->save();

        $fields = [
            'election_campaign_id',
            'voter_id',
            'entity_type',
            'support_status_id'
        ];

        for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
            $fieldName = $fields[$fieldIndex];

            $changedValues[] = [
                'field_name' => $fieldName,
                'display_field_name' => config('history.VoterSupportStatus.' . $fieldName),
                'new_numeric_value' => $voterSupportStatus->{$fieldName}
            ];
        }

        $model = [
            'description' => 'הוספת סטטוס תמיכה לתושב מטופס קליטה',
            'referenced_model' => 'VoterSupportStatus',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $voterSupportStatus->id,
            'valuesList' => $changedValues
        ];

        return $model;
    }

	/*
		Private helpful function that saves support status for all voters in household
		
		@param $householdId
		@param $newSupportStatusId
	*/
    private function updateVoterHouseholdMembersSupportStatus($voterData,
                                                                $massStatusUpdate,
                                                                $currentElectionCampignId,
                                                                $supportStatus) {

        $fields = [
            'voters.id',
            'voters.first_name',
            'voters.last_name',

            'vs0.id as voter_support_status_id0',
            'vs0.support_status_id',
            'support_status.level as support_status_level'
        ];

        $voters = Voters::select($fields)
            ->withSupportStatus0($currentElectionCampignId)
            ->where('voters.id', '!=', $voterData->id)
            ->where('household_id', $voterData->household_id)
            ->get();

        $models = [];

        for ( $voterIndex = 0; $voterIndex < count($voters); $voterIndex++ ) {

            $model = $this->addOrUpdateVoterSupportStatus($voters[$voterIndex],
                                                            $massStatusUpdate,
                                                            $currentElectionCampignId,
                                                            $supportStatus);

            if ( count($model) > 0 ) {
                $models = array_merge($models, $model);
            }
        }

        return $models;
    }

    /**
     * Add or update voter support status according to mass update settings
     *
     * @param object $voterData
     * @param array $massStatusUpdate
     * @param integer $currentElectionCampignId
     * @param object $supportStatus
     * @return array
     */
    private function addOrUpdateVoterSupportStatus($voterData,
                                                    $massStatusUpdate,
                                                    $currentElectionCampignId,
                                                    $supportStatus) {

        $models = [];

        if ( is_null($voterData->support_status_id) ) {
            $model = $this->addVoterSupportStatus($voterData, $massStatusUpdate['support_status_chosen_id'], $currentElectionCampignId);

            if ( count($model) > 0 ) {
                $models = $model;
            }
        } else if ($massStatusUpdate['update_status_to_voter_with_status'] && 
                    $voterData->support_status_id != $massStatusUpdate['support_status_chosen_id'] ) {
            switch ($massStatusUpdate['status_update_type']) {
                case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'):
                    if ( $voterData->support_status_level < $supportStatus->level ) {
                        $newSupportStatusId = $massStatusUpdate['support_status_chosen_id'];
                        $model = $this->editVoterSupportStatus($voterData, $newSupportStatusId);

                        if ( count($model) > 0 ) {
                            $models = $model;
                        }
                    }
                    break;

                case config( 'constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM' ):
                    if ( $voterData->support_status_levels > $supportStatus->level ) {
                        $newSupportStatusId = $massStatusUpdate['support_status_chosen_id'];
                        $model = $this->editVoterSupportStatus($voterData, $newSupportStatusId);

                        if ( count($model) > 0 ) {
                            $models = $model;
                        }
                    }
                    break;

                case config( 'constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS' ):
                    $newSupportStatusId = $massStatusUpdate['support_status_chosen_id'];
                    $model = $this->editVoterSupportStatus($voterData, $newSupportStatusId);

                    if ( count($model) > 0 ) {
                        $models = $model;
                    }
                    break;
            }
        } 

        return $models;      
    }

	/*
		Private helpful function that saves multiple voters support statuses
		
		@param $voterData
		@param $selectedVoterData
	*/
    private function saveVoterSupportStatusMassUpdate($voterData, $massStatusUpdate, $currentElectionCampignId) {
        $supportStatus = SupportStatus::select(['id', 'level'])
            ->where('id', $massStatusUpdate['support_status_chosen_id'])
            ->first();

        $models = [];

        $model = $this->addOrUpdateVoterSupportStatus($voterData,
                            $massStatusUpdate,
                            $currentElectionCampignId, $supportStatus);

        if ( count($model) > 0 ) {
            $models[] = $model;
        }

        if ( $massStatusUpdate['update_household_status'] ) {
            $householdModels = $this->updateVoterHouseholdMembersSupportStatus($voterData,
                                            $massStatusUpdate,
                                            $currentElectionCampignId,
                                            $supportStatus);

            if ( count($householdModels) > 0 ) {
                $models[] = array_merge($models, $householdModels);
            }
        }

        return $models;
    }

	/*
		Private helpful function that saves single voter support status
		
		@param $voterData
		@param $selectedVoterData
	*/
    private function saveVoterSupportStatusNoMass($voterData, $selectedVoterData) {
        $model = [];

        if ( is_null($voterData->support_status_id) ) {
            $model = $this->addVoterSupportStatus($voterData, $selectedVoterData["support_status_id"]);
        } else {
            if ( !is_null($selectedVoterData['support_status_id']) ) {
                $model = $this->editVoterSupportStatus($voterData, $selectedVoterData["support_status_id"]);
            } else {
                $model = $this->deleteVoterSupportStatus($voterData);
            }
        }

        return $model;
    }

	/*
		Private helpful function that saves voter address
		
		@param $voterId
		@param $selectedVoterData
		@param $historyEntityId
	*/
    private function saveVoterAddress($voterId, $selectedVoterData, $historyEntityId) {
        if ( !isset($selectedVoterData['newFieldsValues']['city']['id']) ) {
            return;
        }

        $addressObj = new Address();
        $addressObj->city_id = $selectedVoterData['newFieldsValues']['city']['id'];
        $addressObj->street_id = $selectedVoterData['newFieldsValues']['street']['id'];
        $addressObj->neighborhood = null;
        $addressObj->house = $selectedVoterData['newFieldsValues']['house'];
        $addressObj->house_entry = $selectedVoterData['newFieldsValues']['house_entry'];
        $addressObj->flat  = $selectedVoterData['newFieldsValues']['flat'];
        $addressObj->zip = $selectedVoterData['newFieldsValues']['zip'];
        $addressObj->actual_address_correct = $selectedVoterData['newFieldsValues']['actual_address_correct'];

        $updateHouseholdAddress =  $selectedVoterData['newFieldsValues']['updateHouseholdAddress'];
        $updateVoterData = [
            'userCreateId' => Auth::user()->id,
            'entityId' => $historyEntityId,
            'entityType' => config('constants.HISTORY_ENTITY_TYPE_VOTERS_MANUAL_UPDATE'),
        ];
        $updatesCount = VoterController::updateVoterAddress($addressObj, $voterId, $updateHouseholdAddress, $updateVoterData);
    }

	/*
		Private helpful function that validates Id field in specific table
	*/
    private function validateIdField($fieldName, $fieldValue, $table) {
        $rules = [
            $fieldName => 'integer|exists:' . $table . ',id'
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates time field
	*/
    private function validateTimeField($fieldName, $fieldValue) {
        $rules = [
            $fieldName => 'date_format:H:i:s'
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that validates email
	*/
    private function validateEmail($email) {
        $rules = [
            'email' => 'email|max:' . config('constants.EMAIL_MAX_LENGTH')
        ];

        $validator = Validator::make(['email' => $email], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

	/*
		Private helpful function that performs validation of selectedVoter  
		
		@param $selectedVoterData
	*/
    private function validateSelectedVoter($selectedVoterData) {
        $addressObj = new Address();

        $cityId = $selectedVoterData['newFieldsValues']['city']['id'];
        if (!is_null($cityId) && !$addressObj->validateCity($cityId)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_CITY')
            ];
        }

        $streetId = $selectedVoterData['newFieldsValues']['street']['id'];
        if (!is_null($streetId) && !$addressObj->validateStreet($streetId)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_STREET')
            ];
        }

        $flat = $selectedVoterData['newFieldsValues']['flat'];
        if (!is_null($flat) && !$addressObj->validateFlat($flat)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_FLAT')
            ];
        }
 
        $zip = $selectedVoterData['newFieldsValues']['zip'];
        if ($zip && !$addressObj->validateZip($zip)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_ZIP')
            ];
        }

        $actualAddressCorrect = $selectedVoterData['newFieldsValues']['actual_address_correct'];
        if (!is_null($actualAddressCorrect) && !in_array($actualAddressCorrect, [0, 1])) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_ACTUAL_ADDRESS_CORRECT')
            ];
        }

        $cripple = $selectedVoterData['newFieldsValues']['cripple']['id'];
        if (!is_null($cripple) && !in_array($cripple, [0, 1])) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_CRIPPLE')
            ];
        }

		/*
		// This is not needed because from time and to time of transportation are not required
        $fromTime = $selectedVoterData['newFieldsValues']['from_time'];
        if (!is_null($fromTime) && !$this->validateTimeField('from_time', $fromTime)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_FROM_TIME')
            ];
        }

        $toTime = $selectedVoterData['newFieldsValues']['to_time'];
        if (!is_null($toTime) && !$this->validateTimeField('to_time', $toTime)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_TO_TIME')
            ];
        }
		*/

        $phoneNumber = str_replace('-', '', $selectedVoterData['newFieldsValues']['phone1']['phone_number']);
		 
	    if ( $phoneNumber && !Helper::isIsraelLandPhone($phoneNumber) && !Helper::isIsraelMobilePhone($phoneNumber) ) {
			return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_PHONE_NUMBER')
            ];
        }

        $phoneNumber = str_replace('-', '', $selectedVoterData['newFieldsValues']['phone2']['phone_number']);
 
		if ($phoneNumber != '' &&  !is_null($phoneNumber) && !Helper::isIsraelLandPhone($phoneNumber) && !Helper::isIsraelMobilePhone($phoneNumber) ) {
 
			return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_PHONE_NUMBER')
            ];
        }

        $email = $selectedVoterData['newFieldsValues']['email'];
        if (!is_null($email) && !$this->validateEmail($email)) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_EMAIL')
            ];
        }

        $instituteId = $selectedVoterData['newFieldsValues']['institute']['id'];
        if ( !is_null($instituteId) && !$this->validateIdField('institute_id', $instituteId, 'institutes') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_INSTITUTE')
            ];
        }

        $instituteRoleId = $selectedVoterData['newFieldsValues']['institute_role']['id'];
        if ( !is_null($instituteRoleId) && !$this->validateIdField('institute_role_id', $instituteRoleId, 'institute_roles') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_INSTITUTE_ROLE')
            ];
        }

        $updateHouseholdAddress = $selectedVoterData['newFieldsValues']['updateHouseholdAddress'];
        if (!is_null($updateHouseholdAddress) && !in_array($updateHouseholdAddress, [0, 1])) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_UPDATE_HOUSEHOLD_ADDRESS')
            ];
        }

        return [
            'error' => false,
            'errorCode' => null
        ];
    }

	/*
		Private helpful function that performs data validation by POST params
	*/
    private function validateData(Request $request) {
        $csvSourceId = $request->input('source_id', null);
        $dataBringVoterId = $request->input('source_voter_id', null);

        $strictlyOrthodox = $request->input('ultra_orthodox', null);
        $ethnicGroupId = $request->input('ethnic_group_id', null);
        $religiousGroupId = $request->input('religious_group_id', null);
        $gender = $request->input('gender', null);

        $instituteId = $request->input('institute_id', null);
        $instituteRoleId = $request->input('institute_role_id', null);

        $voterGroupId = $request->input('voter_group_id', null);

        $support_status_chosen_id = $request->input('support_status_chosen_id', null);
        $status_update_type = $request->input('status_update_type', null);
        $update_status_to_voter_with_status = $request->input('update_status_to_voter_with_status', null);
        $update_household_status = $request->input('update_household_status', null);

        if ( is_null($csvSourceId) || !$this->validateIdField('source_id', $csvSourceId, 'csv_sources') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_SOURCE')
            ];
        }

        if ( is_null($csvSourceId) || !$this->validateIdField('source_voter_id', $dataBringVoterId, 'voters') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_DATA_BRING_VOTER')
            ];
        }

        if ( !is_null($strictlyOrthodox) && !in_array($strictlyOrthodox, [0,1])  ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_STRICTLY_ORTHODOX')
            ];
        }

        if ( !is_null($ethnicGroupId) && !$this->validateIdField('ethnic_group_id', $ethnicGroupId, 'ethnic_groups') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_ETHNIC_GROUP')
            ];
        }

        if ( !is_null($religiousGroupId) && !$this->validateIdField('religious_group_id', $religiousGroupId, 'religious_groups') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_RELIGIOUS_GROUP')
            ];
        }

        if ( !is_null($gender) && !in_array($gender, [config('constants.VOTER_GENDER_MALE_NUMBER'),
                                                      config('constants.VOTER_GENDER_FEMALE_NUMBER')])  ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_GENDER')
            ];
        }

        if ( !is_null($instituteId) && !$this->validateIdField('institute_id', $instituteId, 'institutes') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_INSTITUTE')
            ];
        }

        if ( !is_null($instituteRoleId) && !$this->validateIdField('institute_role_id', $instituteRoleId, 'institute_roles') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_INSTITUTE_ROLE')
            ];
        }

        if ( !is_null($voterGroupId) && !$this->validateIdField('voter_group_id', $voterGroupId, 'voter_groups') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_GROUP')
            ];
        }

        if ( !is_null($support_status_chosen_id) && !$this->validateIdField('support_status_chosen_id', $support_status_chosen_id,
                                                                            'support_status') ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_SUPPORT_STATUS_CHOSEN')
            ];
        }

        if ( !is_null($status_update_type) && !in_array($status_update_type, [config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'),
                                                                              config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM'),
                                                                              config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS')])  ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_STATUS_UPDATE_TYPE')
            ];
        }

        if ( !is_null($update_status_to_voter_with_status) && !in_array($update_status_to_voter_with_status, [0,1])  ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_UPDATE_NO_STATUS')
            ];
        }

        if ( !is_null($update_household_status) && !in_array($update_household_status, [0,1])  ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_INVALID_UPDATE_HOUSEHOLD_STATUS')
            ];
        }

        $selectedVoters = $request->input('selected_voters', []);
        if ( count($selectedVoters) == 0 ) {
            return [
                'error' => true,
                'errorCode' => config('errors.elections.VOTERS_MANUAL_NO_VOTER_WAS_SELECTED')
            ];
        }

        for ( $voterIndex = 0; $voterIndex < count($selectedVoters); $voterIndex++ ) {
            $errorData = $this->validateSelectedVoter($selectedVoters[$voterIndex]);
            if ( $errorData['error'] ) {
                return $errorData;
            }
        }

        return [
            'error' => false,
            'errorCode' => null
        ];
    }

	/*
		Function that performs bulk update of different details of list of 
		voters , by POST params
	*/
    public function saveSelectedVoters(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $errorData = $this->validateData($request);
        if ( $errorData['error'] ) {
            $jsonOutput->setErrorCode($errorData['errorCode']);
            return;
        }

        $currentElectionCampignId = VoterElectionsController::getLastCampaign();

        $selectedVoters = $request->input('selected_voters', []);
        $csvSourceId = $request->input('source_id', null);
        $dataBringVoterId = $request->input('source_voter_id', null);

        $strictlyOrthodox = $request->input('ultra_orthodox', null);

        $gender = $request->input('gender', null);

        $instituteId = $request->input('institute_id', null);
        $instituteRoleId = $request->input('institute_role_id', null);

        $voterGroupId = $request->input('voter_group_id', null);

        $support_status_chosen_id = $request->input('support_status_chosen_id', null);
        $status_update_type = $request->input('status_update_type', null);
        $update_status_to_voter_with_status = $request->input('update_status_to_voter_with_status', null);
        $update_household_status = $request->input('update_household_status', null);

        for ( $voterIndex = 0; $voterIndex < count($selectedVoters); $voterIndex++ ) {
            $voterData = $this->getVoterDetails($selectedVoters[$voterIndex]['key'], $currentElectionCampignId);

            $historyArgsArr = [
                'topicName' => 'elections.manual_update.voter.edit',
                'models' => []
            ];

            $model = $this->saveVoterTransport($voterData, $selectedVoters[$voterIndex]);
            if ( count($model) > 0 ) {
                $historyArgsArr['models'][] = $model;
            }

            $newFieldValues = [
                'strictly_orthodox' => $strictlyOrthodox,
                'gender' => $gender,
            ];

            \App\Http\Controllers\BallotBoxController::updateBallotDetailsCounters(null, $voterData->id, 'strictly_orthodox');



            $model = $this->saveVoterDetails($voterData, $selectedVoters[$voterIndex], $newFieldValues, $request);
            if ( count($model) > 0 ) {
                $historyArgsArr['models'][] = $model;
            }


            // dd( $selectedVoters[$voterIndex]);

            if ( !is_null($voterGroupId) ) {
                $model = $this->saveVoterGroup($voterData->id, $voterGroupId);
                if ( count($model) > 0 ) {
                    $historyArgsArr['models'][] = $model;
                }
            }
            if ( !is_null($instituteId) || !is_null($selectedVoters[$voterIndex]['newFieldsValues']['institute']['id']) ) {
                $generalFieldsValues = [
                    'institute_id' => $instituteId,
                    'institute_role_id' => $instituteRoleId
                ];
                $model = $this->saveVoterInstitute($voterData->id, $selectedVoters[$voterIndex], $generalFieldsValues);
                if ( count($model) > 0 ) {
                    $historyArgsArr['models'][] = $model;
                }
            }


            $models = $this->saveVoterPhones($voterData, $selectedVoters[$voterIndex]);
            if ( count($models) > 0 ) {
                $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $models);
            }

            if ( !is_null($support_status_chosen_id) ) {
                $massStatusUpdate = [
                    'support_status_chosen_id' => $support_status_chosen_id,
                    'status_update_type' => $status_update_type,
                    'update_status_to_voter_with_status' => $update_status_to_voter_with_status,
                    'update_household_status' => $update_household_status
                ];

                $models = $this->saveVoterSupportStatusMassUpdate($voterData, $massStatusUpdate, $currentElectionCampignId);
                if ( count($models) > 0 ) {
                    $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $models);
                }
            } else if ( $selectedVoters[$voterIndex]['support_status_id'] != $voterData->support_status_id ) {
                $model = $this->saveVoterSupportStatusNoMass($voterData, $selectedVoters[$voterIndex]);
                if ( count($model) > 0 ) {
                    $historyArgsArr['models'][] = $model;
                }
            }

            if ( count($historyArgsArr['models']) > 0 || !is_null($selectedVoters[$voterIndex]['newFieldsValues']['city']['id']) ) {
                $manualVoterUpdates = new ManualVoterUpdates;
                $manualVoterUpdates->key = Helper::getNewTableKey('manual_voter_updates', 5);
                $manualVoterUpdates->csv_source_id = $csvSourceId;
                $manualVoterUpdates->data_bring_voter_id = $dataBringVoterId;
                $manualVoterUpdates->save();

                $historyArgsArr['entity_type'] = config('constants.HISTORY_ENTITY_TYPE_VOTERS_MANUAL_UPDATE');
                $historyArgsArr['entity_id'] = $manualVoterUpdates->id;

                if ( count($historyArgsArr['models']) ) {
                    ActionController::AddHistoryItem($historyArgsArr);
                }

                if ( !is_null($selectedVoters[$voterIndex]['newFieldsValues']['city']['id']) ) {
                    $this->saveVoterAddress($voterData->id, $selectedVoters[$voterIndex], $manualVoterUpdates->id);
                }
            }
        }

        $jsonOutput->setData('OK');
    }
}