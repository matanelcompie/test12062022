<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tm\VotersAnswer;
use App\Libraries\Helper;


class VotersAnswerController extends Controller {

    private $errorMessageList = [
        'There is no reference key to delete element.',
        'There is no reference key to update element.',
        'There are missing data to update.',
        'submitted order is not valid.',
        'submitted keys are not valid.'
    ];
    /* VotersAnswers */

	/*
		Function that returns all voter answers list
	*/
    public function getVotersAnswers() {
        $jsonOutput = app()->make("JsonOutput");
        $result = VotersAnswer::where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }
    
	/*
		Function that delete voter-answer by its key in the table
	*/
    public function deleteVotersAnswer(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        if($key) {
            VotersAnswer::where('key', $key)->update(['deleted' => 1]);
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that update voter-answer by its key and POST data params
	*/
    public function updateVotersAnswer(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $voters_answer = VotersAnswer::where('key',$key)->first();
            $voters_answer->update([
                'question_id' => $request->input('question_id'),
                'voter_id' => $request->input('voter_id'),
                'possible_answer_id' => $request->input('possible_answer_id'),
                'answer_text' => trim($request->input('answer_text')),
                'answered' => $request->input('answered'),
                'call_id' => $request->input('call_id'),
            ]);
            $jsonOutput->setData($voters_answer);
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[1]);
        }
    }

	/*
		Function that adds new voter-answer to table by POST params
	*/
    public function addVotersAnswer(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $voters_answer = VotersAnswer::create([
            'key' => Helper::getNewTableKey('voters_answers', 10),
            'question_id' => $request->input('question_id'),
            'voter_id' => $request->input('voter_id'),
            'possible_answer_id' => $request->input('possible_answer_id'),
            'answer_text' => trim($request->input('answer_text')),
            'answered' => $request->input('answered'),
            'call_id' => $request->input('call_id'),
        ]);

        $jsonOutput->setData($voters_answer);
    }

	/*
		Function that adds MULTI voter-answers to table by POST params IN A BULK
	*/
    public function addVotersAnswersBulk(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $new_voters_answers = $request->input('vaArray');

        $result = array();
        foreach ($new_voters_answers as $new_voters_answer) {
            $new_voters_answer['key'] = Helper::getNewTableKey('voters_answers', 10);
            $voters_answer = VotersAnswer::create($new_voters_answer);
            array_push($result, $voters_answer);
        }

        $jsonOutput->setData($result);
    }

}
