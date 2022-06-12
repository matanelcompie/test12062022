<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Auth;
use Redirect;

use App\Models\Document;
use App\Models\DocumentEntity;
use App\Models\DocumentTypes;
use App\Models\Voters;
use App\Models\City;
use App\Models\UnknownVoters;
use App\Models\CrmRequest;
use App\Models\CrmRequestStatus;
use App\Models\ElectionRolesByVoters;
use App\Models\VotersInElectionCampaigns;
use App\Models\ElectionCampaigns;

use App\Models\BankDetails;


use App\Libraries\Helper;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

class DocumentController extends Controller {

	const VOTER = 0;
	const UNKNOWN_VOTER = 1;

	/*
		Function that returns all document types
	*/
    public function getDocumentTypes() {
		$jsonOutput = app()->make( "JsonOutput" );

		$documentTypes = DocumentTypes::select(['id', 'name'])->where('deleted', 0)->get();

		$jsonOutput->setData( $documentTypes );
	}

	/*
		Private helpful function that returns voterID by voterKey
	*/
	private function getVoterIdByKey($voterKey) {
        $voters = Voters::where('key', $voterKey)->first( ['voters.id'] );

        return $voters->id;
    }
	
	/*
		Private helpful function that returns crmRequestID by crmRequestKey
	*/
	private function getCrmRequestIdByKey ( $reqKey ) {
        $crmRequest = CrmRequest::where( 'key', $reqKey )->first( [ 'id' ] );
        return $crmRequest->id;
    }

	/*
		Private helpful function that returns documents of specific voter by voterKey
	*/
    private function getVoterDocuments($voterKey) {
        $jsonOutput = app()->make( "JsonOutput" );

		$currentVoter = Voters::where( 'voters.key', $voterKey )->first( ['voters.id'] );
		if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
			return;
		}

		$currentVoter = Voters::withFilters()->where( 'voters.key', $voterKey )->first( ['voters.id'] );
		if ( $currentVoter == null ) {
			$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
			return;
		}

        $entity_id = $this->getVoterIdByKey($voterKey);
        $voterDocumentsQuery = Voters::where('voters.id', $entity_id)->first( [ 'voters.id' ] )->documents()
                                     ->select('documents.id', 'documents.key',\DB::raw("'null' as request_key"),
											  'documents.name', 'documents.type','documents.created_at')
                                     ->where('documents.deleted', 0);
        $requestDocuments = Document::select('documents.id', 'documents.key', 'requests.key AS request_key',
			                                 'documents.name', 'documents.type','documents.created_at' )
                                    ->where('documents.deleted', 0)
                                    ->fromRequestsOfVoter($entity_id)->union($voterDocumentsQuery)
                                    ->orderBy('created_at', 'DESC')
									->get();
		$this->getVoterRolesDocs($requestDocuments, $entity_id);
        for($i = 0 ; $i < sizeof($requestDocuments) ; $i++){
			$fullPath = config( 'constants.DOCUMENTS_DIRECTORY' ) . $requestDocuments[$i]->key;
			$requestDocuments[$i]->document_file_missing = (file_exists($fullPath) ? '0':'1');
		}
        $jsonOutput->setData( $requestDocuments );
    }
	private function getVoterRolesDocs(&$requestDocuments, $entity_id){
		$voterElectionRolesDocs = BankDetails::select('verify_bank_document_key')
		->where('voter_id', $entity_id)
		->whereNotNull('verify_bank_document_key')
		->get();
		$docsHash = [];
		if($voterElectionRolesDocs){
			foreach($voterElectionRolesDocs as $roleDoc){
				$docsHash[$roleDoc->verify_bank_document_key] = $roleDoc->verify_bank_document_key;
			}

		}
	}
	/*
		Private helpful function that returns documents of specific crm_request by crmReqyestKey
	*/
    private function getCrmRequestDocuments($reqKey) {
        $jsonOutput = app()->make( "JsonOutput" );
        $entity_id = $this->getCrmRequestIdByKey($reqKey);
        $requestDocuments = CrmRequest::where('id', $entity_id)->first( [ 'id' ] )
                                      ->documents()->get();
        $jsonOutput->setData($requestDocuments);
    }

	/*
		Function that returns all document of entity , by entity type(voter or crmRequest) and entity key
	*/
    public function getDocuments(Request $request, $key) {
		$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
		if ( in_array('elections.voter.documents', $routePermissions) ) {
			$this->getVoterDocuments($key);
			return;
		}

		if ( in_array('crm.requests.documents', $routePermissions) ) {
			$this->getCrmRequestDocuments($key);
			return;
		}
    }

	/*
		Function that edits specific document by its key
	*/
    public function editDocument(Request $request, $entityKey, $documentKey) {
		$jsonOutput = app()->make( "JsonOutput" );
		if($entityKey == null || trim($entityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_MISSING_ENTITY_KEY'));
			return;
		}
		if($documentKey == null || trim($documentKey) == ''){
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_MISSING_FILE_KEY'));
			return;
		}
		if($request->input('document_name') == null || trim($request->input('document_name')) == ''){
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_MISSING_FILE_NAME'));
			return;
		}

		$doEdit = true;
		$routeName = '';

		$document = Document::where('key', $documentKey)->first();
		if(!$document){
			$doEdit = false;
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_MISSING_FILE_NAME'));
			return;
		}

		$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
		if ( in_array('elections.voter.documents.edit', $routePermissions) ) {
			$routeName = 'elections.voter.documents.edit';
		} else if ( in_array('crm.requests.documents.edit', $routePermissions) ) {
			$routeName = 'crm.requests.documents.edit';
		}

        if($doEdit){
        	if ($document != null) {
				$oldDocumentName = $document->name;

            	$document->name = $request->input('document_name');
            	$document->save();
				$is_bank_verify_doc = $request->input('is_bank_verify_doc', null);
				if(!is_null($is_bank_verify_doc)) {
						$voter= Voters::where('key', $entityKey)->first();
						$newDocKey = $is_bank_verify_doc ? $documentKey : null;
						if($voter ){
							BankDetails::where('voter_id', $voter->id)->update([ 'verify_bank_document_key' => $newDocKey ]);
						}

					// }
				}
				$fieldsArray = [];
				if ( $oldDocumentName != $document->name ) {
					$fieldsArray[] = [
						'field_name' => 'name', // Fileld name
						'display_field_name' => config('history.Document.name'), // display field name
						'old_value' => $oldDocumentName, // old value of field
						'new_value' => $document->name // new value of field
					];

                    $historyArgsArr = [
                        'topicName' => $routeName,
                        'models' => [
                            [
                                'referenced_model' => 'Document',
                                'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
                                'referenced_id' => $document->id,
                                'valuesList' => $fieldsArray
                            ]
                        ]
                    ];

                    ActionController::AddHistoryItem($historyArgsArr);
				}
        	}
		}

        $jsonOutput->setData( $document );
    }

	/*
		Function that deletes specific document by its key
	*/
    public function deleteDocument(Request $request, $entityKey, $documentKey) {
		$jsonOutput = app()->make( "JsonOutput" );
		if($entityKey == null || trim($entityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_MISSING_ENTITY_KEY'));
			return;
		}
		if($documentKey == null || trim($documentKey) == ''){
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_MISSING_FILE_KEY'));
			return;
		}
		$entity = null;
		$doDelete = false;
		$routeName = '';
		$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
		if ( in_array('elections.voter.documents.delete', $routePermissions) ) {
			$routeName = 'elections.voter.documents.delete';

			$entity = Voters::withFilters()->where('voters.key', $entityKey)->first( [ 'voters.id' ] );
			if($entity){
				$doDelete = true;
			}
			else{
				$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
				return;
			}
		} else if ( in_array('crm.requests.documents.delete', $routePermissions) ) {
			$routeName = 'crm.requests.documents.delete';

			$entity = CrmRequest::where( 'key', $entityKey )->first();
			if($entity){
				$statusTypeID = 0;
				$statusType = CrmRequestStatus::select('type_id')->where('id' , $entity->status_id)->first();
				if($statusType){
					$statusTypeID = $statusType->type_id;
				}
				if(  $statusTypeID != 3){
					$doDelete = true;
				}
				else{
					$jsonOutput->setErrorCode(config('errors.crm.CANT_PERFORM_ACTION_FOR_FINISHED_REQUEST'));
					return;
				}
			}
			else{
				$jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
				return;
			}
		}

		if($doDelete && $entity){
        	$document = Document::where('key', $documentKey)->first();

        	$entity->documents()->detach($document->id);
			
			BankDetails::select('id')->where('verify_bank_document_key', $documentKey)->update(['verify_bank_document_key' => null, 'is_bank_verified' => 0]);

			$document->deleted = 1;
        	$document->save();

            $historyArgsArr = [
                'topicName' => $routeName,
                'models' => [
                    [
                        'referenced_model' => 'Document',
                        'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
                        'referenced_id' => $document->id
                    ]
                ]
            ];

            ActionController::AddHistoryItem($historyArgsArr);

			$jsonOutput->setData( $document );
		}
    }

	/*
		Private helpful function that validates that the extension of
		uploaded document is correct
	*/
	private function validateFileExtension($fileUpload) {
		$documentTypes = DocumentTypes::select('name')->where('deleted', 0)->get();
		$fileExtension = strtolower($fileUpload->getClientOriginalExtension());

		for ( $typeIndex = 0; $typeIndex < count($documentTypes); $typeIndex++ ) {
			if ( $documentTypes[$typeIndex]->name == $fileExtension ) {
				return true;
			}
		}
		return false;
	}

	/*
		Private helpful function that validates that the MimeType of
		uploaded document is correct
	*/
	private function validateFileMimeType($fileUpload) {
		$documentTypes = DocumentTypes::select('mime_type')->where('deleted', 0)->get();
		$fileMimeType = $fileUpload->getMimeType();

		for ( $typeIndex = 0; $typeIndex < count($documentTypes); $typeIndex++ ) {
			if ( $documentTypes[$typeIndex]->mime_type == $fileMimeType ) {
				return true;
			}
		}
		return false;
	}

	/*
		Private helpful function that returns the history model of specific document
	*/
	private static function getHistoryModel($document, $documentArgs) {
        $fieldsArray = [];

        $fieldsArray[] = [
            'field_name' => 'entity_type',
            'display_field_name' => config('history.Document.entity_type'),
            'new_value' => ( $documentArgs['entity_type'] == config( 'constants.ENTITY_TYPE_VOTER' ) ? 'תושב' : 'פניה'),
            'new_numeric_value' => $documentArgs['entity_type']
        ];

        $fieldsArray[] = [
            'field_name' => 'entity_id',
            'display_field_name' => config('history.Document.entity_id'),
            'new_numeric_value' => $documentArgs['entity']->id
        ];

        // Array of display field names
        $historyFieldsNames = [
            'name'      =>  config('history.Document.name'),
            'type'      =>  config('history.Document.type'),
            'file_name' =>  config('history.Document.file_name')
        ];

        foreach ( $historyFieldsNames as $fieldName => $display_field_name ) {
            $fieldsArray[] = [
                'field_name' => $fieldName,
                'display_field_name' => $display_field_name,
                'new_value' => $document->{$fieldName}
            ];
        }

        $model = [
            'referenced_model' => 'Document',
            'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
            'referenced_id' => $document->id,
            'valuesList' => $fieldsArray
        ];

        return $model;
    }

	/*
		Private helpful function that saves  history model of specific document
	*/
    private static function saveDocumentHistory($routeName, $document, $documentArgs) {
        $historyArgsArr = [
            'topicName' => $routeName,
            'models' => []
        ];

        $historyArgsArr['models'][] = self::getHistoryModel($document, $documentArgs);

        ActionController::AddHistoryItem($historyArgsArr);
    }

	/*
		Private helpful function that saves document by documentArgs
	*/
	private static function saveDocument($documentsArgs) {
        $documentName = $documentsArgs['documentName'];
        $fileUpload = $documentsArgs['fileUpload'];
        $entity = $documentsArgs['entity'];
        $entityType = $documentsArgs['entity_type'];

        $document = new Document;
        $document->name = $documentName;
        $document->key = Helper::getNewTableKey('documents', 10);
        $document->file_name = $document->key;
        $document->type = strtolower( $fileUpload->getClientOriginalExtension());
        $document->save();
        $entity->documents()->attach($document->id, ['entity_type' => $entityType] );

        $newFileName = $document->file_name;
        $newFileDestination = config( 'constants.DOCUMENTS_DIRECTORY' );
        $fileUpload->move($newFileDestination, $newFileName);

        return $document;
    }

	/*
		Private helpful function that adds voter document
	*/
    private function addVoterDocument($routeName, $documentArgs) {
        $document = $this->saveDocument($documentArgs);
        $this->saveDocumentHistory($routeName, $document, $documentArgs);
        return $document;
    }

	/*
		Function that adds new document to CrmRequest entity
	*/
	public static function addDocumentRequest($documentName, $fileUpload, $entity, $entityType, $routeName, $documentSoureceRequest = false){
        $documentArgs = [
            'documentName' => $documentName,
            'fileUpload' => $fileUpload,
            'entity' => $entity,
            'entity_type' => $entityType
        ];

        $document = self::saveDocument($documentArgs);

        if ( !$documentSoureceRequest ) {
            self::saveDocumentHistory($routeName, $document, $documentArgs);
            return $document;
        } else {
            return self::getHistoryModel($document, $documentArgs);
        }
    }

	/*
		Function that adds new document to entity , by entity type
	*/
    public function addDocument(Request $request, $entityKey) {
		$jsonOutput = app()->make( "JsonOutput" );

		if( is_null($entityKey) || trim($entityKey) == ''){
			$jsonOutput->setErrorCode(config('errors.system.DOCUMENT_MISSING_ENTITY_KEY'));
			return;
		}

		if( is_null($request->input('document_name')) || trim($request->input('document_name')) == ''){
			$jsonOutput->setErrorCode(config('errors.system.DOCUMENT_MISSING_FILE_KEY'));
			return;
		}

		$fileUpload = $request->file('file_upload', null);
		if($fileUpload == null){
			$jsonOutput->setErrorCode(config('errors.global.MISSING_DOCUMENT_FILE'));
			return;
		}
		$maxUploadSize = config('settings.max_upload_size');
		if ($fileUpload->getSize() > Helper::sizeToBytes($maxUploadSize)) {
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_FILE_SIZE_EXCEEDED'));
			return;
		}

		if (!$fileUpload->isValid()) {
			$jsonOutput->setErrorCode(config('errors.global.DOCUMENT_ERROR'));
			$jsonOutput->setErrorData($fileUpload->getErrorMessage());
			return;
		}


		if ( !$this->validateFileExtension($fileUpload) ) {
			$jsonOutput->setErrorCode( config('errors.global.DOCUMENT_FILE_EXTENSION_NOT_ALLOWED') );
			return;
		}
		if ( !$this->validateFileMimeType($fileUpload) ) {
			$jsonOutput->setErrorCode( config('errors.global.DOCUMENT_TYPE_MISMATCH_TO_EXTENSION') );
			return;
		}


		$routeName = '';
		$doSave = false;
		$routePermissions = array_map('trim', explode(',', Route::currentRouteName()));
		$doc_entity_type = $request->input('doc_entity_type');
		if ( in_array('elections.voter.documents.add', $routePermissions)  ) {
			$routeName = 'elections.voter.documents.add';

			$entity_type = config( 'constants.ENTITY_TYPE_VOTER' );

			$voterExist = Voters::select('voters.id')->where('voters.key', $entityKey)->first();
			if (null == $voterExist) {
				$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
				return;
			}

			$entity = Voters::withFilters()->where('voters.key', $entityKey)->first(['voters.id']);
			if ($entity == null) {
				$jsonOutput->setErrorCode(config('errors.elections.VOTER_IS_NOT_PERMITED'));
				return;
			}

			$doSave = true;
		} else if ( in_array('crm.requests.documents.add', $routePermissions) ) {
			$routeName = 'crm.requests.documents.add';

			$entity_type = config( 'constants.ENTITY_TYPE_REQUEST' );
			$entity = CrmRequest::where( 'key', $entityKey )->first();
			if ($entity) {
				$statusTypeID = 0;
				$statusType = CrmRequestStatus::select('type_id')->where('id' , $entity->status_id)->first();
				if($statusType){
					$statusTypeID = $statusType->type_id;
				}

				if ( $statusTypeID != 3 ) {
					$doSave = true;
				} else {
					$jsonOutput->setErrorCode(config('errors.crm.CANT_PERFORM_ACTION_FOR_FINISHED_REQUEST'));
					return;
				}
			} else {
				$jsonOutput->setErrorCode(config('errors.crm.REQUEST_DOESNT_EXIST'));
				return;
			}
		} else if(  $doc_entity_type == 'bank_verify_document'){
			$entity_type = config( 'constants.ENTITY_TYPE_VOTER' );

			$routeName = 'elections.voter.documents.add';

			$voterExist = Voters::select('voters.id')->where('voters.key', $entityKey)->first();
			if (!$voterExist) {
				$jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));return;
			}
			$bankDetails = BankDetails::select('is_bank_verified')->where('voter_id', $voterExist->id)->first();
			$entity = Voters::where('voters.key', $entityKey)->first(['voters.id']);
			if($bankDetails->is_bank_verified == 0){
				$doSave = true;
			}
		}

		if ($doSave) {
		    if ( 'crm.requests.documents.add' == $routeName ) {
                $document = $this->addDocumentRequest($request->input('document_name'), $request->file('file_upload'), $entity,
                                          $entity_type, $routeName);

                $jsonOutput->setData( $document );
            } else  if ( 'elections.voter.documents.add' == $routeName) {
                $documentArgs = [
                    'documentName' => $request->input('document_name'),
                    'fileUpload' => $request->file('file_upload'),
                    'entity' => $entity,
                    'entity_type' => $entity_type
				];
                $document = $this->addVoterDocument($routeName, $documentArgs);
				// dd($doc_entity_type);
				
				if($doc_entity_type == 'bank_verify_document'){

					$voterBankDetails = BankDetails::where('voter_id', $entity->id)->first();
					if($voterBankDetails){
						$voterBankDetails->verify_bank_document_key = $document->key;
						$voterBankDetails->save();
					}
				}
                $jsonOutput->setData( $document );
            }
		}
    }

	/*
		Private helpful function that returns MimeType by file extension name
	*/
    private function getCtype($fileExtension) {
        switch (strtolower($fileExtension)) {
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

			case 'png':
			case 'jpg':
			case 'jpeg':
			case 'gif':
				return 'image/' . $fileExtension;
				break;
			case 'jfif':	
				return 'image/jpeg';
				break;
        }
		
    }

	/**
	 * Checking if the user can watch
	 * the voter's details
	 *
	 * @param $voter
	 * @return bool
	 */
	private function canUserWatchVoter($voter) {
		if ($voter->voterType == DocumentController::UNKNOWN_VOTER) return true;
		$viewableVoter = Voters::withFilters()->where('voters.id', $voter->voterId)->first(['voters.id']);
		if ($viewableVoter == null) {
			$currentCampaignId = ElectionCampaigns::currentCampaign()->id;
			$VotersInElectionCampaign = VotersInElectionCampaigns::where('voter_id', $voter->voterId)->where('election_campaign_id', $currentCampaignId )->first();
			if(!$VotersInElectionCampaign ) { return true;}
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Checking if voter associated with the documents exists
	 *
	 * @param $voter
	 * @return bool
	 */
	private function doesVoterExist($voter) {
		$found = false;
		if ($voter->voterType == DocumentController::VOTER) {
			$voterExist = Voters::select('voters.id')->where('voters.id', $voter->voterId)->first(['voters.id']);
		} else {
			$voterExist = UnknownVoters::select('id')->where('id', $voter->voterId)->first(['id']);
		}
		if ($voterExist != null) $found = true;
		return $found;
	}

	/**
	 * This function gets the voter who is associated
	 * to the document according to the entity type.
	 *
	 * @param $documentEntity
	 * @return object
	 */
	private function getVoterAssociatedWithDocument($documentEntity) {

		$voterObject = new \stdClass;


		switch ( $documentEntity->entity_type ) {
			// If the document's entity is voter, then
			// the entity_id is the voter_id
			case config( 'constants.ENTITY_TYPE_VOTER' ):
				$voterObject->voterId = $documentEntity->entity_id;
				$voterObject->voterType = DocumentController::VOTER;
				break;

			// If the document's entity is request, then
			// get the voter_id or unknown_voter_id from the request
			case config( 'constants.ENTITY_TYPE_REQUEST' ):
				$requestObj = CrmRequest::select('voter_id', 'unknown_voter_id')->where('id', $documentEntity->entity_id)->first();
				if (($requestObj->voter_id != null)&&($requestObj->voter_id > 0)) {
					$voterObject->voterId = $requestObj->voter_id;
					$voterObject->voterType = DocumentController::VOTER;
				} else {
					$voterObject->voterId = $requestObj->unknown_voter_id;
					$voterObject->voterType = DocumentController::UNKNOWN_VOTER;					
				}
				
				break;
		}

		return $voterObject;
	}

	/**
	 * This function Checks if the url is a crm url,
	 * and the document's entity is a voter.
	 * In this case the user is not allowed to
	 * get access to the document.
	 *
	 * @param $entityType
	 * @return bool
	 */
	private function checkIfVoterDocumentIsInCrmUrl($entityType) {
		$path = Route::getCurrentRoute()->getPath();
		$segments = explode('/', $path);

		if ( $entityType == config( 'constants.ENTITY_TYPE_VOTER' ) && in_array('requests', $segments) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * This function set the cconten disposition
	 * according to the url.
	 * If download is in the url, then the document
	 * should be downloaded, else it should be opened
	 * in the browser.
	 *
	 * @return string
	 */
	private function getContenDisposition() {
		$path = Route::getCurrentRoute()->getPath();
		$segments = explode('/', $path);

		// Checking if download is in the url path
		if ( in_array('download', $segments) ) {
			// Save the document
			return "attachement";
		} else {
			// Open the document in the browser
			return "inline";
		}
	}

	/**
	 * This function downloads a document
	 * or opens it in the browser.
	 *
	 * @param $documentKey
	 * @return mixed
	 */
    public function downloadDocument($documentKey) {
		$jsonOutput = app()->make( "JsonOutput" );
		$jsonOutput->setBypass(true);

        $document = Document::where('key', $documentKey)->first();

        if ( $document == null ) {
            return Redirect::to('file_not_found');
        }

        $fullPath = config( 'constants.DOCUMENTS_DIRECTORY' ) . $document->file_name;

        if ( !file_exists($fullPath) ) {
            return Redirect::to('file_not_found');
        }

		$documentEntity = DocumentEntity::select( ['entity_type', 'entity_id'] )->where('document_id', $document->id)
			                            ->first();
		if ( null == $documentEntity ) {
			return Redirect::to('file_not_found');
		}

		// Get the voter_id associated with the document according to
		// the document's entity type.
		$voter = $this->getVoterAssociatedWithDocument($documentEntity);

		// Checking if the voter doesn't exist
		if ( !$this->doesVoterExist($voter) ) {
			return Redirect::to('unauthorized');
		}

		// Checking if the user can watch the voter's details
		if ( !$this->canUserWatchVoter($voter) ) {
			return Redirect::to('unauthorized');
		}

		// If the document's entity type is a voter and the url is a crm/requests url,
		// then don't let access to the document.
		if ( $this->checkIfVoterDocumentIsInCrmUrl($documentEntity->entity_type) ) {
			return Redirect::to('unauthorized');
		}

        $fileSize = filesize($fullPath);
        $fileExtension = $document->type;
        $ctype = $this->getCtype($fileExtension);
		$contenDisposition = $this->getContenDisposition();

        $fileHandle = fopen($fullPath, "rb");

        header("Content-Type: " . $ctype);
        header("Content-Length: " . $fileSize);
        header("Content-Disposition: " . $contenDisposition . "; filename=" . $document->name . "." .  $fileExtension);

        while ( !feof($fileHandle) ) {
            $buffer = fread($fileHandle, 1*(1024*1024));
            echo $buffer;
        }

        fclose($fileHandle);
    }

	/*
		Function for test purposes
	*/
	public function getMyDownload(Request $request) {
		$jsonOutput = app()->make( "JsonOutput" );

		if ($request->input('dror') == 1) $jsonOutput->setBypass(true);
		$jsonOutput->setData('hello');
		return 'test';
	}
}