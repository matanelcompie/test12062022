<?php

namespace App\Libraries\Services;

use Illuminate\Support\Facades\DB;
use App\Models\Tm\Campaign;
use App\Models\VoterFilter\VoterQuery;
use App\Models\VoterFilter\VoterFilter;
use App\Models\VoterFilter\VoterFilterDefinition;
use App\Libraries\Services\VoterFilterQueryService;

class FilterUniqueVotersService
{
    /**
     * calculate unique for current voter filter (usuing the previus order filters ...)
     * 
     * @$voterFilter: current voter filter model object
     * update the database with th number of unique voters for this filter
     * @return: number of unique voters for this filter
     */
    public static function calculateUniqueVotersCountPerVoterFilter($voterFilter)
    { 
        $filterEntityType = $voterFilter->entity_type;
        $filterEntityId = $voterFilter->entity_id;
        $filterId = $voterFilter->id;
 
        $campaignVoterFilters = VoterFilter::where(['entity_type'=>$filterEntityType,'entity_id'=>$filterEntityId])->orderBy('order')->get();
        $relatedFiltersList = [];
        $uniqueVotersCount = 0;

        $generatedVoterFilterQuery = null;

        if($voterFilter->active){ // Calculate voter filter only if it is active!
			
            foreach ($campaignVoterFilters as $key => $filter) {
                if ($filter->id == $filterId) {
                    break;
                }
				 
                $relatedFiltersList[] = $filter;
            }
			 
            $filterQueryList = [];
            $generatedVoterFilterQuery = VoterFilterQueryService::generateVoterFilterQuery($filter, null, false, true);
			if($generatedVoterFilterQuery){ 
				 
                foreach ($relatedFiltersList as $index => $tempFilter) {
                    $voterFilterQuery = VoterFilterQueryService::generateVoterFilterQuery($tempFilter, null, false, true);
               
					if($voterFilterQuery){
						 
                       // $generatedVoterFilterQuery->whereNotIn('voters.id', DB::table(DB::Raw('( '. $voterFilterQuery->toSql() ." ) AS a"))
                        //->select("a.id")->setBindings([$voterFilterQuery->getBindings()]));
                    }
                }
                $uniqueVotersCount = self::getQueryVotersCount($generatedVoterFilterQuery);
            }
        }
        self::updateVoterFiltersUniqueVotersCount($voterFilter, $uniqueVotersCount);

        return $uniqueVotersCount;
    }

    public static function calculateUniqueVotersCountPerCampaign($campaignKey)
    {
        $campaignVoterFilters=self::getCampaignVoterFilters($campaignKey);
        $voterFilterQueries;
        
        foreach ($campaignVoterFilters as $voterFilter) {
            $voterFilterQuery = VoterFilterQueryService::generateVoterFilterQuery($voterFilter, null, false, true);
            $uniqueVotersCount = 0;
            if ($voterFilterQuery) {
                if ($voterFilterQueries) {
                    $voterFilterQuery->whereNotIn('voters.id', DB::table(DB::Raw('( '.$voterFilterQueries->toSql().' ) AS a'))->select("a.id")->setBindings([$voterFilterQueries->getBindings()]));
                }
                $voterFilterQueries = $voterFilterQuery;
               
                 $uniqueVotersCount = self::getQueryVotersCount($voterFilterQuery);
            }
            self::updateVoterFiltersUniqueVotersCount($voterFilter, $uniqueVotersCount);
        }
    }

    private static function getCampaignVoterFilters($campaignKey)
    {
        return Campaign::findByKey($campaignKey)->portions;
    }


    private static function getQueryVotersCount($query)
    {
        $bindings = $query->getBindings();
        return DB::table(DB::Raw('( '.$query->toSql().' ) AS b'))->select(DB::Raw("  COUNT(DISTINCT b.id) AS count"))->setBindings([$bindings])->first()->count;
    }

    private static function updateVoterFiltersUniqueVotersCount($voterFilter, $uniqueVotersCount)
    {
        $voterFilter->unique_voters_count = $uniqueVotersCount;
        $voterFilter->save();
    }
}
