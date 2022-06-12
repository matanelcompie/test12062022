<?php

use App\Libraries\Helper;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class NewRequestSourceApp extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('request_source')->insert(
            [
                'id' => 5,
                'key' => Helper::getNewTableKey('request_source', 5),
                'name' => 'אפליקציה',
                'system_name' => 'application',
            ]
        );
        echo 'insert new request source-application';
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('request_source')->where('system_name', '=', 'application')->delete();
    }
}
