<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\Controller;
use App\Libraries\Services\CampaignService;
use App\Models\Tm\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{

    private $errorMessageList = [
        'There is no reference key to delete element.',
        'There is no reference key to update element.',
        'There are missing data to update.',
        'submitted order is not valid.',
        'submitted keys are not valid.',
    ];
     
	/*
		Function that returns all questions
	*/
    public function getQuestions()
    {
        $jsonOutput = app()->make("JsonOutput");
        $result = Question::get();
        $jsonOutput->setData($result);
    }
   
   
	/*
		Function that deletes question by its key
	*/
    public function deleteQuestion(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key) {
            $question = Question::where('key', $key)->update(['deleted' => 1])->first();
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that updates question by its key and POST params
	*/
    public function updateQuestion(Request $request, $key)
    {
        $jsonOutput = app()->make("JsonOutput");
        if ($key) {
            $question = Question::where('key', $key)->first();
            $question->update($request->all());
            CampaignService::updateRedisCampaignQuestionChanged($question->questionnaire_id);
            $jsonOutput->setData(Question::find($question->id));
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[1]);
        }
    }
    
	/*
		Function that adds new question to Database
	*/
    public function addQuestion(Request $request)
    {
        $jsonOutput = app()->make("JsonOutput");
        Question::create($request->all());
        $jsonOutput->setData($question);
    }

}
