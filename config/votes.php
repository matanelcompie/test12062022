<?php

return [
    'process_count' => env('EXTERNAL_VOTES_PROCESS_COUNT', 4),
    'external_votes' => [
        'elector' => [
            'username' => env('ELECTOR_VOTES_USER_NAME', ''),
            'password' => env('ELECTOR_VOTES_PASSWORD', ''),
        ],
        'bingo' => [
            'username' => env('BINGO_VOTES_USER_NAME', ''),
            'password' => env('BINGO_VOTES_PASSWORD', ''),
        ]
    ]
];