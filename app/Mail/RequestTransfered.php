<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class RequestTransfered extends Mailable
{
    use Queueable, SerializesModels;

    public $requestKey, $topicName, $subTopicName, $fullName, $personalIdentity, $firstName, $LastName, $Address, $firstDesc; 

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($requestKey, $fullName, $topicName, $subTopicName, $personalIdentity, $firstName, $LastName, $Address, $firstDesc)
    {
        $this->requestKey = $requestKey;
        $this->topicName = $topicName;
        $this->subTopicName = $subTopicName;
        $this->fullName = $fullName; 
        $this->personalIdentity = $personalIdentity;
        $this->firstName = $firstName;
        $this->LastName = $LastName;
        $this->Address = $Address;        
        $this->firstDesc = $firstDesc;

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('הועברה לטיפולך פניה ממערכת הפניות של ש"ס, פניה מספר: '.$this->requestKey)
                    ->view('emails/requestTransfered');
    }
}
