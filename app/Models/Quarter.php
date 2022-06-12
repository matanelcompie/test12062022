<?php

namespace App\Models;

use App\Enums\ElectionRoleSystemName;
use App\Repositories\ElectionRolesRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property integer  $city_id
 * @property string  $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class Quarter extends Model {
    public $primaryKey = 'id';

    protected $table = 'quarters';

    public function scopeWithCity($query){  
        $query->leftJoin('cities', 'cities.id', '=', 'quarters.city_id');
    }
    public function scopeWithActivistsAllocations($query){  
        $query->leftJoin('activists_allocations', 'activists_allocations.quarter_id', '=', 'quarters.id');
    }
    public function quarterDirectorDetails() {
     return $this->hasOne('\App\Models\ActivistsAllocations', 'quarter_id', 'id');
    }

    public function scopeWithAllocationQuarterDirector($query, $electionCampaignId,$leftJoin=true)
    {
        $quarterDirectorSystem = ElectionRoleSystemName::QUARTER_DIRECTOR;
        $quarterDirectorRole = ElectionRolesRepository::getBySystemName($quarterDirectorSystem);
        $joinType=$leftJoin?'leftJoin':'join';
        $query
        ->$joinType('activists_allocations as allocation_quarter_director', function ($q) use ($electionCampaignId,$quarterDirectorRole) {
            $q->on('allocation_quarter_director.quarter_id','=', 'quarters.id')
            ->where('allocation_quarter_director.election_campaign_id', '=', $electionCampaignId)
                ->where('allocation_quarter_director.election_role_id', '=', $quarterDirectorRole->id);
        });
    }
}