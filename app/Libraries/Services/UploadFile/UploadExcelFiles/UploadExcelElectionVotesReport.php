<?php

namespace App\Libraries\Services\UploadFile\UploadExcelFiles;

use App\DTO\CsvThemeDto;
use App\DTO\ExcelColumnDto;
use App\DTO\UploadExcelElectionVotesDto;
use App\Enums\CommonEnum;
use App\Enums\CsvDocumentErrorRowType;
use App\Enums\CsvDocumentThemeSystemName;
use App\Enums\CsvFileTheme;
use App\Enums\CsvParserStatus;
use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Libraries\Services\UploadFile\UploadFile;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\ActivistPaymentsService;
use App\Libraries\Services\ServicesModel\ActivistPaymentService\paymentsGroupService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportPartyService;
use App\Libraries\Services\ServicesModel\ElectionVotesReportService;
use App\Libraries\Services\UploadFile\UploadExcelFile;
use App\Models\ActivistPaymentModels\ActivistPayment;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\CsvDocument;
use App\Models\CsvDocumentTheme;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionVotesReportSource;
use App\Models\Voters;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ActivistPaymentRepository;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\CityRepository;
use App\Repositories\CsvDocumentErrorRowRepository;
use App\Repositories\CsvDocumentRepository;
use App\Repositories\CsvDocumentThemeRepository;
use App\Repositories\ElectionCampaignPartyListRepository;
use App\Repositories\ElectionVotesReportRepository;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class UploadExcelElectionVotesReport
{
    private static $commissionSourceId;
    private static $hashMiCities;
    private static $hashMiBallotBox;

    public static function getElectionVoteSourceOfCommissionId()
    {
        if (!self::$commissionSourceId)
            self::$commissionSourceId = ElectionVotesReportSource::getIdBySystemName(ElectionVotesReportSource::$commission_report);

        return self::$commissionSourceId;
    }

    /**
     * @return CsvThemeDto
     */
    public static  function getCsvThemeUploadMunicipalElectionVotes()
    {
        $csvDocTheme = CsvDocumentThemeRepository::getBySystemName(CsvDocumentThemeSystemName::ELECTION_MUNICIPAL_BALLOT_VOTES);
        $csvFileTheme = new CsvThemeDto();
        $csvFileTheme->mustHeader = true;
        $csvFileTheme->fileThemeId = $csvDocTheme->id;
        $csvFileTheme->name = $csvDocTheme->name;
        $csvFileTheme->excelColumns = self::getExcelColumnUploadPartyVotes();
        return  $csvFileTheme;
    }

    /**
     * @return CsvThemeDto
     */
    public static  function getCsvThemeUploadElectionReportVotes()
    {
        $csvDocTheme = CsvDocumentThemeRepository::getBySystemName(CsvDocumentThemeSystemName::ELECTION_BALLOT_VOTES);
        $csvFileTheme = new CsvThemeDto();
        $csvFileTheme->mustHeader = true;
        $csvFileTheme->fileThemeId = $csvDocTheme->id;
        $csvFileTheme->name = $csvDocTheme->name;
        $csvFileTheme->excelColumns = self::getExcelColumnUploadPartyVotes();
        return  $csvFileTheme;
    }

    private static function getExcelColumnUploadPartyVotes()
    {
        return [
            new ExcelColumnDto('city_name', ' שם ישוב'),
            new ExcelColumnDto('city_mi_id', ' סמל ישוב'),
            new ExcelColumnDto('ballot_mi_id', ' מספר קלפי'),
            new ExcelColumnDto('count_have_votes', ' בזב'),
            new ExcelColumnDto('count_votes', 'מצביעים'),
            new ExcelColumnDto('count_not_valid_votes', 'פסולים'),
            new ExcelColumnDto('count_valid_votes', 'כשרים'),
            new ExcelColumnDto('party', 'מפלגה', true, true)

        ];
    }



    /**
     *
     * @param UploadExcelElectionVotesDto $uploadExcelElectionVotesDto
     * @return void
     */
    public static function uploadExcelFileBallotVotes(UploadExcelElectionVotesDto $uploadExcelElectionVotesDto)
    {
        $electionCampaignId = $uploadExcelElectionVotesDto->electionCampaignId;
        Log::info($electionCampaignId );
        $city = $uploadExcelElectionVotesDto->city;
        ElectionVotesReportService::deleteByElectionVotesReportSourceVaadatBchirot($electionCampaignId, $city);
        $csvDocument = $uploadExcelElectionVotesDto->csvDocument;
        $csvDocument->status = CsvParserStatus::CSV_PARSER_STATUS_AT_WORK;
        $csvDocument->save();

        $excelColumnRequired = self::getExcelColumnUploadPartyVotes();
        $isSelectedAllField = UploadExcelFile::isSelectedAllExcelColumn($uploadExcelElectionVotesDto->excelColumns, $excelColumnRequired);
        if (!$isSelectedAllField)
            throw new Exception(config('errors.global.NOT_SELECTED_ALL_EXCEL_COLUMN_ON_UPLOADER'));

        $locationFile = $csvDocument->location_file;
        $file = fopen($locationFile, "r");
        $indexRow = 0;
        //hash excel field not party
        $hashFieldExcel = array();
        //array excel column party
        $excelColumnsParty = array();
        //hash party id and excel col index
        $hashPartyIdExcelColumnIndex = array();


        foreach ($uploadExcelElectionVotesDto->excelColumns as $excelColumnDto) {
            if ($excelColumnDto->nameColumn == 'party')
                $excelColumnsParty[] = $excelColumnDto;
            else
                $hashFieldExcel[$excelColumnDto->nameColumn] = $excelColumnDto;
        }



        while (($data = fgetcsv($file, 0, ",")) !== false) {
            //Log::info($csvDocument->id . '-process-' . $indexRow);
            //insert parties list from header excel
            if ($indexRow == 0) {
                $hashPartyIdExcelColumnIndex = self::insertElectionPartiesFromCsvHeader(
                    $electionCampaignId,
                    $city,
                    $excelColumnsParty,
                    $data
                );
                $indexRow++;
                continue;
            }

            self::insertElectionVotesReportBallotAndPartyByExcelRow(
                $csvDocument,
                $indexRow,
                $data,
                $hashFieldExcel,
                $hashPartyIdExcelColumnIndex,
                $electionCampaignId,
                $city
            );
            $indexRow++;
        }

        $csvDocument->status = CsvParserStatus::CSV_PARSER_STATUS_SUCCESS;
        $csvDocument->save();
        fclose($file);
    }

    /**
     * @param array $row
     * @param array $hashExcelColumnDto
     * @return void
     */
    private static function insertElectionVotesReportBallotAndPartyByExcelRow(CsvDocument $csvDocument, $indexRow, $row, array $hashExcelColumnDto, $hashExcelColumnPartyId, $electionCampaignId, City $city = null)
    {
        $cityMiId = $row[$hashExcelColumnDto['city_mi_id']->excelIndexColumn];
        $ballotMiId = $row[$hashExcelColumnDto['ballot_mi_id']->excelIndexColumn];
        $countHaveVote = $row[$hashExcelColumnDto['count_have_votes']->excelIndexColumn];
        $countVotes = $row[$hashExcelColumnDto['count_votes']->excelIndexColumn];
        $countNotValidVotes = $row[$hashExcelColumnDto['count_not_valid_votes']->excelIndexColumn];
        $countValidVotes = $row[$hashExcelColumnDto['count_valid_votes']->excelIndexColumn];

        if (!$city) {
            $city = self::getCityByMiCityIdExcelValue($cityMiId);
            if (!$city) {
                CsvDocumentErrorRowRepository::insert(
                    $csvDocument->id,
                    $indexRow,
                    $hashExcelColumnDto['city_mi_id']->excelIndexColumn,
                    CsvDocumentErrorRowType::FIELD,
                    $hashExcelColumnDto['city_mi_id']->displayNameColumn,
                    null
                );
                return false;
            }
        }

        $ballotBox = self::getBallotByMiBallotIdExcelBallot($ballotMiId, $electionCampaignId, $city);
        if (!$ballotBox) {
            CsvDocumentErrorRowRepository::insert(
                $csvDocument->id,
                $indexRow,
                $hashExcelColumnDto['ballot_mi_id']->excelIndexColumn,
                CsvDocumentErrorRowType::FIELD,
                $hashExcelColumnDto['ballot_mi_id']->displayNameColumn,
                null
            );
            return false;
        }


        $isAllValueNumeric = self::allArrayValueIsNumeric(
            [
                $countValidVotes,
                $countNotValidVotes,
                $countVotes,
                $countHaveVote
            ]
        );


        if (!$isAllValueNumeric || ($countVotes != ($countValidVotes + $countNotValidVotes))) {
            CsvDocumentErrorRowRepository::insert(
                $csvDocument->id,
                $indexRow,
                null,
                CsvDocumentErrorRowType::ROW,
                null,
                'ערך עמודה שגוי'
            );

            return false;
        }


        $hashPartyVotesRow = self::getHashPartyIdAndCountVotesFromExcel($hashExcelColumnPartyId, $row,  $countValidVotes);
        if (!$hashPartyVotesRow) {
            CsvDocumentErrorRowRepository::insert(
                $csvDocument->id,
                $indexRow,
                null,
                CsvDocumentErrorRowType::ROW,
                null,
                'סכום שדות לא תואם'
            );
            return false;
        }


        self::addElectionVoteReportForBallotByExcelRowData(
            $electionCampaignId,
            $city,
            $ballotBox,
            $countHaveVote,
            $countNotValidVotes,
            $countVotes,
            $hashPartyVotesRow
        );
    }

    private static  function getCityByMiCityIdExcelValue($cityMiId)
    {
        if (!is_numeric($cityMiId))
            return false;
        if (isset(self::$hashMiCities[$cityMiId])) {
            $city = self::$hashMiCities[$cityMiId];
        } else {
            $city = CityRepository::getByMiId($cityMiId);
            self::$hashMiCities[$cityMiId] = $city;
        }


        if (!$city)
            return false;
        return $city;
    }

    private static function getBallotByMiBallotIdExcelBallot($ballotMiId, $electionCampaignId, City $city)
    {
        if (strpos($ballotMiId, ".") !== false) {
            $ballotMiId = str_replace(".", "", $ballotMiId);
        } else {
            $ballotMiId = $ballotMiId . '0';
        }
        if (!is_numeric($ballotMiId))
            return false;
        $hashKeyBallot = $ballotMiId . '_' . ($city->id);
        if (isset(self::$hashMiBallotBox[$hashKeyBallot])) {
            $ballotBox = self::$hashMiBallotBox[$hashKeyBallot];
        } else {
            $ballotBox = BallotBoxesRepository::getBallotBoxByBallotMiIdAndCityMiId($electionCampaignId, $city->mi_id, $ballotMiId);
            self::$hashMiBallotBox[$hashKeyBallot] = $ballotBox;
        }

        if (!$ballotBox)
            return false;
        return $ballotBox;
    }

    private static function allArrayValueIsNumeric(array $arrayFieldValue)
    {
        foreach ($arrayFieldValue as $key => $value) {
            if (!is_numeric($value))
                return false;
        }

        return true;
    }

    /**
     * @param [type] $electionCampaignPartyLists
     * @param [type] $row
     * @param [type] $hashExcelColumnDto
     * @return void
     */
    private static function getHashPartyIdAndCountVotesFromExcel($hashExcelColIndexParty, $row, $countValidVotes)
    {
        $hashRowPartyVotes = array();
        $sumAllPartiesVotesInRow = 0;
        foreach ($hashExcelColIndexParty as $colIndex => $party) {
            $countVotesParty = $row[$colIndex];
            $hashRowPartyVotes[$party->id] = $countVotesParty;
            $sumAllPartiesVotesInRow += $countVotesParty;
        }
        if ($sumAllPartiesVotesInRow != $countValidVotes)
            return false;

        else
            return $hashRowPartyVotes;
    }

    private static function addElectionVoteReportForBallotByExcelRowData($electionCampaignId, City $city, BallotBox $ballotBox, $countHaveVote, $countNotValidVotes, $countVotes, $hashPartyIdVotes)
    {
        Log::info($electionCampaignId );
        //add election votes report for ballot
        $electionVotesReport = ElectionVotesReportService::updateCountVotesAndNotValidVotesByReportSource(
            $electionCampaignId,
            self::getElectionVoteSourceOfCommissionId(),
            $countVotes,
            $countNotValidVotes,
            $countHaveVote,
            $ballotBox->id,
            $city->id,
            false
        );

        //add election votes report for party in ballot
        foreach ($hashPartyIdVotes as $partyId => $countPartyVotes) {
            ElectionVotesReportPartyService::updateCountElectionVotesReportParty(
                $electionVotesReport->id,
                $partyId,
                $countPartyVotes,
                false
            );
        }
    }


    private static function insertElectionPartiesFromCsvHeader($electionCampaignId, $city = null, $excelColumnsParty, $headerRowExcel)
    {
        $hashPartyIdExcelColumnIndex = array();
        foreach ($excelColumnsParty as $key => $excelColParty) {
            $letterParty = $headerRowExcel[$excelColParty->excelIndexColumn];
            $electionCampaignParty = ElectionCampaignPartyListRepository::insert($electionCampaignId, $city, $letterParty, null);
            $hashPartyIdExcelColumnIndex[$excelColParty->excelIndexColumn] = $electionCampaignParty;
        }

        return $hashPartyIdExcelColumnIndex;
    }
}
