<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class SectorialFilters extends Model {

    public $primaryKey = 'id';

    protected $table = 'sectorial_filters';
	
	public function scopeWithSectorialFilterItems ( $query ) {

        $query->join( 'sectorial_filter_items', 'sectorial_filters.id', '=', 'sectorial_filter_items.entity_id' )
		->join( 'sectorial_filter_definitions', 'sectorial_filter_definitions.id', '=', 'sectorial_filter_items.sectorial_filter_definition_id' )
		;
    }

    public function sectorialFilterItems() {
    	return $this->hasMany('App\Models\SectorialFilterItems', 'entity_id');
    }
}