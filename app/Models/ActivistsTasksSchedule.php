<?php

namespace App\Models;

use App\Libraries\HelperDate;
use Illuminate\Database\Eloquent\Model;

class ActivistsTasksSchedule extends Model {
    public $primaryKey = 'id';
    protected $table = 'activists_tasks_schedule';

    public static $p_status=25;
    public static $p_phone_verified=25;
    public static $p_actual_address_correct=10;
    public static $p_sephardi=10;
    public static $p_ethnic_group_id=10;
    public static $p_religious_group_id=10;
    public static $p_gender=10;


    public static function getPresentForTodayByRole($role_id,$election_campaign_id){
            
        //default value present;
        $today_presents=0;
        $presents=ActivistsTasksSchedule::select()->where('role_id',$role_id)->where('election_campaign_id',$election_campaign_id)->where('active',1)->first();
       
        
        if($presents){
           $startDateTask=$presents->start_date;
           $endDateTask=$presents->end_date;

           //---calculate present grow all day
           $numberTaskDays=HelperDate::getNumDayBetween($startDateTask,$endDateTask)+1;
            // Log::info($numberTaskDays);
           //grow presents day ,calculate by  num days task / num present
           $present_day=($presents->end_percents-$presents->start_percents)/$numberTaskDays;

           $date_now = date("Y-m-d"); // this format is string comparable

           //check if today between date task
           if($date_now >= $startDateTask && $date_now<=$endDateTask){
               //check number day passed
               $passedDay=HelperDate::getNumDayBetween($startDateTask,$date_now)+1;
            //    Log::info($passedDay);
               //calculate today presents by num day passed * presents day + startPresents
               $today_presents= ($passedDay*$present_day)+$presents->start_percents;
           }
           //today passed end date
           else if($date_now>$endDateTask)
           return $presents->end_percents;
        }
        // Log::info($today_presents);
         return  $today_presents;

    }

    public static function sumOtherDetails(){
        $sum=0;
        $sum=$sum+self::$p_sephardi+self::$p_ethnic_group_id+self::$p_religious_group_id+self::$p_gender;
        return $sum;
    }


    
}
