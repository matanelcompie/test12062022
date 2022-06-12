<?php

namespace App\Models\VoterFilter;

use Illuminate\Database\Eloquent\Model;

class VoterFilterGroupDefinition extends Model
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_group_definitions';

    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'voter_filter_group_id',
        'voter_filter_definition_id',
        'order',
        'active',
        'created_at',
        'updated_at'
    ];

    public function voter_filter_group()
    {
        return $this->belongsTo(VoterFilterGroup::class);
    }

    public function voter_filter_definition()
    {
        return $this->belongsTo(VoterFilterDefinition::class);
    }
}
