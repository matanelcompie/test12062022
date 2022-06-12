<?php

namespace App\Http\Controllers;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Jobs\csvJob;
use App\Libraries\CsvParser;
use App\Libraries\Helper;
use App\Models\CsvFileFields;
use App\Models\CsvFileRows;
use App\Models\CsvFiles;
use App\Models\CsvSources;
use App\Models\InstituteRole;
use App\Models\Institutes;
use App\Models\SupportStatus;
use App\Models\Voters;
use App\Models\Ethnic;
use App\Models\ReligiousGroup;
use App\Models\Streets;
use App\Models\InstituteNetwork;
use App\Models\VoterGroups;
use App\Repositories\CsvDocumentRepository;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Redis;

define('NUMBER_OF_ROWS_RETURNED', 5);

class ElectionsImportController extends Controller
{
    private $errorsResultDataArray=[
        'invalid_ids' => 'CSV_PARSER_ERROR_INVALID_IDENTITY',
        'unknown_voter' => 'CSV_PARSER_ERROR_UNKNOWN_VOTER',
        'invalid_phones' => 'CSV_PARSER_ERROR_INVALID_PHONE',
        'missing_user_permission' => 'CSV_PARSER_ERROR_USER_MISSING_PERMISSIONS',

        'city_not_valid' => 'CSV_PARSER_ERROR_INVALID_CITY',
        'date_not_valid' => 'CSV_PARSER_ERROR_INVALID_DATE',
        'ethnic_not_valid' => 'CSV_PARSER_ERROR_INVALID_ETHNIC',
        'religious_not_valid' => 'CSV_PARSER_ERROR_INVALID_RELIGIOUS_GROUP',
        'vote_time_not_valid' => 'CSV_PARSER_ERROR_INVALID_VOTE_TIME',
        'email_not_valid' => 'CSV_PARSER_ERROR_INVALID_EMAIL',
        'phone_not_valid' => 'CSV_PARSER_ERROR_INVALID_PHONE',
        'support_status_not_exist' => 'CSV_PARSER_ERROR_INVALID_SUPPORT',

        'sepharadi_not_valid' => 'CSV_PARSER_ERROR_INVALID_SEPHARDI',
        'strictly_orthodox_not_valid' => 'CSV_PARSER_ERROR_INVALID_STRICTLY_ORTHODOX',
        'deceased_not_valid' => 'CSV_PARSER_ERROR_INVALID_DECEASED',

        'zip_not_valid' => 'CSV_PARSER_ERROR_INVALID_ZIP',
        'key_not_valid' => 'CSV_PARSER_ERROR_INVALID_Key', //!! need to add text in
    ];
    
    /**
     * This function maps the columns of
     * the csv file to fields to be updated.
     *
     * At the moment the data will be recieved from
     * Postman until the UI is ready.
     * Columns that are not mapped will be null.
     *
     *
     * Example of params sent in Postman to the
     * url: http://localhost/shas/public/api/csv/file/{csvFileKey}/parse     *
     *
     * Params:
     * {"key_values":["personal_identity",null,"phone_number",null,null,"sephardi","email","support_status"]}
     *
     * @param $csvFileKey
     * @param Request $request - Array which it's name is: "key_values" where each key is $column => $fieldName
     */
	 
	private function validatePersonalIdentity($personalIdentity) {
        $pattern = '/^[0-9]{2,10}$/';

        return preg_match($pattern, $personalIdentity);
    }
	 
	/**
	 * Search voter by identity number of other params
     * @param Request $request
     */
    public function search(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

		$requiredFields = ['voters.key as voters_key' ,
             						       'voters.personal_identity as personalIdentity',
										   'voters.first_name as firstName',
										   'voters.last_name as lastName' , 
										   'voters.city as cityName' , 
										   'voters.street'
										   ];
        if ($request->input('is_personal_identity_search') == 1){
                    // Voter search by Personal Identity
            $personalIdentity = $request->input('personal_identity', null);
			      if ($personalIdentity) {
                $personalIdentity = ltrim($personalIdentity, '0');
            
                if (!$this->validatePersonalIdentity($personalIdentity)) {
                    $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
                    return;
                } else { 
                    $voterObj = Voters::select($requiredFields);
                    
                   
                    $voterObj =$voterObj->where('personal_identity', $personalIdentity)->first();
                }            

                if (null == $voterObj) {
                    $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
                    $jsonOutput->setData(array());
					return;
                } else {
                    $jsonOutput->setData($voterObj);
                }
            } else{
                $jsonOutput->setErrorCode(config('errors.elections.PERSONAL_IDENTITY_NOT_VALID'));
                return;
            }
      

		}
		else{
			$firstName = $request->input('first_name');
			$lastName = $request->input('last_name');
 
			if($firstName == null || trim($firstName) == '' || $lastName==null || trim($lastName) == ''){
				$jsonOutput->setErrorCode(config('errors.elections.FIRST_NAME_AND_LAST_NAME_REQUIRED'));
                return;
			}
			$voterObj = Voters::select($requiredFields)->where('first_name' , $firstName)->where('last_name' , $lastName);
			if($request->input('city') != null && trim($request->input('city')) != ''){
				$cityIDArray =  json_decode($request->input('city') , true);
				$cityID = -1;
				if(sizeof($cityIDArray) > 0  && sizeof($cityIDArray[0] > 0))
				{
						$cityID= $cityIDArray[0]['id'];			
				}
				if($cityID == -1){
					$jsonOutput->setErrorCode(config('errors.elections.WRONG_CITY_FORMAT'));
					return;
				}
				$voterObj = $voterObj->where('city_id' , $cityID);
				
				if($request->input('street') != null && trim($request->input('street')) != ''){
					$streetArray =  json_decode($request->input('street') , true);
					$streetKey = $streetArray['key'];
					$street = Streets::select('id' , 'name')->where('key',$streetKey)->where('deleted' , 0)->where('city_id',$cityID)->first();
				    if(!$street){
						$jsonOutput->setErrorCode(config('errors.elections.INVALIDA_STREET_KEY'));
					    return;
					}
					$voterObj = $voterObj->where('street' , $street->name);
			    }
				
			}
			
			$jsonOutput->setData($voterObj->limit(50)->get());
		}
	}

	/*
		Function that handles deleting csv file by its key
	*/
	public function deleteCsvFile(Request $request , $csvFileKey){
		$jsonOutput = app()->make("JsonOutput");
		$csvFile = CsvFiles::where('key', $csvFileKey)->where('status','!=' , config('constants.CSV_PARSER_STATUS_AT_WORK'))->where('deleted',0)->first();
		if(!$csvFile){
			$jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
		}
		$csvFile->deleted=1;
		$csvFile->save();
		$jsonOutput->setData("ok");
	}
	 
	/*
		Function that creates for csv file its columns in DB , with column names from mapped by hashed array
	*/ 
    public function mapCsvFields($csvFileKey, Request $request)    {
        $csvFile = CsvFiles::select(['id'])->where('key', $csvFileKey)->first();
        $csvFileId = $csvFile->id;

        $arrOfCsvKeysValues = $request->input('key_values');
        $insertData = [];

        // Loops through Array key_values.
        // Only column index which it's value
        // is not null will be inserted to the
        // table "csv_file_fields
        for ($index = 0; $index < count($arrOfCsvKeysValues); $index++) {
            if ($arrOfCsvKeysValues[$index] != null) {
                $insertData[] = [
                    'key' => Helper::getNewTableKey('csv_file_fields', 5),
                    'csv_file_id' => $csvFileId,
                    'column_number' => $index,
                    'field_name' => $arrOfCsvKeysValues[$index],
                ];
            }
        }

        // Insert the mapped columns to "csv_file_fields" table
        CsvFileFields::insert($insertData);

        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData($insertData);
    }

    /**
     * This function parses the csv
     * file by executing a job that
     * runs in the server background.
     *
     * @param $csvFileKey
     */
	 
	 
	 
    public function parseCsvFile($csvFileKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        $csvFile = CsvFiles::select(['id'])->where('key', $csvFileKey)->first();
        $csvFileId = $csvFile->id;

        // Getting the job details
        $job = (new csvJob(new CsvParser(), $csvFileId))->onConnection('redis')->onQueue('csv');

        // Executing the job which parses the csv file
        $this->dispatch($job);

        //ActionController::AddHistoryItem('elections.import.execute', $csvFile->id, 'CsvFiles');

        $jsonOutput->setData($job);
    }

    /**
     * This function returns screen data for csv file .
    * The screen data is currentTab (stage) , previous relevant data to be injected into UI:
     */
    public function getCsvDataByKey(Request $request, $fileKey)
    {
        $jsonOutput = app()->make("JsonOutput");
	 
        //first all server validations :
        if ($fileKey == null || trim($fileKey) == '') {
	
            $jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
        }
	
        $loadThirdStage = false;
        $loadFourthStage = false;

		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFile = CsvFiles::select("id" , "process_id")->where([ 'csv_files.deleted'=> 0 , 'status'=>config('constants.CSV_PARSER_STATUS_AT_WORK') , 'csv_files.key' => $fileKey])->first();
		if ($runningFile){
			if (!Redis::get('services:csv:'.$runningFile->id)){
				CsvFiles::where('id',$runningFile->id)->update(['status'=> config('constants.CSV_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
		}
		
        $csvFile = CsvFiles::select('csv_files.id',
                                    'csv_files.ethnic_group_id',
                                    'csv_files.religious_group_id',
                                    'csv_files.voter_group_id',
                                    'csv_files.gender',
                                    'csv_files.strictly_orthodox',
                                    'ethnic_groups.name as ethnic_group_name',
                                    'religious_groups.name as religious_group_name',
                                    'csv_files.name',
                                    'csv_files.file_size',
                                    'csv_files.header',
                                    'csv_files.status',
                                    'csv_sources.name AS data_source',
                                    'voters.key AS voter_key',
                                    'voters.personal_identity AS voter_identity',
                                    'voters.first_name',
                                    'voters.last_name',
                                    'csv_files.file_name',
                                    'support_status.id AS support_status_id',
                                    'support_status.name AS support_status_name',
                                    'update_household_support_status',
                                    'update_support_status_if_exists',
                                    'support_status_update_type')
            ->join('csv_sources', 'csv_sources.id', 'csv_files.csv_source_id')
            ->leftJoin('support_status', 'support_status.id', 'csv_files.support_status_id')
            ->join('voters', 'voters.id', 'csv_files.captain_id')
			->leftJoin('ethnic_groups' ,function($joinOn){$joinOn->on('ethnic_groups.id' , '=','csv_files.ethnic_group_id')->where('ethnic_groups.deleted','=',0);})
            ->leftJoin('religious_groups' ,function($joinOn){$joinOn->on('religious_groups.id' , '=','csv_files.religious_group_id')->where('religious_groups.deleted','=',0);})
            ->with(['fields' => function ($query) {
                $query->select('csv_file_id', 'column_number', 'field_name');
            }])
            ->where('csv_files.key', $fileKey)->where('csv_files.deleted', 0)->first();
 
        if ($csvFile) { //csv file exists  - construct the returned data :
 
            $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
 
		   if (!file_exists($newFileDestination . $csvFile->file_name)) {
		 
                $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
                return;
            }
            $arrData = array();
            $arrDataDefinition = array();
            $arrDataDefinition['fileData'] = $this->getCsvFileSummarizedData(config('constants.CSV_UPLOADS_DIRECTORY'), $csvFile->file_name, $csvFile->name, $csvFile->file_size, $csvFile->header);
            $arrDataDefinition['fileData']['id'] = $csvFile->id;
            $arrData['dataDefinition'] = $arrDataDefinition;
            $arrData['dataSource'] = $csvFile->data_source;
            $arrData['voterKey'] = $csvFile->voter_key;
            $arrData['voterIdentity'] = $csvFile->voter_identity;
            $arrData['first_name'] = $csvFile->first_name;
            $arrData['last_name'] = $csvFile->last_name;
            $arrData['fields'] = $csvFile->fields;

            if($csvFile->support_status_id){
                $arrData['selectedStatus'] = ["id"=>$csvFile->support_status_id,"value"=>$csvFile->support_status_name];
                $arrData['update_household_support_status'] = $csvFile->update_household_support_status;
                $arrData['support_status_update_type'] = $csvFile->support_status_update_type;
                $arrData['update_support_status_if_exists'] = $csvFile->update_support_status_if_exists;
            }
			if($csvFile->ethnic_group_id){
                $arrData['selectedEthnicGroup'] = ["id"=>$csvFile->ethnic_group_id,"value"=>$csvFile->ethnic_group_name];
            }
            if($csvFile->religious_group_id){
                $arrData['selectedReligiousGroup'] = ["id"=>$csvFile->religious_group_id,"value"=>$csvFile->religious_group_name];
            }
			$arrData['selectedVoterGroupFullPathname'] = '';
			if($csvFile->voter_group_id){
				
				$arrPathParts = [];
				$currentVoterGroup = VoterGroups::where('id' , $csvFile->voter_group_id)->where('deleted',0)->first();
				while($currentVoterGroup){
					array_push($arrPathParts , $currentVoterGroup->name);
					$currentVoterGroup = VoterGroups::where('id' , $currentVoterGroup->parent_id)->where('deleted',0)->first();
					
				} 
				for($i = sizeof($arrPathParts)-1 ; $i>=0;$i--){
					$arrData['selectedVoterGroupFullPathname'] .= $arrPathParts[$i];
					if($i != 0){
						$arrData['selectedVoterGroupFullPathname'] .= " > ";
					}
				}
              //  $arrData['selectedVoterGroupFullPathname'] = ["id"=>$csvFile->ethnic_group_id,"value"=>$csvFile->ethnic_group_name];
            }
			if($csvFile->gender){
                $arrData['selectedGender'] = ["id"=>$csvFile->gender,"value"=>($csvFile->gender == 1 ? 'זכר':($csvFile->gender == 2?'נקבה':null) )];
            }
			 
                $arrData['selectedOrthodox'] = ["id"=>$csvFile->strictly_orthodox,"value"=>($csvFile->strictly_orthodox == '0' ? 'לא':($csvFile->strictly_orthodox == 1?'כן':null) )];
             

            if ($csvFile->status == config('constants.CSV_PARSER_STATUS_DID_NOT_START')) {
                $arrData['loadData'] = 'dataDefinition';
                $csvFileFields = CsvFileFields::select(['id'])->where('csv_file_id', $csvFile->id)->get();
                if (count($csvFileFields) > 0) {
                    $loadThirdStage = true;
                    $arrData['loadData'] = 'extraData';

                }
            } else {
                $loadThirdStage = true;
                $loadFourthStage = true;
                $arrData['loadData'] = 'lastStep';
            }
            if ($loadThirdStage) {
                $arrExtraData = array();
            }
            $jsonOutput->setData($arrData);

        } else {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }
    }

    /**
     * This function return csv files - if user is admin -  will return all csv files of all users ,
   * otherwise it will return only files of logged in user.
     */
    public function getAllCsvFilesSummonDetails(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");

        $fieldsToSelect = [
            'csv_files.id',
            'csv_files.key',
            'csv_files.name',
            'csv_files.row_count',
            'csv_files.current_row',
            'csv_files.created_at',
            'csv_files.status',
            'csv_files.user_create_id',
            'csv_files.file_size',
            'csv_files.header',
            'voters.first_name',
            'voters.last_name',
        ];

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
		
		
		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFiles = CsvFiles::select("id" , "process_id")->where([ 'csv_files.deleted'=> 0 , 'status'=>config('constants.CSV_PARSER_STATUS_AT_WORK')])->get();
		for($i=0;$i<count($runningFiles);$i++){
			$item = $runningFiles[$i];
			 
			if (!Redis::get('services:csv:'.$item->id)){
				CsvFiles::where('id',$item->id)->update(['status'=> config('constants.CSV_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
				//echo "process died";
			}
			else{
				  //echo "process running";
			}
		}
		

        $where = [];

        $from_date = $request->input('from_date', null);
        $to_date = $request->input('to_date', null);

        $execution_status = $request->input('execution_status', null);
        if ( !is_null($execution_status) ) {
            $where['csv_files.status'] = $execution_status;
        }

        $csvFileObj = CsvFiles::select($fieldsToSelect)
            ->withUser()
            ->where('csv_files.deleted', 0);

        $file_name = $request->input('file_name', null);
        if ( !is_null($file_name) ) {
            $csvFileObj->where('csv_files.name', 'LIKE', '%' . $file_name . '%');
        }

        if (Auth::user()->admin != '1') {
            $csvFileObj->where('csv_files.user_create_id', Auth::user()->id);
        }

        if ( count($where) > 0 ) {
            $csvFileObj->where($where);
        }

        $user = $request->input('user', null);
        if ( !is_null($user) ) {
            $csvFileObj->where(DB::raw('CONCAT( voters.first_name, " ", voters.last_name )'), 'like', '%' . $user . '%');
        }

        if ( !is_null($from_date) ) {
            $csvFileObj->where('csv_files.created_at', '>=', $from_date . ' 00:00:00');
        }

        if ( !is_null($to_date) ) {
            $csvFileObj->where('csv_files.created_at', '<=', $to_date . ' 23:59:59');
        }

        $totalRows = $csvFileObj->count();

        $sort_by_field = $request->input('sort_by_field', null);
        $sort_direction = $request->input('sort_direction', 'asc');
        if ( !is_null($sort_by_field) ) {
            switch ($sort_by_field) {
                case 'status':
                    $csvFileObj->orderBy('csv_files.status', $sort_direction);
                    break;

                case 'user':
                    $csvFileObj->orderBy('voters.first_name', $sort_direction);
                    $csvFileObj->orderBy('voters.last_name', $sort_direction);
                    break;

                case 'date':
                default:
                    $csvFileObj->orderBy('csv_files.created_at', $sort_direction);
                    break;
            }
        }

        $current_page = $request->input('current_page', 1);
        $limit = $request->input('num_of_rows');
        $skip = ($current_page - 1) * $limit;

        $dataArray = $csvFileObj->skip($skip)->take($limit)->get();

        $result = [
            'rows' => $dataArray,
            'totalRows' => $totalRows
        ];

        $jsonOutput->setData($result);
    }

    /*
    this function returns all csv sources from csv_sources table
     */
    public function getCsvSourcesList()
    {
        $jsonOutput = app()->make("JsonOutput");
        $fieldsList = ['id', 'name', 'key'];
        $dataArray = CsvSources::select($fieldsList)->where('deleted', 0)->get();
        $jsonOutput->setData($dataArray);
    }

    /*
    This function gets file object reference and checks if its extention is
    valid - csv/csvx
     */
    private function validateFileExtension($fileUpload)
    {
        $documentTypes = array('csv', 'csvx');
        $fileExtension = $fileUpload->getClientOriginalExtension();

        for ($typeIndex = 0; $typeIndex < count($documentTypes); $typeIndex++) {
            if ($documentTypes[$typeIndex]->name == $fileExtension) {
                return true;
            }
        }
        return false;
    }

    /*
    This function gets file object reference and checks if its mime-type is
    valid - text/csv
     */
    private function validateFileMimeType($fileUpload)
    {
        $documentTypes = array('text/csv');
        $fileMimeType = $fileUpload->getMimeType();

        for ($typeIndex = 0; $typeIndex < count($documentTypes); $typeIndex++) {
            if ($documentTypes[$typeIndex]->mime_type == $fileMimeType) {
                return true;
            }
        }

        return false;
    }

    /*
    This function takes existing file key and it's params and saves them :
     */
    public function saveCsvFileSettings(Request $request, $fileKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        //first all server validations :
        if ($fileKey == null || trim($fileKey) == '') {
            $jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
        }

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import.edit') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $changedValues = [];
        $fileFieldsModel = [];

        $csvFile = CsvFiles::where('csv_files.key', $fileKey)->where('deleted', 0)->first();
        if ($csvFile) { //csv file exists  - construct the returned data :
            $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
            if (!file_exists($newFileDestination . $csvFile->file_name)) {
                $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
                return;
            }

            $tabName = $request->has('tab_name') ? $request->input('tab_name') : 'loadData';
           
            if ($tabName == 'loadData') {
				 
                if ($request->input('uploader_voter_key') == null || trim($request->input('uploader_voter_key')) == '') {
                    $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
                    return;
                }
        
                if ($request->input('document_name') == null || trim($request->input('document_name')) == '') {
                    $jsonOutput->setErrorCode(config('errors.system.DOCUMENT_MISSING_FILE_KEY'));
                    return;
                }
        
                if ($request->input('data_source_key') == null || trim($request->input('data_source_key')) == '') {
                    $jsonOutput->setErrorCode(config('errors.system.MISSING_CSV_SOURCE_KEY'));
                    return;
                }
               
                $existingCsvSource = CsvSources::select('id')->where('deleted', 0)->where('key', $request->input('data_source_key'))->first();
                if (!$existingCsvSource) {
                    $jsonOutput->setErrorCode(config('errors.system.CSV_SOURCE_NOT_EXISTS'));
                    return;
                }
        
                $existingVoter = Voters::select('id')->where('key', $request->input('uploader_voter_key'))->first();
                if (!$existingVoter) {
                    $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
                    return;
                }
        
                $actionIsAllowed = false;
                $userPermissions = Auth::user()->permissions();
                foreach ($userPermissions as $permission) {
                    if ($permission->operation_name == 'elections.import.add') {
                        $actionIsAllowed = true;
                        break;
                    }
                }
                if (!$actionIsAllowed && Auth::user()->admin != '1') {
                    $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
                    return;
                }

                $oldValue = $csvFile->csv_source_id;
                $csvFile->csv_source_id = $existingCsvSource->id;
                if ( $oldValue != $csvFile->csv_source_id ) {
                    $changedValues[] = [
                        'field_name' => 'csv_source_id',
                        'display_field_name' => config('history.CsvFiles.csv_source_id'),
                        'old_numeric_value' => $oldValue,
                        'new_numeric_value' => $csvFile->csv_source_id
                    ];
                }

                $oldValue = $csvFile->captain_id;
                $csvFile->captain_id = $existingVoter->id;
                if ( $oldValue != $csvFile->captain_id ) {
                    $changedValues[] = [
                        'field_name' => 'captain_id',
                        'display_field_name' => config('history.CsvFiles.captain_id'),
                        'old_numeric_value' => $oldValue,
                        'new_numeric_value' => $csvFile->captain_id
                    ];
                }

                $filesDirectory = config('constants.CSV_UPLOADS_DIRECTORY');

                if ($request->file('file_upload')) {
                    $fileName=$csvFile->file_name;
                    // $newFileName = Helper::getNewTableKey('csv_files', 10);
                    $newFileName = $fileName;
                    unlink($filesDirectory.$fileName);//delete the old file

                    $csvFileFieldsRows = CsvFileFields::select('id')->where('csv_file_id', $csvFile->id)->get();
                    for ( $rowIndex = 0; $rowIndex < count($csvFileFieldsRows); $rowIndex++ ) {
                        $fileFieldsModel[] = [
                            'referenced_model' => 'CsvFileFields',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                            'referenced_id' => $csvFileFieldsRows[$rowIndex]->id
                        ];
                    }
                    CsvFileFields::where('csv_file_id', $csvFile->id)->delete(); //delete previous file's columns

                    $fileUpload=$request->file('file_upload');
                    $fileUpload->move($filesDirectory, $newFileName);
                    $filePath = $filesDirectory . $newFileName;
                    $fileData = file_get_contents($filePath);
                    $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
            
                    if ($encoding != "UTF-8") {
                        $utf8FileData = mb_convert_encoding($fileData, "UTF-8", $encoding);
                        file_put_contents($filePath, $utf8FileData);
                    }

                    $tempFields = [
                        'name',
                        'file_name',
                        'current_row',
                        'file_size',
                        'header',
                        'status'
                    ];

                    $oldValues = [];
                    for ( $fieldIndex = 0; $fieldIndex < count($tempFields); $fieldIndex++ ) {
                        $fieldName = $tempFields[$fieldIndex];

                        $oldValues[$fieldName] = $csvFile->{$fieldName};
                    }

                    //save to database :
                    $csvFile->name = $request->input('document_name');
                    $csvFile->file_name = $newFileName;
                    $csvFile->current_row = 0;
                    $csvFile->file_size = filesize(config('constants.CSV_UPLOADS_DIRECTORY') . $newFileName);
                    $csvFile->header = 0;
                    $csvFile->status = 0;
                    $csvFile->user_create_id = Auth::user()->id;

                    for ( $fieldIndex = 0; $fieldIndex < count($tempFields); $fieldIndex++ ) {
                        $fieldName = $tempFields[$fieldIndex];

                        if ( $oldValues[$fieldName] != $csvFile->{$fieldName} ) {
                            if ( 'name' == $fieldName || 'file_name' == $fieldName ) {
                                $changedValues[] = [
                                    'field_name' => $fieldName,
                                    'display_field_name' => config('history.CsvFiles.' . $fieldName),
                                    'old_value' => $oldValues[$fieldName],
                                    'new_value' => $csvFile->{$fieldName}
                                ];
                            } else {
                                $changedValues[] = [
                                    'field_name' => $fieldName,
                                    'display_field_name' => config('history.CsvFiles.' . $fieldName),
                                    'old_numeric_value' => $oldValues[$fieldName],
                                    'new_numeric_value' => $csvFile->{$fieldName}
                                ];
                            }
                        }
                    }
                    //ActionController::AddHistoryItem('elections.import.add', $csvFile->id, 'CsvFiles');
                }
               
                $csvFile->save();
                $arrData = $this->getCsvFileSummarizedData($filesDirectory, $csvFile->file_name, $csvFile->name, $csvFile->file_size,
                                                           $csvFile->header);
                $arrData['id'] = $csvFile->id;

                $oldValue = $csvFile->row_count;
                $csvFile->row_count = $arrData['totalRowsCount'];
                if ( $oldValue != $csvFile->row_count ) {
                    $changedValues[] = [
                        'field_name' => 'row_count',
                        'display_field_name' => config('history.CsvFiles.row_count'),
                        'old_numeric_value' => $oldValue,
                        'new_numeric_value' => $csvFile->row_count
                    ];
                }

                $csvFile->save();

                $jsonOutput->setData($arrData); //set correct resturn json as csv-file key.
            } else {
			  
                $savingsCounter = 0; //will count how fields changed :
                $historyDataArray = array(); //array for history table
				if(GlobalController::isActionPermitted('elections.import.edit.support_status')){
                //check to save support status id :
                if ($request->input('support_status_key') != null && trim($request->input('support_status_key')) != '') {
                    $supportStatus = SupportStatus::select('id', 'name')->where('key', $request->input('support_status_key'))->where('deleted', 0)->where('active',1)->first();
                    if ($supportStatus) {
                        $oldSupportStatusName = '';
                        if ($csvFile->support_status_id != null) {
                            $oldSupportStatus = SupportStatus::select('name')
                                ->where('deleted', 0)
                                ->where('active', 1)
                                ->where('id', $csvFile->support_status_id)
                                ->first();
                        }

                        $oldValue = $csvFile->support_status_id;
                        $csvFile->support_status_id = $supportStatus->id;
                        if ( $oldValue != $csvFile->support_status_id ) {
                            $changedValues[] = [
                                'field_name' => 'support_status_id',
                                'display_field_name' => config('history.CsvFiles.support_status_id'),
                                'old_numeric_value' => $oldValue,
                                'new_numeric_value' => $csvFile->support_status_id
                            ];
                        }

                        $savingsCounter++;
                    } else {
                        $jsonOutput->setErrorCode(config('errors.elections.SUPPORT_STATUS_DOES_NOT_EXIST'));
                        return;
                    }
                }
				
			
				
                //check to save support status  update type id :

                if (trim($request->input('support_status_update_type_id')) != '') {
                    $arraySupportStatusTypeArray = array();
                    array_push($arraySupportStatusTypeArray, config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'));
                    array_push($arraySupportStatusTypeArray, config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM'));
                    array_push($arraySupportStatusTypeArray, config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS'));
                    if (in_array($request->input('support_status_update_type_id', null), $arraySupportStatusTypeArray) !== false) {

                        $oldValue = $csvFile->support_status_update_type;
                        $csvFile->support_status_update_type = $request->input('support_status_update_type_id');
                        if ( $oldValue != $csvFile->support_status_update_type ) {
                            $changedValues[] = [
                                'field_name' => 'support_status_update_type',
                                'display_field_name' => config('history.CsvFiles.support_status_update_type'),
                                'old_numeric_value' => $oldValue,
                                'new_numeric_value' => $csvFile->support_status_update_type
                            ];
                        }

                        $savingsCounter++;
                    }
                }

                //check to save update support status if exists:
                if ($request->input('update_support_status_if_exists') == 1 || trim($request->input('update_support_status_if_exists')) == 0) {
                    $oldValue = $csvFile->update_support_status_if_exists;
                    $csvFile->update_support_status_if_exists = $request->input('update_support_status_if_exists');
                    if ( $oldValue != $csvFile->update_support_status_if_exists ) {
                        $changedValues[] = [
                            'field_name' => 'update_support_status_if_exists',
                            'display_field_name' => config('history.CsvFiles.update_support_status_if_exists'),
                            'old_numeric_value' => $oldValue,
                            'new_numeric_value' => $csvFile->update_support_status_if_exists
                        ];
                    }

                    $savingsCounter++;
                }

                //check to save update household support status :
                if ($request->input('update_household_support_status') == 1 || trim($request->input('update_household_support_status')) == 0) {
                    $oldValue = $csvFile->update_household_support_status;
                    $csvFile->update_household_support_status = $request->input('update_household_support_status');
                    if ( $oldValue != $csvFile->update_household_support_status ) {
                        $changedValues[] = [
                            'field_name' => 'update_household_support_status',
                            'display_field_name' => config('history.CsvFiles.update_household_support_status'),
                            'old_numeric_value' => $oldValue,
                            'new_numeric_value' => $csvFile->update_household_support_status
                        ];
                    }

                    $savingsCounter++;
                }
				
				
				
			}

                //check to save institute id :
                if ($request->input('institute_key') != null && trim($request->input('institute_key')) != '') {
                    $institute = Institutes::select('id', 'name')->where('key', $request->input('institute_key'))->where('deleted', 0)->first();
                    if ($institute) {
                        $oldValue = $csvFile->institute_id;
                        $csvFile->institute_id = $institute->id;
                        if ( $oldValue != $csvFile->institute_id ) {
                            $changedValues[] = [
                                'field_name' => 'institute_id',
                                'display_field_name' => config('history.CsvFiles.institute_id'),
                                'old_numeric_value' => $oldValue,
                                'new_numeric_value' => $csvFile->institute_id
                            ];
                        }

                        $savingsCounter++;

                    } else {
                        $jsonOutput->setErrorCode(config('errors.elections.INVALID_INSTITUTE'));
                        return;
                    }
                }

                //check to save institute role id :
                if ($request->input('institute_role_key') != null && trim($request->input('institute_role_key')) != '') {
                    $instituteRole = InstituteRole::select('id', 'name')->where('key', $request->input('institute_role_key'))->where('deleted', 0)->first();
                    if ($instituteRole) {
                        $oldValue = $csvFile->institute_role_id;
                        $csvFile->institute_role_id = $instituteRole->id;
                        if ( $oldValue != $csvFile->institute_role_id ) {
                            $changedValues[] = [
                                'field_name' => 'institute_role_id',
                                'display_field_name' => config('history.CsvFiles.institute_role_id'),
                                'old_numeric_value' => $oldValue,
                                'new_numeric_value' => $csvFile->institute_role_id
                            ];
                        }

                        $savingsCounter++;
                    } else {
                        $jsonOutput->setErrorCode(config('errors.elections.INVALID_INSTITUTE_ROLE'));
                        return;
                    }
                }
				
				 //check to save ethnic group :
                if ($request->input('ethnic_group_key') != null && trim($request->input('ethnic_group_key')) != '') {
                    $ethnicGroup = Ethnic::select('id', 'name')->where('key', $request->input('ethnic_group_key'))->where('deleted', 0)->first();
                    if ($ethnicGroup) {
                        $oldValue = $csvFile->ethnic_group_id;
                        $csvFile->ethnic_group_id = $ethnicGroup->id;
                        if ( $oldValue != $csvFile->ethnic_group_id ) {
                            $changedValues[] = [
                                'field_name' => 'ethnic_group_id',
                                'display_field_name' => config('history.CsvFiles.ethnic_group_id'),
                                'old_numeric_value' => $oldValue,
                                'new_numeric_value' => $csvFile->ethnic_group_id
                            ];
                        }

                        $savingsCounter++;
                    } else {
                        $jsonOutput->setErrorCode(config('errors.elections.ETHNIC_GROUP_DOESNT_EXIST'));
                        return;
                    }
                }

                 //check to save religious group :
                if ($request->input('religious_group_key') != null && trim($request->input('religious_group_key')) != '') {
                    $religiousGroup = ReligiousGroup::select('id', 'name')->where('key', $request->input('religious_group_key'))->where('deleted', 0)->first();
                    if ($religiousGroup) {
                        $oldValue = $csvFile->religious_group_id;
                        $csvFile->religious_group_id = $religiousGroup->id;
                        if ( $oldValue != $csvFile->religious_group_id ) {
                            $changedValues[] = [
                                'field_name' => 'religious_group_id',
                                'display_field_name' => config('history.CsvFiles.religious_group_id'),
                                'old_numeric_value' => $oldValue,
                                'new_numeric_value' => $csvFile->religious_group_id
                            ];
                        }

                        $savingsCounter++;
                    } else {
                        $jsonOutput->setErrorCode(config('errors.elections.RELIGIOUS_GROUP_DOESNT_EXIST'));
                        return;
                    }
                }
				
				if($request->input('selected_voter_group_key') != null && trim($request->input('selected_voter_group_key')) != ''){
					$voterGroup = VoterGroups::select('id')->where('key' ,$request->input('selected_voter_group_key') )->where('deleted',0)->first();
					if(!$voterGroup){
						$jsonOutput->setErrorCode(config('errors.elections.VOTER_GROUP_DOES_NOT_EXIST'));
						return;
					}

                    $oldValue = $csvFile->voter_group_id;
					$csvFile->voter_group_id=$voterGroup->id;
                    if ( $oldValue != $csvFile->voter_group_id ) {
                        $changedValues[] = [
                            'field_name' => 'voter_group_id',
                            'display_field_name' => config('history.CsvFiles.voter_group_id'),
                            'old_numeric_value' => $oldValue,
                            'new_numeric_value' => $csvFile->voter_group_id
                        ];
                    }
				}

                $oldValue = $csvFile->strictly_orthodox;
				if ($request->input('strictly_orthodox') == '0'){
					$csvFile->strictly_orthodox = 0;
				}
				elseif($request->input('strictly_orthodox') == '1'){
					$csvFile->strictly_orthodox = 1;
				}
                if ( $oldValue != $csvFile->strictly_orthodox ) {
                    $changedValues[] = [
                        'field_name' => 'strictly_orthodox',
                        'display_field_name' => config('history.CsvFiles.strictly_orthodox'),
                        'old_numeric_value' => $oldValue,
                        'new_numeric_value' => $csvFile->strictly_orthodox
                    ];
                    //!!!! ???? \App\Http\Controllers\BallotBoxController::updateBallotDetailsCounters();
                    
                }

				if ($request->input('gender') == '1' || $request->input('gender') == '2'){
                    $oldValue = $csvFile->gender;
					$csvFile->gender = $request->input('gender');
                    if ( $oldValue != $csvFile->gender ) {
                        $changedValues[] = [
                            'field_name' => 'gender',
                            'display_field_name' => config('history.CsvFiles.gender'),
                            'old_numeric_value' => $oldValue,
                            'new_numeric_value' => $csvFile->gender
                        ];
                    }
				}
				
                //check to save update csv source categorization :
                $arrayRoleClassification = array();
                array_push($arrayRoleClassification, config('constants.CSV_PARSER_ROLE_CLASSIFICATION_OPENED_DEFAULT'));
                array_push($arrayRoleClassification, config('constants.CSV_PARSER_ROLE_CLASSIFICATION_LIMITED'));
                array_push($arrayRoleClassification, config('constants.CSV_PARSER_ROLE_CLASSIFICATION_PARTIALLY_LIMITED'));
                if (in_array($request->input('institute_categorization_key', null), $arrayRoleClassification) !== false) {
                    $oldValue = $csvFile->institute_categorization_id;
                    $csvFile->institute_categorization_id = $request->input('institute_categorization_key');
                    if ( $oldValue != $csvFile->institute_categorization_id ) {
                        $changedValues[] = [
                            'field_name' => 'institute_categorization_id',
                            'display_field_name' => config('history.CsvFiles.institute_categorization_id'),
                            'old_numeric_value' => $oldValue,
                            'new_numeric_value' => $csvFile->institute_categorization_id
                        ];
                    }

                    $savingsCounter++;
                }

                if ($savingsCounter > 0) {
                    $csvFile->save();
                }

                $historyArgsArr = [
                    'topicName' => 'elections.import.edit',
                    'models' => []
                ];

                if ( count($changedValues) ) {
                    $historyArgsArr['models'][] = [
                        'referenced_model' => 'CsvFiles',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                        'referenced_id' => $csvFile->id,
                        'valuesList' => $changedValues
                    ];
                }

                if ( count($fileFieldsModel) > 0 ) {
                    $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $fileFieldsModel);
                }

                if ( count($historyArgsArr['models']) > 0 ) {
                    ActionController::AddHistoryItem($historyArgsArr);
                }

                $jsonOutput->setData("ok");
            }
        } else {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }

    }

    /*
    This function checks data validity from client , and if it's
    valid then it calls 'addDocumentRequest' which saves to database
    and uploads file.
     */
    public function uploadCsvDocument(Request $request)
    {

        $jsonOutput = app()->make("JsonOutput");

        if ($request->input('uploader_voter_key') == null || trim($request->input('uploader_voter_key')) == '') {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        if ($request->input('document_name') == null || trim($request->input('document_name')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.DOCUMENT_MISSING_FILE_KEY'));
            return;
        }

        if ($request->input('data_source_key') == null || trim($request->input('data_source_key')) == '') {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_CSV_SOURCE_KEY'));
            return;
        }

        if ($request->file('file_upload') == null) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_DOCUMENT_FILE'));
            return;
        }

        $existingCsvSource = CsvSources::select('id')->where('deleted', 0)->where('key', $request->input('data_source_key'))->first();
        if (!$existingCsvSource) {
            $jsonOutput->setErrorCode(config('errors.system.CSV_SOURCE_NOT_EXISTS'));
            return;
        }

        $existingVoter = Voters::select('id')->where('key', $request->input('uploader_voter_key'))->first();
        if (!$existingVoter) {
            $jsonOutput->setErrorCode(config('errors.elections.MISSING_VOTER_KEY'));
            return;
        }

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import.add') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $this->addDocumentRequest($request->file('file_upload'), $request->input('document_name'), $existingVoter->id, $existingCsvSource->id);

    }

    /*
    This function gets file object reference and saves the file in csv_files
    table and upload it by the [key].csv
     */
    private function addDocumentRequest($fileUpload, $originalFileName, $uploadingVoterID, $csvSourceID)
    {
        $jsonOutput = app()->make("JsonOutput");

        if (!$fileUpload) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_DOCUMENT_FILE'));
            return;
        }

        $newTableKey = Helper::getNewTableKey('csv_files', 10);

		 
        //save file at fileserver :
        $newFileName = $newTableKey;
        $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
        $fileUpload->move($newFileDestination, $newFileName);

        $filePath = $newFileDestination . $newFileName;
		
        $fileData = file_get_contents($filePath);
        $encoding = mb_detect_encoding($fileData, 'UTF-8, ASCII, ISO-8859-8');
        /*
        if ($encoding != "UTF-8") {
            $utf8FileData = mb_convert_encoding($fileData, "UTF-8", $encoding);
            file_put_contents($filePath, $utf8FileData);
        }
		*/

        //save to database :
        $csvNewFile = new CsvFiles;
        $csvNewFile->name = $originalFileName;
        $csvNewFile->file_name = $newTableKey;
        $csvNewFile->row_count = 0;
        $csvNewFile->current_row = 0;
        $csvNewFile->file_size = filesize(config('constants.CSV_UPLOADS_DIRECTORY') . $newFileName);
        $csvNewFile->captain_id = $uploadingVoterID;
        $csvNewFile->csv_source_id = $csvSourceID;
        $csvNewFile->header = 0;
        $csvNewFile->status = 0;
        $csvNewFile->key = $newTableKey;
        $csvNewFile->user_create_id = Auth::user()->id;
        $csvNewFile->save();

        $arrData = $this->getCsvFileSummarizedData($newFileDestination, $csvNewFile->key, $csvNewFile->name, $csvNewFile->file_size, $csvNewFile->header);
        $csvNewFile->row_count = $arrData['totalRowsCount'];
        $csvNewFile->save();

        $arrData['id'] = $csvNewFile->id;

        //ActionController::AddHistoryItem('elections.import.add', $csvNewFile->id, 'CsvFiles');
        $csvFields = [
            'name',
            'file_name',
            'row_count',
            'current_row',
            'file_size',
            'captain_id',
            'csv_source_id',
            'header',
            'status'
        ];

        $changedValues = [];
        for ( $fieldIndex = 0; $fieldIndex < count($csvFields); $fieldIndex++ ) {
            $fieldName = $csvFields[$fieldIndex];

            if ( 'name' == $fieldName || 'file_name' == $fieldName ) {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.CsvFiles.' . $fieldName),
                    'new_value' => $csvNewFile->{$fieldName}
                ];
            } else {
                $changedValues[] = [
                    'field_name' => $fieldName,
                    'display_field_name' => config('history.CsvFiles.' . $fieldName),
                    'new_numeric_value' => $csvNewFile->{$fieldName}
                ];
            }
        }

        $historyArgsArr = [
            'topicName' => 'elections.import.add',
            'models' => [
                [
                    'referenced_model' => 'CsvFiles',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $csvNewFile->id,
                    'valuesList' => $changedValues
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($arrData); //set correct resturn json as csv-file key.
    }

    /*
    function that gets csv document key , and array of documen's
    columns , and if it has a header , and this function delete old
    column (if exists) from 'csv_file_field' table and inserts new columns
    of file into 'csv_file_field' table
     */
    public function addCsvDataFields(Request $request, $documentKey)
    {
        $jsonOutput = app()->make("JsonOutput");

        if ($documentKey == null) {
            $jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
        }

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import.edit') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $fieldsToSelect = ['csv_files.id AS id', 'header',
        ];

        $csvFile = CsvFiles::select($fieldsToSelect)->where('csv_files.key', $documentKey)->where('deleted', 0)->first();
        if ($csvFile) { //csv file exists  - construct the returned data :

            $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
            if (!file_exists($newFileDestination . $csvFile->file_name)) {
                $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
                return;
            }

            $csvFile->header = $request->input('is_header') == '1' ? '1' : '0';
            $csvFile->update_household_address = $request->input('update_household_address') == 1 ? '1' : '0';
            $csvFile->delete_duplicate_phones = $request->input('delete_duplicate_phones') == 1 ? '1' : '0';
            $csvFile->save();

            CsvFileFields::where('csv_file_id', $csvFile->id)->delete(); //delete previous file's columns

            $columns = json_decode($request->input('columns_array'), true);

            $insertsData = array();
            foreach ($columns as $col) {
                $fieldName = $this->getColumnName($col['column_name_identifier']);
                if ($fieldName != '' && is_int($col['column_number']) && (int) $col['column_number'] >= 0) {
                    array_push($insertsData, array('csv_file_id' => $csvFile->id, 'column_number' => $col['column_number'],
                                                   'field_name' => $fieldName,
                                                   'key' => Helper::getNewTableKey('csv_file_fields', 5)));
                }
            }

            CsvFileFields::insert($insertsData);

            $jsonOutput->setData('ok');
        } else {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }
    }

    /*
    function that gets csv document key , and if it's valid - then
    returns the needed data for the file : first rows and number of columns
     */
    public function getCsvTopRowsDataByKey(Request $request, $documentKey)
    {
		
        $jsonOutput = app()->make("JsonOutput");

        if ($documentKey == null) {
            $jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
        }

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $fieldsToSelect = ['csv_files.id AS id', 'csv_files.name AS name',
            'csv_files.file_size AS file_size',
        ];

        $csvFile = CsvFiles::select($fieldsToSelect)->where('csv_files.key', $documentKey)->where('deleted', 0)->first();
        if ($csvFile) { //csv file exists  - construct the returned data :

            $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
            if (!file_exists($newFileDestination . $csvFile->file_name)) {
                $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
                return;
            }

            $array = $this->getCsvFileSummarizedData($newFileDestination, $documentKey, $csvFile->name, $csvFile->file_size, $csvFile->header);
            $jsonOutput->setData($array);

        } else {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }

    }

    /*
    function that gets csv document key , and if it's valid - then
    returns the progress data stats for file
     */
    public function getCsvProgressDataByKey(Request $request, $documentKey)
    {
        $jsonOutput = app()->make("JsonOutput");
 
        if ($documentKey == null) {
            $jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
        }

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $fieldsToSelect = ['csv_files.id AS id', 'csv_files.status' , 'csv_files.institute_id' , 'csv_files.institute_role_id'];

		//$pids = GlobalController::getCurrentPIDsArray();
		$runningFile = CsvFiles::select("id" , "process_id")->where([ 'csv_files.deleted'=> 0 , 'status'=>config('constants.CSV_PARSER_STATUS_AT_WORK') , 'csv_files.key' => $documentKey])->first();
		if ($runningFile){
			if (!Redis::get('services:csv:'.$runningFile->id)){
				CsvFiles::where('id',$runningFile->id)->update(['status'=> config('constants.CSV_PARSER_STATUS_ERROR') , 'process_id'=>NULL]);
			}
		}
		
        $csvFile = CsvFiles::select($fieldsToSelect)->where('csv_files.key', $documentKey)->where('deleted', 0)->first();
        if ($csvFile) { //csv file exists  - construct the returned data :
            
        $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
	 
        if (!file_exists($newFileDestination . $csvFile->file_name)) {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }

		    $rowErrorStatus = config('constants.CSV_PARSER_ROW_STATUS_FAILED');
            $arrResult = array();
            $fieldsToSelect = ['voter_id', 'update_count', 'error_type', 'added_phone_count', 'non_added_phone_count' , 'status'];
            $arrRows = CsvFileRows::select($fieldsToSelect)->where('csv_file_id', $csvFile->id)->get();
            $arrResult["processedRowsCount"] = $arrRows->count();
            $arrResult["csvFileStatus"] = $csvFile->status;

            $arrResult["total_voter_rows"] = count(CsvFileRows::select('voter_id')->where('csv_file_id', $csvFile->id)->whereNotNull('voter_id')->groupBy('voter_id')->get());

            $arrResult["total_voter_updates_sum"] = $arrRows->sum(function ($item) {
                return $item->update_count;
            });
            $arrResult["total_voter_not_updated_rows"] = count($arrRows->filter(function ($item) {
                return $item->update_count == 0 && $item->error_type == null;
            }));
            $errorsResultDataArray= $this->errorsResultDataArray;
            foreach($errorsResultDataArray as $errorName => $errorConstName ){
                $errorType = config("constants.$errorConstName");
                $arrResult[$errorName] = $arrRows->filter(function ($item) use ($errorType, $rowErrorStatus) {
                    if ( $item->status == $rowErrorStatus && ( $item->error_type == $errorType )) {
                        return $item;
                    }
                })->count();
            }

            $arrResult["totalInvalidRows"] = $arrRows->filter(function ($item) use ( $rowErrorStatus) {
                if ($item->status == $rowErrorStatus) {
                    return $item;
                }
            })->count();

            $arrResult["AddedPhonesCount"] = $arrRows->sum(function ($item) {return $item->added_phone_count;});
            $arrResult["nonAddedPhonesCount"] = $arrRows->sum(function ($item) {return $item->non_added_phone_count;});

            $instituteName = '';
            $instituteRole = null;

            if($csvFile->institute_id){
                $selectedInstitute = Institutes::select('id','name')->where('id' ,$csvFile->institute_id )->first();
                if($selectedInstitute ){
                    $instituteName = $selectedInstitute->name ;
                }
            }

            if($csvFile->institute_role_id){
                $selectedInstituteRole = InstituteRole::select('id','name')->where('id' ,$csvFile->institute_role_id )->first();
                if($selectedInstituteRole ){
                    $instituteRole = $selectedInstituteRole ;
                }

            }


            $arrResult["instituteName"] = $instituteName ;
            $arrResult["instituteRole"] = $instituteRole ;

            $jsonOutput->setData($arrResult);

        } else {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }

    }

    /*
    This function generates and downloads csv file from array/string of data , and give it a name

    @param $fileContent - the array or string of csv file content
     */
    private function createCsvFileForDownload($fileContent, $fileName)
    {
        header("Content-type: text/csv; charset=UTF-8");
        header("Content-Disposition: attachment; filename=" . $fileName . ".csv");
        header("Pragma: no-cache");
        header("Expires: 0");

        echo $fileContent;
        die;
    }

    /*
    this function filters rows by param 'filter_action_name' and returns the needed results :
     */
    public function filterCsvRowsDataByFileKey(Request $request, $fileKey, $filterKey)
    {
		
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setBypass(true);
        if ($fileKey == null) {
            $jsonOutput->setErrorCode(config('errors.import_csv.MISSING_CSV_FILE_KEY'));
            return;
        }

        $actionIsAllowed = false;
        $userPermissions = Auth::user()->permissions();
        foreach ($userPermissions as $permission) {
            if ($permission->operation_name == 'elections.import') {
                $actionIsAllowed = true;
                break;
            }
        }
        if (!$actionIsAllowed && Auth::user()->admin != '1') {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }

        $fieldsToSelect = ['csv_files.id AS id',
            'csv_files.key AS key', 'csv_files.name AS name'
            , 'csv_files.row_count',
            'csv_files.current_row',
			'csv_files.header'
        ];

        $csvFile = CsvFiles::select($fieldsToSelect)->where('csv_files.key', $fileKey)->where('deleted', 0)->first();
        if (!$csvFile) {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }
    //csv file exists  - construct the returned data :
        $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
        if (!file_exists($newFileDestination . $csvFile->file_name)) {
            $jsonOutput->setErrorCode(config('errors.import_csv.CSV_FILE_NOT_EXISTS'));
            return;
        }
        
            $exportList = [
                'PROCESSED_ROWS',
                'NOT_PROCESSED_ROWS',
                'UPDATED_VOTER_IDS',
                'REALLY_UPDATED_VOTERS',
                'ALL_VALID_DATA',
                'ALL_INVALID_DATA',
                'EXISTING_VOTERS_DATA_NOT_UPDATED',
                'ALL_PHONES_DATA',
                'NEW_PHONES_DATA',
                'EXISTING_PHONES_DATA',
                
                'invalid_phones',
                'invalid_ids' ,
                'missing_user_permission' ,
                'unknown_voter' ,
                'city_not_valid',
                'date_not_valid',
                'ethnic_not_valid',
                'religious_not_valid',
                'vote_time_not_valid',
                'email_not_valid',
                'phone_not_valid',
                'support_status_not_exist',
                'sepharadi_not_valid',
                'strictly_orthodox_not_valid',
                'deceased_not_valid',
            ];
			
            if($filterKey == 'ALL_ROWS'){
                $fileContent = file_get_contents(config('constants.CSV_UPLOADS_DIRECTORY') . $fileKey);
                $this->createCsvFileForDownload($fileContent, $csvFile->name . '-מקורי');
            }else if(in_array($filterKey,$exportList)){
                $this->getFilteredRowsByParam($csvFile, $filterKey);
            }
   
    }

    /*
    This function generates filtered rows fro file pb param

    @param $csvFile - the file row from csv_files
    @param $paramName - the filtration name
     */
    private function getFilteredRowsByParam($csvFile, $paramName)
    {

        $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
        $file_n = $newFileDestination . $csvFile->key;
        $file = fopen($file_n, "r");
        $rowsArray = '';
        $index = 0;
		$fileCounter = 0;
         
        $personal_identity_column_number_in_file = 0;
        $csvField = null;
        if ($paramName == 'UPDATED_VOTER_IDS') {
            $csvField = CsvFileFields::select('column_number')->where('csv_file_id', $csvFile->id)->where('field_name', 'personal_identity')->first();
            if ($csvField) {$personal_identity_column_number_in_file = $csvField->column_number;}
            $csvRowsList = CsvFileRows::select('personal_identity')->withVoter()->where('csv_file_id', $csvFile->id)->whereNotNull('voter_id')->groupBy('voter_id')->get();
            $csvRowsArray = array(); //will hold numbers only
            for ($i = 0; $i < count($csvRowsList); $i++) {
                array_push($csvRowsArray, $csvRowsList[$i]->personal_identity);
            }
        }

        $allFileCsvRows = CsvFileRows::select('id', 'update_count', 'error_type', 'added_phone_count', 'non_added_phone_count','status')
        ->where('csv_file_id', $csvFile->id)->get();
         $rowCnt=count($allFileCsvRows);     
        
	
		while (($data = fgetcsv($file, 0)) !== false) {
            if($csvFile->header == 1 && $fileCounter == 0){
				 $fileCounter++;
				 continue;
            }
			
			if($paramName == 'NOT_PROCESSED_ROWS'){
				$fileSuffix = "מספר השורות שהתהליך עדיין לא רץ עליהם";
				if ($index > $csvFile->current_row) {
						
                        $rowsArray .= join($data, ',') . PHP_EOL;
                    }
					$index++;
				continue;
			}
            
			if ($index >= $rowCnt) {break;}
            $currentRow = $allFileCsvRows[$index];
			$fileSuffix = "";

            switch ($paramName) {
                case 'PROCESSED_ROWS':
					$fileSuffix="מספר השורות שהתהליך רץ עליהם";
                    if ($index <= $csvFile->current_row) {
                        $rowsArray .= join($data, ',') . PHP_EOL;
                    } else {
                        break 2;
                    }
                    break;
                case 'NOT_PROCESSED_ROWS':
				
					
				
                    
                    break;
                case 'UPDATED_VOTER_IDS':
					$fileSuffix = "מספר התושבים שעודכנו בפועל";
                    if (in_array($data[$personal_identity_column_number_in_file], $csvRowsArray)) {
                        $rowsArray .= join($data, ',') . PHP_EOL;
                    }
                    break;
                case 'REALLY_UPDATED_VOTERS':
						$fileSuffix = "מספר העדכונים שנעשו בפועל";
                        if ($currentRow->update_count > 0) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
                case 'EXISTING_VOTERS_DATA_NOT_UPDATED':
						$fileSuffix = "מספר השורות שהכילו נתונים זהים לנתונים הקודמים";
                        if ($currentRow->error_type == null && $currentRow->update_count == 0) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
				 
                case 'ALL_VALID_DATA':
						$fileSuffix = "סך כל השורות התקינות";
                        if ($currentRow->error_type == null) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
                case 'ALL_INVALID_DATA':
						$fileSuffix = "סך כל השורות השגויות";
                        if ($currentRow->status == config('constants.CSV_PARSER_ROW_STATUS_FAILED')) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
                case 'ALL_PHONES_DATA':
						$fileSuffix = "סך כל הטלפונים";
                        if (($currentRow->added_phone_count + $currentRow->non_added_phone_count > 0)) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
                case 'NEW_PHONES_DATA':
						$fileSuffix = 'סה"כ מספרים עודכנו';
                        if ($currentRow->added_phone_count) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
                case 'EXISTING_PHONES_DATA':
						$fileSuffix = "מספר הטלפונים שהיו קיימים כבר";
                        if ($currentRow->non_added_phone_count > 0) {
                            $rowsArray .= join($data, ',') . PHP_EOL;
                        }
                    break;
                default:
					if($paramName == 'invalid_ids'){$fileSuffix = "מספר השורות עם תעודות זהות שאינה תקינה";}
					elseif($paramName == 'unknown_voter'){$fileSuffix = "מספר השורות עם תעודות זהות שאינה קיימת";}
					elseif($paramName == 'missing_user_permission'){$fileSuffix = "מספר השורות ללא הרשאת משתשמש";}
					elseif($paramName == 'invalid_phones'){$fileSuffix = "מספר השורות עם טלפון לא חוקי";}
					elseif($paramName == 'city_not_valid'){$fileSuffix = "מספר השורות בהם העיר לא תקינה";}
					elseif($paramName == 'date_not_valid'){$fileSuffix = "מספר השורות בהם  התאריך לא היה תקין";}
					elseif($paramName == 'ethnic_not_valid'){$fileSuffix = "מספר השורות בהם העדה לא קיימת במערכת";}
                    elseif($paramName == 'religious_not_valid'){$fileSuffix = "מספר השורות בהם הזרם לא קיים במערכת";}
					elseif($paramName == 'vote_time_not_valid'){$fileSuffix = "מספר השורות בהם זמן הצבעה לא תקין";}
					elseif($paramName == 'email_not_valid'){$fileSuffix = "מספר השורות בהם המייל שהוכנס לא תקין";}
					elseif($paramName == 'phone_not_valid'){$fileSuffix = "מספר השורות בהם מספר הטלפון שהוכנס לא תקין";}
					elseif($paramName == 'support_status_not_exist'){$fileSuffix = "מספר השורות בהם הסטטוס לא קיים במערכת";}
					elseif($paramName == 'sepharadi_not_valid'){$fileSuffix = 'מספר השורות שבהם הערך "ספרדי" לא תקין';}
					elseif($paramName == 'strictly_orthodox_not_valid'){$fileSuffix = 'מספר השורות שבהם הערך "חרדי" לא תקין';}
					elseif($paramName == 'deceased_not_valid'){$fileSuffix = 'מספר השורות שבהם הערך "דיווח מיתה" לא תקין';}
					else{
						$fileSuffix = $paramName;
					}
					$errorsResultDataArray = $this->errorsResultDataArray;
                        // dump($paramName,$errorsResultDataArray[$paramName],config('constants.' . $errorsResultDataArray[$paramName]),$currentRow->status);
					if(!empty($errorsResultDataArray[$paramName])){
						if (!is_null($currentRow->error_type) && 
                            $currentRow->error_type == config('constants.' . $errorsResultDataArray[$paramName])) {
							$rowsArray .= join($data, ',') . PHP_EOL;
						}
					}
					break;
			}
            $index++;
        }
        //echo $index;
        fclose($file);
        if (strlen($rowsArray) > 0) {
            $this->createCsvFileForDownload($rowsArray, $csvFile->name . '-' . $fileSuffix);
        }
    }

    /*
    function that gets role classification name by its number from constants :

    @param $classificationID
     */
    private function getRoleClassificationName($classificationID)
    {
        $roleClassificationName = '';
        switch ($classificationID) {
            case config('constants.CSV_PARSER_ROLE_CLASSIFICATION_OPENED_DEFAULT'):
                $roleClassificationName = 'פתוח';
                break;
            case config('constants.CSV_PARSER_ROLE_CLASSIFICATION_LIMITED'):
                $roleClassificationName = 'מוגבל';
                break;
            case config('constants.CSV_PARSER_ROLE_CLASSIFICATION_PARTIALLY_LIMITED'):
                $roleClassificationName = 'מוגבל חלקית';
                break;

            default:
                break;
        }
        return $roleClassificationName;
    }

    /*
    function that gets support status name by its number from constants :

    @param $statusTypeID
     */
    private function getSupportStatusTypeName($statusTypeID)
    {
        $statusTypeName = '';
        switch ($statusTypeID) {
            case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'):
                $statusTypeName = 'סטטוס סניף מקסימלי';
                break;
            case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM'):
                $statusTypeName = 'סטטוס סניף מינימלי';
                break;
            case config('constants.CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS'):
                $statusTypeName = 'עדכן תמיד';
                break;

            default:
                break;
        }
        return $statusTypeName;
    }

    /*
    function that gets column name identifier , and returns column name

    @param $columnNameIdentifierNumber
     */
    private function getColumnName($columnNameIdentifierNumber)
    {
        $columnName = '';
        switch ($columnNameIdentifierNumber) {
            case config('constants.CSV_COLUMN_PERSONAL_IDENTITY'):
                $columnName = 'personal_identity';
                break;
            case config('constants.CSV_COLUMN_FIRST_NAME'):
                $columnName = 'first_name';
                break;
            case config('constants.CSV_COLUMN_PHONE_NUMBER'):
                $columnName = 'phone_number';
                break;
            case config('constants.CSV_COLUMN_EMAIL'):
                $columnName = 'email';
                break;
            case config('constants.CSV_COLUMN_SUPPORT_STATUS'):
                $columnName = 'support_status';
                break;
            case config('constants.CSV_COLUMN_SEPHARDI'):
                $columnName = 'sephardi';
                break;
            case config('constants.CSV_COLUMN_CITY'):
                $columnName = 'city';
                break;
            case config('constants.CSV_COLUMN_STREET'):
                $columnName = 'street';
                break;
            case config('constants.CSV_COLUMN_HOUSE'):
                $columnName = 'house';
                break;
            case config('constants.CSV_COLUMN_NEIGHBORHOOD'):
                $columnName = 'neighborhood';
                break;
            case config('constants.CSV_COLUMN_HOUSE_ENTRY'):
                $columnName = 'house_entry';
                break;
            case config('constants.CSV_COLUMN_FLAT'):
                $columnName = 'flat';
                break;
            case config('constants.CSV_COLUMN_ZIP'):
                $columnName = 'zip';
                break;
            case config('constants.CSV_COLUMN_INSTITUTE_ID'):
                $columnName = 'institute_id';
                break;
            case config('constants.CSV_COLUMN_INTITUTE_ROLE_ID'):
                $columnName = 'institute_role_id';
                break;
            case config('constants.CSV_COLUMN_CLASSIFICATION_ID'):
                $columnName = 'classification_id';
                break;
            case config('constants.CSV_COLUMN_VOTED'):
                $columnName = 'voted';
                break;
            case config('constants.CSV_COLUMN_LAST_NAME'):
                $columnName = 'last_name';
                break;
            case config('constants.CSV_COLUMN_DECEASED'):
                $columnName = 'deceased';
                break;
            case config('constants.CSV_COLUMN_DECEASED_DATE'):
                $columnName = 'deceased_date';
                break;
            case config('constants.CSV_COLUMN_BIRTH_DATE'):
                $columnName = 'birth_date';
                break;
            case config('constants.CSV_COLUMN_SUPPORT_STATUS_FINAL'):
                $columnName = 'support_status_final';
                break;
            case config('constants.CSV_COLUMN_VOTE_TIME'):
                $columnName = 'vote_time';
                break;
            case config('constants.CSV_COLUMN_ETHNIC_GROUP_ID'):
                $columnName = 'ethnic_group_id';
                break;
            case config('constants.CSV_COLUMN_RELIGIOUS_GROUP_ID'):
                $columnName = 'religious_group_id';
                break;
            case config('constants.CSV_COLUMN_GENDER'):
                $columnName = 'gender';
                break;
            case config('constants.CSV_COLUMN_STRICTLY_ORTHODOX'):
                $columnName = 'strictly_orthodox';
                break;
			case config('constants.CSV_COLUMN_TRANSPORT_TYPE'):
                $columnName = 'transportation_type';
                break;
			case config('constants.CSV_COLUMN_TRANSPORT_FROM_TIME'):
                $columnName = 'transportation_from_time';
                break;
			case config('constants.CSV_COLUMN_TRANSPORT_TO_TIME'):
                $columnName = 'transportation_to_time';
                break;
			case config('constants.CSV_COLUMN_VOTER_KEY'):
                $columnName = 'key';
                break;
            default:
                break;
        }
        return $columnName;
    }

    /*
    private inner function that creates array of file data : first rows and number of columns
     */
    private function getCsvFileSummarizedData($newFileDestination, $fileKey, $fileName, $fileSize, $isHeader)
    {

        $file_n = $newFileDestination . $fileKey;
        $file = fopen($file_n, "r");
        $all_data = array();
        $array = array();
        $nRowsArray = array();
        $containsHeader = true;
        $indexer = 0;
 
 
        /*
        if ($encoding != "UTF-8") {
            $utf8FileData = mb_convert_encoding($fileData, "UTF-8", $encoding);
            file_put_contents($filePath, $utf8FileData);
        }
		*/

        while (($data = fgetcsv($file, 0, ",")) !== false) {

            if ($indexer == 0) {
                $array['numberOfCols'] = count($data);
			
				
            }
            if ($indexer < NUMBER_OF_ROWS_RETURNED) {
				$arrRow = [];
				$encoding = mb_detect_encoding(implode(",",$data), 'UTF-8, ASCII, ISO-8859-8');
				foreach($data as $rowData){
					 if ($encoding != "UTF-8") {
						 $arrRow[] = mb_convert_encoding($rowData , "UTF-8", $encoding );
					 } else {
                        $arrRow[] = $rowData;
                     }
				}
				
 
                array_push($nRowsArray, $arrRow);
            }
            $indexer++;

        }

        $array['totalRowsCount'] = $indexer;
        $array['firstRows'] = $nRowsArray;
        $array['fileKey'] = $fileKey;
        $array['fileName'] = $fileName;
        $array['fileSize'] = $fileSize;
        $array['isHeader'] = $isHeader;
        fclose($file);
        return $array;
    }

	/*
		Function that adds new VoterGroup by POST params
	*/
    public function addVoterGroup(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        $name = trim($request->input('name', null));
        if ( is_null($name) || strlen($name) < 2 ) {
            $jsonOutput->setErrorCode(config('errors.global.VOTER_GROUP_MODAL_GROUP_NAME_MISSING'));
            return;
        }

        $parentId = 0;

        $parentKey = $request->input('parentKey', null);
        if ( !is_null($parentKey) ) {
            $parentObj = VoterGroups::select('id')
                ->where('key', $parentKey)
                ->first();

            if ( is_null($parentObj) ) {
                $jsonOutput->setErrorCode(config('errors.global.VOTER_GROUP_MODAL_INVALID_PARENT_GROUP'));
                return;
            }

            $parentId = $parentObj->id;
        }

        $newVoterGroup = new VoterGroups;
        $newVoterGroup->key = Helper::getNewTableKey('voter_groups', 10);
        $newVoterGroup->name = $name;
        $newVoterGroup->parent_id = $parentId;
        $newVoterGroup->group_order = VoterGroups::where('parent_id', $parentId)->count();
        $newVoterGroup->save();

        $historyArgsArr = [
            'topicName' => 'elections.import.edit',
            'models' => [
                [
                    'description' => 'הוספת קבוצה בהעלאת קובץ',
                    'referenced_model' => 'VoterGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newVoterGroup->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.VoterGroups.name'),
                            'new_value' => $newVoterGroup->name
                        ],
                        [
                            'field_name' => 'parent_id',
                            'display_field_name' => config('history.VoterGroups.parent_id'),
                            'new_numeric_value' => $newVoterGroup->parent_id
                        ],
                        [
                            'field_name' => 'group_order',
                            'display_field_name' => config('history.VoterGroups.group_order'),
                            'new_numeric_value' => $newVoterGroup->group_order
                        ]
                    ]
                ]
            ]
        ];

        ActionController::AddHistoryItem($historyArgsArr);

        $jsonOutput->setData($newVoterGroup);
    }
	
	/*
		Function that updates CsvFile by its key , Default:where edit_type is NULL , then cancells process - status=5 + process_id=NULL
	*/
    public function editCsvFileStatus(Request $request,$csvFileKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        if ( is_null($csvFileKey) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_MISSING_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        }
        $csvFile = CsvFiles::where('csv_files.key', $csvFileKey)
            ->first();
        if ( is_null($csvFile) ) {
            $jsonOutput->setErrorCode( config('errors.elections.ELECTION_CAMPAIGN_INVALID_SUPPORT_STATUS_UPDATE_KEY') );
            return;
        } 
		if(!$request->input("edit_type")){
			if($csvFile->status == config('constants.CSV_PARSER_STATUS_AT_WORK')){
				$csvFile->status = config('constants.CSV_PARSER_STATUS_CANCELLED');
				$csvFile->process_id=NULL;
				$csvFile->save();
			}
			
		}
		else{
			if($request->input("edit_type") == "reload"){ //reload job
				if($csvFile->status = config('constants.CSV_PARSER_STATUS_CANCELLED') || $csvFile->status = config('constants.CSV_PARSER_STATUS_ERROR')){
					// Getting the job details
					 $job = (new csvJob(new CsvParser(), $csvFile->id))->onConnection('redis')->onQueue('csv');

					// Executing the job which parses the csv file
					 $this->dispatch($job);
					 $csvFile->status = config('constants.CSV_PARSER_STATUS_RESTARTED');
					 $csvFile->save();

				}
			}
		}
        

        $jsonOutput->setData('ok');
    }


}