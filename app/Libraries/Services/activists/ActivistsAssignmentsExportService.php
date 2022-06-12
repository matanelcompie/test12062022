<?php

namespace App\Libraries\Services\activists;

use App\Http\Controllers\Tm\GlobalController;
use App\Libraries\Helper;
use App\Libraries\Services\ExportService;
use App\Libraries\Services\FileService;
use App\Libraries\Services\GeoFilterService;
use App\Libraries\Services\municipal\MunicipalElectionsRolesService;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistPaymentModels\ActivistRolesPayments;
use App\Models\AreasGroup;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\ElectionCampaignPartyLists;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\ElectionRolesByVoters;
use App\Models\ElectionRolesGeographical;
use App\Models\ElectionRoleShifts;
use App\Models\Streets;
use App\Models\VoterCaptainFifty;
use App\Models\VoterElectionCampaigns;
use App\Models\Voters;
use App\Models\VoterSupportStatus;
use App\Repositories\BallotBoxesRepository;
use App\Repositories\ElectionCampaignRepository;
use App\Repositories\ElectionRolesByVotersRepository;
use App\Repositories\RepositoryBallotBoxes;
use App\Repositories\RepositoryElectionRolesByVoters;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use PDFMerger;
use View;

/**
 * @class ActivistsAssignmentsExportService
 * Export activists service:
 * 1. Export activists appointments letters (Single,Multiple)
 * 2.  Export activists payment letters (Single,Multiple)
 * 3.  Export ballots activists csv file
 * 4.  Export clusters activists csv file
 * 5.  Export activists payments csv file
 * 
 */
class ActivistsAssignmentsExportService {
    /** Export activists payment texts: */
    private static $agreement_texts = [
        '1.	מסמך זה מהווה גם הודעה ע"פ חוק הודעה לעובד (תנאי עבודה).',
        '2.	התמורה הנ"ל תשולם לי בתוך 60 ימי עבודה מיום הבחירות לכנסת ה – 24.',
        '3.	ידוע לי ומוסכם עלי כי מפלגת שס נדרשת לבדוק ולאמת את זכאותי לשכר ואת שעות עבודתי ולכן ייתכן ויהיה עיכוב בתשלום שכרי. חתימתי על מסמך זה מהווה הסכמה מלאה לעיכוב ככל והוא יתרחש בשל כך. ',
        '4. השכר לעיל כולל את מלא הזכויות המגיעות לי ע"פ כל דין לרבות פדיון ימי חופשה וכל זכות אחרת המוקנה לי על פי דין וכי לא תהיה לי כל טענה או תביעה כנגד מפלגת שס ו/או מי מטעמה בעניין זה.',
        '5.	אשמור בסודיות מוחלטת על כל מידע שיגיע לידיעתי במסגרת תפקידי.',
        '6.	אשתתף בהדרכה לקראת העבודה ככל ואדרש לכך, אשמע לכל ההוראות שאקבל מהאחראיים מטעם מפלגת שס לרבות הוראות הנוגעות לשעות יציאה וכניסה והחלפת משמרות.',
        '7.	מפלגת שס אינה מתחייבת לספק דרכי הגעה או תחבורה למקום העבודה ולא מזון או שתייה וכי עלי לדאוג לעצמי בעניין זה וכי השכר הנקוב מעלה כולל עלויות אלו ככל ויהיו.',
        '8.	השכר הנקוב מעלה ישולם ע"י מפלגת שס אך ורק לי באמצעות העברה בנקאית לחשבון שלי בלבד וכי אני אעביר את פרטי החשבון מראש בצרוף מסמך מאמת. במידה ואין לי חשבון – אודיע על-כך למפלגת שס ואמציא את פרטי הבנק של קרוב משפחה מדרגה ראשונה עם צילום ת.ז. וספח. ולא תהיה לי כל טענה על כך שמפלגת שס העבירה את השכר לחשבון שמסרתי אעפ"י שאינו שלי.',
        '9.	ככל ולא אעביר את הפרטים במלואם המפלגה פטורה מלחפש אחר פרטיי והתשלום יבוצע  עד 60 יום מיום המצאת מלוא הפרטים על ידי.',
        '10. ככל וארעה תקלה טכנית אשר עיכבה את התשלום חלה עלי החובה להעביר פניה כתובה למפלגה בדבר התקלה, אי העברת פנייה כאמור משמעותה וויתור על טענה בדבר איחור ו/או אי תשלום.',
        '11. כן אני מצהיר, כי אני אזרח או תושב ישראלי, מחזיק תעודת זהות ישראלית ומורשה לעבוד בישראל. ',
        '12. הובהר לי מעל לכל ספק וידוע לי שהסכומים האמורים הינם ברוטו ומנוכה מהם 25% מס הכנסה במקור. השכר כולל שכר בסיס, דמי נסיעות וחופשה והבראה וכל זכות המוקנית בחוק מכל מין וסוג שהוא.',
        '13.	הובהר לי  כי מוטלת עלי החובה להעביר טופס זה למנהל מטה הבחירות לפני יום הבחירות והמפלגה אינה מחויבת להעביר תשלום למי שלא העביר טופס זה. כמו כן, הובהר לי  כי כל עיכוב בקבלת הטופס חתום והמסמכים הנלווים מכל סיבה שהיא גורר עיכוב בתשלום.',
        '14.	ידוע לי כי על שכר העבודה חל חוק מיסוי תשלומים בתקופת בחירות, התשנ"ו-1996.'
    ];
    /** Export activists payment texts: */
    private static $attache_texts = [
        '1.	מסמך זה מהווה חוזה עבודה רק לאחר קבלת כתב מינוי ממוחשב (לא ניתן לקבל תשלום על כתב מינוי ידני).',
        '2.	כן אני מצהיר אני מעל גיל 17 , כי אני אזרח או תושב ישראלי, מחזיק תעודת זהות ישראלית ומורשה לעבוד בישראל. ',
        '3.	ידוע לי כי עבודתי בקלפי היא מתוקף חוק הבחירות לכנסת. ואין ביני לבין מפלגת שס יחסי עובד מעביד.',
        '4.	אדווח על ההצבעות בפועל על פי הנחיות המפלגה ו/או בכלים הייעודיים שהמפלגה תעמיד לרשותי.',
        '5.	אנהל רישום ואדווח בכתב את שעות העבודה שעבדתי ו/או את זמן כניסתי ויציאתי מן הקלפי.',
        '6.	ארשם  בפרוטוקול הקלפי כנציג סיעת ש"ס, אדאג ששמי יופיע בפרוטוקול הקלפי במקום המתאים ולא אעזוב את מקום הקלפי עד לבואו של מחליף',
        '7.	 מוסכם כי שעות העבודה בקלפי יהיו כפי שנרשם  על ידי מזכיר הקלפי  בפרוטוקול הקלפי',
        '8.	כחבר ועדת קלפי בעת ספירת קולות אדאג  לחתום בפרוטוקול הקלפי על ספירת הקולות ולסמן V  במשבצת נוכחות בעת ספירת קולות. ',
        '9.	כיו"ר ועדת קלפי המלווה את החומר לוועדה האזורית (או חבר ועדה שמחליף את היו"ר בלווי לוועדה האזורית) אסמן  V גם במשבצת  המתאימה ואלווה את החומר לוועדה האזורית.',
        '10.	כחבר ועדת קלפי, מלבד הרישום בפרוטוקול של שעות העבודה, ספירת קולות ולווי הקלפי לוועדה האזורית אדאג לקבל אישור נוכחות ממזכיר הקלפי. ידוע לי כי באישור עלי להקפיד על רישום שעות הנכוחות לרבות ספירת קולות וליווי הקלפי לוועדה האזורית.  ידוע לי כי אישור זה הינו תנאי לקבלת התשלום.',
        '11.	אני מתחייב להיות נוכח בקלפי בכל השעות שהוקצו לי ולעשות את תפקידי כנדרש ממני. וכן כי לא אעזוב את הקלפי עד לבואו של מחליף עבורי.',
        '12.	ידוע לי שעזיבת הקלפי במהלך שעות העבודה בטרם בואו של המחליף או בטרם סיום ספירת קולות ובאם אכהן כיו"ר גם בטרם סיום ליווי הקלפי  לוועדת הבחירות האזורית מהווה הפקרה  מוחלטת של מקום הקלפי ובגין כך לא אהיה זכאי לשכר כלל עבור עבודתי ולא אוכל לתבוע את שכרי.',
        '13.	ידוע לי שאסור לי להירשם ו/או לעבוד במפלגה נוספת, גם לא בכל תפקיד אחר, ובאם אפעל כך לא אהיה זכאי לשכר.',
        '14.	ידוע לי כי טופס זה מהווה בקשה מטעמי ואינו מחייב את המפלגה למנות אותי לחבר בוועדת קלפי או למשקיף.',
        '15.	כתב המינוי שאקבל הינו אישי ואינו ניתן להעברה.',
        '16.	ידוע לי שאני זכאי לתשלום בגין עבודתי רק אם קיבלתי כתב מינוי ממוחשב ופעלתי בהתאם להנחיות הנ"ל',
        '17.	שעות המשמרת הראשונה – החל משעה 06:30 עד 16:00.',
        '18.	שעות המשמרת השנייה החל משעה 15:30 עד סיום ספירת הקולות ליו"ר קלפי עד סיום ליווי ומסירת הקלפי לוועדת הבחירות האזורית.',
        '19.	הובהר לי  כי חובה על העובד במשמרת שניה או העובד יום שלם להשתתף בספירת הקולות ועל היו"ר ללוות את הקלפי לוועדה האזורית.',
        '20.	אני מסכים וידוע לי  כי תשלום השכר יהיה לאחר אימות הנתונים בפרוטוקול הקלפי שהינו הליך ארוך ובירוקרטי ויתכן שהתשלום יבוצע עד ל-60 יום מיום הבחירות.',
    ];
    /** Export activists payment details: */
    private static $totalPaymentvoterDetials =[
        'personal_identity' , 'first_name' ,'last_name' ,'birth_date' ,'city' ,
         'street' ,'house' ,'phone_number' ,'election_role_name' ,'assigned_city_name' , 
        'bank_branch_number' , 'bank_branch_name' ,'bank_account_number','bank_owner_name' ,
         'other_owner_type', 'is_activist_bank_owner' ,'is_bank_verified'
    ];

    /**
     * @method getElectionActivistTotalPaymentView
     * Prepare total payment page.
     * 1. For export single payment page.
     * 2. For export all city payment page.
     * the sum without bonus payment
    */
    public static function getElectionActivistTotalPaymentView($electionRoleByVoterKey, $currentCampaign, $fromCityExport){

        $rolesSystemNames = config('constants.activists.election_role_system_names');
        $electionRoleByVoter=ElectionRolesByVotersRepository::getRoleVoterActivistIncludeBasicRolePaymendAndBankDetails($electionRoleByVoterKey,$currentCampaign->id);
        $totalSum = 0;
        $ballotRolesArray = [$rolesSystemNames['observer'], $rolesSystemNames['ballotMember'], $rolesSystemNames['counter']];

        if(!$electionRoleByVoter ){//|| count($electionRoleByVoter->activist_roles_payments)==0
            // echo '<h1>תפקיד לא קיים!</h1>';
            return '';
        }
        $bankNumbers = config('constants.bank_list');

        $bank_number = $electionRoleByVoter->bank_number;
        $bank_name = !empty($bankNumbers[$bank_number]) ? $bankNumbers[$bank_number] : $bank_number;
        $totalPaymentvoterDetials = self::$totalPaymentvoterDetials;
        $voterDetials = [
            'bank_name' => $bank_name,
        ];

        foreach($totalPaymentvoterDetials as $item){
            $voterDetials[$item] = $electionRoleByVoter->$item;
        }

        $ballots = '';
        $shifts = '';

        //new method 
        foreach ($electionRoleByVoter->activistRolesPayments as $rolePayment) {
            $totalSum += $rolePayment->sum;

            if($rolePayment->ballot_mi_id)
            $ballots .= ( $rolePayment->ballot_mi_id . '/ ');
            $shifts .= ( $rolePayment->election_role_shift_name . '/ ');
        }

        $voterDetials['from_city_export'] = $fromCityExport;
        $voterDetials['total_payment'] = $totalSum;
        $voterDetials['ballots'] = trim($ballots, '/ ');
        $voterDetials['shifts'] = trim($shifts, '/ ');
        $voterDetials['agreement_texts'] = self::$agreement_texts;
        $voterDetials['agreement_texts_bold'] = [
            '15.	קראתי את ההסכם בעיון והבנתי את תוכנו לרבות את תנאי התשלום, את הסך הסופי לתשלום הכולל את כל הרכיבים הקיימים בחוק ואת העובדה שאין בחתימתי על הסכם משום התחייבות להעסקתי.',
            '&nbsp;&nbsp; *   יש לצרף אישור על ניהול חשבון בנק או צילום שיק',
            '&nbsp;&nbsp; ** כל האמור במסמך זה בלשון יחיד ו/או בלשון זכר אף בלשון רבים ו/או לשון נקבה במשמע וכן להיפך.'
        ];
        $voterDetials['attache_texts'] = self::$attache_texts;


        $defaultView = "activists.ActivistTotalPayment";
        if ($currentCampaign->id != ElectionCampaigns::currentCampaign()->id) {
            if (View::exists('activists.LastPaymentLetters.ActivistTotalPayment' . $currentCampaign->id)) {
                $defaultView = 'activists.LastPaymentLetters.ActivistTotalPayment' . $currentCampaign->id;
            }
        }
        return view($defaultView, $voterDetials);

     }
     
    /** @method printElectionActivistTotalPaymentDoc:
     * Print single activist payment doc
     * Use for:
     * 1. Activit details screen.
     * 2. Activits screen (for multiple docs)
     * @return print pdf file.
    */
    public static function  printElectionActivistTotalPaymentDoc($electionRoleByVoterKey){
        $currentCampaign = ElectionCampaigns::currentCampaign();

        $view = self::getElectionActivistTotalPaymentView($electionRoleByVoterKey, $currentCampaign, false);
        $headerView = view("activists.ActivistTotalPaymentHeader");
        $footerView = view("activists.ActivistTotalPaymentFooter");
        return "$headerView $view $footerView";
    }
    /** @method printCityActivistsTotalPaymentLetter:
     * Print multiple activists payment docs
     * Use for:
     * 1. Activits screen.
     * @return print pdf file.
    */
    public static function  printCityActivistsTotalPaymentLetter($cityKey,$electionCampaignId=null){
  
        if(!$electionCampaignId)
        $currentCampaign = ElectionCampaigns::currentCampaign()->id;
        else
        $currentCampaign=ElectionCampaignRepository::getElectionById($electionCampaignId);

        $assignedCity = City::where('key', $cityKey)
        ->first();
        if(!$assignedCity){
            echo '<h1>עיר לא קיימת!</h1>'; return;
        }

        $allCityActivistElectionVotersKeys = ElectionRolesByVoters::select('key')
        ->where('assigned_city_id', $assignedCity->id)
        ->where('election_campaign_id', $currentCampaign->id)
       
        ->get();

   
        Log::info($allCityActivistElectionVotersKeys);
        $lettersFullView = '';
        foreach ($allCityActivistElectionVotersKeys as $electionRoleVoter){
            $currentElectionVoterView = self::getElectionActivistTotalPaymentView($electionRoleVoter->key, $currentCampaign, true);
            $lettersFullView .= $currentElectionVoterView;
        }
        $headerView = view("activists.ActivistTotalPaymentHeader");
        $footerView = view("activists.ActivistTotalPaymentFooter");
        return "$headerView $lettersFullView $footerView";
    }
    /**
     * @method exportActivists
     * Export Ballots activists csv file
     * Use for:
     * 1. Activits screen. 
     * 2. City activists screen
     * 3. Cluster activists screen
     * @return Export csv file
     * 
    */
    public static function exportActivists(Request $request) {


        $currentCampaign = ElectionCampaigns::currentCampaign();
        $last_campaign_id = $currentCampaign->id;

        $city_id = null;
        $city_key = $request->input('city_key', null);
        
        if($city_key){
            $city = City::where('key', $city_key)->where('deleted',0)->first();
            if(!$city){
                echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!עיר לא קיימת</h1>";return;
            }
            $city_id = $city->id;
        }

        $activistRoleShifts = ElectionRoleShifts::select('id','name', 'system_name')->get();
        $activistRoleShiftsHash = [];
        foreach($activistRoleShifts as $activistRoleShift) {
            $activistRoleShiftsHash[$activistRoleShift->system_name] = $activistRoleShift->name;        
        }


        $ballotFields = [
            'ballot_boxes.id',
            'ballot_boxes.mi_id as ballot_box_mi_id',
            'ballot_box_roles.name as ballot_box_role_name',

            'cities.assign_leader_email as city_assign_leader_email',
            'cities.name as city_name',
            'cities.mi_id as city_mi_id',
            'clusters.name as cluster_name',
            DB::raw('IFNULL(cluster_street.name,clusters.street) as cluster_street_name'),
            'clusters.house as cluster_house',
            'regional_commitees.name as regional_committees_name',
            'regional_commitees.mi_id as regional_committees_mi_id',
        ];

        $shasLetters = '';

        switch ($currentCampaign->type) {
            case config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL'):
                $ballotFields[] = 'municipal_election_parties.letters as shas_letters';
                break;

            case config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'):
                $shasParty = ElectionCampaignPartyLists::select('letters')
                    ->where(['election_campaign_id' => $last_campaign_id, 'shas' => 1, 'deleted' => 0])
                    ->first();
                if ( !is_null($shasParty) ) {
                    $shasLetters = $shasParty->letters;
                }
                break;
        }


        $regionalQuery = DB::table('cities_in_regional_election_committees')
                                ->select('cities_in_regional_election_committees.city_id', 
                                    'regional_election_committees.name',
                                    'regional_election_committees.mi_id')
                                ->leftJoin('regional_election_committees', 
                                                'regional_election_committees.id', 
                                                '=',
                                                'cities_in_regional_election_committees.regional_election_committee_id')
                                ->where('regional_election_committees.election_campaign_id', $last_campaign_id);
        

        $ballotObj = BallotBox::select($ballotFields)
            ->withActivistsAllocations(false,true)
            ->withCluster()
            ->withCity()
            ->leftJoin('streets as cluster_street' , 'cluster_street.id' , 'clusters.street_id')
            ->leftJoin(DB::raw("(".$regionalQuery->toSql().") as regional_commitees"), 'regional_commitees.city_id', '=', 'cities.id')
            ->mergeBindings($regionalQuery);


        if($city_id){ 
                //limit to only selected city:
                $ballotObj->where('cities.id' , $city_id);
        }
        
        if ( $currentCampaign->type == config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL') ) {
            $ballotObj->withMunicipalElectionParties($last_campaign_id);
        }
        $ballotObj
        ->with(['ActivistsAllocations' => function ($query) use ($last_campaign_id, $city_id) {
        //->with(['electionRolesGeographical' => function ($query) use ($last_campaign_id, $city_id) {
            $countReportsQuery = "(SELECT COUNT(*) FROM votes JOIN election_roles_by_voters AS election_roles_by_voters2 ";
            $countReportsQuery .= "ON election_roles_by_voters2.voter_id=votes.reporting_voter_id ";
            $countReportsQuery .= "AND election_roles_by_voters2.election_campaign_id=" . $last_campaign_id;
            $countReportsQuery .= " WHERE election_roles_by_voters2.id=election_roles_by_voters.id ";
            $countReportsQuery .= "AND votes.election_campaign_id=" . $last_campaign_id . ") AS total_activist_reports";

            $geoFields = [
                'activists_allocations.ballot_box_id',
                //'election_role_by_voter_geographic_areas.entity_type',
                //'election_role_by_voter_geographic_areas.entity_id',
                'activists_allocations_assignments.correct_reporting',
            //election_roles_by_voters

                'election_roles_by_voters.phone_number',
                'election_roles_by_voters.verified_status',
                // 'activist_roles_payments.sum as role_sum',
                 //'election_role_by_voter_geographic_areas.sum as geo_sum',
                'activist_roles_payments.sum',
                'activist_roles_payments.lock_date',
                'activist_roles_payments.created_at',
                'activist_roles_payments.comment',

                DB::raw($countReportsQuery),
                // bank details
                'bank_branches.bank_id as bank_number',
                'bank_branches.name as bank_branch_name',
                'bank_branches.branch_number as bank_branch_number',

                'bank_details.bank_account_number',
                'bank_details.bank_owner_name',
                'bank_details.is_bank_verified',
                'bank_details.verify_bank_document_key',
                'bank_details.validation_election_campaign_id',
                //election_roles
                'election_roles.name as election_role_name',
                'election_roles.system_name as election_role_system_name',
                //election_role_shifts
                'election_role_shifts.id as election_role_shift_id',
                'election_role_shifts.name as election_role_shift_name',
                'election_role_shifts.system_name as election_role_shift_system_name',

                'voters.first_name',
                'voters.last_name',
                'voters.personal_identity',
                'voters.birth_date',
                'voters.email',

                'mi_cities.name as mi_city_name',
                'mi_cities.mi_id as mi_city_mi_id',
                'voters.mi_street',
                'streets.name as mi_street_name',
                'streets.mi_id as mi_street_mi_id',
                'voters.mi_house',
                'voters.mi_house_entry'
            ];

            $election_role_system_names = config('constants.activists.election_role_system_names');

            // $ballotRolesArray =  [$election_role_system_names['observer'], $election_role_system_names['ballotMember'], $election_role_system_names['counter']];

                $query->addSelect($geoFields)
                
                ->join('activists_allocations_assignments','activists_allocations_assignments.activist_allocation_id','=','activists_allocations.id')
                ->join('activist_roles_payments','activist_roles_payments.activists_allocations_assignment_id','=','activists_allocations_assignments.id')
                ->join('election_roles_by_voters','election_roles_by_voters.id','=','activists_allocations_assignments.election_role_by_voter_id')
                    
             
                ->withVoters()
                ->withVoterBankDetails()
                ->withElectionRoles()
                ->withElectionRoleShifts()
                ->withElectionCampaignMiCities()
                ->withElectionCampaignMiStreets()
                ->where('election_roles_by_voters.election_campaign_id', $last_campaign_id)
                ->whereNotNull('activists_allocations.ballot_box_id')//only activist ballot 
              
                //->whereIn('election_roles.system_name' ,$ballotRolesArray)
                
                ->orderBy('activists_allocations.ballot_box_id')
                ->orderBy('activists_allocations_assignments.election_role_shift_id');
        if($city_id){ 
                //Check by election_roles_by_voters assign city:
                $query->where('election_roles_by_voters.assigned_city_id' , $city_id);
        }
        }])
        ->where('clusters.election_campaign_id', $last_campaign_id)
        //->having('election_roles_geographical_count', '>', 0)
        ->OrderBy('cities.mi_id')
        ->orderBy('ballot_boxes.mi_id');

        $ballots = $ballotObj->get()->toArray();
    //    echo('json_encode($ballots)');
        //  echo(json_encode($ballots));
        //  die;
        
        if ( count($ballots) > 0 ) {
        
            header("Content-Type: application/txt");
            header("Content-Disposition: attachment; filename=ballots_activists.csv");

            $row = [
                'SEMEL' => 'סמל',
                'SEMEL_VADA' => 'סמל ועדה',
                'SEM_VADA' => 'שם ועדה',
                'SEMEL_YESHUV'=> 'סמל ישוב',
                'SHEM_YESHUV' => 'שם ישוב',
                'MISPAR_KALPI' => 'מספר קלפי',
                'KTOVET_KALPI' => 'כתובת קלפי',
                'MAKOM_KALPI' => 'מקום קלפי',
                'TAFKID' => 'תפקיד',
                'MISHMERET' => 'משמרת',
                'MISPAR_ZHUT' => 'תז',
                'SEM_MISHPCH' => 'שם משפחה',
                'SEM_PRATI' =>'שם פרטי',
                'TARRIK_LEDA' => 'תאריך לידה' ,
                'TEL_HOME' => 'טלפון' ,
                'SEMEL_YESUV_MEGURIM' => 'סמל ישוב מגורים' ,
                'SEM_YHSUV' => 'שם ישוב' ,
                'SEML_RECHOV_MEGURIM' => 'סמל רחוב מגורים' ,
                'SEM_RECHOV_MEGURIM' => 'שם רחוב מגורים' ,
                'MISHPAR_BAYT' => 'מספר בית' ,
                'OT_BAYT' => 'אות בית' ,
                'SCHUM_TASHLUM' => 'סכום לתשלום' ,
                'bank_number' => 'מספר בנק' ,
                'bank_branch_name' => 'שם סניף' ,
                'bank_branch_number' => 'מספר סניף',
                'bank_account_number' => 'מספר חשבון',
                'bank_owner_name' => 'שם בעל חשבון',
                'has_bank_verify_document' => 'קיים מסמך אימות', 
                'is_bank_verified' => 'חשבון מאומת',
                'validation_election_campaign_id' => 'חשבון עדכני',
                'FROM_HOUR' => 'משעה' ,
                'TO_HOUR' => 'עד שעה' ,
                'EMAIL' => 'מייל' ,
                'TEL_CELL' => 'סלולר',
                'RAKAZ_EMAIL' => 'סלולר',
                "תאריך שיבוץ",
                "אימות שיבוץ",
                "נעילת שיבוץ",
                "דיווח הגעה",
                "דיווחי הצבעה",
                "הערה",
            ];

            $titleRow = implode(',', $row) ;
            $rowToPrint = mb_convert_encoding($titleRow, "ISO-8859-8", "UTF-8") . "\n";

            echo $rowToPrint;
        }else{
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצאו פעילים</h1>";return;
        }

        $previousActivistShift= null;
        $currentActivistShift = null;

        for ( $ballotIndex = 0; $ballotIndex < count($ballots); $ballotIndex++ ) {
            $ballotBoxRole = is_null($ballots[$ballotIndex]['ballot_box_role_name']) ? '' : $ballots[$ballotIndex]['ballot_box_role_name'];

            $semelVada = '';
            switch ($currentCampaign->type) {
                case config('constants.ELECTION_CAMPAIGN_TYPE_MUNICIPAL'):
                    $semelVada = (is_null($ballots[$ballotIndex]['shas_letters'])) ? '' : $ballots[$ballotIndex]['shas_letters'];
                    break;

                case config('constants.ELECTION_CAMPAIGN_TYPE_KNESSET'):
                    $semelVada = $shasLetters;
                    break;
        }
        $miId = $ballots[$ballotIndex]['ballot_box_mi_id'];
        $miId = (strlen($miId) == 1)? $miId : substr_replace($miId, ".", strlen($miId)-1, 0);

        $cluster_name = $ballots[$ballotIndex]['cluster_name'];
        $cluster_city_name = $ballots[$ballotIndex]['city_name'];
        $city_assign_leader_email = $ballots[$ballotIndex]['city_assign_leader_email'];
        $cluster_street_name = $ballots[$ballotIndex]['cluster_street_name'];
        $cluster_house = $ballots[$ballotIndex]['cluster_house'];
        $ballotAddress = "$cluster_street_name $cluster_house";

        $election_role_system_names = config('constants.activists.election_role_system_names');

        if(count($ballots[$ballotIndex]['activists_allocations']) > 0){

            $currentActivistShift = null;
            for ( $geoIndex = 0; $geoIndex < count($ballots[$ballotIndex]['activists_allocations']); $geoIndex++ ) {
                $election_roles_geographical = $ballots[$ballotIndex]['activists_allocations'][$geoIndex];
                $previousActivistShift = $currentActivistShift;
                $currentActivistShift = $election_roles_geographical;
                // dump($election_roles_geographical);

                if($currentActivistShift['election_role_system_name'] != $election_role_system_names['counter']){

                    if ($previousActivistShift == null && 
                        !in_array($currentActivistShift['election_role_shift_system_name'], [
                            config('constants.activists.role_shifts.FIRST'),
                            config('constants.activists.role_shifts.ALL_DAY'),
                            config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')
                        ])) {
                        $missingShiftSystemName = ($currentActivistShift['election_role_shift_system_name'] == config('constants.activists.role_shifts.COUNT'))? 
                            config('constants.activists.role_shifts.ALL_DAY') :
                            config('constants.activists.role_shifts.FIRST');
                        self::printSingleNonActivistBallotRow($ballots,
                                                            $ballotIndex,
                                                            $cluster_city_name,
                                                            $miId,
                                                            $ballotAddress,
                                                            $cluster_name,
                                                            $ballotBoxRole,
                                                            $activistRoleShiftsHash[$missingShiftSystemName]);                    
                    }
                    
                    if ( $previousActivistShift['election_role_shift_system_name'] == config('constants.activists.role_shifts.FIRST') &&
                        $currentActivistShift['election_role_shift_system_name'] == config('constants.activists.role_shifts.COUNT')) {
                        self::printSingleNonActivistBallotRow($ballots,
                                                            $ballotIndex,
                                                            $cluster_city_name,
                                                            $miId,
                                                            $ballotAddress,
                                                            $cluster_name,
                                                            $ballotBoxRole,
                                                            $activistRoleShiftsHash[config('constants.activists.role_shifts.SECOND')]);                    
                    }
                }
                
                $miStreetMiId = 9000;
                if ( !is_null($election_roles_geographical['mi_street_mi_id']) ) {
                    $miStreetMiId = $election_roles_geographical['mi_street_mi_id'];
                }

                $miStreetName = '';
                if ( !is_null($election_roles_geographical['mi_street_name']) ) {
                    $miStreetName = $election_roles_geographical['mi_street_name'];
                } else if ( !is_null($election_roles_geographical['mi_street']) ) {
                    $miStreetName = $election_roles_geographical['mi_street'];
                }

                $verifiedStatusMsg = '';
                switch ( $election_roles_geographical['verified_status'] ) {
                    case config('constants.activists.verified_status.NO_MESSAGE_SENT'):
                        $verifiedStatusMsg = 'טרם נשלחה הודעה';
                        break;

                    case config('constants.activists.verified_status.MESSAGE_SENT'):
                        $verifiedStatusMsg = 'נשלחה הודעה';
                        break;

                    case config('constants.activists.verified_status.VERIFIED'):
                        $verifiedStatusMsg = 'מאומת';
                        break;

                    case config('constants.activists.verified_status.REFUSED'):
                        $verifiedStatusMsg = 'מסרב';
                        break;

                    case config('constants.activists.verified_status.MORE_INFO'):
                        $verifiedStatusMsg = 'לבירור נוסף';
                        break;
                }
                // $ballotRoleSystemName = config('constants.activists.election_role_system_names.ballotMember');
                // $observerRoleSystemName = config('constants.activists.election_role_system_names.observer');
                // in_array($election_roles_geographical['election_role_system_name'], [$ballotRoleSystemName, $observerRoleSystemName]) ?  $election_roles_geographical['geo_sum'] : $election_roles_geographical['role_sum'];
                $rowSum =  $election_roles_geographical['sum'];
                $trueStr = 'כן';
                $falseStr = 'לא';
                $comment = $election_roles_geographical['comment'];
                $row = [
                    'SEMEL' => 'Shas',
                    'SEMEL_VADA' => $ballots[$ballotIndex]['regional_committees_mi_id'],
                    'SEM_VADA' => $ballots[$ballotIndex]['regional_committees_name'],
                    'SEMEL_YESHUV' => $ballots[$ballotIndex]['city_mi_id'],
                    'SHEM_YESHUV' => $cluster_city_name,
                    'MISPAR_KALPI' => $miId,
                    'KTOVET_KALPI' =>$ballotAddress,
                    'MAKOM_KALPI' => $cluster_name,
                    'TAFKID' => $ballotBoxRole,
                    'MISHMERET' => $election_roles_geographical['election_role_shift_name'],
                    'MISPAR_ZHUT' => $election_roles_geographical['personal_identity'],
                    'SEM_MISHPCH' => $election_roles_geographical['last_name'],
                    'SEM_PRATI' => $election_roles_geographical['first_name'],
                    'TARRIK_LEDA' => str_replace('-', '', $election_roles_geographical['birth_date']),
                    'TEL_HOME' => '',
                    'SEMEL_YESUV_MEGURIM' => $election_roles_geographical['mi_city_mi_id'],
                    'SEM_YHSUV' => $election_roles_geographical['mi_city_name'],
                    'SEML_RECHOV_MEGURIM' => $miStreetMiId,
                    'SEM_RECHOV_MEGURIM' => $miStreetName,
                    'MISHPAR_BAYT' => is_null($election_roles_geographical['mi_house']) ? '' : $election_roles_geographical['mi_house'],
                    'OT_BAYT' => is_null($election_roles_geographical['mi_house_entry']) ? '' : $election_roles_geographical['mi_house_entry'],
                    'SCHUM_TASHLUM' => $rowSum,
                    'bank_number' => $election_roles_geographical['bank_number'] ,
                    'bank_branch_name' => str_replace(',', '',$election_roles_geographical['bank_branch_name'])  ,
                    'bank_branch_number' => $election_roles_geographical['bank_branch_number'] ,
                    'bank_account_number' => $election_roles_geographical['bank_account_number'] ,
                    'bank_owner_name' => $election_roles_geographical['bank_owner_name'] ,
                    'has_bank_verify_document' => !is_null($election_roles_geographical['verify_bank_document_key'])  ? $trueStr : $falseStr ,
                    'is_bank_verified' => $election_roles_geographical['is_bank_verified'] == 1 ? $trueStr : $falseStr ,
                    'validation_election_campaign_id' => $election_roles_geographical['validation_election_campaign_id'] == $last_campaign_id ? $trueStr : $falseStr ,
                    'FROM_HOUR' => '',
                    'TO_HOUR' => '',
                    'EMAIL' => is_null($election_roles_geographical['email']) ? '' : $election_roles_geographical['email'],
                    'TEL_CELL' => $election_roles_geographical['phone_number'],
                    'RAKAZ_EMAIL' => $city_assign_leader_email,
                    "תאריך שיבוץ" => Carbon::parse($election_roles_geographical['created_at'])->format('d/m/Y H:i:s'),
                    "אימות שיבוץ" => $verifiedStatusMsg,
                    "נעילת שיבוץ" => !empty($election_roles_geographical['lock_date']) ? $trueStr : $falseStr,
                    "דיווח הגעה" => ($election_roles_geographical['correct_reporting']) ? $trueStr : $falseStr,
                    "דיווחי הצבעה" => $election_roles_geographical['total_activist_reports'],
                    "הערה" => "$comment"
                ];
                // dump($row);
                $fields = array_keys($row);
                for ( $fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++ ) {
                    $fieldName = $fields[$fieldIndex];
                    $row[$fieldName] = '"' . str_replace('"', '""',$row[$fieldName])  . '"';
                }

                $fullRow = implode(',', $row);
                $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";

                echo $rowToPrint;

                if ((count($ballots[$ballotIndex]['activists_allocations'])  == ($geoIndex + 1)) &&
                    (!in_array($currentActivistShift['election_role_shift_system_name'], [
                        config('constants.activists.role_shifts.COUNT'),
                        config('constants.activists.role_shifts.SECOND_AND_COUNT'),
                        config('constants.activists.role_shifts.ALL_DAY_AND_COUNT')
                        ]))) {
                    $missingShiftSystemName = ($currentActivistShift['election_role_shift_system_name'] == config('constants.activists.role_shifts.FIRST'))? 
                        config('constants.activists.role_shifts.SECOND_AND_COUNT') :
                        config('constants.activists.role_shifts.COUNT');                
                    self::printSingleNonActivistBallotRow($ballots,
                                                        $ballotIndex,
                                                        $cluster_city_name,
                                                        $miId,
                                                        $ballotAddress,
                                                        $cluster_name,
                                                        $ballotBoxRole,
                                                        $activistRoleShiftsHash[$missingShiftSystemName]);
                }
            }
        }

        if(count($ballots[$ballotIndex]['activists_allocations']) == 0){
            self::printSingleNonActivistBallotRow($ballots,
                                                    $ballotIndex,
                                                    $cluster_city_name,
                                                    $miId,
                                                    $ballotAddress,
                                                    $cluster_name,
                                                    $ballotBoxRole);
        }
        }
    }
    /**
     * @method exportClusterActivists
     * Export clusters activists csv file
     * Use for:
     * 1. Activits screen. 
     * 2. City activists screen
     * 3. Cluster activists screen
     * @return Export csv file
     * 
     */
    
    public static function exportClusterActivists(Request $request)
    {

        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;


        $city_id = null;
        $city_key = $request->input('city_key', null);

        if ($city_key) {
            $city = City::where('key', $city_key)->where('deleted', 0)->first();
            if (!$city) {
                echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!עיר לא קיימת</h1>";
                return;
            }
            $city_id = $city->id;
        }

        //create city IN query for geo filter and specific city export
        $cityQuery = Voters::select('cities.id')
            ->withFilters()
            ->addJoinIfNotExist('ballot_boxes')
            ->addJoinIfNotExist('clusters')
            ->addJoinIfNotExist('cities')
            ->groupBy('cities.id');
        if ($city_id) {
            $cityQuery->where('cities.id', $city_id);
        }
        $cityQuery = $cityQuery->getQuery();

        $phoneQuery = " SELECT vp.phone_number FROM voter_phones AS vp WHERE vp.voter_id = role_voter_data.id ";
        $orderByPhoneQuery = " ORDER BY  CASE WHEN vp.phone_number LIKE '05%' THEN 1 WHEN vp.phone_number NOT LIKE '05%' THEN 2 END ASC ,vp.updated_at DESC, vp.id ";

        $captain50Query = VoterCaptainFifty::select([
            DB::raw("count(voters_in_election_campaigns.id)")
        ])
            ->join('voters_in_election_campaigns', function ($joinOn) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voters_with_captains_of_fifty.voter_id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
            })
            ->join('ballot_boxes', 'ballot_boxes.id', '=', 'voters_in_election_campaigns.ballot_box_id')
            ->join('clusters as captain_clusters', function ($joinOn) {
                $joinOn->on('captain_clusters.id', '=', 'ballot_boxes.cluster_id')
                    ->on('captain_clusters.election_campaign_id', '=', 'voters_with_captains_of_fifty.election_campaign_id');
            })
            ->whereRaw("voters_with_captains_of_fifty.captain_id = election_roles_by_voters.voter_id")
            ->whereRaw("voters_with_captains_of_fifty.election_campaign_id = election_roles_by_voters.election_campaign_id")
            ->whereRaw("captain_clusters.id = clusters.id")
            ->where('voters_with_captains_of_fifty.deleted', DB::raw(0));



        $fields = [
            'cities.name as cluster_city',
            'clusters.name as cluster_name',
            //election_roles_by_voters
            'election_roles_by_voters.phone_number',
            'election_roles_by_voters.verified_status',

            //details role payment

            'activist_roles_payments.comment',
            'activist_roles_payments.lock_date',
            'activist_roles_payments.created_at',
            'activist_roles_payments.sum as payment',


            'election_roles.id as election_roles_id',
            // bank details
            'bank_branches.bank_id as bank_number',
            'bank_branches.name as bank_branch_name',
            'bank_branches.branch_number as bank_branch_number',

            'bank_details.bank_account_number',
            'bank_details.bank_owner_name',
            'bank_details.verify_bank_document_key',
            'bank_details.is_bank_verified',
            'bank_details.validation_election_campaign_id',

            //voters as role_voter_data
            'role_voter_data.first_name',
            'role_voter_data.last_name',
            'role_voter_data.personal_identity',
            'role_voter_data.birth_date',
            'role_voter_data.email',
            'role_voter_data.city',
            'role_voter_data.street',
            'role_voter_data.house',
            //phones
            DB::raw("(CASE WHEN role_voter_data.main_voter_phone_id IS NOT NULL 
            THEN( SELECT vp.phone_number FROM voter_phones AS vp WHERE ( vp.id = role_voter_data.main_voter_phone_id))
            ELSE( $phoneQuery $orderByPhoneQuery LIMIT 1) END) AS main_phone"),
            DB::raw("(CASE WHEN role_voter_data.main_voter_phone_id IS NOT NULL 
            THEN( $phoneQuery  AND vp.id != role_voter_data.main_voter_phone_id $orderByPhoneQuery LIMIT 1 )
            ELSE( $phoneQuery $orderByPhoneQuery LIMIT 1,1) END) AS main_phone2"),
        ];

        $election_role_system_names = config('constants.activists.election_role_system_names');
        $roleCaptainId = ElectionRoles::getIdBySystemName(config('constants.activists.election_role_system_names.ministerOfFifty'));
 

        $allActivistsData = ActivistRolesPayments::select($fields)
            ->addSelect(DB::raw('(' . $captain50Query->getQuery()->toSql() . ') as role_status'), 'election_roles.name as role_name')
            ->withElectionRoleByVoter(true)
            ->withVoter('role_voter_data')
            ->leftJoin('election_roles','election_roles.id','election_roles_by_voters.election_role_id')
            ->withVoterBankDetails()
            ->leftJoin('clusters', 'clusters.id', 'role_voter_activists_allocations.cluster_id')
            ->leftJoin('cities', 'cities.id', 'election_roles_by_voters.assigned_city_id')
            ->where('election_roles_by_voters.election_campaign_id', $currentCampaignId)
            ->whereNull('activist_roles_payments.activists_allocations_assignment_id') //must null for record cluster activist
            ->groupBy('election_roles_by_voters.id') //for not display cluster leader or another activist role in multi cluster duplicate
            ->whereRaw('election_roles_by_voters.assigned_city_id IN (' . $cityQuery->toSql() . ')')
            ->mergeBindings($cityQuery)
            ->orderBy('cluster_city')
            ->orderBy('cluster_name')
            ->orderBy('role_name')
            ->orderBy('last_name')
            ->get();

        if (count($allActivistsData) > 0) {
            header("Content-Type: application/txt");
            header("Content-Disposition: attachment; filename=clusters_activists.csv");

            $titleRow = [
                'city' => 'עיר',
                'role' => 'תפקיד',
                'cluster_name' => 'שם אשכול',
                'id' => 'תז',
                'last_name' => 'שם משפחה',
                'first_name' => 'שם פרטי',
                'address' => 'כתובת',
                'phone_number' => 'פלאפון פעיל',
                'main_phone' => '1טלפון',
                'main_phone2' => '2טלפון',
                'payment' => 'סכום לתשלום',
                'bank_number' => 'מספר בנק',
                'bank_branch_name' => 'שם סניף',
                'bank_branch_number' => 'מספר סניף',
                'bank_account_number' => 'מספר חשבון',
                'bank_owner_name' => 'שם בעל חשבון',
                'has_bank_verify_document' => 'קיים מסמך אימות',
                'is_bank_verified' => 'חשבון מאומת',
                'validation_election_campaign_id' => 'חשבון עדכני',
                'status' => 'סטטוס אימות',
                'area_status' => 'סטטוס שיבוץ',
                "תאריך שיבוץ",
                "נעילת שיבוץ",
                "הערה"
            ];

            $titleRowToPrint = mb_convert_encoding(implode(',', $titleRow), "ISO-8859-8", "UTF-8") . "\n";

            echo $titleRowToPrint;
            if (count($allActivistsData) > 0) {
                foreach ($allActivistsData as $row) {
                    $verified_status = 'ללא';
                    $verified_status_names = [
                        'NO_MESSAGE_SENT' => 'לא נשלחה הודעה',
                        'MESSAGE_SENT' => 'נשלחה הודעה',
                        'VERIFIED' => 'מאומת',
                        'REFUSED' => 'סירב',
                        'MORE_INFO' => 'מבקש מידע נוסף'
                    ];

                    foreach ($verified_status_names as $status_key => $status_name) {
                        if (config("constants.activists.verified_status.$status_key") == $row['verified_status']) {
                            $verified_status = $status_name;
                        }
                    }
                    $trueStr = 'כן';
                    $falseStr = 'לא';
                    $comment = $row['comment'];
                    $csvRow = [
                        'city' => $row['cluster_city'],
                        'role' =>  $row['role_name'],
                        'cluster_name' => '"' . $row['cluster_name'] . '"',
                        'id' => $row['personal_identity'],
                        'last_name' =>  $row['last_name'],
                        'first_name' => $row['first_name'],
                        'address' => $row['city'] . ' ' . $row['street'] . ' ' . $row['house'],
                        'phone_number' => $row['phone_number'],
                        'main_phone' => $row['main_phone'],
                        'main_phone2' => $row['main_phone2'],
                        'payment' => $row['payment'],
                        'bank_number' => $row['bank_number'],
                        'bank_branch_name' => str_replace(',', '', $row['bank_branch_name']),
                        'bank_branch_number' => $row['bank_branch_number'],
                        'bank_account_number' => $row['bank_account_number'],
                        'bank_owner_name' => $row['bank_owner_name'],
                        'has_bank_verify_document' => !is_null($row['verify_bank_document_key'])  ? $trueStr :   $falseStr,
                        'is_bank_verified' => $row['is_bank_verified'] == 1 ? $trueStr :   $falseStr,
                        'validation_election_campaign_id' => $row['validation_election_campaign_id'] == $currentCampaignId ? $trueStr :   $falseStr,
                        'status' => $verified_status,
                        'area_status' => $row['election_roles_id'] == $roleCaptainId ? $row['role_status'] : 'משובץ',
                        "תאריך שיבוץ" => Carbon::parse($row['created_at'])->format('d/m/Y H:i:s'),
                        "נעילת שיבוץ" => !empty($row['lock_date']) ? $trueStr : $falseStr,
                        "הערה" => "$comment"
                    ];
                    $rowToPrint = mb_convert_encoding(implode(',', $csvRow), "ISO-8859-8", "UTF-8") . "\n";

                    echo $rowToPrint;
                }
            }
        } else {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצאו פעילים</h1>";
        }
    }
    /**
     * @method exportElectionActivists 
     * Export all activists excel file for payments
     * -> maybe not relevant now!
     */
    public static function exportElectionActivists(Request $request) {
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $currentCampaignId = $currentCampaign->id;

        $votersObj = VotersActivistsService::getElectionActivistsData($request, 'excel');
       
        if(!$votersObj){

            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!חיפוש לא תקין</h1>"; return;
        }


        $votersData = $votersObj->get()->toArray();
        $ballotRoleSystemName = config('constants.activists.election_role_system_names.ballotMember');
        $observerRoleSystemName = config('constants.activists.election_role_system_names.observer');
        $counterRoleSystemName = config('constants.activists.election_role_system_names.counter');
        $exportData = [];
        foreach($votersData as $voterData){
            if(!empty($voterData['election_roles_by_voter'])){
                foreach($voterData['election_roles_by_voter'] as $roleData){
                    //array of role payment includ array assignment details for every role payment
                    $paymentTypePrint=[];
                    foreach ($roleData['activist_roles_payments'] as $key => $assignmentDetails) {
                        if(!array_key_exists($assignmentDetails['payment_type_additional_name'],$paymentTypePrint))
                        $paymentTypePrint[$assignmentDetails['payment_type_additional_name']]=[];
                        $paymentTypePrint[$assignmentDetails['payment_type_additional_name']][]=$assignmentDetails;
                    }

                    foreach ($paymentTypePrint as $paymentType => $paymentArrAssignment) {
                        $clusterName = array_map(function ($assignementDetails) {
                            return $assignementDetails['cluster_name'];
                        }, $paymentArrAssignment);
                        $clusterAddress = array_map(function ($assignementDetails) {
                            return $assignementDetails['cluster_address'];
                        }, $paymentArrAssignment);
                        $paymentPrint = $paymentArrAssignment[0];
                        $paymentPrint['cluster_name'] = implode(",", $clusterName);
                        $paymentPrint['cluster_address'] = implode(",", $clusterAddress);

                        $exportRow = self::getExportActivistRow($currentCampaignId, $voterData, $roleData, $paymentPrint);
                        array_push($exportData, $exportRow);
                    }
                }
            } else {
                $exportRow = self::getExporVoterRow($voterData);
                array_push($exportData, $exportRow);    
            }

        }
        // dd($votersData);
        if(count($exportData) > 0){
            ExportService::export($exportData, 'xls');
        }else{
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצאו פעילים</h1>"; return;
        }
    }

    private static function getRolePaymentDetailsForExcelActivist(){

    }



    /**
     * @method exportTashbetzCsv
     * Export activists csv file for update tasbetz system.
     * @return Export csv file
     */
	public static function exportTashbetzCsv(){
        $last_campaign_id = ElectionCampaigns::currentCampaign()->id;
        $filename = "01_SHAS_".date("Ymd").".csv";
        header("Content-Type: application/txt");
        header("Content-Disposition: attachment; filename=".$filename);
        $detailColumnsHebrew = ["SEMEL" , "SEMEL_VADA" , "SEMEL_YESHUV" , 
                                "SHEM_YESHUV" , "MISPAR_KALPI" , "TAFKID" ,
                                "MISHMERET" , "MISPAR_ZHUT" , "SEM_MISHPCH", 
                                "SEM_PRATI","TARRIK_LEDA","TEL_HOME",
                                "SEMEL_YESUV_MEGURIM" , "SEM_YHSUV" , "SEML_RECHOV_MEGURIM",
                                "SEM_RECHOV_MEGURIM" , "MISHPAR_BAYT" , "OT_BAYT" , 
                                "SCHUM_TASHLUM" , "FROM_HOUR" , "TO_HOUR" , 
                                "EMAIL" , "TEL_CELL", "RAKAZ_EMAIL"];
        $fullRow = implode(',', $detailColumnsHebrew);
        
        // $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
        echo $fullRow . "\n";

        //get mi_id (SEMEL_VADA) of 
        $regionalQuery = DB::table('cities_in_regional_election_committees')
                    ->select('cities_in_regional_election_committees.city_id', 
                        'regional_election_committees.mi_id')
                    ->leftJoin('regional_election_committees', 
                                    'regional_election_committees.id', 
                                    '=',
                                    'cities_in_regional_election_committees.regional_election_committee_id')
                    ->where('regional_election_committees.election_campaign_id', $last_campaign_id);
        //new method
        $arrFields=[
                                'areas.name as area_name',
                                'cities.name as cluster_city_name',
                                'cities.mi_id as cluster_city_mi_id' , 
                                'cities.assign_leader_email as city_assign_leader_email' , 
                                'clusters.mi_id as cluster_mi_id',
                                'ballot_box_roles.name as role_name',
                                //'election_role_by_voter_geographic_areas.election_role_shift_id',
                                'activists_allocations_assignments.election_role_shift_id', 
                                'ballot_boxes.mi_id as ballot_mi_id',
                                'voters.personal_identity as personal_identity', 
                                'voters.last_name as last_name',
                                'voters.first_name as first_name',
                                'voters.birth_date',
                                'voters.email',
                                'mi_city.id as mi_city_id',
                                'mi_city.mi_id as mi_city_mi_id',
                                'city.mi_id as city_mi_id',
                                DB::raw('IF(mi_city.mi_id,mi_city.name,voters.mi_city) as mi_city_name'),
                                DB::raw('IF(city.mi_id,city.name,voters.city) as city_name'),

                                'mi_street.mi_id as mi_street_mi_id',
                                'street.mi_id as street_mi_id',
                                DB::raw('IF(mi_street.mi_id,mi_street.name,voters.mi_street) as mi_street_name'),
                                DB::raw('IF(street.mi_id,street.name,voters.street) as street_name'),

                                'voters.house',
                                //'election_role_by_voter_geographic_areas.sum as budget',
                                'activist_roles_payments.sum as budget',
                                'election_roles_by_voters.phone_number as activist_phone_number',
                                'regional_commitees.mi_id as semel_vada'
        ];

        $detailedRows=ActivistAllocationAssignment::select($arrFields)
        ->withElectionRoleByVoter()
        ->withActivistAllocation()
        ->withActivistRolesPayments()
        ->withBallotBox()
        ->join('voters', 'voters.id', '=', 'election_roles_by_voters.voter_id')
        ->join('election_roles', 'election_roles.id' ,'=', 'election_roles_by_voters.election_role_id')
        ->join('ballot_box_roles','ballot_box_roles.id','=','activists_allocations.ballot_box_role_id')
        ->join('clusters','clusters.id','=','ballot_boxes.cluster_id')
        ->join('cities','cities.id','=','clusters.city_id')
        ->leftJoin('areas','areas.id','=','cities.area_id')
        ->leftJoin('sub_areas','sub_areas.id','=','cities.sub_area_id')

        ->leftJoin(DB::raw("(".$regionalQuery->toSql().") as regional_commitees"),'regional_commitees.city_id','=', 'cities.id')
        ->leftJoin('cities as mi_city', 'mi_city.id', 'voters.mi_city_id')
        ->leftJoin('cities as city', 'city.id', 'voters.city_id')
        ->leftJoin('streets as mi_street', 'mi_street.id', 'voters.mi_street_id')
        ->leftJoin('streets as street', 'street.id', 'voters.street_id')
        ->mergeBindings($regionalQuery)

        ->whereNotNull('activists_allocations.ballot_box_id')
        ->where('ballot_box_roles.type',0)
        ->where('cities.deleted',0)
        ->where('clusters.election_campaign_id',$last_campaign_id)
        ->where('election_roles_by_voters.election_campaign_id',$last_campaign_id)
        ->orderBy('semel_vada')
        ->orderBy('city_name')
        ->orderBy('ballot_mi_id')
        ->orderBy('election_role_shift_id')
        ->groupBy('activists_allocations_assignments.id')
        ->get();

        // $detailedRows = ElectionRolesGeographical::
        //                 select($arrFields)
        //                 ->withElectionRolesByVotersCampaignBallotCityArea()
        //                 ->leftJoin(DB::raw("(".$regionalQuery->toSql().") as regional_commitees"),'regional_commitees.city_id','=', 'cities.id')
        //                 ->leftJoin('cities as mi_city', 'mi_city.id', 'voters.mi_city_id')
        //                 ->leftJoin('cities as city', 'city.id', 'voters.city_id')
        //                 ->leftJoin('streets as mi_street', 'mi_street.id', 'voters.mi_street_id')
        //                 ->leftJoin('streets as street', 'street.id', 'voters.street_id')
        //                 ->mergeBindings($regionalQuery)
        //                 ->where('election_role_by_voter_geographic_areas.entity_type',config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
        //                 ->where('ballot_box_roles.type',0)
        //                 ->where('cities.deleted',0)
        //                 ->where('clusters.election_campaign_id',$last_campaign_id)
        //                 ->where('election_roles_by_voters.election_campaign_id',$last_campaign_id)
        //                 ->orderBy('semel_vada')
        //                 ->orderBy('city_name')
        //                 ->orderBy('ballot_mi_id')
        //                 ->orderBy('election_role_shift_id')
        //                // ->groupBy('election_role_by_voter_geographic_areas.id')
        //                 ->get();
        // dd($detailedRows->toArray());
        // die; 
        //loop over allocated activists
        for($indexer = 0 ; $indexer < count($detailedRows) ; $indexer++){
            $item = $detailedRows[$indexer];
            $election_role_shift_id = (int) $item->election_role_shift_id;

            //calculate shift number
            // $firstDayElectionRoles = [1, 3, 6];
            $currentShiftNumber = 1; 
            $secondDayElectionRoles = [2, 5];
            if(in_array($election_role_shift_id, $secondDayElectionRoles)){
                $currentShiftNumber = 2; 
            } else if($election_role_shift_id == 4){
                $currentShiftNumber = 4; 
            }

            $item->birth_date = explode(" ",$item->birth_date)[0];
            
            while(strlen($item->personal_identity) < 9){
                $item->personal_identity = "0".$item->personal_identity;
            }
            $item->role_name = explode(" ",$item->role_name)[0];
            if(strlen($item->ballot_mi_id ) > 1){
                $item->ballot_mi_id  = substr($item->ballot_mi_id  , 0 , strlen($item->ballot_mi_id ) - 1).".".substr($item->ballot_mi_id  , strlen($item->ballot_mi_id )-1 , 1);
            }
            $cityName = ''; $cityMiId = '';
            $streetName = ''; $streetMiId = '';

            if($item->mi_city_mi_id ){
                $cityName = $item->mi_city_name;
                $cityMiId = $item->mi_city_mi_id;
                $streetName = $item->mi_street_name;
                $streetMiId = $item->mi_street_mi_id;
                if(is_null($streetMiId) && !is_null($streetName)){
                    $supposedVoterStreet = Streets::select('mi_id', 'name')->where('name', $streetName)->where('city_id', $item->mi_city_id)->first();
                    if($supposedVoterStreet){
                        $streetMiId = $supposedVoterStreet->mi_id;
                        $streetName = $supposedVoterStreet->name;
                    }
                    }
            } else {
                $cityName = $item->city_name;
                $cityMiId = $item->city_mi_id;
                $streetName = $item->street_name;
                $streetMiId = $item->street_mi_id;
            }


            $item->birth_date = str_replace("-", "", $item->birth_date);
            $detailColumnsHebrew = [
                "SEMEL" => 'שס',
                "SEMEL_VADA" => $item->semel_vada,
                "SEMEL_YESHUV" => $item->cluster_city_mi_id,
                "SHEM_YESHUV" => $item->cluster_city_name,
                "MISPAR_KALPI" => $item->ballot_mi_id,
                "TAFKID" => $item->role_name,
                "MISHMERET" => $currentShiftNumber,
                "MISPAR_ZHUT" => $item->personal_identity,
                "SEM_MISHPCH" => $item->last_name,
                "SEM_PRATI" => $item->first_name,
                "TARRIK_LEDA" => $item->birth_date,
                "TEL_HOME" => '',
                "SEMEL_YESUV_MEGURIM" => $cityMiId,
                "SEM_YHSUV" => $cityName,
                "SEML_RECHOV_MEGURIM" => $streetMiId,
                "SEM_RECHOV_MEGURIM" => $streetName,
                "MISHPAR_BAYT" => $item->house,
                "OT_BAYT" => '',
                "SCHUM_TASHLUM" => '',
                "FROM_HOUR"  => '',
                "TO_HOUR" => '',
                "EMAIL" => $item->email,
                "TEL_CELL" => $item->activist_phone_number,
                "RAKAZ_EMAIL" => $item->city_assign_leader_email
            ];

            $fullRow = implode(',', $detailColumnsHebrew);

            // $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
            echo $fullRow . "\n";
        }
    }
    /*
		!! Maybe not in use!!!
		Function that exports of ballots of city into formatted 
		file/print by cityKey and POST params
	*/
    public static function exportCityBallotsToFile(Request $request, $cityKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('elections.activists.city_summary')) {
            $jsonOutput->setErrorCode(config('errors.import_csv.REQUEST_NOT_ENOGH_PERMISSIONS'));
            return;
        }
        $city = City::select('id', 'name')->where('key', $cityKey)->first();
        if (!$city) {
            $jsonOutput->setErrorCode(config('errors.elections.CITY_DOESNT_EXIST'));
            return;
        }
        $currentCampaign = ElectionCampaigns::currentCampaign();
        $electionCampaignID = $currentCampaign->id;
        $electionCampaignType = $currentCampaign->type;

        $previousCampID = ElectionCampaigns::select('id', 'name')->where('type', 0)->where('id', '!=', $currentCampaign)->orderBy('id', 'DESC')->first()->id;

        $ballotBoxes = BallotBox::selectRaw('ballot_boxes.id ,clusters.name as cluster_name , (IF(clusters.house is NULL , clusters.street , CONCAT(clusters.street , " " , house)))  as cluster_address 
		, ballot_boxes.mi_id , IF((ballot_boxes.special_access || ballot_boxes.crippled),true,false) as special_access')->withCluster()
            ->where('election_campaign_id', $electionCampaignID)->where('city_id', $city->id)->get();

        $countReportsQuery = "(SELECT COUNT(*) FROM votes JOIN election_roles_by_voters AS election_roles_by_voters2 ";
        $countReportsQuery .= "ON election_roles_by_voters2.voter_id=votes.reporting_voter_id ";
        $countReportsQuery .= "AND election_roles_by_voters2.election_campaign_id=" . $electionCampaignID;
        $countReportsQuery .= " WHERE election_roles_by_voters2.id=election_roles_by_voters.id ";
        $countReportsQuery .= "AND votes.election_campaign_id=" . $electionCampaignID . ") AS total_activist_reports";

        $data = [];
        for ($i = 0; $i < count($ballotBoxes); $i++) {
            $ballot = $ballotBoxes[$i];

            $ballotFields = [
                'election_role_shifts.name as shift_name', 'election_role_by_voter_geographic_areas.entity_id as ballot_box_id',
                'election_role_by_voter_geographic_areas.entity_id', 'election_role_by_voter_geographic_areas.correct_reporting',
                'election_role_by_voter_geographic_areas.appointment_letter',
                'voters.first_name', 'voters.last_name', 'voters.personal_identity', 'voters.key as voter_key',
                'election_roles_by_voters.voter_id', 'phone_number', 'verified_status',
                'instructed', 'user_lock_id', 'election_roles.key as role_key',
                'election_roles.name as role_name', 'arrival_date', DB::raw($countReportsQuery)
            ];
            $ballotRoles = ElectionRolesGeographical::select($ballotFields)
                ->withElectionRoleShifts()
                ->withElectionRolesByVotersAndCampaignBallot()
                ->where('election_role_by_voter_geographic_areas.entity_type', config('constants.GEOGRAPHIC_ENTITY_TYPE_BALLOT_BOX'))
                ->where('election_roles_by_voters.election_campaign_id', $electionCampaignID)
                ->where('election_role_by_voter_geographic_areas.entity_id', $ballot->id)
                ->get();
            $numberOfVoters = VoterElectionCampaigns::where('election_campaign_id', $electionCampaignID)->where('ballot_box_id', $ballot->id)->count();


            $previousBallot = BallotBox::withCluster()->select('ballot_boxes.id')->where('ballot_boxes.mi_id', $ballot->mi_id)->where('clusters.election_campaign_id', 19)->where('city_id', $city->id)->first();
            if ($previousBallot) {
                $countPreviousVotes = (int)ElectionCampaignPartyListVotes::withElectionCampaignPartyLists()->where('ballot_box_id', $previousBallot->id)
                    ->where('election_campaign_id', $previousCampID)->where('deleted', 0)->where('shas', 1)->sum('votes');
            } else {
                $countPreviousVotes  = 0;
            }

            $countSupportersFinalStatus = VoterSupportStatus::join('voters_in_election_campaigns', function ($joinOn) {
                $joinOn->on('voters_in_election_campaigns.voter_id', '=', 'voter_support_status.voter_id')
                    ->on('voters_in_election_campaigns.election_campaign_id', '=', 'voter_support_status.election_campaign_id');
            })->withSupportStatus()
                ->where("voter_support_status.election_campaign_id", $electionCampaignID)
                ->where('voter_support_status.entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_FINAL'))
                ->where('support_status.level', '>', 0)
                ->where('ballot_box_id', $ballot->id)
                ->where('voter_support_status.deleted', 0)
                ->count();

            $ballotMiId = substr_replace($ballot->mi_id, ".", strlen($ballot->mi_id) - 1, 0);
            if (count($ballotRoles) == 0) {

                array_push($data, [
                    "אשכול" => $ballot->cluster_name, "כתובת אשכול" => $ballot->cluster_address,
                    "קלפי" => $ballotMiId,
                    "סוג קלפי" => ($ballot->special_access == '1' ? "נכה" : "רגיל"),
                    "תפקיד בקלפי" => "",
                    "מספר תושבים" => $numberOfVoters,
                    "הצבעות מערכת קודמת" =>  $countPreviousVotes,
                    "כמות תומכים" => $countSupportersFinalStatus,
                    "משמרת" => "",
                    "ת.ז פעיל" => "",
                    "שם פעיל" => "",
                    "נייד פעיל" => "",
                    "אימות שיבוץ" => "",
                    "דיווח הגעה" => "",
                    "דיווחי הצבעות" => ""
                ]);
            } else {
                for ($j =  0; $j < count($ballotRoles); $j++) {
                    $ballotRole = $ballotRoles[$j];

                    $verifiedStatusMsg = '';
                    switch ($ballotRole->verified_status) {
                        case config('constants.activists.verified_status.NO_MESSAGE_SENT'):
                            $verifiedStatusMsg = 'טרם נשלחה הודעה';
                            break;

                        case config('constants.activists.verified_status.MESSAGE_SENT'):
                            $verifiedStatusMsg = 'נשלחה הודעה';
                            break;

                        case config('constants.activists.verified_status.VERIFIED'):
                            $verifiedStatusMsg = 'מאומת';
                            break;

                        case config('constants.activists.verified_status.REFUSED'):
                            $verifiedStatusMsg = 'מסרב';
                            break;

                        case config('constants.activists.verified_status.MORE_INFO'):
                            $verifiedStatusMsg = 'לבירור נוסף';
                            break;
                    }

                    array_push($data, [
                        "אשכול" => $ballot->cluster_name, "כתובת אשכול" => $ballot->cluster_address,
                        "קלפי" => $ballotMiId,
                        "סוג קלפי" => ($ballot->special_access == '1' ? "נכה" : "רגיל"),
                        "תפקיד בקלפי" => $ballotRole->role_name,
                        "מספר תושבים" => $numberOfVoters,
                        "הצבעות מערכת קודמת" =>  $countPreviousVotes,
                        "כמות תומכים" => $countSupportersFinalStatus,
                        "משמרת" => $ballotRole->shift_name,
                        "ת.ז פעיל" => (int)$ballotRole->personal_identity,
                        "שם פעיל" => ($ballotRole->first_name . " " . $ballotRole->last_name),
                        "נייד פעיל" => $ballotRole->phone_number,
                        "אימות שיבוץ" => $verifiedStatusMsg,
                        "דיווח הגעה" => ($ballotRole->correct_reporting) ? 'כן' : 'לא',
                        "דיווחי הצבעות" => $ballotRole->total_activist_reports
                    ]);
                }
            }
        }


        Excel::create("פעילי קלפיות עיר " . $city->name, function ($excel) use ($data) {
            $excel->sheet('ExportFile', function ($sheet) use ($data) {
                $sheet->fromArray($data);
                $sheet->setRightToLeft(true);
            });
        })->export('xls');


        $jsonOutput->setData("ok");
    }
    /************************************** Help fucntions: ***************************************** */
    /**
     * Prints a single row of csv with ballot info but without activist
     *
     * @param string $ballots
     * @param integer $ballotIndex
     * @param string $cluster_city_name
     * @param integer $miId
     * @param string $ballotAddress
     * @param string $cluster_name
     * @param string $ballotBoxRole
     * @param string $activistRoleShiftName
     * @return void
     */
    private static function printSingleNonActivistBallotRow(
        $ballots,
        $ballotIndex,
        $cluster_city_name,
        $miId,
        $ballotAddress,
        $cluster_name,
        $ballotBoxRole,
        $activistRoleShiftName = ''
    ) {

        $row = [
            'SEMEL' => 'Shas',
            'SEMEL_VADA' => $ballots[$ballotIndex]['regional_committees_mi_id'],
            'SEM_VADA' => $ballots[$ballotIndex]['regional_committees_name'],
            'SEMEL_YESHUV' => $ballots[$ballotIndex]['city_mi_id'],
            'SHEM_YESHUV' => $cluster_city_name,
            'MISPAR_KALPI' => $miId,
            'KTOVET_KALPI' => $ballotAddress,
            'MAKOM_KALPI' => $cluster_name,
            'TAFKID' => $ballotBoxRole,
            'MISHMERET' => $activistRoleShiftName,
            'MISPAR_ZHUT' => '',
            'SEM_MISHPCH' => '',
            'SEM_PRATI' => '',
            'TARRIK_LEDA' => '',
            'TEL_HOME' => '',
            'SEMEL_YESUV_MEGURIM' => '',
            'SEM_YHSUV' => '',
            'SEML_RECHOV_MEGURIM' => '',
            'SEM_RECHOV_MEGURIM' => '',
            'MISHPAR_BAYT' => '',
            'OT_BAYT' => '',
            'SCHUM_TASHLUM' => '',
            'bank_number' => '',
            'bank_branch_name' => '',
            'bank_branch_number' => '',
            'bank_account_number' => '',
            'bank_owner_name' => '',
            'has_bank_verify_document' => '',
            'is_bank_verified' => '',
            'FROM_HOUR' => '',
            'TO_HOUR' => '',
            'EMAIL' => '',
            'TEL_CELL' => '',
            'RAKAZ_EMAIL' => '',
            "תאריך שיבוץ" => '',
            "אימות שיבוץ" => '',
            "נעילת שיבוץ" => '',
            "דיווח הגעה" => '',
            "דיווחי הצבעה" => '',
            "הערה" => ''
        ];

        $fields = array_keys($row);
        for ($fieldIndex = 0; $fieldIndex < count($fields); $fieldIndex++) {
            $fieldName = $fields[$fieldIndex];
            $row[$fieldName] = '"' . str_replace('"', '""', $row[$fieldName])  . '"';
        }

        $fullRow = implode(',', $row);
        $rowToPrint = mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";

        echo $rowToPrint;
    }

    /**
     * @method getExportActivistRow
     * Export single row of cluster activist.
     */
    private static function getExportActivistRow($currentCampaignId, $voterData,$roleData, $paymentRoleData)
    {
        Log::info(json_encode($paymentRoleData));
        $ministerOfFifty = config('constants.activists.election_role_system_names.ministerOfFifty');
        $clusterLeader = config('constants.activists.election_role_system_names.clusterLeader');
        $electionGeneralWorker = config('constants.activists.election_role_system_names.electionGeneralWorker');
        $muni_elections_roles_names = config('constants.activists.muni_elections_roles_names');


        $birth_date = $voterData['birth_date'];
        $birthDate = '20000101';
        if ($birth_date) {
            $birth_date_temp = Carbon::parse($birth_date);
            $birthDate = $birth_date_temp->format('Ymd');
        }
        $isActivistAllocated = false;
        switch ($roleData['system_name']) {
            case $ministerOfFifty:
                $isActivistAllocated = $roleData['total_count_minister_of_fifty_count'] > 0;
                break;
            case $clusterLeader:
                $isActivistAllocated = $roleData['activists_allocations_assignments_count'] > 0;
                break;
            case $electionGeneralWorker:
                $isActivistAllocated = true;
                break;
            case in_array($roleData['system_name'], $muni_elections_roles_names):
                $isActivistAllocated = true;
                break;
            default:
                $isActivistAllocated = $roleData['activists_allocations_assignments_count'] > 0;
                break;
        }
   
        if(!is_null($paymentRoleData['election_role_shift_id']))
        $isBallotActivist=true;
        else
        $isBallotActivist=false;

        $ballotMiId=$paymentRoleData['areas_ballot_boxes_mi_id'];
        $miId = '';
        if ($isBallotActivist) {
            $miId = $ballotMiId;
            $miId = (strlen($miId) == 1) ? $miId : substr_replace($miId, ".", strlen($miId) - 1, 0);
        }

        $shift_name = $isBallotActivist ? $paymentRoleData['shift_name'] : '';
        $ballots_areas_cities_name = $isBallotActivist? $roleData['assigned_city_name'] : '';
        $cluster_address = $paymentRoleData['cluster_address'];
        $cluster_name = $paymentRoleData['cluster_name'] ;

        // dd($roleData, $voterData);
        $trueStr = 'כן';
        $falseStr = 'לא';
        $comment = $paymentRoleData['comment'];
        $exportRow = [
            'personal_identity' =>  $voterData['personal_identity'],
            'last_name' =>  $voterData['last_name'],
            'first_name' =>  $voterData['first_name'],
            'birth_year' =>  $birthDate,

            'election_role_Allocate_number' =>  $roleData['phone_number'],

            'city_name' =>  $voterData['city_name'],
            'street' =>  !empty($voterData['street_name']) ? $voterData['street_name'] : $voterData['street'],
            'house' =>  $voterData['house'],
            'house_entry' =>  $voterData['house_entry'],

            'election_role_name' =>  $roleData['election_role_name'],
            'election_role_sum' =>  empty($paymentRoleData['not_for_payment']) ? $paymentRoleData['sum'] : 'לא זכאי לתשלום',
            'payment_type' => $paymentRoleData['payment_type_additional_name'] ?? 'בסיס',
            'households_count' => ($roleData['system_name'] == 'captain_of_fifty') ?  $roleData['total_count_minister_of_fifty_count'] : '',

            'is_activist_allocated' =>  $isActivistAllocated ? $trueStr : $falseStr,
            'assigned_city_name' =>  $roleData['assigned_city_name'],
            'current_election_ballot_box_city' =>  $ballots_areas_cities_name,
            'current_election_ballot_box_id' =>  $miId,

            'election_role_shift' =>  $shift_name,
            'current_election_cluster' =>  $cluster_name,
            'current_election_cluster_address' =>  $cluster_address,
            "allocation_date" => Carbon::parse($paymentRoleData['created_at'])->format('d/m/Y H:i:s'),

            'bank_number' => $voterData['bank_number'],
            'bank_branch_name' => str_replace(',', '', $voterData['bank_branch_name']),
            'bank_branch_number' => $voterData['bank_branch_number'],
            'bank_account_number' => $voterData['bank_account_number'],
            'bank_owner_name' => $voterData['bank_owner_name'],
            'has_bank_verify_document' => !is_null($voterData['verify_bank_document_key'])  ? $trueStr :  '',
            'is_bank_verified' => $voterData['is_bank_verified'] == 1 ? $trueStr :  '',
            'validation_election_campaign_id' => ($voterData['validation_election_campaign_id'] == $currentCampaignId)  ? $trueStr :  '',

            'is_activists_lock' => !empty($paymentRoleData['lock_date']) ? $trueStr : $falseStr,
            'comment' => "$comment"
        ];
        $verifiedStatusTitles = [
            'NO_MESSAGE_SENT' => 'טרם נשלחה הודעה',
            'MESSAGE_SENT' => 'נשלחה הודעה',
            'VERIFIED' => 'מאומת',
            'REFUSED' => 'מסרב',
            'MORE_INFO' => 'לבירור נוסף'
        ];
        $statuses = config('constants.activists.verified_status');
        foreach ($statuses as $key => $Value) {
            if ($roleData['verified_status'] == $Value) {
                $exportRow['election_role_verified_status'] = $verifiedStatusTitles[$key];
            }
        }

        return $exportRow;
    }
    private static function getExporVoterRow($voterData)
    {

        $exportRow = [
            'personal_identity' =>  $voterData['personal_identity'],
            'last_name' =>  $voterData['last_name'],
            'first_name' =>  $voterData['first_name'],

            'city_name' =>  $voterData['city_name'],
            'street' =>  !empty($voterData['street_name']) ? $voterData['street_name'] : $voterData['street'],
            'house' =>  $voterData['house'],
            'house_entry' =>  $voterData['house_entry'],

        ];

        return $exportRow;
    }
    /************************************** End Help fucntions: ***************************************** */


    /************************************** export AppointmentLetters ***************************************** */

    /**
     * @method exportCityAppointmentLettersFromTashbetz
     * Export ballot member city appointment letters
     * -> concat multiple tashbetz files.
     * @param $roleType: ballot role type
     * 1. ballot_leader.
     * 2. ballot_member and ballot_vice_leader.
     * @return Pdf file
     */
    public static function exportCityAppointmentLettersFromTashbetz($city, $roleType)
    {
        
        $election_role_system_names = config('constants.activists.election_role_system_names');

        $electionRoleId = ElectionRoles::where('system_name', $election_role_system_names['ballotMember'])->first()->id;

        if ($roleType == 'ballot_member') {
            $ballotRolesSystemNames = ['ballot_vice_leader', 'ballot_member'];
        } else {
            $ballotRolesSystemNames = ['ballot_leader'];
        }

        $allCityBallotActivist = MunicipalElectionsRolesService::getCityBallotsAppointmentLetters($electionRoleId,  $ballotRolesSystemNames, $city->id);
        // dd($allCityBallotActivist->toArray());
        $pdf = new PDFMerger;
        $filePath = config('constants.APPOINTMENT_LETTERS_DIRECTORY');

        foreach ($allCityBallotActivist as $item) {

            $personal_identity = Helper::addPersonalIdentityStartZero($item->personal_identity);
            $fileName =  $personal_identity . "_$item->ballot_iron_number.pdf";
            Log::info($filePath . $fileName);
            if (file_exists($filePath . $fileName)) {
                $pdf->addPDF($filePath . $fileName, 'all');
            }
        }
        try {
            $pdf->merge('download', $city->name . '_' . $roleType . '_appointment_letters.pdf', 'P');
        } catch (\Throwable $th) {
            Log::info($th);
        }
    }
    /**
     * @method exportCityAppointmentLetters
     * Print an AppointmentLetters pdf file for all city.
     * @param $roleType: ballot role type
     * 1. ballot_leader.
     * 2. ballot_member and ballot_vice_leader.
     * 3. observer.
     * @return print Pdf file
     */
    public static function exportCityAppointmentLetters($city, $roleType)
    {
        // \DB::enableQueryLog();

        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;

   

        if ($roleType == 'ballot_member') {
            $ballotRolesSystemNames = ['ballot_vice_leader', 'ballot_member'];
        } else if ($roleType == 'observer') {
            $ballotRolesSystemNames = ['observer', 'counter'];
        } else {
            $ballotRolesSystemNames = ['ballot_leader'];
        }

        $cityElectionRolesData = ElectionRolesByVotersRepository::getDetailsActivistForAppointmentLetterByBallotBoxRole( $ballotRolesSystemNames,$currentCampaignId,$city);
      
        $exportData = [];
  
        $exportStream = '';

        $currentFullDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $currentDateFormated = date(config('constants.SHAS_DATE_FORMAT'), time());
        $currentDate = substr($currentFullDate, 0, 10);
        $hebrewDate = self::getCurrentDate($currentDate);

        foreach ($cityElectionRolesData as $electionRoleData) {
            $personal_identity = $electionRoleData->personal_identity;

            while (strlen($personal_identity) < 9) {
                $personal_identity = '0' .    $personal_identity;
            }
            $ex_ballot_leader = '';

            $getMoreBallotDetails = false;

            $activistsAllocationsAssignments = $electionRoleData->activistsAllocationsAssignments;
            if (count($activistsAllocationsAssignments) == 0) {
                continue;
            }

            $ballotRoleId = $activistsAllocationsAssignments[0]->ballot_box_role_id;
            $ballotRoleSystemName = $activistsAllocationsAssignments[0]->ballot_box_role_system_name;
            $ballotId = $electionRoleData->ballot_box_id;

            $data = [
                'first_name' => $electionRoleData->first_name,
                'last_name' => $electionRoleData->last_name,
                'personal_identity' => $personal_identity,

                'city_name' => $electionRoleData->city_name,
                'street_name' => $electionRoleData->street_name,
                'house' => $electionRoleData->house,
            ];

            if ($roleType != 'observer') {
                foreach ($activistsAllocationsAssignments as $i => $geo) {
                    $exBallotLeader = '';
                    $previousLeader = null;
                    $previousLeaderPersonalIdentity = '';
                    $previousLeaderFirstName = '';
                    $previousLeaderLastName = '';
                    if ($ballotRoleSystemName == 'ballot_leader' && count($geo->otherActivistAllocationAssignment) > 1) { // If activist was in the first or all_day shifts
                        foreach ($geo->otherActivistAllocationAssignment as $otherGeo) {
                            if ($otherGeo->id == $geo->geo_id) break;
                            $previousLeader = $otherGeo;
                        }
                        if ($previousLeader) {
                            $previousLeaderPersonalIdentity = $previousLeader->personal_identity;
                            $previousLeaderFirstName = $previousLeader->first_name;
                            $previousLeaderLastName = $previousLeader->last_name;
                        }
                    }

                    $ballot_iron_number = $geo->ballot_iron_number;
                    $miId = $geo->ballot_mi_id;
                    $ballot_mi_id = substr_replace($miId, ".", strlen($miId) - 1, 0);
                    $address = "$geo->cluster_street_name $geo->cluster_house";
                    $cities_and_ballots = "$geo->cluster_city_name $ballot_mi_id";

                    switch ($geo->election_role_shift_system_name) {
                        case config('constants.activists.role_shifts.FIRST'):
                        case config('constants.activists.role_shifts.ALL_DAY'):
                        case config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'):
                            $shift_name = "ראשונה";
                            $shiftNumber = 1;
                            break;

                        case config('constants.activists.role_shifts.SECOND'):
                        case config('constants.activists.role_shifts.SECOND_AND_COUNT'):
                            $shift_name = "שניה";
                            $shiftNumber = 2;
                            break;

                        case config('constants.activists.role_shifts.COUNT'):
                            //other election roles includes this shift
                            if (
                                count($geo->otherActivistAllocationAssignment) > 0 &&
                                (count($geo->otherActivistAllocationAssignment) == 1 ||
                                    $geo->otherActivistAllocationAssignment[0]->election_role_shift_system_name != config('constants.activists.role_shifts.ALL_DAY'))
                            ) {
                                $shift_name = "שלישית";
                                $shiftNumber = 3;
                            } else {
                                $shift_name = "שניה";
                                $shiftNumber = 2;
                            }
                            break;
                    }

                    $ballotsAddress = "$geo->cluster_name, $address";

                    $cities_and_ballots_address = " $geo->cluster_name, כתובת: $address";

                    $ballorBoxRoleRight = (mb_strlen($geo->ballot_box_role_appointment_letter_name, 'UTF-8') > 3) ? "280px" : "290px";

                    $data['all_geo_roles'][] = [
                        'regional_committees_name' => $geo->regional_committees_name,
                        'election_role_shift' => $i + 1,
                        'cluster_city_name' => $geo->cluster_city_name,
                        'ballots' => $ballot_mi_id,
                        'ballot_iron_number' => $ballot_iron_number,
                        'shift_name' => $shift_name,
                        'shift_number' => $shiftNumber,
                        'ballots_address' => $ballotsAddress,
                        'cities_and_ballots' => $cities_and_ballots,
                        'cities_and_ballots_address' => $cities_and_ballots_address,
                        'ballot_prefix' => 'קלפי:',
                        'ex_ballot_leader' => $ex_ballot_leader,
                        'ballot_box_role_appointment_letter_name' => $geo->ballot_box_role_appointment_letter_name,
                        'cluster_name' => $geo->cluster_name,
                        'ballot_address' => $address,
                        'ballot_box_role_right' => $ballorBoxRoleRight,
                        'previous_leader_personal_identity' => $previousLeaderPersonalIdentity,
                        'previous_leader_first_name' => $previousLeaderFirstName,
                        'previous_leader_last_name' => $previousLeaderLastName,
                    ];
                    $data['date'] = $currentDateFormated;
                    $data['hebrew_date'] = $hebrewDate;

                    $data['ballot_role'] = $ballotRoleSystemName;

                    switch ($ballotRoleSystemName) {
                        case 'ballot_leader':  // ballot leader
                            $ballotRolePage = 'ballot_leader';
                            break;
                        case 'ballot_vice_leader': // vice ballot leader
                            $ballotRolePage = 'ballot_member';
                            break;
                        case 'ballot_member': // ballot member
                            $ballotRolePage = 'ballot_member';
                            break;
                        case 'observer': // observer
                            $ballotRolePage = 'observer';
                            break;
                        case 'counter': // counter
                            $ballotRolePage = 'observer';
                            break;
                    }

                    $exportData[] = ['page' => $ballotRolePage, 'data' => $data];
                }
            } else { // Export observer role shifts:
                $data['geo_role_data'] = '';
                $cities_and_ballots_address = [];
                foreach ($activistsAllocationsAssignments as $i => $geo) {

                    $data['regional_committees_name'] = $geo->regional_committees_name;

                    $miId = $geo->ballot_mi_id;
                    $ballot_mi_id = substr_replace($miId, ".", strlen($miId) - 1, 0);
                    $ballotAddress = "$geo->cluster_name, כתובת: $geo->cluster_city_name, $geo->cluster_street_name $geo->cluster_house";
                    $city_and_ballot = "$ballot_mi_id, ";

                    $ballotsAddress = $ballotAddress;
                    $cities_and_ballots = $city_and_ballot;

                    $cities_and_ballots_address = "$city_and_ballot $ballotAddress";
                }

                $data['cities_and_ballots_address'] = $cities_and_ballots_address;
                $data['ballot_prefix'] = 'קלפי:';
                $data['cluster_city_name'] = $geo->cluster_city_name;

                $data['date'] = $currentDateFormated;
                $data['hebrew_date'] = $hebrewDate;

                $data['ballot_role'] = $ballotRoleSystemName;
                switch ($ballotRoleSystemName) {
                    case 'ballot_leader':  // ballot leader
                        $ballotRolePage = 'ballot_leader';
                        break;
                    case 'ballot_vice_leader': // vice ballot leader
                        $ballotRolePage = 'ballot_member';
                        break;
                    case 'ballot_member': // ballot member
                        $ballotRolePage = 'ballot_member';
                        break;
                    case 'observer': // observer
                        $ballotRolePage = 'observer';
                        break;
                    case 'counter': // counter
                        $ballotRolePage = 'observer';
                        break;
                }
                //$ballotRolePage = ($ballotRole == 'ballot_vice_leader') ? 'ballot_member' : $ballotRole;
                $exportData[] = ['page' => $ballotRolePage, 'data' => $data];
            }
        }

        foreach ($exportData as $page) {
            // dump($page);
            $pageName = $page['page'];
            $data = $page['data'];
            $data['publicLocation'] = secure_asset('/Images/appointment_letters/');
            // $data['publicLocation'] = asset('/Images/appointment_letters/');
            $exportStream .= view("appointment_letters.$pageName", $data);
        }
        // dd($cityElectionRolesData->toArray());
        return view("appointment_letters.header") .
            $exportStream .
            view("appointment_letters.footer");
    }

    /**
     * @method exportAppointmentLetter
     * Print an Appointment Letter pdf for activits.
     * -> Find the activist
     * -> Sent to the export function - according to the activit type
     * 1. ballot_leader, ballot_member and ballot_vice_leader.
     * 2. counter and observer.
     * 
     * @param $ballotId: ballot id
     * @param $electionRoleKey: electionRoleByVoter key
     * 
     * @return print Pdf file
     */
    public static function exportAppointmentLetter($electionRoleKey, $ballotId, $isBase64 = null)
    {

        $role_voter_system_name = ElectionRolesByVotersRepository::getSystemNameElectionRoleVoterByKey($electionRoleKey);
        $election_role_system_names = config('constants.activists.election_role_system_names');
        if ($role_voter_system_name == $election_role_system_names['counter'] || $role_voter_system_name ==  $election_role_system_names['observer']) {
            //election role voter key of activist for create manully appointemnt letter
            $electionRoleByVoterKey = $electionRoleKey;
            return self::exportAppointmentLetterManually($electionRoleByVoterKey, $ballotId, $isBase64);
        } else {
            return self::exportAppointmentLetterFromTashbetz($electionRoleKey, $ballotId);
        }
    }
    public static function exportAppointmentLetterManually($electionRoleVoterKey, $ballotId, $isBase64)
    {
      
        ini_set("pcre.backtrack_limit", "10000000000");
        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;

        $ballot = BallotBoxesRepository::getBallotBoxRoleByBallotBoxId($ballotId);
       
        if (!$ballot) {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!קלפי לא קיים</h1>";
            return;
        }
        $ballotRoleId = $ballot->ballot_box_role_id;
        $ballotRoleSystemName = $ballot->ballot_box_role_system_name;
        $electionRoleData = ElectionRolesByVotersRepository::getDetailsAssignmentObserveOrCounterForAppointmentLetter($electionRoleVoterKey,$ballotRoleId,$currentCampaignId);

        if (!$electionRoleData) {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!תפקיד לא קיים</h1>";
            return;
        }
        if (count($electionRoleData->activistsAllocationsAssignments) == 0) {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצא שיבוץ לפעיל</h1>";
            return;
        }

        $personal_identity = $electionRoleData->personal_identity;

        while (strlen($personal_identity) < 9) {
            $personal_identity = '0' .    $personal_identity;
        }
        $ex_ballot_leader = '';

        $getMoreBallotDetails = false;

        $activistsAllocationsAssignments = $electionRoleData->activistsAllocationsAssignments;

        $data = [
            'first_name' => $electionRoleData->first_name,
            'last_name' => $electionRoleData->last_name,
            'personal_identity' => $personal_identity,

            'city_name' => $electionRoleData->city_name,
            'street_name' => $electionRoleData->street_name,
            'house' => $electionRoleData->house,
        ];
        $allGeoRoles = [];

        if ($ballotRoleSystemName != 'observer' && $ballotRoleSystemName != 'counter') {
            foreach ($activistsAllocationsAssignments as $i => $geo) {
                $exBallotLeader = '';
                $previousLeader = null;
                $previousLeaderPersonalIdentity = '';
                $previousLeaderFirstName = '';
                $previousLeaderLastName = '';
                if ($ballotRoleSystemName == 'ballot_leader' && count($geo->otherActivistAllocationAssignment) > 1) { // If activist was in the first or all_day shifts
                    foreach ($geo->otherActivistAllocationAssignment as $otherGeo) {
                        if ($otherGeo->id == $geo->geo_id) break;
                        $previousLeader = $otherGeo;
                    }
                    if ($previousLeader) {
                        $previousLeaderPersonalIdentity = $previousLeader->personal_identity;
                        $previousLeaderFirstName = $previousLeader->first_name;
                        $previousLeaderLastName = $previousLeader->last_name;
                    }
                }

                $miId = $geo->ballot_mi_id;
                $ballot_iron_number = $geo->ballot_iron_number;
                $ballot_mi_id = substr_replace($miId, ".", strlen($miId) - 1, 0);
                $address = "$geo->cluster_street_name $geo->cluster_house";
                $cities_and_ballots = "$geo->cluster_city_name $ballot_mi_id";

                switch ($geo->election_role_shift_system_name) {
                    case config('constants.activists.role_shifts.FIRST'):
                    case config('constants.activists.role_shifts.ALL_DAY'):
                    case config('constants.activists.role_shifts.ALL_DAY_AND_COUNT'):
                        $shift_name = "ראשונה";
                        $shiftNumber = 1;
                        break;

                    case config('constants.activists.role_shifts.SECOND'):
                    case config('constants.activists.role_shifts.SECOND_AND_COUNT'):
                        $shift_name = "שניה";
                        $shiftNumber = 2;
                        break;

                    case config('constants.activists.role_shifts.COUNT'):
                        //other election roles includes this shift
                        if (
                            count($geo->otherActivistAllocationAssignment) == 1 ||
                            $geo->otherActivistAllocationAssignment[0]->election_role_shift_system_name != config('constants.activists.role_shifts.ALL_DAY')
                        ) {
                            $shift_name = "שלישית";
                            $shiftNumber = 3;
                        } else {
                            $shift_name = "שניה";
                            $shiftNumber = 2;
                        }
                        break;
                }
                $emptyHomeNum = !empty($geo->cluster_house) ? '' : '0';
                $ballotsAddress = "$geo->cluster_name, $address";

                $cities_and_ballots_address = " $geo->cluster_name, כתובת: $address";

                $ballorBoxRoleRight = (mb_strlen($geo->ballot_box_role_appointment_letter_name, 'UTF-8') > 3) ? "290px" : "300px";

                $geoData = [
                    'regional_committees_name' => $geo->regional_committees_name,
                    'election_role_shift' => $i + 1,
                    'cluster_city_name' => $geo->cluster_city_name,
                    'ballots' => $ballot_mi_id,
                    'ballot_iron_number' => $ballot_iron_number,
                    'shift_name' => $shift_name,
                    'shift_number' => $shiftNumber,
                    'ballots_address' => $ballotsAddress,
                    'cities_and_ballots' => $cities_and_ballots,
                    'cities_and_ballots_address' => $cities_and_ballots_address,
                    'ballot_prefix' => 'קלפי:',
                    'ex_ballot_leader' => $ex_ballot_leader,
                    'ballot_box_role_appointment_letter_name' => $geo->ballot_box_role_appointment_letter_name,
                    'cluster_name' => $geo->cluster_name,
                    'ballot_address' => "$address" . "$emptyHomeNum",
                    'ballot_box_role_right' => $ballorBoxRoleRight,
                    'previous_leader_personal_identity' => $previousLeaderPersonalIdentity,
                    'previous_leader_first_name' => $previousLeaderFirstName,
                    'previous_leader_last_name' => $previousLeaderLastName,
                ];

                $allGeoRoles[] = $geoData;
            }
        } else {
            $cities_and_ballots_address = [];
            foreach ($activistsAllocationsAssignments as $i => $geo) {

                $geoData = [];
                $data['regional_committees_name'] = $geo->regional_committees_name;

                $miId = $geo->ballot_mi_id;
                $ballot_mi_id = substr_replace($miId, ".", strlen($miId) - 1, 0);
                $ballotAddress = "$geo->cluster_name, כתובת: $geo->cluster_city_name, $geo->cluster_street_name $geo->cluster_house";
                $city_and_ballot = "$ballot_mi_id, ";

                $ballotsAddress = $ballotAddress;
                $cities_and_ballots = $city_and_ballot;

                $cities_and_ballots_address = "$city_and_ballot $ballotAddress";
            }

            $data['cities_and_ballots_address'] = $cities_and_ballots_address;
            $data['ballot_prefix'] = 'קלפי:';

            $data['cluster_city_name'] = $geo->cluster_city_name;
        }

        $currentFullDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $currentDate = substr($currentFullDate, 0, 10);

        $data['date'] = date(config('constants.SHAS_DATE_FORMAT'), time());
        $data['hebrew_date'] = self::getCurrentDate($currentDate);

        $data['all_geo_roles'] = $allGeoRoles;

        $data['ballot_role'] = $ballotRoleSystemName;
        if (!$isBase64) {
            $data['publicLocation'] = secure_asset('/Images/appointment_letters/');
        } else { // From shibutz server!
            $data['publicLocation'] = env('MUNI_LOGIN_BASE_URL') . 'Images/appointment_letters/';
        }
        // $data['publicLocation'] = asset('/Images/appointment_letters/');
        switch ($ballotRoleSystemName) {
            case 'ballot_leader':  // ballot leader
                $ballotRolePage = 'ballot_leader';
                break;
            case 'ballot_vice_leader': // vice ballot leader
                $ballotRolePage = 'ballot_member';
                break;
            case 'ballot_member': // ballot member
                $ballotRolePage = 'ballot_member';
                break;
            case 'observer': // observer
                $ballotRolePage = 'observer';
                break;
            case 'counter': // counter
                $ballotRolePage = 'observer';
                break;
        }

        Log::info($data);
        $returnData = view("appointment_letters.header") .
            view("appointment_letters.$ballotRolePage", $data) .
            view("appointment_letters.footer");

        if ($isBase64) { // From shibutz server!
            $returnData = base64_encode($returnData);
        }
        return $returnData;
    }
    /**
     * @method exportAppointmentLetterFromTashbetz
     * Export ballot member city appointment letters
     * -> concat multiple tashbetz files.
     * @param $ballotId: ballot id
     * @param $electionRoleKey: electionRoleByVoter key
     * -> find the activist pdf
     * -> according to: 1. ballot iron number 2. Personal identity.
     * 
     * @return Pdf file
     */
    public static function exportAppointmentLetterFromTashbetz($electionRoleKey, $ballotId)
    {

        $electionRoleData = VotersActivistsService::checkIfActivistHasBallotAllocation($electionRoleKey, $ballotId);

        if (!$electionRoleData) {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!שיבוץ לא נמצא</h1>";
            return;
        }
        $personal_identity = Helper::addPersonalIdentityStartZero($electionRoleData->personal_identity);
        $fileName =  $personal_identity . "_$electionRoleData->ballot_mi_iron_number.pdf";
        $filePath = config('constants.APPOINTMENT_LETTERS_DIRECTORY');
        // dd("$filePath$fileName");
        if (!file_exists($filePath . $fileName)) {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!לא נמצא קובץ שיבוץ</h1>";
            return;
        }
        // dd($filePath);
        FileService::downloadFile($filePath, $fileName, 'קובץ', 'pdf');
        return;
    }
    private static function getCurrentDate($currentDate)
    {
        $jd = gregoriantojd(substr($currentDate, 5, 2), substr($currentDate, 8, 2),  substr($currentDate, 0, 4));
        $str = jdtojewish($jd, true, CAL_JEWISH_ADD_GERESHAYIM);
        $hebrewDate = iconv('WINDOWS-1255', 'UTF-8', $str);
        $hebrewDate = str_replace('התשפ', 'תשפ', $hebrewDate);
        return $hebrewDate;
    }
    public static function exportObserverLetterForBallotLeader($electionRoleKey)
    {

        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;
        $fields = [
            'election_roles.system_name',
            'election_roles_by_voters.id',
            'voters.first_name', 'voters.last_name', 'voters.personal_identity', 'voters.house',
            'cluster_city.name as cluster_city_name',
            DB::raw('IFNULL(cities.name, voters.mi_city) as city_name'),
            DB::raw('IFNULL(streets.name, voters.mi_street) as street_name'),
            DB::raw('IFNULL(regional_election_committees.name,"כל האזורים") as regional_committees_name'),
        ];

        $electionRoleData = ElectionRolesByVoters::select($fields)
            ->withElectionRole(false)
            ->withVoter()
            ->leftJoin('cities', 'cities.id', '=', 'voters.mi_city_id')
            ->leftJoin('streets', 'streets.id', 'voters.mi_street_id')

            ->join('cities as cluster_city', 'cluster_city.id', '=', 'election_roles_by_voters.assigned_city_id')
            ->leftJoin('cities_in_regional_election_committees', 'cities_in_regional_election_committees.city_id', 'election_roles_by_voters.assigned_city_id')
            //Need to Check election capmaign id!
            ->leftJoin('regional_election_committees', 'regional_election_committees.id', 'cities_in_regional_election_committees.regional_election_committee_id')

            ->where('election_roles_by_voters.key', $electionRoleKey)
            ->where('election_roles_by_voters.election_campaign_id', $currentCampaignId)
            ->whereIn('election_roles.system_name', ['cluster_leader', 'motivator'])

            ->first();
        // echo json_encode($electionRoleData); die;
        if (!$electionRoleData) {
            echo "<h1 style='color:red;text-align: center;margin-top:30px;'>!תפקיד לא קיים</h1>";
            return;
        }
        $personal_identity = $electionRoleData->personal_identity;

        while (strlen($personal_identity) < 9) {
            $personal_identity = '0' .    $personal_identity;
        }

        $data = [
            'first_name' => $electionRoleData->first_name,
            'last_name' => $electionRoleData->last_name,
            'personal_identity' => $personal_identity,

            'city_name' => $electionRoleData->city_name,
            'street_name' => $electionRoleData->street_name,
            'house' => $electionRoleData->house,
            ////
            'regional_committees_name' =>  $electionRoleData->regional_committees_name,
            'cities_and_ballots_address' => '',
            'ballot_prefix' => '',
            'cluster_city_name' => $electionRoleData->cluster_city_name,
        ];
        //Current date:
        $currentFullDate = date(config('constants.APP_DATETIME_DB_FORMAT'), time());
        $currentDate = substr($currentFullDate, 0, 10);

        $data['date'] = date(config('constants.SHAS_DATE_FORMAT'), time());
        $data['hebrew_date'] = self::getCurrentDate($currentDate);
        // End Current date:

        $emptyGeoRole = [];
        $data['all_geo_roles'] = [];
        $data['publicLocation'] = secure_asset('/Images/appointment_letters/');
        // $data['publicLocation'] = asset('/Images/appointment_letters/');

        $returnData = view("appointment_letters.header") .
            view("appointment_letters.observer", $data) .
            view("appointment_letters.footer");

        // echo(json_encode($returnData)); die;

        return $returnData;
    }
    /**************************************End  export AppointmentLetters ***************************************** */
}
