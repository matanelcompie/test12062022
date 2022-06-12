<?php

namespace App\Enums;

use App\Models\ElectionRoles;
use App\Repositories\ElectionRolesRepository;
use Log;

abstract class TypePaymentGroupRole
{
    const SHAS = 1;
    const VAADAT_BCHIROT = 0;

    /**
     * function return array system role that "vadat bchirot" need payed
     *
     * @return array[]
     */
    public static function getRoleNotInShasPayment()
    {

        return [ElectionRoleSystemName::BALLOT_MEMBER];
    }

    public static function getShasElectionRoleArrId()
    {
        $allElectionRole = ElectionRolesRepository::getList();
        $shasElectionRole = array();
        foreach ($allElectionRole as $key => $role) {
            if (!in_array($role->system_name, self::getRoleNotInShasPayment())) {
                $shasElectionRole[] = $role->id;
            }
        }
        return $shasElectionRole;
    }

    public static function getRoleNotInShasPaymentArrId()
    {
        $allElectionRole = ElectionRolesRepository::getList();
        $KnesetRole = array();
        foreach ($allElectionRole as $key => $role) {
            if (in_array($role->system_name, self::getRoleNotInShasPayment())) {
                $KnesetRole[] = $role->id;
            }
        }
        return $KnesetRole;
    }
}
