<?php

namespace App\Libraries\Services;

use App\Libraries\Helper;
use App\Libraries\ManagerSave;
use App\Libraries\Services\ServicesModel\VoterPhoneService;
use App\Libraries\Services\ServicesModel\VotersWithCaptainService;
use App\Models\ActivistsAllocations;
use App\Models\ActivistsTasksSchedule;
use App\Models\Area;
use App\Models\VoterPhone;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRoleShifts;
use App\Models\SupportStatus;
use App\Models\UserVoterActivities;
use App\Models\VoterCaptainFifty;
use App\Models\Voters;
use App\Models\VoterSupportStatus;
use App\Models\VoterTransportation;
use App\Models\VoteSources;
use Carbon\Carbon;
use Exception;
use Faker\Provider\bg_BG\PhoneNumber;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VoterDetailsService
{

    private static $arrFieldInActivistHistory=[''];

    public static function getVoterByKey($key){
        $voter=Voters::select()->where('key',$key)->first();
        return $voter?$voter:false;
    }

    public static function getVoteByPersonalIdentity($personal_identity){
        $voter=Voters::select()->where('personal_identity',$personal_identity)->first();
        return $voter?$voter:false;
    }

    //function get object to save voter_id and arr fields to  update
    public static function updateVoterDetails($object,$voter_id,$arrFields,$throwException=true){

        $arrFieldUpdate=ManagerSave::updateTable('Voters',$voter_id,null,$object,$arrFields,false,$throwException);
        return  $arrFieldUpdate;
    }

  

 

    //the function save arr phone and return true if its update mobile phone to know in history user activist
    public static function saveArrPhoneNumber($ArrPhoneNumber,$exception=false){

        $isUpdateMobilePhone=false;
            foreach ($ArrPhoneNumber as $key => $phone) {
               
                //new phone
                if(is_null($phone->id) && !is_null($phone->phone_number)){// && !$needToDeletePhone
                   if(Helper::isIsraelMobilePhone($phone->phone_number))
                      $isUpdateMobilePhone=true;
                    $phone=self::insertVoterPhoneNumber($phone,true,$exception);
                } else{//is update phone
                    //check if number is empty 
                    if(!is_null($phone->id) && strcmp($phone->phone_number,'')==0){
                        $phone->deleted=1;
                        $phone->wrong=1;
                        ManagerSave::updateTable('VoterPhone',$phone->id,null,$phone,['deleted','wrong'],false); // Need to delete phone number:
                    //    VoterPhone::updateCurrentPhoneWrong($phone->id,false);
                    } else{
                        $type=self::checkPhoneNumberByType($phone,$exception);
                        if($type!==false){
                            if($phone->verified==1){
                                $phone->wrong=0;
                                ManagerSave::updateTable('VoterPhone',$phone->id,null,$phone,['wrong', 'verified'],true);
                            } else if($phone->wrong==1){
                                $phone->verified=0;
                                ManagerSave::updateTable('VoterPhone',$phone->id,null,$phone,['wrong', 'verified'],true);
                            }
                           
                         //   if(env('APP_ENV') != 'staging'){ //--להוריד בעלאת גירסה
                              //  $phone=ManagerSave::updateTable('VoterPhone',$phone->id,null,$phone,['phone_number','phone_type_id','verified'],true);
                           // }else{
                                $arrField=['phone_number','phone_type_id'];
                                if(isset($phone->wrong))
                                $arrField[]='wrong';
                                if(isset($phone->verified))
                                $arrField[]='verified';
                              
                                $phone=ManagerSave::updateTable('VoterPhone',$phone->id,null,$phone,$arrField,true);
                          //  }
                            if($phone && count($phone->arrFieldUpdate)>0 && $type==config('constants.PHONE_TYPE_MOBILE')){
                                $isUpdateMobilePhone=true;
                             
                                //it was update phone and not verified
                                if(!in_array('verified',$phone->arrFieldUpdate)){
                                    $phone->modal_object->verified=1;//update to verified ok
                                    $phone->modal_object->wrong=0;//update to verified ok
                                    ManagerSave::updateTable('VoterPhone',$phone->modal_object->id,null, $phone->modal_object,['verified','wrong'],true);
                                }
    
                            }
                            if($phone)
                                $phone=$phone->modal_object;

                        }
                    
                    }
                
                }
               
            }
            return $isUpdateMobilePhone;
    }

    //$home_phone_number,$home_phone_number_id,$mobile_phone_number,$mobile_phone_number_id,$other_phone_number,$other_phone_number_id,
    public static function saveHorizontalPhoneByVoterKey($object,$voter_id=null){
        //create arr phone with details to save in saveArrPhoneNumber function 
     
        $arrPhoneSave=array();


        //--Update home phone
        if((!is_null($object->home_phone_number) && strcmp($object->home_phone_number,'')!=0) || !is_null($object->home_phone_number_id)){
            
                $home_phone=new VoterPhone();
                $home_phone->id=$object->home_phone_number_id;
                $home_phone->phone_number=str_replace('-', '',$object->home_phone_number);//$home_phone_number;
                $home_phone->voter_id=$voter_id;

                if(isset($object->home_phone_number_wrong))
                $home_phone->wrong=$object->home_phone_number_wrong;

                if(isset($object->home_phone_number_verified)){
                    $home_phone->verified=$object->home_phone_number_verified;
                    //if($home_phone->verified==1) $home_phone->wrong=0;
                }

                $home_phone->phone_type_id=config('constants.PHONE_TYPE_HOME');

                $arrPhoneSave[]=$home_phone;
        }

        //-- Update mobile phone
        if((!is_null($object->mobile_phone_number) && strcmp($object->mobile_phone_number,'')!=0) || !is_null($object->mobile_phone_number_id)){

                $mobile_phone=new VoterPhone();
                $mobile_phone->id=$object->mobile_phone_number_id;
                $mobile_phone->phone_number=str_replace('-', '',$object->mobile_phone_number);//$mobile_phone_number;
                $mobile_phone->voter_id=$voter_id;
                $mobile_phone->verified=$object->mobile_phone_number_verified;

                if(isset($object->mobile_phone_number_wrong))
                $mobile_phone->wrong=$object->mobile_phone_number_wrong;
    
                //if($mobile_phone->verified==1) $mobile_phone->wrong=0;
    
                $mobile_phone->phone_type_id=config('constants.PHONE_TYPE_MOBILE');
                $arrPhoneSave[]=$mobile_phone;
    
        } 

        //-- Update mobile phone
        if((!is_null($object->other_phone_number) && strcmp($object->other_phone_number,'')!=0) || !is_null($object->other_phone_number_id)){
            $other_phone=new VoterPhone();
            $other_phone->id=$object->other_phone_number_id;
            $other_phone->phone_number=str_replace('-', '',$object->other_phone_number);//$other_phone_number;
            $other_phone->voter_id=$voter_id;

            if(isset($object->other_phone_number_wrong))
            $other_phone->wrong=$object->other_phone_number_wrong;
            if(isset($object->other_phone_number_verified))
                $other_phone->verified=$object->other_phone_number_verified;
               // if($other_phone->verified==1) $other_phone->wrong=0;

            $other_phone->phone_type_id=config('constants.PHONE_TYPE_MOBILE');
            $arrPhoneSave[]=$other_phone;
        } 
        
        $response=self::saveArrPhoneNumber($arrPhoneSave);
        
        return $response;

    }

    //must be private for insert phone you need use with ActionArrPhoneNumber
    private static function insertVoterPhoneNumber($phoneNumber,$verifiedPhone=true,$exception=false){
        if(self::checkPhoneNumberByType($phoneNumber,$exception)){

            $newVoterPhone=VoterPhoneService::checkIfExistNumberBeforeInsert($phoneNumber->voter_id,$phoneNumber->phone_number,true);

            if($newVoterPhone==false){
                $newVoterPhone = new VoterPhone;
                $newVoterPhone->phone_number =str_replace('-', '',$phoneNumber->phone_number);
                $newVoterPhone->voter_id = $phoneNumber->voter_id;
                $newVoterPhone->key = Helper::getNewTableKey('voter_phones', VoterPhone::$lengthKey);
                $newVoterPhone->phone_type_id = $phoneNumber->phone_type_id;
                $newVoterPhone->verified=$verifiedPhone;
                $newVoterPhone->save();
            }
        
            return $newVoterPhone;
        }
    }

    private static function checkPhoneNumberByType($phoneNumber,$exception=true){
        $exceptionDetails=false;
        switch ($phoneNumber->phone_type_id) {
            case config('constants.PHONE_TYPE_MOBILE'):{
               if(!Helper::isIsraelMobilePhone($phoneNumber->phone_number))
               $exceptionDetails=config('errors.elections.PHONE_TYPE_IS_NOT_VALID');
               else
               return config('constants.PHONE_TYPE_MOBILE');
               
            }

            case config('constants.PHONE_TYPE_HOME'):{
                if(!Helper::isIsraelLandPhone($phoneNumber->phone_number))
                $exceptionDetails=config('errors.elections.PHONE_TYPE_IS_NOT_VALID');
                else
                return config('constants.PHONE_TYPE_HOME');
            }                
        }
        
        if($exceptionDetails){
            if($exception)//check if throw
			throw new Exception($exceptionDetails);
			else{
				$jsonOutput = app()->make("JsonOutput");
				$jsonOutput->setErrorCode($exceptionDetails, 400);
				
				return false;
			}
        }
    }


    //VoterTransportations save
    public static function SaveVoterTransportations($voter_id,$election_Campaign_id,$need_transportation,$cripple=0,$voter_driver_id=null){
        
        if(is_null($cripple))
        $cripple=0;
        $VoterTransportation=VoterTransportation::select()->where('voter_id',$voter_id)->where('election_campaign_id',$election_Campaign_id)->first();

      //need VoterTransportation and not have record
      if(($need_transportation==true || intval($need_transportation)==1)){
          if(!$VoterTransportation ){
            $VoterTransportation=new VoterTransportation();
            $VoterTransportation->key=Helper::getNewTableKey('voter_transportations', VoterTransportation::$lengthKey);
            $VoterTransportation->voter_id=$voter_id;
            $VoterTransportation->election_campaign_id=$election_Campaign_id;    
            $VoterTransportation->cripple=$cripple;
            $VoterTransportation->voter_driver_id=$voter_driver_id;
            $VoterTransportation->save(); 
            return $VoterTransportation;   
          }
          else if($VoterTransportation->voter_driver_id!=$voter_driver_id) {
            $VoterTransportation->voter_driver_id=$voter_driver_id;
            $VoterTransportation->save(); 
            return $VoterTransportation; 
          } 
      }
      //voter not need Transportation should delete record
      else if($VoterTransportation && ($need_transportation==false || intval($need_transportation)==0)){
        $VoterTransportation->delete();
      }
    }


    //the function update or insert status support for voter
    //function get prams is_support is can be only 1/true-support,0/false-un support and 2- undecided
    //function return true if the user update status for voter
    public static function saveVoterSupportStatus($voter_id,$election_Campaign_id,$is_support,$ENTITY_TYPE_VOTER_SUPPORT=null){

        if(is_null($ENTITY_TYPE_VOTER_SUPPORT))
        $ENTITY_TYPE_VOTER_SUPPORT=config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');

         //get record voter_VoterSupportStatus
        $VoterSupportStatus=VoterSupportStatus::select()->where('voter_id',$voter_id)->where('election_campaign_id',$election_Campaign_id)->where('entity_type',$ENTITY_TYPE_VOTER_SUPPORT)->where('deleted','<>',1)->first();

        if(!is_null($is_support) && strcmp($is_support,'')!=0)
        {
        //get id of support and un support type for election_Campaign
        $SupportTypeId=SupportStatus::getSupportStatusByElection($election_Campaign_id,true);
        $unSupportTypeId=SupportStatus::getUnSupportStatusByElection($election_Campaign_id,true);
        $undecidedTypeId=SupportStatus::getUndecidedTypeObjByElection($election_Campaign_id,true);

        if($is_support===true || intval($is_support)==1)//support
        $SupportTypeId=$SupportTypeId;
        else if($is_support===false || intval($is_support)==0)
        $SupportTypeId=$unSupportTypeId;//unSupport   
        else if(intval($is_support)==2)
        $SupportTypeId=$undecidedTypeId;//undecided
        else
        throw new Exception(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
       
        if(!$VoterSupportStatus){//new
         $VoterSupportStatus=new VoterSupportStatus();
         $VoterSupportStatus->key=Helper::getNewTableKey('voter_support_status', VoterSupportStatus::$lengthKey);
         $VoterSupportStatus->voter_id=$voter_id;
         $VoterSupportStatus->election_campaign_id=$election_Campaign_id;
         $VoterSupportStatus->entity_type=$ENTITY_TYPE_VOTER_SUPPORT;
         $VoterSupportStatus->support_status_id=$SupportTypeId;
         $VoterSupportStatus->create_user_id=Auth::user()->id;
         $VoterSupportStatus->save();
         return true;
        }
            else if($VoterSupportStatus->support_status_id!=$SupportTypeId)//update
            {
                $VoterSupportStatus->update_user_id=Auth::user()->id;
                $VoterSupportStatus->support_status_id=$SupportTypeId;
                $VoterSupportStatus->save();
                return true;
            }
        }

        else if(is_null($is_support) && $VoterSupportStatus && !is_null($VoterSupportStatus->support_status_id)){//remove record VoterSupportStatus
            $VoterSupportStatus->delete();
        }

        return false;
    }


    public static function saveRecognizedCaptain($voter_id,$election_Campaign_id,$captain_id,$recognized){

        $VoterCaptainFifty=VoterCaptainFifty::select()->where('election_campaign_id',$election_Campaign_id)->where('voter_id',$voter_id)->where('captain_id',$captain_id)->first();
        if($VoterCaptainFifty){
            // if($recognized==true || intval($recognized)==1)
            // $VoterCaptainFifty->recognized=1;
            // else if(is_null($recognized) && strc)
            $VoterCaptainFifty->recognized=$recognized;
        
            ManagerSave::updateTable('VoterCaptainFifty',$VoterCaptainFifty->id,null,$VoterCaptainFifty,['recognized'],false,false);
        }
        else{
            throw new Exception(config('errors.elections.VOTER_NOT_CONNECT_TO_USER'));
        }
    }


    
    //function must get object include voterPhones prop type arr phonr number
    //function return the object with horizontal phone
    public static function horizontalPhone($voterDetails){
        
          
            $phones=$voterDetails->voterPhones;
      
           //reset horizontal phone
           $voterDetails->mobile_phone_number=null;$voterDetails->mobile_phone_number_id=null;$voterDetails->mobile_phone_number_verified=0;$voterDetails->mobile_phone_number_wrong=0;
           $voterDetails->other_phone_number=null;$voterDetails->other_phone_number_id=null;$voterDetails->other_phone_number_verified=0;$voterDetails->other_phone_number_wrong=0;
           $voterDetails->home_phone_number=null;$voterDetails->home_phone_number_id=null;$voterDetails->home_phone_number_verified=0;$voterDetails->home_phone_number_wrong=0;
            // dd($phones->toArray());
           if(count($phones)>0)
           foreach ($phones as $key => $phone) {
              
               //home
               if(is_null($voterDetails->home_phone_number) &&  Helper::isIsraelLandPhone($phone->phone_number))//&& $phone->phone_type_id==config('constants.PHONE_TYPE_HOME')
               {
                   $voterDetails->home_phone_number = $phone->phone_number;$voterDetails->home_phone_number_id=$phone->phone_id;
                   $voterDetails->home_phone_number_verified = $phone->verified; $voterDetails->home_phone_number_wrong = $phone->wrong;

               }
               //mobile
               else if(is_null($voterDetails->mobile_phone_number) && Helper::isIsraelMobilePhone($phone->phone_number))//&& $phone->phone_type_id==config('constants.PHONE_TYPE_MOBILE')
               {
                   $voterDetails->mobile_phone_number = $phone->phone_number; $voterDetails->mobile_phone_number_id = $phone->phone_id;
                   $voterDetails->mobile_phone_number_verified = $phone->verified; $voterDetails->mobile_phone_number_wrong = $phone->wrong;
               }
               //other
               else if(is_null($voterDetails->other_phone_number) && Helper::isIsraelMobilePhone($phone->phone_number))//&& $phone->phone_type_id==config('constants.PHONE_TYPE_MOBILE')
               {
                   $voterDetails->other_phone_number=$phone->phone_number; $voterDetails->other_phone_number_id=$phone->phone_id;
                   $voterDetails->other_phone_number_verified=$phone->verified; $voterDetails->other_phone_number_wrong=$phone->wrong;
               }

           }
           unset($voterDetails->voterPhones);

      return $voterDetails;
    }


    public static function getCountVoterByCaptainId($voter_captain_id,$election_campaign_id){
        $count=VoterCaptainFifty::select(DB::raw(' COUNT(distinct voters_with_captains_of_fifty.voter_id) as count_voters'))
        ->where('voters_with_captains_of_fifty.captain_id',$voter_captain_id)
        ->where('voters_with_captains_of_fifty.election_campaign_id',$election_campaign_id)
        ->where('deleted',0)
        ->first();
        // $count=Voters::select(DB::raw(' COUNT(distinct voter_id) as count_voters'))
        //         ->leftJoin('voters_with_captains_of_fifty', 'voter_id', '=', 'voters.id')
        //         ->where('voters_with_captains_of_fifty.captain_id',$voter_captain_id)
        //         ->where('voters_with_captains_of_fifty.election_campaign_id',$election_campaign_id)->first();
        if($count)
        return $count->count_voters;
        else return false;

    }

    public static function getCountVoterByCaptainIdWithAllPresent($voter_captain_id,$election_campaign_id){
        $count=Voters::select(DB::raw('count(distinct voters_with_captains_of_fifty.voter_id) as count_voters_presents'))
        ->join('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
        ->withCaptain50Only($election_campaign_id)
       // ->join('voters_with_captains_of_fifty', 'voters_with_captains_of_fifty.voter_id', '=', 'voters.id')
       //->where('voters_with_captains_of_fifty.election_campaign_id',$election_campaign_id)
         //---
        ->where('voters_with_captains_of_fifty.captain_id',$voter_captain_id)
        
        //PRESENTS
        ->where('voters.actual_address_correct',1)//address
        ->whereExists(function($query){
            $query->select('voter_phones.id')->from('voter_phones')
            ->where('voter_phones.voter_id',DB::raw('voters.id'))
            ->where('wrong',0)
            ->where('verified',1)
            ->where('phone_number','like','05%')->limit(1);
        })//phone
        ->whereNotNull('ethnic_group_id')//ethnic_group_id
        ->whereNotNull('religious_group_id')//religious_group_id
        ->whereNotNull('gender')//gender
        ->whereNotNull('sephardi')//sephardi
        // ->whereNotNull('voter_support_status.id')//voter_support_status
        ->where('voter_support_status.election_campaign_id',$election_campaign_id)//voter_support_status
        ->where('voter_support_status.entity_type',config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION'))//address
        
        ->first();
        if($count)
        return $count->count_voters_presents;
        else return false;

    }

    public static function getCountPresentVoterDetailDon($voter_captain_id,$election_campaign_id){
        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $sub=self::subQuery($election_campaign_id,$unSupportTypeArr,$voter_captain_id);
     
        $count=Voters::select(
        DB::raw(self::getQueryPresentDetailsVoter($election_campaign_id))
        )->from(DB::raw('('.$sub->toSql().') as voter1'))
        ->setBindings([$sub->getBindings()])
        ->first();
         //Log::info();
        if($count)
        return $count->present;
        else return 0;
    }

    private static function subQuery ($election_campaign_id,$unSupportTypeArr,$voter_captain_id){
       $query= Voters::select(DB::raw('distinct voters.id as voter_id, voters.*'))->withCaptain50Only($election_campaign_id)
        ->withSupportStatus0($election_campaign_id)//not include not support
        ->where(function ($q) use ($unSupportTypeArr) {//not include not support
            $q->whereNotIn('vs0.support_status_id', $unSupportTypeArr)
                ->orWhereNull('vs0.support_status_id');
        })
        //->join('voters_with_captains_of_fifty', 'voters_with_captains_of_fifty.voter_id', '=', 'voters.id')
        //->where('election_campaign_id',$election_campaign_id)
        ->where('captain_id',$voter_captain_id);

        return $query;
    }


    //function return count support voter by captain
    //function can  get params includePhone-return count voter support with verified phone
    //function can get params includeUndecided count voter support and undecided
    public static function getCountVoterSupportByUserCaptainId($voter_captain_id,$election_campaign_id,$includePhone=false,$includeUndecided=false){

        $SupportTypeArr=SupportStatus::getSupportStatusByElection($election_campaign_id);
        if($includeUndecided){
        $UndecidedTypeArr=SupportStatus::getUndecidedTypeObjByElection($election_campaign_id);
        $SupportTypeArr=$SupportTypeArr->merge($UndecidedTypeArr);
        }
        
        $count=self::getCountVoterSupportTypetByUserCaptainId($voter_captain_id,$election_campaign_id,$SupportTypeArr,$includePhone);
      
        return  $count;
    }

    //function return count voter that no opposed-only support/null/undecided
    public static function getCountVoterNotOpposedByCaptainId($voter_captain_id,$election_campaign_id){
        $unSupportTypeArr = SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $query=Voters::select(DB::raw('count(distinct voters.id) as count_voters_support_type'))
        ->leftJoin('voter_support_status', function ($joinOn) use ($election_campaign_id) {
            $joinOn->on('voter_support_status.voter_id', '=', 'voters.id')/* = */
                ->on('voter_support_status.election_campaign_id', '=', DB::raw($election_campaign_id))/* = */
                ->on('voter_support_status.deleted', '=', DB::raw(0))/* = */
                ->on('voter_support_status.entity_type', '=', DB::raw(config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')));
            })
        ->withCaptain50Only($election_campaign_id,true)
         //---
        ->where('voters_with_captains_of_fifty.captain_id',$voter_captain_id)
        ->where(function ($q) use ($unSupportTypeArr) {
            $q->whereNotIn('voter_support_status.support_status_id', $unSupportTypeArr)
                ->orWhereNull('voter_support_status.support_status_id');
        });

     
       $query=$query->first();
        if($query)
        return $query->count_voters_support_type;
        else return 0;
    }

    public static function queryGetCountVoterSupportTypetByUserCaptainId($voter_captain_id,$election_campaign_id,$SupportTypeArr,$entity_type){
        if(is_null($entity_type))
        $entity_type=config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');

        $query=Voters::select(DB::raw('count(distinct voters.id) as count_voters_support_type'))
        ->leftJoin('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
        ->withCaptain50Only($election_campaign_id,true)
        // ->leftJoin('voters_with_captains_of_fifty', 'voters_with_captains_of_fifty.voter_id', '=', 'voters.id')
        // ->where('voters_with_captains_of_fifty.election_campaign_id',$election_campaign_id)
         //---
        ->where('voters_with_captains_of_fifty.captain_id',$voter_captain_id)
        
        ->whereIn('voter_support_status.support_status_id',$SupportTypeArr)//voter_support_status
        ->where('voter_support_status.election_campaign_id',$election_campaign_id)//voter_support_status
        ->where('voter_support_status.entity_type',$entity_type)
        ->where('voter_support_status.deleted',DB::raw(0));

        return $query;
    }

    //support all voter
    public static function getCountVoterSupportTypetByUserCaptainId($voter_captain_id,$election_campaign_id,$SupportTypeArr,$includePhone=false,$entity_type=null,$onlyVoterVotes=false,$needTrans=false){
       //query count voter by support type and entity by captain id
        $query=self::queryGetCountVoterSupportTypetByUserCaptainId($voter_captain_id,$election_campaign_id,$SupportTypeArr,$entity_type);
        //-------phone------------
        if($includePhone)//support with phone
        $query=$query->whereExists(function($queryin){
            $queryin->select('voter_phones.id')->from('voter_phones')
            ->where('voter_phones.voter_id',DB::raw('voters.id'))
            ->where('wrong',0)
            ->where('verified',1)
            ->where('phone_number','like','05%');//->limit(1);
        });

        //-----------only voters votes-----------
        if($onlyVoterVotes){
            $query->withElectionVotes($election_campaign_id);
        }

        //-----need transportation---
        if($needTrans){
            $query->withElectionTransportation($election_campaign_id);
        }

        $query=$query->first();

        if($query)
        return $query->count_voters_support_type;
        else
        return 0;
    }



    //un_support
    public static function getPresentUnSupportByUserCaptainId($voter_captain_id,$election_campaign_id){

        $unSupportTypeArr=SupportStatus::getUnSupportStatusByElection($election_campaign_id);
        $count=self::getCountVoterSupportTypetByUserCaptainId($voter_captain_id,$election_campaign_id,$unSupportTypeArr);

        return $count;
    }

    //count voter with phone or not with phone
    // public static function getCountVoterParamsExistPelePhone($voter_captain_id,$election_campaign_id){
      
        
    //     $count=Voters::select(DB::raw('count(voters_with_captains_of_fifty.voter_id) as count_voters_Phone'))
    //     ->leftJoin('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
    //     ->leftJoin('voters_with_captains_of_fifty', 'voters_with_captains_of_fifty.voter_id', '=', 'voters.id')
    //      //---
    //     ->where('voters_with_captains_of_fifty.captain_id',$voter_captain_id)
    //     ->where('voters_with_captains_of_fifty.election_campaign_id',$election_campaign_id)
    //     //support with phone
    //     ->whereExists(function($query){
    //         $query->select('voter_phones.id')->from('voter_phones')
    //         ->where('voter_phones.voter_id',DB::raw('voters.id'))
    //         ->where('wrong',0)
    //         ->where('verified',0)
    //         ->where('phone_number','like','05%')->limit(1);
    //     })->first();

    //     if($count)
    //     return $count->count_voters_Phone;
    //     else
    //     return false; 

    // }

    //the function get object voter and return arr by near by voter in Household_id or in building if Household_id < 6 voters
    public static function getNearByVoterByVoterObject($voter){
        //--house near by
        $nearByHousehold=Voters::select('key','deceased')
        ->where('household_id',$voter->household_id)
        ->where(function($query){
                $query->whereNull('deceased')
              ->orWhere('deceased', '<>',1);
        })
        ->where('id','<>',$voter->id)->offset(0)->limit(6)->get();

        //---building near by---
        if(!$nearByHousehold || count($nearByHousehold)<6)
        {
            $nearByBuilding=Voters::select('key')
                   ->where('city_id', $voter->city_id)
                   ->where('street_id',$voter->street_id) 
                   ->where('house',$voter->house)
                   ->where('id','<>',$voter->id)
                   ->where('household_id','<>',$voter->household_id)
                   ->where(function($query){
                    $query->whereNull('deceased')
                  ->orWhere('deceased', '<>',1);
            })
                   ->orderBy('id', 'DESC')
                   ->offset(0)->limit(6-count($nearByHousehold))->get();
                   if($nearByBuilding){
                        if($nearByHousehold){
                            $nearByHousehold=collect($nearByHousehold)->merge(collect($nearByBuilding));
                        }
                        else
                        $nearByHousehold=$nearByBuilding;
                   }
                   
                   
        }


    if(count($nearByHousehold)>0)
    $nearByHousehold=$nearByHousehold->map(function($voter){return $voter->key;});

    return $nearByHousehold;
    }


    // function get voter id and phone number
    //check if is not exist phone its insert new phone
    public static function saveSinglePhoneNumberByVoter($voter_id,$phoneNumber,$Activist_voter_id,$rol_id,$election_Campaign_id=null){

        $phoneNumber=str_replace('-', '',$phoneNumber);
        $phone=VoterPhone::select()->where('voter_id',$voter_id)->where('phone_number',$phoneNumber)->where('wrong',0)->first();
        if(!$phone){
            $newVoterPhone = new VoterPhone;
            $newVoterPhone->phone_number =$phoneNumber;
            $newVoterPhone->voter_id = $voter_id;
            $newVoterPhone->key = Helper::getNewTableKey('voter_phones', VoterPhone::$lengthKey);
            $type= VoterPhone::getPhoneTypeByPhoneNumber($phoneNumber);
            if($type===false)
            throw new Exception(config('errors.elections.PHONE_VALUE_IS_NOT_VALID'));

            $newVoterPhone->phone_type_id =$type;
            $newVoterPhone->save();

            if($type==config('constants.PHONE_TYPE_MOBILE'))
            self::putUserActivistOnVoterDetails(['mobile_phone'],$rol_id,$Activist_voter_id,$voter_id,$election_Campaign_id);
            return $newVoterPhone;
        } 
    }

     //update activist by update voter details
    public static function putUserActivistOnVoterDetails($arrFieldsUpdate,$rol_id,$Activist_voter_id,$voter_id,$election_Campaign_id=null){
     
     
        //arr field for update history
        $arrFieldToUpdate=array(
            'gender'=>'update_gender',
            'actual_address_correct'=>'update_actual_address',
            'ethnic_group_id'=>'update_ethnic_group_id',
            'religious_group_id'=>'update_religious_group_id',
            'sephardi'=>'update_sephardi',
            'mobile_phone'=>'update_mobile_phone',
            'voter_support_status'=>'update_voter_support_status'
        );

        //update fields
        if(count($arrFieldsUpdate)>0){
           
            if(is_null($election_Campaign_id))
            $election_Campaign_id=ElectionCampaigns::currentCampaign()->id;
    
            $ActivistVoterDetails=UserVoterActivities::select()
            ->where('election_roles_id',$rol_id)
            ->where('Activist_voter_id',$Activist_voter_id)
            ->where('election_Campaign_id',$election_Campaign_id)
            ->where('voter_id',$voter_id)->first();

            if(!$ActivistVoterDetails){
                $ActivistVoterDetails=new UserVoterActivities();
                $ActivistVoterDetails->voter_id=$voter_id;
                $ActivistVoterDetails->election_Campaign_id=$election_Campaign_id;
                $ActivistVoterDetails->Activist_voter_id=$Activist_voter_id;
                $ActivistVoterDetails->election_roles_id=$rol_id;
            }
    
            foreach ($arrFieldsUpdate as $field) { 
                if(array_key_exists($field,$arrFieldToUpdate)){
                    $field=$arrFieldToUpdate[$field];
                    $ActivistVoterDetails->$field=Carbon::now();
                }
            }
    
           $ActivistVoterDetails->save();

        }
   

    }


    //add voter to captain fifty by captain fifty or cluster
    public static function addVoterWithCaptainFifty($key_voter,$mobile_phone_number,$captain_voter_id,$election_campaign_id,$activist_voter_id,$role_id_user,$voter_driver_id=null){
        
        $voter=Voters::select('id')->where('key',$key_voter)->first();
        
        if(!$voter)
        throw new Exception(config('errors.elections.VOTER_DOES_NOT_EXIST'));


    //VoterDetailsService::saveSinglePhoneNumberByVoter($voter->id,$mobile_phone_number,$activist_voter_id,$role_id_user,$election_campaign_id);

    $voterWithCaption=self::getCaptainWithVoter($voter->id,$election_campaign_id,$captain_voter_id);

        if($voterWithCaption && $voterWithCaption->captain_id!=$captain_voter_id)
        throw new Exception(config('errors.elections.VOTER_CONNECT_TO_DIFFERENT_CAPTAIN'));

        //create new connection to captain voter
        else if(!$voterWithCaption){
            VotersWithCaptainService::addVoterWithCaptain($election_campaign_id,$voter->id,$captain_voter_id,1,Auth::user()->id,VotersWithCaptainService::$source_application);
            
            // $voterWithCaption=new VoterCaptainFifty();
            // $voterWithCaption->key=Helper::getNewTableKey('voters_with_captains_of_fifty', VoterCaptainFifty::$lengthKey);
            // $voterWithCaption->election_campaign_id=$election_campaign_id;
            // $voterWithCaption->voter_id=$voter->id;
            // $voterWithCaption->captain_id=$captain_voter_id;
            // $voterWithCaption->recognized=1;
            
            // $voterWithCaption->save();
        }

        //save driver if exist
        if($voter_driver_id && strcmp($voter_driver_id,'')!=0){
            self::SaveVoterTransportations($voter->id,$election_campaign_id,true,0,$voter_driver_id);
        }
    }


    //search voter by address or personal_identity by captain 
    //phone is required
    //function return last name first name and address of voter and phone voter that in system, its can different number from phone get
    public static function getVoterByPersonalIdentityOrAddress($personal_identity,$city_id,$street_id,$house,$last_name,$first_name,$mobile_phone_number,$election_Campaign_id,$captain_id){

       //get role for insert phone by user activist when the phone not exist
        $role_id=ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
        //get the voter by details field
        $voter=Voters::select(
            'voters.key as personal_identity',
            'voters.id',
            'voters.first_name',
            'voters.last_name',
            $city_id?DB::raw('(CASE WHEN city_id='.$city_id.' THEN city_id else mi_city_id end) AS city_id'):'city_id',
            $street_id?DB::raw('(CASE WHEN street_id='.$street_id.' THEN street_id else mi_street_id end) AS street_id'):'street_id',
            $house?DB::raw('(CASE WHEN house='.$house.' THEN house else mi_house end) AS house'):'house'
            )
            ->join('voters_in_election_campaigns','voters_in_election_campaigns.voter_id','=','voters.id')
            ->with(['voterPhones'=>function($innerQuery) 
            {$innerQuery->select('voter_phones.id as phone_id','voter_phones.phone_number' , 'voter_phones.phone_type_id' , 'voter_phones.voter_id','verified')
                ->where('wrong', 0)
                ->withVoters()
                //->orderBy('voter_phones.id', 'DESC');
                ->orderByRaw(Voters::orderPhoneQuery('voters',false))->first();
            }
            ]) 
            ->where('personal_identity',$personal_identity)
            ->orWhere(function($query) use ($city_id,$street_id,$house,$first_name,$last_name){
            $query->where(function($query)use ($city_id){$query->where('city_id',$city_id)->orWhere('mi_city_id',$city_id);}) 
                  ->where(function($query)use ($street_id){$query->where('street_id',$street_id)->orWhere('mi_street_id',$street_id);}) 
                  ->where(function($query)use ($house){$query->where('house',$house)->orWhere('mi_house',$house);}) 
                  ->where('first_name',$first_name)
                  ->where('last_name',$last_name)
                  ;
        })->first(); 

        //find voter
        if(!$voter)
        throw new Exception(config('errors.elections.ENTER_PERSONAL_IDENTITY_OR_ADDRESS'));

        //save get phone by activist
        VoterDetailsService::saveSinglePhoneNumberByVoter($voter->id,$mobile_phone_number,$captain_id,$role_id,$election_Campaign_id);

        
        
        //check if voter connect to different captain id
        $voterWithCaption=self::getCaptainWithVoter($voter->id,$election_Campaign_id,$captain_id);
        if($voterWithCaption && $voterWithCaption->captain_id!=$captain_id)
        throw new Exception(config('errors.elections.VOTER_CONNECT_TO_DIFFERENT_CAPTAIN'));

        //----------------------phone voter ------------------
        
         if(count($voter->voterPhones)>0)
         $voter->mobile_phone_number=($voter->voterPhones[0])->phone_number;
         else
             //return the phone that insert now
             $voter->mobile_phone_number=$mobile_phone_number;

     
       $voter->makeHidden('id');//mast id in query byt not to display
       unset($voter->voterPhones);
       return $voter; 
    }



    public static function getCaptainWithVoter($voter_id,$election_campaign_id){

        $voterWithCaption=VoterCaptainFifty::select()
        ->where('election_campaign_id',$election_campaign_id)
        ->where('voter_id',$voter_id)
        ->where('deleted','<>',1)->first();

       
        return $voterWithCaption;

    }


    //get details voter by voter number in specific ballot box
    public static function getVoterDetailsByVoterNumberInBallotBox($ballot_box_id,$election_campaign_id,$voter_serial_number,$listFields){
        $vote_source_id=VoteSources::getIdBySystemName('applications');
        $voter=Voters::select($listFields)
         ->addSelect('votes.key as voted')
         ->addSelect(DB::raw('(CASE WHEN  support_status2.level > 0 then 1 
         WHEN  support_status2.level < 0 then 0 
         WHEN  support_status2.level = 0 then 2 
         End) as is_shas_final_supporter
         '))
         ->withBallotBoxes($election_campaign_id)
         ->withFinalSupportStatus($election_campaign_id, true)
         ->withSupportStatuses($election_campaign_id) //status_voter
         ->withElectionVotes($election_campaign_id,true,$vote_source_id)
         ->where('voters_in_election_campaigns.voter_serial_number',$voter_serial_number)
         ->where('ballot_boxes.id',$ballot_box_id)->first();
        return $voter;
    }

      //get details voter by voter number in specific ballot box
      public static function getDetailsBallotBoxByPersonalIdentity($personal_identity,$election_campaign_id){
        $voter=Voters::select([DB::raw('ballot_boxes.*')])->withBallotBoxes($election_campaign_id)
        ->where('voters.personal_identity',$personal_identity)->first();
        return $voter;
    }

 


    //----------------------queries-----------------------------

    public static function getQueryCountVoterSupportType($election_campaign_id,$SupportTypeArr,$includePhone=false,$entityTypeStatus=null){
        if(is_null($entityTypeStatus))
        $entityTypeStatus=config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION');

        $query=Voters::select(DB::raw('count(distinct voters.id) as count_voters_support_type'))
        ->join('voter_support_status', 'voter_support_status.voter_id', '=', 'voters.id')
        ->whereIn('voter_support_status.support_status_id',$SupportTypeArr)//voter_support_status
        ->where('voter_support_status.election_campaign_id',$election_campaign_id)//voter_support_status
        ->where('voter_support_status.entity_type',$entityTypeStatus)
        ->where('voter_support_status.deleted',DB::raw(0));

        if($includePhone)//support with phone
        $query=$query->whereExists(function($queryIn){
            $queryIn->select('voter_phones.id')->from('voter_phones')
            ->where('voter_phones.voter_id',DB::raw('voters.id'))
            ->where('wrong',0)
            ->where('verified',1)
            ->where('phone_number','like','05%');//->limit(1);
        });

       return $query;
    }

    public static function getQueryPresentDetailsVoter($election_campaign_id,$voter='voters'){
        $a='
        sum( 
        if(  voter1.actual_address_correct=1 , '.ActivistsTasksSchedule::$p_actual_address_correct.' , 0 ) +
        if( voter1.sephardi is not null , '.ActivistsTasksSchedule::$p_sephardi.' , 0 )+
        if( voter1.gender is not null , '.ActivistsTasksSchedule::$p_gender.',  0 ) +
        if( voter1.religious_group_id is not null , '.ActivistsTasksSchedule::$p_religious_group_id.' , 0 ) +
        if( voter1.ethnic_group_id is not null , '.ActivistsTasksSchedule::$p_ethnic_group_id.' , 0 ) + 
        if(  (select id from voter_support_status where voter_support_status.voter_id=voter1.id and voter_support_status.election_campaign_id='.$election_campaign_id.'  and voter_support_status.entity_type='.config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION').' and deleted=0 limit 1) is not null , '.ActivistsTasksSchedule::$p_status.' , 0 ) +
        if(  (select voter_phones.id from voter_phones where voter_phones.voter_id=voter1.id and wrong=0 and verified=1 and phone_number like "05%" limit 1) is not null , '.ActivistsTasksSchedule::$p_phone_verified.' , 0 )
        ) as present';
        return $a;
        
    }

    public static function getQueryPresentOnlyOtherDetailsVoter($election_campaign_id,$table='voters'){
        $a='
        sum( 
        if ('.$table.'.sephardi is not null , '.ActivistsTasksSchedule::$p_sephardi.',0)+
        if ('.$table.'.gender is not null , '.ActivistsTasksSchedule::$p_gender.', 0) +
        if ('.$table.'.religious_group_id is not null , '.ActivistsTasksSchedule::$p_religious_group_id.' , 0 ) +
        if ('.$table.'.ethnic_group_id is not null , '.ActivistsTasksSchedule::$p_ethnic_group_id.' , 0 ) 
        ) as present';
        return $a;
        
    }




}