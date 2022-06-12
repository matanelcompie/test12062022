<?php

use App\Enums\MessageTemplate;

return [
    MessageTemplate::VERIFICATION_MESSAGE_TEXT => 'שלום [first_name], שובצת לתפקיד [role_name] כפעיל בחירות. יש להשיב כן לאישור, או לא להסרה',
    MessageTemplate::USER_HANDLER_CREATE_REQUEST => 'שלום [first_name] [last_name], פניה חדשה הוקמה במערכת פניות הציבור של שס בנושא [request_topic_name]  והועברה לטיפולך, אנא כנס בהקדם למערכת לצורך המשך טיפול. פנייה מספר [request_key]. ',
    MessageTemplate::USER_HANDLER_CREATE_REQUEST => 'שלום [first_name] [last_name], פניה חדשה הוקמה במערכת פניות הציבור של שס בנושא [request_topic_name]  והועברה לטיפולך, אנא כנס בהקדם למערכת לצורך המשך טיפול. פנייה מספר [request_key]. ',
    MessageTemplate::CLOSE_CRM_REQUEST_SUBJECT => 'סגירת פניה שמספרה [request_key]',
    MessageTemplate::USER_HANDLER_CREATE_REQUEST_SUBJECT => 'פניה חדשה הועברה לטיפולך , [request_key]',
    MessageTemplate::VOTER_MESSAGE_ON_CREATE_REQUEST_SUBJECT => 'פניה חדשה נוצרה עבורך , [requestKey]',
    MessageTemplate::CLOSE_CRM_REQUEST => 'שלום [first_name] [last_name], פניה מספר [request_key]  שנפתחה עבור [full_name_voter_request] נסגרה . סיבת הסגירה: [request_closure_reason].',
    MessageTemplate::CANCRL_CRM_REQUEST => 'שלום [first_name] [last_name], פניה מספר [request_key]  שנפתחה עבור [full_name_voter_request] בוטלה . סיבת ביטול: [request_cancel_reason].',
    MessageTemplate::REQUEST_VOTER_MESSAGE_CLOSE_REQUEST =>
    'בס"ד <br/> שלום רב,
    הננו להודיעך כי הטיפול בפנייתך מספר  [request_key] למפלגת ש"ס הסתיים.
    נא לציין מספר זה בכל פניה חוזרת.

    נושא הפנייה: [request_topic] , [request_topic_sub]
    <br/><br/>

    בברכה, 
    הלשכה הארצית לפניות הציבור
    מפלגת ש"ס
    טלפון לפניות הציבור 1-800-888-444
    ',
    MessageTemplate::VOTER_MESSAGE_ON_CREATE_REQUEST=>'בס"ד <br/> שלום רב,
    בהמשך פנייתך לצוות [teamTitle],
                                נפתחה פניית שרות מספר [requestKey] והיא בטיפול.
                                נא לציין מספר זה בכל פניה חוזרת.

                                נושא הפנייה: [topicName] , [subTopicName]
                                אנו נעמוד עמך בקשר ונעדכן על התקדמות הטיפול.
                                <br/>
                                בברכה, 
                                [teamSignature]
                                <br/>
                                טלפון לפניות הציבור [teamPhoneNumber]
                                       '

];
