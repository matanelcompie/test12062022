<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property integer  $id
 * @property integer  $election_campaign_id
 * @property integer  $entity_type
 * @property integer  $entity_id
 * @property integer  $hour
 * @property integer  $reported_votes_count
 * @property integer  $reported_supporters_votes_count
 * @property string  $created_at
 * @property string  $updated_at
 */
class PreviousElectionsReportedHourlyVotesHotCounter extends Model {

    public $primaryKey = 'id';
    protected $table = 'previous_elections_hourly_votes_hot_counters';

    /**
     * Add alias to table name
     * 
     * @param string tableName
     * @return this;
     */
    public function as($tableName) {
        $this->table .= " as ".$tableName;
        return $this;
    }
}
