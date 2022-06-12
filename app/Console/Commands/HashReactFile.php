<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class HashReactFile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'react:hash';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hash react js file and add to cache';

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
        //get react js file hash and store it in cache
        $reactFileLocation = base_path('public/js/index.js');
        $fileHash = hash_file('md5', $reactFileLocation);
        Cache::forever('react_hash', $fileHash . rand());

        //same thing with cti js file
        $reactFileLocation = base_path('public/js/cti.js');
        $fileHash = hash_file('md5', $reactFileLocation);
        Cache::forever('react_cti_hash', $fileHash . rand());
    }
}
