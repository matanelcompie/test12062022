<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $leader_id
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class SupportStatus extends Model {

    public $primaryKey = 'id';

    protected $table = 'support_status';

    /**
     * @var array
     */

    public function statusListForSectorialFilter() {
    	 $query = $this->newQuery();
    	 return $query->select("key", "name")->orderBy("level", "DESC")->get();
    }

    /**
     * Join support status on connected key
     *
     * @param object $query
     * @return object
     */
    public function scopeWithConnectedSupportStatus($query) {
    	return $query->leftJoin('support_status as connected_support_status', 'connected_support_status.id', '=', 'support_status.connected_support_status_id');
    }

    //-------status for election campaign-----

    public static function getSupportStatusByElection($election_Campaign_id,$only_main_level=false){
        $query=SupportStatus::select()->where('election_campaign_id',$election_Campaign_id)->where('level','>',0)->where('deleted',DB::raw(0));
        
        if(!$only_main_level)
        $SupportTypeObj=$query->get();
        else
        {
         $SupportTypeObj=$query->where('main_level',1)->first();

         if(!$SupportTypeObj)
         throw new Exception(config('errors.system.NOT_SET_MAIN_SUPPORT_ELECTION'));
         return  $SupportTypeObj->id;
        }
 
        return $SupportTypeObj->map(function($status){return $status->id;});
    }

    public static function getUnSupportStatusByElection($election_Campaign_id,$only_main_level=false){
        $query=SupportStatus::select()->where('election_campaign_id',$election_Campaign_id)->where('level','<',0)->where('deleted',DB::raw(0));
       
        if(!$only_main_level)
        $unSupportTypeObj=$query->get();
        else
        {
         $unSupportTypeObj=$query->where('main_level',1)->first();
         if(!$unSupportTypeObj)
         throw new Exception(config('errors.system.NOT_SET_MAIN_UN_SUPPORT_ELECTION'));
         return $unSupportTypeObj->id;
        }

     return $unSupportTypeObj->map(function($status){return $status->id;});
    }

    public static function getUndecidedTypeObjByElection($election_Campaign_id,$only_main_level=false){
        $query=SupportStatus::select()->where('election_campaign_id',$election_Campaign_id)->where('level','=',0)->where('deleted',DB::raw(0));

        if($only_main_level==false){
            $undecidedTypeObj=$query->get();
            if(!$undecidedTypeObj)
         throw new Exception(config('errors.system.NOT_SET_MAIN_UN_DECIDED_ELECTION'));
        }
       
        else
        {
         $undecidedTypeObj=$query->where('main_level',1)->first();
         if(!$undecidedTypeObj)
         throw new Exception(config('errors.system.NOT_SET_MAIN_UN_DECIDED_ELECTION'));

         return $undecidedTypeObj->id;
        }
  
        return $undecidedTypeObj->map(function($status){return $status->id;});
       
    }

}
