<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewUserPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $passwordValue, $firstName, $lastName , $sitePath ; 

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($passwordValue, $firstName, $lastName , $sitePath)
    {
        $this->passwordValue = $passwordValue;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
		$this->sitePath = $sitePath;
      

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('ההרשמה למערכת שס הצליחה ')
                    ->view('emails/newUserPassword');
    }
}
