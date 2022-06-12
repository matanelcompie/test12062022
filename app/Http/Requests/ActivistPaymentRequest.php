<?php

namespace App\Http\Requests;
use Illuminate\Http\Request;

class ActivistPaymentRequest extends Request
{
       public $id;
       public $status_id;
       public $comment;
       public $reason_status_id;
}