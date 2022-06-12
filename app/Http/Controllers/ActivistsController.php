<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ElectionCampaigns;
use App\Models\GeographicFilterTemplates;
use App\Models\ElectionRolesGeographical;
use Illuminate\Support\Facades\DB;

class ActivistsController extends Controller {

    //DUPLICATES_REPORT_TYPES
    const IN_HEADQUARTERS = 'in_headquarters';
    const BETWEEN_HEADQUARTERS = 'between_headquarters';
    const ALL = 'all';

    /**
     * get activists duplicate roles according to their headquarters
     * 
     * optional requests:
     * ?report_type=all
     * ?report_type=in_headquarters&headquarter_key={00002}
     * ?report_type=between_headquarters
     * 
     */
    public function findDuplicates(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign['id'];
        $relventFields = ['voters.first_name', 'voters.last_name', 'voters.key'
            , 'voters.personal_identity', 'election_roles.name AS role_name', 'election_role_shifts.name AS shift_name'];

        if (!$this->isFindDuplicatesVariablesValid($request)) {
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }

        $reportType = $request->input('report_type');
        $result = [];

        if ($reportType == self::BETWEEN_HEADQUARTERS) {
            $rolesWithDuplicates = ElectionRolesGeographical::select('election_role_by_voter_id', DB::raw('COUNT(election_role_by_voter_geographic_areas.id) AS roles_count'))
                            ->withElectionRolesByVoters()
                            ->where('election_roles_by_voters.election_campaign_id', DB::raw($currentCampaignId))
                            ->groupBy('election_role_by_voter_id', 'entity_type', 'entity_id')
                            ->having('roles_count', '>', DB::raw(1))
                            ->pluck('election_role_by_voter_id')->all();

            $result = ElectionRolesGeographical::select($relventFields)
                    ->withElectionRolesByVoters()
                    ->withVoters()
                    ->withElectionRoles()
                    ->withElectionRoleShifts()
                    ->where([['election_roles.deleted', DB::raw(0)], ['election_roles_by_voters.election_campaign_id', DB::raw($currentCampaignId)]])
                    ->whereIn('election_role_by_voter_geographic_areas.election_role_by_voter_id', $rolesWithDuplicates)
                    ->orderBy('voters.personal_identity')
                    ->get();
        } else {
            $entityType = [];
            $entityId = [];

            if ($reportType == self::IN_HEADQUARTERS) {
                list($entityType, $entityId) = $this->getHeadquarterGeoEntities($request->input('headquarter_key'));
            }

            $basicQuery = ElectionRolesGeographical::select('voters.personal_identity', DB::raw('COUNT(election_role_by_voter_geographic_areas.id) AS roles_count'))
                    ->withElectionRolesByVoters()
                    ->withVoters()
                    ->where('election_roles_by_voters.election_campaign_id', DB::raw($currentCampaignId))
                    ->groupBy('voters.personal_identity')
                    ->having('roles_count', '>', DB::raw(1));

            if ($reportType == self::IN_HEADQUARTERS) {
                $basicQuery->whereIn('entity_type', $entityType)
                        ->whereIn('entity_id', $entityId);
            }

            $votersWithDuplicates = $basicQuery->pluck('personal_identity')->all();

            $query = ElectionRolesGeographical::select('voters.personal_identity')
                    ->withElectionRolesByVoters()
                    ->addSelect($relventFields)
                    ->withVoters()
                    ->withElectionRoles()
                    ->withElectionRoleShifts()
                    ->where([['election_roles.deleted', DB::raw(0)], ['election_roles_by_voters.election_campaign_id', DB::raw($currentCampaignId)]])
                    ->whereIn('voters.personal_identity', $votersWithDuplicates)
                    ->orderBy('voters.personal_identity');

            if ($reportType == self::IN_HEADQUARTERS) {
                $query->whereIn('entity_type', $entityType)
                        ->whereIn('entity_id', $entityId);
            }
            $result = $query->get();
        }
        $jsonOutput->setData($result);
    }

 
	/*
		Private helpful function that gets geoFilterTemplates with headquarters
	*/
    private function getHeadquarterGeoEntities($headquarterKey) {
        $releventGeoEntities = GeographicFilterTemplates::select('entity_type', 'entity_id')
                ->withHeadquarters()
                ->where('deleted', 0)
                ->where('headquarters.key', $headquarterKey)
                ->get();

        $typesArray = [];
        $idsArray = [];

        foreach ($releventGeoEntities as $row) {
            $typesArray[] = $row['entity_type'];
            $idsArray[] = $row['entity_id'];
        }

        $entityType = array_unique($typesArray);
        $entityId = array_unique($idsArray);
        return array($entityType, $entityId);
    }

	/*
		Private helpful function that returns if duplicate headquarter is valid
	*/
    private function isFindDuplicatesVariablesValid(Request $request) {
        if (!$request->has('report_type')) {
            return FALSE;
        }

        $reportType = $request->input('report_type');
        return ($reportType == self::ALL || $reportType == self::BETWEEN_HEADQUARTERS ||
                ($reportType == self::IN_HEADQUARTERS) && ($request->has('headquarter_key')));
    }


}
