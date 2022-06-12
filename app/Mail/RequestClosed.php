<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class RequestClosed extends Mailable
{
    use Queueable, SerializesModels;

    public $requestKey, $topicName, $subTopicName, $teamName, $closingReason; 

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($requestKey, $topicName, $subTopicName, $teamName, $closingReason)
    {
        $this->requestKey = $requestKey;
        $this->topicName = $topicName;
        $this->subTopicName = $subTopicName;
        $this->teamName = $teamName;
        $this->closingReason = $closingReason;

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('נסגרה פניתך למפלגת ש"ס, פניה מספר: '.$this->requestKey)
                    ->view('emails/requestClosed');
    }
}
