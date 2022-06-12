<?php

namespace App\Models\VoterFilter;

use Illuminate\Database\Eloquent\Model;

class VoterFilterModuleGroup extends Model
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_module_groups';

    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'voter_filter_group_id',
        'voter_filter_module',
        'created_at',
        'updated_at'
    ];

    public function voter_filter_group()
    {
        return $this->belongsTo(VoterFilterGroup::class);
    }
}