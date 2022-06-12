<?php

namespace App\Models\Tm;

use App\Models\KeyedModel;
use App\Models\User;
use App\Traits\SpecialSoftDeletes;
use Illuminate\Support\Facades\Auth;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $user_id
 * @property integer $voter_id
 * @property integer $question_id
 * @property integer $campaign_id
 * @property integer $call_end_status
 * @property string  $created_at
 * @property string  $updated_at
 */
class Call extends KeyedModel
{
    use SpecialSoftDeletes;
    public $primaryKey = 'id';
    protected $table = 'calls';

    /**
     * @var array
     */
    protected $fillable = [
        'user_id',
        'voter_id',
        'questionnaire_key',
        'campaign_key',
        'call_end_status',
        'voters_answers',
        'call_note',
        'call_end_date',
        'call_action_end_date',
        'total_seconds',
        'total_action_seconds'
    ];
    //protected $visible = ['id', 'key', 'user_id', 'voter', 'questionnaire_key', 'campaign_key', 'call_end_status', 'voters_answers', 'call_note', 'campaign_id'];
    //protected $with = ['voter.household', 'voters_answers', 'call_note'];
    //protected $appends = ['questionnaire_key', 'campaign_key', 'call_time', 'call_action_time'];
    //protected $dates = ['created_at', 'updated_at', 'call_end_date', 'call_action_end_date'];

    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($model)
        {
            $model->voters_answers()->saveMany($model->voters_answers);
        });
    }

    /**
     * Returns the related user to this call.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Returns the related voter to this call.
     */
    public function voter()
    {
        return $this->belongsTo(CtiVoter::class, 'voter_id');
    }

    /**
     * Returns the related questionnaire to this call.
     */
    public function questionnaire()
    {
        return $this->belongsTo(Questionnaire::class);
    }

    /**
     * Returns the related campaign to this call.
     */
    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
	
	public function scopeWithCampaigns($query) {

        $query->join('campaigns', 'campaigns.id', '=', 'calls.campaign_id');
    }

    /**
     * Returns the voters' answers on this call.
     */
    public function voters_answers()
    {
        return $this->hasMany(VotersAnswer::class);
    }
	
	 /**
     * Returns the voters' answers on this call.
     */
    public function one_voters_answer()
    {
        return $this->hasOne(VotersAnswer::class);
    }
	
	public function languages(){
		return $this->hasMany('App\Models\Tm\CallNote', 'language_id', 'id');
	}

    /**
     * Returns the note on this call.
     */
    public function call_note()
    {
        return $this->hasOne(CallNote::class);
    }

    public function getCampaignKeyAttribute()
    {
        return $this->campaign->key;
    }

    public function setCampaignKeyAttribute($value)
    {
        $campaign = Campaign::findByKey($value);
        $this->campaign()->associate($campaign);
    }

    public function getQuestionnaireKeyAttribute()
    {
        return $this->questionnaire->key;
    }

    public function setQuestionnaireKeyAttribute($value)
    {
        $questionnaire = Questionnaire::findByKey($value);
        $this->questionnaire()->associate($questionnaire);
    }

    public function setCallNoteAttribute($value)
    {
        if (!isset($value['key'])) {
            $value['key'] = null;
        }
        $this->call_note()->updateOrCreate(['key' => $value['key']], $value);
    }

    public function setVotersAnswersAttribute($value)
    {
        foreach ($value as $va_partial) {
            $va_partial['voter_id'] = $this->voter->id;
            if (!isset($this->key)) {
                $this->voters_answers->push(new VotersAnswer($va_partial));
            } else {
                if (!isset($va_partial['key']) || collect($this->voters_answers()->firstOrNew(['key' => $va_partial['key']]))->isEmpty()) {
                    // will get here if there's no key or if the key is not on this call (to prevent injection)
                    $va_partial['key'] = null;
                }
                $this->voters_answers()->updateOrCreate(['key' => $va_partial['key']], $va_partial);
            }
        }
    }

    public function getCallActionTimeAttribute()
    {
        return $this->call_action_end_date ? $this->call_action_end_date->diffInSeconds($this->created_at) : null;
    }

    public function getCallTimeAttribute()
    {
        return $this->call_end_date ? $this->call_end_date->diffInSeconds($this->created_at) : null;
    }
    public function scopeWithEmployeeVoter($query, $leftJoin = false) {
        $joinMethod = $leftJoin ? 'leftJoin' : 'join';
        $query->$joinMethod('users as employee', 'employee.id', 'calls.user_id')
        ->$joinMethod('voters as employee_voter', 'employee_voter.id', 'employee.voter_id');
    }
}
