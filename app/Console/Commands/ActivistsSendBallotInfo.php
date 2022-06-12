<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use App\Models\ElectionRolesByVoters;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRolesGeographical;

use App\Libraries\Helper;
use App\Libraries\Services\IncomingMessageService;

use App\API\Sms\Sms;
use App\API\Ivr\Ivr;
use App\API\Ivr\IvrManager as IvrConst;
use App\Libraries\Services\activists\ActivistsMessagesService;

class ActivistsSendBallotInfo extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activist:ballot-info {shift}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send ballot info to activists';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->sendBallotInfo();
    }

    private function sendBallotInfo() {
        $shiftsArray = [];
        $shift = $this->argument("shift");
        switch ($shift) {
            case 3:
                $shiftsArray = [
                    config('constants.activists.role_shifts.COUNT'),
                ];                
                break;
            case 2:
                $shiftsArray = [
                    config('constants.activists.role_shifts.SECOND'),
                    config('constants.activists.role_shifts.SECOND_AND_COUNT'),
                ];
                break;

            case 1:
            default:
                $shiftsArray = [
                    config('constants.activists.role_shifts.FIRST'),
                    config('constants.activists.role_shifts.ALL_DAY'),
                    config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'),
                ];  
                break;

        } 
        $currentCampaign = ElectionCampaigns::currentCampaign();

        $activistFields = [
            'election_roles_by_voters.id',
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.vote_reporting_key',
            'voters.first_name',
            'voters.last_name'
        ];

        //load activists
        $activists = ElectionRolesByVoters::select($activistFields)
                            ->withVoter()
                            ->where('election_campaign_id', $currentCampaign->id)
                            ->with(['electionRolesGeographical' => function($query) use ($shiftsArray , $currentCampaign) {
                                $query->select('election_role_by_voter_geographic_areas.id', 
                                    'election_role_by_voter_geographic_areas.election_role_by_voter_id',
                                    'ballot_boxes.mi_id' , 'clusters.street as ballot_address',
                                    'cities.mi_id as city_mi_id',
                                    'cities.name as city_name' , 'cities.assign_leader_phone_number'
                                )
                                ->withElectionRoleShifts()
                                ->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
                                ->whereIn('election_role_shifts.system_name', $shiftsArray)
                                ->join('ballot_boxes', 'ballot_boxes.id', '=', 'election_role_by_voter_geographic_areas.entity_id')
                                ->join('clusters', function($joinOn) use($currentCampaign){
									$joinOn->on('clusters.id' , '=' , 'ballot_boxes.cluster_id' )
										   ->on('clusters.election_campaign_id' , '=' , DB::raw($currentCampaign->id));
                                })
                                ->join('cities', 'cities.id', '=', 'clusters.city_id');                    
                            }])
                            ->whereHas('electionRolesGeographical', function($query) use ($shiftsArray) {
                                $query->select('election_role_by_voter_geographic_areas.id', 'election_role_by_voter_geographic_areas.election_role_by_voter_id')
                                ->withElectionRoleShifts()
                                ->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
                                ->whereIn('election_role_shifts.system_name', $shiftsArray);
                            })
                            //!to do remove!!!!!
                            ->where('election_roles_by_voters.phone_number' , DB::raw('0527616881'))
                            // ->where('election_roles_by_voters.phone_number' , DB::raw('0584671611'))
                            // ->where('election_roles_by_voters.phone_number' , DB::raw('0523129999'))
                            // ->where('election_roles_by_voters.phone_number' , DB::raw('0544593104'))
                            // ->where('election_roles_by_voters.phone_number' , DB::raw('0587712000'))
                            ->get();
        $ivrRecipients = [];
        $smsCount = 0;
        $smsFailCount = 0;
        $ivrCount = 0;
        $ivrFailCount = 0;
        $sleepCount = 0;
        foreach($activists as $activist) {
            $sleepCount++;
            if ($sleepCount == 200) {
                echo "sleep 5\n";
                sleep(5);
                $sleepCount = 0;
            }
            $electionRolesGeo = $activist->electionRolesGeographical[0];

            $response = false;
            $fail = false;
            $message = '';
            $miId = $electionRolesGeo->mi_id;
            $miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId)-1, 0);
            if ($activist->vote_reporting_key == null) {
                $reportingKey = mt_rand(1,9). Helper::random(9, Helper::DIGIT);
                $activist->vote_reporting_key = $reportingKey;
                $activist->save();
            }
            if (Helper::isKosherPhone($activist->phone_number)) { //Not sending to IVR - Haim's order
                $message = config('constants.activists.BallotReportingMessgeIvr');
                $messageSendIvr = config('constants.activists.BallotReportingMessgeSendIvr');

                $first_name = $activist->first_name;
                $last_name = $activist->last_name;
                $city_name = $electionRolesGeo->city_name;
                $city_mi_id = $electionRolesGeo->city_mi_id;
                $message = str_replace(['[first_name]', '[last_name]', '[ballot_mi_id]','[city_name]'],
                                         [$first_name, $last_name, $miId, $city_name], $message);
                // $messageSendIvr = str_replace(['[first_name]', '[last_name]', '[ballot_mi_id]','[city_name]'],
                //                          [$first_name, $last_name, $miId, $city_name], $messageSendIvr);
                $ivrData = [
                    'first_name' => $first_name,
                    'last_name' => $last_name,
                    'ballot' => $miId,
                    'city' => $city_mi_id,
                    'city_name' => $city_name,
                ];

                Ivr::resetActivists($activist->phone_number);
                sleep(1);
                $response = Ivr::send($activist->phone_number, $message, IvrConst::TYPE_VOTE_REPORTING , $ivrData);

                if ($response) {
                    $ivrCount++;
                } else {
                    $ivrFailCount++;
                    $fail = true;
                }                
            } 
			else {
				 
                //$replyNumber = Sms::getSendNumber();
				$clusterAddress= $electionRolesGeo->ballot_address;
                $message = config('constants.activists.BallotReportingMessge');
                $message = str_replace("[first_name]", $activist->first_name, $message);
                $message = str_replace("[global_phone_number]", $electionRolesGeo->assign_leader_phone_number, $message);
                $message = str_replace("[ballot_addr]", $clusterAddress." , קלפי ".$miId , $message);
               // $message = str_replace("[last_name]", $activist->last_name, $message);
                //$message = str_replace("[reply_number]", $replyNumber, $message);
                //$message = str_replace("[ballot_mi_id]", $miId, $message);
                $applicationLinkMsg = ActivistsMessagesService::getApplicationLinkMsg();

                // $link = config('app.url').$activist->vote_reporting_key;
                $message = str_replace('[mobile_link]', '', $message); // Don't sent mobile link to applications!

                $message = str_replace('[applications_link]', $applicationLinkMsg, $message);
                $response = Sms::connection('telemarketing')->send($activist->phone_number, $message);
                if ($response) {
                    $smsCount++;
                } else {
                    $smsFailCount++;
                    $fail = true;
                }
            }

            if(!$fail){
                ElectionRolesGeographical::where('id', $electionRolesGeo->id)
                ->update(['current_reporting' => 0]);
                
                IncomingMessageService::saveActivistMessage($activist->id, 
                $activist->phone_number, 
                $message, 
                config('constants.MESSAGE_DIRECTION_OUT'), 
                null, 
                null, 
                null);
            }
        }
        echo "Sms success: ".$smsCount."\n";
        echo "Sms fail: ".$smsFailCount."\n";
        echo "Ivr success: ".$ivrCount."\n";
        echo "Ivr fail: ".$ivrFailCount."\n";        
    }
}
