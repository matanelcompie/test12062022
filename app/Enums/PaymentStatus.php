<?php

namespace App\Enums;

abstract class PaymentStatus
{
    const STATUS_WAITE_PAY = 'waite_for_pay';
    const STATUS_WAITE_CONFIRM = 'waite_for_confirm_payment';
    const STATUS_PAID = 'payment_paid';
    const STATUS_INCORRECT = 'incorrect_payment';
}
