<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\ActionController;
use App\Http\Controllers\Controller;
use App\Libraries\Services\CampaignService;
use App\Libraries\Services\ExportService;

use DB;
use App\Models\ElectionCampaigns;
use App\Models\Tm\Call;
use App\Models\Tm\Question;
use App\Models\Tm\VotersAnswer;
use App\Models\Tm\Questionnaire;
use Illuminate\Http\Request;

class QuestionnaireController extends Controller
{

    private $errorMessageList = [
        'There is no reference key to delete element.',
        'There is no reference key to update element.',
        'There are missing data to update.',
        'submitted order is not valid.',
        'submitted keys are not valid.',
    ];
	
    /* 
		Function that returns all questionairs
	*/
    public function getQuestionnaires()
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        $result = Questionnaire::get();
        $jsonOutput->setData($result);
    }
	
    /*
		Function that returns a spicific questionaire object only by questionaire key
	*/
    public function getQuestionnaire($key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        $questionnaire = Questionnaire::where('key', $key)->first();
        $jsonOutput->setData($questionnaire->makeHidden('questions'));
    }

	/*
		Function that returns a spicific questionaire with its questions by questionaire key
	*/
    public function getQuestionnaireFull($key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        $questionnaire = Questionnaire::where('key', $key)->first();
        $jsonOutput->setData($questionnaire);
    }

	/*
		Function that deletes questionaire by its key
	*/
    public function deleteQuestionnaire(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        $delete = empty($request['delete']) ? false : true;
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.delete')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        if ($key) {
            $questionnaire = Questionnaire::where('key', $key)->first();
            CampaignService::updateRedisCampaignQuestionnaireChanged($questionnaire->campaign_id, $questionnaire->active);
            $questionnaire->update(['deleted' => $delete, 'active' => false]);
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that updates specific questionaire by its key and POST data
	*/
    public function updateQuestionnaire(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.delete')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }

        // if (!$request->input('name')) { // cant check name, Because you can only update a campaign without update the name
        //     $jsonOutput->setErrorCode(config('errors.global.MISSING_ACTION_DETAILS'));
        //     return;
        // }
        if ($key) {
            $questionnaire = Questionnaire::where('key', $key)->first();
			
			$modelsList = [];
			$fieldsArray = [];
			if($request->input("name") != $questionnaire->name){
				$fieldsArray[] = [
						'field_name' => 'name',
						'display_field_name' => config('history.CampaignQst.name'),
						'new_value' => $request->input("name"), 
						'old_value' => $questionnaire->name 
				];
			}
			
			if($request->input("description") != $questionnaire->description){
				$fieldsArray[] = [
						'field_name' => 'description',
						'display_field_name' => config('history.CampaignQst.description'),
						'new_value' => $request->input("description"), 
						'old_value' => $questionnaire->description
				];
			}
			
			if(count($fieldsArray) > 0 ){
				$modelsList[] = [
					'description' => 'עריכת שאלון קיים בקמפיין',
					'referenced_model' => 'TmCampaignQuestionnaire',
					'referenced_model_action_type' => config('constants.ACTION_HISTORY_REFERENCED_MODEL_ACTION_TYPE_EDIT'),
					'referenced_id' => $questionnaire->id,
					'valuesList' => $fieldsArray
				];
		
				$historyArgsArr = [
					'topicName' => ('tm.campaign.questionnaire.edit'),
					'models' => $modelsList,
				];

				ActionController::AddHistoryItem($historyArgsArr);
			}
			
            $questionnaire->update($request->all());
			
			
            CampaignService::updateRedisCampaignQuestionnaireChanged($questionnaire->campaign_id, $questionnaire->active);

            $jsonOutput->setData($questionnaire->fresh());
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[1]);
        }
    }
    /*
		Function that adds new questionaire
	*/
    public function addQuestionnaire(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.add')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        $questionnaire = Questionnaire::create($request->all());

        $jsonOutput->setData(Questionnaire::full()->find($questionnaire->id));
    }

	/*
		Function that adds new question to specific questionnaire
	*/
    public function addQuestion(Request $request, $questionnaireKey)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.add') && !GlobalController::isActionPermitted('tm.campaign.questionnaire.edit')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        $questionnaire = Questionnaire::where('key', $questionnaireKey)->full()->first();
        $questionnaire->questions()->create($request->all());
        CampaignService::updateRedisCampaignQuestionnaireChanged($questionnaire->campaign_id, $questionnaire->active);

        $jsonOutput->setData(Questionnaire::full()->find($questionnaire->id));
    }

	/*
		Function that updates question by its key , and POST data
	*/
    public function upsertQuestion(Request $request, $key, $questionId = null)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.add') && !GlobalController::isActionPermitted('tm.campaign.questionnaire.edit')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        $questionnaire = Questionnaire::where('key', $key)->first();
        $question = $questionnaire->questions()
            ->updateOrCreate(['id' => $questionId], $request->all());
        CampaignService::updateRedisCampaignQuestionnaireChanged($questionnaire->campaign_id, $questionnaire->active);
        $jsonOutput->setData($question);
    }

	/*
		Function that deletes a question by its key
	*/
    public function deleteQuestion(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if (!GlobalController::isActionPermitted('tm.campaign.questionnaire.add') && !GlobalController::isActionPermitted('tm.campaign.questionnaire.edit') && !GlobalController::isActionPermitted('tm.campaign.questionnaire.delete')) {
            $jsonOutput->setErrorCode(config('errors.elections.ACTION_NOT_AUTHORIZED'));
            return;
        }
        if ($key) {
            $question = Question::where('key', $key)->first();
            $question->possible_answers = [];
            $question->update(['deleted' => 1]);
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }
    public function exportQuestionnaireVotersAnswersToCsv($campaignKey){
        $jsonOutput = app()->make("JsonOutput");

        $currentCampaignId = ElectionCampaigns::currentCampaign()->id;

        $questionnaire = Questionnaire::select('questionnaires.id')
        ->join('campaigns', 'campaigns.id', 'questionnaires.campaign_id')
        ->with(['questions'=>function($q){ 
            $q->select('questionnaire_id', 'type', 'name', 'id')
            ->orderBy('admin_order');
         }])
        ->where('campaigns.key', $campaignKey)
        ->first();

       $voterCalls =  Call::select([
            'voters.id', 
            'voters.personal_identity',
            DB::raw('CONCAT(voters.first_name," ",voters.last_name) as full_name'),
            'voters.mi_city_id',
            
            'employee_voter.personal_identity as employee_personal_identity',

            'calls.phone_number',
            DB::raw('DATE_FORMAT(calls.created_at,"%d/%m/%Y") as call_created_at_date'),
            DB::raw('DATE_FORMAT(calls.created_at,"%H:%i:%S") as call_created_at_hour'),
            'calls.id'
        ])
        ->join('voters', 'voters.id', 'calls.voter_id')
        ->withEmployeeVoter(true)
        ->with(['voters_answers'=>function($q){ 
            $q->select(
                'voters_answers.id', 'voters_answers.call_id',
                'voters_answers.answer_text', 'voters_answers.answered',
                'voters_answers.possible_answer_id', 'voters_answers.question_id'
            )
            ->where('voters_answers.answered', 1);
         }])
         ->whereHas('voters_answers' , function($q){ $q->where('voters_answers.answered', 1); })
         ->where('calls.questionnaire_id', $questionnaire->id)
         ->get();
        $headerRow = ['עיר מ"פ','תז תושב', 'שם מלא','מספר טלפון', 'תז נציג', 'תאריך', 'שעה'];
        $questionsHash = [];

        $index = count($headerRow);
        foreach ($questionnaire->questions as  $question) {
            if ($question->type != Question::TYPE_MULTIPLE) {
                $questionId = $question->id;
                $headerRow[] = $question->name;
                $questionsHash[$questionId] = $index;
                $index++;
            }else{ // Multiple answers question
                foreach ($question->possible_answers as $i => $pAnswer) {
                    $name = ($i == 0) ? "$question->name:" : '';
                    $headerRow[] = "$name תשובה $i - $pAnswer->text_general";

                    $questionId = "$question->id-$pAnswer->id";
                    $questionsHash[$questionId] = $index;
                    $index++;
                }
            }
        }
        $printInCsvFile = count($voterCalls) * count($headerRow) > 5000 ? true : false; //Check if the data table is big: (x * y).

        if($printInCsvFile){ //Big files - print in csv format
            $jsonOutput->setBypass(true);
            header("Content-Type: application/txt");
            header("Content-Disposition: attachment; filename=export.csv");
            $headerRowToPrint =  mb_convert_encoding(implode(',', $headerRow), "ISO-8859-8", "UTF-8") . "\n";
            echo $headerRowToPrint;
        }else{
            $xlsPrintData = [];
            $xlsPrintData[] = $headerRow;
        }

        foreach($voterCalls as $voterCall ){
            $callDate = $voterCall->call_created_at_date;
            $callTime = $voterCall->call_created_at_hour;
            $voterDataRow = [
                $voterCall->mi_city_id,
                $voterCall->personal_identity,
                $voterCall->full_name,
                $voterCall->phone_number,
                $voterCall->employee_personal_identity,
                $callDate,
                $callTime
            ];
            for ($i=count($voterDataRow); $i <count($headerRow) ; $i++) { 
                $voterDataRow[$i] = '';
            }
            foreach ($voterCall->voters_answers as $voters_answer) {

                $question_id = $voters_answer->question_id;
                $answer_text = $voters_answer->answer_text;
                $possible_answer_id = $voters_answer->possible_answer_id;

                if(!empty($questionsHash[$question_id])){ // Single answers question
                    $index = $questionsHash[$question_id];
                }else  { // Multiple answers question
                    $multiQuestionId = "$question_id-$possible_answer_id";
                    if(!empty($questionsHash[$multiQuestionId])){
                        $index = $questionsHash[$multiQuestionId];
                        $answer_text = 'כן';
                    }else{  continue;  }
                }
                if($printInCsvFile){ //Big files - print in csv format
                    $cleanText = str_replace('"', '""', $answer_text);
                    $voterDataRow[$index] = '"' . $cleanText  . '"' ;
                }else{
                    $voterDataRow[$index] = $answer_text ;
                }

            }

                
            if($printInCsvFile){ //Big files - print in csv format
                $fullRow = implode(',', $voterDataRow);
                $rowToPrint =  mb_convert_encoding($fullRow, "ISO-8859-8", "UTF-8") . "\n";
                echo $rowToPrint;
            }else{
                $xlsPrintData[] = $voterDataRow;
            }
        }

        if(!$printInCsvFile){
            return ExportService::export($xlsPrintData, 'xls', '',  []);
        }
        
    }
}
