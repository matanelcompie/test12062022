<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterMetaKeys extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_meta_keys';

	
	public function scopeWithMetaValues($query) {
         $query->join( 'voter_meta_values', 'voter_meta_values.voter_meta_key_id', '=', 'voter_meta_keys.id' )
		 ;
    }
	 
	 
}