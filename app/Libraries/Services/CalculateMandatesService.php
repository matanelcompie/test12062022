<?php

namespace App\Libraries\Services;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionVotesReportParty;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use stdClass;

class CalculateMandatesService
{

    private static $currentElectionCampaign;

    //חישוב אחוז החסימה
    //הפונקציה מקבלת את כמות הכשרים ומחזירה את אחוז החסימה
    //1
    private static function calculatePresentThreshold(){
        $countAllValidVotes=self::getCountAllValidVotesByPriority();
        $present=$countAllValidVotes*3.25/100;

        return $present;
    }

    private static function getCountAllValidVotesByPriority(){
        $electionCampaignId=self::$currentElectionCampaign->id;
        $countValidVotes=ElectionVotesReportParty::select(DB::raw('sum(election_votes_report_party.count_votes) as sum_valid_coted'))
        ->withElectionReportVotes($electionCampaignId,true);
        $countValidVotes=$countValidVotes->first();
    
        
        if($countValidVotes)
        return $countValidVotes->sum_valid_coted;

        else
        return 0;
    }

    //2.
    private static function getSumVotesForAllParty() {
        $electionCampaignId=self::$currentElectionCampaign->id;
        $groupPartyCount=ElectionVotesReportParty::select(DB::raw('election_campaign_party_lists.letters,election_campaign_party_lists.surplus_agreement_party_id,election_votes_report_party.party_id,sum(election_votes_report_party.count_votes) as sum_votes_party'))
        ->withElectionReportVotes($electionCampaignId,true)
        ->withPartyDetails()
        ->groupBy('election_votes_report_party.party_id')
        ->get();

        return $groupPartyCount;
    }


    //הפונקציה מקבלת את אחוז החסימה וכמות קולות לכל מפלגה
    //הפונקציה מחשבת כמה קולות נדרש בעבור מושב בקלפי
    private static function calculateNumberVotesForPlace($PresentThreshold,$arrPartyCount){
        //סכום קולות של מפלגות שלא עברו את אחוז החסימה
        $countVotesForNotOverParty=0;
        $allValidVotes=0;
        $arrOverParty=[];
        foreach ($arrPartyCount as $key =>$party) {
            
            $allValidVotes+=$party->sum_votes_party;
           if($party->sum_votes_party<$PresentThreshold){
             $countVotesForNotOverParty+=$party->sum_votes_party;
           }
           else
           $arrOverParty[]=$party;
           
        }
        Log::info('קולות'. $allValidVotes);
        $countRealValidVotes=$allValidVotes-$countVotesForNotOverParty;
        Log::info('מעל'. $countRealValidVotes);
        $CountVotesForPlace=$countRealValidVotes/120;

        return array('CountVotesForPlace'=>$CountVotesForPlace,'arrayOverParty'=>$arrOverParty);

    }


    private static function CalculatePlaceForOverParty($NumberVotesForPlace,$arrOverParty){

        $numberPlacesForAllParty=0;
        foreach ($arrOverParty as $key => $overParty) {
            $numberPlace=$overParty->sum_votes_party/$NumberVotesForPlace;
            $overParty->countPlaces=$numberPlace;//--intval
            $numberPlacesForAllParty+=$overParty->countPlaces;
        }

        return array('countPlaceParty'=>$numberPlacesForAllParty,'arrOverPartyPlace'=>$arrOverParty);
    }

    public static function getCouplePartyDetails($arrPartyPlaces){
        //array object that include eskem Odafim
        $arrCoupleParty=[];
        //$hashParty=Helper::makeHashCollection($arrPartyPlaces,'party_id');
        // Log::info('hash');
        // Log::info(json_encode($hashParty));

        foreach ($arrPartyPlaces as $key => $OverPartyPlaces) {
          if($OverPartyPlaces->surplus_agreement_party_id && array_key_exists($OverPartyPlaces->surplus_agreement_party_id,$arrCoupleParty))
          {
              $idCoupleParty=$OverPartyPlaces->surplus_agreement_party_id;
              $arrCoupleParty[$idCoupleParty]->countPartyPlaces+=$OverPartyPlaces->countPlaces;
              $arrCoupleParty[$idCoupleParty]->countPartyVotes+=$OverPartyPlaces->sum_votes_party;
              $arrCoupleParty[$idCoupleParty]->arrOverParty[]=$OverPartyPlaces;
          }
          else{
            $detailsCouple=new stdClass();
            $detailsCouple->arrOverParty=[$OverPartyPlaces];
            $detailsCouple->countPartyPlaces=$OverPartyPlaces->countPlaces;
            $detailsCouple->countPartyVotes=$OverPartyPlaces->sum_votes_party;
            $arrCoupleParty[$OverPartyPlaces->party_id]=$detailsCouple;
            $arrCoupleParty[$OverPartyPlaces->party_id]->madad=1;
          }
         
        }
       
        return $arrCoupleParty;
    }

    public static function calculateOtherPlaceForCoupleVoters($anotherPlace,$arrCoupleParty){

        $indexPartyMax=0;
        $maxDividedPlace=0;
        do {
          foreach ($arrCoupleParty as $party_key => $coupleParty) {
            $countPlaces=$coupleParty->countPartyVotes+$coupleParty->madad;
            $dividedPlace=$countPlaces/$coupleParty->countPartyVotes;

         
            if($dividedPlace>$maxDividedPlace){
                $maxDividedPlace=$dividedPlace;
                $indexPartyMax=$party_key;
            }

           }
           
           //add to the max divided place another place
           $arrCoupleParty[$indexPartyMax]->madad+=1;
           $anotherPlace=$anotherPlace-1;

        } while ($anotherPlace>0);

        return $arrCoupleParty;
    }

    private static function calculateCoupleNumberVotesForMandatesByCouple($arrCoupleParty){

            foreach ($arrCoupleParty as $key => $coupleParty) {
               
               if(count($coupleParty->arrOverParty)>1){
                    if($coupleParty->madad>1)
                    $coupleParty=self::getAnotherPlaceForCouple($coupleParty->madad,$coupleParty);
                    else{
                        $party1=$coupleParty->arrOverParty[0];
                        $party2=$coupleParty->arrOverParty[1];

                        $party1->finalMandates=$party1->countPlaces;
                        $party2->finalMandates=$party2->countPlaces;

                        $coupleParty->arrOverParty[0]=$party1;
                        $coupleParty->arrOverParty[1]=$party2;
                    }
               }
               else
               {
                   $party=$coupleParty->arrOverParty[0];
                   $party->finalMandates=$party->countPlaces;
                   $coupleParty->arrOverParty[0]=$party;
               }
              
            }

            return $arrCoupleParty;

    }

    public static function getAnotherPlaceForCouple($numberAnotherPlace,$CoupleObject){

        $party1=$CoupleObject->arrOverParty[0];
        $party2=$CoupleObject->arrOverParty[1];
        //(J) מספר המושבים שקיבלו רשימות a ו-b ביחד לאחר חלוקת המושבים בשלב השני
        $countPlaceCouple=$CoupleObject->countPartyPlaces+$CoupleObject->madad;
        $k=$CoupleObject->countPartyVotes/$countPlaceCouple;
        
        Log::info($party1->sum_votes_party);
        $countPlace1=($party1->sum_votes_party)/$k;
        $countPlace2=($party2->sum_votes_party)/$k;

        Log::info($k);
        Log::info($countPlace1);
        Log::info($countPlace2);

        do {
            $madadP1=$party1->sum_votes_party/($countPlace1+1);
            $madadP2=$party2->sum_votes_party/($countPlace2+1);

            if($madadP1>$madadP2)
            $countPlace1=$countPlace1+1;
            else
            $countPlace2=$countPlace2+1;

            $numberAnotherPlace=$numberAnotherPlace-1;

        } while ($numberAnotherPlace>0);

        $party1->finalMandates=$countPlace1;
        $party2->finalMandates=$countPlace2;

        $CoupleObject->arrOverParty[0]=$party1;
        $CoupleObject->arrOverParty[1]=$party2;
       
       return $CoupleObject;
    }

    public static function calculateMandates(){
        //first levelG91
        $election=ElectionCampaigns::select()->where('id',DB::raw(26))->first();
        self::$currentElectionCampaign =$election;// ElectionCampaigns::currentCampaign();
        $PresentThreshold=self::calculatePresentThreshold();
        Log::info($PresentThreshold);
        //level 1
        $countsVotesForParty=self::getSumVotesForAllParty();
      
        $detailsVotesForPlace=self::calculateNumberVotesForPlace($PresentThreshold,$countsVotesForParty);

        $numberVotesForPlace=$detailsVotesForPlace['CountVotesForPlace'];
        $arrOverParty=$detailsVotesForPlace['arrayOverParty'];
        // Log::info('מפלגות');
        // Log::info(json_encode($arrOverParty));
        // Log::info('מודד');
        // Log::info(json_encode($numberVotesForPlace));
        //level 2
        $detailsPlacesParty=self::CalculatePlaceForOverParty($numberVotesForPlace,$arrOverParty);
        $countPlaceParty=$detailsPlacesParty['countPlaceParty'];
        $arrPartyWithPlaces=$detailsPlacesParty['arrOverPartyPlace'];

        // Log::info('מפלגות ומקומות');
        // Log::info(json_encode($arrPartyWithPlaces));

        // Log::info('שלמים');
        // Log::info($countPlaceParty);

        $countAnotherPlaces=120 - $countPlaceParty;
      ;

        $arrCouplePartyDetails=self::getCouplePartyDetails($arrPartyWithPlaces);
        // Log::info('בייחד');
        // Log::info(json_encode((array)$arrCouplePartyDetails));


        $madadCouplePartyDetails=self::calculateOtherPlaceForCoupleVoters($countAnotherPlaces,$arrCouplePartyDetails);
        // Log::info('כמות');
        // Log::info(json_encode($madadCouplePartyDetails));

        $couple=self::calculateCoupleNumberVotesForMandatesByCouple($madadCouplePartyDetails);
        
      return  self::printMandates($couple);
      //  Log::info(json_encode($couple));

    }

    public static function printMandates($arrCouple){
      $hash=[];
        foreach ($arrCouple as $key => $couple) {
          foreach ($couple->arrOverParty as $o => $party) {
            $hash[$party->party_id]=round($party->finalMandates,2);
          //  Log::info($party->letters) ;
          //  Log::info($party->finalMandates) ;

          //  Log::info('__________________________________') ;
          }
        }

        return $hash;
    }


    private static function calculateMandatesForParty(){
           //חישוב אחוז החזימה למפלגה
  //$presentChsima=$countKolotKsherim*3.25/100;

  //ספירת קולות של כל המפלגות שלא עברו את אחוז החסימה

  //סכום קולות כשרים פחות סכום קולות כשרים שלא עברו את אחוז החסימה
    //$d
  //ון: מחלקים את מספר הקולות הכשרים של רשימות שעברו את אחוז החסימה ב-120
  //מודד הקולות הכללי למושב
  //$madad_moshav=$d/120

  //עוברים על כל המפלגות שעברו את אחוז החזימה ומחלקים לכל מפלגה את כמות הכשרים  ומחשבים כמה מושבים לכל מפלגה


    //חישוב כמות מושבים שנשארו-מחברים את כל המושבים שחולקו למפלגות ומחסירים מ 120


    //שלב ב'
    //עוברים על כל המפלגות וסוכמים לכל מפלגה(אם יש לך הסכם עם מפלגה אחרת זה נחשב אחד) את כמות הכשרים
    //(מחלקים בכמות מושבים שקיבלו. +1)

    //עוברים על כולם מי שקיבל הכי הרבה הוא מקבל מושב נוסף ואז החישבו _+2
    //ככה עד שמסתיים המושבים


    //שלב 3
 
    }


}