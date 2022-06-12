<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class SectorialFilterItems extends Model {

    public $primaryKey = 'id';

    protected $table = 'sectorial_filter_items';
	
	public function scopeWithSectorialFilterDefs ( $query ) {

        $query->join( 'sectorial_filter_definitions', 'sectorial_filter_definitions.id', '=', 'sectorial_filter_items.sectorial_filter_definition_id' )
		;
    }
	public function scopeWithSectorialFilters ( $query ) {

        $query->join( 'sectorial_filters', 'sectorial_filters.id', '=', 'sectorial_filter_items.entity_id' );
    }

    public function values() {
        return $this->hasMany('App\Models\SectorialFilterItemValues', 'sectorial_filter_item_id');
    }
}