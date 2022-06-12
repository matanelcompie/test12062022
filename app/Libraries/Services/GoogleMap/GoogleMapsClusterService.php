<?php

namespace App\Libraries\Services\GoogleMap;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class GoogleMapsClusterService
{
 
    public static function getGoogleGeometryByClusterId($cluster,$byHouse=true)
        {
            //sent to google map house , if is not has, send name of cluster
            if($byHouse)
            $house=!is_null($cluster->house) && strcmp($cluster->house,'')!=0?$cluster->house:$cluster->name;
            else
            $house=$cluster->name;

            $street=is_null($cluster->street)|| strcmp($cluster->street,'')==0?$cluster->street_name:$cluster->street;
            $city=$cluster->city_name;
    
           $result=GoogleMapService::getLocationByAddress($city,$street,$house);
           if(count($result)>0){
            $geometry=$result[0]['geometry']['location'];
            return $geometry;
           }
           else{
               Log::info('---- כתובת לא נמצאת----');
               Log::info(json_encode($cluster));
            return false;
           }
          
  
        }

        //
        public static function updateGoogleMapLocationClusterCampaign($election_campaign_id){
            $allCluster=Cluster::select(self::listFieldClusterGoogle())
            ->withCity()
            ->withStreet()
            ->where('election_campaign_id',$election_campaign_id)->get();//->limit(10)//->limit(30)

            foreach ($allCluster as $key => $cluster){
             Log::info('_______________________________________________');
             Log::info('אשכול:'.$cluster->id);
             $updatePlace=true;
             $HouseLocation=false;
             $inRadius=false;
             if(!is_null($cluster->house) && strcmp($cluster->house,''))
             $updatePlace=false;
             
             $placeLocation= self::getGoogleGeometryByClusterId($cluster,false);
             $geometry= $placeLocation;
             Log::info('מיקום שם:'.json_encode($placeLocation));

             if(!$updatePlace){
                $HouseLocation= self::getGoogleGeometryByClusterId($cluster);
                $geometry= $HouseLocation;
                Log::info('מיקום בית:'.json_encode($HouseLocation));
                $inRadius=GoogleMapService::arePointsNear($HouseLocation,$placeLocation,0.3);
                if($inRadius)
                Log::info('באותו המיקום');
                else{
                    Log::info('שגיאה');
                }
             }
             else {
                Log::info('אין בית');
            }

                $cluster->lat_location=$geometry['lat'];
                $cluster->lng_location=$geometry['lng'];
                if($inRadius==false)
                $cluster->increasing_range_map=1;

                $cluster->save();
            }
        }

        public static function listFieldClusterGoogle(){
            $cluster_fields=[
                DB::raw('clusters.id'),
                DB::raw('cities.name as city_name'),
                DB::raw('clusters.street'), 
                DB::raw('streets.name as street_name'),
                DB::raw('clusters.house'),
                DB::raw('clusters.name'),
                DB::raw('clusters.lat_location'),
                DB::raw('clusters.lng_location')
            ];
            return $cluster_fields;
        }

}


