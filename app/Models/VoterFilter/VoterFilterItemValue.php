<?php

namespace App\Models\VoterFilter;

use App\Models\KeyedModel;

class VoterFilterItemValue extends KeyedModel
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_item_values';

    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'voter_filter_item_id',
        'value',
        'created_at',
        'updated_at'
    ];

    protected static function boot()
    {
        parent::boot();
    }

    public function voter_filter_item()
    {
        return $this->belongsTo(VoterFilterItem::class);
    }
}