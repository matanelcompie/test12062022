<?php

namespace App\Models\Tm;


use App\Libraries\Helper;
use App\Models\ElectionCampaigns;
use App\Models\VoterMetaKeys;
use App\Models\VoterMetas;
use App\Models\VoterPhone;
use App\Models\Voters;
use App\Models\VoterVotes;
use App\Models\VoterTransportation;
use Illuminate\Support\Facades\DB;

class CtiVoter extends Voters
{
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $keyLength = DB::connection()->getDoctrineColumn($model->table, 'key')->getLength();
            $model->attributes['key'] = Helper::getNewTableKey($model->table, $keyLength);
        });
    }

    protected $visible = [
        'id',
        'key',
        'first_name',
        'last_name',
        'age',
        'email',
        'household',
        'address',
        'mi_address',
        'phones',
        'gender',
        'support_statuses',
        'support_status_tm',
        'support_status_branch',
        'transportation',
        'meta',
        'vote_status',
    ];
    protected $with = ['support_statuses', 'household', 'transportation', 'current_vote'];
    protected $appends = [
        'age',
        'address',
        'mi_address',
        'phones',
        'meta',
        'vote_status',
        'support_status_tm',
        'support_status_branch',
    ];
    protected $dates = ['birth_date'];

    public static function findByKey($key)
    {
        return static::where('key', $key)->firstOrFail();
    }

    public function support_statuses()
    {
        return $this->hasMany(CtiVoterSupportStatus::class, 'voter_id');
    }

    public function getSupportStatusTmAttribute()
    {
        $support_status_tm = $this->support_statuses()->where([
            ['election_campaign_id', ElectionCampaigns::currentCampaign()->id],
            ['entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM')]
        ])->firstOrNew([]);
        return $support_status_tm->support_status_id;
    }

    public function getSupportStatusBranchAttribute()
    {
        $support_status_branch = $this->support_statuses()->where([
            ['election_campaign_id', ElectionCampaigns::currentCampaign()->id],
            ['entity_type', config('constants.ENTITY_TYPE_VOTER_SUPPORT_ELECTION')]
        ])->firstOrNew([]);
        return $support_status_branch->support_status_id;
    }

    public function household()
    {
        $relation = $this->hasMany(CtiVoter::class, 'household_id', 'household_id')
                         ->orderBy('birth_date', 'asc');
        $relation->getQuery()->without(['household']);
        return $relation;
    }

    public function getAgeAttribute()
    {
        return $this->birth_date->diffInYears();
    }

    public function getAddressAttribute()
    {
        $addressObj = [
            'city' => $this->city,
            'city_id' => $this->city_id,
            'house' => $this->house,
            'neighborhood' => $this->neighborhood,
            'house_entry' => $this->house_entry,
            'street' => $this->street,
            'street_id' => $this->street_id,
            'flat' => $this->flat,
            'zip' => $this->zip,
            'distribution_code' => $this->distribution_code,
        ];
        return $addressObj;
    }

    public function getMiAddressAttribute()
    {
        $addressObj = [
            'city' => $this->mi_city,
            'city_id' => $this->mi_city_id,
            'house' => $this->mi_house,
            'neighborhood' => $this->mi_neighborhood,
            'house_entry' => $this->mi_house_entry,
            'street' => $this->mi_street,
            'street_id' => $this->mi_street_id,
            'flat' => $this->mi_flat,
            'zip' => $this->mi_zip,
        ];
        return $addressObj;
    }

    public function voter_phones()
    {
        return $this->hasMany(VoterPhone::class, 'voter_id');
    }

    public function getPhonesAttribute()
    {
        $result = collect([]);
        foreach ($this->voter_phones as $phoneModel) {
            $phoneModel->setHidden(['created_at', 'updated_at', 'voter_id']);
            $phoneModel->attributes['is_main'] = ($this->main_voter_phone_id == $phoneModel->attributes['id']);
            $result->push($phoneModel);
        }
        return $result;
    }

    public function transportation()
    {
        return $this->hasOne(VoterTransportation::class, 'voter_id')
            ->where('election_campaign_id', ElectionCampaigns::currentCampaign()->id);
    }

    public function willing_volunteer()
    {
        $keyId = VoterMetaKeys::where('key_system_name', 'willing_volunteer')->first()->id;
        return $this->hasOne(VoterMetas::class, 'voter_id')
            ->where('voter_meta_key_id', $keyId)->withDefault();
    }

    public function agree_sign()
    {
        $keyId = VoterMetaKeys::where('key_system_name', 'agree_sign')->first()->id;
        return $this->hasOne(VoterMetas::class, 'voter_id')
            ->where('voter_meta_key_id', $keyId)->withDefault();
    }

    public function explanation_material()
    {
        $keyId = VoterMetaKeys::where('key_system_name', 'explanation_material')->first()->id;
        return $this->hasOne(VoterMetas::class, 'voter_id')
            ->where('voter_meta_key_id', $keyId)->withDefault();
    }

    public function getMetaAttribute()
    {
        return [
            'willing_volunteer' => $this->willing_volunteer->value,
            'agree_sign' => $this->agree_sign->value,
            'explanation_material' => $this->explanation_material->value,
        ];
    }

    public function current_vote()
    {
        return $this->hasOne(VoterVotes::class, 'voter_id')
            ->where([
                ['election_campaign_id', ElectionCampaigns::currentCampaign()->id]
            ]);
    }

    public function getVoteStatusAttribute()
    {
        return isset($this->current_vote);
    }
}