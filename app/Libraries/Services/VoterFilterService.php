<?php

namespace App\Libraries\Services;

use App\Libraries\Services\UserLogin\AuthService;
use App\Models\VoterFilter\VoterFilter;
use App\Models\VoterFilter\VoterFilterGroup;
use App\Models\Tm\Campaign;
use DB;
use Log;

class VoterFilterService
{
    public static function updateFilterItemsByType($apiPayload, VoterFilter $voterFilter, $groupKey)
    {
        $updatedItemIds = [];
        $group = VoterFilterGroup::
            with(['sub_groups' => function ($query) {
            $query->select(['id', 'parent_id']);
        }, 'sub_groups.definitions'])
            ->where('key', $groupKey)
            ->first();

        foreach ($apiPayload as $item) {
            $filterItem = $voterFilter->voter_filter_items()->firstOrNew(['id' => (isset($item['id']) ? $item['id'] : null)]);
            $filterItem->fill(collect($item)->toArray());
            $voterFilter->voter_filter_items()->save($filterItem);
            $updatedItemIds[] = $filterItem['id'];
        }

        //get group definition ids ...
        foreach ($group->sub_groups as $subGroup) {
            $subGroupDef = $subGroup['definitions'];
            foreach ($subGroupDef as $definition) {
                if (!in_array($definition['id'], $updatedItemIds)) {
                    $groupDefinitionIds[] = $definition['id'];
                }
            }
        }

        // where defId in the group and itemId not in updatedItemIds
        $voterFilter->voter_filter_items()->whereIn('voter_filter_definition_id', $groupDefinitionIds)->whereNotIn('id', $updatedItemIds)->delete();
    }

    public static function updateFilterItems($apiPayload, VoterFilter $voterFilter)
    {
        $updatedItemIds = [];
        foreach ($apiPayload as $item) {
            $filterItem = $voterFilter->voter_filter_items()->firstOrNew(['id' => (isset($item['id']) ? $item['id'] : null)]);
            $filterItem->fill(collect($item)->toArray());
            $voterFilter->voter_filter_items()->save($filterItem);
            $updatedItemIds[] = $filterItem['id'];
        }

        // where defId in the group and itemId not in updatedItemIds
        $voterFilter->voter_filter_items()->whereNotIn('id', $updatedItemIds)->delete();
    }
    public static function copyFiltersItems($voterFilterItems, VoterFilter $voterFilter, $filterType)
    {
        foreach ($voterFilterItems as $item) {
            $item->id = null;
            if ($filterType === 'geo_item') {
                $factory = $voterFilter->geo_items();
            } else {
                $factory = $voterFilter->voter_filter_items();
            }
            $filterItem = $factory->create($item->toArray());
            $result = $filterItem->save();
        }
    }

  
    public static function getFilterDefinitions($moduleName)
    {
        $selectGroupArray = array(
            'voter_filter_groups.id',
            'voter_filter_groups.key',
            'voter_filter_groups.label',
            'voter_filter_groups.order',
            'voter_filter_groups.parent_id',
            'voter_filter_groups.per_election_campaign',
            'voter_filter_groups.combined_definitions',
        );
        $isAdmin = AuthService::isAdmin() ? 1 : 0;

        if (!array_key_exists($moduleName, VoterFilter::ENTITY_TYPES)) {
            die;
        }

        return VoterFilterGroup::select($selectGroupArray)
            ->inModule(VoterFilter::ENTITY_TYPES[$moduleName]['type_id'])
            ->with(['sub_groups' => function ($query) use ($selectGroupArray) {
                $query->select($selectGroupArray)
                    ->orderBy('order');
            }])
            ->with(['sub_groups.definitions' => function ($query) {
                $query->where('active', 1)->orderBy('order');
            }])
            ->where(function ($q) use ($isAdmin) {
                $q->where('only_admin', DB::raw($isAdmin))
                    ->orWhere('only_admin', DB::raw(0));
            })
            ->orderBy('order')
            ->get();
    }

    public static function massUpdate($apiPayload)
    {
        $return = collect([]);
        foreach ($apiPayload as $item) {
            $vf = VoterFilter::findByKey($item['key']);
            $vf->update($item);
            $return->push($vf);
        }
        return $return->sortBy('order')->values()->all();
    }

    public static function getCountVoters($voterFilter)
    {
        $countVoters = VoterFilterQueryService::getCountVoters($voterFilter);
        if ($voterFilter['key']) {
            $vf = VoterFilter::findByKey($voterFilter['key']);
            $vf->voters_count = $countVoters;
            $vf->save();
        }
        return $countVoters;
    }
    public static function checkIfCanEditPortion($campaign, $portionIdList){
        $current_portion_id = $campaign->current_portion_id;
        if(!$current_portion_id){ return true; } // If campaign not start.

        $allowEdit = false;

        foreach ($campaign->portions as $portion) {

            if($portion->id == $current_portion_id){ //If current portion is before portions List - allow to edit!
                $allowEdit = true; break;
            }
            if(in_array($portion->id, $portionIdList) ){ //If even one portions List is before current portion - not allow to edit!
                $allowEdit = false; break;
            }
        }
        return $allowEdit;

    }
}
