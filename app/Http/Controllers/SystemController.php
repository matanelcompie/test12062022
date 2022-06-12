<?php

namespace App\Http\Controllers;

use App\API\Dialer;
use App\Http\Controllers\Controller;
use App\Models\Tm\SipServer;
use Barryvdh\Debugbar\Facade as Debugbar;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Log;
use PDO;
use stdClass;
use Throwable;

class SystemController extends Controller
{
    const SUCCESS = 200;
    const ERROR = 500;
    const NO_CONTENT = 204;


    public static function webServerApiCheck()
    {
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData(true);
    }

    public static function healthCheckByEnvDefinition()
    {
        if (env('HEALTH_CHECK')) {
            self::runHealthSystem();
        }
    }

    public static function healthCheckSystem()
    {
        $jsonOutput = app()->make("JsonOutput");
        try {
            $jsonOutput->setData(self::runHealthSystem());
        } catch (\Exception $e) {
            $jsonOutput->setErrorCode($e->getMessage(), 400, $e);
        }
    }

    public static function runHealthSystem()
    {
        $healthCheck = collect([
            'my_sql' => self::healthCheckMySql(),
            'redis' => self::healthCheckRedis(),
        ]);
        $healthCheckDialers = self::healthCheckDialersStatus();
        $healthCheckDomains = self::healthCheckDomain();
        $healthCheck =  $healthCheck
            ->merge($healthCheckDialers)
            ->merge($healthCheckDomains);
        return $healthCheck;
    }

    public static function healthCheckMySql()
    {
        try {
            DB::connection()->getPdo();
            return self::SUCCESS;
        } catch (\Exception $e) {
            Debugbar::addMessage('Error connection mySql', 'end-check:my-sql-error');
            Debugbar::addThrowable($e);
            return self::ERROR;
        }
    }

    public static function healthCheckDomain()
    {
        $webStatusDomain = collect();
        $webDomains = collect([
            ['url' => env("APP_SHASS_URL"), 'active' => true, 'available_health_check' => false],
            ['url' => env("DEV_APP_SHASS_URL"), 'active' => true, 'available_health_check' => false],
            ['url' => env("LOGIN_SHIBUTS_URL"), 'active' => false, 'available_health_check' => true],
            ['url' => env("DEV_LOGIN_SHIBUTS_URL"), 'active' => false, 'available_health_check' => true]
        ]);

        $webDomains->each(function ($domain) use ($webStatusDomain) {
            if ($domain['active']) {
                if ($domain['available_health_check']) {
                    $isApiServerConnected = self::checkUrl($domain['url']);
                } else {
                    $isApiServerConnected = self::SUCCESS;
                }
                $webStatusDomain[$domain['url']] = $isApiServerConnected;
            } else {
                $webStatusDomain[$domain['url']] = self::NO_CONTENT;
            }
        });

        return $webStatusDomain;
    }

    public static function healthCheckRedis()
    {
        try {
            $redis = Redis::connection();
            if ($redis->ping()) {
                return self::SUCCESS;
            } else {
                Debugbar::addMessage('Error connection redis', "end-check:redis-error");
                return self::ERROR;
            }
        } catch (\Throwable $e) {
            Debugbar::addMessage('Error connection redis', "end-check:redis-error");
            Debugbar::addThrowable($e);
            return self::ERROR;
        }
    }

    public static function healthCheckDialersStatus()
    {
        $healthCheckDialers = collect();
        $sipServers = SipServer::get();
        foreach ($sipServers as $dialer) {
            if ($dialer->active != 1)
                $healthCheckDialers[$dialer->name] = self::NO_CONTENT;
            else {
                $healthCheckDialers[$dialer->name] = self::checkDialer($dialer->ip);
            }
        }
        return $healthCheckDialers;
    }

    public static function checkDialer($sipIp)
    {
        try {
            $response = Dialer::healthCheck($sipIp);
            if (!$response) {
                Debugbar::addMessage("Error connection $sipIp", "end-check:dialer-error");
                return self::ERROR;
            }
            return self::SUCCESS;
        } catch (\Throwable $e) {
            Debugbar::addMessage("Error connection $sipIp", "end-check:dialer-error");
            Debugbar::addThrowable($e);
            return self::ERROR;
        }
    }


    public static function  checkUrl($url)
    {
        $curl = curl_init($url . "/api/end-check-server");
        curl_setopt($curl, CURLOPT_NOBODY, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_TIMEOUT_MS, 10000);

        $result = curl_exec($curl);
        if ($result !== false) {
            $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            if ($statusCode == 404) {
                return  self::ERROR;
            } else {
                return self::SUCCESS;
            }
        } else {
            return self::ERROR;
        }
    }
}
