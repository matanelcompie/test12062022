<?php

namespace App\Libraries\Services;

use Excel;
use PDF;
use App\Libraries\Helper;
use Auth;
use App\Models\CsvFileFields;
use App\Models\CsvFiles;
use App\Models\CsvSources;

use Illuminate\Support\Facades\Log;

class ExportService
{
    private static $fileName = 'exportFile';
    public static function export($data =[], $fileExtension = 'csv', $printPatternName = 'general', $extraData=[])
    {
        if (!count($data)) {
            return;
        }
	 
        switch (strtolower($fileExtension)) {
            case 'csv':
                return self::exportCsv($data, $extraData);
                break;
            case 'pdf':
                return self::exportPdf($data, $printPatternName, $extraData);
                break;
            case 'xls':
                return self::exportXls($data, $extraData);
                break;
            case 'html':
                return self::exportHtml($data, false, $printPatternName, $extraData);
                break;
            case 'print':
                return self::exportHtml($data, true, $printPatternName, $extraData);
                break;
			case 'menu':
		
                self::createCsvJobFromData($data);
                break;
            default:
                # code...
                break;
        }

    }
	
	private static function createCsvJobFromData($data){
		
         $newCsvFilesTableKey=Helper::getNewTableKey('csv_files', 5);
		 $newFileDestination = config('constants.CSV_UPLOADS_DIRECTORY');
		 
		 Excel::create($newCsvFilesTableKey, function ($excel) use ($data) {
            $excel->sheet('ExportFile', function ($sheet) use ($data) {
                $sheet->loadView('reports.general', array('data' => $data, 'print' => false, 'columnsNames' => self::$columnsNames));
                // $sheet->fromArray($data);
                $sheet->setRightToLeft(true);
                $sheet->freezeFirstRow();
            });
        })->store('csv' , $newFileDestination );
		 
		 $csvSourceID = -1;
		 $csvSource =  CsvSources::select('id')->where('deleted',0)->where('system_name', 'general_report')->first();
		 if($csvSource){
			 $csvSourceID = $csvSource->id;
		 }
		 
		 $csvFile = new CsvFiles;
		 $csvFile->key = $newCsvFilesTableKey;
		 $csvFile->type =config('constants.CSV_FILE_TYPE_NORMAL');
		 $csvFile->name = $newCsvFilesTableKey;
		 $csvFile->file_name = $newCsvFilesTableKey;
		 $csvFile->file_size = filesize(config('constants.CSV_UPLOADS_DIRECTORY') . $newCsvFilesTableKey.".csv");
		 $csvFile->row_count = sizeof($data)+1;
		 $csvFile->captain_id=Auth::user()->voter_id;
         $csvFile->current_row = 0;
		 $csvFile->header = 1;
		 $csvFile->status =config('constants.CSV_PARSER_STATUS_DID_NOT_START');
		 $csvFile->csv_source_id = $csvSourceID;
		 $csvFile->user_create_id = Auth::user()->id;
         $csvFile->save();
		 $csvFileField = new CsvFileFields;
		 $csvFileField->key=Helper::getNewTableKey('csv_file_fields', 5);
		 $csvFileField->csv_file_id=$csvFile->id;
		 $csvFileField->field_name='personal_identity';
		 $csvFileField->column_number=1;
		 $csvFileField->save();
         Helper::print_memory('export excel file');
		 $jsonOutput = app()->make("JsonOutput");
         $jsonOutput->setBypass(false);
		 $jsonOutput->setData($newCsvFilesTableKey);
		 
		 rename(config('constants.CSV_UPLOADS_DIRECTORY') . $newCsvFilesTableKey.".csv" , config('constants.CSV_UPLOADS_DIRECTORY') . $newCsvFilesTableKey);
			//echo Auth::user();
	}

    private static function exportCsv($data, $extraData)
    {
        $columnsNames= self::getColumnsNames($extraData);
 
        Excel::create(self::$fileName, function ($excel) use ($data, $columnsNames) {
            $excel->sheet('ExportFile', function ($sheet) use ($data, $columnsNames) {
                $sheet->loadView('reports.general', array('data' => $data, 'print' => false, 'columnsNames' => $columnsNames));
                // $sheet->fromArray($data);
                $sheet->setRightToLeft(true);
                $sheet->freezeFirstRow();
            });
        })->export('csv');
    }

    private static function exportXls($data, $extraData)
    {
		
        $columnsNames= self::getColumnsNames($extraData);
        // dd($data);
        Excel::create(self::$fileName, function ($excel) use ($data, $columnsNames) {
            $excel->sheet('ExportFile', function ($sheet) use ($data, $columnsNames) {
                $sheet->loadView('reports.xls', array('data' => $data, 'print' => false, 'columnsNames' => $columnsNames));
                $sheet->setRightToLeft(true);
                $sheet->freezeFirstRow();
            });
        })->export('xls');
    }

    private static function exportPdf($data, $printPatternName='general', $extraData)
    {
        $columnsNames= self::getColumnsNames($extraData);
        ini_set("pcre.backtrack_limit", "1000000000");
        $pdf = PDF::loadView("reports.$printPatternName", array('data' => $data, 'print' => false, 'columnsNames' => $columnsNames, 'extraData' => $extraData)
            , [], ['mode' => 'utf-8', 'format' => 'A4-L']);
        return $pdf->download(self::$fileName . ".pdf");
    }

    private static function exportHtml($data, $isPrint = false, $printPatternName='general', $extraData)
    {
        $columnsNames= self::getColumnsNames($extraData);
        // dd($columnsNames);
        return view("reports.$printPatternName", array('data' => $data, 'print' => $isPrint, 'columnsNames' => $columnsNames,'extraData' => $extraData));
    }

    public static function getColumnsNames($extraData){
		
        $columnsNames= self::$columnsNames;
	 
        $columnsNamesDefinition= !empty($extraData['columnsNamesDefinition']) ? $extraData['columnsNamesDefinition'] : null;
	
        if($columnsNamesDefinition){
            foreach($columnsNamesDefinition as $key => $val){
 
                $keyNameArr =  explode('_' , $key);
                array_splice($keyNameArr, count($keyNameArr) - 1, 1);
                $keyName = implode('_', $keyNameArr);
                $columnsNames[$key]=   $columnsNames[$keyName]. ' (' . $columnsNamesDefinition[$key] . ')';
            }
        }
        return $columnsNames;
    }

    private static $columnsNames = [
	    'id' => 'מזהה תושב',
	    'voter_key' => 'זיהוי תושב',
        'actual_address_correct' => 'כתובת מאומתת',
        'address' => 'כתובת',
        'age' => 'גיל',
		'ballot_box_id' => 'קלפי',
        'birth_year' => 'תאריך לידה',
		'cap_50' => 'שר מאה',
		'cap50_households_count' => 'מספר בתי אב לשיבוץ',
        'mi_city' => 'עיר [מ"פ]',
		'city_mi_id'=>'קוד עיר' ,
		'clusters_count' => 'מספר אשכולות',
		'count_ballot_boxes' => 'מספר קלפיות' ,
		'mi_id' => 'קוד',
        'city' => 'עיר',
		'ballot_boxes_count' => 'מספר קלפיות' ,
        'count_total_voters' => 'מספר תושבים',		
        'votes_percents' => 'אחוזי הצבעה',		
		'city_name' => 'עיר',
		'cluster_name' => 'אשכול',
        'create_date' => 'תאריך יצירה',
        'creator_user' => 'משתמש יוצר',
        'current_election_ballot_box_address' => 'כתובת קלפי',
        'current_election_ballot_box_city' => 'עיר קלפי',
        'current_election_ballot_box_city_id' => 'קוד עיר קלפי',
        'current_election_ballot_box_id' => 'קוד קלפי',
        'current_election_cluster' => 'שם אשכול',
        'current_election_cluster_address' => 'כתובת אשכול',
        'current_election_cluster_id' => 'קוד אשכול',
        'current_election_new_voter' => 'בוחר חדש',
        'current_election_vote' => 'הצביע',
        'current_election_vote_time' => 'שעת הצבעה',
        'current_election_voter_number' => 'מספר בוחר',
        'current_support_status_election' => 'סטטוס סניף',
        'current_support_status_final' => 'סטטוס סופי',
        'current_support_status_tm' => 'סטטוס TM',
		'datetime' => 'תאריך ושעת מנה',
        'distribution_code' => 'קוד חלוקה',

        'election_role' => 'סוג נייד של נציג קלפי',
        'election_role_name' => 'תפקיד',
        'election_role_sum' => 'סכום',
        'payment_type' => 'סוג תשלום',
        'election_role_shift' => 'משמרת',
        'election_role_agree_sign' => 'מוכן לשלט',
        'election_role_ballot_box_representative_phone' => 'נייד של נציג קלפי',
        'election_role_captains_of_fifty_id' => 'ת.ז. שר מאה',
        'election_role_captains_of_fifty_name' => 'שם שר מאה',
        'election_role_captains_of_fifty_last_name' => 'שם משפחה שר מאה',
        'election_role_captains_of_fifty_phone' => 'טלפון שר מאה',
        'election_role_captains_of_fifty_city' => 'מטה שיבוץ שר מאה',
        'election_role_create_date' => 'תאריך הגדרה',
        'election_role_creator_user' => 'משתמש מגדיר',
        'election_role_explanation_material' => 'חומר הסברה',
        'election_role_phone_number' => 'טלפון אימות',
        'election_role_Allocate_number' => 'טלפון שיבוץ',
        'election_role_verified_status' => 'סטטוס אימות',
        'election_role_willing_volunteer' => 'מוכן להתנדב',
        'elections_voter_support_status_name' => 'סטטוס סניף',

        'email' => 'דוא"ל',
        'ending' => 'סיומת',
        'ethnic' => 'עדה',
        'exists_in_current_election_campain_voters' => 'קיים בספר הבוחרים',
        'father_name' => 'שם האב',
        'first_name' => 'שם פרטי',
        'flat' => 'דירה',
        'full_address' => 'כתובת מלאה',
        'full_name' => 'שם מלא',
        'gender' => 'מגדר',
        'house' => 'בית',
        'house_entry' => 'כניסה',
		'household_id' => "מס' בית אב" , 
		'household_members_count' => "מספר כרטיסים" , 
        'institute_city' => 'עיר המוסד',
        'institute_group' => 'קבוצת המוסד',
        'institute_name' => 'שם מוסד',
        'institute_network' => 'רשת המוסד',
        'institute_role' => 'תפקיד במוסד',
        'institute_type' => 'סוג המוסד',
        'is_active' => 'פעיל',
        'is_admin' => 'אדמין',
        'last_name' => 'שם משפחה',
        'main_phone' => 'טלפון ראשי',
        'main_phone_2' => 'טלפון נוסף',
        'main_phone_2_type' => 'סוג מספר טלפון נוסף',
        'main_phone_type' => 'סוג מספר טלפון',
        'main_role' => 'שם תפקיד עיקרי',
        'main_team' => 'שם צוות עיקרי',
        'mi_address_similar_to_real' => 'זהות לכ. מ"פ',
        'mi_city_id' => 'קוד עיר [מ"פ]',
        'mi_flat' => 'דירה [מ"פ]',
        'mi_full_address' => 'כתובת מלאה [מ"פ]',
        'mi_house' => 'בית [מ"פ]',
        'mi_house_entry' => 'כניסה [מ"פ]',
        'mi_neighborhood' => 'שכונה [מ"פ]',
        'mi_street' => 'רחוב [מ"פ]',
        'mi_street_id' => 'קוד רחוב [מ"פ]',
        'mi_zip' => 'מיקוד [מ"פ]',
        'neighborhood' => 'שכונה',
        'number_of_voters'=>'מספר תושבים',
        'origin_country' => 'ארץ לידה',
        'password_date' => 'תאריך סיסמא',
        'personal_id' => 'ת.ז',
		'personal_identity' => 'ת"ז',
		'phone_number' => 'מספר טלפון' , 
		'portion_name'=>'שם מנה',
        'previous_election_ballot_box_address' => 'כתובת קלפי',
        'previous_election_ballot_box_city' => 'עיר קלפי',
        'previous_election_ballot_box_city_id' => 'קוד עיר קלפי',
        'previous_election_ballot_box_id' => 'קוד קלפי',
        'previous_election_ballot_box_mi_id' => 'מספר קלפי',
        'previous_election_cluster' => 'שם אשכול',
        'previous_election_cluster_address' => 'כתובת אשכול',
        'previous_election_cluster_id' => 'קוד אשכול',
        'previous_election_new_voter' => 'בוחר חדש',
        'previous_election_vote' => 'הצביע',
        'previous_election_vote_time' => 'שעת הצבעה',
        'previous_election_voter_number' => 'מספר בוחר',
        'previous_name' => 'שם קודם',
        'previous_support_status_election' => 'סטטוס סניף',
        'previous_support_status_final' => 'סטטוס סופי',
        'previous_support_status_tm' => 'סטטוס TM',
        'sephardi' => 'ספרדי',
        'sms_block' => 'לא מאופשר SMS',
        'street' => 'רחוב',
        'strictly_orthodox' => 'חרדי',
        'title' => 'תואר',
        'tm_block' => 'לא מאופשר TM',
		'tm_voter_support_status_name' =>'סטטוס תמיכה TM',
        'user_key' => 'קוד משתמש',
		'voter_answers_to_questionairs'=>'שאלות לסקרים שנענו',
		'voter_name_identity_and_city'=>'תושב',
        'zip' => 'מיקוד',
        'transportation_type' => 'הסעה',
        'transportation_from_time' => 'הסעה משעה',
        'transportation_to_time' => 'הסעה עד שעה',
        'religious_group' => 'זרם',

        // Combined names:
        'combine_name' => 'שם',
        'voters_count' => 'מספר תושבים',
        'households_count' => 'מספר בתי אב',

        // Bank details:
        'bank_number' =>'מספר בנק',
        'bank_branch_name' =>'סניף בנק',
        'bank_branch_number' =>'מספר סניף בנק',
        'bank_account_number' =>'מספר חשבון',
        'bank_owner_name' =>'שם בעלי החשבון',
        'has_bank_verify_document' =>'קיים מסמך אימות בנק',
        'validation_election_campaign_id' =>'חשבון בנק עדכני',
        'is_bank_verified' =>'קיים אימות בנק',

        'is_activists_lock' =>'משתמש נעול',
        'assigned_city_name' =>'עיר שיבוץ',
        'is_activist_allocated' =>'קיים שיבוץ',
        'allocation_date' =>'תאריך שיבוץ',
        'comment' =>'הערה',
        'is_paid' =>'שולם',
    ];
}
