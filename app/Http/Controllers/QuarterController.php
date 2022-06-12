<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ElectionCampaigns;
use App\Models\Quarter;
use App\Repositories\CityRepository;
use App\Repositories\QuarterRepository;
use Illuminate\Http\Request;
use Log;

class QuarterController extends Controller
{
	/**
	 * Add quarter and connect arr cluster to new quarter
	 *
	 * @param Request $request
	 * @param  $cityKey
	 * @return void
	 */
	public function addCityQuarter(Request $request, $cityKey)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			$city = CityRepository::getCityByKey($cityKey);
			$name = $request->input('name');
			$arrClustersId = $request->input('clusters_ids', []);
			$electionCampaign=ElectionCampaigns::currentCampaign();
			$newQuarter = QuarterRepository::addQuarterAndConnectClusters($city, $name, $arrClustersId, $electionCampaign);
			$jsonOutput->setData($newQuarter);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

	/**
	 * Add quarter and connect arr cluster to new quarter
	 *
	 * @param Request $request
	 * @param  $cityKey
	 * @return void
	 */
	public function deleteCityQuarter(Request $request,$quarterId)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			$quarter = QuarterRepository::getQuarterById($quarterId);
			QuarterRepository::deleteQuarter($quarter);
			$jsonOutput->setData(true);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

	public function updateCityQuarter(Request $request, $quarterId)
	{
		$jsonOutput = app()->make("JsonOutput");
		try {
			$quarter = QuarterRepository::getQuarterById($quarterId);
			$newName =  $request->input('name', null);
			if ($newName) {
				$quarter = QuarterRepository::updateQuarterName($quarter, $newName);
			}

			$clusterQuarter =  $request->input('clusters_ids', null);

			if (!is_null($clusterQuarter)) {
				QuarterRepository::connectClustersToQuarterAndUnConnectClustersNotInArray($quarter, $clusterQuarter);
			}

			$jsonOutput->setData($quarter);
		} catch (\Exception $e) {
			$jsonOutput->setErrorCode($e->getMessage(), 400, $e);
		}
	}

}
