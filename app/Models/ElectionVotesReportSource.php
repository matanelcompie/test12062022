<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class ElectionVotesReportSource extends Model {
    public $primaryKey = 'id';
    protected $table = 'election_votes_report_source';

    //system name of type report resource
    public static $commission_report='commission_report';
    public static $shas_report='shas_report';
    public static $likud_report='likud_report';
    public static $lengthKey=5;

    public static function getIdBySystemName($systemName){
       $object= ElectionVotesReportSource::select()->where('system_name',$systemName)->first();
       return $object->id;
    }
 
}