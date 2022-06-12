<?php

namespace App\Repositories;

use App\Enums\RequestTopicSystemName;
use App\Models\City;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use DB;
use Exception;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Request;

class RequestTopicsRepository
{
    public static function getParentTopicTeamHandlerId(RequestTopic $requestTopic)
    {
        if (is_null($requestTopic->parent_id))
            return null;

        $parentTopic = RequestTopicUsers::select()->where('request_topic_id', $requestTopic->parent_id)->first();
        return $parentTopic ? $parentTopic->team_handler_id : null;
    }

    /**
     * @throws Exception
     * @return RequestTopic
     */
    public static function getById(int $topicId, $isSubTopic = false)
    {
        $requestTopic = RequestTopic::select()->where('id', $topicId)->first();
        if (!$requestTopic)
            if (!$isSubTopic)
                throw new Exception(config('errors.crm.REQUEST_TOPIC_NOT_EXISTS'));
            else
                throw new Exception(config('errors.crm.REQUEST_SUB_TOPIC_NOT_EXISTS'));

        return $requestTopic;
    }

    public static function getByIdAndParentTopicDetails(int $topicId, $isSubTopic = false)
    {
        $requestTopic = RequestTopic::select([
            'request_topics.id',
            'request_topics.name',
            'request_topics.parent_id',
            'request_topics.system_name',
            DB::raw('parent_request_topics.name as parent_name'),
            DB::raw('parent_request_topics.system_name as parent_system_name')
        ])
            ->leftJoin('request_topics as parent_request_topics', 'parent_request_topics.id', '=', 'request_topics.parent_id')
            ->where('request_topics.id', $topicId)
            ->first();
        if (!$requestTopic)
            if (!$isSubTopic)
                throw new Exception(config('errors.crm.REQUEST_TOPIC_NOT_EXISTS'));
            else
                throw new Exception(config('errors.crm.REQUEST_SUB_TOPIC_NOT_EXISTS'));
                
        return $requestTopic;
    }

    /**
     * @throws Exception
     * @return string
     */
    public static function getNameById(int $topicId)
    {
        $requestTopic = self::getById($topicId);
        return $requestTopic->name;
    }

    public static function getAllParentTopics($arrayField = false)
    {
        return RequestTopic::select($arrayField ? $arrayField : DB::raw('request_topics.*'))
            ->where(function ($q) {
                $q->whereNull('parent_id')
                    ->orWhere('parent_id', DB::raw(0));
            })
            ->get();
    }

    public static function getAllSubTopicsByArrParentId($arrParentTopicId, $arrayField = false)
    {
        return RequestTopic::select($arrayField ? $arrayField : DB::raw('request_topics.*'))
        ->WhereIn('parent_id', $arrParentTopicId)
            ->get();
    }

    public static function getAll()
    {
        return RequestTopic::select([
            'request_topics.id',
            'name',
            'topic_order',
            'system_name',
            'parent_id',
            'target_close_days',
            'default_request_status_id'
        ])->get();
    }

    /**
     * Get request topic id and return default team and handler id
     *
     * @param int $requestTopicUsersId
     * @param int|null $cityId
     * @return RequestTopicUsers
     */
    public static function  getRequestTopicsUserByIdAndCityId($requestTopicId, $cityId = null)
    {
        return RequestTopicUsers::select([
            'request_topic_id', 
            'user_handler_id',
            'team_handler_id',
            DB::raw('teams.name as team_name'),
            DB::raw("concat (voter_handler.first_name,' ',voter_handler.last_name) as user_handler_name")

        ])
            ->leftJoin('users', 'users.id', 'request_topics_by_users.user_handler_id')
            ->leftJoin('voters as voter_handler', 'voter_handler.id', 'users.voter_id')
            ->leftJoin('teams', 'teams.id', 'request_topics_by_users.team_handler_id')
            ->where('request_topic_id', $requestTopicId)
            ->where(function ($q) use ($cityId) {
                $q->where('request_topics_by_users.city_id', $cityId)
                    ->orWhereNull('request_topics_by_users.city_id');
            })
            ->orderBy('request_topics_by_users.city_id', 'desc')
            ->first();
    }



    public static function getDefaultTeamAndHandlerUserBySubTopic($subTopicId, $cityId = null)
    {
        $subTopicHandler = self::getRequestTopicsUserByIdAndCityId($subTopicId, $cityId);
        $parentTopicHandler = null;
        $user_handler_id = null;
        $user_handler_name = null;
        $team_handler_id = null;
        $team_handler_name = null;

        if ($subTopicHandler) {
            $user_handler_id = $subTopicHandler->user_handler_id;
            $user_handler_name = $subTopicHandler->user_handler_name;
            $team_handler_id = $subTopicHandler->team_handler_id;
            $team_handler_name = $subTopicHandler->team_name;
        }

        if (!$subTopicHandler || $team_handler_id == null) {
            $supTopicAndParentDetails = self::getByIdAndParentTopicDetails($subTopicId, $cityId);
            if ($supTopicAndParentDetails && $supTopicAndParentDetails->parent_system_name == RequestTopicSystemName::MUNICIPALLY) {
                if ($cityId) {
                    $city = CityRepository::getById($cityId);
                    $team_handler_id = $city->team_handler_id;
                    $team_handler_name = $city->team_name;
                } else {
                    $parentTopicHandler = self::getRequestTopicsUserByIdAndCityId($supTopicAndParentDetails->parent_id, $cityId);
                    $team_handler_id = $parentTopicHandler->team_handler_id;
                    $team_handler_name = $parentTopicHandler->team_name;
                    if ($user_handler_id == null) {
                        $user_handler_id = $parentTopicHandler->user_handler_id;
                        $user_handler_name = $parentTopicHandler->user_handler_name;
                    }
                }
            }
        }

        if (!$team_handler_id) {
            return TeamRepository::getDefaultTeamCrmRequestIncludeUserLeaderDetailsById();
        }

        else if ($team_handler_id && $user_handler_id == null) {
            $teamLeaderDetails = TeamRepository::getUserLeaderIdAndNameById($team_handler_id);
            $user_handler_id = $teamLeaderDetails->id;
            $user_handler_name = $teamLeaderDetails->name;
        }

        return [
            'team' => ['id' => $team_handler_id, 'name' => $team_handler_name],
            'user_handler' => ['id' => $user_handler_id, 'name' => $user_handler_name],
        ];
    }

}
