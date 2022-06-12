<?php


namespace App\API\Sms;

use App\API\Sms\Contracts\Store;
use InvalidArgumentException;

use App\Models\SmsProvider;

use DB;
use Illuminate\Support\Facades\Log;

class SmsManager {

    /**
     * The application instance.
     *
     * @var \Illuminate\Foundation\Application
     */
	protected $app;
	private $types = ['default' => 0, 'telemarketing'  => 1];

    /**
     * The array of resolved cache stores.
     *
     * @var array
     */
	protected $stores = [];

    /**
     * Create a new Sms manager instance.
     *
     * @param  \Illuminate\Foundation\Application  $app
     * @return void
     */
    public function __construct($app)
    {
        $this->app = $app;
    }

    /**
     * Get a Sms store instance by name.
     *
     * @param  string|null  $name
     * @return mixed
     */
    public function store( $storeType = 'default')
    {
        if(!isset($this->stores[$storeType])){
            $this->stores[$storeType] =  $this->resolve($storeType);
        }
        return $this->stores[$storeType];
    }
    /**
     * @method getStoreProvider
     * Get store provider from DB, by store type.
     * @return store provider data
     */
    private function getStoreProvider($storeType){
        $type = $this->types[$storeType];
        $currentSmsProvider = SmsProvider::where('type', $type)->first();

        if (is_null($currentSmsProvider)) {
            throw new InvalidArgumentException("Sms store [{$storeType}] is not defined.");
        }
        return $currentSmsProvider;
    }

    /**
     * Resolve the given store.
     *
     * @param  string  $name
     * @return \App\API\Sms\Contracts\Repository
     *
     * @throws \InvalidArgumentException
     */
    protected function resolve($storeType)
    {
        $currentSmsProvider = $this->getStoreProvider($storeType);
        $provider = $currentSmsProvider->provider;
        $storeConfig = $this->getConfig($provider, $storeType, $currentSmsProvider);

        $driverMethod = 'create' . ucfirst($provider) . 'Driver';

        if (method_exists($this, $driverMethod)) {
            return $this->{$driverMethod}($storeConfig, $storeType);
        } else {
            throw new InvalidArgumentException("Driver [{$provider}] is not supported.");
        }
    }

    /**
     * Create an instance of the telemessage sms driver.
     *
     * @return \App\API\Sms\Repository
     */
    protected function createTelemessageDriver($config, $storeType)
    {
        return $this->repository(new TelemessageStore($config, $storeType));
    }

    /**
     * Create an instance of the unicell sms driver.
     *
     * @return \App\API\Sms\Repository
     */
    protected function createUnicellDriver($config, $storeType)
    {
        return $this->repository(new UnicellStore($config, $storeType));
    }

    /**
     * Create an instance of the paycall sms driver.
     *
     * @return \App\API\Sms\Repository
     */
    protected function createPaycallDriver($config, $storeType)
    {
        return $this->repository(new PaycallStore($config, $storeType));
    }

    /**
     * Create an instance of the log sms driver.
     *
     * @return \App\API\Sms\Repository
     */
    protected function createLogDriver($config, $storeType)
    {
        return $this->repository(new LogStore($config, $storeType));
    }

    /**
     * Create a new sms repository with the given implementation.
     *
     * @param  \App\API\Sms\Contracts\Store  $store
     * @return \App\API\Sms\Repository
     */
    public function repository(Store $store)
    {
        $repository = new Repository($store);

        return $repository;
    }

    /**
     * Return default store
     *
     * @return array
     */    

    public function getDefaultStore() {
    	 return $this->app['config']['sms.default'];
    }

    /**
     * Get config array for selected store
     *
     * @param  string  $name
     * @return array
     */

    public function getConfig($provider, $storeType, $currentSmsProvider) {
        $providerConfig = $this->app['config']["sms.stores.{$provider}"];
        if(!isset( $providerConfig[$storeType])){ 
             throw new InvalidArgumentException("Sms store [{$provider}] is not defined.");
        }
        $providerConfig[$storeType]['send_number'] = $currentSmsProvider->phone_number;

    	return $providerConfig;
    }

    /**
     * Dynamically call the default driver instance.
     *
     * @param  string  $method
     * @param  array   $parameters
     * @return mixed
     */
    public function __call($method, $parameters)
    {
        $connectionName = ($method == "connection" && !empty($parameters[0])) ? $parameters[0] : 'default';
        $store = $this->store($connectionName);
        if($store){ return  $store->$method(...$parameters);
        } else {
            throw new InvalidArgumentException("Not valid store, $storeName is not supported.");
        }
    }
}
