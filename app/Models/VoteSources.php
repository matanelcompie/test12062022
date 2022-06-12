<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoteSources extends Model {

    public $primaryKey = 'id';
    protected $table = 'vote_sources';
    
    public static $systemNameApplication='applications';

    public static function getIdBySystemName($systemName){
     $voteSource=VoteSources::select()->where('system_name',$systemName)->first();

        return   $voteSource->id;
    }
}