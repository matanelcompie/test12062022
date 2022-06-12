<?php

namespace App\Libraries\Services\ExportFile;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistPaymentRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class ExcelFileService
{
    public static function download($header, $arrayObject, $nameFile)
    {
        header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=$nameFile.csv");


        $fullRow = implode(',', array_keys($header));
        $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
        echo $rowToPrint;

        foreach ($arrayObject as $key => $object) {
            $arrayValueRow = [];
            foreach ($header as $hebrewName => $nameField) {
                $arrayValueRow[] = Helper::removeCommaAndNewLineFromString($object->$nameField);
            }
            
            $fullRow = implode(',', $arrayValueRow);
            $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
            echo $rowToPrint;
        }
    }
}
