<?php

namespace App\Libraries\Services\History;
////TODO::History
class HistoryFunctionToArrange
{


  public static function SendMessageOnCreateActivist($electionRolesByVotersMessages)
  {

    $historyArgsArr['models'][0]['valuesList'][] = [
      'field_name' => 'verified_status',
      'display_field_name' => config('history.ElectionRolesByVoters.verified_status'),
      'new_numeric_value' => config('constants.activists.verified_status.MESSAGE_SENT'),
    ];

    $actionHistoryFieldsNames = [
      'election_role_by_voter_id' => config('history.ElectionRolesByVotersMessages.election_role_by_voter_id'),
      'direction' => config('history.ElectionRolesByVotersMessages.direction'),
      'text' => config('history.ElectionRolesByVotersMessages.text'),
      'phone_number' => config('history.ElectionRolesByVotersMessages.phone_number'),
      'verified_status' => config('history.ElectionRolesByVotersMessages.verified_status'),
    ];

    $actionHistoryFields = [];
    foreach ($actionHistoryFieldsNames as $fieldName => $display_field_name) {
      $actionInsertFields = [];

      $actionInsertFields = [
        'field_name' => $fieldName,
        'display_field_name' => $display_field_name, // display field name
      ];

      switch ($fieldName) {
        case 'election_role_by_voter_id':
          $actionInsertFields['new_numeric_value'] = $electionRolesByVotersMessages->election_role_by_voter_id;
          break;

        case 'text':
        case 'phone_number':
          $actionInsertFields['new_value'] = $electionRolesByVotersMessages->{$fieldName};
          break;

        case 'direction':
          $actionInsertFields['new_value'] = 'יוצא';
          $actionInsertFields['new_numeric_value'] = config('constants.activists.messageDirections.OUT');
          break;

        case 'verified_status':
          $actionInsertFields['new_value'] = 'נשלחה הודעה';
          $actionInsertFields['new_numeric_value'] = config('constants.activists.verified_status.MESSAGE_SENT');
          break;
      }

      $actionHistoryFields[] = $actionInsertFields;
    }

    $historyArgsArr['models'][] = [
      'description' => 'שליחת הודעה לפעיל',
      'referenced_model' => 'ElectionRolesByVotersMessages',
      'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $electionRolesByVotersMessages->id,
      'valuesList' => $actionHistoryFields,
    ];
  }


  public static function updateShiftRole()
  {
    // $electionRolesGeographical = self::getGeoAreaById($electionRoleByVoterGeographicAreas2->id, $last_campaign_id);

    // $fieldsArray = [
    //     [
    //         'field_name' => 'election_role_shift_id',
    //         'display_field_name' => config('history.ElectionRolesGeographical.election_role_shift_id'),
    //         'old_numeric_value' => $electionRoleByVoterGeographicAreas2->election_role_shift_id,
    //         'new_numeric_value' => $electionRoleShiftObj->id,
    //     ],
    // ];

    // $historyArgsArr = [
    //     'topicName' => $editPermission,
    //     'models' => [
    //         [
    //             'referenced_model' => 'ElectionRolesGeographical',
    //             'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
    //             'referenced_id' => $electionRoleByVoterGeographicAreas2->id,
    //             'valuesList' => $fieldsArray,
    //         ],
    //     ],
    // ];

    // $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $otherBallotShiftsHistoryModels);

    // ActionController::AddHistoryItem($historyArgsArr);
  }

  public static function updatePaymentRole()
  {

    // Need to add history!

    // $oldLockDate = $ActivistRolePayment->lock_date;

    // $oldUserLockId = $ActivistRolePayment->user_lock_id;

    // $lockPermission = 'elections.activists.' . $electionRoles->system_name . '.lock';

    /*

        $actionHistoryFieldsNames = [

            'lock_date' => (is_null($oldUserLockId)) ? 'תאריך נעילה' : 'תאריך שחרור נעילה',

        ];


        if (is_null($oldUserLockId)) {

            $actionHistoryFieldsNames['user_lock_id'] = config('history.ElectionRolesByVoters.user_lock_id');

        } else {

            $actionHistoryFieldsNames['user_update_id'] = 'משתמש משחרר נעילה';

        }


        $actionHistoryFields = [];

        $actionHistoryFields[] = [

            'field_name' => 'lock_date',

            'display_field_name' => $actionHistoryFieldsNames['lock_date'],

            'old_value' => $oldLockDate,

            'new_value' => $ActivistRolePayment->lock_date,

        ];


        if (is_null($)) {

            $actionHistoryFields[] = [

                'field_name' => 'user_lock_id',

                'display_field_name' => $actionHistoryFieldsNames['user_lock_id'],

                'new_numeric_value' => $ActivistRolePayment->user_lock_id,

            ];

        } else {

            $actionHistoryFields[] = [     // $electionRolesGeographical = self::getGeoAreaById($electionRoleByVoterGeographicAreas2->id, $last_campaign_id);

        // $fieldsArray = [
        //     [
        //         'field_name' => 'election_role_shift_id',
        //         'display_field_name' => config('history.ElectionRolesGeographical.election_role_shift_id'),
        //         'old_numeric_value' => $electionRoleByVoterGeographicAreas2->election_role_shift_id,
        //         'new_numeric_value' => $electionRoleShiftObj->id,
        //     ],
        // ];

        // $historyArgsArr = [
        //     'topicName' => $editPermission,
        //     'models' => [
        //         [
        //             'referenced_model' => 'ElectionRolesGeographical',
        //             'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
        //             'referenced_id' => $electionRoleByVoterGeographicAreas2->id,
        //             'valuesList' => $fieldsArray,
        //         ],
        //     ],
        // ];

        // $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $otherBallotShiftsHistoryModels);

        // ActionController::AddHistoryItem($historyArgsArr);
                'display_field_name' => $actionHistoryFieldsNames['user_update_id'],

                'new_numeric_value' => $ActivistRolePayment->user_update_id,

            ];

        }


        $historyArgsArr = [

            'topicName' => $lockPermission,

            'models' => [

                [

                    'referenced_model' => 'ActivistRolesPayments',

                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),

                    'referenced_id' => $ActivistRolePayment->id,
     // $electionRolesGeographical = self::getGeoAreaById($electionRoleByVoterGeographicAreas2->id, $last_campaign_id);

        // $fieldsArray = [
        //     [
        //         'field_name' => 'election_role_shift_id',
        //         'display_field_name' => config('history.ElectionRolesGeographical.election_role_shift_id'),
        //         'old_numeric_value' => $electionRoleByVoterGeographicAreas2->election_role_shift_id,
        //         'new_numeric_value' => $electionRoleShiftObj->id,
        //     ],
        // ];

        // $historyArgsArr = [
        //     'topicName' => $editPermission,
        //     'models' => [
        //         [
        //             'referenced_model' => 'ElectionRolesGeographical',
        //             'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
        //             'referenced_id' => $electionRoleByVoterGeographicAreas2->id,
        //             'valuesList' => $fieldsArray,
        //         ],
        //     ],
        // ];

        // $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $otherBallotShiftsHistoryModels);

        // ActionController::AddHistoryItem($historyArgsArr);
                    'valuesList' => $actionHistoryFields,

                ],

            ],

        ];


        ActionController::AddHistoryItem($historyArgsArr);*/
  }


  public static function updateAppointmentLetter()
  {
    $allocationsAssignment = ActivistAllocationAssignment::where('id', $allocationsAssignmentId)->first();
    $updatedValuesArray = [];
    if ($allocationsAssignment) {
      if (!is_null($appointmentLetter) && $allocationsAssignment->appointment_letter != $appointmentLetter) {
        $allocationsAssignment->appointment_letter = $appointmentLetter;
        $updatedValuesArray['appointment_letter'] = $allocationsAssignment->appointment_letter;
      }
      if (count($updatedValuesArray) > 0) {
        $allocationsAssignment->save();
        $historyArgsArr = [
          'topicName' => 'elections.activists.cluster_summary.edit',
          'models' => []
        ];
        $actionHistoryFieldsNames = [
          'appointment_letter' => config('history.ActivistAllocationAssignment.appointment_letter'),
        ];

        $fieldsArray = [];
        foreach ($updatedValuesArray as $fieldName => $fieldOldValue) {
          $fieldsArray[] = [
            'field_name' => $fieldName,
            'display_field_name' => $actionHistoryFieldsNames[$fieldName],
            'new_numeric_value' => $allocationsAssignment->{$fieldName},
          ];
        }

        $historyArgsArr['models'][] = [
          'referenced_model' => 'ActivistAllocationAssignment',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
          'referenced_id' => $allocationsAssignment->id,
          'valuesList' => $fieldsArray,
        ];
        ActionController::AddHistoryItem($historyArgsArr);
      }

      $jsonOutput->setData('ok');
    }
  }
}
