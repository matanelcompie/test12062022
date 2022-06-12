<?php

namespace App\Libraries\Services\system;

use App\Libraries\Services\ServicesModel\ElectionCampaignsService;
use App\Models\BallotBoxRole;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;

class ListsService {

    /************* Activists lists ***************/

    public static function getAllElectionRoles()
    {
        $resultArray = ElectionRoles::select(['id', 'name', 'key', 'system_name', 'budget'])->where('deleted', 0)->get();
        return $resultArray;
    }

    public static function getAllElectionCampaigns()
    {

            return ElectionCampaignsService::getListAllElectionCampaign();
    }
	public static function getBallotBoxRoles(){
        $resultArray = BallotBoxRole::select('id' , 'name' , 'key', 'type', 'system_name')->where('deleted' , 0)->get();
        return $resultArray;

    }
}