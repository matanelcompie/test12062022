<?php

namespace App\Libraries\Services\UploadFile;

use App\DTO\UploadExcelFileDto;
use App\Enums\CsvDocumentThemeSystemName;
use App\Enums\CsvFileTheme;
use App\Enums\FileTheme;
use App\Models\CsvDocumentTheme;
use App\Repositories\CsvDocumentThemeRepository;
use Exception;
use Log;

class UploadFile
{
    /**
     * function get file theme model and return the folder location
     *
     * @param CsvDocumentTheme $csvDocumentTheme
     * @return string
     */
    public static function getLocationUrlByFileTheme($csvDocumentTheme)
    {
        $location = '';
        switch ($csvDocumentTheme->system_name) {
            case CsvDocumentThemeSystemName::ELECTION_BALLOT_VOTES:
                $location = env('FILES_FOLDER', base_path() . '/files') . '/election_ballot_party_votes/';
                break;
            case CsvDocumentThemeSystemName::ELECTION_MUNICIPAL_BALLOT_VOTES:
                $location = env('FILES_FOLDER', base_path() . '/files') . '/municipal_election_ballot_party_votes/';
                break;
            default:
                throw new Exception(config('errors.global.FILE_THEME_NOT_EXIST')); //UPLOAD_FILE_CANCEL
                break;
        }

        return $location;
    }

    /**
     * function get uploadFile dto and upload the file by file theme and return location file
     *
     * @param UploadExcelFileDto $uploadFile
     * @return string
     */
    public static function uploadFile(UploadExcelFileDto $uploadFile)
    {
        if (!$uploadFile->fileUploader)
            throw new Exception(config('errors.global.FILE_UPLOADER_NOT_EXIST'));
        if (!$uploadFile->fileName)
            throw new Exception(config('errors.global.FILE_UPLOADER_NOT_EXIST'));
        if (!$uploadFile->csvDocumentTheme)
            throw new Exception(config('errors.global.DOCUMENT_MISSING_FILE_NAME'));

        $locationFolder = self::getLocationUrlByFileTheme($uploadFile->csvDocumentTheme);
        $file = $uploadFile->fileUploader;
        $file->move($locationFolder, $uploadFile->fileName);

        return $locationFolder . $uploadFile->fileName;
    }
}
