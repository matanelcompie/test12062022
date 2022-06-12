<?php

namespace App\Http\Requests;

use App\DTO\SearchActivistDto;
use App\Enums\SendMessageType;
use App\Libraries\Helper;
use App\Libraries\Services\ServicesModel\ElectionCampaignsService;
use App\Models\ElectionCampaigns;
use App\Repositories\CityRepository;
use App\Repositories\ElectionCampaignRepository;
use App\Repositories\ElectionRolesRepository;
use App\Repositories\VotersRepository;
use Illuminate\Http\Request;

class SearchActivistRequest
{
    /**
     * @var SearchActivistDto
     */
    public $searchActivist;

    /**
     * @throws \Exception
     */
    public function __construct(Request $request, $cityId = null)
    {
        $this->createSearchActivistDto($request, $cityId);
    }

    /**
     * @param Request $request
     * @param string $cityKey
     * @throws \Exception
     */
    private function createSearchActivistDto(Request $request, $cityId = null)
    {
        $searchActivist = new SearchActivistDto();

        $personalIdentity = $request->input('personal_identity');
        if (!is_null($personalIdentity)) {
            $personalIdentity = Helper::trimStartZero($personalIdentity);
            $searchActivist->voter = VotersRepository::getVoterByPersonalIdentity($personalIdentity);
        }

        if (!is_null($request->input('election_role_system_name'))) {
            $searchActivist->electionRole = ElectionRolesRepository::getBySystemName($request->input('election_role_system_name'));
        }

        if (!is_null($cityId))
            $searchActivist->city = CityRepository::getById($cityId);

        if (!is_null($request->input('election_campaign_id')))
        $searchActivist->electionCampaign = ElectionCampaignRepository::getElectionById($request->input('election_campaign_id'));
        else
            $searchActivist->electionCampaign = ElectionCampaigns::currentCampaign();
        $this->searchActivist = $searchActivist;
    }
}
