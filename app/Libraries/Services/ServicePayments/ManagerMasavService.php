<?php

namespace App\Libraries\Services\ServicePayments;

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
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class ManagerMasavService
{

    public static function mb_strrev($str) {
        return $str;
        // $r = '';
        // for ($i = mb_strlen($str); $i >= 0; $i--) {
        //     $r .= mb_substr($str, $i, 1);
        // }
        // return $r;
    }

    public static function ManageCreateMasav($arrPayments){
     
    }


    public static function createTitleMasav($masavId,$indexFile){
            $paymentDate =str_replace('-','',date("y-m-d"));//תאריך יצירה

            $nameFile='masav'.$masavId.'index'.$indexFile.'-'.date("y-m-d");

            $urlFile=config('constants.MASAVS_FILE_DIRECTORY').$nameFile.'.msv';
            $myFile =fopen($urlFile, "w");
         
            $currentCampaign =ElectionCampaigns::currentCampaign();
            $numOrganization=$currentCampaign->mosad_masav_number;

            if(is_null($numOrganization) || strcmp($numOrganization,'')==0)
                $numOrganization='11111111';//default num mosad

            $numOrganization_8digit=$numOrganization;
            if(strlen($numOrganization_8digit)>8)
            throw new Exception(config('errors.payments.ERROR_NUMBER_MOSAD_MASAV'));

            else if(strlen($numOrganization_8digit)<8) 
            $numOrganization_8digit=str_repeat("0", 8 - (mb_strlen($numOrganization_8digit))).$numOrganization_8digit;
            

            //---יצירת כותרת
            $title = "K";//=
            $title = $title . $numOrganization_8digit;//מספר מוסד 8 ספרות
            $title = $title . '00';
            $title = $title . $paymentDate;
            $title = $title . '00010' . $paymentDate;
            $title = $title . substr($numOrganization, 0, 5); //מס המוסד בחמש ספרות
            $title = $title . '000000';
            $paymentSubject = $currentCampaign->name;
            if(strlen($paymentSubject)>30)
            throw new Exception(config('errors.payments.ERROR_NAME_ELECTION_CAMPAIGN_MASAV'));

            $paymentSubject = self::mb_strrev($paymentSubject);

            $title = $title . str_repeat(" ", 30 - (mb_strlen($paymentSubject)));
            $title = $title . $paymentSubject;
            $title = $title . str_repeat(" ", 56);
            $title = $title . 'KOT' . "\r\n";

   
            $data =self::inCode($title);
         
            //$data=$title;
            fwrite($myFile, $data);

            $details=new stdClass();
            $details->myFile=$myFile;
            $details->nameFile=$nameFile;
            $details->numOrganization_8digit=$numOrganization_8digit;
            return $details;
    }

    public static function recordInMasav($payment,$numOrganization_8digit){
        $record='';//איפוס רשומה
        $record=$record.'1'. $numOrganization_8digit.'00'.'000000';
        
        //bank
        $bank=$payment->bank_id;
        $record=$record.str_repeat("0",2-(mb_strlen($bank)));//אם מספר הבנק הוא רק ספרה אחת
        $record=$record.$bank;
        
        //branchNumber
        $branch=$payment->branch_number;
        $record=$record.str_repeat("0",3-(mb_strlen($branch)));//אם מספר סניף הוא פחות משלוש ספרות
        $record=$record.$branch;
        
        //typeAcount
        $record=$record.'0000';
 
        //accountNumber
        $accountNum=$payment->bank_account_number;
        if(strpos($accountNum,'/')!== false){
            $accountNum=str_replace('/', '',$accountNum);
        }
        if(strpos($accountNum,'-')!== false){
            $accountNum=str_replace('-', '',$accountNum);
        }
        $record=$record.str_repeat("0",9-(mb_strlen($accountNum)));//אם מספר חשבון הוא פחות מתשע ספרות 
        $record=$record.$accountNum;
 
       $record=$record.'0';
        
        //מס זהות של בעל החשבון
        $AccountOwnerId=$payment->bank_account_owner_id;     
        $record=$record.str_repeat("0",9-(mb_strlen($AccountOwnerId)));//אם מספר תעודת זהות הוא פחות מתשע ספרות 
        $record=$record.$AccountOwnerId;
        
         
        //namePerson
        $namePerson=self::mb_strrev($payment->full_name);
 
        if(mb_strlen($namePerson)>16){
          $record=$record.mb_substr($namePerson,0,16);
        }
        else{
             $record=$record.str_repeat(" ", 16-(mb_strlen($namePerson)));
             $record=$record.$namePerson;  
            }
 
        
        //סכום לתשלום
 
        $payments=$payment->amount;//הורדת הנקודה
        $paymArr = explode(".", $payments);
 
        //שקלים
        $record=$record.str_repeat("0",11-(mb_strlen($paymArr[0])));
        $record=$record.$paymArr[0];
 
        //אגורות
        if(isset($paymArr[1])){
            $record=$record.$paymArr[1];
            $record=$record.str_repeat("0",2-(mb_strlen($paymArr[1])));
             }
        else{
             $record=$record.str_repeat("0",2);
            }
 
        //מס מזהה של הלקוח בתוכנה
        $voter_id=$payment->voter_id;
        $record=$record.str_repeat("0",20-(mb_strlen($voter_id)));
        $record=$record.$voter_id;
        
        $record=$record.str_repeat("0",8);//תקופת התשלום אפשרי אפסים
        $record=$record.str_repeat("0",3);//קוד מלל
        $record=$record.'006';
        $record=$record.str_repeat("0",18);
        $record=$record.str_repeat(" ",2);
        $record=$record."\r\n";

        return $record;

    }

    /*function get object payment group
    function get arr type stdClass include:
    payment object include
    1.amount-amount of record activist payment
    2.
    */

    public static function createMasavFiles($arrPayment,$payment_group_id){
       $sumPayment=0;//sum record in file
       $CountRecord=0;//count record in file
       $indexFile=0;// index file in arr payment -the max record in file is 500;


            $details=self::createTitleMasav($payment_group_id,$indexFile);
            $myFile=$details->myFile;
            $nameFile=$details->nameFile;
            $numOrganization_8digit=$details->numOrganization_8digit;
            foreach ($arrPayment as $key => $payment) {
            
            $record=self::recordInMasav($payment,$numOrganization_8digit);

            $sumPayment=$sumPayment+(float)$payment->amount;

            // $data = mb_convert_encoding($record,'UTF-8', 'auto');
            $data =self::inCode($record);
            

            fwrite($myFile, $data);
            $CountRecord++;
            
            // if($CountRecord==150 || $key==count($arrPayment)-1)//אם עברו  מאה חמישים רשומות או שסתיים הרשימה
            //     {  
            //         self::SetCalculateInFile($myFile,$sumPayment,$CountRecord,$numOrganization_8digit);

                    
            //         $sumPayment=0;
            //         $indexFile++;
            //         $CountRecord=0;
                
            //         if($CountRecord==150){//אם נגמרו מאה חמישים רשומות אך לא כל הרשומות הסתיימו מיצרים ופותחים קובץ חדש
            //             $group_payments=paymentsGroupService::copyGroupPayment($group_payments);
            //              $details=self::createTitleMasav($group_payments->id,$indexFile);
            //                 $myFile=$details->myFile;
            //         }
                    
            //     }
            }//end for each


            self::SetCalculateInFile($myFile,$sumPayment,$CountRecord,$numOrganization_8digit);

            return $nameFile;
    }



    //כתיבת שורת סיכום לקובץ
public static function SetCalculateInFile($myFile,$sumPayment,$CountRecord,$numOrganization_8digit){
            $paymentDate =str_replace('-','',date("y-m-d"));//תאריך יצירה
            //--------------יצירת רשומת סהכ---
            $totalRecord='5'.$numOrganization_8digit.'00'.$paymentDate.'0'.'001';
            $paymentsTotal=number_format($sumPayment, 2, '.', '');
            $paymentsTotal=str_replace('.','',$paymentsTotal);//הורדת הנקודה
            $totalRecord=$totalRecord.str_repeat("0",15-(mb_strlen($paymentsTotal)));
            $totalRecord=$totalRecord.$paymentsTotal;
            $totalRecord=$totalRecord.str_repeat("0",15);
            $totalRecord=$totalRecord.str_repeat("0",7-(mb_strlen((string)$CountRecord)));
            $totalRecord=$totalRecord.$CountRecord;
            $totalRecord=$totalRecord.str_repeat("0",7);
            $totalRecord=$totalRecord.str_repeat(" ",63)."\r\n";
            $totalRecord=$totalRecord.str_repeat("9",128);
            // $totalRecord = str_repeat("9", 128) . "\r\n";
            $data =self::inCode($totalRecord);
            //----כתיבה לקובץ------
        //file_put_contents($myfile, $data);
        fwrite($myFile,$data);  
}


public static function inCode($txt) {


            //return iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $txt);//48
          
            //return iconv("UTF-8", "CP437//IGNORE",$txt);//50

            //$txt = mb_convert_encoding($txt, 'UTF-8', 'auto');

           //  $data = mb_convert_encoding($title, 'UTF-8', 'auto');
            
            //  return mb_convert_encoding($txt,"ASCII", 'auto');
            //$data = mb_convert_encoding($totalRecord, 'UTF-8', 'auto');
           
            $txt= iconv("UTF-8","cp1255",$txt);
            // $txt = mb_convert_encoding($txt,'cp1255', 'auto');
           
            return $txt;
           // return mb_convert_encoding($txt,"ASCII", 'UTF-8');
            
            //  $data=iconv("UTF-8", "CP437",$title);
            //$data = mb_convert_encoding($title,"ASCII", 'auto');
}





}


               