<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Traits\SpecialSoftDeletes;
use Illuminate\Database\Eloquent\Builder;

/**
 * @property integer $id
 * @property string $key
 * @property integer $questionnaire_id
 * @property string $name
 * @property string $text_general
 * @property string $text_male
 * @property string $text_female
 * @property string $information_to_update
 * @property integer $type
 * @property boolean $active
 * @property integer $next_question_id
 * @property integer $admin_order
 * @property boolean $required
 * @property string $created_at
 * @property string $updated_at
 */
class Question extends KeyedModel
{
    use SpecialSoftDeletes;

    public $primaryKey = 'id';
    protected $table = 'questions';

    /**
     * @var array
     */
    protected $fillable = [
        'questionnaire_id',
        'name',
        'text_general',
        'text_male',
        'text_female',
        'information_to_update',
        'type',
        'active',
        'next_question_id',
        'admin_order',
        'required',
        'possible_answers'
    ];

    protected $visible = [
        'id',
        'key',
        'name',
        'text_general',
        'text_male',
        'text_female',
        'information_to_update',
        'type',
        'active',
        'next_question_id',
        'admin_order',
        'created_at',
        'updated_at',
        'possible_answers',
        'answered',
    ];

    protected $with = ['possible_answers'];
    protected $appends = ['answered'];

    const TYPE_RADIO = 1;
    const TYPE_MULTIPLE = 2;
    const TYPE_ONE_LINE_TEXT = 3;
    const TYPE_MULTIPLE_LINES_TEXT = 4;
    const TYPE_DATE = 5;
    const TYPE_TIME = 6;
    const TYPE_DATE_TIME = 7;
    const TYPE_MESSAGE = 8;

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('order', function (Builder $builder) {
            $builder->orderBy('admin_order', 'asc');
        });

        static::created(function ($model)
        {
            $model->possible_answers()->saveMany($model->possible_answers);
        });

        static::deleting(function ($model) {
            if ($model->answered){
                return false;
            }
        });
    }

    /**
     * Returns the related questionnaire to this question.
     */
    public function questionnaire()
    {
        return $this->belongsTo(Questionnaire::class);
    }

    /**
     * Returns the next question in this questionnaire.
     */
    public function nextQuestion()
    {
        return $this->belongsTo(Question::class, 'next_question_id');
    }

    /**
     * Returns the possible answers to this question.
     */
    public function possible_answers()
    {
        return $this->hasMany(PossibleAnswer::class);
    }

    /**
     * Returns the voters' answers to this question.
     */
    public function voters_answers()
    {
        return $this->hasMany(VotersAnswer::class);
    }

    public function getAnsweredAttribute()
    {
        return $this->voters_answers->isNotEmpty();
    }

    public function setPossibleAnswersAttribute($value)
    {
        $this->possible_answers()->whereNotIn('key',collect($value)->pluck('key')->filter())->delete();
        foreach ($value as $pa_partial) {
            if (!isset($this->key)) {
                $this->possible_answers->push(new PossibleAnswer($pa_partial));
            } else {
                if (!isset($pa_partial['key']) || collect($this->possible_answers()->firstOrNew(['key' => $pa_partial['key']]))->isEmpty()) {
                    // will get here if there's no key or if the key is not on this question (to prevent injection)
                    $pa_partial['key'] = null;
                }
                $this->possible_answers()->updateOrCreate(['key' => $pa_partial['key']], $pa_partial);
            }
        }
    }
}
