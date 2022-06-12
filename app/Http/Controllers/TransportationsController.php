<?php

namespace App\Http\Controllers;

use App\Models\ElectionRoles;
use App\Models\ElectionRolesGeographical;
use App\Models\SupportStatus;
use App\Models\VoterSupportStatus;
use PDF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\City;
use App\Models\Cluster;
use App\Models\Voters;
use App\Models\VoteSources;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesByVoters;
use App\Models\VoterTransportation;
use App\Models\TransportationCars;

use App\Http\Controllers\VoterElectionsController;
use App\Models\ActivistAllocationAssignment;
use Illuminate\Support\Facades\Log;

class TransportationsController extends Controller
{
    const TAG = 'TransportationsController';

    public  function __construct() {
        $this->fullClusterNameQuery = Cluster::getClusterFullNameQuery('', true);
    }

    public function getTransportations(Request $request){
        $resultList = [];
        $jsonOutput = app()->make("JsonOutput");

        $skipRows = $request->input('skip_rows', 0);
        $limit = 100;

        $cityKey = $request->input('city_key');
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $transportationsQuery = $this->getTransportationsQuery($currentCampaignId, $cityKey);
        
        $transportationsQuery->skip($skipRows)->limit($limit);

        $transportationsData = $this->getTransportationsFilters($request, $transportationsQuery);

        $responseData = ['transportations' => $transportationsData];
        if( $skipRows == 0){
            $countResult = $this->getCountQuery($request, $currentCampaignId, $cityKey);
            $transportationCount = !empty($countResult->transportations_count) ? $countResult->transportations_count : 0;
            $responseData['transportations_count'] = $transportationCount;
        }
        $jsonOutput->setData($responseData);
    }
    private function getCountQuery($request, $currentCampaignId, $cityKey){
        $countQuery = $this->getTransportationsQuery($currentCampaignId, $cityKey, false);

        $countQuery->select(DB::raw('COUNT(distinct voter_transportations.id) as transportations_count'));
        $countResult = $this->getTransportationsFilters($request, $countQuery);
        return isset($countResult[0]) ? $countResult[0] : null;
    }
    /**
     * @method getTransportationsQuery
     *
     * @param [type] $currentCampaignId
     * @param [type] $cityKey
     * @param boolean $getAllQuery
     * @return void
     */
    private function getTransportationsQuery($currentCampaignId, $cityKey, $getAllQuery = true){
        $orderByPhoneQuery = $this->orderPhoneQuery('voters');
        $fileds = [
            //voters
                'voters.id', 'voters.key as voter_key', 'voters.first_name', 'voters.last_name', 'voters.personal_identity',
                'voters.city', DB::raw('IFNULL(voters.street,voters.mi_street) as street'), 'voters.house',
                'voters.comment',
            //voter transportations
                'voter_transportations.key as transportations_key', 'voter_transportations.from_time',
                'voter_transportations.voter_driver_id as voter_driver_id','voter_transportations.to_time',
                'voter_transportations.cripple', 'voter_transportations.executed',
            //voter driver
                'voter_driver.first_name as driver_first_name', 'voter_driver.last_name as driver_last_name',
                'election_roles_by_voters.phone_number as driver_phone_number',
                 'voter_driver.personal_identity as driver_personal_identity',
            //cluster address
                 DB::raw($this->fullClusterNameQuery.'as cluster_name'), 'clusters.street as cluster_street',
                'clusters.house as cluster_house', 'cities.name as cluster_city_name', 'clusters.id as cluster_id',
            //election_roles_by_voters
                 DB::raw('IF(activist_roles_payments.user_lock_id IS NOT NULL,true,null) as is_driver_lock') ,
            // vote
                'votes.vote_date as has_voted'
            ];
        $transportationsQuery = Voters::select($fileds)
        ->withVoterInElectionCampaignsFullAddressData($currentCampaignId)
        ->withTransportation($currentCampaignId,false)
        ->withVoterDriver()
        ->withVotes()
        ->join('activist_roles_payments', 'activist_roles_payments.election_role_by_voter_id', '=', 'election_roles_by_voters.id')
        ->where('cities.key', $cityKey);

        if($getAllQuery){
            $transportationsQuery->with(['voterPhones' => function ($query) use($orderByPhoneQuery){
                $query->select('voter_phones.id as phone_id','voter_phones.phone_number',
                 'voter_phones.phone_type_id' , 'voter_phones.voter_id')->withVoters()->orderByRaw($orderByPhoneQuery);
            }]) 
            ->orderBy('driver_first_name')
            ->orderBy('driver_last_name')
            ->orderBy('voters.first_name')
            ->groupBy('voters.id');
        }

        return $transportationsQuery;
    }

    private function getTransportationsFilters(Request $request, &$transportationsQuery){
        $filterWithResult = true;
        $filtersObject = json_decode($request->input('filters_object', null));
        if($filtersObject){
            $filterWithResult = $this->getWhereFilters($filtersObject, $transportationsQuery);
        }else{
            $transportationsQuery->whereNull('votes.vote_date'); // Default filter
        }

        Log::debug(self::TAG . ": " . $transportationsQuery->toSql());
        
        $responseData = $filterWithResult ? $transportationsQuery->get() : [];
        // dump($filtersObject);
        return $responseData;
    }

    private function getWhereFilters($filtersObject, &$transportationsQuery){

        $voted_voters = $filtersObject->voted_voters;
        $not_voted_voters = $filtersObject->not_voted_voters;
        $transport_with_driver =$filtersObject->transport_with_driver;
        $transport_not_with_driver = $filtersObject->transport_not_with_driver;
        $transport_with_cripple = $filtersObject->transport_with_cripple;
        $transport_not_with_cripple = $filtersObject->transport_not_with_cripple;
        $max_transport_time = $filtersObject->max_transport_time;
        $cluster_key = $filtersObject->cluster_key;
        $driver_key = $filtersObject->driver_key;

        //If two contradictory conditions are met, the query will not executed because no record will appear.
        if((!$voted_voters && !$not_voted_voters) || 
         (!$transport_with_driver && !$transport_not_with_driver)||
         !$transport_with_cripple && !$transport_not_with_cripple){
         return false;   
        }
        if(!$voted_voters || !$not_voted_voters){ 
            if(!$voted_voters){$transportationsQuery->whereNull('votes.vote_date');}
            else{$transportationsQuery->whereNotNull('votes.vote_date');}
        }
        if(!$transport_with_driver || !$transport_not_with_driver){
            if(!$transport_with_driver){$transportationsQuery->whereNull('voter_driver_id');}
            else{$transportationsQuery->whereNotNull('voter_driver_id');}
        }
        if(!$transport_with_cripple || !$transport_not_with_cripple){
            $whereValue = !$transport_with_cripple ? 0 : 1 ;
           $transportationsQuery->where('voter_transportations.cripple', $whereValue);
        }
        if(!is_null($max_transport_time)){
            $transportationsQuery->where('voter_transportations.to_time', '<=', $max_transport_time . ':00')
            ->orWhereNull('voter_transportations.to_time');
        }
        if(!is_null($cluster_key)){
           $cluster= Cluster::select('id')->where('key', $cluster_key)->first();
           if(is_null($cluster)){return false;}
            $transportationsQuery->where('clusters.id', $cluster->id);
        }
        if(!is_null($driver_key)){
           $driver= Voters::select('id')->where('key', $driver_key)->first();
           if(is_null($driver)){return false;}
            $transportationsQuery->where('voter_driver_id', $driver->id);
        }
        return true;
    }

    public function addVoteToVoter(Request $request, $voterKey ){
        $jsonOutput = app()->make("JsonOutput");
        // $voterKey = $request->input('voter_key', null);
        $currentVoter = Voters::select('voters.id')->where( 'key', $voterKey )->first();
        if ( !$currentVoter ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }
        $voteSource = VoteSources::select('id')->where('system_name', 'transport')->first();
        $voteSourceId = !empty($voteSource) ? $voteSource->id : null;
        $VoterElectionsController = new VoterElectionsController;
        $newVote =  $VoterElectionsController->addVote($currentVoter->id, $voteSourceId); 
        $jsonOutput->setData($newVote);
    }
    public function updateVoterComment(Request $request, $voterKey ){
        $jsonOutput = app()->make("JsonOutput");
        // $voterKey = $request->input('voter_key', null);
        $currentVoter = Voters::select('voters.id','comment')->where( 'key', $voterKey )->first();
        if ( !$currentVoter ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }
        $historyArgsArr = [
            'topicName' => 'elections.transportations.edit',
            'models' => []
        ];
        $comment = $request->input('comment', null);
        $oldVoterDetails = $currentVoter->toArray();
        $currentVoter->comment = $comment;
        $currentVoter->save();
        $details = ['description' => 'עריכת הערה לתושב', 'modelName'=> 'Voters'];
        $this->addModelTohistory($historyArgsArr, $details, ['comment' => false], $currentVoter, $oldVoterDetails);
        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }
        $jsonOutput->setData($currentVoter);
    }
    public function updateVoterTransportation(Request $request, $key = null ){
        $jsonOutput = app()->make("JsonOutput");
        $voterKey = $request->input('voter_key', null);
        $voterTransportation= VoterTransportation::where('key', $key)->first();

        $currentVoter = Voters::select('voters.id')->where( 'key', $voterKey )->first();
        if ( !$currentVoter || !$voterTransportation ) {
			$jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }
        $historyArgsArr = [
            'topicName' => 'elections.transportations.edit',
            'models' => []
        ];
        $description = 'עריכת פרטי הסעה';

        $isExecuted = $request->input('is_executed', null);
        if(isset($isExecuted) && ($isExecuted == 0 || $isExecuted == 1)){
            $toExecute = $isExecuted == 1 ? 0 : 1;
            $oldItem = $voterTransportation->toArray();
            $voterTransportation->executed = $toExecute;
            $voterTransportation->save(); 
            $details = ['description' => $description, 'modelName'=> 'VoterTransportation'];

            $this->addModelTohistory($historyArgsArr, $details, ['executed'=> true], $voterTransportation, $oldItem);
        }

        $voterDriverId = $request->input('voter_driver_id', null);
        if(isset($voterDriverId)){
            $oldItem = $voterTransportation->toArray();
            $voterTransportation->voter_driver_id = $voterDriverId;
            $voterTransportation->save(); 
            $details = ['description' => $description, 'modelName'=> 'VoterTransportation'];

            $this->addModelTohistory($historyArgsArr, $details, ['voter_driver_id'=> true], $voterTransportation, $oldItem);
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }
        $jsonOutput->setData($voterTransportation);
    }
    public function updateVoterTransportations(Request $request){
        $jsonOutput = app()->make("JsonOutput");
        $transportationsKeys = $request->input('transportations_keys', null);
        $action = $request->input('action', null);
        if ( !count($transportationsKeys)|| !$action  ) {
			$jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }
        $voterTransportations= VoterTransportation::whereIn('key', $transportationsKeys)->get();

        $historyArgsArr = [
            'topicName' => 'elections.transportations.edit',
            'models' => []
        ];
        $description = 'עריכת פרטי הסעה';
        switch($action){
            case 'delete_transport':
                foreach($voterTransportations as $item){
                    $item->delete(); 
                    $details = ['description' => 'מחיקת הסעה', 'modelName'=> 'VoterTransportation','actionType'=>'DELETE'];
                    $this->addModelTohistory($historyArgsArr, $details, [], $item, null);
                }
            break;
            case 'unbind_driver':
                foreach($voterTransportations as $item){
                    $oldItem = $item->toArray();
                    $item->voter_driver_id = null;
                    $item->save();
                    $details = ['description' => $description, 'modelName'=> 'VoterTransportation'];
                    $this->addModelTohistory($historyArgsArr, $details, ['voter_driver_id'=> true], $item, $oldItem);
                }
            break;
            case 'mark_as_executed':
                foreach($voterTransportations as $item){
                    $oldItem = $item->toArray();
                    $item->executed = 1;
                    $item->save();
                    $details = ['description' => $description, 'modelName'=> 'VoterTransportation'];
                    $this->addModelTohistory($historyArgsArr, $details, ['executed'=> true], $item, $oldItem);
                }
            break;
        }
        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }
        // dump($historyArgsArr);

        $jsonOutput->setData($voterTransportations);
    }
    /**
     * Undocumented addModelTohistory
     * Add model values to history.
     * @param [type] $historyArgsArr
     * @param [type] $details -> model history details
     * @param [type] $fieldNameList
     * @param [model] $item -> new model
     * @param [array] $oldItem -> old model values
     * @return void
     */
    private function addModelTohistory(&$historyArgsArr, $details, $fieldNameList , $item, $oldItem = null){
        $modelName = $details['modelName'];
        $insertedValues = [];
        foreach($fieldNameList as $fieldName => $isNumericField ){
            $value = isset($item->{$fieldName}) ? $item->{$fieldName} : null;
            $oldValue = isset($oldItem[$fieldName]) ? $oldItem[$fieldName] : null;

            $newNameField = $isNumericField ? 'new_numeric_value' : 'new_value';
            $oldNameField = $isNumericField ? 'old_numeric_value' : 'old_value';
            if($value != $oldValue){
                $values = [
                    'field_name' => $fieldName,
                    'display_field_name' => config("history.$modelName.$fieldName"),
                    $newNameField => $item->{$fieldName}
                ];
                if($oldValue){
                    $values[$oldNameField] = $oldValue;
                }
                $insertedValues[] = $values;
            }

        }
        $actionType = !empty($details['actionType']) ? $details['actionType'] : 'EDIT';
        $modelHistory = [
            'description' => $details['description'],
            'referenced_model' =>  $modelName,
            'referenced_model_action_type' => config("constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_$actionType"),
            'referenced_id' => $item->id,
        ];
        // dump($actionType);
        if(!empty($insertedValues)){
            $modelHistory['valuesList'] = $insertedValues;
            $historyArgsArr['models'][] = $modelHistory;
        }else if($actionType == 'DELETE'){
            $historyArgsArr['models'][] = $modelHistory;
        }
        
    }
    public function getCityData(Request $request ){
        $jsonOutput = app()->make("JsonOutput");
        $cityKey = $request->input('city_key');
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;
 
        //Get city data : 1. clusters count 2. city name 3. city id;
        $cityData =  City::select('cities.name as city_name','cities.id as id')
        // ->withCount('clusters')
        ->with(['clusters' => function($query) use ($currentCampaignId){
            $query->select( 'clusters.id','clusters.key','clusters.city_id', DB::raw($this->fullClusterNameQuery. 'as name'))
            ->where('clusters.election_campaign_id',$currentCampaignId)
            ->get();
        }])
        ->where('cities.key',$cityKey)
        ->first();
        if(!$cityData){
           $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
           return;
        }
        //Get voter Transportations counters 
        $fileds = [
            DB::raw('count(CASE WHEN voter_transportations.cripple=1 THEN 1 END) as cripple_count'),
            DB::raw('count(CASE WHEN voter_transportations.cripple=0 THEN 1 END) as not_cripple_count'),
            DB::raw('count(CASE WHEN voter_transportations.voter_driver_id IS NOT NULL THEN 1 END) as has_driver_count'),
            DB::raw('count(CASE WHEN voter_transportations.voter_driver_id IS NULL THEN 1 END) as not_has_driver_count'),
        ];
        $countQuery= Voters::select($fileds)
        ->withTransportation($currentCampaignId,false)
        ->withCity()
        ->where('c.key',$cityKey);

        $countTransportation = $countQuery->first();
        $driversData = ['hasTransportCount' => 0, 'notHasTransportCount' => 0];

        $driversQuery = $this->getDriversData($request, $cityData->id, $currentCampaignId);
        
        $driverlist = $driversQuery->get();

        foreach($driverlist as $item){
            if($item->voters_transportations_count > 0){ $driversData['hasTransportCount']++;} else {$driversData['notHasTransportCount']++;}
        }
        // $driverList = $this->getCityVotersDriversData( $cityData->id, $currentCampaignId);
 
        $data = [
            'city_name' => $cityData->city_name,
            'city_id' => $cityData->id,
            'drivers_has_transportations'=> $driversData['hasTransportCount'],
            'drivers_not_has_transportations'=> $driversData['notHasTransportCount'],
            'transportations_count' => $countTransportation,   //Need to add filters transportations for city count!!!
            'clusters' => $cityData->clusters,
            'drivers' => $driverlist 
        ];       
        $jsonOutput->setData($data);
    }

    /**
     * @method getCityVotersDriversData
     *  - Get all drivers that has transportations in city 
     *  Not in use!!!
     * @param [type] $cityId
     * @param [type] $currentCampaignId
     * @return void
     */
    private function getCityVotersDriversData( $cityId, $currentCampaignId ){
        $fileds= [
            'voter_transportations.voter_driver_id',
            //voter driver
             'voters.key', 'voters.first_name', 'voters.last_name', 
        ];
        $driverList=  VoterTransportation::select($fileds)
        ->WithDriverVoter()
        ->withVoterInElectionCampaings()
        ->where('clusters.city_id', $cityId)
        ->groupBy('voter_transportations.voter_driver_id')
        ->get();

        return $driverList; 
    }
    public function getDrivers(Request $request ){
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $driversFilters = json_decode($request->input('driver_filters',null)) ;
        if(!$driversFilters){
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_SEARCH_PARAM'));
            return;
         }
        $cityData =  City::select('cities.id as id')
        ->where('cities.key', $driversFilters->city_key)->first();
        $cityId= !empty($cityData) ? $cityData->id : null;

        $driversQuery = $this->getDriversData($request, $cityId, $currentCampaignId, $driversFilters);
        $driversData = $driversQuery->get();
        $jsonOutput->setData($driversData);
    }
    private function getDriversData(Request $request, $cityId, $currentCampaignId, $driversFilters = null ){

        $fileds=[
            //voters
                'voters.id', 'voters.key', 'voters.first_name', 'voters.last_name', 'voters.personal_identity',
                'election_roles_by_voters.phone_number as phone_number',
            //cluster address
            DB::raw($this->fullClusterNameQuery.'as cluster_name'), 'cities.name as cluster_city_name',
                'clusters.key as cluster_key', 'clusters.id as cluster_id',
            // Car type :
                'transportation_cars.type as car_type',
            // election_roles_by_voters
                DB::raw('IF(election_roles_by_voters.user_lock_id IS NOT NULL,true,null) as is_driver_lock') ,
            ];
        $type = config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER');
        $driversQuery = ElectionRolesByVoters::select($fileds)
            ->withActivistsAllocationAssignment()
            ->withElectionRole()
            ->withVoter() 
            ->withTransportationCar()
            ->withCount('votersTransportations')
            ->join('clusters','activists_allocations.cluster_id','clusters.id')
            ->join('cities','cities.id','clusters.city_id')
            ->where('election_roles_by_voters.election_campaign_id',$currentCampaignId)
            ->where('election_roles.system_name','driver');

        if(!empty($cityId)){
            $driversQuery->where('clusters.city_id', $cityId);
        }

        if($driversFilters){
            $this->getDriverFilters($driversQuery, $driversFilters);
            $voter_cluster_id = $request->input('voter_cluster_id');
            $driversQuery->addSelect(DB::raw("(SELECT 1 FROM activists_allocations as activists_allocations_order_cluster WHERE 
            activists_allocations_order_cluster.cluster_id = $voter_cluster_id AND
            activists_allocations_order_cluster.id = activists_allocations.id LIMIT 1) AS favorite"))
            ->orderBy('voters.first_name')
            ->orderBy('voters.last_name')
            ->orderBy('favorite','desc');
        }
        $driversQuery->groupBy('voters.id');

        return $driversQuery;
    }

    private function getDriverFilters(&$driversQuery, $driversFilters){
        if(!empty($driversFilters->first_name)){
            $driversQuery->where('voters.first_name','like',$driversFilters->first_name.'%');
        }
        if(!empty($driversFilters->last_name)){
            $driversQuery->where('voters.last_name','like',$driversFilters->last_name.'%');
        }
        if(!is_null($driversFilters->cluster_key)){
            $driversQuery->where('clusters.key', $driversFilters->cluster_key);
        }
    }
        /**
     * @method  exportToFile()
     *  Print/export to pdf file voter search results
     * -> not doing pagination
     * $request:
     * @param {string} format - request format (pdf or print).
     * @return view blade file
     * pdf -> download the data in pdf file.
     * print -> print view of the data.
     *
     */
    public function exportToFile(Request $request)
    {
        ini_set('memory_limit', '-1');
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);

        $cityKey = $request->input('city_key');
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $transportationsQuery = $this->getTransportationsQuery($currentCampaignId, $cityKey);
        
        $TransportationsData = $this->getTransportationsFilters($request, $transportationsQuery);
        
        // dd($transportationsQuery->toSql());
        $driversHashTable = $this->makeDriversHashTable($TransportationsData);
        // $printData = collect($driversHashTable)->toArray();
        $cityKey = $request->input('city_key', null);
        $city = City::select('name')->where('key', $cityKey)->first();
        $format = $request->input('format');
        if ($format == 'print') {
            return view('reports.Transportations', ['data' => $driversHashTable,'print'=>true, 'city_name' => $city->name]);
        } elseif ($format == 'pdf') {
            error_reporting(0);
            ini_set("pcre.backtrack_limit", "10000000000");
            $pdf = PDF::loadView('reports.Transportations', ['data' => $driversHashTable,'print '=> false, 'city_name' => $city->name]
                , [], ['mode' => 'utf-8', 'format' => 'A4-L']);

            return $pdf->stream("תוצאות חיפוש" . ".pdf");
        }
    }
    private function makeDriversHashTable($TransportationsData){
        $driversHashTable = [];
        foreach($TransportationsData as $item){
            $currentDriver = $item->voter_driver_id ? $item->voter_driver_id : null;
            if($currentDriver && empty($driversHashTable[$currentDriver])){
                $driversHashTable[$currentDriver] = [
                    'voters' => [],
                    'id' => $item->voter_driver_id,
                    'first_name' => $item->driver_first_name,
                    'last_name' => $item->driver_last_name,
                    'phone_number' => $item->driver_phone_number,
                    'personal_identity' => $item->driver_personal_identity,
                ];
            }
            if($currentDriver){$driversHashTable[$currentDriver]['voters'][] = $item->toArray();}
        }
        return $driversHashTable;
    }
    private function orderPhoneQuery($voterTable){
		$orderByPhoneQuery = "CASE WHEN voter_phones.id = $voterTable.main_voter_phone_id THEN 1 WHEN voter_phones.phone_number LIKE '05%' THEN 2 WHEN voter_phones.phone_number NOT LIKE '05%' THEN 3 END ASC ,voter_phones.updated_at DESC, voter_phones.id";
		 return $orderByPhoneQuery;
	}

    /**
     * This function returns a selected
     * city or cluster's data.
     *
     * @param Request $request
     */
	public function getClustersData(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $clusterKey = $request->input('cluster_key');
        $cityKey = $request->input('city_key');

        $where = ['clusters.election_campaign_id' => $currentCampaignId];

        if ( !is_null($clusterKey) ) {
            $clusterObj = Cluster::select('id', 'city_id')
                ->where(['key' => $clusterKey, 'election_campaign_id' => $currentCampaignId])
                ->first();
            if ( is_null($clusterObj) ) {
                $jsonOutput->setErrorCode(config('errors.elections.INVALID_CLUSTER_KEY'));
                return;
            } else {
                $where['clusters.id'] = $clusterObj->id;
            }
        } else if ( is_null($cityKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_CITY_KEY'));
            return;
        } else {
            $cityObj = City::select('id')
                ->where(['key' => $cityKey, 'deleted' => 0])
                ->first();
            if ( is_null($cityObj) ) {
                $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
                return;
            } else {
                $where['clusters.city_id'] = $cityObj->id;
            }
        }

        $supportStatusQuery = VoterSupportStatus::select(DB::raw('count(voter_support_status.voter_id)'))
                                ->withSupportStatus()
                                ->join('voters_in_election_campaigns as viec', 'viec.voter_id', '=', 'voter_support_status.voter_id')
                                ->join('ballot_boxes as bb', 'bb.id', '=', 'viec.ballot_box_id')
                                ->join('clusters as cl', 'cl.id', '=', 'bb.cluster_id')
                                ->where('bb.cluster_id', DB::raw('clusters.id'))
                                ->where('voter_support_status.entity_type', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL')))
                                ->where('voter_support_status.deleted', 0)
                                ->where('support_status.level', '>', 0)
                                ->where('voter_support_status.election_campaign_id', DB::raw('cl.election_campaign_id'));
        $count_supporters = "(".$supportStatusQuery->toSql().") as count_supporters";

        $driverObj = ElectionRoles::select('id')
            ->where('system_name', DB::raw('"' . config('constants.activists.election_role_system_names.driver') . '"'))
            ->first();
        $driverRoleId = $driverObj->id;

        $count_regular_wating = DB::raw('COUNT(CASE WHEN voter_transportations.id IS NOT NULL AND voter_transportations.voter_driver_id IS NULL AND voter_transportations.cripple = 0 THEN 1 END) AS count_regular_wating');
        $count_total_regular = DB::raw('COUNT(CASE WHEN voter_transportations.id IS NOT NULL AND voter_transportations.cripple = 0 THEN 1 END ) AS count_total_regular');
        $count_crippled_wating = DB::raw('COUNT(CASE WHEN voter_transportations.id IS NOT NULL AND voter_transportations.voter_driver_id IS NULL AND voter_transportations.cripple = 1 THEN 1 END) AS count_crippled_wating');
        $count_total_crippled = DB::raw('COUNT(CASE WHEN voter_transportations.id IS NOT NULL AND voter_transportations.cripple = 1 THEN 1 END) AS count_total_crippled');

        $driverFields = [
            'activists_allocations.cluster_id',
            DB::raw('COUNT(election_roles_by_voters.voter_id) AS count_total_drivers'),
            DB::raw('COUNT(CASE WHEN voter_transportations.id IS NULL THEN 1 END) AS count_waiting_drivers')
        ];
        // Build join query for getting number of drivers
        // and number of drivers who wait for allocation
        $joinDriverObj = ActivistAllocationAssignment::select($driverFields)
        
            ->join('election_roles_by_voters' , function($joinOn) use($currentCampaignId, $driverRoleId) {
               $joinOn->on('election_roles_by_voters.id' , '=','activists_allocations_assignments.election_role_by_voter_id')
                   ->on('election_roles_by_voters.election_campaign_id' , '=', DB::raw($currentCampaignId))
                   ->on('election_roles_by_voters.election_role_id', '=', DB::raw($driverRoleId));
            })
            ->join('activists_allocations', 'activists_allocations.id', '=', 'activists_allocations_assignments.activist_allocation_id')
            ->leftJoin('voter_transportations' , function($joinOn) use($currentCampaignId) {
                $joinOn->on('voter_transportations.voter_id' , '=','election_roles_by_voters.voter_id')
                    ->on('voter_transportations.election_campaign_id' , '=', DB::raw($currentCampaignId));
            })
            ->groupBy('election_roles_by_voters.voter_id', 'activists_allocations.cluster_id');

        $previousCampaign = ElectionCampaigns::select('id')
            ->where('id', '<>', $currentCampaignId)->orderBy('id', 'desc')
            ->whereIn('type', [config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'), config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL')])
            ->take(1)
            ->first();
        $previousCampaignId = $previousCampaign->id;

        // Build query for getting the shas votes percent from previous campaign
        $prevCampaignSupportSql = "( SELECT SUM(CASE WHEN election_campaign_party_lists.shas = 1 THEN election_campaign_party_list_votes.votes END ) / ";
        $prevCampaignSupportSql .= "SUM(election_campaign_party_list_votes.votes) FROM clusters AS prev_clusters ";
        $prevCampaignSupportSql .= "JOIN   ballot_boxes AS prev_ballot_boxes ON prev_ballot_boxes.cluster_id = prev_clusters.id ";
        $prevCampaignSupportSql .= "JOIN election_campaign_party_list_votes ON election_campaign_party_list_votes.ballot_box_id = prev_ballot_boxes.id ";
        $prevCampaignSupportSql .= "JOIN election_campaign_party_lists ON election_campaign_party_lists.id = election_campaign_party_list_votes.election_campaign_party_list_id ";
        $prevCampaignSupportSql .= "AND election_campaign_party_lists.election_campaign_id = " . $previousCampaignId;
        $prevCampaignSupportSql .= " AND election_campaign_party_lists.deleted = 0 ";
        $prevCampaignSupportSql .= "WHERE prev_clusters.city_id = clusters.city_id AND prev_clusters.mi_id = clusters.mi_id ";
        $prevCampaignSupportSql .= "AND prev_clusters.election_campaign_id = " . $previousCampaignId;
        $prevCampaignSupportSql .= " GROUP BY prev_clusters.id ) AS prev_supporters_percents";

        $sortDirection = null;
        $sortByField = $request->input('sort_by_field', null);
        $sort_direction = $request->input('sort_direction', null);
        if ( !is_null($sortByField) ) {
            if ( $sort_direction == config('constants.status_change_report.sort_directions.UP') ) {
                $sortDirection = 'asc';
            } else {
                $sortDirection = 'desc';
            }
        }

        $fields = [
            'clusters.id',
            'clusters.key',
            'drivers.count_total_drivers',
            'drivers.count_waiting_drivers',
            'clusters.name as cluster_name',
            'cities.name as city_name',
            'clusters.street',
            DB::raw($prevCampaignSupportSql),
            DB::raw($count_supporters),
            $count_regular_wating,
            $count_total_regular,
            $count_crippled_wating,
            $count_total_crippled
        ];

        $clustersObj = Cluster::select($fields)->setBindings([$supportStatusQuery->getBindings()])
            ->withBallotBoxes()
            ->withCity()
            ->join('voters_in_election_campaigns' , function($joinOn) use($currentCampaignId) {
                $joinOn->on('voters_in_election_campaigns.ballot_box_id' , '=','ballot_boxes.id')
                    ->on('voters_in_election_campaigns.election_campaign_id' , '=', DB::raw($currentCampaignId));
            })
            ->leftJoin('voter_transportations' , function($joinOn) use($currentCampaignId) {
                $joinOn->on('voter_transportations.voter_id' , '=','voters_in_election_campaigns.voter_id')
                    ->on('voter_transportations.election_campaign_id' , '=', DB::raw($currentCampaignId));
            })
            ->leftJoin(DB::raw('(' . $joinDriverObj->toSql() . ') AS drivers'), function($joinOn) {
                $joinOn->on('drivers.cluster_id', '=', 'clusters.id');
            })
            ->where($where)
            ->groupBy('clusters.id');
        if ( !is_null($sortByField) ) {
            $clustersObj->orderBy($sortByField, $sortDirection);
        }
        $clusters = $clustersObj->get();

        $jsonOutput->setData($clusters);
    }

    /**
     * This function returns the
     * selected city's drivers.
     *
     * @param Request $request
     */
    public function getTransportationsCityDrivers(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $cityKey = $request->input('city_key');
        $cityId = City::select('id')->where(['key' => $cityKey, 'deleted' => 0])->first()->id;
        $clusterKey = $request->input('cluster_key');

        $clusterId = null;
        if ( !is_null($clusterKey) ) {
            $clusterId = Cluster::select('id')->where('key', $clusterKey)->first()->id;
        }

        $driversQuery = $this->getDriversData($request, $cityId, $currentCampaignId);
        if ( !is_null($clusterId) ) {
            $driversQuery->where('clusters.id', $clusterId);
        }

        // The query of number of crippled passengers for the driver
        $crippledTransportationsCount = 'COUNT(CASE WHEN voter_transportations.cripple=1 THEN 1 END) AS crippled_transportations_count';

        $fieldsToAdd = [
            'election_roles_by_voters.verified_status',
            'transportation_cars.type',
            'transportation_cars.passenger_count',
            DB::raw($crippledTransportationsCount)
        ];
        $driversQuery->leftJoin('voter_transportations' , function($joinOn) use($currentCampaignId) {
            $joinOn->on('voter_transportations.voter_id' , '=','election_roles_by_voters.voter_id')
                ->on('voter_transportations.election_campaign_id' , '=', DB::raw($currentCampaignId));
            })
            ->addSelect($fieldsToAdd);

        $sortDirection = null;
        $sortByField = $request->input('sort_by_field', null);
        $sort_direction = $request->input('sort_direction', null);
        if ( !is_null($sortByField) ) {
            if ( $sort_direction == config('constants.status_change_report.sort_directions.UP') ) {
                $sortDirection = 'asc';
            } else {
                $sortDirection = 'desc';
            }

            $driversQuery->orderBy($sortByField, $sortDirection);
        }

        $drivers = $driversQuery->get();

        $jsonOutput->setData($drivers);
    }

}