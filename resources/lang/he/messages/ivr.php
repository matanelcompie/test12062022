<?php

use App\Enums\MessageTemplate;

return [
    MessageTemplate::VERIFICATION_MESSAGE_TEXT => 'שָׁלוֹם [first_name], שֻׁבַּצְתָּ לְתַּפְקִיד [role_name] כֶּפָּעִיל בְּחִירוֹת. - יֵשׁ לְהָשִׁיב 1 לְאִשּׁוּר, אוֹ 2 לְהַסָּרָה',
    MessageTemplate::USER_HANDLER_CREATE_REQUEST => 'שלום [first_name] [last_name], פניה חדשה הוקמה במערכת פניות הציבור של שס בנושא [request_topic_name]  והועברה לטיפולך, אנא כנס בהקדם למערכת לצורך המשך טיפול. פנייה מספר [request_key].',
    MessageTemplate::CLOSE_CRM_REQUEST => 'שלום [first_name] [last_name], פניה מס [request_key]  שנפתחה עבור [full_name_voter_request] נסגרה עקב [request_closure_reason].',
    MessageTemplate::CANCRL_CRM_REQUEST => 'שלום [first_name] [last_name], פניה מס [request_key]  שנפתחה עבור [full_name_voter_request] בוטלה . סיבת ביטול: [request_cancel_reason].',
];
