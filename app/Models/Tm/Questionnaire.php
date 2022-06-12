<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Traits\SpecialSoftDeletes;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer $campaign_id
 * @property integer $first_question_id
 * @property string  $description
 * @property boolean $active
 * @property string  $created_at
 * @property string  $updated_at
 */
class Questionnaire extends KeyedModel {
    use SpecialSoftDeletes;

    public $primaryKey = 'id';
    protected $table = 'questionnaires';

    /**
     * @var array
     */
    protected $fillable = [
        'name',
        'campaign_id',
        'first_question_id',
        'description',
        'active',
        'questions',
    ];

    protected $visible = [
        'id',
        'key',
        'name',
        'first_question_id',
        'description',
        'active',
        'created_at',
        'updated_at',
        'questions'
    ];
    protected $with = ['questions'];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($model)
        {
            $model->questions()->saveMany($model->questions);
        });
    }


    /**
     * Returns the related campaign to this questionnaire.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    /**
     * Returns the questions in this questionnaire.
     */
    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function scopeFull($query)
    {
        return $query->with('questions');
    }

    public function setQuestionsAttribute($value)
    {
        $this->questions()->whereNotIn('key',collect($value)->pluck('key')->filter())->delete();
        foreach ($value as $q_partial) {
            if (!isset($this->key)) {
                // this is in case the questionnaire hasn't been added yet
                // the question-saving happens in a 'created' event observer
                $this->questions->push(new Question($q_partial));
            } else {
                if (!isset($q_partial['key']) || collect($this->questions()->firstOrNew(['key' => $q_partial['key']]))->isEmpty()) {
                    // will get here if there's no key or if the key is not on this questionnaire (to prevent injection)
                    $q_partial['key'] = null;
                }
                $this->questions()->updateOrCreate(['key' => $q_partial['key']], $q_partial);
            }
        }
    }

    public function setActiveAttribute($value)
    {
        if ($value == 1 && isset($this->campaign)) {
            $campaign_id = $this->campaign->id;
            Questionnaire::where('campaign_id', $campaign_id)->update(['active' => 0]);
        }
        $this->attributes['active'] = $value;
    }

    public function scopeCompact($query)
    {
        return $query->select('name', 'key', 'id');
    }
}
