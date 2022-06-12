<?php

namespace App\Libraries;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\ElectionCampaigns;
use App\Models\VoterCaptainFifty;
use App\Models\VotersUpdatesByCaptains;
use App\Models\RequestTopicUsers;
use App\Models\Teams;
use App\Models\User;

class HelperDate
{

    //function get tow date and return number date between not include end date !!!
    //the function need get string date by format Ymd like 2021-12-21
    public static function getNumDayBetween($startDate, $endDate)
    {
        $startDateTime = strtotime($startDate);
        $endDateTime = strtotime($endDate);
        $date_differ = $endDateTime - $startDateTime;

        return round($date_differ / (60 * 60 * 24));
    }


    /**
     * Function that checks and returns whether dateTime variable is in correct format
     *
     * @param string $dateTimeStr
     * @return boolean
     */
    public static function isDateTimeCorrectFormat($dateTimeStr)
    {
        $returnedValue = false;
        if ($dateTimeStr != null && $dateTimeStr != '' && trim($dateTimeStr) != '') {
            $len = strlen($dateTimeStr);
            if ($len == 19) {
                $dtArr = explode(' ', $dateTimeStr);
                if (sizeof($dtArr) == 2) {

                    $dateArray = explode('-', $dtArr[0]);
                    $timeArray = explode(':', $dtArr[1]);
                    if (sizeof($dateArray) == 3 && sizeof($timeArray) == 3) {

                        if (is_numeric($dateArray[0]) && is_numeric($dateArray[1]) && is_numeric($dateArray[2])) {
                            if (checkdate($dateArray[1], $dateArray[2], $dateArray[0])) {

                                if (is_numeric($timeArray[0]) && is_numeric($timeArray[1]) && is_numeric($timeArray[2])) {
                                    $hours = intval($timeArray[0]);
                                    $minutes = intval($timeArray[1]);
                                    $seconds = intval($timeArray[1]);
                                    if ($hours >= 0 && $hours <= 24) {
                                        if ($minutes >= 0 && $minutes <= 60) {
                                            if ($seconds >= 0 && $seconds <= 60) {
                                                $returnedValue = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } elseif ($len == 10) {
                $dateArray = explode('-', $dateTimeStr);
                if (sizeof($dateArray) == 3) {
                    if (checkdate($dateArray[1], $dateArray[2], $dateArray[0])) {
                        $returnedValue = true;
                    }
                }
            }
        }

        return $returnedValue;
    }

    /**
     * Get string date by dd/mm/yyyy or dd-mm-yyyy and convert to string by format yyyy-mm-dd
     *
     * @param [type] $stringDate
     * @return void
     */
    public static function convert_DDMMYYYY_toSqlDateString($stringDate)
    {
        $stringDate = str_replace("/", "-", $stringDate);
        $newDate = date(
            "Y-m-d",
            strtotime($stringDate)
        );

        return  $newDate;
    }
}
