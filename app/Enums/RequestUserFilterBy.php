<?php

namespace App\Enums;

abstract class RequestUserFilterBy
{
  const ALL_AUTH_USER_REQUEST = "ALL_AUTH_USER_REQUEST";
  const ALL_AUTH_USER_OPEN_REQUEST = "ALL_AUTH_USER_OPEN_REQUEST";
  const ALL_REQUEST_AUTH_USER_HANDLER = 'ALL_REQUEST_AUTH_USER_HANDLER';
  const OPEN_REQUEST_AUTH_USER_HANDLER = 'OPEN_REQUEST_AUTH_USER_HANDLER';
  const REQUEST_AUTH_USER_TRANSFERRED = "REQUEST_AUTH_USER_TRANSFERRED";
  const REQUEST_AUTH_USER_RECEIVED = "REQUEST_AUTH_USER_GET";
  const ALL_TEAM_REQUESTS = "ALL_TEAM_REQUESTS";
  const ALL_TEAM_OPEN_REQUESTS = "ALL_TEAM_OPEN_REQUESTS";
  const REQUEST_BY_HANDLE_USER = "REQUEST_BY_HANDLE_USER";


  public static function getAllTypeHash()
  {
    return [
      self::ALL_AUTH_USER_REQUEST => 'כלל הפניות לטיפולי',
      self::ALL_AUTH_USER_OPEN_REQUEST => 'פניות פתוחות לטיפולי',
      self::REQUEST_AUTH_USER_TRANSFERRED => "פניות שהעברתי לטיפול אחרים",
      self::REQUEST_AUTH_USER_RECEIVED => "פניות שהועברו לטיפולי",
      self::ALL_TEAM_OPEN_REQUESTS => "פניות פתוחות לטיפול הצוות",
      self::ALL_TEAM_REQUESTS => "כלל הפניות לצוות",
      self::REQUEST_BY_HANDLE_USER => "פניות לפי גורם מטפל",
    ];
  }

  public static function getAllTypeArray()
  {
    $hashType = self::getAllTypeHash();
    $arrayType = [];
    foreach ($hashType as $key => $name) {
      $arrayType[] = ['id' => $key, 'name' => $name];
    }

    return $arrayType;
  }
}
