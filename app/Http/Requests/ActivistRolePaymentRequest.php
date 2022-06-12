<?php

namespace App\Http\Requests;

use Illuminate\Http\Request;

class ActivistRolePaymentRequest extends Request
{
       public $id;
       public $sum;
       public $is_payment_lock;
       public $not_for_payment;
       public $comment;
}
