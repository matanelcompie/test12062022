<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Illuminate\Http\Request;



class RedisNewCall extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'redis:newcall';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'subscribe to redis new call channel';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
      Redis::subscribe(['newCall'], function ($message) {
        try{
          echo 'received new message '. $message;
          $app = app();
          $params =['message' => $message];
          $app['debugbar']->enable();
          $request = Request::create('/api/tm/monitor/new-call', 'POST',$params);
          app()->handle($request);
          $app['debugbar']->collect();
        }
        catch(\Throwable $e){
          var_dump($e);
        }
     });
    }
}
