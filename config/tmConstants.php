<?php

use App\Models\Tm\Campaign;
use App\Models\Tm\Question;

return [
	'MAX_RECORDS_FROM_DB' => 15,
	'agent' => [
		'callingStatus' => [
			'BREAK' => 1,
            'WAITING' => 2,
            'CALL' => 3,
		]
	]
	,
    'campaign' => [
        'statusNameToConst' => [
            'SETUP' => 0,
            'READY' => 1,
            'ACTIVE' => 2,
            'SUSPENDED' => 3,
            'CLOSED' => 4,
            'CANCELED' => 5
        ],
        'statusConst' => [
           0 => 'SETUP',
           1 => 'READY',
           2 => 'ACTIVE',
           3 => 'SUSPENDED',
           4 => 'CLOSED',
           5 => 'CANCELED'
        ],
        'statusHe' => [
            0 => 'בהקמה',
            1 => 'מוכן להפעלה',
            2 => 'פעיל',
            3 => 'מושהה',
            4 => 'סגור',
            5 => 'בוטל',
        ],
        'statusEn' => [
            'SETUP' => 'setup',
            'READY' => 'ready',
            'ACTIVE' => 'active',
            'SUSPENDED' => 'suspended',
            'CLOSED' => 'closed',
            'CANCELED' => 'canceled',
        ],
        'electionType' => [
        	Campaign::GENERAL 	=> 'כללי',
        	Campaign::LOCAL 	=> 'מקומי'
        ],

        'telephonyMode' => [
        	Campaign::MANUAL_MODE => 'ידני',
        	Campaign::PREDICTIVE_MODE => 'פרדיקטיבי'
        ],

        'returnCallNoAnswer' => [
        	Campaign::TIME_FOR_RECALL => 'הגדר תזמון שיחה חוזרת',
    		Campaign::NO_TIME_FOR_RECALL => 'ללא הגדרת תזמון שיחה חוזרת'
    	],

    	'actionCallNoAnswer' => [
		    Campaign::CALL_RETURN_TO_LINE => 'חוזרת לתור',
		    Campaign::CALL_OUT_OF_LINE => 'יוצאת מהתור'
        ],

        'messages' => [
            'FILE_DIRECTORY' => env('FILES_FOLDER', base_path() . '/files').'/campaigns/messages/',
            'types' => [
                'FILE' => 0,
                'LINK' => 1
            ],
        ],

        'employees' => [
            'module' => 'tm',
            'userRole' => 'teller'
        ],
    ],
    'question' => [
        'type' => [
            Question::TYPE_RADIO => 'בחירה יחידה',
            Question::TYPE_MULTIPLE => 'בחירה מרובה',
            Question::TYPE_ONE_LINE_TEXT => 'שורת טקסט',
            Question::TYPE_MULTIPLE_LINES_TEXT => 'פסקה',
            Question::TYPE_DATE => 'תאריך',
            Question::TYPE_TIME => 'שעה',
            Question::TYPE_DATE_TIME => 'תאריך ושעה',
            Question::TYPE_MESSAGE => 'מסר'
        ],
        'typeConst' => [
            Question::TYPE_ONE_LINE_TEXT => 'one_line',
            Question::TYPE_MULTIPLE_LINES_TEXT => 'multiple_lines',
            Question::TYPE_RADIO => 'radio',
            Question::TYPE_MULTIPLE => 'multiple',
            Question::TYPE_DATE => 'date',
            Question::TYPE_TIME => 'time',
            Question::TYPE_DATE_TIME => 'datetime',
            Question::TYPE_MESSAGE => 'message'
        ]
    ],
    'call' => [
        'status' => [
            'SUCCESS_WITH_SUPPORT_STATUS' => -2,
            'SUCCESS_WITHOUT_SUPPORT_STATUS' => -1,
            'SUCCESS' => 0,
            'GET_BACK' => 1,
            'LANGUAGE' => 2,
            'ANSWERING_MACHINE' => 3,
            'GOT_MARRIED' => 4,
            'CHANGED_ADDRESS' => 5,
            'FAX_TONE' => 6,
            'HANGED_UP' => 7,
            'WRONG_NUMBER' => 8,
            'NON_COOPERATIVE' => 9,
            'BUSY' => 10,
            'DISCONNECTED_NUMBER' => 11,
            'UNANSWERED' => 12,
            'ABANDONED' => 13
        ]
    ]
];