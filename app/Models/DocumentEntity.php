<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $type
 * @property string  $entity_id
 * @property boolean $document_id
 * @property string  $created_at
 * @property string  $updated_at
 */
class DocumentEntity extends Model {

    public $primaryKey = 'id';

    protected $table = 'documents_in_entities';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'type',
                            'entity_id',
                            'document_id',
                            'created_at',
                            'updated_at' ];

    public function scopeWithDocument ( $query ) {

        $query->join( 'documents', 'documents_in_entities.document_id', '=', 'documents.id' );
    }

    public function scopeWithRequest ( $query ) {

        $query->join( 'requests', 'requests.id', '=', 'documents_in_entities.entity_id' );
    }

    public function document () {

        return $this->belongsTo( 'App\Models\Document', 'document_id' );
    }
}