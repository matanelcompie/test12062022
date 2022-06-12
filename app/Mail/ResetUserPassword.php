<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ResetUserPassword extends Mailable
{
    use Queueable, SerializesModels;

    public $firstName, $lastName , $sitePath ; 

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct( $firstName, $lastName , $sitePath)
    {
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
        return $this->subject('איפוס סיסמא למערכת ש"ס')
                    ->view('emails/resetUserPassword');
    }
}
