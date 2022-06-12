<?php

namespace App\Repositories;

use App\Enums\CommonEnum;
use App\Enums\PhoneType;
use App\Libraries\Helper;
use App\Models\VoterPhone;
use Exception;
use Illuminate\Support\Facades\DB;
use Log;

class UnknownVoterPhoneRepository
{

    /**
     * Get query and connect by left join to active phone voter that is not wrong or deleted and order by mobile phone,created date
     *
     * @param [type] $query
     * @param string $nameTable
     * @return void
     */
    public static function leftJoinQueryFirstActiveVoterPhone(&$query)
    {
        $query->leftJoin(
            "unknown_voter_phones",
            function ($query) {
                $query->on("unknown_voter_phones.id", '=', DB::raw(
                    "(select unknown_voter_phones.id
        from unknown_voter_phones
        where  unknown_voter_phones.unknown_voter_id=unknown_voters.id
        order by created_at desc,unknown_voter_phones.phone_type_id limit 1)
        "
                ));
            }
        );
    }
}
