<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class VoterBookRows extends Model {

    public $primaryKey = 'id';
    protected $table = 'voter_book_rows';

    public function scopeWithVoterBook($query) {
        $query->join('voter_books', 'voter_books.id', '=', 'voter_book_rows.voter_book_id');
    }
}