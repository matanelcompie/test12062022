<?php

namespace App\Models\VoterFilter;

use App\Libraries\Services\UserLogin\AuthService;
use DB;
use Illuminate\Database\Eloquent\Model;

class VoterFilterGroup extends Model
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_groups';

    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'name',
        'label',
        'voter_filter_type',
        'parent_id',
        'is_or',
        'order',
        'active',
        'created_at',
        'updated_at'
    ];

    //   protected $visible = ['id','key','name', 'label', 'is_or', 'order', 'sub_groups', 'definitions', 'parent_id'];
    //protected $with = ['sub_groups'/*, 'definitions'*/];

    const FILTER_TYPE_SUPPORT_STATUS = 1;
    const FILTER_TYPE_VOTING_STATUS = 2;
    const FILTER_TYPE_SEGMENT = 3;
    const FILTER_TYPE_USER = 4;
    const FILTER_TYPE_SHAS_GROUPS = 5;
    const FILTER_TYPE_VOTER = 6;
    const FILTER_TYPE_CONTACT = 7;
    const FILTER_TYPE_CRM_REQUEST = 8;


    public function voter_filter_group_definitions(){
        return $this->hasMany(VoterFilterGroupDefinition::class);
    }

    public function modules(){
        return $this->hasMany(VoterFilterModuleGroup::class);
    }

    public function sub_groups()
    {
        $isAdmin = AuthService::isAdmin() ? 1 : 0;
        return $this->hasMany(VoterFilterGroup::class, 'parent_id')
        ->where('only_admin', '=', DB::raw($isAdmin))
            ->orWhere('only_admin', '=', DB::raw(0));
    }

    public function definitions(){
        return $this->belongsToMany(VoterFilterDefinition::class, 'voter_filter_group_definitions', 'voter_filter_group_id', 'voter_filter_definition_id');
    }

    public function scopeInModule($query, $moduleId)
    {

        $query->join('voter_filter_module_groups', function($joinOn) use($moduleId) {
            $joinOn->on('voter_filter_groups.id', '=', 'voter_filter_module_groups.voter_filter_group_id')
            ->where('voter_filter_module_groups.voter_filter_module', $moduleId);
        });
        /*return $query->whereHas('modules', function ($subquery) use ($moduleId) {
            $subquery->where('voter_filter_module', '=', $moduleId);
        });*/
    }
}