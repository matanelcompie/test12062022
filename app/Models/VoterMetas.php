<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterMetas extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_metas';

	

    public function scopeWithVoter( $query) {
         $query->join( 'voters', 'voters.id', '=', 'voter_metas.voter_id' );
    }
}