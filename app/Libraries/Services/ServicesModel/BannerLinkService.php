<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\Banner;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class BannerLinkService
{
        public static function getBannerLinksByName($name){
            $bannerObject=Banner::select()->where('name',$name)->first();
            if($bannerObject)
            return $bannerObject->link;
            else
            return null;
        }
}