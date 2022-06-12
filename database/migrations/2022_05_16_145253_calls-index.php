<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CallsIndex extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    try {
      Schema::table('calls', function (Blueprint $table) {
        $table->index(["campaign_id", "call_end_status", "deleted"]);
        $table->index(["id", 'deleted']);
      });

      Schema::table('call_notes', function (Blueprint $table) {
        $table->index(["support_status_id", "call_id", "previous_support_status_id",  "deleted"]);
      });

      Schema::table('voters_answers', function (Blueprint $table) {
        $table->index(['question_id']);
      });

      Schema::table('possible_answers', function (Blueprint $table) {
        $table->index(['question_id']);
      });
    } catch (\Throwable $th) {
    }
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('calls', function (Blueprint $table) {

      $table->dropindex(["campaign_id", "call_end_status", "deleted"]);
      $table->dropindex(["id", 'deleted']);
    });

    Schema::table('call_notes', function (Blueprint $table) {
      $table->dropindex(["support_status_id", "call_id", "previous_support_status_id",  "deleted"]);
    });

    Schema::table('voters_answers', function (Blueprint $table) {
      $table->dropindex(['question_id']);
    });

    Schema::table('possible_answers', function (Blueprint $table) {
      $table->dropindex(['question_id']);
    });
  }
}
