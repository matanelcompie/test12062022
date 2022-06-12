<?php

namespace App\Libraries\Services;

use Illuminate\Support\Facades\Route;


class FileService {

    public static function getCtype($fileExtension) {
        switch ($fileExtension) {
            case "pdf":
                return "application/pdf";
                break;

            case "doc":
                return "application/msword";
                break;

            case 'rtf':
                return 'application/rtf';
                break;

            case 'xls':
            case 'csv':
                return 'application/vnd.ms-excel';
                break;

            case 'ppt':
                return 'application/vnd.ms-powerpoint';
                break;

            case 'txt':
                return 'text/plain';
                break;

            case 'xlsx':
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                break;

            case 'docx':
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                break;

            case 'png':
            case 'jpg':
            case 'gif':
                return 'image/' . $fileExtension;
                break;
            case 'jfif':	
                return 'image/jpeg';
                break;
        }
    }

    /**
     * This function set the ccntent disposition
     * according to the url.
     * If download is in the url, then the file
     * should be downloaded, else it should be opened
     * in the browser.
     *
     * @return string
     */
    public static function getContenDisposition() {
        $path = Route::getCurrentRoute()->getPath();
        $segments = explode('/', $path);

        // Checking if download is in the url path
        if ( in_array('download', $segments) ) {
            // Save the document
            return "attachement";
        } else {
            // Open the document in the browser
            return "inline";
        }
    }

    /**
     * This function checks if the file
     * exists.
     *
     * @param $directory
     * @param $fileName
     * @return bool
     */
    public static function checkFileExists( $directory, $fileName ) {
        $fullPath = $directory . $fileName;

        return file_exists($fullPath);
    }

    /**
     * Downloading or viewing a file.
     * If the word download is in the url,
     * then the file is downloaded, else
     * it's being viewd in the browser.
     *
     * @param $directory - The directory of the file.
     * @param $fileName - The file name in the directory
     * @param $name - The name of the file.
     * @param $fileType - The file extension.    *
     */
    public static function downloadFile($directory, $fileName = null, $name, $fileType)
    {
        if (is_null($fileName))
            $fullPath = $directory;
        else
            $fullPath = $directory . $fileName;

        $fileSize = filesize($fullPath);
        $fileExtension = $fileType;
        $ctype = FileService::getCtype($fileExtension);
        $contenDisposition = FileService::getContenDisposition();

        $fileHandle = fopen($fullPath, "rb");

        header("Content-Type: " . $ctype);
        header("Content-Length: " . $fileSize);
        header("Content-Disposition: " . $contenDisposition . "; filename=" . $name . "." .  $fileExtension);

        while (!feof($fileHandle)) {
            $buffer = fread($fileHandle, 1 * (1024 * 1024));
            echo $buffer;
        }

        fclose($fileHandle);
    }
}