<?php

namespace App\Models\VoterFilter;

use App\Libraries\ListFunctions;
use Illuminate\Database\Eloquent\Model;

class VoterFilterDefinition extends Model
{

    public $primaryKey = 'id';
    protected $table = 'voter_filter_definitions';

    /**
     * @var array
     */
    protected $fillable = [
        'key',
        'name',
        'label',
        'model',
        'type',
        'multiselect',
        'model_list_function',
        'model_list_dependency_id',
        'selected_values_function',
        'join',
        'constrains',
        'where_type',
        'field',
        'created_at',
        'updated_at'
    ];

    protected $visible = ['id', 'key', 'label', 'name', 'type', 'multiselect', 'values', 'model_list_dependency_id',
    // 'model', 'model_list_function', 'model_list_dependency_id', 'join', 'constrains', 'where_type', 'field'
    ];
    protected $appends = ['values'];
    protected $hidden = ['pivot', 'voter_filter_definition_values'];

    const FILTER_DEFINITION_TYPE_BOOLEAN = 1;
    const FILTER_DEFINITION_TYPE_CLOSE_LIST = 2;
    const FILTER_DEFINITION_TYPE_LOAD_LIST = 3;
    const FILTER_DEFINITION_TYPE_FROM_NUMBER = 4;
    const FILTER_DEFINITION_TYPE_TO_NUMBER = 5;
    const FILTER_DEFINITION_TYPE_INPUT = 6;
    const FILTER_DEFINITION_TYPE_TIME = 7;
    const FILTER_DEFINITION_TYPE_DATE = 8;

    public function voter_filter_group_definitions()
    {
        return $this->hasMany(voterFilterGroupDefinition::class);
    }

    public function voter_filter_items()
    {
        return $this->hasMany(VoterFilterItem::class);
    }

    public function voter_filter_definition_values()
    {
        return $this->hasMany(VoterFilterDefinitionValue::class);
    }

    public function voter_filter_group()
    {
        return $this->belongsToMany(VoterFilterGroup::class, 'voter_filter_group_definitions', 'voter_filter_definition_id', 'voter_filter_group_id');
    }

    public function getTypeAttribute($value)
    {
        switch ($value) {
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_BOOLEAN:
                return 'bool';
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_CLOSE_LIST:
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_LOAD_LIST:
                return 'list';
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_FROM_NUMBER:
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_TO_NUMBER:
                return 'number';
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_INPUT:
                return 'text';
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_TIME:
                return 'time';
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_DATE:
                return 'date';
            default:
                return $value;
        }
    }

    public function getValuesAttribute()
    {
        switch ($this->getOriginal('type')) {
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_CLOSE_LIST:
                return $this->voter_filter_definition_values;
                break;
            case VoterFilterDefinition::FILTER_DEFINITION_TYPE_LOAD_LIST:
                $functionName = $this->model_list_function;

                if (method_exists(new ListFunctions(), $functionName)) {
                    return ListFunctions::$functionName();
                } else {
                    return array();
                }
                break;
            default:
                return array();
                break;
        }
    }
}
