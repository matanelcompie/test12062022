<?php

namespace App\Libraries\Services;

use App\Libraries\Services\ServicesModel\ActivistsAllocationsService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\Votes;
use App\Repositories\BallotBoxesRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VotersActivistsService
{

    public static function getVoterMuniRoleData(string $roleSystemName, array $where, array $fields, array $messagesFields){
        $muniElectionRole = ElectionRolesByVoters::select($fields)
        // ->addSelect() // Need to select activist user phone number!!!!
        ->withCampaign()
        ->withElectionRole()
        ->withUserCreate()
        ->withUserUpdate()
        ->withUserLock()
        ->withActivistAssingedCity()
        ->with(['messages' => function ($qr) use($messagesFields) {
            $qr->select($messagesFields)->where('deleted', 0);
        }])

        ->where($where)
        ->where('election_roles.system_name', $roleSystemName)
        ->first();
        // dump($roleSystemName, $muniElectionRole->toSql(), $muniElectionRole->getBindings());
        return $muniElectionRole;
    }


    public static function checkIfActivistHasBallotAllocation($electionRoleKey, $ballotId){
		$currentCampaignId = ElectionCampaigns::currentCampaign()->id;

		$ballot = BallotBox::select('ballot_boxes.id', 'ballot_boxes.mi_iron_number')
					->where('ballot_boxes.id', $ballotId)
					->first();
		if(!$ballot || !$ballot->mi_iron_number){ return null;}
		$fields = ['voters.personal_identity'];

		$electionRoleData = ElectionRolesByVoters::select($fields)
		->withElectionRole(false)
		->withVoter()
		->withElectionRoleGeographical(false)
		->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
		->where('election_role_by_voter_geographic_areas.entity_id', $ballotId)
		->where('election_roles_by_voters.key', $electionRoleKey)
		->where('election_roles_by_voters.election_campaign_id', $currentCampaignId)
		->whereIn('election_roles.system_name', ['observer', 'ballot_member', 'counter'])
		->first();
        if($electionRoleData){
            $electionRoleData->ballot_mi_iron_number = $ballot->mi_iron_number;
        }
        return $electionRoleData;
    }
    public static function getCityBallotsAppointmentLetters($electionRoleId,  $ballotRolesSystemNames, $cityId){
        $currentCampaign = ElectionCampaigns::currentCampaign();
		$electionCampaignId = $currentCampaign->id;
        return ElectionRolesByVoters::select('ballot_boxes.mi_iron_number as ballot_iron_number', 'voters.personal_identity')
        ->withGeographic()
		->withVoter()
		->withElectionRole(false)
		->join('ballot_boxes', function ( $joinOn ) {
			$joinOn->on([
				['ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id'],
				['election_role_by_voter_geographic_areas.entity_type', '=', DB::raw(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))],
			]);
		})
		->leftJoin('ballot_box_roles', 'ballot_boxes.ballot_box_role_id', 'ballot_box_roles.id')
		->leftJoin('clusters', 'ballot_boxes.cluster_id', 'clusters.id')
		->whereNotNull('mi_iron_number')
		->where('clusters.city_id', $cityId)
		->where('election_role_id', $electionRoleId)
		->where('election_roles_by_voters.election_campaign_id', $electionCampaignId)
		->whereIn('ballot_box_roles.system_name', $ballotRolesSystemNames)
		->get();
    }
    public static function getEntityBallotBoxesAndShifts($cityId, $quarterId){
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $electionCampaignId = $currentCampaign->id;
        $ClusterNameQuery = Cluster::getClusterFullNameQuery();
        $ballotBoxQuery = BallotBoxService::getBallotShiftsAndSupportersQuery($electionCampaignId);

        $ballotBoxQuery->withCluster()
            ->withBallotBoxRole()
            ->addSelect(DB::raw($ClusterNameQuery), 'ballot_boxes.mi_id', 'ballot_boxes.key', 'ballot_boxes.ballot_box_role_id as role', 'ballot_box_roles.system_name as ballot_role_system_name')
            ->where('city_id', $cityId)
            ->where('clusters.election_campaign_id', $electionCampaignId)
            ->orderBy('ballot_boxes.mi_id');

        if (!empty($quarterId)) {
            $ballotBoxQuery->where('clusters.quarter_id', $quarterId);
        }
        $ballots = $ballotBoxQuery->get();

        foreach ($ballots as $i => $ballot) {
            $ballots[$i]->last_vote_date = BallotBoxesRepository::getLastDateVoteInBallotBox($ballot->id, $electionCampaignId);
            $ballots[$i]->previous_shas_votes_count = $ballots[$i]->calculated_mi_shas_votes;
        }

        return $ballots;
    }
    public static function addVerifyStatusToQuery($votersObj, $verifyBankStatuses, $last_campaign_id){
        $verifyBankStatusesArray = config('constants.activists.verifyBankStatuses');

        $verifyBankStatusesHash = [];
        foreach($verifyBankStatuses as $item){
            $verifyBankStatusesHash[$item] = true;
        }

        if(!empty($verifyBankStatusesHash[$verifyBankStatusesArray['allDetailsCompleted']])){
            $votersObj->where(function ($query) use($last_campaign_id) {
                $query->whereNotNull('bank_details.bank_account_number')
                ->whereNotNull('bank_details.verify_bank_document_key')
                ->where('bank_details.is_bank_verified', 1)
                ->where('bank_details.validation_election_campaign_id', $last_campaign_id); 
            });
            return;
        }
        if(!empty($verifyBankStatusesHash[$verifyBankStatusesArray['notAllDetailsCompleted']])){
            $votersObj->where(function ($query) use($last_campaign_id)  {
                $query->orWhereNull('bank_details.id')
                ->orWhereNull('bank_details.bank_account_number')
                ->orWhereNull('bank_details.verify_bank_document_key')
                ->orWhere('bank_details.is_bank_verified', 0)
                ->orWhere('bank_details.validation_election_campaign_id', '!=', $last_campaign_id); 
            });
            return;
        }

        $DisplayBankDetailsMissing = isset($verifyBankStatusesHash[$verifyBankStatusesArray['bankDetailsMissing']]);
        $DisplayVerifyDocumentMissing = isset($verifyBankStatusesHash[$verifyBankStatusesArray['VerifyDocumentMissing']]);
        $DisplayBankNotVerified = isset($verifyBankStatusesHash[$verifyBankStatusesArray['bankNotVerified']]);
        $DisplayBankNotUpdated = isset($verifyBankStatusesHash[$verifyBankStatusesArray['bankNotUpdated']]);
        // dump($DisplayBankDetailsMissing, $DisplayVerifyDocumentMissing, $DisplayBankNotVerified, $DisplayBankNotUpdated);
        // die;
        if($DisplayBankNotUpdated){
            $votersObj->where(function ($query) use($last_campaign_id,
                $DisplayVerifyDocumentMissing, $DisplayBankNotVerified, $DisplayBankDetailsMissing)  {
                $query->where('validation_election_campaign_id', '!=', $last_campaign_id);
                if(!$DisplayBankNotVerified){
                    $query->where('bank_details.is_bank_verified', 1);
                } else {
                    $query->orWhere('bank_details.is_bank_verified', 0);
                }
                if(!$DisplayVerifyDocumentMissing){
                    $query->whereNotNull('bank_details.verify_bank_document_key');
                } else{
                    $query->orWhereNull('bank_details.verify_bank_document_key');
                }
                if(!$DisplayBankDetailsMissing){
                    $query->whereNotNull('bank_details.bank_account_number');
                }else{
                    $query->orWhereNull('bank_details.id')
                    ->orWhereNull('bank_details.bank_account_number');
                }
 
            });
        } else if($DisplayBankNotVerified){
            $votersObj->where(function ($query) use($DisplayVerifyDocumentMissing, $DisplayBankDetailsMissing)  {
                $query->where('bank_details.is_bank_verified', 0);
                if(!$DisplayVerifyDocumentMissing){
                    $query->whereNotNull('bank_details.verify_bank_document_key');
                } else {
                    $query->orWhereNull('bank_details.verify_bank_document_key');
                }
                if(!$DisplayBankDetailsMissing){
                    $query->whereNotNull('bank_details.bank_account_number');
                } else{
                    $query->orWhereNull('bank_details.id')->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if($DisplayVerifyDocumentMissing){
            $votersObj->where(function ($query) use( $DisplayBankDetailsMissing)  {
                $query->whereNull('bank_details.verify_bank_document_key');

                if(!$DisplayBankDetailsMissing){
                    $query->whereNotNull('bank_details.bank_account_number');
                }else{
                    $query->orWhereNull('bank_details.id')->orWhereNull('bank_details.bank_account_number');
                }
            });
        } else if($DisplayBankDetailsMissing){
            $votersObj->where(function ($query) use($last_campaign_id)  {
                $query->whereNull('bank_details.bank_account_number')
                    ->orWhereNull('bank_details.id');
                });
        }
    }


}
