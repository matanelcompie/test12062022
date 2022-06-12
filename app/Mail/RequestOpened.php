<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Log;

class RequestOpened extends Mailable
{
    use Queueable, SerializesModels;

    public $requestKey, $topicName, $subTopicName, $teamName,$teamTitle,$teamPhoneNumber,$teamSignature;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($data)
    {
        $this->requestKey = $data['requestKey'];
        $this->topicName = $data['topicName'];
        $this->subTopicName = $data['subTopicName'];
        $this->teamName = $data['teamName'];
        $this->teamTitle = !$data['teamTitle'] || $data['teamTitle'] == '' ? "מפלגת שס" : $data['teamTitle'];
        $this->teamPhoneNumber = !$data['teamPhoneNumber'] || $data['teamPhoneNumber'] == '' ? "1-800-888-444" : $data['teamPhoneNumber'];
        $this->teamSignature = !$data['teamSignature'] ||  $data['teamSignature'] == '' ? 'הלשכה הארצית לפניות הציבור' : $data['teamSignature'];
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('פנייתך ל'.$this->teamTitle.', מספר פניה '.$this->requestKey)
                    ->view('emails/requestOpened');
    }
}
