<?php

namespace App\Libraries\Services\History;

class HistoryItemGenerator
{
  /**
   * $description
   * referenced_model
   * referenced_model_action_type
   * $fields
   * $entity
   * $oldEntity
   * */
  public static function create($data)
  {
    $valueListType = $data['valueListType'] ?? 'entities';
    return [
      'description' => $data['description'], //'הוספת פעולה לפניה',
      'referenced_model' => $data['referenced']['model'], //Action
      'referenced_model_action_type' => $data['referenced']['type'], //config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'),
      'referenced_id' => $data['entity']->id,
      'valuesList' => $valueListType === 'entities' ?
        self::createValuesList($data) :
        self::createValuesListFromValues($data)
    ];
  }

  /**
   * $fields
   * $entity
   * $oldEntity
   *
   */
  public static function createValuesList($data)
  {
    $entity = $data['entity'];
    $oldEntity = $data['oldEntity'] ?? null;
    $fields = $data['fields'];

    $fieldsArray = [];
    foreach ($fields as $key => $value) {
      $insertFields = [
        'field_name' => $key,
        'display_field_name' => $value['display']
      ];

      if ($value['format'] !== 'numeric') { //($fieldName == 'description') {

        $insertFields['new_value'] = $entity->{$key};

        if ($oldEntity) {
          $insertFields['old_value'] = $oldEntity->{$key};
        }
      } else {

        $insertFields['new_numeric_value'] = $entity->{$key};

        if ($oldEntity) {
          $insertFields['old_numeric_value'] = $oldEntity->{$key};
        }
      }

      $fieldsArray[] = $insertFields;
    }



    return $fieldsArray;
  }

  public static function createValuesListFromValues($data)
  {
    $fields = $data['fields'];

    $fieldsArray = [];
    foreach ($fields as $key => $value) { // @todo change to collect and reduce
      $insertFields = [
        'field_name' => $key,
        'display_field_name' => $value['display']
      ];

      if ($value['format'] !== 'numeric') { //($fieldName == 'description') {

        $insertFields['new_value'] =  $value['new'];

        if ($value['old']) {
          $insertFields['old_value'] = $value['old'];
        }
      } else {
        $insertFields['new_numeric_value'] = $value['new'];

        if ($value['old']) {
          $insertFields['old_numeric_value'] = $value['old'];
        }
      }

      $fieldsArray[] = $insertFields;
    }



    return $fieldsArray;
  }
}
