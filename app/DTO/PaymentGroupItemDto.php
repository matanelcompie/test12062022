<?php

namespace App\DTO;

use App\Models\City;
use App\Models\ElectionCampaigns;
use App\Models\ElectionRoles;
use App\Models\Voters;
use Illuminate\Http\Request;

class PaymentGroupItemDto
{
    public $indexRow;
    public $activistFullName;
    public $personalIdentity;
    public $phoneNumber;
    public $isShasPayment;
    public $amount;
    public $lockAmountForPaid;
    public $arrRoleActivist;
    public $arrRoleLockPayment;
    public $globalAmountRole;
    public $typePaymentGroupRole;
    public $bankDetails;
    public $isValidForPaid;
}
