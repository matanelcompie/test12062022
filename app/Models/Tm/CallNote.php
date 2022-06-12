<?php

namespace App\Models\Tm;

use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\KeyedModel;
use App\Models\SupportStatus;
use App\Traits\SpecialSoftDeletes;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $call_id
 * @property string  $note
 * @property integer $support_status_id
 * @property boolean $need_a_ride
 * @property string  $need_a_ride_time
 * @property boolean $call_me_later
 * @property string  $call_me_later_time
 * @property string  $email
 * @property string  $home_phone_number
 * @property string  $cell_phone_number
 * @property string  $another_phone_number
 * @property integer $city_id
 * @property string  $street
 * @property string  $house
 * @property string  $house_entry
 * @property string  $flat
 * @property string  $zip
 * @property string  $distribution_area
 * @property string  $created_at
 * @property string  $updated_at
 */
class CallNote extends KeyedModel {
    use SpecialSoftDeletes;

    public $primaryKey = 'id';
    protected $table = 'call_notes';

    /**
     * @var array
     */
    protected $fillable = [
        'call_id',
        'note',
        'support_status_id',
        'need_a_ride',
        'need_a_ride_time',
        'call_me_later',
        'call_me_later_time',
        'email',
        'home_phone_number',
        'cell_phone_number',
        'another_phone_number',
        'city_id',
        'street',
        'house',
        'house_entry',
        'flat',
        'zip',
        'distribution_area',
    ];

    protected $with = ['call'];

    /**
     * Returns the related call to this note.
     */
    public function call()
    {
        return $this->belongsTo(Call::class);
    }

    /**
     * Returns the related support status to this note.
     */
    public function support_status()
    {
        return $this->belongsTo(SupportStatus::class);
    }

    /**
     * Returns the related support status to this note.
     */
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function setSupportStatusIdAttribute($value)
    {
        $this->call->voter->support_statuses()->updateOrCreate(
            [
                'election_campaign_id' => ElectionCampaigns::currentCampaign()->id,
                'entity_type' => config('constants.ENTITY_TYPE_VOTER_SUPPORT_TM'),
            ],[
                'support_status_id' => $value
            ]
        );
    }
}
