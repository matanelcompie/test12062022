<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\SupportStatus;
use App\Models\Languages;
use App\Models\Tm\CtiPermission;
use App\Models\Tm\SipServer;
use Illuminate\Http\Request;
use App\Libraries\Helper;
use App\Models\ElectionCampaigns;


class TmController extends Controller {

	/*
		Function that returns lists of cities , support_statuses and languages
	*/
    public function getLists() {
        $jsonOutput = app()->make("JsonOutput");
        $currentCampaign =  ElectionCampaigns::currentCampaign();

        $result = [
            'cities' => City::where('deleted', 0)->orderBy('name', 'asc')->get(),
            'support_statuses' => SupportStatus::where('deleted', 0)
                                    ->where('election_campaign_id', $currentCampaign->id)
                                    ->where('deleted', 0)
                                    ->where('active',1)
                                    ->orderBy('level', 'DESC')
                                    ->get(),
            'languages' => Languages::where('deleted', 0)->get()
        ];
        $jsonOutput->setData($result);
    }

	/*
		Function that returns all minimum needed TM constants from constants file as result array
	*/
    public function getOptionLabels() {
        $jsonOutput = app()->make("JsonOutput");
        $locale = ucfirst(\App::getLocale());

        $campaignStatus = array();
        foreach(config('tmConstants.campaign.status'.$locale) as $key => $status) {
            $statusObject = new \stdclass;
            $statusObject->id = $key;
            $statusObject->name = $status;
            array_push($campaignStatus, $statusObject);
        }
        $result = [
            'campaignStatus' => $campaignStatus,
            'campaignStatusConst' => config('tmConstants.campaign.statusConst'),
            'campaignElectionType' => config('tmConstants.campaign.electionType'),
            'telephonyMode' => config('tmConstants.campaign.telephonyMode'),
            'actionCallNoAnswer' => config('tmConstants.campaign.actionCallNoAnswer'),
            'returnCallNoAnswer' => config('tmConstants.campaign.returnCallNoAnswer'),
            'questionType' => config('tmConstants.question.type'),
            'questionTypeConst' => config('tmConstants.question.typeConst'),
			'dialerType' => SipServer::select('id as value ','name as label')->where('active',1)->get()
        ];
        $jsonOutput->setData($result);
    }

    /**
     * Get cti permissions list
     *
     * @param Request $request
     * @return void
     */

    public function getCtiPermissionsLists(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        //set return fields
        $permissionFields = [
            'key',
            'name',
            'label',
            'type'
        ];

        //get cti permissions
        $ctiPermissions = CtiPermission::select($permissionFields)
        ->orderBy('name')
        ->get();
        $jsonOutput->setData($ctiPermissions);
    }
}
