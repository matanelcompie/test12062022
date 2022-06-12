<?php

namespace App\Repositories;

use App\Enums\ActionEntityType;
use App\Enums\CsvParserStatus;
use App\Http\Controllers\ActionController;
use App\Libraries\Helper;
use App\Libraries\Services\FileService;
use App\Libraries\Services\History\HistoryItemGenerator;
use App\Models\CrmRequest;
use App\Models\CsvDocument;
use App\Models\CsvDocumentTheme;
use App\Models\Document;
use App\Models\DocumentEntity;
use DB;
use Exception;

class DocumentRepository
{
  public static function getByKey($key)
  {
    return Document::where('key', $key)->get()->first();
  }

  public static function create($array)
  {
    $document = new Document();
    $document->fill($array);
    $document->save();
    return $document;
  }

  /**
   * Add file for entity
   *
   * @param [type] $file
   * @param string|null $nameFile
   * @param int $entityType  ActionEntityType enum
   * @param int $entityId
   * @return Document
   */
  public static function createEntityFile($file, $nameFile = null, $entityType, $entityId)
  {
    $maxUploadSize = config('settings.max_upload_size');
    if ($file->getSize() > Helper::sizeToBytes($maxUploadSize)) {
      throw new Exception(config('errors.global.DOCUMENT_FILE_SIZE_EXCEEDED'));
    }

    DB::beginTransaction();
    try {
      $document = self::create([
        'name' => $nameFile ? $nameFile : $file->getClientOriginalName(),
        'type' => strtolower($file->getClientOriginalExtension())
      ]);

      $document->attachEntity($entityType, $entityId);
      $newFileDestination = config('constants.DOCUMENTS_DIRECTORY');
      $file->move($newFileDestination, $document->file_name);
      DB::commit();
      return $document;
    } catch (\Throwable $e) {
      DB::rollback();
      throw $e;
    }
  }

  public static function deleteByKey($key)
  {
    $document = self::getByKey($key);
    $documentEntity = DocumentEntity::where('document_id', $document->id)->get()->first();
    $documentEntity->delete();
    $document->delete();


    $historyArgsArr = [
      'topicName' => 'crm.requests.documents.delete',
      'models' => [
        [
          'referenced_model' => 'Document',
          'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE'),
          'referenced_id' => $document->id
        ]
      ]
    ];

    ActionController::AddHistoryItem($historyArgsArr);
  }

  public static function downloadByKey(string $key)
  {
    $document = self::getByKey($key);
    $path = config('constants.DOCUMENTS_DIRECTORY');
    FileService::downloadFile($path, $document->file_name, $document->name, $document->type);
  }
}
