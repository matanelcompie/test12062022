<?php

namespace App\Libraries;
use Illuminate\Support\Facades\DB;
use App\Models\VoterGroups;

class ListSelectedValuesFunctions  {
    public static function getAllSubGroups($groupSelected){
        $voterGroupHash = [];
        $voterGroupValues = [];
        $voterGroups = VoterGroups::select('id', 'parent_id', 'name')->where('deleted','0')->get();
        foreach($voterGroups as $group){
            $parentId = $group->parent_id;
            if(empty($voterGroupHash[$parentId])){
                $voterGroupHash[$parentId] = array();
            }
            array_push($voterGroupHash[$parentId], $group->id);
        }
        foreach($groupSelected as $groupId){
            self::getGroupChilds($voterGroupHash, $groupId, $voterGroupValues);
        }
        return array_values($voterGroupValues);
        // dd($voterGroupHash,$voterGroupValues, array_values($voterGroupValues));
   }
   private static function getGroupChilds($voterGroupHash, $groupId, &$voterGroupValues){
    $voterGroupValues[$groupId] = (int) $groupId;

    $currentGroupChilds = isset($voterGroupHash[$groupId]) ? $voterGroupHash[$groupId] : [];
    if(count($currentGroupChilds) > 0){
        // dump($groupId,count($currentGroupChilds));
        foreach($currentGroupChilds as $groupId){
            self::getGroupChilds($voterGroupHash, $groupId, $voterGroupValues);
        }
    }
   }
   
   public static function filterByMunicipalRoles($query,$selectedValues ){
		$voterIDS = [];
		foreach($selectedValues as $value){
			$query = [];
			switch($value){
				case config('constants.filter_by.shas_representatives.municipal_role_options.MAYOR'):
					$query = \App\Models\CityRolesByVoters::select('voter_id')->where('deleted',0)->where('role_type',0)->get();
					break;
				case config('constants.filter_by.shas_representatives.municipal_role_options.DEPUTY_MAYOR'):
					$query = \App\Models\CityRolesByVoters::select('voter_id')->where('deleted',0)->where('role_type' , '<>',0)->get();
					break;
				case config('constants.filter_by.shas_representatives.municipal_role_options.COUNCIL_MEMBER'):
					$query = \App\Models\CityCouncilMembers::select('voter_id')->where('deleted',0)->get();
					break;
			}
			for($i = 0 ; $i<sizeof($query) ; $i++){
				if(!in_array($query[$i]->voter_id , $voterIDS)  ){
					array_push($voterIDS,$query[$i]->voter_id);
				}
			} 
		}
		return $voterIDS;
   }
   
   public static function filterByCouncilReligeousRole($query,$selectedValues ){
	   $voterIDS = [];
	   $query = \App\Models\ReligiousCouncilMembers::select('voter_id')->where('deleted',0)->get();
	   for($i = 0 ; $i<sizeof($query) ; $i++){
			if(!in_array($query[$i]->voter_id , $voterIDS)  ){
					array_push($voterIDS,$query[$i]->voter_id);
			}
	   } 
	   return $voterIDS;
   }
   
   public static function filterByCityShasRoles($query,$selectedValues ){
	   $voterIDS = [];
	   $query = \App\Models\CityShasRolesByVoters::select('voter_id')->where('deleted',0)->get();
	   for($i = 0 ; $i<sizeof($query) ; $i++){
			if(!in_array($query[$i]->voter_id , $voterIDS)  ){
					array_push($voterIDS,$query[$i]->voter_id);
			}
	   } 
	   return $voterIDS;
   }
   
   public static function filterByTmCallEndStatuses(&$query,$selectedValues , $extraDataObj ){
	   if(!is_array($selectedValues)){
			$selectedValues = $selectedValues->toArray();
	   }
		if(!empty($selectedValues)){
			$selectedValuesArr = implode("," , $selectedValues);
			$queryStatement = " voters.id in (select voter_id from finished_voters_in_campaign as  finished_voters where voter_id=finished_voters.voter_id and finished_voters.status in (" . trim ( $selectedValuesArr, ',').")";
			if($extraDataObj && isset($extraDataObj['tm_campaign_id']) && $extraDataObj['tm_campaign_id']!=0){
				$queryStatement = $queryStatement.' and finished_voters.campaign_id = ' . $extraDataObj['tm_campaign_id'];
			}
			$queryStatement = "$queryStatement)";
			$query->whereRaw($queryStatement);
		}
	   return $query;

   }

}
