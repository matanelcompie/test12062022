<?php
namespace App\Libraries\Services;

use App\Libraries\Helper;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use Illuminate\Support\Facades\DB;

class VotersService
{

    public static function getVoteByPersonalIdentity($personal_identity){
        $voter=Voters::select()->where('personal_identity',$personal_identity)->first();
        return $voter?$voter:false;
    }
    
    public static function prepareSupportersPhonesCsvFile(){
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $miIdFormatSql = Helper::getFormattedMiIdQuery();

        $fullClusterNameQuery = Cluster::getClusterFullNameQuery('cluster_name',true);
        $fields = [
            DB::raw('distinct voter_phones.phone_number'),
            'voters.key as voter_key',
            'voters.first_name',
            'clusters.street', // street_id?
            'cities.name as city_name', 
            DB::raw("$fullClusterNameQuery"),
            DB::raw("$miIdFormatSql as mi_id"),
        ];
        // $suppurtStatus = config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'); //!! for election day!
        
		$votersSupporters = VotersInElectionCampaigns::select($fields)
		->withVoters()
		->withVoterPhone(true)
		->withBallotCluster()
		->withBallotCity()
		->withSupportStatus(false, 0)
        ->join('support_status', 'support_status.id', '=', 'voter_support_status.support_status_id')
		->where('support_status.likes', 1)
		->where('phone_number', 'like' , '05%')
		->where('voters_in_election_campaigns.election_campaign_id', $currentCampaignId)
        // ->limit(50)
		->get();
        // dd($votersSupporters->toSql());
        
        header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=רשימת טלפונים יום בחירות.csv");

        $placeString = 'מָקוֹם הַצְבָּעָתְךָ הִנּוֹ קַלְפִּי';
        $greetString ='הַיּוֹם בּוֹחֲרִים בְּמָרָן הָרַב עוֹבַדְיָה יוֹסֵף זצוק"ל  וּמַצְבִּיעִים שָׁ"ס בִּשְׁבִיל הַנְּשָׁמָה';
        $headerRow = [
            'voter_key' => 'קוד בוחר',
            'phone_number' => 'טלפון',
            'message' => 'הודעה'
        ];
        $headerRow = implode(',', $headerRow);
        echo $headerRow. "\n";
        // dd($votersSupporters->toArray());
        foreach ( $votersSupporters as $voterPhone){
            $clusterFullName = "$voterPhone->cluster_name $voterPhone->street";
            $message = "שָׁלוֹם $voterPhone->first_name /n/n $placeString: $voterPhone->mi_id /n בְּאֶשְׁכּוֹל $clusterFullName /n בְּעִיר $voterPhone->city_name /n/n $greetString";
            // $message = "שָׁלוֹם $voterPhone->first_name \r\r $placeString: $voterPhone->mi_id \r בְּאֶשְׁכּוֹל $clusterFullName \r בְּעִיר $voterPhone->city_name \r\r $greetString";
            // $message = '"' . 
            // "שָׁלוֹם $voterPhone->first_name 
            //  $placeString: $voterPhone->mi_id 
            // בְּאֶשְׁכּוֹל $clusterFullName 
            // בְּעִיר $voterPhone->city_name 
            // $greetString" . '"';

            $voterRow = [
                'voter_key' => $voterPhone->voter_key,
                'phone_number' => $voterPhone->phone_number,
                'message' => "$message",
            ];
            $fullRow = implode(',', $voterRow);

            echo $fullRow . "\n";
        }
    }
}

/*
שלום יהודה שלום.

מקום הצבעתך היינו קלפי : 271.
באשכול נועם - בי"ס תורני לבנות.
בעיר ירושלים.

היום בוחרים במרן הרב עובדיה יוסף זצוק"ל,  ומצביעים ש"ס בשביל הנשמה .

*/