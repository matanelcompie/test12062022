<?php

namespace App\DTO;

use App\Enums\TypePaymentGroupRole;
use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Illuminate\Http\Request;

class PaymentGroupCreatorDto
{
    public $shasBankId;

    public $electionCampaignId;

    /**
     * @var TypePaymentGroupRole an enum
     */
    public $paymentTypeId;

    public $paymentGroupName;

    /**
     * @var array[] PaymentGroupItemDto
     */
    public $arrPaymentGroupItem;

        /**
     * @var array[] ActivistPayment for isRecurringActivistPayment true
     */
    public $arrActivistPayment;

    public $paymentGroupId;

    public $isRecurringActivistPayment;
}
