<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Libraries\Services\ExportService;

use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use App\Models\ElectionCampaigns;
use App\Models\VoterCaptainFifty;
use App\Models\VotersInElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\City;
use App\Models\SupportStatus;


class CaptainOfFiftyController extends Controller {

    private $currentCampaignId = -1;

    /**
     *
     * @param Request $request
     * @return type
     *
     * captain of fifty activities search
     * filters:
     * - Geo location: key of: {city, cluster}
     *
     * the returned json will include:
     * - captain of fifty info {key, first_name, last_name, personal_identity, captain_id}
     * - households_count
     * - actual_address_correct_count
     * - voters_count
     * - support_status
     *
     * request URLs:
     * .../captains_of_fifty?city_key=***
     * .../captains_of_fifty?cluster_key=***
     *
     */
    public function captainsOfFifty(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $city_id = $request->input('city_id', null);
        $cluster_id =  $request->input('cluster_id', null);

        $first_name = $request->input('first_name', null);
        $last_name = $request->input('last_name', null);
        $personal_identity = $request->input('personal_identity', null);

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $where = [
            'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
            'election_roles.system_name' =>  DB::raw("'" . config('constants.activists.election_role_system_names.ministerOfFifty') . "'")
        ];

        $countHouseholdsQuery = "(SELECT COUNT(DISTINCT voters.household_id) FROM ";
        $countHouseholdsQuery .= "voters_with_captains_of_fifty INNER JOIN voters ";
        $countHouseholdsQuery .= "ON voters.id = voters_with_captains_of_fifty.voter_id ";
        $countHouseholdsQuery .= "WHERE voters_with_captains_of_fifty.captain_id = election_roles_by_voters.voter_id ";
        $countHouseholdsQuery .=  "AND voters_with_captains_of_fifty.election_campaign_id = " . $last_campaign_id . " AND ";
        $countHouseholdsQuery .=  " voters_with_captains_of_fifty.deleted = 0)";
        $countHouseholdsQuery .=  "as total_count_minister_of_fifty_count";

        $fields = [
            'election_roles_by_voters.id',
            'voters.id as captain_id',
            'voters.key as captain_key',
            'voters.first_name',
            'voters.last_name',
            'voters.personal_identity',
            'cities.name as city_name',
            DB::raw($countHouseholdsQuery)
        ];
        $captainsObj = ElectionRolesByVoters::select($fields)
            ->withElectionRole()
            ->withVoter()
            ->withVoterCity();

        if ( !is_null($city_id) || !is_null($cluster_id) ) {
            $captainsObj->withCaptain50Household($last_campaign_id);

            if ( !is_null($cluster_id) ) {
                $where['clusters.id'] = $cluster_id;
            } else if ( !is_null($city_id) ) {
                $where['clusters.city_id'] = $city_id;
            }
        }

        if ( !is_null($personal_identity) ) {
            $where['voters.personal_identity'] = $personal_identity;
        }

        $captainsObj->where($where);

        if ( !is_null($first_name) ) {
            $captainsObj->where('voters.first_name', 'LIKE', '%' . $first_name . '%');
        }

        if ( !is_null($last_name) ) {
            $captainsObj->where('voters.last_name', 'LIKE', '%' . $last_name . '%');
        }

       // if ( !is_null($city_id) || !is_null($cluster_id) ) {
          //  $captainsObj->groupBy('election_roles_by_voters.id');
        //}
		$captainsObj->groupBy('voters.id');
        $captains = $captainsObj->get();

        $result = [
            'totalCaptains' => count($captains),
            'captains' => $captains
        ];

        $jsonOutput->setData($result);
    }

	/*
		Private helpful function that validates inputs 
	*/
    private function validateIntInput($fieldName, $fieldValue) {
        $rules = [
            $fieldName => 'integer'
        ];

        $validator = Validator::make([$fieldName => $fieldValue], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

    public function getCaptainsBallots($captainKey){
        $jsonOutput = app()->make("JsonOutput");

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $where = [
            'captain.key' => $captainKey,
            'election_roles_by_voters.election_campaign_id' => $last_campaign_id,
            'voters_with_captains_of_fifty.election_campaign_id' => $last_campaign_id,
            'voters_with_captains_of_fifty.deleted' => DB::raw(0),
            'election_roles.system_name'=> 'captain_of_fifty'
        ];
        $captainBallots = VoterCaptainFifty::select(
        'ballot_boxes.id',
        'ballot_boxes.mi_id',
        'cities.name as city_name')
        ->withCaptainOfFifty(true)
        ->withVoters(true)
        ->withElectionCampaigns($last_campaign_id)
        ->join('election_roles_by_voters' , 'election_roles_by_voters.voter_id' , '=' , 'captain.id' )
        ->join('election_roles' , 'election_roles.id' , '=' , 'election_roles_by_voters.election_role_id')
        ->where($where)
        ->groupBy('ballot_boxes.id')
        ->get();

        $jsonOutput->setData($captainBallots);

    }
	/*
		Private helpful function that generates captain50 activity report
	*/
    private function getCaptain50ActivityQuery(Request $request , $systemSupportStatuses) {
        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);

        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;

        $fields = [
            'captain.id as captain_id',
            'captain.key as captain_key',
            'captain.personal_identity as captain_personal_identity',
            'captain.first_name as captain_first_name',
            'captain.last_name as captain_last_name',
            'election_roles_by_voters.key as election_role_key',
            DB::raw('count(distinct ballot_boxes.id) as count_ballots'),

            DB::raw('count(distinct voters.household_id) as count_households'),
            DB::raw('count(voters.id) as count_voters'),

            // DB::raw('count(CASE WHEN voters.not_at_home=1 THEN 1 END) as count_not_at_home'),
            DB::raw('count(CASE WHEN voters.actual_address_correct=1 THEN 1 END) as count_verified_address'),
            DB::raw('count(CASE WHEN voters.actual_address_correct=0 THEN 1 END) as count_wrong_address'),

            DB::raw('count(CASE WHEN voters.religious_group_id IS NOT NULL THEN 1 END) as count_as_religious_group'),
            DB::raw('count(CASE WHEN voters.ethnic_group_id IS NOT NULL THEN 1 END) as count_as_ethnic_group'),
        ];

        for ( $statusIndex = 0; $statusIndex < count($systemSupportStatuses); $statusIndex++ ) {
            $supportStatusId = $systemSupportStatuses[$statusIndex]->id;

            $countField = 'count(CASE WHEN voter_support_status.support_status_id=' . $supportStatusId . ' THEN 1 END) ';
            $countField .= 'as count_support_status' . $supportStatusId;
            $fields[] = DB::raw($countField);
        }

        $countField = 'count(CASE WHEN voter_support_status.support_status_id IS NULL THEN 1 END) as count_support_status_none';
        $fields[] = DB::raw($countField);

            $captainObj = VoterCaptainFifty::select($fields)
                ->withCaptainOfFifty(true)
                ->withVoters(true)
                ->withVoterSupportStatus($last_campaign_id)
                ->withElectionCampaigns($last_campaign_id)
                ->join('election_roles_by_voters' , 'election_roles_by_voters.voter_id' , '=' , 'captain.id' )
                ->join('election_roles' , 'election_roles.id' , '=' , 'election_roles_by_voters.election_role_id')
                ->where('election_roles_by_voters.election_campaign_id' , $last_campaign_id)
                ->where('election_roles.system_name','captain_of_fifty');

                if ( !is_null($city_id) ) {
                    $where['cities.id'] = $city_id;
        
                } else if ( !is_null($sub_area_id) ) {
                    $where['cities.sub_area_id'] = $sub_area_id;
        
                } else if ( !is_null($area_id) ) {
                    $where['cities.area_id'] = $area_id;
                }
        
                $captainObj->where($where)
                    ->groupBy('voters_with_captains_of_fifty.captain_id');
                return $captainObj;
        }

    /**
     * This function validates the
     * input data for creating report.
     *
     * @param Request $request
     * @return mixed|string
     */
    private function validateCaptain50ActivityReport(Request $request) {
        $area_id = $request->input('area_id', null);
        $city_id = $request->input('city_id', null);

        if ( is_null($area_id) && is_null($city_id)) {
            return config('errors.elections.CAPTAIN50_ACTIVITY_NO_GEO_TYPE_WAS_CHOSEN');
        }

        if ( !is_null($area_id) && !$this->validateIntInput('area_id', $area_id) ) {
            return config('errors.elections.CAPTAIN50_ACTIVITY_INVALID_AREA');
        }

        if ( !is_null($city_id) ) {
            if ( !$this->validateIntInput('city_id', $city_id) ) {
                return config('errors.elections.CAPTAIN50_ACTIVITY_INVALID_CITY');
            } else {
                $cityObj = City::select(['id', 'key'])->where('id', $city_id)->first();
                if ( is_null($cityObj) ) {
                    return config('errors.elections.CAPTAIN50_ACTIVITY_INVALID_CITY');
                } else if ( !GlobalController::isAllowedCitiesForUser($cityObj->key) ) {
                    return config('errors.elections.CAPTAIN50_ACTIVITY_CITY_IS_NOT_ALLOWED_TO_USER');
                }
            }
        }

        return 'OK';
    }

	/*
		Function that returns captain50 activity report
	*/
    public function captain50ActivityReport(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        if ( ($msgCode = $this->validateCaptain50ActivityReport($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($msgCode);
            return;
        }
        $current_page = $request->input('current_page', 1);
        $limit = 100;
        $skip = ($current_page - 1) * $limit;

        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $systemSupportStatuses = SupportStatus::select(['id'])
        ->where(['election_campaign_id' => $last_campaign_id, 'deleted' => 0, 'active' => 1])
        ->get();

        $captainObj = $this->getCaptain50ActivityQuery($request, $systemSupportStatuses);

        $captains = $captainObj->skip($skip)->limit($limit)->get();

        $total_records = DB::table(DB::Raw('( ' . $captainObj->toSql() . ' ) AS t1'))
        ->setBindings([$captainObj->getBindings()])
        ->select([DB::raw('count(*) as total_records')])
        ->first();

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $captains
        ];

        $result = [
            'total_records' => $total_records->total_records,
            'records' => $captains
        ];
        $jsonOutput->setData($result);
    }

    /**
     * This function converts the data
     * generated from db query for Export
     * service.
     *
     * @param $result
     * @return array
     */
    private function convertCaptain50ActivityReport($captains, $systemSupportStatuses) {
        $exportedRows = [];

        for ( $statusIndex = 0; $statusIndex < count($systemSupportStatuses); $statusIndex++ ) {
            $countField =  'count_support_status' . $systemSupportStatuses[$statusIndex]->id;
        }

         $firstFields = [
                'captain_personal_identity'=>'ת"ז',
                'count_households'=>'בתי אב',
                'count_voters'=>'תושבים',

                'count_not_at_home'=>'לא היה בבית',
                'count_verified_address'=>'כתובות מאומתות',
                'count_wrong_address'=>'כתובות שגויות'
            ];

        $records = $captains;
        for ( $rowIndex = 0; $rowIndex < count($records); $rowIndex++ ) {
            $newRow = [];

            $newRow['full_name'] = $records[$rowIndex]['captain_first_name'] . ' ' . $records[$rowIndex]['captain_last_name'];
            foreach (  $firstFields as $fieldName=>$fieldValue ) {
                $newRow[$fieldValue] = $records[$rowIndex][$fieldName];
            }
            $sum = 0;
            for ( $statusIndex = 0; $statusIndex < count($systemSupportStatuses); $statusIndex++ ) {
                $countField =  'count_support_status' . $systemSupportStatuses[$statusIndex]->id;
                $newRow[$systemSupportStatuses[$statusIndex]->name] = $records[$rowIndex][$countField];

                $sum += $records[$rowIndex][$countField];
            }
            $newRow['ללא סטטוס'] = $records[$rowIndex]['count_support_status_none'];
            $sum += $records[$rowIndex]['count_support_status_none'];

            $newRow['סה"כ'] = $sum;

            $exportedRows[] = $newRow;
        }

        return $exportedRows;
    }

	/*
		Function that exports captain50 activity report to file or print
	*/
    public function exportCaptain50ActivityReport(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);

        if ( ($msgCode = $this->validateCaptain50ActivityReport($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($msgCode);
            return;
        }


        $last_campaign_id = VoterElectionsController::getLastCampaign();
        
        $systemSupportStatuses = SupportStatus::select(['id'])
        ->where(['election_campaign_id' => $last_campaign_id, 'deleted' => 0, 'active' => 1])
        ->get();

        $captainsObj = $this->getCaptain50ActivityQuery($request, $systemSupportStatuses);

        $captains =  $captainsObj->get();
        $data = $this->convertCaptain50ActivityReport($captains, $systemSupportStatuses);

        $file_type = $request->input('file_type', null);
        return ExportService::export($data, $file_type);
    }

    
    /*
		Function that exports captain50 activity report to file or print
	*/
    public function exportCaptain50ActivityReportSummary(Request $request) {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);

        if ( ($msgCode = $this->validateCaptain50ActivityReport($request)) != 'OK' ) {
            $jsonOutput->setErrorCode($msgCode);
            return;
        }

        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;
        $prev_campaign_id = ElectionCampaigns::previousCampaign()->id;

        $systemSupportStatuses = SupportStatus::select(['id', 'name'])
        ->where(['election_campaign_id' => $last_campaign_id, 'deleted' => 0, 'active' => 1])
        ->get();
        
        $captainsObj = $this->getCaptain50ActivityQuery($request, $systemSupportStatuses);

        $captainsObj->withPrevVoterSupportStatus($prev_campaign_id)
        ->join('cities as activist_city', 'activist_city.id', 'election_roles_by_voters.assigned_city_id')

        ->leftJoin('voters_updates_by_captains', function ( $joinOn ) {
            $joinOn->on('voters_updates_by_captains.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                ->on('voters_updates_by_captains.captain_id', '=', 'voters_with_captains_of_fifty.captain_id');
        })
        ->addSelect(
            ['activist_city.name as activist_city_name',
                DB::raw('count(CASE WHEN prev_support_statuses.level > 0 THEN 1 END) as prev_supports_count'),

                // voters_updates_by_captains counts:
                DB::raw('count(CASE WHEN voters_updates_by_captains.is_support_status_changed = 1 THEN 1 END) as supports_status_changes_count'),
                DB::raw('count(CASE WHEN voters_updates_by_captains.is_phone_changed = 1 THEN 1 END) as phone_changes_count'),
                DB::raw('count(CASE WHEN voters_updates_by_captains.is_ethnic_changed = 1 THEN 1 END) as ethnic_changes_count'),
                DB::raw('count(CASE WHEN voters_updates_by_captains.is_religious_changed = 1 THEN 1 END) as religious_changes_count'),
                DB::raw('count(CASE WHEN voters_updates_by_captains.is_address_changed = 1 THEN 1 END) as address_changes_count'),
            ]
        );

        $captains = $captainsObj->get();
        // dd($captains->toArray());
        // die;
        $ballots = $captainsObj->select('voters_with_captains_of_fifty.captain_id', 'ballot_boxes.mi_id as ballot_mi_id')
        // ->join('ballot_boxes', 'ballot_boxes.id', 'ballot_box_id')
        ->groupBy('ballot_box_id')->get();
        $ballotsHash = [];
        
        foreach( $ballots as  $row){
            $captain_id = $row->captain_id;
            $ballot_mi_id = $row->ballot_mi_id;
            if(!isset($ballotsHash[$captain_id])){
                $ballotsHash[$captain_id] = [];
            }
            $ballotsHash[$captain_id][$ballot_mi_id] = $ballot_mi_id;
        }
        if ( count($captains) > 0 ) {
		
            header("Content-Type: application/txt");
            header("Content-Disposition: attachment; filename=captain50_actions_summary.csv");

            $titleRowFields = [
                'עיר שיבוץ',
                'שם',
                'תז',
                'תושבים',
            ];
            foreach ($systemSupportStatuses as $status) {
                $titleRowFields[] = $status->name . ' כנסת נוכחית סניף ';
            }
            $titleRowFields2 =[
                'ללא סטטוס כנסת נוכחית',
                'תומך כנסת קודמת',
                'קיים זרם',
                'קיים שיוך עדתי',
                'מס עדכוני סטטוסים',
                'מס עדכוני טלפון',
                'מס עדכוני כתובות',
                'מס עדכוני זרם',
                'מס עדכוני עדה',
                'קלפיות',
            ];
            $titleRowFields = array_merge($titleRowFields, $titleRowFields2);

            $titleRow = implode(',', $titleRowFields) ;
            $rowToPrint = mb_convert_encoding($titleRow, "ISO-8859-8", "UTF-8") . "\n";

            echo $rowToPrint;
        }else{
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצאו פעילים</h1>";return;
        }

        foreach ($captains as $captainRowData){
            $captainBallots = $ballotsHash[$captainRowData->captain_id];
           $captainRowToPrint = $this->getCaptain50ActivityReportRow($captainRowData, $captainBallots, $systemSupportStatuses);

           $fields = array_keys($captainRowToPrint);
           foreach ( $fields as $fieldName ) {
               $captainRowToPrint[$fieldName] =  str_replace(',', '', $captainRowToPrint[$fieldName]) ;
           }
            $fullRow = implode(',', $captainRowToPrint);
            $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";

            echo $rowToPrint;
        }

    }
     private function getCaptain50ActivityReportRow($rowData, $captainBallots, $systemSupportStatuses){


        $rowToPrintData = [
            'עיר שיבוץ' => $rowData->activist_city_name,
            'שם' => $rowData->captain_first_name . ' ' . $rowData->captain_last_name,
            'תז' => $rowData->captain_personal_identity,
            'תושבים' =>$rowData->count_voters,

        ];
        foreach ($systemSupportStatuses as $status) {
            $countField =  'count_support_status' . $status->id;
            $rowToPrintData[$status->name] = $rowData[$countField] ;
        }
        $rowToPrintData2 = [
            'ללא סטטוס כנסת נוכחית' => $rowData->count_support_status_none,
            'תומך כנסת קודמת סופי' => $rowData->prev_supports_count,
            'קיים זרם' => $rowData->count_as_religious_group,
            'קיים שיוך עדתי' => $rowData->count_as_ethnic_group,
            'מס עדכוני סטטוסים' => $rowData->supports_status_changes_count,
            'מס עדכוני טלפון' => $rowData->phone_changes_count,
            'מס עדכוני כתובות' => $rowData->address_changes_count,
            'מס עדכוני זרם' => $rowData->religious_changes_count,
            'מס עדכוני עדה' => $rowData->ethnic_changes_count,
            // 'קלפיות' => $rowData->ballots_count
        ];
        $rowToPrintData = array_merge($rowToPrintData, $rowToPrintData2);

        foreach ( $captainBallots as $ballotId){
            $rowToPrintData[] = $ballotId;
        }
        /*
            $ballot_box_id = $row->ballot_box_id;
            if(!isset($ballotsHash[$captain_id])){
                $ballotsHash[$captain_id] = [];
            }
            $ballotsHash[$captain_id][$ballot_box_id] = $ballot_box_id;
        }
        dd($ballotsHash);
        // $data = $this->convertCaptain50ActivityReport($result);

        $file_type = $request->input('file_type', null);
        // return ExportService::export($data, $file_type);
        */
        
        return $rowToPrintData;
     }
     public function exportCaptain50ByBallots (Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);

        $onlyMainCaptainPerBallot = $request->input('ballot_single_captain50', null);

        $area_id = $request->input('area_id', null);
        $sub_area_id = $request->input('sub_area_id', null);
        $city_id = $request->input('city_id', null);

        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;
        $whereList = [
            'voters_in_election_campaigns.election_campaign_id' => $currentCampaignId
        ];
        if ( !is_null($city_id) ) {
            $whereList['cities.id'] = $city_id;

        } else if ( !is_null($sub_area_id) ) {
            $whereList['cities.sub_area_id'] = $sub_area_id;

        } else if ( !is_null($area_id) ) {
            $whereList['cities.area_id'] = $area_id;
        }

        $isAdmin = Auth::user()->admin == 1;
        if(!$isAdmin && is_null($city_id) && is_null($sub_area_id) && is_null($area_id)){
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!חובה לבחור אזור גאוגרפי</h1>";return;
        }

        $captain50VotersByBallots = VotersInElectionCampaigns::select([
            'ballot_boxes.mi_id as ballot_mi_id' , 'cities.mi_id as city_mi_id', 'cities.name as city_name',
            DB::raw('count(distinct voters_in_election_campaigns.voter_id ) as voters_count'),
            DB::raw('CONCAT(captain_voters.first_name," ",captain_voters.last_name) AS captain_full_name'),
            'captain_voters.personal_identity as captain_personal_identity'
        ])
        ->withBallotBox()
        ->withCaptainFifty(true)
        ->leftJoin('voters as captain_voters', 'captain_voters.id', '=', 'voters_with_captains_of_fifty.captain_id')
        ->where($whereList)
        ->groupBy('ballot_boxes.id')
        ->groupBy('voters_with_captains_of_fifty.captain_id')
        ->get();



        if ( count($captain50VotersByBallots) > 0 ) {
            $ballotsHash = [];
		    $fileName =  !$onlyMainCaptainPerBallot ? 'captain50_by_ballots' : 'ballots_with_main_captain50';
            header("Content-Type: application/txt");
            header("Content-Disposition: attachment; filename=$fileName.csv");

            $titleRowFields = [
                'קוד ישוב',
                'שם ישוב',
                'קוד קלפי',
                'תושבים',
                'שם שר50',
                'תז שר50',
            ];

            $titleRow = implode(',', $titleRowFields) ;
            $rowToPrint = mb_convert_encoding($titleRow, "ISO-8859-8", "UTF-8") . "\n";

            echo $rowToPrint;
        }else{
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצאו פעילים לפי שרי מאה</h1>";return;
        }

        foreach ($captain50VotersByBallots as $captainRowData){
            if($onlyMainCaptainPerBallot ){
                $ballot_mi_id = $captainRowData->ballot_mi_id;
                
                if(isset($ballotsHash[$ballot_mi_id])){ continue; }

                $ballotsHash[$ballot_mi_id] = $ballot_mi_id;
            }
           $captainRowToPrint = $this->getCaptain50ByBallotsRow($captainRowData);

           $fields = array_keys($captainRowToPrint);
           foreach ( $fields as $fieldName ) {
               $captainRowToPrint[$fieldName] =  str_replace(',', '', $captainRowToPrint[$fieldName]) ;
           }
            $fullRow = implode(',', $captainRowToPrint);
            $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";

            echo $rowToPrint;
        }

     }
     private function getCaptain50ByBallotsRow($rowData){
        $miId = $rowData->ballot_mi_id; 
        $miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId) - 1, 0);
        $rowToPrintData = [
            'קוד ישוב' => $rowData->city_mi_id,
            'שם ישוב' => $rowData->city_name,
            'קוד קלפי' => $miId,
            'תושבים' =>$rowData->voters_count,
            'שם שר50' =>$rowData->captain_full_name,
            'תז שר50' =>$rowData->captain_personal_identity,
        ];


        return $rowToPrintData;
     }
}