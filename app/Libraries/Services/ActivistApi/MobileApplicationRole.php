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

//class that manage all function activist city mobile
class MobileApplicationRole
{
    
    public static $ballot_member=1;//חבר
    public static $ballot_leader=1;//יור
    public static $ballot_vice_leader=1;//סגן יור
  
    public static $observer=2;//mashkif
    public static $driver=3;
    public static $motivator=4;//mamritz
    public static $captain_of_fifty=5;
    public static $cluster_leader=6;
    public static $counter=7; 
}