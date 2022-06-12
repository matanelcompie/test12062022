<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use App\Models\CsvFiles;
use App\Models\CsvFileFields;

use App\Libraries\CsvParser;
use App\Libraries\Helper;

use App\Jobs\csvJob;


/**
 * Class UploaderController
 * @package App\Http\Controllers
 *
 * This class handles the file uploads.
 */
class UploaderController extends Controller {

	/*
		Function that performs Upload action by POST params
	*/
    public function upload(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        $file = $request->file('file_upload');

        $newFileDestination = base_path() . '/files/csv';

        $newFileName = $file->getClientOriginalName();
        $request->file('file_upload')->move($newFileDestination, $newFileName);

        $jsonOutput->setData( $newFileDestination . '/' . $newFileName );
    }

	/*
		Test function to count rows from specific csv file
	*/
    public function countCsvRows() {
        $fp = file( base_path() . '/files/csv/test2.csv', FILE_SKIP_EMPTY_LINES );

        $jsonOutput = app()->make( "JsonOutput" );

        $jsonOutput->setData( count($fp) );
    }

	
	/*
		Test function to read and return rows from specific csv file
	*/
    public function readCsvRows($numberOfRows) {
        $arrOfCsvData = [];

        $file = fopen( base_path() . '/files/csv/test2.csv', 'r' );

        while( ($row = fgetcsv($file)) !== false && count($arrOfCsvData) < $numberOfRows ){
            $arrOfCsvData[] = $row;
        }

        fclose($file);

        $jsonOutput = app()->make( "JsonOutput" );

        $jsonOutput->setData( $arrOfCsvData );
    }


    /**
     * This function maps the columns of
     * the csv file to fields to be updated.
     *
     * At the moment the data will be recieved from
     * Postman until the UI is ready.
     * Columns that are not mapped will be null.
     *
     *
     * Example of params sent in Postman to the
     * url: http://localhost/shas/public/api/csv/file/{csvFileKey}/parse     *
     *
     * Params:
     * {"key_values":["personal_identity",null,"phone_number",null,null,"sephardi","email","support_status"]}
     *
     * @param $csvFileKey
     * @param Request $request - Array which it's name is: "key_values" where each key is $column => $fieldName
     */
    public function mapCsvFields($csvFileKey, Request $request) {
        Log::info('map csv file key: ' . $csvFileKey);
        $csvFile = CsvFiles::select( ['id'] )->where('key', $csvFileKey)->first();
        $csvFileId = $csvFile->id;

        $arrOfCsvKeysValues = $request->input('key_values');
        $insertData = [];

        // Loops through Array key_values.
        // Only column index which it's value
        // is not null will be inserted to the
        // table "csv_file_fields
        for ( $index = 0; $index < count($arrOfCsvKeysValues); $index++ ) {
            if ( $arrOfCsvKeysValues[$index] != null ) {
                $insertData[] = [
                    'key'           => Helper::getNewTableKey('csv_file_fields', 5),
                    'csv_file_id'   => $csvFileId,
                    'column_number' => $index,
                    'field_name'    => $arrOfCsvKeysValues[$index]
                ];
            }
        }
        Log::info('key values params: ', $arrOfCsvKeysValues);
        Log::info('map csv insert data: ', $insertData);
        // Insert the mapped columns to "csv_file_fields" table
        CsvFileFields::insert($insertData);

        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setData( $insertData );
    }


    /**
     * This function parses the csv
     * file by executing a job that
     * runs in the server background.
     *
     * @param $csvFileKey
     */
    public function parseCsvFile($csvFileKey) {
        $csvFile = CsvFiles::select( ['id'] )
            ->where('key', $csvFileKey)
            ->first();
        $csvFileId = $csvFile->id;

        // Getting the job details
        $job = ( new csvJob(new CsvParser(), $csvFileId) )->onConnection('redis')->onQueue('csv');
 
        // Executing the job which parses the csv file
        $this->dispatch($job);
        $jsonOutput = app()->make( "JsonOutput" );
        $jsonOutput->setData( $job );
    }

	/*
		Function that returns all CsvFiles with status type NORMAL
	*/
    public function getCsvStatuses() {
        $jsonOutput = app()->make( "JsonOutput" );

        $csvFileFields = [
            'csv_files.id',
            'csv_files.key',
            'csv_files.name',
            'csv_files.file_name',
            'csv_files.row_count',
            'csv_files.current_row',
            'csv_files.status',
            'voters.first_name',
            'voters.last_name',
            'csv_files.created_at'
        ];
        $where = [
            'csv_files.type'    => config('constants.CSV_FILE_TYPE_NORMAL'),
            'csv_files.deleted' => 0
        ];
        $csvFiles = CsvFiles::select($csvFileFields)->withUser()->where($where)->get();

        $jsonOutput->setData( $csvFiles );
    }

	/*
		Function that gets csvFileKey , and returns its details 
	*/
    public function getCsvFileDetails($csvFileKey) {
        $jsonOutput = app()->make( "JsonOutput" );

        $csvFileFields = [
            'csv_files.id',
            'csv_files.key',
            'csv_files.name',
            'csv_files.file_name',
            'csv_files.row_count',
            'csv_files.current_row',
            'csv_files.status',
            'csv_files.captain_id',
            'csv_files.delete_duplicate_phones',
            'csv_files.support_status_id',
            'support_status_update_type',
            'institutes.name as institute_name',
            'institute_roles.name as institute_role_name',
            'voters.first_name',
            'voters.last_name',
            'csv_files.created_at'
        ];
        $csvFile = CsvFiles::select($csvFileFields)
            ->withUser()
            ->withInstitutes()
            ->withInstitutesRoles()
            ->where('csv_files.key', $csvFileKey)
            ->first();

        $jsonOutput->setData( $csvFile );
    }
}