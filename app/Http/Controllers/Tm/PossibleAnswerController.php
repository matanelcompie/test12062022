<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tm\PossibleAnswer;
use App\Libraries\Helper;


class PossibleAnswerController extends Controller {

    private $errorMessageList = [
        'There is no reference key to delete element.',
        'There is no reference key to update element.',
        'There are missing data to update.',
        'submitted order is not valid.',
        'submitted keys are not valid.'
    ];
    
	/*
		Function that returns all possible answers
	*/
    public function getPossibleAnswers() {
        $jsonOutput = app()->make("JsonOutput");
        $result = PossibleAnswer::get();
        $jsonOutput->setData($result);
    }

	/*
		Function that delete possible answer by PossibleAnswer key
	*/
    public function deletePossibleAnswer(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        if($key) {
            PossibleAnswer::where('key', $key)->update(['deleted' => 1]);
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that updates possible answer by PossibleAnswer key and POST data
	*/
    public function updatePossibleAnswer(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $possible_answer = PossibleAnswer::where('key',$key)->first();
            $possible_answer->update([
                'question_id' => $request->input('question_id'),
                'text_general' => trim($request->input('text_general')),
                'text_male' => trim($request->input('text_male')),
                'text_female' => trim($request->input('text_female')),
                'active' => $request->input('active'),
                'order' => $request->input('order'),
                'jump_to_question_id' => $request->input('jump_to_question_id'),
            ]);
            $jsonOutput->setData($possible_answer);
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[1]);
        }
    }

	/*
		Function that adds new possible answer by POST data
	*/
    public function addPossibleAnswer(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $possible_answer = PossibleAnswer::create([
            'question_id' => $request->input('question_id'),
            'text_general' => trim($request->input('text_general')),
            'text_male' => trim($request->input('text_male')),
            'text_female' => trim($request->input('text_female')),
            'active' => $request->input('active'),
            'order' => $request->input('order'),
            'jump_to_question_id' => $request->input('jump_to_question_id'),
        ]);

        $jsonOutput->setData($possible_answer);
    }

}
