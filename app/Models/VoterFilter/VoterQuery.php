<?php

namespace App\Models\VoterFilter;

use App\Models\ElectionCampaigns;
use App\Models\Area;
use App\Models\User;
use App\Models\Voters;
use App\Models\VotersInGroups;
use App\Models\Tm\Campaign;

use App\Libraries\ListSelectedValuesFunctions;
use App\Libraries\Services\VoterFilterQueryService;
use Illuminate\Support\Facades\DB;

class VoterQuery extends Voters
{
    const WHERE_EQUAL = 0;
    const WHERE_LIKE = 1;
    const WHERE_GREATER_THAN_OR_EQUAL = 2;
    const WHERE_LESS_THAN_OR_EQUAL = 3;
    const WHERE_IN = 4;
    const WHERE_NULL = 5;
    const WHERE_NOT_NULL = 6;
    const WHERE_NOT_EQUAL = 7;
    const WHERE_NOT_IN = 8;

    protected $currentElectionCampaign;

    private $selectedTmCampaignHash = [];
    
    public function scopeFilterItems($query, $filterItems, $filterDefinitions)
    {
        $this->joins['voters'] = true;
        $this->currentElectionCampaign = ElectionCampaigns::currentCampaign()->id;

        foreach ($filterItems as $item) {
            $this->generateFilterItemQuery($query, $filterDefinitions[$item['voter_filter_definition_id']][0], $item);
        }
        //Removed portion query because switched to static voter table for campaign
        // if(!empty($this->selectedTmCampaignHash)){
        //     $this->addTmCampaignsFiltersToQuery($query);
        // }
        // echo $query->toSql(); die;
        return $query;
    }

    /**
     * auto add the relative relations (join/where/aggregates/where_by_value) to the main query from pre-defined objects for each filter.
     */
    private function generateFilterItemQuery($query, $definition, $value)
    {
        $aliasTable = [];
        $foundAllWhereByValue = false;
        // A variable that indicates where building
        // a qoery that contains whereIn + is null
        $whereInWithNull = null;

		$selectedElectionCampaign = '';
		if (isset($value['election_campaign_id'])){
			$selectedElectionCampaign = DB::Raw($value['election_campaign_id']);
		}
		
        $selectedTmCampaign = '';
		if (isset($value['tm_campaign_id'])){
            
            $selectedTmCampaign = $value['tm_campaign_id'];
            $numeric_value = isset($value['numeric_value']) ? $value['numeric_value'] : null;
            $this->checkTmCampaignFilter($selectedTmCampaign, $numeric_value, $definition->name);
        }
        if($definition->name == 'exist_in_campaign'){
  
            return;
        }
        
        if ($definition['join']) { // if there is join object defined for this filter definition.
 
            $joinsData = json_decode($definition['join'], true);

            foreach ($joinsData as $index => $join) { //loop over all tables need to make join for
		 
                $perElectionCampaign = $join['perElectionCampaign'];
                // $value['per_election_campaign'] = $perElectionCampaign;

                // When the defenition is per election campaign, and the same table will be joined many time acording to number of the election campaign
                // so every table should get it's unique alias name, I did that by adding the $index number to the end of the pre-defined alias name.
                $tableParts = explode(" as ", strtolower($join['table']));
                $tableName = $tableParts[0];
                $tableTempAlias = count($tableParts) > 1 ? $tableParts[1] : false;
                $tableAlias = $tableTempAlias ? ($tableTempAlias . ($perElectionCampaign ? ('_' . $index) : '')) : $tableName;

				$joinOn = $join['joinOn'];
                $joinOptions = [];

                if(isset($this->joins[$tableAlias]) && !empty($perElectionCampaign) && $selectedElectionCampaign != ''){ //Check if the join table is from other Election Campaign.
                    $tableTempAlias = !$tableTempAlias ? $tableName : $tableTempAlias;
                    $tableAlias =  $tableAlias . "_$selectedElectionCampaign"; // set Alias for this table for other Campaign.
                }
                $aliasTable[$tableTempAlias] = $tableAlias;

                if (!isset($this->joins[$tableAlias])) { // if the table is already join with this table.
                    $this->joins[$tableAlias] = true;
                    $joinTable = $tableName . ' AS ' . $tableAlias;


                    $joinOptionsWhereIn = [];
                    $joinOptionsWhereNotIn = [];

                    foreach ($joinOn as $joinArray) {
						
                        //generate array of all the joinOn options from the re-defined json.
                        // if the value is dynamic (CURRENT_ELECTION_CAMPAIGN/SELECTED_ELECTION_CAMPAIGN) change the value
                        // if the value is raw data eg. number, round it with DB::Raw function.
                        $joinToValue = $joinArray['to'];
 
                        if ($joinToValue == 'SELECTED_ELECTION_CAMPAIGN' && $selectedElectionCampaign == '') {
                            return;
                        }
						
						
						if ($joinToValue == 'SELECTED_TM_CAMPAIGN'  ) { continue; }
 
                        $joinToValue = ($joinToValue == 'CURRENT_ELECTION_CAMPAIGN') ? DB::Raw($this->currentElectionCampaign) : $joinToValue;
                        $joinToValue = ($joinToValue == 'SELECTED_ELECTION_CAMPAIGN') ? DB::Raw($selectedElectionCampaign) : $joinToValue;

                        if ($joinArray['isRawData']) {
                            $joinTo = DB::Raw($joinToValue);

                            $joinFrom = str_replace($tableTempAlias, $tableAlias, $joinArray['from']);
                            $joinOptions[] = [$joinFrom, $joinArray['condition'], $joinTo];
                        } else {
                            $condition = $joinArray['condition'];
                            if ( $condition != '=' && $condition != '!=' ) {
                                $condition = strtolower(trim($condition));
                            }

                            switch ($condition) {
                                case 'in':
                                    $joinOptionsWhereIn[] = [$joinArray['from'], $joinToValue];
                                    break;

                                case 'not in':
                                    $joinOptionsWhereNotIn[] = [$joinArray['from'], $joinToValue];
                                    break;

                                case '=':
                                case '!=':
                                default:
                                    $joinToTable = explode(".", $joinToValue)[0];
                                    $joinTo = isset($aliasTable[$joinToTable]) ?
                                    str_replace($joinToTable, $aliasTable[$joinToTable], $joinToValue) : $joinToValue;

                                    if($joinToTable == $tableName && !empty($perElectionCampaign) && $selectedElectionCampaign != ''){ //Check if the join table is from other Election Campaign.
                                        $joinToTable =  $joinToTable . "_$selectedElectionCampaign"; // set joinToTable for this table for other Campaign.
                                    }
                                    $joinFrom = str_replace($tableTempAlias, $tableAlias, $joinArray['from']);
                                    $joinOptions[] = [$joinFrom, $joinArray['condition'], $joinTo];
                                    break;

                            }
                        }
                    }

                    if ($join['isLeftJoin']) { // if the join type is left join
                        $query->leftJoin($joinTable, function ($joinVar) use ($joinOptions, $joinOptionsWhereIn, $joinOptionsWhereNotIn) {
                            $joinVar->on($joinOptions);
                            for ( $wherIndex = 0; $wherIndex < count($joinOptionsWhereIn); $wherIndex++) {
                                $joinVar->whereIn($joinOptionsWhereIn[$wherIndex][0], $joinOptionsWhereIn[$wherIndex][1]);
                            }
                            for ( $wherIndex = 0; $wherIndex < count($joinOptionsWhereNotIn); $wherIndex++) {
                                $joinVar->whereIn($joinOptionsWhereNotIn[$wherIndex][0], $joinOptionsWhereNotIn[$wherIndex][1]);
                            }
                        });
                    } else {
                        $query->join($joinTable, function ($joinVar) use ($joinOptions,  $joinOptionsWhereIn, $joinOptionsWhereNotIn) {
                            $joinVar->on($joinOptions);
                            for ( $wherIndex = 0; $wherIndex < count($joinOptionsWhereIn); $wherIndex++) {
                                $joinVar->whereIn($joinOptionsWhereIn[$wherIndex][0], $joinOptionsWhereIn[$wherIndex][1]);
                            }
                            for ( $wherIndex = 0; $wherIndex < count($joinOptionsWhereNotIn); $wherIndex++) {
                                $joinVar->whereIn($joinOptionsWhereNotIn[$wherIndex][0], $joinOptionsWhereNotIn[$wherIndex][1]);
                            }
                        });
                    }
					foreach ($join['addSelect'] as $addSelect) {
						// if there is any columns related to this join need to be seleced in the query
                        //and will be used in the aggregate configuration ..

                        $addSelectCol = str_replace($tableTempAlias, $tableAlias, $addSelect);

                        if(!empty($perElectionCampaign) && $selectedElectionCampaign != ''){ //Add alias to col by Election Campaign.
                            $addSelectName= explode('.',$addSelect)[0];
                            $addSelectCol .= " as $addSelectName". "_" . $selectedElectionCampaign;
                        }
						$query->addSelect(DB::Raw($addSelectCol));
					}
                }
            }
            
            if ($definition['where_by_value']) {
            
                //if there is where condition related to this definition, add the where acording to the definition selected value.
                // if the value is dynamic (CURRENT_ELECTION_CAMPAIGN/SELECTED_ELECTION_CAMPAIGN) change the value
                $selectedValue = '';
                $whereByValueArray = json_decode($definition['where_by_value'], true);
                $whereByValueTotalCount = count($whereByValueArray);
                if (is_array($whereByValueArray))
                if (isset($value['numeric_value'])) {
                    $whereByValueSelectedCount = 1;
                    $selectedValue = $value['numeric_value'];
                    if (isset($whereByValueArray[$selectedValue])) $whereOptions = $whereByValueArray[$selectedValue];
                    else $whereOptions = array();
                }else {
                    $selectedValues = $value['values'];
                    $whereByValueSelectedCount = count($selectedValues);
                    $whereOptions = array();
                    foreach($selectedValues as $selectedValue) {
                        if (isset($whereByValueArray[$selectedValue])) $whereOptions[] = $whereByValueArray[$selectedValue][0];
                    }
                }
                $whereByValueFoundCount = 0;
                foreach ($whereOptions as $whereByValue) {

                    if ($whereByValue['on'] == 'SELECTED_ELECTION_CAMPAIGN' && $selectedElectionCampaign == '') {
                        return;
                    }

                    $conditionRightSide = ($whereByValue['on'] == 'SELECTED_ELECTION_CAMPAIGN') ? $selectedElectionCampaign : $whereByValue['on'];
                    $conditionRightSide = ($whereByValue['on'] == 'CURRENT_ELECTION_CAMPAIGN') ? $this->currentElectionCampaign : $conditionRightSide;
                    $conditionRightSide = ($whereByValue['isRawData']) ? DB::Raw($conditionRightSide) : $conditionRightSide;

                    // A case when choosing values from list
                    // that has condition is null or not is null
                    if ( $definition['where_type'] != VoterQuery::WHERE_IN ) {
                        $query->whereRaw(str_replace($tableTempAlias, $tableAlias, $whereByValue['field']) . " " . $whereByValue['condition'] . " " . $conditionRightSide);
                        $whereByValueFoundCount++;
                    } else {
                        $whereInWithNull = str_replace($tableTempAlias, $tableAlias, $whereByValue['field']) . " " . $whereByValue['condition'] . " " . $conditionRightSide;
                    }
                }
                if ($whereByValueFoundCount ==  $whereByValueSelectedCount) $foundAllWhereByValue = true;
            }
        }
		else{
			 
				$tableTempAlias = '';
				$tableAlias = '';
                if ($definition['where_by_value']) {
				 
                    //if there is where condition related to this definition, add the where acording to the definition selected value.
                    // if the value is dynamic (CURRENT_ELECTION_CAMPAIGN/SELECTED_ELECTION_CAMPAIGN) change the value
                    $selectedValue = '';
                    $whereByValueArray = json_decode($definition['where_by_value'], true);
                    $whereByValueTotalCount = count($whereByValueArray);
					$whereOptions = [];
					$whereByValueFoundCount = 0;
					$whereByValueSelectedCount = 0;
                    if (is_array($whereByValueArray))
						
                    if (isset($value['numeric_value'])) {
					 
                        $whereByValueSelectedCount = 1;
                        $selectedValue = $value['numeric_value'];
                        if (isset($whereByValueArray[$selectedValue])) $whereOptions = $whereByValueArray[$selectedValue];
                        else $whereOptions = array();
 
                    }else {
                        $selectedValues = $value['values'];
                        $whereByValueSelectedCount = count($selectedValues);
                        $whereOptions = array();
                        foreach($selectedValues as $selectedValue) {
                           if (isset($whereByValueArray[$selectedValue])) $whereOptions[] = $whereByValueArray[$selectedValue][0];
                        }
                    }
					 
                    $whereByValueFoundCount = 0;
                    foreach ($whereOptions as $whereByValue) {

                        if ($whereByValue['on'] == 'SELECTED_ELECTION_CAMPAIGN' && $selectedElectionCampaign == '') {
                            return;
                        }
				 
						if(strpos($whereByValue['on'] ,'SELECTED_TM_CAMPAIGN') !== false){
							if ($selectedTmCampaign == '') {
								$conditionRightSide = str_replace('SELECTED_TM_CAMPAIGN' , 'campaign_id', $whereByValue['on']);
							}else{
								$conditionRightSide = str_replace('SELECTED_TM_CAMPAIGN' , DB::raw($selectedTmCampaign), $whereByValue['on']);
                            }
						}
						else{
							$conditionRightSide = ($whereByValue['on'] == 'SELECTED_ELECTION_CAMPAIGN') ? $selectedElectionCampaign : $whereByValue['on'];
							$conditionRightSide = ($whereByValue['on'] == 'CURRENT_ELECTION_CAMPAIGN') ? $this->currentElectionCampaign : $conditionRightSide;
                        }
						$conditionRightSide = ($whereByValue['isRawData']) ? DB::Raw($conditionRightSide) : $conditionRightSide;

                        if ( $definition['where_type'] != VoterQuery::WHERE_IN ) {
                            $query->whereRaw(str_replace($tableTempAlias, $tableAlias, $whereByValue['field']) . " " . $whereByValue['condition'] . " " . $conditionRightSide);
                            $whereByValueFoundCount++;
                        } else {
                            $whereInWithNull = str_replace($tableTempAlias, $tableAlias, $whereByValue['field']) . " " . $whereByValue['condition'] . " " . $conditionRightSide;
                        }
                    }
                    if ($whereByValueFoundCount ==  $whereByValueSelectedCount) $foundAllWhereByValue = true;
                }
			
		}
 
        if ($definition['aggregates']) {
            $aggregate = json_decode($definition['aggregates'], true)[$value['numeric_value']];
            if(is_array($aggregate) && array_key_exists('agg' , $aggregate)){
				if ($aggregate['agg'] == 'having') {
					$conditionRightSide = ($aggregate['isRawData']) ? DB::Raw($aggregate['on']) : $aggregate['on'];
					$query->havingRaw($aggregate['field'] . ' ' . $aggregate['condition'] . ' ' . $conditionRightSide);
				}
			}
        }

        //if there is field defined, get the value according to the definition type
        if ($definition['field'] && !$foundAllWhereByValue) {
			
            $field = $definition['field'];
            $fieldTableName = explode('.', $field)[0];

            if (isset($aliasTable[$fieldTableName])) {
                $field = str_replace($fieldTableName, $aliasTable[$fieldTableName], $field);
            }

            $fieldValue = '';
            $values = !empty($value['values']) ? $value['values'] : [];
            if(isset($definition['selected_values_function']) ){
                $functionName = $definition['selected_values_function'];
                $values = ListSelectedValuesFunctions::$functionName($query, $value['values'] , $value);
				
            }

            switch ($definition['type']) {
                case 'text':
                case 'number':
                    $fieldValue = $value['string_value'];
                    break;
                case 'bool':
                    $fieldValue = $value['numeric_value'];
                    break;
                case 'list':
 
                    $fieldValue = $definition['multiselect'] ? $values : $value['numeric_value'];
                    break;
                case 'time':
                    $fieldValue = $value['time_value'];
                    break;
                case 'date':
                    $fieldValue = $value['date_value'];
                    break;
            }

            switch ($definition['name']) {
                case 'current_logged_in_users':
                    $fieldValue = User::getOnlineUsersIds();
					if(!$value['numeric_value']){ //if search all NOT logged-in users
						$notLoggedInUsers = User::select('id')->where(['deleted'=>0 , 'active'=>1])->get();
						$notLoggedInUsersIDS = [];
						foreach( $notLoggedInUsers as $user){
							$notLoggedInUsersIDS[] = $user->id;
						}
						$fieldValue = $notLoggedInUsersIDS;
					}
					
                    break;
            }

            //select the correct where function, acording to the where type
            //and generate the query using selected value.

            switch ($definition['where_type']) {
                case VoterQuery::WHERE_EQUAL:
                    if ($fieldValue === -1) {
                        $query->whereNull($field);
                    } elseif ($definition['type'] === 'time' || $definition['type'] === 'date') {
                        $query->where(DB::Raw($field), '=', $fieldValue);
                    } else {
                        $query->where($field, '=', $fieldValue);
                    }
                    break;
                case VoterQuery::WHERE_LIKE:
                    $query->where($field, 'LIKE', $fieldValue);
                    break;
                case VoterQuery::WHERE_GREATER_THAN_OR_EQUAL:
                    $query->where(DB::Raw($field), '>=', $fieldValue);
                    break;
                case VoterQuery::WHERE_LESS_THAN_OR_EQUAL:
                    $query->where(DB::Raw($field), '<=', $fieldValue);
                    break;
                case VoterQuery::WHERE_IN:
					if($definition['name'] != 'tm_call_status'){
						if ( is_null($whereInWithNull) ) {
							$query->whereIn($field, $fieldValue);
						
						} else {
							$query->where( function($qr) use ($field, $fieldValue, $whereInWithNull) {
								$qr->whereIn($field, $fieldValue)
									->orWhereRaw($whereInWithNull);
							});
				 
						}
                    }
                break;
                case VoterQuery::WHERE_NOT_IN:
                    $query->where( function($qr) use ($field, $fieldValue, $definition) {
                        $qr->whereNotExists(function($q) use ($field, $fieldValue){
                            $q->select(DB::raw(1))
                            ->from('voters_in_groups')  //? Need get the table from "definition"
                            ->whereIn($field, $fieldValue)
                            ->whereRaw('voters_in_groups.voter_id = voters.id');
                        })
                        ->orWhereNull($definition['field']);
                    });

                    break;
                case VoterQuery::WHERE_NULL:
                    $query->whereNull($field);
                    break;
                case VoterQuery::WHERE_NOT_NULL:
                    $query->whereNotNull($field);
                    break;
                case VoterQuery::WHERE_NOT_EQUAL:
                    $query->where($field, '!=', $fieldValue);
                    break;
            }
        }
  
        switch ($definition['name']) {
            case 'email_block':
                $query->addSelect('voters.contact_via_email');
                break;
            case 'email_exists':
                $query->addSelect('voters.email');
                break;
        }

    }

    public function scopeGeoItems($query, $geographicFilters)
    {
        //set where group array
        $whereGroup = [];
        foreach ($geographicFilters as $geographicFilter) {
            if ($geographicFilter['active'] && ($geographicFilter['entity_id'] > 0)) {
                switch (GeographicVoterFilter::ENTITY_TYPES[$geographicFilter['entity_type']]['type_id']) {
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'): //Add area group filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'));
                        array_push($whereGroup, ['areas_groups.id' => $geographicFilter->entity_id]);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'): //Add area filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_AREA'));
                        array_push($whereGroup, ['areas.id' => $geographicFilter['entity_id']]);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'): //Add sub_area filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'));
                        array_push($whereGroup, ['sub_areas.id' => $geographicFilter['entity_id']]);
                        break;
                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'): //Add city filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_CITY'));
                        array_push($whereGroup, ['cities.id' => $geographicFilter['entity_id']]);
                        break;

                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'): //Add neighborhood filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD'));
                        array_push($whereGroup, ['neighborhoods.id' => $geographicFilter['entity_id']]);
                        break;

                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'): //Add cluster filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_CLUSTER'));
                        array_push($whereGroup, ['clusters.id' => $geographicFilter['entity_id']]);
                        break;

                    case config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'): //Add ballot box filter
                        $query->geoEntity(config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'));
                        array_push($whereGroup, ['ballot_boxes.id' => $geographicFilter['entity_id']]);
                        break;

                    default:
                        break;
                }
            }
        }

        //loop and generate where group
        $query->where(function($whereQuery) use($whereGroup) {
             foreach($whereGroup as $where) {
                foreach ($where as $key => $value) {
                    $whereQuery->orWhere($key, $value);
                }
            }
        });

        return $query;
    }

    /**
     * @method checkTmCampaignFilter
     * - Check current selecetd campaign not defined calls voters filters.
     * -> Check for each voter filter definition.
     * -> according to definition name, and value.
     * 
     * @param [int] $campaignId - campaign selected id.
     * @param [int] $numeric_value - seleted field value
     * @param [string] $definitionName - definition name
     * @return void
     * - set campaign data in global hash obj.
     */
    private function checkTmCampaignFilter($campaignId, $numeric_value, $definitionName){
        if(!array_key_exists($campaignId, $this->selectedTmCampaignHash)){
            $this->selectedTmCampaignHash[$campaignId] = ['get_filters' => null , 'exist_in_campaign' => true];
        }

        $get_filters = $this->selectedTmCampaignHash[$campaignId]['get_filters'];
        $exist_in_campaign = $this->selectedTmCampaignHash[$campaignId]['exist_in_campaign'];

        // Not check in campign voter filters:
        if($definitionName == 'tm_call_status' || $definitionName == 'tm_questionaire_answered'){
            $get_filters = false;
        }
        
        $definedCallsFilters = (!$get_filters && !is_null($get_filters));

        // Need to check in campign voter filters:
        if($definitionName == 'tm_call_performed' || $definitionName == 'finished_voters_in_campaigns'){
           if($numeric_value == 0 && !$definedCallsFilters){
                $get_filters = true;
           } else {
                $get_filters = false;
           }
        }
        if( $definitionName == 'exist_in_campaign' && !$definedCallsFilters){
            $exist_in_campaign = $numeric_value == 1;
            $get_filters = true;
        }
        $this->selectedTmCampaignHash[$campaignId] = [
                'get_filters' => $get_filters,
                'exist_in_campaign' =>$exist_in_campaign
        ];
    }
    /**
     * addTmCampaignsFiltersToQuery
     * Going throw all campaigns hash.
     * -> Check which campaign need to add portions to query.
     * @param [Model] $query - query builder.
     * @return void
     */
    private function addTmCampaignsFiltersToQuery(&$query){
        foreach ($this->selectedTmCampaignHash as $campaignId => $currentTmCampaign) {
            if($currentTmCampaign['get_filters']){
                $this->addTmCampaignFilters($query, $campaignId, $currentTmCampaign['exist_in_campaign']);
            }
          
        }
    }
    /**
     * @method addTmCampaignFilters
     * Add campaign portions, voter filters, to query.
     * @param [Model] $query - query builder.
     * @param [int] $campaignId - campaign id.
     * @param [bool] $exist_in_campaign - get all voters that exist in campign portions or not exist.
     * 
     * @return void
     * -> Add voters filters to query.
     */
    private function addTmCampaignFilters(&$query, $campaignId, $exist_in_campaign){
        $campaignVoterFilters = Campaign::select('id')->where('id', $campaignId)->first()->portions;;
        $filterQueryList = [];
        foreach ($campaignVoterFilters as $voterFilter) {
            $voterFilterQuery = VoterFilterQueryService::generateVoterFilterQuery($voterFilter, null, false, true);
            if ($voterFilterQuery) {
                $filterQuery = DB::table(DB::Raw('( '.$voterFilterQuery->toSql().' ) AS a'))
                    ->select("a.id")->setBindings([$voterFilterQuery->getBindings()]);
                $filterQueryList[] = $filterQuery;
            }
        }
        $query->where(function($q) use ($filterQueryList, $exist_in_campaign){
            foreach ($filterQueryList as $i => $filterQuery) {
                if($exist_in_campaign){ // Check if voters exist in portions
                    $q->orWhereIn('voters.id', $filterQuery);
                }else{ // Not exist in portions
                    $q->whereNotIn('voters.id', $filterQuery);
                }
            }
        });
    }

    public function scopeWithTelemarketingVoterPhones($query, $campaignId) {
        $query->leftJoin('telemarketing_voter_phones', function($query2) use ($campaignId) {
            $query2->on('voters.id', '=', 'telemarketing_voter_phones.voter_id')
                    ->on('telemarketing_voter_phones.campaign_id', '=', DB::raw($campaignId));
        });
    }
}
