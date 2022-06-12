<?php

namespace App\Models\VoterFilter;

use Illuminate\Database\Eloquent\Model;

class VoterFilterDefinitionValue extends Model
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_definition_values';

    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'voter_filter_definition_id',
        'numeric_value',
        'label',
        'created_at',
        'updated_at'
    ];

    protected $visible = ['value', 'label'];
    protected $appends = ['value'];

    public function voter_filter_definition()
    {
        return $this->belongsTo(VoterFilterDefinition::class);
    }

    public function getValueAttribute()
    {
        return $this->numeric_value;
    }

    public function setValueAttribute($value)
    {
        $this->numeric_value = $value;
    }

}
