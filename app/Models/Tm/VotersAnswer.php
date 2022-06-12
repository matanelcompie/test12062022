<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Models\Voters;
use App\Traits\SpecialSoftDeletes;

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
class VotersAnswer extends KeyedModel
{
    use SpecialSoftDeletes;
    public $primaryKey = 'id';
    protected $table = 'voters_answers';

    /**
     * @var array
     */
    protected $fillable = [
        'question_id',
        'voter_id',
        'possible_answer_id',
        'answer_text',
        'answered',
        'call_id',
        'question_key',
        'possible_answer_key',
    ];
    protected $appends = ['question_key', 'possible_answer_key'];

    /**
     * Returns the related question to this answer.
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Returns the related voter to this answer.
     */
    public function voter()
    {
        return $this->belongsTo(Voters::class, 'voter_id');
    }

    /**
     * Returns the related possible answer to this actual answer.
     */
    public function possibleAnswer()
    {
        return $this->belongsTo(PossibleAnswer::class);
    }

    /**
     * Returns the related call to this answer.
     */
    public function call()
    {
        return $this->belongsTo(Call::class);
    }

    public function setQuestionKeyAttribute($value)
    {
        $question = Question::findByKey($value);
        $this->question()->associate($question);
    }

    public function getQuestionKeyAttribute()
    {
        return $this->question->key;
    }

    public function setPossibleAnswerKeyAttribute($value)
    {
        $possibleAnswer = PossibleAnswer::findByKey($value);
        $this->possibleAnswer()->associate($possibleAnswer);
    }

    public function getPossibleAnswerKeyAttribute()
    {
        if($this->possibleAnswer){
            return $this->possibleAnswer->key;
        }
    }
}
