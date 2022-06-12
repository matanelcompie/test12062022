<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\VoterPhone;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class VoterPhoneService
{
    //function check if phone exist and return the object
    //function can update the update_date and remove wrong 
    public static function checkIfExistNumberBeforeInsert($voter_id,$phone_number,$updateVerified=false){
        $phoneExist=VoterPhone::select()
        ->where('voter_id',$voter_id)
        ->where('phone_number',DB::raw($phone_number))
        ->orderBy('id','DESC')
        ->first();

        if(!$phoneExist)
        return false;

        if($updateVerified){
            $phoneExist->wrong=0;
            $phoneExist->verified=1;
            $phoneExist->deleted=0;
            $phoneExist->updated_at=date("Y-m-d H:i:s");
            
            $phoneExist->save();
        }

        return $phoneExist;
    }

    //check if voter has any phone that not deleted and wrong
    public static function checkVoterHasAnyPhone($voter_id){
        $phones=VoterPhone::select()
        ->where('voter_id',$voter_id)
        ->where('wrong',0)
        ->where('deleted',0)->first();

        if($phones)
        return true;
        return false;
    }
}