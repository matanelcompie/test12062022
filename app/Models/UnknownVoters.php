<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnknownVoters extends KeyedModel
{

    public $primaryKey = 'id';

    protected $table = 'unknown_voters';

    protected $fillable = [
        'personal_identity',
        'first_name',
        'last_name',
        'birth_date',
        'birth_date_type',
        'gender',
        'city_id',
        'neighborhood',
        'street',
        'street_id',
        'house',
        'house_entry',
        'flat',
        'zip',
        'email',
        'created_at',
        'updated_at'
    ];
}
