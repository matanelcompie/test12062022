<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Models\SupportStatus;
use App\Traits\SpecialSoftDeletes;
use Illuminate\Database\Eloquent\Builder;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $question_id
 * @property string  $text_general
 * @property string  $text_male
 * @property string  $text_female
 * @property boolean $active
 * @property integer $order
 * @property integer $jump_to_question_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class PossibleAnswer extends KeyedModel {
    use SpecialSoftDeletes;

    public $primaryKey = 'id';
    protected $table = 'possible_answers';

    /**
     * @var array
     */
    protected $fillable = [
        'question_id',
        'text_general',
        'text_male',
        'text_female',
        'active',
        'order',
        'jump_to_question_id',
        'support_status_id'
    ];

    protected $visible = [
        'id',
        'key',
        'text_general',
        'text_male',
        'text_female',
        'active',
        'order',
        'jump_to_question_id',
        'support_status_id',
        'created_at',
        'updated_at'
    ];

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('order', function (Builder $builder) {
            $builder->orderBy('order', 'asc');
        });
    }

    /**
     * Returns the question to which this possible answer belongs.
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Returns the question to which this possible answer should jump.
     */
    public function jumpToQuestion()
    {
        return $this->belongsTo(Question::class, 'jump_to_question_id');
    }

    public function support_status()
    {
        return $this->belongsTo(SupportStatus::class);
    }
}
