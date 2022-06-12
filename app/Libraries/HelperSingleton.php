<?php

namespace App\Libraries;

/**
 * Helper class for use as singleton
 */
class HelperSingleton {

    private $voterGroupsList = null;

    public function getVoterGroupsList() {
        return $this->voterGroupsList;
    }

    public function setVoterGroupsList($voterGroupsList) {
        $this->voterGroupsList = $voterGroupsList;
    }
}