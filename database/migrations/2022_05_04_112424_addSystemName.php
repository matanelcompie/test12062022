<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

use App\Libraries\Helper;


class AddSystemName extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    DB::table('action_topics')->insert(
      [
        'action_type_id' => 1,
        'key' => Helper::getNewTableKey('action_topics', 10),
        'name' => 'עדכון פניה',
        'system_name' => 'request.update',
        'active' => 1,
        'deleted' => 0
      ]
    );
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    DB::table('action_topics')->where('system_name', '=', 'request.update')->delete();
  }
}
