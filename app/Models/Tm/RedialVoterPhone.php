<?php

namespace App\Models\Tm;
use Illuminate\Database\Eloquent\Model;

/**
 * @property integer $id
 * @property string  $key
 * @property integer $user_id
 * @property integer $voter_id
 * @property integer $question_id
 * @property integer $campaign_id
 * @property integer $call_end_status
 * @property string  $created_at
 * @property string  $updated_at
 */
class RedialVoterPhone extends Model {

	public $primaryKey = 'id';
    protected $table = 'redial_voter_phones';

}