<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PermissionGroup;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserRoles;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\Libraries\Helper;

class PermissionController extends Controller {

	/*
		Function that returns all PermissionGroups , or PermissionGroups
		by permissionGroupKey
	*/
    public function getGroup($groupKey = null) {
        $jsonOutput = app()->make("JsonOutput");
        if ($groupKey == null) {
            $groups = PermissionGroup::select('id', 'key', 'name')->where('deleted', 0)->get();
            $jsonOutput->setData($groups);
        } else {
            $group = PermissionGroup::select('id', 'key', 'name')->where('deleted', 0)->where('key', $groupKey)->first();
            if ($group != null) {
                $permissionGroup = $group;
                $permissionGroup->permissions = $group->permissions()->select('permissions.key')->get();
                $jsonOutput->setData($permissionGroup);
            } else {
                $jsonOutput->setErrorCode(config('errors.system.GROUP_NOT_EXIST'));
            }
        }
    }

	/*
		Function that returns all displayed Permissions
	*/
    public function getPermission() {
        $jsonOutput = app()->make("JsonOutput");
        $permissions = Permission::select('id', 'key', 'name', 'operation_name', 'parent_id')->where('display', 1)->orderBy('display_order', 'asc')->orderBy('parent_id', 'asc')->get();
        $jsonOutput->setData($permissions);
    }

    /*
        !!Not in use!!
		Function that updates existing permission by its key
		and POST params
	*/
    public function updateGroup(Request $request, $groupKey) {
        $jsonOutput = app()->make("JsonOutput");
        $isError = false;
        $group = PermissionGroup::where('key', $groupKey)->first();
        if ($group == null) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            $isError = true;
        }

        $groupName = $request->input('group_name');
        if ($groupName == null || strlen(trim($groupName)) < 3) {
            $jsonOutput->setErrorCode(config('errors.system.VALUE_IS_TOO_SHORT_OR_MISSED'));
            $isError = true;
        }


        if (!$isError) {

            $permissions = $request->input('permissions', null);

            if ($groupName != null) {
                $group->name = $groupName;
                $group->save();
            }
            if ($permissions != null) {
                $permissionHash = array();
                for ($x = 0; $x < count($permissions); $x++) {
                    $permissionHash[$permissions[$x]] = true;
                }
                $currentPermissions = $group->permissions;
                forEach ($currentPermissions as $currentPermission) {
                    if (!array_key_exists($currentPermission->key, $permissionHash))
                        $group->permissions()->detach($currentPermission->id);
                    else
                        unset($permissionHash[$currentPermission->key]);
                }
                forEach ($permissionHash as $permissionKey => $permissionValue) {
                    $permission = Permission::select('id')->where('key', $permissionKey)->first();
                    if ($permission != null)
                        $group->permissions()->attach($permission->id);
                }
            }
            $jsonOutput->setData('ok');
        }
    }

    /*
        !!Not in use!!
		Function that adds new PermissionGroup by POST params
	*/
    public function newGroup(Request $request) {
        $groupName = $request->input("group_name");
        if ($groupName == null) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
        }
        $key = Helper::getNewTableKey('permission_groups', 5, Helper::DIGIT + Helper::LOWER);
        $permissionGroup = new PermissionGroup;
        $permissionGroup->name = $groupName;
        $permissionGroup->key = $key;
        $permissionGroup->save();
        $jsonOutput = app()->make("JsonOutput");
        $jsonOutput->setData($permissionGroup);
    }

    /* 
        !!Not in use!!
        Function that deletes existing PermissionGroup if it's NOT in use , by its key
	*/
    public function deleteGroup(Request $request, $groupKey) {
        $jsonOutput = app()->make("JsonOutput");
        $isError = false;
        $group = PermissionGroup::where('key', $groupKey)->first();
        if ($group == null) {
            $jsonOutput->setErrorCode(config('errors.system.THERE_IS_NO_REFERENCE_KEY'));
            $isError = true;
        }
        //checks if permission group is attached to user role
        $groupExistInUserRoles = UserRoles::where('permission_group_id', $group->id)->first();
        if ($groupExistInUserRoles){
            $jsonOutput->setErrorCode(config('errors.system.PERMISSION_GROUP_ATTACHED_TO_USER_ROLE'));
            $isError = true;
        }
        if (!$isError) {
            $users = User::whereHas('roles', function ( $query ) use ( $group ) {
                        $query->where('permission_group_id', $group->id);
                    })->get();
            if (count($users) > 0) {
                $jsonOutput->setErrorCode(config('errors.system.ITEM_IN_USE'));
                $isError = true;
            }
            if (!$isError) {
                $group->permissions()->sync([]);
                $group->deleted = 1;
                $group->save();
                $jsonOutput->setData(null);
            }
        }
    }

}
