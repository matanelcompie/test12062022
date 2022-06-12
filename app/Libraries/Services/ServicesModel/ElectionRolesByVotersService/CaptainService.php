<?php

namespace App\Libraries\Services\ServicesModel\ElectionRolesByVotersService;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\municipal\MunicipalElectionsRolesService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\ServicesModel\GeographicFiltersService;
use App\Libraries\Services\ServicesModel\RoleByUserService;
use App\Libraries\Services\ServicesModel\UserService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\UserRoles;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\RolesByUsersRepository;
use App\Repositories\UserRepository;
use DateInterval;
use DateTime;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class CaptainService
{

     //function add captain and phone by excel file with captain tz and phone
    //excel A-col=captain tz
    //excel B-col=phone of captain

    public static function LoadCaptainFiftyFromCSV($csvLocation,$city,$cluster,$election_campaign_id,$user) {
		$jsonOutput = app()->make("JsonOutput");
		$role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
      
		//load list captain from csv
		$allCaptain=self::getListCaptainFromCSV($csvLocation);
		

    }


	//function get name if csv and return object
	// key-tz of captain
	//value-object captain that include tz and phone
	public static function getListCaptainFromCSV($csvLocation){

		$AllCaptain=array();
		$captainTzCSV = storage_path('\\app\\'.$csvLocation);//."\\".$csvLocation;
		$originalFile = fopen($captainTzCSV, 'r');
		$i = 0;
		$j = 0;

		while ( ($fileData = fgetcsv($originalFile)) !== false ) {
			$tz=preg_replace('/\s+/', '', $fileData[0]);
			$personal_identity=Helper::trimStartZero($tz);//tz captain
			$phone=$fileData[1];//phone

		$captain=new stdClass();

		$captain->personal_identity=$personal_identity;
		$captain->phone=$phone;

		$AllCaptain[$personal_identity]=$captain;	
			//Log::info($fileData[0]);
        }

        fclose($originalFile);	
	return $AllCaptain;
	}



    //check if exsist activist allocate for voter captain
	public static function isExistActivistAllocateCaptainByVoterRole($election_campaign_id,$electionRoleVoter,$cluster_id,$city_id){
		$role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
		$exist=ActivistsAllocations::select()
		->where('election_campaign_id',$election_campaign_id)
		->where('deleted',DB::raw(0))
		->where('cluster_id',$cluster_id)
		->where('election_role_id',$role_id)
		->where('election_role_by_voter_id',$electionRoleVoter)
		->where('city_id',$city_id)
		->first();

		if($exist)
		return $exist;

		return false;
	}


	public static function addUserAndUserRoleCaptain($voterId, $electionRoleByVoter, $userCreate = null)
	{
		$systemUserRole = config('constants.activists.election_role_system_names.ministerOfFifty');
		$userRoleObj = UserRoles::select()->where('system_name', $systemUserRole)->first();
		$activistUser = UserRepository::getOrCreate($voterId, $userCreate);
		$roleByUser = RolesByUsersRepository::getOrCreateUserRoleByUser(
			$userRoleObj->id,
			$activistUser->id
		); //role by user

		$entityType = config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY');
		$entityId = $electionRoleByVoter->assigned_city_id;

		GeographicFiltersService::addGeographicFiltersService($activistUser->id, $userRoleObj, $roleByUser->id, $entityType, $entityId);
	}
}