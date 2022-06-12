<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

/**
 * @property integer $ID
 * @property string  $NAME
 */
class OriginCountry extends Model {

    use Notifiable;

    public $primaryKey = 'id';
    public $timestamps = false;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'countries';

    public function originCountry () {

        return $this->hasOne( 'App\Models\Voters', 'origin_country_id', 'countries.id' );
    }

}

/*
 * php artisan krlove:generate:model OriginCountry --table-name=ORIGIN_COUNTRIES --output-path=app/Models --namespace=Models\\App
 */
