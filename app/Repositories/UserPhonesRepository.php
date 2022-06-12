<?php

namespace App\Repositories;

use App\Enums\PhoneType;
use App\Models\RequestTopic;
use App\Models\RequestTopicUsers;
use App\Models\UserPhones;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserPhonesRepository
{
    public static function getMobilePhoneNumberByUserId(int $userId)
    {
        $mobile = UserPhones::select()
            ->where('user_id', $userId)
            ->where('phone_type_id', PhoneType::PHONE_TYPE_MOBILE)
            ->where('deleted', DB::raw(0))
            ->first();

        return $mobile ? $mobile->phone_number : false;
    }
}
