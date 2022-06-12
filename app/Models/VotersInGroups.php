<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/*
 * @property integer $id
 * @property string  $key
 * @property integer $voter_group_id
 * @property integer $voter_id
 * @property integer $created_at
 * @property integer $updated_at
 */
class VotersInGroups extends Model {

    public $primaryKey = 'id';
    protected $table = 'voters_in_groups';

    public function scopeWithGroups( $query ) {
        $query->join( 'voter_groups', 'voter_groups.id', '=', 'voters_in_groups.voter_group_id' )
            ->where('voter_groups.deleted', 0);
    }
}