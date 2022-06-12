<?php

namespace App\Http\Controllers\cityActivistMobile;


use Session;

use Carbon\Carbon;
use App\Libraries\Helper;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Libraries\Services\ActivistApi\ActivitiesCityMobileServices;
use App\Libraries\Services\ActivistApi\MobileAppInformationService;
use App\Libraries\Services\ServicesModel\BallotBoxService;
use App\Libraries\Services\ServicesModel\BannerLinkService;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\ServicesModel\ElectionRolesByVotersService\ElectionRoleByVoterService;
use App\Libraries\Services\ServicesModel\ElectionRoleVoterGeoAreasService;
use App\Libraries\Services\ServicesModel\VoterInElectionCampaignService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use DateTime;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use stdClass;

class cityActivistMobileController
{

    protected $currentElectionCampaign;

    public function __construct()
    {
        $this->currentElectionCampaign = ElectionCampaigns::currentCampaign();
    }



    public function getVoterDetailsByVoterKeyCaptain50(Request $request, $voter_key = null)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $cond = [
                ['voters_with_captains_of_fifty.captain_id', Auth::user()->voter_id],
                ['voters_with_captains_of_fifty.election_campaign_id', $this->currentElectionCampaign->id]
            ];
            $voterDetails = ActivitiesCityMobileServices::getVoterDetailsByVoterKey($voter_key, true, $cond);
            $jsonOutput->setData($voterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    public function getVoterDetailsByVoterKeyClusterVoter(Request $request, $voter_key = null)
    {
        try {
            $jsonOutput = app()->make("JsonOutput");
            $cond = [
                ['voters_with_captains_of_fifty.captain_id', Auth::user()->voter_id],
                ['voters_with_captains_of_fifty.election_campaign_id', $this->currentElectionCampaign->id]
            ];
            $voterDetails = ActivitiesCityMobileServices::getVoterDetailsByVoterKey($voter_key, true, $cond);
            $jsonOutput->setData($voterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }



    public function setVoterDetails(Request $request)
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $voterDetails = ActivitiesCityMobileServices::setVoterDetails($object, $role_id, Auth::user()->voter_id);
            $jsonOutput->setData(json_encode($voterDetails));
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function setVoterDetailsByCaptionFifty(Request $request)
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $voterDetails = ActivitiesCityMobileServices::setVoterDetails($object, $role_id, Auth::user()->voter_id);
            $jsonOutput->setData($voterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function setVoterDetailsByCluster(Request $request)
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));
        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $voterDetails = ActivitiesCityMobileServices::setVoterDetails($object, $role_id, Auth::user()->voter_id);
            $jsonOutput->setData($voterDetails);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    // config('constants.activists.election_role_system_names.ministerOfFifty')

    public function getAllVoterByUserCaptain(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $object = (object)($request->all());
        //get voter of captain fifty by tz
        if (isset($object->personal_id_number)) {
            //remove start zero of personal tz
            $object->personal_id_number=Helper::trimStartZero($object->personal_id_number);

            $voterDetails = ActivitiesCityMobileServices::getAllVoterByUserCaptain($this->currentElectionCampaign->id, $object->personal_id_number);
            if (count($voterDetails) == 0) {
                $jsonOutput->setErrorCode(config('errors.elections.ERROR_TZ_OR_NOT_CONNECT_TO_CAPTAIN'));
                return;
            }

        } else
            $voterDetails = ActivitiesCityMobileServices::getAllVoterByUserCaptain($this->currentElectionCampaign->id);

        $jsonOutput->setData($voterDetails);
    }

    public function getAllFinalVoterSupportByUserCaptain(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        // $object = (object)($request->all());
        // if (isset($object->personal_id_number)) {
        //     $voterDetails = ActivitiesCityMobileServices::getAllVoterByUserCaptain($this->currentElectionCampaign->id, $object->personal_id_number);
        //     if (count($voterDetails) == 0) {
        //         $jsonOutput->setErrorCode(config('errors.elections.ERROR_TZ_OR_NOT_CONNECT_TO_CAPTAIN'));
        //         return;
        //     }
        // } else
        $voterDetails = ActivitiesCityMobileServices::getAllVoterByUserCaptain($this->currentElectionCampaign->id, null, true);

        $jsonOutput->setData($voterDetails);
    }


    public function getAllVoterByUserCluster(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        $object = (object)($request->all());

        //get voter in cluster by ballot box mi id
        if (isset($object->ballot_mi_id)) {
            $voterActivistId = Auth::user()->voter_id;
            $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id);
            $ballot_box_Number = BallotBox::resetLogicMiBallotBox($object->ballot_mi_id); //remove logic ballot box number
            $ballotBoxObj = BallotBox::getBallotBoxIdByMi_id_ClusterId($ballot_box_Number, $arrClusters, true); //search id of ballot box number
            $ballotBoxId = $ballotBoxObj->id;

            $voterDetails = ActivitiesCityMobileServices::getAllVoterByClusterVoterId($this->currentElectionCampaign->id, null, false, $ballotBoxId);
        } else
        //get voter in cluster by personal tz
        if (isset($object->personal_id_number)) {
           
            //remove start zero of personal tz
            $object->personal_id_number=Helper::trimStartZero($object->personal_id_number);

            $voterDetails = ActivitiesCityMobileServices::getAllVoterByClusterVoterId($this->currentElectionCampaign->id, $object->personal_id_number);
            if (count($voterDetails) == 0) {
                $jsonOutput->setErrorCode(config('errors.elections.ERROR_TZ_OR_NOT_CONNECT_TO_CAPTAIN'));
                return;
            }
        } else //get all voter in cluster
        {
           // $voterActivistId = Auth::user()->voter_id;
          //  $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id);
          //, $arrClusters
            $voterDetails = ActivitiesCityMobileServices::getListVotersForClusterBySpecificCondition($this->currentElectionCampaign->id);
        }
        
            //$voterDetails = ActivitiesCityMobileServices::getAllVoterByClusterVoterId($this->currentElectionCampaign->id,false,false,false,true);

        $jsonOutput->setData($voterDetails);
    }

    //function return list of voter details that final support in cluster
    public function getAllFinalVoterSupportByUserCluster(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        //$object = (object)($request->all());

        // if (isset($object->personal_id_number)) {
        //     $voterDetails = ActivitiesCityMobileServices::getAllVoterByClusterVoterId($this->currentElectionCampaign->id, $object->personal_id_number);
        //     if (count($voterDetails) == 0) {
        //         $jsonOutput->setErrorCode(config('errors.elections.ERROR_TZ_OR_NOT_CONNECT_TO_CAPTAIN'));
        //         return;
        //     }
        // } else
        $voterDetails = ActivitiesCityMobileServices::getAllVoterByClusterVoterId($this->currentElectionCampaign->id, null, true);

        $jsonOutput->setData($voterDetails);
    }


    public function getDashboardCaptain50()
    {
        $jsonOutput = app()->make("JsonOutput");
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $isUserCaptain = ElectionRoleByVoterService::checkIsExistRoleByKeyVoter($role_id, Auth::user()->voter_id, $this->currentElectionCampaign->id);
        if ($isUserCaptain) {
            // $date_election = $this->currentElectionCampaign->election_date;

            // $my_date = new DateTime($date_election);

            // //check if today is electionCampaign data
            // if ($my_date->format('Y-m-d') == date('Y-m-d'))
            //     $Dashboard = $this->getElectionDashboardCaptain50();
            // else
                $Dashboard = $this->getPreDashboardCaptain50();
            $jsonOutput->setData($Dashboard);
        } else
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_NOT_CAPTAIN'), 400);
    }

    public function getDashboardCluster()
    {
        $jsonOutput = app()->make("JsonOutput");
        $date_election = $this->currentElectionCampaign->election_date;

        //$my_date = new DateTime($date_election);

        try {
            //check if today is electionCampaign data
            // if ($my_date->format('Y-m-d') == date('Y-m-d'))
            //     $Dashboard = $this->getElectionDashboardCluster();
            // else
                $Dashboard = $this->getPreDashboardCluster();
            $jsonOutput->setData($Dashboard);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getPreDashboardCluster()
    {

        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $clusterLeaderId = Auth::user()->voter_id;

        //$clusterArr = Cluster::select()->where('election_campaign_id', $this->currentElectionCampaign->id)->where('leader_id', $clusterLeaderId)->get();
        $clusterArr=ClusterService::getArrClustersByUserClusterLeader($clusterLeaderId,$this->currentElectionCampaign->id);
        if (!$clusterArr)
            throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));

        //map arr cluster id, user can connect for many cluster in same city
        $arr_cluster_id = $clusterArr->map(function($cluster){
            return $cluster->id;
        });

        $Dashboard = new stdClass();
        $Dashboard->banner_link = BannerLinkService::getBannerLinksByName('pre-election');
        $Dashboard->detail_level = ActivitiesCityMobileServices::getPresetDetailsVoterDonByCluster($arr_cluster_id, $this->currentElectionCampaign->id); //presents od details voter that captain fifty has//ActivitiesCityMobileServices::getPresentsVoterWithAllDetailsByUseCaptainId($this->currentElectionCampaign->id);//אחוז הבוחרים בקבוצה אשר להם פרטים כל מעודכנים
        $Dashboard->support_level = ActivitiesCityMobileServices::getPresentSupportVoterByCluster($arr_cluster_id, $this->currentElectionCampaign->id);
        $Dashboard->no_support_level = ActivitiesCityMobileServices::getPresentNotSupportVoterByCluster($arr_cluster_id, $this->currentElectionCampaign->id);

        $detailsPhone = ActivitiesCityMobileServices::getPresentVoterWithVerifiedPhoneByCluster($arr_cluster_id, $this->currentElectionCampaign->id);
        $Dashboard->supporters_with_smartphone = $detailsPhone['presentWithVerified'];
        $Dashboard->supporters_no_smartphone = $detailsPhone['presentWithoutVerified'];

        //calculate under destination
        $destinationPresents = round(ActivitiesCityMobileServices::getPresentForTodayByRole($role_id, $this->currentElectionCampaign->id));
        $Dashboard->avg_detail_level =$destinationPresents;
        // self::calculateUnderDestination($destinationPresents, $Dashboard->detail_level);


        return $Dashboard;
    }

    public function getToDayDashboardCaptain50(){

        $jsonOutput = app()->make("JsonOutput");
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $isUserCaptain = ElectionRoleByVoterService::checkIsExistRoleByKeyVoter($role_id, Auth::user()->voter_id, $this->currentElectionCampaign->id);
        if ($isUserCaptain) {
                $Dashboard = $this->getElectionDashboardCaptain50();
            $jsonOutput->setData($Dashboard);
        } else
            $jsonOutput->setErrorCode(config('errors.elections.ACTIVIST_NOT_CAPTAIN'), 400);
    }

    public  function getPreDashboardCaptain50()
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $Dashboard = new stdClass();
        $Dashboard->banner_link = BannerLinkService::getBannerLinksByName('pre-election');
        $Dashboard->detail_level = round(ActivitiesCityMobileServices::getPresentDetailsVoterDon($this->currentElectionCampaign->id)); //presents od details voter that captain fifty has//ActivitiesCityMobileServices::getPresentsVoterWithAllDetailsByUseCaptainId($this->currentElectionCampaign->id);//אחוז הבוחרים בקבוצה אשר להם פרטים כל מעודכנים
        $Dashboard->support_level = ActivitiesCityMobileServices::getPresentsVoterSupportVoterByUseCaptainId($this->currentElectionCampaign->id);
        $Dashboard->no_support_level = ActivitiesCityMobileServices::getPresentsVoterUnSupportVoterByUseCaptainId($this->currentElectionCampaign->id);

        $presentPhone = ActivitiesCityMobileServices::getPresentsSupportVoterWithPhoneByUseCaptainId($this->currentElectionCampaign->id);
        $Dashboard->supporters_with_smartphone = $presentPhone['present_with_verified'];
        $Dashboard->supporters_no_martphone = $presentPhone['present_without_verified'];

        //calculate under destination
        $destinationPresents = round(ActivitiesCityMobileServices::getPresentForTodayByRole($role_id, $this->currentElectionCampaign->id));
        $Dashboard->avg_detail_level = $destinationPresents;
        //self::calculateUnderDestination($destinationPresents, $Dashboard->detail_level);


        return $Dashboard;
    }

    //dashboard captain on day election campaign
    public function getElectionDashboardCaptain50()
    {
        $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        $Dashboard = new stdClass();
        $Dashboard->banner_link =BannerLinkService::getBannerLinksByName('election-day'); //ActivitiesCityMobileServices::getBannerLink();
        $Dashboard->total_shas_supportes = ActivitiesCityMobileServices::getCountVoterShasSupportByCaptain($this->currentElectionCampaign->id);
        $Dashboard->total_voteds_has_supportes = ActivitiesCityMobileServices::getCountVoterShasSupportAndVotesInCampaignByCaptain($this->currentElectionCampaign->id);
        $Dashboard->supporters_need_transaportation = ActivitiesCityMobileServices::getCountFinalSupportNeedTransporationByCaptain($this->currentElectionCampaign->id);

        return $Dashboard;
    }

    //dashboard cluster  on day election campaign
    public function getElectionDashboardCluster()
    {
        $clusterLeaderId = Auth::user()->voter_id;
        //$clusterArr = Cluster::select()->where('election_campaign_id', $this->currentElectionCampaign->id)->where('leader_id', $clusterLeaderId)->get();
       //an new method
       $clusterArr=ClusterService::getArrClustersByUserClusterLeader($clusterLeaderId,$this->currentElectionCampaign->id);

        if (!$clusterArr)
            throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));

        //map arr cluster id, user can connect for many cluster in same city
        $arr_cluster_id = $clusterArr->map(function ($cluster) {
            return $cluster->id;
        });
        // Log::info($arr_cluster_id);
        $entity_final_status_support = config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL');
        $Dashboard = new stdClass();
        $Dashboard->banner_link = BannerLinkService::getBannerLinksByName('election-day');
        $Dashboard->total_eshkol_voters = ActivitiesCityMobileServices::getCountVoterByCluster($arr_cluster_id, $this->currentElectionCampaign->id);
        $Dashboard->total_voted_eshkol_voters = ClusterService::getCountVotedVoterByClustersId($arr_cluster_id, $this->currentElectionCampaign->id);
        $Dashboard->total_shas_eshkol_voters = ClusterService::getCountSupportVoterByClusterId($arr_cluster_id, $this->currentElectionCampaign->id, $entity_final_status_support);
        $Dashboard->total_voted_shas_eshkol_voters = ClusterService::getCountSupportVoterByClusterId($arr_cluster_id, $this->currentElectionCampaign->id, $entity_final_status_support, true);
        return $Dashboard;
    }

    public function getToDayDashboardCluster(){

        $jsonOutput = app()->make("JsonOutput");
        try {
            $Dashboard=$this->getElectionDashboardCluster();
            $jsonOutput->setData($Dashboard);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //--logout

    public function logout()
    {
        $res = Auth::logout();
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData($res);
    }


    public function addVoterWithCaptainFiftyByCaptain(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            //phone of voter
            $mobile_phone_number = $object->mobile_phone_number;
            //personal_identity_voter 
            $voter_key = $object->personal_identity;

            $addVote = ActivitiesCityMobileServices::addVoteToCaptainFiftyByCaptain($voter_key, $mobile_phone_number, $this->currentElectionCampaign->id);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

  
//---------------------------
    public function addVoterWithCaptainFiftyByCluster(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            //phone of voter
            $mobile_phone_number = $object->mobile_phone_number;
            //personal_identity_voter 
            $voter_key = $object->personal_identity;

            //captain_key
            $captain_key = $object->captain_id;
            $captain_voter = Voters::select()->where('key', $captain_key)->first();
            if (!$captain_voter)
                throw new Exception(config('errors.elections.CAPTAIN_VOTER_DOESNT_EXIST'));

            //check if captain voter id is real captain
            $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
            if (!ElectionRoleByVoterService::checkIsExistRoleByKeyVoter($role_id, $captain_voter->id, $this->currentElectionCampaign->id))
                throw new Exception(config('errors.elections.INVALID_CAPTAIN'));

            //driver 
            $voter_driver_id = null;

            //if need transportions
            if (!is_null($object->voter_driver_tz) && strcmp($object->voter_driver_tz, '') != 0) {
                $role_id_driver = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.driver'));
                $voter_driver_key = $object->voter_driver_tz;
                $voterDriver = Voters::select()->where('key', $voter_driver_key)->first();
                if (!$voterDriver)
                    throw new Exception(config('errors.elections.VOTER_DRIVER_NOT_EXIST'));
                if (!ElectionRoleByVoterService::checkIsExistRoleByKeyVoter($role_id_driver, $voterDriver->id, $this->currentElectionCampaign->id))
                    throw new Exception(config('errors.elections.VOTER_DRIVER_NOT_EXIST'));
                $voter_driver_id = $voterDriver->id;
            }


            $addVote = ActivitiesCityMobileServices::addVoteToCaptainFiftyCluster($voter_key, $mobile_phone_number, $this->currentElectionCampaign->id, $captain_voter->id, $voter_driver_id);
            $jsonOutput->setData(true);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    public function searchVoterByDetails(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        $object = (object)($request->all());
        try {
            $voter = ActivitiesCityMobileServices::searchVoterByDetails($object, $this->currentElectionCampaign->id);
            $jsonOutput->setData($voter);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    //return arr list of voter activist in cluster or ballot box by user cluster
    public function getListActivistOfClusterByUserCluster(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        $ballotBoxNumber = null;

        try {
            $object = (object)($request->all());
            $voterActivistId = Auth::user()->voter_id;
            $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));
            $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id);
            if (!$arrClusters)
                throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));

            $clustersId = $arrClusters->map(function ($cluster) {
                return $cluster->id;
            });
            if (isset($object->ballot_number))
                $ballotBoxNumber = $object->ballot_number;
            $activistArr = ActivitiesCityMobileServices::getListVoterActivist($clustersId, $ballotBoxNumber, $this->currentElectionCampaign->id);
            $jsonOutput->setData($activistArr);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    //function return arr captain of voter in clusters of user voter
    public  function getListCaptainByUserCluster(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            //get arr cluster id of user activist
            $object = (object)($request->all());
            $voterActivistId = Auth::user()->voter_id;
            $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id);
            if (!$arrClusters)
                throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));

            $clustersId = $arrClusters->map(function ($cluster) {
                return $cluster->id;
            });

            $arrCaptainFifty = ClusterService::getArrCaptainInArrCluster($clustersId, $this->currentElectionCampaign->id);
            $jsonOutput->setData($arrCaptainFifty);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //function return details in election day of all ballot box in arr cluster or for specific ballot box number
    public function detailsBallotBoxCluster(Request $request)
    {
        $ballotBoxNumber = null;
        $jsonOutput = app()->make("JsonOutput");
        try {
            //get arr cluster id of user activist
            $object = (object)($request->all());
            $voterActivistId = Auth::user()->voter_id;
            $role_id = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.clusterLeader'));
            $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id);
            if (!$arrClusters)
                throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));

            $clustersId = $arrClusters->map(function ($cluster) {
                return $cluster->id;
            });

            //number ballot box
            if (isset($object->ballot_mi_id))
                $ballotBoxNumber = $object->ballot_mi_id;

            $detailsBallot = ActivitiesCityMobileServices::getDetailsBallotBoxArr($clustersId, $this->currentElectionCampaign->id, $ballotBoxNumber);
            $jsonOutput->setData($detailsBallot);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public function getListClusters(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");
        try {
            $ClusterFullNameQuery = Cluster::getClusterFullNameQuery('cluster_name', false);
            $arrFieldsClusterDisplay = [DB::raw("concat(" . $ClusterFullNameQuery . ",'- ',clusters.street,' ', clusters.house) As cluster_name"), 'clusters.id as cluster_id'];
            $voterActivistId = Auth::user()->voter_id;
            $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id, $arrFieldsClusterDisplay);
            if (!$arrClusters)
                throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));
            $jsonOutput->setData($arrClusters);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }


    public function searchVoterByClusterUser(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $object = (object)($request->all());
            $voterActivistId = Auth::user()->voter_id;
            //check if user is cluster leader
            $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, $this->currentElectionCampaign->id);
            if (!$arrClusters)
                throw new Exception(config('errors.elections.ACTIVIST_NOT_CLUSTER_LEADER'));


            $ballotBoxId = null;
            $cluster_id = null;

            //tz
            $personal_id_number = $object->personal_id_number;
            //remove start zero of personal tz
            $personal_id_number=Helper::trimStartZero($personal_id_number);

            $cluster_id = $object->cluster_id;
            $ballot_mi_id = $object->ballot_mi_id;
            $voter_serial_number = $object->voter_serial_number;

            if (strcmp($personal_id_number, '') == 0 && (strcmp($cluster_id, '') == 0 || strcmp($ballot_mi_id, '') == 0 || strcmp($voter_serial_number, '') == 0))
                throw new Exception(config('errors.elections.ERROR_PRAMS_SEARCH_VOTER_BY_CLUSTER'));

            //search by ballot details
            if (strcmp($personal_id_number, '') == 0) {
                //$cluster_id= ClusterService::getClusterByKeyAndElectionCampaign($cluster_key,$this->currentElectionCampaign->id);
                $ballot_box_Number = BallotBox::resetLogicMiBallotBox($ballot_mi_id); //remove logic ballot box number
                $ballotBoxObj = BallotBox::getBallotBoxIdByMi_id_ClusterId($ballot_box_Number, [$cluster_id], true); //search id of ballot box number
                $ballotBoxId = $ballotBoxObj->id;
                $voter = ActivitiesCityMobileServices::searchVoterByBallotDetails($cluster_id, $ballotBoxId, $voter_serial_number);
            } else //search by personal id number
                $voter = ActivitiesCityMobileServices::searchVoterByPersonalIdentityAndArrCluster($personal_id_number, $arrClusters);

            if (!$voter)
                throw new Exception(config('errors.elections.VOTER_SEARCH_WRONG_OR_NOT_IN_CLUSTER'));

            $jsonOutput->setData($voter);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function calculateUnderDestination($destination, $present)
    {
        if ($destination > $present)
            return $destination - $present;
        else
            return 0;
    }

      //function mark need transport by cluster leader
      public function markNeedTransportation(Request $request){

        $jsonOutput = app()->make("JsonOutput");
        try{
           
            $object = (object)($request->all());
            $voter_key=$object->personal_identity;
            $driver_key = $object->voter_driver_tz;

            $driver_id=null;

            //voter id
            $voter=VoterDetailsService::getVoterByKey($voter_key);

            // driver voter id
            if (!is_null($driver_key) && strcmp($driver_key, '') != 0)
                  $driver_id = ActivitiesCityMobileServices::checkDriverByKey($driver_key, $this->currentElectionCampaign->id);
          

            //save need Transportations
            $tans = VoterDetailsService::SaveVoterTransportations($voter->id, $this->currentElectionCampaign->id, $object->need_transportation, 0, $driver_id);

            $VoterAfterSave = ActivitiesCityMobileServices::getVoterDetailsByVoterKey($voter_key, true, null);
            $jsonOutput->setData($VoterAfterSave);
        }
        catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    //-----------------ballot leader function----------------------

    public  function getVoterDetailsByVoterNumberInBallotBox(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");

        try {
           
            $voterActivistId = Auth::user()->voter_id;
            $object = (object)($request->all());

            $voter_serial_number = $object->voter_number;

            $ballot_box_Number = BallotBox::resetLogicMiBallotBox($object->ballot_mi_id); //remove logic ballot box number
            $ballotBoxObj = BallotBox::getBallotBoxIdByMiId_Activist_voter_id($ballot_box_Number, $voterActivistId, $this->currentElectionCampaign->id); //search id of ballot box number
            if (!$ballotBoxObj)
                throw new Exception(config('errors.elections.ACTIVIST_NOT_BALLOT_MEMBER'));

            $ballotBoxId = $ballotBoxObj->id;


            $voter = VoterDetailsService::getVoterDetailsByVoterNumberInBallotBox($ballotBoxId, $this->currentElectionCampaign->id, $voter_serial_number, ['voters.first_name', 'voters.last_name', 'voters.key as personal_identity']);
            if (!$voter)
                throw new Exception(config('errors.elections.VOTER_SERIAL_NUMBER_NOT_IN_BALLOT'));

            $jsonOutput->setData($voter);
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }



    public static function  printCluster(){
        $voterActivistId = Auth::user()->voter_id;
        //check if user is cluster leader
        $arrClusters = ClusterService::getArrClustersByUserClusterLeader($voterActivistId, 24);

        Log::info( $arrClusters->toArray());
    }

 
    public function getMobileInformation(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        try {
            $information= MobileAppInformationService::getInformation();
            $jsonOutput->setData($information);
        } catch (\Exception $e ){
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }
    //
    // public static function getListVotesPartyByBallotBox(Request $request){
    //     $voterActivistId = Auth::user()->voter_id;
    //     $object = (object)($request->all());
    //     $jsonOutput = app()->make("JsonOutput");
    // } 

  
}
