<?php

namespace App\Libraries\Services\JobServices;

use App\Libraries\Services\VoterDetailsService;
use App\Models\AreasGroup;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\SupportStatus;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HouseHoldUpdateService
{

    protected $currentElectionCampaign;

    public function __construct()
    {
        $this->currentElectionCampaign = ElectionCampaigns::currentCampaign();
    }
        //function update all voter household in election campaign
        public function updateHouseHoldAllVoter(){
            
            $arrVoterUpdate=array();
            $maxVoterId=Voters::max('id');
            $IndexVoterId=-1;

            do{

            $voters=Voters::select(DB::raw('voters.*'))->withVoterInElectionCampaigns()->where('voters.id','>',$IndexVoterId)->where('household_update',0)->where('election_campaign_id',$this->currentElectionCampaign->id)->orderBy('voters.id')->limit(10)->get();//->get();
          
            foreach ($voters as $key => $voter) {
              
                $IndexVoterId=$voter->id;
                //arr of id voter in the same house hold
                $arrVoterHouse=[$voter->id];
                //check if voter is update house hold when voter in the same house hold updated
                if(!array_key_exists ($voter->id,$arrVoterUpdate)){

                    $maxHouseHold=Voters::max('household_id')+1;

                    $arrVoterUpdate[$voter->id]=array('new'=>$maxHouseHold,'old'=>$voter->household_id);

                    $det=self::getHashDetailsHouseHoldByVoter($voter);
                    $query=Voters::select(DB::raw('voters.*'))->withVoterInElectionCampaigns()->where('election_campaign_id',$this->currentElectionCampaign->id)
                    ->where('voters.id', '!=', $voter->id)->where('last_name',$voter->last_name)->where('household_update',0);

                     //select All Voter by last name and address
                    
                     $query->where(function($query)use($det){
                        $query->where('actual_address_correct',1)
                              ->where('city_id',$det['city_id'])
                              ->where('street_id',$det['street_id'])
                              //->where(function($query)use($det){$query->where('city_id',$det['city_id'])->orWhere('city',$det['city']);})
                              //->where(function($query)use($det){$query->where('street_id',$det['street_id'])->orWhere('street',$det['street']);})
                              ->where('house',$det['house'])
                              ->where('flat',$det['flat']);

                    })->orWhere(function($query)use($det){
                        $query ->where(function($query)use($det){$query->whereNull('actual_address_correct')->orWhere('actual_address_correct',0);})
                        ->where('mi_city_id',$det['city_id'])
                        ->where('mi_street_id',$det['street_id'])
                              //->where(function($query)use($det){$query->where('mi_city_id',$det['city_id'])->orWhere('mi_city',$det['city']);})
                              //->where(function($query)use($det){$query->where('mi_street_id',$det['street_id'])->orWhere('mi_street',$det['street']);})
                              ->where('mi_house',$det['house'])
                              ->where('mi_flat',$det['flat']);
                    });

                    $houseHoldVoters=$query;//->get();
                    // Log::info($query->toSql());
                    // return;
                    if($houseHoldVoters){
                        foreach ($houseHoldVoters as $key => $voterHouse) {
                           if(!array_key_exists ($voterHouse->id,$arrVoterUpdate)){
                            $arrVoterHouse[]=$voterHouse->id;
                            $arrVoterUpdate[$voterHouse->id]=array('new'=>$maxHouseHold,'old'=>$voterHouse->household_id);
                           }
                        }
                    }

                    Log::info('------------------------------------');
                    Log::info(json_encode($arrVoterHouse));
                    Voters::whereIn('id',$arrVoterHouse)->update(['household_id'=>$maxHouseHold,'household_update'=>1]);
                }
            }
        } while($IndexVoterId<$maxVoterId);
        }


        private static function getHashDetailsHouseHoldByVoter($voter){
            $detailsVoterHouse=array();
            $detailsVoterHouse['last_name']=$voter->last_name;
                     //check if address correct -find voter by address correct
                     if(!is_null($voter->actual_address_correct) && $voter->actual_address_correct==1){
                        $detailsVoterHouse['city_id']=$voter->city_id;
                        $detailsVoterHouse['city']=$voter->city;
                        // $detailsVoterHouse['neighborhood']=$voter->neighborhood;
                        $detailsVoterHouse['street']=$voter->street;
                        $detailsVoterHouse['street_id']=$voter->street_id;
                        $detailsVoterHouse['house']=$voter->house;
                        // $detailsVoterHouse['house_entry']=$voter->house_entry;
                        $detailsVoterHouse['flat']=$voter->flat;                        
                     }
                     else
                     {
                        $detailsVoterHouse['city_id']=$voter->mi_city_id;
                        $detailsVoterHouse['city']=$voter->mi_city;
                        // $detailsVoterHouse['neighborhood']=$voter->mi_neighborhood;
                        $detailsVoterHouse['street']=$voter->mi_street;
                        $detailsVoterHouse['street_id']=$voter->mi_street_id;
                        $detailsVoterHouse['house']=$voter->mi_house;
                        // $detailsVoterHouse['house_entry']=$voter->mi_house_entry;
                        $detailsVoterHouse['flat']=$voter->mi_flat;   

                     }

                    return $voter;
        }

        
        //func get arr ov object the key is voter id and the value is field old-value of old household and new-value of new household
        //function insert to history the changes
        private static function saveHistoryUpdate($arrUpdateVoter){
            foreach ($arrUpdateVoter as $key => $voterUpdate) {
             
            }
        }

        private function resetUpdateVoter(){

            $oldRecords=Voters::withElectionCampaigns()->where('election_campaign_id',$this->currentElectionCampaign->id)->orderBy('id')->update(['household_update'=>0]);

            return $oldRecords;
        }
}