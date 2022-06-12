<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\ElectionRolesByVoters;
use App\Models\ElectionCampaigns;


class RemoveNotAllocatedActivists extends Command {

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activist:check_allocation';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove ballot election roles that not allocated';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    public static function handle() {
        $timeToRemove = config('app.remove_not_allocated_activists_time');

        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;

        $electionRoleSystemNames = config('constants.activists.election_role_system_names');
        $ballotRolesNames = [
            $electionRoleSystemNames['ballotMember'],
            $electionRoleSystemNames['observer'],
            $electionRoleSystemNames['counter']
        ];
        // dd($electionRoleSystemNames);
        $whereList = [
            ['election_roles_by_voters.election_campaign_id', $currentCampaignId],
        ];
        $fields = [
            'election_roles_by_voters.id as election_role_id',
            'election_roles_by_voters.allocation_removed_time',
            DB::raw('CURRENT_TIMESTAMP()'),
            DB::raw("( TIMESTAMPDIFF(MINUTE, election_roles_by_voters.allocation_removed_time, CURRENT_TIMESTAMP()) ) AS allocation_removed_time_left"),
        ];
        // GETDATE()
        $electionRolesByVoters = ElectionRolesByVoters::select($fields)
        ->where($whereList)
        ->whereNotNull('election_roles_by_voters.allocation_removed_time')
        ->whereIn('election_roles.system_name', $ballotRolesNames)
        ->withCount(['electionRolesGeographical'])
        ->withElectionRole(false)
        ->having('allocation_removed_time_left', '>=', 60)
        ->having('election_roles_geographical_count', '=', 0)
        ->get();
        $deleteIds = [];
        foreach ($electionRolesByVoters as $roleItem){
            $deleteIds[] = $roleItem->election_role_id;
        }
        ElectionRolesByVoters::whereIn('id', $deleteIds)->delete();
        dd($electionRolesByVoters->toArray());
        // Log::info($electionRolesByVoters->toArray());
        return $electionRolesByVoters;
    }
}