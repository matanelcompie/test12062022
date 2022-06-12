<?php
namespace App\Libraries\Services\ServicesModel;

use Illuminate\Support\Facades\Log;

use FFMpeg\FFMpeg;
use FFMpeg\Format\Audio\Mp3;


class CallsService
{
    //Convert Multiple files from wav format to MP3
    public static function transferMultipleWavFilesToMp3($folders, $x){
        $mainFolderPath = env('FILES_CALLS_FOLDER', base_path() . '/files');

        $ffmpeg = FFMpeg::create([
            'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
            'ffprobe.binaries' => '/usr/bin/ffprobe' 
        ]);
        $mp3Format = new Mp3(); 
        $folders = [100,115,122,127,131,134,142,146,23,28,32,36,40,43,48,51,55,58,61,70,74,78,81,85,90,
        109,119,124,128,132,135,144,147,25,29,33,37,41,44,49,53,56,59,62,71,75,79,82,87,93,
        111,120,125,130,133,141,145,148,27,30,35,39,42,46,50,54,57,6, 69,72,77,80,83,88];
        foreach($folders as $folderName){
            $allFolderFiles =scandir("$mainFolderPath/$folderName");
            $campaignFolderPath ="$mainFolderPath/$folderName";
        // require_once 'ffmpeglib/vendor/autoload.php'; 
            // $ffmpeg = FFMpeg::create();
    
            foreach($allFolderFiles as $fileName){
                Log::info("name - $fileName");
                if($fileName =='.' ||  $fileName =='..') {continue;}
                try {
                    $convertMp3FileName = str_replace('wav', 'mp3', $fileName);

                    Log::info("$campaignFolderPath/$fileName -> $convertMp3FileName");
                    $isMp3FileExist = file_exists("$campaignFolderPath/$convertMp3FileName");
                    $isWavFileExist = file_exists("$campaignFolderPath/$fileName");

                    if(!$isWavFileExist ) { continue;}
                    if($isMp3FileExist){
                        unlink("$campaignFolderPath/$fileName");
                        continue;
                    }
        
                    $audioObj = $ffmpeg->open("$campaignFolderPath/$fileName");    
                    $audioObj->save($mp3Format, "$campaignFolderPath/$convertMp3FileName");

                    $isNewMp3FileExist = file_exists("$campaignFolderPath/$convertMp3FileName");

                    if($isNewMp3FileExist){
                        unlink("$campaignFolderPath/$fileName");
                        continue;
                    }

                } catch (\Throwable $th) {
                   Log::info($th);
                }

            }
        }
    }
    //Convert Single file from wav format to MP3

    public static function transferWavFilesToMp3($fileName, $currentCampaign){

        $mainFolderPath = env('FILES_CALLS_FOLDER', base_path() . '/files');

        try {
            //The dialer store the file in the campaign key folder:
            $campaignKeyFolderPath = "$mainFolderPath/$currentCampaign->key";
            
            $campaignFolderPath ="$mainFolderPath/$currentCampaign->id";

            if(file_exists("$campaignKeyFolderPath/$fileName")){
                rename("$campaignKeyFolderPath/$fileName", "$campaignFolderPath/$fileName");
            }

            // Create FFMpeg files converter:
            $ffmpeg = FFMpeg::create([
                'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
                'ffprobe.binaries' => '/usr/bin/ffprobe' 
            ]);

            // Create Mp3 files format:
            $mp3Format = new Mp3(); 

            $convertMp3FileName = str_replace('wav', 'mp3', $fileName);

            //If file not exist or file already converted:
            $fileAlreadyConverted = file_exists("$campaignFolderPath/$convertMp3FileName");
            $isFileExists = file_exists("$campaignFolderPath/$fileName");
            if(!$isFileExists || $fileAlreadyConverted) { 
                return false;
            }

            Log::info("$campaignFolderPath/$fileName -> $convertMp3FileName");
            
            // Open the wav file
            $audioObj = $ffmpeg->open("$campaignFolderPath/$fileName");    
            //Convert the file to mp3:
            $audioObj->save($mp3Format, "$campaignFolderPath/$convertMp3FileName");

            $isNewFileExists = file_exists("$campaignFolderPath/$convertMp3FileName");

            // Delete wav old file:
            if($isNewFileExists){
                unlink("$campaignFolderPath/$fileName");
            }
            return $convertMp3FileName;
        } catch (\Throwable $th) {
            Log::info($th);
            return false;
        }

    }
}