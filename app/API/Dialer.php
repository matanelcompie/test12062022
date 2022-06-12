<?php

namespace App\API;

use App\Models\Tm\UserExtensions;
use App\Models\Tm\SipServer;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Barryvdh\Debugbar\Facade as Debugbar;


/**
 * Class Dialer
 *
 * The dialer API for adding/deleting
 * user extension to campaign queue and
 * allocating an extenstion to a user.
 *
 * @package App\API
 */
class Dialer
{

  //default server dialer
  const DIALER_URL = 'http://10.192.138.11';


  /**
   * This function check dialer connection by sip ip and return true for connected
   *
   * @return bool
   */
  public static function healthCheck($serverIp)
  {
    $ch = curl_init($serverIp . '/health-check-dialer');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $r = curl_exec($ch);
    $result = json_decode($r);
    curl_close($ch);
    return $result === true;
  }

  /**
   * This function assigns an
   * extension to a user.
   *
   * @param $userId
   * @param $newDialerUserId
   * @return array
   */
  public static function addUserExtension($serverId, $serverIp, $userId, $newDialerUserId)
  {
    Debugbar::addMessage('add user extension serverId =>' . $serverId . ",userId" . $userId . " new dialer user id" . $newDialerUserId, 'call_log');
    $randomPassword = Str::random(20);

    $data = array("user" => $newDialerUserId, "pass" => $randomPassword);
    $data_string = json_encode($data);

    $ch = curl_init($serverIp . '/exts');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(
      $ch,
      CURLOPT_HTTPHEADER,
      array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data_string)
      )
    );

    $result = json_decode(curl_exec($ch));

    $insertData = [
      'user_id' => $userId,
      'sip_server_id' => $serverId,
      'dialer_user_id' => $newDialerUserId,
      'password' => $randomPassword,
      'extension_id' => $result->{"_id"}
    ];

    UserExtensions::insert($insertData);

    $returnExtension = new \stdClass;
    $returnExtension->dialer_user_id = $newDialerUserId;
    $returnExtension->password = $randomPassword;
    $returnExtension->extension_id = $result->{"_id"};
    curl_close($ch);

    return $returnExtension;
  }

  /**
   * This function gets all queues.
   *
   * @return mixed
   */
  public static function listQueues()
  {
    $mainSipServer =  self::getMainSipServer();
    $mainSipServerIp = $mainSipServer->ip;
    $ch = curl_init($mainSipServerIp . '/queues');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = json_decode(curl_exec($ch));
    curl_close($ch);

    return $result;
  }

  /**
   * This function adds extension to a queue
   * (also creates the queue if it doesn't exists)
   *
   * @param $campaignKey
   * @param $extensionUserId
   * @return mixed
   */
  public static function addQueueExtension($sipServerUrl, $campaignKey, $extensionUserId)
  {
    Debugbar::addMessage('add queue extension $sipServerUrl =>' . $sipServerUrl . ",$campaignKey" . $campaignKey . " extensionUserId" . $extensionUserId, 'call_log');
    if (config('telemarketing.dialer_dev_mode')) {
      return true;
    }
    $data = [
      ["queue" => $campaignKey, "ext" => $extensionUserId]
    ];
    $data_string = json_encode($data);

    $ch = curl_init("$sipServerUrl/queues");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(
      $ch,
      CURLOPT_HTTPHEADER,
      array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data_string)
      )
    );

    $response = curl_exec($ch);
    $result = json_decode($response);
    if (is_array($result)) {
      $return = true;
    } else {
      $return = false;
    }
    curl_close($ch);
    //Log::info("add extension: ".$extensionUserId." to queue: ".$campaignKey. " Result: ".$response. " Return: ".$return);
    return $return;
  }

  /**
   * This function lists extensions in a queue.
   * @param $campaignKey
   * @return mixed
   */
  public static function listQueueExtension($campaignKey)
  {
    $mainSipServer =  self::getMainSipServer();
    $mainSipServerIp = $mainSipServer->ip;
    $ch = curl_init($mainSipServerIp . '/queues/' . $campaignKey . '/exts');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = json_decode(curl_exec($ch));
    curl_close($ch);
    return $result;
  }

  /**
   * This function deletes extension from a queue.
   *
   * @param $campaignKey
   * @param $extensionUserId
   * @return mixed
   */
  public static function deleteQueueExtension($sipServerUrl, $campaignKey, $extensionUserId)
  {
    Debugbar::addMessage('delete queue extension $sipServerUrl =>' . $sipServerUrl . ",campaignKey" . $campaignKey . " extensionUserId" . $extensionUserId, 'call_log');
    if (config('telemarketing.dialer_dev_mode')) {
      return true;
    }
    $data = [
      ["queue" => $campaignKey, "ext" => $extensionUserId]
    ];
    $data_string = json_encode($data);

    $ch = curl_init($sipServerUrl . '/queues');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(
      $ch,
      CURLOPT_HTTPHEADER,
      array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data_string)
      )
    );

    $result = curl_exec($ch);
    if ($result == '"OK"') {
      $return = true;
    } else {
      $return = false;
    }
    curl_close($ch);

    //Log::info("remove extension: ".$extensionUserId." from queue: ".$campaignKey. " Result: ".$result. " Return: ".$return);
    return $return;
  }
  /**
   * @method  updateQueueDialerProps methodName()
   * @param [string] $campaignKey - campign key
   * @param [obj] $updateData - [key -> value]
   * @return $result
   */
  //update setting campaign  for dialer
  public static function updateQueueDialerProps($campaignKey, $updateData)
  {
    $mainSipServer =  self::getMainSipServer();
    $mainSipServerIp = $mainSipServer->ip;
    $data_string = json_encode($updateData);
    $ch = curl_init("$mainSipServerIp/queues/$campaignKey");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt(
      $ch,
      CURLOPT_HTTPHEADER,
      array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($data_string)
      )
    );

    $result = json_decode(curl_exec($ch));
    curl_close($ch);

    return $result;
  }

  /**
   * This function get the list of extension
   *
   * @return array
   */
  public static function getExtensionList($serverIp)
  {
    $ch = curl_init($serverIp . '/exts');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = json_decode(curl_exec($ch));
    curl_close($ch);

    return $result;
  }
  public static function getMainSipServer()
  {
    $mainSipServer =  SipServer::select('id', 'ip')->orderBy('id')->first();
    return $mainSipServer ? $mainSipServer : null;
  }
}
