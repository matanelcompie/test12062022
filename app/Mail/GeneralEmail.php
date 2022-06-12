<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class GeneralEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $title, $body; 

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($title, $body){
        $this->title = $title;
        $this->body = $body;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build(){
        return $this->subject($this->title)->view('emails.generalEmail');
    }
}
