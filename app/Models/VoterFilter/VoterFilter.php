<?php

namespace App\Models\VoterFilter;

use App\Models\KeyedModel;
use App\Models\Tm\Campaign;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class VoterFilter extends KeyedModel
{
    // use SpecialSoftDeletes;

    public $primaryKey = 'id';
    protected $table = 'voter_filters';

    /**
     * @var array
     */
    protected $fillable = [
        'name',
        'entity_type',
        'entity_id',
        'active',
        'order',
        'filter_items',
        'geo_items',
		'unique_voters_count' , 
		'voters_count'
    ];

    protected $visible = ['id', 'key', 'name', 'filter_items', 'geo_items', 'active', 'order', 'user_create_id', 'entity_id', 'entity_type',
        'created_at', 'creator_name', 'voters_count', 'unique_voters_count', 'processing_count', 'processed_count' , 'sent_to_dialer' , 'answered_percentage' , 'calls_count' , 'answered_calls_count'];
    protected $with = ['geo_items'];
    protected $appends = ['filter_items', 'creator_name', 'processing_count', 'processed_count'  ];

    // If parent_model is null - can't save voter filter in DB!
    // Because  parent "entity_id" must not be null!  
    const ENTITY_TYPES = [
        'portion' => [
            'type_id' => 1,
            'parent_model' => Campaign::class,
        ],
        //Not in use!
        'target_group' => [ 
            'type_id' => 2,
            'parent_model' => Campaign::class,
        ],
        'general_report' => [
            'type_id' => 3,
            'parent_model' => null 
        ],
        'captain50_walker_report' => [
            'type_id' => 4,
            'parent_model' => null
        ],
        'captain50_activist' => [
            'type_id' => 5,
            'parent_model' => null
        ]
    ];

    protected static function boot()
    {
        parent::boot();
        static::addGlobalScope('order', function (Builder $builder) {
            $builder->orderBy('order', 'asc');
        });

        static::creating(function ($model) {
            $model->user_create_id = Auth::user()->id;
        });

        static::created(function ($model) {
            $model->voter_filter_items()->saveMany($model->voter_filter_items);
            $model->geo_items()->saveMany($model->geo_items);
        });
    }

    function creator()
    {
        return $this->belongsTo(User::class, 'user_create_id');
    }

    function voter_filter_items()
    {
        return $this->hasMany(VoterFilterItem::class);
    }

    function voter_filter_progress()
    {
        return $this->hasOne('App\Models\Tm\CampaignPortionProgress', 'portion_id');
    }

    function scopeWithCampaignPortionProgress($query)
    {
        $query->select('voter_filters.*', 'campaign_portion_progress.processing_count', 'campaign_portion_progress.processed_count')
            ->leftJoin('campaign_portion_progress', 'voter_filters.id', '=', 'campaign_portion_progress.portion_id');
    }

    function geo_items()
    {
        return $this->hasMany(GeographicVoterFilter::class);
    }
	
	function calls()
    {
        return $this->hasMany('App\Models\Tm\Call', 'portion_id' , 'id')->where('calls.deleted',0);
    }
	
	function answeredCalls()
    {
		$arrayNeededCallStatuses = [
			config('tmConstants.call.status.SUCCESS') ,
			config('tmConstants.call.status.GET_BACK') , 
			config('tmConstants.call.status.LANGUAGE') , 
			config('tmConstants.call.status.GOT_MARRIED') , 
			config('tmConstants.call.status.CHANGED_ADDRESS') , 
			config('tmConstants.call.status.WRONG_NUMBER') , 
			config('tmConstants.call.status.NON_COOPERATIVE') 
		];
        return $this->hasMany('App\Models\Tm\Call', 'portion_id' , 'id')->where('calls.deleted',0)->whereIn('calls.call_end_status',$arrayNeededCallStatuses);
    }

    function getProcessingCountAttribute()
    {
        $result = $this->voter_filter_progress()->first();
        return $result ? $result['processing_count'] : 0;
    }

    function getProcessedCountAttribute()
    {
        $result = $this->voter_filter_progress()->first();
        return $result ? $result['processed_count'] : 0;
    }

    function getFilterItemsAttribute()
    {
        return $this->voter_filter_items;
    }

    function setFilterItemsAttributeOld($value)
    {
        foreach ($value as $item) {
            $filterItem = $this->voter_filter_items()->firstOrNew(['id' => null]);
            $filterItem->fill(collect($item)->toArray());
            $this->voter_filter_items->push($filterItem);
        }
    }

    function setGeoItemsAttribute($value)
    {
        $this->geo_items()->whereNotIn('key', collect($value)->pluck('key')->filter())->delete();
        foreach ($value as $geo_partial) {
            if ($geo_partial['entity_id'] == 0) {
                continue; // skip the empty ones
            }
            if (!isset($this->key)) {
                // this is in case the voter filter hasn't been added yet
                // the geo-filter-saving happens in a 'created' event observer
                $this->geo_items->push(new GeographicVoterFilter($geo_partial));
            } else {
                if (!isset($geo_partial['key']) || collect($this->geo_items()->firstOrNew(['key' => $geo_partial['key']]))->isEmpty()) {
                    // will get here if there's no key or if the key is not on this voter filter (to prevent injection)
                    $geo_partial['key'] = null;
                }
                $this->geo_items()->updateOrCreate(['key' => $geo_partial['key']], $geo_partial);
            }
        }
    }

    function getCreatorNameAttribute()
    {
        try {
            $voter = $this->creator->voter;
            return $voter->first_name . ' ' . $voter->last_name;
        } catch (\Exception $e) {
            return null;
        }
    }
}
