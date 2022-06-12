<?php

namespace App\Repositories;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\TempVoter;
use App\Models\UnknownVoterPhone;
use Illuminate\Support\Facades\DB;

class TempVoterRepository
{

    public static function getTempVoterDetailsById($id)
    {
        $queryFirstPhone = "
        (select phone_number from unknown_voter_phones where unknown_voter_id=unknown_voters.id and phone_type_id=1 limit 1) as phone1
        ";

        $querySecondPhone = "
        (select phone_number from unknown_voter_phones where unknown_voter_id=unknown_voters.id and phone_type_id=2 limit 1) as phone2
        ";

       return TempVoter::select([
            DB::raw('unknown_voters.*'),
            'cities.name as city_name',
            'streets.name as street',
            DB::raw($queryFirstPhone),
            DB::raw($querySecondPhone)
        ])
            ->leftJoin('cities', 'cities.id', 'unknown_voters.city_id')
            ->leftJoin('streets', 'streets.id', 'unknown_voters.street_id')
            ->where('unknown_voters.id', $id)
            ->first();
    }
}
