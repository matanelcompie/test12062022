<?php

namespace App\Models\Tm;

use Illuminate\Database\Eloquent\Model;

/**
* Model for holding CTI permissions via table 'cti_permissions'
* It is connected to campaigns via table 'cti_permissions_in_campaigns'
*/

class CtiPermission extends Model
{
    protected $table = 'cti_permissions';

    protected $hidden = ['pivot'];

}