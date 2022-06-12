<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

use App\API\License;

class LicenseJs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'react:license';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'License react js files';

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
        $uiFileLocation = base_path('public/js/index.js');
        $uiMapFileLocation = base_path('public/js/index.js.map');
        $ctiFileLocation = base_path('public/js/cti.js');
        $ctiMapFileLocation = base_path('public/js/cti.js.map');
        $uiEncryptedFileLocation = base_path('public/js/index.enc');
        $uiMapEncryptedFileLocation = base_path('public/js/index.map.enc');
        $ctiEncryptedFileLocation = base_path('public/js/cti.enc');
        $ctiMapEncryptedFileLocation = base_path('public/js/cti.map.enc');
        $uiFileContent = file_get_contents($uiFileLocation);
        $uiMapFileContent = file_get_contents($uiMapFileLocation);
        $ctiFileContent = file_get_contents($ctiFileLocation);
        $ctiMapFileContent = file_get_contents($ctiMapFileLocation);
        $license = License::getLicense();
        if ($license) {
            $newEncrypter = new \Illuminate\Encryption\Encrypter( $license, config( 'app.cipher' ) );
            $encrypted = $newEncrypter->encrypt($uiFileContent);
            file_put_contents($uiEncryptedFileLocation, $encrypted);
            $encrypted = $newEncrypter->encrypt($uiMapFileContent);
            file_put_contents($uiMapEncryptedFileLocation, $encrypted);
            $encrypted = $newEncrypter->encrypt($ctiFileContent);
            file_put_contents($ctiEncryptedFileLocation, $encrypted);
            $encrypted = $newEncrypter->encrypt($ctiMapFileContent);
            file_put_contents($ctiMapEncryptedFileLocation, $encrypted);
            unlink($uiFileLocation);
            unlink($uiMapFileLocation);
            unlink($ctiFileLocation);
            unlink($ctiMapFileLocation);
            echo "License applied\n";
        } else {
            echo "No license\n";
        }
    }
}
