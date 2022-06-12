<?php

namespace App\Console;

use App\Http\Controllers\SystemController;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\HashReactFile::Class,
        Commands\ActivistsSendMessage::Class,
        Commands\LicenseJs::Class,
        Commands\NotifyActivistsOnVotes::Class,
        Commands\BallotGeneralCounts::Class,
        Commands\ActivistsSendBallotInfo::Class,
        Commands\CalculateCaptainCountersActivists::Class,
        Commands\CheckActivistVerifiedStatus::Class,
        Commands\GetExternalVotes::Class,
        Commands\CreateTmVoterList::Class,
        Commands\CalculateReportingBallots::Class,
        Commands\RemoveNotAllocatedActivists::Class,
        Commands\TransferCommand::Class,
        Commands\CompareVotersFromCsvCommand::Class,
        Commands\GoogleMapClusterLocation::Class,
        Commands\UploadCsvVotesFromCommission::Class,
        Commands\RedisNewCall::Class
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('logz:send')->everyMinute();
        $schedule->call(function () {
            SystemController::healthCheckByEnvDefinition();
        })->everyThirtyMinutes();
    }

    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
