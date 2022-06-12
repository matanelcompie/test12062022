<?php

/*
 |--------------------------------------------------------------------------
 | Action history constants
 |--------------------------------------------------------------------------
 |
 | This files stores the hebrew names of the
 | fields in the database.
 |
 | The file is a collection of associative arrays of
 | model name and it's fields.
 |
 | $modelName => [
 |    field1 => field1_hebrew_name
 |    field2 => field2_hebrew_name
 |    .
 |    .
 |    fieldn => fieldn_hebrew_name
 | ]
 */

use App\Models\BankDetails;

return [
    'VoterSupportStatus' => [
        'election_campaign_id' => 'קמפיין בחירות',
        'voter_id' => 'תושב',
        'entity_type' => 'סוג סטטוס תמיכה',
        'support_status_id' => 'סטטוס תמיכה'
    ],

    'Document' => [
        'entity_type' => 'מקור המסמך',
        'entity_id' => 'זיהוי הישות',
        'name' => 'שם המסמך',
        'type' =>  'סוג המסמך',
        'file_name' => 'שם המסמך בתיקית השרת'
    ],

    'ElectionRolesByVoters' => [
        'election_campaign_id' => 'מערכת בחירות',
        'voter_id' => 'תושב',
        'election_role_id' => 'תפקיד',
        'phone_number' => 'מספר טלפון',
        'instructed' => 'הדרכה',
        'sum' => 'סכום',
        'email' => 'אימייל',
        'comment' => 'הערה',
        'verified_status' => 'סטטוס אימות',
        'day_sending_message' => 'יום שליחת הודעת אימות',
        'user_update_id' => 'משתמש מעדכן',
        'user_lock_id' => 'משתמש נועל',
        'assigned_city_id' => 'עיר שיבוץ פעיל',
    ],

    'TransportationCars' => [
        'election_role_by_voter_id' => 'פעיל',
        'type' => 'סוג רכב',
        'number' => 'מספר רכב',
        'passenger_count' => 'מספר נוסעים'
    ],

    'Voters' => [
        'first_name' => 'שם פרטי',
        'last_name' => 'שם משפחה',
        'father_name' => 'שם האב',
        'personal_identity' => 'מספר תעודת זהות',
        'mi_city_id' => 'זיהוי עיר משרד הפנים',
        'mi_city' => 'עיר משרד הפנים',
        'mi_street_id' => 'זיהוי רחוב משרד הפנים',
        'mi_street' => 'רחוב משרד הפנים',
        'mi_zip' => 'מיקוד משרד הפנים',
        'mi_house' => 'בית משרד הפנים',
        'mi_house_entry' => 'כניסה משרד הפנים',
        'mi_flat' => 'דירה משרד הפנים',
        'mi_mark' => 'אות משרד הפנים',
        'email' => 'דואר אלקטרוני',
        'contact_via_email' => 'אפשר לשלוח דוא"ל',
        'birth_date' => 'תאריך לידה',
        'birth_date_type' => 'סוג תאריך לידה',
        'origin_country_id' => 'ארץ לידה',
        'voter_title_id' => 'תואר',
        'voter_ending_id' => 'סיומת',
        'ethnic_group_id' => 'עדה',
        'religious_group_id' => 'זרם',
        'sephardi' => 'ספרדי',
        'gender' => 'מגדר',
        'main_voter_phone_id' => 'מספר טלפון ראשי',
        'city' => 'עיר',
        'city_id' => 'עיר',
        'street' => 'רחוב',
        'street_id' => 'רחוב',
        'neighborhood' => 'שכונה',
        'house' => 'בית',
        'house_entry' => 'כניסה',
        'flat' => 'דירה',
        'zip' => 'מיקוד',
        'household_id' => 'בית אב',
        'distribution_code' => 'קוד חלוקה',
        'actual_address_correct' => 'האם הכתובת בפועל נכונה',
        'actual_address_update_date' => 'תאריך עדכון כתובת בפועל',
        'strictly_orthodox' => 'האם חרדי',
        'shas_representative' => 'האם נציג ש"ס',
        'comment' => 'הערה',
        'not_at_home' => 'לא היו בבית',
        'additional_care' => 'דרוש טיפול נוסף',
        'mark' => 'סימן דירה',
		'deceased' => 'נפטר',
        'deceased_date' => 'תאריך פטירה',
    ],
    'BankDetails' => [
        'bank_branch_id' => 'מצביע לסניף',
        'bank_account_number' => 'מספר חשבון',
        'bank_owner_name' => 'מספר חשבון',
        'other_owner_type' => 'סוג בעל חשבון אחר',
        'is_activist_bank_owner' => 'מספר חשבון על שם הפעיל',
        'verify_bank_document_key' => 'מסמך אימות חשבון',
        'is_bank_verified' => 'אימות פרטי בנק'
    ],
    'VoterPhone' => [
        'phone_type_id' => 'סוג טלפון',
        'phone_number' => 'מספר טלפון',
        'voter_id' => 'תושב',
        "call_via_tm" => 'טלמרקטינג',
        "sms_status" => 'עדכון סטטוס הודעות',
        "sms" => 'sms',
        "wrong" => 'מספר שגוי'
    ],

    'Cluster' => [
        'leader_id' => 'ראש אשכול',
        'neighborhood_id' => 'שכונה',
        'prefix' => 'תחילית',
        'name' => 'שם',
    ],

    'HousholdCaptainOfFifty' => [
        'election_campaign_id' => 'מערכת בחירות',
        'household_id' => 'בית אב',
        'captain_id' => 'שר 100'
    ],

    'VoterCaptainFifty' => [
        'election_campaign_id' => 'מערכת בחירות',
        'voter_id' => 'תושב',
        'captain_id' => 'שר 100'
    ],

    'Message' => [
        'entity_type' => 'סוג היישות',
        'entity_id' => 'זיהוי היישות',
        'subject' => 'נושא ההודעה',
        'body' => 'גוף ההודעה',
        'type' => 'מקור ההודעה',
        'direction' => 'כיוון ההודעה'
    ],

    'ElectionRolesByVotersMessages' => [
        'election_role_by_voter_id' => 'פעיל',
        'direction' => 'כיוון',
        'text' => 'טקסט ההודעה',
        'phone_number' => 'מספר הטלפון',
        'verified_status' => 'סטטוס אימות'
    ],
    //!! To delete
    'ElectionRolesGeographical' => [
        'election_role_by_voter_id' => 'פעיל בחירות',
        'appointment_letter' => 'כתב מינוי',
        'sum' => 'סכום',
        'entity_type' => [
            'ballot' => 'סוג ישות קלפי',
            'cluster' => 'סוג ישות אשכול'
        ],
        'entity_id' => [
            'ballot' => 'קלפי',
            'cluster' => 'אשכול'
        ],
        'election_role_shift_id' => 'משמרת'
    ],
    'ActivistAllocationAssignment' => [
        'election_role_by_voter_id' => 'פעיל בחירות',
        'appointment_letter' => 'כתב מינוי',
        'sum' => 'סכום',
        'entity_type' => [
            'ballot' => 'סוג ישות קלפי',
            'cluster' => 'סוג ישות אשכול'
        ],
        'entity_id' => [
            'ballot' => 'קלפי',
            'cluster' => 'אשכול'
        ],
        'election_role_shift_id' => 'משמרת'
    ],

    'VoterMetas' => [
        'value' => 'ערך',
        'voter_meta_value_id' => 'ערך',
        'voter_meta_key_id' => 'מפתח',
        'election_campaign_id' => 'קמפיין'
    ],

    'VoterTransportation' => [
        'cripple' => 'האם נכה',
        'date' => 'תאריך ההסעה',
        "election_campaign_id" =>  'קמפיין',
        'voter_id' => 'תושב',
        'from_time' => 'הסעה משעה',
        'to_time' => 'הסעה עד שעה',
        'voter_driver_id' => 'שיבוץ נהג',
        'executed' => 'ביצוע הסעה',
    ],

    'VoterVotes' => [
        "election_campaign_id" =>  'קמפיין',
        "voter_id"             =>  'זיהוי תושב',
        "vote_date"            =>  'תאריך ההצבעה',
        "vote_source_id"       =>  'מקור הדיווח'
    ],

    'Action' => [
        'entity_type'              => [
            'voter' => 'פעולת תושב',
            'request' => 'פעולת פניה'
        ],
        'entity_id'                => [
            'voter' => 'תושב',
            'request' => 'פניה'
        ],
        'action_type'              => 'סוג הפעולה',
        'action_topic_id'          => 'נושא פעולה',
        'conversation_direction'   => 'כיוון שיחה',
        'conversation_with_other'  => 'שם האדם שעימו השיחה/פונה',
        'description'              => 'פירוט הפעולה',
        'action_status_id'         => 'זיהוי סטטוס הפעולה',
        'action_date'              => 'תאריך הפעולה'
    ],

    'InstituteRolesByVoters' => [
        'voter_id'           =>  'זיהוי תושב',
        'institute_id'       =>  'מוסד',
        'institute_role_id'  =>  'תפקיד'
    ],

    'VotersInGroups' => [
        "voter_id"        =>  'זיהוי מצביע',
        "voter_group_id"  =>  'זיהוי קבוצת תושבים'
    ],

    'CrmRequest' => [
        'date' => 'תאריך הפניה',
        'target_close_date' => 'תאריך יעד לסגירה',
        'request_priority_id' => 'עדיפות לפניה',
        'request_source_id' => 'מקור הפניה',
        'status_id' => 'סטטוס הפניה',
        'user_handler_id' => 'המטפל בפניה',
        'team_handler_id' => 'צוות מטפל',
        'user_create_id' => 'יוצר הפניה',
        'close_date' => 'תאריך סגירה',
        'topic_id' => 'נושא הפנייה',
        'sub_topic_id' => 'תת נושא הפנייה',
        'first_name' => 'שם פרטי',
        'last_name' => 'שם משפחה',
        'phone' => 'טלפון',
        'fax' => 'פקס',
        'email' => 'אימייל',
        'opened' => 'פתיחת הפנייה',
        'voter_satisfaction' => 'שביעות רצון הבוחר',
        'request_closure_reason_id' => 'סיבת סגירה',
        'request_source_email' => 'אימייל מקור פנייה',
        'request_source_fax' => 'מספר פקס מקור פניה',
        'request_source_phone' => 'מספר פלאפון מקור פניה',
        'request_source_first_name' => 'שם פרטי מקור פניה',
        'request_source_last_name' => 'שם משפחה מקור פניה',
        'request_source_name' => 'שם מסמך מקור פנייה',
        'new_callBiz_ID' => 'מספר פניית טלפניה',
        'new_callBiz_datetime' => 'זמן פניית טלפניה',
        'new_callBiz_details' => 'פרטי פניית טלפניה',
    ],

    'CrmRequestCallBiz' => [
        'request_id' => 'פניה',
        'callbiz_id' => '',
        'user_create_id' => 'מזהה פניה חיצוני',
        'date' => 'תאריך הקבלת הפניה',
        'details' => 'פירוט פניה חיצונית'
    ],

    "PhoneTypes" => [
        'name' => 'שם סוג טלפון'
    ],

    "Streets" => [
        'name' => 'שם רחוב',
        'city_id' => 'עיר',
        'mi_id' => 'מספר רחוב במשרד הפנים'
    ],

    "Neighborhood" => [
        'name' => 'שם שכונה',
        'city_id' => 'עיר'
    ],

    "Area" => [
        'name' => 'שם אזור'
    ],

    "SubArea" => [
        'name' => 'שם תת אזור',
        'area_id' => 'שם אזור'
    ],

    "City" => [
        'name' => 'שם עיר',
        'mi_id' => 'קוד עיר',
        'area_id' => 'אזור עיר',
        'sub_area_id' => 'תת אזור',
        'headquarters_phone_number' => 'מספר טלפון של המטה בעיר',
        'assign_leader_phone_number' => 'מספר טלפון אחראי שיבוץ',
        'team_id' => 'צוות מטה העיר',
        'crm_team_id' => 'צוות פניות ציבור עירוני',
    ],

    "Country" => [
        'name' => 'שם מדינה'
    ],

    "Languages" => [
        'name' => 'שם שפה',
        'main' => 'שפה ראשית'
    ],

    "CityDepartments" => [
        'name' => 'שם תיק'
    ],

    "RequestStatus" => [
        'name' => 'שם סטטוס',
        'type_id' => 'סוג סטטוס',
        'order' => 'סדר תצוגה'
    ],

    "ActionType" => [
        'name' => 'סוג פעולה',
        'entity_type' => 'סוג הישות'
    ],

    "ActionTopic" => [
        'name' => 'נושא הפעולה',
        'action_type_id' => 'סוג פעולה',
        'active' => 'האם פעיל'
    ],

    "RequestTopic" => [
        'name' => 'נושא פניה',
        'topic_order' => 'סדר הצגה',
        'active' => 'האם פעיל',
        'target_close_days' => 'ימים לסגירה',
        'default_request_status_id' => 'סטטוס פניה',
        'parent_id' => 'הנושא עבור התת נושא',
        // 'team_handler_id' => 'צוות מטפל',
        // 'user_handler_id' => 'משתשמש מטפל',
    ],

    "RequestClosureReason" => [
        'name' => 'סיבת סגירת פניה'
    ],

    "ElectionCampaignPartyLists" => [
        'name' => 'שם מפלגה',
        'letters' => 'אותיות הרשימה',
        'shas' => 'האם הרשימה של מפלגת ש"ס'
    ],

    "VoterGroups" => [
        'name' => 'שם קבוצה',
        'parent_id' => 'אב הקבוצה',
        'group_order' => 'מיקום הבן בקבוצת האב' , 
		'permission_type' => 'סוג הרשאה'
    ],

    "Institutes" => [
        'name' => 'שם המוסד',
        'institute_type_id' => 'סוג המוסד',
        'institute_network_id' => 'רשת המוסד ',
        'city_id' => 'עיר המוסד'
    ],

    "InstituteGroups" => [
        'name' => 'שם קבוצה',
    ],

    "InstituteNetworks" => [
        'name' => 'שם רשת מוסד'
    ],

    "InstituteRoles" => [
        'name' => 'תפקיד במוסד',
        'institute_type_id' => 'סוג מוסד'
    ],

    "ShasRepresentativeRoles" => [
        'name' => 'תפקיד'
    ],
    "ReligiousCouncilRoles" => [
        'name' => 'תפקיד'
    ],
    "CityShasRoles" => [
        'name' => 'תפקיד'
    ],

    "VoterMetaKeys" => [
        'key_type' => 'סוג הנתון',
        'key_name' => 'שם הנתון',
        'per_campaign' => 'משתנה בין קמפיינים של בחירות',
        'protected' => 'האם מוגן ממחיקה',
        'max' => [
            0 => null,
            1 => 'אורך תווים מקסימלי',
            2 => 'מספר מקסימלי'
        ]
    ],

    "VoterMetaValues" => [
        'voter_meta_key_id' => 'מספר שדה',
        'value' => 'ערך'
    ],

    "SupportStatus" => [
        'name' => 'מצב תמיכה',
        'level' => 'רמת תמיכה'
    ],

    "Ethnic" => [
        'name' => 'עדה',
        'sephardi' => 'האם ספרדי ?'
    ],

    "ReligiousGroup" => [
        'name' => 'זרם',
    ],    

    "VoterTitle" => [
        'name' => 'תואר תושב'
    ],

    "VoterEndings" => [
        'name' => 'סיומת תושב'
    ],

    "CsvSource" => [
        'name' => 'מקור נתונים'
    ],

    "UserRoles" => [
        'name' => 'שם תפקיד',
        'module_id' => 'מודול',
        'permission_group_id' => 'קבוצת הרשאה', // Not in use!
        'team_leader' => 'האם תפקיד של ראש צוות'
    ],

    "Teams" => [
        'name' => 'שם קבוצה',
        'leader_id' => 'ראש צוות',
        'viewable' => 'האם אפשר לראות את הצוות'
    ],

    "FileGroups" => [
        'name' => 'שם קבוצה'
    ],

    "ModulesInFileGroups" => [
        'file_group_id' => 'קבוצת קבצים',
        'module_id' => 'מודול'
    ],

    "Files" => [
        'file_group_id' => 'קבוצת קבצים',
        'file_name' => 'שם הקובץ בשרת',
        'name' => 'שם הקובץ בתצוגה',
        'type' => 'סוג הקובץ',
        'size' => 'גודל הקובץ'
    ],

    "User" => [
        'work_house' => 'מספר בית מקום העבודה',
        'work_house_entry' => 'מספר כניסת מקום העבודה לבית',
        'work_flat' => 'מספר דירה של מקום העבודה',
        'work_neighborhood' => 'שכונת מקום העבודה',
        'email' => 'אימייל עבודה',
        'active' => 'האם פעיל',
        'admin' => 'האם משתמש-על',
        'two_step_authentication' => 'אימות דו שלבי למשתמש',
        'work_city_id' => 'עיר מקום העבודה',
        'work_street_id' => 'רחוב  מקום העבודה',
    ],

    "UserPhones" => [
        'user_id' => 'משתמש',
        'phone_type_id' => 'סוג טלפון',
        'phone_number' => 'מספר טלפון',
        'voter_phone_id'=>'טלפון לבוחר'
    ],

    "RolesByUsers" => [
        'user_id' => 'משתמש',
        'user_role_id' => 'תפקיד',
        'team_id' => 'צוות',
        'team_department_id' => 'מחלקה של הצוות',
        'from_date' => 'תאריך התחלת תפקיד',
        'to_date' => 'תאריך סיום תפקיד',
        'main' => 'האם תפקיד עיקרי'
    ],

    "GeographicFilters" => [
        "name" => 'שם המיקוד',
        "user_id" => 'משתמש',
        "role_by_user_id" => 'תפקיד',
        "entity_type" => 'סוג היישות',
        "entity_id" => 'זיהוי היישות',
        "inherited_id" => 'המיקוד היורש'
    ],

    "MunicipalElectionMayorCandidates" => [
        'favorite' => 'האם מועדף',
        'voter_phone_id' => 'טלפון לבוחר',
        'election_campaign_id' => 'קמפיין בחירות',
        'city_id' => 'עיר',
        'voter_id' => 'תושב',
        'municipal_election_party_id' => 'מפלגה שמטעמה המתמודד רץ',
        'shas' => 'האם נציג ש"ס'
    ],

    "MunicipalElectionCouncilCandidates" => [
        'order' => 'סדר מועמדים',
        'voter_phone_id' => 'טלפון לבוחר',
        'election_campaign_id' => 'קמפיין בחירות',
        'city_id' => 'עיר',
        'voter_id' => 'תושב',
        'municipal_election_party_id' => 'מפלגה שמטעמה המתמודד רץ',
        'shas' => 'האם נציג ש"ס',
        'role_end' => 'תאריך סיום תפקיד'
    ],

    "MunicipalElectionParties" => [
        'city_id' => 'עיר',
        'election_campaign_id' => 'קמפיין בחירות',
        'name' => 'שם המפלגה',
        'letters' => 'אותיות המפלגה',
        'shas' => 'האם שייך לש"ס'
    ],

    "MunicipalElectionCities" => [
        'city_id' => 'עיר',
        'election_campaign_id' => 'קמפיין בחירות',
        'municipal_election_party_id' => 'מפלגה שמטעמה המתמודד רץ',
        'election_threshold' => 'אחז חסימה',
        'seats' => 'מנדט',
        'questionnaire_initial_message' => 'הודעה לשאלון בקמפיין טלפוניה'
    ],

    "CityRolesByVoters" => [
        'role_type' => 'סוג תפקיד',
        'city_id' => 'עיר',
        'voter_id' => 'תושב',
        'city_department_id' => 'תיק עיר',
        'municipal_election_party_id' => 'מפלגה שמטעמה המתמודד רץ',
        'shas' => 'האם שייך לש"ס',
        'council_number' => 'מספר מועמד במועצת העיר',
        'term_of_office' => 'מספר קדנציה',
        'role_start' => 'תאריך התחלת תפקיד',
        'role_end' => 'תאריך סיום תפקיד'
    ],

    "CityCouncilMembers" => [
        'order' => 'סדר החברים בעיר',
        'city_id' => 'עיר',
        'voter_id' => 'תושב',
        'city_department_id' => 'תיק עיר',
        'municipal_election_party_id' => 'מפלגה שמטעמה המתמודד רץ',
        'shas' => 'האם שייך לש"ס',
        'council_number' => 'מספר מועמד במועצת העיר',
        'term_of_office' => 'מספר קדנציה',
        'role_start' => 'תאריך התחלת תפקיד',
        'role_end' => 'תאריך סיום תפקיד'
    ],

    "ReligiousCouncilMembers" => [
        'city_id' => 'עיר',
        'voter_id' => 'תושב',
        'religious_council_role_id' => 'תפקיד חבר מועצה דתית',
        'voter_phone_id' => 'טלפון לבוחר',
        'shas' => 'האם נציג ש"ס',
        'role_start' => 'תאריך התחלת תפקיד',
        'role_end' => 'תאריך סיום תפקיד'
    ],

    "CityShasRolesByVoters" => [
        'city_id' => 'עיר',
        'voter_id' => 'תושב',
        'city_shas_role_id' => 'תפקיד ש"ס בעיר',
        'voter_phone_id' => 'טלפון לבוחר',
        'council_number' => 'מספר מועמד במועצת העיר',
        'role_start' => 'תאריך התחלת תפקיד',
        'role_end' => 'תאריך סיום תפקיד'
    ],

    "CityBudgetActivistExpectedExpenses" => [
        'city_budget_id' => 'תקציב עיר',
        'activist_count' => 'כמות פעילים צפויה',
        'activist_salary' => 'עלות צפויה לפעיל'
    ],

    "TeamDepartments" => [
        'name' => 'שם המחלקה'
    ],

    "HouseholdSupportStatusChanges" => [
        'name' => 'שם עבודה',
        'election_campaign_id' => 'קמפיין בחירות',
        'geographic_entity_type' => 'סוג היישות הגיאוגרפית',
        'geographic_entity_id' => 'הישות הגיאוגרפית',
        'household_voters_inclusion_type' => 'הכללת בתי אב שבהם תושבים',
        'household_voters_inclusion_limit' => 'כמות תושבים מוגבלת לפי תנאי',
        'household_voters_inclusion_support_status_ids' => 'סטטוסי תמיכה',
        'household_voters_inclusion_support_status_type' => 'סוג סטטוס תמיכה',
        'voters_inclusion_support_status_ids' => 'סטטוסי תמיכה',
        'selected_support_status_id' => 'סטטוס תמיכה לשינוי',
        'change_status' => 'סטטוס מצב השינוי',
        'geographic_households_count' => 'כמות בתי האב באזור הגיאוגרפי',
        'geographic_voters_count' => 'כמות הבוחרים באזור הגאוגרפי ',
        'selected_households_count' => 'כמות בתי האב שנבחרו',
        'selected_voters_count' => 'כמות תושבים שיועדו לשינוי',
        'updated_voters_count' => 'כמות תושבים שעודכנו'
    ],

    "CsvFiles" => [
        'type' => 'סוג הקובץ',
        'name' => 'שם תצוגתי של הקובץ',
        'file_name' => 'שם הקובץ במערכת',
        'file_size' => 'גודל הקובץ',
        'row_count' => 'כמות השורות בקובץ',
        'current_row' => 'השורה הנוכחית בקובץ',
        'header' => 'האם לקובץ יש שורת כותרת',
        'status' => 'סטטוס העבודה על הקובץ',
        'csv_source_id' => 'מקור הנתונים',
        'captain_id' => 'שר מאה',
        'delete_duplicate_phones' => 'האם למחוק טלפונים כפולים',
        'update_household_address' => 'האם לעדכן בית אב',
        'support_status_id' => 'סטטוס תמיכה לעדכון',
        'support_status_update_type' => 'סוג עדכון סטטוס',
        'previous_support_status_id' => 'ערך הסטטוס הקודם שאם קיים לבוחר',
        'update_household_support_status' => 'האם לעדכן סטטוס תמיכה לכל בית האב',
        'update_support_status_if_exists' => 'עדכן סטטוס תמיכה אם קיים',
        'institute_id' => 'מוסד',
        'institute_role_id' => 'תפקיד למוסד',
        'institute_categorization_id' => 'סיווג לתפקיד במוסד',
        'voter_group_id' => 'קבוצת ש"ס',
        'ethnic_group_id' => 'עדה',
        'religious_group_id' => 'זרם',
        'gender' => 'מין',
        'strictly_orthodox' => 'האם חרדי',
        'error_type' => 'סוג שגיאה'
    ],

    "Votes" => [
        'voter_id' => 'תושב',
        'election_campaign_id' => 'קמפיין בחירות',
        'vote_date' => 'תאריך ההצבעה',
        'vote_source_id' => 'מקור הדיווח'
    ],

    'ElectionCampaigns' => [
        'type' => 'סוג מערכת הבחירות',
        'name' => 'שם מערכת בחירות',
        'start_date' => '',
        'end_date' => '',
        'vote_start_time' => '',
        'vote_end_time' => ''
    ],

    'VoterBooks' => [
        'election_campaign_id' => 'קמפיין בחירות',
        'name' => 'שם תצוגתי של הקובץ',
        'file_name' => 'שם הקובץ'
    ],

    'BudgetFiles' => [
        'election_campaign_id' => 'קמפיין בחירות',
        'name' => 'שם תצוגתי של הקובץ',
        'file_name' => 'שם הקובץ'
    ] , 
	
	'Campaign' => [
		'general_election' => 'סוג קמפיין' , 
		'name' => 'שם קמפיין' , 
		'scheduled_start_date' => 'ת. התחלה מתוכנן' , 
		'scheduled_end_date' => 'ת. סיום מתוכנן' ,
		'description' => 'תיאור' 
	] , 
	
	'CampaignPortions' => [
		'name'=>'שם מנה',
		'items' => 'פריטי פילטר'
	] , 
	
	'CampaignQst' => [
		'name'=>'שם',
		'description' => 'תיאור כללי'
	] ,
	'CampaignWorkers' => [
		'user_email' => 'אימייל',
		'languages' => 'שפות',
		'home_phone' => 'טלפון בית',
		'mobile_phone' => 'טלפון נייד',
	]
];