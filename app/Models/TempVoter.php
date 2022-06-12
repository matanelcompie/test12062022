<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $personal_identity
 * @property string  $first_name
 * @property string  $last_name
 * @property string  $city
 * @property string  $neighborhood
 * @property string  $street
 * @property integer $house
 * @property string  $house_entry
 * @property string  $flat
 * @property string  $zip
 * @property string  $created_at
 * @property string  $updated_at
 */
class TempVoter extends Model {

    public $primaryKey = 'id';

    protected $table = 'unknown_voters';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'personal_identity',
                            'first_name',
                            'last_name',
                            'city',
                            'neighborhood',
                            'street',
                            'house',
                            'house_entry',
                            'flat',
                            'zip',
                            'created_at',
                            'updated_at' ];
}