module.exports = {
    combineBy: [
        { key: 0, name: 'no_combine', label: 'ללא סיכום', allowCombineColumns: false },
        { key: 1, name: 'areas', label: 'אזור', allowCombineColumns: true },
        { key: 2, name: 'mi_cities', label: 'עיר', allowCombineColumns: true },
        { key: 210, name: 'neighborhoods', label: 'שכונה', allowCombineColumns: true },
        { key: 3, name: 'clusters', label: 'אשכול', allowCombineColumns: true },
        { key: 4, name: 'ballot_boxes', label: 'קלפי', allowCombineColumns: true },
        { key: 211, name: 'mi_streets', label: 'רחוב מ"פ', allowCombineColumns: true },
        { key: 5, name: 'cities', label: 'עיר בפועל', allowCombineColumns: true },
        { key: 6, name: 'actual_streets', label: 'רחוב בפועל', allowCombineColumns: true },
        { key: 7, name: 'actual_address_correct', label: 'כתובת מאומתת', allowCombineColumns: true },
        { key: 8, name: 'support_status_election', label: 'סטטוס סניף', allowCombineColumns: false },
        { key: 9, name: 'support_status_tm', label: 'סטטוס טלמרקטינג', allowCombineColumns: false },
        { key: 10, name: 'support_status_final', label: 'סטטוס סופי', allowCombineColumns: false },
        { key: 11, name: 'captains_of_fifty', label: 'שר מאה', allowCombineColumns: true },
        { key: 12, name: 'institution_name', label: 'מוסד ש"ס' },
        { key: 28, name: 'voter_shas_group', label: 'קבוצות ש"ס' , allowCombineColumns: true},
		{ key: 13, name: 'age', label: 'גיל' , allowCombineColumns: true},
        { key: 14, name: 'birth_year', label: 'שנת לידה', allowCombineColumns: true },
        { key: 15, name: 'origin_country', label: 'ארץ לידה', allowCombineColumns: true },
        { key: 16, name: 'ethnic_group', label: 'עדה', allowCombineColumns: true },
        { key: 16, name: 'religious_group', label: 'זרם', allowCombineColumns: true },
        { key: 17, name: 'sephardi', label: 'ספרדי', allowCombineColumns: true },
		{ key: 171, name: 'voted_in_last_campaign', label: 'הצביע בבחירות אחרונות' , allowCombineColumns: true},
        { key: 18, name: 'election_roles', label: 'תפקיד ביום בחירות', allowCombineColumns: true },
        { key: 19, name: 'exist_in_election_campaign', label: 'קיים בפנקס בוחרים', allowCombineColumns: true },
        { key: 20, name: 'new_voters', label: 'בוחר חדש', allowCombineColumns: true },
        { key: 20, name: 'willing_volunteer', label: 'נתוני התנדבות', allowCombineColumns: true },
        { key: 21, name: 'orthodox_ballot_boxes', label: 'מצביע בקלפי חרדי', allowCombineColumns: true },
        { key: 22, name: 'previous_knesset_support_status_final', label: 'סטטוס תמיכה סופי בבחירות לכנסת קודמת', allowCombineColumns: false },
        { key: 23, name: 'previous_municipal_support_status_final', label: 'סטטוס תמיכה סופי בבחירות לרשויות קודמת', allowCombineColumns: false },
        { key: 24, name: 'previous_knesset_vote_status', label: 'סימון הצבעה בבחירות לכנסת קודמת', allowCombineColumns: true },
        { key: 25, name: 'previous_municipal_vote_status', label: 'סימון הצבעה בבחירות לרשויות קודמת', allowCombineColumns: true },
        { key: 26, name: 'current_knesset_vote_status', label: 'סימון הצבעה במערכת בחירות הנוכחית', allowCombineColumns: true },
        { key: 27, name: 'previous_knesset_vote_time', label: 'שעת הצבעה בבחירות לכנסת קודמת', allowCombineColumns: true },
        { key: 28, name: 'previous_municipal_vote_time', label: 'שעת הצבעה בבחירות לרשויות קודמת', allowCombineColumns: true }
    ],
    combineColumns: [
        { key: 0, name: 'none', label: 'ללא עמודות סיכום' },
        { key: 1, name: 'support_status_election', label: 'סטטוס תמיכה סניף' },
        { key: 2, name: 'support_status_tm', label: 'סטטוס תמיכה TM' },
        { key: 3, name: 'support_status_final', label: 'סטטוס תמיכה סופי' },

        { key: 4, name: 'previous_knesset_support_status_election', label: 'סטטוס תמיכה סניף מכנסת קודמת' },
        { key: 5, name: 'previous_municipal_support_status_election', label: 'סטטוס תמיכה סניף מרשויות קודמת' },

        { key: 6, name: 'previous_knesset_support_status_tm', label: 'סטטוס תמיכה TM מכנסת קודמת' },
        { key: 7, name: 'previous_municipal_support_status_tm', label: 'סטטוס תמיכה TM מרשויות קודמת' },

        { key: 8, name: 'previous_knesset_support_status_final', label: 'סטטוס תמיכה סופי מכנסת קודמת' },
        { key: 9, name: 'previous_municipal_support_status_final', label: 'סטטוס תמיכה סופי מרשויות קודמת' }
    ],
    displayColumns: {
        defaultSelected: {
            voter_key: { name: 'voter_key', label: 'זיהוי בוחר', sortNumber: '', sortDirection: '', displayOrder: 0, perElectionCampaign: false },
            last_name: { name: 'last_name', label: 'שם משפחה', sortNumber: 1, sortDirection: 'asc', displayOrder: 1, perElectionCampaign: false },
            first_name: { name: 'first_name', label: 'שם פרטי', sortNumber: '', sortDirection: '', displayOrder: 2, perElectionCampaign: false },
            mi_full_address: { name: 'mi_full_address', label: "כתובת מלאה [מ''פ]", sortNumber: 2, sortDirection: 'asc', displayOrder: 3, perElectionCampaign: false },
            main_phone: { name: 'main_phone', label: 'טלפון ראשי', sortNumber: '', sortDirection: '', displayOrder: 4 , perElectionCampaign: false},
            main_phone_2: { name: 'main_phone_2', label: 'טלפון נוסף', sortNumber: '', sortDirection: '', displayOrder: 5, perElectionCampaign: false },
            email: { name: 'email', label: 'דוא"ל', sortNumber: '', sortDirection: '', displayOrder: 6, perElectionCampaign: false },
            current_support_status_election: { name: 'current_support_status_election', label: 'סטטוס סניף', sortNumber: '', sortDirection: '', displayOrder: 7, perElectionCampaign: false },
        },
        options: [
            {
                key: 1,
                name: "פרטים אישיים",
                columns: [
                    { name: "voter_key", label: "זיהוי בוחר", perElectionCampaign: false },
                    { name: "full_name", label: "שם מלא", perElectionCampaign: false },
                    { name: "last_name", label: "שם משפחה", perElectionCampaign: false },
                    { name: "first_name", label: "שם פרטי", perElectionCampaign: false },
                    { name: "personal_id", label: "ת.ז", perElectionCampaign: false },
                    { name: "previous_name", label: "שם קודם", perElectionCampaign: false },
                    { name: "age", label: "גיל", perElectionCampaign: false },
                    { name: "birth_year", label: "תאריך לידה", perElectionCampaign: false },
                    { name: "gender", label: "מגדר", perElectionCampaign: false },
                    { name: "origin_country", label: "ארץ לידה", perElectionCampaign: false },
                    { name: "ethnic", label: "עדה", perElectionCampaign: false },
                    { name: "religious_group", label: "זרם", perElectionCampaign: false },
                    { name: "sephardi", label: "ספרדי", perElectionCampaign: false },
                    //{ name: "strictly_orthodox", label: "חרדי", perElectionCampaign: false },
                    { name: "father_name", label: "שם האב", perElectionCampaign: false },
                    { name: "title", label: "תואר", perElectionCampaign: false },
                    { name: "ending", label: "סיומת", perElectionCampaign: false },
                ]
            }, {
                key: 2,
                name: "כתובת בפועל",
                columns: [
                    { name: "full_address", label: "כתובת מלאה", perElectionCampaign: false },
                    { name: "mi_city_id", label: "קוד עיר", perElectionCampaign: false },
                    { name: "city", label: "עיר", perElectionCampaign: false },
                    { name: "neighborhood", label: "שכונה", perElectionCampaign: false },
                    { name: "mi_street_id", label: "קוד רחוב", perElectionCampaign: false },
                    { name: "street", label: "רחוב", perElectionCampaign: false },
                    { name: "house", label: "בית", perElectionCampaign: false },
                    { name: "house_entry", label: "כניסה", perElectionCampaign: false },
                    { name: "flat", label: "דירה", perElectionCampaign: false },
                    { name: "zip", label: "מיקוד", perElectionCampaign: false },
                    { name: "distribution_code", label: "קוד חלוקה", perElectionCampaign: false },
                    { name: "actual_address_correct", label: "כתובת מאומתת", perElectionCampaign: false },
                    { name: "mi_address_similar_to_real", label: "זהות לכ. מ''פ", perElectionCampaign: false },
                ]
            }, {
                key: 3,
                name: "כתובת משרד הפנים",
                columns: [
                    { name: "mi_full_address", label: "כתובת מלאה [מ''פ]", perElectionCampaign: false },
                    { name: "mi_city_id", label: "קוד עיר [מ''פ]", perElectionCampaign: false },
                    { name: "mi_city", label: "עיר [מ''פ]", perElectionCampaign: false },
                    { name: "mi_neighborhood", label: "שכונה [מ''פ]", perElectionCampaign: false },
                    { name: "mi_street_id", label: "קוד רחוב [מ''פ]", perElectionCampaign: false },
                    { name: "mi_street", label: "רחוב [מ''פ]", perElectionCampaign: false },
                    { name: "mi_house", label: "בית [מ''פ]", perElectionCampaign: false },
                    { name: "mi_house_entry", label: "כניסה [מ''פ]", perElectionCampaign: false },
                    { name: "mi_flat", label: "דירה [מ''פ]", perElectionCampaign: false },
                    { name: "mi_zip", label: "מיקוד [מ''פ]", perElectionCampaign: false },
                    // { name: "", label: "קוד חלוקה [מ''פ]", perElectionCampaign: false },
                ]
            }, {
                key: 4,
                name: "פרטי קשר",
                columns: [
                    { name: "main_phone", label: "טלפון ראשי", perElectionCampaign: false },
                    { name: "main_phone_type", label: "סוג מספר טלפון ראשי", perElectionCampaign: false },
                    { name: "main_phone_2", label: "טלפון נוסף", perElectionCampaign: false },
                    { name: "main_phone_2_type", label: "סוג מספר טלפון נוסף", perElectionCampaign: false },
                    { name: "email", label: "דוא\"ל", perElectionCampaign: false },
                    // { name: "tm_block", label: "לא מאופשר TM", perElectionCampaign: false },
                    // { name: "sms_block", label: "לא מאופשר SMS", perElectionCampaign: false },
                ]
            }, {
                key: 5,
                name: "נתוני תמיכה מערכת נוכחית",
                columns: [
                    { name: "current_support_status_election", label: "סטטוס סניף", perElectionCampaign: false },
                    { name: "current_support_status_tm", label: "סטטוס TM", perElectionCampaign: false },
                    { name: "current_support_status_final", label: "סטטוס סופי", perElectionCampaign: false },
                ]
            }, {
                key: 6,
                name: "נתוני תמיכה מערכת קודמת",
                columns: [
                    { name: "previous_support_status_election", label: "סטטוס סניף", perElectionCampaign: true },
                    { name: "previous_support_status_tm", label: "סטטוס TM", perElectionCampaign: true },
                    { name: "previous_support_status_final", label: "סטטוס סופי", perElectionCampaign: true },
                ]
            }, {
                key: 7,
                name: "נתוני הצבעה מערכת נוכחית",
                columns: [
                    { name: "exists_in_current_election_campain_voters", label: "קיים בספר הבוחרים", perElectionCampaign: false },
                    { name: "current_election_vote", label: "הצביע", perElectionCampaign: false },
                    { name: "current_election_vote_time", label: "שעת הצבעה", perElectionCampaign: false },
                    { name: "current_election_ballot_box_city_id", label: "קוד עיר קלפי", perElectionCampaign: false },
                    { name: "current_election_ballot_box_city", label: "עיר קלפי", perElectionCampaign: false },
                    // { name: "current_election_cluster_id", label: "קוד אשכול" , perElectionCampaign:false},
                    { name: "current_election_cluster", label: "שם אשכול", perElectionCampaign: false },
                    { name: "current_election_cluster_address", label: "כתובת אשכול", perElectionCampaign: false },
                    { name: "current_election_ballot_box_id", label: "קוד קלפי", perElectionCampaign: false },
                    // { name: "current_election_ballot_box_address", label: "כתובת קלפי", perElectionCampaign: false },
                    { name: "current_election_voter_number", label: "מספר בוחר", perElectionCampaign: false },
                    { name: "current_election_new_voter", label: "בוחר חדש", perElectionCampaign: false },
                    { name: "current_transportation", label: "הסעה", perElectionCampaign: false },
                ]
            }, {
                key: 8,
                name: "נתוני הצבעה מערכת קודמת",
                columns: [
                    { name: "previous_election_vote", label: "הצביע", perElectionCampaign: true },
                    { name: "previous_election_vote_time", label: "שעת הצבעה", perElectionCampaign: true },
                    { name: "previous_election_ballot_box_city_id", label: "קוד עיר קלפי", perElectionCampaign: true },
                    { name: "previous_election_ballot_box_city", label: "עיר קלפי", perElectionCampaign: true },
                    // { name: "previous_election_cluster_id", label: "קוד אשכול" , perElectionCampaign:true},
                    { name: "previous_election_cluster", label: "שם אשכול", perElectionCampaign: true },
                    { name: "previous_election_cluster_address", label: "כתובת אשכול", perElectionCampaign: true },
                    { name: "previous_election_ballot_box_mi_id", label: "קוד קלפי", perElectionCampaign: true },
                    // { name: "previous_election_ballot_box_address", label: "כתובת קלפי", perElectionCampaign: true },
                    { name: "previous_election_voter_number", label: "מספר בוחר", perElectionCampaign: true },
                    { name: "previous_election_new_voter", label: "בוחר חדש", perElectionCampaign: true },
					{ name: "previous_transportation", label: "הסעה", perElectionCampaign: true },
                ]
            }, {
                key: 9,
                name: "מוסדות ש\"ס",
                columns: [
                    { name: "institute_name", label: "שם מוסד", perElectionCampaign: false },
                    { name: "institute_city", label: "עיר המוסד", perElectionCampaign: false },
                    { name: "institute_type", label: "סוג המוסד", perElectionCampaign: false },
                    { name: "institute_network", label: "רשת המוסד", perElectionCampaign: false },
                    { name: "institute_group", label: "קבוצת המוסד", perElectionCampaign: false },
                    { name: "institute_role", label: "תפקיד במוסד", perElectionCampaign: false },
                    { name: "voter_shas_group", label: "שייך לקבוצת שס", perElectionCampaign: false },
                ]
            }, {
                key: 10,
                name: "משתמש מערכת",
                columns: [
                    { name: "user_key", label: "קוד משתמש", perElectionCampaign: false },
                    { name: "creator_user", label: "משתמש יוצר", perElectionCampaign: false },
                    { name: "create_date", label: "תאריך יצירה", perElectionCampaign: false },
                    { name: "password_date", label: "תאריך סיסמא", perElectionCampaign: false },
                    { name: "is_admin", label: "אדמין", perElectionCampaign: false },
                    { name: "is_active", label: "פעיל", perElectionCampaign: false },
                    { name: "main_team", label: "שם צוות עיקרי", perElectionCampaign: false },
                    { name: "main_role", label: "שם תפקיד עיקרי", perElectionCampaign: false },
                ]
            }, {
                key: 11,
                name: "פעילות יום בחירות",
                columns: [
                    { name: "election_role", label: "תפקיד", perElectionCampaign: true },
                    { name: "election_role_create_date", label: "תאריך הגדרה", perElectionCampaign: true },
                    { name: "election_role_creator_user", label: "משתמש מגדיר", perElectionCampaign: true },
                    { name: "election_role_verified_status", label: "סטטוס אימות", perElectionCampaign: true },
                    { name: "election_role_phone_number", label: "טלפון אימות", perElectionCampaign: true },
                    { name: "election_role_willing_volunteer", label: "מוכן להתנדב", perElectionCampaign: true },
                    { name: "election_role_agree_sign", label: "מוכן לשלט", perElectionCampaign: true },
                    { name: "election_role_explanation_material", label: "חומר הסברה", perElectionCampaign: true },
                    { name: "election_role_captains_of_fifty_id", label: "ת.ז. שר מאה", perElectionCampaign: true },
                    { name: "election_role_captains_of_fifty_name", label: "שם שר מאה", perElectionCampaign: true },
                    { name: "election_role_captains_of_fifty_phone", label: "טלפון שר מאה", perElectionCampaign: true },
                    { name: "election_role_captains_of_fifty_city", label: "מטה שיבוץ שר מאה", perElectionCampaign: true },
                    { name: "driver_role_personal_identity", label: "ת.ז נהג משובץ", perElectionCampaign: true },
                    { name: "driver_role_full_name", label: "שם נהג משובץ", perElectionCampaign: true },
                    { name: "driver_role_phone_number", label: "טל' נהג משובץ", perElectionCampaign: true },
                    // { name: "election_role_ballot_box_representative_phone", label: "נייד של נציג קלפי", perElectionCampaign: true },
                    // { name: "election_role", label: "סוג נייד של נציג קלפי" , perElectionCampaign:false},
                ]
            }
            // , {
            //     key: 12,
            //     name: "נציגי ש\"ס",
            //     columns: [
            //         { name: "", label: "", perElectionCampaign: false },
            //     ]
            // }, {
            //     key: 13,
            //     name: "נתונים נוספים",
            //     columns: [
            //         { name: "", label: "", perElectionCampaign: false },
            //     ]
            // }
        ]
    }
};