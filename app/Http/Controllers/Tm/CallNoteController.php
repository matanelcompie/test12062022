<?php

namespace App\Http\Controllers\Tm;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tm\CallNote;
use App\Libraries\Helper;


class CallNoteController extends Controller {

    private $errorMessageList = [
        'There is no reference key to delete element.',
        'There is no reference key to update element.',
        'There are missing data to update.',
        'submitted order is not valid.',
        'submitted keys are not valid.'
    ];
    /* CallNotes */

	/*
		Function that returns a list of all call notes
	*/
    public function getCallNotes() {
        $jsonOutput = app()->make("JsonOutput");
        $result = CallNote::where('deleted', 0)->get();
        $jsonOutput->setData($result);
    }

	/*
		Function that deletes call note by its key
	*/
    public function deleteCallNote(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");
        if($key) {
            CallNote::where('key', $key)->update(['deleted' => 1]);
            $jsonOutput->setData('');
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[0]);
        }
    }

	/*
		Function that update call note by its key and POST data
	*/
    public function updateCallNote(Request $request, $key) {
        $jsonOutput = app()->make("JsonOutput");

        if ($key) {
            $call_note = CallNote::where('key',$key)->first();
            $call_note->update([
                'call_id' => $request->input('call_id'),
                'note' => trim($request->input('note')),
                'support_status_id' => $request->input('support_status_id'),
                'need_a_ride' => $request->input('need_a_ride'),
                'need_a_ride_time' => $request->input('need_a_ride_time'),
                'call_me_later' => $request->input('call_me_later'),
                'call_me_later_time' => $request->input('call_me_later_time'),
                'email' => trim($request->input('email')),
                'home_phone_number' => trim($request->input('home_phone_number')),
                'cell_phone_number' => trim($request->input('cell_phone_number')),
                'another_phone_number' => trim($request->input('another_phone_number')),
                'city_id' => $request->input('city_id'),
                'street' => trim($request->input('street')),
                'house' => trim($request->input('house')),
                'house_entry' => trim($request->input('house_entry')),
                'flat' => trim($request->input('flat')),
                'zip' => trim($request->input('zip')),
                'distribution_area' => trim($request->input('distribution_area')),
            ]);
            $jsonOutput->setData($call_note);
        } else {
            $jsonOutput->setErrorMessage($this->errorMessageList[1]);
        }
    }

	/*
		Function that creates new call note by POST data
	*/
    public function addCallNote(Request $request) {
        $jsonOutput = app()->make("JsonOutput");

        $call_note = CallNote::create([
            'key' => Helper::getNewTableKey('call_notes', 10),
            'call_id' => $request->input('call_id'),
            'note' => trim($request->input('note')),
            'support_status_id' => $request->input('support_status_id'),
            'need_a_ride' => $request->input('need_a_ride'),
            'need_a_ride_time' => $request->input('need_a_ride_time'),
            'call_me_later' => $request->input('call_me_later'),
            'call_me_later_time' => $request->input('call_me_later_time'),
            'email' => trim($request->input('email')),
            'home_phone_number' => trim($request->input('home_phone_number')),
            'cell_phone_number' => trim($request->input('cell_phone_number')),
            'another_phone_number' => trim($request->input('another_phone_number')),
            'city_id' => $request->input('city_id'),
            'street' => trim($request->input('street')),
            'house' => trim($request->input('house')),
            'house_entry' => trim($request->input('house_entry')),
            'flat' => trim($request->input('flat')),
            'zip' => trim($request->input('zip')),
            'distribution_area' => trim($request->input('distribution_area')),
        ]);

        $jsonOutput->setData($call_note);
    }

}
