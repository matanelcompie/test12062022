<?php

namespace App\Libraries\Services\ServicesModel\ElectionRolesByVotersService;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\HelperDate;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistRolesPaymentService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\ActivistRolesPaymentsRepository;
use App\Repositories\ActivistsAllocationsAssignmentsRepository;
use App\Repositories\ActivistsAllocationsRepository;
use App\Repositories\PaymentGroupRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

//class that contain function to run for Arrange system assignment 

class ElectionRoleProcessForArrangeSystem
{

    static $paymentGroupArr=array();
    //the function arrange all bonus captain fifty to role type captain fifty and set type payment_type_additional=bonus
    public static function ArrangeElectionRoleBonusForNewSystemRules()
    {
        $electionRoleBonusId = ElectionRoles::getIdBySystemName('additional_payments');
        $electionRoleCaptainId = ElectionRoles::getIdBySystemName('captain_of_fifty');
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        $electionRoleBonus = ElectionRolesByVoters::select([
            DB::raw('captain_role.id as parent'),
            DB::raw('election_roles_by_voters.*')
        ])
            //join for parent bonus of captain fifty
            ->join('election_roles_by_voters as captain_role', function ($query) use ($electionRoleCaptainId, $electionCampaignId) {
                $query->on('captain_role.election_role_id', '=', DB::raw($electionRoleCaptainId))
                    ->on('captain_role.election_campaign_id', '=', DB::raw(26))
                    ->on('captain_role.voter_id', '=', 'election_roles_by_voters.voter_id');
            })
            ->where('election_roles_by_voters.election_campaign_id', 26)
            ->where('election_roles_by_voters.election_role_id', $electionRoleBonusId)
            ->get();


        foreach ($electionRoleBonus as $key => $captainRoleBonus) {
            $electionRolePayment = new ActivistRolesPayments();
            $electionRolePayment->election_role_by_voter_id = $captainRoleBonus->parent;
            $electionRolePayment->activists_allocations_assignment_id = null;
            $electionRolePayment->sum = $captainRoleBonus->sum;
            $electionRolePayment->comment = $captainRoleBonus->comment;
            $electionRolePayment->user_lock_id = $captainRoleBonus->user_lock_id;
            $electionRolePayment->lock_date = $captainRoleBonus->lock_date;
            $electionRolePayment->not_for_payment = $captainRoleBonus->not_for_payment;
            $electionRolePayment->payment_type_additional_id = 1;
            $electionRolePayment->created_by = 7476327;
            $electionRolePayment->save();
        }
    }
    // Change the activists assignments format - according to old geo table
    public static function changeAllocationsAssignmentsFormat()
    {
        self::changeBallotsAllocationsAssignmentsFormat();
        self::changeClustersAllocationsAssignmentsFormat();
    }
    
    // Change the ballots activists assignments format - according to old geo table

    public static function changeBallotsAllocationsAssignmentsFormat()
    {
        // from ElectionRolesGeographical:
        $allGeo = ActivistsAllocations::select('election_role_by_voter_geographic_areas.*', 'activists_allocations.id as activist_allocation_id')
            ->join('election_role_by_voter_geographic_areas', function ($query) {
                $query->on('election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(4))
                    ->on('election_role_by_voter_geographic_areas.entity_id', '=', 'activists_allocations.ballot_box_id');
            })

            ->join('election_roles_by_voters','election_roles_by_voters.id','=','election_role_by_voter_geographic_areas.election_role_by_voter_id')
            ->where('activists_allocations.election_campaign_id', 26)
            ->get();
         
        foreach ($allGeo as $geo) {
            $fieldName = 'ballot_box_id';

            //check if exist assignment
            $ActivistAllocation = ActivistsAllocations::select('activists_allocations_assignments.*', 'activists_allocations.id as activist_allocation_id')
                ->where($fieldName, $geo->entity_id)
                ->where('activists_allocations_assignments.election_role_shift_id', $geo->election_role_shift_id)
                ->withActivistsAssignments()
                ->where('activists_allocations_assignments.election_role_by_voter_id', $geo->election_role_by_voter_id);

            $activist = ElectionRolesByVoters::where('id', $geo->election_role_by_voter_id)->first();
            if (!$activist) {
                Log::info('not-exists election_role_by_voter_id: ' . $geo->election_role_by_voter_id . ' - ' . $geo->id);
                continue;
            }

            $ActivistAllocation = $ActivistAllocation->first();
            if (!$ActivistAllocation) {
                $ActivistAllocationAssignment = new ActivistAllocationAssignment();
                $ActivistAllocationAssignment->election_role_shift_id = $geo->election_role_shift_id;
                $ActivistAllocationAssignment->election_role_by_voter_id = $geo->election_role_by_voter_id;
                $ActivistAllocationAssignment->activist_allocation_id = $geo->activist_allocation_id;
                $ActivistAllocationAssignment->appointment_letter = $geo->appointment_letter;
                $ActivistAllocationAssignment->arrival_date = $geo->arrival_date;
                $ActivistAllocationAssignment->vote_source_id = $geo->vote_source_id;
                $ActivistAllocationAssignment->current_reporting = $geo->current_reporting;
                $ActivistAllocationAssignment->correct_reporting = $geo->correct_reporting;
                $ActivistAllocationAssignment->report_finished_date = $geo->report_finished_date;
                $ActivistAllocationAssignment->not_coming = $geo->not_coming;
                $ActivistAllocationAssignment->not_check_location = $geo->not_check_location;
                $ActivistAllocationAssignment->created_by = 7476327;

                $ActivistAllocationAssignment->save();
                self::createPaymentForBallotActivist($geo,$activist,$ActivistAllocationAssignment->id);
            }
            else
            {
                Log::info('exist'.json_encode($ActivistAllocation));
            }
        }
    }

    public static function createPaymentForBallotActivist($ballotGeo, $electionRoleVoter, $activists_allocations_assignment_id)
    {

        $electionRolePayment = new ActivistRolesPayments();
        $electionRolePayment->election_role_by_voter_id = $ballotGeo->election_role_by_voter_id;
        $electionRolePayment->activists_allocations_assignment_id = $activists_allocations_assignment_id;
        $electionRolePayment->sum = $ballotGeo->sum;
        $electionRolePayment->comment = $electionRoleVoter->comment;
        $electionRolePayment->user_lock_id = $electionRoleVoter->user_lock_id;
        $electionRolePayment->lock_date = $electionRoleVoter->lock_date;
        $electionRolePayment->not_for_payment = $electionRoleVoter->not_for_payment;
        $electionRolePayment->created_by = 7476327;
        $electionRolePayment->save();
    }


    // Change the clusters activists assignments format - according to old geo table

    public static function changeClustersAllocationsAssignmentsFormat()
    {
        // from ElectionRolesGeographical:
        $allActivistsAllocations = ActivistsAllocations::select('activists_allocations_copy.election_role_by_voter_id', 'activists_allocations_copy.id as activist_allocation_id')
        ->withActivistsAssignments(true)
            ->where('election_campaign_id', 26)
            ->whereNull('activists_allocations_assignments.id')
            ->whereNotNull('activists_allocations_copy.election_role_by_voter_id')
            ->get();

        Log::info(json_encode($allActivistsAllocations->count()));

        foreach ($allActivistsAllocations as $ActivistAllocation) {

            $activist = ElectionRolesByVoters::where('id', $ActivistAllocation->election_role_by_voter_id)->first();
            if (!$activist) {
                Log::info('not-exists election_role_by_voter_id: ' . $ActivistAllocation->election_role_by_voter_id . ' - ' . $ActivistAllocation->id);
                continue;
            }

            $ActivistAllocationAssignment = new ActivistAllocationAssignment;
            $ActivistAllocationAssignment->election_role_by_voter_id = $ActivistAllocation->election_role_by_voter_id;
            $ActivistAllocationAssignment->activist_allocation_id = $ActivistAllocation->activist_allocation_id;
            $ActivistAllocationAssignment->created_by = 7476327;
            $ActivistAllocationAssignment->save();
        }
    }


    // Update the ballots activists payment table - according to sum in old geo table

    public static function updateBallotsElectionsRolesPaymentsTable()
    {
        $electionCampaignId = ElectionCampaigns::currentCampaign()->id;

        // For ballot roles:
        $allBallotRoles = ElectionRolesByVoters::select(
            'activists_allocations_assignments.election_role_by_voter_id',
            'election_role_by_voter_geographic_areas.sum',
            'activists_allocations_assignments.id as activists_allocations_assignment_id',
            'election_roles_by_voters.lock_date as lock_date',
            'election_roles_by_voters.user_lock_id as user_lock_id',
            'election_roles_by_voters.comment as comment'
        )
            ->join('activists_allocations_assignments', 'activists_allocations_assignments.election_role_by_voter_id', '=', 'election_roles_by_voters.id')
            ->join('activists_allocations', 'activists_allocations.id', '=', 'activists_allocations_assignments.activist_allocation_id')
            ->join('election_role_by_voter_geographic_areas', function ($joinOn) {
                $joinOn->on('election_role_by_voter_geographic_areas.election_role_by_voter_id', '=', 'activists_allocations_assignments.election_role_by_voter_id')
                    ->on('activists_allocations.ballot_box_id', '=', 'election_role_by_voter_geographic_areas.entity_id')
                    ->on('election_role_by_voter_geographic_areas.entity_type', DB::raw(4));
            })
            ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
            ->get();
        // Log::info(json_encode($allBallotRoles));
        // die;
        foreach ($allBallotRoles as $item) {
            $ActivistRolePayment = ActivistRolesPayments::select('id')
                ->where('election_role_by_voter_id', $item->election_role_by_voter_id)
                ->where('activists_allocations_assignment_id', $item->activists_allocations_assignment_id)
                ->first();
            if (!$ActivistRolePayment) {
                $newActivistRolesPayments = new ActivistRolesPayments();
                $details = ['election_role_by_voter_id', 'activists_allocations_assignment_id', 'sum', 'lock_date', 'user_lock_id', 'comment'];
                foreach ($details as $d) {
                    $newActivistRolesPayments->$d = $item->$d;
                }
                $newActivistRolesPayments->save();
            }
        }
    }


    // Update the clusters activists payment table - according to election_role_by_voter_geographic_areas table
    //not bonus role

    public static function updateClustersElectionsRolesPaymentsTable()
    {
        $electionCampaignId = 26;
        $allClustersRoles = ActivistAllocationAssignment::select(
            'election_roles_by_voters.id as election_role_by_voter_id',
            'election_roles_by_voters.sum',
            'election_roles_by_voters.lock_date as lock_date',
            'election_roles_by_voters.user_lock_id as user_lock_id',
            'election_roles_by_voters.comment as comment',
            'election_roles.system_name as system_name'
        )
            ->withElectionRoleByVoter()
            ->withActivistRolesPayments()
            ->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
            ->where('election_roles_by_voters.election_role_id', '!=', DB::raw(18))
            ->whereNull('activist_roles_payments.id')
            ->get();
        Log::info(($allClustersRoles->count()));

        foreach ($allClustersRoles as $item) {
            $ActivistRolePayment = ActivistRolesPayments::select('id')
                ->where('election_role_by_voter_id', $item->election_role_by_voter_id)
                ->whereNull('activists_allocations_assignment_id')
                ->first();
            if (!$ActivistRolePayment) {
                $newActivistRolesPayments = new ActivistRolesPayments();
                $details = ['election_role_by_voter_id', 'sum', 'lock_date', 'user_lock_id', 'comment', 'not_for_payment'];
                foreach ($details as $d) {
                    $newActivistRolesPayments->$d = $item->$d;
                }
                $newActivistRolesPayments->created_by = 7476327;
                $newActivistRolesPayments->save();
            }
        }
    }

    //function arrange bonus role for new method payment activist role
    public static function arrangeBonusRecordDev()
    {

        $captainFiftyBonus = ElectionRolesByVoters::select(
            DB::raw("election_roles_by_voters.*"),
            DB::raw("(SELECT  p.id FROM election_roles_by_voters as p WHERE p.election_role_id=2 and election_campaign_id=26 and p.voter_id=election_roles_by_voters.voter_id and payment_type_additional_id is null limit 1) as parent")
        )
            ->whereNotNull('payment_type_additional_id')
            ->get();

        foreach ($captainFiftyBonus as $key => $bonus) {
            $parentElectionRoleVoter = $bonus->parent;
            if (is_null($parentElectionRoleVoter)) {
                echo 'error-' . $bonus->id;
            } else {

                $is_exist = ActivistRolesPaymentService::isExist($parentElectionRoleVoter, $bonus->payment_type_additional_id);
                if (!$is_exist) {
                    $newActivistRolesPayments = new ActivistRolesPayments();
                    $details = ['sum', 'lock_date', 'user_lock_id', 'comment', 'not_for_payment', 'payment_type_additional_id'];
                    foreach ($details as $d) {
                        $newActivistRolesPayments->$d = $bonus->$d;
                    }
                    $newActivistRolesPayments->election_role_by_voter_id = $bonus->parent;
                    $newActivistRolesPayments->save();
                }
            }
        }
    }

    /**
     * Temporary function for get all election role voter in 27 election
     * and create assignment anf activist role payment
     *
     * @return void
     */
    public static function arrange27Election()
    {
        $count = 0;
        $activistAllocation = ActivistsAllocations::select()->where('election_campaign_id', 27)->get();
        foreach ($activistAllocation as $key => $allocation) {
            $assignment = new ActivistAllocationAssignment();
            $assignment->election_role_by_voter_id = $allocation->election_role_by_voter_id;
            $assignment->activist_allocation_id = $allocation->id;
            $assignment->created_by = 7476327;
            $assignment->save();
            self::createPaymentForElectionRoleVoterId($assignment->election_role_by_voter_id);
            $count++;
        }
        echo $count;
    }

    public static function createPaymentForElectionRoleVoterId($electionRoleVoter)
    {
        $electionRolePayment = ActivistRolesPayments::select()->where('activist_roles_payments.election_role_by_voter_id', $electionRoleVoter->id)->first();
        if (!$electionRolePayment) {
            $electionRolePayment = new ActivistRolesPayments();
            $electionRolePayment->election_role_by_voter_id = $electionRoleVoter->id;
            $electionRolePayment->sum = $electionRoleVoter->sum;
            $electionRolePayment->comment = $electionRoleVoter->comment;
            $electionRolePayment->user_lock_id = $electionRoleVoter->user_lock_id;
            $electionRolePayment->lock_date = $electionRoleVoter->lock_date;
            $electionRolePayment->created_by = 7476327;
            $electionRolePayment->save();
        } else {
            Log::info('exist. ' . $electionRolePayment->election_role_by_voter_id);
        }
    }


    /**
     * Undocumented function
     *
     * @return 
     */
    public static function createAssignmentForCityRole()
    {
        $results = DB::select(DB::raw("
        select election_roles_by_voters.* from election_roles_by_voters where election_campaign_id=26
        and election_roles_by_voters.election_role_id!=18
        and election_roles_by_voters.id not in (
        select activists_allocations_assignments.election_role_by_voter_id from activists_allocations_assignments);
                "));

        foreach ($results as $key => $activistRole) {
            $allocation = new ActivistsAllocations();
            $allocation->city_id = $activistRole->assigned_city_id;
            $allocation->election_role_id = $activistRole->election_role_id;
            $allocation->election_campaign_id = 26;
            $allocation->created_by = 7476327;

            $allocation->save();

            $assignemt = new ActivistAllocationAssignment();
            $assignemt->election_role_by_voter_id = $activistRole->id;
            $assignemt->activist_allocation_id = $allocation->id;
            $assignemt->save();

            self::createPaymentForElectionRoleVoterId($activistRole);
        }
    }


    public static function updateTransferDetails()
    {
        $csvLocation = 'ballot.csv';
        $captainTzCSV = storage_path('\\app\\' . $csvLocation); //."\\".$csvLocation;
        $originalFile = fopen($captainTzCSV, 'r');


        while (($fileData = fgetcsv($originalFile)) !== false
        ) {
            $tz = preg_replace('/\s+/', '', $fileData[0]);
            $personal_identity = Helper::trimStartZero($tz); //tz captain
            $personal_identity=Helper::removeAllNoneNumericCharacters($personal_identity );
            $personal_identity = str_replace(
                ' ',
                '',
                $personal_identity
            );
            $personal_identity = str_replace("\r\n", "", $personal_identity);
            $amountFromFile = $fileData[1]; //amount
            $reference_idFile = $fileData[2]; //reference_id
            $transferDateFile = $fileData[3];
            $transferDateFile=HelperDate::convert_DDMMYYYY_toSqlDateString($transferDateFile);
            $nameGroupFile = $fileData[4];

            if (intval($reference_idFile) != 722460) {
                $ballotMemberPaymentQuery = ActivistRolesPayments::select(
                    DB::raw('activist_roles_payments.*'),
                    DB::raw('voters.id as voter_id'),
                    'bank_details.bank_branch_id',
                    'bank_details.bank_account_number',
                    'bank_details.bank_owner_name'
                )
                    ->withElectionRoleByVoter()
                    ->withVoter()
                    ->withVoterBankDetails()
                    ->where('voters.personal_identity', '=', DB::raw(''.$personal_identity))
                    ->where('election_roles_by_voters.election_role_id', '=', 8)
                    ->where('election_roles_by_voters.election_campaign_id', '=', 26);
                $ballotMemberPayment = $ballotMemberPaymentQuery->get();

                if (!$ballotMemberPayment || $ballotMemberPayment->count() == 0) {
                    Log::info('not exist' . $personal_identity);
                } else {
                    $count = 0;
                    $arrRolePaymentId=[];
                    foreach ($ballotMemberPayment as $key => $ballotPayment) {
                        $count = $count += $ballotPayment->sum;
                        $arrRolePaymentId[]=$ballotPayment->id;
                    }
                }

                if ($count == intval($amountFromFile)) {
                    $paymentGroup = self::getPaymentGroup($reference_idFile, $transferDateFile, $nameGroupFile);
                    $activistPayment = new ActivistPayment();
                    $activistPayment->voter_id = $ballotMemberPayment[0]->voter_id;
                    $activistPayment->key = Helper::getNewTableKey('activist_payments', ActivistPayment::$length);
                    $activistPayment->amount = intval($amountFromFile);
                    $activistPayment->status_id = 3;
                    $activistPayment->bank_branch_id = $ballotMemberPayment[0]->bank_branch_id;
                    $activistPayment->bank_account_number = $ballotMemberPayment[0]->bank_account_number;
                    $activistPayment->bank_account_owner_id = $personal_identity;
                    $activistPayment->bank_account_owner_name = $ballotMemberPayment[0]->bank_owner_name;
                    $activistPayment->payment_group_id = $paymentGroup->id;
                    $activistPayment->is_shas_payment = 0;
                    $activistPayment->election_campaign_id = 26;
                    $activistPayment->created_by = 7476327;
                    $activistPayment->save();

                    ActivistRolesPayments::select()->whereIn('id', $arrRolePaymentId)->update([
                        'activist_payment_id' => $activistPayment->id
                    ]);
                    Log::info('SUCCESS: ' . $personal_identity);
                } else {
                    Log::info('not count' . $personal_identity);
                }
            }
        }
    }

    public static function getPaymentGroup($reference_id, $transferDate, $nameGroup)
    {
        if (array_key_exists($reference_id, self::$paymentGroupArr))
            return self::$paymentGroupArr[$reference_id];

        $paymentGroup = PaymentGroup::select()->where('reference_id', $reference_id)->first();
        if (!$paymentGroup) {
            $paymentGroup = PaymentGroupRepository::insertNewGroupPayments(1, 2, $nameGroup, 26, $reference_id, $transferDate);
            self::$paymentGroupArr[$reference_id] = $paymentGroup;
        }

        return $paymentGroup;
    }












    //-----------------------------------------
    public static function updateGroupPaymentActivist()
    {
        $csvLocation = 'special.csv';
        $captainTzCSV = storage_path('\\app\\' . $csvLocation); //."\\".$csvLocation;
        $originalFile = fopen($captainTzCSV, 'r');


        while (($fileData = fgetcsv($originalFile)) !== false
        ) {
            $tz = preg_replace('/\s+/', '', $fileData[0]);
            $personal_identity = Helper::trimStartZero($tz); //tz captain
            $personal_identity=Helper::removeAllNoneNumericCharacters($personal_identity );
            $personal_identity = str_replace(
                ' ',
                '',
                $personal_identity
            );
            $personal_identity = str_replace("\r\n", "", $personal_identity);
            $amountFromFile = $fileData[1]; //amount
            $reference_idFile = $fileData[2]; //reference_id
            $transferDateFile = $fileData[3];
            $transferDateFile=HelperDate::convert_DDMMYYYY_toSqlDateString($transferDateFile);
            $nameGroupFile = $fileData[4];

            if (intval($reference_idFile) != 123079) {
                $activistSum = ActivistRolesPayments::select(
                    DB::raw('activist_roles_payments.*'),
                    DB::raw('voters.id as voter_id'),
                    'bank_details.bank_branch_id',
                    'bank_details.bank_account_number',
                    'bank_details.bank_owner_name'
                )
                ->withElectionRoleByVoter()
                ->withVoterBankDetails()
                    ->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
                    ->where('voters.personal_identity', $personal_identity)
                    ->whereNull('activist_roles_payments.activist_payment_id')
                    ->where('activist_roles_payments.sum','!=', DB::raw(0))
                    ->where('activist_roles_payments.sum','=', DB::raw($amountFromFile))
                    ->where('election_roles_by_voters.election_role_id', '!=', DB::raw(18))
                    ->where('election_roles_by_voters.election_campaign_id', DB::raw(26));

                $activistSum = $activistSum->first();
                $count = 0;
                if (!$activistSum) {
                    Log::info('not exist' . $personal_identity);
                } else {
                    
                    $arrRolePaymentId=[];
                    $count = $count += $activistSum->sum;
                    $arrRolePaymentId[]=$activistSum->id;
                    // foreach ($activistSum as $key => $ballotPayment) {
                    //     $count = $count += $ballotPayment->sum;
                    //     $arrRolePaymentId[]=$ballotPayment->id;
                    // }
              

                if ($count == intval($amountFromFile)) {
                    $paymentGroup = self::getPaymentGroup($reference_idFile, $transferDateFile, $nameGroupFile);
                    $activistPayment = new ActivistPayment();
                    $activistPayment->voter_id = $activistSum->voter_id;
                    $activistPayment->key = Helper::getNewTableKey('activist_payments', ActivistPayment::$length);
                    $activistPayment->amount = intval($amountFromFile);
                    $activistPayment->status_id = 3;
                    $activistPayment->bank_branch_id = $activistSum->bank_branch_id;
                    $activistPayment->bank_account_number = $activistSum->bank_account_number;
                    $activistPayment->bank_account_owner_id = $personal_identity;
                    $activistPayment->bank_account_owner_name = $activistSum->bank_owner_name;
                    $activistPayment->payment_group_id = $paymentGroup->id;
                    $activistPayment->is_shas_payment = 1;
                    $activistPayment->election_campaign_id = 26;
                    $activistPayment->created_by = 7476327;
                    $activistPayment->save();

                    ActivistRolesPayments::select()->whereIn('id', $arrRolePaymentId)->update([
                        'activist_payment_id' => $activistPayment->id
                    ]);
                    Log::info('SUCCESS: ' . $personal_identity);
                } else {
                    Log::info('not count' . $personal_identity.'-'.$count.'-'.$amountFromFile);
                }
            }
            }
        }
    }


    public static function getSumPaymentActivist($personalIdentity)
    {
        $sum = ActivistRolesPayments::select('sum(activist_roles_payments.sum) as amount')
        ->withElectionRoleByVoter()
            ->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
            ->where('voters.personal_identity', $personalIdentity)
            ->whereNull('activist_roles_payments.activist_payment_id')
            ->whereNull('activist_roles_payments.activists_allocations_assignment_id')
            ->where('election_roles_by_voters.election_campaign_id', DB::raw(26))
            ->first();

        if($sum)
        return $sum->amount;
        else
        {
            Log::info('notExist.'.$personalIdentity);
            return false;
        }
    }



    public static function ret()
    {
        $csvLocation = 'ret.csv';
        $captainTzCSV = storage_path('\\app\\' . $csvLocation); //."\\".$csvLocation;
        $originalFile = fopen($captainTzCSV, 'r');


        while (($fileData = fgetcsv($originalFile)) !== false
        ) {
            $tz = preg_replace('/\s+/', '', $fileData[0]);
            $personal_identity = Helper::trimStartZero($tz); //tz captain
            $personal_identity = Helper::removeAllNoneNumericCharacters($personal_identity);
            $personal_identity = str_replace(
                ' ',
                '',
                $personal_identity
            );
            $personal_identity = str_replace("\r\n", "", $personal_identity);
            $amountFromFile = $fileData[1]; //amount
            $reference_idFile = $fileData[2]; //reference_id

            $transferDateFile = $fileData[3];
            $transferDateFile=HelperDate::convert_DDMMYYYY_toSqlDateString($transferDateFile);
            $newReference_idFile = $fileData[4]; //reference_id

            $activistPaymentLast = ActivistPayment::select(DB::raw('activist_payments.*'))
                ->withVoter()
                ->join('payment_group', 'payment_group.id', '=', 'activist_payments.payment_group_id')
                ->where('voters.personal_identity', $personal_identity)
                ->where('payment_group.reference_id', $reference_idFile)
                ->first();

            if (!$activistPaymentLast) {
                Log::info('not' . $personal_identity);
            } else {
                $activistPaymentLast->status_id=4;
                $activistPaymentLast->reason_status_id=1;
                $activistPaymentLast->comment=$fileData[5];
                $activistPaymentLast->save();

                $paymentGroup = self::getPaymentGroup($newReference_idFile, $transferDateFile, 'חוזרים-' . $newReference_idFile);
                $activistPayment = new ActivistPayment();
                $activistPayment->voter_id = $activistPaymentLast->voter_id;
                $activistPayment->key = Helper::getNewTableKey('activist_payments', ActivistPayment::$length);
                $activistPayment->amount = intval($amountFromFile);
                $activistPayment->status_id = 3;
                $activistPayment->bank_branch_id = $activistPaymentLast->bank_branch_id;
                $activistPayment->bank_account_number = $activistPaymentLast->bank_account_number;
                $activistPayment->bank_account_owner_id = $personal_identity;
                $activistPayment->bank_account_owner_name = $activistPaymentLast->bank_account_owner_name;
                $activistPayment->payment_group_id = $paymentGroup->id;
                $activistPayment->is_shas_payment = 0;
                $activistPayment->election_campaign_id = 26;
                $activistPayment->first_payment_id = $activistPaymentLast->id;
                $activistPayment->parent_payment_id = $activistPaymentLast->id;
                $activistPayment->created_by = 7476327;
                $activistPayment->save();

                ActivistRolesPayments::select()->where('activist_payment_id', $activistPaymentLast->id)
                ->update(['activist_payment_id' => $activistPayment->id]);
            }
        }
    }


    public static function createErrorPayment()
    {

        $csvLocation = 'check.csv';
        $captainTzCSV = storage_path('\\app\\' . $csvLocation); //."\\".$csvLocation;
        $originalFile = fopen($captainTzCSV, 'r');


        while (($fileData = fgetcsv($originalFile)) !== false
        ) {
            $tz = preg_replace('/\s+/', '', $fileData[0]);
            $personal_identity = Helper::trimStartZero($tz); //tz captain
            $personal_identity = Helper::removeAllNoneNumericCharacters($personal_identity);
            $personal_identity = str_replace(
                ' ',
                '',
                $personal_identity
            );
            $personal_identity = str_replace("\r\n", "", $personal_identity);
            $amountFromFile = $fileData[1]; //amount
            $reference_idFile = $fileData[2]; //reference_id

            $sum = ActivistPayment::select()
                ->withVoter()
                ->join('payment_group', 'payment_group.id', '=', 'activist_payments.payment_group_id')
                ->where('voters.personal_identity', $personal_identity)
                ->where('payment_group.reference_id', $reference_idFile)
                ->first();

            if (!$sum) {
                Log::info('not' . $personal_identity);
            } else {
                Log::info('exsist' . $personal_identity);
            }
        }
    }



}
