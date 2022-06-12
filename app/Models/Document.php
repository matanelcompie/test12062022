<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property string  $name
 * @property string  $type
 * @property string  $file_name
 * @property boolean $deleted
 * @property string  $created_at
 * @property string  $updated_at
 */
class Document extends KeyedModel {

    public $primaryKey = 'id';

    protected $table = 'documents';
    /**
     * @var array
     */
    protected $fillable = [ 'key',
                            'name',
                            'type',
                            'file_name',
                            'deleted',
                            'created_at',
                            'updated_at' ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->attributes['file_name'] =  $model->attributes['key'];
        });
    }

    public function voters () {
        return $this->belongsToMany( 'App\Models\Voters', 'documents_in_entities', 'document_id', 'entity_id')->wherePivot( 'entity_type', '=', config( 'constants.ENTITY_TYPE_VOTER' ) );
    }

    public function scopeFromRequestsOfVoter($query, $voterId) {
        return $query->join('documents_in_entities','documents_in_entities.document_id','=','documents.id')
                     ->join('requests', 'requests.id','=','documents_in_entities.entity_id')
                     ->where('requests.voter_id', $voterId)
                     ->where('documents_in_entities.entity_type', config('constants.ENTITY_TYPE_REQUEST'));
    }
	
	public function scopeWithDocumentEntities($query) {
        return $query->join('documents_in_entities','documents_in_entities.document_id','=','documents.id')->join('requests', 'requests.id','=','documents_in_entities.entity_id')->where('documents_in_entities.entity_type', 1);
    }

    public function attachEntity($entityType, $entityId)
    {
        return  DocumentEntity::insert([
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'document_id' => $this->id,
        ]);
    }
}
