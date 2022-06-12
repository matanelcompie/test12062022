<?php

namespace App\Models\VoterFilter;

use App\Models\KeyedModel;

class VoterFilterItem extends KeyedModel
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_items';

    /**
     * @var array
     */
    protected $fillable = [
        'voter_filter_id',
        'voter_filter_definition_id',
        'numeric_value',
        'string_value',
        'time_value',
        'date_value',
        'is_or_id',
        'election_campaign_id',
        'tm_campaign_id',
        'combined_definitions',
        'values'
    ];

    protected $visible = ['id','voter_filter_definition_id','numeric_value', 'string_value', 'time_value', 'date_value', 'election_campaign_id', 'tm_campaign_id', 'combined_definitions', 'values'];
    protected $appends = ['values'];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($model)
        {
            $model->voter_filter_item_values()->saveMany($model->voter_filter_item_values);
        });

        static::deleting(function ($model)
        {
            $model->voter_filter_item_values()->delete();
        });
    }

    public function voter_filter_definition()
    {
        return $this->belongsTo(VoterFilterDefinition::class);
    }

    public function voter_filter()
    {
        return $this->belongsTo(VoterFilter::class);   
    }

    public function voter_filter_item_values()
    {
        return $this->hasMany(VoterFilterItemValue::class);
    }

    public function getValuesAttribute()
    {
        return $this->voter_filter_item_values()->get()->pluck('value');
    }

    public function setValuesAttribute($value)
    {
        // Remove old values
        $this->voter_filter_item_values()->whereNotIn('value',collect($value))->delete();
        // Create new values
        foreach ($value as $valueVal) {
            if (!$this->voter_filter_item_values->contains('value', $valueVal)) {
                // only adds new value if it's not already in the list
                if (!isset($this->key)) {
                    $this->voter_filter_item_values->push(new VoterFilterItemValue(['value' => $valueVal]));
                } else {
                    $this->voter_filter_item_values()->create(['value' => $valueVal]);
                }
            }
        }
    }

}