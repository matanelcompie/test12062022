<?php

use App\Models\CrmRequest;
use App\Models\CrmRequestPriority;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Redis;

class UpdateRequestPriorityId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        CrmRequestPriority::where('id', '=', '5')->update(
            ['id' => 2]
        );
        CrmRequestPriority::where('id', '=', '10')->update(
            ['id' => 3]
        );

        CrmRequest::where('request_priority_id', '=', '5')->update(
            ['request_priority_id' => 2]
        );

        CrmRequest::where('request_priority_id', '=', '10')->update(
            ['request_priority_id' => 10]
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        CrmRequestPriority::where('id', '=', '2')->update(
            ['id' => 5]
        );
        CrmRequestPriority::where('id', '=', '3')->update(
            ['id' => 10]
        );

        CrmRequest::where('request_priority_id', '=', '2')->update(
            ['request_priority_id' => 5]
        );

        CrmRequest::where('request_priority_id', '=', '3')->update(
            ['request_priority_id' => 10]
        );
    }
}
