<?php

namespace App\Models;

use App\Libraries\Helper;
use Illuminate\Database\Eloquent\Model;


class VoterPhone extends Model {

    public static $lengthKey = 10;
    public $primaryKey = 'id';
    protected $table = 'voter_phones';


    public function voters() {
        return $this->belongsTo( 'App\Models\Voters', 'id', 'voter_id' );
    }

    public function scopeWithVoters ( $query, $isLeftJoin=false ) {
        if($isLeftJoin){
            $query->leftJoin('voters', 'voters.id', '=', 'voter_phones.voter_id');
        }else{
            $query->join('voters', 'voters.id', '=', 'voter_phones.voter_id');
        }
    }

	public function scopeWithPhoneTypes ( $query ) {
            $query->join('phone_types', 'voter_phones.phone_type_id', '=', 'phone_types.id');
    }

    //
    public static function getPhoneTypeByPhoneNumber($phoneNumber){
          
        if(Helper::isIsraelMobilePhone($phoneNumber))
        return config('constants.PHONE_TYPE_MOBILE');

        if(Helper::isIsraelLandPhone($phoneNumber))
        return config('constants.PHONE_TYPE_HOME');
        
        else
        return false;
        
    }
    public static function updateCurrentPhoneWrong($currentPhoneId,$delete_phone=true){
        $currentPhone = VoterPhone::select('id', 'verified', 'wrong')->where('id', $currentPhoneId)->first();
        if($currentPhone){
            if($currentPhone->verified == 1){
                $currentPhone->verified = 0;
            } else if($currentPhone->wrong == 0){
                $currentPhone->wrong = 1;
            } else if($delete_phone && $currentPhone->wrong == 1){
                $currentPhone->deleted = 1;
            }
            $currentPhone->save();
        }
    }
}