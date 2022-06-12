<?php

namespace App\Libraries;

use App\Enums\ModulesSystemName;
use App\Models\SupportStatus;
use App\Models\Country;
use App\Models\Ethnic;
use App\Models\ReligiousGroup;
use App\Models\VoterMetaValues;
use App\Models\City;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;
use App\Models\Modules;
use App\Models\RequestStatusType;
use App\Models\TeamUsers;
use App\Repositories\RequestStatusRepository;
use App\Repositories\RequestTopicsRepository;
use App\Repositories\RolesByUsersRepository;
use App\Repositories\TeamRepository;
use Illuminate\Support\Facades\DB;
use Log;

class ListFunctions
{
    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
    }
    static function support_status()
    {
        $supportStatus = SupportStatus::select('id as value', 'name as label', 'election_campaign_id')
                                            ->where('deleted', 0)
                                            ->where('active',1)
                                            ->orderBy('election_campaign_id', 'DESC')
                                            ->orderBy('level', 'DESC');//['deleted'=> 0,'active'=> 1]
        $noSupport = SupportStatus::select(DB::raw("-1 as value, 'ללא סטטוס' as label, -1 as election_campaign_id"))->limit(1);
        return $supportStatus->union($noSupport)->get();
    }

    static function countries()
    {
        return Country::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }

    static function ethnics()
    {
        return Ethnic::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }

    static function willingVolunteer()
    {
        $keySystemName="'willing_volunteer'";
        return self::meta($keySystemName);
    }

    static function agreeSign()
    {
        $keySystemName="'agree_sign'";
        return self::meta($keySystemName);
    }

    static function explanationMaterial()
    {
        $keySystemName="'explanation_material'";
        return self::meta($keySystemName);
    }

    static function meta($keySystemName)
    {
        return VoterMetaValues::select('voter_meta_values.id as value', 'voter_meta_values.value as label')
        ->join('voter_meta_keys', function ($join) use ($keySystemName) {
            $join->on([['voter_meta_values.voter_meta_key_id','=','voter_meta_keys.id'],['voter_meta_keys.key_system_name','=',DB::Raw($keySystemName)]]);
        })
        ->where('voter_meta_values.deleted', 0)
        ->orderBy('voter_meta_values.value', 'asc')
        ->get();
    }
    
    static function cities()
    {
        return City::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }

    static function streets($values = array()) {
        if (count($values)) {
            //model list dependency id
            $groupIds = isset($values['62'])? (array)$values['62'] : array();

            if ( count($groupIds) == 1) {
                return \App\Models\Streets::select('id as value', 'name as label')
                    ->where(['city_id' => $groupIds[0], 'deleted' => 0])
                    ->orderBy('name', 'asc')->get();
            } else {
                return array();
            }
        } else {
            return array();
        }
    }

    static function strictly_orthodox() {
        return [
            ['value' => 0, 'label' => 'לא'],
            ['value' => 1, 'label' => 'כן'],
            ['value' => -1, 'label' => 'לא ידוע']
        ];
    }

    static function appointment_letter() {
        return [
            ['value' => 0, 'label' => 'לא'],
            ['value' => 1, 'label' => 'כן']
        ];
    }

    static function instructed() {
        return [
            ['value' => 0, 'label' => 'לא'],
            ['value' => 1, 'label' => 'כן']
        ];
    }

    static function cluster($cityId = array(), $electionCampaign = false)
    {
		$fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
        if (count($cityId)) {
            $query=Cluster::select('clusters.id as value',DB::raw($fullClusterNameQuery.' as label'))
            ->whereIn('city_id', $cityId);
            
            if ($electionCampaign) {
                $query->where('clusters.election_campaign_id', $electionCampaign);
            }

            if (count($cityId)==1) {
                return $query->orderBy('name', 'asc')->get();
            }

            $result=$query->join('cities', function ($join) {
                $join->on('cities.id', '=', 'clusters.city_id');
            })->addSelect('cities.name AS city_name')->orderBy('clusters.name', 'asc')->get();

            $data=[];
            foreach ($result as $row) {
                $data[]=array('label' =>$row['city_name'].' > '.$row['label'],'value' =>$row['value'] );
            }
            return $data;
        } else {
            return array();
        }
    }
    
    static function ballotBox($clusterIds = array())
    {
		$fullClusterNameQuery = Cluster::getClusterFullNameQuery('',true);
        if (count($clusterIds)) {
            $query=ballotBox::select('ballot_boxes.id as value', 'ballot_boxes.mi_id as label')
            ->whereIn('cluster_id', $clusterIds);

            if (count($clusterIds)==1) {
                return $query->orderBy('mi_id', 'asc')->get();
            }

            $result=$query->join('clusters', function ($join) {
                $join->on('clusters.id', '=', 'ballot_boxes.cluster_id');
            })->addSelect(DB::raw($fullClusterNameQuery.' AS cluster_name'))->orderBy('mi_id', 'asc')->get();

            $data=[];
            foreach ($result as $row) {
                $data[]=array('label' =>$row['cluster_name'].' > '.$row['label'],'value' =>$row['value'] );
            }
            return $data;
        } else {
            return array();
        }
    }

	static function voterGroups()
    {
        //check and get saved voter groups from helper singleton
        $helperSingleton = app()->make("helperSingleton");
        $voterGroups = $helperSingleton->getVoterGroupsList();
        //if no saved voter groups calculate voter groups and save to singleton
        if ($voterGroups == null) {
            $voterGroups = \App\Models\VoterGroups::select('id', 'id as value', 'name as label' , 'permission_type' , 'parent_id')
                ->with(['voterGroupPermissions'=>function($query){
                    $query->select('id' , 'voter_group_id' , 'team_id' , 'user_id', 'entity_type' , 'entity_id');
                }])
                ->where('deleted', 0)->orderBy('name', 'asc')->get();
            
            $currentGroupsHash = [];
            foreach($voterGroups as $item){
                $currentGroupsHash[$item->value] = ["name"=>$item->label , "parent_id"=>$item->parent_id];  
            }
            foreach($voterGroups as $item){
                $parentID = $item->parent_id;
                while($parentID){
                    $parentItem = $currentGroupsHash[$parentID];
                    $item->label .= ">>".$parentItem["name"];
                    $parentID = $parentItem["parent_id"];
                }
                $item->label = array_reverse(explode(">>" , $item->label));
                $item->label = implode(" >> " , $item->label);
            }		
            
            $voterGroups = \App\Http\Controllers\GlobalController::FilterVoterGroupsByPermissions($voterGroups); // filter groups by permissions

            $voterGroups = (is_array($voterGroups))? $voterGroups : $voterGroups->toArray();
            $label = array_column($voterGroups, 'label');
            
            array_multisort($label, SORT_ASC, $voterGroups);
            //save voter groups to singleton
            $helperSingleton->setVoterGroupsList($voterGroups);
        }
		return $voterGroups;
	}
    static function instituteGroups()
    {
        return \App\Models\InstituteGroup::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
    static function instituteNetworks()
    {
        return \App\Models\InstituteNetwork::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
    static function instituteTypes($values = array())
    {
        if (count($values)) {
            //model list dependency id
            $groupIds=isset($values['41'])? (array)$values['41'] : array();

            if (count($groupIds)) {
                return \App\Models\InstituteTypes::select('id as value', 'name as label')
                ->where('deleted', 0)
                ->whereIn('institute_group_id', $groupIds)
                ->orderBy('name', 'asc')->get();
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    static function instituteRoles($values = array())
    {
        if (count($values)) {
            //model list dependency id
            $typeIds=isset($values['42'])? (array)$values['42'] : array();
            if (count($typeIds)) {
                return \App\Models\InstituteRole::select('id as value', 'name as label')
                ->where('deleted', 0)
                ->whereIn('institute_type_id', $typeIds)
                ->orderBy('name', 'asc')->get();
            } else {
                return array();
            }
        } else {
            return array();
        }
    }
    static function institutes($values = array())
    {
        $query= \App\Models\Institutes::select('id as value', 'name as label')->where('deleted', 0);
        if (count($values)) {
            //model list dependency id
            $typeIds=isset($values['42'])? (array)$values['42'] : array();
            $networkIds=isset($values['43'])? (array)$values['43'] : array();
            $cityIds=isset($values['44'])? (array)$values['44'] : array();

            if (count($typeIds)) {
                $query->whereIn('institute_type_id', $typeIds);
            }

            if (count($networkIds)) {
                $query->whereIn('institute_network_id', $networkIds);
            }

            if (count($cityIds)) {
                $query->whereIn('city_id', $cityIds);
            }
                
        }
        return $query->orderBy('name', 'asc')->get();
    }
        
    static function userRoles()
    {
        return \App\Models\UserRoles::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
        
    static function teams()
    {
        return \App\Models\Teams::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
        
    static function electionRoles()
    {
        return \App\Models\ElectionRoles::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
        
    static function electionRoleShifts()
    {
        return \App\Models\ElectionRoleShifts::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
        
    static function fiftyMinisters($values = array(), $electionCampaign = null){
          $fiftyMinisters = [];
        if (count($values)) {
        //model list dependency id
        //$exist_minister_of_fifty=isset($values['12'])? (bool)$values['12'] : false;
           if(!$electionCampaign){$electionCampaign=ElectionCampaigns::currentCampaign()->id; }
           $fiftyMinisters= \App\Models\Voters::select('voters.id as value', DB::raw("CONCAT(voters.first_name,' ', voters.last_name) AS label"))
            ->join('election_roles_by_voters', function ($join) use ($electionCampaign) {
                $join->on('election_roles_by_voters.voter_id', '=', 'voters.id')
                ->on('election_roles_by_voters.election_campaign_id', '=', DB::raw($electionCampaign));
            })->join('election_roles', function ($join) {
                $join->on('election_roles_by_voters.election_role_id', '=', 'election_roles.id')
                ->on('election_roles.system_name', '=', DB::raw("'captain_of_fifty'"));
            })->orderBy('name', 'asc')->get();
        }
        return $fiftyMinisters;
    }
	
	static function municipalRoleTypes(){
		$municipalRoles = [];
		array_push($municipalRoles , ["value" => config('constants.filter_by.shas_representatives.municipal_role_options.COUNCIL_MEMBER') , "label" => "חבר מועצה"]);
		array_push($municipalRoles , ["value" => config('constants.filter_by.shas_representatives.municipal_role_options.DEPUTY_MAYOR')  , "label" => "סגן ראש עיר"]);
		array_push($municipalRoles , ["value" => config('constants.filter_by.shas_representatives.municipal_role_options.MAYOR') , "label" => "ראש עיר"]);
		return $municipalRoles;
	}
	
	static function religeousCouncilRoles()
    {
        return \App\Models\ReligiousCouncilRoles::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
	
	static function cityShasRoles()
    {
        return \App\Models\CityShasRoles::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc')->get();
    }
	
	static function tmCallEndStatuses()
    {
        $statusesList= [
					['value'=>config('tmConstants.call.status.UNANSWERED') , 'label'=>'אין מענה'] ,
					['value'=>config('tmConstants.call.status.SUCCESS') , 'label'=>'בוצעה בהצלחה'] , 
					['value'=>config('tmConstants.call.status.GOT_MARRIED') , 'label'=>'התחתן'] ,
					['value'=>config('tmConstants.call.status.GET_BACK') , 'label'=>'חזור אליי'] , 
					['value'=>config('tmConstants.call.status.WRONG_NUMBER') , 'label'=>'טעות במספר'] ,
					['value'=>config('tmConstants.call.status.NON_COOPERATIVE') , 'label'=>'לא משת"פ'] ,
					['value'=>config('tmConstants.call.status.DISCONNECTED_NUMBER') , 'label'=>'מספר מנותק'] ,
					['value'=>config('tmConstants.call.status.ANSWERING_MACHINE') , 'label'=>'משיבון'] ,
					['value'=>config('tmConstants.call.status.CHANGED_ADDRESS') , 'label'=>'עבר דירה'] , 
					['value'=>config('tmConstants.call.status.BUSY') , 'label'=>'עסוק'] ,
					['value'=>config('tmConstants.call.status.LANGUAGE') , 'label'=>'קושי שפה'] , 
					['value'=>config('tmConstants.call.status.FAX_TONE') , 'label'=>'צליל פקס'] , 
					['value'=>config('tmConstants.call.status.HANGED_UP') , 'label'=>'שיחה נותקה'] 	 
				];
		return $statusesList;
    }

    static function religiousGroups()
    {
        $religiousGroup = ReligiousGroup::select('id as value', 'name as label')->where('deleted', 0)->orderBy('name', 'asc');
        $noReligiousGroup = ReligiousGroup::select(DB::raw("-1 as value, 'ללא זרם' as label"))->limit(1);
        return $religiousGroup->union($noReligiousGroup)->get();
    }

    static function requestTopic()
    {
        return RequestTopicsRepository::getAllParentTopics([
            DB::raw('name as label'),
            DB::raw('id as value')
        ]);
    }

    static function requestSubTopic($values = array())
    {
        return RequestTopicsRepository::getAllSubTopicsByArrParentId($values, [
            DB::raw('name as label'),
            DB::raw('id as value')
        ]);
    }

    static function requestStatuses()
    {
        return RequestStatusRepository::getAll(
            [
                DB::raw('name as label'),
                DB::raw('id as value')
            ]
        );
    }

    static function requestTeam()
    {
        return TeamRepository::getAll(
            [
                DB::raw('name as label'),
                DB::raw('id as value')
            ]
        );
    }

    static function requestUserTeam($teamId = null)
    {
        return RolesByUsersRepository::getUsersByRoles($teamId, ModulesSystemName::REQUEST, false, [
            DB::raw("concat(voters.last_name,' ',voters.first_name) as label"),
            DB::raw('users.id as value')
        ]);
    }

    static function requestStatusType()
    {
        return RequestStatusType::select(
            DB::raw('name as label'),
            DB::raw('id as value')
        )->get();
    } 
    
}
