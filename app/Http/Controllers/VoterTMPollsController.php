<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tm\Call;
use App\Models\Voters;
use Illuminate\Support\Facades\DB;

class VoterTMPollsController extends Controller {
    public function getAllVoterPolls($voterKey) {
		$jsonOutput = app()->make("JsonOutput");
		$voter = Voters::select('id')->where('key',$voterKey)->first();
		if (!$voter) {
            $jsonOutput->setErrorCode(config('errors.elections.VOTER_DOES_NOT_EXIST'));
            return;
        }
        $voterCalls = Call::select(
			'calls.id','calls.campaign_id' , 'calls.voter_id' , 'calls.questionnaire_id' , 'calls.phone_number',
			'campaigns.name as campaign_name' , 'calls.audio_file_name' , 'calls.created_at' , 'call_notes.note'
			)
							->selectRaw("CONCAT(user_voter.first_name , ' ' ,user_voter.last_name) as agent_name , IF(calls.call_end_date is NULL , NULL , TIMEDIFF(calls.call_end_date , calls.created_at)) as call_duration_seconds")
							->selectRaw("
								(
									CASE 
										WHEN call_end_status=".config('tmConstants.call.status.SUCCESS')." THEN 'בוצעה בהצלחה'
										WHEN call_end_status=".config('tmConstants.call.status.GET_BACK')." THEN 'חזור אליי'
										WHEN call_end_status=".config('tmConstants.call.status.LANGUAGE')." THEN 'שפה'
										WHEN call_end_status=".config('tmConstants.call.status.ANSWERING_MACHINE')." THEN 'מענה קולי'
										WHEN call_end_status=".config('tmConstants.call.status.GOT_MARRIED')." THEN 'התחתן'
										WHEN call_end_status=".config('tmConstants.call.status.CHANGED_ADDRESS')." THEN 'כתובת השתנתה'
										WHEN call_end_status=".config('tmConstants.call.status.FAX_TONE')." THEN 'צליל פקס'
										WHEN call_end_status=".config('tmConstants.call.status.HANGED_UP')." THEN 'שיחה התנתקה'
										WHEN call_end_status=".config('tmConstants.call.status.WRONG_NUMBER')." THEN 'מספר שגוי'
										WHEN call_end_status=".config('tmConstants.call.status.NON_COOPERATIVE')." THEN 'לא משתף פעולה'
										WHEN call_end_status=".config('tmConstants.call.status.BUSY')." THEN 'עסוק'
										WHEN call_end_status=".config('tmConstants.call.status.DISCONNECTED_NUMBER')." THEN 'מספר מנותק'
										WHEN call_end_status=".config('tmConstants.call.status.UNANSWERED')." THEN 'אין מענה'
										WHEN call_end_status=".config('tmConstants.call.status.ABANDONED')." THEN 'ניתוק שיחה'
									END
								) as call_end_status
							")
							->selectRaw("IF((select count(*) from voters_answers where voters_answers.voter_id = calls.voter_id and voters_answers.call_id = calls.id and voters_answers.deleted =0 and voters_answers.answered=1) = 0 , IF(call_notes.note is NULL , 0 , -1),1) as answered_poll")
							//->selectRaw("(select id from questions where questions.questionnaire_id = calls.questionnaire_id) as t")
							->join('campaigns' , 'campaigns.id','=','calls.campaign_id')
							->join('users' , 'users.id','=','calls.user_id')
							->join('voters as user_voter' , 'user_voter.id','=','users.voter_id')
							->leftJoin('call_notes' , function($joinOn){
								$joinOn->on('call_notes.call_id','=','calls.id')
									   ->on('call_notes.deleted' , '=',DB::raw(0));
							})
							//->with('questionnaire')
							->where('calls.deleted',0)
							->where('calls.voter_id',$voter->id)
							->get();
		for($i = 0 ; $i< count($voterCalls) ;$i++){
			$voterCalls[$i]->questions = [];
			if($voterCalls[$i]->answered_poll == 1){
				$voterCalls[$i]->questions = DB::select("select 
															questions.id , questions.name , 
															questions.text_general,
															voters_answers.answered,
															voters_answers.answer_text
														from 
															questions left join voters_answers	
																on  questions.id=voters_answers.question_id and
																	voters_answers.deleted=0 and
																	voters_answers.voter_id=".$voterCalls[$i]->voter_id." and
																	voters_answers.call_id=".$voterCalls[$i]->id."

														where 
															questions.questionnaire_id=".$voterCalls[$i]->questionnaire_id."  and 
															questions.deleted=0 

														");
			}
		}
        $jsonOutput->setData($voterCalls);
    }
}
