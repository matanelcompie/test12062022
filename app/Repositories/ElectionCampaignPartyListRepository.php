<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\activists\searchActivistService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\ServicesModel\ELectionCampaignPartyListsService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\ActivistPaymentModels\PaymentGroup;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use stdClass;

class ElectionCampaignPartyListRepository
{
    public static function getByCityIdAndElectionCampaign($cityId, $electionCampaignId)
    {
        return ElectionCampaignPartyLists::select()
            ->where('election_campaign_id', $electionCampaignId)
            ->where('city_id', $cityId)
            ->where('deleted', DB::raw(0))
            ->orderBy('shas', 'DESC')
            ->get();
    }

    public static function getListByElectionCampaignId($electionCampaignId)
    {
        return ElectionCampaignPartyLists::select()
            ->where('election_campaign_id', $electionCampaignId)
            ->where('deleted', DB::raw(0))
            ->orderBy('shas', 'DESC')
            ->get();
    }

    public static function insert($electionCampaignId, City $city = null, $letters, $name = null)
    {
        $electionParty = self::getByDetails($electionCampaignId, $city, $letters);
        if (!$electionParty) {
            $electionParty = new ElectionCampaignPartyLists();
            $electionParty->key = Helper::getNewTableKey('election_campaign_party_lists', 5);
            $electionParty->election_campaign_id = $electionCampaignId;
            $electionParty->city_id = $city ? $city->id : null;
            if (strlen($letters) > 10)
                throw new Exception(config('errors.elections.INVALID_LENGTH_PARTY_LETTER'));
            $electionParty->letters = $letters;
            
            if ($electionParty->letters == 'שס')
            $electionParty->shas = 1;

            $electionParty->name = $name;
            $electionParty->save();
        }

        return $electionParty;
    }

    /**
     *
     * @param int $electionCampaignId
     * @param City|null $city
     * @param string $letters
     * @return ElectionCampaignPartyLists
     */
    public static function getByDetails($electionCampaignId, City $city = null, $letters)
    {
        $electionParty = ElectionCampaignPartyLists::select()
            ->where('election_campaign_id', $electionCampaignId)
            ->where('letters', $letters);

        if ($city)
            $electionParty->where('city_id', $city->id);

        $electionParty = $electionParty->first();
        return $electionParty;
    }
}
