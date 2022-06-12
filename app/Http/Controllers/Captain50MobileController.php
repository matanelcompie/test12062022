<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class Captain50MobileController extends Controller
{

    public function index(Request $request)
    {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Headers: *");
        header("Access-Control-Allow-Headers: X-Requested-With");
        echo json_encode(['status' => true]);
        die;
    }
}
