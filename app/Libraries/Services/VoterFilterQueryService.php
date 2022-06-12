<?php

namespace App\Libraries\Services;

use App\Models\VoterFilter\VoterFilterDefinition;
use App\Models\VoterFilter\VoterQuery;
use Illuminate\Support\Facades\DB;

class VoterFilterQueryService
{
    public static function getQuery($data , $reportType = null , $isCombinedReport=false){

        if (!isset($data['filter_items']) && !isset($data['geo_items'])) {
            return false;
        }

        $filterItems=[];
        $geoItems=[];

        if(isset($data['filter_items'])){
            foreach ($data['filter_items'] as $value) {
                $filterItems[]=is_string($value)? json_decode($value,true) : $value;
            }
        }

        if(isset($data['geo_items'])){
            foreach ($data['geo_items'] as $value) {
                $geoItems[]=is_string($value)? json_decode($value,true) : $value;
            }
        }

        $data['filter_items']=$filterItems;
        $data['geo_items']=$geoItems;
        $data['active']=true;
        return self::generateVoterFilterQuery($data, $reportType, $isCombinedReport);
    }

    public static function generateVoterFilterQuery($voterFilter , $reportType = null , $isCombinedReport = false, $onlyActiveFilters = null, $isService = false)
    {
		 
        $filterDefinitions = VoterFilterDefinition::get()
            ->groupBy('id')
            ->makeVisible(['model', 'model_list_function', 'model_list_dependency_id','selected_values_function', 'join', 'constrains', 'where_type', 'field'])
            ->each(function ($row) {
                $row[0]->setHidden(['values']);
            });
 
        $query = null;

        //only if "onlyActiveFilters" -> check if filter is active:
        $isFilterActive = $onlyActiveFilters ? $voterFilter['active'] : true;

        //if the filter is active and there is filters already exists...
        if ($isFilterActive && (count($voterFilter['geo_items']) || count($voterFilter['filter_items']))) {
            $query = VoterQuery::withFilters(null, $isService)
                ->geoItems($voterFilter['geo_items'])
                ->filterItems($voterFilter['filter_items'], $filterDefinitions);

            // Get bulder columns - add col 'id' if not exist.
            $columns = $query->getQuery()->columns;
            if(is_null($columns)){ $query->select('voters.id');  }
            else{$query->addSelect('voters.id');} 
            // dump($columns);
            if(!$isCombinedReport){	$query = $query->groupBy('voters.id'); }
        }
		 
		
        return $query;
    }

    public static function generateVoterFilterQueryWithVoterId($voterFilter)
    {
        $filterDefinitions=VoterFilterDefinition::get()
        ->groupBy('id')
        ->makeVisible(['model', 'model_list_function', 'model_list_dependency_id','selected_values_function', 'join', 'constrains', 'where_type', 'field'])
        ->each(function ($row) {
            $row[0]->setHidden(['values']);
        });
        
        $query=null;

        //if the filter is active or there is filters already exists...
        if ($voterFilter['active'] && (count($voterFilter['geo_items']) || count($voterFilter['filter_items']))) {
            $query=VoterQuery::select('voters.id')
            ->withFilters()
            ->geoItems($voterFilter['geo_items'])
            ->filterItems($voterFilter['filter_items'], $filterDefinitions)
            ->groupBy('voters.id');
        }
        return $query;
    }

    public static function getCountVoters($voterFilter)
    {   
        $count = 0;
        $filterQuery = self::generateVoterFilterQuery($voterFilter);
        if($filterQuery){
            $count = self::getCountFromQuery($filterQuery);
        }
        return $count;
    }
    
    public static function getCountFromQuery($query)
    {
        $bindings=$query->getBindings();
		return DB::table(DB::Raw('( '.$query->toSql().' ) AS a'))->select(DB::Raw("COUNT(*) AS count"))->setBindings([$bindings])->first()->count;
    }
	
	public static function getSumsFromCombinedQuery($query , $combineBy = '', $combineBySupportStatus = false)
    {
		$bindings = $query->getBindings();

        $fullQuery = $query->toSql();
		if($combineBySupportStatus || in_array($combineBy , ['election_roles' , 'institution_name'])){
            $fullQuery = str_replace("group by `combine_id`" , "" ,$fullQuery);
		}
        $sumQuery = DB::table(DB::Raw('( '. $fullQuery .' ) AS a'))
        ->setBindings([$bindings]);

        if(!$combineBySupportStatus){
            $sumQuery->select(DB::Raw("sum(voters_count) AS sum_voters_count , sum(households_count) as sum_households_count"));
        }
        return $sumQuery->first();
    }

    public static function getVoters($voterFilter)
    {
        return self::generateVoterFilterQuery($voterFilter)->get();
    }
}
