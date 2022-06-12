<?php

namespace App\Libraries\Services;

use App\Libraries\Services\VoterFilterQueryService;
use App\Models\Tm\CampaignPortionProgress;
use App\Models\Tm\CtiPermission;
use App\Models\Tm\FinishedVoter;
use App\Models\Tm\Questionnaire;
use App\Models\Tm\RedialVoterPhone;
use App\Models\Tm\VoterPhonesLog;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\Tm\CallsLog;
use App\Models\Tm\Call;
use App\Models\Tm\TelemarketingVoterPhone;
use App\Models\VoterFilter\VoterFilter;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class CampaignService
{

  /**
   *   Get the list of voters with phones from a campaign portion
   */
  public static function getVotersToTable($portion, $campaign, $electionCampaignId, &$existingVoters, &$processedVoters, &$votersPhonesHash)
  {
    ini_set('memory_limit', '-1');
    ini_set('max_execution_time', '-1');
    //voter fields
    $voterFields = [
      'voters.id',
      'voters.personal_identity',
      'voters.first_name',
      'voters.last_name',
      'voters.birth_date',
      'voters.main_voter_phone_id',
      'voters.email',
      'voters.gender',
      'voters.household_id',
      'c.name AS city',
      DB::raw('IFNULL(streets.name, voters.street) AS street'),
      'voters.house',
      'voters.flat',
      'vss.support_status_id AS support_status_tm',
      DB::raw('CASE WHEN votes.id IS NOT NULL THEN true ELSE false END as vote_status'),
    ];

    //voter phone fields
    $phoneFields = [
      'voter_phones.id',
      'voter_phones.key',
      'voter_phones.phone_number',
      'voter_phones.voter_id',
      'voter_phones.phone_type_id',
      'voter_phones.sms',
      'voter_phones.call_via_tm',
    ];

    // order by phone query
    $orderByPhoneQuery = "CASE WHEN voter_phones.id = voters.main_voter_phone_id THEN 1 WHEN voter_phones.phone_number LIKE '05%' THEN 2 WHEN voter_phones.phone_number NOT LIKE '05%' THEN 3 END ASC ,voter_phones.updated_at DESC, voter_phones.id";

    //campaign properties
    $campaignId = $campaign->id;
    $single_phone_occurrence = $campaign->single_phone_occurrence == 1 ? true : false;
    $single_voter_for_household = $campaign->single_voter_for_household == 1 ? true : false;
    $only_users_with_mobile = $campaign->only_users_with_mobile == 1 ? true : false;
    // dump($campaign->toArray());
    //loop variables
    $skip = 0;
    $limit = 50000;
    do {
      //load the voters that we can call them (call_via_tm = 1)
      $voters = VoterFilterQueryService::generateVoterFilterQuery($portion, null, false, null, true)
        ->addSelect($voterFields)
        ->withCity()
        ->withStreet(true)
        ->withTelemarketingVoterPhones($campaignId)
        ->withTmSupportStatus($electionCampaignId, true);

      if (!isset($voters->getModel()['joins']['votes']) || !$voters->getModel()['joins']['votes']) {
        $voters = $voters->withElectionVotes($electionCampaignId, true);
      }
      //with phones
      $voters->with(['phones' => function ($query) use ($phoneFields, $orderByPhoneQuery, $only_users_with_mobile, $single_phone_occurrence, $campaignId) {
        $query->select($phoneFields)
          ->withVoters()
          ->where('call_via_tm', 1)
          ->where('wrong', 0)
          ->orderByRaw($orderByPhoneQuery);
        if ($only_users_with_mobile) {
          $query = $query->where('voter_phones.phone_number', 'like', '05%');
        }

        //remove phones if single phone occurence and exists in calls
        if ($single_phone_occurrence) {
          $query->leftJoin('calls', function ($query2) use ($campaignId) {
            $query2->on([
              ['calls.campaign_id', '=', DB::raw($campaignId)],
              ['calls.phone_number', '=', 'voter_phones.phone_number'],
            ]);
          })->whereNull('calls.id');
        }
        // echo( 'phones1'. $query->toSql());
      }])

        //without already sent voters to dialer
        ->whereNull('telemarketing_voter_phones.sent_date')
        //only voters with phones that are not wrong
        ->whereHas('phones', function ($query) use ($only_users_with_mobile, $single_phone_occurrence, $campaignId) {
          $query->where('call_via_tm', 1)
            ->where('wrong', 0);
          if ($only_users_with_mobile) {
            $query = $query->where('voter_phones.phone_number', 'like', '05%');
          }
          //remove phones if single phone occurence and exists in calls
          if ($single_phone_occurrence) {
            $query->leftJoin('calls', function ($query2) use ($campaignId) {
              $query2->on([
                ['calls.campaign_id', '=', DB::raw($campaignId)],
                ['calls.phone_number', '=', 'voter_phones.phone_number'],
              ]);
            })->whereNull('calls.id');
          }
          // echo( 'phones2'. $query->toSql());
        });

      //if single household only voters that their household didn't have finished call
      if ($single_voter_for_household) {
        $voters->leftJoin('telemarketing_voter_phones as household_voters', function ($query) use ($campaignId) {
          $query->on('household_voters.household_id', '=', 'voters.household_id')
            ->where('household_voters.campaign_id', $campaignId)
            ->whereIn('household_voters.finished_status', [
              config('tmConstants.call.status.SUCCESS'),
              config('tmConstants.call.status.GOT_MARRIED'),
              config('tmConstants.call.status.CHANGED_ADDRESS'),
              config('tmConstants.call.status.NON_COOPERATIVE')
            ]);
        })
          ->whereNull('household_voters.id');
      }

      $voters->skip($skip * $limit)->limit($limit)
        ->orderBy('voters.id');
      $voters = $voters->get();

      //loop on voters
      foreach ($voters as $voter) {

        //if voter already processed continue
        if (isset($processedVoters[$voter->id])) {
          continue;
        }

        //generate phone list
        $current_phone = null;
        foreach ($voter->phones as  $key => $voterPhone) {
          //if single phone and phone exist continue
          if ($single_phone_occurrence && isset($votersPhonesHash[$voterPhone->phone_number])) {
            $voter->phones->forget($key);
          } else {
            //Set current voter phone:
            if ($current_phone == null) {
              $phoneNumber = $voterPhone->phone_number;
              $current_phone = new \stdClass;
              $current_phone->base_id = $voterPhone->id;
              $current_phone->id = $voterPhone->id;
              $current_phone->phone_number = $phoneNumber;
              $current_phone->iteration = 1;

              $voter->current_phone = $current_phone;
            }
            //if single phone add phone number to hash list
            if ($single_phone_occurrence) {
              $votersPhonesHash[$voterPhone->phone_number] = 1;
            }
          }
        }
        // If voter has no phones left.
        if ($current_phone == null) {
          continue;
        }

        //move address to 'address' property
        $address = new \stdClass;
        $address->city = $voter->city;
        $address->street = $voter->street;
        $address->house = $voter->house;
        $address->flat = $voter->flat;
        $voter->address = $address;

        //add portion id
        $voter->portion_id = $portion->id;

        //remove unneeded properties
        unset($voter->city);
        unset($voter->street);
        unset($voter->house);
        unset($voter->flat);

        if (!isset($existingVoters[$voter->id])) {
          //create voter in table and redis
          try {
            $voterPhonesRedisKey = 'tm:campaigns:' . $campaignId . ':voter_phones:' . $voter->current_phone->id;
            Redis::set($voterPhonesRedisKey, $voter);

            $tmVoterPhone = new TelemarketingVoterPhone;
            $tmVoterPhone->campaign_id = $campaignId;
            $tmVoterPhone->portion_id = $portion->id;
            $tmVoterPhone->voter_id = $voter->id;
            $tmVoterPhone->voter_phone_id = $voter->current_phone->id;
            $tmVoterPhone->phone_number = $voter->current_phone->phone_number;
            $tmVoterPhone->phone_count = count($voter->phones);
            $tmVoterPhone->household_id = $voter->household_id;
            $tmVoterPhone->order = rand(0, 1000000);
            $tmVoterPhone->save();
          } catch (Exception $error) {
            //if can't create voter in static table continue
            continue;
          }
        } else {
          //update voter in table and redis because phone has changed
          if (($existingVoters[$voter->id]['voter_phone_id'] != $voter->current_phone->id) ||
            ($existingVoters[$voter->id]['phone_count'] != count($voter->phones))
          ) {
            $oldVoterPhoneRedisKey = 'tm:campaigns:' . $campaignId . ':voter_phones:' . $existingVoters[$voter->id]['voter_phone_id'];
            Redis::del($oldVoterPhoneRedisKey);
            $voterPhonesRedisKey = 'tm:campaigns:' . $campaignId . ':voter_phones:' . $voter->current_phone->id;
            Redis::set($voterPhonesRedisKey, $voter);

            TelemarketingVoterPhone::where('campaign_id', $campaignId)
              ->where('voter_id', $voter->id)
              ->update([
                'portion_id' => $portion->id,
                'voter_phone_id' => $voter->current_phone->id,
                'phone_number' => $voter->current_phone->phone_number,
                'phone_count' => count($voter->phones)
              ]);
          }
          //remove voter from existing hash list
          unset($existingVoters[$voter->id]);
        }
        //add voter to processed hash list
        $processedVoters[$voter->id] = 1;
      }
      $skip++;
    } while (count($voters) == $limit);
  }

  /**
   * Generate phone array from list of voters to send to Dialer API
   */

  public static function getPhonesFromVoters($voters, $campaignId)
  {
    //create phone array
    $phoneNumbers = array();
    foreach ($voters as $voter) {
      //if voter is from redial list
      if (isset($voter->current_phone)) {
        $phoneObject = new \stdClass;
        $phoneObject->id = $voter->current_phone->id;
        $phoneObject->phone_number = $voter->current_phone->phone_number;
        $phoneObject->voter_id = $voter->id;
        array_push($phoneNumbers, $phoneObject);

        //set voter details in redis per phone id
        Redis::set('tm:campaigns:' . $campaignId . ':waiting_phones:' . $phoneObject->id, json_encode($voter));
        //if voter is from voter phones table
      } else {
        array_push($phoneNumbers, $voter);

        //move voter details from voter_phones to waiting_phones
        $voterPhoneKey = 'tm:campaigns:' . $campaignId . ':voter_phones:' . $voter->id;
        $waitingPhoneKey = 'tm:campaigns:' . $campaignId . ':waiting_phones:' . $voter->id;
        Redis::rename($voterPhoneKey, $waitingPhoneKey);
      }
    }

    return $phoneNumbers;
  }

  /**
   * Load voters that need to be redialed
   */
  public static function getRedialVoters($votersCount, $campaignId)
  {
    //redial fields
    $redialVotersFields = [
      'id',
      'voter_data',
    ];

    //get redial voters
    $redialVoters = RedialVoterPhone::select($redialVotersFields)
      ->where('campaign_id', $campaignId)
      ->where('redial_date', '<=', Carbon::now())
      ->limit($votersCount)
      ->get();

    if ($redialVoters != null) {
      //create Voters collection
      $voters = new \Illuminate\Support\Collection;
      $redialVotersIds = array();
      foreach ($redialVoters as $redialVoter) {
        array_push($redialVotersIds, $redialVoter->id);
        $voter = json_decode($redialVoter->voter_data);
        $voters->push($voter);
      }
      //remove redial voters from DB
      RedialVoterPhone::destroy($redialVotersIds);
    } else {
      $voters = new \Illuminate\Support\Collection;
    }
    return $voters;
  }

  /**
   * Generate array of IDs from voters list
   */

  public static function getIdsFromVoters($voters)
  {
    $idArray = array();
    foreach ($voters as $voter) {
      array_push($idArray, $voter->id);
    }
    return $idArray;
  }

  /**
   * Load array of wating to be called voters IDs
   */

  public static function getAwaitingVotersIds($campaignId)
  {
    return Redis::hkeys('tm:campaigns:' . $campaignId . ':waiting_voters');
  }

  /**
   * Get awaiting voters from redis
   */

  public static function getAwaitingVoterFromRedis($campaignId, $voterPhoneId)
  {
    //get redis keys
    $waitingPhonesRedisKey = 'tm:campaigns:' . $campaignId . ':waiting_phones:' . $voterPhoneId;
    $waitingVoterRedisKey = 'tm:campaigns:' . $campaignId . ':waiting_voters';
    //get voter object from phone id
    $voterJson = Redis::get($waitingPhonesRedisKey);
    if ($voterJson != null) {
      $voter = json_decode($voterJson);
      Redis::del($waitingPhonesRedisKey);
      Redis::hdel($waitingVoterRedisKey, $voter->id);
      return $voter;
    } else {
      return null;
    }
  }

  /**
   * Set voter to redial according to redial settings and current phone state
   * If the voter does not have any more redial attempts, it will not be saved in redial table
   */

  public static function setVoterToRedial(
    $campaign,
    $voter,
    $voterPhoneId,
    $status,
    $wrongNumber = false,
    $callViaTm = true,
    $sameNumber = false,
    $updatedPhones = false
  ) {
    // get max redial attempts
    if ($campaign->action_call_no_answer == 0) {
      $maxReturnCall = 0;
    } else {
      $maxReturnCall = ($campaign->max_return_call != null) ? $campaign->max_return_call : 0;
    }
    $phoneCount = count($voter->phones);
    if ($phoneCount == 0) {
      //Add voter to finished voters and transfer count from processing to processed
      CampaignService::addVoterToFinished($voter->id, $campaign, $status);
      CampaignService::transferVotersCountToProcessed($voter->portion_id, 1);
      return;
    }

    $currentVoterPhoneIndex = -1;
    $nextVoterPhoneIndex = -1;
    //find current and next phone index
    foreach ($voter->phones as $index => $phone) {
      if ($phone->id == $voterPhoneId) {
        $currentVoterPhoneIndex = $index;
        if ($sameNumber) {
          //if same number next equals current
          $nextVoterPhoneIndex = $currentVoterPhoneIndex;
        } else {
          if ($phoneCount == $index + 1) {
            $nextVoterPhoneIndex = 0;
          } else {
            $nextVoterPhoneIndex = $index + 1;
          }
        }
      }
    }
    if ($nextVoterPhoneIndex == -1) {
      $nextVoterPhoneIndex = 0;
    }

    $resetBase = false;
    $voterPhones = array_values((array)$voter->phones);

    //set voter phone to wrong and adjust phone array if removing current phone
    if (($wrongNumber || !$callViaTm) && (!empty($voterPhones[$currentVoterPhoneIndex]))) {

      $currentPhoneId = $voterPhones[$currentVoterPhoneIndex]->id;
      if ($wrongNumber) {
        VoterPhone::updateCurrentPhoneWrong($currentPhoneId);
        //phone is wrong
        //reset main voter phone id if was set to wrong
        if ($voter->main_voter_phone_id == $currentPhoneId) {
          $newMainVoterPhone = VoterPhone::select('id')
            ->where('voter_id', $voter->id)
            ->where('wrong', 0)
            ->orderBy('updated_at', 'DESC')
            ->first();
          $newMainVoterPhoneId = ($newMainVoterPhone) ? $newMainVoterPhone->id : null;
          Voters::where('id', $voter->id)
            ->update(['main_voter_phone_id' => $newMainVoterPhoneId]);
        }
      } else {
        //can call phone via tm
        VoterPhone::where('id', $currentPhoneId)
          ->update([
            'call_via_tm' => 0
          ]);
      }
      array_splice($voterPhones, $currentVoterPhoneIndex, 1);
      //if no more phones do not add to redial
      if (count($voterPhones) == 0) {
        //Add voter to finished voters and transfer count from processing to processed
        CampaignService::addVoterToFinished($voter->id, $campaign, $status);
        CampaignService::transferVotersCountToProcessed($voter->portion_id, 1);
        return;
      }
      //adjust nextPhoneIndex

      if ($nextVoterPhoneIndex > 0) {
        $nextVoterPhoneIndex--;
      }
      $phoneArrayKeys = array_keys($voterPhones);
      $nextVoterPhoneIndex = (string)$phoneArrayKeys[0];

      //reset base id to next voter phone if it was removed, also decrease iteration
      if ($voter->current_phone->base_id == $currentPhoneId) {
        $resetBase = true;
        $voter->current_phone->base_id = $voterPhones[$nextVoterPhoneIndex]->id;
        $voter->current_phone->iteration--;
      }
    }
    if (count($voterPhones) == 0) {
      //Add voter to finished voters and transfer count from processing to processed
      CampaignService::addVoterToFinished($voter->id, $campaign, $status);
      CampaignService::transferVotersCountToProcessed($voter->portion_id, 1);
      return;
    }

    $phoneArrayKeys = array_keys($voterPhones);
    $nextVoterPhoneIndex = (string) $phoneArrayKeys[0];

    // Log::info('$nextVoterPhoneIndex' . $nextVoterPhoneIndex);
    // Log::info( $phoneArrayKeys);
    // Log::info(json_encode($voterPhones));
    $voter->current_phone->id = $voterPhones[$nextVoterPhoneIndex]->id;
    $voter->current_phone->phone_number = $voterPhones[$nextVoterPhoneIndex]->phone_number;

    $voter->phones = $voterPhones;

    //Reset iteration if same number
    //Increment iteration if phone id is the same as base
    if ($sameNumber || $updatedPhones) {
      if ($voter->current_phone->base_id == $voter->current_phone->id) $voter->current_phone->iteration = 1;
      else $voter->current_phone->iteration = 0;
    } elseif ($voter->current_phone->base_id == $voter->current_phone->id) {
      $voter->current_phone->iteration++;
    }

    //add to redial if iteration is under limit
    if ($voter->current_phone->iteration <= $maxReturnCall) {

      //get redial date
      if (($campaign->scheduled_time_no_answer == 0) ||
        ($sameNumber) ||
        ($resetBase) ||
        ($nextVoterPhoneIndex != 0)
      ) {
        $redialDate = Carbon::now();
      } else {
        $addMinutes = ($campaign->return_call_after != null) ? $campaign->return_call_after : 0;
        $redialDate = Carbon::now()->addMinutes($addMinutes);
      }

      $redialVoterPhone = new RedialVoterPhone;
      $redialVoterPhone->campaign_id = $campaign->id;
      $redialVoterPhone->voter_id = $voter->id;
      $redialVoterPhone->portion_id = $voter->portion_id;
      $redialVoterPhone->status = $status;
      $redialVoterPhone->voter_data = json_encode($voter);
      $redialVoterPhone->redial_date = $redialDate;
      $redialVoterPhone->save();
    } else {
      //Add voter to finished voters and transfer count from processing to processed
      CampaignService::addVoterToFinished($voter->id, $campaign, $status);
      CampaignService::transferVotersCountToProcessed($voter->portion_id, 1);
    }
  }

  /**
   * Add voter to finished voters table
   */

  public static function addVoterToFinished($voterId, $campaign, $status)
  {
    $finishedVoter = new FinishedVoter;
    $finishedVoter->voter_id = $voterId;
    $finishedVoter->campaign_id = $campaign->id;
    $finishedVoter->status = $status;
    $finishedVoter->save();

    $householdArray = [
      config('tmConstants.call.status.SUCCESS'),
      config('tmConstants.call.status.GOT_MARRIED'),
      config('tmConstants.call.status.CHANGED_ADDRESS'),
      config('tmConstants.call.status.NON_COOPERATIVE')
    ];

    //update finished status in tm voter phones table
    TelemarketingVoterPhone::where('campaign_id', $campaign->id)
      ->where('voter_id', $voterId)
      ->update([
        'finished_status' => $status
      ]);

    //delete other voters in same household that weren't sent yet to dialer from tm voter phones table
    if (($campaign->single_voter_for_household == 1) && (in_array($status, $householdArray))) {
      $voterHousehold = TelemarketingVoterPhone::select('household_id')
        ->where('campaign_id', $campaign->id)
        ->where('voter_id', $voterId)
        ->first();
      if ($voterHousehold) {
        TelemarketingVoterPhone::where('campaign_id', $campaign->id)
          ->whereNull('sent_date')
          ->where('household_id', $voterHousehold->household_id)
          ->delete();
      }
    }
  }

  /**
   * Add voters count to processing or processed count
   * Can also be negative
   */
  public static function addVotersCountToProgress($portionId, $votersCount, $processed = false)
  {
    //Load progress or create progress for portion
    $campaignPortionProgress = CampaignPortionProgress::where('portion_id', $portionId)->first();
    if ($campaignPortionProgress == null) {
      $campaignPortionProgress = new CampaignPortionProgress;
      $campaignPortionProgress->portion_id = $portionId;
      $campaignPortionProgress->save();
    }

    //Change count according to specified count (processing or processed)
    if (!$processed) {
      $campaignPortionProgress->increment('processing_count', $votersCount);
    } else {
      $campaignPortionProgress->increment('processed_count', $votersCount);
    }
  }

  /**
   * Transfer voters count from processing to processed
   * Can also be negative
   */
  public static function transferVotersCountToProcessed($portionId, $votersCount)
  {
    //@todo we can do that in 1 query here is 2 queries
    CampaignPortionProgress::where('portion_id', $portionId)->increment('processing_count', -1 * ($votersCount));
    CampaignPortionProgress::where('portion_id', $portionId)->increment('processed_count', $votersCount);
  }

  /**
   * Update cti permission for campaign
   *
   * @param \Illuminate\Database\Eloquent\Model $campaign
   * @param array $ctiPermissions
   * @return void
   */

  public static function updateCtiPermissions($campaign, $ctiPermissions)
  {
    //create hash map for current cti permissions
    $currentCtiPermissions = $campaign->cti_permissions;
    $currentCtiPermissionHash = array();
    foreach ($currentCtiPermissions as $currentCtiPermission) {
      $currentCtiPermissionHash[$currentCtiPermission->key] = $currentCtiPermission;
    }

    // loop of new cti permissions
    foreach ($ctiPermissions as $ctiPermission) {
      //add new cti permission
      if (!isset($currentCtiPermissionHash[$ctiPermission['key']])) {
        $existingCtiPermission = CtiPermission::where('key', $ctiPermission['key'])->first();
        if ($existingCtiPermission != null) {
          $campaign->cti_permissions()
            ->attach([$existingCtiPermission->id => ['value' => $ctiPermission['value']]]);
        }
      } else {
        //update existing cti permission
        $currentCtiPermission = $currentCtiPermissionHash[$ctiPermission['key']];
        // dump($currentCtiPermission->value != $ctiPermission['value'],$currentCtiPermission->value,$ctiPermission['value']);

        if ($currentCtiPermission->value !== $ctiPermission['value']) {
          $campaign->cti_permissions()
            ->updateExistingPivot($currentCtiPermission->id, ['value' => $ctiPermission['value']]);
        }
        unset($currentCtiPermissionHash[$ctiPermission['key']]);
      }
    }

    //delete old cti permissions
    foreach ($currentCtiPermissionHash as $deleteCtiPermission) {
      $campaign->cti_permissions()
        ->detach($deleteCtiPermission->id);
    }
  }
  /**
   * @method updateRedisCampaignQuestionChanged
   * every change in questionnaire, questions, Requires submitting an update for a campaign.
   * @param [int] $questionnaireId - questionnaire of the question.
   * -> by the "$questionnaireId", we find the the campaign.
   * @return void
   */
  public static function updateRedisCampaignQuestionChanged($questionnaireId)
  {
    $questionnaire = Questionnaire::where('id', $questionnaireId)->first();
    self::updateRedisCampaignQuestionnaireChanged($questionnaire->campaign_id, $questionnaire->active);
  }
  /**
   * @method updateRedisCampaignQuestionnaireChanged
   * every change in questionnaire, Requires submitting an update for a campaign.
   * @param [type] $campaignId - campaign id that changed
   * @param [type] $isActiveQuestionnaire -
   * -> only if the questionnaire is active - that mean that the campagin changed
   * @return void
   */
  public static function updateRedisCampaignQuestionnaireChanged($campaignId, $isActiveQuestionnaire)
  {
    if ($isActiveQuestionnaire) {
      $campaignChangedData = ['questionnaire' => true, 'ctiPermissions' => false];
      self::updateRedisCampaignDetailsChanged($campaignId, $campaignChangedData);
    }
  }
  /**
   * updateRedisCampaignDetailsChanged
   * Tell redis that the campagin important data change:
   * -> send request to update the campaign details in the CTI  active sip
   * @param [int] $campaignId - - campaign id that changed
   * @param [obj] $campaignChangedData - data changed in campaign to update it redis
   * @ignore current we change all the data.
   * @return void
   */

  public static function updateRedisCampaignDetailsChanged($campaignId, $campaignChangedData)
  {
    if ($campaignChangedData['questionnaire'] || $campaignChangedData['ctiPermissions']) {
      $campaignChangedAllData = [ // Update all the properties right now.
        'ctiPermissions' => true,
        'campaignDetails' => true,
        'questionnaire' => true,
      ];
      $redisObject = new \stdClass;
      $redisObject->action = "campaign_data_changed";
      $redisObject->laravel_session = session()->getId();
      $redisObject->campaignId = $campaignId;
      $redisObject->campaignChangedData = $campaignChangedAllData;
      Redis::publish('system', json_encode($redisObject));
    }
  }

  /**
   * Set callback time to voter without iteration phone numbers
   *
   * @param int $campaignId
   * @param object $voterData
   * @param date $redialDate
   * @return void
   */
  public static function setCallbackToVoter($capmaignId, $voterData, $redialDate, $status)
  {
    $redialVoterPhone = new RedialVoterPhone;
    $redialVoterPhone->campaign_id = $capmaignId;
    $redialVoterPhone->voter_data = json_encode($voterData);
    $redialVoterPhone->redial_date = $redialDate;
    $redialVoterPhone->voter_id = $voterData->id;
    $redialVoterPhone->portion_id = $voterData->portion_id;
    $redialVoterPhone->status = $status;
    $redialVoterPhone->save();
  }

  /**
   * Save voter phones API requests
   *
   * @param int $campaignId
   * @param int $phoneCount
   * @param $mixed $result
   * @return void
   */
  public static function saveVoterPhonesLog($campaignId, $phoneCount, $result)
  {
    $voterPhonesLog = new VoterPhonesLog;
    $voterPhonesLog->campaign_id = $campaignId;
    $voterPhonesLog->phone_count = $phoneCount;
    $voterPhonesLog->result = json_encode($result);
    $voterPhonesLog->save();
  }

  /**
   * Save new call API requests
   *
   * @param int $campaignId
   * @param int $sipNumber
   * @param int $voterPhoneId
   * @param int $status
   * @param mixed $result
   * @return void
   */
  public static function saveNewCallLog($campaignId, $sipNumber, $voterPhoneId, $status, $result)
  {
    $callsLog = new CallsLog;
    $callsLog->campaign_id = $campaignId;
    $callsLog->sip_number = $sipNumber;
    $callsLog->voter_phone_id = $voterPhoneId;
    $callsLog->status = $status;
    $callsLog->result = json_encode($result);
    $callsLog->save();
  }

  /**
   * Get existing voter list from telemarketing static table
   * without already sent voters to dialer
   *
   * @param $integer $campaignId
   * @return array
   */
  public static function getExistingTelemarketingVoterPhones($campaignId)
  {
    $existingVoters = array();

    $skip = 0;
    $limit = 50000;
    do {
      $voters = TelemarketingVoterPhone::select('voter_id', 'voter_phone_id', 'phone_count')
        ->where('campaign_id', $campaignId)
        ->whereNull('sent_date')
        ->orderBy('telemarketing_voter_phones.order', 'asc')
        ->skip($skip * $limit)
        ->limit($limit)
        ->get();
      foreach ($voters as $voter) {
        $existingVoters[$voter->voter_id] = [
          'voter_phone_id' => $voter->voter_phone_id,
          'phone_count' => $voter->phone_count
        ];
      }
      $skip++;
    } while (count($voters) == $limit);

    return $existingVoters;
  }

  /**
   * Delete removed voters from telemarketing static voter table
   *
   * @param int $campaignId
   * @param int $voterId
   * @return void
   */
  public static function deleteExistingTelemarketingVoterPhone($campaignId, $voterId)
  {
    $voterPhone = TelemarketingVoterPhone::select('id', 'voter_phone_id')
      ->where('campaign_id', $campaignId)
      ->where('voter_id', $voterId)
      ->whereNull('sent_date')
      ->first();
    if ($voterPhone) {
      //remove from redis
      $voterPhonesRedisKey = 'tm:campaigns:' . $campaignId . ':voter_phones:' . $voterPhone->voter_phone_id;
      Redis::del($voterPhonesRedisKey);

      //remove from table
      $voterPhone->delete();
    }
  }

  /**
   * Set list of voter phones from tm voter phones table
   *
   * @param object $campaign
   * @param int $phoneCount
   * @return array
   */
  public static function getStaticVoterPhones($campaign, $phoneCount)
  {
    $voterPhones = TelemarketingVoterPhone::select(
      'voter_phone_id as id',
      'phone_number',
      'voter_id'

    )
      ->withPortions()
      ->where('campaign_id', $campaign->id)
      ->whereNull('sent_date')
      ->orderBy('telemarketing_voter_phones.order', 'asc')
      ->orderBy('voter_filters.order', 'asc')
      ->orderBy('telemarketing_voter_phones.id', 'asc')
      ->limit($phoneCount)
      ->get();

    //get list of voters Ids
    $voterIds = [];
    foreach ($voterPhones as $voterPhone) {
      $voterIds[] = $voterPhone->voter_id;
    }

    if (count($voterIds) > 0) {
      //update sent date on loaded voters
      TelemarketingVoterPhone::where('campaign_id', $campaign->id)
        ->whereIn('voter_id', $voterIds)
        ->update([
          'sent_date' => Carbon::now()
        ]);
      //update current portion id if changed
      $lastPortion = TelemarketingVoterPhone::select('portion_id')
        ->withPortions()
        ->where('campaign_id', $campaign->id)
        ->whereNotNull('sent_date')
        ->orderBy('voter_filters.order', 'desc')
        ->first();
      if ($lastPortion && $lastPortion->portion_id != $campaign->current_portion_id) {
        $campaign->current_portion_id = $lastPortion->portion_id;
        $campaign->save();
      }
    }
    return $voterPhones;
  }

  /**
   * Calculate unique voter count for each portion in campaign
   *
   * @param object $campaign
   * @return void
   */
  public static function calculateUniquePortionsVoterCount($campaign)
  {
    //generate portions hash for all portions with unique voter count > 0
    $portionsHash = [];
    foreach ($campaign->portions as $portion) {
      $portionsHash[$portion->id] = [
        'id' => $portion->id,
        'unique_voters_count' => $portion->unique_voters_count
      ];
    }
    //recalculate unique voter count for all portions in tm voter phones table
    $portions = TelemarketingVoterPhone::select('portion_id', DB::raw('count(voter_id) as unique_voters_count'))
      ->withPortions()
      ->where('campaign_id', $campaign->id)
      ->where('voter_filters.active', 1)
      ->groupBy('portion_id')
      ->get();
    foreach ($portions as $portion) {
      if ($portion->unique_voters_count != $portionsHash[$portion->portion_id]['unique_voters_count']) {
        VoterFilter::where('id', $portion->portion_id)
          ->update([
            'unique_voters_count' => $portion->unique_voters_count
          ]);
      }
      if (isset($portionsHash[$portion->portion_id])) unset($portionsHash[$portion->portion_id]);
    }
    //set remaining portions' unique voter count to 0
    $portionsIds = [];
    foreach ($portionsHash as $portion) {
      $portionsIds[] = $portion['id'];
    }
    VoterFilter::whereIn('id', $portionsIds)
      ->where(function ($query) {
        $query->whereNull('unique_voters_count')
          ->orWhere('unique_voters_count', '!=', 0);
      })
      ->update([
        'unique_voters_count' => 0
      ]);
  }

  /**
   * Add caller phone to voter phone object
   *
   * @param array $voterPhones
   * @param string $callerPhone
   * @return void
   */
  public static function addCallerPhoneToVoterPhonesList($voterPhones, $callerPhone)
  {
    foreach ($voterPhones as $voterPhone) {
      $voterPhone->caller_phone = $callerPhone;
    }
    return $voterPhones;
  }
}
