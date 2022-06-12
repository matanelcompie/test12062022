<?php

namespace App\Libraries\Services\ActivistApi;

use App\Libraries\Helper;
use App\Libraries\HelperDate;
use App\Libraries\Services\ServicesModel\ClusterService;
use App\Libraries\Services\VoterDetailsService;
use App\Models\ActivistsTasksSchedule;
use App\Models\BallotBox;
use App\Models\Cluster;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\VoterCaptainFifty;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\Banner;
use App\Models\ElectionRolesByVoters;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

//class that manage all function activist city mobile
class MobileAppInformationService
{
    private static $app_version="1.0.2";//
    private static $message_update_version="משתמש יקר קיימת גרסה חדשה לאפליקציה , אנא עדכן לגירסה החדשה";
    private static $link_downLoad_version="https://play.google.com/store/apps/details?id=com.shas.elections";

    public static function getInformation(){
        $information=new stdClass();
        $information->app_version=self::$app_version;
        $information->message_update_version=self::$message_update_version;
        $information->link_downLoad_version=self::$link_downLoad_version;

        return $information;
    }
}