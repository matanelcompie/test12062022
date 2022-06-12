<?php

namespace App\Http\Requests;

use Illuminate\Http\Request;

class CreateAllocationRequest extends Request
{
    public $GeographicEntityType;
    public $GeographicEntityValue;
    public $ElectionRoleId;
}
