module.exports = {
	TM: {
		CAMPAIGN: {
			STATUS: {
				SETUP: 0,
				READY: 1,
				ACTIVE: 2,
				SUSPENDED: 3,
				CLOSED: 4,
				CANCELED: 5
			},
			QUESTIONS: {
				TYPES: {
					RADIO: 1,
	    			MULTIPLE: 2,
	    			ONE_LINE_TEXT: 3,
	    			MULTIPLE_LINES_TEXT: 4,
	    			DATE: 5,
	    			TIME: 6,
	    			DATE_TIME: 7,
	    			MESSAGE: 8,
				},
				LENGTH: {
					NORMAL: 200,
					MESSAGE: 700,
				},
			},

		},
		CTI: {
			PERMISSION_TYPES: {
				TRUE_FALSE: 0,
				HIDE_READ_EDIT: 1,
				HIDE_READ_EDIT_DELETE: 2
			}
		} , 
		AGENT : {
			CALLING_STATUS : {
				BREAK : 1,
                WAITING : 2,
                CALL : 3,
			} , 
			CALL_END_STATUS : {
				SUCCESS_WITH_SUPPORT_STATUS:-2,
				SUCCESS_WITHOUT_SUPPORT_STATUS:-1,
				SUCCESS  : 0,
                GET_BACK : 1,
				LANGUAGE : 2,
				ANSWERING_MACHINE : 3,
				GOT_MARRIED : 4,
				CHANGED_ADDRESS : 5,
				FAX_TONE : 6,
				HANGED_UP : 7,
				WRONG_NUMBER : 8,
				NON_COOPERATIVE : 9,
				BUSY : 10,
				DISCONNECTED_NUMBER : 11,
				UNANSWERED : 12,
				ABANDONED : 13,
			}
		},
	}
}