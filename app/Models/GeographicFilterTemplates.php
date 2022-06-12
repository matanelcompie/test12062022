<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class GeographicFilterTemplates extends Model {

    public $primaryKey = 'id';

    protected $table = 'geographic_filter_templates';
    
    public function scopeWithHeadquarters($query) {
        $query->join('headquarters', 'geographic_filter_templates.team_id', '=', 'headquarters.team_id');
    }
}