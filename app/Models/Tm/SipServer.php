<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

 
class SipServer extends Model {

    public $primaryKey = 'id';
    protected $table = 'sip_servers';
 
}
