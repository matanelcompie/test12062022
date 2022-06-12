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
use App\Models;
use Exception;
use Illuminate\Support\Facades\Validator;
use stdClass;

class ManagerSave {

    public static function updateTable($modalName,$id=null,$key=null,$object,$arrFieldsUpdate,$notCheck=false,$throwException=true){
		try {
		
		$modal = '\App\Models\\' . $modalName;
		$old_object=is_null($id)?$modal::where('key',$key)->first():$modal::where('id',$id)->first();
		$arrFieldUpdate=[];
		if(!$old_object){
			Log::info('שגיאה בעדכון רשומה שאינה קיימת'.'Table -'.$modal.' key '.$key);
		}
		else
		{
			//if(is_null($arrFieldsUpdate))
			//$arrFieldsUpdate= array_keys($old_object->toArray());
			foreach ($arrFieldsUpdate as $key => $nameField) {
				//לשים פה פונקציה שנמצאת בהסטוריה
				//check was chang
				if(self::checkChangeValue($object->$nameField,$old_object->$nameField)){
					if(self::checkValueByModelList($nameField,$object->$nameField,$throwException) || $notCheck){
						$old_object->$nameField=$object->$nameField;
						$arrFieldUpdate[]=$nameField;
					}
				}
			}

			$result=new stdClass();
			$old_object->save();
			$result->modal_object=$old_object;
			$result->arrFieldUpdate=$arrFieldUpdate;
			return $result;
		}
			
			} catch (\Exception $e) {
				throw $e;
			}
	}

	public static function insertTable($modal,$object){

	}

	public static function deleteTable(){

	}

	private static function checkChangeValue($newValue,$oldValue){
		if((is_null($oldValue) && !is_null($newValue) && strcmp($newValue,'')!=0) ||
		   (is_null($newValue) && !is_null($oldValue) && strcmp($oldValue,'')!=0)   
		)
        return true;
        //return is_null($oldValue) !== $newValue;
        else //if(isset($newValue))
        return $oldValue != $newValue?true:false;
	}
	

	//function get nameField and value
	//the function check if the value exist
	//like city_id... street_id 
	private static function checkValueByModelList($nameField,$value,$exception=true){
	
		$detailField=menageValueField::propExist($nameField);
		$exceptionDetails=false;
	
		if($detailField && array_key_exists ('modal',$detailField)){
			$modal=$detailField['modal'];
			$modal='\App\Models\\' . $modal;
			
				if(!is_null($value)){
					$item=$modal::where('id',$value)->first();
					if(!$item){
						$exceptionDetails=config('errors.'.$detailField['error']);
				}
			}
		}
		else if($detailField && array_key_exists ('arr_value',$detailField) && !in_array($value,$detailField['arr_value']))
		$exceptionDetails=config('errors.'.$detailField['error']);

		else if($detailField && array_key_exists ('validate',$detailField)){
			$func=$detailField['validate'];
			if(!(menageValueField::$func($value)))
			$exceptionDetails=config('errors.'.$detailField['error']);
		}

		//have error
		if($exceptionDetails){
			if($exception)//check if throw
			throw new Exception($exceptionDetails);
			else{
				$jsonOutput = app()->make("JsonOutput");
				$jsonOutput->setErrorCode($exceptionDetails, 400);
				Log::info($jsonOutput->returnJson());
				return false;
			}
		}

		return true;
	}

}


class menageValueField{

	public static $city_id=array('modal'=>'City','error'=>'elections.INVALID_CITY');
	public static $street_id=array('modal'=>'Streets','error'=>'elections.STREET_NAME_NOT_VALID');
	public static $ethnic_group_id=array('modal'=>'Ethnic','error'=>'elections.VOTER_ETHNIC_GROUP_NOT_VALID');
	public static $religious_group_id=array('modal'=>'ReligiousGroup','error'=>'elections.VOTER_RELIGIOUS_GROUP_NOT_VALID');
	public static $gender=array('arr_value'=>[1,2,null],'error'=>'elections.GENDER_VALUE_NOT_VALID');		
	public static $sephardi=array('arr_value'=>[0,1],'error'=>'elections.SEPHARDI_VALUE_NOT_VALID');
	public static $actual_address_correct=array('arr_value'=>[0,1],'error'=>'elections.INVALID_ACTUAL_ADDRESS_CORRECT');
	public static $email=array('validate'=>'validateEmail','error'=>'elections.INVALID_EMAIL');
	
	public static function propExist($prop){
		
		if(property_exists(new menageValueField(),$prop))
		return menageValueField::$$prop;
		else
		return false;
	}

	public static function validateEmail($email) {
        $rules = [
            'email' => 'email'
        ];

        $validator = Validator::make(['email' => $email], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

}
