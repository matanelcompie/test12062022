<?php

namespace App\Models\VoterFilter;

use App\Models\Area;
use App\Models\BallotBox;
use App\Models\City;
use App\Models\Cluster;
use App\Models\KeyedModel;
use App\Models\Neighborhood;
use App\Traits\SpecialSoftDeletes;

class GeographicVoterFilter extends KeyedModel
{
    use SpecialSoftDeletes;
    public $primaryKey = 'id';
    protected $table = 'geographic_voter_filters';

    protected $fillable = [
        'entity_type',
        'entity_id',
        'active',
    ];

    protected $visible = ['id', 'key', 'entity_type', 'entity_id', 'active', 'created_at'];

    const ENTITY_TYPES = [
        'area' => [
            'type_id' => 0,
            'model' => Area::class
        ],
        'city' => [
            'type_id' => 1,
            'model' => City::class
        ],
        'neighborhood' => [
            'type_id' => 2,
            'model' => Neighborhood::class
        ],
        'cluster' => [
            'type_id' => 3,
            'model' => Cluster::class
        ],
        'ballot_box' => [
            'type_id' => 4,
            'model' => BallotBox::class
        ],
        'sub_area' => [
            'type_id' => 5,
            'model' => SubArea::class
        ],
    ];

    public function voter_filter()
    {
        return $this->belongsTo(VoterFilter::class);
    }

    public function getEntityTypeAttribute($value)
    {
        $entityTypes = collect(static::ENTITY_TYPES);
        return $entityTypes->search(function ($item) use ($value) {
            return $item['type_id'] == $value;
        });
    }

    public function setEntityTypeAttribute($value)
    {
        $this->attributes['entity_type'] = static::ENTITY_TYPES[$value]['type_id'];
    }
}