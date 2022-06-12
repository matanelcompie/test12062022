<?php

namespace App\Libraries\Services\activists;

use App\Enums\ElectionRolesAdditions;
use App\Enums\PaymentStatus as EnumsPaymentStatus;
use App\Enums\TypePaymentGroupRole;
use App\Enums\VerifyBankStatuses;
use App\Http\Controllers\GlobalController;
use App\Http\Controllers\VoterElectionsController;
use App\Libraries\Services\VotersActivistsService;
use App\Libraries\Helper;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Repositories\PaymentStatusRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use stdClass;

class searchActivistService
{


    private static function StructSearchObject()
    {

        $hashFieldQuery = new stdClass();
        $hashFieldQuery->cityAssignedId = array('field' => 'election_roles_by_voters.assigned_city_id');
        $hashFieldQuery->subareaAssignedId = array('field' => 'assigned_city.sub_area_id');
        $hashFieldQuery->areaAssignedId = array('field' => 'assigned_city.area_id');
        $hashFieldQuery->personalIdentity = array('field' => 'voters.personal_identity');
        $hashFieldQuery->firstName = array('field' => 'voters.first_name');
        $hashFieldQuery->lastName = array('field' => 'voters.last_name');
        $hashFieldQuery->phoneNumber = array('field' => 'election_roles_by_voters.phone_number');
        $hashFieldQuery->electionCampaignId = array('field' => 'election_roles_by_voters.election_campaign_id');
        $hashFieldQuery->reference_id = array('field' => 'payment_group.reference_id');
        $hashFieldQuery->payment_type_additional = array('field' => 'activist_roles_payments.payment_type_additional_id');
        $hashFieldQuery->voterId = array('field' => 'election_roles_by_voters.voter_id');

        $hashFieldQuery->verifyStatus = array('field' => 'election_roles_by_voters.verified_status');
        $hashFieldQuery->verifyBankStatus =  array('specialFunction' => true);


        $hashFieldQuery->electionRoleId =
            array('field' => 'election_roles_by_voters.election_role_id',);
        //option 1 not lock option 2 lock
        $hashFieldQuery->activistLocked =
            array(
                'field' => 'activist_roles_payments.user_lock_id',
                'option' => [1 => null, 2 => -1]
            );

        //option paid 1-paid 2-not paid role without payment_id
        $hashFieldQuery->paid = array('specialFunction' => true);
            // array(
            //     'field' => 'activist_roles_payments.activist_payment_id',
            //     'option' => [1 => -1, 2 => null]
            // );

        return $hashFieldQuery;
    }


    public static function getSearchActivistByPrams(Request $request, $exportType = null)
    {
        $detailsSearch = new stdClass();
        $countMultiRolesOnly = null;
        $detailsSearch->electionCampaignId = null;
        $detailsSearch->areaId = $request->input('area_id', null);
        $detailsSearch->subAreaId = $request->input('sub_area_id', null);
        $detailsSearch->cityId = $request->input('city_id', null);
        $detailsSearch->cityAssignedId = $request->input('assigned_city_id', null);
        $detailsSearch->subareaAssignedId = $request->input('assigned_subarea_id', null);
        $detailsSearch->areaAssignedId = $request->input('assigned_area_id', null);
        $detailsSearch->voterId = $request->input('voter_id', null);

        $detailsSearch->personalIdentity = $request->input('personal_identity', null);
        if (!is_null($detailsSearch->personalIdentity))
            $detailsSearch->personalIdentity = Helper::trimStartZero($detailsSearch->personalIdentity);
        $detailsSearch->firstName = $request->input('first_name', null);
        $detailsSearch->lastName = $request->input('last_name', null);
        $detailsSearch->phoneNumber = $request->input('phone_number', null);

        if (!is_null($detailsSearch->phoneNumber)) {
            $detailsSearch->phoneNumber = str_replace('-', '', $detailsSearch->phoneNumber);
        }

        $detailsSearch->assignmentStatus = $request->input('assignment_status', null);
        $detailsSearch->verifyStatus = $request->input('verify_status', null);
        $detailsSearch->verifyBankStatus = $request->input('verify_bank_status', null);

        $detailsSearch->electionRoleId = $request->input('election_role_id', null);
        $detailsSearch = self::setElectionRoleTypeInSearchObject($detailsSearch);

        $detailsSearch->reference_id = $request->input('reference_id', null);
        if (!is_null($request->input('electionCampaignId')))
            $detailsSearch->electionCampaignId = $request->input('electionCampaignId', null);
        else
            $detailsSearch->electionCampaignId = $request->input('election_campaign_id', null);
        $detailsSearch->activistLocked = $request->input('activistLocked', null);
        $detailsSearch->paid = $request->input('paid', null);
        $detailsSearch->payment_type_additional = $request->input('payment_type_additional', null);

        $detailsSearch = self::checkValidSearch($detailsSearch);
        if ($detailsSearch) {
            return $detailsSearch;
        } else
            throw new Exception(config('errors.system.ERROR_SEARCH_FIELDS'));
    }

    //function check if the search is valid
    private static function checkValidSearch($detailsSearch)
    {
        $validSearch = false;
        $election_roles_additions = config('constants.activists.election_roles_additions');

        if (!is_null($detailsSearch->personalIdentity) || !is_null($detailsSearch->phoneNumber) || (!is_null($detailsSearch->firstName) && !is_null($detailsSearch->lastName))) {
            $validSearch = true;
        }

        $isUserAdmin = Auth::user()['admin'] == '1';

        $assignedCitiesArray = null;
        //check permission by city
        if ($detailsSearch->cityAssignedId || $detailsSearch->subareaAssignedId || $detailsSearch->areaAssignedId) {
            $assignedCitiesArray  = self::getAssignedCitiesArray($detailsSearch->cityAssignedId, $detailsSearch->subareaAssignedId, $detailsSearch->areaAssignedId);
        }

        if (!isset($detailsSearch->electionRoleId) || $detailsSearch->electionRoleId != $election_roles_additions['NONE']) {
            //If role exist - can choose only city.
            if ($isUserAdmin  || !empty($assignedCitiesArray)) { //|| $detailsSearch->cityId
                $validSearch = true;
            }
        } else {
            //If role not exist - can choose city and last/first name.
            //($detailsSearch->cityId || !empty($assignedCitiesArray)
            if ((!empty($assignedCitiesArray)) && (!is_null($detailsSearch->firstName) || !is_null($detailsSearch->lastName))) {
                $validSearch = true;
            }
        }

        if (!$validSearch)
            return false;


        return $validSearch ? $detailsSearch : false;
    }
    private static function getAssignedCitiesArray($cityAssignedId, $subareaAssignedId, $areaAssignedId)
    {

        $assignedCitiesArray = [];
        $cities = City::select('id', 'key')
            ->where('cities.deleted', 0);

        if ($cityAssignedId) {
            $cities->where('cities.id', $cityAssignedId);
        } else if ($subareaAssignedId) {
            $cities->where('sub_area_id', $subareaAssignedId);
        } else if ($areaAssignedId) {
            $cities->where('area_id', $areaAssignedId);
        }
        $cities = $cities->get();
        if ($cities) {
            $assignedCitieskeysArray = [];
            foreach ($cities as $c) {
                $assignedCitieskeysArray[] = $c->key;
            }
            $assignedCitiesArray = GlobalController::isAllowedCitiesForUser($assignedCitieskeysArray);
        }
        // dd($assignedCitiesArray);
        return $assignedCitiesArray;
    }

    public static function createQueryWithSearchDetails($query, $objectSearch)
    {
        $hashFieldQuery = searchActivistService::StructSearchObject();
        foreach ($objectSearch as $keyField => $value) {
            if (is_null($value) || (!is_array($value) && strcmp($value, '') == 0))
                continue;

            $detailsFieldSearch = $hashFieldQuery->$keyField;

            if (array_key_exists('specialFunction', $detailsFieldSearch)) {
                self::specialFunctionField($keyField, $value, $query, $objectSearch);
            } else {
                //only one option for name field in query for one field search
                if (array_key_exists('field', $detailsFieldSearch)) {
                    $propertyWhereQuery = $detailsFieldSearch['field'];
                    if (array_key_exists('option', $detailsFieldSearch)) {

                        $option = $detailsFieldSearch['option'];
                        $value = $option[$value];
                    }
                }
                //multi option can be for name field query by value field search
                else {
                    $ArrOptionNameField = $detailsFieldSearch['specialField'];
                    $fieldQuery = $ArrOptionNameField[$value];
                    $propertyWhereQuery = $fieldQuery['field']; //name field in query
                    $value = $fieldQuery['value'];
                }

                if (is_null($value))
                    $query = $query->whereNull($propertyWhereQuery);
                else if ($value == -1)
                    $query = $query->whereNotNull($propertyWhereQuery);
                else if (is_array($value))
                    $query = $query->whereIn($propertyWhereQuery, $value);
                else
                    $query = $query->where($propertyWhereQuery, $value);
            }
        }

        return $query;
    }

    public static function getArraySearchNameFieldOfPaymentRecordNeedPay()
    {
        return ['activistLocked', 'payment_type_additional'];
    }

    public static function getArraySearchNameFieldOfPaymentGroup()
    {
        return ['activistLocked', 'payment_type_additional', 'paid','reference_id'];
    }


    public static function specialFunctionField($field, $value, $query, $objectSearch)
    {
        switch ($field) {
            case 'verifyBankStatus':
                self::addVerifyStatusToQuery($query, $value, $objectSearch->electionCampaignId);
                break;
            case 'paid':
                self::addActivistPaymentPaidStatusToQuery($query, $value);
                break;

            default:

                break;
        }
    }
    public static function addVerifyStatusToQuery($votersObj, $verifyBankStatuses, $last_campaign_id)
    {
        if (is_null($verifyBankStatuses))
            return;

        if (!is_array($verifyBankStatuses))
            $verifyBankStatuses = [intval($verifyBankStatuses)];
        else
            $verifyBankStatuses = array_map('intval', $verifyBankStatuses);

        if (in_array(VerifyBankStatuses::ALL_DETAILS_COMPLETED, $verifyBankStatuses)) {
            $votersObj->where(function ($query) use ($last_campaign_id) {
                $query->whereNotNull('bank_details.bank_account_number')
                    ->whereNotNull('bank_details.verify_bank_document_key')
                    ->where('bank_details.is_bank_verified', 1)
                    ->where('bank_details.validation_election_campaign_id', $last_campaign_id);
            });
            return;
        }

        if (in_array(VerifyBankStatuses::NOT_ALL_DETAILS_COMPLETED, $verifyBankStatuses)) {
            $votersObj->where(function ($query) use ($last_campaign_id) {
                $query->orWhereNull('bank_details.id')
                    ->orWhereNull('bank_details.bank_account_number')
                    ->orWhereNull('bank_details.verify_bank_document_key')
                    ->orWhere('bank_details.is_bank_verified', 0)
                    ->orWhere('bank_details.validation_election_campaign_id', '!=', $last_campaign_id);
            });
            return;
        }

        $DisplayBankDetailsMissing = in_array(VerifyBankStatuses::BANK_DETAILS_MISSING, $verifyBankStatuses);
        $DisplayVerifyDocumentMissing = in_array(VerifyBankStatuses::VERIFIED_DOCUMENT_MISSING, $verifyBankStatuses);
        $DisplayBankNotVerified = in_array(VerifyBankStatuses::BANK_NOT_VERIFIED, $verifyBankStatuses);
        $DisplayBankNotUpdated = in_array(VerifyBankStatuses::BANK_NOT_UPDATED, $verifyBankStatuses);

        if ($DisplayBankNotUpdated) {
            $votersObj->where(function ($query) use (
                $last_campaign_id,
                $DisplayVerifyDocumentMissing,
                $DisplayBankNotVerified,
                $DisplayBankDetailsMissing
            ) {
                $query->where('validation_election_campaign_id', '!=', $last_campaign_id);
                if (!$DisplayBankNotVerified) {
                    $query->where('bank_details.is_bank_verified', 1);
                } else {
                    $query->orWhere('bank_details.is_bank_verified', 0);
                }
                if (!$DisplayVerifyDocumentMissing) {
                    $query->whereNotNull('bank_details.verify_bank_document_key');
                } else {
                    $query->orWhereNull('bank_details.verify_bank_document_key');
                }
                if (!$DisplayBankDetailsMissing) {
                    $query->whereNotNull('bank_details.bank_account_number');
                } else {
                    $query->orWhereNull('bank_details.id')
                        ->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if ($DisplayBankNotVerified) {
            $votersObj->where(function ($query) use ($DisplayVerifyDocumentMissing, $DisplayBankDetailsMissing) {
                $query->where('bank_details.is_bank_verified', 0);
                if (!$DisplayVerifyDocumentMissing) {
                    $query->whereNotNull('bank_details.verify_bank_document_key');
                } else {
                    $query->orWhereNull('bank_details.verify_bank_document_key');
                }
                if (!$DisplayBankDetailsMissing) {
                    $query->whereNotNull('bank_details.bank_account_number');
                } else {
                    $query->orWhereNull('bank_details.id')->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if ($DisplayVerifyDocumentMissing) {
            $votersObj->where(function ($query) use ($DisplayBankDetailsMissing) {
                $query->whereNull('bank_details.verify_bank_document_key');

                if (!$DisplayBankDetailsMissing) {
                    $query->whereNotNull('bank_details.bank_account_number');
                } else {
                    $query->orWhereNull('bank_details.id')->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if ($DisplayBankDetailsMissing) {
            $votersObj->where(function ($query) use ($last_campaign_id) {
                $query->whereNull('bank_details.bank_account_number')
                    ->orWhereNull('bank_details.id');
            });
        }
    }

    /**
     * Get $query or search and arr paid option
     * option paid  - PaymentStatus enum
     * @param  $query
     * @param array $arrPaymentStatusOption PaymentStatus enum 
     * @return void
     */
    public static function addActivistPaymentPaidStatusToQuery($query, $arrPaymentStatusOption)
    {
        $paymentStatusNotPaidId = PaymentStatusRepository::getBySystemName(EnumsPaymentStatus::STATUS_WAITE_PAY);
        if (in_array($paymentStatusNotPaidId, $arrPaymentStatusOption)) {
            $query->where(function ($q) use ($paymentStatusNotPaidId) {
                $q->where('activist_payments.status_id', $paymentStatusNotPaidId)
                    ->orWhereNull('activist_payments.id');
            });
        } else if (count($arrPaymentStatusOption) > 0) {
            $query->whereIn('activist_payments.status_id', $arrPaymentStatusOption);
        }
    }


    public static function setElectionRoleTypeInSearchObject($detailsSearch)
    {
        
        //election role form excel
        if (!is_array($detailsSearch->electionRoleId) && strpos($detailsSearch->electionRoleId, ','))
            $detailsSearch->electionRoleId = explode(',', $detailsSearch->electionRoleId);

        else if (!is_null($detailsSearch->electionRoleId) && !is_array($detailsSearch->electionRoleId))
            $detailsSearch->electionRoleId = [$detailsSearch->electionRoleId];

        if (!is_null($detailsSearch->electionRoleId) && in_array(ElectionRolesAdditions::ALL_ROLE_TYPE, $detailsSearch->electionRoleId)) //if all election role type
        {
            unset($detailsSearch->electionRoleId);
        }

        else if (!is_null($detailsSearch->electionRoleId) && in_array(ElectionRolesAdditions::SHAS_ELECTION_ROLE, $detailsSearch->electionRoleId)) //if shas role type
        {
            $detailsSearch->electionRoleId = TypePaymentGroupRole::getShasElectionRoleArrId();
        }

        else if (!is_null($detailsSearch->electionRoleId) && in_array(ElectionRolesAdditions::KNESET_ELECTION_ROLE, $detailsSearch->electionRoleId)) //if kneset role type
        {
            $detailsSearch->electionRoleId = TypePaymentGroupRole::getRoleNotInShasPaymentArrId();
        }

        return $detailsSearch;
    }
}
