<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class IdxCreatedAt extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('calls', function (Blueprint $table) {
      $table->index(["campaign_id", "created_at"], 'idx_campaign_id_created_at');
      $table->dropindex('created_at');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table(
      'calls',
      function (Blueprint $table) {
        $table->dropindex('idx_campaign_id_created_at');
        $table->index('created_at', 'created_at');
      }
    );
  }
}
