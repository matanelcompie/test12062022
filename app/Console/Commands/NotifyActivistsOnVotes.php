<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

use App\Http\Controllers\VoterElectionsController;

use App\Models\Votes;

use App\API\Sms\Sms;


/**
 * Class NotifyActivistsOnVotes
 * @package App\Console\Commands
 *
 * This command notifies calusetr leader and
 * captain 5o of a voter's vote allocated to them
 * on election day.
 */
class NotifyActivistsOnVotes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activist:notify_votes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify cluster leader and captain50 on a vote by voter allocated to them';

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
     * This function send sms to captain50
     * that contains serial numbers of voters
     * allocated to him.
     *
     * @param $activistObj
     * @param $notifyField
     */
    private function sendSmsToCaptain($activistObj, $notifyField) {
        $smsText = '';

        $voteIds = [];
        $serialNumbers = [];

        foreach ( $activistObj['ballotBoxes'] as $ballotBoxMiId => $voterArr) {
            for ( $index = 0; $index < count($voterArr); $index++ ) {
                $voteIds[] = $voterArr[$index]['vote_id'];
                $serialNumbers[] = $voterArr[$index]['voter_serial_number'];
            }

            $smsText .= 'קלפי ' . $ballotBoxMiId . "\n";
            $smsText .= 'הצביעו ' . implode(', ', $serialNumbers);
            $smsText .= "\n";
            $smsText .= "\n";
        }

        $smsSendCode = (Sms::connection('telemarketing')->send($activistObj['phone_number'], $smsText)) ? 'OK' : 'Error';

        $updateValues = [];
        $updateValues[$notifyField] = 1;

        Votes::whereIn('id', $voteIds)->update($updateValues);
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle() {
        $last_campaign_id = VoterElectionsController::getLastCampaign();

        $fields = [
            'votes.id as vote_id',
            'votes.voter_id',
            'voters_with_captains_of_fifty.captain_id',
            'ballot_boxes.mi_id as ballot_box_mi_id',
            'voters_in_election_campaigns.voter_serial_number',
            'election_roles_by_voters.phone_number'
        ];
        $votersToNotifyCaptain50 = Votes::select($fields)
            ->withVoterInElectionCampaign($last_campaign_id)
            ->withCaptain50($last_campaign_id)
            ->where(['votes.election_campaign_id' => $last_campaign_id, 'votes.notify_captain_fifty' => 0])
            ->where('voters_in_election_campaigns.voter_serial_number', '>', 0)
            ->orderBy('voters_with_captains_of_fifty.captain_id')
            ->orderBy('ballot_boxes.mi_id')
            ->orderBy('voters_in_election_campaigns.voter_serial_number')
            ->get();

        $currentCaptainId = 0;
        $currentBallotBoxMiId = 0;
        $captainsToSend = [];
        for ( $voterIndex = 0; $voterIndex < count($votersToNotifyCaptain50); $voterIndex++ ) {
            if ( $votersToNotifyCaptain50[$voterIndex]->captain_id != $currentCaptainId ) {
                $currentCaptainId = $votersToNotifyCaptain50[$voterIndex]->captain_id;

                $captainsToSend[$currentCaptainId] = [
                    'ballotBoxes' => [],
                    'phone_number' => $votersToNotifyCaptain50[$voterIndex]->phone_number
                ];
            }

            if ( $votersToNotifyCaptain50[$voterIndex]->ballot_box_mi_id != $currentBallotBoxMiId ) {
                $currentBallotBoxMiId = $votersToNotifyCaptain50[$voterIndex]->ballot_box_mi_id;

                $captainsToSend[$currentCaptainId]['ballotBoxes'][$currentBallotBoxMiId] = [];
            }

            $captainsToSend[$currentCaptainId]['ballotBoxes'][$currentBallotBoxMiId][] = [
                'vote_id' => $votersToNotifyCaptain50[$voterIndex]->vote_id,
                'voter_serial_number' => $votersToNotifyCaptain50[$voterIndex]->voter_serial_number
            ];
        }

        $captainArrKeys = array_keys($captainsToSend);
        if ( count($captainArrKeys) > 0 ) {
            foreach ($captainsToSend as $captainId => $arrValues) {
                $this->sendSmsToCaptain($captainsToSend[$captainId], 'notify_captain_fifty');
            }
        }


        $fields = [
            'votes.id as vote_id',
            'votes.voter_id',
            'clusters.leader_id',
            'ballot_boxes.mi_id as ballot_box_mi_id',
            'voters_in_election_campaigns.voter_serial_number',
            'election_roles_by_voters.phone_number'
        ];
        $votersToNotifyClusterLeader = Votes::select($fields)
            ->withVoterInElectionCampaign($last_campaign_id)
            ->withClusterLeader($last_campaign_id)
            ->withVoteVoterSupportStatus($last_campaign_id)
            ->where(['votes.election_campaign_id' => $last_campaign_id, 'votes.notify_cluster_leader' => 0])
            ->where('support_status.level', '>', 0)
            ->where('voters_in_election_campaigns.voter_serial_number', '>', 0)
            ->orderBy('clusters.leader_id')
            ->orderBy('ballot_boxes.mi_id')
            ->orderBy('voters_in_election_campaigns.voter_serial_number')
            ->get();

        $currentLeaderId = 0;
        $currentBallotBoxMiId = 0;
        $leadersToSend = [];
        for ( $voterIndex = 0; $voterIndex < count($votersToNotifyClusterLeader); $voterIndex++ ) {
            if ( $votersToNotifyClusterLeader[$voterIndex]->leader_id != $currentLeaderId ) {
                $currentLeaderId = $votersToNotifyClusterLeader[$voterIndex]->leader_id;

                $leadersToSend[$currentLeaderId] = [
                    'ballotBoxes' => [],
                    'phone_number' => $votersToNotifyClusterLeader[$voterIndex]->phone_number
                ];
            }

            if ( $votersToNotifyClusterLeader[$voterIndex]->ballot_box_mi_id != $currentBallotBoxMiId ) {
                $currentBallotBoxMiId = $votersToNotifyClusterLeader[$voterIndex]->ballot_box_mi_id;

                $leadersToSend[$currentLeaderId]['ballotBoxes'][$currentBallotBoxMiId] = [];
            }

            $leadersToSend[$currentLeaderId]['ballotBoxes'][$currentBallotBoxMiId][] = [
                'vote_id' => $votersToNotifyClusterLeader[$voterIndex]->vote_id,
                'voter_serial_number' => $votersToNotifyClusterLeader[$voterIndex]->voter_serial_number
            ];
        }

        $leaderArrKeys = array_keys($leadersToSend);
        if ( count($leaderArrKeys) > 0 ) {
            foreach ($leadersToSend as $leaderId => $arrValues) {
                $this->sendSmsToCaptain($leadersToSend[$leaderId], 'notify_cluster_leader');
            }
        }
    }
}
