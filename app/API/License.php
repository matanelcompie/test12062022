<?php

namespace App\API;

class License {

	const LICENSE_URL = 'http://109.226.9.107:35130';

	public static function getLicense() {
        $ch = curl_init(License::LICENSE_URL . '/license');
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = json_decode(curl_exec($ch));
        curl_close($ch);
        if ($result) return $result->data;
        else return false;
	}
}