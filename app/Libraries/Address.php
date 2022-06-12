<?php

/*
 * Address library class
 * 
 */

namespace App\Libraries;

use Illuminate\Support\Facades\Validator;

use App\Models\City;


class Address {

    public $city_id;
    public $city_key;
    public $city_name;
    public $street;
    public $street_id;
    public $street_name;
    public $neighborhood;
    public $house;
    public $house_entry;
    public $house_number;
    public $flat;
    public $zip;

    public function validateCity($cityId) {
        $rules = [
            'city_id' => 'required|integer|exists:cities,id'
        ];

        $validator = Validator::make(['city_id' => $cityId], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

    public function validateStreet($streetId) {
        $rules = [
            'street_id' => 'required|integer|exists:streets,id'
        ];

        $validator = Validator::make(['street_id' => $streetId], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

    public function validateFlat($flat) {
        $rules = [
            'flat' => 'integer'
        ];

        $validator = Validator::make(['flat' => $flat], $rules);
        if ($validator->fails()) {
            return false;
        } else {
            return true;
        }
    }

    public function validateZip($zip) {
        if (preg_match('/^[0-9]{5}+$/', $zip) || preg_match('/^[0-9]{7}+$/', $zip)) {
            return true;
        } else {
            return false;
        }
    }

    public function validateDistributionCode($distributionCode) {
        return preg_match('/^[0-9]{9}+$/', $distributionCode);
    }

    public function getCityId($cityName) {
        $city = City::select(['id'])->where('name', $cityName)->first();

        if ( null == $city ) {
            return 0;
        } else {
            return $city->id;
        }
    }
}