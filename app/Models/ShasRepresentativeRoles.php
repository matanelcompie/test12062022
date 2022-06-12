<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShasRepresentativeRoles extends Model {
    public $primaryKey = 'id';

    protected $table = 'shas_representative_roles';

    public function representatives() {
        return $this->belongsTo( 'App\Models\ShasRepresentative', 'shas_representative_role_id' );
    }
}