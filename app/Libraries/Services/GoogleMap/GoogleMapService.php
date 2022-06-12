<?php

namespace App\Libraries\Services\GoogleMap;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class GoogleMapService
{

    //key for connect to google map
    private static $googleMapKey="AIzaSyDVhgwD4lHo6Y9uBJl4Z1gLOMupEGNpniE";
    public static $default_range=0.3;
    public static $increasing_range=0.8;
    

    //function get details google map by address details
        public static function getLocationByAddress($cityName='',$streetName='',$house_or_name='',$country="ישראל"){
           
            $house=is_null($house_or_name)?'':$house_or_name;
            $street=is_null($streetName)?'':$streetName;
            $city=is_null($cityName)?'':$cityName;

            $baseUrl= "https://maps.googleapis.com/maps/api/geocode/json?address=".$country." ".$city." ".$street." ".$house;
            $baseUrl= $baseUrl.'&key='.self::$googleMapKey;
            $baseUrl=str_replace ( ' ', '%20',$baseUrl);
            $response=self::CurlGet($baseUrl);
            
            return $response['results'];
        }

        private static function CurlGet($url){
            Log::info($url);
            $cURLConnection = curl_init();

            curl_setopt($cURLConnection, CURLOPT_URL, $url);
            curl_setopt($cURLConnection, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($cURLConnection, CURLOPT_SSL_VERIFYPEER, false); 
            curl_setopt($cURLConnection, CURLOPT_SSL_VERIFYHOST, false); 
            
            $data = curl_exec($cURLConnection);
         
            //curl_close($cURLConnection);
            
            $jsonArrayResponse = json_decode($data,true);
            Log::info(json_encode($jsonArrayResponse));
            return  $jsonArrayResponse;
        }

        //function check if the first point in km radius of the second point
        public static function arePointsNear($checkPoint, $centerPoint, $km=0.3){
            $ky = 40000 / 360;
            $kx = cos(pi() * $centerPoint['lat'] / 180.0) * $ky;
            $dx =abs($centerPoint['lng'] - $checkPoint['lng']) * $kx;
            $dy = abs($centerPoint['lat'] - $checkPoint['lat']) * $ky;
            return sqrt($dx * $dx + $dy * $dy) <= $km;


            // function arePointsNear(checkPoint, centerPoint, km) {
            //     var ky = 40000 / 360;
            //     var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
            //     var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
            //     var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
            //     return Math.sqrt(dx * dx + dy * dy) <= km;
            // }
            
            // var vasteras = { lat: 31.7873933, lng: 35.1746864 };
            // var stockholm = { lat: 31.7869912, lng: 35.1754787 };
            
            // var n = arePointsNear(vasteras, stockholm,0.3);
            
            // console.log(n);
        }

        
        
   

        
    
}