<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

 
class VoterAnswers extends Model {

    public $primaryKey = 'id';
    protected $table = 'voters_answers';

	
	 public function scopeWithQuestionsAndAnswers($query) {
        $query->join('possible_answers', function ( $joinOn )  {
            $joinOn->on('possible_answers.id', '=', 'voters_answers.possible_answer_id')
                   ->on('possible_answers.question_id', '=',  'voters_answers.question_id')
				   ->where('voters_answers.deleted',0)
				   ;
        })
		->join('questions', function ( $joinOn )   {
            $joinOn->on('questions.id', '=',  'voters_answers.question_id')
				   ->where('questions.deleted',0)
				   ;
        })
		->join('questionnaires', function ( $joinOn ){
            $joinOn->on('questionnaires.id', '=',  'questions.questionnaire_id')
				   ->where('questionnaires.deleted',0)
				   ;
        })
		;
    }
    
}