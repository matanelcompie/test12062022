<?php

namespace App\Libraries\Services\ServicesModel\ActivistPaymentService;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\ActivistsAllocationsAssignments\ActivistRolePaymentCreator;
use App\Libraries\Services\ExportFile\ExcelFileService;
use App\Libraries\Services\FileService;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistPaymentModels\PaymentStatus;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use stdClass;

class ActivistRolesPaymentService
{



  /*
    function delete payment role by election role and assignment
    get election role by voter and assignment
    function check if the role type is ballot role-its delete by assignment
    if its not ballot role, but its cluster role-delete payment by role voter if the assignment is the last  
    */
  public static function deletePaymentByElectionRoleAndAssignment($election_role_voter_id, $activist_allocation_assignment_id)
  {

    //check if the role of assignment is not ballot member
    //arr of role cannot remove by election role by voter only by activists_allocations_assignment_id
    $need_by_assignment_id = false;
    $arrRoleCannotRemove = ActivistRolePaymentCreator::getSystemRolesNameIncludePaymentForAssignment();

    $electionRoleVoter = ElectionRolesByVotersRepository::getElectionRoleByVoterWithSystemRole($election_role_voter_id);

    //if election role is ballot member/observe/counter need include activists_allocations_assignment_id
    if (in_array($electionRoleVoter->system_name, $arrRoleCannotRemove)) {
      $need_by_assignment_id = true;

      if (is_null($activist_allocation_assignment_id))
        throw new Exception(config('errors.payments.ERROR_DELETE_PAYMENT_BY_ELECTION_ROLE_VOTER'));
    } else {
      //its cluster role need remove payment if the assignment is single
      if (!ElectionRolesByVotersRepository::checkIsSingleAssignmentOfElectionRoleVoters($election_role_voter_id, $activist_allocation_assignment_id))
        return true; //not need delete
    }


    //delete payment role record
    $query = ActivistRolesPayments::where('election_role_by_voter_id', $election_role_voter_id);
    if ($need_by_assignment_id)
      $query->where('activists_allocations_assignment_id', $activist_allocation_assignment_id);

    if (self::checkActivistRolePaymentInGroupPaymentOrLock(clone $query))
      throw new Exception(config('errors.payments.ERROR_DELETE_PAYMENT_ITS_IN_GROUP'));
    else {
      //delete payment role record
      $query->delete();
      return true;
    }
  }


  //function get query activist payment role and check if all record in query in group payment for pay
  public static function checkActivistRolePaymentInGroupPaymentOrLock($query)
  {
    $arrActivistRoleIngroupPayment = $query->where(function ($query) {
      $query->whereNotNull('activist_payment_id')->orWhereNotNull('user_lock_id');
    })->get();
    if ($arrActivistRoleIngroupPayment &&  $arrActivistRoleIngroupPayment->count() > 0)
      return true;

    return false;
  }

  public static function downloadExcelPaymentRoleDetailsBySearchObject($objectSearchDetails)
  {
    $arrActivistRolePayment = ActivistRolesPaymentsRepository::getListPaymentsByVoter($objectSearchDetails);

    $nameFile = 'רשימת תשלומי פעילים';
    $headers = [
      'שם פעיל' => 'voter_name',
      'תעודת זהות' => 'personal_identity',
      'תפקיד' => 'election_roles_name',
      'סוג תשלום מיוחד' => 'payment_type_additional_name',
      'סכום' => 'sum',
      'נעול' => 'lock_date',
      'הערה' => 'comment',
      'בנק' => 'original_bank_id',
      'סניף' => 'original_branch_number',
      'מספר חשבון' => 'original_bank_account_number',
      'קבוצת תשלום ' => 'payment_group_name',
      'מספר אסמכתא' => 'reference_id',
      'תאריך העברה' => 'transfer_date',
      'פרטי העברה' => 'transfer_details'
    ];
    ExcelFileService::download($headers, $arrActivistRolePayment, $nameFile);
  }
}
