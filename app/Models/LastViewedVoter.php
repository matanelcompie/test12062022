<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class LastViewedVoter extends Model {

    public $primaryKey = 'id';
    protected $table = 'last_viewed_voters';
    protected $fillable = ['user_id','key','voter_id'];

    public function scopeWithVoter($query) {
    	$query->join('voters', 'voters.id', '=', 'last_viewed_voters.voter_id');
    }
}