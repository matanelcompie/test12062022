<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\GeographicFilters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class GeographicFiltersService
{

    //add new GeographicFilters
    //function get user id ,object table user role and id of role voter of user, type and value type
    //function check if exit before insert and return object
    public static function addGeographicFiltersService($user_id,$userRole,$role_by_user_id,$entityType,$entityId){

        $record=GeographicFilters::select()
        ->where('user_id',$user_id)
        ->where('role_by_user_id',$role_by_user_id)
        ->where('entity_type',$entityType)
        ->where('entity_id',$entityId)->first();

        if(!$record){
                    // Add user role geo filter
           $newGeoFilter = new GeographicFilters();
           $newGeoFilter->name = "שיבוץ תפקיד - $userRole->name";
           $newGeoFilter->user_id = $user_id;
           $newGeoFilter->role_by_user_id = $role_by_user_id;
           $newGeoFilter->entity_type = $entityType;
           $newGeoFilter->entity_id = $entityId;
           $newGeoFilter->inherited_id = null;
           $newGeoFilter->key = Helper::getNewTableKey('geographic_filters', 10);
           $newGeoFilter->save();
       
           return $newGeoFilter ;
        }
        return $record;
    }    
}