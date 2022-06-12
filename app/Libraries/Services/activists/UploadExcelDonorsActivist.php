<?php

namespace App\Libraries\Services\activists;

use App\Http\Controllers\GlobalController;
use App\Http\Controllers\VoterElectionsController;
use App\Libraries\Helper;
use App\Libraries\Services\ActivistAllocation\ActivistsAllocationsCreator;
use App\Libraries\Services\VotersActivistsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistsAllocations;
use App\Models\City;
use App\Models\ElectionRolesByVoters;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\VotersRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use stdClass;

/**
 * class for upload array donor like activist assignment
 */
class UploadExcelDonorsActivist
{
    public static function uploadFile()
    {
        $count = 0;
        $captainTzCSV = storage_path('\\app\\' . 'don.csv'); //."\\".$csvLocation;
        $originalFile = fopen($captainTzCSV, 'r');

        while (($fileData = fgetcsv($originalFile)) !== false) {

            $cityName = $fileData[0];
            $cityId = self::getCityId($cityName);

            $personal_identity_voter = Helper::trimStartZero($fileData[1]); //tz voter
            $voter = VotersRepository::getVoterByPersonalIdentity($personal_identity_voter, false);
            if (!$voter) {
                echo 'not find:' . $personal_identity_voter;
            } else {
                $sum = Helper::removeAllNoneNumericCharacters($fileData[2]); //sum
                $phone = Helper::removeAllNoneNumericCharacters($fileData[3]); //sum
                $check_number=Helper::removeAllNoneNumericCharacters($fileData[4]); //sum

                $electionRoleVoter = new ElectionRolesByVoters();
                $cityId = self::getCityId($cityName);
                if ($cityId) {
                    $electionRoleVoter->key = Helper::getNewTableKey('election_roles_by_voters', 5);
                    $electionRoleVoter->assigned_city_id = $cityId;
                    $electionRoleVoter->election_campaign_id = 27;
                    $electionRoleVoter->election_role_id = 6; //עובד מטה
                    $electionRoleVoter->voter_id = $voter->id;
                    $electionRoleVoter->phone_number = $phone;
                    $electionRoleVoter->user_create_id = 1915;
                    $electionRoleVoter->save();

                    $allocation = ActivistsAllocationsCreator::createAllocationForCityRole($cityId, null, 27, 6, null, 7476327);
                    ActivistsAllocationsAssignmentsRepository::addAssignments($electionRoleVoter->id, $allocation->id);
                    $activistRolePayment = ActivistRolesPaymentsRepository::createIfNotExist($electionRoleVoter->id, $sum);
                    $activistPayment=new ActivistPayment();
                    $activistPayment->payment_group_id=313;
                    $activistPayment->voter_id = $voter->id;
                    $activistPayment->key = Helper::getNewTableKey('activist_payments', ActivistPayment::$length);
                    $activistPayment->amount = intval($sum);
                    $activistPayment->status_id = 3;
                    $activistPayment->is_shas_payment=1;
                    $activistPayment->check_number=intval($check_number);
                    $activistPayment->election_campaign_id=27;
                    $activistPayment->created_by = 7476327;
                    $activistPayment->save();


                } else {
                    echo 'אין עיר ל - ' . $personal_identity_voter;
                }
            }
            $count++;
        }

        fclose($originalFile);
        echo ($count);
        return $count;
    }

    public static function getCityId($cityName)
    {
        $city = City::select()->where('name', $cityName)->first();
        if (!$city) {
            $city = new City();
            $city->key = Helper::getNewTableKey('cities', 10);
            $city->name = $cityName;
            $city->mi_id = 0;
            $city->save();

            echo 'create-city: ' . $city->name;
        }

        return $city->id;
    }

}
