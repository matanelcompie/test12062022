<?php

namespace App\Libraries\Services\ServicesModel;

use App\Http\Controllers\VoterActivistController;
use App\Libraries\Helper;
use App\Models\ActivistAllocationAssignment;
use App\Models\ActivistsAllocations;
use App\Models\BallotBox;
use App\Models\ElectionCampaignPartyListVotes;
use App\Models\ElectionRoleShifts;
use App\Models\VotersInElectionCampaigns;
use App\Models\Votes;
use App\Repositories\ElectionRoleShiftRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class ElectionRoleShiftService
{

   
    //function get election role shift system name and return all option next system role shift
    //function get params if return  id of next election role shift
    public static function getArrShiftRoleByNextShiftRoleBallotBox($election_role_shift_system,$returnId=false){
        $arrNextShiftRole=[];
        $base="constants.activists.role_shifts.";
        switch ($election_role_shift_system) {
            case config($base."FIRST"):
                $arrNextShiftRole[]=config( $base.'SECOND');
                $arrNextShiftRole[]=config( $base.'ALL_DAY');
                $arrNextShiftRole[]=config( $base.'COUNT');
                $arrNextShiftRole[]=config( $base.'SECOND_AND_COUNT');
                break;

             case config($base.'SECOND'):
                    $arrNextShiftRole[]=config($base.'COUNT');
                    $arrNextShiftRole[]=config($base.'SECOND_AND_COUNT');
                    break;
        }

        if($returnId && count($arrNextShiftRole)>0)
        {
            $arrShiftRole=ElectionRoleShifts::select('id')->whereIn('system_name',$arrNextShiftRole)->get();
            $arrNextShiftRole=$arrShiftRole->map(function($shiftRole){return $shiftRole->id;});
        }

        return $arrNextShiftRole;
    }

    //function get election role shift system name and return arr of election role shift before
    public static function arrShiftRoleBeforeByShiftRole($election_role_shift_system,$returnId=false){
        $arrNextShiftRole=[];
        $base="constants.activists.role_shifts.";
        switch ($election_role_shift_system) {
            case config($base."COUNT"):
                $arrNextShiftRole[]=config( $base.'SECOND');
                break;

             case config($base.'SECOND'):
                    $arrNextShiftRole[]=config($base.'FIRST');
                    break;
        }

        if($returnId && count($arrNextShiftRole)>0)
        {
            $arrShiftRole=ElectionRoleShifts::select('id')->whereIn('system_name',$arrNextShiftRole)->get();
            $arrNextShiftRole=$arrShiftRole->map(function($shiftRole){return $shiftRole->id;});
        }

        return $arrNextShiftRole;
    }

    //function get name system election role shift and return is shift include counter
    public static function isInCounterShift($systemShiftRole){
        $baseRoleShift="constants.activists.role_shifts.";
        if(strcmp($systemShiftRole, config($baseRoleShift.'COUNT'))==0)
        return true;
        if(strcmp($systemShiftRole, config($baseRoleShift.'SECOND_AND_COUNT'))==0)
        return true;
        if(strcmp($systemShiftRole, config($baseRoleShift.'ALL_DAY_AND_COUNT'))==0)
        return true;

        return false;

    }

    public static function getShiftRoleObjectById($id){
        $object=ElectionRoleShifts::select()->where('id',$id)->first();
        if($object)
        return $object;

        return false;
    }

    /**
     * get shift id and array assignment of ballot activist
     * check if shift is valid before create another assignment
     *
     * @param int $shiftId
     * @param ActivistAllocationAssignment[] $activistBallotAssignment
     * @return bool
     */
    public static function checkValidShiftForActivist($shiftId, $activistBallotAssignment)
    {
        if (!$shiftId)
        return false;

        if (!$activistBallotAssignment)
        return true;
        $allowRoleShiftsSystemNames = config('constants.activists.role_shifts');
        
        foreach ($activistBallotAssignment as $item) {
            $allowRoleShiftsSystemNames = self::getValidAnotherShiftRoleByShiftId($allowRoleShiftsSystemNames, $item->election_role_shift_id);
        }

        $shiftRole = ElectionRoleShiftRepository::getShiftRoleById($shiftId);
        return in_array($shiftRole->system_name, $allowRoleShiftsSystemNames);
    }

    /**
     * function get array shift role system name and return all valid shift in array with specific shift
     *
     * @param string[] $arrShiftRoleSystemName arr role system name 
     * @param int $ballotCurrentShiftId -shift role id
     * @return string[]
     */
    public static function getValidAnotherShiftRoleByShiftId($arrShiftRoleSystemName, $ballotCurrentShiftId)
    {
        $currentRoleShift = ElectionRoleShifts::where('id',
            $ballotCurrentShiftId
        )->first();
        $ROLE_SHIFTS = config('constants.activists.role_shifts');

        switch ($currentRoleShift->system_name) {
            case $ROLE_SHIFTS['FIRST']: 
                unset($arrShiftRoleSystemName['FIRST']);
                unset($arrShiftRoleSystemName['ALL_DAY']);
                unset($arrShiftRoleSystemName['ALL_DAY_AND_COUNT']);
                break;
            case $ROLE_SHIFTS['SECOND']: 
                unset($arrShiftRoleSystemName['SECOND']);
                unset($arrShiftRoleSystemName['ALL_DAY']);
                unset($arrShiftRoleSystemName['ALL_DAY_AND_COUNT']);
                unset($arrShiftRoleSystemName['SECOND_AND_COUNT']);
                break;
            case $ROLE_SHIFTS['COUNT']:
                unset($arrShiftRoleSystemName['COUNT']);
                unset($arrShiftRoleSystemName['ALL_DAY_AND_COUNT']);
                unset($arrShiftRoleSystemName['SECOND_AND_COUNT']);
                break;
            case $ROLE_SHIFTS['ALL_DAY']: 
                unset($arrShiftRoleSystemName['FIRST']);
                unset($arrShiftRoleSystemName['SECOND']);
                unset($arrShiftRoleSystemName['ALL_DAY']);
                unset($arrShiftRoleSystemName['ALL_DAY_AND_COUNT']);
                unset($arrShiftRoleSystemName['SECOND_AND_COUNT']);
                break;
            case $ROLE_SHIFTS['SECOND_AND_COUNT']:
                unset($arrShiftRoleSystemName['SECOND']);
                unset($arrShiftRoleSystemName['COUNT']);
                unset($arrShiftRoleSystemName['ALL_DAY']);
                unset($arrShiftRoleSystemName['ALL_DAY_AND_COUNT']);
                unset($arrShiftRoleSystemName['SECOND_AND_COUNT']);
                break;
            case $ROLE_SHIFTS['ALL_DAY_AND_COUNT']:
                $arrShiftRoleSystemName = [];
                break;
        }

        return $arrShiftRoleSystemName;
    }

}