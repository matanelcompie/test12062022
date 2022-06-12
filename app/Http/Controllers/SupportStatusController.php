<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Models\SupportStatus;
use App\Models\VoterSupportStatus;
use App\Models\ElectionCampaigns;

use App\Libraries\Helper;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupportStatusController extends Controller {

	/*
		Function that returns all active SupportStatuses list with specific DB fields
	*/
    public function getSupportStatuses() {
        $jsonOutput = app()->make( "JsonOutput" );

        $electionCampaign = ElectionCampaigns::currentCampaign();

        $supportStatuses = SupportStatus::select(['id', 'key', 'name', 'level'])
                        ->where([
                            'election_campaign_id' => $electionCampaign->id,
                            'deleted' => 0,
                            'active' => 1
                        ])
                        ->get();

        $jsonOutput->setData($supportStatuses);
    }

	/*
		Function that returns all active SupportStatuses list with all DB fields
	*/
    public function getALLSupportStatuses(Request $request, $campaignKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_IS_MISSING'));
            return;
        }

        $electionCampaign = ElectionCampaigns::where('key', $campaignKey)->first();
        if ( is_null($electionCampaign) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_DOES_NOT_EXIST'));
            return;
        }

        $supportStatuses = SupportStatus::select([
                                'support_status.id',
                                'support_status.key',
                                'support_status.name',
                                'support_status.level',
                                DB::raw('IFNULL(support_status.likes,0) AS likes'),
                                //'support_status.likes',
                                'connected_support_status.key as connected_support_status_key',
                                'connected_support_status.name as connected_support_status_name',
                                'support_status.active',
                                'support_status.created_at',
                                'support_status.updated_at'
                            ])
                            ->withConnectedSupportStatus()
                            ->where('support_status.deleted', 0)
                            ->where('support_status.election_campaign_id', $electionCampaign->id)
                            ->orderBy('support_status.level', 'desc')
                            ->get();

        $jsonOutput->setData($supportStatuses);
    }

	/*
		Function that updates SupportStatus by its key and POST params
	*/
    public function updateSupportStatus(Request $request, $campaignKey, $supportStatusKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_IS_MISSING'));
            return;
        }

        $electionCampaign = ElectionCampaigns::where('key', $campaignKey)->first();
        if ( is_null($electionCampaign) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_DOES_NOT_EXIST'));
            return;
        }        

        if ( is_null($supportStatusKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $name = $request->input('name', null);
        $active = $request->input('active', null);
        $level = $request->input('level', null);
        $connectedSupportStatusKey = $request->input('connected_support_status_key', null);

        if ($level !== null) $level = intval($level);


        if (($active === null) || !in_array($active, [0, 1]) ) {
            $jsonOutput->setErrorCode(config('errors.system.WRONG_ACTIVE_STATUS'));
            return;
        }

        if ( !is_numeric($level)||(!is_int($level)) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VALUE_NOT_INT'));
            return;
        }

        if (strlen($name) <= 2) {
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }

        $connectedSupportStatusId = null;
        if ($connectedSupportStatusKey != null) {
            $connectedSupportStatus = SupportStatus::select('id')
                                            ->where('key', $connectedSupportStatusKey)
                                            ->first();
            if (!$connectedSupportStatus) {
                $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
                return;                
            } else {
                $connectedSupportStatusId = $connectedSupportStatus->id;
            }
        }

        $supportStatus = SupportStatus::select('id')
            ->where('key', $supportStatusKey)
            ->where('election_campaign_id', $electionCampaign->id)
            ->where('deleted', 0)
            ->first();
        if ( is_null($supportStatus) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $duplicateStatus = SupportStatus::select('id')
                                    ->where('id', '!=', $supportStatus->id)
                                    ->where('election_campaign_id', $electionCampaign->id)
                                    ->where('name', $name)
                                    ->where('deleted', 0)
                                    ->first();

        if ($duplicateStatus) {
            $jsonOutput->setErrorCode(config('errors.elections.VALUE_EXISTS'));
            return;            
        }

        $supportStatus->active = $active;
        $supportStatus->name = $name;
        $supportStatus->level = $level;
        $supportStatus->likes = ($level > 0)? 1 : 0;
        $supportStatus->connected_support_status_id = $connectedSupportStatusId;
        $supportStatus->save();

        $jsonOutput->setData('OK');
    }

    /**
     * Delete support status
     *
     * @param Request $request
     * @param string $campaignKey
     * @param string $supportStatusKey
     * @return void
     */
    public function deleteSupportStatus(Request $request, $campaignKey, $supportStatusKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_IS_MISSING'));
            return;
        }

        $electionCampaign = ElectionCampaigns::where('key', $campaignKey)->first();
        if ( is_null($electionCampaign) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_DOES_NOT_EXIST'));
            return;
        }        

        if ( is_null($supportStatusKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        $supportStatus = SupportStatus::select('id')
            ->where('key', $supportStatusKey)
            ->where('election_campaign_id', $electionCampaign->id)
            ->where('deleted', 0)
            ->first();
        if ( is_null($supportStatus) ) {
            $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
            return;
        }

        //check if status in use
        $voterWithSupportStatus = VoterSupportStatus::select('id')
                                            ->where('support_status_id', $supportStatus->id)
                                            ->where('deleted', 0)
                                            ->first();

        if ($voterWithSupportStatus) {
            $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
            return;          
        }

        //set deleted


        SupportStatus::where('connected_support_status_id', $supportStatus->id)
                        ->where('deleted', 0)
                        ->update([
                            'connected_support_status_id' => null
                        ]);
        $supportStatus->delete();
        
        $jsonOutput->setData('OK');
    }

    /**
     * Add support status
     *
     * @param Request $request
     * @param string $campaignKey
     * @return void
     */
    public function addSupportStatus(Request $request, $campaignKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($campaignKey) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_IS_MISSING'));
            return;
        }

        $electionCampaign = ElectionCampaigns::where('key', $campaignKey)->first();
        if ( is_null($electionCampaign) ) {
            $jsonOutput->setErrorCode(config('errors.elections.CAMPAIGN_KEY_DOES_NOT_EXIST'));
            return;
        }

        $name = $request->input('name', null);
        $level = $request->input('level', null);

        if ($level !== null) $level = intval($level);

        if ( !is_numeric($level)||(!is_int($level)) ) {
            $jsonOutput->setErrorCode(config('errors.elections.VALUE_NOT_INT'));
            return;
        }

        if (strlen($name) <= 2) {
            $jsonOutput->setErrorCode(config('errors.elections.WRONG_PARAMS'));
            return;
        }

        $duplicateStatus = SupportStatus::select('id')
                                    ->where('election_campaign_id', $electionCampaign->id)
                                    ->where('name', $name)
                                    ->where('deleted', 0)
                                    ->first();

        if ($duplicateStatus) {
            $jsonOutput->setErrorCode(config('errors.elections.VALUE_EXISTS'));
            return;            
        }

        $supportStatus = new SupportStatus;
        $supportStatus->key = Helper::getNewTableKey('support_status', 5);
        $supportStatus->election_campaign_id = $electionCampaign->id;
        $supportStatus->name = $name;
        $supportStatus->active = 1;
        $supportStatus->level = $level;
        $supportStatus->likes = ($level > 0)? 1 : 0;
        $supportStatus->save();

        $jsonOutput->setData('OK');
    }
}