<?php


namespace App\API\Ivr;

use App\API\Ivr\Contracts\Store;
use InvalidArgumentException;

class IvrManager {

    const TYPE_DEFAULT = "default";
    const TYPE_ACTIVIST_VERIFICATION = "activist_verification";
    const TYPE_VOTE_REPORTING = "vote_reporting";

    /**
     * The application instance.
     *
     * @var \Illuminate\Foundation\Application
     */
	protected $app;

    /**
     * The array of resolved cache stores.
     *
     * @var array
     */
	protected $stores = [];

    /**
     * Create a new Ivr manager instance.
     *
     * @param  \Illuminate\Foundation\Application  $app
     * @return void
     */
    public function __construct($app)
    {
        $this->app = $app;
    }

    /**
     * Get a Ivr store instance by name.
     *
     * @param  string|null  $name
     * @return mixed
     */
    public function store($name = null)
    {
        $name = $name ?: $this->getDefaultStore();

        return $this->stores[$name] = $this->get($name);
    }

    /**
     * Attempt to get the store from the local cache.
     *
     * @param  string  $name
     * @return \App\API\Ivr\Contracts\Repository
     */
    protected function get($name)
    {
        return isset($this->stores[$name]) ? $this->stores[$name] : $this->resolve($name);
    }

    /**
     * Resolve the given store.
     *
     * @param  string  $name
     * @return \App\API\Ivr\Contracts\Repository
     *
     * @throws \InvalidArgumentException
     */
    protected function resolve($name)
    {
        $config = $this->getConfig($name);

        if (is_null($config)) {
            throw new InvalidArgumentException("Ivr store [{$name}] is not defined.");
        }

        $driverMethod = 'create'.ucfirst($name).'Driver';

        if (method_exists($this, $driverMethod)) {
            return $this->{$driverMethod}($config);
        } else {
            throw new InvalidArgumentException("Driver [{$config['driver']}] is not supported.");
        }
    }

    /**
     * Create an instance of the progheart ivr driver.
     *
     * @return \App\API\Ivr\Repository
     */
    protected function createProgheartDriver($config)
    {
        return $this->repository(new ProgheartStore($config));
    }
/**
     * Create an instance of the local Dialer ivr driver.
     *
     * @return \App\API\Ivr\Repository
     */
    protected function createLocalDialerDriver($config)
    {
        return $this->repository(new LocalDialerStore($config));
    }

    /**
     * Create an instance of the log ivr driver.
     *
     * @return \App\API\Ivr\Repository
     */
    protected function createLogDriver($config)
    {
        return $this->repository(new LogStore($config));
    }

    /**
     * Create a new ivr repository with the given implementation.
     *
     * @param  \App\API\Ivr\Contracts\Store  $store
     * @return \App\API\Ivr\Repository
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
    	 return $this->app['config']['ivr.default'];
    }

    /**
     * Get config array for selected store
     *
     * @param  string  $name
     * @return array
     */

    public function getConfig($name) {
    	return $this->app['config']["ivr.stores.{$name}"];
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
        return $this->store()->$method(...$parameters);
    }
}
