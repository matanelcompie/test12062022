<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;

 
/**
 * @property integer $id
 * @property string $key
 * @property integer $question_id
 * @property integer $voter_id
 * @property integer $possible_answer_id
 * @property string $answer_text
 * @property boolean $answered
 * @property integer $call_id
 * @property string $created_at
 * @property string $updated_at
 */
class DashboardVotersAnswers extends Model
{
    public $primaryKey = 'id';
    protected $table = 'voters_answers';   
}
