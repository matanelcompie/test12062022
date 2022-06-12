<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Libraries\Helper;
use App\Http\Controllers\Controller;
use App\Models\FileGroups;
use App\Models\Files;
use App\Models\Modules;
use App\Models\ModulesInFileGroups;
use App\Models\User;
use App\Models\Voters;
use App\Models\RolesByUsers;
use App\Models\UserRoles;
use Lang;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ActionController;
use Carbon\Carbon;
use Redirect;

/**
 * Class GlobalFilesController
 * This controller handles the actions
 * and information regarding the global files screen - /system/files route on ui
 *
 * @package App\Http\Controllers
 */
class GlobalFilesController extends Controller {
  
  
    	/**
	 * This function downloads a file
	 * or opens it in the browser.
	 *
	 * @param $fileKey
	 * @return mixed
	 */
    public function downloadFile($fileKey) {
		$jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);
 
 
        $file = Files::where('key', $fileKey)->where('deleted',0)->first();

        if ( $file == null ) {
            return Redirect::to('file_not_found');
        }

        $fullPath = config( 'constants.GLOBAL_FILES_DIRECTORY' ) . $file->key;

        if ( !file_exists($fullPath) ) {
            return Redirect::to('file_not_found');
        }

        $fileContent = file_get_contents(config('constants.GLOBAL_FILES_DIRECTORY') . $file->key);
        header("Content-type: ".$this->getCtype($file->type)."; charset=UTF-8");
        header("Content-Disposition: attachment; filename=" . $file->name . "." .$file->type);
        header("Pragma: no-cache");
        header("Expires: 0");

        echo $fileContent;
        die;
    }
	
	/*
	 Returns content type of file by extention
	*/
	 private function getCtype($fileExtension) {
        switch ($fileExtension) {
            case "pdf":
                return "application/pdf";
                break;

            case "doc":
                return "application/msword";
                break;

            case 'rtf':
                return 'application/rtf';
                break;

            case 'xls':
            case 'csv':
                return 'application/vnd.ms-excel';
                break;

            case 'ppt':
                return 'application/vnd.ms-powerpoint';
                break;

            case 'txt':
                return 'text/plain';
                break;

			case 'xlsx':
				return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
				break;

			case 'docx':
				return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
				break;

			case 'jpg':	
			case 'jfif':	
			    return 'image/jpeg';
				break;
			case 'png':
			case 'gif':
				return 'image/' . $fileExtension;
				break;
        }
    }
  
   /*
	    Handles editing specific file by its key and request params
	*/
    public function editExistingFile(Request $request , $file_key){
		$jsonOutput = app()->make("JsonOutput");

		$file = Files::where('deleted' , 0)->where('key' , $file_key)->first();

        $fileFields = [
            'file_name',
            'name',
            'type',
            'size'
        ];

		$oldFileValues = [];
        for ( $fieldIndex = 0; $fieldIndex < count($fileFields); $fieldIndex++ ) {
            $fieldName = $fileFields[$fieldIndex];

            $oldFileValues[$fieldName] = $file->{$fieldName};
        }

		if($file){
			$fileUpload=$request->file('file_upload');
			if($fileUpload){
				$newFileName = $file->key;
				$newFileDestination = config('constants.GLOBAL_FILES_DIRECTORY');
				if(file_exists($newFileDestination.$file->key)){
					unlink($newFileDestination.$file->key);
				}
				$fileUpload->move($newFileDestination, $newFileName);
				
				$filePath = $newFileDestination . $newFileName;
               
				$file->file_name = $request->input('document_original_name');
				
				$file->type=$request->input('file_type');
				$file->size=filesize(config('constants.GLOBAL_FILES_DIRECTORY') . $newFileName);
			}
			 
			$file->name = $request->input("new_file_name");
			$file->save();

            $changedValues = [];
            for ( $fieldIndex = 0; $fieldIndex < count($fileFields); $fieldIndex++ ) {
                $fieldName = $fileFields[$fieldIndex];

                if ( $file->{$fieldName} != $oldFileValues[$fieldName] ) {
                    if ( 'size' == $fieldName ) {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Files.' . $fieldName),
                            'old_numeric_value' => $oldFileValues[$fieldName],
                            'new_numeric_value' => $file->{$fieldName}
                        ];
                    } else {
                        $changedValues[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Files.' . $fieldName),
                            'old_value' => $oldFileValues[$fieldName],
                            'new_value' => $file->{$fieldName}
                        ];
                    }
                }
            }

            if ( count($changedValues) > 0 ) {
                $historyArgsArr = [
                    'topicName' => 'system.files.edit',
                    'models' => [
                        [
                            'referenced_model' => 'Files',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                            'referenced_id' => $file->id,
                            'valuesList' => $changedValues
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);
            }
		}

		$jsonOutput->setData("ok");
	}
  
  
    /*
	    Handles deleting specific file by its key
	*/
    public function deleteExistingFile($file_key){
		$jsonOutput = app()->make("JsonOutput");
		$file = Files::where('deleted' , 0)->where('key' , $file_key)->first();
		if($file){
			$filesDirectory = config('constants.GLOBAL_FILES_DIRECTORY');
			if(file_exists($filesDirectory.$file->key)){
				unlink($filesDirectory.$file->key);
			}

			$file->deleted = 1;
			$file->save();

            $historyArgsArr = [
                'topicName' => 'system.files.delete',
                'models' => [
                    [
                        'referenced_model' => 'Files',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                        'referenced_id' => $file->id
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);
        }

		$jsonOutput->setData("ok");
	}
  
  
    /*
	Handles adding file to file group
	
	request params : new_file_name,document_original_name , file_upload
	*/
    public function addNewFile(Request $request , $file_group_key){
		$jsonOutput = app()->make("JsonOutput");
		if ($request->file('file_upload') && $request->input('new_file_name') && $request->input('document_original_name')) {
			$fileGroup = FileGroups::where('key' ,  $file_group_key)->where('deleted',0)->first();
			if($fileGroup){
				$newTableKey = Helper::getNewTableKey('files', 5);
                $fileUpload=$request->file('file_upload');
                //save file at fileserver :
                $newFileName = $newTableKey;
                $newFileDestination = config('constants.GLOBAL_FILES_DIRECTORY');
                $fileUpload->move($newFileDestination, $newFileName);
				
				$filePath = $newFileDestination . $newFileName;
              
				 
				$newFile = new Files;
				$newFile->key=$newTableKey;
				$newFile->file_group_id = $fileGroup->id;
				$newFile->file_name = $request->input('document_original_name');
				$newFile->name = $request->input('new_file_name');
				$newFile->type=$request->input('file_type');
				$newFile->size=filesize(config('constants.GLOBAL_FILES_DIRECTORY') . $newFileName);
				$newFile->user_create_id =Auth::user()->id;
				$newFile->save();

                $fileFields = [
                    'file_group_id',
                    'file_name',
                    'name',
                    'type',
                    'size'
                ];

                $fieldsArray = [];
                for ( $fieldIndex = 0; $fieldIndex < count($fileFields); $fieldIndex++ ) {
                    $fieldName = $fileFields[$fieldIndex];

                    if ( 'size' == $fieldName || 'file_group_id' == $fieldName ) {
                        $fieldsArray[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Files.' . $fieldName),
                            'new_numeric_value' => $newFile->{$fieldName}
                        ];
                    } else {
                        $fieldsArray[] = [
                            'field_name' => $fieldName,
                            'display_field_name' => config('history.Files.' . $fieldName),
                            'new_value' => $newFile->{$fieldName}
                        ];
                    }
                }

                $historyArgsArr = [
                    'topicName' => 'system.files.add',
                    'models' => [
                        [
                            'referenced_model' => 'Files',
                            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                            'referenced_id' => $newFile->id,
                            'valuesList' => $fieldsArray
                        ]
                    ]
                ];

                ActionController::AddHistoryItem($historyArgsArr);

				$voterData = Voters::select('first_name' , 'last_name')->where('id' , Auth::user()->voter_id)->first();
				if($voterData){
					$newFile->first_name = $voterData->first_name;
					$newFile->last_name = $voterData->last_name;
				}
				$jsonOutput->setData($newFile); 
			}
			else{
				$jsonOutput->setData("Wrong file-group key"); 
			}
		}
		else{
			$jsonOutput->setErrorCode(config('errors.system.MISSING_DOCUMENT_FILE'));
            return;
		}
	}
  
  
     /*
	 Will return all group-files
	 */
     public function getGroupsWithFiles(){
		 $jsonOutput = app()->make("JsonOutput");
		 $fileGroups = [];
		 if(Auth::user()->admin ==1){
		     $fileGroups = FileGroups::select('id','key','name')->where('deleted',0)->with(['modules' => function($query){$query->select('modules.id','name');}])->with(['files' => function($query){$query->withUserVoter()->select('files.key as key' , 'files.name as name' , 'file_group_id','type','file_name' , 'size','files.created_at','first_name','last_name')->where('files.deleted' , 0);}])->get();
		 }
		 else{
			 $arrayModulesIDS = array();
			 $currentDate = date(config('constants.APP_DATE_DB_FORMAT'), time());
			 $rolesByUser = RolesByUsers::select('module_id')->withUserRoleOnly()->where('roles_by_users.deleted',0)->where('user_roles.deleted',0)->where('user_id',Auth::user()->id)
			 ->where(function ($query1) use ($currentDate) {$query1->whereNull('to_date')->orWhere('to_date', '<=', $currentDate);})->get();
			 for($i = 0 ; $i<sizeof( $rolesByUser);$i++){
				  if(!in_array($rolesByUser[$i]->module_id , $arrayModulesIDS)){
					 array_push($arrayModulesIDS ,  $rolesByUser[$i]->module_id);
				  }
			 }
		    $fileGroups = FileGroups::select('id','key','name')->where('deleted',0)
			->with(['modules' => function($query) use($arrayModulesIDS){$query->select('modules.id','name')->whereIn('modules_in_file_groups.module_id' ,$arrayModulesIDS );}])
			->whereHas('modules' , function($query) use($arrayModulesIDS){$query->select('modules.id','name')->whereIn('modules_in_file_groups.module_id' ,$arrayModulesIDS );})
			->with(['files' => function($query){$query->withUserVoter()->select('files.key as key' , 'files.name as name' , 'file_group_id','type','file_name' , 'size','files.created_at','first_name','last_name')->where('files.deleted' , 0);}])->get();
		
		 }
		 $jsonOutput->setData($fileGroups); 
	 }
    
	/*
	 Will return all existing modules
	 */
	public function getAllModules(){
		$jsonOutput = app()->make("JsonOutput");
		 $modules = Modules::select('id','name')->get();
		 $jsonOutput->setData($modules); 	
	}
	
	/*
	Handles adding new file-group
	
	request params : name , module_items
	*/
	public function addNewFileGroup(Request $request){
		$jsonOutput = app()->make("JsonOutput");

        $newKey = Helper::getNewTableKey('file_groups', 5);

        $newFileGroups = new FileGroups;
        $newFileGroups->key = $newKey;
        $newFileGroups->name = $request->input('name');
        $newFileGroups->save();

        $historyArgsArr = [
            'topicName' => 'system.files.groups.add',
            'models' => [
                [
                    'referenced_model' => 'FileGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newFileGroups->id,
                    'valuesList' => [
                        [
                            'field_name' => 'name',
                            'display_field_name' => config('history.FileGroups.name'),
                            'new_value' => $newFileGroups->name
                        ]
                    ]
                ]
            ]
        ];

		$module_items = json_decode( $request->input('module_items'),true);

		foreach ($module_items as $item){
			$newModulesInFileGroups = new ModulesInFileGroups;
            $newModulesInFileGroups->file_group_id = $newFileGroups->id;
            $newModulesInFileGroups->module_id = $item['id'];
            $newModulesInFileGroups->save();

            $historyArgsArr['models'][] = [
                'description' => 'הוספת מודולים לקבוצת קבצים',
                'referenced_model' => 'ModulesInFileGroups',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                'referenced_id' => $newModulesInFileGroups->id,
                'valuesList' => [
                    [
                        'field_name' => 'file_group_id',
                        'display_field_name' => config('history.ModulesInFileGroups.file_group_id'),
                        'new_numeric_value' => $newModulesInFileGroups->file_group_id
                    ],
                    [
                        'field_name' => 'module_id',
                        'display_field_name' => config('history.ModulesInFileGroups.module_id'),
                        'new_numeric_value' => $newModulesInFileGroups->module_id
                    ]
                ]
            ];
		}

        ActionController::AddHistoryItem($historyArgsArr);

		$insertedRow = FileGroups::where('key' , $newKey)
            ->with('modules')
            ->first();
		$insertedRow->files = array();

		$jsonOutput->setData($insertedRow); 
	}
	
	/*
	Handles deleting file-group with all its related items in other table
	
	
	*/
	public function deleteFileGroup($file_group_key){
		$jsonOutput = app()->make("JsonOutput");

        $historyArgsArr = [
            'topicName' => 'system.files.groups.delete',
            'models' => []
        ];

		$existingFileGroup = FileGroups::where('deleted',0)->where('key' , $file_group_key)->first();
		if($existingFileGroup){
            $deletedModules = ModulesInFileGroups::where('file_group_id' ,$existingFileGroup->id )
                ->get();
            ModulesInFileGroups::where('file_group_id' ,$existingFileGroup->id )->delete();

            for ( $moduleIndex = 0; $moduleIndex < count($deletedModules); $moduleIndex++ ) {
                $historyArgsArr['models'][] = [
                    'description' => 'מחיקת מודולים לקבוצת קבצים',
                    'referenced_model' => 'ModulesInFileGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $deletedModules[$moduleIndex]->id,
                ];
            }

            $filesDirectory = config('constants.GLOBAL_FILES_DIRECTORY');
            $files = Files::where('deleted' , 0)->where('file_group_id' , $existingFileGroup->id)->get();

            for($i = 0 ; $i<sizeof($files) ; $i++){
                if(file_exists($filesDirectory.$files[$i]->key)){
                    unlink($filesDirectory.$files[$i]->key);
                }

                $files[$i]->deleted = 1;
                $files[$i]->save();

                $historyArgsArr['models'][] = [
                    'description' => 'מחיקת קבצים לקבוצת קבצים',
                    'referenced_model' => 'Files',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $files[$i]->id,
                ];
            }

            $existingFileGroup->deleted = 1;
            $existingFileGroup->save();

            $historyArgsArr['models'][] = [
                'referenced_model' => 'FileGroups',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                'referenced_id' => $existingFileGroup->id,
            ];

            ActionController::AddHistoryItem($historyArgsArr);
		}
		
		$jsonOutput->setData('ok');
	}
	
	/*
	Handles editing existing file group
	
	request params : name , module_items
	*/
	public function editFileGroup(Request $request , $file_group_key){
		$jsonOutput = app()->make("JsonOutput");

		$existingFileGroup = FileGroups::where('deleted',0)
            ->where('key' , $file_group_key)
            ->first();

        $historyArgsArr = [
            'topicName' => 'system.files.groups.edit',
            'models' => []
        ];

        $modelDeleted = [];
        $modelInserts = [];
		if ($existingFileGroup) {
		    $deletedModules = ModulesInFileGroups::where('file_group_id' ,$existingFileGroup->id )
                ->get();
            ModulesInFileGroups::where('file_group_id' ,$existingFileGroup->id )->delete();

            for ( $moduleIndex = 0; $moduleIndex < count($deletedModules); $moduleIndex++ ) {
                $modelDeleted[] = [
                    'description' => 'מחיקת מודולים לקבוצת קבצים',
                    'referenced_model' => 'ModulesInFileGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                    'referenced_id' => $deletedModules[$moduleIndex]->id,
                ];
            }


            $module_items= json_decode( $request->input('module_items'),true);
            foreach ($module_items as $item){
                ModulesInFileGroups::insert(['file_group_id'=>$existingFileGroup->id  , 'module_id'=>$item['id']]);

                $newModulesInFileGroups = new ModulesInFileGroups;
                $newModulesInFileGroups->file_group_id = $existingFileGroup->id;
                $newModulesInFileGroups->module_id = $item['id'];
                $newModulesInFileGroups->save();

                $modelInserts[] = [
                    'description' => 'הוספת מודולים לקבוצת קבצים',
                    'referenced_model' => 'ModulesInFileGroups',
                    'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
                    'referenced_id' => $newModulesInFileGroups->id,
                    'valuesList' => [
                        [
                            'field_name' => 'file_group_id',
                            'display_field_name' => config('history.ModulesInFileGroups.file_group_id'),
                            'new_numeric_value' => $newModulesInFileGroups->file_group_id
                        ],
                        [
                            'field_name' => 'module_id',
                            'display_field_name' => config('history.ModulesInFileGroups.module_id'),
                            'new_numeric_value' => $newModulesInFileGroups->module_id
                        ]
                    ]
                ];
            }
		}

		$oldFileGroupName = $existingFileGroup->name;
		$existingFileGroup->name = $request->input('name');
		$existingFileGroup->save();

		if ( $existingFileGroup->name != $oldFileGroupName ) {
            $historyArgsArr['models'][] = [
                'referenced_model' => 'FileGroups',
                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                'referenced_id' => $existingFileGroup->id,
                'valuesList' => [
                    [
                        'field_name' => 'name',
                        'display_field_name' =>  config('history.FileGroups.name'),
                        'old_value' => $oldFileGroupName,
                        'new_value' => $existingFileGroup->name
                    ]
                ]
            ];
        }

        if ( count($modelDeleted) > 0 ) {
            $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $modelDeleted);
        }

        if ( count($modelInserts) > 0 ) {
            $historyArgsArr['models'] = array_merge($historyArgsArr['models'], $modelInserts);
        }

        if ( count($historyArgsArr['models']) > 0 ) {
            ActionController::AddHistoryItem($historyArgsArr);
        }

		$jsonOutput->setData('ok');
	}
}
