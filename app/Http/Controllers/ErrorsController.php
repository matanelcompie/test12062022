<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Auth;

use App\Models\UiError;



/**
 * Class UploaderController
 * @package App\Http\Controllers
 *
 * This class handles the file uploads.
 */
class ErrorsController extends Controller {

    /**
     * Add ui error
     * 
     * @param Request $request
     * @return void
     */
    public function addError(Request $request) {
        $jsonOutput = app()->make( "JsonOutput" );

        $url = $request->input('url', null);
        $lineNumber = $request->input('line_number', null);
        $message = $request->input('message', null);

        if (!$url || !$lineNumber || !$message) {
            $jsonOutput->setErrorCode(config('errors.system.MISSING_PARAMS'));
            return;
        }

        $user = Auth::user();
        $userId = ($user)? $user->id : null;

        $route = $request->url();
        $uiType = 0;
        if (strpos($route, "cti") !== false) $uiType = 1;


        $uiError = new UiError;
        $uiError->user_id = $userId;
        $uiError->ui_type = $uiType;
        $uiError->url = $url;
        $uiError->line_number = $lineNumber;
        $uiError->message = $message;
        $uiError->save();

        $jsonOutput->setData('ok');
    }
}