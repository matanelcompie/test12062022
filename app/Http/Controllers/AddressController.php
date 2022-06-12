<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\City;
use App\Models\Area;
use App\Models\Neighborhood;
use App\Models\Cluster;
use App\Models\BallotBox;
use App\Models\ElectionCampaigns;

class AddressController extends Controller {

	/*
		Function that returns all cities , with option of filtering by area_id
	*/
    public function getCities(Request $request, $area_id = null) {
        $jsonOutput = app()->make("JsonOutput");
        $query = City::select('cities.id', 'cities.key', 'cities.name', 'cities.mi_id')
                ->withAreaAndSubArea()//documentation in the scope function
                ->orderBy('cities.name', 'asc')
                ->where('cities.deleted', 0);

        $areaId = trim($area_id);
        if ($areaId) {
            $query->where('cities.area_id', $areaId);
        }
        $cities = $query->get();
        $jsonOutput->setData($cities);
    }

	/*
		Function that returns all neighborhoods , with option of filtering by city_id
	*/
    public function getNeighborhoods(Request $request, $city_id = null) {
        $jsonOutput = app()->make("JsonOutput");
        if ($city_id == null) {
            $neighborhoods = Neighborhood::orderBy('name', 'asc')->select('id', 'name')->where('deleted', 0)->get();
            $jsonOutput->setData($neighborhoods);
        } else {
            $neighborhoods = Neighborhood::orderBy('name', 'asc')->select('id', 'name')->where('city_id', $city_id)->where('deleted', 0)->get();
            $jsonOutput->setData($neighborhoods);
        }
    }

	/*
		Function that returns all clusters , with option of filtering by neighborhood_id
	*/
    public function getClusters(Request $request, $neighborhood_id = null) {
        /*
          $resultArray = ElectionCampaigns::select( ['id'] )->whereNull( 'end_date' )->first();

          if ( null == $resultArray ) {
          $resultArray = ElectionCampaigns::select( ['id'])
          ->where( 'end_date', '>=', $currentDate )
          ->where( 'start_date', '<=', $currentDate )
          ->orderBy( 'end_date', 'desc' )->first();
          }
          $lastCampID = -1;
          if($resultArray){
          $lastCampID = $resultArray->id;
          }
         */
        $currentCampaign = ElectionCampaigns::currentLoadedVotersCampaign();
        $lastCampID = $currentCampaign['id'];

        $jsonOutput = app()->make("JsonOutput");
        if ($neighborhood_id == null) {
            $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->get();
            $jsonOutput->setData($clusters);
        } else {
            if ($request->input('city_id') == null) {
                $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->where('neighborhood_id', $neighborhood_id)->get();
            } else {
                if ($neighborhood_id == -1) {
                    $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->where('city_id', $request->input('city_id'))->get();
                } else {
                    $clusters = Cluster::orderBy('name', 'asc')->where('election_campaign_id', $lastCampID)->select('id', 'name')->where('neighborhood_id', $neighborhood_id)->where('city_id', $request->input('city_id'))->get();
                }
            }
            $jsonOutput->setData($clusters);
        }
    }

	/*
		Function that returns all ballot-boxes , with option of filtering by cluster_id
	*/
    public function getBallots(Request $request, $cluster_id = null) {
        $jsonOutput = app()->make("JsonOutput");
        if ($cluster_id == null) {
            $ballots = BallotBox::select('id', 'mi_id as name')->get();
            $jsonOutput->setData($ballots);
        } else {
            $ballots = BallotBox::select('id')->where('cluster_id', $cluster_id)->get();
            for ($i = 0; $i < count($ballots); $i++) {
                $ballots[$i]->name = 'קלפי ' . $ballots[$i]->id;
            }
            $jsonOutput->setData($ballots);
        }
    }

	/*
		Function that returns all areas
	*/
    public function getAreas() {
        $jsonOutput = app()->make("JsonOutput");
        $resultArray = Area::all();
        $jsonOutput->setData($resultArray);
    }

}
