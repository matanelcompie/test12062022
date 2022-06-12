<?php
//file : app/config/constants.php

return [ 'VOTER_GENDER_MALE_NUMBER'                 => 1,
         'VOTER_GENDER_FEMALE_NUMBER'               => 2,
         'VOTER_GENDER_MALE_STRING'                 => 'זכר',
         'VOTER_GENDER_FEMALE_STRING'               => 'נקבה',
         /*=*/
         'ENTITY_TYPE_VOTER'                        => 0,
         'ENTITY_TYPE_REQUEST'                      => 1,

     
         /*=*/
         'ELECTION_CAMPAIGN_TYPE_KNESSET'           => 0,
         'ELECTION_CAMPAIGN_TYPE_MUNICIPAL'         => 1,
         'ELECTION_CAMPAIGN_TYPE_ROUTINE'           => 2,

         /*=*/
         'BIRTH_DATE_TYPE_ONLY_YEAR'                => 0,
         'BIRTH_DATE_TYPE_YEAR_AND_MONTH'           => 1,
         'BIRTH_DATE_TYPE_FULL_DATE'                => 2,

         'MAX_SIZE_OF_HOUSE_ENTRY'                  => 50,

         /*=*/
         'REQUEST_OPERATION_DIRECTION_OUT'          => 0,
         'REQUEST_OPERATION_DIRECTION_IN'           => 1,

         'REQUEST_OPERATION_STATUS_OPEN'            => 1,
         'REQUEST_OPERATION_STATUS_DONE'            => 2,
         'REQUEST_OPERATION_STATUS_CANCELED'        => 3,
         'REQUEST_OPERATION_DIRECTION_OUT_STRING'   => 'יוצאת',
         'REQUEST_OPERATION_DIRECTION_IN_STRING'    => 'נכנסת',
         'REQUEST_OPERATION_STATUS_OPEN_STRING'     => 'פתוח',
         'REQUEST_OPERATION_STATUS_DONE_STRING'     => 'בוצע',
         'REQUEST_OPERATION_STATUS_CANCELED_STRING' => 'מבוטל',

         /*=*/
         'APP_DATETIME_ZONE'                        => 'Asia/Jerusalem',
         'APP_DATETIME_DB_FORMAT'                   => 'Y-m-d H:i:s',
         'APP_DATE_DB_FORMAT'                       => 'Y-m-d',
         'SHAS_DATETIME_FORMAT'                     => 'd/m/Y H:i:s',
         'SHAS_DATE_FORMAT'                         => 'd/m/Y',

         'DOCUMENTS_DIRECTORY'               => env('FILES_FOLDER', base_path() . '/files').'/documents/',
         'MASAVS_FILE_DIRECTORY'             => env('FILES_FOLDER', base_path() . '/files').'/masav_files/',
		 'CSV_UPLOADS_DIRECTORY'             => env('FILES_FOLDER', base_path() . '/files').'/csv/',
		 'GLOBAL_FILES_DIRECTORY'            => env('FILES_FOLDER', base_path() . '/files').'/global_files/',
         'VOTER_BOOKS_DIRECTORY'             => env('FILES_FOLDER', base_path() . '/files').'/voter_books/',
         'BUDGET_DIRECTORY'                  => env('FILES_FOLDER', base_path() . '/files').'/budget/',
         'VOTE_FILES_DIRECTORY'              => env('FILES_FOLDER', base_path() . '/files').'/vote_files/',
         'BALLOT_BOXES_FILES_DIRECTORY'      => env('FILES_FOLDER', base_path() . '/files').'/ballot_boxes/',
         'EXTERNAL_VOTES_DIRECTORY'          => env('FILES_FOLDER', base_path() . '/files').'/external_votes/',
         'APPOINTMENT_LETTERS_DIRECTORY'      => env('FILES_FOLDER', base_path() . '/files').'/appointment_letters/',
         'BALLOT_BOXES_PROTOCOLS_FILES_DIRECTORY'      => env('FILES_FOLDER_SHIBUTS', base_path() . '/files').'/ballot_boxes_protocols/',

         /*=*/
         //voter_meta_keys.protected
         'VOTER_META_KEY_NOT_PROTECTED'    => 0,
         'VOTER_META_KEY_PROTECTED'        => 1,

         //voter_meta_keys.per_campaign
         'VOTER_META_KEY_PER_VOTER'        => 0,
         'VOTER_META_KEY_PER_CAMPAIGN'     => 1,

         //voter_meta_keys.key_type
         'VOTER_META_KEY_TYPE_WITH_VALUES' => 0,
         'VOTER_META_KEY_TYPE_FREE_TEXT'   => 1,
         'VOTER_META_KEY_TYPE_NUMBER'      => 2,
		 
	
		 
         /*=*/
         //voter_support_status types
         'ENTITY_TYPE_VOTER_SUPPORT_ELECTION'       => 0,
         'ENTITY_TYPE_VOTER_SUPPORT_TM'             => 1,
         'ENTITY_TYPE_VOTER_SUPPORT_FINAL'          => 2,

		 
		  'BALLOT_BOXE_ROLES_TYPE'      => 0,

         //some of support statuses
		 'VOTER_SUPPORT_STATUS_TYPE_SURE_SUPPORTING' =>1 ,
         'VOTER_SUPPORT_STATUS_TYPE_SUPPORTING' =>2 ,
         'VOTER_SUPPORT_STATUS_TYPE_HESITATING' =>3 , 
         'VOTER_SUPPORT_STATUS_TYPE_NOT_SUPPORTING' =>4 , 
         'VOTER_SUPPORT_STATUS_TYPE_POTENTIAL' =>5 ,  
		 'VOTER_SUPPORT_STATUS_TYPE_TOGEATHER' =>6 ,
  

         //Geographic entity type
         'GEOGRAPHIC_ENTITY_TYPE_AREA_GROUP'   => -1,
         'GEOGRAPHIC_ENTITY_TYPE_AREA'         => 0,
         'GEOGRAPHIC_ENTITY_TYPE_CITY'         => 1,
         'GEOGRAPHIC_ENTITY_TYPE_NEIGHBORHOOD' => 2,
         'GEOGRAPHIC_ENTITY_TYPE_CLUSTER'      => 3,
         'GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'   => 4,
         'GEOGRAPHIC_ENTITY_TYPE_SUB_AREA'     => 5,
         'GEOGRAPHIC_ENTITY_TYPE_QUARTER'     => 6,
         'GEOGRAPHIC_ENTITY_TYPE_CAPTAIN_100'     => 100,

         // csv file types
         'CSV_FILE_TYPE_NORMAL'    => 0,
         'CSV_FILE_TYPE_MI_VOTERS' => 1,

          // csv parser status
         'CSV_PARSER_STATUS_DID_NOT_START'     => 0,
         'CSV_PARSER_STATUS_AT_WORK'           => 1,
         'CSV_PARSER_STATUS_SUCCESS'           => 2,
         'CSV_PARSER_STATUS_ERROR'             => 3,
         'CSV_PARSER_STATUS_WAITING'           => 4,
         'CSV_PARSER_STATUS_CANCELLED'         => 5,
         'CSV_PARSER_STATUS_RESTARTED'         => 6,

         // csv parser status
         'CSV_PARSER_ROW_STATUS_SUCCESS'       => 0,
         'CSV_PARSER_ROW_STATUS_FAILED'        => 1,

         // csv parser error types
         'CSV_PARSER_ERROR_INVALID_IDENTITY'              => 0,
         'CSV_PARSER_ERROR_INVALID_CITY'                  => 1,
         'CSV_PARSER_ERROR_INVALID_ZIP'                   => 2,
         'CSV_PARSER_ERROR_INVALID_EMAIL'                 => 3,
         'CSV_PARSER_ERROR_INVALID_PHONE'                 => 4,
         'CSV_PARSER_ERROR_INVALID_SUPPORT'               => 5,
         'CSV_PARSER_ERROR_ADDRESS_WITH_NO_CITY'          => 6,
         'CSV_PARSER_ERROR_ADDRESS_WITH_NO_ID'            => 7,
         'CSV_PARSER_ERROR_INVALID_REQUEST_TOPIC'         => 8,
         'CSV_PARSER_ERROR_INVALID_REQUEST_SUB_TOPIC'     => 9,
         'CSV_PARSER_ERROR_UNKNOWN_VOTER'                 => 10,
         'CSV_PARSER_ERROR_INVALID_DATE'                  => 11,
         'CSV_PARSER_ERROR_INVALID_ETHNIC'                => 12,
         'CSV_PARSER_ERROR_INVALID_SEPHARDI'              => 13,
         'CSV_PARSER_ERROR_INVALID_STRICTLY_ORTHODOX'     => 14,
         'CSV_PARSER_ERROR_INVALID_DECEASED'              => 15,
         'CSV_PARSER_ERROR_INVALID_VOTE_TIME'             => 16,
         'CSV_PARSER_ERROR_INVALID_VOTED'                 => 17,
         'CSV_PARSER_ERROR_USER_MISSING_PERMISSIONS'      => 18,
         'CSV_PARSER_ERROR_INVALID_RELIGIOUS_GROUP'       => 19,
         'CSV_PARSER_ERROR_INVALID_KEY'                   => 20,

		 
		 // csv column types -> must match to client side
		 'CSV_COLUMN_PERSONAL_IDENTITY'         => 0,
		 'CSV_COLUMN_FIRST_NAME'                => 1,
	     'CSV_COLUMN_PHONE_NUMBER'              => 2,
		 'CSV_COLUMN_EMAIL'                     => 3,
		 'CSV_COLUMN_SUPPORT_STATUS'            => 4,
		 'CSV_COLUMN_SEPHARDI'                  => 5,
	     'CSV_COLUMN_CITY'                      => 6,
		 'CSV_COLUMN_STREET'                    => 7,
		 'CSV_COLUMN_HOUSE'                     => 8,
		 'CSV_COLUMN_NEIGHBORHOOD'              => 9,
		 'CSV_COLUMN_HOUSE_ENTRY'               => 10,
		 'CSV_COLUMN_FLAT'                      => 11,
		 'CSV_COLUMN_ZIP'                       => 12,
	     'CSV_COLUMN_INSTITUTE_ID'              => 13,
		 'CSV_COLUMN_INTITUTE_ROLE_ID'          => 14,
		 'CSV_COLUMN_CLASSIFICATION_ID'         => 15,
         'CSV_COLUMN_VOTED'                     => 16,
		 'CSV_COLUMN_LAST_NAME'                 => 17,
		 'CSV_COLUMN_DECEASED'                  => 18,
		 'CSV_COLUMN_DECEASED_DATE'             => 19,
		 'CSV_COLUMN_BIRTH_DATE'                => 20,
		 'CSV_COLUMN_SUPPORT_STATUS_FINAL'      => 21,
		 'CSV_COLUMN_VOTE_TIME'                 => 22,
		 'CSV_COLUMN_ETHNIC_GROUP_ID'           => 23,
		 'CSV_COLUMN_GENDER'                    => 24,
		 'CSV_COLUMN_STRICTLY_ORTHDOX'          => 25,
		 'CSV_COLUMN_TRANSPORT_TYPE'            => 26,
		 'CSV_COLUMN_TRANSPORT_FROM_TIME'      	=> 27,
		 'CSV_COLUMN_TRANSPORT_TO_TIME'         => 28,
         'CSV_COLUMN_RELIGIOUS_GROUP_ID'        => 29,
         'CSV_COLUMN_VOTER_KEY'        => 30,
          

         // csv support status update types
         'CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MAXIMUM'  => 0,
         'CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_MINIMUM'  => 1,
         'CSV_PARSER_SUPPORT_STATUS_UPDATE_TYPE_ALWAYS'   => 2,
		 
		 // csv role classification : 
         'CSV_PARSER_ROLE_CLASSIFICATION_OPENED_DEFAULT'  => 0,
         'CSV_PARSER_ROLE_CLASSIFICATION_LIMITED'  => 1,
         'CSV_PARSER_ROLE_CLASSIFICATION_PARTIALLY_LIMITED'   => 2,

         //request action types
         'REQUEST_ACTION_TRANSFER_REQUSET'  => 1,
         'REQUEST_ACTION_CLOSE_REQUSET'  => 2,
         'REQUEST_ACTION_CANCEL_REQUSET'  => 3,
		 
		 
		 // update support status row status
         'SERVICE_STATUS_DID_NOT_START'     => 0,
         'SERVICE_STATUS_AT_WORK'           => 1,
         'SERVICE_STATUS_FINISHED'          => 2,
		 'SERVICE_STATUS_ERROR'             => 3,

		 // action status
         'ACTION_STATUS_OPEN'               => 1,
         'ACTION_STATUS_DONE'               => 2,
         'SERVICE_STATUS_CANCELED'          => 3,

		 // action status
         'REQUEST_STATUS_NEW'               => 1,
         'REQUEST_STATUS_PROCCESS'          => 2,
         'REQUEST_STATUS_CLOSED'          => 3,
         'REQUEST_STATUS_CANCELED'          => 4,

         // Email max length
         'EMAIL_MAX_LENGTH'               => 254,
        'users' =>[
            'MAX_WRONG_ATTEMPTS' => 15,
            'WRONG_ATTEMPTS_FOR_RELOAD_PAGE' => 5,
        ],
         'activists' => [
             'verified_status' => [
                 'NO_MESSAGE_SENT' => 0,
                 'MESSAGE_SENT' => 1,
                 'VERIFIED' => 2,
                 'REFUSED' => 3,
                 'MORE_INFO' => 4
             ],
             'verifyBankStatuses' => [
                'allDetailsCompleted' => 0,
                'notAllDetailsCompleted' => 1,
                'bankDetailsMissing' => 2,
                'VerifyDocumentMissing' => 3,
                'bankNotVerified' => 4,
                'bankNotUpdated' => 5,
            ] ,
            
             'NOT_COMING' => 3,

             'election_roles_additions' => [
                'NONE' => -1,
                'ALL'  => 0 , 
				'MULTI' => -2
             ],
            // Municipal city/quarter inner roles: 
            'muni_inner_elections_roles_names' => [
                'municipal_secretary', 'optimization_data_coordinator',
                'drivers_coordinator', 'motivator_coordinator', 'allocation_coordinator',
            ],
            // Municipal special roles: 
            'muni_elections_roles_names' => [
                'municipal_director', 'municipal_secretary', 'optimization_data_coordinator',
                'drivers_coordinator', 'motivator_coordinator', 'allocation_coordinator', 'quarter_director'
            ],
            // Municipal screen allowed login roles: 
            'muni_login_elections_roles_names' => [
                'municipal_director', 'municipal_secretary', 'optimization_data_coordinator',
                'drivers_coordinator', 'motivator_coordinator', 'allocation_coordinator',
                'captain_of_fifty', 'cluster_leader', 'ballot_member', 'counter', 'observer'
            ],
            // non Municipal roles: 
            'non_muni_elections_roles_names' => [
                'motivator', 'driver', 'ballot_member',
                'counter', 'election_general_worker', 'observer'
            ],
            // Ballot roles: 
            'ballot_elections_roles_names' => [
                'ballot_member', 'counter', 'observer'
            ],
            // All roles: 
            'election_role_system_names' => [
                'electionGeneralWorker' => 'election_general_worker',
                'ministerOfFifty' => 'captain_of_fifty',
                'clusterLeader' => 'cluster_leader',
                'motivator' => 'motivator',
                'driver' => 'driver',
                'ballotMember' => 'ballot_member',
                'observer' => 'observer', 
                'counter' => 'counter', 
                'muniDirector' => 'municipal_director', 
                'muniSecretary' => 'municipal_secretary', 
                'quarterDirector' => 'quarter_director', 
                'optimizerCoordinator' => 'optimization_data_coordinator', 
                'driversCoordinator' => 'drivers_coordinator', 
                'motivatorCoordinator' => 'motivator_coordinator', 
                'allocationCoordinator' => 'allocation_coordinator', 
                'additional_payments' => 'additional_payments', //special role for payments
            ],
            'role_shifts' => [
                'FIRST' => 'first',
                'SECOND' => 'second',
                'ALL_DAY' => 'all_day',
                'COUNT' => 'count',
                'SECOND_AND_COUNT' => 'second_and_count',
                'ALL_DAY_AND_COUNT' => 'all_day_and_count'
            ],

            'MAX_RECORDS_FROM_DB' => 100,

             'messageDirections' => [
                 'OUT' => 0,
                 'IN' => 1
             ],
             'verificationMessage' => [
                'ACCEPT' => 'כן',
                'ACCEPT_INVERT' => 'ןכ',
                'DENY' => 'לא',
                'DENY_INVERT' => 'אל',
                'ACCEPT_IVR' => 1,
                'DENY_IVR' => 2,
             ],
			'verificationBallotMessageSMS' => 'הרשמתך באמצעות הלינק התקבלה.ניתן לדווח את מספרי הבוחר שהצביעו בקלפי - באמצעות הלינק או באמצעות מסרון.' ,
			'garbageMessageSMSText' => 'לא הבנו, נא לקרוא את ההנחיות ולנסות שוב. יש לשלוח את התגובה ללא תוספות' ,
			'verificationDeleteShibutzSms' => 'סליחה על הטעות, הסרנו את שיבוצך לתפקיד' ,
			'verificationDeleteShibutzIvr' => 'סְלִיחָה עַל הַטָּעוּת, הֵסַרְנוּ אֶת שִׁבּוּצְךָ לַתַּפְקִיד' ,
			'verificationMessageText' => 'שלום [first_name], שובצת לתפקיד [role_name] כפעיל בחירות. יש להשיב כן לאישור, או לא להסרה',
			'verificationMessageTextIvr' => 'שָׁלוֹם [first_name], שֻׁבַּצְתָּ לְתַּפְקִיד [role_name] כֶּפָּעִיל בְּחִירוֹת. - יֵשׁ לְהָשִׁיב 1 לְאִשּׁוּר, אוֹ 2 לְהַסָּרָה',
			'verificationMessageTextSendIvr' => '{dic:4238} {[first_name]} {dic:4255} {[role_name]} {dic:4257}',
			'verificationRepeatMessageText' => 'שלום [first_name], שלחנו אליך היום הודעה לגבי תפקידך כפעיל במערכת הבחירות. טרם אישרת קבלת התפקיד. לאישור השיבוץ השב "כן", לדחייה השב "לא".',
			'verificationRepeatMessageTextIvr' => 'שָׁלוֹם [first_name], שָׁלַחְנוּ אֵלֶיךָ הַיּוֹם הוֹדָעָה לְגַבַּי תַּפְקִידְךָ כְּפָעִיל בְּמַעֲרֶכֶת הַבְּחִירוֹת. טֶרֶם אִשַּׁרְתָּ קַבָּלַת הַתַּפְקִיד. לְאִשּׁוּר הַשִּׁבּוּץ הָשֵׁב "1", לִדְחִיָּה הַשָּׁב "2"',
			'deleteGeoRolesAfter24HoursMessageText' => 'שלום [first_name], המינוי לתפקיד שלא אושר על ידך - הוסר',
			'deleteGeoRolesAfter24HoursMessageTextIvr' => 'שָׁלוֹם [first_name], הַמִּנּוּי לַתַּפְקִיד שֶׁלֹּא אֻשַּׁר עַל יָדְךָ - הוּסַר.',
			'arrivalMessageTextIvr' => 'כָּעֵת נִתַן לְדַוֵּחַ מִסְפָּרֶי בּוֹחֵר שֶׁל הַמַּצְבִּיעִים',
			'responseSmsMessageAllSuccess'=>'התקבלו [num_success] הצבעות תקינות',
			'responseSmsMessageSuccessAndFailure'=>'התקבלו [num_success] הצבעות תקינות ו[num_fail] הצבעות שגויות.המספרים התקינים שהתקבלו הם [success_numbers_list]',
			'arrivalMessageText' => 'תודה  [first_name]. אושרה התייצבותך בקלפי  [mi_id] ב[city_name]. 
				כעת ניתן לדווח הצבעות.
				יש לדווח את קוד הבוחר שהצביע, אפשר לדווח מספר תושבים בהודעה אחת כשהם מופרדים ברווח או בפסיק.',
			'badBallotBoxNumberSms' => "דיווחת קלפי [ballot_number], זו לא הקלפי שנקבעה לך.
			נא דווח מחדש והקפד על הכללת הנקודה והספרה שאחריה, או פנה למטה הבחירות המקומי",
			'badBallotBoxNumberIvr' => 'דִּוַּחְתָּ קַלְפִּי [ballot_number].- 
				זוֹ לֹא הַקַּלְפִּי אֵלֶיהָ שֻׁבַּצְתָּ - 
				דַּוַּח מְחַדַשׁ וּרְשׁוֹם אֶת כָּל הַסְּפָרוֹת, כּוֹלֵל זוֹ שֶׁאַחֲרֵי הַנְּקֻדָּה - בְּלִי לְהַקְלִיד אֶת הַנְּקֻדָּה עָצְמָה- 
				לְמָשָׁל, קַלְפִּי שָׁלוֹשׁ נְקֻדָּה אֶפֶס הָקְלֶד שָׁלוֹשׁ אֶפֶס',

			'badBallotBoxFormat' => 'דיווחת קלפי בפורמט שגוי! הפורמט הנכון הוא המילה "קלפי" לאחר מכן רווח ואז מספר הקלפי בו שובצת כולל נקודה והספרה שאחריה. למשל: קלפי 3.0',
			'badBallotBoxSerialNumberText' => "מַס' הַבּוֹחֵר [bad_serial_numbers] לֹא קָיַם בְּקַלְפִּי [ballot_box_mi_id] ",
			'BallotReportingMessge' => "שלום [first_name], אנא אשר התייצבותך בקלפי שב[ballot_addr] \n באפליקצייה שבכתובת [applications_link] \n [mobile_link] \n אם אין לך גישה, נא השב 0 לקבלת הנחיות נוספות",
			'BallotReportingMessgeIvr' => 'שָׁלוֹם [first_name]. זוֹהִי מַעֲרֶכֶת דִּוּוּחֵי הַנּוֹכְחוּת שֶׁל שַׁס. אַתָּה אָמוּר לְהַגִּיעַ לַקַּלְפִּי  [ballot_mi_id] 
                            בְּ [city_name] . אִם אַתָּה נִמְצָא כְּבָר בַּקַּלְפִּי הַקֵּשׁ 1, אִם טֶרֶם הִגַּעְתָּ הַקֵּשׁ 2 וְנַחֲזֹר אֵלֶיךָ שׁוּב בְּעוֹד מִסְפָּר דַּקּוֹת,
                                אִם טָעִינוּ וְאֵינְךָ אָמוּר לְהַגִּיעַ לַקַּלְפִּי לַחַץ 3',
			'BallotReportingMessgeSendIvr' => '{dic:4238} {[first_name]} {dic:4230} {[ballot_mi_id]} {dic:4232} {[city_name]} {dic:4233}',
			'BallotInfoMessage'=>'אתה אמור להתייצב בקלפי [mi_id] ב[city_name] ברחוב [cluster_street] 
				לאחר שתתייצב בקלפי, מצא את פרטי הבוחרים בקלפי והשב במסרון את מספר תעודת הזהות של
				הבוחר הראשון בקלפי. 
				רק אחרי שתקבל אישור לדיווח זה תוכל להתחיל לדווח הצבעות בקלפי.',
			'voteReportingMissingBallotBoxSms' => "טרם אשרת את התיצבותך בקלפי, אנא דווח 'קלפי XXX' (המילה קלפי רווח ומספר הקלפי) לאישור התייצבות",

			'wrongIdentityNumberFormat'=>'תעודת הזהות שדווחה [personal_identity] - שגויה, אנא בדוק את המספר ודווח שוב. הדיווח צריך 
				לכלול את כל הספרות כולל ספרת הביקורת של הבוחר הראשון ברשימת הבוחרים בקלפי.',

			'correctFirstIdentityWrongKalfi' => 'לפי תעודת הזהות שהקשת, הגעת לקלפי אחרת מזו שנקבעה לך. 
				עבור לקלפי [mi_id] ב[city_name] ודווח משם.
				בדוק את הנחיות ההתייצבות שלך או התקשר בדחיפות למוקד בטלפון [global_phone_number]',

			'correctIdentityWrongKalfi' => 'לפי תעודת הזהות שהקשת, לא הגעת לקלפי  [mi_id] ב[city_name]!!!
				בנוסף, תעודת הזהות שהקשת איננה התעודה הראשונה בקלפי.
				ודא שאתה נמצא בקלפי [mi_id] ב[city_name] מצא את תעודת הזהות של הבוחר הראשון 
				ברשימת הבוחרים בקלפי והקש את תעודת הזהות שלו.
				אם אינך מסתדר, התקשר בדחיפות למוקד בטלפון [global_phone_number]',

			'disconnectedActivistMessage'=>'[first_name] שלום, נותקת ממערכת הדיווחים לאחר שמחליפך בקלפי  [mi_id] התחבר כעת.
				אם אתה עדיין בקלפי ונדרש להמשיך לדווח, פנה לאחראי בטלפון  [global_phone_number]',
		],

        'status_change_report' => [
            'SELECTED_SUPPORT_STATUS_NONE' => 'support_none',

            'summary_by' => [
                'NONE' => 0,
                'BY_AREA' => 1,
                'BY_CITY' => 2,
                'BY_CLUSTER' => 3,
                'BY_BALLOT' => 4
            ],

            'sort_directions' => [
                'UP' => 'u',
                'DOWN' => 'd'
            ]
        ],

        'ballots_summary_report' => [
            'SELECTED_SUPPORT_STATUS_NONE' => 'support_none',
        ],
		
		//number of households per captain fifty:
		 'NUMBER_OF_HOUSEHOLDS_PER_CAP50'    =>  50,

        /**  Constants for field referenced_model_action_type in table action_history  **/
        'ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_ADD'    =>  0,
        'ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'   =>  1,
        'ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_DELETE' =>  2,

        'ballots_polling_summary_by' => [
            'NONE' => 0,
            'BY_AREA' => 1,
            'BY_CITY' => 2,
            'BY_CLUSTER' => 3,
            'BY_BALLOT' => 4
        ],

        'TRANSPORTATION_CAR_REGULAR' => 0,
        'TRANSPORTATION_CAR_CRIPPLED' => 1,

        'MESSAGE_TYPE_EMAIL' => 0,
        'MESSAGE_TYPE_SMS' => 1,
		
		'GLOBAL_SUPPORT_NUMBER' => '03-1234567' , 

        'SMS_MESSAGES_BLOCK' => 0,
        'SMS_MESSAGES_ALLOW' => 1,

        'MESSAGE_DIRECTION_OUT' => 0,
        'MESSAGE_DIRECTION_IN' => 1,

        'HISTORY_ENTITY_TYPE_CSV_FILE' => 0,
        'HISTORY_ENTITY_TYPE_HOUSEHOLD_STATUS_CHANGE' => 1 , 
        'HISTORY_ENTITY_TYPE_VOTERS_MANUAL_UPDATE' => 2,
        'HISTORY_ENTITY_TYPE_VOTERS_BOOK_LOAD' => 3,
        'HISTORY_ENTITY_TYPE_SUPPORT_STATUS_UPDATE' => 4,
        'HISTORY_ENTITY_TYPE_MOBILE_VOTE' => 5,
        'HISTORY_ENTITY_HOUSEHOLD_UPDATE' => 6,
        'HISTORY_ENTITY_VOTER_UPDATE' => 7,
		
		'VOTER_GROUP_PERMISSION_TYPE_NONE' => 0 ,
		'VOTER_GROUP_PERMISSION_TYPE_GEOGRAPHIC' => 1 ,
		'VOTER_GROUP_PERMISSION_TYPE_TEAM' => 2 ,
		'VOTER_GROUP_PERMISSION_TYPE_USER' => 3 ,
        'VOTE_SOURCE_TYPE_CSV_FILE' => 'csv_file',

        'RESET_PASSWORD_TYPE_NONE'    => 0,
        'RESET_PASSWORD_TYPE_INITIAL' => 1,
        'RESET_PASSWORD_TYPE_EXPIRED' => 2,

        'VOTER_BOOK_PARSER_STATUS_DID_NOT_START' =>0,
        'VOTER_BOOK_PARSER_STATUS_AT_WORK' => 1,
        'VOTER_BOOK_PARSER_STATUS_SUCCESS' => 2,
        'VOTER_BOOK_PARSER_STATUS_ERROR' =>3,
        'VOTER_BOOK_PARSER_STATUS_DELAYED' => 4,
        'VOTER_BOOK_PARSER_STATUS_CANCELLED' => 5,
		'VOTER_BOOK_PARSER_STATUS_RESTARTED' => 6,

        // csv parser status
        'VOTER_BOOK_PARSER_ROW_STATUS_SUCCESS' => 0,
        'VOTER_BOOK_PARSER_ROW_STATUS_FAILED' => 1,

        'VOTER_BOOK_ROW_STATUS_SUCCESS' => 0,
        'VOTER_BOOK_ROW_STATUS_FAILED' => 1,

        'VOTER_BOOK_TEMP_CLUSTER_NAME' => 'זמני',

        'election_campaigns' => [
            'budget' => [
                'election_roles_edit_types' => [
                    'UPDATE_FOR_ALL_CITIES' => 1,
                    'UPDATE_FOR_CITIES_WITH_EQUAL_AMOUNT' => 2,
                    'UPDATE_FOR_CITIES_WITH_INEQUAL_AMOUNT' => 3,
                    'UPDATE_WITHOUT_CITIES' => 4
                ]
            ],

            'supportStatusUpdate' => [
                'types' => [
                    'ELECTION' => 0,
                    'FINAL' => 1
                ]
            ]
        ],

        'CITY_BUDGET_TYPE_ONGOING' => 0,
        'CITY_BUDGET_TYPE_ACTIVIST' => 1,

        'VOTE_FILE_PARSER_STATUS_DID_NOT_START' =>0,
        'VOTE_FILE_PARSER_STATUS_AT_WORK' => 1,
        'VOTE_FILE_PARSER_STATUS_SUCCESS' => 2,
        'VOTE_FILE_PARSER_STATUS_ERROR' =>3,
        'VOTE_FILE_PARSER_STATUS_DELAYED' => 4,
        'VOTE_FILE_PARSER_STATUS_CANCELLED' => 5,
        'VOTE_FILE_PARSER_STATUS_RESTARTED' => 6,

		'VOTE_SOURCE_TM' => 4,

        'SUCCESS' => 'OK',

        'PHONE_TYPE_HOME'   => 1,
        'PHONE_TYPE_MOBILE' => 2,

        'BALLOT_BOX_FILE_PARSER_STATUS_DID_NOT_START' =>0,
        'BALLOT_BOX_FILE_PARSER_STATUS_AT_WORK' => 1,
        'BALLOT_BOX_FILE_PARSER_STATUS_SUCCESS' => 2,
        'BALLOT_BOX_FILE_PARSER_STATUS_ERROR' =>3,
        'BALLOT_BOX_FILE_PARSER_STATUS_DELAYED' => 4,
        'BALLOT_BOX_FILE_PARSER_STATUS_CANCELLED' => 5,
        'BALLOT_BOX_FILE_PARSER_STATUS_RESTARTED' => 6,

        'SUPPORT_STATUS_PARSER_STATUS_DID_NOT_START' =>0,
        'SUPPORT_STATUS_PARSER_STATUS_AT_WORK' => 1,
        'SUPPORT_STATUS_PARSER_STATUS_SUCCESS' => 2,
        'SUPPORT_STATUS_PARSER_STATUS_ERROR' =>3,
        'SUPPORT_STATUS_PARSER_STATUS_DELAYED' => 4,
        'SUPPORT_STATUS_PARSER_STATUS_CANCELLED' => 5,
        'SUPPORT_STATUS_PARSER_STATUS_RESTARTED' => 6,

        'supportStatusSystemNames' => [
            'DEFINITE_SUPPORTER' => 'definite_supporter',
            'SUPPORTER' => 'supporter',
            'HESITATE' => 'hesitate',
            'UNSUPPORT' => 'unsupport',
            'POTENTIAL' => 'potential'
        ] , 
		'ELECTIONS_START_TIME' => '06:00:00' ,
        'ELECTIONS_END_TIME' =>'22:00:00',
        'combineBy' => [
            'no_combine' => 'ללא סיכום',
            'areas' => 'אזור',
            'mi_cities' => 'עיר',
            'neighborhoods' => 'שכונה',
            'clusters' => 'אשכול',
            'ballot_boxes' => 'קלפי',
            'cities' => 'עיר בפועל',
            'mi_streets' => 'רחוב בפועל',
            'actual_address_correct' => 'כתובת מאומתת',
            'support_status_election' => 'סטטוס סניף',
            'support_status_tm' => 'סטטוס טלמרקטינג',
            'support_status_final' => 'סטטוס סופי',
            'captains_of_fifty' => 'שר מאה',
            'age' => 'גיל',
            'birth_year' => 'שנת לידה',
            'origin_country' => 'ארץ לידה',
            'ethnic_group' => 'עדה',
            'religious_group' => 'זרם',
            'sephardi' => 'ספרדי',
            'election_roles' => 'תפקיד ביום בחירות',
            'exist_in_election_campaign' => 'קיים בפנקס תושבים',
            'new_voters' => 'תושב חדש',
            'willing_volunteer' => 'נתוני התנדבות',
            'orthodox_ballot_boxes' => 'מצביע בקלפי חרדי',
            'previous_support_status' => 'סטטוס תמיכה לפי מערכת בחירות קודמות',
            'previous_vote_status' => 'סימון הצבעה בבחירות קודמות',
            'previous_vote_time' => 'שעת הצבעה בבחירות קודמות']
        ,
		'filter_by' => [
			'shas_representatives' => [
				'municipal_role_options' => [
					'MAYOR' => 1 , 
					'DEPUTY_MAYOR' => 2 , 
					'COUNCIL_MEMBER' => 3  
				]
			] ,
		],
        'voterFilterEntityTypes' => [
            'CAMPAIGN' => 1
        ],
        'bank_list' => [
            "4" => 'בנק יהב לעובדי המדינה בעמ',
            "10"=> 'בנק לאומי לישראל בעמ',
            "11"=> 'בנק דיסקונט לישראל בעמ',
            "12"=> 'בנק הפועלים בעמ',
            "13"=> 'בנק אגוד לישראל בעמ',
            "14"=> 'בנק אוצר החייל בעמ',
            "17"=> 'בנק מרכנתיל דיסקונט בעמ',
            "20"=> 'בנק מזרחי טפחות בעמ',
            "22"=> 'Citibank N.A',
            "23"=> 'ה אס בי סי בנק פי אל סי',
            "26"=> 'יובנק בעמ',
            "31"=> 'בנק הבינלאומי הראשון לישראל בעמ',
            "39"=> 'SBI State Bank of India',
            "46"=> 'בנק מסד בעמ',
            "50" => 'מרכז סליקה בנקאי בעמ',
            "52"=> 'בנק פועלי אגודת ישראל בעמ',
            "54"=> 'בנק ירושלים בעמ',
            "59"=> 'שירותי בנק אוטומטיים',
            "68"=> 'מוניציפל בנק בעמ',
            "99"=> 'בנק ישראל',
        ],
        'request_topic_municipally_system_name' => 'municipally',
        'globalHeadquartersAreas' => [58]
];