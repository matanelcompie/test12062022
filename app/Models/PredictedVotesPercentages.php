<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class PredictedVotesPercentages extends Model {

    public $primaryKey = 'id';

    protected $table = 'predicted_votes_percentages';
}
